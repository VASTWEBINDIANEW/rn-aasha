import { translate } from "../../../utils/languageUtils/I18n";
import React, { useEffect, useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { SvgXml } from 'react-native-svg';
import DynamicButton from '../../drawer/button/DynamicButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { useNavigation } from '@react-navigation/native';

const ServicepurchaseScreen = ({ route }) => {
  const { colorConfig, activeAepsLine } = useSelector((status: RootState) => status.userInfo);
  const Cross = `
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 32 32" style="enable-background:new 0 0 512 512" xml:space="preserve" class="">
      <g>
        <path d="M16 32c8.8 0 16-7.2 16-16S24.8 0 16 0 0 7.2 0 16s7.2 16 16 16zm0-30c7.7 0 14 6.3 14 14s-6.3 14-14 14S2 23.7 2 16 8.3 2 16 2z" fill="#ff0000" opacity="1"></path>
        <path d="m9.7 23.7 6.3-6.3 6.3 6.3 1.4-1.4-6.3-6.3 6.3-6.3-1.4-1.4-6.3 6.3-6.3-6.3-1.4 1.4 6.3 6.3-6.3 6.3z" fill="#ff0000" opacity="1"></path>
      </g>
    </svg>  
  `;

  const [isLoading, setIsLoading] = useState(false);
  const [visible1, setVisible1] = useState(true);
  const [visible2, setVisible2] = useState(false);
  const [paymtype, setPaymtype] = useState('');
  const [price, setPrice] = useState('');
  const [typee, setTypee] = useState('');
  const [msg, setMsg] = useState('----');
  const [status, setStatus] = useState('----');
  const navigation = useNavigation<any>();

  const { post } = useAxiosHook();

  const getCharge = async () => {
    console.log(route);
    const url = activeAepsLine ? `${APP_URLS.getServiceChargeNifi}Service=${route.params.typename}` : `${APP_URLS.getServiceCharge}Service=${route.params.typename}`;
    console.log(url);
    try {
      const res = await post({ url: url });
      console.log(res);
      setPrice(res['Price'].toString());
      setTypee(res['ServiceName']);
      setPaymtype(res['PaymentType']);
    } catch (error) {
      Alert.alert('Error', error.message || 'An error occurred', [{ text: 'OK' }]);
      console.error('Error fetching service charge:', error);
    }
  };

  useEffect(() => {

    getCharge();
  }, []);

  const servicePurchase = async (type) => {
    try {
      const url = `${APP_URLS.getServicePurchase}${type}`;
      const res = await post({ url: url });
      console.log(url);
      console.log(res);

      setIsLoading(false);
      setVisible2(false);
      setVisible1(true);

      if (res.Status === "Success") {
        Alert.alert(
          "Success",
          res.Message,
          [
            {
              text: "OK",
              onPress: () => navigation.navigate('Dashboard')
            }
          ]
        );
      } else {
        Alert.alert(
          "Error",
          "There was an issue with your purchase.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      console.error('Error during service purchase:', error);
      setIsLoading(false);
      Alert.alert(
        "Error",
        "An unexpected error occurred. Please try again later.",
        [{ text: "OK" }]
      );
    }
  };


  return (
    <View style={styles.main}>
      <AppBarSecond title={'Service purchase'} />
      <View style={styles.container}>
        {visible1 && (
          <View style={styles.bodyview}>
            <SvgXml xml={Cross} width={wScale(100)} height={wScale(100)} />
            <Text style={styles.title}>{translate("Your_Service_is_Expired")}</Text>
            <Text style={styles.description}>{translate("key_yourservi_156")}</Text>
            <View style={styles.btnviwe}>
              <DynamicButton title={`${route.params.typename} Purchase`} onPress={() => {
                setVisible1(false);
                setVisible2(true);
                setTypee('ALL');
                getCharge();
              }} />
            </View>
          </View>
        )}

        {visible2 && (
          <View>
            <View style={styles.labelrow}>
              <Text style={[styles.lable, { color: colorConfig.primaryColor }]}>{translate("Service_Payment")}</Text>
              <Text style={[styles.value, { color: colorConfig.secondaryColor }]}>{typee}</Text>
            </View>
            <View style={styles.labelrow}>
              <Text style={[styles.lable, { color: colorConfig.primaryColor }]}>{translate("Mode")}</Text>
              <Text style={[styles.value, { color: colorConfig.secondaryColor }]}>{paymtype}</Text>
            </View>
            <View style={styles.labelrow}>
              <Text style={[styles.lable, { color: colorConfig.primaryColor }]}>{translate("Amount")}</Text>
              <Text style={[styles.value, { color: colorConfig.secondaryColor }]}>{price}</Text>
            </View>
            <View style={{ marginTop: hScale(20) }}>
              <DynamicButton title={isLoading ? <ActivityIndicator color={colorConfig.labelColor} size={'large'} /> : "Pay"} onPress={async () => {
                setIsLoading(true);
                await servicePurchase(route.params.typename);
              }} />
            </View>
          </View>
        )}

        <Text style={{ marginTop: hScale(20) }}>Message: {msg}</Text>
        <Text>Status: {status}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  container: {
    paddingHorizontal: wScale(20),
    paddingVertical: wScale(15),
  },
  title: { fontWeight: 'bold', color: 'red', fontSize: wScale(18), paddingVertical: hScale(10) },
  description: {
    fontSize: wScale(16),
    color: '#000',
    textAlign: 'justify',
    width: '100%',
  },
  bodyview: {
    alignItems: 'center',
  },
  btnviwe: { marginTop: hScale(10), width: '55%', paddingBottom: hScale(20) },
  lable: { fontSize: wScale(20) },
  value: { fontSize: wScale(20), fontWeight: 'bold' },
  labelrow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: hScale(10) },
});

export default ServicepurchaseScreen;
