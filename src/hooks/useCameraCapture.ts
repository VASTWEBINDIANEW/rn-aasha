// src/hooks/useCameraCapture.ts
import { useCallback } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { check, request, PERMISSIONS, RESULTS, openSettings } from 'react-native-permissions';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { translate } from '../utils/languageUtils/I18n';
import { launchImageLibrary } from 'react-native-image-picker';
import { Alert } from 'react-native';

interface UseCameraCaptureOptions {
  /** Screen name jahan result return hoga (apna screen naam) */
  callerScreenName: string;
  /** Unique key for this capture session */
  captureKey: string;
  /** Callback when base64 image mil jaaye */
  onCapture: (base64: string, key: string) => void;
}

export const useCameraCapture = ({
  callerScreenName,
  captureKey,
  onCapture,
}: UseCameraCaptureOptions) => {
  const navigation = useNavigation<any>();

  // ── Check + navigate to CameraScreen ──────────────────────────────────────
  const openCamera = useCallback(
    async (key: string = captureKey, title?: string) => {
      try {
        const status = await check(PERMISSIONS.ANDROID.CAMERA);

        if (status === RESULTS.BLOCKED) {
          Dialog.show({
            type: ALERT_TYPE.WARNING,
            title: translate('Permission Required'),
            textBody: translate('key_pleasegra_85'),
            button: translate('OK'),
            onPressButton: () => {
              Dialog.hide();
              openSettings().catch(() => {});
            },
          });
          return;
        }

        if (status !== RESULTS.GRANTED) {
          const result = await request(PERMISSIONS.ANDROID.CAMERA);
          if (result !== RESULTS.GRANTED) return;
        }

        // ✅ Navigate to shared CameraScreen
        navigation.navigate('CameraScreen', {
          callbackKey: callerScreenName,
          title: title ?? 'Photo Lo',
          captureKey: key,
        });
      } catch (_) {}
    },
    [navigation, callerScreenName, captureKey],
  );

  // ── Gallery picker ────────────────────────────────────────────────────────
  const openGallery = useCallback(
    (key: string = captureKey) => {
      launchImageLibrary(
        { selectionLimit: 1, mediaType: 'photo', includeBase64: true },
        (response) => {
          const b64 = response?.assets?.[0]?.base64;
          if (b64) onCapture(b64, key);
        },
      );
    },
    [onCapture, captureKey],
  );

  // ── Show Alert with Camera / Gallery options ───────────────────────────────
  const showPickerAlert = useCallback(
    (key: string = captureKey, title?: string) => {
      Alert.alert(
        title ?? 'Photo Upload',
        translate('Choose Options For Upload'),
        [
          { text: translate('Cancel'), style: 'cancel' },
          { text: translate('Camera'), onPress: () => openCamera(key, title) },
          { text: translate('Gallery'), onPress: () => openGallery(key) },
        ],
        { cancelable: false },
      );
    },
    [openCamera, openGallery, captureKey],
  );

  // ── Read result from navigation params (call in useFocusEffect) ───────────
  const readCaptureResult = useCallback(
    (routeParams: any) => {
      const key = `${captureKey}_result`;
      const b64 = routeParams?.[key];
      if (b64) {
        onCapture(b64, captureKey);
      }
    },
    [captureKey, onCapture],
  );

  return { openCamera, openGallery, showPickerAlert, readCaptureResult };
};