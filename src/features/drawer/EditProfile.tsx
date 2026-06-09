import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  TouchableOpacity,
  Image,
  ToastAndroid,
  StatusBar,
} from 'react-native';
import StepIndicator from 'react-native-step-indicator';
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

// ─── Static constants (non-color) ─────────────────────────────────────────────

const STEPS = ['Personal', 'Business', 'Documents', 'Location'];

const STEP_FIELDS: Record<number, string[]> = {
  0: ['name', 'mobile', 'email', 'dob', 'Join_Date'],
  1: ['firmName', 'businessType', 'gst'],
  2: ['Aadhar', 'PAN'],
  3: ['address', 'cityName', 'pinCode'],
};

const FIELD_LABELS: Record<string, string> = {
  name: 'Full Name',
  mobile: 'Mobile Number',
  email: 'Email Address',
  dob: 'Date of Birth',
  Join_Date: 'Joining Date',
  firmName: 'Firm / Business Name',
  businessType: 'Business Type',
  gst: 'GST Number',
  Aadhar: 'Aadhaar Number',
  PAN: 'PAN Number',
  address: 'Full Address',
  cityName: 'City',
  pinCode: 'PIN Code',
};

const STEP_ICONS = ['👤', '🏢', '📄', '📍'];

// Static colors that don't change with theme
const STATIC = {
  bg: '#F4F6FF',
  cardBg: '#FFFFFF',
  danger: '#EF4444',
  text: '#1A1F36',
  muted: '#6B7280',
  border: '#E5E7EB',
  stepIncomplete: '#D1D5DB',
  white: '#FFFFFF',
};

// ─── Component ────────────────────────────────────────────────────────────────

const EditProfile = ({ route }) => {
  const { profileData } = route.params;
  const { post } = useAxiosHook();
  const { userId, colorConfig } = useSelector((state: RootState) => state.userInfo);
  const role = 'Retailer';
  const navigation = useNavigation();

  // ─── Dynamic theme from colorConfig ───────────────────────────────────────
  const primary   = colorConfig?.primaryColor   ?? '#4F46E5';
  const secondary = colorConfig?.secondaryColor ?? '#1A1F36';

  // ─── Step indicator styles (memoized so they update if colorConfig changes)
  const stepIndicatorStyles = useMemo(() => ({
    stepIndicatorSize: 32,
    currentStepIndicatorSize: 38,
    separatorStrokeWidth: 2,
    currentStepStrokeWidth: 3,
    stepStrokeCurrentColor: primary,
    stepStrokeWidth: 2,
    stepStrokeFinishedColor: primary,
    stepStrokeUnFinishedColor: STATIC.stepIncomplete,
    separatorFinishedColor: primary,
    separatorUnFinishedColor: STATIC.stepIncomplete,
    stepIndicatorFinishedColor: primary,
    stepIndicatorUnFinishedColor: STATIC.white,
    stepIndicatorCurrentColor: STATIC.white,
    stepIndicatorLabelFontSize: 13,
    currentStepIndicatorLabelFontSize: 14,
    stepIndicatorLabelCurrentColor: primary,
    stepIndicatorLabelFinishedColor: STATIC.white,
    stepIndicatorLabelUnFinishedColor: STATIC.stepIncomplete,
    labelColor: STATIC.muted,
    labelSize: 11,
    currentStepLabelColor: primary,
  }), [primary]);

  // ─── Form state ───────────────────────────────────────────────────────────

  const initialFormData = {
    name:             profileData.Name          ?? '',
    firmName:         profileData.firmName      ?? '',
    Join_Date:        new Date(profileData.JoinDate).toISOString().split('T')[0],
    mobile:           profileData.Mobile        ?? '',
    email:            profileData.Email         ?? '',
    businessType:     profileData.BusinessType  ?? '',
    Aadhar:           profileData.Aadhar        ?? '',
    BusinessTypeCode: profileData.BusinessTypeCode ?? '',
    PAN:              profileData.PAN           ?? '',
    gst:              profileData.GST           ?? '',
    address:          profileData.Address       ?? '',
    state:            profileData.State         ?? '',
    district:         profileData.District      ?? '',
    cityName:         profileData.Cityname      ?? '',
    pinCode:          profileData.PINCode       ?? '',
    image:            profileData.imageUrl      ?? '',
    dob:              profileData.dob           ?? '',
  };

  const [formData, setFormData]             = useState(initialFormData);
  const [currentStep, setCurrentStep]       = useState(0);
  const [modalVisible, setModalVisible]     = useState(false);
  const [selectedImage, setSelectedImage]   = useState<string | null>(null);
  const [showStateList, setShowStateList]   = useState(false);
  const [showDistrictList, setShowDistrictList] = useState(false);
  const [districtData, setDistrictData]     = useState<any[]>([]);
  const [state, setState]                   = useState(profileData?.State    || '');
  const [stateDist, setStateDist]           = useState(profileData?.District || '');
  const [image, setImage]                   = useState(profileData?.Photo    ?? null);
  const [isload, setIsload]                 = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const { get } = useAxiosHook();

  const handleInputChange = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const getStateIdByName = (stateName: string) => {
    const s = stateData.find(i => i.stateName.toLowerCase() === stateName.toLowerCase());
    return s ? s.stateId : null;
  };

  const getDistIdByName = (districtName: string) => {
    const sanitized = districtName.trim().toLowerCase();
    const dist = districtData.find(i => i['Dist Name'].trim().toLowerCase() === sanitized);
    return dist ? dist['Dist Id'] : null;
  };

  const getDistricts = useCallback(
    async ({ id }: { id: number }) => {
      const response = await get({ url: `${APP_URLS.getDistricts}${id}` });
      setDistrictData(response ?? []);
    },
    [get],
  );

  useEffect(() => {
    const id = getStateIdByName(state || formData.state);
    if (id) getDistricts({ id });
  }, [formData.state, state]);

  // ─── Step navigation ───────────────────────────────────────────────────────

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const isLastStep = currentStep === STEPS.length - 1;

  // ─── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    try {
      const cleanedFormData = Object.fromEntries(
        Object.entries(formData).map(([k, v]) => [
          k,
          v && v !== 'Please Enter' ? String(v).trim() : '',
        ]),
      );

      const requiredFields = [
        { key: 'name',   label: 'Name'   },
        { key: 'email',  label: 'Email'  },
        { key: 'mobile', label: 'Mobile' },
      ];

      const missing = requiredFields
        .filter(f => !cleanedFormData[f.key])
        .map(f => f.label);

      if (missing.length > 0) {
        Alert.alert('Validation Error', `Please fill: ${missing.join(', ')}`);
        return;
      }

      if (!/^\d{10}$/.test(cleanedFormData.mobile)) {
        Alert.alert('Validation Error', 'Mobile must be exactly 10 digits.');
        return;
      }

      const data = {
        Name:             cleanedFormData.name,
        firmName:         cleanedFormData.firmName,
        Mobile:           cleanedFormData.mobile ? `+91${cleanedFormData.mobile}` : '',
        PINCode:          cleanedFormData.pinCode,
        Email:            cleanedFormData.email,
        Address:          cleanedFormData.address,
        District:         getDistIdByName(stateDist || cleanedFormData.district) ?? '',
        State:            getStateIdByName(state || cleanedFormData.state) ?? '',
        Aadhar:           cleanedFormData.Aadhar,
        PAN:              cleanedFormData.PAN,
        GST:              cleanedFormData.gst,
        dob:              cleanedFormData.dob,
        BusinessType:     cleanedFormData.businessType,
        BusinessTypeCode: cleanedFormData.BusinessTypeCode,
        Password:         '123456',
        PIN:              '1234',
        JoinDate:         profileData.joinDate3 ?? '',
        Cityname:         cleanedFormData.cityName,
      };

      setIsload(true);
      const response = await post({ url: APP_URLS.updateProfile, data });

      if (response) {
        onReceiveNotification2({
          notification: { title: 'Update Profile', body: response.Message },
        });
        if (response.Response === 'Success') {
          Alert.alert('', response.Message, [
            {
              text: 'Go Back',
              onPress: async () => {
                await AsyncStorage.setItem('Profile_status', 'updated');
                navigation.navigate('Profile');
              },
            },
          ]);
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
      setIsload(false);
    }
  };

  // ─── Image upload ──────────────────────────────────────────────────────────

  const uploadDoCx = useCallback(
    async (bs64: string) => {
      setModalVisible(false);
      setIsload(true);
      try {
        const url = `https://www.${APP_URLS.baseWebUrl}api/user/UploadUserImages`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ ProfileImagess: bs64, txtretailerid: userId, currentrole: role }),
        });
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        const responseData = await response.json();
        ToastAndroid.show(responseData, ToastAndroid.SHORT);
      } catch (error: any) {
        Alert.alert('Error', `Failed to upload: ${error.message}`);
      } finally {
        setIsload(false);
      }
    },
    [userId, role],
  );

  const handleImageSelect = async () => {
    const opts = { selectionLimit: 1, mediaType: 'photo' as const, includeBase64: true };

    const handleResponse = (response: any) => {
      if (response.didCancel || response.errorCode) return;
      const b64 = response?.assets?.[0]?.base64;
      if (b64) { setImage(null); setSelectedImage(b64); }
    };

    const checkAndLaunchCamera = async () => {
      const status = await check(PERMISSIONS.ANDROID.CAMERA);
      if (status === RESULTS.BLOCKED) {
        Alert.alert('Permission Required', 'Please allow camera access from settings', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => openSettings() },
        ]);
        return;
      }
      if (status !== RESULTS.GRANTED) {
        const result = await request(PERMISSIONS.ANDROID.CAMERA);
        if (result !== RESULTS.GRANTED) return;
      }
      launchCamera({ ...opts, saveToPhotos: false }, handleResponse);
    };

    Alert.alert('Select Image', 'Choose from gallery or take a photo', [
      { text: 'Camera',  onPress: checkAndLaunchCamera },
      { text: 'Gallery', onPress: () => launchImageLibrary(opts, handleResponse) },
    ]);
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const imageUri = image
    ? `http://${APP_URLS.baseWebUrl}${image}`
    : selectedImage
    ? `data:image/jpeg;base64,${selectedImage}`
    : null;

  // ─── Step fields renderer ──────────────────────────────────────────────────

  const renderStepFields = () => {
    const fields = STEP_FIELDS[currentStep];

    if (currentStep === 3) {
      return (
        <View>
          {fields.map(key => (
            <View key={key} style={staticStyles.fieldWrapper}>
              <Text style={staticStyles.fieldLabel}>{FIELD_LABELS[key] ?? key}</Text>
              <FlotingInput
                label=""
                autoFocus={false}
                editable={true}
                value={formData[key]}
                onChangeTextCallback={(text: string) => handleInputChange(key, text)}
                inputstyle={[staticStyles.flatInput, { borderColor: primary + '55' }]}
                labelinputstyle={staticStyles.hiddenLabel}
                keyboardType={key === 'pinCode' ? 'numeric' : 'default'}
              />
            </View>
          ))}

          {/* State picker */}
          <View style={staticStyles.fieldWrapper}>
            <Text style={staticStyles.fieldLabel}>State</Text>
            <TouchableOpacity
              style={[staticStyles.pickerButton, { borderColor: primary + '55' }]}
              onPress={() => { setShowStateList(true); setShowDistrictList(false); }}>
              <Text style={[staticStyles.pickerText, !state && staticStyles.pickerPlaceholder]}>
                {state || 'Select State'}
              </Text>
              <Text style={[staticStyles.pickerArrow, { color: primary }]}>▼</Text>
            </TouchableOpacity>
          </View>

          {/* District picker */}
          <View style={staticStyles.fieldWrapper}>
            <Text style={staticStyles.fieldLabel}>District</Text>
            <TouchableOpacity
              style={[staticStyles.pickerButton, { borderColor: primary + '55' }]}
              onPress={() => { setShowStateList(false); setShowDistrictList(true); }}>
              <Text style={[staticStyles.pickerText, !stateDist && staticStyles.pickerPlaceholder]}>
                {stateDist || 'Select District'}
              </Text>
              <Text style={[staticStyles.pickerArrow, { color: primary }]}>▼</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return fields.map(key => (
      <View key={key} style={staticStyles.fieldWrapper}>
        <Text style={staticStyles.fieldLabel}>{FIELD_LABELS[key] ?? key}</Text>
        <FlotingInput
          label=""
          autoFocus={false}
          editable={key !== 'Join_Date'}
          value={formData[key]}
          onChangeTextCallback={(text: string) => handleInputChange(key, text)}
          inputstyle={[staticStyles.flatInput, { borderColor: primary + '55' }]}
          labelinputstyle={staticStyles.hiddenLabel}
          keyboardType={key === 'mobile' || key === 'pinCode' ? 'numeric' : 'default'}
        />
      </View>
    ));
  };

  // ─── Bottom sheet list ─────────────────────────────────────────────────────

  const showBottomSheetList = () => (
    <FlashList
      style={{ marginBottom: wScale(50), marginHorizontal: wScale(12) }}
      data={showStateList ? stateData : districtData}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={[staticStyles.listItem, { backgroundColor: primary + '12' }]}
          onPress={async () => {
            if (showStateList) {
              setShowStateList(false);
              setShowDistrictList(true);
              setState(item.stateName);
              await getDistricts({ id: item.stateId });
            } else {
              setShowDistrictList(false);
              setStateDist(item['Dist Name']);
            }
          }}>
          <Text style={[staticStyles.listItemText, { color: primary }]}>
            {showStateList ? item.stateName : item['Dist Name']}
          </Text>
        </TouchableOpacity>
      )}
      estimatedItemSize={44}
    />
  );

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={staticStyles.screen}>
      <StatusBar backgroundColor={secondary} barStyle="light-content" />
      <AppBarSecond title={'Edit Profile'} />

      {/* ── Avatar section ── */}
      <View style={[staticStyles.avatarSection, { backgroundColor: secondary }]}>
        <TouchableOpacity onPress={() => setModalVisible(true)} activeOpacity={0.85}>
          <View style={[staticStyles.avatarRing, { borderColor: primary }]}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={staticStyles.avatarImage} />
            ) : (
              <Image
                source={require('../drawer/assets/bussiness-man.png')}
                style={staticStyles.avatarImage}
              />
            )}
            <View style={[staticStyles.cameraBadge, { backgroundColor: primary, borderColor: secondary }]}>
              <Text style={staticStyles.cameraBadgeText}>📷</Text>
            </View>
          </View>
        </TouchableOpacity>
        <Text style={staticStyles.avatarName}>{formData.name || 'Your Name'}</Text>
        <Text style={[staticStyles.avatarSub, { color: primary + 'CC' }]}>
          {formData.mobile || 'Mobile not set'}
        </Text>
      </View>

      {/* ── Step indicator ── */}
      <View style={staticStyles.stepContainer}>
        <StepIndicator
          customStyles={stepIndicatorStyles}
          currentPosition={currentStep}
          labels={STEPS}
          stepCount={STEPS.length}
          renderStepIndicator={({ position, stepStatus }) => (
            <Text style={{
              fontSize: stepStatus === 'current' ? 16 : 13,
              color: stepStatus === 'finished'
                ? STATIC.white
                : stepStatus === 'current'
                ? primary
                : STATIC.muted,
            }}>
              {stepStatus === 'finished' ? '✓' : STEP_ICONS[position]}
            </Text>
          )}
          onPress={pos => setCurrentStep(pos)}
        />
      </View>

      {/* ── Form card ── */}
      <ScrollView
        style={staticStyles.scrollView}
        contentContainerStyle={staticStyles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        <View style={[staticStyles.card, { shadowColor: primary }]}>
          {/* Card header */}
          <View style={staticStyles.cardHeader}>
            <View style={[staticStyles.stepIconBubble, { backgroundColor: primary + '18' }]}>
              <Text style={staticStyles.cardStepIcon}>{STEP_ICONS[currentStep]}</Text>
            </View>
            <View>
              <Text style={staticStyles.cardStepLabel}>
                Step {currentStep + 1} of {STEPS.length}
              </Text>
              <Text style={[staticStyles.cardStepTitle, { color: secondary }]}>
                {STEPS[currentStep]} Details
              </Text>
            </View>
          </View>

          <View style={[staticStyles.divider, { backgroundColor: primary + '22' }]} />

          {renderStepFields()}
        </View>

        {/* ── Nav buttons ── */}
        <View style={staticStyles.navRow}>
          {currentStep > 0 && (
            <TouchableOpacity
              style={[staticStyles.backBtn, { borderColor: primary }]}
              onPress={handleBack}
              activeOpacity={0.8}>
              <Text style={[staticStyles.backBtnText, { color: primary }]}>← Back</Text>
            </TouchableOpacity>
          )}

          {!isLastStep ? (
            <TouchableOpacity
              style={[
                staticStyles.nextBtn,
                { backgroundColor: primary, shadowColor: primary },
                currentStep === 0 && staticStyles.nextBtnFull,
              ]}
              onPress={handleNext}
              activeOpacity={0.8}>
              <Text style={staticStyles.nextBtnText}>Continue →</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[staticStyles.submitBtn, { backgroundColor: secondary, shadowColor: secondary }]}
              onPress={handleSubmit}
              activeOpacity={0.8}>
              <Text style={staticStyles.submitBtnText}>✓ Save Profile</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: hpScale(4) }} />
      </ScrollView>

      {/* ── Image modal ── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={staticStyles.modalOverlay}>
          <View style={staticStyles.modalCard}>
            <Text style={[staticStyles.modalTitle, { color: secondary }]}>Profile Photo</Text>

            <View style={staticStyles.modalImageWrapper}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={[staticStyles.modalImage, { borderColor: primary }]} />
              ) : (
                <Image
                  source={require('../drawer/assets/bussiness-man.png')}
                  style={[staticStyles.modalImage, { borderColor: primary }]}
                />
              )}
            </View>

            <View style={staticStyles.modalActions}>
              <TouchableOpacity
                style={[staticStyles.modalActionBtn, { borderColor: STATIC.border }]}
                onPress={handleImageSelect}
                activeOpacity={0.8}>
                <Text style={staticStyles.modalActionIcon}>✏️</Text>
                <Text style={[staticStyles.modalActionLabel, { color: STATIC.text }]}>Change</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[staticStyles.modalActionBtn, { backgroundColor: primary, borderColor: primary }]}
                onPress={() => selectedImage && uploadDoCx(selectedImage)}
                activeOpacity={0.8}>
                <Text style={staticStyles.modalActionIcon}>☁️</Text>
                <Text style={[staticStyles.modalActionLabel, { color: STATIC.white }]}>Upload</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[staticStyles.modalActionBtn, {
                  borderColor: STATIC.danger + '40',
                  backgroundColor: STATIC.danger + '10',
                }]}
                onPress={() => setModalVisible(false)}
                activeOpacity={0.8}>
                <Text style={staticStyles.modalActionIcon}>✕</Text>
                <Text style={[staticStyles.modalActionLabel, { color: STATIC.danger }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ── Bottom sheet ── */}
      <BottomSheet
        isVisible={showStateList || showDistrictList}
        onBackdropPress={() => { setShowStateList(false); setShowDistrictList(false); }}
        scrollViewProps={{ scrollEnabled: false }}
        containerStyle={{ backgroundColor: 'transparent' }}>
        <View style={staticStyles.bottomSheet}>
          <View style={[staticStyles.bottomSheetHandle, { backgroundColor: primary + '44' }]} />
          <Text style={[staticStyles.bottomSheetTitle, { color: secondary }]}>
            {showStateList ? '🗺️ Select State' : '📍 Select District'}
          </Text>
          <View style={[staticStyles.bottomSheetDivider, { backgroundColor: primary + '22' }]} />
          {showBottomSheetList()}
        </View>
      </BottomSheet>

      {isload && <ShowLoader />}
    </View>
  );
};

// ─── Static styles (colors injected inline where needed) ─────────────────────

const staticStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: STATIC.bg,
  },

  // Avatar
  avatarSection: {
    alignItems: 'center',
    paddingVertical: hpScale(2.5),
  },
  avatarRing: {
    width: wScale(92),
    height: wScale(92),
    borderRadius: wScale(46),
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: wScale(84),
    height: wScale(84),
    borderRadius: wScale(42),
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: wScale(12),
    width: wScale(24),
    height: wScale(24),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  cameraBadgeText: { fontSize: 11 },
  avatarName: {
    marginTop: hpScale(1),
    fontSize: 16,
    fontWeight: '700',
    color: STATIC.white,
    letterSpacing: 0.3,
  },
  avatarSub: {
    fontSize: 12,
    marginTop: 2,
  },

  // Step indicator
  stepContainer: {
    backgroundColor: STATIC.cardBg,
    paddingHorizontal: wScale(16),
    paddingTop: hpScale(2),
    paddingBottom: hpScale(1.5),
    borderBottomWidth: 1,
    borderBottomColor: STATIC.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },

  // Scroll
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: wScale(16),
    paddingTop: hpScale(2),
    paddingBottom: hpScale(4),
  },

  // Card
  card: {
    backgroundColor: STATIC.cardBg,
    borderRadius: 16,
    padding: wScale(18),
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wScale(12),
    marginBottom: hpScale(1.5),
  },
  stepIconBubble: {
    width: wScale(48),
    height: wScale(48),
    borderRadius: wScale(24),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardStepIcon: { fontSize: 24 },
  cardStepLabel: {
    fontSize: 11,
    color: STATIC.muted,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardStepTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 1,
  },
  divider: {
    height: 1,
    marginBottom: hpScale(2),
  },

  // Fields
  fieldWrapper: { marginBottom: hpScale(1.5) },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: STATIC.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: hpScale(0.5),
    marginLeft: 2,
  },
  flatInput: {
    backgroundColor: STATIC.bg,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: wScale(12),
    paddingVertical: hpScale(1.4),
    fontSize: 14,
    color: STATIC.text,
  },
  hiddenLabel: { display: 'none' },

  // Pickers
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: STATIC.bg,
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: wScale(12),
    paddingVertical: hpScale(1.6),
  },
  pickerText: { fontSize: 14, color: STATIC.text, fontWeight: '500' },
  pickerPlaceholder: { color: STATIC.muted, fontWeight: '400' },
  pickerArrow: { fontSize: 10 },

  // Nav buttons
  navRow: {
    flexDirection: 'row',
    gap: wScale(10),
    marginTop: hpScale(2),
  },
  backBtn: {
    flex: 1,
    paddingVertical: hpScale(1.8),
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { fontSize: 14, fontWeight: '600' },
  nextBtn: {
    flex: 2,
    paddingVertical: hpScale(1.8),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  nextBtnFull: { flex: 1 },
  nextBtnText: { fontSize: 14, fontWeight: '700', color: STATIC.white, letterSpacing: 0.3 },
  submitBtn: {
    flex: 2,
    paddingVertical: hpScale(1.8),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  submitBtnText: { fontSize: 14, fontWeight: '700', color: STATIC.white, letterSpacing: 0.3 },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: STATIC.cardBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: wScale(24),
    paddingBottom: hpScale(5),
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: hpScale(2),
  },
  modalImageWrapper: {
    alignItems: 'center',
    marginBottom: hpScale(3),
  },
  modalImage: {
    width: wScale(140),
    height: wScale(140),
    borderRadius: wScale(70),
    borderWidth: 3,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    gap: wScale(12),
  },
  modalActionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: hpScale(1.5),
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: STATIC.bg,
  },
  modalActionIcon: { fontSize: 20, marginBottom: 4 },
  modalActionLabel: { fontSize: 12, fontWeight: '600' },

  // Bottom sheet
  bottomSheet: {
    backgroundColor: STATIC.cardBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: SCREEN_HEIGHT / 1.5,
    paddingBottom: hpScale(3),
  },
  bottomSheetHandle: {
    width: wScale(40),
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 8,
  },
  bottomSheetTitle: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: hpScale(1.2),
    paddingHorizontal: wScale(24),
  },
  bottomSheetDivider: {
    height: 1,
    marginHorizontal: wScale(16),
    marginBottom: hpScale(1),
  },
  listItem: {
    paddingVertical: hpScale(1.5),
    paddingHorizontal: wScale(20),
    marginHorizontal: wScale(8),
    marginVertical: 2,
    borderRadius: 10,
    marginBottom: hpScale(0.5),
  },
  listItemText: {
    fontSize: 15,
    fontWeight: '500',
  },
});

export default EditProfile;