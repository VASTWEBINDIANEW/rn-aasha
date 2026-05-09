import { translate } from "../../../utils/languageUtils/I18n";
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, PermissionsAndroid, ToastAndroid } from 'react-native';
import FlotingInput from '../../drawer/securityPages/FlotingInput';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import OnelineDropdownSvg from '../../drawer/svgimgcomponents/simpledropdown';
import { BottomSheet } from '@rneui/base';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import LottieView from 'lottie-react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { check, openSettings, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import ClosseModalSvg2 from '../../drawer/svgimgcomponents/ClosseModal2';
import ImageBottomSheet from '../../../components/ImageBottomSheet';
import DynamicButton from '../../drawer/button/DynamicButton';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import ShowLoader from '../../../components/ShowLoder';
import AadharTab from './AadharTab';
import { colors, FontFamily, FontSize } from '../../../utils/styles/theme';
import { ActivityIndicator } from 'react-native-paper';
import RNFS from 'react-native-fs';
import { Image } from 'react-native-compressor';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Radiantregister = ({ response }) => {
  const { colorConfig, userId } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}20`;
  const [panCard, setPanCard] = useState('');
  const [panCard64, setPanCard64] = useState<any>('');
  const [aadharCard, setAadharCard] = useState('');
  const [aadharCard64, setAadharCard64] = useState<any>(null);
  const [aadharCard642, setAadharCard642] = useState<any>(null);
  const [drivingLicense, setDrivingLicense] = useState('');
  const [drivingLicense64, setDrivingLicense64] = useState<any>(null);
  const [voterId, setVoterId] = useState('');
  const [voterId64, setVoterId64] = useState<any>(null);
  const [Policverification64, setPolicverification64] = useState<any>(null);
  const [check64, setCheck64] = useState<any>(null);
  const [doctype, setDoctype] = useState(false);
  const [isurl, setIsurl] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState('');
  const docment = ['Voter ID', 'Driving License', 'Passport', 'Ration Card'];
  const [isBottomSheetVisible, setIsBottomSheetVisible] = useState(false);
  const [imagePath, setImagePath] = useState<string>('');
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [aadharModal, setAadharModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [lastupload, setLastUpload] = useState('');
  const [info, setInfo] = useState<any[]>([]);
  const [isloading, setIsloading] = useState(false);

  const { Aadharcardstatus, Checkstatus, Pancardstatus, Policverificationstatus, VoterorDrivingstatus, sts }
    = response?.Content?.ADDINFO || {};
  const handleDocTypeSelect = (docType: string) => {
    setData({
      ...data,
      DocName: '',
      DrivinglicenceNumber: '',
      DrivinglicenceCopy: '',
      DocName: docType
    })
    setVoterId('')

    setVoterId64('')
    setDrivingLicense64('')
    setSelectedDocType(docType);
    setDoctype(false);
  };

  const { post, get } = useAxiosHook();



  useEffect(() => {
    const Retailrinfo = async () => {
      try {
        const res = await post({ url: APP_URLS.RadiantRetailrinfo });
        setInfo(res);
        setPanCard(res.PanCard);

        // Update the data directly without spreading previous data
        setData({
          Aadharcardnumber: res.AadharCard,
          DrivinglicenceNumber: res.DrivinglicenceNumber,
          Pancardnumber: res.PanCard,
          DocName: res.DocName
        });

        if (res.DrivinglicenceNumber) {
          setSelectedDocType(res.DocName);
        } else {
          setSelectedDocType('');
        }

        convertImagesToBase64AndSetState(res);
        console.log(res, 'RadiantRetailrinfooo');
      } catch (error) {
        console.error('Error occurred while fetching retail info:', error);
      }
    };

    Retailrinfo();
  }, []);

  const convertImagesToBase64AndSetState = async (data1) => {
    setIsloading(true);
    try {
      const convertUrlsToBase64 = async (urls) => {
        if (Array.isArray(urls)) {
          const base64List = await Promise.all(urls.map(url => url ? convertImageToBase64(url) : null));
          return base64List.filter(base64 => base64 !== null); // Remove any null values
        } else if (typeof urls === 'string' && urls) {
          const base64 = await convertImageToBase64(urls);
          return [base64];
        } else {
          return [];
        }
      };

      const [
        aadharFrontBase64List,
        aadharBackBase64List,
        panCardBase64List,
        voterIdBase64List,
        checkCopyBase64List,
        policeVerificationBase64List,
        DrivinglicenceCopy
      ] = await Promise.all([
        convertUrlsToBase64(data1.Aadharfront),
        convertUrlsToBase64(data1.Aadharback),
        convertUrlsToBase64(data1.Pancardpath),
        convertUrlsToBase64(data1.VoterIdcopy),
        convertUrlsToBase64(data1.CheckCopy),
        convertUrlsToBase64(data1.Policverificationcopy),
        convertUrlsToBase64(data1.DrivinglicenceCopy)
      ]);

      const newData = {};

      if (aadharFrontBase64List[0]) newData.AadharcardFrontcopy = aadharFrontBase64List[0];
      if (aadharBackBase64List[0]) newData.AadharcardBackcopy = aadharBackBase64List[0];
      if (panCardBase64List[0]) newData.Pancardcopy = panCardBase64List[0];
      if (DrivinglicenceCopy[0]) newData.DrivinglicenceCopy = DrivinglicenceCopy[0];
      if (policeVerificationBase64List[0]) newData.Policverificationcopy = policeVerificationBase64List[0];
      if (checkCopyBase64List[0]) newData.CheckCopy = checkCopyBase64List[0];

      setData(prevData => ({
        ...prevData,
        ...newData
      }));

      setIsloading(false);
    } catch (error) {
      console.error('Error converting images to base64 and setting state:', error);
      setIsloading(false);
    }
  };



  const requestCameraPermission = useCallback(async () => {

    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: "Camera Permission",
          message: "This app needs access to your camera to take photos.",
          buttonPositive: "OK",
        }
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        // Permission granted
      } else {
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: "Permission Required",
          textBody: "key_pleasegra_85",
          button: "OK",
          onPressButton: () => {
            Dialog.hide();
            openSettings().catch(() => console.warn("cannot open settings"));
          },
        });
      }
    } catch (err) {
      console.warn(err);
    }
  }, []);
  const convertImageToBase64 = async (imageUrl) => {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to load image');
      }

      const imageBlob = await response.blob();
      const reader = new FileReader();

      return new Promise((resolve, reject) => {
        reader.onloadend = () => {
          const base64String = reader.result;
          resolve(base64String);
        };

        reader.onerror = reject;

        reader.readAsDataURL(imageBlob);
      });
    } catch (error) {
      console.error('Error converting image to base64:', error);
      return null; // Or you can reject here based on your preference
    }
  };
  useEffect(() => {
    requestCameraPermission();
  }, []);



  const [data, setData] = useState({
    Pancardnumber: '',
    Aadharcardnumber: '',
    DrivinglicenceNumber: '',
    Pancardcopy: '',
    AadharcardFrontcopy: '',
    AadharcardBackcopy: '',
    DrivinglicenceCopy: '',
    Policverificationcopy: '',
    CheckCopy: '',
    DocName: ''
  });

  const uploadDoCx = async () => {
    setIsloading(true);

    const showToast = (message) => {
      ToastAndroid.showWithGravity(
        message,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
    };

    const validateInputs = () => {
      if (!userId) {
        showToast("User ID is required.");
        return false;
      }

      if (!data.Pancardnumber) {
        showToast("Please enter a valid PAN Card number.");
        return false;
      }

      if (!data.Pancardcopy) {
        showToast("Please select a valid PAN Card Image.");
        return false;
      }

      if (!data.Aadharcardnumber || !/^\d{12}$/.test(data.Aadharcardnumber)) {
        showToast("Please enter a valid Aadhar Card number.");
        return false;
      }

      if (!data.AadharcardFrontcopy) {
        showToast("key_pleasesel_79");
        return false;
      }

      if (!data.AadharcardBackcopy) {
        showToast("key_pleasesel_77");
        return false;
      }

      if (!data.DrivinglicenceNumber && !voterId) {
        showToast("Voter ID or Driving License is required.");
        return false;
      }

      if (!data.DrivinglicenceCopy && !voterId64) {
        showToast("key_pleasesel_81");
        return false;
      }

      if (!data.Policverificationcopy) {
        showToast("key_pleasesel_80");
        return false;
      }

      if (!data.CheckCopy) {
        showToast("key_pleasesel_78");
        return false;
      }

      return true;
    };

    if (!validateInputs()) {
      setIsloading(false);
      return;
    }

    try {


      const res = await post({
        url: 'api/Radiant/UploaddocRadiant',
        data: data,
      });

      console.log('Upload Response:', res);

      setIsloading(false);
      // {"Content": {"ADDINFO": {"sts": true}, 
      // "ResponseCode": 1}, "StatusCode": 
      // 200, "Version": "1.0"}
      if (res?.StatusCode == 200) {
        if (res?.Content?.ADDINFO?.sts) {
          Dialog.show({
            type: ALERT_TYPE.SUCCESS,
            title: "Successfully",
            textBody: "Document uploaded successfully.",
            button: "OK",
            onPressButton: () => {
              Dialog.hide();
              navigation.navigate('DashboardScreen');
            },
          });
        } else {
          showErrorDialog("key_documentu_32");
        }
      } else {
        showErrorDialog(res?.Content?.ADDINFO?.Message || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
      setIsloading(false);
      showErrorDialog("key_anerroro_11");
    }
  };



  const showErrorDialog = (message) => {
    Dialog.show({
      type: ALERT_TYPE.DANGER,
      title: "Failed",
      textBody: message,
      button: "OK",
      onPressButton: () => {
        Dialog.hide();
      },
    });
  };



  const saveData = async (key, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      console.log('Data saved successfully');
    } catch (e) {
      // saving error
      console.error('Failed to save the data to the storage', e);
    }
  };

const handleImageSelect = async (side: string) => {
  console.log(side);
  setLastUpload(side);
  setIsBottomSheetVisible(false);

  const options = {
    selectionLimit: 1,
    mediaType: 'photo',
  };

  const cameraOptions = {
    ...options,
    cameraType: 'back',
    quality: 0.3,
    saveToPhotos: false,  // ✅ Add kiya
  };

  const handleResponse = async (response: any) => {
    if (response.didCancel) {
      console.log('User cancelled image picker');
      return;
    } else if (response.errorCode) {
      console.log('Error: ', response.errorCode);
      return;
    }

    try {
      const imageUri = response?.assets[0]?.uri;
      if (!imageUri) {
        console.log('Image URI is missing!');
        return;
      }

      const compressedImage = await Image.compress(imageUri, {
        quality: 0.5,
        maxWidth: 1000,
        maxHeight: 1000,
      });

      const base64String = await RNFS.readFile(compressedImage, 'base64');
      const source = `data:image/jpeg;base64,${base64String}`;
      setImagePath(source);

      console.log(`Image size after compression: ${(base64String.length / 1024).toFixed(2)} KB`);

      switch (side) {
        case 'AF':
          setData({ ...data, AadharcardFrontcopy: `data:image/jpeg;base64,${base64String}` });
          setAadharModal(true);
          break;
        case 'AB':
          setData({ ...data, AadharcardBackcopy: `data:image/jpeg;base64,${base64String}` });
          setAadharModal(true);
          break;
        case 'DL':
          setDrivingLicense64(base64String);
          setData({ ...data, DrivinglicenceCopy: `data:image/jpeg;base64,${base64String}` });
          setImageModalVisible(true);
          break;
        case 'VID':
          setVoterId64(base64String);
          setImageModalVisible(true);
          break;
        case 'POV':
          setPolicverification64(base64String);
          setData({ ...data, Policverificationcopy: `data:image/jpeg;base64,${base64String}` });
          setImageModalVisible(true);
          break;
        case 'PC':
          setPanCard64(base64String);
          setData({ ...data, Pancardcopy: `data:image/jpeg;base64,${base64String}` });
          setImageModalVisible(true);
          break;
        case 'CH':
          setCheck64(base64String);
          setData({ ...data, CheckCopy: `data:image/jpeg;base64,${base64String}` });
          setImageModalVisible(true);
          break;
        default:
          console.log('Unknown side:', side);
      }
    } catch (error) {
      console.error('Error during image processing: ', error);
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
    'key_choosean_21',
    [
      { text: 'Cancel' },
      { text: 'Camera', onPress: checkAndLaunchCamera },                        // ✅
      { text: 'Gallery', onPress: () => launchImageLibrary(options, handleResponse) },
    ]
  );
};

  const navigation = useNavigation<any>();

return (
  <View style={styles.main}>
    <AppBarSecond title={'Upload Document'} />

    <KeyboardAwareScrollView
      enableOnAndroid={true}
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      style={styles.container}
    >
      {/* DOC TYPE SELECTION */}
      <View style={styles.inputGroup}>
        <TouchableOpacity onPress={() => setDoctype(true)} activeOpacity={0.8}>
          <View pointerEvents="none">
            <FlotingInput
              value={selectedDocType}
              label={'Select Doc Type'}
              editable={false}
            />
          </View>
          <View style={styles.righticon2}>
            <OnelineDropdownSvg />
          </View>
        </TouchableOpacity>
      </View>

      {/* PAN CARD SECTION */}
      <View style={styles.inputGroup}>
        <FlotingInput
          value={data.Pancardnumber}
          onChangeTextCallback={(t) => {
            setData({ ...data, Pancardnumber: t });
          }}
          label="Enter Pan Card Number"
          keyboardType="default"
          editable={!Pancardstatus}
        />
        <TouchableOpacity
          style={styles.righticon2}
          onPress={async () => {
            if (data.Pancardcopy) {
              setIsurl(!Pancardstatus);
              setImagePath(data.Pancardcopy);
              setImageModalVisible(true);
              setLastUpload('PC');
            } else {
              handleImageSelect('PC');
            }
          }}
        >
          <LottieView
            autoPlay
            loop
            style={styles.lotiimg}
            source={
              data.Pancardcopy
                ? require('../../../utils/lottieIcons/View-Docs.json')
                : require('../../../utils/lottieIcons/upload-file.json')
            }
          />
        </TouchableOpacity>
      </View>

      {isloading ? <ShowLoader /> : null}

      {/* AADHAR CARD SECTION */}
      <View style={styles.inputGroup}>
        <FlotingInput
          value={data.Aadharcardnumber}
          onChangeTextCallback={(t) => {
            setData({ ...data, Aadharcardnumber: t });
          }}
          label="Enter Aadhar Card Number"
          keyboardType="number-pad"
          editable={!Aadharcardstatus}
        />
        <TouchableOpacity
          style={styles.righticon2}
          onPress={() => setIsBottomSheetVisible(true)}
        >
          <LottieView
            autoPlay
            loop
            style={styles.lotiimg}
            source={
              data.AadharcardBackcopy && data.AadharcardFrontcopy
                ? require('../../../utils/lottieIcons/View-Docs.json')
                : require('../../../utils/lottieIcons/upload-file.json')
            }
          />
        </TouchableOpacity>
      </View>

      {/* CONDITIONAL DOC TYPE SECTION (DL/VOTER) */}
      {selectedDocType && (
        <View style={styles.inputGroup}>
          <FlotingInput
            value={data.DrivinglicenceNumber}
            onChangeTextCallback={(t) => {
              setData({ ...data, DrivinglicenceNumber: t });
            }}
            label={selectedDocType}
            keyboardType="default"
            editable={!VoterorDrivingstatus}
          />
          <TouchableOpacity
            style={styles.righticon2}
            onPress={() => {
              if (data.DrivinglicenceCopy) {
                setIsurl(!VoterorDrivingstatus);
                setDrivingLicense64(data.DrivinglicenceCopy);
                setImagePath(data.DrivinglicenceCopy);
                setImageModalVisible(true);
                setLastUpload('DL');
              } else {
                handleImageSelect('DL');
              }
            }}
          >
            <LottieView
              autoPlay
              loop
              style={styles.lotiimg}
              source={
                data.DrivinglicenceCopy
                  ? require('../../../utils/lottieIcons/View-Docs.json')
                  : require('../../../utils/lottieIcons/upload-file.json')
              }
            />
          </TouchableOpacity>
        </View>
      )}

      {/* POLICE VERIFICATION SECTION */}
      <View style={styles.inputGroup}>
        <FlotingInput
          label="Police Verification"
          editable={false}
          value={data.Policverificationcopy ? "File Selected" : ""}
        />
        <TouchableOpacity
          style={styles.righticon2}
          onPress={() => {
            if (data.Policverificationcopy) {
              setIsurl(!Policverificationstatus);
              setPolicverification64(data.Policverificationcopy);
              setImagePath(data.Policverificationcopy);
              setImageModalVisible(true);
              setLastUpload('POV');
            } else {
              handleImageSelect('POV');
            }
          }}
        >
          <LottieView
            autoPlay
            loop
            style={styles.lotiimg}
            source={
              data.Policverificationcopy
                ? require('../../../utils/lottieIcons/View-Docs.json')
                : require('../../../utils/lottieIcons/upload-file.json')
            }
          />
        </TouchableOpacity>
      </View>

      {/* SECURITY CHEQUE SECTION */}
      <View style={styles.inputGroup}>
        <FlotingInput
          label="Security Cheque"
          editable={false}
          value={data.CheckCopy ? "File Selected" : ""}
        />
        <TouchableOpacity
          style={styles.righticon2}
          onPress={() => {
            if (data.CheckCopy) {
              setIsurl(!Checkstatus);
              setCheck64(data.CheckCopy);
              setImagePath(data.CheckCopy);
              setImageModalVisible(true);
              setLastUpload('CH');
            } else {
              handleImageSelect('CH');
            }
          }}
        >
          <LottieView
            autoPlay
            loop
            style={styles.lotiimg}
            source={
              data.CheckCopy
                ? require('../../../utils/lottieIcons/View-Docs.json')
                : require('../../../utils/lottieIcons/upload-file.json')
            }
          />
        </TouchableOpacity>
      </View>

      <View style={{ marginVertical: 20 }}>
        <DynamicButton 
          title="Submit" 
          onPress={() => uploadDoCx()} 
        />
      </View>

      {/* Extra space to ensure the last input isn't hidden by the keyboard */}
      <View style={{ height: 50 }} />
    </KeyboardAwareScrollView>

    {/* MODALS & BOTTOMSHEETS (Keep outside ScrollView) */}
    <BottomSheet
      animationType="none"
      isVisible={doctype}
      onBackdropPress={() => setDoctype(false)}
    >
      <View style={styles.bottomSheetContainer}>
        {docment.map((docType, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleDocTypeSelect(docType)}
            style={[
              styles.bottomSheetOption,
              {
                backgroundColor: color1,
                borderBottomColor: colorConfig.primaryColor,
              },
            ]}
          >
            <Text style={styles.bottomSheetText}>{docType}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </BottomSheet>

    <BottomSheet
      animationType="none"
      isVisible={isBottomSheetVisible}
      onBackdropPress={() => setIsBottomSheetVisible(false)}
      containerStyle={{
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
      }}
    >
      <View style={styles.bottomSheetContent}>
        <View style={[styles.header, { backgroundColor: color1 }]}>
          <Text style={styles.headerText}>{translate("Select_Image")}</Text>
          <TouchableOpacity onPress={() => setIsBottomSheetVisible(false)}>
            <ClosseModalSvg2 size={40} />
          </TouchableOpacity>
        </View>
        <View style={styles.inerview}>
          <Text style={styles.descriptionText}>{translate("Choose_a_front_image_from_Aadhar_or_back_image_from_Aadhar_photo")}</Text>
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.frontButton,
                { backgroundColor: colorConfig.primaryButtonColor },
              ]}
              onPress={() => {
                if (data.AadharcardFrontcopy) {
                  setIsurl(!Aadharcardstatus);
                  setAadharCard64(data.AadharcardFrontcopy);
                  setImagePath(data.AadharcardFrontcopy);
                  setAadharModal(true);
                  setLastUpload('AF');
                } else {
                  handleImageSelect('AF');
                }
              }}
            >
              <Text style={[styles.buttonText, { color: colorConfig.labelColor }]}>
                {data.AadharcardFrontcopy ? "View Front Aadhar Image" : 'Front Aadhar Image'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.backButton,
                { backgroundColor: colorConfig.secondaryButtonColor },
              ]}
              onPress={() => {
                if (data.AadharcardBackcopy) {
                  setIsurl(!Aadharcardstatus);
                  setAadharCard642(data.AadharcardBackcopy);
                  setImagePath(data.AadharcardBackcopy);
                  setAadharModal(true);
                  setLastUpload('AB');
                } else {
                  handleImageSelect('AB');
                }
              }}
            >
              <Text style={[styles.buttonText, { color: colorConfig.labelColor }]}>
                {data.AadharcardBackcopy ? "View Back Aadhar Image" : 'Back Image'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </BottomSheet>

    <ImageBottomSheet
      isUri={isurl}
      imagePath={imagePath}
      setModalVisible={setImageModalVisible}
      isModalVisible={isImageModalVisible}
      modalTitle={'Your Image'}
      setImagePath={setImagePath}
      ReUpload={() => handleImageSelect(lastupload)}
    />

    <AadharTab
      isUri={isurl}
      imagePath={aadharCard64}
      imagePath2={aadharCard642}
      isModalVisible={aadharModal}
      setModalVisible={setAadharModal}
      modalTitle="Aadhaar Images"
      setImagePath={setImagePath}
      ReUpload={() => handleImageSelect(lastupload)}
    />
  </View>
);
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fff'
  },
  container: {
    flex: 1,
    padding: wScale(10),
  },
  inerview: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: wScale(5),
    paddingBottom: hScale(10)
  },
  inputGroup: {
  },

  righticon2: {
    position: "absolute",
    left: "auto",
    right: wScale(0),
    top: hScale(0),
    height: "85%",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: wScale(12),
  },
  bottomSheetContainer: {
    padding: hScale(10),
    backgroundColor: '#fff'
  },
  bottomSheetOption: {
    padding: hScale(12),
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  bottomSheetText: {
    fontSize: wScale(16),
    color: '#000',
  },
  lotiimg: {
    height: hScale(44),
    width: wScale(44),
  },


  openButtonText: {
    fontSize: wScale(18),
    color: '#007BFF',
    fontWeight: 'bold',
  },

  bottomSheetContent: {
    borderRadius: 5,
    alignSelf: 'center',
    justifyContent: 'center',
    elevation: 5,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wScale(15),
    paddingVertical: hScale(4),
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  headerText: {
    fontSize: wScale(20),
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center'
  },
  descriptionText: {
    fontSize: wScale(16),
    color: '#000',
    marginVertical: hScale(20),
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    paddingVertical: hScale(12),
    paddingHorizontal: wScale(5),
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frontButton: {
    backgroundColor: '#4CAF50',
    marginRight: wScale(10),
  },
  backButton: {
    backgroundColor: '#FF5722',
    marginLeft: wScale(10),
  },
  buttonText: {
    fontSize: wScale(14),
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Radiantregister;
