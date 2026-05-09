import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { hScale, wScale } from '../utils/styles/dimensions';
import Success from '../features/drawer/svgimgcomponents/Success';
import Successful from '../features/drawer/svgimgcomponents/successfulimg';
import { translate } from '../utils/languageUtils/I18n';

const CmsSuccessModal = ({ visible, onClose, message, title = "Submit Successful 🎉" }) => {
  return (
    <Modal transparent visible={visible} animationType="fade" >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Successful/>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>
            {message || "Your report has been uploaded successfully."}
          </Text>
          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.buttonText}>{translate("Continue")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: wScale(20),
    paddingVertical: hScale(20),
    paddingHorizontal: wScale(25),
    alignItems: 'center',
    elevation: 10,
  },
  icon: {
    width: wScale(70),
    height: hScale(70),
    marginBottom: hScale(15),
  },
  title: {
    fontSize: wScale(22),
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: hScale(10),
    textAlign: 'center',
  },
  message: {
    fontSize: wScale(16),
    textAlign: 'center',
    color: '#555',
    marginBottom: hScale(20),
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingVertical: hScale(12),
    paddingHorizontal: wScale(30),
    borderRadius: wScale(10),
  },
  buttonText: {
    color: '#fff',
    fontSize: wScale(16),
    fontWeight: '600',
  },
});

export default CmsSuccessModal;
