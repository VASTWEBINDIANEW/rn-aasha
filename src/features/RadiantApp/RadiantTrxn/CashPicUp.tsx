import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, PermissionsAndroid, Linking, Button, Alert, AsyncStorage } from 'react-native';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { FlashList } from '@shopify/flash-list';
import { colors, FontSize } from '../../../utils/styles/theme';
import { useNavigation } from '@react-navigation/native';
import useAxiosHook from '../../../utils/network/AxiosClient';
import useRadiantHook from '../../Financial/hook/useRadiantHook';
import { check, openSettings, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import NoDatafound from '../../drawer/svgimgcomponents/Nodatafound';
import LinearGradient from 'react-native-linear-gradient';
import RadintPickupSvg from '../../drawer/svgimgcomponents/RadintPickupSvg';
import NextErrowSvg2 from '../../drawer/svgimgcomponents/NextErrowSvg2';
import { getDistance } from 'geolib';
import { useLocationHook } from '../../../hooks/useLocationHook';
import CmsLocationSvg from '../../drawer/svgimgcomponents/CmsLocationSvg';
import ShowLoader from '../../../components/ShowLoder';
import WalletCard from './WalletCard';
import { APP_URLS } from '../../../utils/network/urls';
import LocationModal from '../../../components/LocationModal';
import CheckPickupstatusModel from '../../../components/CheckPickupstatusModel';
import { useDispatch } from 'react-redux';
import { clear, log } from 'console';
import AllBalance from '../../../components/AllBalance';
import CmsQrAddMoney from './CmsQrAddMoney';
import { clearEntryScreen, setRadiantList } from '../../../reduxUtils/store/userInfoSlice';
const CashPickup = () => {
  const { colorConfig, Loc_Data, cmsVerify, rctype } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}20`;
  const navigation = useNavigation();
  const [number, setNumber] = useState('');
  const [encryptedNumber, setEncryptedNumber] = useState('');
  const [outOff, setOutOff] = useState(false);
  const [showModal, setshowModal] = useState(false);

  const data = [
    {
      "Amount": "0",
      "Captions": {
        "GenSlip": "ATEST1",
        "HclNo": "Radiant Receipt / HCI Slip No",
        "PickupAmount": "Pickup Amount", "PisDate":
          "Slip Date", "PisHclNo": "ATEST", "RecNo": "ARUL Scratch card no"
      },
      "ClientCode": ["INSTAK~BNG007"], "ClientId": "154",
      "CustName": "FASHNEAR TECHNOLOGIES PVT LTD", "DepTypess": "Burial",
      "Latitude": "17.8031829", "LatlongFlag": "0", "Longitude": "10.0357037",
      "OtpDay": "", "PickupSession": "", "PinNo": "1234", "PointName":
        "KEMPEGOWDA INTERNATIONAL AIRPORT BENGALURU KIAL RD DEVANAHALLI BENGALURU",
      'qr_value': '2421', "QrStatus": "",
      "RadiantQrSlipComplete": "No", "ShopId": "RSC204925",
      "TransDate": "27-02-2025", "TransId": "136764585", "Type": "Pickup"
    },]
  const { cashPickUpTransactionList, fetchCashPickupTransactionList } = useRadiantHook();
  const [cashPickupList, setCashPickupList] = useState([]);
  const { get, post } = useAxiosHook();
  const { longitude, latitude } = useLocationHook()
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setisLoading] = useState(false);
  const [clientStatus, setClientStatus] = useState([])
  const [menualStatus, setMenualStatus] = useState('')

  const fetchData = async () => {
    setisLoading(true)
    const res = await fetchCashPickupTransactionList();
    setCashPickupList(res ? res : res);

    console.log(res, '*************************************l');
    setisLoading(false)
  };
  const fetchData1 = async (item) => {
    dispatch(setRadiantList(item))
    try {
      const responseUrl = `${APP_URLS.CheckPickupstatus}?clientname=${item.CustName}`;
      // const responseUrl = `${APP_URLS.CheckPickupstatus}?clientname=FASHNEAR TECHNOLOGIES PVT LTD`;

      console.log(responseUrl, 'Pickup Status responseUrl', responseUrl);
      console.log(item.CustName, '-0-0-0-0-0-0-0-0-0',);

      console.log(responseUrl, 'Pickup Status responseUrl', responseUrl);


      const statusResponse = await post({ url: responseUrl });

      setClientStatus(statusResponse);

      const addinfo = statusResponse?.Content?.ADDINFO || {};

      console.log('Pickup Status responseUrl', addinfo, '90909090909090');

      const { status, paymenttype, remain, manualreqsts, HCIStatus } = addinfo;
      console.log(status, 'staaa', paymenttype, remain, 'rrrmm', manualreqsts, HCIStatus, 'hhh');
      // Online staaa PostPay -93242 rrrmm N Allow

      setMenualStatus(manualreqsts);

      await AsyncStorage.setItem('pickuptype', status);
      await AsyncStorage.setItem('HCIStatus', HCIStatus);


      const savedPickupType = await AsyncStorage.getItem("pickuptype");

      if (savedPickupType !== null) {
        console.log("✅ pickuptype saved successfully:", savedPickupType);
      } else {
        console.log("❌ pickuptype NOT saved");
      }

      if (rctype === 'PrePay') {
        navigation.navigate('CmsPrePay', { item });

        return;   // STOP here
      }
        if (status === 'Online' && paymenttype === 'PostPay') {
          if (remain === 0 || (remain > 0 && manualreqsts === 'Y')) {
            navigation.navigate('CmsCoustomerInfo', { item });
          } else if (remain > 0 && (manualreqsts === 'N' || manualreqsts === 'P')) {
            setshowModal(true);
          } else {

            navigation.navigate('PicUpScreen', { item, CodeId: '', Mobile: '' });
          }
        } else {

          navigation.navigate('PicUpScreen', { item, CodeId: '', Mobile: '' });
        }

    } catch (error) {
      console.error('Error in fetchData:', error);
    } finally {
      // ✅ Called once, no matter what
      setisLoading(false);
    }
  };


  const ManualInsert = async () => {
    try {
      const res = await post({ url: APP_URLS.ManualInsertRequest });

      const status = res?.Content?.ADDINFO?.status;
      if (status) {
        console.log('Status:', status, 'mmm',);
      } else {
        console.log('Status not found');
      }

    } catch (error) {
      console.error('Error in ManualInsert:', error);
    }
  };


  useEffect(() => {
    fetchData();

  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, []);

  const dispatch = useDispatch();
  const renderItem = ({ item }) => (
    <LinearGradient colors={[colorConfig.primaryColor, colorConfig.secondaryColor]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
      style={styles.LinearGradient}>
      <TouchableOpacity
        onPress={async () => {


// dispatch(clearEntryScreen(null))
          console.log(item)
          await AsyncStorage.setItem('pickup_status', 'unverified');

          console.log(item.CustName);
          if (item.LatlongFlag === '1') {
            try {
              const targetLocation = { latitude: item.Latitude, longitude: item.Longitude };
              console.log('Target Location:', targetLocation);
              console.log('Current Location:', { latitude: Loc_Data['latitude'], longitude: Loc_Data['longitude'] });

              const distance = getDistance({ latitude: Loc_Data['latitude'], longitude: Loc_Data['longitude'] }, targetLocation);
              console.log('Calculated Distance:', distance);

              if (distance < 100) {
                fetchData1(item);
              } else {

                setOutOff(true)
                // Alert.alert('Location Alert', 'Please do the process only within 100m of the location allotted to you. Please go to your location.');
              }
            } catch (error) {
              console.error('Error checking location:', error);
            }
          } else {
            fetchData1(item);
          }
        }}
        style={[styles.itembtn]}>
        <View style={[styles.itemContainer]}>
          <View style={styles.textContainer}>
            <Text style={styles.nameText}>{item.CustName}</Text>
          </View>
          <View style={styles.rightContainer}>
            <View style={styles.rightin}>
              <RadintPickupSvg size={20} color="#fff" />
              <Text style={styles.pickupText}>{item.Type}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.addressText}>{item?.PointName}</Text>
        <View style={[styles.itemContainer, { borderBottomWidth: 0 }]}>
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


  console.warn(showModal)
  return (
    <View style={styles.main}>
      <AppBarSecond title={'Add Pickup Request'} />

      <View style={{}}>
        {rctype === 'PrePay' ?
          <View style={{}}>
            < CmsQrAddMoney />
          </View> :
          <WalletCard />
        }
      </View>

      <View style={styles.container}>
        <View style={{
        }}>
          <View style={{
            flexDirection: 'row'
          }}>
            <Text style={[styles.locationtxt, {
              backgroundColor: colorConfig.secondaryColor,
            }]}>
              My Live Coordinates
            </Text>
          </View>
          <View style={[styles.topappBar, {
            borderColor: colorConfig.secondaryColor, backgroundColor: `${colorConfig.secondaryColor}33`,
          }]}>

            <CmsLocationSvg />
            <View>
              <Text style={styles.toptex}>latitude : {Loc_Data['latitude']}</Text>
              <Text style={styles.toptex}>longitude : {Loc_Data['longitude']}</Text>
            </View>
          </View>
        </View>

        {isLoading ? (
          <ShowLoader />
        ) : (
          <>
            {cashPickupList ? (
              <FlashList
                data={cashPickupList ? cashPickupList : cashPickupList}
                renderItem={renderItem}
                estimatedItemSize={70}
                keyExtractor={(item, index) => index.toString()}
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            ) : (
              <NoDatafound />
            )}
          </>
        )}
      </View>
      <LocationModal visible={outOff} onClose={() => setOutOff(false)} />

      <CheckPickupstatusModel visible={showModal}
        onClose={() => { setshowModal(false) }}
        onSave={() => {
          ManualInsert();
          console.log(menualStatus, '=000');
          if (menualStatus === 'R') {
            navigation.navigate('CashPicUpReport')
          }

        }}


        title={menualStatus === 'P'
          ? 'Waiting for Approval'
          : menualStatus === 'N'
            ? 'Request to Admin'
            : 'Pay Now'}

      />
    </View>
  );
};


const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingBottom: hScale(10),
    paddingHorizontal: wScale(10),
    marginTop: hScale(10)

  },
  topappBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: wScale(20),
    marginBottom: hScale(15),
    borderWidth: hScale(4),
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: hScale(5)
  },
  toptex: {
    color: '#000',
    fontSize: wScale(16),
    textTransform: 'uppercase',
    textAlign: 'right'
  },
  appBarText: {
    color: '#fff',
    fontSize: wScale(20),
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  LinearGradient: {
    color: '#fff',
    fontSize: wScale(20),
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginBottom: hScale(10),
    borderRadius: 5,
    elevation: 5
  },
  contentContainer: {
    height: hScale(70),
    backgroundColor: '#e45a55',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,

  },
  cashPickupText: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingBottom: hScale(4),
    marginBottom: hScale(4)
  },
  itembtn: {
    paddingHorizontal: wScale(8),
    paddingVertical: hScale(8)

  },
  textContainer: {
    flex: 1
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  rightin: {
    // flexDirection: 'row'
    alignItems: 'flex-end',
  },
  nameText: {
    color: '#fff',
    fontSize: FontSize.medium,
    fontWeight: 'bold',
  },
  clientCodeText: {
    color: 'yellow',
    fontSize: 14,
  },
  detailContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  addressText: {
    color: '#d3d3d3',
    fontSize: FontSize.small

  },
  pickupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start'
  },
  pickupText: {
    color: '#d3d3d3',
    fontSize: FontSize.tiny,

  },
  pickupCount: {
    color: 'yellow',
    fontSize: FontSize.medium,
    marginRight: 5,
    fontWeight: 'bold'
  },
  arrow: {
    color: '#fff',
    fontSize: 30,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  resultText: {
    fontSize: 18,
    color: 'red'
  },
  locationtxt: {
    fontSize: wScale(14),
    color: '#fff',
    left: wScale(18),
    paddingHorizontal: wScale(4),
    borderRadius: 4,
    marginBottom: -11,
    zIndex: 99,
    height: hScale(18),
    textAlign: 'center',
    lineHeight: hScale(16)


  },
});

export default CashPickup;


