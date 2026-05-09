import { translate } from "../../../utils/languageUtils/I18n";
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Clipboard, Alert } from 'react-native';

const QRScanner = () => {
  const [scan, setScan] = useState(true);
  const [upiDetails, setUpiDetails] = useState({
    upiId: '',
    upiName: '',
    amount: '',
    senderNumber: '',
    pin: '',
    address: '',
    city: '',
    postcode: '',
    latitude: '',
    longitude: ''
  });

  const onSuccess = (e) => {
    setScan(false);
    const data = e.data;
    Alert.alert('QR Code Scanned', data);
    setUpiDetails({
      ...upiDetails,
      upiId: data
    });
  };

  const handleTransfer = () => {
    if (upiDetails.pin === '') {
      Alert.alert('Error', 'Please enter PIN');
      return;
    }
    console.log('Transfer details:', upiDetails);
  };

  const copyToClipboard = (text) => {
    Clipboard.setString(text);
    Alert.alert('Copied to Clipboard', text);
  };

  return (
    <View style={styles.container}>
      {scan ? (
        <Text style={styles.centerText}>{translate("Scan_a_QR_Code")}</Text>
      ) : (
        <View style={styles.detailsContainer}>
          <Text style={styles.title}>Paying {upiDetails.upiName}</Text>
          <View style={styles.row}>
            <Text style={styles.label}>{translate("UPI_ID")}</Text>
            <TouchableOpacity onPress={() => copyToClipboard(upiDetails.upiId)}>
              <Text style={styles.value}>{upiDetails.upiId}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{translate("Amount")}</Text>
            <TextInput
              style={styles.input}
              keyboardType="number-pad"
              value={upiDetails.amount}
              onChangeText={(text) => setUpiDetails({ ...upiDetails, amount: text })}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sender Number:</Text>
            <TextInput
              style={styles.input}
              keyboardType="phone-pad"
              value={upiDetails.senderNumber}
              onChangeText={(text) => setUpiDetails({ ...upiDetails, senderNumber: text })}
            />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>PIN:</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={upiDetails.pin}
              onChangeText={(text) => setUpiDetails({ ...upiDetails, pin: text })}
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={handleTransfer}>
            <Text style={styles.buttonText}>Transfer</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  },
  centerText: {
    fontSize: 18,
    color: '#000'
  },
  buttonTouchable: {
    padding: 16
  },
  buttonText: {
    fontSize: 21,
    color: '#fff'
  },
  detailsContainer: {
    padding: 20,
    width: '100%'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  label: {
    fontSize: 16,
    color: '#333'
  },
  value: {
    fontSize: 16,
    color: '#000'
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    width: '60%'
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20
  },
});

export default QRScanner;
