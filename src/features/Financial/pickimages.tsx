import React, { useState, useEffect } from 'react';
import { View, Button, Image, PermissionsAndroid, Platform } from 'react-native';
import ImagePicker from 'react-native-image-picker';

const ImageUpload = () => {
  const [image, setImage] = useState(null);

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.CAMERA,
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        ]);
        if (
          granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
        ) {
          console.log('Permissions granted');
        } else {
          console.log('All required permissions not granted');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  // const pickImage = () => {
  //   ImagePicker.showImagePicker({ mediaType: 'photo' }, (response) => {
  //     if (response.didCancel) {
  //       console.log('User cancelled image picker');
  //     } else if (response.error) {
  //       console.log('ImagePicker Error: ', response.error);
  //     } else {
  //       const source = { uri: response.uri };
  //       setImage(source);
  //     }
  //   });
  // };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Button title="Pick an image from camera roll" onPress={pickImage} />
      {image && <Image source={image} style={{ width: 200, height: 200 }} />}
    </View>
  );
};

export default ImageUpload;
