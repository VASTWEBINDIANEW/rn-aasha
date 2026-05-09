import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import FlotingInput from "./FlotingInput";
import DynamicButton from "../button/DynamicButton";
import AppBarSecond from "../headerAppbar/AppBarSecond";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import { SvgXml } from "react-native-svg";
import { useSelector } from "react-redux";
import { RootState } from "../../../reduxUtils/store";
import { useNavigation } from "@react-navigation/native";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";
import { ToastAndroid } from "react-native";
import ShowEye from "../HideShowImgBtn/ShowEye";
import { APP_URLS } from "../../../utils/network/urls";
import useAxiosHook from "../../../utils/network/AxiosClient";
import { encrypt } from "../../../utils/encryptionUtils";
import OTPModal from "../../../components/OTPModal";
import { colors } from "../../../utils/styles/theme";
import { translate } from "../../../utils/languageUtils/I18n";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
const ChangeForgetPin = () => {
  const dropdown = `<svg xmlns="http://www.w3.org/2000/svg"  version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="26" height="26" x="0" y="0" viewBox="0 0 128 128" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path fill="#000000" fill-rule="evenodd" d="M20.586 47.836a2 2 0 0 0 0 2.828l39.879 39.879a5 5 0 0 0 7.07 0l39.879-39.879a2 2 0 0 0-2.828-2.828L64.707 87.714a1 1 0 0 1-1.414 0L23.414 47.836a2 2 0 0 0-2.828 0z" clip-rule="evenodd" opacity="1" data-original="#000000" class=""></path></g></svg>`;
  const navigation = useNavigation();

  const forgetpage = () => {
    navigation.navigate("ForgetPin");
  };

  const { colorConfig, IsDealer } = useSelector(
    (state: RootState) => state.userInfo,
  );
  const ChangePinKey = `<svg fill="none" height="54" viewBox="0 0 24 24" width="44" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><linearGradient id="paint0_linear_1_436" gradientUnits="userSpaceOnUse" x1="12" x2="12" y1="6.25" y2="17.75"><stop offset="0" stop-color="${colorConfig.primaryColor}"/><stop offset="1" stop-color="${colorConfig.primaryColor}"/></linearGradient><g fill="url(#paint0_linear_1_436)"><path d="m7 10c-1.10457 0-2 .8954-2 2s.89543 2 2 2 2-.8954 2-2-.89543-2-2-2z"/><path clip-rule="evenodd" d="m7 6.25c-3.17564 0-5.75 2.57436-5.75 5.75 0 3.1756 2.57436 5.75 5.75 5.75 2.18057 0 4.0762-1.2137 5.0508-3h3.1992v2.25c0 .4142.3358.75.75.75h3.5c.4142 0 .75-.3358.75-.75v-2.25h1.75c.4142 0 .75-.3358.75-.75v-3c0-.9665-.7835-1.75-1.75-1.75h-8.9492c-.9746-1.78629-2.87023-3-5.0508-3zm-4.25 5.75c0-2.34721 1.90279-4.25 4.25-4.25 1.74161 0 3.2402 1.04769 3.8967 2.5503.1193.2731.3892.4497.6873.4497h9.416c.1381 0 .25.1119.25.25v2.25h-1.75c-.4142 0-.75.3358-.75.75v2.25h-2v-2.25c0-.4142-.3358-.75-.75-.75h-4.416c-.2981 0-.568.1766-.6873.4497-.6565 1.5026-2.15509 2.5503-3.8967 2.5503-2.34721 0-4.25-1.9028-4.25-4.25z" fill-rule="evenodd"/></g></svg>`;
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [newsecure, setNewsecure] = useState(true);
  const [renewsecure, setRenewsecure] = useState(true);
  const [isnewpass, setIsnewpass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [iscurrentpass, setIscurrentpass] = useState(false);
  const [isrenewpass, setIsrenewpass] = useState(false);
  const { post } = useAxiosHook();
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [mobileOtp, setMobileOtp] = useState("");
  const [oldpass, setOldpass] = useState("");
  const [newpass, setNewpass] = useState("");
  const [renewpass, setRenewpass] = useState("");
  const [isotp, setisotp] = useState(false);
  const BtnPress = () => {
    if (oldpass === "") {
      ToastAndroid.showWithGravity(
        translate("Please Enter Old Password !!!"), // Message to display
        ToastAndroid.SHORT, // Duration for which the toast is shown
        // Position where the toast appears
        ToastAndroid.BOTTOM,
      );
    } else if (newpass.length < 4 || renewpass.length < 4) {
      ToastAndroid.showWithGravity(
        translate("PIN should be at least 6 characters long!"), // Message to display
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM, // Position where the toast appears
      );
    } else if (newpass === renewpass) {
      IsDealer ? changeDealerpin() : changePin();
    } else {
      ToastAndroid.showWithGravity(
        translate("Transaction PIN do not match"), // Message to display
        ToastAndroid.SHORT, // Duration for which the toast is shown
        ToastAndroid.BOTTOM, // Position where the toast appears
      );
    }
  };

  const toggleSecureTextEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };
  const newtoggle = () => {
    setNewsecure(!newsecure);
  };
  const renewtoggle = () => {
    setRenewsecure(!renewsecure);
  };

  const changeDealerpin = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await post({
        url: `${APP_URLS.DealerTransectionpinchange}oldpin=${oldpass}&newpin=${renewpass}`,
      });
      console.log(
        `${APP_URLS.DealerTransectionpinchange}oldpin=${oldpass}&newpin=${renewpass}`,
      );
      if (res && res.Response == "Failed") {
        ToastAndroid.show(res.Message, ToastAndroid.LONG);
        console.log(res, "*****************");
      } else {
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: translate("SUCCESS"),
          textBody:
            res.Message ||
            translate(
              "key_yourtrans_116",
            ),
          button: translate("OK"),
          onPressButton: () => {
            //   dispatch(reset())
            // navigation.replace('Logout');
            navigation.navigate("Home");
            Dialog.hide();
          },
        });
        //setOtpModalVisible(true);
      }
      setIsLoading(false);
    } catch (error) {}
  }, [newpass, oldpass, post, renewpass]);
  const changePin = useCallback(async () => {
    setIsLoading(true);
    setOtpModalVisible(false);

    const encryption = encrypt([oldpass, newpass, renewpass, mobileOtp]);
    const encData = encryption.encryptedData;

    const url = isotp
      ? `${APP_URLS.changePin}value1=${encryption.keyEncode}&value2=${encryption.ivEncode}&OldPIN=${encData[0]}&NewPIN=${encData[1]}&Otp=${encData[3]}`
      : `${APP_URLS.verifyChangePin}value1=${encryption.keyEncode}&value2=${encryption.ivEncode}&OldPIN=${encData[0]}&NewPIN=${encData[1]}`;

    console.log("Response from server:", url);

    try {
      const response = await post({ url });

      console.log("Response from server:", url, response);

      setIsLoading(false);

      if (isotp) {
        setOtpModalVisible(false);

        if (response.status) {
          console.log("Success response:", response);
          Alert.alert(
            translate("SUCCESS"),
            response.Message || translate("Pin changed successfully!"),
            [
              {
                text: translate("OK"),
                onPress: () => {},
              },
            ],
            { cancelable: false },
          );
        } else {
          console.log("Error response:", response);
          Alert.alert(
            translate("ERROR"),
            response?.Message ||
              translate("An error occurred. Please try again."),
            [
              {
                text: translate("OK"),
                onPress: () => {
                  setOtpModalVisible(true);
                },
              },
            ],
            { cancelable: false },
          );
        }

        setMobileOtp("");
        return;
      }

      if (response.status === true) {
        setMobileOtp("");
        setOtpModalVisible(true);
        setisotp(true);
      } else {
        console.log("Error response:", response);
        Alert.alert(
          translate("ERROR"),
          response.Message || translate("An error occurred. Please try again."),
          [
            {
              text: translate("OK"),
              onPress: () => {},
            },
          ],
          { cancelable: false },
        );
      }
    } catch (error) {
      setIsLoading(false);
      console.error("Error during changePin request:", error);

      Alert.alert(
        translate("ERROR"),
        translate("key_anerroro_12"),
        [
          {
            text: translate("OK"),
            onPress: () => {},
          },
        ],
        { cancelable: false },
      );
    }
  }, [mobileOtp, isotp, newpass, oldpass, post, renewpass]);

  const handlecurrentpass = (text: string) => {
    checkButtonVisibility(text, newpass, renewpass);
    setOldpass(text);

    setIscurrentpass(text.length >= 4);
  };

  const handlenewpass = (text: string) => {
    checkButtonVisibility(oldpass, text, renewpass);
    setNewpass(text);
    setIsnewpass(text.length >= 4);
  };
  const handlerenePass = (text: string) => {
    checkButtonVisibility(oldpass, newpass, text);
    setIsrenewpass(text.length >= 4);
    setRenewpass(text);
  };
  const [isbutt, setIsButt] = useState(true);

  const checkButtonVisibility = (value1, value2, value3) => {
    const totalLength = value1.length + value2.length + value3.length;
    setIsButt(value1 >= 4 || value2 >= 4 || value3 >= 4);
  };

 return (
  <View style={styles.main}>
    <AppBarSecond
      title={"Set Transaction PIN"}
      actionButton={undefined}
      onActionPress={undefined}
    />

    {/* ScrollView यहाँ से शुरू होगा */}
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      extraScrollHeight={100} // ताकि सबमिट बटन हमेशा कीबोर्ड के ऊपर रहे
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <View style={styles.changepinview}>
          <Text style={[styles.changepintext, { color: colorConfig.primaryColor }]}>
            {translate("Change PIN")}
          </Text>
          <SvgXml xml={ChangePinKey} />
        </View>

        <View>
          {isLoading && <ActivityIndicator color={colors.black} size="large" />}

          {/* Current PIN */}
          <View style={{ position: "relative" }}>
            <FlotingInput
              label={"Current PIN"}
              value={oldpass}
              secureTextEntry={secureTextEntry}
              onChangeTextCallback={(value) => handlecurrentpass(value)}
            />
            {iscurrentpass && (
              <View style={styles.righticon}>
                <TouchableOpacity
                  onPressOut={toggleSecureTextEntry}
                  onPressIn={toggleSecureTextEntry}
                >
                  <ShowEye />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Enter New PIN */}
          <View style={{ position: "relative" }}>
            <FlotingInput
              label={"Enter New PIN"}
              value={newpass}
              secureTextEntry={newsecure}
              onChangeTextCallback={(value) => handlenewpass(value)}
              autoComplete="off"
              contextMenuHidden={true}
            />
            {isnewpass && (
              <View style={styles.righticon}>
                <TouchableOpacity onPressIn={newtoggle} onPressOut={newtoggle}>
                  <ShowEye />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Re-enter New PIN */}
          <View style={{ position: "relative", paddingBottom: hScale(10) }}>
            <FlotingInput
              label={"Re-enter New PIN"}
              secureTextEntry={renewsecure}
              value={renewpass}
              onChangeTextCallback={(value) => handlerenePass(value)}
              autoComplete="off"
              contextMenuHidden={true}
            />
            {isrenewpass && (
              <View style={styles.righticon}>
                <TouchableOpacity onPressIn={renewtoggle} onPressOut={renewtoggle}>
                  <ShowEye />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Submit Button */}
          <DynamicButton
            title={"submit"}
            onPress={() => {
              if (
                oldpass.length >= 4 &&
                newpass.length >= 4 &&
                renewpass.length >= 4
              ) {
                BtnPress();
              } else {
                console.log(translate("PIN should be at least 4 characters long"));
              }
            }}
            styleoveride={{
              opacity:
                oldpass.length <= 3 || newpass.length <= 3 || renewpass.length <= 3
                  ? 0.5
                  : 1,
            }}
          />
        </View>

        {/* Forgot PIN Section */}
        <TouchableOpacity
          style={styles.forgotbtn}
          activeOpacity={0.7}
          onPress={forgetpage}
        >
          <Text style={styles.forgotbtntext}>{translate("Forgot PIN ?")}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>

    {/* Modals हमेशा ScrollView के बाहर होने चाहिए */}
    <OTPModal
      setShowOtpModal={setOtpModalVisible}
      disabled={mobileOtp.length !== 4}
      showOtpModal={otpModalVisible}
      setMobileOtp={null}
      setEmailOtp={setMobileOtp}
      inputCount={4}
      verifyOtp={() => {
        setOtpModalVisible(false);
        changePin();
      }}
    />
  </View>
);
};
const styles = StyleSheet.create({
  main: { backgroundColor: "#fff", height: "100%", width: "100%" },

  container: {
    marginHorizontal: wScale(20),
    marginTop: hScale(25),
  },
  changepinview: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hScale(15),
  },
  changepintext: {
    fontWeight: "bold",
    fontSize: wScale(30),
    paddingRight: wScale(10),
  },
  forgotbtn: {
    alignSelf: "flex-end",
    marginTop: wScale(5),
    padding: wScale(8),
  },
  forgotbtntext: {
    fontSize: wScale(18),
    color: "#000",
  },
  righticon: {
    position: "absolute",
    left: "auto",
    right: wScale(20),
    top: hScale(12),
    opacity: 0.2,
  },
});
export default ChangeForgetPin;
