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
import { colors } from '../../../utils/styles/theme';
import FlotingInput from '../../drawer/securityPages/FlotingInput';
import OnelineDropdownSvg from '../../drawer/svgimgcomponents/simpledropdown';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import NoDatafound from '../../drawer/svgimgcomponents/Nodatafound';
import ShowLoader from '../../../components/ShowLoder';
import useAxiosHook from '../../../utils/network/AxiosClient';

const CreditRetailer = ({ }) => {
  const { colorConfig, } = useSelector((state: RootState) => state.userInfo)
  const color1 = `${colorConfig.secondaryColor}20`
  const [isBankVisible, setIsBankVisible] = useState(false);
  const [islodding, setIslodding] = useState(false);
  const [userid, setUserid] = useState('All');
  const [retailers, setRetailers] = useState([]);
  const [dealerInfo, setDealerInfo] = useState([]);
  const { post, get } = useAxiosHook
    ();
  const [searchQuery, setSearchQuery] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    fetchRetailerData();
  }, []);

  useEffect(() => {
    if (userid) {
      fetchDealerData(userid);
    }
  }, [userid]);

  const fetchRetailerData = async () => {
    try {
      setIslodding(true);
      const response = await post({ url: APP_URLS.retailerlist });
      setRetailers(response);
      setIslodding(false);
    } catch (error) {
      setIslodding(false);
      console.error("Error fetching retailer data:", error);
    }
  };

  const fetchDealerData = async (userId) => {
    try {
      setIslodding(true);
      const url = `${APP_URLS.Show_Retailer_outstandingreport}RetailerId=${userId}`;
      const data = await get({ url });
      setDealerInfo(data.Report);
      setIslodding(false);
    } catch (error) {
      setIslodding(false);
      console.error("Error fetching dealer data:", error);
    }
  };

  const handleStateSelect = (item) => {
    setUserid(item.UserID);
    setName(item.Name);
    setIsBankVisible(false);
  };

  const filteredData = retailers.filter(item =>
    item["Name"].toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={[styles.cardContent, { backgroundColor: color1 }]} >
        <View style={styles.row}>
          <View style={styles.columnLeft}>
            <Text style={styles.label}>{translate("Name")}</Text>
            <Text style={styles.value}>
              {item.RetailerName === null ? '.....' : item.RetailerName}
            </Text>
          </View>
          <View style={[styles.column, styles.alignRight]}>
            <Text style={styles.label}>{translate("Date")}</Text>
            <Text style={styles.value}>
              {item.RechargeDate == null ? '0 0 0' : item.RechargeDate}
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <>
            <View style={styles.columnLeft}>
              <Text style={styles.label}>{translate("Remain_Balance")}</Text>
              <Text style={styles.value}>₹ {item.remain_amount || '0'}</Text>
            </View>
            <View style={styles.column}>
              <Text style={styles.label}>{translate("Credit")}</Text>
              <Text style={styles.value}>₹ {item.cr || '0'}</Text>
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

  return (
    <View style={styles.main}>

      <View style={styles.container}>
        <TouchableOpacity style={styles.dropbtn} onPress={() => setIsBankVisible(true)}>
          <FlotingInput label={'Select Retailer Name'} value={name} editable={false} />
          <View style={styles.righticon2}>
            <OnelineDropdownSvg />
          </View>
        </TouchableOpacity>

        {islodding ? (
          <ShowLoader />
        ) : (

          <FlashList
            data={dealerInfo}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
          />
        )}

        <BottomSheet
        animationType="none"   isVisible={isBankVisible} onBackdropPress={() => setIsBankVisible(false)} containerStyle={styles.bottomSheetContainer}>
          <View style={styles.bottomsheetview}>
            <View style={styles.StateTitle}>
              <Text style={styles.stateTitletext}>{"All Retailers"}</Text>
              <TouchableOpacity onPress={() => setIsBankVisible(false)}>
                <ClosseModalSvg2 />
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Search..."
              value={searchQuery}
              onChangeText={text => setSearchQuery(text)}
              style={styles.searchBar}
            />
            {islodding ? (
              <ShowLoader /> // Show loader if fetching data
            ) : (
              filteredData.length === 0 ? <NoDatafound /> : (
                <FlashList
                  data={filteredData}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.itemContainer} onPress={() => handleStateSelect(item)}>
                      <Text style={styles.stateItem}>{item['Name']}</Text>
                      <Text style={{ color: colorConfig.secondaryColor }}>{item['firmName']}</Text>
                    </TouchableOpacity>
                  )}
                />
              )
            )}
          </View>
        </BottomSheet>
      </View>
    </View>
  );
}

export default CreditRetailer;

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
  righticon2: {
    position: "absolute",
    left: "auto",
    right: wScale(0),
    top: hScale(0),
    height: "85%",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: wScale(12),
  },
  dropbtn: {},
  bottomSheetContainer: { backgroundColor: 'rgba(0, 0, 0, 0.2)', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  itemContainer: { padding: 15, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  stateItem: { fontSize: wScale(18), color: "#000", textTransform: "uppercase" },
  bottomsheetview: { backgroundColor: "#fff", height: SCREEN_HEIGHT / 1.3, borderTopLeftRadius: 15, borderTopRightRadius: 15 },
  StateTitle: { paddingVertical: hScale(10), justifyContent: "space-between", flexDirection: "row", paddingHorizontal: wScale(10), marginBottom: hScale(10) },
  stateTitletext: { fontSize: wScale(22), color: "#000", fontWeight: "bold", textTransform: "uppercase" },
  searchBar: { borderColor: 'gray', borderWidth: wScale(1), paddingHorizontal: wScale(15), marginHorizontal: wScale(10), marginBottom: hScale(10), borderRadius: 5 },
  tabbar: {
    elevation: 0,
    marginBottom: hScale(10),
    height: hScale(60)
  },
  indicator: {},
  labelstyle: {
    fontSize: wScale(13),
    color: colors.black,
    width: "100%",
    textAlign: 'center',
  },
  labelview: {
    alignItems: 'center',
    flex: 1,
  }
});
