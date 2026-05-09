import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ToastAndroid,
  FlatList,
  Alert,
  ActivityIndicator,
  
} from 'react-native';
import { BottomSheet, Card } from '@rneui/themed';
import { translate } from '../../utils/languageUtils/I18n';
import { APP_URLS } from '../../utils/network/urls';
import { colors } from '../../utils/styles/theme';
import useAxiosHook from '../../utils/network/AxiosClient';
import { useDeviceInfoHook } from '../../utils/hooks/useDeviceInfoHook';
import { useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import { useLocationHook } from '../../utils/hooks/useLocationHook';
import { encrypt } from '../../utils/encryptionUtils';
import { hScale, wScale } from '../../utils/styles/dimensions';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import FlotingInput from '../drawer/securityPages/FlotingInput';
import DynamicButton from '../drawer/button/DynamicButton';
import RecentHistory from '../../components/RecentHistoryBottomSheet';
import OperatorBottomSheet from '../../components/OperatorBottomSheet';
import Rechargeconfirm from '../../components/Rechargeconfirm';
import OnelineDropdownSvg from '../drawer/svgimgcomponents/simpledropdown';
import { useNavigation } from '@react-navigation/native';
import ShowLoader from '../../components/ShowLoder';
import RecentText from '../../components/RecentText';
const LoanScreen = () => {
  const [CustomerID, setCustomerID] = useState('');
  const [amount, setAmount] = useState('');
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [ProceedSheetVisible, setProceedSheetVisible] = useState(false);
  const [LandLineOPSheet, setLandLineOPSheet] = useState(false);
  const [maxLen, setMaxLen] = useState(10);
  const [isInfo, setIsInfo] = useState(false);
  const [FastagOpt, setFastagOpt] = useState(translate('Select Your Operator'));

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
  const [CustomerName, setCustomerName] = useState('N/A');
  const [custBal, setCustBal] = useState(translate('Balance'));
  const [Status, setStatus] = useState(translate('Status'));
  const [LoanBillOperator, setLoanBillOperator] = useState('Select Operator');
  const [LoanBillOperators, setLoanBillOperators] = useState([]);
  const [showLoader2, setShowLoader2] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [reqTime, setReqTime] = useState('');
  const [reqId, setReqId] = useState('')
  const [isrecent, setIsrecent] = useState(false);
  const [historylist, setHistorylist] = useState([]);
  const { get, post } = useAxiosHook();
  useEffect(() => {
    getLoanBillOperators();
  }, []);
  const navigation = useNavigation<any>();

  const selectOperator = selectedOperator => {
    console.log('Selected Operator:', selectedOperator);
    setFastagOpt(selectedOperator);
    setLandLineOPSheet(false);
  };

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

  async function getLoanBillOperators() {
    try {
      const token = await APP_URLS.getToke;
      const url = `${APP_URLS.getDthOperator}Loan`;
      const response = await get({ url: url });
      setLoanBillOperators(response['myprop2Items']);
      console.log(url);
    } catch (e) {
      console.error(e);
    }
  }
  const { getNetworkCarrier, getMobileDeviceId, getMobileIp } =
    useDeviceInfoHook();
  const { userId ,Loc_Data} = useSelector((state: RootState) => state.userInfo);
  const { latitude, longitude } = useLocationHook();

 
  const onRechargePress = useCallback(async () => {

    
    setProceedSheetVisible(false);
    setShowLoader(true)

    const mobileNetwork = await getNetworkCarrier();
    const ip = await getMobileIp();
    const encryption = await encrypt([
      userId,
      paramname,
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

    const url = `${APP_URLS.rechTask}rd=${rd}&n=${n1}&ok=${ok1}&amn=${amn}&pc=${accnumhint}&bu=${accnumhint2}&acno&lt&ip=${ip1}&mc&em=${em}&offerprice&commAmount&Devicetoken=${devtoken}&Latitude=${Latitude}&Longitude=${Longitude}&ModelNo=${ModelNo}&City=${City}&PostalCode=${PostalCode}&InternetTYPE=${InternetTYPE}&Addresss=${Addresss}&value1=${value1}&value2=${value2}`;
    let status, Message;
    try {
      const res = await post({
        url: url,
      });
      console.log(res);
      console.log(status);
      if(res.status ==='False'){
        alert(res.message);
        setShowLoader(false);

        return
      }
      status = res.Response;
      Message = res.Message;
      await recenttransactions();
    } catch (error) {
      console.error("Recharge failed:", error);
      status = "Failed";
      Message = "Recharge failed, please try again";
    }

    setCustomerID('');
    setFastagOpt('Select Your Operator');
    setAmount('');
    setIsInfo(false)
    setShowLoader(false);

    navigation.navigate('Rechargedetails', {
      mobileNumber: CustomerID ?? '',
      Amount: amount ?? 0,
      operator: FastagOpt ?? 'N/A',
      status: status ?? 'Unknown',
      reqId: reqId ?? '',
      reqTime: reqTime ?? new Date().toISOString(),
      Message: Message ?? 'No message available'
    });
    

  }, [
    amount,
    getMobileIp,
    getNetworkCarrier,
    latitude,
    longitude,
    paramname,
    optcode,
    post,
    userId,
  ]);
  async function billInfo() {
    try {
      const url = `${APP_URLS.rechargeViewBill}billnumber=${CustomerID}&Operator=${optcode}&billunit=&ProcessingCycle=&acno=&lt=&ViewBill=Y`;
      console.log(url)
      const res = await get({ url: url });
      console.log('"""""""""""url', res);

      const result = res["RESULT"];
      console.log('"""""""""""url',result)
      const resp = res["ADDINFO"];
      console.log('"""""""""""url',resp)
      console.log(res);
      if (result === '0') {
        // if (res['RESULT'] === 0) {

        const billinfo = resp['BillInfo'];
        setDueDate(billinfo['billDueDate']);
        setAmount(billinfo['billAmount']);
        setCustomerName(billinfo['customerName']);
        setCustBal(billinfo['balance']);
        setStatus(billinfo['customerStatus']);
        setProceedSheetVisible(true);

      }else{
        ToastAndroid.show(resp.Message || "No message available", ToastAndroid.CENTER);
      }
    } catch (error) {
      console.error(error);
    }
  }



  const handlePayPress = () => {
    if
      (FastagOpt === 'Select Your Operator') {
      ToastAndroid.show(
        'Please Select an Operator',
        ToastAndroid.SHORT,
      );
    } else if (!CustomerID) {
      ToastAndroid.showWithGravity(
        `Please Enter ${paramname}`,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else if (!amount || amount === 'Enter Amount' || amount === '0' || parseFloat(amount) <= 0) {
      ToastAndroid.showWithGravity(
        'Please Enter the Recharge Amount',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );

    } else {
      billInfo();
      setProceedSheetVisible(true);
    }
  };
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
  const handleItemPress = async item => {
    setLandLineOPSheet(false);

    setFastagOpt(item['Operatorname']);
    setLoanBillOperator(item['Operatorname']);
    await setOptCode(item['OPtCode']);

    setDataType('');
    setMaxLength(0);
    setMinLength(0);
    setOptional('');
    setParamName('Customer ID');
    setValues('');
    setRegx('');
    setVisibility(false);
    ViewbillInfoStatus(item['OPtCode']);
    if (!item.customerparams || item.customerparams.length === 0) {
      clearState();
    } else {
      const custparam = item.customerparams;

      setDataType(custparam[0]['dataType']);
      setMaxLength(custparam[0]['maxLength']);
      setMinLength(custparam[0]['minLength']);
      setVisibility(custparam[0]['visibility']);
      setOptional(custparam[0]['optional']);
      setParamName(custparam[0]['paramName']);
      setOptCode(item['OPtCode']);
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
        setAccntvisivility2(false);
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

      setLandLineOPSheet(false);
    }

    console.log(item);
  };

  const clearState = () => {
    setDataType('');
    setMaxLength(0);
    setMinLength(0);
    setOptional('');
    setParamName('');
    setValues('');
    setRegx('');
    setVisibility(false);
    setOptCode('');
    setFastagOpt(translate('Select Your Operator'));

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
  const [viewbillStatus, setviewbillStatus] = useState('');
  const handleInfoPress = () => {
    billInfo();
    if (!CustomerID) {
      ToastAndroid.show(`Please enter ${paramname}`, ToastAndroid.SHORT);
    } else if (viewbillStatus === 'Y') {
      setBottomSheetVisible(true);
      /*  
      setBottomSheetVisible(true); */
    } else {
      setBottomSheetVisible(true);
    }
  };

  async function ViewbillInfoStatus({ code }) {
    try {

      const url = `${APP_URLS.viewbillstatuscheck}${code}`;
      const res = await post({ url: url, });
      setviewbillStatus(res['RESULT']);
      console.log(':', url);
    } catch (error) { }
  }
  const handleCloseBottomSheet = () => {
    setBottomSheetVisible(false);
  };

  const handleTextChange = text => {
    setCustomerID(text);
  };

  return (
    <View style={styles.main}>
      <AppBarSecond title={'Loan Screen'} />

      <View style={styles.container}>
        {showLoader && (
          <ShowLoader />
        )}
        <TouchableOpacity
          style={{}}
          onPress={() => {
            setLandLineOPSheet(true);
          }}>
          {/* <View style={styles.input}>
            <View style={styles.circularElement}>
              <LottieView
                autoPlay={true}
                loop={true}
                style={{ flex: 1, height: 35, width: 35 }}
                source={require('../../utils/lottieIcons/select 3.json')}
              />
            </View>
            <View style={{ width: '73%' }}>
              <Text>{FastagOpt}</Text>
            </View>
          </View> */}
          <FlotingInput label={FastagOpt} editable={false} />
          <View style={[styles.righticon2]}>

            <OnelineDropdownSvg />

          </View>
        </TouchableOpacity>
        <View>
          <FlotingInput label={paramname} value={CustomerID}

            onChangeTextCallback={text => {
              setCustomerID(text);
              if (text.length >= 5) {
                setIsInfo(true)
              } else {
                setIsInfo(false)
              }
            }} />
          <View style={[styles.righticon2,]}>
            {isInfo && (
              <TouchableOpacity
                style={styles.infobtn}

                onPress={() => { billInfo() }}
              >
                {
                  showLoader2 ? <ActivityIndicator size={'large'} /> : <Text style={[styles.infobtntex,]}>{translate("Info")}</Text>

                }
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* <View style={styles.input}>
          <View style={styles.circularElement}>
            <LottieView
              autoPlay={true}
              loop={true}
              style={{ flex: 1, height: 35, width: 35 }}
              source={require('../../utils/lottieIcons/user.json')}
            />
          </View>
          <TextInput
            style={styles.textInput}
            placeholder={paramname}
            value={CustomerID}
            keyboardType="number-pad"
            onChangeText={text => setCustomerID(text)}
            
          />
          <TouchableOpacity style={styles.infoButton} onPress={handleInfoPress}>
            <LottieView
              style={{ height: 35, width: 35 }}
              source={require('../../utils/lottieIcons/Ask 2.json')}
            />      
          </TouchableOpacity>
        </View> */}

        {accntvisivility === true ? (


          < FlotingInput label={accnumhint} onChangeTextCallback={(text) => console.log(text)}
            value={accnumhint2} maxLength={accmaxlength} />
        ) : null}

        {accntvisivility2 && (


          <View >

            <FlotingInput label={accnumhint2} onChangeTextCallback={(text) => setAccnumhint2(text)}
              value={accnumhint2} maxLength={accmaxlength2}

            />
            <View style={[styles.righticon2]}>
              <TouchableOpacity>

                <Text style={[styles.infobtntex,]}>{translate("Info")}</Text>
              </TouchableOpacity>

            </View>

          </View>
        )}

        <FlotingInput label={'Enter Amount'}
             maxLength={5}
              value={amount} keyboardType="number-pad"
          onChangeTextCallback={text => {
            setAmount(text); 
          }} />



        <DynamicButton title={'Next'} onPress={() => { handlePayPress() }} />
        <View >

          <RecentHistory
            isModalVisible={isrecent}
            setModalVisible={setIsrecent}
            historylistdata={historylist}
            onBackdropPress={() => setIsrecent(false)}

          />
          <TouchableOpacity onPress={() => {
            setIsrecent(true);
          }}
            style={styles.recentviewbtn}>
            <RecentText />
          </TouchableOpacity>
        </View>

        <OperatorBottomSheet
          isModalVisible={LandLineOPSheet}
          operatorData={LoanBillOperators}
          //// stateData={stateList}
          selectedOperator={() => { FastagOpt; setLandLineOPSheet(false) }}
          setModalVisible={setLandLineOPSheet}
          selectOperator={selectOperator}
          setOperatorcode={setOptCode}
          showState={false}
          // selectOperatorImage={setOptimg}
          handleItemPress={(item) => { handleItemPress(item) }}

        />
        <Rechargeconfirm
          Lottieimg={require('../../utils/lottieIcons/loan.json')}
          isModalVisible={ProceedSheetVisible}
          onBackdropPress={() => setProceedSheetVisible(false)}
          status={Status}
          details={[
            { label: 'User Name', value2: CustomerName },
            { label: 'Customer ID', value: CustomerID },
            { label: 'Due Date', value2: dueDate },
            { label: 'Operator Name', value2: FastagOpt },
            { label: 'Customer Status', value2: Status },
            // { label: 'BillAmount', value2: billAmount },

          ]}
          lastlabel={'Transaction Amount'}
          lastvalue={amount}
          onRechargedetails={() => {
            if (amount === '0' || amount === '') {
              ToastAndroid.showWithGravity(
                `Please Enter Amount`,
                ToastAndroid.SHORT,
                ToastAndroid.BOTTOM,
              );
            } else { onRechargePress() }
          }
          }
        />




      </View>
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

export default LoanScreen;
