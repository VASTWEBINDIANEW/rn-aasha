import { translate } from "../utils/languageUtils/I18n";
import { BottomSheet } from "@rneui/themed";
import React, { useState } from "react";
import { Text, View, StyleSheet, } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../reduxUtils/store";
import { SCREEN_HEIGHT, hScale, wScale } from "../utils/styles/dimensions";
import OnelineDropdownSvg from "../features/drawer/svgimgcomponents/simpledropdown";

const RecentText = ({

}) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  return (
    <View style={styles.main}>

      <Text style={styles.recent}>{translate("View_Recent_5_Transactiontt")}</Text>
      <OnelineDropdownSvg />

    </View>
  );
};
const styles = StyleSheet.create({
  main: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recent: {
    color: "#000",
    textAlign: "right",
    paddingVertical: hScale(10),
    paddingRight:wScale(5)
  },

});
export default RecentText;
