import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, ToastAndroid } from 'react-native';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { translate } from '../../../utils/languageUtils/I18n';

const UpiNumberRegisterScreen = ({ route, navigation }) => {
  const [remitterOtp, setRemitterOtp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [sendNum, setSendNum] = useState(route.params.senderNo || '');
  const [remName, setRemName] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const { get, post } = useAxiosHook();

  const sendOtp = async (num, name) => {
    try {
      const url = `${APP_URLS.addnewRemSendOtp}Mobile=${num}&Name=${name}&surname=tte&pincode=123456`;
      const res = await post({ url });

      if (!res.OK) {
        if (res.RESULT === '1') {
          setIsLoading(false);
          Alert.alert('Error', res.ADDINFO, [{ text: 'OK', onPress: () => {} }]);
        } else {
          const addinfo = res.ADDINFO;
          const status = addinfo.statuscode;
          const msz = addinfo.status;
          const id = addinfo.data.remitter.id;
          setIsLoading(false);
          setRemitterOtp(true);
          setIsLoading(true);
          ToastAndroid.showWithGravity(addinfo, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        }
      }
    } catch (error) {
      console.error('Failed to send OTP:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again later.', [{ text: 'OK', onPress: () => {} }]);
      setIsLoading(false);
    }
  };

  const verifyOtp = async (otp) => {
    try {
      const url = `${APP_URLS.verifynewRemSendOtp}Mobile=${sendNum}&OTP=${otp}&RequestId&remitterid=''&beneficiaryid&Action=add,`;
      const res = await post({ url });

      if (res.RESULT === '1') {
        Alert.alert('Error', res.ADDINFO, [{ text: 'OK', onPress: () => {} }]);
      } else {
        Alert.alert('Success', res.ADDINFO, [{ text: 'OK', onPress: () => {} }]);
      }

      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        Alert.alert('Success', 'OTP verified successfully.', [{ text: 'OK', onPress: () => {} }]);
      }, 1000);
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      Alert.alert('Error', 'Failed to verify OTP. Please try again later.', [{ text: 'OK', onPress: () => {} }]);
      setIsLoading(false);
    }
  };

  const handleRemitterNameNext = () => {
    if (remName.trim() !== '') {
      sendOtp(sendNum, remName);
    } else {
      Alert.alert(translate('Info'), translate('Enter Remitter Name'), [{ text: 'OK', onPress: () => {} }]);
    }
  };

  const handleVerifyOtp = () => {
    const otp = otpDigits.join('');
    if (otp.length === 6) {
      verifyOtp(otp);
    } else {
      Alert.alert('Error', 'Please enter valid OTP.', [{ text: 'OK', onPress: () => {} }]);
    }
  };

  const handleChangeOtpDigit = (index, value) => {
    const updatedOtpDigits = [...otpDigits];
    updatedOtpDigits[index] = value;
    setOtpDigits(updatedOtpDigits);
  };

  useEffect(() => {
    console.log('senderNo', route.params.senderNo);
  }, [route]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{translate("Number_Register")}</Text>

      <TextInput
        style={styles.input}
        value={sendNum}
        onChangeText={setSendNum}
        placeholder="Enter Mobile Number"
        keyboardType="number-pad"
      />

      {!remitterOtp && (
        <View>
          <Text style={styles.subtitle}>Enter Remitter Name</Text>
          <TextInput
            style={styles.input}
            value={remName}
            onChangeText={setRemName}
            placeholder="Enter Remitter Name"
          />
          <TouchableOpacity style={styles.button} onPress={handleRemitterNameNext}>
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      )}

      {remitterOtp && (
        <View style={styles.otpContainer}>
          {otpDigits.map((digit, index) => (
            <TextInput
              key={index}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleChangeOtpDigit(index, value)}
              maxLength={1}
              keyboardType="number-pad"
            />
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.submitButton} onPress={handleVerifyOtp}>
        {isLoading ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.buttonText}>Submit</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: hScale(10),
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    width: '80%',
    height: hScale(40),
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    paddingHorizontal: hScale(10),
    marginBottom: hScale(10),
  },
  button: {
    width: '80%',
    height: hScale(40),
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    marginTop: hScale(20),
  },
  submitButton: {
    width: '80%',
    height: hScale(40),
    backgroundColor: '#007bff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    marginTop: hScale(20),
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: hScale(10),
  },
  otpInput: {
    width: '12%',
    height: hScale(40),
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    paddingHorizontal: hScale(10),
  },
});

export default UpiNumberRegisterScreen;
