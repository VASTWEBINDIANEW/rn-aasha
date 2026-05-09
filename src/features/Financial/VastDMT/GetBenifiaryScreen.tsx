import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Button, ActivityIndicator, StyleSheet, ToastAndroid,  FlatList,
  TouchableOpacity, Alert, ScrollView, Keyboard
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
import { colors } from '../../../utils/styles/theme';
import NumberRegisterScreen from './RegisternNewNumber';
import { BottomSheet } from '@rneui/base';
import AddNewBenificiaryScreen from './AddNewBenificiaryScreen';
import ShowLoader from '../../../components/ShowLoder';

const GetBenifiaryScreen = () => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const EditIcon = ` 

 <?xml version="1.0" encoding="UTF-8"?>
<svg version="1.1" viewBox="0 0 2048 2048" width="1280" fill="#fff" height="1280" xmlns="http://www.w3.org/2000/svg">
<path transform="translate(674,170)" d="m0 0h18l15 3 16 7 14 10 13 13 9 14 4 8 4 13 1 5v26l-4 15-8 16-9 12-7 8-7 6-184 184 1159 1 20 2 16 5 13 7 10 8 7 7 9 14 5 11 4 18v28l-3 14-5 13-6 11-11 13-14 10-14 6-17 4-9 1h-1164l7 8 188 188 11 14 9 17 4 16v25l-4 15-8 16-9 13-9 9-14 10-13 6-11 3-7 1h-23l-14-3-16-8-11-8-358-358-6-10-7-15-2-7-1-8v-18l3-16 4-9 8-16 9-9 1-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2l2-4h2l2-4h2l2-4h2l2-4h2l2-4h2l2-4h2v-2l8-7 14-10 16-7z"/>
<path transform="translate(1360,1023)" d="m0 0h10l15 2 14 5 12 7 10 8 10 9 339 339v2h2l8 10 4 9 6 20 2 8v25l-3 10-9 19-9 11-349 349-12 9-11 6-15 5-12 2h-14l-17-3-12-5-12-7-12-11-9-10-9-15-6-16-2-14v-9l2-14 4-13 5-10 7-11 7-7 7-8 159-159h2l2-4 23-23h2v-2l-1168-1-14-2-15-5-14-8-13-12-7-10-8-16-4-17-1-9v-12l2-16 5-16 7-13 8-10 7-7 14-9 11-5 18-4h994l172-1 6 1-2-4-198-198-9-13-7-15-3-12-1-8v-11l3-16 4-12 8-14 7-9 11-11 15-10 15-6 9-2z"/>
</svg>

  
  
  
  
  `;
  const [sendernum, setSendernum] = useState('');
  const [onTap, setOnTap] = useState(false);
  const [onTap1, setOnTap1] = useState(false);
  const [nxtbtn, setNxtbtn] = useState(false);
  const [banklist, setBanklist] = useState([]);
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
  const [kyc, setkyc] = useState(false);
  const [remitter, setremitter] = useState(null);
  const [isTXNP1, setTXNP1] = useState('');
  const [addinfo, setAddInfo] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isVisible2, setIsVisible2] = useState(false);
const [isload,setIsload]= useState(false)
  useEffect(() => {
    getGenUniqueId();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // setBanklist([])
    }, [])
  );

  const checksendernumber = async (number) => {
    setIsload(true)
    setisLoading(true);

    try {
      const url = `${APP_URLS.getCheckSenderNo}${number}`;
      console.log("********^^*******",url)
      const res = await get({ url: url });
      console.log('res', JSON.stringify(res));

      const addinfo = res['ADDINFO'];
      setAddInfo(addinfo)
      console.log(addinfo, '*-*-');

      if (res) {
        setisLoading(false);
        const status = addinfo?.statuscode;
        setTXNP1(status);
        if (status === "TXN") {

          setremitter(addinfo?.data?.remitter);
          setkyc(addinfo?.data?.remitter.kycdone);



          const remmname = addinfo?.data?.remitter?.name || '';
          const consumelimit = addinfo?.data?.remitter?.consumedlimit?.toString() || '0';
          const remainlimit = addinfo?.data?.remitter?.remaininglimit?.toString() || '0';
          const kycsts = addinfo?.data?.remitter?.kycdone?.toString() || '';
          const photo = addinfo?.data?.remitter?.Photo?.toString() || '';
          const beneficiary = addinfo?.data?.beneficiary || [];
          const remid = addinfo?.data?.remitter?.id || '';
          setRemid(remid);
          await setBanklist(beneficiary);
          console.log(beneficiary);

          if (beneficiary.length === 0) {
            setisLoading(false);
            setnodata(true);
            setIsVisible2(banklist.length === 0);
          } else {
            setnodata(false);
          }
        } else if (addinfo.statuscode === "RNF" || addinfo.statuscode === "NUMBEROTP" || addinfo.statuscode === "AADHAROTP") {
          setIsVisible(addinfo.statuscode === 'RNF' || addinfo.statuscode === 'NUMBEROTP' ||addinfo.statuscode === "AADHAROTP")

          if (addinfo.statuscode === "RNF" || addinfo.statuscode === "NUMBEROTP" || addinfo.statuscode === "AADHAROTP") {
            Alert.alert(
              addinfo.statuscode === "AADHAROTP" ? 'Aadhar Verification' : "User does not exist",
              "",
              [
                {
                  text: "Cancel",
                  onPress: () => console.log("Cancel Pressed"),
                  style: "cancel",
                },
                {
                  text: addinfo.statuscode === "AADHAROTP" ? 'Continue Aadhar Verification ' : "Register",
                  onPress: () => 

                    setIsVisible( addinfo.statuscode === 'RNF' || addinfo.statuscode === 'NUMBEROTP')
                  //  navigation.navigate("NumberRegisterScreen", { type: addinfo.statuscode, CName: addinfo.Name, No: number, Name: 'VASTWEB' })

                },
              ],
              { cancelable: false }
            );
          }

        } else if (status === 'ERR') {
          ToastAndroid.showWithGravity(addinfo, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        }
      } else if (res?.RESULT === '1') {
        ToastAndroid.showWithGravity(addinfo, ToastAndroid.SHORT, ToastAndroid.BOTTOM);

        const status = addinfo?.data?.statuscode;
        console.log(addinfo.statuscode)
        console.log(addinfo.data.status)



        setisLoading(false);
      }

      setOnTap1(false);
      setOnTap(true);
      setIsload(false)

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

  const handleImpsPress = async (item) => {
    console.log(item)
    console.log('IMPS pressed for:', item);
    const bankname = item['bank'];
    const ACCno = item['account'];
    const accHolder = item['name'];
    const ifsc = item['ifsc'];
    console.log('**CHECK', bankname, ACCno, accHolder, ifsc);
    setIfsc(item['ifsc']);
    setAccHolder(item['name']);
    setAccNo(item['account']);
    setBankName(item['bank'])

    navigation.navigate("toBankScreen", { bankname, ACCno, accHolder, ifsc, mode: 'IMPS', unqid, kyc, senderNo: sendernum, dmttype: 'VASTWEB', id: remid },);

  };


  const handleNeftPress = async (item) => {

    await setIfsc(item['ifsc']);
    await setAccHolder(item['name']);
    await setAccNo(item['account']);
    await setBankName(item['bank'])
    const bankname = item['bank'];
    const ACCno = item['account'];
    const accHolder = item['name'];
    const ifsc = item['ifsc'];
    navigation.navigate("toBankScreen", { bankname, ACCno, accHolder, ifsc, mode: 'NEFT', unqid, dmttype: 'VASTWEB', id: remid },);
    console.log('NEFT pressed for:', item);
  };

  const handleDeletePress = async (item) => {
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



  const toggleEditable = () => {
    setEditable(!editable);

  }

  const [searchText, setSearchText] = useState('');
const [filteredData, setFilteredData] = useState([]);

useEffect(() => {
  filterData(searchText);
}, [searchText,  banklist]);

const filterData = (text) => {
  const dataToFilter =  banklist;

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
    console.log("************^#%%%%%%%%%", filteredData);
 
    return (
      <FlashList
        data={filteredData}
        keyExtractor={item => item.id}
        estimatedItemSize={160}
        contentContainerStyle={{ paddingHorizontal: wScale(12), paddingVertical: hScale(8) }}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
 
            {/* Bank Down Warning */}
            {item.isbankdown && (
              <View style={styles.warningBanner}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.noteText} numberOfLines={2}>
                  {translate("Note_Currently_the_beneficiary_banks_server_is_down_or_busy_please_try_after_sometime")}
                </Text>
              </View>
            )}
 
            {/* Top: Avatar + Name + IFSC */}
            <View style={styles.cardTop}>
              <View style={[styles.avatar, { backgroundColor: `${colorConfig.secondaryColor}18` }]}>
                <Text style={[styles.avatarText, { color: colorConfig.secondaryColor }]}>
                  {item.name?.charAt(0)?.toUpperCase() ?? '?'}
                </Text>
              </View>
 
              <View style={styles.cardTopInfo}>
                <Text style={styles.nameText} numberOfLines={1}>{item.name}</Text>
                <View style={styles.ifscBadge}>
                  <Text style={styles.ifscLabel}>{translate("IFSC_Code")}  </Text>
                  <Text style={styles.ifscValue}>{item.ifsc}</Text>
                </View>
              </View>
            </View>
 
            {/* Divider */}
            <View style={styles.divider} />
 
            {/* Middle: Bank + Account */}
            <View style={styles.infoGrid}>
              <View style={styles.infoCell}>
                <Text style={styles.cellLabel}>{translate("Bank_Name")}</Text>
                <Text style={styles.cellValue} numberOfLines={1} ellipsizeMode="tail">{item.bank}</Text>
              </View>
              <View style={styles.infoCellDivider} />
              <View style={[styles.infoCell, { alignItems: 'flex-end' }]}>
                <Text style={styles.cellLabel}>{translate("Account")}</Text>
                <Text style={styles.cellValue} numberOfLines={1} ellipsizeMode="tail">{item.account}</Text>
              </View>
            </View>
 
            {/* Divider */}
            <View style={styles.divider} />
 
            {/* Bottom: Action Buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.actionChip, { backgroundColor: '#1D6FE8' }]}
                onPress={() => handleImpsPress(item)}
                activeOpacity={0.82}
              >
                <Text style={styles.chipText}>{translate("IMPS")}</Text>
              </TouchableOpacity>
 
              <TouchableOpacity
                style={[styles.actionChip, { backgroundColor: '#16A34A' }]}
                onPress={() => handleNeftPress(item)}
                activeOpacity={0.82}
              >
                <Text style={styles.chipText}>{translate("NEFT")}</Text>
              </TouchableOpacity>
 
              <View style={styles.chipSpacer} />
 
              <TouchableOpacity
                style={[styles.actionChip, styles.deleteChip]}
                onPress={() => handleDeletePress(item)}
                activeOpacity={0.82}
              >
                <Text style={styles.deleteChipText}>{translate("Delete")}</Text>
              </TouchableOpacity>
            </View>
 
          </View>
        )}
      />
    );
  };
 
 




  return (
    <View style={styles.main}>

      {isload && <ShowLoader/>}
      <LinearGradient colors={[colorConfig.primaryColor, colorConfig.secondaryColor]} style={styles.lineargradient}>
        <View style={styles.container} >
          {sendernum.length === 10 && <TextInput
            placeholder="Search by Name or Account No"
            value={searchText}
            onChangeText={setSearchText}
            style={styles.inputstyle}
            placeholderTextColor="#888"
          />
          }

          <View>
            <TextInput
              placeholder='Enter Remitter Registered  Number'
              placeholderTextColor={colors.black75}
              style={styles.inputstyle

              }
              maxLength={10}
              keyboardType="number-pad"
              value={sendernum}
              //   onChangeText={(text) => {
              //     if (/^\d+$/.test(text) && +text >= 1 && +text <= 5000) {
              //       setSendernum(text);
              //     } else if (text === '') {
              //       setSendernum(text);
              //     }
              // }}
              editable={banklist.length === 0 ? true : editable}
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
              banklist.length === 0 ? null :
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
          {isTXNP1 === 'TXN' && <DynamicButton
            title={onTap1 ? <ActivityIndicator size={'large'} color={colorConfig.labelColor} /> : banklist.length === 0 ? "Next" : "add_acc"}
            disabled={!nxtbtn}
            onPress={() => {
              if (banklist.length === 0) {
                handleNextButtonPress();
              } else {

                setIsVisible2(true)
                // navigation.navigate("AddNewBenificiaryScreen", { no: sendernum });
              }
            }}
          />}
        </View>
      </LinearGradient>

      <ScrollView>

        {banklist.length === 0 ?
          <View style={styles.container}>
            <Text style={styles.titletext}>{translate("Very_Important_Notice")}</Text>
            <View style={styles.textview} >
              <View style={styles.bulletPoint} />
              <Text style={styles.textstyle}> {translate('SP1')}</Text>
            </View>

            <View style={styles.textview} >
              <View style={styles.bulletPoint} />
              <Text style={styles.textstyle}> {translate('SP2')}</Text>
            </View>
            <View style={styles.textview} >
              <View style={styles.bulletPoint} />
              <Text style={styles.textstyle}> {translate('SP3')}</Text>
            </View>
            <View style={styles.textview} >
              <View style={styles.bulletPoint} />
              <Text style={styles.textstyle}> {translate('SP4')}</Text>
            </View>
            <View style={styles.textview} >
              <View style={styles.bulletPoint} />
              <Text style={styles.textstyle}> {translate('SP5')}</Text>
            </View>
            <View style={styles.textview} >
              <View style={styles.bulletPoint} />
              <Text style={styles.textstyle}> {translate('SP6')}</Text>
            </View>
          </View>
          :

          <View style={{
            paddingTop: hScale(20),
          }}>
            <BeneficiaryList />


          </View>
          
        }
        </ScrollView>
        <ScrollView>
        {nodata ? <View style={styles.container}>
          <Text style={styles.title}>{translate('No Data Found')}</Text>

          <DynamicButton title={'ADD ACC'} onPress={() => {
            setIsVisible2(true)
            //  navigation.navigate("AddNewBenificiaryScreen", { no: sendernum });

          }} />

        </View>
          : <></>
        }
        {(addinfo && addinfo.statuscode === 'RNF' || addinfo.statuscode === 'NUMBEROTP' ||addinfo.statuscode === 'AADHAROTP') &&


          <BottomSheet animationType="none"   onBackdropPress={() => { setIsVisible(false) }} isVisible={isVisible}>

            <NumberRegisterScreen
              type={addinfo.statuscode}
              CName={addinfo.Name}
              No={sendernum}
              Name={'VASTWEB'}
              onPress={(v) => {
                setIsVisible(v);
              }}
            />
          </BottomSheet>
        }



        <BottomSheet animationType="none"   
        onBackdropPress={() => {  setIsVisible2(false) }} isVisible={isVisible2}>

          <AddNewBenificiaryScreen
            Name={''}
            Name2={''}
            no={sendernum}
            remid={''}
            onPress={() => {
              setIsVisible2(false);
            }}
            onPress2={() => {
              setisLoading(true);

              checksendernumber(sendernum)
              setIsVisible2(false);
            }}

          />

        </BottomSheet>
      </ScrollView>
    </View >
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  lineargradient: {
    paddingTop: hScale(10)
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
    color: '#000'
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
    fontWeight: 'bold',
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
    fontSize: wScale(14),
    flex: 1,
    textAlign: 'justify',
    color: colors.black75
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
  verifyButton: {
    backgroundColor: '#17a2b8',
  },
  buttonText: {
    color: 'white',
    fontSize: wScale(16),
    fontWeight: 'bold',
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
    color: '#fff'
  },
  value: {
    fontSize: 14,
    color: '#fff'

  },
  borderview: {
    height: '100%',
    width: wScale(0.7),
    backgroundColor: "#fff",
  },

  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: wScale(12),
    paddingVertical: hScale(8),
    borderBottomWidth: 1,
    borderBottomColor: '#FED7AA',
    gap: wScale(6),
  },
  warningIcon: { fontSize: wScale(13), marginTop: 1 },
 
 
  // Card Top
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wScale(14),
    paddingTop: hScale(14),
    paddingBottom: hScale(10),
    gap: wScale(12),
  },
  avatar: {
    width: wScale(44),
    height: wScale(44),
    borderRadius: wScale(22),
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: wScale(20),
    fontWeight: '800',
  },
  cardTopInfo: { flex: 1 },
  nameText: {
    fontSize: wScale(15),
    fontWeight: '700',
    color: '#111827',
    marginBottom: hScale(3),
  },
  ifscBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ifscLabel: {
    fontSize: wScale(11),
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  ifscValue: {
    fontSize: wScale(12),
    color: '#374151',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
 
  // Info Grid
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: wScale(14),
  },
  infoGrid: {
    flexDirection: 'row',
    paddingHorizontal: wScale(14),
    paddingVertical: hScale(10),
    alignItems: 'center',
  },
  infoCell: { flex: 1 },
  infoCellDivider: {
    width: 1,
    height: hScale(30),
    backgroundColor: '#E5E7EB',
    marginHorizontal: wScale(12),
  },
  cellLabel: {
    fontSize: wScale(10),
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  cellValue: {
    fontSize: wScale(13),
    color: '#1F2937',
    fontWeight: '600',
  },
 
  // Buttons
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wScale(14),
    paddingVertical: hScale(10),
    gap: wScale(6),
  },
  actionChip: {
    paddingHorizontal: wScale(16),
    paddingVertical: hScale(9),
    borderRadius: wScale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    color: '#fff',
    fontSize: wScale(13),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  chipSpacer: { flex: 1 },
  deleteChip: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  deleteChipText: {
    color: '#DC2626',
    fontSize: wScale(13),
    fontWeight: '700',
  },
});

export default GetBenifiaryScreen;
