import React from "react";

import { View, Text, Image } from "react-native-animatable";
import LinearGradient from "react-native-linear-gradient";
import { StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { SvgXml } from "react-native-svg";
import { useNavigation } from "@react-navigation/native";
import { hScale, wScale } from "../../../../utils/styles/dimensions";
import DynamicButton from "../../button/DynamicButton";
import AppBarSecond from "../../headerAppbar/AppBarSecond";
import { useSelector } from "react-redux";
import { RootState } from "../../../../reduxUtils/store";
import { translate } from "../../../../utils/languageUtils/I18n";

const DeletUser = () => {
  const userDelete =
    '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="120" height="120" x="0" y="0" viewBox="0 0 64 64" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="m54 19.07-2.67 36.37a5 5 0 0 1-5 4.56H36a1 1 0 0 1 0-2h10.35a3 3 0 0 0 3-2.73L52 18.93a1 1 0 1 1 2 .14ZM59 13a3 3 0 0 1-3 3H20v9a1 1 0 0 1-2 0v-9h-2a3 3 0 0 1 0-6h10V9a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v1h10a3 3 0 0 1 3 3Zm-31-3h16V9a3 3 0 0 0-3-3H31a3 3 0 0 0-3 3Zm-9 41a7 7 0 0 0-7 7s0 .06 0 .09a13.86 13.86 0 0 0 14 0s0-.09 0-.09a7 7 0 0 0-7-7Zm14-5a14 14 0 0 1-5.09 10.79 9 9 0 0 0-6.29-7.4 6 6 0 1 0-5.24 0 9 9 0 0 0-6.29 7.4A14 14 0 1 1 33 46Zm-21 1a1 1 0 0 0-.08-.38 1.15 1.15 0 0 0-.21-.33A1 1 0 0 0 10 47a1.23 1.23 0 0 0 0 .19.6.6 0 0 0 .06.19.76.76 0 0 0 .09.18 1.58 1.58 0 0 0 .12.15A1 1 0 0 0 12 47Zm16 0a1 1 0 0 0-.08-.38.93.93 0 0 0-.21-.33 1 1 0 0 0-.16-.12.56.56 0 0 0-.17-.09.6.6 0 0 0-.19-.06 1 1 0 0 0-.9.27.93.93 0 0 0-.21.33.84.84 0 0 0-.08.38.68.68 0 0 0 0 .2.64.64 0 0 0 .06.18.76.76 0 0 0 .09.18 1.58 1.58 0 0 0 .12.15l.15.12.18.09a.64.64 0 0 0 .18.06h.39a.6.6 0 0 0 .19-.06 1.15 1.15 0 0 0 .33-.21A1.05 1.05 0 0 0 28 47Zm12.62-25.08A1 1 0 0 0 41 22a1 1 0 0 0 .71-1.71 1 1 0 0 0-1.09-.21 1.15 1.15 0 0 0-.33.21 1 1 0 0 0 0 1.42 1.15 1.15 0 0 0 .33.21ZM36 22a1.05 1.05 0 0 0 .71-.29.93.93 0 0 0 .21-.33.94.94 0 0 0 0-.76.93.93 0 0 0-.21-.33A1 1 0 1 0 36 22Zm-5 0a1 1 0 1 0-.71-.29A1.05 1.05 0 0 0 31 22Zm9.29 4.71a1.15 1.15 0 0 0 .33.21A1 1 0 0 0 41 27a1 1 0 0 0 .71-1.71 1 1 0 0 0-1.09-.21 1.15 1.15 0 0 0-.33.21 1 1 0 0 0 0 1.42Zm-5 0a1 1 0 0 0 1.42 0 .93.93 0 0 0 .21-.33A1 1 0 0 0 37 26a1 1 0 1 0-1.71.71Zm-5 0A1 1 0 1 0 30 26a1.05 1.05 0 0 0 .29.71Zm10 5a1.15 1.15 0 0 0 .33.21A1 1 0 0 0 41 32a1 1 0 0 0 .71-1.71 1 1 0 0 0-1.09-.21 1.15 1.15 0 0 0-.33.21 1 1 0 0 0 0 1.42Zm-5.21-.33a1.15 1.15 0 0 0 .21.33 1 1 0 0 0 1.42 0 1.15 1.15 0 0 0 .21-.33.94.94 0 0 0 0-.76 1 1 0 0 0-.21-.33A1 1 0 0 0 35 31a.84.84 0 0 0 .08.38Zm5.21 12.33a1.15 1.15 0 0 0 .33.21A1 1 0 0 0 41 44a1 1 0 0 0 .71-1.71 1 1 0 0 0-1.09-.21 1.15 1.15 0 0 0-.33.21 1 1 0 0 0 0 1.42Zm-5 0a1 1 0 0 0 1.42 0 .93.93 0 0 0 .21-.33.94.94 0 0 0 0-.76 1 1 0 0 0-.21-.33 1 1 0 0 0-1.42 1.42Zm5 5a1.15 1.15 0 0 0 .33.21A1 1 0 0 0 41 49a1 1 0 0 0 .71-1.71 1 1 0 0 0-1.09-.21 1.15 1.15 0 0 0-.33.21 1 1 0 0 0 0 1.42Zm-5 0a1 1 0 0 0 1.42 0A1 1 0 0 0 37 48a1 1 0 0 0-.08-.38 1 1 0 0 0-.21-.33 1 1 0 0 0-1.42 1.42Zm5 5a1.15 1.15 0 0 0 .33.21A1 1 0 0 0 41 54a1 1 0 0 0 .71-1.71 1 1 0 0 0-1.09-.21 1.15 1.15 0 0 0-.33.21 1 1 0 0 0 0 1.42Zm-5 0A1 1 0 1 0 35 53a1.05 1.05 0 0 0 .29.71Zm-5-22a1 1 0 0 0 1.42-1.42 1 1 0 0 0-1.09-.21 1 1 0 0 0-.33.21 1 1 0 0 0 0 1.42Z" data-name="07 delete user, user, person, avatar, login, delete account" fill="#000000" opacity="1" data-original="#000000" class=""></path></g></svg>';

  const navigation = useNavigation();

  const onPressOtpSumbitDeleteAcc = () => {
    navigation.navigate("AreYousuareUserDelete");
  };
  const handleBackPress = () => {
    navigation.goBack();
  };

  const BtnPress = () => {
    // navigation.navigate()
    console.log("Button pressed!");
  };
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  return (
    <View style={styles.main}>
      <AppBarSecond title={translate("dlt.Delete Acc & Clear Data")} />
      <ScrollView>
        <View style={styles.bodystyle}>
          <View style={styles.bodymarginstyle}>
            <View style={styles.userDeletestyle}>
              <SvgXml xml={userDelete} />
            </View>
            <Text
              allowFontScaling={false}
              style={[
                styles.pleaseReadCarefully,
                { color: colorConfig.secondaryColor },
              ]}
            >
              {translate("dlt.Please Read Carefully !")}
            </Text>

            <Text style={styles.bodyTextStyle}>
              {translate("dlt.description")}{" "}
            </Text>

            <View style={styles.buttonstyle}>
              <DynamicButton
                title={translate("dlt.Press me if you agree to the deletion")}
                onPress={onPressOtpSumbitDeleteAcc}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  main: {
    width: "100%",
    height: "100%",
  },
  manage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: wScale(55),
  },
  managetext: {
    fontSize: wScale(25),
    color: "#fff",
    flex: 1,
    textAlign: "center",
    fontWeight: "bold",
  },

  backbutton: {
    width: wScale(60),
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },

  bodystyle: {
    width: "100%",
    height: "100%",
  },
  bodymarginstyle: {
    marginLeft: wScale(20),
    marginRight: wScale(20),
    alignSelf: "center",
  },
  userDeletestyle: {
    marginTop: hScale(20),
    alignSelf: "center",
  },
  pleaseReadCarefully: {
    fontSize: wScale(32),
    fontWeight: "bold",
    alignSelf: "center",
    marginTop: hScale(15),
  },
  bodyTextStyle: {
    textAlign: "justify",
    marginTop: hScale(5),
    fontSize: wScale(22),
    color: "#000",
  },

  buttonstyle: {
    marginTop: hScale(10),
  },
});
export default DeletUser;
