import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ScrollView } from "react-native";
import { SvgXml } from "react-native-svg";
import { useSelector } from "react-redux";
import AppBarSecond from "../headerAppbar/AppBarSecond";
import { RootState } from "../../../reduxUtils/store";
import { wScale } from "../../../utils/styles/dimensions";
import { translate } from "../../../utils/languageUtils/I18n";
const FAQs = () => {
  const faqsimg =
    '<svg height="130" viewBox="0 0 72 72" width="130" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><linearGradient id="linear-gradient" gradientUnits="userSpaceOnUse" x1="47.366" x2="48.316" y1="1.542" y2="71.166"><stop offset="0" stop-color="#e65758"/><stop offset="1" stop-color="#771d32"/></linearGradient><linearGradient id="linear-gradient-2" x1="26.629" x2="27.58" xlink:href="#linear-gradient" y1="1.825" y2="71.449"/><g id="Layer_25" data-name="Layer 25"><path d="m64.95 60.37a20.79262 20.79262 0 0 0 4.05-12.37 21.00943 21.00943 0 1 0 -9.88 17.81l7.5 3.11a.83849.83849 0 0 0 .38.08 1.02437 1.02437 0 0 0 .71-.29 1.00234 1.00234 0 0 0 .21-1.09zm-16.95 4.63a3 3 0 1 1 3-3 3.00879 3.00879 0 0 1 -3 3zm9.49-19.85a9.99458 9.99458 0 0 1 -5.78 6.13.99162.99162 0 0 0 -.71.86v1.85a3 3 0 1 1 -6 0v-1.85a6.95928 6.95928 0 0 1 4.48-6.43 4.0176 4.0176 0 0 0 2.32-2.45 4.61443 4.61443 0 0 0 -.62-3.94 2.794 2.794 0 0 0 -.52-.51 4.49 4.49 0 0 0 -4.61-.31 4.0028 4.0028 0 0 0 -2.05 3.49 3 3 0 1 1 -6 0 10.01784 10.01784 0 0 1 5.11-8.72 10.44421 10.44421 0 0 1 10.68.42 8.345 8.345 0 0 1 2.51 2.51 10.58065 10.58065 0 0 1 1.19 8.95z" fill="url(#linear-gradient)"/><path d="m48 25a22.787 22.787 0 0 1 3 .2v-17.2a5.00181 5.00181 0 0 0 -5-5h-38a5.00181 5.00181 0 0 0 -5 5v42a5.00181 5.00181 0 0 0 5 5h18.1a22.54332 22.54332 0 0 1 -1.1-7 23.02895 23.02895 0 0 1 23-23zm-30 0h-8a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2zm1 2a1.003 1.003 0 0 1 -1 1h-8a1 1 0 0 1 0-2h8a1.003 1.003 0 0 1 1 1zm-1-5h-8a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2zm-9-4a1 1 0 0 1 0-2h19a1 1 0 0 1 0 2zm11-11h2a1 1 0 0 1 0 2h-2a1 1 0 0 1 0-2zm-6 0h2a1 1 0 0 1 0 2h-2a1 1 0 0 1 0-2zm-6 0h2a1 1 0 0 1 0 2h-2a1 1 0 0 1 0-2zm-3 6v-2h41a1 1 0 0 1 0 2zm3 18a1.003 1.003 0 0 1 1-1h19a1 1 0 0 1 0 2h-19a1.003 1.003 0 0 1 -1-1zm10 11h-8a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2zm0-3h-8a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2zm0-3h-8a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2z" fill="url(#linear-gradient-2)"/></g></svg>';
  const add =
    '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="30" height="30" x="0" y="0" viewBox="0 0 24 24" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M12 1a11 11 0 1 0 11 11A11.013 11.013 0 0 0 12 1zm5 12h-4v4a1 1 0 0 1-2 0v-4H7a1 1 0 0 1 0-2h4V7a1 1 0 0 1 2 0v4h4a1 1 0 0 1 0 2z" data-name="Layer 2" fill="#ffffff" opacity="1" data-original="#000000" class=""></path></g></svg>';

  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  return (
    <View style={styles.main}>
      <View>
        <AppBarSecond
          title={"FAQs"}
          actionButton={undefined}
          onActionPress={undefined}
        />
      </View>
      <ScrollView>
        <View style={styles.bodymainView}>
          <View style={styles.topsvgimgstyle}>
            <SvgXml xml={faqsimg} />
          </View>
          <View>
            <Text style={styles.imgbottomtextStyle}>
              {translate("FAQ Info")}
            </Text>
          </View>

          <View>
            <View>
              <View
                style={[
                  styles.addDeviceflex,
                  { backgroundColor: colorConfig.primaryColor },
                ]}
              >
                <View>
                  <Text>{translate("SAMSUNG Z 22")}</Text>
                  <Text>{translate("sdf dfdssd")}</Text>
                </View>
                <View>
                  <SvgXml xml={add} />
                </View>
              </View>
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
  bodymainView: {
    marginHorizontal: wScale(20),
  },
  topsvgimgstyle: {
    alignItems: "center",
    marginTop: wScale(15),
  },
  imgbottomtextStyle: {
    textAlign: "justify",
    color: "#000",
    marginTop: wScale(15),
  },
  addDeviceflex: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: wScale(5),
    paddingHorizontal: wScale(5),
  },
});

export default FAQs;
