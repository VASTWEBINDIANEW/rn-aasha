import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import { BottomSheet } from '@rneui/themed';
import { FlashList } from '@shopify/flash-list';
import { TabView, TabBar } from 'react-native-tab-view';
import { useSelector } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import useAxiosHook from '../../utils/network/AxiosClient';
import { decryptData } from '../../utils/encryptionUtils';
import { SCREEN_WIDTH, hScale, wScale } from '../../utils/styles/dimensions';
import { translate } from '../../utils/languageUtils/I18n';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import FlotingInput from '../drawer/securityPages/FlotingInput';
import OnelineDropdownSvg from '../drawer/svgimgcomponents/simpledropdown';
import DynamicButton from '../drawer/button/DynamicButton';
import ShowLoader from '../../components/ShowLoder';

// ─── Types ───────────────────────────────────────────────────────────────────

type SheetType = 'method' | 'account' | null;

interface Balance {
  posremain: string;
  remainbal: string;
}

interface BankItem {
  BankAccountNo: string;
  AcconutHolderName: string;
  BankName: string;
}

interface FormData {
  amount: string;
  paymentMethod: string;
  selectedAccNo: string;
  transactionPin: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const PAYMENT_METHODS = ['IMPS', 'NEFT'];

const INITIAL_FORM: FormData = {
  amount: '',
  paymentMethod: 'IMPS',
  selectedAccNo: '',
  transactionPin: '',
};

// ─── Sub-components (defined outside to prevent re-render) ───────────────────

const BalanceCard = ({ label, amount }: { label: string; amount: string }) => (
  <View style={styles.balItem}>
    <Text style={styles.balLabel}>{label}</Text>
    <Text style={styles.balAmount}>₹{amount}</Text>
  </View>
);

const SectionLabel = ({ text }: { text: string }) => (
  <Text style={styles.sectionLabel}>{text}</Text>
);

const Selector = ({
  value,
  onPress,
}: {
  value: string;
  onPress: () => void;
}) => (
  <TouchableOpacity style={styles.selector} onPress={onPress} activeOpacity={0.7}>
    <Text style={styles.selectorText}>{value}</Text>
    <OnelineDropdownSvg />
  </TouchableOpacity>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const PostoMain = () => {
  const { colorConfig } = useSelector((s: any) => s.userInfo);
  const themeColor: string = colorConfig?.primaryColor || '#0A84FF';
  const { get, post } = useAxiosHook();

  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sheetType, setSheetType] = useState<SheetType>(null);
  const [bankList, setBankList] = useState<BankItem[]>([]);
  const [balance, setBalance] = useState<Balance>({ posremain: '0', remainbal: '0.00' });
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM);

  const routes = useMemo(
    () => [
      { key: 'bank', title: 'To Bank' },
      { key: 'mainWallet', title: 'Wallet' },
      { key: 'distributor', title: 'Distributor' },
    ],
    [],
  );

  // ─── Data Loading ────────────────────────────────────────────────────────────

  const loadInitialData = useCallback(async () => {
    try {
      const [bankRes, balRes] = await Promise.all([
        get({ url: 'WalletUnload/api/data/ShowbankdetailsforWalletToBank' }),
        get({ url: 'Retailer/api/data/Show_ALL_balanceremRem' }),
      ]);
      if (balRes?.data?.[0]) setBalance(balRes.data[0]);
      if (bankRes?.vvvv) {
        const decrypted = JSON.parse(
          decryptData(bankRes.vvvv, bankRes.kkkk, bankRes.bankdetails),
        );
        setBankList(decrypted?.data || []);
      }
    } catch (err) {
      console.error('Data Load Error:', err);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // ─── Form Helpers ────────────────────────────────────────────────────────────

  const updateForm = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const resetPostTransfer = useCallback(() => {
    setFormData(prev => ({ ...prev, amount: '', transactionPin: '' }));
  }, []);

  const closeSheet = useCallback(() => setSheetType(null), []);

  // ─── Transfer Logic ───────────────────────────────────────────────────────────

  const handleTransfer = useCallback(async () => {
    const { amount, paymentMethod, selectedAccNo, transactionPin } = formData;
    const currentKey = routes[index].key;

    if (!amount || parseFloat(amount) <= 0) {
      return Alert.alert('Invalid Amount', 'Please enter a valid amount.');
    }
    if (currentKey === 'bank' && (!selectedAccNo || !transactionPin)) {
      return Alert.alert('Missing Info', 'Please select a bank account and enter your PIN.');
    }

    setLoading(true);
    try {
      if (currentKey === 'bank') {
        const initRes = await post({
          url: `WalletUnload/api/data/GenerateWalletTransectiongenerateid?Amount=${amount}&Type=${paymentMethod}&AccountNo=${selectedAccNo}`,
        });
        if (initRes?.sts === 'Success') {
          const finalRes = await post({
            url: `WalletUnload/api/data/AddWalletToBankRequest?Amount=${amount}&Type=${paymentMethod}&transid=${initRes.transferid}&dmtpin=${transactionPin}&BankAccountNo=${selectedAccNo}`,
          });
          Alert.alert('Status', finalRes?.Message || 'Request Processed');
          resetPostTransfer();
        } else {
          Alert.alert('Process Failed', initRes?.msg || 'Could not initiate transfer.');
        }
      } else {
        const url =
          currentKey === 'mainWallet'
            ? `MPOS/api/mPos/pos_to_Wallet_TransferAmount?amount=${amount}`
            : `MPOS/api/mPos/pos_to_Distributor_TransferAmount?amount=${amount}`;
        const res = await post({ url });
        Alert.alert(res?.Status || 'Success', res?.msg || 'Transfer request submitted');
        updateForm('amount', '');
      }
      loadInitialData();
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [formData, index, routes, loadInitialData, resetPostTransfer, updateForm]);

  // ─── Tab Scene ────────────────────────────────────────────────────────────────

  const renderScene = useCallback(
    ({ route }: { route: { key: string } }) => (
      <KeyboardAwareScrollView
        contentContainerStyle={styles.sceneContent}
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >
        {/* Amount Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>💸</Text>
            <Text style={styles.cardTitle}>{translate('Enter_Amount')}</Text>
          </View>
          <FlotingInput
            label="₹ Enter amount"
            value={formData.amount}
            onChangeTextCallback={(v: string) => updateForm('amount', v)}
            keyboardType="number-pad"
          />
        </View>

        {/* Bank-specific fields */}
        {route.key === 'bank' && (
          <View style={[styles.card, styles.cardSpaced]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🏦</Text>
              <Text style={styles.cardTitle}>Bank Details</Text>
            </View>

            <SectionLabel text={translate('Payment_Method')} />
            <Selector
              value={formData.paymentMethod}
              onPress={() => setSheetType('method')}
            />

            <SectionLabel text={translate('Bank_Account')} />
            <Selector
              value={
                formData.selectedAccNo
                  ? `**** ${formData.selectedAccNo.slice(-4)}`
                  : 'Choose Account'
              }
              onPress={() => setSheetType('account')}
            />

            <SectionLabel text={translate('Transaction_PIN')} />
            <FlotingInput
              label="Security PIN"
              value={formData.transactionPin}
              onChangeTextCallback={(v: string) => updateForm('transactionPin', v)}
              secureTextEntry
              keyboardType="number-pad"
            />

          </View>
        )}
{loading && <ShowLoader/>}
        {/* Proceed Button */}
        {/* <TouchableOpacity
          activeOpacity={0.85}
          disabled={loading || !formData.amount}
          onPress={handleTransfer}
          style={[
            styles.primaryBtn,
            { backgroundColor: loading || !formData.amount ? '#C7C7CC' : themeColor },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.btnText}>PROCEED</Text>
            </>
          )}
        </TouchableOpacity> */}

        <DynamicButton
        title={loading ? <ActivityIndicator size={30} />:"Next"}
        onPress={()=>handleTransfer()}
        />
      </KeyboardAwareScrollView>
    ),
    [formData, loading, themeColor, handleTransfer, updateForm],
  );

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColor }]}>
        <AppBarSecond title="Money Transfer" titlestyle={styles.headerTitle} />
        <View style={styles.balanceRow}>
          <BalanceCard label="POS BALANCE" amount={balance.posremain} />
          <View style={styles.balDivider} />
          <BalanceCard label="MAIN WALLET" amount={balance.remainbal} />
        </View>
      </View>

      {/* Tabs */}
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: SCREEN_WIDTH }}
        renderTabBar={props => (
          <TabBar
            {...props}
            indicatorStyle={[styles.tabIndicator, { backgroundColor: themeColor }]}
            style={styles.tabBar}
            activeColor={themeColor}
            inactiveColor="#8E8E93"
            labelStyle={styles.tabLabel}
          />
        )}
      />

      {/* Bottom Sheet */}
      <BottomSheet
        animationType="none"
        isVisible={!!sheetType}
        onBackdropPress={closeSheet}
        containerStyle={styles.sheetOverlay}
      >
        <View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.sheetTitle}>
            {sheetType === 'method' ? translate('Select Method') : translate('Select Bank Account')}
          </Text>

          {sheetType === 'method' ? (
            PAYMENT_METHODS.map(method => (
              <TouchableOpacity
                key={method}
                style={styles.sheetItem}
                activeOpacity={0.7}
                onPress={() => {
                  updateForm('paymentMethod', method);
                  closeSheet();
                }}
              >
                <View style={styles.sheetItemInner}>
                  <Text style={styles.sheetItemText}>{method}</Text>
                  {formData.paymentMethod === method && (
                    <Text style={[styles.sheetCheck, { color: themeColor }]}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.flashListWrap}>
              <FlashList
                data={bankList}
                estimatedItemSize={70}
                keyExtractor={item => item.BankAccountNo}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.sheetItem}
                    activeOpacity={0.7}
                    onPress={() => {
                      updateForm('selectedAccNo', item.BankAccountNo);
                      closeSheet();
                    }}
                  >
                    <Text style={styles.sheetItemText}>{item.AcconutHolderName}</Text>
                    <Text style={styles.sheetSubText}>
                      {item.BankName} • {item.BankAccountNo}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default React.memo(PostoMain);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },

  // Header
  header: {
    paddingBottom: hScale(20),
    borderBottomLeftRadius: wScale(28),
    borderBottomRightRadius: wScale(28),
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  headerTitle: {
    color: '#FFF',
    fontWeight: '700',
  },
  balanceRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginHorizontal: wScale(16),
    borderRadius: wScale(18),
    padding: hScale(14),
    marginTop: hScale(10),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  balItem: { flex: 1, alignItems: 'center' },
  balLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: wScale(9),
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  balAmount: {
    color: '#FFF',
    fontSize: wScale(18),
    fontWeight: '800',
    marginTop: hScale(4),
  },
  balDivider: {
    width: 1,
    height: hScale(34),
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  // Tabs
  tabBar: {
    backgroundColor: '#FFF',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E5EA',
  },
  tabIndicator: {
    height: 3,
    borderRadius: 2,
  },
  tabLabel: {
    fontWeight: '700',
    fontSize: wScale(12),
    textTransform: 'none',
  },

  // Scene
  sceneContent: {
    padding: wScale(16),
    paddingBottom: hScale(40),
  },

  // Cards
  card: {
    bottom:hScale(10),
    backgroundColor: '#FFF',
    borderRadius: wScale(20),
    padding: wScale(18),
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  cardSpaced: {
    marginTop: hScale(14),
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hScale(14),
    gap: wScale(8),
  },
  cardIcon: {
    fontSize: wScale(18),
  },
  cardTitle: {
    fontSize: wScale(15),
    fontWeight: '700',
    color: '#1C1C1E',
  },

  // Section label inside card
  sectionLabel: {
    fontSize: wScale(10),
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginBottom: hScale(6),
    marginTop: hScale(8),
  },

  // Selector
  selector: {
    backgroundColor: '#F2F2F7',
    paddingVertical: hScale(14),
    paddingHorizontal: wScale(14),
    borderRadius: wScale(12),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hScale(4),
  },
  selectorText: {
    fontSize: wScale(14),
    color: '#1C1C1E',
    fontWeight: '500',
  },

  // Button
  primaryBtn: {
    height: hScale(54),
    borderRadius: wScale(16),
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hScale(24),
    gap: wScale(8),
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8 },
      android: { elevation: 3 },
    }),
  },
  btnText: {
    color: '#FFF',
    fontSize: wScale(14),
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  btnArrow: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: wScale(16),
    fontWeight: '700',
  },

  // Bottom Sheet
  sheetOverlay: {
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#FFF',
    padding: wScale(20),
    borderTopLeftRadius: wScale(24),
    borderTopRightRadius: wScale(24),
    minHeight: hScale(280),
  },
  sheetHandle: {
    width: wScale(36),
    height: hScale(4),
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    alignSelf: 'center',
    marginBottom: hScale(18),
  },
  sheetTitle: {
    fontSize: wScale(16),
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: hScale(14),
    textAlign: 'center',
  },
  sheetItem: {
    paddingVertical: hScale(13),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F2F2F7',
  },
  sheetItemInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sheetItemText: {
    fontSize: wScale(15),
    fontWeight: '600',
    color: '#1C1C1E',
  },
  sheetSubText: {
    fontSize: wScale(12),
    color: '#8E8E93',
    marginTop: hScale(2),
  },
  sheetCheck: {
    fontSize: wScale(16),
    fontWeight: '700',
  },
  flashListWrap: {
    height: hScale(300),
  },
});