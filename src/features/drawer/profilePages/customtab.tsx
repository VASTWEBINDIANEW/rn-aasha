import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { translate } from "../../../utils/languageUtils/I18n";
const CustomTabBar = ({ tabs, activeTab, onPress }) => {
  return (
    <View style={styles.container}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.tabItem, activeTab === index && styles.activeTabItem]}
          onPress={() => onPress(index)}
        >
          <Text style={styles.tabText}>{translate(tab)}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#eee",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
  },
  activeTabItem: {
    backgroundColor: "lightblue",
    borderRadius: 10,
  },
  tabText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CustomTabBar;
