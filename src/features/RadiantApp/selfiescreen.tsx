import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  Linking,
  ScrollView,
  ActivityIndicator,
  Animated,
  ToastAndroid,
} from 'react-native';
import {
  launchCamera,
  CameraOptions,
  ImagePickerResponse,
} from 'react-native-image-picker';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { useSelector } from 'react-redux';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useLocationHook } from '../../hooks/useLocationHook';
import useAxiosHook from '../../utils/network/AxiosClient';
import { RootState } from '../../reduxUtils/store';
import { APP_URLS } from '../../utils/network/urls';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import GradientBorder from '../../components/AnimatedBorderView';
import { hScale, SCREEN_HEIGHT, SCREEN_WIDTH, wScale } from '../../utils/styles/dimensions';
import ShareGoback from '../../components/ShareGoback';
import MovingDotBorderText from '../../components/AnimatedBorderView';
import ShowLoader from '../../components/ShowLoder';
import DynamicButton from '../drawer/button/DynamicButton';
import { translate } from '../../utils/languageUtils/I18n';


const { width } = Dimensions.get('window');

const SelfieScreen: React.FC = () => {
  const { post } = useAxiosHook()
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const { isLocationPermissionGranted, getLocation, checkLocationPermissionStatus, getLatLongValue } = useLocationHook();

  const [base64Img, setBase64Img] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [finalImageUri, setFinalImageUri] = useState<string | null>(null);
  const [addressData, setAddressData] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<boolean>(false);
  const viewShotRef = useRef<ViewShot>(null);

  const { Loc_Data } = useSelector((state: any) => state.userInfo || {});
  const latitude = Loc_Data['latitude'] || '0';
  const longitude = Loc_Data['longitude'] || '0';
  const navigation = useNavigation();
  const [id, setId] = useState('')
  /* ---------------- Permission ---------------- */
  const handleCameraPermission = async () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.CAMERA
        : PERMISSIONS.ANDROID.CAMERA;

    const status = await check(permission);

    if (status === RESULTS.GRANTED) {
      openCamera();
    } else if (status === RESULTS.DENIED) {
      const result = await request(permission);
      if (result === RESULTS.GRANTED) openCamera();
    } else {
      Alert.alert('Permission Blocked', 'Please Allow Camera permission', [
        { text: 'Cancel' },
        { text: 'Settings', onPress: Linking.openSettings },
      ]);
    }
  };
  const init = async () => {
    try {
      const res1 = await post({ url: APP_URLS.RCEID });
      console.log('INIT API RESPONSE 👉', res1);

      if (res1) {
        const data = res1?.Content?.ADDINFO;
        setId(data?.CEID);
        console.log(data?.CEID, 'CEID');
      }

      const allowed = await checkLocationPermission();
      if (!allowed) {
        setLoading(false);
        return;
      }

      if (latitude === '0' || longitude === '0') {
        getLocation();
        setLoading(false);
        return;
      }

      fetchAddress(latitude, longitude);
    } catch (e) {
      console.log('INIT ERROR ❌', e);
    }
  };

  useEffect(() => {

    init();
  }, []);
  const checkLocationPermission = async () => {
    const permission =
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;

    const status = await check(permission);

    if (status === RESULTS.GRANTED) return true;

    if (status === RESULTS.DENIED) {
      const result = await request(permission);
      return result === RESULTS.GRANTED;
    }

    Alert.alert(
      'Location Permission',
      'key_pleaseena_66',
      [
        { text: 'Cancel' },
        { text: 'Open Settings', onPress: Linking.openSettings },
      ],
    );
    return false;
  };
  /* ---------------- Open Camera ---------------- */
  const openCamera = () => {
    if (!latitude || !longitude || latitude === '0' || longitude === '0') {
      Alert.alert(
        'Location Info',
        'key_unableto_107',
      );
      return;
    }
    const options: CameraOptions = {
      mediaType: 'photo',
      includeBase64: true,
      cameraType: 'front',
      quality: 0.8,
    };

    launchCamera(options, async (res: ImagePickerResponse) => {
      if (res.didCancel) return;

      if (res.errorCode) {
        Alert.alert('Camera Error', res.errorMessage || '');
        return;
      }

      const asset = res.assets?.[0];
      if (!asset?.base64) return;

      setBase64Img(asset.base64);
      fetchAddress(latitude, longitude);
    });
  };

  /* ---------------- Fetch Address ---------------- */
  const fetchAddress = async (lat: string, lon: string) => {
    setAddressError(false);

    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 8000); // ⏱ timeout safety

      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        {
          headers: {
            'User-Agent': 'GPSCamera-App/1.0',
          },
          signal: controller.signal,
        },
      );

      if (!res.ok) {
        throw new Error(`API Error: ${res.status}`);
      }

      const data = await res.json();
      console.log(data);
      if (data?.display_name) {
        let add = '';
        //const displayAddress = `${add.road || ''} ${add.}`

        add = formatAddress(data.address)
        setAddressData(add);
      } else {
        setAddressData(null);
        setAddressError(true);
      }
    } catch (err) {
      console.log('Address API failed:', err);
      setAddressData(null);
      setAddressError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (addressError) {
      // Alert.alert(
      //   'Location Info',
      //   'key_addressno_6',
      // );
    }
  }, [addressError]);


  const handleSubmit = async () => {
    setLoading(true);

    try {
      const uri = await viewShotRef.current?.capture({
        format: 'jpg',
        quality: 0.6,
        result: 'tmpfile',
      });

      setFinalImageUri(uri);

      // 🔍 API ko jaane wala data
      const requestData = {
        RCEID: id,
        base64image: base64Img,
        latitude: latitude,
        longitude: longitude,
      };

      console.log('API REQUEST DATA 👉', requestData);

      const res = await post({
        url: 'api/Radiant/RCESubmitImage',
        data: requestData,
      });

      console.log('API RESPONSE 👉', res);

      if (
        res?.StatusCode === 200 &&
        res?.Content?.ResponseCode === 1 &&
        res?.Content?.ADDINFO?.status === true
      ) {
        ToastAndroid.showWithGravity(
          'Image uploaded successfully.',
          ToastAndroid.LONG,
          ToastAndroid.CENTER
        );
        init()
        navigation.navigate('ImgPendingcms')
      } else {
        Alert.alert(
          'Failed',
          res?.Content?.ADDINFO?.message || 'Upload failed'
        );
      }

    } catch (error) {
      console.log('API ERROR ❌', error);
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };


  /* ---------------- Share ---------------- */
  const handleShare = async () => {
    if (!finalImageUri) return;
    try {
      await Share.open({
        title: 'GPS Photo',
        url: finalImageUri,
        message: `GPS Photo\nLatitude: ${latitude}\nLongitude: ${longitude}`,
      });
    } catch { }
  };
  const formatAddress = (address: any): string => {
    if (!address) return '';

    const parts = [
      address.road,
      address.county || address.suburb,
      address.state_district,
      address.state,
      address.postcode,
      address.country,
    ];

    return parts.filter(Boolean).join(', ');
  };






  return (
    <View style={styles.main}>
      <AppBarSecond title={'Selfie with Store'} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.container}>
          <View style={styles.headerText}>
            <MovingDotBorderText title={'key_pleaseupl_62'} />
          </View>

          <ViewShot ref={viewShotRef}>
            <View style={styles.captureContainer}>
              <View
                style={[
                  styles.cameraFrame,
                  base64Img ? styles.activeBorder : styles.inactiveBorder,
                ]}
              >
                {base64Img ? (
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${base64Img}` }}
                    style={styles.capturedImage}
                  />
                ) : (
                  <TouchableOpacity style={styles.placeholder} onPress={handleCameraPermission}>
                    <Text style={{ fontSize: 50 }}>📸</Text>
                    <Text>{translate("No Photo")}</Text>
                  </TouchableOpacity>
                )}

                {base64Img && (
                  <View style={styles.gpsOverlay}>
                    {addressData ? (
                      <Text style={styles.overlayAddress} numberOfLines={2}>
                        📍 {addressData}
                      </Text>
                    ) : (
                      <Text style={styles.overlayAddress}>
                        📍 {translate("Location unavailable")}
                      </Text>
                    )}

                    <Text style={styles.overlayCoords}>
                      Lat: {latitude} | Lng: {longitude}
                    </Text>

                    <Text style={styles.overlayDate}>
                      {new Date().toLocaleString()}
                    </Text>
                  </View>

                )}
              </View>
            </View>
          </ViewShot>
          {addressError && (
            <Text style={{ fontSize: 11, color: '#D63031', marginTop: 4 }}>
             { translate("Address not available, showing GPS only")}
            </Text>
          )}
          {/* LAT LONG SCREEN DISPLAY */}


          {loading && <ShowLoader />}



          {base64Img ? (
            <ShareGoback onGoBack={handleCameraPermission} submit={handleSubmit}
              goBackIcon={'camera-reverse'} goBackTitle='Retake' />

          ) :
            <View style={styles.footer}>
              <ShareGoback onCamera={handleCameraPermission} />
            </View>}





        </View>
      </ScrollView>

    </View>
  );
};

export default SelfieScreen;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#F8F9FA' },
  container: { flex: 1, paddingHorizontal: wScale(10) },

  headerRow: {
    marginTop: hScale(20),
    paddingHorizontal: wScale(20),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: { fontSize: wScale(24), fontWeight: 'bold', color: '#2D3436' },
  subtitle: { fontSize: wScale(14), color: '#636E72' },

  scrollContent: { paddingVertical: hScale(0) },

  captureContainer: {
    backgroundColor: '#FFF',
    padding: wScale(12),
    borderRadius: wScale(5),
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: wScale(10),
    shadowOffset: { width: 0, height: hScale(4) },
    elevation: 6,
    marginBottom: hScale(30)
  },

  cameraFrame: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_HEIGHT * 0.6,
    borderRadius: wScale(5),
    overflow: 'hidden',
    backgroundColor: '#F1F3F5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  activeBorder: { borderColor: '#34C759' },
  inactiveBorder: { borderColor: '#007AFF', borderStyle: 'dashed' },

  capturedImage: { width: '100%', height: '100%' },

  placeholder: { alignItems: 'center' },

  gpsOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingVertical: hScale(8),
    paddingHorizontal: wScale(12),
    backgroundColor: 'rgba(0,0,0,0.65)',
  },

  overlayAddress: {
    color: '#FFF',
    fontSize: wScale(12),
    fontWeight: '600',
    lineHeight: hScale(16),
  },
  overlayCoords: {
    color: '#E0E0E0',
    fontSize: wScale(10),
    marginTop: hScale(2),
  },
  overlayDate: {
    color: '#BDBDBD',
    fontSize: wScale(9),
    marginTop: hScale(2),
  },

  latLongBox: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    padding: wScale(14),
    borderRadius: wScale(16),
    marginTop: hScale(18),
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: wScale(8),
    shadowOffset: { width: 0, height: hScale(3) },
    elevation: 4,
  },

  latLongText: {
    fontSize: wScale(13),
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: hScale(4),
  },

  footer: {

    alignSelf: 'center'
  },

  btn: {
    height: hScale(55),
    borderRadius: wScale(110),
    justifyContent: 'center',
    alignItems: 'center',
  },

  primaryBtn: {
    backgroundColor: '#0066FF',
  },

  successBtn: {
    backgroundColor: '#2ECC71',
  },
  btnText: {
    color: '#FFF',
    fontSize: wScale(16),
    fontWeight: '700',
    letterSpacing: wScale(0.5),
  },
  headerText: {
    marginVertical: hScale(15),
  },
});
