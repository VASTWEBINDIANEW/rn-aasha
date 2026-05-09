import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Button, ActivityIndicator, StyleSheet, ToastAndroid, TouchableOpacity, Alert, ScrollView, Keyboard
} from 'react-native';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { translate } from '../../../utils/languageUtils/I18n';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import { useFocusEffect } from '@react-navigation/native';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import DynamicButton from '../../drawer/button/DynamicButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import LinearGradient from 'react-native-linear-gradient';
import { FlashList } from '@shopify/flash-list';
import { SvgXml } from 'react-native-svg';
import TabBar from '../../Recharge/TabView/TabBarView';

const RadiantGetBenifiaryScreen = (route) => {
  const { colorConfig, Loc_Data } = useSelector((state: RootState) => state.userInfo);
  const EditIcon = ` 

 <?xml version="1.0" encoding="UTF-8"?>
<svg version="1.1" viewBox="0 0 2048 2048" width="1280" fill="#fff" height="1280" xmlns="http://www.w3.org/2000/svg">
<path transform="translate(674,170)" d="m0 0h18l15 3 16 7 14 10 13 13 9 14 4 8 4 13 1 5v26l-4 15-8 16-9 12-7 8-7 6-184 184 1159 1 20 2 16 5 13 7 10 8 7 7 9 14 5 11 4 18v28l-3 14-5 13-6 11-11 13-14 10-14 6-17 4-9 1h-1164l7 8 188 188 11 14 9 17 4 16v25l-4 15-8 16-9 13-9 9-14 10-13 6-11 3-7 1h-23l-14-3-16-8-11-8-358-358-6-10-7-15-2-7-1-8v-18l3-16 4-9 8-16 9-9 1-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2l2-4h2l2-4h2l2-4h2l2-4h2l2-4h2l2-4h2v-2l8-7 14-10 16-7z"/>
<path transform="translate(1360,1023)" d="m0 0h10l15 2 14 5 12 7 10 8 10 9 339 339v2h2l8 10 4 9 6 20 2 8v25l-3 10-9 19-9 11-349 349-12 9-11 6-15 5-12 2h-14l-17-3-12-5-12-7-12-11-9-10-9-15-6-16-2-14v-9l2-14 4-13 5-10 7-11 7-7 7-8 159-159h2l2-4 23-23h2v-2l-1168-1-14-2-15-5-14-8-13-12-7-10-8-16-4-17-1-9v-12l2-16 5-16 7-13 8-10 7-7 14-9 11-5 18-4h994l172-1 6 1-2-4-198-198-9-13-7-15-3-12-1-8v-11l3-16 4-12 8-14 7-9 11-11 15-10 15-6 9-2z"/>
</svg>
`;
  const [isR, setIsR] = useState(false);
  const [sendernum, setSendernum] = useState('');
  const [onTap, setOnTap] = useState(false);
  const [onTap1, setOnTap1] = useState(false);
  const [nxtbtn, setNxtbtn] = useState(false);
  const [banklist, setBanklist] = useState([]);
  const [beneficiaryData, setBeneficiaryData] = useState([]);
  const [remid, setRemid] = useState('');
  const { post, get } = useAxiosHook();
  const [isLoading, setisLoading] = useState(true);
  const navigation = useNavigation<any>();
  const [nodata, setnodata] = useState(false);
  const [accHolder, setAccHolder] = useState('')
  const [bankname, setBankName] = useState('')
  const [ACCno, setAccNo] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [editable, setEditable] = useState(false);
  const [bgcolor, setBgcolor] = useState(true);
  const [kyc, setkyc] = useState(false);
  // const { Name } = route.params;
  //const [Name,SetName]=useState('RADIANT')
  const Name = route?.params?.Name || 'RADIANT';

  const [customerDet, setCustomer] = useState('');
  const [remitter, setremitter] = useState(null);
  useEffect(() => {
    getGenUniqueId();
    console.log(Name);
    setIsR(Name == 'RADIANT');
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // setBanklist([])
    }, [])
  );
  const checkvast = async (res) => {
    const addinfo = res?.ADDINFO;
    if (res?.RESULT === '0') {
      setisLoading(false);
      const rem = addinfo?.data;
      console.log(rem.remitter, '============')

      setremitter(rem?.remitter);

      const status = addinfo?.statuscode;

      if (status === "TXN") {
        const beneficiary = addinfo?.data?.beneficiary || [];
        const remid = addinfo?.data?.remitter?.id || '';
        setRemid(remid);

        console.log('remitter', addinfo?.data?.remitter);

        await setBanklist(beneficiary);
        console.log(beneficiary);

        if (beneficiary.length === 0) {
          setisLoading(false);
          setnodata(true);
        } else {
          setnodata(false);
        }
      } else if (status === "RNF") {


      } else if (status === 'ERR') {
        ToastAndroid.showWithGravity(addinfo, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
      }
    } else if (res?.RESULT == 1) {
      const status = addinfo?.data?.statuscode;
      console.log(addinfo.statuscode)
      console.log(addinfo.data.status)
      if (addinfo.statuscode == "RNF") {
        Alert.alert(
          addinfo?.data?.status || "User does not exist",
          "",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel",
            },
            {
              text: "Register",
              onPress: () => navigation.navigate("NumberRegisterScreen", { Name: Name })
              ,
            },
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          res.ADDINFO,
          "",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel",
            },
            {
              text: "",
              onPress: () => { }
              ,
            },
          ],
          { cancelable: false }
        );
      }

      setisLoading(false);
    } else {
      Alert.alert(
        res.ADDINFO,
        "",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          {
            text: "",
            onPress: () => { }
            ,
          },
        ],
        { cancelable: false }
      );
    }
  }
  const checkRadiant = (res) => {
    console.log(res.ADDINFO);
    const ADDINFO = res.ADDINFO;
    if (res.RESULT == 0) {
      const customer = ADDINFO.customer;
      const benes = ADDINFO.benes;
      setCustomer(customer);

      if (ADDINFO.sts == 'TXN') {
        setBanklist(benes);
        console.log(benes.length)
      } else {
        setBanklist(null);
      }

      if (benes.length === 0) {
        setisLoading(false);
        setnodata(true);
      } else {
        setnodata(false);
      }
    } else {
      Alert.alert(
        res.ADDINFO || "User does not exist",
        "",
        [
          {
            text: "Cancel",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          {
            text: "Register",
            onPress: () => navigation.navigate("RadiantNumberRegisterScreen", { Name: Name, sendernum })
            ,
          },
        ],
        { cancelable: false }
      );


    }
  }
  const checksendernumber = async (number) => {
    setBanklist([]);
    setisLoading(true);
    console.log(number);
    try {
      const url2 = `${APP_URLS.getCheckSenderNo}${number}`;
      const url = `Money/api/Radiant/GetBeneficiaryList?sender_number=${number}`;
      const res = await get({ url: Name == 'RADIANT' ? url : url2 });
      console.log('Radiant checksendernumber', res);
      setOnTap1(false);
      if (Name == 'RADIANT') {
        checkRadiant(res);
        setisLoading(false);
        return;
      } else {
        checkvast(res)
      }

      console.log(url);
      const addinfo = res?.ADDINFO;
      // {"Message": "", "Name": "RADIANT", "Response": "Success"}
      console.log(res);
      setOnTap1(false);
      setOnTap(true);

    } catch (error) {
      setisLoading(false);
      console.error('Error:', error);
    }
  };

  const [unqid, setUnqiD] = useState('');
  const getGenUniqueId = async () => {
    try {
      const url = `${APP_URLS.getGenIMPSUniqueId}`
      console.log(url);
      const res = await get({ url: url });
      const res1 = await get({ url: 'Retailer/api/data/DMTStatusCheck1' });
      console.log(res1)
      setUnqiD(res['Message']);
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

  const handleImpsPress2 = async (item) => {
    console.log('IMPS pressed for:', item);
    const bankname = item['bankname'];
    const ACCno = item['AccountNumber'];
    const accHolder = item['fname'];
    const ifsc = item['ifsc'];
    await setIfsc(item['ifsc']);
    await setAccHolder(item['fname']);
    await setAccNo(item['AccountNumber']);
    await setBankName(item['bankname']);
    const BeneficiaryMobile = item['BeneficiaryMobile'];
    const remid = customerDet.id;
    navigation.navigate("toBankScreen", {
      BeneficiaryMobile, remid, bankname, ACCno, accHolder, ifsc, mode: 'IMPS', unqid, kyc
    },);
  };
  const handleImpsPress = async (item) => {
    console.log('IMPS pressed for:', item);
    const bankname = item['bank'];
    const ACCno = item['account'];
    const accHolder = item['name'];
    const ifsc = item['ifsc'];
    await setIfsc(item['ifsc']);
    await setAccHolder(item['name']);
    await setAccNo(item['account']);
    await setBankName(item['bank'])
    navigation.navigate("toBankScreen", { bankname, ACCno, accHolder, ifsc, mode: 'IMPS', unqid, kyc, sendernum, dmttype: Name },);

  };
  const handleNeftPress = async (item) => {
    const bankname = item['bank'];
    const ACCno = item['account'];
    const accHolder = item['name'];

    const ifsc = item['ifsc'];
    await setIfsc(item['ifsc']);
    await setAccHolder(item['name']);
    await setAccNo(item['account']);
    await setBankName(item['bank'])
    navigation.navigate("toBankScreen", { bankname, ACCno, accHolder, ifsc, mode: 'NEFT', unqid, kyc, sendernum, dmttype: Name },);
    console.log('NEFT pressed for:', item);
  };

  const handleNeftPress2 = async (item) => {
    const bankname = item['bank'];
    const ACCno = item['account'];
    const accHolder = item['name'];
    await setIfsc(item['ifsc']);
    await setAccHolder(item['name']);
    await setAccNo(item['account']);
    await setBankName(item['bank'])
    const BeneficiaryMobile = item['BeneficiaryMobile'];

    const remid = customerDet.id;
    navigation.navigate("toBankScreen", { BeneficiaryMobile, remid, bankname, ACCno, accHolder, ifsc, mode: 'NEFT', unqid, kyc },);

  };

  const handleDeletePress2 = async (item) => {
    setisLoading(true);
    console.log('Delete pressed for:', item);

    Alert.alert(
      'Delete Account',
      `Account: ${item.account}\nBank: ${item.bank}\nID: ${item.id}\nIFSC: ${item.ifsc}\nName: ${item.name}`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const res = await post({
                url: `${APP_URLS.bankbenDelete}mobile=${item['mobile']}&ifsc=${item['ifsc']}&code&remitterid=${remid}&beneficiaryid=${item['id']}`,
              });
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
              console.log(error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleDeletePress = async (item) => {
    setisLoading(true);
    console.log('Delete pressed for:', item);

    Alert.alert(
      'Delete Account',
      `Account: ${item.AccountNumber}\nBank: ${item.bankname}\nID: ${item.id}\nIFSC: ${item.ifsc}\nName: ${item.fname}`,
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const res = await get({
                url: `Money/api/Radiant/DeleteBeneficiary?sender_number=${sendernum}&Id=${item.id.toString()}`
                // url: `${APP_URLS.bankbenDelete}mobile=${item['mobile']}&ifsc=${item['ifsc']}&code&remitterid=${remid}&beneficiaryid=${item['id']}`,
              });
              console.log(`Money/api/Radiant/DeleteBeneficiary?sender_number=${sendernum}&Id=${customerDet.id.toString()}`)
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
              console.log(error);
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleVerifyPress = async (item) => {

    try {
      const res = await post({ url: `${APP_URLS.verifyBank}sender_number=${sendernum}&Accountnumber=${item['account']}&bankname=${item['bank']}&benIFSC=${item['ifsc']}&Name=${item['name']}&Id=${item['id']}uniqueid=${unqid}` })

      console.log(res);
    } catch (error) {

    }
  };
  const handleVerifyPress2 = async (item) => {
    console.log(item);
    try {
      const url = `Money/api/Radiant/VerifyBeneficiary?sender_number=${sendernum}&Accountnumber=${item.AccountNumber}&bankname=${item.bankname}&benIFSC=${item.ifsc}&Name=${item.fname}&Id=${customerDet.id}&uniqueid=${unqid}`
      console.log(`Money/api/Radiant/VerifyBeneficiary?sender_number&Accountnumber&bankname&benIFSC&Name&Id&uniqueid=${unqid}`)

      console.log(url)
      const res = await post({ url: url })

      if (res.RESULT === '1') {
        alert(res.ADDINFO)
      } else {
        alert(res.ADDINFO)
      }

      console.log(res);
    } catch (error) {

    }
  };

  const toggleEditable = () => {
    setEditable(!editable);

  }

  const [searchText, setSearchText] = useState('');
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    filterData(searchText);
  }, [searchText, isR, beneficiaryData, banklist]);

  const filterData = (text) => {
    const dataToFilter = isR ? beneficiaryData : banklist;

    if (!text.trim()) {
      setFilteredData(dataToFilter);
    } else {
      const filtered = dataToFilter.filter(item =>
        item.name?.toLowerCase().includes(text.toLowerCase()) ||
        item.account?.toString().includes(text)
      );
      setFilteredData(filtered);
    }
  };

  const BeneficiaryList = () => {
    return (
      <FlashList
        data={filteredData}
        keyExtractor={item => item.id || item.name.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>


            {item.isbankdown ? (
              <Text style={styles.noteText}>{translate("Note_Currently_the_beneficiary_banks_server_is_down_or_busy_please_try_after_sometime")}</Text>
            ) : null}

            <View style={{
              borderBottomWidth: wScale(.5), borderBottomColor: '#000',

              marginBottom: hScale(8), paddingBottom: hScale(5)
            }}>

              <View style={styles.row}>
                <Text style={styles.itemLabel}>{translate("Name")}</Text>
                <Text style={styles.itemValue}>{item.name}</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.itemLabel}>{translate("IFSC_Code")}</Text>
                <Text style={styles.itemValue}>{item.ifsc}</Text>
              </View>
            </View>

            <View style={[styles.row,]}>
              <Text style={styles.itemLabel}>{translate("Bank_Name")}</Text>
              <Text style={styles.itemValue} numberOfLines={1} ellipsizeMode='tail'>{item.bank}</Text>
            </View>
            <View style={{
              borderTopWidth: wScale(.5), borderTopColor: '#000',
              marginTop: hScale(8)
            }}>

              <View style={[styles.row, { marginTop: hScale(8), }]}>
                <View >
                  <Text style={styles.itemLabel}>{translate("Account")}</Text>
                  <Text style={[styles.itemValue, { textAlign: 'left' }]} numberOfLines={1} ellipsizeMode='tail'>{item.account}</Text>
                </View>
                <TouchableOpacity style={[styles.button, styles.impsButton]} onPress={() => handleImpsPress(item)}>
                  <Text style={styles.buttonText}>{translate("IMPS")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.neftButton]} onPress={() => handleNeftPress(item)}>
                  <Text style={styles.buttonText}>{translate("NEFT")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => handleDeletePress(item)}>
                  <Text style={styles.buttonText} >{translate("Delete")}</Text>
                </TouchableOpacity>

              </View>
            </View>

          </View>
        )}
        keyExtractor={item => item.name}
        estimatedItemSize={5}
      />
    );
  };



  return (
    <View style={styles.main}>
      {/* <AppBarSecond title={Name} /> */}
      <LinearGradient colors={[colorConfig.primaryColor, colorConfig.secondaryColor]} style={styles.lineargradient}>
        <View style={styles.container} >

          {sendernum.length === 10 && <TextInput
            placeholder="Search by Name or Account No"
            value={searchText}
            onChangeText={setSearchText}
            style={{
              backgroundColor: '#fff',
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              marginVertical: 10,
              color: '#000'
            }}
            placeholderTextColor="#888"
          />
          }

          <View style={{
            marginTop: hScale(10)
          }}>
            <TextInput
              placeholder='Enter Remitter Registered  Number'
              style={styles.inputstyle}
              maxLength={10}
              keyboardType="number-pad"
              value={sendernum}
              onChangeText={text => {
                setSendernum(text)
                if (text.length === 10) {
                  setNxtbtn(true);
                  setOnTap(false);
                  setOnTap1(true);
                  checksendernumber(text);
                  Keyboard.dismiss();

                } else {
                  setNxtbtn(false);
                  setOnTap(true);
                  setOnTap1(false);
                }
              }}
            />{
              banklist == null ? null :
                <View style={[styles.righticon2]}>
                  <TouchableOpacity style={{ backgroundColor: colorConfig.secondaryColor, paddingVertical: hScale(4) }}
                    onPress={toggleEditable}>
                    <SvgXml xml={EditIcon} width={wScale(40)} height={wScale(28)} />
                  </TouchableOpacity>
                </View>
            }
          </View>

          {remitter === null ? null :
            <View style={[styles.limitview, { flexDirection: 'row' }]}>
              <View style={styles.limitcolum}>
                <Text style={styles.label}>{translate("Consume_limit")}</Text>
                <Text style={styles.value}>
                  {remitter === null ? '0000' : remitter.consumedlimit}
                </Text>
              </View>
              <View style={styles.borderview} />

              <View style={styles.limitcolum}>
                <Text style={styles.label}>{translate("Remain_limit")}</Text>
                <Text style={[styles.value, { textAlign: 'center' }]}>
                  {remitter === null ? '0000' : remitter.remaininglimit}
                </Text>
              </View>
              <View style={styles.borderview} />
              <View style={styles.limitcolum}>
                <Text style={styles.label}>{translate("Per_txn_limit")}</Text>
                <Text style={[styles.value, { textAlign: 'right' }]}>
                  {remitter === null ? '0000' : remitter.perm_txn_limit}
                </Text>
              </View>
            </View>
          }

          {remitter === null ? null :
            <Text style={[styles.limittext, { color: colorConfig.labelColor }]}>
              {remitter === null
                ? '0000'
                : `Consume limit: ${remitter.consumedlimit}, Remain limit: ${remitter.remaininglimit}, Per txn limit: ${remitter.perm_txn_limit}`}
            </Text>}
          <DynamicButton
            title={onTap1 ? <ActivityIndicator size={'large'} color={colorConfig.labelColor} /> : banklist == null ? "Next" : "Add Acount"}
            disabled={!nxtbtn}
            onPress={() => {
              if (banklist == null) {
                handleNextButtonPress();
              } else {
                navigation.navigate("AddNewBenificiaryScreen", { no: sendernum, remid: remid, Name: Name });
              }
            }}
          />
        </View>

      </LinearGradient>

      <ScrollView>

        {banklist.length == 0 ?
          <View style={styles.container}>
            <Text style={styles.titletext}>{translate("Very_Important_Notice")}</Text>
            <View style={styles.textview} >
              <View style={styles.bulletPoint} />
              <Text style={styles.textstyle}> {translate('first')}</Text>
            </View>

            <View style={styles.textview} >
              <View style={styles.bulletPoint} />
              <Text style={styles.textstyle}> {translate('thNotice')}</Text>
            </View>
            <View style={styles.textview} >
              <View style={styles.bulletPoint} />
              <Text style={styles.textstyle}> {translate('secondNotice')}</Text>
            </View>
          </View>
          : <View style={{
            paddingTop: hScale(20),
          }}>
            <BeneficiaryList />
          </View>
        }

        {nodata ? <View style={styles.container}>
          <Text style={styles.title}>{translate('No Data Found')}</Text>

          <DynamicButton title={'ADD ACC'} onPress={() => {

            navigation.navigate("AddNewBenificiaryScreen", { no: sendernum, remid: remid, Name: Name });

          }} />

        </View>
          : <></>
        }
      </ScrollView>
    </View >
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    paddingBottom: hScale(0)
  },
  lineargradient: {
    // paddingTop: hScale(10)
  },
  container: {
    paddingHorizontal: wScale(10),
    paddingBottom: wScale(10),
  },
  inputstyle: {
    backgroundColor: 'white',
    paddingLeft: wScale(15),
    borderRadius: 5,
    marginBottom: hScale(15),
    fontSize: wScale(18),
    color: '#000',
  },

  righticon2: {
    position: "absolute",
    left: "auto",
    right: wScale(0),
    top: hScale(0),
    height: "78%",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: wScale(12),
  },

  title: {
    fontSize: wScale(24),
    fontWeight: 'bold',
    marginBottom: hScale(20),
    color: '#000'
  },
  titletext: {
    color: 'red',
    fontSize: wScale(18),
    paddingBottom: hScale(15),
    paddingTop: hScale(5)
  },
  bulletPoint: {
    backgroundColor: 'red',
    borderRadius: 100,
    width: wScale(10),
    height: wScale(10),
    marginRight: wScale(10),
    marginTop: wScale(6),
  },
  textview: {
    flexDirection: 'row',
    paddingBottom: hScale(10)
  },
  textstyle: {
    color: 'black',
    fontSize: wScale(14),
    flex: 1,
    textAlign: 'justify',

  },
  itemContainer: {
    flex: 1,
    padding: wScale(10),
    backgroundColor: '#f8f9fa',
    borderRadius: 5,
    elevation: 2,
    marginBottom: hScale(10),
    marginHorizontal: wScale(10)
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemLabel: {
    fontSize: wScale(16),
    fontWeight: 'bold',
    color: '#333',
  },
  itemValue: {
    fontSize: wScale(16),
    color: '#555',
    flex: 1, textAlign: 'right'
  },
  noteText: {
    fontSize: wScale(14),
    color: '#d9534f',
    marginBottom: hScale(10)
  },

  button: {
    flex: 1,
    paddingVertical: hScale(12),
    borderRadius: 3,
    alignItems: 'center',
    marginLeft: wScale(8),
  },
  impsButton: {
    backgroundColor: '#007bff',
  },
  neftButton: {
    backgroundColor: '#28a745',
  },
  deleteButton: {
    backgroundColor: '#dc3545',
  },

  buttonText: {
    color: 'white',
    fontSize: wScale(16),
    fontWeight: 'bold',
  },
  limittext: {
    fontSize: wScale(16),
    color: '#333',
    padding: wScale(10),
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    marginVertical: hScale(5),
  },
  tabstyle: {
    paddingVertical: hScale(10),
    backgroundColor: "#fff",
    marginBottom: hScale(10),
    borderRadius: 5,
  },
  limitview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: hScale(10),
    paddingHorizontal: wScale(5),
    borderRadius: 5,
  },
  limitcolum: {
    flexDirection: 'column',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 14,
  },
  borderview: {
    height: '100%',
    width: wScale(0.7),
    backgroundColor: "#fff",
  }
});

export default RadiantGetBenifiaryScreen;
