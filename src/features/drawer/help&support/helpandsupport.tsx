import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { SvgXml } from "react-native-svg";
import { RootState } from "../../../reduxUtils/store";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import AppBar from "../headerAppbar/AppBar";
import useAxiosHook from "../../../utils/network/AxiosClient";
import { APP_URLS } from "../../../utils/network/urls";
import { translate } from "../../../utils/languageUtils/I18n";
import { color } from "@rneui/base";

// ─────────────────────────────────────────────────────────────────────────────
// SVG Icons
// ─────────────────────────────────────────────────────────────────────────────
const ICON_HEADSET = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#ffffff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>`;

const ICON_PHONE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.62 4.86 2 2 0 0 1 3.59 2.68h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.27a16 16 0 0 0 6 6l.93-.93a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;

const ICON_MAIL = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`;

const ICON_CHAT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

const ICON_CALENDAR = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;

const ICON_FAQ = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`;

const ICON_ARROW_RIGHT = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`;

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
interface ActionCardProps {
  title: string;
  subtitle: string;
  icon: string;
  gradientColors: [string, string];
  onPress: () => void;
}

interface NavCardProps {
  title: string;
  description: string;
  icon: string;
  gradientColors: [string, string];
  onPress: () => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// PulseDot — animated live indicator
// ─────────────────────────────────────────────────────────────────────────────
const PulseDot: React.FC<{ color: string }> = ({ color }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, { toValue: 1.8, duration: 800, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, { toValue: 0, duration: 800, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.7, duration: 800, useNativeDriver: true }),
        ]),
      ]),
    ).start();
  }, [opacity, scale]);

  return (
    <View style={dotStyles.container}>
      <Animated.View style={[dotStyles.ring, { backgroundColor: color, opacity, transform: [{ scale }] }]} />
      <View style={[dotStyles.core, { backgroundColor: color }]} />
    </View>
  );
};

const dotStyles = StyleSheet.create({
  container: { width: 10, height: 10, alignItems: "center", justifyContent: "center" },
  ring: { position: "absolute", width: 10, height: 10, borderRadius: 5 },
  core: { width: 6, height: 6, borderRadius: 3 },
});

// ─────────────────────────────────────────────────────────────────────────────
// ActionCard
// ─────────────────────────────────────────────────────────────────────────────
const ActionCard: React.FC<ActionCardProps> = ({ title, subtitle, icon, gradientColors, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.97, speed: 20, bounciness: 4, useNativeDriver: true }).start();

  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, speed: 20, bounciness: 4, useNativeDriver: true }).start();

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[cardStyles.card, { transform: [{ scale }] }]}>
        {/* Left gradient icon */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={cardStyles.iconWrap}
        >
          <SvgXml xml={icon} />
        </LinearGradient>

        {/* Text block */}
        <View style={cardStyles.textBlock}>
          <Text style={cardStyles.cardTitle} allowFontScaling={false}>
            {title}
          </Text>
          <Text style={cardStyles.cardSubtitle} numberOfLines={1} ellipsizeMode="tail" allowFontScaling={false}>
            {subtitle}
          </Text>
        </View>

        {/* Right arrow badge */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={cardStyles.arrowBadge}
        >
          <SvgXml xml={ICON_ARROW_RIGHT} />
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const cardStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: wScale(16),
    paddingHorizontal: wScale(14),
    paddingVertical: hScale(13),
    marginBottom: hScale(10),
    elevation: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  iconWrap: {
    width: wScale(48),
    height: wScale(48),
    borderRadius: wScale(14),
    alignItems: "center",
    justifyContent: "center",
    marginRight: wScale(14),
  },
  textBlock: { flex: 1 },
  cardTitle: {
    fontSize: wScale(13),
    fontWeight: "700",
    color: "#111827",
    marginBottom: hScale(4),
  },
  cardSubtitle: {
    fontSize: wScale(12),
    color: "#6b7280",
    fontWeight: "400",
  },
  arrowBadge: {
    width: wScale(34),
    height: wScale(34),
    borderRadius: wScale(10),
    alignItems: "center",
    justifyContent: "center",
    marginLeft: wScale(8),
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// NavCard
// ─────────────────────────────────────────────────────────────────────────────
const NavCard: React.FC<NavCardProps> = ({ title, description, icon, gradientColors, onPress }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () =>
    Animated.spring(scale, { toValue: 0.96, speed: 20, bounciness: 4, useNativeDriver: true }).start();

  const handlePressOut = () =>
    Animated.spring(scale, { toValue: 1, speed: 20, bounciness: 4, useNativeDriver: true }).start();

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={navStyles.touchable}
    >
      <Animated.View style={[navStyles.card, { transform: [{ scale }] }]}>
        {/* Top accent */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={navStyles.accentBar}
        />

        <View style={navStyles.inner}>
          {/* Icon */}
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={navStyles.iconBadge}
          >
            <SvgXml xml={icon} />
          </LinearGradient>

          {/* Title + description */}
          <Text style={navStyles.title} allowFontScaling={false} numberOfLines={2}>
            {title}
          </Text>
          <Text style={navStyles.desc} allowFontScaling={false} numberOfLines={3}>
            {description}
          </Text>
        </View>

        {/* Chevron */}
        <View style={navStyles.chevronWrap}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={navStyles.chevronBadge}
          >
            <SvgXml xml={ICON_ARROW_RIGHT} />
          </LinearGradient>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const navStyles = StyleSheet.create({
  touchable: { flex: 1 },
  card: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: wScale(18),
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    minHeight: hScale(170),
  },
  accentBar: {
    height: hScale(5),
    width: "100%",
  },
  inner: {
    padding: wScale(12),
    flex: 1,
  },
  iconBadge: {
    width: wScale(44),
    height: wScale(44),
    borderRadius: wScale(12),
    alignItems: "center",
    justifyContent: "center",
    marginBottom: hScale(10),
  },
  title: {
    fontSize: wScale(12),
    fontWeight: "700",
    color: "#111827",
    marginBottom: hScale(6),
    lineHeight: hScale(17),
  },
  desc: {
    fontSize: wScale(10),
    color: "#9ca3af",
    lineHeight: hScale(15),
  },
  chevronWrap: {
    position: "absolute",
    bottom: wScale(12),
    right: wScale(12),
  },
  chevronBadge: {
    width: wScale(26),
    height: wScale(26),
    borderRadius: wScale(8),
    alignItems: "center",
    justifyContent: "center",
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// TimingRow
// ─────────────────────────────────────────────────────────────────────────────
interface TimingRowProps {
  day: string;
  time: string;
  isLast?: boolean;
}

const TimingRow: React.FC<TimingRowProps> = ({ day, time, isLast }) => (
  <View>
    <View style={timingStyles.row}>
      <View style={timingStyles.badge}>
        <Text style={timingStyles.badgeText} allowFontScaling={false}>{day}</Text>
      </View>
      <Text style={timingStyles.timeText} allowFontScaling={false}>{time}</Text>
    </View>
    {!isLast && <View style={timingStyles.divider} />}
  </View>
);

const timingStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hScale(5),
  },
  badge: {
    backgroundColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: wScale(10),
    paddingVertical: hScale(3),
    borderRadius: wScale(20),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  badgeText: {
    color: "#ffffff",
    fontSize: wScale(10),
    fontWeight: "600",
  },
  timeText: {
    color: "rgba(255,255,255,0.92)",
    fontSize: wScale(10),
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// HelpAndSupport — Main Screen
// ─────────────────────────────────────────────────────────────────────────────
const HelpAndSupport: React.FC = () => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const navigation = useNavigation();
  const [supportData, setSupportData] = useState<Record<string, string>>({});
  const { get } = useAxiosHook();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(hScale(20))).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]).start();

    // Fetch support info
    const fetchData = async () => {
      try {
        const response = await get({ url: APP_URLS.Support_Information });
        setSupportData(response);
      } catch (_err) {
        // silent fail
      }
    };
    fetchData();
  }, [fadeAnim, get, slideAnim]);

  const handleCall = () => {
    if (supportData.adminmobile) {
      Linking.openURL(`tel:${supportData.adminmobile}`);
    }
  };

  const handleEmail = () => {
    if (supportData.adminemail) {
      const uri = `mailto:${supportData.adminemail}?subject=Support Request`;
      Linking.openURL(uri).catch(() => {});
    }
  };

  const handleComplaint = () => navigation.navigate("Complaint" as never);
  const handleBankHoliday = () => navigation.navigate("Bankholidays" as never);
  const handleFAQ = () => navigation.navigate("FAQs" as never);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Full-screen gradient background */}
      <LinearGradient
        colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative circles */}
      <View style={[styles.circle, styles.circleTop, { backgroundColor: "rgba(255,255,255,0.08)" }]} />
      <View style={[styles.circle, styles.circleBottom, { backgroundColor: "rgba(255,255,255,0.05)" }]} />

      {/* App bar */}
      <AppBar title={"Help & Support"} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── Hero Banner ── */}
        <Animated.View
          style={[
            styles.heroBanner,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Top row: icon + live label + subtext */}
          <View style={styles.heroTopRow}>
            <View style={styles.headsetWrap}>
              <SvgXml xml={ICON_HEADSET} />
            </View>
            
            <View style={styles.heroTextWrap}>
              <View style={styles.liveRow}>
                <PulseDot color={colorConfig.secondaryColor} />
                <Text style={styles.liveLabel} allowFontScaling={false}>
                  {"  "}{translate("Our Customer Care Timing")}
                </Text>
              </View>
              <Text style={styles.heroCustTime} allowFontScaling={false}>
                {translate("Cust Time")}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.heroDivider} />

          {/* Timing rows */}
          <TimingRow
            day={translate("Monday to Friday")}
            time={translate("1030_AM_0740_PM")}
          />
          <TimingRow
            day={translate("Every Saturday")}
            time={translate("1000_AM_0200_PM")}
          />
          <TimingRow
            day={translate("Every Sunday")}
            time={translate("1000_AM_0200_PM")}
            isLast
          />
        </Animated.View>

        {/* ── Content Sheet ── */}
        <View style={styles.sheet}>

          {/* Section: Contact Us */}
          <Text style={styles.sectionLabel} allowFontScaling={false}>
            CONTACT US
          </Text>

          <ActionCard
            title={translate("Customer Care Number")}
            subtitle={supportData.adminmobile ? `+91 ${supportData.adminmobile}` : "–"}
            icon={ICON_PHONE}
            gradientColors={["#667eea", "#764ba2"]}
            onPress={handleCall}
          />

          <ActionCard
            title={translate("Support Email-ID")}
            subtitle={supportData.adminemail ?? "–"}
            icon={ICON_MAIL}
            gradientColors={["#f093fb", "#f5576c"]}
            onPress={handleEmail}
          />

          <ActionCard
            title={translate("Complaint Through Chat Service")}
            subtitle={translate("Complaint")}
            icon={ICON_CHAT}
            gradientColors={["#4facfe", "#00f2fe"]}
            onPress={handleComplaint}
          />

          {/* Spacer */}
          <View style={styles.sectionGap} />

          {/* Section: Quick Access */}
          <Text style={styles.sectionLabel} allowFontScaling={false}>
            {translate('QUICK ACCESS')}
          </Text>

          <View style={styles.navRow}>
            <NavCard
              title={translate("Coming Bank Holidays")}
              description={translate("Bank Holiday")}
              icon={ICON_CALENDAR}
              gradientColors={[colorConfig.primaryColor, "#38f9d7"]}
              onPress={handleBankHoliday}
            />

            <View style={styles.navGap} />

            <NavCard
              title={translate("FAQs")}
              description={translate("FAQ description")}
              icon={ICON_FAQ}
              gradientColors={[colorConfig.secondaryColor, "#fee140"]}
              onPress={handleFAQ}
            />
          </View>

          <View style={styles.bottomPadding} />
        </View>
      </ScrollView>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { },

  // Decorative circles
  circle: { position: "absolute", borderRadius: 999 },
  circleTop: {
    width: wScale(280),
    height: wScale(280),
    top: -wScale(90),
    right: -wScale(60),
  },
  circleBottom: {
    width: wScale(180),
    height: wScale(180),
    top: hScale(200),
    left: -wScale(60),
  },

  scrollContent: {
    paddingBottom: hScale(24),
  },

  // Hero banner (glass card on gradient)
  heroBanner: {
    marginHorizontal: wScale(16),
    marginTop: hScale(10),
    marginBottom: hScale(0),
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: wScale(20),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    padding: wScale(16),
  },
  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hScale(12),
  },
  headsetWrap: {
    width: wScale(58),
    height: wScale(58),
    borderRadius: wScale(29),
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: wScale(12),
  },
  heroTextWrap: { flex: 1 },
  liveRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hScale(4),
  },
  liveLabel: {
    fontSize: wScale(10),
    color: "rgba(255,255,255,0.8)",
  },
  heroCustTime: {
    fontSize: wScale(13),
    fontWeight: "600",
    color: "#ffffff",
    lineHeight: hScale(18),
  },
  heroDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: hScale(8),
  },

  // White sheet
  sheet: {
    backgroundColor: "#f4f6fa",
    borderTopLeftRadius: wScale(26),
    borderTopRightRadius: wScale(26),
    marginTop: hScale(10),
    paddingTop: hScale(24),
    paddingHorizontal: wScale(16),
  },

  sectionLabel: {
    fontSize: wScale(11),
    fontWeight: "700",
    color: "#9ca3af",
    letterSpacing: 1.0,
    marginBottom: hScale(12),
    marginLeft: wScale(2),
  },
  sectionGap: { height: hScale(22) },

  navRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  navGap: { width: wScale(12) },
  bottomPadding: { height: hScale(15) },
});

export default HelpAndSupport;