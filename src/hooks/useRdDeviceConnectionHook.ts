import { useCallback, useEffect, useState } from 'react';
import { getDeviceInfo } from 'react-native-rdservice-fingerprintscanner';

export const useRdDeviceConnectionHook = () => {    
  const [isDeviceConnected, setIsDeviceConnected] = useState(false);

  // Function to check if the RD service is connected
  const isRdServiceConnected = useCallback(async () => {
    try {
      const result = await getDeviceInfo();
      const isReady = result?.rdServiceInfoJson?.RDService?.status;
      setIsDeviceConnected(isReady === 'READY')
    } catch (error) {
      console.error("Error checking RD service connection", error);
      return false;
    }
  }, []);

 
  useEffect(() => {
    const intervalId = setInterval(async () => {
     await isRdServiceConnected();
      
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [isRdServiceConnected]);

  return {
    isDeviceConnected
  };
};
