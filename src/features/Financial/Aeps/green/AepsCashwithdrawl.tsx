import { translate } from "../../../../utils/languageUtils/I18n";
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, ToastAndroid, Alert, } from 'react-native';
import { Modal as RNModal } from 'react-native';
import useAxiosHook from '../../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../../utils/network/urls';
import AppBar from '../../drawer/headerAppbar/AppBar';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { SCREEN_HEIGHT, hScale, wScale } from '../../../../utils/styles/dimensions';
import FlotingInput from '../../../drawer/securityPages/FlotingInput';
import DynamicButton from '../../../drawer/button/DynamicButton';
import { FlashList } from '@shopify/flash-list';
import { BottomSheet } from '@rneui/base/dist/BottomSheet/BottomSheet';
import ClosseModalSvg from '../../drawer/svgimgcomponents/ClosseModal';
import { useDeviceInfoHook } from '../../../../utils/hooks/useDeviceInfoHook';
import { RootState } from '../../../../reduxUtils/store';
import { useSelector } from 'react-redux';
import { AepsContext } from '../context/AepsContext';
import OnelineDropdownSvg from '../../../drawer/svgimgcomponents/simpledropdown';
import BankBottomSite from '../../../../components/BankBottomSite';
import ShowLoader from '../../../../components/ShowLoder';
import RNFS from 'react-native-fs';
import DeviceInfo from 'react-native-device-info';
import SelectDevice from '../DeviceSelect';
import { isDriverFound, openFingerPrintScanner, openFaceAuth } from 'react-native-rdservice-fingerprintscanner';
import { useNavigation } from '../../../../utils/navigation/NavigationService';
import QrcodAddmoneysvg from '../../../drawer/svgimgcomponents/QrcodAddmoneysvg';
// import QRCodeScanner from 'react-native-qrcode-scanner';
import { useRdDeviceConnectionHook } from '../../../hooks/useRdDeviceConnectionHook';
import { check } from 'react-native-permissions';
import TwoFAVerify from './TwoFaScreen';
import CheckSvg from '../../../drawer/svgimgcomponents/CheckSvg';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import Modal from "react-native-modal";

const getFormattedDate = () => {
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const dayOfWeek = days[now.getDay()];
    const dayOfMonth = now.getDate();
    const month = months[now.getMonth()];
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    return `${dayOfWeek} ${dayOfMonth} ${month} ${hours}:${minutes}:${seconds}`;
};

const AepsCW = () => {
    const { setBankId,
        bankid, aadharNumber, setFingerprintData, setAadharNumber, mobileNumber,
        setMobileNumber, consumerName, setConsumerName, bankName, setBankName, scanFingerprint,
        fingerprintData, isValid, setIsValid, deviceName, setDeviceName } = useContext(AepsContext);
    const [amountcont, setAmountcont] = useState('');
    const [servifee, setServifee] = useState('');
    const [otpcontroller, setOtpcontroller] = useState('');
    const [otpservisi, setOtpservisi] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [banklist, setBanklist] = useState([]);
    const [isbank, setisbank] = useState(false);
    const navigation = useNavigation<any>();

    const [isVisible, setIsVisible] = useState(true);
    const [isVisible2, setIsVisible2] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [status, setStatus] = useState('');
    const [amount, setamount] = useState('')
    const [date, setdate] = useState('')
    const [bnkrrn, setbnkrrn] = useState('')
    const [agentid, setagentid] = useState('');
    const [autofcs, setAutofcs] = useState(false);

    const { getNetworkCarrier, getMobileDeviceId, getMobileIp, getMobilePhoneNumber } =
        useDeviceInfoHook();
    const { userId, Loc_Data, activeAepsLine, isfaceScan } = useSelector((state: RootState) => state.userInfo);
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);
    const { latitude, longitude } = Loc_Data;
    const [isScan, setIsScan] = useState(false);
    const [isFacialTan, setisFacialTan] = useState(isfaceScan)
    const { get, post } = useAxiosHook();

    const isFirstCall = useRef(false);

    console.log(activeAepsLine)
    useEffect(() => {
        CheckEkyc();

        const banks = async () => {
            try {
                const url = `${APP_URLS.aepsBanklist}`;
                const url2 = `AEPS/api/Nifi/Aeps/banklist`;
                console.log(activeAepsLine ? url2 : url,)
                const response = await post({ url: activeAepsLine ? url2 : url })
                if (response.RESULT === '0') {
                    setBanklist(response['ADDINFO']['data'])
                }
            } catch (error) {

            }
        };
        banks();

    }, [])



    const getUserNamefunction = useCallback(async (MoNumber) => {
        setIsLoading(true)
        try {
            const response = await get({ url: activeAepsLine ? `${APP_URLS.aepsNameinfoNifi}${MoNumber}` : `${APP_URLS.aepsNameinfo}${MoNumber}` })
            setAutofcs(true);
            setConsumerName(response.RESULT);
            setIsLoading(false)

        } catch (error) {
            console.error('Error:', error);
        }
    }, [activeAepsLine, get, setConsumerName]);

    const aepsresponsepress = useCallback((addinfo: { TransactionStatus: any; BankRrn: any; TransactionAmount: any; BalanceAmount: any; }) => {
        // "Transaction Details",
        //             `Status: ${ADDINFO.TransactionStatus}\n` +
        //             `Bank RRN: ${ADDINFO.BankRrn}\n` +
        //             `Transaction Amount: ${ADDINFO.TransactionAmount}\n` +
        //             `Balance Amount: ${ADDINFO.BalanceAmount}`,
        const ministate = {
            bankName,
            TransactionStatus: addinfo.TransactionStatus,
            Name: consumerName,
            Aadhar: aadharNumber,
            mobileNumber: mobileNumber,
            BankRrn: addinfo.BankRrn,
            TransactionAmount: addinfo.TransactionAmount,
            RequestTransactionTime: getFormattedDate(),
            BalanceAmount: addinfo.BalanceAmount
        }

        navigation.navigate("AepsRespons", {

            ministate:
                ministate,
            mode: 'AEPS'
        })
    }, [bankName, consumerName, aadharNumber, mobileNumber, navigation]);

    const checkvideo = useCallback(async (transamount, agentid, AddharpayResponse) => {
        try {
            const response = await post({
                url: activeAepsLine ? `${APP_URLS.checkadharpayvideoNifi}?transamount=${transamount}&agentid=${agentid}`
                    :
                    `${APP_URLS.checkadharpayvideo}?transamount=${transamount}&agentid=${agentid}`
            });

            const { ADDINFO, RESULT } = await response.json();

            setIsLoading(false)


            if (RESULT === '0') {
                Alert.alert(
                    "Required",
                    "key_forthist_44",
                    [
                        {
                            text: "OK",
                            onPress: () => {

                            },
                            style: "default"
                        }
                    ],
                    { cancelable: false }
                );
            } else {
                const addinfo = AddharpayResponse.ADDINFO

                aepsresponsepress(addinfo);

            };
        } catch (error) {
            console.error(error);
        }
    }, [activeAepsLine, post, aepsresponsepress]);

    const adhar_Validation = useCallback(async (adharnumber) => {
        setIsLoading(true)

        try {
            const response = await get({ url: activeAepsLine ? `${APP_URLS.aadharValidation}${adharnumber}` : `${APP_URLS.aadharValidation}${adharnumber}` })

            // if (response['status'] === true){
            //                     setadharIsValid(true);

            // }else
            if (response['status'] === true) {
                setIsValid(true);
            } else {
                setIsValid(false);

                ToastAndroid.showWithGravity(
                    `Please Enter Valid Aadhar number`,
                    ToastAndroid.SHORT,
                    ToastAndroid.BOTTOM,
                );
            }
            setIsLoading(false)

        } catch (error) {
        }
    }, [activeAepsLine, get, setIsValid]);

    const [isFace, setIsFace] = useState(false)

    const BEnQ = useCallback(async (captureResponse1: any, cardnumberORUID1: any, pidDataX: any, isface: any) => {
        ToastAndroid.show(String(isface ? 'ok' : 'OK'), ToastAndroid.SHORT);
        setIsLoading(true);

        try {
            const Model = getMobileDeviceId();
            const address = latitude + longitude;
            const currentFormattedDate = getFormattedDate();

            const jdata = {
                capxml: pidDataX,
                captureResponse: captureResponse1,
                cardnumberORUID: cardnumberORUID1,
                languageCode: 'en',
                latitude: latitude,
                longitude: longitude,
                mobileNumber: mobileNumber,
                merchantTranId: userId,
                merchantTransactionId: userId,
                paymentType: 'B',
                otpnum: otpcontroller,
                requestRemarks: 'TN3000CA06532',
                subMerchantId: 'A2zsuvidhaa',
                timestamp: currentFormattedDate,
                transactionType: 'CW',
                name: consumerName,
                Address: address,
                transactionAmount: amountcont,
                isFacialTan: isface  //ch
            };
            const headers = {
                trnTimestamp: currentFormattedDate,
                deviceIMEI: Model,
                "Content-type": "application/json",
                "Accept": "application/json",
            };

            const data = JSON.stringify(jdata);

            const response = await post({
                url: activeAepsLine ? 'AEPS/api/Nifi/app/Aeps/cashWithdrawal' : 'AEPS/api/app/Aeps/cashWithdrawal',
                data: data,
                config: { headers },
            });

            const { RESULT, ADDINFO, agentid } = response;
            setFingerprintData(720);
            setIsLoading(false);

            if (RESULT === '0') {
                const addinfo = ADDINFO;
                aepsresponsepress(addinfo);
                checkvideo(amount, agentid, response);
            } else {

                if (isface) {
                    Dialog.show({
                        type: ALERT_TYPE.DANGER,
                        title: 'cashWithdrawal....',
                        textBody: ADDINFO || 'Unknown error occurred',
                        closeOnOverlayTap: false,
                        button: 'OK',
                        onPressButton: () => {
                            Dialog.hide();

                        },
                    });
                } else {
                    Alert.alert(isface ? 'cashWithdrawal-F' : 'CW-NF', ADDINFO);

                }
            }
        } catch (error) {
            console.error('Error during balance enquiry:', error);
            setIsLoading(false);
        }
    }, [
        latitude,
        longitude,
        mobileNumber,
        userId,
        otpcontroller,
        consumerName,
        amountcont,
        isFacialTan,
        checkvideo,
        activeAepsLine,
        setFingerprintData,
        aepsresponsepress,
        getMobileDeviceId
    ]);

    const OnPressEnq = useCallback(async (fingerprintData: { [x: string]: { Skey: { content: any; }; }; }, pidDataXx: any) => {
        setIsLoading(true);

        const pidDataX = pidDataXx;
        if (!fingerprintData || !fingerprintData["PidData"]) {
            Alert.alert('Error', 'Invalid fingerprint data. Please try again.', [{ text: 'OK', onPress: () => { } }]);
            setIsLoading(false);
            return;
        }

        if (!aadharNumber) {
            Alert.alert('Error', 'Aadhar number and Bank ID are required.', [{ text: 'OK', onPress: () => { } }]);
            setIsLoading(false);
            return;
        }

        const cardnumberORUID = {
            adhaarNumber: aadharNumber,
            indicatorforUID: "0",
            nationalBankIdentificationNumber: bankid,
        };

        const captureResponse = {
            Devicesrno: fingerprintData["PidData"]['DeviceInfo'].additional_info.Param[0]['value'],
            PidDatatype: "X",
            Piddata: fingerprintData["PidData"]['Data'].content,
            ci: fingerprintData["PidData"].Skey.ci,
            dc: fingerprintData["PidData"].DeviceInfo.dc,
            dpID: fingerprintData["PidData"].DeviceInfo.dpId,
            errCode: fingerprintData["PidData"].Resp.errCode,
            errInfo: fingerprintData["PidData"].Resp.errInfo,
            fCount: fingerprintData["PidData"].Resp.fCount,
            fType: fingerprintData["PidData"].Resp.fType,
            hmac: fingerprintData["PidData"].Hmac,
            iCount: fingerprintData["PidData"].Resp.fCount,
            iType: "0",
            mc: fingerprintData["PidData"].DeviceInfo.mc,
            mi: fingerprintData["PidData"].DeviceInfo.mi,
            nmPoints: fingerprintData["PidData"].Resp.nmPoints,
            pCount: "0",
            pType: "0",
            qScore: fingerprintData["PidData"].Resp.qScore,
            rdsID: fingerprintData["PidData"].DeviceInfo.rdsId,
            rdsVer: fingerprintData["PidData"].DeviceInfo.rdsVer,
            sessionKey: fingerprintData["PidData"].Skey.content,
        };

        try {
            await BEnQ(captureResponse, cardnumberORUID, pidDataX, false);
            /// Alert.alert('Success', 'Fingerprint data submitted successfully.', [{ text: 'OK', onPress: () => {} }]);
        } catch (error) {
            console.error('Error during fingerprint data submission:', error);

            // Stop loading if error occurs
            setIsLoading(false);

            // Show error message to the user
            Alert.alert('Error', 'There was an issue submitting the fingerprint data. Please try again later.', [{ text: 'OK', onPress: () => { } }]);
        }
    }, [aadharNumber, bankid, BEnQ]);

    const OnPressEnq2 = useCallback(async (fingerprintData) => {
        const pidData = fingerprintData.pidDataJson.PidData;
        const DevInfo = pidData.DeviceInfo;
        const Resp = pidData.Resp;

        console.log(DevInfo);

        const cardnumberORUID = {
            adhaarNumber: aadharNumber,
            indicatorforUID: "0",
            nationalBankIdentificationNumber: bankid
        };

        console.log(cardnumberORUID);

        const captureResponse = {
            Devicesrno: isFace ? '' : (DevInfo.additional_info ? DevInfo.additional_info.Param[0].value : ''),
            PidDatatype: "X",
            Piddata: pidData.Data.content,
            ci: pidData.Skey.ci,
            dc: DevInfo.dc,
            dpID: DevInfo.dpId,
            errCode: Resp.errCode,
            errInfo: isFace ? fingerprintData.errInfo : Resp.errInfo,
            fCount: Resp.fCount,
            fType: Resp.fType,
            hmac: pidData.Hmac,
            iCount: Resp.fCount,
            iType: "0",
            mc: DevInfo.mc,
            mi: DevInfo.mi,
            nmPoints: Resp.nmPoints,
            pCount: "0",
            pType: "0",
            qScore: Resp.qScore,
            rdsID: DevInfo.rdsId,
            rdsVer: DevInfo.rdsVer,
            sessionKey: pidData.Skey.content
        };

        console.log(captureResponse, '>>>>>>>>>>>>>>>>>>>>>>');

        try {
            BEnQ(captureResponse, cardnumberORUID, "", true);
        } catch (error) {
            Alert.alert('Error', 'key_anerroro_9');
        } finally {
            // setIsLoading(true);
        }
    }, [aadharNumber, bankid, isFace, BEnQ]);

    const capture = useCallback(async (rdServicePackage: string) => {
        let pidOptions = '';

        switch (rdServicePackage) {
            case 'com.mantra.mfs110.rdservice':
                pidOptions = '<PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" pCount="0" pgCount="2" format="0" pidVer="2.0" timeout="10000" pTimeout="20000" posh="UNKNOWN" env="P" /> <CustOpts><Param name="mantrakey" value="" /></CustOpts> </PidOptions>';
                break; case 'com.mantra.rdservice':
                pidOptions = '<PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" pCount="0" pgCount="2" format="0" pidVer="2.0" timeout="10000" pTimeout="20000" posh="UNKNOWN" env="P" /> <CustOpts><Param name="mantrakey" value="" /></CustOpts> </PidOptions>';
                break;
            case 'com.acpl.registersdk_l1':
                pidOptions = '<PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" pCount="0" pgCount="2" format="0" pidVer="2.0" timeout="10000" pTimeout="20000" posh="UNKNOWN" env="P" wadh=""/> <CustOpts><Param name="" value="" /></CustOpts> </PidOptions>';
                break; case 'com.acpl.registersdk':
                pidOptions = '<PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" pCount="0" pgCount="2" format="0" pidVer="2.0" timeout="10000" pTimeout="20000" posh="UNKNOWN" env="P" wadh=""/> <CustOpts><Param name="" value="" /></CustOpts> </PidOptions>';
                break;
            case 'com.idemia.l1rdservice':
                //pidOptions = '<PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" pCount="0" pgCount="2" format="0" pidVer="2.0" timeout="10000" pTimeout="20000" posh="UNKNOWN" env="P" /> <Demo></Demo> <CustOpts><Param name="" value="" /></CustOpts> </PidOptions>';
                pidOptions = `<PidOptions ver="1.0"><Opts env="P" fCount="1" fType="2" iCount="0" iType="" pCount="0" pType="" format="0" pidVer="2.0" timeout="20000" wadh="" posh="UNKNOWN" /><Demo></Demo><CustOpts><Param name="" value="" /></CustOpts></PidOptions>`;
                break; case 'com.scl.rdservice':
                // pidOptions = '<PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" pType="" pCount="0"  format="0" pidVer="2.0" timeout="20000"  posh="UNKNOWN" env="P" /> <Demo></Demo> <CustOpts><Param name="" value="" /></CustOpts> </PidOptions>';
                pidOptions = `<PidOptions ver="1.0"><Opts env="P" fCount="1" fType="2" iCount="0" iType="" pCount="0" pType="" format="0" pidVer="2.0" timeout="20000" wadh="" posh="UNKNOWN" /><Demo></Demo><CustOpts><Param name="" value="" /></CustOpts></PidOptions>`;
                break;
            default:
                console.error('Unsupported rdServicePackage');
                return;
        }

        openFingerPrintScanner(rdServicePackage, pidOptions)

            .then(async (res) => {
                setisFacialTan(false)
                const deviceInfoString = JSON.stringify(res, null, 2);

                if (res.errorCode === 720) {
                    setFingerprintData(720);
                } else if (res.status === -1) {
                    setFingerprintData(-1);
                } else if (res.errorCode === 0) {

                    OnPressEnq(res.pidDataJson, res.pidDataXML);

                    //    Alert.alert('Tab Fingerprint Data', responseString);

                }
            })
            .catch(async (error) => {

                setFingerprintData(720);
                Alert.alert('Please check if the device is connected.');
            });
    }, [OnPressEnq, setFingerprintData, setisFacialTan]);

    const openFace = useCallback(() => {
        openFaceAuth(userId)
            .then(async (response) => {
                console.log('Face Auth Response:', response);
                if (response.errorCode === 892) {
                    return;
                }
                OnPressEnq2(response);
            })
            .catch((error) => {
                console.error('Error during face authentication:', error);
                return null;
            });
    }, [userId, OnPressEnq2]);

    const handleSelection = useCallback((selectedOption: string) => {
        if (deviceName === 'Device') {
            return;
        }


        const captureMapping = {
            'Mantra L0': 'com.mantra.rdservice',
            'Mantra L1': 'com.mantra.mfs110.rdservice',
            'Startek L0': 'com.acpl.registersdk',
            'Startek L1': 'com.acpl.registersdk_l1',
            'Morpho L0': 'com.scl.rdservice',
            'Morpho L1': 'com.idemia.l1rdservice',
            'Aadhaar Face RD': 'Aadhaar Face RD',
        };

        const selectedCapture = captureMapping[selectedOption];
        if (selectedCapture) {
            if (selectedOption === 'Aadhaar Face RD') {
                // setisFacialTan(false)        //ch
                setIsFace(selectedOption === 'Aadhaar Face RD')
                openFace();
            } else {
                isDriverFound(selectedCapture)
                    .then((res) => {
                        capture(selectedCapture);
                    })
                    .catch((error) => {
                        console.error('Error finding driver:', error);
                        alert('key_errorcou_39');
                    });
            }
        } else {
            alert('Invalid option selected');
        }
    }, [deviceName, openFace, capture]);

    const onSuccess = useCallback((e) => {
        setisScan2(false);
        const data = e.data;

        const obj = {};
        const regex = /([a-zA-Z0-9]+)="([^"]+)"/g;
        let match;

        while ((match = regex.exec(data)) !== null) {
            obj[match[1]] = match[2];
        }
        setAadharNumber(obj.uid)
        setConsumerName(obj.name)
        // Linking.openURL(e.data).catch((err) => console.error('An error occurred', err));
    }, [setAadharNumber, setConsumerName]);
    const CheckEkyc = useCallback(async () => {

        setIsLoading(true)
        try {
            const url = activeAepsLine ? `${APP_URLS.checkekycNifi}` : `${APP_URLS.checkekyc}`;
            const response = await get({ url: url });
            const msg = response.Message;
            const Status = response.Status;
            console.log(response)
            if (response.Status === true) {
                setIsLoading(false)
                //CheckAeps();
                return;
            } else if (msg === '2FAREQUIRED') {
                setIsVisible2(msg === '2FAREQUIRED')
                setIsLoading(false)

                // navigation.replace("TwoFAVerify");

                return;
            } else if (msg === 'REQUIREDOTP') {
                setIsLoading(false)

                //  setUserStatus(msg);
                navigation.replace("Aepsekyc");
            } else if (msg === 'REQUIREDSCAN') {
                setIsLoading(false)

                //  setUserStatus(msg);

                navigation.replace("Aepsekycscan");
                return;
            } else {
                setIsLoading(false)

                Alert.alert('', msg, [
                    { text: 'OK', onPress: () => navigation.goBack(), },
                ], { cancelable: false });
            }
            setIsLoading(false)

        } catch (error) {

            console.log(error);
        } finally {
        }
    }, []);
    const findIsFacialTan = useCallback((iINNo) => {

        console.log(iINNo)
        const bank = banklist.find(item => item.iINNo === iINNo);
        console.log(bank, '&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&')

        if (bank && bank.isFacialTan) {
            console.error(bank.isFacialTan);
            setisFacialTan(bank.isFacialTan);
            CheckEkyc()
        } else {
            CheckEkyc()
        }
    }, [banklist, CheckEkyc]);

    const handleClose = () => {
        setIsVisible(false);
    };
    const handleUploadVideo = () => {
        setIsVisible(false);
    };
    const AepsVideoResponseDialog = ({ status, amount, date, bnkrrn, aadharNumber, agentid }) => {
        const [isVisible, setIsVisible] = useState(true);


        return (
            <RNModal
                visible={isVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setIsVisible(false)}
            >
                <View style={styles.container}>
                    <View style={styles.dialog}>
                        <Text style={styles.title}>{translate("Transaction_Details")}</Text>
                        <Text style={styles.detailText}>Transaction Status: {status}</Text>
                        <Text style={styles.detailText}>Bank RRN: {bnkrrn}</Text>
                        <Text style={styles.detailText}>Date & Time: {date}</Text>
                        <Text style={styles.detailText}>Amount: ₹{amount}</Text>
                        <Text style={styles.detailText}>Aadhar Number: {aadharNumber}</Text>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleUploadVideo}
                        >
                            <Text style={styles.buttonText}>{translate("Upload_Video_Now")}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.button, { backgroundColor: '#dc3545' }]}
                            onPress={handleClose}
                        >
                            <Text style={styles.buttonText}>{translate("Close")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </RNModal >
        );
    };

    const handleServifeeChange = useCallback((text) => setServifee(text), [setServifee]);
    const handleAadharChange = useCallback((text) => {
        setAadharNumber(text);
        if (text.length === 12) {
            adhar_Validation(text)
        } else {
            setIsValid(false)
        }
    }, [setAadharNumber, adhar_Validation, setIsValid]);
    const handleMobileChange = useCallback((text) => {
        setMobileNumber(text);
        if (text.length === 10) {
            getUserNamefunction(text);
        }
    }, [setMobileNumber, getUserNamefunction]);
    const handleConsumerNameChange = useCallback((text) => {
        setConsumerName(text);
    }, [setConsumerName]);
    const handleAmountChange = useCallback((text) => {
        setAmountcont(text);
    }, [setAmountcont]);

    const handleBankPress = useCallback(() => { setIsVisible2(false); setisbank(true) }, [setisbank]);
    const handleScanPress = useCallback(() => { setisScan2(true) }, [setisScan2]);
    const handleLongPress = useCallback(() => { alert(`latitude--${latitude}\nlongitude--${longitude}`) }, [latitude, longitude]);

    const [isScan2, setisScan2] = useState(false)
    if (isScan2) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ alignItems: 'center', position: 'absolute', top: 30, right: 20 }}>
                <TouchableOpacity
                    onPress={() => setisScan2(false)}
                    style={{
                        backgroundColor: '#ff4d4d',
                        padding: 10,
                        borderRadius: 10,
                        width: hScale(40),
                        height: hScale(40),
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ color: 'white', fontSize: 20 }}>{translate("X")}</Text>
                </TouchableOpacity>
            </View>

            {/* QR Code Scanner */}
            {/* <QRCodeScanner onRead={onSuccess} /> */}
        </View>
    }



    return (
        <View style={styles.main}>

            <ScrollView contentContainerStyle={{ paddingBottom: 50 }}
                pointerEvents={isVisible2 ? "box-none" : "auto"}>
                <View style={styles.container}>
                    <View style={styles.body}>

                        <TouchableOpacity
                            style={{}}
                            onPress={handleBankPress}
                        >
                            <>


                                <FlotingInput
                                    editable={false}
                                    label={bankName.toString()}
                                    onChangeText={setServifee}
                                    placeholder={bankName ? "" : "Select Your Bank"}
                                    keyboardType="number-pad"
                                    onChangeTextCallback={handleServifeeChange}
                                />
                            </>
                            <View style={styles.righticon}>
                                <OnelineDropdownSvg />
                            </View>
                        </TouchableOpacity>
                        <View style={{}}>

                            <FlotingInput
                                editable={bankName !== ''}

                                label={'Enter Aadhar Number'}
                                value={aadharNumber}
                                maxLength={12}
                                onChangeText={setAadharNumber}
                                keyboardType="number-pad"
                                onChangeTextCallback={handleAadharChange}
                            />

                            {/* <View style={[styles.righticon2]}>
                                {isValid && <CheckSvg color='green' />}

                                <TouchableOpacity
                                    onLongPress={handleLongPress}
                                    onPress={handleScanPress}
                                    style={{ marginLeft: wScale(30) }}>
                                    <QrcodAddmoneysvg />

                                </TouchableOpacity>
                            </View> */}
                        </View>


                        <FlotingInput
                            label="Enter Mobile Number"
                            value={mobileNumber}
                            onChangeText={setMobileNumber}
                            onChangeText={setMobileNumber}
                            keyboardType="number-pad"
                            maxLength={10}
                            editable={bankName !== ''}
                            onChangeTextCallback={handleMobileChange}
                        />
                        <FlotingInput
                            editable={bankName !== ''}

                            label="Enter Consumer Name"
                            value={consumerName}
                            onChangeText={setConsumerName}
                            autoFocus={autofcs}
                            onChangeTextCallback={handleConsumerNameChange}
                        />
                        <FlotingInput
                            editable={bankName !== ''}

                            label="Enter Amount"
                            value={amountcont}
                            onChangeText={setAmountcont}
                            keyboardType="number-pad"
                            onChangeTextCallback={handleAmountChange}
                        />
                        {isLoading ? (
                            <ShowLoader />
                        ) : null}
                        <FlotingInput
                            editable={bankName !== ''}

                            label="Enter Service Fee"
                            value={servifee}
                            onChangeText={setServifee}
                            keyboardType="number-pad"
                            onChangeTextCallback={handleServifeeChange}
                            maxLength={3}

                        />



                        <SelectDevice
                            isProcees={
                                consumerName.length >= 4 && amountcont !== '' && isValid && mobileNumber.length >= 10 && aadharNumber.length >= 12 && bankName !== 'Select Bank'}
                            setDeviceName={setDeviceName}
                            device={'Device'}
                            isface2={false}
                            isface={isFacialTan

                            }

                            opPress={() => {

                                setDeviceName(deviceName);

                                handleSelection(deviceName);
                            }} pkg={undefined}
                            onPressface={openFace}
                        />
                        <View style={{ marginBottom: hScale(10) }} />

                        {(bankName !== '' && deviceName !== 'Device') &&
                            <DynamicButton
                                onPress={() => {
                                    setisFacialTan(false)
                                    console.log(amountcont !== '' && isValid && mobileNumber.length >= 10 && aadharNumber.length >= 12 && bankName !== 'Select Bank')
                                    console.log(amountcont, isValid, mobileNumber, aadharNumber, bankName, consumerName, "()()()()()()()()()((")

                                    if (bankName === 'Select Bank' ||
                                        mobileNumber.length < 10 ||
                                        consumerName === null ||
                                        aadharNumber.length < 12 ||
                                        isValid === false ||
                                        amountcont === '') {

                                    } else {
                                        handleSelection(deviceName);
                                    }
                                }}
                                title={'Scan & Proceed'}
                            />

                        }

                        {/* {true &&
                            <DynamicButton
                                onPress={() => {
console.log(latitude ,longitude)
                                    getFaceAuthResponse()


                                }}
                                title={'Scan & Proceed'}
                            />

                        } */}

                        {showDialog && (
                            <AepsVideoResponseDialog
                                status={status}
                                amount={amount}
                                date={date}
                                bnkrrn={bnkrrn}
                                aadharnum={aadharNumber}
                                agentid={agentid}
                            />
                        )}
                    </View>
                    {/* <TouchableOpacity onPress={aepsresponsepress}>
                        <Text style={{ color: 'red' }}>{translate("Aeps_Respons")}</Text>
                    </TouchableOpacity> */}
                </View>
            </ScrollView>
            {/* <BankBottomSite

                setBankId={setBankId}
                setisFacialTan={setisFacialTan}
                onPress1={(id) => {
                    console.log(id)

                    findIsFacialTan(id)
                }

                }
                bankdata={banklist}
                isbank={isbank}
                setBankName={setBankName}
                setisbank={setisbank}
            /> */}

            <BankBottomSite
                setBankId={setBankId}
                bankdata={banklist}
                isbank={isbank}
                setBankName={setBankName}
                setisbank={setisbank}
                onPress1={(id) => {
                    console.log(id)

                    findIsFacialTan(id)
                }

                }

                setisFacialTan={setisFacialTan}
            />
            <Modal
                isVisible={isVisible2}
                backdropOpacity={0}
                animationIn="slideInUp"
                animationOut="slideOutDown"
                useNativeDriver={true}
                propagateSwipe={true}
                coverScreen={false}
                style={{
                    margin: 0,
                    justifyContent: "flex-end",
                    pointerEvents: "box-none",
                }}
            >
                <View
                    pointerEvents="auto"
                    style={{
                        height: "85%",
                        // backgroundColor: "white",
                        // borderTopLeftRadius: 20,
                        // borderTopRightRadius: 20,
                        // padding: 20,
                        // elevation: 10,
                        // flex: 1
                    }}
                >
                    <TwoFAVerify handle={() => setIsVisible2(false)} />
                </View>
            </Modal>

        </View >
    );
};

const styles = StyleSheet.create({
    righticon2: {
        position: "absolute",
        left: "auto",
        right: wScale(0),
        top: hScale(0),
        height: "85%",
        alignItems: "center",
        justifyContent: "center",
        paddingRight: wScale(12),
        // width: wScale(44),
        marginRight: wScale(-2),
        flexDirection: 'row'
    },
    main: {
        flex: 1,
    },
    container: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: wScale(20),
        flex: 1,
        paddingBottom: hScale(20)
    },
    container2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    dialog: {
        backgroundColor: '#fff',
        padding: wScale(20),
        borderRadius: hScale(10),
        width: '80%',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
    },
    title: {
        fontWeight: 'bold',
        fontSize: hScale(18),
        marginBottom: hScale(10),
        color: '#007bff',
    },
    detailText: {
        marginBottom: hScale(5),
        fontSize: hScale(16),
    },
    button: {
        backgroundColor: '#28a745',
        padding: hScale(10),
        borderRadius: hScale(5),
        marginTop: hScale(10),
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },

    body: {
        paddingTop: hScale(10),
    },
    inputstyle: {
        marginBottom: hScale(0),
    },


    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        height: '50%'
    },
    modalContainer: {
        backgroundColor: '#fff',
        width: wScale(400),
        height: hScale(400),
        borderRadius: hScale(2),
        overflow: 'hidden',
    },
    modalHeader: {
        backgroundColor: '#007bff',
        paddingVertical: hScale(1),
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: hScale(18),
        color: '#fff',
    },
    modalContent: {
        padding: hScale(5),
        numOfLines: 1 // Typo in original file preserved? No, I'll assume it's fine.
    },
    contentText: {
        fontSize: hScale(16),
        marginBottom: hScale(0.5),
    },
    modalFooter: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderTopWidth: hScale(0.1),
        borderTopColor: '#ccc',
    },
    footerButton: {
        paddingVertical: hScale(21),
    },
    footerButtonText: {
        fontSize: hScale(12),
        color: 'green',
    },
    righticon: {
        position: "absolute",
        left: "auto",
        right: wScale(0),
        top: hScale(0),
        height: "100%",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingRight: wScale(12),
    },
});

export default AepsCW;
