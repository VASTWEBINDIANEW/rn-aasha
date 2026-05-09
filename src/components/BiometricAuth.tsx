import React, { useState, useEffect, useCallback } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  Alert, 
  BackHandler, 
  NativeModules, 
  StatusBar 
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../reduxUtils/store';
import { setUnlocked } from '../reduxUtils/store/userInfoSlice';

const { SecurityModule } = NativeModules;

export default function BiometricAuth() {
  const dispatch = useDispatch();
  const { unLocked } = useSelector((state: RootState) => state.userInfo);
  
  const [isModalVisible, setModalVisible] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // ✅ Memoized auth function
  const authenticateWithNative = useCallback(async () => {
    if (isAuthenticating) return; // Prevent multiple calls

    setIsAuthenticating(true);
    
    try {
      console.log('🔐 Starting native authentication...');
      
      // First check device security
      const securityStatus = await SecurityModule.checkDeviceSecurity();
      
      if (securityStatus === 'NOT_SECURE') {
        console.log('📱 No screen lock found, allowing access');
        dispatch(setUnlocked(true));
        return;
      }

      // Show screen lock
      const success = await SecurityModule.showScreenLock();
      
      console.log('✅ Auth result:', success);
      
      // Success ya Cancel - dono case me aage allow
      dispatch(setUnlocked(true));
      
    } catch (error) {
      console.log('❌ Auth error:', error);
      
      // Handle all error cases - allow access
      if (error.code === 'NO_LOCK' || error.code === 'ACTIVITY_GONE') {
        dispatch(setUnlocked(true));
      } else {
        // Critical error - show alert
        Alert.alert(
          'Security Check',
          'Unable to verify security. Please restart app.',
          [{ text: 'OK', onPress: () => dispatch(setUnlocked(true)) }]
        );
      }
    } finally {
      setIsAuthenticating(false);
    }
  }, [dispatch, isAuthenticating]);

  // ✅ Optimized useEffect
  useEffect(() => {
    if (unLocked === false && !isModalVisible) {
      setModalVisible(true);
      authenticateWithNative();
    }
  }, [unLocked, authenticateWithNative]);

  // ✅ BackHandler cleanup
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      return isModalVisible || isAuthenticating;
    });

    return () => backHandler.remove();
  }, [isModalVisible, isAuthenticating]);

  // Agar already unlocked hai ya auth complete ho gaya
  if (unLocked === true || !isModalVisible) {
    return null;
  }

  // Show loading modal during auth
  return (
    <>
      <StatusBar backgroundColor="transparent" barStyle="light-content" translucent />
      
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.loadingSpinner} />
          
          <Text style={styles.title}>Security Check</Text>
          <Text style={styles.subtitle}>
            {isAuthenticating 
              ? 'Please authenticate to continue...' 
              : 'Verifying device security...'
            }
          </Text>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  loadingSpinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderColor: '#667eea',
    borderTopColor: 'transparent',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});