/* eslint-disable @typescript-eslint/no-unused-vars */
import 'react-native-gesture-handler';
import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ToastProvider, useToast } from 'react-native-toast-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import 'react-native-reanimated';
import { store, persistor } from './src/reduxUtils/store';
import RNBootSplash from 'react-native-bootsplash';
import { AppContainer } from './src/AppContainer';
import { navigationRef } from './src/utils/navigation/NavigationService';
import { clearOtaUpdate, setOtaUpdate, setUnlocked } from './src/reduxUtils/store/userInfoSlice';
import { PaperProvider } from 'react-native-paper';
import OtUpdate from 'react-native-ota-hot-update';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { Alert, AppState, Linking } from 'react-native';
import { FormProvider } from './src/features/RadiantApp/Radiantregister/NewForm/FormContext';
import { APP_URLS } from './src/utils/network/urls';
import OtaUpdateModal from './src/components/OtaUpdateModal';
import firestore from '@react-native-firebase/firestore';
import useAxiosHook from './src/utils/network/AxiosClient';

// ─── Ab kisi bhi screen pe update turant chalu ho jayega ────────────────────
// (pehle sirf DashboardScreen ka wait karta tha, ab zaroorat nahi)

const AppContent = () => {
  const toast = useToast();
  const dispatch = useDispatch();
  const [otaProgress, setOtaProgress] = useState(0);
  const [otaStatus, setOtaStatus] = useState<'idle' | 'downloading' | 'installing' | 'success' | 'failed'>('idle');
  const language = useSelector((state: any) => state.userInfo.appLanguage);
  const authToken = useSelector((state: any) => state.userInfo.authToken);
  const formatted = APP_URLS.AppName.toLowerCase().replace(/\s+/g, '');
  const isUpdating = useRef(false);
  const toastIdRef = useRef<string | number | null>(null);
  const appState = useRef(AppState.currentState);
  const { get } = useAxiosHook();
  const fetchOtaDetails = async () => {
    try {
      const version = await get({ url: APP_URLS.current_version });
      console.log(version);

      return {
        version: version.otaVersion,
        url: version.bundleUrl,
        status: true, // true/false
        currentVersion: version.currentversion,
        message: version.message,
      };
    } catch (error) {
      console.log('Firestore Error:', error);
      return null;
    }
  };

  const checkOta = async (isResume = false) => {
    try {
      const data = await fetchOtaDetails();
      console.log('OTA Check Result:', data);
      if (!data) return;

      const installed = Number(await OtUpdate.getCurrentVersion()) || 0;
      const latest = Number(data.version) || 0;

      console.log('Installed:', installed, 'Latest:', latest, 'isResume:', isResume);

      if (!latest || isNaN(latest)) return;

      if (latest > installed && data.status === true && data.url) {
        dispatch(setOtaUpdate(latest));

        // ✅ Turant update start hoga, koi screen wait nahi karega
        startUpdate({
          version: latest,
          bundle_url: data.url,
        });
      } else {
        console.log('✅ Already on latest version');
        dispatch(clearOtaUpdate());
      }
    } catch (error) {
      console.log('OTA Check Failed:', error);
    }
  };

  const startUpdate = async (data: any) => {
    if (isUpdating.current) {
      console.log('OTA already running');
      return;
    }

    isUpdating.current = true;

    setOtaStatus('downloading');
    setOtaProgress(0);

    // ✅ Non-blocking toast banner — jis screen pe bhi user ho, wahin dikhega
   

    try {
      await OtUpdate.downloadBundleUri(
        ReactNativeBlobUtil,
        data.bundle_url,
        Number(data.version),
        {
          restartAfterInstall: true,
          restartDelay: 1500,
          notification: false,
          useDownloadManager: false,

          updateSuccess() {
            console.log('✅ OTA Updated:', data.version);
            setOtaStatus('success');
            dispatch(clearOtaUpdate());

      
          },

          updateFail(error) {
            console.log('❌ OTA Failed:', error);
            setOtaStatus('failed');
          },

          progress(received, total) {
            if (total > 0) {
              const percent = Math.floor((received / total) * 100);
              setOtaProgress(percent);

              // Toast message me progress % bhi dikha dete hain
           
            }
          },
        }
      );
    } catch (e: any) {
      setOtaStatus('failed');

   

      const errorText = `
      OTA Update Exception Traced
      
      Message: ${e?.message || "N/A"}
      Code: ${e?.code || "N/A"}
      
      Stack Trace:
      ${e?.stack || "N/A"}
      
      Full Log JSON:
      ${JSON.stringify(e, null, 2)}
      `;

      Alert.alert(
        "OTA Update Error Triggered",
        "Something went wrong while processing the update file.",
        [
          {
            text: "Share Report via WhatsApp",
            onPress: async () => {
              const phone = "917414088555";
              const url = `https://wa.me/${phone}?text=${encodeURIComponent(errorText)}`;
              try {
                await Linking.openURL(url);
              } catch (err) {
                Alert.alert("Error", "WhatsApp is not installed on this device.");
              }
            },
          },
          {
            text: "Cancel",
            style: "cancel",
          },
        ]
      );
    } finally {
      isUpdating.current = false;
    }
  };

  useEffect(() => {
    dispatch(setUnlocked(false));
  }, [language, authToken]);

  // ✅ APP RESUME CHECK
  useEffect(() => {
    // ✅ App pehli baar open — check karo, milte hi turant update start ho jayega
    checkOta(false);

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('🔄 App resumed → checking OTA again');
        checkOta(true);
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  return (
    <>
      <OtaUpdateModal status={otaStatus} progress={otaProgress} />
      <NavigationContainer
        key={language}
        ref={navigationRef}
        onReady={() => {
          RNBootSplash.hide({ fade: true });
        }}
      >
        <AppContainer />
      </NavigationContainer>
    </>
  );
};

function App() {
  useEffect(() => {
    if (__DEV__) {
      console.log('--- SYSTEM CHECK ---');
      console.log('Fabric:', global?.nativeFabricUIManager != null);
      console.log('Bridgeless:', global?.RN$Bridgeless === true);
      console.log('Hermes:', !!global?.HermesInternal);
      console.log('--------------------');
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <ToastProvider>
            <Provider store={store}>
              <PaperProvider>
                <PersistGate loading={null} persistor={persistor}>

                  <FormProvider>
                    <AppContent />
                  </FormProvider>

                </PersistGate>
              </PaperProvider>
            </Provider>
          </ToastProvider>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;