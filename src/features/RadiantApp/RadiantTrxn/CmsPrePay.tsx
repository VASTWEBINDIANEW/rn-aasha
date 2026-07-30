import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, TextInput, ToastAndroid, Modal, Keyboard, } from 'react-native';
import FlotingInput from '../../drawer/securityPages/FlotingInput';
import AlertSvg from '../../drawer/svgimgcomponents/AlertSvg';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import AllBalance from '../../../components/AllBalance';
import ShowLoaderBtn from '../../../components/ShowLoaderBtn';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import { Item } from 'react-native-paper/lib/typescript/components/Drawer/Drawer';
import { useDispatch } from 'react-redux';
import { clearEntryScreen, setCmsAddMFrom, setIsPartial, setRcPrePayAnomut } from '../../../reduxUtils/store/userInfoSlice';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { useFocusEffect } from '@react-navigation/native';
import CmsZeroSvg from '../../drawer/svgimgcomponents/CmsZeroSvg';
import CmsSlipDownload from '../../drawer/svgimgcomponents/CmsSlipDownloadSvg';
import OnelineDropdownSvg from '../../drawer/svgimgcomponents/simpledropdown';
import { commonStyles } from '../../../utils/styles/commonStyles';
import PartialPayReport from '../CmsReport/PartialPayReport';

const CmsPrePay = ({ route }) => {
    const { colorConfig, Loc_Data, cmsVerify, rctype, radiantList, rceIdStatus, rceId, cmsAddMFrom } = useSelector((state: RootState) => state.userInfo);

    const { item } = route.params
    console.log(item, '099090');
    console.log(radiantList, rceIdStatus, rceId, cmsAddMFrom, '-=radiantList');

    const [isFullPickupAllowed, setIsFullPickupAllowed] = useState(true);
    const [showZeroAlert, setShowZeroAlert] = useState(false);
    const [rceID, setRceID] = useState('');
    const [shopId, setShopID] = useState('')
    const [amount, setAmount] = useState('');
    const [Ramount, setRAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const [status, setStatus] = useState('');
    const [amountneed, setAmountneed] = useState('');

    const [adminiStatus, setAdminiStatus] = useState({});
    const [supportData, setSuppportData] = useState([]);
    const navigation = useNavigation();
    // const paymentOptions = ['Full & Final Pickup', 'Partial Pickup'];
    const paymentOptions = [
        { label: 'Full & Final Pickup', value: false },
        { label: 'Partial Pickup', value: true }
    ];

    const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
    const [paymentType, setPaymentType] = useState('Full & Final Pickup');
    useEffect(() => {
        dispatch(setIsPartial(false)); // default false
        setPaymentType('Full & Final Pickup'); // default selection
    }, []);

    const { post, get } = useAxiosHook();
    useEffect(() => {
        const fetchRceId = async () => {
            try {
                const res = await post({ url: APP_URLS.RCEID });
                const addinfo = res?.Content?.ADDINFO;
                const allowed = addinfo?.isallowfullpickup === 'Allow';
                setIsFullPickupAllowed(allowed);
                if (!allowed) setShowZeroAlert(true); // ✅ popup dikhao
            } catch (e) {
                console.log('❌ RCEID error:', e);
            }
        };
        fetchRceId();
    }, []);
    useEffect(() => {
        if (radiantList?.ShopId) {
            setShopID(radiantList.ShopId);
        };
        setRceID(rceId)
        if (!amount || !Ramount) {
            setStatus('');
            return;
        }

        if (Number(amount) > 0 && Number(amount) === Number(Ramount)) {
            setStatus('MATCHED');
        } else {
            setStatus('MISMATCH');
        }
    }, [amount, Ramount, radiantList]);

    const showMismatch = Ramount !== '' && amount !== '' && Number(amount) !== Number(Ramount);


    useEffect(() => {
        const amt = Number(amount);
        const rAmt = Number(Ramount);
        if (paymentType === 'Partial Pickup' && amt === 0) {
            ToastAndroid.show(
                'Zero amount is not allowed for Partial Pickup.',
                ToastAndroid.LONG
            );
            return;
        }
        const isValid =
            amount !== "" &&
            Ramount !== "" &&
            !isNaN(amt) &&
            !isNaN(rAmt) &&
            amt >= 0 &&
            rAmt >= 0 &&
            amt === rAmt;

        if (isValid) {
            fatchData();
        }
        if (amount == "") {
            setRAmount('')
            fatchData();
        }

    }, [amount, Ramount, adminiStatus?.allowzero]);



    const fatchData = async () => {
        setLoading(true);
        Keyboard.dismiss()
        try {
            const url = `${APP_URLS.CashPickupRemainBalNEW}?Amount=${amount}&RCEID=${rceID}&Shopid=${shopId}`;
            console.log("API URL 👉🟰🟰🟰🟰🟰🟰", url);

            const response = await post({ url });
            console.log("API RESPONSE 👉🟰🟰🟰🟰🟰🟰", response);

            setAmountneed(response.amountneeded);
            setAdminiStatus(response);  // store full response
            if (response?.apiremainstatus && response?.sts && response?.allowzero) {
                navigation.navigate('CmsCoustomerInfo', { item, setAmount, setRAmount });

            }

            return response;

        } catch (error) {
            console.log("API ERROR ❌", error);
        } finally {
            setLoading(false);
        }
    };


    useFocusEffect(
        useCallback(() => {
            if (
                // adminiStatus?.allowzero === true &&
                cmsAddMFrom === 'AddMoneyPayResponse' &&
                amount &&
                Number(amount) === Number(Ramount)
            ) {
                fatchData();
                dispatch(clearEntryScreen(null));
            }
        }, [
            cmsAddMFrom,
            amount,
            Ramount,
        ])
    );



    const handleAddMoney = () => {
        if (!amount) {
            alert("Please enter amount");
            return;
        }
        dispatch(setCmsAddMFrom('CmsPrePay'))
        navigation.navigate("AddMoneyOptions", { amount: amountneed, paymentMode: 'UPI', from: 'PrePay' });

    };
    useEffect(() => {
        const getData = async () => {

            try {

                const response = await get({ url: APP_URLS.Support_Information });
                setSuppportData(response)
                console.log(response)
            } catch (error) {

            }
        };



        getData();
    }, []);
    const openPhoneApp = () => {
        Linking.openURL(`tel:${supportData.adminmobile}`);
        console.log(supportData.adminmobile, '=-=-=-==');

    };

    const dispatch = useDispatch()
    if (rctype === 'PrePay') {
        dispatch(setRcPrePayAnomut(amount))
    } else {
        dispatch(setRcPrePayAnomut(null))

    }


    return (
        <View style={styles.main}>

            <AppBarSecond title={'Pickup Amount'} />
            {/* ── Zero Only Alert Modal ── */}
            <Modal visible={showZeroAlert}
                transparent
                animationType="fade"
                onRequestClose={() => setShowZeroAlert(false)}
            >
                <View style={za.overlay}>
                    <View style={za.card}>
                        {/* ── Icon ── */}
                        <View style={za.iconCircle}>
                            <Text style={za.iconText}>⚠️</Text>
                        </View>

                        {/* ── Title ── */}
                        <Text style={za.title}>Zero Amount Only</Text>

                        {/* ── Message ── */}
                        <Text style={za.message}>
                            Full pickup is not allowed for this store.{'\n'}
                            You can only enter <Text style={za.bold}>₹0</Text> as the pickup amount.
                        </Text>

                        {/* ── Button ── */}
                        <TouchableOpacity
                            style={[za.btn, { backgroundColor: colorConfig.secondaryColor }]}
                            onPress={() => {
                                setAmount('0');
                                setRAmount('0');
                                setShowZeroAlert(false);
                            }}
                            activeOpacity={0.85}
                        >
                            <Text style={za.btnText}>Enter ₹0 & Continue</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={za.cancelBtn}
                            onPress={() => {
                                setShowZeroAlert(false);
                                navigation.goBack();
                            }}
                        >
                            <Text style={za.cancelText}>Go Back</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <AllBalance />
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >

                <View style={styles.container}>

                    {/* ── Info Card ── */}
                    <View style={styles.infoCard}>
                        <Text style={styles.infoTitle}>How pickup works</Text>
                        <Text style={styles.disc}>
                            Enter the amount you wish to collect from Customer Points below. Choose
                            One-time (Full & Final) payment, or Partial payment if you want to collect
                            it in installments.
                        </Text>
                        <Text style={styles.disc}>
                            Make sure your wallet has enough balance. If not, top it up using UPI, NEFT,
                            RTGS, IMPS, or a cash deposit before continuing.
                        </Text>
                    </View>

                    {/* ── Payment Card ── */}
                    <View style={styles.card}>
                        <Text style={styles.label}>Pickup Type</Text>
                        <TouchableOpacity
                            onPress={() => setShowPaymentDropdown(!showPaymentDropdown)}
                            activeOpacity={0.8}
                        >
                            <View style={styles.dropdownTrigger}>
                                <Text style={styles.dropdownTriggerText}>{paymentType}</Text>
                                <OnelineDropdownSvg />
                            </View>
                        </TouchableOpacity>

                        {showPaymentDropdown && (
                            <View style={styles.dropdown}>
                                {paymentOptions.map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.option,
                                            index === paymentOptions.length - 1 && { borderBottomWidth: 0 },
                                        ]}
                                        onPress={() => {
                                            setPaymentType(item.label);   // 👈 label set karo
                                            setShowPaymentDropdown(false);
                                            dispatch(setIsPartial(item.value));  // 👈 direct boolean bhejo
                                        }}
                                    >
                                        <Text style={styles.optionText}>{item.label}</Text>
                                    </TouchableOpacity>
                                ))}

                            </View>
                        )}

                        <Text style={[styles.label, { marginTop: hScale(16) }]}>Pickup Amount</Text>
                        <TextInput
                            placeholder={"Enter Pickup Amount"}
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={(t) => setAmount(t)}
                            style={styles.input}
                            placeholderTextColor={'#9AA0A6'}
                        />

                        <Text style={styles.label}>Confirm Amount</Text>
                        <View>
                            <TextInput
                                keyboardType="numeric"
                                placeholder="Re-enter the amount"
                                value={Ramount}
                                editable={!!amount}
                                onChangeText={(t) => {
                                    if (Number(t) <= Number(amount)) {
                                        setRAmount(t);

                                    }

                                }}
                                style={[
                                    styles.input,
                                    showMismatch && styles.inputError,
                                    Number(amount) > 0 && amount === Ramount && styles.inputSuccess,
                                ]}
                                placeholderTextColor={'#9AA0A6'}
                            />

                            {showMismatch && (
                                <View style={styles.righticon2}>
                                    <AlertSvg />
                                    <Text style={styles.miss}>Mismatch</Text>
                                </View>
                            )}
                            {Number(amount) > 0 && amount === Ramount && (
                                <View style={styles.righticon2}>
                                    {loading ? (
                                        <ShowLoaderBtn color="red" />
                                    ) : (
                                        null
                                    )}
                                </View>
                            )}
                        </View>

                        {/* First condition */}
                        {adminiStatus?.sts === false && (
                            <View style={styles.amountView}>
                                <Text style={styles.discNeedA}>
                                    Your wallet balance is short by
                                    <Text style={styles.amountN}> ₹{amountneed} </Text>
                                    to complete the transaction. Add the remaining amount below:
                                </Text>

                                <TouchableOpacity onPress={handleAddMoney} style={styles.btnstyle} activeOpacity={0.85}>
                                    <Text style={styles.btntxt}>Add Remaining Amount</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* Second condition */}
                        {adminiStatus?.apiremainstatus === false && adminiStatus?.sts === true && (
                            <View style={styles.amountView}>
                                <Text style={styles.discNeedA}>
                                    Administrator is running low on balance to complete the transaction.
                                    Please notify the administrator using the number below.
                                </Text>

                                <TouchableOpacity
                                    onPress={openPhoneApp}
                                    activeOpacity={0.85}
                                    style={styles.btnstyle}
                                >
                                    <Text style={styles.btntxt}>
                                        Call Administrator Now
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {adminiStatus?.allowzero === false &&
                            <View style={styles.zeroView}>
                                <View style={[styles.svgimg, { backgroundColor: `${colorConfig.secondaryColor}1A` }]}>
                                    <CmsZeroSvg />
                                </View>
                                <View style={styles.zeroTextCon}>
                                    <Text style={styles.zeroTitle}>
                                        Zero amount is not allowed
                                    </Text>

                                    <Text style={styles.zeroText}>
                                        Company policy allows a maximum of five zero-value pickup slips per
                                        store, per month.
                                        {adminiStatus?.msgshow}
                                    </Text>
                                </View>
                            </View>
                        }
                    </View>

                    <View style={styles.reportCard}>
                        <PartialPayReport Shopid={shopId} currentAmount={amount} />
                    </View>

                </View>
            </ScrollView>
        </View>
    );
};

export default CmsPrePay;

const RADIUS = wScale(12);

const styles = StyleSheet.create({

    main: {
        flex: 1,
        backgroundColor: '#F4F6F8'
    },
    scroll: {
        flex: 1,
    },
    // ── FIX: bottom padding so last card / button isn't hugging
    // the screen edge or hidden behind nav bars / keyboard.
    scrollContent: {
        paddingBottom: hScale(48),
    },
    container: {
        flex: 1,
        paddingHorizontal: wScale(14),
        paddingTop: hScale(14),
        rowGap: hScale(14),
    },

    // ── Cards ──
    infoCard: {
        backgroundColor: '#FFF7E0',
        borderRadius: RADIUS,
        paddingHorizontal: wScale(14),
        paddingVertical: hScale(12),
        borderWidth: 1,
        borderColor: '#FCE6A8',
    },
    infoTitle: {
        fontSize: wScale(14),
        fontWeight: '700',
        color: '#8A5A00',
        marginBottom: hScale(6),
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: RADIUS,
        paddingHorizontal: wScale(14),
        paddingVertical: hScale(16),
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    reportCard: {
        backgroundColor: '#fff',
        borderRadius: RADIUS,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
    },

    label: {
        fontSize: wScale(12),
        fontWeight: '600',
        color: '#6B7280',
        marginBottom: hScale(6),
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },

    righticon2: {
        position: "absolute",
        right: wScale(0),
        top: hScale(0),
        height: "85%",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingRight: wScale(12),
        width: wScale(44),
        marginRight: wScale(-2),
    },
    miss: {
        color: '#EF4444',
        fontSize: wScale(9),
        width: wScale(60),
        textAlign: 'right',
        marginTop: hScale(-4)
    },
    disc: {
        color: '#7A5300',
        fontSize: wScale(12.5),
        textAlign: 'justify',
        marginBottom: hScale(6),
        lineHeight: hScale(18),
    },
    discNeedA: {
        color: '#111827',
        fontSize: wScale(14),
        textAlign: 'justify',
        lineHeight: hScale(20),
    },
    amountN: {
        color: '#B91C1C',
        fontSize: wScale(15),
        fontWeight: '800',
    },
    btntxt: {
        color: "#fff",
        fontWeight: "700",
        textTransform: 'uppercase',
        fontSize: wScale(13),
        letterSpacing: 0.3,
    },
    btnstyle: {
        backgroundColor: '#EF4444',
        borderRadius: wScale(10),
        alignItems: 'center',
        paddingVertical: hScale(11),
        marginTop: hScale(10),
    },

    amountView: {
        marginTop: hScale(14),
        backgroundColor: '#FEF2F2',
        paddingHorizontal: wScale(12),
        paddingVertical: hScale(10),
        borderRadius: wScale(10),
        borderWidth: 1,
        borderColor: '#FCA5A5',
    },
    svgimg: {
        borderRadius: 10,
        paddingHorizontal: wScale(10),
        paddingVertical: hScale(5),
        marginVertical: hScale(5),
    },
    zeroView: {
        flexDirection: 'row',
        backgroundColor: '#FFF1F2',
        borderRadius: wScale(10),
        marginTop: hScale(14),
        paddingVertical: hScale(10),
        paddingHorizontal: wScale(10),
        borderWidth: 1,
        borderColor: '#FECDD3',
    },

    zeroTextCon: {
        paddingLeft: wScale(8),
        flex: 1,
    },
    zeroText: {
        fontSize: wScale(12.5),
        textAlign: 'justify',
        color: '#374151',
        marginTop: hScale(4),
        lineHeight: hScale(18),
    },
    zeroTitle: {
        fontSize: wScale(15),
        fontWeight: '700',
        color: '#111827',
    },
    dropdownTrigger: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: wScale(10),
        paddingHorizontal: wScale(14),
        height: hScale(48),
        backgroundColor: '#F9FAFB',
    },
    dropdownTriggerText: {
        fontSize: wScale(14.5),
        color: '#111827',
        fontWeight: '500',
    },
    dropdown: {
        backgroundColor: '#fff',
        borderRadius: wScale(10),
        marginTop: hScale(6),
        marginBottom: hScale(4),
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        borderWidth: 1,
        borderColor: '#EEF0F2',
        overflow: 'hidden',
    },
    option: {
        paddingVertical: hScale(12),
        paddingHorizontal: wScale(15),
        borderBottomWidth: 0.5,
        borderColor: '#eee'
    },
    optionText: {
        fontSize: wScale(14.5),
        color: '#111827'
    },
    input: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: wScale(10),
        paddingLeft: wScale(14),
        height: hScale(48),
        width: '100%',
        color: '#111827',
        fontSize: wScale(15),
        marginBottom: hScale(14),
        backgroundColor: '#F9FAFB',
    },
    inputError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    inputSuccess: {
        borderColor: '#22C55E',
        backgroundColor: '#F0FDF4',
    },
});

const za = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    card: { backgroundColor: '#fff', borderRadius: wScale(16), padding: wScale(24), width: '85%', alignItems: 'center' },
    iconCircle: { width: wScale(64), height: wScale(64), borderRadius: wScale(32), backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginBottom: hScale(12) },
    iconText: { fontSize: wScale(30) },
    title: { fontSize: wScale(20), fontWeight: '700', color: '#111', marginBottom: hScale(8), textAlign: 'center' },
    message: { fontSize: wScale(14), color: '#6B7280', textAlign: 'center', lineHeight: hScale(22), marginBottom: hScale(20) },
    bold: { fontWeight: '700', color: '#111' },
    btn: { width: '100%', paddingVertical: hScale(14), borderRadius: wScale(10), alignItems: 'center', marginBottom: hScale(10) },
    btnText: { color: '#fff', fontSize: wScale(15), fontWeight: '600' },
    cancelBtn: { paddingVertical: hScale(8) },
    cancelText: { fontSize: wScale(14), color: '#EF4444', fontWeight: '500' },
});