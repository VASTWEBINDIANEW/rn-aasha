import { translate } from "../../utils/languageUtils/I18n";
import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import useAxiosHook from "../../utils/network/AxiosClient";
import { APP_URLS } from "../../utils/network/urls";
import { useSelector } from "react-redux";
import { hScale, wScale } from "../../utils/styles/dimensions";
import AppBarSecond from "../drawer/headerAppbar/AppBarSecond";
import NoDatafound from "../drawer/svgimgcomponents/Nodatafound";
import DynamicButton from "../drawer/button/DynamicButton";
import { RootState } from "../../reduxUtils/store";
import { colors, FontSize } from "../../utils/styles/theme";
import DateRangePicker from "../../components/DateRange";
import OnelineDropdownSvg from "../drawer/svgimgcomponents/simpledropdown";
import ShareSvg from "../drawer/svgimgcomponents/sharesvg";

// ─── Skeleton Card (mirrors real card layout exactly) ─────────────────────────
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
      {/* Left accent bar (mirrors borderLeftWidth:4 of real card) */}
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
        {/* Firm name */}
        <SkeletonPlaceholder.Item width="65%" height={hScale(13)} borderRadius={6} />
        {/* Txn type */}
        <SkeletonPlaceholder.Item width="40%" height={hScale(11)} borderRadius={6} marginTop={hScale(6)} />
        {/* Mode + time row */}
        <SkeletonPlaceholder.Item flexDirection="row" marginTop={hScale(10)}>
          <SkeletonPlaceholder.Item width={wScale(80)} height={hScale(11)} borderRadius={6} />
          <SkeletonPlaceholder.Item width={wScale(70)} height={hScale(11)} borderRadius={6} marginLeft={wScale(12)} />
        </SkeletonPlaceholder.Item>
        {/* Status banner */}
        <SkeletonPlaceholder.Item width="80%" height={hScale(22)} borderRadius={8} marginTop={hScale(10)} />
      </SkeletonPlaceholder.Item>

      {/* Right: amount + status pill */}
      <SkeletonPlaceholder.Item alignItems="flex-end" marginLeft={wScale(8)}>
        <SkeletonPlaceholder.Item width={wScale(62)} height={hScale(15)} borderRadius={6} />
        <SkeletonPlaceholder.Item width={wScale(54)} height={hScale(22)} borderRadius={20} marginTop={hScale(8)} />
        {/* Share button placeholder */}
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

// ─── Status Badge ─────────────────────────────────────────────────────────────
const statusColor = (status: string) => {
  const s = status?.toLowerCase();
  if (s === "success") return { bg: "#E6F9EE", text: "#1A8C4E", border: "#1A8C4E" };
  if (s === "failed") return { bg: "#FEE8E8", text: "#D93025", border: "#D93025" };
  return { bg: "#FFF8E1", text: "#B8860B", border: "#E6B42C" };
};

// ─── Info Row ─────────────────────────────────────────────────────────────────
const InfoRow = ({
  label,
  value,
  align = "left",
}: {
  label: string;
  value: string;
  align?: "left" | "center" | "right";
}) => (
  <View style={{ flex: 1, alignItems: align === "left" ? "flex-start" : align === "right" ? "flex-end" : "center" }}>
    <Text style={[styles.label, { textAlign: align }]}>{label}</Text>
    <Text style={[styles.value, { textAlign: align }]}>{value}</Text>
  </View>
);

// ─── Transaction Card (Retailer) ──────────────────────────────────────────────
const TransactionDetails = ({
  item,
  colorConfig,
}: {
  item: any;
  colorConfig: any;
}) => {
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useState(new Animated.Value(0))[0];
  const sc = statusColor(item.status);

  const toggleExpand = () => {
    Animated.spring(rotateAnim, {
      toValue: expanded ? 0 : 1,
      useNativeDriver: true,
    }).start();
    setExpanded(!expanded);
  };

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });

  return (
    <View style={[styles.card, { borderLeftColor: sc.border }]}>
      {/* Header */}
      <TouchableOpacity activeOpacity={0.7} onPress={toggleExpand}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.firmName} numberOfLines={1}>
              {item.Frm_Name || "—"}
            </Text>
            <Text style={styles.txnType}>{item.transaction_type || "—"}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <View style={[styles.statusBadge, { backgroundColor: sc.bg, borderColor: sc.border }]}>
              <Text style={[styles.statusBadgeText, { color: sc.text }]}>{item.status}</Text>
            </View>
            <Text style={styles.amountText}>₹ {item.amount}.00</Text>
          </View>
        </View>

        {/* SMS Banner */}
        <View style={[styles.smsBanner, { backgroundColor: sc.border }]}>
          <Text style={styles.smsBannerText} numberOfLines={1}>
            {item.status?.toLowerCase() === "success"
              ? "Transaction Amount Paid Successfully"
              : item.status?.toLowerCase() === "pending"
              ? "Transaction is in Queue / Pending"
              : item.status?.toLowerCase() === "failed"
              ? "Transaction has Failed"
              : ""}
          </Text>
        </View>

        {/* Mode + Arrow */}
        <View style={styles.modeRow}>
          <View>
            <Text style={styles.label}>{translate("Transaction_Mode")}</Text>
            <Text style={[styles.value, { textTransform: "uppercase" }]}>
              {item.transaction_type || "—"}
            </Text>
          </View>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <OnelineDropdownSvg />
          </Animated.View>
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* Time + Share */}
      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.label}>{translate("Request_Time")}</Text>
          <Text style={styles.value}>{item.transtime || "—"}</Text>
        </View>
        <TouchableOpacity style={[styles.shareBtn, { borderColor: colorConfig.secondaryColor }]}>
          <ShareSvg size={wScale(16)} color={colorConfig.secondaryColor} />
          <Text style={[styles.shareText, { color: colorConfig.secondaryColor }]}>
            {translate("Share")}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View>
        <Text style={styles.label}>{translate("Card_Number")}</Text>
        <Text style={styles.value}>{item.masked_pan || "—"}</Text>
      </View>

      {/* Expandable */}
      {expanded && (
        <View>
          <View style={styles.divider} />
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.label}>{translate("Transaction_ID")}</Text>
              <Text style={styles.value}>{item.transaction_id || "—"}</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={styles.label}>Payment Mode</Text>
              <Text style={[styles.value, { textAlign: "right" }]}>{item.payment_method || "—"}</Text>
            </View>
          </View>

          <View style={styles.divider} />
          <View style={styles.balanceRow}>
            <InfoRow label={translate("Pre_Balance")} value={`₹ ${item.retailer_remain_pre}`} align="left" />
            <InfoRow label={translate("Network")} value={`₹ ${item.network}`} align="center" />
            <InfoRow label={translate("Pos_Balance")} value={`₹ ${item.retailer_remain_post}`} align="right" />
          </View>

          <View style={styles.divider} />
          <View style={styles.balanceRow}>
            <InfoRow label={translate("GST")} value={`₹ ${item.Retailer_gst}`} align="left" />
            <InfoRow label={translate("TDS")} value={`₹ ${item.Retailer_tds}`} align="center" />
            <InfoRow label={translate("My_Earn")} value={`₹ ${item.Retailer_comm}`} align="right" />
          </View>
        </View>
      )}
    </View>
  );
};

// ─── Transaction Card (Dealer) ────────────────────────────────────────────────
const TransactionDetails2 = ({
  item,
  colorConfig,
}: {
  item: any;
  colorConfig: any;
}) => {
  const [expanded, setExpanded] = useState(false);
  const rotateAnim = useState(new Animated.Value(0))[0];

  const toggleExpand = () => {
    Animated.spring(rotateAnim, { toValue: expanded ? 0 : 1, useNativeDriver: true }).start();
    setExpanded(!expanded);
  };

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });

  return (
    <View style={[styles.card, { borderLeftColor: colorConfig.secondaryColor }]}>
      <TouchableOpacity activeOpacity={0.7} onPress={toggleExpand}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.firmName} numberOfLines={1}>{item.Frm_Name || "—"}</Text>
            <Text style={styles.txnType}>Device ID: {item.deviceid || "—"}</Text>
          </View>
        </View>

        <View style={styles.modeRow}>
          <View>
            <Text style={styles.label}>{translate("Plan_Name")}</Text>
            <Text style={[styles.value, { textTransform: "uppercase" }]}>{item.planname || "—"}</Text>
          </View>
          <Animated.View style={{ transform: [{ rotate }] }}>
            <OnelineDropdownSvg />
          </Animated.View>
        </View>
      </TouchableOpacity>

      <View style={styles.divider} />

      <View style={styles.rowBetween}>
        <View>
          <Text style={styles.label}>{translate("Request_Time")}</Text>
          <Text style={styles.value}>{item.transdate || "—"}</Text>
        </View>
        <TouchableOpacity style={[styles.shareBtn, { borderColor: colorConfig.secondaryColor }]}>
          <ShareSvg size={wScale(16)} color={colorConfig.secondaryColor} />
          <Text style={[styles.shareText, { color: colorConfig.secondaryColor }]}>{translate("Share")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      <View>
        <Text style={styles.label}>{translate("Noof_Trans")}</Text>
        <Text style={styles.value}>{item.nooftrans || "—"}</Text>
      </View>

      {expanded && (
        <View>
          <View style={styles.divider} />
          <View style={styles.balanceRow}>
            <InfoRow label={translate("Pre_Balance")} value={`₹ ${item.dlmpre}`} align="left" />
            <InfoRow label={translate("Pos_Balance")} value={`₹ ${item.dlmpost}`} align="right" />
          </View>

          <View style={styles.divider} />
          <View style={styles.balanceRow}>
            <InfoRow label={translate("GST")} value={`₹ ${item.dlmgst}`} align="left" />
            <InfoRow label={translate("TDS")} value={`₹ ${item.dlmtds}`} align="center" />
            <InfoRow label={translate("Commission")} value={`₹ ${item.dlmcomm}`} align="right" />
          </View>
        </View>
      )}
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const MatmReport = () => {
  const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);
  const primary = colorConfig.primaryColor ?? colorConfig.secondaryColor ?? "#1D4ED8";
  const shimmerHighlight = primary + "30";

  const [transactions, setTransactions] = useState([]);
  const [present, setPresent] = useState(10);
  const [loading, setLoading] = useState(false);
  const { get } = useAxiosHook();
  const { userId } = useSelector((state: any) => state.userInfo);

  const [selectedDate, setSelectedDate] = useState({
    from: new Date().toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [searchnumber, setSearchnumber] = useState("");

  useEffect(() => {
    recentTransactions(selectedDate.from, selectedDate.to, selectedStatus);
  }, []);

  const recentTransactions = async (from: string, to: string, status: string) => {
    setLoading(true);
    try {
      const formattedFrom = new Date(from).toISOString().split("T")[0];
      const formattedTo = new Date(to).toISOString().split("T")[0];
      const url2 = `${APP_URLS.dealermicroatm}txt_frm_date=${formattedFrom}&txt_to_date=${formattedTo}&userrole=Dealer`;
      const url = `${APP_URLS.matmReport}ddl_status=${status}&txt_frm_date=${formattedFrom}&txt_to_date=${formattedTo}`;
      const response = await get({ url: IsDealer ? url2 : url });
      setTransactions(response.Message || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.main}>
      <AppBarSecond title={!IsDealer ? "m-ATM History" : "Micro ATM Rental Report"} />

      <DateRangePicker
        onDateSelected={(from: string, to: string) => setSelectedDate({ from, to })}
        SearchPress={(from: string, to: string, status: string) =>
          recentTransactions(from, to, status)
        }
        status={selectedStatus}
        setStatus={setSelectedStatus}
        searchnumber={searchnumber}
        setSearchnumber={setSearchnumber}
        isshowRetailer={false}
        isStShow={true}
      />

      <View style={styles.container}>
        {loading ? (
          <SkeletonList highlight={shimmerHighlight} />
        ) : transactions.length === 0 ? (
          <NoDatafound />
        ) : (
          <FlatList
            data={transactions.slice(0, present)}
            keyExtractor={(_, index) => index.toString()}
            contentContainerStyle={{ paddingBottom: hScale(20) }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) =>
              IsDealer ? (
                <TransactionDetails2 item={item} colorConfig={colorConfig} />
              ) : (
                <TransactionDetails item={item} colorConfig={colorConfig} />
              )
            }
            ListFooterComponent={
              transactions.length > present ? (
                <DynamicButton onPress={() => setPresent((p) => p + 10)} />
              ) : null
            }
          />
        )}
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: "#F5F7FA" },
  container: {
    flex: 1,
    paddingHorizontal: wScale(14),
    paddingTop: hScale(10),
  },

  // Card
  card: {
    backgroundColor: "#FFFFFF",
    marginBottom: hScale(12),
    borderRadius: 14,
    borderLeftWidth: wScale(4),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    paddingHorizontal: wScale(14),
    paddingVertical: hScale(12),
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: hScale(8),
  },
  firmName: {
    fontSize: FontSize.medium,
    fontWeight: "700",
    color: "#1A1D23",
    marginBottom: hScale(2),
  },
  txnType: {
    fontSize: FontSize.small,
    color: "#6B7280",
  },
  amountText: {
    fontSize: wScale(17),
    fontWeight: "800",
    color: "#1A1D23",
    marginTop: hScale(4),
  },

  // Status Badge
  statusBadge: {
    paddingHorizontal: wScale(8),
    paddingVertical: hScale(3),
    borderRadius: 20,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: FontSize.tiny,
    fontWeight: "700",
    letterSpacing: 0.4,
  },

  // SMS Banner
  smsBanner: {
    borderRadius: 8,
    paddingVertical: hScale(5),
    paddingHorizontal: wScale(10),
    marginBottom: hScale(10),
  },
  smsBannerText: {
    fontSize: FontSize.teeny,
    color: "#FFFFFF",
    fontWeight: "600",
    textAlign: "center",
    letterSpacing: 0.5,
  },

  modeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: hScale(4),
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: hScale(6),
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: hScale(6),
  },

  // Labels & Values
  label: {
    fontSize: FontSize.small,
    color: "#9CA3AF",
    fontWeight: "600",
    marginBottom: hScale(2),
  },
  value: {
    fontSize: FontSize.regular,
    color: "#1A1D23",
    fontWeight: "500",
  },

  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#E5E7EB",
    marginVertical: hScale(6),
  },

  // Share Button
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: wScale(4),
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: wScale(10),
    paddingVertical: hScale(5),
  },
  shareText: {
    fontSize: FontSize.tiny,
    fontWeight: "600",
  },
});

export default MatmReport;