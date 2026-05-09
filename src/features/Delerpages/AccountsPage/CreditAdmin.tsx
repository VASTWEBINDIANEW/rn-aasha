import { translate } from "../../../utils/languageUtils/I18n";
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { hScale, SCREEN_HEIGHT, SCREEN_WIDTH, wScale } from '../../../utils/styles/dimensions';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { FlashList } from '@shopify/flash-list';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { APP_URLS } from '../../../utils/network/urls';
import { BottomSheet, Tab } from '@rneui/base';
import ClosseModalSvg2 from '../../drawer/svgimgcomponents/ClosseModal2';
import useAxiosHook from '../../../utils/network/AxiosClient';
import ShowLoader from '../../../components/ShowLoder';
import NoDatafound from '../../drawer/svgimgcomponents/Nodatafound';

const CreditAdmin = ({ receive }) => {
  const { colorConfig, } = useSelector((state: RootState) => state.userInfo)
  const color1 = `${colorConfig.secondaryColor}20`
  const [isBankVisible, setIsBankVisible] = useState(false);
  const [userid, setUserid] = useState(''); // userid state
  const [retailers, setRetailers] = useState([]);
  const [dealerInfo, setDealerInfo] = useState([]);
  const { post, get } = useAxiosHook();
  const [islodding, setIslodding] = useState(false);


  useEffect(() => {
    fetchDealerData();
  }, []);



  const fetchDealerData = async () => {
    try {
      setIslodding(true);

      const url = `${APP_URLS.ShowCreditReportByAdmin}`;
      const data = await get({ url });
      console.log(url, data,);
      setDealerInfo(data.Report);
      setIslodding(false);

    } catch (error) {
      setIslodding(false);

      console.error("Error fetching dealer data:", error);
    }
  };


  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={[styles.cardContent, { backgroundColor: color1 }]}>
        <View style={styles.row}>
          <View style={styles.columnLeft}>
            <Text style={styles.label}>{translate("Name")}</Text>
            <Text style={styles.value}>
              {item.Name === null ? '.....' : item.Name}
            </Text>
          </View>
          <View style={[styles.column, styles.alignRight]}>
            <Text style={styles.label}>{translate("Date")}</Text>
            <Text style={styles.value}>
              {item.date_dlm == null ? '0 0 0' : item.date_dlm}
            </Text>
          </View>
        </View>
        <View style={styles.row}>

          <>
            <View style={styles.columnLeft}>
              <Text style={styles.label}>{translate("Pre_Balance")}</Text>
              <Text style={styles.value}>₹ {item.dealer_prebal || '0'}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>{translate("Post_Balance")}</Text>
              <Text style={styles.value}>₹ {item.dealer_postbal || '0'}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>{translate("Amount")}</Text>
              <Text style={styles.value}>₹ {item.balance || '0'}</Text>
            </View>
          </>

          <View style={[styles.column, styles.alignRight]}>
            <Text style={styles.label}>{translate("Type")}</Text>
            <Text style={[styles.value, styles.rightAlign]}>{item.bal_type || ''}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  console.log("Dealer Info: ", dealerInfo);

  return (
    <View style={styles.main}>
      <View style={styles.container}>
        {islodding ? (
          <ShowLoader /> // Show loader if fetching data
        ) : (
          dealerInfo.length === 0 ? <NoDatafound /> : (
            <FlashList
              data={dealerInfo}
              renderItem={renderItem}
              keyExtractor={(item, index) => index.toString()}
            />)
        )}
      </View>
    </View>
  );
}

export default CreditAdmin;

const styles = StyleSheet.create({
  main: { flex: 1 },
  container: { paddingHorizontal: wScale(10), flex: 1, paddingTop: hScale(10), backgroundColor: '#fff' },
  card: { marginBottom: 10 },
  cardContent: { padding: 10, backgroundColor: 'white', borderRadius: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: hScale(4)
  },
  column: {
    flex: 1, alignItems: 'center',
  },
  columnLeft: { flex: 1, alignItems: 'flex-start' },
  label: { fontSize: 10, color: '#000' },
  value: { fontSize: 12, fontWeight: 'bold', color: '#000' },
  rightAlign: { textAlign: 'right' },
  alignRight: { alignItems: 'flex-end' },

});
