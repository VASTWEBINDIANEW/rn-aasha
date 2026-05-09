import { translate } from "../utils/languageUtils/I18n";
import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TextInput, ToastAndroid,
  ActivityIndicator, Platform, Keyboard, Modal,
  TouchableWithoutFeedback, Animated, Easing, Pressable,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSelector } from 'react-redux';
import { hScale, wScale } from '../utils/styles/dimensions';
import { APP_URLS } from '../utils/network/urls';
import useAxiosHook from '../utils/network/AxiosClient';
import { RootState } from '../reduxUtils/store';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const hexAlpha = (hex: string, alpha: number): string => {
  const safe = (hex || '#ffffff').replace('#', '');
  const full = safe.length === 3 ? safe.split('').map(c => c + c).join('') : safe;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

interface ForgotPasswordModalProps {
  id?: string;
  showForgotPasswordModal: boolean;
  setShowForgotPasswordModal: (value: boolean) => void;
  handleForgotPassword?: any;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  id,
  showForgotPasswordModal,
  setShowForgotPasswordModal,
}) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const { post } = useAxiosHook();

  const C = {
    primary:   colorConfig?.primaryColor         || '#56ffb9',
    secondary: colorConfig?.secondaryColor       || '#00eaff',
    btnPri:    colorConfig?.primaryButtonColor   || '#2a4fd7',
    btnSec:    colorConfig?.secondaryButtonColor || '#8c22d7',
    label:     colorConfig?.labelColor           || '#FFFFFF',
  };

  const [mobile, setMobile]       = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const opacAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showForgotPasswordModal) {
      setMobile(id || '');
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 7, tension: 55, useNativeDriver: true }),
        Animated.timing(opacAnim,  { toValue: 1, duration: 280, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.88);
      opacAnim.setValue(0);
    }
  }, [showForgotPasswordModal, id]);

  const closeModal = () => {
    if (!isLoading) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 0.88, friction: 7, tension: 55, useNativeDriver: true }),
        Animated.timing(opacAnim,  { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        setShowForgotPasswordModal(false);
        Keyboard.dismiss();
      });
    }
  };

  const internalHandleForgotPassword = useCallback(async () => {
    const isMobileValid = /^\d{10}$/.test(mobile);
    const isEmailValid  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mobile);
    if (!isMobileValid && !isEmailValid) {
      const msg = 'Please enter a valid mobile number or email.';
      Platform.OS === 'android' ? ToastAndroid.show(msg, ToastAndroid.SHORT) : alert(msg);
      return;
    }
    setIsLoading(true);
    try {
      const response = await post({ url: APP_URLS.forgotLoginPassword, data: { Email: mobile } });
      if (response?.Message) {
        Platform.OS === 'android'
          ? ToastAndroid.show(response.Message, ToastAndroid.SHORT)
          : alert(response.Message);
        setMobile('');
        setShowForgotPasswordModal(false);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      Keyboard.dismiss();
    }
  }, [mobile, post, setShowForgotPasswordModal]);

  return (
    <Modal
      visible={showForgotPasswordModal}
      transparent
      animationType="none"
      onRequestClose={closeModal}
    >
      <TouchableWithoutFeedback onPress={closeModal}>
        <Animated.View style={[styles.overlay, {
          opacity: opacAnim,
          backgroundColor: hexAlpha(C.btnPri, 0.45),
        }]}>

          {/* KeyboardAwareScrollView handles keyboard push-up */}
          <KeyboardAwareScrollView
            contentContainerStyle={styles.scrollContent}
            enableOnAndroid={true}
            enableAutomaticScroll={true}
            extraScrollHeight={hScale(20)}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <TouchableWithoutFeedback>
              <Animated.View style={[styles.cardWrap, {
                transform: [{ scale: scaleAnim }],
                opacity: opacAnim,
              }]}>

                {/* Outer gradient shell — same as LoginScreen */}
                <LinearGradient
                  colors={[C.primary, C.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientShell}
                >
                  {/* Decorative circles */}
                  <View style={[styles.circleTR, { backgroundColor: hexAlpha(C.btnPri, 0.18) }]} />
                  <View style={[styles.circleBL, { backgroundColor: hexAlpha(C.btnSec, 0.14) }]} />

                  {/* Glass card */}
                  <View style={[styles.glassCard, {
                    backgroundColor: hexAlpha('#ffffff', 0.13),
                    borderColor:     hexAlpha('#ffffff', 0.22),
                    shadowColor:     C.btnPri,
                  }]}>

                    {/* Icon */}
                    <View style={[styles.iconOuter, {
                      backgroundColor: hexAlpha('#ffffff', 0.10),
                      borderColor:     hexAlpha('#ffffff', 0.25),
                    }]}>
                      <View style={[styles.iconMid, {
                        backgroundColor: hexAlpha(C.btnPri, 0.18),
                        borderColor:     hexAlpha(C.label, 0.2),
                      }]}>
                        <LinearGradient
                          colors={[C.btnPri, C.btnSec]}
                          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                          style={[styles.iconCircle, { shadowColor: C.btnPri }]}
                        >
                          <Icon name="lock-reset" size={28} color={C.label} />
                        </LinearGradient>
                      </View>
                    </View>

                    {/* Title */}
                    <Text style={[styles.title, { color: C.label }]}>
                      {translate('Reset_Password')}
                    </Text>

                    {/* Subtitle */}
                    <Text style={[styles.subtitle, { color: hexAlpha(C.label, 0.65) }]}>
                      {translate('Enter_your_mobile_number_or_email_ID_to_reset_your_password')}
                    </Text>

                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: hexAlpha(C.label, 0.18) }]} />

                    {/* Label */}
                    <Text style={[styles.inputLabel, { color: hexAlpha(C.label, 0.75) }]}>
                      {translate('Mobile_Email')}
                    </Text>

                    {/* Input — same glass style as LoginScreen */}
                    <View style={[styles.inputWrapper, {
                      backgroundColor: hexAlpha('#ffffff', 0.12),
                      borderColor: isFocused
                        ? hexAlpha(C.label, 0.6)
                        : hexAlpha('#ffffff', 0.25),
                    }]}>
                      <Icon
                        name="email-outline"
                        size={20}
                        color={hexAlpha(C.label, 0.6)}
                        style={{ marginRight: wScale(10) }}
                      />
                      <TextInput
                        style={[styles.textInput, { color: C.label }]}
                        placeholder="9876543210  or  name@mail.com"
                        placeholderTextColor={hexAlpha(C.label, 0.38)}
                        onChangeText={setMobile}
                        value={mobile}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        cursorColor={C.btnPri}
                        onFocus={() => setIsFocused(true)}
                        onBlur={()  => setIsFocused(false)}
                      />
                    </View>

                    {/* Submit button — same as LoginScreen loginBtn */}
                    <Pressable
                      onPress={internalHandleForgotPassword}
                      disabled={isLoading}
                      style={({ pressed }) => [{
                        opacity: pressed ? 0.87 : 1,
                        width: '100%',
                        marginTop: hScale(8),
                      }]}
                    >
                      <LinearGradient
                        colors={[C.btnPri, C.btnSec]}
                        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        style={[styles.submitBtn, { shadowColor: C.btnPri }]}
                      >
                        {isLoading
                          ? <ActivityIndicator color={C.label} size="small" />
                          : <>
                              <Icon name="send-lock" size={18} color={C.label} style={{ marginRight: 8 }} />
                              <Text style={[styles.submitText, { color: C.label }]}>
                                Forgot Password
                              </Text>
                            </>
                        }
                      </LinearGradient>
                    </Pressable>

                    {/* Cancel ghost button */}
                    <Pressable
                      onPress={closeModal}
                      style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1, marginTop: hScale(10) }]}
                    >
                      <View style={[styles.cancelBtn, {
                        backgroundColor: hexAlpha('#ffffff', 0.08),
                        borderColor:     hexAlpha('#ffffff', 0.22),
                      }]}>
                        <Text style={[styles.cancelText, { color: hexAlpha(C.label, 0.7) }]}>
                          {translate('Cancel') || 'Cancel'}
                        </Text>
                      </View>
                    </Pressable>

                  </View>
                </LinearGradient>
              </Animated.View>
            </TouchableWithoutFeedback>
          </KeyboardAwareScrollView>

        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default ForgotPasswordModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wScale(24),
    paddingVertical: hScale(32),
  },
  cardWrap: {
    width: '100%',
  },

  // Gradient shell
  gradientShell: {
    borderRadius: 32,
    padding: wScale(20),
    overflow: 'hidden',
    position: 'relative',
  },

  // Decorative circles
  circleTR: {
    position: 'absolute',
    width: 160, height: 160, borderRadius: 80,
    top: -40, right: -40,
  },
  circleBL: {
    position: 'absolute',
    width: 120, height: 120, borderRadius: 60,
    bottom: -30, left: -30,
  },

  // Glass card
  glassCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: wScale(20),
    alignItems: 'center',
 
  },

  // Icon rings
  iconOuter: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: hScale(16),
  },
  iconMid: {
    width: 68, height: 68, borderRadius: 34,
    borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  iconCircle: {
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',

  },

  // Text
  title: {
    fontSize: wScale(20),
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
    marginBottom: hScale(8),
  },
  subtitle: {
    fontSize: wScale(13),
    textAlign: 'center',
    lineHeight: hScale(20),
    marginBottom: hScale(16),
    paddingHorizontal: wScale(4),
  },
  divider: {
    width: '100%', height: 1,
    marginBottom: hScale(14),
  },
  inputLabel: {
    alignSelf: 'flex-start',
    fontSize: wScale(11),
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: hScale(8),
    marginLeft: wScale(2),
  },

  // Input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: wScale(14),
    height: hScale(52),
    width: '100%',
  },
  textInput: {
    flex: 1,
    fontSize: wScale(14),
    fontWeight: '500',
  },

  // Submit button
  submitBtn: {
    borderRadius: 50,
    paddingVertical: hScale(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
   
  },
  submitText: {
    fontSize: wScale(16),
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  // Cancel button
  cancelBtn: {
    paddingHorizontal: wScale(32),
    paddingVertical: hScale(10),
    borderRadius: 50,
    borderWidth: 1,
  },
  cancelText: {
    fontSize: wScale(14),
    fontWeight: '600',
  },
});