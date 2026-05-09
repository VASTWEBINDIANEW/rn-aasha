import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Button, ActivityIndicator, StyleSheet, ToastAndroid, FlatList,
  TouchableOpacity, Alert, 
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

const BeneficiaryList = ({}) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

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
  useEffect(() => {
    getGenUniqueId();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // setBanklist([])
    }, [])
  );

  const checksendernumber = async (number) => {
    setisLoading(true);
    console.log(number);

    try {
      const url = `${APP_URLS.getCheckSenderNo}${number}`;
      const res = await get({ url: url });
      console.log('res', res);

      const addinfo = res?.ADDINFO;

      console.log();

      if (res?.RESULT === '0') {
        setisLoading(false);
        const status = addinfo?.statuscode;

        if (status === "TXN") {
          const remmname = addinfo?.data?.remitter?.name || '';
          const consumelimit = addinfo?.data?.remitter?.consumedlimit?.toString() || '0';
          const remainlimit = addinfo?.data?.remitter?.remaininglimit?.toString() || '0';
          const kycsts = addinfo?.data?.remitter?.kycdone?.toString() || '';
          const photo = addinfo?.data?.remitter?.Photo?.toString() || '';
          const beneficiary = addinfo?.data?.beneficiary || [];
          const remid = addinfo?.data?.remitter?.id || '';

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
      } else if (res?.RESULT === '1') {
        const status = addinfo?.data?.statuscode;
        console.log(addinfo.statuscode)
        console.log(addinfo.data.status)
        if (addinfo.statuscode === "RNF") {
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
                onPress: () => navigation.navigate("NumberRegisterScreen")
                ,
              },
            ],
            { cancelable: false }
          );
        }

        setisLoading(false);
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
    console.log('IMPS pressed for:', item);
    const bankname = item['bank'];
    const ACCno = item['account'];
    const accHolder = item['name'];

    await setIfsc(item['ifsc']);
    await setAccHolder(item['name']);
    await setAccNo(item['account']);
    await setBankName(item['bank'])
    navigation.navigate("toBankScreen", { bankname, ACCno, accHolder, ifsc, mode: 'IMPS', unqid },);

  };


  const handleNeftPress = async (item) => {
    const bankname = item['bank'];
    const ACCno = item['account'];
    const accHolder = item['name'];
    await setIfsc(item['ifsc']);
    await setAccHolder(item['name']);
    await setAccNo(item['account']);
    await setBankName(item['bank'])
    navigation.navigate("toBankScreen", { bankname, ACCno, accHolder, ifsc, mode: 'NEFT', unqid },);
    console.log('NEFT pressed for:', item);
  };

  const handleDeletePress = async (item) => {
    setisLoading(true);
    console.log('Delete pressed for:', item);
    try {
      const res = await post({ url: `${APP_URLS.bankbenDelete}mobile=${item['mobile']}&ifsc=${item['ifsc']}&code&remitterid=${remid}&beneficiaryid=${item['id']}` });
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

  const handleVerifyPress = async (item) => {

    try {
      const res = await post({ url: `${APP_URLS.verifyBank}sender_number=${sendernum}&Accountnumber=${item['account']}&bankname=${item['bank']}&benIFSC=${item['ifsc']}&Name=${item['name']}&Id=${item['id']}uniqueid=${unqid}` })

      console.log(res);
    } catch (error) {

    }
  };

    return (
      <FlashList
        data={banklist}
        renderItem={({ item }: { item: any }) => {
            return (        
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
              <Text style={styles.itemValue}>{item.bank}</Text>
            </View>
            <View style={{
              borderTopWidth: wScale(.5), borderTopColor: '#000',
              marginTop: hScale(8)
            }}>

              <View style={styles.row}>
                <View>
                  <Text style={styles.itemLabel}>{translate("Account")}</Text>
                  <Text style={styles.itemValue}>{item.account}</Text>
                </View>
                <TouchableOpacity style={[styles.button, styles.impsButton]} onPress={() => handleImpsPress(item)}>
                  <Text style={styles.buttonText}>{translate("IMPS")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.neftButton]} onPress={() => handleNeftPress(item)}>
                  <Text style={styles.buttonText}>{translate("NEFT")}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.deleteButton]} onPress={() => handleDeletePress(item)}>
                  <Text style={styles.buttonText}>{translate("Delete")}</Text>
                </TouchableOpacity>
                {item.isverified === true ? null : (
                  <TouchableOpacity style={[styles.button, styles.verifyButton]} onPress={() => handleVerifyPress(item)}>
                    {item.isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>{translate("Verify")}</Text>}
                  </TouchableOpacity>
                )}
              </View>
            </View>

          </View>
        )
    }}
        keyExtractor={item => item.name}
        estimatedItemSize={5}
      />
    );
  };

const styles = StyleSheet.create({
    itemContainer: {
        flex: 1,
        padding: wScale(10),
        backgroundColor: '#f8f9fa',
        borderRadius: 5,
        elevation: 2,
        marginBottom: hScale(10),
        marginHorizontal:wScale(10)
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
      },
      noteText: {
        fontSize: wScale(14),
        color: '#d9534f',
        marginBottom: hScale(10)
      },
     
      button: {
        flex: 1,
        paddingVertical: hScale(12),
        borderRadius: 5,
        alignItems: 'center',
        marginLeft: hScale(12),
        marginTop: hScale(8),
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

export default BeneficiaryList;
