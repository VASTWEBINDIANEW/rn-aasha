// src/screens/common/CameraScreen.tsx
import React, { useRef, useState, useCallback } from 'react';
import {
  View, StyleSheet, TouchableOpacity, Text,
  StatusBar, Alert,
} from 'react-native';
import {
  Camera, useCameraDevice, useCameraPermission,
} from 'react-native-vision-camera';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { hScale, wScale } from '../utils/styles/dimensions';

type CameraScreenParams = {
  CameraScreen: {
    /** Unique key — calling screen uses this to read result from navigation params */
    callbackKey: string;
    title?: string;
  };
};

const CameraScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<CameraScreenParams, 'CameraScreen'>>();
  const { callbackKey, title = 'Take Photo' } = route.params;

  const { hasPermission, requestPermission } = useCameraPermission();
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);
  const [isTaking, setIsTaking] = useState(false);

  // Ask permission on mount if needed
  React.useEffect(() => {
    if (!hasPermission) requestPermission();
  }, [hasPermission, requestPermission]);

  const takePhoto = useCallback(async () => {
    if (!camera.current || isTaking) return;
    setIsTaking(true);
    try {
      const photo = await camera.current.takePhoto({
        flash: 'off',
      });

      // Convert to base64
      const RNFS = require('react-native-fs');
      const base64 = await RNFS.readFile(photo.path, 'base64');

      // Return result to calling screen via navigation params
      navigation.navigate({
        name: route.params?.callbackKey ?? 'Profile', // go back to caller
        params: { [`${callbackKey}_result`]: base64 },
        merge: true,
      } as any);

    } catch (err: any) {
      Alert.alert('Error', 'Photo lene mein problem aayi: ' + err.message);
      navigation.goBack();
    } finally {
      setIsTaking(false);
    }
  }, [camera, isTaking, callbackKey, navigation]);

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text style={styles.permText}>Camera permission chahiye</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permBtn}>
          <Text style={styles.permBtnText}>Permission Do</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <Text style={styles.permText}>Camera device nahi mila</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.titleText}>{title}</Text>
        <View style={{ width: wScale(40) }} />
      </View>

      {/* Capture button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={takePhoto}
          disabled={isTaking}
          style={[styles.captureBtn, isTaking && styles.captureBtnDisabled]}
          activeOpacity={0.8}
        >
          <View style={styles.captureInner} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
  permText: { color: '#fff', fontSize: wScale(16), marginBottom: hScale(16) },
  permBtn: {
    backgroundColor: '#3b82f6', paddingHorizontal: wScale(24),
    paddingVertical: hScale(12), borderRadius: wScale(8),
  },
  permBtnText: { color: '#fff', fontWeight: '700', fontSize: wScale(15) },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: hScale(48), paddingHorizontal: wScale(16), paddingBottom: hScale(12),
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  backBtn: { width: wScale(40), height: wScale(40), justifyContent: 'center', alignItems: 'center' },
  backText: { color: '#fff', fontSize: wScale(20), fontWeight: '700' },
  titleText: { color: '#fff', fontSize: wScale(16), fontWeight: '600' },
  bottomBar: {
    position: 'absolute', bottom: hScale(48), left: 0, right: 0,
    alignItems: 'center',
  },
  captureBtn: {
    width: wScale(76), height: wScale(76), borderRadius: wScale(38),
    backgroundColor: 'rgba(255,255,255,0.35)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 3, borderColor: '#fff',
  },
  captureBtnDisabled: { opacity: 0.5 },
  captureInner: {
    width: wScale(58), height: wScale(58),
    borderRadius: wScale(29), backgroundColor: '#fff',
  },
});

export default CameraScreen;