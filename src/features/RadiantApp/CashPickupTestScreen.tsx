import { translate } from "../../utils/languageUtils/I18n";
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import AppBarSecond from "../drawer/headerAppbar/AppBarSecond";
import CalendarCmssvg from "../drawer/svgimgcomponents/CalendarCmssvg";
import { wScale } from "../../utils/styles/dimensions";

export default function RCEPayoutScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <AppBarSecond title={'RCE Payout Information'} />


      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.monthRow}>
            <View style={styles.monthBox}>
            <CalendarCmssvg />
            <View style={{}}>
              <Text style={styles.monthValue}>{translate("Previous_Month")}</Text>
              <Text style={styles.monthValue}>{translate("Your_PayOut_Info")}</Text>
            </View>
          </View>

          <View style={styles.monthBox}>
            <CalendarCmssvg />
            <View style={{}}>
              <Text style={styles.monthValue}>{translate("Previous_Month")}</Text>
              <Text style={styles.monthValue}>{translate("Your_PayOut_Info")}</Text>
            </View>
          </View>

          <View style={styles.monthBox}>
            <CalendarCmssvg />
            <View>
              <Text style={styles.monthValue}>{translate("Current_Month")}</Text>
              <Text style={styles.monthValue}>{translate("Your_PayOut_Info")}</Text>
            </View>
          </View>
        </View>

        {/* Note */}
        <Text style={styles.note}>{translate("key_noteallt_160")}</Text>

        {/* Monthly Payout */}
        <Text style={styles.sectionTitle}>{translate("December_2025_Monthly_Payout")}</Text>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>{translate("Your_Work_Method")}</Text>
          <Text style={styles.tableHeaderText}>{translate("Employment_Type")}</Text>
        </View>

        {/* Table Row */}
        <View style={styles.tableRow}>
          <Text style={styles.tableCell}>{translate("Wallet_Deposit_Mixed")}</Text>
          <Text style={styles.tableCell}>{translate("Day_Pickup_All_Days")}</Text>
        </View>

        {/* Empty rows (for layout like image) */}
        {[1, 2, 3].map((_, i) => (
          <View key={i} style={styles.tableRow}>
            <Text style={styles.tableCell}></Text>
            <Text style={styles.tableCell}></Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <Text style={styles.navItem}>{translate("Home")}</Text>
        <Text style={styles.navItem}>{translate("Wallet")}</Text>
        <Text style={styles.navItem}>{translate("Account")}</Text>
        <Text style={styles.navItemActive}>{translate("Report")}</Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6f8",
  },

  header: {
    backgroundColor: "#4a6ee0",
    padding: 16,
    alignItems: "center",
  },

  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },

  content: {
    padding: 16,
  },

  monthRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  monthBox: {
    width: "33%",
    backgroundColor: "#e8ebff",
    paddingHorizontal: wScale(5),
    borderRadius: 10,
    alignItems: "center",
    flexDirection: 'row',
    paddingVertical: 5,
    justifyContent: 'space-between',

  },

  monthLabel: {
    fontSize: 12,
    color: "#555",
  },

  monthValue: {
    fontSize: 12,
    color: '#000'
  },

  note: {
    color: "red",
    fontSize: 12,
    marginVertical: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 10,
    textAlign: "center",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1f2937",
    padding: 10,
  },

  tableHeaderText: {
    flex: 1,
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
  },

  tableRow: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },

  tableCell: {
    flex: 1,
    padding: 14,
    textAlign: "center",
    color: "#333",
  },

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },

  navItem: {
    color: "#777",
  },

  navItemActive: {
    color: "#4a6ee0",
    fontWeight: "bold",
  },
});
