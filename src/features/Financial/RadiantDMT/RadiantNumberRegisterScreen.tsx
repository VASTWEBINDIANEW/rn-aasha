import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { translate } from '../../../utils/languageUtils/I18n';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import AppBar from '../../drawer/headerAppbar/AppBar';
import FlotingInput from '../../drawer/securityPages/FlotingInput';
import DynamicButton from '../../drawer/button/DynamicButton';
import { SvgXml } from 'react-native-svg';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';

const RadiantNumberRegisterScreen = ({ route }) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo)
  const adduser = `
<svg id="Layer_1" height="512" viewBox="0 0 512 512" width="512" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" data-name="Layer 1"><linearGradient id="GradientFill_1" gradientUnits="userSpaceOnUse" x1="256" x2="256" y1="512"><stop offset="0" stop-color="#5cc4bb"/><stop offset=".097" stop-color="#50c1c0"/><stop offset=".501" stop-color="#25b4d2"/><stop offset=".815" stop-color="#0aacde"/><stop offset="1" stop-color="#00a9e2"/></linearGradient><path d="m256 0c-141.159 0-256 114.841-256 256s114.841 256 256 256 256-114.841 256-256-114.841-256-256-256zm26.968 225.417c39.361 2.133 70.193 31.932 70.193 67.841v50.194c0 9.8-8.282 17.772-18.462 17.772h-180.499c-10.179 0-18.462-7.975-18.462-17.774v-50.191c0-35.91 30.833-65.71 70.193-67.841a12 12 0 0 1 8.6 2.992 46.519 46.519 0 0 0 59.846 0 12.02 12.02 0 0 1 8.6-2.993zm46.193 111.807h-169.424v-43.966c0-21.863 18.591-40.263 43.077-43.467a70.868 70.868 0 0 0 83.27 0c24.486 3.2 43.077 21.6 43.077 43.468zm-84.712-106.046a59.4 59.4 0 1 1 59.4-59.4 59.464 59.464 0 0 1 -59.4 59.4zm0-94.8a35.4 35.4 0 1 1 -35.4 35.4 35.44 35.44 0 0 1 35.4-35.4zm165.288 62.764a12 12 0 0 1 -12 12h-29.221v29.222a12 12 0 0 1 -24 0v-29.218h-29.216a12 12 0 0 1 0-24h29.221v-29.222a12 12 0 0 1 24 0v29.221h29.221a12 12 0 0 1 11.995 12z" fill="url(#GradientFill_1)" fill-rule="evenodd"/></svg>    
  
    `;
  const [remitterOtp, setRemitterOtp] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [sendNum, setSendNum] = useState('');
  const [remName, setRemName] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const { post,get } = useAxiosHook();
  const otpRefs = useRef([]);
  const { Name ,sendernum} = route.params;
  const sendOtp = async (num, name) => {
    console.log('Sending OTP for:', name);
  
    try {
      const radiantUrl = `Money/api/Radiant/RegisterMobileForIMPS?sender_number=${sendernum}&Name=${name}`;
      const genericUrl = `${APP_URLS.addnewRemSendOtp}Mobile=${sendernum}&Name=${name}&surname=tte&pincode=123456`;
  
      console.log('Request URL:', Name === 'RADIANT' ? radiantUrl : genericUrl);
  
      const res = Name === 'RADIANT' 
        ? await get({ url: radiantUrl })
        : await post({ url: genericUrl });
  
      console.log('API Response:', res);
  
      const addInfo = res.ADDINFO;
      if (res.RESULT === '1') {
        Alert.alert('Error', addInfo, [{ text: 'OK', onPress: () => {} }]);
      } else {
        setIsLoading(true);  
        Alert.alert('Message', addInfo, [{ text: 'OK', onPress: () => {} }]);
  
      }
    } catch (error) {
      console.error('Failed to send OTP:', error);
      Alert.alert('Error', 'Failed to send OTP. Please try again later.', [{ text: 'OK', onPress: () => {} }]);
      setIsLoading(false);  
    } finally {
     // setIsLoading(false);
    }
  };

  const verifyOtp = async (otp) => {
    try {
      const verifyUrl = `${APP_URLS.verifynewRemSendOtp}Mobile=${sendernum}&OTP=${otp}&RequestId=&remitterid=''&beneficiaryid&Action=add,`;
  
      console.log('Verify OTP URL:', verifyUrl);
  
      const res = Name === 'RADIANT'
        ? await post({ url: `Money/api/Radiant/VerifyOtp?sender_number=${sendernum}&Otp=${otp}` })
        : await post({ url: verifyUrl });
  
      console.log('OTP Verification Response:', res);
  
      if (res['RESULT'] == '1') {
        Alert.alert('Error', res['ADDINFO'], [{ text: 'OK', onPress: () => {} }]);
      } else {
        Alert.alert('Success', res['ADDINFO'], [{ text: 'OK', onPress: () => {} }]);
      }
      
      setIsLoading(false);
  
    } catch (error) {
      console.error('Failed to verify OTP:', error);
  
      Alert.alert('Error', 'Failed to verify OTP. Please try again later.', [{ text: 'OK', onPress: () => {} }]);
  
      setIsLoading(false);
    }
  };
  
  const handleRemitterNameNext = () => {
    if (remName.trim() !== '') {
      sendOtp(sendernum, remName);
      console.log(sendernum, remName);
    } else {
      Alert.alert(translate('Info'), translate('Enter Remitter Name'), [{ text: 'OK', onPress: () => { } }]);
    }
  };

  const handleVerifyOtp = () => {
    const otp = otpDigits.join('');
    if (otp.length === 6) {
      verifyOtp(otp);
    } else {
      Alert.alert('Error', 'Please enter valid OTP.', [{ text: 'OK', onPress: () => { } }]);
    }
  };

  const handleChangeOtpDigit = (index, value) => {
    const updatedOtpDigits = [...otpDigits];
    updatedOtpDigits[index] = value;
    setOtpDigits(updatedOtpDigits);
    if (value.length === 1 && index < otpRefs.current.length - 1) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && otpDigits[index] === '' && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  return (
    <View style={styles.main}>

      <AppBarSecond title={Name} />
      <LinearGradient colors={[colorConfig.primaryColor, colorConfig.secondaryColor]} style={{
        paddingTop: hScale(20), marginBottom: hScale(20)

      }}>
        {/* <View style={[styles.topappbar, styles.container]}>
          <SvgXml xml={adduser} width={wScale(50)} height={wScale(50)} />

          <Text style={styles.title}>{translate("Register_New_User")}</Text>
        </View> */}
      </LinearGradient>
      <View style={styles.container}>
        {remitterOtp ? (
          <View>
            <FlotingInput
              label={translate('Mobile Number')}
              value={sendernum}
              onChangeTextCallback={setSendNum}
              keyboardType='numeric'
              maxLength={10}
              editable={false}
              textInputStyle={{ textAlign: 'center' }}
            />
            <FlotingInput
              label={translate('Remitter Name')}
              value={remName}
              onChangeTextCallback={setRemName}
              editable={!isLoading}
              textInputStyle={{ textAlign: 'center' }}
            />
            <DynamicButton
              title={translate('Next')}
              onPress={handleRemitterNameNext}
              disabled={isLoading}
              isLoading={isLoading}
            />
          </View>
        ) : (
          <View>
            <Text style={styles.otptitle}>{translate('Enter OTP')}</Text>
            <View style={styles.otpContainer}>
              {otpDigits.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => otpRefs.current[index] = ref}
                  value={digit}
                  onChangeText={(value) => handleChangeOtpDigit(index, value)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType='numeric'
                  maxLength={1}
                  style={styles.otpInput}
                />
              ))}
            </View>
            <DynamicButton
              title={'Verify OTP'}
              onPress={handleVerifyOtp}
              disabled={isLoading}
              isLoading={isLoading}
            />
          </View>
        )}
        {isLoading && <ActivityIndicator size='large' color={colorConfig.labelColor} />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    paddingHorizontal: wScale(15),
    justifyContent: 'center',
  },
  topappbar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: hScale(10),
  },
  title: {
    fontSize: wScale(18),
    color: '#FFFFFF',
    marginLeft: wScale(10),
  },
  otptitle: {
    fontSize: wScale(16),
    textAlign: 'center',
    marginBottom: hScale(10),
    color: '#000'
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hScale(20),
  },
  otpInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    textAlign: 'center',
    fontSize: wScale(18),
    width: wScale(40),
    color: '#000',
    fontWeight: 'bold'
  },
});

export default RadiantNumberRegisterScreen;
