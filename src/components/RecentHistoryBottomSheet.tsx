import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../reduxUtils/store";
import { SCREEN_HEIGHT, hScale, wScale } from "../utils/styles/dimensions";
import NoDatafound from "../features/drawer/svgimgcomponents/Nodatafound";
import ClosseModalSvg2 from "../features/drawer/svgimgcomponents/ClosseModal2";

interface Props {
  isModalVisible: boolean;
  setModalVisible: (val: boolean) => void;
  historylistdata: any[];
}

const RecentHistory: React.FC<Props> = ({
  isModalVisible,
  setModalVisible,
  historylistdata,
}) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  const headerBg = colorConfig?.secondaryColor ? `${colorConfig.secondaryColor}0A` : "#F8F9FA";
  const primaryLight = colorConfig?.primaryColor ? `${colorConfig.primaryColor}0C` : "#F1F5F9";

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
        return { color: "#16A34A", bg: "#E8F5E9" };
      case "FAILED":
        return { color: "#DC2626", bg: "#FFEBEE" };
      default:
        return { color: "#D97706", bg: "#FFF8E1" };
    }
  };

  const lastFiveTransactions = useMemo(() => {
    if (!Array.isArray(historylistdata)) return [];
    return historylistdata.slice(0, 5);
  }, [historylistdata]);

  const renderItem = ({ item }: { item: any }) => {
    const status = item?.Status || "PENDING";
    const statusStyle = getStatusStyle(status);

    return (
      <View style={[styles.transactionCard, { borderColor: primaryLight }]}>
        <View style={styles.leftInfo}>
          <Text style={styles.mobileText}>{item?.Recharge_number || "N/A"}</Text>
          <Text style={styles.operatorSubText}>
            {item?.Operator_name || "Unknown"} <Text style={styles.bullet}>•</Text> <Text style={styles.timeText}>{item?.Reqesttime || ""}</Text>
          </Text>
        </View>

        <View style={styles.rightInfo}>
          <Text style={styles.amountValue}>₹{item?.Recharge_amount || "0"}</Text>
          <View style={[styles.statusTag, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.statusTabText, { color: statusStyle.color }]}>
              {status}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      transparent
      visible={isModalVisible}
      animationType="slide"
      statusBarTranslucent
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        />

        <View style={styles.sheetContainer}>
          {/* Compact Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.knob} />
          </View>

          {/* Mini Header */}
          <View style={[styles.headerSection, { backgroundColor: headerBg }]}>
            <View>
              <Text style={styles.headerLabel}>Recent Transactions</Text>
              <Text style={styles.headerSubLabel}>Last 5 activities</Text>
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeTapArea}
              activeOpacity={0.6}
            >
              <ClosseModalSvg2 width={16} height={16} />
            </TouchableOpacity>
          </View>

          {/* Conditional Layout */}
          {lastFiveTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <NoDatafound />
              <Text style={styles.emptyTitle}>No History Found</Text>
            </View>
          ) : (
            <FlatList
              data={lastFiveTransactions}
              keyExtractor={(item, index) => item?.Idno?.toString() || index.toString()}
              renderItem={renderItem}
              contentContainerStyle={styles.listPadding}
              showsVerticalScrollIndicator={false}
              bounces={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(15, 23, 42, 0.35)",
  },
  sheetContainer: {
    width: "100%",
    maxHeight: SCREEN_HEIGHT * 0.58, // Height choti kar di taaki seamless compact lage
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 15,
  },
  topBar: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 4,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  knob: {
    width: 36,
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 10,
  },
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: hScale(10), // Chota padding
    paddingHorizontal: wScale(16),
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerLabel: {
    fontSize: wScale(15), // Smaller professional size
    color: "#0F172A",
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  headerSubLabel: {
    fontSize: wScale(10.5),
    color: "#64748B",
    fontWeight: "500",
  },
  closeTapArea: {
    padding: 5,
    backgroundColor: "#F1F5F9",
    borderRadius: 50,
  },
  listPadding: {
    paddingTop: hScale(10),
    paddingHorizontal: wScale(14),
    paddingBottom: hScale(24),
  },
  transactionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hScale(10), // Slim card row
    paddingHorizontal: wScale(12),
    borderRadius: 12,
    marginBottom: hScale(8),
    borderWidth: 1,
    backgroundColor: "#FFF",
  },
  leftInfo: {
    flex: 1,
    paddingRight: wScale(8),
  },
  mobileText: {
    fontSize: wScale(13.5),
    color: "#0F172A",
    fontWeight: "600",
  },
  operatorSubText: {
    fontSize: wScale(11.5),
    color: "#475569",
    fontWeight: "400",
    marginTop: 1,
  },
  bullet: {
    color: "#94A3B8",
    fontSize: wScale(10),
  },
  timeText: {
    fontSize: wScale(11),
    color: "#94A3B8",
  },
  rightInfo: {
    alignItems: "flex-end",
  },
  amountValue: {
    fontSize: wScale(14),
    fontWeight: "700",
    color: "#0F172A",
  },
  statusTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 2,
  },
  statusTabText: {
    fontSize: wScale(9),
    fontWeight: "700",
    textTransform: "uppercase",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: hScale(40),
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: wScale(14),
    color: "#64748B",
    fontWeight: "600",
  },
});

export default RecentHistory;