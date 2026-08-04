import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './reduxUtils/store';
import useAxiosHook from './utils/network/AxiosClient';
import { APP_URLS } from './utils/network/urls';
import {
  setAllPermissionsGranted,
  setColorConfig,
  setDeviceInfo,
  setIsDemoUser,
  setLogoUrl,
  setNeedUpdate,
  setOnlyCmsuser,
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
// import PermissionScreen from './components/PermissionScreen';
import ShowLoader from './components/ShowLoder';
import NavigationService, { useNavigation } from './utils/navigation/NavigationService';

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
    allPermissionsGranted,
    isDemoUser: reduxIsDemoUser,
    onlyCmsUser
  } = useSelector((state: RootState) => state.userInfo);

  const [locationAllowed, setLocationAllowed] = useState(false);
  const [update, setUpdate] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [pkgmiss, setpkgmiss] = useState(false);
  const [pkg, setpkg] = useState('');
  const isDemo = reduxIsDemoUser || DemoConfig.demoNumbers.includes(loginId);

  // Firebase Init
  const firebaseConfig = {
    apiKey: "AIzaSyDi1-AFsoyO_m1F4u46KGnKm0sdksg7bUM",
    projectId: "aircharge-a725e",
    storageBucket: "aircharge-a725e.firebasestorage.app",
    messagingSenderId: "75934719883",
    appId: "1:75934719883:android:089d215326cac52117998e",
  };

  try { getApp(); } catch (e) { initializeApp(firebaseConfig, 'aircharge'); }

  // 🔥 Permission Check Effect — sirf initial check karta hai, request nahi karta
useEffect(() => {
  const checkPermissions = async () => {
    if (Platform.OS === 'android') {
      const galleryPermission =
        Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

      const camera = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA);
      const location = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
      const gallery = await PermissionsAndroid.check(galleryPermission);

      if (camera && location && gallery) {
        dispatch(setAllPermissionsGranted(true));
      } else {
        dispatch(setAllPermissionsGranted(false));
      }
    } else {
      // iOS ya dusre platform ke liye default true maan rahe hain abhi ke liye
      dispatch(setAllPermissionsGranted(true));
    }
  };

  checkPermissions();
}, []);

  // 🔑 FIX: Ab ye effect sirf tabhi aage badhega jab allPermissionsGranted true ho.
  // Isse initAppAndLocation() ka location request PermissionScreen ke requestMultiple()
  // ke saath race/conflict nahi karega.
  useEffect(() => {
    const init = async () => {
      await fetchAppData();

      // Permissions abhi granted nahi hain — PermissionScreen khud sab handle karega,
      // yahan se koi separate permission request mat chalao
      if (!allPermissionsGranted) {
        setIsLoading(false);
        return;
      }

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
        if (authToken && !isDemo && allPermissionsGranted) {
          checkGPSOnResume();
        }
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [authToken, allPermissionsGranted]); // 🔑 allPermissionsGranted dependency mein add kiya

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

  // 🔑 FIX: Ab yahan se dobara PermissionsAndroid.request() nahi chalta,
  // kyunki is function tak tabhi pahunchte hain jab allPermissionsGranted
  // already true ho chuka hai (PermissionScreen se). Sirf GPS enabled hai
  // ya nahi wo check karke device info fetch karta hai.
  const initAppAndLocation = async () => {
    try {
      const isEnabled = await LocationModule.isLocationEnabled();

      if (!isEnabled) {
        const status = await LocationModule.requestGPSEnabling();

        if (status !== "ENABLED") {
          Alert.alert(
            translate('Location Required'),
            translate('Please enable GPS to continue.'),
            [
              {
                text: 'Retry',
                onPress: () => initAppAndLocation(),
              }
            ]
          );
          return;
        }
      }

      fetchDeviceInfo(false);
    } catch (e) {
      console.log('GPS Check Error', e);
      fetchDeviceInfo(false);
    }
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

   const navigation = useNavigation();
  const appState1 = useRef(AppState.currentState);
  const fetchdata = async () => {
    try {
      const url = APP_URLS.getUserInfo;
      console.log('🌐 API URL:', url);
      const res = await get({ url });
      console.log('✅ RESPONSE:', res);
      if (res?.data?.CMSUSER === true) {
        dispatch(setOnlyCmsuser(true));
      } else {
        dispatch(setOnlyCmsuser(false));
      }
    } catch (error) {
      console.log('❌ ERROR:', error);
    }
  };
  useEffect(() => {
    // 1. Screen Focus Listener
    const unsubscribeFocus = navigation.addListener('focus', () => {
      console.log('📲 Screen Focus → API Call');
      fetchdata();
    });
    // 2. Background → Foreground Listener
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState1.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('🔄 App foreground me aayi → API Call');
        fetchdata();
      }
      appState1.current = nextAppState;
    });
    return () => {
      unsubscribeFocus();
      subscription.remove();
    };
  }, [navigation]);
  useEffect(() => {
    if (authToken) {
      if (onlyCmsUser) {
        NavigationService.reset('CmsScreen');
      } else {
        NavigationService.reset('DashboardScreen');
      }
    }
  }, [onlyCmsUser]);
  const renderMainContent = () => {
    if (connectionLost) {
      return <ConnectionLost onRetry={() => console.log('retry')} />;
    }

    if (!update) {
      return <Updatebox isVer={undefined} loading={undefined} isplay={false} />;
    }

    if (allPermissionsGranted === false) {
      return (
        <PermissionScreen
          onSuccess={(status: boolean) =>
            dispatch(setAllPermissionsGranted(status))
          }
        />
      );
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

export default AppContainer;