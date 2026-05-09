import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, TextInput, ToastAndroid, } from 'react-native';
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
            <AllBalance />
            <ScrollView>

                <View style={styles.container}>
                    <View style={[styles.bgColor, { backgroundColor: `${colorConfig.secondaryColor}33` }]}>
                        <View style={styles.notBg}>

                            <Text style={styles.disc}>
                                Please enter the amount you wish to collect from Customer Points in the field below. Here, you can
                                choose one-time (final payment) or multi-time pickup (partial payment) from Customer Points. If you
                                wish to collect the payment in installments, select Partial Payment.
                            </Text>
                            <Text style={styles.disc}>
                                Please check that you have the required wallet balance. If not, first add the required balance to your wallet
                                using UPI, NEFT, RTGS, IMPS, or cash deposit mode.
                            </Text>
                            <Text style={styles.disc}>
                                Please check that you have the required wallet balance. If not, first add the required balance to your wallet
                                using UPI, NEFT, RTGS, IMPS, or cash deposit mode.
                            </Text>

                        </View>
                        <TouchableOpacity onPress={() => setShowPaymentDropdown(!showPaymentDropdown)}
                        >
                            <TextInput placeholder={'Full & Final Pickup'}
                                value={paymentType}
                                editable={false} style={styles.input} placeholderTextColor={'#000'}

                            />

                            <View style={commonStyles.righticon2}>
                                <OnelineDropdownSvg />
                            </View>
                        </TouchableOpacity>

                        {showPaymentDropdown && (
                            <View style={styles.dropdown}>
                                {paymentOptions.map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.option}
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

                        <TextInput placeholder={"Enter Pickup Amount"}
                            keyboardType="numeric"
                            value={amount}
                            onChangeText={(t) => setAmount(t)}
                            style={styles.input}
                            placeholderTextColor={'#000'}


                        />

                        <View >
                            <TextInput
                                keyboardType="numeric"
                                placeholder="Enter Re-Amount"
                                value={Ramount}
                                editable={!!amount}
                                onChangeText={(t) => {
                                    if (Number(t) <= Number(amount)) {
                                        setRAmount(t);

                                    }

                                }}
                                style={styles.input}
                                placeholderTextColor={'#000'}
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
                                <View>
                                    <Text style={styles.discNeedA}>
                                        Your wallet balance is short by
                                        <Text style={styles.amountN}> ₹ {amountneed} </Text>
                                        to complete the transaction. Please enter the remaining amount by clicking below:-
                                    </Text>

                                    <TouchableOpacity onPress={handleAddMoney} style={styles.btnstyle}>
                                        <Text style={styles.btntxt}>Click on me to add the remaining amount</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Second condition */}
                        {adminiStatus?.apiremainstatus === false && adminiStatus?.sts === true && (
                            <View style={styles.amountView}>
                                <Text style={styles.discNeedA}>
                                    Administrator is running low on balance to complete the transaction.
                                    Please notify the administrator by calling the mobile number provided below.
                                </Text>

                                <TouchableOpacity
                                    onPress={openPhoneApp}
                                    activeOpacity={0.7}
                                    style={styles.btnstyle}
                                >
                                    <Text style={styles.btntxt}>
                                        {/* +91 {supportData.adminmobile} */}
                                        Click Me to Call Administrator Now
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}



                        {adminiStatus?.allowzero === false &&
                            <View style={styles.zeroView}>
                                <View style={[styles.svgimg, { backgroundColor: `${colorConfig.secondaryColor}1A` },
                                    // { transform: [{ rotate: '-190deg' }] },

                                ]}>
                                    <CmsZeroSvg />
                                </View>
                                <View style={styles.zeroTextCon}>
                                    <Text style={styles.zeroTitle}>
                                        Zero amount is not allowed.
                                    </Text>


                                    <Text style={styles.zeroText}>
                                        According to company rules and regulations, a retail executive can generate a maximum of five zero-value pickup slips from a particular store each month.
                                    </Text>
                                </View>
                            </View>
                        }
                    </View>
                    <View>
                        <PartialPayReport Shopid={shopId} currentAmount={amount} />
                    </View>

                </View>
            </ScrollView >
        </View >
    );
};

export default CmsPrePay;



const styles = StyleSheet.create({

    main: {
        flex: 1,
        backgroundColor: '#fff'
    },
    container: {
        flex: 1,
        paddingHorizontal: wScale(8),
        paddingTop: hScale(10),
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
        color: 'red',
        fontSize: wScale(9),
        width: wScale(60),
        textAlign: 'right',
        marginTop: hScale(-4)
    },
    disc: {
        color: 'red',
        fontSize: wScale(13),
        textAlign: 'justify',
        marginBottom: hScale(10)
    },
    discNeedA: {
        color: '#000',
        fontSize: wScale(15),
        textAlign: 'justify',
    },
    amountN: {
        color: '#000',
        fontSize: wScale(16),
        fontWeight: 'bold',

    },
    btntxt: {
        color: "#fff",
        fontWeight: "bold",
        textTransform: 'uppercase',
        fontSize: wScale(16)
    },
    btnstyle: {
        backgroundColor: '#FF3B30',
        borderRadius: wScale(6),
        alignItems: 'center',
        paddingVertical: 3,
        marginLeft: wScale(5),
        marginBottom: hScale(4),
        marginTop: hScale(5)
    },


    amountView: {
        marginBottom: hScale(10),
        backgroundColor: 'rgba(255, 0, 0, 0.3)',
        paddingHorizontal: wScale(10),
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'red',
        marginTop: hScale(20),
    },
    svgimg: {
        borderRadius: 10,
        paddingHorizontal: wScale(10),
        paddingVertical: hScale(5),
        marginVertical: hScale(5),

    },
    zeroView: {
        flexDirection: 'row',
        backgroundColor: 'rgba(253, 181, 181, 0.3)', flex: 1,
        // paddingVertical: hScale(8),
        paddingHorizontal: wScale(5)

    },

    zeroTextCon: {
        paddingLeft: wScale(4),
        flex: 1,
    },
    zeroText: {
        fontSize: wScale(13),
        textAlign: 'justify',
        color: '#000',
        marginTop: hScale(5)

    },
    zeroTitle: {
        fontSize: wScale(20),
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000',
    },
    dropdown: {
        backgroundColor: '#fff',
        borderRadius: 8,
        marginBottom: hScale(18),
        elevation: 5,
        borderWidth: 0.5,
        borderColor: '#ccc',
        marginTop: hScale(-10)
    },
    option: {
        paddingVertical: hScale(12),
        paddingHorizontal: wScale(15),
        borderBottomWidth: 0.5,
        borderColor: '#eee'
    },
    optionText: {
        fontSize: wScale(16),
        color: '#000'
    },
    bgColor: {
        paddingHorizontal: wScale(8),
        paddingTop: hScale(10),
        borderRadius: 5
    },
    notBg: {
        backgroundColor: '#fadc7a',
        paddingHorizontal: wScale(4),
        paddingTop: hScale(5),
        borderRadius: 4,
        marginBottom: hScale(8)
    },
    input: {
        borderWidth: wScale(0.5),
        borderColor: '#000',
        borderRadius: wScale(5),
        paddingLeft: wScale(15),
        height: hScale(48),
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#000',
        fontSize: hScale(18),
        marginBottom: hScale(15),
        backgroundColor: '#fff'

    },
});
