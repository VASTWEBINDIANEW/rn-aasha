import {useCallback} from 'react';
import {
  getIpAddress,
  getDeviceId,
  getUniqueId,
  getAndroidId,
  getCarrier,
  getPhoneNumber,
} from 'react-native-device-info';

export const useDeviceInfoHook = () => {
  const getMobileDeviceId = useCallback(() => {
    return getDeviceId();
  }, []);

  const getMobileUniqueNumber = useCallback(async () => {
    const uniqueId = await getUniqueId();
    return uniqueId;
  }, []);

  const getMobileIpAddress = useCallback(async () => {
    const ipAddress = await getIpAddress();
    return ipAddress;
  }, []);

  const getAndroidIdInfo = useCallback(async () => {
    const id = await getAndroidId();
    return id;
  }, []);

  const getNetworkCarrier = useCallback(async () => {
    const networkCarrier = await getCarrier();
    return networkCarrier;
  }, []);  
  
  const getMobileIp = useCallback(async () => {
    const ip = await getIpAddress();
    return ip;
  }, []);

  const getMobilePhoneNumber = useCallback(async () => {
    const number = await getPhoneNumber();
    console.log('number', number);
    return number;
  }, []);

  return {
    getMobileDeviceId,
    getMobileUniqueNumber,
    getMobileIpAddress,
    getAndroidIdInfo,
    getNetworkCarrier,
    getMobileIp,
    getMobilePhoneNumber,
  };
};
