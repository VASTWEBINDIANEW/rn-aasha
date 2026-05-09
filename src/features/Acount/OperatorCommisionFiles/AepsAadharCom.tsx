import { translate } from "../../../utils/languageUtils/I18n";
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { hScale, wScale } from '../../../utils/styles/dimensions';

const AepsAadharCom = () => {
  const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}20`; // Transparent background color

  const { get } = useAxiosHook();
  const [list, setList] = useState([]);

  useEffect(() => {
    const fetchCommissionData = async () => {
      try {
        const url2 = `${APP_URLS.dealeropcomn}ddltype=AEPS`;
        const url = `${APP_URLS.opComm}ddltype=AEPS`;
        const response = await get({ url: IsDealer ? url2 : url });

        if (response && Array.isArray(response)) {
          setList(response);
        } else {
          console.error("Invalid response format:", response);
        }
      } catch (error) {
        console.error("Error fetching commission data:", error);
      }
    };

    fetchCommissionData();
  }, []);

  const renderRow = (item, amountRange, amountKey, typeKey, rsKey, maxRsKey) => {
    return (
      <View style={styles.row}>
        <Text style={[styles.cell, styles.firstcell, styles.borderRight]}>{amountRange}</Text>
        <Text style={[styles.cell, styles.borderRight]}>
          {item[typeKey]} {item[amountKey]}
        </Text>
        <Text style={[styles.cell, styles.borderRight]}>{item[rsKey]}</Text>
        <Text style={styles.cell}>{item[maxRsKey]}</Text>
      </View>
    );
  };

  const renderItem = ({ item }) => (
    <View>
      {renderRow(item, "500 To 999", "Type_500_999", "per_500_999", "rs_500_999", "maxrs_500_999")}
      {renderRow(item, "1000 To 1499", "Type_1000_1499", "per_1000_1499", "rs_1000_1499", "maxrs_1000_1499")}
      {renderRow(item, "1500 To 1999", "Type_1500_1999", "per_1500_1999", "rs_1500_1999", "maxrs_1500_1999")}
      {renderRow(item, "2000 To 2499", "Type_2000_2499", "per_2000_2499", "rs_2000_2499", "maxrs_2000_2499")}
      {renderRow(item, "2500 To 2999", "Type_2500_2999", "per_2500_2999", "rs_2500_2999", "maxrs_2500_2999")}
      {renderRow(item, "3000 To 3499", "Type_3000_3499", "per_3000_3499", "rs_3000_3499", "maxrs_3000_3499")}
      {renderRow(item, "3500 To 5000", "Type_3500_5000", "per_3500_5000", "rs_3500_5000", "maxrs_3500_5000")}
      {renderRow(item, "5001 To 10000", "Type_5001_10000", "per_5001_10000", "rs_5001_10000", "maxrs_5001_10000")}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.labelview, { backgroundColor: color1 }]}>
        <Text style={[styles.label]}>{translate("Mini_Statement_Commercial")}</Text>
        <Text style={[styles.value]}>0</Text>
      </View>
      <View style={[styles.labelview, { backgroundColor: color1 }]}>
        <Text style={[styles.label]}>{translate("Aadhaar_Pay_Commercial")}</Text>
        <Text style={[styles.value]}>0</Text>
      </View>
      <View style={[styles.header, { backgroundColor: color1 }]}>
        <Text style={[styles.headerCell, styles.borderRight, styles.firstcell]}>{translate("Amount_Range")}</Text>
        <Text style={[styles.headerCell, styles.borderRight]}> (%) </Text>
        <Text style={[styles.headerCell, styles.borderRight]}> (₹) </Text>
        <Text style={styles.headerCell}>{translate("max")}</Text>
      </View>

      <FlatList
        data={list}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
  },
  headerCell: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 5,
    color: '#000',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cell: {
    textAlign: 'center',
    padding: 5,
    borderColor: '#ddd',
    borderWidth: 1,
    color: '#000',
    flex: 1,
  },
  firstcell: {
    flex: 2,
  },
  borderRight: {
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  label: {
    color: '#000',
    fontSize: wScale(12),
  },
  value: {
    color: '#000',
    fontSize: wScale(16),
    fontWeight: 'bold',
  },
  labelview: {
    paddingHorizontal: wScale(5),
    marginVertical: hScale(5),
  },
});

export default AepsAadharCom;
