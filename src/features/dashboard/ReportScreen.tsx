import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { FlashList } from "@shopify/flash-list";
import LinearGradient from "react-native-linear-gradient";

import { RootState } from "../../reduxUtils/store";
import { hScale, wScale } from "../../utils/styles/dimensions";
import { translate } from "../../utils/languageUtils/I18n";
import DashboardHeader from "./components/DashboardHeader";
import { APP_URLS } from "../../utils/network/urls";

import RechargeSvg from "../drawer/svgimgcomponents/RechargeSvg";
import IMPSsvg from "../drawer/svgimgcomponents/IMPSsvg";
import AadharPay from "../drawer/svgimgcomponents/AdharPaysvg";
import MPOSsvg from "../drawer/svgimgcomponents/M-POSsvg";
import Matmsvg from "../drawer/svgimgcomponents/Matmsvg";
import Pansvg from "../drawer/svgimgcomponents/Pansvg";
import Cashsvg from "../drawer/svgimgcomponents/Cashsvg";
import Flightsvg from "../drawer/svgimgcomponents/Flightsvg";
import Bussvg from "../drawer/svgimgcomponents/Bussvg";
import Paymentsvg from "../drawer/svgimgcomponents/Paymentsvg";
import Possvg from "../drawer/svgimgcomponents/Possvg";
import Walletansvg from "../drawer/svgimgcomponents/Walletansvg";
import Finosvg from "../drawer/svgimgcomponents/Finosvg";
import RadintPickupSvg from "../drawer/svgimgcomponents/RadintPickupSvg";

// ─── Icon colors (pastel for dark bg, same style as AccReportScreen) ──────────
const ICON_COLOR: Record<string, string> = {
  "Recharge & Utilities":       "#A5B4FC",
  "IMPS/NEFT":                  "#93C5FD",
  "Money Transfer":             "#93C5FD",
  "AEPS/AadharPay":             "#6EE7B7",
  "M-POS":                      "#FCD34D",
  "POS ATM":                    "#FCD34D",
  "M-ATM":                      "#FCA5A5",
  "MicroATM Rental Report":     "#FCA5A5",
  "PAN Card":                   "#BFDBFE",
  "Cash Deposit":               "#86EFAC",
  "Flight Booking":             "#7DD3FC",
  "Bus Booking":                "#D8B4FE",
  "Travel":                     "#D8B4FE",
  "Payment Gateway":            "#FDBA74",
  "Add Money":                  "#FDBA74",
  "POS Wallet":                 "#5EEAD4",
  "Wallet Unload":              "#7DD3FC",
  "Cms Wallet Transfer":        "#7DD3FC",
  "Cash Pickup Prepay Report":  "#7DD3FC",
  "Cash Pikup":                 "#FDE68A",
  "Security":                   "#E2E8F0",
};

const DEALER_DATA = [
  "Recharge & Utilities",
  "AEPS/AadharPay",
  "Money Transfer",
  "Add Money",
  "POS ATM",
  "PAN Card",
  "Travel",
  "Security",
  "MicroATM Rental Report",
];

const RETAILER_DATA = [
  "Recharge & Utilities",
  "IMPS/NEFT",
  "AEPS/AadharPay",
  "M-POS",
  "M-ATM",
  "PAN Card",
  "Cash Deposit",
  "Flight Booking",
  "Bus Booking",
  "Payment Gateway",
  "POS Wallet",
  "Wallet Unload",
  "Cash Pikup",
  "Cms Wallet Transfer",
  "Cash Pickup Prepay Report",
];

const ROUTE_MAP: Record<string, string> = {
  "Recharge & Utilities":       "RechargeUtilitisR",
  "IMPS/NEFT":                  "ImpsNeftScreen",
  "Money Transfer":             "ImpsNeftScreen",
  "AEPS/AadharPay":             "AEPSAdharPayR",
  "M-POS":                      "MPosScreenR",
  "POS ATM":                    "MPosScreenR",
  "M-ATM":                      "MatmReport",
  "MicroATM Rental Report":     "MatmReport",
  "PAN Card":                   "PanReport",
  "Cash Deposit":               "cashDepReport",
  "Flight Booking":             "FlightBookReport",
  "Bus Booking":                "BusBookReport",
  "Travel":                     "BusBookReport",
  "Payment Gateway":            "PaymentGReport",
  "Add Money":                  "PaymentGReport",
  "POS Wallet":                 "posreport",
  "Wallet Unload":              "Walletunloadreport",
  "Cash Pikup":                 "CashPicUpReport",
  "Cms Wallet Transfer":        "WalletTransferReport",
  "Cash Pickup Prepay Report":  "RadiantPrepayReport",
  "Security":                   "SecurityReport",
};

const getSvgComponent = (item: string) => {
  const color = ICON_COLOR[item] ?? "#CBD5E1";
  const props = { color, size: 26 };
  switch (item) {
    case "Recharge & Utilities":        return <RechargeSvg {...props} />;
    case "IMPS/NEFT":
    case "Money Transfer":              return <IMPSsvg {...props} />;
    case "AEPS/AadharPay":             return <AadharPay {...props} />;
    case "M-POS":
    case "POS ATM":                    return <MPOSsvg {...props} />;
    case "M-ATM":
    case "MicroATM Rental Report":     return <Matmsvg {...props} />;
    case "PAN Card":                   return <Pansvg {...props} />;
    case "Cash Deposit":               return <Cashsvg {...props} />;
    case "Flight Booking":             return <Flightsvg {...props} />;
    case "Bus Booking":
    case "Travel":                     return <Bussvg {...props} />;
    case "Payment Gateway":
    case "Add Money":                  return <Paymentsvg {...props} />;
    case "POS Wallet":                 return <Possvg {...props} />;
    case "Wallet Unload":
    case "Cms Wallet Transfer":
    case "Cash Pickup Prepay Report":  return <Walletansvg {...props} />;
    case "Cash Pikup":                 return <RadintPickupSvg {...props} />;
    case "Security":                   return <Finosvg {...props} />;
    default:                           return null;
  }
};

// ─── Glow Orbs — colorConfig.primaryColor se ─────────────────────────────────
const GlowOrbs = ({ primaryColor }: { primaryColor: string }) => (
  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    <View style={[styles.orb, {
      top: -80, left: -80,
      width: 240, height: 240,
      backgroundColor: `${primaryColor}80`,
    }]} />
    <View style={[styles.orb, {
      top: 160, right: -100,
      width: 280, height: 280,
      backgroundColor: `${primaryColor}28`,
    }]} />
    <View style={[styles.orb, {
      top: 380, left: 20,
      width: 160, height: 160,
      backgroundColor: "rgba(5,150,105,0.18)",
    }]} />
    <View style={[styles.orb, {
      bottom: 60, right: 10,
      width: 200, height: 200,
      backgroundColor: "rgba(219,39,119,0.16)",
    }]} />
  </View>
);

// ─── Glass Card (LinearGradient — AccReportScreen se match) ──────────────────
interface CardProps {
  item: string;
  onPress: (item: string) => void;
}

const ReportCard = React.memo(({ item, onPress }: CardProps) => {
  const iconColor = ICON_COLOR[item] ?? "#CBD5E1";

  return (
    <View style={styles.itemWrapper}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onPress(item)}
        style={styles.cardOuter}
      >
        {/* Glass base */}
        <LinearGradient
          colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.06)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Top shimmer */}
        <LinearGradient
          colors={["rgba(255,255,255,0.55)", "rgba(255,255,255,0)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.topShimmer}
        />

        {/* Icon glow ring */}
        <View style={[styles.iconGlow, { shadowColor: iconColor }]}>
          <LinearGradient
            colors={[`${iconColor}33`, `${iconColor}11`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconInner}
          >
            {getSvgComponent(item)}
          </LinearGradient>
        </View>

        <Text numberOfLines={2} style={styles.itemText}>
          {translate(item)}
        </Text>
      </TouchableOpacity>
    </View>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────
const ReportScreen = () => {
  const navigation = useNavigation<any>();
  const { colorConfig, IsDealer } = useSelector(
    (state: RootState) => state.userInfo
  );

  const data = useMemo(
    () => (IsDealer ? DEALER_DATA : RETAILER_DATA),
    [IsDealer]
  );

  const handlePress = useCallback(
    (item: string) => {
      const route =
        item === "Recharge & Utilities" && IsDealer
          ? "DealerRechargeHistory"
          : ROUTE_MAP[item];
      if (route) navigation.navigate(route);
    },
    [navigation, IsDealer]
  );

  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <ReportCard item={item} onPress={handlePress} />
    ),
    [handlePress]
  );

  return (
    <View style={styles.main}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Main gradient — colorConfig */}
      <LinearGradient
        colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Glow orbs */}
      <GlowOrbs primaryColor={colorConfig.primaryColor} />

      <DashboardHeader />

      {/* Glass bottom sheet */}
      <View style={styles.sheet}>
        <LinearGradient
          colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.03)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.sheetTopLine} />

        <FlashList
          data={data}
          renderItem={renderItem}
          keyExtractor={(_, i) => String(i)}
          numColumns={3}
          estimatedItemSize={118}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={Platform.OS === "android"}
          drawDistance={400}
        />
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  main: { flex: 1 },

  orb: {
    position:     "absolute",
    borderRadius: 999,
  },

  sheet: {
    flex:                 1,
    borderTopLeftRadius:  28,
    borderTopRightRadius: 28,
    marginTop:            hScale(8),
    overflow:             "hidden",
    borderWidth:          1,
    borderColor:          "rgba(255,255,255,0.15)",
    borderBottomWidth:    0,
  },
  sheetTopLine: {
    position:        "absolute",
    top:             0,
    left:            "20%",
    right:           "20%",
    height:          1.5,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius:    999,
    zIndex:          1,
  },
  listContent: {
    paddingTop:        hScale(16),
    paddingHorizontal: wScale(8),
    paddingBottom:     hScale(100),
  },

  itemWrapper: {
    flex:    1,
    padding: wScale(5),
  },
  cardOuter: {
    borderRadius:      20,
    height:            hScale(110),
    justifyContent:    "center",
    alignItems:        "center",
    paddingHorizontal: wScale(4),
    overflow:          "hidden",
    borderWidth:       1,
    borderColor:       "rgba(255,255,255,0.2)",
    shadowColor:       "rgba(139,92,246,1)",
  },
  topShimmer: {
    position:             "absolute",
    top:                  0,
    left:                 0,
    right:                0,
    height:               hScale(36),
    borderTopLeftRadius:  16,
    borderTopRightRadius: 16,
  },

  iconGlow: {
    marginBottom:  hScale(8),
    shadowOffset:  { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius:  8,
    elevation:     6,
  },
  iconInner: {
    height:         hScale(46),
    width:          hScale(46),
    borderRadius:   13,
    justifyContent: "center",
    alignItems:     "center",
    borderWidth:    1,
    borderColor:    "rgba(255,255,255,0.2)",
  },

  itemText: {
    color:             "rgba(255,255,255,0.9)",
    fontSize:          wScale(10),
    textAlign:         "center",
    fontWeight:        "600",
    lineHeight:        hScale(14),
    paddingHorizontal: 2,
    textShadowColor:   "rgba(0,0,0,0.5)",
    textShadowOffset:  { width: 0, height: 1 },
    textShadowRadius:  3,
  },
});

export default ReportScreen;