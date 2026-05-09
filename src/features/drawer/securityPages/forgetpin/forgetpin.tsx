import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import FlotingInput from "../FlotingInput";
import { SvgXml } from "react-native-svg";
import { useSelector } from "react-redux";
import { RootState } from "../../../../reduxUtils/store";
import DynamicButton from "../../button/DynamicButton";
import AppBarSecond from "../../headerAppbar/AppBarSecond";
import { hScale, wScale } from "../../../../utils/styles/dimensions";
import { useNavigation } from "@react-navigation/native";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";
import { ToastAndroid } from "react-native";
import useAxiosHook from "../../../../utils/network/AxiosClient";
import { APP_URLS } from "../../../../utils/network/urls";
import { colors } from "../../../../utils/styles/theme";
import { useDispatch } from "react-redux";
import { reset } from "../../../../reduxUtils/store/userInfoSlice";
import { translate } from "../../../../utils/languageUtils/I18n";

const ForgetPin = () => {
  const [email, setEmail] = useState("");
  const { get, post } = useAxiosHook();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const handleBack = () => {
    navigation.goBack();
  };
  const handleBacksecurity = () => {
    navigation.navigate("Security");
  };
  const { colorConfig, IsDealer } = useSelector(
    (state: RootState) => state.userInfo,
  );
  const ChangePinKey = `
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="44" height="44" x="0" y="0" viewBox="0 0 64 64" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><linearGradient id="a" x1="4.682" x2="59.495" y1="31.991" y2="31.991" gradientUnits="userSpaceOnUse"><stop stop-opacity="1" stop-color="${colorConfig.secondaryColor}" offset="0"></stop><stop stop-opacity="1" stop-color="${colorConfig.secondaryColor}" offset="1"></stop></linearGradient><path fill="url(#a)" d="M32 4C-4.418 5.507-4.43 57.406 32 58.91a27.43 27.43 0 0 0 21.94-10.96V29.2a1.54 1.54 0 0 0-1.54-1.54h-1.45a9.655 9.655 0 0 1-9.58 8.63c-12.755-.537-12.769-18.71 0-19.25a9.654 9.654 0 0 1 9.58 8.62h1.45a3.547 3.547 0 0 1 3.54 3.54v15.68C66.311 27.11 52.68 3.71 32 4zM15.91 20.55c2.34-3.7 7.92-1.7 9.76-1.04a.998.998 0 0 1 .6 1.28.987.987 0 0 1-1.27.6c-3.93-1.41-6.42-1.33-7.4.23a1 1 0 0 1-1.69-1.07zm2.91 6.11a3.805 3.805 0 0 1 7.61 0 3.805 3.805 0 0 1-7.61 0zm22.55 16.53a1 1 0 0 1 0 2H22.63a1 1 0 0 1 0-2zM20.82 26.66a1.805 1.805 0 0 1 3.61 0 1.805 1.805 0 0 1-3.61 0zm20.55-7.62a7.63 7.63 0 0 0-7.62 7.62c.357 10.104 14.897 10.091 15.25 0a7.633 7.633 0 0 0-7.63-7.62zm0 11.43a3.805 3.805 0 0 1 0-7.61 3.805 3.805 0 0 1 0 7.61zm0-2a1.805 1.805 0 0 1 0-3.61 1.805 1.805 0 0 1 0 3.61zm12.57 19.48a26.073 26.073 0 0 0 2-3.07V59a1 1 0 0 1-2 0z" opacity="1" data-original="url(#a)" class=""></path></g></svg>    `;
  const BtnPress = async () => {
    if (!email.includes("@")) {
      ToastAndroid.showWithGravity(
        translate("key_incorrect_51"), // Error message for incorrect email
        ToastAndroid.SHORT, // Duration for which the toast is shown
        // Position where the toast appears
        ToastAndroid.BOTTOM,
      );
    } else {
      try {
        setIsLoading(true);
        const url = IsDealer
          ? `${APP_URLS.Reset_TransPinFromdealer}txtemail=${email}`
          : `${APP_URLS.Reset_TransPinFromRetailer}txtemail=${email}`;
        const res = await post({ url });
        console.log(res);

        if (res.Response === "Success") {
          Dialog.show({
            type: ALERT_TYPE.SUCCESS,
            title: translate("SUCCESS"),
            textBody: translate("Forget Transaction") + res.Message,
            button: translate("OK"),
            onPressButton: () => {
              dispatch(reset());
              Dialog.hide();
            },
          });
        } else {
          Dialog.show({
            type: ALERT_TYPE.WARNING,
            title: translate("WARNING"),
            textBody: res.Message,
            button: translate("OK"),
            onPressButton: () => {
              Dialog.hide();
            },
          });
        }
        setIsLoading(false);
      } catch (error) {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: translate(""),
          textBody: error,
          button: translate("OK"),
          onPressButton: () => {
            Dialog.hide();
          },
        });
      }
    }
  };

  return (
    <View style={styles.main}>
      <AppBarSecond
        title={"Forget Transaction PIN"}
        onPressBack={handleBacksecurity}
      />

      <View style={styles.container}>
        {isLoading && <ActivityIndicator color={colors.black} size="large" />}

        <View style={styles.changepinview}>
          <SvgXml xml={ChangePinKey} />

          <Text
            style={[
              styles.changepintext,
              { color: colorConfig.secondaryColor },
            ]}
          >
            {translate("Forget PIN")}
          </Text>
        </View>
        <FlotingInput
          label={"Enter Registered Email ID"}
          cursorColor={"#000"}
          value={email}
          onChangeTextCallback={(value) => setEmail(value)}
          // onChangeText={(text) => { handlenewpass(text) }}
        />

        <DynamicButton
          title={"Submit"}
          onPress={BtnPress}
          styleoveride={{
            opacity: email.length <= 8 || !email.includes("@") ? 0.5 : 1,
          }}
        />
        <TouchableOpacity
          style={styles.forgotbtn}
          activeOpacity={0.7}
          onPress={handleBack}
        >
          <Text style={styles.forgotbtntext}>{translate("Change PIN ?")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  main: { backgroundColor: "#fff", height: "100%", width: "100%" },

  container: {
    marginHorizontal: wScale(20),
    marginTop: hScale(30),
  },
  changepinview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hScale(25),
  },
  changepintext: {
    fontWeight: "bold",
    fontSize: wScale(35),
    paddingLeft: wScale(10),
  },
  forgotbtn: {
    alignSelf: "flex-end",
    marginTop: hScale(5),

    padding: wScale(8),
  },
  forgotbtntext: {
    fontSize: wScale(18),
    color: "#000",
  },
});
export default ForgetPin;
