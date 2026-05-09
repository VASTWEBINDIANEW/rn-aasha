import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import Feather from "react-native-vector-icons/Feather";
import { translate } from "../utils/languageUtils/I18n";

const ConnectionLost = ({ onRetry }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f1f5f9" />

      <View style={styles.card}>
        <View style={styles.iconBox}>
          <Feather name="wifi-off" size={48} color="#ef4444" />
        </View>

        <Text style={styles.title}>{translate("Connection_Lost")}</Text>

        <Text style={styles.subtitle}>{translate("key_internetc_126")}</Text>

        <TouchableOpacity activeOpacity={0.8} onPress={onRetry}>
          <LinearGradient
            colors={["#2563eb", "#1d4ed8"]}
            style={styles.button}
          >
            <Feather name="refresh-cw" size={18} color="#fff" />
            <Text style={styles.buttonText}>{translate("Retry")}</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ConnectionLost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
    elevation: 5,
  },

  iconBox: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#fee2e2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0f172a",
  },

  subtitle: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 25,
    lineHeight: 20,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    gap: 8,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});