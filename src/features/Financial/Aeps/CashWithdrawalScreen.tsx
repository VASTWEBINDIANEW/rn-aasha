import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    StyleSheet, Alert, ActivityIndicator,
    NativeModules,
    Modal
} from 'react-native';
import useAxiosHook from '../../../utils/network/AxiosClient';
import Constants from './constants';
import { useSelector } from 'react-redux';
import { APP_URLS } from '../../../utils/network/urls';
import { translate } from '../../../utils/languageUtils/I18n';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { RootState } from '../../../reduxUtils/store';

const CashWithdrawalScreen = () => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const { colorConfig, Loc_Data, deviceInfo, signUpId, signUpPassword } = useSelector((state: RootState) => state.userInfo);
    const [showEkycModal, setShowEkycModal] = useState(false);
    const navigation = useNavigation<any>();
    const themeColor = '#1FAA59';
    const themeBg = '#FFFDE7';


    // Quick amount buttons
    const quickAmounts = ['100', '200', '500', '1000', '2000', '5000'];

    const validateAmount = () => {
        if (!amount || amount.trim() === '') {
            Alert.alert('Error', 'Please enter Amount');
            return false;
        }
        const num = parseInt(amount);
        if (isNaN(num) || num <= 0) {
            Alert.alert('Error', 'Please enter a valid amount');
            return false;
        }
        if (num < 100) {
            Alert.alert('Error', 'Enter Minimum amount ₹100');
            return false;
        }
        if (num > 5000) {
            Alert.alert('Error', 'Enter Maximum amount ₹5,000');
            return false;
        }
        if (num % 100 !== 0) {
            Alert.alert('Error', 'Amount should be in multiples of ₹100');
            return false;
        }
        return true;
    };
    const { FingpaySDK } = NativeModules;
    const { post, get } = useAxiosHook();
    const [isProcessing, setIsProcessing] = useState(false);

    const CheckEkyc = useCallback(async () => {
        console.log('FingpaySDK module:', NativeModules.FingpaySDK);
        try {

            setIsProcessing(true);

            const finalUrl = APP_URLS.checkekyc;
            console.log('Calling URL:', finalUrl);

            const response = await get({ url: finalUrl });
            console.log('eKYC RESPONSE:', response);

            if (typeof response === 'string' && response.includes('<!DOCTYPE html>')) {
                throw new Error('Server Error (404/500)');
            }

            const status = response?.Status;
            const message = response?.Message || response;

            if (status === true || message === 'DONE') {
                return;
            }
            if (
                message === '2FAREQUIRED'
            ) {
                return;
            }
            if (message === 'REQUIREDOTP') {
                setShowEkycModal(true);
                return;
            }

            if (message === 'REQUIREDSCAN') {
                navigation.replace('Aepsekycscan');
                return;
            }

            if (message === 'APPROVAL-PENDING') {
                Alert.alert(
                    'Approval Pending',
                    'Your eKYC approval is pending. Please wait for admin approval.'
                );
                return;
            }

            Alert.alert(
                translate('notice') || 'Notice',
                message || 'Unknown Status',
                [{ text: 'Go Back', onPress: () => navigation.goBack() }]
            );

        } catch (e: any) {
            console.log('EKYC ERROR:', e);
            Alert.alert('API Error', e?.message || 'Internal Server Error');
        } finally {
            setIsProcessing(false);
        }
    }, [get, navigation]);  // ✅ dependencies yahan

    // ✅ useEffect — sirf call karo, hook define mat karo
    useEffect(() => {
        CheckEkyc();
    }, [CheckEkyc]);


    const startWithdrawal = async () => {
        if (!validateAmount()) return;

        setLoading(true);
        try {
            // const finalUrl = 'AEPS/api/Aeps/Merchantinfo';
            // const response = await post({ url: finalUrl });
            // console.log('=== MERCHANT INFO ===', JSON.stringify(response, null, 2));
if(!Loc_Data?.latitude){
    console.log('=== LOCATION DATA ===', Loc_Data);
    return Alert.alert('Location Error', 'Please enable location services to proceed.');
}
            const sdkParams = {
                merchantId: "9509727198LK",
                merchantPassword: Constants.FINGPAY.merchantPassword, // ← secretKey ki jagah yeh
                superMerchantId: Constants.FINGPAY.SUPER_MERCHANT_ID,
                amount: amount,
                latitude: parseFloat(Loc_Data?.latitude),
                longitude: parseFloat(Loc_Data?.longitude),
                txnId: 'TXN' + Date.now(),  // PARTNER_REQUEST_ID ke roop mein jayega
                readOnly: true,
                editable: false,
                emptyButton: false,
                primaryColor: colorConfig.primaryColor,
                secondaryColor: colorConfig.secondaryColor,
                primaryButtonColor: colorConfig.primaryButtonColor,
                secondaryButtonColor: colorConfig.secondaryButtonColor,
                labelColor: colorConfig.labelColor,
            };
            console.log('=== SDK PARAMS ===', JSON.stringify(sdkParams, null, 2));

            const result = await FingpaySDK.startCashWithdrawal(sdkParams);
            console.log('=== SDK RESULT ===', JSON.stringify(result, null, 2));

            if (result.message === 'cancelled' || result.message === 'error') {
                console.log('User cancelled or error');
                return;
            }

            if (result.status) {
                Alert.alert(
                    'Transaction Successful! ✅',
                    `Amount: ₹${result.amount}\n` +
                    `Payer: ${result.payerName}\n` +
                    `VPA: ${result.payerVpa}\n` +
                    `Bank RRN: ${result.bankRrn}\n` +
                    `Fingpay TxnId: ${result.fingpayTxnId}\n` +
                    `Payer TxnId: ${result.partnerRequestId}`,
                );
            } else {
                Alert.alert('Transaction Failed ❌', result.message);
            }

        } catch (error) {
            console.log('=== ERROR ===', error);
            Alert.alert('Failed', 'Transaction failed. try again.');
        } finally {
            setLoading(false);
        }
    };



    const checkTransactionStatus = async (
        fingpayTxnId: string,
        partnerRequestId: string
    ) => {
        try {
            console.log('=== STATUS CHECK ===', { fingpayTxnId, partnerRequestId });

            const statusResponse = await post({
                url: 'upicw/api/upicw/partner/check/status', // ← apne backend ka URL daalo
                data: {
                    fingpayTxnId: fingpayTxnId,
                    partnerRequestId: partnerRequestId,
                }
            });

            console.log('=== STATUS RESPONSE ===', JSON.stringify(statusResponse, null, 2));

            const txnData = statusResponse?.data;
            const txnStatus = txnData?.txnStatus;

            if (txnStatus === 'SUCCESS') {
                // ✅ Transaction confirmed
                Alert.alert(
                    'Transaction Successful! ✅',
                    `Amount: ₹${txnData?.payerAmount}\n` +
                    `Payer: ${txnData?.payerName}\n` +
                    `VPA: ${txnData?.payerVpa}\n` +
                    `Bank RRN: ${txnData?.bankRrn}\n` +
                    `Fingpay TxnId: ${txnData?.fingpayTransactionId}\n` +
                    `Date: ${txnData?.transactionDate}`
                );

            } else if (txnStatus === 'PENDING') {
                // ⏳ Abhi pending — 5 second baad retry karo
                Alert.alert(
                    'Transaction Pending ⏳',
                    'Transaction process ho rahi hai. Thoda wait karo.',
                    [
                        {
                            text: 'Check Again',
                            onPress: () => {
                                setTimeout(() => {
                                    checkTransactionStatus(fingpayTxnId, partnerRequestId);
                                }, 5000); // 5 second baad retry
                            }
                        },
                        {
                            text: 'OK',
                            style: 'cancel'
                        }
                    ]
                );

            } else {
                // ❌ FAILED
                Alert.alert(
                    'Transaction Failed ❌',
                    txnData?.bankResponseMessage || 'Transaction fail ho gayi.'
                );
            }

        } catch (error) {
            console.log('=== STATUS CHECK ERROR ===', error);
            // Status check fail hone par bhi SDK ka result dikhao
            Alert.alert(
                'Transaction Successful! ✅',
                'Transaction complete hui — status verify nahi ho saki.'
            );
        }
    };
    return (
        <View style={styles.container}>

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerIconWrap}>
                    <Text style={styles.headerIcon}>💸</Text>
                </View>
                <Text style={styles.title}>UPI Cash Withdrawal</Text>
                <Text style={styles.subtitle}>Enter amount to generate QR code</Text>
            </View>

            {/* Amount Card */}
            <View style={styles.amountCard}>
                <Text style={styles.amountLabel}>Withdrawal Amount</Text>
                <View style={styles.inputWrapper}>
                    <Text style={styles.rupeeSign}>₹</Text>
                    <TextInput
                        style={styles.input}
                        value={amount}
                        onChangeText={(val) => setAmount(val.replace(/[^0-9]/g, ''))}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#C5C5C5"
                        maxLength={5}
                    />
                </View>
                <View style={styles.divider} />

                {/* Quick Amount Buttons */}
                <Text style={styles.quickLabel}>Quick Select</Text>
                <View style={styles.quickRow}>
                    {quickAmounts.map((amt) => (
                        <TouchableOpacity
                            key={amt}
                            style={[
                                styles.quickBtn,
                                amount === amt && styles.quickBtnActive
                            ]}
                            onPress={() => setAmount(amt)}
                            activeOpacity={0.7}
                        >
                            <Text style={[
                                styles.quickBtnText,
                                amount === amt && styles.quickBtnTextActive
                            ]}>
                                ₹{amt}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
                <View style={styles.infoRow}>
                    <View style={[styles.infoDot, { backgroundColor: '#1FAA59' }]} />
                    <Text style={styles.infoText}>Minimum withdrawal: <Text style={styles.infoTextBold}>₹100</Text></Text>
                </View>
                <View style={styles.infoRow}>
                    <View style={[styles.infoDot, { backgroundColor: '#F59E0B' }]} />
                    <Text style={styles.infoText}>Maximum withdrawal: <Text style={styles.infoTextBold}>₹10,000</Text></Text>
                </View>
                <View style={styles.infoRow}>
                    <View style={[styles.infoDot, { backgroundColor: '#6366F1' }]} />
                    <Text style={styles.infoText}>Amount must be in <Text style={styles.infoTextBold}>multiples of ₹100</Text></Text>
                </View>
                <View style={styles.infoRow}>
                    <View style={[styles.infoDot, { backgroundColor: '#3B82F6' }]} />
                    <Text style={styles.infoText}>QR code valid for <Text style={styles.infoTextBold}>10 minutes</Text></Text>
                </View>
            </View>

            {/* Proceed Button */}
            <TouchableOpacity
                style={[
                    styles.proceedBtn,
                    (!amount || loading) && styles.proceedBtnDisabled
                ]}
                onPress={startWithdrawal}
                disabled={!amount || loading}
                activeOpacity={0.85}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" size="small" />
                ) : (
                    <View style={styles.proceedBtnInner}>
                        <Text style={styles.proceedBtnText}>
                            Proceed
                        </Text>
                        {amount ? (
                            <View style={styles.proceedAmountBadge}>
                                <Text style={styles.proceedAmountText}>₹{amount}</Text>
                            </View>
                        ) : null}
                    </View>
                )}
            </TouchableOpacity>

            {/* eKYC Modal */}
            <Modal
                visible={showEkycModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowEkycModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalCard}>
                        <View style={[styles.modalTopBar, { backgroundColor: themeColor }]} />
                        <View style={[styles.modalIconCircle, { backgroundColor: '#E8F8EF' }]}>
                            <Text style={{ fontSize: wScale(28) }}>🔔</Text>
                        </View>
                        <Text style={[styles.modalTitle, { color: themeColor }]}>
                            {translate('Required') || 'Action Required'}
                        </Text>
                        <Text style={styles.modalBody}>
                            {translate('key_thisaeps_147') ||
                                'Please complete your e-KYC to proceed with this service.'}
                        </Text>
                        <View style={styles.modalRow}>
                            <TouchableOpacity
                                style={styles.modalCancelBtn}
                                onPress={() => setShowEkycModal(false)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.modalCancelText}>
                                    {translate('cancel') || 'Cancel'}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalPrimaryBtn, { backgroundColor: themeColor }]}
                                onPress={() => {
                                    setShowEkycModal(false);
                                    navigation.replace('Aepsekyc');
                                }}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.modalPrimaryText}>
                                    {translate('Complete_eKYC') || 'Complete eKYC'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const PRIMARY = '#1FAA59';
const PRIMARY_LIGHT = '#E8F8EF';
const PURPLE = '#6366F1';
const PURPLE_LIGHT = '#EEF2FF';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F6F7FB',
        paddingHorizontal: wScale(20),
        paddingTop: hScale(16),
    },

    // Header
    header: {
        alignItems: 'center',
        marginBottom: hScale(20),
    },
    headerIconWrap: {
        width: wScale(56),
        height: wScale(56),
        borderRadius: wScale(28),
        backgroundColor: PRIMARY_LIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: hScale(10),
    },
    headerIcon: {
        fontSize: wScale(26),
    },
    title: {
        fontSize: wScale(20),
        fontWeight: '700',
        color: '#1A1A2E',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: wScale(13),
        color: '#9CA3AF',
        marginTop: hScale(4),
        textAlign: 'center',
    },

    // Amount Card
    amountCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: wScale(20),
        padding: wScale(20),
        marginBottom: hScale(14),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    amountLabel: {
        fontSize: wScale(12),
        color: '#9CA3AF',
        fontWeight: '500',
        letterSpacing: 0.5,
        marginBottom: hScale(8),
        textTransform: 'uppercase',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: hScale(4),
    },
    rupeeSign: {
        fontSize: wScale(36),
        fontWeight: '700',
        color: PRIMARY,
        marginRight: wScale(6),
        lineHeight: wScale(52),
    },
    input: {
        flex: 1,
        fontSize: wScale(48),
        fontWeight: '700',
        color: '#1A1A2E',
        padding: 0,
    },
    divider: {
        height: 2,
        backgroundColor: PRIMARY,
        borderRadius: 2,
        marginBottom: hScale(18),
        opacity: 0.3,
    },

    // Quick Amounts
    quickLabel: {
        fontSize: wScale(12),
        color: '#9CA3AF',
        fontWeight: '500',
        letterSpacing: 0.5,
        marginBottom: hScale(10),
        textTransform: 'uppercase',
    },
    quickRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wScale(8),
    },
    quickBtn: {
        paddingHorizontal: wScale(14),
        paddingVertical: hScale(7),
        borderRadius: wScale(20),
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
    },
    quickBtnActive: {
        backgroundColor: PRIMARY,
        borderColor: PRIMARY,
    },
    quickBtnText: {
        fontSize: wScale(13),
        color: '#6B7280',
        fontWeight: '600',
    },
    quickBtnTextActive: {
        color: '#FFFFFF',
    },

    // Info Box
    infoBox: {
        backgroundColor: '#FFFFFF',
        borderRadius: wScale(16),
        padding: wScale(16),
        marginBottom: hScale(20),
        gap: hScale(10),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wScale(10),
    },
    infoDot: {
        width: wScale(7),
        height: wScale(7),
        borderRadius: wScale(4),
    },
    infoText: {
        fontSize: wScale(13),
        color: '#6B7280',
        lineHeight: wScale(18),
    },
    infoTextBold: {
        fontWeight: '700',
        color: '#374151',
    },

    // Proceed Button
    proceedBtn: {
        backgroundColor: PRIMARY,
        borderRadius: wScale(16),
        paddingVertical: hScale(16),
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    proceedBtnDisabled: {
        backgroundColor: '#D1D5DB',
        shadowOpacity: 0,
        elevation: 0,
    },
    proceedBtnInner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wScale(10),
    },
    proceedBtnText: {
        color: '#FFFFFF',
        fontSize: wScale(16),
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    proceedAmountBadge: {
        backgroundColor: 'rgba(255,255,255,0.25)',
        borderRadius: wScale(20),
        paddingHorizontal: wScale(12),
        paddingVertical: hScale(3),
    },
    proceedAmountText: {
        color: '#FFFFFF',
        fontSize: wScale(14),
        fontWeight: '700',
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: wScale(24),
    },
    modalCard: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: wScale(24),
        padding: wScale(24),
        alignItems: 'center',
        overflow: 'hidden',
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
    },
    modalTopBar: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: hScale(5),
    },
    modalIconCircle: {
        width: wScale(64),
        height: wScale(64),
        borderRadius: wScale(32),
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: hScale(12),
        marginBottom: hScale(14),
    },
    modalTitle: {
        fontSize: wScale(18),
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: hScale(8),
    },
    modalBody: {
        fontSize: wScale(13),
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: wScale(20),
        marginBottom: hScale(24),
    },
    modalRow: {
        flexDirection: 'row',
        width: '100%',
        gap: wScale(10),
    },
    modalCancelBtn: {
        flex: 1,
        height: hScale(46),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: wScale(14),
        borderWidth: 1.5,
        borderColor: '#E5E7EB',
        backgroundColor: '#F9FAFB',
    },
    modalCancelText: {
        color: '#6B7280',
        fontWeight: '600',
        fontSize: wScale(14),
    },
    modalPrimaryBtn: {
        flex: 1.6,
        height: hScale(46),
        borderRadius: wScale(14),
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalPrimaryText: {
        color: '#FFFFFF',
        fontWeight: '700',
        fontSize: wScale(14),
    },
});

export default CashWithdrawalScreen;