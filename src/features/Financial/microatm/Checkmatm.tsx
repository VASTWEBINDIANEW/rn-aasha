import React, { useEffect } from 'react';
import { Button, Alert, NativeModules, DeviceEventEmitter } from 'react-native';

const { BalanceModule } = NativeModules;

const CheckBalance = () => {
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener('TransactionStatus', (message) => {
      Alert.alert('Transaction Status', message);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const checkBalance = () => {
    BalanceModule.checkBalance('loginId', 'uniqueId', 'password', true)
      .then((message) => {
        console.log(message); // "Success"
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <Button title="Check Balance" onPress={checkBalance} />
  );
};

export default CheckBalance;
