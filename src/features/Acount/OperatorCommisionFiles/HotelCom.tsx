import { translate } from "../../../utils/languageUtils/I18n";
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';

const HotelCom = () => {
  const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);

  const { get } = useAxiosHook();
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url2 = `${APP_URLS.dealeropcomn}ddltype=HOTEL`;
        const url = `${APP_URLS.opComm}ddltype=HOTEL`;

        const response = await get({ url: IsDealer ? url2 : url });
console.log(IsDealer ? url2 : url)
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
  }, [get]);

  // Function to handle null or invalid values
  const handleNullValue = (value) => {
    // Check if the value is a valid number
    if (value === null || isNaN(value)) {
      return '0.00';
    }
    // Return the value with two decimal places
    return value.toFixed(2);
  };

  return (
    <View style={styles.container}>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          <Text style={[styles.cell, styles.headerCell]}>{translate("Particulars")}</Text>
          <Text style={[styles.cell, styles.headerCell]}>{translate("Margin")}</Text>
          <Text style={[styles.cell, styles.headerCell]}>{translate("GST")}</Text>
          <Text style={[styles.cell, styles.headerCell]}>{translate("TDS")}</Text>
        </View>
        {data.length > 0 && (
          data.map((item, index) => (
            <View style={styles.row} key={index}>
              <Text style={styles.cell}>
                {item.IsDomestic ? 'Domestic' : 'International'}
              </Text>
              <Text style={styles.cell}>
                {handleNullValue(item.marginPercentage)}
              </Text>
              <Text style={styles.cell}>
                {handleNullValue(item.gst)}
              </Text>
              <Text style={styles.cell}>
                {handleNullValue(item.tds)}
              </Text>
            </View>
          ))
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f1f1',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  cell: {
    flex: 1,
    padding: 10,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },
  headerCell: {
    fontWeight: 'bold',
    backgroundColor: '#f8f8f8',
  },
});

export default HotelCom;
