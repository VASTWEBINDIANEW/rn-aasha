import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { translate } from '../../../utils/languageUtils/I18n';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { colors } from '../../../utils/styles/theme';
import { RootState } from '../../../reduxUtils/store';
import { useSelector } from 'react-redux';
import { FlashList } from '@shopify/flash-list';
import { DotLoader } from '../../../components/DotLoader ';

const PurchaseToken = () => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}20`;
  const { get } = useAxiosHook();
  const [purchaseData, setPurchaseData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPurchaseData() {
      const response = await get({ url: APP_URLS.tokenPurchaseHistory });
      console.log(response, '************');
      if (response && response.Report) {
        setPurchaseData(response.Report);
      }
      setLoading(false);
    }
    fetchPurchaseData();
  }, []);

  if (loading) {
    return <DotLoader />;
  }

  const renderItem = ({ item }) => {
    const {
      Tokens,
      TotalTokenValue,
      TotalDebit,
      CreatedOn,
      DealerPre,
      DealerPost,
    } = item;

    return (
      <View style={[styles.card, { backgroundColor: color1 }]}>
        <View style={styles.row}>
          <View style={styles.column}>
            <View style={styles.row2}>
              <View style={styles.tokenCircle}>
                <Text style={styles.tokenText}>{Tokens}</Text>
              </View>
              <View style={styles.tokenInfo}>
                <Text style={styles.tokenLabel}>{translate('TOKEN')}</Text>
                <Text style={styles.tokenQty}>{translate('QTY')}</Text>
              </View>
            </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.column}>
            <Text style={styles.tokenLabel}>{translate('Token Prize')}</Text>
            <Text style={styles.tokenValue}>{TotalTokenValue}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.column}>
            <Text style={styles.tokenLabel}>{translate('Total Amount')}</Text>
            <Text style={styles.tokenValue}>{TotalDebit}</Text>
          </View>
        </View>

        {/* Transaction date section */}
        <View style={styles.dateContainer}>
          <Text style={styles.dateLabel}>{translate('Transaction Date')}</Text>
          <Text style={styles.dateValue}>{CreatedOn}</Text>
        </View>

        {/* Stock information section */}
        <View style={styles.stockRow}>
          <View style={styles.stockLeft}>
            <Text style={styles.stockLabel}>{translate('Pre Stock')}</Text>
            <Text style={styles.stockValue}>{DealerPre}</Text>
          </View>
          <View style={styles.stockCenter}>
            <Text style={styles.stockLabel}>{translate('Add Token')}</Text>
            <Text style={styles.stockValue}>1</Text>
          </View>
          <View style={styles.stockRight}>
            <Text style={styles.stockLabel}>{translate('Post Stock')}</Text>
            <Text style={styles.stockValue}>{DealerPost}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <FlashList
      data={purchaseData}
      renderItem={renderItem}
      keyExtractor={(item) => item.Idno.toString()}
      estimatedItemSize={100} // Adjust this based on your item size
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: wScale(16),
  },
  card: {
    backgroundColor: 'white',
    padding: wScale(16),
    marginBottom: hScale(16),
    borderRadius: hScale(10),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  row2: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'row',
  },
  tokenCircle: {
    height: wScale(40),
    width: wScale(40),
    borderRadius: wScale(50),
    borderWidth: 1,
    borderColor: '#cccccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    marginRight: wScale(10),
  },
  tokenText: {
    fontSize: wScale(18),
    fontWeight: 'bold',
    color: colors.black,
  },
  tokenInfo: {
    alignSelf: 'flex-start',
  },
  tokenLabel: {
    fontSize: wScale(12),
    color: '#666',
  },
  tokenQty: {
    fontWeight: 'bold',
    fontSize: wScale(14),
    color: colors.black,
  },
  separator: {
    width: 1,
    height: wScale(28),
    backgroundColor: '#e0e0e0',
    marginHorizontal: wScale(8),
  },
  tokenValue: {
    fontWeight: 'bold',
    fontSize: wScale(16),
  },
  dateContainer: {
    backgroundColor: '#f8f8f8',
    paddingVertical: hScale(12),
    paddingHorizontal: wScale(16),
    marginVertical: hScale(8),
    borderRadius: hScale(8),
  },
  dateLabel: {
    fontSize: wScale(14),
    color: '#666',
  },
  dateValue: {
    fontSize: wScale(16),
    fontWeight: 'bold',
  },
  stockRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stockLeft: {
    alignItems: 'flex-start',
  },
  stockCenter: {
    alignItems: 'center',
  },
  stockRight: {
    alignItems: 'flex-end',
  },
  stockLabel: {
    fontSize: wScale(12),
    color: '#666',
  },
  stockValue: {
    fontWeight: 'bold',
    fontSize: wScale(14),
  },
});

export default PurchaseToken;
