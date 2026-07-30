// screens/NewForm/PartnerBankDetailsScreen.tsx

import React, { useEffect, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';

import { SectionCard, AppInput, NavRow, getStepColor } from '../../components/FormUI';
import useAxiosHook from '../../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../../utils/network/urls';
import { colors } from '../../../../utils/styles/theme';
import BankListModal from '../../../../components/BankListModal';
import { toast } from '../NewForm/AadhaarPanVerification/types';
import ConfirmSubmitSheet from '../../components/ConfirmSubmitSheet';

const STEP = 2;
const CHEQUE_NO_MAX_LEN = 6;

interface BankRow {
  selectedBank: any | null;   // ── BankListModal se aaya poora bank object
  BankName: string;           // ── resolved display name (payload me yahi jayega)
  Type: string;                // ── ab UI se nahi, hamesha 'Current' fix h
  BranchName: string;
  Ifsccode: string;
  AccountNUmber: string;
  AccountholderName: string;  // ── sirf AccountVerify se aata h, manually edit nahi hota
  verifying: boolean;
  verified: boolean;
}

interface ChequeRow {
  Chequeno: string;
  ChequeImage: string;         // ── base64 (naye upload pe) ya URL (prefill pe) — payload me yahi jayega
  ChequeImagePreview: string;  // ── local uri, sirf preview ke liye
}

const emptyBank = (): BankRow => ({
  selectedBank: null,
  BankName: '',
  Type: 'Current', // ── manually fix, UI se select nahi hota
  BranchName: '',
  Ifsccode: '',
  AccountNUmber: '',
  AccountholderName: '',
  verifying: false,
  verified: false,
});

const emptyCheque = (): ChequeRow => ({ Chequeno: '', ChequeImage: '', ChequeImagePreview: '' });

// ─── Bank display name helper (BankAccountScreen jaisa hi) ───
const getBankDisplayName = (bank: any) => {
  if (!bank) return '';
  return (
    bank?.BankName ??
    bank?.bankName ??
    bank?.bank_name ??
    bank?.name ??
    bank?.Name ??
    bank?.label ??
    Object.values(bank)?.[0] ??
    'Selected'
  );
};

// Backend kabhi plain base64 bhejta h, kabhi full URL — dono case handle karo
// taaki <Image source={{ uri }}> hamesha sahi render ho.
const toImageUri = (value?: string) => {
  if (!value) return '';
  if (value.startsWith('http') || value.startsWith('data:') || value.startsWith('file:')) {
    return value;
  }
  return `data:image/jpeg;base64,${value}`;
};

const PartnerBankDetailsScreen = ({ onNext }: { onNext: () => void }) => {
  const { post } = useAxiosHook();
  const isSubmitting = useRef(false);
  const stepColor = getStepColor(STEP);

  // ── Sirf backend se aata h, koi input field nahi h — payload me wapas bhejna h ──
  const [gstNumber, setGstNumber] = useState('');

  // ── Client ID — fresh form pe 0, ShowClientInsert se aane ke baad wahi id use hogi ──
  const [idno, setIdno] = useState<number>(0);

  const [banks, setBanks] = useState<BankRow[]>([emptyBank()]);
  const [cheques, setCheques] = useState<ChequeRow[]>([emptyCheque()]);

  // ── Bank list (ek hi baar fetch hota h, saare rows isi list ko use karte h) ──
  const [bankList, setBankList] = useState<any[]>([]);
  const [bankListLoading, setBankListLoading] = useState(true);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [activeBankIdx, setActiveBankIdx] = useState<number | null>(null);

  const [prefillLoading, setPrefillLoading] = useState(true);

  // ── DataPrivacyScreen jaisa hi — submit se pehle confirm sheet dikhana h ──
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchBank = async () => {
      try {
        const response = await post({ url: APP_URLS.aepsBanklist });
        console.log('Bank Info:', response);
        if (response?.RESULT === '0') {
          setBankList(response?.ADDINFO?.data ?? []);
        }
      } catch (err) {
        console.log('❌ Bank list fetch failed', err);
      } finally {
        setBankListLoading(false);
      }
    };
    fetchBank();
  }, []);

  // ── Prefill (edit / resume flow) — ShowClientInsert ──────────
  useEffect(() => {
    const fetchPrefill = async () => {
      try {
        const res = await post({ url: APP_URLS.ShowClientInsert });
        console.log('📥 ShowClientInsert RESPONSE:', JSON.stringify(res, null, 2));

        const data = res?.Content?.[0];
        if (!data) { setPrefillLoading(false); return; }

        // ── Client ID — agar backend se aayi h to wahi use karo, warna 0 hi rahega ──
        if (typeof data.idno === 'number') setIdno(data.idno);

        // ── GST Number — sirf backend se aata h, input nahi h, payload me wapas jayega ──
        if (data.Gstnumber) setGstNumber(data.Gstnumber);

        if (Array.isArray(data.BankDetails) && data.BankDetails.length > 0) {
          setBanks(data.BankDetails.map((d: any) => ({
            selectedBank: { BankName: d.BankName },
            BankName: d.BankName ?? '',
            Type: d.Type ?? 'Current',
            BranchName: d.BranchName ?? '',
            Ifsccode: d.Ifsccode ?? '',
            AccountNUmber: d.AccountNUmber ?? '',
            AccountholderName: d.AccountholderName ?? '',
            verifying: false,
            // Backend se already aaya hua data verified maana jayega
            verified: !!d.AccountholderName,
          })));
        }

        // ── Cancelled Cheques ──────────────────────────────
        if (Array.isArray(data.Cancelcheque) && data.Cancelcheque.length > 0) {
          setCheques(data.Cancelcheque.map((c: any) => ({
            Chequeno: c.Chequeno ?? '',
            ChequeImage: c.ChequeImage ?? '',
            ChequeImagePreview: toImageUri(c.ChequeImage),
          })));
        }
      } catch (err) {
        console.log('❌ ShowClientInsert ERROR:', err);
      } finally {
        setPrefillLoading(false);
      }
    };

    fetchPrefill();
  }, []);

  const updateBank = (idx: number, field: keyof BankRow, value: any) => {
    setBanks(prev => prev.map((b, i) => (i === idx ? { ...b, [field]: value } : b)));
  };

  const updateCheque = (idx: number, field: keyof ChequeRow, value: string) => {
    setCheques(prev => prev.map((c, i) => (i === idx ? { ...c, [field]: value } : c)));
  };

  const addBank = () => setBanks(prev => [...prev, emptyBank()]);
  const removeBank = (idx: number) => setBanks(prev => prev.filter((_, i) => i !== idx));

  const addCheque = () => setCheques(prev => [...prev, emptyCheque()]);
  const removeCheque = (idx: number) => setCheques(prev => prev.filter((_, i) => i !== idx));

  // ── Doc picker (base64 return karta h, crash-safe bhi h) ──────
  const pickDoc = (onPicked: (result: { uri: string; base64: string }) => void) => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.7, includeBase64: true },
      (res) => {
        try {
          if (!res) return;
          if (res.didCancel) return;
          if (res.errorCode) {
            console.log('❌ ImagePicker ERROR:', res.errorCode, res.errorMessage);
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

  // ── Bank picker open/select (row-specific) ──────────────
  const openBankPicker = (idx: number) => {
    setActiveBankIdx(idx);
    setIsBankModalOpen(true);
  };

  const onSelectBankForRow = (bank: any) => {
    if (activeBankIdx === null) return;
    const name = getBankDisplayName(bank);
    setBanks(prev => prev.map((b, i) => (
      i === activeBankIdx
        ? { ...b, selectedBank: bank, BankName: name, verified: false, AccountholderName: '' }
        : b
    )));
    setIsBankModalOpen(false);
    setActiveBankIdx(null);
  };

  const resetVerify = (idx: number) => {
    setBanks(prev => prev.map((b, i) => (
      i === idx ? { ...b, verified: false, AccountholderName: '' } : b
    )));
  };

  // ── AccountVerify (api/Radiant/AccountVerify) — row-specific ──
  const handleVerify = async (idx: number) => {
    const bank = banks[idx];

    if (!bank.selectedBank) {
      toast('Select bank');
      return;
    }
    if (!bank.AccountNUmber) {
      toast('Enter account number');
      return;
    }
    if (!bank.Ifsccode) {
      toast('Enter IFSC');
      return;
    }

    updateBank(idx, 'verifying', true);
    resetVerify(idx);

    try {
      const payload = {
        account: bank.AccountNUmber,
        ifsc: bank.Ifsccode,
        Bankname: bank.BankName,
      };

      console.log('📤 AccountVerify REQUEST:', JSON.stringify(payload, null, 2));

      const res = await post({ url: APP_URLS.ClientAccountVerify, data: payload });

      console.log('✅ AccountVerify RESPONSE:', JSON.stringify(res, null, 2));

      const content = res?.Content;

      if (content?.statuscode === 'TXN' && content?.data?.benename) {
        setBanks(prev => prev.map((b, i) => (
          i === idx
            ? { ...b, verified: true, verifying: false, AccountholderName: content.data.benename }
            : b
        )));
        toast('Account Verified ✓');
      } else {
        updateBank(idx, 'verifying', false);
        toast(content?.status || content?.data?.remarks || 'Verification failed');
      }
    } catch (err) {
      console.log('❌ AccountVerify ERROR:', err);
      updateBank(idx, 'verifying', false);
      toast('Error verifying account');
    }
  };

  // ── Submit se pehle validation — jo bhi field khali/galat h, uska
  // specific message toast me dikhega, aur submit rok diya jayega.
  const validateForm = (): string | null => {
    for (let i = 0; i < banks.length; i++) {
      const b = banks[i];
      if (!b.selectedBank) return `Please select bank for Bank Account ${i + 1}`;
      if (!b.BranchName.trim()) return `Please enter branch name for Bank Account ${i + 1}`;
      if (!b.Ifsccode.trim()) return `Please enter IFSC code for Bank Account ${i + 1}`;
      if (!b.AccountNUmber.trim()) return `Please enter account number for Bank Account ${i + 1}`;
      if (!b.verified || !b.AccountholderName) return `Please verify Bank Account ${i + 1}`;
    }
    for (let i = 0; i < cheques.length; i++) {
      const c = cheques[i];
      if (!c.Chequeno.trim()) return `Please enter cheque number for Cheque ${i + 1}`;
      if (!c.ChequeImage) return `Please upload image for Cheque ${i + 1}`;
    }
    return null;
  };

  // ── Button press pe pehle sirf validation + confirm sheet, submit nahi ──
  const onPressNext = () => {
    const error = validateForm();
    if (error) {
      toast(error);
      return;
    }
    setShowConfirm(true);
  };

  // ── Confirm sheet me "Proceed" karne ke baad hi actual submit hota h ──
  // API bilkul wahi rakhi h jo pehle thi, sirf trigger point badla h.
  const processFinalSubmit = async () => {
    if (isSubmitting.current) return;

    isSubmitting.current = true;

    const payload = {
      idno: idno, // fresh form h to 0, warna ShowClientInsert wali id
      Gstnumber: gstNumber, // ── sirf backend se aaya hua, input nahi h
      bankinformationforradiantclients: banks.map(b => ({
        BankName: b.BankName,
        Type: 'Current',
        BranchName: b.BranchName,
        Ifsccode: b.Ifsccode,
        AccountNUmber: b.AccountNUmber,
        AccountholderName: b.AccountholderName,
      })),
      cancelchecqueforradiantclients: cheques.map(c => ({
        Chequeno: c.Chequeno,
        ChequeImage: c.ChequeImage, // base64 (naya upload) ya URL (unchanged prefill)
      })),
      Stepnumber: 'Final',
    };

    console.log('📤 PartnerBankDetailsUpdate REQUEST:', JSON.stringify(payload, null, 2));

    try {
      const res = await post({ url: APP_URLS.NewClientInsert, data: payload });
      console.log('📥 PartnerBankDetailsUpdate RESPONSE:', JSON.stringify(res, null, 2));

      if (res?.Content?.Status === true) {
        toast(res?.Content?.Message || 'Client registered successfully.');
        onNext();
      } else {
        toast(res?.Content?.Message || 'Submit failed. Try again.');
      }
    } catch (err) {
      console.log('❌ PartnerBankDetailsUpdate ERROR:', err);
      toast('Something went wrong. Try again.');
    } finally {
      isSubmitting.current = false;
    }
  };

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
        {/* ── Bank Accounts ── */}
        <SectionCard title="Bank Account Details" icon="bank" iconColor={stepColor}>
          {banks.map((bank, idx) => (
            <View key={idx} style={s.subBlock}>
              <View style={s.subBlockHeader}>
                <Text style={[s.subBlockTitle, { color: stepColor }]}>Bank Account {idx + 1}</Text>
                {banks.length > 1 && (
                  <TouchableOpacity onPress={() => removeBank(idx)}>
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Bank Name Picker (same list/modal jo BankAccountScreen me use hoti h) */}
              <View style={s.bankPickerWrap}>
                <Text style={s.bankPickerLabel}>
                  Bank Name <Text style={s.req}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[s.bankPickerBtn, { borderColor: bank.selectedBank ? stepColor : '#D1D5DB' }]}
                  onPress={() => openBankPicker(idx)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name="bank-outline"
                    size={16}
                    color={bank.selectedBank ? stepColor : '#9CA3AF'}
                  />
                  <Text style={[s.bankPickerText, bank.selectedBank && { color: '#1F2937' }]} numberOfLines={1}>
                    {bank.selectedBank ? bank.BankName : 'Select bank'}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <AppInput
                label="Branch Name"
                placeholder="Branch name"
                value={bank.BranchName}
                onChangeText={t => updateBank(idx, 'BranchName', t)}
              />
              <AppInput
                label="IFSC Code"
                placeholder="e.g. SBIN0001234"
                autoCapitalize="characters"
                value={bank.Ifsccode}
                onChangeText={t => {
                  updateBank(idx, 'Ifsccode', t.toUpperCase());
                  resetVerify(idx);
                }}
                maxLength={11}
              />
              <AppInput
                label="Account Number"
                placeholder="Enter account number"
                keyboardType="number-pad"
                value={bank.AccountNUmber}
                onChangeText={t => {
                  updateBank(idx, 'AccountNUmber', t.replace(/\D/g, ''));
                  resetVerify(idx);
                }}
              />

              {/* Verify Button — api/Radiant/AccountVerify */}
              <TouchableOpacity
                style={[s.verifyBtn, bank.verified ? s.verifyBtnDone : { borderColor: stepColor }]}
                onPress={() => handleVerify(idx)}
                disabled={bank.verifying || bank.verified}
                activeOpacity={0.8}
              >
                {bank.verifying ? (
                  <ActivityIndicator size="small" color={stepColor} />
                ) : (
                  <MaterialCommunityIcons
                    name={bank.verified ? 'check-circle' : 'bank-check'}
                    size={18}
                    color={bank.verified ? '#16A34A' : stepColor}
                  />
                )}
                <Text style={[s.verifyBtnText, { color: bank.verified ? '#16A34A' : stepColor }]}>
                  {bank.verifying ? 'Verifying...' : bank.verified ? 'Account Verified ✓' : 'Verify Account'}
                </Text>
              </TouchableOpacity>

              {/* Account Holder Name — sirf AccountVerify se aata h, readonly */}
              {bank.verified && (
                <AppInput
                  label="Account Holder Name"
                  value={bank.AccountholderName}
                  editable={false}
                />
              )}
            </View>
          ))}

          <TouchableOpacity style={[s.addBtn, { borderColor: stepColor }]} onPress={addBank}>
            <MaterialCommunityIcons name="plus-circle-outline" size={18} color={stepColor} />
            <Text style={[s.addBtnText, { color: stepColor }]}>Add Another Bank Account</Text>
          </TouchableOpacity>
        </SectionCard>

        {/* ── Cancelled Cheques ── */}
        <SectionCard title="Cancelled Cheques" icon="checkbook" iconColor={stepColor}>
          {cheques.map((cheque, idx) => (
            <View key={idx} style={s.subBlock}>
              <View style={s.subBlockHeader}>
                <Text style={[s.subBlockTitle, { color: stepColor }]}>Cheque {idx + 1}</Text>
                {cheques.length > 1 && (
                  <TouchableOpacity onPress={() => removeCheque(idx)}>
                    <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.error} />
                  </TouchableOpacity>
                )}
              </View>

              <AppInput
                label="Cheque Number"
                placeholder="Enter cheque number"
                keyboardType="number-pad"
                maxLength={CHEQUE_NO_MAX_LEN}
                value={cheque.Chequeno}
                onChangeText={t => updateCheque(idx, 'Chequeno', t.replace(/\D/g, '').slice(0, CHEQUE_NO_MAX_LEN))}
              />

              <Text style={s.docLabel}>Cheque Image</Text>
              <TouchableOpacity
                style={s.docBox}
                onPress={() =>
                  pickDoc(({ uri, base64 }) => {
                    updateCheque(idx, 'ChequeImage', base64);
                    updateCheque(idx, 'ChequeImagePreview', uri);
                  })
                }
              >
                {cheque.ChequeImagePreview ? (
                  <Image source={{ uri: cheque.ChequeImagePreview }} style={s.docPreview} />
                ) : (
                  <>
                    <MaterialCommunityIcons name="cloud-upload-outline" size={22} color={stepColor} />
                    <Text style={[s.docUploadText, { color: stepColor }]}>Upload Cheque Image</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity style={[s.addBtn, { borderColor: stepColor }]} onPress={addCheque}>
            <MaterialCommunityIcons name="plus-circle-outline" size={18} color={stepColor} />
            <Text style={[s.addBtnText, { color: stepColor }]}>Add Another Cheque</Text>
          </TouchableOpacity>
        </SectionCard>

        <NavRow
          onNext={onPressNext}
          nextLabel="Submit"
          stepColor={stepColor}
        />
      </ScrollView>

      {/* ── Confirm Sheet — DataPrivacyScreen jaisa hi ── */}
      <ConfirmSubmitSheet
        visible={showConfirm}
        onClose={() => setShowConfirm(false)}
        onProceed={async () => {
          setShowConfirm(false);
          await processFinalSubmit();
        }}
      />

      {/* ── Bank List Modal (same as BankAccountScreen) ── */}
      <BankListModal
        visible={isBankModalOpen}
        onClose={() => { setIsBankModalOpen(false); setActiveBankIdx(null); }}
        data={bankList}
        onSelect={onSelectBankForRow}
      />
    </View>
  );
};

export default PartnerBankDetailsScreen;

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light_blue },
  centered: { alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16, paddingBottom: 40 },

  req: { color: '#EF4444', fontWeight: '700' },

  subBlock: { backgroundColor: '#F6F7FB', borderRadius: 14, padding: 12, marginBottom: 12 },
  subBlockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  subBlockTitle: { fontSize: 13, fontWeight: '700' },

  // Bank picker
  bankPickerWrap: { marginBottom: 14 },
  bankPickerLabel: { fontSize: 13, color: '#374151', fontWeight: '500', marginBottom: 6 },
  bankPickerBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#F9FAFB' },
  bankPickerText: { flex: 1, fontSize: 13, color: '#9CA3AF' },

  // Verify button
  verifyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1.5, borderRadius: 10, paddingVertical: 13, marginTop: 6, backgroundColor: '#F9FAFB' },
  verifyBtnDone: { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  verifyBtnText: { fontSize: 14, fontWeight: '600' },

  addBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderStyle: 'dashed',
  },
  addBtnText: { fontSize: 13, fontWeight: '600', marginLeft: 6 },

  docLabel: { fontSize: 12, fontWeight: '600', color: colors.dark_gray, marginBottom: 6 },
  docBox: {
    height: 100, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed',
    backgroundColor: '#FAFBFC', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  docPreview: { width: '100%', height: '100%' },
  docUploadText: { fontSize: 12, marginTop: 6, fontWeight: '600' },

  helperWarn: { fontSize: 12, color: colors.error, textAlign: 'center', marginBottom: 10 },
});