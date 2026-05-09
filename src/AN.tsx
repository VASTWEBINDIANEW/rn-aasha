import { translate } from "./utils/languageUtils/I18n";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Button,
  Modal,
  Platform
} from "react-native";
import { BottomSheet } from "@rneui/themed";

export default function TestingScreen() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{translate("RNEUI_BottomSheet_Example")}</Text>

      <TouchableOpacity
        style={styles.btn}
        onPress={() => setIsVisible(true)}
      >
        <Text style={styles.btnText}>{translate("Open_BottomSheet")}</Text>
      </TouchableOpacity>

      <BottomSheet
        ModalComponent={Modal}                 // 🔥 Required
        animationType="none"                   // 🔥 Important (better than none)
        statusBarTranslucent                   // 🔥 Android fix
        isVisible={isVisible}
        onBackdropPress={() => setIsVisible(false)}
        backdropStyle={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <View style={styles.sheetContainer}>
          <Text style={styles.sheetTitle}>{translate("RNEUI_BottomSheet")}</Text>
          <Text>{translate("New_Architecture_stable_version")}</Text>
          <Button title="Close" onPress={() => setIsVisible(false)} />
        </View>
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5"
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 30
  },
  btn: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#333",
    width: "80%"
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600"
  },
  sheetContainer: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: 300
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10
  }
});