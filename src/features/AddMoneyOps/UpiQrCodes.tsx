import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    ScrollView,
    SafeAreaView,
    StyleSheet,
    Alert,
    ActivityIndicator,
    TouchableOpacity,
    BackHandler,
    AsyncStorage,
    Platform,
    KeyboardAvoidingView,
    ToastAndroid,
} from 'react-native';
import { hScale, wScale } from '../../utils/styles/dimensions';
import { APP_URLS } from '../../utils/network/urls';
import useAxiosHook from '../../utils/network/AxiosClient';
import DynamicButton from '../drawer/button/DynamicButton';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import FlotingInput from '../drawer/securityPages/FlotingInput';
import CountdownTimer from '../dashboard/components/ContdownTimer';
import Phonepesvg from '../drawer/svgimgcomponents/phonepesvg';
import PayTmSvg from '../drawer/svgimgcomponents/paytmsvg';
import BharatPeSvg from '../drawer/svgimgcomponents/bharatpesvg';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import { useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import DownloadSvg from '../drawer/svgimgcomponents/DownloadSvg';
import ShareSvg from '../drawer/svgimgcomponents/sharesvg';
import PaymentQR from './PaymentQR';
import { useNavigation } from '../../utils/navigation/NavigationService';

const UpiQrCodes = ({ route }) => {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);
    const { qrcode1Data, amnt, response } = route.params;
    const [hideqr, setHideqr] = useState(true);
    const [mszz, setMszz] = useState('');
    const { post } = useAxiosHook();
    const [code, setCode] = useState('');
    const [Txnid, setTxnId] = useState('');
    const [UtrNumber, setUtrNumber] = useState('');
    const [intervalId, setIntervalId] = useState(null);
    const [iscall, setIscall] = useState(true);
    const [bharatPeResponse, setBharatPeResponse] = useState(null);

    const navigation = useNavigation<any>();

    useEffect(() => {
        createqr(amnt, response.name);
    }, []);
    useEffect(() => {
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };

    }, [intervalId]);



    const start = (tx, type) => {
        if (intervalId) return;

        const id = setInterval(() => {
            paymentresponse(tx, type)
        }, 5000);

        setIntervalId(id);
    };
    const stop = () => {
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }
        navigation.navigate('HomeScreen')
    };
    const createqr = useCallback(async (amnt, type) => {
        let url = "";

        switch (type) {
            case "PAYTM":
                url = `${APP_URLS.PaytmQrGenerate}${amnt}`;
                break;

            case "PHONE PE":
                url = `${APP_URLS.PhonePeQrGenerate}${amnt}`;
                break;

            case "BHARAT PE":
                url = `${APP_URLS.BharatPeQrGenerate}${amnt}`;
                break;

            case "VASTBAZAAR":
                url = `${APP_URLS.VastbazzarUPIQRGenerate}${amnt}&Type=QR`;
                break;

            default:
                console.warn("Invalid QR Type:", type);
                alert("Invalid QR Type Selected!");
                return;
        }

        console.log("QR TYPE:", type, "URL:", url);

        try {
            const Response = await post({ url });


            const image = Response?.image;
            const tx = Response?.txnid;
            console.log("QR RESPONSE:", Response,type,tx);

            if (!tx) {
                alert("Transaction ID missing!");
                return;
            }

            setTxnId(tx);

            // If QR image exists
            if (image) {
                setCode(`data:image/png;base64,${image}`);

                // BharatPe does NOT auto-trigger start()
                if (type !== "BHARAT PE") {
                    start(tx, type);
                    paymentresponse(tx, type);
                }

            } else {
                alert(Response?.message || "Failed to generate QR");
            }

        } catch (error) {
            console.error("Error in createqr:", error);
            alert("Something went wrong while generating QR!");
        }
    }, [post]);


    const paymentresponse = useCallback(async (txnid, type) => {
        let url = '';

        switch (type) {
            case 'PAYTM':
                url = `${APP_URLS.getPaytmResponse}${txnid}`;
                break;
            case 'PHONE PE':
                url = `${APP_URLS.getPhonePeResponse}${txnid}`;
                break;
            case 'BHARAT PE':
                url = `${APP_URLS.getBharatPeResponse}txnid=${txnid}&Utr=${UtrNumber}`;
                break;
            case 'VASTBAZAAR':
                url = `${APP_URLS.VastbazaarResponse}${txnid}`;
                break;
            default:
                break;
        }

        try {
            const Response = await post({ url: url });
            console.log(url);
            console.log(Response, '***************');

            if (Response.toUpperCase() === 'YES') {
                stop();
                setHideqr(false);
                setCode('');

                if (Response.toUpperCase() === 'YES') {
                    stop();
                    setHideqr(false);
                    setCode('');
                    const result = {
                        pa: "",
                        pn: "",
                        mc: "",
                        mode: "",
                        orgid: "",
                        tid: "",
                        tr: Txnid,
                        am: amnt,
                        cu: "INR",
                        tn: "",
                        refUrl: ""
                    };

                    await AsyncStorage.setItem(
                        "upi_intent_params",
                        JSON.stringify({ result })  // <-- wrap inside result
                    );

                    await AsyncStorage.setItem("upi_intent_params", JSON.stringify(result));
                    navigation.navigate("AddMoneyPayResponse");

                    //             Alert.alert(
                    //                 'Payment Successful',
                    //                 'Your payment was completed successfully. Thank you for your transaction!',
                    //                 [
                    //                     {
                    //                         text: 'OK',
                    //                         onPress: async () => {

                    //                        await dispatch(clearLastScreen());
                    // navigation.navigate("DashboardScreen");

                    //                          },
                    //                     },
                    //                 ],
                    //                 { cancelable: false }
                    //             );
                }
            }
            console.log(txnid);
        } catch (error) {
            console.error('Error fetching QR code status:', error);
        }
    }, [post, intervalId, UtrNumber]);

    const paymentResponseForBharatPe = useCallback(async (txnid, utrNumber) => {

        console.log(utrNumber, Txnid, txnid, '---1ttt');


        let url = `${APP_URLS.getBharatPeResponse}txnid=${txnid}&Utr=${utrNumber}`;

        try {
            const response = await post({ url: url });
            console.log(url);
            console.log(response, '***************');

            setBharatPeResponse(response)
            if (response.toUpperCase() === 'YES') {
                stop();
                setHideqr(false);
                setCode('');

                const result = {
                    "pa": "",
                    "pn": "",
                    "mc": "",
                    "mode": "",
                    "orgid": "",
                    "tid": "",
                    "tr": Txnid,
                    "am": amnt,
                    "cu": "INR",
                    "tn": utrNumber,
                    "refUrl": ""
                }
                await AsyncStorage.setItem("upi_intent_params", JSON.stringify(result));
                navigation.navigate("AddMoneyPayResponse");
            } else {
                ToastAndroid.show(
                    "Payment status is NO. Please submit again.",
                    ToastAndroid.SHORT
                );
            }
            console.log(txnid);
        } catch (error) {
            console.error('Error fetching BharatPe payment status:', error);
        }
    }, [post, intervalId]);


    const downloadQRCode = async () => {
        if (code) {
            const downloadDest = `${RNFS.DownloadDirectoryPath}/qrcode-${APP_URLS.AppName}-${Txnid}-₹${amnt}.png`;
            try {
                await RNFS.writeFile(downloadDest, code.split('data:image/png;base64,')[1], 'base64');
                Alert.alert('Download Successful', 'QR code has been downloaded successfully.');
            } catch (error) {
                console.error('Error downloading QR code:', error);
                Alert.alert('Download Failed', 'Unable to download the QR code.');
            }
        }
    };
    const shareQRCode = async () => {
        if (code) {
            try {
                const shareOptions = {
                    title: 'Share QR Code',
                    url: code, // QR code URL or image path
                    type: 'image/png',
                    message: `${APP_URLS.AppName}\nAmount: ₹${amnt}\nTransaction ID: ${Txnid}\nHi, I am sharing the transaction details using '${APP_URLS.AppName}' App.`,
                };

                // Attempt to open the share dialog
                await Share.open(shareOptions);
            } catch (error) {
                console.error('Error sharing QR code:', error);
                Alert.alert('Share Failed', 'Unable to share the QR code.');
            }
        }
    };
    useEffect(() => {
        const backAction = () => {
            Alert.alert(
                "Confirmation",
                "Do you want to cancel txn or go back?",
                [
                    {
                        text: "Go Back",
                        onPress: () => {
                            navigation.navigate('DashboardScreen')
                        },
                    },


                    {
                        text: "Cancel",
                        style: "cancel",
                    },
                ]
            );

            return true;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, []);
    return (
        <View style={styles.container}>
            <AppBarSecond title={'Scann & Pay'} />

            <View style={styles.container}>
                <PaymentQR
                    bharatPeResponse={bharatPeResponse}   // ✅ PASS HERE
                    QrImg={code} amnt={amnt} name={response.name} Txnid={Txnid} onBharatpayresponse={paymentResponseForBharatPe} />

            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flexGrow: 1,
        marginHorizontal: wScale(5),
        marginTop: hScale(20),
    },
    contentContainer: {
        alignItems: 'center',
    },
    qrImageContainer: {
        alignItems: 'center',
    },
    titleContainer: {
        marginTop: hScale(20),
    },
    title: {
        color: '#333',
        fontSize: 18,
        fontWeight: 'bold',
    },
    option: {
        height: hScale(40),
        backgroundColor: '#fff',
        borderRadius: wScale(0),
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: wScale(10),
        marginBottom: hScale(20),
    },
    qrContainer: {
    },
    qrImage: {
        width: wScale(300),
        height: hScale(300),
        resizeMode: 'contain',
    },
    qrText: {
        fontSize: 16,
        marginTop: hScale(10),
        color: '#666',
    },
    timerText: {
        marginTop: hScale(10),
        fontSize: 16,
        color: '#333',
    },
    btn2: {
        paddingVertical: hScale(8),
        alignItems: 'center',
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '40%',
        paddingHorizontal: wScale(4),
    },
    btnborder: {
        borderRightWidth: wScale(0.5),
        height: "100%",
        borderColor: "rgba(255,255,255,0.5)",
    },
    btntext: {
        color: "#fff",
        fontSize: wScale(22),
        fontWeight: "bold",
        textAlign: "center",
    },
    homebtn: {
        flex: 1,
        alignItems: 'center'
    }
});

export default UpiQrCodes;
