import { translate } from "../../../utils/languageUtils/I18n";
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image, ToastAndroid, Alert } from 'react-native';
import { Modal as RNModal } from 'react-native';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
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
import { AepsContext } from './context/AepsContext';
import OnelineDropdownSvg from '../../drawer/svgimgcomponents/simpledropdown';
import BankBottomSite from '../../../components/BankBottomSite';
import ShowLoader from '../../../components/ShowLoder';
import RNFS from 'react-native-fs';
import DeviceInfo from 'react-native-device-info';
import SelectDevice from './DeviceSelect';
import { isDriverFound, openFingerPrintScanner, openFaceAuth } from 'react-native-rdservice-fingerprintscanner';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import QrcodAddmoneysvg from '../../drawer/svgimgcomponents/QrcodAddmoneysvg';
// import QRCodeScanner from 'react-native-qrcode-scanner';
import { useRdDeviceConnectionHook } from '../../../hooks/useRdDeviceConnectionHook';
import { check } from 'react-native-permissions';
import TwoFAVerify from './TwoFaScreen';
import CheckSvg from '../../drawer/svgimgcomponents/CheckSvg';
import { useLocationHook } from '../../../hooks/useLocationHook';
import { appendLog } from '../../../components/log_file_Saver';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import Modal from "react-native-modal";
import { Camera, useCameraDevice, useCameraPermission, useCodeScanner } from 'react-native-vision-camera';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import firestore from '@react-native-firebase/firestore';
import { useIsFocused } from "@react-navigation/native";

const AepsCW = () => {
const isFocused = useIsFocused(); // Check karega ki kya ye tab screen par dikh raha hai

    const [lodervisi, setLodervisi] = useState(false);
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

    const dayOfWeek = days[now.getDay()];
    const dayOfMonth = now.getDate();
    const month = months[now.getMonth()];
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    const formattedDate = `${dayOfWeek} ${dayOfMonth} ${month} ${hours}:${minutes}:${seconds}`;

    const { getNetworkCarrier, getMobileDeviceId, getMobileIp, getMobilePhoneNumber } =
        useDeviceInfoHook();
    const { userId, Loc_Data, activeAepsLine } = useSelector((state: RootState) => state.userInfo);
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);
    const color1 = `${colorConfig.secondaryColor}20`
    const color2 = `${colorConfig.primaryColor}40`
    const color3 = `${colorConfig.secondaryColor}15`
    const { latitude, longitude } = Loc_Data;
    const [isScan, setIsScan] = useState(false);
    const [isFacialTan, setisFacialTan] = useState(false)
    const { get, post } = useAxiosHook();
const provider =
             activeAepsLine?.provider;
    const isFirstCall = useRef(false);
    useEffect(() => {
        setIsVisible2(false)
        //   if (isFirstCall.current) return;
        //   isFirstCall.current = true;

        //   // 🔹 EKYC only for Yellow Line
        //   if (!activeAepsLine) {
        //     CheckEkyc();
        //   }
        CheckEkyc();
        // 🔹 Bank list API
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
                const response = await post({
                    url: finalUrl,
                });

                console.log("***********",response?.ADDINFO?.data?.[0]);

                if (response?.RESULT === '0') {
                    setBanklist(response.ADDINFO.data);
                }
            } catch (error) {
                console.log('Bank list error:', error);
            }
        };

        // 🔹 Fingerprint condition
        if (fingerprintData === 720) return;

        if (
            fingerprintData?.PidData?.Resp?.errCode === 0 &&
            isScan
        ) {
            // OnPressEnq();
        }

        banks();
    }, [activeAepsLine]);
    //     useEffect(() => {
    // if(activeAepsLine){
    // return
    // }
    //         CheckEkyc();
    //         const banks = async () => {

    //             try {
    //                 const response = await post({ url: activeAepsLine ? `${APP_URLS.aepsBanklistNifi}` : `${APP_URLS.aepsBanklist}` })
    //                 console.log(response['ADDINFO']['data'][0])
    //                 if (response.RESULT === '0') {
    //                     setBanklist(response['ADDINFO']['data'])
    //                 }
    //             } catch (error) {

    //             }
    //         };
    //         if (fingerprintData == 720) {
    //             if (fingerprintData === 720) {
    //                 return;
    //             } else if (fingerprintData["PidData"].Resp.errCode === 0 && isScan) {
    //                 //  OnPressEnq();
    //             }
    //         }
    //         banks();
    //     }, [])



    async function getUserNamefunction(MoNumber) {
        setIsLoading(true)
        try {
            const response = await get({ url: activeAepsLine ? `${APP_URLS.aepsNameinfoNifi}${MoNumber}` : `${APP_URLS.aepsNameinfo}${MoNumber}` })
            setAutofcs(true);
            setConsumerName(response.RESULT);
            setIsLoading(false)

        } catch (error) {
            console.error('Error:', error);
        }
    }
    const checkvideo = async (transamount, agentid, AddharpayResponse) => {
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
    }
    const checkAepsStatus = async () => {
        try {
            const respone = await get({ url: activeAepsLine ? `${APP_URLS.checkaepsStatusNifi}` : `${APP_URLS.checkaepsStatus}` });
            if (respone['Response'] === true) {
                videostatus();
            } else {
                ToastAndroid.showWithGravity(
                    `${respone['Message']}`,
                    ToastAndroid.SHORT,
                    ToastAndroid.BOTTOM,
                );
            }
            console.log(respone['Response']);
            console.log(respone['Message']);

        } catch (error) {
            console.log(error);


        }
    };

    async function adhar_Validation(adharnumber) {
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
    }
    const [isFace, setIsFace] = useState(false)



const faceData ={
  "PidData": {
    "Hmac": "tFeQqiEMiagUFJpg8TqWqTQfgFzx6PVDM2p8YuU+0kkA3nssY4APdtkTb9iC31/a",
    "Resp": {
      "qScore": "-1",
      "fType": "2",
      "errCode": "0",
      "iCount": "0",
      "pType": "3",
      "fCount": "0",
      "nmPoints": "0",
      "iType": "0",
      "pCount": "1"
    },
    "DeviceInfo": {
      "Additional_Info": "",
      "mc": "MIIDrDCCApSgAwIBAgIEFuSbaDANBgkqhkiG9w0BAQsFADCBhjEYMBYGA1UEAxMPRmFjZSBBYWRoYWFyIERQMRgwFgYDVQQLEw9GYWNlIEFhZGhhYXIgRFAxGzAZBgNVBAoTElVJREFJIEZBQ0UgQUFESEFBUjESMBAGA1UEBxMJQmFuZ2Fsb3JlMRIwEAYDVQQIEwlLYXJuYXRha2ExCzAJBgNVBAYTAklOMB4XDTI1MDQyNDEyMzQwNloXDTI2MDQyMjEyMzQwNlowgYYxCzAJBgNVBAYTAklOMRIwEAYDVQQIEwlLYXJuYXRha2ExEjAQBgNVBAcTCUJhbmdhbG9yZTEbMBkGA1UEChMSVUlEQUkgRkFDRSBBQURIQUFSMRgwFgYDVQQLEw9GYWNlIEFhZGhhYXIgTUMxGDAWBgNVBAMTD0ZhY2UgQWFkaGFhciBNQzCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAJpFoptQZ/gWaha9hBYZMp7oSYy0leES5fK2LwfDZ3whpMxyUTI4HyElmRJVaQmQgKTy/Mt4qhQMt/HhIgeAjj3SA1sutoEkYBYTiLyPHDpNCbCRYwU0oA8M2MhERy7WM5fwaA0kKFBgZcnMmgLni4V3R/I1henuoTR7bsmhNIsiy2gAAFHNzrV3D5nm/EV3C4GKli4PzBXJ9g+lTv/QpZ1+GEpfECEPQqEyqKezcl6eMJ3AeuVMs4bGopYas5xRppGhfJ6pUbMXep+YpIf5vngGYNRHmYCIkeqQjI/nYCCWzJX7bwcS+H1rkkQuFbaDpqplJVsoAwbzIJrZokTW4NsCAwEAAaMgMB4wDwYDVR0TAQH/BAUwAwEB/zALBgNVHQ8EBAMCBaAwDQYJKoZIhvcNAQELBQADggEBAF9UB5P2Jxyoy2emwabeadXAxvryrZIwyxNHYDnxpqXYK3ebiBlxoL8p36oucZhUL9c/3DpFtpEg0O6TWvAQib9aoQW/VtVYS9ymwzwHVABAWBG27HiKdpiZXgFG2dfD1Zg2RpIflkqELgMlY+eIpA1k7pC8Mb7UorUffQlupg7L5VwkjvSKVPMrtRblFeHpiqQbQEoTKk/6Tt01klTky/wQmK5fVVXxKy8uF8jRYJWqhvnhbNrynau0Tka1OariRnT489OLUNYLZJGYd1oIad4YrhsifABSoZOCTiwBUiI25DVgNsQWa3m3p5mpSKOEXl1UfTkrV3EYwVfR60RMNLY=",
      "dpId": "UIDAI.UIDAI",
      "rdsId": "UIDAI.ONLINE.001",
      "mi": "UIDAI.ONLINE",
      "rdsVer": "1.0.0",
      "dc": "6a34b4aa-2446-4e3f-864a-7ac49147afe4"
    },
    "Data": {
      "content": "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",
      "type": "X"
    },
    "Skey": {
      "content": "cQsRnfts/n8IOx7ObVf9rkq2mcZEYxER/oNmusZt7E5C2l9ZWqCowK11ztwDKfJH3CZTPjJR7RavTFlkbWuPBSY7GZwWo/NDhjIq81qB1vA4UNeJLhnHv2/U9F6Mc6F8UhX9N8Q5XCGT3ryKCDPJCK10Ox5sC7IgnY7O9RMXzZiS4cSpDFzdkmnhQFAgZU15Ly7B6zswQwaLG3fHazEIY5EhmO3U0peMUrZHeDvgqjo3LFN4GcdmUQtoVDuxQXpcryq5wL4eB3SQxcORulS/Ii5IHmQ9xOIkC/iMqtyZT7yjBoT6CJMrUTgCtj/FSQ60R+XSAVeBaBQS6Zx/KV9SNQ==",
      "ci": "20280813"
    },
    "CustOpts": {
      "Param": [
        {
          "name": "txnId",
          "value": "0d51104e-98ae-4d90-ba8b-3fe9ef3e2bb7"
        },
        {
          "name": "txnStatus",
          "value": "PID_CREATED"
        },
        {
          "name": "responseCode",
          "value": "60402f9f-fecd-4482-a5eb-4cdceaf774d5"
        },
        {
          "name": "faceRdVersionWithEnv",
          "value": "1.3.2 "
        },
        {
          "name": "clientComputeTime",
          "value": "8511"
        },
        {
          "name": "serverComputeTime",
          "value": "10"
        },
        {
          "name": "networkLatencyTime",
          "value": "2389"
        }
      ]
    }
  }
}

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
await BEnQ(captureResponse, cardnumberORUID, "", true);
    } catch (error) {
        console.error("OnPressEnq2 Error:", error);
        Alert.alert("Error", "Biometric processing failed.");
    } finally {
        // setIsLoading(false);
    }
};

const saveFaceResponse = async (data) => {
  try {

    // Indian Time
    const now = new Date();

    const indianTime = now.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      hour12: false
    });

    // Document ID (Readable Time)
    const docId = indianTime
      .replace(/[/: ]/g, "_"); 
      // Example → 14_03_2026_17_42_10

    await firestore()
      .collection("faceAuthLogs")
      .doc(docId)
      .set({
        createdAtIST: indianTime,
        createdAt: firestore.FieldValue.serverTimestamp(),
        response: data
      });

    console.log("Face response saved in Firestore with ID:", docId);

  } catch (error) {
    console.log("Firestore Save Error:", error);
  }
};
   const openFace = () => {

  openFaceAuth(userId)
    .then(async (res) => {
        setIsLoading(true);

      setisFacialTan(true);

      // 🔥 Full response console
      console.log("Face Auth Response:", res);

      // 🔥 Cloud / Firestore save
     // await saveFaceResponse(res);

      // 🔴 Face cancel / camera close
      if (res?.errorCode === 892) {

        setIsLoading(false);
        console.log("Face authentication cancelled");

        return;
      }

   

      // 🟢 Success
      if (res?.piddataJsonString) {

        console.log("Face Data Received Successfully");

        setIsLoading(true);

        OnPressEnq2(res);

      }

    })
    .catch(async (error) => {

      console.error("Face Authentication Error:", error);

    //   await saveFaceResponse({
    //     type: "FACE_ERROR",
    //     error: JSON.stringify(error)
    //   });

      setIsLoading(false);

      Alert.alert("Face authentication failed");

    });
};
    const saveResponseToFile = async (response) => {
        const path = RNFS.DownloadDirectoryPath + '/response-face2.json'; // File path
        try {
            // Write JSON data to file
            await RNFS.writeFile(path, JSON.stringify(response, null, 2), 'utf8');
            console.log('Response saved to', path);
        } catch (error) {
            console.error('Error writing to file:', error);
        }
    };

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
    };


    const videostatus = async () => {
        try {
            const response = await get({ url: activeAepsLine ? `${APP_URLS.adharpayvideostatusNifi}` : `${APP_URLS.adharpayvideostatus}` })
            if (response.Status === true) {

                setShowDialog(false);
            } else {
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
                url: activeAepsLine ? `${APP_URLS.adharpaysendotpNifi}amount=${amountcont}&usermobile=${mobileNumber}` : `${APP_URLS.adharpaysendotp}amount=${amountcont}&usermobile=${mobileNumber}`
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
            console.log(response.status, response.ADDINFO);
        } catch (error) {
            console.error("Error sending OTP:", error);
        }
    };
    const OnPressEnq = async (fingerprintDataString, pidDataXml) => {
        try {

            const parsedJson = typeof fingerprintDataString === 'string'
                ? JSON.parse(fingerprintDataString)
                : fingerprintDataString;

            const pidData = parsedJson?.PidData;
            if (!pidData) throw new Error("Invalid PID Data");

            const DevInfo = pidData.DeviceInfo || {};
            const Resp = pidData.Resp || {};

            // if (Resp.errCode !== "0") {
            //     Alert.alert(Resp.errInfo || "Fingerprint capture failed");
            //     return;
            // }

            const params = DevInfo.additional_info?.Param || [];

            const srNo =
                params.find(p => p.name?.toLowerCase() === 'srno')?.value ||
                params.find(p => p.name?.toLowerCase() === 'serialnumber')?.value ||
                params[0]?.value ||
                "";

            const cardnumberORUID = {
                adhaarNumber: aadharNumber,
                indicatorforUID: "0",
                nationalBankIdentificationNumber: bankid
            };

            const captureResponse = {
                Devicesrno: srNo || "",
                PidDatatype: "X",
                Piddata: pidData.Data?.content || pidData.Data || "",
                ci: pidData.Skey?.ci || "",
                dc: DevInfo.dc || "",
                dpID: DevInfo.dpId || "",
                errCode: Resp.errCode ?? "",
                errInfo: Resp.errInfo || "",
                fCount: Resp.fCount || "1",
                fType: Resp.fType || "2",
                hmac: pidData.Hmac?.content || pidData.Hmac || "",
                iCount: Resp.iCount || "0",
                iType: "0",
                mc: DevInfo.mc || "",
                mi: DevInfo.mi || "",
                nmPoints: Resp.nmPoints || "0",
                pCount: Resp.pCount || "0",
                pType: Resp.pType || "0",
                qScore: Resp.qScore || "0",
                rdsID: DevInfo.rdsId || "",
                rdsVer: DevInfo.rdsVer || "",
                sessionKey: pidData.Skey?.content || pidData.Skey || ""
            };

             BEnQ(captureResponse, cardnumberORUID, pidDataXml, false);

        } catch (error) {
            console.error("OnPressEnq Error:", error);
            Alert.alert("Error", "Fingerprint processing failed.");
        } finally {
          //  setIsLoading(false);
        }
    };


    const BEnQ = useCallback(async (captureResponse1, cardnumberORUID1, pidDataX, isface) => {
        ToastAndroid.show(String(isface ? 'ok' : 'OK'), ToastAndroid.SHORT);
        setIsLoading(true);

        
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
              'AEPS/api/Nifi/app/Aeps/cashWithdrawal';
             }
       
             else if (provider === 'CHAGANS') {
       
               finalUrl =
                 'AEPS/api/Chagan/data/cashWithdrawal';
             }
       
             else if (provider === 'FINGPAY') {
       
               finalUrl =
                'AEPS/api/app/Aeps/cashWithdrawal';
             }
       
             console.log(
               'Calling URL:',
               finalUrl
             );

        try {
            const Model = getMobileDeviceId();
            const address = latitude + longitude;

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
                timestamp: formattedDate,
                transactionType: 'CW',
                name: consumerName,
                Address: address,
                transactionAmount: amountcont,
                isFacialTan: isface  //ch
            };
            const headers = {
                trnTimestamp: formattedDate,
                deviceIMEI: Model,
                "Content-type": "application/json",
                "Accept": "application/json",
            };

            const data = JSON.stringify(jdata);

            const response = await post({
                url: finalUrl,
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
                  
                    Alert.alert(isface ? 'cashWithdrawal-F' : 'CW-NF', ADDINFO);


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
        formattedDate,
        consumerName,
        amountcont,
        isFacialTan,
        isFace  //ch
    ]);
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

    const capture = async (rdServicePackage) => {
        setIsLoading(true)
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

                setisFacialTan(false);

                // 🔥 Full response console me
                console.log("Fingerprint Response:", res);
                setIsLoading(true);

                // 🔥 Firebase me full response save
                // await logToFirebase("fingerprint_response", {
                //   rdServicePackage,
                //   pidOptions,
                //   response: res
                // });

                if (res.errorCode == 720) {
                    setFingerprintData(720);
                    setIsLoading(false);

                    //   await logToFirebase("fingerprint_error_720", res);

                }
                else if (res.status === -1) {

                    setFingerprintData(-1);
                    setIsLoading(false);

                    //    await logToFirebase("fingerprint_status_minus_1", res);

                }
                else if (res.status === 1 || res.errorCode == 0) {

                    //  await logToFirebase("fingerprint_success", res);

                    OnPressEnq(res.piddataJsonString, res.piddataXML);

                    console.log("Data Received Successfully");
                }

            })
            .catch(async (error) => {

                setFingerprintData(720);
setIsLoading(false);
                // 🔥 Error Firebase me
                // await logToFirebase("fingerprint_exception", {
                //   error: JSON.stringify(error),
                //   rdServicePackage,
                //   pidOptions
                // });

                Alert.alert('Please check if the device is connected.');
            });
    };
    // const aepsresponsepress = () => {
    //     navigation.navigate("AepsRespons", {
    //         ministate: {
    //             TransactionStatus: 'Sucess',
    //             BankRrn: 'BankRrn',
    //             TransactionAmount: '3000',
    //             BalanceAmount: '50000'

    //         },
    //         mode: 'AEPS'
    //     })
    // };

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
            BalanceAmount: addinfo.BalanceAmount
        }

        navigation.navigate("AepsRespons", {

            ministate:
                ministate,
            mode: 'AEPS'
        })
    };

 
    const handleAadhaarScan = (scannedData) => {
        console.log("Raw Scanned Data:", scannedData); // Full string print karega

        const obj = {};
        // Regex to find patterns like key="value"
        const regex = /([a-zA-Z0-9]+)="([^"]+)"/g;
        let match;

        while ((match = regex.exec(scannedData)) !== null) {
            obj[match[1]] = match[2];
        }

        console.log("Extracted Params (Object):", obj); // Pure params print honge

        if (obj.uid || obj.name) {
            setAadharNumber(obj.uid || "");
            setConsumerName(obj.name || "");
            setisScan2(false); // Success hone par scanner band
            Alert.alert("Success", `Aadhaar Found: ${obj.name}`);
        } else {
            console.log("Invalid Aadhaar QR Format");
        }
    };
    const CheckEkyc = async () => {
        setIsLoading(true);
        try {
      
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
     


            const response = await get({ url: finalUrl });

            console.log("EKYC Response:", response);

            const msg = response?.Message || "";
            const status = response?.Status;
            //  navigation.navigate("Aepsekycscan");

            if (status === true) {
                // Sab sahi hai, loader band karke aage badhein
                setIsLoading(false);
                return;
            }

            if (msg === '2FAREQUIRED') {
                setIsVisible2(true);
                // navigation.navigate("TwoFAVerify"); // Agar navigate karna ho
            } else if (msg === 'REQUIREDOTP') {
                // navigation.navigate("Aepsekyc");
            } else if (msg === 'REQUIREDSCAN') {
                // navigation.navigate("Aepsekycscan");
            } else {
                // Koi dusra error msg aane par alert dikha kar piche bhejein
                Alert.alert('Status', msg, [
                    { text: 'OK', onPress: () => navigation.goBack() },
                ], { cancelable: false });
            }
        } catch (error) {
            console.log("CheckEkyc Error:", error);
            Alert.alert("Error", "Something went wrong while checking status.");
        } finally {
            setIsLoading(false); // Hamesha stop loader
        }
    };
    const findIsFacialTan = (iINNo) => {

        //console.log(iINNo)
        const bank = banklist.find(item => item.iINNo === iINNo);
        //console.log(bank, '&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&')

        if (bank.isFacialTan) {
            console.error(bank.isFacialTan);
            setisFacialTan(bank.isFacialTan);
            CheckEkyc()
        } else {
            CheckEkyc()
        }
    };

    const [isScan2, setisScan2] = useState(false)
    if (isScan2) {
        const device = useCameraDevice('back');
        const { hasPermission, requestPermission } = useCameraPermission();

        // QR Code detect hone par ye function chalega
        const codeScanner = useCodeScanner({
            codeTypes: ['qr', 'ean-13'],
            onCodeScanned: (codes) => {
                if (codes.length > 0) {
                    handleAadhaarScan(codes)
                    console.log("Scanned Code Params:", codes[0].value); // Yahan PARAMS PRINT ho rahe hain
                    // onSuccess(codes[0].value); // Aapka logic yahan aayega
                    setisScan2(false); // Scan hone ke baad band karne ke liye
                }
            }
        });

        // Permission check
        useEffect(() => {
            requestPermission();
        }, []);

        if (!hasPermission) return <Text>{translate("No_Camera_Permission")}</Text>;
        if (device == null) return <Text>{translate("No_Camera_Device_Found")}</Text>;

        return (
            <View style={StyleSheet.absoluteFill}>
                {/* Full Screen Camera */}
                <Camera
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={true}
                    codeScanner={codeScanner}
                />

                {/* Close Button UI */}
                {/* <View style={{ position: 'absolute', top: 50, right: 20, zIndex: 1 }}>
                    <TouchableOpacity
                        onPress={() => setisScan2(false)}
                        style={{
                            backgroundColor: colorConfig.primaryColor,
                            width: 45,
                            height: 45,
                            borderRadius: 22.5,
                            justifyContent: 'center',
                            alignItems: 'center',
                            elevation: 5
                        }}
                    >
                        <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{translate("X")}</Text>
                    </TouchableOpacity>
                </View> */}

                {/* Scanning Overlay (Optional: Beech mein box dikhane ke liye) */}
                <View style={styles.overlay}>
                    <View style={styles.scanWindow} />
                    <Text style={styles.scanText}>{translate("QR_Code_Scan")}</Text>
                </View>
            </View>
        );
    }



    return (
        <View style={styles.main}>
            {/* कीबोर्ड मैनेजमेंट के लिए KeyboardAwareScrollView */}
            <KeyboardAwareScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 50 }}
                enableOnAndroid={true}
                extraScrollHeight={100}
                keyboardShouldPersistTaps="handled"
                // pointerEvents यहाँ हैंडल किया गया है
                pointerEvents={isVisible2 ? "box-none" : "auto"}
            >
                <View style={styles.container}>
                    <View style={styles.body}>

                        {/* Bank Selection */}
                        <TouchableOpacity
                            onPress={() => { setIsVisible2(false); setisbank(true); }}
                        >
                            <FlotingInput
                                editable={false}
                                label={bankName ? bankName.toString() : translate("Select Your Bank")}
                                placeholder={bankName ? "" : translate("Select Your Bank")}
                                onChangeTextCallback={(text) => setServifee(text)}
                            />
                            <View style={styles.righticon}>
                                <OnelineDropdownSvg />
                            </View>
                        </TouchableOpacity>

                        {/* Aadhar Number */}
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
                                {isValid && <CheckSvg  color={colorConfig.primaryColor} />}

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

                        {/* Mobile Number */}
                        <FlotingInput
                            label="Enter Mobile Number"
                            value={mobileNumber}
                            keyboardType="number-pad"
                            maxLength={10}
                            editable={bankName !== ''}
                            onChangeTextCallback={(text) => {
                                setMobileNumber(text);
                                if (text.length === 10) {
                                    getUserNamefunction(text);
                                }
                            }}
                        />

                        {/* Consumer Name */}
                        <FlotingInput
                            editable={bankName !== ''}
                            label="Enter Consumer Name"
                            value={consumerName}
                            autoFocus={autofcs}
                            onChangeTextCallback={(text) => setConsumerName(text)}
                        />

                        {/* Amount */}
                        <FlotingInput
                            editable={bankName !== ''}
                            label="Enter Amount"
                            value={amountcont}
                            keyboardType="number-pad"
                            onChangeTextCallback={(text) => setAmountcont(text)}
                        />

                        {isLoading && <ShowLoader />}

                        {/* Service Fee */}
                        <FlotingInput
                            editable={bankName !== ''}
                            label="Enter Service Fee"
                            value={servifee}
                            keyboardType="number-pad"
                            maxLength={3}
                            onChangeTextCallback={(text) => setServifee(text)}
                        />

                        {/* Device Selection Section */}
                        <SelectDevice
                            isProcees={
                                consumerName.length >= 4 &&
                                amountcont !== '' &&
                                isValid &&
                                mobileNumber.length >= 10 &&
                                aadharNumber.length >= 12 &&
                                bankName !== 'Select Bank'
                            }
                            setDeviceName={setDeviceName}
                            device={'Device'}
                            isface2={false}
                            isface={provider === 'CHAGANS' ? false :isFacialTan}
                            opPress={() => {
                                setDeviceName(deviceName);
                                handleSelection(deviceName);
                            }}
                            onPressface={() => openFace()}
                        />

                        <View style={{ marginBottom: hScale(10) }} />

                        {/* Submit Button */}
                        {(bankName !== '' && deviceName !== 'Device') && (
                            <DynamicButton
                                onPress={() => {
             //   OnPressEnq2(faceData);

                                    setisFacialTan(false);
                                    if (bankName !== 'Select Bank' &&
                                        mobileNumber.length === 10 &&
                                        consumerName !== null &&
                                        aadharNumber.length === 12 &&
                                        isValid !== false &&
                                        amountcont !== '') {
                                        handleSelection(deviceName);
                                    }
                                }}
                                title={'Scan & Proceed'}
                            />
                        )}

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

            {/* 1. Bank Bottom Sheet */}
         { isFocused &&   <BankBottomSite
                setBankId={setBankId}
                setisFacialTan={setisFacialTan}
                onPress1={(id) => findIsFacialTan(id)}
                bankdata={banklist}
                isbank={isbank}
                setBankName={setBankName}
                setisbank={setisbank}
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
        position: "absolute",
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
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)'
    },
    scanWindow: {
        width: 250,
        height: 250,
        borderWidth: 2,
        borderColor: '#00FF00',
        backgroundColor: 'transparent',
        borderRadius: 10
    },
    scanText: {
        color: 'white',
        marginTop: 20,
        fontSize: 16,
        fontWeight: '500'
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

