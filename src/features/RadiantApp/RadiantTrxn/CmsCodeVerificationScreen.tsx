import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { hScale } from '../../../utils/styles/dimensions';

const CmsFinalOtpVerification = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isChecked, setIsChecked] = useState(false);

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <TouchableOpacity>
          {/* <Ionicons name="arrow-back" size={24} color="#fff" /> */}
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cms Code Verification</Text>
      </View>

      <Image source={require('../../assets/checklist.png')} style={styles.image} />

      <Text style={styles.title}>Verification Required</Text>
      <Text style={styles.description}>
        Please match the number of <Text style={styles.highlight}>Notes</Text> and the <Text style={styles.highlight}>total amount</Text>. If everything is okay, complete the transaction by entering the OTP. <Text style={styles.success}>The OTP has been sent to the store contact person</Text> with the details of the total amount.
      </Text>

      <View style={styles.infoRow}>
        <Text>ReQ No. VW1457842514521</Text>
        <Text>Pickup Time: 10-08-2025 10:42 AM</Text>
      </View>

      <View style={styles.table}>
        {[...Array(6)].map((_, rowIndex) => (
          <View style={styles.tableRow} key={rowIndex}>
            <View style={styles.tableCell} /><View style={styles.tableCell} /><View style={styles.tableCell} />
          </View>
        ))}
      </View>

      <View style={styles.checkboxRow}>
        {/* <CheckBox value={isChecked} onValueChange={setIsChecked} /> */}
        <Text style={styles.checkboxText}>
          Yes, I have checked all the details and also got it verified from store contact person that the information is completely correct and I will take further action.
        </Text>
      </View>

      <TouchableOpacity style={styles.sendOtpBtn}>
        <Text style={styles.sendOtpText}>Send OTP to Customer Point</Text>
      </TouchableOpacity>

      <View style={styles.otpRow}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            value={digit}
            onChangeText={(value) => handleOtpChange(value, index)}
            keyboardType="numeric"
            maxLength={1}
            style={styles.otpInput}
          />
        ))}
      </View>
      <Text style={styles.resendText}>If OTP is not received, Resend OTP</Text>

      <TouchableOpacity style={styles.submitBtn}>
        <Text style={styles.submitText}>Submit OTP</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fdfcff',
    paddingHorizontal: 16,
    paddingBottom:hScale(10)
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8e2de2',
    padding: 12,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  image: {
    height: 100,
    width: 100,
    alignSelf: 'center',
    marginVertical: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
    marginVertical: 8,
  },
  highlight: {
    color: 'orange',
    fontWeight: 'bold',
  },
  success: {
    color: 'green',
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    marginBottom: 4,
  },
  table: {
    borderWidth: 1,
    borderColor: '#000',
    marginVertical: 12,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    borderWidth: 1,
    borderColor: '#000',
    height: 40,
    flex: 1,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginVertical: 10,
  },
  checkboxText: {
    fontSize: 12,
    color: '#333',
    flex: 1,
  },
  sendOtpBtn: {
    backgroundColor: '#2ecc71',
    padding: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginVertical: 12,
  },
  sendOtpText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  otpInput: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderColor: '#000',
    textAlign: 'center',
    fontSize: 18,
  },
  resendText: {
    textAlign: 'right',
    fontSize: 12,
    color: '#555',
  },
  submitBtn: {
    backgroundColor: '#000',
    padding: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 16,
  },
  submitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default CmsFinalOtpVerification;
