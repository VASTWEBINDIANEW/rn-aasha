// screens/DrivingLicenseScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
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
import { DrivingLicenseSchema } from '../../../../utils/validationSchemas';
import ShowLoader from '../../../../components/ShowLoder';

const STEP = 3;

const DrivingLicenseScreen = ({ onNext }: { onNext: () => void }) => {
  const { post } = useAxiosHook();
  const { formData, updateStep, nextStep, prevStep } = useFormCtx();
  const stepColor = getStepColor(STEP);

  const formik = useFormik({
    initialValues: {
      isDrivingLicense: false,
      drivingLicenseNumber: '',
      isTwoWheeler: '',
      twoWheelerNumber: '',
      vehicleNumber: '',
      languageKnown: '',
    },
   
    validationSchema: DrivingLicenseSchema,
    validateOnBlur: true,
    validateOnChange: false,

    onSubmit: async (values) => {

      console.log('🔥 DrivingLicenseScreen onSubmit CALLED');
      try {
        const payload = {
          IsDrivingLicense: values.isDrivingLicense,
          DrivingLicenseNumber: values.isDrivingLicense
            ? values.drivingLicenseNumber
            : '',

          IstwoWheeler: values.isTwoWheeler,
          TwoWheelerNumber: values.isTwoWheeler === 'Yes'
            ? values.twoWheelerNumber
            : '', VehicleNumber: values.isTwoWheeler === 'Yes' ? values.twoWheelerNumber : '',
          LanguageKnown: values.languageKnown,

        };

        console.log('📤 InsertForm5 URL    :', APP_URLS.InsertForm5Update);
        console.log('📦 InsertForm5 REQUEST:', JSON.stringify(payload, null, 2));

        const res = await post({
          url: APP_URLS.InsertForm5Update,
          data: payload,
        });

        console.log('📥 InsertForm5 RESPONSE:', JSON.stringify(res, null, 2));

        if (res?.StatusCode === 200) {
          toast("Details saved!");
          updateStep('drivingLicense', values);
          nextStep();
          onNext(5);
        } else {
          toast(res?.message || "Submit failed. Try again.");
        }
      } catch (err) {
        console.log('❌ InsertForm5 ERROR:', err);
        toast("Something went wrong. Try again.");
      }
    },
  });

  const { values, errors, touched, handleSubmit, setFieldValue, setFieldTouched } = formik;

  const [loading,setLoading] = useState(true);
  useEffect(() => {
    const fetchForm5Data = async () => {
      try {
        const response = await post({ url: APP_URLS.ShowForm5 });
        const res = response?.data || response;

        console.log('✅ ShowForm5 RESPONSE:', JSON.stringify(res, null, 2));

        if (res?.StatusCode === 200) {
                    setLoading(false);

          const c = res?.Content;

formik.setValues({
  isDrivingLicense: c?.IsDrivingLicense ?? false,
  drivingLicenseNumber: c?.IsDrivingLicense
    ? c?.DrivingLicenseNumber ?? ''
    : '',

 isTwoWheeler: c?.IstwoWheeler || '', // API key 'IstwoWheeler' ko match kiya

twoWheelerNumber: c?.IstwoWheeler === 'Yes' 
  ? (c?.TwoWheelerNumber || c?.VehicleNumber || '') // Agar TwoWheelerNumber khali hai toh VehicleNumber le lo
  : '',

  vehicleNumber: c?.VehicleNumber ?? '',
  languageKnown: c?.LanguageKnown ?? '',
}, false);
          // formik.setValues({
          //   isDrivingLicense: c?.IsDrivingLicense ?? false,
          //   drivingLicenseNumber: c?.DrivingLicenseNumber ?? '',
          //   isTwoWheeler: c?.IstwoWheeler ?? '',
          //   twoWheelerNumber: c?.TwoWheelerNumber ?? '',
          //   vehicleNumber: c?.VehicleNumber ?? '',
          //   languageKnown: c?.LanguageKnown ?? '',

          // }, false); // false = validation trigger mat karo prefill pe
        }
      } catch (err) {
        console.log('❌ ShowForm5 ERROR:', err);
      }
    };

    fetchForm5Data();
  }, []);

  const f = (name: keyof typeof values) => ({
    value: String(values[name]),
    error: errors[name] as string | undefined,
    touched: !!touched[name],
    onBlur: () => setFieldTouched(name, true),
    onChangeText: (t: string) => setFieldValue(name, t),
  });

  return (
    <View style={s.screen}>

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
                      {loading&&<ShowLoader/>}

        <SectionCard
          title="Driving License Details"
          icon="card-account-details-outline"
          iconColor={stepColor}
        >
          <Text style={s.fieldLabel}>Do you have a Driving License?</Text>
          <View style={s.toggleRow}>
            {['Yes', 'No'].map(opt => {
              const isSelected = opt === 'Yes'
                ? values.isDrivingLicense === true
                : values.isDrivingLicense === false;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[s.toggleBtn, isSelected && { backgroundColor: stepColor, borderColor: stepColor, marginLeft: wScale(10) }]}
                  //                  onPress={() => {
                  //   const isYes = opt === 'Yes';
                  //   setFieldValue('isDrivingLicense', isYes);

                  //   if (!isYes) {
                  //     setFieldValue('drivingLicenseNumber', '');
                  //     setFieldTouched('drivingLicenseNumber', false);
                  //   }
                  // }}

                  onPress={() => {
                    const isYes = opt === 'Yes';

                    setFieldValue('isDrivingLicense', isYes);

                    if (!isYes) {
                      // 🔥 full reset
                      setFieldValue('drivingLicenseNumber', '');
                      setFieldTouched('drivingLicenseNumber', false);
                      formik.setFieldError('drivingLicenseNumber', undefined);

                      // optional but safest
                      // setTimeout(() => {
                      //   setFieldValue('drivingLicenseNumber', '');
                      // }, 0);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={isSelected ? 'check-circle' : 'circle-outline'}
                    size={16}
                    color={isSelected ? '#fff' : '#9CA3AF'}
                  />
                  <Text style={[s.toggleText, isSelected && { color: '#fff' }]}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── License Number — sirf Yes pe ── */}
          {values.isDrivingLicense && (
            <AppInput
              label="Driving License Number"
              placeholder="Enter license number"
              autoCapitalize="characters"
              {...f('drivingLicenseNumber')}
            />
          )}

          {/* ── Two Wheeler Toggle ── */}
          <Text style={[s.fieldLabel, { marginTop: hScale(12) }]}>Do you have a Two Wheeler?</Text>
          <View style={s.toggleRow}>
            {['Yes', 'No'].map(opt => {
              const isSelected = values.isTwoWheeler === opt;
              return (
                <TouchableOpacity
                  key={opt}
                  style={[s.toggleBtn, isSelected && { backgroundColor: stepColor, borderColor: stepColor, marginRight: wScale(10) }]}
                  onPress={() => {
                    setFieldValue('isTwoWheeler', opt);
                 if (opt === 'No') {
  setFieldValue('twoWheelerNumber', '');
  setFieldTouched('twoWheelerNumber', false);
  formik.setFieldError('twoWheelerNumber', undefined);
}
                  }}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={isSelected ? 'check-circle' : 'circle-outline'}
                    size={16}
                    color={isSelected ? '#fff' : '#9CA3AF'}
                  />
                  <Text style={[s.toggleText, isSelected && { color: '#fff' }]}>{opt}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── Two Wheeler Number — sirf Yes pe ── */}
          {values.isTwoWheeler === 'Yes' && (
            <AppInput
              label="Two Wheeler Number"
              placeholder="Enter vehicle number"
              autoCapitalize="characters"
              {...f('twoWheelerNumber')}
            />
          )}

          {/* ── Vehicle Number ── */}
         {/* {values.isTwoWheeler === 'Yes'  || values.isDrivingLicense  &&  <AppInput
            label="Vehicle Number"
            placeholder="Enter vehicle number (e.g. MH30BS6421)"
            autoCapitalize="characters"
            {...f('vehicleNumber')}
          />} */}

          {/* ── Languages Known ── */}
          <AppInput
            label="Languages Known"
            placeholder="e.g. Hindi, English, Marathi"
            {...f('languageKnown')}
          />
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

export default DrivingLicenseScreen;

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light_blue },
  scroll: { padding: 16, paddingBottom: 40 },
  fieldLabel: { fontSize: wScale(13), color: '#374151', fontWeight: '500', marginBottom: hScale(8) },
  toggleRow: { flexDirection: 'row', gap: wScale(10), marginBottom: hScale(4) },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: wScale(6), paddingHorizontal: wScale(16), paddingVertical: hScale(10), borderRadius: wScale(8), borderWidth: 1.5, borderColor: '#D1D5DB', backgroundColor: '#F9FAFB' },
  toggleText: { fontSize: wScale(13), color: '#6B7280', fontWeight: '500' },
});