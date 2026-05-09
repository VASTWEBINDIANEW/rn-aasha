import { translate } from "../../../utils/languageUtils/I18n";
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { hScale, wScale } from '../../../utils/styles/dimensions';

const MposCom = () => {
  const { colorConfig,IsDealer } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}20`;
  const { get } = useAxiosHook();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); // For loading state

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url2 = `${APP_URLS.dealeropcomn}ddltype=MPOS`;
        const url = `${APP_URLS.opComm}ddltype=MPOS`;
        const response = await get({ url:IsDealer ? url2 : url });

        if (response && Array.isArray(response) && response.length > 0) {
          setData(response);
        } else {
          console.error('Invalid response format or empty data:', response);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false); // Stop loading once the data is fetched
      }
    };

    fetchData();
  }, [get]);

  // Function to handle null or undefined values and format to two decimal places
  const handleNullValue = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return '0.00';
    }
    return value.toFixed(2);
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: colorConfig.secondaryColor }]}>
        <Text style={styles.headerText}>{translate("PARTICULARS")}</Text>
        <Text style={styles.headerText}>{translate("COMMISSION")}</Text>
      </View>
      {data.length > 0 && (
        <View style={[styles.content, { backgroundColor: color1 }]}>
          <View style={styles.row}>
            <Text style={styles.label}>{translate("Max_Cash_Commission")}</Text>
            <Text style={styles.value}>₹ {handleNullValue(data[0].maxcashcomm)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{translate("Cash_Withdraw")}</Text>
            <Text style={styles.value}>₹ {handleNullValue(data[0].CashWithdraw)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{translate("Sales_Debit_up_to_2000")}</Text>
            <Text style={styles.value}>₹ {handleNullValue(data[0].Salesdebitupto2000)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{translate("Sales_Debit_above_2000")}</Text>
            <Text style={styles.value}>₹ {handleNullValue(data[0].Salesdebitabove2000)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{translate("Sales_Credit_Normal")}</Text>
            <Text style={styles.value}>₹ {handleNullValue(data[0].SalescreditNormal)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{translate("Sales_Credit_Grocery")}</Text>
            <Text style={styles.value}>₹ {handleNullValue(data[0].Salescreditgrocery)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{translate("Sales_Credit_Edu_and_Insu")}</Text>
            <Text style={styles.value}>₹ {handleNullValue(data[0].SalescreditEduandInsu)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{translate("GST")}</Text>
            <Text style={styles.value}>₹ {handleNullValue(data[0].gst)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>{translate("Credit_Type")}</Text>
            <Text style={styles.value}>{data[0].credit_type || 'N/A'}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wScale(20),
    backgroundColor: '#f9f9f9', // Light background
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: hScale(5),
  },
  headerText: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: wScale(16),
    color: '#fff',
  },
  content: {},
  row: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    justifyContent: 'space-between',
    paddingHorizontal: wScale(8)
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  value: {
    flex: 1,
    textAlign: 'right',
    fontSize: 14,
    color: '#2ecc71', // Green color for values
    fontWeight: '500',
  },
});

export default MposCom;
