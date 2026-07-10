import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, Image, Platform, Linking, Animated,
} from 'react-native';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import MenuIcon from './MenuIcon';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import { BalanceType } from '../utils';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { decryptData } from '../../../utils/encryptionUtils';
import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import QrcodSvg from '../../drawer/svgimgcomponents/QrcodSvg';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useLocationHook } from '../../../hooks/useLocationHook';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { clearOtaUpdate, setRceIdStatus } from '../../../reduxUtils/store/userInfoSlice';
import { translate } from '../../../utils/languageUtils/I18n';
import RecentTrSvg from '../../drawer/svgimgcomponents/RecentTrSvg';
import ToselfSvg from '../../drawer/svgimgcomponents/ToselfSvg';
import ReactNativeBlobUtil from 'react-native-blob-util';
import OtUpdate from 'react-native-ota-hot-update';
import LinearGradient from "react-native-linear-gradient"; // Neomorphism Drop Shadow / Glow

// ─── Types ────────────────────────────────────────────────────────────────────
interface ExtendedBalanceType extends BalanceType {
  cmsremainbal?: string | number;
  holdandleanbal?: string | number;
}

type CardAlign = 'left' | 'center' | 'right';

interface BalanceCardProps {
  label: string;
  value: string | number | undefined | null;
  align?: CardAlign;
  delay?: number;
  baseColor: string;
}

// ─── 3D Neomorphic Balance Card ─────────────────────────────────────────────
const BalanceCard = memo(({ label, value, align = 'left', delay = 0, baseColor }: BalanceCardProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      delay,
      useNativeDriver: true,
    }).start();
  }, [delay, fadeAnim]);

  return (
    <Animated.View style={[styles.cardOuterShadow, { opacity: fadeAnim, backgroundColor: baseColor, flex: 1 }]}>
      <LinearGradient
        colors={["rgba(255,255,255,0.4)", "rgba(0,0,0,0.15)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardGradientWrapper}
      >
        {/* Inner Depressed View (Pressed in) for balances to make them pop */}
        <LinearGradient
          colors={["rgba(0,0,0,0.1)", "rgba(255,255,255,0.15)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardSurface}
        >
          <View style={[styles.cardInnerSurface, {
            backgroundColor: baseColor,
            alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'
          }]}>
            <Text style={[styles.cardLabel, { textAlign: align }]} numberOfLines={1}>{label}</Text>
            <Text style={[styles.cardValue, { textAlign: align }]} numberOfLines={1} adjustsFontSizeToFit>
              {value != null ? value.toString() : '0.00'}
            </Text>
          </View>
        </LinearGradient>
      </LinearGradient>
    </Animated.View>
  );
});

// ─── Neomorphic Icon Button Wrapper ─────────────────────────────────────────
const NeoIconButton = ({ children, onPress, onLongPress, baseColor, badgeCount, label }: any) => {
  return (
    <View style={{ alignItems: 'center' }}>
      <TouchableOpacity
        onPress={onPress}
        onLongPress={onLongPress}
        activeOpacity={0.7}
        style={[styles.iconOuterShadow, { backgroundColor: baseColor }]}
      >
        <LinearGradient
          colors={["rgba(255,255,255,0.4)", "rgba(0,0,0,0.15)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconGradientWrapper}
        >
          <View style={[styles.iconSurface, { backgroundColor: baseColor }]}>
            {children}
            {!!badgeCount && badgeCount > 0 && (
              <View style={styles.notiBadge}>
                <Text style={styles.notiBadgeText}>{badgeCount}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
      {label && <Text style={styles.towallet}>{label}</Text>}
    </View>
  );
};


// ─── Main Component ───────────────────────────────────────────────────────────
const DashboardHeader = ({ refreshPress }: any) => {
  const { colorConfig, IsDealer, Loc_Data, otaHasUpdate, otaLatestVersion } = useSelector((state: RootState) => state.userInfo);
  const { get, post } = useAxiosHook();
  const [balanceInfo, setBalanceInfo] = useState<ExtendedBalanceType | undefined>();
  const [firmname, setfirmName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifPermission, setIsNotifPermission] = useState(false);

  const navigation = useNavigation();
  const { isgps, latitude, longitude } = useLocationHook();
  const dispatch = useDispatch();

  const baseSurfaceColor = colorConfig?.primaryColor || "#D81B60"; // Used for Neomorphism matching

  // ─── Fetch balance & user info ────────────────────────────────────────────
  const getData = useCallback(async () => {
    setIsLoading(true);
    try {
      const userInfo = await get({ url: APP_URLS.getUserInfo });
      const data = userInfo.data;

      if (!IsDealer) {
        const response = await get({ url: APP_URLS.balanceInfo });
        setBalanceInfo(response.data[0]);
      } else {
        const decryptedData: ExtendedBalanceType = {
          adminfarmname: decryptData(data.kkkk, data.vvvv, data.adminfarmname),
          posremain: decryptData(data.kkkk, data.vvvv, data.posremain),
          remainbal: decryptData(data.kkkk, data.vvvv, data.remainbal),
          frmanems: decryptData(data.kkkk, data.vvvv, data.frmanems),
          ...(data.cmsremainbal && {
            cmsremainbal: decryptData(data.kkkk, data.vvvv, data.cmsremainbal)
          }),
          ...(data.holdandleanbal && {
            holdandleanbal: decryptData(data.kkkk, data.vvvv, data.holdandleanbal)
          }),
        };

        setfirmName(decryptedData.adminfarmname as string);
        setBalanceInfo(decryptedData);
      }

      const adminFarmName = decryptData(data.vvvv, data.kkkk, data.adminfarmname);
      setfirmName(adminFarmName);

      const res = await post({ url: APP_URLS.RCEID }).catch(() => null);
      if (res?.Content?.ADDINFO?.sts === false) {
        const res2 = await post({ url: APP_URLS.RadiantCEIntersetCheck }).catch(() => null);
        if (res2 && res2 !== 'Invalid response..') {
          dispatch(setRceIdStatus({
            status: res.Content.ADDINFO.sts,
            status2: res2.Content.ADDINFO.sts,
          }));
        }
      }

      await AsyncStorage.setItem('adminFarmData', JSON.stringify({
        adminFarmName: adminFarmName,
        frmanems: decryptData(data.vvvv, data.kkkk, data.frmanems),
        photoss: data.photoss ? decryptData(data.vvvv, data.kkkk, data.photoss) : '',
      }));
    } catch (error: any) {
      if (error.message !== 'Network Error') {
        console.error('getData error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [get, IsDealer, dispatch]);

  useEffect(() => {
    AsyncStorage.getItem('notifications')
      .then((stored) => {
        if (stored) setNotifications(JSON.parse(stored));
      })
      .catch((e) => console.error('Notifications load error:', e));
  }, []);

  const openSettings = () => {
    if (Platform.OS === 'android') {
      Linking.openSettings().catch(() => null);
    }
  };

  const requestNotifPermission = async () => {
    const result = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
    if (result !== RESULTS.GRANTED) {
      setIsNotifPermission(true);
      Alert.alert(
        'Notification Permission',
        'Enable notifications to stay updated.',
        [
          { text: 'Cancel', onPress: () => null },
          { text: 'Open Settings', onPress: openSettings },
        ],
        { cancelable: false }
      );
    }
  };

  const checkNotifPermission = async () => {
    const result = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
    if (result === RESULTS.DENIED || result === RESULTS.BLOCKED) {
      setIsNotifPermission(true);
      requestNotifPermission();
    }
  };

  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);

  const fetchOtaDetails = async () => {
    try {
      const version = await get({ url: APP_URLS.current_version });
      return {
        version: version.otaVersion,
        url: version.bundleUrl,
        status: true,
        currentVersion: version.currentversion,
        message: version.message,
      };
    } catch (e) {
      console.log('OTA error:', e);
      return null;
    }
  };

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

  useFocusEffect(
    useCallback(() => {
      getData();
      checkNotifPermission();
    }, [isgps, latitude, longitude, Loc_Data.long, getData])
  );

  const longPress = useCallback(() => {
    Alert.alert(`Location Data`, `${latitude}\n${longitude}`);
  }, [latitude, longitude]);

  const balanceCards: BalanceCardProps[] = [
    { label: translate('Main Balance'), value: balanceInfo?.remainbal, align: 'left', delay: 0, baseColor: baseSurfaceColor },
    { label: translate('Pos Balance'), value: balanceInfo?.posremain, align: 'center', delay: 80, baseColor: baseSurfaceColor },
    ...(!IsDealer ? [
      { label: translate('CMS Balance'), value: balanceInfo?.cmsremainbal, align: 'center', delay: 160, baseColor: baseSurfaceColor },
      { label: translate('Hold & Lean'), value: balanceInfo?.holdandleanbal, align: 'right', delay: 240, baseColor: baseSurfaceColor }
    ] : [])
  ];

  const notifCount = notifications.length;

  return (
    <View style={{ backgroundColor: baseSurfaceColor, zIndex: 10 }}>
      <View style={styles.innerContainer}>
        {/* ── Top Row ── */}
        <View style={styles.topRow}>

          {/* Left: Menu + Brand */}
          <View style={styles.leftGroup}>
            {APP_URLS.AppName === 'STdigiPe' ? (
              <NeoIconButton
                baseColor={baseSurfaceColor}
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              >
                {/* Fallback STdigiPe Menu Icon */}
                <MenuIcon />
              </NeoIconButton>
            ) : (
              <NeoIconButton
                baseColor={baseSurfaceColor}
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
              >
                <MenuIcon />
              </NeoIconButton>
            )}

            <Text
              style={styles.firmName}
              ellipsizeMode="tail"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
            >
              {firmname}
            </Text>
          </View>

          {/* Right: Icons */}
          <View style={styles.rightGroup}>
            
            {Loc_Data['isGPS'] && (
              <NeoIconButton baseColor={baseSurfaceColor} onLongPress={longPress}>
                <Entypo name="location" size={20} color={Loc_Data['latitude'] ? '#fff' : 'rgba(255,255,255,0.3)'} />
              </NeoIconButton>
            )}

            {!IsDealer && (
              <NeoIconButton 
                baseColor={baseSurfaceColor} 
                onPress={() => navigation.navigate("PostoMain" as never)}
                label={translate('to Wallet')}
              >
                <ToselfSvg size={18} color="#fff" />
              </NeoIconButton>
            )}

            {!IsDealer && (
              <NeoIconButton 
                baseColor={baseSurfaceColor} 
                onPress={() => navigation.navigate("RecentTx" as never)}
              >
                <RecentTrSvg size={20} color="#fff" />
              </NeoIconButton>
            )}

            {!IsDealer && (
              <NeoIconButton 
                baseColor={baseSurfaceColor} 
                onPress={() => navigation.navigate("QRScanScreen" as never)}
              >
                <QrcodSvg size={20} color="#fff" />
              </NeoIconButton>
            )}

            {!IsDealer && (
              <NeoIconButton 
                baseColor={baseSurfaceColor} 
                onPress={() => navigation.navigate('Notifications' as never)}
                badgeCount={notifCount}
              >
                <MaterialIcons name="notifications" size={20} color="#fff" />
              </NeoIconButton>
            )}
          </View>
        </View>
      </View>

      {/* ── Update Banner ── */}
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

      {/* ── Balance Cards ── */}
      <View style={styles.cardsRow}>
        {balanceCards.map((card, i) => (
          <BalanceCard key={i} {...card} />
        ))}
      </View>
    </View>
  );
};

export default memo(DashboardHeader);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  innerContainer: {
    paddingTop: hScale(4),
    paddingBottom: hScale(10),
    paddingHorizontal: wScale(8),
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wScale(4),
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wScale(4), // Adding gap between NeoIconButtons
  },
  
  // Header Text
  firmName: {
    fontSize: wScale(18),
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    maxWidth: wScale(140),
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // ── Neomorphic Top Action Buttons ──
  iconOuterShadow: {
    borderRadius: 20, // Round buttons
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  iconGradientWrapper: {
    borderRadius: 20,
    padding: 1.5, // 3D stroke
  },
  iconSurface: {
    borderRadius: 18.5,
    height: wScale(34),
    width: wScale(34),
    justifyContent: "center",
    alignItems: "center",
  },
  
  // Badge on notifications
  notiBadge: {
    position: 'absolute', 
    top: -4, 
    right: -2,
    backgroundColor: '#00C853',
    borderRadius: wScale(10),
    minWidth: wScale(14),
    paddingVertical: wScale(1.5),
    paddingHorizontal: wScale(3),
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  notiBadgeText: { 
    color: '#fff', 
    fontSize: wScale(7), 
    fontWeight: '800' 
  },
  towallet: { 
    fontSize: wScale(6), 
    color: '#fff', 
    fontWeight: '700', 
    textAlign: 'center',
    marginTop: hScale(2),
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  // ── Neomorphic Balance Cards ──
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wScale(4),
    paddingHorizontal: wScale(8),
    marginBottom: hScale(8),
  },
  cardOuterShadow: {
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  cardGradientWrapper: {
    borderRadius: 12,
    padding: 1, // subtle outer ring
  },
  cardSurface: {
    borderRadius: 11,
    padding: 1.5, // Inner depressed ring
  },
  cardInnerSurface: {
    borderRadius: 9.5,
    paddingVertical: hScale(6),
    paddingHorizontal: wScale(4),
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: wScale(8), 
    fontWeight: '600',
    letterSpacing: 0.5, 
    textTransform: 'uppercase',
    marginBottom: hScale(2), 
    color: 'rgba(255,255,255,0.85)',
  },
  cardValue: {
    fontSize: wScale(12), 
    color: '#FFFFFF',
    fontWeight: '700', 
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // ── Update Banner ──
  updateBanner: {
    backgroundColor: '#000000',
    paddingVertical: 5,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hScale(8)
  },
  updateText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});