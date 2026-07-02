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
  ActivityIndicator,
  InteractionManager,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../reduxUtils/store';

type PermissionKey = 'camera' | 'location' | 'mic';

interface PermissionItem {
  key: PermissionKey;
  label: string;
  description: string;
  androidPermission: string;
  icon: string;
}

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
    key: 'mic',
    label: 'Microphone',
    description: 'Required to verify your identity via Video KYC.',
    androidPermission: PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    icon: '🎤',
  },
];

type PermissionStatus = 'unchecked' | 'granted' | 'denied' | 'blocked';

const PermissionScreen = ({ onSuccess }: any) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  const [statuses, setStatuses] = useState<Record<PermissionKey, PermissionStatus>>({
    camera: 'unchecked',
    location: 'unchecked',
    mic: 'unchecked',
  });

  // 🔑 Guard against StrictMode double-invoke / re-mount re-trigger
  const hasStartedRef = useRef(false);

  const allGranted = PERMISSIONS_LIST.every(item => statuses[item.key] === 'granted');

  // 🔑 SINGLE effect — pehle wala duplicate hata diya, InteractionManager wale
  // effect ko hi keep kiya kyunki wo timing-safe hai (transition complete hone ka wait karta hai)
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

  useEffect(() => {
    if (allGranted && onSuccess) {
      const timer = setTimeout(() => {
        onSuccess(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [allGranted, onSuccess]);

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

      // 🔑 Verification pass — check karo koi silently skip to nahi hua
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colorConfig.primaryColor }]}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>App Permissions</Text>
        <Text style={styles.subtitle}>
          To provide you with the best and most secure experience, we need a few permissions.
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

                {/* 🔑 Ab 'unchecked' aur 'denied' dono states pe "Tap to Allow" dikhega,
                    taaki user ko turant pata chale khud tap karna hai */}
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
        {!allGranted ? (
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>Please tap the cards above to allow permissions</Text>
          </View>
        ) : (
          <View style={styles.autoRedirectContainer}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.redirectText}>Continuing Securely...</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  headerContainer: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 8, color: '#FFFFFF' },
  subtitle: { fontSize: 15, lineHeight: 22, fontWeight: '500', color: 'rgba(255, 255, 255, 0.9)' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
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
  actionBtnText: { color: 'green', fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
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
  instructionContainer: { paddingVertical: 18 },
  instructionText: { color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  autoRedirectContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
  redirectText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', marginLeft: 12 },
});

export default PermissionScreen;