import React from 'react';
import { useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput, Alert,DeviceEventEmitter } from 'react-native';
import { CBParams ,getHash } from '../utils';
import {initiatePayment as initPayment} from './PaymentOptions'
import PayUSdk from 'payu-core-pg-react';

const NetBanking = (route) => {
  const { navigation } = route
  const [bankCode, setBankCode] = useState('SBIB');
  
  const initiatePayment = () => {
    var commonParams=CBParams(route);
    var payuSDKParams={
      ...route,
      key: route.merchantKey,
      paymentType: 'Net Banking',
      bankCode,
    };
    payuSDKParams["hash"] = getHash(payuSDKParams);
    console.log(payuSDKParams)
    PayUSdk.makePayment(
      payuSDKParams,
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
    <View style={styles.container}>
      <Text style={styles.title}>
        Choose your bank (e.g, SBIB, AXIB, HDFB, ICIB)
      </Text>
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
});

export default NetBanking;