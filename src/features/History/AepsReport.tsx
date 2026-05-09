import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View, FlatList, Text, StyleSheet, TouchableOpacity,
  Alert, ToastAndroid, LayoutAnimation, UIManager,
  Platform, StatusBar,
} from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import useAxiosHook from "../../utils/network/AxiosClient";
import { APP_URLS } from "../../utils/network/urls";
import { useSelector } from "react-redux";
import AppBarSecond from "../drawer/headerAppbar/AppBarSecond";
import { hScale, wScale } from "../../utils/styles/dimensions";
import DateRangePicker from "../../components/DateRange";
import NoDatafound from "../drawer/svgimgcomponents/Nodatafound";
import { RootState } from "../../reduxUtils/store";
import CheckBalSvg        from "../drawer/svgimgcomponents/CheckBlreporSvg";
import AadharReporSvg     from "../drawer/svgimgcomponents/AadharReporSvg";
import MStateMentReporSvg from "../drawer/svgimgcomponents/MStateMentReporSvg";
import AepsReportSvg      from "../drawer/svgimgcomponents/AepsReportSvg";
import Share              from "react-native-share";
import RNPrint from 'react-native-print';
import ReactNativeBlobUtil from 'react-native-blob-util';
if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// ─── Status config ────────────────────────────────────────────────────────────
const getStatusCfg = (s: string) => {
  const SUCCESS = ['Success', 'Done', 'M_Success'];
  const FAILED  = ['Failed', 'FAILED', 'M_Failed'];
  if (SUCCESS.includes(s)) return { color: '#16A34A', bg: '#DCFCE7', label: s === 'Done' ? 'Success' : s === 'M_Success' ? 'Mini Success' : 'Success' };
  if (FAILED.includes(s))  return { color: '#DC2626', bg: '#FEE2E2', label: s === 'M_Failed' ? 'Mini Failed' : 'Failed' };
  if (s === 'Balance')      return { color: '#2563EB', bg: '#DBEAFE', label: 'Bal Enquiry' };
  return                           { color: '#D97706', bg: '#FEF3C7', label: s || 'Pending' };
};

// ─── Type icon ────────────────────────────────────────────────────────────────
const TypeIcon = ({ item }: { item: any }) => {
  if (item.TYPE === 'Balance')               return <CheckBalSvg />;
  if (item.TransactionType === 'Aadhar Pay') return <AadharReporSvg />;
  if (item.TYPE === 'Mini StateMent')        return <MStateMentReporSvg />;
  return <AepsReportSvg />;
};

// ─── Receipt HTML builder ─────────────────────────────────────────────────────
const buildReceiptHTML = (item: any, isDealer: boolean) => {
  const fv = (d: any, r: any) => isDealer ? d : r;
  const rows = [
    ['Bank Name',         fv(item.RetailerName,         item.BankName)                    || '—'],
    ['Account / Aadhaar', fv(item.AccountHolderAadhaar, item.AccountHolderAadhar)         || '—'],
    ['Status',            getStatusCfg(item.Status).label],
    ['Amount',           `${item.Amount ?? 0}`],
    ['Transaction ID',    fv('—',                       item.MerchantTxnId)               || '—'],
    ['Transaction Mode',  fv(item.TransactionType,      item.TransactionType)              || '—'],
    ['Bank RRN',          fv(item.BankRRN,              item.BankId)                       || '—'],
    ['Mobile No',         item.Mobile                                                      || '—'],
    ['Request Time',      fv(item.Txn_Date,             item.Reqesttime)                  || '—'],
  ].map(([k, v]) =>
    `<tr><td style="padding:10px 14px;color:#6B7280;font-size:13px">${k}</td>` +
    `<td style="padding:10px 14px;font-weight:700;font-size:13px;text-align:right">${v}</td></tr>`
  ).join('');

  return `<html><head><meta name="viewport" content="width=device-width"/>
    <style>body{font-family:sans-serif;margin:0;background:#F9FAFB}h2{text-align:center;padding:20px;color:#1D4ED8;margin:0}table{width:100%;border-collapse:collapse}tr:nth-child(even){background:#F3F4F6}td{border-bottom:1px solid #E5E7EB}.footer{text-align:center;padding:20px;color:#9CA3AF;font-size:12px}</style>
    </head><body><h2>AEPS Receipt — ${APP_URLS.AppName}</h2><table>${rows}</table>
    <div class="footer">Thank you for choosing ${APP_URLS.AppName}</div></body></html>`;
};

// ─── Skeleton card ────────────────────────────────────────────────────────────
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
      {/* Left status accent bar */}
      <SkeletonPlaceholder.Item
        width={4}
        height={hScale(90)}
        borderRadius={4}
        marginRight={wScale(12)}
      />

      {/* Type icon bubble */}
      <SkeletonPlaceholder.Item
        width={wScale(44)}
        height={wScale(44)}
        borderRadius={12}
        marginRight={wScale(10)}
      />

      {/* Middle: name + RRN + mobile/aadhaar row */}
      <SkeletonPlaceholder.Item flex={1}>
        {/* Bank name */}
        <SkeletonPlaceholder.Item width="60%" height={hScale(13)} borderRadius={6} />
        {/* RRN / sub */}
        <SkeletonPlaceholder.Item width="40%" height={hScale(11)} borderRadius={6} marginTop={hScale(6)} />
        {/* Mobile + Aadhaar row */}
        <SkeletonPlaceholder.Item flexDirection="row" marginTop={hScale(10)}>
          <SkeletonPlaceholder.Item width={wScale(70)} height={hScale(11)} borderRadius={6} />
          <SkeletonPlaceholder.Item width={wScale(90)} height={hScale(11)} borderRadius={6} marginLeft={wScale(12)} />
        </SkeletonPlaceholder.Item>
        {/* Status banner */}
        <SkeletonPlaceholder.Item width="75%" height={hScale(22)} borderRadius={8} marginTop={hScale(10)} />
      </SkeletonPlaceholder.Item>

      {/* Right: amount + status pill */}
      <SkeletonPlaceholder.Item alignItems="flex-end" marginLeft={wScale(8)}>
        <SkeletonPlaceholder.Item width={wScale(60)} height={hScale(15)} borderRadius={6} />
        <SkeletonPlaceholder.Item width={wScale(52)} height={hScale(22)} borderRadius={20} marginTop={hScale(8)} />
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder.Item>
  </SkeletonPlaceholder>
);

// ─── Summary strip ────────────────────────────────────────────────────────────
const SummaryStrip = ({ data, isDealer, primary }: any) => {
  const s = useMemo(() => {
    const ok  = ['Success', 'Done', 'M_Success'];
    const bad = ['Failed', 'FAILED', 'M_Failed'];
    const success = data.filter((t: any) => ok.includes(t.Status));
    return {
      total:   data.length,
      success: success.length,
      failed:  data.filter((t: any) => bad.includes(t.Status)).length,
      amount:  success.reduce((acc: number, t: any) => acc + parseFloat(t.Amount ?? 0), 0).toFixed(0),
    };
  }, [data]);

  return (
    <View style={[ss.wrap, { borderColor: primary + '25' }]}>
      {[
        { l: 'Total',   v: s.total,         c: '#374151'  },
        { l: 'Success', v: s.success,        c: '#16A34A'  },
        { l: 'Failed',  v: s.failed,         c: '#DC2626'  },
        { l: '₹ Amt',   v: `₹${s.amount}`,  c: primary    },
      ].map((chip, i, arr) => (
        <React.Fragment key={chip.l}>
          <View style={ss.chip}>
            <Text style={[ss.num, { color: chip.c }]}>{chip.v}</Text>
            <Text style={ss.lbl}>{chip.l}</Text>
          </View>
          {i < arr.length - 1 && <View style={ss.div} />}
        </React.Fragment>
      ))}
    </View>
  );
};
const ss = StyleSheet.create({
  wrap: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: wScale(12), marginBottom: hScale(10), borderRadius: 16, paddingVertical: hScale(12), borderWidth: 1, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  chip: { flex: 1, alignItems: 'center' },
  num:  { fontSize: wScale(15), fontWeight: '800' },
  lbl:  { fontSize: wScale(10), color: '#9CA3AF', marginTop: 2, fontWeight: '600' },
  div:  { width: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },
});

// ─── Transaction Card ─────────────────────────────────────────────────────────
const TxnCard = React.memo(({ item, isDealer, expanded, onToggle, onShare }: any) => {
  const st     = getStatusCfg(item.Status);
  const fv     = (d: any, r: any) => isDealer ? d : r;
  const name   = fv(item.RetailerName,         item.BankName)                    || '—';
  const rrn    = fv(item.BankRRN,              item.BankId)                       || '—';
  const aadhar = fv(item.AccountHolderAadhaar, item.AccountHolderAadhar)         || '—';
  const time   = fv(item.Txn_Date,             item.Reqesttime)                  || '—';

  return (
    <View style={[card.wrap, { borderLeftColor: st.color }]}>

      {/* ── Top: icon + name + amount ── */}
      <TouchableOpacity onPress={onToggle} activeOpacity={0.85}>
        <View style={card.topRow}>
          <View style={[card.iconWrap, { backgroundColor: st.bg }]}>
            <TypeIcon item={item} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={card.name} numberOfLines={1}>{name}</Text>
            <Text style={card.sub}>{rrn}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <Text style={[card.amount, { color: st.color }]}>₹ {item.Amount}</Text>
            <View style={[card.pill, { backgroundColor: st.bg }]}>
              <Text style={[card.pillTxt, { color: st.color }]}>{st.label}</Text>
            </View>
          </View>
        </View>

        {/* ── Mobile + Aadhaar row ── */}
        <View style={card.midRow}>
          {!isDealer && (
            <View>
              <Text style={card.micro}>Mobile</Text>
              <Text style={card.micro2}>{item.Mobile || '—'}</Text>
            </View>
          )}
          <View style={{ alignItems: 'flex-end', flex: 1 }}>
            <Text style={card.micro}>Consumer Aadhaar</Text>
            <Text style={card.micro2}>{aadhar}</Text>
          </View>
          <Text style={[card.chevron, { transform: [{ rotate: expanded ? '180deg' : '0deg' }] }]}>⌄</Text>
        </View>
      </TouchableOpacity>

      {/* ── Status banner ── */}
      <View style={[card.banner, { backgroundColor: st.bg }]}>
        <Text style={[card.bannerTxt, { color: st.color }]}>
          {st.label === 'Bal Enquiry'
            ? '💳 Balance Enquiry'
            : `${st.label === 'Success' ? '✓' : st.label === 'Failed' ? '✕' : '⏳'} Your transaction is ${st.label}`}
        </Text>
      </View>

      {/* ── Footer: time + share ── */}
      <View style={card.footer}>
        <View>
          <Text style={card.micro}>Request Time</Text>
          <Text style={card.micro2}>{time}</Text>
        </View>
        <TouchableOpacity style={card.shareBtn} onPress={onShare} activeOpacity={0.8}>
          <Text style={card.shareTxt}>↑ Share</Text>
        </TouchableOpacity>
      </View>

      {/* ── Expanded details ── */}
      {expanded && (
        <View style={card.expanded}>
          <View style={card.divider} />
          <View style={card.rowPair}>
            <View style={{ flex: 1 }}>
              <Text style={card.micro}>TXN ID</Text>
              <Text style={card.micro2}>{item.MerchantTxnId || '—'}</Text>
            </View>
            <View style={{ flex: 1, alignItems: 'flex-end' }}>
              <Text style={card.micro}>Mode</Text>
              <Text style={card.micro2}>
                {item.TYPE}{item.TransactionType ? ` · ${item.TransactionType}` : ''}
              </Text>
            </View>
          </View>

          {/* Dealer balance bar */}
          {isDealer && (
            <>
              <View style={card.divider} />
              <View style={card.balRow}>
                {[
                  { l: 'Pre Bal',  v: item.REM_Remain_Pre,  c: '#1D4ED8', bg: '#EFF6FF' },
                  { l: 'Net Amt',  v: item.Total,           c: '#D97706', bg: '#FEF3C7' },
                  { l: 'Earn',     v: item.Rem_Income,      c: '#7C3AED', bg: '#F5F3FF' },
                  { l: 'Cr/Dr',    v: item.CR,              c: '#DC2626', bg: '#FEE2E2' },
                  { l: 'Post Bal', v: item.REM_Remain_Post, c: '#16A34A', bg: '#DCFCE7' },
                ].map(b => (
                  <View key={b.l} style={[card.balChip, { backgroundColor: b.bg }]}>
                    <Text style={[card.balAmt, { color: b.c }]}>₹{b.v ?? '0'}</Text>
                    <Text style={card.balLbl}>{b.l}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
});

const card = StyleSheet.create({
  wrap:      { backgroundColor: '#fff', borderRadius: 16, marginBottom: hScale(10), marginHorizontal: wScale(12), paddingHorizontal: wScale(14), paddingVertical: hScale(12), borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 5 },
  topRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: hScale(8) },
  iconWrap:  { width: wScale(44), height: wScale(44), borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: wScale(10) },
  name:      { fontSize: wScale(14), fontWeight: '700', color: '#111827', marginBottom: 2 },
  sub:       { fontSize: wScale(12), color: '#6B7280' },
  amount:    { fontSize: wScale(16), fontWeight: '800' },
  pill:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  pillTxt:   { fontSize: wScale(10), fontWeight: '800', letterSpacing: 0.3 },
  midRow:    { flexDirection: 'row', alignItems: 'flex-end', marginBottom: hScale(8), gap: wScale(8) },
  micro:     { fontSize: wScale(10), color: '#9CA3AF', fontWeight: '600', marginBottom: 2 },
  micro2:    { fontSize: wScale(12), color: '#374151', fontWeight: '700' },
  chevron:   { fontSize: 18, color: '#9CA3AF', marginLeft: wScale(8), lineHeight: 20 },
  banner:    { borderRadius: 8, paddingHorizontal: wScale(10), paddingVertical: hScale(5), marginBottom: hScale(8), alignItems: 'center' },
  bannerTxt: { fontSize: wScale(11), fontWeight: '700' },
  footer:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shareBtn:  { backgroundColor: '#1D4ED8', paddingHorizontal: wScale(14), paddingVertical: hScale(6), borderRadius: 20 },
  shareTxt:  { color: '#fff', fontSize: wScale(12), fontWeight: '700' },
  divider:   { height: 1, backgroundColor: '#F3F4F6', marginVertical: hScale(8) },
  expanded:  {},
  rowPair:   { flexDirection: 'row', justifyContent: 'space-between' },
  balRow:    { flexDirection: 'row', justifyContent: 'space-between', gap: wScale(4), marginTop: hScale(6) },
  balChip:   { flex: 1, borderRadius: 10, paddingVertical: hScale(7), alignItems: 'center' },
  balAmt:    { fontSize: wScale(11), fontWeight: '800' },
  balLbl:    { fontSize: wScale(9), color: '#6B7280', marginTop: 2, fontWeight: '600' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const AEPSAdharPayR = () => {
  const { colorConfig, IsDealer } = useSelector((s: RootState) => s.userInfo);
  const { userId }                = useSelector((s: any) => s.userInfo);
  const { get }                   = useAxiosHook();
  const primary                   = colorConfig.primaryColor;
  const shimmerHighlight          = primary + '30';

  const [transactions,   setTransactions]   = useState<any[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [expandedId,     setExpandedId]     = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchnumber,   setSearchnumber]   = useState('');
  const [type]                              = useState('ALL');
  const [serchMO]                           = useState('ALL');
  const [selectedDate,   setSelectedDate]   = useState({
    from: new Date().toISOString().split('T')[0],
    to:   new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchTransactions(selectedDate.from, selectedDate.to, selectedStatus, 'ALL');
  }, []);

  const fetchTransactions = useCallback(async (from: string, to: string, status: string, id: string) => {
    setLoading(true);
    try {
      const fmt = (d: string) => new Date(d).toISOString().split('T')[0];
      const url = IsDealer
        ? `${APP_URLS.dealer_Rem_AepsReport}txt_frm_date=${fmt(from)}&txt_to_date=${fmt(to)}&allretailer=${id}&ddl_status=${status}`
        : `${APP_URLS.aepsReport}pageindex=1&pagesize=500&userid=${userId}&txt_frm_date=${fmt(from)}&txt_to_date=${fmt(to)}&ddl_status=${status}&amount=&BankId=&aadhar=&Type=${type}&userserch_acc_mob=${serchMO}`;
      const data = await get({ url });
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [userId, IsDealer, type, serchMO, get]);

  // ── Toggle expand (one at a time) ─────────────────────────────────────────
  const toggleExpand = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => prev === id ? null : id);
  }, []);

const handleShare = useCallback(async (item: any) => {
  try {
    const html  = buildReceiptHTML(item, IsDealer);
    const path  = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/AEPS-${item.MerchantTxnId ?? Date.now()}.html`;

    await ReactNativeBlobUtil.fs.writeFile(path, html, 'utf8');

    await Share.open({
      url:          `file://${path}`,
      type:         'text/html',
      title:        'Share Receipt',
      failOnCancel: false,
    });
  } catch (err: any) {
    console.log(err);
  }
}, [IsDealer]);

  // ── Render item ───────────────────────────────────────────────────────────
  const renderItem = useCallback(({ item }: { item: any }) => {
    const id = item.MerchantTxnId ?? item.BankRRN ?? item.BankId ?? String(Math.random());
    return (
      <TxnCard
        item={item}
        isDealer={IsDealer}
        expanded={expandedId === id}
        onToggle={() => toggleExpand(id)}
        onShare={() => handleShare(item)}
      />
    );
  }, [IsDealer, expandedId, toggleExpand, handleShare]);

  const ListHeader = useMemo(() =>
    !loading && transactions.length > 0
      ? <SummaryStrip data={transactions} isDealer={IsDealer} primary={primary} />
      : null,
    [loading, transactions, IsDealer, primary]
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AppBarSecond title="AEPS History" />

      <DateRangePicker
        onDateSelected={(from: string, to: string) => setSelectedDate({ from, to })}
        SearchPress={(from: string, to: string, status: string) => fetchTransactions(from, to, status, 'ALL')}
        status={selectedStatus}
        setStatus={setSelectedStatus}
        searchnumber={searchnumber}
        setSearchnumber={setSearchnumber}
        isshowRetailer={IsDealer}
        isStShow
        retailerID={(id: string) => fetchTransactions(selectedDate.from, selectedDate.to, selectedStatus, id)}
      />

      <View style={styles.body}>
        {loading ? (
          // ── Shimmer skeleton list ──────────────────────────────────────────
          <View style={styles.skeletonWrap}>
            {[...Array(5)].map((_, i) => (
              <SkeletonCard key={i} highlight={shimmerHighlight} />
            ))}
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.empty}>
            <NoDatafound />
            <Text style={styles.emptyTitle}>No transactions found</Text>
            <Text style={styles.emptySub}>Try adjusting the date range or filters.</Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            renderItem={renderItem}
            keyExtractor={(_, i) => String(i)}
            ListHeaderComponent={ListHeader}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            initialNumToRender={12}
            maxToRenderPerBatch={15}
            windowSize={10}
            removeClippedSubviews
          />
        )}
      </View>
    </View>
  );
};

export default AEPSAdharPayR;

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#F9FAFB' },
  body:        { flex: 1, paddingTop: hScale(8) },
  list:        { paddingBottom: hScale(30), paddingTop: hScale(4) },
  skeletonWrap:{ paddingHorizontal: wScale(12), paddingTop: hScale(4) },
  empty:       { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: wScale(30) },
  emptyTitle:  { fontSize: wScale(16), fontWeight: '700', color: '#374151', marginTop: hScale(16), textAlign: 'center' },
  emptySub:    { fontSize: wScale(13), color: '#9CA3AF', marginTop: 6, textAlign: 'center', lineHeight: 20 },
});