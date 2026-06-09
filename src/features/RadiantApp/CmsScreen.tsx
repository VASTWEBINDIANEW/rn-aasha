import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';  // ← Alert add kiya
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

const CmsScreen = () => {

  const [status, setStatus] = useState<boolean | null>(null);
  const [status2, setStatus2] = useState<string | null>(null);
  const [checkInfo, setCheckInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFinalPending, setIsFinalPending] = useState(false);

  const { post } = useAxiosHook();
  const dispatch = useDispatch();

  useEffect(() => {
    const loadStatus = async () => {
      console.log('🚀 loadStatus START');

      setLoading(true);
      dispatch(clearEntryScreen(null));

      try {
        const res1 = await post({ url: APP_URLS.RCEID });
        console.log('📡 URL =', APP_URLS.RCEID);

        if (typeof res1 === 'string') {
          console.log('HTML RESPONSE RECEIVED');
          setLoading(false);
          return;
        }

        console.log('✅ RCEID RESPONSE:', JSON.stringify(res1, null, 2));

        const s1 = res1?.Content?.ADDINFO?.sts ?? null;
        const t1 = res1?.Content?.ADDINFO?.Type ?? null;
        const rceID = res1?.Content?.ADDINFO?.CEID ?? null;

        console.log('📊 Parsed:', { s1, t1, rceID });

        setStatus(s1);
        dispatch(setRctype(t1));
        dispatch(setRceID(rceID));

        if (s1 === false) {
  if (rceID === 'NOTFound') {
    console.log('🔴 CEID = NOTFound → InterestVerification');
    setLoading(false);
    return;
  }

  // ⚠️ NOTFound nahi aaya — Alert dikhao
  if (rceID !== null && rceID !== '' && rceID !== 'NOTFound') {
    console.log('⚠️ CEID unexpected value:', rceID);
    Alert.alert('CEID Info', `CEID: ${rceID}`);
  }

  setLoading(false);
  return;
}

        // =======================
        // 🔹 API 3: Interest Check (sirf tab jab s1 === true ya CEID normal ho)
        // =======================
        if (s1 === false) {
          console.log('📡 Calling API: RadiantCEIntersetCheck');

          const res2 = await post({
            url: APP_URLS.RadiantCEIntersetCheck,
          });

          console.log('✅ InterestCheck RESPONSE:', JSON.stringify(res2, null, 2));

          const s2 = res2?.Content?.ADDINFO?.sts ?? null;
          setStatus2(s2);

          console.log('📊 status2:', s2);

          // =======================
          // 🔹 API 4: CheckPendingForm
          // =======================
          if (s2 === 'Success' || s2 === 'DocVerification') {
            console.log('📡 Calling API: CheckPendingForm');

            const res3 = await post({
              url: APP_URLS.CheckPendingForm,
            });

            console.log('✅ CheckPendingForm RESPONSE:', JSON.stringify(res3, null, 2));

            const checkStatus = res3?.status ?? null;
            setCheckInfo(checkStatus);

            console.log('📊 checkInfo:', checkStatus);
          }
        }

      } catch (error) {
        console.error('❌ ERROR:', error);
      }

      console.log('🏁 loadStatus END');
      setLoading(false);
    };

    loadStatus();
  }, [dispatch]);


  if (loading || status === null) {
    return <RadiantWellCome />;
  }

  const renderScreen = () => {
    if (status === true) {
      return <RadiantTransactionScreen />;
    }

    if (status === false) {
      // ✅ CEID = NOTFound → status2 kabhi set nahi hoga → seedha InterestVerification
      // if (status2 === null) {
      //   return <InterestVerification />;
      // }

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
          return <RadiantStep />;

        case 'DocSuccess':
          return <RadiantTransactionScreen />;

        // default:
        //   return <InterestVerification />;
      }
    }

    return <RadiantWellCome />;
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
      {/* <SecurityChequeScreen/> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default CmsScreen;