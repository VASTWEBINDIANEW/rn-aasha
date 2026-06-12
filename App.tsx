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

const OTA_API_URL = 'http://native.payon4u.com/Common/api/data/Check_Android_Current_Version?vs_no=7';

const AppContent = () => {
  const toast = useToast();
  const dispatch = useDispatch();

  const [otaProgress, setOtaProgress] = useState(0);
  const [otaStatus, setOtaStatus] = useState<'idle' | 'downloading' | 'installing' | 'success' | 'failed'>('idle');
  const language = useSelector((state: any) => state.userInfo.appLanguage);
  const authToken = useSelector((state: any) => state.userInfo.authToken);
  const isUpdating = useRef(false);
  const appState = useRef(AppState.currentState);

  const checkOta = async () => {
    try {
      const res = await fetch(OTA_API_URL + '&t=' + Date.now());
      const data = await res.json();

      console.log('OTA API Response:', data);

      const latest = Number(data.otaVersion);
      const bundleUrl = data.bundleUrl;

      if (!latest || isNaN(latest) || !bundleUrl) {
        console.log('OTA data invalid');
        return;
      }

      const installed = Number(await OtUpdate.getCurrentVersion()) || 0;

      console.log('Installed OTA:', installed, 'Latest OTA:', latest);

      if (latest > installed) {
        console.log('🚀 New OTA update found');
        startUpdate({
          version: latest,
          bundle_url: bundleUrl,
        });
      } else {
        console.log('✅ Already latest OTA version');
      }
    } catch (error) {
      console.log('OTA check failed:', error);
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
    checkOta();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('🔄 App resumed → checking OTA');
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