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
import LinearGradient from "react-native-linear-gradient"; // ✅ Using this for true 3D effect

import { RootState } from "../../reduxUtils/store";
import { hScale, wScale } from "../../utils/styles/dimensions";
import { translate } from "../../utils/languageUtils/I18n";
import DashboardHeader from "./components/DashboardHeader";
import { APP_URLS } from "../../utils/network/urls";

import DayEarnsvg from "../drawer/svgimgcomponents/DayEarnsvg";
import DayLedgerSvg from "../drawer/svgimgcomponents/DayLedgerSvg";
import AddedMoneySvg from "../drawer/svgimgcomponents/AddedMoneySvg";
import RToRSvg from "../drawer/svgimgcomponents/RToRSvg";
import FundReceivedSvg from "../drawer/svgimgcomponents/FundReceivedSvg";
import OperatorCommissionSvg from "../drawer/svgimgcomponents/OperatorCommissionSvg";
import ManageAccountSvg from "../drawer/svgimgcomponents/ManageAccountSvg";
import PurchaseOrderSvg from "../drawer/svgimgcomponents/PurchaseOrderSvg";
import DisputeSvg from "../drawer/svgimgcomponents/DisputeSvg";
import OtherLinksSvg from "../drawer/svgimgcomponents/OtherLinksSvg";
import DayBookSvg from "../drawer/svgimgcomponents/DayBookSvg";
import RToRiportSvg from "../drawer/svgimgcomponents/RToRiportSvg";
import Paymentsvg from "../drawer/svgimgcomponents/Paymentsvg";

// ─── Constants ─────────────────────────────────────────────────────────────
const ROUTE_MAP: Record<string, string> = {
  "Day Earning":            "DayEarningReport",
  "Ledger":                 "DayLedgerReport",
  "Day Ledger":             "DayLedgerReport",
  "Day & Month Book":       "DayBookReport",
  "Day Book":               "DayBookReport",
  "Added Money":            "AddedMoneyROTRReport",
  "R TO R":                 "RtorScreen",
  "Fund Transfer History":  "RToRReport",
  "R TO R Report":          "RToRReport",
  "Credit Report":          "CreditReport",
  "Fund Receive Report":    "FundReceivedReport",
  "Operator Commission":    "OperatorCommissionReport",
  "Manage A/C":             "ManageAccount",
  "Purchase order Report":  "PurchaseOrderReport",
  "Dispute Report":         "DisputeReport",
  "Other Links":            "OtherLinks",
  "Commission Report":      "CommissionReport",
};

const getSvgComponent = (item: string) => {
  const props = { color: "#FFFFFF", size: 28 }; // Defaulting to White for contrast
  switch (item) {
    case "Day Earning":             return <DayEarnsvg {...props} />;
    case "Ledger":
    case "Day Ledger":              return <DayLedgerSvg {...props} />;
    case "Day & Month Book":
    case "Day Book":                return <DayBookSvg {...props} />;
    case "Added Money":             return <AddedMoneySvg {...props} />;
    case "R TO R":                  return <RToRSvg {...props} />;
    case "Credit Report":           return <Paymentsvg {...props} />;
    case "Fund Transfer History":
    case "R TO R Report":           return <RToRiportSvg {...props} />;
    case "Fund Receive Report":     return <FundReceivedSvg {...props} />;
    case "Operator Commission":     return <OperatorCommissionSvg {...props} />;
    case "Manage A/C":              return <ManageAccountSvg {...props} />;
    case "Purchase order Report":   return <PurchaseOrderSvg {...props} />;
    case "Dispute Report":          return <DisputeSvg {...props} />;
    case "Other Links":             return <OtherLinksSvg {...props} />;
    case "Commission Report":       return <Paymentsvg {...props} />;
    default:                        return null;
  }
};

// ─── 3D Neomorphic Card ──────────────────────────────────────────────────────
interface CardProps {
  item: string;
  onPress: (item: string) => void;
  baseColor: string;
}

const AccReportCard = React.memo(({ item, onPress, baseColor }: CardProps) => {
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
              colors={["rgba(0,0,0,0.2)", "rgba(255,255,255,0.3)"]} // Dark top, light bottom
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
const AccReportScreen = () => {
  const navigation = useNavigation<any>();
  const { colorConfig, IsDealer } = useSelector((s: RootState) => s.userInfo);

  const baseSurfaceColor = colorConfig.primaryColor;

  const gridItems = useMemo(() => [
    "Day Earning",
    IsDealer ? "Ledger" : "Day Ledger",
    IsDealer ? "Day & Month Book" : "Day Book",
    ...(!IsDealer ? ["Added Money", "R TO R"] : []),
    ...(IsDealer  ? ["Credit Report"]         : []),
    IsDealer ? "Fund Transfer History" : "R TO R Report",
    ...(!IsDealer ? ["Dispute Report"] : []),
    "Fund Receive Report",
    "Operator Commission",
    "Manage A/C",
    "Purchase order Report",
    ...(APP_URLS.AppName === "Maxus Pay" ? ["Commission Report"] : []),
    ...(!IsDealer ? ["Other Links"] : []),
  ], [IsDealer]);

  const handlePress = useCallback(
    (item: string) => {
      const route = ROUTE_MAP[item];
      if (route) navigation.navigate(route);
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: string }) => (
      <AccReportCard item={item} onPress={handlePress} baseColor={baseSurfaceColor} />
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
          data={gridItems}
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
    // Creating a subtle top border for 3D separation
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
    // This provides the dark drop shadow on both OS
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8, 
  },
  cardGradientWrapper: {
    borderRadius: 20,
    padding: 1.5, // This acts as a 3D border stroke
  },
  cardSurface: {
    borderRadius: 18.5,
    height: hScale(110),
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: wScale(4),
  },

  // ── Depressed Icon (Looks carved in) ──
  iconDepressedArea: {
    height: hScale(48),
    width: hScale(48),
    borderRadius: 24, // Perfect circle
    padding: 1.5,
    marginBottom: hScale(8),
  },
  iconInnerSurface: {
    flex: 1,
    borderRadius: 22.5,
    justifyContent: "center",
    alignItems: "center",
    // Slight inner dark tint to emphasize depth
    backgroundColor: "rgba(0,0,0,0.02)" 
  },

  // ── Text ──
  itemText: {
    color: "#FFFFFF", // White text looks best on bright backgrounds
    fontSize: wScale(11),
    textAlign: "center",
    fontWeight: "600",
    lineHeight: hScale(14),
    marginTop: 4,
    // Add text shadow for readability
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default AccReportScreen;