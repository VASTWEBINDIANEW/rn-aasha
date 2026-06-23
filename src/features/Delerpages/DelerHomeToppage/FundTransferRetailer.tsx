import React, { useCallback, useEffect, useState } from 'react';
import {
    View, StyleSheet, TouchableOpacity,
    Text, TextInput, ToastAndroid,
} from 'react-native';
import DynamicButton from '../../drawer/button/DynamicButton';
import FlotingInput from '../../drawer/securityPages/FlotingInput';
import OnelineDropdownSvg from '../../drawer/svgimgcomponents/simpledropdown';
import { hScale, SCREEN_HEIGHT, wScale } from '../../../utils/styles/dimensions';
import { colors } from '../../../utils/styles/theme';
import { BottomSheet } from '@rneui/themed';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import ClosseModalSvg2 from '../../drawer/svgimgcomponents/ClosseModal2';
import { FlashList } from '@shopify/flash-list';
import { encrypt } from '../../../utils/encryptionUtils';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import NoDatafound from '../../drawer/svgimgcomponents/Nodatafound';
import OTPModal from '../../../components/OTPModal';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import ShowLoader from '../../../components/ShowLoder';
import ShowEye from '../../drawer/HideShowImgBtn/ShowEye';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// ── Constants ────────────────────────────────────────────────────────────────
const PAYMENT_MODES = ['Cash', 'Credit', 'Branch/Cms Deposit', 'Online Transfer', 'Wallet', 'Charge Back'];
const PAYMENT_TYPES = ['NEFT', 'IMPS', 'RTGS', 'UPI', 'Same Bank'];
const API_TXN_URL  = 'api/data/jlklkj';

type ActiveSheet = 'retailer' | 'paymentMode' | 'dealerBank' | 'paymentType' | null;

// ── Helpers ───────────────────────────────────────────────────────────────────
const toast = (msg: string) => ToastAndroid.show(msg, ToastAndroid.BOTTOM);

/** Build the fixed hdMD* skeleton; caller fills in non-empty fields */
const basePayload = (enc: any, amount: string) => ({
    hdMDDLM:          enc.encryptedData[0] || '',
    hdPaymentMode:    enc.encryptedData[1] || '',
    hdPaymentAmount:  amount,
    hdMDDepositeSlipNo: '',
    hdMDTransferType:   '',
    hdMDcollection:     '',
    hdMDComments:       '',
    hdMDaccountno:      '',
    hdMDutrno:          '',
    hdMDwallet:         '',
    hdMDwalletno:       '',
    hdMDtransationno:   '',
    hdMDsettelment:     '',
    hdMDCreditDetail:   '',
    hdMDsubject:        '',
    hdMDBank:           '',
    txtcode:   enc.encryptedData[2] || '',
    transferid: enc.encryptedData[3] || '',
    value1: enc.keyEncode || '',
    value2: enc.ivEncode  || '',
});

// ── Component ─────────────────────────────────────────────────────────────────
const FundTransferRetailer = () => {
    const { userId } = useSelector((state: RootState) => state.userInfo);
    const { post, get } = useAxiosHook();
    const navigation = useNavigation<any>();

    // Form state
    const [retailerName, setRetailerName]   = useState('');
    const [retailerdata, setRetailerData]   = useState<any>({});
    const [paymentMode, setPaymentMode]     = useState('');
    const [paymenttype, setPaymentType]     = useState('');
    const [amount, setAmount]               = useState('');
    const [collectionBy, setCollectionBy]   = useState('');
    const [comment, setComment]             = useState('');
    const [selectBank, setSelectBan]        = useState('');
    const [BankName, setBankName]           = useState('');
    const [AccountNo, setAccountNo]         = useState('');
    const [Deposit, setDeposit]             = useState('');
    const [Wallet, setWallet]               = useState('');
    const [Walletn, setWalletn]             = useState('');
    const [WalletName, setWalletName]       = useState('');
    const [transaction, setTransaction]     = useState('');
    const [utrNo, setUtrNo]                 = useState('');
    const [Subject, setSubject]             = useState('');
    const [Pin, setPin]                     = useState('');
    const [txnId, setTxnId]                 = useState('');
    const [mobileOtp, setMobileOtp]         = useState('');

    // UI state
    const [isLoading, setIsLoading]             = useState(true);
    const [isSubmit, setIsSubmit]               = useState(false);
    const [secureEntry, setSecureEntry]         = useState(true);
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [activeSheet, setActiveSheet]         = useState<ActiveSheet>(null);
    const [searchQuery, setSearchQuery]         = useState('');

    // Data
    const [retailerList, setRetailerList]       = useState([]);
    const [dealerWALLlist, setDealerWALLlist]   = useState([]);
    const [dealerbanklist, setDealerBanklist]   = useState([]);
    const [cbStatus, setCBstatus]               = useState(false);

    // ── Init ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        const init = async () => {
            try {
                const [retailers, cbStat] = await Promise.all([
                    post({ url: APP_URLS.retailerlist }),
                    post({ url: APP_URLS.D_CB_status }),
                ]);
                setRetailerList(retailers);
                setCBstatus(cbStat?.status === 'Y');
            } catch (e) {
                console.error('Init error:', e);
            } finally {
                setIsLoading(false);
            }
        };
        init();
        fetchDealerBankList();
    }, []);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const clearAll = () => {
        setRetailerName(''); setRetailerData({});
        setPaymentMode(''); setPaymentType('');
        setAmount(''); setCollectionBy(''); setComment('');
        setBankName(''); setAccountNo(''); setDeposit('');
        setWallet(''); setWalletn(''); setWalletName('');
        setTransaction(''); setUtrNo('');
        setSubject(''); setPin(''); setTxnId('');
        setIsSubmit(false); setIsLoading(false);
    };

    const postTxn = async (data: object) => {
        const response = await post({ url: API_TXN_URL, data });
        if (response?.Response === 'Failed') {
            toast(response.Message);
        } else {
            alert(response?.Message);
            clearAll();
        }
    };

    // ── Fetch dealer bank/wallet list ─────────────────────────────────────────
    const fetchDealerBankList = async () => {
        try {
            const response = await get({ url: 'api/data/DealerBankList' });
            const channel = response?.DealerBankwalletlist?.bindALLWallet?.channel;
            if (!channel) throw new Error('channel not found');
            setDealerWALLlist(channel.dealerbanklist   || []);
            setDealerBanklist(channel.DealerWalletlist || []);
        } catch (e) {
            console.error('DealerBankList error:', e.message);
        }
    };

    // ── Step 1: Get Unique ID (common for all modes) ──────────────────────────
    const getUniqueId = async () => {
        if (!amount || !retailerdata?.UserID || !paymentMode || !comment) {
            return toast('Please complete all fields');
        }
        setIsLoading(true);
        try {
            const response = await get({ url: 'api/data/dlm_to_Rem_Generate_Unique_ID' });
            if (response) {
                const id = response.Message;
                setTxnId(id);
                setIsSubmit(true);
                // Charge Back with OTP disabled → go direct
                if (paymentMode === 'Charge Back' && !cbStatus) {
                    await submitCB(id);
                }
            }
        } catch (e) {
            console.error('UniqueId error:', e);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Step 2: Submit by payment mode ───────────────────────────────────────
    const submitByMode = async () => {
        setIsLoading(true);
        try {
            switch (paymentMode) {

                case 'Cash':
                case 'Credit': {
                    if (!Pin || !txnId) return toast('Please fill all required fields');
                    const enc = await encrypt([retailerdata.UserID, paymentMode, Pin, txnId, collectionBy, comment]);
                    const data = {
                        ...basePayload(enc, amount),
                        hdMDcollection: enc.encryptedData[4] || '',
                        hdMDComments:   enc.encryptedData[5] || '',
                    };
                    await postTxn(data);
                    break;
                }

                case 'Branch/Cms Deposit': {
                    if (!Pin || !txnId || !AccountNo || !BankName || !Deposit)
                        return toast('Please fill all required fields');
                    const enc = await encrypt([retailerdata.UserID, paymentMode, Pin, txnId, AccountNo, comment, BankName, Deposit]);
                    const data = {
                        ...basePayload(enc, amount),
                        hdMDDepositeSlipNo: enc.encryptedData[7] || '',
                        hdMDComments:       enc.encryptedData[5] || '',
                        hdMDaccountno:      enc.encryptedData[4] || '',
                        hdMDBank:           enc.encryptedData[6] || '',
                    };
                    await postTxn(data);
                    break;
                }

                case 'Online Transfer': {
                    if (!Pin || !txnId || !AccountNo || !utrNo || !BankName || !paymenttype)
                        return toast('Please fill all required fields');
                    const enc = await encrypt([retailerdata.UserID, paymentMode, Pin, txnId, AccountNo, utrNo, BankName, paymenttype]);
                    const data = {
                        ...basePayload(enc, amount),
                        hdMDTransferType: enc.encryptedData[7] || '',
                        hdMDaccountno:    enc.encryptedData[4] || '',
                        hdMDutrno:        enc.encryptedData[5] || '',
                        hdMDBank:         enc.encryptedData[6] || '',
                    };
                    await postTxn(data);
                    break;
                }

                case 'Wallet': {
                    if (!Pin || !Wallet || !Walletn || !transaction || !paymenttype)
                        return toast('Please fill all required fields');
                    const enc = await encrypt([retailerdata.UserID, paymentMode, Pin, txnId, Wallet, Walletn, paymenttype, transaction]);
                    const data = {
                        ...basePayload(enc, amount),
                        hdMDwallet:       enc.encryptedData[4] || '',
                        hdMDwalletno:     enc.encryptedData[5] || '',
                        hdMDtransationno: enc.encryptedData[7] || '',
                        hdMDBank:         enc.encryptedData[6] || '',
                    };
                    await postTxn(data);
                    break;
                }

                case 'Charge Back':
                    // 🔥 FIX: Agar OTP verify hone ke baad isSubmit true ho chuka hai, toh final transaction submit karo.
                    if (isSubmit) {
                        await submitCB(txnId);
                    } else {
                        await handleChargeBack();
                    }
                    break;

                default:
                    toast('Invalid payment mode');
            }
        } catch (e) {
            console.error('submitByMode error:', e);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Charge Back flow ──────────────────────────────────────────────────────
    const submitCB = useCallback(async (txnIdParam: string) => {
        if (!retailerdata?.UserID || !paymentMode || !Subject || !comment) {
            toast('Please fill all required fields');
            return;
        }
        if (!amount || isNaN(Number(amount))) {
            toast('Please provide a valid amount');
            return;
        }
        setIsLoading(true);
        try {
            const enc = await encrypt([retailerdata.UserID, paymentMode, Pin, txnIdParam, Subject, comment]);
            const data = {
                ...basePayload(enc, amount),
                hdMDComments: enc.encryptedData[5] || '',
                hdMDsubject:  enc.encryptedData[4] || '',
            };
            await postTxn(data);
        } finally {
            setIsLoading(false);
        }
    }, [retailerdata, paymentMode, Pin, Subject, comment, amount]);

    const handleChargeBack = async () => {
        try {
            const status = await post({ url: 'api/data/CheckOTPChargebackonoff' });
            if (status?.status !== 'Y') {
                // OTP required nahi hai toh seedhe submit process par bhejo
                await submitCB(txnId);
                return;
            }
            
            // Instantly modal open karo bina wait kiye
            setIsSubmit(false);
            setOtpModalVisible(true);

            // Background mein OTP bhejenge
            const res = await post({ url: APP_URLS.send_y_D_CB_otp + retailerdata?.UserID });
            if (!res) {
                setOtpModalVisible(false);
                toast('Failed to send OTP');
            }
        } catch (e) {
            console.error('ChargeBack error:', e);
            setOtpModalVisible(false);
        }
    };

    const verifyOtpAndSubmit = async () => {
        try {
            const res = await post({ url: APP_URLS.verify_D_CB_otp + mobileOtp });
            if (res === 'Wrong OTP') {
                toast('Wrong OTP');
            } else {
                setOtpModalVisible(false);
                setMobileOtp('');
                // OTP verify hone ke baad unique ID mangayenge aur confirm transaction (PIN screen) kholenge
                await getUniqueId();
            }
        } catch (e) {
            console.error('OTP verify error:', e);
        }
    };

    // ── Main button handler ───────────────────────────────────────────────────
    const onMainButtonPress = () => {
        if (isSubmit || (paymentMode === 'Charge Back' && cbStatus)) {
            submitByMode();
        } else {
            getUniqueId();
        }
    };

    const mainButtonTitle = () => {
        if (paymentMode === 'Charge Back' && cbStatus && !isSubmit) return 'Get OTP';
        return isSubmit ? 'Confirm Transfer' : 'Submit';
    };

    // ── Search/filter ─────────────────────────────────────────────────────────
    const filteredList = (data: any[]) => {
        if (!searchQuery) return data;
        const q = searchQuery.toLowerCase();
        return data.filter(item => {
            if (typeof item === 'string') return item.toLowerCase().includes(q);
            return (
                item.Name?.toLowerCase().includes(q) ||
                item.firmName?.toLowerCase().includes(q) ||
                item.Mobile?.toLowerCase().includes(q) ||
                item.banknm?.toLowerCase().includes(q) ||
                item.walletname?.toLowerCase().includes(q)
            );
        });
    };

    const closeSheet = () => {
        setActiveSheet(null);
        setSearchQuery('');
    };

    // ── Bottom sheet list renderers ───────────────────────────────────────────
    const SheetList = ({ data, renderItem }: { data: any[]; renderItem: any }) => {
        const filtered = filteredList(data);
        return filtered.length === 0
            ? <NoDatafound />
            : <FlashList data={filtered} renderItem={renderItem} estimatedItemSize={50} />;
    };

    // ── JSX ───────────────────────────────────────────────────────────────────
    return (
        <View style={{ flex: 1, backgroundColor: 'white' }}>
            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
                enableOnAndroid
                extraScrollHeight={130}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>

                    {/* Select Retailer */}
                    <TouchableOpacity onPress={() => setActiveSheet('retailer')}>
                        <FlotingInput editable={false} label="Select Retailer" value={retailerName} />
                        <View style={styles.righticon}><OnelineDropdownSvg /></View>
                    </TouchableOpacity>

                    {/* Select Payment Mode */}
                    <TouchableOpacity onPress={() => setActiveSheet('paymentMode')}>
                        <FlotingInput editable={false} label="Select Payment Mode" value={paymentMode} />
                        <View style={styles.righticon}><OnelineDropdownSvg /></View>
                    </TouchableOpacity>

                    {/* Online Transfer → Payment Type */}
                    {paymentMode === 'Online Transfer' && (
                        <TouchableOpacity onPress={() => setActiveSheet('paymentType')}>
                            <FlotingInput editable={false} label="Select Payment Type" value={paymenttype} />
                            <View style={styles.righticon}><OnelineDropdownSvg /></View>
                        </TouchableOpacity>
                    )}

                    {/* Branch / Online → Dealer Bank + Account No */}
                    {(paymentMode === 'Branch/Cms Deposit' || paymentMode === 'Online Transfer') && (
                        <>
                            <TouchableOpacity onPress={() => setActiveSheet('dealerBank')}>
                                <FlotingInput editable={false} label="Select Dealer Bank" value={BankName} />
                                <View style={styles.righticon}><OnelineDropdownSvg /></View>
                            </TouchableOpacity>
                            <FlotingInput
                                label="Account No."
                                value={AccountNo}
                                keyboardType="number-pad"
                                onChangeTextCallback={setAccountNo}
                            />
                        </>
                    )}

                    {/* Online Transfer → UTR No */}
                    {paymentMode === 'Online Transfer' && (
                        <FlotingInput
                            label="UTR No."
                            value={utrNo}
                            keyboardType="number-pad"
                            onChangeTextCallback={setUtrNo}
                        />
                    )}

                    {/* Branch → Deposit Slip */}
                    {paymentMode === 'Branch/Cms Deposit' && (
                        <FlotingInput
                            label="Deposit Slip No"
                            value={Deposit}
                            keyboardType="number-pad"
                            onChangeTextCallback={setDeposit}
                        />
                    )}

                    {/* Wallet → Wallet selector + fields */}
                    {paymentMode === 'Wallet' && (
                        <>
                            <TouchableOpacity onPress={() => setActiveSheet('dealerBank')}>
                                <FlotingInput editable={false} label="Select Wallet" value={WalletName} />
                                <View style={styles.righticon}><OnelineDropdownSvg /></View>
                            </TouchableOpacity>
                            <FlotingInput
                                label="Wallet No."
                                value={Walletn}
                                editable={false}
                                keyboardType="number-pad"
                                onChangeTextCallback={setWalletn}
                            />
                            <FlotingInput
                                label="Transaction No."
                                value={transaction}
                                keyboardType="number-pad"
                                onChangeTextCallback={setTransaction}
                            />
                        </>
                    )}

                    {/* Amount — always visible */}
                    <FlotingInput
                        label="Enter Amount"
                        value={amount}
                        keyboardType="number-pad"
                        maxLength={10}
                        onChangeTextCallback={setAmount}
                    />

                    {/* Charge Back → Subject */}
                    {paymentMode === 'Charge Back' && (
                        <FlotingInput
                            label="Subject (Reason)"
                            value={Subject}
                            onChangeTextCallback={setSubject}
                        />
                    )}

                    {/* Cash → Collection By */}
                    {paymentMode === 'Cash' && (
                        <FlotingInput
                            label="Collection By"
                            value={collectionBy}
                            onChangeTextCallback={setCollectionBy}
                        />
                    )}

                    {/* Comment — except Online Transfer */}
                    {paymentMode !== 'Online Transfer' && (
                        <FlotingInput
                            label="Comment"
                            value={comment}
                            onChangeTextCallback={setComment}
                        />
                    )}

                    {/* After Submit/OTP Verification: show readonly info + PIN */}
                    {isSubmit && (
                        <>
                            <FlotingInput label="Transaction ID" value={txnId} editable={false} onChangeTextCallback={setTxnId} />
                            <FlotingInput
                                label="Old Credit ₹"
                                value={retailerdata.currentcr === 0 ? '₹ 0' : `₹ ${retailerdata.currentcr}`}
                                editable={false}
                            />
                            <FlotingInput
                                label="Remaining Balance ₹"
                                value={retailerdata.RemainAmt === 0 ? '₹ 0' : `₹ ${retailerdata.RemainAmt}`}
                                editable={false}
                            />
                            <FlotingInput
                                label="Mobile"
                                value={retailerdata.Mobile ?? ''}
                                editable={false}
                            />
                            <View>
                                <FlotingInput
                                    label="Enter Trans Pin"
                                    value={Pin}
                                    onChangeTextCallback={setPin}
                                    inputstyle={{ fontSize: 22 }}
                                    keyboardType="number-pad"
                                    secureTextEntry={secureEntry}
                                />
                                {Pin.length >= 4 && (
                                    <View style={styles.righticon}>
                                        <TouchableOpacity
                                            onPressIn={() => setSecureEntry(false)}
                                            onPressOut={() => setSecureEntry(true)}
                                        >
                                            <ShowEye color1="green" color2="red" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </>
                    )}

                    {isLoading && <ShowLoader />}

                    <DynamicButton title={mainButtonTitle()} onPress={onMainButtonPress} />
                </View>

                {/* OTP Modal */}
                <OTPModal
                    setShowOtpModal={setOtpModalVisible}
                    disabled={mobileOtp.length !== 4}
                    showOtpModal={otpModalVisible}
                    setMobileOtp={setMobileOtp}
                    setEmailOtp={null}
                    inputCount={4}
                    verifyOtp={verifyOtpAndSubmit}
                />

                {/* ── Bottom Sheet: Select Retailer or Payment Mode ── */}
                <BottomSheet animationType="none" isVisible={activeSheet === 'retailer' || activeSheet === 'paymentMode'}>
                    <View style={styles.bottomsheetview}>
                        <View style={[styles.StateTitle, { backgroundColor: '#A870B7' }]}>
                            <View style={styles.titleview}>
                                <Text style={styles.stateTitletext}>
                                    {activeSheet === 'paymentMode' ? 'Select Payment Mode' : 'Select Retailer'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={closeSheet} activeOpacity={0.7}>
                                <ClosseModalSvg2 />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            placeholder={activeSheet === 'retailer' ? 'Search by Name / Firm / Mobile...' : 'Search'}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={styles.searchBar}
                            placeholderTextColor={colors.black75}
                            cursorColor={colors.black}
                        />
                        {activeSheet === 'retailer' ? (
                            <SheetList
                                data={retailerList}
                                renderItem={({ item }: any) => (
                                    <TouchableOpacity
                                        style={styles.operatorview}
                                        onPress={() => {
                                            setRetailerData(item);
                                            setRetailerName(item.Name);
                                            setIsSubmit(false);
                                            closeSheet();
                                        }}
                                    >
                                        <Text style={styles.operatornametext}>
                                            {`${item.Name}\n${item.firmName}\n${item.Mobile}\nMain Balance: ${item.RemainAmt}\nCredit: ${item.currentcr}`}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />
                        ) : (
                            <SheetList
                                data={PAYMENT_MODES}
                                renderItem={({ item }: any) => (
                                    <TouchableOpacity
                                        style={styles.operatorview}
                                        onPress={() => {
                                            setPaymentMode(item);
                                            setIsSubmit(false);
                                            closeSheet();
                                        }}
                                    >
                                        <Text style={styles.operatornametext}>{item}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </View>
                </BottomSheet>

                {/* ── Bottom Sheet: Dealer Bank / Wallet ── */}
                <BottomSheet animationType="none" isVisible={activeSheet === 'dealerBank'}>
                    <View style={styles.bottomsheetview}>
                        <View style={[styles.StateTitle, { backgroundColor: '#A870B7' }]}>
                            <View style={styles.titleview}>
                                <Text style={styles.stateTitletext}>
                                    {paymentMode === 'Wallet' ? 'Select Distributor Wallet' : 'Select Distributor Bank'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={closeSheet} activeOpacity={0.7}>
                                <ClosseModalSvg2 />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            placeholder="Search..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={styles.searchBar}
                            placeholderTextColor={colors.black75}
                            cursorColor={colors.black}
                        />
                        <SheetList
                            data={paymentMode === 'Wallet' ? dealerWALLlist : dealerbanklist}
                            renderItem={({ item }: any) => (
                                <TouchableOpacity
                                    style={styles.operatorview}
                                    onPress={() => {
                                        if (paymentMode === 'Wallet') {
                                            setWallet(item.walletname);
                                            setWalletn(item.walletno);
                                            setWalletName(item.walletname);
                                        } else {
                                            setBankName(item.banknm);
                                            setSelectBan(item.banknm);
                                        }
                                        closeSheet();
                                    }}
                                >
                                    <Text numberOfLines={1} ellipsizeMode="tail" style={styles.operatornametext}>
                                        {paymentMode === 'Wallet' ? item.walletname : item.banknm}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </BottomSheet>

                {/* ── Bottom Sheet: Payment Type ── */}
                <BottomSheet animationType="none" isVisible={activeSheet === 'paymentType'}>
                    <View style={styles.bottomsheetview}>
                        <View style={[styles.StateTitle, { backgroundColor: '#A870B7' }]}>
                            <View style={styles.titleview}>
                                <Text style={styles.stateTitletext}>Select Payment Type</Text>
                            </View>
                            <TouchableOpacity onPress={closeSheet} activeOpacity={0.7}>
                                <ClosseModalSvg2 />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            placeholder="Search..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            style={styles.searchBar}
                            placeholderTextColor={colors.black75}
                            cursorColor={colors.black}
                        />
                        <SheetList
                            data={PAYMENT_TYPES}
                            renderItem={({ item }: any) => (
                                <TouchableOpacity
                                    style={styles.operatorview}
                                    onPress={() => {
                                        setPaymentType(item);
                                        closeSheet();
                                    }}
                                >
                                    <Text numberOfLines={1} style={styles.operatornametext}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </BottomSheet>

            </KeyboardAwareScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    righticon: {
        position: 'absolute',
        left: 'auto',
        right: wScale(12),
        top: 0,
        height: '85%',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: wScale(12),
    },
    operatornametext: {
        textTransform: 'capitalize',
        fontSize: wScale(15),
        color: '#000',
        flex: 1,
        borderBottomColor: '#000',
        borderBottomWidth: wScale(0.5),
        paddingVertical: hScale(15),
        marginHorizontal: wScale(10),
    },
    bottomsheetview: {
        backgroundColor: '#fff',
        height: SCREEN_HEIGHT / 1.3,
        borderTopLeftRadius: hScale(15),
        borderTopRightRadius: hScale(15),
    },
    StateTitle: {
        paddingVertical: hScale(10),
        borderTopLeftRadius: hScale(15),
        borderTopRightRadius: hScale(15),
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: wScale(10),
        marginBottom: hScale(10),
    },
    stateTitletext: {
        fontSize: wScale(22),
        color: '#000',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    titleview: {
        flex: 1,
        alignItems: 'center',
    },
    searchBar: {
        borderColor: 'gray',
        borderWidth: wScale(1),
        paddingHorizontal: wScale(15),
        marginHorizontal: wScale(10),
        marginBottom: hScale(10),
        borderRadius: 5,
        color: colors.black75,
        fontSize: wScale(16),
    },
    operatorview: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingHorizontal: wScale(10),
    },
});

export default FundTransferRetailer;