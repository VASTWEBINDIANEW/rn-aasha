import { translate } from "../../../utils/languageUtils/I18n";
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ScrollView } from 'react-native';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { colors, FontSize } from '../../../utils/styles/theme';
import { fonts } from '@rneui/base';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { FlashList } from '@shopify/flash-list';

const list = [
  {
    OperatorName: "Airtel Digital TV",
    OperatorCode: "AD",
    Commission: 2.00,
    Commission1: 2.50,
    Commission2: 3.00,
  },
  {
    OperatorName: "Dish TV",
    OperatorCode: "DD",
    Commission: 2.00,
    Commission1: 2.50,
    Commission2: 3.00,
  },
  {
    OperatorName: "Big TV",
    OperatorCode: "RD",
    Commission: 0.00,
    Commission1: 0.00,
    Commission2: 0.00,
  },
  {
    OperatorName: "Sun Direct",
    OperatorCode: "SD",
    Commission: 2.00,
    Commission1: 2.00,
    Commission2: 3.00,
  },
  {
    OperatorName: "Tata Sky",
    OperatorCode: "TD",
    Commission: 1.00,
    Commission1: 2.00,
    Commission2: 2.00,
  },
];

// const headers = [
//   {
//     Header1: "0-199",
//     Header2: "200-300",
//     Header3: "301 & Above"
//   }
// ];
const RechargeUtilityCommission = () => {
  const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}20`
  const [headelist,setheaderlist]=useState([])
  const { get } = useAxiosHook();
  const [list, setList] = useState([])
  useEffect(() => {
    const fetchCommissionData = async (operator) => {
      try {
        const url2 = `${APP_URLS.dealeropcomn}ddltype=${operator}`;
        const url = `${APP_URLS.opComm}ddltype=${operator}`;
        const url3 = `${APP_URLS.opComm}ddltype=Header`;

        const response = await get({ url: IsDealer ? url2 : url });
        console.log(response);
        if(!IsDealer){
          const res = await get({url:url3});
          setheaderlist(res)
        }
        console.log('Prepaid');

        setList(response);
      } catch (error) {
        console.error(error);
      }
    };
    fetchCommissionData('Prepaid');
  }, [])
  const renderItem = ({ item }) => (
    <View style={[styles.header,]}>
      <Text style={[styles.cell, styles.firstCell]}>{item.OperatorName}</Text>
      <Text style={[styles.cell, styles.secondCell]}>{item.OperatorCode}</Text>
      <Text style={[styles.cell, styles.third]}>{item.Commission}</Text>
      <Text style={[styles.cell, styles.third]}>{item.Commission1}</Text>
      <Text style={[styles.cell, styles.third]}>{item.Commission2}</Text>
    </View>
  );

  return (
    <ScrollView>

      <View style={styles.container}>
        <View style={[styles.header, { backgroundColor: colorConfig.secondaryColor, }]}>
          <Text style={[styles.headerCell, styles.firstCell,]}>{translate("Operator")}</Text>
          <Text style={[styles.headerCell, { flex: 1 }]}>{translate("Code")}</Text>
          <Text style={[styles.headerCell, { flex: 2 }]}>{translate("Commmision_By_Range")}</Text>
        </View>

        <View style={[styles.header, { backgroundColor: colorConfig.secondaryColor }]}>
          <Text style={[styles.headerCell, styles.firstCell, styles.headtext2]}>{translate("PrepaidPostpaid")}</Text>
          <Text style={[styles.headerCell, styles.secondCell, styles.secondCell, styles.headtext2]}>{translate("By_operator")}</Text>
          <Text style={[styles.headerCell, styles.secondCell, styles.third, styles.headtext3]}>{headelist.Header1}</Text>
          <Text style={[styles.headerCell, styles.secondCell, styles.third, styles.headtext3]}>{headelist.Header2}</Text>
          <Text style={[styles.headerCell, styles.secondCell, styles.third, styles.headtext3]}>{headelist.Header3}</Text>
        </View>
        <View style={[styles.listcontainer,]}>
          <FlashList
            data={list}
            renderItem={renderItem}
            keyExtractor={(item) => item.OperatorCode}
            estimatedItemSize={50}
          />
        </View>

      </View>
    </ScrollView>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: hScale(15),
  },
  header: {
    flexDirection: 'row',
  },
  headerCell: {
    fontWeight: 'bold',
    textAlign: 'center',
    borderLeftWidth: wScale(1),
    borderBottomWidth: wScale(1),
    fontSize: FontSize.xSmall,
    color: colors.white,
    textAlignVertical: 'center',
    paddingVertical: hScale(5)
  },
  headtext2: {
    fontWeight: 'bold',
    fontSize: FontSize.small,
    paddingVertical: hScale(0)

  },
  headtext3: {
    fontSize: FontSize.teeny,
    fontWeight: 'normal',
    paddingVertical: hScale(0)

  },
  cell: {
    textAlign: 'center',
    borderLeftWidth: wScale(1),
    borderBottomWidth: wScale(1),
    color: colors.black75,
    paddingVertical: hScale(5)
  },
  firstCell: {
    borderLeftWidth: 0,
    width: wScale(190),
    textAlign: "left",
    textTransform: 'capitalize',
    paddingLeft: wScale(5)
  },
  secondCell: {
    flex: 1,
  },
  third: {
    flex: 0.66
  },
  listcontainer: { marginBottom: hScale(20), flex: 1 }

});

export default RechargeUtilityCommission;
