/* eslint-disable react-native/no-inline-styles */
import React, {memo, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {wScale} from '../../utils/styles/dimensions';
// import ReactNativeBiometrics from 'react-native-biometrics';

// const rnBiometrics = new ReactNativeBiometrics({allowDeviceCredentials: true});

const DeviceLockScreen = () => {
  const navigation = useNavigation();

  const authenticateFingerprint = useCallback(async () => {
    // rnBiometrics
    //   .simplePrompt({promptMessage: 'Confirm fingerprint'})
    //   .then(resultObject => {
    //     const {success} = resultObject;

    //     if (success) {
    //       navigation.navigate('DashboardScreen');
    //     } else {
    //       console.log('user cancelled biometric prompt');
    //     }
    //   })
    //   .catch(() => {
    //     console.log('biometrics failed');
    //   });
  }, [navigation]);

  useEffect(() => {
    
    authenticateFingerprint();
  }, []);

  return (
    <TouchableOpacity
      onPress={() => {
        authenticateFingerprint();
      }}>
      <Text
        style={{
          fontSize: wScale(20),
          justifyContent: 'center',
          alignContent: 'center',
        }}>
        {'Check FingerPrint'}{' '}
      </Text>
    </TouchableOpacity>
  );
};

export default memo(DeviceLockScreen);

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  element: {
    paddingHorizontal: wScale(6),
    paddingVertical: wScale(8),
    margin: wScale(7),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
