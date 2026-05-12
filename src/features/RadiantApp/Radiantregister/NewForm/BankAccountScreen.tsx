/* eslint-disable no-unreachable */
// screens/BankAccountScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  StepBanner,
  AppInput,
  SelectPicker,
  SectionCard,
  NavRow,
  getStepColor,
} from '../../components/FormUI';
import { colors } from '../../../../utils/styles/theme';
import { useFormCtx } from './FormContext';
import useAxiosHook from '../../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../../utils/network/urls';
import { toast } from './AadhaarPanVerification/types';
import { hScale, wScale } from '../../../../utils/styles/dimensions';
import BankListModal from '../../../../components/BankListModal';
import ShowLoader from '../../../../components/ShowLoder';

const STEP = 8;

const ACCOUNT_TYPE_OPTIONS = ['Savings', 'Current', 'Salary'];

// ─── Validation ────────────────────────────────────────────
const BankAccountSchema = Yup.object({
  accountNumber: Yup.string()
    .matches(/^\d{9,18}$/, 'Enter valid account number (9–18 digits)')
    .required('Account number required'),
  ifscCode: Yup.string()
    // .matches(/^[A-Z]{4}0[A-Z0-9]{6}$/i, 'Enter valid IFSC code (e.g. SBIN0001234)')
    .required('IFSC code required'),
  accountType: Yup.string().required('Account type required'),
  branchName: Yup.string().required('Branch name required'),
});

// ─── Main Screen ───────────────────────────────────────────
const BankAccountScreen = ({ onNext }: { onNext: () => void }) => {
  const [loading,setLoading] = useState(true);
  const { post } = useAxiosHook();
  const { formData, updateStep, nextStep } = useFormCtx();
  const stepColor = getStepColor(STEP);

  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifiedData, setVerifiedData] = useState({
    accountHolderName: '',
    bankName: '',
  });

  // ── Bank List state ────────────────────────────────────
  const [bankList, setBankList] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [isBankOpen, setIsBankOpen] = useState(false);
  const formik = useFormik({
    initialValues: {
      accountNumber: '',
      ifscCode: '',
      accountType: '',
      branchName: '',
    },
    validationSchema: BankAccountSchema,
    validateOnBlur: true,
    validateOnChange: false,

    onSubmit: async (values) => {
      if (!verified) {
        toast('Please verify your account first');
        return;
      }

      try {
        const payload = {
          AccountHolderName: verifiedData.accountHolderName,
          AccountNumber: values.accountNumber,
          BankName: bankDisplayName,
          IFSCCode: values.ifscCode,
          AccountType: values.accountType,
          BranchName: values.branchName,
        };
        console.log('📦 InsertForm8 REQUEST:', JSON.stringify(payload, null, 2));
        console.log('📤 InsertForm8 URL:', APP_URLS.InsertForm8Update);

        const res = await post({ url: APP_URLS.InsertForm8Update, data: payload });
        console.log('📥 InsertForm8 RESPONSE:', JSON.stringify(res, null, 2));
        if (res?.StatusCode === 200) {
          toast(res?.Content.Message || 'Bank details saved!');
          onNext(9);

          updateStep('bankAccount', values);
          nextStep();
        } else {
          toast(res?.Content.Message || 'Submit failed. Try again.');
        }
      } catch (err) {
        console.log('❌ InsertForm8 ERROR:', err);
        toast('Something went wrong. Try again.');
      }
    },
  });

  const { values, errors, touched, handleSubmit, setFieldValue, setFieldTouched } = formik;

  const fetchBank = async () => {
    try {
      const response = await post({ url: APP_URLS.aepsBanklist });
      console.log('Bank Info:', response);
      if (response.RESULT === '0') {
        setBankList(response['ADDINFO']['data']);
      }
    } catch {
      console.error('Bank list fetch failed');
    }
  };

  useEffect(() => {
    fetchBank();

    const fetchData = async () => {
      try {
        console.log('📡 ShowForm8 URL:', APP_URLS.ShowForm8);
        const res = await post({ url: APP_URLS.ShowForm8 });
        console.log('✅ ShowForm8 RESPONSE:', JSON.stringify(res, null, 2));

        if (res?.StatusCode === 200) {
          setLoading(false);
          const c = res.Content;

          formik.setValues({
            accountNumber: c.AccountNumber ?? '',
            ifscCode: c.IFSCCode ?? '',
            accountType: c.AccountType ?? '',
            branchName: c.BranchName ?? '',
          }, false);

          if (c.AccountHolderName) {
            setVerifiedData({
              accountHolderName: c.AccountHolderName ?? '',
              bankName: c.BankName ?? '',
            });
            setVerified(true);
            setSelectedBank({ BankName: c.BankName });

          }
        }
      } catch (e) {
        console.log('❌ ShowForm8 ERROR:', e);
      }
    };
    fetchData();
  }, []);

  const resetVerify = () => {
    setVerified(false);
    setVerifiedData({ accountHolderName: '', bankName: '' });
  };

  const handleVerify = async () => {
    const { accountNumber, ifscCode } = values;

    if (!selectedBank) {
      toast('Select bank');
      return;
    }
    if (!accountNumber) {
      toast('Enter account number');
      return;
    }
    if (!ifscCode) {
      toast('Enter IFSC');
      return;
    }

    setVerifying(true);
    resetVerify();

    try {
      const payload = {
        account: accountNumber,
        ifsc: ifscCode,
        Bankname: bankDisplayName,
      };

      console.log('📤 AccountVerify REQUEST:', JSON.stringify(payload, null, 2));

      const res = await post({
        url: APP_URLS.AccountVerify,
        data: payload,
      });

      console.log('✅ AccountVerify RESPONSE:', JSON.stringify(res, null, 2));

      const content = res?.Content;
      // AccountVerify RESPONSE: {
      //   "Version": "1.0",
      //   "StatusCode": 200,
      //   "Content": {
      //     "statuscode": "ERR",
      //     "status": "Beneficiary account is blocked/frozen",
      //     "data": {
      //       "remarks": "Beneficiary account is blocked/frozen",
      //       "bankrefno": "Beneficiary account is blocked/frozen",
      //       "ipay_id": "D824162131X88C",
      //       "benename": "",
      //       "locked_amt": 0,
      //       "charged_amt": "-2.1800",
      //       "verification_status": "VERIFIED"
      //     },
      //     "Local": "Api"
      //   }
      // }
      if (content?.statuscode === 'TXN' && content?.data?.benename) {
        setVerified(true);
        setVerifiedData({
          accountHolderName: content.data.benename,
          bankName: bankDisplayName,
        });
        toast('Account Verified ✓');
      } else {
        setVerified(false);
        toast(content.status || content?.data?.remarks || 'Verification failed');
      }
    } catch (e) {
      console.log('❌ AccountVerify ERROR:', e);
      toast('Error verifying account');
    } finally {
      setVerifying(false);
    }
  };

  const f = (name: keyof typeof values) => ({
    value: values[name],
    error: errors[name] as string | undefined,
    touched: !!touched[name],
    onBlur: () => setFieldTouched(name, true),
    onChangeText: (t: string) => {
      setFieldValue(name, t);
      if (['accountNumber', 'ifscCode'].includes(name)) resetVerify();
    },
  });

  const onPressNext = async () => {

    const errs = await formik.validateForm();
    console.log('❌ Validation Errors:', errs);
    if (Object.keys(errs).length > 0) {
      toast(Object.values(errs)[0] as string);
      return;
    }
    handleSubmit();
  };

  // ─── Bank display name helper ─────────────────────────────
  const bankDisplayName = selectedBank
    ? (
      selectedBank?.BankName ??
      selectedBank?.bankName ??
      selectedBank?.bank_name ??
      selectedBank?.name ??
      selectedBank?.Name ??
      selectedBank?.label ??
      Object.values(selectedBank)?.[0] ??
      'Selected'
    )
    : '';

  return (
    <View style={s.screen}>
      {/* <StepBanner currentStep={STEP} /> */}

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
              {loading&&<ShowLoader/>}

        {/* ── Bank Account Details ── */}
        <SectionCard title="Bank Account Details" icon="bank-outline" iconColor={stepColor}>

          {/* Bank Name Picker */}
          <View style={s.bankPickerWrap}>
            <Text style={s.bankPickerLabel}>
              Bank Name <Text style={s.req}>*</Text>
            </Text>
            <TouchableOpacity
              style={[s.bankPickerBtn, { borderColor: selectedBank ? stepColor : '#D1D5DB' }]}
              onPress={() => setIsBankOpen(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name="bank-outline"
                size={wScale(16)}
                color={selectedBank ? stepColor : '#9CA3AF'}
              />
              <Text style={[s.bankPickerText, selectedBank && { color: '#1F2937' }]} numberOfLines={1}>
                {selectedBank ? bankDisplayName : 'Select bank'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={wScale(18)} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Account Number */}
          <AppInput
            label="Account Number"
            placeholder="Enter account number"
            keyboardType="numeric"
            {...f('accountNumber')}
          />

          {/* IFSC Code */}
          <AppInput
            label="IFSC Code"
            placeholder="e.g. SBIN0001234"
            autoCapitalize="characters"
            {...f('ifscCode')}
            maxLength={11}
          />
          <AppInput
            label="Branch Name"
            placeholder="Enter branch name"
            {...f('branchName')}
          />
          <SelectPicker
            label="Account Type"
            options={ACCOUNT_TYPE_OPTIONS}
            value={values.accountType}
            onChange={(v) => setFieldValue('accountType', v)}
            error={errors.accountType}
            touched={!!touched.accountType}
          />
          {/* Verify Button */}
          <TouchableOpacity
            style={[s.verifyBtn, verified ? s.verifyBtnDone : { borderColor: stepColor }]}
            onPress={handleVerify}
            disabled={verifying || verified}
            activeOpacity={0.8}
          >
            {verifying
              ? <ActivityIndicator size="small" color={stepColor} />
              : <MaterialCommunityIcons
                name={verified ? 'check-circle' : 'bank-check'}
                size={wScale(18)}
                color={verified ? '#16A34A' : stepColor}
              />
            }
            <Text style={[s.verifyBtnText, { color: verified ? '#16A34A' : stepColor }]}>
              {verifying ? 'Verifying...' : verified ? 'Account Verified ✓' : 'Verify Account'}
            </Text>
          </TouchableOpacity>

          {verified && (
            <>
              {/* Account Holder Name (read-only, from API) */}
              <AppInput
                label="Account Holder Name"
                value={verifiedData.accountHolderName}
                editable={false}
              />
            </>
          )}
        </SectionCard>

        <NavRow onNext={onPressNext} stepColor={stepColor} />
      </ScrollView>

      {/* ── Bank List Modal ── */}
      <BankListModal
        visible={isBankOpen}
        onClose={() => setIsBankOpen(false)}
        data={bankList}
        onSelect={(bank) => {
          console.log('🏦 Selected Bank Object:', JSON.stringify(bank, null, 2));
          setSelectedBank(bank);
          setIsBankOpen(false);
          resetVerify();
        }}
      />
    </View>
  );
};

export default BankAccountScreen;

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light_blue },
  scroll: { padding: 16, paddingBottom: 40 },

  req: { color: '#EF4444', fontWeight: '700' },

  // Bank picker
  bankPickerWrap: { marginBottom: hScale(14) },
  bankPickerLabel: { fontSize: wScale(13), color: '#374151', fontWeight: '500', marginBottom: hScale(6) },
  bankPickerBtn: { flexDirection: 'row', alignItems: 'center', gap: wScale(8), borderWidth: 1.5, borderRadius: wScale(10), paddingHorizontal: wScale(14), paddingVertical: hScale(12), backgroundColor: '#F9FAFB' },
  bankPickerText: { flex: 1, fontSize: wScale(13), color: '#9CA3AF' },

  // Verify button
  verifyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wScale(8), borderWidth: 1.5, borderRadius: wScale(10), paddingVertical: hScale(13), marginTop: hScale(6), backgroundColor: '#F9FAFB' },
  verifyBtnDone: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  verifyBtnText: { fontSize: wScale(14), fontWeight: '600' },

  // Verified card
  verifiedCard: { marginTop: hScale(12), backgroundColor: '#F0FDF4', borderRadius: wScale(10), borderWidth: 1, borderColor: '#BBF7D0', overflow: 'hidden' },
  verifiedRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: wScale(14), paddingVertical: hScale(10), borderBottomWidth: 1, borderBottomColor: '#DCFCE7' },
  verifiedLabel: { fontSize: wScale(12.5), color: '#475569' },
  verifiedValue: { fontSize: wScale(13), color: '#15803D', fontWeight: '600', textAlign: 'right', flex: 1, marginLeft: wScale(8) },
});
