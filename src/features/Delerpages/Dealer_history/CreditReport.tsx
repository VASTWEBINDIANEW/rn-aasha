import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { hScale, SCREEN_HEIGHT, SCREEN_WIDTH, wScale } from '../../../utils/styles/dimensions';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { colors } from '../../../utils/styles/theme';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import CreditRetailer from '../AccountsPage/CreditRetailer';
import CreditMaster from '../AccountsPage/CreditMaster';
import CreditAdmin from '../AccountsPage/CreditAdmin';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const CreditReport = ({ receive }) => {
  const { colorConfig, } = useSelector((state: RootState) => state.userInfo)
  const color1 = `${colorConfig.secondaryColor}20`
  const { post, get } = useAxiosHook();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'Retailer', title: "Retailer's " },

    { key: 'Master', title: ' Master' },
    { key: 'Admin', title: ' Admin' },
  ]);
  const getSvgimg = (key: string) => {
    switch (key) {
      case 'Retailer':
        return <FontAwesome name="users" size={30} color={colorConfig.secondaryColor} />

      case 'Master':
        return <FontAwesome5 name="cc-mastercard" size={30} color={colorConfig.secondaryColor} />

      case 'Admin':
        return <FontAwesome5 name="user-cog" size={30} color={colorConfig.secondaryColor} />

      default:
        return null;
    }
  };
  const renderScene = SceneMap({
    'Retailer': CreditRetailer,
    'Master': CreditMaster,
    'Admin': CreditAdmin,

  });
  return (
    <View style={styles.main}>
      <AppBarSecond title={'Credit Report'} />
      <TabView
        lazy
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: SCREEN_WIDTH }}
        renderTabBar={(props) => (
          <TabBar
            {...props}
            indicatorStyle={[styles.indicator, { backgroundColor: colorConfig.primaryColor }]}
            style={[styles.tabbar, { backgroundColor: color1 }]}
            renderLabel={({ route, focused }) => (
              <View style={styles.labelview}>
                {getSvgimg(route.key)}
                <Text style={[styles.labelstyle, { color: focused ? colors.dark_black : colors.black75 }]}>
                  {route.title}
                </Text>
              </View>
            )}
          />
        )}
      />
    </View>
  );
}
export default CreditReport;
const styles = StyleSheet.create({
  main: { flex: 1 },
  container: { paddingHorizontal: wScale(10), flex: 1, paddingTop: hScale(10), backgroundColor: '#fff' },
  tabbar: {
    elevation: 0,
    // marginBottom: hScale(10),
    height: hScale(60)
  },
  indicator: {
  },
  labelstyle: {
    fontSize: wScale(13),
    color: colors.black,
    width: "100%",
    textAlign: 'center',
  },
  labelview: {
    alignItems: 'center',
    flex: 1,
  }
});
