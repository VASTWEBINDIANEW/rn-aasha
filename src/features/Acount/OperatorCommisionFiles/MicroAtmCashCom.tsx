import { translate } from "../../../utils/languageUtils/I18n";
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';

const MicroAtmCashCom = () => {
  const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);

  const { get } = useAxiosHook();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url2 = `${APP_URLS.dealeropcomn}ddltype=MICROATMCASH`;
        const url = `${APP_URLS.opComm}ddltype=MICROATMCASH`;
        const response = await get({ url: IsDealer ? url2 : url });
        console.log(IsDealer ? url2 : url, response);

        if (response && Array.isArray(response) && response.length > 0) {
          setData(response);
        } else {
          console.error("Invalid response format or empty data:", response);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [get, IsDealer]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{translate("PARTICULARS")}</Text>
        <Text style={styles.headerText}>{translate("MARGIN")}</Text>
        <Text style={styles.headerText}>₹</Text>
        <Text style={styles.headerText}>{translate("MAX")}</Text>
      </View>
      {data.length > 0 && (
        <View style={styles.content}>
          <View style={styles.row}>
            <Text style={styles.label}>{translate("0_to_1000")}</Text>
            <Text style={styles.value}>{data[0]?.cash_0_1000_per ? `${data[0]?.cash_0_1000_per}%` : 'N/A'}</Text>
            <Text style={styles.value}>₹ {data[0]?.cash_0_1000_rs ? data[0]?.cash_0_1000_rs.toFixed(2) : '0.00'}</Text>
            <Text style={styles.value}>₹ {data[0]?.cash_0_1000_maxrs ? data[0]?.cash_0_1000_maxrs.toFixed(2) : '0.00'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{translate("1001_to_2000")}</Text>
            <Text style={styles.value}>{data[0]?.cash_1001_2000_per ? `${data[0]?.cash_1001_2000_per}%` : 'N/A'}</Text>
            <Text style={styles.value}>₹ {data[0]?.cash_1001_2000_rs ? data[0]?.cash_1001_2000_rs.toFixed(2) : '0.00'}</Text>
            <Text style={styles.value}>₹ {data[0]?.cash_1001_2000_maxrs ? data[0]?.cash_1001_2000_maxrs.toFixed(2) : '0.00'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{translate("500_to_999")}</Text>
            <Text style={styles.value}>{data[0]?.per_500_999 ? `${data[0]?.per_500_999}` : 'N/A'}</Text>
            <Text style={styles.value}>₹ {data[0]?.rs_500_999 ? data[0]?.rs_500_999.toFixed(2) : '0.00'}</Text>
            <Text style={styles.value}>₹ {data[0]?.maxrs_500_999 ? data[0]?.maxrs_500_999.toFixed(2) : '0.00'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{translate("1000_to_1499")}</Text>
            <Text style={styles.value}>{data[0]?.per_1000_1499 ? `${data[0]?.per_1000_1499}%` : 'N/A'}</Text>
            <Text style={styles.value}>₹ {data[0]?.rs_1000_1499 ? data[0]?.rs_1000_1499.toFixed(2) : '0.00'}</Text>
            <Text style={styles.value}>₹ {data[0]?.maxrs_1000_1499 ? data[0]?.maxrs_1000_1499.toFixed(2) : '0.00'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{translate("1500_to_1999")}</Text>
            <Text style={styles.value}>{data[0]?.per_1500_1999 ? `${data[0]?.per_1500_1999}%` : 'N/A'}</Text>
            <Text style={styles.value}>₹ {data[0]?.rs_1500_1999 ? data[0]?.rs_1500_1999.toFixed(2) : '0.00'}</Text>
            <Text style={styles.value}>₹ {data[0]?.maxrs_1500_1999 ? data[0]?.maxrs_1500_1999.toFixed(2) : '0.00'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{translate("2000_to_2499")}</Text>
            <Text style={styles.value}>{data[0]?.per_2000_2499 ? `${data[0]?.per_2000_2499}%` : 'N/A'}</Text>
            <Text style={styles.value}>₹ {data[0]?.rs_2000_2499 ? data[0]?.rs_2000_2499.toFixed(2) : '0.00'}</Text>
            <Text style={styles.value}>₹ {data[0]?.maxrs_2000_2499 ? data[0]?.maxrs_2000_2499.toFixed(2) : '0.00'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{translate("2500_to_2999")}</Text>
            <Text style={styles.value}>{data[0]?.per_2500_2999 ? `${data[0]?.per_2500_2999}%` : 'N/A'}</Text>
            <Text style={styles.value}>₹ {data[0]?.rs_2500_2999 ? data[0]?.rs_2500_2999.toFixed(2) : '0.00'}</Text>
            <Text style={styles.value}>₹ {data[0]?.maxrs_2500_2999 ? data[0]?.maxrs_2500_2999.toFixed(2) : '0.00'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{translate("3000_to_3499")}</Text>
            <Text style={styles.value}>{data[0]?.per_3000_3499 ? `${data[0]?.per_3000_3499}%` : 'N/A'}</Text>
            <Text style={styles.value}>₹ {data[0]?.rs_3000_3499 ? data[0]?.rs_3000_3499.toFixed(2) : '0.00'}</Text>
            <Text style={styles.value}>₹ {data[0]?.maxrs_3000_3499 ? data[0]?.maxrs_3000_3499.toFixed(2) : '0.00'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{translate("3500_to_5000")}</Text>
            <Text style={styles.value}>{data[0]?.per_3500_5000 ? `${data[0]?.per_3500_5000}%` : 'N/A'}</Text>
            <Text style={styles.value}>₹ {data[0]?.rs_3500_5000 ? data[0]?.rs_3500_5000.toFixed(2) : '0.00'}</Text>
            <Text style={styles.value}>₹ {data[0]?.maxrs_3500_5000 ? data[0]?.maxrs_3500_5000.toFixed(2) : '0.00'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{translate("5001_to_10000")}</Text>
            <Text style={styles.value}>{data[0]?.per_5001_10000 ? `${data[0]?.per_5001_10000}%` : 'N/A'}</Text>
            <Text style={styles.value}>₹ {data[0]?.rs_5001_10000 ? data[0]?.rs_5001_10000.toFixed(2) : '0.00'}</Text>
            <Text style={styles.value}>₹ {data[0]?.maxrs_5001_10000 ? data[0]?.maxrs_5001_10000.toFixed(2) : '0.00'}</Text>
          </View>
        </View>
      )}
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
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 5,
  },
  headerText: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  content: {
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    justifyContent: 'space-between',
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  value: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    color: '#333',
  },
});

export default MicroAtmCashCom;
