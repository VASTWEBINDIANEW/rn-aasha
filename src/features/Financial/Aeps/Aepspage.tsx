import { translate } from "../../../utils/languageUtils/I18n";
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ToastAndroid,
} from 'react-native';
import { useDispatch } from 'react-redux';

import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import CheckSvg from '../../drawer/svgimgcomponents/CheckSvg';
import AepsTabScreen from './AepsTabScreen';
import ShowLoader from '../../../components/ShowLoder';
import { setActiveAepsLine } from '../../../reduxUtils/store/userInfoSlice';

const AepsScreen = () => {
  const { post } = useAxiosHook();
  const dispatch = useDispatch();

  const [selectedLine, setSelectedLine] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  // FIXED: isAutoSwitching ko yahan sahi se define kiya gaya hai
  const isAutoSwitching = useRef(false);

  const checkAeps = useCallback(async (requestedLine: number) => {
    try {
      setIsLoading(true);
      console.log('--- Checking Status for Line:', requestedLine, '---');
      
      const response = await post({ url: APP_URLS.AepsStatusCheck });

      // ERROR CHECK: Agar server se HTML (404 error) aa raha ho
      if (typeof response === 'string' && response.includes('<!DOCTYPE html>')) {
        Alert.alert("API Error", "Server configuration issue (404). Please check APP_URLS.AepsStatusCheck");
        return;
      }

      if (!response) {
        console.log('Empty Response Received');
        return;
      }

      // Response Logs for Line by Line Check
      console.log('Response status1:', response.status1);
      console.log('Response status2:', response.status2);
      console.log('Response Message:', response.message);

      const { status1, status2, message = "No Message from Server" } = response;

      if (requestedLine === 1) {
        if (status1 === true) {
          dispatch(setActiveAepsLine(true));
          ToastAndroid.show('Green Line Active', ToastAndroid.SHORT);
        } else {
          if (!isAutoSwitching.current) {
            isAutoSwitching.current = true;
            Alert.alert('Notice', message || 'Green Line is down.', [
              { text: 'Switch to Yellow', onPress: () => setSelectedLine(1) }
            ]);
          }
        }
      } else if (requestedLine === 2) {
        if (status2 === true) {
          dispatch(setActiveAepsLine(false));
          ToastAndroid.show('Yellow Line Active', ToastAndroid.SHORT);
        } else {
          if (!isAutoSwitching.current) {
            isAutoSwitching.current = true;
            Alert.alert('Notice', message || 'Yellow Line is down.', [
              { text: 'Switch to Green', onPress: () => setSelectedLine(0) }
            ]);
          }
        }
      }

      // Reset flag after 1.5 seconds
      setTimeout(() => { isAutoSwitching.current = false; }, 1500);

    } catch (error: any) {
      console.error('--- EXCEPTION LOG ---');
      console.error('Msg:', error.message);
      Alert.alert('Fatal Error', `Detail: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [post, dispatch]);

  useEffect(() => {
    checkAeps(selectedLine === 0 ? 1 : 2);
  }, [selectedLine, checkAeps]);

  return (
    <View style={styles.container}>
      <AppBarSecond title="AEPS / AADHAAR PAY" />

      <View style={styles.radioContainer}>
            <TouchableOpacity
          disabled={isLoading}
          style={[styles.radioButton, styles.yellowBg, selectedLine === 1 && styles.yellowSelected]}
          onPress={() => {
            isAutoSwitching.current = false;
            setSelectedLine(1);
          }}
        >
          {selectedLine === 1 && (
            <View style={styles.check}><CheckSvg color="#F4C430" size={14} /></View>
          )}
          <Text style={styles.radioText}>{translate("Yellow_Line")}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          disabled={isLoading}
          style={[styles.radioButton, styles.greenBg, selectedLine === 0 && styles.greenSelected]}
          onPress={() => {
            isAutoSwitching.current = false;
            setSelectedLine(0);
          }}
        >
          {selectedLine === 0 && (
            <View style={styles.check}><CheckSvg color="#1FAA59" size={14} /></View>
          )}
          <Text style={styles.radioText}>{translate("Green_Line")}</Text>
        </TouchableOpacity>

    
      </View>

      <View style={{ flex: 1 }}>
              {isLoading && <ShowLoader />}

        <AepsTabScreen />
      </View>

    </View>
  );
};

export default AepsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#fff',
    elevation: 4,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48%',
    paddingVertical: 12,
    borderRadius: 8,
  },
  greenBg: { backgroundColor: '#1FAA59' },
  yellowBg: { backgroundColor: '#F4C430' },
  greenSelected: { backgroundColor: '#138D4E', borderWidth: 2, borderColor: '#fff' },
  yellowSelected: { backgroundColor: '#E0C200', borderWidth: 2, borderColor: '#fff' },
  radioText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  check: { backgroundColor: '#fff', borderRadius: 10, padding: 2, marginRight: 8 },
});
