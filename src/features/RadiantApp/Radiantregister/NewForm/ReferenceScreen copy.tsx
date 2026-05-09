// screens/ReferenceScreen.tsx
import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ToastAndroid } from 'react-native';
import { useFormik } from 'formik';

import {
  StepBanner, AppInput, SectionCard, NavRow, getStepColor, AppToggle,
} from '../../components/FormUI';
import { colors } from '../../../../utils/styles/theme';
import { ReferenceSchema } from '../../../../utils/validationSchemas';
import { useFormCtx } from './FormContext';
import { APP_URLS } from '../../../../utils/network/urls';
import useAxiosHook from '../../../../utils/network/AxiosClient';
import { MobileCard } from './AadhaarPanVerification/cards';
import { initMobile, MOBILE_REGEX, toast } from './AadhaarPanVerification/types';
import ShowLoader from '../../../../components/ShowLoder';

const STEP = 4;

const showToast = (msg: string) => {
  ToastAndroid.show(msg, ToastAndroid.SHORT);
};

const ReferenceScreen = ({ navigation }: any) => {
  const { formData, updateStep, nextStep, prevStep } = useFormCtx();
  const stepColor = getStepColor(STEP);
  const { post } = useAxiosHook();
  // const [neighbourMobile, setNeighbourMobile] = useState(initMobile());
  const [neighbourMobile, setNeighbourMobile] = useState({
    ...initMobile(),
    otpSent: false, // ✅ add this
  });
  const [relativeMobile, setRelativeMobile] = useState(initMobile());
  const [emergencyMobile, setEmergencyMobile] = useState(initMobile());
  const formik = useFormik({
    initialValues: formData.reference,
    validationSchema: ReferenceSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values) => {
      const payload = {
        twowheeler: values.operational.hasTwoWheeler ? "Yes" : "No",
        twowheelerNUmber: values.operational.twoWheelerNumber,

        NeighbourName: values.neighbour.name,
        NeighbourMobile: neighbourMobile.value,
        // VerifyNeighbourMobile: neighbourMobile.verified ? true : false,
VerifyNeighbourMobile: true,
        closename: values.relativeRef.name,
        closemobile: relativeMobile.value,
        // Verifyclosemobile: relativeMobile.verified ? true : false,
Verifyclosemobile: true,
        closeaddress: values.relativeRef.relationship,
        closepincode: values.relativeRef.pincode,

        EmergencyName: values.emergencyContact.name,
        EmergencyRelationship: values.emergencyContact.relationship,
        EmergencyMobilenumber: emergencyMobile.value,
        // VerifyEmergencyMobilenumber: emergencyMobile.verified ? true : false,
        VerifyEmergencyMobilenumber: true,
      };

      console.log('📤 REQUEST URL:', APP_URLS.RadiantCandiantForm4);
      console.log('📤 REQUEST BODY:', JSON.stringify(payload, null, 2));

      try {
        const res = await post({ url: APP_URLS.RadiantCandiantForm4, data: payload });
        console.log('📥 RESPONSE:', JSON.stringify(res, null, 2));

        if (res?.status === "Data Insert Successfully") {
          showToast('Reference saved!');
          updateStep('reference', values);
          nextStep();
          navigation.navigate('ReviewScreen');
        } else {
          showToast('Submit failed');
        }
      } catch (err) {
        console.log('❌ ERROR:', err);
        showToast('Something went wrong');
      }
    },
  });

  const { values, errors, touched, handleSubmit, setFieldValue, setFieldTouched } = formik;

  const [loading,setLoading] = useState(true);
  useEffect(() => {
    const fetchForm4Data = async () => {
      try {
        const res = await post({ url: APP_URLS.RadiantForm4Data });
        console.log('✅ Form4Data RESPONSE:', JSON.stringify(res, null, 2));

        if (res?.datastatus === true) {
                    setLoading(false);

          const d = res;

          setFieldValue('operational.hasTwoWheeler', d.iswheeler ?? false);
          setFieldValue('operational.twoWheelerNumber', d.twowheelerNUmber ?? '');

          setFieldValue('neighbour.name', d.NeighbourName ?? '');
          setFieldValue('neighbour.mobile', d.NeighbourMobile ?? '');
          setNeighbourMobile(p => ({ ...p, value: d.NeighbourMobile ?? '' }));
          setFieldValue('relativeRef.mobile', d.closemobile ?? '');
          setRelativeMobile(p => ({
            ...p,
            value: d.closemobile ?? '',
          }));

          // emergency
          setFieldValue('emergencyContact.mobile', d.EmergencyMobilenumber ?? '');
          setEmergencyMobile(p => ({
            ...p,
            value: d.EmergencyMobilenumber ?? '',
          }));
          setFieldValue('relativeRef.name', d.closename ?? '');
          setFieldValue('relativeRef.mobile', d.closemobile ?? '');
          setFieldValue('relativeRef.relationship', d.closeaddress ?? '');
          setFieldValue('relativeRef.pincode', d.closepincode ?? '');

          setFieldValue('emergencyContact.name', d.EmergencyName ?? '');
          setFieldValue('emergencyContact.relationship', d.EmergencyRelationship ?? '');
          setFieldValue('emergencyContact.mobile', d.EmergencyMobilenumber ?? '');
        }
      } catch (err) {
        console.log('❌ Form4Data ERROR:', err);
      }
    };

    fetchForm4Data();
  }, []);

  // Helper for inputs
  const fp = (path: string) => {
    const keys = path.split('.');
    const val = keys.reduce((o: any, k) => o?.[k], values);
    const err = keys.reduce((o: any, k) => o?.[k], errors) as string | undefined;
    const tch = !!(keys.reduce((o: any, k) => o?.[k], touched));
    return {
      value: val ?? '',
      error: err,
      touched: tch,
      onBlur: () => setFieldTouched(path, true),
      onChangeText: (t: string) => setFieldValue(path, t),
    };
  };

  const isMobileValid = MOBILE_REGEX.test(neighbourMobile.value);


  const sendOtp = async (
    type: 'Neighbor' | 'CloseRelative' | 'Emergency'
  ) => {
    const isNeighbor = type === 'Neighbor';
    const isRelative = type === 'CloseRelative';

    const mobileState = isNeighbor
      ? neighbourMobile
      : isRelative
        ? relativeMobile
        : emergencyMobile;

    const setState = isNeighbor
      ? setNeighbourMobile
      : isRelative
        ? setRelativeMobile
        : setEmergencyMobile;

    const mobile = mobileState.value;

    const refName = isNeighbor
      ? values.neighbour.name
      : isRelative
        ? values.relativeRef.name
        : values.emergencyContact.name;

    const orgName = 'YourCompanyName';

    // ✅ loading start
    setState(p => ({ ...p, loading: true }));

    try {
      const url = `${APP_URLS.SendOTPMobileOther}Mobile=${mobile}&Name=${orgName}&refName=${refName}&Relation=${type}&Type=${type}`;

      console.log('📡 OTP URL:', url);

      const res = await post({ url });

      console.log('📥 OTP RESPONSE:', res);

      if (res?.Content?.ADDINFO === 'Send OTP') {
        showToast(`OTP sent to ${type}`);

        // ✅ FIXED (for all 3 types)
        setState(p => ({
          ...p,
          loading: false,
          otpSent: true,
          otpValue: '',
          verified: false, // reset if resend
        }));
      } else {
        showToast(`OTP failed: ${res?.Content?.ADDINFO}`);
        setState(p => ({ ...p, loading: false }));
      }
    } catch (err) {
      console.log('❌ OTP ERROR:', err);
      showToast('Error sending OTP');
      setState(p => ({ ...p, loading: false }));
    }
  };
  const verifyOtp = async (
    type: 'Neighbor' | 'CloseRelative' | 'Emergency'
  ) => {
    const isNeighbor = type === 'Neighbor';
    const isRelative = type === 'CloseRelative';

    const mobileState = isNeighbor
      ? neighbourMobile
      : isRelative
        ? relativeMobile
        : emergencyMobile;

    const setState = isNeighbor
      ? setNeighbourMobile
      : isRelative
        ? setRelativeMobile
        : setEmergencyMobile;

    const mobile = mobileState.value;
    const otp = mobileState.otpValue;

    const refName = isNeighbor
      ? values.neighbour.name
      : isRelative
        ? values.relativeRef.name
        : values.emergencyContact.name;

    const relation = type;

    const orgName = 'YourCompanyName'; // ⚠️ replace with actual

    if (!otp || otp.length < 4) {
      showToast('Enter valid OTP');
      return;
    }

    setState(p => ({ ...p, loading: true }));

    try {
      const url = `${APP_URLS.VerifyOTPMobileOther}Mobile=${mobile}&Name=${orgName}&Type=${type}&OTP=${otp}&refName=${refName}&Relation=${relation}`;

      console.log('📡 VERIFY URL:', url);

      const res = await post({ url });

      console.log('📥 VERIFY RESPONSE:', res);

      if (res?.Content?.ADDINFO === 'DONE') {
        showToast(`${type} verified`);

        setState(p => ({
          ...p,
          loading: false,
          verified: true,
          otpSent: false,
        }));
      } else {
        showToast(`Invalid OTP: ${res?.Content?.ADDINFO}`);
        setState(p => ({ ...p, loading: false }));
      }
    } catch (err) {
      console.log('❌ VERIFY ERROR:', err);
      showToast('Verification failed');
      setState(p => ({ ...p, loading: false }));
    }
  };


  return (
    <View style={s.screen}>
      <StepBanner currentStep={STEP} />

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
              {loading&&<ShowLoader/>}

        {/* Neighbour */}
        <SectionCard title="Neighbour Reference" icon="account-group" iconColor={stepColor}>
          <AppInput label="Neighbour Name" placeholder="Enter name" {...fp('neighbour.name')} />
          <MobileCard
            mobile={neighbourMobile}
            isValid={MOBILE_REGEX.test(neighbourMobile.value)}
            onChange={(t) => setNeighbourMobile(p => ({ ...p, value: t }))}
            onSendOtp={() => sendOtp('Neighbor')}
            onOtpChange={(t) => setNeighbourMobile(p => ({ ...p, otpValue: t }))}
            onVerifyOtp={() => verifyOtp('Neighbor')}
            onReset={() => setNeighbourMobile(initMobile())}
          />


        </SectionCard>


        {/* Close Relative */}
        <SectionCard title="Close Relative" icon="account-heart" iconColor={stepColor}>
          <AppInput label="Name" placeholder="Enter name" {...fp('relativeRef.name')} />
          <AppInput label="Relationship / Address" placeholder="Enter relationship/address" {...fp('relativeRef.relationship')} />
          <AppInput label="Pincode" placeholder="Enter pincode" {...fp('relativeRef.pincode')} />
          <MobileCard
            mobile={relativeMobile}
            isValid={MOBILE_REGEX.test(relativeMobile.value)}
            onChange={(t) => setRelativeMobile(p => ({ ...p, value: t }))}
            onSendOtp={() => sendOtp('CloseRelative')}
            onOtpChange={(t) => setRelativeMobile(p => ({ ...p, otpValue: t }))}
            onVerifyOtp={() => verifyOtp('CloseRelative')}
            onReset={() => setRelativeMobile(initMobile())}
          />
        </SectionCard>

        {/* Emergency Contact */}
        <SectionCard title="Emergency Contact" icon="phone-alert" iconColor={stepColor}>
          <AppInput label="Name" placeholder="Enter name" {...fp('emergencyContact.name')} />
          <AppInput label="Relationship" placeholder="Enter relationship" {...fp('emergencyContact.relationship')} />
          <MobileCard
            mobile={emergencyMobile}
            isValid={MOBILE_REGEX.test(emergencyMobile.value)}
            onChange={(t) => setEmergencyMobile(p => ({ ...p, value: t }))}
            onSendOtp={() => sendOtp('Emergency')}
            onOtpChange={(t) => setEmergencyMobile(p => ({ ...p, otpValue: t }))}
            onVerifyOtp={() => verifyOtp('Emergency')}
            onReset={() => setEmergencyMobile(initMobile())}
          />
        </SectionCard>


        {/* Operational Details */}
        <SectionCard title="Operational Details" icon="cog-outline" iconColor={stepColor}>
          <AppToggle
            label="Have Two-Wheeler?"
            value={values.operational.hasTwoWheeler}
            onChange={(v: boolean) => {
              setFieldValue('operational.hasTwoWheeler', v);
              if (!v) setFieldValue('operational.twoWheelerNumber', '');
            }}
          />
          {values.operational.hasTwoWheeler && (
            <AppInput
              label="Two-Wheeler Number"
              placeholder="e.g. MH12AB1234"
              {...fp('operational.twoWheelerNumber')}
            />
          )}
        </SectionCard>

        
        
        <NavRow
          onNext={() => {
            console.log('🔘 Next clicked');
            formik.validateForm().then(err => {
              console.log('❌ Errors:', err);
              if (Object.keys(err).length === 0) {
                handleSubmit();
              } else {
                const firstError = Object.values(err)[0];
                toast(firstError as string);
              }
            });
          }}
          stepColor={stepColor}
        />

      </ScrollView>
    </View>
  );
};

export default ReferenceScreen;

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light_blue },
  scroll: { padding: 16, paddingBottom: 40 },
});

