import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { colors } from "../../utils/styles/theme";
import { hScale, wScale } from "../../utils/styles/dimensions";
import LinearGradient from "react-native-linear-gradient";
import DashboardHeader from "./components/DashboardHeader";
import { useSelector } from "react-redux";
import { RootState } from "../../reduxUtils/store";
import StatementSvg from "../../utils/svgUtils/StatementSvg";
import { FlashList } from "@shopify/flash-list";
import CheckBlance from "../../utils/svgUtils/CheckBlance";
import DayEarningReport from "../Acount/DayEarning";
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
import { translate } from "../../utils/languageUtils/I18n";

const AccReportScreen = () => {
  const navigation = useNavigation<any>();
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const getSvgComponent = (item) => {
    switch (item) {
      case "Day Earning":
        return <DayEarnsvg />;
      case "Day Ledger":
        return <DayLedgerSvg />;
      case "Day Book":
        return <DayBookSvg />;
      case "Added Money":
        return <AddedMoneySvg />;
      case "R TO R":
        return <RToRSvg />;
      case "R TO R Report":
        return <RToRiportSvg />;
      case "Fund Receive Report":
        return <FundReceivedSvg />;
      case "Operator Commission":
        return <OperatorCommissionSvg />;
      case "Manage A/C":
        return <ManageAccountSvg />;
      case "Purchase order Report":
        return <PurchaseOrderSvg />;
      case "Dispute Report":
        return <DisputeSvg />;
      case "Other Links":
        return <OtherLinksSvg />;
      default:
        return null;
    }
  };

  const handleItemClick = (item) => {
    switch (item) {
      case "Day Earning":
        navigation.navigate("DayEarningReport");
        break;
      case "Day Ledger":
        navigation.navigate("DayLedgerReport");
        break;
      case "Day Book":
        navigation.navigate("DayBookReport");
        break;
      case "Added Money":
        navigation.navigate("AddedMoneyROTRReport");
        break;
      case "R TO R":
        navigation.navigate("RtorScreen");
        break;
      case "R TO R Report":
        navigation.navigate("RToRReport");
        break;
      case "Fund Receive Report":
        navigation.navigate("FundReceivedReport");
        break;
      case "Operator Commission":
        navigation.navigate("OperatorCommissionReport");
        break;
      case "Manage A/C":
        navigation.navigate("ManageAccount");
        break;
      case "Purchase order Report":
        navigation.navigate("PurchaseOrderReport");
        break;
      case "Dispute Report":
        navigation.navigate("DisputeReport");
        break;

      case "Other Links":
        navigation.navigate("OtherLinks");
        break;
      default:
        break;
    }
  };

  const gridItems = [
    "Day Earning",
    "Day Ledger",
    "Day Book",
    "Added Money",
    "R TO R",
    "R TO R Report",
    "Fund Receive Report",
    "Operator Commission",
    "Manage A/C",
    "Purchase order Report",
    "Dispute Report",
    "Other Links",
  ];
  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <TouchableOpacity
        style={styles.imgview}
        onPress={() => handleItemClick(item)}
      >
        <View>{getSvgComponent(item)}</View>
        <Text style={[styles.itemText, { color: colorConfig.secondaryColor }]}>
          {translate(item)}
        </Text>
      </TouchableOpacity>
    </View>
  );
  return (
    <View style={styles.main}>
      <LinearGradient
        style={{ paddingBottom: wScale(5) }}
        colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
      >
        <DashboardHeader />
      </LinearGradient>
      <View style={styles.container}>
        <FlashList
          data={gridItems}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          numColumns={3}
          estimatedItemSize={120} // Estimate size of each item for better performance
        />
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  main: { flex: 1 },
  container: {
    // paddingHorizontal: wScale(10),
    paddingVertical: hScale(10),
    paddingTop: hScale(30),
    flex: 1,
  },

  item: {
    alignItems: "center",
    marginBottom: hScale(20),
    flex: 1,
  },
  itemText: {
    fontSize: wScale(14),
    textAlign: "center",
    paddingTop: hScale(10),
    fontWeight: "bold",
  },

  imgview: {
    borderRadius: 10,
    width: "80%",
    justifyContent: "center",
    height: hScale(105),
    alignItems: "center",
    // borderWidth: wScale(1),
    marginBottom: hScale(5),
    elevation: 5,
    backgroundColor: "#fff",
  },
});

export default AccReportScreen;
