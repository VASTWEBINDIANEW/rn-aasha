import React, { createRef, useRef, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { SvgXml } from "react-native-svg";
import { BottomSheet } from "@rneui/themed";
import { useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import TheEbdUser from "./theenduser";
import {
  wScale,
  hScale,
  hpScale,
  wpScale,
} from "../../../../utils/styles/dimensions";
import AppBarSecond from "../../headerAppbar/AppBarSecond";
import { color } from "@rneui/base";
import { RootState } from "../../../../reduxUtils/store";
import DynamicButton from "../../button/DynamicButton";
import {
  Dialog,
  ALERT_TYPE,
  AlertNotificationRoot,
  Toast,
} from "react-native-alert-notification";
import { translate } from "../../../../utils/languageUtils/I18n";
// import TheEbdUser from "./svg-image/theenduser";

const AreYousuareUserDelete = ({ numberOfInputs = 6 }) => {
  const deleteUser =
    '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="120" height="120" x="0" y="0" viewBox="0 0 64 64" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="m54 19.07-2.67 36.37a5 5 0 0 1-5 4.56H36a1 1 0 0 1 0-2h10.35a3 3 0 0 0 3-2.73L52 18.93a1 1 0 1 1 2 .14ZM59 13a3 3 0 0 1-3 3H20v9a1 1 0 0 1-2 0v-9h-2a3 3 0 0 1 0-6h10V9a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v1h10a3 3 0 0 1 3 3Zm-31-3h16V9a3 3 0 0 0-3-3H31a3 3 0 0 0-3 3Zm-9 41a7 7 0 0 0-7 7s0 .06 0 .09a13.86 13.86 0 0 0 14 0s0-.09 0-.09a7 7 0 0 0-7-7Zm14-5a14 14 0 0 1-5.09 10.79 9 9 0 0 0-6.29-7.4 6 6 0 1 0-5.24 0 9 9 0 0 0-6.29 7.4A14 14 0 1 1 33 46Zm-21 1a1 1 0 0 0-.08-.38 1.15 1.15 0 0 0-.21-.33A1 1 0 0 0 10 47a1.23 1.23 0 0 0 0 .19.6.6 0 0 0 .06.19.76.76 0 0 0 .09.18 1.58 1.58 0 0 0 .12.15A1 1 0 0 0 12 47Zm16 0a1 1 0 0 0-.08-.38.93.93 0 0 0-.21-.33 1 1 0 0 0-.16-.12.56.56 0 0 0-.17-.09.6.6 0 0 0-.19-.06 1 1 0 0 0-.9.27.93.93 0 0 0-.21.33.84.84 0 0 0-.08.38.68.68 0 0 0 0 .2.64.64 0 0 0 .06.18.76.76 0 0 0 .09.18 1.58 1.58 0 0 0 .12.15l.15.12.18.09a.64.64 0 0 0 .18.06h.39a.6.6 0 0 0 .19-.06 1.15 1.15 0 0 0 .33-.21A1.05 1.05 0 0 0 28 47Zm12.62-25.08A1 1 0 0 0 41 22a1 1 0 0 0 .71-1.71 1 1 0 0 0-1.09-.21 1.15 1.15 0 0 0-.33.21 1 1 0 0 0 0 1.42 1.15 1.15 0 0 0 .33.21ZM36 22a1.05 1.05 0 0 0 .71-.29.93.93 0 0 0 .21-.33.94.94 0 0 0 0-.76.93.93 0 0 0-.21-.33A1 1 0 1 0 36 22Zm-5 0a1 1 0 1 0-.71-.29A1.05 1.05 0 0 0 31 22Zm9.29 4.71a1.15 1.15 0 0 0 .33.21A1 1 0 0 0 41 27a1 1 0 0 0 .71-1.71 1 1 0 0 0-1.09-.21 1.15 1.15 0 0 0-.33.21 1 1 0 0 0 0 1.42Zm-5 0a1 1 0 0 0 1.42 0 .93.93 0 0 0 .21-.33A1 1 0 0 0 37 26a1 1 0 1 0-1.71.71Zm-5 0A1 1 0 1 0 30 26a1.05 1.05 0 0 0 .29.71Zm10 5a1.15 1.15 0 0 0 .33.21A1 1 0 0 0 41 32a1 1 0 0 0 .71-1.71 1 1 0 0 0-1.09-.21 1.15 1.15 0 0 0-.33.21 1 1 0 0 0 0 1.42Zm-5.21-.33a1.15 1.15 0 0 0 .21.33 1 1 0 0 0 1.42 0 1.15 1.15 0 0 0 .21-.33.94.94 0 0 0 0-.76 1 1 0 0 0-.21-.33A1 1 0 0 0 35 31a.84.84 0 0 0 .08.38Zm5.21 12.33a1.15 1.15 0 0 0 .33.21A1 1 0 0 0 41 44a1 1 0 0 0 .71-1.71 1 1 0 0 0-1.09-.21 1.15 1.15 0 0 0-.33.21 1 1 0 0 0 0 1.42Zm-5 0a1 1 0 0 0 1.42 0 .93.93 0 0 0 .21-.33.94.94 0 0 0 0-.76 1 1 0 0 0-.21-.33 1 1 0 0 0-1.42 1.42Zm5 5a1.15 1.15 0 0 0 .33.21A1 1 0 0 0 41 49a1 1 0 0 0 .71-1.71 1 1 0 0 0-1.09-.21 1.15 1.15 0 0 0-.33.21 1 1 0 0 0 0 1.42Zm-5 0a1 1 0 0 0 1.42 0A1 1 0 0 0 37 48a1 1 0 0 0-.08-.38 1 1 0 0 0-.21-.33 1 1 0 0 0-1.42 1.42Zm5 5a1.15 1.15 0 0 0 .33.21A1 1 0 0 0 41 54a1 1 0 0 0 .71-1.71 1 1 0 0 0-1.09-.21 1.15 1.15 0 0 0-.33.21 1 1 0 0 0 0 1.42Zm-5 0A1 1 0 1 0 35 53a1.05 1.05 0 0 0 .29.71Zm-5-22a1 1 0 0 0 1.42-1.42 1 1 0 0 0-1.09-.21 1 1 0 0 0-.33.21 1 1 0 0 0 0 1.42Z" data-name="07 delete user, user, person, avatar, login, delete account" fill="#000000" opacity="1" data-original="#000000" class=""></path></g></svg>';

  const [modalVisible, setModalVisible] = useState(false);
  const [otp, setOtp] = useState(Array(numberOfInputs).fill(""));
  const [mobileotp, setmobileotp] = useState(Array(numberOfInputs).fill(""));
  const inputRefs = useRef(
    Array(numberOfInputs)
      .fill(null)
      .map(() => createRef()),
  );
  const mobileinputRefs = useRef(
    Array(numberOfInputs)
      .fill(null)
      .map(() => createRef()),
  );
  const [error, setError] = useState("");
  const [isbottomsheetVisible, setIsbottomsheetVisible] = useState(false);
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value;

    // You can add additional logic if needed, like moving focus to the next input

    setOtp(newOtp);
  };
  const registeredmobileotp = (index: number, value: string) => {
    const newOtp = [...mobileotp];
    newOtp[index] = value;
    setmobileotp(newOtp);
  };
  const handleSubmit = () => {
    const enteredOtp = otp.join(""); // Convert the array to a string

    if (enteredOtp.length < numberOfInputs) {
      setError(translate("Please enter the complete OTP."));
      // setModalVisible(true); // Set modalVisible to false when OTP is incomplete
    } else {
      setError("");
      // setModalVisible(false); // Set modalVisible to true only when OTP is complete
    }
  };

  const deleteaccount = () => {
    Dialog.show({
      type: ALERT_TYPE.SUCCESS,
      title: translate("SUCCESS"),
      textBody: translate("Delete Your Account Successfully"),
      button: translate("OK"),
      onPressButton: () => {
        Dialog.hide();
        setIsbottomsheetVisible(false);
      },
    });
  };

  const navigation = useNavigation();
  const handleBackPress = () => {
    navigation.goBack();
  };

  const color1 = `${colorConfig.primaryColor}15`;
  const color2 = `${colorConfig.secondaryColor}15`;

  return (
    <View style={styles.main}>
      <AppBarSecond title={translate("OTP Sumbit to Delete Acc")} />

      <ScrollView>
        <View>
          <View style={styles.mainbodyStyle}>
            <View>
              <View style={styles.userDeletestyle}>
                <SvgXml xml={deleteUser} />
              </View>
              <Text
                allowFontScaling={false}
                style={[
                  styles.attentionPlease,
                  { color: colorConfig.secondaryColor },
                ]}
              >
                {translate("Attention Please !")}
              </Text>
              <Text allowFontScaling={false} style={styles.bodymainText}>
                {translate(
                  "key_dearuser_31",
                )}
              </Text>

              <View style={styles.otpcontainer}>
                <LinearGradient
                  style={styles.LinearGradient}
                  colors={[color1, color2]}
                >
                  <Text style={styles.otptext}>
                    {translate("key_enterotp_33")}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                    }}
                  >
                    {otp.map((digit, index) => (
                      <TextInput
                        key={index}
                        ref={inputRefs.current[index]}
                        style={styles.input}
                        value={digit}
                        keyboardType="number-pad"
                        maxLength={1}
                        onChangeText={(value) => {
                          handleOtpChange(index, value);

                          if (value !== "" && index < numberOfInputs - 1) {
                            inputRefs.current[index + 1].current.focus();
                          } else if (value === "" && index > 0) {
                            inputRefs.current[index - 1].current.focus();
                          }
                        }}
                      />
                    ))}
                  </View>

                  <Text style={[styles.otptext, styles.extra]}>
                    {translate(
                      "key_enterotp_34",
                    )}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-evenly",
                    }}
                  >
                    {mobileotp.map((digitl, index) => (
                      <TextInput
                        key={index}
                        ref={mobileinputRefs.current[index]}
                        style={styles.input}
                        value={digitl}
                        keyboardType="number-pad"
                        maxLength={1}
                        onChangeText={(value) => {
                          registeredmobileotp(index, value);

                          if (value !== "" && index < numberOfInputs - 1) {
                            mobileinputRefs.current[index + 1].current.focus();
                          } else if (value === "" && index > 0) {
                            mobileinputRefs.current[index - 1].current.focus();
                          }
                        }}
                      />
                    ))}
                  </View>
                  {error ? <Text style={styles.errortext}>{error}</Text> : null}

                  <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                      setModalVisible(!modalVisible);
                    }}
                  >
                    <View style={styles.modleCenter}>
                      <View style={styles.modleItem}>
                        <Text style={styles.modleTextStyle}>
                          {translate("Are You Sure ?")}
                        </Text>
                        <View style={{ flexDirection: "row" }}>
                          <TouchableOpacity style={styles.modleButtonStyle}>
                            <LinearGradient
                              colors={[
                                colorConfig.primaryColor,
                                colorConfig.secondaryColor,
                              ]}
                            >
                              <Text
                                allowFontScaling={false}
                                style={styles.modleTextButtonStyle}
                              >
                                {translate("Delete Account")}
                              </Text>
                            </LinearGradient>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.modlecancelButton}
                          >
                            <LinearGradient
                              colors={[
                                colorConfig.primaryColor,
                                colorConfig.secondaryColor,
                              ]}
                            >
                              <Text style={styles.modleTextButtonStyle}>
                                {translate("Cancel")}
                              </Text>
                            </LinearGradient>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Modal>
                </LinearGradient>
              </View>
              <DynamicButton
                title={translate("Sumbit to Delete Account")}
                onPress={() => {
                  handleSubmit();
                  setIsbottomsheetVisible(true);
                }}
              />
            </View>
          </View>
        </View>
      </ScrollView>
      <BottomSheet
        animationType="none"  
        isVisible={isbottomsheetVisible}
        onBackdropPress={() => setIsbottomsheetVisible(false)}
      >
        <View style={styles.bottomview}>
          <View style={styles.theendstyle}>
            <TheEbdUser />
          </View>
        </View>
        <View style={styles.bottomsheetStyle}>
          <Text style={styles.modleTextStyle}>
            {translate("Are You Sure ?")}
          </Text>

          <AlertNotificationRoot>
            <View style={styles.deletAccount}>
              <TouchableOpacity
                style={styles.modleButtonStyle}
                onPress={() => {
                  // setIsbottomsheetVisible(false);
                  //  setModalVisible(true);
                  deleteaccount();
                }}
              >
                <LinearGradient
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  colors={[
                    colorConfig.primaryButtonColor,
                    colorConfig.secondaryButtonColor,
                  ]}
                >
                  <Text
                    allowFontScaling={false}
                    style={styles.modleTextButtonStyle}
                  >
                    {translate("Yes, Delete Account")}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  //  setModalVisible(false);
                  setIsbottomsheetVisible(false);
                }}
                style={styles.modlecancelButton}
              >
                <View
                  style={[
                    styles.cancelbtn,
                    {
                      borderColor: colorConfig.secondaryColor,
                    },
                  ]}
                >
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.bottomsheetTextStyle,
                      {
                        color: colorConfig.secondaryColor,
                      },
                    ]}
                  >
                    {translate("Cancel")}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </AlertNotificationRoot>
        </View>
      </BottomSheet>
    </View>
  );
};
const styles = StyleSheet.create({
  main: {
    width: "100%",
    height: "100%",
  },
  userDeletestyle: {
    marginTop: hScale(20),
    justifyContent: "center",
    alignItems: "center",
  },
  mainbodyStyle: {
    justifyContent: "center",
    alignSelf: "center",
    width: "100%",
    paddingHorizontal: wScale(20),
  },
  attentionPlease: {
    fontSize: wScale(32),
    fontWeight: "bold",
    marginTop: hScale(5),
    marginBottom: hScale(5),
    justifyContent: "center",
    alignSelf: "center",
  },

  bodymainText: {
    fontSize: wScale(22),
    textAlign: "justify",
    marginBottom: hScale(20),
    color: "#000",
  },
  otpcontainer: {
    borderWidth: wScale(2),
    borderColor: "#fff",
    borderRadius: wScale(5),
    elevation: 5,
    backgroundColor: "#fff",
    marginBottom: wScale(30),
  },
  LinearGradient: {
    paddingVertical: hScale(10),
    paddingHorizontal: wScale(15),
  },
  otptext: {
    color: "#000",
    fontSize: wScale(15.8),
    marginBottom: hScale(10),
    fontWeight: "bold",
  },
  extra: {
    marginTop: hScale(20),
    marginBottom: hScale(10),
  },

  input: {
    width: wScale(43),
    height: hScale(40),
    borderWidth: wScale(0.4),
    borderRadius: wScale(2),
    textAlign: "center",
    fontSize: wScale(16),
    marginHorizontal: wScale(5),
    backgroundColor: "#fff",
    borderColor: "#000",
    color: "#000",
  },
  modleCenter: {
    justifyContent: "center",
    alignContent: "center",
    alignItems: "center",
    alignSelf: "center",
    height: "100%",
    width: "100%",
  },
  modleItem: {
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    alignContent: "center",
    backgroundColor: "#fff",
    width: wpScale(90),
    height: hpScale(15),
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modleTextStyle: {
    marginVertical: hScale(10),
    color: "#ff4670",
    fontSize: wScale(50),
    fontWeight: "bold",
    alignSelf: "center",
  },

  modlecancelButton: {
    paddingRight: wScale(10),
    width: "30%",
  },

  modleButtonStyle: {
    paddingHorizontal: wScale(10),
    width: "70%",
  },
  modleTextButtonStyle: {
    alignSelf: "center",
    color: "#fff",
    fontSize: wScale(16),
    fontWeight: "normal",
    padding: wScale(13),
  },
  deletAccount: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: hScale(20),
  },
  cancelbtn: {
    borderWidth: wScale(1),
  },
  errortext: {
    color: "red",
    marginTop: hScale(10),
  },
  bottomview: {
    alignSelf: "center",
    marginBottom: -21,
    zIndex: 2,
  },
  bottomsheetTextStyle: {
    alignSelf: "center",
    fontSize: wScale(16),
    fontWeight: "normal",
    padding: wScale(12),
  },
  bottomsheetStyle: {
    backgroundColor: "#fff",
    height: hScale(200),
    width: "100%",
    justifyContent: "space-between",
    paddingTop: hScale(30),
  },
  theendstyle: {
    backgroundColor: "#fff",
    paddingLeft: wScale(15),
    paddingRight: wScale(15),
    paddingTop: wScale(15),
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    width: wScale(210),
    alignItems: "center",
  },
});
export default AreYousuareUserDelete;
