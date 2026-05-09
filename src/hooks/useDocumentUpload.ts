import { useState, useRef } from 'react';
import { Alert, PermissionsAndroid, Platform, ToastAndroid } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { check, PERMISSIONS, RESULTS, openSettings, requestMultiple, request } from 'react-native-permissions';

export const useDocumentUpload = () => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [currentPreviewImage, setCurrentPreviewImage] = useState('');
  const currentPreviewImageRef = useRef<string>(''); // ✅ Ref for latest value
  const [currentDocumentType, setCurrentDocumentType] = useState('');

  const getDocumentName = (documentType: string) => {
    switch (documentType) {
      case 'slip': return 'Slip Upload';
      default: return 'Document';
    }
  };


const openImagePicker = async (
  type: 'camera' | 'gallery',
  documentType: string,
  onSuccess: (base64Image: string) => void
) => {
  try {
    if (Platform.OS === 'android') {
      const apiLevel = parseInt(Platform.Version.toString(), 10);
      const cameraStatus = await check(PERMISSIONS.ANDROID.CAMERA);

      if (cameraStatus === RESULTS.BLOCKED) {
        Alert.alert(
          'Permission Required',
          'Please allow camera access from settings',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => openSettings().catch(() => {}) },
          ]
        );
        return;
      }

      if (cameraStatus !== RESULTS.GRANTED) {
        if (apiLevel < 33) {
          // ✅ Android 12 aur below
          const results = await requestMultiple([
            PERMISSIONS.ANDROID.CAMERA,
            PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
          ]);
          const denied = Object.values(results).some(s => s !== RESULTS.GRANTED);
          if (denied) {
            ToastAndroid.show('Permissions denied', ToastAndroid.SHORT);
            return;
          }
        } else {
          // ✅ Android 13+ — sirf camera
          const result = await request(PERMISSIONS.ANDROID.CAMERA);
          if (result !== RESULTS.GRANTED) {
            ToastAndroid.show('Camera permission denied', ToastAndroid.SHORT);
            return;
          }
        }
      }
    }

    const options = {
      mediaType: 'photo' as const,
      quality: 0.5,
      maxWidth: 1000,
      maxHeight: 1000,
      includeBase64: true,
      saveToPhotos: false,  // ✅ Add kiya
    };

    const callback = (response: any) => {
      const asset = response?.assets?.[0];
      if (!asset) return;

      const base64String = `data:${asset.type};base64,${asset.base64}`;
      const fileSize = Math.round((base64String.length * 3) / 4);
      if (fileSize > 500 * 1024) {
        ToastAndroid.show('Image exceeds 500KB', ToastAndroid.LONG);
        return;
      }
      currentPreviewImageRef.current = base64String;
      setCurrentPreviewImage(base64String);
      onSuccess(base64String);
      ToastAndroid.show(`${getDocumentName(documentType)} uploaded successfully`, ToastAndroid.SHORT);
    };

    type === 'camera'
      ? launchCamera(options, callback)
      : launchImageLibrary(options, callback);

  } catch (err) {
    console.error(err);
    ToastAndroid.show('Failed to open picker', ToastAndroid.SHORT);
  }
};
  const handleImageSelection = (documentType: string, onSuccess: (base64Image: string) => void) => {
    Alert.alert(
      `Upload ${getDocumentName(documentType)}`,
      'Choose an option (Max 500KB)',
      [
        {
          text: 'Camera', onPress: () => openImagePicker('camera', documentType, onSuccess),
        },
        {
          text: 'Gallery', onPress: () => openImagePicker('gallery', documentType, onSuccess),
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return {
    previewVisible,
    setPreviewVisible,
    currentPreviewImage,
    setCurrentPreviewImage,
    currentPreviewImageRef,
    currentDocumentType,
    setCurrentDocumentType,
    handleImageSelection,
  };
};
