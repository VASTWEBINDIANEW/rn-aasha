import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, StyleSheet, ToastAndroid, FlatList, TouchableOpacity, Alert, ScrollView, Keyboard } from 'react-native';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { translate } from '../../../utils/languageUtils/I18n';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import DynamicButton from '../../drawer/button/DynamicButton';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import LinearGradient from 'react-native-linear-gradient';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { FlashList } from '@shopify/flash-list';
import { SvgXml } from 'react-native-svg';
import { colors } from '../../../utils/styles/theme';

const UpiGetBenifiaryScreen = () => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const EditIcon = ` 

 <?xml version="1.0" encoding="UTF-8"?>
<svg version="1.1" viewBox="0 0 2048 2048" width="1280" fill="#fff" height="1280" xmlns="http://www.w3.org/2000/svg">
<path transform="translate(674,170)" d="m0 0h18l15 3 16 7 14 10 13 13 9 14 4 8 4 13 1 5v26l-4 15-8 16-9 12-7 8-7 6-184 184 1159 1 20 2 16 5 13 7 10 8 7 7 9 14 5 11 4 18v28l-3 14-5 13-6 11-11 13-14 10-14 6-17 4-9 1h-1164l7 8 188 188 11 14 9 17 4 16v25l-4 15-8 16-9 13-9 9-14 10-13 6-11 3-7 1h-23l-14-3-16-8-11-8-358-358-6-10-7-15-2-7-1-8v-18l3-16 4-9 8-16 9-9 1-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2v-2h2l2-4h2l2-4h2l2-4h2l2-4h2l2-4h2l2-4h2v-2l8-7 14-10 16-7z"/>
<path transform="translate(1360,1023)" d="m0 0h10l15 2 14 5 12 7 10 8 10 9 339 339v2h2l8 10 4 9 6 20 2 8v25l-3 10-9 19-9 11-349 349-12 9-11 6-15 5-12 2h-14l-17-3-12-5-12-7-12-11-9-10-9-15-6-16-2-14v-9l2-14 4-13 5-10 7-11 7-7 7-8 159-159h2l2-4 23-23h2v-2l-1168-1-14-2-15-5-14-8-13-12-7-10-8-16-4-17-1-9v-12l2-16 5-16 7-13 8-10 7-7 14-9 11-5 18-4h994l172-1 6 1-2-4-198-198-9-13-7-15-3-12-1-8v-11l3-16 4-12 8-14 7-9 11-11 15-10 15-6 9-2z"/>
</svg>

  `;
  const [sendernum, setSendernum] = useState('');
  const [onTap, setOnTap] = useState(true);
  const [onTap1, setOnTap1] = useState(false);
  const [nxtbtn, setNxtbtn] = useState(false);
  const [banklist, setBanklist] = useState([]);
  const [remid, setRemid] = useState('');
  const { post, get } = useAxiosHook();
  const [isLoading, setisLoading] = useState(true);

  const [nodata, setnodata] = useState(false);
  const [editable, setEditable] = useState(false);

  const navigation = useNavigation<any>();


  useEffect(() => {
    getGenUniqueId();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // setBanklist([])
    }, [])
  );


  const [unqid, setUnqiD] = useState('');
  const upiList = async (number) => {
    try {
      const url = `${APP_URLS.getupiList}${number}`
      console.log(url);
      const res = await get({ url: url });
      console.log(res);

      const addinfo = res['ADDINFO'];
      if (addinfo['statuscode'] === 'TXN') {
        setBanklist(res['ADDINFO']['Response']);
        if (res['ADDINFO']['Response'].length === 0) {
          console.log(res['ADDINFO']['Response'].length);
          navigation.navigate("UpiAddNewVPAScreen", { senderNo: number });
        }
      } else if (addinfo['statuscode'] === 'RNF') {
        navigation.navigate("UpiNumberRegisterScreen", { data: number });

      } else {
        Alert.alert(
          addinfo['Response'],
          "",
          [
            {
              text: "Cancel",
              onPress: () => console.log("Cancel Pressed"),
              style: "cancel",
            },
            {
              text: "ok",
              onPress: () => console.log
              ,
            },
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  const getGenUniqueId = async () => {
    try {
      const url = `${APP_URLS.getGenIMPSUniqueId}`
      console.log(url);
      const res = await get({ url: url });



      if (res['Response'] == 'Failed') {
        ToastAndroid.showWithGravity(
          res['Message'],
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
        )
      } else {
        setUnqiD(res['Message']);
        console.log(res);
        setisLoading(false);
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
      upiList(sendernum);
      setOnTap1(false);
    }
  };
  const handleImpsPress = async (item) => {
    const upiUname = await item['BenName'].toString();
    const UpiId = await item['UPIID'].toString();
    const senderNo = await item['senderno'].toString();


    navigation.navigate("UpiDmtScreen", { upiUname, UpiId, senderNo, unqid },);

    console.log('IMPS pressed for:', item);
  };




  const handleDeletePress = async (item) => {
    const id = item['idno'];
    // {"ADDINFO": {"sts": true}, "RESULT": "0"}
    console.log('handleDeletePress:', id);
    try {
      const res = await get({ url: `${APP_URLS.deleteUpiBef}idno=${id}` });
      console.log('res', res);


      if (res.RESULT === '0') {
        ToastAndroid.showWithGravity('Delete SuccessFully', ToastAndroid.SHORT, ToastAndroid.BOTTOM);
      } else {
        ToastAndroid.showWithGravity('Error', ToastAndroid.SHORT, ToastAndroid.BOTTOM);

        upiList(sendernum);

        let response;
        try {
        } catch (parseError) {
        }

        ToastAndroid.showWithGravity(response.status, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        console.log(response);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleEditable = () => {
    setEditable(!editable);
  }




  const BeneficiaryList2 = () => {
    return (
      <FlashList
        data={banklist}
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
                <Text style={styles.itemValue}>{item['BenName']}</Text>
              </View>


            </View>

            <View style={[styles.row,]}>
              <Text style={styles.itemLabel}>{translate("UPIID")}</Text>
              <Text style={[styles.itemValue, { flex: 1 }]}
                numberOfLines={1} ellipsizeMode='tail'>{item['UPIID']}</Text>
            </View>
            <View style={{
              borderTopWidth: wScale(.5), borderTopColor: '#000',
              marginTop: hScale(8)
            }}>

              <View style={styles.row}>
                <View>
                  <Text style={styles.itemLabel}>{translate("IDno")}</Text>
                  <Text style={[styles.itemValue, { width: wScale(100), textAlign: 'left' }]}>{item['idno']}</Text>
                </View>
                <TouchableOpacity style={[styles.button, styles.impsButton]} onPress={() => handleImpsPress(item)}>
                  <Text style={styles.buttonText}>{translate("Transfer")}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.button, styles.deleteButton]}
                  onPress={() => handleDeletePress(item)}>
                  <Text style={styles.buttonText}>{translate("Delete")}</Text>

                </TouchableOpacity>

              </View>
            </View>

          </View>
        )}
        keyExtractor={item => item.idno}
        estimatedItemSize={50}
      />
    );
  };


  return (

    <View style={styles.main}>
      <AppBarSecond title={'Upi'} />
      <LinearGradient colors={[colorConfig.primaryColor, colorConfig.secondaryColor]} style={styles.lineargradient}>
        <View style={styles.container} >

          <View>
            <TextInput
              placeholder='Enter Remitter Registered  Number'
              placeholderTextColor={colors.black75}
              style={banklist.length === 0 ? styles.inputstyle : (editable
                ? styles.inputstyle :
                StyleSheet.flatten([styles.inputstyle, { fontWeight: 'bold', fontSize: wScale(25) }]))
              }
              maxLength={10}
              keyboardType="number-pad"
              value={
                editable ? "" :
                  sendernum}
              editable={banklist.length === 0 ? true : editable}
              onChangeText={text => {
                setSendernum(text);
                if (text.length === 10) {
                  setNxtbtn(true);
                  setOnTap(false);
                  setOnTap1(true);
                  upiList(text);
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

          <DynamicButton
            title={isLoading ? <ActivityIndicator size={'large'} color={colorConfig.labelColor} /> :
              banklist.length === 0 ? "Next" : "Vpa ID"}
            disabled={!nxtbtn}
            onPress={() => {
              if (banklist.length === 0) {
                handleNextButtonPress();
              } else {
                navigation.navigate("AddNewBenificiaryScreen", { no: sendernum });
              }
            }}
          />
        </View>
      </LinearGradient>

      <ScrollView>

        {banklist.length === 0 ?
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
          :

          <View style={{
            paddingTop: hScale(20),
          }}>
            <BeneficiaryList2 />


          </View>
        }
        {nodata ? <View style={styles.container}>
          <Text style={styles.title}>{translate('No Data Found')}</Text>

          <DynamicButton title={'ADD ACC'} onPress={() => {

            navigation.navigate("AddNewBenificiaryScreen", { no: sendernum });

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
    paddingBottom: hScale(20)
  },
  lineargradient: {
    paddingTop: hScale(10)
  },
  container: {
    paddingHorizontal: wScale(10),
    paddingVertical: wScale(15),
  },
  inputstyle: {
    backgroundColor: 'white',
    paddingLeft: wScale(15),
    borderRadius: 5,
    marginBottom: hScale(15),
    fontSize: wScale(20),
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
    flex: 1,
    textAlign: 'right'
  },
  noteText: {
    fontSize: wScale(14),
    color: '#d9534f',
    marginBottom: hScale(10)
  },

  button: {
    flex: 1,
    height: 42,
    borderRadius: 5,
    alignItems: 'center',
    marginLeft: wScale(8),
    marginTop: hScale(8),
    justifyContent: 'center'
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
});

export default UpiGetBenifiaryScreen;
