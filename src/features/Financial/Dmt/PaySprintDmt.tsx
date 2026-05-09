import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, NativeModules, Alert,
  Text, TouchableOpacity, ActivityIndicator, ScrollView
} from 'react-native';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { RootState } from '../../../reduxUtils/store';
import DynamicButton from '../../drawer/button/DynamicButton';
import { translate } from '../../../utils/languageUtils/I18n';

const PaysprintDmt = () => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const [merchantCode, setMerchantCode] = useState('');
  const [partnerApiKey, setPartnerApiKey] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [btnLoading, setBtnLoading] = useState(false);
  const { post } = useAxiosHook();

  useEffect(() => { getDmtPayload(); }, []);

  const getDmtPayload = async () => {
    try {
      const res = await post({ url: `MoneyDMT/api/PPI/info` });
      if (res?.ADDINFO) {
        setMerchantCode(res.ADDINFO.merchantCode || '');
        setPartnerApiKey(res.ADDINFO.partnerApiKey || '');
        setPartnerId(res.ADDINFO.partnerId || '');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to load merchant info');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!merchantCode) {
      Alert.alert('Error', 'Please wait for data to load...');
      return;
    }
    setBtnLoading(true);
    try {
      const result = await NativeModules.AepsModule.initCredo(
        merchantCode, partnerApiKey, partnerId
      );
      if (result === 'CANCELLED') {
        Alert.alert('Status', 'Transaction Cancelled by user');
      }
    } catch (error: any) {
      Alert.alert('SDK Error', error.message);
    } finally {
      setBtnLoading(false);
    }
  };

  const maskValue = (val: string) =>
    val ? val.slice(0, 2) + '••••' + val.slice(-3) : '—';

  return (
    <LinearGradient
      colors={['#0f3460', '#16213e', '#0d1b2a']}
      style={styles.root}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.hero}>
          <Text style={styles.heroLabel}>PAYSSPRINT DMT</Text>
          <Text style={styles.heroTitle}>Send{' '}
            <Text style={{ color: colorConfig.secondaryColor }}>{translate('Money')}</Text>
            {'\n'}Instantly
          </Text>
        </View>

        {/* Limit Card */}
        {/* <View style={styles.limitCard}>
          <Text style={styles.limitLabel}>TRANSFER LIMIT</Text>
          <Text style={styles.limitAmount}>₹25,000</Text>
          <Text style={styles.limitSub}>per transaction</Text>
        </View> */}

        {/* Info Card */}
        <View style={styles.glassCard}>
          <Text style={styles.sectionLabel}>MERCHANT DETAILS</Text>

          {loading ? (
            <ActivityIndicator color="#4cc9f0" style={{ marginVertical: 20 }} />
          ) : (
            <>
              <InfoRow icon="🔐" label="Merchant Code" value={maskValue(merchantCode)} />
              <InfoRow icon="🌐" label="Partner ID" value={maskValue(partnerId)} />
              <View style={styles.infoRow}>
                <Text style={styles.infoKey}>🛡 Status</Text>
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>Live</Text>
                </View>
              </View>
            </>
          )}
        </View>

      </ScrollView>



      {/* Bottom Button */}
      <View style={styles.btnWrap}>
    <DynamicButton title={btnLoading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>{translate('Proceed to Transfer')}  →</Text>
            }
onPress={handleNext}/>
      </View>
    </LinearGradient>
  );
};

const InfoRow = ({ icon, label, value }: any) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoKey}>{icon}  {label}</Text>
    <Text style={styles.infoVal}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: wScale(16), paddingBottom: hScale(10) },
  hero: { paddingVertical: hScale(24) },
  heroLabel: { fontSize: 11, color: 'rgba(255,255,255,0.45)', letterSpacing: 2, marginBottom: 6 },
  heroTitle: { fontSize: 28, fontWeight: '700', color: '#fff', lineHeight: 34 },
  limitCard: {
    backgroundColor: 'rgba(76,201,240,0.1)',
    borderWidth: 0.5, borderColor: 'rgba(76,201,240,0.3)',
    borderRadius: 20, padding: wScale(20),
    alignItems: 'center', marginBottom: hScale(12),
  },
  limitLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, marginBottom: 6 },
  limitAmount: { fontSize: 38, fontWeight: '700', color: '#fff' },
  limitSub: { fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20, padding: wScale(18), marginBottom: hScale(12),
  },
  sectionLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, marginBottom: 14 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: hScale(10),
    borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  infoKey: { fontSize: 13, color: 'rgba(255,255,255,0.5)' },
  infoVal: { fontSize: 13, color: '#4cc9f0', fontFamily: 'monospace', fontWeight: '600' },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(76,201,240,0.12)',
    borderWidth: 0.5, borderColor: 'rgba(76,201,240,0.3)',
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4cc9f0' },
  liveText: { fontSize: 11, color: '#4cc9f0', fontWeight: '600' },
  btnWrap: { padding: wScale(16), paddingBottom: hScale(100) },
  secNote: { fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginBottom: 10 },
  btn: { height: hScale(52), borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  btnText: { fontSize: 15, fontWeight: '700', color: '#fff', letterSpacing: 0.5 },
});

export default PaysprintDmt;