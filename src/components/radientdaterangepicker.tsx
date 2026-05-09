import { translate } from "../utils/languageUtils/I18n";
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { hScale, SCREEN_HEIGHT, wScale } from '../utils/styles/dimensions';
import Calendarsvg from '../features/drawer/svgimgcomponents/Calendarsvg';
import SearchIcon from '../features/drawer/svgimgcomponents/Searchicon';
import { useSelector } from 'react-redux';
import { RootState } from '../reduxUtils/store';
import CustomCalendar from './Calender';
import { BottomSheet } from '@rneui/base';
import OnelineDropdownSvg from '../features/drawer/svgimgcomponents/simpledropdown';
import { colors } from '../utils/styles/theme';
import FilterSvg from '../features/drawer/svgimgcomponents/FilterSvg';
import useAxiosHook from '../utils/network/AxiosClient';
import { APP_URLS } from '../utils/network/urls';
import ClosseModalSvg2 from '../features/drawer/svgimgcomponents/ClosseModal2';
import { FlashList } from '@shopify/flash-list';

interface RadientdateRangePickerProps {
  onDateSelected: (from: Date, to: Date) => void;
  SearchPress: (from: Date, to: Date, status: string) => void;
  status: string;
  setSearchnumber: (string) => void;
  setStatus: (status: string) => void;
  isStShow: boolean;
  retailerID: (id: string) => void;
  isshowRetailer?: boolean;
}

const RadientdateRangePicker: React.FC<RadientdateRangePickerProps> = ({ onDateSelected, SearchPress, status, setStatus, isStShow = false, isshowRetailer = true, retailerID }) => {
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [isSelectingFromDate, setIsSelectingFromDate] = useState(true);
  const [rotation, setRotation] = useState(false);
  const [filter, setFilter] = useState(false);
  const [StShow, setStShow] = useState(isStShow);
  const [searchnumber, setSearchnumber] = useState('');
  const [relaiter, setRetailer] = useState('Select Retailer');
  const [isBankVisible, setIsBankVisible] = useState(false);
  const [searchstatus, setSearchStatus] = useState(status);

  const handleDateSelected = (data: string) => {
    const selectedDate = new Date(data);
    setIsCalendarVisible(false);

    if (isSelectingFromDate) {
      setFromDate(selectedDate);
      onDateSelected(selectedDate, toDate);
    } else {
      setToDate(selectedDate);
      onDateSelected(fromDate, selectedDate);
    }
  };

  const onFromDatePress = () => {
    setIsSelectingFromDate(true);
    setIsCalendarVisible(true);
  };

  const onToDatePress = () => {
    setIsSelectingFromDate(false);
    setIsCalendarVisible(true);
  };

  const dropdownPress = () => {
    setRotation(!rotation);
  };
  const filteress = () => {
    setFilter(!filter);
  };

  const searchHistory = () => {
    SearchPress(fromDate, toDate, searchstatus);
  };
  const [retailers, setRetailers] = useState([]);

  const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}20`;
  const { post } = useAxiosHook();
  useEffect(() => {


    const getUserList = async () => {
      try {
        const response = await post({ url: APP_URLS.retailerlist });
        // console.log(response, '*****123');

        if (response) {
          setRetailers(response);
        } else {
          setRetailers([]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setRetailers([]);
      } finally {
      }
    };
    if (IsDealer) {
      getUserList();
    }

  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const handleStateSelect = (selectedState) => {
    retailerID(selectedState.UserID);
    setRetailer(selectedState.Name)
    setIsBankVisible(false)
  };

  const filteredData = (retailers).filter(item =>
    item["Name"].toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <LinearGradient colors={[colorConfig.primaryColor, colorConfig.secondaryColor]} style={styles.gradient}>
      <View style={styles.header}>
        {rotation ? (
          <View>
          {/* { !IsDealer &&<TextInput
            placeholder={'Search By Consumer Number'}
            placeholderTextColor={'#fff'}
            value={searchnumber}
            onChangeText={setSearchnumber}
            style={styles.input}
          />} */}
            <TouchableOpacity
              onPress={filteress}
            >
              <TextInput
                placeholder={'Select Status'}
                placeholderTextColor={'#fff'}
                value={searchstatus===" "?'Select Status': searchstatus}
                editable={false}
                style={styles.input}
              />
              <View style={styles.righticon}>
                <OnelineDropdownSvg size={25} color='#fff' />
              </View>
            </TouchableOpacity>

            {filter ? <View style={[styles.statusheight,]}>
              {[" ",'Approved', 'Pending', 'Reject'].map((statusOption) => (
                <TouchableOpacity key={statusOption} onPress={() => { setSearchStatus(statusOption); setStatus(statusOption); setFilter(false) }}>
                  <Text style={styles.statusText}>{statusOption===" "?"ALL":statusOption}</Text>
                </TouchableOpacity>
              ))}
            </View> : null}
          </View>
        ) : null}
        <View style={styles.headerrow}>

          {StShow ? (
            <TouchableOpacity
              style={[styles.dropdown, { transform: [{ rotate: rotation ? '180deg' : '0deg' }] }]}
              onPress={dropdownPress}>
              <FilterSvg size={28} color='#fff' />
            </TouchableOpacity>) : null
          }
          <TouchableOpacity style={styles.datePickerButton} onPress={onFromDatePress}>
            <Calendarsvg color='#fff' />
            <View style={{ paddingLeft: wScale(5) }}>
              <Text style={styles.buttonText}>{translate("From_Date")}</Text>
              <Text style={styles.dateText}>{fromDate.toISOString().split('T')[0]}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.datePickerButton} onPress={onToDatePress}>
            <Calendarsvg color='#fff' />
            <View style={{ paddingLeft: wScale(5) }}>
              <Text style={styles.buttonText}>{translate("To_Date")}</Text>
              <Text style={styles.dateText}>{toDate.toISOString().split('T')[0]}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.searchButton} onPress={searchHistory}>
            <SearchIcon size={28} color='#fff' />
          </TouchableOpacity>
        </View>
        {isshowRetailer && <TouchableOpacity
          onPress={() => { 
            
            setIsBankVisible(true) 
          }}
        >
          <TextInput
            placeholder={relaiter}
            placeholderTextColor={'#fff'}
            value={relaiter.toUpperCase()}
            editable={false}
            style={styles.input}
          />
          <View style={styles.righticon}>
            <OnelineDropdownSvg size={25} color='#fff' />
          </View>
        </TouchableOpacity>}

      </View>

      <BottomSheet
        animationType="none"  
        isVisible={isCalendarVisible}
        backdropStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onBackdropPress={() => setIsCalendarVisible(false)}
      >
        <View>
          <CustomCalendar onDateSelected={handleDateSelected} />

        </View>
      </BottomSheet>
      <BottomSheet
        animationType="none"   isVisible={isBankVisible}
        onBackdropPress={() => setIsBankVisible(false)}
        containerStyle={styles.bottomSheetContainer}
      >
        <View style={[styles.bottomsheetview,]}>
          <View style={{}}>
            <View style={[styles.StateTitle, { backgroundColor: color1 }]}>
              <View style={styles.titleview}>

                <View>
                  <Text style={styles.stateTitletext}>
                    {"All Retailers"}
                  </Text>
                </View>
              </View>

              <TouchableOpacity onPress={() => setIsBankVisible(false)} activeOpacity={0.7}>
                <ClosseModalSvg2 />
              </TouchableOpacity>

            </View>
            <TextInput
              placeholder="Search..."
              value={searchQuery}
              onChangeText={text => setSearchQuery(text)}
              style={styles.searchBar}
              placeholderTextColor={colors.black75}
              cursorColor={'colors.black'}
            />
          </View>
          <FlashList
            data={filteredData}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.itemContainer,]} onPress={() => handleStateSelect(item)}>
                <Text style={styles.stateItem}>{item['Name']}</Text>
                <Text style={{ color: colorConfig.secondaryColor }}>{item['firmName']}</Text>

              </TouchableOpacity>
            )}
          />
        </View>
      </BottomSheet>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    elevation: 3,
  },
  header: {
    paddingHorizontal: wScale(10),
    paddingTop: wScale(10),
    backgroundColor: 'rgba(255,255,255,0.3)'
  },
  headerrow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hScale(5)
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,.5)',
    paddingHorizontal: wScale(8),
    paddingVertical: wScale(5),
    borderRadius: 5,

  },
  buttonText: {
    color: '#fff',
    fontSize: wScale(13),
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  dateText: {
    color: '#fff',
    fontSize: wScale(12),
  },
  searchButton: {
    padding: wScale(10),
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,.5)',
  },
  dropdown: {
    padding: wScale(10),
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,.5)',
  },
  righticon: {
    position: 'absolute',
    right: wScale(0),
    height: '75%',
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: wScale(12),
  },
  input: {
    height: hScale(40),
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: wScale(10),
    marginBottom: hScale(10),
    color: '#fff',
  },
  statusheight: {
    overflow: 'hidden',
    marginTop: hScale(-10),
    marginBottom: hScale(10),
    backgroundColor: 'rgba(0,0,0,0.2)'
  },
  statusText: {
    color: '#fff',
    paddingVertical: hScale(8),
    paddingHorizontal: wScale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  bottomSheetContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  itemContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  stateItem: {
    fontSize: wScale(18),
    color: "#000",
    textTransform: "uppercase",
  },

  bottomsheetview: {
    backgroundColor: "#fff",
    height: SCREEN_HEIGHT / 1.3,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  StateTitle: {
    paddingVertical: hScale(10),
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: wScale(10),
    marginBottom: hScale(10),
  },
  stateTitletext: {
    fontSize: wScale(22),
    color: "#000",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  titleview: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },

  searchBar: {
    borderColor: 'gray',
    borderWidth: wScale(1),
    paddingHorizontal: wScale(15),
    marginHorizontal: wScale(10),
    marginBottom: hScale(10),
    borderRadius: 5,
    color: colors.black75,
    fontSize: wScale(16),
  },
});

export default RadientdateRangePicker;


