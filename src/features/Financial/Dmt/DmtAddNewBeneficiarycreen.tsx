import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet, ToastAndroid, Alert, Button, Modal } from 'react-native';
import { BottomSheet } from '@rneui/base';
import { FlashList } from '@shopify/flash-list';



import { useSelector } from 'react-redux';

import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../../reduxUtils/store';
import { translate } from '../../../utils/languageUtils/I18n';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import { useDeviceInfoHook } from '../../../utils/hooks/useDeviceInfoHook';
import { hScale, SCREEN_HEIGHT, wScale } from '../../../utils/styles/dimensions';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import FlotingInput from '../../drawer/securityPages/FlotingInput';
import OnelineDropdownSvg from '../../drawer/svgimgcomponents/simpledropdown';
import DynamicButton from '../../drawer/button/DynamicButton';
import ClosseModalSvg2 from '../../drawer/svgimgcomponents/ClosseModal2';
import { colors } from '../../../utils/styles/theme';
import { it } from 'date-fns/locale';
import CloseSvg from '../../drawer/svgimgcomponents/CloseSvg';
import ShowLoader from '../../../components/ShowLoder';
import { onReceiveNotification2 } from '../../../utils/NotificationService';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const DmtAddNewBenificiaryScreen = ({ no, Name ,onPress ,onPress2 }) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  const color1 = `${colorConfig.secondaryColor}20`;
  const { userId } = useSelector((state: RootState) => state.userInfo);

  const [name, setName] = useState('');
  const [senderNo, setsenderNo] = useState(no || '');

  const [accountNumber, setAccountNumber] = useState('');
  const [reEnterAccountNumber, setReEnterAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState(translate(''));
  const [isLoading, setIsLoading] = useState(false);
  const [validate, setValidate] = useState(false);
  const [bankList, setBanklist] = useState([]);
  const [isBank, setIsBank] = useState(false);
  const [bank, setBank] = useState(translate('Select Your Bank'));
  const [UnqID, setUnqiD] = useState('');
  const [isSkip, setSkip] = useState(false);
  const [GoodMark, setGoodMark] = useState(false);
  const [GoodMark2, setGoodMark2] = useState(false);
  const [isR, setIsR] = useState(false);
  const navigation = useNavigation<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [verificationDetails, setVerificationDetails] = useState(null);
  const [rid, setrid] = useState('');
    const [id, setid] = useState('');
  const filteredData = (bankList).filter(item =>

    item["bank_name"].toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlepress = () => {
    onPress()

    console.log('efeeeeeeeeeee')
  }
  const handlepress2 = () => {
    onPress2()
  }
  useEffect(() => {
    setIsR(Name === 'A2Z');
    console.log(Name === 'RADIANT');

  }, [])
  const removeUnwantedWords = (text) => {
    let cleanedText = text
      .replace(/\bs\/o\b/gi, '')    
      .replace(/\bw\/o\b/gi, '');   
    console.log(cleanedText.trim())
    return cleanedText.trim();
  };


  const handleAddBeneficiary = async (bename) => {

   
    const namee = await  removeUnwantedWords(bename)
    setIsload(true)

    console.log(Name);
    if (accountNumber === reEnterAccountNumber) {
      setGoodMark2(true);
      setIsLoading(true);
      setValidate(false);

      const url = `MoneyDMT/api/Money/AddNewRecipient?Name=${namee}&AccountNo=${accountNumber}&IFSC=${ifscCode}&SenderNo=${senderNo}&remitterid=${id}`
      console.log(url);
      
      try {
        const res = await post({ url: url });
      console.log(res);
          if (res?.ADDINFO?.statuscode !== 'TXN') {
            setGoodMark2(false);
            Alert.alert('', res['ADDINFO'].status, [{
              text: 'OK', onPress: () => {
                handlepress2()

             //   navigation.goBack();
              }
            }]);
          } else if (res['RESULT'] === '0' && res?.ADDINFO?.statuscode === 'TXN') {

            setGoodMark2(true);
            console.log('ADDINFO', res['ADDINFO']['status'])
            Alert.alert('Success', res['ADDINFO']['status'], [{
              text: '', onPress: () => {
                setModalVisible(false); 
           
                handlepress2()

                //  navigation.goBack();
              }
            }]);
            setIsload(false)
  const mockNotification = {
            notification: {
              title:res['ADDINFO']['status'],
              body: res['ADDINFO']['status']  + `Details - Name :${name} ,Acc No :${accountNumber} ,Mo : ${senderNo}`,
            },
          };
          
          // Call the function
          onReceiveNotification2(mockNotification);  
          } else {
            Alert.alert('Error', '', [{ text: 'OK', onPress: () => { } }]);
            setIsload(false)

          }

        console.log(res['ADDINFO']['data']['beneficiary']);
      } catch (error) {
        console.error('Error saving account:', error);
      } finally {
        setIsload(false)

        setIsLoading(false);
      }
    } else {
      setValidate(true);
    }
  };


  const { get, post } = useAxiosHook();
  useEffect(() => {
    getBanks();
    getGenUniqueId();
  }, [])
  const getBanks = async () => {  
    // try {
    //   const url = `${APP_URLS.MasterIfsc}`
    //   console.log(url);
    //   const res = await get({ url: url });
    //   console.log(res['statuscode']);
    //   console.log(res['status']);
    //   setBanklist(res['data']);
    // } catch (error) {
    //   console.error('Error fetching data:', error);

    // }
    try {
      const url = `MoneyDMT/api/Money/MasterIfsc`
      
      const res = await get({ url: url });

      setBanklist(res['data']);
    } catch (error) {
      console.error('Error fetching data:', error);

    }
  };

  const getGenUniqueId = async () => {
    try {
      const url = `${APP_URLS.getGenIMPSUniqueId}`
      console.log(url);
      const res = await get({ url: url });
      setUnqiD(res.Message);
      console.log(res)


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
  // const bankStatus = async (bankname) => {
  //   console.log(bankname);
  //   try {

  //     const url = `${APP_URLS.getBankDown}${bankname}`; console.log(url);
  //     const res = await get({ url: url });

  //   } catch (error) {

  //   }
  // }
const [isload,setIsload]= useState(false)
  const { getNetworkCarrier, getMobileDeviceId, getMobileIp } =
    useDeviceInfoHook();
    const verifyAcc = async (mb, iff, cd, bno, mal, sk, pi, kk, bankName, kyc, uniqueid) => {
      console.log(mb, iff, cd, bno, mal, sk, pi, kk, bankName, kyc, uniqueid);
      console.log(sk, 'sk');
      setIsload(true)
      try {
        const Model = await getMobileDeviceId();
        const url = `${APP_URLS.verifybankACC}mb=${mb}&iff=${iff}&cd=${Model}&bno=${bno}&mal=${mal}&sk=${sk}&pi=${Model}&kk=${kk}&bankName=${bankName}&kyc=''&uniqueid=${uniqueid}`;
        const verifybankACC = `Money2/api/Money/mmmn2?mb=${mb}&iff=${iff}&cd=${Model}&bno=${bno}&mal=${mal}&sk=${sk}&pi=${Model}&kk=${kk}&bankName=${bankName}&kyc=''&uniqueid=${uniqueid}`;
    
        const res = await post({ url: Name === 'A2Z' ? verifybankACC : url });
        console.log(verifybankACC, '1234567890');
        setIsLoading(false);
        console.log(res,'verifybankACC*****************')
        const addinfo = res.ADDINFO;
        if (res.RESULT === '1') {
          const statusCode = addinfo.statuscode;
          const status = addinfo.status;
    
          if (statusCode === 'IAN') {
            Alert.alert(
              'Invalid Account Number',
              `The account number you submitted is invalid. Please confirm the details:\n\nAccount Number: ${bno}\nName: ${bename}`,
              [{ text: 'OK', onPress: () => {} }]
            );
          } else {
            Alert.alert('Message', res?.ADDINFO?.data?.bankrefno || res?.ADDINFO?.status, [{ text: 'OK', onPress: () => {} }]);
          }
          
          setGoodMark(false);
          setIsLoading(false);
        } else if (res.RESULT === '0') {
          
          const data = addinfo.data;
          const bename = data.benename;
          const verify = data.verification_status;
          const charged_amt = data.charged_amt;
          const bankrefno = data.bankrefno;
          const local = addinfo.Local;
      
          const id = data.ipay_id;
          setrid(id);
          setName(bename);
          setVerificationDetails({
            name: bename,
            status: verify,
            bankRefNo: bankrefno,
          });
          setModalVisible(true);
          const mockNotification = {
            notification: {
              title: verify,
              body: res['ADDINFO']['status']  + `Details - Name :${bename} ,A/c No :${accountNumber} ,Mo : ${senderNo} ,Bank Ref No :${bankrefno}`,
            },
          };
          
          // Call the function
          onReceiveNotification2(mockNotification);
          if (verify === 'VERIFIED') {
            setGoodMark(true);
          } else {
            setGoodMark(false);
          }
          // {"ADDINFO": {"Local": "Local",
          //    "data": {"bankrefno": "",
          //      "benename": "VISHAL HARI VANJARI", "charged_amt": "-2.5000",
          //       "ipay_id": "0J181559374335", "locked_amt": 0,
          //        "remarks": "Transaction Successful",
          //         "verification_status": "VERIFIED"}, 
          // "status": "Transaction Successful", 
          // "statuscode": "TXN"}, "RESULT": "0"} 
          // if (local === 'Local') {
          //   Alert.alert(
          //     bename,
          //     res.ADDINFO,
          //     [{ text: 'OK', onPress: () => {} }]
          //   );
          // }
        } else {
          setIsLoading(false);
          Alert.alert('Failed', res.ADDINFO, [{ text: 'OK', onPress: () => {} }]);
        }

        setIsload(false)
      } catch (error) {
        console.error(error);
      }
    };
    

  const ReverifyAcc = async (mb, iff, cd, bno, mal, sk, pi, kk, bankName, kyc, uniqueid) => {
    try {
      const res = await post({ url: `${APP_URLS.reVerifybankACC}mb=${mb}&iff=${iff}&cd=${cd}&bno=${bno}&mal=${mal}&sk=${sk}&pi=${pi}&kk=${kk}&bankName=${bankName}&kyc=${kyc}&uniqueid=${uniqueid}` })
      console.log(res);
      if (res['RESULT'] === '1') {
        setGoodMark(false);
        setIsLoading(false);
        Alert.alert('', res['ADDINFO'], [{ text: 'OK', onPress: () => { } }]);
      } else if (res['RESULT'] === '0') {

        var bename = res["ADDINFO"]["data"]["benename"];
        var verify = res["ADDINFO"]["data"]["verification_status"];
        var local = res["ADDINFO"]["Local"];

        if (verify == "VERIFIED") {
          setGoodMark(true);
        } else {
          setGoodMark(false);
          Alert.alert(
            '',
            res['ADDINFO'],
            [
              { text: 'OK', onPress: () => { } },
              {
                text: 'Re-verify', onPress: () => {
                  ReverifyAcc(senderNo, ifscCode, '', accountNumber, userId, UnqID, '57bea5094fd9082d', 'RJUPM12131', bank, 'kyc', userId)
                }
              }
            ]
          );
          // setState(() {
          //   verfybtnnn = false;
          // });
        }
        if (local == "Local") {
          Alert.alert(
            '',
            res['ADDINFO'],
            [
              { text: 'OK', onPress: () => { } },
              {
                text: 'Re-verify', onPress: () => {
                  ReverifyAcc(senderNo, ifscCode, '', accountNumber, userId, UnqID, '57bea5094fd9082d', 'RJUPM12131', bank, 'kyc', UnqID)
                }
              }
            ]
          );
        } else {
        }
      } else {
        setIsLoading(false);
        Alert.alert('Failed', res['ADDINFO'], [{ text: 'OK', onPress: () => { } }]);
      }
    } catch (error) {
    }
  }

  const Banks = () => {
    return <FlashList
      style={{ marginBottom: wScale(50), marginHorizontal: wScale(24) }}
      data={filteredData}
      renderItem={({ item }) => {
        return (
          <View
            style={{ marginVertical: wScale(8), marginHorizontal: wScale(24) }}>
            <TouchableOpacity
              style={[styles.operatorview]}

              onPress={async () => {
                setid(item['id']);
                        setid(item['id']);
console.log(item['id']);
                setIfscCode(item['branch_ifsc']);
                setBank(item['bank_name']);
               
                setIsBank(false);
                bankStatus(item['bank_name']);
                setSearchQuery('');
              }}>
              <Text style={[styles.operatornametext]}>

                {item['bank_name']}
              </Text>
            </TouchableOpacity>
          </View>
        );
      }}
      estimatedItemSize={30}
    />
  }
return (
  <View style={[styles.main, { borderColor: colorConfig.secondaryColor }]}>
    {isload && <ShowLoader />}

    {/* Header Section */}
    <View style={[styles.texttitalView, { backgroundColor: colorConfig.secondaryColor }]}>
      <View style={[styles.cutout, { borderTopColor: colorConfig.secondaryColor }]} />
      <Text style={styles.texttital}>{"           "}Add Beneficiary</Text>
      <Text style={{ color: "#fff" }}>{"                   "}{no}</Text>
    </View>

    {/* Close Button */}
    <TouchableOpacity
      onPress={() => handlepress()}
      activeOpacity={0.7}
      style={[styles.closebuttoX, { backgroundColor: colorConfig.secondaryColor }]}
    >
      <CloseSvg />
    </TouchableOpacity>

    {/* Main Form Section with Keyboard Handling */}
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      extraScrollHeight={100}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        
        {/* Name Input */}
        <FlotingInput 
          label={'Name'} 
          valu={name} 
          onChangeTextCallback={text => setName(text)} 
        />

        {/* Account Number Input */}
        <FlotingInput 
          label={'Account Number'} 
          keyboardType="number-pad" 
          valu={accountNumber} 
          onChangeTextCallback={text => setAccountNumber(text)} 
        />

        {/* Re-Enter Account Number Input */}
        <FlotingInput 
          label={translate("Re-Enter Account Number")} 
          keyboardType="number-pad"
          valu={reEnterAccountNumber} 
          onChangeTextCallback={text => setReEnterAccountNumber(text)} 
        />

        {/* Bank Selection */}
        <TouchableOpacity
          onPress={() => {
            if (accountNumber === reEnterAccountNumber && accountNumber.length >= 4) {
              setIsBank(true);
            } else {
              ToastAndroid.show('Please enter and match Account Numbers first', ToastAndroid.SHORT);
            }
          }}
        >
          <FlotingInput label={bank || "Select Bank"} editable={false} />
          <View style={styles.righticon2}>
            <OnelineDropdownSvg />
          </View>
        </TouchableOpacity>

        {/* IFSC Code Input */}
        <FlotingInput 
          label={'IFSC Code'} 
          editable={true} 
          value={ifscCode} 
          onChangeTextCallback={text => setIfscCode(text.toUpperCase())} 
        />

        {/* Action Buttons */}
        <View style={{ marginTop: hScale(10) }}>
          
          {/* Save Account Button */}
          <DynamicButton
            title={translate('Save Account')}
            styleoveride={{ marginBottom: hScale(15) }}
            onPress={() => {
              if (accountNumber === reEnterAccountNumber) {
                handleAddBeneficiary(name);
              } else {
                ToastAndroid.show('Account numbers do not match!', ToastAndroid.BOTTOM);
              }
            }}
            disabled={!accountNumber || !reEnterAccountNumber || !ifscCode || !senderNo || senderNo.length !== 10 || isLoading}
          />

          {/* Verify Account Button */}
          <DynamicButton
            disabled={!accountNumber || !reEnterAccountNumber || !ifscCode || !senderNo || senderNo.length !== 10 || isLoading}
            onPress={() => {
              if (accountNumber === reEnterAccountNumber) {
                verifyAcc(senderNo, ifscCode, '57bea5094fd9082d', accountNumber, userId, UnqID, '57bea5094fd9082d', 'RJUPM12131', bank, 'kyc', UnqID);
                setIsLoading(true);
                setValidate(false);
                setGoodMark(true);
              } else {
                setValidate(true);
              }
            }}
            title={isLoading ? (
              <ActivityIndicator color={colorConfig.labelColor} />
            ) : (
              <Text>{GoodMark ? '✓ Verified' : translate('Verify Account')}</Text>
            )}
          />
        </View>

        {validate && <Text style={{ color: 'red', textAlign: 'center', marginTop: 5 }}>{translate("Account_numbers_do_not_match")}</Text>}

        {/* Bank Selection BottomSheet */}
        <BottomSheet
          animationType="none"
          isVisible={isBank}
          onBackdropPress={() => setIsBank(false)}
        >
          <View style={styles.bottomsheetview}>
            <View style={[styles.StateTitle, { backgroundColor: color1 }]}>
              <Text style={styles.stateTitletext}>{translate("Select_Your_Bank")}</Text>
              <TouchableOpacity onPress={() => setIsBank(false)}>
                <ClosseModalSvg2 />
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Search Bank..."
              value={searchQuery}
              onChangeText={text => setSearchQuery(text)}
              style={styles.searchBar}
              placeholderTextColor={colors.black75}
            />
            {Banks()}
          </View>
        </BottomSheet>

        {/* Verification Success Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalView}>
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{translate("Verification_Details")}</Text>
            {verificationDetails && (
              <View style={{ marginVertical: 10 }}>
                <Text style={{ color: colors.black }}>Name: {verificationDetails.name}</Text>
                <Text style={{ color: colors.black }}>Status: {verificationDetails.status}</Text>
                <Text style={{ color: colors.black }}>Ref No: {verificationDetails.bankRefNo}</Text>
              </View>
            )}
            <View style={styles.buttonContainer}>
              <Button title="Confirm & Save" onPress={() => handleAddBeneficiary(name)} />
              <View style={{ width: 20 }} />
              <Button title="Cancel" color="red" onPress={() => setModalVisible(false)} />
            </View>
          </View>
        </Modal>

      </View>
    </KeyboardAwareScrollView>
  </View>
);
};
const styles = StyleSheet.create({
  main: {
    backgroundColor: '#FFFFFF',
    elevation: 5,
    borderWidth: 1,
    marginTop: hScale(20),
    borderRadius: 5,
    marginHorizontal: wScale(13)
  },
  container: {
    top: hScale(8),
    paddingHorizontal: wScale(20),
    paddingVertical: wScale(15),
    marginTop: hScale(20)
  },
  righticon2: {
    position: "absolute",
    left: "auto",
    right: wScale(0),
    top: hScale(0),
    height: "85%",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: wScale(12),
  },
  operatorview: {
    alignItems: "center",
    paddingHorizontal: wScale(10),
  },
  searchBar: {
    borderColor: 'gray',
    borderWidth: wScale(1),
    paddingHorizontal: wScale(15),
    marginHorizontal: wScale(10),
    marginBottom: hScale(10),
    borderRadius: 5,
    color: colors.black75,
    fontSize: wScale(16),
  },
  operatornametext: {
    textTransform: "capitalize",
    fontSize: wScale(20),
    color: "#000",
    // flex: 1,
    borderBottomColor: "#000",
    borderBottomWidth: wScale(0.5),
    alignSelf: "center",
    paddingVertical: hScale(30),
    width: '100%'
  },
  bottomsheetview: {
    backgroundColor: "#fff",
    height: SCREEN_HEIGHT / 1.4,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  StateTitle: {
    paddingVertical: hScale(10),
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: wScale(10),
    // marginBottom: hScale(10),
  },
  stateTitletext: {
    fontSize: wScale(22),
    color: "#000",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  titleview: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  closeText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  buttonContainer: {
    alignContent: 'space-between',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  
  texttitalView: {
    width: wScale(200),
    height: hScale(40),
    borderTopLeftRadius: wScale(5),
    position: 'absolute',
    top: hScale(-1),
    left: wScale(-1),
    justifyContent: 'center',
    paddingBottom: hScale(3),
    borderBottomRightRadius: 0,
  },
  cutout: {
    borderTopWidth: hScale(40), // Height of the triangle
    borderRightWidth: wScale(33), // Width of the triangle
    borderBottomWidth: wScale(0), // Set to 0 to hide the bottom edge
    borderLeftWidth: wScale(3), // Width of the triangle
    width: '100%',
    height: hScale(40),
    borderRightColor: 'transparent', // Hide the right edge
    borderBottomColor: 'transparent', // Hide the bottom edge
    borderLeftColor: 'transparent', // Hide the left edge
    position: 'absolute',
    right: wScale(-50),
    zIndex: wScale(0),
    top: wScale(0),
  },
  texttital: {
    fontSize: wScale(18),
    fontWeight: 'bold',
    color: '#fff',
    width: 240,
    paddingLeft: wScale(10)
  },
  closebuttoX: {
    borderRadius: wScale(24),
    alignItems: 'center',
    height: wScale(42),
    width: wScale(42),
    justifyContent: 'center',
    elevation: 5,
    position: 'absolute',
    right: wScale(-11),
    top: hScale(-11),
  },
})
export default DmtAddNewBenificiaryScreen;
