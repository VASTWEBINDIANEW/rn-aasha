import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Share,
  StatusBar,
} from 'react-native';
import {
  DrawerContentScrollView,
  createDrawerNavigator,
} from '@react-navigation/drawer';
import Profile from './Profile';
import Help_And from './Help';
import Security from './Security';
import ReferAndEran from './ReferAndEran';
import Administrator from './Administrator';
import Logout from './Logout';
import { SvgXml } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import Setting from './Setting';
import { translate } from '../../utils/languageUtils/I18n';
import { hScale, wScale } from '../../utils/styles/dimensions';
import DashboardScreen from '../dashboard/DashboardScreen';
import Privacy from './privacy';
import { useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import LoginScreen from '../login/LoginScreen';
import { APP_URLS } from '../../utils/network/urls';
import useAxiosHook from '../../utils/network/AxiosClient';
import { decryptData } from '../../utils/encryptionUtils';
import Notifications from './Notifications';
import LoginReport from './securityPages/LoginReport';
import BorderLine from '../../components/BorderLine';

// ─── Icons (Feather via react-native-vector-icons) ──────────────────────────
import Feather from 'react-native-vector-icons/Feather';

const Drawer = createDrawerNavigator();

// ─── Color tokens ────────────────────────────────────────────────────────────
const COLORS = {
  headerDark1: '#0f172a',
  headerDark2: '#1e3a5f',
  accent: '#4f46e5',       // indigo
  accentLight: '#eef2ff',
  accentText: '#4338ca',
  danger: '#dc2626',
  dangerLight: '#fef2f2',
  white: '#ffffff',
  surface: '#f8fafc',
  border: '#e2e8f0',
  text: '#0f172a',
  textMuted: '#64748b',
  textHint: '#94a3b8',
  green: '#16a34a',
  greenLight: '#f0fdf4',
  badge: '#eef2ff',
  badgeText: '#4338ca',
  notifBadge: '#ef4444',
  notifBadgeText: '#fff',
};

// ─── Nav section keys (static — labels resolved inside component) ────────────
const NAV_SECTION_DEFS = [
  {
    labelKey: 'menuMain',
    fallback: 'Main',
    items: [
      { name: 'Profile',        icon: 'user',        labelKey: 'profile' },
      { name: 'Setting',        icon: 'settings',    labelKey: 'settings' },
    ],
  },
  {
    labelKey: 'menuSecurity',
    fallback: 'Security',
    items: [
      { name: 'Security',       icon: 'shield',      labelKey: 'security' },
      { name: 'Login Report',   icon: 'file-text',   labelKey: 'loginInfo' },
    ],
  },
  {
    labelKey: 'menuMore',
    fallback: 'More',
    items: [
      { name: 'ReferAndEran',   icon: 'share-2',     labelKey: 'refer',         badge: 'Earn' },
      { name: 'Administrator',  icon: 'briefcase',   labelKey: 'administrator' },
      { name: 'Notifications',  icon: 'bell',        labelKey: 'Notifications', notifCount: 3 },
      { name: 'Help_And',       icon: 'help-circle', labelKey: 'help' },
      { name: 'Privacy Policy', icon: 'lock',        labelKey: 'privacy' },
      { name: 'ShareApp',       icon: 'send',        labelKey: 'shareApp' },
    ],
  },
];

// ─── Custom Drawer Content ────────────────────────────────────────────────────
const CustomDrawerContent = (props: any) => {
  const { get } = useAxiosHook();
  const { colorConfig, IsDealer, userId } = useSelector(
    (state: RootState) => state.userInfo,
  );
  const [adminData, setAdminData] = useState<any>(null);
  const [latestVersion, setLatestVersion] = useState<any>({});
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Returns a clean absolute URL for any photo path the API returns
  const resolvePhotoUrl = (path: string): string => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const base = APP_URLS.baseWebUrl.replace(/\/$/, ''); // strip trailing slash
    const photo = path.startsWith('/') ? path : `/${path}`;
    return `http://${base}${photo}`;
  };

  // Normalise both retailer & dealer response shapes into one object
  const normaliseProfile = (raw: any, isDealer: boolean) => {
    if (!raw) return null;
    return {
      firmName : raw.firmName  ?? raw.FirmName  ?? raw.firm_name  ?? '',
      // Retailer uses "Photo"; dealer API may use "photo", "Profile", "ProfilePic" etc.
      Photo    : raw.Photo     ?? raw.photo      ?? raw.Profile   ?? raw.ProfilePic ?? raw.profile_pic ?? '',
    };
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!IsDealer) {
          const res = await get({ url: APP_URLS.getProfile });
          if (res?.data) {
            const data = JSON.parse(decryptData(res.value1, res.value2, res.data));
            console.log('[Drawer] retailer profile keys:', Object.keys(data));
            console.log('[Drawer] retailer Photo value:', data.Photo);
            setAdminData(normaliseProfile(data, false));
          }
        } else {
          const dealer = await get({ url: `${APP_URLS.dealer_profile}dlmid=${userId}` });
          console.log('[Drawer] dealer profile keys:', Object.keys(dealer ?? {}));
          setAdminData(normaliseProfile(dealer, true));
        }
      } catch (e) {
        console.log('Profile fetch error:', e);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const version = await get({ url: APP_URLS.current_version });
        setLatestVersion(version);
      } catch (e) {
        console.error('Version fetch error:', e);
      }
    };
    fetchVersion();
  }, []);

  const shareApp = async () => {
    try {
      await Share.share({
        message: `📱 Download ${APP_URLS.AppName} http://${APP_URLS.baseWebUrl}${APP_URLS.DownloadAPK}`,
        title: `Download ${APP_URLS.AppName}`,
      });
    } catch (e) {
      console.log('Share error:', e);
    }
  };

  const activeRoute = props.state?.routeNames?.[props.state?.index] ?? 'Dashboard';

  // Pull current language from redux so this re-renders on language change
  const { language } = useSelector((state: RootState) => state.userInfo);

  // Resolve all translate() calls inside component so language changes re-render correctly
  const NAV_SECTIONS = useMemo(() => {
    return NAV_SECTION_DEFS.map((section) => ({
      label: translate(section.labelKey) || section.fallback,
      items: section.items.map((item) => ({
        ...item,
        label: translate(item.labelKey) || item.labelKey,
      })),
    }));
  }, [language]);

  const LOGOUT_LABEL = translate('logout') || 'Logout';
  const MEMBER_LABEL =IsDealer  ? translate('Dealer') : translate('Retailer');

  const handleNavPress = (name: string) => {
    if (name === 'Logout') {
      setLogoutVisible(true);
      return;
    }
    if (name === 'ShareApp') {
      shareApp();
      return;
    }
    props.navigation.navigate(name);
  };

  return (
    <>
      <View style={styles.drawerRoot}>
        {/* ── Header ── */}
        <LinearGradient
          colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.avatarOuter}>
            {adminData?.Photo && !imgError ? (
              <Image
                source={{ uri: resolvePhotoUrl(adminData.Photo) }}
                style={styles.avatarImg}
                onError={(e) => {
                  console.log('[Drawer] Image load error:', e.nativeEvent.error);
                  console.log('[Drawer] Failed URL:', resolvePhotoUrl(adminData.Photo));
                  setImgError(true);
                }}
                onLoad={() => console.log('[Drawer] Image loaded OK:', resolvePhotoUrl(adminData.Photo))}
              />
            ) : (
              <View style={styles.avatarFallback}>
                <Feather name="user" size={wScale(30)} color="rgba(255,255,255,0.8)" />
              </View>
            )}
          </View>
          <Text style={styles.headerName} numberOfLines={1}>
            {adminData?.firmName ?? APP_URLS.AppName}
          </Text>
          <Text style={styles.headerSub}>{MEMBER_LABEL}</Text>
        </LinearGradient>

        {/* ── Nav Items ── */}
        <ScrollView
          style={styles.navScroll}
          showsVerticalScrollIndicator={false}
        >
          {NAV_SECTIONS.map((section) => (
            <View key={section.label}>
              <Text style={styles.sectionLabel}>{section.label}</Text>
              {section.items.map((item) => {
                const isActive = activeRoute === item.name;
                const label = item.label;
                return (
                  <TouchableOpacity
                    key={item.name}
                    style={[styles.navItem, isActive && styles.navItemActive]}
                    onPress={() => handleNavPress(item.name)}
                    activeOpacity={0.7}
                  >
                    {isActive && <View style={styles.activeBar} />}
                    <View
                      style={[
                        styles.iconWrap,
                        isActive && styles.iconWrapActive,
                      ]}
                    >
                      <Feather
                        name={item.icon}
                        size={wScale(18)}
                        color={isActive ? COLORS.accentText : COLORS.textMuted}
                      />
                    </View>
                    <Text
                      style={[
                        styles.navLabel,
                        isActive && styles.navLabelActive,
                      ]}
                      numberOfLines={1}
                    >
                      {label}
                    </Text>

                    {/* Badge: notification count */}
                    {item.notifCount ? (
                      <View>
                      </View>
                    ) : item.badge ? (
                      <View style={styles.textBadge}>
                        <Text style={styles.textBadgeText}>{item.badge}</Text>
                      </View>
                    ) : (
                      <Feather name="chevron-right" size={wScale(14)} color={COLORS.textHint} />
                    )}
                  </TouchableOpacity>
                );
              })}
              <View style={styles.sectionDivider} />
            </View>
          ))}

          {/* ── Logout ── */}
          <TouchableOpacity
            style={[styles.navItem, styles.logoutItem]}
            onPress={() => setLogoutVisible(true)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconWrap, styles.iconWrapDanger]}>
              <Feather name="log-out" size={wScale(18)} color={COLORS.danger} />
            </View>
            <Text style={styles.logoutLabel}>{LOGOUT_LABEL}</Text>
          </TouchableOpacity>

          <View style={{ height: hScale(20) }} />
        </ScrollView>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={[styles.footerAppName,{color:colorConfig.primaryColor,}]}>
            {latestVersion?.PackageName ?? APP_URLS.AppName}
          </Text>
          <View style={[styles.versionPill,{backgroundColor:`${colorConfig.primaryColor}1D`,}]}>
            <Text style={[styles.versionText,{color:colorConfig.primaryColor,}]}>
              v{latestVersion?.currentversion ?? '—'}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Logout Modal ── */}
      <Modal
        visible={logoutVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLogoutVisible(false)}
      >
        <Logout onClose={() => setLogoutVisible(false)} />
      </Modal>
    </>
  );
};

// ─── Drawer Navigator ─────────────────────────────────────────────────────────
const DrawerNavigation = ({ navigation }: any) => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: COLORS.white,
          width: wScale(300),
        },
        // Individual item styles are handled inside CustomDrawerContent;
        // these options prevent the default item list from showing.
        drawerItemStyle: { display: 'none' },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Dashboard"     component={DashboardScreen} />
      <Drawer.Screen name="Profile"       component={Profile} />
      <Drawer.Screen name="Setting"       component={Setting} />
      <Drawer.Screen name="Help_And"      component={Help_And} />
      <Drawer.Screen name="Security"      component={Security} />
      <Drawer.Screen name="Login Report"  component={LoginReport} />
      <Drawer.Screen name="ReferAndEran"  component={ReferAndEran} />
      <Drawer.Screen name="Administrator" component={Administrator} />
      <Drawer.Screen name="Privacy Policy" component={Privacy} />
      <Drawer.Screen name="ShareApp"      component={DashboardScreen} />
      <Drawer.Screen name="Notifications" component={Notifications} />
      <Drawer.Screen name="Logout"        component={Logout} />
    </Drawer.Navigator>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Root
  drawerRoot: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  // Header
  header: {
    paddingTop: hScale(48),
    paddingBottom: hScale(24),
    paddingHorizontal: wScale(20),
    alignItems: 'center',
    gap: hScale(8),
  },
  avatarOuter: {
    width: wScale(72),
    height: wScale(72),
    borderRadius: wScale(18),
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hScale(4),
    overflow: 'hidden',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  headerName: {
    fontSize: wScale(16),
    fontWeight: '600',
    color: COLORS.white,
    letterSpacing: 0.2,
  },
  headerSub: {
    fontSize: wScale(12),
    color: 'rgba(255,255,255,0.5)',
    marginTop: hScale(-4),
  },

  // Scroll
  navScroll: {
    flex: 1,
  },

  // Section
  sectionLabel: {
    fontSize: wScale(10),
    fontWeight: '600',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: COLORS.textHint,
    paddingHorizontal: wScale(20),
    paddingTop: hScale(16),
    paddingBottom: hScale(4),
  },
  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: wScale(20),
    marginTop: hScale(4),
  },

  // Nav item
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hScale(11),
    paddingHorizontal: wScale(20),
    position: 'relative',
    gap: wScale(12),
  },
  navItemActive: {
    backgroundColor: COLORS.accentLight,
  },
  activeBar: {
    position: 'absolute',
    left: 0,
    top: hScale(6),
    bottom: hScale(6),
    width: wScale(3),
    backgroundColor: COLORS.accent,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
  },
  iconWrap: {
    width: wScale(34),
    height: wScale(34),
    borderRadius: wScale(9),
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: COLORS.accentLight,
  },
  iconWrapDanger: {
    backgroundColor: COLORS.dangerLight,
  },
  navLabel: {
    flex: 1,
    fontSize: wScale(14),
    color: COLORS.text,
    fontWeight: '400',
  },
  navLabelActive: {
    color: COLORS.accentText,
    fontWeight: '500',
  },

  // Badges
  notifBadge: {
    backgroundColor: COLORS.notifBadge,
    minWidth: wScale(20),
    height: wScale(20),
    borderRadius: wScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wScale(5),
  },
  notifBadgeText: {
    fontSize: wScale(11),
    color: COLORS.notifBadgeText,
    fontWeight: '600',
  },
  textBadge: {
    backgroundColor: COLORS.badge,
    borderRadius: wScale(20),
    paddingHorizontal: wScale(8),
    paddingVertical: hScale(2),
  },
  textBadgeText: {
    fontSize: wScale(11),
    color: COLORS.badgeText,
    fontWeight: '500',
  },

  // Logout
  logoutItem: {
    marginTop: hScale(4),
  },
  logoutLabel: {
    flex: 1,
    fontSize: wScale(14),
    color: COLORS.danger,
    fontWeight: '500',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wScale(20),
    paddingVertical: hScale(14),
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerAppName: {
    fontSize: wScale(12),
    color: COLORS.textHint,
  },
  versionPill: {
    backgroundColor: COLORS.surface,
    borderRadius: wScale(20),
    paddingHorizontal: wScale(10),
    paddingVertical: hScale(3),
    borderWidth: 0.5,
    borderColor: COLORS.border,
  },
  versionText: {
    fontSize: wScale(11),
    color: COLORS.textMuted,
  },
});

export default DrawerNavigation;