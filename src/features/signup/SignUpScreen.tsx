
/* eslint-disable react-native/no-inline-styles */
import StepIndicator from 'react-native-step-indicator';

import { Button } from '@rneui/themed';
import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  Linking,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import { encrypt } from '../../utils/encryptionUtils';
import { useNavigation } from '@react-navigation/native';
import { translate } from '../../utils/languageUtils/I18n';
import { StepIndicatorStyle } from './stepIndicatorStyle';
import PersonalInfoStep from './PersonalInfoStep';
import LoginInfoStep from './LoginInfoStep';
import KycStep from './KycStep';
import { colors } from '../../utils/styles/theme';
import BackArrow from '../../utils/svgUtils/BackArrow';
import Header from '../../components/Header';
import { wScale } from '../../utils/styles/dimensions';
import { SignUpContext } from './SignUpContext';
import VerifyInfoStep from './VerifyInfoStep';
import SignUpKyc from './KycStep';
import AppBar from '../drawer/headerAppbar/AppBar';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import { SvgUri } from 'react-native-svg';
import { APP_URLS } from '../../utils/network/urls';

const SignUpScreen = ({ route }) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo)

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verifyPassword, setVerifyPassword] = useState('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const [mobileNumber, setMobileNumber] = useState('');
  const [username, setUsername] = useState('');
  const [addressState, setAddressState] = useState('');
  const [district, setDistrict] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [businessName, setBusinessName] = useState('');


  const [businessType, setBusinessType] = useState('');
  const [personalAadhar, setPersonalAadhar] = useState('');
  const [personalPAN, setPersonalPAN] = useState('');
  const [gst, setGST] = useState('');
  const [videoKyc, setVideoKyc] = useState('');
  const [aadharFront, setAadharFront] = useState(null);
  const [aadharBack, setAadharBack] = useState(null);
  const [panImg, setPanImg] = useState(null);
  const [gstImg, setGstImg] = useState(null);
  const [stateId, setStateid] = useState('');
  const [pincode, setPincode] = useState('');
  const [svg, setSvg] = useState([]);
  const [Radius2, setRadius2] = useState(Number);
  const [distid, setDistid] = useState('');

  const onStepPress = position => {
    setCurrentPage(position);
  };

  useEffect(() => {
    setSvg(route.params.svg)
    setRadius2(route.params.Radius2)


  })


  const getScreen = useCallback(() => {
    if (currentPage === 0) {
      return <LoginInfoStep svg={svg} Radius2={Radius2} />;
    }
    if (currentPage === 1) {
      return <PersonalInfoStep svg={svg} Radius2={Radius2} />;
    }
    if (currentPage === 2) {
      return <SignUpKyc  svg={svg} Radius2={Radius2}/>;
    } if (currentPage === 3) {
      return <VerifyInfoStep svg={svg} Radius2={Radius2} />;
    }
  }, [currentPage]);

  return (
    <SignUpContext.Provider
      value={{
        svg,
        setSvg,
        email,
        setEmail,
        password,
        setPassword,
        verifyPassword,
        setVerifyPassword,
        mobileNumber,
        setMobileNumber,
        referralCode,
        setReferralCode,
        addressState,
        setAddressState,
        district,
        setDistrict,
        dateOfBirth,
        setDateOfBirth,
        setCurrentPage,
        businessName,
        setBusinessName,

        businessType,
        setBusinessType,
        personalAadhar,
        setPersonalAadhar,
        personalPAN,
        setPersonalPAN,
        gst,
        setGST,
        videoKyc,
        setVideoKyc,
        currentPage,
        setCurrentPage,
        aadharFront,
        setAadharFront,
        aadharBack,
        setAadharBack,
        panImg,
        setPanImg,
        gstImg,
        setGstImg,
        username,
        setUsername,
        stateId,
        setStateid,
        pincode,
        setPincode,
        Radius2,
        setRadius2,
        distid,
        setDistid,
      }}>
      <>
        <View style={{ flex: 1, backgroundColor: colors.base }}>
          <AppBarSecond title={'SIGN UP NOW !'}  titlestyle={{}}  actionButton="From Web"
 onActionPress={()=>{
  Linking.openURL(`https://${APP_URLS.baseWebUrl}/Home/Login/singup`)
 }}/>
          {/* <Header
            LeftAction={'none'}
            
            HeaderContent={
            
              <View
                style={{
                  marginLeft: wScale(20),
                  height: wScale(60),
                }}>
                <Text
                  style={{
                    color: colors.blue_tag,
                    fontSize: wScale(40),
                    fontStyle: 'italic',
                    fontWeight: 'bold',
                  }}>
                  {'SignUp'}
                </Text>
              </View>
            }
          /> */}


          <View style={styles.stepIndicator}>
            <StepIndicator
              stepCount={4}
              customStyles={StepIndicatorStyle}
              currentPosition={currentPage}
              onPress={onStepPress}
              labels={[
                translate('loginInfo'),
                translate('personalInfo'),

                'Kyc',
                translate('verifyDetails'),
              ]}
            />
          </View>
          <>{getScreen()}
          </>

        </View>
      </>
    </SignUpContext.Provider>
  );
};
const styles = StyleSheet.create({
  stepIndicator: {
    marginTop: wScale(30),
    marginBottom: wScale(10),
  },
});
export default SignUpScreen;


