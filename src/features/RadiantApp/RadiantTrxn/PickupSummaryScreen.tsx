import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image, Dimensions,
  TouchableOpacity,
  ToastAndroid,
  Linking,
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import QrcodSvg from '../../drawer/svgimgcomponents/QrcodSvg';
import CheckSvg from '../../drawer/svgimgcomponents/CheckSvg';
import ShowLoader from '../../../components/ShowLoder';

import { hScale, wScale } from '../../../utils/styles/dimensions';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ViewShot, { captureRef } from 'react-native-view-shot';
import Share from "react-native-share";
import CmsSuccessModal from '../../../components/CmsSuccessModal';
import { playSound } from '../../dashboard/components/Sounds';
import NoDatafound from '../../drawer/svgimgcomponents/Nodatafound';
import { setPartialAmounts } from '../../../reduxUtils/store/userInfoSlice';


const initialLayout = { width: Dimensions.get('window').width };

const PickupSummaryScreen = ({ route }) => {
  const { status, message } = route.params;
  console.log(route.params, '=-=-=-=-', status, message);

  const navigation = useNavigation();
  const { post } = useAxiosHook();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [routes, setRoutes] = useState([]);
  const CodeId = route?.params?.CodeId || '09090'; // Or pass via route
  const [showSuccessModal, setShowSuccessModal] = useState(true);
  const { colorConfig, IsRington } = useSelector((state: RootState) => state.userInfo);
  console.log(index, '909090');
  const dispatch = useDispatch();
  useEffect(() => {
    if (message) {
      setIsLoading(false);
if (message) {
    dispatch(setPartialAmounts({ total: 0, current: 0 }));
  }
    }
    if (CodeId) {
      getPDFData(CodeId);
    } else {
      alert("❌ TXN ID is missing");
      setIsLoading(false);
    }

    playSound('Success', true)
  }, [CodeId, message]);

  const getPDFData = async (id) => {
    try {
      const url = `${APP_URLS.RadiantPDF}${id}`;
      const res = await post({ url });

      if (res?.Content?.length > 0) {
        setData(res.Content);

        setRoutes(
          res.Content.map((item, idx) => ({
            key: `tab-${idx}`,
            title: `Slip-${idx + 1}`,
          }))
        );
        setIsLoading(false);

      } else {
        // Agar content nahi mila, data aur routes empty set karenge
        setData([]);
        setRoutes([]);
        setIsLoading(false);

      }
    } catch (error) {
      console.error("❌ Error fetching PDF:", error.message);
      // Error me bhi data aur routes empty
      setData([]);
      setRoutes([]);
    } finally {
      setIsLoading(false);
    }
  };




  const defaultContent = [
    {
      Amountinwords: "Eight Thousand One Hundred and Fifty Rupees Only",
      pis_hcl_no: "775457",
      hcl_no: "X8862078",
      transId: "153467126",
      trans_date: "2025-08-11 11:34",
      cust_name: "FASHNEAR TECHNOLOGIES PVT LTD",
      point_name: "OLPURA GHOGHA BiharOLPURA GHOGHA BiharOLPURA GHOGHA Bihar",
      shop_id: "RCE-RSC00893",
      ceId: "RCE209",
      s500: "3",
      s200: "18",
      s100: "25",
      s50: "10",
      s20: "2",
      s10: "1",
      s5: "0",
      coins: "0",
      pickup_amount: "8150",
      Name: "MITHILESH KUMAR",
      Mobile: "7366007448",
      PhotoName: "https://vastbazaar.com/Uploads/4726ac2c-d757-42c7-bb1c-39dfc176ceca139Photomitlesh pic.jpg",
      contact_peroson: "Anile Kumar",
      contact_Mobile: "+91 8955664610",
      Email: "N/A"
    },
    {
      Amountinwords: "Five Thousand Four Hundred and Thirty-Two Rupees Only",
      pis_hcl_no: "892346",
      hcl_no: "X9334895",
      transId: "264832574",
      trans_date: "2025-08-18 09:20",
      cust_name: "TECHNEXT SOLUTIONS",
      point_name: "SARAI BAZAR MuzaffarpurSARAI BAZAR Muzaffarpur",
      shop_id: "RCE-RSC00123",
      ceId: "RCE307",
      s500: "2",
      s200: "10",
      s100: "15",
      s50: "5",
      s20: "3",
      s10: "0",
      s5: "4",
      coins: "1",
      pickup_amount: "5432",
      Name: "SUMIT RAI",
      Mobile: "9478362190",
      PhotoName: "https://example.com/Images/SumitRai.jpg",
      contact_peroson: "Praveen Kumar",
      contact_Mobile: "+91 9087654321",
      Email: "sumitrai@email.com"
    },
    {
      Amountinwords: "Five Thousand Four Hundred and Thirty-Two Rupees Only",
      pis_hcl_no: "892346",
      hcl_no: "X9334895",
      transId: "264832574",
      trans_date: "2025-08-18 09:20",
      cust_name: "TECHNEXT SOLUTIONS",
      point_name: "SARAI BAZAR MuzaffarpurSARAI BAZAR Muzaffarpur",
      shop_id: "RCE-RSC00123",
      ceId: "RCE307",
      s500: "2",
      s200: "10",
      s100: "15",
      s50: "5",
      s20: "3",
      s10: "0",
      s5: "4",
      coins: "1",
      pickup_amount: "5432",
      Name: "SUMIT RAI",
      Mobile: "9478362190",
      PhotoName: "https://example.com/Images/SumitRai.jpg",
      contact_peroson: "Praveen Kumar",
      contact_Mobile: "+91 9087654321",
      Email: "sumitrai@email.com"
    },
    {
      Amountinwords: "Five Thousand Four Hundred and Thirty-Two Rupees Only",
      pis_hcl_no: "892346",
      hcl_no: "X9334895",
      transId: "264832574",
      trans_date: "2025-08-18 09:20",
      cust_name: "TECHNEXT SOLUTIONS",
      point_name: "SARAI BAZAR MuzaffarpurSARAI BAZAR Muzaffarpur",
      shop_id: "RCE-RSC00123",
      ceId: "RCE307",
      s500: "2",
      s200: "10",
      s100: "15",
      s50: "5",
      s20: "3",
      s10: "0",
      s5: "4",
      coins: "1",
      pickup_amount: "5432",
      Name: "SUMIT RAI",
      Mobile: "9478362190",
      PhotoName: "https://example.com/Images/SumitRai.jpg",
      contact_peroson: "Praveen Kumar",
      contact_Mobile: "+91 9087654321",
      Email: "sumitrai@email.com"
    }
  ];

  const capRef = useRef();

  const onShare = useCallback(async () => {

    try {
      const uri = await captureRef(capRef, {
        format: "jpg",
        quality: 0.7,
      });
      await Share.open({
        message: `Hi, I am sharing the transaction details using ${APP_URLS.AppName} App.`,
        url: uri,
      });
    } catch (e) {
      ToastAndroid.show("Transaction details not shared", ToastAndroid.SHORT);
    }
  }, []);

  const renderDenominations = (entry) => {
    const denominations = [
      { denom: 500, value: parseInt(entry?.s500 || '0') },
      { denom: 200, value: parseInt(entry?.s200 || '0') },
      { denom: 100, value: parseInt(entry?.s100 || '0') },
      { denom: 50, value: parseInt(entry?.s50 || '0') },
      { denom: 20, value: parseInt(entry?.s20 || '0') },
      { denom: 10, value: parseInt(entry?.s10 || '0') },
      { denom: 5, value: parseInt(entry?.s5 || '0') },
      { denom: 'Others', value: parseInt(entry?.coins || '0') },
    ];
    // useEffect(() => {
    //   playSound( 'Success' ,true)

    //   console.log(
    //     IsRington,


    //   )},[]);

    return (
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, styles.headerCell, styles.col25]}>Denom</Text>
          <Text style={[styles.tableCell, styles.headerCell, styles.col25]}>No. of Notes</Text>
          <Text style={[styles.tableCell, styles.headerCell, styles.col50]}>Amount (INR)</Text>
        </View>

        {denominations.map((item, idx) => (
          <View key={idx} style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.col25]}>{item.denom}</Text>
            <Text style={[styles.tableCell, styles.col25]}>{item.value}</Text>
            <Text style={[styles.tableCell, styles.col50]}>
              {item.denom !== 'Others' ? item.denom * item.value : item.value}
            </Text>
          </View>
        ))}

        <View style={styles.tableRow}>
          <Text style={[styles.tableCell, styles.col25, { fontWeight: 'bold' }]}>Total Amount</Text>
          <Text style={[styles.tableCell, styles.col25]}></Text>

          <Text style={[styles.tableCell, styles.col50, { fontWeight: 'bold', }]}>
            {entry?.pickup_amount || '---'}
          </Text>
        </View>


      </View>
    );
  };

  const renderScene = ({ route }) => {
    const idx = parseInt(route.key.split('-')[1], 10);
    const entry = data[idx];
    const CodeId = entry?.transId;

    return (
      <ScrollView style={{ flex: 1, }}>
        <ViewShot ref={capRef}
          options={{
            fileName: "TransactionReciept",
            format: "jpg",
            quality: 0.9,
          }}>
          <View style={styles.topcontainer}>

            <Image source={require('../../../../assets/images/radiant.png')} style={styles.imgstyle} resizeMode="contain" />
            <View>
              <Text style={styles.title}>Radiant</Text>
              <Text style={styles.title2}>CASH MANAGEMENT SERVICES LIMITED</Text>
              <Text style={styles.companyISO}>(An ISO 9001 2015 Company)</Text>
            </View>
            <Image source={require('../../../../assets/images/cmsImg/CmsSlipQr.jpg')}
              style={{ width: wScale(70), height: hScale(70), }} resizeMode='center'
            />

          </View>

          <View style={styles.container}>
            <View style={styles.infoSection}>
              <View style={styles.row}>
                <Text style={styles.time}>{entry?.hcislipallow === 'NotAllow' ? 'REQ ID- ' : 'Hci Slip'}
                  <Text style={{ color: '#191970' }}>{entry?.hcl_no || '---'}</Text></Text>
                <Text style={[styles.time,]}>Pickup Time: {entry?.trans_date || '---'}</Text>
              </View>

              <Text style={styles.label}>Customer (Bank) Name</Text>
              <Text style={styles.linkText}><Text style={{ color: '#191970' }}>{entry?.cust_name || '---'}</Text></Text>

              <Text style={styles.label}>Pickup Point (Name) Address</Text>
              <Text style={[styles.value, { fontSize: 12 }]}>{entry?.point_name || '---'}</Text>

              <View style={styles.row}>
                <View>
                  <Text style={styles.label}>Point Contact Person</Text>
                  <Text style={styles.value}>{entry?.ClientName || '---'}</Text>
                </View>
                <View style={styles.rightColum}>
                  <Text style={styles.label}>Point Mobile Number</Text>
                  <Text style={styles.value}>{entry?.ClientMobile || '---'}</Text>
                </View>
              </View>

              <View style={styles.row}>
                <View>
                  <Text style={styles.label}>Point/Client/Shop ID</Text>
                  <Text style={styles.value}>{entry?.shop_id || '---'}</Text>
                </View>
                <View style={styles.rightColum}>
                  <Text style={styles.label}>Pickup Transaction ID</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{ borderRadius: 20, backgroundColor: 'green', alignItems: 'center', padding: 5 }}>
                      <CheckSvg size={7} />
                    </View>
                    <Text style={[styles.value, { marginBottom: 0, marginLeft: 4 }]}>{CodeId || '---'}</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.rceSection}>
              <Image source={{ uri: entry?.PhotoName }} style={styles.avatar} resizeMode='stretch' />
              <View style={{ flex: 1 }}>
                <View style={styles.row}>
                  <Text style={[styles.rceText, styles.bold]}>RCE’s Name: </Text>
                  <Text style={styles.rceText}>{entry?.Name || '---'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={[styles.rceText, styles.bold]}>Employee ID: </Text>
                  <Text style={styles.rceText}>{entry?.ceId || '---'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={[styles.rceText, styles.bold]}>Mobile No.: </Text>
                  <Text style={styles.rceText}>{entry?.Mobile || '---'}</Text>
                </View>
                <View style={styles.row}>
                  <Text style={[styles.rceText, styles.bold]}>Email ID: </Text>
                  <Text style={styles.rceText}>{entry?.emailid || '---'}</Text>
                </View>
              </View>
            </View>

            {renderDenominations(entry)}

            <View style={styles.amountWords}>
              <Text style={styles.amountWordsText}>Amount in Words: {entry?.Amountinwords || '---'}</Text>
            </View>

            <Text style={styles.footerText}>
              This is a system-generated slip, it does not require a physical signature.
            </Text>
          </View>
        </ViewShot>


      </ScrollView>
    );
  };
  useEffect(() => {
    console.log("Current Tab Index:", index === data.length);
  }, [index]);

  if (isLoading) return <ShowLoader />;

  return (
    <View style={{ flex: 1 }}>
      <AppBarSecond title="Pickup Summary"
        onPressBack={() => navigation.navigate('CashPickup')}
        actionButton={
          <TouchableOpacity style={{ alignItems: 'center', }} onPress={onShare}>
            <FontAwesome
              name="whatsapp"
              color="#fff"
              size={20}
            />
            <Text style={{ color: '#fff', fontSize: wScale(10) }}>Share-Slip</Text>
          </TouchableOpacity>}
        onActionPress={() => { }}
      />
      {data.length === 0 ? (
        <NoDatafound />
      ) : (
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={initialLayout}
          renderTabBar={props => (
            <TabBar
              {...props}
              indicatorStyle={styles.indicator}
              style={[
                styles.tabBar,
                {
                  backgroundColor: `${colorConfig.secondaryColor}80`,
                  height: data.length < 2 ? 0 : hScale(40),
                },
              ]}
              tabStyle={styles.tab}
              labelStyle={styles.tabLabel}
            />
          )}
        />
      )}


      <CmsSuccessModal
        visible={showSuccessModal}
        message={message}
        onClose={async () => {
          setShowSuccessModal(false);

        }}
      />
    </View>
  );
};

export default PickupSummaryScreen;

const styles = StyleSheet.create({
  main: {
    flex: 1
  },
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: wScale(10),
    flex: 1,
    paddingBottom: hScale(20)
  },
  header: {
    backgroundColor: '#4f64f5',
    paddingVertical: hScale(12),
  },
  headerText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: wScale(20),
    fontWeight: 'bold',
  },
  companySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#191970',
    padding: wScale(10),
    marginTop: hScale(10),
  },
  companyLeft: {
    flex: 1,
  },
  companyTitle: {
    color: '#fff',
    fontSize: wScale(18),
    fontWeight: 'bold',
  },
  companySubtitle: {
    color: '#fff',
    fontSize: wScale(12),
  },
  companyISO: {
    color: '#ccc',
    fontSize: wScale(15),
    textAlign: 'center'
  },
  infoSection: {
    marginTop: hScale(0),
    paddingTop: hScale(10),
    borderRadius: wScale(6),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
  rightColum: {
    alignItems: 'flex-end',
    flex: 1,
  },
  value: {
    color: '#191970',
    marginBottom: hScale(6),
    fontSize: hScale(14),
    fontWeight: 'bold',
  },
  time: {
    color: '#000',
    marginBottom: hScale(6),
    fontSize: hScale(11),
    fontWeight: 'bold',
  },
  label: {
    color: '#000',
    fontSize: hScale(12),
    fontWeight: 'bold',
    marginTop: hScale(5)
  },
  bold: {
    fontWeight: 'bold',
  },
  linkText: {
    fontSize: wScale(18),
    fontWeight: 'bold',
    color: '#191970',

  },

  code: {
    color: '#1c5ed3',
    fontWeight: 'bold',
  },
  successCode: {
    color: 'green',
    fontWeight: 'bold',
  },
  rceSection: {
    flexDirection: 'row',
    marginTop: hScale(8),
    padding: wScale(8),
    backgroundColor: '#000',
    alignItems: 'center',
  },
  avatar: {
    width: (80),
    height: wScale(90),
    marginRight: wScale(10),
  },
  rceText: {
    color: '#fff',
    fontSize: wScale(13),
    marginBottom: hScale(4),
  },
  table: {
    marginTop: hScale(10),
    borderWidth: wScale(.5),
    borderColor: '#000',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: wScale(.5),
    backgroundColor: '#ddd',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: wScale(.5),
  },
  tableCell: {
    flex: 1,
    borderRightWidth: wScale(.5),
    borderColor: '#000',
    textAlign: 'center',
    color: '#1c5ed3',
    fontSize: wScale(13),
    padding: hScale(2)
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: wScale(15),
  },
  amountWords: {
    borderWidth: wScale(1),
    borderColor: '#000',
    padding: wScale(8),
    marginTop: hScale(10),
  },
  topcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wScale(0),
    borderWidth: wScale(4),
    marginBottom: hScale(0),
    backgroundColor: '#271851',
    marginTop: hScale(8)
  },
  imgstyle: {
    width: wScale(75),
    height: wScale(75),
  },
  column: {
    // No dimensions to scale
  },
  title: {
    fontSize: wScale(40),
    fontWeight: 'bold',
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: wScale(8),
    lineHeight: hScale(35)
  },
  title2: {
    fontSize: wScale(12),
    color: '#fff',
    marginTop: hScale(-6),
    paddingLeft: wScale(5)
  },
  col25: {
    flex: 1,
  },
  col50: {
    flex: 2,
  },
  amountWordsText: {
    fontSize: wScale(12),
    color: '#191970',
  },
  footerText: {
    fontSize: wScale(12),
    color: '#191970',
    textAlign: 'center',
    marginTop: hScale(9)
  },
  indicator: {
    backgroundColor: '#191970',
  },
  tabBar: {
    elevation: 0,
  },
  tab: {
    height: hScale(40),
    paddingVertical: hScale(0),
    elevation: 0,
  },
  tabLabel: {
    fontSize: hScale(13),
    fontWeight: 'bold',
    color: '#191970',
    textAlign: 'center',
    lineHeight: hScale(16),
  },

});

