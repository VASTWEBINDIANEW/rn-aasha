import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, Image, Platform, Linking, Animated,
} from 'react-native';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import { BalanceType } from '../utils';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { decryptData } from '../../../utils/encryptionUtils';
import { DrawerActions, useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useLocationHook } from '../../../hooks/useLocationHook';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { setRceIdStatus } from '../../../reduxUtils/store/userInfoSlice';
import { translate } from '../../../utils/languageUtils/I18n';

const HEADER_ICON_SIZE = wScale(22);
const HEADER_ICON_COLOR = '#FFFFFF';

interface HeaderIconBtnProps {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  onPress?: () => void;
  onLongPress?: () => void;
  color?: string;
  badge?: React.ReactNode;
}

const HeaderIconBtn = ({ name, onPress, onLongPress, color = HEADER_ICON_COLOR, badge }: HeaderIconBtnProps) => (
  <TouchableOpacity
    style={styles.iconBtn}
    onPress={onPress}
    onLongPress={onLongPress}
    activeOpacity={0.7}
  >
    <MaterialCommunityIcons name={name} size={HEADER_ICON_SIZE} color={color} />
    {badge}
  </TouchableOpacity>
);

// ─── Types ────────────────────────────────────────────────────────────────────
interface ExtendedBalanceType extends BalanceType {
  cmsremainbal?: string | number;
  holdandleanbal?: string | number;
}

type CardAlign = 'left' | 'center' | 'right';

interface BalanceCardProps {
  label: string;
  value: string | number | undefined | null;
  accentColor: string;
  align?: CardAlign;
  delay?: number;
}

// ─── Balance Card ─────────────────────────────────────────────────────────────
const BalanceCard = memo(({ label, value, accentColor, align = 'left', delay = 0 }: BalanceCardProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  const isRight = align === 'right';
  const textAlign = align; // 'left' | 'center' | 'right'
  const { colorConfig, IsDealer, Loc_Data } = useSelector((state: RootState) => state.userInfo);

  return (
    <Animated.View style={[styles.cardWrapper,
    { opacity: fadeAnim, flexDirection: isRight ? 'row-reverse' : 'row', backgroundColor: "rgba(255,255,255,0.04)", }]}>
      <View style={[styles.card, {
        alignItems: align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start'
      }]}>
        <Text style={[styles.cardLabel, { textAlign: align }]} numberOfLines={1}>{label}</Text>
        <Text style={[styles.cardValue, { textAlign: align }]} numberOfLines={1} adjustsFontSizeToFit>
          {value != null ? value.toString() : '0.00'}
        </Text>
      </View>
    </Animated.View>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────
const DashboardHeader = ({ refreshPress }) => {
  const { colorConfig, IsDealer, Loc_Data } = useSelector((state: RootState) => state.userInfo);
  const { get, post } = useAxiosHook();
  const [balanceInfo, setBalanceInfo] = useState<ExtendedBalanceType | undefined>();
  const [firmname, setfirmName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifPermission, setIsNotifPermission] = useState(false);

  const navigation = useNavigation();
  const { isgps, latitude, longitude } = useLocationHook();
  const dispatch = useDispatch();

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
        // Yahan humne conditional checking laga di hai taaki bina data ke decrypt call na ho
        const decryptedData: ExtendedBalanceType = {
          adminfarmname: decryptData(data.kkkk, data.vvvv, data.adminfarmname),
          posremain: decryptData(data.kkkk, data.vvvv, data.posremain),
          remainbal: decryptData(data.kkkk, data.vvvv, data.remainbal),
          frmanems: decryptData(data.kkkk, data.vvvv, data.frmanems),

          // Agar data exist karega tabhi decrypt hoga, nahi toh render nahi hoga (undefined rahega)
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

      // RCE ID checks
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
  }, [get]);

  // ─── Load notifications from storage ─────────────────────────────────────
  useEffect(() => {
    AsyncStorage.getItem('notifications')
      .then((stored) => {
        if (stored) setNotifications(JSON.parse(stored));
      })
      .catch((e) => console.error('Notifications load error:', e));
  }, []);

  // ─── Notification permission ──────────────────────────────────────────────
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

  useFocusEffect(
    useCallback(() => {
      getData();
      checkNotifPermission();
    }, [isgps, latitude, longitude, Loc_Data.long])
  );

  const longPress = useCallback(() => {
    alert(`${latitude.length}\n${longitude.length}`);
  }, [latitude, longitude]);

  // ─── Balance card config ──────────────────────────────────────────────────
  const balanceCards: BalanceCardProps[] = [
    {
      label: translate('Main Balance'),
      value: balanceInfo?.remainbal,
      accentColor: '#81C784',
      align: 'left',
      delay: 0
    },
    {
      label: translate('Pos Balance'),
      value: balanceInfo?.posremain,
      accentColor: colorConfig.primaryColor,
      align: 'center',
      delay: 80
    },
    // Agar IsDealer false hoga, sirf tabhi yeh niche ke dono cards list me aayenge
    ...(!IsDealer ? [
      {
        label: translate('CMS Balance'),
        value: balanceInfo?.cmsremainbal,
        accentColor: '#FFB74D',
        align: 'center',
        delay: 160
      },
      {
        label: translate('Hold & Lean'),
        value: balanceInfo?.holdandleanbal,
        accentColor: '#C90909',
        align: 'right',
        delay: 240
      }
    ] : [])
  ];
  const notifCount = notifications.length;

  return (
    <View>
      <View style={styles.innerContainer}>
        {/* ── Top Row ── */}
        <View style={styles.topRow}>

          {/* Left: Menu + Brand */}
          <View style={styles.leftGroup}>
            <HeaderIconBtn
              name="menu"
              onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            />


            <Text
              style={styles.firmName}
              ellipsizeMode="tail"
              numberOfLines={1}
              adjustsFontSizeToFit        // ✅ auto font size adjust karega
              minimumFontScale={0.5}      // minimum 50% of original font size tak jayega
            >
              {firmname}
            </Text>
            {APP_URLS.AppName === 'STdigiPe' && (
              <Image source={require('../../drawer/assets/stdigipe.jpg')} style={styles.brandLogo} />
            )}
          </View>

          <View style={styles.rightGroup}>
            {Loc_Data['isGPS'] && (
              <HeaderIconBtn
                name="map-marker"
                onLongPress={longPress}
                color={Loc_Data['latitude'] ? HEADER_ICON_COLOR : 'rgba(255,255,255,0.35)'}
              />
            )}

            {!IsDealer && (
              <View style={styles.walletWrap}>
                <HeaderIconBtn
                  name="wallet-outline"
                  onPress={() => navigation.navigate({ name: 'PostoMain' })}
                />
                <Text style={styles.towallet}>{translate('to Wallet')}</Text>
              </View>
            )}

            {!IsDealer && (
              <HeaderIconBtn
                name="history"
                onPress={() => navigation.navigate({ name: 'RecentTx' })}
              />
            )}

            {!IsDealer && (
              <HeaderIconBtn
                name="qrcode-scan"
                onPress={() => navigation.navigate({ name: 'QRScanScreen' })}
              />
            )}

            {!IsDealer && (
              <HeaderIconBtn
                name="bell-outline"
                onPress={() => navigation.navigate('Notifications')}
                badge={
                  notifCount > 0 ? (
                    <View style={styles.notiBadge}>
                      <Text style={styles.notiBadgeText}>{notifCount}</Text>
                    </View>
                  ) : null
                }
              />
            )}
          </View>
        </View>
      </View>

      {/* ── 4 Balance Cards ── */}
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
    paddingBottom: hScale(5),
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
    gap: wScale(8),
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // ── Left ──
  brandLogo: { width: wScale(70), height: wScale(30), resizeMode: 'contain', borderRadius: 4 },

  // ── Right icons (uniform size) ──
  iconBtn: {
    width: wScale(36),
    height: wScale(36),
    borderRadius: wScale(18),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: wScale(4),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
  },
  walletWrap: {
    alignItems: 'center',
    marginLeft: wScale(4),
  },
  firmName: {
    fontSize: wScale(20),       // ye max font size rahega
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    maxWidth: wScale(190),
    paddingHorizontal: wScale(4),
    marginLeft: wScale(-7)
  },
  notiBadge: {
    position: 'absolute',
    top: wScale(2),
    right: wScale(2),
    backgroundColor: '#22C55E',
    borderRadius: wScale(8),
    minWidth: wScale(14),
    height: wScale(14),
    paddingHorizontal: wScale(3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  notiBadgeText: { color: '#fff', fontSize: wScale(7), fontWeight: '700' },

  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: wScale(4),
    paddingHorizontal: wScale(8),
  },
  cardWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    marginBottom: hScale(10)
  },
  cardSideAccent: { width: wScale(3) },
  card: {
    flex: 1,
    paddingVertical: hScale(4),
    paddingHorizontal: wScale(4),
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: wScale(9), fontWeight: '600',
    letterSpacing: 0.4, textTransform: 'uppercase',
    marginBottom: hScale(1), color: '#fff',
  },
  cardValue: {
    fontSize: wScale(14), color: '#FFFFFF',
    fontWeight: '700', letterSpacing: 0.2,
  },
  towallet: {
    fontSize: wScale(6),
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: hScale(2),
    textTransform:'capitalize',
    position:'absolute',
    bottom:wScale(-6),
  },
});