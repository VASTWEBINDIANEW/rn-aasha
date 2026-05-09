import { translate } from "../../../utils/languageUtils/I18n";
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';

const { width, height } = Dimensions.get('window');
const frameSize = width * 0.72;

const QRScanScreen = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(true);

  const { colorConfig } = useSelector((state) => state.userInfo);
  const {
    primaryColor ,
    secondaryColor ,
    primaryButtonColor ,
    secondaryButtonColor,
    labelColor = '#2ECC71',
  } = colorConfig || {};

  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const device = useCameraDevice('back');
  const isProcessing = useRef(false);

  // Scan line animation
  const scanAnim = useRef(new Animated.Value(0)).current;
  // Pulse animation for corners
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Fade-in for overlay
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (isCameraActive) {
      scanAnim.setValue(0);
      Animated.loop(
        Animated.timing(scanAnim, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isCameraActive]);

  const translateY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, frameSize - 4],
  });

  const parseUPIData = (data) => {
    if (!data || !data.startsWith('upi://')) return null;
    try {
      const obj = {};
      const queryString = data.split('?')[1];
      if (!queryString) return null;
      queryString.split('&').forEach((item) => {
        const [key, value] = item.split('=');
        if (key && value) obj[key] = decodeURIComponent(value);
      });
      return obj;
    } catch {
      return null;
    }
  };

  const checkPermission = useCallback(async () => {
    const status = await Camera.getCameraPermissionStatus();
    if (status === 'granted') {
      setHasPermission(true);
    } else {
      const newStatus = await Camera.requestCameraPermission();
      setHasPermission(newStatus === 'granted');
    }
  }, []);

  useEffect(() => {
    if (isFocused) checkPermission();
  }, [isFocused, checkPermission]);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && isCameraActive && !isProcessing.current) {
        const data = codes[0].value;
        isProcessing.current = true;
        setIsCameraActive(false);

        const parsed = parseUPIData(data);
        if (parsed) {
          navigation.navigate('ShowUPIData', { upi: parsed });
        } else {
          Alert.alert(translate("Invalid_QR"), translate("Not_a_valid_UPI_QR"), [
            {
              text: translate("OK"),
              onPress: () => {
                isProcessing.current = false;
                setIsCameraActive(true);
              },
            },
          ]);
        }
      }
    },
  });

  // ─── No permission ───────────────────────────────────────────────────────────
  if (!hasPermission) {
    return (
      <LinearGradient
        colors={['#0a0a1a', '#12122a', '#0d0d20']}
        style={[styles.container, styles.centered]}
      >
        <View style={styles.permissionCard}>
          <LinearGradient
            colors={[`${primaryColor}22`, `${secondaryColor}18`, 'rgba(255,255,255,0.06)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={styles.permissionCardInner}
          >
            <Text style={styles.permissionIcon}>📷</Text>
            <Text style={[styles.permissionTitle, { color: '#fff' }]}>
              {translate("Camera_access_required")}
            </Text>
            <Text style={styles.permissionSubtitle}>
              {translate("Camera_permission_subtitle")}
            </Text>
            <TouchableOpacity
              style={[styles.permissionBtn, { backgroundColor: primaryButtonColor }]}
              onPress={checkPermission}
              activeOpacity={0.85}
            >
              <Text style={[styles.permissionBtnText, { color: '#000' }]}>
                {translate("Allow_Permission")}
              </Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </LinearGradient>
    );
  }

  // ─── No device ───────────────────────────────────────────────────────────────
  if (!device) {
    return (
      <LinearGradient colors={['#0a0a1a', '#12122a']} style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={primaryColor} />
        <Text style={[styles.loadingText, { color: primaryColor }]}>
          {translate("Initializing_Camera")}
        </Text>
      </LinearGradient>
    );
  }

  // ─── Main Screen ─────────────────────────────────────────────────────────────
  return (
<View style={styles.container}>
  <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

  {/* Camera */}
  <Camera
    style={StyleSheet.absoluteFill}
    device={device}
    isActive={isFocused && isCameraActive}
    codeScanner={codeScanner}
  />

  {/* Dark overlay */}
  <LinearGradient
    colors={['rgba(0,0,0,0.75)', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.75)']}
    style={StyleSheet.absoluteFill}
    pointerEvents="none"
  />

  <View style={styles.safeWrapper}>
    <SafeAreaView style={styles.overlay}>

      {/* Top Card */}
      <View style={styles.topCard}>
        <LinearGradient
          colors={[`${primaryColor}33`, `${secondaryColor}22`, 'rgba(255,255,255,0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.topCardGradient}
        >
          <View style={[styles.topBadge, { backgroundColor: `${labelColor}22`, borderColor: `${labelColor}55` }]}>
            <View style={[styles.liveDot, { backgroundColor: labelColor }]} />
            <Text style={[styles.liveBadgeText, { color: labelColor }]}>
              {translate("Scan & Pay")}
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Scanner Frame */}
      <View style={styles.scannerWrapper}>

        {/* No animation glow ring */}
        <View style={[styles.glowRing, { borderColor: `${primaryColor}55` }]} />

        <View style={styles.scannerFrame}>
          <LinearGradient
            colors={[`${primaryColor}08`, `${secondaryColor}08`]}
            style={StyleSheet.absoluteFill}
          />

          {/* ✅ ONLY THIS ANIMATION */}
          <Animated.View style={{ transform: [{ translateY }] }}>
            <LinearGradient
              colors={['transparent', primaryColor, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.scanLine}
            />
          </Animated.View>

          {/* Corners */}
          <View style={[styles.cornerTL, { borderColor: primaryColor }]} />
          <View style={[styles.cornerTR, { borderColor: primaryColor }]} />
          <View style={[styles.cornerBL, { borderColor: primaryColor }]} />
          <View style={[styles.cornerBR, { borderColor: primaryColor }]} />

          {/* Dots */}
          <View style={[styles.dotTL, { backgroundColor: primaryColor }]} />
          <View style={[styles.dotTR, { backgroundColor: primaryColor }]} />
          <View style={[styles.dotBL, { backgroundColor: primaryColor }]} />
          <View style={[styles.dotBR, { backgroundColor: primaryColor }]} />
        </View>

      </View>

      {/* Bottom Panel */}
      <View style={styles.bottomPanel}>
        <LinearGradient
          colors={[`${secondaryColor}33`, `${primaryColor}22`, 'rgba(0,0,0,0.6)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bottomPanelInner}
        >
          {isCameraActive ? (
            <View style={styles.scanningRow}>
              <ActivityIndicator size="small" color={primaryColor} style={{ marginRight: 10 }} />
              <Text style={[styles.scanningText, { color: '#fff' }]}>
                {translate("Scanning")}
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.scanAgainBtn, { borderColor: primaryButtonColor }]}
              onPress={() => {
                isProcessing.current = false;
                setIsCameraActive(true);
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[primaryButtonColor, `${primaryButtonColor}cc`]}
                style={styles.scanAgainGradient}
              >
                <Text style={styles.scanAgainText}>
                  {translate("Tap_to_Scan_Again")}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          )}

          <Text style={[styles.footerNote, { color: `${labelColor}99` }]}>
            {translate("UPI_QR_only")}
          </Text>
        </LinearGradient>
      </View>

    </SafeAreaView>
  </View>
</View>
  );
};

export default QRScanScreen;

// ─── Styles ────────────────────────────────────────────────────────────────────
const CORNER_SIZE = 28;
const BORDER_W = 4;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { justifyContent: 'center', alignItems: 'center' },
  safeWrapper: { flex: 1 },
  overlay: { flex: 1, justifyContent: 'space-between', alignItems: 'center' },

  // ── Permission ──
  permissionCard: {
    width: width * 0.82,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  permissionCardInner: {
    alignItems: 'center',
    padding: 32,
  },
  permissionIcon: { fontSize: 52, marginBottom: 16 },
  permissionTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8, textAlign: 'center' },
  permissionSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.55)', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  permissionBtn: { paddingVertical: 14, paddingHorizontal: 36, borderRadius: 50 },
  permissionBtnText: { fontWeight: '700', fontSize: 15 },

  // ── Loading ──
  loadingText: { marginTop: 16, fontSize: 14, fontWeight: '500', letterSpacing: 0.5 },

  // ── Top Card ──
  topCard: {
    marginTop: Platform.OS === 'android' ? 50 : 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.07)',
    width: width * 0.86,
  },
  topCardGradient: {
    paddingVertical: 18,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  topBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 50,
    borderWidth: 1,
    marginBottom: 10,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, marginRight: 6 },
  liveBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: 0.3 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 },

  // ── Scanner ──
  scannerWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  glowRing: {
    position: 'absolute',
    width: frameSize + 40,
    height: frameSize + 40,
    borderRadius: 35,
    borderWidth: 1.5,
  },
  scannerFrame: {
    width: frameSize,
    height: frameSize,
    borderRadius: 20,
    overflow: 'hidden',
  },
  scanLine: {
    width: '100%',
    height: 3,
    borderRadius: 2,
  },

  // corners
  cornerTL: {
    position: 'absolute', top: 0, left: 0,
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderTopWidth: BORDER_W, borderLeftWidth: BORDER_W,
    borderTopLeftRadius: 18,
  },
  cornerTR: {
    position: 'absolute', top: 0, right: 0,
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderTopWidth: BORDER_W, borderRightWidth: BORDER_W,
    borderTopRightRadius: 18,
  },
  cornerBL: {
    position: 'absolute', bottom: 0, left: 0,
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderBottomWidth: BORDER_W, borderLeftWidth: BORDER_W,
    borderBottomLeftRadius: 18,
  },
  cornerBR: {
    position: 'absolute', bottom: 0, right: 0,
    width: CORNER_SIZE, height: CORNER_SIZE,
    borderBottomWidth: BORDER_W, borderRightWidth: BORDER_W,
    borderBottomRightRadius: 18,
  },

  // corner glow dots
  dotTL: { position: 'absolute', top: -2, left: -2, width: 8, height: 8, borderRadius: 4 },
  dotTR: { position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4 },
  dotBL: { position: 'absolute', bottom: -2, left: -2, width: 8, height: 8, borderRadius: 4 },
  dotBR: { position: 'absolute', bottom: -2, right: -2, width: 8, height: 8, borderRadius: 4 },

  helperChip: {
    marginTop: 16,
    borderRadius: 50,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  helperText: { fontSize: 12, fontWeight: '500', letterSpacing: 0.3 },

  // ── Bottom Panel ──
  bottomPanel: {
    width: '100%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  bottomPanelInner: {
    paddingTop: 24,
    paddingBottom: 36,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  scanningRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  scanningText: { fontSize: 16, fontWeight: '600', letterSpacing: 0.5 },
  scanAgainBtn: {
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 1,
    marginBottom: 10,
    width: width * 0.72,
  },
  scanAgainGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 50,
  },
  scanAgainText: { color: '#000', fontWeight: '800', fontSize: 15, letterSpacing: 0.3 },
  footerNote: { fontSize: 11, marginTop: 6, letterSpacing: 0.2 },
});