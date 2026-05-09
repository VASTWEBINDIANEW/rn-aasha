import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
  Alert,
  TextInput,
  ToastAndroid,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { SvgXml } from "react-native-svg";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import FlotingInput from "./FlotingInput";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../reduxUtils/store";
import { colors } from "../../../utils/styles/theme";
import LinearGradient from "react-native-linear-gradient";
import DynamicButton from "../button/DynamicButton";
import AppBarSecond from "../headerAppbar/AppBarSecond";
import {
  ALERT_TYPE,
  AlertNotificationDialog,
  AlertNotificationRoot,
  Dialog,
} from "react-native-alert-notification";
import ShowEye from "../HideShowImgBtn/ShowEye";
import useAxiosHook from "../../../utils/network/AxiosClient";
import { APP_URLS } from "../../../utils/network/urls";
import { encrypt } from "../../../utils/encryptionUtils";
import OTPModal from "../../../components/OTPModal";
import CloseSvg from "../svgimgcomponents/CloseSvg";
import { reset } from "../../../reduxUtils/store/userInfoSlice";
import { translate } from "../../../utils/languageUtils/I18n";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const BackArrowImg = `    

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><linearGradient id="a" x1="219.858" x2="478.003" y1="387.123" y2="128.977" gradientTransform="matrix(1 0 0 -1 0 514.05)" gradientUnits="userSpaceOnUse"><stop stop-opacity="1"
 stop-color="{{colorConfig.primaryColor}}" offset="0.004629617637840665"></stop><stop stop-opacity="1"
  stop-color="{{colorConfig.secondaryColor}}" offset="1"></stop></linearGradient><path fill="url(#a)" d="M385.1 405.7c20 20 20 52.3 0 72.3s-52.3 20-72.3 0L126.9 292.1c-20-20-20-52.3 0-72.3L312.8 34c20-20 52.3-20 72.3 0s20 52.3 0 72.3L235.4 256z" opacity="1" data-original="url(#a)" class=""></path></g></svg>

  `;

const Changepassword = () => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [newsecure, setNewsecure] = useState(true);
  const [renewsecure, setRenewsecure] = useState(true);
  const [isnewpass, setIsnewpass] = useState(false);
  const [iscurrentpass, setIscurrentpass] = useState(false);
  const [isrenewpass, setIsrenewpass] = useState(false);
  const [isbutt, setIsButt] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [oldpass, setOldpass] = useState("");
  const [newpass, setNewpass] = useState("");
  const [renewpass, setRenewpass] = useState("");
  const [bgcolorindex, setBgcolorindex] = useState(0);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [mobileOtp, setMobileOtp] = useState("");
  const [isOtp, setisOtp] = useState(false);
  const bgcolorAnimated = new Animated.Value(bgcolorindex);
  const { post } = useAxiosHook();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();

  const gradientColors = [
    colorConfig.primaryColor,
    colorConfig.secondaryColor,
    "red",
  ];

  const toggleBbColor = () => {
    setBgcolorindex((prevIndex) => (prevIndex + 1) % gradientColors.length);
  };

  useEffect(() => {
    const intervalId = setInterval(toggleBbColor, 800);
    return () => clearInterval(intervalId);
  }, [bgcolorindex]);

  const [showModal, setShowModal] = useState(false);

  const changePassword = useCallback(async () => {
    setIsLoading(true);
    const encryption = encrypt([oldpass, newpass, renewpass, mobileOtp]);
    const encData = encryption.encryptedData;

    const url = isOtp ? APP_URLS.changePassword : APP_URLS.verifyChangePassword;
    const response = await post({
      url,
      data: {
        OTP: encData[3],
        OldPassword: encData[0],
        NewPassword: encData[1],
        ConfirmPassword: encData[2],
        value1: encryption.keyEncode,
        value2: encryption.ivEncode,
      },
    });
    console.log({
      OTP: encData[3],
      OldPassword: encData[0],
      NewPassword: encData[1],
      ConfirmPassword: encData[2],
      value1: encryption.keyEncode,
      value2: encryption.ivEncode,
    });
    console.log(url);
    console.log(response);
    setIsLoading(false);
    if (response) {
      if (isOtp) {
        console.log("otp verify ", response);
        setOtpModalVisible(false);
        if (response?.Status) {
          Dialog.show({
            type: ALERT_TYPE.SUCCESS,
            title: translate("ChangePassword.SUCCESS"),
            textBody:
              response.Message ||
              translate(
                "ChangePassword.Your password has been changed successfully.",
              ),
            button: translate("ChangePassword.OK"),
            onPressButton: () => {
              dispatch(reset());
              // navigation.replace('Logout');

              Dialog.hide();
            },
          });
        } else {
          Dialog.show({
            type: ALERT_TYPE.DANGER,
            title: translate("ChangePassword.ERROR"),
            textBody: response.Message,
            button: translate("ChangePassword.OK"),
            onPressButton: () => {
              setOtpModalVisible(true);
              Dialog.hide();
            },
          });
        }
        setMobileOtp("");
        return;
      }
      if (response?.Status) {
        setMobileOtp("");
        setisOtp(true);
        setOtpModalVisible(true);
      } else if (!response?.Status) {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: translate("ChangePassword.ERROR"),
          textBody: response.Message,
          button: translate("ChangePassword.OK"),
          onPressButton: () => {
            Dialog.hide();
          },
        });
      }
    }
  }, [mobileOtp, newpass, oldpass, post, renewpass]);

  const handleBack = () => {
    navigation.goBack();
  };
  const BtnPress = () => {
    if (oldpass === "") {
      ToastAndroid.showWithGravity(
        translate("ChangePassword.Please Enter Old Password !!!"), // Message to display
        ToastAndroid.SHORT, // Duration for which the toast is shown
        // Position where the toast appears
        ToastAndroid.BOTTOM,
      );
    } else if (newpass.length < 6 || renewpass.length < 6) {
      // Check if newpass or renewpass is less than 6 characters
      ToastAndroid.showWithGravity(
        translate(
          "ChangePassword.Password should be at least 6 characters long!",
        ), // Message to display
        ToastAndroid.SHORT, // Duration for which the toast is shown
        ToastAndroid.BOTTOM, // Position where the toast appears
      );
    } else if (newpass === renewpass) {
      changePassword();
    } else {
      ToastAndroid.showWithGravity(
        translate("ChangePassword.Passwords do not match"), // Message to display
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

  const handlecurrentpass = (text: string) => {
    checkButtonVisibility(text, newpass, renewpass);
    setOldpass(text);

    setIscurrentpass(text.length >= 6);
  };

  const handlenewpass = (text: string) => {
    checkButtonVisibility(oldpass, text, renewpass);
    setNewpass(text);
    setIsnewpass(text.length >= 6);
  };
  const handlerenePass = (text: string) => {
    checkButtonVisibility(oldpass, newpass, text);
    setIsrenewpass(text.length >= 6);
    setRenewpass(text);
  };

  const checkButtonVisibility = (value1, value2, value3) => {
    const totalLength = value1.length + value2.length + value3.length;
    setIsButt(value1 >= 6 || value2 >= 6 || value3 >= 6);
  };

  const checkOtp = useCallback(async () => {}, []);

return (
  <View style={styles.main}>
    <AppBarSecond title={"Change Login Password"} />

    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      extraScrollHeight={120} // बटन को कीबोर्ड से सुरक्षित दूरी पर रखने के लिए
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        {/* पासवर्ड टिप्स सेक्शन */}
        <View style={styles.passtipcontainer}>
          <Text style={[styles.passtip, { color: colorConfig.primaryColor }]}>
            {translate("Password Security Tips")}
          </Text>

          <Animated.View
            style={[
              styles.animetedView,
              { backgroundColor: gradientColors[bgcolorindex] },
            ]}
          >
            <TouchableOpacity
              onPress={() => setShowModal(true)}
              activeOpacity={0.7}
              style={styles.shomodalbtn}
            >
              <Text style={styles.shomodaltext}>!</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* पासवर्ड इनपुट सेक्शन */}
        <View>
          {isLoading && <ActivityIndicator color={colors.black} size="large" />}
          
          {/* Current Password */}
          <View style={{ position: "relative" }}>
            <FlotingInput
              label={"Current Password"}
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

          {/* New Password */}
          <View style={{ position: "relative" }}>
            <FlotingInput
              label={"Enter New Password"}
              value={newpass}
              secureTextEntry={newsecure}
              onChangeTextCallback={(value) => handlenewpass(value)}
              autoComplete="off"
              autoCorrect={false}
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

          {/* Re-enter Password */}
          <View style={{ position: "relative", paddingBottom: hScale(10) }}>
            <FlotingInput
              label={"Re-enter New Password"}
              value={renewpass}
              secureTextEntry={renewsecure}
              onChangeTextCallback={(value) => handlerenePass(value)}
              autoComplete="off"
              autoCorrect={false}
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

          <DynamicButton
            title={"submit"}
            onPress={() => {
              if (oldpass.length >= 6 && newpass.length >= 6 && renewpass.length >= 6) {
                BtnPress();
              } else {
                console.log(translate("Passwords should be at least 6 characters long"));
              }
            }}
            styleoveride={{
              opacity: oldpass.length <= 5 || newpass.length <= 5 || renewpass.length <= 5 ? 0.5 : 1,
            }}
          />
        </View>
      </View>
    </KeyboardAwareScrollView>

    {/* Security Tips Modal (इसे ScrollView के बाहर रखें) */}
    <Modal transparent={true} animationType="slide" visible={showModal}>
      <View style={styles.centerModal}>
        <View style={[styles.modalView, { borderColor: colorConfig.primaryColor }]}>
          <View style={styles.cutborder}>
            <TouchableOpacity
              onPress={() => setShowModal(false)}
              activeOpacity={0.7}
              style={[styles.closebuttoX, { backgroundColor: colorConfig.primaryColor }]}
            >
              <CloseSvg />
            </TouchableOpacity>
          </View>

          <View style={[styles.texttitalView, { backgroundColor: colorConfig.primaryColor }]}>
            <View style={[styles.cutout, { borderTopColor: colorConfig.primaryColor }]} />
            <Text style={styles.texttital}>{translate("Password Security Tips")}</Text>
          </View>
          
          <ScrollView>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <View key={num} style={styles.tipcontant}>
                <Text style={styles.tipTitle}>{num}. {translate(`Tip Title ${num}`)}</Text>
                <Text style={styles.tipDescri}>{translate(`Tip Description ${num}`)}</Text>
              </View>
            ))}
            {/* Modal Close Button */}
            <TouchableOpacity onPress={() => setShowModal(false)} style={[styles.closebutto, { backgroundColor: colorConfig.primaryColor, margin: 20, padding: 10, borderRadius: 5 }]}>
              <Text style={[styles.closetext, { textAlign: 'center', color: 'white' }]}>
                {translate("ChangePassword.Close Tips")}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>

    {/* OTP Modal */}
    <OTPModal
      setShowOtpModal={setOtpModalVisible}
      disabled={mobileOtp.length !== 4}
      showOtpModal={otpModalVisible}
      setMobileOtp={setMobileOtp}
      verifyOtp={() => {
        setOtpModalVisible(false);
        changePassword();
      }}
    />
  </View>
);
};
const styles = StyleSheet.create({
  main: {
    width: "100%",
    height: "100%",
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    paddingHorizontal: wScale(20),
    paddingTop: hScale(25),
  },
  passtipcontainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hScale(30),
  },
  shomodalbtn: {
    width: wScale(35),
    height: wScale(35),
    alignItems: "center",
  },
  animetedView: {
    borderRadius: wScale(20),
    alignItems: "center",
    marginLeft: wScale(5),
  },
  shomodaltext: {
    color: "white",
    fontSize: wScale(27),
    fontWeight: "bold",
  },
  passtip: {
    fontSize: wScale(25),
    fontWeight: "bold",
  },
  centerModal: {
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
    backgroundColor: "rgba(0,0,0,.6)",
  },
  modalView: {
    backgroundColor: "#fff",
    paddingTop: hScale(50),
    borderRadius: wScale(10),
    elevation: 5,
    marginHorizontal: wScale(16),
    marginTop: hScale(70),
    borderWidth: wScale(3),
    paddingHorizontal: wScale(10),
    paddingBottom: hScale(10),
    marginBottom: hScale(5),
  },
  texttitalView: {
    width: wScale(190),
    height: hScale(40),
    borderTopLeftRadius: wScale(5),
    position: "absolute",
    top: hScale(-1),
    left: wScale(-1),
    justifyContent: "center",
    paddingBottom: hScale(3),
    borderBottomRightRadius: 0,
  },

  cutout: {
    borderTopWidth: hScale(40), // Height of the triangle
    borderRightWidth: wScale(33), // Width of the triangle
    borderBottomWidth: wScale(0), // Set to 0 to hide the bottom edge
    borderLeftWidth: wScale(3), // Width of the triangle
    width: wScale(90),
    height: hScale(40),
    borderRightColor: "transparent", // Hide the right edge
    borderBottomColor: "transparent", // Hide the bottom edge
    borderLeftColor: "transparent", // Hide the left edge
    position: "absolute",
    right: wScale(-50),
    zIndex: wScale(0),
    top: wScale(0),
  },
  tipcontant: {
    flex: 1,
    paddingBottom: hScale(8),
  },
  texttital: {
    fontSize: wScale(18),
    fontWeight: "bold",
    color: "#fff",
    width: 240,
    paddingLeft: wScale(10),
  },

  tipTitle: {
    fontSize: wScale(20),
    fontWeight: "bold",
    color: "#000",
  },
  tipDescri: {
    fontSize: wScale(16),
    textAlign: "justify",
    color: "#000",
  },
  closebuttoX: {
    borderRadius: wScale(24),
    paddingVertical: hScale(5),
    alignItems: "center",
    height: wScale(48),
    width: wScale(48),
    justifyContent: "center",
    elevation: 5,
  },
  cutborder: {
    paddingLeft: wScale(2),
    position: "absolute",
    right: wScale(-12),
    top: hScale(-12),
    borderRadius: wScale(24),
    paddingRight: wScale(3.2),
  },
  closebutto: {
    borderRadius: wScale(4),
    alignItems: "center",
    justifyContent: "center",
    height: wScale(55),
  },

  closetext: {
    fontSize: wScale(20),
    color: "white",
  },
  subnitbtn: {
    alignItems: "center",
    height: hScale(55),
    justifyContent: "center",
    borderRadius: wScale(5),
  },
  submittext: {
    fontSize: wScale(18),
    fontWeight: "bold",
    color: "white",
  },
  LinearGradient: {
    width: "100%",
    borderRadius: wScale(5),
    marginTop: wScale(10),
  },
  righticon: {
    position: "absolute",
    left: "auto",
    right: wScale(20),
    top: hScale(12),
    opacity: 0.2,
  },
});
export default Changepassword;
