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
import OtaUpdateModal from './src/components/OtaUpdateModal';
import useAxiosHook from './src/utils/network/AxiosClient';
import { APP_URLS } from './src/utils/network/urls';

const AppContent = () => {
  const toast = useToast();
  const dispatch = useDispatch();
  const { get } = useAxiosHook();

  const [otaProgress, setOtaProgress] = useState(0);
  const [otaStatus, setOtaStatus] = useState<
    'idle' | 'downloading' | 'installing' | 'success' | 'failed'
  >('idle');
  const language = useSelector((state: any) => state.userInfo.appLanguage);
  const authToken = useSelector((state: any) => state.userInfo.authToken);
  const isUpdating = useRef(false);
  const appState = useRef(AppState.currentState);

  const fetchOtaDetails = async () => {
    try {
      const version = await get({ url: APP_URLS.current_version });
      console.log('OTA API Response:', version);

      return {
        version: version.otaVersion,
        url: version.bundleUrl,
        status: version.isgoogle, // true = update allowed
        currentVersion: version.currentversion,
        message: version.message,
      };
    } catch (error) {
      console.log('OTA Fetch Error:', error);
      return null;
    }
  };

  const checkOta = async () => {
    try {
      const data = await fetchOtaDetails();
      console.log('OTA Data:', data);

      if (!data) {
        return;
      }

      const installed = Number(await OtUpdate.getCurrentVersion()) || 0;
      const latest = Number(data.version);

      console.log('Installed Version:', installed);
      console.log('Latest Version:', latest);
      console.log('Bundle URL:', data.url);

      if (!latest || isNaN(latest)) {
        return;
      }

      if (latest > installed && data.status === true && data.url) {
        console.log('🚀 New OTA update found');
        startUpdate({ version: latest, bundle_url: data.url });
      } else {
        console.log('✅ Already on latest version');
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
          },

          updateFail(error: any) {
            console.log('❌ OTA Failed:', error);
            setOtaStatus('failed');
            toast.show('Update Failed', { type: 'danger' });
          },

          progress(received: number, total: number) {
            if (total > 0) {
              const percent = Math.floor((received / total) * 100);
              setOtaProgress(percent);
              console.log(`Download: ${percent}%`);
            }
          },
        }
      );
    } catch (error) {
      console.log('OTA error:', error);
      setOtaStatus('failed');
    } finally {
      isUpdating.current = false;
    }
  };

  useEffect(() => {
    dispatch(setUnlocked(false));
  }, [language, authToken]);

  useEffect(() => {
    console.log('🚀 App Started → checking OTA');
    checkOta();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('🔄 App Resumed → checking OTA');
        checkOta();
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