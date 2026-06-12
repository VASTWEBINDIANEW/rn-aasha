import { BottomSheet } from '@rneui/themed';
import React, { useCallback } from 'react';
import { Image, Text, TouchableOpacity, View, StyleSheet, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../reduxUtils/store';
import { hScale, wScale } from '../utils/styles/dimensions';
import { FlashList } from '@shopify/flash-list';
import NoDatafound from '../features/drawer/svgimgcomponents/Nodatafound';
import ClosseModalSvg2 from '../features/drawer/svgimgcomponents/ClosseModal2';
import { translate } from '../utils/languageUtils/I18n';
import { IMAGE_BASE_URL } from '../utils/network/urls';
import FastImage from 'react-native-fast-image';

// ─── Operator Image Map ───────────────────────────────────────────────────────

const OPERATOR_IMAGES: Record<string, any> = {
  JIO: require('.././utils/svgUtils/JIO.png'),
  'Jio Lite': require('.././utils/svgUtils/JIO.png'),
  Vodafone: require('.././utils/svgUtils/VI.png'),
  Vodaidea: require('.././utils/svgUtils/VI.png'),
  Airtel: require('.././utils/svgUtils/Airtel.png'),
  'Airtel Pre On Post': require('.././utils/svgUtils/Airtel.png'),
  BSNL: require('.././utils/svgUtils/BSNL.png'),
};

const getOperatorImage = (name: string) =>
  OPERATOR_IMAGES[name] ?? require('.././utils/svgUtils/exclamation-mark.png');

// ─── Status Config ────────────────────────────────────────────────────────────
const getOperatorImageUrl = (name: string) => {
  if (!name) {return `${IMAGE_BASE_URL}exclamation-mark.png`;}

  let fileName = '';
  const n = name.toUpperCase();

  // Aapki file list ke hisaab se mapping
  if (n.includes('JIO')) {fileName = 'JIO.png';}
  else if (n.includes('AIRTEL')) {fileName = 'Airtel.png';}
  else if (n.includes('VI') || n.includes('VODA')) {fileName = 'VI.png';}
  else if (n.includes('BSNL')) {fileName = 'BSNL.png';}
  else if (n.includes('TATA')) {fileName = 'TataPlay.png';}
  else if (n.includes('DISH')) {fileName = 'DishTV.png';}
  else if (n.includes('SUN')) {fileName = 'SunDirect.png';}
  else {fileName = 'exclamation-mark.png';} // Default fallback

  return {
    uri: `${IMAGE_BASE_URL}${fileName}`,
    priority: FastImage.priority.high,
    cache: FastImage.cacheControl.immutable,
  };
};
const STATUS_CONFIG: Record<string, { color: string; bg: string; dot: string }> = {
  SUCCESS: { color: '#15803D', bg: '#DCFCE7', dot: '#22C55E' },
  FAILED:  { color: '#B91C1C', bg: '#FEE2E2', dot: '#EF4444' },
};

const getStatusConfig = (status: string) =>
  STATUS_CONFIG[status] ?? { color: '#92400E', bg: '#FEF3C7', dot: '#F59E0B' };

// ─── Transaction Item ─────────────────────────────────────────────────────────

const TransactionItem = React.memo(({ item, index, themeColor }: { item: any; index: number; themeColor: string }) => {
  const status = item.Status ?? '';
  const { color, bg, dot } = getStatusConfig(status);
  const isLast = index === 4;

  return (
    <View style={[styles.itemRow, !isLast && styles.itemDivider]}>
      {/* Operator Logo */}
      <View style={[styles.logoWrap, { backgroundColor: `${themeColor}12` }]}>
<FastImage
  source={getOperatorImageUrl(item.Operator_name)}
  style={styles.logo}
  resizeMode={FastImage.resizeMode.contain}
/>     

 </View>

      {/* Info */}
      <View style={styles.infoCol}>
        <Text style={styles.operatorName} numberOfLines={1}>
          {item.Operator_name}
        </Text>
        <Text style={styles.mobileNum}>{item.Recharge_number}</Text>
        <Text style={styles.dateText}>{item.Reqesttime}</Text>
      </View>

      {/* Right Side */}
      <View style={styles.rightCol}>
        <Text style={styles.amount}>₹{item.Recharge_amount}</Text>
        <View style={[styles.statusBadge, { backgroundColor: bg }]}>
          <View style={[styles.statusDot, { backgroundColor: dot }]} />
          <Text style={[styles.statusText, { color }]}>{status}</Text>
        </View>
      </View>
    </View>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  isModalVisible: boolean;
  setModalVisible: (v: boolean) => void;
  historylistdata: any[];
  onBackdropPress: () => void;
}

const RecentHistory: React.FC<Props> = ({
  isModalVisible,
  setModalVisible,
  historylistdata,
  onBackdropPress,
}) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const themeColor: string = colorConfig?.primaryColor || '#0A84FF';

  const renderItem = useCallback(
    ({ item, index }: { item: any; index: number }) => (
      <TransactionItem item={item} index={index} themeColor={themeColor} />
    ),
    [themeColor],
  );

  return (
    <BottomSheet
      animationType="none"
      isVisible={isModalVisible}
      onBackdropPress={onBackdropPress}
      containerStyle={styles.overlay}
    >
      <View style={styles.sheet}>
        {/* Handle bar */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>{translate('Recent_Transactions')}</Text>
            <Text style={styles.headerSub}>{translate('Last_5_recharges')}</Text>
          </View>
          <TouchableOpacity
            onPress={() => setModalVisible(false)}
            activeOpacity={0.7}
            style={styles.closeBtn}
          >
            <ClosseModalSvg2 />
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.headerDivider} />

        {/* List */}
        {historylistdata.length === 0 ? (
          <View style={styles.emptyWrap}>
            <NoDatafound />
            <Text style={styles.emptyText}>{translate('No_transactions_yet')}</Text>
          </View>
        ) : (
          <View style={styles.listWrap}>
            <FlashList
              data={historylistdata}
              renderItem={renderItem}
              keyExtractor={(_, i) => i.toString()}
              estimatedItemSize={76}
              scrollEnabled={false}
            />
          </View>
        )}
      </View>
    </BottomSheet>
  );
};

export default React.memo(RecentHistory);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: wScale(24),
    borderTopRightRadius: wScale(24),
    paddingBottom: hScale(28),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
    }),
  },

  // Handle
  handle: {
    width: wScale(36),
    height: hScale(4),
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: hScale(12),
    marginBottom: hScale(4),
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wScale(20),
    paddingVertical: hScale(14),
  },
  headerTitle: {
    fontSize: wScale(17),
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: 0.2,
  },
  headerSub: {
    fontSize: wScale(12),
    color: '#8E8E93',
    marginTop: hScale(2),
    fontWeight: '500',
  },
  closeBtn: {
    width: wScale(34),
    height: wScale(34),
    borderRadius: wScale(17),
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E5E5EA',
    marginHorizontal: wScale(20),
  },

  // List
  listWrap: {
    paddingHorizontal: wScale(16),
    paddingTop: hScale(4),
    minHeight: hScale(50),
  },

  // Transaction Row
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hScale(14),
    gap: wScale(12),
  },
  itemDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F2F2F7',
  },

  // Operator logo
  logoWrap: {
    width: wScale(46),
    height: wScale(46),
    borderRadius: wScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: wScale(30),
    height: wScale(30),
    resizeMode: 'contain',
  },

  // Info column
  infoCol: {
    flex: 1,
    gap: hScale(2),
  },
  operatorName: {
    fontSize: wScale(14),
    fontWeight: '700',
    color: '#1C1C1E',
    letterSpacing: 0.1,
  },
  mobileNum: {
    fontSize: wScale(13),
    color: '#3C3C43',
    fontWeight: '500',
  },
  dateText: {
    fontSize: wScale(11),
    color: '#8E8E93',
    fontWeight: '400',
  },

  // Right column
  rightCol: {
    alignItems: 'flex-end',
    gap: hScale(6),
  },
  amount: {
    fontSize: wScale(16),
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: 0.3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wScale(8),
    paddingVertical: hScale(3),
    borderRadius: wScale(20),
    gap: wScale(4),
  },
  statusDot: {
    width: wScale(5),
    height: wScale(5),
    borderRadius: wScale(3),
  },
  statusText: {
    fontSize: wScale(10),
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Empty
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: hScale(30),
    gap: hScale(8),
  },
  emptyText: {
    fontSize: wScale(14),
    color: '#8E8E93',
    fontWeight: '500',
  },
});
