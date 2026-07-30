import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Modal } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { translate } from '../../../utils/languageUtils/I18n';
import BorderLine from '../../../components/BorderLine';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import ShowLoader from '../../../components/ShowLoder';
import { commonStyles } from '../../../utils/styles/commonStyles';
import Nodatafound from '../../drawer/svgimgcomponents/Nodatafound';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


// ── Doc filenames backend se bina base URL ke aate h ──
const DOC_BASE_URL = 'https://vastbazaar.com/RadiantClientInsert/Uploads/Slips/';
const toDocUrl = (value?: string | null) => {
  if (!value) return '';
  if (value.startsWith('http') || value.startsWith('data:')) return value;
  return `${DOC_BASE_URL}${value}`;
};

const STATUS_ICON: Record<string, string> = {
  Approved: 'check-decagram',
  Pending: 'clock-outline',
  Rejected: 'close-circle',
  Draft: 'file-edit-outline',
};

type RowItem = { label: string; value?: string | number | null; fullWidth?: boolean };

// ── Ek client record ka poora card — pehle poore component ka body tha,
// ab reusable bana diya h taaki multiple records loop me render ho saken.
const ClientReportCard = ({
  data,
  colorConfig,
  onPreview,
}: {
  data: any;
  colorConfig: any;
  onPreview: (uri: string) => void;
}) => {
  const statusKey = (data.Status || 'Draft') as keyof typeof STATUS_ICON;
  const statusIcon = STATUS_ICON[statusKey] ?? STATUS_ICON.Draft;
  const stateLabel = data.State_name || data.stateName || '--';
  const districtLabel = data.Dist_Desc || data.districtName || '--';

  const rows: RowItem[] = [
    { label: 'Full Name', value: data.Name },
    { label: 'Company Name', value: data.Firmname },
    { label: 'Mobile Number', value: data.mobile },
    { label: 'Email Id', value: data.Email },
    { label: 'Full Address', value: data.Address, fullWidth: true },
    { label: 'City Name', value: data.cityName },
    { label: 'District', value: districtLabel },
    { label: 'State', value: stateLabel },
    { label: 'Pin Code', value: data.Pincode },
    { label: 'GST Number', value: data.Gstnumber },
    { label: 'Legal Name', value: data.LegelName },
    { label: 'Trade Name', value: data.TradeName },
    ...(data.ispvt ? [{ label: 'BR Number', value: data.BRNumber }] : []),
    { label: 'PAN Number', value: data.PanCard },
    { label: 'Aadhaar Number', value: data.AadharCard },
  ];

  const bankRows: RowItem[][] = Array.isArray(data.BankDetails)
    ? data.BankDetails.map((bank: any) => [
        { label: 'Bank Name', value: bank.BankName },
        { label: 'Branch Name', value: bank.BranchName },
        { label: 'IFSC Code', value: bank.Ifsccode },
        { label: 'Account Number', value: bank.AccountNUmber },
        { label: 'Account Holder', value: bank.AccountholderName },
      ])
    : [];

  const cheques: any[] = Array.isArray(data.CancelCheque) ? data.CancelCheque : [];

  // ── Har document ka ek row: left = naam, right = "View Image" button ──
  const DocRow = ({ uri, label }: { uri: string; label: string }) => {
    if (!uri) return null;
    return (
      <>
        <View style={styles.loginTimeSection}>
          <Text style={styles.label}>{translate(label)}</Text>
          <TouchableOpacity
            style={[styles.viewBtn, { borderColor: colorConfig?.primaryColor ?? '#333' }]}
            onPress={() => onPreview(uri)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons name="eye-outline" size={wScale(14)} color={colorConfig?.primaryColor ?? '#333'} />
            <Text style={[styles.viewBtnText, { color: colorConfig?.primaryColor ?? '#333' }]}>
              {translate('View_Image')}
            </Text>
          </TouchableOpacity>
        </View>
        <BorderLine />
      </>
    );
  };

  return (
    <View style={styles.card}>
      <View style={[styles.headerRow, { backgroundColor: colorConfig?.secondaryColor ?? '#eee' }]}>
        <View style={styles.typeI}>
          <MaterialCommunityIcons name={statusIcon} color={colorConfig?.primaryColor ?? '#333'} size={28} />
          <View style={{ marginLeft: wScale(8) }}>
            <Text style={styles.timeLabel}>{translate('Status')}</Text>
            <Text style={[styles.timeVabel, { color: colorConfig?.primaryColor }]}>
              {data.Status || 'Draft'}
            </Text>
          </View>
        </View>
        <View style={styles.rightContainer}>
          <Text style={styles.timeLabel}>{translate('Submitted_On')}</Text>
          <Text style={styles.timeVabel}>{data.InsertDate ?? '--'}</Text>
        </View>
      </View>

      <View
        style={[
          styles.cardContent,
          {
            backgroundColor: `${colorConfig?.secondaryColor ?? '#eee'}1D`,
            borderColor: colorConfig?.secondaryColor ?? '#ccc',
          },
        ]}
      >
        {/* ── Personal, GST, KYC — sab ek hi list me ── */}
        {rows.map((row, idx) => (
          <React.Fragment key={idx}>
            <View style={row.fullWidth ? styles.addressText : styles.loginTimeSection}>
              <Text style={styles.label}>{translate(row.label)}</Text>
              <Text style={styles.valueText} numberOfLines={2}>
                {row.value || row.value === 0 ? String(row.value) : 'N/A'}
              </Text>
            </View>
            <BorderLine />
          </React.Fragment>
        ))}

        {/* ── Documents — sirf naam + "View Image" button ── */}
        <DocRow uri={toDocUrl(data.GstDoc)} label="GST Certificate" />
        {data.ispvt && <DocRow uri={toDocUrl(data.BRDoc)} label="BR_Document" />}
        <DocRow uri={toDocUrl(data.Pancarddoc)} label="PAN_Document" />
        <DocRow uri={toDocUrl(data.AadharcardFrontdoc)} label="Aadhaar_Front" />
        <DocRow uri={toDocUrl(data.AadharcardBackdoc)} label="Aadhaar_Back" />

        {/* ── Bank Details ── */}
        {bankRows.map((bank, bIdx) => (
          <React.Fragment key={`bank-${bIdx}`}>
            {bankRows.length > 1 && (
              <Text style={[styles.sectionTitle, { color: colorConfig?.primaryColor }]}>
                {translate('Bank_Account')} {bIdx + 1}
              </Text>
            )}
            {bank.map((row, idx) => (
              <React.Fragment key={idx}>
                <View style={styles.loginTimeSection}>
                  <Text style={styles.label}>{translate(row.label)}</Text>
                  <Text style={styles.valueText}>{row.value || 'N/A'}</Text>
                </View>
                <BorderLine />
              </React.Fragment>
            ))}
          </React.Fragment>
        ))}

        {/* ── Cancelled Cheques ── */}
        {cheques.map((cheque, idx) => (
          <React.Fragment key={`cheque-${idx}`}>
            <View style={styles.loginTimeSection}>
              <Text style={styles.label}>{translate('Cheque Number')}</Text>
              <Text style={styles.valueText}>{cheque.Chequeno || 'N/A'}</Text>
            </View>
            <BorderLine />
            <DocRow uri={toDocUrl(cheque.ChequeImage)} label="Cheque_Image" />
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const ClientApplicationStatusScreen = () => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const { post } = useAxiosHook();

  // ── Ab poori list rakhte h, sirf pehla record nahi ──
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Doc preview modal — button dabane par isi me image dikhti h ──
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      setLoading(true);
      try {
        const res = await post({ url: APP_URLS.ShowClientInfo });
        console.log('📥 ShowClientInfo RESPONSE:', JSON.stringify(res, null, 2));
        setDataList(Array.isArray(res?.Content) ? res.Content : []);
      } catch (err) {
        console.error('❌ ShowClientInfo ERROR:', err);
        setDataList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  if (loading) {
    return (
      <View style={commonStyles.screenContainer}>
        <AppBarSecond title={'Application Status'} />
        <ShowLoader />
      </View>
    );
  }

  if (!dataList.length) {
    return (
      <View style={commonStyles.screenContainer}>
        <AppBarSecond title={'Application Status'} />
        <Nodatafound/>
      </View>
    );
  }

  return (
    <View style={commonStyles.screenContainer}>
      <AppBarSecond title={'Application Status'} />

      <ScrollView contentContainerStyle={styles.main} showsVerticalScrollIndicator={false}>
        {/* ── Har record ka apna card — sab ek ke niche ek dikhte h ── */}
        {dataList.map((data, idx) => (
          <ClientReportCard
            key={data.idno ?? idx}
            data={data}
            colorConfig={colorConfig}
            onPreview={setPreviewUri}
          />
        ))}
      </ScrollView>

      {/* ── Document Preview Modal ── */}
      <Modal
        visible={!!previewUri}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewUri(null)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setPreviewUri(null)}
        >
          <View style={styles.modalBox}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setPreviewUri(null)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <MaterialCommunityIcons name="close-circle" size={wScale(26)} color="#fff" />
            </TouchableOpacity>
            {previewUri && (
              <Image source={{ uri: previewUri }} style={styles.modalImg} resizeMode="contain" />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  main: { paddingVertical: hScale(10) },
  card: {
    marginBottom: hScale(10),
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 3,
    marginHorizontal: hScale(10),
    overflow: 'hidden',
  },
  headerRow: {
    paddingHorizontal: wScale(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hScale(8),
  },
  cardContent: {
    paddingHorizontal: wScale(10),
    borderWidth: 1,
    borderBottomEndRadius: 8,
    borderBottomLeftRadius: 8,
    paddingBottom: hScale(10),
    borderTopWidth: 0,
  },
  loginTimeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hScale(8),
    alignItems: 'center',
  },
  label: { fontSize: 11, color: '#444' },
  valueText: { fontSize: wScale(13), color: '#000', fontWeight: '700' },
  timeVabel: { fontSize: wScale(13), color: '#000', fontWeight: 'bold' },
  timeLabel: { fontSize: wScale(10), color: '#000', opacity: 0.8 },
  typeI: { flexDirection: 'row', alignItems: 'center' },
  addressText: { paddingVertical: hScale(8) },
  rightContainer: { alignItems: 'flex-end', marginLeft: 10 },
  sectionTitle: { fontSize: wScale(12.5), fontWeight: '800', marginTop: hScale(10), marginBottom: hScale(2) },

  // ── Doc row button ──
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wScale(4),
    borderWidth: 1,
    borderRadius: wScale(20),
    paddingHorizontal: wScale(10),
    paddingVertical: hScale(4),
  },
  viewBtnText: { fontSize: wScale(11.5), fontWeight: '700' },

  // ── Preview modal ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBox: {
    width: '85%',
    alignItems: 'center',
  },
  modalCloseBtn: {
    alignSelf: 'flex-end',
    marginBottom: hScale(8),
  },
  modalImg: {
    width: '100%',
    height: hScale(320),
    borderRadius: 10,
    backgroundColor: '#222',
  },
});

export default ClientApplicationStatusScreen;