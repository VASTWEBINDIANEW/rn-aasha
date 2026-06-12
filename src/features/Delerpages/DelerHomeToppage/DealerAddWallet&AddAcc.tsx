import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Platform,
  FlatList,
} from 'react-native';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';

import { translate } from '../../utils/languageUtils/I18n';
import useAxiosHook from '../../utils/network/AxiosClient';
import { APP_URLS } from '../../utils/network/urls';
import { hScale, wScale } from '../../utils/styles/dimensions';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import { RootState } from '../../reduxUtils/store';
import DateRangePicker from '../../components/DateRange';
import NoDatafound from '../drawer/svgimgcomponents/Nodatafound';
import SkeletonCard from '../../components/SkeletonCard';

// ─── Skeleton List (same as DayLedgerReport) ─────────────────────────────────

const SkeletonList = () => (
  <View style={styles.skeletonWrap}>
    {[...Array(6)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </View>
);

// ─── Financial Row ────────────────────────────────────────────────────────────

const FinancialRow = React.memo(({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number;
  highlight?: boolean;
}) => (
  <View style={[styles.finRow, highlight && styles.finRowHighlight]}>
    <Text style={[styles.finLabel, highlight && styles.finLabelBold]}>{label}</Text>
    <Text style={[styles.finValue, highlight && styles.finValueBold]}>₹{value}</Text>
  </View>
));

// ─── Retailer Card ────────────────────────────────────────────────────────────

const RetailerCard = React.memo(({
  item, fromDate, toDate, days, themeColor, secondaryColor,
}: {
  item: any; fromDate: string; toDate: string;
  days: number; themeColor: string; secondaryColor: string;
}) => {
  const diffColor = item.DIFF < 0 ? '#B91C1C' : '#15803D';
  const diffBg    = item.DIFF < 0 ? '#FEE2E2' : '#DCFCE7';

  return (
    <View style={styles.retailerCard}>
      <LinearGradient
        colors={[themeColor, secondaryColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.retailerCardHeader}
      >
        <View style={styles.dateBlock}>
          <Text style={styles.dateBlockLabel}>{translate("From Date")}</Text>
          <Text style={styles.dateBlockValue}>{fromDate}</Text>
        </View>
        <View style={styles.durationBlock}>
          <Text style={styles.durationLabel}>{translate("Duration")}</Text>
          <Text style={styles.durationValue}>{days}</Text>
          <Text style={styles.durationUnit}>{translate("Days")}</Text>
        </View>
        <View style={[styles.dateBlock, { alignItems: 'flex-end' }]}>
          <Text style={styles.dateBlockLabel}>{translate("To Date")}</Text>
          <Text style={styles.dateBlockValue}>{toDate}</Text>
        </View>
      </LinearGradient>

      <View style={styles.retailerCardBody}>
        <FinancialRow label={translate("Opening Balance")} value={item.openbal}      highlight />
        <FinancialRow label={translate("Recharge")}        value={item.RCH} />
        <FinancialRow label={translate("Purchase")}        value={item.PURCHASE} />
        <FinancialRow label={translate("AEPS")}            value={item.AEPS} />
        <FinancialRow label={translate("IMPS")}            value={item.IMPS} />
        <FinancialRow label={translate("PAN")}             value={item.PAN} />
        <FinancialRow label={translate("Old Day Refund")}  value={item.OLDDAYREFUND} />
        <FinancialRow label={translate("Old Day Failed")}  value={item.OLDDAYFAILED} />

        <View style={[styles.diffRow, { backgroundColor: diffBg }]}>
          <Text style={styles.diffLabel}>{translate("Other Difference")}</Text>
          <Text style={[styles.diffValue, { color: diffColor }]}>₹{item.DIFF}</Text>
        </View>

        <FinancialRow label={translate("Close Balance")} value={item.closebal} highlight />
      </View>
    </View>
  );
});

// ─── Dealer DayBook Card ──────────────────────────────────────────────────────
// Response: api/Dealer/Dealer_Daybook_Report → Report.DayBookLive[]

const DealerDayBookCard = React.memo(({
  item,
  fromDate,
  toDate,
  themeColor,
  secondaryColor,
}: {
  item: any;
  fromDate: string;
  toDate: string;
  themeColor: string;
  secondaryColor: string;
}) => {
  const diffColor = item.DIFF < 0 ? '#B91C1C' : '#15803D';
  const diffBg    = item.DIFF < 0 ? '#FEE2E2' : '#DCFCE7';

  return (
    <View style={styles.retailerCard}>
      {/* ── Gradient Header: Dealer Info ── */}
      <LinearGradient
        colors={[themeColor, secondaryColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.dealerGradientHeader}
      >
        <View style={styles.dealerInfoBlock}>
          <Text style={styles.dealerNameText}>{item.DealerName}</Text>
          <Text style={styles.dealerFarmText}>{item.FarmName}</Text>
          <Text style={styles.dealerEmailText}>{item.Email}</Text>
        </View>
        <View style={styles.dealerDateRangeBlock}>
          <View style={styles.dateBlock}>
            <Text style={styles.dateBlockLabel}>{translate("From")}</Text>
            <Text style={styles.dateBlockValue}>{fromDate}</Text>
          </View>
          <View style={styles.dealerDateSep} />
          <View style={[styles.dateBlock, { alignItems: 'flex-end' }]}>
            <Text style={styles.dateBlockLabel}>{translate("To")}</Text>
            <Text style={styles.dateBlockValue}>{toDate}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* ── Balance Summary Row ── */}
      <View style={styles.dealerBalRow}>
        <View style={styles.dealerBalCol}>
          <Text style={styles.dealerBalLabel}>{translate("Opening Balance")}</Text>
          <Text style={[styles.dealerBalValue, { color: themeColor }]}>₹{item.openbal}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.dealerBalCol}>
          <Text style={styles.dealerBalLabel}>{translate("Close Balance")}</Text>
          <Text style={[styles.dealerBalValue, { color: '#15803D' }]}>₹{item.closebal}</Text>
        </View>
      </View>

      {/* ── Transaction Rows ── */}
      <View style={styles.retailerCardBody}>
        <FinancialRow label={translate("Recharge")}       value={item.RCH} />
        <FinancialRow label={translate("Purchase")}       value={item.PURCHASE} />
        <FinancialRow label={translate("AEPS")}           value={item.AEPS} />
        <FinancialRow label={translate("IMPS")}           value={item.IMPS} />
        <FinancialRow label={translate("Fund Transfer")}  value={item.FUNDTRANSFER} />
        <FinancialRow label={translate("PAN")}            value={item.PAN} />
        <FinancialRow label={translate("Old Day Refund")} value={item.OLDDAYREFUND} />
        <FinancialRow label={translate("Old Day Failed")} value={item.OLDDAYFAILED} />

        <View style={[styles.diffRow, { backgroundColor: diffBg }]}>
          <Text style={styles.diffLabel}>{translate("Other Difference")}</Text>
          <Text style={[styles.diffValue, { color: diffColor }]}>₹{item.DIFF}</Text>
        </View>
      </View>
    </View>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────

const DayBookReport = () => {
  const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);
  const primary:   string = colorConfig?.primaryColor   || '#0A84FF';
  const secondary: string = colorConfig?.secondaryColor || '#0055FF';

  const { get } = useAxiosHook();
  const [loading,        setLoading]        = useState(false);
  const [inforeport,     setInforeport]     = useState<any[]>([]);
  const [days,           setDays]           = useState(0);
  const [selectedDate,   setSelectedDate]   = useState({
    from: new Date().toISOString().split('T')[0],
    to:   new Date().toISOString().split('T')[0],
  });
  const [selectedStatus, setSelectedStatus] = useState('ALL');

const fetchData = useCallback(async (from: string, to: string) => {
  setLoading(true);
  try {
    const formattedFrom = new Date(from).toISOString().split('T')[0];
    const formattedTo   = new Date(to).toISOString().split('T')[0];

    if (IsDealer) {
      // ✅ Dealer API → api/Dealer/Dealer_Daybook_Report
      const url =
        `${APP_URLS.dealerDaybook}txt_frm_date=${formattedFrom}&to=${formattedTo}` +
        `&fromdate=${formattedFrom}&todate=${formattedTo}&status=ALL&OperatorName=ALL&portno=ALL`;

      const [response] = await Promise.all([
        get({ url }),
        new Promise(resolve => setTimeout(resolve, 2500)),
      ]);

      // Response: { Report: { DayBookLive: [...], DayBook_Old: null } }
      const liveData = response?.Report?.DayBookLive || [];
      setInforeport(liveData);
    } else {
      // ✅ Retailer API → existing daybook endpoint
      const url = `${APP_URLS.daybook}from=${formattedFrom}&to=${formattedTo}`;

      const [response] = await Promise.all([
        get({ url }),
        new Promise(resolve => setTimeout(resolve, 2500)),
      ]);

      setInforeport(response?.data || []);
      setDays(Number(response?.durations || 0));
    }
  } catch (e) {
    console.error('DayBookReport fetch error:', e);
    setInforeport([]);
  } finally {
    setLoading(false);
  }
}, [get, IsDealer]); 
  useEffect(() => {
    fetchData(selectedDate.from, selectedDate.to);
  }, []);

  const fromDate = new Date(selectedDate.from).toISOString().split('T')[0];
  const toDate   = new Date(selectedDate.to).toISOString().split('T')[0];

  const renderRetailer = useCallback(
    ({ item }: { item: any }) => (
      <RetailerCard
        item={item} fromDate={fromDate} toDate={toDate}
        days={days} themeColor={primary} secondaryColor={secondary}
      />
    ),
    [fromDate, toDate, days, primary, secondary],
  );

  const renderDealer = useCallback(
    ({ item }: { item: any }) => (
      <DealerDayBookCard
        item={item}
        fromDate={fromDate}
        toDate={toDate}
        themeColor={primary}
        secondaryColor={secondary}
      />
    ),
    [fromDate, toDate, primary, secondary],
  );

  return (
    <View style={styles.root}>

      {/* Gradient Header */}
      <LinearGradient
        colors={[primary, secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <AppBarSecond
          title={translate("Day Book")}
          titlestyle={styles.appBarTitle}
        />
        <DateRangePicker
          onDateSelected={(from, to) => setSelectedDate({ from, to })}
          SearchPress={(from, to) => fetchData(from, to)}
          status={selectedStatus}
          setStatus={setSelectedStatus}
          isStShow={false}
          isshowRetailer={false}
          retailerID={() => {}}
          setSearchnumber={() => {}}
          cmsStatu={false}
          onlyFromDate={false}
        />
      </LinearGradient>

      {/* Body — same 3-state pattern as DayLedgerReport */}
      <View style={styles.body}>

        {/* ── Loading: skeleton top-aligned ── */}
        {loading && <SkeletonList />}

        {/* ── Empty state ── */}
        {!loading && inforeport.length === 0 && (
          <View style={styles.emptyWrap}>
            <NoDatafound />
          </View>
        )}

        {/* ── Data ── */}
        {!loading && inforeport.length > 0 && (
          IsDealer ? (
            <FlatList
              data={inforeport}
              renderItem={renderDealer}
              keyExtractor={item => item.rch_from ?? item.DealerName}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <FlatList
              data={inforeport}
              renderItem={renderRetailer}
              keyExtractor={(_, i) => i.toString()}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
          )
        )}

      </View>
    </View>
  );
};

export default DayBookReport;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  gradientHeader: {
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  appBarTitle: {
    color: '#FFF',
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },

  // ── Skeleton: top-aligned, same padding as list ───────────────────────────
  skeletonWrap: {
    padding: wScale(14),
    paddingBottom: hScale(32),
  },

  // ── Empty: vertically centered ────────────────────────────────────────────
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: hScale(10),
  },
  emptyText: {
    fontSize: wScale(14),
    color: '#8E8E93',
    fontWeight: '500',
  },

  listContent: {
    padding: wScale(14),
    paddingBottom: hScale(32),
  },

  // ── Retailer Card ─────────────────────────────────────────────────────────
  retailerCard: {
    backgroundColor: '#FFF',
    borderRadius: wScale(20),
    overflow: 'hidden',
    marginBottom: hScale(16),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
    }),
  },
  retailerCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wScale(18),
    paddingVertical: hScale(14),
  },
  dateBlock: { gap: hScale(3) },
  dateBlockLabel: {
    fontSize: wScale(10),
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dateBlockValue: {
    fontSize: wScale(13),
    color: '#FFF',
    fontWeight: '700',
  },
  durationBlock: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: wScale(16),
    paddingVertical: hScale(8),
    borderRadius: wScale(12),
    gap: hScale(1),
  },
  durationLabel: {
    fontSize: wScale(9),
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  durationValue: {
    fontSize: wScale(22),
    color: '#FFF',
    fontWeight: '800',
    lineHeight: hScale(26),
  },
  durationUnit: {
    fontSize: wScale(9),
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  retailerCardBody: {
    padding: wScale(16),
    gap: hScale(1),
  },
  finRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hScale(8),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F2F2F7',
  },
  finRowHighlight: {
    backgroundColor: '#F8F8FF',
    paddingHorizontal: wScale(8),
    borderRadius: wScale(8),
    borderBottomWidth: 0,
    marginVertical: hScale(2),
  },
  finLabel: {
    fontSize: wScale(13),
    color: '#3C3C43',
    fontWeight: '500',
  },
  finLabelBold: { fontWeight: '700', color: '#1C1C1E' },
  finValue: {
    fontSize: wScale(13),
    color: '#1C1C1E',
    fontWeight: '600',
  },
  finValueBold: { fontWeight: '800', fontSize: wScale(14) },
  diffRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hScale(10),
    paddingHorizontal: wScale(10),
    borderRadius: wScale(10),
    marginVertical: hScale(6),
  },
  diffLabel: { fontSize: wScale(13), color: '#3C3C43', fontWeight: '600' },
  diffValue: { fontSize: wScale(14), fontWeight: '800' },

  // ── Dealer DayBook Card ───────────────────────────────────────────────────
  dealerGradientHeader: {
    paddingHorizontal: wScale(18),
    paddingVertical: hScale(16),
    gap: hScale(10),
  },
  dealerInfoBlock: {
    gap: hScale(2),
  },
  dealerNameText: {
    fontSize: wScale(15),
    color: '#FFF',
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  dealerFarmText: {
    fontSize: wScale(12),
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '600',
  },
  dealerEmailText: {
    fontSize: wScale(10),
    color: 'rgba(255,255,255,0.65)',
    fontWeight: '500',
  },
  dealerDateRangeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: wScale(10),
    paddingHorizontal: wScale(14),
    paddingVertical: hScale(8),
  },
  dealerDateSep: {
    width: StyleSheet.hairlineWidth,
    height: hScale(24),
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dealerBalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wScale(16),
    paddingVertical: hScale(14),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F2F2F7',
  },
  dealerBalCol: {
    flex: 1,
    alignItems: 'center',
    gap: hScale(3),
  },
  dealerBalLabel: {
    fontSize: wScale(10),
    color: '#8E8E93',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  dealerBalValue: {
    fontSize: wScale(18),
    fontWeight: '800',
    letterSpacing: -0.3,
  },
});