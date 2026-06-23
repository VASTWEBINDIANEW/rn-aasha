import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { launchCashWithdrawal } from '../../../utils/CashWithdrawalSDK';

const quickAmounts = ['100', '500', '2000', '5000'];

const CashWithdrawalScreen = () => {
  const [amount, setAmount] = useState('500');
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState<any>(null);

  const handleWithdrawal = async () => {
    const parsedAmount = parseInt(amount, 10);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid withdrawal amount (Minimum ₹1).');
      return;
    }

    setLoading(true);
    setResponseData(null);

    try {
      const result = await launchCashWithdrawal({
        merchantId: '9509727198LK',
        merchantPassword: '12345',
        superMerchantId: '229',
        amount: amount.toString(),
        latitude: 26.9124,
        longitude: 75.7873,
        partnerRequestId: `TXN_${Date.now()}`,
        readOnly: true,
      });

      console.log('Withdrawal result:', result);
      setResponseData(result);

      if (result.status) {
        Alert.alert(
          'Withdrawal Successful',
          `Txn ID: ${result.fingpayTxnId}\nRRN: ${result.bankRrn}`,
        );
      } else {
        Alert.alert('Transaction Failed', result.message || 'Something went wrong. Please try again.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.headerCard}>
            <View style={styles.headerIconWrap}>
              <Text style={styles.headerIcon}>₹</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Cash Withdrawal</Text>
              <Text style={styles.headerSub}>Withdraw via UPI / Biometric</Text>
            </View>
          </View>

          {/* ── Amount Input Card ── */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>ENTER WITHDRAWAL AMOUNT</Text>

            <View style={styles.amountRow}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0"
                placeholderTextColor="#3A3F5C"
                keyboardType="number-pad"
                value={amount}
                onChangeText={text => setAmount(text.replace(/[^0-9]/g, ''))}
                maxLength={6}
                editable={!loading}
              />
            </View>

            {/* Quick Amount Chips */}
            <View style={styles.chipsRow}>
              {quickAmounts.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, amount === item && styles.chipActive]}
                  onPress={() => setAmount(item)}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, amount === item && styles.chipTextActive]}>
                    + ₹{parseInt(item, 10).toLocaleString('en-IN')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* ── Transaction Info Card ── */}
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>TRANSACTION DETAILS</Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Merchant ID</Text>
              <Text style={styles.infoValue}>9509727198LK</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>26.9124, 75.7873</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Amount lock</Text>
              <Text style={[styles.infoValue, styles.greenText]}>Read-only in SDK</Text>
            </View>
          </View>

          {/* ── Response / Receipt Card ── */}
          {responseData && (
            <View
              style={[
                styles.card,
                styles.receiptCard,
                responseData.status ? styles.receiptSuccess : styles.receiptFailed,
              ]}
            >
              {/* Receipt Header */}
              <View style={styles.receiptHeader}>
                <View
                  style={[
                    styles.statusDot,
                    responseData.status ? styles.statusDotSuccess : styles.statusDotFailed,
                  ]}
                >
                  <Text style={styles.statusDotText}>{responseData.status ? '✓' : '✗'}</Text>
                </View>
                <View>
                  <Text
                    style={[
                      styles.receiptTitle,
                      responseData.status ? styles.greenText : styles.redText,
                    ]}
                  >
                    {responseData.status ? 'Transaction Successful' : 'Transaction Failed'}
                  </Text>
                  <Text style={styles.receiptSub}>{responseData.message || ''}</Text>
                </View>
              </View>

              {/* Amount prominent */}
              {responseData.status && (
                <>
                  <View style={styles.receiptAmountBlock}>
                    <Text style={styles.receiptAmountLabel}>Amount Withdrawn</Text>
                    <Text style={styles.receiptAmountValue}>
                      ₹{parseFloat(responseData.amount || amount).toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                  </View>

                  <View style={styles.dashedDivider} />

                  <View style={styles.receiptDetails}>
                    <ReceiptRow label="Txn ID" value={responseData.fingpayTxnId} mono />
                    <ReceiptRow label="Bank RRN" value={responseData.bankRrn} mono />
                    <ReceiptRow label="Payer VPA" value={responseData.payerVpa} mono />
                    <ReceiptRow label="Payer Name" value={responseData.payerName} />
                    <ReceiptRow label="Status" value="SUCCESS" green />
                  </View>
                </>
              )}
            </View>
          )}

          {/* ── Proceed Button ── */}
          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleWithdrawal}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>PROCEED TO WITHDRAW</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ── Small helper component for receipt rows ──
const ReceiptRow = ({
  label,
  value,
  mono,
  green,
}: {
  label: string;
  value?: string;
  mono?: boolean;
  green?: boolean;
}) => (
  <View style={styles.receiptRow}>
    <Text style={styles.receiptKey}>{label}</Text>
    <Text
      style={[
        styles.receiptVal,
        mono && styles.monoFont,
        green && styles.greenText,
      ]}
    >
      {value || '—'}
    </Text>
  </View>
);

export default CashWithdrawalScreen;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: '#0A0D1A',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },

  // ── Header ──
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0,82,255,0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(0,82,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: { fontSize: 22, color: '#6A9FFF', fontWeight: '600' },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF' },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 },

  // ── Cards ──
  card: {
    backgroundColor: '#0F1326',
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 20,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1,
    marginBottom: 16,
  },

  // ── Amount Input ──
  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingBottom: 14,
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 30,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.4)',
    marginRight: 6,
  },
  amountInput: {
    flex: 1,
    fontSize: 42,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingVertical: 0,
    letterSpacing: -1,
  },

  // ── Chips ──
  chipsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
  },
  chipActive: {
    backgroundColor: 'rgba(0,82,255,0.2)',
    borderColor: 'rgba(0,82,255,0.6)',
  },
  chipText: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.5)' },
  chipTextActive: { color: '#6A9FFF' },

  // ── Info rows ──
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },
  infoValue: { fontSize: 13, fontWeight: '500', color: 'rgba(255,255,255,0.85)' },
  divider: { height: 0.5, backgroundColor: 'rgba(255,255,255,0.07)', marginVertical: 10 },

  // ── Receipt Card ──
  receiptCard: { padding: 0, overflow: 'hidden' },
  receiptSuccess: { borderColor: 'rgba(61,204,126,0.25)' },
  receiptFailed: { borderColor: 'rgba(226,75,74,0.25)' },

  receiptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  statusDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDotSuccess: {
    backgroundColor: 'rgba(61,204,126,0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(61,204,126,0.4)',
  },
  statusDotFailed: {
    backgroundColor: 'rgba(226,75,74,0.15)',
    borderWidth: 0.5,
    borderColor: 'rgba(226,75,74,0.4)',
  },
  statusDotText: { fontSize: 14, color: '#fff' },
  receiptTitle: { fontSize: 14, fontWeight: '600' },
  receiptSub: { fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 },

  receiptAmountBlock: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  receiptAmountLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  receiptAmountValue: {
    fontSize: 32,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },

  dashedDivider: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.08)',
    marginHorizontal: 16,
  },

  receiptDetails: { padding: 16, gap: 10 },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  receiptKey: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  receiptVal: { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.8)' },
  monoFont: { fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },

  // ── Colors ──
  greenText: { color: '#3DCC7E' },
  redText: { color: '#E24B4A' },

  // ── Button ──
  btn: {
    backgroundColor: '#0052FF',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnDisabled: { backgroundColor: '#2A2F4A' },
  btnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});