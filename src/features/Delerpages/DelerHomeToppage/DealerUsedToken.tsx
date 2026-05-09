import { translate } from "../../../utils/languageUtils/I18n";
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import { colors } from '../../../utils/styles/theme';
import { hScale } from '../../../utils/styles/dimensions';
import { FlashList } from '@shopify/flash-list';
import { DotLoader } from '../../../components/DotLoader ';

const DealerUsedToken = () => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}20`;
  const [usedToken, setUsedToken] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { get } = useAxiosHook();

  const fadeAnim = new Animated.Value(0);  

  const fetchUsedTokens = async () => {
    try {
      const res = await get({ url: APP_URLS.UsedTokens });
      if (res) {
        setUsedToken(res.Report);
      }
    } catch (error) {
      setErrorMessage('Failed to load tokens');
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchUsedTokens();
  }, []);

 
  if (loading) {
    return <DotLoader />;
  }

  if (usedToken.length === 0 && !errorMessage) {
    return (
      <View style={styles.noDataContainer}>
        <Text style={styles.noDataMessage}>{translate("No_Tokens_Available")}</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: color1 }]}>
      <View style={styles.row}>
        <View style={styles.column}>
          <Text style={styles.label}>{translate("Pre_Stock")}</Text>
          <Text style={styles.value}>{item.RemainTokenPre}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.column}>
          <Text style={styles.label}>{translate("Used_Token")}</Text>
          <Text style={styles.value}>{item.usedtoken}</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.column}>
          <Text style={styles.label}>{translate("Post_Stock")}</Text>
          <Text style={styles.value}>{item.RemainTokenPost}</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={[styles.separator2, { backgroundColor: colorConfig.secondaryColor }]} />
        <Text style={[styles.detailsText]}>
          Tokens No: {item.JoiningTokenId}
        </Text>
        <View style={[styles.separator2, { backgroundColor: colorConfig.secondaryColor }]} />
        <Text style={styles.detailsText}>
          Retailer Info: {item.Email.toLowerCase()}
        </Text>
        <View style={[styles.separator2, { backgroundColor: colorConfig.secondaryColor }]} />
        <Text style={styles.detailsText}>
          Transaction Date: {item.JoinDate}
        </Text>
        <View style={[styles.separator2, { backgroundColor: colorConfig.secondaryColor }]} />
      </View>
    </View>
  );

  return (
    <FlashList
      data={usedToken}
      renderItem={renderItem}
      keyExtractor={(item) => item.JoiningTokenId.toString()}
      estimatedItemSize={100} // Adjust this based on your item size
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  errorContainer: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorMessage: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#fff',
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#444',
    fontWeight: '500',
  },
  value: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
    marginTop: 4,
  },
  separator: {
    width: 1,
    backgroundColor: colors.black_02,
    marginHorizontal: 12,
  },
  separator2: {
    flex: 1,
    height: 1,
    marginBottom: hScale(4),
  },
  details: {
    marginTop: 12,
  },
  detailsText: {
    fontSize: 14,
    marginBottom: 6,
    color: '#555',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  noDataMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
});

export default DealerUsedToken;
