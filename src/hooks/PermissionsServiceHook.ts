/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useCallback } from 'react';
import { Platform, Alert, Linking } from 'react-native'; // ✅ Added Linking
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions'; // ✅ Removed rationalize
import { useFocusEffect } from '@react-navigation/native';

interface PermissionState {
  status: 'idle' | 'loading' | 'granted' | 'denied' | 'blocked';
  error?: string;
}

export const usePermissions = () => {
  const [contacts, setContacts] = useState<PermissionState>({ status: 'idle' });
  const [location, setLocation] = useState<PermissionState>({ status: 'idle' });

  // ✅ Contacts Permission
  const requestContactsPermission = useCallback(async (): Promise<boolean> => {
    try {
      setContacts({ status: 'loading' });

      if (Platform.OS !== 'android') {
        setContacts({ status: 'granted' });
        return true;
      }

      let status = await check(PERMISSIONS.ANDROID.READ_CONTACTS);

      if (status === RESULTS.GRANTED) {
        setContacts({ status: 'granted' });
        return true;
      }

      if (status === RESULTS.BLOCKED) {
        setContacts({ status: 'blocked', error: 'Contacts blocked in settings' });
        showBlockedDialog('Contacts');
        return false;
      }

      status = await request(PERMISSIONS.ANDROID.READ_CONTACTS, {
        title: 'Contacts Access Required',
        message: 'Aadhaar verification needs access to your contacts for KYC',
        buttonPositive: 'Grant Access',
        buttonNegative: 'Cancel',
      });

      if (status === RESULTS.GRANTED) {
        setContacts({ status: 'granted' });
        return true;
      } else {
        setContacts({ status: 'denied' });
        return false;
      }
    } catch (error: any) {
      console.log('Contacts permission error:', error);
      setContacts({ status: 'denied', error: error?.message });
      return false;
    }
  }, []);

  // ✅ Location Permission
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    try {
      setLocation({ status: 'loading' });

      if (Platform.OS !== 'android') {
        setLocation({ status: 'granted' });
        return true;
      }

      let status = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
console.log('Initial location permission status:', status);
      if (status === RESULTS.GRANTED) {
        setLocation({ status: 'granted' });
        return true;
      }

      if (status === RESULTS.BLOCKED) {
        setLocation({ status: 'blocked', error: 'Location blocked in settings' });
        showBlockedDialog('Location');
        return false;
      }

      status = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION, {
        title: 'Location Access Required',
        message: 'Precise location needed for Aadhaar geo-verification',
        buttonPositive: 'Allow Location',
        buttonNegative: 'Cancel',
      });

      if (status === RESULTS.GRANTED) {
        setLocation({ status: 'granted' });
        return true;
      } else {
        setLocation({ status: 'denied' });
        return false;
      }
    } catch (error: any) {
      console.log('Location permission error:', error);
      setLocation({ status: 'denied', error: error?.message });
      return false;
    }
  }, []);

  // ✅ Check all permissions at once
  const requestAllPermissions = useCallback(async (): Promise<boolean> => {
    const [contactsGranted, locationGranted] = await Promise.all([
      requestContactsPermission(),
      requestLocationPermission(),
    ]);
    return contactsGranted && locationGranted;
  }, [requestContactsPermission, requestLocationPermission]);

  // ✅ Reset permissions
  const resetPermissions = useCallback(() => {
    setContacts({ status: 'idle' });
    setLocation({ status: 'idle' });
  }, []);

  // ✅ Check permission status
  const checkContactsStatus = useCallback(async () => {
    try {
      const status = await check(PERMISSIONS.ANDROID.READ_CONTACTS);
      setContacts({ status: mapResultToState(status) });
    } catch (error) {
      console.warn('checkContactsStatus error:', error);
    }
  }, []);

  const checkLocationStatus = useCallback(async () => {
    try {
      const status = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      setLocation({ status: mapResultToState(status) });
    } catch (error) {
      console.warn('checkLocationStatus error:', error);
    }
  }, []);

  // ✅ Auto-check on focus
  useFocusEffect(
    useCallback(() => {
      checkContactsStatus();
      checkLocationStatus();
    }, [checkContactsStatus, checkLocationStatus])
  );

  return {
    contacts,
    location,
    requestContactsPermission,
    requestLocationPermission,
    requestAllPermissions,
    resetPermissions,
    checkContactsStatus,
    checkLocationStatus,
  };
};

// ✅ Helper functions (FIXED)
const mapResultToState = (result: string): PermissionState['status'] => {
  switch (result) {
    case RESULTS.GRANTED: return 'granted';
    case RESULTS.DENIED: return 'denied';
    case RESULTS.BLOCKED: return 'blocked';
    default: return 'idle';
  }
};

const showBlockedDialog = (permission: string) => {
  Alert.alert(
    `${permission} Permission Blocked`,
    `Please enable ${permission.toLowerCase()} permission in app settings`,
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Settings', onPress: () => Linking.openSettings() },
    ]
  );
};

export default usePermissions;