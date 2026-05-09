import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ToastAndroid, Alert } from 'react-native';
import FlotingInput from '../../drawer/securityPages/FlotingInput';
import { translate } from '../../../utils/languageUtils/I18n';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import DynamicButton from '../../drawer/button/DynamicButton';
import { encrypt } from '../../../utils/encryptionUtils';
import { useDeviceInfoHook } from '../../../utils/hooks/useDeviceInfoHook';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { useLocationHook } from '../../../utils/hooks/useLocationHook';
import { enc } from 'crypto-js';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import LinearGradient from 'react-native-linear-gradient';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const UpiDmtScreen = ({ route }) => {
  const [amount, setAmount] = useState('');
  const [reamount, setReamount] = useState('');
  const [servicefee, setServiceFee] = useState('');
  const [transpin, setTranspin] = useState('');
  const [btnclick, setBtnClick] = useState(false);
  const [trnoin, setTrnoin] = useState(false);
  const [id, setId] = useState(1);
  const [aadharvis, setaadharvis] = useState(true);
  const [aadharv, setaadharunv] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [panvisi, setPanvisi] = useState(false);
  const [idpr, setIdpr] = useState(true);
  const [aadhar, setaadhar] = useState('');
  const [pancard, setpancard] = useState('');
  const [validate, setValidate] = useState(false);
  const { post, get } = useAxiosHook();

  useEffect(() => {
    setaadharvis(false);
    setPanvisi(false);
  }, []);


  async function checkID(number: any) {
    try {
      if (aadharvis) {
        const res = await get({ url: `${APP_URLS.checkUpiSdrAdhar}AdharCardValidationCheck?aadharnumber=${number}` });
        console.log(res);
        ToastAndroid.showWithGravity(
          `${res['status'] === true ? 'Aadhar Verified ✅' : 'Aadhar not Verified ❌'}`,
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
        );
      } else if (panvisi) {
        const res = await get({ url: `${APP_URLS.checkUpiSdrAdhar}PancardCardValidationCheck?pannumber=${number}` });
        console.log(res);
        ToastAndroid.showWithGravity(
          `${res['status'] === true ? 'Pan Verified ✅' : 'Pan not verified ❌'}`,
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
        );

      }

    } catch (error) {

    }
  }
  const { userId ,Loc_Data} = useSelector((state: RootState) => state.userInfo);

  const { latitude, longitude } = Loc_Data;

  const { getNetworkCarrier, getMobileDeviceId, getMobileIp } =
    useDeviceInfoHook();
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  const mobileNetwork = getNetworkCarrier();
  const ip = getMobileIp();
  const [onTap1, setOnTap1] = useState(false);

  const ONpay = useCallback(async () => {
    if (
        amount === '' ||
        reamount === '' ||
        transpin.length < 6 ||
        (!servicefee && amount !== reamount)
      ) {
        console.log('Please fill in all required fields');
        setOnTap1(false);
        return;
      }
    try {
        const mobileNetwork = await getNetworkCarrier();
        const ip = await getMobileIp();
        const Model = await getMobileDeviceId();
        console.log("Model", Model);

        const encryption = await encrypt([
            userId, // umm0
            route.params['accHolder'], // name 1
            route.params['senderno'], // snn 2    
           'null', // fggg 3
            '123456', // eee 4
            transpin, // nnn 5
            route.params['ACCno'], // nttt 6
            'UPI', // peee 7
            Model, // nbb 8
          'null', // bnm 9 
            ip, // ip 10
            'city', // Devicetoken 11
            'lat', // Latitude 12
            'long', // Longitude 13
            Model, // Model 14 
            'address', // Address 15 
            'city', // City 16 
            'postcode', // PostalCode 17 
            mobileNetwork, // InternetTYPE 18 
            route.params['unqid'], // uniqueid 19
        ]);

        const useridd = encodeURIComponent(encryption.encryptedData[0]);
        const senderid = encodeURIComponent(encryption.encryptedData[1]);
        const ifsc = encodeURIComponent(encryption.encryptedData[2]);
        const name = encodeURIComponent(encryption.encryptedData[3]);
        const benefiid = encodeURIComponent(encryption.encryptedData[4]);
        const amntt = amount; // ttt
        const tPinn = encodeURIComponent(encryption.encryptedData[5]);
        const accno = encodeURIComponent(encryption.encryptedData[6]);
        const mode = encodeURIComponent(encryption.encryptedData[7]);
        const androidid = encodeURIComponent(encryption.encryptedData[8]);
        const bankname = encodeURIComponent(encryption.encryptedData[9]);
        const ipadd = encodeURIComponent(encryption.encryptedData[10]);

        const kyc = route.params['kyc'] === true ? 'None' : aadhar; // kyc
        const pkyc = route.params['kyc'] === true ? 'None' : pancard; // kyc
        const ottp = servicefee;
        const Devicetoken = encodeURIComponent(encryption.encryptedData[11]);
        const Latitude = encodeURIComponent(encryption.encryptedData[12]);
        const Longitude = encodeURIComponent(encryption.encryptedData[13]);

        const ModelNo = encodeURIComponent(encryption.encryptedData[14]);
        const Address = encodeURIComponent(encryption.encryptedData[15]);
        const City = encodeURIComponent(encryption.encryptedData[16]);
        const postcode = encodeURIComponent(encryption.encryptedData[17]);
        const nettype = encodeURIComponent(encryption.encryptedData[18]);
        const uniqueid = encodeURIComponent(encryption.encryptedData[19]);

        const value1 = encodeURIComponent(encryption.keyEncode);
        console.log('value1:', value1);

        const value2 = encodeURIComponent(encryption.ivEncode);
        console.log('value2:', value2);

        const jsonString = {
            umm: useridd,
            name: name,
            snn: senderid,
            fggg: ifsc,
            eee: benefiid,
            ttt: amntt,
            nnn: tPinn,
            nttt: accno,
            peee: mode,
            nbb: androidid,
            bnm: bankname,
            kyc: kyc,
            ip: ipadd,
            mac: pkyc,
            ottp: ottp,
            Devicetoken: Devicetoken,
            Latitude: Latitude,
            Longitude: Longitude,
            ModelNo: ModelNo,
            Address: Address,
            City: City,
            PostalCode: postcode,
            InternetTYPE: nettype,
            value1: value1,
            value2: value2,
            uniqueid: uniqueid
        };

        const data = {};
        for (const key in jsonString) {
            if (jsonString.hasOwnProperty(key)) {
                data[key] = decodeURIComponent(jsonString[key]);
            }
        }
        console.log(data);
        const response = await post({
            url: APP_URLS.dmtapi,
            data: data,
        });
        if(response){
setOnTap1(false);
        console.log('payment response', response);

        Alert.alert(
            'Payment Response',
            `UPI id: ${route.params['UpiId']}\nTime: ${response.Time}\nTotal Amount: ${response.TotalAmount}\n\nTransaction Details:\n${response.data.map(transaction => `Amount: ${transaction.Amount}\nStatus: ${transaction.Status}\nBank Ref ID: ${transaction.bankrefid}`).join('\n\n')}`,
            [{ text: 'OK' }]
        );
    }else{
        Alert.alert('Error', 'Something went wrong. Please try again later.', [{ text: 'OK' }]);

}
        
     
    } catch (error) {
        console.error('Error in ONpay:', error);
    }
}, [userId, route.params, transpin, amount, aadhar, pancard, servicefee, post]);
return (
  <View style={styles.main}>
    <AppBarSecond title={'UPI Transfer'} />

    {/* Top Info Card with Gradient */}
    <LinearGradient 
      colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
      style={{ paddingVertical: hScale(15) }}
    >
      <View style={styles.inercontainer}>
        {/* UPI ID & Sender Number Row */}
        <View style={styles.rowContainer}>
          <View style={styles.leftContainer}>
            <Text style={[styles.label, { color: colorConfig.primaryColor }]}>{translate("UPI_ID")}</Text>
            <Text style={[styles.Value, { color: colorConfig.secondaryColor }]}>
              {route.params['UpiId']}
            </Text>
          </View>
          <View style={styles.rightContainer}>
            <Text style={[styles.label, { color: colorConfig.primaryColor }]}>{translate("Sender_Number")}</Text>
            <Text style={[styles.Value, { color: colorConfig.secondaryColor }]}>
              {route.params['senderNo']}
            </Text>
          </View>
        </View>

        {/* Unique ID Row */}
        <View style={[styles.rowContainer, { marginTop: hScale(10) }]}>
          <View style={[styles.leftContainer, { flex: 1 }]}>
            <Text style={[styles.label, { color: colorConfig.primaryColor }]}>{translate("Unique_ID")}</Text>
            <Text 
              style={[styles.Value, { color: colorConfig.secondaryColor }]}
              numberOfLines={1} 
              ellipsizeMode='tail'
            >
              {route.params['unqid']}
            </Text>
          </View>
        </View>

        {/* Receiver Name Row */}
        <View style={[styles.rowContainer, { marginTop: hScale(10) }]}>
          <View style={styles.leftContainer}>
            <Text style={[styles.label, { color: colorConfig.primaryColor }]}>{translate('Name')}</Text>
            <Text style={[styles.Value, { color: colorConfig.secondaryColor }]}>
              {route.params['upiUname']}
            </Text>
          </View>
        </View>
      </View>
    </LinearGradient>

    {/* Form Section with Keyboard Handling */}
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <View>
          <Text style={styles.selecttitle}>{translate("Select_ID_Type")}</Text>
          
          {/* ID Selection Tabs */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: hScale(20), gap: hScale(10) }}>
            <TouchableOpacity
              onPress={() => {
                setaadharvis(false); setPanvisi(false); setIdpr(false); setId(3);
                setaadhar(""); setpancard("");
              }}
              style={[styles.tabButton, { backgroundColor: !aadharvis && !panvisi ? colorConfig.primaryButtonColor : '#f0f0f0' }]}
            >
              <Text style={{ color: !aadharvis && !panvisi ? colorConfig.labelColor : '#000' }}>{translate("None")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setaadharvis(true); setPanvisi(false); setIdpr(true); setId(1);
                setaadhar(""); setpancard("");
              }}
              style={[styles.tabButton, { backgroundColor: aadharvis ? colorConfig.primaryButtonColor : '#f0f0f0' }]}
            >
              <Text style={{ color: aadharvis ? colorConfig.labelColor : '#000' }}>{translate("Aadhaar")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setaadharvis(false); setPanvisi(true); setIdpr(true); setId(2);
                setaadhar(""); setpancard("");
              }}
              style={[styles.tabButton, { backgroundColor: panvisi ? colorConfig.primaryButtonColor : '#f0f0f0' }]}
            >
              <Text style={{ color: panvisi ? colorConfig.labelColor : '#000' }}>{translate("PAN_Card")}</Text>
            </TouchableOpacity>
          </View>

          {/* Amount Inputs */}
          <FlotingInput
            label={translate('Enter Amount')}
            inputstyle={{ borderColor: amount && reamount && amount !== reamount ? 'red' : 'black' }}
            value={amount}
            onChangeTextCallback={setAmount}
            keyboardType="number-pad"
            maxLength={8}
          />

          <FlotingInput
            label={translate('Re-Enter Amount')}
            inputstyle={{ borderColor: amount && reamount && amount !== reamount ? 'red' : 'black' }}
            value={reamount}
            onChangeTextCallback={setReamount}
            keyboardType="number-pad"
            maxLength={8}
          />

          {/* Conditional ID Inputs */}
          {aadharvis && (
            <FlotingInput
              label={translate('Enter Aadhaar Number')}
              value={aadhar}
              onChangeTextCallback={(text) => {
                setaadhar(text);
                if (text.length === 12) checkID(text);
              }}
              keyboardType="number-pad"
              maxLength={12}
            />
          )}

          {panvisi && (
            <FlotingInput
              label={translate('Enter PAN Number')}
              value={pancard}
              onChangeTextCallback={(text) => {
                setpancard(text.toUpperCase());
                if (text.length === 10) checkID(text);
              }}
              maxLength={10}
            />
          )}

          {/* Fees & PIN */}
          <FlotingInput
            label={translate('Enter Service Fee')}
            value={servicefee}
            onChangeTextCallback={setServiceFee}
            keyboardType="number-pad"
            maxLength={3}
          />

          <FlotingInput
            label={translate('Enter Transaction PIN')}
            value={transpin}
            onChangeTextCallback={setTranspin}
            keyboardType="number-pad"
            maxLength={6}
            secureTextEntry={true}
            editable={amount !== '' && amount === reamount}
          />

          {/* Action Button */}
          <View style={{ marginTop: hScale(10) }}>
            <DynamicButton
              title={translate('Pay')}
              onPress={() => ONpay()}
              disabled={!amount || amount !== reamount || transpin.length < 4}
            />
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  </View>
);
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  lineargradient: {
    marginTop: hScale(15)
  },
  container: {
    paddingHorizontal: wScale(15),
    paddingVertical: hScale(15),
  },

  inercontainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: wScale(10),
    paddingVertical: wScale(0),
    margin: wScale(10)
  },
  label: {
    fontSize: wScale(15),
    fontWeight: 'bold',
  },
  Value: {
    fontSize: wScale(14),
    letterSpacing: 1,
  },

  selecttitle: {
    fontSize: wScale(22),
    paddingBottom: hScale(10),
    paddingTop: hScale(15),
    color: '#000',
    fontWeight: 'bold'
  },

  button: {
    borderWidth: wScale(1),
    padding: wScale(7),
    borderRadius: 5,
    marginRight: wScale(10),
    fontSize: wScale(15),
    borderBottomColor: '#000',
    color: '#000'
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: hScale(5),
  },
  leftContainer: {
  },
  rightContainer: {
    alignItems: 'flex-end',
    flex: 1,
    marginLeft: wScale(10)
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: 'PrimaryColor',
  },

});

export default UpiDmtScreen;
