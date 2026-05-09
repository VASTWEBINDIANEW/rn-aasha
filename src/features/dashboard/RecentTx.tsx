import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { APP_URLS } from "../../utils/network/urls";
import { FlashList } from "@shopify/flash-list";
import useAxiosHook from "../../utils/network/AxiosClient";
import { hScale, wScale } from "../../utils/styles/dimensions";
import AppBarSecond from "../drawer/headerAppbar/AppBarSecond";
import ShowLoader from "../../components/ShowLoder";
import { translate } from "../../utils/languageUtils/I18n";
import { useSelector } from "react-redux";
import { RootState } from "../../reduxUtils/store";
import LinearGradient from "react-native-linear-gradient";

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS = [
  { value: 5,  labelKey: "top_5"  },
  { value: 10, labelKey: "top_10" },
  { value: 50, labelKey: "top_50" },
];

// ─── Transaction Card ─────────────────────────────────────────────────────────

const TxCard = React.memo(({ item, themeColor }: { item: any; themeColor: string }) => {
  const isCr  = item.Cr > 0;   // money came IN
  const isDr  = item.Dr > 0;   // money went OUT
  const accentColor = isCr ? "#22C55E" : isDr ? "#EF4444" : "#8E8E93";

  const balChange = (item.UserPost - item.UserPre).toFixed(2);
  const balUp     = parseFloat(balChange) >= 0;

  return (
    <View style={styles.card}>
      {/* Left accent bar */}
      <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />

      <View style={styles.cardBody}>

        {/* ── Row 1: Username + Amount ── */}
        <View style={styles.cardTopRow}>
          <View>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.firmname} numberOfLines={1}>{item.Firmname?.trim()}</Text>
          </View>
          <View style={[styles.amountBadge, { backgroundColor: isCr ? "#DCFCE7" : isDr ? "#FEE2E2" : "#F2F2F7" }]}>
            <Text style={[styles.amountText, { color: isCr ? "#15803D" : isDr ? "#B91C1C" : "#8E8E93" }]}>
              ₹{item.Amount}
            </Text>
          </View>
        </View>

        {/* ── Description ── */}
        <Text style={styles.description} numberOfLines={2}>{item.Description}</Text>

        {/* ── Row 2: Cr / Dr / Comm chips ── */}
        <View style={styles.chipRow}>
          {item.Cr > 0 && (
            <View style={[styles.chip, { backgroundColor: "#DCFCE7" }]}>
              <Text style={[styles.chipText, { color: "#15803D" }]}>CR ₹{item.Cr}</Text>
            </View>
          )}
          {item.Dr > 0 && (
            <View style={[styles.chip, { backgroundColor: "#FEE2E2" }]}>
              <Text style={[styles.chipText, { color: "#B91C1C" }]}>DR ₹{item.Dr}</Text>
            </View>
          )}
          {item.Comm !== 0 && (
            <View style={[styles.chip, { backgroundColor: "#FEF3C7" }]}>
              <Text style={[styles.chipText, { color: "#92400E" }]}>
                Comm {item.Comm > 0 ? "+" : ""}₹{item.Comm}
              </Text>
            </View>
          )}
          <View style={[styles.chip, { backgroundColor: "#F2F2F7" }]}>
            <Text style={[styles.chipText, { color: "#6C6C70" }]}>{item.Operator_type}</Text>
          </View>
        </View>

        {/* ── Row 3: Balance before → after + date ── */}
        <View style={styles.cardBottomRow}>
          <View style={styles.balRow}>
            <Text style={styles.balLabel}>Bal </Text>
            <Text style={styles.balPre}>₹{item.UserPre}</Text>
            <Text style={styles.balArrow}> → </Text>
            <Text style={[styles.balPost, { color: balUp ? "#15803D" : "#B91C1C" }]}>
              ₹{item.UserPost}
            </Text>
          </View>
          <View style={styles.datePill}>
            <Text style={styles.dateText}>
              {new Date(item.Date).toLocaleString("en-IN", {
                day: "2-digit", month: "short",
                hour: "2-digit", minute: "2-digit",
              })}
            </Text>
          </View>
        </View>

      </View>
    </View>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────

const RecentTx = () => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const themeColor: string = colorConfig?.primaryColor || "#0A84FF";
  const secondary: string = colorConfig?.secondaryColor || "#0055FF";

  const { get } = useAxiosHook();
  const [transactions, setTransactions] = useState([]);
  const [selectedTab, setSelectedTab] = useState(5);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRecentTransactions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await get({ url: `${APP_URLS.recentTx}${selectedTab}` });
      setTransactions(res || []);
    } catch (e) {
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTab]);

  useEffect(() => {
    fetchRecentTransactions();
  }, [fetchRecentTransactions]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => <TxCard item={item} themeColor={themeColor} />,
    [themeColor],
  );

  return (
    <View style={styles.root}>
      {/* Gradient Header */}
      <LinearGradient
        colors={[themeColor, secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <AppBarSecond
          title={translate("recent transactions")}
          titlestyle={styles.appBarTitle}
        />

        {/* Tab Bar inside header */}
        <View style={styles.tabBar}>
          {TABS.map(tab => {
            const isActive = selectedTab === tab.value;
            return (
              <TouchableOpacity
                key={tab.value}
                onPress={() => setSelectedTab(tab.value)}
                activeOpacity={0.8}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
              >
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {translate(tab.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </LinearGradient>

      {/* List */}
      <View style={styles.listWrap}>
        {transactions.length > 0 ? (
          <FlashList
            data={transactions}
            renderItem={renderItem}
            keyExtractor={item => item.Idno?.toString()}
            estimatedItemSize={100}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : !isLoading ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>{translate("no transactions found")}</Text>
          </View>
        ) : null}
      </View>

      {isLoading && <ShowLoader />}
    </View>
  );
};

export default RecentTx;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },

  // Header
  gradientHeader: {
    paddingBottom: hScale(6),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  appBarTitle: {
    color: "#FFF",
    fontWeight: "700",
  },

  // Tab bar
  tabBar: {
    flexDirection: "row",
    marginHorizontal: wScale(16),
    marginTop: hScale(8),
    marginBottom: hScale(10),
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: wScale(12),
    padding: wScale(4),
    gap: wScale(4),
  },
  tabBtn: {
    flex: 1,
    paddingVertical: hScale(8),
    borderRadius: wScale(9),
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: "#FFF",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  tabLabel: {
    fontSize: wScale(13),
    fontWeight: "600",
    color: "rgba(255,255,255,0.75)",
  },
  tabLabelActive: {
    color: "#1C1C1E",
    fontWeight: "700",
  },

  // List
  listWrap: {
    flex: 1,
  },
  listContent: {
    padding: wScale(16),
    paddingBottom: hScale(32),
  },

  // Card
  card: {
    backgroundColor: "#FFF",
    borderRadius: wScale(16),
    marginBottom: hScale(10),
    flexDirection: "row",
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  cardAccent: {
    width: wScale(4),
  },
  cardBody: {
    flex: 1,
    padding: wScale(14),
    gap: hScale(6),
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: wScale(8),
  },
  username: {
    flex: 1,
    fontSize: wScale(14),
    fontWeight: "700",
    color: "#1C1C1E",
  },
  amountBadge: {
    paddingHorizontal: wScale(10),
    paddingVertical: hScale(4),
    borderRadius: wScale(20),
  },
  amountText: {
    fontSize: wScale(13),
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  description: {
    fontSize: wScale(13),
    color: "#6C6C70",
    lineHeight: hScale(18),
  },
  cardBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hScale(2),
  },
  datePill: {
    backgroundColor: "#F2F2F7",
    paddingHorizontal: wScale(8),
    paddingVertical: hScale(3),
    borderRadius: wScale(6),
  },
  dateText: {
    fontSize: wScale(10),
    color: "#8E8E93",
    fontWeight: "500",
  },

  firmname: {
    fontSize: wScale(11),
    color: "#8E8E93",
    fontWeight: "500",
    marginTop: hScale(1),
  },

  // Chips
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: wScale(5),
  },
  chip: {
    paddingHorizontal: wScale(8),
    paddingVertical: hScale(3),
    borderRadius: wScale(6),
  },
  chipText: {
    fontSize: wScale(10),
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  // Balance row
  balRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  balLabel: {
    fontSize: wScale(10),
    color: "#8E8E93",
    fontWeight: "500",
  },
  balPre: {
    fontSize: wScale(10),
    color: "#8E8E93",
    fontWeight: "600",
  },
  balArrow: {
    fontSize: wScale(10),
    color: "#C7C7CC",
  },
  balPost: {
    fontSize: wScale(10),
    fontWeight: "700",
  },
  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: hScale(80),
    gap: hScale(10),
  },
  emptyEmoji: {
    fontSize: wScale(40),
  },
  emptyText: {
    fontSize: wScale(15),
    color: "#8E8E93",
    fontWeight: "500",
  },
});