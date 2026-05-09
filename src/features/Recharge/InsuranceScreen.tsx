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
  
  Modal,
} from 'react-native';
import { colors } from '../../utils/styles/theme';
import { SCREEN_HEIGHT, hScale, wScale } from '../../utils/styles/dimensions';
import { FlashList } from '@shopify/flash-list';
import { APP_URLS } from '../../utils/network/urls';
import useAxiosHook from '../../utils/network/AxiosClient';
import { BottomSheet, Card } from '@rneui/base';
import { translate } from '../../utils/languageUtils/I18n';
import { useDeviceInfoHook } from '../../utils/hooks/useDeviceInfoHook';
import { RootState } from '../../reduxUtils/store';
import { encrypt } from '../../utils/encryptionUtils';
import { useSelector } from 'react-redux';
import ShowLoader from '../../components/ShowLoder';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import FlotingInput from '../drawer/securityPages/FlotingInput';
import DynamicButton from '../drawer/button/DynamicButton';
import OperatorBottomSheet from '../../components/OperatorBottomSheet';
import Rechargeconfirm from '../../components/Rechargeconfirm';
import { useNavigation } from '@react-navigation/native';
import RecentHistory from '../../components/RecentHistoryBottomSheet';
import OnelineDropdownSvg from '../drawer/svgimgcomponents/simpledropdown';
import RecentText from '../../components/RecentText';
import CloseSvg from '../drawer/svgimgcomponents/CloseSvg';
import CalendarPicker from 'react-native-calendar-picker';
import { useLocationHook } from '../../hooks/useLocationHook';

const InsuranceScreen = () => {
  const { get, post } = useAxiosHook();
  const [textInput1, setTextInput1] = useState('');
  const [consumerNo, setconsumerNo] = useState(translate(''));
  const [textInput3, setTextInput3] = useState('');
  const [textInput4, setTextInput4] = useState('');
  const [insuranceOptList, setInsuranceOptList] = useState([]);
  const [isOperatorList, setIsOperatorList] = useState(false);
  const [selectedOpt, setselectedOpt] = useState(
    translate('Select Your Operator'),
  );  const [selectedOpt2, setselectedOpt2] = useState(
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
  const [CustomerName, setCustomerName] = useState('Consumer No');
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

  useEffect(() => {
    InsuranceOpt('Insurance');
  }, []);
  const navigation = useNavigation<any>();

  const handleItemPress = item => {
    ViewbillInfoStatus(item['OPtCode']);

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
      console.log('+++++++++++++++++++++++++++++++++++', custparam[0]['maxLength'])
      console.log('+++++++++++++++++++++++++++++++++++', item)

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
  useEffect(() => {
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
  }, []);


  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = ('0' + (currentDate.getMonth() + 1)).slice(-2);
  const day = ('0' + currentDate.getDate()).slice(-2);

  const formattedDate = `${year}-${month}-${day}`;
  const { getNetworkCarrier, getMobileDeviceId, getMobileIp } =
    useDeviceInfoHook();
  const { userId  ,Loc_Data } = useSelector((state: RootState) => state.userInfo);
  const { latitude, longitude } = useLocationHook();
 
  const onRechargePress = useCallback(async () => {



    setShowLoader(true)
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

    setconsumerNo('');
    setselectedOpt('Select Your Operator');
    setAmount('');
    setIsinfo(false)
    setShowLoader(false);

    navigation.navigate('Rechargedetails', {
      mobileNumber: consumerNo ?? '',
      Amount: amount ?? 0,
      operator: selectedOpt ?? 'N/A',
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
  async function InsuranceOpt(opttype) {
    try {
      const url = `${APP_URLS.getDthOperator}${opttype}`;
      const res = await get({
        url: url,
      });
      console.log(url);
      setInsuranceOptList(res['myprop2Items']);
    } catch (error) {
      console.error(error);
    }
  }
  const selectOperator = selectedOperator => {
    console.log('Selected Operator:', selectedOperator.length);
    setselectedOpt(selectedOperator);  
    
    setIsOperatorList(false);
const lic =selectedOperator
const licWithoutSpaces = lic.replace(/\s+/g, '');
console.log(licWithoutSpaces.toLowerCase(),licWithoutSpaces.length);

setselectedOpt2(licWithoutSpaces);

    console.log(selectedOperator ===lic,lic.length,'@@@@@@@@@@@@@@@@@@@@@@@@')
    // setOptimg('selectOperatorImage');
  };

  async function billInfo() {
    try {
      const url = `${APP_URLS.rechargeViewBill}billnumber=${consumerNo}&Operator=${optcode}&billunit=${dob}&ProcessingCycle=${email}&acno&lt&ViewBill=Y`;
      console.log(url);
      const res = await get({ url: url });
  
      if (res['RESULT'] === 0) {

        const addinfo = res['ADDINFO'];
        
        if(addinfo.IsSuccess){
          const billinfoo = addinfo['BillInfo'];
          setDueDate(billinfoo["billDueDate"]);
          setAmount(billinfoo["billAmount"]);
          setCustomerName(billinfoo["customerName"]);
          setCustBal(billinfoo["balance"]);
          setAmount(billinfoo["billAmount"]);
        }
        setBottomSheetVisible(true);

        //setstatus(res["customerStatus"])
      } else {
        const addinfo = res['ADDINFO'];
        const message = res['Message'] || addinfo.Message || 'An error occurred';
        Alert.alert('Error', message, [{ text: 'OK', onPress: () => {} }]);
      }
  
    } catch (error) {
      console.error("Error during bill info fetch:", error);
      Alert.alert('Error', 'Something went wrong while fetching the bill info.', [{ text: 'OK', onPress: () => {} }]);
    }
  }
  
  async function ViewbillInfoStatus(optcode) {
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
      const res = await post({ url: url });

      console.log(':', url);
      const billSts = res['RESULT'];
      if (billSts === 'Y') {
        //setIsinfo(true);
      } else {
        // setIsinfo(false);
      }
      console.log(':', res);
    } catch (error) { }
  }

  const validateFields = () => {
    if (paramname == 'Consumer Number') {
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
    } else if (!amount || amount === 'Enter Amount' || parseFloat(amount) <= 0) {
      ToastAndroid.showWithGravity(
        'Please Enter the Recharge Amount',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else {
      setBottomSheetVisible(true);
      billInfo()
    }
  };
  const [dob, setDob] = useState('Select DOB');
  const [email, setEmail] = useState('');
  const [isModalVisible, setModalVisible] = useState(false)

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, '0'); // Get day and pad with 0 if single digit
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Get month (0-based, so add 1) and pad
    const year = date.getFullYear(); // Get the full year

    return `${day}/${month}/${year}`; // Return formatted string
  };
  const onDateChange = (date) => {
    const formattedDate = formatDate(date);

    // Set modal visibility to false
    setModalVisible(false);

    // Set the formatted date to dob state
    setDob(formattedDate);
    console.log(formattedDate)

  };
  return (
    <View style={styles.main}>
      <AppBarSecond title={'Insurance  Screen'} />

      <View style={styles.container}>
        {showLoader && (
          <ShowLoader />
        )}

        <TouchableOpacity onPress={() => setIsOperatorList(true)}>

          <FlotingInput label={selectedOpt} editable={false} />
          <View style={[styles.righticon2]}>

            <OnelineDropdownSvg />

          </View>
        </TouchableOpacity>

        {accntvisivility && (
          <View>
            <FlotingInput label={accnumhint} onChangeTextCallback={(text) => setAgencyCode(text)}
              value={agencyCode}

            />
            <TouchableOpacity>
              <Text style={{}}>📅</Text>
            </TouchableOpacity>
          </View>
        )}

        {selectedOpt2.toLowerCase()== 'lifeinsurancecorporation' && <TouchableOpacity onPress={() => setModalVisible(true)}>
          <FlotingInput
            label="Enter Date of Birth (DD/MM/YYYY)"
            value={dob}
            onChangeTextCallback={formatDate}
            keyboardType="number-pad"
            maxLength={12}
            inputstyle={{}}
            editable={false}
          />
        </TouchableOpacity>}
        {selectedOpt2.toLowerCase() == 'lifeinsurancecorporation' && <FlotingInput
          onChangeTextCallback={text => setEmail(text)}
          label="Enter G-mail"

          value={email}
          editable={true} />}

        {accntvisivility2 && (
          <View >

            <FlotingInput label={accnumhint2} onChangeTextCallback={(text) => setAccnumhint2(text)}
              value={accnumhint2}

            />
            <View style={[styles.righticon2]}>
              <TouchableOpacity>

                <Text style={[styles.infobtntex,]}>{translate("Info")}</Text>
              </TouchableOpacity>

            </View>

          </View>
        )}
        <View>
          {/* <TextInput
            placeholder={paramname}
            value={consumerNo}
            // 
            onChangeText={text => setconsumerNo(text)}
          /> */}

          <FlotingInput label={paramname} value={consumerNo}

            onChangeTextCallback={text => {
              setconsumerNo(text);
              if (text.length >= 5) {
                setIsinfo(true)
              } else {
                setIsinfo(false)
              }
            }}
          />

          {/* {isInfo && (
            <TouchableOpacity
              onPress={() => {
                billInfo();
                setBottomSheetVisible(true);
              }}>
              <Text style={{}}>Info</Text>
            </TouchableOpacity>
          )} */}

          <View style={[styles.righticon2,]}>
            {isInfo && (
              <TouchableOpacity
                style={styles.infobtn}
                // onPress={() => {
                //   handleInfoPress()

                //   setShowLoader2(true)

                // }}
                onPress={() => {
                  billInfo();
                }}              >

                <Text style={[styles.infobtntex,]}>{translate("Info")}</Text>

              </TouchableOpacity>
            )}
          </View>
        </View>
        <FlotingInput label={'Enter Amount'}
          maxLength={5}
          value={amount} onChangeTextCallback={text => setAmount(text)} keyboardType="number-pad" />
        {/* <TextInput
          style={styles.DetailButton}
          placeholder={translate('Enter Amount')}
          value={amount}
          onChangeText={text => setAmount(text)}
        /> */}

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
            <RecentText />
          </TouchableOpacity>
        </View>

        <OperatorBottomSheet
          isModalVisible={isOperatorList}
          operatorData={insuranceOptList}
          //// stateData={stateList}
          selectedOperator={() => { selectedOpt; setIsOperatorList(false) }}
          setModalVisible={setIsOperatorList}
          selectOperator={selectOperator}
          setOperatorcode={setOptCode}
          showState={false}
          // selectOperatorImage={setOptimg}
          handleItemPress={(item) => { handleItemPress(item) }}

        />

        <Rechargeconfirm
          Lottieimg={require('../../utils/lottieIcons/Insurance3.json')}
          isModalVisible={bottomSheetVisible}
          onBackdropPress={() => setBottomSheetVisible(false)}
          status={Status}
          details={[
            { label: 'User Name', value2: CustomerName },
            { label: 'Customer ID', value: consumerNo },
            { label: 'Due Date', value2: dueDate },
            { label: 'Operator Name', value2: selectedOpt },
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
            } else {

              onRechargePress();
              setBottomSheetVisible(false);
              setProceedSheetVisible(true);
            }
          }
          }
        />



        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={toggleModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* <Text style={styles.modalHeader}>{translate("Pick_a_Date")}</Text> */}

              {/* CalendarPicker Component */}
              <CalendarPicker
                onDateChange={onDateChange}
                selectedDayColor="#00BFFF" // Customize the selected day color
                selectedDayTextColor="#FFF" // Customize the selected day text color
              />

              {/* Close Modal Button */}

              <TouchableOpacity onPress={toggleModal}>
                <CloseSvg color='red' size={hScale(20)} />

              </TouchableOpacity>

            </View>
          </View>
        </Modal>
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
  selectedDateText: {
    fontSize: 18,
    marginTop: 20,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
  },
  modalContent: {
    width: hScale(350),
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalHeader: {
    fontSize: 18,
    marginBottom: 20,
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

export default InsuranceScreen;
