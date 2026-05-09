import { translate } from "../../utils/languageUtils/I18n";
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Camera, useCameraDevice, useCodeScanner } from 'react-native-vision-camera';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { openSettings } from 'react-native-permissions';
import { useIsFocused } from '@react-navigation/native';

const CameraScreen = ({ onQRCodeScan }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const isFocused = useIsFocused(); // Screen focus check karne ke liye
  const device = useCameraDevice('back'); // Rear camera select karne ke liye

  // 1. Permissions Check
  useEffect(() => {
    const checkPermission = async () => {
      const status = await Camera.requestCameraPermission();
      if (status === 'granted') {
        setHasPermission(true);
      } else {
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: 'Permission Required',
          textBody: 'Camera access is needed to scan QR codes.',
          button: 'Open Settings',
          onPressButton: () => {
            Dialog.hide();
            openSettings();
          },
        });
      }
    };
    checkPermission();
  }, []);

  // 2. Scanner Configuration
  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && codes[0].value) {
        // Aapka purana onSuccess logic yahan call hoga
        if (onQRCodeScan) {
          onQRCodeScan({ data: codes[0].value });
        }
      }
    },
  });

  // 3. UI States (Loading/No Permission)
  if (!hasPermission) return <View style={styles.center}><Text>{translate("No_Camera_Permission")}</Text></View>;
  if (!device) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused} // Sirf screen focus hone par camera chalega
        codeScanner={codeScanner}
        enableZoomGesture={true}
      />
      
      {/* Overlay UI (Scanner Frame) */}
      <View style={styles.overlay}>
        <View style={styles.unfocusedContainer}></View>
        <View style={styles.middleContainer}>
          <View style={styles.unfocusedContainer}></View>
          <View style={styles.focusedContainer}>
             {/* Ye blue corner lines draw karega */}
             <View style={styles.cornerTopLeft} />
             <View style={styles.cornerTopRight} />
             <View style={styles.cornerBottomLeft} />
             <View style={styles.cornerBottomRight} />
          </View>
          <View style={styles.unfocusedContainer}></View>
        </View>
        <View style={styles.unfocusedContainer}>
            <Text style={styles.hintText}>{translate("Scan_the_RadiantReliance_QR_Code")}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  unfocusedContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleContainer: {
    flexDirection: 'row',
    height: 260,
  },
  focusedContainer: {
    width: 260,
    height: 260,
    backgroundColor: 'transparent',
  },
  hintText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
  // Corner styling
  cornerTopLeft: { position: 'absolute', top: 0, left: 0, width: 40, height: 40, borderTopWidth: 5, borderLeftWidth: 5, borderColor: '#0A84FF' },
  cornerTopRight: { position: 'absolute', top: 0, right: 0, width: 40, height: 40, borderTopWidth: 5, borderRightWidth: 5, borderColor: '#0A84FF' },
  cornerBottomLeft: { position: 'absolute', bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 5, borderLeftWidth: 5, borderColor: '#0A84FF' },
  cornerBottomRight: { position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 5, borderRightWidth: 5, borderColor: '#0A84FF' },
});

export default CameraScreen;
