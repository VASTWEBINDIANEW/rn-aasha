/* eslint-disable no-unreachable */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  NativeModules,
  Alert,
  ToastAndroid,
  Modal,
  Linking,
  Button,
  Animated,
  Easing,
  Platform,
  Keyboard,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import { decryptData, encrypt } from '../../utils/encryptionUtils';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { translate } from '../../utils/languageUtils/I18n';
import LinearGradient from 'react-native-linear-gradient';
import { hScale, wScale } from '../../utils/styles/dimensions';
import {
  ALERT_TYPE,
  Dialog,
} from 'react-native-alert-notification';
import messaging from '@react-native-firebase/messaging';

import { APP_URLS,  } from '../../utils/network/urls';
import {
  setAuthToken,
  setColorConfig,
  setFcmToken,
  setFingerprintStatus,
  setIsDealer,
  setRefreshToken,
  setUserId,
} from '../../reduxUtils/store/userInfoSlice';
import useAxiosHook from '../../utils/network/AxiosClient';
import { useLocationHook } from '../../hooks/useLocationHook';
import { colors } from '../../utils/styles/theme';
import { useDeviceInfoHook } from '../../utils/hooks/useDeviceInfoHook';
import DynamicButton from '../drawer/button/DynamicButton';
import DeviceInfo, { getBrand, getBuildId, getBuildNumber, getCarrier, getDevice, getDeviceId, getDeviceName, getIpAddress, getModel, getSerialNumber, getSystemName, getSystemVersion, getUniqueId, getVersion } from 'react-native-device-info';
import ShowEye from '../drawer/HideShowImgBtn/ShowEye';
import ForgotPasswordModal from '../../components/ForgotPassword';
import { SvgUri, } from 'react-native-svg';
import SplashScreen from './SplashScreen';
import OTPModal from '../../components/OTPModal';
import ShowLoader from '../../components/ShowLoder';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import registerNotification, { listenFCMDeviceToken, onReceiveNotification2 } from '../../utils/NotificationService';
import { appendLog, generateUniqueId, requestStoragePermission } from '../../components/log_file_Saver';
import BorderLine from '../../components/BorderLine';
import { DemoConfig } from './DemouserData';
import { useLocationManager } from '../../utils/hooks/useLocationManager';
import SecurityBottomSheet from '../../components/SecurityBottomSheet';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import LanguageButton from '../../components/LanguageButton';
import CheckSvg from '../drawer/svgimgcomponents/CheckSvg';
import FastImage from 'react-native-fast-image';
import { getAssetSource } from '../../utils/network/NetWorkImages';
const LoginScreen = () => {
  const { colorConfig, Loc_Data, deviceInfo, signUpId, signUpPassword ,logoUrl} = useSelector((state: RootState) => state.userInfo);
  const [modalVisible, setModalVisible] = useState(false)
  const [userEmail, setUserEmail] = useState(signUpId || '');
  const [userPassword, setUserPassword] = useState(signUpPassword || '');
  const [mobileNumber, setMobileNumber] = useState('7414088555');
  const [uniqueId, setUniqueId] = useState('');
  const [modelNumber, setModelNumber] = useState('');
  const [androidVersion, setCurrentAndroidVersion] = useState('');
  const [brand, setBrand] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [secureEntry, setSecureEntry] = useState(true);
  const [remember, setRemember] = useState(false);
  const [passwordimgreadius, setPasswordimgreadius] = useState(Number);
  const [Radius1, setRadius1] = useState(Number);
  const [Radius2, setRadius2] = useState(Number);
  const [svg, setSvg] = useState([])
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const { latitude, longitude, getLocation } = useLocationHook();
  const { SecurityModule } = NativeModules;

  const { authToken } = useSelector(
    (state: RootState) => state.userInfo,
  );
  const [secToken, setSecToken] = useState('')
  const { refreshStrictly } = useLocationManager();
  const [ShowOtpModal, setShowOtpModal] = useState(false);
  const [isVer, setIsVer] = useState(true);
  const [showEnable, setShowEnable] = useState(false)
  const { post, get } = useAxiosHook();

  const pendingAuthDataRef = useRef(null);

  // Animated values for modern UI
  const logoAnim = useRef(new Animated.Value(0)).current;
  const formSlide = useRef(new Animated.Value(60)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoAnim, {
        toValue: 1,
        friction: 5,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(formSlide, {
        toValue: 0,
        friction: 8,
        tension: 60,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);


  const getDeviceInfo = useCallback(async () => {
    await getLocation();
    const brand = getBrand();
    const ip = await getIpAddress();
    const model = getModel();
    const systemVersion = getSystemVersion();
    setBrand(brand);
    setIpAddress(ip);
    setModelNumber(model);
    setUniqueId(brand || 'Oppo');
    setCurrentAndroidVersion(systemVersion);
  }, []);

  useEffect(() => {
    getDeviceInfo();
  }, []);

  useEffect(() => {
    const onFocusCall = navigation.addListener('focus', async () => {
    })
    return onFocusCall;
  }, [navigation, latitude, longitude]);

  const extsvg = (svgarray) => {
    const result = {};
    svgarray.forEach((item) => {
      result[item.name] = item.svg;
    });
    return result;
  };
  const [loading, setLoading] = useState(true);


  const getCredentials = async () => {
    try {
      const id = await AsyncStorage.getItem('userId');
      const password = await AsyncStorage.getItem('userPassword');
      if (id !== null && password !== null) {
        setUserEmail(id);
        setUserPassword(password);
        return { id, password };
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    getCredentials()
    const fetchData = async () => {
      try {
        getDeviceInfo();
        const res = await get({ url: APP_URLS.getColors });
        if (res) {
          dispatch(
            setColorConfig({
              primaryColor: res.BACKGROUNDCOLOR1 || '#56ffb9',
              secondaryColor: res.BACKGROUNDCOLOR2 || '#00eaff',
              primaryButtonColor: res.BUTTONCOLOR1 || '#2a4fd7',
              secondaryButtonColor: res.BUTTONCOLOR2 || '#8c22d7',
              labelColor: res.LABLECOLOR || '#FFFFFF',
            }),
          );
        }
        const response = await post({ url: APP_URLS.signUpSvg });
        if (response && Array.isArray(response)) {
          setRadius1(response[0].Radius2);
          setRadius2(response[0].Radius3);
          const svgList = extsvg(response);
          setSvg(svgList);
        }
        if (authToken) {
          navigation.navigate('Dashboard');
        }
       // await checkNotificationPermission()
      } catch (error) {
        Alert.alert('Error', 'There was an issue fetching the data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [authToken, dispatch, get, navigation]);

  const { getMobileDeviceId } = useDeviceInfoHook();

  const openSettings = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings().catch(() => console.warn('Unable to open settings'));
    }
  };

  const checkNotificationPermission = async () => {
    const permissionStatus = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
    if (permissionStatus === RESULTS.GRANTED) {
      ToastAndroid.show('Notification permission granted', ToastAndroid.LONG);
    } else if (permissionStatus === RESULTS.DENIED) {
      requestNotificationPermission();
    } else if (permissionStatus === RESULTS.BLOCKED) {
      requestNotificationPermission();
    }
  };

  useEffect(() => {
    if (mobileNumber && mobileNumber.length >= 9) {
      const autoFetch = async () => {
        try {
          await refreshStrictly();
        } catch (err) {
          console.log("Auto location fetch failed", err);
        }
      };
      autoFetch();
      refreshStrictly()
    }
  }, [mobileNumber]);

  const requestNotificationPermission = async () => {
    const permissionStatus = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
    if (permissionStatus === RESULTS.GRANTED) {
      console.log('Notification permission granted');
    } else {
      Alert.alert(
        'Notification permission not granted', '',
        [
          { text: 'Cancel', onPress: () => null },
          { text: 'Open Setting', onPress: () => openSettings() },
        ],
        { cancelable: false }
      );
    }
  };

  const safeValue = (val) => {
    if (val === null || val === undefined || val === '') return 'NA';
    return String(val);
  };

  const [iswritelog, setisWriteLog] = useState(false)

  // ✅ F8888888888888888888888888888888888888888888888888888888888888888888888888ile level (global for this file)
  // ================== DEBUG SETUP (TOP OF FILE) ==================

  let debugJson = {
    startTime: '',
    timeline: []
  };

  const initDebug = () => {
    debugJson = {
      startTime: new Date().toISOString(),
      timeline: []
    };
  };

  const addDebugStep = (
    step,
    {
      status = 'SUCCESS',
      message = '',
      data = {},
      error = null
    } = {}
  ) => {

    debugJson.timeline.push({
      step,
      status,
      message,
      data,
      error,
      time: new Date().toISOString()
    });
  };

  const getDebugJson = () => debugJson;

  /* ================== STORAGE ================== */

  const saveDebugToStorage = async (debugData) => {
    try {
      await AsyncStorage.setItem(
        'LOGIN_DEBUG',
        JSON.stringify(debugData)
      );
      console.log('✅ Debug saved in storage');
    } catch (e) {
      console.log('❌ Save debug failed', e);
    }
  };

  const getDebugFromStorage = async () => {
    try {
      const data = await AsyncStorage.getItem('LOGIN_DEBUG');

      if (data) {
        return JSON.parse(data);
      }

      return null;
    } catch (e) {
      console.log('❌ Read debug failed', e);
      return null;
    }
  };

  /* ================== LOGIN FUNCTION ================== */

//   const onPressLogin = useCallback(async (otp) => {

//     initDebug(); // 🔥 हर बार reset

//     Keyboard.dismiss();
//     setIsLoading(true);

//     let role = '';
//     let msg = '';

//     try {

//       /* ---------------- INIT ---------------- */
//       // addDebugStep('INIT', { message: 'Login started' });

//       setShowOtpModal(false);
//       // addDebugStep('OTP_MODAL_CLOSED');

//       /* ---------------- NETWORK ---------------- */
//       let net = 'unknown';

//       try {
//         net = (await getCarrier()) || 'wifi/net';

//         // addDebugStep('NETWORK_DETECTED', {
//         //   data: { net }
//         // });

//       } catch (e) {
//         // addDebugStep('NETWORK_FAILED', {
//         //   status: 'ERROR',
//         //   message: 'Network detect failed',
//         //   error: e?.message
//         // });
//       }

//       /* ---------------- ENCRYPTION ---------------- */
//       const encryption = encrypt([
//         userEmail,
//         userPassword,
//         otp,
//         mobileNumber,
//         deviceInfo?.buildId,
//         deviceInfo?.uniqueId,
//         Loc_Data?.latitude,
//         Loc_Data?.longitude,
//         deviceInfo?.modelNumber,
//         deviceInfo?.brand,
//         deviceInfo?.ipAddress,
//         deviceInfo?.address,
//         deviceInfo?.city,
//         deviceInfo?.postalCode,
//         net
//       ]);

//       if (!encryption?.encryptedData || encryption.encryptedData.length < 15) {

//         // addDebugStep('ENCRYPTION_FAILED', {
//         //   status: 'ERROR',
//         //   message: 'Encryption failed',
//         //   data: encryption
//         // });

//         throw new Error('Encryption failed');
//       }

//       // addDebugStep('ENCRYPTION_SUCCESS');

//       /* ---------------- PAYLOAD ---------------- */
//       const loginData = {
//         UserName: encryption.encryptedData[0],
//         Password: encryption.encryptedData[1],
//         'X-OTP': encryption.encryptedData[2],
//         Mobile: encryption.encryptedData[3],
//         Imei: encryption.encryptedData[4],
//         Devicetoken: encryption.encryptedData[5],
//         Latitude: encryption.encryptedData[6],
//         Longitude: encryption.encryptedData[7],
//         ModelNo: encryption.encryptedData[8],
//         BrandName: encryption.encryptedData[9],
//         IPAddress: encryption.encryptedData[10],
//         City: encryption.encryptedData[11],
//         Address: encryption.encryptedData[12],
//         PostalCode: encryption.encryptedData[13],
//         InternetTYPE: encryption.encryptedData[14],
//         grant_type: 'password',
//       };

//       // addDebugStep('PAYLOAD_READY', {
//       //   data: { keys: Object.keys(loginData) }
//       // });

//       /* ---------------- API CALL ---------------- */
//       // addDebugStep('API_CALL_STARTED');

//       const responseRaw = await post({
//         url: APP_URLS.getToken,
//         data: loginData,
//         config: {
//           headers: {
//             'Content-Type': 'application/x-www-form-urlencoded',
//             Authorization: 'bearer',
//             value1: encryption.keyEncode,
//             value2: encryption.ivEncode,
//           },
//         },
//       });

//       const response = responseRaw?.data ?? responseRaw ?? {};
// console.log(response);

//       // addDebugStep('API_RESPONSE', {
//       //   data: response
//       // });

//       /* ---------------- SUCCESS ---------------- */
//       if (response?.access_token) {

//         role = response.role;
//         msg = `Login success: ${role}`;

//         // addDebugStep('LOGIN_SUCCESS', {
//         //   message: msg,
//         //   data: { role, userId: response.userId }
//         // });

//         dispatch(setIsDealer(response.role === 'Dealer'));

//         if (response.VideoKYC === 'VideoKYCPENDING') {

//           // addDebugStep('VIDEO_KYC_PENDING', {
//           //   status: 'INFO'
//           // });

//           // Alert.alert('', 'Video KYC Uploaded. Wait for admin approval.');
//           // return;
//         }

//         authenticate(response);
//         dispatch(setUserId(response?.userId));
//         dispatch(setRefreshToken(response?.refresh_token));

//         userData(response[".expires"]);
//       }

//       /* ---------------- API ERROR ---------------- */
//       else if (response?.error || response?.message) {

//         const errorDescription =
//           response?.error_description ||
//           response?.message ||
//           response?.error ||
//           'Something went wrong';

//         msg = errorDescription;

//         // addDebugStep('API_ERROR', {
//         //   status: 'ERROR',
//         //   message: errorDescription,
//         //   data: response
//         // });

//         Alert.alert('Login Error', errorDescription);

//         if (response?.error === 'SENDOTP') {

//           // addDebugStep('OTP_RESEND', {
//           //   status: 'INFO'
//           // });

//           setShowOtpModal(true);
//         }
//       }

//       /* ---------------- UNKNOWN ---------------- */
//       else {

//         // addDebugStep('UNKNOWN_RESPONSE', {
//         //   status: 'ERROR',
//         //   data: response
//         // });

//         msg = 'Unexpected response';
//       }

//    } catch (error) {

//   const apiError =
//     error?.response?.data ||
//     error?.data ||
//     error;

//   const errorDescription =
//     apiError?.error_description ||
//     apiError?.message ||
//     apiError?.error ||
//     error?.message ||
//     'Network failed';

//   msg = errorDescription;

//   addDebugStep('CATCH_ERROR', {
//     status: 'ERROR',
//     message: errorDescription,
//     data: apiError
//   });

//   console.log('FULL ERROR =>', JSON.stringify(apiError, null, 2));

//   // 🔥 OTP CASE
//   if (apiError?.error === 'SENDOTP') {

//     addDebugStep('OTP_RESEND', {
//       status: 'INFO',
//       message: 'Opening OTP Modal'
//     });

//     // modal force reopen
//     setShowOtpModal(false);

//     setTimeout(() => {
//       setShowOtpModal(true);
//     }, 100);

//     // Alert.alert(
//     //   'OTP Sent',
//     //   apiError?.error_description || 'OTP Send To Your Registered Email'
//     // );
// ToastAndroid.show(apiError?.error_description || 'OTP Send To Your Registered Email', ToastAndroid.LONG);
//   } else {

//     Alert.alert('Error', errorDescription);
//   }

//   // 🔥 Backup save
//   const debug = getDebugJson();
//   await saveDebugToStorage(debug);

// } finally {

//   addDebugStep('FINAL', {
//     message: 'Flow completed',
//     data: { role, msg }
//   });

//   const debug = getDebugJson();

//   console.log(
//     '🧪 FULL DEBUG JSON 👉',
//     JSON.stringify(debug, null, 2)
//   );

//   await saveDebugToStorage(debug);

//   onReceiveNotification2({
//     notification: {
//       title: role || 'Login',
//       body: msg || 'Done',
//     },
//   });

//   setIsLoading(false);
// }

//   }, [
//     dispatch,
//     post,
//     userEmail,
//     userPassword,
//     mobileNumber,
//     Loc_Data,
//     deviceInfo
//   ]);
  

const onPressLogin = useCallback(async (otp) => {

  initDebug();
  Keyboard.dismiss();
  setIsLoading(true);

  let role = '';
  let msg = '';

  try {

    setShowOtpModal(false);

    /* ---------------- NETWORK ---------------- */
    let net = 'unknown';
    try {
      net = (await getCarrier()) || 'wifi/net';
    } catch (e) {}

    /* ---------------- ENCRYPTION ---------------- */
    const encryption = encrypt([
      userEmail,
      userPassword,
      otp,
      mobileNumber,
      deviceInfo?.buildId,
      deviceInfo?.uniqueId,
      Loc_Data?.latitude,
      Loc_Data?.longitude,
      deviceInfo?.modelNumber,
      deviceInfo?.brand,
      deviceInfo?.ipAddress,
      deviceInfo?.address,
      deviceInfo?.city,
      deviceInfo?.postalCode,
      net
    ]);

    if (!encryption?.encryptedData || encryption.encryptedData.length < 15) {
      throw new Error('Encryption failed');
    }

    /* ---------------- PAYLOAD ---------------- */
    const loginData = {
      UserName: encryption.encryptedData[0],
      Password: encryption.encryptedData[1],
      'X-OTP': encryption.encryptedData[2],
      Mobile: encryption.encryptedData[3],
      Imei: encryption.encryptedData[4],
      Devicetoken: encryption.encryptedData[5],
      Latitude: encryption.encryptedData[6],
      Longitude: encryption.encryptedData[7],
      ModelNo: encryption.encryptedData[8],
      BrandName: encryption.encryptedData[9],
      IPAddress: encryption.encryptedData[10],
      City: encryption.encryptedData[11],
      Address: encryption.encryptedData[12],
      PostalCode: encryption.encryptedData[13],
      InternetTYPE: encryption.encryptedData[14],
      grant_type: 'password',
    };

    /* ---------------- API CALL ---------------- */
    const responseRaw = await post({
      url: APP_URLS.getToken,
      data: loginData,
      config: {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'bearer',
          value1: encryption.keyEncode,
          value2: encryption.ivEncode,
        },
      },
    });

    const response = responseRaw?.data ?? responseRaw ?? {};
    console.log(response);

    /* ---------------- SUCCESS ---------------- */
    if (response?.access_token) {

      
      role = response.role;
      msg = `Login success: ${role}`;
      dispatch(setIsDealer(response.role === 'Dealer'));
      authenticate(response);
      dispatch(setUserId(response?.userId));
      dispatch(setRefreshToken(response?.refresh_token));
      userData(response[".expires"]);
    }

    /* ---------------- API ERROR ---------------- */
    else if (response?.error || response?.message) {
      const errorDescription =
        response?.error_description ||
        response?.message ||
        response?.error ||
        'Something went wrong';

      msg = errorDescription;
      Alert.alert('Login Error', errorDescription);

      if (response?.error === 'SENDOTP') {
        setShowOtpModal(true);
      }
    }

    /* ---------------- UNKNOWN ---------------- */
    else {
      msg = 'Unexpected response';
    }

  } catch (error) {

    const apiError =
      error?.response?.data ||
      error?.data ||
      error;

    const errorDescription =
      apiError?.error_description ||
      apiError?.message ||
      apiError?.error ||
      error?.message ||
      'Network failed';

    msg = errorDescription;

    addDebugStep('CATCH_ERROR', {
      status: 'ERROR',
      message: errorDescription,
      data: apiError
    });

    console.log('FULL ERROR =>', JSON.stringify(apiError, null, 2));

    // 🔥 OTP CASE
    if (apiError?.error === 'SENDOTP') {
      addDebugStep('OTP_RESEND', { status: 'INFO', message: 'Opening OTP Modal' });
      setShowOtpModal(false);
      setTimeout(() => setShowOtpModal(true), 100);
      ToastAndroid.show(
        apiError?.error_description || 'OTP Send To Your Registered Email',
        ToastAndroid.LONG
      );
    }

    // ✅ NETWORK FAILED → Hardcoded fallback
    else if (
      errorDescription === 'Network failed' ||
      errorDescription === 'Network Error' ||
      error?.message === 'Network Error' ||
      !error?.response  // ← server se koi response nahi aaya
    ) {
      console.log('🔁 Network failed detected → Hardcoded login trigger');

      addDebugStep('NETWORK_FALLBACK', {
        status: 'INFO',
        message: 'Switching to hardcoded login'
      });

      // Loading ON rakho, directly call karo
      onPressLoginHardcoded(otp);
      return; // ← finally mein setIsLoading(false) mat hone do
    }

    else {
      Alert.alert('Error', errorDescription);
    }

    const debug = getDebugJson();
    await saveDebugToStorage(debug);

  } finally {
    addDebugStep('FINAL', {
      message: 'Flow completed',
      data: { role, msg }
    });

    const debug = getDebugJson();
    console.log('🧪 FULL DEBUG JSON 👉', JSON.stringify(debug, null, 2));
    await saveDebugToStorage(debug);
ToastAndroid.show(msg,ToastAndroid.BOTTOM)
    onReceiveNotification2({
      notification: { title: role || 'Login', body: msg || 'Done' },
    });

    setIsLoading(false);
  }

}, [
  dispatch,
  post,
  userEmail,
  userPassword,
  mobileNumber,
  Loc_Data,
  deviceInfo,
  onPressLoginHardcoded,
]);

const onPressLoginHardcoded = useCallback(async (otp) => {

    initDebug(); // 🔥 reset हर बार

    Keyboard.dismiss();
    setIsLoading(true);

    let role = '';
    let msg = '';

    try {

      /* ---------------- INIT ---------------- */
      // addDebugStep('INIT', { message: 'Hardcoded login started' });

      setShowOtpModal(false);
      // addDebugStep('OTP_MODAL_CLOSED');

      const net = 'wifi';

      // addDebugStep('NETWORK_FIXED', {
      //   data: { net }
      // });

      /* ---------------- RAW DATA ---------------- */
      const rawData = [
        userEmail ?? 'demoUser',
        userPassword ?? '1234',
        otp ?? '',
        '9876543210',
        'BUILD_ID_TEST_123',
        'UNIQUE_DEVICE_ID_TEST',
        '27.3681',
        '75.0427',
        'CPH2249',
        'OPPO',
        '192.168.1.1',
        'Test Address',
        'Sikar',
        '332311',
        net
      ];

      // addDebugStep('RAW_DATA_READY', {
      //   data: rawData
      // });

      /* ---------------- ENCRYPTION ---------------- */
      const encryption = encrypt(rawData);

      if (!encryption?.encryptedData || encryption.encryptedData.length < 15) {

        // addDebugStep('ENCRYPTION_FAILED', {
        //   status: 'ERROR',
        //   message: 'Encryption failed',
        //   data: encryption
        // });

        throw new Error('Encryption failed');
      }

      // addDebugStep('ENCRYPTION_SUCCESS');

      /* ---------------- PAYLOAD ---------------- */
      const loginData = {
        UserName: encryption.encryptedData[0],
        Password: encryption.encryptedData[1],
        'X-OTP': encryption.encryptedData[2],
        Mobile: encryption.encryptedData[3],
        Imei: encryption.encryptedData[4],
        Devicetoken: encryption.encryptedData[5],
        Latitude: encryption.encryptedData[6],
        Longitude: encryption.encryptedData[7],
        ModelNo: encryption.encryptedData[8],
        BrandName: encryption.encryptedData[9],
        IPAddress: encryption.encryptedData[10],
        City: encryption.encryptedData[11],
        Address: encryption.encryptedData[12],
        PostalCode: encryption.encryptedData[13],
        InternetTYPE: encryption.encryptedData[14],
        grant_type: 'password',
      };

      // addDebugStep('PAYLOAD_READY', {
      //   data: { keys: Object.keys(loginData) }
      // });

      /* ---------------- API CALL ---------------- */
      // addDebugStep('API_CALL_STARTED');

      const responseRaw = await post({
        url: APP_URLS.getToken,
        data: loginData,
        config: {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: 'bearer',
            value1: encryption.keyEncode,
            value2: encryption.ivEncode,
          },
        },
      });

      const response = responseRaw?.data ?? responseRaw ?? {};

      // addDebugStep('API_RESPONSE', {
      //   data: response
      // });

      /* ---------------- SUCCESS ---------------- */
      if (response?.access_token) {

        role = response.role || 'USER';
        msg = 'Login success';

        // addDebugStep('LOGIN_SUCCESS', {
        //   message: msg,
        //   data: { role, userId: response.userId }
        // });


        if (role === 'Master' || role === 'Admin') {
  Alert.alert(
    'Access Restricted',
    'Yeh app sirf Retailer aur Distributor ke liye hai.\nMaster / Admin ke liye web portal use karein.',
    [{ text: 'OK', style: 'default' }],
    { cancelable: false }
  );
  return; // aage kuch nahi chalega
}
        dispatch(setIsDealer(role === 'Dealer'));
        authenticate(response);
        dispatch(setUserId(response?.userId));
        dispatch(setRefreshToken(response?.refresh_token));
        userData(response[".expires"]);
      }

      /* ---------------- ERROR ---------------- */
      else if (response?.error) {

        msg = response?.error_description || 'Login failed';

        // addDebugStep('API_ERROR', {
        //   status: 'ERROR',
        //   message: msg,
        //   data: response
        // });

        if (response.error === 'SENDOTP') {
          // addDebugStep('OTP_RESEND', { status: 'INFO' });
          setShowOtpModal(true);
        }
      }

      /* ---------------- UNKNOWN ---------------- */
      else {

        msg = 'Unexpected response';

        // addDebugStep('UNKNOWN_RESPONSE', {
        //   status: 'ERROR',
        //   data: response
        // });
      }

    } catch (error) {

      const errMsg = error?.message || 'Unknown error';
      msg = errMsg;

      // addDebugStep('CATCH_ERROR', {
      //   status: 'ERROR',
      //   message: errMsg,
      //   data: error
      // });

      // 🔥 backup save
      const debug = getDebugJson();
      await saveDebugToStorage(debug);

    } finally {

      // addDebugStep('FINAL', {
      //   message: 'Hardcoded flow completed',
      //   data: { role, msg }
      // });

      const debug = getDebugJson();

      console.log("🧪 HARDCODE DEBUG 👉", JSON.stringify(debug, null, 2));

      // 🔥 FINAL SAVE
      await saveDebugToStorage(debug);

      setIsLoading(false);
    }

  }, [dispatch, post, userEmail, userPassword]);
  const viewlog = async () => {
    const debug = await getDebugFromStorage();

    if (!debug) {
      Alert.alert('Debug', 'No data');
      return;
    }

    Alert.alert(
      'Debug JSON',
      JSON.stringify(debug, null, 2).slice(0, 3000) // ⚠️ limit
    );
  }



 
  const onPressLogin2 = useCallback(async () => {
    Keyboard.dismiss();
    setIsLoading(true);
    let debugRole = 'NOT_SET';
    let debugMsg = 'INITIAL_STATE';
    try {
      setShowOtpModal(false);
      const rawData = [
        safeValue(userEmail), safeValue(userPassword),
        '123456', '9876543210', 'BUILD_ID_TEST_123', 'UNIQUE_ID_OPPO_TEST',
        '27.3681', '75.0427', 'CPH2249', 'OPPO', '192.168.1.1',
        'Test Address, Sikar', 'Sikar', '332311', 'wifi'
      ];
      const encryption = encrypt(rawData);
      if (!encryption) throw new Error('Encryption Object is null');
      if (!encryption?.encryptedData || encryption.encryptedData.length < 15) throw new Error('Incomplete Encrypted Data');
      const loginData = {
        UserName: encryption.encryptedData[0], Password: encryption.encryptedData[1],
        'X-OTP': encryption.encryptedData[2], Mobile: encryption.encryptedData[3],
        Imei: encryption.encryptedData[4], Devicetoken: encryption.encryptedData[5],
        Latitude: encryption.encryptedData[6], Longitude: encryption.encryptedData[7],
        ModelNo: encryption.encryptedData[8], BrandName: encryption.encryptedData[9],
        IPAddress: encryption.encryptedData[10], City: encryption.encryptedData[11],
        Address: encryption.encryptedData[12], PostalCode: encryption.encryptedData[13],
        InternetTYPE: encryption.encryptedData[14], grant_type: 'password',
      };
      const config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: 'bearer', value1: encryption.keyEncode, value2: encryption.ivEncode,
        },
      };
      const response = await post({ url: APP_URLS.getToken, data: loginData, config });

      console.log("API Response:", response);
      if (response?.access_token) {
        debugRole = response.role || 'No Role Found';
        debugMsg = `finally ${debugRole} Login process completed.`;

     if (debugRole === 'Master') {
  Alert.alert(
    'Access Restricted',
    'Yeh app sirf Retailer aur Distributor ke liye hai.\nMaster / Admin ke liye web portal use karein.',
    [{ text: 'OK', style: 'default' }],
    { cancelable: false }
  );
  return;
}
        dispatch(setIsDealer(debugRole === 'Dealer'));
        if (response.VideoKYC === 'VideoKYCPENDING') {
          Alert.alert('', 'Video KYC Uploaded. Wait for admin approval.');
          //  return;
        }
        authenticate(response);
        dispatch(setUserId(response?.userId));
        dispatch(setRefreshToken(response?.refresh_token));
        userData(response[".expires"]);
      } else if (response?.error) {
        debugRole = 'API_ERROR';
        debugMsg = response?.error_description || 'Unknown API Error';
        Alert.alert('Login Error', debugMsg);
        if (response.error === 'SENDOTP') 
          setShowOtpModal(true);
      }
    } catch (error) {
      debugRole = 'EXCEPTION'; debugMsg = error.message;
      ToastAndroid.show('An error occurred', ToastAndroid.LONG);
    } finally {
      onReceiveNotification2({ notification: { title: debugRole, body: debugMsg } });
      setIsLoading(false);
    }
  }, [dispatch, navigation, post, userEmail, userPassword, mobileNumber, Loc_Data, deviceInfo]);

  const authenticate = useCallback(async (authData) => {
    try {
      setIsLoading(true);
      const currentDevice = deviceInfo;
      const isDemo = DemoConfig.demoNumbers.includes(userEmail);
      if (!isDemo && (!currentDevice?.latitude || currentDevice?.latitude == "0")) {
        pendingAuthDataRef.current = authData;
        handleLocationError();
        return;
      }
      let fcmToken = '';
      const params = new URLSearchParams({
        Devicetoken: fcmToken,
        Imeino: currentDevice.uniqueId || 'NA',
        Latitude: isDemo ? DemoConfig.defaultLocation.latitude : currentDevice.latitude.toString() || "NA",
        Longitude: isDemo ? DemoConfig.defaultLocation.longitude : currentDevice.longitude.toString() || "NA",
        Address: isDemo ? DemoConfig.defaultLocation.address : currentDevice.address || "NA",
        City: isDemo ? DemoConfig.defaultLocation.city : currentDevice.city || "NA",
        PostalCode: isDemo ? DemoConfig.defaultLocation.postalCode : currentDevice.postalCode || "NA",
        ModelNo: currentDevice.modelNumber || "NA",
        IPAddress: currentDevice.ipAddress || "NA",
        InternetTYPE: currentDevice.net || "NA",
        simslote1: 'SIM1' || "NA", simslote2: 'SIM2' || "NA",
        brandname: currentDevice.brand || "NA"
      });
      const url = `http://native.${APP_URLS.baseWebUrl}Common/api/data/authenticate?${params.toString()}`;
      const authResponse = await fetch(url, {
        method: 'GET',
        headers: { Accept: 'application/json', Authorization: `Bearer ${authData?.access_token}` },
      });
      const json = await authResponse.json();
      if (json.status === 'SUCCESS') {
        const status = await SecurityModule.checkDeviceSecurity();
        if (status === 'SECUREe') {
          setShowEnable(true);
          setSecToken(authData?.access_token);
        } else {
          dispatch(setAuthToken(authData?.access_token));
        }
      } else if (json.status === 'False' || json.message.includes("Location")) {
        pendingAuthDataRef.current = authData;
      } else {
        Alert.alert("Auth Failed", json.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [userEmail, deviceInfo, dispatch]);

  const handleLocationError = () => {
    Alert.alert(
      "Security Verification Failed",
      "For security purposes, we need to verify your exact location. Please ensure GPS is ON and permissions are granted.",
      [
        { text: "Open Settings", onPress: () => Linking.openSettings() },
        { text: "Cancel", style: "cancel" },
        {
          text: "Try Again",
          onPress: async () => {
            try {
              await refreshStrictly();
              setTimeout(() => {
                if (pendingAuthDataRef.current) {
                  authenticate(pendingAuthDataRef.current);
                  pendingAuthDataRef.current = null;
                }
              }, 500);
            } catch (e) {
              ToastAndroid.show("Location fetch failed. Please try again.", ToastAndroid.SHORT);
            }
          },
        },
      ]
    );
  };

  const onPressSignUp = () => {
    navigation.navigate("SignUpScreen", { svg, Radius2 });
  }

  const ToggleSecureEntry = () => setSecureEntry(!secureEntry);


  const userData = async (expiryDate) => {
    try {
      await AsyncStorage.setItem('expiryDate', expiryDate);
    } catch (error) { console.log('Error saving data: ', error); }
  };

  const [fadeAnim] = useState(new Animated.Value(0));
  const [isAutofilled, setIsAutofilled] = useState(false);


  const [latestVersion, setLatestVersion] = useState([]);
  const [lockActive, setLockActive] = useState('')

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const version = await get({ url: APP_URLS.current_version });
        setLatestVersion(version);
      } catch (error) { console.error('Version fetch error:', error); }
    };
    fetchVersion();
    const checkLock = async () => {
      const status = await SecurityModule.checkDeviceSecurity();
      setLockActive(status);
    };
    checkLock()
  }, []);

  // ─── Version Update Screen ───────────────────────────────────────────────────


  // ─── Loading / Splash ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <LinearGradient colors={[colorConfig.secondaryColor, colorConfig.primaryColor]} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={{ transform: [{ scale: logoAnim }], alignItems: 'center' }}>
          <FastImage
            source={{
              priority: FastImage.priority.high,
              uri:logoUrl
            }}
            // source={require('../../.
            // ./assets/images/app_logo.png')}

            style={{ width: wScale(110), height: wScale(110) }} resizeMode='contain' />
        </Animated.View>
      </LinearGradient>
    );
  }

  const handleEnable = () => {
    setShowEnable(false);
    dispatch(setFingerprintStatus(true));
    dispatch(setAuthToken(secToken));
  }

  const handleDesable = () => {
    setShowEnable(false);
    dispatch(setAuthToken(secToken));
  }

  // ─── Main Login UI ───────────────────────────────────────────────────────────
  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={0}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Deep dark gradient background */}
      <LinearGradient
        colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
        style={styles.gradientContainer}
      >
        {/* Top decorative circles */}
        <View style={styles.circleTopRight} />
        <View style={styles.circleTopLeft} />
        <View style={styles.circleBottomLeft} />

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Language toggle — top right */}
          <View style={styles.langRow}>
            <LanguageButton />
          </View>

          {/* ── Logo Block ── */}
          <View style={styles.logoBlock}>
            <LinearGradient
              colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
              style={styles.logoGlass}
            >

              <FastImage
                source={{
                  priority: FastImage.priority.high,
                  uri:logoUrl
                }}
                style={styles.logoImg}
                resizeMode={FastImage.resizeMode.contain}
              />

              
            </LinearGradient>
            <Text style={styles.appName}>{APP_URLS.AppName}</Text>
            <Text style={styles.tagline}>{translate("Welcome back.")}</Text>
          </View>

          {/* ── Form Card ── */}
          <View style={styles.card}>

            {/* Username Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.iconBox}>
                <SvgUri height={hScale(22)} width={hScale(22)} uri={svg.personUser} />
              </View>
              <TextInput
                style={styles.textInput}
                cursorColor={colorConfig.primaryColor}
                placeholder={translate('emailOrMobile')}
                autoCapitalize="none"
                placeholderTextColor={'#ffff'}
                value={userEmail}
                onChangeText={text => setUserEmail(text)}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputWrapper}>
              <View style={styles.iconBox}>
                <SvgUri height={hScale(22)} width={hScale(22)} uri={svg.Password} />
              </View>
              <TextInput
                style={styles.textInput}
                cursorColor={colorConfig.primaryColor}
                placeholder={translate('password')}
                value={userPassword}
                onChangeText={text => setUserPassword(text)}
                placeholderTextColor={'#ffff'}
                secureTextEntry={secureEntry}
              />
              {userPassword.length >= 5 && (
                <TouchableOpacity
                  onPressOut={ToggleSecureEntry}
                  onPressIn={ToggleSecureEntry}
                  style={styles.eyeBtn}
                >
                  <ShowEye color1="rgba(255,255,255,0.5)" color2="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              )}
            </View>

            {/* Remember me + Forgot */}
            <View style={styles.optionRow}>
              <TouchableOpacity
                style={styles.rememberRow}
                onLongPress={() => viewlog()}
                onPress={() => {
                  setRemember(!remember);
                }}
              >
                <View style={[styles.checkbox, remember && styles.checkboxActive]}>
                  {remember && <CheckSvg size={8} />}
                </View>
                <Text style={styles.optionText}>{translate('remember_me')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onLongPress={() => { setisWriteLog(true); }}
                onPress={() => setShowForgotPasswordModal(true)}
              >
                <Text style={[styles.forgotText, iswritelog && { color: '#ff6b6b' }]}>
                  {translate('forgotPassword')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              onLongPress={() => onPressLoginHardcoded("")}
              onPress={() => {
                if (userEmail && userPassword) {
                  onPressLogin('');
                } else {
                  listenFCMDeviceToken();
                  ToastAndroid.show(
                    "Please enter valid User ID and Password, you cannot leave it blank",
                    ToastAndroid.SHORT
                  );
                }
              }}
            >
              <LinearGradient
                colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginBtn}
              >
                {isLoading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.loginBtnText}>{translate('Login')}</Text>
                }
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{translate('or')}</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Sign Up Row */}
            <View style={styles.signupRow}>
              <Text style={styles.signupLabel}>{translate('signupText')}</Text>
              <TouchableOpacity onPress={onPressSignUp}>
                <Text style={styles.signupLink}>{translate('signUp')}</Text>
              </TouchableOpacity>
            </View>

          </View>

          {/* Modals */}
          <ForgotPasswordModal
            id={userEmail}
            showForgotPasswordModal={showForgotPasswordModal}
            setShowForgotPasswordModal={setShowForgotPasswordModal}
            handleForgotPassword={undefined}
          />

          <OTPModal
            setShowOtpModal={setShowOtpModal}
            disabled={otp.length !== 6}
            showOtpModal={ShowOtpModal}
            setMobileOtp={setOtp}
            verifyOtp={() => onPressLogin(otp)}
            inputCount={6}
            sendID={userEmail}
          />

          <SecurityBottomSheet
            visible={showEnable}
            onEnable={handleEnable}
            onLater={handleDesable}
          />

          {/* Version Footer */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>{latestVersion.PackageName}</Text>
            <View style={styles.footerDot} />
            <Text style={styles.footerText}>v{latestVersion.currentversion}</Text>
          </View>

        </ScrollView>
      </LinearGradient>
    </KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
    minHeight: '100%',
    position: 'relative',
    overflow: 'hidden',
  },

  // Decorative background circles
  circleTopRight: {
    position: 'absolute',
    width: wScale(300),
    height: wScale(300),
    borderRadius: wScale(150),
    backgroundColor: 'rgba(108, 99, 255, 0.12)',
    top: -wScale(80),
    right: -wScale(80),
  },
  circleTopLeft: {
    position: 'absolute',
    width: wScale(200),
    height: wScale(200),
    borderRadius: wScale(100),
    backgroundColor: 'rgba(168, 85, 247, 0.10)',
    top: hScale(80),
    left: -wScale(60),
  },
  circleBottomLeft: {
    position: 'absolute',
    width: wScale(250),
    height: wScale(250),
    borderRadius: wScale(125),
    backgroundColor: 'rgba(108, 99, 255, 0.08)',
    bottom: -wScale(60),
    right: -wScale(40),
  },

  langRow: {
    paddingTop: hScale(16),
    paddingRight: wScale(20),
    alignItems: 'flex-end',
  },

  // Logo section
  logoBlock: {
    alignItems: 'center',
    marginTop: hScale(20),
    marginBottom: hScale(10),
  },
  logoGlass: {
    width: wScale(110),
    height: wScale(110),
    borderRadius: wScale(30),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    marginBottom: hScale(14),
  },
  logoImg: {
    width: '90%',
    height: '90%',
  },
  appName: {
    fontSize: wScale(22),
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: hScale(4),
  },
  tagline: {
    fontSize: wScale(14),
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '400',
  },

  // Glass card
  card: {
    marginHorizontal: wScale(24),
    marginTop: hScale(16),
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    padding: wScale(24),
    // subtle shadow
  },

  // Inputs
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: hScale(16),
    paddingHorizontal: wScale(14),
    height: hScale(54),
  },
  iconBox: {
    marginRight: wScale(10),
    opacity: 0.7,
  },
  textInput: {
    flex: 1,
    fontSize: wScale(15),
    color: '#FFFFFF',
    fontWeight: '500',
  },
  eyeBtn: {
    padding: wScale(4),
    opacity: 0.6,
  },

  // Options row
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hScale(24),
    marginTop: hScale(4),
  },
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: wScale(18),
    height: wScale(18),
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wScale(8),
  },
  checkboxActive: {
    // backgroundColor: colorConfig.primaryColor,
    // borderColor: colorConfig.primaryColor,
  },
  optionText: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: wScale(13),
    fontWeight: '500',
  },
  forgotText: {
    color: '#a78bfa',
    fontSize: wScale(13),
    fontWeight: '600',
  },

  // Login button
  loginBtn: {
    borderRadius: 50,
    paddingVertical: hScale(15),
    alignItems: 'center',
    justifyContent: 'center',

  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: wScale(17),
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: hScale(20),
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: wScale(13),
    paddingHorizontal: wScale(12),
    fontWeight: '500',
  },

  // Sign up row
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: wScale(14),
    marginRight: wScale(4),
  },
  signupLink: {
    color: '#a78bfa',
    fontSize: wScale(14),
    fontWeight: '700',
  },

  // Footer
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hScale(20),
    marginTop: hScale(8),
  },
  footerText: {
    fontSize: wScale(12),
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '500',
  },
  footerDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginHorizontal: wScale(8),
  },
});

export default LoginScreen;