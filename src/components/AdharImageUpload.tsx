import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator, ToastAndroid, PermissionsAndroid } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { hScale, wScale } from '../utils/styles/dimensions';
import AppBarSecond from '../features/drawer/headerAppbar/AppBarSecond';
import { useSelector } from 'react-redux';
import { APP_URLS } from '../utils/network/urls';
import { useNavigation } from '../utils/navigation/NavigationService';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { check, openSettings, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { RootState } from '../reduxUtils/store';
import { translate } from '../utils/languageUtils/I18n';

const AadharCardUpload = ({ route }) => {
  const { id } = route.params;

  const [frontImage64, setFrontImage64] = useState(null);
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);
  const [backImage64, setBackImage64] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { userId, IsDealer,Loc_Data } = useSelector((state: RootState) => state.userInfo);
  const navigation = useNavigation();
  useEffect(() => {
    console.log(id)
  })

const handleImageSelect = async (side) => {
  // ✅ Camera permission pehle check karo
  const cameraStatus = await check(PERMISSIONS.ANDROID.CAMERA);
  
  if (cameraStatus === RESULTS.BLOCKED) {
    Alert.alert(
      'Permission Required',
      'Please allow camera access from settings',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => openSettings() },
      ]
    );
    return;
  }

  if (cameraStatus !== RESULTS.GRANTED) {
    const result = await request(PERMISSIONS.ANDROID.CAMERA);
    if (result !== RESULTS.GRANTED) return;
  }

  // ✅ Options
  const options = {
    selectionLimit: 1,
    mediaType: 'photo',
    includeBase64: true,
  };

  const cameraOptions = {
    ...options,
    cameraType: 'back',
    saveToPhotos: false,  // ✅ Yeh add karo
  };

  const handleResponse = (response) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorMessage);
    } else {
      const base64Image = response?.assets?.[0]?.base64;
      if (base64Image) {
        const source = { uri: `data:image/jpeg;base64,${base64Image}` };
        if (side === 'front') {
          setFrontImage(source);
          setFrontImage64(base64Image);
        } else {
          setBackImage(source);
          setBackImage64(base64Image);
        }
      } else {
        console.log('Base64 image data not available');
      }
    }
  };

  Alert.alert(
    'Select Image',
    'key_choosean_21',
    [
      {
        text: 'Camera',
        onPress: () => launchCamera(cameraOptions, handleResponse),
      },
      {
        text: 'Gallery',
        onPress: () => launchImageLibrary(options, handleResponse),
      },
    ]
  );
};
  const handleUpload = async () => {
    setIsUploading(true);
    uploadDoCxAdhar()
  };
  const showToast = (message) => {
    ToastAndroid.showWithGravity(message, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
  };
  const uploadDoCxAdhar = async () => {
    if (!frontImage64) {
      showToast('Please select front side of aadhar card')
      setIsUploading(false)
      return;
    } else if (!backImage64) {
      showToast('Please select back side of aadhar card');
      setIsUploading(false)
      return;
    }
    const data = {
      "AadharcardFront": frontImage64,
      "AadharcardBack": backImage64,
      "txtretailerid": userId,
      'currentrole': 'Retailer'
    };
    const data2 = {
      "AadharcardFront": frontImage64,
      "AadharcardBack": backImage64,
      "txtretailerid": id,
    };
    console.log(data);
    const body = JSON.stringify(IsDealer ? data2 : data);

    console.log(body);

    try {
      const response = await fetch(`https://${APP_URLS.baseWebUrl}/${IsDealer ? "api/user/UploadRetailerDocumentsByDealer" : 'api/user/UploadDocumentsImages'}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: body,
      });


      const responseData = await response.json();
      const Status = responseData.Message;
      console.log(responseData);
      if (responseData === 'Image Updated Successfully.') {
        Alert.alert(
          responseData,
          '',
          [
            {
              text: 'Go to Home',
              onPress: () => navigation.goBack(),
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          'Failed',
          responseData.Message,
          [
            {
              text: 'OK',
              style: 'cancel',
            },
          ],
          { cancelable: true }
        );
      }
      setIsUploading(false)
    } catch (error) {
      console.error(error);
    }
  };



  return (
    <View style={{ flexDirection: 'column', flex: 1 }}>
      <AppBarSecond title="Aadhar Card " onPressBack={() => { navigation.navigate('HomeScreen') }} />

      <View style={styles.container}>
        <Text style={styles.title}>{translate("Upload_Aadhar_Card")}</Text>

        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={() => handleImageSelect('front')} style={styles.imageBox}>
            {frontImage ? (
              <Image source={frontImage} style={styles.image} />
            ) : (
              <Text style={styles.imageText}>{translate("Upload_Front")}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleImageSelect('back')} style={styles.imageBox}>
            {backImage ? (
              <Image source={backImage} style={styles.image} />
            ) : (
              <Text style={styles.imageText}>{translate("Upload_Back")}</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.uploadButton} onPress={handleUpload} disabled={isUploading}>
          {isUploading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.uploadButtonText}>{translate("Upload_Aadhar_Card")}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: wScale(20),
  },
  title: {
    fontSize: hScale(24),
    fontWeight: 'bold',
    marginBottom: hScale(20),
    color: '#333',
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: hScale(30),
  },
  imageBox: {
    width: wScale(150),
    height: hScale(200),
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    margin: wScale(10),
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  imageText: {
    fontSize: hScale(14),
    color: '#888',
    textAlign: 'center',
  },
  uploadButton: {
    marginTop: hScale(30),
    paddingVertical: hScale(12),
    paddingHorizontal: wScale(30),
    backgroundColor: '#4CAF50',
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: hScale(18),
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default AadharCardUpload;
