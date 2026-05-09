import React, { useEffect, useRef, useState } from "react";
import {
  Image,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  TextInput,
  Keyboard,
  Platform,
} from "react-native";
import { BottomSheet } from "@rneui/themed";
import { FlashList } from "@shopify/flash-list";
import { useSelector } from "react-redux";
import { useSafeAreaInsets } from "react-native-safe-area-context"; // ✅ ADD
import { RootState } from "../reduxUtils/store";
import { SCREEN_HEIGHT, hScale, wScale } from "../utils/styles/dimensions";
import ClosseModalSvg2 from "../features/drawer/svgimgcomponents/ClosseModal2";
import { colors } from "../utils/styles/theme";

interface Props {
  operatorData: any[];
  stateData: any[];
  isModalVisible: boolean;
  selectedOperator: string;
  setModalVisible: (v: boolean) => void;
  selectOperator: (name: string) => void;
  setOperatorcode: (code: string) => void;
  setCircle: (circle: string) => void;
  setState: (state: string) => void;
  showState?: boolean;
  setOperator?: (name: string) => void;
  selectOperatorImage: (path: string) => void;
  path: string;
  handleItemPress?: (item: any) => void;
}

const OperatorItem = React.memo(({
  item,
  isOperator,
  onPress,
  primaryColor,
}: {
  item: any;
  isOperator: boolean;
  onPress: () => void;
  primaryColor: string;
}) => (
  <TouchableOpacity
    style={styles.itemRow}
    onPress={onPress}
    activeOpacity={0.75}
  >
    <View style={[styles.iconBox, { backgroundColor: `${primaryColor}15` }]}>
      {isOperator && item["path"] ? (
        <Image source={{ uri: item["path"] }} style={styles.itemImg} />
      ) : (
        <Text style={[styles.iconFallback, { color: primaryColor }]}>
          {(isOperator ? item["Operatorname"] : item["State Name"])
            ?.charAt(0)
            ?.toUpperCase()}
        </Text>
      )}
    </View>
    <Text style={styles.itemName} numberOfLines={1} ellipsizeMode="tail">
      {isOperator ? item["Operatorname"] : item["State Name"]}
    </Text>
    <Text style={[styles.chevron, { color: primaryColor }]}>›</Text>
  </TouchableOpacity>
));

const SheetHeader = ({
  isOperator,
  selectedOperator,
  path,
  primaryColor,
  bgColor,
  onClose,
}: {
  isOperator: boolean;
  selectedOperator: string;
  path: string;
  primaryColor: string;
  bgColor: string;
  onClose: () => void;
}) => (
  <View style={[styles.header, { backgroundColor: bgColor }]}>
    <View style={styles.dragHandle} />
    <View style={styles.headerContent}>
      <View style={styles.headerLeft}>
        {!isOperator && path ? (
          <Image source={{ uri: path }} style={styles.headerImg} />
        ) : null}
        <View>
          {!isOperator && (
            <Text style={[styles.headerSub, { color: primaryColor }]}>
              {selectedOperator}
            </Text>
          )}
          <Text style={styles.headerTitle}>
            {isOperator ? "Select Operator" : "Select Circle"}
          </Text>
        </View>
      </View>
      {isOperator && (
        <TouchableOpacity
          onPress={onClose}
          activeOpacity={0.7}
          style={[styles.closeBtn, { backgroundColor: `${primaryColor}18` }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ClosseModalSvg2 />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

const SearchBar = ({
  value,
  onChangeText,
  placeholder,
  primaryColor,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  primaryColor: string;
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <View
      style={[
        styles.searchWrapper,
        { borderColor: focused ? primaryColor : '#E0E0E0' },
      ]}
    >
      <Text style={[styles.searchIcon, { color: focused ? primaryColor : '#aaa' }]}>⌕</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#bbb"
        style={styles.searchInput}
        returnKeyType="search"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoCorrect={false}
        cursorColor={primaryColor}
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.clearBtn}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// ─────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────
const OperatorBottomSheet: React.FC<Props> = ({
  operatorData,
  stateData,
  isModalVisible,
  selectedOperator,
  setModalVisible,
  selectOperator,
  setOperatorcode,
  setCircle,
  setState,
  showState = false,
  setOperator,
  selectOperatorImage,
  path,
  handleItemPress,
}) => {
  const insets = useSafeAreaInsets(); // ✅ ADD
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const primaryColor = colorConfig.primaryColor;
  const bgColor = `${primaryColor}18`;

  const [selectbool, setSelectbool] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!isModalVisible) {
      setSearchQuery('');
      setSelectbool(true);
    }
  }, [isModalVisible]);

  const activeList = selectbool ? operatorData : stateData;
  const filteredData = activeList.filter(item => {
    const name = selectbool ? item["Operatorname"] : item["State Name"];
    return name?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleItemTap = (item: any) => {
    Keyboard.dismiss();
    if (!showState) {
      selectOperator(item["Operatorname"]);
      setOperatorcode(item["OPtCode"]);
      selectOperatorImage(item["path"]);
      handleItemPress?.(item);
      setModalVisible(false);
      return;
    }
    if (selectbool) {
      setOperator?.(item["Operatorname"]);
      setOperatorcode(item["OPtCode"]);
      selectOperatorImage(item["path"]);
      handleItemPress?.(item);
      setSelectbool(false);
    } else {
      setCircle(item["State Name"]);
      setState(item["Sate Name"]);
      setModalVisible(false);
    }
  };

  return (
    <BottomSheet
      animationType="none"
      isVisible={isModalVisible}
      keyboardShouldPersistTaps="handled"
      onBackdropPress={() => {
        Keyboard.dismiss();
        setModalVisible(false);
      }}
    >
      {/* ✅ paddingBottom: insets.bottom add kiya sheet mein */}
      <View style={[styles.sheet, { paddingBottom: insets.bottom }]}>

        <SheetHeader
          isOperator={selectbool}
          selectedOperator={selectedOperator}
          path={path}
          primaryColor={primaryColor}
          bgColor={bgColor}
          onClose={() => setModalVisible(false)}
        />

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={selectbool ? "Search operator..." : "Search circle..."}
          primaryColor={primaryColor}
        />

        {showState && (
          <View style={styles.stepRow}>
            <View style={[styles.stepDot, { backgroundColor: primaryColor }]} />
            <View style={[styles.stepLine, { backgroundColor: selectbool ? '#ddd' : primaryColor }]} />
            <View style={[styles.stepDot, { backgroundColor: selectbool ? '#ddd' : primaryColor }]} />
            <Text style={[styles.stepText, { color: '#888' }]}>
              {selectbool ? "Step 1 of 2: Choose Operator" : "Step 2 of 2: Choose Circle"}
            </Text>
          </View>
        )}

        {filteredData.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No results for "{searchQuery}"</Text>
          </View>
        ) : (
          <FlashList
            data={filteredData}
            keyboardShouldPersistTaps="always"
            estimatedItemSize={64}
            keyExtractor={(item, i) =>
              selectbool ? item["OPtCode"] ?? String(i) : item["State Name"] ?? String(i)
            }
            contentContainerStyle={{
              paddingBottom: hScale(30), // ✅ insets.bottom sheet level par handle ho raha hai
            }}
            renderItem={({ item }) => (
              <OperatorItem
                item={item}
                isOperator={selectbool}
                onPress={() => handleItemTap(item)}
                primaryColor={primaryColor}
              />
            )}
          />
        )}
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: "#fff",
    height: SCREEN_HEIGHT / 1.3,
    borderTopLeftRadius: wScale(20),
    borderTopRightRadius: wScale(20),
    overflow: "hidden",
  },

  header: {
    borderTopLeftRadius: wScale(20),
    borderTopRightRadius: wScale(20),
    paddingBottom: hScale(12),
  },
  dragHandle: {
    width: wScale(36),
    height: hScale(4),
    borderRadius: 4,
    backgroundColor: "#ccc",
    alignSelf: "center",
    marginTop: hScale(10),
    marginBottom: hScale(8),
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: wScale(16),
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: wScale(10),
    flex: 1,
  },
  headerImg: {
    width: wScale(42),
    height: wScale(42),
    borderRadius: wScale(8),
    resizeMode: "contain",
  },
  headerTitle: {
    fontSize: wScale(17),
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: 0.2,
  },
  headerSub: {
    fontSize: wScale(12),
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: hScale(2),
  },
  closeBtn: {
    padding: wScale(8),
    borderRadius: wScale(20),
  },

  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: wScale(12),
    marginHorizontal: wScale(14),
    marginBottom: hScale(10),
    paddingHorizontal: wScale(12),
    backgroundColor: "#FAFAFA",
    height: hScale(46),
  },
  searchIcon: {
    fontSize: wScale(20),
    marginRight: wScale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: wScale(15),
    color: "#222",
    padding: 0,
  },
  clearBtn: {
    fontSize: wScale(13),
    color: "#aaa",
    paddingLeft: wScale(8),
  },

  stepRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wScale(16),
    marginBottom: hScale(8),
    gap: wScale(4),
  },
  stepDot: {
    width: wScale(8),
    height: wScale(8),
    borderRadius: 4,
  },
  stepLine: {
    flex: 0,
    width: wScale(20),
    height: hScale(2),
    borderRadius: 2,
  },
  stepText: {
    fontSize: wScale(12),
    marginLeft: wScale(6),
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: hScale(12),
    paddingHorizontal: wScale(16),
    borderBottomWidth: 0.8,
    borderBottomColor: "#F0F0F0",
  },
  iconBox: {
    width: wScale(42),
    height: wScale(42),
    borderRadius: wScale(10),
    alignItems: "center",
    justifyContent: "center",
    marginRight: wScale(12),
    overflow: "hidden",
  },
  itemImg: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  iconFallback: {
    fontSize: wScale(18),
    fontWeight: "700",
  },
  itemName: {
    flex: 1,
    fontSize: wScale(15),
    color: "#222",
    fontWeight: "500",
    textTransform: "capitalize",
  },
  chevron: {
    fontSize: wScale(22),
    fontWeight: "300",
    marginLeft: wScale(8),
  },

  emptyBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: hScale(60),
  },
  emptyIcon: {
    fontSize: wScale(36),
    marginBottom: hScale(10),
  },
  emptyText: {
    fontSize: wScale(14),
    color: "#aaa",
  },
});

export default OperatorBottomSheet;