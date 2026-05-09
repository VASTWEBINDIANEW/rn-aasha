import { translate } from "../../../../utils/languageUtils/I18n";
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, ToastAndroid, Modal, Alert, PermissionsAndroid, AsyncStorage } from 'react-native';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import RNFS, { readFile } from 'react-native-fs';

import { SCREEN_HEIGHT, hScale, wScale } from '../../../utils/styles/dimensions';
import FlotingInput from '../../drawer/securityPages/FlotingInput';
import DynamicButton from '../../drawer/button/DynamicButton';
import { FlashList } from '@shopify/flash-list';
import { BottomSheet } from '@rneui/base/dist/BottomSheet/BottomSheet';
import ClosseModalSvg from '../../drawer/svgimgcomponents/ClosseModal';
import { useDeviceInfoHook } from '../../../utils/hooks/useDeviceInfoHook';
import { RootState } from '../../../reduxUtils/store';
import { useSelector } from 'react-redux';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import { AepsContext } from './context/AepsContext';
import ClosseModalSvg2 from '../../drawer/svgimgcomponents/ClosseModal2';
import OnelineDropdownSvg from '../../drawer/svgimgcomponents/simpledropdown';
import { colors } from '../../../utils/styles/theme';
import BankBottomSite from '../../../components/BankBottomSite';
import ShowLoader from '../../../components/ShowLoder';
import { ALERT_TYPE, Dialog, Toast } from 'react-native-alert-notification';
import { openSettings } from 'react-native-permissions';
import { launchCamera } from 'react-native-image-picker';
import { Video } from 'react-native-compressor';
import { isDriverFound, openFingerPrintScanner, openFaceAuth } from 'react-native-rdservice-fingerprintscanner';
import SelectDevice from './DeviceSelect';
import QrcodAddmoneysvg from '../../drawer/svgimgcomponents/QrcodAddmoneysvg';
// import QRCodeScanner from 'react-native-qrcode-scanner';
import { useRdDeviceConnectionHook } from '../../../hooks/useRdDeviceConnectionHook';
import { useLocationHook } from '../../../hooks/useLocationHook';
import CloseAadharSvg from '../../drawer/svgimgcomponents/CloseAadharSvg';
import NotFoundScreen from '../../../components/NotFoundScreen';

const AdharPay = ({ }) => {
    const navigation = useNavigation();
    const { isDeviceConnected } = useRdDeviceConnectionHook();

    const [amountcont, setAmountcont] = useState('');
    const [servifee, setServifee] = useState('');
    const [otpcontroller, setOtpcontroller] = useState('');
    const [bankname, setBankname] = useState('Select Your Bank');
    const [paybtn, setPaybtn] = useState(true);
    const [otpservisi, setOtpservisi] = useState(false);
    const [isScan, setIsScan] = useState(false);
    const { setBankId,
        bankid, aadharNumber, setFingerprintData, setAadharNumber, mobileNumber, setMobileNumber, consumerName, setConsumerName, bankName, setBankName, scanFingerprint, fingerprintData, isValid, setIsValid, deviceName, setDeviceName } = useContext(AepsContext);

    const [banklist, setBanklist] = useState([]);
    const [isbank, setisbank] = useState(false);
    const [ButtomText, setButtomText] = useState('');
    const [isVisible, setIsVisible] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [isLoading, setIsLoading] = useState(false)
    const [amount, setamount] = useState('')
    const [sts, setsts] = useState('')
    const [date, setdate] = useState('')
    const [bnkrrn, setbnkrrn] = useState('')
    const [agentid, setagentid] = useState('');
    const [autofcs, setAutofcs] = useState(false);

    const [dialogVisible, setDialogVisible] = useState(false);
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

    const formattedDate = `${dayOfWeek} ${dayOfMonth} ${month} ${hours}:${minutes}:${seconds}`;


    const closeDialog = () => {
        setDialogVisible(false);
    };

    const OnPressEnq = async (fingerprintData,pidDataXx) => {
        const pidData = fingerprintData.PidData;
        const DevInfo = pidData.DeviceInfo;
        const Resp = pidData.Resp;
        const pidDataX = pidDataXx;



        const cardnumberORUID = {
            adhaarNumber: aadharNumber,
            indicatorforUID: "0",
            nationalBankIdentificationNumber: bankid
        };

        const captureResponse = {
            Devicesrno: DevInfo.additional_info.Param[0].value,
            PidDatatype: "X",
            Piddata: pidData.Data.content,
            ci: pidData.Skey.ci,
            dc: DevInfo.dc,
            dpID: DevInfo.dpId,
            errCode: Resp.errCode,
            errInfo: Resp.errInfo,
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
        BEnQ(captureResponse, cardnumberORUID,pidDataX);
        try {

            // Alert.alert(
            //     'FingerPrint Done',
            //     'Scannned successfuly',
            //     [
            //       {
            //         text: 'continue',
            //         onPress: () => {
            //                                 },
            //       },
            //       {
            //         text: 'Cancel',
            //         style: 'cancel', 
            //       },
            //     ],
            //     { cancelable: false }
            //   );


        } catch (error) {
            Alert.alert('Error', 'key_anerroro_9');
        } finally {
            setIsLoading(true);
        }
    };




    const BEnQ = useCallback(async (captureResponse1, cardnumberORUID1, amount,pidDataX, otpcontroller) => {
        setIsLoading(true);
        try {
            const Model = await getMobileDeviceId();
            const address = `${latitude}${longitude}`; // Combine latitude and longitude as a string

            const jdata = {
                capxml:pidDataX,
                captureResponse: captureResponse1,
                cardnumberORUID: cardnumberORUID1,
                languageCode: 'en',
                latitude: latitude,
                longitude: longitude,
                mobileNumber: mobileNumber, // Ensure mobileNumber is defined
                merchantTranId: userId, // Ensure userId is defined
                merchantTransactionId: userId,
                paymentType: 'B',
                otpnum: otpcontroller, // Pass the OTP controller
                requestRemarks: 'TN3000CA06532',
                subMerchantId: 'A2zsuvidhaa',
                timestamp: formattedDate, // Ensure formattedDate is defined
                transactionType: 'M',
                name: consumerName, // Ensure consumerName is defined
                Address: address,
                transactionAmount: amount // Pass the amount
            };

            const headers = {
                'trnTimestamp': formattedDate,
                'deviceIMEI': Model,
                "Content-type": "application/json",
                "Accept": "application/json",
            };

            const data = JSON.stringify(jdata);

            const response = await post({
                url: activeAepsLine ? 'AEPS/api/Nifi/app/Aeps/Aadharpay' : 'AEPS/api/app/Aeps/Aadharpay',
                data: data,
                config: {
                    headers,
                },
            });

            const { RESULT, ADDINFO, agentid } = response;
            setFingerprintData(720);
            setIsLoading(false);
            //  setSts(ADDINFO.TransactionStatus);

            if (RESULT === '0') {
                checkvideo(amount, agentid, response);
            } else {
                setIsLoading(false);
                Alert.alert(`Note:`, ADDINFO);
            }
        } catch (error) {
            console.error('Error during balance enquiry:', error);
            setIsLoading(false); // Reset loading state on error
        }
    }, [latitude, longitude, mobileNumber, userId, formattedDate, consumerName]); // Add necessary dependencies


    const [dialogData, setDialogData] = useState({
        trnstatus: 'Success',
        trnbnkrrn: '1234567890',
        datee: formattedDate,
        trnsamount: amount,
        remamount: '500',
        bankname: bankName
    });
    const { getNetworkCarrier, getMobileDeviceId, getMobileIp } =
        useDeviceInfoHook();
    const { userId, Loc_Data, } = useSelector((state: RootState) => state.userInfo);
    const { colorConfig, activeAepsLine } = useSelector((state: RootState) => state.userInfo);
    const { latitude, longitude } = Loc_Data;

    const color1 = `${colorConfig.secondaryColor}20`

    const color2 = `${colorConfig.primaryColor}40`
    const color3 = `${colorConfig.secondaryColor}15`
    const [is2fa, setis2fa] = useState(false);

    const { get, post } = useAxiosHook();


    const requestCameraPermission = useCallback(async () => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: "Camera Permission",
                    message:
                        "key_thisappn_98",
                    buttonPositive: "OK",
                }
            );

            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                openCamera();
            } else {
                Dialog.show({
                    type: ALERT_TYPE.WARNING,
                    title: "Permission Required",
                    textBody: "key_pleasegra_85",
                    button: "OK",
                    onPressButton: () => {
                        Dialog.hide();
                        openSettings().catch(() => console.warn("cannot open settings"));
                    },
                });
            }
        } catch (err) {
            console.warn(err);
        }
    }, []);
    const convertVideoToBase64 = async (videoUri) => {
        try {
            const base64String = await RNFS.readFile(videoUri, 'base64');
            return base64String;

        } catch (error) {
            console.error('Error converting video to base64: ', error);
            throw error;
        }
    };

    const openCamera = () => {
        const options = {
            mediaType: 'video',
            videoQuality: 'high',
            durationLimit: 60,
        };

        launchCamera(options, async (response) => {
            if (response.didCancel) {
            } else if (response.errorCode) {
            } else {

                const videoUri = await response.assets[0].uri;



                try {
                    const result = await Video.compress(
                        videoUri,
                        {
                            compressionMethod: 'manual',
                        },
                        (progress) => {
                        }
                    );


                    const compressedVideoPath = result;
                    const base64Video = await convertVideoToBase64(compressedVideoPath);
                    uploadvideo(base64Video, agentid);

                } catch (error) {
                    console.error('Error converting video to base64: ', error);
                }
            }
        });
    };

    useEffect(() => {

        const CheckEkyc = async () => {
            try {
                const url = `AEPS/api/data/AAdhar2fa`;
                const url2 = `AEPS/api/Nifi/data/AAdhar2fa`;
                const response = await get({ url: activeAepsLine ? url2 : url });
                const msg = response.Message;
                const Status = response.Status;
                if (Status === true) {

                } else if (msg === '2FAREQUIRED') {
                    // start();
                    //  navigation.replace("TwoFAVerifyAadhar");
                    return;
                } else if (msg === 'REQUIREDOTP') {
                    navigation.replace("Aepsekyc");
                } else if (msg === 'REQUIREDSCAN') {
                    navigation.replace("Aepsekycscan");
                }
            } catch (error) {

            } finally {
            }
        };
        //CheckEkyc();




        banks();
        //  checkAepsStatus();
    }, [])
    async function adhar_Validation(adharnumber) {
        try {
            const response = await get({
                url: activeAepsLine ? `/Common/api/data/AdharCardValidationCheck?aadharnumber=${adharnumber}`
                    : `${APP_URLS.aadharValidation}${adharnumber}`
            })
            if (response['status'] === true) {
                setIsValid(true)
            } else {
                setIsValid(false)

                ToastAndroid.showWithGravity(
                    `Please Enter Valid Aadhar number`,
                    ToastAndroid.SHORT,
                    ToastAndroid.BOTTOM,
                );

            }

        } catch (error) {

        }

    }


    async function getUserNamefunction(MoNumber) {
        try {
            const response = await get({ url: activeAepsLine ? `AEPS/api/Nifi/app/Aeps/AEPSNAMEFIND?mobile=${MoNumber}` : `${APP_URLS.aepsNameinfo}${MoNumber}` })

            setAutofcs(true);
            setConsumerName(response.RESULT);
        } catch (error) {
            console.error('Error:', error);
        }
    }

    const checkvideo = async (transamount, agentid, AddharpayResponse) => {
        try {
            const response = await post({
                url: activeAepsLine ? `${APP_URLS.checkadharpayvideoNifi}?transamount=${transamount}&agentid=${agentid}`
                    : `${APP_URLS.checkadharpayvideo}?transamount=${transamount}&agentid=${agentid}`
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
                                requestCameraPermission();
                            },
                            style: "default"
                        }
                    ],
                    { cancelable: false }
                );
            } else {
                setIsLoading(false)
                const addinfo = AddharpayResponse.ADDINFO
                aepsresponsepress(addinfo);

            };
        } catch (error) {
            console.error(error);
        }
    }
    const checkAepsStatus = async () => {
        try {
            const respone = await get({ url: activeAepsLine ? `AEPS/api/Nifi/data/AepsStatus` : `${APP_URLS.checkaepsStatus}` });
            if (respone['Response'] === true) {
                videostatus();
            } else {
                ToastAndroid.showWithGravity(
                    `${respone['Message']}`,
                    ToastAndroid.SHORT,
                    ToastAndroid.BOTTOM,
                );
            }


        } catch (error) {
            console.log(error);


        }
    };
    const uploadvideo = async (video, Agentid) => {
        try {
            const response = await post({
                url: activeAepsLine ? `${APP_URLS.checkadharpayvideoNifi}Videolink=${video}&agentid=${Agentid}` :
                    `${APP_URLS.checkadharpayvideo}Videolink=${video}&agentid=${Agentid}`
            });
            if (response.status) {

                Alert.alert(
                    response.msg,
                    `\n${response.status === 'true' ? 'Success' : 'Failed'}\n${response.msg}\n"Video uploaded Successfully."`,
                    [
                        {
                            text: 'OK', onPress: () => {
                                setShowDialog(true)
                            }
                        },
                    ]
                );
            } else {
                Alert.alert(
                    response.msg,
                    `\n${response.status === 'true' ? 'Success' : 'Failed'}\n${response.msg}`,
                    [
                        { text: 'OK', onPress: () => { } },
                    ]
                );
            }
        } catch (error) {

        }
    };

    const banks = async () => {
        try {
            const response = await post({ url: activeAepsLine ? `AEPS/api/Nifi/Aeps/banklist` : `${APP_URLS.aepsBanklist}` })
            if (response.RESULT === '0') {
                setBanklist(response['ADDINFO']['data'])
            } else {
            }
        } catch (error) {

        }
    };
    const videostatus = async () => {
        try {
            const response = await get({ url: activeAepsLine ? `AEPS/api/Nifi/data/VideoStatus` : `${APP_URLS.adharpayvideostatus}` })
            if (response.Status === true) {

                setShowDialog(false);
            } else {


                navigation.navigate("AepsRespons", {

                    ministate: {
                        RequestTransactionTime: response.txndate,
                        BalanceAmount: 100,
                        TransactionStatus: 'failed',
                        BankRrn: 'BankRrn',

                    },
                    mode: 'BAL CHECK'
                })
                setShowDialog(true);
                setAadharNumber(response.Aadhar);
                setagentid(response.txnid);
                setbnkrrn(response.bankrrn);
                setagentid(response.txnid);
                setamount(response.amount);
                setdate(response.txndate);

            }


        } catch (error) {

        }
    };
    const sendOtp = async () => {
        try {

            const response = await post({
                url: activeAepsLine ? `${APP_URLS.adharpaysendotpNifi}amount=${amountcont}&usermobile=${mobileNumber}` :
                    `${APP_URLS.adharpaysendotp}amount=${amountcont}&usermobile=${mobileNumber}`
            });
            if (response.status === "1") {
                ToastAndroid.showWithGravity(
                    `sending otp failed,${response.ADDINFO}`,
                    ToastAndroid.SHORT,
                    ToastAndroid.BOTTOM,
                );
            } else {
                setOtpservisi(true);
            }
        } catch (error) {
            console.error("Error sending OTP:", error);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
    };


    const payAadhar = () => {
        setIsVisible(false);

    };
    const handleUploadVideo = () => {
        setIsVisible(false);
    };
    const AepsVideoResponseDialog = ({ status, amount, date, bnkrrn, aadharNumber, agentid }) => {
        const [isVisible, setIsVisible] = useState(true);


        return (
            <Modal
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
            </Modal>
        );
    };
    const AadharResponseDialog = ({
        isVisible,
        onClose,
        trnstatus,
        trnbnkrrn,
        datee,
        trnsamount,
        remamount,
        bankname,
    }) => {
        return (
            <Modal
                visible={isVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={onClose}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{translate("Aadhar_Pay_Receipt")}</Text>
                        </View>
                        <View style={styles.modalContent}>
                            <Text style={styles.contentText}>Transaction Status: {trnstatus}</Text>
                            <Text style={styles.contentText}>Bank RRN: {trnbnkrrn}</Text>
                            <Text style={styles.contentText}>Date & Time: {datee}</Text>
                            <Text style={styles.contentText}>Amount: ₹{trnsamount}</Text>
                            <Text style={styles.contentText}>Remain Amount: ₹{remamount}</Text>
                            <Text style={styles.contentText}>Bank Name: {bankname}</Text>
                        </View>
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.footerButton}
                                onPress={() => {
                                }}
                            >
                                <Text style={styles.footerButtonText}>{translate("Share_Receipt")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.footerButton}
                                onPress={onClose}
                            >
                                <Text style={styles.footerButtonText}>{translate("Close")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    };


    const capture = async (rdServicePackage) => {
        let pidOptions = '';
        const aepscode = await AsyncStorage.getItem('aepscode');

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
                const deviceInfoString = JSON.stringify(res, null, 2);
                // await post({ url: 'AEPS/api/Aeps/ErrorMessage', data: { Message: JSON.stringify(res) } });

                // const path = RNFS.DownloadDirectoryPath + `/deviceInfo-capture-today--Finger.json`;

                // Write the response to a file
                // RNFS.writeFile(path, deviceInfoString, 'utf8')
                //   .then(() => {
                //     console.log('JSON saved to Download directory');
                //   })
                //   .catch((error) => {
                //     console.error('Error writing file:', error);
                //     // Alert.alert('Error', 'Failed to save file');
                //   });

                // Handle different response cases
                if (res.errorCode === 720) {
                    setFingerprintData(720);
                } else if (res.status === -1) {
                    setFingerprintData(-1);
                } else if (res.errorCode === 0) {

                    OnPressEnq(res.pidDataJson,res.pidDataXML);

                    const responseString = JSON.stringify(res.pidDataJson, null, 2);
                    //    Alert.alert('Tab Fingerprint Data', responseString);

                }
            })
            .catch(async (error) => {
                // await post({ url: 'AEPS/api/Aeps/ErrorMessage', data: { Message: JSON.stringify({
                //   message: error?.message,
                //   line: error?.line,
                //   column: error?.column
                // }) } });
                setFingerprintData(720);
                Alert.alert('Please check if the device is connected.');
            });
    };

    const [isFace, setIsFace] = useState(false)

    const handleSelection = (selectedOption) => {
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
    };

    const openFace = () => {
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
            });
    };

    const OnPressEnq2 = async (fingerprintData) => {
        const pidData = fingerprintData.pidDataJson.PidData;
        const DevInfo = pidData.DeviceInfo;
        const Resp = pidData.Resp;

        //console.log(pidData)
        const cardnumberORUID = {
            adhaarNumber: aadharNumber,
            indicatorforUID: "0",
            nationalBankIdentificationNumber: bankid
        };

        const captureResponse = {
            Devicesrno: isFace ? '' : DevInfo.additional_info.Param[0].value,
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
            nmPoints: Resp.nmPoints,
            pCount: "0",
            pType: "0",
            qScore: Resp.qScore,
            rdsID: DevInfo.rdsId,
            rdsVer: DevInfo.rdsVer,
            sessionKey: pidData.Skey.content
        };

        console.log(captureResponse, '>>>>>>>>>>>>>>>>>>>>>>')
        try {

            BEnQ(captureResponse, cardnumberORUID);

        } catch (error) {
            Alert.alert('Error', 'key_anerroro_9');
        } finally {
            // setIsLoading(true);
        }
    };

    const aepsresponsepress = (addinfo) => {
        // "Transaction Details",
        // `Status: ${addinfo. "Transaction Details",
        //             `Status: ${addinfo.TransactionStatus}\n` +
        //             `Bank RRN: ${addinfo.BankRrn}\n` +
        //             `Transaction Amount: ${addinfo.TransactionAmount}\n` +
        //             `Balance Amount: ${addinfo.BalanceAmount}`,}\n` +
        // `Bank RRN: ${addinfo.BankRrn}\n` +
        // `Transaction Amount: ${addinfo.TransactionAmount}\n` +
        // `Balance Amount: ${addinfo.BalanceAmount}`,
        const ministate = {
            bankName,
            TransactionStatus: addinfo.TransactionStatus,
            Name: consumerName,
            Aadhar: aadharNumber,
            mobileNumber: mobileNumber,
            BankRrn: addinfo.BankRrn,
            TransactionAmount: addinfo.TransactionAmount,
            RequestTransactionTime: formattedDate,
            BalanceAmount: addinfo.BalanceAmount
        }

        navigation.navigate("AepsRespons", {

            ministate:
                ministate
            ,
            mode: 'AP'
        })
    };

    const onSuccess = (e) => {
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
    };
    const [isScan2, setisScan2] = useState(false)
    if (isScan2) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ alignItems: 'center', position: 'absolute', top: 30, right: 20 }}>
                <TouchableOpacity
                    onPress={() => setisScan2(false)}
                    style={{
                        backgroundColor: '#ff4d4d',
                        padding: 0,
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
    if (true) {
        return (
            <View style={{
                flex: 1,
                //justifyContent: 'center',
                backgroundColor: '#f5f5f5',
            }}>
                {/* <View style={{
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    padding: 20,

                    width: '90%',
                    alignItems: 'center',
                    elevation: 5
                }}>
                    <CloseAadharSvg />
                    <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 15, color: colorConfig.primaryColor }}>{translate("Service_Disabled")}</Text>
                    <View style={{ padding: 10 }}>
                        <Text style={{ fontSize: 16, color: '#333', marginBottom: 5 }}>{translate("key_asperthe_140")}</Text>
                        <Text style={{ fontSize: 16, color: '#333' }}>{translate("key_aadhaarpa_141")}</Text>
                    </View>
                </View> */}
                <NotFoundScreen
                    title2={'Service Disabled'}

                    description={
                        `As per the norms, Aadhaar Pay service cannot be used with Wallet service.${'\n'}Aadhaar Pay service cannot be used with Wallet service.`
                    }
                    buttontitle={'Go Back'}
                />
            </View>
        );
    }


    return (
        <View style={styles.main}>

            <ScrollView>
                <View style={styles.container}>
                    <View style={styles.body}>


                        <View style={{}}>

                            <FlotingInput
                                label="Enter Aadhar Number"
                                value={aadharNumber}
                                maxLength={12}
                                onChangeText={setAadharNumber}
                                keyboardType="number-pad"
                                onChangeTextCallback={(text) => {
                                    setAadharNumber(text);
                                    if (text.length === 12) {
                                        adhar_Validation(text)
                                    } else {
                                        setIsValid(false)

                                    }

                                }}
                            />

                            <View style={[styles.righticon2]}>

                                <TouchableOpacity
                                    onPress={() => {
                                        setisScan2(true)
                                    }}
                                >
                                    <QrcodAddmoneysvg />

                                </TouchableOpacity>
                            </View>
                        </View>

                        {isLoading ? (
                            <ShowLoader />
                        ) : null}

                        {
                            /* <TouchableOpacity onPress={aepsresponsepress}>
                    <Text style={{ color: 'red' }}>{translate("Aeps_Respons")}</Text>
                </TouchableOpacity> */
                        }


                        <FlotingInput
                            label="Enter Mobile Number"
                            value={mobileNumber}
                            onChangeText={setMobileNumber}
                            keyboardType="number-pad"
                            maxLength={10}
                            onChangeTextCallback={(text) => {
                                setMobileNumber(text);
                                if (text.length === 10) {
                                    getUserNamefunction(text);
                                }

                            }}
                        />
                        <FlotingInput
                            label="Enter Consumer Name"
                            value={consumerName}
                            onChangeText={setConsumerName}
                            autoFocus={autofcs}
                            onChangeTextCallback={(text) => {
                                setConsumerName(text);

                            }}
                        />
                        <FlotingInput
                            label="Enter Amount"
                            value={amountcont}
                            onChangeText={setAmountcont}
                            keyboardType="number-pad"
                            maxLenght={6}
                            onChangeTextCallback={(text) => {
                                setAmountcont(text);
                                if (text >= 5000) {
                                    setPaybtn(false);
                                } else {
                                    setPaybtn(true);

                                }


                            }}
                        />
                        <FlotingInput
                            label="Enter Service Fee"
                            value={servifee}
                            onChangeText={setServifee}
                            keyboardType="number-pad"
                            onChangeTextCallback={(text) => {
                                setServifee(text);

                            }}
                        />
                        <TouchableOpacity
                            style={{}}
                            onPress={() => { setisbank(true) }}
                        >
                            <>
                                <FlotingInput
                                    editable={false}
                                    label={bankName.toString()}
                                    placeholder={bankName ? "" : "Select Your Bank"}
                                    onChangeText={setServifee}
                                    keyboardType="number-pad"
                                    onChangeTextCallback={(text) => {
                                        setServifee(text);
                                    }}
                                    inputstyle={styles.inputstyle}
                                />
                            </>
                            {bankName.length === 0 ?
                                <View style={styles.righticon}>
                                    <OnelineDropdownSvg />
                                </View> : null}
                        </TouchableOpacity>
                        <SelectDevice setDeviceName={setDeviceName} device={'Device'} opPress={() => { setDeviceName(deviceName); }} />

                        {/* <View style={{ marginBottom: hScale(18) }} /> */}

                        {otpservisi && (
                            <FlotingInput
                                label="Enter OTP"
                                value={otpcontroller}
                                onChangeText={setOtpcontroller}
                                keyboardType="number-pad"
                                onChangeTextCallback={(text) => {
                                    setOtpcontroller(text);

                                }}
                            />
                        )}



                        <DynamicButton
                            onPress={() => {
                                // scanFingerprint();
                                if (bankName === 'Select Bank' || mobileNumber.length < 10 || consumerName === null || aadharNumber.length < 12 || isValid === false || amountcont === '') {

                                } else if (paybtn) {
                                    // if (fingerprintData == 720) {
                                    //     setIsScan(true);
                                    //     scanFingerprint();
                                    // } else {
                                    //     OnPressEnq();
                                    // }
                                    handleSelection(deviceName);
                                } else {

                                    sendOtp();
                                }
                            }}
                            title={paybtn ? 'Scan & Proceed' : 'Send OTP'} />


                        {/* 
                        <DynamicButton
                            onPress={() => {
                                scanFingerprint();
                            }}

                            styleoveride={{ marginVertical: wScale(20) }}
                            title={'Re-Scan'}
                        />
 */}
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
                </View>
            </ScrollView>
            <BankBottomSite
                setBankId={setBankId}
                bankdata={banklist}
                isbank={isbank}
                setBankName={setBankName}
                setisbank={setisbank}
            />


        </View>
    );
};

const styles = StyleSheet.create({
    righticon2: {
        position: "absolute",
        left: "auto",
        right: wScale(0),
        top: hScale(0),
        height: "85%",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingRight: wScale(12),
        width: wScale(44),

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
    dialog2: {
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
    body: {
        paddingTop: hScale(10),
    },
    inputstyle: {
        marginBottom: hScale(0),
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
    buttonText: {
        color: '#FFFFFF',
        fontSize: wScale(16), // Adjusted to wScale
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


});

export default AdharPay;

