import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import { APP_URLS } from '../../../utils/network/urls';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import DateRangePicker from '../../../components/DateRange';
import { colors } from '../../../utils/styles/theme';
import NoDatafound from '../../drawer/svgimgcomponents/Nodatafound';
import { hScale, wScale } from '../../../utils/styles/dimensions';
const DealerRechargeHistory = () => {
  const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });
    const [searchnumber, setSearchnumber] = useState('');
  
  const [selectedStatus, setSelectedStatus] = useState('ALL');
const [id,setID]= useState('ALL')
  const { get } = useAxiosHook();
  const { userId } = useSelector((state) => state.userInfo);
  const navigation = useNavigation();

  const handlePress = (item) => {
    console.log(item)
    navigation.navigate('RechargeHistory', { ...item });
  };

  const recentTransactions = async (from, to, status ,id) => {
    setLoading(true);
    try {
      const formattedFrom = new Date(from).toISOString().split('T')[0];
      const formattedTo = new Date(to).toISOString().split('T')[0];
      const url2 = `${APP_URLS.dealer_rem_rch_report}pageindex=1&pagesize=500&retailerid=${id}&fromdate=${formattedFrom}&todate=${formattedTo}&role=Retailer&rechargeNo=ALL&status=${status}&OperatorName=ALL&portno=ALL`;
      const url = `${APP_URLS.recenttransaction}pageindex=1&pagesize=500&retailerid=${userId}&fromdate=${formattedFrom}&todate=${formattedTo}&role=Retailer&rechargeNo=ALL&status=${status}&OperatorName=ALL&portno=ALL`;

      const response = await get({ url: IsDealer ? url2 : url });
      console.log(IsDealer ? url2 : url, '++++++++++url')
      setTransactions(response);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    recentTransactions(selectedDate.from, selectedDate.to, selectedStatus ,id);
  }, [selectedDate, selectedStatus]);

  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity style={styles.transactionItem} onPress={() => handlePress(item)}>
      <View style={styles.leftcoloum}>
        <View style={styles.textimg}>
          {item.hasThumbnail ? (
            <Image source={{ uri: item.thumbnailPath }} style={styles.contactImage} />
          ) : (
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{item.Operator_name?.charAt(0) || '?'}</Text>
            </View>
          )}
          <View>
            <Text style={styles.opretor}>{item.Operator_name}</Text>
            <Text style={styles.number}>{item.Recharge_number}</Text>
          </View>
        </View>
        <Text style={[styles.opretor, { color: colorConfig.secondaryColor }]}>{item.Reqesttime}</Text>
      </View>
      <View style={styles.rightcoloum}>
        <Text style={styles.number}>₹ {item.Recharge_amount}</Text>
        <Text style={[styles.successtext, { color: item.Status === 'FAILED' ? 'red' : item.Status === 'SUCCESS' ? "green" : '#d9a20b' }]}>
          {item.Status}
        </Text>
      </View>
    </TouchableOpacity>
  ), [colorConfig.secondaryColor]);

  return (
    <View style={styles.main}>
      <AppBarSecond title={'Recharge History'} />

      <DateRangePicker
        setSearchnumber={setSearchnumber}
        onDateSelected={(from, to) => {
          setSelectedDate({ from, to });
        }}
        SearchPress={(from, to, status) => {
          recentTransactions(from, to, status,id); 
        }}
        status={selectedStatus} 
        setStatus={setSelectedStatus}
        
        isStShow={true}
        retailerID={(id)=>{
          console.log(selectedDate.from, selectedDate.to, selectedStatus,id)
          setID(id  )
          recentTransactions(selectedDate.from, selectedDate.to, selectedStatus,id)
        
        }}
        isshowRetailer={true}
        
      />

      <View style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} />
        ) : transactions.length === 0 ? (
          <NoDatafound />
        ) : (
          <FlatList
            data={transactions}
            renderItem={renderItem}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1 },
  container: { flex: 1, paddingHorizontal: wScale(10), paddingVertical: hScale(20) },
  transactionItem: {
    backgroundColor: '#fff',
    borderRadius: wScale(15),
    marginBottom: hScale(10),
    paddingHorizontal: wScale(10),
    paddingVertical: hScale(15),
    borderWidth: wScale(0.5),
    borderColor: colors.black_01,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  number: { color: "#000", fontSize: wScale(20), paddingBottom: hScale(5), fontWeight: 'bold' },
  successtext: { fontSize: wScale(15), paddingBottom: hScale(5), fontWeight: 'bold' },
  leftcoloum: {},
  textimg: { flexDirection: 'row', alignItems: 'center' },
  rightcoloum: { alignItems: 'flex-end', justifyContent: 'center' },
  opretor: { color: "#000", fontSize: wScale(16), paddingBottom: hScale(5) },
  avatarCircle: {
    width: wScale(48), height: wScale(48), borderRadius: wScale(17),
    backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center', marginRight: wScale(10),
  },
  avatarText: { fontSize: wScale(30), color: '#333' },
  contactImage: { width: wScale(45), height: wScale(45), borderRadius: 25, marginRight: wScale(10) },
});

export default DealerRechargeHistory;
