import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import LinearGradient from 'react-native-linear-gradient';
import { SvgXml } from 'react-native-svg';
import Entypo from 'react-native-vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { translate } from '../../../utils/languageUtils/I18n';
import { useLocationHook } from '../../../hooks/useLocationHook';
import { RootState } from '../../../reduxUtils/store';
import OtUpdate from 'react-native-ota-hot-update';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { clearOtaUpdate } from '../../../reduxUtils/store/userInfoSlice';
import firestore from '@react-native-firebase/firestore';
import { wScale } from '../../../utils/styles/dimensions';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';

const backbuttonimg = '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><linearGradient id="a" x1="219.858" x2="478.003" y1="387.123" y2="128.977" gradientTransform="matrix(1 0 0 -1 0 514.05)" gradientUnits="userSpaceOnUse"><stop stop-opacity="1" stop-color="#ff5e45" offset="0.004629617637840665"></stop><stop stop-opacity="1" stop-color="#e5596f" offset="1"></stop></linearGradient><path fill="#fff" d="M385.1 405.7c20 20 20 52.3 0 72.3s-52.3 20-72.3 0L126.9 292.1c-20-20-20-52.3 0-72.3L312.8 34c20-20 52.3-20 72.3 0s20 52.3 0 72.3L235.4 256z" opacity="1" data-original="url(#a)" class=""></path></g></svg>';

// ✅ Shared util — Firestore se OTA details fetch karo


const AppBarSecond = ({
  title,
  actionButton = null,
  onActionPress = null,
  onPressBack = null,
  titlestyle = {},
}) => {
  const { isgps, latitude, longitude } = useLocationHook();
  const { colorConfig, IsOnLoc, Loc_Data, otaHasUpdate, otaLatestVersion } = useSelector(
    (state: RootState) => state.userInfo,
  );
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {get}= useAxiosHook()
const fetchOtaDetails = async () => {
  try {
    // const doc = await firestore()
    //   .collection('otaData')
    //   .doc('otadata')
    //   .collection('rechargedrishti')
    //   .doc('ota')
    //   .get();
    // if (!doc.exists) return null;
    // return doc.data();


          const version = await get({ url: APP_URLS.current_version });
console.log(version)

  return {
      version: version.otaVersion,
      url: version.bundleUrl,
      status: true, // true/false
      currentVersion: version.currentversion ,
      message: version.message,
    };

  } catch (e) {
    console.log('Firestore OTA error:', e);
    return null;
  }
};
  // ── Network State ──────────────────────────────────────────────────────────
  const [netInfo, setNetInfo] = useState<{
    type: string;
    generation: string | null;
    isConnected: boolean;
  }>({ type: 'unknown', generation: null, isConnected: true });

  useEffect(() => {
    const unsub = NetInfo.addEventListener((state: NetInfoState) => {
      setNetInfo({
        type: state.type,
        generation: state.details?.cellularGeneration ?? null,
        isConnected: state.isConnected ?? false,
      });
    });
    return () => unsub();
  }, []);

  const getNetworkInfo = () => {
    if (!netInfo.isConnected) return { label: '✕', color: '#FF3B30' };
    if (netInfo.type === 'wifi') return { label: 'WiFi', color: '#34C759' };
    if (netInfo.type === 'cellular') {
      switch (netInfo.generation) {
        case '5g': return { label: '5G',   color: '#34C759' };
        case '4g': return { label: '4G',   color: '#30D158' };
        case '3g': return { label: '3G',   color: '#FF9500' };
        case '2g': return { label: '2G⚠',  color: '#FF3B30' };
        default:   return { label: 'Cell', color: '#FF9500' };
      }
    }
    return { label: '...', color: '#8E8E93' };
  };

  const { label, color } = getNetworkInfo();

  // ── OTA Update ─────────────────────────────────────────────────────────────
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpdatePress = async () => {
    if (isUpdating || !otaLatestVersion) return;

    const data = await fetchOtaDetails();
    if (!data?.url) return;

    setIsUpdating(true);
    setProgress(0);

    try {
      await OtUpdate.downloadBundleUri(
        ReactNativeBlobUtil,
        data.url,
        Number(otaLatestVersion),
        {
          restartAfterInstall: true,
          restartDelay: 1500,
          updateSuccess() {
            dispatch(clearOtaUpdate());
            setIsUpdating(false);
          },
          updateFail() {
            setIsUpdating(false);
          },
          progress(received, total) {
            if (total > 0) {
              setProgress(Math.floor((received / total) * 100));
            }
          },
        },
      );
    } catch (e) {
      console.log('OTA update error:', e);
      setIsUpdating(false);
    }
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleBack = () => {
    if (onPressBack) onPressBack();
    else navigation.goBack();
  };

  const longPress = useCallback(() => {
    Alert.alert(`${latitude.length}\n${longitude.length}`);
  }, [latitude, longitude]);

  useEffect(() => {
    console.log(Loc_Data['isGPS']);
  }, [isgps, latitude, longitude, IsOnLoc, Loc_Data.long]);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <LinearGradient colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}>

      {/* ✅ OTA Banner */}
      {otaHasUpdate && (
        <TouchableOpacity
          style={styles.updateBanner}
          onPress={handleUpdatePress}
          disabled={isUpdating}
          activeOpacity={0.8}
        >
          <Text style={styles.updateText}>
            {isUpdating
              ? `⬇ Downloading... ${progress}%`
              : `🔄 Update Available v${otaLatestVersion} — Tap to Update`}
          </Text>
        </TouchableOpacity>
      )}

      {/* ✅ Main AppBar Row */}
      <View style={styles.container}>

        {/* Back Button */}
        <TouchableOpacity style={styles.backbutton} onPress={handleBack}>
          <SvgXml xml={backbuttonimg} />
        </TouchableOpacity>

        {/* Title */}
        <Text style={[styles.titletext, titlestyle]} numberOfLines={1}>
          {translate(title)}
        </Text>

        {/* Action Button */}
        {actionButton && onActionPress && (
          <TouchableOpacity style={styles.optionalbtn} onPress={onActionPress}>
            <Text style={{ color: '#FFF' }}>{translate(actionButton)}</Text>
          </TouchableOpacity>
        )}

        {/* Network Badge */}
        <View style={[styles.netBadge, { backgroundColor: color }]}>
          <Text style={styles.netText}>{label}</Text>
        </View>

        {/* GPS Icon */}
        {Loc_Data?.isGPS ? (
          <TouchableOpacity onLongPress={longPress}>
            <Entypo
              name="location"
              size={20}
              color={!Loc_Data?.latitude ? '#fff' : colorConfig.secondaryColor}
            />
          </TouchableOpacity>
        ) : null}

      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  // ── OTA Banner ──
  updateBanner: {
    backgroundColor: '#000000',
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── AppBar ──
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    height: 50,
  },
  backbutton: {
    padding: 8,
  },
  titletext: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  optionalbtn: {
    padding: 6,
  },

  // ── Network Badge ──
  netBadge: {
    paddingHorizontal: wScale(5),
    paddingVertical: 2,
    borderRadius: 6,
    marginRight: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  netText: {
    color: '#fff',
    fontSize: wScale(8),
    fontWeight: '800',
  },
});

export default AppBarSecond;