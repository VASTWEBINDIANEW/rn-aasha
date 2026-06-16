import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { FlashList } from '@shopify/flash-list';
import LinearGradient from 'react-native-linear-gradient';

import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import DateRangePicker from '../../components/DateRange';
import { hScale, wScale } from '../../utils/styles/dimensions';
import { APP_URLS } from '../../utils/network/urls';
import useAxiosHook from '../../utils/network/AxiosClient';
import { RootState } from '../../reduxUtils/store';
import NoDatafound from '../drawer/svgimgcomponents/Nodatafound';
import SkeletonCard from '../../components/SkeletonCard';
import { translate } from '../../utils/languageUtils/I18n';
import {  getAssetSource } from '../../utils/network/NetWorkImages';
import FastImage from 'react-native-fast-image';

// ─── Skeleton List ────────────────────────────────────────────────────────────

const SkeletonList = () => (
  <View style={styles.skeletonWrap}>
    {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
  </View>
);

// ─── Stat Cell ────────────────────────────────────────────────────────────────

const StatCell = ({
  label, value, align = 'center', color,
}: {
  label: string; value: string;
  align?: 'flex-start' | 'center' | 'flex-end';
  color?: string;
}) => (
  <View style={[styles.statCell, { alignItems: align }]}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, color ? { color } : null]}>{value}</Text>
  </View>
);

// ─── Retailer Card (R to R) ───────────────────────────────────────────────────

const RetailerCard = React.memo(({ item, themeColor, secondaryColor }: {
  item: any; themeColor: string; secondaryColor: string;
}) => (
  <View style={styles.card}>
    {/* Gradient header */}
    <LinearGradient
      colors={[themeColor, secondaryColor]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={styles.cardHeader}
    >
      <View style={styles.cardShine} pointerEvents="none" />
      <View style={styles.headerLeft}>
        <Text style={styles.headerName} numberOfLines={1}>
          {item.transfertoretailername || '—'}
        </Text>
        <Text style={styles.headerSub}>{translate("Name")}</Text>
      </View>
      <View style={styles.headerRight}>
        <Text style={styles.headerAmountLabel}>{translate("Amount")}</Text>
        <Text style={styles.headerAmount}>₹{item.value?.toFixed(2)}</Text>
      </View>
    </LinearGradient>

    {/* Body */}
    <View style={styles.cardBody}>
      {/* Date pill */}
      <View style={styles.metaRow}>
        <View style={styles.datePill}>
          <Text style={styles.dateText}>{item.tran_date || '—'}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      {/* Pre / Post balance */}
      <View style={styles.statsRow}>
        <StatCell
          label={translate("Pre Balance")}
          value={`₹${item.rem_from_old_bal?.toFixed(2)}`}
          align="flex-start"
        />
        <View style={styles.statDivider} />
        <StatCell
          label={translate("Post Balance")}
          value={`₹${item.rem_from_new?.toFixed(2)}`}
          color={themeColor}
        />
        <View style={styles.statDivider} />
        <StatCell
          label={translate("Amount")}
          value={`₹${item.value?.toFixed(2)}`}
          align="flex-end"
          color="#15803D"
        />
      </View>
    </View>
  </View>
));

// ─── Dealer Card (Fund Transfer) ─────────────────────────────────────────────

const DealerCard = React.memo(({ item, themeColor, secondaryColor }: {
  item: any; themeColor: string; secondaryColor: string;
}) => (
  <View style={styles.card}>
    {/* Gradient header with avatar */}
    <LinearGradient
      colors={[themeColor, secondaryColor]}
      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={styles.cardHeader}
    >
      <View style={styles.cardShine} pointerEvents="none" />

      <FastImage
        resizeMode="cover"
        source={
          item.ProfileImages
            ? { uri: `http://${APP_URLS.baseWebUrl}${item.ProfileImages}` }
            : getAssetSource('bussiness-man.png')
        }
        style={styles.avatar}
      />

      <View style={styles.headerLeft}>
        <Text style={styles.headerName} numberOfLines={1}>
          {item.FirmName || '....'}
        </Text>
        <View style={styles.typeBadge}>
          <Text style={styles.typeBadgeText}>{item.Type}</Text>
        </View>
      </View>

      <View style={styles.headerRight}>
        <Text style={styles.headerAmountLabel}>Amount</Text>
        <Text style={styles.headerAmount}>₹{item.Balance}</Text>
      </View>
    </LinearGradient>

    {/* Body */}
    <View style={styles.cardBody}>
      {/* Date + Net T/F row */}
      <View style={styles.metaRow}>
        <View style={styles.datePill}>
          <Text style={styles.dateText}>{item.Date ?? 'N/A'}</Text>
        </View>
        <View style={[styles.netBadge, { backgroundColor: `${themeColor}18` }]}>
          <Text style={styles.netLabel}>Net T/F</Text>
          <Text style={[styles.netValue, { color: themeColor }]}>₹{item.TotalBal}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Pre Bal / Post Bal / Old Cr / Charge */}
      <View style={styles.statsRow}>
        <StatCell
          label="Pre Bal"
          value={`₹${item.RetailerOldBal}`}
          align="flex-start"
        />
        <View style={styles.statDivider} />
        <StatCell
          label="Post Bal"
          value={`₹${item.RetailerCurrentBal}`}
          color={themeColor}
        />
        <View style={styles.statDivider} />
        <StatCell
          label="Old Cr"
          value={item.RetailerOldCr != null ? `₹${item.RetailerOldCr}` : 'N/A'}
        />
        <View style={styles.statDivider} />
        <StatCell
          label="Charge"
          value={`₹${item.Commission}`}
          align="flex-end"
          color="#92400E"
        />
      </View>
    </View>
  </View>
));

// ─── Main Component ───────────────────────────────────────────────────────────

const RToRReport = () => {
  const { colorConfig, IsDealer, userId } = useSelector((state: RootState) => state.userInfo);
  const primary:   string = colorConfig?.primaryColor   || '#0A84FF';
  const secondary: string = colorConfig?.secondaryColor || '#0055FF';

  const { post, get } = useAxiosHook();
  const [loading,            setLoading]            = useState(false);
  const [transactions,       setTransactions]       = useState<any[]>([]);
  const [selectedRetailerId, setSelectedRetailerId] = useState('');
  const [selectedDate,       setSelectedDate]       = useState({
    from: new Date().toISOString().split('T')[0],
    to:   new Date().toISOString().split('T')[0],
  });
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const fetchData = useCallback(async (from: string, to: string, status: string, retailerId = selectedRetailerId) => {
    setLoading(true);
    try {
      const formattedFrom = new Date(from).toISOString().split('T')[0];
      const formattedTo   = new Date(to).toISOString().split('T')[0];

      if (IsDealer) {
        const dealerUrl = `${APP_URLS.dealer_fund_trans_history}dlmid=${userId}&txt_frm_date=${formattedFrom}&txt_to_date=${formattedTo}&remid=${retailerId}`;
        const response = await get({ url: dealerUrl });
        setTransactions(response || []);
      } else {
        const url = `${APP_URLS.RtorReport}txt_frm_date=${formattedFrom}&txt_to_date=${formattedTo}&RetailerId1=${userId}`;
        const response = await post({ url });
        setTransactions(response?.Report || []);
      }
    } catch (e) {
      console.error('RToRReport fetch error:', e);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [IsDealer, userId, selectedRetailerId]);

  useEffect(() => {
    fetchData(selectedDate.from, selectedDate.to, '');
  }, []);

  const renderRetailer = useCallback(
    ({ item }: { item: any }) => (
      <RetailerCard item={item} themeColor={primary} secondaryColor={secondary} />
    ),
    [primary, secondary],
  );

  const renderDealer = useCallback(
    ({ item }: { item: any }) => (
      <DealerCard item={item} themeColor={primary} secondaryColor={secondary} />
    ),
    [primary, secondary],
  );

  return (
    <View style={styles.root}>

      {/* Gradient Header */}
      <LinearGradient
        colors={[primary, secondary]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={styles.gradientHeader}
      >
        <AppBarSecond
          title={translate(IsDealer ? "Fund Transfer Report" : "R To R History")}
          titlestyle={styles.appBarTitle}
        />
        <DateRangePicker
          onDateSelected={(from, to) => setSelectedDate({ from, to })}
          SearchPress={(from, to, status) => fetchData(from, to, status)}
          status={selectedStatus}
          setStatus={setSelectedStatus}
          isStShow={false}
          isshowRetailer={IsDealer}
          retailerID={(id: string) => {
            setSelectedRetailerId(id);
            fetchData(selectedDate.from, selectedDate.to, 'ALL', id);
          }}
          setSearchnumber={() => {}}
          cmsStatu={false}
        />
      </LinearGradient>

      {/* Body */}
      <View style={styles.body}>

        {loading && <SkeletonList />}

        {!loading && (!Array.isArray(transactions) || transactions.length === 0) && (
          <View style={styles.emptyWrap}>
            <NoDatafound />
          </View>
        )}

        {!loading && Array.isArray(transactions) && transactions.length > 0 && (
          <FlashList
            data={transactions}
            renderItem={IsDealer ? renderDealer : renderRetailer}
            keyExtractor={(_, i) => i.toString()}
            estimatedItemSize={160}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}

      </View>
    </View>
  );
};

export default RToRReport;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F2F7' },

  gradientHeader: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  appBarTitle: { color: '#FFF', fontWeight: '700' },
  body: { flex: 1 },

  skeletonWrap: {
    padding: wScale(14),
    paddingBottom: hScale(32),
  },
  emptyWrap: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: hScale(10),
  },
  emptyText: { fontSize: wScale(14), color: '#8E8E93', fontWeight: '500' },
  listContent: { padding: wScale(14), paddingBottom: hScale(32) },

  // ── Card ─────────────────────────────────────────────────────────────────
  card: {
    borderRadius: wScale(18),
    overflow: 'hidden',
    marginBottom: hScale(12),
    backgroundColor: '#FFF',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 4 },
    }),
  },

  // Gradient header
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wScale(16),
    paddingVertical: hScale(14),
    gap: wScale(10),
  },
  cardShine: {
    position: 'absolute',
    top: 0, left: wScale(16), right: wScale(16),
    height: hScale(1.2),
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderBottomLeftRadius: 4, borderBottomRightRadius: 4,
  },
  avatar: {
    width: wScale(40), height: wScale(40),
    borderRadius: wScale(10),
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)',
  },
  headerLeft: { flex: 1, gap: hScale(4) },
  headerName: { fontSize: wScale(15), fontWeight: '800', color: '#FFF', letterSpacing: 0.2 },
  headerSub:  { fontSize: wScale(10), color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  typeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: wScale(8), paddingVertical: hScale(2),
    borderRadius: wScale(6), alignSelf: 'flex-start',
  },
  typeBadgeText: { fontSize: wScale(10), color: '#FFF', fontWeight: '700' },
  headerRight: { alignItems: 'flex-end', gap: hScale(2) },
  headerAmountLabel: {
    fontSize: wScale(9), color: 'rgba(255,255,255,0.75)',
    fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5,
  },
  headerAmount: { fontSize: wScale(20), fontWeight: '800', color: '#FFF', letterSpacing: -0.5 },

  // Card body
  cardBody: { padding: wScale(14), gap: hScale(8) },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  datePill: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: wScale(10), paddingVertical: hScale(4),
    borderRadius: wScale(8),
  },
  dateText: { fontSize: wScale(11), color: '#6C6C70', fontWeight: '500' },
  netBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: wScale(10), paddingVertical: hScale(4),
    borderRadius: wScale(8), gap: wScale(4),
  },
  netLabel: { fontSize: wScale(10), color: '#6C6C70', fontWeight: '600' },
  netValue: { fontSize: wScale(12), fontWeight: '800' },

  divider: { height: StyleSheet.hairlineWidth, backgroundColor: '#E5E5EA' },

  // Stats row
  statsRow: { flexDirection: 'row', alignItems: 'center', paddingTop: hScale(2) },
  statCell: { flex: 1, gap: hScale(3) },
  statLabel: {
    fontSize: wScale(9), color: '#8E8E93', fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 0.3, textAlign: 'center',
  },
  statValue: { fontSize: wScale(11), fontWeight: '700', color: '#1C1C1E', textAlign: 'center' },
  statDivider: { width: StyleSheet.hairlineWidth, height: hScale(28), backgroundColor: '#E5E5EA' },
});