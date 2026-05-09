import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  View, FlatList, Text, StyleSheet, TouchableOpacity,
  Animated, ToastAndroid, Alert,
  LayoutAnimation, UIManager, Platform, StatusBar,
} from "react-native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import useAxiosHook from "../../utils/network/AxiosClient";
import { useSelector } from "react-redux";
import AppBarSecond from "../drawer/headerAppbar/AppBarSecond";
import DateRangePicker from "../../components/DateRange";
import { hScale, wScale } from "../../utils/styles/dimensions";
import { useNavigation } from "@react-navigation/native";
import { RootState } from "../../reduxUtils/store";
import ShareSvg from "../drawer/svgimgcomponents/sharesvg";
import OTPModal from "../../components/OTPModal";
import RNHTMLtoPDF from "react-native-html-to-pdf";
import Share from "react-native-share";
import { APP_URLS } from "../../utils/network/urls";
import NoDatafound from "../drawer/svgimgcomponents/Nodatafound";
import RNPrint from 'react-native-print';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getStatusCfg = (status: string) => {
  if (!status)                                    return { color: '#6B7280', bg: '#F3F4F6', label: '—'        };
  if (status === 'SUCCESS')                       return { color: '#16A34A', bg: '#DCFCE7', label: 'Success'  };
  if (status === 'FAILED' || status === 'Failed') return { color: '#DC2626', bg: '#FEE2E2', label: 'Failed'   };
  if (status.startsWith('R'))                     return { color: '#7C3AED', bg: '#EDE9FE', label: 'Refunded' };
  return                                                 { color: '#D97706', bg: '#FEF3C7', label: 'Pending'  };
};

const fv = (isDealer: boolean, d: any, r: any) => isDealer ? d : r;

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
      {/* Status accent bar */}
      <SkeletonPlaceholder.Item
        width={4}
        height={hScale(80)}
        borderRadius={4}
        marginRight={wScale(12)}
      />

      {/* Bank icon */}
      <SkeletonPlaceholder.Item
        width={wScale(40)}
        height={wScale(40)}
        borderRadius={12}
        marginRight={wScale(10)}
      />

      {/* Middle: bank name + account + tags */}
      <SkeletonPlaceholder.Item flex={1}>
        <SkeletonPlaceholder.Item width="55%" height={hScale(13)} borderRadius={6} />
        <SkeletonPlaceholder.Item width="38%" height={hScale(11)} borderRadius={6} marginTop={hScale(6)} />
        <SkeletonPlaceholder.Item
          flexDirection="row"
          marginTop={hScale(10)}
        >
          <SkeletonPlaceholder.Item width={wScale(80)} height={hScale(18)} borderRadius={8} />
          <SkeletonPlaceholder.Item width={wScale(70)} height={hScale(11)} borderRadius={6} marginLeft={wScale(12)} marginTop={hScale(3)} />
        </SkeletonPlaceholder.Item>
        <SkeletonPlaceholder.Item
          flexDirection="row"
          justifyContent="space-between"
          marginTop={hScale(10)}
        >
          <SkeletonPlaceholder.Item width="35%" height={hScale(11)} borderRadius={6} />
          <SkeletonPlaceholder.Item width="30%" height={hScale(11)} borderRadius={6} />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder.Item>

      {/* Right: amount + pill */}
      <SkeletonPlaceholder.Item alignItems="flex-end" marginLeft={wScale(8)}>
        <SkeletonPlaceholder.Item width={wScale(64)} height={hScale(15)} borderRadius={6} />
        <SkeletonPlaceholder.Item width={wScale(56)} height={hScale(22)} borderRadius={20} marginTop={hScale(8)} />
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder.Item>
  </SkeletonPlaceholder>
);

// ─── Summary strip ────────────────────────────────────────────────────────────
const SummaryStrip = ({ transactions, isDealer, primaryColor }: any) => {
  const stats = useMemo(() => {
    const getAmt    = (t: any) => parseFloat(fv(isDealer, t.amount, t.Amount) || '0');
    const getStatus = (t: any) => fv(isDealer, t.status, t.Status) as string;
    const success   = transactions.filter((t: any) => getStatus(t) === 'SUCCESS');
    return {
      total:   transactions.length,
      success: success.length,
      failed:  transactions.filter((t: any) => ['FAILED', 'Failed'].includes(getStatus(t))).length,
      amount:  success.reduce((s: number, t: any) => s + getAmt(t), 0).toFixed(0),
    };
  }, [transactions, isDealer]);

  const chips = [
    { label: 'Total',   val: stats.total,        color: '#374151'   },
    { label: 'Success', val: stats.success,       color: '#16A34A'   },
    { label: 'Failed',  val: stats.failed,        color: '#DC2626'   },
    { label: 'Amt (₹)', val: `₹${stats.amount}`,  color: primaryColor },
  ];

  return (
    <View style={[sum.wrap, { borderColor: primaryColor + '25' }]}>
      {chips.map((chip, i) => (
        <React.Fragment key={chip.label}>
          <View style={sum.chip}>
            <Text style={[sum.num, { color: chip.color }]}>{chip.val}</Text>
            <Text style={sum.lbl}>{chip.label}</Text>
          </View>
          {i < chips.length - 1 && <View style={sum.div} />}
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
  wrap:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: hScale(5) },
  label: { fontSize: wScale(12), color: '#6B7280', flex: 1 },
  value: { fontSize: wScale(13), color: '#111827', fontWeight: '600', flex: 1.4, textAlign: 'right' },
});

// ─── Balance bar ──────────────────────────────────────────────────────────────
const BalanceBar = ({ pre, debit, post, earn }: any) => (
  <View style={bal.wrap}>
    {[
      { l: 'Pre Bal',  v: pre,   c: '#1D4ED8', bg: '#EFF6FF' },
      { l: 'Debit',    v: debit, c: '#DC2626', bg: '#FEF2F2' },
      { l: 'Post Bal', v: post,  c: '#16A34A', bg: '#F0FDF4' },
      { l: 'My Earn',  v: earn,  c: '#7C3AED', bg: '#F5F3FF' },
    ].map(chip => (
      <View key={chip.l} style={[bal.chip, { backgroundColor: chip.bg }]}>
        <Text style={[bal.amt, { color: chip.c }]}>₹{chip.v ?? '0'}</Text>
        <Text style={bal.lbl}>{chip.l}</Text>
      </View>
    ))}
  </View>
);
const bal = StyleSheet.create({
  wrap: { flexDirection: 'row', justifyContent: 'space-between', gap: wScale(6), marginTop: hScale(8) },
  chip: { flex: 1, alignItems: 'center', borderRadius: 10, paddingVertical: hScale(7) },
  amt:  { fontSize: wScale(12), fontWeight: '800' },
  lbl:  { fontSize: wScale(9), color: '#6B7280', marginTop: 2, fontWeight: '600' },
});

// ─── Transaction card ─────────────────────────────────────────────────────────
const TxnCard = React.memo(({
  item, isDealer, expanded, onExpand, onShare, onRefund, refundAnim,
}: any) => {
  const status   = fv(isDealer, item.status, item.Status) as string;
  const st       = getStatusCfg(status);
  const isVerify = !isDealer && item.TransactionType === 'IMPS_VERIFY';

  return (
    <View style={[txn.wrap, { borderLeftColor: st.color }]}>

      <TouchableOpacity onPress={onExpand} activeOpacity={0.85}>
        {/* Top: bank icon + name + amount */}
        <View style={txn.topRow}>
          <View style={txn.bankWrap}>
            <View style={[txn.bankIcon, { backgroundColor: st.bg }]}>
              <Text style={[txn.bankInitial, { color: st.color }]}>
                {(fv(isDealer, item.bank_nm, item.BankName) || 'B').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={txn.bankName} numberOfLines={1}>
                {fv(isDealer, item.bank_nm, item.BankName) || 'No Name'}
              </Text>
              <Text style={txn.acctNo}>
                {fv(isDealer, item.accountno, item.AccountNo) || '—'}
              </Text>
            </View>
          </View>
          <View style={txn.rightWrap}>
            <Text style={[txn.amount, { color: st.color }]}>
              ₹ {fv(isDealer, item.amount, item.Amount)}
            </Text>
            <View style={[txn.pill, { backgroundColor: st.bg }]}>
              <Text style={[txn.pillText, { color: st.color }]}>{st.label}</Text>
            </View>
          </View>
        </View>

        {/* Tags + time */}
        <View style={txn.tagsRow}>
          <View style={[txn.tag, { backgroundColor: isVerify ? '#DCFCE7' : '#FEE2E2' }]}>
            <Text style={[txn.tagText, { color: isVerify ? '#16A34A' : '#DC2626' }]}>
              {fv(isDealer, item.Trans_type, isVerify ? '✓ Verified A/C' : '✗ Non-Verified A/C')}
            </Text>
          </View>
          <Text style={txn.timeText}>{fv(isDealer, item.trans_time, item.M_Date)}</Text>
        </View>

        {/* IFSC + Sender + Chevron */}
        <View style={txn.row2}>
          <View>
            <Text style={txn.micro}>IFSC Code</Text>
            <Text style={txn.micro2}>{item.IFSC || '—'}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={txn.micro}>Sender</Text>
            <Text style={txn.micro2}>{fv(isDealer, item.senderno, item.Sender) || '—'}</Text>
          </View>
          <View style={[txn.chevron, { transform: [{ rotate: expanded ? '180deg' : '0deg' }] }]}>
            <Text style={{ color: '#9CA3AF', fontSize: 18 }}>⌄</Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={txn.divider} />

      {/* Actions */}
      <View style={txn.actionsRow}>
        <Text style={txn.receiverText} numberOfLines={1}>
          👤 {fv(isDealer, item.recivername, item.Receiver) || '—'}
        </Text>
        <View style={txn.actionBtns}>
          {item.Dmttype === 'DMTN' && (
            <TouchableOpacity onPress={onRefund} activeOpacity={0.8}>
              <Animated.View style={[txn.refundBtn, { backgroundColor: refundAnim }]}>
                <Text style={txn.refundText}>↩ Refund</Text>
              </Animated.View>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={txn.shareBtn} onPress={onShare} activeOpacity={0.8}>
            <ShareSvg size={wScale(14)} color="#fff" />
            <Text style={txn.shareText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Expanded */}
      {expanded && (
        <View>
          <View style={txn.divider} />
          <InfoRow label="Transaction ID"   value={fv(isDealer, item.trans_id,   item.TransactionId)}   />
          <InfoRow label="Transaction Mode" value={fv(isDealer, item.Trans_type, item.TransactionType)} />
          <InfoRow label="Bank RRN"         value={item.BankRefId || '—'}                               />
          <View style={[txn.divider, { marginTop: hScale(8) }]} />
          <BalanceBar
            pre={fv(isDealer,   item.dlm_remain_pre, item.REM_Remain_Pre)}
            debit={item.Debit}
            post={fv(isDealer,  item.dlm_remain,     item.REM_Remain_Post)}
            earn={fv(isDealer,  item.dlm_income,     item.Dealer_Income)}
          />
        </View>
      )}
    </View>
  );
});

const txn = StyleSheet.create({
  wrap:        { backgroundColor: '#fff', borderRadius: 16, marginBottom: hScale(10), marginHorizontal: wScale(12), paddingHorizontal: wScale(14), paddingVertical: hScale(12), borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 5 },
  topRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hScale(8) },
  bankWrap:    { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: wScale(8) },
  bankIcon:    { width: wScale(40), height: wScale(40), borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: wScale(10) },
  bankInitial: { fontSize: wScale(16), fontWeight: '800' },
  bankName:    { fontSize: wScale(14), fontWeight: '700', color: '#111827' },
  acctNo:      { fontSize: wScale(12), color: '#6B7280', marginTop: 2 },
  rightWrap:   { alignItems: 'flex-end', gap: 5 },
  amount:      { fontSize: wScale(16), fontWeight: '800' },
  pill:        { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  pillText:    { fontSize: wScale(10), fontWeight: '800', letterSpacing: 0.3 },
  tagsRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: hScale(8) },
  tag:         { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  tagText:     { fontSize: wScale(10), fontWeight: '700' },
  timeText:    { fontSize: wScale(11), color: '#9CA3AF' },
  row2:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  micro:       { fontSize: wScale(10), color: '#9CA3AF', fontWeight: '600' },
  micro2:      { fontSize: wScale(12), color: '#374151', fontWeight: '700', marginTop: 2 },
  chevron:     { marginLeft: wScale(8) },
  divider:     { height: 1, backgroundColor: '#F3F4F6', marginVertical: hScale(6) },
  actionsRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  receiverText:{ fontSize: wScale(12), color: '#374151', fontWeight: '600', flex: 1, marginRight: 8 },
  actionBtns:  { flexDirection: 'row', gap: wScale(8) },
  refundBtn:   { paddingHorizontal: wScale(12), paddingVertical: hScale(5), borderRadius: 20 },
  refundText:  { fontSize: wScale(12), fontWeight: '700', color: '#000' },
  shareBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1D4ED8', paddingHorizontal: wScale(12), paddingVertical: hScale(5), borderRadius: 20 },
  shareText:   { fontSize: wScale(12), fontWeight: '700', color: '#fff' },
});

// ─── Main screen ──────────────────────────────────────────────────────────────
const ImpsNeftScreen = () => {
  const navigation                = useNavigation<any>();
  const { colorConfig, IsDealer } = useSelector((s: RootState) => s.userInfo);
  const { userId }                = useSelector((s: any) => s.userInfo);
  const { get, post }             = useAxiosHook();
  const primaryColor              = colorConfig.primaryColor;
  const shimmerHighlight          = primaryColor + '30';

  const [transactions,   setTransactions]   = useState<any[]>([]);
  const [loading,        setLoading]        = useState(true);
  const [expandedId,     setExpandedId]     = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchnumber,   setSearchnumber]   = useState('');
  const [selectedDate,   setSelectedDate]   = useState({
    from: new Date().toISOString().split('T')[0],
    to:   new Date().toISOString().split('T')[0],
  });
  const [ShowOtpModal, setShowOtpModal] = useState(false);
  const [isotp,        setIsOtp]        = useState('');
  const [tid,          setId]           = useState('');

  // Refund pulse
  const pulseAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: false }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 900, useNativeDriver: false }),
      ])
    ).start();
  }, []);
  const refundBg = pulseAnim.interpolate({
    inputRange: [0, 1], outputRange: ['#FEF3C7', '#FDE68A'],
  });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchTransactions = useCallback(async (from: string, to: string, status: string) => {
    setLoading(true);
    try {
      const fmt = (d: string) => new Date(d).toISOString().split('T')[0];
      const url = IsDealer
        ? `${APP_URLS.dealer_rem_MoneyTransferReport}pageindex=1&txt_frm_date=${fmt(from)}&txt_to_date=${fmt(to)}&allretailer=&allapiuser=&ddl_status=${status}&ddl_Type=ALL`
        : `Money/api/Money/GetBeneIMPSReport?pageindex=1&pagesize=500&role=Retailer&Id=${userId}&txt_frm_date=${fmt(from)}&txt_to_date=${fmt(to)}&status=${status}&transtype=ALL&senderno=${searchnumber}`;
      const data = await get({ url });
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [userId, IsDealer, searchnumber, get]);

  useEffect(() => {
    fetchTransactions(selectedDate.from, selectedDate.to, selectedStatus);
  }, [selectedDate, selectedStatus]);

  // ── Expand ─────────────────────────────────────────────────────────────────
  const toggleExpand = useCallback((id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  // ── Refund ─────────────────────────────────────────────────────────────────
  const handleRefund = useCallback(async (txnId: string) => {
    try {
      if (isotp) {
        const res = await get({ url: `${APP_URLS.RefundOTP}Txnid=${tid}&otp=${isotp}` });
        ToastAndroid.show(res?.ADDINFO || 'Done', ToastAndroid.LONG);
      } else {
        const res = await post({ url: `${APP_URLS.Report_RefundOTP}Txnid=${txnId}` });
        if (res?.status) setShowOtpModal(true);
        else ToastAndroid.show(res?.ADDINFO || 'Failed', ToastAndroid.LONG);
      }
    } catch (err: any) {
      ToastAndroid.show(err?.message || 'Error occurred', ToastAndroid.LONG);
    }
  }, [isotp, tid, get, post]);

  // ── Share ──────────────────────────────────────────────────────────────────
const handleShare = useCallback(async (item: any) => {
  const rows = [
    ['Bank Name',        fv(IsDealer, item.bank_nm,     item.BankName)        || '—'],
    ['Account No',       fv(IsDealer, item.accountno,   item.AccountNo)       || '—'],
    ['Status',           fv(IsDealer, item.status,      item.Status)          || '—'],
    ['Amount',          `₹ ${fv(IsDealer, item.amount,  item.Amount)}`],
    ['IFSC Code',        item.IFSC                                             || '—'],
    ['Receiver',         fv(IsDealer, item.recivername, item.Receiver)        || '—'],
    ['Bank RRN',         item.BankRefId                                        || '—'],
    ['Request Time',     fv(IsDealer, item.trans_time,  item.M_Date)          || '—'],
    ['Transaction ID',   fv(IsDealer, item.trans_id,    item.TransactionId)   || '—'],
    ['Mode',             fv(IsDealer, item.Trans_type,  item.TransactionType) || '—'],
  ].map(([k, v]) =>
    `<tr>
      <td style="padding:9px 14px;color:#6B7280;font-size:13px">${k}</td>
      <td style="padding:9px 14px;font-weight:700;font-size:13px;text-align:right">${v}</td>
    </tr>`
  ).join('');

  const html = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width"/>
        <style>
          body{font-family:sans-serif;margin:0;background:#F9FAFB}
          h2{text-align:center;color:#1D4ED8;padding:20px 0;margin:0}
          table{width:100%;border-collapse:collapse}
          tr:nth-child(even){background:#F3F4F6}
          td{border-bottom:1px solid #E5E7EB}
          .footer{text-align:center;padding:20px;color:#9CA3AF;font-size:12px}
        </style>
      </head>
      <body>
        <h2>IMPS / NEFT Receipt</h2>
        <table>${rows}</table>
        <div class="footer">Powered by ${APP_URLS.AppName}</div>
      </body>
    </html>
  `;

  try {
    await RNPrint.print({
      html: html,
    });
  } catch (err: any) {
    console.log(err);
    if (!err?.message?.includes('cancel')) {
      Alert.alert('Error', 'Could not generate PDF.');
    }
  }
}, [IsDealer]);

  // ── Render item ────────────────────────────────────────────────────────────
  const renderItem = useCallback(({ item }: { item: any }) => {
    const txnId = fv(IsDealer, item.trans_id, item.TransactionId);
    return (
      <TxnCard
        item={item}
        isDealer={IsDealer}
        expanded={expandedId === txnId}
        onExpand={() => toggleExpand(txnId)}
        onShare={() => handleShare(item)}
        onRefund={() => { setId(txnId); handleRefund(txnId); }}
        refundAnim={refundBg}
      />
    );
  }, [IsDealer, expandedId, toggleExpand, handleShare, handleRefund, refundBg]);

  const ListHeader = useMemo(() => (
    !loading && transactions.length > 0
      ? <SummaryStrip transactions={transactions} isDealer={IsDealer} primaryColor={primaryColor} />
      : null
  ), [loading, transactions, IsDealer, primaryColor]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AppBarSecond title="IMPS / NEFT History" />

      <DateRangePicker
        onDateSelected={(from: string, to: string) => setSelectedDate({ from, to })}
        SearchPress={(from: string, to: string, status: string) => fetchTransactions(from, to, status)}
        status={selectedStatus}
        setStatus={setSelectedStatus}
        searchnumber={searchnumber}
        setSearchnumber={setSearchnumber}
        isStShow
        retailerID={() => {}}
        isshowRetailer={IsDealer}
      />

      <View style={styles.body}>
        {loading ? (
          // ── Skeleton list ──────────────────────────────────────────────────
          <View style={styles.skeletonWrap}>
            {[...Array(5)].map((_, i) => (
              <SkeletonCard key={i} highlight={shimmerHighlight} />
            ))}
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyWrap}>
            <NoDatafound />
            <Text style={styles.emptyTitle}>No transactions found</Text>
            <Text style={styles.emptySub}>Try changing the date range or status filter.</Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            renderItem={renderItem}
            keyExtractor={(item, i) => item?.TransactionId ?? item?.trans_id ?? String(i)}
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

      <OTPModal
        setShowOtpModal={setShowOtpModal}
        disabled={isotp.length !== 4}
        showOtpModal={ShowOtpModal}
        setMobileOtp={setIsOtp}
        verifyOtp={() => handleRefund(isotp)}
        inputCount={4}
      />
    </View>
  );
};

export default ImpsNeftScreen;

const styles = StyleSheet.create({
  root:        { flex: 1, backgroundColor: '#F9FAFB' },
  body:        {  paddingTop: hScale(8) ,paddingBottom:hScale(100)},
  list:        { paddingBottom: hScale(30), paddingTop: hScale(4) },
  skeletonWrap:{ paddingHorizontal: wScale(12), paddingTop: hScale(4) },
  emptyWrap:   { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: wScale(30) },
  emptyTitle:  { fontSize: wScale(16), fontWeight: '700', color: '#374151', marginTop: hScale(16), textAlign: 'center' },
  emptySub:    { fontSize: wScale(13), color: '#9CA3AF', marginTop: 6, textAlign: 'center', lineHeight: 20 },
});