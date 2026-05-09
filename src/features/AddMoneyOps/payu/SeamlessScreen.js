/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Button, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import DynamicButton from '../../drawer/button/DynamicButton';
import { APP_URLS } from '../../../utils/network/urls';
import UPISeamless from './seamless/UPISeamless';

const SeamlessScreen = ({ route }) => {
  const navigation = useNavigation();
  const {Merchantkey ,Merchantid,MerchantSalt,TYPE,USERID,email,mobile,name,txnid,txnsuccessUrl,txnfailureUrl,amount } = route.params['payUParam']

  const [merchantKey, setMerchantKey] = useState(Merchantkey);
  const [salt, setSalt] = useState(MerchantSalt);
  const [environment, setEnvironment] = useState('0'); // 0 for Production, 2 for Sandbox
  const [isSandbox, setIsSandbox] = useState(false);
  //const [amount, setAmount] = useState('1');
  const [productInfo, setProductInfo] = useState('Mobile Phone');

  const [txnId, setTxnId] = useState(txnid);
  const [phone, setPhone] = useState(mobile);
  //const [email, setEmail] = useState('info@webinfomart.com');
  const [surl, setSurl] = useState(txnsuccessUrl);
  const [furl, setFurl] = useState(APP_URLS.baseWebUrl);
//const [userCredentials, setUserCredentials] = useState(`${route.params['payUParam'].Merchantkey}:john@yopmail.com`);
const [userCredentials, setUserCredentials] = useState(
  `${Merchantkey || ''}:${email || 'default-email@yopmail.com'}` // Fallback email
);
const [firstName, setFirstName] = useState(name);
const isVisible = useIsFocused();

  useEffect(() => {
console.log(txnId);
  }, [isVisible]);

  const handleNavigation = (screen, params) => {
    if (!productInfo || !amount || !txnId || !name || !phone || !email) {
      Alert.alert('Error', 'Please fill in all the fields before proceeding');
      return;
    }

    if (isNaN(amount)) {
      Alert.alert('Error', 'Amount must be a valid number');
      return;
    }

    navigation.navigate(screen, params);
  };

  return (
    <ScrollView>

<AppBarSecond title={'Payment Method'} />

      <View style={styles.container}>
        {/* <TextInput
          style={styles.textinput}
          placeholder="Key"
          value={merchantKey}
          //onChangeText={setMerchantKey}
        /> */}

        {/* <Text>Salt</Text>
        <TextInput
          style={styles.textinput}
          placeholder="Salt"
          value={salt}
         // onChangeText={setSalt}
        /> */}

        {/* <Text>Environment (test = 2 / production = 0)</Text>
        <TextInput
          style={styles.textinput}
          placeholder="Environment"
          value={environment}
          onChangeText={setEnvironment}
        /> */}

        {/* <Text>Product Info</Text>
        <TextInput
          style={styles.textinput}
          placeholder="Product Info"
          value={productInfo}
          onChangeText={setProductInfo}
        /> */}

        {/* <Text>Amount</Text>
        <TextInput
          style={styles.textinput}
          placeholder="Amount"
          value={amount}
         // onChangeText={setAmount}
        /> */}

        {/* <Text>Transaction ID</Text>
        <TextInput
          style={styles.textinput}
          placeholder="Transaction"
          value={txnId}
         // onChangeText={setTxnId}
        /> */}

        {/* <Text>Firstname</Text>
        <TextInput
          style={styles.textinput}
          placeholder="Firstname"
          value={firstName}
        //  onChangeText={setFirstName}
        /> */}

        {/* <Text>Phone</Text>
        <TextInput
          style={styles.textinput}
          placeholder="Phone"
          value={phone}
         // onChangeText={setPhone}
        /> */}

        {/* <Text>Email</Text>
        <TextInput
          style={styles.textinput}
          placeholder="Email"
          value={email}
         // onChangeText={setEmail}
        /> */}

        {/* <Text>Success URL</Text>
        <TextInput
          style={styles.textinput}
          placeholder="Success URL"
          value={surl}
        //  onChangeText={setSurl}
        /> */}

        {/* <Text>Failure URL</Text>
        <TextInput
          style={styles.textinput}
          placeholder="Failure URL"
          value={furl}
         // onChangeText={setFurl}
        /> */}

        {/* <Text>User Credentials</Text>
        <TextInput
          style={styles.textinput}
          placeholder="login:password"
          value={userCredentials}
          onChangeText={setUserCredentials}
        /> */}

        <View style={{ justifyContent: 'space-between' }}>
          {/* <Button
            title="API"
            onPress={() =>
              handleNavigation('APIScreen', {
                merchantKey,
                salt,
                isSandbox,
                environment,
                productInfo,
                amount,
                txnId,
                firstName,
                phone,
                email,
                surl,
                furl,
                userCredentials,
              })
            }
          /> */}
          {/* <Button
            title="Cards"
            onPress={() =>
              handleNavigation('CardsScreen', {
                merchantKey,
                salt,
                isSandbox,
                environment,
                productInfo,
                amount,
                txnId,
                firstName,
                phone,
                email,
                surl,
                furl,
                userCredentials,
              })
            }
          /> */}
       
        <DynamicButton
          title={'Easy Intent'}
          onPress={() => {
            handleNavigation('UPI', 
              {
              merchantKey,
              salt,
              isSandbox,
              environment,
              productInfo,
              amount,
              txnId,
              firstName,
              phone,
              email,
              surl,
              furl,
              userCredentials ,
            })
          }}
          styleoveride={undefined}
        />
                 <Text>------------------------------------------------------------</Text> 

<DynamicButton
          title={'CORE-PG'}
          onPress={() =>
            handleNavigation('PaymentMethods', {
              merchantKey,
              salt,
              isSandbox,
              environment,
              productInfo,
              amount,
              txnId,
              firstName,
              phone,
              email,
              surl,
              furl,
              userCredentials,
              paymentType: 'COREPG',
            })
          }
          styleoveride={undefined}
        />

{/* {"payUParam": 
{"MerchantSalt": "yYZJyUfKJeeYAlq8vGrJb4LU4PbFB9Iq",
 "Merchantid": "8727162", 
 "Merchantkey": "ZXEmEi", "Message": "Successfully", "Privatekey": "", "Response": "Success", "Status": "Success", "TYPE": "OTHER", "USERID": "0d51104e-98ae-4d90-ba8b-3fe9ef3e2bb7", "email": "sj63028@gmail.com", "mobile": "9812363043", "name": "Sanjay", "txnfailureUrl": "https://www.smartpaymoney.in/Response/GatewayResponse", "txnid": "83e2d4da-2b42-4b", "txnsuccessUrl": "https://www.smartpaymoney.in/Response/GatewayResponse"}} */}
          {/* <Button
            title="CORE-PG"
            onPress={() =>
              handleNavigation('PaymentMethods', {
                merchantKey,
                salt,
                isSandbox,
                environment,
                productInfo,
                amount,
                txnId,
                firstName,
                phone,
                email,
                surl,
                furl,
                userCredentials,
                paymentType: 'COREPG',
              })
            }
          /> */}
          {/* <Button
            title="CB"
            onPress={() =>
              handleNavigation('PaymentMethods', {
                merchantKey,
                salt,
                isSandbox,
                environment,
                productInfo,
                amount,
                txnId,
                firstName,
                phone,
                email,
                surl,
                furl,
                userCredentials,
                paymentType: 'CUSTOMBROWSER',
              })
            }
          /> */}
        </View>
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
  box: {
    height: 300,
  },
});

export default SeamlessScreen;
