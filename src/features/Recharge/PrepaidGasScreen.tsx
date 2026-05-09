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
  ActivityIndicator,
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
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import FlotingInput from '../drawer/securityPages/FlotingInput';
import DynamicButton from '../drawer/button/DynamicButton';
import RecentHistory from '../../components/RecentHistoryBottomSheet';
import Rechargeconfirm from '../../components/Rechargeconfirm';
import { useNavigation } from '@react-navigation/native';
import ShowLoader from '../../components/ShowLoder';
import RecentText from '../../components/RecentText';
import { useLocationHook } from '../../hooks/useLocationHook';

const PrepaidGasScreen1 = () => {
  const { get, post } = useAxiosHook();
  const [textInput1, setTextInput1] = useState('');
  const [consumerNo, setconsumerNo] = useState(translate(''));
  const [textInput3, setTextInput3] = useState('');
  const [textInput4, setTextInput4] = useState('');
  const [statelist, setstatelist] = useState([]);
  const [isOperatorList, setIsOperatorList] = useState(false);
  const [isDistList, setIsisDistList] = useState(false);

  const [selectedOpt, setselectedOpt] = useState(
    translate('Select Your State'),
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
  const [accnumhint2, setAccnumhint2] = useState(translate(''));
  const [accmaxlength2, setAccmaxlength2] = useState(0);
  const [key3, setKey3] = useState('');
  const [keyType3, setKeyType3] = useState('');
  const [accntvisivility2, setAccntvisivility2] = useState(true);
  const [datatype, setDataType] = useState('');
  const [maxlength, setMaxLength] = useState();
  const [minlength, setMinLength] = useState();
  const [optional, setOptional] = useState('');
  const [paramname, setParamName] = useState('LPG ID');
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

  useEffect(() => {
    Statelist();
  }, []);
  const navigation = useNavigation<any>();

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
    console.log(item.OPtCode);
    setVisibility(false);
    if (!item.customerparams || item.customerparams.length === 0) {
      //clearState();
    } else {
      const custparam = item.customerparams;

      setDataType(custparam[0].dataType);
      setMaxLength(custparam[0].maxLength);
      setMinLength(custparam[0].minLength);
      setVisibility(custparam[0].visibility);
      setOptional(custparam[0].optional);
      setParamName(custparam[0].paramName);
      setRegx(custparam[0].regex);
      setValues(custparam[0].values);

      if (custparam.length === 2) {
        setAccnumhint(custparam[1].paramName);
        setAccmaxlength(custparam[1].maxLength);
        setKey2(custparam[1].dataType);
        setKeyType2(
          custparam[1].dataType === 'ALPHANUMERIC' ? 'default' : 'numeric',
        );
        setAccntvisivility(true);
        //  setAccntvisivility2(true);
      } else if (custparam.length === 3) {
        setAccnumhint(custparam[1].paramName);
        setAccmaxlength(custparam[1].maxLength);
        setAccnumhint2(custparam[2].paramName);
        setAccmaxlength2(custparam[2].maxLength);
        setKey2(custparam[1].dataType);
        setKey3(custparam[2].dataType);
        setKeyType2(
          custparam[1].dataType === 'ALPHANUMERIC' ? 'default' : 'numeric',
        );
        setKeyType3(
          custparam[2].dataType === 'ALPHANUMERIC' ? 'default' : 'numeric',
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

  async function getHpAgency(stateName: string, district: string) {
    console.log(stateName, district);
    try {
      const url = `${APP_URLS.getIndaneAgency}statename=${stateName}&District=${district}`;

      const res = await post({
        url: url,
      });
      console.log(res);

      setIsagencies(res.data);
    } catch (error) { }
  }

  async function Statelist() {
    const data = {};
    try {
      const url = `${APP_URLS.gasCylinderState}`;
      const res = await post({ url: url, config: null });
      setstatelist(res.data);
      console.log(res);
    } catch (error) { }
  }

  async function fatchDist(state: any) {
    console.log(state);
    try {
      const data = {
        statename: state,
      };

      const url = await `${APP_URLS.DistrictByState}${state}`;
      const res = await post({ url: url, config: null });

      console.log(res.data);
      setDistList(res.data);

      //  setshowdistrictData(true);
    } catch (error) { }
  }

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


  const { getNetworkCarrier, getMobileDeviceId, getMobileIp } =
    useDeviceInfoHook();
  const { userId,Loc_Data } = useSelector((state: RootState) => state.userInfo);
  const { latitude, longitude } = useLocationHook();

  const onRechargePress = useCallback(async () => {

    setShowLoader(true)
    setBottomSheetVisible(false);

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

    const url = `${APP_URLS.rechTask}rd=${rd}&n=${n1}&ok=${ok1}&amn=${amn}&pc=${accnumhint}&bu=${accnumhint2}&acno&lt&ip=${ip1}&mc&em=${em}&offerprice&commAmount&Devicetoken=${devtoken}&Latitude=${Latitude}&Longitude=${Longitude}&ModelNo=${ModelNo}&City=${City}&PostalCode=${PostalCode}&InternetTYPE=${InternetTYPE}&Addresss=${Addresss}&value1=${value1}&value2=${value2}&circle=Maharashtra`;

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
    // setFastagOpt('Select Your Operator');
    setAmount('');
    setIsinfo(false)
    setShowLoader(false);

    navigation.navigate('Rechargedetails', {
      mobileNumber: mobileNumber ?? '',
      Amount: amount ?? 0,
      operator: 'Bhart Gas',
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
    consumerNo,
    optcode,
    post,
    userId,
  ]);
  const [agencies, setagencies] = useState('');
  const [Isagencies, setIsagencies] = useState([]);
  const [distributorId, setdistributorId] = useState('');
  const [showdist, setshowdist] = useState(true);
  const agency = () => {
    return (
      <FlashList
        style={{ marginBottom: wScale(50), marginHorizontal: wScale(24) }}
        data={Isagencies}
        renderItem={({ item }) => {
          return (
            <View
              style={{ marginVertical: wScale(8), marginHorizontal: wScale(24) }}>
              <TouchableOpacity
                onPress={async () => {
                  //   getHpAgency(selectedOpt,item);
                  setIsisDistList(false);
                  setAccntvisivility(true);
                  setAccntvisivility2(true);

                  //  setagencies(item.Name);
                  setshowdist(false);
                  setdistributorId(item.Distcode);
                  console.log(item.Name);
                }}>
                <Text
                  style={{
                    color: '#ff4670',
                    fontSize: 18,
                  }}>
                  {item.Name}
                </Text>
                <Text
                  style={{
                    color: '#ff4670',
                    fontSize: 14,
                  }}>
                  {item.Address}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
        estimatedItemSize={30}
      />
    );
  };
  const showDistData = () => {
    return (
      <FlashList
        style={{ marginBottom: wScale(50), marginHorizontal: wScale(24) }}
        data={DistList}
        renderItem={({ item }) => {
          return (
            <View
              style={{ marginVertical: wScale(8), marginHorizontal: wScale(24) }}>
              <TouchableOpacity
                onPress={async () => {
                  setdistrict(item);
                  fatchDist(item);
                  setshowdist(false);
                  getHpAgency(selectedOpt, item);
                  console.log(item);
                }}>
                <Text
                  style={{
                    color: '#ff4670',
                    fontSize: 18,
                  }}>
                  {item}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
        estimatedItemSize={30}
      />
    );
  };
  const showStateListData = () => {
    return (
      <FlashList
        style={{ marginBottom: wScale(50), marginHorizontal: wScale(24) }}
        data={statelist}
        renderItem={({ item }) => {
          return (
            <View
              style={{ marginVertical: wScale(8), marginHorizontal: wScale(24) }}>
              <TouchableOpacity
                onPress={async () => {
                  setIsOperatorList(false);
                  setIsisDistList(true);
                  setselectedOpt(item);
                  fatchDist(item);
                  console.log(item);
                }}>
                <Text
                  style={{
                    color: '#ff4670',
                    fontSize: 18,
                  }}>
                  {item}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
        estimatedItemSize={30}
      />
    );
  };

  async function billInfo() {
    try {
      const config = {
        headers: {
          Authorization: 'Bearer',
        },
      };
      const data = {
        billnumber: CustomerID,
        Operator: optcode,
        billunit: '',
        ProcessingCycle: '',
        acno: 'acno',
        lt: '',
        ViewBill: 'Y',
      };
      const url = `${APP_URLS.rechargeViewBill}billnumber=${consumerNo}&Operator=${optcode}&billunit=${agencies}&ProcessingCycle=''&acno=''&lt=''&ViewBill="Y"`;

      const res = await get({ url: url });
      console.log(":", res); console.log(data.Operator);
      console.log(url);
      setDueDate(res["rechargedueDate"]);
      setAmount(res["monthlyRecharge"]);
      setCustomerName(res["customerName"]);
      setCustBal(res["balance"]);
      // setstatus(res["customerStatus"])


    } catch (error) { }
  }

  const [mobileNumber, setMobileNumber] = useState('');
  async function ViewbillInfoStatus() {
    console.log(optcode);
    try {
      const config = {
        headers: {
          Authorization: 'Bearer',
        },
      };
      const data = {
        Operatorcode: optcode,
      };
      const url = `${APP_URLS.viewbillstatuscheck}${optcode}`;
      const res = await post({ url: url, data, config: config });

      console.log(':', url);
      const billSts = res.RESULT;
      if (billSts === 'Y') {
        setIsinfo(true);
      } else {
        setIsinfo(false);
      }
      console.log(':', res);
    } catch (error) { }
  }

  const validateFields = () => {
    if (!consumerNo) {
      ToastAndroid.showWithGravity(
        `Please Enter ${paramname}'`,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else if (!amount || amount === 'Enter Amount' || parseFloat(amount) <= 0) {
      ToastAndroid.showWithGravity(
        'Please Enter the Recharge Amount',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else if (!distributorId) {
      ToastAndroid.showWithGravity(
        `Please Enter ${distributorId}'`,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else if (
      !mobileNumber ||
      mobileNumber.length < 10 ||
      mobileNumber.length > 10
    ) {
      ToastAndroid.showWithGravity(
        'Please Enter a 10-digit Mobile Number',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else {
      setBottomSheetVisible(true);
    }
  };

  return (
    <View style={styles.main}>
      <AppBarSecond title={'Bharat Gas'} />
      <View style={styles.container}>
        {showLoader && (
          <ShowLoader />
        )}
        {accntvisivility && (

          <TouchableOpacity
            onPress={() => {
              setIsisDistList(true);
              setshowdist(false);
            }}>
            {/* <TextInput
                style={styles.DetailButton}
                //value={agencyCode}
                placeholder={agencies}
                editable={false}
              //   onChangeText={(text) => setAgencyCode(text)}
              /> */}
            <FlotingInput label={agencies} editable={false}
              onChangeTextCallback={(text) => setagencies(text)} />

          </TouchableOpacity>
        )}

        {accntvisivility2 && (
          <View>
            {/* <TextInput
              style={styles.DetailButton}
              value={distributorId}
              placeholder={'Agenct Code'}
              editable={true}
              onChangeText={text => setdistributorId(text)}
            /> */}
            <FlotingInput label={'Agenct Code'} 
              onChangeTextCallback={(text) => setdistributorId(text)} value={distributorId} />
          </View>
        )}
        <View>

          <FlotingInput label={paramname} value={consumerNo} onChangeTextCallback={text => setconsumerNo(text)} 
            maxLength={17}
          />

          <View style={[styles.righticon2,]}>
            {isInfo && (
              <TouchableOpacity
                style={styles.infobtn}

                onPress={() => {
                  billInfo();
                  setBottomSheetVisible(true);
                }}
              >
                {
                  showLoader2 ? <ActivityIndicator size={'large'} /> : <Text style={[styles.infobtntex,]}>Info</Text>

                }
              </TouchableOpacity>
            )}
          </View>
        </View>
        {/* <TextInput
              style={styles.DetailButton}
              value={mobileNumber}
              placeholder={translate('Mobile Number')}
              editable={true}
              keyboardType="number-pad"
              maxLength={10}
              onChangeText={text => setMobileNumber(text)}
            /> */}

        <FlotingInput label={'Mobile Number'} value={mobileNumber}
          onChangeTextCallback={text => setMobileNumber(text)} keyboardType="number-pad"
          maxLength={10}
        />

        {/* <TextInput
          style={styles.DetailButton}
          placeholder={translate('Enter Amount')}
          value={amount}
          keyboardType="number-pad"
          onChangeText={text => setAmount(text)}
        /> */}
        <FlotingInput label={'Enter Amount'}
             maxLength={5}
              value={amount} keyboardType="number-pad"
          onChangeTextCallback={text => {
            setAmount(text);
          }} />

        {/* <TouchableOpacity
          style={{ height: 50 }}
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
        </TouchableOpacity> */}
        <DynamicButton title={'Next'} onPress={() => {
          validateFields();
        }} />

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
           <RecentText/>
          </TouchableOpacity>
        </View>
        {/* 
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
handleItemPress={handleItemPress}

/> */}
        <Rechargeconfirm
          Lottieimg={require('../../utils/lottieIcons/biomass.json')}
          isModalVisible={bottomSheetVisible}
          onBackdropPress={() => setBottomSheetVisible(false)}
          status={Status}
          details={[
            { label: translate('User Name'), value2: CustomerName },
            { label: translate('Customer ID'), value: mobileNumber },
            { label: translate('Due Date'), value2: dueDate },
            // { label: 'Operator Name', value2: FastagOpt },
            { label: translate('Customer Status'), value2: Status },
            // { label: 'BillAmount', value2: billAmount },

          ]}
          lastlabel={translate('Transaction Amount')}
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



        <BottomSheet animationType="none"  
          onBackdropPress={() => {
            setIsOperatorList(false);
          }}
          isVisible={isOperatorList}
        >
          <View
            style={{
              backgroundColor: colors.white,
              height: SCREEN_HEIGHT / 1.5,
              flex: 1,
              marginBottom: wScale(40),
            }}>
            <View style={{}}>
              <Text style={{}} />
            </View>

            {showStateListData()}
          </View>
        </BottomSheet>

        <BottomSheet animationType="none"  
          onBackdropPress={() => {
            setIsisDistList(false);
          }}
          isVisible={isDistList}>
          <View
            style={{
              backgroundColor: colors.white,
              height: SCREEN_HEIGHT / 1.5,
              flex: 1,
              marginBottom: wScale(40),
            }}>
            <View style={{}}>
              <Text style={{}} />
            </View>

            {showdist ? showDistData() : agency()}
          </View>
        </BottomSheet>

        <BottomSheet animationType="none"  
          // isVisible={bottomSheetVisible}
          onBackdropPress={() => setBottomSheetVisible(false)}>
          <View style={{ bottom: hScale(10) }}>
            <Card>
              <Text>{translate('Due Date')}: {dueDate}</Text>
            </Card>
            <Card>
              <Text> {translate("Agency Code")}: {distributorId}</Text>
            </Card>
            <Card>
              <Text>
                {translate('Mobile Number')} {mobileNumber}
              </Text>
            </Card>

            <Card>
              <Text>{translate("Recharge Amount")}: {amount}</Text>
            </Card>
            <TouchableOpacity
              onPress={() => {
                setBottomSheetVisible(false);
                setProceedSheetVisible(true);
              }}>
              <Text style={styles.DetailButton}>{translate('ConfirmPay')}</Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>
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

export default PrepaidGasScreen1;
