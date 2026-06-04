import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, RefreshControl } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import { SvgXml } from 'react-native-svg';
import { BottomSheet } from '@rneui/base';
import { FlashList } from '@shopify/flash-list';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';

import { RootState } from '../../reduxUtils/store';
import { hScale, SCREEN_HEIGHT, wScale } from '../../utils/styles/dimensions';
import { stateData } from '../../utils/stateData';
import { translate } from '../../utils/languageUtils/I18n';
import { APP_URLS } from '../../utils/network/urls';
import AppBar from './headerAppbar/AppBar';
import SelectableButton from './profilePages/selectButton';
import ImageBottomSheet from '../../components/ImageBottomSheet';
import { useProfileData } from './profilePages/hokes/useProfileData';
import ProfileHeader from './profilePages/ProfileHeader';
import PersonalInfoTab from './profilePages/PersonalInfoTab';
import BusinessKycTab from './profilePages/BusinessKycTab';

const DELETE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 64 64"><path d="m54 19.07-2.67 36.37a5 5 0 0 1-5 4.56H36a1 1 0 0 1 0-2h10.35a3 3 0 0 0 3-2.73L52 18.93a1 1 0 1 1 2 .14ZM59 13a3 3 0 0 1-3 3H20v9a1 1 0 0 1-2 0v-9h-2a3 3 0 0 1 0-6h10V9a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v1h10a3 3 0 0 1 3 3Zm-31-3h16V9a3 3 0 0 0-3-3H31a3 3 0 0 0-3 3Zm-9 41a7 7 0 0 0-7 7s0 .06 0 .09a13.86 13.86 0 0 0 14 0s0-.09 0-.09a7 7 0 0 0-7-7Z" fill="#000"/></svg>`;

const makeGenderSVG = (p: string, s: string) =>
  `<svg viewBox="0 0 64 64" width="28" height="28" xmlns="http://www.w3.org/2000/svg"><linearGradient id="gg" gradientUnits="userSpaceOnUse" x1="3" x2="61" y1="32" y2="32"><stop offset="0" stop-color="${p}"/><stop offset="1" stop-color="${s}"/></linearGradient><path d="m17.75 46.87a3.19 3.19 0 0 1-3.19-3.18v-3.96a8.637 8.637 0 0 1 5.91-8.2l7.87-2.62c-9.2-4.88-5.86-18.95 4.7-19.04 10.58.13 13.9 14.11 4.7 19.04l7.86 2.62a8.624 8.624 0 0 1 5.91 8.2v3.96a3.188 3.188 0 0 1-3.18 3.18z" fill="url(#gg)"/></svg>`;

const Profile: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colorConfig, IsDealer } = useSelector((s: RootState) => s.userInfo);

  // ── Local UI state (tab, gender, bottom sheets) ───────────────────────────
  const [selectedopt, setSelectedOpt]       = useState(true);
  const [selectedGender, setSelectedGender] = useState('Male');
  const [showStateList, setShowStateList]   = useState(false);
  const [showDistrictList, setShowDistrictList] = useState(false);

  // ── All data/logic from hook ──────────────────────────────────────────────
  const p = useProfileData();

  const genderSvg = useMemo(
    () => makeGenderSVG(colorConfig.primaryColor, colorConfig.secondaryColor),
    [colorConfig.primaryColor, colorConfig.secondaryColor],
  );

  const handleGenderChange = useCallback(() => {
    setSelectedGender((prev) =>
      prev === 'Male' ? 'Female' : prev === 'Female' ? 'Other' : 'Male',
    );
  }, []);

  // ── Empty state ───────────────────────────────────────────────────────────
  const renderEmptyState = () => (
    <View style={s.emptyState}>
      <Text style={s.emptyTitle}>{translate('Complete Your Profile')}</Text>
      <Text style={s.emptySub}>{translate('Set up your profile to access all features')}</Text>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('EditProfile', { profileData: p.profileDataToUse })}
        style={[s.emptyBtn, { backgroundColor: colorConfig.secondaryColor }]}
      >
        <Text style={s.emptyBtnText}>{translate('Click to Create Your Profile')}  →</Text>
      </TouchableOpacity>
      <View style={{ height: hScale(10) }} />
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('VideoKYC', { CNTNT: { hindi: '', Eng: '' } })}
        style={[s.emptyBtn, { backgroundColor: colorConfig.primaryColor }]}
      >
        <Text style={s.emptyBtnText}>{translate('Click to Create Video Kyc')}  🎥</Text>
      </TouchableOpacity>
    </View>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={s.root}>
      <LinearGradient colors={[colorConfig.primaryColor, colorConfig.secondaryColor]} style={{ flex: 1 }}>

        <AppBar title={translate('Manage Profile')} actionButton={<SvgXml xml={DELETE_SVG} />} />

        <ProfileHeader
          profileData={p.profileData}
          profileImage={null}
          isDealer={IsDealer}
          secondaryColor={colorConfig.secondaryColor}
          onEditPress={p.navigateToEditProfile}
        />

        <View style={s.tabWrap}>
          <SelectableButton setselectedopt={setSelectedOpt} />
        </View>

        <ScrollView
          refreshControl={<RefreshControl refreshing={p.refreshing} onRefresh={p.onRefresh} />}
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={s.bodyCard}>
            {!p.hasProfileData
              ? renderEmptyState()
              : selectedopt
                ? (
                  <PersonalInfoTab
                    profileData={p.profileData}
                    nameVal={p.nameVal} setNameVal={p.setNameVal}
                    selectedGender={selectedGender}
                    onGenderChange={handleGenderChange}
                    genderSvg={genderSvg}
                    stateVal={p.stateVal} districtVal={p.districtVal}
                    districtData={p.districtData}
                    onStatePress={() => setShowStateList(true)}
                    onDistrictPress={() => setShowDistrictList(true)}
                    hasProfileData={p.hasProfileData}
                    onKycPress={() => navigation.navigate('VideoKYC', { CNTNT: { hindi: '', Eng: '' } })}
                  />
                ) : (
                  <BusinessKycTab
                    profileData={p.profileData}
                    firmNameVal={p.firmNameVal} setFirmNameVal={p.setFirmNameVal}
                    aadharNo={p.aadharNo} panNo={p.panNo} gst={p.gst}
                    aadharStatus={p.aadharStatus} panStatus={p.panStatus}
                    gstStatus={p.gstStatus} serviceStatus={p.serviceStatus}
                    selfieStatus={p.selfieStatus} addrStatus={p.addrStatus}
                    showLoader={p.showLoader}
                    requestCameraPermission={p.requestCameraPermission}
                    showUploadOptions={p.showUploadOptions}
                    onViewImage={(path, title) => {
                      p.setImagePath(path);
                      p.setImageModalVisible(true);
                      p.setModalTitle(title);
                    }}
                  />
                )}
          </View>

          {/* State / District bottom sheet */}
          <BottomSheet
            isVisible={showStateList || showDistrictList}
            onBackdropPress={() => { setShowStateList(false); setShowDistrictList(false); }}
            containerStyle={{ backgroundColor: 'transparent' }}
          >
            <View style={s.bsContainer}>
              <View style={[s.bsHeader, { backgroundColor: colorConfig.primaryColor }]}>
                <Text style={s.bsHeaderText}>
                  {translate(showStateList ? 'select state' : 'select District')}
                </Text>
              </View>
              <FlashList
                style={{ marginBottom: wScale(50), marginHorizontal: wScale(16) }}
                data={(showStateList ? stateData : p.districtData) as any[]}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={s.listItem}
                    onPress={async () => {
                      if (showStateList) {
                        setShowStateList(false);
                        p.setStateVal(item.stateName);
                        await p.getDistricts({ id: item.stateId });
                      } else {
                        setShowDistrictList(false);
                        p.setDistrictVal(item['Dist Name']);
                      }
                    }}
                  >
                    <Text style={s.listItemText}>
                      {showStateList ? item.stateName : item['Dist Name']}
                    </Text>
                  </TouchableOpacity>
                )}
                estimatedItemSize={48}
              />
            </View>
          </BottomSheet>

          {/* Image viewer */}
          <ImageBottomSheet
            imagePath={p.imagePath}
            setModalVisible={p.setImageModalVisible}
            isModalVisible={p.isImageModalVisible}
            modalTitle={p.modalTitle}
            setImagePath={p.setImagePath}
            isUri
            ReUpload={() => {
              p.setImageModalVisible(false);
              const isAadhar = p.modalTitle === 'Aadhar Card (Front Side)' || p.modalTitle === 'Address Proof (Back Side)';
              isAadhar
                ? p.requestCameraPermission('AA')
                : p.showUploadOptions(p.modalTitle || p.lastUpload);
            }}
          />
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

const s = StyleSheet.create({
  root: { flex: 1 },
  tabWrap: {
    backgroundColor: '#fff', marginHorizontal: wScale(12),
    borderTopLeftRadius: wScale(12), borderTopRightRadius: wScale(12),
    paddingHorizontal: wScale(10), paddingTop: hScale(8),
  },
  scrollContent: { paddingBottom: hScale(40) },
  bodyCard: {
    backgroundColor: '#fff', marginHorizontal: wScale(12),
    borderBottomLeftRadius: wScale(12), borderBottomRightRadius: wScale(12),
    paddingHorizontal: wScale(12), paddingTop: hScale(12), paddingBottom: hScale(20),
  },
  bsContainer: {
    backgroundColor: '#fff', height: SCREEN_HEIGHT / 1.5,
    borderTopLeftRadius: wScale(16), borderTopRightRadius: wScale(16), overflow: 'hidden',
  },
  bsHeader: { paddingVertical: hScale(14), paddingHorizontal: wScale(16), alignItems: 'center' },
  bsHeaderText: { fontSize: wScale(16), color: '#fff', fontWeight: '700', textTransform: 'uppercase' },
  listItem: { paddingVertical: hScale(12), paddingHorizontal: wScale(16), borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  listItemText: { color: '#ef4444', fontSize: wScale(16) },
  emptyState: { alignItems: 'center', paddingVertical: hScale(24) },
  emptyTitle: { fontSize: wScale(18), fontWeight: '700', color: '#1e293b', marginBottom: hScale(6) },
  emptySub: { fontSize: wScale(13), color: '#64748b', textAlign: 'center', marginBottom: hScale(22), lineHeight: hScale(20) },
  emptyBtn: { width: '100%', paddingVertical: hScale(13), borderRadius: wScale(10), alignItems: 'center' },
  emptyBtnText: { color: '#fff', fontSize: wScale(15), fontWeight: '600' },
});

export default Profile;