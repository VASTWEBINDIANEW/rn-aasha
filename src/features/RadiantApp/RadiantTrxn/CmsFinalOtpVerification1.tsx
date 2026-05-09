import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, ToastAndroid, AsyncStorage, Animated } from 'react-native';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import CmsFinalOtopSvg from '../../drawer/svgimgcomponents/CmsFinalOtopSvg';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import BorderLine from '../../../components/BorderLine';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useFocusEffect } from '@react-navigation/native';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import { useDispatch } from 'react-redux';
import { setCmsVerify } from '../../../reduxUtils/store/userInfoSlice';

const CmsFinalOtpVerification = ({ route }) => {

  const { denomData, transid, slipDate, Mobile, item, item2, selectedModes, transactionCount } = route.params;
  console.log(item2, selectedModes, '9-9-9----0');

  const navigation = useNavigation();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isChecked, setIsChecked] = useState(false);
  const inputsRef = useRef([]);
  console.error(transid);
  const [isLoad, setIsLoad] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [currentReceiptIndex, setCurrentReceiptIndex] = useState(0);
  const [adminiStatus, setAdminiStatus] = useState({});

  const fatchData = async () => {
      // setLoading(true);

      try {
        const url = `${APP_URLS.CashPickupRemainBalVerify}?Amount=${rcPrePayAnomut}`;
        console.log("API URL 👉", url);

        const response = await post({ url });
        console.log("API RESPONSE 👉", response);

        setAdminiStatus(response);
        if (response?.apiremainstatus && response?.sts) {
          navigation.navigate('CmsCoustomerInfo', { item });
        }

        return response;

      } catch (error) {
        console.log("API ERROR ❌", error);
      } finally {
        // setLoading(false);
      }
    };


const handleOtpPress = async () => {
  if (rctype === 'PrePay') {
    fatchData();
    return;
  }

  if (item.OtpDay === '') {
    handleSendOtp();
  } else {
    await AsyncStorage.setItem('pickup_status', 'verified');
    navigation.navigate('PicUpScreen', { 
      item, 
      CodeId: transid, 
      Mobile: Mobile 
    });
  }
};
  const handleOtpChange = (value, index) => {
    if (/^\d$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (index < otp.length - 1) {
        inputsRef.current[index + 1].focus();
      }
    } else if (value === '') {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
    }
  };
  const totalReceipts = denomData.length;
  const [remainingReceipts, setRemainingReceipts] = useState(totalReceipts);

  const { colorConfig, Loc_Data, rctype, rcPrePayAnomut } = useSelector((state: RootState) => state.userInfo);

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace') {
      console.log(nativeEvent.key)
      if (otp[index] === '') {
        if (index > 0) {
          const newOtp = [...otp];
          newOtp[index - 1] = '';
          setOtp(newOtp);
          inputsRef.current[index - 1].focus();
        }
      }
    }
  };
  const { post, get } = useAxiosHook();
  const dispatch = useDispatch()

  const handleSendOtp = async () => {
    if (!isChecked) {

      ToastAndroid.show(
        'Please confirm that the details are correct by checking the box.',
        ToastAndroid.SHORT
      );
      return;
    }

    if (!Mobile || !transid) {

      ToastAndroid.show(
        'Please enter both Mobile number and Transaction ID.',
        ToastAndroid.SHORT
      );
      return;
    }

    setIsLoad(true);
    try {
      const url = `${APP_URLS.TranstionSendotp}transid=${transid}&Mobile=${Mobile}&Email=${item2.Email}&sendfrom=${selectedModes}`;
      const res = await post({ url });
      console.log(`${APP_URLS.TranstionSendotp}transid=${transid}&Mobile=${Mobile}&Email=${item2.Email}&sendfrom=${selectedModes}`);

      console.log(res)
      if (res.Content?.ADDINFO?.status === 'OTP SEND') {
        ToastAndroid.show(
          '📩 OTP Sent Successfully',
          ToastAndroid.SHORT
        );
        setOtpis(false)
        setShowOtpModal(true);
      } else {
        alert(`⚠ Failed to send OTP. Status: ${res.Content?.ADDINFO?.status}`);
      }
    } catch (error) {
      console.error('Send OTP Error:', error);
      alert('❌ Error sending OTP.');
    } finally {
      setIsLoad(false);
    }
  };

  const handleVerifyOtp = async () => {
    const codeString = otp.join('');

    console.log(codeString)
    if (codeString.length !== 6) {
      ToastAndroid.show('Please enter 6-digit OTP', ToastAndroid.BOTTOM);
      return;
    }

    setIsLoad(true);
    try {
      const url = `${APP_URLS.TranstionVerifyotp}transid=${transid}&OTP=${codeString}`;

      console.log(url)
      const res = await post({ url });

      if (res.Content?.ADDINFO?.status === 'DONE') {

        // ✅ अब केवल एक ही OTP verify होगा
        ToastAndroid.show('✅ OTP Verified Successfully.', ToastAndroid.BOTTOM);

        // सारे receipts को verified मान लो
        await AsyncStorage.setItem('pickup_status', 'verified');
        setShowOtpModal(false);

        navigation.navigate('PicUpScreen', { item, CodeId: transid, Mobile: Mobile });

      } else {
        alert(`⚠ OTP verification failed. Status: ${res.Content?.ADDINFO?.status}`);
      }
    } catch (error) {
      console.error('Verify OTP Error:', error);
      alert('❌ Error verifying OTP.');
    } finally {
      setIsLoad(false);
    }
  };


  console.log(denomData)


  const DenomTable = ({ denomData, currentReceiptIndex, totalReceipts, remainingReceipts, setCurrentReceiptIndex, colorConfig }) => {
    // अगर nested नहीं है तो wrap कर दो
    const dataToShow = Array.isArray(denomData[0]) ? denomData : [denomData];

    // Animation state
    const translateX = useRef(new Animated.Value(0)).current;

    const handlePageChange = (direction) => {
      Animated.timing(translateX, {
        toValue: direction === "next" ? -300 : 300, // slide left/right
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setCurrentReceiptIndex(prev =>
          direction === "next" ? prev + 1 : prev - 1
        );
        translateX.setValue(0); // reset after animation
      });
    };

  

    return (
      <View>
        <View style={[styles.table, { borderColor: colorConfig.secondaryColor }]}>
          <View style={[styles.tableRow, { backgroundColor: '#eee' }]}>
            <Text style={[styles.tableCell, styles.headerCell]}>Denom</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>No. of Notes</Text>
            <Text style={[styles.tableCell, styles.headerCell]}>Amount</Text>
          </View>

          <Animated.View style={{ transform: [{ translateX }] }}>


            {dataToShow[currentReceiptIndex].map((item, index) => (
              <View
                key={index}
                style={[
                  styles.tableRow,
                  {
                    backgroundColor: item.denom === 'Total' ? `${colorConfig.secondaryColor}33` : '#fff', // Puri row ka background red karenge agar denom 'Total' ho
                  },
                ]}
              >
                {/* Denom Column */}
                <Text
                  style={[
                    styles.tableCell,

                  ]}
                >
                  {item.denom}
                </Text>

                {/* Notes Column */}
                <Text
                  style={[
                    styles.tableCell,

                  ]}
                >
                  {item.notes}
                </Text>

                {/* Amount Column */}
                <Text
                  style={[
                    styles.tableCell,

                  ]}
                >
                  {item.amount}
                </Text>
              </View>
            ))}


          </Animated.View>
        </View>

        {remainingReceipts > 1 && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
            <TouchableOpacity
              disabled={currentReceiptIndex === 0}
              onPress={() => handlePageChange("prev")}
              style={{
                padding: 10,
                backgroundColor: currentReceiptIndex === 0 ? '#ccc' : colorConfig.secondaryColor,
                borderRadius: 5
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{'<'}</Text>
            </TouchableOpacity>

            <Text style={{ alignSelf: 'center', fontSize: 16 }}>
              Receipt {currentReceiptIndex + 1} of {totalReceipts}
            </Text>

            <TouchableOpacity
              disabled={currentReceiptIndex === totalReceipts - 1}
              onPress={() => handlePageChange("next")}
              style={{
                padding: 10,
                backgroundColor: currentReceiptIndex === totalReceipts - 1 ? '#ccc' : colorConfig.secondaryColor,
                borderRadius: 5
              }}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>{'>'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {remainingReceipts > 1 && <Text style={{ marginTop: 10, textAlign: 'center', fontWeight: 'bold', fontSize: 16 }}>
          Remaining Receipts: {remainingReceipts}
        </Text>}
      </View>
    );
  };

  const [otpis, setOtpis] = useState(true)





  return (
    <View style={styles.main}>
      <AppBarSecond title={'RCMS CUSTOMER INFO'} />
      <ScrollView >



        <View style={styles.container}>
          <View style={styles.iconContainer}>
            <CmsFinalOtopSvg />
          </View>

          <Text style={styles.title}>Verification Required</Text>



          <Text style={styles.description}>
            Please match the number of <Text style={styles.highlight}>Notes</Text> and the
            <Text style={styles.highlight}> total amount</Text>. If everything is okay, complete the transaction by entering the OTP.
            <Text style={styles.success}>The OTP has been sent to the store contact person</Text> with the details of the total amount.
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.dateText}>ReQ No. {transid}</Text>
            <Text style={styles.dateText}>Pickup Time: {slipDate}</Text>
          </View>
          {/* <View style={{ padding: 10, backgroundColor: '#eee', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
              Total Receipt {totalReceipts}
            </Text>
          </View> */}

          <DenomTable
            denomData={denomData}
            currentReceiptIndex={currentReceiptIndex}
            totalReceipts={totalReceipts}
            remainingReceipts={remainingReceipts}
            setCurrentReceiptIndex={setCurrentReceiptIndex}
            colorConfig={colorConfig}
          />
          <View style={styles.checkboxRow}>
            <TouchableOpacity onPress={() => {
              setIsChecked(!isChecked)
            }}>
              <MaterialIcons
                name={isChecked ? 'check-box' : 'check-box-outline-blank'}
                size={24}
                color={isChecked ? 'green' : '#000'}
              />
            </TouchableOpacity>
            <Text style={[styles.checkboxText, { color: isChecked ? 'black' : 'red' }]}>
              Yes, I have checked all the details and also got it verified from store contact person that the information is completely correct and I will take further action.
            </Text>
          </View>
          {(otpis) &&
            <TouchableOpacity style={styles.sendOtpBtn}
               onPress={handleOtpPress}>

              <Text style={styles.sendOtpText}>{`${item.OtpDay == '' ? 'Send OTP to Customer Point' : 'Continue'}`}</Text>
            </TouchableOpacity>}
          {/* {(otpis) &&
            <TouchableOpacity
              style={styles.sendOtpBtn}
              onPress={async () => {

                if (transactionCount !== denomData.length && transactionCount !== undefined) {
                  // Agar transactionCount, denomData.length se match nahi karta hai
                  console.warn(transactionCount !== denomData.length, transactionCount);

                  // Pickup status ko 'unverified' set karna
                  await AsyncStorage.setItem('pickup_status', 'unverified');

                  // Navigate to PicUpScreen
                  navigation.navigate('PicUpScreen', { item, CodeId: transid, Mobile: Mobile });

                } else if (item.OtpDay === '' && transactionCount ==denomData.length ) {
                  // Agar OtpDay khaali hai, aur transactionCount undefined hai
                  handleSendOtp(); // OTP send karna

                } else {
                  // Agar OTP already sent hai ya transaction count sahi hai, pickup status 'verified'
                  await AsyncStorage.setItem('pickup_status', 'verified');

                  // Navigate to PicUpScreen
                  console.error(item.OtpDay === '', transactionCount === undefined,transactionCount);
                navigation.navigate('PicUpScreen', { item, CodeId: transid, Mobile: Mobile });
                }

              }}
            >
              <Text style={styles.sendOtpText}>
                {(transactionCount !== denomData.length && transactionCount !== undefined)
                  ? 'Verify & Next'
                  : (item.OtpDay === '' || transactionCount === undefined ? 'Send OTP to Customer Point' : 'Continue')}
              </Text>
            </TouchableOpacity>
          } */}


          {(showOtpModal) && <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputsRef.current[index] = ref)}
                value={digit}
                onChangeText={(value) => handleOtpChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="numeric"
                maxLength={1}
                style={[styles.otpInput, { backgroundColor: digit === '' ? '#fff' : '#d4f2ce' }]}
              />
            ))}
          </View>}

          {(showOtpModal) && <TouchableOpacity disabled={!isChecked} onPress={() => handleSendOtp()}>
            <Text style={styles.resendText}>If OTP is not received,
              <Text style={{ color: 'green', fontWeight: 'bold' }}> Resend OTP</Text> </Text>
          </TouchableOpacity>}

          {(showOtpModal) && <TouchableOpacity style={styles.submitBtn} onPress={() => {
            if (otp.length == 6) {
              handleVerifyOtp()
            } else {
              ToastAndroid.show('Please Enter 6 Digit Otp', ToastAndroid.BOTTOM);
            }
          }}>
            <Text style={styles.submitText}>Submit OTP</Text>
          </TouchableOpacity>}
        </View>

      </ScrollView>
    </View>

  );
};

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#fff' },

  table: {
    borderWidth: wScale(0.5),
    borderColor: '#000',
    marginVertical: hScale(5),
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    fontWeight: 'bold',
    flex: 1,
    padding: wScale(6),
    fontSize: wScale(14),
    textAlign: 'center',
    borderWidth: wScale(0.5),
  },
  headerCell: {
    fontWeight: 'bold',
  },

  container: {
    flex: 1,
    backgroundColor: '#fdfcff',
    paddingHorizontal: wScale(15),
    paddingTop: hScale(10),
    paddingBottom: hScale(10)

  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8e2de2',
    padding: hScale(12),
    borderTopLeftRadius: wScale(10),
    borderTopRightRadius: wScale(10),
  },
  headerTitle: {
    color: '#fff',
    fontSize: wScale(18),
    fontWeight: 'bold',
    marginLeft: wScale(16),
  },
  image: {
    height: hScale(100),
    width: wScale(100),
    alignSelf: 'center',
    marginVertical: hScale(16),
  },
  title: {
    fontSize: wScale(35),
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  description: {
    fontSize: wScale(12),
    textAlign: 'justify',
    color: '#333',
    marginVertical: hScale(0),
  },
  highlight: {
    color: 'orange',
    fontWeight: 'bold',
  },
  success: {
    color: 'green',
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hScale(0),
    marginBottom: hScale(4),
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: hScale(10),
  },
  checkboxText: {
    fontSize: wScale(10),
    color: '#333',
    flex: 1,
    paddingLeft: wScale(5),
  },
  sendOtpBtn: {
    backgroundColor: '#2ecc71',
    padding: hScale(14),
    borderRadius: wScale(30),
    alignItems: 'center',
    marginVertical: hScale(12),
  },
  sendOtpText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: wScale(16),
  },
  otpRow: {
    justifyContent: 'center',
    flexDirection: 'row',
    marginVertical: hScale(0),
  },
  otpInput: {
    height: hScale(45),
    borderWidth: wScale(1),
    borderColor: '#000',
    textAlign: 'center',
    fontSize: wScale(18),
    flex: 1,
  },
  resendText: {
    textAlign: 'right',
    fontSize: wScale(12),
    color: '#555',
  },
  submitBtn: {
    backgroundColor: '#000',
    padding: hScale(14),
    borderRadius: wScale(30),
    alignItems: 'center',
    marginTop: hScale(16),
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: wScale(16),
  },
  iconContainer: {
    alignSelf: 'center',
  },
  dateText: {
    fontSize: wScale(12),
    color: '#000',
  },
});


export default CmsFinalOtpVerification;
