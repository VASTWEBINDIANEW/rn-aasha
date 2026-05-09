import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ToastAndroid,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Button
} from 'react-native';
import { colors } from '../../utils/styles/theme';
import { hScale, wScale } from '../../utils/styles/dimensions';
import { FlashList } from '@shopify/flash-list';
import { APP_URLS } from '../../utils/network/urls';
import useAxiosHook from '../../utils/network/AxiosClient';
import { BottomSheet, Card, Input } from '@rneui/base';
import { translate } from '../../utils/languageUtils/I18n';
import { useDeviceInfoHook } from '../../utils/hooks/useDeviceInfoHook';
import { useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import { encrypt } from '../../utils/encryptionUtils';
import FlotingInput from '../drawer/securityPages/FlotingInput';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import DynamicButton from '../drawer/button/DynamicButton';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { useNavigation } from '@react-navigation/native';
import ClosseModalSvg from '../drawer/svgimgcomponents/ClosseModal';
import DropdownSvg from '../../utils/svgUtils/DropdownSvg';
import OnelineDropdownSvg from '../drawer/svgimgcomponents/simpledropdown';
import OperatorBottomSheet from '../../components/OperatorBottomSheet';
import Rechargeconfirm from '../../components/Rechargeconfirm';
import RecentHistory from '../../components/RecentHistoryBottomSheet';
import { Item } from 'react-native-paper/lib/typescript/components/Drawer/Drawer';
import RecentText from '../../components/RecentText';
import ClosseModalSvg2 from '../drawer/svgimgcomponents/ClosseModal2';
import ShowLoader from '../../components/ShowLoder';
import { useLocationHook } from '../../hooks/useLocationHook';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DthScreen = () => {
  const { colorConfig  ,Loc_Data} = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}20`
  const [showLoader, setShowLoader] = useState(false);

  const [showLoader2, setShowLoader2] = useState(false);
  const { get, post } = useAxiosHook();
  const [textInput1, setTextInput1] = useState('');
  const [consumerNo, setconsumerNo] = useState(translate(''));
  const [insuranceOptList, setInsuranceOptList] = useState([]);
  const [isOperatorList, setIsOperatorList] = useState(false);
  const [selectedOpt, setselectedOpt] = useState(
    translate('Select Your Operator'),
  );
  const [optimg, setOptimg] = useState('');

  const [Amount, setAmount] = useState('');
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [bottomSheetVisible2, setBottomSheetVisible2] = useState(false);
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
  const [dueDate, setDueDate] = useState('N/A');
  const [CustomerName, setCustomerName] = useState('N/A');
  const [custBal, setCustBal] = useState();
  const [monthrecharghe, setmonthrecharge] = useState('N/A');
  const [Status, setStatus] = useState(translate(''));
  const [LoanBillOperator, setLoanBillOperator] = useState('Select Operator');
  const [LoanBillOperators, setLoanBillOperators] = useState([]);
  const [path, setpath] = useState('');
  const [reqTime, setReqTime] = useState('');
  const [reqId, setReqId] = useState('')
  const [historylist, setHistorylist] = useState([]);
  const [isrecent, setIsrecent] = useState(false)

  const navigation = useNavigation<any>();

  useEffect(() => {
    CreditCardOpt('DTH');
  }, []);

  const selectOperator = selectedOperator => {
    console.log('Selected Operator:', selectedOperator);
    setselectedOpt(selectedOperator);
    ViewbillInfoStatus();
    setIsOperatorList(false);
    setOptimg('selectOperatorImage');

  };
  useEffect(() => {
    recenttransactions();

  }, []);

  const heavyrequest = async () => {
    if(!consumerNo){

      ToastAndroid.show('Enter consumerNo',ToastAndroid.BOTTOM)
      return;
    }  
    if(!selectedOpt){
      ToastAndroid.show(`Please ${selectedOpt}`,ToastAndroid.BOTTOM)
      return;
    }
    try {
      const url = `${APP_URLS.heavyrequest}optname=${selectedOpt}&mobileno=${consumerNo}`
      console.log(url);
      const response = await post({ url: url })
      console.log("#########", response);
      if (response === "NOTOK") {
        Alert.alert("Heavy Request failed!!", response, [{ text: 'ok', onPress: () => { } }])
      } else {
        Alert.alert("Heavy Request Success!!", response, [{ text: 'ok', onPress: () => { } }])
      }

    } catch {

    }
  }
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
    setselectedOpt(item['Operatorname']);
    setOptCode(item['OPtCode']);
    setpath(item['path'])

    setAccntvisivility(false);
    setAccntvisivility2(false);

    setDataType('');
    setMaxLen(0);
    setMinLength(0);
    setOptional('');
    //  setParamName('Customer ID');
    setValues('');
    setRegx('');
    console.log(item['OPtCode']);
    console.log(item['Operatorname']);
    setVisibility(false);

    if (!item.customerparams || item.customerparams.length === 0) {
      //clearState();
    } else {
      const custparam = item.customerparams;
console.log(custparam)
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
        setAccntvisivility2(true);
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

  async function CreditCardOpt(opttype) {
    try {
      const url = `${APP_URLS.getDthOperator}${opttype}`;
      const res = await get({
        url: url,
      });
      setpath(res['path'])

      console.log(res['myprop2Items']);
      setInsuranceOptList(res['myprop2Items']);
    } catch (error) {
      console.error(error);
    }
  }


  const { getNetworkCarrier, getMobileDeviceId, getMobileIp } =
    useDeviceInfoHook();
  const { userId } = useSelector((state: RootState) => state.userInfo);
  const { latitude , longitude } = useLocationHook();


  const onRechargePress = useCallback(async () => {

    console.log([

      latitude,longitude,
      userId,
      consumerNo,
      optcode,
      Amount,
      Loc_Data['latitude'],Loc_Data['longitude'],

      'city',
      'address',
      'postcode',
      'mobileNetwork',
      "ip",
      '57bea5094fd9082d',
    ]);
console.log(Loc_Data)
    ;

    setBottomSheetVisible(false);
    setBottomSheetVisible2(false);
    setShowLoader(true);
    let status, Message;
     Message='';
     status="";
    const mobileNetwork = await getNetworkCarrier();
    const ip = await getMobileIp();
    const encryption = await encrypt([
      userId,
      consumerNo,
      optcode,
      Amount,
      Loc_Data['latitude'],Loc_Data['longitude'],

      'city',
      'address',
      'postcode',
      mobileNetwork,
      ip,
      '57bea5094fd9082d',
    ]);
    console.log([
      userId,
      consumerNo,
      optcode,
      Amount,
      latitude ??'0.000',
    longitude??'0.111',
      'city',
      'address',
      'postcode',
      mobileNetwork,
      ip,
      '57bea5094fd9082d',
    ]);

    const rd = encodeURIComponent(encryption.encryptedData[0]);
    const n1 = encodeURIComponent(encryption.encryptedData[1]);
    const ok1 = encodeURIComponent(encryption.encryptedData[2]);
    const amn = Amount;
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

    try {
      const res = await post({
        url: url,
      });
      console.log(res,'******************123');
        if(res.status == 'False'){
              ToastAndroid.showWithGravity(
                res.message,
                ToastAndroid.SHORT,
                ToastAndroid.BOTTOM
              );
              setShowLoader(false);
              return;
            }
      status = res.Response;
      Message = res.Message;
      await recenttransactions();
    } catch (error) {
      console.error("Recharge failed:", error);
      status = "Failed";
      Message = "Recharge failed, please try again";
    }

    navigation.navigate('Rechargedetails', {
      mobileNumber: consumerNo ?? '',        // Default to an empty string if null or undefined
      Amount: Amount ?? 0,                   // Default to 0 if Amount is null or undefined
      operator: selectedOpt ?? 'N/A',        // Default to 'N/A' if selectedOpt is null or undefined
      status: status ?? 'Unknown',          // Default to 'Unknown' if status is null or undefined
      id: reqId ?? '',                       // Default to an empty string if reqId is null or undefined
      reqTime: reqTime ?? new Date().toISOString(),  // Default to current time if reqTime is null or undefined
      Message: Message ?? 'No message available'     // Default to 'No message available' if Message is null or undefined
    });
    

    


    navigation.navigate("Rechargedetails", {
      Amount,
      operator:selectedOpt,
      mobileNumber:consumerNo,
      status: status || 'Unknown',
      reqTime: reqTime || 'N/A',
      Message: Message || 'No message',
      reqId: reqId || 'N/A',
    });
    // if (!res.ok) {
    //   Alert.alert(res['Response'], res['Message'], [{ text: 'OK', onPress: () => { } }]);

    // }
    setconsumerNo('');
    setselectedOpt('Select Your Operator');
    setAmount('');
    setIsinfo(false)
    setShowLoader(false);
    Message()

  }, [
    Amount,
    getMobileIp,
    getNetworkCarrier,
    latitude,
    longitude,
    consumerNo,
    optcode,
    post,
    userId,
  ]);
  const [modalVisible, setModalVisible] = useState(false);
  const [billDetails, setBillDetails] = useState([]);
  const [monthlyRecharge, setMonthlyRecharge] = useState('');
  const [status, setstatus] = useState();
  async function billInfo() {
    setStatus("");
    console.log(selectedOpt, consumerNo);

    try {
      // Construct the URL for the API request
      const url = `${APP_URLS.getdthCustomerInfo}optname=${selectedOpt}&mobileno=${consumerNo}`;
      const res = await post({ url: url });

      setStatus(res['status']);
      console.log('Request URL:', url);
      console.log('res URL:', res);
      setShowLoader2(false)
      if(res.status ==='Failed'){
        ToastAndroid.show('try after sometime !!!' ,ToastAndroid.BOTTOM);
        setShowLoader2(false);
return;
      }
if(res.Message =='An error has occurred.'){
ToastAndroid.show(res.Message,ToastAndroid.BOTTOM)
setShowLoader2(false)

}
      if (APP_URLS.AppName === 'Recharge Drishti') {
        if (res && res['status'] === 'SUCCESS') {
          // If successful, set the customer data

          // Check if res.Response.packages is defined and is an array
          const packages = Array.isArray(res.Response.packages) ? res.Response.packages.join(", ") : "No packages available";

          const message = `
          Name:   ${res.Response.name}
          RMN:   ${res.Response.RMN}
          Balance:   ₹${res.Response.balance}
          Last Recharge Amount:   ₹${res.Response.lastRechargeAmount || 0}
          Last Recharge Date:   ${res.Response.lastRechargeDate || 0}
          Monthly Recharge:   ₹${res.Response.monthlyRecharge}
          Next Recharge Date:   ${res.Response.nextRechargeDate}
          Packages:   ${packages}
          Status:   ${res.Response.status ? 'Active' : 'Inactive'}
        `;
          console.log(res.Response.monthlyRecharge, '**********************')
          // Set monthlyRecharge value from the response
          setMonthlyRecharge(res.Response.monthlyRecharge.toString());
          setAmount(res.Response.monthlyRecharge.toString());
          // Show the modal and set details
          setBottomSheetVisible2(true);
          setBillDetails(res?.Response);

          setShowLoader2(false);



        } else {
          // Handle failure scenario
          setStatus('Failed');
          setShowLoader2(false);

          const response = res.Response ? JSON.parse(res.Response) : res; // Handle case where Response might be stringified
          console.log(response)
          ToastAndroid.showWithGravity(
            response.message || response.status,
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM,
          );
        }
      } else {
        if (res && res['status'] === 'SUCCESS') {
          // If successful, set the customer data
          setCustomerName(res['customerName']);
          setCustBal(res['balance']);
          setmonthrecharge(res['monthlyRecharge']);
          setStatus(res['customerStatus'] || res['customerStatus']);
          console.log('Balance:', res['balance']);
          setDueDate(res['rechargedueDate']||'')

          setBottomSheetVisible(true);
          setShowLoader2(false);
        } else {
          setStatus('Failed');
          setShowLoader2(false);

          ToastAndroid.showWithGravity(
            res['Response'].Response || res['Response'] ,
            ToastAndroid.SHORT,
            ToastAndroid.BOTTOM,
          );
        }
      }
      setShowLoader(false)

    } catch (error) {
      console.error('Error fetching bill info:', error);
      setShowLoader2(false); // Hide loader in case of error
      ToastAndroid.showWithGravity(
        error.message || 'Something went wrong.',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    }
  }



  async function ViewbillInfoStatus() {
    console.log(optcode);
    try {
      const config = {};
      const data = {
        Operatorcode: optcode,
      };
      const url = `${APP_URLS.viewbillstatuscheck}${optcode}`;
      const res = await post({ url: url, });
      console.log(':', url);
      const billSts = res['RESULT'];
      if (billSts === 'Y') {
        setIsinfo(true);

      } else {
        // setIsinfo(false);
      }
      console.log(':', res);
    } catch (error) { }
  }

  const validateFields = () => {
    if (!paramname) {
      ToastAndroid.showWithGravity(
        `Please Enter ${paramname}'`,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );

    } else if (selectedOpt === 'Select Your Operator') {
      ToastAndroid.showWithGravity(
        'Please Select an Operator',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else if (!Amount || Amount === 'Enter Amount' || parseFloat(Amount) <= 0) {
      ToastAndroid.showWithGravity(
        'Please Enter the Recharge Amount',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else {
      setBottomSheetVisible(true);
      // billInfo();

    }
  };
  return (
    <View style={styles.main}>
      <AppBarSecond
        title='Dth Recharge'
        onActionPress={undefined}
        actionButton={undefined}
        onPressBack={undefined}
      />

      <View style={styles.container}>
        {showLoader && (
          // <ActivityIndicator
          //   size={wScale(60)}
          //   color={colors.black}
          //   style={styles.loaderStyle}
          // />
          <ShowLoader/>
        )}
        <TouchableOpacity onPress={() => setIsOperatorList(true)}>

          <FlotingInput label={selectedOpt}
            editable={false}
            onChangeTextCallback={text => setTextInput1(text)}
          // value={selectedOpt}
          />
          <View style={[styles.righticon2,]}>
            {selectedOpt === 'Select Your Operator' ? (
              <OnelineDropdownSvg />
            ) : (
              path === null ? (
                <OnelineDropdownSvg />

              ) : (

                <Image style={styles.rightimg} source={{ uri: optimg }} />

              )
            )}

          </View>
        </TouchableOpacity>
        <View>
          <FlotingInput label={paramname}
             maxLength={12}
            autoCapitalize='characters'

            onChangeTextCallback={text => {
              setconsumerNo(text)
              if (text.length >= 5) {
                setIsinfo(true)
              } else {
                setIsinfo(false)
              }

            }
            }
            value={consumerNo}

          />
          <View style={[styles.righticon2,]}>
            {isInfo && (
              <TouchableOpacity
                style={styles.infobtn}
                onPress={() => {
                  ViewbillInfoStatus();
                  setShowLoader2(true);
                  billInfo()
                }}>
                {
                  showLoader2 ? <ActivityIndicator size={'large'} /> : <Text style={[styles.infobtntex,]}>{translate("Info")}</Text>
                }
              </TouchableOpacity>
            )}
          </View>
        </View>

        <OperatorBottomSheet
          isModalVisible={isOperatorList}
          operatorData={insuranceOptList}
          // stateData={stateList}
          selectedOperator={() => { selectedOpt; setIsOperatorList(false) }}
          setModalVisible={setIsOperatorList}
          selectOperator={selectOperator}
          setOperatorcode={setOptCode}
          showState={false}
          selectOperatorImage={setOptimg}
          handleItemPress={(item) => { handleItemPress(item) }}
        />

        <FlotingInput label={'Enter Amount'}
             maxLength={5}
             
          keyboardType="number-pad"
          value={Amount}
          onChangeTextCallback={text =>

            setAmount(text)}

        />
        <DynamicButton title={'Procced'} onPress={() => {

          validateFields()

        }} />

        <View >
          <RecentHistory
            isModalVisible={isrecent}
            setModalVisible={setIsrecent}
            historylistdata={historylist}
            onBackdropPress={() => setIsrecent(false)} />
          <TouchableOpacity onPress={() => {
            setIsrecent(true);
          }}
            style={styles.recentviewbtn}>
            <RecentText />

          </TouchableOpacity>
        </View>
          {APP_URLS.AppName =='Recharge Drishti'&&<View style={{ backgroundColor: 'white', alignItems: 'center', marginTop: 10 }}>
          <View style={{ backgroundColor: 'lightblue', alignItems: 'center', height: 50, width: 120, justifyContent: 'center', }}>
            <TouchableOpacity onPress={() => { heavyrequest() }}>
              <Text style={{ color: 'black', alignItems: 'center', fontWeight: 'bold' }}>{translate("Heavy_Request")}</Text>
            </TouchableOpacity>
          </View>
        </View>}
        <Rechargeconfirm
        setAmount={(t)=>console.log(t)}
          isModalVisible={bottomSheetVisible}
          onBackdropPress={() => setBottomSheetVisible(false)}
          status={Status}
          // setAmount={(text) => {
          //   //setAmount(text);
          //   setmonthrecharge(text); // ✅
          // }}
          details={[
            { label: 'User Name', value2: CustomerName === '' ? 'N/A' : CustomerName },
            { label: 'Customer ID', value: consumerNo },
            { label: 'Due Date', value2: dueDate === '' ? 'N/A' : dueDate },

            { label: 'Operator Name', value2: selectedOpt },
            { label: 'Customer Status', value2: Status === '' ? 'N/A' : Status },
            { label: 'Balance', value2: custBal === 0 ? 'N/A' : custBal },
          ]}

          lastlabel={'Transaction Amount'}
          lastvalue={ Amount || monthrecharghe }
          onRechargedetails={() => {

            if (monthrecharghe === '0' && Amount === '0') {
              console.log(Amount, '**********', monthrecharghe);
            
              ToastAndroid.showWithGravity(
                'Please Enter Amount',
                ToastAndroid.SHORT,
                ToastAndroid.BOTTOM,
              );
            } else {
              onRechargePress();
            }
          }
          }
          Lottieimg={require('../../utils/lottieIcons/satellite.json')}

        // isLoading2={isLoading2}
        />
        <View style={{ flex: 1, backgroundColor: '#fff' }}>
          {/* <BillInfoBottomSheet
            visible={bottomSheetVisible2}
            onClose={() => setBottomSheetVisible2(false)} // Close the BottomSheet
            monthlyRecharge={monthlyRecharge}
            setMonthlyRecharge={setMonthlyRecharge}
            billDetails={billDetails}
          /> */}
          <BottomSheet animationType="none"  
            onBackdropPress={() => { setBottomSheetVisible2(false) }}
            isVisible={bottomSheetVisible2}
            containerStyle={{ paddingHorizontal: wScale(5) }}
          >

            <View style={{
              backgroundColor: '#fff', flex: 1, borderTopRightRadius: 5,
              borderTopStartRadius: 5
            }}>
              <View style={[styles.header, { backgroundColor: color1 }]}>
                <Text style={styles.title}>{selectedOpt}{translate('bill info')}</Text>
                <TouchableOpacity onPress={() => setBottomSheetVisible2(false)}>

                  <ClosseModalSvg2 size={40} />
                </TouchableOpacity>

              </View>
              <View style={{ padding: hScale(6) }}>
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                  <Text style={{ color: 'black', fontWeight: 'bold', width: '40%' }}>{translate("Name")}</Text>
                  <Text style={{ color: 'black', width: '60%' }}>{billDetails.name}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                  <Text style={{ color: 'black', fontWeight: 'bold', width: '40%' }}>{translate("RMN")}</Text>
                  <Text style={{ color: 'black', width: '60%' }}>{billDetails.RMN}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                  <Text style={{ color: 'black', fontWeight: 'bold', width: '40%' }}>{translate("Balance")}</Text>
                  <Text style={{ color: 'black', width: '60%' }}>₹{billDetails.balance}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                  <Text style={{ color: 'black', fontWeight: 'bold', width: '40%' }}>{translate("Last_Recharge_Amount")}</Text>
                  <Text style={{ color: 'black', width: '60%' }}>₹{billDetails.lastRechargeAmount}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                  <Text style={{ color: 'black', fontWeight: 'bold', width: '40%' }}>{translate("Last_Recharge_Date")}</Text>
                  <Text style={{ color: 'black', width: '60%' }}>{billDetails.lastRechargeDate}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                  <Text style={{ color: 'black', fontWeight: 'bold', width: '40%' }}>{translate("Next_Recharge_Date")}</Text>
                  <Text style={{ color: 'black', width: '60%' }}>{billDetails.nextRechargeDate}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                  <Text style={{ color: 'black', fontWeight: 'bold', width: '40%' }}>{translate("Packages")}</Text>
                  <Text style={{ color: 'black', width: '60%' }}>{billDetails.packages}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                  <Text style={{ color: 'black', fontWeight: 'bold', width: '40%' }}>{translate("Status")}</Text>
                  <Text style={{ color: 'black', width: '60%' }}>{billDetails.status ? 'Active' : ' Inactive'}</Text>
                </View>

                <TextInput
                  value={monthlyRecharge}
                  onChangeText={(text) => {
                    setMonthlyRecharge(text);
                    setAmount(text);
                  }} keyboardType="number-pad"
                  containerStyle={{ marginBottom: 20 }}
                  label={"Amount"}
                  style={{
                    borderColor: colorConfig.primaryColor,
                    borderWidth: 1,  // You need to specify borderWidth to make the border visible
                    borderRadius: 5, // More typical for rounded corners
                    paddingLeft: 10, // Optional, adds space inside the TextInput
                    height: 40, // Optional, adjusts height for better visibility
                  }}

                />
              </View>

              <TouchableOpacity
                style={{
                  marginBottom: 10,
                  backgroundColor: colorConfig.primaryColor,  // Green background color
                  paddingVertical: 10,          // Vertical padding for height
                  paddingHorizontal: 30,        // Horizontal padding for width
                  borderRadius: 10,             // Rounded corners for smooth edges
                  alignItems: 'center',         // Center the text horizontally
                  justifyContent: 'center',     // Center the text vertically
                  shadowColor: '#000',          // Shadow color for iOS
                  shadowOffset: { width: 0, height: 4 },  // Shadow direction for iOS
                  shadowOpacity: 0.1,           // Shadow transparency for iOS
                  shadowRadius: 4,              // Shadow radius for iOS
                  elevation: 5,                 // Shadow for Android
                }}
                onPress={() => {

                  if (Amount === '0' || monthlyRecharge === '') {

                    console.log(Amount)
                    ToastAndroid.showWithGravity(
                      `Please Enter Amount`,
                      ToastAndroid.SHORT,
                      ToastAndroid.BOTTOM,
                    );
                  } else { onRechargePress() } console.log('Confirm and Pay pressed');
                }}
              >
                <Text style={{
                  color: '#fff',                // White text color
                  fontSize: 18,                 // Font size for the text
                  fontWeight: 'bold',           // Bold text for emphasis
                }}>
                  {translate('Confirm and Pay')}
                </Text>
              </TouchableOpacity>

            </View>
          </BottomSheet>
        </View>



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
    flex: 1,
    paddingTop: hScale(30)
  },

  righticon2: {
    position: 'absolute',
    left: 'auto',
    right: wScale(0),
    top: hScale(0),
    height: '80%',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: wScale(12),
    //backgroundColor:'red'
  },
  infobtn: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  infobtntex: {
    fontSize: wScale(18),
    fontWeight: 'bold',
    color: '#fff',
    backgroundColor: 'green',
    paddingHorizontal: wScale(13),
    paddingVertical: hScale(5),
    borderRadius: 5,

  },

  rightimg: {
    height: wScale(45),
    width: wScale(45)
  },
  recentviewbtn: {
    alignSelf: 'flex-end',
    flexDirection: 'row'
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  textInput: {
    width: '100%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  loaderStyle: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, zIndex: 999 },
  recent: {
    color: '#000',
    textAlign: 'right',
    paddingVertical: hScale(10),
  },
  header: {
    flexDirection: 'row',
    borderTopRightRadius: 5,
    borderTopStartRadius: 5,
    paddingHorizontal: wScale(5),
    paddingVertical: hScale(2)
  },
  title: {
    color: '#000',
    textAlign: 'center',
    flex: 1,
    fontSize: wScale(20),
    fontWeight: 'bold',
    textAlignVertical: 'center'
  },


});

export default DthScreen;
