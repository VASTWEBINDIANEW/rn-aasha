// screens/NewForm/PartnerBasicInfoScreen.tsx

import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Image, ToastAndroid, ActivityIndicator } from 'react-native';
import { useFormik } from 'formik';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';

import {
  SectionCard,
  AppInput,
  AppToggle,
  NavRow,
  getStepColor,
} from '../../components/FormUI';

import useAxiosHook from '../../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../../utils/network/urls';
import { colors } from '../../../../utils/styles/theme';
import { EMAIL_REGEX, initEmail, initMobile, MOBILE_REGEX } from '../NewForm/AadhaarPanVerification/types';
import { Section1Schema } from '../../../../utils/validationSchemas';
import { EmailCard, MobileCard } from '../NewForm/AadhaarPanVerification/cards';
import StateDistrictPicker from '../../../../components/ReusableComponents/StateDistrictPicker';
import ShowLoader from '../../../../components/ShowLoder';
import { useDispatch } from "react-redux";
import { setCmsAddMFrom } from '../../../../reduxUtils/store/userInfoSlice';

const STEP = 1; // adjust according to your STEPS array index

// Backend kabhi plain base64 bhejta h, kabhi full URL — dono case handle karo
// taaki <Image source={{ uri }}> hamesha sahi render ho.
const toImageUri = (value?: string) => {
  if (!value) return '';
  if (value.startsWith('http') || value.startsWith('data:') || value.startsWith('file:')) {
    return value;
  }
  return `data:image/jpeg;base64,${value}`;
};

// ─────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────
const PartnerBasicInfoScreen = ({ onNext }: { onNext: () => void }) => {
  const { post } = useAxiosHook();
  const isSubmitting = useRef(false);
  const stepColor = getStepColor(STEP);
  const dispatch = useDispatch();

  const [prefillLoading, setPrefillLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  // ── Client ID — fresh form pe 0, ShowClientInsert se aane ke baad wahi id use hogi ──
  const [idno, setIdno] = useState<number>(0);

  // ── Mobile & Email state (cards.tsx shape) ──────────────
  const [mobile, setMobile] = useState(initMobile());
  const [email, setEmail] = useState(initEmail());

  // ── State/District numeric IDs (backend needs IDs, not names) ──
  const [stateId, setStateId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);

  // ── Initial IDs from ShowClientInsert — passed to StateDistrictPicker for name resolution ──
  const [initialStateId, setInitialStateId] = useState<number | null>(null);
  const [initialDistrictId, setInitialDistrictId] = useState<number | null>(null);

  // ── GST (ab yahan h — top pe, page open hote hi sirf ye dikhta h) ──
  // gstStatus: null = abhi verify nahi hua/dobara verify chahiye,
  //            true = CheckGstNUmber se "Status: true" mila,
  //            false = verify fail hua
  // Fresh form pe khaali hi rehna chahiye — koi bhi hardcoded/test value nahi.
  const [gstNumber, setGstNumber] = useState('');
  const [gstVerifying, setGstVerifying] = useState(false);
  const [gstStatus, setGstStatus] = useState<null | boolean>(null);

  // Ek baar bhi GST verify (ya ShowClientInsert se already-verified) ho jaye
  // to baaki form permanently reveal ho jaata h — number badalne pe bhi
  // form hide nahi hota, sirf submit tab tak block rehta h jab tak dobara verify na ho.
  const [hasBeenVerifiedOnce, setHasBeenVerifiedOnce] = useState(false);

  const [tradeName, setTradeName] = useState(''); // optional
  const [legalName, setLegalName] = useState('');

  const [gstDoc, setGstDoc] = useState(''); // base64 (payload me jayega)
  const [gstDocPreview, setGstDocPreview] = useState(''); // local/remote uri, preview ke liye

  // ── Business Details (naye fields) ────────────────────────
  const [outletName, setOutletName] = useState('');
  const [designation, setDesignation] = useState('');
  const [natureOfBusiness, setNatureOfBusiness] = useState('');
  const [avgCashLimit, setAvgCashLimit] = useState('');
  // IScurrentlyCMS: true/false toggle — true ho tabhi ServiceProviderName chahiye
  const [isCurrentlyCMS, setIsCurrentlyCMS] = useState(false);
  const [serviceProviderName, setServiceProviderName] = useState('');
  // totalpickpoints — kam se kam 1 required, isliye default '1' rakha h
  const [totalPickPoints, setTotalPickPoints] = useState('1');

  const isMobileValid = MOBILE_REGEX.test(mobile.value);
  const isEmailValid = EMAIL_REGEX.test(email.value);

  // ── Doc picker (base64, crash-safe) ──────────────────────
  const pickDoc = (onPicked: (result: { uri: string; base64: string }) => void) => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.7, includeBase64: true },
      (res) => {
        try {
          if (!res) return;
          if (res.didCancel) return;
          if (res.errorCode) {
            console.log('❌ ImagePicker ERROR:', res.errorCode, res.errorMessage);
            ToastAndroid.show(res.errorMessage || 'Unable to pick image', ToastAndroid.SHORT);
            return;
          }
          const asset = res.assets && res.assets[0];
          if (asset?.uri && asset?.base64) {
            onPicked({ uri: asset.uri, base64: asset.base64 });
          }
        } catch (err) {
          console.log('❌ pickDoc ERROR:', err);
        }
      },
    );
  };

  // ── CheckGstNUmber (Api/Radiant/CheckGstNUmber?GstNumber=) ──
  // Response shape: { Version, StatusCode, Content: { Status, Message } }
  // idno NewClientInsert jaisa hi — query string me nahi, request BODY me jaata h.
  const onCheckGst = async () => {
    if (!gstNumber.trim()) {
      ToastAndroid.show('Enter GST number', ToastAndroid.SHORT);
      return;
    }
    setGstVerifying(true);
    try {
      // idno query string me bhi bhej rahe h — body wala tarika is GET-type
      // endpoint pe request me pahunch hi nahi raha tha (isliye Gstverify
      // sahi nahi aa raha tha). Query string se pehle sahi response aata tha.
      const requestUrl = `${APP_URLS.CheckGstNUmber}?GstNumber=${gstNumber}&idno=${idno}`;
      const requestBody = { idno: idno };

      console.log('📤 CheckGstNUmber REQUEST URL:', requestUrl);
      console.log('📤 CheckGstNUmber REQUEST BODY:', JSON.stringify(requestBody, null, 2));

      const res = await post({
        url: requestUrl,
        data: requestBody,
      });
      console.log('📥 CheckGstNUmber RESPONSE:', JSON.stringify(res, null, 2));

      const status = res?.Content?.Status === true;
      const message = res?.Content?.Message || '';

      if (status) {
        setGstStatus(true);
        setHasBeenVerifiedOnce(true); // ── baaki form ab permanently reveal ho jaata h
        ToastAndroid.show(message || 'GST Verified', ToastAndroid.SHORT);
      } else {
        setGstStatus(false);
        ToastAndroid.show(message || 'GST verification failed', ToastAndroid.SHORT);
      }
    } catch (err) {
      console.log('❌ CheckGstNUmber ERROR:', err);
      setGstStatus(false);
      ToastAndroid.show('Something went wrong verifying GST', ToastAndroid.SHORT);
    } finally {
      setGstVerifying(false);
    }
  };

  const onGstNumberChange = (t: string) => {
    setGstNumber(t.toUpperCase());
    // Number edit hote hi purana verify result invalid ho jaata h —
    // form hide nahi hota (agar pehle dikh chuka h), lekin submit tab tak
    // block rahega jab tak dobara verify na ho.
    setGstStatus(null);
  };

  // ── Formik for plain fields ──────────────────────────────
  const formik = useFormik({
    initialValues: {
      Name: '',
      Firmname: '',
      Statename: '',    // display name (resolved by StateDistrictPicker)
      Districtname: '', // display name (resolved by StateDistrictPicker)
      cityname: '',
      Pincode: '',
      Address: '',
      mobileVerified: false,
      emailVerified: false,
    },
    validationSchema: Section1Schema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      if (isSubmitting.current) return;
      if (!mobile.verified || !email.verified) return; // guard
      if (!stateId || !districtId) {
        ToastAndroid.show('Please select State and District', ToastAndroid.SHORT);
        return;
      }
      isSubmitting.current = true;

      const payload = {
        idno: idno, // fresh form h to 0, warna ShowClientInsert wali id
        Name: values.Name,
        Firmname: values.Firmname,
        mobile: mobile.value,
        mobileverify: mobile.verified,
        Statename: stateId,          // numeric ID
        Districtname: districtId,    // numeric ID
        Email: email.value,
        Emailverify: email.verified,
        cityname: values.cityname,
        Pincode: values.Pincode,
        Address: values.Address,

        // ── GST (ab yahan se jaata h) ──────────────────────
        Gstnumber: gstNumber,
        GstDoc: gstDoc, // base64
        TradeName: tradeName,
        LegalName: legalName,
        GstVerify: gstStatus === true,

        // ── Business Details (naye fields) ──────────────────
        outletname: outletName,
        Designation: designation,
        NatureOfBusiness: natureOfBusiness,
        AveragePerdayCashLimit: avgCashLimit,
        IScurrentlyCMS: isCurrentlyCMS,
        ServiceProviderName: isCurrentlyCMS ? serviceProviderName : '',
        totalpickpoints: totalPickPoints,

        Stepnumber: 'Step1',

        // ── Filled in later screens — sending empty/default for now ──
        // PanCard: '',
        // pancardverify: false,
        // Pancarddoc: '',
        // AadharCard: '',
        // aadharverify: false,
        // AadharcardFrontdoc: '',
        // AadharcardBackdoc: '',
        // ispvt: false,
        // BRNumber: '',
        // BRDoc: '',
        // cancelchecqueforradiantclients: [],
        // bankinformationforradiantclients: [],
      };

      console.log('📤 NewClientInsert REQUEST:', JSON.stringify(payload, null, 2));
      setLoading(true);
      try {
        const res = await post({
          url: APP_URLS.NewClientInsert,
          data: payload,
        });

        console.log('📥 RESPONSE:', JSON.stringify(res, null, 2));

        if (res?.Content?.Status) {
          ToastAndroid.show(res?.Content?.Message || 'Client registered', ToastAndroid.SHORT);
          onNext();
        } else {
          ToastAndroid.show(res?.Content?.Message || 'Submit failed', ToastAndroid.SHORT);
        }
      } catch (err) {
        console.log('❌ ERROR:', err);
        ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
      } finally {
        isSubmitting.current = false;
        setLoading(false);
      }
    },
  });

  const { values, errors, touched, setFieldValue, setFieldTouched, setValues, handleSubmit } = formik;

  useEffect(() => {
    dispatch(setCmsAddMFrom("Step1"));

    const fetchExistingData = async () => {
      try {
        const res = await post({ url: APP_URLS.ShowClientInsert });
        console.log('📥 ShowClientInsert RESPONSE:', JSON.stringify(res, null, 2));

        const data = res?.Content?.[0];
        if (!data) {
          setPrefillLoading(false);
          return;
        }

        // ── Client ID — agar backend se aayi h to wahi use karo, warna 0 hi rahega ──
        if (typeof data.idno === 'number') setIdno(data.idno);

        // ── Set numeric IDs as-is from API (used in submit payload) ──
        setStateId(data.stateName ?? null);
        setDistrictId(data.districtName ?? null);

        // ── Pass raw IDs down to StateDistrictPicker for name resolution ──
        setInitialStateId(data.stateName ?? null);
        setInitialDistrictId(data.districtName ?? null);

        // ── Set formik display values — as-is from API ──────────
        setValues({
          Name: data.Name || '',
          Firmname: data.Firmname || '',
          Statename: '',     // will be filled by StateDistrictPicker once resolved
          Districtname: '',  // will be filled by StateDistrictPicker once resolved
          cityname: data.cityName || data.cityname || '',
          Pincode: data.Pincode || '',
          Address: data.Address || '',
          mobileVerified: !!data.mobileverify,
          emailVerified: !!data.Emailverify,
        });

        // ── Set Mobile card state ──────────────────────────────
        setMobile(prev => ({
          ...prev,
          value: data.mobile || '',
          verified: !!data.mobileverify,
        }));

        // ── Set Email card state ────────────────────────────────
        setEmail(prev => ({
          ...prev,
          value: data.Email || '',
          verified: !!data.Emailverify,
        }));

        // ── GST prefill ──────────────────────────────────────
        if (data.Gstnumber) setGstNumber(data.Gstnumber);
        if (data.TradeName) setTradeName(data.TradeName);
        if (data.LegelName) setLegalName(data.LegelName);
        if (data.GstDoc) {
          setGstDoc(data.GstDoc);
          setGstDocPreview(toImageUri(data.GstDoc));
        }
        // Backend se pehle se GST verified aaya h to seedha form reveal karo,
        // warna form hidden hi rahega jab tak user khud verify na kare.
        if (data.Gstnumber) {
          setGstStatus(true);
          setHasBeenVerifiedOnce(true);
        }

        // ── Business Details prefill ──────────────────────────
        if (data.outletname) setOutletName(data.outletname);
        if (data.Designation) setDesignation(data.Designation);
        if (data.NatureOfBusiness) setNatureOfBusiness(data.NatureOfBusiness);
        if (data.AveragePerdayCashLimit) setAvgCashLimit(String(data.AveragePerdayCashLimit));
        if (typeof data.IScurrentlyCMS === 'boolean') setIsCurrentlyCMS(data.IScurrentlyCMS);
        if (data.ServiceProviderName) setServiceProviderName(data.ServiceProviderName);
        if (data.totalpickpoints) setTotalPickPoints(String(data.totalpickpoints));
      } catch (err) {
        console.log('❌ ShowClientInsert ERROR:', err);
      } finally {
        setPrefillLoading(false);
      }
    };

    fetchExistingData();
  }, []);

  const onMobileChange = (t: string) => {
    const digits = t.replace(/\D/g, '').slice(0, 10);
    setMobile(prev => ({ ...prev, value: digits, error: '' }));
  };

  const onMobileSendOtp = async () => {
    setMobile(prev => ({ ...prev, loading: true }));
    try {
      const res = await post({
        url: `${APP_URLS.ClientSendOTPMobile}?Mobile=${mobile.value}&Name=${values.Name}`,
      });
      console.log('📥 ClientSendOTPMobile RESPONSE:', JSON.stringify(res, null, 2));

      if (res?.info?.stschk === true) {
        setMobile(prev => ({ ...prev, otpSent: true, loading: false }));
      } else {
        setMobile(prev => ({
          ...prev,
          loading: false,
          error: res?.info?.Message || 'Failed to send OTP',
        }));
      }
    } catch (err) {
      console.log('❌ ClientSendOTPMobile ERROR:', err);
      setMobile(prev => ({ ...prev, loading: false, error: 'Something went wrong' }));
    }
  };

  const onMobileOtpChange = (t: string) => {
    setMobile(prev => ({ ...prev, otpValue: t.replace(/\D/g, ''), otpError: '' }));
  };

  const onMobileVerifyOtp = async () => {
    setMobile(prev => ({ ...prev, loading: true }));
    try {
      const res = await post({
        url: `${APP_URLS.ClientVerifyOTPMobile}?Mobile=${mobile.value}&Name=${values.Name}&OTP=${mobile.otpValue}`,
      });
      console.log('📥 ClientVerifyOTPMobile RESPONSE:', JSON.stringify(res, null, 2));

      if (res?.info?.stschk === true) {
        setMobile(prev => ({ ...prev, verified: true, otpSent: false, loading: false }));
        setFieldValue('mobileVerified', true);
      } else {
        setMobile(prev => ({
          ...prev,
          loading: false,
          otpError: res?.info?.Message || 'Invalid OTP',
        }));
      }
    } catch (err) {
      console.log('❌ ClientVerifyOTPMobile ERROR:', err);
      setMobile(prev => ({ ...prev, loading: false, otpError: 'Something went wrong' }));
    }
  };

  const onMobileReset = () => {
    setMobile(initMobile());
    setFieldValue('mobileVerified', false);
  };

  // ─────────────────────────────────────────────────────────
  // EMAIL OTP HANDLERS
  // ─────────────────────────────────────────────────────────
  const onEmailChange = (t: string) => {
    setEmail(prev => ({ ...prev, value: t, error: '' }));
  };

  const onEmailSendOtp = async () => {
    setEmail(prev => ({ ...prev, loading: true }));
    try {
      console.log('📡 API URL:', `${APP_URLS.ClientEmailVerify}?Email=${email.value}`);

      const res = await post({
        url: `${APP_URLS.ClientEmailVerify}?Email=${email.value}`,
      });
      console.log('📥 EMAIL OTP RESPONSE:', JSON.stringify(res, null, 2));

      if (res?.info?.stschk === true) {
        setEmail(prev => ({ ...prev, otpSent: true, loading: false }));
      } else {
        setEmail(prev => ({
          ...prev,
          loading: false,
          error: res?.info?.Message || 'Failed to send OTP',
        }));
      }
    } catch (err) {
      console.log('❌ EMAIL OTP ERROR:', err);
      setEmail(prev => ({ ...prev, loading: false, error: 'Something went wrong' }));
    }
  };

  const onEmailOtpChange = (t: string) => {
    setEmail(prev => ({ ...prev, otpValue: t.replace(/\D/g, ''), otpError: '' }));
  };

  const onEmailVerifyOtp = async () => {
    setEmail(prev => ({ ...prev, loading: true }));
    try {
      const res = await post({
        url: `${APP_URLS.ClientEmailVerifyOTP}?Email=${email.value}&OTP=${email.otpValue}`,
      });
      console.log('📥 VERIFY OTP RESPONSE:', JSON.stringify(res, null, 2));

      if (res?.info?.stschk === true) {
        setEmail(prev => ({ ...prev, verified: true, otpSent: false, loading: false, otpError: '' }));
        setFieldValue('emailVerified', true);
      } else {
        setEmail(prev => ({
          ...prev,
          loading: false,
          otpError: res?.info?.Message || 'Invalid OTP',
        }));
      }
    } catch (err) {
      console.log('❌ VERIFY OTP ERROR:', err);
      setEmail(prev => ({ ...prev, loading: false, otpError: 'Something went wrong' }));
    }
  };

  const onEmailReset = () => {
    setEmail(initEmail());
    setFieldValue('emailVerified', false);
  };

  const canProceed = mobile.verified && email.verified && gstStatus === true;

  const onPressNext = () => {
    // ── Sabse pehle GST verify check — edit ke baad dobara verify zaroori h ──
    if (gstStatus !== true) {
      ToastAndroid.show('Please verify GST number before submitting', ToastAndroid.SHORT);
      return;
    }
    if (!legalName.trim()) {
      ToastAndroid.show('Please enter Legal Name', ToastAndroid.SHORT);
      return;
    }
    if (!gstDoc) {
      ToastAndroid.show('Please upload GST document', ToastAndroid.SHORT);
      return;
    }

    // ── Business Details validation ──
    if (!outletName.trim()) {
      ToastAndroid.show('Please enter Outlet Name', ToastAndroid.SHORT);
      return;
    }
    if (!designation.trim()) {
      ToastAndroid.show('Please enter Designation', ToastAndroid.SHORT);
      return;
    }
    if (!natureOfBusiness.trim()) {
      ToastAndroid.show('Please enter Nature of Business', ToastAndroid.SHORT);
      return;
    }
    if (!avgCashLimit.trim()) {
      ToastAndroid.show('Please enter Average Per Day Cash Limit', ToastAndroid.SHORT);
      return;
    }
    if (isCurrentlyCMS && !serviceProviderName.trim()) {
      ToastAndroid.show('Please enter Service Provider Name', ToastAndroid.SHORT);
      return;
    }
    if (!totalPickPoints.trim() || Number(totalPickPoints) < 1) {
      ToastAndroid.show('Total outlets / pick points must be at least 1', ToastAndroid.SHORT);
      return;
    }

    formik.validateForm().then(err => {
      console.log('❌ Errors:', err);

      if (Object.keys(err).length > 0) {
        // ✅ first error uthao
        const firstError = Object.values(err)[0];
        ToastAndroid.show(firstError as string, ToastAndroid.SHORT);
      } else {
        handleSubmit();
      }
    });
  };

  return (
    <View style={s.screen}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {prefillLoading && <ShowLoader />}

        {/* ── GST Details (top pe, page open hote hi sirf yahi dikhta h) ── */}
        <SectionCard title="GST Details" icon="domain" iconColor={stepColor}>
          <AppInput
            label="GST Number"
            placeholder="08ABCDE1234F1Z5"
            autoCapitalize="characters"
            value={gstNumber}
            onChangeText={onGstNumberChange}
          />

          <TouchableOpacity
            style={[s.verifyBtn, gstStatus === true ? s.verifyBtnDone : { borderColor: stepColor }]}
            onPress={onCheckGst}
            disabled={gstVerifying}
            activeOpacity={0.8}
          >
            {gstVerifying ? (
              <ActivityIndicator size="small" color={stepColor} />
            ) : (
              <MaterialCommunityIcons
                name={gstStatus === true ? 'check-circle' : 'shield-search-outline'}
                size={18}
                color={gstStatus === true ? '#16A34A' : stepColor}
              />
            )}
            <Text style={[s.verifyBtnText, { color: gstStatus === true ? '#16A34A' : stepColor }]}>
              {gstVerifying ? 'Checking...' : gstStatus === true ? 'GST Verified ✓' : 'Verify GST Number'}
            </Text>
          </TouchableOpacity>

          {/* ── Number edit hone ke baad, ya kabhi verify na hone par ── */}
          {hasBeenVerifiedOnce && gstStatus !== true && (
            <Text style={s.gstWarnText}>
              GST number changed — please verify again before submitting.
            </Text>
          )}

          {/* ── Trade/Legal Name + Doc — sirf jab GST kabhi verify ho chuka ho ── */}
          {hasBeenVerifiedOnce && (
            <>
              <AppInput
                label="Legal Name"
                placeholder="Legal Name as per GST"
                value={legalName}
                onChangeText={setLegalName}
              />
              <AppInput
                label="Trade Name (Optional)"
                placeholder="Trade Name"
                value={tradeName}
                onChangeText={setTradeName}
              />

              <Text style={s.docLabel}>GST Certificate</Text>
              <TouchableOpacity
                style={s.docBox}
                onPress={() =>
                  pickDoc(({ uri, base64 }) => {
                    setGstDoc(base64);
                    setGstDocPreview(uri);
                  })
                }
              >
                {gstDocPreview ? (
                  <Image source={{ uri: gstDocPreview }} style={s.docPreview} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="cloud-upload-outline" size={22} color={stepColor} />
                    <Text style={s.docUploadText}>Upload GST Certificate</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </SectionCard>

        {/* ── Baaki poora form — sirf GST kam-se-kam ek baar verify hone ke baad dikhta h ── */}
        {hasBeenVerifiedOnce && (
          <>
            {/* ── Personal & Firm Info ── */}
            <SectionCard title="Personal & Firm Details" icon="account-tie" iconColor={stepColor}>
              <AppInput
                label="Full Name"
                placeholder="Enter your full name"
                value={values.Name}
                onChangeText={t => setFieldValue('Name', t.replace(/[^a-zA-Z\s]/g, ''))}
                onBlur={() => setFieldTouched('Name', true)}
                error={errors.Name}
                touched={touched.Name}
              />
              <AppInput
                label="Company Name"
                placeholder="Enter firm / company name"
                value={values.Firmname}
                onChangeText={t => setFieldValue('Firmname', t)}
                onBlur={() => setFieldTouched('Firmname', true)}
                error={errors.Firmname}
                touched={touched.Firmname}
              />
            </SectionCard>

            {/* ── Mobile Card (reused from cards.tsx) ── */}
            <MobileCard
              mobile={mobile}
              isValid={isMobileValid}
              onChange={onMobileChange}
              onSendOtp={onMobileSendOtp}
              onOtpChange={onMobileOtpChange}
              onVerifyOtp={onMobileVerifyOtp}
              onReset={onMobileReset}
            />

            {/* ── Email Card (reused from cards.tsx) ── */}
            <EmailCard
              email={email}
              isValid={isEmailValid}
              onChange={onEmailChange}
              onSendOtp={onEmailSendOtp}
              onOtpChange={onEmailOtpChange}
              onVerifyOtp={onEmailVerifyOtp}
              onReset={onEmailReset}
            />

            {/* ── Address Info ── */}
            <SectionCard title="Address Details" icon="map-marker-outline" iconColor={stepColor}>
              <StateDistrictPicker
                stateValue={values.Statename}
                districtValue={values.Districtname}
                initialStateId={initialStateId}
                initialDistrictId={initialDistrictId}
                onStateChange={(name, id) => {
                  setFieldValue('Statename', name);
                  setStateId(id);
                }}
                onDistrictChange={(name, id) => {
                  setFieldValue('Districtname', name);
                  setDistrictId(id);
                }}
              />
              <AppInput
                label="City Name"
                placeholder="Enter city name"
                value={values.cityname}
                onChangeText={(t) => setFieldValue('cityname', t)}
              />
              <AppInput
                label="Pincode"
                placeholder="6-digit pincode"
                keyboardType="number-pad"
                maxLength={6}
                value={values.Pincode}
                onChangeText={t => setFieldValue('Pincode', t.replace(/\D/g, ''))}
                onBlur={() => setFieldTouched('Pincode', true)}
                error={errors.Pincode}
                touched={touched.Pincode}
              />
              <AppInput
                label="Full Address"
                placeholder="House no, street, area"
                multiline
                numberOfLines={3}
                value={values.Address}
                onChangeText={t => setFieldValue('Address', t)}
                onBlur={() => setFieldTouched('Address', true)}
                error={errors.Address}
                touched={touched.Address}
              />
            </SectionCard>

            {/* ── Business Details (naye fields) ── */}
            <SectionCard title="Business Details" icon="storefront-outline" iconColor={stepColor}>
              <AppInput
                label="Outlet Name"
                placeholder="Enter outlet name"
                value={outletName}
                onChangeText={setOutletName}
              />
              <AppInput
                label="Designation"
                placeholder="Enter your designation"
                value={designation}
                onChangeText={setDesignation}
              />
              <AppInput
                label="Nature / Details of Customer Business"
                placeholder="e.g. Retail (Supermarket / Restaurant / Petrol Bunk / Jewellery / Finance etc.)"
                multiline
                numberOfLines={2}
                value={natureOfBusiness}
                onChangeText={setNatureOfBusiness}
              />
              <AppInput
                label="Average Per Day Cash Limit per Outlet"
                placeholder="Enter amount"
                keyboardType="numeric"
                value={avgCashLimit}
                onChangeText={t => setAvgCashLimit(t.replace(/[^0-9.]/g, ''))}
              />

              <AppToggle
                label="Are they currently using Cash Management System from a bank or any other provider?"
                value={isCurrentlyCMS}
                onChange={(val: boolean) => {
                  setIsCurrentlyCMS(val);
                  if (!val) setServiceProviderName('');
                }}
              />

              {isCurrentlyCMS && (
                <AppInput
                  label="Details of the Service Provider"
                  placeholder="Enter service provider name"
                  value={serviceProviderName}
                  onChangeText={setServiceProviderName}
                />
              )}

              <AppInput
                label="How Many Outlets / Pick Points Do You Have"
                placeholder="Minimum 1 required"
                keyboardType="number-pad"
                value={totalPickPoints}
                onChangeText={t => setTotalPickPoints(t.replace(/\D/g, ''))}
              />
            </SectionCard>

            {!canProceed && (
              <Text style={s.helperWarn}>
                Please verify Mobile, Email and GST Number to continue.
              </Text>
            )}

            <NavRow
              onNext={onPressNext}
              nextLabel="Next"
              stepColor={canProceed ? stepColor : colors.grey}
            />
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default PartnerBasicInfoScreen;

// ─────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light_blue },
  scroll: { padding: 16, paddingBottom: 40 },
  helperWarn: {
    fontSize: 12,
    color: colors.error,
    textAlign: 'center',
    marginBottom: 10,
  },
  gstWarnText: {
    fontSize: 12,
    color: colors.error,
    marginBottom: 12,
  },
  verifyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderRadius: 10, paddingVertical: 13, marginTop: 6, marginBottom: 12, backgroundColor: '#F9FAFB' },
  verifyBtnDone: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  verifyBtnText: { fontSize: 14, fontWeight: '600' },
  docLabel: { fontSize: 12, fontWeight: '600', color: colors.dark_gray, marginBottom: 6 },
  docBox: {
    height: 90,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    backgroundColor: '#FAFBFC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  docPreview: { width: '100%', height: '100%' },
  docUploadText: { fontSize: 12, color: colors.primary, marginTop: 6, fontWeight: '600' },
});