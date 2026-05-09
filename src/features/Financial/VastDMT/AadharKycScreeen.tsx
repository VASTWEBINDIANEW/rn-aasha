import { translate } from "../../../utils/languageUtils/I18n";
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const Aadharkyc = ({ sendernum }) => {
  const [isloading, setIsLoading] = useState(false);
  const [aadharnum, setAadharnum] = useState('');
  const [otp, setOtp] = useState('');

  const checkaadhar = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');

      const response = await axios.get(
        `http://api.vastwebindia.com/Common/api/data/AdharCardValidationCheck?aadharnumber=${aadharnum}`,
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          timeout: 12000,
        }
      );

      console.log(response);

      if (response.status === 200) {
        const data = response.data;
        const status = data.status;

        if (status === true) {
          sendotpaadhar();
        } else {
          setIsLoading(false);
          Alert.alert('Invalid Aadhar Number', '!!!');
        }
      } else if (response.status === 401) {
        await AsyncStorage.clear();
        // Navigate to login page
      } else {
        throw new Error('Failed to load themes');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const sendotpaadhar = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');

      const response = await axios.post(
        'http://api.vastwebindia.com/Money/api/Money/aadharsendotp',
        {
          aadhar: aadharnum,
          senderno: sendernum,
        },
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          timeout: 15000,
        }
      );

      console.log(response);

      if (response.status === 200) {
        setIsLoading(false);
        const data = response.data;
        const status = data.Status;

        if (status === true) {
          // Set clientid and txnid
        } else {
          const message = data.Message;
          Alert.alert(message);
        }
      } else if (response.status === 401) {
        await AsyncStorage.clear();
        // Navigate to login page
      } else {
        throw new Error('Failed to load themes');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const verifyotpaadhar = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');

      const response = await axios.post(
        'http://api.vastwebindia.com/Money/api/Money/Verifyotpaadhar',
        {
          client_id: clientid,
          otp: otp,
          aadhar: aadharnum,
          senderno: sendernum,
          txnid: txnid,
        },
        {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
          timeout: 15000,
        }
      );

      console.log(response);

      if (response.status === 200) {
        setIsLoading(false);
        const data = response.data;
        const status = data.Status;
        const message = data.Message;

        if (status === true) {
          Alert.alert('Success', message, [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to dashboard
              },
            },
          ]);
        } else {
          Alert.alert(message);
        }
      } else if (response.status === 401) {
        await AsyncStorage.clear();
        // Navigate to login page
      } else {
        throw new Error('Failed to load themes');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
    <View style={styles.headerContainer}>
      <View style={styles.headerIcon}>
        {/* Icon component */}
      </View>
      <Text style={styles.headerText}>{translate("Aadhaar_KYC_Due")}</Text>
    </View>
    <View style={styles.infoContainer}>
      <Text style={styles.infoText}>{translate("key_ifthesen_153")}</Text>
      <Text style={styles.infoText}>{translate("key_fordoing_154")}</Text>
      <Text style={styles.infoText}>{translate("key_aadhaarky_155")}</Text>
    </View>
    {otpvisioff ? (
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Your Aadhaar Number"
          keyboardType="number-pad"
          onChangeText={(text) => setAadharnum(text)}
          value={aadharnum}
        />
        <Button
          title="Verify Now"
          onPress={checkaadhar}
          disabled={isloading}
          color="#841584"
        />
      </View>
    ) : (
      <View style={styles.inputContainer}>
        {/* OTP input fields and resend OTP button */}
        {/* Submit OTP button */}
      </View>
    )}
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 10,
    paddingTop: 20,
  },
  // Define additional styles as needed
});

export default Aadharkyc;
