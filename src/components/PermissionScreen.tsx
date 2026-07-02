import React, { useState, useEffect } from 'react';
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

  const allGranted = PERMISSIONS_LIST.every(item => statuses[item.key] === 'granted');

  useEffect(() => {
    autoRequestPermissionsOneByOne();
  }, []);

  useEffect(() => {
    if (allGranted && onSuccess) {
      const timer = setTimeout(() => {
        onSuccess(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [allGranted, onSuccess]);

  const autoRequestPermissionsOneByOne = async () => {
    if (Platform.OS !== 'android') return; 

    let currentStatuses = { ...statuses };

    for (const item of PERMISSIONS_LIST) {
      const isAlreadyGranted = await PermissionsAndroid.check(item.androidPermission as any);
      
      if (isAlreadyGranted) {
        currentStatuses[item.key] = 'granted';
      } else {
        try {
          const result = await PermissionsAndroid.request(item.androidPermission as any, {
            title: `${item.label} Permission`,
            message: item.description,
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          });

          if (result === PermissionsAndroid.RESULTS.GRANTED) {
            currentStatuses[item.key] = 'granted';
          } else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
            currentStatuses[item.key] = 'blocked';
          } else {
            currentStatuses[item.key] = 'denied';
          }
        } catch (error) {
          console.warn('Auto Request Error:', error);
          currentStatuses[item.key] = 'denied';
        }
      }
      setStatuses({ ...currentStatuses });
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
          result === PermissionsAndroid.RESULTS.GRANTED ? 'granted' : 
          result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN ? 'blocked' : 'denied'
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
              activeOpacity={0.7} // Click feel dene ke liye opacity kam ki
            >
              {/* Left Icon Badge */}
              <View style={[
                styles.iconBadge, 
                { backgroundColor: isGranted ? `${colorConfig.primaryColor}15` : isRed ? '#FFEAEA' : '#F0F2F5' }
              ]}>
                <Text style={styles.iconText}>{item.icon}</Text>
              </View>

              {/* Text Content */}
              <View style={styles.textContainer}>
                <Text style={[styles.permissionLabel, { color: isRed ? '#CC0000' : colorConfig.primaryColor }]}>
                  {item.label}
                </Text>
                <Text style={[styles.permissionDesc, isRed && { color: '#CC0000' }]}>
                  {item.description}
                </Text>
                
                {/* 🔥 VISUAL CTA BUTTON: User ko yahan se samajh aayega ki click karna hai */}
                {status === 'denied' && (
                  <View style={styles.actionBtnBadge}>
                    <Text style={styles.actionBtnText}>Tap to Allow ➔</Text>
                  </View>
                )}
                {status === 'blocked' && (
                  <View style={styles.actionBtnBadge}>
                    <Text style={styles.actionBtnText}>Open Settings ⚙️</Text>
                  </View>
                )}
              </View>

              {/* Status Indicator (Right side) */}
              <View
                style={[
                  styles.statusCircle,
                  { borderColor: colorConfig.primaryColor },
                  isGranted && { backgroundColor: colorConfig.primaryColor, borderColor: colorConfig.primaryColor },
                  isRed && styles.statusCircleRed,
                  status === 'unchecked' && { borderColor: '#E0E0E0' }
                ]}
              >
                {isGranted && <Text style={styles.statusIcon}>✓</Text>}
                {isRed && <Text style={styles.statusIcon}>✗</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom Area */}
      <View style={[styles.bottomContainer, { backgroundColor: colorConfig.primaryColor }]}>
        {!allGranted ? (
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              Please click the red buttons above to proceed
            </Text>
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
  
  // 🔥 NAYA CTA BUTTON STYLE
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
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  // -------------------------

  statusCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  statusCircleRed: { backgroundColor: '#FF4D4D', borderColor: '#FF4D4D' }, 
  statusIcon: { color: '#FFFFFF', fontWeight: '800', fontSize: 14, marginTop: Platform.OS === 'ios' ? 1 : -1 },
  bottomContainer: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingTop: 16, paddingBottom: Platform.OS === 'ios' ? 34 : 24, alignItems: 'center', justifyContent: 'center' },
  instructionContainer: { paddingVertical: 18 },
  instructionText: { color: 'rgba(255,255,255,0.8)', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  autoRedirectContainer: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18 },
  redirectText: { color: '#FFFFFF', fontSize: 17, fontWeight: '700', marginLeft: 12 },
});

export default PermissionScreen;