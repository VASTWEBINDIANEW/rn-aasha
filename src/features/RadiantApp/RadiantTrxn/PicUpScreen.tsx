import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, ToastAndroid, Alert, ActivityIndicator, PermissionsAndroid, Image, Keyboard } from 'react-native';
import { hScale, SCREEN_HEIGHT, wScale } from '../../../utils/styles/dimensions';
import { FlashList } from '@shopify/flash-list';
import { FontSize } from '../../../utils/styles/theme';
import { useNavigation, useRoute } from '@react-navigation/native';
import DynamicButton from '../../drawer/button/DynamicButton';
import { BottomSheet } from '@rneui/base';
import VerifyMobileNumber from '../../../components/VerifyMobileNumber';
import OTPModal from '../../../components/OTPModal';
import toNumber from 'lodash/toNumber';
import CustomCalendar from '../../../components/Calender';
import moment from 'moment';
import useRadiantHook from '../../Financial/hook/useRadiantHook';
// import QRCodeScanner from 'react-native-qrcode-scanner';
import QrcodAddmoneysvg from '../../drawer/svgimgcomponents/QrcodAddmoneysvg';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import RadintPickupSvg from '../../drawer/svgimgcomponents/RadintPickupSvg';
import LinearGradient from 'react-native-linear-gradient';
import FlotingInput from '../../drawer/securityPages/FlotingInput';
import Calendarsvg from '../../drawer/svgimgcomponents/Calendarsvg';
import OnelineDropdownSvg from '../../drawer/svgimgcomponents/simpledropdown';
import CheckSvg from '../../drawer/svgimgcomponents/CheckSvg';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import ShowLoader from '../../../components/ShowLoder';
import { useLocationHook } from '../../../hooks/useLocationHook';
import LottieView from 'lottie-react-native';
import { useDocumentUpload } from '../../../hooks/useDocumentUpload';
import ImagePreviewModal from '../Radiantregister/ImagePreviewModal';
import AlertSvg from '../../drawer/svgimgcomponents/AlertSvg';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { useFocusEffect } from '@react-navigation/native';
import { getModel } from 'react-native-device-info';
import OnlinePickUpQrSheet from '../../../components/OnlinePickUpQrSheet';
import QrcodSvg from '../../drawer/svgimgcomponents/QrcodSvg';
import uuid from 'react-native-uuid';
import { log } from 'console';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TimeoutAlertModal from '../components/TimeoutModal';
const PicUpScreen = () => {
  const { colorConfig, Loc_Data, cmsVerify, rctype, rcPrePayAnomut, isPartial, currentPartialAmount, totalPartialAmount } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}20`;
  const rout = useRoute();
  const { item, CodeId, Mobile, item2, selectedModes } = rout.params || {};
  console.log(rout.params, '@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@1');
  const [timeoutModal, setTimeoutModal] = useState(false);
  const [isLoading2, setIsloading2] = useState(false);
  const [amount, setAmount] = useState(rctype === 'PrePay' ? rcPrePayAnomut : "");
  const [Ramount, setRAmount] = useState(rctype === 'PrePay' ? rcPrePayAnomut : "");
  const [sealingTagNo, setSealingTagNo] = useState('');
  const [customerGeneratedNo, setCustomerGeneratedNo] = useState('');
  const [hciSlipNo, setHciSlipNo] = useState('');
  const [hsbcDepositSlipNo, setHsbcDepositSlipNo] = useState(CodeId);
  const [airtenGampangila, setAirtenGampangila] = useState('');
  const [transactionCount, setTransactionCount] = useState(CodeId ? item.ClientCode?.length : ''
  );
  const [additionalRemarks, setAdditionalRemarks] = useState('');
  const [modalVisible, setModalVisible] = useState(CodeId ? false : true);
  const [remark, setRemark] = useState('');
  const [received, setReceived] = useState('');
  const [qrData, setQrData] = useState([]);
  const [remarkVisible, setRemarkVisible] = useState(false);
  const isRelianceQR = (item.QrStatus === 'Reliance' || item.QrStatus === 'Radiant');
  const [childRemarksVisible, setChildRemarksVisible] = useState(false);
  const [clientCodeIndex, setClientCodeIndex] = useState(0);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [mobilemodel, setMobilemodel] = useState(false);
  const [clientCodeModalVisible, setClientCodeModal] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [slipDate, setSlipDate] = useState(item.ClientCode?.length < 2 && today);
  const [QR_transid, setQR_transid] = useState('');
  const [TransDate, setTransDate] = useState(item?.TransDate);
  const [clientCode, setClientCode] = useState(item?.ClientCode[0]);
  const [cashPickupData, setCashPickupData] = useState([]);
  const [clientOtp, setClientOtp] = useState('');
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [mobileOtp, setMobileOtp] = useState('');
  const [showCalender, setShowCalender] = useState(false);
  const [isScan, setIsScan] = useState(false);
  const [ceid, setCeid] = useState("")
  const navigation = useNavigation();
  const [cashPickupList, setCashPickupList] = useState<any[]>([]);
  const { post } = useAxiosHook()
  const { remarkList, childRemarkList,
    fetchMasterRemarkList, fetchChildRemarkList,
    setRadiantOtp, setRadiantDynamicOtp,
    otpResponse, dynamicOtpResponse, submitCashPickupResponse,
    submitCashPickupTransaction, isLoading, fetchCashPickupTransactionList } = useRadiantHook();
  const currencyData = [
    { key: 'Online', val: '0', path: require('../../../../assets/images/coinsR.jpg') },

    { key: '500', val: '0', path: require('../../../../assets/images/500R.jpg') },
    { key: '200', val: '0', path: require('../../../../assets/images/200R.jpg') },
    { key: '100', val: '0', path: require('../../../../assets/images/100R.jpg') },
    { key: '50', val: '0', path: require('../../../../assets/images/50R.jpg') },
    { key: '20', val: '0', path: require('../../../../assets/images/20R.jpg') },
    { key: '10', val: '0', path: require('../../../../assets/images/10R.jpg') },
    { key: '5', val: '0', path: require('../../../../assets/images/5R.jpg') },

    // Coins
    { key: 'Coins', val: '0', path: require('../../../../assets/images/coinsR.jpg') },
  ];
  const finalAmount =
    Number(currentPartialAmount || 0) +
    Number(totalPartialAmount || 0);
  const [denominationData, setDenominationData] = useState(currencyData)
  const handleChangeText = useCallback((text, key) => {
    handleDenomChange(text, key); // Call the memoized handleDenomChange
    setOnlineAm(key === 'Online' ? text : onlineAm)
    setDenominationData((prevData) => {
      const updatedData = prevData.map((denom) =>
        denom.key === key ? { ...denom, val: text } : denom
      );

      let total = 0;
      updatedData.forEach((item) => {
        const val = Number(item.val);
        if (!isNaN(val)) {
          if (item.key === 'Online' || item.key === 'Coins') {
            total += val; // direct जोड़ दो
          } else {
            total += val * (Number(item.key) || 1);
          }
        }
      });

      setTotal(total);
      setRemain(amount - total);
      return updatedData;
    });
  }, [amount, denominationData]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await post({ url: `${APP_URLS.RadiantBankAccount}` });
        const parsedData = JSON.parse(response.data);
        //  setBankData(parsedData?.Content || []);
        console.log(parsedData, '@@@@@@@@@@@@@@@@@@@@@@@@@@@');
        const data = parsedData.Content;

        const sbiQRCodes = data
          .filter(item => item.BankName.trim().startsWith("State Bank of India"))
          .map(item => item.qrimage);
        console.log(sbiQRCodes[0], '**********************************************')
      } catch (error) {
        console.error('API error', error);
        ToastAndroid.show('Failed to load bank accounts', ToastAndroid.SHORT);
      } finally {
        //setLoading(false);
      }
    };
    fetchData();
  }, []);
  const [remaining, setRemain] = useState(null)
  const [total, setTotal] = useState(0); // Total state
  const renderAmountItem = useCallback(
    ({ item }) => {
      if (item.key === "Online" && rctype === "PrePay") {
        return null;
      }
      if (item.key === "Online" && !CodeId) {
        return null;
      }

      return (
        <View key={`${item.key} Rupee`}>
          <FlotingInput
            key={item.key}
            label={
              item.key === "Online"
                ? "Enter Online Amount"
                : `${item.key} Rupee Notes`
            }
            keyboardType="numeric"
            value={item.val === "0" ? "" : item.val}
            // onChangeTextCallback={(text) => {
            //   handleChangeText(text, item.key);
            // }}
            onChangeTextCallback={(text) => {
              const digitsOnly = text.replace(/\D/g, ""); // Remove non-digit characters
              handleChangeText(digitsOnly, item.key);
            }}
          />
          <View style={[styles.righticon2]}>
            {item.key !== "Online" ? (
              <Image
                source={item.path}
                style={{
                  width: wScale(90),
                  height: "100%",
                  resizeMode: "contain",
                  marginBottom: -2,
                }}
              />
            ) : (
              <TouchableOpacity onPress={() => getqr()}

                style={{
                  alignItems: 'center',
                  width: wScale(90), backgroundColor: onlineAm ? color1 : 'transparent', borderWidth: onlineAm ? 1 : 0, borderColor: colorConfig.secondaryColor, borderRadius: wScale(5)
                }}>
                {(onlineAm) &&

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: wScale(10) }}>
                      {utr.length >= 12 ? `View\nPay\nInfo` : `Show\nQR\nCode`}
                    </Text>

                    {utr.length >= 12 ?
                      <LottieView
                        autoPlay={true}
                        loop={true}
                        style={styles.lotiimg}
                        source={require('../../../utils/lottieIcons/View-Docs.json')}
                      // source={require('../../utils/lottieIcons/View-Docs.json')}
                      /> :

                      <QrcodSvg size={wScale(40)} color={colorConfig.primaryColor} />}
                  </View>


                }
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    },
    [denominationData, CodeId] // 👈 dependency में CodeId add किया
  );




  const [HCIStatus, setHCIStatus] = useState('')
  const [isotpSended, setisOtpSended] = useState(false);
  useFocusEffect(
    useCallback(() => {
      const checkStatusAndCall = async () => {
        setIsloading2(true)
        try {
          const status = await AsyncStorage.getItem('pickup_status');
          const pickuptype = await AsyncStorage.getItem('pickuptype');
          const HCI = await AsyncStorage.getItem('HCIStatus');
          console.error(HCI)
          setHCIStatus(HCI);
          console.log(' pickuptype:', pickuptype);
          if (status === 'verified') {
            setDetailsModalVisible(true);
            setisOtpSended(true)
          }

          setIsloading2(false)

        } catch (error) {
          console.error('Error reading AsyncStorage:', error);
        }
      };

      checkStatusAndCall();

      return () => {
      };
    }, [])
  );
  useEffect(() => {
    const fetchData = async () => {
      await fetchMasterRemarkList();
      setIsLoad(false)
    }
    fetchData();

  }, [])

  useEffect(() => {
    if (rctype === 'PrePay') {
      setAmount(rcPrePayAnomut)
      setRAmount(rcPrePayAnomut)
    }
    else {
      setAmount(null);
      setRAmount(null)
    }
  }, [])
  useEffect(() => {
    if (Mobile) {
      setRemark('Pickup Done');
      setReceived('CASH RECEIVED');
      setAdditionalRemarks('OK');
    }
  }, [Mobile]);
  const model = getModel();

  useEffect(() => {
    console.log(model, 'mmmmmmmmmmmmmmmmmmmmmmmm');

    console.log(Loc_Data['latitude'], Loc_Data['longitude'], '*****RRR************')

    const fetchData2 = async () => {
      await getLocation();
    }
    fetchData2();
    return;
  }, [])
  useEffect(() => {
    setOnlineAm('')
  }, [utr, onlineAm])

  const submitCashPickupRequest = useCallback(async () => {

    console.log(Loc_Data['latitude'], Loc_Data['longitude'])
    if (!Loc_Data['latitude'] || !Loc_Data['longitude']) {
      return null;
    }

    setIsLoad(true);

    const pickuptype = 'Online';
    const newId = uuid.v4();
    console.log("Generated ID:", newId);

    let transaction = {
      "requestType": "cashPickupTransSubmit",
      "type": "Pickup",
      "ceId": ceid,
      "shopId": item.ShopId,
      "transId": item.TransId,
      "noRecs": toNumber(transactionCount),
      "transParam": cashPickupData,
      "depType": item.DepTypess,
      "qrTransId": "",
      "latitude": Loc_Data['latitude'],
      "longitude": Loc_Data['longitude'],
      "pickuptype": 'Online',
      "Modelnumber": model,
      'CType': rctype,
      'Uniqueid': newId,
      'IsPartial': isPartial
    };

    if (pickuptype == 'Online') {
      transaction = {
        ...transaction,
        "ClientName": item2.Name,
        "Clientmobile": item2.Mobile,
        "Clientemail": item2.Email,
      };
    }

    if (item.qr_status === 'Radiant') {
      transaction = {
        "requestType": "radiantQRProcess",
        "QR_transid": QR_transid,
        "pickup_code": item.ShopId,
        "erp_transid": item.TransId,
        "qr_pic_status": qrData
      }
    }

    console.log("📌 Transaction:", JSON.stringify(transaction, null, 2));

    try {

      const res = await submitCashPickupTransaction(transaction);

      console.log("📥 API Response:", JSON.stringify(res, null, 2));

      if (res?.Content?.ADDINFO?.status === 'success') {
          setDetailsModalVisible(false);

        await AsyncStorage.setItem('pickup_status', 'unverified');
        setCashPickupData([]);

        if (CodeId) {
          setDetailsModalVisible(false);
          navigation.navigate('PickupSummaryScreen', {
            CodeId: item.TransId || '',
            status: res?.Content?.ADDINFO?.status,
            message: res?.Content?.ADDINFO?.message
          });
        } else {
          navigation.goBack();
        }

      } else {
        Alert.alert(
          "Error",
          res?.Content?.ADDINFO?.message || 'Something went wrong.',
          [{ text: "OK", onPress: () => navigation.navigate('RadiantTransactionScreen') }]
        );
      }

    } catch (error: any) {

      // ── Timeout — backend pe submit hua hoga ──
      if (error?.code === 'ECONNABORTED') {
        console.log('⚠️ TIMEOUT — Backend pe submit hua hoga');

        setTimeoutModal(true);

      } else {
        Alert.alert(
          '❌ Error',
          error?.message || 'Something went wrong.',
          [{ text: 'OK', onPress: () => navigation.navigate('RadiantTransactionScreen') }]
        );
      }

    } finally {
      setIsLoad(false);  // ← hamesha false hoga
      setCashPickupData([]);
      setDetailsModalVisible(false);
    }

  }, [
    cashPickupData,
    item,
    transactionCount,
    submitCashPickupTransaction,
    submitCashPickupResponse,
    toNumber,
    Loc_Data['latitude'],
    Loc_Data['longitude']
  ]);


  const handleTimeoutOk = async () => {
    setTimeoutModal(false);
    if (isPartial) {
      navigation.navigate('RadiantPrepayReport');
    } else {
      try {
        const res = await fetchCashPickupTransactionList();
        const list = res ?? [];
        setCashPickupList(list);
        if (list.length > 0) {
          navigation.navigate('CashPickup');
        } else {
          navigation.navigate('RadiantPrepayReport');
        }
      } catch (e) {
        console.log('❌ fetchCashPickupTransactionList error:', e);
        navigation.navigate('RadiantTransactionScreen');
      }
    }
  };

  useEffect(() => {

    const checkCE_status = async () => {
      try {
        const res = await post({ url: APP_URLS.RCEID });
        const status = res?.Content?.ADDINFO?.sts;
        const message = res?.Content?.ADDINFO?.CEID;
        setCeid(message);

        console.log(res, '*********###********')
        const Content = res.Content.ADDINFO.sts;

        if (Content) {

        } else {
          // alert('CEID not available')

        }

        setIsLoad(false)
        console.log(res, '*************')
        console.log(res, 'Response:');

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    console.log(rout.params)
    checkCE_status();
  }, []);
  const [newdenoms, setNewDenoms] = useState([])
  const [allDenomData, setAllDenomData] = useState([]);


  const validatePickupForm = ({
    amount,
    remark,
    received,
    denominationData,
    CodeId,
    currentPreviewImageRef,
    setIsLoad
  }) => {
    console.log(received, remark);

    // Amount validation
    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Pickup Amount is required and must be a valid number.');
      setIsLoad(false);
      return false;
    }

    // Remark validation
    if (!remark || remark === 'Select') {
      Alert.alert('Please select Remark.');
      setIsLoad(false);
      return false;
    }

    // Received validation
    if (!received || received === 'Select') {
      Alert.alert('Please select Received.');
      setIsLoad(false);
      return false;
    }

    // Denomination total validation
    let total = 0;
    denominationData.forEach((item) => {
      if (isNaN(Number(item.key))) {
        total += Number(item.val);
      } else {
        total += Number(item.key) * Number(item.val);
      }
    });

    if (total !== Number(amount)) {
      console.log(total, amount);
      Alert.alert('Please check your denomination total and submit again');
      setIsLoad(false);
      return false;
    }

    // Image slip validation (only if CodeId not provided)
    if (!CodeId) {
      if (
        !currentPreviewImageRef.current ||
        !currentPreviewImageRef.current.startsWith('data:image/')
      ) {
        ToastAndroid.show(
          'Please upload the slip before submitting.',
          ToastAndroid.LONG
        );
        return false;
      }
    }

    // ✅ All validations passed
    return true;
  };

  const handlePickupData = useCallback(async () => {
    setIsLoad(true)

    console.log(received, remark,);
    const pickuptype = 'Online';

    if (!amount || isNaN(Number(amount))) {
      Alert.alert('Pickup Amount is required and must be a valid number.');
      setIsLoad(false)
      setIsloading2(false); return;
    } const isValidRemark = (value) => value && value !== 'Select';
    if (!isValidRemark(remark)) {
      Alert.alert('Please select Remark.');
      setIsLoad(false)
      setIsloading2(false)
      return;
    } if (!isValidRemark(received)) {
      Alert.alert('Please select Received.');
      setIsLoad(false)
      setIsloading2(false)
      return;
    } console.log(denominationData)
    let total = 0; denominationData.forEach((item) => {
      if (isNaN(Number(item.key))) { total += Number(item.val); console.log(total, '###################'); }
      else {
        total += Number(item.key) * Number(item.val);
        console.log(total, '******++++************',);
      }
    }); if (total !== Number(amount)) {
      console.log(total, amount)
      Alert.alert('Please check your denomination total and submit again',); setIsLoad(false)
      setIsloading2(false)
      return;
    } if (!slipDate) {
      setIsLoad(false)
      setIsloading2(false)
      return Alert.alert('Please select slip date')
    }
    if (denomData[0]?.amount > 0) {
      if (!currentPreviewImageRef.current || !currentPreviewImageRef.current.startsWith('data:image/')) {
        ToastAndroid.show('Please upload the slip before submitting.', ToastAndroid.LONG);

        if (utr.length >= 12) {
          setIsVisible(true)
        } else {
          getqr()
        }
        setIsloading2(false);

        return
      }
    }

    if (!CodeId) {
      if (!currentPreviewImageRef.current || !currentPreviewImageRef.current.startsWith('data:image/')) {

        ToastAndroid.show('Please upload the slip before submitting.', ToastAndroid.LONG);
        setIsloading2(false); return;
      }
    }
    if (!CodeId) {
      setIsLoad(true)
    }

    const newId = uuid.v4();   // unique ID generate
    console.log("Generated ID:", newId);

    const data = {
      "pickup_amount": parseFloat(amount),
      "rec_no": hsbcDepositSlipNo,
      "pis_hcl_no": customerGeneratedNo,
      "hcl_no": hciSlipNo,
      "gen_slip": sealingTagNo,
      "client_code": clientCode,
      "master_remarks": remark,
      "child_remarks": received,
      "remarks": additionalRemarks,
      "slip_date": slipDate,
      "pay_slip_date": TransDate,
      "2000s": toNumber('0'),
      "1000s": toNumber('0'),
      "500s": toNumber(denominationData[1].val || 0),
      "200s": toNumber(denominationData[2].val || 0),
      "100s": toNumber(denominationData[3].val || 0),
      "50s": toNumber(denominationData[4].val || 0),
      "20s": toNumber(denominationData[5]?.val || 0),
      "10s": toNumber(denominationData[6]?.val || 0),
      "5s": toNumber(denominationData[7]?.val || 0),
      "coins": toNumber(denominationData[8]?.val || 0),
      "slip": currentPreviewImageRef.current,

    };

    const Onlinedata = {
      "pickup_amount": parseFloat(amount),
      "rec_no": hsbcDepositSlipNo,
      "pis_hcl_no": customerGeneratedNo,
      "hcl_no": hciSlipNo,
      "gen_slip": sealingTagNo,
      "client_code": clientCode,
      "master_remarks": remark,
      "child_remarks": received,
      "remarks": additionalRemarks,
      "slip_date": slipDate,
      "pay_slip_date": TransDate,
      "2000s": toNumber('0'),
      "1000s": toNumber('0'),
      "500s": toNumber(denominationData[1].val || 0),
      "200s": toNumber(denominationData[2].val || 0),
      "100s": toNumber(denominationData[3].val || 0),
      "50s": toNumber(denominationData[4].val || 0),
      "20s": toNumber(denominationData[5]?.val || 0),
      "10s": toNumber(denominationData[6]?.val || 0),
      "5s": toNumber(denominationData[7]?.val || 0),
      "coins": toNumber(denominationData[8]?.val || 0) + toNumber(denominationData[0]?.val),
      "slip": '',
      "Utrno": utr,
      "UploadOnlinrSlip": currentPreviewImageRef.current,
      "OnlineAmount": toNumber(onlineAm || 0),
    };



    console.warn('>>>>>>>>>>>>>>>>>>>>>>>>>>>')
    console.warn(Onlinedata)
    console.warn('<<<<<<<<<<<<<<<<<<<<<<<<<<<')

    const deno = [
      { denom: 'Online', notes: 0, amount: toNumber(denomData[0]?.amount) || 0 },
      { denom: '500', notes: denomData[1]?.notes || 0, amount: toNumber(denomData[1]?.amount) || 0 },
      { denom: '200', notes: denomData[2]?.notes || 0, amount: toNumber(denomData[2]?.amount) || 0 },
      { denom: '100', notes: denomData[3]?.notes || 0, amount: toNumber(denomData[3]?.amount) || 0 },
      { denom: '50', notes: denomData[4]?.notes || 0, amount: toNumber(denomData[4]?.amount) || 0 },
      { denom: '20', notes: denomData[5]?.notes || 0, amount: toNumber(denomData[5]?.amount) || 0 },
      { denom: '10', notes: denomData[6]?.notes || 0, amount: toNumber(denomData[6]?.amount) || 0 },
      { denom: '5', notes: denomData[7]?.notes || 0, amount: toNumber(denomData[7]?.amount) || 0 },
      { denom: 'Others', notes: denominationData[8]?.val || 0, amount: toNumber(denominationData[8]?.val) || 0 },
      {
        denom: 'Total',
        notes: '',
        amount: (toNumber(denomData[0]?.amount) || 0) +
          (toNumber(denomData[1]?.amount) || 0) +
          (toNumber(denomData[2]?.amount) || 0) +
          (toNumber(denomData[3]?.amount) || 0) +
          (toNumber(denomData[4]?.amount) || 0) +
          (toNumber(denomData[5]?.amount) || 0) +
          (toNumber(denomData[6]?.amount) || 0) +
          (toNumber(denomData[7]?.amount) || 0) +
          (toNumber(denominationData[8]?.val) || 0)
      },
    ];

    console.log(deno)
    const filled = cashPickupData.length;
    const remaining = toNumber(transactionCount) - filled;

    if (filled >= toNumber(transactionCount)) {
      const newData = data;

      const isDuplicate = cashPickupData.some(
        (item) =>
          JSON.stringify(item) === JSON.stringify(newData)
      );

      if (isDuplicate) {
        setIsLoad(false);
        setIsloading2(false);
        navigation.navigate('CmsFinalOtpVerification', { item2, item, denomData: newdenoms, transid: CodeId, slipDate, Mobile, fromPickup: true, selectedModes, transactionCount: item.ClientCode.length });




      }

      return;
    }


    const final = pickuptype == 'Online' ? Onlinedata : data
    const updatedCashData = [...cashPickupData, final];
    setCashPickupData(updatedCashData);

    console.log(updatedCashData.Utrno)
    const updatedNewDenoms = [...newdenoms, deno];
    setNewDenoms(updatedNewDenoms);

    // ✅ Status dialog
    if (toNumber(transactionCount) > 1 && remaining - 1 > 0) {
      setIsLoad(false);
      setIsloading2(false);
      navigation.navigate('CmsFinalOtpVerification', { item2, item, denomData: updatedNewDenoms, transid: CodeId, slipDate, Mobile, fromPickup: true, selectedModes, transactionCount: item.ClientCode.length });


      // Dialog.show({
      //   type: ALERT_TYPE.SUCCESS,
      //   title: `Receipt Status`,
      //   textBody: `${filled + 1} Completed • ${remaining - 1} Pending`,
      //   button: 'OK',
      // });
    }
    // ✅ Reset fields if अभी और transactions बाकी हैं
    if (toNumber(transactionCount) > 1 && updatedCashData.length < toNumber(transactionCount)) {
      setAmount('');
      setSealingTagNo('');
      setCustomerGeneratedNo('');
      setHciSlipNo('');
      if (!CodeId) setHsbcDepositSlipNo('');
      setAirtenGampangila('');
      setAdditionalRemarks('');
      setRemark('Select');
      setReceived('Select');
      setSlipDate('');
      setRAmount('');
      setDenominationData([...currencyData]);
      setClientCode(clientCodeIndex + 1 < item.ClientCode.length ? item.ClientCode[clientCodeIndex + 1] : item.ClientCode[0]);
      setClientCodeIndex(clientCodeIndex + 1);
      setCurrentPreviewImage('');
      currentPreviewImageRef.current = '';
      setOnlineAm('')
      setIsloading2(false);
      setUtr('');
      setDenomData([
        { denom: 'Online', notes: '0', amount: '0' },
        { denom: '500', notes: '0', amount: '0' },
        { denom: '200', notes: '0', amount: '0' },
        { denom: '100', notes: '0', amount: '0' },
        { denom: '50', notes: '0', amount: '0' },
        { denom: '20', notes: '0', amount: '0' },
        { denom: '10', notes: '0', amount: '' },
        { denom: '5', notes: '0', amount: '0' },
        { denom: 'Others', notes: '0', amount: '0' },
        { denom: 'Total', notes: '', amount: '0' },
      ]);
      setIsLoad(false);
      setIsloading2(false);

      return;
    }

    // ✅ अगर सारी transactions पूरी हो गईं
    if (CodeId) {
      setIsLoad(false);
      setIsloading2(false);
      navigation.navigate('CmsFinalOtpVerification', { item2, item, denomData: updatedNewDenoms, transid: CodeId, slipDate, Mobile, fromPickup: true, selectedModes, transactionCount: item.ClientCode.length });


      return;
    }

    setDetailsModalVisible(true);
    setIsLoad(false);
    setIsloading2(false);
  }, [amount, hsbcDepositSlipNo, customerGeneratedNo, hciSlipNo, sealingTagNo, clientCode, remark, received, additionalRemarks, slipDate, denominationData, transactionCount, cashPickupData, currentPreviewImageRef, utr]);


  const handleSubmit = useCallback(async () => {

    console.log(
      "\n=========== HANDLE SUBMIT START ===========\n"
    );

    console.log("ROUTE PARAMS =>");

    console.log(
      JSON.stringify(
        {
          item,
          CodeId,
          Mobile,
          item2,
          selectedModes
        },
        null,
        2
      )
    );

    setIsLoad(true);
    setIsloading2(true);
    setisOtpSended(true);

    try {

      console.log("OtpDay =>", item?.OtpDay);

      console.log(
        "Match Result =>",
        ["CurrentTransaction", "Daily", "Weekly-Sun"]
          .includes(item?.OtpDay)
      );

      /* ===================================================
         NORMAL OTP FLOW
      =================================================== */

      if (
        ["CurrentTransaction", "Daily", "Weekly-Sun"]
          .includes(item?.OtpDay)
      ) {

        console.log(
          "\n=========== NORMAL OTP FLOW ===========\n"
        );

        const requestPayload = {
          TransId: item?.TransId,
          Empty1: '',
          ShopId: item?.ShopId,
          Amount: amount,
          OtpDay: item?.OtpDay,
          Empty2: '',
          Email: CodeId ? item2?.Email : ''
        };

        console.log(
          "API FUNCTION => setRadiantOtp"
        );

        console.log(
          "REQUEST PAYLOAD =>"
        );

        console.log(
          JSON.stringify(
            requestPayload,
            null,
            2
          )
        );

        const res = await setRadiantOtp(
          requestPayload.TransId,
          requestPayload.Empty1,
          requestPayload.ShopId,
          requestPayload.Amount,
          requestPayload.OtpDay,
          requestPayload.Empty2,
          requestPayload.Email
        );

        console.log(
          "FULL RESPONSE =>"
        );

        console.log(
          JSON.stringify(res, null, 2)
        );

        setDetailsModalVisible(false);

        if (
          res?.Content?.ADDINFO?.status === 'success'
        ) {

          console.log(
            "OTP SUCCESS"
          );

          console.log(
            "OTP =>",
            res?.Content?.ADDINFO?.otp_pin
          );

          setClientOtp(
            res?.Content?.ADDINFO?.otp_pin || ''
          );

          console.log(
            "OTP MODAL OPEN"
          );

          setOtpModalVisible(true);

        } else {

          console.log(
            "OTP FAILED"
          );

          console.log(
            "FAIL MESSAGE =>",
            res?.Content?.ADDINFO?.message
          );

          setOtpModalVisible(false);

          ToastAndroid.showWithGravity(
            res?.Content?.ADDINFO?.message ||
            'Something went wrong!',
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM
          );
        }
      }

      /* ===================================================
         EMPTY OTP DAY
      =================================================== */

      else if (item?.OtpDay === '') {

        console.log(
          "\n=========== EMPTY OTP DAY FLOW ===========\n"
        );

        console.log(
          "Opening Mobile Modal"
        );

        setDetailsModalVisible(false);

        setMobilemodel(true);

        return;
      }

      /* ===================================================
         AXIS FLOW
      =================================================== */

      else if (
        item?.OtpDay === 'AxisTransaction'
      ) {

        console.log(
          "\n=========== AXIS OTP FLOW ===========\n"
        );

        const requestPayload = {
          TransId: item?.TransId,
          Mobile: item2?.Mobile,
          ShopId: item?.ShopId,
          Amount: amount,
          OtpDay: item?.OtpDay,
          Empty: '',
          Email: CodeId ? item2?.Email : ''
        };

        console.log(
          "API FUNCTION => setRadiantDynamicOtp"
        );

        console.log(
          "REQUEST PAYLOAD =>"
        );

        console.log(
          JSON.stringify(
            requestPayload,
            null,
            2
          )
        );

        const res = await setRadiantDynamicOtp(
          requestPayload.TransId,
          requestPayload.Mobile,
          requestPayload.ShopId,
          requestPayload.Amount,
          requestPayload.OtpDay,
          requestPayload.Empty,
          requestPayload.Email
        );

        console.log(
          "FULL RESPONSE =>"
        );

        console.log(
          JSON.stringify(res, null, 2)
        );

        if (res) {

          console.log(
            "AXIS OTP =>",
            res?.Content?.ADDINFO?.otp_pin
          );

          setClientOtp(
            res?.Content?.ADDINFO?.otp_pin || ''
          );

          if (item2?.Mobile) {

            console.log(
              "Toast Mobile =>",
              item2.Mobile
            );

            ToastAndroid.showWithGravity(
              `OTP has been sent to ${item2.Mobile} number`,
              ToastAndroid.SHORT,
              ToastAndroid.BOTTOM
            );
          }
        }

        closeMobileModal();
      }

      /* ===================================================
         UNKNOWN FLOW
      =================================================== */

      else {

        console.log(
          "\n=========== UNKNOWN FLOW ===========\n"
        );

        console.log(
          "Unhandled OtpDay =>",
          item?.OtpDay
        );
      }

    } catch (err: any) {

      console.log(
        "\n=========== HANDLE SUBMIT ERROR ===========\n"
      );

      console.log(
        "FULL ERROR =>"
      );

      console.log(
        JSON.stringify(err, null, 2)
      );

      console.log(
        "ERROR MESSAGE =>",
        err?.message
      );

      console.log(
        "ERROR STACK =>",
        err?.stack
      );

      ToastAndroid.showWithGravity(
        'Something went wrong. Please try again.',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );

    } finally {

      console.log(
        "\n=========== HANDLE SUBMIT FINISHED ===========\n"
      );

      setIsLoad(false);
      setIsloading2(false);
    }

  }, [
    item,
    item2,
    amount,
    CodeId,
    Mobile,
    selectedModes
  ]);

  const closeMobileModal = () => {
    setMobilemodel(false);
    setOtpModalVisible(true);
    setIsLoad(false);
    setIsloading2(false);
  };
  const handleCancelPress = async () => {
    setDetailsModalVisible(false);
    const pickuptype = 'Online';
    if (pickuptype === 'Online') {
      navigation.goBack();
    };


  };
  const [denomData, setDenomData] = useState([
    { denom: 'Online', notes: '0', amount: '0' },

    { denom: '500', notes: '0', amount: '0' },
    { denom: '200', notes: '0', amount: '0' },
    { denom: '100', notes: '0', amount: '0' },
    { denom: '50', notes: '0', amount: '0' },
    { denom: '20', notes: '0', amount: '0' },
    { denom: '10', notes: '0', amount: '0' },
    { denom: '5', notes: '0', amount: '0' },
    { denom: 'Others', notes: '0', amount: '0' },
    { denom: 'Total', notes: '', amount: '0' },
  ]);
  const handleDenomChange = (text, key) => {
    const updated = denomData.map((item) => {
      if (item.denom === key) {
        const notes = text;
        let amount;

        if (key === 'Others') {
          amount = item.amount; // पहले जैसा
        } else if (key === 'Online') {
          amount = String(Number(notes)); // 👈 direct assign
        } else {
          amount = String(Number(notes) * Number(key));
        }

        return { ...item, notes, amount };
      } else if (item.denom === 'Total') {
        return item;
      }
      return item;
    });

    let total = 0;
    updated.forEach((item) => {
      if (item.denom !== 'Total') {
        const amt = Number(item.amount);
        if (!isNaN(amt)) total += amt;
      }
    });

    const finalData = updated.map((item) =>
      item.denom === 'Total'
        ? { ...item, amount: String(total) }
        : item
    );

    setDenomData(finalData);
  };

  const handleDateChange = (date) => {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    const today = moment().format('YYYY-MM-DD');

    if (formattedDate <= today) {
      setSlipDate(formattedDate);
    } else {
      Alert.alert("Invalid Date", "You cannot select a future date.");
    }
    setShowCalender(false);
  };

  const onSuccess = (e) => {
    // {compname='Reliance Retail Limited', 
    //   subdivcode='T7WO',
    //  custcode='JMDRD',
    //    pisdepslipno='5220189799', 
    //    pisdate='18/07/2025',
    //     bankname='Radiant Cash Management Services Ltd', amount='33272'}

    let parsedData = null;

    console.log(e.data)
    const raw = e.data;
    const isEqualFormat = /(\w+)\s*=\s*'?.+?'?/.test(raw); // ✅ define this

    if (isEqualFormat) {
      let jsonReady = raw.replace(/'/g, '"');
      jsonReady = jsonReady.replace(/(\w+)=/g, '"$1":');

      try {
        parsedData = JSON.parse(jsonReady);
        alert(jsonReady)

      } catch (err) {
        console.error('Failed to parse = format JSON:', err);
      }
    } else {
      try {
        parsedData = JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse : format JSON:', err);
      }
    }


    if (!parsedData) {
      ToastAndroid.showWithGravity(
        'Failed to read QR',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
      return;
    }

    console.log(parsedData, '^^^^^^^^ parsedData');

    if (item.qr_status === 'Radiant' || item.QrStatus === 'Radiant') {
      if (parsedData?.CC === item.qr_value || parsedData?.CC === item.QrValue) {
        const qr_data = [...qrData, parsedData];
        setQrData(qr_data);
        setAmount(parsedData?.Amt || 0);
        setCustomerGeneratedNo(parsedData?.Pis || '');
        setHciSlipNo(parsedData?.Hcl || '');
        setReceived(parsedData?.coll_remarks || '');
        setQR_transid(parsedData?.QR_transid || '');

        const denom = [
          { key: '500', val: parsedData?.['500s'] || 0 },
          { key: '200', val: parsedData?.['200s'] || 0 },
          { key: '100', val: parsedData?.['100s'] || 0 },
          { key: '50', val: parsedData?.['50s'] || 0 },
          { key: '20', val: parsedData?.['20s'] || 0 },
          { key: '10', val: parsedData?.['10s'] || 0 },
          { key: '5', val: parsedData?.['5s'] || 0 },
          { key: 'coins', val: parsedData?.['coins'] || 0 },
        ];

        let total = 0;
        const amountt = parsedData?.Amt || 0;

        denom.forEach((item) => {
          if (isNaN(Number(item.key))) {
            total += Number(item.val);
          } else {
            total += Number(item.key) * Number(item.val);
          }
        });

        const remain = total - amountt;

        setTotal(total);
        setRemain(remain);
        setDenominationData(denom);
      } else {
        ToastAndroid.showWithGravity('Invalid QR', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        return;
      }
    }

    if (item.qr_status === 'Reliance' || item.QrStatus === 'Reliance') {
      if (parsedData?.subdivcode === item.qr_value || parsedData?.subdivcode === item.QrValue) {
        setAmount(
          parsedData?.amount ||
          parsedData?.Amt ||
          parsedData?.pickup_amount ||
          parsedData?.Amount ||
          0
        );

        setCustomerGeneratedNo(parsedData?.pisdepslipno || parsedData?.Pis || '');
        setSlipDate(parsedData?.pisdate || '');
      } else {
        ToastAndroid.showWithGravity('Invalid QR', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        return;
      }
    }

    setIsScan(false);
  };

  const [isload, setIsLoad] = useState(false);

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

  useEffect(() => {
    if (remaining == 0 && amount == total) {
      Keyboard.dismiss(); // Close the keyboard when condition is met
    }
  }, [remaining, amount, total]); // This will trigger whenever any of these values change
  const [IsVisible, setIsVisible] = useState(false)

  const [utr, setUtr] = useState('');
  const [onlineAm, setOnlineAm] = useState('');
  const [Url, setUrl] = useState('')
  const coinsItem = denominationData.find(item => item.key.trim() === 'Coins');
  const getqr = async () => {
    if (!onlineAm || Number(onlineAm) <= 0) {
      ToastAndroid.show('Enter Valid Amount', ToastAndroid.SHORT);
      return;
    }

    if (utr.length > 12) {


      setIsVisible(true);
      return
    }
    setIsLoad(true)
    try {
      const res = await post({ url: APP_URLS.RadiantCashGenrateQR + onlineAm });
      console.log(res);

      const Content = res.Content;

      if (Content.ADDINFO.newUpiLink) {
        setUrl(Content.ADDINFO.newUpiLink);
        setIsVisible(true);
      } else {
        ToastAndroid.show('Something went wrong' + res || 'Something went wrong', ToastAndroid.SHORT);

      }

      setIsLoad(false)

    } catch (err) {
      console.error(err);
      setIsloading2(false)

      ToastAndroid.show('Something went wrong', ToastAndroid.SHORT);
    }
  };

  return (
    <>
      {isScan ? (
        // <QRCodeScanner onRead={onSuccess} />
        ''
      ) : (
        <View style={styles.main}>



          <OnlinePickUpQrSheet
            currentPreviewImageRef={currentPreviewImageRef.current}
            isVisible={IsVisible}
            setIsVisible={setIsVisible}
            url={Url}
            utr={utr}
            setUtr={setUtr}
            am={onlineAm}
            onUpload={handleUpload} />
          <AppBarSecond title={'Cash Pickup Information'}
          // onPressBack={() => {
          //   navigation.navigate('CashPickup',
          //   );}}
          />

          {isload && <ShowLoader />}

          <LinearGradient colors={[colorConfig.primaryColor, colorConfig.secondaryColor,]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
          >
            <View style={[styles.contentContainer,]}>
              <View style={styles.itemContainer}>

                <View>
                  <Text style={styles.cashPickupText}> {item.CustName}</Text>


                  <TouchableOpacity

                  />
                  <View style={styles.numberview}>
                    <Text style={styles.clientCodeText}>No Of Slips:</Text>
                    <Text style={styles.pickupCount}>
                      {`${transactionCount.toString().padStart(2, '0')}`}
                    </Text>
                    <Text style={[styles.clientCodeText, { color: '#66BB6A' }]}>  Submited Slips:</Text>
                    <Text style={[styles.pickupCount, { color: '#66BB6A' }]}>
                      {`${cashPickupData.length.toString().padStart(2, '0')}`}
                    </Text>
                  </View>
                </View>


                <View style={styles.mrgtop}>
                  <RadintPickupSvg size={20} color='#fff' />
                  <Text style={[styles.pickuptext, { marginTop: hScale(3) }]}>{item.Type}</Text>

                </View>
              </View>


            </View>
          </LinearGradient>

          <View style={[styles.header, {
            backgroundColor:
              (amount > 0 && amount === Ramount) ? color1 : '#fff',
            borderWidth: (amount > 0 && amount === Ramount) ? 0 : 5,
            borderColor: `${colorConfig.secondaryColor}80`,


          }]}>
            {(amount > 0 && amount === Ramount) ? null : (<View style={{}}>
              {item?.Captions?.PickupAmount && <View >
                <FlotingInput
                  // editable={!isRelianceQR}
                  keyboardType='numeric'
                  label={item?.Captions?.PickupAmount}
                  value={rctype === 'PrePay' ? amount : amount}
                  onChangeTextCallback={(t) => {

                    setAmount(t);

                    console.error(t > 0)
                    if (t > 0) {
                      setRemark('Pickup Done');
                      setReceived('CASH RECEIVED');
                      setAdditionalRemarks('Successfully PickUp Done')
                    }
                  }}
                  editable={rctype !== 'PrePay'}
                />

                <View style={[styles.righticon2]}>

                  <TouchableOpacity
                    onPress={() => {
                      setIsScan(true)
                    }}
                  >
                    <QrcodAddmoneysvg />

                  </TouchableOpacity>
                </View>
              </View>


              }
              <View>
                <FlotingInput
                  // editable={!isRelianceQR}
                  keyboardType='numeric'
                  label={'Enter Re-Amount'}
                  value={rctype === 'PrePay' ? Ramount : Ramount}
                  onChangeTextCallback={setRAmount}
                  editable={rctype !== 'PrePay'}


                />
                {Ramount > 0 && amount !== Ramount ?
                  <View style={styles.righticon2}>
                    <AlertSvg />
                    <Text style={styles.miss}>Mismatch</Text>
                  </View> : null}
              </View>
            </View>
            )}

            <LinearGradient
              colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.summaryCard}
            >
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Previous Partial Pickup</Text>
                  <Text style={styles.summaryValue}>{totalPartialAmount}</Text>
                </View>

                <View style={styles.boder} />

                <View style={styles.summaryItemCenter}>
                  <Text style={styles.summaryLabel}>Current Partial Pickup</Text>
                  <Text style={styles.summaryValue}>{currentPartialAmount}</Text>
                </View>

                <View style={styles.boder} />

                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Amount</Text>
                  <Text style={[styles.summaryValue, styles.summaryValueHighlight]}>{finalAmount}</Text>
                </View>
              </View>
            </LinearGradient>


            {amount > 0 && amount === Ramount &&

              <View style={[styles.titletotal, { backgroundColor: colorConfig.secondaryColor }]}>
                <View style={styles.headerAmountView}>
                  <Text style={styles.headerLabel}>Pickup Amount</Text>
                  <Text style={styles.headerValue}>{amount}</Text>
                </View>
                <View style={styles.boder} />
                <View style={styles.headerAmountView}>
                  <Text style={styles.headerLabel}>Submitted Amount</Text>
                  <Text style={styles.headerValue}>{total}</Text>
                </View>
                <View style={styles.boder} />

                <View style={styles.headerAmountView}>
                  <Text style={styles.headerLabel}>
                    Remain Amount
                  </Text>
                  <Text style={styles.headerValue}>
                    {remaining == null ? amount : remaining}
                  </Text>
                </View>
                {(remaining === 0 && amount == total) && <View style={[styles.check, { backgroundColor: 'green' }]}>
                  <CheckSvg size={15} />
                </View>}
              </View>}

          </View>
          <ScrollView keyboardShouldPersistTaps={'handled'}>
            <View style={styles.container}>

              {item?.Captions?.GenSlip && sealingTagNo &&
                <FlotingInput
                  autoCapitalize={"characters"}

                  label={item?.Captions?.GenSlip}
                  value={sealingTagNo}

                  onChangeTextCallback={setSealingTagNo}
                />}
              {item?.Captions?.PisHclNo && customerGeneratedNo &&
                <FlotingInput
                  label={item?.Captions?.PisHclNo}
                  // editable={!isRelianceQR}
                  value={customerGeneratedNo}
                  autoCapitalize={"characters"}

                  onChangeTextCallback={setCustomerGeneratedNo}
                />}
              {item?.Captions?.HclNo && hciSlipNo && <FlotingInput
                keyboardType="default"
                label={item?.Captions?.HclNo}
                value={hciSlipNo}
                // editable={!isRelianceQR}
                autoCapitalize={"characters"}

                onChangeTextCallback={setHciSlipNo}
              />}
              {item?.Captions?.RecNo &&
                <FlotingInput
                  label={item?.Captions?.RecNo}
                  value={hsbcDepositSlipNo}
                  onChangeTextCallback={setHsbcDepositSlipNo}
                  autoCapitalize={"characters"}
                  editable={CodeId ? false : true}

                />}

              {item?.Captions?.PisDate &&
                <TouchableOpacity onPress={() => setShowCalender(!isRelianceQR)}>
                  <FlotingInput
                    editable={false}
                    label={item?.Captions?.PisDate}
                    value={slipDate}
                    onChangeTextCallback={setSlipDate}
                  />
                  <View style={[styles.righticon2]}>
                    <Calendarsvg />
                  </View>
                </TouchableOpacity>
              }


              <FlotingInput
                editable={item.ClientCode?.length > 1}
                onPressIn={() => {
                  if (item.ClientCode?.length > 1) {
                    setClientCodeModal(true)
                  }
                }}
                label={'ClientCode'}
                value={clientCode}
              />
              <Text style={styles.denomiamount}>Denomination Amount</Text>
              <Text style={styles.denomiPer}>as per india currency</Text>
              <View>
                <View>

                </View>


                <FlashList
                  data={denominationData}
                  extraData={{ denominationData, CodeId, utr }}
                  nestedScrollEnabled={true}
                  renderItem={renderAmountItem}
                  keyExtractor={(item) => `${item.key} + ${item.val}`}
                  estimatedItemSize={9}
                />
              </View>

              <TouchableOpacity onPress={() => setRemarkVisible(true)}>

                <FlotingInput
                  editable={false}
                  label={'Select Remark ✱'}
                  value={remark}
                  onChangeTextCallback={(text) => {
                    setRemark(text)
                  }}
                />

                <View style={[styles.righticon2]}>
                  <OnelineDropdownSvg />
                </View>
              </TouchableOpacity>

              {remark !== '' && (
                <View>
                  <TouchableOpacity onPress={() => setChildRemarksVisible(true)}>
                    <FlotingInput
                      editable={false}
                      label='Select Child Remark ✱'
                      value={received}
                      onChangeTextCallback={(text) => {
                        setRemark(text)
                      }}
                    />

                    <TouchableOpacity onPress={() => setChildRemarksVisible(true)}
                      style={[styles.righticon2]}
                    >
                      <OnelineDropdownSvg />
                    </TouchableOpacity>
                  </TouchableOpacity>

                  <FlotingInput
                    label='Additional Remarks ✱'
                    value={additionalRemarks}
                    onChangeTextCallback={(text) => {
                      setAdditionalRemarks(text)
                    }}
                  />
                </View>
              )}
              <BottomSheet
                isVisible={remarkVisible}
                onBackdropPress={() => setRemarkVisible(false)}
              >
                <View style={styles.centeredView}>
                  <View style={styles.receivedModalContent}>
                    <ScrollView>

                      {remarkList?.map((reason, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.reasonTextContainer}
                          onPress={async () => {
                            setIsLoad(true)

                            await fetchChildRemarkList(reason);
                            setIsLoad(false)

                            setRemark(reason);
                            setRemarkVisible(false);
                          }}>
                          <Text style={styles.reasonText}>{reason}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                  </View>
                </View>
              </BottomSheet>
              <BottomSheet
                isVisible={clientCodeModalVisible}
                onBackdropPress={() => setClientCodeModal(false)}
              >
                <View style={styles.centeredView}>

                  <View style={styles.receivedModalContent}>
                    <ScrollView>

                      {item.ClientCode?.map((code, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.reasonTextContainer}
                          onPress={() => {
                            setClientCode(code)
                            setClientCodeModal(false);
                          }}>
                          <Text style={styles.reasonText}>{code}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                  </View>
                </View>
              </BottomSheet>
              <Modal
                transparent={true}
                animationType="slide"
                visible={childRemarksVisible}
                onRequestClose={() => setChildRemarksVisible(false)} >

                <View style={styles.centeredView}>
                  <View style={styles.receivedModalContent}>
                    <ScrollView>
                      {childRemarkList?.map((childRemark, index) => (
                        <TouchableOpacity
                          key={index}
                          style={styles.reasonTextContainer}
                          onPress={async () => {
                            setReceived(childRemark);
                            setChildRemarksVisible(false);
                          }}>
                          <Text style={styles.reasonText}>{childRemark}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>

                  </View>
                </View>
              </Modal>

              <Modal
                transparent={true}
                animationType="slide"
                visible={detailsModalVisible}
              >
                <View style={styles.modalContainer}>
                  <View style={styles.detailmodalContent}>
                    <Text style={styles.modalTitle}>{`Radiant Sandesh`}</Text>
                    <Text style={styles.modalLabel}>
                      {transactionCount > 1
                        ? `${cashPickupData.length} of ${transactionCount} receipts submitted. Are you sure you want to submit?`
                        : 'Are you sure you want to submit?'}
                    </Text>
                    <View style={styles.modalButtons}>
                      <TouchableOpacity style={[styles.modalButton, { borderColor: `${colorConfig.secondaryColor}80`, borderWidth: 1 }]} onPress={handleCancelPress}>
                        <Text style={[styles.modalButtonText,]}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[styles.modalButton, { backgroundColor: colorConfig.secondaryColor, }]}
                        onPress={handleSubmit}>
                        <Text style={[styles.modalButtonText, { color: '#fff' }]}>Confirm And Submit</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </Modal>
              {(!CodeId || onlineAm) && <TouchableOpacity onPress={handleUpload} >
                <FlotingInput
                  editable={false}
                  label={onlineAm ? 'Upload Payment Proof' : 'Pickup Slip Upload'}
                />

                <View style={[styles.righticon2]}>
                  <LottieView
                    autoPlay={true}
                    loop={true}
                    style={styles.lotiimg}
                    source={
                      currentPreviewImage ?
                        require('../../../utils/lottieIcons/View-Docs.json')
                        : require('../../../utils/lottieIcons/upload-file.json')}
                  />
                </View>

              </TouchableOpacity>}

              {isLoading2 && <ShowLoader />}
              <DynamicButton

                onPress={async () => {
                  setIsloading2(true);

                  handlePickupData();
                  console.error(item.OtpDay)
                  if (isotpSended) {

                    handleSubmit();
                  }


                }}
                title={isLoading2 ? <ActivityIndicator size={'large'}
                  color={colorConfig.labelColor} /> : 'Submit'}
                styleoveride={undefined} />
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

              <VerifyMobileNumber
                isCpin={item.OtpDay === ""}
                handleSubmit={async (text) => {
                  if (item.OtpDay === "") {
                    console.log('**CALLED1234')
                    if (text === item.PinNo) {
                      submitCashPickupRequest();
                      setMobilemodel(false);
                    }
                    else {
                      console.log('**CALLED12342')
                      ToastAndroid.showWithGravity(
                        'Invalid Pin',
                        ToastAndroid.SHORT,
                        ToastAndroid.BOTTOM
                      );

                    }
                    return;
                  }
                  if (item.OtpDay === 'AxisTransaction') {
                    setIsLoad(true)

                    console.log('**CALLED123224')
                    const res = await setRadiantDynamicOtp(item.TransId, text, item.ShopId, amount, item.OtpDay, '', CodeId ? item2.Email : '');

                    if (res) {
                      console.log('**CALLED122234')
                      setClientOtp(res?.Content?.ADDINFO?.otp_pin || '');
                    }
                    closeMobileModal();
                    setIsLoad(false)
                    return;
                  }

                }} visible={mobilemodel} onClose={() => setMobilemodel(false)}
              />

              <OTPModal
                email={item2?.Email || ''}
                setShowOtpModal={setOtpModalVisible}
                disabled={mobileOtp.length !== 4}
                showOtpModal={otpModalVisible}
                setMobileOtp={setMobileOtp}
                verifyOtp={() => {
          setDetailsModalVisible(false);


                  if (clientOtp === mobileOtp) {
                    Keyboard.dismiss();  // Close the keyboard

                    submitCashPickupRequest();
                    setOtpModalVisible(false);
                    return;
                  }

                  ToastAndroid.showWithGravity(
                    'Invalid OTP',
                    ToastAndroid.SHORT,
                    ToastAndroid.BOTTOM
                  );
                }}
              />
              <Modal
                transparent={true}
                animationType="slide"
                visible={modalVisible}

              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <View>

                      <Text style={styles.modalTitle}>Radiant CMS Slip Count</Text>
                      <Text style={styles.modalText}>Enter the number of slips for which you want to fill the details</Text>
                    </View>

                    <FlotingInput
                      label="total receipts"
                      placeholderTextColor="#000"
                      numberOfLines={1}
                      maxLength={1}
                      value={transactionCount}
                      onChangeTextCallback={(count) => {
                        console.warn(modalVisible, transactionCount, count);

                        if (count) {
                          console.warn(modalVisible, transactionCount, count);


                          setModalVisible(false);

                        }
                        setTransactionCount(count);

                      }}
                      keyboardType="numeric"
                      autoFocus={modalVisible} inputstyle={undefined} labelinputstyle={undefined} />

                  </View>
                </View>
              </Modal>


              <BottomSheet
                onBackdropPress={() => setShowCalender(false)}
                isVisible={showCalender}
              >
                <View style={styles.bottomSheetContent}>
                  <CustomCalendar
                    onDateSelected={handleDateChange}
                    maxDate={moment().toDate()}
                  />
                </View>
              </BottomSheet>
              <TimeoutAlertModal
                visible={timeoutModal}
                onOk={handleTimeoutOk}
                onDismiss={handleTimeoutOk}
              />
            </View>
          </ScrollView >
        </View >)}
    </>
  );


};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: {
    paddingHorizontal: wScale(15),
    paddingTop: hScale(10),
    flex: 1,
    paddingBottom: hScale(20)
  },
  contentContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    paddingHorizontal: wScale(10),
    paddingTop: hScale(4)
  },
  pickuptext: { color: '#fff', fontSize: FontSize.tiny, marginTop: hScale(-4) },

  cashPickupText: {
    fontSize: FontSize.large,
    fontWeight: '600',
    color: '#fff',
  },
  bottomSheetContent: {
    alignItems: 'center',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  denomiamount: {
    color: '#000',
    fontSize: FontSize.large,
    fontWeight: 'bold',
    paddingBottom: hScale(0),
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  denomiPer: {
    color: '#000',
    fontSize: FontSize.regular,
    paddingBottom: hScale(10),
    textAlign: 'center',
    textTransform: 'capitalize',
    letterSpacing: 2
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: '65%',
    height: hScale(180),
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: wScale(20),
    justifyContent: 'space-between',
    paddingBottom: 0

  },
  detailmodalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: wScale(20),
    paddingVertical: wScale(24),

    justifyContent: 'space-between',
  },
  modalTitle: {
    color: '#000',
    fontSize: FontSize.large,
    fontWeight: 'bold',
    marginBottom: hScale(10),
    textAlign: 'center'
  },
  modalText: {
    color: '#000',
    marginBottom: hScale(10),
    textAlign: 'justify'

  },
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
    marginRight: wScale(-2),
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
  },
  modalButton: {
    padding: wScale(10),
    marginHorizontal: wScale(5),
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#000',
    fontSize: wScale(14),
    fontWeight: 'bold'
  },
  reasonTextContainer: {
    padding: wScale(10),
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
    paddingHorizontal: wScale(20)
  },
  reasonText: {
    fontSize: FontSize.regular,
    color: '#000',
  },
  centeredView: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    flex: 1,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  receivedModalContent: {
    paddingVertical: hScale(10),
    backgroundColor: 'white',
    borderRadius: 5,
    justifyContent: 'center',
    maxHeight: SCREEN_HEIGHT / 1.2,
    minHeight: SCREEN_HEIGHT / 4,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,

  },
  modalLabel: {
    color: '#000',
    fontSize: FontSize.medium,
    marginVertical: hScale(5),
  },

  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickupCount: {
    color: '#eab676',
    fontSize: FontSize.xSmall,
    marginLeft: wScale(1),
    fontWeight: 'bold'
  },
  mrgtop: {
    alignItems: 'center'
  },
  clientCodeText: {
    color: '#eab676',
    fontSize: wScale(14),
    marginLeft: wScale(3)
  },
  numberview: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: wScale(-3)
  },
  header: {
    paddingHorizontal: wScale(10),
    paddingVertical: hScale(10),
    paddingBottom: hScale(0),
    backgroundColor: '#fff',
    borderTopWidth: 0,
    borderRadius: 10,
    borderTopRightRadius: 0,
    borderTopLeftRadius: 0
  },
  titletotal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hScale(10),
    paddingHorizontal: wScale(5),
    borderRadius: 100,
    paddingVertical: hScale(5)

  },
  check: {
    height: wScale(25),
    width: wScale(25),
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wScale(10)
  },
  title: {
    fontSize: wScale(20),
    fontWeight: 'bold',
    color: '#000'
  },
  lotiimg: {
    height: hScale(44),
    width: wScale(44),
  },
  headerAmountView: {
    flex: 1,
    justifyContent: 'center',

  },

  headerLabel: {
    fontSize: wScale(10),
    textAlign: 'center',
    color: '#fff'
  },
  headerValue: {
    fontSize: wScale(16),
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff'
  },
  boder: {
    height: '100%',
    width: wScale(1),
    backgroundColor: '#fff'
  },
  miss: {
    color: 'red',
    fontSize: wScale(9),
    width: wScale(60),
    textAlign: 'right',
    marginTop: hScale(-4)
  },

  summaryCard: {
    borderRadius: 8,
    paddingHorizontal: 1,
    elevation: 6,
    marginBottom: hScale(10),
  },

  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // backgroundColor:'rgba(0, 0, 0, 0.2)', 
    paddingVertical: hScale(3),
    borderRadius: 8,

  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryItemCenter: {
    flex: 1,
    alignItems: 'center',
  },

  summaryLabel: {
    color: '#fff',
    fontSize: wScale(12),
    opacity: 0.8,
  },

  summaryValue: {
    color: '#fff',
    fontSize: wScale(18),
    fontWeight: '600',
  },

  summaryValueHighlight: {
    color: '#FFD700',

  },



});
export default PicUpScreen;
