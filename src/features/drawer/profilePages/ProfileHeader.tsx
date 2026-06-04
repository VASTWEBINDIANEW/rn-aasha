import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'react-native-animatable';
import { SvgXml } from 'react-native-svg';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { APP_URLS } from '../../../utils/network/urls';
import { getAssetSource } from '../../../utils/network/NetWorkImages';
import { translate } from '../../../utils/languageUtils/I18n';
import { ProfileData } from './hokes/useProfileData';

const EDIT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="#fff" height="22" width="22" viewBox="0 0 576 512"><path d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"/></svg>`;

interface Props {
  profileData: ProfileData;
  profileImage: string | null;
  isDealer: boolean;
  secondaryColor: string;
  onEditPress: () => void;
}

const ProfileHeader: React.FC<Props> = ({
  profileData, profileImage,
  isDealer, secondaryColor, onEditPress,
}) => (
  <View style={s.card}>
    <View style={s.avatarWrap}>
      <View style={[s.avatarRing, { borderColor: 'rgba(255,255,255,0.7)' }]}>
        <Image
          resizeMode="cover"
          source={
            profileImage
              ? { uri: 'data:image/png;base64,' + profileImage }
              : profileData?.Photo
                ? { uri: `http://${APP_URLS.baseWebUrl}${profileData.Photo}` }
                : getAssetSource('bussiness-man.png')
          }
          style={s.avatarImg}
        />
      </View>
      <TouchableOpacity
        onPress={onEditPress}
        activeOpacity={0.85}
        style={[s.editFab, { backgroundColor: secondaryColor }]}
      >
        <SvgXml xml={EDIT_SVG} />
      </TouchableOpacity>
    </View>

    <Text allowFontScaling={false} style={s.name}>
      {profileData?.Name || 'Your Name'}
    </Text>

    <View style={s.metaRow}>
      <View style={s.rolePill}>
        <Text style={s.rolePillText}>{isDealer ? 'Dealer' : 'Retailer'}</Text>
      </View>
      {profileData?.JoinDate && (
        <Text style={s.joinDate}>{translate('Since')} {profileData.JoinDate}</Text>
      )}
    </View>

    <Text allowFontScaling={false} style={s.note}>
      {translate('Profile Important Note')}
    </Text>
    <Text allowFontScaling={false} style={s.desc}>
      {translate('description')}
    </Text>
  </View>
);

const s = StyleSheet.create({
  card: {
    marginHorizontal: wScale(12),
    backgroundColor: 'rgba(255,255,255,0.13)',
    borderRadius: wScale(16),
    paddingVertical: hScale(16),
    paddingHorizontal: wScale(16),
    alignItems: 'center',
    marginBottom: hScale(4),
  },
  avatarWrap: { position: 'relative', marginBottom: hScale(10) },
  avatarRing: {
    width: wScale(96), height: wScale(96),
    borderRadius: wScale(48), borderWidth: 3,
    padding: wScale(3), backgroundColor: '#fff',
    elevation: 6, overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%', borderRadius: wScale(44) },
  editFab: {
    position: 'absolute', bottom: 0, right: -wScale(2),
    width: wScale(30), height: wScale(30),
    borderRadius: wScale(15),
    justifyContent: 'center', alignItems: 'center',
    elevation: 4,
  },
  name: { fontSize: wScale(20), fontWeight: '700', color: '#fff', marginBottom: hScale(6) },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: wScale(10), marginBottom: hScale(8) },
  rolePill: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)',
    paddingHorizontal: wScale(12), paddingVertical: hScale(3),
    borderRadius: 20,
  },
  rolePillText: { fontSize: wScale(12), fontWeight: '700', color: '#fff' },
  joinDate: { fontSize: wScale(11), color: 'rgba(255,255,255,0.75)' },
  note: { fontSize: wScale(14), fontWeight: '700', color: '#fff', textAlign: 'center', marginBottom: hScale(2) },
  desc: { fontSize: wScale(12), color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: hScale(18) },
});

export default React.memo(ProfileHeader);