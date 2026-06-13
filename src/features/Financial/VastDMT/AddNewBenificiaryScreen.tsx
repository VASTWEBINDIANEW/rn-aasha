import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  ActivityIndicator, StyleSheet, ToastAndroid, Alert,
  Button, Modal, Platform
} from 'react-native';
import { translate } from '../../../utils/languageUtils/I18n';
import { BottomSheet } from '@rneui/base';
import { FlashList } from '@shopify/flash-list';
import { SCREEN_HEIGHT, SCREEN_WIDTH, hScale, wScale } from '../../../utils/styles/dimensions';
import { colors } from '../../../utils/styles/theme';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import FlotingInput from '../../drawer/securityPages/FlotingInput';
import OnelineDropdownSvg from '../../drawer/svgimgcomponents/simpledropdown';
import DynamicButton from '../../drawer/button/DynamicButton';
import ClosseModalSvg2 from '../../drawer/svgimgcomponents/ClosseModal2';
import { useNavigation } from '@react-navigation/native';
import { useDeviceInfoHook } from '../../../utils/hooks/useDeviceInfoHook';
import CloseSvg from '../../drawer/svgimgcomponents/CloseSvg';
import ShowLoader from '../../../components/ShowLoder';
import { useLocationHook } from '../../../hooks/useLocationHook';
import { onReceiveNotification2 } from '../../../utils/NotificationService';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const AddNewBenificiaryScreen = ({ no, Name2, Name, remid, onPress, onPress2 }) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const {} = useLocationHook();
  const { userId } = useSelector((state: RootState) => state.userInfo);

  const [name, setName] = useState(Name2);
  const [senderNo, setsenderNo] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [reEnterAccountNumber, setReEnterAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState(translate(''));
  const [isLoading, setIsLoading] = useState(false);
  const [validate, setValidate] = useState(false);
  const [bankList, setBanklist] = useState([]);
  const [isBank, setIsBank] = useState(false);
  const [bank, setBank] = useState(translate('Select Your Bank'));
  const [UnqID, setUnqiD] = useState('');
  const [isSkip, setSkip] = useState(false);
  const [GoodMark, setGoodMark] = useState(false);
  const [GoodMark2, setGoodMark2] = useState(false);
  const [isR, setIsR] = useState(false);
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [verificationDetails, setVerificationDetails] = useState(null);
  const [isload, setIsload] = useState(false);

  const filteredData = (bankList).filter(item =>
    item["bank_name"].toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlepress = () => { onPress(); };
  const handlepress2 = () => { onPress2(); };

  const Radiant = (res) => {
    if (res.RESULT == '1') {
      Alert.alert('Failed', res['ADDINFO'], [{ text: 'OK', onPress: () => {} }]);
    } else {
      Alert.alert('Successfully', res['ADDINFO'], [{ text: 'OK', onPress: () => { navigation.goBack(); } }]);
    }
  };

  const vast = (res) => {
    if (res['RESULT'] == '1') {
      setGoodMark2(false);
      Alert.alert('Failed', res['ADDINFO'], [{ text: 'OK', onPress: () => { navigation.goBack(); } }]);
    } else if (res['RESULT'] == '0') {
      setGoodMark2(true);
      Alert.alert('Success', res['ADDINFO']['status'], [{
        text: '', onPress: () => {
          setModalVisible(false);
          handlepress2();
        }
      }]);
      const mockNotification = {
        notification: {
          title: `${res['ADDINFO']['status'] === 'Transaction Successful' ? 'Bank account is linked' : ''}`,
          body: `${res['ADDINFO']['status']}- \nDetails\nName :${name}\nAcc No :${accountNumber} \nMo : ${senderNo}`,
        },
      };
      onReceiveNotification2(mockNotification);
    } else {
      Alert.alert('Error', '', [{ text: 'OK', onPress: () => {} }]);
    }
  };

  const removeUnwantedWords = (text) => {
    let cleanedText = text.replace(/\bs\/o\b/gi, '').replace(/\bw\/o\b/gi, '');
    return cleanedText.trim();
  };

  useEffect(() => {
    setIsR(Name === 'RADIANT');
  }, []);

  const handleSaveAccount = async (bename) => {
    setIsload(true);
    const namee = await removeUnwantedWords(bename);
    if (accountNumber === reEnterAccountNumber) {
      setGoodMark2(true);
      setIsLoading(true);
      setValidate(false);
      const baseUrl = `Money/api/Radiant/AddBeneficiary?sender_number=${no}&Name=${namee}&Accountnumber=${accountNumber}&bankname=${bank}&Ifsccode=${ifscCode}`;
      const url = `${APP_URLS.saveBank}Name=${bename}&AccountNo=${accountNumber}&IFSC=${ifscCode}&Mobile=''&SenderNo=${no}&remitterid=${remid}&ifscoriginal=${ifscCode}`;
      try {
        const res = isR ? await get({ url: baseUrl }) : await post({ url });
        if (Name === 'RADIANT') { Radiant(res); } else { vast(res); }
      } catch (error) {
        console.error('Error saving account:', error);
      } finally {
        setIsload(false);
        setIsLoading(false);
      }
    } else {
      setValidate(true);
    }
  };

  const { get, post } = useAxiosHook();

  useEffect(() => {
    setsenderNo(no);
    getBanks();
    getGenUniqueId();
  }, []);

  const getBanks = async () => {
    try {
      const url = `${APP_URLS.MasterIfsc}`;
      const res = await get({ url });
      setBanklist(res['data']);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const getGenUniqueId = async () => {
    try {
      const url = `${APP_URLS.getGenIMPSUniqueId}`;
      const res = await get({ url });
      setUnqiD(res.Message);
      if (res['Response'] == 'Failed') {
        ToastAndroid.showWithGravity(res['Message'], ToastAndroid.SHORT, ToastAndroid.BOTTOM);
      } else {
        ToastAndroid.showWithGravity(res['Response'], ToastAndroid.SHORT, ToastAndroid.BOTTOM);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const bankStatus = async (bankname) => {
    try {
      const url = `${APP_URLS.getBankDown}${bankname}`;
      await get({ url });
    } catch (error) {}
  };

  const { getNetworkCarrier, getMobileDeviceId, getMobileIp } = useDeviceInfoHook();

  const verifyAcc = async (mb, iff, cd, bno, mal, sk, pi, kk, bankName, kyc, uniqueid) => {
    setIsload(true);
    try {
      const Model = await getMobileDeviceId();
      const url = `${APP_URLS.verifybankACC}mb=${mb}&iff=${iff}&cd=${Model}&bno=${bno}&mal=${mal}&sk=${sk}&pi=${Model}&kk=${kk}&bankName=${bankName}&kyc=''&uniqueid=${uniqueid}`;
      const res = await post({ url });
      setIsLoading(false);
      if (res.RESULT === '1') {
        setGoodMark(false);
        Alert.alert('Message',
          res['ADDINFO'] || res['ADDINFO'].statuscode === 'LOW' ? res['ADDINFO'].status : 'try after sometime !!!',
          [{ text: 'OK', onPress: () => {} }]);
        setIsLoading(false);
      } else if (res.RESULT === '0') {
        const addinfo = res.ADDINFO;
        const bename = addinfo["data"]["benename"];
        const verify = addinfo["data"]["verification_status"];
        const bankrefno = addinfo["data"]["bankrefno"];
        setName(bename);
        const mockNotification = {
          notification: {
            title: verify,
            body: `A/C verified for money transfer status is ${verify}, name : ${bename} `,
          },
        };
        onReceiveNotification2(mockNotification);
        setVerificationDetails({ name: bename, status: verify, bankRefNo: bankrefno });
        setModalVisible(true);
        setGoodMark(verify === "VERIFIED");
      } else {
        setIsLoading(false);
        Alert.alert('Failed', res['ADDINFO'], [{ text: 'OK', onPress: () => {} }]);
      }
      setIsload(false);
    } catch (error) {
      console.error(error);
    }
  };

  const ReverifyAcc = async (mb, iff, cd, bno, mal, sk, pi, kk, bankName, kyc, uniqueid) => {
    try {
      const res = await post({ url: `${APP_URLS.reVerifybankACC}mb=${mb}&iff=${iff}&cd=${cd}&bno=${bno}&mal=${mal}&sk=${sk}&pi=${pi}&kk=${kk}&bankName=${bankName}&kyc=${kyc}&uniqueid=${uniqueid}` });
      if (res['RESULT'] === '1') {
        setGoodMark(false);
        setIsLoading(false);
        Alert.alert('', res['ADDINFO'], [{ text: 'OK', onPress: () => {} }]);
      } else if (res['RESULT'] === '0') {
        var bename = res["ADDINFO"]["data"]["benename"];
        var verify = res["ADDINFO"]["data"]["verification_status"];
        var local = res["ADDINFO"]["Local"];
        if (verify == "VERIFIED") {
          setGoodMark(true);
        } else {
          setGoodMark(false);
          Alert.alert('', res['ADDINFO'], [
            { text: 'OK', onPress: () => {} },
            { text: 'Re-verify', onPress: () => { ReverifyAcc(senderNo, ifscCode, '', accountNumber, userId, UnqID, '57bea5094fd9082d', 'RJUPM12131', bank, 'kyc', userId); } }
          ]);
        }
        if (local == "Local") {
          Alert.alert('', res['ADDINFO'], [
            { text: 'OK', onPress: () => {} },
            { text: 'Re-verify', onPress: () => { ReverifyAcc(senderNo, ifscCode, '', accountNumber, userId, UnqID, '57bea5094fd9082d', 'RJUPM12131', bank, 'kyc', UnqID); } }
          ]);
        }
      } else {
        setIsLoading(false);
        Alert.alert('Failed', res['ADDINFO'], [{ text: 'OK', onPress: () => {} }]);
      }
    } catch (error) {}
  };

  const Banks = () => (
    <FlashList
      keyboardShouldPersistTaps="handled"
      style={{ marginBottom: wScale(20), marginHorizontal: wScale(8) }}
      data={filteredData}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.bankItem}
          onPress={async () => {
            setIfscCode(item['branch_ifsc']);
            setBank(item['bank_name']);
            setIsBank(false);
            bankStatus(item['bank_name']);
            setSearchQuery('');
          }}>
          <View style={styles.bankItemInner}>
            <View style={[styles.bankIcon, { backgroundColor: `${colorConfig.secondaryColor}18` }]}>
              <Text style={[styles.bankIconText, { color: colorConfig.secondaryColor }]}>
                {item['bank_name']?.charAt(0)?.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.bankName}>{item['bank_name']}</Text>
          </View>
        </TouchableOpacity>
      )}
      estimatedItemSize={64}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );

  return (
    <View style={[styles.main, { borderColor: `${colorConfig.secondaryColor}30` }]}>
      {isload && <ShowLoader />}

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colorConfig.secondaryColor }]}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{translate("Add_Beneficiary")}</Text>
          <Text style={styles.headerSubtitle}>{no}</Text>
        </View>
        <TouchableOpacity onPress={handlepress} style={styles.closeBtn} activeOpacity={0.8}>
          <CloseSvg />
        </TouchableOpacity>
      </View>

      {/* Form */}
      <KeyboardAwareScrollView
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingBottom: hScale(10), justifyContent: 'space-between' }}
        enableAutomaticScroll={true}
        extraHeight={100}
      >
        <View style={styles.formContainer}>

          {/* Step indicator */}
          <View style={styles.stepsRow}>
            {['Account Info', 'Select Bank', 'Verify'].map((step, i) => (
              <View key={i} style={styles.stepItem}>
                <View style={[
                  styles.stepCircle,
                  { backgroundColor: i === 0 ? colorConfig.secondaryColor : '#E5E7EB' }
                ]}>
                  <Text style={[styles.stepNum, { color: i === 0 ? '#fff' : '#9CA3AF' }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.stepLabel, { color: i === 0 ? colorConfig.secondaryColor : '#9CA3AF' }]}>{step}</Text>
              </View>
            ))}
          </View>

          {/* Section: Beneficiary Details */}
          <Text style={[styles.sectionLabel, { color: colorConfig.secondaryColor }]}>
            Beneficiary Details
          </Text>

          <View style={styles.inputCard}>
            <FlotingInput
              label={'Name'}
              value={name}
              onChangeTextCallback={text => setName(text)}
            />
            <View style={styles.divider} />
            <FlotingInput
              label={'Account Number'}
              keyboardType="number-pad"
              value={accountNumber}
              onChangeTextCallback={text => setAccountNumber(text)}
            />
            <View style={styles.divider} />
            <FlotingInput
              label={translate("Re-Enter Account Number")}
              keyboardType="number-pad"
              value={reEnterAccountNumber}
              onChangeTextCallback={text => setReEnterAccountNumber(text)}
            />
            {validate && (
              <View style={styles.errorBadge}>
                <Text style={styles.errorText}>⚠ {translate("Account_numbers_do_not_match")}</Text>
              </View>
            )}
          </View>

          {/* Section: Bank Details */}
          <Text style={[styles.sectionLabel, { color: colorConfig.secondaryColor }]}>
            Bank Details
          </Text>

          <View style={styles.inputCard}>
            <TouchableOpacity
              onPress={() => {
                if (accountNumber === reEnterAccountNumber && accountNumber.length >= 4) {
                  setIsBank(true);
                } else {
                  setValidate(true);
                }
              }}
              activeOpacity={0.7}
            >
              <View pointerEvents="none">
                <FlotingInput label={bank || 'Select Bank'} editable={false} />
              </View>
              <View style={styles.dropdownIcon}>
                <OnelineDropdownSvg />
              </View>
            </TouchableOpacity>

            <View style={styles.divider} />

            <FlotingInput
              label={'IFSC Code'}
              value={ifscCode}
              onChangeTextCallback={text => setIfscCode(text.toUpperCase())}
            />
          </View>

        </View>
        
        {/* Action Buttons — Verify + Add side by side */}
        <View style={styles.actionSection}>
            {isR ? (
              <TouchableOpacity
                style={[styles.actionBtn, { backgroundColor: colorConfig.secondaryColor }]}
                onPress={() => handleSaveAccount(name)}
                activeOpacity={0.85}
              >
                <Text style={styles.actionBtnText}>RADIANT</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.btnRow}>
                {/* Verify Button */}
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    styles.btnHalf,
                    { backgroundColor: GoodMark ? '#16A34A' : colorConfig.secondaryColor },
                    (!accountNumber || !reEnterAccountNumber || !ifscCode || isLoading) && styles.actionBtnDisabled,
                  ]}
                  onPress={() => {
                    if (accountNumber === reEnterAccountNumber) {
                      verifyAcc(no, ifscCode, '57bea5094fd9082d', accountNumber, userId, UnqID, '57bea5094fd9082d', 'RJUPM12131', bank, 'kyc', UnqID);
                      setIsLoading(true);
                      setValidate(false);
                    } else {
                      setValidate(true);
                    }
                  }}
                  activeOpacity={0.85}
                  disabled={!accountNumber || !reEnterAccountNumber || !ifscCode || isLoading}
                >
                  {isLoading
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.actionBtnText}>{GoodMark ? '✓ Verified' : translate('Verify Account')}</Text>
                  }
                </TouchableOpacity>

                {/* Add / Save Button */}
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    styles.btnHalf,
                    { backgroundColor: colorConfig.secondaryColor },
                    (!accountNumber || !reEnterAccountNumber || !ifscCode || isLoading) && styles.actionBtnDisabled,
                  ]}
                  onPress={() => handleSaveAccount(name)}
                  activeOpacity={0.85}
                  disabled={!accountNumber || !reEnterAccountNumber || !ifscCode || isLoading}
                >
                  {isLoading
                    ? <ActivityIndicator color="#fff" size="small" />
                    : <Text style={styles.actionBtnText}>{GoodMark2 ? '✓ Added' : translate('Save Account')}</Text>
                  }
                </TouchableOpacity>
              </View>
            )}
        </View>
      </KeyboardAwareScrollView>

      {/* Bank Bottom Sheet */}
      <BottomSheet
        animationType="none"
        isVisible={isBank}
        onBackdropPress={() => setIsBank(false)}
      >
        <View style={styles.bottomSheet}>
          <View style={[styles.sheetHeader, { backgroundColor: colorConfig.secondaryColor }]}>
            <View>
              <Text style={styles.sheetTitle}>{translate("Select_Your_Bank")}</Text>
              <Text style={styles.sheetSub}>Choose from the list below</Text>
            </View>
            <TouchableOpacity onPress={() => setIsBank(false)} style={styles.sheetClose}>
              <ClosseModalSvg2 />
            </TouchableOpacity>
          </View>

          <View style={styles.searchWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              placeholder="Search bank..."
              value={searchQuery}
              onChangeText={text => setSearchQuery(text)}
              style={styles.searchInput}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {Banks()}
        </View>
      </BottomSheet>

      {/* Verification Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={[styles.modalHeader, { backgroundColor: colorConfig.secondaryColor }]}>
              <Text style={styles.modalHeaderTitle}>{translate("Verification_Details")}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalCloseBtn}>
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {verificationDetails && (
              <View style={styles.modalBody}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailIcon}>👤</Text>
                  <View>
                    <Text style={styles.detailLabel}>Name</Text>
                    <Text style={styles.detailValue}>{verificationDetails.name}</Text>
                  </View>
                </View>
                <View style={[styles.detailRow, { marginTop: hScale(10) }]}>
                  <Text style={styles.detailIcon}>
                    {verificationDetails.status === 'VERIFIED' ? '✅' : '⚠️'}
                  </Text>
                  <View>
                    <Text style={styles.detailLabel}>Status</Text>
                    <Text style={[
                      styles.detailValue,
                      { color: verificationDetails.status === 'VERIFIED' ? '#16A34A' : '#DC2626' }
                    ]}>{verificationDetails.status}</Text>
                  </View>
                </View>
                <View style={[styles.detailRow, { marginTop: hScale(10) }]}>
                  <Text style={styles.detailIcon}>🏦</Text>
                  <View>
                    <Text style={styles.detailLabel}>Bank Reference No</Text>
                    <Text style={styles.detailValue}>{verificationDetails.bankRefNo}</Text>
                  </View>
                </View>
              </View>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: colorConfig.secondaryColor }]}
                onPress={() => handleSaveAccount(name)}
              >
                <Text style={styles.modalBtnText}>Save Account</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnOutline, { borderColor: colorConfig.secondaryColor }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: colorConfig.secondaryColor }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#F8F9FC',
    borderRadius: wScale(16),
    marginHorizontal: wScale(8),
    marginTop: hScale(8),
    marginBottom: hScale(8),
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wScale(16),
    paddingTop: hScale(12),
    paddingBottom: hScale(10),
  },
  headerLeft: { flex: 1 },
  headerTitle: {
    fontSize: wScale(16),
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.3,
  },
  headerSubtitle: {
    fontSize: wScale(11),
    color: 'rgba(255,255,255,0.75)',
    marginTop: 2,
  },
  closeBtn: {
    width: wScale(32),
    height: wScale(32),
    borderRadius: wScale(16),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContainer: {
    paddingHorizontal: wScale(12),
    paddingTop: hScale(10),
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hScale(12),
    paddingHorizontal: wScale(4),
  },
  stepItem: { alignItems: 'center', flex: 1 },
  stepCircle: {
    width: wScale(24),
    height: wScale(24),
    borderRadius: wScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  stepNum: { fontSize: wScale(11), fontWeight: '700' },
  stepLabel: { fontSize: wScale(9), fontWeight: '500', textAlign: 'center' },
  sectionLabel: {
    fontSize: wScale(11),
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: hScale(6),
    marginLeft: wScale(4),
  },
  inputCard: {
    backgroundColor: '#fff',
    borderRadius: wScale(10),
    paddingHorizontal: wScale(2),
    paddingVertical: hScale(2),
    marginBottom: hScale(10),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F3F7',
    marginHorizontal: wScale(10),
  },
  dropdownIcon: {
    position: 'absolute',
    right: wScale(10),
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  errorBadge: {
    backgroundColor: '#FEF2F2',
    borderRadius: wScale(6),
    paddingHorizontal: wScale(10),
    paddingVertical: hScale(6),
    margin: wScale(8),
    borderLeftWidth: 3,
    borderLeftColor: '#DC2626',
  },
  errorText: {
    color: '#DC2626',
    fontSize: wScale(11),
    fontWeight: '500',
  },
  actionSection: {
    paddingHorizontal: wScale(12),
    paddingBottom: hScale(10),
  },
  btnRow: {
    flexDirection: 'row',
    gap: wScale(8),
  },
  btnHalf: {
    flex: 1,
  },
  actionBtn: {
    borderRadius: wScale(10),
    height: hScale(46),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wScale(16),
    elevation: 2,
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: wScale(14),
    fontWeight: '700',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // Bottom Sheet
  bottomSheet: {
    backgroundColor: '#fff',
    height: SCREEN_HEIGHT / 1.35,
    borderTopLeftRadius: wScale(16),
    borderTopRightRadius: wScale(16),
    overflow: 'hidden',
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wScale(16),
    paddingVertical: hScale(12),
  },
  sheetTitle: {
    fontSize: wScale(15),
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  sheetSub: {
    fontSize: wScale(11),
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  sheetClose: {
    width: wScale(32),
    height: wScale(32),
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: wScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginHorizontal: wScale(12),
    marginVertical: hScale(10),
    borderRadius: wScale(8),
    paddingHorizontal: wScale(10),
  },
  searchIcon: { fontSize: wScale(14), marginRight: wScale(8) },
  searchInput: {
    flex: 1,
    paddingVertical: hScale(8),
    fontSize: wScale(13),
    color: '#111827',
  },
  bankItem: {
    paddingVertical: hScale(2),
  },
  bankItemInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wScale(12),
    paddingVertical: hScale(10),
  },
  bankIcon: {
    width: wScale(36),
    height: wScale(36),
    borderRadius: wScale(18),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wScale(12),
  },
  bankIconText: {
    fontSize: wScale(15),
    fontWeight: '700',
  },
  bankName: {
    fontSize: wScale(13),
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: wScale(60),
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: wScale(16),
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: wScale(16),
    overflow: 'hidden',
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wScale(16),
    paddingVertical: hScale(14),
  },
  modalHeaderTitle: {
    fontSize: wScale(15),
    fontWeight: '700',
    color: '#fff',
  },
  modalCloseBtn: {
    width: wScale(28),
    height: wScale(28),
    borderRadius: wScale(14),
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: {
    color: '#fff',
    fontSize: wScale(12),
    fontWeight: '700',
  },
  modalBody: {
    paddingHorizontal: wScale(20),
    paddingTop: hScale(16),
    paddingBottom: hScale(8),
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: wScale(8),
    padding: wScale(12),
  },
  detailIcon: { fontSize: wScale(20), marginRight: wScale(12) },
  detailLabel: {
    fontSize: wScale(10),
    color: '#9CA3AF',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: wScale(13),
    color: '#111827',
    fontWeight: '700',
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: wScale(8),
    paddingHorizontal: wScale(16),
    paddingVertical: hScale(16),
  },
  modalBtn: {
    flex: 1,
    height: hScale(44),
    borderRadius: wScale(8),
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  modalBtnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    elevation: 0,
  },
  modalBtnText: {
    color: '#fff',
    fontSize: wScale(13),
    fontWeight: '700',
  },
});

export default AddNewBenificiaryScreen;