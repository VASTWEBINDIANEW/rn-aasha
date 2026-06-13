import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Button,
  TouchableOpacity,
  Keyboard,
  TextInput,
  ToastAndroid,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import { hScale, wScale } from '../../utils/styles/dimensions';
import CountdownTimer from '../dashboard/components/ContdownTimer';
import { useNavigation } from '../../utils/navigation/NavigationService';
import ShowLoderTr from '../../components/ShowLoderTr';
import QrcodeExpiredSvg from '../drawer/svgimgcomponents/QrcodeExpiredSvg';
import DynamicButton from '../drawer/button/DynamicButton';
import { APP_URLS } from '../../utils/network/urls';
import FlotingInput from '../drawer/securityPages/FlotingInput';
import useAxiosHook from '../../utils/network/AxiosClient';
import { Modal } from 'react-native-paper';
import MovingDotBorderText from '../../components/AnimatedBorderView';
import ClosseModalSvg2 from '../drawer/svgimgcomponents/ClosseModal2';
import ClosseModalSvg from '../drawer/svgimgcomponents/ClosseModal';
import { translate } from '../../utils/languageUtils/I18n';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { color } from '@rneui/base';

export default function PaymentQR({
  QrImg,
  amnt,
  name,
  Txnid,
  onBharatpayresponse,
}) {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const navigation = useNavigation<any>();
  const [isExpired, setIsExpired] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [utr, setUtr] = useState('');
  const handleExpire = () => {
    setIsExpired(true);

    setTimeout(() => {
      navigation.goBack();
    }, 2000);
  };

  const handleSubmitUTR = () => {
    const trimmedUTR = utr.trim();

    if (!trimmedUTR) {
      ToastAndroid.show(
        translate('Please enter UTR number'),
        ToastAndroid.SHORT,
      );
      return;
    }

    if (!/^\d{12}$/.test(trimmedUTR)) {
      ToastAndroid.show(
        translate('UTR must be 12 digits numeric'),
        ToastAndroid.SHORT,
      );
      return;
    }

    if (/\s/.test(trimmedUTR)) {
      ToastAndroid.show(
        translate('UTR cannot contain spaces'),
        ToastAndroid.SHORT,
      );
      return;
    }

    onBharatpayresponse(Txnid, trimmedUTR);
    setShowModal(false);
    setUtr('');
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <View style={[styles.topHalf]} />
        <View
          style={[
            styles.bottomHalf,
            { backgroundColor: colorConfig.secondaryColor },
          ]}
        />
        <View style={styles.centerContent}>
          {!showModal && (
            <>
              <Text style={styles.title}>{translate('Scan This Amount')}</Text>
              <Text
                style={[
                  styles.subtitle,
                  { backgroundColor: colorConfig.secondaryColor },
                ]}
              >
                ₹ {amnt}
              </Text>
              <View style={styles.qrBox}>
                {showLoader ? (
                  <ShowLoderTr />
                ) : !isExpired ? (
                  QrImg ? (
                    <Image source={{ uri: QrImg }} style={styles.qrImage} />
                  ) : (
                    <ShowLoderTr />
                  )
                ) : (
                  <View style={{ alignItems: 'center' }}>
                    <QrcodeExpiredSvg />
                    <Text style={[styles.expired, { color: '#000' }]}>
                      {translate('your QR is expired')}
                    </Text>
                  </View>
                )}
              </View>

              {QrImg && !isExpired && (
                <CountdownTimer onComplete={handleExpire} initialTime={100} />
              )}

              {isExpired && (
                <Text style={styles.disc}>
                  {translate(
                    'key_regenerate_88',
                  )}
                </Text>
              )}
              {name === 'BHARAT PE' && (
                <TouchableOpacity
                  style={styles.butInput}
                  onPress={() => setShowModal(true)}
                >
                  <Text style={styles.butInputText}>
                    {translate('Enter Utr No.')}
                  </Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
<Modal
  visible={showModal}
  onDismiss={() => setShowModal(false)}
  contentContainerStyle={styles.modalContainer}
>
  <KeyboardAwareScrollView
    enableOnAndroid={true}
    enableAutomaticScroll={true}
    extraScrollHeight={hScale(80)}      // keyboard ke upar kitna space
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
    contentContainerStyle={{ flexGrow: 1 }}
  >
    {/* Close Button */}
    <TouchableOpacity
      style={styles.closeBtn}
      onPress={() => setShowModal(false)}
    >
      <ClosseModalSvg />
    </TouchableOpacity>

    {/* Icon */}
    <View style={[styles.iconCircle,{backgroundColor:colorConfig.secondaryButtonColor}]}>
      <Text style={styles.iconText}>₹</Text>
    </View>

    {/* Title */}
    <Text style={styles.modalTitle}>{translate("Enter UTR Number")}</Text>
    <Text style={styles.modalSubtitle}>
      {translate("12-digit transaction reference number")}
    </Text>

    {/* Input */}
    <View style={styles.inputWrapper}>
      <TextInput
        value={utr}
        onChangeText={setUtr}
        keyboardType="number-pad"
        placeholder={translate("UTR Number")}
        placeholderTextColor="#adb5bd"
        style={styles.modalInput}
        autoCorrect={false}
        blurOnSubmit={false}
        returnKeyType="done"
        multiline={false}
        maxLength={12}
      />
      {utr.length > 0 && (
        <Text style={styles.charCount}>{utr.length}/12</Text>
      )}
    </View>

    {/* Submit Button */}
    <TouchableOpacity
      style={[
        styles.submitBtn,
        {backgroundColor:colorConfig.primaryColor, opacity: utr.length === 12 ? 1 : 0.5 },
      ]}
      onPress={handleSubmitUTR}
      activeOpacity={0.8}
    >
      <Text style={styles.submitBtnText}>{translate("Submit Payment")}</Text>
    </TouchableOpacity>

  </KeyboardAwareScrollView>
</Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  utrInput: {
    height: hScale(50),
    width: '100%',
    padding: 10,
  },
  container: {
    flex: 1,
  },
  input: {
    width: wScale(350),
  },
  topHalf: {
    flex: 1,
    backgroundColor: '#eeede4',
    width: '100%',
  },

  bottomHalf: {
    flex: 1,
    backgroundColor: '#F25E3D',
    width: '100%',
  },

  centerContent: {
    position: 'absolute',
    top: '35%', // was "40%"
    left: 0,
    right: 0,
    transform: [{ translateY: -hScale(199) }],
    alignItems: 'center',
    zIndex: 99,
  },

  title: {
    fontSize: wScale(25),
    fontWeight: 'bold',
    color: '#1C3C77',
    alignSelf: 'center',
    textTransform: 'uppercase',
  },
  option: {
    height: hScale(40),
    backgroundColor: '#fff',
    borderRadius: wScale(0),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: wScale(10),
    paddingHorizontal: wScale(20),
    marginBottom: hScale(20),
  },
  expired: {
    fontSize: wScale(25),
    fontWeight: 'bold',
    color: '#1C3C77',
    alignSelf: 'center',
    textTransform: 'uppercase',
    marginTop: hScale(10),
  },
  disc: {
    fontSize: wScale(18),
    alignSelf: 'center',
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: wScale(33),
    textTransform: 'uppercase',
    marginTop: hScale(10),
  },

  subtitle: {
    marginTop: hScale(8),
    backgroundColor: '#FF6A4D',
    color: 'white',
    paddingHorizontal: wScale(20),
    paddingVertical: hScale(6),
    borderRadius: wScale(10),
    fontWeight: 'bold',
    fontSize: wScale(32),
  },

  qrBox: {
    marginTop: hScale(20),
    backgroundColor: 'white',
    borderRadius: wScale(12),
    width: wScale(315),
    height: wScale(315),
    marginBottom: hScale(10),
    alignItems: 'center',
    justifyContent: 'center',
  },

  qrImage: {
    width: wScale(315),
    height: wScale(315),
    resizeMode: 'contain',
    borderRadius: wScale(12),
    alignItems: 'center',
    alignSelf: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',

    padding: 20,
    borderRadius: 10,
    width: wScale(350),
    height: wScale(500),
    alignSelf: 'center',
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
    color: '#000',
  },

  butInput: {
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: hScale(8),
    borderColor: '#fff',
    width: '80%',
    paddingHorizontal: wScale(15),
    marginTop: hScale(20),
  },
  butInputText: {
    fontSize: wScale(18),
    color: '#fff',
  },
  close: {
    position: 'absolute',
    top: hScale(-12),
    right: wScale(-12),
  },


closeBtn: {
  position: 'absolute',
  top: hScale(-0),
  right: wScale(0),
  zIndex: 10,
  backgroundColor: '#fff',
  borderRadius: wScale(20),
  padding: wScale(2),
  elevation: 4,
},
iconCircle: {
  width: wScale(58),
  height: wScale(58),
  borderRadius: wScale(29),
  backgroundColor: '#667eea',
  alignItems: 'center',
  justifyContent: 'center',
  alignSelf: 'center',
  marginBottom: hScale(12),
},
iconText: {
  fontSize: wScale(26),
  color: '#fff',
  fontWeight: 'bold',
},

modalSubtitle: {
  fontSize: wScale(12),
  color: '#94a3b8',
  textAlign: 'center',
  marginBottom: hScale(18),
},
inputWrapper: {
  position: 'relative',
  marginBottom: hScale(16),
},
modalInput: {
  backgroundColor: '#f8faff',
  borderWidth: 1.5,
  borderColor: '#e2e8f0',
  borderRadius: wScale(12),
  paddingHorizontal: wScale(16),
  paddingVertical: hScale(14),
  fontSize: wScale(18),
  letterSpacing: 3,
  color: '#1a1a2e',
  fontWeight: '600',
},
charCount: {
  position: 'absolute',
  right: wScale(12),
  bottom: hScale(14),
  fontSize: wScale(11),
  color: '#94a3b8',
},
submitBtn: {
  borderRadius: wScale(12),
  paddingVertical: hScale(14),
  alignItems: 'center',
},
submitBtnText: {
  color: '#fff',
  fontSize: wScale(15),
  fontWeight: '700',
  letterSpacing: 0.5,
},

});