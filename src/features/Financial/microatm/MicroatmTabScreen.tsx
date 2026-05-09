import React, { useCallback, useEffect, useState } from 'react';
import {
  StyleSheet, View, Text, Alert, ToastAndroid,
  TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { RootState } from '../../../reduxUtils/store';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { colors } from '../../../utils/styles/theme';
import FlotingInput from '../../drawer/securityPages/FlotingInput';
import { translate } from '../../../utils/languageUtils/I18n';
import useAxiosHook from '../../../utils/network/AxiosClient';
import uuid from 'react-native-uuid';
import { APP_URLS } from '../../../utils/network/urls';
import { startTransaction } from 'react-native-instantpay-mpos';
import { useSelector } from 'react-redux';
import MicroAtmsvg from '../../drawer/svgimgcomponents/MicroAtmsvg';
import BalancEnqurisvg from '../../drawer/svgimgcomponents/BalancEnqurisvg';
import Upisvg from '../../drawer/svgimgcomponents/Upisvg';
import PurchaseSvg from '../../drawer/svgimgcomponents/PurchaseSvg';
import { decryptData, encrypt } from '../../../utils/encryptionUtils';
import { useDeviceInfoHook } from '../../../utils/hooks/useDeviceInfoHook';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import ShowLoader from '../../../components/ShowLoder';
import { onReceiveNotification2 } from '../../../utils/NotificationService';
import LinearGradient from 'react-native-linear-gradient';

// ─────────────────────────────────────────────────
const enum TRANSACTION_TYPE {
  PURCHASE = 'PURCHASE',
  MICROATM = 'MICROATM',
  BALANCE_ENQUIRY = 'BALANCE_ENQUIRY',
  UPI = 'UPI',
}

type TabKey = 'PURCHASE' | 'MICROATM' | 'BALANCE_ENQUIRY' | 'UPI';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'PURCHASE',        label: 'Purchase'   },
  { key: 'MICROATM',        label: 'Micro ATM'  },
  { key: 'BALANCE_ENQUIRY', label: 'Balance Enq'},
  { key: 'UPI',             label: 'UPI'        },
];

// ─────────────────────────────────────────────────
// Tab Icon
// ─────────────────────────────────────────────────
const TabIcon = ({ tabKey, size = 26 }: { tabKey: TabKey; size?: number }) => {
  switch (tabKey) {
    case 'PURCHASE':        return <PurchaseSvg />;
    case 'MICROATM':        return <MicroAtmsvg />;
    case 'BALANCE_ENQUIRY': return <BalancEnqurisvg />;
    case 'UPI':             return <Upisvg size={size} />;
    default:                return null;
  }
};

// ─────────────────────────────────────────────────
// Custom Tab Selector
// ─────────────────────────────────────────────────
const TabSelector = ({
  activeKey,
  onSelect,
  primaryColor,
  secondaryColor,
}: {
  activeKey: TabKey;
  onSelect: (key: TabKey) => void;
  primaryColor: string;
  secondaryColor: string;
}) => (
  <View style={styles.tabRow}>
    {TABS.map(tab => {
      const isActive = tab.key === activeKey;
      return (
        <TouchableOpacity
          key={tab.key}
          style={[styles.tabItem, isActive && styles.tabItemActive]}
          onPress={() => onSelect(tab.key)}
          activeOpacity={0.8}
        >
          {isActive ? (
            <LinearGradient
              colors={[primaryColor, secondaryColor]}
              style={styles.tabGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <TabIcon tabKey={tab.key} size={22} />
              <Text style={[styles.tabLabelActive]}>{tab.label}</Text>
            </LinearGradient>
          ) : (
            <View style={styles.tabInner}>
              <TabIcon tabKey={tab.key} size={22} />
              <Text style={styles.tabLabel}>{tab.label}</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    })}
  </View>
);

// ─────────────────────────────────────────────────
// Info Card
// ─────────────────────────────────────────────────
const InfoCard = ({ lines }: { lines: string[] }) => (
  <View style={styles.infoCard}>
    {lines.map((line, i) => (
      <View key={i} style={styles.infoRow}>
        <Text style={styles.infoDot}>•</Text>
        <Text style={styles.infoText}>{line}</Text>
      </View>
    ))}
  </View>
);

// ─────────────────────────────────────────────────
// Main Screen
// ─────────────────────────────────────────────────
const MicroatmTabScreen = () => {
  const { colorConfig, userId, Loc_Data } = useSelector((state: RootState) => state.userInfo);
  const { primaryColor, secondaryColor, primaryButtonColor, labelColor } = colorConfig;
  const navigation = useNavigation<any>();

  const { post, get } = useAxiosHook();
  const { getNetworkCarrier, getMobileDeviceId, getMobileIp } = useDeviceInfoHook();

  const [activeTab, setActiveTab]           = useState<TabKey>('PURCHASE');
  const [amount, setAmount]                 = useState('');
  const [isLoading, setIsLoading]           = useState(false);
  const [isTxnLoading, setIsTxnLoading]     = useState(false);
  const [profileData, setProfileData]       = useState<any>({});
  const [loginId, setLoginId]               = useState('');
  const [password, setPassword]             = useState('');
  const [isNewLogin, setIsNewLogin]         = useState(false);
  const [isChangePassword, setIsChangePassword] = useState(false);
  const [uniqueId, setUniqueId]             = useState('');

  const { latitude, longitude } = Loc_Data;

  // ── Tab change: reset amount ──────────────────
  const handleTabSelect = (key: TabKey) => {
    setActiveTab(key);
    setAmount('');
  };

  // ── Data fetch on mount ───────────────────────
  const getData = useCallback(async () => {
    setIsLoading(true);
    try {
      const result2 = await post({ url: 'MICROATM/api/data/MerchantCreateToSubmit' });
      const res     = await get({ url: APP_URLS.getProfile });

      if (res.data) {
        const decrypted = decryptData(res.value1, res.value2, res.data);
        setProfileData(JSON.parse(decrypted));
      }

      ToastAndroid.show(result2.msg, ToastAndroid.SHORT);

      const status = result2.status;
      if (status === true || status === 'Success') {
        const creds = await post({ url: APP_URLS.getCredoCredentials });
        setIsNewLogin(creds.IsNewLogin);
        setLoginId(creds.LoginId);
        setPassword(creds.Password);
      } else if (status === 'StatusCheck') {
        navigation.replace('MAtmStatusCheck');
      } else if (status === 'Device') {
        navigation.replace('RegisterVM30', { deviceSerial: result2.devicesr });
      } else if (status === 'REGISTER') {
        activeMicroATM();
      } else if (['BOTHNOTDONE', 'NOTOK', 'ALLNOTDONE'].includes(status)) {
        navigation.navigate('ServicepurchaseScreen', { typename: 'VM30' });
      } else {
        Alert.alert('Message', result2.msg, [
          { text: 'Go Back', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('getData error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [navigation]);

  useEffect(() => { getData(); }, []);

  // ── Activate Micro ATM ────────────────────────
  const activeMicroATM = async () => {
    try {
      const res = await post({ url: 'MICROATM/api/data/ActiveMicroATM' });
      if (res.status === true || res.status === 'Success') {
        navigation.navigate('MAtmStatusCheck');
      } else {
        Alert.alert('Alert', res.msg, [{ text: 'OK', onPress: () => navigation.goBack() }]);
      }
    } catch (_) {}
  };

  // ── Build Credo options ───────────────────────
  const getOptions = useCallback((id: string) => {
    const pass = isChangePassword ? 'VwiCredo@123' : (isNewLogin ? password : 'VwiCredo@123');
    const base = {
      debugMode: 'true',
      loginId,
      customerRefNo: id,
      loginPassword: pass,
      production: true,
      mobile: profileData.Mobile,
      optional1: id,
    };

    switch (activeTab) {
      case 'BALANCE_ENQUIRY':
        return { ...base, amount: 0,      transactionType: TRANSACTION_TYPE.BALANCE_ENQUIRY };
      case 'PURCHASE':
        return { ...base, amount,         transactionType: TRANSACTION_TYPE.PURCHASE };
      case 'MICROATM':
        return { ...base, amount,         transactionType: TRANSACTION_TYPE.MICROATM };
      case 'UPI':
        return { ...base, amount,         transactionType: TRANSACTION_TYPE.UPI };
    }
  }, [activeTab, amount, isChangePassword, isNewLogin, password, loginId, profileData]);

  // ── Start Credo transaction ───────────────────
  const startCredoTransaction = useCallback(async (id: string) => {
    try {
      const res = await startTransaction(JSON.stringify(getOptions(id)));
      const failed =
        res?.message === 'Login Failed!' ||
        res?.message === 'Request Change Password by User' ||
        res?.status  === 'FAILED';

      if (failed) {
        Alert.alert('Transaction Result',
          `${res.message || ''} (Status: ${res.status || ''})`,
          [{ text: 'OK' }],
          { cancelable: false }
        );
        onReceiveNotification2({
          notification: { title: activeTab, body: res?.message || '' },
        });
      }

      if (res?.message === 'Request Change Password by User' && res?.status === 'SUCCESS') {
        setIsChangePassword(true);
        await startCredoTransaction(id + '1');
      }
    } catch (error) {
      console.error('startCredoTransaction error:', error);
    }
  }, [getOptions, activeTab]);

  // ── API call + start credo ────────────────────
  const transaction = useCallback(async () => {
    if (activeTab !== 'BALANCE_ENQUIRY' && !amount) {
      ToastAndroid.show('Please enter amount', ToastAndroid.SHORT);
      return;
    }

    setIsTxnLoading(true);
    const id = uuid.v4().toString().substring(0, 16);
    setUniqueId(id);

    try {
      const mobileNetwork = await getNetworkCarrier();
      const ipp            = await getMobileIp();
      const Model          = await getMobileDeviceId();

      if (activeTab === 'BALANCE_ENQUIRY') {
        await startCredoTransaction(id);
        return;
      }

      const txnType = activeTab === 'PURCHASE' ? 'cash'
                    : activeTab === 'UPI'      ? 'UPI'
                    :                            'microatm';

      const encryption = await encrypt([
        id, ipp, txnType, Model,
        latitude, longitude, Model,
        'city', 'postcode', mobileNetwork, 'address', amount,
      ]);

      const enc = encryption.encryptedData;
      const e   = (i: number) => encodeURIComponent(enc[i]);

      const url =
        `MICROATM/api/data/Apitransitions` +
        `?Transtionid=${e(0)}&Amount=${parseFloat(amount).toFixed(1)}` +
        `&IPaddressss=${e(1)}&Type=${e(2)}&Devicetoken=${e(3)}` +
        `&Latitude=${e(4)}&Longitude=${e(5)}&ModelNo=${e(6)}` +
        `&City=${e(7)}&PostalCode=${e(8)}&InternetTYPE=${e(9)}` +
        `&Addresss=${e(10)}` +
        `&value1=${encodeURIComponent(encryption.keyEncode)}` +
        `&value2=${encodeURIComponent(encryption.ivEncode)}`;

      const res = await post({ url });

      if (res.Status === 'Success') {
        await startCredoTransaction(id);
      } else {
        Alert.alert('Alert', res.Message, [{ text: 'OK' }]);
      }
    } catch (error) {
      console.error('transaction error:', error);
    } finally {
      setIsTxnLoading(false);
    }
  }, [activeTab, amount, post, latitude, longitude, startCredoTransaction]);

  // ── Tab content ───────────────────────────────
  const renderContent = () => {
    switch (activeTab) {
      case 'PURCHASE':
        return (
          <>
            <FlotingInput
              label={translate('Enter Amount')}
              onChangeTextCallback={setAmount}
              value={amount}
              keyboardType="number-pad"
            />
            <InfoCard lines={[translate('1 CASH'), translate('2 CASH')]} />
          </>
        );
      case 'MICROATM':
        return (
          <>
            <FlotingInput
              label={translate('Enter Amount')}
              onChangeTextCallback={setAmount}
              value={amount}
              keyboardType="number-pad"
            />
            <InfoCard lines={[translate('mratm'), translate('2 CASH')]} />
          </>
        );
      case 'BALANCE_ENQUIRY':
        return (
          <InfoCard lines={[translate('1 CASH')]} />
        );
      case 'UPI':
        return (
          <>
            <FlotingInput
              label={translate('Enter Amount')}
              onChangeTextCallback={setAmount}
              value={amount}
              keyboardType="number-pad"
            />
            <InfoCard lines={[translate('1 CASH')]} />
          </>
        );
    }
  };

  const tabLabel = TABS.find(t => t.key === activeTab)?.label ?? activeTab;

  return (
    <View style={styles.main}>
      {isLoading && <ShowLoader />}

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Page title ── */}
        <LinearGradient
          colors={[primaryColor, secondaryColor]}
          style={styles.headerBanner}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.bannerTitle}>Micro ATM</Text>
          <Text style={styles.bannerSub}>Select transaction type below</Text>
        </LinearGradient>

        {/* ── Tab Selector ── */}
        <View style={styles.tabCard}>
          <TabSelector
            activeKey={activeTab}
            onSelect={handleTabSelect}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
          />
        </View>

        {/* ── Form Card ── */}
        <View style={styles.formCard}>
          {/* Active tab badge */}
          <View style={styles.activeBadgeRow}>
            <View style={[styles.activeBadge, { backgroundColor: `${primaryColor}18` }]}>
              <TabIcon tabKey={activeTab} size={16} />
              <Text style={[styles.activeBadgeText, { color: primaryColor }]}>{tabLabel}</Text>
            </View>
          </View>

          {renderContent()}
        </View>

        {/* ── Transfer Button ── */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={transaction}
          disabled={isTxnLoading}
          style={styles.btnWrapper}
        >
          <LinearGradient
            colors={isTxnLoading ? ['#aaa', '#bbb'] : [primaryColor, secondaryColor]}
            style={styles.gradientBtn}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {isTxnLoading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.btnText}>{tabLabel}</Text>
            }
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: hScale(30) }} />
      </ScrollView>
    </View>
  );
};

// ─────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scroll: {
    paddingBottom: hScale(20),
  },

  // ── Header banner ──
  headerBanner: {
    paddingHorizontal: wScale(20),
    paddingVertical: hScale(18),
  },
  bannerTitle: {
    fontSize: wScale(22),
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  bannerSub: {
    fontSize: wScale(13),
    color: 'rgba(255,255,255,0.8)',
    marginTop: hScale(2),
  },

  // ── Tab card ──
  tabCard: {
    backgroundColor: '#fff',
    marginHorizontal: wScale(12),
    marginTop: hScale(-1),
    borderRadius: wScale(16),
    paddingVertical: hScale(12),
    paddingHorizontal: wScale(10),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  tabRow: {
    flexDirection: 'row',
    gap: wScale(6),
  },
  tabItem: {
    flex: 1,
    borderRadius: wScale(12),
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E8EAF0',
  },
  tabItemActive: {
    borderColor: 'transparent',
  },
  tabGradient: {
    alignItems: 'center',
    paddingVertical: hScale(10),
    gap: hScale(4),
  },
  tabInner: {
    alignItems: 'center',
    paddingVertical: hScale(10),
    gap: hScale(4),
    backgroundColor: '#fff',
  },
  tabLabel: {
    fontSize: wScale(10),
    color: '#888',
    fontWeight: '600',
    textAlign: 'center',
  },
  tabLabelActive: {
    fontSize: wScale(10),
    color: '#fff',
    fontWeight: '700',
    textAlign: 'center',
  },

  // ── Form card ──
  formCard: {
    backgroundColor: '#fff',
    marginHorizontal: wScale(12),
    marginTop: hScale(12),
    borderRadius: wScale(16),
    paddingHorizontal: wScale(16),
    paddingVertical: hScale(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  activeBadgeRow: {
    marginBottom: hScale(14),
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: wScale(10),
    paddingVertical: hScale(5),
    borderRadius: wScale(20),
    gap: wScale(5),
  },
  activeBadgeText: {
    fontSize: wScale(12),
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },

  // ── Info card ──
  infoCard: {
    backgroundColor: '#F8F9FC',
    borderRadius: wScale(10),
    padding: wScale(12),
    marginTop: hScale(10),
    borderLeftWidth: 3,
    borderLeftColor: '#C5CAE9',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hScale(4),
  },
  infoDot: {
    color: '#888',
    fontSize: wScale(14),
    marginRight: wScale(6),
    lineHeight: wScale(20),
  },
  infoText: {
    flex: 1,
    fontSize: wScale(13),
    color: colors.black75,
    lineHeight: wScale(20),
  },

  // ── Button ──
  btnWrapper: {
    marginHorizontal: wScale(12),
    marginTop: hScale(18),
    borderRadius: wScale(14),
    overflow: 'hidden',
  },
  gradientBtn: {
    paddingVertical: hScale(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontSize: wScale(16),
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default MicroatmTabScreen;