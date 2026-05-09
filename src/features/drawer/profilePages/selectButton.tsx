import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { setColorConfig } from "../../../reduxUtils/store/userInfoSlice";
import { useSelector } from "react-redux";
import { State } from "react-native-gesture-handler";
import { RootState } from "../../../reduxUtils/store";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import CheckSvg from "../svgimgcomponents/CheckSvg";
import { translate } from "../../../utils/languageUtils/I18n";

const SelectableButton = ({ setselectedopt }) => {
  const { colorConfig } = useSelector((State: RootState) => State.userInfo);
  const [selectedButton, setSelectedButton] = useState(translate("button1"));
  const handleButtonPress = (button) => {
    setSelectedButton(button);
    setselectedopt(true);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          { borderColor: colorConfig.secondaryColor },
          selectedButton === "button1" && {
            backgroundColor: colorConfig.secondaryColor,
          },
          styles.selectedButton,
        ]}
        onPress={() => handleButtonPress("button1")}
      >
        <Text
          style={[
            styles.buttonText,

            selectedButton === "button1" && styles.selectedButtonText,
          ]}
        >
          {translate("Personal Information")}
        </Text>
        <View
          style={[
            styles.rightbutn,
            selectedButton === "button1" && styles.rightbutn2,
          ]}
        >
          {selectedButton === "button1" && (
            // <Text style={styles.selectedButtonText}>✓</Text>
            <CheckSvg size={15} />
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.button,
          { borderColor: colorConfig.secondaryColor },
          selectedButton === "button2" && {
            backgroundColor: colorConfig.secondaryColor,
          },
          styles.selectedButton,
        ]}
        onPress={() => {
          handleButtonPress("button2");
          setselectedopt(false);
        }}
      >
        <Text
          style={[
            styles.buttonText,
            selectedButton === "button2" && styles.selectedButtonText,
          ]}
        >
          {translate("KYC Info & Docs")}
        </Text>

        <View
          style={[
            styles.rightbutn,
            selectedButton === "button2" && styles.rightbutn2,
          ]}
        >
          {selectedButton === "button2" && (
            // <Text style={styles.selectedButtonText}>✓</Text>
            <CheckSvg size={15} />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    backgroundColor: "#fff",
    paddingHorizontal: wScale(5),
    borderRadius: 5,
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    justifyContent: "space-between",
    paddingVertical: hScale(10),
    borderWidth: wScale(0.5),
  },
  selectedButton: {
    borderWidth: wScale(0.5),
  },
  buttonText: {
    color: "#000",
    marginRight: wScale(5),
    fontSize: wScale(14),
  },
  selectedButtonText: {
    fontWeight: "bold",
    color: "#fff",
  },
  rightbutn: {
    borderWidth: wScale(1),
    borderColor: "#000",
    borderRadius: 20,
    height: wScale(25),
    width: wScale(25),
    alignItems: "center",
    justifyContent: "center",
  },
  rightbutn2: {
    borderColor: "#fff",
  },
});

export default SelectableButton;
