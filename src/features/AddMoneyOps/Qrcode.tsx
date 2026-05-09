import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StyleSheet,
    Alert,
} from 'react-native';
import { hScale, wScale } from '../../utils/styles/dimensions';
import { APP_URLS } from '../../utils/network/urls';
import useAxiosHook from '../../utils/network/AxiosClient';
import { useNavigation } from '../../utils/navigation/NavigationService';
import DynamicButton from '../drawer/button/DynamicButton';

const QRCodePage = ({ route }) => {
    const { qrcode1response, amnt, generatedidData, qrtsData, msz } = route.params;
    const [showqr, setShowqr] = useState(true);
    const [hideqr, setHideqr] = useState(true);
    const [mszz, setMszz] = useState('');
    const { get, post } = useAxiosHook();
    const navigation = useNavigation();
    const [code, setCode] = useState(qrcode1response);
    const [showQR, setShowQR] = useState(null);
    const [Txnid, setTxnId] = useState('');
    const [intervalId, setIntervalId] = useState(null);
    const [timer, setTimer] = useState(120); 

    useEffect(() => {

        console.log(route.params);
      //  createqr(amnt);
    }, []);

    useEffect(() => {
        if (Txnid) {
            const interval = setInterval(() => {
                paymentresp2(Txnid);

                console.log('11111')
            }, 5000); 
            setIntervalId(interval);

            return () => clearInterval(interval); 
        }
        startTimer();
    }, [Txnid]);
    const startTimer = () => {
        const countdown = setInterval(() => {
            setTimer((prevTimer) => {
                if (prevTimer <= 1) {
                    clearInterval(countdown);
                    setHideqr(true); 
                    return 0;
                }
                return prevTimer - 1;
            });
        }, 1000);
        setIntervalId(countdown);
    };

    const handleButtonClick = () => {
        if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
        }
    };

    const Qrcodestatus = useCallback(async (amnt) => {
        try {
            const data = await get({ url: `${APP_URLS.genQr}amountqr=${amnt}` });
            const status = data["Status"];
            const msz = data["Message"];
            const qrtsData = data["Success"];
            const generatedidData = data["GeneratedUniqueid"];
            const qrcode1Data = data["QRCODE"];
            if (status === "Success" || msz === "Create") {
                setCode(`data:image/png;base64,${qrcode1Data}`);
            } else {
                Alert.alert(
                    'Alert',
                    msz,
                    [
                        {
                            text: 'OK',
                        },
                    ],
                    { cancelable: false }
                );
            }
        } catch (error) {
            console.error('Error fetching QR code status:', error);
        }
    }, [get]);

    const createqr = useCallback(async (amnt) => {
        try {
            const data = await post({ url: `UPI/api/data/UPIRESPONSEPHONEPE` });
            const image = data.image; 
            const tx = await data.txnid;
            setTxnId(tx);

            console.log(`${APP_URLS.paytmqrgen}amount=${amnt}`);
            setCode(`data:image/png;base64,${image}`);
        } catch (error) {
            console.error('Error fetching QR code status:', error);
        }
    }, [post]);

    const paymentresp2 = useCallback(async (txnid) => {

        console.log()
        try {
            const data = await post({url:`${APP_URLS.UPIRESPONSEPHONEPE}`}); 

            console.log('Payment Successful',data,`${APP_URLS.paytmresp}txnid=${txnid}`); 
            if(data ==='Yes'){
                Alert.alert(
                    'Payment Successful',
                    'Your payment was completed successfully. Thank you for your transaction!',
                    [
                        {
                            text: 'OK',
                            onPress:()=>navigation.navigate('Home')
                        },
                    ],
                    { cancelable: false }
                );
            }        
            if (intervalId) {
               // clearInterval(intervalId);
                setIntervalId(null);
            }
            console.log(txnid);
        } catch (error) {
            console.error('Error fetching QR code status:', error);
        }
    }, [post, intervalId]);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollView}>
                <View style={styles.contentContainer}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{mszz === 'Create' ? 'Create QR CODE' : 'QR CODE'}</Text>
                    </View>
                    <View style={styles.qrContainer}>
                        {hideqr ? (
                            <View style={styles.qrImageContainer}>
                                <Image
                                    source={{ uri: code, }}
                                    style={styles.qrImage}
                                    resizeMode='contain'
                                />
                                {/* <Text style={styles.timerText}>{`Time remaining: ${timer} seconds`}</Text> */}
                            </View>
                        ) : (
                            <Text style={styles.qrText}>QR code has expired.</Text>
                        )}
                    </View>
                    {/* //<DynamicButton title="Check Status" onPress={() => { paymentresp2(Txnid) }} styleoveride={styles.option} /> */}
                    {/* <DynamicButton title="Stop Timer" onPress={handleButtonClick} styleoveride={styles.option} /> */}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollView: {
        flexGrow: 1,
        marginHorizontal: wScale(10),
        marginTop: hScale(20),
    },
    contentContainer: {
        alignItems: 'center',
    },
    qrImageContainer: {
        alignItems: 'center',
    },
    qrButton: {
        height: hScale(60),
        width: wScale(60),
        marginBottom: hScale(20),
        backgroundColor: '#f0f0f0',
        borderRadius: hScale(30),
        justifyContent: 'center',
        alignItems: 'center',
    },
    qrIcon: {
        height: hScale(100),
        width: wScale(100),
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
        width: wScale(150),
        height: hScale(60),
        backgroundColor: '#fff',
        borderRadius: wScale(10),
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: wScale(10),
        marginBottom: hScale(20),
    },
    qrContainer: {
        marginTop: hScale(20),
        alignItems: 'center',
    },
    qrImage: {
        
        width: wScale(360),
        height: hScale(310),
        paddingLeft:hScale(100),
        paddingBottom:hScale(100),
        paddingTop:hScale(100),
        paddingRight:hScale(100),
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
});

export default QRCodePage;
