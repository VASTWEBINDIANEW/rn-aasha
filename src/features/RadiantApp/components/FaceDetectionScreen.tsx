import React, {
  useEffect, useRef, useState, useCallback,
} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Platform, Animated, ActivityIndicator,
  StatusBar, SafeAreaView, Image as RNImage, Modal,
} from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import FaceDetection from '@react-native-ml-kit/face-detection';
import RNFS from 'react-native-fs';
import { WebView } from 'react-native-webview';

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const DETECT_INTERVAL_MS = 300;

const S = {
  IDLE:       'IDLE',
  NO_FACE:    'NO_FACE',
  MULTI:      'MULTI',
  FACE_OK:    'FACE_OK',
  CAPTURING:  'CAPTURING',
  PROCESSING: 'PROCESSING',
  DONE:       'DONE',
} as const;
type ScreenState = typeof S[keyof typeof S];

const HINT: Partial<Record<ScreenState, string>> = {
  IDLE:       'Align your face in the oval',
  NO_FACE:    'No face detected — look straight at camera',
  MULTI:      'Multiple faces detected — only one person allowed',
  FACE_OK:    'Face detected — tap capture',
  CAPTURING:  'Hold still...',
  PROCESSING: 'Processing photo...',
};

function borderColor(state: ScreenState): string {
  switch (state) {
    case S.FACE_OK:    return '#10B981';
    case S.NO_FACE:
    case S.MULTI:      return '#EF4444';
    case S.CAPTURING:
    case S.PROCESSING: return '#F59E0B';
    default:           return '#1A73E8';
  }
}

// ─────────────────────────────────────────────
// CROP HTML — tight passport crop, less top space
// ─────────────────────────────────────────────
function buildCropHTML(
  base64: string,
  frame: { left: number; top: number; width: number; height: number },
  imgW: number,
  imgH: number,
): string {
  const { left, top, width, height } = frame;

  // Tight passport padding — less top space
  const padX    = width  * 0.38;
  const padYTop = height * 0.28;  // ← reduced: was 0.55–0.70
  const padYBot = height * 0.22;  // ← reduced: was 0.45

  const cropX = Math.max(0, left - padX);
  const cropY = Math.max(0, top  - padYTop);
  const cropW = Math.min(imgW - cropX, width  + padX * 2);
  const cropH = Math.min(imgH - cropY, height + padYTop + padYBot);

  // 35×45mm @ 300dpi
  const OUT_W = 413;
  const OUT_H = 531;

  return `<!DOCTYPE html><html><body>
<canvas id="o"></canvas>
<script>
const img = new Image();
img.onload = function() {
  const o = document.getElementById('o');
  o.width  = ${OUT_W};
  o.height = ${OUT_H};
  const ctx = o.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, ${OUT_W}, ${OUT_H});
  ctx.drawImage(
    img,
    ${cropX.toFixed(2)}, ${cropY.toFixed(2)},
    ${cropW.toFixed(2)}, ${cropH.toFixed(2)},
    0, 0, ${OUT_W}, ${OUT_H}
  );
  const b64 = o.toDataURL('image/jpeg', 0.95).split(',')[1];
  window.ReactNativeWebView.postMessage(b64);
};
img.src = 'data:image/jpeg;base64,${base64}';
<\/script></body></html>`;
}

// ─────────────────────────────────────────────
// HIDDEN WEBVIEW CROP PROCESSOR
// ─────────────────────────────────────────────
function CropProcessor({
  html,
  onDone,
}: {
  html: string | null;
  onDone: (b64: string) => void;
}) {
  if (!html) return null;
  return (
    <WebView
      style={{ width: 1, height: 1, position: 'absolute', opacity: 0 }}
      source={{ html }}
      javaScriptEnabled
      onMessage={e => onDone(e.nativeEvent.data)}
    />
  );
}

// ─────────────────────────────────────────────
// RESULT MODAL
// ─────────────────────────────────────────────
function ResultModal({
  visible,
  uri,
  onRetake,
  onContinue,
}: {
  visible: boolean;
  uri: string | null;
  onRetake: () => void;
  onContinue: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={ms.backdrop}>
        <View style={ms.card}>
          <Text style={ms.title}>Photo Ready</Text>
          <Text style={ms.sub}>Review your passport photo below</Text>

          {uri && (
            <View style={ms.previewWrap}>
              <RNImage source={{ uri }} style={ms.preview} resizeMode="cover" />
              <View style={ms.badge}>
                <Text style={ms.badgeText}>35 × 45 mm</Text>
              </View>
            </View>
          )}

          {/* Info rows */}
          <View style={ms.infoCard}>
            {[
              ['Size',       '35 × 45 mm  (Passport standard)'],
              ['Resolution', '413 × 531 px  @ 300 dpi'],
              ['Background', '✓ White'],
              ['Face',       '✓ Single face'],
            ].map(([label, val]) => (
              <View key={label} style={ms.infoRow}>
                <Text style={ms.infoLabel}>{label}</Text>
                <Text style={[ms.infoVal, val.startsWith('✓') && { color: '#10B981' }]}>
                  {val}
                </Text>
              </View>
            ))}
          </View>

          <View style={ms.btnRow}>
            <TouchableOpacity style={ms.btnSecondary} onPress={onRetake}>
              <Text style={ms.btnSecondaryText}>↺  Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity style={ms.btnPrimary} onPress={onContinue} activeOpacity={0.85}>
              <Text style={ms.btnPrimaryText}>Continue →</Text>
            </TouchableOpacity>
          </View>

          <Text style={ms.secure}>🔒  Encrypted · Stored securely</Text>
        </View>
      </View>
    </Modal>
  );
}

const ms = StyleSheet.create({
  backdrop:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  card:        { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 16 },
  title:       { fontSize: 20, fontWeight: '700', color: '#0F172A', textAlign: 'center' },
  sub:         { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: -8 },
  previewWrap: { alignItems: 'center', position: 'relative' },
  preview:     { width: 175, height: 225, borderRadius: 10, borderWidth: 2.5, borderColor: '#10B981' },
  badge:       { position: 'absolute', bottom: -12, backgroundColor: '#10B981', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  badgeText:   { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  infoCard:    { backgroundColor: '#F0FDF4', borderRadius: 14, padding: 14, gap: 8, borderWidth: 1, borderColor: '#BBF7D0', marginTop: 8 },
  infoRow:     { flexDirection: 'row', justifyContent: 'space-between' },
  infoLabel:   { fontSize: 12, color: '#64748B', fontWeight: '600' },
  infoVal:     { fontSize: 12, color: '#0F172A', fontWeight: '600' },
  btnRow:      { flexDirection: 'row', gap: 10 },
  btnPrimary:  { flex: 1, backgroundColor: '#1A73E8', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  btnSecondary:{ flex: 1, backgroundColor: '#F1F5F9', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  btnPrimaryText:  { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnSecondaryText:{ color: '#334155', fontSize: 15, fontWeight: '700' },
  secure:      { textAlign: 'center', fontSize: 11, color: '#94A3B8' },
});

// ─────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────
interface Props {
  onContinue?: (data: { base64: string; uri: string; name: string }) => void;
}

export default function PassportPhotoScreen({ onContinue }: Props) {
  // ── Camera state ──
  const [camPos,    setCamPos]    = useState<'front' | 'back'>('front');
  const device                   = useCameraDevice(camPos);
  const cameraRef                = useRef<Camera>(null);

  // ── Refs (avoid stale closures in interval) ──
  const detecting   = useRef(false);
  const detectTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const capturing   = useRef(false);

  // ── State ──
  const [screenState, setScreenState] = useState<ScreenState>(S.IDLE);
  const [cropHtml,    setCropHtml]    = useState<string | null>(null);
  const [passUri,     setPassUri]     = useState<string | null>(null);
  const [passBase64,  setPassBase64]  = useState<string | null>(null);
  const [showModal,   setShowModal]   = useState(false);
  const [camReady,    setCamReady]    = useState(false);

  // ── Animations ──
  const ovalAnim    = useRef(new Animated.Value(0)).current;
  const captureAnim = useRef(new Animated.Value(1)).current;

  // Permission
  useEffect(() => {
    Camera.requestCameraPermission();
  }, []);

  // Oval border color animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(ovalAnim, { toValue: 1, duration: 1200, useNativeDriver: false }),
        Animated.timing(ovalAnim, { toValue: 0, duration: 1200, useNativeDriver: false }),
      ])
    ).start();
  }, []);

  // Capture button pulse when face is ok
  useEffect(() => {
    if (screenState === S.FACE_OK) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(captureAnim, { toValue: 1.08, duration: 600, useNativeDriver: true }),
          Animated.timing(captureAnim, { toValue: 1,    duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      captureAnim.setValue(1);
    }
  }, [screenState]);

  // Start/stop detection when camera is ready
 useEffect(() => {
  if (!camReady) return;
  const t = setTimeout(startDetectionLoop, 500); // camera settle hone do
  return () => {
    clearTimeout(t);
    stopDetectionLoop();
  };
}, [camReady]);

  // ─────────────────────────────────────────────
  // DETECTION LOOP
  // ─────────────────────────────────────────────
  const stopDetectionLoop = useCallback(() => {
    if (detectTimer.current) {
      clearInterval(detectTimer.current);
      detectTimer.current = null;
    }
  }, []);

  const detectFace = useCallback(async () => {
    if (!cameraRef.current || detecting.current || capturing.current) return;
    detecting.current = true;
    try {
      const photo = await cameraRef.current.takePhoto({ flash: 'off' });
      const path  = Platform.OS === 'android' ? `file://${photo.path}` : photo.path;

      const faces = await FaceDetection.detect(path, {
        performanceMode:    'fast',
        classificationMode: 'none',
        landmarkMode:       'none',
        contourMode:        'none',
      });

      if (faces.length === 0)     setScreenState(S.NO_FACE);
      else if (faces.length > 1)  setScreenState(S.MULTI);
      else                        setScreenState(S.FACE_OK);
    } catch (err) {
      console.warn('[Passport] detect:', err);
    } finally {
      detecting.current = false;
    }
  }, []);

  const startDetectionLoop = useCallback(() => {
    stopDetectionLoop();
    detectFace();
    detectTimer.current = setInterval(detectFace, DETECT_INTERVAL_MS);
  }, [detectFace, stopDetectionLoop]);

  // ─────────────────────────────────────────────
  // CAPTURE
  // ─────────────────────────────────────────────
  const handleCapture = useCallback(async () => {
    if (capturing.current || !cameraRef.current) return;
    capturing.current = true;
    stopDetectionLoop();
    setScreenState(S.CAPTURING);

    try {
      const photo = await cameraRef.current.takePhoto({ flash: 'off' });
      const path  = Platform.OS === 'android' ? `file://${photo.path}` : photo.path;

      const faces = await FaceDetection.detect(path, {
        performanceMode:    'accurate',
        classificationMode: 'none',
        landmarkMode:       'none',
        contourMode:        'none',
      });

      if (faces.length !== 1) {
        capturing.current = false;
        setScreenState(faces.length === 0 ? S.NO_FACE : S.MULTI);
        startDetectionLoop();
        return;
      }

      setScreenState(S.PROCESSING);

      const imgW = photo.width  ?? 1080;
      const imgH = photo.height ?? 1440;
      const b64  = await RNFS.readFile(path, 'base64');

      setCropHtml(buildCropHTML(b64, faces[0].frame, imgW, imgH));
    } catch (err) {
      console.warn('[Passport] capture:', err);
      capturing.current = false;
      setScreenState(S.FACE_OK);
      startDetectionLoop();
    }
  }, [stopDetectionLoop, startDetectionLoop]);

  // ─────────────────────────────────────────────
  // CROP DONE
  // ─────────────────────────────────────────────
  const onCropDone = useCallback(async (b64: string) => {
    setCropHtml(null);
    try {
      const savePath = `${RNFS.CachesDirectoryPath}/passport_${Date.now()}.jpg`;
      await RNFS.writeFile(savePath, b64, 'base64');
      setPassUri(`file://${savePath}`);
      setPassBase64(b64);
      setScreenState(S.DONE);
      setShowModal(true);
    } catch (err) {
      console.warn('[Passport] save:', err);
    } finally {
      capturing.current = false;
    }
  }, []);

  // ─────────────────────────────────────────────
  // RETAKE
  // ─────────────────────────────────────────────
  const handleRetake = useCallback(() => {
    setShowModal(false);
    setPassUri(null);
    setPassBase64(null);
    setCropHtml(null);
    capturing.current = false;
    detecting.current = false;
    setScreenState(S.NO_FACE);
    setTimeout(startDetectionLoop, 400);
  }, [startDetectionLoop]);

  // ─────────────────────────────────────────────
  // CONTINUE
  // ─────────────────────────────────────────────
  const handleContinue = useCallback(() => {
    setShowModal(false);
    if (onContinue && passBase64 && passUri) {
      onContinue({
        base64: passBase64,
        uri:    passUri,
        name:   `passport_${Date.now()}.jpg`,
      });
    }
  }, [passUri, passBase64, onContinue]);

  // ─────────────────────────────────────────────
  // CAMERA FLIP
  // ─────────────────────────────────────────────
const flipCamera = useCallback(() => {
  stopDetectionLoop();
  detecting.current  = false;
  capturing.current  = false;
  setCamReady(false); // reset karo
  setScreenState(S.IDLE);
  setCamPos(p => p === 'front' ? 'back' : 'front');
}, [stopDetectionLoop]);
  // ─────────────────────────────────────────────
  // DERIVED UI
  // ─────────────────────────────────────────────
  const bc          = borderColor(screenState);
  const hint        = HINT[screenState] ?? '';
  const isError     = screenState === S.NO_FACE || screenState === S.MULTI;
  const showCapture = screenState === S.FACE_OK;
  const showSpinner = screenState === S.CAPTURING || screenState === S.PROCESSING;

  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <CropProcessor html={cropHtml} onDone={onCropDone} />

      {/* Camera */}
    {device && !showModal && (
  <Camera
    ref={cameraRef}
    style={StyleSheet.absoluteFill}
    device={device}
    isActive={true}
    photo={true}
    onInitialized={() => {
      setCamReady(true);
    }}
    // ← key prop force karo re-mount on camera switch
    key={camPos}
  />
)}

      {/* Dark vignette */}
      <View style={st.vignette} pointerEvents="none" />

      {/* ── Top bar ── */}
      <SafeAreaView style={st.topBar}>
        <View style={st.topBarInner}>
          {/* Camera label */}
          <View style={st.camChip}>
            <Text style={st.camChipText}>
              {camPos === 'front' ? '📷 FRONT' : '📷 BACK'}
            </Text>
          </View>

          {/* Title */}
          <View style={st.topCenter}>
            <Text style={st.topTitle}>Passport Photo</Text>
          </View>

          {/* Flip button */}
          <TouchableOpacity style={st.flipBtn} onPress={flipCamera} activeOpacity={0.7}>
            <Text style={st.flipBtnText}>⇄</Text>
          </TouchableOpacity>
        </View>

        <Text style={st.topSub}>Keep your face inside the oval</Text>
      </SafeAreaView>

      {/* ── Oval — centered with slight upward offset for button space ── */}
      <View style={st.ovalWrap} pointerEvents="none">
        <View style={[st.oval, { borderColor: bc }]}>
          {/* Head guide line — top */}
          <View style={[st.ovalGuide, st.ovalGuideTop, { borderColor: `${bc}60` }]} />
          {/* Shoulder guide line — bottom */}
          <View style={[st.ovalGuide, st.ovalGuideBottom, { borderColor: `${bc}60` }]} />
        </View>
      </View>

      {/* ── Hint banner ── */}
      {hint !== '' && (
        <View style={st.hintWrap} pointerEvents="none">
          <View style={[
            st.hintBox,
            { backgroundColor: isError ? 'rgba(239,68,68,0.15)' : 'rgba(0,0,0,0.5)' },
            { borderColor:     isError ? 'rgba(239,68,68,0.4)'  : 'rgba(255,255,255,0.15)' },
          ]}>
            <View style={[st.hintDot, { backgroundColor: bc }]} />
            <Text style={[st.hintTxt, isError && { color: '#FCA5A5' }]}>
              {hint}
            </Text>
          </View>
        </View>
      )}

      {/* ── Spinner ── */}
      {showSpinner && (
        <View style={st.spinnerWrap} pointerEvents="none">
          <View style={st.spinnerCard}>
            <ActivityIndicator size="large" color="#F59E0B" />
            <Text style={st.spinnerText}>
              {screenState === S.CAPTURING ? 'Capturing...' : 'Processing...'}
            </Text>
          </View>
        </View>
      )}

      {/* ── Capture button ── */}
      {showCapture && (
        <View style={st.captureWrap}>
          <Animated.View style={{ transform: [{ scale: captureAnim }] }}>
            <TouchableOpacity
              style={st.captureBtn}
              onPress={handleCapture}
              activeOpacity={0.85}
            >
              <View style={st.captureBtnRing}>
                <View style={st.captureBtnInner} />
              </View>
            </TouchableOpacity>
          </Animated.View>
          <Text style={st.captureLbl}>Tap to Capture</Text>
        </View>
      )}

      {/* ── Result modal ── */}
      <ResultModal
        visible={showModal}
        uri={passUri}
        onRetake={handleRetake}
        onContinue={handleContinue}
      />
    </View>
  );
}

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const st = StyleSheet.create({
  root:    { flex: 1, backgroundColor: '#000' },

  vignette: {
    ...StyleSheet.absoluteFillObject,

  },

  // Top bar
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    zIndex: 20, alignItems: 'center',
  },
  topBarInner: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4,
    width: '100%',
  },
  topCenter: { flex: 1, alignItems: 'center' },
  topTitle:  { fontSize: 16, fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
  topSub:    { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 6 },

  camChip: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  camChipText: { fontSize: 10, color: '#fff', fontWeight: '700', letterSpacing: 1 },

  flipBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  flipBtnText: { fontSize: 18, color: '#fff' },

  // ── OVAL — vertically centered, shifted up slightly ──
  ovalWrap: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 190, // bottom offset = capture button height
    justifyContent: 'center',
    alignItems: 'center',
  },
  oval: {
    width: 230,
    height: 295,
    borderRadius: 9999,
    borderWidth: 2.5,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
  },
  ovalGuide: {
    position: 'absolute', left: 20, right: 20,
    height: 1, borderTopWidth: 1, borderStyle: 'dashed',
  },
  ovalGuideTop:    { top: '18%' },    // crown of head
  ovalGuideBottom: { bottom: '18%' }, // shoulder level

  // Hint
  hintWrap: {
    position: 'absolute', bottom: 130, left: 24, right: 24,
    alignItems: 'center',
  },
  hintBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 24, borderWidth: 1,
  },
  hintDot: { width: 6, height: 6, borderRadius: 3 },
  hintTxt: { fontSize: 13, color: '#e2e8f0', fontWeight: '500', flex: 1 },

  // Spinner
  spinnerWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  spinnerCard: {
    backgroundColor: 'rgba(15,23,42,0.95)',
    padding: 28, borderRadius: 20,
    alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)',
  },
  spinnerText: { color: '#F59E0B', fontSize: 14, fontWeight: '600', letterSpacing: 0.5 },

  // Capture button
  captureWrap: {
    position: 'absolute', bottom: 40, left: 0, right: 0,
    alignItems: 'center', gap: 8,
  },
  captureBtn: { alignItems: 'center', justifyContent: 'center' },
  captureBtnRing: {
    width: 76, height: 76, borderRadius: 38,
    borderWidth: 3, borderColor: '#10B981',
    justifyContent: 'center', alignItems: 'center',
  },
  captureBtnInner: {
    width: 58, height: 58, borderRadius: 29,
    backgroundColor: '#10B981',
  },
  captureLbl: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '500' },
});