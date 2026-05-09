import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import BackArrow from "../MenuPage/drawerbacksvg";
import { useNavigation } from "@react-navigation/native";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import { useSelector } from "react-redux";
import { RootState } from "../../../reduxUtils/store";
import { translate } from "../../../utils/languageUtils/I18n";
const AppBar = ({ title, actionButton, onActionPress, onPressBack }) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  const navigation = useNavigation();
  const handleBack = () => {
    if (onPressBack) {
      onPressBack();
    } else {
      navigation.goBack();
    }
  };
  const onPressDeleteUser = () => {
    navigation.navigate("DeletUser");
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backbutton} onPress={handleBack}>
        <BackArrow />
      </TouchableOpacity>
      <Text style={[styles.titletext, { color: colorConfig.secondaryColor }]}>
        {translate(title)}
      </Text>
      {actionButton && (
        <TouchableOpacity
          style={styles.optionalbtn}
          onPress={onPressDeleteUser}
        >
          <Text>{translate(actionButton)}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    flexDirection: "row",
    borderRadius: wScale(5),
    alignItems: "center",
    marginHorizontal: wScale(10),
    marginTop: hScale(10),
    marginBottom: hScale(10),
    elevation: 5,
    shadowColor: "#000",
  },
  titletext: {
    fontSize: wScale(25),
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
    borderColor: "rgba(25,25,2,0.3)",
    borderLeftWidth: wScale(0.8),
  },
  backbutton: {
    width: wScale(60),
    height: hScale(42),
    justifyContent: "center",
    alignItems: "center",
  },
  optionalbtn: {
    width: wScale(60),
    justifyContent: "center",
    alignItems: "center",
  },
});
export default AppBar;
