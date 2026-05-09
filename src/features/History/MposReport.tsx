import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View, FlatList, Text, StyleSheet, TouchableOpacity,
  Alert, LayoutAnimation, UIManager, Platform, StatusBar,
} from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import useAxiosHook from "../../utils/network/AxiosClient";
import { APP_URLS } from "../../utils/network/urls";
import { useSelector } from "react-redux";
import { hScale, wScale } from "../../utils/styles/dimensions";
import AppBarSecond from "../drawer/headerAppbar/AppBarSecond";
import DateRangePicker from "../../components/DateRange";
import { RootState } from "../../reduxUtils/store";
import NoDatafound from "../drawer/svgimgcomponents/Nodatafound";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import Share from "react-native-share";
import { translate } from "../../utils/languageUtils/I18n";

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// ─── Status config ────────────────────────────────────────────────────────────
const getStatusCfg = (s: string) => {
  const s_up = (s || '').toUpperCase();
  if (s_up === 'SUCCESS' || s_up === 'M_SUCCESS')
    return { color: '#16A34A', bg: '#DCFCE7', label: translate('Success'),  icon: '✓' };
  if (s_up === 'FAILED'  || s_up === 'M_FAILED')
    return { color: '#DC2626', bg: '#FEE2E2', label: translate('Failed'),   icon: '✕' };
  if (s_up === 'PENDING' || s_up === 'M_PENDING')
    return { color: '#D97706', bg: '#FEF3C7', label: translate('Pending'),  icon: '⏳' };
  return       { color: '#6B7280', bg: '#F3F4F6', label: translate(s) || '—', icon: '•' };
};

// ─── Receipt HTML (retailer) ──────────────────────────────────────────────────
const buildRetailerHTML = (item: any) => {
  const rows = [
    [translate('Transaction ID'), item.TxnId      || '—'],
    [translate('RRN'),            item.rrn         || '—'],
    [translate('Status'),         item.status      || '—'],
    [translate('Merchant ID'),    item.merchant_id || '—'],
    [translate('Amount'),        `₹ ${item.amount ?? 0}`],
  ].map(([k, v]) =>
    `<tr><td style="padding:10px 14px;color:#6B7280;font-size:13px">${k}</td>` +
    `<td style="padding:10px 14px;font-weight:700;font-size:13px;text-align:right">${v}</td></tr>`
  ).join('');
  return `<html><head><meta name="viewport" content="width=device-width"/>
    <style>body{font-family:sans-serif;margin:0;background:#F9FAFB}h2{text-align:center;padding:20px;color:#1D4ED8;margin:0}table{width:100%;border-collapse:collapse}tr:nth-child(even){background:#F3F4F6}td{border-bottom:1px solid #E5E7EB}.footer{text-align:center;padding:20px;color:#9CA3AF;font-size:12px}</style>
    </head><body><h2>mPOS Receipt — ${APP_URLS.AppName}</h2><table>${rows}</table>
    <div class="footer">${translate('Thank you for choosing our service!')}</div></body></html>`;
};

// ─── Receipt HTML (dealer) ────────────────────────────────────────────────────
const buildDealerHTML = (item: any) => {
  const rows = [
    [translate('Retailer Name'),  item.RetailerName  || '—'],
    [translate('Date'),           item.date          || '—'],
    [translate('Type'),           item.transType     || '—'],
    [translate('Status'),         item.status        || '—'],
    [translate('Amount'),        `₹ ${item.amount ?? 0}`],
    [translate('Retailer Comm'), `₹ ${item.remincome ?? 0}`],
    [translate('Total Amount'),  `₹ ${item.totalamount ?? 0}`],
  ].map(([k, v]) =>
    `<tr><td style="padding:10px 14px;color:#6B7280;font-size:13px">${k}</td>` +
    `<td style="padding:10px 14px;font-weight:700;font-size:13px;text-align:right">${v}</td></tr>`
  ).join('');
  return `<html><head><meta name="viewport" content="width=device-width"/>
    <style>body{font-family:sans-serif;margin:0;background:#F9FAFB}h2{text-align:center;padding:20px;color:#1D4ED8;margin:0}table{width:100%;border-collapse:collapse}tr:nth-child(even){background:#F3F4F6}td{border-bottom:1px solid #E5E7EB}.footer{text-align:center;padding:20px;color:#9CA3AF;font-size:12px}</style>
    </head><body><h2>mPOS Receipt — ${APP_URLS.AppName}</h2><table>${rows}</table>
    <div class="footer">${translate('Thank you for choosing our service!')}</div></body></html>`;
};

const sharePDF = async (html: string, fileName: string) => {
  try {
    const file = await RNHTMLtoPDF.convert({ html, fileName, directory: 'Documents' });
    await Share.open({ title: 'Share Receipt', url: `file://${file.filePath}`, type: 'application/pdf' });
  } catch (err: any) {
    if (!err?.message?.includes('cancel')) Alert.alert('Error', 'Could not generate PDF.');
  }
};

// ─── Skeleton card ────────────────────────────────────────────────────────────
const SkeletonCard = ({ highlight, cardBg }: { highlight: string; cardBg: string }) => (
  <SkeletonPlaceholder
    borderRadius={16}
    speed={1300}
    backgroundColor={cardBg}
    highlightColor={highlight}
  >
    <SkeletonPlaceholder.Item
      flexDirection="row"
      alignItems="center"
      backgroundColor={cardBg}
      borderRadius={16}
      marginBottom={hScale(10)}
      paddingVertical={hScale(16)}
      paddingRight={wScale(14)}
      overflow="hidden"
    >
      {/* Accent bar */}
      <SkeletonPlaceholder.Item
        width={4} height={hScale(80)} borderRadius={4} marginRight={wScale(12)}
      />
      {/* Status icon bubble */}
      <SkeletonPlaceholder.Item
        width={wScale(42)} height={wScale(42)} borderRadius={21} marginRight={wScale(10)}
      />
      {/* Middle lines */}
      <SkeletonPlaceholder.Item flex={1}>
        <SkeletonPlaceholder.Item width="60%" height={hScale(13)} borderRadius={6} />
        <SkeletonPlaceholder.Item width="42%" height={hScale(11)} borderRadius={6} marginTop={hScale(6)} />
        <SkeletonPlaceholder.Item flexDirection="row" marginTop={hScale(10)}>
          <SkeletonPlaceholder.Item width={wScale(72)} height={hScale(22)} borderRadius={20} />
          <SkeletonPlaceholder.Item width={wScale(80)} height={hScale(11)} borderRadius={6} marginLeft={wScale(12)} marginTop={hScale(6)} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder.Item>
      {/* Right: amount + share */}
      <SkeletonPlaceholder.Item alignItems="flex-end" marginLeft={wScale(8)}>
        <SkeletonPlaceholder.Item width={wScale(60)} height={hScale(15)} borderRadius={6} />
        <SkeletonPlaceholder.Item width={wScale(52)} height={hScale(28)} borderRadius={20} marginTop={hScale(10)} />
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder.Item>
  </SkeletonPlaceholder>
);

// ─── Summary strip ────────────────────────────────────────────────────────────
const SummaryStrip = ({ data, isDealer, primary }: any) => {
  const s = useMemo(() => {
    const getStatus = (t: any) => (t.status || '').toUpperCase();
    const getAmount = (t: any) => parseFloat(isDealer ? t.totalamount : t.amount || '0');
    const success = data.filter((t: any) => getStatus(t) === 'SUCCESS');
    return {
      total:   data.length,
      success: success.length,
      failed:  data.filter((t: any) => getStatus(t) === 'FAILED' || getStatus(t) === 'M_FAILED').length,
      amount:  success.reduce((a: number, t: any) => a + getAmount(t), 0).toFixed(0),
    };
  }, [data, isDealer]);

  return (
    <View style={[sum.wrap, { borderColor: primary + '25' }]}>
      {[
        { l: translate('Total'),   v: s.total,        c: '#374151'  },
        { l: translate('Success'), v: s.success,       c: '#16A34A'  },
        { l: translate('Failed'),  v: s.failed,        c: '#DC2626'  },
        { l: translate('Amount'),  v: `₹${s.amount}`, c: primary    },
      ].map((chip, i, arr) => (
        <React.Fragment key={chip.l}>
          <View style={sum.chip}>
            <Text style={[sum.num, { color: chip.c }]}>{chip.v}</Text>
            <Text style={sum.lbl}>{chip.l}</Text>
          </View>
          {i < arr.length - 1 && <View style={sum.div} />}
        </React.Fragment>
      ))}
    </View>
  );
};
const sum = StyleSheet.create({
  wrap: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: wScale(12), marginBottom: hScale(10), borderRadius: 16, paddingVertical: hScale(12), borderWidth: 1, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4 },
  chip: { flex: 1, alignItems: 'center' },
  num:  { fontSize: wScale(15), fontWeight: '800' },
  lbl:  { fontSize: wScale(10), color: '#9CA3AF', marginTop: 2, fontWeight: '600' },
  div:  { width: 1, backgroundColor: '#F3F4F6', marginVertical: 4 },
});

// ─── Info row ─────────────────────────────────────────────────────────────────
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <View style={ir.wrap}>
    <Text style={ir.label}>{label}</Text>
    <Text style={ir.value} numberOfLines={1}>{value || '—'}</Text>
  </View>
);
const ir = StyleSheet.create({
  wrap:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: hScale(4) },
  label: { fontSize: wScale(12), color: '#6B7280', flex: 1 },
  value: { fontSize: wScale(13), color: '#111827', fontWeight: '600', flex: 1.4, textAlign: 'right' },
});

// ─── Retailer Transaction Card ────────────────────────────────────────────────
const RetailerCard = React.memo(({ item, expanded, onToggle, primary }: any) => {
  const st = getStatusCfg(item.status);
  return (
    <View style={[rc.wrap, { borderLeftColor: st.color }]}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.85}>
        <View style={rc.topRow}>
          <View style={[rc.iconWrap, { backgroundColor: st.bg }]}>
            <Text style={[rc.iconTxt, { color: st.color }]}>{st.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={rc.txnId} numberOfLines={1}>{translate('Transaction ID')}: {item.TxnId || '—'}</Text>
            <Text style={rc.rrn}>{translate('RRN')}: {item.rrn || '—'}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <Text style={[rc.amount, { color: st.color }]}>₹ {item.amount}</Text>
            <View style={[rc.pill, { backgroundColor: st.bg }]}>
              <Text style={[rc.pillTxt, { color: st.color }]}>{st.label}</Text>
            </View>
          </View>
        </View>
        <View style={rc.midRow}>
          <Text style={rc.merchant} numberOfLines={1}>
            🏪 {translate('Merchant ID')}: {item.merchant_id || '—'}
          </Text>
          <Text style={[rc.chevron, { transform: [{ rotate: expanded ? '180deg' : '0deg' }] }]}>⌄</Text>
        </View>
      </TouchableOpacity>

      <View style={rc.footer}>
        <Text style={rc.footerTime}>{item.date || ''}</Text>
        <TouchableOpacity
          style={[rc.shareBtn, { backgroundColor: primary }]}
          onPress={() => sharePDF(buildRetailerHTML(item), `mPOS-${item.TxnId ?? Date.now()}`)}
          activeOpacity={0.8}
        >
          <Text style={rc.shareTxt}>↑ {translate('Share')}</Text>
        </TouchableOpacity>
      </View>

      {expanded && (
        <View>
          <View style={rc.divider} />
          <InfoRow label={translate('Transaction ID')} value={item.TxnId}      />
          <InfoRow label={translate('RRN')}            value={item.rrn}         />
          <InfoRow label={translate('Merchant ID')}    value={item.merchant_id} />
          <InfoRow label={translate('Status')}         value={item.status}      />
        </View>
      )}
    </View>
  );
});

const rc = StyleSheet.create({
  wrap:      { backgroundColor: '#fff', borderRadius: 16, marginBottom: hScale(10), marginHorizontal: wScale(12), paddingHorizontal: wScale(14), paddingVertical: hScale(12), borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 5 },
  topRow:    { flexDirection: 'row', alignItems: 'center', marginBottom: hScale(8) },
  iconWrap:  { width: wScale(42), height: wScale(42), borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: wScale(10) },
  iconTxt:   { fontSize: wScale(16), fontWeight: '800' },
  txnId:     { fontSize: wScale(13), fontWeight: '700', color: '#111827' },
  rrn:       { fontSize: wScale(11), color: '#6B7280', marginTop: 2 },
  amount:    { fontSize: wScale(16), fontWeight: '800' },
  pill:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  pillTxt:   { fontSize: wScale(10), fontWeight: '800', letterSpacing: 0.3 },
  midRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: hScale(8) },
  merchant:  { fontSize: wScale(12), color: '#374151', flex: 1 },
  chevron:   { fontSize: 18, color: '#9CA3AF', marginLeft: 8, lineHeight: 20 },
  footer:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  footerTime:{ fontSize: wScale(11), color: '#9CA3AF' },
  shareBtn:  { paddingHorizontal: wScale(14), paddingVertical: hScale(6), borderRadius: 20 },
  shareTxt:  { color: '#fff', fontSize: wScale(12), fontWeight: '700' },
  divider:   { height: 1, backgroundColor: '#F3F4F6', marginVertical: hScale(8) },
});

// ─── Dealer Transaction Card ──────────────────────────────────────────────────
const DealerCard = React.memo(({ item, expanded, onToggle, primary }: any) => {
  const st = getStatusCfg(item.status);
  return (
    <View style={[dc.wrap, { borderLeftColor: st.color }]}>
      <TouchableOpacity onPress={onToggle} activeOpacity={0.85}>
        <View style={dc.topRow}>
          <View style={[dc.iconWrap, { backgroundColor: st.bg }]}>
            <Text style={[dc.iconTxt, { color: st.color }]}>{st.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={dc.name} numberOfLines={1}>{item.RetailerName || '—'}</Text>
            <Text style={dc.type}>{item.transType || '—'}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 4 }}>
            <Text style={[dc.totalAmt, { color: st.color }]}>₹ {item.totalamount ?? item.amount}</Text>
            <View style={[dc.pill, { backgroundColor: st.bg }]}>
              <Text style={[dc.pillTxt, { color: st.color }]}>{st.label}</Text>
            </View>
          </View>
        </View>
        <View style={dc.chipsRow}>
          {[
            { l: translate('Amount'),        v: `₹${item.amount      ?? '0'}`, c: '#1D4ED8', bg: '#EFF6FF' },
            { l: translate('Retailer Comm'), v: `₹${item.remincome   ?? '0'}`, c: '#7C3AED', bg: '#F5F3FF' },
            { l: translate('Total Amount'),  v: `₹${item.totalamount ?? '0'}`, c: '#16A34A', bg: '#DCFCE7' },
          ].map(chip => (
            <View key={chip.l} style={[dc.chip, { backgroundColor: chip.bg }]}>
              <Text style={[dc.chipAmt, { color: chip.c }]}>{chip.v}</Text>
              <Text style={dc.chipLbl}>{chip.l}</Text>
            </View>
          ))}
          <Text style={[dc.chevron, { transform: [{ rotate: expanded ? '180deg' : '0deg' }] }]}>⌄</Text>
        </View>
      </TouchableOpacity>

      <View style={dc.footer}>
        <Text style={dc.date}>{item.date || ''}</Text>
        <TouchableOpacity
          style={[dc.shareBtn, { backgroundColor: primary }]}
          onPress={() => sharePDF(buildDealerHTML(item), `mPOS-Dealer-${Date.now()}`)}
          activeOpacity={0.8}
        >
          <Text style={dc.shareTxt}>↑ {translate('Share')}</Text>
        </TouchableOpacity>
      </View>

      {expanded && (
        <View>
          <View style={dc.divider} />
          <InfoRow label={translate('Retailer Name')}  value={item.RetailerName}               />
          <InfoRow label={translate('Type')}           value={item.transType}                  />
          <InfoRow label={translate('Status')}         value={item.status}                     />
          <InfoRow label={translate('Amount')}         value={`₹ ${item.amount ?? '—'}`}      />
          <InfoRow label={translate('Retailer Comm')}  value={`₹ ${item.remincome ?? '—'}`}   />
          <InfoRow label={translate('Total Amount')}   value={`₹ ${item.totalamount ?? '—'}`} />
        </View>
      )}
    </View>
  );
});

const dc = StyleSheet.create({
  wrap:     { backgroundColor: '#fff', borderRadius: 16, marginBottom: hScale(10), marginHorizontal: wScale(12), paddingHorizontal: wScale(14), paddingVertical: hScale(12), borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 5 },
  topRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: hScale(10) },
  iconWrap: { width: wScale(42), height: wScale(42), borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: wScale(10) },
  iconTxt:  { fontSize: wScale(16), fontWeight: '800' },
  name:     { fontSize: wScale(14), fontWeight: '700', color: '#111827' },
  type:     { fontSize: wScale(11), color: '#6B7280', marginTop: 2 },
  totalAmt: { fontSize: wScale(16), fontWeight: '800' },
  pill:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  pillTxt:  { fontSize: wScale(10), fontWeight: '800', letterSpacing: 0.3 },
  chipsRow: { flexDirection: 'row', gap: wScale(6), alignItems: 'center', marginBottom: hScale(8) },
  chip:     { flex: 1, borderRadius: 10, paddingVertical: hScale(7), alignItems: 'center' },
  chipAmt:  { fontSize: wScale(12), fontWeight: '800' },
  chipLbl:  { fontSize: wScale(9), color: '#6B7280', marginTop: 2, fontWeight: '600' },
  chevron:  { fontSize: 18, color: '#9CA3AF', lineHeight: 20 },
  footer:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  date:     { fontSize: wScale(11), color: '#9CA3AF' },
  shareBtn: { paddingHorizontal: wScale(14), paddingVertical: hScale(6), borderRadius: 20 },
  shareTxt: { color: '#fff', fontSize: wScale(12), fontWeight: '700' },
  divider:  { height: 1, backgroundColor: '#F3F4F6', marginVertical: hScale(8) },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────
const MPosScreenR = () => {
  const { colorConfig, IsDealer } = useSelector((s: RootState) => s.userInfo);
  const { userId }                = useSelector((s: any) => s.userInfo);
  const { get, post }             = useAxiosHook();
  const primary                   = colorConfig.primaryColor;
  const shimmerHighlight          = primary + '30';
  const shimmerCardBg             = colorConfig.secondaryColor + '20';

  const [transactions,       setTransactions]       = useState<any[]>([]);
  const [loading,            setLoading]            = useState(true);
  const [expandedId,         setExpandedId]         = useState<string | null>(null);
  const [selectedStatus,     setSelectedStatus]     = useState('ALL');
  const [searchnumber,       setSearchnumber]       = useState('');
  const [selectedRetailerId, setSelectedRetailerId] = useState('');
  const [selectedDate,       setSelectedDate]       = useState({
    from: new Date().toISOString().split('T')[0],
    to:   new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchTransactions(selectedDate.from, selectedDate.to, selectedStatus, '');
  }, []);

  const fetchTransactions = useCallback(async (from: string, to: string, status: string, retailerId: string) => {
    setLoading(true);
    try {
      const fmt = (d: string) => new Date(d).toISOString().split('T')[0];
      let data: any;
      if (IsDealer) {
        const url = `${APP_URLS.dealer_Rem_m_possreport}ddl_status=${status}&txt_frm_date=${fmt(from)}&txt_to_date=${fmt(to)}&allretailer=${retailerId}`;
        data = await get({ url });
      } else {
        const url = `${APP_URLS.mposRrport}txt_frm_date=${fmt(from)}&txt_to_date=${fmt(to)}&Type=`;
        const res = await post({ url });
        data = res?.data ?? res;
      }
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [IsDealer, get, post]);

  const toggleExpand = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  const renderItem = useCallback(({ item, index }: { item: any; index: number }) => {
    const id = item.TxnId ?? item.rrn ?? String(index);
    if (!IsDealer) {
      return (
        <RetailerCard
          item={item}
          expanded={expandedId === id}
          onToggle={() => toggleExpand(id)}
          primary={primary}
        />
      );
    }
    const dealerId = item.RetailerName + String(index);
    return (
      <DealerCard
        item={item}
        expanded={expandedId === dealerId}
        onToggle={() => toggleExpand(dealerId)}
        primary={primary}
      />
    );
  }, [IsDealer, expandedId, toggleExpand, primary]);

  const ListHeader = useMemo(() =>
    !loading && transactions.length > 0
      ? <SummaryStrip data={transactions} isDealer={IsDealer} primary={primary} />
      : null,
    [loading, transactions, IsDealer, primary]
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AppBarSecond title={translate('M_pos History')} />

      <DateRangePicker
        onDateSelected={(from: string, to: string) => setSelectedDate({ from, to })}
        SearchPress={(from: string, to: string, status: string) =>
          fetchTransactions(from, to, status, selectedRetailerId)
        }
        status={selectedStatus}
        setStatus={setSelectedStatus}
        searchnumber={searchnumber}
        setSearchnumber={setSearchnumber}
        isshowRetailer={IsDealer}
        retailerID={(id: string) => {
          setSelectedRetailerId(id);
          fetchTransactions(selectedDate.from, selectedDate.to, selectedStatus, id);
        }}
      />

      <View style={styles.body}>
        {loading ? (
          <View style={styles.skeletonWrap}>
            {[...Array(5)].map((_, i) => (
              <SkeletonCard key={i} highlight={shimmerHighlight} cardBg={shimmerCardBg} />
            ))}
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.empty}>
            <NoDatafound />
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

export default MPosScreenR;

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#F9FAFB' },
  body:        { flex: 1, paddingTop: hScale(8) },
  list:        { paddingBottom: hScale(30), paddingTop: hScale(4) },
  skeletonWrap:{ paddingHorizontal: wScale(12), paddingTop: hScale(4) },
  empty:       { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: wScale(30) },
  emptyTitle:  { fontSize: wScale(16), fontWeight: '700', color: '#374151', marginTop: hScale(16), textAlign: 'center' },
  emptySub:    { fontSize: wScale(13), color: '#9CA3AF', marginTop: 6, textAlign: 'center', lineHeight: 20 },
});