import { translate } from "../../../utils/languageUtils/I18n";
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { useNavigation } from '@react-navigation/native';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { hScale } from '../../../utils/styles/dimensions';

const MAtmStatusCheck = () => {
  const [panName, setPanName] = useState('');
  const [panNum, setPanNum] = useState('');
  const [visible, setVisible] = useState(true);
  const navigation = useNavigation<any>();
  const { post } = useAxiosHook();

  useEffect(() => {
    if (visible) {
      showInitialAlert();
    }
  }, [visible]);

  const showInitialAlert = () => {
    Alert.alert(
      'Alert', 
      'Micro ATM Status Check initiated.', 
      [{ text: "Check Status", onPress: () => statusCheck() }]
    );
  };

  const statusCheck = async () => {
    try {
      const res = await post({ url: 'MICROATM/api/data/StatusCheck' });
      const { status, msg } = res;
console.log(res,'statusCheck')
      if (status === 'Success') {
        navigation.goBack();
      } else if (status === 'REFER_BACK') {
        setVisible(false);
        referBack()
      } else {

        Alert.alert(status, msg, [{ text: "OK", onPress: () => navigation.goBack() }]);
      }

    } catch (error) {
      if (error.response && error.response.status === 401) {
        await AsyncStorage.clear();
        // navigation.replace('Login');
      } else {
        console.error('Error fetching data', error);
      }
    }
  };

  const referBack = async () => {
    try {
      const res = await post({ url: 'MICROATM/api/data/FillRetailerInformation' });

      console.log('referBack',res)
      setPanName(res.remname);
      setPanNum(res.pancardname);
    } catch (error) {
      console.error('Error fetching data', error);
    }
  };

  const submitDetails = async () => {
    try {
      const res = await post({
        url: `MICROATM/api/data/UpdateRetailerDetailsnamepancard?remusrname=${panName}&rempanno=${panNum}`,
        data: {
          remusrname: panName,
          rempanno: panNum,
        },
      });
      const { status, msg } = res;


      console.log(res)
      Alert.alert(status, msg, [{ text: "OK", onPress: () => console.log("OK Pressed") }]);
    } catch (error) {
      console.error('Error submitting details', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <AppBarSecond title={'Micro ATM Status'} />

      {visible   ? (
        <View style={styles.statusContainer}>
          <Text style={styles.text}>{translate("Checking_Micro_ATM_Status")}</Text>
        </View>
      ) : (
        <View style={styles.formContainer}>
          <Text style={styles.text}>{translate("Update_PAN_Details")}</Text>
          <TextInput
            style={styles.input}
            value={panName}
            placeholder="Enter Name"
            placeholderTextColor="#aaa"
            onChangeText={setPanName}
          />
          <TextInput
            style={styles.input}
            value={panNum}
            placeholder="PAN Number"
            placeholderTextColor="#aaa"
            onChangeText={setPanNum}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={submitDetails}
            >
              <Text style={styles.buttonText}>{translate("Update")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    backgroundColor: '#f0f4f8',
  },
  statusContainer: {
    alignItems: 'center',
    marginVertical: 40,
  },
  text: {
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 20,
    color: '#4629c6', // Primary color
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  input: {
    borderColor: '#4629c6',
    borderWidth: 1,
    marginVertical: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9', // Light grey background for input
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 3,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#ff4757',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#ff4757',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  updateButton: {
    backgroundColor: '#4629c6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#4629c6',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  bottonStyle:{
    height:hScale(30),
    textAlign: 'center',
  }
});

export default MAtmStatusCheck;
