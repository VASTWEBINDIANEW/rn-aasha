import React, { useCallback, useEffect, useState } from "react";
import { translate } from "../../utils/languageUtils/I18n";
import {
  View,
  Text,
  ToastAndroid,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  BackHandler,
} from "react-native";
import AppBarSecond from "../drawer/headerAppbar/AppBarSecond";
import useAxiosHook from "../../utils/network/AxiosClient";
import { APP_URLS } from "../../utils/network/urls";
import DynamicButton from "../drawer/button/DynamicButton";
import OTPModal from "../../components/OTPModal";
import FlotingInput from "../drawer/securityPages/FlotingInput";
import { useNavigation } from "../../utils/navigation/NavigationService";
import ShowLoader from "../../components/ShowLoder";
import { hScale, wScale } from "../../utils/styles/dimensions";
import { useDispatch } from "react-redux";
import { reset } from "../../reduxUtils/store/userInfoSlice";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const AadhrPanVerify = ({ route }) => {
  const { verify_type, pancard, aadharcard } = route.params;
  const navigation = useNavigation();
  const { get, post } = useAxiosHook();
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [mobileOtp, setMobileOtp] = useState("");
  const [reqData, setReqData] = useState([]);
  const [adharN, setAdharN] = useState(aadharcard || "");
  const [pan, setPan] = useState(pancard || "");
  const [loading, setisLoading] = useState(false);
  const [isPan, setIsPan] = useState(null);
  const [isAdd, setIsAdd] = useState(null);

  useEffect(() => {
    // navigation.navigate('DashboardScreen')
    setIsPan(verify_type === "pan" || verify_type === "all");
    setIsAdd(verify_type === "adhar" || verify_type === "all");
    console.log("Verification Type:", verify_type);
    console.log("Pan Card:", pancard);
    console.log("Aadhar Card:", aadharcard);
  }, [verify_type, pancard, aadharcard]);

  const showToast = (message) => {
    ToastAndroid.showWithGravity(
      message,
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
    );
  };

  const handleAadharValidation = async (adharnumber) => {
    const response = await get({
      url: `${APP_URLS.aadharValidation}${adharN}`,
    });
    if (response["status"] !== true) {
      setisLoading(false);
      showToast(translate("Please Enter Valid Aadhar number"));
      return false;
    }
    setisLoading(false);

    return true;
  };

  const PanVerification = useCallback(async () => {
    setisLoading(true);
    const response = await get({
      url: `${APP_URLS.PanVerification}?pancard=${pan}`,
    });

    console.log(`${APP_URLS.PanVerification}?pancard=${pan}`);
    console.log(response);
    if (response.Status) {
      setIsPan(null);
      Alert.alert(
        translate("Pan Verification"),
        translate("Pan Verification Done"),
        [
          {
            text: translate("OK"),
            onPress: () => navigation.navigate("Dashboard"),
          },
        ],
      );
    } else {
      showToast(response.Message);
    }
    setisLoading(false);
  }, [pan, navigation]);

  const getOtp = async () => {
    setisLoading(true);

    const isValid = await handleAadharValidation(adharN);
    if (!isValid) return;
    const response = await get({
      url: `${APP_URLS.AadharVerificationOtpSent}aadhar=${2100900202536}`,
    });

    console.log(response);
    if (response.Status) {
      setisLoading(false);
      setReqData(response);
      setOtpModalVisible(true);
    } else {
      setisLoading(false);
      showToast(response.Message);
    }
    setisLoading(false);
  };

  const submitOtp = async () => {
    if (mobileOtp.length !== 6) return;
    setisLoading(true);

    const url = new URL(APP_URLS.AadharVerificationOtpVerify);
    url.searchParams.append("client_id", reqData.clientId);
    url.searchParams.append("otp", mobileOtp);
    url.searchParams.append("txnid", reqData.txnid);
    url.searchParams.append("aadhar", adharN);

    const res = await get({
      url: url.toString(),
    });

    console.log({
      client_id: reqData.clientId,
      otp: mobileOtp,
      txnid: reqData.txnid,
      aadhar: adharN,
    });

    console.log(url.toString());
    console.log(`${res}`);

    if (res.Status) {
      setIsAdd(null);
      setOtpModalVisible(false);
      Alert.alert(
        translate("Aadhar Verification"),
        translate("Aadhar Verification Done"),
        [
          {
            text: translate("OK"),
            onPress: () => navigation.navigate("HomeScreen"),
          },
        ],
      );
    } else {
      showToast(res.Message);
    }
    setisLoading(false);
  };

  const handleButtonPress = () => {
    getOtp();
  };
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(reset());
  };

  const [lastPress, setLastPress] = useState(0); // Store the last press time

  const handleBackPress = () => {
    const currentTime = new Date().getTime();
    const timeDifference = currentTime - lastPress;

    if (timeDifference < 2000) {
      // If the difference is less than 2 seconds, exit the app
      // Exit the app
      BackHandler.exitApp();
    } else {
      // Show toast message if the back button is pressed once, but not twice quickly
      ToastAndroid.show(
        translate("Press back again to exit"),
        ToastAndroid.SHORT,
      );
    }

    setLastPress(currentTime); // Update the last press time
    return true; // Prevent the default back action
  };

  // Add event listener for the back button
  React.useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", handleBackPress);

    // Clean up the event listener when the component is unmounted
    return () => {
      BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
    };
  }, [lastPress]);

  return (
    <View style={styles.main}>
      <AppBarSecond
        title={translate("Aadhar Pan Verify")}
        onPressBack={undefined}
      />
   <KeyboardAwareScrollView
    style={{ flex: 1 }}
    contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
    enableOnAndroid={true}
    keyboardShouldPersistTaps="handled"
    extraScrollHeight={100} // कीबोर्ड से ऊपर रखने के लिए
  >
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.titleText}>
              {translate("Aadhaar e-Verification Due!")}
            </Text>
            <Text style={styles.subtitleText}>
              {translate(
                "key_dearbusin_27",
              )}
            </Text>
          </View>
          {isAdd && (verify_type === "aadhar" || verify_type === "all") ? (
            <FlotingInput
              label={translate("Aadhar No")}
              value={adharN}
              onChangeText={setAdharN}
              keyboardType="number-pad"
              maxLength={12}
              containerStyle={styles.inputContainer}
              onChangeTextCallback={(t) => {
                setAdharN(t);
              }}
            />
          ) : null}
          {isAdd && (verify_type == "aadhar" || verify_type == "all") ? (
            <DynamicButton
              title={translate("Get OTP")}
              onPress={handleButtonPress}
              style={styles.button}
            />
          ) : null}
          {isPan && (verify_type == "pan" || verify_type == "all") ? (
            <View style={styles.headerContainer}>
              <Text style={styles.titleText}>
                {translate("PanCard Verification Due!")}
              </Text>
              <Text style={styles.subtitleText}>
                {translate(
                  "key_dearuser_30",
                )}
              </Text>
            </View>
          ) : null}

          {isPan && (verify_type == "pan" || verify_type == "all") ? (
            <FlotingInput
              label={translate("Pan No")}
              value={pan}
              onChangeText={setPan}
              maxLength={10}
              containerStyle={styles.inputContainer}
              autoCapitalize={"characters"}
              onChangeTextCallback={(t) => {
                setPan(t);
              }}
            />
          ) : null}

          <OTPModal
            setShowOtpModal={setOtpModalVisible}
            disabled={mobileOtp.length !== 6}
            inputCount={6}
            showOtpModal={otpModalVisible}
            setMobileOtp={setMobileOtp}
            verifyOtp={submitOtp}
          />

          {isPan && (verify_type == "pan" || verify_type == "all") ? (
            <DynamicButton
              title={translate("Verify Pan")}
              onPress={() => PanVerification()}
              style={styles.button}
            />
          ) : null}
          {isAdd == null && isPan == null ? (
            <DynamicButton
              title={translate("Log out")}
              onPress={handleLogout}
              style={styles.button}
            />
          ) : null}
          {loading && <ShowLoader />}
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  container: {
    paddingHorizontal: wScale(20),
    backgroundColor: "#F7F7F7",
  },
  headerContainer: {
    marginVertical: hScale(20),
  },
  titleText: {
    fontSize: hScale(18),
    fontWeight: "bold",
    color: "#333",
  },
  subtitleText: {
    fontSize: hScale(14),
    color: "#666",
    marginTop: hScale(8),
  },
  inputContainer: {
    marginVertical: hScale(10),
  },
  button: {
    marginTop: hScale(20),
    width: "100%",
    alignSelf: "center",
  },
});

export default AadhrPanVerify;
