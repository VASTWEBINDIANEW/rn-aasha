// screens/ReferenceScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ToastAndroid, Text, TouchableOpacity } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import {
  StepBanner, AppInput, SectionCard, NavRow, getStepColor,
} from '../../components/FormUI';
import { colors } from '../../../../utils/styles/theme';
import { useFormCtx } from './FormContext';
import { APP_URLS } from '../../../../utils/network/urls';
import useAxiosHook from '../../../../utils/network/AxiosClient';
import ShowLoader from '../../../../components/ShowLoder';

const STEP = 4;

const showToast = (msg: string) => {
  ToastAndroid.show(msg, ToastAndroid.SHORT);
};

// ── Validation Schema ─────────────────────────────────────────────────────────
const MOBILE_REGEX = /^[6-9]\d{9}$/;

const ReferenceSchema = Yup.object({
  reference: Yup.object({
    name: Yup.string().required('Reference name required'),
    designation: Yup.string().required('Designation required'),
    mobile: Yup.string()
      .matches(MOBILE_REGEX, 'Enter valid 10-digit mobile')
      .required('Mobile required'),
  }),
  closeRelative: Yup.object({
    name: Yup.string().required('Name required'),
    mobile: Yup.string()
      .matches(MOBILE_REGEX, 'Enter valid 10-digit mobile')
      .required('Mobile required'),
  }),
  emergency: Yup.object({
    name: Yup.string().required('Name required'),
    mobile: Yup.string()
      .matches(MOBILE_REGEX, 'Enter valid 10-digit mobile')
      .required('Mobile required'),
    relationship: Yup.string().required('Relationship required'),
  }),
});

// ── Types ─────────────────────────────────────────────────────────────────────
interface FormValues {
  reference: {
    name: string;
    designation: string;
    mobile: string;
  };
  closeRelative: {
    name: string;
    mobile: string;
  };
  emergency: {
    name: string;
    mobile: string;
    relationship: string;
  };
}

const initialValues: FormValues = {
  reference: {
    name: '',
    designation: '',
    mobile: '',
  },
  closeRelative: {
    name: '',
    mobile: '',
  },
  emergency: {
    name: '',
    mobile: '',
    relationship: '',
  },
};

// ── Component ─────────────────────────────────────────────────────────────────
const ReferenceScreen = ({ onNext }: { onNext: () => void }) => {
  const { formData, updateStep, nextStep } = useFormCtx();
  const stepColor = getStepColor(STEP);
  const { get, post } = useAxiosHook();
  const [otpSent, setOtpSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [loading, setLoading] = useState(false);

  // const handleSendOTP3 = async (mobile) => {
  //   if (mobile?.length !== 10) return showToast("Enter valid mobile");

  //   setLoading(true);
  //   try {
  //     console.log(`${APP_URLS.SendOTPMobile}?Mobile=${mobile}&Type=Reference`)
  //     const res = await get({
  //       url: `${APP_URLS.SendOTPMobile}?Mobile=${mobile}&Type=Reference`, 
  //     });
  // console.log(res)

  //     if (res?.StatusCode === 200) {
  //       setOtpSent(true);
  //       showToast("OTP Sent Successfully");
  //     }
  //   } catch (err) {
  //     showToast("Failed to send OTP");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // const handleSendOTP1 = async (mobile) => {
  //   if (mobile?.length !== 10) return showToast("Enter valid mobile");

  //   setLoading(true);
  //   try {
  //     console.log(`${APP_URLS.SendOTPMobile}?Mobile=${mobile}&Type=Reference`)
  //     const res = await get({
  //       url: `${APP_URLS.SendOTPMobile}?Mobile=${mobile}&Type=Reference`, 
  //     });
  // console.log(res)

  //     if (res?.StatusCode === 200) {
  //       setOtpSent(true);
  //       showToast("OTP Sent Successfully");
  //     }
  //   } catch (err) {
  //     showToast("Failed to send OTP");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // const handleSendOTP2 = async (mobile) => {
  //   if (mobile?.length !== 10) return showToast("Enter valid mobile");

  //   setLoading(true);
  //   try {
  //     console.log(`${APP_URLS.SendOTPMobile}?Mobile=${mobile}&Type=Reference`)
  //     const res = await get({
  //       url: `${APP_URLS.SendOTPMobile}?Mobile=${mobile}&Type=Reference`, 
  //     });
  // console.log(res)

  //     if (res?.StatusCode === 200) {
  //       setOtpSent(true);
  //       showToast("OTP Sent Successfully");
  //     }
  //   } catch (err) {
  //     showToast("Failed to send OTP");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleVerifyOTP1 = async (mobile) => {
  //   if (mobile?.length !== 10) return showToast("Enter valid mobile");

  //   setLoading(true);
  //   try {
  //     console.log(`${APP_URLS.VerifyOTtPMobile}?Mobile=${mobile}&Type=Reference&OTP=${otpValue}`)
  //     const res = await get({
  //       url: `${APP_URLS.VerifyOTtPMobile}?Mobile=${mobile}&Type=Reference&OTP=${otpValue}`, 
  //     });
  // console.log(res)

  //     if (res?.StatusCode === 200) {
  //       setOtpSent(true);
  //       showToast("OTP Sent Successfully");
  //     }
  //   } catch (err) {
  //     showToast("Failed to send OTP");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // const handleVerifyOTP2 = async (mobile) => {
  //   if (mobile?.length !== 10) return showToast("Enter valid mobile");

  //   setLoading(true);
  //   try {
  //     console.log(`${APP_URLS.VerifyOTtPMobile}?Mobile=${mobile}&Type=Reference&OTP=${otpValue}`)
  //     const res = await get({
  //       url: `${APP_URLS.VerifyOTtPMobile}?Mobile=${mobile}&Type=Reference&OTP=${otpValue}`, 
  //     });
  // console.log(res)

  //     if (res?.StatusCode === 200) {
  //       setOtpSent(true);
  //       showToast("OTP Sent Successfully");
  //     }
  //   } catch (err) {
  //     showToast("Failed to send OTP");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  // const handleVerifyOTP3 = async (mobile) => {
  //   if (mobile?.length !== 10) return showToast("Enter valid mobile");

  //   setLoading(true);
  //   try {
  //     console.log(`${APP_URLS.VerifyOTtPMobile}?Mobile=${mobile}&Type=Reference&OTP=${otpValue}`)
  //     const res = await get({
  //       url: `${APP_URLS.VerifyOTtPMobile}?Mobile=${mobile}&Type=Reference&OTP=${otpValue}`, 
  //     });
  // console.log(res)

  //     if (res?.StatusCode === 200) {
  //       setOtpSent(true);
  //       showToast("OTP Sent Successfully");
  //     }
  //   } catch (err) {
  //     showToast("Failed to send OTP");
  //   } finally {
  //     setLoading(false);
  //   }
  // };



  // 1. Send OTP Logic

  const [vState, setVState] = useState({
    ref: { loading: false, sent: false, verified: false, otp: '' },
    rel: { loading: false, sent: false, verified: false, otp: '' },
    emg: { loading: false, sent: false, verified: false, otp: '' },
  });
  const updateVState = (key, data) => {
    setVState(prev => ({ ...prev, [key]: { ...prev[key], ...data } }));
  };

  // Duplicate Mobile Check Function
  const isDuplicateMobile = (mobile, currentKey) => {
    if (!mobile || mobile.length < 10) return false;

    // Formik values se baaki teeno numbers lein
    const allNumbers = {
      ref: values.reference.mobile,
      rel: values.closeRelative.mobile,
      emg: values.emergency.mobile,
    };

    // Check karein ki kya ye number kisi aur key mein pehle se hai
    return Object.keys(allNumbers).some(key =>
      key !== currentKey && allNumbers[key] === mobile
    );
  };



  const handleSendOTP = async (mobile, sectionKey, apiType) => {
    if (mobile?.length !== 10) return showToast("Enter 10-digit mobile");

    // DUPLICATE CHECK: Agar number kahin aur use hua hai toh yahi rok do
    if (isDuplicateMobile(mobile, sectionKey)) {
      showToast(`This number is already used in another contact!`);
      return;
    }

    updateVState(sectionKey, { loading: true });

    try {
      const res = await post({
        url: `${APP_URLS.SendOTPMobile}Mobile=${mobile}&Type=${apiType}`,
      });
      console.log(`${APP_URLS.SendOTPMobile}Mobile=${mobile}&Type=${apiType}`)
      console.log(`${apiType} Send OTP RESPONSE:`, res);
      if (res?.StatusCode === 200) {
        updateVState(sectionKey, { sent: true });
        showToast(`${apiType} OTP Sent Successfully`);
      } else {
        showToast(res?.Message || "Failed to send OTP");
      }
    } catch (err) {
      showToast("Network Error: Failed to send OTP");
    } finally {
      updateVState(sectionKey, { loading: false });
    }
  };

  // 2. Verify OTP Logic
  const handleVerifyOTP = async (mobile, sectionKey, apiType) => {

    console.log(`Verifying OTP for ${apiType}: Mobile=${mobile}, OTP=${vState[sectionKey].otp}`)
    const currentOtp = vState[sectionKey].otp;
    if (!currentOtp || currentOtp.length < 4) return showToast("Enter valid OTP");

    updateVState(sectionKey, { loading: true });

    try {
      const res = await post({
        url: `${APP_URLS.VerifyOTtPMobile}?Mobile=${mobile}&Type=${apiType}&OTP=${currentOtp}`,
      });

      console.log(`${APP_URLS.VerifyOTtPMobile}?Mobile=${mobile}&Type=${apiType}&OTP=${currentOtp}`)
      console.log(`${apiType} Verify OTP RESPONSE:`, res);
      if (res?.StatusCode === 200 && res?.Content?.ADDINFO === "DONE") {
        updateVState(sectionKey, { verified: true, sent: false });
        showToast(`${apiType} Verified!`);
      } else {
        showToast("Invalid OTP, please try again");
      }
    } catch (err) {
      showToast("Verification failed");
    } finally {
      updateVState(sectionKey, { loading: false });
    }
  };



  const formik = useFormik<FormValues>({
    initialValues,
    validationSchema: ReferenceSchema,
    validateOnBlur: true,
    validateOnChange: false,

    onSubmit: async (values) => {

      if (!vState.ref.verified || !vState.rel.verified || !vState.emg.verified) {
        showToast("Please verify all mobile numbers with OTP first!");
        return; // Agar ek bhi verify nahi hai toh API hit nahi hogi
      }


      const payload = {
        ReferenceName: values.reference.name,
        ReferenceDesignation: values.reference.designation,
        ReferenceMobile: values.reference.mobile,

        CloseRelativeName: values.closeRelative.name,
        CloseRelativeMobile: values.closeRelative.mobile,

        EMERGENCYName: values.emergency.name,
        EMERGENCYMobilenumber: values.emergency.mobile,
        EMERGENCYRelationship: values.emergency.relationship,
      };

      console.log('📤 REQUEST URL:', APP_URLS.RadiantCandiantForm4);
      console.log('📤 REQUEST BODY:', JSON.stringify(payload, null, 2));

      try {
        const res = await post({
          url: APP_URLS.InsertForm4Update,
          data: payload
        });

        console.log('📥 RESPONSE:', JSON.stringify(res, null, 2));

        // ✅ FIXED
        if (res?.StatusCode === 200 && res?.Content?.Status === true) {
          showToast('Reference saved!');
          updateStep('reference', values);
          onNext(4); // ya nextStep()
        } else {
          showToast(res?.Content?.Message || 'Submit failed');
        }

      } catch (err) {
        console.log('❌ ERROR:', err);
        showToast('Something went wrong');
      }
    },
  });

  const { values, errors, touched, handleSubmit, setFieldValue, setFieldTouched } = formik;

  useEffect(() => {
              setLoading(true);

    const fetchForm4Data = async () => {
      try {
        const res = await post({ url: APP_URLS.ShowForm4 });

        console.log('📥 Form4 Data:', JSON.stringify(res, null, 2));


        if (res?.StatusCode === 200) {
                    setLoading(false);

          const c = res.Content;

          // 1. Formik Values Set Karein (Sirf Data)
          setFieldValue('reference.name', c.ReferenceName ?? '');
          setFieldValue('reference.designation', c.ReferenceDesignation ?? '');
          setFieldValue('reference.mobile', c.ReferenceMobile ?? '');

          setFieldValue('closeRelative.name', c.CloseRelativeName ?? '');
          setFieldValue('closeRelative.mobile', c.CloseRelativeMobile ?? '');

          setFieldValue('emergency.name', c.EMERGENCYName ?? '');
          setFieldValue('emergency.mobile', c.EMERGENCYMobilenumber ?? '');
          setFieldValue('emergency.relationship', c.EMERGENCYRelationship ?? '');

          // 2. Verification State Update Karein (VState)
          // API se status true/false aa raha hai, use verified key mein daalein
          setVState({
            ref: { loading: false, sent: false, verified: Boolean(c.ReferenceMobileStaus), otp: '' },
            rel: { loading: false, sent: false, verified: Boolean(c.CloseRelativeMobileStatus), otp: '' },
            emg: { loading: false, sent: false, verified: Boolean(c.EMERGENCYMobilenumberStatus), otp: '' },
          });
        }
      } catch (err) {
        console.log('❌ Form4Data ERROR:', err);
      }
    };

    fetchForm4Data();
  }, []);

  // ── Field helper ────────────────────────────────────────────────────────────
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

  return (
    <View style={s.screen}>
      {/* <StepBanner currentStep={STEP} /> */}

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
              {loading&&<ShowLoader/>}

        <SectionCard title="Reference" icon="account-tie" iconColor={stepColor}>
          <AppInput
            label="Reference Name"
            placeholder="Enter name"
            {...fp('reference.name')}
          />
          <AppInput
            label="Designation"
            placeholder="Enter designation"
            {...fp('reference.designation')}
          />
          <AppInput
            label="Mobile Number"
            keyboardType="phone-pad"
            maxLength={10}
            {...fp('reference.mobile')}
            editable={!vState.ref.verified}
            renderRight={() => (
              <TouchableOpacity
                onPress={() => handleSendOTP(values.reference.mobile, 'ref', 'Reference')}
                disabled={vState.ref.loading || vState.ref.verified}
              >
                <Text style={{ color: vState.ref.verified ? 'green' : 'blue', fontWeight: 'bold', padding: 5 }}>
                  {vState.ref.loading ? '...' : vState.ref.verified ? 'Verified' : 'Send OTP'}
                </Text>
              </TouchableOpacity>
            )}
          />
          {vState.ref.sent && !vState.ref.verified && (
            <AppInput
              label="Enter OTP"
              placeholder="OTP"
              keyboardType="numeric"
              value={vState.ref.otp}
              onChangeText={(t) => updateVState('ref', { otp: t })}
              renderRight={() => (
                <TouchableOpacity onPress={() => handleVerifyOTP(values.reference.mobile, 'ref', 'Reference')}>
                  <Text style={{ color: 'blue', fontWeight: 'bold', padding: 5 }}>Verify</Text>
                </TouchableOpacity>
              )}
            />
          )}
        </SectionCard>

        {/* Close Relative */}
        <SectionCard title="Close Relative" icon="account-heart" iconColor={stepColor}>
          <AppInput
            label="Name"
            placeholder="Enter name"
            {...fp('closeRelative.name')}
          />
          <AppInput
            label="Mobile Number"
            keyboardType="phone-pad"
            maxLength={10}
            {...fp('closeRelative.mobile')} // Path changed
            editable={!vState.rel.verified}
            renderRight={() => (
              <TouchableOpacity
                onPress={() => handleSendOTP(values.closeRelative.mobile, 'rel', 'Relative')} // Key & Type changed
                disabled={vState.rel.loading || vState.rel.verified}
              >
                <Text style={{ color: vState.rel.verified ? 'green' : 'blue', fontWeight: 'bold', padding: 5 }}>
                  {vState.rel.loading ? '...' : vState.rel.verified ? 'Verified' : 'Send OTP'}
                </Text>
              </TouchableOpacity>
            )}
          />
          {vState.rel.sent && !vState.rel.verified && (
            <AppInput
              label="Enter OTP"
              placeholder="OTP"
              keyboardType="numeric"
              value={vState.rel.otp}
              onChangeText={(t) => updateVState('rel', { otp: t })}
              renderRight={() => (
                <TouchableOpacity onPress={() => handleVerifyOTP(values.closeRelative.mobile, 'rel', 'Relative')}>
                  <Text style={{ color: 'blue', fontWeight: 'bold', padding: 5 }}>Verify</Text>
                </TouchableOpacity>
              )}
            />
          )}

          {/* Same OTP block as above but use 'rel' instead of 'ref' */}
        </SectionCard>

        {/* Emergency Contact */}
        <SectionCard title="Emergency Contact" icon="phone-alert" iconColor={stepColor}>
          <AppInput
            label="Name"
            placeholder="Enter name"
            {...fp('emergency.name')}
          />
          <AppInput
            label="Relationship"
            placeholder="Enter relationship"
            {...fp('emergency.relationship')}
          />
          <AppInput
            label="Mobile Number"
            keyboardType="phone-pad"
            maxLength={10}
            {...fp('emergency.mobile')} // Path changed
            editable={!vState.emg.verified}
            renderRight={() => (
              <TouchableOpacity
                onPress={() => handleSendOTP(values.emergency.mobile, 'emg', 'Emergency')} // Key & Type changed
                disabled={vState.emg.loading || vState.emg.verified}
              >
                <Text style={{ color: vState.emg.verified ? 'green' : 'blue', fontWeight: 'bold', padding: 5 }}>
                  {vState.emg.loading ? '...' : vState.emg.verified ? 'Verified' : 'Send OTP'}
                </Text>
              </TouchableOpacity>
            )}
          />
          {vState.emg.sent && !vState.emg.verified && (
            <AppInput
              label="Enter OTP"
              placeholder="OTP"
              keyboardType="numeric"
              value={vState.emg.otp}
              onChangeText={(t) => updateVState('emg', { otp: t })}
              renderRight={() => (
                <TouchableOpacity onPress={() => handleVerifyOTP(values.emergency.mobile, 'emg', 'Emergency')}>
                  <Text style={{ color: 'blue', fontWeight: 'bold', padding: 5 }}>Verify</Text>
                </TouchableOpacity>
              )}
            />
          )}
          {/* Same OTP block as above but use 'emg' instead of 'ref' */}
        </SectionCard>

        <NavRow
          onNext={() => {
            formik.validateForm().then(err => {
              console.log('❌ Errors:', err);
              if (Object.keys(err).length === 0) {
                handleSubmit();
              } else {
                const firstError = Object.values(err)[0];
                showToast(
                  typeof firstError === 'object'
                    ? (Object.values(firstError as object)[0] as string)
                    : (firstError as string),
                );
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