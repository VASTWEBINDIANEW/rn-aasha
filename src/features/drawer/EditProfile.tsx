import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ScrollView, Alert, Modal, TouchableOpacity, Image, ToastAndroid, } from 'react-native';
import useAxiosHook from '../../utils/network/AxiosClient';
import { APP_URLS } from '../../utils/network/urls';
import FlotingInput from './securityPages/FlotingInput';
import { hpScale, hScale, SCREEN_HEIGHT, wScale } from '../../utils/styles/dimensions';
import AppBarSecond from './headerAppbar/AppBarSecond';
import { useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import { colors } from '../../utils/styles/theme';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { BottomSheet } from '@rneui/base';
import { FlashList } from '@shopify/flash-list';
import { stateData } from '../../utils/stateData';
import ShowLoader from '../../components/ShowLoder';
import { onReceiveNotification2 } from '../../utils/NotificationService';
import { useNavigation } from '../../utils/navigation/NavigationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { check, PERMISSIONS, RESULTS, openSettings, request } from 'react-native-permissions';

const EditProfile = ({ route }) => {
  const { profileData } = route.params;
  const { post } = useAxiosHook();
  const { userId, colorConfig } = useSelector((state: RootState) => state.userInfo);
  const role = 'Retailer';

  console.log(profileData.PINCode)
  const initialFormData = {
    name: profileData.Name,
    firmName: profileData.firmName,
    Join_Date: new Date(profileData.JoinDate).toISOString().split('T')[0],

    mobile: profileData.Mobile,
    email: profileData.Email,
    businessType: profileData.BusinessType,
    Aadhar: profileData.Aadhar,
    BusinessTypeCode: profileData.BusinessTypeCode,
    PAN: profileData.PAN,
    gst: profileData.GST,
    address: profileData.Address,
    state: profileData.State,
    district: profileData.District,
    cityName: profileData.Cityname,
    pinCode: profileData.PINCode,
    image: profileData.imageUrl,
    dob: profileData.dob

  };

  const [formData, setFormData] = useState(initialFormData);
  const [modalVisible, setModalVisible] = useState(false);
  const [stateVisible, setStateVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showDistrictList, setShowDistrictList] = useState(false);
  const [showStateList, setShowStateList] = useState(false);
  const [stateId, setStateId] = useState(0);
  const [DistrictId, setDistrictId] = useState(0);
const navigation = useNavigation()
  const [image, setImage] = useState(profileData?.Photo);

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };
  const getStateIdByName = (stateName) => {
    const state = stateData.find(item => item.stateName.toLowerCase() === stateName.toLowerCase());
    return state ? state.stateId : null;
  };
  const getDistIdByName = (districtName) => {
    const sanitizedDistName = districtName.trim().toLowerCase();
    const district = districtData.find(item =>
      item['Dist Name'].trim().toLowerCase() === sanitizedDistName
    );
    console.log(district['Dist Id'],'Dist Id')
    return district ? district['Dist Id'] : null;
  };

  const [isload, setIsload] = useState(false)
const handleSubmit = async () => {
  try {
    // Step 1: Clean form data (remove "Please Enter", trim spaces)
    const cleanedFormData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        key,
        value && value !== 'Please Enter' ? String(value).trim() : '',
      ])
    );

    console.log('Cleaned Form Data:', cleanedFormData);

    // Step 2: Validation rules
    const requiredFields = [
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'mobile', label: 'Mobile' },
    ];

    // Find missing fields
    const missingFields = requiredFields
      .filter(field => !cleanedFormData[field.key])
      .map(field => field.label);

    if (missingFields.length > 0) {
      Alert.alert(
        'Validation Error',
        `Please fill the required fields: ${missingFields.join(', ')}`
      );
      return;
    }

    // Mobile number format validation
    if (!/^\d{10}$/.test(cleanedFormData.mobile)) {
      Alert.alert('Validation Error', 'Mobile number must be exactly 10 digits.');
      return;
    }

    // Step 3: Prepare API payload
    const data = {
      Name: cleanedFormData.name,
      firmName: cleanedFormData.firmName,
      Mobile: cleanedFormData.mobile ? `+91${cleanedFormData.mobile}` : '',
      PINCode: cleanedFormData.pinCode,
      Email: cleanedFormData.email,
      Address: cleanedFormData.address,
      District: getDistIdByName(stateDist || cleanedFormData.district) ?? '',
      State: getStateIdByName(state || cleanedFormData.state) ?? '',
      Aadhar: cleanedFormData.Aadhar,
      PAN: cleanedFormData.PAN,
      GST: cleanedFormData.gst,
      dob: cleanedFormData.dob,
      BusinessType: cleanedFormData.businessType,
      BusinessTypeCode: cleanedFormData.BusinessTypeCode,
      Password: '123456',
      PIN: '1234',
      JoinDate: profileData.joinDate3 ?? '',
      Cityname: cleanedFormData.cityName,
    };

    console.log('Prepared Data:', data);

    setIsload(true);
    const response = await post({ url: APP_URLS.updateProfile, data });

    if (response) {
      const notification = {
        notification: {
          title: 'Update Profile',
          body: response.Message,
        },
      };
      onReceiveNotification2(notification);

      if (response.Response === 'Success') {

        Alert.alert(
          '',
          response.Message,
          [
            {
              text: 'Go Back',
              onPress: async () =>{       
                 await AsyncStorage.setItem('Profile_status', 'updated');
          navigation.navigate('Profile');

},
            },
          ]
        );
      } else {
        Alert.alert('Error', response.Message || 'An error occurred');
      }
    } else {
      Alert.alert('Error', 'No response from server. Please try again.');
    }
  } catch (error) {
    console.error('Error occurred:', error);
    Alert.alert('Error', 'Something went wrong. Please try again later.');
  } finally {
    setIsload(false); // Always stop loader
  }
};



  const handleItemClick = (type, base64Img) => {
    let data = {};

    switch (type) {
      case 'Profile image':
        data = {
          ProfileImagess: base64Img,
          txtretailerid: userId,
          currentrole: role,
        };
        break;

      default:
        data = null;
        break;
    }

    return data;
  };
  useEffect(() => {

    const id = getStateIdByName(state || formData.state)
    getDistricts({ id });
  }, [formData.state])
  const uploadDoCx = useCallback(
    async (typ, bs64) => {
      setModalVisible(false);
      setIsload(true);
      console.log(userId)
      try {
        const url = `https://www.${APP_URLS.baseWebUrl}api/user/UploadUserImages`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            ProfileImagess: bs64,
            txtretailerid: userId,
            currentrole: role,
          }),
        });

        if (!response.ok) {
          setIsload(false);
          throw new Error(`Failed to upload. Status: ${response.status}`);
        }

        const responseData = await response.json();

        ToastAndroid.show(responseData, ToastAndroid.SHORT);

        setIsload(false);
      } catch (error) {
        setIsload(false);
        console.error('Upload Error:', error);
        Alert.alert('Error', `Failed to upload ${typ} Image: ${error.message}`);
      }
    },
    [userId, role, APP_URLS.baseWebUrl] // dependencies
  );


const handleImageSelect = async () => {
  const options = {
    selectionLimit: 1,
    mediaType: 'photo',
    includeBase64: true,
  };

  const cameraOptions = {
    ...options,
    saveToPhotos: false,  // ✅ Add kiya
  };

  const handleResponse = (response) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
    } else if (response.errorCode) {
      console.log('ImagePicker Error: ', response.errorMessage);
    } else {
      const base64Image = response?.assets?.[0]?.base64;
      if (base64Image) {
        const source = { uri: `${base64Image}` };
        setImage(null);
        setSelectedImage(base64Image);
      } else {
        console.log('Base64 image data not available');
      }
    }
  };

  // ✅ Camera permission check
  const checkAndLaunchCamera = async () => {
    const status = await check(PERMISSIONS.ANDROID.CAMERA);

    if (status === RESULTS.BLOCKED) {
      Alert.alert(
        'Permission Required',
        'Please allow camera access from settings',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => openSettings().catch(() => {}) },
        ]
      );
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
    'Choose an image from gallery or take a new photo',
    [
      { text: 'Camera', onPress: checkAndLaunchCamera },                        // ✅
      { text: 'Gallery', onPress: () => launchImageLibrary(options, handleResponse) },
    ]
  );
};
  const [districtData, setDistrictData] = useState([]);
  const [state, setState] = useState(profileData?.State || '')
  const [stateDist, setStateDist] = useState(profileData?.District || '')

  const { get } = useAxiosHook()
  const getDistricts = useCallback(
    async ({ id }) => {
      const response = await get({ url: `${APP_URLS.getDistricts}${id}` });

      setDistrictData(response);
    },
    [get],
  );
  const showBottomSheetList = () => {
    return (
      <FlashList
        style={{ marginBottom: wScale(50), marginHorizontal: wScale(24) }}
        data={showStateList ? stateData : districtData}
        renderItem={({ item }) => {
          return (
            <View
              style={{ marginVertical: wScale(8), marginHorizontal: wScale(24) }}>
              <TouchableOpacity
                onPress={async () => {
                  if (showStateList) {
                    setShowDistrictList(true)
                    setShowStateList(false)
                    setStateId(item.stateId);
                    setState(item.stateName)
                    // setAddressState(item.stateName);
                    //   setDistrict('');
                    await getDistricts({ id: item.stateId });
                  } else {
                    setShowDistrictList(false);
                    setStateDist(item['Dist Name'])
                    getDistIdByName(item['Dist Name'])
                  }
                }}>
                <Text
                  style={{
                    color: '#ff4670',
                    fontSize: 18,
                  }}>
                  {showStateList ? item.stateName : item['Dist Name']}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
        estimatedItemSize={30}
      />
    );
  };
  return (
    <View style={styles.screen}>
      <AppBarSecond title={'Edit Profile'} />
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <View style={[styles.imageContainer, {
          backgroundColor: colorConfig.secondaryColor,
        }]}>
          {image ? <Image
            source={{
              uri: image
                ? `http://${APP_URLS.baseWebUrl}` + image
                : `data:image/jpeg;base64,` + selectedImage,
            }}
            style={styles.profileImage}
          /> : <Image
            source={require('../drawer/assets/bussiness-man.png')} // local image path
            style={styles.profileImage}
          />}

          {!image && <Text style={{color:'white'}}>Profile Picture Not Found - click for upload new</Text>}
        </View>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={[styles.modalContainer, { backgroundColor: `${colorConfig.secondaryColor}/20` }]}>
             {image ? <Image
            source={{
              uri: image
                ? `http://${APP_URLS.baseWebUrl}` + image
                : `data:image/jpeg;base64,` + selectedImage,
            }}
            style={styles.profileImage}
          /> : <Image
          // ../drawer/assets/bussiness-man.png
            source={require('../drawer/assets/bussiness-man.png')} // local image path
            style={styles.largeImage}
          />}

          <View style={styles.modalButtons}>
            <Button title="Edit" onPress={() => handleImageSelect()} />
            <Button title="Save" onPress={() => uploadDoCx('Profile image', selectedImage)} />
            <Button title="Cancel" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* Form Fields */}
      <ScrollView contentContainerStyle={styles.formContainer}>
        {Object.keys(formData)
          .filter((key) => key !== 'state' && key !== 'district' && key !== 'image' && key !== 'BusinessTypeCode') // Filter out state and district
          .map((key) => (
            <View key={key} style={styles.inputContainer}>
              <FlotingInput
                label={key.replace(/([A-Z])/g, ' $1').toUpperCase()}
                autoFocus={true}
                editable={true}
                value={formData[key]}
                onChangeTextCallback={(text) => handleInputChange(key, text)}
                inputstyle={styles.input}
                labelinputstyle={styles.labelInput}
                keyboardType={key === 'mobile' || key === 'pinCode' ? 'numeric' : 'default'}
              />
            </View>
          ))}


        <TouchableOpacity onPress={() => {
          setShowStateList(true)
        }}>
          <FlotingInput value={state} label={('state').toUpperCase()} editable={false} />
        </TouchableOpacity>



        <TouchableOpacity onPress={() => {
          setShowStateList(false)
          setShowStateList(true)
        }}>
          <FlotingInput value={stateDist}

            label={('District').toUpperCase()}


            editable={false} />

        </TouchableOpacity>

        <Button title="Submit" onPress={handleSubmit} color="#007bff" />

        <BottomSheet
          isVisible={showStateList || showDistrictList}
          onBackdropPress={() => {
            setShowStateList(false);
            setShowDistrictList(false);
          }}
          scrollViewProps={{ scrollEnabled: false }}
          containerStyle={{ backgroundColor: 'transparent' }}>
          <View
            style={{
              backgroundColor: colors.white,
              height: SCREEN_HEIGHT / 1.5,
              flex: 1,
              marginBottom: wScale(40),
            }}>
            <View style={styles.StateTitle}>
              <Text style={styles.stateTitletext}>
                {showStateList ? 'select state' : 'select District'}
              </Text>
            </View>

            {showBottomSheetList()}
          </View>
        </BottomSheet>


        {isload && <ShowLoader />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  StateTitle: {
    paddingVertical: 10,
    backgroundColor: '#ff4670',
    paddingTop: 15,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stateTitletext: {
    paddingHorizontal: 11,
    fontSize: 20,
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  imageContainer: {
    alignItems: 'center',
    marginTop: hpScale(0),
  },
  profileImage: {
    width: wScale(120),
    height: wScale(120),
    borderRadius: 60,
    borderWidth: 3,
    borderColor: colors.primary,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.alice_blue,
  },
  largeImage: {
    width: hpScale(30),
    height: hpScale(30),
    borderRadius: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginTop: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: hScale(10),
  },
  inputContainer: {
    marginBottom: -10,
  },
  input: {
    backgroundColor: '#F1F1F1',
    borderRadius: 5,
    padding: 10,
    marginVertical: 5,
  },
  labelInput: {
    fontSize: 12,
    color: '#333',
  },
});

export default EditProfile;