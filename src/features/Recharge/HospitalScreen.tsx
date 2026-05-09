import React, { useCallback, useEffect, useState } from 'react';
import {
  TextInput,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Text,
  TouchableOpacity,
  ToastAndroid,
  Alert,
  
} from 'react-native';
import { colors } from '../../utils/styles/theme';
import { SCREEN_HEIGHT, hScale, wScale } from '../../utils/styles/dimensions';
import { FlashList } from '@shopify/flash-list';
import { APP_URLS } from '../../utils/network/urls';
import useAxiosHook from '../../utils/network/AxiosClient';
import { BottomSheet, Card } from '@rneui/base';
import { translate } from '../../utils/languageUtils/I18n';
import { useDeviceInfoHook } from '../../utils/hooks/useDeviceInfoHook';
import { useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import { encrypt } from '../../utils/encryptionUtils';
import FlotingInput from '../drawer/securityPages/FlotingInput';
import DynamicButton from '../drawer/button/DynamicButton';
import RecentHistory from '../../components/RecentHistoryBottomSheet';
import OperatorBottomSheet from '../../components/OperatorBottomSheet';
import Rechargeconfirm from '../../components/Rechargeconfirm';
import { useNavigation } from '@react-navigation/native';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import ShowLoader from '../../components/ShowLoder';
import OnelineDropdownSvg from '../drawer/svgimgcomponents/simpledropdown';
import RecentText from '../../components/RecentText';
import { useLocationHook } from '../../hooks/useLocationHook';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const HospitalScreen = () => {
  const { get, post } = useAxiosHook();
  const [textInput1, setTextInput1] = useState('');
  const [consumerNo, setconsumerNo] = useState(translate(''));
  const [textInput3, setTextInput3] = useState('');
  const [textInput4, setTextInput4] = useState('');
  const [insuranceOptList, setInsuranceOptList] = useState([]);
  const [isOperatorList, setIsOperatorList] = useState(false);
  const [selectedOpt, setselectedOpt] = useState(
    translate('Select Your Operator'),
  );
  const [CustomerID, setCustomerID] = useState('');
  const [amount, setAmount] = useState('');
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [ProceedSheetVisible, setProceedSheetVisible] = useState(false);
  const [GasCylenderBillOPsheet, setGasCylenderBillOPsheet] = useState(false);
  const [maxlen, setMaxLen] = useState(10);
  const [isInfo, setIsinfo] = useState(false);
  const [GasCylenderBillOpt, setGasCylenderBillOpt] = useState(
    translate('Select Your Operator'),
  );
  const [district, setdistrict] = useState('');
  const [DistList, setDistList] = useState([]);
  const [accnumhint, setAccnumhint] = useState('');
  const [accmaxlength, setAccmaxlength] = useState(0);
  const [key2, setKey2] = useState('');
  const [keyType2, setKeyType2] = useState('');
  const [accntvisivility, setAccntvisivility] = useState(false);
  const [firsttexthint, setFirsttexthint] = useState('');
  const [key1, setKey1] = useState('');
  const [keyType1, setKeyType1] = useState('default');
  const [accnumhint2, setAccnumhint2] = useState('');
  const [accmaxlength2, setAccmaxlength2] = useState(0);
  const [key3, setKey3] = useState('');
  const [keyType3, setKeyType3] = useState('');
  const [accntvisivility2, setAccntvisivility2] = useState(false);
  const [datatype, setDataType] = useState('');
  const [maxlength, setMaxLength] = useState();
  const [minlength, setMinLength] = useState();
  const [optional, setOptional] = useState('');
  const [paramname, setParamName] = useState('Customer ID');
  const [values, setValues] = useState('');
  const [regx, setRegx] = useState('');
  const [visibility, setVisibility] = useState(false);
  const [optcode, setOptCode] = useState('');
  const [dueDate, setDueDate] = useState('Date');
  const [CustomerName, setCustomerName] = useState(translate('Consumer No'));
  const [custBal, setCustBal] = useState(translate('Balance'));
  const [Status, setStatus] = useState(translate('Status'));
  const [LoanBillOperator, setLoanBillOperator] = useState('Select Operator');
  const [LoanBillOperators, setLoanBillOperators] = useState([]);

  const [showLoader, setShowLoader] = useState(false);
  const [reqTime, setReqTime] = useState('');
  const [reqId, setReqId] = useState('')
  const [isrecent, setIsrecent] = useState(false);
  const [historylist, setHistorylist] = useState([]);
  const [agencyCode, setAgencyCode] = useState('')
  const [agencyCode2, setAgencyCode2] = useState('')
  useEffect(() => {
    HospitalOpt('Hospital and Pathology');
  }, []);

  const selectOperator = selectedOperator => {
    console.log('Selected Operator:', selectedOperator);
    setselectedOpt(selectedOperator);
    setIsOperatorList(false);
  };
  const navigation = useNavigation<any>();

  useEffect(() => {
    recenttransactions();

  }, []);
  const recenttransactions = async () => {
    try {
      const url = `${APP_URLS.recenttransaction}pageindex=1&pagesize=5&retailerid=${userId}&fromdate=${formattedDate}&todate=${formattedDate}&role=Retailer&rechargeNo=ALL&status=ALL&OperatorName=ALL&portno=ALL`
      console.log(url);
      const response = await get({ url: url })
      console.log('-*************************************', response);

      setHistorylist(response);
      setReqTime(response[0]['Reqesttime']);
      setReqId(response[0]['Request_ID'])

    } catch (error) {
      console.log(error);

    }
  }

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
  const day = ('0' + currentDate.getDate()).slice(-2);

  const formattedDate = `${year}-${month}-${day}`;



  const handleItemPress = item => {
    setAccntvisivility(false);
    setAccntvisivility2(false);

    setDataType('');
    setMaxLen(0);
    setMinLength(0);
    setOptional('');
    setValues('');
    setRegx('');
    console.log(item['OPtCode']);
    setVisibility(false);
    if (!item.customerparams || item.customerparams.length === 0) {
    } else {
      const custparam = item.customerparams;

      setDataType(custparam[0]['dataType']);
      setMaxLength(custparam[0]['maxLength']);
      setMinLength(custparam[0]['minLength']);
      setVisibility(custparam[0]['visibility']);
      setOptional(custparam[0]['optional']);
      setParamName(custparam[0]['paramName']);
      setRegx(custparam[0]['regex']);
      setValues(custparam[0]['values']);

      if (custparam.length === 2) {
        setAccnumhint(custparam[1]['paramName']);
        setAccmaxlength(custparam[1]['maxLength']);
        setKey2(custparam[1]['dataType']);
        setKeyType2(
          custparam[1]['dataType'] === 'ALPHANUMERIC' ? 'default' : 'numeric',
        );
        setAccntvisivility(true);
      } else if (custparam.length === 3) {
        setAccnumhint(custparam[1]['paramName']);
        setAccmaxlength(custparam[1]['maxLength']);
        setAccnumhint2(custparam[2]['paramName']);
        setAccmaxlength2(custparam[2]['maxLength']);
        setKey2(custparam[1]['dataType']);
        setKey3(custparam[2]['dataType']);
        setKeyType2(
          custparam[1]['dataType'] === 'ALPHANUMERIC' ? 'default' : 'numeric',
        );
        setKeyType3(
          custparam[2]['dataType'] === 'ALPHANUMERIC' ? 'default' : 'numeric',
        );
        setAccntvisivility(true);
        setAccntvisivility2(true);
      } else {
        setAccntvisivility(false);
        setAccntvisivility2(false);
      }
    }

    console.log(item);
  };

  const clearState = () => {
    setDataType('');
    setMaxLength(0);
    setMinLength(0);
    setOptional('');
    // setParamName(translate('Consumer Number'));
    setValues('');
    setRegx('');
    setVisibility(false);
    setOptCode('');
    setFirsttexthint('');
    setKey1('');
    setKeyType1('default');
    setAccnumhint('');
    setAccmaxlength(0);
    setKey2('');
    setKeyType2('default');
    setAccnumhint2('');
    setAccmaxlength2(0);
    setKey3('');
    setKeyType3('default');
  };
  const { getNetworkCarrier, getMobileDeviceId, getMobileIp } =
    useDeviceInfoHook();
  const { userId ,Loc_Data} = useSelector((state: RootState) => state.userInfo);
  const { latitude, longitude } = useLocationHook();

  const onRechargePress = useCallback(async () => {
    setShowLoader(true);

    const mobileNetwork = await getNetworkCarrier();
    const ip = await getMobileIp();
    const encryption = await encrypt([
      userId,
      consumerNo,
      optcode,
      amount,
          Loc_Data['latitude'],Loc_Data['longitude'],

      'city',
      'address',
      'postcode',
      mobileNetwork,
      ip,
      '57bea5094fd9082d',
    ]);
    console.log(encryption.encryptedData);

    const rd = encodeURIComponent(encryption.encryptedData[0]);
    const n1 = encodeURIComponent(encryption.encryptedData[1]);
    const ok1 = encodeURIComponent(encryption.encryptedData[2]);
    const amn = amount;
    const ip1 = encodeURIComponent(encryption.encryptedData[10]);
    const em = '57bea5094fd9082d';
    const devtoken = encodeURIComponent(encryption.encryptedData[6]);

    const Latitude = encodeURIComponent(encryption.encryptedData[4]);
    const Longitude = encodeURIComponent(encryption.encryptedData[5]);
    const ModelNo = encodeURIComponent(encryption.encryptedData[11]);
    const City = devtoken;

    const PostalCode = encodeURIComponent(encryption.encryptedData[8]);
    const InternetTYPE = encodeURIComponent(encryption.encryptedData[9]);
    const Addresss = encodeURIComponent(encryption.encryptedData[7]);

    const value1 = encodeURIComponent(encryption.keyEncode);
    const value2 = encodeURIComponent(encryption.ivEncode);

    const url = `${APP_URLS.rechTask}rd=${rd}&n=${n1}&ok=${ok1}&amn=${amn}&pc=${agencyCode}&bu=${agencyCode2}&acno&lt&ip=${ip1}&mc=''&em=${em}&offerprice=''&commAmount=''&Devicetoken=${devtoken}&Latitude=${Latitude}&Longitude=${Longitude}&ModelNo=${ModelNo}&City=${City}&PostalCode=${PostalCode}&InternetTYPE=${InternetTYPE}&Addresss=${Addresss}&value1=${value1}&value2=${value2}`;

    // const res = await post({
    //   url: url,

    // });

    // if (!res.ok) {

    //   if (res['Response'] === 'Success') {
    //     Alert.alert(res['Response'], res['Message'], [{ text: 'OK', onPress: () => { } }]);

    //   } else {
    //     Alert.alert(res['Response'], res['message'], [{ text: 'OK', onPress: () => { } }]);
    //   }

    // } else {

    // }

    // console.log('onRechargePress', res);

    let status, Message;
    try {
      const res = await post({
        url: url,
      });

      if(res.status ==='False'){
        alert(res.message);
        setShowLoader(false);

        return
      }
      console.log(res);
      console.log(status);

      status = res.Response;
      Message = res.Message;
      await recenttransactions();
    } catch (error) {
      console.error("Recharge failed:", error);
      status = "Failed";
      Message = "Recharge failed, please try again";
    }

    setconsumerNo('');
    setselectedOpt('Select Your Operator');
    setAmount('');
    setIsinfo(false)
    setShowLoader(false);

    navigation.navigate('Rechargedetails', {
      mobileNumber: consumerNo ?? '',  // Default to empty string if null or undefined
      Amount: amount ?? 0,             // Default to 0 if null or undefined
      operator: selectedOpt ?? 'N/A',  // Default to 'N/A' if null or undefined
      status: status ?? 'Unknown',    // Default to 'Unknown' if null or undefined
      reqId: reqId ?? '',             // Default to empty string if null or undefined
      reqTime: reqTime ?? new Date().toISOString(),  // Default to current time if null or undefined
      Message: Message ?? 'No message available'  // Default to 'No message available' if null or undefined
    });
    

  }, [
    amount,
    getMobileIp,
    getNetworkCarrier,
    latitude,
    longitude,
    consumerNo,
    optcode,
    post,
    userId,
  ]);
  async function HospitalOpt(opttype) {
    try {
      const url = `${APP_URLS.getDthOperator}${opttype}`;
      const res = await get({
        url: url,
      });
      console.log(res['myprop2Items']);
      setInsuranceOptList(res['myprop2Items']);
    } catch (error) {
      console.error(error);
    }
  }

  async function billInfo() {
    try {
      const config = {
        headers: {
          Authorization: `Bearer`,
        },
      };

      const url = `${APP_URLS.rechargeViewBill}billnumber=${consumerNo}&Operator=${optcode}&billunit=${agencyCode}&ProcessingCycle=''&acno=''&lt=''&ViewBill=Y`;

      const res = await get({ url: url });
      if (res['RESULT'] === 0) {
        const addinfo = res['ADDINFO']
        const billinfoo = addinfo['BillInfo'];
        setDueDate(billinfoo["billDueDate"]);
        setAmount(billinfoo["billAmount"]);
        setCustomerName(billinfoo["customerName"]);
        setCustBal(billinfoo["balance"]);
        setAmount(billinfoo["billAmount"]);
        //setstatus(res["customerStatus"])
      } else {
        Alert.alert(res['ADDINFO'], res['Message'], [{ text: 'OK', onPress: () => { } }]);
      }

      // console.log(":", res);
    } catch (error) { }
  }
  async function ViewbillInfoStatus(optcode) {
    try {
      const url = `${APP_URLS.viewbillstatuscheck}${optcode}`;
      const res = await post({ url: url });

      console.log(':', res);
      const billSts = res['RESULT'];
      if (billSts === 'Y') {
        setIsinfo(true);
      } else {
        setIsinfo(false);
      }
      console.log(':', res);
    } catch (error) { }
  }

  const validateFields = () => {
    if (paramname === 'Consumer ID' || paramname.length === 0 || (accnumhint === 'Registered Mobile Number' && accnumhint === 'UHID')) {
      ToastAndroid.showWithGravity(
        `Please Enter ${paramname}`,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
    } else if (selectedOpt === 'Select Your Operator') {
      ToastAndroid.showWithGravity(
        'Please Select an Operator',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else if (!amount || amount === 'Enter Amount' || parseFloat(amount) <= 0) {
      ToastAndroid.showWithGravity(
        'Please Enter the Recharge Amount',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else if (paramname === 'UHID') {

      ToastAndroid.showWithGravity(
        `Please Enter ${paramname}`,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
    } else {
      setBottomSheetVisible(true);
    }
  };
return (
  <View style={styles.main}>
    <AppBarSecond title={'Hospital Screen'} />

    <KeyboardAwareScrollView
      keyboardShouldPersistTaps={'handled'}
      enableOnAndroid={true}
      extraScrollHeight={100}
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <View style={styles.container}>
        {showLoader && <ShowLoader />}

        {/* Operator Selection */}
        <TouchableOpacity onPress={() => setIsOperatorList(true)}>
          <FlotingInput label={selectedOpt} editable={false} />
          <View style={[styles.righticon2]}>
            <OnelineDropdownSvg />
          </View>
        </TouchableOpacity>

        {/* Dynamic Fields based on Visibility */}
        {accntvisivility && (
          <View>
            <FlotingInput 
              label={accnumhint} 
              onChangeTextCallback={(text) => setAgencyCode(text)}
              value={agencyCode} 
            />
          </View>
        )}

        {accntvisivility2 && (
          <View>
            <FlotingInput 
              label={accnumhint2} 
              onChangeTextCallback={(text) => setAccnumhint2(text)}
              value={accnumhint2} 
            />
            <View style={[styles.righticon2]}>
              <TouchableOpacity>
                <Text style={[styles.infobtntex]}>{translate("Info")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Consumer Number Input with Info Button Logic */}
        <View style={{ position: 'relative' }}>
          <FlotingInput 
            label={paramname} 
            value={consumerNo} 
            onChangeTextCallback={text => {
              const cleanedText = text.replace(/\D/g, "");
              setconsumerNo(cleanedText);
              setIsinfo(cleanedText.length >= 5);
            }}
          />
          <View style={[styles.righticon2]}>
            {isInfo && (
              <TouchableOpacity
                style={styles.infobtn}
                onPress={() => {
                  billInfo();
                  setBottomSheetVisible(true);
                }}
              >
                <Text style={[styles.infobtntex]}>{translate("Info")}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Amount Section */}
        <FlotingInput 
          label={'Enter Amount'}
          maxLength={5}
          value={amount} 
          onChangeTextCallback={text => setAmount(text)}
          keyboardType="number-pad" 
        />

        {/* Primary Action Button */}
        <DynamicButton 
          title={'Next'} 
          onPress={() => { validateFields(); }} 
        />

        {/* Recent History Access */}
        <TouchableOpacity 
          onPress={() => setIsrecent(true)}
          style={styles.recentviewbtn}
        >
          <RecentText />
        </TouchableOpacity>

      </View>
    </KeyboardAwareScrollView>

    {/* Overlays & Modals (Outside ScrollView for better UI performance) */}
    <RecentHistory
      isModalVisible={isrecent}
      setModalVisible={setIsrecent}
      historylistdata={historylist}
      onBackdropPress={() => setIsrecent(false)}
    />

    <OperatorBottomSheet
      isModalVisible={isOperatorList}
      operatorData={insuranceOptList}
      selectedOperator={() => { setIsOperatorList(false); }}
      setModalVisible={setIsOperatorList}
      selectOperator={selectOperator}
      setOperatorcode={setOptCode}
      showState={false}
      handleItemPress={(item) => handleItemPress(item)}
    />

    <Rechargeconfirm
      Lottieimg={require('../../utils/lottieIcons/health-report.json')}
      isModalVisible={bottomSheetVisible}
      onBackdropPress={() => setBottomSheetVisible(false)}
      status={Status}
      details={[
        { label: 'User Name', value2: CustomerName },
        { label: 'Customer ID', value: consumerNo },
        { label: 'Due Date', value2: dueDate },
        { label: 'Operator Name', value2: selectedOpt },
        { label: 'Customer Status', value2: Status },
      ]}
      lastlabel={'Transaction Amount'}
      lastvalue={amount}
      onRechargedetails={() => {
        if (!amount || amount === '0') {
          ToastAndroid.showWithGravity(
            `Please Enter Amount`,
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM,
          );
        } else {
          onRechargePress();
          setBottomSheetVisible(false);
          setProceedSheetVisible(true);
        }
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
    paddingHorizontal: wScale(20),
    paddingTop: wScale(30),
    flex: 1
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
  },
  infobtn: {
    alignItems: 'center',
  },
  infobtntex: {
    fontSize: wScale(18),
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: 'green',
    paddingHorizontal: wScale(13),
    paddingVertical: hScale(5),
    borderRadius: 5
  },
  recentviewbtn: {
    alignSelf: 'flex-end',
    flexDirection: 'row'
  },
  recent: {
    color: '#000',
    textAlign: 'right',
    paddingVertical: hScale(10),
  }, 
});

export default HospitalScreen;
