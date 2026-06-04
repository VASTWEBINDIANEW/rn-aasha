import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import FlotingInput from '../securityPages/FlotingInput';
import { translate } from '../../../utils/languageUtils/I18n';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { colors } from '../../../utils/styles/theme';
import { APP_URLS } from '../../../utils/network/urls';
import { DocStatus, ProfileData } from './hokes/useProfileData';
import DocCard from './DocCard';


interface Props {
  profileData: ProfileData;
  firmNameVal: string;
  setFirmNameVal: (v: string) => void;
  aadharNo: string; panNo: string; gst: string;
  aadharStatus: DocStatus; panStatus: DocStatus;
  gstStatus: DocStatus; serviceStatus: DocStatus;
  selfieStatus: DocStatus; addrStatus: DocStatus;
  showLoader: boolean;
  requestCameraPermission: (type: string) => void;
  showUploadOptions: (type: string) => void;
  onViewImage: (path: string, title: string) => void;
}

const BusinessKycTab: React.FC<Props> = ({
  profileData, firmNameVal, setFirmNameVal,
  aadharNo, panNo, gst,
  aadharStatus, panStatus, gstStatus,
  serviceStatus, selfieStatus, addrStatus,
  showLoader,
  requestCameraPermission, showUploadOptions, onViewImage,
}) => {
  const base = `http://${APP_URLS.baseWebUrl}`;
  const clean = (p?: string) => (p ?? '').replace(/^https?:\/\/www\./, 'https://');

  return (
    <View>
      <FlotingInput label={translate('Firm Name')} value={firmNameVal} onChangeTextCallback={setFirmNameVal} />

      {showLoader && (
        <ActivityIndicator size={wScale(36)} style={s.loader} color={colors.black} />
      )}

      <DocCard
        label={translate('Aadhar Card')} value={aadharNo} status={aadharStatus}
        lottieSource={aadharStatus === 'upload'
          ? require('../../../utils/lottieIcons/upload-file.json')
          : require('../../../utils/lottieIcons/View-Docs.json')}
        onPress={() => {
          if (aadharStatus === 'upload') {
            requestCameraPermission('AA');
          } else {
            onViewImage(clean(profileData.aadharcardPath), translate('Aadhar Card (Front Side)'));
          }
        }}
      />

      <DocCard
        label={translate('Pan Card')} value={panNo} status={panStatus}
        lottieSource={panStatus === 'upload'
          ? require('../../../utils/lottieIcons/upload-file.json')
          : require('../../../utils/lottieIcons/View-Docs.json')}
        onPress={() => {
          if (panStatus === 'upload') {
            showUploadOptions('Pan Card');
          } else {
            onViewImage(`${base}${clean(profileData.chkpanpath)}`, translate('Pan Card'));
          }
        }}
      />

      <DocCard
        label={translate('GST IN')} value={gst} status={gstStatus}
        lottieSource={gstStatus === 'upload'
          ? require('../../../utils/lottieIcons/upload-file.json')
          : require('../../../utils/lottieIcons/View-Docs.json')}
        onPress={() => {
          if (!profileData.chkRegistractioncertificatepath) {
            showUploadOptions('GST IN');
          } else {
            onViewImage(`${base}${profileData.chkRegistractioncertificatepath}`, translate('GST IN'));
          }
        }}
      />

      <DocCard
        label={translate('Service Agreement')} value={profileData.Iserviceagreementtatus} status={serviceStatus}
        lottieSource={serviceStatus === 'upload'
          ? require('../../../utils/lottieIcons/upload-file.json')
          : require('../../../utils/lottieIcons/View-Docs.json')}
        onPress={() => {
          if (!profileData.serviceagreementpath) {
            showUploadOptions('Service Agreement');
          } else {
            onViewImage(`${base}${profileData.serviceagreementpath}`, translate('Service Agreement'));
          }
        }}
      />

      <DocCard
        label={translate('Selfie with Shop')} status={selfieStatus}
        lottieSource={selfieStatus === 'upload'
          ? require('../../../utils/lottieIcons/upload-file.json')
          : require('../../../utils/lottieIcons/View-Docs.json')}
        onPress={() => {
          if (!profileData.chkShopwithSalfie) {
            showUploadOptions('Shop Selfie');
          } else {
            onViewImage(`${base}${profileData.chkShopwithSalfie}`, translate('Selfie with Shop'));
          }
        }}
      />

      <DocCard
        label={translate('Address Proof')} status={addrStatus}
        lottieSource={addrStatus === 'upload'
          ? require('../../../utils/lottieIcons/upload-file.json')
          : require('../../../utils/lottieIcons/View-Docs.json')}
        onPress={() => {
          if (!profileData.chkaadharback) {
            showUploadOptions('Address Proof');
          } else {
            onViewImage(`${base}${clean(profileData.chkaadharback)}`, translate('Address Proof (Back Side)'));
          }
        }}
      />
    </View>
  );
};

const s = StyleSheet.create({
  loader: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 10 },
});

export default React.memo(BusinessKycTab);