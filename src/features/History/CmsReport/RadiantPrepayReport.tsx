import { translate } from "../../../utils/languageUtils/I18n";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  UIManager,
} from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { FlashList } from "@shopify/flash-list";
import { APP_URLS } from "../../../utils/network/urls";
import useAxiosHook from "../../../utils/network/AxiosClient";
import AppBarSecond from "../../drawer/headerAppbar/AppBarSecond";
import DateRangePicker from "../../../components/DateRange";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import NoDatafound from "../../drawer/svgimgcomponents/Nodatafound";
import BorderLine from "../../../components/BorderLine";
import CheckSvg from "../../drawer/svgimgcomponents/CheckSvg";
import { RootState } from "../../../reduxUtils/store";
import { useSelector } from "react-redux";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import PaddingSvg2 from "../../drawer/svgimgcomponents/PaddingSvg2";
import FailedSvg from "../../drawer/svgimgcomponents/Failedimg";
import { useNavigation } from "../../../utils/navigation/NavigationService";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { color: string; bg: string }> = {
  pending: { color: "#D97706", bg: "#FEF3C7" },
  failed:  { color: "#DC2626", bg: "#FEE2E2" },
  success: { color: "#16A34A", bg: "#DCFCE7" },
  refund:  { color: "#2563EB", bg: "#DBEAFE" },
};

const resolveStatus = (sts: string) => {
  const raw = sts?.toLowerCase();
  return raw?.startsWith("r") ? "refund" : raw;
};

const getStatusCfg = (sts: string) =>
  STATUS_CONFIG[resolveStatus(sts)] ?? { color: "#6B7280", bg: "#F3F4F6" };

const normalizeDate = (date: string) =>
  new Date(date).toISOString().split("T")[0];

// ─── Skeleton Card ─────────────────────────────────────────────────────────────
const SkeletonCard = ({ highlight }: { highlight: string }) => (
  <SkeletonPlaceholder
    borderRadius={14}
    speed={1300}
    backgroundColor="#F3F4F6"
    highlightColor={highlight}
  >
    <SkeletonPlaceholder.Item
      backgroundColor="#fff"
      borderRadius={14}
      marginBottom={hScale(14)}
      marginHorizontal={wScale(12)}
      overflow="hidden"
    >
      {/* Header bar */}
      <SkeletonPlaceholder.Item
        width="100%"
        height={hScale(46)}
        borderTopLeftRadius={14}
        borderTopRightRadius={14}
      />
      {/* Body */}
      <SkeletonPlaceholder.Item paddingHorizontal={wScale(14)} paddingVertical={hScale(12)}>
        {/* Status row */}
        <SkeletonPlaceholder.Item
          flexDirection="row"
          justifyContent="space-between"
          marginBottom={hScale(10)}
        >
          <SkeletonPlaceholder.Item width={wScale(100)} height={hScale(22)} borderRadius={20} />
          <SkeletonPlaceholder.Item width={wScale(28)} height={wScale(28)} borderRadius={14} />
        </SkeletonPlaceholder.Item>
        {/* Info rows */}
        {[1, 2, 3, 4].map((k) => (
          <SkeletonPlaceholder.Item
            key={k}
            flexDirection="row"
            justifyContent="space-between"
            marginBottom={hScale(8)}
          >
            <SkeletonPlaceholder.Item width={wScale(90)} height={hScale(11)} borderRadius={6} />
            <SkeletonPlaceholder.Item width={wScale(110)} height={hScale(11)} borderRadius={6} />
          </SkeletonPlaceholder.Item>
        ))}
        {/* Balance chips */}
        <SkeletonPlaceholder.Item
          flexDirection="row"
          gap={wScale(6)}
          marginTop={hScale(8)}
        >
          <SkeletonPlaceholder.Item flex={1} height={hScale(44)} borderRadius={10} />
          <SkeletonPlaceholder.Item flex={1} height={hScale(44)} borderRadius={10} />
          <SkeletonPlaceholder.Item flex={1} height={hScale(44)} borderRadius={10} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder.Item>
  </SkeletonPlaceholder>
);

const SkeletonList = ({ highlight }: { highlight: string }) => (
  <View style={{ paddingTop: hScale(4) }}>
    {[1, 2, 3].map((k) => <SkeletonCard key={k} highlight={highlight} />)}
  </View>
);

// ─── Status Icon ──────────────────────────────────────────────────────────────
const StatusIcon = ({ resolved }: { resolved: string }) => {
  if (resolved === "success")
    return (
      <View style={[ic.wrap, { backgroundColor: "#16A34A" }]}>
        <CheckSvg size={15} />
      </View>
    );
  if (resolved === "pending") return <PaddingSvg2 size={26} />;
  if (resolved === "failed")  return <FailedSvg size={26} />;
  if (resolved === "refund")
    return <MaterialCommunityIcons name="clock" color="#2563EB" size={26} />;
  return <MaterialCommunityIcons name="clock" color="#6B7280" size={26} />;
};

const ic = StyleSheet.create({
  wrap: { height: wScale(26), width: wScale(26), borderRadius: 13, alignItems: "center", justifyContent: "center" },
});

// ─── Info Row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={ir.wrap}>
    <Text style={ir.label}>{label}</Text>
    <Text style={ir.value}>{value || "NULL"}</Text>
  </View>
);

const ir = StyleSheet.create({
  wrap:  { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: hScale(5), paddingHorizontal: wScale(4) },
  label: { fontSize: wScale(13), color: "#6B7280", flex: 1 },
  value: { fontSize: wScale(13), fontWeight: "700", color: "#111827", flex: 1, textAlign: "right", textTransform: "capitalize" },
});

// ─── Transaction Card ─────────────────────────────────────────────────────────
const TxnCard = React.memo(({ item, colorConfig, onPDF }: any) => {
  const resolved = resolveStatus(item.sts);
  const { color, bg } = getStatusCfg(item.sts);

  return (
    <View style={[card.wrap, { borderColor: color }]}>

      {/* ── Colored header bar ── */}
      <View style={[card.header, { backgroundColor: color }]}>
        <View style={{ flex: 1 }}>
          <Text style={card.headerLabel}>{translate("Trans_Request_Insert_Time")}</Text>
          <Text style={card.headerValue}>{item.Insertdate}</Text>
        </View>
        <View style={{ flex: 1, alignItems: "flex-end" }}>
          <Text style={card.headerLabel}>{translate("Cash_Pickup_Collection_Time")}</Text>
          <Text style={card.headerValue}>{item.Updatedate}</Text>
        </View>
      </View>

      {/* ── Body ── */}
      <View style={card.body}>

        {/* Status pill row */}
        <View style={[card.statusRow, { backgroundColor: `${colorConfig.secondaryColor}33` }]}>
          <View style={{ flex: 1 }}>
            <Text style={card.statusLabel}>{translate("Transaction_Status")}</Text>
            <View style={[card.statusPill, { backgroundColor: bg, borderColor: color }]}>
              <Text style={[card.statusTxt, { color }]}>{item.sts}</Text>
            </View>
          </View>
          <StatusIcon resolved={resolved} />
        </View>

        <View style={card.divider} />

        {/* RCE ID + Mode */}
        <View style={card.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={card.fieldLabel}>{translate("RCE_ID")}</Text>
            <Text style={card.fieldValue}>{item.CEID || "—"}</Text>
          </View>
          <View style={{ flex: 1, alignItems: "flex-end" }}>
            <Text style={card.fieldLabel}>{translate("Transaction_Mode")}</Text>
            <Text style={card.fieldValue}>{translate("PrePay")}</Text>
          </View>
        </View>

        <View style={card.divider} />

        {/* Info rows */}
        <InfoRow label={translate("Requst_ID")}     value={item.RequestID} />
        <BorderLine height={0.5} width="100%" />
        <InfoRow label={translate("Transaction_ID")} value={item.transid || "NULL"} />
        <BorderLine height={0.5} width="100%" />
        <InfoRow label={translate("Shop_ID")}        value={item.Shop_id || "NULL"} />
        <BorderLine height={0.5} width="100%" />
        <InfoRow label={translate("Client_Name")}    value={item.Clientname || "NULL"} />

        <View style={card.divider} />

        {/* Balance chips */}
        <View style={card.balRow}>
          {[
            { l: translate("Previous_Balance"),  v: `₹ ${item.RemainPre  ?? 0}`, c: "#1D4ED8", bg: "#EFF6FF" },
            { l: translate("Paid_Amount"),        v: `₹ ${item.Amount     ?? 0}`, c: color,     bg            },
            { l: translate("Remaining_Balance"),  v: `₹ ${item.RemainPost ?? 0}`, c: "#16A34A", bg: "#DCFCE7" },
          ].map((b) => (
            <View key={b.l} style={[card.balChip, { backgroundColor: b.bg }]}>
              <Text style={[card.balAmt, { color: b.c }]}>{b.v}</Text>
              <Text style={card.balLbl}>{b.l}</Text>
            </View>
          ))}
        </View>

        {/* PDF actions — only on success */}
        {resolved === "success" && (
          <>
            <Text style={card.footerTitle}>{translate("PickupCollection_Slip")}</Text>
            <View style={card.btnRow}>
              <TouchableOpacity
                style={[card.btn, { backgroundColor: "#DCFCE7", borderColor: "#16A34A" }]}
                onPress={() => onPDF(item.RequestID, "view")}
                activeOpacity={0.8}
              >
                <Text style={[card.btnTxt, { color: "#16A34A" }]}>{translate("View")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[card.btn, { backgroundColor: "#DBEAFE", borderColor: "#2563EB" }]}
                onPress={() => onPDF(item.RequestID, "share")}
                activeOpacity={0.8}
              >
                <Text style={[card.btnTxt, { color: "#2563EB" }]}>{translate("Share")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[card.btn, { backgroundColor: "#F5F3FF", borderColor: "#7C3AED" }]}
                activeOpacity={0.8}
              >
                <Text style={[card.btnTxt, { color: "#7C3AED" }]}>{translate("Download")}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
});

const card = StyleSheet.create({
  wrap:        { marginBottom: hScale(14), marginHorizontal: wScale(12), borderRadius: 14, borderWidth: 1, backgroundColor: "#fff", elevation: 3, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, overflow: "hidden" },
  header:      { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: wScale(12), paddingVertical: hScale(10) },
  headerLabel: { fontSize: wScale(10), color: "#fff", fontWeight: "700", letterSpacing: 0.8, marginBottom: 2 },
  headerValue: { fontSize: wScale(12), color: "#fff", fontWeight: "800", textTransform: "uppercase" },
  body:        { paddingHorizontal: wScale(12), paddingVertical: hScale(10) },
  statusRow:   { flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 40, paddingHorizontal: wScale(12), paddingVertical: hScale(8), marginBottom: hScale(6) },
  statusLabel: { fontSize: wScale(10), color: "#6B7280", fontWeight: "600", marginBottom: 4 },
  statusPill:  { alignSelf: "flex-start", paddingHorizontal: wScale(10), paddingVertical: hScale(3), borderRadius: 20, borderWidth: 1 },
  statusTxt:   { fontSize: wScale(11), fontWeight: "800", letterSpacing: 0.3, textTransform: "capitalize" },
  divider:     { height: 1, backgroundColor: "#F3F4F6", marginVertical: hScale(6) },
  rowBetween:  { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: wScale(4) },
  fieldLabel:  { fontSize: wScale(11), color: "#9CA3AF", fontWeight: "600", marginBottom: 2 },
  fieldValue:  { fontSize: wScale(13), color: "#111827", fontWeight: "700", textTransform: "capitalize" },
  balRow:      { flexDirection: "row", gap: wScale(6), marginTop: hScale(4) },
  balChip:     { flex: 1, borderRadius: 10, paddingVertical: hScale(8), alignItems: "center" },
  balAmt:      { fontSize: wScale(12), fontWeight: "800" },
  balLbl:      { fontSize: wScale(9), color: "#6B7280", marginTop: 2, fontWeight: "600", textAlign: "center" },
  footerTitle: { fontWeight: "700", fontSize: wScale(13), color: "#374151", textAlign: "center", marginTop: hScale(12), marginBottom: hScale(8) },
  btnRow:      { flexDirection: "row", gap: wScale(8), marginBottom: hScale(4) },
  btn:         { flex: 1, paddingVertical: hScale(8), borderRadius: 10, borderWidth: 1, alignItems: "center" },
  btnTxt:      { fontSize: wScale(12), fontWeight: "700" },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const RadiantPrepayReport = () => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const { post }        = useAxiosHook();
  const navigation      = useNavigation();

  const primary          = colorConfig.primaryColor ?? colorConfig.secondaryColor ?? "#1D4ED8";
  const shimmerHighlight = primary + "30";

  const today = new Date().toISOString().split("T")[0];

  const [loading,      setLoading]      = useState(true);
  const [data,         setData]         = useState<any[]>([]);
  const [status,       setStatus]       = useState("");
  const [selectedDate, setSelectedDate] = useState({ from: today, to: today });

  useEffect(() => {
    fetchData(normalizeDate(selectedDate.from), normalizeDate(selectedDate.to), status);
  }, [selectedDate, status]);

  const fetchData = useCallback(async (from: string, to: string, sts: string) => {
    setLoading(true);
    try {
      const url = `${APP_URLS.RadiantPrepayReport}?from=${from}&to=${to}&Status=${sts}`;
      const response = await post({ url });
      const list = Array.isArray(response) ? response : response?.data ?? [];
      setData(list);
    } catch (error) {
      console.log("API Error:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [post]);

  const PDFRepordata = useCallback(async (requestId: string, action = "view") => {
    try {
      const url = `${APP_URLS.RadiantPDFReport}${requestId}`;
      const response = await post({ url });
      if (response?.StatusCode === 200 && response?.Content?.length) {
        navigation.navigate("PrepaySlipSummary", { slipData: response.Content[0], action });
      } else {
        alert("No data found");
      }
    } catch (error) {
      console.log("PDF Error:", error);
    }
  }, [post, navigation]);

  const renderItem = useCallback(({ item }: { item: any }) => (
    <TxnCard
      item={item}
      colorConfig={colorConfig}
      onPDF={PDFRepordata}
    />
  ), [colorConfig, PDFRepordata]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AppBarSecond title="Cash Pickup Report" />

      <DateRangePicker
        isStShow={true}
        isshowRetailer={false}
        cmsStatu={false}
        setStatus={setStatus}
        onDateSelected={(from: string, to: string) =>
          setSelectedDate({ from: normalizeDate(from), to: normalizeDate(to) })
        }
        SearchPress={(from: string, to: string, sts: string) =>
          fetchData(normalizeDate(from), normalizeDate(to), sts)
        }
      />

      <View style={styles.body}>
        {loading ? (
          <SkeletonList highlight={shimmerHighlight} />
        ) : data.length === 0 ? (
          <View style={styles.empty}>
            <NoDatafound />
          </View>
        ) : (
          <FlashList
            data={data}
            renderItem={renderItem}
            estimatedItemSize={280}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
          />
        )}
      </View>
    </View>
  );
};

export default RadiantPrepayReport;

const styles = StyleSheet.create({
  root:  { flex: 1, backgroundColor: "#F9FAFB" },
  body:  { flex: 1, paddingTop: hScale(8) },
  list:  { paddingBottom: hScale(30), paddingTop: hScale(4) },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
});