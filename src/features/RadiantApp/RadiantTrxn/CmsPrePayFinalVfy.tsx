import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
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
import { setRcPrePayAnomut } from '../../../reduxUtils/store/userInfoSlice';
import LottieView from 'lottie-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';

const CmsPrePayFinalVfy = ({ }) => {
    const { colorConfig, Loc_Data, cmsVerify, rctype, rcPrePayAnomut } = useSelector((state: RootState) => state.userInfo);

    const [amount, setAmount] = useState('');
    const [Ramount, setRAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const [status, setStatus] = useState('');
    const [amountneed, setAmountneed] = useState('');

    const [adminiStatus, setAdminiStatus] = useState({});
    const [supportData, setSuppportData] = useState([]);
    const navigation = useNavigation();

    const { post, get } = useAxiosHook();
    useEffect(() => {
        if (!amount || !Ramount) {
            setStatus('');
            return;
        }

        if (Number(amount) > 0 && Number(amount) === Number(Ramount)) {
            setStatus('MATCHED');
        } else {
            setStatus('MISMATCH');
        }
    }, [amount, Ramount]);

    const showMismatch = Ramount !== '' && amount !== '' && Number(amount) !== Number(Ramount);
    useEffect(() => {
        if (
            Number(amount) > 0 &&
            Number(amount) === Number(Ramount)
        ) {
            fatchData();
        }
    }, [amount, Ramount]);

    const fatchData = async () => {
        setLoading(true);

        try {
            const url = `${APP_URLS.CashPickupRemainBalVerify}?Amount=30000000`;
            console.log("API URL 👉", url);

            const response = await post({ url });
            console.log("API RESPONSE 👉", response);

            setAmountneed(response.amountneeded);
            setAdminiStatus(response);  // store full response

            return response;

        } catch (error) {
            console.log("API ERROR ❌", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        fatchData();

    }, [amount, Ramount]);

    const handleAddMoney = () => {
        if (!amount) {
            alert("Please enter amount");
            return;
        }

        navigation.navigate("AddMoneyOptions", { amount: amountneed, paymentMode: 'UPI', });

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
    };

    const dispatch = useDispatch()
    dispatch(setRcPrePayAnomut(amount))
    return (
        <View style={styles.main}>

            <AppBarSecond title={'Pickup Amount'} />
            <AllBalance />
            <ScrollView>
                <View style={styles.container}>


                    <LottieView
                        autoPlay={true}
                        loop={true}
                        style={styles.lotiimg}
                        source={require('../../../utils/lottieIcons/Money-bag2')}
                    />
                    <Text style={styles.sorryT}>
                        Sorry,</Text>
                    <Text style={styles.sorryD}>

                        the required balance is not available.

                    </Text>
                    {Number(amountneed) > 0 && (
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
                    {adminiStatus?.apiremainstatus === false && (

                        < View style={styles.amountView}>

                            <Text style={styles.discNeedA}>Administrator is running low on balance to complete the transaction.
                                Please notify the administrator by calling the mobile number provided below.

                            </Text>
                            <TouchableOpacity
                                onPress={openPhoneApp}
                                activeOpacity={0.7} style={styles.btnstyle}>
                                <Text style={styles.btntxt}>
                                    {/* +91 {supportData.adminmobile} */}
                                    Click Me to Call Administrator Now
                                </Text>
                            </TouchableOpacity>
                        </View>)}
                </View>
            </ScrollView >
        </View >
    );
};

export default CmsPrePayFinalVfy;



const styles = StyleSheet.create({

    main: {
        flex: 1,
        backgroundColor: '#fff'
    },
    container: {
        flex: 1,
        paddingHorizontal: wScale(15),
        paddingTop: hScale(20)
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
        color: '#000',
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
    sorryD: {
        color: '#000',
        fontSize: wScale(20),
        textAlign: 'center',
    },
    sorryT: {
        color: '#000',
        fontSize: wScale(40),
        fontWeight: 'bold',
        textAlign: 'center'

    },

    btntxt: {
        color: "#fff",
        fontWeight: "bold",
        textTransform: 'uppercase',

    },
    btnstyle: {
        backgroundColor: '#FF3B30',
        borderRadius: wScale(6),
        alignItems: 'center',
        paddingVertical: 3,
        marginLeft: wScale(5),
        marginBottom: hScale(4),
        paddingHorizontal: wScale(10),
        alignSelf: 'center',
        marginTop: hScale(5)
    },

    discRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    amountView: {
        marginBottom: hScale(10),
        backgroundColor: 'rgba(255, 0, 0, 0.3)',
        paddingHorizontal: wScale(10),
        borderRadius: 5,
        borderWidth: 1,
        borderColor: 'red',
        marginTop:hScale(20)

    },
    lotiimg: {
        height: hScale(150),
        width: wScale(140),
        alignSelf: 'center'
    },


});
