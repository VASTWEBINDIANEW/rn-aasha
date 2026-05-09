import { translate } from "../../../utils/languageUtils/I18n";
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import useAxiosHookey from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import AppBar from '../../drawer/headerAppbar/AppBar';
import DynamicButton from '../../drawer/button/DynamicButton';
import useAxiosHook from '../../../utils/network/AxiosClient';

const Registerform = () => {
  const [name, setName] = useState("");
  const [firmname, setFirmname] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [dob, setDob] = useState("");
  const [pan, setPan] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [pin, setPin] = useState("");
  const [address, setAddress] = useState("");
  const [indicator, setIndicator] = useState(false);
  const { get, post } = useAxiosHook();

  const pancardforminformation = async () => {
    try {
      const response = await get({ url: `${APP_URLS.panCardInfo}` });
      const data = response['Message'];

      if (!response.ok) {
        // handle error
      }

      setName(data['Name']);
      setFirmname(data['firmName']);
      setEmail(data['Email']);
      setMobile(data['Mobile']);
      const sdob = data["dob"];
      setDob(sdob.substring(0, 10));
      setPan(data['PAN']);
      setAadhar(data['Aadhar']);
      setPin(data['Address']);
      setAddress(data['PIN']);
    } catch (error) {
      // handle error
    }
  };

  const Registerpancard = async () => {
    try {
      const response = await get({ url: `${APP_URLS.panCardRegistration}txtpanname=${name}&txtfirmnmpan=${firmname}&txtemailpan=${email}&panphone=${mobile}&dobpan=${dob}&panpancard=${pan}&aadharpan=${aadhar}&txtaddresspan=${address}&pinpan=${pin}` })

      if (!response.OK) {
        // handle error
      }

      if (response['Response'] === "Success") {
        Alert.alert(
          response['Response'],
          response['Message'],
          [{ text: "OK", onPress: () => { } }],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          response['Response'],
          response['Message'],
          [{ text: "OK", onPress: () => { } }],
          { cancelable: false }
        );
      }

      setIndicator(false);
    } catch (error) {
      // handle error
      setIndicator(false);
    }
  };

  useEffect(() => {
    pancardforminformation();
  }, []);

  return (
    <View style={styles.main}>
      <AppBar title={'PANCARD REGISTER FORM'} />
      <ScrollView>
        <View style={styles.container}>
          <View style={styles.textContainer}>
            <Text style={styles.label}>{translate("Name")}</Text>
            <Text style={styles.text}>{name}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.label}>{translate("Firm_Name")}</Text>
            <Text style={styles.text}>{firmname}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.label}>{translate("Email")}</Text>
            <Text style={styles.text}>{email}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.label}>{translate("Mobile")}</Text>
            <Text style={styles.text}>{mobile}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.label}>{translate("DOB")}</Text>
            <Text style={styles.text}>{dob}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.label}>{translate("PAN")}</Text>
            <Text style={styles.text}>{pan}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.label}>{translate("Aadhar")}</Text>
            <Text style={styles.text}>{aadhar}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.label}>{translate("Address")}</Text>
            <Text style={styles.text}>{address}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.label}>{translate("PIN")}</Text>
            <Text style={styles.text}>{pin}</Text>
          </View>

          {indicator ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            <DynamicButton
              title="Register"
              onPress={() => {
                setIndicator(true);
                Registerpancard();
              }}
              disabled={indicator}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  container: {
    paddingHorizontal: wScale(20),
    paddingVertical: hScale(20),
    backgroundColor: '#fff',
    margin: wScale(20),
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  textContainer: {
    marginBottom: hScale(15),
  },
  label: {
    color: '#333',
    fontSize: wScale(18),
    fontWeight: 'bold',
  },
  text: {
    color: '#666',
    fontSize: wScale(16),
    marginTop: hScale(5),
    padding: hScale(10),
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
  },
});

export default Registerform;
