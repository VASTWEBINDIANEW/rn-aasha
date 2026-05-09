import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  UIManager,
} from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import AppBarSecond from "../../drawer/headerAppbar/AppBarSecond";
import DateRangePicker from "../../../components/DateRange";
import Nodatafound from "../../drawer/svgimgcomponents/Nodatafound";
import { APP_URLS } from "../../../utils/network/urls";
import { useSelector } from 'react-redux';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { RootState } from '../../../reduxUtils/store/index';
import { translate } from "../../../utils/languageUtils/I18n";
import DynamicButton from "../../drawer/button/DynamicButton";


if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// ─── Status config ─────────────────────────────────────────────────────────────
const getStatusCfg = (s: string) => {
  const st = s?.toLowerCase();
  if (["success", "done"].includes(st))    return { color: "#16A34A", bg: "#DCFCE7" };
  if (["failed", "failure"].includes(st)) return { color: "#DC2626", bg: "#FEE2E2" };
  if (["pending"].includes(st))           return { color: "#D97706", bg: "#FEF3C7" };
  return                                         { color: "#2563EB", bg: "#DBEAFE" };
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
      <SkeletonPlaceholder.Item width={4} height={hScale(96)} borderRadius={4} marginRight={wScale(12)} />
      {/* Icon bubble */}
      <SkeletonPlaceholder.Item width={wScale(44)} height={wScale(44)} borderRadius={12} marginRight={wScale(10)} />
      {/* Middle */}
      <SkeletonPlaceholder.Item flex={1}>
        <SkeletonPlaceholder.Item width="60%" height={hScale(13)} borderRadius={6} />
        <SkeletonPlaceholder.Item width="40%" height={hScale(11)} borderRadius={6} marginTop={hScale(6)} />
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
        <SkeletonPlaceholder.Item width={wScale(60)} height={hScale(26)} borderRadius={20} marginTop={hScale(12)} />
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
  const cfg = getStatusCfg(item.Status);

  return (
    <View style={[card.wrap, { borderLeftColor: cfg.color }]}>

      {/* ── Top row: icon + bank account + date + amount ── */}
      <View style={card.topRow}>
        <View style={[card.iconWrap, { backgroundColor: cfg.bg }]}>
          <Text style={{ fontSize: wScale(20) }}>👛</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={card.label}>{translate("Bank Account")}</Text>
          <Text style={card.name} numberOfLines={1}>
            {item.BankAccount === "" ? "....." : item.BankAccount || "—"}
          </Text>
          <Text style={card.sub}>{translate("Date")}: {item.RequestDate || "—"}</Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <Text style={[card.amount, { color: cfg.color }]}>₹ {item.Amount}</Text>
          <View style={[card.pill, { backgroundColor: cfg.bg }]}>
            <Text style={[card.pillTxt, { color: cfg.color }]}>
              {item.Status || "—"}
            </Text>
          </View>
        </View>
      </View>

      <View style={card.divider} />

      {/* ── Mid row: TransferType + BankRRN + Status ── */}
      <View style={card.midRow}>
        <View style={{ flex: 1 }}>
          <Text style={card.label}>{translate("TransferType")}</Text>
          <Text style={[card.value, { textTransform: "uppercase" }]}>
            {item.TransferType || "—"}
          </Text>
        </View>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={card.label}>{translate("Bank RRN")}</Text>
          <Text style={card.value}>{item.BankRRN || "—"}</Text>
        </View>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text style={card.label}>{translate("Status")}</Text>
          <Text style={[card.value, { color: cfg.color }]}>{item.Status || "—"}</Text>
        </View>
      </View>

      <View style={card.divider} />

      {/* ── Balance chips ── */}
      <View style={card.balRow}>
        {[
          { l: translate("Pre Balance"), v: `₹ ${item.RemPre  ?? "0"}`,              c: "#1D4ED8", bg: "#EFF6FF" },
          { l: translate("Pos Balance"), v: `₹ ${item.RemPost ?? "0"}`,              c: "#16A34A", bg: "#DCFCE7" },
          { l: translate("Amount"),      v: `₹ ${item.Amount  ?? "0"}`,              c: cfg.color, bg: cfg.bg   },
          { l: translate("Charge"),      v: `₹ ${item.ProcessingCharge ?? "0"}`,     c: "#D97706", bg: "#FEF3C7" },
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
  name:     { fontSize: wScale(14), fontWeight: "700", color: "#111827", marginBottom: 2 },
  sub:      { fontSize: wScale(12), color: "#6B7280" },
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
const Walletunloadreport = () => {
  const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);
  const { get }                   = useAxiosHook();

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
      const url = `${APP_URLS.WalletUnloadReport}txt_frm_date=${fmt(from)}&txt_to_date=${fmt(to)}`;
      const response = await get({ url });
      if (response?.status === "SUCCESS") {
        setTransactions(response.Response ?? []);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [get]);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <TxnCard item={item} />
  ), []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AppBarSecond title="Wallet Unload History" />

      <DateRangePicker
        isshowRetailer={IsDealer}
        onDateSelected={(from: string, to: string) => setSelectedDate({ from, to })}
        SearchPress={(from: string, to: string, status: string) =>
          recentTransactions(from, to, status)
        }
        status={selectedStatus}
        setStatus={setSelectedStatus}
        isStShow={true}
      />

      <View style={styles.body}>
        {loading ? (
          <SkeletonList highlight={shimmerHighlight} />
        ) : transactions.length === 0 ? (
          <View style={styles.empty}>
            <Nodatafound />
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

export default Walletunloadreport;

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: "#F9FAFB" },
  body:  { flex: 1, paddingTop: hScale(4) },
  list:  { paddingHorizontal: wScale(12), paddingBottom: hScale(30), paddingTop: hScale(4) },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
});