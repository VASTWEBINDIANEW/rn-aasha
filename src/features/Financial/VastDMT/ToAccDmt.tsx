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
import DynamicButton from '../../drawer/button/DynamicButton';
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
// ID Type Selector button
// ─────────────────────────────────────────────────
type IdBtnProps = {
    label: string;
    active: boolean;
    onPress: () => void;
    primaryColor: string;
    labelColor: string;
};
const IdTypeButton: React.FC<IdBtnProps> = ({ label, active, onPress, primaryColor, labelColor }) => (
    <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[
            styles.idBtn,
            active
                ? { backgroundColor: primaryColor, borderColor: primaryColor }
                : { backgroundColor: '#fff', borderColor: '#ccc' },
        ]}
    >
        <Text style={[styles.idBtnText, { color: active ? labelColor : '#555' }]}>{label}</Text>
    </TouchableOpacity>
);

// ─────────────────────────────────────────────────
// Summary Row
// ─────────────────────────────────────────────────
const SummaryRow: React.FC<{ leftLabel: string; leftValue: string; rightLabel: string; rightValue: string }> = ({
    leftLabel, leftValue, rightLabel, rightValue,
}) => (
    <View style={styles.summaryRow}>
        <View style={styles.summaryCell}>
            <Text style={styles.summaryLabel}>{leftLabel}</Text>
            <Text style={styles.summaryValue} numberOfLines={1} ellipsizeMode="tail">{leftValue}</Text>
        </View>
        <View style={[styles.summaryCell, styles.summaryCellRight]}>
            <Text style={[styles.summaryLabel, { textAlign: 'right' }]}>{rightLabel}</Text>
            <Text style={[styles.summaryValue, { textAlign: 'right' }]} numberOfLines={1} ellipsizeMode="head">{rightValue}</Text>
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

            // Parse ADDINFO safely
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

            // Decode all values before sending
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

    // ── Button handler ────────────────────────────────
    const handleTransfer = () => {
        if (!isFormValid() || isLoading) return;
        setIsLoading(true);

        if (route.params?.Payoutkyc) {
            // Payoutkyc flow: get OTP first, then ONpay is triggered from modal
            getOtp();
        } else {
            ONpay(route.params?.unqid ?? unqid);
        }
    };

    // ── Lifecycle ─────────────────────────────────────
    useEffect(() => {
        checkDmtStatus();
    }, []);

    // ── UI ─────────────────────────────────────────────
    const amountMatch = amount === '' || reamount === '' || amount === reamount;
    const { primaryColor, secondaryColor, primaryButtonColor, labelColor } = colorConfig;

    return (
        <View style={styles.main}>
            <AppBarSecond title={translate('To_Bank')} />

            <KeyboardAwareScrollView
                enableOnAndroid
                extraScrollHeight={100}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {/* ── Summary Card ── */}
                <LinearGradient colors={[primaryColor, secondaryColor]} style={styles.gradientWrapper}>
                    <View style={styles.summaryCard}>
                        {/* Row 1 */}
                        <SummaryRow
                            leftLabel={translate('Mode')}
                            leftValue={route.params?.mode ?? '-'}
                            rightLabel={translate('IFS_Code')}
                            rightValue={route.params?.ifsc ?? '-'}
                        />
                        <View style={styles.divider} />

                        {/* Row 2 */}
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
                        />
                        <View style={styles.divider} />

                        {/* Row 3 */}
                        <SummaryRow
                            leftLabel={translate('Ac')}
                            leftValue={route.params?.ACCno ?? '-'}
                            rightLabel={translate('Unique_Id')}
                            rightValue={route.params?.unqid ?? '-'}
                        />
                    </View>
                </LinearGradient>

                {/* ── Form Card ── */}
                <View style={styles.formCard}>

                    {/* KYC ID Type Selector */}
                    {route.params?.kyc !== false && (
                        <View style={styles.idSection}>
                            <Text style={styles.sectionTitle}>{translate('Select_ID_Type')}</Text>
                            <View style={styles.idRow}>
                                <IdTypeButton
                                    label={translate('None')}
                                    active={!aadharvis && !panvisi}
                                    onPress={() => selectIdType('none')}
                                    primaryColor={primaryButtonColor}
                                    labelColor={labelColor}
                                />
                                <IdTypeButton
                                    label={translate('Aadhaar')}
                                    active={aadharvis}
                                    onPress={() => selectIdType('aadhaar')}
                                    primaryColor={primaryButtonColor}
                                    labelColor={labelColor}
                                />
                                <IdTypeButton
                                    label={translate('PAN_Card')}
                                    active={panvisi}
                                    onPress={() => selectIdType('pan')}
                                    primaryColor={primaryButtonColor}
                                    labelColor={labelColor}
                                />
                            </View>
                        </View>
                    )}

                    {/* Amount */}
                    <View style={styles.inputGroup}>
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

                    {/* Re-enter Amount */}
                    <View style={styles.inputGroup}>
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
                        {!amountMatch && (
                            <Text style={styles.errorText}>{translate('Amount_Mismatch')}</Text>
                        )}
                    </View>

                    {/* Aadhaar */}
                    {aadharvis && (
                        <View style={styles.inputGroup}>
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

                    {/* PAN */}
                    {panvisi && (
                        <View style={styles.inputGroup}>
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

                    {/* Service Fee */}
                    <View style={styles.inputGroup}>
                        <FlotingInput
                            label={translate('Enter Service Fee')}
                            inputstyle={styles.inputBase}
                            value={servicefee}
                            onChangeTextCallback={setServiceFee}
                            keyboardType="number-pad"
                            maxLength={3}
                            editable
                        />
                    </View>

                    {/* Transaction PIN */}
                    <View style={styles.inputGroup}>
                        <FlotingInput
                            label={translate('Enter Transaction PIN')}
                            inputstyle={styles.inputBase}
                            value={transpin}
                            keyboardType="number-pad"
                            maxLength={6}
                            secureTextEntry
                            editable={amount !== '' && reamount !== '' && amountMatch}
                            onChangeTextCallback={setTranspin}
                        />
                        {transpin.length > 0 && (transpin.length < 4 || transpin.length > 6) && (
                            <Text style={styles.errorText}>{translate('PIN_Length_Error')}</Text>
                        )}
                    </View>

                    {/* Transfer / Get OTP Button */}
                    <TouchableOpacity
                        activeOpacity={0.85}
                        onPress={handleTransfer}
                        disabled={isLoading}
                        style={styles.btnWrapper}
                    >
                        <LinearGradient
                            colors={isLoading ? ['#aaa', '#ccc'] : [primaryColor, secondaryColor]}
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

                    <View style={{ height: hScale(40) }} />
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
        backgroundColor: '#F5F6FA',
    },

    // ── Gradient header ──
    gradientWrapper: {
        paddingHorizontal: wScale(12),
        paddingVertical: hScale(12),
    },
    summaryCard: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        borderRadius: wScale(14),
        paddingHorizontal: wScale(14),
        paddingVertical: hScale(10),
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: hScale(8),
    },
    summaryCell: {
        flex: 1,
    },
    summaryCellRight: {
        alignItems: 'flex-end',
        marginLeft: wScale(10),
    },
    summaryLabel: {
        fontSize: wScale(11),
        color: '#888',
        fontWeight: '600',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        marginBottom: hScale(2),
    },
    summaryValue: {
        fontSize: wScale(13),
        color: '#222',
        fontWeight: '700',
    },
    divider: {
        height: 1,
        backgroundColor: '#E8EAF0',
    },

    // ── Form card ──
    formCard: {
        backgroundColor: '#fff',
        borderRadius: wScale(16),
        marginHorizontal: wScale(12),
        marginTop: hScale(14),
        marginBottom: hScale(10),
        paddingHorizontal: wScale(16),
        paddingTop: hScale(16),
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.07,
        shadowRadius: 8,
        elevation: 3,
    },

    // ── ID selector ──
    idSection: {
        marginBottom: hScale(16),
    },
    sectionTitle: {
        fontSize: wScale(14),
        fontWeight: '700',
        color: '#333',
        marginBottom: hScale(10),
    },
    idRow: {
        flexDirection: 'row',
        gap: wScale(8),
    },
    idBtn: {
        flex: 1,
        paddingVertical: hScale(8),
        borderRadius: wScale(8),
        borderWidth: 1.5,
        alignItems: 'center',
    },
    idBtnText: {
        fontSize: wScale(12),
        fontWeight: '600',
    },

    // ── Inputs ──
    inputGroup: {
        marginBottom: hScale(4),
    },
    inputBase: {
        borderRadius: wScale(8),
    },
    inputError: {
        borderColor: '#E53935',
    },
    errorText: {
        fontSize: wScale(11),
        color: '#E53935',
        marginTop: hScale(2),
        marginLeft: wScale(4),
        marginBottom: hScale(6),
    },

    // ── Transfer Button ──
    btnWrapper: {
        marginTop: hScale(20),
        borderRadius: wScale(12),
        overflow: 'hidden',
    },
    gradientBtn: {
        paddingVertical: hScale(16),
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: wScale(12),
    },
    btnText: {
        color: '#fff',
        fontSize: wScale(16),
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});

export default toBankScreen;