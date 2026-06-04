import { translate } from '../../../utils/languageUtils/I18n';
import React, { useCallback, useContext, useEffect, useState } from 'react';

import { Appearance, View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, ToastAndroid, Alert, FlatList } from 'react-native';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import { Modal as RNModal } from 'react-native';
import Modal from "react-native-modal";
import AppBar from '../../drawer/headerAppbar/AppBar';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { SCREEN_HEIGHT, hScale, wScale } from '../../../utils/styles/dimensions';
import FlotingInput from '../../drawer/securityPages/FlotingInput';
import DynamicButton from '../../drawer/button/DynamicButton';
import { FlashList } from '@shopify/flash-list';
import { BottomSheet } from '@rneui/base/dist/BottomSheet/BottomSheet';
import ClosseModalSvg from '../../drawer/svgimgcomponents/ClosseModal';
import { useDeviceInfoHook } from '../../../utils/hooks/useDeviceInfoHook';
import { RootState } from '../../../reduxUtils/store';
import { useSelector } from 'react-redux';
import { useLocationHook } from '../../../hooks/useLocationHook';
import { AepsContext } from './context/AepsContext';
import BankBottomSite from '../../../components/BankBottomSite';
import OnelineDropdownSvg from '../../drawer/svgimgcomponents/simpledropdown';
import ShowLoader from '../../../components/ShowLoder';
import RNFS from 'react-native-fs';
import { isMoment } from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SelectDevice from './DeviceSelect';
import { isDriverFound, openFingerPrintScanner, openFaceAuth } from 'react-native-rdservice-fingerprintscanner';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import QrcodAddmoneysvg from '../../drawer/svgimgcomponents/QrcodAddmoneysvg';
// import QRCodeScanner from 'react-native-qrcode-scanner';
import { useRdDeviceConnectionHook } from '../../../hooks/useRdDeviceConnectionHook';
import CheckSvg from '../../drawer/svgimgcomponents/CheckSvg';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { logToFirebase } from '../../../utils/firebaselog';
import firestore from '@react-native-firebase/firestore';
import { useIsFocused } from '@react-navigation/native';
import TwoFAVerify from './TwoFaScreen';

const AepsMinistatement = () => {
    const isFocused = useIsFocused();
    const [servifee, setServifee] = useState('');
    const { setBankId, isFace, setIsFace,
        bankid, aadharNumber, setFingerprintData, setAadharNumber, mobileNumber, setMobileNumber, consumerName, setConsumerName, bankName, setBankName, scanFingerprint, fingerprintData, isValid, setIsValid, deviceName, setDeviceName } = useContext(AepsContext);
    const [imei, setImei] = useState('');
    const [responsefromaaadharscan, setResponsefromaaadharscan] = useState('');
    const [banklist, setBanklist] = useState([]);
    const [isbank, setisbank] = useState(false);
    const [Fdata, setFdata] = useState(null);
    const [isVisible, setIsVisible] = useState(true);
    const [showDialog, setShowDialog] = useState(false);
    const [isFacialTan, setisFacialTan] = useState(false)
    const [isVisible2, setIsVisible2] = useState(false);
    const [status, setStatus] = useState('');
    const [amount, setamount] = useState('')
    const [date, setdate] = useState('')
    const [bnkrrn, setbnkrrn] = useState('')
    const [agentid, setagentid] = useState('');
    const [autofcs, setAutofcs] = useState(false);
    const now = new Date();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    const [isLoading, setIsLoading] = useState(false)
    const dayOfWeek = days[now.getDay()];
    const dayOfMonth = now.getDate();
    const month = months[now.getMonth()];
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const formattedDate = `${dayOfWeek} ${dayOfMonth} ${month} ${hours}:${minutes}:${seconds}`;

    const { getNetworkCarrier, getMobileDeviceId, getMobileIp } =
        useDeviceInfoHook();
    const { userId, Loc_Data } = useSelector((state: RootState) => state.userInfo);
    const { latitude, longitude } = Loc_Data;

    const { colorConfig, activeAepsLine } = useSelector((state: RootState) => state.userInfo);
    const color1 = `${colorConfig.secondaryColor}20`
    const navigation = useNavigation();
    const color2 = `${colorConfig.primaryColor}40`
    const color3 = `${colorConfig.secondaryColor}15`
    const { get, post } = useAxiosHook();
    const [isScan, setIsScan] = useState(false);

    useEffect(() => {
        CheckEkyc();

        const banks = async () => {


            const provider =
                         activeAepsLine?.provider;
                 
                       console.log(
                         'Current Provider:',
                         provider
                       );
                 
                       // =========================
                       // URL SELECT
                       // =========================
                 
                       let finalUrl = '';
                 
                       if (provider === 'NIFI') {
                 
                         finalUrl =
                           APP_URLS.aepsBanklistNifi;
                       }
                 
                       else if (provider === 'CHAGANS') {
                 
                         finalUrl =
                           'AEPS/api/Chagan/Aeps/banklist';
                       }
                 
                       else if (provider === 'FINGPAY') {
                 
                         finalUrl =
                           APP_URLS.aepsBanklist;
                       }
                 
                       console.log(
                         'Calling URL:',
                         finalUrl
                       );
                 
            try {
                // const url = `${APP_URLS.aepsBanklist}`;
                // const url2 = 'AEPS/api/Nifi/Aeps/banklist';
                console.log(activeAepsLine ? finalUrl :'');
                const response = await post({ url: finalUrl  })
                //   console.log(response, "**********&**********************************")
                if (response.RESULT === '0') {
                    setBanklist(response['ADDINFO']['data'])
                }
            } catch (error) {

            }
        };
        banks();

    }, [])
    const fffff = {
        'pidDataJson': {
            'PidData': {
                'Hmac': '8kxbwA2MT0PL+drQAUbOGzaLwMx+QWj5jVDEjnKZbdGvHYAj4Jeb4cNlgRwv1kP0',
                'Resp': {
                    'qScore': '-1',
                    'fType': '2',
                    'errCode': '0',
                    'iCount': '1',
                    'pType': '3',
                    'fCount': '0',
                    'nmPoints': '0',
                    'iType': '1',
                    'pCount': '1'
                },
                'DeviceInfo': {
                    'Additional_Info': '',
                    'mc': 'MIIDrDCCApSgAwIBAgIEFuSbaDANBgkqhkiG9w0BAQsFADCBhjELMAkGA1UEBhMCSU4xEjAQBgNVBAgTCUthcm5hdGFrYTESMBAGA1UEBxMJQmFuZ2Fsb3JlMRswGQYDVQQKExJVSURBSSBGQUNFIEFBREhBQVIxGDAWBgNVBAsTD0ZhY2UgQWFkaGFhciBEUDEYMBYGA1UEAxMPRmFjZSBBYWRoYWFyIERQMB4XDTI0MDQyNDE0NDI1NFoXDTI1MDQyNDE0NDI1NFowgYYxGDAWBgNVBAMTD0ZhY2UgQWFkaGFhciBNQzEYMBYGA1UECxMPRmFjZSBBYWRoYWFyIE1DMRswGQYDVQQKExJVSURBSSBGQUNFIEFBREhBQVIxEjAQBgNVBAcTCUJhbmdhbG9yZTESMBAGA1UECBMJS2FybmF0YWthMQswCQYDVQQGEwJJTjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAJpFoptQZ/gWaha9hBYZMp7oSYy0leES5fK2LwfDZ3whpMxyUTI4HyElmRJVaQmQgKTy/Mt4qhQMt/HhIgeAjj3SA1sutoEkYBYTiLyPHDpNCbCRYwU0oA8M2MhERy7WM5fwaA0kKFBgZcnMmgLni4V3R/I1henuoTR7bsmhNIsiy2gAAFHNzrV3D5nm/EV3C4GKli4PzBXJ9g+lTv/QpZ1+GEpfECEPQqEyqKezcl6eMJ3AeuVMs4bGopYas5xRppGhfJ6pUbMXep+YpIf5vngGYNRHmYCIkeqQjI/nYCCWzJX7bwcS+H1rkkQuFbaDpqplJVsoAwbzIJrZokTW4NsCAwEAAaMgMB4wDwYDVR0TAQH/BAUwAwEB/zALBgNVHQ8EBAMCBaAwDQYJKoZIhvcNAQELBQADggEBAHhqP9FxX6c2KPkVkaIAA847fm/++uaOgtcQtBnH5JLaW0ebHuEko8ohZOUzaPR7MPvPUioQ5xbeBvnYAtVB82oqoHwIBVB/rXgzVdbfb+Rii6PwX6sxBTfKrL3S0uJ8XjZgKlBgSEoL7hEj6Svr7+OM8i++7HAt1fAQkQkpEzpN+v6DzoLi339DXCPta8BYUoy1lGpuAMUExu29O4MSdS4Kb5JgPevEAZ19hyP6gcRZSzNJEewCTNK3vLALvYM6bpouLR8dRgyVxlSS1s1ZPWZWRxGy8x7K77AEkY1D9PAv6G0rIxHTNHv70mIBvXCDPaWgFMaqRgUF9nsB4Etsj6Y=',
                    'dpId': 'UIDAI.UIDAI',
                    'rdsId': 'UIDAI.ONLINE.001',
                    'mi': 'UIDAI.ONLINE',
                    'rdsVer': '1.0.0',
                    'dc': '6a34b4aa-2446-4e3f-864a-7ac49147afe4'
                },
                'Data': {
                    'content': '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',
                    'type': 'X'
                },
                'Skey': {
                    'content': 'LRKO/5aXGujSnBHXfmJfMFhVofolDqm8ccKOiZTT7pHQoKx1duud70JcKZUs92rSR+Woa1jB0EoQFzlmyTyIxD9HYg777LtWPtv8w4OzLzvMuLRWg+FatVMHcMAbGjtjDXMwm0xDQnFl1RObLybKpGdjpC+i18dBbaS6Xavbi5ynFdB6p8op0r0ITkNh8Sj8Mb8aZZ/9iNwPxGbYngM5/UaP2pnc8IJ6VVZXngAiickWwaaQ+qKEK4lnhiayulzMjIqwYOvIe0FG/6ho+YJcsnn7gkRzva/dLHBIZNWFZhFpxC3kbM48vQ6c/M1/lWi2OslSvvHMReKexO+Y4LGTlg==',
                    'ci': '20250923'
                },
                'CustOpts': {
                    'Param': [
                        {
                            'name': 'txnId',
                            'value': '0d51104e-98ae-4d90-ba8b-3fe9ef3e2bb7'
                        },
                        {
                            'name': 'txnStatus',
                            'value': 'PID_CREATED'
                        },
                        {
                            'name': 'responseCode',
                            'value': 'a5cca0d0-a69b-473b-a68a-ecf5313d0f3f'
                        },
                        {
                            'name': 'faceRdVersionWithEnv',
                            'value': '1.1.1 '
                        },
                        {
                            'name': 'clientComputeTime',
                            'value': '3811'
                        },
                        {
                            'name': 'serverComputeTime',
                            'value': '81'
                        },
                        {
                            'name': 'networkLatencyTime',
                            'value': '789'
                        }
                    ]
                }
            }
        },
        'pidDataXML': '<PidData><CustOpts><Param name="txnId" value="0d51104e-98ae-4d90-ba8b-3fe9ef3e2bb7"/><Param name="txnStatus" value="PID_CREATED"/><Param name="responseCode" value="a5cca0d0-a69b-473b-a68a-ecf5313d0f3f"/><Param name="faceRdVersionWithEnv" value="1.1.1 "/><Param name="clientComputeTime" value="3811"/><Param name="serverComputeTime" value="81"/><Param name="networkLatencyTime" value="789"/></CustOpts><Data type="X">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</Data><DeviceInfo dc="6a34b4aa-2446-4e3f-864a-7ac49147afe4" dpId="UIDAI.UIDAI" mc="MIIDrDCCApSgAwIBAgIEFuSbaDANBgkqhkiG9w0BAQsFADCBhjELMAkGA1UEBhMCSU4xEjAQBgNVBAgTCUthcm5hdGFrYTESMBAGA1UEBxMJQmFuZ2Fsb3JlMRswGQYDVQQKExJVSURBSSBGQUNFIEFBREhBQVIxGDAWBgNVBAsTD0ZhY2UgQWFkaGFhciBEUDEYMBYGA1UEAxMPRmFjZSBBYWRoYWFyIERQMB4XDTI0MDQyNDE0NDI1NFoXDTI1MDQyNDE0NDI1NFowgYYxGDAWBgNVBAMTD0ZhY2UgQWFkaGFhciBNQzEYMBYGA1UECxMPRmFjZSBBYWRoYWFyIE1DMRswGQYDVQQKExJVSURBSSBGQUNFIEFBREhBQVIxEjAQBgNVBAcTCUJhbmdhbG9yZTESMBAGA1UECBMJS2FybmF0YWthMQswCQYDVQQGEwJJTjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAJpFoptQZ/gWaha9hBYZMp7oSYy0leES5fK2LwfDZ3whpMxyUTI4HyElmRJVaQmQgKTy/Mt4qhQMt/HhIgeAjj3SA1sutoEkYBYTiLyPHDpNCbCRYwU0oA8M2MhERy7WM5fwaA0kKFBgZcnMmgLni4V3R/I1henuoTR7bsmhNIsiy2gAAFHNzrV3D5nm/EV3C4GKli4PzBXJ9g+lTv/QpZ1+GEpfECEPQqEyqKezcl6eMJ3AeuVMs4bGopYas5xRppGhfJ6pUbMXep+YpIf5vngGYNRHmYCIkeqQjI/nYCCWzJX7bwcS+H1rkkQuFbaDpqplJVsoAwbzIJrZokTW4NsCAwEAAaMgMB4wDwYDVR0TAQH/BAUwAwEB/zALBgNVHQ8EBAMCBaAwDQYJKoZIhvcNAQELBQADggEBAHhqP9FxX6c2KPkVkaIAA847fm/++uaOgtcQtBnH5JLaW0ebHuEko8ohZOUzaPR7MPvPUioQ5xbeBvnYAtVB82oqoHwIBVB/rXgzVdbfb+Rii6PwX6sxBTfKrL3S0uJ8XjZgKlBgSEoL7hEj6Svr7+OM8i++7HAt1fAQkQkpEzpN+v6DzoLi339DXCPta8BYUoy1lGpuAMUExu29O4MSdS4Kb5JgPevEAZ19hyP6gcRZSzNJEewCTNK3vLALvYM6bpouLR8dRgyVxlSS1s1ZPWZWRxGy8x7K77AEkY1D9PAv6G0rIxHTNHv70mIBvXCDPaWgFMaqRgUF9nsB4Etsj6Y=" mi="UIDAI.ONLINE" rdsId="UIDAI.ONLINE.001" rdsVer="1.0.0"><Additional_Info/></DeviceInfo><Hmac>8kxbwA2MT0PL+drQAUbOGzaLwMx+QWj5jVDEjnKZbdGvHYAj4Jeb4cNlgRwv1kP0</Hmac><Resp errCode="0" fCount="0" fType="2" iCount="1" iType="1" nmPoints="0" pCount="1" pType="3" qScore="-1"/><Skey ci="20250923">LRKO/5aXGujSnBHXfmJfMFhVofolDqm8ccKOiZTT7pHQoKx1duud70JcKZUs92rSR+Woa1jB0EoQFzlmyTyIxD9HYg777LtWPtv8w4OzLzvMuLRWg+FatVMHcMAbGjtjDXMwm0xDQnFl1RObLybKpGdjpC+i18dBbaS6Xavbi5ynFdB6p8op0r0ITkNh8Sj8Mb8aZZ/9iNwPxGbYngM5/UaP2pnc8IJ6VVZXngAiickWwaaQ+qKEK4lnhiayulzMjIqwYOvIe0FG/6ho+YJcsnn7gkRzva/dLHBIZNWFZhFpxC3kbM48vQ6c/M1/lWi2OslSvvHMReKexO+Y4LGTlg==</Skey></PidData>',
        'rdServicePackage': 'RDServiceManager',
        'status': 1,
        'errInfo': '',
        'errorCode': 0,
        'message': 'FingerPrint Scanned Successfully'
    }

    const saveFaceResponse = async (data) => {
        try {

            // Indian Time
            const now = new Date();

            const indianTime = now.toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                hour12: false
            });

            // Document ID (Readable Time)
            const docId = indianTime
                .replace(/[/: ]/g, '_');
            // Example → 14_03_2026_17_42_10

            await firestore()
                .collection('faceAuthLogs')
                .doc(docId)
                .set({
                    createdAtIST: indianTime,
                    createdAt: firestore.FieldValue.serverTimestamp(),
                    response: data
                });

            console.log('Face response saved in Firestore with ID:', docId);

        } catch (error) {
            console.log('Firestore Save Error:', error);
        }
    };
    const openFace = () => {

        openFaceAuth(userId)
            .then(async (res) => {
                setIsLoading(true);

                setisFacialTan(true);

                // 🔥 Full response console
                console.log('Face Auth Response:', res);

                // 🔥 Cloud / Firestore save
                // await saveFaceResponse(res);

                // 🔴 Face cancel / camera close
                if (res?.errorCode === 892) {

                    setIsLoading(false);
                    console.log('Face authentication cancelled');

                    return;
                }



                // 🟢 Success
                if (res?.piddataJsonString) {

                    console.log('Face Data Received Successfully');

                    setIsLoading(true);

                    OnPressEnq2(res);

                }

            })
            .catch(async (error) => {

                console.error('Face Authentication Error:', error);

                //   await saveFaceResponse({
                //     type: "FACE_ERROR",
                //     error: JSON.stringify(error)
                //   });

                setIsLoading(false);

                Alert.alert('Face authentication failed');

            });
    };
    const saveResponseToFile = async (response) => {
        const path = RNFS.DownloadDirectoryPath + '/response-face.json'; // File path
        try {
            // Write JSON data to file
            await RNFS.writeFile(path, JSON.stringify(response, null, 2), 'utf8');
            console.log('Response saved to', path);
        } catch (error) {
            console.error('Error writing to file:', error);
        }
    };
    // const OnPressEnq2 = async (fingerprintData) => {
    //     // 1. JSON पार्सिंग चेक (Bridge से स्ट्रिंग आती है तो उसे ऑब्जेक्ट बनाएं)
    //     let pidDataObj;
    //     try {
    //         pidDataObj = typeof fingerprintData.piddataJsonString === 'string'
    //             ? JSON.parse(fingerprintData.piddataJsonString).PidData
    //             : fingerprintData.piddataJsonString.PidData;
    //     } catch (e) {
    //         // अगर ऊपर वाला काम न करे तो आपके पुराने तरीके से:
    //         pidDataObj = fingerprintData.piddataJsonString.PidData;
    //     }

    //     const DevInfo = pidDataObj.DeviceInfo;
    //     const Resp = pidDataObj.Resp;
    //     const Data = pidDataObj.Data;
    //     const Skey = pidDataObj.Skey;

    //     const captureResponse = {
    //         Devicesrno: "",
    //         PidDatatype: "X",
    //         Piddata: Data.content,
    //         ci: Skey.ci,
    //         dc: DevInfo.dc,
    //         dpID: DevInfo.dpId,
    //         errCode: Resp.errCode,
    //         // Resp.errCode 0 है तो खाली स्ट्रिंग, वरना एरर मैसेज
    //         errInfo: Resp.errCode === "0" ? "" : (fingerprintData.errInfo || "Error"),
    //         fCount: Resp.fCount || "0",
    //         fType: Resp.fType || "0",
    //         hmac: pidDataObj.Hmac,
    //         iCount: Resp.iCount || "0", // यहाँ आपने पहले fCount लिख दिया था
    //         iType: Resp.iType || "0",
    //         mc: DevInfo.mc,
    //         mi: DevInfo.mi,
    //         nmPoints: Resp.nmPoints || "0",
    //         pCount: Resp.pCount || "0", // Face RD के लिए "1" जरूरी है
    //         pType: Resp.pType || "0",   // Face RD के लिए "3" जरूरी है
    //         qScore: Resp.qScore || "-1",
    //         rdsID: DevInfo.rdsId,
    //         rdsVer: DevInfo.rdsVer,
    //         sessionKey: Skey.content
    //     };

    //     const cardnumberORUID = {
    //         adhaarNumber: aadharNumber,
    //         indicatorforUID: "0",
    //         nationalBankIdentificationNumber: bankid
    //     };
    //     console.log("Mapped Response for Face Auth:", captureResponse);

    //     try {
    //         // आधार सर्वर को डेटा भेजें
    //         BEnQ(captureResponse, cardnumberORUID, "", true);
    //     } catch (error) {
    //         console.error("BEnQ Call Error:", error);
    //     }
    // };

    const OnPressEnq2 = async (fingerprintData) => {
        try {

            const raw =
                fingerprintData?.piddataJsonString ||
                fingerprintData?.pidDataJson ||
                fingerprintData;

            const parsedJson =
                typeof raw === "string"
                    ? JSON.parse(raw)
                    : raw;

            const pidData = parsedJson?.PidData;
            if (!pidData) throw new Error("Invalid PID Data");

            const DevInfo = pidData.DeviceInfo || {};
            const Resp = pidData.Resp || {};

            const cardnumberORUID = {
                adhaarNumber: aadharNumber,
                indicatorforUID: "0",
                nationalBankIdentificationNumber: bankid
            };

            const captureResponse = {
                Devicesrno:
                    DevInfo?.additional_info?.Param?.[0]?.value ||
                    DevInfo?.dc ||
                    "",
                PidDatatype: "X",
                Piddata: typeof pidData.Data === "object"
                    ? pidData.Data.content
                    : pidData.Data || "",
                ci: pidData.Skey?.ci || "",
                dc: DevInfo.dc || "",
                dpID: DevInfo.dpId || "",
                errCode: Resp.errCode ?? "",
                errInfo: Resp.errInfo || "",
                fCount: Resp.fCount || "0",
                fType: Resp.fType || "0",
                hmac: typeof pidData.Hmac === "object"
                    ? pidData.Hmac.content
                    : pidData.Hmac || "",
                iCount: Resp.iCount || "0",
                iType: Resp.iType || "0",
                mc: DevInfo.mc || "",
                mi: DevInfo.mi || "",
                nmPoints: Resp.nmPoints || "0",
                pCount: Resp.pCount || "0",
                pType: Resp.pType || "0",
                qScore: Resp.qScore ?? "-1",
                rdsID: DevInfo.rdsId || "",
                rdsVer: DevInfo.rdsVer || "",
                sessionKey: typeof pidData.Skey === "object"
                    ? pidData.Skey.content
                    : pidData.Skey || ""
            };

            console.log("Mapped Response for Face Auth:", JSON.stringify(captureResponse, null, 2));

            // ✅ Dono JSON alert mein
            // Alert.alert(
            //     "Face Auth Debug",
            //     `📥 RAW INPUT:\n${JSON.stringify(fingerprintData, null, 2)}\n\n📤 MAPPED captureResponse:\n${JSON.stringify(captureResponse, null, 2)}`,
            //     [
            //         {
            //             text: "Proceed",
            //             onPress: () => BEnQ(captureResponse, cardnumberORUID, "", true),
            //         },
            //         {
            //             text: "Cancel",
            //             style: "cancel",
            //         },
            //     ]
            // );
            BEnQ(captureResponse, cardnumberORUID, "", true);
        } catch (error) {
            console.error("OnPressEnq2 Error:", error);
            Alert.alert("Error", "Biometric processing failed.");
        } finally {
            // setIsLoading(false);
        }
    };

    const OnPressEnq = async (fingerprintDataString, pidDataXml) => {
        try {

            const parsedJson = typeof fingerprintDataString === 'string'
                ? JSON.parse(fingerprintDataString)
                : fingerprintDataString;

            const pidData = parsedJson?.PidData;
            if (!pidData) throw new Error('Invalid PID Data');

            const DevInfo = pidData.DeviceInfo || {};
            const Resp = pidData.Resp || {};

            if (Resp.errCode !== '0') {
                Alert.alert(Resp.errInfo || 'Fingerprint capture failed');
                return;
            }

            const params = DevInfo.additional_info?.Param || [];

            const srNo =
                params.find(p => p.name?.toLowerCase() === 'srno')?.value ||
                params.find(p => p.name?.toLowerCase() === 'serialnumber')?.value ||
                params[0]?.value ||
                '';

            const cardnumberORUID = {
                adhaarNumber: aadharNumber,
                indicatorforUID: '0',
                nationalBankIdentificationNumber: bankid
            };

            const captureResponse = {
                Devicesrno: srNo || '',
                PidDatatype: 'X',
                Piddata: pidData.Data?.content || pidData.Data || '',
                ci: pidData.Skey?.ci || '',
                dc: DevInfo.dc || '',
                dpID: DevInfo.dpId || '',
                errCode: Resp.errCode ?? '',
                errInfo: Resp.errInfo || '',
                fCount: Resp.fCount || '1',
                fType: Resp.fType || '2',
                hmac: pidData.Hmac?.content || pidData.Hmac || '',
                iCount: Resp.iCount || '0',
                iType: '0',
                mc: DevInfo.mc || '',
                mi: DevInfo.mi || '',
                nmPoints: Resp.nmPoints || '0',
                pCount: Resp.pCount || '0',
                pType: Resp.pType || '0',
                qScore: Resp.qScore || '0',
                rdsID: DevInfo.rdsId || '',
                rdsVer: DevInfo.rdsVer || '',
                sessionKey: pidData.Skey?.content || pidData.Skey || ''
            };

            BEnQ(captureResponse, cardnumberORUID, pidDataXml, false);

        } catch (error) {
            console.error('OnPressEnq Error:', error);
            Alert.alert('Error', 'Fingerprint processing failed.');
            setIsLoading(false);

        } finally {
            //setIsLoading(true);
        }
    };


    const BEnQ = useCallback(async (captureResponse1, cardnumberORUID1, pidDataX, isface) => {


   const provider =
               activeAepsLine?.provider;
       
             console.log(
               'Current Provider:',
               provider
             );
       
             // =========================
             // URL SELECT
             // =========================
       
             let finalUrl = '';
       
             if (provider === 'NIFI') {
       
               finalUrl =
              'AEPS/api/Nifi/app/AEPS/MiniStatement';
             }
       
             else if (provider === 'CHAGANS') {
       
               finalUrl =
                 'AEPS/api/Chagan/data/MiniStatement';
             }
       
             else if (provider === 'FINGPAY') {
       
               finalUrl =
                'AEPS/api/app/AEPS/MiniStatement';
             }
       
             console.log(
               'Calling URL:',
               finalUrl
             );



        try {
            setIsLoading(true);
            const Model = await getMobileDeviceId();
            const address = latitude;

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
                otpnum: '',
                requestRemarks: 'TN3000CA06532',
                subMerchantId: 'A2zsuvidhaa',
                timestamp: formattedDate,
                transactionType: 'BE',
                name: consumerName,
                Address: address,
                transactionAmount: '',
                isFacialTan: isface,
            };

            const headers = {
                'trnTimestamp': formattedDate,
                'deviceIMEI': Model,
                'Content-type': 'application/json',
                'Accept': 'application/json',
            };

            console.log('Headers:', JSON.stringify(headers, null, 2));
            console.log('Request Data:', JSON.stringify(jdata, null, 2));

            const response = await post({
                url: finalUrl,
                data: JSON.stringify(jdata),
                config: { headers },
            });

            console.log('API Response:', JSON.stringify(response, null, 2));
            const { RESULT, ADDINFO } = response;
            setIsLoading(false);
            setFingerprintData(720);

            if (RESULT && RESULT.toString() === '0') {
                aepsresponsepress(ADDINFO);

            } else if (RESULT && RESULT.toString() === '1') {
                Alert.alert(
                    'Message',
                    ADDINFO == null ? 'Transaction Failed' : ADDINFO
                );
            } else {
                Alert.alert('Message', 'Unexpected response: ' + JSON.stringify(response));
            }
            // // ✅ Pura response alert mein
            // Alert.alert(
            //     '📦 API Response',
            //     JSON.stringify(response, null, 2),
            //     [
            //         {
            //             text: 'OK',
            //             onPress: () => {
            //                 const { RESULT, ADDINFO } = response;
            //                 setIsLoading(false);
            //                 setFingerprintData(720);

            //                 if (RESULT && RESULT.toString() === '0') {
            //                     aepsresponsepress(ADDINFO);

            //                 } else if (RESULT && RESULT.toString() === '1') {
            //                     Alert.alert(
            //                         'Message',
            //                         ADDINFO == null ? 'Transaction Failed' : ADDINFO
            //                     );
            //                 } else {
            //                     Alert.alert('Message', 'Unexpected response: ' + JSON.stringify(response));
            //                 }
            //             },
            //         },
            //     ]
            // );

        } catch (error) {
            console.error('BEnQ Error:', error);
            setIsLoading(false);
            Alert.alert('❌ Error', 'Error during Mini Statement: ' + String(error));
        }
    }, [latitude, longitude, mobileNumber, userId, formattedDate, consumerName, navigation, isFacialTan]);

    const aepsresponsepress = (addinfo) => {
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
            RequestTransactionTime: formattedDate,
            BalanceAmount: addinfo.BalanceAmount,
            addinfo1: addinfo
        }

        navigation.navigate('AepsRespons', {

            ministate:
                ministate,
            mode: 'MINI'
        })
    };

    async function adhar_Validation(adharnumber) {
        setIsLoading(true);

        try {
            const response = await get({
                url: activeAepsLine ? `${APP_URLS.aadharValidation}${adharnumber}` :
                    `${APP_URLS.aadharValidation}${adharnumber}`
            })
            console.log(response);
            if (response['status'] === true) {
                setIsValid(true);
            } else {
                setIsValid(false);
                ToastAndroid.showWithGravity(
                    'Please Enter Valid Aadhar number',
                    ToastAndroid.SHORT,
                    ToastAndroid.BOTTOM,
                );

            }
            setIsLoading(false);

        } catch (error) {
            setIsLoading(false);

        }

    }



    async function getUserNamefunction(MoNumber) {
        setIsLoading(true);

        try {
            const response = await get({ url: activeAepsLine ? `AEPS/api/Nifi/app/Aeps/AEPSNAMEFIND?mobile=${MoNumber}` : `${APP_URLS.aepsNameinfo}${MoNumber}` })
            setAutofcs(true);
            setConsumerName(response.RESULT);
            setIsLoading(false);

        } catch (error) {
            setIsLoading(false);

            console.error('Error:', error);
        }
    }







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
                pidOptions = '<PidOptions ver="1.0"><Opts env="P" fCount="1" fType="2" iCount="0" iType="" pCount="0" pType="" format="0" pidVer="2.0" timeout="20000" wadh="" posh="UNKNOWN" /><Demo></Demo><CustOpts><Param name="" value="" /></CustOpts></PidOptions>';
                break; case 'com.scl.rdservice':
                // pidOptions = '<PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" pType="" pCount="0"  format="0" pidVer="2.0" timeout="20000"  posh="UNKNOWN" env="P" /> <Demo></Demo> <CustOpts><Param name="" value="" /></CustOpts> </PidOptions>';
                pidOptions = '<PidOptions ver="1.0"><Opts env="P" fCount="1" fType="2" iCount="0" iType="" pCount="0" pType="" format="0" pidVer="2.0" timeout="20000" wadh="" posh="UNKNOWN" /><Demo></Demo><CustOpts><Param name="" value="" /></CustOpts></PidOptions>';
                break;
            default:
                console.error('Unsupported rdServicePackage');
                return;
        }

        openFingerPrintScanner(rdServicePackage, pidOptions)
            .then(async (res) => {

                setisFacialTan(false);

                // 🔥 Full response console me
                console.log('Fingerprint Response:', res);

                // 🔥 Firebase me full response save
                // await logToFirebase("fingerprint_response", {
                //     rdServicePackage,
                //     pidOptions,
                //     response: res
                // });

                if (res.errorCode == 720) {
                    setFingerprintData(720);
                    setIsLoading(false);

                    //   await logToFirebase("fingerprint_error_720", res);

                }
                else if (res.status === -1) {

                    setFingerprintData(-1);
                    setIsLoading(false);

                    //  await logToFirebase("fingerprint_status_minus_1", res);

                }
                else if (res.status === 1 || res.errorCode == 0) {

                    // await logToFirebase("fingerprint_success", res);

                    OnPressEnq(res.piddataJsonString, res.piddataXML);

                    console.log('Data Received Successfully');
                }

            })
            .catch(async (error) => {

                setFingerprintData(720);

                // // 🔥 Error Firebase me
                // await logToFirebase("fingerprint_exception", {
                //     error: JSON.stringify(error),
                //     rdServicePackage,
                //     pidOptions
                // });

                Alert.alert('Please check if the device is connected.');
            });
    };


    const handleSelection = (selectedOption) => {
        if (deviceName === 'Device') {
            return;
        }

        setisFacialTan(false);

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
                // setisFacialTan(false);//ch
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
    const onSuccess = (e) => {
        console.log(e);
        setisScan2(false);
        const data = e.data;

        const obj = {};
        const regex = /([a-zA-Z0-9]+)="([^"]+)"/g;
        let match;

        while ((match = regex.exec(data)) !== null) {
            obj[match[1]] = match[2];
        }
        setAadharNumber(obj.uid);
        setConsumerName(obj.name)
        console.log(obj);
        // Linking.openURL(e.data).catch((err) => console.error('An error occurred', err));
    };
    const [isScan2, setisScan2] = useState(false)

    const CheckEkyc = async () => {

        const provider =
                     activeAepsLine?.provider;
             
                   console.log(
                     'Current Provider:',
                     provider
                   );
             
                   // =========================
                   // URL SELECT
                   // =========================
             
                   let finalUrl = '';
             
                   if (provider === 'NIFI') {
             
                     finalUrl =
                       'AEPS/api/Nifi/data/CheckEkyc';
                   }
             
                   else if (provider === 'CHAGANS') {
             
                     finalUrl =
                       'AEPS/api/Chagan/data/CheckEkyc';
                   }
             
                   else if (provider === 'FINGPAY') {
             
                     finalUrl =
                       APP_URLS.checkekyc;
                   }
             
                   console.log(
                     'Calling URL:',
                     finalUrl
                   );

        setIsLoading(true)
         try {
        //     const url = `${APP_URLS.checkekyc}`;
        //     const url2 = 'AEPS/api/Nifi/data/CheckEkyc';

            const response = await get({ url:  finalUrl });
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
                navigation.replace('Aepsekyc');
            } else if (msg === 'REQUIREDSCAN') {
                setIsLoading(false)

                //  setUserStatus(msg);

                navigation.replace('Aepsekycscan');
                return;
            } else {
                setIsLoading(false)

                // Alert.alert('', msg, [
                //     { text: 'OK', onPress: () => navigation.goBack(), },
                // ], { cancelable: false });
            }
            setIsLoading(false)

        } catch (error) {

            console.log(error);
        } finally {
        }
    };


    const findIsFacialTan = (iINNo) => {

        // console.log(iINNo)
        const bank = banklist.find(item => item.iINNo === iINNo);
        //   console.log(bank.isFacialTan, '&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&')

        if (bank.isFacialTan) {
            console.error(bank.isFacialTan);
            setisFacialTan(bank.isFacialTan);
        } else {
            CheckEkyc()
        }
    };
    console.log(isFacialTan)
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
                    <Text style={{ color: 'white', fontSize: 20 }}>{translate('X')}</Text>
                </TouchableOpacity>
            </View>

            {/* QR Code Scanner */}
            {/* <QRCodeScanner onRead={onSuccess} /> */}
        </View>
    }
    // const [isScan2, setisScan2] = useState(false)
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
                    <Text style={{ color: 'white', fontSize: 20 }}>{translate('X')}</Text>
                </TouchableOpacity>
            </View>

            {/* QR Code Scanner */}
            {/* <QRCodeScanner onRead={onSuccess} /> */}
        </View>
    }
    return (
        <View style={styles.main}>
            {/* कीबोर्ड को हैंडल करने के लिए KeyboardAwareScrollView का उपयोग */}
            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 50 }}
                enableOnAndroid={true}
                extraScrollHeight={100}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>
                    {/* Bank Selection Section */}
                    <TouchableOpacity
                        style={{}}
                        onPress={() => { setisbank(true) }}
                    >
                        <FlotingInput
                            editable={false}
                            label={bankName ? bankName.toString() : 'Select Bank'}
                            placeholder={bankName ? '' : 'Select Bank'}
                            keyboardType="number-pad"
                            onChangeTextCallback={(text) => {
                                setServifee(text);
                            }}
                            inputstyle={styles.inputstyle}
                        />
                        <View style={styles.righticon}>
                            <OnelineDropdownSvg />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.body}>
                        {/* Aadhar Number Input */}
                        <View>
                            <FlotingInput
                                inputstyle={{
                                    borderColor: isValid ? '#009e42' : '#000',
                                    borderWidth: isValid ? 2 : 0.5,   // Border color change
                                    color: '#000', // Text color
                                }}
                                editable={bankName !== ''}
                                label={'Enter Aadhar Number'}
                                value={aadharNumber}
                                maxLength={12}
                                keyboardType="number-pad"
                                onChangeTextCallback={(text) => {
                                    setAadharNumber(text);
                                    if (text.length === 12) {
                                        adhar_Validation(text);
                                    } else {
                                        setIsValid(false);
                                    }
                                }}
                            />
                            <View style={[styles.righticon2]}>
                                {isValid && <CheckSvg color={colorConfig.primaryColor} />}

                                {/* <TouchableOpacity
                                    onLongPress={() => {
                                        alert(`latitude--${latitude}\nlongitude--${longitude}`,)
                                    }}
                                    onPress={() => {
                                        setisScan2(true)
                                    }}
                                    style={{ marginLeft: wScale(30) }}>
                                    <QrcodAddmoneysvg />

                                </TouchableOpacity> */}
                            </View>



                        </View>

                        {/* Mobile Number Input */}
                        <FlotingInput
                            label="Enter Mobile Number"
                            value={mobileNumber}
                            keyboardType="number-pad"
                            maxLength={10}
                            onChangeTextCallback={(text) => {
                                setMobileNumber(text);
                                if (text.length === 10) {
                                    getUserNamefunction(text);
                                    setAutofcs(false);
                                }
                            }}
                        />

                        {/* Consumer Name Input */}
                        <FlotingInput
                            label="Enter Consumer Name"
                            value={consumerName}
                            autoFocus={autofcs}
                            onChangeTextCallback={(text) => {
                                setConsumerName(text);
                            }}
                        />

                        {/* Device Selection Component */}
                        <SelectDevice
                            isProcees={
                                isValid &&
                                mobileNumber.length >= 10 &&
                                aadharNumber.length >= 12 &&
                                bankName !== 'Select Bank'
                            }
                            setDeviceName={setDeviceName}
                            device={'Device'}
                            isface2={false}
                            isface={isFacialTan}
                            opPress={() => {
                                setDeviceName(deviceName);
                                handleSelection(deviceName);
                            }}
                            onPressface={() => openFace()}
                        />

                        <View style={{ marginBottom: hScale(10) }} />

                        {/* Scan & Proceed Button */}
                        <DynamicButton
                            onPress={() => {
                                if (bankName === 'Select Bank' ||
                                    mobileNumber.length < 10 ||
                                    consumerName === null ||
                                    aadharNumber.length < 12) {
                                    // Validation failed logic here
                                } else {
                                    handleSelection(deviceName);
                                }
                            }}
                            title={'Scan & Proceed'}
                        />

                        {/* Loader and Dialogs */}
                        {isLoading ? <ShowLoader /> : null}

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
            </KeyboardAwareScrollView>

            {/* Bank Bottom Selection Sheet (Keep outside ScrollView) */}
            {isFocused && <BankBottomSite
                setBankId={setBankId}
                bankdata={banklist}
                isbank={isbank}
                setBankName={setBankName}
                setisbank={setisbank}
                onPress1={(id) => {
                    console.log(id);
                    findIsFacialTan(id);
                }}
                setisFacialTan={setisFacialTan}
            />}
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
                     
                    }}
                >
                    <TwoFAVerify handle={() => setIsVisible2(false)} />
                </View>
            </Modal>


        </View>
    );
};
const styles = StyleSheet.create({
    righticon2: {
        position: 'absolute',
        right: wScale(0),
        top: hScale(0),
        height: '85%',
        alignItems: 'center',
        justifyContent: 'center',
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
        paddingHorizontal: 20, // Adjust as needed
        flex: 1,
        paddingBottom: 20,
    },
    container2: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Light overlay for modals
    },
    dialog: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        width: '80%',
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 10,
        color: '#007bff',
    },
    detailText: {
        marginBottom: 5,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#28a745',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    body: {
        paddingTop: 10,
    },
    inputstyle: {
        marginBottom: 0,
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)', // Default dark overlay for modal
    },
    overlayDark: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)', // Darker overlay for dark mode
    },
    container3: {
        backgroundColor: 'white',
        borderRadius: 8,
        marginHorizontal: 20,
    },
    container3Dark: {
        backgroundColor: '#333', // Dark background for dark mode
    },
    header: {
        alignItems: 'center',
        marginBottom: 10,
    },
    title2: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    titleDark: {
        color: 'white', // Dark mode title color
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        fontWeight: 'bold',
    },
    headerText: {
        flex: 1,
        textAlign: 'center',
    },
    headerTextDark: {
        color: '#ddd', // Lighter text for dark mode
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
    },
    listItemDark: {
        backgroundColor: '#444', // Darker background for dark mode
    },
    footer: {
        marginTop: 10,
        alignItems: 'flex-end',
    },
    button2: {
        padding: 10,
        backgroundColor: '#007BFF',
        borderRadius: 5,
    },
    buttonText2: {
        color: 'white',
    },
    buttonTextDark: {
        color: '#fff', // Button text color in dark mode
    },
    textDark: {
        color: '#ddd', // Light text for dark mode
    },
    righticon: {
        position: 'absolute',
        left: 'auto',
        right: 12, // Adjusted with wScale
        top: 0, // Adjusted with hScale
        height: '100%',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: 12, // Adjusted with wScale
    },
    // Additional styles for handling dark mode
    emptyState: {
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 20,
    },
    emptyText: {
        color: '#888', // Default light gray for empty state text
    },
    emptyTextDark: {
        color: '#bbb', // Lighter text for empty state in dark mode
    },
    // Button styles
    buttonDark: {
        backgroundColor: '#1b5e20', // Darker green for dark mode
    },
    buttonText2Dark: {
        color: '#fff', // White text for button in dark mode
    },
    // Input field styles
    inputField: {
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
    },
    inputFieldDark: {
        backgroundColor: '#555', // Dark background for inputs in dark mode
        color: '#ddd', // Light text color in inputs for dark mode
    },
    label: {
        fontWeight: 'bold',
        color: '#333',
    },
    labelDark: {
        color: '#fff', // Light label for dark mode
    },
    // More specific text styling
    normalText: {
        color: '#333',
    },
    normalTextDark: {
        color: '#ddd', // Lighter text for dark mode
    },
    modalTitle: {
        fontWeight: 'bold',
        fontSize: 20,
        color: '#007bff',
    },
    modalTitleDark: {
        color: '#f0f0f0', // Light color for modal title in dark mode
    },
});

export default AepsMinistatement;

