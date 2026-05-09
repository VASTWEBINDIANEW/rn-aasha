import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, ToastAndroid, Alert, TouchableOpacity } from 'react-native';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { translate } from '../../../utils/languageUtils/I18n';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import { useNavigation } from '@react-navigation/native';

const UpiAddNewVPAScreen = ({route }) => {
  const receivedData = route['params'];
    console.log('UpiAddNewVPAScreen',receivedData);

    
  useEffect(() => {

    console.log(route)
    const fetchData = async () => {
      try {
      
          getSuffixData();
      } catch (error) {
          console.error('Error fetching sender number:', error);
      }
  };
  fetchData();
    getSuffixData();
  }, [])
  const navigation = useNavigation<any>();

  const { post, get } = useAxiosHook();
  const [vpaid, setVpaid] = useState('');
  const [name, setName] = useState('');
  const [number, setnumber] = useState('');
  const [vpaidValid, setVpaidValid] = useState(false);
  const [nameValid, setNameValid] = useState(false);
  const [numValid, setNumValid] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isSkip, setisSkip] = useState(false)
  const handleAddBeneficiary = async () => {

    console.log(number, name, vpaid);
    if (!vpaidValid || !nameValid) {
      ToastAndroid.showWithGravity('Please enter valid VPA ID and name', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
      return;
    }
    setIsLoading(true);
    try {
      const res = await get({ url: `${APP_URLS.addUpiBen}senderno=${number}&account=${vpaid}&benname=${name}` });
      console.log(res);
      if (res['RESULT'] == '0') {
        Alert.alert('Success', res['ADDINFO']['message'], [{ text: 'OK', onPress: () => { 
          navigation.navigate("UpiGetBenificiaryScreen");

        } }]);

      } else if (res['RESULT'] == '1') {
        Alert.alert('Error', res['ADDINFO']['message'], [{ text: 'OK', onPress: () => { } }]);
      } else {

      }
    } catch (error) {
      ToastAndroid.showWithGravity(error, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAccount = async () => {
    if (!vpaidValid || !nameValid) {
      ToastAndroid.showWithGravity('Please enter valid VPA ID and name', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
      return;
    }
  };
  const handleNumberChange = (text) => {
    setnumber(text);
    setNumValid(text.length >= 10);
  };
  const [suffix, setsuffix] = useState([]);
  const Sx = [
    "ibl",
    "ybl",
    "jio",
    "paytm",
    "waicici",
    "slice",
    "amazonpay",
    "yapl",
    "yesg",
    "yesbank",
    "apl",
    "abfspay",
    "axisb",
    "okaxis",
    "jupiteraxis",
    "goaxb",
    "naviaxis",
    "waaxis",
    "axl",
    "pingpay",
    "rmhdfcbank",
    "okhdfcbank",
    "hdfcbankjd",
    "wahdfcbank",
    "oksbi",
    "wasbi",
    "indus",
    "ikwik",
    "mbk",
    "timecosmos",
    "idfcbank",
    "fbl",
    "pinelabs",
    "axisbank",
    "kmbl"
  ]
  const getSuffixData = async () => {
    try {
      const url = `${APP_URLS.upiSuffix}`;
      const res = await get({ url: url });
      console.log(res);

      if (!res || res.length === 0) {
        setsuffix(Sx);
      } else {
        setsuffix(res);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const handleVpaidChange = (text) => {
    const isValid = new RegExp(`@(${suffix.join('|')})\\b`, 'i').test(text);
    setVpaidValid(isValid);
    setVpaid(text);
  };
  const handleSkip = () => {
    setisSkip(!isSkip);

  }
  const handleNameChange = (text) => {
    setName(text);
    setNameValid(/^[a-zA-Z\s]+$/.test(text));
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.heading}>{translate('ADD VPA ID')}</Text>
        <TextInput
          style={[styles.input, numValid && styles.validInput]}
          placeholder={translate('Mobile Number')}
          value={receivedData.senderNo}
          maxLength={10}
          keyboardType='numeric'
          onChangeText={handleNumberChange}
          editable= {false}
        />
        <TextInput
          style={[styles.input, vpaidValid && styles.validInput]}
          placeholder={translate('VPA ID') + ' / ' + translate('Upi ID')}
          value={vpaid}
          keyboardType="email-address"
          onChangeText={handleVpaidChange}
        />
        <TextInput
          style={[styles.input, nameValid && styles.validInput]}
          placeholder={translate('Enter Name')}
          value={name}
          onChangeText={handleNameChange}
        />
        <Button
          title={isLoading ? 'Adding...' : 'Add VPAID'}
          onPress={handleAddBeneficiary}
          disabled={isLoading || !vpaidValid || !nameValid}
        />
      </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 2,
    padding: hScale(30),
    backgroundColor: '#fff',
  },
  buttonStyle: {
    padding: hScale(10)
  },
  heading: {
    fontSize: wScale(15),
    fontWeight: 'bold',
    marginBottom: hScale(10),
  },
  input: {
    height: hScale(40),
    borderColor: 'gray',
    borderWidth: 0.5,
    marginBottom: hScale(10),
    borderRadius: 5,
    paddingHorizontal: hScale(10),
  },
  validInput: {
    borderColor: 'green',
    borderWidth: 2
  },
});

export default UpiAddNewVPAScreen;
