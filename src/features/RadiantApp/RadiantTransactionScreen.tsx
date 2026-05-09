import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Image, ScrollView, Alert, ToastAndroid } from 'react-native';
import { wScale, hScale, SCREEN_WIDTH } from '../../utils/styles/dimensions';
import RadintPickupSvg from '../drawer/svgimgcomponents/RadintPickupSvg';
import { colors } from '../../utils/styles/theme';
import RadintDepositSvg from '../drawer/svgimgcomponents/RadintDepositSvg';
import RadintChequeSvg from '../drawer/svgimgcomponents/RadintChequeSvg';
import RadintDeliverySvg from '../drawer/svgimgcomponents/RadintDeliverySvg';
import { useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import LinearGradient from 'react-native-linear-gradient';
import NextErrowSvg2 from '../drawer/svgimgcomponents/NextErrowSvg2';
import { APP_URLS } from '../../utils/network/urls';
import useAxiosHook from '../../utils/network/AxiosClient';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import WalletCard from './RadiantTrxn/WalletCard';
import CmsTab from './CmsTab';
import PvcCheckPickupstatusModel from '../../components/PvcCheckPickupstatusModel';
import CmsQrAddMoney from './RadiantTrxn/CmsQrAddMoney';
import AllBalance from '../../components/AllBalance';
import useRadiantHook from '../Financial/hook/useRadiantHook';
import { log } from 'console';
import { commonStyles } from '../../utils/styles/commonStyles';
import { useNavigation } from '../../utils/navigation/NavigationService';

const RadiantTransactionScreen = () => {
  const { colorConfig, rctype } = useSelector((state: RootState) => state.userInfo);
  const navigation = useNavigation();




  return (
    <View style={commonStyles.screenContainer}>
      <AppBarSecond title={'R A D I A N T   C M S'}
        onPressBack={()=>navigation.navigate('DashboardScreen')}

      />
      {rctype === 'PrePay' && <AllBalance />
      }

      {rctype === 'PostPay' &&
        <View >

          <WalletCard />
        </View>

      }
      <View style={{ marginTop: hScale(15), flex: 1 }}>
        <CmsTab />
      </View>


    </View>
  );
};


export default RadiantTransactionScreen;
