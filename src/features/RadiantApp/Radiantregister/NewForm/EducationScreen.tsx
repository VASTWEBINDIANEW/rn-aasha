// screens/EducationScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, ToastAndroid, Button } from 'react-native';
import { useFormik } from 'formik';

import { colors } from '../../../../utils/styles/theme';
import { useFormCtx } from './FormContext';
import { EducationSchema } from '../../../../utils/validationSchemas';

import {
  StepBanner,
  AppInput,
  SelectPicker,
  SectionCard,
  NavRow,
  getStepColor,
} from '../../components/FormUI';

import { APP_URLS } from '../../../../utils/network/urls';
import useAxiosHook from '../../../../utils/network/AxiosClient';
import ShowLoader from '../../../../components/ShowLoder';

const STEP = 3;

const QUALS = [
  '10th', '12th', 'Diploma', 'BA', 'BSc', 'BCom',
  'Graduate', 'Post Graduate', 'Art', 'Other',
];

const showToast = (msg: string) => {
  ToastAndroid.show(msg, ToastAndroid.SHORT);
};

const EducationScreen = ({ onNext }: { onNext: () => void }) => {
  const { formData, updateStep, nextStep } = useFormCtx();
  const stepColor = getStepColor(STEP);
  const { post } = useAxiosHook();

  const formik = useFormik({
    initialValues: {
      educations: formData.educations || [
        { qualification: '', college: '', board: '', fromDate: '', toDate: '', percentage: '' }
      ]
    },
    validationSchema: EducationSchema,
    validateOnBlur: true,
    validateOnChange: false,

    onSubmit: async (values) => {

      console.log('🔥 SUBMIT CALLED');
      console.log('📦 FORM VALUES:', values);

      const payload = {
        EducationalDetails: values.educations.map(e => ({
          Course: e.qualification,
          Specialization: e.board,
          Fromdate: e.fromDate,
          Todate: e.toDate,
          GPA: e.percentage,
          Bordoruniversity: e.college,
        }))
      };

      console.log('📤 REQUEST URL:', APP_URLS.InsertForm3Update);
      console.log('📤 REQUEST BODY:', JSON.stringify(payload, null, 2));

      try {
        const res = await post({
          url: APP_URLS.InsertForm3Update,
          data: payload,
        });

        console.log('📥 RESPONSE:', JSON.stringify(res, null, 2));

        // ✅ FIXED CONDITION
        if (res?.Content.Message === "Data Inserted Successfully") {
          showToast('Education saved!');
          updateStep('educations', values.educations);
          nextStep();
          onNext(3);
        } else {
          showToast(res?.status || 'Submit failed');
        }

      } catch (err) {
        console.log('❌22 ERROR:', err);
        showToast('Something went wrong');
      }
    }
  });

  const { values, setFieldValue, handleSubmit } = formik;
  const formatDateOnly = (raw: string) => {
    if (!raw) return '';
    // "11-05-2018 12:00:00 AM" → "2018-05-11"
    const datePart = raw.split(' ')[0]; // "11-05-2018"
    const [day, month, year] = datePart.split('-');
    return `${year}/${month}/${day}`;
  };


  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchForm3Data = async () => {
      try {
        const res = await post({ url: APP_URLS.ShowForm3 });
        console.log('✅ ShowForm3 RESPONSE:', JSON.stringify(res, null, 2));

        if (res?.StatusCode === 200) {
          setLoading(false);

          const eduList = res.Content?.EducationalDetails || [];
          if (eduList.length > 0) {
            const mapped = eduList.map((edu: any) => ({
              qualification: edu.Course?.trim() ?? '',
              college: edu.UniversityCollegeInstitution?.trim() ?? '',
              board: edu.Specialization?.trim() ?? '',
              fromDate: formatDateOnly(edu.PeriodFrom),
              toDate: formatDateOnly(edu.PeriodTo),
              percentage: edu.ClassOrPercentage?.replace('%', '').trim() ?? '',
            }));

            setFieldValue('educations', mapped);

            setFieldValue('educations', mapped);
          }
        }
      } catch (err) {
        console.log('❌ ShowForm3 ERROR:', err);
      }
    };

    fetchForm3Data();
  }, []);

  const addEducation = () => {
    console.log(...values.educations)
    setFieldValue('educations', [
      ...values.educations,
      { qualification: '', college: '', board: '', fromDate: '', toDate: '', percentage: '' }
    ]);

    console.log(values.educations)
  };

  const removeEducation = (idx: number) => {
    const updated = values.educations.filter((_, i) => i !== idx);
    setFieldValue('educations', updated);
  };

  const onPressNext = async () => {
    const errs = await formik.validateForm();
    console.log('❌22 ERRORS:', errs);
    console.log('🔍 Current Values:', JSON.stringify(values.educations, null, 2));

    if (Object.keys(errs).length > 0) {
      const firstError = Object.values(errs)[0];
      if (Array.isArray(firstError)) {
        // अगर educations array है तो उसके अंदर का पहला error लें
        const innerError = Object.values(firstError[0])[0] as string;
        showToast(innerError);
      } else {
        showToast(firstError as string);
      }
      return;
    }

    handleSubmit();
  };

  const handleDateChange = (text: string, idx: number, field: string) => {
  let cleaned = text.replace(/\D/g, '').slice(0, 8);

  let year  = cleaned.slice(0, 4);
  let month = cleaned.slice(4, 6);
  let day   = cleaned.slice(6, 8);

  // Year validation
  if (year.length === 4) {
    const yVal = parseInt(year);
    if (yVal < 1960) year = '1960';
    if (yVal > 2035) year = '2035';
  }

  // Month validation + leading zero
  if (month.length === 1) {
    const mVal = parseInt(month);
    if (mVal > 1) month = '0' + month; // ✅ 2-9 type karo → 02-09 auto
  } else if (month.length === 2) {
    const mVal = parseInt(month);
    if (mVal > 12) month = '12';
    if (mVal === 0) month = '01';
  }

  // Day validation + leading zero
  if (day.length === 1) {
    const dVal = parseInt(day);
    if (dVal > 3) day = '0' + day; // ✅ 4-9 type karo → 04-09 auto
  } else if (day.length === 2) {
    const dVal = parseInt(day);
    if (dVal > 31) day = '31';
    if (dVal === 0) day = '01';
  }

  const validatedCleaned = year + month + day;

  // Auto-slash formatting YYYY/MM/DD
  let finalStr = validatedCleaned;
  if (validatedCleaned.length >= 4 && validatedCleaned.length <= 6) {
    // ✅ 4 digit hote hi slash aa jaye
    finalStr = `${validatedCleaned.slice(0, 4)}/${validatedCleaned.slice(4)}`;
  } else if (validatedCleaned.length > 6) {
    finalStr = `${validatedCleaned.slice(0, 4)}/${validatedCleaned.slice(4, 6)}/${validatedCleaned.slice(6, 8)}`;
  }

  setFieldValue(`educations[${idx}].${field}`, finalStr);
};
  return (
    <View style={s.screen}>
      {/* <StepBanner currentStep={STEP} /> */}
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">
        {loading && <ShowLoader />}

        {values.educations.map((edu, idx) => (
          <SectionCard key={idx} title={`Education ${idx + 1}`} icon="school" iconColor={stepColor}>
           
            <SelectPicker
              label="Qualification"
              options={QUALS}
              value={edu.qualification}
              onChange={(v) => {
                console.log('📌 Selected Value:', v); // 👈 ye print ho raha hai?
                setFieldValue(`educations[${idx}].qualification`, v)
              }}
            />

            <AppInput label="College" value={edu.college}
              onChangeText={(t) => setFieldValue(`educations[${idx}].college`, t)} />
            <AppInput label="Board/University" value={edu.board}
              onChangeText={(t) => setFieldValue(`educations[${idx}].board`, t)} />

           
            <AppInput
              keyboardType="phone-pad"
              maxLength={10}
              label="From Date"
              placeholder="YYYY/MM/DD"
              value={edu.fromDate}
              onChangeText={(t) => handleDateChange(t, idx, 'fromDate')}
              error={formik.errors.educations?.[idx]?.fromDate}
              touched={formik.touched.educations?.[idx]?.fromDate}
            />

            <AppInput
              keyboardType="phone-pad"
              maxLength={10}
              label="To Date"
              placeholder="YYYY/MM/DD"
              value={edu.toDate}
              onChangeText={(t) => handleDateChange(t, idx, 'toDate')}
              error={formik.errors.educations?.[idx]?.toDate}
              touched={formik.touched.educations?.[idx]?.toDate}
            />




            <AppInput label="Percentage/GPA" value={edu.percentage}
              onChangeText={(t) => setFieldValue(`educations[${idx}].percentage`, t)} />

            {/* Remove Button */}
            {values.educations.length > 1 && (
              <Button title="Remove" color="red" onPress={() => removeEducation(idx)} />
            )}
          </SectionCard>
        ))}


        <Button title="Add More Education Optional" onPress={addEducation} />
        <NavRow onNext={onPressNext} stepColor={stepColor} />
      </ScrollView>
    </View>
  );
};

export default EducationScreen;

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light_blue },
  scroll: { padding: 16, paddingBottom: 40 },
});
