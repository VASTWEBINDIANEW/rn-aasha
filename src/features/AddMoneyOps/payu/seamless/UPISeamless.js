import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert, TouchableOpacity, NativeModules } from 'react-native';
import {initiatePayment as initPayment} from './PaymentOptions'
import { getHash, CBParams} from '../utils';
import PayUSdk from 'payu-core-pg-react';
import { RootState } from '../../../reduxUtils/store';

const UPISeamless = (route,props) => {
  const { navigation } = route
  const [vpa, setVpa] = useState('');
  const initiatePayment = () => {
    var commonParams=CBParams(route);
    const requestData = {
      ...route,
      key: route.merchantKey,
      paymentType: 'upi',
      vpa,
      udf1: "",
      udf2: "",
      udf3: "",
      udf4: "",
      udf5: ""
    }
    console.log(requestData)
    PayUSdk.makePayment(
      {
        ...requestData,
        hash: getHash(requestData)
      },
      (response) => {
        const responseData = JSON.parse(response)
        commonParams["cb_config"]={
            url:responseData.url,
            post_data:responseData.data
          }
        responseData["paymentType"]=route.paymentType;
        responseData["cbParams"]=commonParams
        initPayment(responseData,navigation)
      },
      (err) => {
        Alert.alert('Error', JSON.stringify(err));
      }
    );
  }

  const walletMakePayment = (paymentType, bankCode = '') => {
    var commonParams=CBParams(route);
    const requestData = {
      ...route,
      key: route.merchantKey,
      paymentType: paymentType,
      bankCode : bankCode,
      udf1: "",
      udf2: "",
      udf3: "",
      udf4: "",
      udf5: ""
    }
    console.log(requestData)
    PayUSdk.makePayment(
      {
        ...requestData,
        hash: getHash(requestData)
      },
      (response) => {
        const responseData = JSON.parse(response)
        commonParams["cb_config"]={
            url:responseData.url,
            post_data:responseData.data
          }
        responseData["paymentType"]=route.paymentType;
        responseData["cbParams"]=commonParams
        initPayment(responseData,navigation)
      },
      (err) => {
        Alert.alert('Error', JSON.stringify(err));
      }
    );
  }
useEffect(()=>{
  console.log(route);
})
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.walletItem, { backgroundColor: '#3A81F1' }]}

        onPress={() => 
          
          initiatePayment('INTENT', 'com.google.android.apps.nbu.paisa.user')
        
        }
      >
        <Text style={styles.walletText}>intent_app</Text>



      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.walletItem, { backgroundColor: '#3A81F1' }]}
        onPress={() => walletMakePayment('upi', 'TEZ')}
      >
        <Text style={styles.walletText}>Google Pay</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.walletItem, { backgroundColor: 'black' }]}
        onPress={() => walletMakePayment('Cash Card','PAYTM')}
      >
        <Text style={styles.walletText}>Paytm</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.walletItem, { backgroundColor: '#6739b7' }]}
        onPress={() => walletMakePayment('Cash Card', 'phonepe')}
      >
        <Text style={styles.walletText}>PhonePe</Text>
      </TouchableOpacity>

      {/* <Text style={styles.title}>Please Enter VPA</Text>
      <TextInput
        style={styles.textinput}
        placeholder="VPA"
        value={vpa}
        onChangeText={setVpa}
      />
      <Button
        title="Pay"
        onPress={() => {
          initiatePayment()
        }}
      /> */}
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
    marginTop: 20
  },
  walletItem: {
    paddingHorizontal: 4,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: 'white',
    marginTop: 8
  },
  walletText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 12
  }
});

export default UPISeamless;