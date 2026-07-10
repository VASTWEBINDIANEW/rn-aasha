import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  PermissionsAndroid,
  Linking,
  Alert,
  ScrollView,
  SafeAreaView,
  Platform,
  InteractionManager,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../reduxUtils/store';

// 🔄 'mic' ko hata kar 'gallery' add kiya
type PermissionKey = 'camera' | 'location' | 'gallery' | 'microphone';

interface PermissionItem {
  key: PermissionKey;
  label: string;
  description: string;
  androidPermission: string;
  icon: string;
}

// 📱 Android version ke hisab se sahi Gallery permission select karne ke liye helper function
const getGalleryPermission = () => {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    return PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES;
  }
  return PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
};

const PERMISSIONS_LIST: PermissionItem[] = [
  {
    key: 'camera',
    label: 'Camera',
    description: 'Required for KYC and document upload.',
    androidPermission: PermissionsAndroid.PERMISSIONS.CAMERA,
    icon: '📸',
  },
  {
    key: 'location',
    label: 'Location',
    description: 'Required for secure recharge & transaction verification.',
    androidPermission: PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    icon: '📍',
  },
  {
    key: 'gallery',
    label: 'Gallery / Photos',
    description: 'Required to upload existing documents or photos from your gallery.',
    androidPermission: getGalleryPermission(),
    icon: '🖼️',
  },
  {
    key: 'microphone',
    label: 'Microphone',
    description: 'Required for voice recording and audio features.',
    androidPermission: PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    icon: '🎤',
  },
];

type PermissionStatus = 'unchecked' | 'granted' | 'denied' | 'blocked';

// 🔄 Ab permissions optional hain — screen kabhi bhi "Continue" se aage badh sakti hai,
// chahe koi bhi permission granted ho ya na ho.
const PermissionScreen = ({ onSuccess }: any) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  const [statuses, setStatuses] = useState<Record<PermissionKey, PermissionStatus>>({
    camera: 'unchecked',
    location: 'unchecked',
    gallery: 'unchecked',
    microphone: 'unchecked', // 🔄 pehle missing tha, isliye allGranted kabhi true nahi hota tha
  });

  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (hasStartedRef.current) {
      console.log('⏭️ Auto-request already ran once, skipping duplicate run');
      return;
    }
    hasStartedRef.current = true;

    const interactionHandle = InteractionManager.runAfterInteractions(() => {
      autoRequestAllPermissions();
    });

    return () => interactionHandle.cancel();
  }, []);

  const autoRequestAllPermissions = async () => {
    if (Platform.OS !== 'android') {
      console.log('⚠️ iOS detected — skipping Android auto-request logic');
      return;
    }

    console.log('🚀 Starting auto permission request flow...');

    const alreadyGrantedMap: Record<string, boolean> = {};
    for (const item of PERMISSIONS_LIST) {
      const granted = await PermissionsAndroid.check(item.androidPermission as any);
      alreadyGrantedMap[item.key] = granted;
      console.log(`🔍 ${item.label}: already granted = ${granted}`);
    }

    setStatuses(prev => {
      const updated = { ...prev };
      PERMISSIONS_LIST.forEach(item => {
        if (alreadyGrantedMap[item.key]) {
          updated[item.key] = 'granted';
        }
      });
      return updated;
    });

    const permissionsToRequest = PERMISSIONS_LIST
      .filter(item => !alreadyGrantedMap[item.key])
      .map(item => item.androidPermission);

    if (permissionsToRequest.length === 0) {
      console.log('✅ Sab permissions pehle se hi granted the');
      return;
    }

    console.log('📋 Requesting:', permissionsToRequest);

    try {
      const results = await PermissionsAndroid.requestMultiple(permissionsToRequest as any);
      console.log('📥 requestMultiple results:', results);

      setStatuses(prev => {
        const updated = { ...prev };
        PERMISSIONS_LIST.forEach(item => {
          const result = results[item.androidPermission];
          if (result) {
            updated[item.key] =
              result === PermissionsAndroid.RESULTS.GRANTED
                ? 'granted'
                : result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
                ? 'blocked'
                : 'denied';
          }
        });
        return updated;
      });

      setTimeout(async () => {
        for (const item of PERMISSIONS_LIST) {
          const isGranted = await PermissionsAndroid.check(item.androidPermission as any);
          setStatuses(prev => {
            if (isGranted && prev[item.key] !== 'granted') {
              console.log(`🔄 Late-detected grant for ${item.label}`);
              return { ...prev, [item.key]: 'granted' };
            }
            return prev;
          });
        }
      }, 500);
    } catch (err) {
      console.warn('❌ requestMultiple error:', err);
    }
  };

  const handleCardPress = async (item: PermissionItem) => {
    const currentStatus = statuses[item.key];

    if (currentStatus === 'granted') return;

    if (currentStatus === 'blocked') {
      showSettingsAlert(item.label);
      return;
    }

    try {
      const result = await PermissionsAndroid.request(item.androidPermission as any);

      setStatuses(prev => ({
        ...prev,
        [item.key]:
          result === PermissionsAndroid.RESULTS.GRANTED
            ? 'granted'
            : result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN
            ? 'blocked'
            : 'denied',
      }));
    } catch (err) {
      console.warn('Manual request error:', err);
    }
  };

  const showSettingsAlert = (permissionLabel: string) => {
    Alert.alert(
      `${permissionLabel} Permission Blocked`,
      `You've permanently denied this permission. Please enable it manually from Settings.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ],
    );
  };

  // 🔄 Continue button hamesha available — ye kisi permission status pe depend nahi karta
  const handleContinue = () => {
    if (onSuccess) onSuccess(true);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colorConfig.primaryColor }]}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>App Permissions</Text>
        <Text style={styles.subtitle}>
          These permissions help us give you the best experience, but they're optional —
          you can continue without granting them.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {PERMISSIONS_LIST.map(item => {
          const status = statuses[item.key];
          const isGranted = status === 'granted';
          const isRed = status === 'denied' || status === 'blocked';

          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.card,
                isGranted && { borderColor: '#E0F7FA', borderWidth: 1.5 },
                isRed && { backgroundColor: '#FFF5F5', borderColor: '#FF4D4D', borderWidth: 1.5 },
              ]}
              onPress={() => handleCardPress(item)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconBadge,
                  { backgroundColor: isGranted ? `${colorConfig.primaryColor}15` : isRed ? '#FFEAEA' : '#F0F2F5' },
                ]}
              >
                <Text style={styles.iconText}>{item.icon}</Text>
              </View>

              <View style={styles.textContainer}>
                <Text style={[styles.permissionLabel, { color: isRed ? '#CC0000' : colorConfig.primaryColor }]}>
                  {item.label}
                </Text>
                <Text style={[styles.permissionDesc, isRed && { color: '#CC0000' }]}>
                  {item.description}
                </Text>

                {(status === 'unchecked' || status === 'denied') && (
                  <View
                    style={[
                      styles.actionBtnBadge,
                      { backgroundColor: status === 'denied' ? '#FF4D4D' : colorConfig.primaryButtonColor },
                    ]}
                  >
                    <Text style={styles.actionBtnText}>Tap to Allow ➔</Text>
                  </View>
                )}
                {status === 'blocked' && (
                  <View style={styles.actionBtnBadge}>
                    <Text style={styles.actionBtnText}>Open Settings ⚙️</Text>
                  </View>
                )}
              </View>

              <View
                style={[
                  styles.statusCircle,
                  { borderColor: colorConfig.primaryColor },
                  isGranted && { backgroundColor: colorConfig.primaryColor, borderColor: colorConfig.primaryColor },
                  isRed && styles.statusCircleRed,
                  status === 'unchecked' && { borderColor: '#E0E0E0' },
                ]}
              >
                {isGranted && <Text style={styles.statusIcon}>✓</Text>}
                {isRed && <Text style={styles.statusIcon}>✗</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={[styles.bottomContainer, { backgroundColor: colorConfig.primaryColor }]}>
        <TouchableOpacity
          style={styles.continueBtn}
          onPress={handleContinue}
          activeOpacity={0.8}
        >
          <Text style={[styles.continueBtnText, { color: colorConfig.primaryColor }]}>
            Continue
          </Text>
        </TouchableOpacity>
        <Text style={styles.skipHint}>You can enable permissions later from Settings</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  headerContainer: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8, color: '#FFFFFF' },
  subtitle: { fontSize: 15, lineHeight: 22, fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 140 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    elevation: 4,
  },
  iconBadge: { width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  iconText: { fontSize: 24 },
  textContainer: { flex: 1, paddingRight: 12 },
  permissionLabel: { fontSize: 17, fontWeight: '700', marginBottom: 4 },
  permissionDesc: { fontSize: 13, lineHeight: 18, color: '#666666' },
  actionBtnBadge: {
    backgroundColor: '#FF4D4D',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 10,
    shadowColor: '#FF4D4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
  actionBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  statusCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  statusCircleRed: { backgroundColor: '#FF4D4D', borderColor: '#FF4D4D' },
  statusIcon: { color: '#FFFFFF', fontWeight: '800', fontSize: 14, marginTop: Platform.OS === 'ios' ? 1 : -1 },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtn: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnText: { fontSize: 16, fontWeight: '800' },
  skipHint: { color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: '500', marginTop: 10, textAlign: 'center' },
});

export default PermissionScreen;