import { translate } from "../../../utils/languageUtils/I18n";
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Platform, Linking, ScrollView, Alert } from 'react-native';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import DateRangePicker from '../../../components/DateRange';
import AppBarSecond from '../headerAppbar/AppBarSecond';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import BorderLine from '../../../components/BorderLine';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ShowLoader from '../../../components/ShowLoder';
import NoDatafound from '../svgimgcomponents/Nodatafound';
import { commonStyles } from '../../../utils/styles/commonStyles';
import Ionicons from 'react-native-vector-icons/Ionicons';

const LoginReport = () => {
  const { IsDealer, colorConfig } = useSelector((state: RootState) => state.userInfo);
  const { get } = useAxiosHook();

  const [inforeport, setInforeport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchnumber, setSearchnumber] = useState('');
  const [selectedDate, setSelectedDate] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });

  // API Call with Null Safety
  const recentTransactions = useCallback(async (from, to, status) => {
    setLoading(true);
    try {
      const formattedFrom = new Date(from || new Date()).toISOString().split('T')[0];
      const formattedTo = new Date(to || new Date()).toISOString().split('T')[0];

      const url = `${APP_URLS.LoginDetailsRetailer}?txt_frm_date=${formattedFrom}&txt_to_date=${formattedTo}&ddltop=${status ?? ''}`;
      const url2 = `${APP_URLS.LoginDetailsDealer}?txt_frm_date=${formattedFrom}&txt_to_date=${formattedTo}&ddltop=${status ?? ''}`;

      const response = await get({ url: IsDealer ? url2 : url });

      // Crash Fix: Check if response and Report exist before setting state
      if (response && Array.isArray(response.Report)) {
        setInforeport(response.Report);
      } else {
        setInforeport([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setInforeport([]); // Error hone par empty list set karein taaki loop na phate
    } finally {
      setLoading(false);
    }
  }, [IsDealer, get]);

  useEffect(() => {
    recentTransactions(selectedDate.from, selectedDate.to, selectedStatus);
  }, [selectedDate, selectedStatus, recentTransactions]);

  // Map Handler with Lat/Long Safety
  const handlePress = async (latitude, longitude) => {
    if (!latitude || !longitude) {
      Alert.alert(translate("Error"), translate("Location coordinates not available"));
      return;
    }

    setLoading(true);
    const geoUrl = Platform.select({
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`,
      ios: `maps:0,0?q=${latitude},${longitude}`,
    });

    const webUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

    try {
      const canOpen = await Linking.canOpenURL(geoUrl);
      if (canOpen) {
        await Linking.openURL(geoUrl);
      } else {
        await Linking.openURL(webUrl);
      }
    } catch (error) {
      console.error('Map open error:', error);
      Alert.alert("Error", "Unable to open maps");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      {/* Optional Chaining (?.) ensures app doesn't crash if item is null */}
      <TouchableOpacity onPress={() => handlePress(item?.Latitude, item?.Logitude)}>
        <View style={[styles.headerRow, { backgroundColor: colorConfig?.secondaryColor ?? '#eee' }]}>
          <View>
            <Text style={styles.timeLabel}>{translate("Current_Login_Time")}</Text>
            <Text style={styles.timeVabel}>{item?.Currentlogin ?? '--'}</Text>
          </View>
          <View style={styles.rightContainer}>
            <Text style={styles.timeLabel}>{translate("Last_Login_Time")}</Text>
            <Text style={styles.timeVabel}>{item?.LastLogin ?? '--'}</Text>
          </View>
        </View>

        <View style={[styles.cardContent, {
          backgroundColor: `${colorConfig?.secondaryColor ?? '#eee'}1D`,
          borderColor: colorConfig?.secondaryColor ?? '#ccc'
        }]}>
          <View style={styles.loginTimeSection}>
            <View style={styles.typeI}>
              {item?.Logintype === 'Apps' ?
                <MaterialIcons name="phone-iphone" color={colorConfig?.primaryColor} size={34} /> :
                <MaterialCommunityIcons name="web" color={colorConfig?.primaryColor} size={34} />}
              <View>
                <Text style={styles.label}>{translate("Login_Type")}</Text>
                <Text style={[styles.btnText, { color: colorConfig?.primaryColor }]}>
                  {IsDealer ? (item?.User ?? '--') : (item?.Logintype ?? '--')}
                </Text>
              </View>
            </View>

            <View style={styles.typeI}>
              <Ionicons name="location" color={colorConfig?.primaryColor} size={34} />
              <View style={styles.rightContainer}>
                <Text style={styles.label}>{translate("City_Name")}</Text>
                <Text style={[styles.btnText, { color: colorConfig?.primaryColor }]}>
                  {item?.City ?? '--'}
                </Text>
              </View>
            </View>
          </View>

          <BorderLine />

          {/* Row Data with Null Checks */}
          {[
            { label: "Internet_Type", value: item?.InternetType },
            { label: "Full_Address", value: item?.Location, fullWidth: true },
            { label: "Pin_Code", value: item?.PostalCode },
            { label: "Latitude", value: item?.Latitude },
            { label: "Longitude", value: item?.Logitude },
            { label: "Email_Id", value: item?.User },
            { label: "Model_Number", value: item?.ModelNo },
            { label: "Brand_Name", value: item?.BrandName },
          ].map((row, idx) => (
            <React.Fragment key={idx}>
              <View style={row.fullWidth ? styles.addressText : styles.loginTimeSection}>
                <Text style={styles.label}>{translate(row.label)}</Text>
                <Text style={styles.valueText}>{row.value || 'N/A'}</Text>
              </View>
              <BorderLine />
            </React.Fragment>
          ))}
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={commonStyles.screenContainer}>
      <AppBarSecond title={'Login History'} />
      
      <DateRangePicker
        onDateSelected={(from, to) => setSelectedDate({ from, to })}
        SearchPress={(from, to, status) => recentTransactions(from, to, status)}
        status={selectedStatus}
        setStatus={setSelectedStatus}
        searchnumber={searchnumber}
        setSearchnumber={setSearchnumber}
        isStShow={false}
        isshowRetailer={false}
      />

      {loading && <ShowLoader />}

      <FlatList
        data={inforeport}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        contentContainerStyle={styles.main}
        ListEmptyComponent={!loading ? <NoDatafound /> : null}
      />
    </View>
  );
};

// ... Styles remain mostly the same, ensuring flex and widths are handled.
const styles = StyleSheet.create({
  card: {
    marginBottom: hScale(10),
    borderRadius: 8,
    backgroundColor: '#fff',
    elevation: 3,
    marginHorizontal: hScale(10),
    overflow: 'hidden'
  },
  main: { paddingVertical: hScale(10) },
  cardContent: {
    paddingHorizontal: wScale(10),
    borderWidth: 1,
    borderBottomEndRadius: 8,
    borderBottomLeftRadius: 8,
    paddingBottom: hScale(5),
    borderTopWidth: 0
  },
  loginTimeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hScale(8),
    alignItems: 'center'
  },
  label: { fontSize: 11, color: '#444' },
  valueText: { fontSize: wScale(13), color: '#000', fontWeight: '700' },
  headerRow: {
    paddingHorizontal: wScale(8),
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hScale(5)
  },
  timeVabel: { fontSize: wScale(12), color: '#000', fontWeight: 'bold' },
  timeLabel: { fontSize: wScale(10), color: '#000', opacity: 0.8 },
  btnText: { fontSize: wScale(13), fontWeight: 'bold', textTransform: 'uppercase' },
  typeI: { flexDirection: 'row', alignItems: 'center' },
  addressText: { paddingVertical: hScale(8) },
  rightContainer: { alignItems: 'flex-end', marginLeft: 10 }
});

export default LoginReport;