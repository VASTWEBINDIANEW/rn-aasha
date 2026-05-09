import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { setTSpan } from 'react-native-svg/lib/typescript/lib/extract/extractText';
import { useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import { encrypt } from '../../utils/encryptionUtils';
import { useDeviceInfoHook } from '../../utils/hooks/useDeviceInfoHook';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import ShowLoader from '../../components/ShowLoder';
import FlotingInput from '../drawer/securityPages/FlotingInput';
import OnelineDropdownSvg from '../drawer/svgimgcomponents/simpledropdown';
import DynamicButton from '../drawer/button/DynamicButton';
import RecentHistory from '../../components/RecentHistoryBottomSheet';
import OperatorBottomSheet from '../../components/OperatorBottomSheet';
import Rechargeconfirm from '../../components/Rechargeconfirm';
import { useNavigation } from '@react-navigation/native';
import ElectricityOperatorBottomSheet from '../../components/ElectricityOperatorBottomSheet';
import ClosseModalSvg2 from '../drawer/svgimgcomponents/ClosseModal2';
import RecentText from '../../components/RecentText';
import { useLocationHook } from '../../hooks/useLocationHook';

const EducationFeeScreen = () => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}20`;

  const { get, post } = useAxiosHook();
  const [consumerNo, setconsumerNo] = useState(translate(''));
  const [insuranceOptList, setInsuranceOptList] = useState([]);
  const [isOperatorList, setIsOperatorList] = useState(false);
  const [selectbool, setSelectbool] = useState(true);

  const [selectedOpt, setselectedOpt] = useState(
    'Select State & City'
  );
  const [CustomerID, setCustomerID] = useState('');
  const [amount, setAmount] = useState('');
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [ProceedSheetVisible, setProceedSheetVisible] = useState(false);
  const [maxlen, setMaxLen] = useState(10);
  const [isInfo, setIsinfo] = useState(false);
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
  const [dueDate, setDueDate] = useState('');
  const [CustomerName, setCustomerName] = useState('');
  const [custBal, setCustBal] = useState(translate('Balance'));
  const [Status, setStatus] = useState(translate(''));
  const [citylist, setCitylist] = useState([]);
  const [showLoader, setShowLoader] = useState(false);
  const [reqTime, setReqTime] = useState('');
  const [reqId, setReqId] = useState('')
  const [isrecent, setIsrecent] = useState(false);
  const [historylist, setHistorylist] = useState([]);
  const [agencyCode, setAgencyCode] = useState('')
  useEffect(() => {
    EduStateList('');
  }, []);

  const GetDist = async id => {
    try {
      const ur = `${APP_URLS.geteduCityByStateID}${id}`;
      const response = await get({ url: ur });
      setCitylist(response['RESULT']);
      console.log(response);
    } catch (error) {
      console.error('Error fetching distribution data:', error);
      throw error;
    }
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

    console.log('-*-*-*/-/*-*/-*/-/*-/*', item)
    GetDist(item['stateid']);
    // setIsOperatorList(false);
    setAccntvisivility(false);

    setselectedOpt(item['statelist']);
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
      console.log('-------*--**--**--', custparam)
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

  async function EduStateList(opttype) {
    try {
      const url = `${APP_URLS.getEduStateList}`;
      const res = await get({
        url: url,
      });
      console.log(res['RESULT']);

      setInsuranceOptList(res['RESULT']);
    } catch (error) {
      console.error(error);
    }
  }
  async function EduInstitute(stateid, cityid) {
    try {
      const url = `${APP_URLS.GetALLEduInsitutelist}stateid=${stateid}&cityid=${cityid}`;
      const res = await get({
        url: url,
      });
      console.log('GetALLEduInsitutelist',res);
    } catch (error) {
      console.error(error);
    }
  }
  const showBottomSheetList = () => {
    return (
      <FlashList
        style={{ marginBottom: wScale(50), marginHorizontal: wScale(24) }}
        data={selectbool ? insuranceOptList : citylist}

        renderItem={({ item }) => {
          return (
            <View
            >
              <TouchableOpacity
                style={[styles.operatorview]}

                // onPress={async () => {
                //   handleItemPress(item);
                //   setStateid(item['stateid']);
                // }}
                onPress={async () => {
                  // handleItemPress(item);

                  if (selectbool) {
                    handleItemPress(item);
                    setSelectbool(false)
                    setStateid(item['stateid']);


                  } else {
                    if (insuranceOptList.length === 0) {
                      setSelectbool(true);
                    }

                    else {
                      setSelectbool(true);
                      // handleItemPress(item);
                      // // setOperatorcode(item['OPtCode'])
                      // setOperator(item['Operatorname']);
                      setIsOperatorList(false);
                      EduInstitute(stateid, item['CityID']);
                      setCity(item['CityName']);

                    }
                  }
                }} >
                <Text style={[styles.operatornametext]}>
                  {selectbool ? item['statelist'] : item['CityName']}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
        estimatedItemSize={30}
      />
    );
  };
  const { getNetworkCarrier, getMobileDeviceId, getMobileIp } =
    useDeviceInfoHook();
  const { userId ,Loc_Data} = useSelector((state: RootState) => state.userInfo);
  const { latitude, longitude } = useLocationHook();

  const onRechargePress = useCallback(async () => {
    ;
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
    const url = `${APP_URLS.rechTask}rd=${rd}&n=${n1}&ok=${ok1}&amn=${amn}&pc=${agencyCode}&bu=${accnumhint2}&acno&lt&ip=${ip1}&mc&em=${em}&offerprice&commAmount&Devicetoken=${devtoken}&Latitude=${Latitude}&Longitude=${Longitude}&ModelNo=${ModelNo}&City=${City}&PostalCode=${PostalCode}&InternetTYPE=${InternetTYPE}&Addresss=${Addresss}&value1=${value1}&value2=${value2}`;
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
    setselectedOpt('Select State & City');
    setCity('')
    setAmount('');
    setIsinfo(false)
    setShowLoader(false);
    navigation.navigate('Rechargedetails', {
      mobileNumber: consumerNo ?? '',    // Default to an empty string if null or undefined
      Amount: amount ?? 0,               // Default to 0 if null or undefined
      operator: selectedOpt ?? 'N/A',    // Default to 'N/A' if null or undefined
      status: status ?? 'Unknown',      // Default to 'Unknown' if null or undefined
      reqId: reqId ?? '',               // Default to an empty string if null or undefined
      reqTime: reqTime ?? new Date().toISOString(),  // Default to current time if null or undefined
      Message: Message ?? 'No message available'   // Default to 'No message available' if null or undefined
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
  const [stateid, setStateid] = useState();
  async function billInfo() {
    try {
      const config = {
        headers: {
          Authorization: `Bearer`,
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

      const url = `${APP_URLS.rechargeViewBill}billnumber=${consumerNo}&Operator=${optcode}&billunit=&ProcessingCycle=''&acno=''&lt=""&ViewBill="Y"`;
      const res = await get({ url: url });
      console.log(data.Operator);
      console.log(url);
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
        // Alert.alert(res['ADDINFO'], res['Message'], [{ text: 'OK', onPress: () => { } }]);
      }

    } catch (error) { }
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
      const res = await post({ url: url, data, config: config });

      console.log(':', url);
      const billSts = res['RESULT'];
      if (billSts === 'Y') {
        setIsinfo(true);
      } else {
        setIsinfo(false);
      }
      console.log(':', res);
    } catch (error) { }
  }

  const [city, setCity] = useState('Select City');
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

  // Title text ko memoize karein
const headerTitle = useMemo(() => {
  return selectbool ? "Select Your State" : "Select Your City";
}, [selectbool]);

// Close button ka logic memoize karein taaki har render pe calculation na ho
const renderCloseButton = useMemo(() => {
  // Case 1: Agar State selection hai, toh hamesha dikhao
  if (selectbool) {
    return (
      <TouchableOpacity
        onPress={() => setIsOperatorList(false)}
        activeOpacity={0.7}
      >
        <ClosseModalSvg2 />
      </TouchableOpacity>
    );
  }

  // Case 2: Agar City selection hai aur list khali hai
  if (!selectbool && insuranceOptList.length === 0) {
    return (
      <TouchableOpacity
        onPress={() => {
          setIsOperatorList(false);
          setSelectbool(true);
        }}
        activeOpacity={0.7}
      >
        <ClosseModalSvg2 />
      </TouchableOpacity>
    );
  }

  return null;
}, [selectbool, insuranceOptList.length]); // List ki length change hone par hi update hoga
  return (
    <View style={styles.main}>
      <AppBarSecond title={'Education Screen'} actionButton={undefined} onActionPress={undefined} onPressBack={undefined} />

      <View style={styles.container}>

        {showLoader && (
          <ShowLoader />
        )}
        <TouchableOpacity onPress={() => setIsOperatorList(true)}>
          <FlotingInput label={selectedOpt} editable={false} inputstyle={undefined} onChangeTextCallback={undefined}
            labelinputstyle={[
              selectedOpt === "Select State & City"
                ? null
                : styles.labelinputstyle,
            ]}
          />
          {selectedOpt === "Select State & City"
            ? null : (
              <Text style={[styles.circletext, { color: colorConfig.primaryColor }]}>
                {city}
              </Text>

            )}
          <View style={[styles.righticon2]}>

            <OnelineDropdownSvg />
          </View>
        </TouchableOpacity>

        {accntvisivility && (
          <View>
            <FlotingInput label={accnumhint} onChangeTextCallback={(text) => setAgencyCode(text)} inputstyle={undefined}
              labelinputstyle={undefined}
              value={agencyCode}  />
            <TouchableOpacity>
              <Text style={{}}></Text>
            </TouchableOpacity>
          </View>
        )}
        {accntvisivility2 && (
          <View >
            <FlotingInput label={accnumhint2} onChangeTextCallback={(text) => setAccnumhint2(text)}
              value={accnumhint2}  />
            <View style={[styles.righticon2]}>
              <TouchableOpacity>

                <Text style={[styles.infobtntex,]}>{translate("Info")}</Text>
              </TouchableOpacity>

            </View>

          </View>
        )}
        <View>
          <FlotingInput label={paramname} value={consumerNo} 
            
            onChangeTextCallback={text => {
              setconsumerNo(text); setconsumerNo(text.replace(/\D/g, ""));
              if (text.length >= 5) {
                setIsinfo(true)
              } else {
                setIsinfo(false)
              }
            }}
          />
          <View style={[styles.righticon2,]}>
            {isInfo && (
              <TouchableOpacity
                style={styles.infobtn}
              
                onPress={() => {
                  billInfo();
                  setBottomSheetVisible(true);
                }}              >

                <Text style={[styles.infobtntex,]}>{translate("Info")}</Text>

              </TouchableOpacity>
            )}
          </View>
        </View>
        <FlotingInput label={'Enter Amount'}
             maxLength={5}
              value={amount} onChangeTextCallback={text => setAmount(text)}
          keyboardType="number-pad" />
        <DynamicButton title={'Next'} onPress={() => {
          validateFields();
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
           <RecentText/>
          </TouchableOpacity>
        </View>

        <Rechargeconfirm
          Lottieimg={require('../../utils/lottieIcons/open-book.json')}
          isModalVisible={bottomSheetVisible}
          onBackdropPress={() => setBottomSheetVisible(false)}
          status={Status}
          details={[
            { label: 'User Name', value2: CustomerName === '' ? 'N/A' : CustomerName },
            { label: 'Customer ID', value: consumerNo },
            { label: 'Due Date', value2: dueDate === '' ? 'N/A' : dueDate },
            { label: 'Operator Name', value2: selectedOpt },
            { label: 'Customer Status', value2: Status === '' ? 'N/A' : Status },
            // { label: 'BillAmount', value2: billAmount },
            // { label: 'Balance', value2: custBal === 0 ? 'N/A' : custBal },

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
      <BottomSheet animationType="none"   isVisible={isOperatorList}>
  <View style={styles.bottomsheetview}>
    <View style={[styles.StateTitle, { backgroundColor: color1 }]}>
      <View style={styles.titleview}>
        <View>
          <Text style={styles.stateTitletext}>
            {headerTitle}
          </Text>
        </View>
      </View>
      
      {/* Memoized Close Button */}
      {renderCloseButton}
    </View>

    {/* List Section */}
    {showBottomSheetList()}
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
  labelinputstyle: {
    marginTop: hScale(-7),
  },
  circletext: {
    position: "absolute",
    top: hScale(30),
    paddingLeft: wScale(15),
    fontSize: wScale(12),
  },
  operatorview: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: wScale(10),
  },
  operatornametext: {
    textTransform: "capitalize",
    fontSize: wScale(20),
    color: "#000",
    flex: 1,
    borderBottomColor: "#000",
    borderBottomWidth: wScale(0.5),
    alignSelf: "center",
    paddingVertical: hScale(30),
  },
  bottomsheetview: {
    backgroundColor: "#fff",
    height: SCREEN_HEIGHT / 1.3,

    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  titleview: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  StateTitle: {
    paddingVertical: hScale(10),
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: wScale(10),
    marginBottom: hScale(10),
  },
  stateTitletext: {
    fontSize: wScale(22),
    color: "#000",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});
export default EducationFeeScreen;
