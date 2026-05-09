import React from "react";
import { View, Text } from "react-native";
import AppBar from "./headerAppbar/AppBar";
import { translate } from "../../utils/languageUtils/I18n";

const Administrator = () => {
  return (
    <View>
      <AppBar
        title={"Manage Important Security"}
        actionButton={undefined}
        onActionPress={undefined}
      />
    </View>
  );
};
export default Administrator;
