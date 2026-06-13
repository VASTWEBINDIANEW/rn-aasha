import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, ActivityIndicator, StyleSheet, ToastAndroid,
  TouchableOpacity, Alert, ScrollView, Keyboard
} from 'react-native';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { translate } from '../../../utils/languageUtils/I18n';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import { useFocusEffect } from '@react-navigation/native';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import DynamicButton from '../../drawer/button/DynamicButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import LinearGradient from 'react-native-linear-gradient';
import { FlashList } from '@shopify/flash-list';
import { SvgXml } from 'react-native-svg';
import { colors } from '../../../utils/styles/theme';
import NumberRegisterScreen from './RegisternNewNumber';
import { BottomSheet } from '@rneui/base';
import AddNewBenificiaryScreen from './AddNewBenificiaryScreen';
import ShowLoader from '../../../components/ShowLoder';

const GetBenifiaryScreen = () => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const EditIcon = ` 
 <?xml version="1.0" encoding="UTF-8"?>
<svg version="1.1" viewBox="0 0 2048 2048" width="1280" fill="#fff" height="1280" xmlns="http://www.w3.org/2000/svg">
<path transform="translate(674,170)" d="m0 0h18l15 3 16 7 14 10 13 13 9 14 4 8 4 13 1 5v26l-4 15-8 16-9 12-7 8-7 6-184 184 1159 1 20 2 16 5 13 7 10 8 7 7 9 14 5 11 4 18v28l-3 14-5 13-6 11-11 13-14 10-14 6-17 4-9 1h-1164l7 8 188 188 11 14 9 17 4 16v25l-4 15-8 16-9 13-9 9-14 10-13 6-11 3-7 1h-23l-14-3-16-8-11-8-358-358-6-10-7-15-2-7-1-8v-18l3-16 4-9 8-16 9-9 1-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2l2-4h2l2-4h2l2-4h2l2-4h2l2-4h2l2-4h2v-2l8-7 14-10 16-7z"/>
<path transform="translate(1360,1023)" d="m0 0h10l15 2 14 5 12 7 10 8 10 9 339 339v2h2l8 10 4 9 6 20 2 8v25l-3 10-9 19-9 11-349 349-12 9-11 6-15 5-12 2h-14l-17-3-12-5-12-7-12-11-9-10-9-15-6-16-2-14v-9l2-14 4-13 5-10 7-11 7-7 7-8 159-159h2l2-4 23-23h2v-2l-1168-1-14-2-15-5-14-8-13-12-7-10-8-16-4-17-1-9v-12l2-16 5-16 7-13 8-10 7-7 14-9 11-5 18-4h994l172-1 6 1-2-4-198-198-9-13-7-15-3-12-1-8v-11l3-16 4-12 8-14 7-9 11-11 15-10 15-6 9-2z"/>
</svg>
  `;
  const [sendernum, setSendernum] = useState('');
  const [onTap, setOnTap] = useState(false);
  const [onTap1, setOnTap1] = useState(false);
  const [nxtbtn, setNxtbtn] = useState(false);
  const [banklist, setBanklist] = useState([]);
  const [remid, setRemid] = useState('');
  const { post, get } = useAxiosHook();
  const [isLoading, setisLoading] = useState(true);
  const navigation = useNavigation<any>();
  const [nodata, setnodata] = useState(false);
  const [accHolder, setAccHolder] = useState('')
  const [bankname, setBankName] = useState('')
  const [ACCno, setAccNo] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [editable, setEditable] = useState(false);
  const [kyc, setkyc] = useState(false);
  const [remitter, setremitter] = useState(null);
  const [isTXNP1, setTXNP1] = useState('');
  const [addinfo, setAddInfo] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
  const [isload, setIsload] = useState(false)
  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [unqid, setUnqiD] = useState('');

  useEffect(() => {
    getGenUniqueId();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // setBanklist([])
    }, [])
  );

  useEffect(() => {
    filterData(searchText);
  }, [searchText, banklist]);

  const checksendernumber = async (number) => {
    setIsload(true);
    setisLoading(true);

    try {
      const url = `${APP_URLS.getCheckSenderNo}${number}`;
      const res = await get({ url: url });
      const addinfo = res['ADDINFO'];
      setAddInfo(addinfo);

      if (res) {
        setisLoading(false);
        const status = addinfo?.statuscode;
        setTXNP1(status);
        if (status === "TXN") {
          setremitter(addinfo?.data?.remitter);
          setkyc(addinfo?.data?.remitter.kycdone);

          const beneficiary = addinfo?.data?.beneficiary || [];
          const remid = addinfo?.data?.remitter?.id || '';
          setRemid(remid);
          await setBanklist(beneficiary);

          if (beneficiary.length === 0) {
            setisLoading(false);
            setnodata(true);
            setIsVisible2(banklist.length === 0);
          } else {
            setnodata(false);
          }
        } else if (status === "RNF" || status === "NUMBEROTP" || status === "AADHAROTP") {
          setIsVisible(status === 'RNF' || status === 'NUMBEROTP' || status === "AADHAROTP");

          if (status === "RNF" || status === "NUMBEROTP" || status === "AADHAROTP") {
            Alert.alert(
              status === "AADHAROTP" ? 'Aadhar Verification' : "User does not exist",
              "",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: status === "AADHAROTP" ? 'Continue Aadhar Verification ' : "Register",
                  onPress: () => setIsVisible(status === 'RNF' || status === 'NUMBEROTP')
                },
              ],
              { cancelable: false }
            );
          }
        } else if (status === 'ERR') {
          ToastAndroid.showWithGravity(addinfo, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        }
      } else if (res?.RESULT === '1') {
        ToastAndroid.showWithGravity(addinfo, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        setisLoading(false);
      }
      setOnTap1(false);
      setOnTap(true);
      setIsload(false);
    } catch (error) {
      setisLoading(false);
      setIsload(false);
      console.error('Error:', error);
    }
  };

  const getGenUniqueId = async () => {
    try {
      const url = `${APP_URLS.getGenIMPSUniqueId}`
      const res = await get({ url: url });
      setUnqiD(res['Message']);
      setisLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleNextButtonPress = () => {
    if (onTap) {
      setOnTap1(true);
      checksendernumber(sendernum);
      setOnTap1(false);
    }
  };

  const handleImpsPress = async (item) => {
    setIfsc(item['ifsc']);
    setAccHolder(item['name']);
    setAccNo(item['account']);
    setBankName(item['bank']);
    navigation.navigate("toBankScreen", { bankname: item['bank'], ACCno: item['account'], accHolder: item['name'], ifsc: item['ifsc'], mode: 'IMPS', unqid, kyc, senderNo: sendernum, dmttype: 'VASTWEB', id: remid });
  };

  const handleNeftPress = async (item) => {
    setIfsc(item['ifsc']);
    setAccHolder(item['name']);
    setAccNo(item['account']);
    setBankName(item['bank']);
    navigation.navigate("toBankScreen", { bankname: item['bank'], ACCno: item['account'], accHolder: item['name'], ifsc: item['ifsc'], mode: 'NEFT', unqid, dmttype: 'VASTWEB', id: remid });
  };

  const handleDeletePress = async (item) => {
    Alert.alert(
      'Delete Account',
      `Account: ${item.account}\nBank: ${item.bank}\nName: ${item.name}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setisLoading(true);
            try {
              const res = await post({
                url: `${APP_URLS.bankbenDelete}mobile=${item['mobile']}&ifsc=${item['ifsc']}&code&remitterid=${remid}&beneficiaryid=${item['id']}`,
              });
              if (res['RESULT'] === '1') {
                ToastAndroid.showWithGravity(res['ADDINFO'], ToastAndroid.SHORT, ToastAndroid.BOTTOM);
              } else {
                checksendernumber(sendernum);
              }
            } catch (error) {
              console.log(error);
            } finally {
              setisLoading(false);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const toggleEditable = () => setEditable(!editable);

  const filterData = (text) => {
    if (!text.trim()) {
      setFilteredData(banklist);
    } else {
      const filtered = banklist.filter(item =>
        item.name?.toLowerCase().includes(text.toLowerCase()) ||
        item.account?.toString().includes(text)
      );
      setFilteredData(filtered);
    }
  };

  const BeneficiaryList = () => {
    return (
      <FlashList
        data={filteredData}
        keyExtractor={(item, index) => item.id || index.toString()}
        estimatedItemSize={140}
        contentContainerStyle={{ paddingHorizontal: wScale(10), paddingVertical: hScale(8) }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            {item.isbankdown && (
              <View style={styles.warningBanner}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.noteText} numberOfLines={1}>
                  {translate("Note_Currently_the_beneficiary_banks_server_is_down_or_busy_please_try_after_sometime")}
                </Text>
              </View>
            )}

            <View style={styles.cardTop}>
              <View style={[styles.avatar, { backgroundColor: `${colorConfig.secondaryColor}15` }]}>
                <Text style={[styles.avatarText, { color: colorConfig.secondaryColor }]}>
                  {item.name?.charAt(0)?.toUpperCase() ?? '?'}
                </Text>
              </View>
              <View style={styles.cardTopInfo}>
                <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
                <View style={styles.ifscBadge}>
                  <Text style={styles.ifscLabel}>IFSC: </Text>
                  <Text style={styles.ifscValue}>{item.ifsc}</Text>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoGrid}>
              <View style={styles.infoCell}>
                <Text style={styles.cellLabel}>Bank</Text>
                <Text style={styles.cellValue} numberOfLines={1}>{item.bank}</Text>
              </View>
              <View style={styles.infoCellDivider} />
              <View style={[styles.infoCell, { alignItems: 'flex-end' }]}>
                <Text style={styles.cellLabel}>Account</Text>
                <Text style={styles.cellValue} numberOfLines={1}>{item.account}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.btnRow}>
              <TouchableOpacity style={[styles.actionChip, { backgroundColor: '#1D6FE8' }]} onPress={() => handleImpsPress(item)} activeOpacity={0.8}>
                <Text style={styles.chipText}>IMPS</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionChip, { backgroundColor: '#16A34A' }]} onPress={() => handleNeftPress(item)} activeOpacity={0.8}>
                <Text style={styles.chipText}>NEFT</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
              <TouchableOpacity style={[styles.actionChip, styles.deleteChip]} onPress={() => handleDeletePress(item)} activeOpacity={0.8}>
                <Text style={styles.deleteChipText}>Del</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    );
  };

  return (
    // Main Container with flex: 1 (Prevents whole page scrolling)
    <View style={styles.main}>
      {isload && <ShowLoader />}
      
      {/* ── TOP SECTION (Fixed/Pinned) ── */}
      <LinearGradient 
        colors={[colorConfig.primaryColor, colorConfig.secondaryColor]} 
        style={styles.headerGradient}
      >
        <View style={styles.headerContainer}>
          {sendernum.length === 10 && (
            <TextInput
              placeholder="Search Name or Account"
              value={searchText}
              onChangeText={setSearchText}
              style={styles.compactInput}
              placeholderTextColor="#666"
            />
          )}

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder='Enter Remitter Number'
              placeholderTextColor="#666"
              style={styles.compactInput}
              maxLength={10}
              keyboardType="number-pad"
              value={sendernum}
              onChangeText={text => {
                setSendernum(text);
                if (text.length === 10) {
                  setNxtbtn(true);
                  setOnTap(false);
                  setOnTap1(true);
                  checksendernumber(text);
                  Keyboard.dismiss();
                } else {
                  setNxtbtn(false);
                  setOnTap(true);
                  setOnTap1(false);
                }
              }}
            />
            {banklist.length > 0 && (
              <TouchableOpacity style={styles.editBtn} onPress={toggleEditable}>
                <SvgXml xml={EditIcon} width={wScale(22)} height={wScale(22)} />
              </TouchableOpacity>
            )}
          </View>

          {remitter !== null && (
            <View style={styles.limitCard}>
              <View style={styles.limitcolum}>
                <Text style={styles.limitLabel}>Consumed</Text>
                <Text style={styles.limitValue}>{remitter.consumedlimit}</Text>
              </View>
              <View style={styles.limitDivider} />
              <View style={[styles.limitcolum, { alignItems: 'center' }]}>
                <Text style={styles.limitLabel}>Remaining</Text>
                <Text style={styles.limitValue}>{remitter.remaininglimit}</Text>
              </View>
              <View style={styles.limitDivider} />
              <View style={[styles.limitcolum, { alignItems: 'flex-end' }]}>
                <Text style={styles.limitLabel}>Per TXN</Text>
                <Text style={styles.limitValue}>{remitter.perm_txn_limit}</Text>
              </View>
            </View>
          )}

          {isTXNP1 === 'TXN' && (
            <DynamicButton
              title={onTap1 ? <ActivityIndicator size={'small'} color={colorConfig.labelColor} /> : banklist.length === 0 ? "Next" : "Add Account"}
              disabled={!nxtbtn}
              buttonStyle={styles.compactBtn}
              onPress={() => {
                if (banklist.length === 0) handleNextButtonPress();
                else setIsVisible2(true);
              }}
            />
          )}
        </View>
      </LinearGradient>

      {/* ── BOTTOM SECTION (Takes remaining space) ── */}
      <View style={styles.contentArea}>
        {banklist.length === 0 ? (
          <ScrollView contentContainerStyle={styles.noticeScroll}>
            <View style={styles.noticeCard}>
              <Text style={styles.noticeTitle}>{translate("Very_Important_Notice")}</Text>
              {[1, 2, 3, 4, 5, 6].map(num => (
                <View key={num} style={styles.noticeRow}>
                  <View style={styles.bulletPoint} />
                  <Text style={styles.noticeText}>{translate(`SP${num}`)}</Text>
                </View>
              ))}
            </View>
            {nodata && (
              <View style={styles.noDataBox}>
                <Text style={styles.noDataText}>{translate('No Data Found')}</Text>
                <DynamicButton title='ADD ACC' onPress={() => setIsVisible2(true)} buttonStyle={{marginTop: 10}} />
              </View>
            )}
          </ScrollView>
        ) : (
          /* FlashList renders directly here. It manages its own scroll */
          <BeneficiaryList />
        )}
      </View>

      {/* ── MODALS (Outside Scroll Views) ── */}
      {(addinfo?.statuscode === 'RNF' || addinfo?.statuscode === 'NUMBEROTP' || addinfo?.statuscode === 'AADHAROTP') && (
        <BottomSheet animationType="none" onBackdropPress={() => setIsVisible(false)} isVisible={isVisible}>
          <NumberRegisterScreen
            type={addinfo.statuscode}
            CName={addinfo.Name}
            No={sendernum}
            Name={'VASTWEB'}
            onPress={(v) => setIsVisible(v)}
          />
        </BottomSheet>
      )}

      <BottomSheet animationType="none" onBackdropPress={() => setIsVisible2(false)} isVisible={isVisible2}>
        <AddNewBenificiaryScreen
          Name={''} Name2={''} no={sendernum} remid={''}
          onPress={() => setIsVisible2(false)}
          onPress2={() => {
            setisLoading(true);
            checksendernumber(sendernum);
            setIsVisible2(false);
          }}
        />
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#F3F4F6' },
  
  // ── Header Section ──
  headerGradient: {
    paddingTop: hScale(10),
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    elevation: 4,
    zIndex: 10,
  },
  headerContainer: {
    paddingHorizontal: wScale(12),
    paddingBottom: hScale(10),
  },
  inputWrapper: { position: 'relative', marginBottom: hScale(8) },
  compactInput: {
    backgroundColor: '#fff',
    height: hScale(42),
    borderRadius: 8,
    paddingHorizontal: wScale(12),
    fontSize: wScale(15),
    color: '#333',
    marginBottom: hScale(8),
  },
  editBtn: {
    position: "absolute", right: 0, top: 0,
    height: hScale(42), width: wScale(44),
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: "center", justifyContent: "center",
    borderTopRightRadius: 8, borderBottomRightRadius: 8,
  },
  compactBtn: { height: hScale(40), marginTop: hScale(4) },

  // Limits Card
  limitCard: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8, padding: hScale(8),
    marginBottom: hScale(8), borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)',
  },
  limitcolum: { flex: 1 },
  limitLabel: { fontSize: wScale(10), color: '#eee', textTransform: 'uppercase', marginBottom: 2 },
  limitValue: { fontSize: wScale(13), color: '#fff', fontWeight: 'bold' },
  limitDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 5 },

  // ── Content Area ──
  contentArea: { flex: 1 }, // takes remaining screen space

  // Notice Card
  noticeScroll: { padding: wScale(12) },
  noticeCard: {
    backgroundColor: '#fff', borderRadius: 12,
    padding: wScale(14), elevation: 2, marginBottom: 15,
  },
  noticeTitle: { color: '#E11D48', fontSize: wScale(15), fontWeight: 'bold', marginBottom: hScale(10) },
  noticeRow: { flexDirection: 'row', marginBottom: hScale(6), alignItems: 'flex-start' },
  bulletPoint: { backgroundColor: '#E11D48', borderRadius: 4, width: 6, height: 6, marginRight: 8, marginTop: 6 },
  noticeText: { fontSize: wScale(13), color: '#4B5563', flex: 1, lineHeight: 18 },
  noDataBox: { backgroundColor: '#fff', borderRadius: 12, padding: 15, alignItems: 'center' },
  noDataText: { fontSize: wScale(15), fontWeight: 'bold', color: '#333' },

  // ── List Item (Compact) ──
  itemContainer: {
    backgroundColor: '#fff', borderRadius: 12,
    marginBottom: hScale(10), borderWidth: 1, borderColor: '#E5E7EB',
    elevation: 1, overflow: 'hidden',
  },
  warningBanner: {
    flexDirection: 'row', backgroundColor: '#FEF2F2',
    padding: wScale(8), borderBottomWidth: 1, borderBottomColor: '#FECACA', gap: 6,
  },
  warningIcon: { fontSize: wScale(12) },
  noteText: { fontSize: wScale(11), color: '#DC2626', flex: 1 },
  cardTop: { flexDirection: 'row', padding: wScale(12), alignItems: 'center', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: wScale(16), fontWeight: 'bold' },
  cardTopInfo: { flex: 1 },
  nameText: { fontSize: wScale(14), fontWeight: '700', color: '#1F2937' },
  ifscBadge: { flexDirection: 'row', marginTop: 2 },
  ifscLabel: { fontSize: wScale(10), color: '#9CA3AF' },
  ifscValue: { fontSize: wScale(11), color: '#4B5563', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#F3F4F6' },
  infoGrid: { flexDirection: 'row', paddingHorizontal: wScale(12), paddingVertical: hScale(8) },
  infoCell: { flex: 1 },
  infoCellDivider: { width: 1, backgroundColor: '#E5E7EB', marginHorizontal: 10 },
  cellLabel: { fontSize: wScale(10), color: '#9CA3AF', marginBottom: 2 },
  cellValue: { fontSize: wScale(12), color: '#1F2937', fontWeight: '600' },
  btnRow: { flexDirection: 'row', padding: wScale(10), gap: 8 },
  actionChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 6, justifyContent: 'center' },
  chipText: { color: '#fff', fontSize: wScale(11), fontWeight: 'bold' },
  deleteChip: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA' },
  deleteChipText: { color: '#DC2626', fontSize: wScale(11), fontWeight: 'bold' },
});

export default GetBenifiaryScreen;