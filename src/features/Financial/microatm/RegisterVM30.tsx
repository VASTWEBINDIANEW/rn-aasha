import { translate } from "../../../utils/languageUtils/I18n";
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Animated, ScrollView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAxiosHook from '../../../utils/network/AxiosClient';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { hScale } from '../../../utils/styles/dimensions';

const RegisterVM30 = ({ route }) => {
  const { deviceSerial } = route.params;
  const [devicenum, setDeviceNum] = useState(deviceSerial);
  const [validate, setValidate] = useState(false);
  const navigation = useNavigation();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const { post } = useAxiosHook();

  useEffect(() => {
    setDeviceNum(deviceSerial);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, [deviceSerial]);

  const deviceRegister = async (serialno) => {
    try {
      const res = await post({ url: `MICROATM/api/data/SubmitSnNo?DeviceSnNo=${serialno}` });
      const { status, msg } = res;

      if (status === 'Success') {
        Alert.alert('Activation Successful', msg, [
          { text: 'Awesome', onPress: () => navigation.goBack() },
        ]);
      } else {
        Alert.alert('Activation Failed', msg || 'Invalid Serial Number', [{ text: 'Try Again', style: 'cancel' }]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Network Error', 'Please check your connection');
    }
  };

  const handleSubmit = () => {
    if (!devicenum) {
      setValidate(true);
    } else {
      setValidate(false);
      deviceRegister(devicenum);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f4f7fe" />
      <AppBarSecond title={'Device Activation'} />

      <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.mainCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          
          {/* Success Badge */}
          <View style={styles.headerSection}>
            <View style={styles.successBadge}>
              <Text style={styles.checkIcon}>✓</Text>
            </View>
            <Text style={styles.titleText}>{translate("Verification_Complete")}</Text>
            <Text style={styles.subTitleText}>{translate("key_merchantp_149")}</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>{translate("Device_Serial_Number")}</Text>
            <View style={[styles.inputWrapper, validate && styles.errorBorder]}>
              <TextInput
                style={styles.input}
                value={devicenum}
                onChangeText={setDeviceNum}
                placeholder="Ex: VM30-XXXXXXXX"
                editable={false} // Serial usually read-only in this step
                placeholderTextColor="#A0AEC0"
              />
            </View>
            {validate && <Text style={styles.errorText}>Serial number is required</Text>}

            <TouchableOpacity 
              activeOpacity={0.8} 
              style={styles.primaryButton} 
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>{translate("Activate_Device")}</Text>
            </TouchableOpacity>
            
            <Text style={styles.footerNote}>{translate("key_ensurethe_150")}</Text>
          </View>

        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f7fe', // Soft modern background
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: hScale(20),
    justifyContent: 'center',
  },
  mainCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  successBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E6F9EE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkIcon: {
    color: '#28a745',
    fontSize: 28,
    fontWeight: 'bold',
  },
  titleText: {
    fontSize: hScale(22),
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 8,
    textAlign: 'center',
  },
  subTitleText: {
    fontSize: hScale(14),
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 10,
  },
  formContainer: {
    marginTop: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    backgroundColor: '#F7FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  input: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    textAlign: 'center',
  },
  errorBorder: {
    borderColor: '#F56565',
  },
  errorText: {
    color: '#F56565',
    fontSize: 12,
    marginBottom: 10,
    marginLeft: 5,
  },
  primaryButton: {
    backgroundColor: '#0061FF', // Modern Blue
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#0061FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  footerNote: {
    textAlign: 'center',
    color: '#A0AEC0',
    fontSize: 12,
    marginTop: 20,
  }
});

export default RegisterVM30;
