import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import DateRangePicker from '../../components/DateRange';
import { APP_URLS } from '../../utils/network/urls';
import useAxiosHook from '../../utils/network/AxiosClient';
import { RootState } from '../../reduxUtils/store';
import Nodatafound from '../drawer/svgimgcomponents/Nodatafound';
import { FlashList } from '@shopify/flash-list';
import { hScale, wScale } from '../../utils/styles/dimensions';
import { Icon } from 'react-native-paper';

// ---- status -> color / vector icon / label config ----
const STATUS_CONFIG: Record<
  string,
  { color: string; bg: string; icon: string; label: string }
> = {
  success: { color: '#1E9E5A', bg: '#E7F7EF', icon: 'check-decagram', label: 'Success' },
  failed: { color: '#E24C4B', bg: '#FDEAEA', icon: 'close-circle', label: 'Failed' },
  pending: { color: '#D68A00', bg: '#FFF4E0', icon: 'progress-clock', label: 'Pending / Refund' },
  refund: { color: '#8A5CD6', bg: '#F1EBFB', icon: 'cash-refund', label: 'Refund' },
  default: { color: '#3E6BE0', bg: '#EAF0FE', icon: 'help-circle-outline', label: 'Unknown' },
};

const getStatusConfig = (status?: string) => {
  const key = (status || '').toLowerCase();
  if (key.includes('pending')) return STATUS_CONFIG.pending;
  if (key.includes('refund')) return STATUS_CONFIG.refund;
  return STATUS_CONFIG[key] || STATUS_CONFIG.default;
};

const formatTxnDate = (txndate?: string) => {
  if (!txndate) return { date: '-', time: '-' };
  const d = new Date(txndate);
  if (isNaN(d.getTime())) return { date: '-', time: '-' };
  return {
    date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
  };
};

// Row used inside the expandable "more details" section — skips null/empty values
const DetailRow = ({ label, value }: { label: string; value: any }) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue} numberOfLines={2}>
        {String(value)}
      </Text>
    </View>
  );
};

const TransactionCard = ({ item, primaryColor }: { item: any; primaryColor: string }) => {
  const [expanded, setExpanded] = useState(false);
  const {
    Firmname,
    Idno,
    Retailerid,
    Merchantid,
    Status,
    Amount,
    comm,
    totalcomm,
    Remainpre,
    RemainPost,
    Gst,
    tds,
    txndate,
    Bankrrn,
    reqtype,
    customermobile,
    txntype,
    PayerVPA,
    Fingpaytxnid,
    Txnid,
    Adminremainpre,
    Adminremainpost,
    posremainpre,
    posremainpost,
    PayerName,
  } = item;

  const statusCfg = getStatusConfig(Status);
  const { date, time } = formatTxnDate(txndate);

  return (
    <View style={styles.card}>
      {/* ---- Top row: status chip + amount ---- */}
      <View style={styles.topRow}>
        <View style={[styles.statusChip, { backgroundColor: statusCfg.bg }]}>
          <Icon source={statusCfg.icon} size={16} color={statusCfg.color} />
          <Text style={[styles.statusText, { color: statusCfg.color }]}>{Status || statusCfg.label}</Text>
        </View>
        <Text style={styles.amountText}>₹{Amount ?? '-'}</Text>
      </View>

      {/* ---- Date / time / channel ---- */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Icon source="calendar-blank-outline" size={14} color="#8A8A8A" />
          <Text style={styles.metaText}>{date}</Text>
        </View>
        <View style={styles.metaItem}>
          <Icon source="clock-time-four-outline" size={14} color="#8A8A8A" />
          <Text style={styles.metaText}>{time}</Text>
        </View>
        <View style={styles.metaItem}>
          <Icon source={reqtype === 'WEB' ? 'web' : 'cellphone'} size={14} color="#8A8A8A" />
          <Text style={styles.metaText}>{reqtype === 'WEB' ? 'Web' : 'App'}</Text>
        </View>
      </View>

      {/* ---- Bank RRN / status message ---- */}
      {!!Bankrrn && (
        <View style={styles.messageBox}>
          <Icon source="information-outline" size={14} color="#8A8A8A" />
          <Text style={styles.messageText} numberOfLines={2}>
            {Bankrrn}
          </Text>
        </View>
      )}

      {/* ---- Txn id ---- */}
      <View style={styles.idRow}>
        <Icon source="identifier" size={14} color="#8A8A8A" />
        <Text style={styles.idText} numberOfLines={1}>
          {Txnid || '-'}
        </Text>
      </View>

      {/* ---- Payer info (only if present) ---- */}
      {(!!PayerVPA || !!PayerName) && (
        <View style={styles.payerRow}>
          <Icon source="account-circle-outline" size={16} color={primaryColor} />
          <Text style={styles.payerText} numberOfLines={1}>
            {PayerName || 'Payer'} {PayerVPA ? `• ${PayerVPA}` : ''}
          </Text>
        </View>
      )}

      {/* ---- Commission / balance strip ---- */}
      <View style={styles.balanceStrip}>
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>Commission</Text>
          <Text style={styles.balanceValue}>₹{totalcomm ?? 0}</Text>
        </View>
        <View style={styles.balanceDivider} />
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>Bal. Pre</Text>
          <Text style={styles.balanceValue}>₹{Remainpre ?? '-'}</Text>
        </View>
        <Icon source="arrow-right-thin" size={16} color="#8A8A8A" />
        <View style={styles.balanceItem}>
          <Text style={styles.balanceLabel}>Bal. Post</Text>
          <Text style={styles.balanceValue}>₹{RemainPost ?? '-'}</Text>
        </View>
      </View>

      {/* ---- Expand / collapse full raw details ---- */}
      <TouchableOpacity style={styles.expandBtn} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
        <Text style={[styles.expandText, { color: primaryColor }]}>
          {expanded ? 'Hide Details' : 'View All Details'}
        </Text>
        <Icon source={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={primaryColor} />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.detailsBlock}>
          <DetailRow label="Idno" value={Idno} />
          <DetailRow label="Firm Name" value={Firmname} />
          <DetailRow label="Retailer ID" value={Retailerid} />
          <DetailRow label="Merchant ID" value={Merchantid} />
          <DetailRow label="Txn Type" value={txntype} />
          <DetailRow label="Customer Mobile" value={customermobile} />
          <DetailRow label="Fingpay Txn ID" value={Fingpaytxnid} />
          <DetailRow label="GST" value={Gst} />
          <DetailRow label="TDS" value={tds} />
          <DetailRow label="Raw Commission" value={comm} />
          <DetailRow label="Admin Bal. Pre" value={Adminremainpre} />
          <DetailRow label="Admin Bal. Post" value={Adminremainpost} />
          <DetailRow label="POS Bal. Pre" value={posremainpre} />
          <DetailRow label="POS Bal. Post" value={posremainpost} />
        </View>
      )}
    </View>
  );
};

export default function AepsUpiReport() {
  const { IsDealer, colorConfig } = useSelector((state: RootState) => state.userInfo);
  const [loading, setLoading] = React.useState(false);
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedRetailerId, setSelectedRetailerId] = React.useState('');
  const [searchnumber, setSearchnumber] = React.useState('');
  const { get, post } = useAxiosHook();

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parsedDate = new Date(dateStr);
    if (isNaN(parsedDate.getTime())) return '';
    return parsedDate.toISOString().split('T')[0];
  };

  const fetchTransactions = useCallback(
    async (from: string, to: string, status: string, retailerId: string) => {
      setLoading(true);
      try {
        const formattedFrom = formatDate(from);
        const formattedTo = formatDate(to);
        const url = `${APP_URLS.AEPSUPIReport}txt_frm_date=${formattedFrom}&txt_to_date=${formattedTo}&ddl_status=${
          status == 'All Transactions' ? 'All' : status
        }`;

        console.log(url)
        const res = await post({ url });
                console.log(res)

        const data = res?.data ?? res;
        setTransactions(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Fetch error:', err);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    },
    [IsDealer, get, post]
  );

  useEffect(() => {
    fetchTransactions(selectedDate.from, selectedDate.to, selectedStatus, '');
  }, []);

  const renderTransactions = ({ item }: { item: any }) => (
    <TransactionCard item={item} primaryColor={colorConfig.primaryColor} />
  );

  return (
    <View style={styles.container}>
      <AppBarSecond title={'Aeps-UPI'} />
      <DateRangePicker
        onDateSelected={(from: string, to: string) => setSelectedDate({ from, to })}
        SearchPress={(from: string, to: string, status: string) =>
          fetchTransactions(from, to, status, selectedRetailerId)
        }
        isStShow
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

      {transactions.length > 0 ? (
        <FlashList
          data={transactions}
          renderItem={renderTransactions}
          estimatedItemSize={220}
          keyExtractor={(item) => item?.Idno.toString()}
          contentContainerStyle={{ paddingHorizontal: wScale(12), paddingBottom: hScale(20) }}
        />
      ) : (
        <Nodatafound />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: hScale(12),
    marginVertical: hScale(6),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#6B6B6B',
  },
  messageBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    backgroundColor: '#F7F7F9',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
  },
  messageText: {
    fontSize: 12,
    color: '#6B6B6B',
    flex: 1,
  },
  idRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  idText: {
    fontSize: 12,
    color: '#8A8A8A',
    flex: 1,
  },
  payerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  payerText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  balanceStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
  },
  balanceItem: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 10,
    color: '#9A9A9A',
  },
  balanceValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    marginTop: 2,
  },
  balanceDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E5E5',
  },
  expandBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: 10,
    paddingVertical: 6,
  },
  expandText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailsBlock: {
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    paddingTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: '#9A9A9A',
    flex: 1,
  },
  detailValue: {
    fontSize: 12,
    color: '#333',
    flex: 1.4,
    textAlign: 'right',
  },
});