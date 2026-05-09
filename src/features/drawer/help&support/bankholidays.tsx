import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import LottieView from "lottie-react-native";
import { useSelector } from "react-redux";
import { SvgXml } from "react-native-svg";
import LinearGradient from "react-native-linear-gradient";
import { FlashList } from "@shopify/flash-list";
import AppBarSecond from "../headerAppbar/AppBarSecond";
import useAxiosHook from "../../../utils/network/AxiosClient";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import { RootState } from "../../../reduxUtils/store";
import { APP_URLS } from "../../../utils/network/urls";
import { translate } from "../../../utils/languageUtils/I18n";

const Bankholidays = () => {
  const help =
    '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="80" height="90" x="0" y="0" viewBox="0 0 32 32" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><g data-name="Layer 2"><path d="M23.917 13.75v3.493a1.751 1.751 0 0 0 1.746 1.75 1.779 1.779 0 0 0 .398-.045l1.558-.36a2.737 2.737 0 0 0 2.131-2.679v-1.818a2.737 2.737 0 0 0-2.13-2.68l-1.56-.36a1.766 1.766 0 0 0-.791.002 9.406 9.406 0 0 0-18.538 0 1.76 1.76 0 0 0-.792-.001l-1.558.36A2.737 2.737 0 0 0 2.25 14.09v1.818a2.737 2.737 0 0 0 2.13 2.68l1.56.36a1.785 1.785 0 0 0 .397.045 1.751 1.751 0 0 0 1.746-1.75v-4.578a7.917 7.917 0 0 1 15.834 0zM18.5 25.5a2.253 2.253 0 0 0-2.25-2.25c-.06 0-.115.013-.173.018a.713.713 0 0 0-.2-.008 7.826 7.826 0 0 1-5.47-1.027 7.098 7.098 0 0 1-1.81-1.686.75.75 0 1 0-1.195.906 8.556 8.556 0 0 0 2.192 2.041 8.813 8.813 0 0 0 4.508 1.373A2.213 2.213 0 0 0 14 25.5a2.25 2.25 0 0 0 4.5 0z" fill="#000" opacity="1" data-original="#000000" class=""></path><path d="M22.68 13.024a6.751 6.751 0 0 0-13.418 1.38 6.845 6.845 0 0 0 6.91 6.346H21.1a1.05 1.05 0 0 0 .63-1.89l-.617-.463a6.767 6.767 0 0 0 1.568-5.373zM13.5 14.75a.75.75 0 1 1 .75-.75.75.75 0 0 1-.75.75zm2.5 0a.75.75 0 1 1 .75-.75.75.75 0 0 1-.75.75zm2.5 0a.75.75 0 1 1 .75-.75.75.75 0 0 1-.75.75z" fill="#000" opacity="1" data-original="#000000" class=""></path></g></g></svg>';
  const bankholidayimg =
    '<svg id="bank" enable-background="new 0 0 300 300" height="130" viewBox="0 0 300 300" width="130" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="54.389" x2="269.828" y1="273.46" y2="58.021"><stop offset="0" stop-color="#107eff"/><stop offset="1" stop-color="#8f16ff"/></linearGradient><g><path d="m148 78c-6.617 0-12 5.383-12 12s5.383 12 12 12 12-5.383 12-12-5.383-12-12-12zm-96 120h196c2.211 0 4-1.791 4-4v-12c0-2.209-1.789-4-4-4h-8v-60h4c2.211 0 4-1.791 4-4v-24c0-1.777-1.172-3.342-2.879-3.84l-96-28c-.734-.215-1.508-.215-2.242 0l-96 28c-1.707.498-2.879 2.063-2.879 3.84v24c0 2.209 1.789 4 4 4h4v60h-4c-2.211 0-4 1.791-4 4v12c0 2.209 1.789 4 4 4zm20-80v60h-8v-60zm8 0h8v60h-8zm16 0h8v60h-8zm16 0h8v60h-8zm16 0h8v60h-8zm16 0h8v60h-8zm16 0h8v60h-8zm16 0h8v60h-8zm16 0h8v60h-8zm16 0h8v60h-8zm16 0h8v60h-8zm-168-25 92-26.834 92 26.834v17h-184zm182.086-32.721 4.258-4.258-4.258-4.258c-1.562-1.562-1.562-4.094 0-5.656s4.094-1.562 5.656 0l4.258 4.258 4.258-4.258c1.562-1.562 4.094-1.562 5.656 0s1.562 4.094 0 5.656l-4.258 4.258 4.258 4.258c1.562 1.562 1.562 4.094 0 5.656-.781.781-1.805 1.172-2.828 1.172s-2.047-.391-2.828-1.172l-4.258-4.257-4.258 4.258c-.781.781-1.805 1.172-2.828 1.172s-2.047-.391-2.828-1.172c-1.563-1.563-1.563-4.094 0-5.657zm-22.086-14.279c0-2.209 1.791-4 4-4s4 1.791 4 4-1.791 4-4 4-4-1.791-4-4zm-83.332 164h-13.336c-6.25 0-11.332 5.082-11.332 11.33v25.34c0 6.248 5.082 11.33 11.332 11.33h13.336c6.25 0 11.332-5.082 11.332-11.33v-25.34c0-6.248-5.082-11.33-11.332-11.33zm3.332 36.67c0 1.836-1.496 3.33-3.332 3.33h-13.336c-1.836 0-3.332-1.494-3.332-3.33v-25.34c0-1.836 1.496-3.33 3.332-3.33h13.336c1.836 0 3.332 1.494 3.332 3.33zm64-28.67v12h20c2.211 0 4 1.791 4 4s-1.789 4-4 4h-20v12h20c2.211 0 4 1.791 4 4s-1.789 4-4 4h-24c-2.211 0-4-1.791-4-4v-40c0-2.209 1.789-4 4-4h24c2.211 0 4 1.791 4 4s-1.789 4-4 4zm-160 3.814v24.371c0 2.104 1.711 3.814 3.812 3.814h16.188c2.211 0 4 1.791 4 4s-1.789 4-4 4h-16.188c-6.511.001-11.812-5.3-11.812-11.813v-24.371c0-6.514 5.301-11.815 11.812-11.815h16.188c2.211 0 4 1.791 4 4s-1.789 4-4 4h-16.188c-2.101 0-3.812 1.711-3.812 3.814zm120-.949v6.27c0 1.58 1.285 2.865 2.863 2.865h10.273c5.988 0 10.863 4.875 10.863 10.865v6.27c0 5.99-4.875 10.865-10.863 10.865h-17.136c-2.211 0-4-1.791-4-4s1.789-4 4-4h17.137c1.578 0 2.863-1.285 2.863-2.865v-6.27c0-1.58-1.285-2.865-2.863-2.865h-10.273c-5.988 0-10.863-4.875-10.863-10.865v-6.27c0-5.99 4.875-10.865 10.863-10.865h17.136c2.211 0 4 1.791 4 4s-1.789 4-4 4h-17.137c-1.578 0-2.863 1.285-2.863 2.865zm96.668-10.865h-20.668c-2.211 0-4 1.791-4 4v40c0 2.209 1.789 4 4 4h20.668c6.25 0 11.332-5.082 11.332-11.33v-25.34c0-6.248-5.082-11.33-11.332-11.33zm3.332 36.67c0 1.836-1.496 3.33-3.332 3.33h-16.668v-32h16.668c1.836 0 3.332 1.494 3.332 3.33zm-156 7.33c0 2.209-1.789 4-4 4h-24c-2.211 0-4-1.791-4-4v-40c0-2.209 1.789-4 4-4s4 1.791 4 4v36h20c2.211 0 4 1.791 4 4z" fill="url(#SVGID_1_)"/></g></svg>';

  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  const color1 = `${colorConfig.primaryColor}10`;
  const color2 = `${colorConfig.secondaryColor}10`;

  const { get } = useAxiosHook();
  const [List, setList] = useState([]);

  useEffect(() => {
    getHoliday();
  }, []);

  const getHoliday = async () => {
    try {
      const response = await get({ url: `${APP_URLS.getHolidaySetting}` });
      console.log(response);
      setList(response);
    } catch (error) {}
  };

  const [print, setPrint] = useState();

  const apicall = async () => {
    try {
      const response12 = await fetch(
        "https:///native.vastwebindia.com/Common/api/data/backgroundandfontcolor",
      );
      const colors = await response12.json(); // Assuming color data is in JSON format
      setPrint(colors);
      console.log(colors); // Print color data
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <View style={styles.mainView}>
      <View>
        <View>
          <AppBarSecond
            title={"Bank Holidays"}
            actionButton={undefined}
            onActionPress={undefined}
          />
        </View>
        {/* <TouchableOpacity onPress={apicall}>
          <Text>call function name:{print}</Text>
        </TouchableOpacity> */}
      </View>
      <ScrollView>
        <View style={styles.mainbodyStyle}>
          <View>
            <SvgXml style={styles.closedsvg} xml={bankholidayimg} />

            <Text style={styles.comingbank}>
              {translate("Coming Bank Holidays")}
            </Text>

            <View style={styles.backgroundelevation}>
              {/* <LinearGradient
                                style={[styles.gradientStyle, { borderColor: colorConfig.primaryColor }]}
                                colors={[color1, color2]}
                            > */}
              <View style={styles.holidayStyle}>
                <View style={styles.holidayimgStyle}>
                  <SvgXml xml={help} />
                </View>
                <View style={styles.holidaydatemainview}>
                  <View style={styles.textflexStyle}>
                    <Text numberOfLines={4} style={[styles.holidaytypeStyle]}>
                      {translate("Holi")}
                    </Text>
                    <Text numberOfLines={4} style={styles.holidaytypeStyle}>
                      {" "}
                      {translate("Monday")}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.holidaytime}>
                      {translate("March 25, 2024")}
                    </Text>
                  </View>
                </View>
              </View>
              <View>
                <LinearGradient
                  style={styles.LinearGradientborder}
                  colors={[
                    colorConfig.primaryColor,
                    colorConfig.secondaryColor,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              {/* </LinearGradient> */}
            </View>

            <View style={styles.backgroundelevation}>
              {/* <LinearGradient
                                style={[styles.gradientStyle, { borderColor: colorConfig.primaryColor }]}
                                colors={[color1, color2]}
                            > */}
              <View style={styles.holidayStyle}>
                <View style={styles.holidayimgStyle}>
                  <SvgXml xml={help} />
                </View>
                <View style={styles.holidaydatemainview}>
                  <View style={styles.textflexStyle}>
                    <Text numberOfLines={4} style={[styles.holidaytypeStyle]}>
                      {translate("Deepawali")}
                    </Text>
                    <Text numberOfLines={4} style={styles.holidaytypeStyle}>
                      {" "}
                      {translate("Monday")}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.holidaytime}>
                      {translate("November 01, 2024")}
                    </Text>
                  </View>
                </View>
              </View>
              <View>
                <LinearGradient
                  style={styles.LinearGradientborder}
                  colors={[
                    colorConfig.primaryColor,
                    colorConfig.secondaryColor,
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              {/* </LinearGradient> */}
            </View>
          </View>

          {/* <FlashList
                        style={{ marginBottom: wScale(50), marginHorizontal: wScale(24) }}
                        data={List}
                        renderItem={({ item }) => {
                            return (


                                <View style={styles.backgroundelevation}>

                                    <View style={styles.holidayStyle}>
                                        <View style={styles.holidayimgStyle}>
                                            <SvgXml xml={help} />
                                        </View>
                                        <View style={styles.holidaydatemainview}>
                                            <View style={styles.textflexStyle}>
                                                <Text numberOfLines={4} style={[styles.holidaytypeStyle,]}>{item['HolidayName']}</Text>
                                                <Text numberOfLines={4} style={styles.holidaytypeStyle}>{translate("Monday")}</Text>
                                            </View>
                                            <View>
                                                <Text style={styles.holidaytime}>{translate("November_01_2024")}</Text>
                                            </View>
                                        </View>


                                    </View>
                                    <View>
                                        <LinearGradient
                                            style={{ height: 5, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}
                                            colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 0 }}
                                        ></LinearGradient>
                                    </View>

                                </View>
                            )
                        }
                        }
                    /> */}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainView: {
    width: "100%",
    height: "100%",
  },
  mainbodyStyle: {
    marginHorizontal: wScale(10),
  },

  closedsvg: {
    alignSelf: "center",
    marginTop: hScale(10),
  },

  comingbank: {
    color: "#000",
    fontSize: wScale(26),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: hScale(22),
    marginTop: hScale(12),
  },
  backgroundelevation: {
    backgroundColor: "#fff",
    elevation: 5,
    flex: 1,
    marginBottom: hScale(12),
    borderRadius: 5,
  },
  gradientStyle: {
    borderRadius: 5,
  },
  holidayStyle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wScale(10),
  },
  LinearGradientborder: {
    height: hScale(6),
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  holidayimgStyle: {
    width: wScale(90),
    alignItems: "flex-start",
    marginLeft: wScale(-6),
  },
  holidaydatemainview: {
    flex: 1,
    marginLeft: wScale(0),
  },
  textflexStyle: {
    flexDirection: "row",
    // justifyContent: 'center',
    paddingBottom: hScale(12),
  },
  holidaytypeStyle: {
    color: "#000",
    fontSize: wScale(15),
    fontWeight: "normal",
    textAlign: "justify",
  },
  holidaytime: {
    fontSize: wScale(30),
    fontWeight: "bold",
    color: "#000",
  },
});

export default Bankholidays;
