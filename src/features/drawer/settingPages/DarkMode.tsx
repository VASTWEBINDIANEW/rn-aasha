import React, { useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import AppBarSecond from "../headerAppbar/AppBarSecond";
import Darkmodesvg from "../svgimgcomponents/Darkmodesvg";
import SwitchButton from "./SwitchButton";
import Test2 from "../test2";
import { translate } from "../../../utils/languageUtils/I18n";

const DarkMode = () => {
  return (
    <View style={styles.main}>
      <AppBarSecond title={"dark_mode_setting"} />
      <View style={styles.container}>
        <View style={styles.imgs1}>
          <Darkmodesvg />
        </View>
        <Text style={styles.contant}>{translate("dark_mode_content")}</Text>
        <SwitchButton
         />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  container: {
    paddingHorizontal: wScale(10),
    marginBottom: hScale(10),
  },
  imgs1: {
    marginTop: hScale(20),
    alignSelf: "center",
    marginBottom: hScale(20),
  },
  contant: {
    fontSize: wScale(14),
    textAlign: "justify",
    paddingBottom: hScale(20),
  },
});

export default DarkMode;
