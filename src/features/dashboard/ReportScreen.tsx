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

// ─── Constants ─────────────────────────────────────────────────────────────
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
  const props = { color: "#FFFFFF", size: 28 }; // Defaulting to White for neomorphic contrast
  switch (item) {
    case "Recharge & Utilities":        return <RechargeSvg {...props} />;
    case "IMPS/NEFT":
    case "Money Transfer":              return <IMPSsvg {...props} />;
    case "AEPS/AadharPay":              return <AadharPay {...props} />;
    case "M-POS":
    case "POS ATM":                     return <MPOSsvg {...props} />;
    case "M-ATM":
    case "MicroATM Rental Report":      return <Matmsvg {...props} />;
    case "PAN Card":                    return <Pansvg {...props} />;
    case "Cash Deposit":                return <Cashsvg {...props} />;
    case "Flight Booking":              return <Flightsvg {...props} />;
    case "Bus Booking":
    case "Travel":                      return <Bussvg {...props} />;
    case "Payment Gateway":
    case "Add Money":                   return <Paymentsvg {...props} />;
    case "POS Wallet":                  return <Possvg {...props} />;
    case "Wallet Unload":
    case "Cms Wallet Transfer":
    case "Cash Pickup Prepay Report":   return <Walletansvg {...props} />;
    case "Cash Pikup":                  return <RadintPickupSvg {...props} />;
    case "Security":                    return <Finosvg {...props} />;
    default:                            return null;
  }
};

// ─── 3D Neomorphic Card ──────────────────────────────────────────────────────
interface CardProps {
  item: string;
  onPress: (item: string) => void;
  baseColor: string;
}

const ReportCard = React.memo(({ item, onPress, baseColor }: CardProps) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress(item)}
      style={styles.itemWrapper}
    >
      {/* Outer shadow for the dark drop effect */}
      <View style={[styles.cardOuterShadow, { backgroundColor: baseColor }]}>
        
        {/* Gradient for the top-left highlight and bottom-right shadow (3D Extrusion) */}
        <LinearGradient
          colors={["rgba(255,255,255,0.4)", "rgba(0,0,0,0.15)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradientWrapper}
        >
          {/* Actual Card Surface */}
          <View style={[styles.cardSurface, { backgroundColor: baseColor }]}>
            
            {/* Inner Depressed Area for Icon (Looks pressed inside) */}
            <LinearGradient
              colors={["rgba(0,0,0,0.2)", "rgba(255,255,255,0.3)"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconDepressedArea}
            >
              <View style={[styles.iconInnerSurface, { backgroundColor: baseColor }]}>
                {getSvgComponent(item)}
              </View>
            </LinearGradient>

            <Text numberOfLines={2} style={styles.itemText}>
              {translate(item)}
            </Text>

          </View>
        </LinearGradient>

      </View>
    </TouchableOpacity>
  );
});

// ─── Screen ───────────────────────────────────────────────────────────────────
const ReportScreen = () => {
  const navigation = useNavigation<any>();
  const { colorConfig, IsDealer } = useSelector(
    (state: RootState) => state.userInfo
  );

  const baseSurfaceColor = colorConfig.primaryColor;

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
      <ReportCard item={item} onPress={handlePress} baseColor={baseSurfaceColor} />
    ),
    [handlePress, baseSurfaceColor]
  );

  return (
    <View style={[styles.main, { backgroundColor: baseSurfaceColor }]}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <DashboardHeader />

      <View style={[styles.sheet, { backgroundColor: baseSurfaceColor }]}>
        
        {/* Subtle highlight line at the top of the sheet */}
        <View style={styles.sheetTopLine} />

        <FlashList
          data={data}
          renderItem={renderItem}
          keyExtractor={(_, i) => String(i)}
          numColumns={3}
          estimatedItemSize={120}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={Platform.OS === "android"}
        />
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  main: { flex: 1 },

  sheet: {
    flex: 1,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    marginTop: hScale(8),
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.3)",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.1)",
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.1)",
  },
  sheetTopLine: {
    alignSelf: "center",
    marginTop: 14,
    width: wScale(40),
    height: 4,
    backgroundColor: "rgba(255,255,255,0.4)", 
    borderRadius: 999,
  },
  listContent: {
    paddingTop: hScale(20),
    paddingHorizontal: wScale(8),
    paddingBottom: hScale(100),
  },

  // ── Card ──
  itemWrapper: {
    flex: 1,
    padding: wScale(6),
  },
  cardOuterShadow: {
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8, 
  },
  cardGradientWrapper: {
    borderRadius: 20,
    padding: 1.5, 
  },
  cardSurface: {
    borderRadius: 18.5,
    height: hScale(110),
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wScale(4),
  },

  // ── Depressed Icon ──
  iconDepressedArea: {
    height: hScale(48),
    width: hScale(48),
    borderRadius: 24, 
    padding: 1.5,
    marginBottom: hScale(8),
  },
  iconInnerSurface: {
    flex: 1,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.02)" 
  },

  // ── Text ──
  itemText: {
    color: "#FFFFFF", 
    fontSize: wScale(11),
    textAlign: "center",
    fontWeight: "600",
    lineHeight: hScale(14),
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default ReportScreen;