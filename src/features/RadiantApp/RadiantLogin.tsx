import { translate } from "../../utils/languageUtils/I18n";
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { hScale, wScale } from '../../utils/styles/dimensions';
import RadintTransactSvg from '../drawer/svgimgcomponents/RadintTransactSvg';
import RadintPrintSvg from '../drawer/svgimgcomponents/RadintPrintSvg ';
import RadintCancleSvg from '../drawer/svgimgcomponents/RadintCancleSvg';
import RadintReceiptSvg from '../drawer/svgimgcomponents/RadintReceiptSvg';
import RadintEditSvg from '../drawer/svgimgcomponents/RadintEditSvg';
import RadintPinSvg from '../drawer/svgimgcomponents/RadintPinSvg';
import NextErrowSvg from '../drawer/svgimgcomponents/NextErrowSvg';

const RadiantLogin = () => {
  const navigation = useNavigation();

  const gridItems = [
    { id: '1', title: 'Transactions', screen: 'RadiantTransactionScreen', color: '#e45a55', icon: <RadintTransactSvg /> },
    { id: '2', title: 'Receipt Print', screen: 'ReceiptPrintScreen', color: '#dac45a', icon: <RadintPrintSvg /> },
    { id: '3', title: 'Cancel Receipt', screen: 'CancelReceiptScreen', color: '#5dbbff', icon: <RadintCancleSvg /> },
    { id: '4', title: 'EOD Receipt', screen: 'EODReceiptScreen', color: '#ad6fda', icon: <RadintReceiptSvg /> },
  ];
  const handleGridItemPress = (screen) => {
    navigation.navigate(screen);
  };

  const renderGridItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.gridItem, { backgroundColor: item.color }]}
      activeOpacity={0.7}
      onPress={() => handleGridItemPress(item.screen)}
    >
      {item.icon}
      <View style={styles.nextrow}>
        <Text style={styles.gridItemText}>{item.title}</Text>
        <NextErrowSvg />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{translate("Radiant_Dashboard")}</Text>
      <View>
        <FlatList
          data={gridItems}
          renderItem={renderGridItem}
          keyExtractor={item => item.id}
          numColumns={2}
          scrollEnabled={false}
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button}>
          <RadintEditSvg />
          <Text style={styles.buttonText}>{translate("Edit_Receipt")}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, {}]}>
          <RadintPinSvg />
          <Text style={styles.buttonText}>{translate("Customer_Pin_Change")}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: wScale(0),
    backgroundColor: '#262626',
  },
  header: {
    fontSize: wScale(24),
    fontWeight: 'bold',
    color: '#ab7d53',
    marginVertical: hScale(10),
    paddingHorizontal: wScale(10)
  },
  gridItem: {
    height: hScale(232),
    flex: 1,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextrow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hScale(8),
  },
  gridItemText: {
    fontSize: wScale(18),
    fontWeight: '600',
    color: '#fff',
    paddingBottom: hScale(2),
    paddingRight: wScale(5)
  },
  buttonContainer: {
  },
  button: {
    paddingVertical: hScale(10),
    backgroundColor: '#56a6e4',
    alignItems: 'center',
    borderRadius: wScale(0),
    elevation: 3,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: hScale(15)
  },
  buttonText: {
    color: '#fff',
    fontSize: wScale(25),
    fontWeight: '400',
    paddingLeft: wScale(10)
  },
});

export default RadiantLogin;
