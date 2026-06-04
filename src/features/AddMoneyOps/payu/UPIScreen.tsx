import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, NativeModules,
  SafeAreaView, StatusBar,
  BackHandler
} from 'react-native';
import { sha512 } from 'js-sha512';
import { RootState } from '../../../reduxUtils/store';
import { useSelector } from 'react-redux';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { translate } from '../../../utils/languageUtils/I18n';
import DynamicButton from '../../drawer/button/DynamicButton';
import { useNavigation } from '../../../utils/navigation/NavigationService';

const { PayUUPI } = NativeModules;

const UPIScreen = () => {
  const { payuData, payutxnid ,colorConfig} = useSelector((state: RootState) => state.userInfo);
  const [vpa, setVpa]           = useState('');
  const [loading, setLoading]   = useState(false);
  const { post }                = useAxiosHook();

  const merchantKey     = payuData?.Merchantkey || '';
  const salt            = payuData?.MerchantSalt || '';
  const amount          = payuData?.amount || '';
  const txnId           = payutxnid || '';
  const productInfo     = 'Mobile Phone';
  const firstName       = payuData?.name || '';
  const phone           = payuData?.mobile || '';
  const email           = payuData?.email || '';
  const environment     = '0';
  const userCredentials = `${merchantKey}:${email}`;
  const surl            = payuData?.txnsuccessUrl || '';
  const furl            = payuData?.txnfailureUrl || '';
  const postUrl         = environment === '0'
    ? 'https://secure.payu.in/_payment'
    : 'https://test.payu.in/_payment';

  const generateHash = () => {
    const str = `${merchantKey}|${txnId}|${amount}|${productInfo}|${firstName}|${email}|udf1|udf2|udf3|udf4|udf5||||||${salt}`;
    return sha512(str);
  };

  const generateVpaHash = () => {
    const str = `${merchantKey}|validate_vpa|${vpa}|${salt}`;
    return sha512(str);
  };

  const sendResponse = async (response: any) => {
    console.log('Received data raw:', JSON.stringify(response));

    let results: any = null;

    try {
      const parsed = typeof response === 'string' ? JSON.parse(response) : response;
      results = parsed?.result ?? parsed;
    } catch (e) {
      Alert.alert(translate('Error'), translate('Invalid response format'));
      return;
    }

    if (!results?.status) {
      Alert.alert(translate('Error'), translate('Missing status in response'));
      return;
    }

    const ResponsePayload = {
      Response: JSON.stringify({
        result: {
          PG_TYPE:       results.PG_TYPE ?? 'UPI-PG',
          amount:        String(results.amount ?? amount),
          bank_ref_num:  results.bank_ref_num ?? results.bank_ref_no ?? '',
          bankcode:      results.bankcode ?? '',
          error_Message: results.error_Message ?? results.field9 ?? 'No Error',
          mihpayid:      String(results.mihpayid ?? ''),
          mode:          results.mode ?? 'UPI',
          status:        results.status ?? 'failed',
          txnid:         results.txnid ?? txnId,
        },
      }),
    };

    console.log('🔥 Final Payload:', JSON.stringify(ResponsePayload, null, 2));

    try {
      const apiResponse = await post({
        url: 'PaymentGateway/api/data/Gatewayresponse',
        data: ResponsePayload,
      });

      console.log('✅ API Success:', JSON.stringify(apiResponse));

      const serverMessage  = apiResponse?.Message ?? apiResponse?.data?.Message ?? '';
      const serverResponse = apiResponse?.Response ?? apiResponse?.data?.Response ?? '';

      if (results.status === 'success') {
        // Alert.alert(
        //   translate('Payment Successful'),
        //   serverMessage || translate('Your payment has been completed successfully.'),
        //   [{ text: translate('OK') }]
        // );


          Alert.alert(
                "Payment Successful",
           serverMessage || translate('Your payment has been completed successfully.'),
                [
                    {
                        text: "Go Back",
                        onPress: () => {
                            navigation.navigate('DashboardScreen')
                        },
                    },


                    {
                        text: "Cancel",
                        style: "cancel",
                    },
                ]
            );
      } else {
        const userMessage =
          results.error_Message ||
          results.field9 ||
          translate('Payment failed. Please try again.');
  Alert.alert(
                "Payment Failed",
          userMessage,
                [
                    {
                        text: "Go Back",
                        onPress: () => {
                            navigation.navigate('DashboardScreen')
                        },
                    },


                    {
                        text: "Cancel",
                        style: "cancel",
                    },
                ]
            );
        // Alert.alert(
        //   translate('Payment Failed'),
        //   userMessage,
        //   [{ text: translate('OK') }]
        // );
      }
    } catch (error: any) {
      console.error('❌ API Error:', error?.response?.data ?? error.message);
      Alert.alert(translate('Error'), translate('Something went wrong. Please try again.'));
    }
  };

  const handleSuccess = (response: any) => {
    setLoading(false);
    console.log('✅ PayU Success:', JSON.stringify(response));
    sendResponse(response);
  };

  const handleError = (error: any) => {
    setLoading(false);
    console.log('❌ PayU Error:', JSON.stringify(error));
    sendResponse(error);
  };

  const payViaUPICollect = () => {
    if (!vpa || !vpa.includes('@')) {
      Alert.alert(translate('Invalid UPI ID'), translate('Please enter a valid UPI ID\nExample: name@upi'));
      return;
    }

    const hash    = generateHash();
    const vpaHash = generateVpaHash();
    setLoading(true);

    const params = {
      payu_payment_params: {
        key:              merchantKey,
        transaction_id:   txnId,
        amount,
        product_info:     productInfo,
        first_name:       firstName,
        email,
        phone,
        android_surl:     surl,
        android_furl:     furl,
        ios_surl:         surl,
        ios_furl:         furl,
        environment,
        isProduction:     environment === '0',
        payment_mode:     'UPI-PG',
        post_url:         postUrl,
        user_credentials: userCredentials,
        vpa,
        udf1: 'udf1', udf2: 'udf2', udf3: 'udf3', udf4: 'udf4', udf5: 'udf5',
        hashes: { payment: hash, validate_vpa: vpaHash },
      },
    };

    PayUUPI.makeUPIPaymentSeamless(
      params,
      (err: any) => handleError(err),
      (res: any) => handleSuccess(res)
    );
  };
      const navigation = useNavigation<any>();
  
  useEffect(() => {
        const backAction = () => {
            Alert.alert(
                "Confirmation",
                "Do you want to cancel txn or go back?",
                [
                    {
                        text: "Go Back",
                        onPress: () => {
                            navigation.navigate('DashboardScreen')
                        },
                    },


                    {
                        text: "Cancel",
                        style: "cancel",
                    },
                ]
            );

            return true;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, []);
  const payViaUPIIntent = () => {
    const hash = generateHash();
    setLoading(true);

    const params = {
      payu_payment_params: {
        key:              merchantKey,
        transaction_id:   txnId,
        amount,
        product_info:     productInfo,
        first_name:       firstName,
        email,
        phone,
        android_surl:     surl,
        android_furl:     furl,
        ios_surl:         surl,
        ios_furl:         furl,
        environment,
        isProduction:     environment === '0',
        payment_mode:     'INTENT',
        post_url:         postUrl,
        user_credentials: userCredentials,
        udf1: 'udf1', udf2: 'udf2', udf3: 'udf3', udf4: 'udf4', udf5: 'udf5',
        hashes: { payment: hash },
      },
    };

    PayUUPI.makeUPIPayment(
      params,
      (err: any) => handleError(err),
      (res: any) => handleSuccess(res)
    );
  };

  // ─── LOADER ───────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={styles.loaderContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#f0f4ff" />
        <View style={styles.loaderBox}>
          <View style={styles.loaderCard}>
            <ActivityIndicator size="large" color={colorConfig.secondaryColor} />
            <Text style={styles.loaderTitle}>{translate('Processing Payment')}</Text>
            <Text style={styles.loaderSubtitle}>{translate('Please do not close the app...')}</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // ─── MAIN UI ──────────────────────────────────────────────
  return (
    <SafeAreaView style={[styles.safeArea ,{ backgroundColor: colorConfig.secondaryColor }]}>
      <StatusBar barStyle="light-content" backgroundColor={colorConfig.secondaryColor} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colorConfig.secondaryColor }]}>
        <Text style={styles.headerTitle}>{translate('UPI Payment')}</Text>
        <Text style={styles.headerSubtitle}>{translate('Fast & Secure Payment')}</Text>
      </View>

      <View style={styles.container}>

        {/* Amount Card */}
        <View style={styles.amountCard}>
          <View style={styles.amountCardInner}>
            <Text style={styles.amountLabel}>{translate('Total Amount')}</Text>
            <Text style={styles.amountValue}>₹{amount}</Text>
            <View style={styles.amountBadge}>
              <Text style={[styles.amountBadgeText, { color: colorConfig.secondaryColor }]}>
                {translate('Secured by PayU')}
              </Text>
            </View>
          </View>
        </View>

        {/* UPI ID Input */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>{translate('Pay via UPI ID')}</Text>
          <Text style={styles.sectionSubtitle}>{translate('Enter your UPI ID to pay directly')}</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputIcon}>@</Text>
            <TextInput
              style={styles.input}
              placeholder={translate('yourname@upi')}
              placeholderTextColor="#aaa"
              value={vpa}
              onChangeText={setVpa}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          <TouchableOpacity style={styles.btnPrimary} onPress={payViaUPICollect} activeOpacity={0.85}>
            <Text style={styles.btnText}>💳  {translate('Pay')} ₹{amount} {translate('via UPI ID')}</Text>
          </TouchableOpacity>
        </View> */}

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          {/* <View style={styles.dividerBadge}>
            <Text style={styles.dividerText}>{translate('OR')}</Text>
          </View> */}
          <View style={styles.dividerLine} />
        </View>

        {/* UPI Apps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{translate('Pay via UPI App')}</Text>
          <Text style={styles.sectionSubtitle}>{translate('Choose your preferred UPI app')}</Text>
{/* 
          <View style={styles.appRow}>
            <View style={[styles.appChip,{backgroundColor:`${ colorConfig.secondaryColor}80`}]}><Text style={styles.appChipText}>GPay</Text></View>
              <View style={[styles.appChip,{backgroundColor:`${ colorConfig.secondaryColor}80`}]}><Text style={[styles.appChipText, { color: colorConfig.primaryColor }  ]}>PhonePe</Text></View>
              <View style={[styles.appChip,{backgroundColor:`${ colorConfig.secondaryColor}80`}]}><Text style={styles.appChipText}>Paytm</Text></View>
              <View style={[styles.appChip,{backgroundColor:`${ colorConfig.secondaryColor}80`}]}><Text style={styles.appChipText}>BHIM</Text></View>
          </View> */}

<DynamicButton
title={`${translate('Pay')} ₹${amount} ${translate('via UPI App')}`}
onPress={payViaUPIIntent}
/>

          {/* <TouchableOpacity style={styles.btnIntent} onPress={payViaUPIIntent} activeOpacity={0.85}>
            <Text style={styles.btnText}>📱  {translate('Open UPI App to Pay')}</Text>
          </TouchableOpacity> */}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>🔒  {translate('256-bit encrypted & RBI compliant')}</Text>
        </View>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea:        { flex: 1, backgroundColor: '#4361ee' },
  loaderContainer: { flex: 1, backgroundColor: '#f0f4ff' },
  loaderBox:       { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  loaderCard:      { backgroundColor: '#fff', borderRadius: 20, padding: 36, alignItems: 'center', width: '100%', elevation: 8, shadowColor: '#4361ee', shadowOpacity: 0.15, shadowRadius: 20 },
  loaderTitle:     { marginTop: 20, fontSize: 18, fontWeight: '700', color: '#1a1a2e' },
  loaderSubtitle:  { marginTop: 8, fontSize: 13, color: '#888', textAlign: 'center' },

  header:          { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 28 },
  headerTitle:     { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerSubtitle:  { fontSize: 13, color: '#ffffffbb', marginTop: 4 },

  container:       { flex: 1, backgroundColor: '#f0f4ff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20 },

  amountCard:      { backgroundColor: '#fff', borderRadius: 20, marginBottom: 20, elevation: 6, shadowColor: '#4361ee', shadowOpacity: 0.12, shadowRadius: 16 },
  amountCardInner: { padding: 24, alignItems: 'center' },
  amountLabel:     { fontSize: 13, color: '#888', letterSpacing: 1, textTransform: 'uppercase' },
  amountValue:     { fontSize: 44, fontWeight: '800', color: '#1a1a2e', marginTop: 4 },
  amountBadge:     { marginTop: 10, backgroundColor: '#eef2ff', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  amountBadgeText: { fontSize: 12, color: '#4361ee', fontWeight: '600' },

  section:         { backgroundColor: '#fff', borderRadius: 20, padding: 18, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10 },
  sectionTitle:    { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 4 },
  sectionSubtitle: { fontSize: 12, color: '#999', marginBottom: 14 },

  inputWrapper:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f7ff', borderRadius: 12, borderWidth: 1.5, borderColor: '#dde3ff', paddingHorizontal: 14, marginBottom: 14 },
  inputIcon:       { fontSize: 18, color: '#4361ee', marginRight: 8, fontWeight: '700' },
  input:           { flex: 1, paddingVertical: 13, fontSize: 15, color: '#1a1a2e' },

  btnPrimary:      { backgroundColor: '#4361ee', borderRadius: 14, paddingVertical: 15, alignItems: 'center', elevation: 4, shadowColor: '#4361ee', shadowOpacity: 0.35, shadowRadius: 10 },
  btnIntent:       { backgroundColor: '#3a0ca3', borderRadius: 14, paddingVertical: 15, alignItems: 'center', elevation: 4, shadowColor: '#3a0ca3', shadowOpacity: 0.35, shadowRadius: 10 },
  btnText:         { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.3 },

  appRow:          { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  appChip:         { backgroundColor: '#eef2ff', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  appChipText:     { fontSize: 12, color: '#4361ee', fontWeight: '600' },

  divider:         { flexDirection: 'row', alignItems: 'center', marginVertical: 4, marginBottom: 16 },
  dividerLine:     { flex: 1, height: 1, backgroundColor: '#e0e5ff' },
  dividerBadge:    { backgroundColor: '#e0e5ff', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginHorizontal: 10 },
  dividerText:     { color: '#4361ee', fontSize: 12, fontWeight: '700' },

  footer:          { alignItems: 'center', paddingVertical: 16 },
  footerText:      { fontSize: 12, color: '#aaa' },
});

export default UPIScreen;