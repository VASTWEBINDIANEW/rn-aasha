/* eslint-disable react-hooks/rules-of-hooks */
import React, { useCallback, useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ToastAndroid,
    Alert,
    ActivityIndicator,
    Platform,
} from 'react-native';
import FlotingInput from '../../drawer/securityPages/FlotingInput';
import { translate } from '../../../utils/languageUtils/I18n';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { useDeviceInfoHook } from '../../../utils/hooks/useDeviceInfoHook';
import { encrypt } from '../../../utils/encryptionUtils';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import OTPModal from '../../../components/OTPModal';
import { onReceiveNotification2 } from '../../../utils/NotificationService';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

// ─────────────────────────────────────────────────
// Helper: show toast cross-platform
// ─────────────────────────────────────────────────
const showToast = (msg: string) => {
    if (Platform.OS === 'android') {
        ToastAndroid.showWithGravity(msg, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
    } else {
        Alert.alert('', msg);
    }
};

// ─────────────────────────────────────────────────
// ID Type Selector (Dynamic Theme Colors)
// ─────────────────────────────────────────────────
type IdBtnProps = {
    label: string;
    active: boolean;
    onPress: () => void;
    primaryColor: string;
    secondaryColor: string;
};
const IdTypeButton: React.FC<IdBtnProps> = ({ label, active, onPress, primaryColor, secondaryColor }) => (
    <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[
            styles.segmentBtn,
            active 
                ? { backgroundColor: `${primaryColor}15`, borderColor: primaryColor, borderWidth: 1, elevation: 0 }
                : { backgroundColor: 'transparent', borderColor: 'transparent', borderWidth: 1 }
        ]}
    >
        <Text style={[styles.segmentBtnText, { color: active ? primaryColor : secondaryColor, opacity: active ? 1 : 0.7 }]}>
            {label}
        </Text>
    </TouchableOpacity>
);

// ─────────────────────────────────────────────────
// Summary Row (Dynamic Theme Colors)
// ─────────────────────────────────────────────────
const SummaryRow: React.FC<{ leftLabel: string; leftValue: string; rightLabel: string; rightValue: string; primaryColor: string; secondaryColor: string }> = ({
    leftLabel, leftValue, rightLabel, rightValue, primaryColor, secondaryColor
}) => (
    <View style={styles.summaryRow}>
        <View style={styles.summaryCell}>
            <Text style={[styles.summaryLabel, { color: secondaryColor }]}>{leftLabel}</Text>
            <Text style={[styles.summaryValue, { color: primaryColor }]} numberOfLines={1} ellipsizeMode="tail">{leftValue}</Text>
        </View>
        <View style={[styles.summaryCell, styles.summaryCellRight]}>
            <Text style={[styles.summaryLabel, { color: secondaryColor, textAlign: 'right' }]}>{rightLabel}</Text>
            <Text style={[styles.summaryValue, { color: primaryColor, textAlign: 'right' }]} numberOfLines={1} ellipsizeMode="head">{rightValue}</Text>
        </View>
    </View>
);

// ─────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────
const toBankScreen = ({ route }: any) => {
    const { colorConfig, Loc_Data } = useSelector((state: RootState) => state.userInfo);
    const { userId } = useSelector((state: RootState) => state.userInfo);
    const navigation = useNavigation<any>();
    const { post, get } = useAxiosHook();
    const { getNetworkCarrier, getMobileDeviceId, getMobileIp } = useDeviceInfoHook();

    const [amount, setAmount] = useState('');
    const [reamount, setReamount] = useState('');
    const [servicefee, setServiceFee] = useState('');
    const [transpin, setTranspin] = useState('');
    const [id, setId] = useState(3); // 1=Aadhaar, 2=PAN, 3=None
    const [aadharvis, setAadharVis] = useState(false);
    const [panvisi, setPanVis] = useState(false);
    const [aadhar, setAadhar] = useState('');
    const [pancard, setPancard] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isR, setIsR] = useState('');

    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [mobileOtp, setMobileOtp] = useState('');

    const { dmttype, unqid } = route.params;
    const { latitude, longitude } = Loc_Data;

    // Theme Colors Extraction
    const { primaryColor, secondaryColor } = colorConfig;

    // ── Helpers ──────────────────────────────────────
    const selectIdType = (type: 'aadhaar' | 'pan' | 'none') => {
        setAadharVis(type === 'aadhaar');
        setPanVis(type === 'pan');
        setId(type === 'aadhaar' ? 1 : type === 'pan' ? 2 : 3);
    };

    const isFormValid = () => {
        if (!amount || !reamount) return false;
        if (amount !== reamount) return false;
        if (transpin.length < 4 || transpin.length > 6) return false;
        return true;
    };

    // ── API: Check DMT status ─────────────────────────
    const checkDmtStatus = async () => {
        try {
            const response = await get({ url: APP_URLS.Dmtstatus });
            setIsR(response?.Name ?? '');
        } catch (error) {
            console.log('CheckDmtstatus error:', error);
        }
    };

    // ── API: Verify Aadhaar / PAN ────────────────────
    const checkID = useCallback(async (number: string) => {
        try {
            let res: any;
            let message = '';

            if (aadharvis) {
                res = await get({ url: `${APP_URLS.checkUpiSdrAdhar}AdharCardValidationCheck?aadharnumber=${number}` });
                message = res?.status ? translate('Aadhar_Verified') + ' ✅' : translate('Aadhar_Not_Verified') + ' ❌';
            } else if (panvisi) {
                res = await get({ url: `${APP_URLS.checkUpiSdrAdhar}PancardCardValidationCheck?pannumber=${number}` });
                message = res?.status ? translate('Pan_Verified') + ' ✅' : translate('Pan_Not_Verified') + ' ❌';
            }

            if (message) showToast(message);
        } catch (error) {
            console.error('checkID error:', error);
            showToast(translate('Verification_Error'));
        }
    }, [aadharvis, panvisi, get]);

    // ── API: Get OTP (for Payoutkyc flow) ────────────
    const getOtp = async () => {
        if (!isFormValid()) {
            setIsLoading(false);
            return;
        }

        const { ACCno, senderNo, unqid: uid } = route.params;

        try {
            const url = `${APP_URLS.getImpsOtp}senderno=${senderNo}&uniqueid=${uid}&amount=${amount}&accountno=${ACCno}`;
            const res = await post({ url });

            const addInfoStr = (res?.ADDINFO ?? '').replace(/'/g, '"');
            const add = JSON.parse(addInfoStr);

            if (add?.status === 'Success') {
                setOtpModalVisible(true);
                showToast(add.Details ?? '');
            } else {
                showToast(add?.Details ?? translate('OTP_Send_Error'));
            }
        } catch (error) {
            console.error('getOtp error:', error);
            showToast(translate('Error_Try_Again'));
        } finally {
            setIsLoading(false);
        }
    };

    // ── API: Main Transfer ────────────────────────────
    const ONpay = useCallback(async (uid: string) => {
        if (!isFormValid()) {
            setIsLoading(false);
            return;
        }

        const {
            ACCno, accHolder, bankname, ifsc, mode, senderNo, id: routeId,
        } = route.params;

        setIsLoading(true);

        try {
            const mobileNetwork = await getNetworkCarrier();
            const ipp = await getMobileIp();
            const Model = await getMobileDeviceId();

            const encryption = await encrypt([
                userId, accHolder, senderNo, ifsc, routeId,
                transpin, ACCno, mode, Model, bankname,
                ipp, Model, latitude, longitude, Model,
                'address', Model, 'postcode', mobileNetwork, uid,
            ]);

            const enc = encryption.encryptedData;
            const encode = (i: number) => encodeURIComponent(enc[i]);

            const kycValue = route.params?.kyc === true ? 'Done' : aadhar;
            const pKycValue = route.params?.kyc === true ? 'Done' : pancard;

            const payload: Record<string, string> = {
                umm: encode(0),
                name: encode(1),
                snn: encode(2),
                fggg: encode(3),
                eee: encode(4),
                ttt: amount,
                nnn: encode(5),
                nttt: encode(6),
                peee: encode(7),
                nbb: encode(8),
                bnm: encode(9),
                kyc: kycValue,
                ip: encode(10),
                mac: pKycValue,
                ottp: mobileOtp,
                Devicetoken: encode(11),
                Latitude: encode(12),
                Longitude: encode(13),
                ModelNo: encode(14),
                Address: encode(15),
                City: encode(16),
                PostalCode: encode(17),
                InternetTYPE: encode(18),
                value1: encodeURIComponent(encryption.keyEncode),
                value2: encodeURIComponent(encryption.ivEncode),
                uniqueid: uid,
            };

            const data: Record<string, string> = {};
            for (const key in payload) {
                data[key] = decodeURIComponent(payload[key]);
            }

            const response = await post({ url: APP_URLS.dmtapi, data });

            if (response) {
                setIsLoading(false);
                const txnDetails = (response.data ?? [])
                    .map((t: any) => `${translate('Amount')}: ${t.Amount}\n${translate('Status')}: ${t.Status}\n${translate('Bank_Ref')}: ${t.bankrefid}`)
                    .join('\n\n');

                const msg =
                    `${translate('Account_No')}: ${response.Accountno}\n` +
                    `${translate('Bank_Name')}: ${response.BankName}\n` +
                    `${translate('IFSC_Code')}: ${response.Ifsccode}\n` +
                    `${translate('Time')}: ${response.Time}\n` +
                    `${translate('Total_Amount')}: ${response.TotalAmount}\n\n` +
                    `${translate('Transaction_Details')}:\n${txnDetails}`;

                Alert.alert(translate('Payment_Response'), msg, [
                    { text: translate('Go_To_Dashboard'), onPress: () => navigation.navigate('Dashboard') },
                ]);

                onReceiveNotification2({ notification: { title: translate('Payment_Response'), body: msg } });
            } else {
                Alert.alert(translate('Error'), translate('Something_Went_Wrong'), [
                    { text: translate('Go_To_Dashboard'), onPress: () => navigation.replace('DashboardScreen') },
                ]);
            }
        } catch (error) {
            console.error('ONpay error:', error);
            Alert.alert(translate('Error'), translate('Error_Try_Again'));
        } finally {
            setIsLoading(false);
        }
    }, [userId, route.params, transpin, amount, reamount, aadhar, pancard, mobileOtp, post, latitude, longitude]);

    const handleTransfer = () => {
        if (!isFormValid() || isLoading) return;
        setIsLoading(true);

        if (route.params?.Payoutkyc) {
            getOtp();
        } else {
            ONpay(route.params?.unqid ?? unqid);
        }
    };

    useEffect(() => {
        checkDmtStatus();
    }, []);

    const amountMatch = amount === '' || reamount === '' || amount === reamount;

    return (
        // Main Background uses a very light tint of primaryColor
        <View style={[styles.main, { backgroundColor: `${primaryColor}08` }]}>
            <AppBarSecond title={translate('To_Bank')} />
            
            {/* Background Gradient Header */}
            <LinearGradient 
                colors={[primaryColor, secondaryColor]} 
                style={styles.headerBackground} 
                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            />

            <KeyboardAwareScrollView
                enableOnAndroid
                extraScrollHeight={60}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1 }}
            >
                {/* ── Summary Card ── */}
                <View style={[styles.summaryCard, { borderColor: `${primaryColor}20`, borderWidth: 1 }]}>
                    <SummaryRow
                        leftLabel={translate('Mode')}
                        leftValue={route.params?.mode ?? '-'}
                        rightLabel={translate('IFS_Code')}
                        rightValue={route.params?.ifsc ?? '-'}
                        primaryColor={primaryColor}
                        secondaryColor={secondaryColor}
                    />
                    <View style={[styles.divider, { backgroundColor: `${primaryColor}15` }]} />
                    <SummaryRow
                        leftLabel={translate('Bank')}
                        leftValue={route.params?.bankname ?? '-'}
                        rightLabel={
                            APP_URLS.AppName !== 'World Pay One'
                                ? translate('Payoutkyc')
                                : translate('Account_Holder')
                        }
                        rightValue={
                            APP_URLS.AppName !== 'World Pay One'
                                ? route.params?.Payoutkyc ? translate('Yes') : translate('No')
                                : route.params?.accHolder ?? '-'
                        }
                        primaryColor={primaryColor}
                        secondaryColor={secondaryColor}
                    />
                    <View style={[styles.divider, { backgroundColor: `${primaryColor}15` }]} />
                    <SummaryRow
                        leftLabel={translate('Ac')}
                        leftValue={route.params?.ACCno ?? '-'}
                        rightLabel={translate('Unique_Id')}
                        rightValue={route.params?.unqid ?? '-'}
                        primaryColor={primaryColor}
                        secondaryColor={secondaryColor}
                    />
                </View>

                {/* ── Form Card ── */}
                <View style={[styles.formCard, { borderColor: `${primaryColor}20`, borderWidth: 1 }]}>

                    {/* KYC ID Type Selector */}
                    {route.params?.kyc !== false && (
                        <View style={styles.idSection}>
                            <Text style={[styles.sectionTitle, { color: secondaryColor }]}>
                                {translate('Select_ID_Type')}
                            </Text>
                            <View style={[styles.segmentedControl, { backgroundColor: `${secondaryColor}10` }]}>
                                <IdTypeButton
                                    label={translate('None')}
                                    active={!aadharvis && !panvisi}
                                    onPress={() => selectIdType('none')}
                                    primaryColor={primaryColor}
                                    secondaryColor={secondaryColor}
                                />
                                <IdTypeButton
                                    label={translate('Aadhaar')}
                                    active={aadharvis}
                                    onPress={() => selectIdType('aadhaar')}
                                    primaryColor={primaryColor}
                                    secondaryColor={secondaryColor}
                                />
                                <IdTypeButton
                                    label={translate('PAN_Card')}
                                    active={panvisi}
                                    onPress={() => selectIdType('pan')}
                                    primaryColor={primaryColor}
                                    secondaryColor={secondaryColor}
                                />
                            </View>
                        </View>
                    )}

                    {/* Amount & Re-Amount (Side by Side) */}
                    <View style={styles.rowInputs}>
                        <View style={styles.flexInput}>
                            <FlotingInput
                                label={translate('Enter Amount')}
                                inputstyle={styles.inputBase}
                                value={amount}
                                onChangeTextCallback={setAmount}
                                keyboardType="number-pad"
                                maxLength={8}
                                editable
                            />
                        </View>
                        <View style={styles.flexInput}>
                            <FlotingInput
                                label={translate('Re_Enter_Amount')}
                                inputstyle={[
                                    styles.inputBase,
                                    !amountMatch && styles.inputError,
                                ]}
                                value={reamount}
                                onChangeTextCallback={setReamount}
                                keyboardType="number-pad"
                                maxLength={8}
                                editable
                            />
                        </View>
                    </View>
                    
                    {!amountMatch && (
                        <Text style={styles.errorText}>⚠ {translate('Amount_Mismatch')}</Text>
                    )}

                    {/* Aadhaar or PAN Input */}
                    {aadharvis && (
                        <View style={styles.singleInputGroup}>
                            <FlotingInput
                                label={translate('Enter Aadhar Number')}
                                inputstyle={styles.inputBase}
                                onChangeTextCallback={(text: string) => {
                                    setAadhar(text);
                                    if (text.length === 12) checkID(text);
                                }}
                                keyboardType="number-pad"
                                maxLength={12}
                                editable
                            />
                        </View>
                    )}

                    {panvisi && (
                        <View style={styles.singleInputGroup}>
                            <FlotingInput
                                label={translate('Enter Pan Number')}
                                inputstyle={styles.inputBase}
                                onChangeTextCallback={(text: string) => {
                                    setPancard(text);
                                    if (text.length === 10) checkID(text);
                                }}
                                keyboardType="default"
                                maxLength={10}
                                editable
                            />
                        </View>
                    )}

                    {/* Service Fee & Trans PIN (Side by Side) */}
                    <View style={styles.rowInputs}>
                        <View style={styles.flexInput}>
                            <FlotingInput
                                label={translate('Service Fee')}
                                inputstyle={styles.inputBase}
                                value={servicefee}
                                onChangeTextCallback={setServiceFee}
                                keyboardType="number-pad"
                                maxLength={3}
                                editable
                            />
                        </View>
                        <View style={styles.flexInput}>
                            <FlotingInput
                                label={translate('Trans PIN')}
                                inputstyle={styles.inputBase}
                                value={transpin}
                                keyboardType="number-pad"
                                maxLength={6}
                                secureTextEntry
                                editable={amount !== '' && reamount !== '' && amountMatch}
                                onChangeTextCallback={setTranspin}
                            />
                        </View>
                    </View>

                    {transpin.length > 0 && (transpin.length < 4 || transpin.length > 6) && (
                        <Text style={styles.errorText}>⚠ {translate('PIN_Length_Error')}</Text>
                    )}

                    {/* Transfer Button */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleTransfer}
                        disabled={isLoading || !isFormValid()}
                        style={[
                            styles.btnWrapper, 
                            { shadowColor: primaryColor },
                            (!isFormValid() && !isLoading) && { opacity: 0.5 }
                        ]}
                    >
                        <LinearGradient
                            colors={isLoading ? ['#9CA3AF', '#D1D5DB'] : [primaryColor, secondaryColor]}
                            style={styles.gradientBtn}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.btnText}>
                                    {route.params?.Payoutkyc ? translate('Get_OTP') : translate('Transfer')}
                                </Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAwareScrollView>

            {/* OTP Modal */}
            <OTPModal
                setShowOtpModal={setOtpModalVisible}
                disabled={mobileOtp.length !== 4}
                showOtpModal={otpModalVisible}
                setMobileOtp={setMobileOtp}
                setEmailOtp={null}
                inputCount={4}
                verifyOtp={() => {
                    setOtpModalVisible(false);
                    ONpay(route.params?.unqid ?? unqid);
                }}
            />
        </View>
    );
};

// ─────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────
const styles = StyleSheet.create({
    main: {
        flex: 1,
    },
    headerBackground: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: hScale(95),
        borderBottomLeftRadius: wScale(24),
        borderBottomRightRadius: wScale(24),
    },

    // ── Summary card ──
    summaryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: wScale(14),
        marginHorizontal: wScale(14),
        marginTop: hScale(10),
        paddingHorizontal: wScale(14),
        paddingVertical: hScale(8),
      
       
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: hScale(4),
    },
    summaryCell: {
        flex: 1,
    },
    summaryCellRight: {
        alignItems: 'flex-end',
        marginLeft: wScale(8),
    },
    summaryLabel: {
        fontSize: wScale(10),
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        opacity: 0.8,
    },
    summaryValue: {
        fontSize: wScale(12),
        fontWeight: '700',
        marginTop: 1,
    },
    divider: {
        height: 1,
        marginVertical: hScale(2),
    },

    // ── Form card ──
    formCard: {
        backgroundColor: '#fff',
        borderRadius: wScale(14),
        marginHorizontal: wScale(14),
        marginTop: hScale(12),
        paddingHorizontal: wScale(14),
        paddingTop: hScale(14),
        paddingBottom: hScale(16),
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 3,
    },

    // ── ID selector (Segmented Control) ──
    idSection: {
        marginBottom: hScale(10),
    },
    sectionTitle: {
        fontSize: wScale(12),
        fontWeight: '700',
        marginBottom: hScale(8),
        marginLeft: wScale(4),
    },
    segmentedControl: {
        flexDirection: 'row',
        borderRadius: wScale(8),
        padding: wScale(3),
    },
    segmentBtn: {
        flex: 1,
        paddingVertical: hScale(6),
        borderRadius: wScale(6),
        alignItems: 'center',
        justifyContent: 'center',
    },
    segmentBtnText: {
        fontSize: wScale(11),
        fontWeight: '700',
    },

    // ── Inputs ──
    rowInputs: {
        flexDirection: 'row',
        gap: wScale(10),
        marginBottom: hScale(6),
    },
    flexInput: {
        flex: 1,
    },
    singleInputGroup: {
        marginBottom: hScale(6),
    },
    inputBase: {
        borderRadius: wScale(8),
    },
    inputError: {
        borderColor: '#DC2626',
        borderWidth: 1,
    },
    errorText: {
        fontSize: wScale(10),
        color: '#DC2626',
        marginTop: -hScale(4),
        marginBottom: hScale(6),
        marginLeft: wScale(4),
        fontWeight: '500',
    },

    // ── Transfer Button ──
    btnWrapper: {
        marginTop: hScale(8),
        borderRadius: wScale(10),
        overflow: 'hidden',
        elevation: 4,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
    },
    gradientBtn: {
        paddingVertical: hScale(12),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: wScale(10),
    },
    btnText: {
        color: '#fff',
        fontSize: wScale(14),
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});

export default toBankScreen;