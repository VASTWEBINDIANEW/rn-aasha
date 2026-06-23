import { NativeModules, Platform } from 'react-native';

const { CashWithdrawalModule } = NativeModules;

export interface CashWithdrawalParams {
  merchantId: string;
  merchantPassword: string;
  superMerchantId: string;
  amount: string;          // multiple of ₹100, min ₹100, max ₹5000
  latitude: number;
  longitude: number;
  partnerRequestId: string;  // unique per transaction
  readOnly?: boolean;        // amount fixed
  editable?: boolean;        // user can change amount
  emptyButton?: boolean;     // blank field
}

export interface CashWithdrawalResult {
  status: boolean;
  message: string;
  partnerRequestId: string;
  fingpayTxnId: string;
  timestamp: string;
  bankRrn: string;
  payerName: string;
  amount: string;
  payerVpa: string;
}

export const launchCashWithdrawal = async (
  params: CashWithdrawalParams
): Promise<CashWithdrawalResult> => {
  if (Platform.OS !== 'android') {
    throw new Error('UPI Cash Withdrawal SDK is Android only');
  }

  // Validation
  const amt = parseFloat(params.amount);
  if (isNaN(amt) || amt < 100 || amt > 5000 || amt % 100 !== 0) {
    throw new Error('Amount must be ₹100–₹5000 and multiple of ₹100');
  }

  if (!params.readOnly && !params.editable && !params.emptyButton) {
    throw new Error('At least one button mode (readOnly/editable/emptyButton) must be true');
  }

  return CashWithdrawalModule.launchSDK(params);
};