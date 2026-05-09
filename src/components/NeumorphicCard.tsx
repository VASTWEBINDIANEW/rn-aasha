import React from "react";
import { View, StyleSheet } from "react-native";

const NeumorphicCard = ({ children, style }) => {
  return (
    <View style={[styles.shadowLight, style]}>
      <View style={styles.shadowDark}>
        {children}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  shadowLight: {
    shadowColor: "#ffffff",
    shadowOffset: { width: -6, height: -6 },
    shadowOpacity: 1,
    shadowRadius: 6,
    borderRadius: 12,
  },
  shadowDark: {
    shadowColor: "#a3b1c6",
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 6,
    backgroundColor: "#e0e0e0",
    borderRadius: 12,
    elevation: 8,
  },
});

export default NeumorphicCard;