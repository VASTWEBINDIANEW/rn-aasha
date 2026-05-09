import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { FlashList } from "@shopify/flash-list";
import { SCREEN_HEIGHT, hScale, wScale } from "../utils/styles/dimensions";
import ClosseModalSvg2 from "../features/drawer/svgimgcomponents/ClosseModal2";
import { useSelector } from "react-redux";
import { RootState } from "../reduxUtils/store";
import { colors } from "../utils/styles/theme";

type Props = {
  visible: boolean;
  onClose: () => void;
  data: any[];
  onSelect: (item: any) => void;
  labelKey?: string;
  idKey?: string;
  title?: string;
};

const BankListModal = ({
  visible,
  onClose,
  data = [],
  onSelect,
  labelKey = "bankName",
  idKey = "idno",
  title = "Select Bank",
}: Props) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const [searchQuery, setSearchQuery] = useState("");

  // Memoized search for performance
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    return data.filter((item) =>
      item?.[labelKey]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, data, labelKey]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.contentContainer}
      >
        <View style={styles.sheet}>
          {/* Header Bar Indicator */}
          <View style={styles.dragIndicator} />

          {/* Header */}
          <View style={[styles.header, { backgroundColor: colorConfig.secondaryColor + '15' }]}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <ClosseModalSvg2 size={30} />
            </TouchableOpacity>
          </View>

          {/* Search Section */}
          <View style={styles.searchWrapper}>
            <TextInput
              placeholder="Search bank name..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[styles.searchBar, { borderColor: colorConfig.secondaryColor + '40' }]}
              placeholderTextColor={colors.black75 || "#999"}
              cursorColor={colorConfig.secondaryColor}
              clearButtonMode="while-editing"
            />
          </View>

          {/* List Area */}
          <View style={{ flex: 1 }}>
            <FlashList
              data={filteredData}
              estimatedItemSize={65}
              keyExtractor={(item, index) => item?.[idKey]?.toString() || index.toString()}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
                </View>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  activeOpacity={0.6}
                  style={styles.item}
                  onPress={() => {
                    onSelect(item);
                    setSearchQuery(""); // Clear search on select
                  }}
                >
                  <View style={[styles.avatar, { backgroundColor: colorConfig.secondaryColor + '10' }]}>
                    <Text style={{ color: colorConfig.secondaryColor, fontWeight: 'bold' }}>
                      {item?.[labelKey]?.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.itemText}>{item?.[labelKey] ?? "N/A"}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default BankListModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  contentContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  sheet: {
    backgroundColor: "#fff",
    height: SCREEN_HEIGHT / 1.3,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: "hidden",
  },
  dragIndicator: {
    width: 40,
    height: 5,
    backgroundColor: "#E5E5EA",
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: hScale(12),
    paddingHorizontal: wScale(20),
  },
  title: {
    fontSize: wScale(18),
    fontWeight: "700",
    color: "#1C1C1E",
    flex: 1,
  },
  searchWrapper: {
    padding: wScale(15),
    backgroundColor: "#fff",
  },
  searchBar: {
    height: hScale(48),
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: wScale(15),
    color: "#000",
    fontSize: wScale(16),
    backgroundColor: "#FAFAFA",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hScale(12),
    paddingHorizontal: wScale(20),
    borderBottomWidth: 0.5,
    borderBottomColor: "#F2F2F7",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  itemText: {
    fontSize: wScale(16),
    color: "#3A3A3C",
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#8E8E93",
  },
});
