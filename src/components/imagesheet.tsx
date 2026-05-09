import { translate } from "../utils/languageUtils/I18n";
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { wScale, hScale } from '../utils/styles/dimensions'; 

const ImageBottomSheet = ({ isVisible, imageUri, onClose }) => {
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        {/* Pressable backdrop to close when tapping outside the image area */}
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.container}>
          {/* Optional: Drag Handle for visual cue */}
          <View style={styles.dragHandle} />

          <Image
            source={{ uri: imageUri }}
            style={styles.image}
          />
          
          <TouchableOpacity onPress={onClose} style={styles.closeButton} activeOpacity={0.8}>
            <Text style={styles.closeButtonText}>{translate("Close")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end', // Aligns the "sheet" to the bottom
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Dims the background
  },
  container: {
    padding: wScale(15),
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: hScale(400),
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  dragHandle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
    marginBottom: hScale(10),
  },
  image: {
    width: '100%',
    height: '75%',
    resizeMode: 'contain',
  },
  closeButton: {
    marginTop: hScale(10),
    paddingHorizontal: wScale(20),
    paddingVertical: hScale(10),
    backgroundColor: '#007BFF',
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default ImageBottomSheet;
