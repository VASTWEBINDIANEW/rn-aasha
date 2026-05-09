// RadiantStep.tsx

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { hScale } from '../../../utils/styles/dimensions';
import { colors } from '../../../utils/styles/theme';
import { StepBanner } from '../components/FormUI';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import ShowLoader from '../../../components/ShowLoder';

// ── Screens ───────────────────────────────────────────────
import AddressRadiant from './AddressRadiant ';
import Qualification from './Qualification';
import DrawingLaises from './DrawingLaises';
import ReferencesRadiant from './ReferencesRadiant';
import UploadDocRadiant from './UploadDocRadiant';
import BasicInfoScreen from './NewForm/BasicInfoScreen';
import DeclarationScreen from './NewForm/DeclarationScreen';
import PayoutTravelScreen from './NewForm/Payouttravelscreen ';
import BankAccountScreen from './NewForm/BankAccountScreen';
import SecurityChequeScreen from './NewForm/SecurityChequeScreen';
import DataPrivacyScreen from './NewForm/DataPrivacyScreen';
import AadhaarPanVerification from './NewForm/AadhaarPanVerification/AadhaarPanVerification';
import AddressScreen from './NewForm/AddressScreen';

import AttachedDocuments from './NewForm/AttachedDocuments';
import EducationScreen from './NewForm/EducationScreen';
import DrivingLicenseScreen from './NewForm/DrivingLicenseScreen';
import ReferenceScreen from './NewForm/ReferenceScreen';


// ── Step config (12 steps) ────────────────────────────────
const STEPS = [
  { label: 'KYC', icon: 'shield-check' }, // 0
  { label: 'Personal', icon: 'account' }, // 1
  { label: 'Address', icon: 'map-marker-outline' }, // 2
  { label: 'Education', icon: 'school-outline' }, // 3
  { label: 'References', icon: 'account-multiple-outline' }, // 4
  { label: 'Driving License', icon: 'card-account-details' }, // 5
  { label: 'Documents', icon: 'paperclip' }, // 6
  { label: 'Declaration', icon: 'clipboard-check-outline' }, // 7
  { label: 'Payout & Travel', icon: 'cash-fast' }, // 8
  { label: 'Bank Account', icon: 'account-cash-outline' }, // 9
  { label: 'Security Cheque', icon: 'checkbook' }, // 10
  { label: 'Data Privacy', icon: 'shield-lock-outline' }, // 11 ← added
];

const LABELS = STEPS.map(s => s.label);


const MANUAL_TRUE_STEPS = new Set([7, 11]); // Declaration + DataPrivacy

const STATUS_KEYS: (string | null)[] = [
  'aadharformstatus', // case 0  — KYC
  'Form1status',      // case 1  — Personal
  'Form2status',      // case 2  — Address
  'Form3status',      // case 3  — Education
  'Form4status',      // case 4  — References
  'Form5status',      // case 5  — Driving License
  'Form6status',      // case 6  — Documents
  'Form7status',      // case 7  — Declaration (manual true)
  'Form8status',      // case 8  — Payout & Travel
  'Form9status',      // case 9  — Bank Account
  'Form10status',      // case 10 — Security Cheque
  'Form11status',               // case 11 — Data Privacy (manual true)
];

// ── Pehla false status → usi step pe rok do ──────────────
const getInitialStep = (res: Record<string, boolean>): number => {
  console.log("All Steps",STATUS_KEYS.length);
  for (let i = 0; i < STATUS_KEYS.length; i++) {
    const key = STATUS_KEYS[i];
    if (key === null) continue;          // manual true — skip, aage jao
    if (!res[key]) return i;             // false mila → is step pe ruko
  }
   


  return STATUS_KEYS.length - 1;
};

// ─────────────────────────────────────────────────────────
const RadiantStep = () => {
  const { post } = useAxiosHook();
  const navigation = useNavigation<any>();

  const [currentPage, setCurrentPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // ── Single API call → first false step pe jump ────────
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        console.log('📡 FormStatus URL:', APP_URLS.RadiantFormALLStatus);
        const res = await post({ url: APP_URLS.RadiantFormALLStatus });
        console.log('✅ FormStatus RESPONSE:', JSON.stringify(res, null, 2));

        const step = getInitialStep(res ?? {});
        console.log(`🚀 Jumping to step ${step} (${LABELS[step]})`);
        setCurrentPage(step);
      } catch (err) {
        console.log('❌ FormStatus ERROR:', err);
        setCurrentPage(0);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
  }, []);
const isNavigating = useRef(false);

  // ── Screen renderer ───────────────────────────────────
  // ── true → aage, false → rok do ─────────────────────────
const goNext = useCallback(() => {
  if (isNavigating.current) return;   // ← yahi rokta hai rapid clicks
  isNavigating.current = true;

  setCurrentPage(prev => Math.min(prev + 1, STEPS.length - 1));

  setTimeout(() => { isNavigating.current = false; }, 800);
}, []);
  const getScreen = useCallback(() => {
    switch (currentPage) {
      case 0: return <AadhaarPanVerification onNext={goNext} />;
      case 1: return < BasicInfoScreen onNext={goNext} />;
      case 2: return < AddressScreen onNext={goNext} />;
      case 3: return <EducationScreen onNext={goNext} />;
      case 4: return <ReferenceScreen onNext={goNext} />;
      case 5: return < DrivingLicenseScreen onNext={goNext} />;
      case 6: return <AttachedDocuments onNext={goNext} />;
      case 7: return <DeclarationScreen onNext={goNext} />;
      case 8: return <PayoutTravelScreen onNext={goNext} />;
      case 9: return < BankAccountScreen onNext={goNext} />;
      case 10: return <SecurityChequeScreen onNext={goNext} />;
      case 11: return <DataPrivacyScreen onNext={goNext} />;

      default: return <BasicInfoScreen onNext={goNext} />;
    }
  }, [currentPage, goNext]);



  const onBack = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    } else {
      navigation.navigate('DashboardScreen');
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ShowLoader />
      </View>
    );
  }

  return (
    <View style={styles.main}>
      <StepBanner
        currentStep={currentPage}
      onBack={onBack}
      />
      {getScreen()}
    </View>
  );
};

export default RadiantStep;

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: colors.base,
    paddingBottom: hScale(40),
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.base,
  },
});