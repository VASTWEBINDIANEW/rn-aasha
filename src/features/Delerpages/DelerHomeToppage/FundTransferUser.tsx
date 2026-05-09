import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { hScale, SCREEN_WIDTH, wScale } from '../../../utils/styles/dimensions';
import { colors } from '../../../utils/styles/theme';
import FundRequestToDealer from './FundRequestToDealer';
import FundTransferRetailer from './FundTransferRetailer';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import LinearGradient from 'react-native-linear-gradient';
import { SvgXml } from 'react-native-svg';
import { useNavigation } from '../../../utils/navigation/NavigationService';

const FundTransferUser = () => {
  const backbuttonimg =
    '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><linearGradient id="a" x1="219.858" x2="478.003" y1="387.123" y2="128.977" gradientTransform="matrix(1 0 0 -1 0 514.05)" gradientUnits="userSpaceOnUse"><stop stop-opacity="1" stop-color="#ff5e45" offset="0.004629617637840665"></stop><stop stop-opacity="1" stop-color="#e5596f" offset="1"></stop></linearGradient><path fill="#fff" d="M385.1 405.7c20 20 20 52.3 0 72.3s-52.3 20-72.3 0L126.9 292.1c-20-20-20-52.3 0-72.3L312.8 34c20-20 52.3-20 72.3 0s20 52.3 0 72.3L235.4 256z" opacity="1" data-original="url(#a)" class=""></path></g></svg>';

  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}20`;
  const [index, setIndex] = useState(0);
  const { get, post } = useAxiosHook();
  const renderScene = SceneMap({
    'FundTransferRetailer': FundTransferRetailer,
    'FundRequestToDealer': FundRequestToDealer,


  });
  const [routes] = useState([

    { key: 'FundTransferRetailer', title: 'Fund Transfer' },
    { key: 'FundRequestToDealer', title: 'Retailer Request' },

  ]);


  useEffect(() => {
    const retailerList = async () => {
      try {
        const respons = await post({ url: APP_URLS.retailerlist })
        console.log(respons)
      } catch {

      }
    }
    retailerList();
  }, [])
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.goBack();
  }

  return (
    <View style={styles.main}>
      <AppBarSecond title="Fund Transfer" />

      {/* <LinearGradient
        colors={['#34EFDF', '#A870B7']}
      // start={{x: 0, y: 0.5}}
      // end={{x: 1, y: 0.5}}
      >
        <View style={styles.container}>
          <TouchableOpacity style={styles.backbutton} onPress={handleBack}
          >
            <SvgXml xml={backbuttonimg} />
          </TouchableOpacity>
          <Text style={[styles.titletext,]}>{'Fund Transfer'}</Text>


        </View>
      </LinearGradient> */}
      <View style={{ flex: 1 }}>
        <TabView
          lazy
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: SCREEN_WIDTH }}
          renderTabBar={(props) => (
            <TabBar
              {...props}
              indicatorStyle={[styles.indicator, { backgroundColor: colorConfig.secondaryColor }]}
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
  // container: {
  //   flex: 1,
  // },
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
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: hScale(55),
  },
  titletext: {
    fontSize: wScale(25),
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  backbutton: {
    width: wScale(60),
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRightWidth: wScale(0.8),
    borderColor: 'rgba(255,255,255,0.3)',
  },
  optionalbtn: {
    width: wScale(60),
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default FundTransferUser;
