import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet,
  TouchableOpacity, Alert,
  ToastAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FlashList } from '@shopify/flash-list';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { getDistance } from 'geolib';

import { hScale, wScale } from '../../../utils/styles/dimensions';
import { colors, FontSize } from '../../../utils/styles/theme';
import { RootState } from '../../../reduxUtils/store';
import { setRadiantList } from '../../../reduxUtils/store/userInfoSlice';
import { APP_URLS } from '../../../utils/network/urls';

import useAxiosHook from '../../../utils/network/AxiosClient';
import useRadiantHook from '../../Financial/hook/useRadiantHook';
import { useLocationHook } from '../../../hooks/useLocationHook';

import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import ShowLoader from '../../../components/ShowLoder';
import WalletCard from './WalletCard';
import CmsQrAddMoney from './CmsQrAddMoney';
import LocationModal from '../../../components/LocationModal';
import CheckPickupstatusModel from '../../../components/CheckPickupstatusModel';
import NoDatafound from '../../drawer/svgimgcomponents/Nodatafound';
import RadintPickupSvg from '../../drawer/svgimgcomponents/RadintPickupSvg';
import NextErrowSvg2 from '../../drawer/svgimgcomponents/NextErrowSvg2';
import CmsLocationSvg from '../../drawer/svgimgcomponents/CmsLocationSvg';

// ─────────────────────────────────────────────
const CashPickup = () => {

  // ── Redux ──────────────────────────────────
  const dispatch = useDispatch();
  const { colorConfig, Loc_Data, rctype } = useSelector((state: RootState) => state.userInfo);

  // ── Navigation ─────────────────────────────
  const navigation = useNavigation();

  // ── Hooks ──────────────────────────────────
  const { post } = useAxiosHook();
  const { fetchCashPickupTransactionList } = useRadiantHook();
  const { longitude, latitude } = useLocationHook();

  // ── State ──────────────────────────────────
  const [cashPickupList, setCashPickupList] = useState([]);
  const [isLoading, setIsLoading]           = useState(false);
  const [refreshing, setRefreshing]         = useState(false);
  const [outOff, setOutOff]                 = useState(false);
  const [showModal, setShowModal]           = useState(false);
  const [menualStatus, setMenualStatus]     = useState('');
  const [clientStatus, setClientStatus]     = useState([]);

  // ── Fetch List ─────────────────────────────
  const fetchData = async () => {
    setIsLoading(true);
    const res = await fetchCashPickupTransactionList();
    setCashPickupList(res ?? []);
    setIsLoading(false);
  };

  
  // ── Manual Insert ──────────────────────────
  const ManualInsert = async () => {
    try {
      const res = await post({ url: APP_URLS.ManualInsertRequest });
      const status = res?.Content?.ADDINFO?.status;
      console.log('ManualInsert status:', status);
    } catch (error) {
      console.error('❌ Error in ManualInsert:', error);
    }
  };

 const handleItemPress = async (item: any) => {
  try {
    await AsyncStorage.setItem('pickup_status', 'unverified');

    if (item.LatlongFlag === '1') {
      const distance = getDistance(
        { latitude: Loc_Data['latitude'], longitude: Loc_Data['longitude'] },
        { latitude: item.Latitude, longitude: item.Longitude }
      );

      if (distance < 100) {
        fetchData1(item);
      } else {
        // ❌ FAIL — location door hai
        ToastAndroid.show(`❌ Too far: ${distance}m`, ToastAndroid.LONG);
        console.log('❌ Location fail — distance:', distance);
        setOutOff(true);
      }
    } else {
      fetchData1(item);
    }
  } catch (error) {
    // ❌ FAIL — AsyncStorage ya location error
    ToastAndroid.show(`❌ Press error: ${error.message}`, ToastAndroid.LONG);
    console.log('❌ handleItemPress fail:', error.message);
  }
};

const fetchData1 = async (item: any) => {
  dispatch(setRadiantList(item));

  try {
    if (rctype === 'PrePay') {
      navigation.navigate('CmsPrePay', { item });
      return;
    }

    const responseUrl = `${APP_URLS.CheckPickupstatus}?clientname=${item.CustName}`;
    const statusResponse = await post({ url: responseUrl });

    // ❌ FAIL — API null
    if (!statusResponse) {
      ToastAndroid.show('❌ API response null', ToastAndroid.LONG);
      console.log('❌ statusResponse null');
      return;
    }

    const addinfo = statusResponse?.Content?.ADDINFO || {};
    const { status, paymenttype, remain, manualreqsts, HCIStatus } = addinfo;

    // ❌ FAIL — status missing
    if (!status) {
      ToastAndroid.show('❌ Status missing in response', ToastAndroid.LONG);
      console.log('❌ status null | addinfo:', JSON.stringify(addinfo));
      return;
    }

    setMenualStatus(manualreqsts);
    await AsyncStorage.setItem('pickuptype', status ?? '');
    await AsyncStorage.setItem('HCIStatus', HCIStatus ?? '');

    if (status === 'Online' && paymenttype === 'PostPay') {
      if (remain === 0 || (remain > 0 && manualreqsts === 'Y')) {
        navigation.navigate('CmsCoustomerInfo', { item });
      } else if (remain > 0 && (manualreqsts === 'N' || manualreqsts === 'P')) {
        setShowModal(true);
      } else {
        // ❌ FAIL — PostPay but unknown condition
        ToastAndroid.show(`❌ Unknown PostPay condition — remain:${remain} manual:${manualreqsts}`, ToastAndroid.LONG);
        console.log('❌ PostPay unknown — remain:', remain, 'manual:', manualreqsts);
        navigation.navigate('PicUpScreen', { item, CodeId: '', Mobile: '' });
      }
    } else {
      // ❌ Log karo kyun else mein gaya
      if (status !== 'Online' || paymenttype !== 'PostPay') {
        console.log('❌ Not Online/PostPay — status:', status, 'paymenttype:', paymenttype);
        ToastAndroid.show(`status:${status} | pay:${paymenttype}`, ToastAndroid.LONG);
      }
      navigation.navigate('PicUpScreen', { item, CodeId: '', Mobile: '' });
    }

  } catch (error) {
    // ❌ FAIL — API ya navigation error
    ToastAndroid.show(`❌ fetchData1 fail: ${error.message}`, ToastAndroid.LONG);
    console.log('❌ fetchData1 fail:', error.message);
  } finally {
    setIsLoading(false);
  }
};

  // ── Lifecycle ──────────────────────────────
  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, []);

  // ── Render Item ────────────────────────────
  const renderItem = ({ item }: any) => (
    <LinearGradient
      colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={styles.linearGradient}
    >
      <TouchableOpacity
        onPress={() => handleItemPress(item)}
        style={styles.itemBtn}
        activeOpacity={0.85}
      >
        {/* ── Row 1: Name + Type ── */}
        <View style={styles.itemRow}>
          <View style={styles.textContainer}>
            <Text style={styles.nameText}>{item.CustName}</Text>
          </View>
          <View style={styles.rightContainer}>
            <RadintPickupSvg size={20} color="#fff" />
            <Text style={styles.pickupText}>{item.Type}</Text>
          </View>
        </View>

        {/* ── Address ── */}
        <Text style={styles.addressText}>{item?.PointName}</Text>

        {/* ── Row 2: Transaction Count + Arrow ── */}
        <View style={[styles.itemRow, { borderBottomWidth: 0 }]}>
          <View style={styles.textContainer}>
            <Text style={styles.clientCodeText}>Number Of Transaction / Slip</Text>
            <Text style={styles.pickupCount}>{item.ClientCode?.length} +</Text>
          </View>
          <View style={styles.rightContainer}>
            <NextErrowSvg2 />
          </View>
        </View>
      </TouchableOpacity>
    </LinearGradient>
  );

  // ── UI ─────────────────────────────────────
  return (
    <View style={styles.main}>

      {/* ── Header ── */}
      <AppBarSecond title="Add Pickup Request"  onPressBack={() => {
            navigation.navigate('RadiantTransactionScreen',
            );}}/>

      {/* ── Wallet / QR ── */}
      <View>
        {rctype === 'PrePay' ? <CmsQrAddMoney /> : <WalletCard />}
      </View>

      {/* ── Body ── */}
      <View style={styles.container}>

        {/* ── Location Bar ── */}
        <View>
          <Text style={[styles.locationTxt, { backgroundColor: colorConfig.secondaryColor }]}>
            My Live Coordinates
          </Text>
          <View style={[styles.topAppBar, {
            borderColor: colorConfig.secondaryColor,
            backgroundColor: `${colorConfig.secondaryColor}33`,
          }]}>
            <CmsLocationSvg />
            <View>
              <Text style={styles.topText}>latitude : {Loc_Data['latitude']}</Text>
              <Text style={styles.topText}>longitude : {Loc_Data['longitude']}</Text>
            </View>
          </View>
        </View>

        {/* ── List ── */}
        {isLoading ? (
          <ShowLoader />
        ) : cashPickupList?.length > 0 ? (
          <FlashList
            data={cashPickupList}
            renderItem={renderItem}
            estimatedItemSize={70}
            keyExtractor={(_, index) => index.toString()}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        ) : (
          <NoDatafound />
        )}
      </View>

      {/* ── Modals ── */}
      <LocationModal visible={outOff} onClose={() => setOutOff(false)} />

      <CheckPickupstatusModel
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSave={() => {
          ManualInsert();
          if (menualStatus === 'R') {
            navigation.navigate('CashPicUpReport');
          }
        }}
        title={
          menualStatus === 'P' ? 'Waiting for Approval' :
          menualStatus === 'N' ? 'Request to Admin' :
          'Pay Now'
        }
      />
    </View>
  );
};

export default CashPickup;

// ─────────────────────────────────────────────
const styles = StyleSheet.create({
  main:          { flex: 1 },
  container:     { flex: 1, paddingBottom: hScale(10), paddingHorizontal: wScale(10), marginTop: hScale(10) },

  // ── Top Bar ──
  topAppBar:     { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: wScale(20), marginBottom: hScale(15), borderWidth: hScale(4), borderRadius: 10, alignItems: 'center', paddingVertical: hScale(5) },
  topText:       { color: '#000', fontSize: wScale(16), textTransform: 'uppercase', textAlign: 'right' },
  locationTxt:   { fontSize: wScale(14), color: '#fff',
    paddingHorizontal: 
    wScale(4), borderRadius: 4, marginBottom: -11, zIndex: 99, height: hScale(18), textAlign: 'center', lineHeight: hScale(16) ,
    width:'88%',
  alignSelf: 'center',  // ✅ center ho jayega 
  },

  // ── List Item ──
  linearGradient:{ marginBottom: hScale(10), borderRadius: 5, elevation: 5 },
  itemBtn:       { paddingHorizontal: wScale(8), paddingVertical: hScale(8) },
  itemRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#ccc', paddingBottom: hScale(4), marginBottom: hScale(4) },
  textContainer: { flex: 1 },
  rightContainer:{ alignItems: 'flex-end' },
  nameText:      { color: '#fff', fontSize: FontSize.medium, fontWeight: 'bold' },
  clientCodeText:{ color: 'yellow', fontSize: 14 },
  addressText:   { color: '#d3d3d3', fontSize: FontSize.small },
  pickupText:    { color: '#d3d3d3', fontSize: FontSize.tiny },
  pickupCount:   { color: 'yellow', fontSize: FontSize.medium, marginRight: 5, fontWeight: 'bold' },
});