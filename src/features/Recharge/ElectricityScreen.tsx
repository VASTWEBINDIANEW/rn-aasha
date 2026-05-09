import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  Alert,

} from 'react-native';
import { translate } from '../../utils/languageUtils/I18n';
import { APP_URLS } from '../../utils/network/urls';
import { colors } from '../../utils/styles/theme';
import useAxiosHook from '../../utils/network/AxiosClient';
import { useDeviceInfoHook } from '../../utils/hooks/useDeviceInfoHook';
import { useSelector } from 'react-redux';
import { encrypt } from '../../utils/encryptionUtils';
import { SCREEN_HEIGHT, hScale, wScale } from '../../utils/styles/dimensions';
import { RootState } from '../../reduxUtils/store';
import DynamicButton from '../drawer/button/DynamicButton';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import FlotingInput from '../drawer/securityPages/FlotingInput';
import OnelineDropdownSvg from '../drawer/svgimgcomponents/simpledropdown';
import { ActivityIndicator } from 'react-native';
import ElectricityOperatorBottomSheet from '../../components/ElectricityOperatorBottomSheet';
import Rechargeconfirm from '../../components/Rechargeconfirm';
import { useNavigation } from '@react-navigation/native';
import RecentHistory from '../../components/RecentHistoryBottomSheet';
import ShowLoader from '../../components/ShowLoder';
import RecentText from '../../components/RecentText';
import { useLocationHook } from '../../hooks/useLocationHook';
const ElectricityScreen = () => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo)
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [ProceedSheetVisible, setProceedSheetVisible] = useState(false);
  const [stateOperatorVisible, setOperatorSheetVisible] = useState(false);
  const [stateslist, setstateslist] = useState([]);
  const [opt, setopt] = useState(translate('Select Your Operator'));
  const [CustomerID, setCustomerID] = useState('');
  const [amount, setAmount] = useState('');
  const [acc, setContacts] = useState('');
  const [optcode, setoptcode] = useState('');
  const [dueDate, setDueDate] = useState('N/A');
  const [CustomerName, setCustomerName] = useState('');
  const [custBal, setCustBal] = useState(('N/A'));
  const [Status, setstatus] = useState(translate('Status'));
  const [path, setpath] = useState("");
  const [showLoader2, setShowLoader2] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [billAmount, setbillAmount] = useState('');
  const [maxlen, setMaxLen] = useState(10);
  const [isInfo, setIsinfo] = useState(false);
  const [isOp, setIsop] = useState(false);
  const [operatorList, setoperatorList] = useState([]);
  const [isvisible, setIsvisible] = useState(false);
  
  const [consumerNo, setconsumerNo] = useState(translate(''));

  const [accnumhint, setAccnumhint] = useState('');
  const [accmaxlength, setAccmaxlength] = useState(0);
  const [key2, setKey2] = useState('');
  const [keyType2, setKeyType2] = useState('');
  const [accntvisivility, setAccntvisivility] = useState(false);
  const [firsttexthint, setFirsttexthint] = useState('');
  const [key1, setKey1] = useState('');
  const [keyType1, setKeyType1] = useState('default');
  const [accnumhint2, setAccnumhint2] = useState('hthhhd');
  const [accmaxlength2, setAccmaxlength2] = useState(0);
  const [key3, setKey3] = useState('');
  const [keyType3, setKeyType3] = useState('');
  const [accntvisivility2, setAccntvisivility2] = useState(false);
  const [datatype, setDataType] = useState('');
  const [maxlength, setMaxLength] = useState();
  const [minlength, setMinLength] = useState();
  const [values, setValues] = useState('');
  const [regx, setRegx] = useState('');
  const [visibility, setVisibility] = useState(false);
  const [optional, setOptional] = useState('');
  const [paramname, setParamName] = useState('Customer ID');
  const [isrecent, setIsrecent] = useState(false);
  const [historylist, setHistorylist] = useState([]);
  const [stateName, setStateName] = useState('Select Your State & Operator');
  const [reqTime, setReqTime] = useState('');
  const [reqId, setReqId] = useState('');
  const [agencyCode, setAgencyCode] = useState('');
  const [agencyCode2, setAgencyCode2] = useState('');


  const navigation = useNavigation<any>();
  const { get, post } = useAxiosHook();
 


  useEffect(() => {
    recenttransactions();
  }, [])

  const recenttransactions = async () => {
    try {
      const url = `${APP_URLS.recenttransaction}pageindex=1&pagesize=5&retailerid=${userId}&fromdate=${formattedDate}&todate=${formattedDate}&role=Retailer&rechargeNo=ALL&status=ALL&OperatorName=ALL&portno=ALL`
      const response = await get({ url: url })
      setHistorylist(response)
      setReqTime(response[0]['Reqesttime'])
      setReqId(response[0]['Request_ID'])
    } catch (error) {
    }
  };

  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = ('0 ' + (currentDate.getMonth() + 1)).slice(-2);
  const day = ('0' + (currentDate.getDate())).slice(-2);
  const formattedDate = `${year}-${month}-${day}`;


  async function billInfo() {

    ViewbillInfoStatus()
    try {
      // const url = `${APP_URLS.rechargeViewBill}billnumber=210324010714&Operator=EAV&billunit=Jaipur Vidyut Vitran Nigam - RAJASTHAN&ProcessingCycle&acno&lt&ViewBill=Y`
      const url = `${APP_URLS.rechargeViewBill}billnumber=${consumerNo}&Operator=${optcode}&billunit=${agencyCode}&ProcessingCycle&acno&lt&ViewBill=Y`;
      console.log(url)

      
      const res = await get({ url: url });
      console.log(res, '==============**---*====')
      if (res['RESULT'] === 0) {
        const addinfo = res['ADDINFO']
        const billinfoo = addinfo['BillInfo'];
        setDueDate(billinfoo["billDueDate"]);
        setAmount(billinfoo["billAmount"]);
        setCustomerName(billinfoo["customerName"]);
        setCustBal(billinfoo["balance"]);
        setbillAmount(billinfoo["billAmount"]);
        if (billinfoo["billAmount"]) {
          setAmount(billinfoo["billAmount"]);
        }
        setstatus(res["customerStatus"])
        setShowLoader2(false)
        console.log(res["customerStatus"], '==============**---*====')
        setBottomSheetVisible(true);
      } else {
        setShowLoader2(false)
        Alert.alert(res['ADDINFO']['ERRORMSG'], res['ADDINFO']['Message'], [{ text: 'OK', onPress: () => { } }]);
      }
    } catch (error) { }
  }
  const validateFields = () => {
    if (!paramname) {
      ToastAndroid.showWithGravity(
        `Please Enter ${paramname}'`,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );

    } else if (stateName === 'Select Your State & Operator') {
      ToastAndroid.showWithGravity(
        'Please Select an State',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else if (!amount || amount === 'Enter Amount' || parseFloat(amount) <= 0) {
      ToastAndroid.showWithGravity(
        'Please Enter the Recharge Amount',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else {
      setBottomSheetVisible(true);
    }

  };
  async function ViewbillInfoStatus() {
    try {
      const config = {
        headers: {
          Authorization: `Bearer`,
        },
      };
      const data = {
        Operatorcode: optcode,
      };
      const url = `${APP_URLS.viewbillstatuscheck}${optcode}`;

      console.log(url)
      const res = await post({ url: url, data});
      const billSts = res['RESULT'];
      if (billSts === 'Y') {
        // setIsinfo(true);
      } else {
        //    setIsinfo(false);
      }
    } catch (error) { }
  }



  useEffect(() => {
    stateList();
  }, []);

  async function stateList() {
    try {
      const url = `${APP_URLS.statelist}`;
      const data = await get({  url });

      console.log('====================================');
      console.log(data );
      console.log('====================================');

      
      setstateslist(data );
      return data;
    } catch (error) {
      console.error('Error fetching  state list:', error.message);
      throw error;
    } finally {
    }
  }
  const { getNetworkCarrier, getMobileDeviceId, getMobileIp } =
    useDeviceInfoHook();
  const { userId ,Loc_Data} = useSelector((state: RootState) => state.userInfo);
  const { latitude, longitude } = useLocationHook();

 
  const onRechargePress = useCallback(async () => {

    
    setBottomSheetVisible(false);
    setShowLoader(true);
    const mobileNetwork = await getNetworkCarrier();
    const ip = await getMobileIp();
    const encryption = encrypt([
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

    const url = `${APP_URLS.rechTask}rd=${rd}&n=${n1}&ok=${ok1}&amn=${amn}&pc=${agencyCode}&bu=${agencyCode2}&acno&lt&ip=${ip1}&mc&em=${em}&offerprice&commAmount&Devicetoken=${devtoken}&Latitude=${Latitude}&Longitude=${Longitude}&ModelNo=${ModelNo}&City=${City}&PostalCode=${PostalCode}&InternetTYPE=${InternetTYPE}&Addresss=${Addresss}&value1=${value1}&value2=${value2}&billduedate=${dueDate}`;

    console.log(url, '*-*-*-*')
    let status, Message;
    try {
      const res = await post({
        url: url,
      });
      console.log(res, '*-*-*-*');
      console.log(status, '*-*-*-*');
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

    setconsumerNo('');
    setStateName('Select Your State & Operator');
    setopt('')
    setAmount('');
    setbillAmount('');
    setIsinfo(false)
    setShowLoader(false);

    navigation.navigate('Rechargedetails', {
      mobileNumber: consumerNo ?? '',  // Default to an empty string if null or undefined
      Amount: amount ?? 0,             // Default to 0 if null or undefined
      operator: opt ?? 'N/A',          // Default to 'N/A' if null or undefined
      status: status ?? 'Unknown',     // Default to 'Unknown' if null or undefined
      reqId: reqId ?? '',              // Default to an empty string if null or undefined
      reqTime: reqTime ?? new Date().toISOString(),  // Default to current time if null or undefined
      Message: Message ?? 'No message available'  // Default to 'No message available' if null or undefined
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
  async function GetOptlist(state_id: any) {
     setoperatorList([]);
     setopt('Select Your Operator');
    try {
      const url = `${APP_URLS.electricity_opt_Via_StateId}${state_id}`;
      const dataa = await get({ url });
      console.log(dataa['myprop2Items']);
      console.log('====================================');


      console.log(url);
      console.log(dataa);
      console.log('====================================');
       setoperatorList(dataa['myprop2Items']);
      setpath(dataa["path"]);

      if (operatorList != null) {
        setIsop(true);
      }
      console.log(dataa['myprop2Items'][0]);
      console.log;
      return dataa;
    } catch (error) {
      console.error(':', error.message);
      throw error;
    }
  }
  const handleItemPress = item => {
    console.log(item, 'iiiiiiiiiiiiiiiiiiiiiiii')
    setAccntvisivility(false);
    setAccntvisivility2(false);

    setDataType('');
    setMaxLen(0);
    setMinLength(0);
    setOptional('');
    setValues('');
    setRegx('');
    setVisibility(false);
    if (!item.customerparams || item.customerparams.length === 0) {
    } else {
      const custparam = item.customerparams;

      setDataType(custparam[0]['dataType']);
      setMaxLength(custparam[0]['maxLength']);
      setMinLength(custparam[0]['minLength']);
      setVisibility(custparam[0]['visibility']);
      setOptional(custparam[0]['optional']);
      setParamName(custparam[0]['paramName'] || 'Consumer Number');
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

  };
  return (
    <View style={styles.main}>
      <AppBarSecond
        title='Electricity Rechage'
        onActionPress={undefined}
        actionButton={undefined}
        onPressBack={undefined}
      />
      <View style={styles.container}>
        {showLoader && (

          <ShowLoader />
        )}
        <TouchableOpacity
          onPress={() => {
            setIsvisible(true);
          }}
        >

          <FlotingInput
            label={stateName}
            labelinputstyle={[
              stateName === "Select Your State & Operator"
                ? null
                : styles.labelinputstyle,
            ]}
            editable={false}
          />
          {opt === "Select Your Operator" ? null : (
            <Text style={[styles.circletext, { color: colorConfig.primaryColor }]}>
              {opt}
            </Text>
          )}

          <View style={[styles.righticon2]}>

            <OnelineDropdownSvg />

          </View>
        </TouchableOpacity>


        {accntvisivility && (
          <View>

            <FlotingInput label={accnumhint} value={agencyCode}
            onChangeTextCallback={text => setAgencyCode(text)} 
            inputstyle={undefined} 
            autoCapitalize='characters'

            labelinputstyle={undefined}            />

          </View>
        )}

        {accntvisivility2 && (
          <View>

            <FlotingInput label={accnumhint2}
              value={agencyCode2}
              autoCapitalize='characters'

              onChangeTextCallback={text => setAgencyCode2(text)} />
            <View style={styles.righticon2}>
              <TouchableOpacity style={styles.infobtntex}>
                <Text style={styles.infobtntex}>{translate("Info")}</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}

        <ElectricityOperatorBottomSheet
           showState={false}
          isModalVisible={isvisible}
          stateData={stateslist}
          setModalVisible={setIsvisible}
          setOperatorcode={setoptcode}
          setOperator={setopt}
          operatorData={operatorList}
          GetOptlist={(v)=>GetOptlist(v)}
          handleItemPress={(item) => { handleItemPress(item) }}
          setState={setStateName}

        />

        <View>
          <FlotingInput label={paramname}
        autoCapitalize='characters'

            onChangeTextCallback={text => {
              setconsumerNo(text)
              if (text.length >= 1) {
                setIsinfo(true)
              } else {
                setIsinfo(false)
              }
              setconsumerNo(text);
            }
            }
            value={consumerNo}
          />


          <View style={[styles.righticon2,]}>
            {isInfo && (
              <TouchableOpacity
                style={styles.infobtn}
                onPress={() => {
                  billInfo();
                  setShowLoader2(true)
                }}>
                {
                  showLoader2 ? <ActivityIndicator size={'large'} /> : <Text style={[styles.infobtntex,]}>{translate("Info")}</Text>
                }
              </TouchableOpacity>
            )}
          </View>
        </View>


        <FlotingInput label={'Enter Amount'}
             maxLength={5}
             
          keyboardType="number-pad"
          value={amount || billAmount || ''}
          onChangeTextCallback={text => setAmount(text)}

        />


        <DynamicButton

          title='Next'
          onPress={() => {
            // billInfo();
            validateFields()
          }} styleoveride />
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
        <Rechargeconfirm
          Lottieimg={require('../../utils/lottieIcons/light-bulb.json')}
          isModalVisible={bottomSheetVisible}
          onBackdropPress={() => setBottomSheetVisible(false)}
          status={Status}
          details={[
            { label: 'User Name', value2: CustomerName === '' ? 'N/A' : CustomerName },
            { label: 'Customer ID', value: consumerNo },
            { label: 'Due Date', value2: dueDate === '' ? 'N/A' : dueDate },
            { label: 'Operator Name', value2: opt },
            { label: 'Customer Status', value2: Status === '' ? 'N/A' : Status },
            { label: 'BillAmount', value2: billAmount === '' ? 'N / A' : billAmount },

          ]}
          lastlabel={'Transaction Amount'}
          lastvalue={amount || billAmount}
          onRechargedetails={() => {
            if ((amount === '0' || amount === '') && !billAmount) {
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
    </View >

  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1, backgroundColor: '#fff'
  },
  container: {
    paddingHorizontal: wScale(20),
    flex: 1,
    paddingTop: hScale(30),
  },
  labelinputstyle: {
    fontSize: wScale(20),
    fontWeight: "bold",
    marginTop: hScale(-7),
  },
  circletext: {
    position: "absolute",
    top: hScale(38),
    paddingLeft: wScale(15),
    fontSize: wScale(12),
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
  operatioimg: {
    width: wScale(45),
    height: wScale(45),

  },
  recentviewbtn: {
    alignSelf: 'flex-end',
    flexDirection: 'row'
  },
});

export default ElectricityScreen;
