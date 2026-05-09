import { translate } from "../../../utils/languageUtils/I18n";
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { RootState } from '../../../reduxUtils/store';
import { useSelector } from 'react-redux';
import { colors, FontSize } from '../../../utils/styles/theme';
import { hScale, wScale } from '../../../utils/styles/dimensions';

const UtilityCommission = () => {
  const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}20`;
  const { get } = useAxiosHook();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true); // Added loading state

  useEffect(() => {
    const fetchCommissionData = async (operator) => {
      try {
        const url = `${APP_URLS.opComm}ddltype=${operator}`;
        const url2 = `${APP_URLS.dealeropcomn}ddltype=${operator}`;
        const response = await get({ url: IsDealer ? url2 : url });
        console.log(IsDealer ? url2 : url);

        // Check if response is valid and contains data
        if (response && response.length > 0) {
          setList(response);
        } else {
          setList([]); // Set list to empty array if no data is returned
        }
      } catch (error) {
        console.error(error);
        setList([]); // Handle error case by setting an empty array
      } finally {
        setLoading(false); // Set loading to false after fetching is done
      }
    };

    fetchCommissionData('Utility');
  }, [IsDealer]);

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, styles.firstCell]}>{item.OperatorName || 'N/A'}</Text>
      <Text style={[styles.cell, styles.secondCell]}>{item.OperatorCode || 'N/A'}</Text>
      <Text style={[styles.cell, styles.third]}>{item.Commission || 'N/A'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: colorConfig.secondaryColor }]}>
        <Text style={[styles.headerCell, styles.firstCell]}>{translate("Operator")}</Text>
        <Text style={[styles.headerCell, styles.secondCell]}>{translate("Operator")}</Text>
        <Text style={[styles.headerCell, styles.third]}>{'Commision By Range'}</Text>
      </View>

      {/* Check if loading */}
      {loading ? (
        <ActivityIndicator size="large" color={colorConfig.secondaryColor} />
      ) : (
        // Check if the list is not empty
        list.length > 0 ? (
          <FlatList
            data={list}
            renderItem={renderItem}
            keyExtractor={(item) => item.OperatorCode}
          />
        ) : (
          <View style={styles.noDataContainer}>
            <Text>{translate("No_data_available")}</Text>
          </View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerCell: {
    fontWeight: 'bold',
    textAlign: 'center',
    borderLeftWidth: wScale(1),
    fontSize: FontSize.xSmall,
    color: colors.white,
    textAlignVertical: 'center',
    paddingVertical: hScale(5),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  cell: {
    textAlign: 'center',
    borderLeftWidth: wScale(1),
    borderBottomWidth: wScale(1),
    color: colors.black75,
    paddingVertical: hScale(5),
  },
  firstCell: {
    borderLeftWidth: 0,
    flex: 2,
  },
  secondCell: {
    flex: 1,
  },
  third: {
    borderRightWidth: 0,
    flex: 2,
  },
  noDataContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
});

export default UtilityCommission;
