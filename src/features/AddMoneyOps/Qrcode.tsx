/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';

import { hScale, wScale } from '../../utils/styles/dimensions';
import { APP_URLS } from '../../utils/network/urls';
import useAxiosHook from '../../utils/network/AxiosClient';
import { useNavigation } from '../../utils/navigation/NavigationService';
import { RootState } from '../../reduxUtils/store/index';
import { useSelector } from 'react-redux';
import { decryptData } from '../../utils/encryptionUtils';

interface RouteParams {
  qrcode1response: string;
  generatedidresponse: string;
  amnt: string | number;
  generatedidData?: string;
  qrtsData?: string;
  msz?: string;
}

interface Props {
  route: {
    params: RouteParams;
  };
}

const QRCodePage: React.FC<Props> = ({ route }) => {
  const { qrcode1response, generatedidresponse, amnt } = route.params;

  const { colorConfig, IsDealer } = useSelector(
    (state: RootState) => state.userInfo,
  );

  const navigation = useNavigation();
  const { post, get } = useAxiosHook();

  const [timer, setTimer] = useState(120);
  const [isExpired, setIsExpired] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const previousBalanceRef = useRef<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const callCountRef = useRef<number>(0);

  // ✅ Aaj ki date — ek baar calculate karo
  const today = new Date();
  const formattedFrom = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const formattedTo = formattedFrom;

  // Handle both base64 formats
  const qrUri = qrcode1response?.startsWith('data:image')
    ? qrcode1response
    : `data:image/png;base64,${qrcode1response}`;

  useEffect(() => {
    console.log('====================');
    console.log('TXN ID =>', generatedidresponse);
    console.log('AMOUNT =>', amnt);
    console.log('QR LENGTH =>', qrcode1response?.length);
    console.log('QR SAMPLE =>', qrcode1response?.substring(0, 100));
    console.log('====================');
  }, []);

  // ✅ Timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          clearInterval(pollingRef.current!);
          clearInterval(intervalRef.current!);
          timerRef.current = null;
          pollingRef.current = null;
          intervalRef.current = null;
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ✅ Payment status polling (har 3 sec)
  useEffect(() => {
    if (!generatedidresponse) return;

    pollingRef.current = setInterval(async () => {
      try {
        const response = await post({
          url: `api/data/ICICIUPIRESPONSE?generatedid=${generatedidresponse}`,
        });

        console.log('Payment Status =>', response);

        if (
          response === 'Yes' ||
          response === true ||
          response?.status === 'SUCCESS'
        ) {
          clearInterval(pollingRef.current!);
          clearInterval(timerRef.current!);
          clearInterval(intervalRef.current!);
          pollingRef.current = null;
          timerRef.current = null;
          intervalRef.current = null;

          Alert.alert(
            'Payment Successful',
            'Your payment has been received successfully.',
            [{ text: 'OK', onPress: () => navigation.navigate('Home') }],
          );
        }
      } catch (error) {
        console.log('Payment Status Error =>', error);
      }
    }, 3000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [generatedidresponse]);

  // ✅ Balance + Report check function
  const getData = useCallback(async (isPolling = false) => {
    try {
      const userInfoRes = await get({ url: APP_URLS.getUserInfo });
      const userData = userInfoRes.data;
      const { kkkk: key, vvvv: iv } = userData;

      let currentBalance: string | null = null;

      if (!IsDealer) {
        // ✅ Fix: ? added before fromdate
        const response = await get({
          url: `${APP_URLS.balanceInfo}?fromdate=${formattedFrom}&todate=${formattedTo}`,
        });
        const balanceData = response.data?.[0] ?? {};
        currentBalance = balanceData?.remainbal ?? null;
      } else {
        const decrypted = {
          adminfarmname: decryptData(key, iv, userData.adminfarmname),
          posremain: decryptData(key, iv, userData.posremain),
          remainbal: decryptData(key, iv, userData.remainbal),
          frmanems: decryptData(key, iv, userData.frmanems),
          cmsremainbal: decryptData(key, iv, userData.cmsremainbal),
          holdandleanbal: decryptData(key, iv, userData.holdandleanbal),
        };
        currentBalance = decrypted?.remainbal ?? null;
      }

      // ✅ Fix: formattedDate → formattedFrom/formattedTo
      const reportRes = await post({
        url: `${APP_URLS.Addmoneyrep}txt_frm_date=${formattedFrom}&txt_to_date=${formattedTo}`,
      });
      const latestTxn = reportRes?.[0] ?? null;

      if (!isPolling) {
        // ✅ First call — balance save karo
        previousBalanceRef.current = currentBalance;
        console.log('Initial balance saved:', currentBalance);
      } else {
        const prev = previousBalanceRef.current;
        const curr = currentBalance;
        const reportPost = String(latestTxn?.remainpost ?? '');
        const finalPay = parseFloat(latestTxn?.finalpay ?? '0');
        const reportPre = String(latestTxn?.remainpre ?? '');

        console.log(`Polling — Prev: ${prev}, Curr: ${curr}, ReportPost: ${reportPost}, FinalPay: ${finalPay}`);

        const balanceUpdated = curr !== null && parseFloat(curr) > parseFloat(prev ?? '0');
        const reportMatches = curr !== null && reportPost !== '' && parseFloat(reportPost) === parseFloat(curr);
        const validFinalPay = finalPay > 0;

        if (balanceUpdated && reportMatches && validFinalPay) {
          Alert.alert(
            '✅ Balance Updated',
            `Previous Balance:  ₹${parseFloat(reportPre).toFixed(2)}\n` +
            `Amount Received:   ₹${finalPay.toFixed(2)}\n` +
            `New Balance:       ₹${parseFloat(reportPost).toFixed(2)}`,
            [
              {
                text: 'OK',
                onPress: () => navigation.navigate('Home'),
              },
            ],
          );

          previousBalanceRef.current = curr;

          // ✅ Balance polling band karo
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
            callCountRef.current = 0;
            console.log('Polling stopped — balance matched.');
          }
        }
      }
    } catch (error: any) {
      console.log(error);
      // ✅ Polling mein alert mat dikhao — sirf log karo
      if (!isPolling) {
        Alert.alert(
          error?.message === 'Network Error' ? 'Network Error' : 'Error',
          error?.message === 'Network Error'
            ? 'Please check your internet connection.'
            : 'Something went wrong. Try again later.',
        );
      }
    }
  }, [get, post, IsDealer, formattedFrom, formattedTo]);

  // ✅ Balance polling start
  const startBalancePolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    callCountRef.current = 0;

    const MAX_CALLS = 24; // 24 × 5sec = 2 min

    intervalRef.current = setInterval(async () => {
      callCountRef.current += 1;
      console.log(`Polling call #${callCountRef.current}`);

      await getData(true);

      if (callCountRef.current >= MAX_CALLS) {
        clearInterval(intervalRef.current!);
        intervalRef.current = null;
        callCountRef.current = 0;
        console.log('Polling stopped — 2 min complete.');
      }
    }, 5000);
  }, [getData]);

  // ✅ Mount pe init
  useEffect(() => {
    const init = async () => {
      await getData(false);
      startBalancePolling();
    };

    init();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? `0${secs}` : secs}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Scan & Pay</Text>
          <Text style={styles.subTitle}>Scan QR using any UPI App</Text>

          {!isExpired ? (
            <>
              <View style={styles.qrContainer}>
                <Image
                  source={{ uri: qrUri }}
                  style={styles.qrImage}
                  resizeMode="contain"
                  onError={e => console.log('QR IMAGE ERROR', e.nativeEvent)}
                />
              </View>

              <View style={styles.timerBox}>
                <Text style={styles.timer}>⏱ {formatTime(timer)}</Text>
              </View>

              <View style={styles.waitingBox}>
                <Text style={styles.waitingText}>Waiting for payment...</Text>
              </View>
            </>
          ) : (
            <View style={styles.expiredContainer}>
              <Text style={styles.expiredTitle}>QR Code Expired</Text>
              <Text style={styles.expiredText}>Please generate a new QR Code.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default QRCodePage;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F6FB' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, alignItems: 'center', elevation: 8 },
  title: { fontSize: 26, fontWeight: '700', color: '#111827' },
  subTitle: { fontSize: 14, color: '#6B7280', marginTop: 5, marginBottom: 20 },
  amountBox: { alignItems: 'center', marginBottom: 20 },
  amountLabel: { color: '#6B7280', fontSize: 14 },
  amount: { fontSize: 34, fontWeight: '800', color: '#16A34A' },
  qrContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 15, borderWidth: 1, borderColor: '#E5E7EB' },
  qrImage: { width: wScale(260), height: hScale(260) },
  timerBox: { marginTop: 15 },
  timer: { fontSize: 18, fontWeight: '700', color: '#EF4444' },
  txnBox: { width: '100%', marginTop: 20, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12 },
  txnLabel: { fontSize: 12, color: '#6B7280' },
  txnId: { fontSize: 14, fontWeight: '600', color: '#111827', marginTop: 4 },
  waitingBox: { marginTop: 20, backgroundColor: '#DCFCE7', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 30 },
  waitingText: { color: '#15803D', fontWeight: '600' },
  expiredContainer: { alignItems: 'center', paddingVertical: 40 },
  expiredTitle: { fontSize: 22, fontWeight: '700', color: '#DC2626' },
  expiredText: { marginTop: 10, color: '#6B7280' },
});