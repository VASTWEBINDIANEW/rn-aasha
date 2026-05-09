import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, FlatList, Linking, AsyncStorage, ToastAndroid, Image, AppState } from 'react-native';
import { hScale, wScale } from '../../utils/styles/dimensions';
import { useNavigation } from '../../utils/navigation/NavigationService';
import useAxiosHook from '../../utils/network/AxiosClient';
import { APP_URLS } from '../../utils/network/urls';
import { useDeviceInfoHook } from '../../utils/hooks/useDeviceInfoHook';
import { RootState } from '../../reduxUtils/store';
import { useSelector } from 'react-redux';
import { encrypt } from '../../utils/encryptionUtils';
import { colors, FontSize } from '../../utils/styles/theme';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import Upipaymentoptionssvg from '../drawer/svgimgcomponents/Upipaymentoptionssvg';
import QrcodSvg from '../drawer/svgimgcomponents/QrcodSvg';
import uuid from 'react-native-uuid';
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import AllBalance from '../../components/AllBalance';
import ShowLoaderBtn from '../../components/ShowLoaderBtn';
import { NativeModules } from "react-native";
import OtheAddMOptions from './OtheAddMOptions';
import { clearEntryScreen } from '../../reduxUtils/store/userInfoSlice';
const { UpiNative } = NativeModules;
const AddMoneyOptions = ({ route }) => {

    const { colorConfig, IsDealer, Loc_Data, cmsAddMFrom } = useSelector((state: RootState) => state.userInfo);
    console.log(cmsAddMFrom, '-==-==');

    const color1 = `${colorConfig.secondaryColor}20`
    const { amount, jsonData, paymentMode, chargeType, from } = route.params;
    const { getNetworkCarrier, getMobileDeviceId, getMobileIp } =
        useDeviceInfoHook();
    const { userId } = useSelector((state: RootState) => state.userInfo);
    const { get, post } = useAxiosHook();
    const navigation = useNavigation<any>();
    const [upich, setupichs] = useState('');
    const [charges, setCharges] = useState([]);
    const [chgs, setChgs] = useState('');
    const [Merchantkey, setMerchantkey] = useState('');
    const [Merchantid, setMerchantid] = useState('');
    const [marsalt, setMarsalt] = useState('');
    const [USERID, setUSERID] = useState('');
    const [Privatekey, setPrivatekey] = useState('');
    const [txnsuccessUrl, setTxnsuccessUrl] = useState('');
    const [txnfailureUrl, setTxnfailureUrl] = useState('');
    const [merchemail, setMerchemail] = useState('');
    const [merchmobile, setMerchmobile] = useState('');
    const [mrchname, setMrchname] = useState('');
    const [phonepeMin, setPhonepeMin] = useState('');
    const [phonepeMax, setPhonepeMax] = useState('');
    const [checkFun, setCheckFun] = useState('UPI');
    const [intentLoad, setIntentLoad] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [upiid, setUpiid] = useState('');
    const [minamnt, setMinamnt] = useState('');
    const [maxamnt, setMaxamnt] = useState('');
    const [perdaylimit, setPerdaylimit] = useState('');
    const [uselimit, setUselimit] = useState('');
    const [limitmessage, setLimitmessage] = useState('');
    const [dealerUpiStatus, setDealerUpiStatus] = useState('');
    const [dealerUpiid, setDealerUpiid] = useState('');
    const [dealerCapping, setDealerCapping] = useState('');
    const [selectedOption, setSelectedOption] = useState('UPI');
    const [charge, setCharge] = useState(null);
    const [totalCharge, setTotalCharge] = useState(null);
    const { latitude, longitude } = Loc_Data;
    useEffect(() => {
        upiCharges();
        getCharges();
        console.warn(latitude, longitude, '@@@@@@@@@')
    }, []);
    const getCharges = useCallback(async () => {
        console.log('Clicked:', amount);

        try {
            const userInfo = await get({ url: `${APP_URLS.addmoneyChg}${amount}` });

            setCharges(userInfo);
            console.log(userInfo);
            setIsLoading(false)

        } catch (error) {
            setIsLoading(false)

            console.error('Error fetching charges:', error);
        }
    }, []);

    const upiCharges = useCallback(async () => {

        try {
            const userInfo = await get({ url: `${APP_URLS.upicharges}` });
            setupichs(userInfo);
            console.log('upicharges', userInfo);
            setIsLoading(false)

        } catch (error) {
            setIsLoading(false)

            console.error('Error fetching charges:', error);
        }
    }, [get,]);
    const phonepestatus = useCallback(async () => {
        setIsLoading(true)

        try {
            const data = await get({ url: `${APP_URLS.phonepestatus}` });
            const resp = data["Status"];
            const msz = data["Message"];
            const phonepeMinValue = data["minmium"].toString();
            const phonepeMaxValue = data["maximium"].toString();
            setPhonepeMin(phonepeMinValue);
            setPhonepeMax(phonepeMaxValue);
            const phonepeam = parseFloat(amount);
            const phonepeMin1 = parseFloat(phonepeMinValue);
            const phonepemaxx1 = parseFloat(phonepeMaxValue);
            if (phonepeam >= phonepeMin1 && phonepeam <= phonepemaxx1) {
                if (resp === "Success") {
                    phonepe();
                } else {
                    showAlert(msz);
                }
            } else {
                showAmountRangeSnackBar(phonepeMin1, phonepemaxx1);
            }
            setIsLoading(false)

        } catch (error) {
            setIsLoading(false)

        }

    }, [])

    console.log(from)
    const phonepe = useCallback(async () => {
        setIsLoading(false)

        try {
            const data = await post({ url: `${APP_URLS.phonepeurl}Amount=${amount}` });
            const Status = data["Status"];
            const url = data["RESULT"];
            const supported = await Linking.canOpenURL(url);

            if (Status) {
                if (supported) {
                    await Linking.openURL(url);
                } else {
                    console.log("Don't know how to open URI: ", url);
                }
            } else {
                showAlert(url);
            }

            setIsLoading(false)

        } catch (error) {
            setIsLoading(false)

        }
    }, [])
    const upiqr = useCallback(async () => {
        console.log(from, '=-=-=-=-=-*/*/*/*/');


        if (from === '' || from === null || from === undefined || from !== 'abc') {
            const response = {
                QR: "",
                msg: "OKss",
                name: "VASTBAZAAR",
                qrstatus: "OK",
                status: true
            };

            navigation.navigate("UpiQrCodes", { response, amnt: amount });
            return;
        }

        setIsLoading(true);

        try {
            const data = await get({ url: `${APP_URLS.upitxChk}` });
            console.log('upiqr', data, '@@@@@@@@@@@@@@@@@@@@@@@@');

            const statuss = data["ShowQR"];
            const msz = data["msg"];

            if (statuss === "PRICEBASE" || statuss === "VAR_QR" || statuss === "UPIQR") {
                const min = msz?.minmium || upich.Minqr;
                const max = msz?.maximium || upich.Maxqr;

                const amountNum = parseFloat(amount);
                const minNum = parseFloat(min);
                const maxNum = parseFloat(max);

                if (amountNum >= minNum && amountNum <= maxNum) {
                    Qrcodestatus(amount);
                } else {
                    Alert.alert(
                        'Invalid Amount',
                        `For UPI Amount Should be between ₹${min} to ₹${max}`,
                        [{ text: 'OK' }]
                    );
                }
            } else {
                Qrcodestatus(amount);
            }

            setIsLoading(false);

        } catch (error) {
            setIsLoading(false);
            console.error('Error fetching charges:', error);
        }finally{
            setIsLoading(false)
        }
    }, [from, amount, navigation, upich, Qrcodestatus]);

    const Qrcodestatus = useCallback(async (amnt) => {
        setIsLoading(true)

        try {
            const response = await post({ url: `${APP_URLS.UPIQR}?amount=${amnt}` });
            console.log("=============================================================================");
            console.log(response);
            //Linking.openURL("upi://pay?tr=202101345671229366&tid=121313202101345671229366&pa=juspay@axisbank&mc=1234&pn= Merchant%20Inc&am=1.00&cu=INR&tn=Pay%20for%20merchant");


            if (response.name === "ICICI") {
                const status = response["qrstatus"];
                const msz = response["msg"];
                const qrtsresponse = response["qrstatus"];
                const generatedidresponse = response["GeneratedUniqueid"];
                const qrcode1response = response["QR"];

                if (response.status === true) {
                    navigation.navigate("QRCodePage", { qrcode1response, generatedidresponse, amnt });
                } else {
                    showAlert(msz);
                }
            }

            else if (response && response.status && response.qrstatus === "OK") {

                console.log(response, amnt)


                navigation.navigate("UpiQrCodes", { response, amnt });
                console.log("QR is valid, proceed with payment.");
            } else {
                ToastAndroid.showWithGravity(
                    response?.msg || "QR status is not OK, try again.",
                    ToastAndroid.LONG,
                    ToastAndroid.BOTTOM
                );
                console.log("QR status is not OK, try again.");
            }
            setIsLoading(false)

        } catch (error) {
            setIsLoading(false)

            console.error("Error fetching QR status:", error);
        }
    }, []);

    const showAlert = (message) => {
        Alert.alert(
            'Error',
            message,
            [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
            { cancelable: false }
        );
    };
    const showAmountRangeSnackBar = (min, max) => {
        Alert.alert(
            'Invalid Amount',
            `For UPI Amount Should be between ₹${min} To ₹${max}`,
            [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
            { cancelable: false }
        );
    };
    const upists = useCallback(async () => {
        const Model = await getMobileDeviceId();
        setIsLoading(true)

        try {
            const response = await get({ url: `${APP_URLS.upistatus}` });
            const ActiveApi = response['ActiveApi']
            if (ActiveApi === ActiveApi) {
                const payuamount = parseFloat(route.params['amount']);
                const paymin = parseFloat(response['Minqr']);
                const paymaxx = parseFloat(response['Maxqr']);
                if (payuamount >= paymin && payuamount <= paymaxx) {
                    console.log('is ok')
                    gatewaytype('UPI');
                } else {
                    Alert.alert(
                        'Warning',
                        `For UPI Amount should be between ₹ ${paymin} To ₹ ${paymaxx}`,
                        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
                        { cancelable: false }
                    );
                }
            } else if (ActiveApi === 'PHONEPE') {
                phonepestatus();
            }

            setIsLoading(false)

        } catch (error) {
            setIsLoading(false)

        }

    }, []);
    const upists2 = useCallback(async () => {
        const Model = await getMobileDeviceId();
        setIsLoading(true)

        try {
            const response = await get({ url: `${APP_URLS.upistatus}` });
            console.log(response);
            const ActiveApi = response['ActiveApi']
            const y = response['Status']
            if (y === 'Y') {
                upiuserDet();
                const payuamount = parseFloat(route.params['amount']);
                const paymin = parseFloat(response['Minqr']);
                const paymaxx = parseFloat(response['Maxqr']);
                if (payuamount >= paymin && payuamount <= paymaxx) {
                    console.log('is ok')

                } else {
                    Alert.alert(
                        'Warning',
                        `For UPI Amount should be between ₹ ${paymin} To ₹ ${paymaxx}`,
                        [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
                        { cancelable: false }
                    );
                }
            } else {
                Alert.alert(
                    'Warning',
                    `${y}`,
                    [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
                    { cancelable: false }
                );
            }
            setIsLoading(false)

        } catch (error) {
            setIsLoading(false)

        }

    }, []);

    const upiuserDet = (async () => {

        try {
            const data = await get({ url: `${APP_URLS.upiUserDetails}` });

            const status = data["Status"].toString();
            const msz = data["Message"];

            setIsLoading(false);

            if (status === "true") {
                const upiId = data["VPAID"].toString();
                const minAmount = data["Minamount"].toString();
                const maxAmount = data["Maxamount"].toString();
                const perDayLimit = data["PerdayLimit"].toString();
                const useLimit = data["UpiUseLimit"].toString();
                const limitMessage = data["PerdayLimitmsg"].toString();
                const dealerUpiStatus = data["Dealer status"].toString();
                const dealerUpiid = data["Dealer_VPAID"].toString();
                const dealerCapping = data["Dealer_caption"].toString();

                setUpiid(upiId);
                setMinamnt(minAmount);
                setMaxamnt(maxAmount);
                setPerdaylimit(perDayLimit);
                setUselimit(useLimit);
                setLimitmessage(limitMessage);
                setDealerUpiStatus(dealerUpiStatus);
                setDealerUpiid(dealerUpiid);
                setDealerCapping(dealerCapping);

                const perday = parseFloat(perDayLimit);
                const useday = parseFloat(useLimit);
                const amountt = parseFloat(amount);
                const min = parseFloat(minAmount);
                const maxx = parseFloat(maxAmount);
                const cappAmount = parseFloat(dealerCapping);

                if (dealerUpiStatus === "true") {
                    const dealerBal = parseFloat(data["Dealer Balance"].toString());
                    const payAmmot = dealerBal - amountt;

                    if (amountt <= dealerBal) {
                        if (payAmmot > cappAmount) {
                            if (amountt >= min && amountt <= maxx) {
                                // Navigate to UpipageDealerUpiId
                                console.log('Navigate to UpipageDealerUpiId');

                            } else {
                                Alert.alert(
                                    'Invalid Amount',
                                    `For UPI Amount Should be between ₹${min} to ₹${maxx}`,
                                    [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
                                    { cancelable: false }
                                );
                            }
                        } else {
                            Alert.alert(
                                'Error',
                                'Dealer Capping Is Low Please Contact To Admin',
                                [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
                                { cancelable: false }
                            );
                        }
                    } else {
                        Alert.alert(
                            'Error',
                            'Dealer Amount Is Low Please Contact To Dealer',
                            [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
                            { cancelable: false }
                        );
                    }
                } else {
                    if (useday <= perday) {
                        if (amountt >= min && amountt <= maxx) {
                            console.log('Navigate to Upimainpage');
                        } else {
                            Alert.alert(
                                'Invalid Amount',
                                `For UPI Amount Should be between ₹${min} to ₹${maxx}`,
                                [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
                                { cancelable: false }
                            );
                        }
                    } else {
                        Alert.alert(
                            'Error',
                            limitMessage,
                            [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
                            { cancelable: false }
                        );
                    }
                }
            } else {
                Alert.alert(
                    'Error',
                    `${msz} !!`,
                    [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
                    { cancelable: false }
                );
            }
            console.log(data);

            setIsLoading(false)

        } catch (error) {
            setIsLoading(false)

        }
    })
    const [payUParams, setPayUParams] = useState({})
    const gatewaytype = useCallback(async (type) => {
        console.log('type', type);
        setIsLoading(true)

        try {
            const data = await post({ url: `${APP_URLS.Chkpayu}type=${type}` })
            setPayUParams(data);
            console.log(data);

            var resp = data["Response"];
            var msz = data["Message"];
            if (resp == "Success") {
                setMerchantkey(data["Merchantkey"]);
                setMerchantid(data["Merchantid"]);
                setMarsalt(data["MerchantSalt"]);
                setUSERID(data["USERID"]);
                setPrivatekey(data["Privatekey"]);
                setTxnsuccessUrl(data["txnsuccessUrl"]);
                setTxnfailureUrl(data["txnfailureUrl"]);
                setMerchemail(data["email"]);
                setMerchmobile(data["mobile"]);
                setMrchname(data["name"]);

                if (type == "CC") {

                    Apitransitionsencrypt("CC", data);

                } else if (type == "DC") {
                    Apitransitionsencrypt('DC', data);


                } else if (type == "WA") {

                    Apitransitionsencrypt('WA', data);

                } else if (type == "NB") {


                    Apitransitionsencrypt('NB', data);
                } else if (type == "UPI") {
                    Apitransitionsencrypt('UP', data);

                }
            } else {
                Alert.alert(
                    'Warning',
                    ` ${msz} +!!!`,
                    [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
                    { cancelable: false }
                );
            }
            setIsLoading(false)

        } catch (error) {
            setIsLoading(false)

        }
    }, [post]);


    const Apitransitionsencrypt = useCallback(async (type, data1) => {
        try {
            const id = uuid.v4().toString().substring(0, 16);
            setIsLoading(true)
            const mobileNetwork = await getNetworkCarrier();
            const ip = await getMobileIp();
            const model = await getMobileDeviceId();


            // Perform Encryption
            const encryption = await encrypt([
                type,                            // Payment Type
                model,                           // Device Model
                latitude || 0,                    // Latitude
                longitude || 0,                   // Longitude
                model,                           // Device Model (again)
                "city",                          // City (example, should be dynamic if needed)
                "postcode",                      // Postal Code (example, should be dynamic if needed)
                mobileNetwork,                   // Mobile Network Carrier
                ip,                              // IP Address
                'Address'    //
            ]);

            const [
                typee, Modell, lat, long, Model2,
                city, postcode, mobileNetwork2, ip2, address
            ] = encryption.encryptedData;

            const key = encryption.keyEncode;
            const vv = encryption.ivEncode;

            const url = `${APP_URLS.sendgatewayReq}txtamt=${encodeURIComponent(amount)}&txnid=${encodeURIComponent(id)}&ddltypes=${encodeURIComponent(typee)}&Devicetoken=${encodeURIComponent(ip2)}&Latitude=${encodeURIComponent(lat)}&Longitude=${encodeURIComponent(long)}&ModelNo=${encodeURIComponent(Model2)}&City=${encodeURIComponent(city)}&PostalCode=${encodeURIComponent(postcode)}&InternetTYPE=${encodeURIComponent(mobileNetwork2)}&IP=${encodeURIComponent(ip2)}&Addresss=${encodeURIComponent(address)}&value1=${encodeURIComponent(key)}&value2=${encodeURIComponent(vv)}`;

            console.log('Request URL:', url);

            // API Call to Fetch Data
            const data = await post({ url });

            console.log('API Response:', data);

            const resp = data['Status'];

            const payUParam = await Object.assign({}, data, data1, { amount });
            savePayUParam(payUParam);
            if (resp === "Success") {
                console.log('Navigating with payUParam:', payUParam);
                navigation.navigate('SeamlessScreen', { payUParam });
            } else {
                const errorMsg = data["message"] || data["txnid"];
                Alert.alert(
                    'Payment Failed',
                    `Transaction failed. Reason: ${errorMsg}`,
                    [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
                    { cancelable: false }
                );
            }
            setIsLoading(false)

        } catch (error) {
            // Global error handling
            console.error('Error in Apitransitionsencrypt:', error.message);
            Alert.alert(
                'Error',
                `Something went wrong: ${error.message}`,
                [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
                { cancelable: false }
            );
        }
        setIsLoading(false)

    }, [amount, payUParams, navigation, latitude, longitude]);
    const savePayUParam = async (payUParam) => {

        console.error('Error saving payUParam', payUParam);

        try {
            await AsyncStorage.setItem('payUParam', JSON.stringify(payUParam));
        } catch (e) {
            console.error('Error saving payUParam', e);
        }
    };
    const gatwaypay = async (type) => {
        try {
            const result = await NativeModules.paygatway({
                type: type,
                pyamount: amount,
                pysurl: txnsuccessUrl,
                pyfurl: txnfailureUrl,
                pykey: Merchantkey,
                pysalt: marsalt,
                pyname: mrchname,
                pyemail: merchemail,
                pymobile: merchmobile,
                txnid: userId
            });
            console.log(result);

            if (result != null) {
                sendpgresponse(result);
            }
        } catch (error) {
            console.error("Can't do native stuff", error);
        }
    };
    const sendpgresponse = async (sendresp) => {
        try {
            const url = 'https://native.vastwebindia.com/PaymentGateway/api/data/Gatewayresponse';
            const body = JSON.stringify({ Response: sendresp });

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer DzgtGegwhg-T0A4KXwyBBkY09RohXL6_BlDrJXoZ0skrp8bDr36t57JwlmTHDI8GOMslQleie5UFCPT2S_QF3Zp6_eIdtymPpAV2cQryZMq_BQ91JP3NkhrPYvYCjkukBZ_RhG61060TuK8sCJs_eJ_dzP_LIVNHVwK01My4Wfiao7d0OJxDDOzx1KFvzug2ePLxJ83dSEmESJp1tDoNcziHmK5JuOhxhlrbtLTQd6uYP0p97MNVokp3C_dkI1peuXRwY_VyOnttjkXkHp7m2Wt4PAhfkSHERyujf4M6I3Ta7xcYqr-zl34qQlBbz4XDsSrbeJxEarsCMJizgp-Fys0u3ycYFK8lpvzZa61yR5rA77yozE1-GJoHeehY7kgmAmGQ8WMSsMbZM8-OqUVq_io5Ym5IeBe62stRLlDjNcpa07YqjbU6l8-CsjKO4azoS4Sbu9r7ANFjJFkARAiO068L12CNOKrfmuSRp7lyuWhZyv6gVHrUDqGh2F8LZPufLtwTCQe9NiMV9KafQ6uqa0Fmv00iDioGo57mpN0lQaw`
                },
                body: body
            });

            console.log(response.status);

            if (response.status === 200) {
                const data = await response.json();
                console.log(data);
            } else {
                throw new Error('Failed');
            }
        } catch (error) {
            console.error(error);
        }
    };
    useEffect(() => {
        const Model = getMobileDeviceId();
        console.log(Model);
    }, [])
    const getPaymentMethodValues = (method, charges) => {

        setIsLoading(true)

        const paymentMethod = charges["WalletChargesenc"][method];
        if (paymentMethod) {
            const { cardcharge, netrecived, total } = paymentMethod;
            setIsLoading(false)

            return ` Charge: ${cardcharge}\nNet Received: ${netrecived}\nTotal: ${total}`;
        } else {
            setIsLoading(false)

            return "Payment method not found!";
        }

    };
    const appState = useRef(AppState.currentState);
    const [paymentStarted, setPaymentStarted] = useState(false);

    const [intentparams, setIntentParams] = useState([]);

    const extractParams = (url) => {
        try {
            // 1) Agar "upi://pay" missing ho ya URL खराब ho
            if (!url.startsWith("http") && !url.startsWith("upi")) {
                url = "upi://pay/?" + url.replace(/^.*?\?/, "");
            }

            // 2) URL को safe तरीके से parse करो
            const safeUrl = new URL(url);

            // 3) Params को object में convert करो
            const params = {};
            for (let [key, value] of safeUrl.searchParams.entries()) {
                params[key] = decodeURIComponent(value);
            }

            return params;
        } catch (err) {
            // Worst-case fallback → manually split
            const fallbackParams = {};
            try {
                const query = url.split("?")[1];
                const pairs = query.split("&");

                pairs.forEach((pair) => {
                    const [key, value] = pair.split("=");
                    fallbackParams[key] = decodeURIComponent(value || "");
                });

                return fallbackParams;
            } catch (e) {
                return {};
            }
        }
    };
    const parseUpiResponse = (responseString) => {
        if (!responseString || typeof responseString !== "string") return {};

        return responseString.split("&").reduce((acc, pair) => {
            const idx = pair.indexOf("=");
            if (idx === -1) return acc;

            const key = pair.substring(0, idx);
            const value = pair.substring(idx + 1);

            acc[key] = value ? decodeURIComponent(value) : "";
            return acc;
        }, {});
    };


    const startPayment = async (upiUrl) => {
        if (!upiUrl) {
            Alert.alert("UPI URL missing");
            return;
        }

        setIntentLoad(true); // 🔄 START LOADING

        try {
            const result = await UpiNative.pay(upiUrl);
            console.log("RAW RESULT:", result);

            // 🔴 USER CANCELLED / NO RESPONSE
            if (result === "CANCELLED" || result === "NO_RESPONSE") {
                ToastAndroid.show("Payment Cancelled", ToastAndroid.SHORT);
                return;
            }

            // ✅ PARSE RESPONSE
            const parsed = parseUpiResponse(result);
            console.log("PARSED JSON:", parsed);

            const status = (parsed.status || parsed.Status || "").toUpperCase();

            // ✅ STATUS HANDLING
            if (status === "SUCCESS") {
                ToastAndroid.show("Payment Successful", ToastAndroid.SHORT);
                navigation.navigate("AddMoneyPayResponse");

            }
            else if (status === "FAILURE") {
                ToastAndroid.show("Payment Failed", ToastAndroid.SHORT);
                navigation.navigate("AddMoneyPayResponse");
            }
            else if (status === "SUBMITTED") {
                ToastAndroid.show("Payment Pending", ToastAndroid.SHORT);

                navigation.navigate("AddMoneyPayResponse");
            }
            else {
                ToastAndroid.show("Unknown Payment Response", ToastAndroid.SHORT);
            }

        } catch (e) {
            console.log("UPI ERROR:", e);
            ToastAndroid.show("UPI Failed", ToastAndroid.SHORT);
        } finally {
            setIntentLoad(false); // ✅ STOP LOADING (ALWAYS)
        }
    };




    const Vastbazzarqr = async (amnt) => {
        setIntentLoad(true);   // start loading

        try {
            const response = await post({
                url: `${APP_URLS.VastbazzarUPIQRGenerate}${amnt}&Type=Intent`
            });

            const generatedidresponse = response["txnid"];
            const qrcode1response = response["Intenturl"];

            const result = extractParams(qrcode1response);
            await AsyncStorage.setItem("upi_intent_params", JSON.stringify({ result }));

            setPaymentStarted(true);

            if (qrcode1response) {
                setIntentParams(result);

                try {
                    startPayment(qrcode1response);
                    // await Linking.openURL(qrcode1response);
                    console.log("UPI App Opened");
                } catch (err) {
                    console.log("Error opening UPI:", err);
                }
            } else {
                Alert.alert("Something went wrong!!");
            }

        } catch (error) {
            console.error("Error fetching QR status:", error);
            Alert.alert("Something went wrong!");
        } finally {
            setIntentLoad(false);   // stop loading ALWAYS
        }
    };


    const callSelfUPIIntent = async (amt) => {
        try {
            const url = `${APP_URLS.UPISUMSlab}?Amount=${amount}&Type=${chargeType}`;
            console.log("URL:", url);

            const response = await post({ url });
            console.log("API Response:", response);
            setCharge(response.Charge);
            setTotalCharge(response.TotalCharge);
            return response;
        } catch (error) {
            console.log("API Error:", error.response?.data || error.message);
            return null;
        }
    };


    useEffect(() => {
        callSelfUPIIntent(amount);
    }, []);

    const handleOptionSelect = (type: string) => {
        clearEntryScreen('')
        navigation.navigate("OtherPayMent", {
            paymentType: type,
            addAmount: amount,
        });

    };

    return (
        <View style={styles.main}>

            <AppBarSecond title={'Payment Options'} actionButton={undefined} onActionPress={undefined} onPressBack={undefined} titlestyle={undefined} />
            <AllBalance />
            <View style={styles.container}>
                <View style={[styles.chargesContainer,]}>
                    <View style={[styles.chargeview, { backgroundColor: `${colorConfig.secondaryColor}80` }]}>
                        <View style={styles.chargeinfo}>
                            <Text style={styles.chargesTitle}>Charges</Text>
                            <Text style={styles.chargesvalue}>{charge}</Text>

                        </View>
                        <View style={[styles.bordercontainer]} />

                        <View style={styles.chargeinfo}>
                            <Text style={[styles.chargesTitle,]}>
                                Net Amount
                            </Text>
                            <Text style={[styles.chargesvalue,]}>
                                {totalCharge}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={[styles.btncard, { backgroundColor: colorConfig.secondaryColor }]}>
                    <View style={[styles.row, {
                        borderWidth: 0, backgroundColor: 'transparent'
                    }]}>
                        <View>
                            <Text style={styles.amounttitle}>Added Amount</Text>
                            <Text style={[styles.amounttext,]}>{amount}</Text>

                        </View>
                        <View>
                            <Text style={[styles.amounttitle, { textAlign: 'right' }]}>Payment Mode</Text>
                            <Text style={[styles.amounttext, { textAlign: 'right' }]}>{paymentMode}</Text>

                        </View>
                    </View>
                    <Text style={styles.notText}>
                        Below are two ways to add a UPI payment to your wallet. Please select the method you want to add the payment
                        through. In QR mode, a QR code will open that will be valid for only 1 minute. In intent mode, you will be
                        able to make payments directly from any UPI mobile application installed on your mobile.
                    </Text>

                    <TouchableOpacity style={styles.row} onPress={() => { upiqr() }}>
                        <View style={styles.leftSection}>
                            <QrcodSvg />
                        </View>
                        <Text style={styles.label}>Generate QR</Text>

                        {isLoading ? <ShowLoaderBtn /> : <FontAwesome6 name="chevron-right" size={22} color="#fff" />}
                    </TouchableOpacity>

                    {/* Divider with text */}
                    <View style={styles.dividerContainer}>
                        <View style={styles.line} />
                        <Text style={styles.orText}>OR</Text>
                        <View style={styles.line} />
                    </View>

                    {/* Use Intent */}
                    <TouchableOpacity
                        style={styles.row}
                        onPress={() => Vastbazzarqr(amount)}
                    >
                        <View style={styles.leftSection}>
                            <Upipaymentoptionssvg />
                        </View>

                        <Text style={styles.label}>UPI Intent</Text>

                        {intentLoad ? (
                            <ShowLoaderBtn />
                        ) : (
                            <FontAwesome6 name="chevron-right" size={22} color="#fff" />
                        )}
                    </TouchableOpacity>
                    {(cmsAddMFrom === 'CmsPrePay' || cmsAddMFrom === 'PageA') && (
                        <>
                            <Text style={styles.otherTextS}>
                                Other Manual Payment Option's
                            </Text>
                            <OtheAddMOptions onSelect={handleOptionSelect} />
                        </>
                    )}
                </View>



            </View>

        </View>
    );
};

const styles = StyleSheet.create({
    main: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: wScale(10),
        paddingTop: hScale(10)
    },

    chargesContainer: {
        marginVertical: hScale(10),
        marginBottom: hScale(20)
    },
    chargesTitle: {
        fontSize: FontSize.massive,
        color: colors.white,
        textAlign: 'center',
    },
    chargesvalue: {
        fontSize: FontSize.regular,
        color: colors.white,
        fontWeight: 'bold',
        textAlign: 'center'
    },
    chargeview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: hScale(5),
        borderRadius: 20,
    },
    chargeinfo: {
        alignItems: 'center',
        flex: 1
    },


    amounttext: {
        fontSize: FontSize.heading,
        color: colors.white,
        fontWeight: 'bold',
    },
    amounttitle: {
        fontSize: wScale(14),
        color: colors.white,
    },
    bordercontainer: {
        borderRightWidth: wScale(2),
        borderRightColor: colors.black_01
    },

    option: {
        width: wScale(60),
        height: wScale(60),
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: wScale(1),
    },

    selected: {
        height: wScale(20),
        width: wScale(20),
        position: 'absolute',
        right: wScale(-7),
        top: hScale(-7),
        borderRadius: 20,
        alignItems: 'center',
        backgroundColor: 'green',
        justifyContent: 'center'
    },
    btncard: {
        backgroundColor: "#6A0DAD", // purple
        borderRadius: 14,
        paddingHorizontal: wScale(15),
        width: "100%",
        alignSelf: "center",
        paddingVertical: hScale(20)
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
        borderWidth: .5,
        borderColor: 'white',
        borderRadius: 5,
        paddingHorizontal: wScale(10),
        backgroundColor: 'rgba(0, 0, 0, 0.4)'
    },
    leftSection: {
        flexDirection: "row",
        alignItems: "center",
        padding: wScale(4),
        borderWidth: .5,
        borderColor: 'white',
        borderRadius: 3,
    },
    icon: {
        width: 34,
        height: 34,
        marginRight: 12,
    },
    label: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        marginLeft: wScale(10)
    },

    dividerContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 8,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: "#fff",
    },
    orText: {
        marginHorizontal: 10,
        color: "#fff",
        fontSize: 14,
        fontWeight: "500",
    },
    notText: {
        color: "#fff",
        fontSize: wScale(12),
        textAlign: 'justify',
        paddingBottom: hScale(10)
    },
    otherTextS: {
        fontSize: wScale(12),
        textAlign: 'right',
        color: '#fff',
        letterSpacing: wScale(1),
        marginTop: hScale(14)
    }


});

export default AddMoneyOptions;
