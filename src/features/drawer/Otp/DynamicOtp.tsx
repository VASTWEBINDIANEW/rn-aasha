import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import { useSelector } from "react-redux";
import { RootState } from "../../../reduxUtils/store";
import { colors } from "../../../utils/styles/theme";
import { translate } from "../../../utils/languageUtils/I18n";

const DynamicOtp = ({ otp, setOtp }) => {
  const [error, setError] = useState("");
  const inputRefs = useRef(otp.map(() => React.createRef()));

  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  const numberOfInputs = 6;
  const color1 = `${colorConfig.primaryColor}15`;
  const color2 = `${colorConfig.secondaryColor}15`;

  const predefinedOtp = "123456";

  const handleOtpChange = useCallback(
    (index, value) => {
      const updatedOtp = [...otp];
      updatedOtp[index] = value;
      setOtp(updatedOtp);

      const enteredOtp = updatedOtp.join("");

      if (enteredOtp.length === numberOfInputs) {
        if (enteredOtp === predefinedOtp) {
          console.log("✅ Correct OTP");
          setError("");
        } else {
          console.warn("❌ Incorrect OTP");
          setError("Incorrect OTP. Please try again.");
        }
      }
    },
    [otp, setOtp],
  );

  useEffect(() => {
    const isOtpComplete = otp.every((digit) => digit !== "");
    if (isOtpComplete) {
      Keyboard.dismiss();
      console.log("All 6 digits entered");
    }
  }, [otp]);

  return (
    <View style={styles.container}>
      <View style={styles.otpcontainer}>
        <View
          style={[
            styles.texttitalView,
            { backgroundColor: colorConfig.primaryColor },
          ]}
        >
          <Text style={styles.texttital}>{translate("ENTER OTP")}</Text>
        </View>

        <Text style={styles.otptext}>
          {translate(
            "key_otpwillb_59",
          )}
        </Text>

        <LinearGradient
          style={styles.LinearGradient}
          colors={[color1, color2]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        >
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={inputRefs.current[index]}
                style={[
                  styles.input,
                  {
                    backgroundColor: digit !== "" ? "#c6f6d5" : "#fff", // light green if filled
                    borderColor: digit !== "" ? "green" : "#000",
                  },
                ]}
                value={digit}
                keyboardType="number-pad"
                maxLength={1}
                onChangeText={(value) => {
                  handleOtpChange(index, value);

                  if (value !== "" && index < numberOfInputs - 1) {
                    inputRefs.current[index + 1]?.current?.focus();
                  } else if (value === "" && index > 0) {
                    inputRefs.current[index - 1]?.current?.focus();
                  }
                }}
              />
            ))}
          </View>

          {/* {error ? <Text style={styles.errortext}>{error}</Text> : null} */}
        </LinearGradient>

        <TouchableOpacity style={styles.resend}>
          <Text style={styles.resendtext}>{translate("Resend OTP")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  LinearGradient: {
    paddingVertical: hScale(10),
    paddingHorizontal: wScale(10),
    marginBottom: hScale(5),
  },
  otpcontainer: {
    borderRadius: wScale(5),
    backgroundColor: "#fff",
    paddingHorizontal: wScale(15),
    width: "100%",
    paddingTop: hScale(50),
    paddingBottom: hScale(20),
  },
  otptext: {
    color: "#000",
    fontSize: wScale(16),
    marginBottom: hScale(20),
    fontWeight: "bold",
  },
  input: {
    width: wScale(43),
    height: hScale(40),
    borderWidth: wScale(0.4),
    borderRadius: wScale(2),
    textAlign: "center",
    fontSize: wScale(20),
    marginHorizontal: wScale(5),
    backgroundColor: "#fff",
    borderColor: "#000",
    color: "#000",
    fontWeight: "bold",
  },
  errortext: {
    color: "red",
    marginTop: hScale(10),
    textAlign: "center",
  },
  texttitalView: {
    borderRadius: wScale(5),
    position: "absolute",
    top: hScale(-15),
    left: wScale(10),
    alignItems: "center",
    paddingBottom: wScale(3),
    paddingHorizontal: wScale(10),
  },
  texttital: {
    fontSize: wScale(28),
    color: "#fff",
  },
  resend: {
    alignSelf: "flex-end",
    paddingHorizontal: 5,
    alignItems: "center",
  },
  resendtext: {
    fontSize: wScale(18),
    fontWeight: "bold",
    color: colors.black75,
  },
});

export default DynamicOtp;
