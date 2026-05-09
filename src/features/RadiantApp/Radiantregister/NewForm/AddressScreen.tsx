// screens/AddressScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
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
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { hScale, wScale } from '../../../../utils/styles/dimensions';
import ShowLoader from '../../../../components/ShowLoder';

const STEP = 2;

const AddressSchema = Yup.object({
    permanentAddress: Yup.string().required('Permanent address required'),
    permanentPinCode: Yup.string()
        .matches(/^\d{6}$/, 'Enter valid 6-digit pincode')
        .required('Pincode required'),
    presentAddress: Yup.string().required('Present address required'),
    presentPinCode: Yup.string()
        .matches(/^\d{6}$/, 'Enter valid 6-digit pincode')
        .required('Pincode required'),
    residenceType: Yup.string().required('Residence type required'),
    
    // Updated Period of Stay Validation
    periodOfStay: Yup.string()
        .matches(
            /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, 
            'Enter valid date (DD/MM/YYYY)'
        )
        .test('year-range', 'Year must be between 1960 and 2035', (val) => {
            if (!val) return false;
            const year = parseInt(val.split('/')[2]);
            return year >= 1960 && year <= 2035;
        })
        .required('Period of stay required'),

    landmark: Yup.string().required('Landmark required'),
    nearestPoliceStation: Yup.string().required('Police station required'),
});

// ─── Period of Stay format ────────────────────────────
// "14-06-1990 12:00:00 AM" → "14/06/1990"
const formatPeriod = (raw: string): string => {
    const datePart = raw?.split(' ')[0] ?? '';
    return datePart.replace(/-/g, '/');
};

const formatDateToAPI = (date: string) => {
    if (!date) return '';

    const [day, month, year] = date.split('/');
    if (!day || !month || !year) return '';

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};
// ─── Main Screen ──────────────────────────────────────
const AddressScreen = ({ onNext }: { onNext: () => void }) => {
    const { post } = useAxiosHook();
    const { formData, updateStep, nextStep, prevStep } = useFormCtx();
    const stepColor = getStepColor(STEP);
    const [sameAddress, setSameAddress] = useState(false);
    const handleSameAddress = (val: boolean) => {
        setSameAddress(val);

        if (val) {
            setFieldValue('presentAddress', values.permanentAddress);
            setFieldValue('presentPinCode', values.permanentPinCode);
        } else {
            setFieldValue('presentAddress', '');
            setFieldValue('presentPinCode', '');
        }
    };

    const formik = useFormik({
        initialValues: {
            permanentAddress: '',
            permanentPinCode: '',
            presentAddress: '',
            presentPinCode: '',
            residenceType: '',
            periodOfStay: '',
            landmark: '',
            nearestPoliceStation: '',
        },
        validationSchema: AddressSchema,
        validateOnBlur: true,
        validateOnChange: false,

        onSubmit: async (values) => {
            console.log('🔥 AddressScreen onSubmit CALLED');

            try {
                const payload = {
                    PermanentAddress: values.permanentAddress,
                    PermanentAddressPin: values.permanentPinCode,
                    PresentAddress: values.presentAddress,
                    PresentAddressPin: values.presentPinCode,
                    ResidenceType: values.residenceType,
                    PeriodofStay: formatDateToAPI(values.periodOfStay),
                    Landmark: values.landmark,
                    NearestPoliceStation: values.nearestPoliceStation,
                };

                console.log('📤 InsertForm2 URL   :', APP_URLS.InsertForm2Update);
                console.log('📦 InsertForm2 REQUEST:', JSON.stringify(payload, null, 2));

                const res = await post({
                    url: APP_URLS.InsertForm2Update,
                    data: payload,
                });

                console.log('📥 InsertForm2 RESPONSE:', JSON.stringify(res, null, 2));

                if (res?.StatusCode === 200) {
                    toast("Address saved!");
                    updateStep('address', values);
                  //  nextStep();
                    onNext(2);

                    // navigation.navigate('EducationScreen');
                } else {
                    toast(res?.message || "Submit failed. Try again.");
                }
            } catch (err) {
                console.log('❌ InsertForm2 ERROR:', err);
                toast("Something went wrong. Try again.");
            }
        },
    });

    const { values, errors, touched, handleSubmit, setFieldValue, setFieldTouched } = formik;

  const [loading,setLoading] = useState(true);
    useEffect(() => {
        const fetchForm2Data = async () => {
            try {
                const res = await post({ url: APP_URLS.ShowForm2 });
                console.log('✅ ShowForm2 RESPONSE:', JSON.stringify(res, null, 2));

                if (res?.StatusCode === 200) {
                    const c = res.Content;
          setLoading(false);

                    // ✅ Already submitted → next screen


                    // ✅ Not submitted → prefill data
                    formik.setValues({
                        permanentAddress: c.PermanentAddress ?? '',
                        permanentPinCode: c.PermanentAddressPin ?? '',
                        presentAddress: c.PresentAddress ?? '',
                        presentPinCode: c.PresentAddressPin ?? '',
                        residenceType: c.ResidenceType ?? '',
                        periodOfStay: formatPeriod(c.PeriodofStay ?? ''),
                        landmark: c.Landmark ?? '',
                        nearestPoliceStation: c.NearestPoliceStation ?? '',
                    });
                    if (c?.isvalid === true) {
                        // onNext();
                        return;
                    }
                }
            } catch (err) {
                console.log('❌ ShowForm2 ERROR:', err);
            }
        };

        fetchForm2Data();
    }, []);
    // ─── Field helper ─────────────────────────────────────
    const f = (name: keyof typeof values) => ({
        value: values[name],
        error: errors[name] as string | undefined,
        touched: !!touched[name],
        onBlur: () => setFieldTouched(name, true),
        onChangeText: (t: string) => setFieldValue(name, t),
    });
    useEffect(() => {
        if (
            values.presentAddress === values.permanentAddress &&
            values.presentPinCode === values.permanentPinCode &&
            values.presentAddress !== '' // empty case avoid
        ) {
            setSameAddress(true);
        } else {
            setSameAddress(false);
        }
    }, [
        values.presentAddress,
        values.permanentAddress,
        values.presentPinCode,
        values.permanentPinCode,
    ]);


    return (
        <View style={s.screen}>
            {/* <StepBanner currentStep={STEP} /> */}

            <ScrollView
                contentContainerStyle={s.scroll}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                              {loading&&<ShowLoader/>}

                <SectionCard
                    title="Address & Residency Details"
                    icon="map-marker"
                    iconColor={stepColor}
                >
                    {/* Permanent Address */}
                    <AppInput
                        label="Permanent Address"
                        placeholder="Enter permanent address"
                        multiline
                        numberOfLines={3}
                        {...f('permanentAddress')}
                    />
                    <AppInput
                        label="Permanent Pin Code"
                        placeholder="Enter 6-digit pincode"
                        keyboardType="number-pad"
                        maxLength={6}
                        {...f('permanentPinCode')}
                        onChangeText={t => setFieldValue('permanentPinCode', t.replace(/\D/g, ''))}
                    />

                    <TouchableOpacity
                        style={s.checkRow}
                        onPress={() => handleSameAddress(!sameAddress)}
                        activeOpacity={0.7}
                    >
                        <View style={[s.checkbox, sameAddress && s.checkboxActive]}>
                            {sameAddress && (
                                <MaterialCommunityIcons name="check" size={14} color="#fff" />
                            )}
                        </View>

                        <Text style={s.checkLabel}>
                            Present address same as permanent address
                        </Text>
                    </TouchableOpacity>
                    <AppInput
                        label="Present Address"
                        placeholder="Enter present address"
                        multiline
                        numberOfLines={3}
                        {...f('presentAddress')}
                    />
                    <AppInput
                        label="Present Pin Code"
                        placeholder="Enter 6-digit pincode"
                        keyboardType="number-pad"
                        maxLength={6}
                        {...f('presentPinCode')}
                        onChangeText={t => setFieldValue('presentPinCode', t.replace(/\D/g, ''))}
                    />

                    {/* Residence Type */}
                    <SelectPicker
                        label="Residence Type"
                        options={['Owned', 'Rented', 'Lease']}
                        value={values.residenceType}
                        onChange={v => setFieldValue('residenceType', v)}
                        error={errors.residenceType}
                        touched={!!touched.residenceType}
                    />

                    {/* Period of Stay */}
                    <AppInput
                        label="Period of Stay (Since)"
                        placeholder="DD/MM/YYYY"
                        keyboardType="number-pad"
                        maxLength={10}
                        {...f('periodOfStay')}
                        // onChangeText={t => {
                        //     const c = t.replace(/\D/g, '').slice(0, 8);
                        //     let fmt = c;
                        //     if (c.length > 2) fmt = c.slice(0, 2) + '/' + c.slice(2);
                        //     if (c.length > 4) fmt = c.slice(0, 2) + '/' + c.slice(2, 4) + '/' + c.slice(4);
                        //     setFieldValue('periodOfStay', fmt);
                        // }}

                        onChangeText={t => {
                            // 1. Sirf numbers rakho (Max 8 digits)
                            let cleaned = t.replace(/\D/g, '').slice(0, 8);

                            let day = cleaned.slice(0, 2);
                            let month = cleaned.slice(2, 4);
                            let year = cleaned.slice(4, 8);

                            // 2. Day Validation (01 - 31)
                            if (day.length === 2) {
                                const dVal = parseInt(day);
                                if (dVal > 31) day = "31";
                                if (dVal === 0) day = "01";
                            }

                            // 3. Month Validation (01 - 12)
                            if (month.length === 2) {
                                const mVal = parseInt(month);
                                if (mVal > 12) month = "12";
                                if (mVal === 0) month = "01";
                            }

                            // 4. Year Validation (1960 - 2035)
                            // Jab user 4 digits poore kar le tabhi validate karein
                            if (year.length === 4) {
                                const yVal = parseInt(year);
                                if (yVal < 1960) year = "1960";
                                if (yVal > 2035) year = "2035";
                            }

                            // Combine numbers back
                            const validatedCleaned = day + month + year;

                            // 5. Formatting (DD/MM/YYYY)
                            let fmt = validatedCleaned;
                            if (validatedCleaned.length > 2 && validatedCleaned.length <= 4) {
                                fmt = `${validatedCleaned.slice(0, 2)}/${validatedCleaned.slice(2)}`;
                            } else if (validatedCleaned.length > 4) {
                                fmt = `${validatedCleaned.slice(0, 2)}/${validatedCleaned.slice(2, 4)}/${validatedCleaned.slice(4, 8)}`;
                            }

                            setFieldValue('periodOfStay', fmt);
                        }}
                    />

                    {/* Landmark */}
                    <AppInput
                        label="Prominent Landmark"
                        placeholder="Enter nearby landmark"
                        {...f('landmark')}
                    />

                    {/* Nearest Police Station */}
                    <AppInput
                        label="Nearest Police Station"
                        placeholder="Enter nearest police station"
                        {...f('nearestPoliceStation')}
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

export default AddressScreen;

const s = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.light_blue },
    scroll: { padding: 16, paddingBottom: 40 },
    checkRow: { flexDirection: 'row', alignItems: 'center', marginVertical: hScale(22), gap: wScale(8) },
    checkbox: { width: wScale(25), height: wScale(25), borderRadius: wScale(4), borderWidth: 1.5, borderColor: '#D1D5DB', alignItems: 'center', justifyContent: 'center' },
    checkboxActive: { backgroundColor: '#000', borderColor: '#000' },
    checkLabel: { fontSize: wScale(13), color: '#374151', flex: 1, marginLeft: 7 },
});