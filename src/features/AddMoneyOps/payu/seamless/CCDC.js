import React from 'react';
import { useState } from 'react';
import {initiatePayment as initPayment} from './PaymentOptions'

import {
  Button,
  Text,
  TextInput,
  StyleSheet,
  View,
  Alert,
  ScrollView,
} from 'react-native';
import { CBParams ,displayAlert , getHash} from '../utils';

import PayUSdk from 'payu-core-pg-react';

const CCDC = (route,props) => {
  const { navigation } = route

  const [cardNumber, setCardNumber] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [cvv, setCvv] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  const [cardToken, setCardToken] = useState('');
  const [isSodexo, setSodexo] = useState('');

  const initiatePayment = () => {
    var commonParams=CBParams(route);
    var payuSDKParams={
      ...route,
      key: route.merchantKey,
      nameOnCard,
      cvv,
      udf1: "",
      udf2: "",
      udf3: "",
      udf4: "",
      udf5: ""
    };

    if(isSodexo==='No')
    {
      if(cardToken===''){
        PayUSdk.makePayment(
          {
            ...payuSDKParams,
            cardNumber,
            expiryYear,
            expiryMonth,
            paymentType: "Credit / Debit Cards",
            hash: getHash(payuSDKParams)
          },
          (response) => {
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
      else{
        PayUSdk.makePayment(
          {
            ...payuSDKParams,
            cardToken:cardToken,
            paymentType: "Credit / Debit Cards",
            hash: getHash(payuSDKParams)
          },
          (response) => {
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
        console.log(payuSDKParams);
      }
    }
    else
    {
      PayUSdk.makePayment(
        {
          ...payuSDKParams,
          paymentType: 'Sodexo',
          hash: getHash(payuSDKParams)
        },
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
          placeholder="Nam"
          value={nameOnCard}
          onChangeText={setNameOnCard}
        />
        <Text>Stored Card Token</Text>
        <TextInput
          style={styles.textinput}
          placeholder="StoredCardToken"
          value={cardToken}
          onChangeText={setCardToken}
        />
        <Text>Is Sodexo Card</Text>
        <TextInput
          style={styles.textinput}
          placeholder="Is Sodexo Card"
          value={isSodexo}
          onChangeText={setSodexo}
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

export default CCDC;
