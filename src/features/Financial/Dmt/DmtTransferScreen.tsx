import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ToastAndroid, Alert, ActivityIndicator } from 'react-native';
import FlotingInput from '../../drawer/securityPages/FlotingInput';
import { translate } from '../../../utils/languageUtils/I18n';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { useDeviceInfoHook } from '../../../utils/hooks/useDeviceInfoHook';
import { encrypt } from '../../../utils/encryptionUtils';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import LinearGradient from 'react-native-linear-gradient';
import DynamicButton from '../../drawer/button/DynamicButton';
import { useNavigation } from '@react-navigation/native';
import OTPModal from '../../../components/OTPModal';
import { playSound } from '../../dashboard/components/Sounds';
import { useLocationHook } from '../../../hooks/useLocationHook';
import { onReceiveNotification2 } from '../../../utils/NotificationService';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const DmtTransferScreen = ({ route }) => {
    const { colorConfig ,Loc_Data } = useSelector((status: RootState) => status.userInfo)
    const navigation = useNavigation<any>();

    const [amount, setAmount] = useState('');
    const [reamount, setReamount] = useState('');
    const [servicefee, setServiceFee] = useState('');
    const [transpin, setTranspin] = useState('');
    const [id, setId] = useState(1);
    const [aadharvis, setaadharvis] = useState(true);
    const [panvisi, setPanvisi] = useState(false);
    const [aadhar, setaadhar] = useState('');
    const [uniqueId, setUniqueId] = useState('');
    const [pancard, setpancard] = useState('');
    const { post, get } = useAxiosHook();
    const [showOtpModal, setShowOtpModal] = useState(false)
    const [mobileOtp, setMobileOtp] = useState('');
    const [bankRefId, setBankRefId] = useState('')
    const [benId, setBenId] = useState('')
    const [agentId, setAgentId] = useState('')
    const [onTap1, setOnTap1] = useState(false);
    const [isR, setIsR] = useState('');
    const { dmttype } = route.params;
    useEffect(() => {
        console.log(route.params)
        setaadharvis(false);
        setPanvisi(false);
        console.log(userId);
        getGenUniqueId();
        // CheckDmtstatus();
    }, []);

    const CheckDmtstatus = async () => {
        try {
            const url = `${APP_URLS.Dmtstatus}`;
            const response = await get({ url: url });
            console.log(url);
            console.log(response, '!!!!!!!!!!!!!');
            const msg = response.Message;
            const Response = response.Response;
            const Name = response.Name;
            setIsR(Name);

        } catch (error) {
            console.log(error);
        }
    };
    const checkID = useCallback(async (number: any) => {
        try {
            let res;
            let message;

            if (aadharvis) {
                res = await get({ url: `${APP_URLS.checkUpiSdrAdhar}AdharCardValidationCheck?aadharnumber=${number}` });
                console.log(res);
                message = res['status'] ? 'Aadhar Verified ✅' : 'Aadhar not Verified ❌';
            } else if (panvisi) {
                res = await get({ url: `${APP_URLS.checkUpiSdrAdhar}PancardCardValidationCheck?pannumber=${number}` });
                console.log(res);
                message = res['status'] ? 'Pan Verified ✅' : 'Pan not verified ❌';
            }

            if (message) {
                ToastAndroid.showWithGravity(
                    message,
                    ToastAndroid.SHORT,
                    ToastAndroid.BOTTOM,
                );
            }
        } catch (error) {
            console.error('Error in checkID:', error);
            ToastAndroid.showWithGravity(
                'Error occurred during verification. Please try again later.',
                ToastAndroid.SHORT,
                ToastAndroid.BOTTOM,
            );
        }
    }, [aadharvis, panvisi, get]);
    const { latitude, longitude } = Loc_Data;
    const { userId } = useSelector((state: RootState) => state.userInfo);
    const { getNetworkCarrier, getMobileDeviceId, getMobileIp } =
        useDeviceInfoHook();



    const Readiant = async () => {
        const { BeneficiaryMobile, ACCno, ifsc, mode, bankname, accHolder, unqid, remid, custid } = await route.params;
        console.log(BeneficiaryMobile);

        const mobileNetwork = await getNetworkCarrier();
        const ip = await getMobileIp();
        const Model = await getMobileDeviceId();
        console.log("Model", Model);

        const enc = await encrypt([]);
        const url = `Money/api/Radiant/Fundtransfer?sender_number=${BeneficiaryMobile}&Accountnumber=${ACCno}&bankname=${bankname}&benIFSC=${ifsc}&Name=${accHolder}&benid=${remid}&custid=${custid}&Amount=${amount}&typetransfer=${mode}&pin=${transpin}`;

        try {
            const Radiant = await post({ url });
            console.log(url);
            console.log(Radiant);

            if (Radiant.RESULT === "1") {
                Alert.alert("Error", Radiant.ADDINFO);
            } else {
                Alert.alert("Success", "Transaction completed successfully!");
            }
        } catch (error) {
            Alert.alert("Error", "An unexpected error occurred. Please try again.");
            console.error(error);
        }
    };
    const getGenUniqueId = async () => {
        try {
            const url = `${APP_URLS.getGenIMPSUniqueId}`
            console.log(url);
            const res = await get({ url: url });

            console.log(res)
            if (res['Response'] == 'Failed') {
                ToastAndroid.showWithGravity(
                    res['Message'],
                    ToastAndroid.SHORT,
                    ToastAndroid.BOTTOM,
                )
            } else {
                setUniqueId(res?.Message)
                //  ONpay(res['Message'])
                // ToastAndroid.showWithGravity(
                //   res['Response'],
                //   ToastAndroid.SHORT,
                //   ToastAndroid.BOTTOM,
                // )
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };



    const onTransfer = useCallback(async () => {
        const { unqid, ACCno, accHolder, bankname, ifsc, kyc, mode, sendernum, id } = route.params;

        const res = await post({ url: `MoneyDMT/api/Money/Imps_checking_transfer?snn=${sendernum}&ttt=${amount}&nnn=${transpin}&nttt=${ACCno}` })
        console.log('**RES')
        if (res) {
            if (
                amount === '' ||
                reamount === '' ||
                transpin.length < 4 ||
                (amount !== reamount)
            ) {
                console.log('Please fill in all required fields');
                setOnTap1(false);
                return;
            }

            setOnTap1(true)
            try {

                const mobileNetwork = await getNetworkCarrier();
                const ipp = await getMobileIp();
                const Model = await getMobileDeviceId();
                console.log("Model", Model);

                const encryption = await encrypt([
                    userId, // umm0
                    accHolder, // name 1
                    sendernum, // snn 2    
                    ifsc, // fggg 3
                    id, // eee 4
                    transpin, // nnn 5
                    ACCno, // nttt 6
                    mode, // peee 7
                    Model, // nbb 8
                    bankname, // bnm 9 
                    ipp, // ip 10
                    Model, // Devicetoken 11
                    latitude, // Latitude 12
                    longitude, // Longitude 13
                    Model, // Model 14 
                    'address', // Address 15 
                    Model, // City 16 
                    'postcode', // PostalCode 17 
                    mobileNetwork, // InternetTYPE 18 
                    unqid, // uniqueid 19
                ]);

                const umm = encodeURIComponent(encryption.encryptedData[0]);

                const snn = encodeURIComponent(encryption.encryptedData[2]);
                const fggg = encodeURIComponent(encryption.encryptedData[3]);
                const eee = encodeURIComponent(encryption.encryptedData[4]);
                const ttt = amount; // ttt
                const nnn = encodeURIComponent(encryption.encryptedData[5]);
                const nttt = encodeURIComponent(encryption.encryptedData[6]);
                const peee = encodeURIComponent(encryption.encryptedData[7]);
                // const nbb = encodeURIComponent(encryption.encryptedData[8]);
                const bnm = encodeURIComponent(encryption.encryptedData[9]);
                // const ip = encodeURIComponent(encryption.encryptedData[10]);

                const kyc = route.params['kyc'] === true ? 'Done' : aadhar; // kyc
                const pkyc = route.params['kyc'] === true ? 'Done' : pancard; // kyc
                const ottp = servicefee;
                const Devicetoken = encodeURIComponent(encryption.encryptedData[11]);
                const Latitude = encodeURIComponent(encryption.encryptedData[12]);
                const Longitude = encodeURIComponent(encryption.encryptedData[13]);

                const ModelNo = encodeURIComponent(encryption.encryptedData[14]);
                const Address = encodeURIComponent(encryption.encryptedData[15]);
                const City = encodeURIComponent(encryption.encryptedData[16]);
                const postcode = encodeURIComponent(encryption.encryptedData[17]);
                const nettype = encodeURIComponent(encryption.encryptedData[18]);
                const uniqueid1 = encodeURIComponent(encryption.encryptedData[19]);

                const value1 = encodeURIComponent(encryption.keyEncode);
                console.log('value1:', value1);

                const value2 = encodeURIComponent(encryption.ivEncode);
                console.log('value2:', value2);
                //const Radiant = await post({url:`Money/api/Radiant/Fundtransfer?sender_number?Accountnumber?bankname?benIFSC?Name?benid?custid?Amount?typetransfer?pin`})
                const jsonString = {
                    umm: umm,
                    //  name: name,
                    snn: snn,
                    fggg: fggg,
                    eee: eee,
                    ttt: ttt,
                    nnn: nnn,
                    nttt: nttt,
                    peee: peee,

                    bnm: bnm,
                    //  ip: ip,
                    Devicetoken: Devicetoken,
                    Latitude: Latitude,
                    Longitude: Longitude,
                    ModelNo: ModelNo,
                    Address: Address,
                    City: City,
                    PostalCode: postcode,
                    InternetTYPE: nettype,
                    value1: value1,
                    value2: value2,
                    uniqueid: uniqueId
                };


                console.log(JSON.stringify(jsonString))
                const data = {};
                for (const key in jsonString) {
                    if (jsonString.hasOwnProperty(key)) {
                        data[key] = decodeURIComponent(jsonString[key]);
                    }
                }


                const response = await post({
                    url: 'MoneyDMT/api/Money/yyyy2',
                    data: data,
                });

                console.log('payment response', response);
                if (response?.data?.[0].Status === 'Failed') {
                    setOnTap1(false);
                    Alert.alert(
                        'Payment Response',
                        `Account No: ${response.Accountno}\nBank Name: ${response.BankName}\nIFSC Code: ${response.Ifsccode}\nTime: ${response.Time}\nTotal Amount: ${response.TotalAmount}\n\nTransaction Details:\n${response.data.map(transaction => `Amount: ${transaction.Amount}\nStatus: ${transaction.Status}\nBank Ref ID: ${transaction.bankrefid}`).join('\n\n')}`,
                        [{ text: 'Go Back', onPress: () => navigation.goBack() }]
                    );
                }
                else if (response?.data?.[0].Status === 'Success') {
                    playSound('Success')
                    const mockNotification = {
                        notification: {
                            title: 'Payment Response',
                            body: `Account No: ${response.Accountno}\nBank Name: ${response.BankName}\nIFSC Code: ${response.Ifsccode}\nTime: ${response.Time}\nTotal Amount: ${response.TotalAmount}\n\nTransaction Details:\n${response.data.map(transaction => `Amount: ${transaction.Amount}\nStatus: ${transaction.Status}\nBank Ref ID: ${transaction.bankrefid}`).join('\n\n')}`,

                        },
                    };

                    // Call the function
                    onReceiveNotification2(mockNotification);
                    Alert.alert(
                        'Payment Response',
                        `Account No: ${response.Accountno}\nBank Name: ${response.BankName}\nIFSC Code: ${response.Ifsccode}\nTime: ${response.Time}\nTotal Amount: ${response.TotalAmount}\n\nTransaction Details:\n${response.data.map(transaction => `Amount: ${transaction.Amount}\nStatus: ${transaction.Status}\nBank Ref ID: ${transaction.bankrefid}`).join('\n\n')}`,
                        [{ text: 'Go To Dashboard', onPress: () => navigation.navigate('Dashboard') }]
                    );
                }
                else if (response?.data?.[0].Status === 'SENDOTP') {
                    setBankRefId(response?.data?.[0].bankrefid)
                    setBenId(response?.data?.[0].benid)
                    setAgentId(response?.data?.[0].Agentid)
                    setShowOtpModal(true)
                }
                else if (response?.data?.[0].Status === 'Pending') {
                    Alert.alert(
                        'Payment Response',
                        `Account No: ${response.Accountno}\nBank Name: ${response.BankName}\nIFSC Code: ${response.Ifsccode}\nTime: ${response.Time}\nTotal Amount: ${response.TotalAmount}\n\nTransaction Details:\n${response.data.map(transaction => `Amount: ${transaction.Amount}\nStatus: ${transaction.Status}\nBank Ref ID: ${transaction.bankrefid}`).join('\n\n')}`,
                        [{ text: 'Go To Dashboard', onPress: () => navigation.navigate('Dashboard') }]
                    );
                } else {
                    Alert.alert('Error', 'Something went wrong. Please try again later.', [{
                        text: 'Go Back', onPress: () => navigation.goBack()
                    }]);
                }

                playSound('Failed')




            } catch (error) {
                console.error('Error in ONpay:', error);
            }

        }
        else {
            return;
        }



    }, [userId, route?.params, transpin, amount, aadhar, pancard, post]);

    const verifyTransferOtp = async () => {
        const res = await post({ url: `MoneyDMT/api/Money/VerifyOTP?Agentid=${agentId}&benid=${benId}&otp=${mobileOtp}&stateresp=${bankRefId}` });
        if (res) {
            if (res?.data?.[0].Status === 'Success') {
                Alert.alert(
                    'Payment Response',
                    `Account No: ${res.Accountno}\nBank Name: ${res.BankName}\nIFSC Code: ${res.Ifsccode}\nTime: ${res.Time}\nTotal Amount: ${res.TotalAmount}\n\nTransaction Details:\n${res.data.map(transaction => `Amount: ${transaction.Amount}\nStatus: ${transaction.Status}\nBank Ref ID: ${transaction.bankrefid}`).join('\n\n')}`,
                    [{ text: 'Go To Dashboard', onPress: () => navigation.navigate('Dashboard') }]
                );
            }
            else if (res?.data?.[0].Status === 'Failed') {
                Alert.alert(
                    'Payment Response',
                    `Account No: ${res.Accountno}\nBank Name: ${res.BankName}\nIFSC Code: ${res.Ifsccode}\nTime: ${res.Time}\nTotal Amount: ${res.TotalAmount}\n\nTransaction Details:\n${res.data.map(transaction => `Amount: ${transaction.Amount}\nStatus: ${transaction.Status}\nBank Ref ID: ${transaction.bankrefid}`).join('\n\n')}`,
                    [{ text: 'Go Back', onPress: () => navigation.goBack() }]
                );
            }

            else if (res?.data?.[0].Status === 'Pending') {
                Alert.alert(
                    'Payment Response',
                    `Account No: ${res.Accountno}\nBank Name: ${res.BankName}\nIFSC Code: ${res.Ifsccode}\nTime: ${res.Time}\nTotal Amount: ${res.TotalAmount}\n\nTransaction Details:\n${res.data.map(transaction => `Amount: ${transaction.Amount}\nStatus: ${transaction.Status}\nBank Ref ID: ${transaction.bankrefid}`).join('\n\n')}`,
                    [{ text: 'Go Back', onPress: () => navigation.goBack() }]
                );
            }
        }
        else {
            Alert.alert('Error', 'Something went wrong. Please try again later.', [{
                text: 'Go Back', onPress: () => navigation.goBack()
            }]);

        }

    }

 return (
    <View style={styles.main}>
        {/* AppBar and Gradient Header Card */}
        <AppBarSecond title={'To Bank'} />
        <LinearGradient 
            colors={[colorConfig.primaryColor, colorConfig.secondaryColor]} 
            style={styles.headerGradient}
        >
            <View style={styles.inercontainer}>
                {/* Mode and IFSC Row */}
                <View style={styles.rowContainer}>
                    <View style={styles.leftContainer}>
                        <Text style={[styles.label, { color: colorConfig.primaryColor }]}>{translate("Mode")}</Text>
                        <Text style={[styles.Value, { color: colorConfig.secondaryColor }]}>
                            {route.params['mode']}
                        </Text>
                    </View>
                    <View style={styles.rightContainer}>
                        <Text style={[styles.label, { color: colorConfig.primaryColor }]}>
                            {translate('IFS Code')}
                        </Text>
                        <Text style={[styles.Value, { color: colorConfig.secondaryColor }]}>
                            {route.params['ifsc']}
                        </Text>
                    </View>
                </View>

                {/* Bank Name and Account Holder Row */}
                <View style={styles.rowContainer}>
                    <View style={[styles.leftContainer, { flex: 1 }]}>
                        <Text style={[styles.label, { color: colorConfig.primaryColor }]}>
                            {translate('Bank')}
                        </Text>
                        <Text 
                            style={[styles.Value, { color: colorConfig.secondaryColor }]}
                            numberOfLines={1} 
                            ellipsizeMode='tail'
                        >
                            {route.params['bankname']}
                        </Text>
                    </View>
                    <View style={styles.rightContainer}>
                        <Text style={[styles.label, { color: colorConfig.primaryColor }]}>
                            {translate('Name')}
                        </Text>
                        <Text style={[styles.Value, { color: colorConfig.secondaryColor }]}>
                            {route.params['accHolder']}
                        </Text>
                    </View>
                </View>

                {/* Account Number and Unique ID Row */}
                <View style={styles.rowContainer}>
                    <View style={styles.leftContainer}>
                        <Text style={[styles.label, { color: colorConfig.primaryColor }]}>
                            {translate('Ac')}
                        </Text>
                        <Text style={[styles.Value, { color: colorConfig.secondaryColor }]}>
                            {route.params['ACCno']}
                        </Text>
                    </View>
                    <View style={styles.rightContainer}>
                        <Text style={[styles.label, { color: colorConfig.primaryColor }]}>{translate("Unique_Id")}</Text>
                        <Text 
                            style={[styles.Value, { color: colorConfig.secondaryColor }]}
                            numberOfLines={1} 
                            ellipsizeMode='head'
                        >
                            {route.params['unqid']}
                        </Text>
                    </View>
                </View>
            </View>
        </LinearGradient>

        <KeyboardAwareScrollView>
            <View style={styles.container}>
                
                {/* ID Type Selection Section (Kyc conditional) */}
                {route.params['kyc'] !== false && (
                    <View>
                        <Text style={styles.selecttitle}>{translate("Select_ID_Type")}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: hScale(20) }}>
                            <TouchableOpacity onPress={() => { setaadharvis(false); setPanvisi(false); setId(3); }}>
                                <Text style={[styles.button, { backgroundColor: !aadharvis && !panvisi ? colorConfig.primaryButtonColor : 'transparent', color: !aadharvis && !panvisi ? colorConfig.labelColor : '#000' }]}>{translate("None")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setaadharvis(true); setPanvisi(false); setId(1); }}>
                                <Text style={[styles.button, { backgroundColor: aadharvis ? colorConfig.primaryButtonColor : 'transparent', color: aadharvis ? colorConfig.labelColor : '#000' }]}>{translate("Aadhaar")}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => { setaadharvis(false); setPanvisi(true); setId(2); }}>
                                <Text style={[styles.button, { backgroundColor: panvisi ? colorConfig.primaryButtonColor : 'transparent', color: panvisi ? colorConfig.labelColor : '#000' }]}>{translate("PAN_Card")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Amount Entry Fields */}
                <FlotingInput
                    label={translate('Enter Amount')}
                    inputstyle={{ borderColor: amount && reamount && amount !== reamount ? 'red' : 'black' }}
                    value={amount}
                    keyboardType="number-pad"
                    maxLength={8}
                    onChangeTextCallback={(text) => {
                        if (/^\d*$/.test(text)) setAmount(text);
                    }}
                />

                <FlotingInput
                    label={translate('Re-Enter Amount')}
                    inputstyle={{ borderColor: amount && reamount && amount !== reamount ? 'red' : 'black' }}
                    value={reamount}
                    keyboardType="number-pad"
                    maxLength={8}
                    onChangeTextCallback={(text) => {
                        if (/^\d*$/.test(text)) setReamount(text);
                    }}
                />

                {/* Conditional ID Input Fields */}
                {aadharvis && (
                    <FlotingInput
                        label={translate('Enter Aadhar Number')}
                        keyboardType="number-pad"
                        maxLength={12}
                        onChangeTextCallback={(text) => {
                            setaadhar(text);
                            if (text.length === 12) checkID(text);
                        }}
                    />
                )}

                {panvisi && (
                    <FlotingInput
                        label={translate('Enter Pan Number')}
                        maxLength={10}
                        onChangeTextCallback={(text) => {
                            setpancard(text.toUpperCase());
                            if (text.length === 10) checkID(text);
                        }}
                    />
                )}

                {/* Transaction PIN Section */}
                <FlotingInput
                    label={translate('Enter Transaction PIN')}
                    value={transpin}
                    keyboardType="number-pad"
                    maxLength={6}
                    secureTextEntry={true} // सुरक्षा के लिए PIN को छुपाना बेहतर है
                    editable={amount !== '' && amount === reamount}
                    onChangeTextCallback={(text) => setTranspin(text)}
                />

                <View style={{ marginTop: hScale(20) }}>
                    <DynamicButton
                        title={onTap1 ? <ActivityIndicator size={'small'} color={colorConfig.labelColor} /> : "Pay Now"}
                        onPress={() => {
                            if (amount === reamount && transpin.length === 6) {
                                onTransfer();
                            } else {
                                ToastAndroid.show("Please match amount and enter 6-digit PIN", ToastAndroid.SHORT);
                            }
                        }}
                        disabled={onTap1 || !transpin || amount !== reamount}
                    />
                </View>
            </View>
        </KeyboardAwareScrollView>

        {/* OTP Verification Modal */}
        <OTPModal
            setShowOtpModal={setShowOtpModal}
            disabled={mobileOtp.length !== 4}
            showOtpModal={showOtpModal}
            setMobileOtp={setMobileOtp}
            setEmailOtp={null}
            inputCount={4}
            verifyOtp={() => {
                setShowOtpModal(false);
                verifyTransferOtp();
            }}
        />
    </View>
);
};


const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: '#fff'
    },
    container: {
        paddingHorizontal: wScale(15),
        paddingVertical: wScale(15),
    },
    selecttitle: {
        fontSize: wScale(22),
        paddingBottom: hScale(10),
        paddingTop: hScale(15),
        color: '#000',
        fontWeight: 'bold'
    },
    inercontainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        paddingHorizontal: wScale(10),
        paddingVertical: wScale(0),
        margin: wScale(10)
    },
    button: {
        borderWidth: wScale(1),
        padding: wScale(7),
        borderRadius: 5,
        marginRight: wScale(10),
        fontSize: wScale(15),
        borderBottomColor: '#000',
        color: '#000'
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: hScale(5),
    },
    leftContainer: {
    },
    rightContainer: {
        alignItems: 'flex-end',
        flex: 1,
        marginLeft: wScale(10)
    },
    icon: {
        width: wScale(24),
        height: hScale(24),
        tintColor: 'PrimaryColor',
    },

    label: {
        fontSize: wScale(15),
        fontWeight: 'bold',
    },
    Value: {
        fontSize: wScale(14),
        letterSpacing: 1,
    },

});

export default DmtTransferScreen;
