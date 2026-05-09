import LottieView from 'lottie-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  FlatList,
  ActivityIndicator,
  
  Alert,
} from 'react-native';
import { translate } from '../../utils/languageUtils/I18n';
import { APP_URLS } from '../../utils/network/urls';
import { colors } from '../../utils/styles/theme';
import useAxiosHook from '../../utils/network/AxiosClient';
import { useDeviceInfoHook } from '../../utils/hooks/useDeviceInfoHook';
import { useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import { encrypt } from '../../utils/encryptionUtils';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import { hScale, wScale } from '../../utils/styles/dimensions';
import FlotingInput from '../drawer/securityPages/FlotingInput';
import DynamicButton from '../drawer/button/DynamicButton';
import Rechargeconfirm from '../../components/Rechargeconfirm';
import OperatorBottomSheet from '../../components/OperatorBottomSheet';
import RecentHistory from '../../components/RecentHistoryBottomSheet';
import { useNavigation } from '@react-navigation/native';
import ShowLoader from '../../components/ShowLoder';
import RecentText from '../../components/RecentText';
import { useLocationHook } from '../../hooks/useLocationHook';

const WaterBillScreen = () => {
  const { get, post } = useAxiosHook();
  const [CustomerID, setCustomerID] = useState('');
  const [amount, setAmount] = useState('');
  const [ProceedSheetVisible, setProceedSheetVisible] = useState(false);
  const [LandLineOPSheet, setLandLineOPSheet] = useState(false);
  const [maxLen, setMaxLen] = useState(10);
  const [isInfo, setIsInfo] = useState(true);
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
  const [CustomerName, setCustomerName] = useState(translate('Name'));
  const [custBal, setCustBal] = useState(translate('Balance'));
  const [Status, setStatus] = useState(translate('Status'));
  const [waterBillOperator, setWaterBillOperator] = useState('Select Operator');
  const [waterBillOperators, setWaterBillOperators] = useState([]);
  const [showLoader2, setShowLoader2] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [reqTime, setReqTime] = useState('');
  const [reqId, setReqId] = useState('')
  const [isrecent, setIsrecent] = useState(false);
  const [historylist, setHistorylist] = useState([]);
  const [agencyCode, setAgencyCode] = useState('');
  const [agencyCode2, setAgencyCode2] = useState('');

  useEffect(() => {
    getWaterBillOperators();
  }, []);
  const selectOperator = selectedOperator => {
    console.log('Selected Operator:', selectedOperator);
    setFastagOpt(selectedOperator);
    setLandLineOPSheet(false);
  };
  const navigation = useNavigation<any>();

  async function getWaterBillOperators() {
    try {
      const token = await APP_URLS.getToke;
      const data = {};
      const url = `${APP_URLS.getDthOperator}Water`;
      const response = await get({ url });
      setWaterBillOperators(response['myprop2Items']);
      console.log(response['myprop2Items']);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    recenttransactions();

  }, []);
  const recenttransactions = async () => {
    try {
      const url = `${APP_URLS.recenttransaction}pageindex=1&pagesize=5&retailerid=${userId}&fromdate=${formattedDate}&todate=${formattedDate}&role=Retailer&rechargeNo=ALL&status=ALL&OperatorName=ALL&portno=ALL`
      console.log(url);
      const response = await get({ url: url })
      console.log('-*************************************recenttransaction', response);

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
  const [dueDate, setDueDate] = useState('Date');

  const { getNetworkCarrier, getMobileDeviceId, getMobileIp } =
    useDeviceInfoHook();
  const { userId, Loc_Data } = useSelector((state: RootState) => state.userInfo);
  const { latitude, longitude } = Loc_Data;
 
  const onRechargePress = useCallback(async () => {
    try {
      console.log('Raw LatLong:', latitude, longitude);

      setShowLoader(true);
      setProceedSheetVisible(false);

      // =========================
      // ✅ LAT / LONG FALLBACK
      // =========================
      const SAFE_LATITUDE =
        latitude !== null && latitude !== undefined
          ? latitude.toString()
          : '28.6139'; // Default Delhi

      const SAFE_LONGITUDE =
        longitude !== null && longitude !== undefined
          ? longitude.toString()
          : '77.2090';

      // =========================
      // NETWORK & IP
      // =========================
      const mobileNetwork = await getNetworkCarrier();
      const ip = await getMobileIp();

      // =========================
      // ENCRYPT DATA
      // =========================
      const encryption = await encrypt([
        userId,
        CustomerID,
        optcode,
        amount,
        SAFE_LATITUDE,
        SAFE_LONGITUDE,
        'city',
        'address',
        'postcode',
        mobileNetwork,
        ip,
        '57bea5094fd9082d',
      ]);

      console.log('Encrypted Data:', encryption.encryptedData);

      // =========================
      // URL PARAMS
      // =========================
      const rd = encodeURIComponent(encryption.encryptedData[0]);
      const n1 = encodeURIComponent(encryption.encryptedData[1]);
      const ok1 = encodeURIComponent(encryption.encryptedData[2]);
      const amn = amount;

      const Latitude = encodeURIComponent(encryption.encryptedData[4]);
      const Longitude = encodeURIComponent(encryption.encryptedData[5]);
      const City = encodeURIComponent(encryption.encryptedData[6]);
      const Addresss = encodeURIComponent(encryption.encryptedData[7]);
      const PostalCode = encodeURIComponent(encryption.encryptedData[8]);
      const InternetTYPE = encodeURIComponent(encryption.encryptedData[9]);
      const ip1 = encodeURIComponent(encryption.encryptedData[10]);
      const ModelNo = encodeURIComponent(encryption.encryptedData[11]);

      const em = '57bea5094fd9082d';
      const devtoken = City;

      const value1 = encodeURIComponent(encryption.keyEncode);
      const value2 = encodeURIComponent(encryption.ivEncode);

      // =========================
      // FINAL URL
      // =========================
      const url = `${APP_URLS.rechTask}rd=${rd}&n=${n1}&ok=${ok1}&amn=${amn}&pc=${agencyCode}&bu=${agencyCode}&acno&lt&ip=${ip1}&mc&em=${em}&offerprice&commAmount&Devicetoken=${devtoken}&Latitude=${Latitude}&Longitude=${Longitude}&ModelNo=${ModelNo}&City=${City}&PostalCode=${PostalCode}&InternetTYPE=${InternetTYPE}&Addresss=${Addresss}&value1=${value1}&value2=${value2}`;

      console.log('FINAL URL:', url);

      // =========================
      // API CALL
      // =========================
      const res = await post({ url });

      console.log('Recharge Response:', res);

      if (res?.status === 'False') {
        alert(res?.message || 'Recharge failed');
        setShowLoader(false);
        return;
      }

      const status = res?.Response || 'Success';
      const Message = res?.Message || 'Recharge Successful';

      await recenttransactions();

      // =========================
      // RESET UI
      // =========================
      setCustomerID('');
      setFastagOpt('Select Your Operator');
      setAmount('');
      setIsInfo(false);
      setShowLoader(false);

      // =========================
      // NAVIGATE
      // =========================
      navigation.navigate('Rechargedetails', {
        mobileNumber: CustomerID || '',
        Amount: amount || 0,
        operator: FastagOpt || 'N/A',
        status,
        reqId: reqId || '',
        reqTime: reqTime || new Date().toISOString(),
        Message,
      });

    } catch (error) {
      console.error('Recharge failed:', error);
      setShowLoader(false);
      alert('Recharge failed, please try again');
    }
  }, [
    amount,
    latitude,
    longitude,
    CustomerID,
    optcode,
    userId,
    getMobileIp,
    getNetworkCarrier,
    post,
  ]);

  // async function billInfo() {
  //   try {
  //     const token = await APP_URLS.getToken;
  //     const config = {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     };


  //     const url = `${APP_URLS.rechargeViewBill}billnumber=${paramname}&Operator=${optcode}&billunit=&ProcessingCycle=''&acno=''&lt=""&ViewBill:"Y"`;
  //     const res = await post({ url: url });
  //     console.log('ressss/*/**/**/**** */ */ */', res)
  //     console.log('urllll/*/**/**/**** */ */ */', url)

  //     const result = res.data['RESULT'];

  //     const resp = res.data['ADDINFO'];
  //     if (result === '0') {
  //       const billinfo = resp['BillInfo'];

  //       setDueDate(billinfo['billDueDate']);
  //       setAmount(billinfo['billAmount']);
  //       setCustomerName(billinfo['customerName']);
  //       console.log(billinfo['customerName'])

  //       setCustBal(billinfo['balance']);
  //       setStatus(billinfo['customerStatus']);
  //     }
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }
  // async function billInfo() {
  //   try {
  //     const token = await APP_URLS.getToken;
  //     if (!token) {
  //       console.error('No token found');
  //       return { result: '0' }; // Indicate failure
  //     }

  //     const config = {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     };

  //     const url = `${APP_URLS.rechargeViewBill}billnumber=${encodeURIComponent(CustomerID)}&Operator=${encodeURIComponent(optcode)}&billunit=&ProcessingCycle=''&acno=''&lt=""&ViewBill="Y"`;
  //     console.log('Request URL:', url);

  //     const res = await post({ url: url, config });
  //     console.log('API Response:', res);

  //     const result = res.data['RESULT'];
  //     if (result === '1') {
  //       const resp = res.data['ADDINFO'];
  //       const billinfo = resp['BillInfo'];
  //       setDueDate(billinfo['billDueDate']);
  //       setAmount(billinfo['billAmount']);
  //       setCustomerName(billinfo['customerName']);
  //       setCustBal(billinfo['balance']);
  //       setStatus(billinfo['customerStatus']);

  //       console.log('Bill Info:', {
  //         CustomerID,
  //         dueDate: billinfo['billDueDate'],
  //         amount: billinfo['billAmount'],
  //         custBal: billinfo['balance1234567890-/*-/*-/*--+/*-/*-/*-/*-/*-/*-'],
  //       });
  //       return { result, billinfo };
  //     } else {
  //       console.error('Error fetching bill info:', res.data['MESSAGE']);
  //       return { result: '1' }; // Indicate failure
  //     }
  //   } catch (error) {
  //     console.error('Error in billInfo function:', error);
  //     return { result: '1' }; // Indicate failure
  //   }
  // }

  const billInfo = useCallback(async () => {
    try {
      setShowLoader2(true);

      const url = `${APP_URLS.rechargeViewBill}billnumber=${CustomerID}&Operator=${optcode}&billunit&ProcessingCycle&acno&lt&ViewBill=Y`;

      console.log("🔗 BillInfo URL:", url);

      const res = await get({ url });

      console.log("📥 BillInfo Response:", res);

      if (res?.RESULT === 0) {
        const billInfo = res?.ADDINFO?.BillInfo;

        if (billInfo) {
          setDueDate(billInfo.billDueDate || "");
          setAmount(billInfo.billAmount || "");
          setCustomerName(billInfo.customerName || "");
          setCustBal(billInfo.balance || "");
        }
        // setLandLineOPSheet(true)
        setProceedSheetVisible(true);

      } else {
        Alert.alert(
          res?.ADDINFO || "Error",
          res?.Message || "Something went wrong",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.log("❌ Bill Info Error:", error);
      Alert.alert("Error", "Unable to fetch bill details");
    } finally {
      setShowLoader2(false);
    }
  }, [CustomerID, optcode]);

  const handlePayPress = async () => {
    if (FastagOpt === 'Select Your Operator') {
      ToastAndroid.show('Please Select an Operator', ToastAndroid.SHORT);
    } else if (!CustomerID) {
      ToastAndroid.showWithGravity(`Please Enter ${paramname}`, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
    } else {
      billInfo();
      // if (billResult.result === '1') {
      //   setProceedSheetVisible(true);
      // } else {
      //   // Handle the case where the result is not '0'
      //   ToastAndroid.show('Failed to fetch bill information', ToastAndroid.SHORT);
      // }
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
  const handleItemPress = item => {
    setFastagOpt(item['Operatorname']);
    setWaterBillOperator(item['Operatorname']);
    setOptCode(item['OPtCode']);
    setDataType('');
    setMinLength(0);
    setOptional('');
    setParamName('Customer ID');
    setValues('');
    setRegx('');
    setVisibility(false);

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

  const handleTextChange = text => {
    setCustomerID(text);
  };
  useEffect(() => {
    console.log('Current State:', {
      CustomerID,
      dueDate,
      amount,
      custBal,
    });
  }, [CustomerID, dueDate, amount, custBal,]);

  return (
    <View style={styles.main}>
      <AppBarSecond title={'Water Bill Screen'} />
      <View style={styles.container}>
        {showLoader && (
          <ShowLoader />
        )}
        <TouchableOpacity
          style={{}}
          onPress={() => {
            setLandLineOPSheet(true);
          }}>

          <FlotingInput label={FastagOpt} editable={false} />


        </TouchableOpacity>
        {accntvisivility && (
          <View
          >
            <FlotingInput label={accnumhint} onChangeTextCallback={(text) => setAgencyCode(text)}
              value={agencyCode}

            />

            <TouchableOpacity>
              <Text style={{}}></Text>
            </TouchableOpacity>
          </View>
        )}

        {accntvisivility2 && (
          <View >

            <FlotingInput label={accnumhint2} onChangeTextCallback={(text) => setAgencyCode2(text)}
              value={agencyCode2}

            />
            <View style={[styles.righticon2]}>
              <TouchableOpacity>

                <Text style={[styles.infobtntex,]}>{translate("Info")}</Text>
              </TouchableOpacity>

            </View>

          </View>
        )}

        <View>
          <FlotingInput label={paramname} value={CustomerID}

            onChangeTextCallback={text => {
              handleTextChange(text);
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

                onPress={() => handlePayPress()}
              >
                {
                  showLoader2 ? <ActivityIndicator size={'large'} /> : <Text style={[styles.infobtntex,]}>{translate("Info")}</Text>

                }
              </TouchableOpacity>
            )}
          </View>

        </View>

        <FlotingInput label={'Enter Amount'}
          maxLength={5}
          value={amount} keyboardType="number-pad"
          onChangeTextCallback={text => {
            setAmount(text); setAmount(text.replace(/\D/g, ""));
          }} />

        <DynamicButton title={'Next'} onPress={() => { handlePayPress(); }} styleoveride={undefined} />
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
          operatorData={waterBillOperators}
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
          Lottieimg={require('../../utils/lottieIcons/biomass.json')}
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
export default WaterBillScreen;
