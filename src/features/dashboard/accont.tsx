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
import LinearGradient from "react-native-linear-gradient";
import { FlashList } from "@shopify/flash-list";

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

// ─── Icon colors (light pastel for dark bg) ───────────────────────────────────
const ICON_COLOR: Record<string, string> = {
  "Day Earning":           "#6EE7B7",
  "Ledger":                "#93C5FD",
  "Day Ledger":            "#93C5FD",
  "Day & Month Book":      "#7DD3FC",
  "Day Book":              "#7DD3FC",
  "Added Money":           "#FCD34D",
  "R TO R":                "#C4B5FD",
  "Credit Report":         "#FCA5A5",
  "Fund Transfer History": "#A5B4FC",
  "R TO R Report":         "#A5B4FC",
  "Fund Receive Report":   "#86EFAC",
  "Operator Commission":   "#FDE68A",
  "Manage A/C":            "#7DD3FC",
  "Purchase order Report": "#D8B4FE",
  "Dispute Report":        "#FCA5A5",
  "Other Links":           "#CBD5E1",
  "Commission Report":     "#FDBA74",
};

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
  const iconColor = ICON_COLOR[item] ?? "#CBD5E1";
  const props = { color: iconColor, size: 26 };
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

// ─── Floating orbs (no library needed) ───────────────────────────────────────
const GlowOrbs = ({ primaryColor }: { primaryColor: string }) => (
  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    <View style={[styles.orb, {
      top: -80, left: -80,
      width: 240, height: 240,
      backgroundColor: `${primaryColor}80`,   // ✅ aapka color
    }]} />
    <View style={[styles.orb, {
      top: 160, right: -100,
      width: 280, height: 280,
      backgroundColor: `${primaryColor}28`,   // ✅ aapka color
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

// ─── Glass Card (no BlurView — pure RN) ──────────────────────────────────────
interface CardProps {
  item: string;
  onPress: (item: string) => void;
}

const AccReportCard = React.memo(({ item, onPress }: CardProps) => {
  const iconColor = ICON_COLOR[item] ?? "#CBD5E1";

  return (
    <View style={styles.itemWrapper}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onPress(item)}
        style={styles.cardOuter}
      >
        {/* Glass base layer */}
        <LinearGradient
          colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.06)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Top shimmer highlight */}
        <LinearGradient
          colors={["rgba(255,255,255,0)", "rgba(255,255,255,0)"]}
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
const AccReportScreen = () => {
  const navigation = useNavigation<any>();
  const { colorConfig, IsDealer } = useSelector((s: RootState) => s.userInfo);

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
      <AccReportCard item={item} onPress={handlePress} />
    ),
    [handlePress]
  );

  return (
    <View style={styles.main}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />


<LinearGradient
  colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
  start={{ x: 0.1, y: 0 }}
  end={{ x: 0.9, y: 1 }}
  style={StyleSheet.absoluteFillObject}
/>

      {/* Glow orbs */}
      <GlowOrbs  primaryColor={colorConfig.primaryColor}/>

      <DashboardHeader />

      {/* Glass bottom sheet */}
      <View style={styles.sheet}>
        <LinearGradient
          colors={["rgba(255,255,255,0.1)", "rgba(255,255,255,0.03)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        {/* Sheet top shimmer */}
        <View style={styles.sheetTopLine} />

        <FlashList
          data={gridItems}
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

  // ── Orbs ──
  orb: {
    position:      "absolute",
    borderRadius:  999,
  },

  // ── Sheet ──
  sheet: {
    flex:                1,
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

  // ── Card ──
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
   // borderColor:       "rgba(255,255,255,0.2)",
    // Card glow shadow
    //shadowColor:       "rgba(139,92,246,1)",
    // shadowOffset:      { width: 0, height: 4 },
    // shadowOpacity:     0.35,
    // shadowRadius:      12,
    // elevation:         8,
  },
  topShimmer: {
    position:      "absolute",
    top:           0,
    left:          0,
    right:         0,
    height:        hScale(36),
    borderTopLeftRadius:  16,
    borderTopRightRadius: 16,
  },

  // ── Icon ──
  iconGlow: {
    marginBottom:  hScale(8),
    //shadowOffset:  { width: 0, height: 0 },
   // shadowOpacity: 0.8,
   // shadowRadius:  8,
   // elevation:     6,
  },
  iconInner: {
    height:        hScale(46),
    width:         hScale(46),
    borderRadius:  13,
    justifyContent:"center",
    alignItems:    "center",
    borderWidth:   1,
    borderColor:   "rgba(255,255,255,0.2)",
  },

  // ── Label ──
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

export default AccReportScreen;