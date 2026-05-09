import { translate } from "../../utils/languageUtils/I18n";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  StatusBar,
} from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import useAxiosHook from "../../utils/network/AxiosClient";
import { APP_URLS } from "../../utils/network/urls";
import { useSelector } from "react-redux";
import { hScale, wScale } from "../../utils/styles/dimensions";
import AppBarSecond from "../drawer/headerAppbar/AppBarSecond";
import DateRangePicker from "../../components/DateRange";
import { RootState } from "../../reduxUtils/store";
import NoDatafound from "../drawer/svgimgcomponents/Nodatafound";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// ─── Status config ─────────────────────────────────────────────────────────────
const getStatusCfg = (s: string) => {
  const st = s?.toLowerCase();
  if (["success", "m_success", "done"].includes(st))
    return { color: "#16A34A", bg: "#DCFCE7", label: "Success" };
  if (["failed", "m_failed", "failure", "failed"].includes(st))
    return { color: "#DC2626", bg: "#FEE2E2", label: "Failed" };
  if (["m_pending", "pending"].includes(st))
    return { color: "#D97706", bg: "#FEF3C7", label: "Pending" };
  return { color: "#2563EB", bg: "#DBEAFE", label: s || "—" };
};

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
const SkeletonCard = ({ highlight }: { highlight: string }) => (
  <SkeletonPlaceholder
    borderRadius={16}
    speed={1300}
    backgroundColor="#F3F4F6"
    highlightColor={highlight}
  >
    <SkeletonPlaceholder.Item
      flexDirection="row"
      alignItems="center"
      backgroundColor="#fff"
      borderRadius={16}
      marginBottom={hScale(10)}
      paddingVertical={hScale(14)}
      paddingRight={wScale(14)}
      overflow="hidden"
    >
      {/* Left accent bar */}
      <SkeletonPlaceholder.Item
        width={4}
        height={hScale(96)}
        borderRadius={4}
        marginRight={wScale(12)}
      />
      {/* Icon bubble */}
      <SkeletonPlaceholder.Item
        width={wScale(44)}
        height={wScale(44)}
        borderRadius={12}
        marginRight={wScale(10)}
      />
      {/* Middle content */}
      <SkeletonPlaceholder.Item flex={1}>
        <SkeletonPlaceholder.Item width="60%" height={hScale(13)} borderRadius={6} />
        <SkeletonPlaceholder.Item width="40%" height={hScale(11)} borderRadius={6} marginTop={hScale(6)} />
        <SkeletonPlaceholder.Item flexDirection="row" marginTop={hScale(10)}>
          <SkeletonPlaceholder.Item width={wScale(80)} height={hScale(11)} borderRadius={6} />
          <SkeletonPlaceholder.Item width={wScale(70)} height={hScale(11)} borderRadius={6} marginLeft={wScale(12)} />
        </SkeletonPlaceholder.Item>
        <SkeletonPlaceholder.Item width="80%" height={hScale(22)} borderRadius={8} marginTop={hScale(10)} />
      </SkeletonPlaceholder.Item>
      {/* Right: amount + pill */}
      <SkeletonPlaceholder.Item alignItems="flex-end" marginLeft={wScale(8)}>
        <SkeletonPlaceholder.Item width={wScale(62)} height={hScale(15)} borderRadius={6} />
        <SkeletonPlaceholder.Item width={wScale(54)} height={hScale(22)} borderRadius={20} marginTop={hScale(8)} />
        <SkeletonPlaceholder.Item width={wScale(60)} height={hScale(26)} borderRadius={20} marginTop={hScale(12)} />
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder.Item>
  </SkeletonPlaceholder>
);

const SkeletonList = ({ highlight }: { highlight: string }) => (
  <View style={{ paddingHorizontal: wScale(12), paddingTop: hScale(4) }}>
    {[1, 2, 3, 4, 5].map((k) => (
      <SkeletonCard key={k} highlight={highlight} />
    ))}
  </View>
);

// ─── Transaction Card ─────────────────────────────────────────────────────────
const TxnCard = React.memo(({ item, expanded, onToggle }: any) => {
  const st = getStatusCfg(item.status);

  return (
    <View style={[card.wrap, { borderLeftColor: st.color }]}>

      {/* ── Top row ── */}
      <TouchableOpacity onPress={onToggle} activeOpacity={0.85}>
        <View style={card.topRow}>
          {/* Icon bubble */}
          <View style={[card.iconWrap, { backgroundColor: st.bg }]}>
            <Text style={{ fontSize: wScale(20) }}>🏦</Text>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={card.name} numberOfLines={1}>
              {translate("benname")}: {item.benname || "—"}
            </Text>
            <Text style={card.sub}>
              {translate("RRN")}: {item.rrn || "—"}
            </Text>
            <Text style={card.sub}>
              {translate("Status")}: {item.status || "—"}
            </Text>
          </View>

          <View style={{ alignItems: "flex-end", gap: 4 }}>
            <Text style={[card.amount, { color: st.color }]}>
              ₹ {item.amount ?? "0"}
            </Text>
            <View style={[card.pill, { backgroundColor: st.bg }]}>
              <Text style={[card.pillTxt, { color: st.color }]}>{st.label}</Text>
            </View>
          </View>
        </View>

        {/* ── Mid row: txn id + chevron ── */}
        <View style={card.midRow}>
          <View style={{ flex: 1 }}>
            <Text style={card.micro}>{translate("transaction_id")}</Text>
            <Text style={card.micro2}>{item.reqid || "—"}</Text>
          </View>
          <Text
            style={[
              card.chevron,
              { transform: [{ rotate: expanded ? "180deg" : "0deg" }] },
            ]}
          >
            ⌄
          </Text>
        </View>
      </TouchableOpacity>

      {/* ── Status banner ── */}
      <View style={[card.banner, { backgroundColor: st.bg }]}>
        <Text style={[card.bannerTxt, { color: st.color }]}>
          {st.label === "Success"
            ? "✓ Cash Deposit Successful"
            : st.label === "Failed"
            ? "✕ Cash Deposit Failed"
            : "⏳ Cash Deposit Pending"}
        </Text>
      </View>

      {/* ── Expanded details ── */}
      {expanded && (
        <View>
          <View style={card.divider} />

          {/* Balance row */}
          <View style={card.balRow}>
            {[
              { l: translate("retailer_remain_pre"),  v: `₹ ${item.Rem_pre ?? "0"}`,      c: "#1D4ED8", bg: "#EFF6FF" },
              { l: translate("retailer_remain_post"), v: `₹ ${item.rem_post ?? "0"}`,     c: "#16A34A", bg: "#DCFCE7" },
            ].map((b) => (
              <View key={b.l} style={[card.balChip, { backgroundColor: b.bg }]}>
                <Text style={[card.balAmt, { color: b.c }]}>{b.v}</Text>
                <Text style={card.balLbl}>{b.l}</Text>
              </View>
            ))}
          </View>

          <View style={card.divider} />

          {/* GST / TDS / Earn row */}
          <View style={card.balRow}>
            {[
              { l: translate("Retailer_gst"), v: `₹ ${item.rem_gst ?? "0"}`,        c: "#7C3AED", bg: "#F5F3FF" },
              { l: translate("rem_tds"),      v: `₹ ${item.rem_tds ?? "0"}`,        c: "#DC2626", bg: "#FEE2E2" },
              { l: translate("My_Earn"),      v: `₹ ${item.Retailer_comm ?? "0"}`,  c: "#16A34A", bg: "#DCFCE7" },
            ].map((b) => (
              <View key={b.l} style={[card.balChip, { backgroundColor: b.bg }]}>
                <Text style={[card.balAmt, { color: b.c }]}>{b.v}</Text>
                <Text style={card.balLbl}>{b.l}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
});

const card = StyleSheet.create({
  wrap:      { backgroundColor: "#fff", borderRadius: 16, marginBottom: hScale(10), marginHorizontal: wScale(12), paddingHorizontal: wScale(14), paddingVertical: hScale(12), borderLeftWidth: 4, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 5 },
  topRow:    { flexDirection: "row", alignItems: "center", marginBottom: hScale(8) },
  iconWrap:  { width: wScale(44), height: wScale(44), borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: wScale(10) },
  name:      { fontSize: wScale(14), fontWeight: "700", color: "#111827", marginBottom: 2 },
  sub:       { fontSize: wScale(12), color: "#6B7280" },
  amount:    { fontSize: wScale(16), fontWeight: "800" },
  pill:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  pillTxt:   { fontSize: wScale(10), fontWeight: "800", letterSpacing: 0.3 },
  midRow:    { flexDirection: "row", alignItems: "flex-end", marginBottom: hScale(8), gap: wScale(8) },
  micro:     { fontSize: wScale(10), color: "#9CA3AF", fontWeight: "600", marginBottom: 2 },
  micro2:    { fontSize: wScale(12), color: "#374151", fontWeight: "700" },
  chevron:   { fontSize: 18, color: "#9CA3AF", marginLeft: wScale(8), lineHeight: 20 },
  banner:    { borderRadius: 8, paddingHorizontal: wScale(10), paddingVertical: hScale(5), marginBottom: hScale(8), alignItems: "center" },
  bannerTxt: { fontSize: wScale(11), fontWeight: "700" },
  divider:   { height: 1, backgroundColor: "#F3F4F6", marginVertical: hScale(8) },
  balRow:    { flexDirection: "row", justifyContent: "space-between", gap: wScale(4), marginBottom: hScale(4) },
  balChip:   { flex: 1, borderRadius: 10, paddingVertical: hScale(7), alignItems: "center" },
  balAmt:    { fontSize: wScale(11), fontWeight: "800" },
  balLbl:    { fontSize: wScale(9), color: "#6B7280", marginTop: 2, fontWeight: "600", textAlign: "center" },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const cashDepReport = () => {
  const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);
  const { userId }                = useSelector((state: any) => state.userInfo);
  const { get, post }             = useAxiosHook();

  const primary          = colorConfig.primaryColor ?? colorConfig.secondaryColor ?? "#1D4ED8";
  const shimmerHighlight = primary + "30";

  const [transactions,   setTransactions]   = useState<any[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [present,        setPresent]        = useState(10);
  const [expandedId,     setExpandedId]     = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchnumber,   setSearchnumber]   = useState("");
  const [selectedDate,   setSelectedDate]   = useState({
    from: new Date().toISOString().split("T")[0],
    to:   new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    recentTransactions(selectedDate.from, selectedDate.to, selectedStatus);
  }, []);

  const recentTransactions = useCallback(async (
    from: string, to: string, status: string
  ) => {
    setLoading(true);
    try {
      const formattedTo = new Date(to).toISOString().split("T")[0];
      const url = `${APP_URLS.cashDepReport}from=2022-12-05&to=${formattedTo}&status=${status}`;
      const response = await post({ url });
      setTransactions(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [post]);

  const toggleExpand = useCallback((key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === key ? null : key));
  }, []);

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const key = item.reqid ?? item.rrn ?? String(index);
    return (
      <TxnCard
        item={item}
        expanded={expandedId === key}
        onToggle={() => toggleExpand(key)}
      />
    );
  }, [expandedId, toggleExpand]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AppBarSecond title="Cash Deposit Report" />

      <DateRangePicker
        onDateSelected={(from: string, to: string) => setSelectedDate({ from, to })}
        SearchPress={(from: string, to: string, status: string) =>
          recentTransactions(from, to, status)
        }
        status={selectedStatus}
        setStatus={setSelectedStatus}
        searchnumber={searchnumber}
        setSearchnumber={setSearchnumber}
        isshowRetailer={IsDealer}
        isStShow={true}
      />

      <View style={styles.body}>
        {loading ? (
          <SkeletonList highlight={shimmerHighlight} />
        ) : transactions.length === 0 ? (
          <View style={styles.empty}>
            <NoDatafound />

          </View>
        ) : (
          <FlatList
            data={transactions.slice(0, present)}
            renderItem={renderItem}
            keyExtractor={(_, i) => String(i)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            initialNumToRender={12}
            maxToRenderPerBatch={15}
            windowSize={10}
            removeClippedSubviews
            ListFooterComponent={
              transactions.length > present ? (
                <TouchableOpacity
                  style={[styles.loadMoreBtn, { backgroundColor: primary }]}
                  onPress={() => setPresent((p) => p + 10)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.loadMoreTxt}>{translate("Load_More")}</Text>
                </TouchableOpacity>
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
};

export default cashDepReport;

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: "#F9FAFB" },
  body:        { flex: 1, paddingTop: hScale(8) },
  list:        { paddingBottom: hScale(30), paddingTop: hScale(4) },
  empty:       { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: wScale(30) },
  emptyTitle:  { fontSize: wScale(16), fontWeight: "700", color: "#374151", marginTop: hScale(16), textAlign: "center" },
  emptySub:    { fontSize: wScale(13), color: "#9CA3AF", marginTop: 6, textAlign: "center", lineHeight: 20 },
  loadMoreBtn: { marginHorizontal: wScale(12), marginBottom: hScale(20), paddingVertical: hScale(13), borderRadius: 12, alignItems: "center" },
  loadMoreTxt: { color: "#fff", fontSize: wScale(14), fontWeight: "700" },
});