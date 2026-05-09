import { translate } from "../../../utils/languageUtils/I18n";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, PermissionsAndroid, ToastAndroid, Alert, Modal, Image, ActivityIndicator } from "react-native";
import { hScale, SCREEN_HEIGHT, wScale } from "../../../utils/styles/dimensions";
import AppBarSecond from "../../drawer/headerAppbar/AppBarSecond";
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { BottomSheet } from "@rneui/themed";
import ClosseModalSvg2 from "../../drawer/svgimgcomponents/ClosseModal2";
import FlashList from "@shopify/flash-list/dist/FlashList";
import { APP_URLS } from "../../../utils/network/urls";
import useAxiosHook from "../../../utils/network/AxiosClient";
import DynamicButton from "../../drawer/button/DynamicButton";
import FlotingInput from "../../drawer/securityPages/FlotingInput";
import LottieView from "lottie-react-native";
import { useNavigation } from "@react-navigation/native";
import OnelineDropdownSvg from "../../drawer/svgimgcomponents/simpledropdown";
import { appendLog } from "../../../components/log_file_Saver";
import ImagePreviewModal from "../Radiantregister/ImagePreviewModal";
import { SvgUri } from "react-native-svg";
import { useDocumentUpload } from "../../../hooks/useDocumentUpload";
import ConfirmBox from "../../../components/ConfirmBox";
import WalletCard from "../RadiantTrxn/WalletCard";
import Rechargeconfirm from "../../../components/Rechargeconfirm";
const Totalpayreport = ({ route }) => {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);
    const { selectedAmount = '', requestid = '', PaymentMode = '', Individualrequestid = '', ceId = '', paymentType = '' } = route?.params || {};
    console.log(selectedAmount, 'am', ceId, 'rc', requestid, 'rdi', PaymentMode, 'pmm', paymentType, 'pmt', 'abhi');

    const [updateamount, setupdateamount] = useState();
    const [showStateList, setshowStateList] = useState(false);
    const [showRadientList, setshowRadientList] = useState(false);
    const color1 = `${colorConfig.secondaryColor}20`;
    const [stext, setstext] = useState()
    const [sLabel, setsLabel] = useState()
    const [Loading, setLoading] = useState(false);
    const [clienttransfer, setclienttransfer] = useState(false);

    const { post } = useAxiosHook();
    const [imagename, setImageName] = useState('')
    const [RequestID, setRequestID] = useState('')
    const [response, setresponse] = useState([])
    const [clientresponse, setclientresponse] = useState([])
    const [selectedAccountDetails, setSelectedAccountDetails] = useState<string[]>([]);
    const [utrnumber, setutrnumber] = useState("")
    const [clientname, setclientname] = useState("Name")
    const [clientAccountnumber, setclientAccountnumber] = useState('')
    const [RadientAccountnumber, setRadientAccountnumber] = useState('')
    const [onlineRadientAccountnumber, setonlineRadientAccountnumber] = useState('')
    const [Bankname, setBankname] = useState("")
    const [onlinetransfer, setonlinetransfer] = useState(false)
    const [imagePath, setimagePath] = useState('')
    const [bankaccount, setbankaccount] = useState('')
    const [isDetail, setIsDetail] = useState(false);
    const [bankNo, setBankNo] = useState('');
    const [bName, setBName] = useState('');
    const { get } = useAxiosHook()
    const depositelist = [
        { name: 'BARRELCASHDEPOSIT', label: 'BARREL CASH DEPOSIT' },
        { name: 'CLIENTCASHDEPOSIT', label: 'CLIENT CASH DEPOSIT' },
        { name: 'ONLINETRANSFER', label: 'Online Transfer' },
        { name: 'WalletTransfer', label: 'Wallet Transfer' }
    ];
    const navigation = useNavigation();
    const [walletData, setWalletData] = useState({
        remainbal: 0,
        posremain: 0,
    });
    const fetchData = async () => {
        try {
            const response = await get({ url: APP_URLS.balanceInfo });
            if (response?.data?.length > 0) {
                const data = response.data[0];
                setWalletData({
                    remainbal: data.remainbal ?? 0,
                    posremain: data.posremain ?? 0,
                });
                console.log(walletData.remainbal, '=-=-=-=-=-');

            }
        } catch (error) {
            console.error('Error fetching wallet data:', error);
        }
    };


    useEffect(() => {
        fetchData()
        RadientBankaccount();
        ClientBankaccount();
        setclientAccountnumber('')
        setclientname('')
        setRadientAccountnumber('')
        setonlineRadientAccountnumber("");
        setBankname('')
        setclienttransfer(false)
        setonlinetransfer(false)
    }, []);

    const handlesubmit = () => {

        setIsDetail(false);

        if (stext === 'WalletTransfer') {
            Radientcashsubmit1();

        } else {
            console.log('-============================');

            Radientcashsubmit();
        }

    };
    const RadientBankaccount = async () => {
        try {
            const res = await post({
                url: `${APP_URLS.RadiantBankAccount}`,
            });

            console.log("++++++++++++++++++++++++++++++++", res);
            const parsedData = JSON.parse(res.data);
            setresponse(parsedData.Content);

        } catch (error) {
            console.error('API Error:', error);
        } finally {
            setLoading(false);
        }
    }


    const {
        previewVisible,
        setPreviewVisible,
        currentPreviewImage,
        setCurrentPreviewImage,
        currentPreviewImageRef,
        currentDocumentType,
        setCurrentDocumentType,
        handleImageSelection,
    } = useDocumentUpload();

    const handleUpload = () => {
        if (currentPreviewImage) {
            setPreviewVisible(true);
        } else {
            handleImageSelection('slip', (base64) => {
                currentPreviewImageRef.current = base64;

                console.log('Uploaded base64 image:', base64);
                setCurrentPreviewImage(base64);
                setCurrentDocumentType('slip');
                setPreviewVisible(true);
            });
        }
    };

    const handleReUpload = () => {
        setPreviewVisible(false);
        setTimeout(() => {
            setCurrentPreviewImage('');
            currentPreviewImageRef.current = '';

            handleImageSelection('slip', (base64) => {
                setCurrentPreviewImage(base64);
                setCurrentDocumentType('slip');
                setPreviewVisible(true);
            });
        }, 300);
    };


    const generateRequestID = () => {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 10000);
        return `REQ-${timestamp}-${random}`;
    };

    const Radientcashsubmit1 = async () => {

        setLoading(true)
        const detailObj = {};
        selectedAccountDetails.forEach((entry) => {
            const [key, value] = entry.split(" : ");
            detailObj[key.trim()] = value.trim();
        });
        try {
            console.log(selectedAccountDetails)
            const newID = generateRequestID();
            setRequestID(newID);
            console.log("%%%%%", RequestID)
            console.log("jfdhfjhj", requestid)
            console.log("jfdhfjhj", requestid)

            const jdata = {
                Radiantid: (requestid ? requestid : Individualrequestid)
                    .toString()
                    .split(",")
                    .map(id => ({ Radiantid: id.trim() })),
                RequestID: newID,
                CEID: ceId,
                Type: stext,
                TotalAmount: selectedAmount,
                Amount: updateamount,

            };


            const data = JSON.stringify(jdata);
            console.log("************************************************", data)

            await appendLog(data, `totalreport----${newID}`)

            const res = await post({
                url: `${APP_URLS.Radientwallettransfer}`,
                data: jdata,
            });

            console.log("++++++++++++++++++++++++++++++++", res);
            const { status, data: responseMessage } = res;

            const upperStatus = status.toUpperCase();
            if (upperStatus === "OK") {
                setLoading(false)
                Alert.alert(
                    "Success",
                    responseMessage,
                    [{
                        text: "OK",
                        onPress: () => {
                            navigation.goBack()
                        },
                    }]
                );
                setLoading(false)
            } else if (upperStatus === "PENDING") {
                setLoading(false)
                Alert.alert(
                    "Pending",
                    responseMessage,
                    [{
                        text: "OK",
                        onPress: () => {
                            navigation.goBack();
                        },
                    }]
                );
                setLoading(false)
            }
            else {
                setLoading(false)
                Alert.alert(
                    "Failed",
                    responseMessage || "Something went wrong!",
                    [{
                        text: "OK",
                        onPress: () => {
                            navigation.goBack();
                        },
                    }]
                );
                setLoading(false)
            }

        } catch (error) {
            console.error('API Error:', error);
            setLoading(false)
        } finally {
            setLoading(false);
        }
    }


    const validateForm = () => {
        if (!updateamount) {
            ToastAndroid.show("Enter Amount", ToastAndroid.SHORT);
            return false;
        }

        switch (stext) {
            case 'BARRELCASHDEPOSIT':
                if (!RadientAccountnumber || !currentPreviewImageRef.current || !currentPreviewImageRef.current.startsWith('data:image/')) {
                    ToastAndroid.show("Fill all Barrel Deposit fields", ToastAndroid.SHORT);
                    return false;
                }
                break;

            case 'CLIENTCASHDEPOSIT':
                if (!clientAccountnumber || !clientname || !currentPreviewImageRef.current || !currentPreviewImageRef.current.startsWith('data:image/')) {
                    ToastAndroid.show("Fill all Client Deposit fields", ToastAndroid.SHORT);
                    return false;
                }
                break;

            case 'ONLINETRANSFER':
                if (!onlineRadientAccountnumber || !utrnumber || !currentPreviewImageRef.current || !currentPreviewImageRef.current.startsWith('data:image/')) {
                    ToastAndroid.show("Fill all Online Transfer fields", ToastAndroid.SHORT);
                    return false;
                }
                break;

            case 'WalletTransfer':
                return true;

            default:
                ToastAndroid.show("Invalid transaction type", ToastAndroid.SHORT);
                return false;
        }

        return true;
    };

    const validateAndSubmit = () => {
        console.log(currentPreviewImageRef.current, 'img');

        if (!validateForm()) return;

        setIsDetail(true)
    };

    const Radientcashsubmit = async () => {

        setLoading(true)
        const detailObj = {};
        selectedAccountDetails.forEach((entry) => {
            const [key, value] = entry.split(" : ");
            detailObj[key.trim()] = value.trim();
        });
        try {
            console.log(selectedAccountDetails)
            const newID = generateRequestID();
            setRequestID(newID);
            console.log("%%%%%", RequestID)
            console.log("jfdhfjhj", requestid)
            console.log("jfdhfjhj", requestid)

            const jdata = {
                Radiantid: (requestid ? requestid : Individualrequestid)
                    .toString()
                    .split(",")
                    .map(id => ({ Radiantid: id.trim() })),
                RequestID: newID,
                paymentmode: PaymentMode,
                Type: stext,
                TotalAmount: selectedAmount,
                Amount: updateamount,
                ClientName: clientname,
                Accountnumber: detailObj["Account Number"],
                Bankname: detailObj["Bank Name"],
                Ifsccode: detailObj["Bank Ifsc Code"],
                FromAccountnumber: bankaccount,
                FromBankname: Bankname,
                UTRNumber: utrnumber,
                uploadfile: currentPreviewImageRef.current,
                CEID: ceId,
            };


            const data = JSON.stringify(jdata);
            console.log("************************************************", data)

            await appendLog(data, `totalreport----${newID}`)

            const res = await post({
                url: `${APP_URLS.Radientcashsubmit}`,
                data: jdata,
            });

            console.log("++++++++++++++++++++++++++++++++", res, data, '=Res');
            const parsedData = JSON.parse(res.data);
            const status = res.status// string to object
            //setclientresponse(parsedData.Content);
            if (status === "OK") {
                setLoading(false)
                Alert.alert(
                    "Success",
                    JSON.stringify(parsedData.Content, null, 2),
                    [{
                        text: "OK",
                        onPress: () => {
                            navigation.goBack();
                        },
                    }]
                );
                setLoading(false)
            } else {
                setLoading(false)
                Alert.alert(
                    "Error",
                    parsedData?.Message || "Something went wrong!",
                    [{
                        text: "OK",
                        onPress: () => {
                            navigation.goBack();
                        },
                    }]
                );
                setLoading(false)
            }


        } catch (error) {
            console.error('API Error:', error);
            setLoading(false)
        } finally {
            setLoading(false);
        }
    }
    const ClientBankaccount = async () => {
        // setLoading(true)
        try {
            const res = await post({
                url: `${APP_URLS.ClientBankAccount}`,
            });

            console.log("++++++++++++++++++++++++++++++++", res);
            const parsedData = JSON.parse(res.data); // string to object
            setclientresponse(parsedData.Content);

        } catch (error) {
            console.error('API Error:', error);
        } finally {
            setLoading(false);
        }
    }

    const showDepositeList = () => {
        return (
            <FlashList
                data={depositelist}
                renderItem={({ item }) => {
                    return (
                        <View
                        >
                            <TouchableOpacity
                                style={[styles.operatorview1]}

                                onPress={async () => {
                                    setshowStateList(false);
                                    setstext(item.name);
                                    setsLabel(item.label);
                                    setImageName('')
                                    setRadientAccountnumber('')
                                    setonlineRadientAccountnumber("");
                                    setclientAccountnumber('')
                                    setclientname('');
                                    setonlinetransfer(false);
                                    setclienttransfer(false);
                                    setutrnumber('');
                                    setbankaccount('')
                                    setBankname('')
                                    setimagePath('')
                                    // setdisablebuton(item.name !== 'WalletTransfer');

                                }}>
                                <Text style={[styles.operatornametext1]}>

                                    {item.label}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    );
                }}
                estimatedItemSize={30}
            />
        );
    }


    const showRadientaccount = () => {
        return (
            <FlashList
                data={(stext === 'BARRELCASHDEPOSIT' || stext === 'ONLINETRANSFER') ? response : clientresponse}
                renderItem={({ item }) => {
                    console.log("************", item)
                    return (
                        <View
                        >
                            <TouchableOpacity
                                style={[styles.operatorview]}
                                onPress={async () => {
                                    setshowRadientList(false);
                                    setBankNo(item.AccountNumber),
                                        console.log(item.AccountNumber);
                                    setBName(item.BankName)

                                    const detailsArray = [
                                        `Client Name : ${item.ClientName}`,
                                        `Bank Name : ${item.BankName}`,
                                        `Account Number : ${item.AccountNumber}`,
                                        `Bank Ifsc Code : ${item.IfscCode}`
                                    ];

                                    setSelectedAccountDetails(detailsArray);
                                    if (stext === 'ONLINETRANSFER') {
                                        setonlineRadientAccountnumber(item.AccountNumber);
                                        //setBankname(item.BankName.toUpperCase());
                                        setonlinetransfer(true);
                                        setImageName('')
                                        //setbankaccount(item.IfscCode);
                                    }
                                    else if (stext === 'BARRELCASHDEPOSIT') {
                                        setRadientAccountnumber(item.AccountNumber);
                                        // setBankname(item.BankName.toUpperCase());
                                        setImageName('')
                                    }
                                    else {
                                        setclientname(item.ClientName.toUpperCase());
                                        setclientAccountnumber(item.AccountNumber);
                                        setclienttransfer(true);
                                        setImageName('')
                                    }

                                    console.log(item.AccountNumber);
                                    console.log(detailsArray);
                                }}
                            >

                                <View style={{ width: wScale(70), height: 60 }}>
                                    <SvgUri width={'100%'} height={'100%'} uri={item.logoimg}
                                    />

                                </View>
                                <Text style={[styles.operatornametext, {}]}>
                                    {item.AccountNumber}
                                </Text>

                            </TouchableOpacity>

                        </View>
                    );
                }}
                estimatedItemSize={30}
            />
        );
    }


    return (

        <View style={styles.main}>

            <AppBarSecond title={paymentType || PaymentMode === 'GroupPay' ? 'Group Payments' : 'Individual Payment'} />

            <WalletCard payIsShow={false} />
            {/* <View style={[styles.topview, { backgroundColor: '#b4e7a5', }]}>
                <FlotingInput label={'Total Amount'}
                    value={selectedAmount?.toString() || ''}
                    labelinputstyle={{ backgroundColor: '#b4e7a5' }}
                    editable={false}
                />
            </View> */}

            <ScrollView>

                <View style={styles.container} >
                    {/* <ConfirmBox
                        visible={isDialogVisible}
                        title="Confirm Swap"
                        message={<Text>Are you sure to swap <Text style={{ fontWeight: 'bold', fontSize: wScale(17) }}>{`₹${updateamount}?`}</Text></Text>}
                        onCancel={() => setDialogVisible(false)}
                        onConfirm={handleDelete}
                    /> */}
                    <View>
                        <FlotingInput
                            value={updateamount}
                            label={"Enter Amount"}
                            keyboardType="number-pad"
                            onChangeTextCallback={(text) => {
                                const numericValue = parseFloat(text);
                                const maxAllowed = parseFloat(selectedAmount);

                                if (!isNaN(numericValue) && numericValue <= maxAllowed) {
                                    setupdateamount(text);
                                } else if (text === '') {
                                    setupdateamount('');

                                } else {
                                    Alert.alert("Warning", `Amount cannot be more than ${selectedAmount}`);
                                }
                            }}
                        />
                        {stext === 'WalletTransfer' && (walletData.remainbal + walletData.posremain < updateamount) && (
                            <View style={styles.righticon2}>
                                <Text style={styles.errorText}>{translate("Your_Balance_is_low")}</Text>
                            </View>
                        )} 

                    </View>

                    <TouchableOpacity onPress={() => { setshowStateList(true) }}>
                        <FlotingInput label={'Choose Payment Method'}
                            value={sLabel}
                            editable={false}
                        />
                        <View style={[styles.righticon2]}>
                            <OnelineDropdownSvg />
                        </View>
                    </TouchableOpacity>

                    {stext === 'BARRELCASHDEPOSIT' &&
                        <TouchableOpacity onPress={() => { setshowRadientList(true) }} >

                            <FlotingInput label={"Account Number"}
                                value={RadientAccountnumber}
                                editable={false}
                            />
                            <View style={[styles.righticon2,]}>
                                <OnelineDropdownSvg />
                            </View>
                        </TouchableOpacity>}
                    {stext === 'CLIENTCASHDEPOSIT' &&

                        <View>

                            <TouchableOpacity onPress={() => { setshowRadientList(true) }} >
                                <FlotingInput label={"Account Number"}
                                    value={clientAccountnumber}
                                    editable={false}

                                />
                                <View style={[styles.righticon2,]}>
                                    <OnelineDropdownSvg />
                                </View>
                            </TouchableOpacity>



                            {clienttransfer &&
                                <FlotingInput
                                    value={clientname}
                                    label={"Name"}
                                    editable={false}
                                    onChangeTextCallback={(t) => setclientname(t)}
                                />
                            }
                        </View>
                    }

                    {stext === 'ONLINETRANSFER' &&

                        <View>
                            <TouchableOpacity onPress={() => { setshowRadientList(true) }} >


                                <FlotingInput label={"Account Number"}
                                    value={onlineRadientAccountnumber}
                                    editable={false}
                                />
                                <View style={[styles.righticon2,]}>
                                    <OnelineDropdownSvg />
                                </View>
                            </TouchableOpacity>

                            {onlinetransfer &&
                                <View>

                                    {/* <FlotingInput
                                        value={Bankname}
                                        label="Enter Bank Name"
                                        onChangeTextCallback={(t) => { setBankname(t) }}
                                    />
                                    <FlotingInput
                                        value={bankaccount}
                                        label='Enter Account Number'
                                        keyboardType="number-pad"
                                        onChangeTextCallback={(t) => setbankaccount(t)}
                                    /> */}
                                    <FlotingInput
                                        value={utrnumber}
                                        label="Enter Utr Number"
                                        onChangeTextCallback={(t) => setutrnumber(t)}
                                    />

                                </View>
                            }

                        </View>
                    }



                    {stext !== 'WalletTransfer' && <TouchableOpacity
                        onPress={() => {
                            if (imagePath) {
                                setCurrentPreviewImage(imagePath);
                                setPreviewVisible(true);
                            } else {
                                handleUpload();
                            }
                        }}
                    >
                        <FlotingInput
                            label={currentPreviewImage ? 'Yes, Slip Uploaded'
                                : "UPLOAD SLIP"}
                            editable={false}
                        />
                        <View style={styles.righticon2}>
                            <LottieView
                                autoPlay
                                loop
                                style={styles.lotiimg}
                                source={
                                    currentPreviewImage
                                        ? require('../../../utils/lottieIcons/View-Docs.json')
                                        : require('../../../utils/lottieIcons/upload-file.json')
                                }
                            />
                        </View>
                    </TouchableOpacity>}



                    <DynamicButton
                        title={
                            Loading ? (
                                <ActivityIndicator size={'large'} color={colorConfig.labelColor} />
                            ) : (
                                "Submit"
                            )
                        }
                        onPress={validateAndSubmit}

                    />


                    <ImagePreviewModal
                        visible={previewVisible}
                        imageUri={currentPreviewImageRef.current}
                        onClose={() => setPreviewVisible(false)}
                        reUpload={handleReUpload}
                        saveClose={() => {
                            setCurrentPreviewImage('');
                            setPreviewVisible(false)
                        }}
                    />

                </View>
                <Rechargeconfirm
                    isModalVisible={isDetail}
                    onBackdropPress={() => setIsDetail(false)}
                    details={[
                        { label: "Payment Mode", value2: sLabel },
                        ...(stext !== 'WalletTransfer' ? [{ label: "Account No.", value: bankNo }] : []),
                        ...(stext !== 'WalletTransfer' ? [{ label: "Bank Name", value2: bName }] : []),
                    ]}
                    lastlabel="Paid Amount"
                    lastvalue={updateamount}
                    onRechargedetails={handlesubmit}
                    isLoading2={Loading}
                />

            </ScrollView >
            <BottomSheet animationType="none"  
                isVisible={showStateList} >
                <View style={styles.bottomsheetview}>
                    <View style={[styles.StateTitle, { backgroundColor: color1 }]}>
                        <View style={styles.titleview}>
                            <View>
                                <Text
                                    style={styles.stateTitletext}>{translate("Choose_Payment_Method")}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => setshowStateList(false)}
                            activeOpacity={0.7}
                        >
                            <ClosseModalSvg2 />
                        </TouchableOpacity>
                    </View>
                    {showDepositeList()}

                </View>
            </BottomSheet>
            <BottomSheet animationType="none"  
                isVisible={showRadientList} >
                <View style={styles.bottomsheetview}>
                    <View style={[styles.StateTitle, { backgroundColor: color1 }]}>
                        <View style={styles.titleview}>
                            <View>
                                <Text
                                    style={styles.stateTitletext}>{translate("Select_Account_Number")}</Text>
                            </View>
                        </View>
                        <TouchableOpacity
                            onPress={() => setshowRadientList(false)}
                            activeOpacity={0.7}
                        >
                            <ClosseModalSvg2 />
                        </TouchableOpacity>
                    </View>
                    {showRadientaccount()}

                </View>
            </BottomSheet>

        </View >

    );
}
export default Totalpayreport;

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: '#fff'
    },
    container: {
        paddingHorizontal: wScale(15),
        flex: 1,
        paddingTop: hScale(10)
    },
    bottomsheetview: {
        backgroundColor: "#fff",
        height: SCREEN_HEIGHT / 1.3,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },

    StateTitle: {
        paddingVertical: hScale(10),
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: wScale(10),
        marginBottom: hScale(10),
    },
    stateTitletext: {
        fontSize: wScale(22),
        color: "#000",
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    lotiimg: {
        height: hScale(40),
        width: wScale(40),
    },
    titleview: {
        flex: 1,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },

    operatorview: {
        paddingHorizontal: wScale(20),
        borderBottomColor: "#000",
        borderBottomWidth: wScale(0.5),
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    operatorview1: {
        flexDirection: "row-reverse",
        alignItems: "center",
        paddingHorizontal: wScale(10),
    },

    operatornametext1: {
        textTransform: "capitalize",
        fontSize: wScale(20),
        color: "#000",
        flex: 1,
        borderBottomColor: "#000",
        borderBottomWidth: wScale(0.5),
        alignSelf: "center",
        paddingVertical: hScale(30),
    },
    righticon2: {
        position: 'absolute',
        left: 'auto',
        right: wScale(0),
        top: hScale(0),
        height: '80%',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: wScale(4),
    },
    errorText: {
        fontSize: wScale(12),
        color: 'red'
    },
    operatornametext: {
        textTransform: "capitalize",
        fontSize: wScale(22),
        color: "#000",
        paddingLeft: wScale(20),
        paddingVertical: hScale(3),
        flex: 1
    },
    topview: {
        paddingTop: hScale(10),
        paddingHorizontal: hScale(10),
    },

})
