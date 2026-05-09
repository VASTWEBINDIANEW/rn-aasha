import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from "react-native";
import FlotingInput from "../drawer/securityPages/FlotingInput";
import ClosseModalSvg2 from "../drawer/svgimgcomponents/ClosseModal2";
import { hScale, wScale } from "../../utils/styles/dimensions";
import { useSelector } from "react-redux";
import { RootState } from "../../reduxUtils/store";
import { SCREEN_HEIGHT } from "@gorhom/bottom-sheet";
import OnelineDropdownSvg from "../drawer/svgimgcomponents/simpledropdown";
import { translate } from "../../utils/languageUtils/I18n";

const AmountDropdown = ({ value, onSelect, options }) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}20`;
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <TouchableOpacity onPress={() => setVisible(true)}>
        <FlotingInput
          label={"Select Payment Mode"}
          value={value}
          editable={false}
        />
        <View style={styles.righticon2}>
          <OnelineDropdownSvg />
        </View>
      </TouchableOpacity>

      {/* Bottom Sheet Modal */}
      <Modal transparent visible={visible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.sheetContainer}>
            {/* Header */}
            <View style={[styles.StateTitle, { backgroundColor: color1 }]}>
              <View style={styles.titleview}>
                <Text style={styles.stateTitletext}>
                  {translate("Select Your Payment Mode")}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setVisible(false)}
                activeOpacity={0.7}
              >
                <ClosseModalSvg2 size={35} />
              </TouchableOpacity>
            </View>

            {/* Options */}
            <View style={styles.dropdownBox}>
              <View>
                <FlatList
                  data={options}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.option}
                      onPress={() => {
                        onSelect(item);
                        setVisible(false);
                      }}
                    >
                      <Text style={styles.optionText}>{translate(item)}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.3)",
  },

  sheetContainer: {
    backgroundColor: "#fff", // ✅ FIXED
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },

  dropdownBox: {
    backgroundColor: "#fff",
    padding: 10,
    minHeight: SCREEN_HEIGHT * 0.5,
  },

  option: {
    padding: 12,
    borderBottomWidth: 0.4,
    borderColor: "#ccc",
  },

  optionText: {
    fontSize: 16,
    color: "#000",
  },

  StateTitle: {
    paddingVertical: hScale(10),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: wScale(10),
  },

  titleview: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },

  stateTitletext: {
    fontSize: wScale(20),
    color: "#000",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  righticon2: {
    position: "absolute",
    left: "auto",
    right: wScale(0),
    top: hScale(0),
    height: "85%",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: wScale(12),
  },
});

export default AmountDropdown;
