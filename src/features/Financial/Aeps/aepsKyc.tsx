import { translate } from "../../../utils/languageUtils/I18n";
import React, { useCallback, useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Alert, 
  StyleSheet, 
  ToastAndroid 
} from 'react-native';
import { useDeviceInfoHook } from '../../../utils/hooks/useDeviceInfoHook';
import { useNavigation } from '@react-navigation/native';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import DynamicButton from '../../drawer/button/DynamicButton';
import OTPModal from '../../../components/OTPModal';
import ShowLoader from '../../../components/ShowLoder';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';

const Aepsekyc = () => {
  const [MailOtp, setMailOtp] = useState('');
  const [otpModalVisible1, setOtpModalVisible1] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [primarykeyid, setprimarykeyid] = useState('');
  const [encodeFPTxnId, setencodeFPTxnId] = useState('');
  
  const navigation = useNavigation<any>();
  const { post } = useAxiosHook();
  const { Loc_Data, activeAepsLine } = useSelector((state: RootState) => state.userInfo);

  const { latitude, longitude } = Loc_Data;
  const { getMobileDeviceId } = useDeviceInfoHook();
  
  // Dynamic Theme Colors
  const themeColor = activeAepsLine ? '#1FAA59' : '#F4C430'; // Green vs Yellow
  const themeBg = activeAepsLine ? '#E8F5E9' : '#FFFDE7';    // Light Green vs Light Yellow
  const textColor = activeAepsLine ? '#1B5E20' : '#856404'; // Deep Green vs Deep Brown

  const Model = getMobileDeviceId();

  // Date Formatting Logic
  const now = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedDate = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;

  useEffect(() => {
    if (!latitude || !longitude || latitude.length < 1) {
      ToastAndroid.show('Fetching Location...', ToastAndroid.SHORT);
    }
  }, [longitude, latitude]);

  const kycotpsend = useCallback(async (deviceid: string) => {
    setIsLoading(true);
    try {
      const url = activeAepsLine ? APP_URLS.sendekycotpNifi : APP_URLS.sendekycotp;
      
      const requestData = {
        latitude: latitude || "0.0",
        longitude: longitude || "0.0",
        ImeiNo: deviceid ?? '',
      };

      const headers = {
        trnTimestam: formattedDate,
        deviceIMEI: deviceid ?? '',
      };

      const response = await post({
        url: url,
        data: JSON.stringify(requestData),
        config: { headers },
      });

      if (response?.Status) {
        setprimarykeyid(response.primaryKeyId);
        setencodeFPTxnId(response.encodeFPTxnId);
        setShowOtpInput(true);
        ToastAndroid.show(`OTP Sent: ${response.Message}`, ToastAndroid.SHORT);
      } else {
        Alert.alert('E-KYC Error', response?.Message || 'Failed to send OTP');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude, formattedDate, activeAepsLine, post]);

  const handleOtpSend = () => {
    if (!latitude || !longitude) {
      Alert.alert("Location Missing", "Please enable GPS and wait for coordinates.");
      return;
    }
    kycotpsend(Model);
  };

  const verifyotp = useCallback(async (otp: string, deviceid: string, prikey: string, encodeFPTxnid: string) => {
    setIsLoading(true);
    try {
      const requestBody = {
        latitude: latitude,
        longitude: longitude,
        ImeiNo: deviceid,
        otp: otp,
        primaryKeyId: prikey,
        encodeFPTxnId: encodeFPTxnid
      };

      const response = await post({
        url: activeAepsLine ? 'AEPS/api/Nifi/data/EkycVerifyOtp' : 'AEPS/api/data/EkycVerifyOtp',
        data: JSON.stringify(requestBody),
      });

      if (response?.Status === true) {
        navigation?.navigate("Aepsekycscan");
      } else {
        Alert.alert('Verification Failed', response?.Message || 'Invalid OTP');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Verification process failed');
    } finally {
      setIsLoading(false);
    }
  }, [latitude, longitude, activeAepsLine, navigation, post]);

  const handleVerifyOtp = async () => {
    const id = getMobileDeviceId();
    verifyotp(MailOtp, id, primarykeyid, encodeFPTxnId);
  };

  return (
    <View style={styles.main}>
      <AppBarSecond title={'E-Kyc'} />
      
      {/* Dynamic Status Bar */}
      <View style={[styles.statusIndicator, { backgroundColor: themeColor }]}>
        <Text style={styles.statusText}>
          {activeAepsLine ? '✅ LINE 1 (NIFI) ACTIVE' : '⚡ LINE 2 (STANDARD) ACTIVE'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.container}>
          {!showOtpInput ? (
            <View style={[styles.infoCard, { backgroundColor: themeBg, borderColor: themeColor }]}>
              
              <View style={[styles.iconCircle, { backgroundColor: themeColor }]}>
                <Text style={styles.iconText}>!</Text>
              </View>

              <Text style={[styles.title, { color: themeColor }]}>
                {translate("EKYC_is_Not_Completed") || "E-KYC PENDING"}
              </Text>

              <View style={styles.contentBox}>
                <Text style={[styles.infoText, { color: textColor }]}>• {translate("key_dearcus_143")}</Text>
                <Text style={[styles.infoText, { color: textColor }]}>• {translate("key_forcomp_190")}</Text>
                <Text style={[styles.infoText, { color: textColor }]}>• {translate("3_Please_firstly_Connect_Your_Mobile_with_Finger_Print_Scanner_Device_Morpho_Mantra_Startek")}</Text>
              </View>

              <DynamicButton
                onPress={handleOtpSend}
                title={isLoading ? 'SENDING...' : 'PROCEED TO KYC'}
                disabled={isLoading}
              />
            </View>
          ) : (
            <View style={styles.otpWrapper}>
              <Text style={styles.otpHint}>Enter 6-digit OTP sent to your registered mobile</Text>
              <OTPModal
                inputCount={6}
                setShowOtpModal={setOtpModalVisible1}
                disabled={MailOtp.length !== 6}
                showOtpModal={otpModalVisible1}
                setMobileOtp={setMailOtp}
                verifyOtp={handleVerifyOtp}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {isLoading && <ShowLoader />}
    </View>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#F9F9F9' },
  statusIndicator: {
    paddingVertical: 4,
    alignItems: 'center',
    elevation: 2,
  },
  statusText: {
    color: '#FFF',
    fontSize: wScale(10),
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: wScale(20),
    paddingTop: hScale(20),
  },
  infoCard: {
    padding: wScale(20),
    borderRadius: 20,
    borderWidth: 1.5,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconText: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
  title: {
    fontSize: hScale(18),
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: hScale(20),
  },
  contentBox: {
    backgroundColor: 'rgba(255,255,255,0.6)',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
  },
  infoText: {
    fontSize: hScale(13.5),
    lineHeight: hScale(20),
    marginBottom: hScale(10),
    fontWeight: '500',
  },
  otpWrapper: {
    marginTop: hScale(30),
    alignItems: 'center',
  },
  otpHint: {
    fontSize: wScale(14),
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  }
});

export default Aepsekyc;