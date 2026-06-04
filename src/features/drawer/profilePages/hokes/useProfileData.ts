import { useState, useCallback, useEffect, useRef } from 'react';
import { Alert, ToastAndroid } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../../../../reduxUtils/store';
import useAxiosHook from '../../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../../utils/network/urls';
import { decryptData } from '../../../../utils/encryptionUtils';
import { useCameraCapture } from '../../../../hooks/useCameraCapture';

export interface ProfileData {
  Name?: string;
  firmName?: string;
  JoinDate?: string;
  Mobile?: string;
  Email?: string;
  BusinessType?: string;
  Aadhar?: string;
  BusinessTypeCode?: string;
  PAN?: string;
  GST?: string;
  Address?: string;
  State?: string;
  District?: string;
  Cityname?: string;
  PINCode?: string;
  Photo?: string | null;
  dob?: string;
  videokycstatus?: string;
  aadharsts?: string;
  chkaadharfront?: string | null;
  chkaadharback?: string | null;
  pancardPath?: string | null;
  PSAStatus?: string;
  chkpanpath?: string;
  chkRegistractioncertificatepath?: string | null;
  serviceagreementpath?: string | null;
  chkShopwithSalfie?: string | null;
  aadharcardPath?: string;
  Iserviceagreementtatus?: string;
}

export type DocStatus = 'verified' | 'pending' | 'upload';

const DEFAULT_PROFILE: ProfileData = {
  Name: '', firmName: '',
  JoinDate: new Date().toISOString().split('T')[0],
  Mobile: '', Email: '', BusinessType: '',
  Aadhar: '', PAN: '', GST: '', Address: '',
  State: '', District: '', Cityname: '',
  PINCode: '', Photo: null, dob: '',
};

export const useProfileData = () => {
  const navigation = useNavigation<any>();
  const { userId, IsDealer } = useSelector((s: RootState) => s.userInfo);
  const { get } = useAxiosHook();

  // ── Data state ─────────────────────────────────────────────────────────────
  const [profileData, setProfileData]     = useState<ProfileData>({});
  const [districtData, setDistrictData]   = useState<any[]>([]);
  const [refreshing, setRefreshing]       = useState(false);
  const [showLoader, setShowLoader]       = useState(false);
  const [base64Img, setBase64Img]         = useState<string | null>(null);
  const [imagePath, setImagePath]         = useState('');
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [modalTitle, setModalTitle]       = useState('');
  const [lastUpload, setLastUpload]       = useState('');
  const lastUploadRef                     = useRef('');

  // ── Form fields ────────────────────────────────────────────────────────────
  const [nameVal, setNameVal]         = useState('');
  const [firmNameVal, setFirmNameVal] = useState('');
  const [aadharNo, setAadharNo]       = useState('');
  const [panNo, setPanNo]             = useState('');
  const [gst, setGst]                 = useState('');
  const [stateVal, setStateVal]       = useState('');
  const [districtVal, setDistrictVal] = useState('');

  const profileDataToUse  = { ...DEFAULT_PROFILE, ...profileData };
  const hasProfileData    = Object.keys(profileData).length > 0;

  // ── Camera hook ────────────────────────────────────────────────────────────
  const { showPickerAlert, openCamera } = useCameraCapture({
    captureKey: 'profile_doc',
    onCapture: (base64) => {
      setBase64Img(base64);
      uploadDocument(lastUploadRef.current, base64);
    },
  });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    const url = IsDealer
      ? `${APP_URLS.dealer_profile}dlmid=${userId}`
      : APP_URLS.getProfile;
    const res = await get({ url });
    if (res) {
      const data = IsDealer
        ? res
        : JSON.parse(decryptData(res.value1, res.value2, res.data));
      setProfileData(data);
    }
    setRefreshing(false);
  }, [get, userId, IsDealer]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Sync form fields
  useEffect(() => {
    if (!hasProfileData) return;
    setNameVal(profileData.Name ?? '');
    setFirmNameVal(profileData.firmName ?? '');
    setAadharNo(profileData.Aadhar ?? '');
    setPanNo(profileData.PAN ?? '');
    setGst(profileData.GST ?? '');
    setStateVal(profileData.State ?? '');
    setDistrictVal(profileData.District ?? '');
  }, [profileData]);

  // Re-fetch on focus
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem('Profile_status')
        .then((s) => { if (s === 'Updated') fetchData(); })
        .catch(() => {});
    }, [fetchData]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // ── Districts ──────────────────────────────────────────────────────────────
  const getDistricts = useCallback(
    async ({ id }: { id: number }) => {
      const res = await get({ url: `${APP_URLS.getDistricts}${id}` });
      setDistrictData(res ?? []);
    },
    [get],
  );

  // ── Upload ─────────────────────────────────────────────────────────────────
  const setUploadType = useCallback((type: string) => {
    lastUploadRef.current = type;
    setLastUpload(type);
  }, []);

  const buildPayload = (type: string, b64: string) => {
    const base = { txtretailerid: userId, currentrole: 'Retailer' };
    switch (type) {
      case 'Aadhar Card':       return { AadharcardFront: b64, AadharcardBack: b64, ...base };
      case 'Pan Card':          return { PancardFront: b64, ...base };
      case 'GST IN':            return { Registrationcertificatepath: b64, ...base };
      case 'Shop Selfie':       return { ShopeWithSelfie: b64, ...base };
      case 'Service Agreement': return { Serviceaggreementpath: b64, ...base };
      case 'Profile image':     return { ProfileImagess: b64, ...base };
      default: return null;
    }
  };

const uploadDocument = useCallback(async (type: string, b64: string) => {
  setImageModalVisible(false);
  const payload = buildPayload(type, b64);
  if (!payload) return;

  const endpoint = type === 'Profile image'
    ? 'api/user/UploadUserImages'
    : 'api/user/UploadDocumentsImages';

const fullUrl = `https://${APP_URLS.baseWebUrl.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  // ✅ URL print karo
  console.log('📤 Upload URL:', fullUrl);
  console.log('📦 Upload Type:', type);
  console.log('📋 Payload keys:', Object.keys(payload));
 
  try {
    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    });

    // ✅ Response status print karo
    console.log('📡 Response Status:', res.status);
    console.log('📡 Response OK:', res.ok);

    const rawText = await res.text();

    // ✅ Raw response print karo
    console.log('📥 Raw Response:', rawText);

    if (!res.ok) throw new Error(`Status: ${res.status}`);

    // JSON parse try karo
    try {
      const json = JSON.parse(rawText);
      console.log('✅ JSON Response:', JSON.stringify(json, null, 2));
      ToastAndroid.show(String(json), ToastAndroid.SHORT);
    } catch {
      // JSON nahi tha — plain text hai
      console.log('✅ Text Response:', rawText);
      ToastAndroid.show(rawText, ToastAndroid.SHORT);
    }

  } catch (err: any) {
    console.log('❌ Upload Error:', err.message);
    Alert.alert('Error', `Failed to upload ${type}: ${err.message}`);
  } finally {
    setShowLoader(false);
  }
}, [userId]);
  const requestCameraPermission = useCallback(async (type: string) => {
    if (type === 'AA') {
      navigation.navigate('AadharCardUpload', { id: userId });
      return;
    }
    setUploadType(type);
    openCamera('profile_doc', type);
  }, [navigation, userId, openCamera, setUploadType]);

  const showUploadOptions = useCallback((typeName: string) => {
    setUploadType(typeName);
    showPickerAlert('profile_doc', typeName);
  }, [showPickerAlert, setUploadType]);

  const navigateToEditProfile = useCallback(async () => {
    await AsyncStorage.setItem('Profile_status', 'un');
    navigation.navigate('EditProfile', { profileData: profileDataToUse });
  }, [navigation, profileDataToUse]);

  // ── Doc status helpers ─────────────────────────────────────────────────────
  const aadharStatus: DocStatus =
    profileData.aadharsts === 'N' && !profileData.chkaadharfront && !profileData.chkaadharback
      ? 'upload'
      : profileData.aadharsts === 'P' ? 'pending' : 'verified';

  const panStatus: DocStatus =
    !profileData.pancardPath && profileData.PSAStatus === 'N'
      ? 'upload'
      : profileData.PSAStatus === 'P' ? 'pending' : 'verified';

  const gstStatus: DocStatus     = !profileData.chkRegistractioncertificatepath ? 'upload' : 'verified';
  const serviceStatus: DocStatus = !profileData.serviceagreementpath ? 'upload' : 'verified';
  const selfieStatus: DocStatus  = !profileData.chkShopwithSalfie ? 'upload' : 'verified';
  const addrStatus: DocStatus    = !profileData.chkaadharback ? 'upload' : 'verified';

  return {
    // data
    profileData, profileDataToUse, hasProfileData,
    districtData, refreshing, showLoader,
    base64Img, imagePath, setImagePath,
    isImageModalVisible, setImageModalVisible,
    modalTitle, setModalTitle, lastUpload,
    // form fields
    nameVal, setNameVal, firmNameVal, setFirmNameVal,
    aadharNo, panNo, gst,
    stateVal, setStateVal, districtVal, setDistrictVal,
    // doc statuses
    aadharStatus, panStatus, gstStatus,
    serviceStatus, selfieStatus, addrStatus,
    // actions
    onRefresh, getDistricts, fetchData,
    requestCameraPermission, showUploadOptions,
    navigateToEditProfile, uploadDocument,
    showStateList: false, showDistrictList: false,
  };
};