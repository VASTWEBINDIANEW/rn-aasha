import { translate } from "../../../utils/languageUtils/I18n";
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import NoDatafound from '../../drawer/svgimgcomponents/Nodatafound';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';

const FlightCom = () => {
  const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}20`;

  const { get } = useAxiosHook();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const url2 = `${APP_URLS.dealeropcomn}ddltype=FLIGHT`;
        const url = `${APP_URLS.opComm}ddltype=FLIGHT`;
        const response = await get({ url: IsDealer ? url2 : url });

        console.log(IsDealer ? url2 : url);
        if (response && Array.isArray(response) && response.length > 0) {
          setData(response);
        } else {
          console.error("Invalid response format or empty data:", response);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [get]);

  // Function to handle null or undefined values
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
      {data.length === 0 ? (
        <NoDatafound />
      ) : (
        <View style={styles.table}>
          <View style={[styles.headerRow, { backgroundColor: colorConfig.secondaryColor }]}>
            <Text style={[styles.cell, styles.headerCell]}>{translate("Particulars")}</Text>
            <Text style={[styles.cell, styles.headerCell]}>{translate("Margin")}</Text>
            <Text style={[styles.cell, styles.headerCell]}>{translate("GST")}</Text>
            <Text style={[styles.cell, styles.headerCell]}>{translate("TDS")}</Text>
          </View>
          {data.map((item, index) => (
            <View
              style={[
                styles.row,
                { backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff' },
              ]}
              key={index}
            >
              <Text style={styles.cell}>
                {item.IsDomestic ? 'Domestic' : 'International'}
              </Text>
              <Text style={styles.cell}>{handleNullValue(item.marginPercentage)}</Text>
              <Text style={styles.cell}>{handleNullValue(item.gst)}</Text>
              <Text style={styles.cell}>{handleNullValue(item.tds)}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f9f9f9', // Light background
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  table: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
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
    paddingVertical: 12,
    paddingHorizontal: 10,
    textAlign: 'center',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    fontSize: 14,
    color: '#333',
  },
  headerCell: {
    fontWeight: 'bold',
    color: '#fff', // White text color for header
    backgroundColor: '#2980b9', // Darker blue for header cells
  },
});

export default FlightCom;
