// screens/PartnerOnboardingScreen.tsx

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Switch,
  Image,
  TextInput,
} from 'react-native';
import { Formik, FieldArray } from 'formik';
import * as Yup from 'yup';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';

// ─────────────────────────────────────────────────────────
// THEME
// ─────────────────────────────────────────────────────────
const COLORS = {
  primary:   '#5B5FEF',
  primaryLt: '#EEF0FF',
  bg:        '#F6F7FB',
  card:      '#FFFFFF',
  text:      '#1A1B25',
  subtext:   '#8A8D9F',
  border:    '#E6E8F0',
  danger:    '#E5484D',
  success:   '#1AAE6F',
};

// ─────────────────────────────────────────────────────────
// VALIDATION SCHEMA
// ─────────────────────────────────────────────────────────
const PartnerSchema = Yup.object().shape({
  Name:        Yup.string().required('Name is required'),
  Firmname:    Yup.string().required('Firm name is required'),
  mobile:      Yup.string().length(10, 'Enter valid 10-digit mobile').required('Mobile is required'),
  Email:       Yup.string().email('Invalid email').required('Email is required'),
  Statename:   Yup.string().required('Select state'),
  Districtname:Yup.string().required('Select district'),
  cityname:    Yup.string().required('City is required'),
  Pincode:     Yup.string().length(6, 'Enter valid 6-digit pincode').required('Pincode is required'),
  Address:     Yup.string().required('Address is required'),
  PanCard:     Yup.string().length(10, 'Enter valid PAN').required('PAN is required'),
  AadharCard:  Yup.string().length(12, 'Enter valid Aadhar').required('Aadhar is required'),
  Gstnumber:   Yup.string().nullable(),
  ispvt:       Yup.boolean(),
  BRNumber:    Yup.string().when('ispvt', {
    is: true,
    then: s => s.required('BR Number is required for Pvt Ltd'),
  }),
  bankinformationforradiantclients: Yup.array().of(
    Yup.object().shape({
      BankName:          Yup.string().required('Required'),
      Type:               Yup.string().required('Required'),
      BranchName:         Yup.string().required('Required'),
      Ifsccode:           Yup.string().required('Required'),
      AccountNUmber:      Yup.string().required('Required'),
      AccountholderName:  Yup.string().required('Required'),
    })
  ).min(1, 'Add at least one bank account'),
});

// ─────────────────────────────────────────────────────────
// INITIAL VALUES (matches your JSON schema exactly)
// ─────────────────────────────────────────────────────────
const initialValues = {
  Name: '',
  Firmname: '',
  mobile: '',
  Statename: '',
  Districtname: '',
  Email: '',
  cityname: '',
  Pincode: '',
  Address: '',
  PanCard: '',
  Pancarddoc: '',
  AadharCard: '',
  AadharcardFrontdoc: '',
  AadharcardBackdoc: '',
  Gstnumber: '',
  GstDoc: '',
  ispvt: false,
  BRNumber: '',
  BRDoc: '',
  cancelchecqueforradiantclients: [
    { Chequeno: '', ChequeImage: '' },
  ],
  bankinformationforradiantclients: [
    {
      BankName: '',
      Type: '',
      BranchName: '',
      Ifsccode: '',
      AccountNUmber: '',
      AccountholderName: '',
    },
  ],
};

const STATE_OPTIONS = [{ label: 'Rajasthan', value: 8 }, { label: 'Delhi', value: 1 }];
const DISTRICT_OPTIONS = [{ label: 'Sikar', value: 101 }, { label: 'Jaipur', value: 102 }];
const ACCOUNT_TYPES = ['Savings', 'Current'];

// ─────────────────────────────────────────────────────────
// REUSABLE UI PIECES
// ─────────────────────────────────────────────────────────
const Card = ({ title, icon, children }: any) => (
  <View style={s.card}>
    <View style={s.cardHeader}>
      <View style={s.cardIconWrap}>
        <MaterialCommunityIcons name={icon} size={18} color={COLORS.primary} />
      </View>
      <Text style={s.cardTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

const InputField = ({ label, value, onChangeText, onBlur, error, touched, ...rest }: any) => (
  <View style={s.fieldWrap}>
    <Text style={s.label}>{label}</Text>
    <TextInput
      style={[s.input, touched && error && s.inputError]}
      value={value}
      onChangeText={onChangeText}
      onBlur={onBlur}
      placeholderTextColor={COLORS.subtext}
      {...rest}
    />
    {touched && error && <Text style={s.errorText}>{error}</Text>}
  </View>
);

const Dropdown = ({ label, value, options, onSelect, error, touched }: any) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o: any) => o.value === value);

  return (
    <View style={s.fieldWrap}>
      <Text style={s.label}>{label}</Text>
      <TouchableOpacity
        style={[s.input, s.dropdownBtn, touched && error && s.inputError]}
        onPress={() => setOpen(!open)}
      >
        <Text style={{ color: selected ? COLORS.text : COLORS.subtext }}>
          {selected ? selected.label : `Select ${label}`}
        </Text>
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={COLORS.subtext}
        />
      </TouchableOpacity>
      {open && (
        <View style={s.dropdownList}>
          {options.map((opt: any) => (
            <TouchableOpacity
              key={opt.value}
              style={s.dropdownItem}
              onPress={() => { onSelect(opt.value); setOpen(false); }}
            >
              <Text style={s.dropdownItemText}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {touched && error && <Text style={s.errorText}>{error}</Text>}
    </View>
  );
};

const DocUpload = ({ label, value, onPick }: any) => {
  const handlePick = () => {
    launchImageLibrary({ mediaType: 'photo', quality: 0.7 }, (res) => {
      if (res.assets?.[0]?.uri) onPick(res.assets[0].uri);
    });
  };

  return (
    <View style={s.fieldWrap}>
      <Text style={s.label}>{label}</Text>
      <TouchableOpacity style={s.docBox} onPress={handlePick}>
        {value ? (
          <Image source={{ uri: value }} style={s.docPreview} />
        ) : (
          <>
            <MaterialCommunityIcons name="cloud-upload-outline" size={24} color={COLORS.primary} />
            <Text style={s.docUploadText}>Upload Document</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

// ─────────────────────────────────────────────────────────
// MAIN SCREEN
// ─────────────────────────────────────────────────────────
const PartnerOnboardingScreen = ({ navigation }: any) => {
  return (
    <View style={s.screen}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Partner Onboarding</Text>
        <Text style={s.headerSub}>Fill your KYC & bank details</Text>
      </View>

      <Formik
        initialValues={initialValues}
        validationSchema={PartnerSchema}
        onSubmit={(values) => {
          console.log('SUBMIT PAYLOAD →', JSON.stringify(values, null, 2));
          // TODO: call API here
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, setFieldValue, handleSubmit }) => (
          <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

            {/* ── Personal & Firm Info ── */}
            <Card title="Personal & Firm Details" icon="account-tie">
              <InputField
                label="Full Name"
                placeholder="Enter your full name"
                value={values.Name}
                onChangeText={handleChange('Name')}
                onBlur={handleBlur('Name')}
                error={errors.Name}
                touched={touched.Name}
              />
              <InputField
                label="Firm Name"
                placeholder="Enter firm / company name"
                value={values.Firmname}
                onChangeText={handleChange('Firmname')}
                onBlur={handleBlur('Firmname')}
                error={errors.Firmname}
                touched={touched.Firmname}
              />
              <InputField
                label="Mobile Number"
                placeholder="10-digit mobile number"
                keyboardType="number-pad"
                maxLength={10}
                value={values.mobile}
                onChangeText={t => setFieldValue('mobile', t.replace(/\D/g, ''))}
                onBlur={handleBlur('mobile')}
                error={errors.mobile}
                touched={touched.mobile}
              />
              <InputField
                label="Email"
                placeholder="example@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={values.Email}
                onChangeText={handleChange('Email')}
                onBlur={handleBlur('Email')}
                error={errors.Email}
                touched={touched.Email}
              />
            </Card>

            {/* ── Address Info ── */}
            <Card title="Address Details" icon="map-marker-outline">
              <Dropdown
                label="State"
                value={values.Statename}
                options={STATE_OPTIONS}
                onSelect={(v: any) => setFieldValue('Statename', v)}
                error={errors.Statename}
                touched={touched.Statename}
              />
              <Dropdown
                label="District"
                value={values.Districtname}
                options={DISTRICT_OPTIONS}
                onSelect={(v: any) => setFieldValue('Districtname', v)}
                error={errors.Districtname}
                touched={touched.Districtname}
              />
              <InputField
                label="City"
                placeholder="Enter city name"
                value={values.cityname}
                onChangeText={handleChange('cityname')}
                onBlur={handleBlur('cityname')}
                error={errors.cityname}
                touched={touched.cityname}
              />
              <InputField
                label="Pincode"
                placeholder="6-digit pincode"
                keyboardType="number-pad"
                maxLength={6}
                value={values.Pincode}
                onChangeText={t => setFieldValue('Pincode', t.replace(/\D/g, ''))}
                onBlur={handleBlur('Pincode')}
                error={errors.Pincode}
                touched={touched.Pincode}
              />
              <InputField
                label="Full Address"
                placeholder="House no, street, area"
                multiline
                numberOfLines={3}
                value={values.Address}
                onChangeText={handleChange('Address')}
                onBlur={handleBlur('Address')}
                error={errors.Address}
                touched={touched.Address}
              />
            </Card>

            {/* ── PAN & Aadhar ── */}
            <Card title="Identity Documents" icon="card-account-details-outline">
              <InputField
                label="PAN Card Number"
                placeholder="ABCDE1234F"
                autoCapitalize="characters"
                maxLength={10}
                value={values.PanCard}
                onChangeText={t => setFieldValue('PanCard', t.toUpperCase())}
                onBlur={handleBlur('PanCard')}
                error={errors.PanCard}
                touched={touched.PanCard}
              />
              <DocUpload
                label="PAN Card Document"
                value={values.Pancarddoc}
                onPick={(uri: string) => setFieldValue('Pancarddoc', uri)}
              />

              <InputField
                label="Aadhar Card Number"
                placeholder="12-digit Aadhar number"
                keyboardType="number-pad"
                maxLength={12}
                value={values.AadharCard}
                onChangeText={t => setFieldValue('AadharCard', t.replace(/\D/g, ''))}
                onBlur={handleBlur('AadharCard')}
                error={errors.AadharCard}
                touched={touched.AadharCard}
              />
              <View style={s.row2}>
                <View style={{ flex: 1 }}>
                  <DocUpload
                    label="Aadhar Front"
                    value={values.AadharcardFrontdoc}
                    onPick={(uri: string) => setFieldValue('AadharcardFrontdoc', uri)}
                  />
                </View>
                <View style={{ width: 12 }} />
                <View style={{ flex: 1 }}>
                  <DocUpload
                    label="Aadhar Back"
                    value={values.AadharcardBackdoc}
                    onPick={(uri: string) => setFieldValue('AadharcardBackdoc', uri)}
                  />
                </View>
              </View>
            </Card>

            {/* ── GST & Firm Type ── */}
            <Card title="GST & Business Type" icon="domain">
              <InputField
                label="GST Number (Optional)"
                placeholder="08ABCDE1234F1Z5"
                autoCapitalize="characters"
                value={values.Gstnumber}
                onChangeText={t => setFieldValue('Gstnumber', t.toUpperCase())}
                onBlur={handleBlur('Gstnumber')}
                error={errors.Gstnumber}
                touched={touched.Gstnumber}
              />
              {!!values.Gstnumber && (
                <DocUpload
                  label="GST Document"
                  value={values.GstDoc}
                  onPick={(uri: string) => setFieldValue('GstDoc', uri)}
                />
              )}

              {/* Pvt Ltd Toggle */}
              <View style={s.toggleRow}>
                <View>
                  <Text style={s.label}>Is this a Private Limited Firm?</Text>
                  <Text style={s.subLabel}>Enable if registered as Pvt Ltd</Text>
                </View>
                <Switch
                  value={values.ispvt}
                  onValueChange={(v) => setFieldValue('ispvt', v)}
                  trackColor={{ false: COLORS.border, true: COLORS.primaryLt }}
                  thumbColor={values.ispvt ? COLORS.primary : '#fff'}
                />
              </View>

              {values.ispvt && (
                <>
                  <InputField
                    label="BR Number"
                    placeholder="Business Registration Number"
                    value={values.BRNumber}
                    onChangeText={handleChange('BRNumber')}
                    onBlur={handleBlur('BRNumber')}
                    error={errors.BRNumber}
                    touched={touched.BRNumber}
                  />
                  <DocUpload
                    label="BR Certificate"
                    value={values.BRDoc}
                    onPick={(uri: string) => setFieldValue('BRDoc', uri)}
                  />
                </>
              )}
            </Card>

            {/* ── Cancelled Cheques (Dynamic Array) ── */}
            <Card title="Cancelled Cheques" icon="checkbook">
              <FieldArray name="cancelchecqueforradiantclients">
                {({ push, remove }) => (
                  <>
                    {values.cancelchecqueforradiantclients.map((cheque, idx) => (
                      <View key={idx} style={s.subBlock}>
                        <View style={s.subBlockHeader}>
                          <Text style={s.subBlockTitle}>Cheque {idx + 1}</Text>
                          {values.cancelchecqueforradiantclients.length > 1 && (
                            <TouchableOpacity onPress={() => remove(idx)}>
                              <MaterialCommunityIcons name="trash-can-outline" size={18} color={COLORS.danger} />
                            </TouchableOpacity>
                          )}
                        </View>
                        <InputField
                          label="Cheque Number"
                          placeholder="Enter cheque number"
                          keyboardType="number-pad"
                          value={cheque.Chequeno}
                          onChangeText={handleChange(`cancelchecqueforradiantclients.${idx}.Chequeno`)}
                        />
                        <DocUpload
                          label="Cheque Image"
                          value={cheque.ChequeImage}
                          onPick={(uri: string) =>
                            setFieldValue(`cancelchecqueforradiantclients.${idx}.ChequeImage`, uri)
                          }
                        />
                      </View>
                    ))}

                    <TouchableOpacity
                      style={s.addBtn}
                      onPress={() => push({ Chequeno: '', ChequeImage: '' })}
                    >
                      <MaterialCommunityIcons name="plus-circle-outline" size={18} color={COLORS.primary} />
                      <Text style={s.addBtnText}>Add Another Cheque</Text>
                    </TouchableOpacity>
                  </>
                )}
              </FieldArray>
            </Card>

            {/* ── Bank Information (Dynamic Array) ── */}
            <Card title="Bank Account Details" icon="bank">
              <FieldArray name="bankinformationforradiantclients">
                {({ push, remove }) => (
                  <>
                    {values.bankinformationforradiantclients.map((bank, idx) => (
                      <View key={idx} style={s.subBlock}>
                        <View style={s.subBlockHeader}>
                          <Text style={s.subBlockTitle}>Bank Account {idx + 1}</Text>
                          {values.bankinformationforradiantclients.length > 1 && (
                            <TouchableOpacity onPress={() => remove(idx)}>
                              <MaterialCommunityIcons name="trash-can-outline" size={18} color={COLORS.danger} />
                            </TouchableOpacity>
                          )}
                        </View>

                        <InputField
                          label="Bank Name"
                          placeholder="e.g. State Bank of India"
                          value={bank.BankName}
                          onChangeText={handleChange(`bankinformationforradiantclients.${idx}.BankName`)}
                          error={(errors as any)?.bankinformationforradiantclients?.[idx]?.BankName}
                          touched={(touched as any)?.bankinformationforradiantclients?.[idx]?.BankName}
                        />

                        <View style={s.fieldWrap}>
                          <Text style={s.label}>Account Type</Text>
                          <View style={s.chipRow}>
                            {ACCOUNT_TYPES.map((type) => (
                              <TouchableOpacity
                                key={type}
                                style={[s.chip, bank.Type === type && s.chipActive]}
                                onPress={() =>
                                  setFieldValue(`bankinformationforradiantclients.${idx}.Type`, type)
                                }
                              >
                                <Text style={[s.chipText, bank.Type === type && s.chipTextActive]}>
                                  {type}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>

                        <InputField
                          label="Branch Name"
                          placeholder="Branch name"
                          value={bank.BranchName}
                          onChangeText={handleChange(`bankinformationforradiantclients.${idx}.BranchName`)}
                        />
                        <InputField
                          label="IFSC Code"
                          placeholder="e.g. SBIN0001234"
                          autoCapitalize="characters"
                          value={bank.Ifsccode}
                          onChangeText={t =>
                            setFieldValue(`bankinformationforradiantclients.${idx}.Ifsccode`, t.toUpperCase())
                          }
                        />
                        <InputField
                          label="Account Number"
                          placeholder="Enter account number"
                          keyboardType="number-pad"
                          value={bank.AccountNUmber}
                          onChangeText={t =>
                            setFieldValue(`bankinformationforradiantclients.${idx}.AccountNUmber`, t.replace(/\D/g, ''))
                          }
                        />
                        <InputField
                          label="Account Holder Name"
                          placeholder="As per bank records"
                          value={bank.AccountholderName}
                          onChangeText={handleChange(`bankinformationforradiantclients.${idx}.AccountholderName`)}
                        />
                      </View>
                    ))}

                    <TouchableOpacity
                      style={s.addBtn}
                      onPress={() =>
                        push({
                          BankName: '',
                          Type: '',
                          BranchName: '',
                          Ifsccode: '',
                          AccountNUmber: '',
                          AccountholderName: '',
                        })
                      }
                    >
                      <MaterialCommunityIcons name="plus-circle-outline" size={18} color={COLORS.primary} />
                      <Text style={s.addBtnText}>Add Another Bank Account</Text>
                    </TouchableOpacity>
                  </>
                )}
              </FieldArray>
            </Card>

            {/* ── Submit ── */}
            <TouchableOpacity style={s.submitBtn} onPress={handleSubmit as any}>
              <Text style={s.submitBtnText}>Submit Application</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
            </TouchableOpacity>
          </ScrollView>
        )}
      </Formik>
    </View>
  );
};

export default PartnerOnboardingScreen;

// ─────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.bg },

  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  headerSub:   { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  scroll: { padding: 16, paddingBottom: 40 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  cardIconWrap: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: COLORS.primaryLt,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 10,
  },
  cardTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text },

  fieldWrap: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginBottom: 6 },
  subLabel: { fontSize: 11, color: COLORS.subtext, marginTop: 2 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
    backgroundColor: '#FAFBFC',
  },
  inputError: { borderColor: COLORS.danger },
  errorText: { fontSize: 11, color: COLORS.danger, marginTop: 4 },

  dropdownBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdownList: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  dropdownItem: { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  dropdownItemText: { fontSize: 14, color: COLORS.text },

  docBox: {
    height: 100,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    backgroundColor: '#FAFBFC',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  docPreview: { width: '100%', height: '100%' },
  docUploadText: { fontSize: 12, color: COLORS.primary, marginTop: 6, fontWeight: '600' },

  row2: { flexDirection: 'row' },

  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },

  subBlock: {
    backgroundColor: COLORS.bg,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  subBlockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  subBlockTitle: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
  },
  addBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.primary, marginLeft: 6 },

  chipRow: { flexDirection: 'row' },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
    backgroundColor: '#FAFBFC',
  },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, color: COLORS.text, fontWeight: '500' },
  chipTextActive: { color: '#fff' },

  submitBtn: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: { fontSize: 15, fontWeight: '700', color: '#fff', marginRight: 8 },
});
