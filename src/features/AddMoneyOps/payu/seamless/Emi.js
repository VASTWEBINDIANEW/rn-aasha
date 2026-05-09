import React from 'react';
import { useState } from 'react';
import {initiatePayment as initPayment} from './PaymentOptions'
import PayUSdk from 'payu-core-pg-react';

import {
  Button,
  Text,
  TextInput,
  StyleSheet,
  View,
  Alert,
  ScrollView,
} from 'react-native';

import { getHash  ,CBParams ,displayAlert , getPaytHash} from '../utils';

var isAttached=false
const Emi = (route,props) => {
  const { navigation } = route
  const [cardNumber, setCardNumber] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [phoneNumber, setPhone] = useState('');
  const [emiType, setEmiType] = useState('DC');


  const initiatePayment = () => {
    var commonParams=CBParams(route);
    var payuSDKParams={
      ...route,
      key: route.merchantKey,
      paymentType: 'EMI',
      nameOnCard,
      cardNumber,
      expiryYear,
      expiryMonth,
      cvv,
      bankCode,
      phone: phoneNumber
    };
    payuSDKParams["hash"]=getHash(payuSDKParams);
    PayUSdk.makePayment(
      payuSDKParams,
      (response) => {
        console.log(response);
        var resp=JSON.parse(response)
        commonParams["cb_config"]={
          url:resp.url,
          post_data:resp.data
        }
        resp["paymentType"]=route.paymentType;
        resp["cbParams"]=commonParams
        initPayment(resp,navigation)

      },
      (err) => {
        Alert.alert('Error', JSON.stringify(err));
      }
    );
    
  }

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Credit Card Details</Text>
        <Text>Number</Text>
        <TextInput
          style={styles.textinput}
          placeholder="Number"
          value={cardNumber}
          onChangeText={setCardNumber}
        />
        <Text>Expires Month</Text>
        <TextInput
          style={styles.textinput}
          placeholder="MM"
          value={expiryMonth}
          onChangeText={setExpiryMonth}
        />
        <Text>Expires Year</Text>
        <TextInput
          style={styles.textinput}
          placeholder="YY"
          value={expiryYear}
          onChangeText={setExpiryYear}
        />
        <Text>CVV</Text>
        <TextInput
          style={styles.textinput}
          placeholder="cvv"
          value={cvv}
          onChangeText={setCvv}
        />
        <Text>Name</Text>
        <TextInput
          style={styles.textinput}
          placeholder="Name"
          value={nameOnCard}
          onChangeText={setNameOnCard}
        />
        <Text>Bank Code</Text>
        <TextInput
          style={styles.textinput}
          placeholder="Bank Code"
          value={bankCode}
          onChangeText={setBankCode}
        />
        <Text>Phone Number</Text>
        <TextInput
          style={styles.textinput}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={setPhone}
        />
        <Text>EMI Type(CC/DC/Cardless)</Text>
        <TextInput
          style={styles.textinput}
          placeholder="EMI Type"
          value={emiType}
          onChangeText={setEmiType}
        />
        <Button
          title="Pay"
          onPress={() => {
            initiatePayment()
          }}
        />
      </View>
      <View style={styles.box} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  textinput: {
    height: 40,
    padding: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  title: {
    paddingBottom: 16,
    fontSize: 20,
  },
  box: {
    height: 300,
  },
});

export default Emi;