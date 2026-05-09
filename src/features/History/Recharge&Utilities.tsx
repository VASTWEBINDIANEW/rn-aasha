import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View, FlatList, Text, StyleSheet,
  TouchableOpacity, Image, StatusBar,
} from "react-native";
import useAxiosHook from "../../utils/network/AxiosClient";
import { APP_URLS } from "../../utils/network/urls";
import { useSelector } from "react-redux";
import { hScale, wScale } from "../../utils/styles/dimensions";
import { useNavigation } from "@react-navigation/native";
import { RootState } from "../../reduxUtils/store";
import DateRangePicker from "../../components/DateRange";
import NoDatafound from "../drawer/svgimgcomponents/Nodatafound";
import AppBarSecond from "../drawer/headerAppbar/AppBarSecond";
import SkeletonCard from "../../components/SkeletonCard"; // ✅ Alag component import

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  SUCCESS: { color: '#16A34A', bg: '#DCFCE7', label: 'Success' },
  FAILED:  { color: '#DC2626', bg: '#FEE2E2', label: 'Failed'  },
  PENDING: { color: '#D97706', bg: '#FEF3C7', label: 'Pending' },
  REFUND:  { color: '#7C3AED', bg: '#EDE9FE', label: 'Refund'  },
};

const getStatus = (s: string) => {
  if (s === 'SUCCESS')    return STATUS_CONFIG.SUCCESS;
  if (s === 'FAILED')     return STATUS_CONFIG.FAILED;
  if (s?.startsWith('R')) return STATUS_CONFIG.REFUND;
  return                         STATUS_CONFIG.PENDING;
};

// ─── Types ────────────────────────────────────────────────────────────────────
type TxnItem = {
  Operator_name:   string;
  Recharge_number: string;
  Reqesttime:      string;
  Recharge_amount: string;
  Status:          string;
  hasThumbnail?:   boolean;
  thumbnailPath?:  string;
  Debitamount?:    string;
};

// ─── Summary strip ────────────────────────────────────────────────────────────
const SummaryStrip = ({
  transactions,
  primaryColor,
}: {
  transactions: TxnItem[];
  primaryColor: string;
}) => {
  const stats = useMemo(() => {
    const success = transactions.filter(t => t.Status === 'SUCCESS');
    const total   = success.reduce((s, t) => s + parseFloat(t.Recharge_amount || '0'), 0);
    return {
      count:   transactions.length,
      success: success.length,
      failed:  transactions.filter(t => t.Status === 'FAILED').length,
      total:   total.toFixed(0),
    };
  }, [transactions]);

  const chips = [
    { label: 'Total',       val: stats.count,       color: '#374151'    },
    { label: 'Success',     val: stats.success,     color: '#16A34A'    },
    { label: 'Failed',      val: stats.failed,      color: '#DC2626'    },
    { label: 'Success Amt', val: `₹${stats.total}`, color: primaryColor },
  ];

  return (
    <View style={[strip.wrap, { borderColor: primaryColor + '25' }]}>
      {chips.map((chip, i) => (
        <React.Fragment key={chip.label}>
          <View style={strip.chip}>
            <Text style={[strip.num, { color: chip.color }]}>{chip.val}</Text>
            <Text style={strip.lbl}>{chip.label}</Text>
          </View>
          {i < chips.length - 1 && <View style={strip.divider} />}
        </React.Fragment>
      ))}
    </View>
  );
};

const strip = StyleSheet.create({
  wrap: {
    flexDirection:    'row',
    backgroundColor:  '#fff',
    marginHorizontal:  wScale(12),
    marginBottom:      hScale(10),
    borderRadius:      16,
    paddingVertical:   hScale(12),
    borderWidth:       1,
    elevation: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4,
  },
  chip:    { flex: 1, alignItems: 'center' },
  num:     { fontSize: wScale(16), fontWeight: '800', color: '#111827' },
  lbl:     { fontSize: wScale(10), color: '#9CA3AF', marginTop: 2, fontWeight: '600' },
  divider: { width: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },
});

// ─── Transaction card ─────────────────────────────────────────────────────────
const TxnCard = React.memo(({
  item, onPress, accentColor,
}: {
  item: TxnItem;
  onPress: () => void;
  accentColor: string;
}) => {
  const st       = getStatus(item.Status);
  const initials = item.Operator_name?.slice(0, 2).toUpperCase() || '??';

  return (
    <TouchableOpacity
      style={card.wrap}
      onPress={onPress}
      activeOpacity={0.82}
    >
      <View style={[card.accentBar, { backgroundColor: st.color }]} />

      {item.hasThumbnail ? (
        <Image source={{ uri: item.thumbnailPath }} style={card.avatar} />
      ) : (
        <View style={[card.avatarFallback, { backgroundColor: st.bg }]}>
          <Text style={[card.avatarText, { color: st.color }]}>{initials}</Text>
        </View>
      )}

      <View style={card.mid}>
        <Text style={card.operator} numberOfLines={1}>{item.Operator_name}</Text>
        <Text style={card.number}>{item.Recharge_number}</Text>
        <Text style={[card.time, { color: accentColor }]}>{item.Reqesttime}</Text>
      </View>

      <View style={card.right}>
        <Text style={card.amount}>₹ {item.Recharge_amount}</Text>
        <View style={[card.pill, { backgroundColor: st.bg }]}>
          <Text style={[card.pillText, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

const card = StyleSheet.create({
  wrap: {
    flexDirection:    'row',
    alignItems:       'center',
    backgroundColor:  '#fff',
    borderRadius:      16,
    marginBottom:      hScale(8),
    marginHorizontal:  wScale(12),
    paddingRight:      wScale(14),
    paddingVertical:   hScale(12),
    elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 4,
    overflow: 'hidden',
  },
  accentBar:      { width: 4, alignSelf: 'stretch', borderTopLeftRadius: 16, borderBottomLeftRadius: 16, marginRight: wScale(12) },
  avatar:         { width: wScale(44), height: wScale(44), borderRadius: 12, marginRight: wScale(10) },
  avatarFallback: { width: wScale(44), height: wScale(44), borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: wScale(10) },
  avatarText:     { fontSize: wScale(15), fontWeight: '800' },
  mid:            { flex: 1 },
  operator:       { fontSize: wScale(14), fontWeight: '700', color: '#111827', marginBottom: 2 },
  number:         { fontSize: wScale(13), color: '#4B5563', marginBottom: 2 },
  time:           { fontSize: wScale(11), fontWeight: '600' },
  right:          { alignItems: 'flex-end', gap: 6 },
  amount:         { fontSize: wScale(15), fontWeight: '800', color: '#111827' },
  pill:           { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  pillText:       { fontSize: wScale(10), fontWeight: '800', letterSpacing: 0.3 },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
const RechargeUtilitisR = () => {
  const { colorConfig } = useSelector((s: RootState) => s.userInfo);
  const { userId }      = useSelector((s: any) => s.userInfo);
  const navigation      = useNavigation<any>();
  const { get }         = useAxiosHook();
  const primaryColor    = colorConfig.primaryColor;
  const shimmerHighlight = primaryColor + '30';

  const [transactions,   setTransactions]   = useState<TxnItem[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedDate,   setSelectedDate]   = useState({
    from: new Date().toISOString().split('T')[0],
    to:   new Date().toISOString().split('T')[0],
  });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchTransactions = useCallback(async (
    from: string, to: string, status: string,
  ) => {
    setLoading(true);
    try {
      const f   = new Date(from).toISOString().split('T')[0];
      const t   = new Date(to).toISOString().split('T')[0];
      const url = `${APP_URLS.recenttransaction}pageindex=1&pagesize=500&retailerid=${userId}&fromdate=${f}&todate=${t}&role=Retailer&rechargeNo=ALL&status=${status}&OperatorName=ALL&portno=ALL`;
      const data = await get({ url });
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [userId, get]);

  useEffect(() => {
    fetchTransactions(selectedDate.from, selectedDate.to, selectedStatus);
  }, [selectedDate, selectedStatus]);

  // ── Render item ───────────────────────────────────────────────────────────
  const renderItem = useCallback(({ item }: { item: TxnItem }) => (
    <TxnCard
      item={item}
      accentColor={colorConfig.secondaryColor}
      onPress={() => navigation.navigate('RechargeHistory', { ...item })}
    />
  ), [colorConfig.secondaryColor]);

  // ── List header ───────────────────────────────────────────────────────────
  const ListHeader = useMemo(() => (
    !loading && transactions.length > 0
      ? <SummaryStrip transactions={transactions} primaryColor={primaryColor} />
      : null
  ), [loading, transactions, primaryColor]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AppBarSecond title="Recharge History" />

      <DateRangePicker
        onDateSelected={(from, to) => setSelectedDate({ from, to })}
        SearchPress={(from, to, status) => fetchTransactions(from, to, status)}
        status={selectedStatus}
        setStatus={setSelectedStatus}
        isStShow
        isshowRetailer={false}
        retailerID={(id: string) => console.log(id)}
      />

      <View style={styles.body}>
        {loading ? (
          <View style={styles.skeletonWrap}>
            {/* ✅ Imported SkeletonCard use ho raha hai */}
            {[...Array(6)].map((_, i) => (
              <SkeletonCard key={i} highlightColor={shimmerHighlight} />
            ))}
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyWrap}>
            <NoDatafound />
        
          </View>
        ) : (
          <FlatList
            data={transactions}
            renderItem={renderItem}
            keyExtractor={(_, i) => i.toString()}
            ListHeaderComponent={ListHeader}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            initialNumToRender={15}
            maxToRenderPerBatch={20}
            windowSize={10}
            removeClippedSubviews
          />
        )}
      </View>
    </View>
  );
};

export default RechargeUtilitisR;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#F9FAFB' },
  body:         { flex: 1, paddingTop: hScale(10) },
  list:         { paddingBottom: hScale(30), paddingTop: hScale(4) },
  skeletonWrap: { paddingHorizontal: wScale(12), paddingTop: hScale(4) },
  emptyWrap:    { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: wScale(30) },
  emptyTitle:   { fontSize: wScale(16), fontWeight: '700', color: '#374151', marginTop: hScale(16), textAlign: 'center' },
  emptySub:     { fontSize: wScale(13), color: '#9CA3AF', marginTop: 6, textAlign: 'center', lineHeight: 20 },
});