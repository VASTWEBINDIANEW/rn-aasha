import { translate } from "../../utils/languageUtils/I18n";
import React, { useEffect, useState } from 'react';
import { View, Text, Modal, FlatList, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { APP_URLS } from '../../utils/network/urls';
import useAxiosHook from '../../utils/network/AxiosClient';
import RechargeUtilityCommission from './OperatorCommisionFiles/PrePaidCom';
import UtilityCommission from './OperatorCommisionFiles/UtilityCom';
import MoneyCom from './OperatorCommisionFiles/MoneyCom';
import PancardCom from './OperatorCommisionFiles/PancardCom';
import AepsAadharCom from './OperatorCommisionFiles/AepsAadharCom';
import MposCom from './OperatorCommisionFiles/MposCom';
import FlightCom from './OperatorCommisionFiles/FlightCom';
import HotelCom from './OperatorCommisionFiles/HotelCom';
import BusCom from './OperatorCommisionFiles/BusCom';
import MicroAtmCashCom from './OperatorCommisionFiles/MicroAtmCashCom';
import Vm30PurchaseCom from './OperatorCommisionFiles/Vm30PurchaseCom';
import { hScale, SCREEN_HEIGHT, wScale } from '../../utils/styles/dimensions';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import { useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import OnelineDropdownSvg from '../drawer/svgimgcomponents/simpledropdown';
import { BottomSheet } from '@rneui/base';
import ClosseModalSvg2 from '../drawer/svgimgcomponents/ClosseModal2';

const operatorList = ["Prepaid", "Utility", "Money", "Pancard", "Aeps & Aadhar Services", "MPOS", "FLIGHT", "HOTEL", "BUS", "MICROATM CASH", "VM30PURCHASE"];

const OperatorCommissionReport = () => {
  const { colorConfig ,IsDealer} = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}20`;
  const [isVisible, setIsVisible] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState("Prepaid");
  const [operatorInfoList, setOperatorInfoList] = useState([]);
  const { get } = useAxiosHook();

  const handleOperatorSelect = async (operator) => {
    setSelectedOperator(operator);
    setIsVisible(false);
    await fetchCommissionData(operator);
  };

  useEffect(() => {
    const fetchHeaderData = async () => {
      await fetchCommissionData("Prepaid");
      try {

        const url2 =`${APP_URLS.dealeropcomn}ddltype=Header`
        const url = `${APP_URLS.opComm}ddltype=Header`;
        const response = await get({ url :IsDealer?url2:url});
        console.log('Header', response.data);
        console.log('Header', response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchHeaderData();
  }, []);
  const renderComponent = () => {
    switch (selectedOperator) {
      case 'Prepaid':
        return <RechargeUtilityCommission />;
      case 'Utility':
        return <UtilityCommission />;
      case 'Money':
        return <MoneyCom />;
      case 'Pancard':
        return <PancardCom />;
      case 'Aeps & Aadhar Services':
        return <AepsAadharCom />;
      case 'MPOS':
        return <MposCom />;
      case 'FLIGHT':
        return <FlightCom />;
      case 'HOTEL':
        return <HotelCom />;
      case 'BUS':
        return <BusCom />;
      case 'MICROATM CASH':
        return <MicroAtmCashCom />;
      case 'VM30 PURCHASE':
        return <Vm30PurchaseCom />;
      default:
        return null;
    }
  };

  const fetchCommissionData = async (operator) => {
    try {
      const url2 =`${APP_URLS.dealeropcomn}ddltype=${operator}`
      const url = `${APP_URLS.opComm}ddltype=${operator}`;
      const response = await get({url:IsDealer?url2:url });
      console.log(url, response)

      setOperatorInfoList(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchHeaderData = async () => {
    try {
      const url = `${APP_URLS.opComm}ddltype=Header`;
      const response = await get({ url });
      console.log('Header', response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (

    <View style={styles.main}>
      <AppBarSecond title={'Oprerator Commission'} />
      <View style={styles.container}>

        <View style={[{ backgroundColor: color1 }]}>
          <TouchableOpacity style={styles.button} onPress={() => setIsVisible(true)}>
            <Text style={styles.buttonText}>{selectedOperator}</Text>
            <View style={styles.righticon}>
              <OnelineDropdownSvg />
            </View>
          </TouchableOpacity>
        </View>

        {renderComponent()}


        {/* // <RechargeUtilityCommission/> */}

        <BottomSheet animationType="none"  
          isVisible={isVisible} >
          <View style={styles.bottomsheetview}>
            <View style={[styles.StateTitle, { backgroundColor: color1 }]}>
              <View style={styles.titleview}>
                <Text style={styles.stateTitletext}>{translate("Select_Category")}</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                activeOpacity={0.7}>
                <ClosseModalSvg2 />
              </TouchableOpacity>
            </View>

            <FlatList
              data={operatorList}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.operatorview}
                  onPress={() => handleOperatorSelect(item)}
                >
                  <Text style={styles.operatornametext}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </BottomSheet>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  button: {
    paddingHorizontal: wScale(15),
    borderRadius: wScale(5),
    marginVertical: hScale(10),
    borderWidth: wScale(1),
    height: hScale(48),
    justifyContent: 'center',
    marginHorizontal: wScale(15)
  },
  righticon: {
    position: "absolute",
    left: "auto",
    right: wScale(0),
    top: hScale(0),
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: wScale(12),
    height: '100%'
  },
  buttonText: {
    color: '#000',
    fontSize: wScale(18),
  },
  operatornametext: {
    textTransform: "capitalize",
    fontSize: wScale(20),
    color: "#000",
    flex: 1,
    borderBottomColor: "#000",
    borderBottomWidth: wScale(0.5),
    paddingVertical: hScale(10),
    marginHorizontal: wScale(10)
  },
  bottomsheetview: {
    backgroundColor: '#fff',
    height: SCREEN_HEIGHT / 1.3,
    marginHorizontal: wScale(0),
    borderTopLeftRadius: hScale(15),
    borderTopRightRadius: hScale(15),
  },
  StateTitle: {
    paddingVertical: hScale(10),
    borderTopLeftRadius: hScale(15),
    borderTopRightRadius: hScale(15),
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: wScale(10),
    marginBottom: hScale(10)
  },
  stateTitletext: {
    fontSize: wScale(22),
    color: '#000',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  titleview: {
    flex: 1,
    alignItems: 'center'
  },
  operatorview: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingHorizontal: wScale(10),
  },
});

export default OperatorCommissionReport;
