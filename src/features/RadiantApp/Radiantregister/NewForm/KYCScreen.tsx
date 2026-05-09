// screens/KYCScreen.tsx
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useFormik } from 'formik';
import { KYCSchema } from '../../utils/validationSchemas';       // ← apna path
import { useFormCtx } from '../../context/FormContext';           // ← apna path
import { colors } from '../../utils/styles/theme';               // ← apna path
import {
  StepBanner, AppInput, SectionCard, NavRow, getStepColor,
} from '../../components/FormUI';                                 // ← apna path
import OtpModal from '../../components/OtpModal';                // ← apna path

const STEP = 0;

const KYCScreen = ({ navigation }: any) => {
  const { formData, updateStep, nextStep } = useFormCtx();
  const stepColor = getStepColor(STEP);

  const [otpModal,       setOtpModal]       = useState<{ visible: boolean; type: 'mobile' | 'email' }>({ visible: false, type: 'mobile' });
  const [mobileVerified, setMobileVerified] = useState(false);
  const [emailVerified,  setEmailVerified]  = useState(false);

  const formik = useFormik({
    initialValues: formData.kyc,
    validationSchema: KYCSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: (values) => {
      updateStep('kyc', values);
      nextStep();
      navigation.navigate('BasicInfoScreen'); // ← apna screen name
    },
  });

  const { values, errors, touched, handleSubmit, setFieldValue, setFieldTouched } = formik;

  const f = (name: keyof typeof values) => ({
    value:        values[name],
    error:        errors[name] as string | undefined,
    touched:      !!touched[name],
    onBlur:       () => setFieldTouched(name, true),
    onChangeText: (t: string) => setFieldValue(name, t),
  });

  // OTP verify — real API se replace karo
  const handleOtpVerify = async (otp: string): Promise<boolean> => {
    await new Promise(r => setTimeout(r, 1200));
    if (otp === '123456') {
      otpModal.type === 'mobile' ? setMobileVerified(true) : setEmailVerified(true);
      return true;
    }
    return false;
  };

  const maskedMobile = values.mobile
    ? values.mobile.slice(0, 2) + 'XXXXXX' + values.mobile.slice(-2) : '';
  const maskedEmail = values.email
    ? values.email.split('@')[0].slice(0, 3) + '***@' + values.email.split('@')[1] : '';

  return (
    <View style={s.screen}>
      <StepBanner currentStep={STEP} />

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Aadhaar + PAN */}
        <SectionCard title="Identity Proof" icon="card-account-details-outline" iconColor={stepColor}>
          <AppInput
            label="Aadhaar Number"
            keyboardType="number-pad"
            maxLength={12}
            autoCapitalize="none"
            placeholder="12-digit Aadhaar"
            {...f('aadhaar')}
            onChangeText={t => setFieldValue('aadhaar', t.replace(/\D/g, '').slice(0, 12))}
          />
          <AppInput
            label="PAN Number"
            autoCapitalize="characters"
            maxLength={10}
            placeholder="ABCDE1234F"
            {...f('pan')}
            onChangeText={t => setFieldValue('pan', t.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 10))}
          />
        </SectionCard>

        {/* Mobile + Email */}
        <SectionCard title="Contact Details" icon="cellphone" iconColor={stepColor}>
          <AppInput
            label={`Mobile Number${mobileVerified ? ' ✅' : ''}`}
            keyboardType="number-pad"
            maxLength={10}
            placeholder="10-digit mobile"
            editable={!mobileVerified}
            {...f('mobile')}
            onChangeText={t => {
              setFieldValue('mobile', t.replace(/\D/g, '').slice(0, 10));
              setMobileVerified(false);
            }}
          />
          {values.mobile.length === 10 && !mobileVerified && (
            <View style={s.otpBtnWrap}>
              <NavRow
                isFirstStep
                onNext={() => setOtpModal({ visible: true, type: 'mobile' })}
                nextLabel="Send OTP"
                stepColor={colors.warning}
              />
            </View>
          )}

          <AppInput
            label={`Email Address${emailVerified ? ' ✅' : ''}`}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@example.com"
            editable={!emailVerified}
            {...f('email')}
            onChangeText={t => {
              setFieldValue('email', t.replace(/\s/g, ''));
              setEmailVerified(false);
            }}
          />
          {values.email.includes('@') && !emailVerified && (
            <View style={s.otpBtnWrap}>
              <NavRow
                isFirstStep
                onNext={() => setOtpModal({ visible: true, type: 'email' })}
                nextLabel="Send OTP"
                stepColor={colors.premium_banner}
              />
            </View>
          )}
        </SectionCard>

        <NavRow
          isFirstStep
          onNext={handleSubmit as any}
          nextLabel="Next"
          stepColor={stepColor}
        />
      </ScrollView>

      <OtpModal
        visible={otpModal.visible}
        type={otpModal.type}
        target={otpModal.type === 'mobile' ? maskedMobile : maskedEmail}
        onVerify={handleOtpVerify}
        onClose={() => setOtpModal(p => ({ ...p, visible: false }))}
        onResend={() => console.log('Resend OTP')}
      />
    </View>
  );
};

export default KYCScreen;

const s = StyleSheet.create({
  screen:     { flex: 1, backgroundColor: colors.light_blue },
  scroll:     { padding: 16, paddingBottom: 40 },
  otpBtnWrap: { marginBottom: 12, marginTop: -4 },
});
