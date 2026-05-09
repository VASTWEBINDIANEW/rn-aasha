import { translate } from "../../../utils/languageUtils/I18n";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, Modal } from 'react-native';
import React, { useState } from 'react';

const PinVerificationModal = ({ isVisible, onClose, onSuccess }) => {
  const [enteredPin, setEnteredPin] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const storedPin = "1234"; // Example stored PIN for demo

  const handleVerifyPin = () => {
    if (enteredPin === '') {
      setErrorMessage('PIN is required');
      return;
    }

    if (enteredPin === storedPin) {
      setErrorMessage('');
      onSuccess('ok'); // Trigger the success callback passed from parent
      onClose(); // Close the modal
    } else {
      setErrorMessage('Incorrect PIN. Please try again.');
    }
  };

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeading}>{translate("Enter_PIN")}</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter PIN"
            value={enteredPin}
            onChangeText={setEnteredPin}
            keyboardType="number-pad"
            secureTextEntry={true}
            maxLength={6}
          />
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          <TouchableOpacity style={styles.submitButton} onPress={handleVerifyPin}>
            <Text style={styles.submitButtonText}>{translate("Verify")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>{translate("Cancel")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Styles
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: 'center',
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    fontSize: 16,
    marginBottom: 10,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default PinVerificationModal;
