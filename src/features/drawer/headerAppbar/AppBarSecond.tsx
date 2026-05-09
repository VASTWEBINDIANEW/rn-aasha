import React, { useCallback, useEffect, useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSelector } from "react-redux";
import { RootState } from "../../../reduxUtils/store";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import { useNavigation } from "@react-navigation/native";
import { SvgXml } from "react-native-svg";
import Entypo from "react-native-vector-icons/Entypo"; // or another icon set like MaterialIcons
import { useLocationHook } from "../../../hooks/useLocationHook";

import { translate } from "../../../utils/languageUtils/I18n";

const AppBarSecond = ({
  title,
  actionButton = null,
  onActionPress = null,
  onPressBack = null,
  titlestyle = {},
}) => {
  const { isgps, latitude, longitude } = useLocationHook();
  const backbuttonimg =
    '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><linearGradient id="a" x1="219.858" x2="478.003" y1="387.123" y2="128.977" gradientTransform="matrix(1 0 0 -1 0 514.05)" gradientUnits="userSpaceOnUse"><stop stop-opacity="1" stop-color="#ff5e45" offset="0.004629617637840665"></stop><stop stop-opacity="1" stop-color="#e5596f" offset="1"></stop></linearGradient><path fill="#fff" d="M385.1 405.7c20 20 20 52.3 0 72.3s-52.3 20-72.3 0L126.9 292.1c-20-20-20-52.3 0-72.3L312.8 34c20-20 52.3-20 72.3 0s20 52.3 0 72.3L235.4 256z" opacity="1" data-original="url(#a)" class=""></path></g></svg>';

  const { colorConfig, IsOnLoc, Loc_Data, appLanguage } = useSelector(
    (state: RootState) => state.userInfo,
  );
  const [back, setBack] = useState(false);
  const navigation = useNavigation();
  const handleBack = () => {
    if (onPressBack) {
      onPressBack();
    } else {
      navigation.goBack();
    }
  };
  const longPress = useCallback(() => {
    alert(`${latitude.length}\n${longitude.length}`);
  }, [latitude, longitude]);
  useEffect(() => {
    console.log(Loc_Data["isGPS"]);
  }, [isgps, latitude, longitude, IsOnLoc, Loc_Data.long]);
  return (
    <LinearGradient
      colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
      // start={{x: 0, y: 0.5}}
      // end={{x: 1, y: 0.5}}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.backbutton} onPress={handleBack}>
          <SvgXml xml={backbuttonimg} />
        </TouchableOpacity>
        <Text style={[styles.titletext, titlestyle]}>{translate(title)}</Text>
        {actionButton && onActionPress && (
          <TouchableOpacity style={styles.optionalbtn} onPress={onActionPress}>
            <Text style={{color:'#FFFF'}}>{translate(actionButton)}</Text>
          </TouchableOpacity>
        )}

        {Loc_Data?.isGPS ? (
          <TouchableOpacity onLongPress={() => longPress()}>
            <Entypo
              name="location"
              size={20}
              color={!Loc_Data?.latitude ? "#fff" : colorConfig.secondaryColor}
              style={{ left: wScale(-10) }}
            />
          </TouchableOpacity>
        ) : null}
      </View>
    </LinearGradient>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: hScale(55),
  },
  titletext: {
    fontSize: wScale(25),
    color: "#fff",
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
  },
  backbutton: {
    width: wScale(60),
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: wScale(0.8),
    borderColor: "rgba(255,255,255,0.3)",
  },
  optionalbtn: {
    width: wScale(60),
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
});
export default AppBarSecond;
