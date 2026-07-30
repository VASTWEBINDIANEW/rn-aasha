import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native'; // ← Alert add kiya

import { useSelector, useDispatch } from 'react-redux';

import RadiantTransactionScreen from './RadiantTransactionScreen';
import Pendingcms from './RadiantNewClient/Pendingcms';
import InterestVerification from './RadiantNewClient/InterestVerification';
import RadiantStep from './Radiantregister/RadiantStep';
import RadiantWellCome from './RadiantNewClient/RadiantWellCome';
import CheckPendingForm from './RadiantNewClient/CheckPendingForm';

import useAxiosHook from '../../utils/network/AxiosClient';
import { APP_URLS } from '../../utils/network/urls';
import { RootState } from '../../reduxUtils/store';
import {
  clearEntryScreen,
  setRceID,
  setRctype,
} from '../../reduxUtils/store/userInfoSlice';
import FaceDetectionScreen from './components/FaceDetectionScreen';
import PassportPhotoScreen from './components/FaceDetectionScreen';
import AttachedDocuments from './Radiantregister/NewForm/AttachedDocuments';
import SecurityChequeScreen from './Radiantregister/NewForm/SecurityChequeScreen';
import ApprovalStatusScreen from './Radiantregister/ApprovalStatusScreen';
import CmsNewPin from './RadiantTrxn/CmsNewPin';
import AboutCms from './RadiantNewClient/AboutCms';
import Availabilitybusiness from './RadiantNewClient/Availabilitybusiness';
import PartnerOnboardingScreen from './Radiantregister/PartnerOnboardingScreen';
import PartnerBasicInfoScreen from './Radiantregister/PartnerOnboardingForm/PartnerBasicInfoScreen';
import PartnerStep from './Radiantregister/PartnerOnboardingForm/PartnerStep';
import PartnerBankDetailsScreen from './Radiantregister/PartnerOnboardingForm/PartnerBankDetailsScreen';
import PartnerKycDocsScreen from './Radiantregister/PartnerOnboardingForm/PartnerKycDocsScreen';
import ClientApplicationStatusScreen from './CmsReport/ClientApplicationStatusScreen';
import Walletunloadreport from './CmsReport/CashPicUpReport';
import CashDepositReport from './CmsReport/CashDepositReport';
import PickupSalaryCalendar from './CmsSalarySheet/PickupSalaryCalendar';
import TermsScreen from './components/TermsScreen';
import CmsTab from './CmsTab';

const CmsScreen = () => {
  const { rceIdStatus } = useSelector((state: RootState) => state.userInfo);

  const [status, setStatus] = useState<boolean | null>(null);
  const [status2, setStatus2] = useState<string | null>(null);
  const [checkInfo, setCheckInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFinalPending, setIsFinalPending] = useState(false);

  const { post } = useAxiosHook();
  const dispatch = useDispatch();
const [showTerms, setShowTerms] = useState<boolean | null>(null);
useEffect(() => {
  const checkTerms = async () => {
    try {
      const res = await post({
url: APP_URLS.ShowchangesTerms
      });

      console.log('📥 Terms API:', res);

      if (res?.sts === true) {
        setShowTerms(true);   // 👉 TermsScreen dikhega
      } else {
        setShowTerms(false);  // 👉 normal flow chalega
      }

    } catch (err) {
      console.log('❌ Terms API Error:', err);
      setShowTerms(false);
    }
  };

  checkTerms();
}, []);

useEffect(() => {
  if (showTerms === false) {
    loadStatus();
  }
}, [showTerms]);

const loadStatus = async () => {
  console.log('🚀 loadStatus START');

  setLoading(true);
  dispatch(clearEntryScreen(null));

  try {
    const res1 = await post({ url: APP_URLS.RCEID });

    if (typeof res1 === 'string') {
      setLoading(false);
      return;
    }

    const s1 = res1?.Content?.ADDINFO?.sts ?? null;
    const t1 = res1?.Content?.ADDINFO?.Type ?? null;
    const rceID = res1?.Content?.ADDINFO?.CEID ?? null;

    setStatus(s1);
    dispatch(setRctype(t1));
    dispatch(setRceID(rceID));

    if (s1 === false && rceID !== null && rceID !== 'NOTFound') {
      Alert.alert('Info', `CEID: ${rceID}`);
      setLoading(false);
      return;
    }

    if (s1 === false) {
      const res2 = await post({
        url: APP_URLS.RadiantCEIntersetCheck,
      });

      const s2 = res2?.Content?.ADDINFO?.sts ?? null;
      setStatus2(s2);

      if (s2 === 'Success' || s2 === 'DocVerification') {
        const res3 = await post({
          url: APP_URLS.CheckPendingForm,
        });

        const checkStatus = res3?.status ?? null;
        setCheckInfo(checkStatus);
      }
    }
  } catch (error) {
    console.error('❌ ERROR:', error);
  }

  setLoading(false);
};
  useEffect(() => {


    loadStatus();
  }, [dispatch]);

  if (loading || status === null || (status === false && status2 === null)) {
    return <RadiantWellCome />;
  }

const renderScreen = () => {
  if (showTerms === null) {
  return <RadiantWellCome />; // loader ya splash
}

if (showTerms === true) {
  return <TermsScreen />; // ✅ direct terms screen
}
  if (status === true) {
    return <RadiantTransactionScreen />;
  }

  if (status === false) {
    // ✅ status2 null hai matlab InterestCheck abhi nahi hua
    if (status2 === null) {
      return <InterestVerification />;
    }

    switch (status2) {
      case 'Pending':
      case 'DocPending':
      case 'CERegPending':
      case 'CEPointsPending':
        return <Pendingcms />;

      case 'Success':
      case 'DocVerification':
        if (checkInfo === 'Pending') return <CheckPendingForm />;
        if (checkInfo === 'Approved') return <ApprovalStatusScreen />;
        return <RadiantStep />; // ← fallthrough fix

      case 'DocSuccess':
        return <RadiantTransactionScreen />;

      default:
        return <InterestVerification />;
    }
  }

  return <RadiantWellCome />;
};
let num = 15;

if (num % 2 === 0) {
  console.log("Even");
} else {
  console.log("Odd");
}
function checkEven(num) {
  return num % 2 === 0;
}

console.log(checkEven(4));
  return (
    <View style={styles.container}>
      {renderScreen()}
    {/* <CmsTab/> */}
    </View>
  );
};
function reverse(str) {
  return str.split("").reverse().join("");
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default CmsScreen;