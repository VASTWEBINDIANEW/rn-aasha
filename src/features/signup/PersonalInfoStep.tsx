/* eslint-disable react-native/no-inline-styles */
import StepIndicator from 'react-native-step-indicator';

import { Button } from '@rneui/themed';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import { encrypt } from '../../utils/encryptionUtils';
import { useNavigation } from '@react-navigation/native';
import i18n from '../../utils/languageUtils/I18n';
import { StepIndicatorStyle } from './stepIndicatorStyle';
import LottieView from 'lottie-react-native';
import { colors } from '../../utils/styles/theme';
import { hScale, SCREEN_HEIGHT, wScale } from '../../utils/styles/dimensions';
import BackArrow from '../../utils/svgUtils/BackArrow';
import { SignUpContext } from './SignUpContext';
import { SvgUri, SvgXml } from 'react-native-svg';
import DropdownSvg from '../../utils/svgUtils/DropdownSvg';
import { FlashList } from '@shopify/flash-list';
import { stateData } from '../../utils/stateData';
import { BottomSheet } from '@rneui/themed';
import { APP_URLS } from '../../utils/network/urls';
import useAxiosHook from '../../utils/network/AxiosClient';
import DynamicButton from '../drawer/button/DynamicButton';
import FlotingInput from '../drawer/securityPages/FlotingInput';
import OnelineDropdownSvg from '../drawer/svgimgcomponents/simpledropdown';
import ClosseModalSvg2 from '../drawer/svgimgcomponents/ClosseModal2';
import Calendarsvg from '../drawer/svgimgcomponents/Calendarsvg';

const PersonalInfoStep = () => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}20`;
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const dispatch = useDispatch();
  const [ismobile, setIsMobile] = useState(false);
  const [showStateList, setShowStateList] = useState(false);
  const [districtData, setDistrictData] = useState([]);
  const [isEmailActive, setIsEmailActive] = useState(false);
  const [showDistrictList, setShowDistrictList] = useState(false);

  const { get } = useAxiosHook();
  const {
    dateOfBirth,
    setDateOfBirth,
    addressState,
    setAddressState,
    district,
    setDistrict,
    currentPage,
    setCurrentPage,
    stateId,
    setStateid,
    pincode,
    setPincode,
    svg,
    Radius2 ,
    setDistid

  } = useContext(SignUpContext);

  const [isDobActive, setIsDobActive] = useState(false);

  const showBottomSheetList = () => {
    return (
      <FlashList
        data={showStateList ? stateData : districtData}
        renderItem={({ item }) => {
          return (
            <View
            >
              <TouchableOpacity
                onPress={async () => {
                  if (showStateList) {
                    setShowStateList(false);
                    setStateid(item.stateId);
                    console.log(item.stateId)
                    setAddressState(item.stateName);
                    setDistrict('');
                    await getDistricts({ id: item.stateId });
                  } else {
                    setShowDistrictList(false);
                    setDistrict(item['Dist Name']);
                    setDistid(item['Dist Id']);

                  }
                }}>
                <Text
                  style={styles.itemname}>
                  {showStateList ? item.stateName : item['Dist Name']}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
        estimatedItemSize={30}
      />
    );
  };

  const getDistricts = useCallback(
    async ({ id }) => {
      const response = await get({ url: `${APP_URLS.getDistricts}${id}` });
      setDistrictData(response);
    },
    [get],
  );

  return (
    <View style={styles.container}>
      <View style={styles.inputview}>
        <FlotingInput
          cursorColor={'#000'}
          onChangeTextCallback={setDateOfBirth}
          placeholderTextColor="#000"
          value={dateOfBirth}
          label={'Date Of Birth (dd/mm/yyyy)'}
          keyboardType='numeric'
          returnKeyLabel="ok"
          labelinputstyle={styles.labelinputstyle}
          inputstyle={[styles.inputstyle, { borderRadius: Radius2 }]} />
        <TouchableOpacity style={styles.IconStyle}>
          <SvgUri
            height={hScale(48)}
            width={hScale(48)}
            uri={svg.Calendar}
          />

        </TouchableOpacity>
      </View>

      <View style={styles.inputview}>

        <FlotingInput
          onKeyPress={() => { }}
          placeholderTextColor={colors.black_light}
          onChangeTextCallback={setPincode}
          label={'Pin Code'}
          value={pincode}
          keyboardType="number-pad"
          labelinputstyle={styles.labelinputstyle}
          inputstyle={[styles.inputstyle, { borderRadius: Radius2, }]}
        />
        <View style={[styles.IconStyle, {}]}>
          <SvgUri
            height={hScale(48)}
            width={hScale(48)}
            uri={svg.PinCodeLocation}
          />

        </View>
      </View>

      <TouchableOpacity
        onPress={() => {
          console.log();
          
          setShowDistrictList(false);
          setShowStateList(true);
        }}
        style={styles.inputview}>
        {addressState.length === 0 ? <View style={styles.righticon}>
          <OnelineDropdownSvg />
        </View> : null}
        <View style={[styles.IconStyle, {}]}>
          <SvgUri
            height={hScale(48)}
            width={hScale(48)}
            uri={svg.PinCodeLocation}
          />

        </View>
       
        <View  pointerEvents='none'> 
          <FlotingInput
          onKeyPress={() => { }}
          placeholderTextColor={colors.black_light}
          onChangeText={() => { }}
          label={'Select State'}
          value={addressState}
          editable={false}
          labelinputstyle={styles.labelinputstyle}
          inputstyle={[styles.inputstyle, { borderRadius: Radius2 }]} />
        </View>

      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => {
          setShowStateList(false);
          setShowDistrictList(true);
        }}
        style={styles.inputview}>

        {district.length === 0 ? <View style={styles.righticon}>
          <OnelineDropdownSvg />
        </View>
          : ''}
        <View style={[styles.IconStyle, {}]}>
          <SvgUri
            height={hScale(48)}
            width={hScale(48)}
            uri={svg.PinCodeLocation}
          />

        </View>
        <View  pointerEvents='none'> 
        <FlotingInput
          onKeyPress={() => { }}
          placeholderTextColor={colors.black_light}
          onChangeText={() => { }}
          label={'Select District'}
          value={district}
          editable={false}
          labelinputstyle={styles.labelinputstyle}

          inputstyle={[styles.inputstyle, { borderRadius: Radius2 }]} />
              </View>

      </TouchableOpacity>

      <BottomSheet animationType="none"  
        isVisible={showStateList || showDistrictList}
        onBackdropPress={() => {
          setShowStateList(false);
          setShowDistrictList(false);
        }}
        scrollViewProps={{ scrollEnabled: false }}
        containerStyle={{ backgroundColor: 'transparent' }}>
        <View
          style={{
            backgroundColor: colors.white,
            height: SCREEN_HEIGHT / 1.5,
            flex: 1,
          }}>
          <View style={[styles.StateTitle, { backgroundColor: color1 }]}>
            <Text style={styles.stateTitletext}>
              {showStateList ? 'select state' : 'select District'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowStateList(false);
                setShowDistrictList(false);
              }}
              activeOpacity={0.7}
            >
              <ClosseModalSvg2 />
            </TouchableOpacity>
          </View>

          {showBottomSheetList()}
        </View>
      </BottomSheet>

      <DynamicButton title={'Next'} onPress={() => {
        setCurrentPage(currentPage + 1);
      }} styleoveride={{ marginTop: 18 }} />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wScale(15),
    paddingVertical: hScale(20),
    backgroundColor: '#fff'
  },
  inputstyle: {
    marginBottom: 0,
    paddingLeft: wScale(63)
  },
  inputview: {
    marginBottom: hScale(18),
  },
  IconStyle: {
    width: hScale(48),
    justifyContent: 'center',
    position: "absolute",
    height: "100%",
    top:hScale(4)
  },
  labelinputstyle: {
    left: wScale(63)
  },
  StateTitle: {
    paddingVertical: hScale(10),
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: wScale(10)
  },
  stateTitletext: {
    fontSize: wScale(22),
    color: "#000",
    fontWeight: "bold",
    textTransform: "uppercase",
    flex: 1,
    textAlign: 'center'
  },
  righticon: {
    position: "absolute",
    left: "auto",
    right: wScale(0),
    top: hScale(0),
    height: "100%",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: wScale(12),
  },
  itemname: {
    textTransform: "capitalize",
    fontSize: wScale(20),
    color: "#000",
    flex: 1,
    borderBottomColor: "#000",
    borderBottomWidth: wScale(0.5),
    paddingVertical: hScale(30),
    marginHorizontal: wScale(10)
  }

});
export default PersonalInfoStep;
