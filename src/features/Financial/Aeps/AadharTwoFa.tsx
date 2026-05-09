import { translate } from "../../../utils/languageUtils/I18n";
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet, NativeModules, Alert, ToastAndroid } from 'react-native';
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
import { captureFinger, getDeviceInfo, isDriverFound, openFingerPrintScanner } from 'react-native-rdservice-fingerprintscanner';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { colors } from '../../../utils/styles/theme';
import RNFS from 'react-native-fs';
import ShowLoader from '../../../components/ShowLoder';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import DeviceConnected from './checkDeviceConnected';
import SelectDevice from './DeviceSelect';
import { useRdDeviceConnectionHook } from '../../../hooks/useRdDeviceConnectionHook';
import { useLocationHook } from '../../../hooks/useLocationHook';

const TwoFAVerifyAadhar = () => {
  const { isDeviceConnected } = useRdDeviceConnectionHook();
  const { activeAepsLine } = useSelector((state: RootState) => state.userInfo);

  const [isLoading, setIsLoading] = useState(false);
  const [deviceName, setDeviceName] = useState('Device');
  const { userId, Loc_Data } = useSelector((state: RootState) => state.userInfo);
  const { latitude, longitude } = Loc_Data;
  const [usbSerial, setUsbSerial] = useState(null);
  const { aadharNumber, setAadharNumber, mobileNumber, setMobileNumber, consumerName, setConsumerName, bankName,
    setBankName, setFingerprintData, scanFingerprint, fingerprintData } = useContext(AepsContext);
  const { getNetworkCarrier, getMobileDeviceId, getMobileIp } =
    useDeviceInfoHook();
  const { get, post } = useAxiosHook()
  useEffect(() => {

    if (fingerprintData == 720) {
      if (fingerprintData === 720) {
        return;
      } else if (fingerprintData["PidData"].Resp.errCode === 0) {
        OnPressEnq(fingerprintData);
      }
    }
  }, []);
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
    openFingerPrintScanner(rdServicePackage, pidOptions)
      .then((res) => {
        if (res.errorCode === 720) {
          setFingerprintData(720);
          console.log('setFingerprintData', res.errInfo, res.message);
        } else if (res.status === -1) {
          setFingerprintData(-1);
        } else if (res.errorCode === 0) {
          // setFingerprintData(res.pidDataJson);

          OnPressEnq(res.pidDataJson);
        }
      })
      .catch((e) => {
        setFingerprintData(720);

        Alert.alert('Please check if the device is connected.');
      });
  };
  const OnPressEnq = async (fingerprintData) => {
    const pidData = fingerprintData.PidData;
    const DevInfo = pidData.DeviceInfo;
    const Resp = pidData.Resp;


    const cardnumberORUID = {
      adhaarNumber: aadharNumber,
      indicatorforUID: "0",
      nationalBankIdentificationNumber: bankid
    };

    const captureResponse = {
      Devicesrno: DevInfo.additional_info.Param[0].value,
      PidDatatype: "X",
      Piddata: pidData.Data.content,
      ci: pidData.Skey.ci,
      dc: DevInfo.dc,
      dpID: DevInfo.dpId,
      errCode: Resp.errCode,
      errInfo: Resp.errInfo,
      fCount: Resp.fCount,
      fType: Resp.fType,
      hmac: pidData.Hmac,
      iCount: Resp.fCount,
      iType: "0",
      mc: DevInfo.mc,
      mi: DevInfo.mi,
      nmPoints: Resp.nmPoints,
      pCount: "0",
      pType: "0",
      qScore: Resp.qScore,
      rdsID: DevInfo.rdsId,
      rdsVer: DevInfo.rdsVer,
      sessionKey: pidData.Skey.content
    };
    try {

      BEnQ(captureResponse, cardnumberORUID);

    } catch (error) {
      Alert.alert('Error', 'key_anerroro_9');
    } finally {
      setIsLoading(true);
    }
  };


  const BEnQ = useCallback(async (captureResponse1, cardnumberORUID1) => {
    setIsLoading(true); // Start loading when the request is triggered
    try {
      const Model = await getMobileDeviceId(); // Assuming this function gets the device ID
      const address = 'vwi'; // Static address string

      const jdata = {
        captureResponse: captureResponse1 ?? "",
        cardnumberORUID: cardnumberORUID1 ?? "",
        languageCode: 'en',
        latitude: latitude ?? 0,
        longitude: longitude ?? 0,
        mobileNumber: '',
        merchantTranId: userId ?? "", // Fallback if userId is undefined
        merchantTransactionId: userId ?? "", // Same as above
        paymentType: 'B',
        otpnum: '', // Empty if no OTP
        requestRemarks: 'TN3000CA06532', // Static remark
        subMerchantId: 'A2zsuvidhaa', // Static subMerchantId
        timestamp: formattedDate ?? "", // Ensure formattedDate is not null
        transactionType: 'M',
        name: '',
        Address: address,
        transactionAmount: '', // Assuming empty string for now
        ServideType: 'AP', // Assuming 'type' is always available
      };

      // Check if Model (IMEI) exists
      if (!Model) {
        console.error("Device Model (IMEI) is missing.");
        setIsLoading(false);
        return;
      }

      // Prepare the headers for the request
      const headers = {
        'trnTimestamp': formattedDate ?? "", // Ensure timestamp is not null
        'deviceIMEI': Model ?? "", // Ensure IMEI is available
        "Content-type": "application/json",
        "Accept": "application/json",
      };

      console.log('headers', headers);
      const data = JSON.stringify(jdata);
      console.log('Request Data:', data);

      // Make the API call
      const response = await post({
        url: activeAepsLine ? APP_URLS?.twofaNifi ?? "" : APP_URLS?.twofa ?? "",
        data: data,
        config: {
          headers,
        },
      });

      // Check if the response is valid
      if (!response) {
        console.error("Invalid response from API.");
        setIsLoading(false);
        return;
      }

      // Set fingerprint data
      setFingerprintData(720);
      setIsLoading(false);

      // Check if the transaction was successful
      const isSuccess = response?.Status === true || response?.Status === 'true';

      if (isSuccess) {
        Alert.alert(
          'Message:',
          `\nSuccess\n${response?.Message ?? "No message provided"}`,
          [
            { text: 'OK', onPress: () => navigation?.navigate("AepsTabScreen") },
          ]
        );
      } else {
        Alert.alert(`Message:`, `\nFailed\n${response?.Message ?? "No message provided"}`);
      }
    } catch (error) {
      console.error('Error during balance enquiry:', error);
      setIsLoading(false); // Stop loading in case of error
    }
  }, [
    latitude,
    longitude,
    userId,
    formattedDate,
    navigation
  ]);


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
  const handleSelection = (selectedOption) => {
    if (deviceName === 'Device') {
      ToastAndroid.showWithGravity('Please Select Your Device', ToastAndroid.SHORT, ToastAndroid.BOTTOM);

      return;
    }
    console.log(selectedOption)
    const captureMapping = {
      'Mantra L0': 'com.mantra.rdservice',
      'Mantra L1': 'com.mantra.mfs110.rdservice',
      'Startek L0': 'com.acpl.registersdk',
      'Startek L1': 'com.acpl.registersdk_l1',
      'Morpho L0': 'com.scl.rdservice',
      'Morpho L1': 'com.idemia.l1rdservice',
    };

    console.log(captureMapping[selectedOption])
    if (captureMapping[selectedOption]) {
      isDriverFound(captureMapping[selectedOption])
        .then((res) => {
          console.log(res);
          if (isDeviceConnected) {
            console.log(isDeviceConnected, '#####');
            capture(captureMapping[selectedOption]);
          } else {
            ToastAndroid.showWithGravityAndOffset(
              res.message + '  But Device Not Connected',
              ToastAndroid.LONG,
              ToastAndroid.TOP,
              0,
              1000
            );
          }

          //  alert(`Capture Mapping: ${captureMapping[selectedOption]}\nResponse: ${JSON.stringify(res)}`);

        })
        .catch((error) => {
          console.error('Error finding driver:', error);
          alert('key_errorcou_39');
        });
    } else {
      alert('Invalid option selected');
    }
  };

  return (
    <View style={styles.main}>
      <AppBarSecond title={'Two-Factor Authentication'} />

      <View style={styles.container}>
        <SelectDevice setDeviceName={setDeviceName} device={'Device'} opPress={() => handleSelection(deviceName)} />

        <View style={styles.card}>
          <Text style={styles.title}>{translate("Aadhar_Pay")}</Text>
          <Text style={styles.deviceConnectionText}>{`Device Connection`}</Text>
          <Text style={styles.infoText}>{translate("1_Connect_your_mobile_device_to_the_fingerprint_scanner")}</Text>
          <Text style={styles.infoText}>{translate("2_Click_the_Scan_button_to_complete_your_2FA_verification")}</Text>

        </View>

        <DynamicButton
          title={'scan'}
          onPress={() => {
            // BEnQ('','')

            handleSelection(deviceName);
          }}
          styleoveride={undefined}
        />

        {isLoading && <ShowLoader />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: wScale(15),
  },

  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: wScale(10),
    elevation: 2,
    marginBottom: hScale(20)
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
});

export default TwoFAVerifyAadhar;
