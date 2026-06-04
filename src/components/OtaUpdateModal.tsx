import { View, Text, StyleSheet, Image } from 'react-native';
import { hScale, wScale } from '../utils/styles/dimensions';
import FastImage from 'react-native-fast-image';
import { RootState } from '../reduxUtils/store';
import { useSelector } from 'react-redux';

const OtaUpdateModal = ({ status, progress }: {
  status: 'idle' | 'downloading' | 'installing' | 'success' | 'failed';
  progress: number
}) => {
    const { logoUrl } = useSelector((state: RootState) => state.userInfo);

  if (status === 'idle') return null;

  return (
    <View style={ota.overlay}>
      <View style={ota.card}>

        {status === 'downloading' && (
          <>
            <Image
              source={{ uri: logoUrl }}
             style={ota.logo}
              resizeMode="contain"
            />
            <Text style={ota.title}>Downloading Update...</Text>
            <Text style={ota.subtitle}>Please wait, do not close the app</Text>
            <View style={ota.progressBg}>
              <View style={[ota.progressFill, { width: `${progress}%` }]} />
            </View>
            <Text style={ota.percent}>{progress}%</Text>
          </>
        )}

        {status === 'installing' && (
          <>
             <Image
              source={{ uri: logoUrl }}
             style={ota.logo}
              resizeMode="contain"
            />
            <Text style={ota.title}>Installing Update...</Text>
            <Text style={ota.subtitle}>Almost done, app will restart shortly</Text>
            <View style={ota.progressBg}>
              <View style={[ota.progressFill, { width: '100%' }]} />
            </View>
          </>
        )}

        {status === 'success' && (
          <>
             <Image
              source={{ uri: logoUrl }}
             style={ota.logo}
              resizeMode="contain"
            />
            <Text style={ota.title}>Update Complete!</Text>
            <Text style={ota.subtitle}>Restarting app...</Text>
          </>
        )}

        {status === 'failed' && (
          <>
             <Image
              source={{ uri: logoUrl }}
             style={ota.logo}
              resizeMode="contain"
            />
            <Text style={[ota.title, { color: '#EF4444' }]}>Update Failed</Text>
            <Text style={ota.subtitle}>Something went wrong. Try again later.</Text>
          </>
        )}

      </View>
    </View>
  );
};

export default OtaUpdateModal;

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
  logo: {
    width: 64,
    height: 64,
    borderRadius: 14,
    marginBottom: 16,
  },
});