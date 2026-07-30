// PartnerStep.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../reduxUtils/store';
import useAxiosHook from '../../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../../utils/network/urls';
import PartnerBasicInfoScreen from './PartnerBasicInfoScreen';
import PartnerBankDetailsScreen from './PartnerBankDetailsScreen';
import PartnerKycDocsScreen from './PartnerKycDocsScreen';
import { StepBanner } from '../../components/FormUI';
import ShowLoader from '../../../../components/ShowLoder';
import { colors } from '../../../../utils/styles/theme';

import { hScale, wScale } from '../../../../utils/styles/dimensions';
import ClientApplicationStatusScreen from '../../CmsReport/ClientApplicationStatusScreen';

// ── Step config (3 steps) ──────────────────────────────────
const STEPS = [
  { label: 'Personal',     icon: 'account' },              // 0 — PartnerBasicInfoScreen
  { label: 'KYC & GST',    icon: 'card-account-details' },  // 1 — Aadhaar/PAN/GST
  { label: 'Bank Details', icon: 'bank' },                  // 2 — Bank + Cheque
];

const LABELS = STEPS.map(s => s.label);

// ── Status keys — backend response se exact match ─────────
const STATUS_KEYS: (string | null)[] = [
  'PartnerForm1status', // case 0 — Personal
  'PartnerForm2status', // case 1 — KYC & GST
  'PartnerForm3status', // case 2 — Bank Details
];

// ── Pehla false status → usi step pe rok do ──────────────
const getInitialStep = (res: Record<string, boolean>): number => {
  console.log('All Steps', STATUS_KEYS.length);
  for (let i = 0; i < STATUS_KEYS.length; i++) {
    const key = STATUS_KEYS[i];
    if (key === null) continue;
    if (!res[key]) return i;
  }
  return STATUS_KEYS.length - 1;
};

// ─────────────────────────────────────────────────────────
const PartnerStep = () => {
  const { post } = useAxiosHook();
  const navigation = useNavigation<any>();
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const PRIMARY = colorConfig?.primaryColor ?? colors.primary;

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // ── Tab — 0: Form, 1: Application Status ──────────────
  const [activeTab, setActiveTab] = useState<0 | 1>(0);

  // // ── Single API call → first false status pe jump ────────
  // useEffect(() => {
  //   const fetchStatus = async () => {
  //     try {
  //       console.log('📡 PartnerFormStatus URL:', APP_URLS.PartnerFormALLStatus);
  //       const res = await post({ url: APP_URLS.PartnerFormALLStatus });
  //       console.log('✅ PartnerFormStatus RESPONSE:', JSON.stringify(res, null, 2));

  //       const step = getInitialStep(res ?? {});
  //       console.log(`🚀 Jumping to step ${step} (${LABELS[step]})`);
  //       setCurrentPage(step);
  //     } catch (err) {
  //       console.log('❌ PartnerFormStatus ERROR:', err);
  //       setCurrentPage(0);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchStatus();
  // }, []);

  const isNavigating = useRef(false);

  // ── Rapid-click guard ───────────────────────────────────
  const goNext = useCallback(() => {
    if (isNavigating.current) return;
    isNavigating.current = true;

    setCurrentPage(prev => Math.min(prev + 1, STEPS.length - 1));

    setTimeout(() => { isNavigating.current = false; }, 800);
  }, []);

  const getScreen = useCallback(() => {
    switch (currentPage) {
      case 0: return <PartnerBasicInfoScreen onNext={goNext} />;
      case 1: return <PartnerKycDocsScreen onNext={goNext} />;
      case 2: return <PartnerBankDetailsScreen onNext={goNext} />;
      default: return <PartnerBasicInfoScreen onNext={goNext} />;
    }
  }, [currentPage, goNext]);

  const onBack = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    } else {
      navigation.navigate('DashboardScreen');
    }
  };

  // if (loading) {
  //   return (
  //     <View style={styles.loader}>
  //       <ShowLoader />
  //     </View>
  //   );
  // }

  return (
    <View style={styles.main}>

      {/* ── Tab Bar — StepBanner se pehle ──────────────── */}
      <View style={[styles.tabBar, { borderBottomColor: `${PRIMARY}30` }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 0 && { borderBottomColor: PRIMARY, borderBottomWidth: wScale(2.5) },
          ]}
          onPress={() => setActiveTab(0)}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, { color: activeTab === 0 ? PRIMARY : colors.subtext ?? '#888' }]}>
            Registration Form
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 1 && { borderBottomColor: PRIMARY, borderBottomWidth: wScale(2.5) },
          ]}
          onPress={() => setActiveTab(1)}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, { color: activeTab === 1 ? PRIMARY : colors.subtext ?? '#888' }]}>
            Application Status
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Tab 0: StepBanner + Form screens ───────────── */}
      {activeTab === 0 && (
        <View style={styles.content}>
          <StepBanner
            currentStep={currentPage}
            onBack={onBack}
            steps={STEPS}
          />
          {getScreen()}
        </View>
      )}

      {/* ── Tab 1: Application Status ───────────────────── */}
      {activeTab === 1 && (
        <View style={styles.content}>
          <ClientApplicationStatusScreen />
        </View>
      )}

    </View>
  );
};

export default PartnerStep;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: colors.base,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.base,
  },

  // ── Tab Bar ──
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: hScale(12),
    borderBottomWidth: wScale(2.5),
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: wScale(13),
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ── Content ──
  content: {
    flex: 1,
  },
});