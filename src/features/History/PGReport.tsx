import React, { useCallback, useEffect, useRef, useState } from "react";
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
  TextInput,
  ToastAndroid,
  Alert,
} from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import useAxiosHook from "../../utils/network/AxiosClient";
import { APP_URLS } from "../../utils/network/urls";
import { useSelector } from "react-redux";
import { hScale, wScale } from "../../utils/styles/dimensions";
import AppBarSecond from "../drawer/headerAppbar/AppBarSecond";
import { RootState } from "../../reduxUtils/store";
import { FontSize } from "../../utils/styles/theme";
import ShareSvg from "../drawer/svgimgcomponents/sharesvg";
import ViewShot, { captureRef } from "react-native-view-shot";
import Share from "react-native-share";
import DateRangePicker from "../../components/DateRange";
import DynamicButton from "../drawer/button/DynamicButton";
import NoDatafound from "../drawer/svgimgcomponents/Nodatafound";
import { FlashList } from "@shopify/flash-list";
import { translate } from "../../utils/languageUtils/I18n";
import OnelineDropdownSvg from "../drawer/svgimgcomponents/simpledropdown";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// ─── Status config ─────────────────────────────────────────────────────────────
const getStatusCfg = (s: string) => {
  const st = s?.toLowerCase();
  if (["success", "done"].includes(st))
    return { color: "#16A34A", bg: "#DCFCE7", label: s };
  if (["failed", "failure"].includes(st))
    return { color: "#DC2626", bg: "#FEE2E2", label: s };
  if (["pending"].includes(st))
    return { color: "#D97706", bg: "#FEF3C7", label: s };
  if (["refund"].includes(st))
    return { color: "#2563EB", bg: "#DBEAFE", label: s };
  return { color: "#7C3AED", bg: "#F5F3FF", label: s || "—" };
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
      <SkeletonPlaceholder.Item width={4} height={hScale(96)} borderRadius={4} marginRight={wScale(12)} />
      <SkeletonPlaceholder.Item width={wScale(44)} height={wScale(44)} borderRadius={12} marginRight={wScale(10)} />
      <SkeletonPlaceholder.Item flex={1}>
        <SkeletonPlaceholder.Item width="60%" height={hScale(13)} borderRadius={6} />
        <SkeletonPlaceholder.Item width="40%" height={hScale(11)} borderRadius={6} marginTop={hScale(6)} />
        <SkeletonPlaceholder.Item flexDirection="row" marginTop={hScale(10)}>
          <SkeletonPlaceholder.Item width={wScale(80)} height={hScale(11)} borderRadius={6} />
          <SkeletonPlaceholder.Item width={wScale(70)} height={hScale(11)} borderRadius={6} marginLeft={wScale(12)} />
        </SkeletonPlaceholder.Item>
        <SkeletonPlaceholder.Item width="80%" height={hScale(22)} borderRadius={8} marginTop={hScale(10)} />
      </SkeletonPlaceholder.Item>
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

// ─── Retailer Card (non-dealer) ───────────────────────────────────────────────
const RetailerCard = React.memo(({
  item, expanded, onToggle, colorConfig, capRef,
}: any) => {
  const st = getStatusCfg(item.status);

  const onShare = useCallback(async () => {
    try {
      const uri = await captureRef(capRef, { format: "jpg", quality: 0.7 });
      await Share.open({
        message: translate(`key_hiiams_47 ${APP_URLS.AppName} App.`),
        url: uri,
      });
    } catch {
      ToastAndroid.show(translate("Transaction details not shared"), ToastAndroid.SHORT);
    }
  }, []);

  return (
    <ViewShot ref={capRef} options={{ fileName: translate("TransactionReciept"), format: "jpg", quality: 0.9 }}>
      <View style={[rc.wrap, { borderLeftColor: st.color }]}>

        {/* ── Top row ── */}
        <TouchableOpacity onPress={onToggle} activeOpacity={0.85}>
          <View style={rc.topRow}>
            <View style={[rc.iconWrap, { backgroundColor: st.bg }]}>
              <Text style={{ fontSize: wScale(20) }}>💳</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={rc.name} numberOfLines={1}>
                {translate(`Firm Name: ${item.Frm_Name}`)}
              </Text>
              <Text style={rc.sub}>
                {translate(`Txn Type : ${item.PG_TYPE}`)}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: 4 }}>
              <Text style={[rc.amount, { color: st.color }]}>₹ {item.amount}</Text>
              <View style={[rc.pill, { backgroundColor: st.bg }]}>
                <Text style={[rc.pillTxt, { color: st.color }]}>{translate(item.status)}</Text>
              </View>
            </View>
          </View>

          {/* Mid row: BankRRN + chevron */}
          <View style={rc.midRow}>
            <View style={{ flex: 1 }}>
              <Text style={rc.micro}>{translate(`Bank RRN ${item.PG_TYPE}`)}</Text>
              <Text style={rc.micro2}>{item.bankrrnno ? item.bankrrnno : translate("BankRRN")}</Text>
            </View>
            <View style={{ transform: [{ rotate: expanded ? "180deg" : "0deg" }] }}>
              <OnelineDropdownSvg />
            </View>
          </View>
        </TouchableOpacity>

        {/* Status banner */}
        <View style={[rc.banner, { backgroundColor: st.bg }]}>
          <Text style={[rc.bannerTxt, { color: st.color }]}>
            {translate("Your Transaction in Queue or")} {translate(item.status)}
          </Text>
        </View>

        {/* Time + Share */}
        <View style={rc.footer}>
          <View>
            <Text style={rc.micro}>{translate("Request Time")}</Text>
            <Text style={rc.micro2}>{new Date(item.f_date).toLocaleString()}</Text>
          </View>
          <TouchableOpacity style={rc.shareBtn} onPress={onShare} activeOpacity={0.8}>
            <ShareSvg size={wScale(16)} color={colorConfig.secondaryColor} />
            <Text style={[rc.shareTxt, { color: colorConfig.secondaryColor }]}>
              {translate("share")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Expanded */}
        {expanded && (
          <View>
            <View style={rc.divider} />
            <View style={rc.rowPair}>
              <View style={{ flex: 1 }}>
                <Text style={rc.micro}>{translate("Transaction ID")}</Text>
                <Text style={rc.micro2}>{item.txnid || "—"}</Text>
              </View>
              <View style={{ flex: 1, alignItems: "flex-end" }}>
                <Text style={rc.micro}>{translate("Payment Mode")}</Text>
                <Text style={rc.micro2}>{item.mode || "—"}</Text>
              </View>
            </View>
            <View style={rc.divider} />
            <View style={rc.balRow}>
              {[
                { l: translate("Pre Balance"),  v: `₹ ${item.remainpre ?? "0"}`,  c: "#1D4ED8", bg: "#EFF6FF" },
                { l: translate("Post Balance"), v: `₹ ${item.remainpost ?? "0"}`, c: "#16A34A", bg: "#DCFCE7" },
              ].map((b) => (
                <View key={b.l} style={[rc.balChip, { backgroundColor: b.bg }]}>
                  <Text style={[rc.balAmt, { color: b.c }]}>{b.v}</Text>
                  <Text style={rc.balLbl}>{b.l}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </ViewShot>
  );
});

const rc = StyleSheet.create({
  wrap:      { backgroundColor: "#fff", borderRadius: 16, marginBottom: hScale(10), paddingHorizontal: wScale(14), paddingVertical: hScale(12), borderLeftWidth: 4, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 5 },
  topRow:    { flexDirection: "row", alignItems: "center", marginBottom: hScale(8) },
  iconWrap:  { width: wScale(44), height: wScale(44), borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: wScale(10) },
  name:      { fontSize: wScale(14), fontWeight: "700", color: "#111827", marginBottom: 2 },
  sub:       { fontSize: wScale(12), color: "#6B7280" },
  amount:    { fontSize: wScale(16), fontWeight: "800" },
  pill:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  pillTxt:   { fontSize: wScale(10), fontWeight: "800", letterSpacing: 0.3 },
  midRow:    { flexDirection: "row", alignItems: "center", marginBottom: hScale(8), gap: wScale(8) },
  micro:     { fontSize: wScale(10), color: "#9CA3AF", fontWeight: "600", marginBottom: 2 },
  micro2:    { fontSize: wScale(12), color: "#374151", fontWeight: "700" },
  banner:    { borderRadius: 8, paddingHorizontal: wScale(10), paddingVertical: hScale(5), marginBottom: hScale(8), alignItems: "center" },
  bannerTxt: { fontSize: wScale(11), fontWeight: "700" },
  footer:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  shareBtn:  { flexDirection: "row", alignItems: "center", gap: wScale(4), borderWidth: 1, borderRadius: 20, paddingHorizontal: wScale(10), paddingVertical: hScale(5) },
  shareTxt:  { fontSize: FontSize.tiny, fontWeight: "600" },
  divider:   { height: 1, backgroundColor: "#F3F4F6", marginVertical: hScale(8) },
  rowPair:   { flexDirection: "row", justifyContent: "space-between" },
  balRow:    { flexDirection: "row", gap: wScale(4) },
  balChip:   { flex: 1, borderRadius: 10, paddingVertical: hScale(7), alignItems: "center" },
  balAmt:    { fontSize: wScale(11), fontWeight: "800" },
  balLbl:    { fontSize: wScale(9), color: "#6B7280", marginTop: 2, fontWeight: "600", textAlign: "center" },
});

// ─── Dealer Card ──────────────────────────────────────────────────────────────
const DealerCard = React.memo(({
  item, index, colorConfig, loading, post,
}: any) => {
  const st = getStatusCfg(item.status);
  const [textInputVisible, setTextInputVisible] = useState(false);
  const [pin,  setPin]    = useState("");
  const [act,  setAction] = useState("");

  const handleChangeStatus = async () => {
    const res = await post({
      url: `${APP_URLS.UPI_Manual_Pending_To_Success}hideupiidres=${item.idno}&hideupiidrestypes=${act}&txtBankRRN=${act === "APPROVED" ? item.BankRRN : ""}&txtcode=${pin}`,
    });
    if (res) {
      ToastAndroid.show(res.Message, ToastAndroid.LONG);
    } else {
      ToastAndroid.show(res?.Message || translate("try again "), ToastAndroid.LONG);
    }
    setTextInputVisible(false);
    setPin("");
  };

  return (
    <View style={[dc.wrap, { borderLeftColor: st.color }]}>
      {/* Header */}
      <View style={dc.topRow}>
        <View style={[dc.iconWrap, { backgroundColor: st.bg }]}>
          <Text style={{ fontSize: wScale(20) }}>🏪</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={dc.name} numberOfLines={1}>
            {translate("Name")}: {item.RetailerName || translate("Not Available")}
          </Text>
          <Text style={dc.sub}>{translate("Date")}: {item.txndate || translate("0 0 0")}</Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <Text style={[dc.amount, { color: st.color }]}>₹ {item.amt}</Text>
          <View style={[dc.pill, { backgroundColor: st.bg }]}>
            <Text style={[dc.pillTxt, { color: st.color }]}>{st.label}</Text>
          </View>
        </View>
      </View>

      <View style={dc.divider} />

      {/* Balance chips */}
      <View style={dc.balRow}>
        {[
          { l: translate("Remain Pre"),  v: `₹ ${item.remainpre}`,  c: "#1D4ED8", bg: "#EFF6FF" },
          { l: translate("Charge"),      v: `₹ ${item.charge}`,     c: "#D97706", bg: "#FEF3C7" },
          { l: translate("Pay"),         v: `₹ ${item.finalpay}`,   c: "#7C3AED", bg: "#F5F3FF" },
          { l: translate("Remain Post"), v: `₹ ${item.remainpost}`, c: "#16A34A", bg: "#DCFCE7" },
        ].map((b) => (
          <View key={b.l} style={[dc.balChip, { backgroundColor: b.bg }]}>
            <Text style={[dc.balAmt, { color: b.c }]}>{b.v}</Text>
            <Text style={dc.balLbl}>{b.l}</Text>
          </View>
        ))}
      </View>

      <View style={dc.divider} />

      {/* BankRRN + Amount */}
      <View style={dc.infoRow}>
        <View style={{ flex: 1 }}>
          <Text style={dc.micro}>{translate("Bank RRN")}</Text>
          <Text style={dc.micro2}>{item.BankRRN || "—"}</Text>
        </View>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text style={dc.micro}>{translate("Amount")}</Text>
          <Text style={dc.micro2}>₹ {item.amt}</Text>
        </View>
      </View>

      {/* Pending actions */}
      {item.status === "Pending" && (
        <>
          <View style={dc.divider} />
          <View style={dc.actionRow}>
            <TouchableOpacity
              style={[dc.actionBtn, { backgroundColor: "#16A34A" }]}
              onPress={() => { setAction("APPROVED"); setTextInputVisible(true); }}
              activeOpacity={0.8}
            >
              <Text style={dc.actionTxt}>
                {loading ? translate("Loading...") : translate("Mark as SUCCESS")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[dc.actionBtn, { backgroundColor: "#DC2626" }]}
              onPress={() => { setAction("REJECTED"); setTextInputVisible(true); }}
              activeOpacity={0.8}
            >
              <Text style={dc.actionTxt}>
                {loading ? translate("Loading...") : translate("Mark as FAILED")}
              </Text>
            </TouchableOpacity>
          </View>

          {textInputVisible && (
            <View style={dc.inputWrap}>
              <TextInput
                style={[dc.input, { borderColor: colorConfig.primaryButtonColor }]}
                placeholder={translate("Enter Transaction PIN")}
                value={pin}
                onChangeText={setPin}
                keyboardType="number-pad"
                maxLength={4}
              />
              <TouchableOpacity
                style={[dc.submitBtn, { backgroundColor: colorConfig.primaryButtonColor }]}
                onPress={handleChangeStatus}
                activeOpacity={0.8}
              >
                <Text style={dc.submitTxt}>
                  {loading ? "Submitting..." : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </View>
  );
});

const dc = StyleSheet.create({
  wrap:      { backgroundColor: "#fff", borderRadius: 16, marginBottom: hScale(10), paddingHorizontal: wScale(14), paddingVertical: hScale(12), borderLeftWidth: 4, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 5 },
  topRow:    { flexDirection: "row", alignItems: "center", marginBottom: hScale(8) },
  iconWrap:  { width: wScale(44), height: wScale(44), borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: wScale(10) },
  name:      { fontSize: wScale(14), fontWeight: "700", color: "#111827", marginBottom: 2 },
  sub:       { fontSize: wScale(12), color: "#6B7280" },
  amount:    { fontSize: wScale(16), fontWeight: "800" },
  pill:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  pillTxt:   { fontSize: wScale(10), fontWeight: "800", letterSpacing: 0.3 },
  micro:     { fontSize: wScale(10), color: "#9CA3AF", fontWeight: "600", marginBottom: 2 },
  micro2:    { fontSize: wScale(12), color: "#374151", fontWeight: "700" },
  divider:   { height: 1, backgroundColor: "#F3F4F6", marginVertical: hScale(8) },
  balRow:    { flexDirection: "row", gap: wScale(4), marginBottom: hScale(4) },
  balChip:   { flex: 1, borderRadius: 10, paddingVertical: hScale(7), alignItems: "center" },
  balAmt:    { fontSize: wScale(11), fontWeight: "800" },
  balLbl:    { fontSize: wScale(9), color: "#6B7280", marginTop: 2, fontWeight: "600", textAlign: "center" },
  infoRow:   { flexDirection: "row", justifyContent: "space-between" },
  actionRow: { flexDirection: "row", gap: wScale(8) },
  actionBtn: { flex: 1, paddingVertical: hScale(10), borderRadius: 10, alignItems: "center" },
  actionTxt: { color: "#fff", fontSize: wScale(12), fontWeight: "700" },
  inputWrap: { flexDirection: "row", marginTop: hScale(10), alignItems: "center" },
  input:     { flex: 1, height: hScale(44), borderWidth: 1, borderRadius: 10, paddingLeft: wScale(12), fontSize: wScale(14) },
  submitBtn: { position: "absolute", right: 0, height: hScale(44), paddingHorizontal: wScale(16), borderRadius: 10, justifyContent: "center", alignItems: "center" },
  submitTxt: { color: "#fff", fontWeight: "700", fontSize: wScale(13) },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const PaymentGReport = () => {
  const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);
  const { userId }                = useSelector((state: any) => state.userInfo);
  const { post }                  = useAxiosHook();

  const primary          = colorConfig.primaryColor ?? colorConfig.secondaryColor ?? "#1D4ED8";
  const shimmerHighlight = primary + "30";

  const capRef = useRef<any>(null);

  const [transactions,   setTransactions]   = useState<any[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [present,        setPresent]        = useState(10);
  const [expandedId,     setExpandedId]     = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [id,             setID]             = useState("ALL");
  const [selectedDate,   setSelectedDate]   = useState({
    from: new Date().toISOString().split("T")[0],
    to:   new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    recentTransactions(selectedDate.from, selectedDate.to, selectedStatus, id);
  }, [selectedDate, selectedStatus]);

  const recentTransactions = useCallback(async (
    from: string, to: string, status: string, retailerId: string
  ) => {
    setLoading(true);
    try {
      const fmt  = (d: string) => new Date(d).toISOString().split("T")[0];
      const url  = `${APP_URLS.PaymentGateway}ddlstatus=${status}&pagesize=500&txt_frm_date=${fmt(from)}&txt_to_date=${fmt(to)}`;
      const url2 = `${APP_URLS.Get_UPI_DealerTransfer_History}txt_frm_date=${fmt(from)}&txt_to_date=${fmt(to)}&Retailerid=${retailerId}&ddlstatus=${status}`;
      const response = await post({ url: IsDealer ? url2 : url });
      if (response) {
        setTransactions(IsDealer
          ? (response.Upitxn_Details ?? [])
          : (response.RESULT ?? []));
      } else {
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [IsDealer, post]);

  const toggleExpand = useCallback((key: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId((prev) => (prev === key ? null : key));
  }, []);

  const renderRetailerItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const key = item.txnid ?? item.bankrrnno ?? String(index);
    return (
      <RetailerCard
        item={item}
        expanded={expandedId === key}
        onToggle={() => toggleExpand(key)}
        colorConfig={colorConfig}
        capRef={capRef}
      />
    );
  }, [expandedId, toggleExpand, colorConfig]);

  const renderDealerItem = useCallback(({ item, index }: { item: any; index: number }) => (
    <DealerCard
      item={item}
      index={index}
      colorConfig={colorConfig}
      loading={loading}
      post={post}
    />
  ), [colorConfig, loading, post]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AppBarSecond title={IsDealer ? "Add Money Report" : "Payment Gateway History"} />

      <DateRangePicker
        isshowRetailer={IsDealer}
        isStShow={true}
        onDateSelected={(from: string, to: string) => setSelectedDate({ from, to })}
        SearchPress={(from: string, to: string, status: string) =>
          recentTransactions(from, to, status, id)
        }
        status={selectedStatus}
        setStatus={setSelectedStatus}
        retailerID={(rid: string) => {
          setID(rid);
          recentTransactions(selectedDate.from, selectedDate.to, selectedStatus, rid);
        }}
      />

      <View style={styles.body}>
        {loading ? (
          <SkeletonList highlight={shimmerHighlight} />
        ) : transactions.length === 0 ? (
          <View style={styles.empty}>
            <NoDatafound />
          </View>
        ) : IsDealer ? (
          <FlashList
            data={transactions}
            renderItem={renderDealerItem}
            keyExtractor={(item: any) => item.idno?.toString() ?? String(Math.random())}
            estimatedItemSize={160}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <FlatList
            data={transactions.slice(0, present)}
            renderItem={renderRetailerItem}
            keyExtractor={(_, i) => String(i)}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            initialNumToRender={12}
            maxToRenderPerBatch={15}
            windowSize={10}
            removeClippedSubviews
            ListFooterComponent={
              transactions.length > present ? (
                <DynamicButton title="Load More" onPress={() => setPresent((p) => p + 10)} />
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
};

export default PaymentGReport;

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: "#F9FAFB" },
  body:  { flex: 1, paddingTop: hScale(4) },
  list:  { paddingHorizontal: wScale(12), paddingBottom: hScale(30), paddingTop: hScale(4) },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
});