import { translate } from "../../utils/languageUtils/I18n";
import React, { useEffect, useState, useCallback } from "react";
import {
    TouchableOpacity, View, Text, StyleSheet, ScrollView,
    Alert, PermissionsAndroid, Keyboard, ToastAndroid, Platform
} from "react-native";
import useAxiosHook from "../../utils/network/AxiosClient";
import { APP_URLS } from "../../utils/network/urls";
import { hScale, wScale } from "../../utils/styles/dimensions";
import FlotingInput from "../drawer/securityPages/FlotingInput";
import BankBottomSite from "../../components/BankBottomSite";
import OnelineDropdownSvg from "../drawer/svgimgcomponents/simpledropdown";
import { useDeviceInfoHook } from "../../utils/hooks/useDeviceInfoHook";
import { useSelector } from "react-redux";
import { RootState } from "../../reduxUtils/store";
import DynamicButton from "../drawer/button/DynamicButton";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";
import { openSettings } from "react-native-permissions";
import ShowLoader from "../../components/ShowLoder";
import { DotLoader } from "../../components/DotLoader ";
import CheckSvg from "../drawer/svgimgcomponents/CheckSvg";
import CloseSvg from "../drawer/svgimgcomponents/CloseSvg";
import { BottomSheet } from "@rneui/themed";
import ClosseModalSvg2 from "../drawer/svgimgcomponents/ClosseModal2";
import OTPModal from "../../components/OTPModal";
import { useLocationHook } from "../../hooks/useLocationHook";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AepsAddAccount = () => {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);

    const PRIMARY = colorConfig.secondaryColor || '#0EA5E9';
    const PRIMARY_LIGHT = `${PRIMARY}14`;
    const PRIMARY_MID = `${PRIMARY}30`;

    const { get, post } = useAxiosHook();
    const [banklist, setBanklist] = useState([]);
    const [bank, setBank] = useState('');
    const [bankid, setBankid] = useState('');
    const [isBank, setIsBank] = useState(false);
    const [loading, setLoading] = useState(false);
    const [ifsccode, setIfsccode] = useState('');
    const [acnNumber, setAcnNumber] = useState('');
    const [name, setName] = useState('');
    const [branch, setBranch] = useState('');
    const [Addresss, setAddresss] = useState('');
    const [bankAcclist, setBankAcclist] = useState<any>({});
    const [Pincod, setPincode] = useState('');
    const [city, setCity] = useState('');
    const [add, setAdd] = useState(false);
    const [idno, setidno] = useState('');
    const [base64Img, setbase64Img] = useState<any>(null);
    const [isLoading, setisLoading] = useState(false);
    const [isotp, setIsOtp] = useState(false);
    const [otp, setOtp] = useState('');
    const { latitude, longitude } = useLocationHook();
    const { getNetworkCarrier, getMobileDeviceId, getMobileIp } = useDeviceInfoHook();
const insets = useSafeAreaInsets()
    const uploadDoCx = async (bs64, idno) => {
        setisLoading(true);
        try {
            const response = await fetch(`http://${APP_URLS.baseWebUrl}/api/user/Uploadcancelledcheque`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: 'Bearer YOUR_ACCESS_TOKEN' },
                body: JSON.stringify({ cancelledcheque: bs64, cancellchecque_idno: idno, currentrole: 'Retailer' }),
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const responseData = await response.json();
            if (responseData.Message === 'Image Updated Successfully.') {
                Alert.alert('Success', 'Image Updated Successfully.');
            } else {
                Alert.alert('Error', responseData.Message || 'Upload failed');
            }
        } catch (error) {
            Alert.alert('Error', `Failed to upload: ${error.message}`);
        } finally {
            setisLoading(false);
        }
    };

    useEffect(() => {
        fetchBanks();
        const fetchBankAccounts = async () => {
            setLoading(true);
            try {
                const response = await get({ url: `${APP_URLS.AepsBankInfo}` });
                if (response) {
                    setBankAcclist(response);
                } else {
                    Alert.alert('Error', 'Failed to load bank accounts');
                }
            } catch (error) {
                Alert.alert('Error', 'An error occurred while fetching bank accounts');
            } finally {
                setLoading(false);
            }
        };
        fetchBankAccounts();
    }, []);

    const fetchBanks = async () => {
        setLoading(true);
        try {
            const response = await post({ url: `${APP_URLS.aepsBanklist}` });
            if (response.RESULT === '0') {
                setBanklist(response['ADDINFO']['data']);
            } else {
                Alert.alert('Error', 'Failed to load bank list');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while fetching banks');
        } finally {
            setLoading(false);
        }
    };

    const requestCameraPermission = useCallback(async () => {
        try {
            const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA, {
                title: 'Camera Permission', message: 'key_thisappn_102', buttonPositive: 'OK',
            });
            if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
                Dialog.show({
                    type: ALERT_TYPE.WARNING, title: 'Permission Required',
                    textBody: 'key_pleasegra_85', button: 'OK',
                    onPressButton: () => { Dialog.hide(); openSettings().catch(() => {}); },
                });
            }
        } catch (err) { console.warn(err); }
    }, []);

    const sendotp = async () => {
        Keyboard.dismiss();
        if (Addresss === '') return;
        setisLoading(true);
        try {
            const res = await post({ url: 'AEPS/api/data/SendAepsAccountOtp' });
            if (res.Status) {
                setIsOtp(true);
            } else {
                alert(res.Message);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setisLoading(false);
        }
    };

    const submitOtp = async (otp) => {
        setisLoading(true);
        try {
            const data = {
                BankName: bank, AccountNO: acnNumber, IFSC_CODE: ifsccode,
                AccountHolder: name, Otp: otp, BankAddress: Addresss,
            };
            const res = await post({ url: 'AEPS/api/data/AddBankAccount', data });
            if (res?.Message === 'Otp Miss Match!.' && res?.Status === false) {
                ToastAndroid.show('OTP Miss Match!', ToastAndroid.LONG);
            } else {
                setIsOtp(false);
                setAdd(false);
                ToastAndroid.show(res?.Message || 'Success', ToastAndroid.LONG);
            }
        } catch { console.error(); }
        finally { setisLoading(false); }
    };

    // ── Account detail row ────────────────────────────────────────────────────
    const DetailRow = ({ leftLabel, leftVal, rightLabel, rightVal }: any) => (
        <View style={detailRow.wrap}>
            <View style={detailRow.cell}>
                <Text style={detailRow.lbl}>{leftLabel}</Text>
                <Text style={detailRow.val}>{leftVal || <DotLoader />}</Text>
            </View>
            <View style={[detailRow.cell, { alignItems: 'flex-end' }]}>
                <Text style={detailRow.lbl}>{rightLabel}</Text>
                <Text style={[detailRow.val, { textAlign: 'right' }]}>{rightVal || <DotLoader />}</Text>
            </View>
        </View>
    );

    // ── Verification badge ────────────────────────────────────────────────────
    const VerifyBadge = ({ verified }: { verified: boolean }) => (
        <View style={[badge.wrap, { backgroundColor: verified ? '#D1FAE5' : '#FEE2E2' }]}>
            <View style={[badge.icon, { backgroundColor: verified ? '#10B981' : '#EF4444' }]}>
                {verified ? <CheckSvg size={12} /> : <CloseSvg size={12} />}
            </View>
            <Text style={[badge.text, { color: verified ? '#065F46' : '#7F1D1D' }]}>
                {verified ? 'Verified' : 'Unverified'}
            </Text>
        </View>
    );

    // ── Step indicator for form ───────────────────────────────────────────────
    const StepDot = ({ active }: { active: boolean }) => (
        <View style={[stepDot.dot, { backgroundColor: active ? PRIMARY : `${PRIMARY}40` }]} />
    );

    const formSteps = [bank !== '', ifsccode !== '', name !== '', acnNumber !== '', Addresss !== ''];
    const completedSteps = formSteps.filter(Boolean).length;

    return (
        <View style={styles.root}>
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* ── Add Account Bottom Sheet ── */}
                <BottomSheet
                    animationType="none"
                    isVisible={add}
                    containerStyle={[sheetS.backdrop, { paddingBottom: insets.bottom + hScale(10) }]}
                    onBackdropPress={() => setAdd(false)}
                    modalProps={{ animationType: 'fade', hardwareAccelerated: true, onRequestClose: () => setAdd(false) }}
                >
                    <KeyboardAwareScrollView
                        enableOnAndroid enableAutomaticScroll
                        extraScrollHeight={Platform.OS === 'ios' ? hScale(50) : hScale(100)}
                        keyboardShouldPersistTaps="handled"
                        style={{ width: '100%', backgroundColor: '#fff' }}
                    >
                        <View style={sheetS.sheet}>
                            {/* Handle */}
                            <View style={[sheetS.handle, { backgroundColor: PRIMARY_MID }]} />

                            {/* Header */}
                            <View style={sheetS.header}>
                                <Text style={sheetS.headerTitle}>{translate('Add_For_Aeps_Ac')}</Text>
                                <TouchableOpacity style={[sheetS.closeBtn, { backgroundColor: PRIMARY_LIGHT }]}
                                    onPress={() => setAdd(false)}>
                                    <ClosseModalSvg2 />
                                </TouchableOpacity>
                            </View>

                            {/* Progress bar */}
                            <View style={formS.progressWrap}>
                                <View style={formS.progressTrack}>
                                    <View style={[formS.progressFill, {
                                        width: `${(completedSteps / 5) * 100}%`,
                                        backgroundColor: PRIMARY
                                    }]} />
                                </View>
                                <Text style={[formS.progressText, { color: PRIMARY }]}>
                                    {completedSteps}/5 {translate('fields')}
                                </Text>
                            </View>

                            {isLoading && <ShowLoader />}

                            <View style={formS.body}>
                                {/* Bank */}
                                <Text style={[formS.sectionLabel, { color: PRIMARY }]}>Bank Details</Text>
                                <TouchableOpacity onPress={() => setIsBank(true)} activeOpacity={0.8}>
                                    <FlotingInput label={'Select Bank'} value={bank} editable={false}
                                        inputstyle={formS.input} labelinputstyle={undefined} onChangeTextCallback={undefined} />
                                    {bank.length === 0 && (
                                        <View style={formS.dropIcon}><OnelineDropdownSvg /></View>
                                    )}
                                </TouchableOpacity>

                                <FlotingInput label={'IFSC Code'} value={ifsccode} editable={bank !== ''}
                                    onChangeTextCallback={setIfsccode} inputstyle={formS.input}
                                    labelinputstyle={undefined} />

                                {/* Account */}
                                <Text style={[formS.sectionLabel, { color: PRIMARY }]}>Account Details</Text>
                                <FlotingInput label={'Account Holder Name'} value={name} editable={ifsccode !== ''}
                                    onChangeTextCallback={setName} inputstyle={formS.input} labelinputstyle={undefined} />

                                <FlotingInput label={'Account Number'} value={acnNumber} editable={name !== ''}
                                    keyboardType="numeric" onChangeTextCallback={setAcnNumber}
                                    inputstyle={formS.input} labelinputstyle={undefined} />

                                <FlotingInput label={'Address'} value={Addresss} editable={acnNumber !== ''}
                                    onChangeTextCallback={setAddresss} inputstyle={formS.input} labelinputstyle={undefined} />

                                <BankBottomSite
                                    setBankId={setBankid} isbank={isBank} setisbank={setIsBank}
                                    setBankName={setBank} bankdata={banklist}
                                    onPress1={() => {}} setisFacialTan={() => {}} />

                                <View style={{ marginTop: hScale(16), marginBottom: hScale(30) }}>
                                    <DynamicButton title={'Submit Detail'} onPress={sendotp} styleoveride={undefined} />
                                </View>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </BottomSheet>

                {/* ── Page Body ── */}
                <View style={styles.pageBody}>

                    {/* AEPS hero banner */}
                    <View style={[styles.heroBanner, { backgroundColor: PRIMARY_LIGHT, borderColor: PRIMARY_MID }]}>
                        <View style={[styles.aepsIconWrap, { backgroundColor: PRIMARY }]}>
                            <Text style={styles.aepsIconText}>₹</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.heroTitle, { color: PRIMARY }]}>AEPS Account</Text>
                            <Text style={styles.heroSub}>Aadhaar Enabled Payment System linked bank account</Text>
                        </View>
                    </View>

                    {/* Add button */}
                    <TouchableOpacity
                        style={[styles.addBtn, { backgroundColor: PRIMARY }]}
                        onPress={() => setAdd(!add)}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.addBtnPlus}>＋</Text>
                        <Text style={styles.addBtnText}>{'Add AEPS Account'}</Text>
                    </TouchableOpacity>

                    {/* Account Info Card */}
                    <View style={[acctCard.shell, { borderTopColor: PRIMARY }]}>

                        {/* Card header */}
                        <View style={[acctCard.topBar, { backgroundColor: PRIMARY_LIGHT }]}>
                            <View style={[acctCard.bankIcon, { backgroundColor: '#fff' }]}>
                                <Text style={[acctCard.bankInitial, { color: PRIMARY }]}>
                                    {(bankAcclist?.BankName || 'B').charAt(0)}
                                </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={[acctCard.bankName, { color: PRIMARY }]} numberOfLines={1}>
                                    {bankAcclist?.BankName || <DotLoader />}
                                </Text>
                                <Text style={acctCard.bankSub}>{translate('Account_Status')}</Text>
                            </View>
                            <VerifyBadge verified={!!bankAcclist?.Status} />
                        </View>

                        {/* Details */}
                        <View style={acctCard.body}>
                            <DetailRow
                                leftLabel={translate('Account_Holder_Name')} leftVal={bankAcclist?.AccountHolder}
                                rightLabel={translate('IFSC_Code')} rightVal={bankAcclist?.IFSC_CODE}
                            />
                            <View style={acctCard.divider} />
                            <DetailRow
                                leftLabel={translate('Account_NO')} leftVal={bankAcclist?.AccountNO}
                                rightLabel={translate('Branch')} rightVal={bankAcclist?.BankAddress}
                            />
                        </View>

                        {/* Footer stripe */}
                      
                    </View>
                </View>

                {/* OTP Modal */}
                <OTPModal
                    inputCount={4}
                    setMobileOtp={setOtp}
                    setShowOtpModal={setIsOtp}
                    showOtpModal={isotp}
                    verifyOtp={() => submitOtp(otp)}
                    disabled={otp.length !== 4}
                />
            </ScrollView>
        </View>
    );
};

// ── Page styles ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F8FAFC' },
    pageBody: { paddingHorizontal: wScale(14), paddingTop: hScale(14), paddingBottom: hScale(40) },
    heroBanner: {
        flexDirection: 'row', alignItems: 'center', gap: wScale(12),
        borderRadius: wScale(14), borderWidth: 1,
        padding: wScale(14), marginBottom: hScale(14),
    },
    aepsIconWrap: {
        width: wScale(44), height: wScale(44), borderRadius: wScale(12),
        alignItems: 'center', justifyContent: 'center',
    },
    aepsIconText: { fontSize: wScale(22), color: '#fff', fontWeight: '800' },
    heroTitle: { fontSize: wScale(16), fontWeight: '800', marginBottom: hScale(2) },
    heroSub: { fontSize: wScale(11), color: '#64748B', lineHeight: hScale(16) },
    addBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        borderRadius: wScale(12), paddingVertical: hScale(13), marginBottom: hScale(18),
        shadowColor: '#000', shadowOffset: { width: 0, height: hScale(3) },
        shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
    },
    addBtnPlus: { fontSize: wScale(20), color: '#fff', marginRight: wScale(8), lineHeight: wScale(22) },
    addBtnText: { fontSize: wScale(15), fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
});

// ── Account card styles ───────────────────────────────────────────────────────
const acctCard = StyleSheet.create({
    shell: {
        backgroundColor: '#fff', borderRadius: wScale(14), overflow: 'hidden',
        borderTopWidth: wScale(3),
        shadowColor: '#000', shadowOffset: { width: 0, height: hScale(2) },
        shadowOpacity: 0.07, shadowRadius: 8, elevation: 4,
    },
    topBar: {
        flexDirection: 'row', alignItems: 'center', gap: wScale(10),
        paddingHorizontal: wScale(12), paddingVertical: hScale(10),
    },
    bankIcon: {
        width: wScale(36), height: wScale(36), borderRadius: wScale(9),
        alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
    },
    bankInitial: { fontSize: wScale(18), fontWeight: '800' },
    bankName: { fontSize: wScale(14), fontWeight: '700' },
    bankSub: { fontSize: wScale(10), color: '#94A3B8', marginTop: hScale(1) },
    body: { paddingHorizontal: wScale(12), paddingVertical: hScale(10) },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: hScale(6) },
    footer: { paddingHorizontal: wScale(12), paddingVertical: hScale(8) },
    footerText: { fontSize: wScale(11), fontWeight: '600', letterSpacing: 0.3 },
});

// ── Detail row styles ─────────────────────────────────────────────────────────
const detailRow = StyleSheet.create({
    wrap: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: hScale(2) },
    cell: { flex: 1 },
    lbl: { fontSize: wScale(10), color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: hScale(2) },
    val: { fontSize: wScale(13), fontWeight: '700', color: '#1E293B' },
});

// ── Verify badge styles ───────────────────────────────────────────────────────
const badge = StyleSheet.create({
    wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: wScale(8), paddingVertical: hScale(4), borderRadius: wScale(20) },
    icon: { width: wScale(18), height: wScale(18), borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: wScale(4) },
    text: { fontSize: wScale(11), fontWeight: '700' },
});

// ── Step dot styles ───────────────────────────────────────────────────────────
const stepDot = StyleSheet.create({
    dot: { width: wScale(6), height: wScale(6), borderRadius: 10, marginHorizontal: wScale(2) },
});

// ── Bottom sheet styles ───────────────────────────────────────────────────────
const sheetS = StyleSheet.create({
    backdrop: { backgroundColor: 'rgba(0,0,0,0.55)', flex: 1 },
    sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
    handle: { width: wScale(40), height: hScale(4), borderRadius: 2, alignSelf: 'center', marginTop: hScale(10), marginBottom: hScale(4) },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: wScale(16), paddingVertical: hScale(14),
        borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    },
    headerTitle: { fontSize: wScale(17), fontWeight: '800', color: '#1E293B', flex: 1 },
    closeBtn: { width: wScale(34), height: wScale(34), borderRadius: wScale(10), alignItems: 'center', justifyContent: 'center' },
});

// ── Form styles ───────────────────────────────────────────────────────────────
const formS = StyleSheet.create({
    body: { paddingHorizontal: wScale(16), paddingTop: hScale(8) },
    sectionLabel: {
        fontSize: wScale(11), fontWeight: '800', letterSpacing: 1,
        textTransform: 'uppercase', marginTop: hScale(14), marginBottom: hScale(4),
    },
    input: { borderRadius: wScale(10), backgroundColor: '#F8FAFC' },
    dropIcon: {
        position: 'absolute', right: 0, top: 0, height: '100%',
        alignItems: 'flex-end', justifyContent: 'center', paddingRight: wScale(12),
    },
    progressWrap: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: wScale(16), paddingVertical: hScale(8),
        borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    },
    progressTrack: { flex: 1, height: hScale(4), backgroundColor: '#E2E8F0', borderRadius: 4, marginRight: wScale(10), overflow: 'hidden' },
    progressFill: { height: '100%', borderRadius: 4 },
    progressText: { fontSize: wScale(11), fontWeight: '700' },
});

export default AepsAddAccount;