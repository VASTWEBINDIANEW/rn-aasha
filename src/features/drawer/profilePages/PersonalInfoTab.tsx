// components/PersonalInfoTab.tsx — CLEAN VERSION

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import FlotingInput from '../securityPages/FlotingInput';
import { translate } from '../../../utils/languageUtils/I18n';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { ProfileData } from './hokes/useProfileData';

const DROPDOWN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 128 128"><path fill="#888" fill-rule="evenodd" d="M20.586 47.836a2 2 0 0 0 0 2.828l39.879 39.879a5 5 0 0 0 7.07 0l39.879-39.879a2 2 0 0 0-2.828-2.828L64.707 87.714a1 1 0 0 1-1.414 0L23.414 47.836a2 2 0 0 0-2.828 0z" clip-rule="evenodd"/></svg>`;
const CALENDAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 448 512"><path fill="#888" d="M152 64H296V24C296 10.7 306.7 0 320 0s24 10.7 24 24V64h40c35.3 0 64 28.7 64 64v320c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128C0 92.7 28.7 64 64 64h40V24C104 10.7 114.7 0 128 0s24 10.7 24 24V64zM48 248c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16s-7.2-16-16-16H64c-8.8 0-16 7.2-16 16z"/></svg>`;

interface Props {
  profileData: ProfileData;
  nameVal: string;
  setNameVal: (v: string) => void;
  selectedGender: string;
  onGenderChange: () => void;
  genderSvg: string;
  stateVal: string;
  districtVal: string;
  districtData: any[];
  onStatePress: () => void;
  onDistrictPress: () => void;
  hasProfileData: boolean;
  onKycPress: () => void;
}

const PersonalInfoTab: React.FC<Props> = (props) => {
  const {
    profileData, nameVal, setNameVal,
    selectedGender, onGenderChange, genderSvg,
    stateVal, districtVal, districtData,
    onStatePress, onDistrictPress,
    hasProfileData, onKycPress,
  } = props;
console.log(profileData,"******************")
  const showKycBanner = hasProfileData && profileData.videokycstatus !== 'Y';
  const isNotDone     = profileData.videokycstatus === 'N';
  const kycColor      = isNotDone ? '#dc2626' : '#b45309';

  return (
    <View>
      {/* KYC Banner */}
      {showKycBanner && (
        <TouchableOpacity
          activeOpacity={0.8} onPress={onKycPress}
          style={[s.kycBanner, {
            backgroundColor: isNotDone ? '#fef2f2' : '#fffbeb',
            borderColor:     isNotDone ? '#fca5a5' : '#fcd34d',
          }]}
        >
          <Text style={s.kycIcon}>{isNotDone ? '🎥' : '⏳'}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[s.kycTitle, { color: kycColor }]}>
              {translate(isNotDone ? 'Continue to video kyc' : 'Pending')}
            </Text>
            <Text style={s.kycSub}>
              {translate(isNotDone
                ? 'Tap to complete your video KYC'
                : 'Your video KYC is under review')}
            </Text>
          </View>
          <Text style={[s.kycArrow, { color: kycColor }]}>›</Text>
        </TouchableOpacity>
      )}

      <FlotingInput label={translate('Your Name')} value={nameVal} autoFocus={false} editable onChangeTextCallback={setNameVal} />

      <View style={s.row}>
        <FlotingInput label={translate('Select Your gender')} value={selectedGender} editable={false} autoFocus={false} />
        <View style={s.icon}>
          <TouchableOpacity onPress={onGenderChange} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <SvgXml xml={genderSvg} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={s.row}>
        <FlotingInput label={translate('Date Of Birth (DD MM YYYY)')} keyboardType="number-pad" value={profileData.dob ?? ''} />
        <View style={s.icon}><SvgXml xml={CALENDAR_SVG} /></View>
      </View>

      <View style={s.row}>
        <FlotingInput label={translate('Select State')} editable={false} value={stateVal} />
        <View style={s.icon}>
          <TouchableOpacity onPress={onStatePress}><SvgXml xml={DROPDOWN_SVG} /></TouchableOpacity>
        </View>
      </View>

      <View style={s.row}>
        <FlotingInput label={translate('Select District')} editable={false} value={districtVal} />
        <View style={s.icon}>
          <TouchableOpacity onPress={() => districtData.length > 0 && onDistrictPress()}>
            <SvgXml xml={DROPDOWN_SVG} />
          </TouchableOpacity>
        </View>
      </View>

      <FlotingInput label={translate('Address')} multiline value={profileData?.Address ?? ''} />
      <FlotingInput label={translate('Area Pincode')} keyboardType="number-pad" value={profileData?.PINCode ?? ''} />
      <FlotingInput label={translate('Registered Mobile')} value={profileData?.Mobile ?? ''} />
      <FlotingInput label={translate('Registered Email ID')} value={profileData?.Email ?? ''} />
    </View>
  );
};

const s = StyleSheet.create({
  row:  { position: 'relative' },
  icon: { position: 'absolute', right: wScale(14), top: hScale(15) },
  kycBanner: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: wScale(12),
    padding: wScale(12), marginBottom: hScale(14),
  },
  kycIcon:  { fontSize: wScale(22), marginRight: wScale(10) },
  kycTitle: { fontSize: wScale(14), fontWeight: '700' },
  kycSub:   { fontSize: wScale(11), color: '#6b7280', marginTop: hScale(1) },
  kycArrow: { fontSize: wScale(26), fontWeight: '300', marginLeft: wScale(8) },
});

export default React.memo(PersonalInfoTab);