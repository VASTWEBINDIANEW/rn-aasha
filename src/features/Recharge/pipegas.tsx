import React, {useCallback, useEffect, useState} from 'react';
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
import {colors} from './../../utils/styles/theme';
import {SCREEN_HEIGHT, hScale, wScale} from './../../utils/styles/dimensions';
import {APP_URLS} from './../../utils/network/urls';
import useAxiosHook from './../../utils/network/AxiosClient';
import {translate} from './../../utils/languageUtils/I18n';
import { useDeviceInfoHook } from '../../utils/hooks/useDeviceInfoHook';
import { useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import { encrypt } from '../../utils/encryptionUtils';
import { useLocationHook } from '../../utils/hooks/useLocationHook';
import { Card } from 'react-native-paper';
import { BottomSheet } from "@rneui/themed";
import { FlashList } from '@shopify/flash-list';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PrepaidGasScreen = () => {
  const {get, post} = useAxiosHook();
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
  const [isInfo, setIsinfo] = useState(true);
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
  useEffect(() => {
    CreditCardOpt('Gas');
  }, []);

  const handleItemPress = item => {
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
    setVisibility(false);
    if (!item.customerparams || item.customerparams.length === 0) {
      //clearState();
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
        //  setAccntvisivility2(true);
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
  const {getNetworkCarrier, getMobileDeviceId, getMobileIp} =
  useDeviceInfoHook();
const {userId} = useSelector((state: RootState) => state.userInfo);
const {latitude, longitude} = useLocationHook();
const readLatLongFromStorage = async () => {
  try {
    const locationData = await AsyncStorage.getItem('locationData');
    
    if (locationData !== null) {
      const { latitude, longitude } = JSON.parse(locationData);
      console.log('Latitude:', latitude, 'Longitude:', longitude);
      return { latitude, longitude };
    } else {
      console.log('No location data found');
      return null;
    }
  } catch (error) {
    console.error('Failed to read location data from AsyncStorage:', error);
    return null; 
  }
};
const onRechargePress = useCallback(async () => {




  
  const mobileNetwork = await getNetworkCarrier();
  const ip = await getMobileIp();
  const encryption = await encrypt([
    userId,
    consumerNo,
    optcode,
    amount,
    latitude ??'0.000',
    longitude??'0.111',
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

  const res = await post({
    url: url,

  });
  if(res.status ==='False'){
    alert(res.message);

    return
  }
  if(!res.ok){
    if(res['Response'] === 'Success'){
      Alert.alert(res['Response'],res['Message'] ,  [{ text: 'OK', onPress: () => {} }]);
  
    }else{  Alert.alert(res['Response'],res['message'] ,  [{ text: 'OK', onPress: () => {} }]);
  }
  
  }else{
  
  }

console.log('onRechargePress',res);

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
      console.log(res['myprop2Items']);
      setInsuranceOptList(res['myprop2Items']);
    } catch (error) {
      console.error(error);
    }
  }

  const showBottomSheetList = () => {
    return (
      <View style={{marginVertical: wScale(8), marginHorizontal: wScale(24)}}>
        <FlashList
          style={{marginBottom: wScale(50), marginHorizontal: wScale(24)}}
          data={insuranceOptList}
          renderItem={({item}) => {
            return (
              <View
                style={{
                  marginVertical: wScale(8),
                  marginHorizontal: wScale(24),
                }}>
                <TouchableWithoutFeedback
                  onPress={async () => {
                    handleItemPress(item);
                    setOptCode(item['OPtCode']);
                    setselectedOpt(item['Operatorname']);
                    setIsOperatorList(false);
                    ViewbillInfoStatus();
                    console.log(item['OPtCode']);
                  }}>
                  <Text style={{color: '#ff4670', fontSize: 18}}>
                    {item['Operatorname']}
                  </Text>
                </TouchableWithoutFeedback>
              </View>
            );
          }}
          estimatedItemSize={30}
        />
      </View>
    );
  };
  async function billInfo() {
    try {
      const config = {
        headers: {
          Authorization: `Bearer`,
        },
      };
    
      const url = `${APP_URLS.rechargeViewBill}billnumber=${consumerNo}&Operator=${optcode}&billunit&ProcessingCycle&acno&lt&ViewBill=Y`;
      const res = await get({url: url});
      console.log(url);
        setDueDate(res["rechargedueDate"]);
        setAmount(res["monthlyRecharge"]);
        setCustomerName(res["customerName"]);
        setCustBal(res["balance"]);
      //setstatus(res["customerStatus"])

      // console.log(":", res);
    } catch (error) {}
  }
  async function ViewbillInfoStatus() {
    console.log(optcode);
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
      const res = await post({url: url, data, config: config});

      console.log(':', url);
      const billSts = res['RESULT'];
      if (billSts === 'Y') {
        setIsinfo(true);
      } else {
        setIsinfo(false);
      }
      console.log(':', res);
    } catch (error) {}
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
    } else if (!amount || amount === 'Enter Amount') {
      ToastAndroid.showWithGravity(
        'Please Enter the Recharge Amount',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else {
      setBottomSheetVisible(true);
    }
  };
  return (
    <View style={{alignContent: 'center', alignItems: 'center'}}>
      <TouchableOpacity onPress={() => setIsOperatorList(true)}>
        <TextInput
          style={styles.DetailButton}
          placeholder={'Select Operator'}
          onChangeText={text => setTextInput1(text)}
          editable={false}
          value={selectedOpt}
        />
      </TouchableOpacity>

      {accntvisivility && (
        <View
          style={[
            styles.DetailButton,
            {
              flexDirection: 'row',
              alignContent: 'space-between',
              justifyContent: 'space-between',
            },
          ]}>
          <TextInput
            style={{}}
            //value={agencyCode}
            placeholder={accnumhint}
            //   onChangeText={(text) => setAgencyCode(text)}
          />
          <TouchableOpacity>
            <Text style={{}}></Text>
          </TouchableOpacity>
        </View>
      )}

      {accntvisivility2 && (
        <View style={styles.DetailButton}>
          <View style={{flexDirection: 'row', alignContent: 'space-between'}}>
            <TextInput
              style={{}}
              // value=''
              placeholder={accnumhint2}
              // onChangeText={(text) => setAccnumhint2(text)}
            />
            <TouchableOpacity>
              <Text style={{top: hScale(15), left: wScale(5)}}> info</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      <View
        style={[
          styles.DetailButton,
          {flexDirection: 'row', justifyContent: 'space-between'},
        ]}>
        <TextInput
          placeholder={paramname}
          value={consumerNo}
          // 
          onChangeText={text => setconsumerNo(text)}
        />

        {isInfo && (
          <TouchableOpacity
            onPress={() => {
              billInfo();
              setBottomSheetVisible(true);
            }}>
            <Text style={{}}>Info</Text>
          </TouchableOpacity>
        )}
      </View>

      <TextInput
        style={styles.DetailButton}
        placeholder={translate('Enter Amount')}
        value={amount}
        keyboardType="number-pad"
        onChangeText={text => setAmount(text)}
      />

      <TouchableOpacity
        style={{height: 50}}
        onPress={() => {
          validateFields();
        }}>
        <View style={styles.PayButton}>
          <Text
            style={{
              margin: hScale(5),
              color: colors.ghostWhite,
              fontSize: 18,
              alignItems: 'center',
            }}>
            Proceed{' '}
          </Text>
        </View>
      </TouchableOpacity>

      <BottomSheet animationType="none"  
        isVisible={isOperatorList}
        onBackdropPress={() => {
          setIsOperatorList(false);
        }}>
        <View
          style={{
            height: SCREEN_HEIGHT / 1.5,
            flex: 1,
            marginBottom: wScale(40),
          }}></View>
        {showBottomSheetList()}
      </BottomSheet>

      <BottomSheet animationType="none"  
        isVisible={bottomSheetVisible}
        onBackdropPress={() => setBottomSheetVisible(false)}>
        <View style={{bottom: hScale(10)}}>
          <Card>
            <Text> Operator: {selectedOpt}</Text>
          </Card>
          <Card>
            <Text>Due Date: {dueDate}</Text>
          </Card>
          <Card>
            <Text>
              {accnumhint2} {CustomerName}
            </Text>
          </Card>
          <Card>
            <Text>
              {accnumhint} {consumerNo}
            </Text>
          </Card>
          <Card>
            <Text>Recharge Amount: {amount}</Text>
          </Card>
          <TouchableOpacity
            onPress={() => {
              onRechargePress();
              setBottomSheetVisible(false);
              setProceedSheetVisible(true);
            }}>
            <Text style={styles.DetailButton}>{translate('ConfirmPay')}</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  DetailButton: {
    alignContent: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: colors.ghostWhite,
    padding: wScale(10),
    borderRadius: 40,
    marginTop: hScale(10),
    width: wScale(350),
    top: hScale(5),
    bottom: hScale(20),
  },
  PayButton: {
    marginBottom: hScale(5),
    marginTop: hScale(10),
    paddingHorizontal: hScale(5),
    borderBlockColor: '#000000',
    borderColor: '#ffff',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    padding: hScale(5),
    backgroundColor: '#fe8276',
    height: hScale(60),
    width: wScale(350),
    shadowColor: 'black',
  },
});

export default PrepaidGasScreen;
