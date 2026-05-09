import { translate } from "../../utils/languageUtils/I18n";
import {BottomSheet, Card, Image} from '@rneui/themed';
import LottieView from 'lottie-react-native';
import React, {useEffect, useState} from 'react';
import {PermissionsAndroid, ScrollView, ToastAndroid} from 'react-native';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import {APP_URLS} from './../../utils/network/urls';
import useAxiosHook from './../../utils/network/AxiosClient';
import {translate} from '../../utils/languageUtils/I18n';
import {encrypt} from '../../utils/encryptionUtils';
import {hScale} from '../../utils/styles/dimensions';
import {useDeviceInfoHook} from '../../utils/hooks/useDeviceInfoHook';
import TabBar from './TabView/TabBarView';
const MobileRecharge = () => {
  const [selectedButton, setSelectedButton] = useState('Prepaid');
  const [mobileNumber, setMobileNumber] = useState('');
  const [Amount, setAmount] = useState('');
  const [isViewPlans, setViewPlans] = useState(true);

  const [isOperatorModalVisible, setOperatorModalVisible] = useState(false);
  const [isStateModalVisible, setStateModalVisible] = useState(false);
  const [operator, setOperator] = useState('Operator');
  const [state, setState] = useState('Select Your Circle');
  const [stateslist, setstateslist] = useState([]);
  const [ispost, setispost] = useState(true);
  const [operators, setOperatorlist] = useState([]);
  const [operatorcode, setOperatorcode] = useState('');

  const {get, post} = useAxiosHook();
  async function stateList() {
    try {
      const response = await get({url: `${APP_URLS.getStates}`});
      setstateslist(response);
      console.log(response);
    } catch (error) {
      console.error('Error fetching  state list:', error.message);
      throw error;
    } finally {
    }
  }

  useEffect(() => {
    getopertaorlist('Prepaid');
    stateList();
    setSelectedOption('Prepaid');
  }, []);

  async function getopertaorlist(op: any) {
    try {
      const data = {};
      const url = await `${APP_URLS.getDthOperator}${op}`;
      const response = await get({
        url: url,
      });
      console.log(response);

      const res = response['myprop2Items'];
      console.log(res);
      setOperatorlist(res);
      // setispost(res['postpaid']);
      // setOperator(res['Operator']);
      // setState(res['Circle']);
      if (ispost) {
        setSelectedOption('Prepaid');
      } else {
        setSelectedOption('prepaid');
      }
    } catch (error) {}
  }

  async function getopertaor(mo: any) {
    try {
      const data = {};
      const url = await `${APP_URLS.mobileRecCircle}${mo}`;
      const response = await post({
        url: url,
        data,
        config: {
          headers: {
            Authorization: 'bearer',
          },
        },
      });

      const res = response['Response'];
      console.log(res);
      setispost(res['postpaid']);
      setOperator(res['Operator']);
      checkOperator(res['Operator']);
      setState(res['Circle']);
      if (ispost) {
        setSelectedOption('Prepaid');
      } else {
        setSelectedOption('prepaid');
      }
    } catch (error) {}
  }

  const requestContactPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: 'Contact Permission',
          message:
            'key_thisappn_100',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Contact permission granted');
      } else {
        console.log('Contact permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };
  const [contacts, setContacts] = useState([]);

  const [selectedOption, setSelectedOption] = useState('Prepaid');
  const [rechType, setRechtype] = useState('....');
  const options = ['Prepaid', 'Postpaid'];

  const handleSelect = option => {
    setSelectedOption(option);
    setViewPlans(true);
    setRechtype(option);
    if (option == 'Prepaid') {
      setViewPlans(true);
    } else {
      setViewPlans(false);
    }
    console.log(option);
  };
  const validateFields = () => {
    if (!mobileNumber) {
      ToastAndroid.showWithGravity(
        'Please Enter Mobile Number',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else if (mobileNumber.length < 10) {
      ToastAndroid.showWithGravity(
        'Please Enter a 10 Digit Mobile Number',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else if (operator === 'Operator') {
      ToastAndroid.showWithGravity(
        'Please Select an Operator',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else if (state === 'Select Your Circle') {
      ToastAndroid.showWithGravity(
        'Please Select Your Circle',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else if (!Amount || Amount === 'Enter Amount') {
      ToastAndroid.showWithGravity(
        'Please Enter the Recharge Amount',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else {
      setIsDetail(true);
      updateProceedButtonVisibility();
    }
  };
  const toggleOperatorModal = () => {
    setOperatorModalVisible(!isOperatorModalVisible);
    updateProceedButtonVisibility();
  };

  const toggleStateModal = () => {
    setStateModalVisible(!isStateModalVisible);
  };

  const selectOperator = selectedOperator => {
    console.log('Selected Operator:', selectedOperator);
    setOperator(selectedOperator);
    toggleOperatorModal();
  };

  const selectState = selectedState => {
    console.log('Selected State:', selectedState);
    setState(selectedState);
    toggleStateModal();
  };

  const updateProceedButtonVisibility = () => {
    const isValid =
      mobileNumber.length >= 10 &&
      operator !== 'Operator' &&
      state !== 'Select Your Circle' &&
      Amount !== '' &&
      Amount !== 'Enter Amount';
    if (isValid) {
      setisDetailButton(true);
      console.log('y');
    } else {
      setisDetailButton(false);
      console.log('N');
    }
  };

  const [isDetailButton, setisDetailButton] = useState(false);
  useEffect(() => {
    setRechtype(translate('Prepaid'));
  }, []);
  const [isDetail, setIsDetail] = useState(false);
  const RadioButton = ({options, selectedOption, onSelect}) => {
    return (
      <View style={styles.radioButtonContainer}>
        {options.map(option => (
          <TouchableOpacity
            key={option}
            style={styles.radioButton}
            onPress={() => onSelect(option)}>
            <View
              style={[
                styles.radioButtonInner,
                {backgroundColor: option === selectedOption ? '#db1a46' : '#'},
              ]}>
              {option === selectedOption && (
                <View style={styles.radioButtonSelectedInner} />
              )}
            </View>
            <Text
              style={{
                color: option === selectedOption ? '#0b754e' : '#fe8276',
                left: 10,
              }}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const {getMobileDeviceId, getAndroidIdInfo} = useDeviceInfoHook();

  function checkOperator(operatorName) {
    if (operatorName === 'JIO') {
      setOperatorcode('RJIO');
      console.log('Jio is selected.');
    } else if (operatorName === 'Airtel Prepaid') {
      setOperatorcode('AT');
    } else if (operatorName == 'Airtel Pre on Post') {
      setOperatorcode('APP');
    } else if (operatorName == 'Airtel') {
      setOperatorcode('A');
    } else if (operatorName == 'Idea') {
      setOperatorcode('I');
    } else if (operatorName == 'BSNL') {
      setOperatorcode('BS');
    } else if (operatorName == 'VodaIdea') {
      setOperatorcode('VII');
    } else if (operatorName == 'Jio lite') {
      setOperatorcode('JIOL');
    } else if (operatorName == 'Vodafone') {
      setOperatorcode('V');
      if (operatorName == 'JIO') {
        setOperatorcode('jio');
      }
      if (operatorName == '') {
        setOperatorcode('V');
      }
    }
  }
  const test = async () => {
    const encryption = await encrypt([
      '87c2a1e1-4059-4ec0-b853-42bdac3a741a',
      mobileNumber,
      operatorcode,
      '10',
      'lat',
      'long',
      'city',
      'address',
      'postcode',
      'mobileNetwork',
      '192.168.245.122',
      '57bea5094fd9082d',
    ]);
    console.log(encryption.encryptedData);

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

    const url =
      await `${APP_URLS.rechTask}rd=${rd}&n=${n1}&ok=${ok1}&amn=${amn}&pc&bu&acno&lt&ip=${ip1}&mc&em=${em}&offerprice&commAmount&Devicetoken=${devtoken}&Latitude=${Latitude}&Longitude=${Longitude}&ModelNo=${ModelNo}&City=${City}&PostalCode=${PostalCode}&InternetTYPE=${InternetTYPE}&Addresss=${Addresss}&value1=${value1}&value2=${value2}&circle=Maharashtra`;

    console.log(url);

    /*   const u3 =   `ip=${encryption.encryptedData[10]}&em=57bea5094fd9082d&offerprice&commAmount&Devicetoken=${encryption.encryptedData[6]}&Latitude=${encryption.encryptedData[4]}&Longitude=${encryption.encryptedData[5]}&ModelNo=${encryption.encryptedData[0]}&
  City=${encryption.encryptedData[6]}&PostCode=${encryption.encryptedData[8]}&InternetTYPE=${encryption.encryptedData[9]}&value1=${encryption.keyEncode}&value2=${encryption.ivEncode}&circle=Maharashtra`
  console.log(u3); */

    // const u2 = `${APP_URLS.rechTask}rd=BDXdpedLJXnJufUIYrQinxt1iiER%2Bgd7LwG4UqWCLGx24OuBMZd%2Bc0%2BXcscM3yue&n=Bdf111%2BHmZucbAuLT83s%2BQ%3D%3D&ok=onVijEH%2F7Ar9PIFo3gH9fg%3D%3D&amn=10&pc&bu&acno&lt&ip=RjMwRwAgsZ2SnYwlmORmxA%3D%3D&mc&em=57bea5094fd9082d&offerprice&commAmount&Devicetoken=tx7GeNcb5JmHDkgSkoHcHw%3D%3D&Latitude=35YSMc5JiNuH2GlLOaHTcw%3D%3D&Longitude=IVHg9HpD0J%2Fx8fyL9aA6Yw%3D%3D&ModelNo=bs%2Bty1fDHEIWTgznvLrkr9nOURBAS86hv%2F68UP4ue48%3D&City=tx7GeNcb5JmHDkgSkoHcHw%3D%3D&PostalCode=PFhaJnqB7%2FqYTbjRZv0XNQ%3D%3D&InternetTYPE=32CKbTm%2B3u0ykrgv54PMdw%3D%3D&Addresss=7o9GYYAe%2Bmwi6YOSVRx1vw%3D%3D&value1=YmYzZGE1OTAtYzVhOC0xMQ%3D%3D&value2=MzAwMWVkYjMtY2Q3My00Zg%3D%3D&circle=Maharashtra`
    const res = await post({
      url: url,
      config: {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
        },
      },
    });

    console.log(res);
  };
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <View style={styles.container}>
        <View style={styles.container}>
          <RadioButton
            options={options}
            selectedOption={selectedOption}
            onSelect={handleSelect}
          />
        </View>
        
        <View style={{flexDirection: 'row'}}>
          <Card
            containerStyle={{
              height: hScale(70),
              alignContent: 'center',
              borderRadius: 10,
              left: -2,
              width: '90%',
            }}>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <LottieView
                autoPlay={true}
                style={{height: 45, width: 45, top: -6, left: -10}}
                source={require('../../utils/lottieIcons/Mobilephone.json')}
              />
              <TextInput
                style={styles.input}
                placeholder="Mobile Number"
                placeholderTextColor="black"
                onChangeText={text => {
                  if (text.length === 10) {
                    getopertaor(text);
                  }
                  setMobileNumber(text);
                  updateProceedButtonVisibility();
                }}
                value={mobileNumber}
                textAlign="center"
                keyboardType="number-pad"
              />

              <TouchableOpacity onPress={requestContactPermission}>
                <LottieView
                  autoPlay={false}
                  style={{height: 35, width: 35, top: 5, left: 0}}
                  source={require('../../utils/lottieIcons/Phonebook.json')}
                />
              </TouchableOpacity>
            </View>
          </Card>
        </View>

        <View style={{flexDirection: 'row', width: '90%'}}>
          <Card
            containerStyle={{
              height: 70,
              borderRadius: 10,
              left: -15,
              width: '100%',
            }}>
            <LottieView
              autoPlay={true}
              style={{height: 45, width: 45, top: -6, left: -10}}
              source={require('../../utils/lottieIcons/Mobilephone.json')}
            />
            <TouchableOpacity
              style={{
                marginTop: -75,
                paddingVertical: 10,
                width: '90%',
                alignContent: 'space-between',
                left: 30,
              }}
              onPress={toggleOperatorModal}>
              <Text style={styles.operatorButton}>{operator}</Text>
            </TouchableOpacity>
          </Card>
        </View>

        <View style={{flexDirection: 'row', width: '90%'}}>
          <Card
            containerStyle={{
              height: 70,
              borderRadius: 10,
              left: -15,
              width: '100%',
            }}>
            <LottieView
              autoPlay={true}
              style={{height: 45, width: 45, top: -6, left: -10}}
              source={require('../../utils/lottieIcons/idea3.json')}
            />
            <TouchableOpacity
              style={{
                marginTop: -75,
                paddingVertical: 10,
                width: '90%',
                alignContent: 'space-between',
                left: 30,
              }}
              onPress={toggleStateModal}>
              <Text style={styles.CircleButton}>{state}</Text>
            </TouchableOpacity>
          </Card>
        </View>
        <View style={{flexDirection: 'row'}}>
          <Card
            containerStyle={{
              height: 70,
              alignContent: 'center',
              borderRadius: 10,
              left: -2,
              width: '90%',
            }}>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <Text style={{color: 'green', fontSize: 30}}>₹</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter Amount"
                placeholderTextColor="black"
                onChangeText={text => {
                  setAmount(text);
                  if (Amount == '') {
                    setisDetailButton(false);
                  } else {
                    updateProceedButtonVisibility();
                  }
                }}
                onBlur={() => {
                  updateProceedButtonVisibility();
                }}
                value={Amount}
                textAlign="center"
                keyboardType="number-pad"
              />

              <View style={{width: 51}}>
                {isViewPlans && (
                  <TouchableOpacity>
                    <Text style={{width: 50, color: '#ff8985'}}>
                      View Plans
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Card>
        </View>

        <TouchableOpacity
          style={{height: 50}}
          onPress={() => {
            test();
          }}>
          {isDetailButton && (
            <View style={styles.PayButton}>
              <Text
                style={{
                  margin: 10,
                  color: '#ffff',
                  fontSize: 18,
                  alignItems: 'center',
                }}>
                Proceed{' '}
              </Text>
            </View>
          )}
        </TouchableOpacity>
        <ScrollView horizontal contentContainerStyle={styles.container}>
          <></>
        </ScrollView>
        <BottomSheet animationType="none"  
          isVisible={isOperatorModalVisible}
          onBackdropPress={() => {
            setOperatorModalVisible(false);
          }}
          containerStyle={{backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)'}}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{operator}</Text>
            <FlatList
              data={operators}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  onPress={() => {
                    selectOperator(item['Operatorname']);
                    setOperatorcode(item['OPtCode']);
                  }}
                  style={{flexDirection: 'row', width: '80%'}}>
                  <Card containerStyle={styles.IconCardStyle}>
                    {/*  <Image
                      style={{ height: 30, width: 30, }}
                      source={getLottieSource(item)}
                    /> */}
                  </Card>
                  <Card containerStyle={styles.ListCardContainerStyle}>
                    <Text style={styles.operatorItem}>{item}</Text>
                  </Card>
                </TouchableOpacity>
              )}
            />
          </View>
        </BottomSheet>

        <BottomSheet animationType="none"  
          isVisible={isStateModalVisible}
          containerStyle={{backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)'}}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{translate("Select_Circle")}</Text>
            <FlatList
              data={stateslist}
              style={{width: '100%'}}
              keyExtractor={(_item, index) => index.toString()}
              renderItem={({item}) => (
                <TouchableOpacity
                  onPress={() => selectState(item['State Name'])}>
                  <Card containerStyle={styles.statelistCard}>
                    <Text style={styles.operatorItem}>
                      {item['State Name']}
                    </Text>
                  </Card>
                </TouchableOpacity>
              )}
            />
          </View>
        </BottomSheet>
        <BottomSheet animationType="none"  
          onBackdropPress={() => {
            setIsDetail(false);
          }}
          isVisible={isDetail}
          containerStyle={{backgroundColor: 'rgba(0.5, 0.25, 0, 0.2)'}}>
          <View>
            <Card containerStyle={{flexDirection: 'row'}}>
              <Text>{translate("Mobile_Number")}</Text>
              <Text>{mobileNumber} </Text>
            </Card>

            <Card containerStyle={{flexDirection: 'row'}}>
              <Text>{translate("type")}</Text>
              <Text>{rechType} </Text>
            </Card>

            <Card containerStyle={{flexDirection: 'row'}}>
              <Text>{translate("Operator")}</Text>
              <Text>{operator} </Text>
            </Card>

            <Card containerStyle={{flexDirection: 'row'}}>
              <Text>{translate("Circle")}</Text>
              <Text>{state} </Text>
            </Card>
            <TouchableOpacity
              onPress={() => {}}
              style={{borderRadius: 10, bottom: 10}}>
              <Card containerStyle={{borderRadius: 10}}>
                <Text>{translate("Confirm_And_Pay")}</Text>
              </Card>
            </TouchableOpacity>
            <View style={{bottom: 30}}></View>
          </View>
        </BottomSheet>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    marginTop: '1%',
  },

  IconCardStyle: {
    height: 70,
    alignContent: 'center',
    alignSelf: 'center',
    borderRadius: 10,
    width: 70,
  },
  ListCardContainerStyle: {
    height: 70,
    alignContent: 'center',
    borderRadius: 10,
    left: -25,
    width: '80%',
  },
  statelistCard: {
    height: 60,
    borderRadius: 10,
  },

  CardContainerStyle: {
    flexDirection: 'row',
    height: 70,
    alignContent: 'center',
    borderRadius: 10,
    left: 0,
    width: '90%',
  },
  container: {
    alignContent: 'space-between',
    justifyContent: 'center',
    alignItems: 'center',
  },

  PayButton: {
    marginBottom: 10,
    marginTop: 10,
    paddingHorizontal: 24,
    borderBlockColor: '#000000',
    borderColor: '#ffff',
    borderWidth: 1,
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    padding: 5,
    backgroundColor: '#fe8276',
    height: 56,
    width: '70%',
    shadowColor: 'black',
  },

  input: {
    marginTop: -9,
    width: '70%',
    height: 50,
    borderColor: '#db1a46',
    paddingHorizontal: 0,
    color: 'black',
  },
  Amountinput: {
    marginTop: -40,
    marginStart: '35%',
    width: '70%',
    height: 50,
    borderColor: '#db1a46',
    paddingHorizontal: 0,
    color: 'black',
  },
  operatorButton: {
    left: 30,
    marginLeft: 30,
    marginTop: 30,
    padding: 10,
    borderRadius: 10,
    height: 50,
    borderColor: '#db1a46',
    color: 'black',
  },
  CircleButton: {
    left: 30,
    marginLeft: 30,
    marginTop: 22,
    padding: 10,
    borderRadius: 10,
    height: 50,
    borderColor: '#db1a46',
    color: 'black',
  },
  modalContent: {
    backgroundColor: '#ffff',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
    color: '#ffff',
  },
  operatorItem: {
    fontSize: 16,
    marginBottom: 10,
    color: 'black',
  },
  containera: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonContainer: {
    height: 50,
    width: '60%',
    borderRadius: 10,
    flexDirection: 'row',
    marginTop: 10,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  radioButtonInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'grey',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelectedInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#0b754e',
  },
  radioButtonText: {
    marginLeft: 8,
  },
});

export default MobileRecharge;
