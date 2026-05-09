import { translate } from "../../../utils/languageUtils/I18n";
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import NoDatafound from '../../drawer/svgimgcomponents/Nodatafound';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';

const Vm30PurchaseCom = () => {
  const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);

  const { get } = useAxiosHook();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCommissionData = async () => {
      try {
        const url2 = `${APP_URLS.dealeropcomn}ddltype=VM30PURCHASE`;
        const url = `${APP_URLS.opComm}ddltype=VM30PURCHASE`;
        const response = await get({ url :IsDealer?url2:url});
console.log(IsDealer?url2:url,response)
        if (response && Array.isArray(response) && response.length > 0) {
          setList(response);
        } else {
          console.error("No data found or invalid response:", response);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCommissionData();
  }, [get]);

  const renderItem = ({ item }) => (
    <View style={styles.rowContainer}>
      <View style={[styles.row, { borderBottomWidth: .5 }]}>
        <View style={styles.columnLeft}>
          <Text style={styles.label}>{translate("Card_Name")}</Text>
          <Text style={styles.value}>{item.cardname}</Text>
        </View>
        <View style={styles.columnCenter}>
          <Text style={styles.label}>{translate("Card_Category")}</Text>
          <Text style={styles.value}>{item.cardcategorytype}</Text>
        </View>
        <View style={styles.columnRight}>
          <Text style={styles.label}>{translate("Card_Type")}</Text>
          <Text style={styles.value}>{item.cardtype}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.amountRange}>
          <Text style={styles.label}>{translate("Amount_Range")}</Text>
          <View style={styles.rangeRow}>
            <View>
              <Text style={styles.rangeLabel}>{translate("Min_Value")}</Text>
              <Text style={styles.rangeValue}>{`\u{20B9} ${item.minvalue?item.minvalue:'N/A'}`}</Text>
            </View>
            <View style={styles.divider} />

            <View>
              <Text style={styles.rangeLabel}>{translate("Max_Value")}</Text>
              <Text style={styles.rangeValue}>{`\u{20B9} ${item.maxvalue?item.maxvalue:'N/A'}`}</Text>
            </View>

          </View>
        </View>



        <View style={styles.charges}>
          <Text style={styles.label}>{translate("Charges")}</Text>

          <View style={styles.rangeRow}>
            <View style={styles.divider} />

            <View>

              <Text style={styles.rangeLabel}>{translate("Charge_Type")}</Text>
              <Text style={styles.rangeValue}>
                {item.chargetype === 'Per' ? '(%)' : '(₹)'}
              </Text>
            </View>
            <View style={styles.divider} />

            <View >
              <Text style={styles.rangeLabel}>{translate("Charge")}</Text>
              <Text style={styles.rangeValue}>{item.charge}</Text>
            </View>
          </View>

        </View>
      </View>
    </View>
  );  

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      ) : list.length === 0 ? (
        <NoDatafound />) : (
        <FlatList
          data={list}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    flex: 1,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rowContainer: {
    marginBottom: hScale(15),
    backgroundColor: '#fff',
    paddingVertical: hScale(1),
    paddingHorizontal: hScale(10),
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    paddingBottom: hScale(5),
    marginBottom: hScale(5)
  },
  columnLeft: {
    flex: 1,
    alignItems: 'flex-start', // Align left
    marginRight: 12,
  },
  columnCenter: {
    flex: 1,
    alignItems: 'center', // Align center
    marginRight: 12,
  },
  columnRight: {
    flex: 1,
    alignItems: 'flex-end', // Align right
  },
  label: {
    fontSize: wScale(14),
    color: '#666',
    marginBottom: hScale(4),
  },
  value: {
    fontSize: wScale(14),
    fontWeight: '600',
    color: '#333',
  },
  amountRange: {
    flex: 1,
    paddingRight: wScale(10),
  },
  charges: {
    flex: 1,
    paddingLeft: 10,
  },
  rangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  rangeLabel: {
    fontSize: wScale(12),
    color: '#555',
  },
  rangeValue: {
    fontSize: wScale(12),
    fontWeight: 'bold',
    color: '#333',
  },
  divider: {
    width: 1,
    backgroundColor: '#ddd',
    // marginHorizontal: 12,
  },

});

export default Vm30PurchaseCom;
