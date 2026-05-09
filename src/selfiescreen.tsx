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
import { RootState } from './reduxUtils/store';
import { APP_URLS } from './utils/network/urls';
import useAxiosHook from './utils/network/AxiosClient';
import { useLocationHook } from './hooks/useLocationHook';
import { useNavigation } from './utils/navigation/NavigationService';

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
  useEffect(() => {
    const init = async () => {
      setLoading(true);
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
    };

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
      'Please enable location permission from settings',
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
        'Unable to fetch GPS location. Please enable location.',
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
    setLoading(true);
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
      //   'Address not found. GPS coordinates will be used.',
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

      const res = await post({
        url: 'api/Radiant/RCESubmitImage',
        data: {
          RCEID: 'RCE218',
          base64image: base64Img,
          latitude: latitude,
          longitude: longitude,
        },
      });

      console.log('API RESPONSE 👉', res);

      if (
        res?.StatusCode === 200 &&
        res?.Content?.ResponseCode === 1 &&
        res?.Content?.ADDINFO?.status === true
      ) {
     Alert.alert(
  'Success',
  res?.Content?.ADDINFO?.message ||
    'Image uploaded successfully. Our team will review it shortly.',
  [
    {
      text: 'OK',
      onPress: () => navigation.goBack(), // ✅ Alert ke baad back
    },
  ],
);

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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      {/* HEADER */}
      <View style={styles.headerRow}>

        {finalImageUri && (
          <TouchableOpacity onPress={handleShare}>
            <Icon name="share-social-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
                <View style={styles.placeholder}>
                  <Text style={{ fontSize: 50 }}>📸</Text>
                  <Text>No Photo</Text>
                </View>
              )}

              {base64Img && (
                <View style={styles.gpsOverlay}>
                  {addressData ? (
                    <Text style={styles.overlayAddress} numberOfLines={2}>
                      📍 {addressData}
                    </Text>
                  ) : (
                    <Text style={styles.overlayAddress}>
                      📍 Location unavailable
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
            Address not available, showing GPS only
          </Text>
        )}
        {/* LAT LONG SCREEN DISPLAY */}


        {loading && <ActivityIndicator size="large" color={colorConfig.secondaryButtonColor} />}
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colorConfig.primaryColor }]}
          onPress={handleCameraPermission}
        >
          <Text style={styles.btnText}>
            {base64Img ? 'Retake Photo' : 'Take GPS Photo'}
          </Text>
        </TouchableOpacity>

        {base64Img && (
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: colorConfig.secondaryColor }]}
            onPress={handleSubmit}
          >
            <Text style={styles.btnText}>Submit & Generate</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default SelfieScreen;

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  headerRow: {
    marginTop: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: { fontSize: 24, fontWeight: 'bold', color: '#2D3436' },
  subtitle: { fontSize: 14, color: '#636E72' },

  scrollContent: { alignItems: 'center', paddingVertical: 20 },

  captureContainer: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 22,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },

  cameraFrame: {
    width: width * 0.85,
    height: width * 1.05,
    borderRadius: 18,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0,0,0,0.65)',
  },

  overlayAddress: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  overlayCoords: {
    color: '#E0E0E0',
    fontSize: 10,
    marginTop: 2,
  },
  overlayDate: {
    color: '#BDBDBD',
    fontSize: 9,
    marginTop: 2,
  },

  latLongBox: {
    width: width * 0.85,
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 16,
    marginTop: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },

  latLongText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
  },

  footer: { padding: 20, gap: 10 },

  btn: {
    height: 55,
    borderRadius: 0,
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
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
