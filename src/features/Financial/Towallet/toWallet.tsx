import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ToastAndroid, Alert } from 'react-native';
import FlotingInput from '../../drawer/securityPages/FlotingInput';
import { translate } from '../../../utils/languageUtils/I18n';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import DynamicButton from '../../drawer/button/DynamicButton';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { encrypt } from '../../../utils/encryptionUtils';
import { useDeviceInfoHook } from '../../../utils/hooks/useDeviceInfoHook';
import { useLocationHook } from '../../../utils/hooks/useLocationHook';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const ToWallet = ({ route}) => {
    const [amount, setAmount] = useState('');
    const [reamount, setReamount] = useState('');
    const [servicefee, setServiceFee] = useState('');
    const [transpin, setTranspin] = useState('');
    const [btnclick, setBtnClick] = useState(false);
    const [trnoin, setTrnoin] = useState(false);
    const [id, setId] = useState(1);
    const [aadharvis, setaadharvis] = useState(true);
             const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [panvisi, setPanvisi] = useState(false);
    const [idpr, setIdpr] = useState(true);
    const [aadhar, setaadhar] = useState('');
    const [pancard, setpancard] = useState('');
    const [validate, setValidate] = useState(false);
    const { post, get } = useAxiosHook();
    const { getNetworkCarrier, getMobileDeviceId, getMobileIp } =
        useDeviceInfoHook();
        const { userId ,Loc_Data} = useSelector((state: RootState) => state.userInfo);

        const { latitude, longitude } = Loc_Data;;

    useEffect(() => {console.log(route)
        
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

    const postData2 = async () => {

        const mobileNetwork = await getNetworkCarrier();
        const ip = await getMobileIp();
        const Model = await getMobileDeviceId();
        const encryption = await encrypt([
          userId,///    umm  0
          route.params['senderNo'],////  snn 1
          'null',//ifsc       2
           '123456',// benefiid     fggg    3
           '1000',// ttt 4
         transpin,// pin nnn    5
         route.params['UpiId'],  //upiid//    nttt   6
           'UPI',//// mode    peee    7
           Model,//////android id   nbb    8
           'null',///////bnm    9
           ///kyc   kyc string 
           ip,////   ip  10
         //////mac    pancard string 
          // ///ottp     service charge string 
         'Laxmangarh',  ///Devicetoken   city  11
           latitude, ///Latitude      12
           longitude, ////Longitude  13
           'sm-1234',///  model number    ModelNo    14
           'R23P +677',  //  Address     15
           'Laxmangarh', ///  City   16
           '332311',////PostalCode  117
           mobileNetwork,///InternetTYPE   18
            route.params['upiUname'],
    
        ]);
    
    const useridd = encodeURIComponent(encryption.encryptedData[0]);
    const senderid = encodeURIComponent(encryption.encryptedData[1]);
    const ifsc = encodeURIComponent(encryption.encryptedData[2]);
     const benefiid = encodeURIComponent(encryption.encryptedData[3]);
     const amntt = encodeURIComponent(encryption.encryptedData[4]);
     const tPinn = encodeURIComponent(encryption.encryptedData[5]);
     const accno = encodeURIComponent(encryption.encryptedData[6])
     const mode  =encodeURIComponent(encryption.encryptedData[7]);
      const  androidid = encodeURIComponent(encryption.encryptedData[8]);
     const bankname  = encodeURIComponent(encryption.encryptedData[9]); 
     const ipadd  = encodeURIComponent(encryption.encryptedData[10]); 
     const city  = encodeURIComponent(encryption.encryptedData[11]); 
     const lat  = encodeURIComponent(encryption.encryptedData[12]); 
     const long  = encodeURIComponent(encryption.encryptedData[13]); 
     const model  = encodeURIComponent(encryption.encryptedData[14]);
     const adresss  = encodeURIComponent(encryption.encryptedData[15]);
     const postcode = encodeURIComponent(encryption.encryptedData[17]);
     const nettype = encodeURIComponent(encryption.encryptedData[18])
    const name =  encodeURIComponent(encryption.encryptedData[19]);
    
    console.log("useridd:", useridd);
    console.log("senderid:", senderid);
    console.log("ifsc:", ifsc);
    console.log("benefiid:", benefiid); 
    console.log("amntt:", amntt);
     console.log("tPinn:", tPinn);
     console.log("accno:", accno);
     console.log("mode:", mode);
     console.log("androidid:", androidid);
     console.log("bankname:", bankname);
     console.log("ipadd:", ipadd);
     console.log("city:", city);
     console.log("lat:", lat);
     console.log("long:", long);
     console.log("model:", model);
     console.log("adresss:", adresss);
     console.log("postcode:", postcode);
     console.log("nettype:", nettype);
     console.log("name:", name);
    
    
    
        const value1 = encodeURIComponent(encryption.keyEncode);
        console.log('value1:', value1);
    
        const value2 = encodeURIComponent(encryption.ivEncode);
        console.log('value2:', value2);
    
        const mapdata = await {
        umm: useridd,
          name:name,
          snn: senderid,
          fggg: ifsc,
          eee: benefiid,
          ttt: reamount,
          nnn: tPinn,
          nttt: accno,
          peee: mode,
          nbb: androidid,
          bnm: bankname,
          kyc: aadhar,
          ip: ipadd,
          mac: pancard,
          ottp: servicefee,
          Devicetoken: city,
          Latitude: lat,
          Longitude: long,
          ModelNo: model,
          Address: adresss,
          City: city,
          PostalCode: postcode,
          InternetTYPE: nettype,
          value1: value1,
          value2: value2,
         // uniqueid: route.params['unqid']
        };
    console.log(JSON.stringify(mapdata));
        try {
          const response = await fetch('https://native.vastwebindia.com/Money/api/Money/yyyy2', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer q3OxD2F0KbzS7v9Vj-EboaRQQpwN0Q-lMxCfUiv3vW2VBdhX6qD3-vqUaBdVH3lTG5Mv30RlbdgvE_jc0skSj40OfzymLLHh-P99p8P51Pj7SfGuMUfKkd1hxu-f6lqo6litbn0Vwy3yRIL2U5pJAheU-8kdfck7usup03pstWiWXNBOy0pXTAKu0GqqqfTMza_CbcmljKPBc-KoI9BhhJGGcvq6lRRdxmvxpzRnOuPYwM-2o2VhwywZa80jKqxA1xQpxzheLoDwxW1-K4ZwDc7aS_WBoHM4friLwHKuAOA9RWtibOul5WtCgcGS0fqVYedBlIGs3cTtq_nOr0w-gBoOd7i3gf8EbSAtkV_WmADJvY7anaj39u9injDxxM7toMqpn0eAe-vcXtFKgrkCOxD5RShBGTkp7VsYS6BnbEQ6P7vTZMSKreKwdOD9CW-ohg1TK_0kZn5S2hcV2SUnFyxgq1ztL0ZgP7jdl0_Br9v_C3Wyym-qOMurwSqAI-AJ052Bk-r24Jdu0NCjMdfEMinxeN7XJDqeVJp3doaS9c4',
            },
            body: JSON.stringify(mapdata),
          });
    
          if (response.ok) {
            const responseData = await response.json();
            console.log(responseData);
          } else {   
            console.error('Failed to fetch data');
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }

    const sendmoneyapi = async (userid, num, ifsc, benefiid, amunt, dmtpin, accno, mode, devicid, bnkname, aadharcard, pancard, servicefee, ipaddr, city, lat, long, model, address, postcode, intype, key, iv, widget) => {
        try {

            const url = 'https://native.vastwebindia.com/Money/api/Money/yyyy2';
            const data = {
                "umm": userid,
                "snn": num,
                "fggg": ifsc,
                "eee": benefiid,
                "ttt": amunt,
                "nnn": dmtpin,
                "nttt": accno,
                "peee": mode,
                "nbb": devicid,
                'bnm': bnkname,
                "kyc": aadharcard,
                "ip": ipaddr,
                "mac": pancard,
                "ottp": servicefee,
                "Devicetoken": city,
                "Latitude": lat,
                "Longitude": long,
                "ModelNo": model,
                "Address": address,
                "City": city,
                "PostalCode": postcode,
                "InternetTYPE": intype,
                "value1": key,
                "value2": iv,
                "uniqueid": widget.uniqidd
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ''}`
                },
                body: JSON.stringify(data),
            });

            console.log(response);

            if (response.status === 200) {
                const responseData = await response.json();
                console.log(responseData);
            } else if (response.status === 401) {
                AsyncStorage.clear();
                Alert.alert('Unauthorized', 'Your session has expired. Please login again.');
            } else {
                throw new Error('Failed to load data');
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to send money. Please try again later.');
        }
    };


return (
  <View style={{ flex: 1, backgroundColor: 'white' }}>
    {/* Header Section */}
    <AppBarSecond 
      title={'Wallet Transfer'} 
      onPressBack={() => navigation.goBack()} 
    />

    <KeyboardAwareScrollView
      enableOnAndroid={true}
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: hScale(20) }}
    >
      <View style={{ flex: 1, padding: hScale(10) }}>
        
        {/* Account Holder Name Banner */}
        <View style={{ backgroundColor: '#e1f5fe', padding: hScale(15), borderRadius: 8, marginBottom: hScale(15) }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'black' }}>
            Name: {route.params['name'] || route.params['accHolder']}
          </Text>
        </View>

        {/* Transaction Details Card */}
        <View style={styles.detailsContainer}>
          <View style={styles.rowContainer}>
            <View style={styles.leftContainer}>
              <Text style={{ fontSize: 12, color: 'gray' }}>{translate("Mode")}</Text>
              <Text style={styles.modeText}>{route.params['mode']}</Text>
            </View>
            <View style={styles.rightContainer}>
              <Text style={{ fontSize: 12, color: 'gray' }}>{translate("Sender_No")}</Text>
              <Text style={styles.ifsccValue}>{route.params['senderNo']}</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.bankContainer}>
            <Text style={styles.bankText}>{translate("Unique_Id")}</Text>
            <Text style={styles.bankName}>{route.params['unqid']}</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.bankContainer}>
            <Text style={styles.bankText}>{translate("Wallet_Id")}</Text>
            <Text style={styles.acNumber}>{route.params['walletid']}</Text>
          </View>
        </View>

        {/* Payment Form Section */}
        <View style={{ paddingVertical: hScale(10) }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>{translate("Select_ID_Type")}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: hScale(20), gap: 10 }}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: !aadharvis && !panvisi ? '#2196F3' : '#f0f0f0', borderColor: 'transparent' }]}
              onPress={() => {
                setaadharvis(false); setPanvisi(false); setIdpr(false); setId(3);
                setaadhar(""); setpancard("");
              }}
            >
              <Text style={{ color: !aadharvis && !panvisi ? 'white' : 'black' }}>{translate("None")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: aadharvis ? '#2196F3' : '#f0f0f0', borderColor: 'transparent' }]}
              onPress={() => {
                setaadharvis(true); setPanvisi(false); setIdpr(true); setId(1);
                setaadhar(""); setpancard("");
              }}
            >
              <Text style={{ color: aadharvis ? 'white' : 'black' }}>{translate("Aadhaar")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: panvisi ? '#2196F3' : '#f0f0f0', borderColor: 'transparent' }]}
              onPress={() => {
                setaadharvis(false); setPanvisi(true); setIdpr(true); setId(2);
                setaadhar(""); setpancard("");
              }}
            >
              <Text style={{ color: panvisi ? 'white' : 'black' }}>{translate("PAN_Card")}</Text>
            </TouchableOpacity>
          </View>

          <FlotingInput
            label={translate('Enter Amount')}
            inputstyle={{ borderColor: (amount && reamount && amount !== reamount) ? 'red' : 'black' }}
            value={amount}
            onChangeTextCallback={(text) => setAmount(text)}
            keyboardType="number-pad"
            maxLength={8}
          />

          <FlotingInput
            label={translate('Re-Enter Amount')}
            inputstyle={{ borderColor: (amount && reamount && amount !== reamount) ? 'red' : 'black' }}
            value={reamount}
            onChangeTextCallback={(text) => setReamount(text)}
            keyboardType="number-pad"
            maxLength={8}
          />

          {aadharvis && (
            <FlotingInput
              label={translate('Enter Aadhar Number')}
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
              label={translate('Enter Pan Number')}
              value={pancard}
              onChangeTextCallback={(text) => {
                setpancard(text.toUpperCase());
                if (text.length === 10) checkID(text);
              }}
              maxLength={10}
            />
          )}

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

          <View style={{ marginTop: hScale(20) }}>
            <DynamicButton
              title={translate('Pay')}
              onPress={() => { /* आपका पेमेंट फंक्शन यहाँ */ }}
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
    button: {
        borderWidth: 0.2,
        padding: hScale(5),
        borderRadius: 5,
        marginRight: wScale(10),
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: hScale(5),
    },
    leftContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    rightContainer: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
    },
    icon: {
        width: wScale(24),
        height: hScale(24),
        tintColor: 'PrimaryColor',
    },
    modeText: {
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 1,
        color: 'PrimaryColor',
    },
    ifsccText: {
        fontSize: 11,
        color: 'PrimaryColor',
        fontWeight: 'bold',
    },
    ifsccValue: {
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1,
        color: 'PrimaryColor',
    },
    separator: {
        height: 1,
        backgroundColor: 'PrimaryColor',
        marginVertical: hScale(4),
    },
    bankContainer: {
        flexDirection: 'row',
        marginVertical: 3,
    },
    bankText: {
        fontSize: 16,
        color: 'PrimaryColor',
        fontWeight: 'bold',
    },
    bankName: {
        fontSize: 16,
        fontWeight: 'bold',
        letterSpacing: 1,
        color: 'green',
    },
    acText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    acNumber: {
        fontSize: 16,
        color: 'green',
        fontWeight: 'bold',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: 'green',
    },
});

export default ToWallet;


