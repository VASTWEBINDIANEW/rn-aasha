/* eslint-disable react-native/no-inline-styles */
import StepIndicator from 'react-native-step-indicator';
import { Button } from '@rneui/themed';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Alert } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import { encrypt } from '../../utils/encryptionUtils';
import { useNavigation } from '@react-navigation/native';
import { StepIndicatorStyle } from './stepIndicatorStyle';
import LottieView from 'lottie-react-native';
import { colors } from '../../utils/styles/theme';
import { hScale, SCREEN_HEIGHT, wScale } from '../../utils/styles/dimensions';
import BackArrow from '../../utils/svgUtils/BackArrow';
import { SignUpContext } from './SignUpContext';
import { SvgUri, SvgXml } from 'react-native-svg';
import DropdownSvg from '../../utils/svgUtils/DropdownSvg';
import { FlashList } from '@shopify/flash-list';
import { stateData } from '../../utils/stateData';
import { BottomSheet } from '@rneui/themed';
import { APP_URLS } from '../../utils/network/urls';
import useAxiosHook from '../../utils/network/AxiosClient';
import OTPTextView from 'react-native-otp-textinput';
import { useDeviceInfoHook } from '../../utils/hooks/useDeviceInfoHook';
import DynamicButton from '../drawer/button/DynamicButton';
import FlotingInput from '../drawer/securityPages/FlotingInput';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { setSignUpId, setSignUpPassword } from '../../reduxUtils/store/userInfoSlice';
import ShowLoader from '../../components/ShowLoder';

const VerifyInfoStep = () => {

  const { colorConfig, deviceInfo } = useSelector((state: RootState) => state.userInfo)

  const { get } = useAxiosHook();
  const {
    dateOfBirth,
    referralCode,
    addressState,
    password,
    verifyPassword,
    district,
    email,
    mobileNumber,
    username,
    businessName,
    businessType,
    city,
    gender,
    gst,
    personalAadhar,
    personalPAN,
    pincode,
    videoKyc,
    aadharFront,
    aadharBack,
    panImg,
    gstImg,
    currentPage,
    stateId,
    svg,
    Radius2,
    distid,
  } = useContext(SignUpContext);


  const { post } = useAxiosHook();
  const [isloading, setIsLoading] = useState(false);


  const { getNetworkCarrier, getMobileDeviceId, getMobileIp } =
    useDeviceInfoHook();
  const validateFields = () => {
    const fields = {
      dateOfBirth,
      referralCode,
      stateId,
      password,
      district,
      email,
      mobileNumber,
      username,
      businessName,
      businessType,
      city,
      gst,
      personalAadhar,
      personalPAN,
      distid,
    };

    for (const [key, value] of Object.entries(fields)) {
      if (!value) {
        Alert.alert('Validation Error', `Please fill out the ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
        return false;
      }
    }
    return true;
  };

  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const JoinUs = useCallback(async () => {
    try {
      const url = `http://native.${APP_URLS.baseWebUrl}/api/Account/Registernew`;
      const Pin = '1234';
      const address = deviceInfo.address || 'Unknown';
      const cleanAddress = address.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, " ").trim();
      console.log(cleanAddress)
      const safeDOB = dateOfBirth.replace(
        /(\d{2})(\d{2})(\d{4})/,
        "$3-$2-$1"
      );
      setIsLoading(true);
      console.log(username, safeDOB, "21", "1", cleanAddress,
        pincode, businessName, mobileNumber, email, referralCode,
        password, businessType, personalAadhar, personalPAN, gst, Pin)
      // 1. Encryption
      const safeData = [
        username,
        dateOfBirth,
        stateId,
        distid,
        address,
        pincode,
        businessName,
        mobileNumber,
        email,
        referralCode,
        password,
        businessType,
        personalAadhar,
        personalPAN,
        gst,
        Pin
      ].map(item => String(item || ""));

      safeData.forEach((item, index) => {
        console.log(`Index ${index}:`, item, "Length:", item.length);
      });
      const encryption = await encrypt(safeData);
      console.log("fdhfkskdf", encryption);

      // 2. Data Prepare (Directly mapping without double encoding)
      const payload = {
        Name: encryption.encryptedData[0],
        Dob: encryption.encryptedData[1],
        state: encryption.encryptedData[2],
        distict: encryption.encryptedData[3], // Spelling check: district?
        Address: encryption.encryptedData[4],
        PinCode: encryption.encryptedData[5],
        Businessname: encryption.encryptedData[6],
        phone: encryption.encryptedData[7],
        Email: encryption.encryptedData[8],
        ReferralCode: encryption.encryptedData[9],
        Password: encryption.encryptedData[10],
        businesstype: encryption.encryptedData[11],
        aadharcard: encryption.encryptedData[12],
        pancard: encryption.encryptedData[13],
        Gst: encryption.encryptedData[14],
        PIN: encryption.encryptedData[15], // Encrypted PIN use karein
        valuess1: encryption.keyEncode,
        valuesss2: encryption.ivEncode,
      };

      console.log(payload);

      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      };

      // 3. API Call
      const response = await fetch(url, options);
      const responseData = await response.json();
      console.log(responseData)

      setIsLoading(false);

      if (responseData) {
        Alert.alert(
          "Alert",
          `Response: ${responseData.Response}\nMessage: ${responseData.Message}`,
          [
            {
              text: responseData.Response === "Success" ? "Go to Login Screen" : "OK",
              onPress: () => {
                if (responseData.Response === "Success") {
                  navigation.navigate('LoginScreen');
                }
              }
            }
          ]
        );
      } else {
        setIsLoading(false);

        Alert.alert("Error", "Server side issue occurred.");
      }

    } catch (error) {
      console.error('Error in JoinUs function:', error);
      Alert.alert("Error", "Something went wrong. Please try again.");
      setIsLoading(false);

    }
    // Dependency array mein stateId aur baki missing fields add karein
  }, [username, stateId, distid, dateOfBirth, district, pincode, businessName, mobileNumber, email, referralCode, password, businessType, personalAadhar, personalPAN, gst, navigation]);

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
        <View style={styles.inputview}>
          {isloading && <ShowLoader />}
          <FlotingInput label={'Mobile Number'}
            value={mobileNumber}
            editable={false}
            labelinputstyle={styles.labelinputstyle}
            inputstyle={[styles.inputstyle, { borderRadius: Radius2 }]}
          />
          <View style={[styles.IconStyle, {}]}>
            <SvgUri
              height={hScale(48)}
              width={hScale(48)}

              uri={svg.MobileNumber}
            />

          </View>
        </View>
        <View style={styles.inputview}>

          <FlotingInput label={'User Name'}
            value={username} editable={false}
            labelinputstyle={styles.labelinputstyle}
            inputstyle={[styles.inputstyle, { borderRadius: Radius2 }]}
          />
          <View style={[styles.IconStyle, {}]}>
            <SvgUri
              height={hScale(48)}
              width={hScale(48)}

              uri={svg.personUser}
            />

          </View>
        </View>
        <View style={styles.inputview}>
          <FlotingInput label={'Email Id'}
            value={email} editable={false}
            labelinputstyle={styles.labelinputstyle}
            inputstyle={[styles.inputstyle, { borderRadius: Radius2 }]}
          />
          <View style={[styles.IconStyle, {}]}>
            <SvgUri
              height={hScale(48)}
              width={hScale(48)}

              uri={svg.Email}
            />

          </View>
        </View>
        <View style={styles.inputview}>
          <FlotingInput label={'Personal Aadhar'}
            value={personalAadhar} editable={false}
            labelinputstyle={styles.labelinputstyle}
            inputstyle={[styles.inputstyle, { borderRadius: Radius2 }]}
          />
          <View style={[styles.IconStyle, {}]}>
            <SvgUri
              height={hScale(48)}
              width={hScale(48)}

              uri={svg.AadharCard}
            />

          </View>
        </View>
        <View style={styles.inputview}>
          <FlotingInput label={'Personal PAN'}
            value={personalPAN} editable={false}
            labelinputstyle={styles.labelinputstyle}
            inputstyle={[styles.inputstyle, { borderRadius: Radius2 }]}
          />
          <View style={[styles.IconStyle, {}]}>
            <SvgUri
              height={hScale(48)}
              width={hScale(48)}

              uri={svg.PanCard}
            />

          </View>
        </View>
        <View style={styles.inputview}>
          <FlotingInput label={'Referral Code'}
            value={referralCode} editable={false}
            labelinputstyle={styles.labelinputstyle}
            inputstyle={[styles.inputstyle, { borderRadius: Radius2 }]}
          />
          <View style={[styles.IconStyle, {}]}>
            <SvgUri
              height={hScale(48)}
              width={hScale(48)}

              uri={svg.ReferralCode}
            />

          </View>
        </View>
        <View style={styles.inputview}>
          <FlotingInput label={'Date Of Birth (dd/mm/yyyy)'}
            value={dateOfBirth} editable={false}
            labelinputstyle={styles.labelinputstyle}
            inputstyle={[styles.inputstyle, { borderRadius: Radius2 }]}
          />
          <View style={[styles.IconStyle, {}]}>
            <SvgUri
              height={hScale(48)}
              width={hScale(48)}

              uri={svg.Calendar}
            />

          </View>
        </View>
        <View style={styles.inputview}>
          <FlotingInput label={'State'}
            value={addressState} editable={false}
            labelinputstyle={styles.labelinputstyle}
            inputstyle={[styles.inputstyle, { borderRadius: Radius2 }]}
          />
          <View style={[styles.IconStyle, {}]}>
            <SvgUri
              height={hScale(48)}
              width={hScale(48)}

              uri={svg.State}
            />

          </View>
        </View>
        <View style={styles.inputview}>
          <FlotingInput label={'Pin Code'}
            value={pincode} editable={false}
            labelinputstyle={styles.labelinputstyle}
            inputstyle={[styles.inputstyle, { borderRadius: Radius2 }]}
          />
          <View style={[styles.IconStyle, {}]}>
            <SvgUri
              height={hScale(48)}
              width={hScale(48)}

              uri={svg.PinCodeLocation}
            />

          </View>
        </View>
        <View style={styles.inputview}>
          <FlotingInput label={'District'}
            value={district} editable={false}
            labelinputstyle={styles.labelinputstyle}
            inputstyle={[styles.inputstyle, { borderRadius: Radius2 }]}
          />
          <View style={[styles.IconStyle, {}]}>
            <SvgUri
              height={hScale(48)}
              width={hScale(48)}

              uri={svg.District}
            />

          </View>
        </View>

        <View style={styles.inputview}>
          <FlotingInput label={'Business Name'}
            value={businessType} editable={false}
            labelinputstyle={styles.labelinputstyle}
            inputstyle={[styles.inputstyle, { borderRadius: Radius2 }]}
          />
          <View style={[styles.IconStyle, {}]}>
            <SvgUri
              height={hScale(48)}
              width={hScale(48)}

              uri={svg.BussinessName}
            />

          </View>
        </View>

        <View style={styles.inputview}>
          <FlotingInput label={'Business Type'}
            value={businessType} editable={false}
            labelinputstyle={styles.labelinputstyle}
            inputstyle={[styles.inputstyle, { borderRadius: Radius2 }]}
          />
          <View style={[styles.IconStyle, {}]}>
            <SvgUri
              height={hScale(48)}
              width={hScale(48)}

              uri={svg.BusinessType}
            />

          </View>
        </View>

        <View style={styles.inputview}>

          <FlotingInput label={'GST (optional)'}
            value={gst} editable={false}
            labelinputstyle={styles.labelinputstyle}
            inputstyle={[styles.inputstyle, { borderRadius: Radius2 }]}
          />

          <View style={[styles.IconStyle, {}]}>
            <SvgUri
              height={hScale(48)}
              width={hScale(48)}

              uri={svg.GST}
            />

          </View>
        </View>
        <DynamicButton title={'Join Now'} onPress={() => {
          JoinUs();

        }} styleoveride={{ marginTop: 10 }} />
      </View></KeyboardAwareScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wScale(15),
    paddingVertical: hScale(20),
    paddingBottom: hScale(20),
    backgroundColor: '#fff'
  },
  inputstyle: {
    marginBottom: 0,
    paddingLeft: wScale(68)
  },
  inputview: {
    marginBottom: hScale(18),
  },
  IconStyle: {
    width: hScale(48),
    justifyContent: 'center',
    position: "absolute",
    height: "100%",
    top: hScale(4)

  },
  labelinputstyle: { left: wScale(63) },

});

export default VerifyInfoStep;
