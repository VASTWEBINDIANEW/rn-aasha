import { translate } from "../../utils/languageUtils/I18n";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
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
import NoDatafound from "../drawer/svgimgcomponents/Nodatafound";
import DateRangePicker from "../../components/DateRange";
import DynamicButton from "../drawer/button/DynamicButton";
import { RootState } from "../../reduxUtils/store";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// ─── Status config ─────────────────────────────────────────────────────────────
const getTypeCfg = (type: string) => {
  const t = type?.toLowerCase();
  if (["cr", "credit"].includes(t))  return { color: "#16A34A", bg: "#DCFCE7" };
  if (["dr", "debit"].includes(t))   return { color: "#DC2626", bg: "#FEE2E2" };
  return                                    { color: "#2563EB", bg: "#DBEAFE" };
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
      {/* Middle */}
      <SkeletonPlaceholder.Item flex={1}>
        <SkeletonPlaceholder.Item width="70%" height={hScale(13)} borderRadius={6} />
        <SkeletonPlaceholder.Item width="50%" height={hScale(11)} borderRadius={6} marginTop={hScale(6)} />
        <SkeletonPlaceholder.Item flexDirection="row" marginTop={hScale(10)}>
          <SkeletonPlaceholder.Item width={wScale(80)} height={hScale(11)} borderRadius={6} />
          <SkeletonPlaceholder.Item width={wScale(70)} height={hScale(11)} borderRadius={6} marginLeft={wScale(12)} />
        </SkeletonPlaceholder.Item>
        <SkeletonPlaceholder.Item width="80%" height={hScale(22)} borderRadius={8} marginTop={hScale(10)} />
      </SkeletonPlaceholder.Item>
      {/* Right */}
      <SkeletonPlaceholder.Item alignItems="flex-end" marginLeft={wScale(8)}>
        <SkeletonPlaceholder.Item width={wScale(62)} height={hScale(15)} borderRadius={6} />
        <SkeletonPlaceholder.Item width={wScale(54)} height={hScale(22)} borderRadius={20} marginTop={hScale(8)} />
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder.Item>
  </SkeletonPlaceholder>
);

const SkeletonList = ({ highlight }: { highlight: string }) => (
  <View style={{ paddingHorizontal: wScale(12), paddingTop: hScale(4) }}>
    {[1, 2, 3, 4, 5].map((k) => <SkeletonCard key={k} highlight={highlight} />)}
  </View>
);

// ─── Transaction Card ─────────────────────────────────────────────────────────
const TxnCard = React.memo(({ item }: { item: any }) => {
  const cfg = getTypeCfg(item.tras_type);

  return (
    <View style={[card.wrap, { borderLeftColor: cfg.color }]}>

      {/* Top: icon + details + amount */}
      <View style={card.topRow}>
        <View style={[card.iconWrap, { backgroundColor: cfg.bg }]}>
          <Text style={{ fontSize: wScale(20) }}>🧾</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={card.label}>{translate("Transaction_Details")}</Text>
          <Text style={card.details} numberOfLines={2}>
            {item.Details === "" ? "....." : item.Details || "—"}
          </Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <Text style={[card.amount, { color: cfg.color }]}>₹ {item.Amount}</Text>
          <View style={[card.pill, { backgroundColor: cfg.bg }]}>
            <Text style={[card.pillTxt, { color: cfg.color }]}>
              {item.tras_type || "—"}
            </Text>
          </View>
        </View>
      </View>

      <View style={card.divider} />

      {/* Date + Type row */}
      <View style={card.midRow}>
        <View style={{ flex: 1 }}>
          <Text style={card.label}>{translate("Request_Time")}</Text>
          <Text style={card.value}>{item.ledgerdate || "—"}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={card.label}>{translate("Type")}</Text>
          <Text style={[card.value, { color: cfg.color, fontWeight: "700" }]}>
            {item.tras_type || "—"}
          </Text>
        </View>
      </View>

      <View style={card.divider} />

      {/* Balance chips */}
      <View style={card.balRow}>
        {[
          { l: translate("Amount"),      v: `₹ ${item.Amount}`,     c: cfg.color,  bg: cfg.bg      },
          { l: translate("pre_Balance"), v: `₹ ${item.remainpre}`,  c: "#1D4ED8",  bg: "#EFF6FF"   },
          { l: translate("Pos_Balance"), v: `₹ ${item.remainpost}`, c: "#16A34A",  bg: "#DCFCE7"   },
        ].map((b) => (
          <View key={b.l} style={[card.balChip, { backgroundColor: b.bg }]}>
            <Text style={[card.balAmt, { color: b.c }]}>{b.v}</Text>
            <Text style={card.balLbl}>{b.l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
});

const card = StyleSheet.create({
  wrap:     { backgroundColor: "#fff", borderRadius: 16, marginBottom: hScale(10), paddingHorizontal: wScale(14), paddingVertical: hScale(12), borderLeftWidth: 4, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 5 },
  topRow:   { flexDirection: "row", alignItems: "flex-start", marginBottom: hScale(6), gap: wScale(10) },
  iconWrap: { width: wScale(44), height: wScale(44), borderRadius: 12, justifyContent: "center", alignItems: "center" },
  label:    { fontSize: wScale(10), color: "#9CA3AF", fontWeight: "600", marginBottom: 2 },
  details:  { fontSize: wScale(13), color: "#111827", fontWeight: "600" },
  amount:   { fontSize: wScale(16), fontWeight: "800" },
  pill:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  pillTxt:  { fontSize: wScale(10), fontWeight: "800", letterSpacing: 0.3 },
  midRow:   { flexDirection: "row", justifyContent: "space-between", marginBottom: hScale(6) },
  value:    { fontSize: wScale(12), color: "#374151", fontWeight: "700" },
  divider:  { height: 1, backgroundColor: "#F3F4F6", marginVertical: hScale(8) },
  balRow:   { flexDirection: "row", gap: wScale(4) },
  balChip:  { flex: 1, borderRadius: 10, paddingVertical: hScale(7), alignItems: "center" },
  balAmt:   { fontSize: wScale(11), fontWeight: "800" },
  balLbl:   { fontSize: wScale(9), color: "#6B7280", marginTop: 2, fontWeight: "600", textAlign: "center" },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const posreport = () => {
  const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);
  const { post }                  = useAxiosHook();

  const primary          = colorConfig.primaryColor ?? colorConfig.secondaryColor ?? "#1D4ED8";
  const shimmerHighlight = primary + "30";

  const [transactions,   setTransactions]   = useState<any[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [present,        setPresent]        = useState(10);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
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
      const fmt = (d: string) => new Date(d).toISOString().split("T")[0];
      const url = `${APP_URLS.posreport}fromdate=${fmt(from)}&todate=${fmt(to)}`;
      const response = await post({ url });
      setTransactions(response?.Report ?? []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [post]);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <TxnCard item={item} />
  ), []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AppBarSecond title="POS Report" />

      <DateRangePicker
        onDateSelected={(from: string, to: string) => setSelectedDate({ from, to })}
        SearchPress={(from: string, to: string, status: string) =>
          recentTransactions(from, to, status)
        }
        status={selectedStatus}
        setStatus={setSelectedStatus}
        isStShow={true}
        isshowRetailer={IsDealer}
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
                <DynamicButton
                  onPress={() => setPresent((p) => p + 10)}
                  title="Load More"
                />
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
};

export default posreport;

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: "#F9FAFB" },
  body:  { flex: 1, paddingTop: hScale(4) },
  list:  { paddingHorizontal: wScale(12), paddingBottom: hScale(30), paddingTop: hScale(4) },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
});