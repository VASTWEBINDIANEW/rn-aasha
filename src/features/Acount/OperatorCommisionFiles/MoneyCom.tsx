import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { translate } from '../../../utils/languageUtils/I18n';

const MoneyCom = () => {
  const { colorConfig,IsDealer } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}20`
  const [list, setList] = useState([]);
  const { get } = useAxiosHook();

  useEffect(() => {
    const fetchCommissionData = async (operator) => {
      try {
      const url2 = `${APP_URLS.dealeropcomn}ddltype=${operator}`
        const url = `${APP_URLS.opComm}ddltype=${operator}`;
        const response = await get({ url:IsDealer?url2:url });
        setList(response);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCommissionData('Money');
  }, [get]);

  const item = list[0] || {}; // Ensure item is defined

  const renderRow = (title, value, type, index) => {
    // Conditional row background color
    const backgroundColor = index % 2 === 0 ? color1 : 'transparaent'; 
    return (
      <View style={[styles.row, { backgroundColor }]} key={title}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>
          {value === 0 ? '₹ 0' : (type === 'Per' ? `% ${value}` : `₹ ${value}`)}
        </Text>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { backgroundColor: colorConfig.secondaryColor }]}>
        <Text style={styles.headerText}>{translate("Up v/s To")}</Text>
        <Text style={styles.headerText}>{translate("Charges")}</Text>
      </View>
      <View style={styles.content}>
        {renderRow('Verify Commission', item.VerifyComm, 'Rs', 0)}
        {renderRow('1 to 1000', item.comm_1000, item.Type_1000, 1)}
        {renderRow('1001 to 2000', item.comm_2000, item.Type_2000, 2)}
        {renderRow('2001 to 3000', item.comm_3000, item.Type_3000, 3)}
        {renderRow('3001 to 4000', item.comm_4000, item.Type_4000, 4)}
        {renderRow('4001 to 5000', item.comm_5000, item.Type_5000, 5)}
        {renderRow('5001 to 6000', item.comm_6000, item.Type_6000, 6)}
        {renderRow('6001 to 7000', item.comm_7000, item.Type_7000, 7)}
        {renderRow('7001 to 8000', item.comm_8000, item.Type_8000, 8)}
        {renderRow('8001 to 9000', item.comm_9000, item.Type_9000, 9)}
        {renderRow('9001 to 10000', item.comm_10000, item.Type_10000, 10)}
        {renderRow('10001 to 11000', item.comm_11000, item.Type_11000, 11)}
        {renderRow('11001 to 12000', item.comm_12000, item.Type_12000, 12)}
        {renderRow('12001 to 13000', item.comm_13000, item.Type_13000, 13)}
        {renderRow('13001 to 14000', item.comm_14000, item.Type_14000, 14)}
        {renderRow('14001 to 15000', item.comm_15000, item.Type_15000, 15)}
        {renderRow('15001 to 16000', item.comm_16000, item.Type_16000, 16)}
        {renderRow('16001 to 17000', item.comm_17000, item.Type_17000, 17)}
        {renderRow('17001 to 18000', item.comm_18000, item.Type_18000, 18)}
        {renderRow('18001 to 19000', item.comm_19000, item.Type_19000, 19)}
        {renderRow('19001 to 20000', item.comm_20000, item.Type_20000, 20)}
        {renderRow('20001 to 21000', item.comm_21000, item.Type_21000, 21)}
        {renderRow('21001 to 22000', item.comm_22000, item.Type_22000, 22)}
        {renderRow('22001 to 23000', item.comm_23000, item.Type_23000, 23)}
        {renderRow('23001 to 24000', item.comm_24000, item.Type_24000, 24)}
        {renderRow('24001 to 25000', item.comm_25000, item.Type_25000, 25)}
        {renderRow('25001 to 26000', item.comm_26000, item.Type_26000, 26)}
        {renderRow('26001 to 27000', item.comm_27000, item.Type_27000, 27)}
        {renderRow('27001 to 28000', item.comm_28000, item.Type_28000, 28)}
        {renderRow('28001 to 29000', item.comm_29000, item.Type_29000, 29)}
        {renderRow('29001 to 30000', item.comm_30000, item.Type_30000, 30)}
        {renderRow('30001 to 31000', item.comm_31000, item.Type_31000, 31)}
        {renderRow('31001 to 32000', item.comm_32000, item.Type_32000, 32)}
        {renderRow('32001 to 33000', item.comm_33000, item.Type_33000, 33)}
        {renderRow('33001 to 34000', item.comm_34000, item.Type_34000, 34)}
        {renderRow('34001 to 35000', item.comm_35000, item.Type_35000, 35)}
        {renderRow('35001 to 36000', item.comm_36000, item.Type_36000, 36)}
        {renderRow('36001 to 37000', item.comm_37000, item.Type_37000, 37)}
        {renderRow('37001 to 38000', item.comm_38000, item.Type_38000, 38)}
        {renderRow('38001 to 39000', item.comm_39000, item.Type_39000, 39)}
        {renderRow('39001 to 40000', item.comm_40000, item.Type_40000, 40)}
        {renderRow('40001 to 41000', item.comm_41000, item.Type_41000, 41)}
        {renderRow('41001 to 42000', item.comm_42000, item.Type_42000, 42)}
        {renderRow('42001 to 43000', item.comm_43000, item.Type_43000, 43)}
        {renderRow('43001 to 44000', item.comm_44000, item.Type_44000, 44)}
        {renderRow('44001 to 45000', item.comm_45000, item.Type_45000, 45)}
        {renderRow('45001 to 46000', item.comm_46000, item.Type_46000, 46)}
        {renderRow('46001 to 47000', item.comm_47000, item.Type_47000, 47)}
        {renderRow('47001 to 48000', item.comm_48000, item.Type_48000, 48)}
        {renderRow('48001 to 49000', item.comm_49000, item.Type_49000, 49)}
        {renderRow('49001 to 50000', item.comm_50000, item.Type_50000, 50)}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hScale(5),
    alignItems: 'center',
    paddingHorizontal: wScale(15),
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: wScale(14),
    color: '#fff',
  },
  content: {
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hScale(5),
    alignItems: 'center',
    paddingHorizontal: wScale(15),
    borderBottomWidth:wScale(.6)
  },
  title: {
    fontSize: 14,
    color: '#333',
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default MoneyCom;
