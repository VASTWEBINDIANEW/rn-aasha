import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, ToastAndroid } from 'react-native';
import { useSelector } from 'react-redux';
import axios from 'axios';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { translate } from "../../../utils/languageUtils/I18n";

const DealerAddWalletAndAddAcc = () => {
  const authToken = useSelector((state: any) => state.userInfo.authToken);
  const { get, post } = useAxiosHook();

  const [bankForm, setBankForm] = useState({ bankName: '', ifscCode: '', accountHolderName: '', accountNo: '', branch: '', accountType: '', city: '' });
  const [walletForm, setWalletForm] = useState({ walletHolderName: '', walletNo: '', walletName: '' });
  
  const [wallets, setWallets] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(false);
  const [activeForm, setActiveForm] = useState<null | 'bank' | 'wallet'>(null);

  const getAddedWallets = async () => {
    try {
      setLoading(true);
      const response = await get({ url: APP_URLS.getDealerAddedWalletAndBanks });
      if (response?.Walletlis) {
        setWallets(response.Walletlis);
        setBanks(response.banklist || []);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { getAddedWallets(); }, []);

  const handleBankAccountSave = async () => {
    const { bankName, ifscCode, accountHolderName, accountNo, branch, accountType, city } = bankForm;
    if (Object.values(bankForm).some(val => !val)) {
      Alert.alert('Error', translate('key_pleasefil_72') || 'Please fill all details');
      return;
    }
    setLoading2(true);
    try {
      const res = await get({
        url: `${APP_URLS.Add_dealer_Bank}Banknm=${bankName}&BranchName=${branch}&ifsccode=${ifscCode}&accountno=${accountNo}&accounttype=${accountType}&accountholder=${accountHolderName}&City=${city}`,
      });
      if (res?.status === 'Success') {
        ToastAndroid.show('Account added successfully', ToastAndroid.SHORT);
        setBankForm({ bankName: '', ifscCode: '', accountHolderName: '', accountNo: '', branch: '', accountType: '', city: '' });
        setActiveForm(null);
        getAddedWallets();
      } else {
        ToastAndroid.show('Failed to add account', ToastAndroid.SHORT);
      }
    } catch {
      ToastAndroid.show('An error occurred', ToastAndroid.SHORT);
    } finally {
      setLoading2(false);
    }
  };

  const handleWalletSave = async () => {
    const { walletName, walletNo, walletHolderName } = walletForm;
    if (!walletHolderName || !walletNo || !walletName) {
      Alert.alert('Error', 'Please fill all details');
      return;
    }
    setLoading2(true);
    try {
      const res = await post({ url: `${APP_URLS.Add_dealer_Wallet}walletnm=${walletName}&walletno=${walletNo}&walletholdername=${walletHolderName}` });
      if (res?.status === 'success') {
        ToastAndroid.show('Wallet added successfully', ToastAndroid.SHORT);
        setWalletForm({ walletHolderName: '', walletNo: '', walletName: '' });
        setActiveForm(null);
        getAddedWallets();
      } else {
        ToastAndroid.show('Failed to add wallet', ToastAndroid.SHORT);
      }
    } catch {
      ToastAndroid.show('An error occurred', ToastAndroid.SHORT);
    } finally {
      setLoading2(false);
    }
  };

  const onDelete = async (deleteId: any) => {
    try {
      const url = `https://native.${APP_URLS.baseWebUrl}${APP_URLS.Delete_dealer_Wallet}`;
      const response = await axios.delete(url, {
        headers: { 'Accept': 'application/json', 'Authorization': `Bearer ${authToken}` },
        params: { id: deleteId },
      });
      if (response?.data?.status === 'success') {
        Alert.alert('Success', 'Deleted successfully');
        getAddedWallets();
      } else {
        Alert.alert('Error', 'Could not delete');
      }
    } catch {
      ToastAndroid.show('Data Not Found', ToastAndroid.SHORT);
    }
  };

  const renderDetailRow = (label: string, value: string) => (
    <View style={styles.detailRow}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value || 'N/A'}</Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.main} showsVerticalScrollIndicator={false}>
      
      {/* --- BANK SECTION --- */}
      <TouchableOpacity 
        style={[styles.toggleBtn, activeForm === 'bank' && styles.activeToggle]} 
        onPress={() => setActiveForm(activeForm === 'bank' ? null : 'bank')}
      >
        <Text style={[styles.toggleBtnText, activeForm === 'bank' && styles.activeToggleText]}>
          {activeForm === 'bank' ? '✕ Close Bank Form' : 'Add Bank Account +'}
        </Text>
      </TouchableOpacity>

      {activeForm === 'bank' && (
        <View style={styles.formCard}>
          {['Bank Name', 'IFSC Code', 'Account Holder Name', 'Account No', 'Branch', 'Account Type', 'City'].map((placeholder, idx) => {
            const keys = ['bankName', 'ifscCode', 'accountHolderName', 'accountNo', 'branch', 'accountType', 'city'];
            return (
              <TextInput
                key={placeholder}
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#94A3B8"
                value={(bankForm as any)[keys[idx]]}
                keyboardType={idx === 3 ? 'number-pad' : 'default'}
                onChangeText={(text) => setBankForm({ ...bankForm, [keys[idx]]: text })}
              />
            );
          })}
          <TouchableOpacity style={styles.submitBtn} onPress={handleBankAccountSave} disabled={loading2}>
            {loading2 ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Bank Details</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* --- WALLET SECTION --- */}
      <TouchableOpacity 
        style={[styles.toggleBtn, activeForm === 'wallet' && styles.activeToggle]} 
        onPress={() => setActiveForm(activeForm === 'wallet' ? null : 'wallet')}
      >
        <Text style={[styles.toggleBtnText, activeForm === 'wallet' && styles.activeToggleText]}>
          {activeForm === 'wallet' ? '✕ Close Wallet Form' : 'Add Wallet +'}
        </Text>
      </TouchableOpacity>

      {activeForm === 'wallet' && (
        <View style={styles.formCard}>
          {['Wallet Holder Name', 'Wallet No', 'Wallet Name'].map((placeholder, idx) => {
            const keys = ['walletHolderName', 'walletNo', 'walletName'];
            return (
              <TextInput
                key={placeholder}
                style={styles.input}
                placeholder={placeholder}
                placeholderTextColor="#94A3B8"
                value={(walletForm as any)[keys[idx]]}
                keyboardType={idx === 1 ? 'number-pad' : 'default'}
                onChangeText={(text) => setWalletForm({ ...walletForm, [keys[idx]]: text })}
              />
            );
          })}
          <TouchableOpacity style={styles.submitBtn} onPress={handleWalletSave} disabled={loading2}>
            {loading2 ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Wallet Details</Text>}
          </TouchableOpacity>
        </View>
      )}

      {/* --- DISPLAY LISTS --- */}
      {!activeForm && (
        <View style={styles.listSection}>
          {loading ? (
            <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
          ) : (
            <>
              {/* Banks List */}
              <Text style={styles.sectionHeading}>{translate("Available_Banks")}</Text>
              {banks.length === 0 ? <Text style={styles.emptyText}>{translate("No_Banks_Available")}</Text> : 
                banks.map((item: any, index) => (
                  <View key={item.idno || index} style={styles.dataCard}>
                    {renderDetailRow(translate("Account_Holder_Name"), item.holdername)}
                    {renderDetailRow(translate("Bank_Name"), item.banknm)}
                    {renderDetailRow(translate("Branch_Name"), item.branch_nm)}
                    {renderDetailRow(translate("Account_Number"), item.acno)}
                    {renderDetailRow(translate("IFSC_Code"), item.ifsccode)}
                    {renderDetailRow(translate("Account_Type"), item.actype)}
                    <TouchableOpacity onPress={() => onDelete(item.idno)} style={styles.deleteBtn}>
                      <Text style={styles.deleteBtnText}>Remove Account</Text>
                    </TouchableOpacity>
                  </View>
                ))
              }

              {/* Wallets List */}
              <Text style={[styles.sectionHeading, { marginTop: hScale(24) }]}>{translate("Available_Wallets")}</Text>
              {wallets.length === 0 ? <Text style={styles.emptyText}>{translate("No_Wallets_Available")}</Text> : 
                wallets.map((item: any, index) => (
                  <View key={item.walletid || index} style={styles.dataCard}>
                    {renderDetailRow(translate("Wallet_Name"), item.walletname)}
                    {renderDetailRow(translate("Wallet_Holder"), item.walletholdername)}
                    {renderDetailRow(translate("Wallet_No"), item.walletno)}
                    <TouchableOpacity onPress={() => onDelete(item.walletid)} style={styles.deleteBtn}>
                      <Text style={styles.deleteBtnText}>Remove Wallet</Text>
                    </TouchableOpacity>
                  </View>
                ))
              }
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  main: {
    padding: wScale(16),
    backgroundColor: '#F8FAFC',
    paddingBottom: hScale(60),
  },
  toggleBtn: {
    backgroundColor: '#FFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingVertical: hScale(14),
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: hScale(12),
    shadowColor: '#0F172A',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 2,
  },
  activeToggle: {
    backgroundColor: '#F1F5F9',
    borderColor: '#94A3B8',
  },
  toggleBtnText: {
    color: '#0F172A',
    fontSize: wScale(14),
    fontWeight: '600',
  },
  activeToggleText: {
    color: '#475569',
  },
  formCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: wScale(16),
    marginBottom: hScale(20),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  input: {
    height: hScale(46),
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: hScale(12),
    paddingHorizontal: wScale(14),
    fontSize: wScale(14),
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  submitBtn: {
    backgroundColor: '#4F46E5', // Indigo color for primary actions
    paddingVertical: hScale(12),
    borderRadius: 10,
    alignItems: 'center',
    marginTop: hScale(6),
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: wScale(14),
    fontWeight: '600',
  },
  listSection: {
    marginTop: hScale(10),
  },
  sectionHeading: {
    fontSize: wScale(15),
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: hScale(12),
    letterSpacing: -0.2,
  },
  emptyText: {
    fontSize: wScale(13),
    color: '#64748B',
    textAlign: 'center',
    paddingVertical: hScale(16),
  },
  dataCard: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: wScale(14),
    marginBottom: hScale(14),
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hScale(6),
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  rowLabel: {
    fontSize: wScale(12.5),
    color: '#64748B',
    fontWeight: '500',
  },
  rowValue: {
    fontSize: wScale(13),
    color: '#0F172A',
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
    paddingVertical: hScale(8),
    borderRadius: 8,
    alignItems: 'center',
    marginTop: hScale(12),
  },
  deleteBtnText: {
    color: '#EF4444',
    fontSize: wScale(12.5),
    fontWeight: '600',
  },
});

export default DealerAddWalletAndAddAcc;