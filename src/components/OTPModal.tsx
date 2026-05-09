/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, StyleSheet, Keyboard } from 'react-native';
import { BottomSheet, Button } from '@rneui/themed';
import OTPTextView from 'react-native-otp-textinput';
import { colors } from '../utils/styles/theme';
import { useSelector } from 'react-redux';
import { RootState } from '../reduxUtils/store';
import { SCREEN_HEIGHT, hScale, wScale } from '../utils/styles/dimensions';
import DynamicButton from '../features/drawer/button/DynamicButton';

const OTPModal = ({
  showOtpModal,
  setMobileOtp,
  setEmailOtp,
  setShowOtpModal,
  disabled = false,
  verifyOtp,
  inputCount,
  resendotp,
  isresend = false,
  email = '',
  sendID
}) => {
  // Handle OTP change
  const handleOtpChange = (otp, setOtp) => {
    setOtp(otp);  // Update OTP value
    if (otp.length === inputCount) {
      Keyboard.dismiss(); // Dismiss the keyboard when OTP is complete
    }
  };

  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  return (
    <View style={{ flex: 1 }}>
      <BottomSheet
        animationType="none"  
        isVisible={showOtpModal}
        onBackdropPress={() => {
          setShowOtpModal(false);
        }}
        scrollViewProps={{ scrollEnabled: false }}
        containerStyle={{ backgroundColor: 'transparent' }}
      >
        <View style={styles.main} >
          <View style={[styles.StateTitle, { backgroundColor: colorConfig.secondaryColor, }]}>
            <Text style={[styles.stateTitletext,]}>{'Verify OTP'}</Text>

          </View>

          <View>
            {setMobileOtp && (
              <>
                <Text style={styles.text}>
                 OTP Sent to Mobile Number or Email
           {/* ${email ? ' and Email' : ''}` */}
                 
                </Text>
                <Text style={[styles.numberID, { color: colorConfig.secondaryColor }]}>{sendID}</Text>

                <OTPTextView
                  handleTextChange={(otp) => handleOtpChange(otp, setMobileOtp)} // Handle OTP change
                  containerStyle={{
                    marginHorizontal: wScale(10),
                    marginVertical: wScale(30),
                  }}
                  inputCount={inputCount}
                  keyboardType="number-pad"
                />
              </>
            )}

            {setEmailOtp && (
              <>
                <Text style={styles.text}>{'Enter the OTP sent to your email'}</Text>
                <OTPTextView
                  handleTextChange={(otp) => handleOtpChange(otp, setEmailOtp)}
                  containerStyle={{
                    marginHorizontal: wScale(10),
                    marginVertical: wScale(10),
                  }}
                  inputCount={inputCount}
                  keyboardType="number-pad"
                />
              </>
            )}
          </View>

          <Button
            disabled={disabled}
            title={'Verify'}
            onPress={verifyOtp}
            buttonStyle={styles.SignupButton}
            titleStyle={{ fontWeight: 'bold' }}
          />
          {isresend && <Button
            //disabled={disabled}
            title={'Resend Otp'}
            onPress={resendotp}
            buttonStyle={styles.SignupButton}
            titleStyle={{ fontWeight: 'bold' }}

          />}

        </View>
      </BottomSheet >
    </View >
  );
};

const styles = StyleSheet.create({
  main: {
    backgroundColor: colors.white, height: SCREEN_HEIGHT / 1.5, flex: 1, borderTopLeftRadius: wScale(15),
    borderTopRightRadius: wScale(15),
  },

  Resendstyle: {
    height: wScale(55),
    width: wScale(355),
    alignSelf: 'center',
    borderRadius: 20,
    marginTop: 10,
    backgroundColor: colors.dark_blue
  },
  resendtitl: {
    color: 'red'
  },


  StateTitle: {
    paddingVertical: hScale(10),
    backgroundColor: '#ff4670',
    paddingTop: hScale(15),
    borderTopLeftRadius: wScale(15),
    borderTopRightRadius: wScale(15),
    justifyContent: 'center',
    alignItems: 'center',

  },
  stateTitletext: {
    paddingHorizontal: wScale(12),
    fontSize: wScale(20),
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  numberID: {
    paddingHorizontal: wScale(12),
    fontSize: wScale(20),
    color: '#000',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textAlign: 'center'
  },
  SignupButton: {
    marginTop: wScale(40),
    borderBlockColor: '#000000',
    borderColor: colors.blue_button,
    alignContent: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    borderRadius: 50,
    backgroundColor: colors.dark_blue,
    width: wScale(350),
    height: wScale(55),
    shadowColor: 'black',
    flexDirection: 'row',
  },
  text: {
    marginTop: hScale(8),
    fontSize: wScale(19),
    fontWeight: '400',
    justifyContent: 'center',
    alignSelf: 'center',
    color: colors.black75,
  },
});

export default OTPModal;
