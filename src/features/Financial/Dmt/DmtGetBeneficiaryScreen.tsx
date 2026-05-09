import React, { useCallback, useEffect, useState } from 'react';
import {
  View, Text, TextInput, Button, ActivityIndicator, StyleSheet, ToastAndroid, TouchableOpacity, Alert, ScrollView, Keyboard,

} from 'react-native';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { translate } from '../../../utils/languageUtils/I18n';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import { useFocusEffect } from '@react-navigation/native';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import DynamicButton from '../../drawer/button/DynamicButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import LinearGradient from 'react-native-linear-gradient';
import { FlashList } from '@shopify/flash-list';
import { SvgXml } from 'react-native-svg';
import OTPModal from '../../../components/OTPModal';
import { captureFinger, getDeviceInfo, isDriverFound, openFingerPrintScanner } from 'react-native-rdservice-fingerprintscanner';
import ShowLoader from '../../../components/ShowLoder';
import SelectDevice from '../Aeps/DeviceSelect';
import { colors } from '../../../utils/styles/theme';
import { useRdDeviceConnectionHook } from '../../../hooks/useRdDeviceConnectionHook';
import { BottomSheet } from '@rneui/themed';
import DmtAddNewBenificiaryScreen from './DmtAddNewBeneficiarycreen';
import { useLocationHook } from '../../../hooks/useLocationHook';
import { onReceiveNotification2 } from '../../../utils/NotificationService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GetBenifiaryScreenDmt = ({ route }) => {
  //const {isDeviceConnected} = useRdDeviceConnectionHook();

  const { colorConfig, Loc_Data } = useSelector((state: RootState) => state.userInfo);
  const EditIcon = ` 

 <?xml version="1.0" encoding="UTF-8"?>
<svg version="1.1" viewBox="0 0 2048 2048" width="1280" fill="#fff" height="1280" xmlns="http://www.w3.org/2000/svg">
<path transform="translate(674,170)" d="m0 0h18l15 3 16 7 14 10 13 13 9 14 4 8 4 13 1 5v26l-4 15-8 16-9 12-7 8-7 6-184 184 1159 1 20 2 16 5 13 7 10 8 7 7 9 14 5 11 4 18v28l-3 14-5 13-6 11-11 13-14 10-14 6-17 4-9 1h-1164l7 8 188 188 11 14 9 17 4 16v25l-4 15-8 16-9 13-9 9-14 10-13 6-11 3-7 1h-23l-14-3-16-8-11-8-358-358-6-10-7-15-2-7-1-8v-18l3-16 4-9 8-16 9-9 1-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2l2-4h2l2-4h2l2-4h2l2-4h2l2-4h2l2-4h2v-2l8-7 14-10 16-7z"/>
<path transform="translate(1360,1023)" d="m0 0h10l15 2 14 5 12 7 10 8 10 9 339 339v2h2l8 10 4 9 6 20 2 8v25l-3 10-9 19-9 11-349 349-12 9-11 6-15 5-12 2h-14l-17-3-12-5-12-7-12-11-9-10-9-15-6-16-2-14v-9l2-14 4-13 5-10 7-11 7-7 7-8 159-159h2l2-4 23-23h2v-2l-1168-1-14-2-15-5-14-8-13-12-7-10-8-16-4-17-1-9v-12l2-16 5-16 7-13 8-10 7-7 14-9 11-5 18-4h994l172-1 6 1-2-4-198-198-9-13-7-15-3-12-1-8v-11l3-16 4-12 8-14 7-9 11-11 15-10 15-6 9-2z"/>
</svg>
`;
  const [aadharNumber, setAadharNumber] = useState('');
  //  const  {isDeviceConnected} =useRdDeviceConnectionHook();
  const [isR, setIsR] = useState(false);
  const [sendernum, setSendernum] = useState('');
  const [onTap, setOnTap] = useState(false);
  const [onTap1, setOnTap1] = useState(false);
  const [nxtbtn, setNxtbtn] = useState(false);
  const [banklist, setBanklist] = useState([]);
  const [fingerprintData, setFingerprintData] = useState('');
  const [beneficiaryData, setBeneficiaryData] = useState([]);
  const [remid, setRemid] = useState('');
  const { post, get } = useAxiosHook();
  const [isLoading, setisLoading] = useState(true);
  const navigation = useNavigation<any>();
  const [nodata, setnodata] = useState(false);
  const [accHolder, setAccHolder] = useState('')
  const [bankname, setBankName] = useState('')
  const [ACCno, setAccNo] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [showOtpView, setShowOtpView] = useState(false);
  const [mobileOtp, setMobileOtp] = useState('');
  const [editable, setEditable] = useState(false);

  const [kyc, setkyc] = useState(false);
  const Name = route?.params?.Name || 'VASTWEB';
  const [customerDet, setCustomer] = useState([]);
  const [remitter, setremitter] = useState(null);
  const [dmttype, setDmttype] = useState('');
  const [isTXNP, setTXNP] = useState(false);
  const [showloader, setIsShowloader] = useState(false);
  const [isTXNP1, setTXNP1] = useState('');
  const [addinfo, setAddInfo] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  useEffect(() => {
    getGenUniqueId();
    console.log(Name);
    setDmttype('VASTWEB');
    // console.log(isDeviceConnected);
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // setBanklist([])
    }, [])
  );


  const a2z = async (res, no) => {


    if (res.RESULT === '0') {
      const add = res.ADDINFO
      if (add.statuscode === 'RNF') {
        Alert.alert(
          add.status,
          "",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel",
            },
            {
              text: "Register",
              onPress: () => navigation.navigate("NumberRegisterScreen", { No: no, Name: dmttype, remid: remid })
              ,
            },
          ],
          { cancelable: false }
        );
      } else if (add.statuscode === 'TXN') {

        console.log()
        const beneficiary = add?.data?.beneficiary || [];
        const remid = add?.data?.remitter?.id || '';
        setRemid(remid);

        console.log('remitter', remid);
        console.log('remitter', add?.data?.remitter);

        await setBanklist(beneficiary);
        console.log(beneficiary);

        if (beneficiary.length === 0) {
          setisLoading(false);
          setnodata(true);
        } else {
          setnodata(false);
        }
      }



    }
  }

  const verifyEkycOtp = async () => {


    console.log(customerDet);
    const stateResp = customerDet.stateResp === undefined ? customerDet?.stateresp : customerDet?.stateResp;
    const ekyc_id = customerDet?.ekyc_id === undefined ? customerDet?.kyc_id : customerDet?.ekyc_id;


    const res = await post({ url: `MoneyDMT/api/Money/KYCEnterOTP?sender_number=${sendernum}&stateresp=${stateResp}&kyc_id=${ekyc_id}&Otp=${mobileOtp}` });
    console.log(`MoneyDMT/api/Money/KYCEnterOTP?sender_number=${sendernum}&stateresp=${stateResp}&kyc_id=${ekyc_id}&Otp=${mobileOtp}`)
    console.log(`MoneyDMT/api/Money/KYCEnterOTP?sender_number=${sendernum}&stateresp=${stateResp}&kyc_id=${ekyc_id}&Otp=${mobileOtp}`)
    console.log(res);
    if (res?.RESULT === '0') {

      if (res.ADDINFO.status) {
        ToastAndroid.showWithGravity(
          res.ADDINFO.message || 'Successfully verified',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
        );


        const mockNotification = {
          notification: {
            title: '',
            body: res.ADDINFO.message || 'Successfully verified',

          },
        };

        // Call the function
        onReceiveNotification2(mockNotification);
        navigation.navigate("DmtAddNewBenificiaryScreen", { no: sendernum, remid: remid, Name: dmttype });
      }
      else {
        ToastAndroid.showWithGravity(
          res.ADDINFO.message,
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
        );
        // {
        //   "status": true,
        //   "response_code": 1,
        //   "message": "Remitter Successfully Registered",
        //   "data": {
        //     "mobile": "8888899999",
        //     "limit": 25000
        //   }
        // }
      }
    }
    else {
      ToastAndroid.showWithGravity(
        'Something went wrong. Please try Again',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );

    }
    setIsload(false);

  }
  const { latitude, longitude } = Loc_Data;
  const start = () => {
    getDeviceInfo()
      .then(async (res) => {
        const deviceInfoString = JSON.stringify(res, null, 2);
        const isReady = res.rdServiceInfoJson.RDService.status;
        const rdServicePackage = res.rdServicePackage;
        // await post({ url: 'AEPS/api/Aeps/ErrorMessage', data: { Message: JSON.stringify(res) } });




        if (isReady === 'READY') {


          capture(rdServicePackage);


          console.log('Device is ready:', isReady);
        } else {



          Alert.alert(
            'Device Status',
            isReady === 'NOTREADY'
              ? 'Device is not ready. key_errorwhil_37.'
              : 'Device is ready.',
            [
              { text: 'OK', onPress: () => console.log('OK Pressed') },
            ],
            { cancelable: false }
          );
          console.log('Device is', isReady === 'NOTREADY' ? 'not ready' : 'ready');

          setFingerprintData('');
        }

        // const path = `${RNFS.DownloadDirectoryPath}/deviceInfo-today-${rdServicePackage}.json`;

        // RNFS.writeFile(path, deviceInfoString, 'utf8')
        //   .then(() => {
        //     console.log('JSON saved to Download directory');
        //   })
        //   .catch((error) => {
        //     console.error('Error writing file:', error);
        //   });
      })
      .catch(async (error) => {
        // await post({ url: 'AEPS/api/Aeps/ErrorMessage', data: { Message: JSON.stringify({
        //   message: error?.message,
        //   line: error?.line,
        //   column: error?.column
        // }) } });
        Alert.alert(
          'Error',
          'key_errorwhil_37'
        );
        // console.error('Error while fetching device info:', error);
      });
  };
  const capture = (rdServicePackage) => {
    let pidOptions = '';

    switch (rdServicePackage) {
      case 'com.mantra.mfs110.rdservice':
        pidOptions = `<PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" pCount="0" pgCount="2" format="0" pidVer="2.0" timeout="10000" wadh="18f4CEiXeXcfGXvgWA/blxD+w2pw7hfQPY45JMytkPw=" pTimeout="20000" posh="UNKNOWN" env="P"  /> <CustOpts><Param name="mantrakey" value="" /></CustOpts> </PidOptions>`;
        break;
      case 'com.mantra.rdservice':
        pidOptions = `<PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" pCount="0" pgCount="2" format="0" pidVer="2.0" timeout="10000" wadh="18f4CEiXeXcfGXvgWA/blxD+w2pw7hfQPY45JMytkPw=" pTimeout="20000" posh="UNKNOWN" env="P"  /> <CustOpts><Param name="mantrakey" value="" /></CustOpts> </PidOptions>`;
        break;
      case 'com.acpl.registersdk_l1':
        pidOptions = `<PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" pCount="0" pgCount="2" format="0" pidVer="2.0" wadh="18f4CEiXeXcfGXvgWA/blxD+w2pw7hfQPY45JMytkPw=" timeout="10000"  otp="" pTimeout="20000" posh="UNKNOWN" env="P" />  <Demo/> <CustOpts><Param name="" value="" /></CustOpts> </PidOptions>`;
        break;
      case 'com.acpl.registersdk':
        pidOptions = `<PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" pCount="0" pgCount="2" format="0" pidVer="2.0" wadh="18f4CEiXeXcfGXvgWA/blxD+w2pw7hfQPY45JMytkPw=" timeout="10000"  otp="" pTimeout="20000" posh="UNKNOWN" env="P" />  <Demo/> <CustOpts><Param name="" value="" /></CustOpts> </PidOptions>`;
        break;
      case 'com.idemia.l1rdservice':
        pidOptions = `<PidOptions ver="1.0"><Opts env="P" fCount="1" fType="2" iCount="0" iType="" pCount="0" pType="" format="0" pidVer="2.0" timeout="20000" wadh="18f4CEiXeXcfGXvgWA/blxD+w2pw7hfQPY45JMytkPw=" posh="UNKNOWN" /><Demo></Demo><CustOpts><Param name="" value="" /></CustOpts></PidOptions>`;
        break;
      case 'com.scl.rdservice':
        //  pidOptions = '<PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" iType="" pCount="0" pType="" format="0" pidVer="2.0" timeout="20000"  posh="UNKNOWN" env="P" /> <Demo></Demo> <CustOpts><Param name="" value="" /></CustOpts> </PidOptions>';
        pidOptions = `<PidOptions ver="1.0"><Opts env="P" fCount="1" fType="2" iCount="0" iType="" pCount="0" pType="" format="0" pidVer="2.0" timeout="20000" wadh="18f4CEiXeXcfGXvgWA/blxD+w2pw7hfQPY45JMytkPw=" posh="UNKNOWN" /><Demo></Demo><CustOpts><Param name="" value="" /></CustOpts></PidOptions>`;
        break;
      default:
        console.error('Unsupported rdServicePackage');
        return;
    }

    // Add necessary dependencies
    handleFingerprintScanner(rdServicePackage, pidOptions)
  };
  const handleFingerprintScanner = useCallback(async (rdServicePackage, pidOptions) => {
    try {
      const res = await openFingerPrintScanner(rdServicePackage, pidOptions);
      console.log(res, 'AEPS***');

      if (res.message === 'Device Driver not found') {
        ToastAndroid.showWithGravity(
          res.message,
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
        );
        return;
      }

      const deviceInfoString = JSON.stringify(res, null, 2);

      if (res.errorCode === 0) {
        setIsShowloader(true);

        const data = {
          sender_number: sendernum, // Ensure sendernum is defined
          latitude: latitude, // Ensure latitude is defined
          longitude: longitude, // Ensure longitude is defined
          aadharcard: aadharNumber, // Ensure aadharNumber is defined
          pid: res.pidDataXML,
        };

        try {
          const response = await post({ url: 'MoneyDMT/api/Money/EKYC_Register', data });
          setIsShowloader(false);

          if (response) {
            const add = response.ADDINFO;

            if (add) {
              if (response.RESULT === '0') {
                if (add.message === 'Kyc completed and OTP has been sent to remitter mobile number.') {
                  setShowOtpView(true);
                  setCustomer(add);
                  const mockNotification = {
                    notification: {
                      title: '',
                      body: add.message,
                    },
                  };

                  // Call the function
                  onReceiveNotification2(mockNotification);

                } else {
                  checksendernumber(sendernum); // Ensure checksendernumber is defined
                  Alert.alert('', `Message: ${add.message}\n`, [{ text: 'OK' }]);
                }
              }


            } else {
              console.error('ADDINFO is missing in the response');
              Alert.alert('Error', 'Failed to fetch KYC details. Please try again later.');
            }
          } else {
            console.error('No response received from the server');
            Alert.alert('Error', 'No response received from the server');
          }
        } catch (error) {
          console.error('Error while sending request:', error);
          Alert.alert('Error', 'An error occurred while processing your request. Please try again later.');
        }
      }
    } catch (error) {
      console.error('Fingerprint scanner error:', error);
      setFingerprintData('');
      Alert.alert('Please check if the device is connected.');
    }
  }, [sendernum, latitude, longitude, aadharNumber]);
  const [deviceName, setDeviceName] = useState('');


  const handleSelection = (selectedOption) => {

    if (deviceName === 'Device') {
      ToastAndroid.showWithGravity('Please Select Your Device', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
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

    console.log(captureMapping[selectedOption])
    if (captureMapping[selectedOption]) {
      isDriverFound(captureMapping[selectedOption])
        .then((res) => {
          capture(captureMapping[selectedOption]);


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

  const saveJsonData = async (key, data) => {
    try {
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonData);
      console.log('Data saved successfully!');
    } catch (error) {
      console.error('Error saving data', error);
    }
  };

  const getJsonData = async (key) => {
    try {
      const jsonData = await AsyncStorage.getItem(key);


      console.log(jsonData);

      if (jsonData !== null) {
        const parsedData = JSON.parse(jsonData);
        // console.log('Retrieved data:', parsedData);
        return parsedData;
      } else {
        console.log('No data found for key:', key);
        return null;
      }
    } catch (error) {
      console.error('Error retrieving data', error);
    }
  };


  const checkRadiant = (res, no) => {
    console.log(res.ADDINFO,);
    const ADDINFO = res?.ADDINFO;
    setisLoading(false);
    setCustomer(ADDINFO);
    setremitter(ADDINFO?.data?.remitter || '')
    const remid = ADDINFO?.data?.remitter?.id || '';
    setRemid(remid);
    if (res?.RESULT === '0') {
      const benes = ADDINFO.data.beneficiary;
      setTXNP1(ADDINFO.statuscode);

      if (ADDINFO.statuscode === 'TXN') {
        setBanklist(benes);

      } else if (ADDINFO.statuscode === 'TXNP') {
        setTXNP(ADDINFO.statuscode === 'TXNP');
        setBanklist([]);
      }

      if (benes.length === 0) {
        setIsVisible2(benes.length === 0);

        setnodata(true);
      } else {
        setnodata(false);
      }


    } else if (ADDINFO.statuscode === 'ERR') {
      ToastAndroid.showWithGravity(
        ADDINFO.status,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else {
      if (ADDINFO.statuscode === 'TXNP') {

        setTXNP(ADDINFO.statuscode === 'TXNP');

        //start()
      }
      else if (ADDINFO.statuscode === 'OTP') {
        setShowOtpView(true)
      }


      //   Alert.alert(
      //     res.ADDINFO || "User does not exist",
      //     "",
      //     [
      //       {
      //         text: "Cancel",
      //         onPress: () => console.log("Cancel Pressed"),
      //         style: "cancel",
      //       },
      //       {
      //         text: "Register",
      //         onPress: () => navigation.navigate("NumberRegisterScreen", { Name: Name, No: no })
      //         ,
      //       },
      //     ],
      //     { cancelable: false }
      //   );


    }
  }




  const [isload, setIsload] = useState(false)


  const checksendernumber = useCallback(async (number) => {
    setIsload(true);
    setBanklist([]);
    setisLoading(true);
    console.log(dmttype);

    try {
      const url = `MoneyDMT/api/Money/GetBeneficiaryList?sender_number=${number}&latitude=${latitude}&longitude=${longitude}`;
      console.log(url, 'Request URL');

      const res = await get({ url });
      console.log(res);

      setOnTap1(false);
      checkRadiant(res, number); // Ensure checkRadiant is defined

      setisLoading(false);
      setIsload(false);
    } catch (error) {
      setIsload(false);
      setisLoading(false);
      console.error('Error:', error);
    }
  }, [latitude, longitude]); // Add necessary dependencies


  const [unqid, setUnqiD] = useState('');
  const getGenUniqueId = async () => {
    try {

      //  const dmt2 = await get({ url: 'Retailer/api/data/DMTStatusCheck1' });

      const url = `${APP_URLS.getGenIMPSUniqueId}`
      //  console.log(dmt2,'111111111111111111111111111111111');
      const res = await get({ url: url });
      setUnqiD(res['Message']);
      setisLoading(false);

      //  setDmttype(dmt2.Name1);
      if (res['Response'] == 'Failed') {
        ToastAndroid.showWithGravity(
          res['Message'],
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
        )
      } else {
        ToastAndroid.showWithGravity(
          res['Response'],
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
        )
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleNextButtonPress = () => {
    if (onTap) {
      setOnTap1(true);
      checksendernumber(sendernum);
      setOnTap1(false);
    }
  };
  async function adhar_Validation(adharnumber) {
    try {
      const response = await get({ url: `${APP_URLS.aadharValidation}${adharnumber}` })
      console.log(response);
      if (response['status'] === true) {
        // setIsValid(true);
      } else {
        //  setIsValid(false);
        ToastAndroid.showWithGravity(
          `Please Enter Valid Aadhar number`,
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
        );

      }

    } catch (error) {

    }

  }
  async function getUserNamefunction(MoNumber) {
    console.log(MoNumber)
    try {
      const response = await get({ url: `${APP_URLS.aepsNameinfo}${MoNumber}` })
      console.log(response);
      // setAutofcs(true);
      // setConsumerName(response.RESULT);
    } catch (error) {
      console.error('Error:', error);
    }
  }
  const handleImpsPress2 = async (item) => {
    console.log('IMPS pressed for:', item);
    const bankname = item['bankname'];
    const ACCno = item['AccountNumber'];
    const accHolder = item['fname'];
    const ifsc = item['ifsc'];
    await setIfsc(item['ifsc']);
    await setAccHolder(item['fname']);
    await setAccNo(item['AccountNumber']);
    await setBankName(item['bankname']);
    const BeneficiaryMobile = item['BeneficiaryMobile'];
    const remid = customerDet.id;
    navigation.navigate("toBankScreen", {
      BeneficiaryMobile, remid, bankname, ACCno, accHolder, ifsc, mode: 'IMPS', unqid, kyc
    },);
  };
  const handleImpsPress = async (item) => {
    console.log('IMPS pressed for:', item);
    const bankname = item['bank'];
    const ACCno = item['account'];
    const accHolder = item['name'];
    const ifsc = item['ifsc'];
    const id = item['id']
    await setIfsc(item['ifsc']);
    await setAccHolder(item['name']);
    await setAccNo(item['account']);
    await setBankName(item['bank'])
    console.log({ bankname, ACCno, accHolder, ifsc, mode: 'IMPS', unqid, kyc, sendernum, dmttype, id })
    navigation.navigate("DmtTransferScreen",
      { bankname, ACCno, accHolder, ifsc, mode: 'IMPS', unqid, kyc, sendernum, dmttype, id },);

  };


  const handleNeftPress = async (item) => {
    const bankname = item['bank'];
    const ACCno = item['account'];
    const accHolder = item['name'];
    await setIfsc(item['ifsc']);
    await setAccHolder(item['name']);
    await setAccNo(item['account']);
    await setBankName(item['bank'])
    navigation.navigate("DmtTransferScreen", { bankname, ACCno, accHolder, ifsc, mode: 'NEFT', unqid },);
    console.log('NEFT pressed for:', item);
  };

  const handleDeletePress = async (item) => {
    setisLoading(true);

    Alert.alert(
      'Delete Account',
      `Account: ${item.account}\nBank: ${item.bank}\nID: ${item.id}\nIFSC: ${item.ifsc}\nName: ${item.name}`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const res = await post({
                url: `MoneyDMT/api/Money/DeleteReceipent?mobile=${sendernum}&beneficiaryid=${item.id}`
              });

              if (res['RESULT'] === '1') {
                ToastAndroid.showWithGravity(res['ADDINFO'], ToastAndroid.SHORT, ToastAndroid.BOTTOM);
              } else {
                checksendernumber(sendernum);
                const response = JSON.parse(res['ADDINFO']);
                ToastAndroid.showWithGravity(response.status, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
                console.log(response);
              }
            } catch (error) {
              console.log(error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };


  const toggleEditable = () => {
    setEditable(!editable);

  }

  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    filterData(searchText);
  }, [searchText, isR, beneficiaryData, banklist]);

  const filterData = (text) => {
    const dataToFilter = isR ? beneficiaryData : banklist;

    if (!text.trim()) {
      setFilteredData(dataToFilter);
    } else {
      const filtered = dataToFilter.filter(item =>
        item.name?.toLowerCase().includes(text.toLowerCase()) ||
        item.account?.toString().includes(text)
      );
      setFilteredData(filtered);
    }
  };

  const BeneficiaryList = () => {
    return (
      <FlashList
        data={filteredData}
        keyExtractor={item => item.id || item.name.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            {item.isbankdown ? (
              <Text style={styles.noteText}>{translate("Note_Currently_the_beneficiary_banks_server_is_down_or_busy_please_try_after_sometime")}</Text>
            ) : null}
            <View style={{
              borderBottomWidth: wScale(.5), borderBottomColor: '#000',
              marginBottom: hScale(8), paddingBottom: hScale(5)
            }}>

              <View style={styles.row}>
                <Text style={styles.itemLabel}>{translate("Name")}</Text>
                <Text style={styles.itemValue}>{item.name}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.itemLabel}>{translate("IFSC_Code")}</Text>
                <Text style={styles.itemValue}>{item.ifsc}</Text>
              </View>
            </View>

            <View style={[styles.row,]}>
              <Text style={styles.itemLabel}>{translate("Bank_Name")}</Text>
              <Text style={styles.itemValue} numberOfLines={1} ellipsizeMode='tail'>{item.bank}</Text>
            </View>
            <View style={{
              borderTopWidth: wScale(.5), borderTopColor: '#000',
              marginTop: hScale(8)
            }}>

              <View style={[styles.row, { marginTop: hScale(8), }]}>
                <View >
                  <Text style={styles.itemLabel}>{translate("Account")}</Text>
                  <Text style={[styles.itemValue, { textAlign: 'left' }]} numberOfLines={1} ellipsizeMode='tail'>{item.account}</Text>
                </View>
                <TouchableOpacity style={[styles.button, styles.impsButton]} onPress={() => handleImpsPress(item)}>
                  <Text style={styles.buttonText}>{translate("IMPS")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.neftButton]} onPress={() => handleNeftPress(item)}>
                  <Text style={styles.buttonText}>{translate("NEFT")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => handleDeletePress(item)}>
                  <Text style={styles.buttonText} >{translate("Delete")}</Text>
                </TouchableOpacity>

              </View>
            </View>

          </View>
        )}
        keyExtractor={item => item.name}
        estimatedItemSize={5}
      />
    );
  };



  return (
    <View style={styles.main}>
      {isload && <ShowLoader />}
      <LinearGradient colors={[colorConfig.primaryColor, colorConfig.secondaryColor]} style={styles.lineargradient}>
        <View style={styles.container} >
          {sendernum.length === 10 && <TextInput
            placeholder="Search by Name or Account No"
            value={searchText}
            onChangeText={setSearchText}
            style={{
              backgroundColor: '#fff',
              borderRadius: 5,
              paddingHorizontal: 12,
              paddingVertical: 8,
              color: '#000',
              fontSize:wScale(18)
            }}
            placeholderTextColor="#888"
          />
          }

          <View style={{
            marginTop: hScale(10)
          }}>
            <TextInput
              placeholder='Enter Remitter Registered  Number'
              style={styles.inputstyle}
              placeholderTextColor={colors.black75}

              maxLength={10}
              keyboardType="number-pad"
              value={sendernum}
              onChangeText={text => {
                setSendernum(text)
                if (text.length === 10) {
                  setSendernum(text)
                  setNxtbtn(true);
                  setOnTap(false);
                  setOnTap1(true);
                  checksendernumber(text);
                  Keyboard.dismiss();

                } else {
                  setTXNP(false)
                  setNxtbtn(false);
                  setOnTap(true);
                  setOnTap1(false);
                }
              }}
            />



            {
              banklist == null ? null :
                <View style={[styles.righticon2]}>
                  <TouchableOpacity style={{ backgroundColor: colorConfig.secondaryColor, paddingVertical: hScale(4) }}
                    onPress={toggleEditable}>
                    <SvgXml xml={EditIcon} width={wScale(40)} height={wScale(28)} />
                  </TouchableOpacity>
                </View>
            }
          </View>
          {aadharNumber.length === 12 && <SelectDevice setDeviceName={setDeviceName} device={'Device'} opPress={() => handleSelection(deviceName)} />
          }
          {isTXNP && <View style={{}}>
            <TextInput
              placeholder='Enter Aadhar Number'
              style={styles.inputstyle}
              placeholderTextColor={colors.black75}

              maxLength={12}
              keyboardType="number-pad"
              value={aadharNumber}
              onChangeText={text => {
                setAadharNumber(text);
                if (text.length === 12) {
                  setAadharNumber(text);
                  adhar_Validation(text);
                  Keyboard.dismiss();

                } else {

                }
              }}
            />
            {
              <View style={[styles.righticon2]}>

                {aadharNumber.length === 12 && <TouchableOpacity style={{}}
                  onPress={() => {


                    handleSelection(deviceName)
                  }}>
                  <Text style={{ color: colorConfig.secondaryColor, padding: hScale(5) }}>{translate("Scan")}</Text>
                </TouchableOpacity>}

              </View>
            }
          </View>}

          {remitter === null ? null :
            <View style={[styles.limitview, { flexDirection: 'row' }]}>
              <View style={styles.limitcolum}>
                <Text style={styles.label}>{translate("Consume_limit")}</Text>
                <Text style={styles.value}>
                  {remitter === null ? '0000' : remitter.consumedlimit}
                </Text>
              </View>
              <View style={styles.borderview} />

              <View style={styles.limitcolum}>
                <Text style={styles.label}>{translate("Remain_limit")}</Text>
                <Text style={[styles.value, { textAlign: 'center' }]}>
                  {remitter === null ? '0000' : remitter.remaininglimit}
                </Text>
              </View>
              <View style={styles.borderview} />
              <View style={styles.limitcolum}>
                <Text style={styles.label}>{translate("Per_txn_limit")}</Text>
                <Text style={[styles.value, { textAlign: 'right' }]}>
                  {remitter === null ? '0000' : remitter.perm_txn_limit}
                </Text>
              </View>
            </View>
          }



          {isTXNP1 == 'TXN' && <DynamicButton
            title={onTap1 ? <ActivityIndicator size={'large'} color={colorConfig.labelColor} /> : banklist.length === 0 ? "Next" : "Add Acount"}
            disabled={!nxtbtn}
            onPress={() => {
              if (banklist.length === 0) {
                handleNextButtonPress();
              } else {

                setIsVisible2(true)
                //  navigation.navigate("DmtAddNewBenificiaryScreen", { no: sendernum });
              }
            }}
          />}
        </View>

      </LinearGradient>

      {/* <TouchableOpacity style={{}}
        onPress={() => {
        console.log(aadharNumber);
        }}>
        <Text style={{ color: colorConfig.secondaryColor, padding: hScale(5) }}>{translate("Scan")}</Text>
      </TouchableOpacity> */}
      <OTPModal
        setShowOtpModal={setShowOtpView}
        disabled={mobileOtp.length !== 4}
        showOtpModal={showOtpView}
        setMobileOtp={setMobileOtp}
        setEmailOtp={null}
        inputCount={4}
        verifyOtp={() => {
          //  setShowOtpView(false);
          setIsload(true);
          verifyEkycOtp();
        }}
      />
      <BottomSheet
        animationType="none"   onBackdropPress={() => { setIsVisible2(false) }} isVisible={isVisible2}>
        {/* no: sendernum, remid: remid, Name: dmttype  */}
        <DmtAddNewBenificiaryScreen
          Name={dmttype}
          Name2={''}
          no={sendernum}
          remid={remid}
          onPress={() => {
            setIsVisible2(false);
          }}
          onPress2={() => {
            setisLoading(true);

            checksendernumber(sendernum)
            setIsVisible2(false);
          }}

        />

      </BottomSheet>
      <ScrollView>
        {nodata ? <View style={styles.container}>
          <Text style={styles.title}>{translate('No Data Found')}</Text>

          <DynamicButton title={'ADD ACC'} onPress={() => {
            setIsVisible2(true)
            //  navigation.navigate("DmtAddNewBenificiaryScreen", 
            // 
            // { no: sendernum, remid: remid, Name: dmttype });

          }} />

        </View>
          : <></>
        }
        {showloader && <ShowLoader />}
        {banklist.length == 0 ?
          <View style={styles.container}>
            <Text style={styles.titletext}>{translate("Very_Important_Notice")}</Text>
            <View style={styles.textview} >
              <View style={styles.bulletPoint} />
              <Text style={styles.textstyle}> {translate('D1')}</Text>
            </View>

            <View style={styles.textview} >
              <View style={styles.bulletPoint} />
              <Text style={styles.textstyle}> {translate('D2')}</Text>
            </View>
            <View style={styles.textview} >
              <View style={styles.bulletPoint} />
              <Text style={styles.textstyle}> {translate('D3')}</Text>
            </View>
            <View style={styles.textview} >
              <View style={styles.bulletPoint} />
              <Text style={styles.textstyle}> {translate('D4')}</Text>
            </View>
            <View style={styles.textview} >
              <View style={styles.bulletPoint} />
              <Text style={styles.textstyle}> {translate('D5')}</Text>
            </View>
            <View style={styles.textview} >
              <View style={styles.bulletPoint} />
              <Text style={styles.textstyle}> {translate('D6')}</Text>
            </View>
            <View style={styles.textview} >
              <View style={styles.bulletPoint} />
              <Text style={styles.textstyle}> {translate('D7')}</Text>
            </View>
          </View>
          : <View style={{
            paddingTop: hScale(20),
          }}>
            <BeneficiaryList />
          </View>
        }


      </ScrollView>
    </View >
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    paddingBottom: hScale(20)
  },
  lineargradient: {
    paddingTop: hScale(10)
  },
  container: {
    paddingHorizontal: wScale(10),
    paddingBottom: wScale(10),
  },
  inputstyle: {
    backgroundColor: 'white',
    paddingLeft: wScale(15),
    borderRadius: 5,
    marginBottom: hScale(15),
    fontSize: wScale(18),
    color: '#000',
  },

  righticon2: {
    position: "absolute",
    left: "auto",
    right: wScale(0),
    top: hScale(0),
    height: "78%",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: wScale(12),
  },

  title: {
    fontSize: wScale(24),
    fontWeight: 'bold',
    marginBottom: hScale(20),
    color: '#000'
  },
  titletext: {
    color: 'red',
    fontSize: wScale(18),
    paddingBottom: hScale(15),
    paddingTop: hScale(5)
  },
  bulletPoint: {
    backgroundColor: 'red',
    borderRadius: 100,
    width: wScale(10),
    height: wScale(10),
    marginRight: wScale(10),
    marginTop: wScale(6),
  },
  textview: {
    flexDirection: 'row',
    paddingBottom: hScale(10)
  },
  textstyle: {
    color: 'black',
    fontSize: wScale(14),
    flex: 1,
    textAlign: 'justify',

  },
  itemContainer: {
    flex: 1,
    padding: wScale(10),
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    elevation: 2,
    marginBottom: hScale(10),
    marginHorizontal: wScale(10)
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemLabel: {
    fontSize: wScale(16),
    fontWeight: 'bold',
    color: '#333',
  },
  itemValue: {
    fontSize: wScale(16),
    color: '#555',
    flex: 1, textAlign: 'right'
  },
  noteText: {
    fontSize: wScale(14),
    color: '#d9534f',
    marginBottom: hScale(10)
  },

  button: {
    flex: 1,
    paddingVertical: hScale(12),
    borderRadius: 3,
    alignItems: 'center',
    marginLeft: wScale(8),
  },
  impsButton: {
    backgroundColor: '#007bff',
  },
  neftButton: {
    backgroundColor: '#28a745',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },

  buttonText: {
    color: 'white',
    fontSize: wScale(16),
    fontWeight: 'bold',
  },
  limittext: {
    fontSize: wScale(16),
    color: '#333',
    padding: wScale(10),
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: hScale(5),
  },
  tabstyle: {
    paddingVertical: hScale(10),
    backgroundColor: "#fff",
    marginBottom: hScale(10),
    borderRadius: 5,
  },
  limitview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: hScale(10),
    paddingHorizontal: wScale(5),
    borderRadius: 5,
  },
  limitcolum: {
    flexDirection: 'column',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff'

  },
  value: {
    fontSize: 14,
    color: '#fff'
  },
  borderview: {
    height: '100%',
    width: wScale(0.7),
    backgroundColor: "#fff",
  }
});

export default GetBenifiaryScreenDmt;
