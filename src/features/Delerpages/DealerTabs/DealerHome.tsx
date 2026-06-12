import { translate } from "../../../utils/languageUtils/I18n";
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, StatusBar, Alert, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import { useDispatch } from 'react-redux';
import { reset } from '../../../reduxUtils/store/userInfoSlice';
import LinearGradient from 'react-native-linear-gradient';
import MenuIcon from '../../dashboard/components/MenuIcon';
import AddTokenSvg from '../../drawer/svgimgcomponents/AddTokenSvg';
import UserDelerSvg from '../../drawer/svgimgcomponents/UserDelerSvg';
import TransferDelerSvg from '../../drawer/svgimgcomponents/TransferDelerSvg';
import { useFocusEffect } from '@react-navigation/native';
import { decryptData } from '../../../utils/encryptionUtils';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { BalanceType } from '../../dashboard/utils';
import DashboardHeader from '../../dashboard/components/DashboardHeader';
import DealerRecentTra from '../DelerHomeToppage/DealerRecentTra';
import Feather from 'react-native-vector-icons/Feather';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { SvgUri } from 'react-native-svg';
import BackArrow from '../../../utils/svgUtils/BackArrow';
import FastImage from "react-native-fast-image";
import { getAssetSource } from "../../../utils/network/NetWorkImages";

const DealerHome = () => {
  const { colorConfig } = useSelector((state) => state.userInfo);
  const { get } = useAxiosHook();
  const navigation = useNavigation();
  const [balanceInfo, setBalanceInfo] = useState<BalanceType | undefined>();
  const [firmname, setfirmName] = useState<any>();
  const dispatch = useDispatch();

  const handleLogout2 = () => {
    dispatch(reset());
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', onPress: () => console.log('Logout Cancelled'), style: 'cancel' },
        { text: 'OK', onPress: () => handleLogout2() },
      ],
      { cancelable: false }
    );
  };

  const getData = async () => {
    try {
      const userInfo = await get({ url: APP_URLS.getUserInfo });
      const data = userInfo.data;

      const decryptedData = {
        adminFarmName: decryptData(data.kkkk, data.vvvv, data.adminfarmname),
        posRemain: decryptData(data.kkkk, data.vvvv, data.posremain),
        remainBal: decryptData(data.kkkk, data.vvvv, data.remainbal),
        frmanems: decryptData(data.kkkk, data.vvvv, data.frmanems),
      };

      console.log('Decrypted Data:', decryptedData);

      setfirmName(decryptedData.adminFarmName);
      setBalanceInfo(decryptedData);

    } catch (error) {
      if (error.message === 'Network Error') {
        console.error('Network error occurred');
      } else {
        console.error('Error fetching data:', error);
        Alert.alert('Error', 'Something went wrong. Please try again.');
      }
    }
  };
const {post}= useAxiosHook();
const [cmsImage , setCmsData]= useState([])
useEffect(() => {
  const getdata = async () => {
    const res = await post({ url: APP_URLS.getFinanceSectionImages });
    console.log("Full Response:", res);

    const cmsObj = res.find(item => item.name === "CMS");
    console.log("CMS Object:", cmsObj);
    setCmsData(cmsObj)
  };

  getdata();
}, []);

  return (
    <LinearGradient
      style={{ flex: 1 }}
      colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
    >
      <StatusBar backgroundColor={colorConfig.primaryColor} />

     
          <DashboardHeader refreshPress={true} />
      

      <ScrollView style={styles.container}>

        <View style={styles.iconButtonContainer}>
          <View style={styles.iconButtonContainer}>
            <View style={[styles.row,]}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('DealerToken')}
              >
                <AddTokenSvg color1={'#34EFDF'} color2={'#A870B7'} />
                <Text style={styles.iconText}>{'Retail Token'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('DealerUser')}
              >
                <UserDelerSvg color1={'#34EFDF'} color2={'#A870B7'} />
                <Text style={styles.iconText}>{'Users'}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('FundTransferUser')}
              >
                <TransferDelerSvg color1={'#34EFDF'} color2={'#A870B7'} />
                <Text style={styles.iconText}>{'Wallet Transfer'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => navigation.navigate('CmsScreen')}
              >
             
             <FastImage   
             style={{height:hScale(35),width:wScale(40)}}
             source={getAssetSource(`${APP_URLS.cms_logo}`)}/>
                <Text style={styles.iconText}>{'Cms'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View>
          <Text style={[styles.recent, { backgroundColor: colorConfig.secondaryColor }]}>{translate("Recent_Transactions")}</Text>
          <DealerRecentTra />
        </View>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255,255,255,0.5)',
    flex: 1
  },
  marqueeContainer: {
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonContainer: {
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff'
  },
  iconButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 5,
  },
  iconText: {
    fontSize: 12,
    textAlign: 'center',
  },
  dealerTabContainer: {
    marginLeft: 4,
    marginRight: 4,
  },
  Headers: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 10,
  
  },
  MenuLogo: {},

  recent: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    flex: 1,
    paddingVertical: hScale(10)
  },
});

export default DealerHome;
