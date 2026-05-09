import { translate } from "../../../utils/languageUtils/I18n";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Platform, StyleSheet, Text, TextInput, ToastAndroid, TouchableOpacity, View } from "react-native";
import { commonStyles } from "../../../utils/styles/commonStyles";
import AppBarSecond from "../../drawer/headerAppbar/AppBarSecond";
import FlotingInput from "../../drawer/securityPages/FlotingInput";
import ImagePreviewModal from "../Radiantregister/ImagePreviewModal";
import { useDocumentUpload } from "../../../hooks/useDocumentUpload";
import { APP_URLS } from "../../../utils/network/urls";
import useAxiosHook from "../../../utils/network/AxiosClient";
import BankBottomSite from "../../../components/BankBottomSite";
import BankListModal from "../../../components/BankListModal";
import OnelineDropdownSvg from "../../drawer/svgimgcomponents/simpledropdown";
import LottieView from "lottie-react-native";
import DynamicButton from "../../drawer/button/DynamicButton";
import { RootState } from "../../../reduxUtils/store";
import { useSelector } from "react-redux";
import DropdownInput from "../../../components/Dropdown/DropdownInput";
import { useNavigation } from "../../../utils/navigation/NavigationService";
import TransactionResultSheet from "../../../components/ReusableComponents/TransactionResultSheet";
import { setCmsAddMFrom } from "../../../reduxUtils/store/userInfoSlice";
import { useDispatch } from "react-redux";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import ShowLoaderBtn from "../../../components/ShowLoaderBtn";

const OtherPayMent = ({ route }) => {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);
    const { paymentType, addAmount } = route.params
    console.log(paymentType, 'ppppay');
    const [rePtype, setRePtype] = useState(paymentType)
    const [amount, setAmount] = useState(addAmount)
    const [imagePath, setimagePath] = useState('')
    const { post } = useAxiosHook()
    const [isBankOpen, setIsBankOpen] = useState(false);
    const [bankList, setBankList] = useState([]);
    const [selectedBank, setSelectedBank] = useState<any>(null);
    const [slipNumber, setSlipNumber] = useState('')
    const navigation = useNavigation();
    const dispatch = useDispatch();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchBank();
    }, [])
    const fetchBank = async () => {

        try {
            const response = await post({ url: `${APP_URLS.Bankinfo}` })
            console.log('Bank Info:', response);
            const banks = response?.Content?.ADDINFO?.data || [];
            setBankList(banks);
        }
        catch {
            console.error();
        }
    }
    const showToast = (message: string) => {
        if (Platform.OS === "android") {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
            Alert.alert(message);
        }
    };
    const validateForm = () => {
        if (!paymentType) return "Payment mode is missing";

        if (!selectedBank) return "Please select a bank";
        if (!selectedBank.bankName) return "Bank name is required";
        if (!selectedBank.ifsccode) return "IFSC code is required";
        if (!selectedBank.accountnumber) return "Account number is required";

        if (!amount) return "Please enter amount";
        if (isNaN(Number(amount))) return "Amount must be numeric";
        if (Number(amount) <= 0) return "Amount must be greater than zero";

        if (!slipNumber) return "Please enter slip number";
        if (!currentPreviewImage) return "Please upload deposit slip";

        return null;
    };
    const fetchSubmit = async () => {
        if (submitting) return; // 🔒 double click protection

        const errorMessage = validateForm();
        if (errorMessage) {
            showToast(errorMessage);
            return;
        }
        setSubmitting(true); // ⏳ START loading

        try {
            const payload = {
                Amount: amount,
                BankName: selectedBank.bankName,
                Ifsccode: selectedBank.ifsccode,
                AccountNo: selectedBank.accountnumber,
                SlipID: slipNumber,
                SlipName: currentPreviewImageRef.current,
                Mode: rePtype,
            };

            console.log("📦 Request Body Payload:", payload);

            const response = await post({
                url: APP_URLS.CashDepositRequest,
                data: payload,
            });

            console.log("Submit Response:", response);

            if (response?.stsinfo === true) {
                // Success message from API
                showToast(response.message || "Deposit submitted successfully");

                // 🔹 Clear inputs
                setAmount("");
                setSelectedBank(null);
                setSlipNumber("");
                setRePtype("");
                // currentPreviewImageRef.current = null;
                setCurrentPreviewImage('')
                dispatch(setCmsAddMFrom("otherPayment"));
                navigation.navigate('NewCashDepositReport');
            } else {
                // ❌ Failure message
                showToast(response?.message || "Something went wrong, please try again");
            }

        } catch (error) {
            console.error("Submit Error:", error);
            showToast("Submission failed");
        } finally {
            setSubmitting(false); // ✅ STOP loading (success / fail dono me)
        }
    };


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

    const paymentModes = [
        "IMPS",
        "NEFT",
        "RTGS",
        "Branch Cash Deposit",
        "ATM Cash Deposit",
    ];
    return (
        <View style={[commonStyles.screenContainer, styles.main]}>
            <AppBarSecond title={'CMS Manual Deposit'} />
            <View style={[styles.amoutView, { backgroundColor: colorConfig.secondaryColor + 20 }]}>
                <Text style={styles.amoutText}>
                    ₹ {amount}
                </Text>
                <Text style={styles.amoutshortText}>{translate("Added_Amount")}</Text>
            </View>
            <View style={commonStyles.contentContainer}>

                <DropdownInput
                    label="Payment Mode"
                    value={rePtype}
                    data={paymentModes}
                    onSelect={setRePtype}
                />

                <TouchableOpacity onPress={() => setIsBankOpen(true)}>
                    <FlotingInput
                        label="Select Bank"
                        value={selectedBank?.bankName || ''}
                        editable={false}
                    />
                    <View style={commonStyles.righticon2}>
                        <OnelineDropdownSvg />
                    </View>
                </TouchableOpacity>


                <FlotingInput
                    label={rePtype === 'IMPS' ? 'Enter Bank RRN Number' : 'Enter Slip Number'}
                    value={slipNumber}
                    onChangeTextCallback={(text) => { setSlipNumber(text) }}
                    inputstyle={{
                        textTransform: 'uppercase'
                    }}
                />
                <TouchableOpacity
                    onPress={() => {
                        if (imagePath) {
                            setCurrentPreviewImage(imagePath);
                            setPreviewVisible(true);
                        } else {
                            handleUpload();
                        }
                    }}>
                    <View>

                        <FlotingInput label={'Upload Slip'} editable={false} />
                        <View style={commonStyles.righticon2}>

                            <LottieView
                                autoPlay
                                loop
                                style={commonStyles.lotiimg}
                                source={
                                    currentPreviewImage
                                        ? require('../../../utils/lottieIcons/View-Docs.json')
                                        : require('../../../utils/lottieIcons/upload-file.json')
                                }
                            />
                        </View>
                    </View>
                                    </TouchableOpacity>

                    <DynamicButton title={submitting ? <ShowLoaderBtn size={'large'}/> : 'Submit'}
                        onPress={fetchSubmit}
                         disabled={submitting}
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

                <BankListModal
                    visible={isBankOpen}
                    onClose={() => setIsBankOpen(false)}
                    data={bankList}
                    onSelect={(bank) => {
                        setSelectedBank(bank);
                        setIsBankOpen(false);
                    }}
                />

            </View>


        </View>
    )
}
export default OtherPayMent;
const styles = StyleSheet.create({
    main: {
        backgroundColor: '#fff'
    },
    bankCard: {
        backgroundColor: '#f5f5f5',
        padding: 12,
        marginVertical: 6,
        borderRadius: 8,
    },
    InputStyle: {
        backgroundColor: "#CFF4E0"
    },
    amoutView: {
        paddingVertical: hScale(5),
        alignItems: 'center',
        borderBottomRightRadius: 10,
        borderBottomLeftRadius: 10
    },
    amoutText: {
        fontSize: wScale(30),
        fontWeight: 'bold',
        color: '#000',
        marginTop: hScale(-5)
    },
    amoutshortText: {
        fontSize: wScale(16),
        fontWeight: '',
        alignSelf: 'center',
        color: '#000',
        marginTop: hScale(-6)
    }
})
