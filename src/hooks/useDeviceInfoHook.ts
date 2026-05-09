import {useCallback, useState} from 'react';
import { Platform } from 'react-native';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import {
  getIpAddress,
  getDeviceId,
  getUniqueId,
  getAndroidId,
  getCarrier,
  getPhoneNumber,
} from 'react-native-device-info';
import { PERMISSIONS, RESULTS, openSettings, requestMultiple } from 'react-native-permissions';

import SimCardsManagerModule from 'react-native-sim-cards-manager';



export const useDeviceInfoHook = () => {    

  const [isPhonePermissionGranted, setIsPhonePermissionGranted] = useState(null);
  const getMobileDeviceId = useCallback(() => {
    return getDeviceId();
  }, []);

  const getMobileUniqueNumber = useCallback(async () => {
    const uniqueId = await getUniqueId();
    return uniqueId;
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

  const showPermissionDialog = useCallback(() => {
    Dialog.show({
      type: ALERT_TYPE.WARNING,
      title: "Permission Required",
      textBody: "Please grant the phone state permission from settings.",
      button: "OK",
      onPressButton: () => {
        Dialog.hide();
        openSettings().catch(() => console.warn("cannot open settings"));
      },
    });

  }, [])

  const getSimPhoneNumber = useCallback(async () => {
    const permission = Number(Platform.Version) >= 11 ? [
      PERMISSIONS.ANDROID.READ_PHONE_STATE,
      PERMISSIONS.ANDROID.READ_PHONE_NUMBERS,
     ] :  [ PERMISSIONS.ANDROID.READ_PHONE_STATE]
  
    const statuses = await requestMultiple(permission);
    console.log('**DATA_RES1', statuses)
    if(statuses && statuses?.[PERMISSIONS.ANDROID.READ_PHONE_STATE] === RESULTS.GRANTED ||  statuses?.[PERMISSIONS.ANDROID.READ_PHONE_NUMBERS] === RESULTS.GRANTED){
      console.log('**DATA_RES1', statuses)
      setIsPhonePermissionGranted(true);
      const res = await SimCardsManagerModule.getSimCardsNative();
      console.log('**DATA_RES', res)
      return res || []
     }
     else{
      setIsPhonePermissionGranted(false);
      showPermissionDialog();
      return false;
     }
    },[]);

    const checkPhoneStatePermissionStatus = useCallback(async () => {
      const permission = Number(Platform.Version) >= 11 ? [
        PERMISSIONS.ANDROID.READ_PHONE_STATE,
        PERMISSIONS.ANDROID.READ_PHONE_NUMBERS,
       ] :  [ PERMISSIONS.ANDROID.READ_PHONE_STATE]

      const statuses = await requestMultiple(permission);

      if(statuses && statuses?.[PERMISSIONS.ANDROID.READ_PHONE_STATE] === RESULTS.GRANTED ||  statuses?.[PERMISSIONS.ANDROID.READ_PHONE_NUMBERS] === RESULTS.GRANTED){
         return true;
       }
       else{
        return false;
       }
    },[])



  // const getSimPhoneNumber = useCallback(async () => {
  // //  DeviceNumber.get().then((res) => {
  // //     console.log('**NUM_RES', res);
  // //   }).catch((err) => {
  // //     console.log('**NUM_ERR', err)
  // //   });
  // console.log('**NUM_CALLED')
  // const res = await SimCardsManagerModule.getSimCardsNative();
  // console.log('**NUM_CALLED11', res)
  // return res;
  // // .then((array: Array<any>) => {
  // //   if(array?.length > 0) {
  // //     console.log('**NUM_CALLED1')
  // //     console.log('**NUM_RES1', JSON.stringify(array[0]));
  // //   }
  // //   console.log('**NUM_CALLED2', array.length);
  // //  return array;
  // // })
  // // .catch((error) => {
  // //   console.log('**NUM_CALLED3', JSON.stringify(error));
  // //   //JSON.stringify('**NUM_ERR', error);
  // //   return [];
  // // });
  
   
  // }, []);



  return {
    getMobileDeviceId,
    getMobileUniqueNumber,
    getAndroidIdInfo,
    getNetworkCarrier,
    getMobileIp,
    getSimPhoneNumber,
    isPhonePermissionGranted,
    checkPhoneStatePermissionStatus,
  };
};
