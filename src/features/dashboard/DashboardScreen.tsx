import React, { useCallback, useMemo } from "react";
import {
  Alert,
  Animated,
  StyleSheet,
  TouchableOpacity,
  Text,
  Pressable,
} from "react-native";
import { CurvedBottomBar } from "react-native-curved-bottom-bar";
import WalletScreen from "./WalletScreen";
import HomeScreen from "./HomeScreen";
import ReportScreen from "./ReportScreen";
import LoginScreen from "../login/LoginScreen";
import { wScale } from "../../utils/styles/dimensions";
import { colors } from "../../utils/styles/theme";
import { Tab, TabView } from "@rneui/themed";
import { TabComponent } from "./components/TabComponent";
import AccReportScreen from "./accont";
import { translate } from "../../utils/languageUtils/I18n";

export default function DashboardScreen() {
  const _renderIcon = (routeName, selectedTab) => {
    let tabData = { title: "", icon: "" };

    switch (routeName) {
      case "HomeScreen":
        tabData = { title: translate("dashboard.Home"), icon: "home" };
        break;
      case "WalletScreen":
        tabData = { title: translate("dashboard.Wallet"), icon: "wallet" };
        break;
      case "ReportScreen":
        tabData = { title: translate("dashboard.Report"), icon: "report" };
        break;
      case "AccReportScreen":
        tabData = { title: translate("dashboard.Account"), icon: "login" };
        break;
      default:
        tabData = { title: translate("dashboard.Home"), icon: "home" };
        break;
    }

    return <Text>{tabData.title}</Text>;
  };
  const renderTabBar = useCallback(({ routeName, selectedTab, navigate }) => {
    return (
      <Pressable onPress={() => navigate(routeName)} style={styles.tabbarItem}>
        {_renderIcon(routeName, selectedTab)}
      </Pressable>
    );
  }, []);

  const renderCurvedBottomTabs = useMemo(
    () => (
      <CurvedBottomBar.Navigator
        type="DOWN"
        style={styles.bottomBar}
        shadowStyle={styles.shawdow}
        key={"bottomBar"}
        id="bottomBar1"
        height={55}
        circleWidth={50}
        width={wScale(425)}
        bgColor={colors.module_light_pink}
        initialRouteName="title1"
        borderTopLeftRight
        screenOptions={{ headerShown: false }}
        renderCircle={({ selectedTab, navigate }) => (
          <Animated.View style={styles.btnCircleUp}>
            <Pressable
              style={styles.button}
              onPress={() => Alert.alert(translate("Click Action"))}
            >
              <Text>{translate("dashboard.Scan QR")}</Text>
            </Pressable>
          </Animated.View>
        )}
        tabBar={renderTabBar}
      >
        <CurvedBottomBar.Screen
          name="HomeScreen"
          position="LEFT"
          component={() => <HomeScreen />}
        />
        <CurvedBottomBar.Screen
          name="WalletScreen"
          component={() => <WalletScreen />}
          position="RIGHT"
        />
        <CurvedBottomBar.Screen
          name="ReportScreen"
          component={() => <ReportScreen />}
          position="RIGHT"
        />
        <CurvedBottomBar.Screen
          name="AccReportScreen"
          component={() => <AccReportScreen />}
          position="LEFT"
        />
      </CurvedBottomBar.Navigator>
    ),
    [renderTabBar],
  );

  return <>{<TabComponent />}</>;
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  shawdow: {
    shadowColor: "#DDDDDD",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 5,
  },
  button: {
    flex: 1,
    justifyContent: "center",
  },
  bottomBar: {
    marginBottom: wScale(20),
    justifyContent: "center",
  },
  btnCircleUp: {
    width: wScale(70),
    height: wScale(70),
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.module_light_pink,
    bottom: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 1,
  },
  imgCircle: {
    width: 30,
    height: 30,
    tintColor: "gray",
  },
  tabbarItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  img: {
    width: 30,
    height: 30,
  },
});
