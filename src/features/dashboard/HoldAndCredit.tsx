import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../reduxUtils/store";
import { APP_URLS } from "../../utils/network/urls";
import useAxiosHook from "../../utils/network/AxiosClient";
import HoldcreditSvg from "../drawer/svgimgcomponents/HoldcreditSvg";
import { hScale, wScale } from "../../utils/styles/dimensions";
import { translate } from "../../utils/languageUtils/I18n";
import AppBarSecond from "../drawer/headerAppbar/AppBarSecond";
import LinearGradient from "react-native-linear-gradient";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (val: any) =>
  val == null || val === "" ? "₹0.00" : `₹${val}`;

// ─── Stat Pill ────────────────────────────────────────────────────────────────

const StatPill = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) => (
  <View style={styles.statPill}>
    <View style={[styles.statAccentBar, { backgroundColor: accent }]} />
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const HoldAndCredit = () => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const primary: string = colorConfig?.primaryColor || "#0A84FF";
  const secondary: string = colorConfig?.secondaryColor || "#0055FF";

  const { get } = useAxiosHook();
  const [balance, setBalance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [balRes] = await Promise.all([
        get({ url: APP_URLS.balanceInfo }),
        get({ url: APP_URLS.HoldAndCreditReport }),
      ]);
      if (balRes?.data?.[0]) setBalance(balRes.data[0]);
    } catch (err: any) {
      console.error("HoldAndCredit fetch error:", err?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <View style={styles.root}>
      {/* AppBar with gradient */}
      <LinearGradient
        colors={[primary, secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <AppBarSecond
          title={translate("Hold & Credit")}
          titlestyle={styles.appBarTitle}
        />
      </LinearGradient>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator size="large" color={primary} />
          </View>
        ) : (
          <>
            {/* ── Credit Card ───────────────────────────── */}
            <LinearGradient
              colors={[primary, secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.creditCard}
            >
              {/* Top shine */}
              <View style={styles.cardShine} pointerEvents="none" />

              <Text style={styles.cardEyebrow}>
                {translate("My Current Credit")}
              </Text>
              <Text style={styles.cardBigAmount}>
                {fmt(balance?.totalCurrentcr)}
              </Text>

              {/* Stat pills */}
              <View style={styles.pillRow}>
                <StatPill
                  label={translate("Company Credit")}
                  value={fmt(balance?.admincr)}
                  accent="rgba(255,255,255,0.6)"
                />
                <View style={styles.pillDivider} />
                <StatPill
                  label={translate("Distributor Credit")}
                  value={fmt(balance?.dealer)}
                  accent="rgba(255,255,255,0.6)"
                />
              </View>
            </LinearGradient>

            {/* ── Hold Amount Card ──────────────────────── */}
            <View style={styles.holdCard}>
              <View style={styles.holdTop}>
                <View style={[styles.holdIconWrap, { backgroundColor: `${primary}15` }]}>
                  <HoldcreditSvg />
                </View>
                <View style={styles.holdInfo}>
                  <Text style={styles.holdLabel}>
                    {translate("Total Hold Amount")}
                  </Text>
                  <Text style={[styles.holdAmount, { color: primary }]}>
                    {fmt(balance?.totalCurrentcr)}
                  </Text>
                </View>
              </View>

              {/* Info strip */}
              <View style={[styles.holdStrip, { backgroundColor: `${primary}10` }]}>
                <Text style={[styles.holdStripText, { color: primary }]}>
                  {translate("Hold release note")}
                </Text>
              </View>
            </View>

            {/* ── Summary Row ───────────────────────────── */}
            <View style={styles.summaryRow}>
              <View style={[styles.summaryItem, { borderColor: `${primary}25` }]}>
                <Text style={styles.summaryLabel}>{translate("Company Credit")}</Text>
                <Text style={[styles.summaryAmt, { color: primary }]}>
                  {fmt(balance?.admincr)}
                </Text>
              </View>
              <View style={[styles.summaryItem, { borderColor: `${primary}25` }]}>
                <Text style={styles.summaryLabel}>{translate("Distributor Credit")}</Text>
                <Text style={[styles.summaryAmt, { color: primary }]}>
                  {fmt(balance?.dealer)}
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default HoldAndCredit;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },

  gradientHeader: {
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

  scroll: {
    padding: wScale(16),
    paddingBottom: hScale(40),
    gap: hScale(16),
  },

  loaderWrap: {
    paddingTop: hScale(80),
    alignItems: "center",
  },

  // ── Credit Card ─────────────────────────────────────────────────────────────
  creditCard: {
    borderRadius: wScale(22),
    overflow: "hidden",
    paddingTop: hScale(24),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 14,
      },
      android: { elevation: 6 },
    }),
  },
  cardShine: {
    position: "absolute",
    top: 0,
    left: wScale(20),
    right: wScale(20),
    height: hScale(1.5),
    backgroundColor: "rgba(255,255,255,0.3)",
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  cardEyebrow: {
    color: "rgba(255,255,255,0.8)",
    fontSize: wScale(12),
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    textAlign: "center",
    marginBottom: hScale(6),
  },
  cardBigAmount: {
    color: "#FFF",
    fontSize: wScale(48),
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -1,
    marginBottom: hScale(20),
  },

  // Stat pills inside card
  pillRow: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.15)",
    borderBottomLeftRadius: wScale(22),
    borderBottomRightRadius: wScale(22),
  },
  statPill: {
    flex: 1,
    alignItems: "center",
    paddingVertical: hScale(14),
    gap: hScale(3),
  },
  statAccentBar: {
    width: wScale(20),
    height: hScale(2),
    borderRadius: 2,
    marginBottom: hScale(4),
  },
  statLabel: {
    fontSize: wScale(10),
    color: "rgba(255,255,255,0.75)",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  statValue: {
    fontSize: wScale(16),
    fontWeight: "800",
    color: "#FFF",
  },
  pillDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginVertical: hScale(10),
  },

  // ── Hold Card ────────────────────────────────────────────────────────────────
  holdCard: {
    backgroundColor: "#FFF",
    borderRadius: wScale(20),
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
  holdTop: {
    flexDirection: "row",
    alignItems: "center",
    padding: wScale(18),
    gap: wScale(14),
  },
  holdIconWrap: {
    width: wScale(52),
    height: wScale(52),
    borderRadius: wScale(14),
    alignItems: "center",
    justifyContent: "center",
  },
  holdInfo: {
    flex: 1,
    gap: hScale(4),
  },
  holdLabel: {
    fontSize: wScale(12),
    color: "#8E8E93",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  holdAmount: {
    fontSize: wScale(26),
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  holdStrip: {
    paddingHorizontal: wScale(18),
    paddingVertical: hScale(10),
  },
  holdStripText: {
    fontSize: wScale(11),
    fontWeight: "500",
  },

  // ── Summary Row ──────────────────────────────────────────────────────────────
  summaryRow: {
    flexDirection: "row",
    gap: wScale(12),
  },
  summaryItem: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: wScale(16),
    padding: wScale(16),
    alignItems: "center",
    borderWidth: 1,
    gap: hScale(4),
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
    }),
  },
  summaryIcon: {
    fontSize: wScale(22),
    marginBottom: hScale(2),
  },
  summaryLabel: {
    fontSize: wScale(10),
    color: "#8E8E93",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    textAlign: "center",
  },
  summaryAmt: {
    fontSize: wScale(16),
    fontWeight: "800",
    letterSpacing: -0.3,
  },
});