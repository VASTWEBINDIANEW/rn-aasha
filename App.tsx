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
import { setUnlocked } from './src/reduxUtils/store/userInfoSlice';
import { PaperProvider } from 'react-native-paper';
import OtUpdate from 'react-native-ota-hot-update';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { AppState } from 'react-native';
import { FormProvider } from './src/features/RadiantApp/Radiantregister/NewForm/FormContext';
import { APP_URLS } from './src/utils/network/urls';
import OtaUpdateModal from './src/components/OtaUpdateModal';

const AppContent = () => {
  const toast = useToast();
  const dispatch = useDispatch();
// ── State add karo AppContent ke andar ──
const [otaProgress, setOtaProgress] = useState(0);
const [otaStatus, setOtaStatus] = useState<'idle' | 'downloading' | 'installing' | 'success' | 'failed'>('idle');
  const language = useSelector((state: any) => state.userInfo.appLanguage);
  const authToken = useSelector((state: any) => state.userInfo.authToken);
const formatted = APP_URLS.AppName.toLowerCase().replace(/\s+/g, '');

const VERSION_URL =
  `https://raw.githubusercontent.com/vastgangadhar-app/ota-bundles/main/${formatted}/version.json`;
  const appState = useRef(AppState.currentState);
console.log('OTA URL:', VERSION_URL);

  const checkOta = async () => {
    try {
      const res = await fetch(VERSION_URL + '?t=' + Date.now());
      const data = await res.json();

      const installed = Number(await OtUpdate.getCurrentVersion()) || 0;
      const latest = Number(data.version);

      console.log('Installed:', installed, 'Latest:', latest);

      if (!latest || isNaN(latest)) return;

      if (latest > installed  && data.status) {
        console.log('🚀 New OTA update found');
        startUpdate(data);
      } else {
        console.log('✅ Already latest version');
      }
    } catch (error) {
      console.log('OTA check failed', error);
    }
  };

  // ✅ START UPDATE
const startUpdate = async (data: any) => {
  setOtaStatus('downloading');
  setOtaProgress(0);


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
  setOtaStatus('installing');
},

        updateFail(error) {
          setOtaStatus('failed');
          // ❌ Version revert karo agar fail hua
          OtUpdate.setCurrentVersion(0);
          console.log('OTA Failed:', error);
        },

        progress(received, total) {
          if (total > 0) {
            const percent = Math.floor((received / total) * 100);
            setOtaProgress(percent);
          }
        },
      }
    );
  } catch (error) {
    setOtaStatus('idle');
    OtUpdate.setCurrentVersion(0);
    console.log('OTA error:', error);
  }
};

  // ✅ INITIAL + LOGIN CHANGE
  useEffect(() => {
    dispatch(setUnlocked(false));
  }, [language, authToken]);

  // ✅ APP RESUME CHECK
  // useEffect(() => {
  //     checkOta(); // ✅ App open hone pe bhi check karo

  //   const subscription = AppState.addEventListener('change', nextAppState => {
  //     if (
  //       appState.current.match(/inactive|background/) &&
  //       nextAppState === 'active'
  //     ) {
  //       console.log('🔄 App resumed → checking OTA');
  //       checkOta();
  //     }

  //     appState.current = nextAppState;
  //   });

  //   return () => subscription.remove();
  // }, []);

  return (
  <>
    <OtaUpdateModal status={otaStatus} progress={otaProgress} />
    <NavigationContainer
      key={language}
      ref={navigationRef}
      onReady={() => RNBootSplash.hide({ fade: true })}
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