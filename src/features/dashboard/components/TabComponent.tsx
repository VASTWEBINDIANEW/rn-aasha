import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useDispatch, useSelector } from "react-redux";
import messaging from "@react-native-firebase/messaging";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Utils & Redux
import { RootState } from "../../../reduxUtils/store";
import { setFcmToken } from "../../../reduxUtils/store/userInfoSlice";
import useAxiosHook from "../../../utils/network/AxiosClient";
import { APP_URLS } from "../../../utils/network/urls";
import { translate } from "../../../utils/languageUtils/I18n";
import { hScale, wScale } from "../../../utils/styles/dimensions";

// Screens & SVGs
import HomeScreen from "../HomeScreen";
import WalletScreen from "../WalletScreen";
import ReportScreen from "../ReportScreen";
import AccReportScreen from "../accont";
import DealerHome from "../../Delerpages/DealerTabs/DealerHome";
import Updatebox from "./Update";
import HomeSvg from "../../drawer/svgimgcomponents/homesvg";
import WalletSvg from "../../drawer/svgimgcomponents/Walletsvg";
import Accounttabsvg from "../../drawer/svgimgcomponents/Accounttabsvg";
import ReportSvg from "../../drawer/svgimgcomponents/Reportsvg";

const Tab = createBottomTabNavigator();

// ─── Design Tokens ────────────────────────────────────────────────────────────
const COLORS = {
  bg: "#F0F4FA",
  card: "#FFFFFF",
  shadow: "#B8C6D8",
  inactive: "#9FABBF",
  border: "#E2EAF4",
};

// ─── Tab Item ─────────────────────────────────────────────────────────────────
/*
  Root cause of original crash:
  Ek Animated.Value sirf ek driver se permanently bind hoti hai.
  Pehli animation jo chalti hai woh driver lock kar deta hai.

  Agar ek hi View pe:
    transform   → useNativeDriver: true
    backgroundColor → useNativeDriver: false
  dono ek saath Animated.parallel() mein chalao → CRASH.

  Fix:
  - scaleAnim  → sirf transform (useNativeDriver: true)  → Outer Animated.View
  - glowAnim   → sirf backgroundColor/opacity (useNativeDriver: false) → Inner Animated.View
  - Dono alag Views pe, dono alag chaltey hain — koi conflict nahi
*/
const TabItem = ({
  route,
  isFocused,
  options,
  onPress,
  primary,
}: any) => {
  // Native driver — sirf scale transform ke liye
  const scaleAnim = useRef(new Animated.Value(isFocused ? 1.08 : 1)).current;

  // JS driver — sirf backgroundColor aur opacity ke liye
  const glowAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    // ✅ Alag alag start karo — parallel() mat use karo mixed drivers ke saath
    Animated.spring(scaleAnim, {
      toValue: isFocused ? 1.08 : 1,
      useNativeDriver: true,      // transform ke liye OK
      speed: 20,
      bounciness: isFocused ? 10 : 6,
    }).start();

    Animated.timing(glowAnim, {
      toValue: isFocused ? 1 : 0,
      duration: isFocused ? 220 : 180,
      useNativeDriver: false,     // backgroundColor native driver support nahi karta
    }).start();
  }, [isFocused]);

  const pillBg = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["rgba(255,255,255,0)", "rgba(255,255,255,1)"],
  });

  const labelOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  return (
    <Pressable
      onPress={onPress}
      style={styles.tabItem}
      android_ripple={{ color: "transparent" }}
    >
      {/* Outer layer: scale only → useNativeDriver: true */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>

        {/* Inner layer: backgroundColor only → useNativeDriver: false */}
        <Animated.View
          style={[
            styles.iconPill,
            {
              backgroundColor: pillBg,
              // Static values (non-animated) — driver se conflict nahi
              shadowColor: isFocused ? primary : "transparent",
              shadowOffset: { width: 0, height: isFocused ? 6 : 0 },
              shadowOpacity: isFocused ? 0.22 : 0,
              shadowRadius: isFocused ? 12 : 0,
              elevation: isFocused ? 8 : 0,
              borderWidth: isFocused ? 1.5 : 0,
              borderColor: isFocused ? `${primary}28` : "transparent",
            },
          ]}
        >
          {isFocused && (
            <View
              style={[styles.glossLine, { backgroundColor: `${primary}30` }]}
            />
          )}

          {options.tabBarIcon?.({
            focused: isFocused,
            color: isFocused ? primary : COLORS.inactive,
            size: wScale(22),
          })}
        </Animated.View>
      </Animated.View>

      {/* Label — glowAnim (JS driver) se opacity animate ho rahi hai */}
      <Animated.Text
        style={[
          styles.label,
          {
            color: isFocused ? primary : COLORS.inactive,
            fontWeight: isFocused ? "700" : "500",
            opacity: labelOpacity,
          },
        ]}
      >
        {options.tabBarLabel as string}
      </Animated.Text>

      {isFocused && (
        <View style={[styles.activeDot, { backgroundColor: primary }]} />
      )}
    </Pressable>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const TabComponent = () => {
  const insets = useSafeAreaInsets();
  const { colorConfig, IsDealer, Loc_Data } = useSelector(
    (state: RootState) => state.userInfo
  );
  const { get } = useAxiosHook();
  const [update, setUpdate] = useState(true);
  const dispatch = useDispatch();

  const primary = colorConfig.primaryColor || "#4F46E5";

  useEffect(() => {
    async function checkVersion() {
      try {
        const versionData = await get({ url: APP_URLS.current_version });
        setUpdate(APP_URLS.version === versionData.currentversion);
        const token = await messaging().getToken();
        if (token) dispatch(setFcmToken(token));
      } catch (e) {}
    }
    if (!Loc_Data["isGPS"]) checkVersion();
  }, []);

  if (!update) return <Updatebox isplay={true} />;

  const TAB_HEIGHT = hScale(70);
  const TAB_BOTTOM = insets.bottom + 12;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={({ state, descriptors, navigation }) => (
          <View style={[styles.tabWrapper, { bottom: TAB_BOTTOM }]}>
            <View style={styles.outerShell}>
              <View style={[styles.tabContent, { height: TAB_HEIGHT }]}>
                {state.routes.map((route, index) => {
                  const { options } = descriptors[route.key];
                  const isFocused = state.index === index;

                  const onPress = () => {
                    const event = navigation.emit({
                      type: "tabPress",
                      target: route.key,
                      canPreventDefault: true,
                    });
                    if (!isFocused && !event.defaultPrevented) {
                      navigation.navigate(route.name);
                    }
                  };

                  return (
                    <TabItem
                      key={route.key}
                      route={route}
                      index={index}
                      isFocused={isFocused}
                      options={options}
                      onPress={onPress}
                      primary={primary}
                    />
                  );
                })}
              </View>
            </View>
          </View>
        )}
      >
        <Tab.Screen
          name="Home"
          component={IsDealer ? DealerHome : HomeScreen}
          options={{
            tabBarLabel: translate("home"),
            tabBarIcon: ({ color }) => (
              <HomeSvg size={hScale(22)} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Wallet"
          component={WalletScreen}
          options={{
            tabBarLabel: translate("wallet"),
            tabBarIcon: ({ color }) => (
              <WalletSvg size={hScale(22)} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Account"
          component={AccReportScreen}
          options={{
            tabBarLabel: translate("account"),
            tabBarIcon: ({ color }) => (
              <Accounttabsvg size={hScale(22)} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Report"
          component={ReportScreen}
          options={{
            tabBarLabel: translate("report"),
            tabBarIcon: ({ color }) => (
              <ReportSvg size={hScale(22)} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabWrapper: {
    position: "absolute",
    left: 16,
    right: 16,
  },

  outerShell: {
    borderRadius: 28,
    backgroundColor: COLORS.card,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 18,
    elevation: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.9)",
  },

  tabContent: {
    flexDirection: "row",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: COLORS.bg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },

  iconPill: {
    width: wScale(48),
    height: wScale(48),
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 3,
    overflow: "hidden",
  },

  glossLine: {
    position: "absolute",
    top: 4,
    left: 8,
    right: 8,
    height: 1.5,
    borderRadius: 1,
  },

  label: {
    fontSize: 10.5,
    letterSpacing: 0.4,
    marginTop: 1,
  },

  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },
});