import { translate } from "../../../utils/languageUtils/I18n";
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { hScale, SCREEN_WIDTH, wScale } from '../../../utils/styles/dimensions';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { colors } from '../../../utils/styles/theme';
import CreateUser from './CreateUser';
import RetailerList from './RetailerList';
const DealerUser = () => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.primaryColor}20`;
 const [index, setIndex] = useState(0);

  const renderScene = SceneMap({
    'UsersList': RetailerList,
    'CreateUsers': CreateUser,


  });
  const [routes] = useState([

    { key: 'UsersList', title: 'Users List' },
    { key: 'CreateUsers', title: 'Create User' },

  ]);


  return (
    <View style={styles.main}>
      <AppBarSecond title={"All Users"} />
      <View style={[{ backgroundColor: colorConfig.secondaryColor, marginTop: hScale(-12) }]}>
        <View style={[styles.header, {}]}>
          <Text style={[styles.remainText, {
            marginRight: wScale(10),
          }]}>{translate("To_Main_Wallet")}</Text>
          <Text style={styles.remainText}>0
            {/* {remainToken === '' ? '0' : remainToken} */}
          </Text>
        </View>
      </View>

      <View style={styles.container}>
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
                  {/* {getSvgimg(route.key)}  */}
                  <Text style={[styles.labelstyle, { color: focused ? colors.dark_black : colors.black75 }]}>
                    {route.title}
                  </Text>
                </View>
              )}
            />
          )}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    marginBottom: hScale(5),
    flexDirection: 'row',
    borderRadius: 100,
    paddingHorizontal: wScale(10),
    justifyContent: 'center',
    paddingVertical: hScale(4),
    borderWidth: wScale(.8),
    minWidth: wScale(190),
    alignSelf: 'center',
    alignItems: 'center',
    borderColor: '#fff',
  },
  remainText: {
    fontSize: wScale(14),
    color: '#fff',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
  },
  tabbar: {
    elevation: 0,
    marginBottom: hScale(10),
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
  },
});

export default DealerUser;
