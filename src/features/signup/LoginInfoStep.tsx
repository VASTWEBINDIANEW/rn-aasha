
/* eslint-disable react-native/no-inline-styles */
import StepIndicator from 'react-native-step-indicator';

import { Button } from '@rneui/themed';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  ScrollView,
  Alert,
  ToastAndroid,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

import { useNavigation } from '@react-navigation/native';

import LottieView from 'lottie-react-native';
import { colors } from '../../utils/styles/theme';
import { hScale, SCREEN_HEIGHT, wScale } from '../../utils/styles/dimensions';
import { SignUpContext } from './SignUpContext';
import useAxiosHook from '../../utils/network/AxiosClient';
import { APP_URLS } from '../../utils/network/urls';
import OTPModal from '../../components/OTPModal';
import ShowLoader from '../../components/ShowLoder';
import DynamicButton from '../drawer/button/DynamicButton';
import ShowEye from '../drawer/HideShowImgBtn/ShowEye';
import FlotingInput from '../drawer/securityPages/FlotingInput';
import { RootState } from '../../reduxUtils/store';
import { SvgUri } from 'react-native-svg';
import { TouchableWithoutFeedback } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { translate } from '../../utils/languageUtils/I18n';
const LoginInfoStep = () => {


  const baseUrl = `${APP_URLS.baseapiurl}`

  const { colorConfig } = useSelector((state: RootState) => state.userInfo)
  const dispatch = useDispatch();
  const [ismobile, setIsMobile] = useState(false);
  const [isEmailActive, setIsEmailActive] = useState(false);
  const navigation = useNavigation<any>();
  const [isPasswordActive, setIsPasswordActive] = useState(false);
  const [isVerifyPasswordActive, setIsVerifyPasswordActive] = useState(false);
  const [mobileClear, setMobileClear] = useState(false);
  const { get, post } = useAxiosHook();
  const {
    email,
    setEmail,
    mobileNumber,
    setMobileNumber,
    referralCode,
    setReferralCode,
    username,
    setUsername,
    password,
    setPassword,
    verifyPassword,
    setVerifyPassword,
    setCurrentPage,
    currentPage,
    stateId,
    setStateid,
    svg,
    Radius2
  } = useContext(SignUpContext);

  const [isRefferalCodeActive, setIsReferralCodeActive] = useState(false);
  const onPressSignUp = () => {
    // Do something about signup operation
  };
  const handleEmailFocus = () => { };
  const [isValid, setIsValid] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpModalVisible1, setOtpModalVisible1] = useState(false);
  const [delaerToken, setDealrtToken] = useState(true);
  const [mobileOtp, setMobileOtp] = useState('');
  const [MailOtp, setMailOtp] = useState('');
  const [showLoader, setShowLoader] = useState(false);
  const [editable, setEditable] = useState(true);
  const [editable1, setEditable1] = useState(true);
  const [secureEntry, setSecureEntry] = useState(true);


  const ToggleSecureEntry = () => {
    setSecureEntry(!secureEntry)
  }
  useEffect(() => {
    console.log(svg)
    console.log(Radius2, '`````````````````````````')


    getDealerTokenStatus();
    MailStatus();
  },
    []);
  const getDealerTokenStatus = useCallback(async () => {

    try {
      const dealer = await get({ url: APP_URLS.signUpDealerTokenAvailability });
      console.log('***', dealer);
      if (dealer.tokenstatus) {
        setDealrtToken(true);

      } else {
        ToastAndroid.showWithGravity(
          'Not Having Retailer Create Token Contact to Your Dealer',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM
        );
      }
      //   setDealerToken(dealer);
    } catch (error) {
      console.error('Error fetching dealer token status:', error);
    }
  }, []);
  const MailStatus = useCallback(async () => {
    setShowLoader(true);
    try {
      const MailStaus = await post({ url: APP_URLS.signUpMailStatus });

      console.log(MailStaus.STATUS)

      if (MailStaus) {
        setShowLoader(false);
      } else {
        ToastAndroid.showWithGravity(
          'Not Having Retailer Create Token Contact to Your Dealer',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM
        );
      }
      //   setDealerToken(dealer);
    } catch (error) {
      console.error('Error fetching dealer token status:', error);
    }
  }, []);

  const isValidEmail = (email) => {
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+ /;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com)$/;


    return emailRegex.test(email);
  };
  const checkEmail = useCallback(async (email) => {
    if (!isValidEmail(email)) {

      return;
    }

    setShowLoader(true);
    const url = `${baseUrl}${APP_URLS.joinNumCheck}email=${email}&mobile=''`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          "Accept": "application/json",
        },
      });
      setShowLoader(false);

      const responseData = await response.json();
      console.log(responseData);

      handleResponse(responseData, 'email');

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong');
    }
  }, []);

  const checkMobileNumber = useCallback(async (num) => {
    setShowLoader(true);
    const url = `${baseUrl}${APP_URLS.joinNumCheck}email=""&mobile=${num}`;
    console.log(url);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          "Accept": "application/json",
        },
      });
      setShowLoader(false);

      const responseData = await response.json();
      console.log(responseData);

      handleResponse(responseData, 'mobile');

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong');
    }
  }, []);

  const handleResponse = (responseData, type) => {
    if (type === 'email') {
      if (responseData.emailstatus === 'Failed') {
        ToastAndroid.showWithGravity(
          'Your Email Already Exists With Us. Please Try Another Email Id',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM
        );

      } else {

        setOtpModalVisible1(true);
      }
    } else if (type === 'mobile') {
      if (responseData.mobilestatus === 'Failed') {
        ToastAndroid.showWithGravity(
          'Your Mobile Number Already Exists With Us. Please Try Another Number',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM
        );

      } else {
        setOtpModalVisible(true);
      }
    }
  };



  const verifyEmailOtp = useCallback(async (emailOtp, email) => {
    console.log('emailOtp', emailOtp, 'email', email);

    if (!isValidEmail(email)) {
      ToastAndroid.showWithGravity(
        'Please Enter a Valid Email Id',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
      return;
    }

    setShowLoader(true);
    const url = `${baseUrl}${APP_URLS.joinEMverifyOtp}hdemailotp=${emailOtp}&email=${email}`;
    console.log(url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          "Accept": "application/json",
        },
      });
      const responseData = await response.json();
      console.log(responseData);
      handleotpResponse(responseData, 'email');

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setShowLoader(false);
    }
  }, []);


  const verifyMobileOtp = useCallback(async (numOtp, mobileNumber) => {
    console.log('numOtp', numOtp, 'mobileNumber', mobileNumber);

    setShowLoader(true);
    const url = `${baseUrl}${APP_URLS.joinEMverifyOtp}hdmobileotp=${numOtp}&mobile=${mobileNumber}`;
    console.log(url);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          "Accept": "application/json",
        },
      });
      const responseData = await response.json();
      console.log('mobile', responseData);
      handleotpResponse(responseData, 'mobile');

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setShowLoader(false);
    }
  }, []);

  const handleotpResponse = (responseData, type) => {
    if (type === 'email') {
      const { emailmsg, emailstatus } = responseData;


      Alert.alert('Message', emailmsg, [{ text: 'OK' }]);
      if (emailstatus === 'Success') {
        setEditable(true)
        setOtpModalVisible1(false);
        setEditable1(true);
      }
      setOtpModalVisible1(false);

    } else if (type === 'mobile') {
      const { mobilemsg, mobilestatus } = responseData;
      Alert.alert('Message', mobilemsg, [{ text: 'OK' }]);
      if (mobilestatus === 'Success') {
        setEditable(true)
        setOtpModalVisible(false);
      }
      setOtpModalVisible(false);

    }
  };
  const OnLogin = () => {
    if (
      !mobileNumber ||
      !email ||
      !username ||
      !password ||
      !verifyPassword
    ) {
      ToastAndroid.showWithGravity(
        'All fields must be filled',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
      return;
    }
    setCurrentPage(currentPage + 1);


  }


return (
  <KeyboardAwareScrollView
    style={{ flex: 1, backgroundColor: 'white' }} 
    contentContainerStyle={{ flexGrow: 1, paddingBottom: 50 }} 
    enableOnAndroid={true}
    enableAutomaticScroll={true}
    extraScrollHeight={120} 
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
  >
    <View style={styles.container}>
      
      {/* 1. Mobile Number Input */}
      <View style={styles.inputview}>
        <FlotingInput 
          label={mobileClear ? '' : 'Mobile Number'}
          value={mobileNumber}
          onChangeTextCallback={(text) => {
            setMobileNumber(text);
            if (text.length === 10) { checkMobileNumber(text); }
            setMobileNumber(text.replace(/\D/g, ""));
          }}
          onKeyPress={() => setIsMobile(true)}
          keyboardType="number-pad"
          maxLength={10}
          editable={delaerToken}
          labelinputstyle={styles.labelinputstyle}
          inputstyle={[styles.inputstyle, { borderRadius: Radius2 }]}
        />
        <View style={styles.IconStyle}>
          <SvgUri height={hScale(48)} width={hScale(48)} uri={svg.MobileNumber} />
        </View>
      </View>

      {/* 2. Email Id Input */}
      <View style={styles.inputview}>
        <FlotingInput
          onKeyPress={() => setIsEmailActive(true)}
          onFocus={handleEmailFocus}
          label={'Email Id'}
          value={email}
          onChangeTextCallback={(text) => {
            const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/;
            setEmail(text);
            if (emailRegex.test(text)) {
              setIsValid(false);
              checkEmail(text);
            }
          }}
          keyboardType="email-address"
          maxLength={40}
          editable={editable1}
          labelinputstyle={styles.labelinputstyle}
          inputstyle={[styles.inputstyle, { borderRadius: Radius2 }]}
        />
        <View style={styles.IconStyle}>
          <SvgUri height={hScale(48)} width={hScale(48)} uri={svg.Email} />
        </View>
      </View>

      {/* 3. User Name Input */}
      <View style={styles.inputview}>
        <FlotingInput
          onKeyPress={() => setIsReferralCodeActive(true)}
          value={username}
          onChangeTextCallback={setUsername}
          label={'User Name'}
          editable={editable}
          labelinputstyle={styles.labelinputstyle}
          inputstyle={[styles.inputstyle, { borderRadius: Radius2 }]}
        />
        <View style={styles.IconStyle}>
          <SvgUri height={hScale(48)} width={hScale(48)} uri={svg.personUser} />
        </View>
      </View>

      {/* 4. Referral Code Input */}
      <View style={styles.inputview}>
        <FlotingInput
          onKeyPress={() => setIsReferralCodeActive(true)}
          value={referralCode}
          onChangeTextCallback={setReferralCode}
          label={'Referral Code'}
          editable={editable}
          keyboardType="number-pad"
          labelinputstyle={styles.labelinputstyle}
          inputstyle={[styles.inputstyle, { borderRadius: Radius2 }]}
        />
        <View style={styles.IconStyle}>
          <SvgUri height={hScale(48)} width={hScale(48)} uri={svg.ReferralCode} />
        </View>
      </View>

      {/* 5. Password Input */}
      <View style={styles.inputview}>
        <FlotingInput
          onKeyPress={() => setIsPasswordActive(true)}
          onChangeTextCallback={setPassword}
          label={'Password'}
          value={password}
          secureTextEntry={true}
          editable={editable}
          labelinputstyle={styles.labelinputstyle}
          inputstyle={[styles.inputstyle, { borderRadius: Radius2 }]}
        />
        <View style={styles.IconStyle}>
          <SvgUri height={hScale(48)} width={hScale(48)} uri={svg.Password} />
        </View>
      </View>

      {/* 6. Re-Enter Password Input */}
      <View style={styles.inputview}>
        <FlotingInput
          onKeyPress={() => setIsVerifyPasswordActive(true)}
          onChangeTextCallback={setVerifyPassword}
          label={'Re-Enter Password'}
          value={verifyPassword}
          secureTextEntry={secureEntry}
          editable={editable}
          labelinputstyle={styles.labelinputstyle}
          inputstyle={[styles.inputstyle, { borderRadius: Radius2 }]}
        />
        <View style={styles.IconStyle}>
          <SvgUri height={hScale(48)} width={hScale(48)} uri={svg.Password} />
        </View>
        {verifyPassword.length >= 5 && (
          <View style={styles.righticon}>
            <TouchableOpacity onPressOut={ToggleSecureEntry}>
              <ShowEye />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {showLoader && <ShowLoader />}

      {/* Modals & Buttons */}
      <OTPModal
        showOtpModal={otpModalVisible}
        setShowOtpModal={setOtpModalVisible}
        setMobileOtp={setMobileOtp}
        disabled={mobileOtp.length !== 4}
        verifyOtp={() => verifyMobileOtp(mobileOtp, mobileNumber)}
      />

      <OTPModal
        showOtpModal={otpModalVisible1}
        setShowOtpModal={setOtpModalVisible1}
        setEmailOtp={setMailOtp}
        disabled={MailOtp.length !== 4}
        verifyOtp={() => verifyEmailOtp(MailOtp, email)}
      />

      <DynamicButton 
        styleoveride={{ marginTop: 20 }} 
        title={'Next'} 
        onPress={() => {
          if (password.length <= 5 || verifyPassword.length <= 5) {
            ToastAndroid.show('Password must be 5 digits long', ToastAndroid.SHORT);
          } else if (password !== verifyPassword) {
            ToastAndroid.show('Passwords do not match', ToastAndroid.SHORT);
          } else {
            OnLogin();
          }
        }} 
      />

      <View style={styles.anaccount}>
        <Text style={{ color: colors.black75, marginRight: wScale(15) }}>{translate("Already have an account ?")}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
          <Text style={{ fontWeight: 'bold', color: colors.black75 }}> {translate("Login")}</Text>
        </TouchableOpacity>
      </View>

    </View>
  </KeyboardAwareScrollView>
);
};
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wScale(15),
    paddingVertical: hScale(20),
    backgroundColor: '#fff'
  },

  IconStyle: {
    width: hScale(48),
    justifyContent: 'center',
    position: "absolute",
    height: "100%",
    top: hScale(4)
  },
  inputstyle: {
    marginBottom: 0,
    paddingLeft: wScale(68)
  },
  labelinputstyle: { left: wScale(63) },
  inputview: {
    marginBottom: hScale(18),
  },
  righticon: {
    position: "absolute",
    left: "auto",
    right: wScale(0),
    top: hScale(0),
    height: "100%",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: wScale(12),
    opacity: .5,
  },
  anaccount: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: wScale(15)
  }
});
export default LoginInfoStep;


