import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Image, Alert, ToastAndroid, Modal } from 'react-native';
import { launchImageLibrary, launchCamera } from 'react-native-image-picker';
import { APP_URLS } from '../../../utils/network/urls';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import ShowLoader from '../../../components/ShowLoder';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import { check, PERMISSIONS, RESULTS, openSettings, request } from 'react-native-permissions';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';

const DealerDocsRetailer = ({ route }) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const { get, post } = useAxiosHook()
  const { item } = route.params;
  const [documentImages, setDocumentImages] = useState('');
  const [documentPaths, setDocumentPaths] = useState([
    { id: '5', title: 'Aadhar Card Front', key: 'aadharcardPath', path: item.aadharcardPath, base64: null },

    { id: '4', title: 'Aadhar Card Back', key: 'aadharcardBacksidePath', path: item.aadharcardBacksidePath, base64: null },
    { id: '7', title: 'Registration Certificate', key: 'chkRegistractioncertificatepath', path: item.chkRegistractioncertificatepath, base64: null },
    { id: '8', title: 'Shop Selfie', key: 'chkShopwithSalfie', path: item.ShopwithSalfie, base64: null },
    { id: '11', title: 'Pan Card', key: 'chkpanpath', path: item.pancardPath, base64: null },
    { id: '14', title: 'Service Agreement', key: 'serviceagreementpath', path: item.serviceagreementpath, base64: null },
    { id: '15', title: 'Video KYC', key: 'videokycpath', path: item.videokycpath, base64: null },
  ]);

  // const documentPaths = [
  //   { id: '4', title: 'Aadhar Card Backside', key: 'aadharcardBacksidePath', path: item.aadharcardBacksidePath },
  //   { id: '5', title: 'Aadhar Card Front', key: 'aadharcardPath', path: item.aadharcardPath },
  //   { id: '6', title: 'Address Proof', key: 'chkAddressProofpath', path: item.chkAddressProofpath },
  //   { id: '7', title: 'Registration Certificate', key: 'chkRegistractioncertificatepath', path: item.chkRegistractioncertificatepath },
  //   { id: '8', title: 'Shop with Selfie', key: 'chkShopwithSalfie', path: item.chkShopwithSalfie },
  //   { id: '11', title: 'PAN Card', key: 'chkpanpath', path: item.pancardPath },
  //   { id: '14', title: 'Service Agreement', key: 'serviceagreementpath', path: item.serviceagreementpath },
  //   { id: '15', title: 'Video KYC', key: 'videokycpath', path: item.videokycpath },
  // ];
  useEffect(() => {


    console.log('Updated documentPaths:', item);
  }, [documentPaths]);


  const navigation = useNavigation();

const handleImageSelect = useCallback(
  async (side) => {
    if (side === 'Aadhar Card Back' || side === 'Aadhar Card Front') {
      navigation.navigate('AadharCardUpload', { id: item.UserID });
      return;
    }

    if (side === 'Video KYC') {
      const CNTNT = {
        hindi: `मैं ${item.Name} फर्म का नाम ${item.firmName}...`,
        Eng: `I, ${item.Name}, representing the firm ${item.firmName}...`,
      };
      navigation.navigate('VideoKYC', { CNTNT });
      return;
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
      saveToPhotos: false,  // ✅ Add kiya
    };

    const handleResponse = (response) => {
      if (response.didCancel) {
        Alert.alert('Image selection cancelled.');
      } else if (response.errorCode) {
        Alert.alert('ImagePicker Error: ', response.errorMessage);
      } else {
        setIsLoading(true);
        const base64Image = response.assets?.[0]?.base64;
        if (base64Image) {
          uploadDoCx(side, base64Image);
          setDocumentPaths((prev) =>
            prev.map((doc) =>
              doc.title === side
                ? { ...doc, base64: `data:image/jpeg;base64,${base64Image}` }
                : doc
            )
          );
        } else {
          Alert.alert('Base64 image data not available');
        }
      }
    };

    // ✅ Camera permission check
    const checkAndLaunchCamera = async () => {
      const status = await check(PERMISSIONS.ANDROID.CAMERA);

      if (status === RESULTS.BLOCKED) {
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: 'Permission Required',
          textBody: 'Please allow camera access from settings',
          button: 'Open Settings',
          onPressButton: () => {
            Dialog.hide();
            openSettings().catch(() => {});
          },
        });
        return;
      }

      if (status !== RESULTS.GRANTED) {
        const result = await request(PERMISSIONS.ANDROID.CAMERA);
        if (result !== RESULTS.GRANTED) return;
      }

      launchCamera(cameraOptions, handleResponse);
    };

    Alert.alert(
      'Select Image',
      'key_choosean_21',
      [
        { text: 'Cancel', onPress: () => {} },
        { text: 'Camera', onPress: checkAndLaunchCamera },           // ✅
        { text: 'Gallery', onPress: () => launchImageLibrary(options, handleResponse) },
      ]
    );
  },
  [item, navigation, setIsLoading, setDocumentPaths, uploadDoCx]
);


  
  // const uploadDoCx = async (typ, bs64) => {
  //   console.log(typ)

  //   //setImageModalVisible(false)
  //   try {
  //     const data = handleItemClick(typ, bs64);
  //     const body = JSON.stringify(data);
  //     console.log(body, 'BODY****', typ)
  //     const endpoint = `api/user/UploadDocumentsImage`


  //     const url = `http://${APP_URLS.baseWebUrl}${endpoint}`;
  //     console.log(url)
  //     const response = await fetch(url, {
  //       method: 'POST',
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Accept": "application/json",
  //       },
  //       body: body,
  //     });
  //     if (!response.ok) {
  //       throw new Error(`Failed to upload. Status: ${response.status}`);
  //     }

  //     const responseData = await response.json();

  //     if (responseData === 'Image Updated Successfully.') {
  //       ToastAndroid.show(responseData, ToastAndroid.SHORT);
  //     } else {
  //       ToastAndroid.show(responseData, ToastAndroid.SHORT);
  //     }
  //   } catch (error) {
  //     console.error('Upload Error:', error);
  //     Alert.alert('Error', `Failed to upload ${typ} Image: ${error.message}`);
  //   }
  // };
  const [isLoading, setIsLoading] = useState(false);


  const uploadDoCx = useCallback(
    async (type, base64Image) => {
      console.log(type, base64Image.length);

      try {
        setIsLoading(true);

        const payload = handleItemClick(type, base64Image);
        const endpoint =
          type === 'Profile image'
            ? 'api/user/UploadUserImages'
            : 'api/user/UploadDocumentsImages';

        const url = `https://${APP_URLS.baseWebUrl}${endpoint}`;
        console.log(`[Uploading to]: ${url}`);

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const responseText = await response.text();

        let responseData;
        try {
          responseData = JSON.parse(responseText);
        } catch (e) {
          responseData = responseText;
        }

        console.log(`[Upload Response]:`, responseData);

        if (response.ok) {
          const successMessage =
            typeof responseData === 'string'
              ? responseData
              : responseData || 'Upload successful';

          ToastAndroid.show(successMessage, ToastAndroid.SHORT);
        } else {
          const errorMessage =
            typeof responseData === 'string'
              ? responseData
              : responseData?.error ||
              `Upload failed with status ${response.status}`;

          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error('[Upload Error]:', error);
        Alert.alert('Upload Error', `Failed to upload ${type}: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    },
    [setIsLoading, handleItemClick, APP_URLS.baseWebUrl]
  );


  const handleItemClick = (type, base64Img) => {
    console.log(type, base64Img.length);

    const baseData = {
      "txtretailerid": item.UserID,
      'currentrole': "Retailer"
    };

    switch (type) {
      case 'Aadhar Card':
        return {
          ...baseData,
          "AadharcardFront": base64Img,
          "AadharcardBack": base64Img,
        };
      case 'Pan Card':
        return {
          ...baseData,
          "PancardFront": base64Img,
        };
      case 'Registration Certificate':
        return {
          ...baseData,
          "Registrationcertificatepath": base64Img,
        };
      case 'Shop Selfie':
        return {
          ...baseData,
          "ShopeWithSelfie": base64Img,
        };
      case 'Service Agreement':
        return {
          ...baseData,
          "Serviceaggreementpath": base64Img,
        };
      case 'Profile image':
      case 'Registratidon Certificate':
        return {
          ...baseData,
          "ProfileImagess": base64Img,
        };
      default:
        return null;
    }
  };

  const handleResponse = (response, key) => {
    if (response.didCancel) {
      Alert.alert('Image selection cancelled.');
    } else if (response.error) {
      Alert.alert('ImagePicker Error: ', response.error);
    } else {
      // setDocumentImages((prev) => ({
      //   ...prev,
      //   [key]: response.assets[0].uri,
      // }));
    }
  };
  const [modalVisible, setModalVisible] = useState(false);

  const renderItem = ({ item }) => {
    const imagePath = item.path;


    return (
      <TouchableOpacity style={styles.itemContainer} onPress={() => {
        setModalVisible(true)

        handleImageSelect(item.title)
      }}>
        {imagePath || item.base64 ? (
          <Image
            source={{
              uri: item.base64
                ? `${item.base64}`
                : `http://${APP_URLS.baseWebUrl}${imagePath}`,
            }}
            style={styles.image}
          />
        ) : (
          <View style={styles.uploadContainer}>
            <Text style={styles.uploadText}>Upload {item.title}</Text>
          </View>
        )}
        <Text style={styles.itemText}>{item.title}</Text>
      </TouchableOpacity>
    );
  };




  return (
    <View style={{ backgroundColor: 'green', flex: 1 }}>
      <View style={styles.container}>
        <AppBarSecond title={'Upload Retailer Docs'} />
        <Text style={styles.uploadText}>{item.firmName.toUpperCase()}</Text>
        <FlatList
          data={documentPaths}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      </View>

      {isLoading && <ShowLoader />}
    </View>
  );
};

export default DealerDocsRetailer;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0,
    backgroundColor: '#eaeaea',
  },
  row: {
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  itemContainer: {
    flex: 1,
    margin: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  image: {
    width: 180,
    height: 130,
    marginBottom: 10,
    borderRadius: 10,
  },
  uploadContainer: {
    borderWidth: 2,
    borderColor: '#007bff',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
  },
  uploadText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  itemText: {
    marginTop: 5,
    fontWeight: 'bold',
    color: '#333',
  },
});
