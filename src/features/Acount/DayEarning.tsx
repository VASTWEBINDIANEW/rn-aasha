import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';

import { translate } from '../../utils/languageUtils/I18n';
import useAxiosHook from '../../utils/network/AxiosClient';
import { APP_URLS } from '../../utils/network/urls';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import { hScale, wScale } from '../../utils/styles/dimensions';
import { RootState } from '../../reduxUtils/store';
import DateRangePicker from '../../components/DateRange';

import AadharPay  from '../drawer/svgimgcomponents/AdharPaysvg';
import RechargeSvg from '../drawer/svgimgcomponents/RechargeSvg';
import Pansvg     from '../drawer/svgimgcomponents/Pansvg';
import IMPSsvg    from '../drawer/svgimgcomponents/IMPSsvg';
import Upisvg     from '../drawer/svgimgcomponents/Upisvg';

// ─── Constants ────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().split('T')[0];

const DUMMY_DATA = [
  { Type: 'Aeps',    Amount: 0, TotalSuccess: 0, TotalPending: 0, TotalFailed: 0 },
  { Type: 'Recharge',Amount: 0, TotalSuccess: 0, TotalPending: 0, TotalFailed: 0 },
  { Type: 'Pancard', Amount: 0, TotalSuccess: 0, TotalPending: 0, TotalFailed: 0 },
  { Type: 'DMT',     Amount: 0, TotalSuccess: 0, TotalPending: 0, TotalFailed: 0 },
  { Type: 'UPI',     Amount: 0, TotalSuccess: 0, TotalPending: 0, TotalFailed: 0 },
];

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  Aeps:    { icon: <AadharPay color="#0A84FF"  />, color: '#0A84FF', bg: '#EFF6FF' },
  Recharge:{ icon: <RechargeSvg color="#8B5CF6"/>, color: '#8B5CF6', bg: '#F5F3FF' },
  Pancard: { icon: <Pansvg color="#F59E0B"     />, color: '#F59E0B', bg: '#FFFBEB' },
  DMT:     { icon: <IMPSsvg color="#10B981"    />, color: '#10B981', bg: '#ECFDF5' },
  UPI:     { icon: <Upisvg                     />, color: '#EF4444', bg: '#FEF2F2' },
};

const getConfig = (type: string) =>
  TYPE_CONFIG[type] ?? { icon: null, color: '#8E8E93', bg: '#F2F2F7' };

// ─── Stat Box ─────────────────────────────────────────────────────────────────

const StatBox = ({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: number;
  valueColor: string;
}) => (
  <View style={styles.statBox}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, { color: valueColor }]}>₹{value}</Text>
  </View>
);

// ─── Report Card ──────────────────────────────────────────────────────────────

const ReportCard = React.memo(({ item }: { item: any }) => {
  const { icon, color, bg } = getConfig(item.Type);

  return (
    <View style={styles.card}>
      {/* Top accent line */}
      <View style={[styles.cardTopLine, { backgroundColor: color }]} />

      <View style={styles.cardInner}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.iconWrap, { backgroundColor: bg }]}>{icon}</View>

          <View style={styles.cardTitleCol}>
            <Text style={styles.particularLabel}>{translate("Particular")}</Text>
            <Text style={[styles.typeName, { color }]}>{item.Type}</Text>
          </View>

          <View style={styles.earnCol}>
            <Text style={styles.earnLabel}>{translate("Earn")}</Text>
            <Text style={[styles.earnAmount, { color }]}>₹{item.Amount}</Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.cardDivider} />

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatBox
            label={translate("Total Success")}
            value={item.TotalSuccess}
            valueColor="#15803D"
          />
          <View style={styles.statDivider} />
          <StatBox
            label={translate("Total Pending")}
            value={item.TotalPending}
            valueColor="#92400E"
          />
          <View style={styles.statDivider} />
          <StatBox
            label={translate("Total Failed")}
            value={item.TotalFailed}
            valueColor="#B91C1C"
          />
        </View>
      </View>
    </View>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────

const DayEarningReport = () => {
  const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);
  const primary:   string = colorConfig?.primaryColor   || '#0A84FF';
  const secondary: string = colorConfig?.secondaryColor || '#0055FF';

  const { get } = useAxiosHook();

  const [inforeport,     setInforeport]     = useState<any[]>([]);
  const [selectedDate,   setSelectedDate]   = useState({ from: TODAY, to: TODAY });
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const fetchData = useCallback(async (from: string, to: string, status: string) => {
    try {
      const formattedFrom = new Date(from).toISOString().split('T')[0];
      const url = IsDealer
        ? `${APP_URLS.ShowActualIncome}${formattedFrom}`
        : `${APP_URLS.dayErm}${formattedFrom}`;
      const response = await get({ url });
      setInforeport(response?.Status === 'Failed' ? [] : response?.RESULT || []);
    } catch (e) {
      console.error('DayEarningReport fetch error:', e);
      setInforeport([]);
    }
  }, [IsDealer]);

  useEffect(() => {
    fetchData(selectedDate.from, selectedDate.to, selectedStatus);
  }, []);

  const listData = inforeport.length > 0 ? inforeport : DUMMY_DATA;

  return (
    <View style={styles.root}>
      {/* AppBar */}
      <LinearGradient
        colors={[primary, secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <AppBarSecond
          title={translate("Income Report")}
          titlestyle={styles.appBarTitle}
        />

        {/* Date Range Picker */}
        <DateRangePicker
          onDateSelected={(from, to) => setSelectedDate({ from, to })}
          SearchPress={(from, to, status) => fetchData(from, to, status)}
          status={selectedStatus}
          setStatus={setSelectedStatus}
          isStShow={false}
          isshowRetailer={false}
          retailerID={(id) => {}}
          setSearchnumber={() => {}}
          cmsStatu={false}
          onlyFromDate={false}
        />
      </LinearGradient>

      {/* List */}
      <FlatList
        data={listData}
        keyExtractor={item => item.Type}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <ReportCard item={item} />}
      />
    </View>
  );
};

export default DayEarningReport;

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

  listContent: {
    padding: wScale(14),
    paddingBottom: hScale(32),
    gap: hScale(12),
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#FFF',
    borderRadius: wScale(18),
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  cardTopLine: {
    height: hScale(3),
  },
  cardInner: {
    padding: wScale(16),
  },

  // Card header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wScale(12),
  },
  iconWrap: {
    width: wScale(46),
    height: wScale(46),
    borderRadius: wScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitleCol: {
    flex: 1,
    gap: hScale(2),
  },
  particularLabel: {
    fontSize: wScale(10),
    color: '#8E8E93',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  typeName: {
    fontSize: wScale(16),
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  earnCol: {
    alignItems: 'flex-end',
    gap: hScale(2),
  },
  earnLabel: {
    fontSize: wScale(10),
    color: '#8E8E93',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  earnAmount: {
    fontSize: wScale(18),
    fontWeight: '800',
    letterSpacing: -0.3,
  },

  // Divider
  cardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
    marginVertical: hScale(12),
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    gap: hScale(3),
  },
  statLabel: {
    fontSize: wScale(9),
    color: '#8E8E93',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  statValue: {
    fontSize: wScale(14),
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: hScale(30),
    backgroundColor: '#E5E5EA',
  },
});