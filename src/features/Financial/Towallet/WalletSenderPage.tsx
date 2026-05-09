import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, StyleSheet, ToastAndroid, FlatList, TouchableOpacity } from 'react-native';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { translate } from '../../../utils/languageUtils/I18n';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import { useFocusEffect } from '@react-navigation/native';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import DynamicButton from '../../drawer/button/DynamicButton';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WalletSenderPage = () => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  const [sendernum, setSendernum] = useState('');
  const [onTap, setOnTap] = useState(true);
  const [onTap1, setOnTap1] = useState(false);
  const [nxtbtn, setNxtbtn] = useState(false);
  const [banklist, setBanklist] = useState([]);
  const [remid, setRemid] = useState('');
  const { post, get } = useAxiosHook();
  const [isLoading, setisLoading] = useState(true);
  const navigation = useNavigation<any>();
  const [nodata, setnodata] = useState(false);



  useEffect(() => {
    getGenUniqueId();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
setBanklist([])}, [])
  );

  const checksendernumber = async (number) => {
    setisLoading(true);

    try {
      const url = `${APP_URLS.wallSenderList}${number}`; 
      const res = await get({ url: url });

      console.log(res['ADDINFO']['Response'].length);
      console.log(res['ADDINFO']);

      const addinfo = res['ADDINFO'];
      if (res['RESULT'] === '0') {
        setisLoading(false);

        const status = addinfo["statuscode"];
        if (status === "TXN") {
                      await setBanklist(addinfo["Response"]);

        //   const remmname = addinfo["data"]["remitter"]["name"];
        //   const consumelimit = addinfo["data"]["remitter"]["consumedlimit"].toString();
        //   const remainlimit = addinfo["data"]["remitter"]["remaininglimit"].toString();
        //   const kycsts = addinfo["data"]["remitter"]["kycdone"].toString();
        //   const photo = addinfo["data"]["remitter"]["Photo"].toString();
        //   await setBanklist(addinfo["data"]["beneficiary"]);
        //   const beneficiary = addinfo["data"]["beneficiary"];
        //   const remid = addinfo["data"]["remitter"]["id"];
        //   console.log(banklist);
        //   AsyncStorage.setItem('sendnum', number);
        //   AsyncStorage.setItem('sendname', remmname);
        //   AsyncStorage.setItem('consumelim', consumelimit);
        //   AsyncStorage.setItem('remainlim', remainlimit);
        //   AsyncStorage.setItem('remidd', remid);
        //   AsyncStorage.setItem('kycsts', kycsts);
        //   AsyncStorage.setItem('photo', photo);
          if (res['ADDINFO']['Response'].length === 0) {
            setisLoading(false);
            setnodata(true);
          } else {
            setnodata(false);
          }
        } else if (status === "RNF") {
        
        }
      } else {
        setisLoading(false);

        const status = addinfo["statuscode"];
        console.log(status);
        if (status === 'RNF') {
          AsyncStorage.setItem('senderno', sendernum);
          navigation.navigate("AddNewBenificiaryScreen",{sendernum});
        }
        ToastAndroid.showWithGravity(addinfo['status'], ToastAndroid.SHORT, ToastAndroid.BOTTOM);
      }

      setOnTap1(false);
      setOnTap(true);

    } catch (error) {
      setisLoading(false);

      console.error('Error:', error);
      // Handle error
    }
  };
  const [unqid, setUnqiD] = useState('');
  const getGenUniqueId = async () => {
    try {
      const url = `${APP_URLS.getGenIMPSUniqueId}`
      console.log(url);
      const res = await get({ url: url });
      setUnqiD(res);
      setisLoading(false);


      if (res['Response'] == 'Failed') {
        ToastAndroid.showWithGravity(
          res['Message'],
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
        )
      } else {
        ToastAndroid.showWithGravity(
          res['Response'],
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
        )
      }


    } catch (error) {
      console.error('Error fetching data:', error);

    }
  };
  const handleNextButtonPress = () => {
    if (onTap) {
      setOnTap1(true);
      checksendernumber(sendernum);
      setOnTap1(false);
    }
  };

  const handleImpsPress = (item) => {
    console.log('IMPS pressed for:', item);
  };


  const handleNeftPress = (item) => {
    console.log('NEFT pressed for:', item);
  };

  const handleDeletePress = async (item) => {
    setisLoading(true);
    console.log('Delete pressed for:', item);
    try {
      const res = await post({ url: `${APP_URLS.bankbenDelete}mobile=${item['mobile']}&ifsc=${item['ifsc']}&code&remitterid=${remid}&beneficiaryid=${item['id']}` });
      console.log(res['ADDINFO']);
      console.log(res);
      if (res['RESULT'] === '1') {
        ToastAndroid.showWithGravity(res['ADDINFO'], ToastAndroid.SHORT, ToastAndroid.BOTTOM);
      } else {
        checksendernumber(sendernum);
        const response = JSON.parse(res['ADDINFO']);
        ToastAndroid.showWithGravity(response.status, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        console.log(response);
      }
    } catch (error) {
    }
  };

  const handleVerifyPress = async (item, index) => {

    try {
      const res = await post({ url: `${APP_URLS.verifyBank}sender_number=${sendernum}&Accountnumber=${item['account']}&bankname=${item['bank']}&benIFSC=${item['ifsc']}&Name=${item['name']}&Id=${item['id']}uniqueid=${unqid}` })

      console.log(res);
    } catch (error) {

    }
  };

  const BeneficiaryList = ({ bankList, onImpsPress, onNeftPress, onDeletePress, onVerifyPress }) => {
    const renderItem = ({ item, index }) => (
      <View style={styles.itemContainer}>
        {/* <Text style={styles.itemText}>Bank Name: {item['name']}</Text> */}
        {item['isbankdown'] ? <Text style={{ color: 'green' }}>{translate("Note_Currently_the_beneficiary_banks_server_is_down_or_busy_please_try_after_sometime")}</Text> : <></>
        }
        <Text style={styles.itemText}>e: {item['senderno']}</Text>
        <Text style={styles.itemText}>Sender Name: {item['name']}</Text>
        <Text style={styles.itemText}>id: {item['walletid']}</Text>
        {/* <Text style={styles.itemText}>Mobile Number: {item['mobile']}</Text> */}
        <View style={styles.buttonContainer}>
          <Button title="Wallet Transfer" onPress={() => onImpsPress(item)} color="#007bff" />
          {/* <Button title="NEFT" onPress={() => onNeftPress(item)} color="#28a745" /> */}
          <Button title="Delete" onPress={() => onDeletePress(item)} color="#dc3545" />
          {/* {
            item['isverified'] === true ? <></> : <TouchableOpacity>
              {item.isLoading ? (
                <ActivityIndicator color="red" />
              ) : (
                <Button title="Verify" onPress={() => onVerifyPress(item, index)} color="#17a2b8" />
              )}
            </TouchableOpacity>
          } */}

        </View>
      </View>
    );

    return (
      <FlatList
        data={bankList}
        renderItem={renderItem}
        keyExtractor={(item) => item['account']}
      />
    );
  };

  return (
    <View style={styles.main}>
      <AppBarSecond title={'WalletSender'} />
      <LinearGradient colors={[colorConfig.primaryColor, colorConfig.secondaryColor]} style={styles.lineargradient}>

      <View style={styles.container}>

        <TextInput
        placeholder='Enter Remitter Registered  Number'
          style={styles.inputstyle}
          maxLength={10}
          keyboardType="number-pad"
          value={sendernum}
          onChangeText={text => {
            setSendernum(text);
            if (text.length === 10) {
              setNxtbtn(true);
              setOnTap(false);
              setOnTap1(true);
              checksendernumber(text);
            } else {
              setNxtbtn(false);
              setOnTap(true);
              setOnTap1(false);
            }
          }}
        />
       <DynamicButton title={onTap1 ? <ActivityIndicator size={'large'} /> : "Next"} disabled={!nxtbtn}
            onPress={handleNextButtonPress} />
        {onTap1 && <ActivityIndicator />}
      </View>
      </LinearGradient>

      <View style={styles.container}>
        <Text style={styles.titletext}>{translate("Very_Important_Notice")}</Text>

        <View style={styles.textview} >
          <View style={styles.bulletPoint} />
          <Text> {translate('first')}</Text>
        </View>

        <View style={styles.textview} >
          <View style={styles.bulletPoint} />
          <Text> {translate('thNotice')}</Text>
        </View>
        <View style={styles.textview} >
          <View style={styles.bulletPoint} />
          <Text> {translate('secondNotice')}</Text>
        </View>
        {nodata ? <View>
          <Text style={styles.title}>{translate('No Data Found')}</Text>
          <Button
            title='Add Acc'
            onPress={() => {
              navigation.navigate("AddNewBenificiaryScreen");

            }}
          />

        </View>
          : <Text style={styles.title}>{translate("Beneficiary_List")}</Text>}
        {isLoading ? <ActivityIndicator color={'green'} /> : <BeneficiaryList
          bankList={banklist}
          onImpsPress={handleImpsPress}
          onNeftPress={handleNeftPress}
          onDeletePress={handleDeletePress}
          onVerifyPress={handleVerifyPress}
        />
        }
      </View>
    </View>

  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    
  },
  lineargradient: {
    marginTop: hScale(20)
  },
  container: {
    paddingHorizontal: wScale(20),
    paddingVertical: wScale(15),
  },

  inputstyle: {marginBottom:hScale(20), backgroundColor: 'white', paddingLeft: wScale(15), borderRadius: 5 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  titletext: {
    color: 'red',
    fontSize: wScale(18),
    paddingBottom: hScale(15),
    paddingTop: hScale(5)
  },
  bulletPoint: {
    backgroundColor: 'red', borderRadius: 100, width: wScale(10),
    height: wScale(10), marginRight: wScale(10), marginTop: wScale(6),
  },
  textview: {
    flexDirection: 'row',
    paddingBottom: hScale(10)
  },





  
  itemContainer: {
    backgroundColor: '#f9f9f9',
    padding: 20,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemText: {
    fontSize: 16,
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});

export default WalletSenderPage;
