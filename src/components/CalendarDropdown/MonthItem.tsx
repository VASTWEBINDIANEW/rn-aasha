import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { hScale, wScale } from "../../utils/styles/dimensions";

interface MonthItemProps {
  label: string;
  onPress: () => void;
}

export const MonthItem = ({ label, onPress }: MonthItemProps) => {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: {
    paddingVertical: hScale(12),
    paddingHorizontal: wScale(15),
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  label: {
    fontSize: wScale(20),
    color: "#000",
  },
});
