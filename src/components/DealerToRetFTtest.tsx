import React, { useCallback, useEffect, useState } from 'react';
import {
    View, StyleSheet, ScrollView,
    TouchableOpacity,
    Text,
    TextInput,
    ToastAndroid,
} from 'react-native';
import { BottomSheet, Button } from '@rneui/themed';
import { FlashList } from '@shopify/flash-list';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { RootState } from '../reduxUtils/store';
import useAxiosHook from '../utils/network/AxiosClient';
import { APP_URLS } from '../utils/network/urls';
import { decryptData, encrypt } from '../utils/encryptionUtils';
import { useNavigation } from '../utils/navigation/NavigationService';
import FlotingInput from '../features/drawer/securityPages/FlotingInput';
import OnelineDropdownSvg from '../features/drawer/svgimgcomponents/simpledropdown';
import ClosseModalSvg2 from '../features/drawer/svgimgcomponents/ClosseModal2';
import { colors } from '../utils/styles/theme';
import { hScale, SCREEN_HEIGHT, wScale } from '../utils/styles/dimensions';
import OTPModal from './OTPModal';
import AppBarSecond from '../features/drawer/headerAppbar/AppBarSecond';
import NoDatafound from '../features/drawer/svgimgcomponents/Nodatafound';


const FundTransferRetailer = () => {
    const { userId } = useSelector((state: RootState) => state.userInfo);

    const paymentMode1 = [
        "Cash", "Credit", "Branch/Cms Deposit", "Online Transfer", "Wallet", "Charge Back"
    ];
    const paymenttype1 = ["NEFT", "IMPS", "RTGS", "UPI", "Same Bank"];
    const [retailerName, setRetailerName] = useState('');
    const [paymentMode, setPaymentMode] = useState('');
    const [paymenttype, setPaymentType] = useState('');
    const [amount, setAmount] = useState('');
    const [collectionBy, setCollectionBy] = useState('');
    const [comment, setComment] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [retailerList, setRetailerList] = useState([]);
    const [selectBank, setSelectBan] = useState('');
    const [BankName, setBankName] = useState('');
    const [AccountNo, setAccountNo] = useState('');
    const [Deposit, setDeposit] = useState('');
    const [Wallet, setWallet] = useState('');
    const [Walletn, setWalletn] = useState('');
    const [WalletName, setWalletName] = useState('');
    const [transaction, setTransaction] = useState('');
    const [transactionn, setTransactionn] = useState('');
    const [utrNo, setUtrNo] = useState('');
    const [Subject, setSubject] = useState('');
    const [Pin, setPin] = useState('');
    const [retailerMode, setRetailerMode] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [admin, setAdmin] = useState(false);
    const [Type, setType] = useState(false);
    const [txnId, setTxnId] = useState('');
    const [isSubmit, setIsSubmit] = useState(false)
    const [selectWallet, setSelectWallet] = useState(false)
    const { post, get } = useAxiosHook();
    const [retailerdata, setRetailerData] = useState({});
    const [cbStatus, setCBstatus] = useState(false);
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [mobileOtp, setMobileOtp] = useState('');

    const [dealerWALLlist, setDealerWALLlist] = useState([]);
    const [dealerbanklist, setDealerBanklist] = useState([])
    useEffect(() => {
        console.log(userId)
        const retailerList = async () => {
            try {
                const retailerFundRequest = await get({ url: `${APP_URLS.retailerFundRequest}txt_frm_date=01/18/2025&txt_to_date=01/19/2025` });
                const response = await post({ url: APP_URLS.retailerlist });
                const D_CB_status = await post({ url: APP_URLS.D_CB_status });
        
                console.log(retailerFundRequest ,'*************************');  
        
                setCBstatus(D_CB_status.status === "Y");
                setRetailerList(response);
            } catch (error) {
                console.error('Error fetching retailer list:', error);
            }
        };
        
        retailerList();
        DealerBankList()
    }, []);

    const UniqueId = async () => {

        console.log([amount, retailerdata?.UserID, paymentMode, Pin, txnId, collectionBy, comment]);

        if (!amount || !retailerdata?.UserID || !paymentMode || !comment) {
            return ToastAndroid.show('Complate all fields', ToastAndroid.BOTTOM);

        }
        try {
            const response = await get({ url: `api/data/dlm_to_Rem_Generate_Unique_ID` });
            console.log(response, 'Retailer List Response');

            if (response) {
                setIsSubmit(true)


                if(paymentMode ==='Charge Back'){
                    CBsubmittxn(response.Mecssage)
                }
                // setIsSubmit(false)
                setTxnId(response.Message);
            }
        } catch (error) {
            console.error('Error fetching retailer list:', error);
        }
    };
    const clearAll = () => {
        setAccountNo('');
        setDeposit('');
        setWallet('');
        setWalletName('');
        setTransaction('');
        setUtrNo('');
        setSubject('');
        setPin('');
        setRetailerName('');
        setPaymentMode('');
        setPaymentType('');
        setAmount('');
        setCollectionBy('');
        setComment('');
    };
    const submittxn = async () => {
        console.log(amount, retailerdata?.UserID, paymentMode, Pin, txnId, collectionBy)
        console.log(!amount || !retailerdata?.UserID || !paymentMode || !Pin || !txnId || !collectionBy)
        if (!amount || !retailerdata?.UserID || !paymentMode || !Pin || !txnId) {
            alert('Please fill in all required fields.');
            return;
        }

        const encryption = await encrypt([retailerdata?.UserID, paymentMode, Pin, txnId, collectionBy, comment]);

        console.log([amount, retailerdata?.UserID, paymentMode, Pin, txnId, collectionBy, comment]);
        console.log('********* **************', paymentMode);

        const data = {
            "hdMDDLM": encryption.encryptedData[0] || '', 
            "hdPaymentMode": encryption.encryptedData[1] || '',
            "hdPaymentAmount": amount || '',
            "hdMDDepositeSlipNo": "", // Assuming these are optional, set empty or null as needed
            "hdMDTransferType": "",
            "hdMDcollection": encryption.encryptedData[4] || '',
            "hdMDComments": encryption.encryptedData[5] || '',
            "hdMDaccountno": "",
            "hdMDutrno": "",
            "hdMDwallet": "",
            "hdMDwalletno": "",
            "hdMDtransationno": "",
            "hdMDsettelment": "",
            "hdMDCreditDetail": "",
            "hdMDsubject": "",
            "hdMDBank": "",
            "txtcode": encryption.encryptedData[2] || '',
            "transferid": encryption.encryptedData[3] || '',
            "value1": encryption.keyEncode || '',
            "value2": encryption.ivEncode || '',
        };

        try {
            const response = await post({
                url: `api/data/jlklkj`,
                data: data,
            });

            console.log(`api/data/jlklkj`, 'Response received');
            console.log(response, 'Response from server');

            if (response.Response === 'Failed') {
                ToastAndroid.show(response.Message, ToastAndroid.BOTTOM);
                const decryptedData = {
                    hdMDDLM: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[0]),
                    hdPaymentMode: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[1]),
                    hdPaymentAmount: amount,
                    hdMDcollection: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[4]),
                    hdMDComments: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[5]),
                    txtcode: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[2]),
                    transferid: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[3]),
                };

                console.log('Decrypted Data:', decryptedData);
                Object.keys(decryptedData).forEach(key => {
                    console.log(`${key}: ${decryptedData[key]}`);
                });
            } else {
                alert(response.Message);
            }
            clearAll();
            setIsSubmit(false);
        } catch (error) {
            console.error('Error fetching retailer list:', error);
        }

        console.log(JSON.stringify(data));
    };
    const submittxnBRANCH = async () => {
        console.log(amount, retailerdata?.UserID, paymentMode, Pin, txnId, collectionBy)
        console.log(!amount || !retailerdata?.UserID || !paymentMode || !Pin || !txnId || !collectionBy)


        if (!amount || !retailerdata?.UserID || !paymentMode || !Pin || !txnId || !AccountNo|| !comment|| !BankName|| !Deposit) {
            alert('Please fill in all required fields.');
            return;
        }

        const encryption = await encrypt([retailerdata?.UserID, paymentMode, Pin, txnId, AccountNo, comment, BankName, Deposit]);

        // Logging encrypted values for debugging
        console.log([amount, retailerdata?.UserID, paymentMode, Pin, txnId, collectionBy, comment]);
        console.log('********* **************', paymentMode);

        const data = {
            "hdMDDLM": encryption.encryptedData[0] || '',
            "hdPaymentMode": encryption.encryptedData[1] || '',
            "hdPaymentAmount": amount || '',
            "hdMDDepositeSlipNo": encryption.encryptedData[7],
            "hdMDTransferType": "",
            "hdMDcollection": '',
            "hdMDComments": encryption.encryptedData[5] || '',
            "hdMDaccountno": encryption.encryptedData[4] || '',
            "hdMDutrno": "",
            "hdMDwallet": "",
            "hdMDwalletno": "",
            "hdMDtransationno": "",
            "hdMDsettelment": "",
            "hdMDCreditDetail": "",
            "hdMDsubject": "",
            "hdMDBank": encryption.encryptedData[6],
            "txtcode": encryption.encryptedData[2] || '',
            "transferid": encryption.encryptedData[3] || '',
            "value1": encryption.keyEncode || '',
            "value2": encryption.ivEncode || '',
        };

        try {
            const response = await post({
                url: `api/data/jlklkj`,
                data: data,
            });

            console.log(`api/data/jlklkj`, 'Response received');
            console.log(response, 'Response from server');

            if (response.Response === 'Failed') {
                ToastAndroid.show(response.Message, ToastAndroid.BOTTOM);
                const decryptedData = {
                    hdMDDLM: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[0]),
                    hdPaymentMode: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[1]),
                    hdPaymentAmount: amount,
                    hdMDcollection: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[4]),
                    hdMDComments: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[5]),
                    txtcode: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[2]),
                    transferid: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[3]),
                    bank: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[6]),
                };

                console.log('Decrypted Data:', decryptedData);
                Object.keys(decryptedData).forEach(key => {
                    console.log(`${key}: ${decryptedData[key]}`);
                });
            } else {
                alert(response.Message);
            }
            clearAll();
            setIsSubmit(false);
        } catch (error) {
            console.error('Error fetching retailer list:', error);
        }

        console.log(JSON.stringify(data));
    };

    const submittxnONLINE = async () => {
        console.log(amount, retailerdata?.UserID, paymentMode, Pin, txnId, collectionBy)
        console.log(!amount || !retailerdata?.UserID || !paymentMode || !Pin || !txnId || !collectionBy)


        if (!amount || !retailerdata?.UserID || !paymentMode || !Pin || !txnId ||!AccountNo||!utrNo||!BankName||!paymenttype) {
            alert('Please fill in all required fields.');
            return;
        }

        const encryption = await encrypt([retailerdata?.UserID, paymentMode, Pin, txnId, AccountNo, utrNo, BankName, paymenttype]);

        // Logging encrypted values for debugging
        console.log([amount, retailerdata?.UserID, paymentMode, Pin, txnId, collectionBy, comment]);
        console.log('********* **************', paymentMode);

        const data = {
            "hdMDDLM": encryption.encryptedData[0] || 'userid',
            "hdPaymentMode": encryption.encryptedData[1] || 'paym',
            "hdPaymentAmount": amount || '',
            "hdMDDepositeSlipNo": '',
            "hdMDTransferType": encryption.encryptedData[7],
            "hdMDcollection": '',
            "hdMDComments": '',
            "hdMDaccountno": encryption.encryptedData[4] || '',
            "hdMDutrno": encryption.encryptedData[5] || '',
            "hdMDwallet": "",
            "hdMDwalletno": "",
            "hdMDtransationno": "",
            "hdMDsettelment": "",
            "hdMDCreditDetail": "",
            "hdMDsubject": "",
            "hdMDBank": encryption.encryptedData[6],
            "txtcode": encryption.encryptedData[2] || '',
            "transferid": encryption.encryptedData[3] || '',
            "value1": encryption.keyEncode || '',
            "value2": encryption.ivEncode || '',
        };

        try {
            const response = await post({
                url: `api/data/jlklkj`,
                data: data,
            });

            console.log(`api/data/jlklkj`, 'Response received');
            console.log(response, 'Response from server');

            if (response.Response === 'Failed') {
                ToastAndroid.show(response.Message, ToastAndroid.BOTTOM);
                const decryptedData = {
                    hdMDDLM: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[0]),
                    hdPaymentMode: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[1]),
                    hdPaymentAmount: amount,
                    hdMDcollection: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[4]),
                    hdMDComments: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[5]),
                    txtcode: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[2]),
                    transferid: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[3]),
                    bank: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[6]),
                };

                console.log('Decrypted Data:', decryptedData);
                Object.keys(decryptedData).forEach(key => {
                    console.log(`${key}: ${decryptedData[key]}`);
                });
            } else {
                alert(response.Message);
            }
            clearAll();
            setIsSubmit(false);
        } catch (error) {
            console.error('Error fetching retailer list:', error);
        }

        console.log(JSON.stringify(data));
    };
    const submittxnWALLET = async () => {


        if (!amount || !retailerdata?.UserID || !paymentMode || !Pin || !txnId ||!Wallet||!Walletn||!paymenttype) {
            alert('Please fill in all required fields.');
            return;
        }

        const encryption = await encrypt([retailerdata?.UserID, paymentMode, Pin, txnId, Wallet, Walletn, paymenttype, transaction]);

        console.log('********* **************', paymentMode);

        const data = {
            "hdMDDLM": encryption.encryptedData[0] || 'userid',
            "hdPaymentMode": encryption.encryptedData[1] || 'paym',
            "hdPaymentAmount": amount || '',
            "hdMDDepositeSlipNo": '',
            "hdMDTransferType": '',
            "hdMDcollection": '',
            "hdMDComments": '',
            "hdMDaccountno": '',
            "hdMDutrno": '',
            "hdMDwallet": encryption.encryptedData[4] || '',
            "hdMDwalletno": encryption.encryptedData[5] || '',
            "hdMDtransationno": encryption.encryptedData[7],
            "hdMDsettelment": "",
            "hdMDCreditDetail": "",
            "hdMDsubject": "",
            "hdMDBank": encryption.encryptedData[6],
            "txtcode": encryption.encryptedData[2] || '',
            "transferid": encryption.encryptedData[3] || '',
            "value1": encryption.keyEncode || '',
            "value2": encryption.ivEncode || '',
        };

        try {
            const response = await post({
                url: `api/data/jlklkj`,
                data: data,
            });

            console.log(`api/data/jlklkj`, 'Response received');
            console.log(response, 'Response from server');

            if (response.Response === 'Failed') {
                ToastAndroid.show(response.Message, ToastAndroid.BOTTOM);
                const decryptedData = {
                    hdMDDLM: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[0]),
                    hdPaymentMode: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[1]),
                    hdPaymentAmount: amount,
                    hdMDcollection: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[4]),
                    hdMDComments: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[5]),
                    txtcode: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[2]),
                    transferid: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[3]),
                    bank: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[6]),
                };

                console.log('Decrypted Data:', decryptedData);
                Object.keys(decryptedData).forEach(key => {
                    console.log(`${key}: ${decryptedData[key]}`);
                });
            } else {
                alert(response.Message);
            }
            clearAll();
            setIsSubmit(false);
        } catch (error) {
            console.error('Error fetching retailer list:', error);
        }

        console.log(JSON.stringify(data));
    };
    const getOtp = async () => {
        try {
            console.log(mobileOtp ? 'true' : 'false')
            const url2 = APP_URLS.verify_D_CB_otp + mobileOtp
            const res = mobileOtp ? await post({ url: url2 }) : await post({ url: APP_URLS.send_y_D_CB_otp + retailerdata?.UserID });


            console.log(url2, '^^', mobileOtp, res)

            if (mobileOtp) {
                if (res == 'Wrong OTP') {
                    ToastAndroid.show(res, ToastAndroid.BOTTOM);

                } else {
                    UniqueId()
                    setOtpModalVisible(false);

                }
                setMobileOtp('')
            } else {
                if (res) {
                    setOtpModalVisible(true);
                } else {
                    ToastAndroid.show(res, ToastAndroid.BOTTOM);

                }
            }


            console.log("getOtp***", APP_URLS.send_y_D_CB_otp + retailerdata?.UserID, res)
        } catch (error) {

        }

    }

    const CBsubmittxn = useCallback(async (transaction) => {

        const encryption = await encrypt([retailerdata?.UserID, paymentMode, Pin, txnId, Subject, comment]);
        console.log([amount, retailerdata?.UserID, paymentMode, Pin, txnId, collectionBy, comment]);
        console.log('***********************')
        const data = {
            "hdMDDLM": encryption.encryptedData[0],
            "hdPaymentMode": encryption.encryptedData[1],
            "hdPaymentAmount": amount,
            "hdMDDepositeSlipNo": "",
            "hdMDTransferType": "",
            "hdMDcollection": '',
            "hdMDComments": encryption.encryptedData[5],
            "hdMDaccountno": "",
            "hdMDutrno": "",
            "hdMDwallet": "",
            "hdMDwalletno": "",
            "hdMDtransationno": "",
            "hdMDsettelment": "",
            "hdMDCreditDetail": "",
            "hdMDsubject": encryption.encryptedData[4],
            "hdMDBank": "",
            "txtcode": encryption.encryptedData[2],
            "transferid": encryption.encryptedData[3],
            "value1": encryption.keyEncode,
            "value2": encryption.ivEncode,
        };

        try {
            const response = await post({
                url: `api/data/jlklkj`,
                data: data,
            });

            console.log(`api/data/jlklkj`, 'Response received');
            console.log(response, 'Response from server');

            if (response.Response === 'Failed') {
                ToastAndroid.show(response.Message, ToastAndroid.BOTTOM);
                const decryptedData = {
                    hdMDDLM: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[0]),
                    hdPaymentMode: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[1]),
                    hdPaymentAmount: amount,
                    hdMDcollection: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[4]),
                    hdMDComments: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[5]),
                    txtcode: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[2]),
                    transferid: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[3]),
                };

                console.log('Decrypted Data:', decryptedData);
                Object.keys(decryptedData).forEach(key => {
                    console.log(`${key}: ${decryptedData[key]}`);
                });
            } else {
                alert(response.Message);

            }
            clearAll()

            setIsSubmit(false);
        } catch (error) {
            console.error('Error fetching retailer list:', error);
        }

        console.log(JSON.stringify(data));
    }, []);


    const navigation = useNavigation<any>();

    const dipatch = useDispatch();

    const DealerBankList = async () => {
        try {
            const response = await get({ url: `api/data/DealerBankList` });

            console.log(response, 'DealerBankList**')
            if (!response || !response["DealerBankwalletlist"]) {
                throw new Error('Invalid response');

            }

            const data1 = response["DealerBankwalletlist"];
            const databind = data1["bindALLWallet"];

            if (!databind) {
                throw new Error('bindALLWallet not found in the response');
            }

            const databind1 = databind["channel"];
            console.log(databind1, 'channel**123')
            if (!databind1) {
                throw new Error('channel not found in bindALLWallet');
            }

            const distributerwallet = databind1["dealerbanklist"];
            const distributerbank = databind1["DealerWalletlist"];
            setDealerWALLlist(distributerwallet)
            setDealerBanklist(distributerbank);
            console.log('Data1:', data1);
            console.log('DataBind:', databind);
            console.log('DataBind1:', databind1);
            console.log('DistributerWallet:', distributerwallet);
            console.log('DistributerBank:', distributerbank);
        } catch (error) {
            console.error('Error fetching dealer bank list:', error.message);
        }
    };
    // const filteredList = (data) => {
    //     return data.filter(item => item['Name']?.toLowerCase().includes(searchQuery.toLowerCase()) || item.toLowerCase().includes(searchQuery.toLowerCase()));
    // };


    const filteredList = (data) => {
        return data.filter(item => { const name = item['Name']?.toLowerCase() || ''; const itemString = typeof item === 'string' ? item.toLowerCase() : ''; return name.includes(searchQuery.toLowerCase()) || itemString.includes(searchQuery.toLowerCase()); });

    };
    const adminbanks = () => {
        const data = retailerMode ? paymentMode1 : retailerList;

        return (
            <FlashList
                data={filteredList(data)}
                renderItem={({ item }) => (
                    <View>
                        <TouchableOpacity
                            style={styles.operatorview}
                            onPress={() => {
                                setIsSubmit(false)

                                if (retailerMode) {
                                    console.log(retailerMode, "MODE******")
                                    console.log(item)
                                    setPaymentMode(item);
                                    setRetailerMode(false);
                                    setIsVisible(false);
                                    setSearchQuery('');

                                } else {
                                    console.log(item, 'RET************')
                                    setRetailerData(item);
                                    setRetailerName(item['Name']);
                                    setRetailerMode(true);
                                    setSearchQuery('');

                                }
                            }}
                        >
                            <Text ellipsizeMode="tail" numberOfLines={1} style={styles.operatornametext}>
                                {retailerMode ? item : item['Name']}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
                estimatedItemSize={30}
            />
        );
    };
    const adminbanks2 = () => {

        const data = paymentMode === 'Wallet' ? dealerWALLlist : dealerbanklist;
        const filteredData = filteredList(data);

        return (
            <View>
                {filteredData.length === 0 ? (
                    <NoDatafound />
                ) : (
                    <FlashList
                        data={filteredData}
                        renderItem={({ item }) => (
                            <View>
                                <TouchableOpacity
                                    style={styles.operatorview}
                                    onPress={() => {
                                        if (paymentMode === 'Wallet') {
                                            setWalletn(item['walletno']);
                                            setWallet(item['walletname'])

                                        } else {
                                            setSelectBan(item['banknm']);
                                            setSearchQuery('');
                                        }
                                        setAdmin(false);


                                    }}
                                >
                                    <Text ellipsizeMode="tail" numberOfLines={1} style={styles.operatornametext}>
                                        {paymentMode === 'Wallet' ? item['walletname'] : item['banknm']}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        estimatedItemSize={30}
                    />
                )}
            </View>
        );
    };


    const adminbanks3 = () => {
        const data = paymenttype1;

        return (
            <FlashList
                data={filteredList(data)}
                renderItem={({ item }) => (
                    <View>
                        <TouchableOpacity
                            style={styles.operatorview}
                            onPress={() => {
                                setPaymentType(item);
                                setType(false);
                                setSearchQuery('');

                            }}
                        >
                            <Text ellipsizeMode="tail" numberOfLines={1} style={styles.operatornametext}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
                estimatedItemSize={30}
            />
        );
    };
    const transfer = () => {
        console.log("transfer***123", paymentMode);

        switch (paymentMode) {
            case 'Cash':
            case 'Credit':
                submittxn();
                break;
            case 'Charge Back':
                getOtp();
                break;
            case 'Branch/Cms Deposit':
                submittxnBRANCH();
                break;
            case 'Online Transfer':
                submittxnONLINE()
                break;
            case 'Wallet':
                submittxnWALLET();
                break;


            default:
                console.log('Invalid payment mode');
                break;
        }
    };

    return (
        <ScrollView>

            <AppBarSecond title="" />
            <View style={styles.container}>
                <TouchableOpacity onPress={() => {
                    console.log(retailerMode)
                    setRetailerMode(false); setIsVisible(true);
                }}>
                    <FlotingInput
                        editable={false}
                        label={'Select Retailer Name'}
                        value={retailerName}
                    />
                    <View style={styles.righticon}>
                        <OnelineDropdownSvg />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => { setRetailerMode(true); setIsVisible(true); }}>
                    <FlotingInput
                        editable={false}
                        label={'Select Payment Mode'}
                        value={paymentMode}
                    />
                    <View style={styles.righticon}>
                        <OnelineDropdownSvg />
                    </View>
                </TouchableOpacity>

                {paymentMode === 'Online Transfer' &&
                    <>
                        <TouchableOpacity onPress={() => { setType(true); }}>


                            <FlotingInput
                                editable={false}
                                label={'Select Payment Type'}
                                value={paymenttype}
                            />
                            <View style={styles.righticon}>
                                <OnelineDropdownSvg />
                            </View>
                        </TouchableOpacity>
                    </>
                }

                {(paymentMode === 'Branch/Cms Deposit' || paymentMode === 'Online Transfer') ?
                    <>
                        <TouchableOpacity onPress={() => { setAdmin(true); }}>
                            <FlotingInput
                                editable={false}
                                label={'Select Dealer Bank'}
                                value={BankName}
                            />
                            <View style={styles.righticon}>
                                <OnelineDropdownSvg />
                            </View>
                        </TouchableOpacity>

                        <FlotingInput
                            label={'Account No.'}
                            value={AccountNo}
                            keyboardType="number-pad"
                            onChangeTextCallback={(t) => setAccountNo(t)}
                        />
                    </>
                    : null
                }

                {paymentMode === 'Online Transfer' &&
                    <FlotingInput
                        label={'UTR No.'}
                        value={utrNo}
                        keyboardType="number-pad"
                        onChangeTextCallback={(t) => setUtrNo(t)}

                    />
                }

                {paymentMode === 'Branch/Cms Deposit' &&
                    <>
                        <FlotingInput
                            label={'Deposit Slip No'}
                            value={Deposit}
                            keyboardType="number-pad"
                            onChangeTextCallback={(t) => setDeposit(t)}

                        />
                    </>
                }
                {paymentMode === 'Wallet' &&
                    <>
                        <TouchableOpacity onPress={() => { setAdmin(true) }}>
                            <FlotingInput
                                editable={false}
                                label={'Select Wallet'}
                                value={WalletName}
                            />
                            <View style={styles.righticon}>
                                <OnelineDropdownSvg />
                            </View>
                        </TouchableOpacity>
                        <FlotingInput
                            label={'Wallet No.'}
                            value={Walletn}
                            keyboardType="number-pad"
                            editable ={false}
                            onChangeTextCallback={setWalletn}
                        />
                        <FlotingInput
                            label={'transaction No.'}
                            value={transaction}
                            keyboardType="number-pad"
                            onChangeTextCallback={(t) => setTransaction(t)}
                        />
                    </>
                }


                <FlotingInput
                    label={'Enter Amount'}
                    value={amount}
                    keyboardType="number-pad"
                    maxLength={10}
                    onChangeTextCallback={(text) => {
                        setAmount(text);

                    }}
                />

                {paymentMode === 'Charge Back' && <FlotingInput
                    label={'Subject (Reason)'}
                    value={Subject}
                    onChangeTextCallback={(t) => setSubject(t)}
                />}
                {paymentMode === 'Cash' && <FlotingInput
                    label={'Collection By'}
                    value={collectionBy}
                    onChangeTextCallback={(t) => setCollectionBy(t)}
                />
                }
                {paymentMode !== 'Online Transfer' && <FlotingInput
                    label={'Comment'}
                    value={comment}
                    onChangeTextCallback={(t) => setComment(t)}
                />
                }


                {isSubmit && <FlotingInput
                    label={'Transaction ID'}
                    value={txnId}
                    editable={false}
                    onChangeTextCallback={(t) => setTxnId(t)}

                />}
                {isSubmit && (

                    <FlotingInput
                        label={'Old Credit ₹'}
                        value={retailerdata.currentcr === 0 ? '₹ 0' : `₹ ${retailerdata.currentcr}`}
                        editable={false}
                    // onChangeTextCallback={setComment}
                    />

                )}
                {isSubmit && (

                    <FlotingInput
                        label={'Remain current Bal ₹'}
                        value={retailerdata.RemainAmt === 0 ? '₹ 0' : `₹ ${retailerdata.RemainAmt}`}
                        editable={false}
                    // onChangeTextCallback={setComment}
                    />

                )}

                {isSubmit && (

                    <FlotingInput
                        label={'Mobile'}
                        value={retailerdata.Mobile === null ? '' : `${retailerdata.Mobile}`}
                        editable={false}
                    // onChangeTextCallback={setComment}
                    />

                )}

                {isSubmit && (

                    <FlotingInput
                        label={'Enter Trans Pin'}
                        value={Pin}
                        onChangeTextCallback={(t) => setPin(t)}
                        inputstyle={{ fontsize: 22 }}
                        keyboardType="number-pad"
                    />

                )}


                <Button
                    title={paymentMode == 'Charge Back' ? 'Get Otp' : (isSubmit ? 'Confirm Transfer' : 'Submit')}
                    onPress={() => {
                        console.log(userId)
                        if(paymentMode  === 'Charge Back'){
                            transfer()
                        }else{  isSubmit ? transfer()
                            : UniqueId()
                        }
                          
                      
                        // dipatch(reset());

                    }}
                    buttonStyle={styles.SignupButton}
                    titleStyle={{ fontWeight: 'bold' }}
                />
            </View>
            <OTPModal
                setShowOtpModal={setOtpModalVisible}
                disabled={mobileOtp.length !== 4}
                showOtpModal={otpModalVisible}
                setMobileOtp={setMobileOtp}
                setEmailOtp={null}
                inputCount={4}
                verifyOtp={() => {
                    getOtp()
                }}
            />
            <BottomSheet
        animationType="none"   isVisible={isVisible}>
                <View style={styles.bottomsheetview}>
                    <View style={[styles.StateTitle, { backgroundColor: '#A870B7' }]}>
                        <View style={styles.titleview}>
                            <Text style={styles.stateTitletext}>
                                {retailerMode ? 'Select Payment Mode' : 'Select Retailer'}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => setIsVisible(false)} activeOpacity={0.7}>
                            <ClosseModalSvg2 />
                        </TouchableOpacity>
                    </View>

                    {/* Search Bar */}
                    <TextInput
                        placeholder="Search..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={styles.searchBar}
                        placeholderTextColor={colors.black75}
                        cursorColor={colors.black}
                    />
                    {adminbanks()}
                </View>
            </BottomSheet>
            <BottomSheet
        animationType="none"   isVisible={admin}>
                <View style={styles.bottomsheetview}>
                    <View style={[styles.StateTitle, { backgroundColor: '#A870B7' }]}>
                        <View style={styles.titleview}>
                            <Text style={styles.stateTitletext}>
                                {paymentMode === 'Wallet' ? 'Select Distributer Wallet' : 'Select Distributer Bank'}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => setAdmin(false)} activeOpacity={0.7}>
                            <ClosseModalSvg2 />
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        placeholder="Search..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={styles.searchBar}
                        placeholderTextColor={colors.black75}
                        cursorColor={colors.black}
                    />
                    {adminbanks2()}
                </View>
            </BottomSheet>
            
        animationType="none"   isVisible={Type}>
                <View style={styles.bottomsheetview}>
                    <View style={[styles.StateTitle, { backgroundColor: '#A870B7' }]}>
                        <View style={styles.titleview}>
                            <Text style={styles.stateTitletext}>
                                {'Select Payment Type'}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={() => setType(false)} activeOpacity={0.7}>
                            <ClosseModalSvg2 />
                        </TouchableOpacity>
                    </View>

                    <TextInput
                        placeholder="Search..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={styles.searchBar}
                        placeholderTextColor={colors.black75}
                        cursorColor={colors.black}
                    />
                    {adminbanks3()}
                </View>
            </BottomSheet>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    righticon: {
        position: 'absolute',
        left: 'auto',
        right: wScale(12),
        top: 0,
        height: '85%',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: wScale(12),
    },
    SignupButton: {
        marginTop: wScale(1),
        borderBlockColor: '#000000',
        borderColor: colors.blue_button,
        alignContent: 'center',
        alignSelf: 'center',
        justifyContent: 'center',
        borderRadius: 50,
        backgroundColor: colors.dark_blue,
        width: '100%',
        height: hScale(45),
        shadowColor: 'black',
        flexDirection: 'row',
    },
    operatornametext: {
        textTransform: "capitalize",
        fontSize: wScale(20),
        color: "#000",
        flex: 1,
        borderBottomColor: "#000",
        borderBottomWidth: wScale(0.5),
        paddingVertical: hScale(30),
        marginHorizontal: wScale(10),
    },
    bottomsheetview: {
        backgroundColor: '#fff',
        height: SCREEN_HEIGHT / 1.3,
        marginHorizontal: wScale(0),
        borderTopLeftRadius: hScale(15),
        borderTopRightRadius: hScale(15),
    },
    StateTitle: {
        paddingVertical: hScale(10),
        borderTopLeftRadius: hScale(15),
        borderTopRightRadius: hScale(15),
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        paddingHorizontal: wScale(10),
        marginBottom: hScale(10),
    },
    stateTitletext: {
        fontSize: wScale(22),
        color: '#000',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    titleview: {
        flex: 1,
        alignItems: 'center',
    },
    searchBar: {
        borderColor: 'gray',
        borderWidth: wScale(1),
        paddingHorizontal: wScale(15),
        marginHorizontal: wScale(10),
        marginBottom: hScale(10),
        borderRadius: 5,
        color: colors.black75,
        fontSize: wScale(16),
    },
    operatorview: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        paddingHorizontal: wScale(10),
    },
});

export default FundTransferRetailer;
