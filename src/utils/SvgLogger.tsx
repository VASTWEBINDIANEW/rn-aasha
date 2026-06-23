// utils/SvgLogger.ts
// Device ke liye EK document — saari logs usme update hoti hain

import firestore from '@react-native-firebase/firestore';
import DeviceInfo from 'react-native-device-info';

type LogLevel = 'info' | 'warn' | 'error';

interface SvgLogPayload {
  step: string;
  level: LogLevel;
  iconName?: string;
  svgUrl?: string;
  section?: string;
  error?: string;
  extra?: Record<string, any>;
}

// ─── Device info cache ────────────────────────────────────────────────────────
let cachedDevice: { model: string; android: string; uid: string } | null = null;

const getDeviceInfo = async () => {
  if (cachedDevice) return cachedDevice;
  cachedDevice = {
    model:   DeviceInfo.getModel(),
    android: DeviceInfo.getSystemVersion(),
    uid:     await DeviceInfo.getUniqueId(),
  };
  return cachedDevice;
};

// ─── Main Logger — device document mein arrayUnion se push ───────────────────
// Firestore mein structure:
// svg_debug_logs/
//   {deviceUid}/          ← ek document per device
//     deviceModel: "motorola edge 20"
//     androidVersion: "12"
//     logs: [             ← array mein saari entries
//       { step, level, timestamp, ... },
//       { step, level, timestamp, ... },
//     ]

export const logSvgEvent = async (payload: SvgLogPayload) => {
  try {
    const device = await getDeviceInfo();

    const entry: Record<string, any> = {
      step:      payload.step,
      level:     payload.level,
      timestamp: new Date().toISOString(),
    };

    if (payload.iconName) entry.iconName = payload.iconName;
    if (payload.svgUrl)   entry.svgUrl   = payload.svgUrl;
    if (payload.section)  entry.section  = payload.section;
    if (payload.error)    entry.error    = payload.error;
    if (payload.extra)    entry.extra    = payload.extra;

    // Device ka ek hi document — uid se identify
    await firestore()
      .collection('svg_debug_logs')
      .doc(device.uid)                        // ← fixed doc ID = device uid
      .set(
        {
          deviceModel:    device.model,
          androidVersion: device.android,
          uniqueId:       device.uid,
          lastUpdated:    new Date().toISOString(),
          logs: firestore.FieldValue.arrayUnion(entry), // ← array mein append
        },
        { merge: true }                       // ← document exist kare toh merge
      );

    const emoji = payload.level === 'error' ? '❌' : payload.level === 'warn' ? '⚠️' : '✅';
    console.log(`${emoji} [SvgLogger] ${payload.step}`, payload.svgUrl || payload.section || '');
  } catch (e) {
    console.warn('[SvgLogger] Failed to write log:', e);
  }
};

// ─── Step 1: API se data aaya ─────────────────────────────────────────────────
export const logSectionDataReceived = (section: string, count: number, firstUrl?: string) =>
  logSvgEvent({
    step:  'STEP1_API_DATA_RECEIVED',
    level: count > 0 ? 'info' : 'warn',
    section,
    extra: {
      count,
      firstSvgUrl: firstUrl ?? 'N/A',
      urlStatus: !firstUrl
        ? 'MISSING'
        : firstUrl.startsWith('https')
        ? 'HTTPS_OK'
        : firstUrl.startsWith('http')
        ? 'HTTP_CLEARTEXT'
        : 'UNKNOWN_SCHEME',
    },
  });

// ─── Step 2: Icon render attempt ──────────────────────────────────────────────
export const logIconRender = (iconName: string, svgUrl: string, section: string) =>
  logSvgEvent({
    step:    'STEP2_ICON_RENDER_ATTEMPT',
    level:   'info',
    iconName,
    svgUrl,
    section,
    extra: {
      urlScheme: svgUrl?.startsWith('https') ? 'HTTPS' : svgUrl?.startsWith('http') ? 'HTTP' : 'OTHER',
    },
  });

// ─── Step 3: SVG load success ─────────────────────────────────────────────────
export const logSvgSuccess = (iconName: string, svgUrl: string) =>
  logSvgEvent({
    step:  'STEP3_SVG_LOAD_SUCCESS',
    level: 'info',
    iconName,
    svgUrl,
  });

// ─── Step 4: SVG load FAILED ──────────────────────────────────────────────────
export const logSvgError = (iconName: string, svgUrl: string, error: any) => {
  const errStr    = error?.message || String(error) || 'Unknown';
  const diagnosis =
    errStr.includes('CLEARTEXT') ? 'CLEARTEXT_BLOCKED'     :
    errStr.includes('SSL')       ? 'SSL_CERTIFICATE_ERROR' :
    errStr.includes('timeout')   ? 'NETWORK_TIMEOUT'       :
    errStr.includes('404')       ? 'FILE_NOT_FOUND_404'    :
    errStr.includes('Network')   ? 'NETWORK_ERROR'         :
    errStr.includes('connect')   ? 'CONNECTION_REFUSED'    :
                                   'UNKNOWN_ERROR';
  return logSvgEvent({
    step:  'STEP4_SVG_LOAD_FAILED',
    level: 'error',
    iconName,
    svgUrl,
    error: errStr,
    extra: { diagnosis, svgUrlScheme: svgUrl?.startsWith('https') ? 'HTTPS' : 'HTTP' },
  });
};

// ─── Step 5: SVG URL missing ──────────────────────────────────────────────────
export const logSvgMissingUrl = (iconName: string, section: string) =>
  logSvgEvent({
    step:  'STEP5_SVG_URL_MISSING',
    level: 'warn',
    iconName,
    section,
    error: 'svg field is null or undefined in API response',
  });

// ─── Step 0: API call fail ────────────────────────────────────────────────────
export const logApiFailed = (section: string, reason: any) =>
  logSvgEvent({
    step:  'STEP0_API_CALL_FAILED',
    level: 'error',
    section,
    error: String(reason),
    extra: {
      diagnosis:
        String(reason).includes('401')     ? 'UNAUTHORIZED' :
        String(reason).includes('403')     ? 'FORBIDDEN'    :
        String(reason).includes('500')     ? 'SERVER_ERROR' :
        String(reason).includes('timeout') ? 'TIMEOUT'      :
        'UNKNOWN',
    },
  });