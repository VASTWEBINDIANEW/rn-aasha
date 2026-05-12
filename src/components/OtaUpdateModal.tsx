import { AppState, View, Text, StyleSheet } from 'react-native';
import { hScale, wScale } from '../utils/styles/dimensions';

// ── OTA Update Modal Component ──
const OtaUpdateModal = ({ status, progress }: { 
  status: 'idle' | 'downloading' | 'success'; 
  progress: number 
}) => {
  if (status === 'idle') return null;

  return (
    <View style={ota.overlay}>
      <View style={ota.card}>
        {status === 'downloading' ? (
          <>
            <Text style={ota.title}>Updating App...</Text>
            <Text style={ota.subtitle}>Please wait, do not close the app</Text>
            <View style={ota.progressBg}>
              <View style={[ota.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={ota.percent}>{progress}%</Text>
          </>
        ) : (
          <>
            <Text style={ota.emoji}>✅</Text>
            <Text style={ota.title}>Update Complete!</Text>
            <Text style={ota.subtitle}>Restarting app...</Text>
          </>
        )}
      </View>
    </View>
  );
};
export default OtaUpdateModal ;
const ota = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: wScale(16),
    padding: wScale(24),
    width: '80%',
    alignItems: 'center',
  },
  title: {
    fontSize: wScale(18),
    fontWeight: '600',
    color: '#111',
    marginBottom: hScale(8),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: wScale(13),
    color: '#6B7280',
    marginBottom: hScale(16),
    textAlign: 'center',
  },
  progressBg: {
    width: '100%',
    height: hScale(8),
    backgroundColor: '#E5E7EB',
    borderRadius: wScale(4),
  },
  progressFill: {
    height: hScale(8),
    backgroundColor: '#6366F1',
    borderRadius: wScale(4),
  },
  percent: {
    fontSize: wScale(13),
    color: '#6366F1',
    marginTop: hScale(8),
    fontWeight: '600',
  },
  emoji: {
    fontSize: wScale(32),
    marginBottom: hScale(8),
  },
});