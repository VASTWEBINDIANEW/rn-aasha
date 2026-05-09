import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  ActivityIndicator, StyleSheet, ToastAndroid, Animated
} from 'react-native';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import { hScale, SCREEN_HEIGHT, SCREEN_WIDTH, wScale } from '../../../utils/styles/dimensions';
import { translate } from '../../../utils/languageUtils/I18n';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import FlotingInput from '../../drawer/securityPages/FlotingInput';
import DynamicButton from '../../drawer/button/DynamicButton';
import { SvgXml } from 'react-native-svg';
import OTPModal from '../../../components/OTPModal';
import ShowLoader from '../../../components/ShowLoder';
import CloseSvg from '../../drawer/svgimgcomponents/CloseSvg';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { BlurView } from '@react-native-community/blur';

// ─── GLASSMORPHISM TOKENS ───────────────────────────────────────────────────
const GLASS = {
  bg: 'rgba(255,255,255,0.08)',
  border: 'rgba(255,255,255,0.15)',
  inputBg: 'rgba(255,255,255,0.07)',
  inputBorder: 'rgba(255,255,255,0.14)',
  accentPurple: '#7c3aed',
  accentBlue: '#0ea5e9',
  accentLight: '#a78bfa',
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255,255,255,0.5)',
  textHint: 'rgba(255,255,255,0.3)',
};

const GRADIENT_COLORS = ['#1a0533', '#0d1f4a', '#0a2a3d', '#0f3d2e'] as const;
const BTN_GRADIENT = ['#7c3aed', '#4f46e5', '#0ea5e9'] as const;

// ─── COMPONENT ───────────────────────────────────────────────────────────────
const NumberRegisterScreen = ({ Name, No, type, CName, onPress }) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  const [remitterOtp, setRemitterOtp] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [sendNum, setSendNum] = useState(No);
  const [remName, setRemName] = useState(CName);
  const [aadharnum, setaadharnum] = useState('');
  const [Pan, setPan] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '']);
  const { post, get } = useAxiosHook();
  const otpRefs = useRef([]);
  const [adharData, setadharData] = useState({});
  const [remitterid, setRemitterid] = useState('');
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [mobileOtp, setMobileOtp] = useState('');
  const [isOtp, setisOtp] = useState(false);
  const [type2, settype2] = useState('');
  const [load, setisload] = useState(false);

  // ── animation refs ──
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [remitterOtp]);

  useEffect(() => { console.log(type); });

  // ── all original network logic kept exactly the same ──

  const sendOtp = async (num, name) => {
    setisload(true);
    try {
      const baseUrl = `${APP_URLS.addnewRemSendOtp}Mobile=${num}&Name=${name}&surname=tte&pincode=123456`;
      const res = await post({ url: baseUrl });
      if (res.RESULT === '1') {
        ToastAndroid.show(res.ADDINFO, ToastAndroid.LONG);
        setisload(false);
        return;
      }
      const { status, statuscode, data } = res.ADDINFO;
      const { remitter } = data || {};
      if (statuscode === 'TXN') {
        setIsLoading(false);
        setRemitterid(remitter?.id || '');
        ToastAndroid.show(status || 'OTP sent successfully. Please check your phone.', ToastAndroid.LONG);
        setRemitterOtp(false);

      } else if (statuscode === 'ERR') {
        ToastAndroid.show(status, ToastAndroid.LONG);
      } else {
        setIsLoading(false);
        Alert.alert('Error', res['ADDINFO'] || 'An unknown error occurred.', [{ text: 'OK' }]);
      }
      setisload(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again later.', [{ text: 'OK' }]);
      setIsLoading(false);
    }
  };

  const checksendernumber = async (number) => {
    setRemitterOtp(true);
    setisload(true);
    try {
      const url = `${APP_URLS.getCheckSenderNo}${number}`;
      const res = await get({ url });
      const addinfo = res['ADDINFO'];
      if (res) {
        const status = addinfo?.statuscode;
        if (status === 'TXN') {
          settype2('AADHAROTP');
          setRemitterOtp(true);
        } else if (['RNF','NUMBEROTP','AADHAROTP'].includes(addinfo.statuscode)) {
          settype2('AADHAROTP');
        } else if (status === 'ERR') {
          ToastAndroid.showWithGravity(addinfo, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        }
      }
      setisload(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendAadharOtp = async (num) => {
    setisload(true);
    try {
      const { agentid, clientid } = adharData as any;
      const url = `${APP_URLS.Register_aadhar_new}mobile=${num}&aadharno=${aadharnum}&pancardnumber=${Pan}`;
      const url2 = `${APP_URLS.Verify_aadhar_new}mobile=${num}&otp=${mobileOtp}&aadhar=${aadharnum}&clientid=${clientid}&agentid=${agentid}`;
      const res = await post({ url: isOtp ? url2 : url });
      if (res) {
        if (isOtp) {
          const otpMsg = res.ADDINFO?.msg || 'OTP Verification failed, please try again.';
          if (res.ADDINFO?.stsmsg === true) { setisOtp(true); setOtpModalVisible(true); }
          ToastAndroid.show(otpMsg, ToastAndroid.LONG);
        } else {
          setadharData(res.ADDINFO);
          const aadharMsg = res.ADDINFO?.msg || 'Aadhar registration failed, please try again.';
          if (res.ADDINFO?.stsmsg === true) { setisOtp(true); setOtpModalVisible(true); }
          ToastAndroid.show(aadharMsg, ToastAndroid.LONG);
        }
      } else {
        ToastAndroid.show('Error: No response from server', ToastAndroid.LONG);
      }
      setisload(false);
    } catch (e) {
      ToastAndroid.show('An error occurred. Please try again.', ToastAndroid.LONG);
    }
  };

  const verifyOtp = async (otp) => {
    try {
      const url = `${APP_URLS.verifynewRemSendOtp}Mobile=${sendNum}&OTP=${otp}&RequestId&remitterid=${remitterid}&beneficiaryid&Action=add`;
      const res = await post({ url });
      if (res['RESULT'] === '1') {
        setIsLoading(false);
        Alert.alert('Error', res['ADDINFO'], [{ text: 'OK', onPress: () => {} }]);
      } else {
        const data = res['ADDINFO']?.['data'];
        if (data) {
          if (data.status === 'OTP Verified') {
            ToastAndroid.show(data.status, ToastAndroid.LONG);
        onPress(false)

          } else {
            Alert.alert('Success', 'Transaction Successful', [{
              text: 'OK', onPress: () => { checksendernumber(sendNum); }
            }]);
          }
        } else {
          Alert.alert('Error', 'Invalid response from server. Please try again.', [{ text: 'OK', onPress: () => {} }]);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify OTP. Please try again later.', [{ text: 'OK', onPress: () => {} }]);
      setIsLoading(false);
    }
  };

  const handleRemitterNameNext = () => {
    if (type === 'AADHAROTP' || type2 === 'AADHAROTP') {
      setisload(true);
      sendAadharOtp(sendNum);
    } else {
      if (remName.trim() !== '') {
        setisload(true);
        sendOtp(sendNum, remName);
      } else {
        Alert.alert(translate('Info'), translate('Enter Remitter Name'), [{ text: 'OK', onPress: () => {} }]);
      }
    }
  };

  const handleVerifyOtp = () => {
    const otp = otpDigits.join('');
    if (otp.length === 4) {
       verifyOtp(otp); }
    else { Alert.alert('Error', 'Please enter valid OTP.', [{ text: 'OK', onPress: () => {} }]); }
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

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <LinearGradient
      colors={[colorConfig.primaryColor,colorConfig.secondaryColor]}
      start={{ x: 0.15, y: 0 }}
      end={{ x: 0.85, y: 1 }}
      style={styles.screenGradient}
    >
      {/* Decorative orbs */}
      <View style={styles.orbTopLeft} />
      <View style={styles.orbBottomRight} />
      <View style={styles.orbMid} />

      {/* Glass card */}
      <View style={styles.glassCard}>
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.securityBadge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>SECURE REGISTRATION</Text>
          </View>
          <Text style={styles.headerTitle}>{translate('Remitter_Number_Register')}</Text>
          <Text style={styles.headerSub}>
            {remitterOtp ? translate('Enter Remitter Name') : translate('Enter OTP')}
          </Text>
          <TouchableOpacity onPress={() => onPress()} style={styles.closeBtn} activeOpacity={0.7}>
            <CloseSvg />
          </TouchableOpacity>
        </View>

        {/* ── Step indicator ── */}
        <View style={styles.stepRow}>
          {[1, 2].map(i => (
            <View key={i} style={[
              styles.stepDot,
              (!remitterOtp ? i === 2 : i === 1) && styles.stepDotActive,
            ]}>
              <Text style={[styles.stepNum, (!remitterOtp ? i === 2 : i === 1) && styles.stepNumActive]}>
                {i}
              </Text>
            </View>
          ))}
          <View style={styles.stepLine} />
        </View>

        <KeyboardAwareScrollView
          enableOnAndroid
          extraScrollHeight={100}
          keyboardShouldPersistTaps="handled"
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[
            styles.bodyPad,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}>
            {remitterOtp ? (
              <View>
                <GlassInput
                  label={translate('Enter Remitter Name')}
                  value={remName}
                  onChangeText={setRemName}
                  editable={!isLoading}
                />
                <GlassInput
                  label={translate('Mobile Number')}
                  value={sendNum}
                  onChangeText={setSendNum}
                  keyboardType="numeric"
                  maxLength={10}
                  editable={false}
                  icon="📱"
                />

                {(type === 'AADHAROTP' || type2 === 'AADHAROTP') && (
                  <View style={styles.aadharSection}>
                    <Text style={styles.aadharSectionLabel}>KYC VERIFICATION</Text>
                    <GlassInput
                      label={translate('Aadhar')}
                      value={aadharnum}
                      onChangeText={setaadharnum}
                      keyboardType="numeric"
                      maxLength={12}
                      editable={!isLoading}
                    />
                    <GlassInput
                      label={'Pan Card (Optional)'}
                      value={Pan}
                      onChangeText={setPan}
                      editable={!isLoading}
                    />
                  </View>
                )}

                <LinearGradient colors={BTN_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtnWrap}>
                  <TouchableOpacity
                    style={styles.ctaBtn}
                    onPress={handleRemitterNameNext}
                    disabled={isLoading || !remName}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.ctaBtnText}>
                      {isLoading ? '...' : `${translate('Next')}  →`}
                    </Text>
                  </TouchableOpacity>
                </LinearGradient>

              
              </View>
            ) : (
              /* ── OTP Verification ── */
              <View>
                <Text style={styles.otpHint}>
                  {translate('Enter OTP')} sent to{' '}
                  <Text style={styles.otpHintNum}>{sendNum}</Text>
                </Text>

                <View style={styles.otpRow}>
                  {otpDigits.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={ref => (otpRefs.current[index] = ref)}
                      value={digit}
                      onChangeText={v => handleChangeOtpDigit(index, v)}
                      onKeyPress={e => handleKeyPress(e, index)}
                      keyboardType="numeric"
                      maxLength={1}
                      style={[styles.otpBox, digit && [styles.otpBoxFilled,{borderColor:colorConfig.primaryColor ,backgroundColor:colorConfig.secondaryColor}]]}
                      selectionColor={GLASS.accentLight}
                    />
                  ))}
                </View>

<DynamicButton
onPress={handleVerifyOtp}
title =  {(type === 'AADHAROTP' || type2 === 'AADHAROTP')
                        ? 'Verify Aadhar OTP  ✓'
                        : 'Verify OTP  ✓'}/>
                <LinearGradient colors={BTN_GRADIENT} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaBtnWrap}>
                  {/* <TouchableOpacity
                    style={styles.ctaBtn}
                    onPress={handleVerifyOtp}
                    disabled={isLoading || otpDigits.join('').length < 4}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.ctaBtnText}>
                      {(type === 'AADHAROTP' || type2 === 'AADHAROTP')
                        ? 'Verify Aadhar OTP  ✓'
                        : 'Verify OTP  ✓'}
                    </Text>
                  </TouchableOpacity> */}
                  
                </LinearGradient>

                <TouchableOpacity style={styles.resendRow} onPress={() => sendOtp(sendNum, remName)}>
                  <Text style={styles.resendText}>Didn't receive?  </Text>
                  <Text style={styles.resendLink}>Resend OTP</Text>
                </TouchableOpacity>
              </View>
            )}

            {isLoading && !load && (
              <ActivityIndicator size="large" color={GLASS.accentLight} style={{ marginTop: 20 }} />
            )}
            <View style={{ height: hScale(40) }} />
          </Animated.View>
        </KeyboardAwareScrollView>
      </View>

      {load && <ShowLoader />}

      <OTPModal
        setShowOtpModal={setOtpModalVisible}
        disabled={mobileOtp.length !== 6}
        showOtpModal={otpModalVisible}
        setMobileOtp={setMobileOtp}
        setEmailOtp={null}
        inputCount={6}
        verifyOtp={() => sendAadharOtp(sendNum)}
      />
    </LinearGradient>
  );
};

// ─── GLASS INPUT (local helper) ──────────────────────────────────────────────
const GlassInput = ({ label, value, onChangeText, editable = true, keyboardType = 'default', maxLength, icon }: any) => (
  <View style={styles.inputWrap}>
    <Text style={styles.floatLabel}>{label}</Text>
    <TextInput
      style={[styles.glassInput, !editable && styles.glassInputDisabled]}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      keyboardType={keyboardType}
      maxLength={maxLength}
      placeholderTextColor="transparent"
      selectionColor={GLASS.accentLight}
    />
    {icon ? <Text style={styles.inputIcon}>{icon}</Text> : null}
  </View>
);

// ─── STYLES ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screenGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wScale(16),
    paddingVertical: hScale(24),
  },

  // orbs
  orbTopLeft: {
    position: 'absolute', width: wScale(280), height: wScale(280),
    borderRadius: wScale(140),
    top: hScale(-80), left: wScale(-80),
  },
  orbBottomRight: {
    position: 'absolute', width: wScale(220), height: wScale(220),
    borderRadius: wScale(110),
    backgroundColor: 'rgba(20,140,200,0.22)',
    bottom: hScale(-60), right: wScale(-60),
  },
  orbMid: {
    position: 'absolute', width: wScale(160), height: wScale(160),
    borderRadius: wScale(80),
    backgroundColor: 'rgba(0,210,180,0.15)',
    bottom: hScale(120), left: wScale(20),
  },

  // card
  glassCard: {
    width: '100%',
    maxWidth: wScale(420),
    backgroundColor: GLASS.bg,
    borderWidth: 1,
    borderColor: GLASS.border,
    borderRadius: wScale(28),
    overflow: 'hidden',

  },

  // header
  header: {
    paddingHorizontal: wScale(24),
    paddingTop: hScale(24),
    paddingBottom: hScale(16),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(120,80,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(120,80,255,0.35)',
    borderRadius: wScale(20),
    paddingVertical: hScale(5),
    paddingHorizontal: wScale(12),
    marginBottom: hScale(10),
    gap: wScale(7),
  },
  badgeDot: {
    width: wScale(7), height: wScale(7),
    borderRadius: wScale(3.5),
    backgroundColor: '#a78bfa',
  },
  badgeText: {
    fontSize: wScale(10),
    color: '#c4b5fd',
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  headerTitle: {
    fontSize: wScale(20),
    fontWeight: '700',
    color: GLASS.textPrimary,
    lineHeight: hScale(26),
  },
  headerSub: {
    fontSize: wScale(12),
    color: GLASS.textSecondary,
    marginTop: hScale(3),
  },
  closeBtn: {
    position: 'absolute',
    right: wScale(20),
    top: hScale(20),
    width: wScale(36), height: wScale(36),
    borderRadius: wScale(18),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: GLASS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // step indicator
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wScale(24),
    paddingVertical: hScale(14),
    gap: wScale(10),
  },
  stepLine: {
    flex: 1, height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: wScale(4),
  },
  stepDot: {
    width: wScale(28), height: wScale(28),
    borderRadius: wScale(14),
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: 'rgba(120,80,255,0.4)',
    borderColor: 'rgba(120,80,255,0.6)',
  },
  stepNum: { fontSize: wScale(12), color: GLASS.textSecondary, fontWeight: '600' },
  stepNumActive: { color: '#fff' },

  // body
  bodyPad: { paddingHorizontal: wScale(24), paddingTop: hScale(10) },

  // glass input
  inputWrap: {
    marginBottom: hScale(16),
    position: 'relative',
  },
  floatLabel: {
    fontSize: wScale(11),
    color: GLASS.accentLight,
    marginBottom: hScale(6),
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  glassInput: {
    backgroundColor: GLASS.inputBg,
    borderWidth: 1,
    borderColor: GLASS.inputBorder,
    borderRadius: wScale(14),
    paddingHorizontal: wScale(16),
    paddingVertical: hScale(13),
    fontSize: wScale(15),
    color: GLASS.textPrimary,
    textAlign: 'center',
  },
  glassInputDisabled: { opacity: 0.45 },
  inputIcon: {
    position: 'absolute',
    right: wScale(14),
    bottom: hScale(14),
    fontSize: wScale(14),
    opacity: 0.4,
  },

  // aadhar section
  aadharSection: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    borderRadius: wScale(16),
    padding: wScale(14),
    marginBottom: hScale(16),
  },
  aadharSectionLabel: {
    fontSize: wScale(10),
    color: GLASS.textHint,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: hScale(10),
  },

  // CTA button
  ctaBtnWrap: {
    borderRadius: wScale(16),
    marginTop: hScale(8),
    elevation: 8,
    shadowColor: GLASS.accentPurple,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  ctaBtn: {
    paddingVertical: hScale(15),
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText: {
    fontSize: wScale(15),
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.6,
  },

  // security footer
  securityFooter: {
    alignItems: 'center',
    marginTop: hScale(16),
  },
  securityText: {
    fontSize: wScale(11),
    color: GLASS.textHint,
  },

  // OTP section
  otpHint: {
    textAlign: 'center',
    fontSize: wScale(13),
    color: GLASS.textSecondary,
    marginBottom: hScale(24),
    lineHeight: hScale(20),
  },
  otpHintNum: {
    color: GLASS.accentLight,
    fontWeight: '600',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: wScale(12),
    marginBottom: hScale(28),
  },
  otpBox: {
    width: wScale(56), height: hScale(62),
    backgroundColor: GLASS.inputBg,
    borderWidth: 1,
    borderColor: GLASS.inputBorder,
    borderRadius: wScale(14),
    textAlign: 'center',
    fontSize: wScale(24),
    fontWeight: '700',
    color: GLASS.textPrimary,
  },
  otpBoxFilled: {
    borderColor:'red',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },

  // resend
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: hScale(18),
  },
  resendText: { fontSize: wScale(13), color: GLASS.textSecondary },
  resendLink: { fontSize: wScale(13), color: GLASS.accentLight, fontWeight: '600' },
});

export default NumberRegisterScreen;