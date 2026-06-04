import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Alert, ActivityIndicator, Image, Platform, Linking, Animated,
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
import { setRceIdStatus } from '../../../reduxUtils/store/userInfoSlice';
import { translate } from '../../../utils/languageUtils/I18n';
import RecentTrSvg from '../../drawer/svgimgcomponents/RecentTrSvg';
import ToselfSvg from '../../drawer/svgimgcomponents/ToselfSvg';

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
    { opacity: fadeAnim, flexDirection: isRight ? 'row-reverse' : 'row', backgroundColor:"rgba(255,255,255,0.04)",  }]}>
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
        const decryptedData: ExtendedBalanceType = {
          adminfarmname: decryptData(data.kkkk, data.vvvv, data.adminfarmname),
          posremain: decryptData(data.kkkk, data.vvvv, data.posremain),
          remainbal: decryptData(data.kkkk, data.vvvv, data.remainbal),
          frmanems: decryptData(data.kkkk, data.vvvv, data.frmanems),
          cmsremainbal: decryptData(data.kkkk, data.vvvv, data.cmsremainbal),
          holdandleanbal: decryptData(data.kkkk, data.vvvv, data.holdandleanbal),
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
    { label: translate('Main Balance'), value: balanceInfo?.remainbal, accentColor: '#81C784', align: 'left', delay: 0 },
    { label: translate('Pos Balance'), value: balanceInfo?.posremain, accentColor: colorConfig.primaryColor, align: 'center', delay: 80 },
    { label: translate('CMS Balance'), value: balanceInfo?.cmsremainbal, accentColor: '#FFB74D', align: 'center', delay: 160 },
    { label: translate('Hold & Lean'), value: balanceInfo?.holdandleanbal, accentColor: '#C90909', align: 'right', delay: 240 },
  ];
  const notifCount = notifications.length;

  return (
    <View>
      <View style={styles.innerContainer}>
        {/* ── Top Row ── */}
        <View style={styles.topRow}>

          {/* Left: Menu + Brand */}
          <View style={styles.leftGroup}>
            {APP_URLS.AppName === 'STdigiPe' ? (
              <TouchableOpacity
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                style={styles.menuBtn}
              >
                {/* <Image source={require('../../drawer/assets/menu2.png')} style={styles.menuImg} /> */}
              </TouchableOpacity>
            ) : (
              <View style={styles.menuview}>
                <MenuIcon />
              </View>

            )}

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

          {/* Right: icons + firm name + notification */}
          <View style={styles.rightGroup}>


            {Loc_Data['isGPS'] && (
              <TouchableOpacity onLongPress={longPress} style={styles.iconBtn}>
                <Entypo
                  name="location"
                  size={15}
                  color={Loc_Data['latitude'] ? '#4FC3F7' : 'rgba(255,255,255,0.3)'}
                />
              </TouchableOpacity>
            )}

           <View>
               <TouchableOpacity  
              style={styles.notiBell}

             onPress={() => navigation.navigate({ name: "PostoMain" })}   
                    >
              <ToselfSvg  size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={{fontSize:wScale(9),color:'#fff',fontWeight:'700',textAlign:'center'}}>
              {translate('to Wallet')}
            </Text>
</View>
            <TouchableOpacity
              style={styles.notiBell}

              onPress={() => navigation.navigate({ name: "RecentTx" })}            >
              <RecentTrSvg size={25} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.notiBell}

              onPress={() => navigation.navigate({ name: "QRScanScreen" })}            >
              <QrcodSvg size={25} color="#fff" />

            </TouchableOpacity>
            <TouchableOpacity
              style={styles.notiRow}
              onPress={() => navigation.navigate('Notifications')}
            >
              <MaterialIcons name="notifications" size={20} color="#fff" style={styles.notiBell} />
              <View style={styles.notiBadge}>
                <Text style={styles.notiBadgeText}>{notifCount}</Text>
              </View>
            </TouchableOpacity>
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
  menuBtn: { padding: wScale(3) },
  menuImg: { width: wScale(26), height: wScale(17), resizeMode: 'contain' },
  brandLogo: { width: wScale(70), height: wScale(30), resizeMode: 'contain', borderRadius: 4 },

  // ── Right ──
  loader: { marginRight: wScale(4) },
  iconBtn: { padding: wScale(4), position: 'relative' },
  notifDot: {
    position: 'absolute', top: wScale(4), right: wScale(4),
    width: wScale(5), height: wScale(5),
    borderRadius: wScale(3), backgroundColor: '#FF5252',
  },
  firmName: {
    fontSize: wScale(20),       // ye max font size rahega
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    maxWidth: wScale(190),
    paddingHorizontal: wScale(4),
    marginLeft: wScale(-5)
  },
  notiRow: { flexDirection: 'row', alignItems: 'center', },
  menuview: {
    backgroundColor: 'rgba(79, 195, 247, 0.12)',
    borderRadius: wScale(30), padding: wScale(5),
    borderWidth: 1, borderColor: 'rgba(79, 195, 247, 0.25)',
    overflow: 'hidden',
  },
  notiBell: {
    // backgroundColor: 'rgba(79, 195, 247, 0.12)',
    borderRadius: wScale(30), padding: wScale(5),
    borderWidth: 1, borderColor: 'rgba(79, 195, 247, 0.25)',
    overflow: 'hidden', marginLeft: wScale(4)
  },
  notiBadge: {
    position: 'absolute', top: -1, right: 0,
    backgroundColor: 'green',
    borderRadius: wScale(10),
    minWidth: wScale(14),
    padding: wScale(3),
    alignItems: 'center',
  },
  notiBadgeText: { color: '#fff', fontSize: wScale(7), fontWeight: '700' },

  // ── Balance Cards ──
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
});