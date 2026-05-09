import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { reset } from '../../reduxUtils/store/userInfoSlice';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import { hScale, wScale } from '../../utils/styles/dimensions';
import DynamicButton from './button/DynamicButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CloseSvg from './svgimgcomponents/CloseSvg';
import { translate } from '../../utils/languageUtils/I18n';

const Logout = () => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      dispatch(reset());
    } catch (error) {
      console.error('Failed to clear AsyncStorage:', error);
    }
  };

  return (
    <View style={styles.main}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.close}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <CloseSvg
            size={wScale(25)}
            color={colorConfig?.secondaryButtonColor || "#333"}
          />
        </TouchableOpacity>
        <Text style={styles.title}>{translate('Logout?')}</Text>
        <Text style={styles.confirmText}>{translate('Are you sure you want to log out?')}</Text>
        <View style={styles.buttonContainer}>
          <DynamicButton
            title="Logout"
            onPress={handleLogout}
          />
          <View style={styles.spacer} />
          <DynamicButton
            title="Cancel"
            onPress={handleBack}
            backgroundColor={colorConfig?.secondaryButtonColor || '#EEE'}
          />
          <View style={styles.bottomPadding} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    paddingHorizontal: wScale(20),
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: hScale(20),
  },
  close: {
    alignSelf: 'flex-end',
    padding: 5,
  },
  title: {
    fontSize: wScale(24),
    fontWeight: 'bold',
    color: '#333',
    marginBottom: hScale(10),
  },
  confirmText: {
    fontSize: 16,
    color: '#555',
    marginBottom: hScale(30),
  },
  buttonContainer: {
    width: "100%",
  },
  spacer: {
    height: hScale(15),
  },
  bottomPadding: {
    height: hScale(40),
  },
});

export default Logout;