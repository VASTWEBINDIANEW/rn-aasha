import React from 'react';
import { useState } from 'react';
import { CBParams } from '../utils';
import {
  Button,
  Text,
  TextInput,
  StyleSheet,
  View,
  Alert,
  ScrollView,
  NativeModules,
} from 'react-native';

import PayUSdk from 'payu-core-pg-react';
import { getHash } from '../utils';
import {initiatePayment as initPayment} from './PaymentOptions'
const CashCard = (route,props) => {
  const { navigation } = route;
  const [bankCode, setBankCode] = useState('SBIB');

  const initiatePayment = () => {
    var commonParams=CBParams(route);
    const requestData = {
      ...route,
      key: route.merchantKey,
      bankCode,
      paymentType:"Cash Card",
      udf1: "",
      udf2: "",
      udf3: "",
      udf4: "",
      udf5: ""
    }

    requestData["hash"]=getHash(requestData);

    PayUSdk.makePayment(
      requestData
      ,
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



  return (
    <ScrollView>
      <View style={styles.container}>
        <Text>Bank Code</Text>
        <TextInput
          style={styles.textinput}
          placeholder="Bank Code"
          value={bankCode}
          onChangeText={setBankCode}
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

export default CashCard;