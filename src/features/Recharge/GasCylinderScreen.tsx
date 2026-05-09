
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
  KeyboardAvoidingView, Platform,
  ScrollView
} from 'react-native';
import { BottomSheet, Card, Image } from '@rneui/themed';
import { translate } from '../../utils/languageUtils/I18n';
import { APP_URLS } from '../../utils/network/urls';
import { colors } from '../../utils/styles/theme';
import FlashList from '@shopify/flash-list/dist/FlashList';
import { SCREEN_HEIGHT, hScale, wScale } from '../../utils/styles/dimensions';
import DropdownSvg from '../../utils/svgUtils/DropdownSvg';
import useAxiosHook from '../../utils/network/AxiosClient';
import { useDeviceInfoHook } from '../../utils/hooks/useDeviceInfoHook';
import { useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import { useLocationHook } from '../../utils/hooks/useLocationHook';
import { encrypt } from '../../utils/encryptionUtils';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import ShowLoader from '../../components/ShowLoder';
import FlotingInput from '../drawer/securityPages/FlotingInput';
import OnelineDropdownSvg from '../drawer/svgimgcomponents/simpledropdown';
import DynamicButton from '../drawer/button/DynamicButton';
import RecentHistory from '../../components/RecentHistoryBottomSheet';
import OperatorBottomSheet from '../../components/OperatorBottomSheet';
import Rechargeconfirm from '../../components/Rechargeconfirm';
import ElectricityOperatorBottomSheet from '../../components/ElectricityOperatorBottomSheet';
import ClosseModalSvg2 from '../drawer/svgimgcomponents/ClosseModal2';
import { useNavigation } from '@react-navigation/native';
import { combineSlices } from '@reduxjs/toolkit';
import RecentText from '../../components/RecentText';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GasCylinderScreen = () => {

  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}20`;
  const [CustomerID, setCustomerID] = useState('');
  const [amount, setAmount] = useState('');
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);
  const [ProceedSheetVisible, setProceedSheetVisible] = useState(false);
  const [maxlen, setMaxLen] = useState(10);
  const [isInfo, setIsinfo] = useState(true);
  const [dueDate, setDueDate] = useState('Date');
  const [CustomerName, setCustomerName] = useState('N/A');
  const [selectbool, setSelectbool] = useState(true);

  const [GasCylenderBillOpt, setGasCylenderBillOpt] = useState(
    []
  );
  const [district, setdistrict] = useState('Select Your District');
  const [operator, setCylenderBillOpt] = useState('Select Your Operator');
  const [isdist, setIsdist] = useState(true);
  const [distCode, setDistCode] = useState('');
  const [showLoader, setShowLoader] = useState(false);
  const [reqTime, setReqTime] = useState('');
  const [reqId, setReqId] = useState('')
  const [isrecent, setIsrecent] = useState(false);
  const [historylist, setHistorylist] = useState([]);

  useEffect(() => {
    Statelist();
    // handlePostRequest();
    // handlePostRequest();
  }, []);
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
  const { get, post } = useAxiosHook();
  async function Statelist() {
    const data = {};
    try {
      const url = `${APP_URLS.gasCylinderState}`;
      const res = await post({ url: url, config: null });
      setstatelist(res['data']);
    } catch (error) { }
  }

  async function fatchDist(state: any) {
    console.log(state);
    try {
      const data = {
        statename: state,
      };

      const url = `${APP_URLS.DistrictByState}${state}`;
      const res = await post({ url: url, config: null });

      console.log(res['data']);
      setdistrictData(res['data']);

      //  setshowdistrictData(true);
    } catch (error) { }
  }
  const [statelist, setstatelist] = useState([]);
  const [districtData, setdistrictData] = useState([]);
  const [distributorId, setdistributorId] = useState('');
  const [MobileNumber, setMobileNumber] = useState('');

  const [showdistrictData, setshowdistrictData] = useState(false);
  const [stateData, setStateData] = useState(translate('Select Your State'));
  const [selectedBharat, setSeleectedBharat] = useState(false)
  const handleInfoPress = () => {
    billInfo();
    setBottomSheetVisible(true);
  };
  const [showStateList, setshowStateList] = useState(false);
  const showStateListData = () => {
    return (
      <FlashList
        data={statelist}
        renderItem={({ item }) => {
          return (
            <View
            >
              <TouchableOpacity
                style={[styles.operatorview]}

                onPress={async () => {
                  setshowStateList(false);
                  setStateData(item);
                  fatchDist(item);
                  console.log(item)
                }}>
                <Text style={[styles.operatornametext]}>

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

  async function getIn(stateName: string, district: string) {
    console.log(stateName, district);
    try {
      const url = `${APP_URLS.getIndaneAgency}statename=${stateName}&District=${district}`;

      const res = await post({ url: url });
      console.log('', res);

      setGasCylenderBillOpt(res['data']);
    } catch (error) { }
  }

  const [optcode, setOptCode] = useState('');
  const [custBal, setCustBal] = useState();
  async function billInfo() {
    try {
      const url = `${APP_URLS.rechargeViewBill}billnumber=${CustomerID}&Operator=${distCode}&billunit&ProcessingCycle&acno&lt&ViewBill=Y`;

      //const url = `${APP_URLS.getdthCustomerInfo}optname=${distCode}&mobileno=${CustomerID}`;
      const res = await get({
        url: url,
      });

      console.log('res-*--*-*-*-*-*-*-*-*-***--*-*', res);
      console.log(url, 'urllll-*--*-*-*-*-*-*-*-*-***--*-*');

      if (res.RESULT == 0) {
        setDueDate(res['rechargedueDate']);
        setCustomerName(res['customerName']);
        setCustBal(res['balance']);
        //  setstatus(res['customerStatus']);
        console.log(res['balance']);
        setBottomSheetVisible(true);
        // setShowLoader2(false);

      } else {
        Alert.alert('Info', res.ADDINFO);
        setShowLoader2(false);

      }
    } catch (error) {
      console.error('Error fetching bill info:', error);

    }

    console.log('urllll-*--*-*-*-*-*-*-*-*-***--*-*');

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
  const showBottomSheetList = () => {
    return (
      <FlashList
        data={selectbool ? districtData : GasCylenderBillOpt}
        renderItem={({ item }) => {
          return (
            <View
            >
              <TouchableOpacity
                style={[styles.operatorview]}

                onPress={async () => {

                  if (selectbool) {
                    setSelectbool(false);
                    setdistrict(item);

                    console.log('stateData', stateData)
                    switch (ddlStatus) {
                      case 'HP':
                        getHpAgency(stateData, item);

                        break;
                      case 'Indian':
                        getIn(stateData, item);

                        break;
                      case 'Bharat':
                        break;
                      default:
                        break;
                    }

                  } else {
                    console.log(item)
                    setDistCode(item['Distcode'])
                    setCylenderBillOpt(item['Name'])
                    setshowdistrictData(false);
                    setSelectbool(true);

                  }

                }}>
                <Text style={[styles.operatornametext]}>

                  {selectbool ? item : item['Name']}
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
  const { userId } = useSelector((state: RootState) => state.userInfo);
  const { latitude, longitude } = useLocationHook();
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
    const loc = await readLatLongFromStorage();
    setShowLoader(true)
    const mobileNetwork = await getNetworkCarrier();
    const ip = await getMobileIp();
    const encryption = await encrypt([
      userId,
      CustomerID,
      operator,
      amount,
      loc?.latitude,
      loc?.longitude,
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
    const url = `${APP_URLS.rechTask}rd=${rd}&n=${n1}&ok=${ok1}&amn=${amn}&pc=${distributorId}&bu=${MobileNumber}&acno&lt&ip=${ip1}&mc&em=${em}&offerprice&commAmount&Devicetoken=${devtoken}&Latitude=${Latitude}&Longitude=${Longitude}&ModelNo=${ModelNo}&City=${City}&PostalCode=${PostalCode}&InternetTYPE=${InternetTYPE}&Addresss=${Addresss}&value1=${value1}&value2=${value2}&billduedate=${dueDate}`;
    let status, Message;
    try {
      const res = await post({
        url: url,
      });
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

    setCustomerID('');
    setCylenderBillOpt('Select Your Operator');
    setAmount('');
    setIsinfo(false)
    setShowLoader(false);

    navigation.navigate('Rechargedetails', {
      mobileNumber: CustomerID,
      Amount: amount,
      operator: operator,
      status,
      reqId,
      reqTime,
      Message
    });

  }, [
    amount,
    getMobileIp,
    getNetworkCarrier,
    latitude,
    longitude,
    CustomerID,
    operator,
    post,
    userId,
  ]);
  async function getHpAgency(stateName: string, district: string) {
    console.log(stateName, district);
    try {
      const url = `${APP_URLS.hpAgency}statename=${stateName}&District=${district}`;

      const res = await post({ url: url });
      setGasCylenderBillOpt(res['data']);
      setSelectbool(false);
      console.log(res);
    } catch (error) {

    }
  }
  const [ddlStatus, setDdlStatus] = useState('HP');

  const Options = () => {
    const buttonData = [
      { title: 'Hp', key: 'Hp' },
      { title: 'Indian', key: 'Indian' },
      { title: 'Bharat', key: 'Bharat' },
    ];

    const handlePress = async (key) => {


      setSelectedFilter(key);
      console.log(`Selected Filter: ${key}`);
      setDdlStatus(key);
      switch (key) {
        case "Hp":
          setSeleectedBharat(false)
          break;
        case 'Indian':
          setSeleectedBharat(false)

          break;
        case 'Bharat':
          setSeleectedBharat(true)
          break;
        default:
          break;
      }
    };

    return (
      <View style={styles.row}>
        {buttonData.map((button) => (
          <TouchableOpacity
            key={button.key}
            style={[
              styles.button,
              { backgroundColor: selectedFilter === button.key ? 'green' : 'lightgreen' },
            ]}
            onPress={() => handlePress(button.key)}
          >
            <Text style={styles.buttonText}>{button.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
  const [selectedFilter, setSelectedFilter] = useState('Hp');
  return (
    <View style={styles.main}>
      <AppBarSecond title={'Gas Cylinder'} />

      {/* KeyboardAwareScrollView पूरे फॉर्म को कीबोर्ड से ऊपर रखेगा */}
      <KeyboardAwareScrollView
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={100}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 ,paddingBottom:50 }}
      >
        <Options />

        <View style={styles.container}>
          {showLoader && <ShowLoader />}

          {/* State Selection - Only if not Bharat Gas */}
          {selectedBharat === false && (
            <TouchableOpacity
              onPress={() => setshowStateList(true)}
            >
              <FlotingInput label={stateData} editable={false} />
              <View style={[styles.righticon2]}>
                <OnelineDropdownSvg />
              </View>
            </TouchableOpacity>
          )}

          {/* District Selection - Only if not Bharat Gas */}
          {selectedBharat === false && (
            <TouchableOpacity
              onPress={() => setshowdistrictData(true)}
            >
              <FlotingInput label={district} editable={false} />
              <View style={[styles.righticon2]}>
                <OnelineDropdownSvg />
              </View>
            </TouchableOpacity>
          )}

          {/* Operator Selection - Only if not Bharat Gas */}
          {selectedBharat === false && (
            <View>
              <FlotingInput label={operator} editable={false} />
              <View style={[styles.righticon2]}>
                <OnelineDropdownSvg />
              </View>
            </View>
          )}

          {/* Fields for Bharat Gas */}
          {selectedBharat === true && (
            <View>
              <FlotingInput
                label={'Agency Code'}
                keyboardType="numeric"
                onChangeTextCallback={(text) => setdistributorId(text)}
                value={distributorId}
              />
              <FlotingInput
                label={'Mobile Number'}
                keyboardType="numeric"
                maxLength={10}
                onChangeTextCallback={(text) => setMobileNumber(text)}
                value={MobileNumber}
              />
            </View>
          )}

          {/* Customer ID & Info Logic */}
          <View style={{ position: 'relative' }}>
            <FlotingInput
              label={'Customer Id'}
              value={CustomerID}
              keyboardType="numeric"
              maxLength={maxlen}
              onChangeTextCallback={text => {
                setCustomerID(text);
                setIsinfo(text.length >= 5);
              }}
            />
            <View style={[styles.righticon2]}>
              {isInfo && (
                <TouchableOpacity
                  style={styles.infobtn}
                  onPress={handleInfoPress}
                >
                  <Text style={[styles.infobtntex]}>{translate("Info")}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Amount Input */}
          <FlotingInput
            label={'Enter Amount'}
            value={amount}
            keyboardType="numeric"
            onChangeTextCallback={text => {
              setAmount(text.replace(/\D/g, ""));
            }}
          />

          <DynamicButton
            title={'Next'}
            onPress={() => { setProceedSheetVisible(true) }}
          />

          {/* Recent History Toggle */}
          <TouchableOpacity
            onPress={() => setIsrecent(true)}
            style={styles.recentviewbtn}
          >
            <RecentText />
          </TouchableOpacity>

        </View>
      </KeyboardAwareScrollView>

      {/* Modals & BottomSheets (Z-index के लिए ScrollView के बाहर) */}
      <RecentHistory
        isModalVisible={isrecent}
        setModalVisible={setIsrecent}
        historylistdata={historylist}
        onBackdropPress={() => setIsrecent(false)}
      />

      <Rechargeconfirm
        Lottieimg={require('../../utils/lottieIcons/loan.json')}
        isModalVisible={ProceedSheetVisible}
        onBackdropPress={() => setProceedSheetVisible(false)}
        details={[
          { label: 'User Name', value2: CustomerName },
          { label: 'Customer ID', value: CustomerID },
          { label: 'Due Date', value2: dueDate },
          { label: 'Operator Name', value2: operator },
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
          }
        }}
      />

      {/* District/Operator List Sheet */}
      <BottomSheet animationType="none" isVisible={showdistrictData}>
        <View style={styles.bottomsheetview}>
          <View style={[styles.StateTitle, { backgroundColor: color1 }]}>
            <Text style={styles.stateTitletext}>
              {selectbool ? "Select Your District" : "Select Your Operator"}
            </Text>
            <TouchableOpacity onPress={() => setshowdistrictData(false)}>
              <ClosseModalSvg2 />
            </TouchableOpacity>
          </View>
          {showBottomSheetList()}
        </View>
      </BottomSheet>

      {/* State List Sheet */}
      <BottomSheet animationType="none" isVisible={showStateList}>
        <View style={styles.bottomsheetview}>
          <View style={[styles.StateTitle, { backgroundColor: color1 }]}>
            <Text style={styles.stateTitletext}>{translate("Select_Your_State")}</Text>
            <TouchableOpacity onPress={() => setshowStateList(false)}>
              <ClosseModalSvg2 />
            </TouchableOpacity>
          </View>
          {showStateListData()}
        </View>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fff',
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: hScale(17),
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
  button: {
    flex: 1,
    marginHorizontal: hScale(5),
    paddingVertical: hScale(17),
    borderRadius: hScale(5),
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: hScale(17),
  },
});

export default GasCylinderScreen;

