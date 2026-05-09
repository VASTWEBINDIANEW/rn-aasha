/* eslint-disable react/no-unstable-nested-components */
import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, StyleSheet, Alert, Text, Modal,
  TouchableOpacity, ActivityIndicator,
  ScrollView, StatusBar, BackHandler,
} from 'react-native';
import { useSelector } from 'react-redux';

import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { hScale, wScale } from '../../../utils/styles/dimensions';

import { AepsContext } from './context/AepsContext';
import { RootState } from '../../../reduxUtils/store';

import AepsCW            from './AepsCashwithdrawl';
import BalanceCheck      from './Balancecheck';
import AepsMinistatement from './AepsMinistatement';
import AdharPay          from './aadharpay';

import CheckBlance   from '../../../utils/svgUtils/CheckBlance';
import Aeps          from '../../../utils/svgUtils/Aeps';
import AadharPaysvg  from '../../../utils/svgUtils/AadhaarPaysvg';
import StatementSvg  from '../../../utils/svgUtils/StatementSvg';
import { translate } from '../../../utils/languageUtils/I18n';

// ─── Screen map ───────────────────────────────────────────────────────────────
const SCREEN_MAP: Record<string, React.ComponentType> = {
  AepsCW,
  BalanceCheck,
  AepsMiniStatement: AepsMinistatement,
  AadharPay:         AdharPay,
};

// ─── Service config ───────────────────────────────────────────────────────────
const SERVICES = [
  {
    key:      'AepsCW',
    title:    'Cash\nWithdrawal',
    subtitle: 'Withdraw cash via Aadhaar',
    icon:     () => <AadharPaysvg />,
    barColor: '#4CAF50',
  },
  {
    key:      'BalanceCheck',
    title:    'Balance\nCheck',
    subtitle: 'Check account balance',
    icon:     () => <CheckBlance />,
    barColor: '#2196F3',
  },
  {
    key:      'AepsMiniStatement',
    title:    'Mini\nStatement',
    subtitle: 'View last transactions',
    icon:     () => <StatementSvg />,
    barColor: '#FF9800',
  },
  {
    key:      'AadharPay',
    title:    'Aadhaar\nPay',
    subtitle: 'Pay using Aadhaar',
    icon:     () => <Aeps />,
    barColor: '#9C27B0',
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
const AepsTabScreen = () => {
  const navigation = useNavigation<any>();
  const { get }    = useAxiosHook();

  const { colorConfig, activeAepsLine } = useSelector((s: RootState) => s.userInfo);
  const color1     = colorConfig.primaryColor;
  const themeColor = activeAepsLine ? '#1FAA59' : '#F4C430';
  const themeBg    = activeAepsLine ? '#E8F5E9' : '#FFFDE7';

  const [activeService, setActiveService] = useState<string | null>(null);
  const [UserStatus, setUserStatus]       = useState('');
  const [showEkycModal, setShowEkycModal] = useState(false);
  const [isProcessing, setIsProcessing]   = useState(false);

  const prevLineRef  = useRef(activeAepsLine);
  const isApiCalling = useRef(false);

  // ── Context state ──
  const [fingerprintData, setFingerprintData] = useState<any>();
  const [aadharNumber,    setAadharNumber]    = useState('');
  const [bankName,        setBankName]        = useState('');
  const [mobileNumber,    setMobileNumber]    = useState('');
  const [consumerName,    setConsumerName]    = useState('');
  const [isValid,         setIsValid]         = useState(false);
  const [deviceName,      setDeviceName]      = useState('Device');
  const [bankid,          setBankId]          = useState('');

  // ── Android back ──
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (activeService) { setActiveService(null); return true; }
      return false;
    });
    return () => sub.remove();
  }, [activeService]);

  // ── API: AEPS status ──
  const CheckAeps = useCallback(async () => {
    try {
      const url = activeAepsLine
        ? 'AEPS/api/Nifi/data/AepsStatusCheck'
        : 'AEPS/api/data/AepsStatusCheck';
      const response = await get({ url });
      if (response?.Response === 'Success') {
        setUserStatus('Success');
      } else {
        navigation.navigate('ServicepurchaseScreen', { typename: 'AEPS' });
      }
    } catch (err: any) {
      console.error('AEPS status check error:', err?.message);
    }
  }, [activeAepsLine, get]);

  // ── API: eKYC status ──
  const CheckEkyc = useCallback(async () => {
    if (isApiCalling.current) return;
    try {
      setIsProcessing(true);
      isApiCalling.current = true;
      const finalUrl = activeAepsLine ? 'AEPS/api/Nifi/data/CheckEkyc' : APP_URLS.checkekyc;
      const response = await get({ url: finalUrl });

      if (typeof response === 'string' && response.includes('<!DOCTYPE html>')) {
        throw new Error('Server Error (404/500)');
      }
      const msg    = response?.Message;
      const status = response?.Status;

      if (status === true)        { await CheckAeps(); return; }
      if (msg === '2FAREQUIRED')  { setUserStatus('Success'); return; }
      if (msg === 'REQUIREDOTP')  { setUserStatus(msg); setShowEkycModal(true); return; }
      if (msg === 'REQUIREDSCAN') { navigation.navigate('Aepsekycscan'); return; }

      Alert.alert(
        translate('notice') || 'Notice',
        msg || 'Unknown Status',
        [{ text: 'Go Back', onPress: () => navigation.goBack() }]
      );
    } catch (e: any) {
      Alert.alert('API Error', e?.message || 'Internal Server Error');
    } finally {
      isApiCalling.current = false;
      setIsProcessing(false);
    }
  }, [activeAepsLine, get, CheckAeps]);

  useEffect(() => {
    if (prevLineRef.current !== activeAepsLine || UserStatus === '') {
      CheckEkyc();
      prevLineRef.current = activeAepsLine;
    }
  }, [activeAepsLine, CheckEkyc]);

  // ── Context value ──
  const contextValue = {
    fingerprintData, setFingerprintData,
    aadharNumber,    setAadharNumber,
    consumerName,    setConsumerName,
    mobileNumber,    setMobileNumber,
    bankName,        setBankName,
    scanFingerprint: null,
    isValid,         setIsValid,
    deviceName,      setDeviceName,
    bankid,          setBankId,
  };

  // ── Glass Header (shared) ──
  const GlassHeader = ({
    title,
    subtitle,
    onBack,
  }: {
    title: string;
    subtitle: string;
    onBack: () => void;
  }) => (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backArrow}>‹</Text>
      </TouchableOpacity>
      <View style={styles.headerTextWrap}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Text style={styles.headerSub}>{subtitle}</Text>
      </View>
      <View style={[styles.lineChip, { borderColor: themeColor }]}>
        <View style={[styles.lineDot, { backgroundColor: themeColor }]} />
        <Text style={[styles.lineLabel, { color: themeColor }]}>
          {activeAepsLine ? 'NIFI' : 'Standard'}
        </Text>
      </View>
    </View>
  );

  // ── Active service render ──
  const renderActiveService = () => {
    const Screen = SCREEN_MAP[activeService!];
    if (!Screen) return null;
    const svc = SERVICES.find(s => s.key === activeService);
    return (
      <View style={[styles.root, { backgroundColor: color1 }]}>
        <GlassHeader
          title={svc?.title.replace('\n', ' ') ?? ''}
          subtitle="AEPS Services"
          onBack={() => setActiveService(null)}
        />
        <Screen />
      </View>
    );
  };

  // ── Service card ──
  const ServiceCard = ({ item }: { item: (typeof SERVICES)[number] }) => {
    const Icon = item.icon;
    return (
      <TouchableOpacity
        activeOpacity={0.82}
        style={styles.card}
        onPress={() => setActiveService(item.key)}
      >
        {/* Left accent bar */}
        <View style={[styles.cardAccentBar, { backgroundColor: item.barColor }]} />

        {/* Icon bubble */}
        <View style={styles.iconBubble}>
          <Icon />
        </View>

        <Text style={styles.cardTitle}>{translate(item.title)}</Text>
        <Text style={styles.cardSub}>{item.subtitle}</Text>

        {/* Arrow chip */}
        <View style={styles.arrowChip}>
          <Text style={styles.arrowText}>→</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ── Main render ──
  return (
    <AepsContext.Provider value={contextValue}>
      <StatusBar barStyle="light-content" backgroundColor={color1} />

      {activeService ? (
        renderActiveService()
      ) : (
        <View style={[styles.root, { backgroundColor: color1 }]}>
          {/* Background blobs */}
          <View style={styles.blob1} />
          <View style={styles.blob2} />

          <GlassHeader
            title="AEPS Services"
            subtitle="Aadhaar Enabled Payment System"
            onBack={() => navigation.goBack()}
          />

          {isProcessing ? (
            <View style={styles.loaderWrap}>
              <ActivityIndicator size="large" color="rgba(255,255,255,0.9)" />
              <Text style={styles.loaderText}>
                {translate('checking_status') || 'Checking Status…'}
              </Text>
            </View>
          ) : UserStatus === 'Success' ? (
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.sectionLabel}>{translate('Choose a Service')}</Text>

              <View style={styles.grid}>
                {SERVICES.map((item) => (
                  <ServiceCard key={item.key} item={item} />
                ))}
              </View>

              <Text style={styles.footerNote}>
                {'🔒 '}{translate('Transactions are secured via biometric authentication') ||
                  'Transactions are secured via biometric authentication'}
              </Text>
            </ScrollView>
          ) : null}

          {/* eKYC Modal */}
          <Modal
            visible={showEkycModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowEkycModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalCard}>
                {/* Top accent */}
                <View style={[styles.modalTopBar, { backgroundColor: themeColor }]} />

                <View style={[styles.modalIconCircle, { backgroundColor: themeBg }]}>
                  <Text style={{ fontSize: 26 }}>{'🔔'}</Text>
                </View>
                <Text style={[styles.modalTitle, { color: themeColor }]}>
                  {translate('Required') || 'Action Required'}
                </Text>
                <Text style={styles.modalBody}>
                  {translate('key_thisaeps_147') ||
                    'Please complete your e-KYC to proceed with this service.'}
                </Text>
                <View style={styles.modalRow}>
                  <TouchableOpacity
                    style={styles.modalCancelBtn}
                    onPress={() => setShowEkycModal(false)}
                  >
                    <Text style={styles.modalCancelText}>
                      {translate('cancel') || 'Cancel'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalPrimaryBtn, { backgroundColor: themeColor }]}
                    onPress={() => {
                      setShowEkycModal(false);
                      navigation.replace('Aepsekyc');
                    }}
                  >
                    <Text style={styles.modalPrimaryText}>
                      {translate('Complete_eKYC') || 'Complete eKYC'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      )}
    </AepsContext.Provider>
  );
};

export default AepsTabScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, overflow: 'hidden' },

  // Background blobs
  blob1: {
    position: 'absolute', top: -hScale(80), right: -wScale(80),
    width: wScale(260), height: wScale(260), borderRadius: wScale(130),
    backgroundColor: 'rgba(255,255,255,0.07)',
  },
  blob2: {
    position: 'absolute', bottom: hScale(80), left: -wScale(60),
    width: wScale(180), height: wScale(180), borderRadius: wScale(90),
    backgroundColor: 'rgba(255,255,255,0.05)',
  },

  // Glass Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: hScale(16), paddingBottom: hScale(18),
    paddingHorizontal: wScale(16),
    borderBottomLeftRadius: 24, borderBottomRightRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.18)',
  },
  backBtn: {
    width: wScale(34), height: wScale(34), borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: wScale(10),
  },
  backArrow:      { fontSize: wScale(20), color: '#fff', fontWeight: '300', lineHeight: 22 },
  headerTextWrap: { flex: 1 },
  headerTitle:    { fontSize: wScale(17), fontWeight: '800', color: '#fff' },
  headerSub:      { fontSize: wScale(11), color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  lineChip: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    paddingHorizontal: wScale(10), paddingVertical: hScale(5),
    borderRadius: 20,
  },
  lineDot:   { width: 7, height: 7, borderRadius: 4, marginRight: 5 },
  lineLabel: { fontSize: wScale(11), fontWeight: '700' },

  // Loader
  loaderWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 12, fontSize: wScale(14), color: 'rgba(255,255,255,0.8)' },

  // Scroll + Grid
  scrollContent: {
    paddingHorizontal: wScale(14),
    paddingTop: hScale(20),
    paddingBottom: hScale(30),
  },
  sectionLabel: {
    fontSize: wScale(11), fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1.5, textTransform: 'uppercase',
    marginBottom: hScale(14),
  },
  grid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', gap: wScale(12),
  },

  // Glass Service Card
  card: {
    width: '47.5%',
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
    padding: wScale(14),
    overflow: 'hidden',
    marginBottom: hScale(4),
  },
  cardAccentBar: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 4,
    borderTopLeftRadius: 20, borderBottomLeftRadius: 20,
  },
  iconBubble: {
    width: wScale(44), height: wScale(44), borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: hScale(10),
  },
  cardTitle: {
    fontSize: wScale(14), fontWeight: '800',
    color: '#fff', lineHeight: 20, marginBottom: 3,
  },
  cardSub: {
    fontSize: wScale(11), color: 'rgba(255,255,255,0.6)',
    lineHeight: 15, marginBottom: hScale(12),
  },
  arrowChip: {
    width: wScale(28), height: wScale(28), borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center', justifyContent: 'center',
  },
  arrowText: { color: '#fff', fontSize: wScale(13), fontWeight: '700' },

  footerNote: {
    textAlign: 'center',
    fontSize: wScale(11),
    color: 'rgba(255,255,255,0.45)',
    marginTop: hScale(20),
  },

  // eKYC Modal
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center', alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24, padding: 24,
    alignItems: 'center', overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 12,
  },
  modalTopBar: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 5,
  },
  modalIconCircle: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 8, marginBottom: 14,
  },
  modalTitle: {
    fontSize: wScale(18), fontWeight: '800',
    textAlign: 'center', marginBottom: 8,
  },
  modalBody: {
    fontSize: wScale(13), color: '#666',
    textAlign: 'center', lineHeight: 20, marginBottom: 24,
  },
  modalRow: {
    flexDirection: 'row', width: '100%', justifyContent: 'space-between',
  },
  modalCancelBtn: {
    flex: 1, height: 46, justifyContent: 'center', alignItems: 'center',
    marginRight: 10,
  },
  modalCancelText: { color: '#999', fontWeight: '600', fontSize: wScale(14) },
  modalPrimaryBtn: {
    flex: 1.5, height: 46, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center',
  },
  modalPrimaryText: { color: '#fff', fontWeight: '800', fontSize: wScale(14) },
});