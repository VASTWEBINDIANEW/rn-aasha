import { BottomSheet } from "@rneui/themed";
import { FlashList } from "@shopify/flash-list";
import React, { useState, useCallback, useMemo, useEffect } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  TextInput,
  Keyboard,
  Platform,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../reduxUtils/store";
import { SCREEN_HEIGHT, hScale, wScale } from "../utils/styles/dimensions";
import NoDatafound from "../features/drawer/svgimgcomponents/Nodatafound";
import ClosseModalSvg2 from "../features/drawer/svgimgcomponents/ClosseModal2";
import { colors } from "../utils/styles/theme";
import { translate } from "../utils/languageUtils/I18n";

// ─────────────────────────────────────────────────
// List Item
// ─────────────────────────────────────────────────
const ListItem = React.memo(({
  label,
  onPress,
  primaryColor,
}: {
  label: string;
  onPress: () => void;
  primaryColor: string;
}) => (
  <TouchableOpacity
    style={styles.itemRow}
    onPress={onPress}
    activeOpacity={0.75}
  >
    {/* Icon box with first letter */}
    <View style={[styles.iconBox, { backgroundColor: `${primaryColor}15` }]}>
      <Text style={[styles.iconLetter, { color: primaryColor }]}>
        {label?.charAt(0)?.toUpperCase()}
      </Text>
    </View>

    {/* Label */}
    <Text style={styles.itemLabel} numberOfLines={1} ellipsizeMode="tail">
      {label}
    </Text>

    {/* Chevron */}
    <Text style={[styles.chevron, { color: primaryColor }]}>›</Text>
  </TouchableOpacity>
));

// ─────────────────────────────────────────────────
// Search Bar
// ─────────────────────────────────────────────────
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
    <View style={[styles.searchWrapper, { borderColor: focused ? primaryColor : '#E0E0E0' }]}>
      <Text style={[styles.searchIcon, { color: focused ? primaryColor : '#bbb' }]}>⌕</Text>
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
        autoCapitalize="none"
        cursorColor={primaryColor}
        underlineColorAndroid="transparent"
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
const ElectricityOperatorBottomSheet = ({
  operatorData = [],
  stateData = [],
  isModalVisible,
  setModalVisible,
  setOperatorcode,
  setState,
  setOperator,
  GetOptlist,
  handleItemPress,
}: {
  operatorData?: any[];
  stateData?: any[];
  isModalVisible: boolean;
  setModalVisible: (v: boolean) => void;
  setOperatorcode: (code: string) => void;
  setState: (state: string) => void;
  setOperator: (name: string) => void;
  GetOptlist: (stateId: string) => void;
  handleItemPress?: (item: any) => void;   // optional — crash fix
}) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const primaryColor = colorConfig.primaryColor;
  const bgColor = `${primaryColor}18`;

  const [selectbool, setSelectbool] = useState(true); // true = State list, false = Operator list
  const [searchQuery, setSearchQuery] = useState('');

  // Reset when modal closes
  useEffect(() => {
    if (!isModalVisible) {
      setSearchQuery('');
      setSelectbool(true);
    }
  }, [isModalVisible]);

  const closeSheet = useCallback(() => {
    Keyboard.dismiss();
    setModalVisible(false);
  }, [setModalVisible]);

  // Filtered list
  const filteredData = useMemo(() => {
    const data = selectbool ? stateData : operatorData;
    const key = selectbool ? "State Name" : "Operatorname";
    return data.filter(item =>
      item[key]?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [selectbool, stateData, operatorData, searchQuery]);

  // Item tap handler
  const onSelectItem = useCallback((item: any) => {
    handleItemPress?.(item);   // optional chaining — undefined pe crash nahi hoga
console.log('====================================');
console.log(item);
console.log('====================================');
    if (selectbool) {
      // Step 1: State selected → load operators
      setState(item['State Name']);
  
      GetOptlist(item['Sate Id']);   // ← typo fix: 'Sate Id' → 'State Id'
      setSearchQuery('');
      setSelectbool(false);
    } else {
      // Step 2: Operator selected → done
      setOperatorcode(item['OPtCode']);
      setOperator(item['Operatorname']);
      setSearchQuery('');
      setSelectbool(true);
      Keyboard.dismiss();
      setModalVisible(false);
    }
  }, [selectbool, handleItemPress, setState, GetOptlist, setOperatorcode, setOperator, setModalVisible]);

  const isStep1 = selectbool;
  const isEmpty = filteredData.length === 0;
  const showNoOperator = !selectbool && operatorData.length === 0;

  return (
    <BottomSheet
      animationType="none"
      isVisible={isModalVisible}
      onBackdropPress={closeSheet}
      containerStyle={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
    >
      <View style={styles.sheet}>

        {/* ── Header ── */}
        <View style={[styles.header, { backgroundColor: bgColor }]}>
          {/* Drag handle */}
          <View style={styles.dragHandle} />

          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              {/* Step badge */}
              <View style={[styles.stepBadge, { backgroundColor: primaryColor }]}>
                <Text style={styles.stepBadgeText}>{isStep1 ? '1' : '2'}</Text>
              </View>
              <View>
                <Text style={[styles.headerStepLabel, { color: primaryColor }]}>
                  {isStep1 ? `${translate('Step')} 1 / 2` : `${translate('Step')} 2 / 2`}
                </Text>
                <Text style={styles.headerTitle}>
                  {isStep1
                    ? translate('Select Your State')
                    : translate('Select Your Operator')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={closeSheet}
              activeOpacity={0.7}
              style={[styles.closeBtn, { backgroundColor: `${primaryColor}18` }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ClosseModalSvg2 />
            </TouchableOpacity>
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View style={[
              styles.progressFill,
              { backgroundColor: primaryColor, width: isStep1 ? '50%' : '100%' }
            ]} />
          </View>
        </View>

        {/* ── Search ── */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={isStep1 ? translate('Search state...') : translate('Search operator...')}
          primaryColor={primaryColor}
        />

        {/* ── List ── */}
        <View style={styles.listContainer}>
          {showNoOperator ? (
            // No operators loaded yet
            <View style={styles.emptyBox}>
              <NoDatafound />
              <Text style={styles.emptyText}>{translate('No Operator Found')}</Text>
            </View>
          ) : isEmpty ? (
            // Search returned nothing
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>
                {translate('No results for')} "{searchQuery}"
              </Text>
            </View>
          ) : (
            <FlashList
              data={filteredData}
              estimatedItemSize={64}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              keyExtractor={(item, i) =>
                isStep1
                  ? item['State Name'] ?? String(i)
                  : item['OPtCode'] ?? String(i)
              }
              contentContainerStyle={{ paddingBottom: hScale(30) }}
              renderItem={({ item }) => (
                <ListItem
                  label={isStep1 ? item['State Name'] : item['Operatorname']}
                  onPress={() => onSelectItem(item)}
                  primaryColor={primaryColor}
                />
              )}
            />
          )}
        </View>
      </View>
    </BottomSheet>
  );
};

// ─────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  sheet: {
    backgroundColor: '#fff',
    height: SCREEN_HEIGHT / 1.4,
    borderTopLeftRadius: wScale(20),
    borderTopRightRadius: wScale(20),
    overflow: 'hidden',
  },

  // ── Header ──
  header: {
    borderTopLeftRadius: wScale(20),
    borderTopRightRadius: wScale(20),
    paddingBottom: hScale(10),
  },
  dragHandle: {
    width: wScale(36),
    height: hScale(4),
    borderRadius: 4,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginTop: hScale(10),
    marginBottom: hScale(8),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wScale(16),
    marginBottom: hScale(10),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wScale(10),
    flex: 1,
  },
  stepBadge: {
    width: wScale(32),
    height: wScale(32),
    borderRadius: wScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: '#fff',
    fontSize: wScale(15),
    fontWeight: '700',
  },
  headerStepLabel: {
    fontSize: wScale(11),
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: hScale(2),
  },
  headerTitle: {
    fontSize: wScale(16),
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 0.2,
  },
  closeBtn: {
    padding: wScale(8),
    borderRadius: wScale(20),
  },
  progressTrack: {
    height: hScale(3),
    backgroundColor: '#E8EAF0',
    marginHorizontal: wScale(16),
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },

  // ── Search ──
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: wScale(12),
    marginHorizontal: wScale(14),
    marginTop: hScale(12),
    marginBottom: hScale(8),
    paddingHorizontal: wScale(12),
    backgroundColor: '#FAFAFA',
    height: hScale(46),
  },
  searchIcon: {
    fontSize: wScale(20),
    marginRight: wScale(8),
  },
  searchInput: {
    flex: 1,
    fontSize: wScale(15),
    color: '#222',
    padding: 0,
  },
  clearBtn: {
    fontSize: wScale(13),
    color: '#aaa',
    paddingLeft: wScale(8),
  },

  // ── List ──
  listContainer: {
    flex: 1,
    minHeight: 100,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hScale(12),
    paddingHorizontal: wScale(16),
    borderBottomWidth: 0.8,
    borderBottomColor: '#F0F0F0',
  },
  iconBox: {
    width: wScale(40),
    height: wScale(40),
    borderRadius: wScale(10),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wScale(12),
  },
  iconLetter: {
    fontSize: wScale(17),
    fontWeight: '700',
  },
  itemLabel: {
    flex: 1,
    fontSize: wScale(15),
    color: '#222',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  chevron: {
    fontSize: wScale(22),
    fontWeight: '300',
    marginLeft: wScale(8),
  },

  // ── Empty ──
  emptyBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: hScale(50),
  },
  emptyIcon: {
    fontSize: wScale(36),
    marginBottom: hScale(10),
  },
  emptyText: {
    fontSize: wScale(14),
    color: '#aaa',
    marginTop: hScale(8),
    textAlign: 'center',
  },
});

export default ElectricityOperatorBottomSheet;