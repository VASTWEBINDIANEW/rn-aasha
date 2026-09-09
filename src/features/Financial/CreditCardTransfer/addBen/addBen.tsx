/**
 * AddBeneficiaryScreen.js
 * ------------------------------------------------------------
 * Step-wise "Add Beneficiary" flow (Credit Card -> Account transfer)
 *
 * Steps:
 *  1. Card Number       -> Verify              -> Next
 *  2. Mobile Number     -> Send OTP -> Verify OTP -> Prev/Next
 *  3. Email Address     -> Send OTP -> Verify OTP -> Prev/Next
 *  4. Aadhaar Number    -> Send OTP -> Verify OTP -> Prev/Next
 *  5. PAN Number        -> Verify              -> Prev/Next
 *  6. Account + IFSC    -> Verify both         -> Prev/Submit
 *
 * ------------------------------------------------------------
 * API WIRING (is update me kya badla) — Mobile OTP wale pattern ko
 * hi baaki sab jagah follow kiya hai:
 *
 *   Mobile   -> APP_URLS.MobileVerify (send OTP) / APP_URLS.VerifyMobile (verify OTP)
 *   Email    -> APP_URLS.SendEmailOtp (send OTP) / APP_URLS.VerifyEmailOtp (verify OTP)
 *   Aadhaar  -> APP_URLS.AadharSendOtp (send OTP) / APP_URLS.VerifyAadharCard (verify OTP)
 *   PAN      -> APP_URLS.VerifyPanCardc (direct verify, no OTP)
 *   Final    -> APP_URLS.RegisterBen (Confirm & Submit par call hota hai)
 *
 * IMPORTANT ASSUMPTIONS (please confirm against your Swagger/backend once):
 *  1. `post({ url })` (useAxiosHook) query-string wale GET-style URL ko POST
 *     body ke bina hi call karta hai — jaisa aapke diye mobile-otp snippet me
 *     tha. Agar backend ko body me bhi kuch chahiye to `post({ url, data })`
 *     me `data` add kar dena.
 *  2. Response shape fix pata nahi thi, isliye `isApiSuccess()` /
 *     `getApiMessage()` helper flexible rakhe hain (IsSuccess / Status /
 *     success / message jaise common keys check karte hain). Apne actual
 *     response ke hisaab se in 2 helpers ko tweak kar lena — baaki poora
 *     flow inhi 2 helpers pe depend karta hai.
 *  3. Aadhaar verify API me `client_id` chahiye — maan ke chala hoon ki yeh
 *     AadharSendOtp ke response me aata hai, isliye send-otp step me usko
 *     `data.aadhaar.clientId` me store kar liya hai aur verify-otp call me
 *     wahi bhej rahe hain.
 *  4. RegisterBen sirf `CardNumber` & `Cardtype` leta hai (jaisा aapne bheja) —
 *     maan ke chal raha hoon ki mobile/email/aadhaar/pan backend pe unke apne
 *     verify calls ke time hi save ho chuke hain, isliye final submit me
 *     dobara nahi bhejne pad rahe. Agar backend ko RegisterBen me yeh sab
 *     bhi chahiye, to `handleConfirmSubmit` me query params add kar dena.
 *  5. `Cardtype` ke liye `cardDetails.type` use kiya hai (agar khali ho to
 *     `cardDetails.scheme` par fallback) — apne card-verify API ke actual
 *     field name se confirm kar lena.
 *  6. Account/IFSC (Step 6) ke liye koi API nahi di gayi thi, wo abhi bhi
 *     fake `wait()` wale placeholder par hi hai — jab API mile tab
 *     `verifyField()` ke andar `account`/`ifsc` ka branch add kar dena
 *     (waise hi jaise `pan` ka add kiya hai).
 * ------------------------------------------------------------
 *
 * - Verified step ke value ke aage checkmark + pencil (edit) icon
 *   aayega, pencil pe click karte hi wahi field wapas editable ho
 *   jayegi (status idle ho jayega) taaki user naya value daal ke
 *   dobara verify kar sake.
 * - Submit pe modal open hoga jisme sabhi verified values
 *   dikhengi -> "Confirm & Submit" par RegisterBen call hoga.
 *
 * NOTE: STEP_KEYS ab step -> array-of-field-keys map hai (pehle
 * sirf single key hota tha aur step 5/Account+IFSC ke liye galat
 * 'pan' map ho raha tha — wahi fix kar diya hai taaki summary aur
 * edit dono steps sahi field(s) reset/dikhaayein).
 *
 * Dependency: react-native-vector-icons
 *   npm install react-native-vector-icons
 *   (iOS: pod install; Android: usually auto-linked on RN >= 0.60)
 * ------------------------------------------------------------
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useCardVerification } from '../hooks/Usecardverification';
import VisaLogo from '../CardTypeSVG/visaSvg';
import MastercardLogo from '../CardTypeSVG/masterSvg';
import useAxiosHook from '../../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../../utils/network/urls';
import { useRoute } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../reduxUtils/store';

// ---------- fake API wait (replace with real API calls where still pending, e.g. account/ifsc) ----------
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ---------- validators ----------
const validators = {
  card: (v) => /^\d{16}$/.test(v),
  mobile: (v) => /^[6-9]\d{9}$/.test(v),
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  aadhaar: (v) => /^\d{12}$/.test(v),
  pan: (v) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v),
  account: (v) => /^\d{9,18}$/.test(v),
  ifsc: (v) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v),
  otp: (v) => /^\d{4,7}$/.test(v),
};

const errorMessages = {
  card: 'Enter valid 16-digit card number',
  mobile: 'Enter valid 10-digit mobile number',
  email: 'Enter valid email address',
  aadhaar: 'Enter valid 12-digit Aadhaar number',
  pan: 'Enter valid PAN (e.g. ABCDE1234F)',
  account: 'Enter valid account number',
  ifsc: 'Enter valid IFSC code (e.g. SBIN0001234)',
};

const STEP_LABELS = {
  1: 'Credit Card Number',
  2: 'Mobile Number',
  3: 'Email Address',
  4: 'Aadhaar Number',
  5: 'PAN Number',
  6: 'Account & IFSC',
};

// step -> array of field keys that belong to that step
const STEP_KEYS = {
  1: ['card'],
  2: ['mobile'],
  3: ['email'],
  4: ['aadhaar'],
  5: ['pan'],
  6: ['account', 'ifsc'],
};

const TOTAL_STEPS = 6;

const maskValue = (key, value) => {
  if (!value) return '';
  if (key === 'card') return '•••• •••• •••• ' + value.slice(-4);
  if (key === 'aadhaar') return '•••• •••• ' + value.slice(-4);
  return value;
};

// ---------- response-shape helpers ----------
// Backend response ka exact shape pata nahi tha, isliye common .NET-style
// keys (IsSuccess/Status/success/message) sabko check kar liya hai.
// Apne actual response ke mutabik inhe adjust kar lena — poora API flow
// yehi 2 function decide karte hain ki call "success" mani jaaye ya nahi.
const isApiSuccess = (res) => {
  console.log(res, '^^^^^^^^^^^^^^^^');

  if (!res || typeof res !== 'object') return false;

  // Case 1:
  // {
  //   StatusCode: 200,
  //   Content: {
  //     sts: true,
  //     Message: 'OTP Send Successfully'
  //   }
  // }
  if (res.Content && typeof res.Content === 'object') {
    const content = res.Content;

    if ('sts' in content) {
      ToastAndroid.show(
        content.Message || 'Done',
        ToastAndroid.BOTTOM
      );

      return !!content.sts;
    }
  }

  // Case 2:
  // {
  //   sts: true,
  //   Message: 'OTP Verification Done'
  // }
  if ('sts' in res) {
    ToastAndroid.show(
      res.Message || 'Done',
      ToastAndroid.BOTTOM
    );

    return !!res.sts;
  }

  // Other response formats
  if ('IsSuccess' in res) return !!res.IsSuccess;

  if ('isSuccess' in res) return !!res.isSuccess;

  if ('Status' in res) {
    return (
      res.Status === true ||
      res.Status === 'Success' ||
      res.Status === 1
    );
  }

  if ('status' in res) {
    return (
      res.status === true ||
      res.status === 'Success' ||
      res.status === 200
    );
  }

  if ('success' in res) return !!res.success;

  return false;
};

const getApiMessage = (res) => {
  console.log(res);

  return (
    res?.Message ||
    res?.message ||
    res?.Error ||
    res?.error ||
    res?.Content?.Message ||
    res?.Content?.message ||
    res?.data?.Message ||
    res?.data?.Content?.Message ||
    ''
  );
};

const getAadhaarClientId = (res) =>
  res?.client_id ??
  res?.ClientId ??
  res?.clientId ??
  res?.Content?.client_id ??
  res?.Content?.ClientId ??
  res?.Content?.clientId ??
  res?.data?.client_id ??
  res?.data?.ClientId ??
  res?.data?.clientId ??
  res?.data?.Content?.client_id ??
  res?.data?.Content?.ClientId ??
  res?.data?.Content?.clientId ??
  '';
// Card Brand-wise Theme Palette (static, no need to recompute per render)
const CARD_THEMES = {
  VISA: { bg: '#1a1f71', bgAccent: '#2b3199', text: '#ffffff', badge: 'rgba(255,183,3,0.18)', badgeText: '#ffb703', chip: '#e0c896' },
  MASTERCARD: { bg: '#16181d', bgAccent: '#262a33', text: '#ffffff', badge: 'rgba(235,0,27,0.18)', badgeText: '#ff5c6c', chip: '#d4af37' },
  RUPAY: { bg: '#0b4a3f', bgAccent: '#106958', text: '#ffffff', badge: 'rgba(243,156,18,0.18)', badgeText: '#f5b041', chip: '#d4af37' },
  AMEX: { bg: '#00568c', bgAccent: '#0072b8', text: '#ffffff', badge: 'rgba(255,255,255,0.18)', badgeText: '#ffffff', chip: '#b0bec5' },
  DISCOVER: { bg: '#a83e00', bgAccent: '#c94f00', text: '#ffffff', badge: 'rgba(241,196,15,0.2)', badgeText: '#ffd85e', chip: '#d4af37' },
  GENERIC: { bg: '#232c3d', bgAccent: '#334155', text: '#ffffff', badge: 'rgba(148,163,184,0.2)', badgeText: '#cbd5e1', chip: '#cbd5e1' },
  CARD: { bg: '#232c3d', bgAccent: '#334155', text: '#ffffff', badge: 'rgba(148,163,184,0.2)', badgeText: '#cbd5e1', chip: '#cbd5e1' },
};
const getLogo = (type: string) => {
  const t = type?.toUpperCase();

  switch (t) {
    case 'VISA':
      return <VisaLogo height={20} width={30} />;

    case 'MASTERCARD':
      return <MastercardLogo height={30} width={30} />;

    default:
      return <Text style={{ color: 'black' }}>{type}</Text>;
  }
};
// ---------------- reusable: simple verify field (card / pan / account / ifsc) ----------------
// NOTE: ye component AddBeneficiaryScreen ke BAHAR define hai (top-level).
// Agar isse component ke andar define karte to har re-render (har keystroke) pe
// naya function reference banta, React ise "naya component type" samajh ke
// TextInput ko remount kar deta -> isi wajah se keyboard close ho raha tha.
const SimpleField = ({
  cardDetails,
  theme,
  displayNumber,
  fieldKey,
  label,
  placeholder,
  maxLength,
  keyboardType,
  autoCapitalize,
  field,
  onChangeValue,
  onVerify,
  onEdit,
}) => (
  <View style={styles.fieldBlock}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputRow}>
      <TextInput
        style={[styles.input, field.status === 'verified' && styles.inputDisabled]}
        value={field.value}
        onChangeText={onChangeValue}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        maxLength={maxLength}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize || 'none'}
        editable={field.status !== 'verified' && field.status !== 'loading'}
      />
      {field.status === 'verified' ? (
        <View style={styles.verifiedIconsRow}>
          <Icon name="checkmark-circle" size={26} color="#22c55e" style={styles.statusIcon} />
          <TouchableOpacity
            onPress={onEdit}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.editIconBtn}
          >
            <Icon name="create-outline" size={22} color="#2563eb" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.verifyBtn, field.status === 'loading' && styles.verifyBtnDisabled]}
          disabled={field.status === 'loading'}
          onPress={onVerify}
        >
          {field.status === 'loading' ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.verifyBtnText}>Verify</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
    {!!field.error && <Text style={styles.errorText}>{field.error}</Text>}

    {/* Card preview - only rendered for the card field, when we actually have bank details */}
    {fieldKey === 'card' && cardDetails?.bank && cardDetails.bank !== '-------' && (
      <View style={styles.cardPreviewContainer}>
        <View style={[styles.cardSurface, { backgroundColor: theme.bg }]}>
          {/* diagonal accent glow, purely decorative */}
          <View style={[styles.cardGlow, { backgroundColor: theme.bgAccent }]} />

          <View style={styles.cardTopRow}>
            <View style={[styles.chip, { backgroundColor: theme.chip }]}>
              <View style={styles.chipLineV} />
              <View style={styles.chipLineH} />
            </View>
            <Text style={[styles.cardBankName, { color: theme.text }]} numberOfLines={1}>
              {cardDetails.bank.toUpperCase()}
            </Text>
          </View>

          <Text style={[styles.cardDisplayNumber, { color: theme.text }]}>
            {displayNumber?.length > 0 ? displayNumber : '•••• •••• •••• ••••'}
          </Text>

          <View style={styles.cardBottomRow}>
            <View>
              <Text style={styles.cardSmallLabel}>CARD TYPE</Text>
              <Text style={[styles.cardHolderName, { color: theme.text }]}>
                {cardDetails.type ? cardDetails.type.toUpperCase() : 'CREDIT'}
              </Text>
            </View>

            <View style={[styles.schemeTag, { backgroundColor: 'white' }]}>
              {getLogo(cardDetails.scheme)}
              {/* <Text style={[styles.cardBrandText, { color: theme.badgeText }]}>
                {cardDetails.scheme ? cardDetails.scheme.toUpperCase() : ''}
              </Text> */}
            </View>
          </View>
        </View>
      </View>
    )}
  </View>
);

// ---------------- reusable: OTP field (mobile / email / aadhaar) ----------------
const OtpField = ({
  fieldKey,
  label,
  placeholder,
  maxLength,
  keyboardType,
  field,
  onChangeValue,
  onChangeOtp,
  onSendOtp,
  onVerifyOtp,
  onEdit,
}) => (
  <View style={styles.fieldBlock}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputRow}>
      <TextInput
        style={[styles.input, field.status === 'verified' && styles.inputDisabled]}
        value={field.value}
        onChangeText={onChangeValue}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        maxLength={maxLength}
        keyboardType={keyboardType}
        autoCapitalize={fieldKey === 'email' ? 'none' : undefined}
        editable={field.status !== 'verified' && field.status !== 'loading' && !field.otpSent}
      />
      {field.status === 'verified' ? (
        <View style={styles.verifiedIconsRow}>
          <Icon name="checkmark-circle" size={26} color="#22c55e" style={styles.statusIcon} />
          <TouchableOpacity
            onPress={onEdit}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.editIconBtn}
          >
            <Icon name="create-outline" size={22} color="#2563eb" />
          </TouchableOpacity>
        </View>
      ) : !field.otpSent ? (
        <TouchableOpacity
          style={[styles.verifyBtn, field.status === 'loading' && styles.verifyBtnDisabled]}
          disabled={field.status === 'loading'}
          onPress={onSendOtp}
        >
          {field.status === 'loading' ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Icon name="paper-plane-outline" size={18} color="#fff" />
          )}
        </TouchableOpacity>
      ) : null}
    </View>
    {!!field.error && <Text style={styles.errorText}>{field.error}</Text>}

    {field.otpSent && field.status !== 'verified' && (
      <View>
        <View style={styles.otpRow}>
          <TextInput
            style={styles.otpInput}
            value={field.otp}
            onChangeText={onChangeOtp}
            placeholder="Enter 6-digit OTP"
            placeholderTextColor="#9ca3af"
            keyboardType="numeric"
            maxLength={6}
            editable={field.otpStatus !== 'loading'}
          />
          <TouchableOpacity
            style={[styles.otpVerifyBtn, field.otpStatus === 'loading' && styles.verifyBtnDisabled]}
            disabled={field.otpStatus === 'loading'}
            onPress={onVerifyOtp}
          >
            {field.otpStatus === 'loading' ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="shield-checkmark-outline" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
        {!!field.otpError && <Text style={styles.errorText}>{field.otpError}</Text>}
        <TouchableOpacity onPress={onSendOtp}>
          <Text style={styles.resendText}>Resend OTP</Text>
        </TouchableOpacity>
      </View>
    )}
  </View>
);

export default function AddBeneficiaryScreen() {

  const {ccd}= useSelector((state:RootState)=> state.userInfo)
  const route = useRoute();
  const { StepNumber , ct ,cn} = route.params;
console.log(route.params)
  const [data, setData] = useState({
    card: { value: cn, status: 'idle', error: '' }, // idle | loading | verified
    mobile: {
      value: '9370521211',
      status: 'idle',
      error: '',
      otp: '',
      otpSent: false,
      otpStatus: 'idle',
      otpError: '',
    },
    email: {
      value: 'r.n.developer.1211@gmail.com',
      status: 'idle',
      error: '',
      otp: '',
      otpSent: false,
      otpStatus: 'idle',
      otpError: '',
    },
    aadhaar: {
      value: '210900202537',
      status: 'idle',
      error: '',
      otp: '',
      otpSent: false,
      otpStatus: 'idle',
      otpError: '',
      clientId: '', // AadharSendOtp response se aayega, VerifyAadharCard me chahiye
    },
    pan: { value: 'CKTPV8897D', status: 'idle', error: '' },
    account: { value: '9370521211', status: 'idle', error: '' },
    ifsc: { value: 'AIRP0000001', status: 'idle', error: '' },
  });
  const { isValidCard, loading, error, cardDetails, checkCard } = useCardVerification();
  const [displayNumber, setDisplayNumber] = useState('');
  const { post } = useAxiosHook();

  // ---------------- navigation state ----------------
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStep, setMaxStep] = useState(1); // furthest step already unlocked
  const [editingStep, setEditingStep] = useState(null); // step reopened via edit icon
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const updateField = (key, patch) =>
    setData((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));

  // ---------------- verify handlers (no-OTP fields: card / pan / account / ifsc) ----------------
  const verifyField = async (key) => {
    const field = data[key];
    if (!validators[key](field.value)) {
      updateField(key, { error: errorMessages[key] });
      return;
    }

    updateField(key, { error: '', status: 'loading' });

    if (key === 'card') {
      const rawNumber = data.card.value.replace(/\D/g, '');
      setDisplayNumber(rawNumber);
      checkCard(rawNumber);
      const url =  `${APP_URLS.RegisterBen}CardNumber=${data.card.value}&Cardtype=${ccd.scheme}`
      const res = await post({url
       
      })
      
      console.log(url,'RegisterBen',res)
      return;
    }

    if (key === 'pan') {
      try {
        const url = `${APP_URLS.VerifyPanCardc}Pancardno=${data.pan.value}&Cardnumber=${data.card.value}`;
        const res = await post({ url });

        if (!isApiSuccess(res)) {
          updateField('pan', { status: 'idle', error: getApiMessage(res) || 'PAN verification failed' });
          return;
        }
        updateField('pan', { status: 'verified' });
      } catch (e) {
        updateField('pan', { status: 'idle', error: e?.message || 'Something went wrong, try again' });
      }
      return;
    }

    // account / ifsc: no API given yet -> keep the placeholder wait().
    // TODO: API call -> verify {key} (add a branch here like `pan` above once available)
    await wait(5000);
    updateField(key, { status: 'verified' });
  };

  // Card verification result comes back async from the hook -> sync it into `data.card`
  useEffect(() => {
    if (data.card.status === 'loading' && !loading) {
      if (isValidCard === true) {
        updateField('card', { status: 'verified', error: '' });
      } else if (isValidCard === false) {
        updateField('card', {
          status: 'idle',
          error: error || 'Invalid Card Number (Luhn Check Failed)',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isValidCard, loading, error, data.card.status]);

  // ---------------- send OTP (mobile / email / aadhaar) ----------------
  const sendOtp = async (key) => {
    console.log(key,'SENDKEY')
    const field = data[key];
    if (!validators[key](field.value)) {
      updateField(key, { error: errorMessages[key] });
      return;
    }

    updateField(key, { error: '', status: 'loading' });

    try {
      let url = '';
      if (key === 'mobile') {
        url = `${APP_URLS.MobileVerify}Mobile=${data.mobile.value}&Cardnumber=${data.card.value}`;
      } else if (key === 'email') {
        url = `${APP_URLS.SendEmailOtp}Email=${encodeURIComponent(data.email.value)}&Cardnumber=${data.card.value}`;
      } else if (key === 'aadhaar') {

        url = `${APP_URLS.AadharSendOtp}${data.aadhaar.value}`;
      }
console.log('SEND OTP REQ=>>',url)
      const res = await post({ url });
console.log(key ,'SENDOTP==>',res ,url)
      if (!isApiSuccess(res)) {
        updateField(key, { status: 'idle', error: getApiMessage(res) || 'Failed to send OTP, try again' });
        return;
      }

      const patch = { status: 'idle', otpSent: true, otp: '', otpError: '' };
      if (key === 'aadhaar') {
        patch.clientId = getAadhaarClientId(res);
      }
      updateField(key, patch);
    } catch (e) {
      updateField(key, { status: 'idle', error: e?.message || 'Failed to send OTP, try again' });
    }
  };

  // ---------------- verify OTP (mobile / email / aadhaar) ----------------
  const verifyOtp = async (key) => {
    console.log(key,'VERIFY=>>')
    const field = data[key];
    if (!validators.otp(field.otp)) {
      updateField(key, { otpError: 'Enter valid 6-digit OTP' });
      return;
    }
    updateField(key, { otpError: '', otpStatus: 'loading' });

    try {
      let url = '';
      if (key === 'mobile') {
        url = 'CreditCardTransfer/api/CREDITCARDBillPay/VerifyMobile?Mobile=9370521211&OTP=8053&Cardnumber=5555555555554444'
       // url = `${APP_URLS.VerifyMobile}Mobile=${data.mobile.value}&OTP=${field.otp}&Cardnumber=${data.card.value}`;
      } else if (key === 'email') {
        url = `${APP_URLS.VerifyEmailOtp}Email=${encodeURIComponent(data.email.value)}&Cardnumber=${data.card.value}&OTP=${field.otp}`;
      } else if (key === 'aadhaar') {
        url = `${APP_URLS.VerifyAadharCard}client_id=${field.clientId || ''}&otp=${field.otp}&Cardnumber=${data.card.value}&aadharno=${data.aadhaar.value}`;
      }
///CreditCardTransfer/api/CREDITCARDBillPay/VerifyAadharCard?client_id=&otp=&Cardnumber=&aadharno=client_id=7317E648F7DBCB74E989479E70C4B6C92464&otp=972293&Cardnumber=5555555555554444&aadharno=210900202537

    console.log(key,'VERIFY=>>',url)

      const res = await post({ url });
console.log(key ,'VERIFY_OTP==>',res)
if(key =='email'){
        updateField(key, { otpStatus: 'idle', status: 'verified', otpSent: false });

}
      if (!isApiSuccess(res)) {
        updateField(key, { otpStatus: 'idle', otpError: getApiMessage(res) || 'Invalid OTP, try again' });
        return;
      }

      updateField(key, { otpStatus: 'idle', status: 'verified', otpSent: false });
    } catch (e) {
      updateField(key, { otpStatus: 'idle', otpError: e?.message || 'Invalid OTP, try again' });
    }
  };

  // ---------------- edit handler (re-open a verified field) ----------------
  // Used by BOTH the inline pencil icon (inside a step) and the summary-row
  // pencil icon (for earlier completed steps).
  const handleFieldEdit = (key) => {
    if (key === 'mobile' || key === 'email' || key === 'aadhaar') {
      updateField(key, {
        status: 'idle',
        error: '',
        otp: '',
        otpSent: false,
        otpStatus: 'idle',
        otpError: '',
        ...(key === 'aadhaar' ? { clientId: '' } : {}),
      });
    } else {
      updateField(key, { status: 'idle', error: '' });
    }
  };

  const isStepVerified = (step) => {
    if (step === 1) return data.card.status === 'verified';
    if (step === 2) return data.mobile.status === 'verified';
    if (step === 3) return data.email.status === 'verified';
    if (step === 4) return data.aadhaar.status === 'verified';
    if (step === 5) return data.pan.status === 'verified';
    if (step === 6)
      return data.account.status === 'verified' && data.ifsc.status === 'verified';
    return false;
  };

  // ---------------- navigation handlers ----------------
  const goNext = () => {
    const next = Math.min(currentStep + 1, TOTAL_STEPS);
    setCurrentStep(next);
    setMaxStep((m) => Math.max(m, next));
  };

  const goPrev = () => setCurrentStep((s) => Math.max(1, s - 1));

  const handleEdit = (step) => {
    const keys = STEP_KEYS[step] || [];
    keys.forEach((key) => handleFieldEdit(key));
    setEditingStep(step);
    setCurrentStep(step);
  };

  const handleDoneEditing = () => {
    setEditingStep(null);
    setCurrentStep(maxStep);
  };

  // ---------------- final submit: RegisterBen ----------------
  const handleConfirmSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      const cardType = cardDetails?.type || cardDetails?.scheme || '';
      const url = `${APP_URLS.RegisterBen}CardNumber=${data.card.value}&Cardtype=${encodeURIComponent(cardType)}`;

      const res = await post({ url });

      if (!isApiSuccess(res)) {
        Alert.alert('Failed', getApiMessage(res) || 'Could not add beneficiary, please try again.');
        return;
      }

      setModalVisible(false);
      Alert.alert('Success', 'Beneficiary added successfully!');
    } catch (e) {
      Alert.alert('Failed', e?.message || 'Could not add beneficiary, please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const isEditingEarlier = editingStep !== null && editingStep < maxStep;
  const activeVerified = isStepVerified(currentStep);

  const theme = useMemo(() => {
    const scheme = cardDetails?.scheme ? cardDetails.scheme.toUpperCase() : '';
    return CARD_THEMES[scheme] ?? CARD_THEMES.GENERIC;
  }, [cardDetails?.scheme]);

  // ---------------- step content ----------------
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <SimpleField
            theme={theme}
            cardDetails={cardDetails}
            displayNumber={displayNumber}
            fieldKey="card"
            label={STEP_LABELS[1]}
            placeholder="1234 5678 9012 3456"
            maxLength={16}
            keyboardType="numeric"
            field={data.card}
            onChangeValue={(t) => updateField('card', { value: t, error: '' })}
            onVerify={() => verifyField('card')}
            onEdit={() => handleFieldEdit('card')}
          />
        );
      case 2:
        return (
          <OtpField
            fieldKey="mobile"
            label={STEP_LABELS[2]}
            placeholder="9876543210"
            maxLength={10}
            keyboardType="phone-pad"
            field={data.mobile}
            onChangeValue={(t) => updateField('mobile', { value: t, error: '' })}
            onChangeOtp={(t) => updateField('mobile', { otp: t, otpError: '' })}
            onSendOtp={() => sendOtp('mobile')}
            onVerifyOtp={() => verifyOtp('mobile')}
            onEdit={() => handleFieldEdit('mobile')}
          />
        );
      case 3:
        return (
          <OtpField
            fieldKey="email"
            label={STEP_LABELS[3]}
            placeholder="name@example.com"
            maxLength={60}
            keyboardType="email-address"
            field={data.email}
            onChangeValue={(t) => updateField('email', { value: t, error: '' })}
            onChangeOtp={(t) => updateField('email', { otp: t, otpError: '' })}
            onSendOtp={() => sendOtp('email')}
            onVerifyOtp={() => verifyOtp('email')}
            onEdit={() => handleFieldEdit('email')}
          />
        );
      case 4:
        return (
          <OtpField
            fieldKey="aadhaar"
            label={STEP_LABELS[4]}
            placeholder="123456789012"
            maxLength={12}
            keyboardType="numeric"
            field={data.aadhaar}
            onChangeValue={(t) => updateField('aadhaar', { value: t, error: '' })}
            onChangeOtp={(t) => updateField('aadhaar', { otp: t, otpError: '' })}
            onSendOtp={() => sendOtp('aadhaar')}
            onVerifyOtp={() => verifyOtp('aadhaar')}
            onEdit={() => handleFieldEdit('aadhaar')}
          />
        );
      case 5:
        return (
          <SimpleField
            fieldKey="pan"
            label={STEP_LABELS[5]}
            placeholder="ABCDE1234F"
            maxLength={10}
            autoCapitalize="characters"
            field={data.pan}
            onChangeValue={(t) => updateField('pan', { value: t, error: '' })}
            onVerify={() => verifyField('pan')}
            onEdit={() => handleFieldEdit('pan')}
          />
        );
      case 6:
        return (
          <>
            <SimpleField
              fieldKey="account"
              label="Account Number"
              placeholder="Enter account number"
              maxLength={18}
              keyboardType="numeric"
              field={data.account}
              onChangeValue={(t) => updateField('account', { value: t, error: '' })}
              onVerify={() => verifyField('account')}
              onEdit={() => handleFieldEdit('account')}
            />
            <SimpleField
              fieldKey="ifsc"
              label="IFSC Code"
              placeholder="SBIN0001234"
              maxLength={11}
              autoCapitalize="characters"
              field={data.ifsc}
              onChangeValue={(t) => updateField('ifsc', { value: t, error: '' })}
              onVerify={() => verifyField('ifsc')}
              onEdit={() => handleFieldEdit('ifsc')}
            />
          </>
        );
      default:
        return null;
    }
  };

  // ---------------- completed-step summary rows ----------------
  const renderSummary = () => {
    const rows = [];
    for (let s = 1; s < currentStep; s += 1) {
      if (s === editingStep) continue;
      const keys = STEP_KEYS[s] || [];
      const allVerified = keys.length > 0 && keys.every((k) => data[k].status === 'verified');
      if (allVerified) {
        const valueText = keys.map((k) => maskValue(k, data[k].value)).join('   ·   ');
        rows.push(
          <View key={s} style={styles.summaryRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.summaryLabel}>{STEP_LABELS[s]}</Text>
              <Text style={styles.summaryValue}>{valueText}</Text>
            </View>
            <Icon name="checkmark-circle" size={18} color="#22c55e" style={{ marginRight: 10 }} />
            <TouchableOpacity onPress={() => handleEdit(s)} style={styles.editBtn}>
              <Icon name="create-outline" size={20} color="#2563eb" />
            </TouchableOpacity>
          </View>
        );
      }
    }
    return rows;
  };

  // ---------------- progress dots ----------------
  const renderProgress = () => (
    <View style={styles.progressRow}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
        <View
          key={s}
          style={[
            styles.progressDot,
            isStepVerified(s) && styles.progressDotDone,
            s === currentStep && !isStepVerified(s) && styles.progressDotActive,
          ]}
        />
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Add Beneficiary</Text>
          <Text style={styles.headerSubtitle}>Credit Card → Account Transfer</Text>
          {renderProgress()}
        </View>

        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {renderSummary()}

          <View style={styles.stepCard}>
            <Text style={styles.stepTitle}>
              Step {currentStep} of {TOTAL_STEPS} · {STEP_LABELS[currentStep]}
            </Text>
            {renderStepContent()}
          </View>
        </ScrollView>

        <View style={styles.navRow}>
          {currentStep > 1 && !isEditingEarlier && (
            <TouchableOpacity style={styles.prevBtn} onPress={goPrev}>
              <Icon name="arrow-back" size={18} color="#2563eb" />
              <Text style={styles.prevBtnText}>Prev</Text>
            </TouchableOpacity>
          )}

          {activeVerified && isEditingEarlier && (
            <TouchableOpacity style={styles.nextBtn} onPress={handleDoneEditing}>
              <Text style={styles.nextBtnText}>Done</Text>
              <Icon name="checkmark" size={18} color="#fff" />
            </TouchableOpacity>
          )}

          {activeVerified && !isEditingEarlier && currentStep < TOTAL_STEPS && (
            <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
              <Text style={styles.nextBtnText}>Next</Text>
              <Icon name="arrow-forward" size={18} color="#fff" />
            </TouchableOpacity>
          )}

          {activeVerified && !isEditingEarlier && currentStep === TOTAL_STEPS && (
            <TouchableOpacity style={styles.submitBtn} onPress={() => setModalVisible(true)}>
              <Text style={styles.nextBtnText}>Submit</Text>
              <Icon name="checkmark-done" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* ---------------- confirm modal ---------------- */}
      <Modal visible={modalVisible} animationType="none" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Confirm Beneficiary Details</Text>
            <ScrollView style={{ maxHeight: 320 }}>
              <ModalRow label="Card Number" value={maskValue('card', data.card.value)} />
              <ModalRow label="Mobile Number" value={data.mobile.value} />
              <ModalRow label="Email Address" value={data.email.value} />
              <ModalRow label="Aadhaar Number" value={maskValue('aadhaar', data.aadhaar.value)} />
              <ModalRow label="PAN Number" value={data.pan.value} />
              <ModalRow label="Account Number" value={data.account.value} />
              <ModalRow label="IFSC Code" value={data.ifsc.value} />
            </ScrollView>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setModalVisible(false)}
                disabled={submitting}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalConfirmBtn, submitting && styles.verifyBtnDisabled]}
                onPress={handleConfirmSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalConfirmText}>Confirm & Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const ModalRow = ({ label, value }) => (
  <View style={styles.modalRow}>
    <Text style={styles.modalRowLabel}>{label}</Text>
    <Text style={styles.modalRowValue}>{value || '-'}</Text>
  </View>
);

// ------------------------------------------------------------
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  headerSubtitle: { fontSize: 13, color: '#6b7280', marginTop: 2, marginBottom: 12 },
  progressRow: { flexDirection: 'row', gap: 6 },
  progressDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5e7eb',
  },
  progressDotDone: { backgroundColor: '#22c55e' },
  progressDotActive: { backgroundColor: '#2563eb' },

  body: { padding: 20, paddingBottom: 12 },

  // Card UI
  cardPreviewContainer: { paddingHorizontal: 0, marginTop: 15, marginBottom: 4, alignItems: 'center' },
  cardSurface: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    padding: 22,
    justifyContent: 'space-between',
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  cardGlow: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.5,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chip: {
    width: 42,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipLineV: { position: 'absolute', width: 1, height: '70%', backgroundColor: 'rgba(0,0,0,0.25)' },
  chipLineH: { position: 'absolute', width: '70%', height: 1, backgroundColor: 'rgba(0,0,0,0.25)' },
  cardBankName: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, maxWidth: '65%', textAlign: 'right' },
  cardDisplayNumber: { fontSize: 21, letterSpacing: 2.5, fontWeight: '600' },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardSmallLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 9, letterSpacing: 1, fontWeight: '700' },
  cardHolderName: { fontSize: 13, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  schemeTag: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  cardBrandText: { fontSize: 13, fontWeight: '900', letterSpacing: 1 },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryLabel: { fontSize: 12, color: '#6b7280' },
  summaryValue: { fontSize: 14, color: '#111827', fontWeight: '600', marginTop: 2 },
  editBtn: { padding: 4 },

  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  stepTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 14 },

  fieldBlock: { marginBottom: 14 },
  label: { fontSize: 13, color: '#374151', marginBottom: 6, fontWeight: '600' },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#111827',
    backgroundColor: '#fff',
  },
  inputDisabled: { backgroundColor: '#f3f4f6', color: '#6b7280' },
  verifiedIconsRow: { flexDirection: 'row', alignItems: 'center' },
  statusIcon: { marginLeft: 10 },
  editIconBtn: { marginLeft: 10, padding: 2 },
  verifyBtn: {
    marginLeft: 10,
    backgroundColor: '#2563eb',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBtnDisabled: { opacity: 0.7 },
  verifyBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 6 },

  otpRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  otpInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    letterSpacing: 2,
    color: '#111827',
  },
  otpVerifyBtn: {
    marginLeft: 10,
    backgroundColor: '#16a34a',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendText: { color: '#2563eb', fontSize: 12, marginTop: 8, fontWeight: '600' },

  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  prevBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 6 },
  prevBtnText: { color: '#2563eb', fontWeight: '700', marginLeft: 4 },
  nextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
    marginLeft: 'auto',
    gap: 6,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 10,
    marginLeft: 'auto',
    gap: 6,
  },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 20,
  },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 14 },
  modalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  modalRowLabel: { color: '#6b7280', fontSize: 13 },
  modalRowValue: { color: '#111827', fontSize: 13, fontWeight: '600' },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  modalCancelText: { color: '#374151', fontWeight: '700' },
  modalConfirmBtn: {
    flex: 1.4,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalConfirmText: { color: '#fff', fontWeight: '700' },
});