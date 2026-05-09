import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSelector } from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';

import { translate } from '../../utils/languageUtils/I18n';
import useAxiosHook from '../../utils/network/AxiosClient';
import { APP_URLS } from '../../utils/network/urls';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import { RootState } from '../../reduxUtils/store';
import { hScale, wScale } from '../../utils/styles/dimensions';
import DateRangePicker from '../../components/DateRange';
import NoDatafound from '../drawer/svgimgcomponents/Nodatafound';
import SkeletonCard from '../../components/SkeletonCard';

// ─── Ledger Card ──────────────────────────────────────────────────────────────

const LedgerCard = React.memo(({ item }: { item: any }) => {
  const isCredit    = item.debit === 0;
  const accentColor = isCredit ? '#22C55E' : '#EF4444';
  const amountBg    = isCredit ? '#DCFCE7' : '#FEE2E2';
  const amountColor = isCredit ? '#15803D' : '#B91C1C';

  return (
    <View style={styles.card}>
      <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
      <View style={styles.cardBody}>

        <View style={styles.topRow}>
          <View style={styles.datePill}>
            <Text style={styles.dateText}>{item.Date}</Text>
          </View>
          <View style={[styles.amountBadge, { backgroundColor: amountBg }]}>
            <Text style={[styles.amountText, { color: amountColor }]}>
              {isCredit ? '+' : '-'} ₹{item.Amount}
            </Text>
          </View>
        </View>

        <Text style={styles.descText} numberOfLines={2}>{item.Particulars}</Text>

        <View style={styles.divider} />

        <View style={styles.footerRow}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerLabel}>
              {isCredit ? translate("Credit") : translate("Debit")}
            </Text>
            <Text style={[styles.footerValue, { color: amountColor }]}>
              ₹{isCredit ? item.credit : item.debit}
            </Text>
          </View>
          <View style={styles.footerRight}>
            <Text style={styles.footerLabel}>{translate("Post Balance")}</Text>
            <Text style={styles.postBalText}>₹{item.Balance}</Text>
          </View>
        </View>

      </View>
    </View>
  );
});

// ─── Skeleton List ────────────────────────────────────────────────────────────
// Top-aligned — centerWrap ke bahar, padding same as list

const SkeletonList = () => (
  <View style={styles.skeletonWrap}>
    {[...Array(6)].map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const DayLedgerReport = () => {
  const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);
  const primary:   string = colorConfig?.primaryColor   || '#0A84FF';
  const secondary: string = colorConfig?.secondaryColor || '#0055FF';

  const { get } = useAxiosHook();
  const [inforeport,     setInforeport]     = useState<any[]>([]);
  const [loading,        setLoading]        = useState(false);
  const [selectedDate,   setSelectedDate]   = useState({
    from: new Date().toISOString().split('T')[0],
    to:   new Date().toISOString().split('T')[0],
  });
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const fetchLedger = useCallback(async (from: string, to: string, status: string) => {
    setLoading(true);
    try {
      const formattedFrom = new Date(from).toISOString().split('T')[0];
      const formattedTo   = new Date(to).toISOString().split('T')[0];
      const url = IsDealer
        ? `${APP_URLS.DealerLedger}${formattedFrom}`
        : `${APP_URLS.dayLedger}from=${formattedFrom}&to=${formattedTo}`;

      const response = await get({ url });
      if (!response) throw new Error('No response');
      setInforeport(IsDealer ? response.Report : response);
    } catch (e) {
      console.error('DayLedgerReport fetch error:', e);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [IsDealer]);

  useEffect(() => {
    fetchLedger(selectedDate.from, selectedDate.to, selectedStatus);
  }, [selectedDate, selectedStatus]);

  const renderItem = useCallback(
    ({ item }: { item: any }) => <LedgerCard item={item} />,
    [],
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
          title={translate("Ledger Report")}
          titlestyle={styles.appBarTitle}
        />
        <DateRangePicker
          onDateSelected={(from, to) => setSelectedDate({ from, to })}
          SearchPress={(from, to, status) => fetchLedger(from, to, status)}
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

      {/* Body — teen alag states, ek saath nahi dikhenge */}
      <View style={styles.body}>

        {loading && <SkeletonList />}

        {!loading && inforeport.length === 0 && (
          <View style={styles.emptyWrap}>
            <NoDatafound />
            <Text style={styles.emptyText}>{translate("No data found")}</Text>
          </View>
        )}

        {!loading && inforeport.length > 0 && (
          <FlashList
            data={inforeport}
            renderItem={renderItem}
            keyExtractor={(_, i) => i.toString()}
            estimatedItemSize={120}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

      </View>
    </View>
  );
};

export default DayLedgerReport;

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

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    backgroundColor: '#FFF',
    borderRadius: wScale(16),
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: hScale(10),
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
  cardAccent: {
    width: wScale(4),
  },
  cardBody: {
    flex: 1,
    padding: wScale(14),
    gap: hScale(6),
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePill: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: wScale(8),
    paddingVertical: hScale(3),
    borderRadius: wScale(6),
  },
  dateText: {
    fontSize: wScale(11),
    color: '#6C6C70',
    fontWeight: '500',
  },
  amountBadge: {
    paddingHorizontal: wScale(10),
    paddingVertical: hScale(4),
    borderRadius: wScale(20),
  },
  amountText: {
    fontSize: wScale(13),
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  descText: {
    fontSize: wScale(13),
    fontWeight: '600',
    color: '#1C1C1E',
    lineHeight: hScale(18),
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
    marginVertical: hScale(2),
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  footerLeft: {
    gap: hScale(2),
  },
  footerRight: {
    alignItems: 'flex-end',
    gap: hScale(2),
  },
  footerLabel: {
    fontSize: wScale(10),
    color: '#8E8E93',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  footerValue: {
    fontSize: wScale(13),
    fontWeight: '700',
  },
  postBalText: {
    fontSize: wScale(14),
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.2,
  },
});