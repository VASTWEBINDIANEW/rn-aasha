import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './reduxUtils/store';
import useAxiosHook from './utils/network/AxiosClient';
import { APP_URLS } from './utils/network/urls';
import {
  setColorConfig,
  setDeviceInfo,
  setIsDemoUser,
  setLogoUrl,
  setNeedUpdate,
  setVersionData
} from './reduxUtils/store/userInfoSlice';
import registerNotification from './utils/NotificationService';
import { getApp, initializeApp } from '@react-native-firebase/app';
import {
  Alert,
  NativeModules,
  PermissionsAndroid,
  Platform,
  View,
  Text,
  AppState,
  ActivityIndicator
} from 'react-native';
import DeviceInfo, {
  getBrand,
  getBuildId,
  getCarrier,
  getIpAddress,
  getModel,
  getSystemVersion,
  getUniqueId
} from 'react-native-device-info';

// Navigation & Components
import { AuthNavigator } from './utils/navigation/AuthNavigator';
import { DealerNavigator } from './utils/navigation/DealerNavigator';
import AppNavigator from './utils/navigation/AppNavigator';
import Updatebox from './features/dashboard/components/Update';
import SafeWrapper from './components/SafeWrapper';
import { DemoConfig } from './features/login/DemouserData';
import BiometricAuth from './components/BiometricAuth';
import NetInfo from '@react-native-community/netinfo';
import ConnectionLost from './components/ConnectionLost';
import { translate } from './utils/languageUtils/I18n';
import BlockedMessageAnimated from './features/dashboard/components/Pkgmiss';
import firestore from '@react-native-firebase/firestore';
import PermissionScreen from './components/PermissionScreen';
import ShowLoader from './components/ShowLoder';

export const AppContainer = () => {
  const { LocationModule } = NativeModules;
  const dispatch = useDispatch();
  const { get, post } = useAxiosHook();
  const appState = useRef(AppState.currentState);

  const {
    authToken,
    versionData,
    IsDealer,
    loginId,
    isFingerprintEnabled,
    unLocked,
    isDemoUser: reduxIsDemoUser
  } = useSelector((state: RootState) => state.userInfo);

  const [locationAllowed, setLocationAllowed] = useState(false);
  const [update, setUpdate] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [pkgmiss, setpkgmiss] = useState(false);
  const [pkg, setpkg] = useState('');
  const isDemo = reduxIsDemoUser || DemoConfig.demoNumbers.includes(loginId);
  
  // 🔥 Naya State Permissions ke liye (null matlab abhi check ho raha hai)
  const [allPermissionsGranted, setAllPermissionsGranted] = useState<boolean | null>(null);

  // Firebase Init
  const firebaseConfig = {
    apiKey: "AIzaSyDi1-AFsoyO_m1F4u46KGnKm0sdksg7bUM",
    projectId: "aircharge-a725e",
    storageBucket: "aircharge-a725e.firebasestorage.app",
    messagingSenderId: "75934719883",
    appId: "1:75934719883:android:089d215326cac52117998e",
  };

  try { getApp(); } catch (e) { initializeApp(firebaseConfig, 'aircharge'); }

  // 🔥 Permission Check Effect
  useEffect(() => {
    const checkPermissions = async () => {
      if (Platform.OS === 'android') {
        const camera = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
        const location = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        const mic = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);

        if (camera && location && mic) {
          setAllPermissionsGranted(true);
        } else {
          setAllPermissionsGranted(false);
        }
      } else {
        // iOS ya dusre platform ke liye default true maan rahe hain abhi ke liye
        setAllPermissionsGranted(true); 
      }
    };

    checkPermissions();
  }, []);

  useEffect(() => {
    const init = async () => {
      await fetchAppData();

      if (authToken) {
        if (isDemo) {
          setLocationAllowed(true);
          fetchDeviceInfo(true);
        } else {
          initAppAndLocation();
        }
      } else {
        setIsLoading(false);
      }
    };

    init();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        if (authToken && !isDemo) {
          checkGPSOnResume();
        }
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [authToken]);

  const checkGPSOnResume = async () => {
    try {
      const isEnabled = await LocationModule.isLocationEnabled();

      if (!isEnabled) {
        setLocationAllowed(false);
        const status = await LocationModule.requestGPSEnabling();

        if (status === "ENABLED") {
          fetchDeviceInfo(false);
        } else {
          setTimeout(() => {
            checkGPSOnResume();
          }, 2000);
        }
      } else {
        fetchDeviceInfo(false);
      }
    } catch (e) {
      console.log("Resume Error", e);
    }
  };

  const [allowed, setAllowed] = useState(null);

  useEffect(() => {
    const subscriber = firestore()
      .collection('appAccess')
      .doc('appAccess')
      .onSnapshot(
        documentSnapshot => {
          try {
            if (documentSnapshot?.exists) {
              const data = documentSnapshot.data();
              const status = data?.isAllowed ?? false;
              setAllowed(status);
            } else {
              setAllowed(false);
            }
          } catch (error) {
            setAllowed(false);
          }
        },
        error => setAllowed(false)
      );

    return () => subscriber();
  }, []);

  const initAppAndLocation = async () => {
    let granted = false;

    if (Platform.OS === 'android') {
      const result = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      granted = result === PermissionsAndroid.RESULTS.GRANTED;
    } else {
      granted = true;
    }

    if (!granted) {
      Alert.alert(
        translate('Location Required'),
        translate('Please allow location to continue.'),
        [
          {
            text: 'Retry',
            onPress: () => initAppAndLocation(),
          }
        ]
      );
      return;
    }

    fetchDeviceInfo(false);
  };

  const fetchDeviceInfo = async (skipLocation: boolean) => {
    try {
      const buildId = await getBuildId();
      const ip = await getIpAddress();
      const bundleId = DeviceInfo.getBundleId();

      setpkg(bundleId);
      
      let locData = {
        latitude: '0',
        longitude: '0',
        address: '',
        city: '',
        postalCode: ''
      };

      if (!skipLocation) {
        try {
          const isEnabled = await LocationModule.isLocationEnabled();

          if (!isEnabled) {
            const status = await LocationModule.requestGPSEnabling();
            if (status !== "ENABLED") {
              setLocationAllowed(false);
              return;
            }
          }

          const loc = await LocationModule.getCurrentLocation();
          locData = loc;
          setLocationAllowed(true);
        } catch (e) {
          const status = await LocationModule.requestGPSEnabling();
          if (status === "ENABLED") {
            fetchDeviceInfo(false);
            return;
          }
        }
      }

      dispatch(setDeviceInfo({
        brand: getBrand(),
        ipAddress: ip,
        modelNumber: getModel(),
        uniqueId: await getUniqueId(),
        androidVersion: getSystemVersion(),
        buildId,
        net: (await getCarrier()) || 'wifi/net',
        ...locData,
        packageName: bundleId,
      }));
    } catch (err) {
      console.log("Device Info Error", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAppData = async () => {
    try {
      const res = await get({ url: APP_URLS.getColors });
      if (res) {
        dispatch(setColorConfig({
          primaryColor: res.BACKGROUNDCOLOR1,
          secondaryColor: res.BACKGROUNDCOLOR2,
          primaryButtonColor: res.BUTTONCOLOR1,
          secondaryButtonColor: res.BUTTONCOLOR2,
          labelColor: res.LABLECOLOR,
        }));
      }
      
      const version = await get({ url: APP_URLS.current_version });
      
      if (version) {
        dispatch(setLogoUrl(version.Logo));
        dispatch(setVersionData(version));

        const isUpToDate = APP_URLS.version === version.currentversion;
        setUpdate(isUpToDate);
      }

      const bundleId = DeviceInfo.getBundleId(); 

      if (version?.PackageName) {
        const mismatch = bundleId !== version.PackageName;
        setpkgmiss(mismatch);
      }
      registerNotification();
    } catch (e) { 
      console.log('❌ API Error', e); 
    }
  };

  const [connectionLost, setConnectionLost] = useState(false);
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isDisconnected = !state.isConnected;
      setConnectionLost(prev => prev === isDisconnected ? prev : isDisconnected);
    });

    return () => unsubscribe();
  }, []);

  // --- RENDER LOGIC (Priority Based) --- 
  const renderMainContent = () => {
    // 1. Agar abhi permission check ho rahi hai
    // if (allPermissionsGranted === null) {
    //   return (
    //     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    //    <ShowLoader/>
    //     </View>
    //   );
    // }

    // 2. Agar ek bhi permission baaki hai toh yeh screen dikhao
    if (allPermissionsGranted === false) {
      return (
        <PermissionScreen 
          onSuccess={(status: boolean) => setAllPermissionsGranted(status)} 
        />
      );
    }

    // 3. Baaki ka pura normal flow
    if (connectionLost) {
      return <ConnectionLost onRetry={() => console.log('retry')} />;
    }

    if (!update) {
      return <Updatebox isVer={undefined} loading={undefined} isplay={false} />;
    }

    if (!authToken) {
      return <AuthNavigator />;
    }

    if (isFingerprintEnabled && !unLocked) {
      return <BiometricAuth />;
    }

    return IsDealer ? <DealerNavigator /> : <AppNavigator />;
  };

  return (
    <SafeWrapper>
      {renderMainContent()}
    </SafeWrapper>
  );
};