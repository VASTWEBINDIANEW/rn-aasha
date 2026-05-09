import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';

import { translate } from '../../utils/languageUtils/I18n';
import useAxiosHook from '../../utils/network/AxiosClient';
import { APP_URLS } from '../../utils/network/urls';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import { hScale, wScale } from '../../utils/styles/dimensions';
import { RootState } from '../../reduxUtils/store';
import DateRangePicker from '../../components/DateRange';
import NoDatafound from '../drawer/svgimgcomponents/Nodatafound';
import SkeletonCard from '../../components/SkeletonCard';

// ─── Skeleton List ────────────────────────────────────────────────────────────

const SkeletonList = () => (
  <View style={styles.skeletonWrap}>
    {[...Array(6)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </View>
);

// ─── Status Config ────────────────────────────────────────────────────────────

const getStatusStyle = (status: string) => {
  const s = status?.toUpperCase();
  if (s === 'SUCCESS') return { color: '#15803D', bg: '#DCFCE7', dot: '#22C55E' };
  if (s === 'FAILED')  return { color: '#B91C1C', bg: '#FEE2E2', dot: '#EF4444' };
  return                      { color: '#92400E', bg: '#FEF3C7', dot: '#F59E0B' };
};

// ─── Info Cell ────────────────────────────────────────────────────────────────

const InfoCell = ({
  label, value, highlight = false, highlightColor = '#0A84FF',
}: {
  label: string; value: string;
  highlight?: boolean; highlightColor?: string;
}) => (
  <View style={styles.infoCell}>
    <Text style={styles.cellLabel}>{label}</Text>
    <Text style={[styles.cellValue, highlight && { color: highlightColor, fontSize: wScale(12) }]}>
      {value || '—'}
    </Text>
  </View>
);

// ─── Money Card ───────────────────────────────────────────────────────────────

const MoneyCard = React.memo(({ item, themeColor, secondaryColor }: {
  item: any; themeColor: string; secondaryColor: string;
}) => {
  const { color, bg, dot } = getStatusStyle(item.status);

  return (
    <View style={styles.card}>

      {/* ── Gradient Header ── */}
      <LinearGradient
        colors={[themeColor, secondaryColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.cardHeader}
      >
        {/* Top shine streak */}
        <View style={styles.cardShine} pointerEvents="none" />

        <View style={styles.headerLeft}>
          <Text style={styles.headerApiName} numberOfLines={1}>
            {item.Apinm || '—'}
          </Text>
          <Text style={styles.headerPayer} numberOfLines={1}>
            {item.PayerName || '—'}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <Text style={styles.headerAmountLabel}>{translate("Amount")}</Text>
          <Text style={styles.headerAmount}>₹{item.amt || '0'}</Text>
        </View>
      </LinearGradient>

      {/* ── Card Body ── */}
      <View style={styles.cardBody}>

        {/* Date + Status */}
        <View style={styles.metaRow}>
          <View style={styles.datePill}>
            <Text style={styles.dateText}>{item.txndate || '—'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: bg }]}>
            <View style={[styles.statusDot, { backgroundColor: dot }]} />
            <Text style={[styles.statusText, { color }]}>
              {item.status || '—'}
            </Text>
          </View>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Pre Bal / Charges / Post Bal */}
        <View style={styles.statsRow}>
          <InfoCell
            label={translate("Pre Bal")}
            value={`₹${item.remainpre || '0'}`}
          />
          <View style={styles.statDivider} />
          <InfoCell
            label={translate("Charges")}
            value={`₹${item.charge || '0'}`}
            highlight
            highlightColor={themeColor}
          />
          <View style={styles.statDivider} />
          <InfoCell
            label={translate("Post Bal")}
            value={`₹${item.remainpost || '0'}`}
          />
        </View>

      </View>
    </View>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────

const AddedMoneyROTRReport = () => {
  const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);
  const primary:   string = colorConfig?.primaryColor   || '#0A84FF';
  const secondary: string = colorConfig?.secondaryColor || '#0055FF';

  const { post } = useAxiosHook();
  const [inforeport,     setInforeport]     = useState<any[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [selectedDate,   setSelectedDate]   = useState({
    from: new Date().toISOString().split('T')[0],
    to:   new Date().toISOString().split('T')[0],
  });
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const fetchReport = useCallback(async (from: string, to: string, status: string) => {
    setLoading(true);
    try {
      const formattedFrom = new Date(from).toISOString().split('T')[0];
      const formattedTo   = new Date(to).toISOString().split('T')[0];
      const response = await post({
        url: `${APP_URLS.Addmoneyrep}txt_frm_date=${formattedFrom}&txt_to_date=${formattedTo}`,
      });
      setInforeport(response || []);
    } catch (e) {
      console.error('AddedMoneyROTRReport fetch error:', e);
      setInforeport([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReport(selectedDate.from, selectedDate.to, selectedStatus);
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: any }) => (
      <MoneyCard item={item} themeColor={primary} secondaryColor={secondary} />
    ),
    [primary, secondary],
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
          title={translate("Add Money")}
          titlestyle={styles.appBarTitle}
        />
        <DateRangePicker
          onDateSelected={(from, to) => setSelectedDate({ from, to })}
          SearchPress={(from, to, status) => fetchReport(from, to, status)}
          status={selectedStatus}
          setStatus={setSelectedStatus}
          isStShow={true}
          isshowRetailer={IsDealer}
          retailerID={() => {}}
          setSearchnumber={() => {}}
          cmsStatu={false}
          onlyFromDate={false}
        />
      </LinearGradient>

      {/* Body */}
      <View style={styles.body}>

        {loading && <SkeletonList />}

        {!loading && inforeport.length === 0 && (
          <View style={styles.emptyWrap}>
            <NoDatafound />
            <Text style={styles.emptyText}>{translate("No data found")}</Text>
          </View>
        )}

        {!loading && inforeport.length > 0 && (
          <FlatList
            data={inforeport}
            renderItem={renderItem}
            keyExtractor={(_, i) => i.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={() => fetchReport(selectedDate.from, selectedDate.to, selectedStatus)}
            refreshing={false}
          />
        )}

      </View>
    </View>
  );
};

export default AddedMoneyROTRReport;

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
  body: { flex: 1 },

  skeletonWrap: {
    padding: wScale(14),
    paddingBottom: hScale(32),
  },
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

  // ── Card ─────────────────────────────────────────────────────────────────
  card: {
    borderRadius: wScale(18),
    overflow: 'hidden',
    marginBottom: hScale(12),
    backgroundColor: '#FFF',
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

  // Gradient card header
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wScale(16),
    paddingVertical: hScale(14),
  },
  cardShine: {
    position: 'absolute',
    top: 0,
    left: wScale(16),
    right: wScale(16),
    height: hScale(1.2),
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
  },
  headerLeft: {
    flex: 1,
    gap: hScale(3),
  },
  headerApiName: {
    fontSize: wScale(15),
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.2,
  },
  headerPayer: {
    fontSize: wScale(12),
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: hScale(2),
  },
  headerAmountLabel: {
    fontSize: wScale(9),
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerAmount: {
    fontSize: wScale(20),
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: -0.5,
  },

  // Card body
  cardBody: {
    padding: wScale(14),
    gap: hScale(8),
  },

  // Meta row: date + status
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePill: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: wScale(10),
    paddingVertical: hScale(4),
    borderRadius: wScale(8),
  },
  dateText: {
    fontSize: wScale(11),
    color: '#6C6C70',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wScale(10),
    paddingVertical: hScale(4),
    borderRadius: wScale(20),
    gap: wScale(4),
  },
  statusDot: {
    width: wScale(6),
    height: wScale(6),
    borderRadius: wScale(3),
  },
  statusText: {
    fontSize: wScale(11),
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Divider
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: hScale(2),
  },
  infoCell: {
    flex: 1,
    alignItems: 'center',
    gap: hScale(3),
  },
  cellLabel: {
    fontSize: wScale(9),
    color: '#8E8E93',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  cellValue: {
    fontSize: wScale(12),
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: hScale(30),
    backgroundColor: '#E5E5EA',
  },
});