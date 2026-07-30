// screens/NewForm/PartnerKycDocsScreen.tsx

import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Image, ToastAndroid, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';

import { SectionCard, AppInput, AppToggle, NavRow, getStepColor } from '../../components/FormUI';
import { initAadhaar, initPan, AADHAAR_REGEX, PAN_REGEX } from '../NewForm/AadhaarPanVerification/types';
import useAxiosHook from '../../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../../utils/network/urls';
import { colors } from '../../../../utils/styles/theme';
import { AadhaarCard, PanCard } from '../NewForm/AadhaarPanVerification/cards';
import { useDispatch, useSelector } from 'react-redux';
import { setCmsAddMFrom } from '../../../../reduxUtils/store/userInfoSlice';
import { RootState } from '../../../../reduxUtils/store';

const STEP = 1;

// Backend kabhi plain base64 bhejta h, kabhi full URL — dono case handle karo
// taaki <Image source={{ uri }}> hamesha sahi render ho.
const toImageUri = (value?: string) => {
  if (!value) return '';
  if (value.startsWith('http') || value.startsWith('data:') || value.startsWith('file:')) {
    return value;
  }
  return `data:image/jpeg;base64,${value}`;
};

const PartnerKycDocsScreen = ({ onNext }: { onNext: () => void }) => {
  const { post } = useAxiosHook();
  const isSubmitting = useRef(false);
  const stepColor = getStepColor(STEP);
  const { colorConfig, cmsAddMFrom, radiantList } = useSelector((state: RootState) => state.userInfo);

  const [aadhaar, setAadhaar] = useState(initAadhaar());
  const [pan, setPan] = useState(initPan());

  // ── Business Registration (ispvt toggle) ────────────────
  // ispvt === true  → BRNumber + BRDoc dono required
  // ispvt === false → sirf false bhej do, aur kuch nahi chahiye
  const [ispvt, setIspvt] = useState(false);
  const [brNumber, setBrNumber] = useState('');
  const [brDoc, setBrDoc] = useState(''); // base64
  const [brDocPreview, setBrDocPreview] = useState('');

  const [prefillLoading, setPrefillLoading] = useState(true);

  // ── ShowClientInsert se hi mil jaata h — Aadhaar/PAN verify APIs ko chahiye ──
  const [mobile, setMobile] = useState('');

  // ── Sirf backend se aata h, koi input field nahi h — payload me wapas bhejna h ──
  const [gstNumber, setGstNumber] = useState('');

  // ── Client ID — fresh form pe 0, ShowClientInsert se aane ke baad wahi id use hogi ──
  const [idno, setIdno] = useState<number>(0);

  const isAadhaarValid = AADHAAR_REGEX.test(aadhaar.value);
  const isPanValid = PAN_REGEX.test(pan.value);
  const dispatch = useDispatch();

  // ── Aadhaar handlers ──────────────────────────────────
  const onAadhaarChange = (t: string) => {
    const digits = t.replace(/\D/g, '').slice(0, 12);
    setAadhaar(prev => ({ ...prev, value: digits, error: '' }));
  };

  const onAadhaarSendOtp = async () => {
    setAadhaar(prev => ({ ...prev, loading: true }));
    try {
      const res = await post({
        url: `${APP_URLS.Clientverifyaadhar}?AadharCard=${aadhaar.value}`,
      });
      console.log('📥 AadhaarSendOTP RESPONSE:', JSON.stringify(res, null, 2));

      if (res?.info?.stschk === true) {
        // ✅ Success toast + clientid/uniqueId save karo
        ToastAndroid.show(res?.info?.Message || 'OTP sent successfully', ToastAndroid.SHORT);
        setAadhaar(prev => ({
          ...prev,
          otpSent: true,
          loading: false,
          clientId: res?.info?.clientid || '',   // ← OTP verify mein kaam aayega
          txnId: res?.info?.uniqueId || '',       // ← OTP verify mein kaam aayega
        }));
      } else {
        ToastAndroid.show(res?.info?.Message || 'Failed to send OTP', ToastAndroid.SHORT);
        setAadhaar(prev => ({ ...prev, loading: false, error: res?.info?.Message || 'Failed to send OTP' }));
      }
    } catch (err) {
      console.log('❌ AadhaarSendOTP ERROR:', err);
      ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
      setAadhaar(prev => ({ ...prev, loading: false, error: 'Something went wrong' }));
    }
  };

  const onAadhaarOtpChange = (t: string) => {
    setAadhaar(prev => ({ ...prev, otpValue: t.replace(/\D/g, ''), otpError: '' }));
  };

  const onAadhaarVerifyOtp = async () => {
    setAadhaar(prev => ({ ...prev, loading: true }));
    try {
      const res = await post({
        url: `${APP_URLS.ClientverifyaadharOTP}?Clientid=${aadhaar.clientId}&TXNID=${aadhaar.txnId}&OTP=${aadhaar.otpValue}&AadharCard=${aadhaar.value}&Mobile=${mobile}`,
      });
      console.log('📥 AadhaarVerifyOTP RESPONSE:', JSON.stringify(res, null, 2));

      if (res?.info?.stschk === true) {
        ToastAndroid.show(res?.info?.Message || 'Aadhaar verified!', ToastAndroid.SHORT);
        setAadhaar(prev => ({ ...prev, verified: true, otpSent: false, loading: false }));
      } else {
        ToastAndroid.show(res?.info?.Message || 'Invalid OTP', ToastAndroid.SHORT);
        setAadhaar(prev => ({ ...prev, loading: false, otpError: res?.info?.Message || 'Invalid OTP' }));
      }
    } catch (err) {
      console.log('❌ AadhaarVerifyOTP ERROR:', err);
      ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
      setAadhaar(prev => ({ ...prev, loading: false, otpError: 'Something went wrong' }));
    }
  };

  const onAadhaarReset = () => setAadhaar(initAadhaar());

  // ── PAN handlers ──────────────────────────────────────
  const onPanChange = (t: string) => {
    setPan(prev => ({ ...prev, value: t.toUpperCase().slice(0, 10), error: '' }));
  };

  const onPanVerify = async () => {
    setPan(prev => ({ ...prev, loading: true }));
    try {
      const res = await post({
        url: `${APP_URLS.ClientVerifyPanCard}?pancardnumber=${pan.value}&Mobile=${mobile}`,
      });
      console.log('📥 PanVerify RESPONSE:', JSON.stringify(res, null, 2));

      if (res?.checkpan === true) {
        ToastAndroid.show(res?.message || 'PAN verified!', ToastAndroid.SHORT);
        setPan(prev => ({ ...prev, verified: true, loading: false }));
      } else {
        ToastAndroid.show(res?.message || 'PAN verification failed', ToastAndroid.SHORT);
        setPan(prev => ({ ...prev, loading: false, error: res?.message || 'PAN verification failed' }));
      }
    } catch (err) {
      console.log('❌ PanVerify ERROR:', err);
      ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
      setPan(prev => ({ ...prev, loading: false, error: 'Something went wrong' }));
    }
  };

  // ── Doc upload helper (base64 return karta h, URI nahi) ──
  // onPicked ko { uri, base64 } milta h, taaki preview ke liye uri
  // aur payload ke liye base64 dono use ho sake.
  const pickDoc = (onPicked: (result: { uri: string; base64: string }) => void) => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.7, includeBase64: true },
      (res) => {
        try {
          // Gallery bina select kiye band ki (back press) — kai baar `res`
          // khud hi undefined/incomplete aata h, isliye pehle ye check zaroori h.
          if (!res) return;
          if (res.didCancel) return; // user ne cancel kiya, kuch mat karo
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

  // ispvt true ho to hi BRNumber + BRDoc required, warna kuch nahi chahiye
  const isBrValid = !ispvt || (brNumber.trim().length > 0 && !!brDoc);

  const canProceed = aadhaar.verified && pan.verified && isBrValid;

  const handleNext = async () => {
    if (isSubmitting.current) return;
    if (!canProceed) return;
    isSubmitting.current = true;

    const payload = {
      idno: idno, // fresh form h to 0, warna ShowClientInsert wali id
      Gstnumber: gstNumber, // ── sirf backend se aaya hua, input nahi h
      AadharCard: aadhaar.value,
      aadharverify: aadhaar.verified,
      AadharcardFrontdoc: (aadhaar as any).frontDocBase64 ?? '',
      AadharcardBackdoc: (aadhaar as any).backDocBase64 ?? '',
      PanCard: pan.value,
      pancardverify: pan.verified,
      Pancarddoc: (pan as any).docBase64 ?? '',
      ispvt: ispvt,
      // ispvt true ho tabhi BRNumber/BRDoc bhejo, warna khali/false hi bhejna h
      BRNumber: ispvt ? brNumber : '',
      BRDoc: ispvt ? brDoc : '',
      Stepnumber: 'Step2',
    };

    console.log('📤 PartnerKycDocsUpdate REQUEST:', JSON.stringify(payload, null, 2));

    try {
      const res = await post({ url: APP_URLS.NewClientInsert, data: payload });
      console.log('📥 PartnerKycDocsUpdate RESPONSE:', JSON.stringify(res, null, 2));

      if (res?.info?.stschk === true || res?.StatusCode === 200) {
        onNext();
      }
    } catch (err) {
      console.log('❌ PartnerKycDocsUpdate ERROR:', err);
    } finally {
      isSubmitting.current = false;
    }
  };

  // ── Prefill (edit / resume flow) ──────────────────────────
  useEffect(() => {
    const fetchPrefill = async () => {
      try {
        const res = await post({ url: APP_URLS.ShowClientInsert });
        console.log('📥 ShowClientInsert RESPONSE:', JSON.stringify(res, null, 2));

        const data = res?.Content?.[0];
        if (!data) { setPrefillLoading(false); return; }

        // ── Client ID — agar backend se aayi h to wahi use karo, warna 0 hi rahega ──
        if (typeof data.idno === 'number') setIdno(data.idno);

        // ── Mobile — Aadhaar/PAN verify APIs ko chahiye ──
        if (data.mobile) setMobile(data.mobile);

        // ── GST Number — sirf backend se aata h, input nahi h, payload me wapas jayega ──
        if (data.Gstnumber) setGstNumber(data.Gstnumber);

        // ── Aadhaar ──────────────────────────────────────
        if (data.AadharCard) {
          setAadhaar(prev => ({
            ...prev,
            value: data.AadharCard || '',
            verified: !!data.Aadharverify,
            prefilled: true,
          } as any));
        }
        if (data.AadharcardFrontdoc) {
          setAadhaar(prev => ({
            ...prev,
            frontDoc: toImageUri(data.AadharcardFrontdoc),
            frontDocBase64: data.AadharcardFrontdoc,
          } as any));
        }
        if (data.AadharcardBackdoc) {
          setAadhaar(prev => ({
            ...prev,
            backDoc: toImageUri(data.AadharcardBackdoc),
            backDocBase64: data.AadharcardBackdoc,
          } as any));
        }

        // ── PAN ──────────────────────────────────────────
        if (data.PanCard) {
          setPan(prev => ({
            ...prev,
            value: data.PanCard || '',
            verified: !!data.panverify,
            prefilled: true,
          } as any));
        }
        if (data.Pancarddoc) {
          setPan(prev => ({
            ...prev,
            doc: toImageUri(data.Pancarddoc),
            docBase64: data.Pancarddoc,
          } as any));
        }

        // ── Business Registration (ispvt) ────────────────
        if (typeof data.ispvt === 'boolean') setIspvt(data.ispvt);
        if (data.BRNumber) setBrNumber(data.BRNumber);
        if (data.BRDoc) {
          setBrDoc(data.BRDoc);
          setBrDocPreview(toImageUri(data.BRDoc));
        }
      } catch (err) {
        console.log('❌ ShowClientInsert ERROR:', err);
      } finally {
        setPrefillLoading(false);
      }
    };

    fetchPrefill();
  }, []);

  if (prefillLoading) {
    return (
      <View style={[s.screen, s.centered]}>
        <ActivityIndicator size="large" color={stepColor} />
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Aadhaar (reused from cards.tsx) ── */}
        <AadhaarCard
          aadhaar={aadhaar}
          isValid={isAadhaarValid}
          onChange={onAadhaarChange}
          onSendOtp={onAadhaarSendOtp}
          onOtpChange={onAadhaarOtpChange}
          onVerifyOtp={onAadhaarVerifyOtp}
          onReset={onAadhaarReset}
        />

        {/* ── Aadhaar Doc Upload ── */}
        <SectionCard title="Aadhaar Documents" icon="file-image-outline" iconColor={stepColor}>
          <View style={s.row2}>
            <View style={{ flex: 1 }}>
              <Text style={s.docLabel}>Front Side</Text>
              <TouchableOpacity
                style={s.docBox}
                onPress={() =>
                  pickDoc(({ uri, base64 }) =>
                    setAadhaar(prev => ({ ...prev, frontDoc: uri, frontDocBase64: base64 } as any)),
                  )
                }
              >
                {(aadhaar as any).frontDoc ? (
                  <Image source={{ uri: (aadhaar as any).frontDoc }} style={s.docPreview} />
                ) : (
                  <MaterialCommunityIcons name="cloud-upload-outline" size={22} color={stepColor} />
                )}
              </TouchableOpacity>
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={s.docLabel}>Back Side</Text>
              <TouchableOpacity
                style={s.docBox}
                onPress={() =>
                  pickDoc(({ uri, base64 }) =>
                    setAadhaar(prev => ({ ...prev, backDoc: uri, backDocBase64: base64 } as any)),
                  )
                }
              >
                {(aadhaar as any).backDoc ? (
                  <Image source={{ uri: (aadhaar as any).backDoc }} style={s.docPreview} />
                ) : (
                  <MaterialCommunityIcons name="cloud-upload-outline" size={22} color={stepColor} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SectionCard>

        {/* ── PAN (reused from cards.tsx) ── */}
        <PanCard
          pan={pan}
          isValid={isPanValid}
          onChange={onPanChange}
          onVerify={onPanVerify}
        />

        <SectionCard title="PAN Document" icon="file-image-outline" iconColor={stepColor}>
          <TouchableOpacity
            style={s.docBox}
            onPress={() =>
              pickDoc(({ uri, base64 }) =>
                setPan(prev => ({ ...prev, doc: uri, docBase64: base64 } as any)),
              )
            }
          >
            {(pan as any).doc ? (
              <Image source={{ uri: (pan as any).doc }} style={s.docPreview} />
            ) : (
              <>
                <MaterialCommunityIcons name="cloud-upload-outline" size={22} color={stepColor} />
                <Text style={s.docUploadText}>Upload PAN Document</Text>
              </>
            )}
          </TouchableOpacity>
        </SectionCard>

        {/* ── Business Registration (ispvt toggle) ── */}
        <SectionCard title="Business Registration" icon="office-building-outline" iconColor={stepColor}>
          <AppToggle
            label="Is this a private/registered business?"
            value={ispvt}
            onChange={(val: boolean) => {
              setIspvt(val);
              if (!val) {
                // false select karte hi purana BR data clear kar do
                setBrNumber('');
                setBrDoc('');
                setBrDocPreview('');
              }
            }}
          />

          {ispvt && (
            <>
              <AppInput
                label="BR Number"
                placeholder="Business Registration Number"
                autoCapitalize="characters"
                value={brNumber}
                onChangeText={t => setBrNumber(t.toUpperCase())}
              />
              <Text style={s.docLabel}>BR Document</Text>
              <TouchableOpacity
                style={s.docBox}
                onPress={() =>
                  pickDoc(({ uri, base64 }) => {
                    setBrDoc(base64);
                    setBrDocPreview(uri);
                  })
                }
              >
                {brDocPreview ? (
                  <Image source={{ uri: brDocPreview }} style={s.docPreview} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="cloud-upload-outline" size={22} color={stepColor} />
                    <Text style={s.docUploadText}>Upload BR Document</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </SectionCard>

        {!canProceed && (
          <Text style={s.helperWarn}>
            Please verify Aadhaar and PAN{ispvt ? ', and fill BR details' : ''} to continue.
          </Text>
        )}

        <NavRow
          onNext={handleNext}
          nextLabel="Next"
          stepColor={canProceed ? stepColor : colors.grey}
        />
      </ScrollView>
    </View>
  );
};

export default PartnerKycDocsScreen;

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light_blue },
  centered: { alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16, paddingBottom: 40 },
  row2: { flexDirection: 'row' },
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
  helperWarn: { fontSize: 12, color: colors.error, textAlign: 'center', marginBottom: 10 },
});