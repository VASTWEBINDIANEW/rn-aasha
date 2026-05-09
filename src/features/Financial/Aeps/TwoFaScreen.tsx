import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, NativeModules, Alert, ToastAndroid, BackHandler } from 'react-native';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { useDeviceInfoHook } from '../../../utils/hooks/useDeviceInfoHook';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
// import { UsbSerialManager, Parity } from 'react-native-usb-serialport-for-android';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import axios from 'axios';
import DeviceInfo from 'react-native-device-info';
import DynamicButton from '../../drawer/button/DynamicButton';
import { AepsContext } from './context/AepsContext';
import {
  getDeviceInfo,
  isDriverFound,
  openFingerPrintScanner,
  openFaceAuth
} from 'react-native-rdservice-fingerprintscanner';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { colors } from '../../../utils/styles/theme';
import RNFS from 'react-native-fs';
import ShowLoader from '../../../components/ShowLoder';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import DeviceConnected from './checkDeviceConnected';
import SelectDevice from './DeviceSelect';
import { useLocationHook } from '../../../hooks/useLocationHook';
import CloseSvg from '../../drawer/svgimgcomponents/CloseSvg';
import { onReceiveNotification2 } from '../../../utils/NotificationService';
import { appendLog } from '../../../components/log_file_Saver';
import Entypo from 'react-native-vector-icons/Entypo';  // or another icon set like MaterialIcons
import { translate } from '../../../utils/languageUtils/I18n';
import { logToFirebase } from '../../../utils/firebaselog';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TwoFAVerify = ({ handle }) => {
  const [isFace, setIsFace] = useState(false)
  const [isLoading, setIsLoading] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const { userId, colorConfig, Loc_Data, activeAepsLine } = useSelector((state: RootState) => state.userInfo);
  const { latitude, longitude } = Loc_Data;
  const [is2fa, setis2fa] = useState(false);
  const { aadharNumber, setAadharNumber, mobileNumber, setMobileNumber, consumerName, setConsumerName, bankName,
    setBankName, setFingerprintData, scanFingerprint, fingerprintData } = useContext(AepsContext);
  const { getNetworkCarrier, getMobileDeviceId, getMobileIp } =
    useDeviceInfoHook();
  const { post } = useAxiosHook()

  const now = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const [bankid, setBankId] = useState('')

  const dayOfWeek = days[now.getDay()];
  const dayOfMonth = now.getDate();
  const month = months[now.getMonth()];
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const navigation = useNavigation<any>();

  const formattedDate = `${dayOfWeek} ${dayOfMonth} ${month} ${hours}:${minutes}:${seconds}`;

  const capture = async (rdServicePackage) => {
    setIsLoading(true)
    let pidOptions = '';
    switch (rdServicePackage) {
      case 'com.mantra.mfs110.rdservice':
        pidOptions = `<PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" pCount="0" pgCount="2" format="0" pidVer="2.0" timeout="10000"  pTimeout="20000" posh="UNKNOWN" env="P"  /> <CustOpts><Param name="mantrakey" value="" /></CustOpts> </PidOptions>`;
        break;
      case 'com.mantra.rdservice':
        pidOptions = `<PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" pCount="0" pgCount="2" format="0" pidVer="2.0" timeout="10000"  pTimeout="20000" posh="UNKNOWN" env="P"  /> <CustOpts><Param name="mantrakey" value="" /></CustOpts> </PidOptions>`;
        break;
      case 'com.acpl.registersdk_l1':
        pidOptions = `<PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" pCount="0" pgCount="2" format="0" pidVer="2.0"  timeout="10000"  otp="" pTimeout="20000" posh="UNKNOWN" env="P" />  <Demo/> <CustOpts><Param name="" value="" /></CustOpts> </PidOptions>`;
        console.log(pidOptions)

        break;
      case 'com.acpl.registersdk':
        pidOptions = `<PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" pCount="0" pgCount="2" format="0" pidVer="2.0"  timeout="10000"  otp="" pTimeout="20000" posh="UNKNOWN" env="P" />  <Demo/> <CustOpts><Param name="" value="" /></CustOpts> </PidOptions>`;
        break;
      case 'com.idemia.l1rdservice':
        pidOptions = `<PidOptions ver="1.0"><Opts env="P" fCount="1" fType="2" iCount="0" iType="" pCount="0" pType="" format="0" pidVer="2.0" timeout="20000"  posh="UNKNOWN" /><Demo></Demo><CustOpts><Param name="" value="" /></CustOpts></PidOptions>`;
        break;
      case 'com.scl.rdservice':
        //  pidOptions = '<PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" iType="" pCount="0" pType="" format="0" pidVer="2.0" timeout="20000"  posh="UNKNOWN" env="P" /> <Demo></Demo> <CustOpts><Param name="" value="" /></CustOpts> </PidOptions>';
        pidOptions = `<PidOptions ver="1.0"><Opts env="P" fCount="1" fType="2" iCount="0" iType="" pCount="0" pType="" format="0" pidVer="2.0" timeout="20000"  posh="UNKNOWN" /><Demo></Demo><CustOpts><Param name="" value="" /></CustOpts></PidOptions>`;
        break;
      default:
        console.error('Unsupported rdServicePackage');

        return;
    }

    // captureFinger(pidOptions)

    openFingerPrintScanner(rdServicePackage, pidOptions)
      .then(async (res) => {
        setIsLoading(true)
        // setisFacialTan(false);

        // 🔥 Full response console me
        console.log("Fingerprint Response:", res);

        // 🔥 Firebase me full response save
        // await logToFirebase("fingerprint_response", {
        //   rdServicePackage,
        //   pidOptions,
        //   response: res
        // });

        if (res.errorCode == 720) {
          setFingerprintData(720);
          setIsLoading(false);

        //  await logToFirebase("fingerprint_error_720", res);

        }
        else if (res.status === -1) {

          setFingerprintData(-1);
          setIsLoading(false);

          //await logToFirebase("fingerprint_status_minus_1", res);

        }
        else if (res.status === 1 || res.errorCode == 0) {

        //  await logToFirebase("fingerprint_success", res);

          OnPressEnq(res.piddataJsonString, res.piddataXML);

          console.log("Data Received Successfully");
        }

      })
      .catch(async (error) => {

        setFingerprintData(720);

        // 🔥 Error Firebase me
        // await logToFirebase("fingerprint_exception", {
        //   error: JSON.stringify(error),
        //   rdServicePackage,
        //   pidOptions
        // });

        Alert.alert('Please check if the device is connected.');
      });

  };
  // const OnPressEnq2 = async (fingerprintData) => {
  //   try {

  //     // Safe parse (face scanner kabhi string bhi bhej deta hai)
  //     const parsedData =
  //       typeof fingerprintData.pidDataJson === "string"
  //         ? JSON.parse(fingerprintData.pidDataJson)
  //         : fingerprintData.pidDataJson;

  //     const pidData = parsedData?.PidData;
  //     if (!pidData) {
  //       throw new Error("Invalid PID Data");
  //     }

  //     const DevInfo = pidData.DeviceInfo || {};
  //     const Resp = pidData.Resp || {};

  //     const cardnumberORUID = {
  //       adhaarNumber: aadharNumber,
  //       indicatorforUID: "0",
  //       nationalBankIdentificationNumber: bankid
  //     };

  //     // Serial number safe access (old ref maintain)
  //     const srNo =
  //       DevInfo?.additional_info?.Param?.[0]?.value ||
  //       DevInfo?.dc ||
  //       "";

  //     const captureResponse = {
  //       Devicesrno: srNo,
  //       PidDatatype: "X",

  //       // Data safe access
  //       Piddata: pidData?.Data?.content || "",

  //       ci: pidData?.Skey?.ci || "",
  //       dc: DevInfo?.dc || "",
  //       dpID: DevInfo?.dpId || "",

  //       errCode: Resp?.errCode || "0",

  //       // face device me errInfo alag aata hai
  //       errInfo: fingerprintData?.errInfo || Resp?.errInfo || "",

  //       fCount: Resp?.fCount || "1",
  //       fType: Resp?.fType || "2",

  //       hmac: pidData?.Hmac || "",

  //       // old logic maintain
  //       iCount: Resp?.fCount || "0",
  //       iType: "0",

  //       mc: DevInfo?.mc || "",
  //       mi: DevInfo?.mi || "",

  //       nmPoints: Resp?.nmPoints || "0",

  //       pCount: "0",
  //       pType: "0",

  //       qScore: Resp?.qScore || "0",

  //       rdsID: DevInfo?.rdsId || "",
  //       rdsVer: DevInfo?.rdsVer || "",

  //       sessionKey: pidData?.Skey?.content || ""
  //     };

  //     console.log("Face Payload >>>>", captureResponse);

  //     await BEnQ(captureResponse, cardnumberORUID, "", true);

  //   } catch (error) {
  //     console.log("OnPressEnq2 Error:", error);
  //     Alert.alert(
  //       "Error",
  //       "An error occurred while processing your request. Please try again."
  //     );
  //   }
  // };


  const OnPressEnq2 = async (fingerprintData) => {
    try {

      const parsedJson =
        typeof fingerprintData?.piddataJsonString === "string"
          ? JSON.parse(fingerprintData.piddataJsonString)
          : fingerprintData?.piddataJsonString;

      const pidData = parsedJson?.PidData;
      if (!pidData) throw new Error("Invalid PID Data");

      const DevInfo = pidData.DeviceInfo || {};
      const Resp = pidData.Resp || {};



      const cardnumberORUID = {
        adhaarNumber: aadharNumber,
        indicatorforUID: "0",
        nationalBankIdentificationNumber: bankid
      };

      const captureResponse = {

        Devicesrno:
          DevInfo?.additional_info?.Param?.[0]?.value ||
          DevInfo?.dc ||
          "",

        PidDatatype: "X",

        Piddata:
          typeof pidData.Data === "object"
            ? pidData.Data.content
            : pidData.Data || "",

        ci: pidData.Skey?.ci || "",

        dc: DevInfo.dc || "",
        dpID: DevInfo.dpId || "",

        errCode: Resp.errCode ?? "",
        errInfo: Resp.errInfo || "",

        fCount: Resp.fCount || "0",
        fType: Resp.fType || "0",

        hmac:
          typeof pidData.Hmac === "object"
            ? pidData.Hmac.content
            : pidData.Hmac || "",

        iCount: Resp.iCount || "0",
        iType: Resp.iType || "0",

        mc: DevInfo.mc || "",
        mi: DevInfo.mi || "",

        nmPoints: Resp.nmPoints || "0",

        pCount: Resp.pCount || "0",
        pType: Resp.pType || "0",

        qScore: Resp.qScore || "-1",

        rdsID: DevInfo.rdsId || "",
        rdsVer: DevInfo.rdsVer || "",

        sessionKey:
          typeof pidData.Skey === "object"
            ? pidData.Skey.content
            : pidData.Skey || ""
      };

      console.log(
        "Mapped Response for Face Auth:",
        JSON.stringify(captureResponse, null, 2)
      );

      console.log('====================================');
      console.log(captureResponse);
      console.log('====================================');
      console.log(cardnumberORUID);

      BEnQ(captureResponse, cardnumberORUID, "", true);

    } catch (error) {

      console.error("OnPressEnq2 Error:", error);
      Alert.alert("Error", "Biometric processing failed.");

    } finally {

   //   setIsLoading(false);

    }
  };
  const OnPressEnq = async (fingerprintDataString, pidDataXml) => {
    try {
      setIsLoading(true);

      // 1. Safe JSON Parse
      let parsedJson;
      try {
        parsedJson = typeof fingerprintDataString === "string"
          ? JSON.parse(fingerprintDataString)
          : fingerprintDataString;
      } catch (e) {
        throw new Error("Invalid fingerprint JSON format");
      }

      const pidData = parsedJson?.PidData;
      if (!pidData) throw new Error("Invalid PID Data structure from scanner");

      const DevInfo = pidData.DeviceInfo || {};
      const Resp = pidData.Resp || {};

      // 2. Hardware Error Check
      if (Resp.errCode !== "0") {
        throw new Error(Resp.errInfo || "Fingerprint capture failed");
      }

      // 3. Extract Serial Number
      const params = DevInfo.additional_info?.Param || [];
      const srNo = params.find(p => p.name?.toLowerCase() === "srno")?.value || "";

      // 4. Aadhaar + Bank Info (Check if variables exist)


      const cardnumberORUID = {
        adhaarNumber: aadharNumber,
        indicatorforUID: "0",
        nationalBankIdentificationNumber: bankid
      };

      // 5. Build Capture Payload
      const captureResponse = {
        Devicesrno: srNo,
        PidDatatype: "X",
        Piddata: pidData.Data?.content || "",
        ci: pidData.Skey?.ci || "",
        dc: DevInfo.dc || "",
        dpID: DevInfo.dpId || "",
        errCode: Resp.errCode || "0",
        errInfo: Resp.errInfo || "Success",
        fCount: Resp.fCount || "1",
        fType: Resp.fType || "2",
        hmac: pidData.Hmac || "", // Direct string fix
        iCount: Resp.iCount || "0",
        iType: "0",
        mc: DevInfo.mc || "",
        mi: DevInfo.mi || "",
        nmPoints: Resp.nmPoints || "0",
        pCount: Resp.pCount || "0",
        pType: "0",
        qScore: Resp.qScore || "0",
        rdsID: DevInfo.rdsId || "",
        rdsVer: DevInfo.rdsVer || "",
        sessionKey: pidData.Skey?.content || "" // Skey content fix
      };

      console.log("Payload Ready:", captureResponse);

      // 6. API Call
       BEnQ(captureResponse, cardnumberORUID, pidDataXml, false);

    } catch (error) {
      console.error("OnPressEnq Process Error:", error);
      Alert.alert("Authentication Failed", error.message);
    } finally {
     // setIsLoading(false);
    }
  };

  const saveJdata = async (data) => {
    try {
      await AsyncStorage.setItem("jdata", JSON.stringify(data));
      console.log("jdata saved successfully");
    } catch (error) {
      console.log("Failed to save jdata", error);
    }
  };
  const loadJdata = async () => {
    try {
      const stored = await AsyncStorage.getItem("jdata");
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log("Stored jdata:***********************************************************", parsed);  // 📢 Console me print yahi aayega
        return parsed;
      }
    } catch (error) {
      console.log("Error reading jdata", error);
    }
  };

  const BEnQ = useCallback(async (captureResponse1, cardnumberORUID1, pidDataX, isFace) => {
    try {
      setIsLoading(true);

      const Model = getMobileDeviceId();
      const address = 'vwi';

      const jdata = {
        capxml: pidDataX,
        captureResponse: captureResponse1 ?? "",
        cardnumberORUID: cardnumberORUID1 ?? "",
        languageCode: 'en',
        latitude: latitude ?? 0,
        longitude: longitude ?? 0,
        mobileNumber: '',
        merchantTranId: userId ?? "",
        merchantTransactionId: userId ?? "",
        paymentType: 'B',
        otpnum: '',
        requestRemarks: 'TN3000CA06532',
        subMerchantId: 'A2zsuvidhaa',
        timestamp: formattedDate ?? "",
        transactionType: 'M',
        name: '',
        Address: address,
        transactionAmount: '',
        ServideType: 'AEPS',
        isFacialTan: isFace
      };
      const headers = {
        'trnTimestamp': formattedDate ?? "",
        'deviceIMEI': Model ?? "",
        "Content-type": "application/json",
        "Accept": "application/json",
      };


      await saveJdata(jdata);

      const data = JSON.stringify(jdata);

      // ✅ Log request headers and body
      // await logToFile('Request Headers', headers);
      //  await logToFile('Request Body', jdata);

      const response = await post({
        url: activeAepsLine ? APP_URLS?.twofaNifi ?? "" : APP_URLS?.twofa ?? "",

        data: data,
        config: { headers },
      });

      // ✅ Log response
      //  await logToFile('API Response', response);
      // Alert.alert(
      //   '2FA Request Payload',
      //   JSON.stringify(jdata, null, 2),
      //   [{ text: 'OK' }]
      // );

      if (!response) {
        console.error("Invalid response from API.");
        setIsLoading(false);
        return;
      }

      setFingerprintData(720);
      setIsLoading(false);

      const isSuccess = response?.Status === true || response?.Status === 'true';
      setis2fa(isSuccess)
      let mockNotification = {};
      if (isSuccess) {
        mockNotification = {
          notification: {
            title: "TwoFa Status",
            body: "Your 2FA has been successfully completed!", // ✅ cleaner message
          },
        };

        Alert.alert(
          "Message:",
          `✅ Your 2FA has been successfully completed!\n\nDetails:\n${JSON.stringify(
            response.Message,
            null,
            2
          )}`,
          [
            {
              text: "OK",
              onPress: () => handle(), // close modal instead of navigation
            },
          ]
        );
      } else {
        mockNotification = {
          notification: {
            title: "TwoFa Status",
            body: "2FA failed. Please try again.", // ❌ failure message
          },
        };

        Alert.alert(
          "Message:",
          `❌ 2FA failed. Please try again.\n\nDetails:\n${JSON.stringify(
            response.Message,
            null,
            2
          )}`,
          [{ text: 'OK' }]

        );
      }

      onReceiveNotification2(mockNotification);

    } catch (error) {
      console.error('Error during balance enquiry:', error);
      //await logToFile('API Error', error.message || error);
      setIsLoading(false);
    }
  }, [latitude, longitude, formattedDate, userId, isFace, navigation]);



  const address = 'vwi'
  // const readSavedData = async () => {
  //   try {
  //     const pathBody = `${RNFS.DocumentDirectoryPath}/requestBody.json`;
  //     const pathHeaders = `${RNFS.DocumentDirectoryPath}/requestHeaders.json`;

  //     const savedBody = await RNFS.readFile(pathBody, 'utf8');
  //     const savedHeaders = await RNFS.readFile(pathHeaders, 'utf8');

  //     console.log('Saved Body:', JSON.parse(savedBody));
  //     console.log('Saved Headers:', JSON.parse(savedHeaders));
  //   } catch (error) {
  //     console.error('Error reading files:', error);
  //   }
  // };
  const read = async () => {
    const savedJData = await AsyncStorage.getItem('jdata');
    const savedFData = await AsyncStorage.getItem('fingerprintData');
    const savedHeaders = await AsyncStorage.getItem('headers');

    console.log(savedFData, '***************')
    console.log(savedJData)
    console.log(savedHeaders)

  }
  const handleSelection = (selectedOption) => {
    //read()
    if (deviceName === 'Device') {
      return;
    }
    const captureMapping = {
      'Mantra L0': 'com.mantra.rdservice',
      'Mantra L1': 'com.mantra.mfs110.rdservice',
      'Startek L0': 'com.acpl.registersdk',
      'Startek L1': 'com.acpl.registersdk_l1',
      'Morpho L0': 'com.scl.rdservice',
      'Morpho L1': 'com.idemia.l1rdservice',
      'Aadhaar Face RD': 'Aadhaar Face RD',
    };
    const selectedCapture = captureMapping[selectedOption];
    if (selectedCapture) {

      if (selectedOption === 'Aadhaar Face RD') {
        setIsFace(selectedOption === 'Aadhaar Face RD')
        openFace();
      } else {
        setIsFace(false)

        isDriverFound(selectedCapture)
          .then((res) => {
            capture(selectedCapture);
          })
          .catch((error) => {
            console.error('Error finding driver:', error);
            alert('Error: Could not find the selected driver.');
          });
      }
    } else {
      alert('Invalid option selected');
    }
  };

  const openFace = useCallback(() => {
    openFaceAuth(userId)
      .then(async (response) => {
        console.log('Face Auth Response:', JSON.stringify(response));

        if (response.errorCode === 892) {
          ToastAndroid.show('Error during face authentication 892', ToastAndroid.BOTTOM);
          return;
        }


        try {
          console.log('Calling OnPressEnq2...');
          OnPressEnq2(response);
          ToastAndroid.show('Scan', ToastAndroid.BOTTOM);

        } catch (err) {
          console.error('Error in OnPressEnq2:', err);
        }
      })
      .catch((error) => {
        console.error('Catch block error:', error);
        ToastAndroid.show('Error during face authentication', ToastAndroid.BOTTOM);
      });
  }, [userId, OnPressEnq2]);

  const getSavedResponse = async () => {
    try {
      const savedResponse = await AsyncStorage.getItem('faceAuthResponse');
      if (savedResponse !== null) {
        const parsedResponse = JSON.parse(savedResponse);
        console.log(savedResponse)
      } else {
        console.log('No response saved in AsyncStorage');
      }
    } catch (error) {
      console.error('Error retrieving data from AsyncStorage:', error);
    }
  };
  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', backHandler);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', backHandler);
    };
  }, []);
  const backHandler = () => {
    Alert.alert(
      null,
      "Do you really want to cancel ?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        {
          text: "OK",
          onPress: () => {
            navigation.navigate('Dashboard');

            //  sendResponse('User cancelled');
          }
        }
      ]
    );
    return true;
  };
  return (
    <View style={[styles.main, { borderColor: colorConfig.secondaryColor }]}>
      {/* <AppBarSecond/> */}


      <View style={styles.cutborder}>
        <TouchableOpacity
          onPress={() => {
            if (is2fa) {
              handle()
            }

          }
          }
          activeOpacity={0.7}
          style={[
            styles.closebuttoX,
            { backgroundColor: colorConfig.secondaryColor },
          ]}>
          <CloseSvg />
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.texttitalView,
          { backgroundColor: colorConfig.secondaryColor },
        ]}>
        <View
          style={[
            styles.cutout,
            { borderTopColor: colorConfig.secondaryColor },
          ]}
        />
        <TouchableOpacity onPress={() => {
          navigation.goBack();

        }}>
          <Entypo name="back" size={20} color={'#ffff'} style={{ left: wScale(10) }} />
        </TouchableOpacity>


        {Loc_Data['isGPS'] && <TouchableOpacity  >
          <Entypo name="location" size={wScale(30)} color={Loc_Data['isGPS'] ? '#ffff' : colorConfig.secondaryColor} style={{ left: wScale(-10) }} />
        </TouchableOpacity>
        }
      </View>

      <View style={styles.container}>


        <View style={styles.card}>
          <Text style={styles.title}>{translate("AePS 2FA")}</Text>
          <Text style={styles.title}>{deviceName}</Text>
          <Text style={styles.deviceConnectionText}>{translate(`Device Connection`)}</Text>
          <Text style={styles.infoText}>{translate("key_connect_1")}</Text>
          <Text style={styles.infoText}>{translate("key_dearcu_2")}</Text>
          {/* <Text style={styles.infoText}>3. Face authentication is disabled on the bank side for 2FA verification.</Text> */}
        </View>
        <Text style={styles.title}></Text>

        {deviceName && <DynamicButton
          title={'scan'}
          onPress={async () => {
            handleSelection(deviceName);

          }}
          styleoveride={undefined}
        />}


        {isLoading && <ShowLoader />}
        <SelectDevice setDeviceName={setDeviceName}
          isface2={true}
          device={deviceName}
          isface={true}
          opPress={() => {
            loadJdata();    // 👈 function call

            console.log(latitude, longitude)
            handleSelection(deviceName)
          }

          } pkg={undefined}
          onPressface={() => {
            loadJdata();
            setIsFace(true)
            handleSelection('Aadhaar Face RD')
          }}
          isProcees={true} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: hScale(50),
    marginHorizontal: wScale(10),
    borderWidth: 1,
    paddingBottom:hScale(50),
    marginTop: hScale(30)
  },
  container: {
    flex: 1,
    paddingHorizontal: wScale(15),
    paddingTop: hScale(0)
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: wScale(10),
    // marginVertical: hScale(20),
    elevation: 2,
  },
  title: {
    fontSize: wScale(20),
    fontWeight: 'bold',
    marginBottom: hScale(10),
    textAlign: 'center',
    color: colors.black75
  },
  deviceConnectionText: {
    fontSize: wScale(18),
    marginBottom: hScale(10),
    textAlign: 'center',
    color: colors.black75

  },
  infoText: {
    fontSize: wScale(16),
    marginBottom: hScale(14),
    textAlign: 'center',
    color: colors.black75

  },

  loadingIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -25 }],
  },
  texttital: {
    fontSize: wScale(18),
    fontWeight: 'bold',
    color: '#fff',
    width: 240,
    paddingLeft: wScale(10)
  },
  texttitalView: {
    width: wScale(150),
    height: hScale(40),
    borderTopLeftRadius: wScale(5),
    position: 'absolute',
    top: hScale(-1),
    left: wScale(-1),
    justifyContent: 'center',
    paddingBottom: hScale(3),
    borderBottomRightRadius: 0,
  },
  cutout: {
    borderTopWidth: hScale(40), // Height of the triangle
    borderRightWidth: wScale(33), // Width of the triangle
    borderBottomWidth: wScale(0), // Set to 0 to hide the bottom edge
    borderLeftWidth: wScale(3), // Width of the triangle
    width: '100%',
    height: hScale(40),
    borderRightColor: 'transparent', // Hide the right edge
    borderBottomColor: 'transparent', // Hide the bottom edge
    borderLeftColor: 'transparent', // Hide the left edge
    position: 'absolute',
    right: wScale(-50),
    zIndex: wScale(0),
    top: wScale(0),
  },
  closebuttoX: {
    borderRadius: wScale(24),
    paddingVertical: hScale(5),
    alignItems: 'center',
    height: wScale(48),
    width: wScale(48),
    justifyContent: 'center',
    elevation: 5,
  },
  cutborder: {
    paddingLeft: wScale(2),
    position: 'absolute',
    right: wScale(-12),
    top: hScale(-12),
    borderRadius: wScale(24),
    paddingRight: wScale(3.2),
  },
});

export default TwoFAVerify;