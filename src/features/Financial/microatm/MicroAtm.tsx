import { useNavigation } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { disconnectDevice, startTransaction } from 'react-native-instantpay-mpos';
import { View, Text, NativeModules, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import uuid from 'react-native-uuid';
import { wScale } from '../../../utils/styles/dimensions';
import MicroatmTabScreen from './MicroatmTabScreen';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import DynamicButton from '../../drawer/button/DynamicButton';

const enum TRANSACTION_TYPE {
   PURCHASE = "PURCHASE",
   MICROATM = "MICROATM", 
   BALANCE_ENQUIRY = "BALANCE_ENQUIRY", 
   UPI = "UPI"
}
const MicroAtm = () => {
    const CredoPay = (() => {
        return NativeModules.AepsModule;
      })();
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const [isNewLogin, setIsNewLogin] = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const { post } = useAxiosHook();
  const uniqueId = uuid.v1().toString().substring(0, 16);

  const buttonTextColor = colorScheme === 'dark' ? 'white' : 'black';
  return (
    <View style={styles.main}>
      <AppBarSecond title={'Micro ATM Screen'} />
      <MicroatmTabScreen />

    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1
  },
  container: {
    paddingHorizontal: wScale(20),
    flex: 1,
  },


});

export default MicroAtm;
