import { translate } from "../../../utils/languageUtils/I18n";
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator, FlatList, ToastAndroid } from 'react-native';

import { useSelector } from 'react-redux';
import axios from 'axios';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import { hScale, wScale } from '../../../utils/styles/dimensions';
const DealerAddWalletAndAddAcc = () => {
  const authToken = useSelector(state => state.userInfo.authToken);

  const {get, post} = useAxiosHook();
  const [bankName, setBankName] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [branch, setBranch] = useState('');
  const [accountType, setAccountType] = useState('');
  const [city, setCity] = useState('');
  const [wallets, setWallets] = useState([]);
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(false);
  
  const [walletHolderName, setWalletHolderName] = useState('');
  const [walletNo, setWalletNo] = useState('');
  const [walletName, setWalletName] = useState('');


  const [activeForm, setActiveForm] = useState(null); 

  const handleBankAccountSave = async () => {
    
    if (!bankName || !ifscCode || !accountHolderName || !accountNo || !branch || !accountType || !city) {
      Alert.alert('Error', 'key_pleasefil_72');
      return;
    }
    setLoading2(true)
    try {
      const res = await get({
        url: `${APP_URLS.Add_dealer_Bank}Banknm=${bankName}&BranchName=${branch}&ifsccode=${ifscCode}&accountno=${accountNo}&accounttype=${accountType}&accountholder=${accountHolderName}&City=${city}`,
      });
  console.log(res);
      if (res?.status==='Success') { 
        ToastAndroid.show('Account added successfully', ToastAndroid.SHORT);
      } else {

        ToastAndroid.show('Failed to add account. Please try again.', ToastAndroid.SHORT);
      }
      setLoading2(false)

    } catch (error) {
      console.error(error);
      ToastAndroid.show('key_anerroro_12', ToastAndroid.SHORT);
    }
  
    resetBankForm();
    setActiveForm(null);
  };

  const handleWalletSave = async () => {
    if (!walletHolderName || !walletNo || !walletName) {
      Alert.alert('Error', 'Please fill all the wallet details.');
      return;
    }
    setLoading2(true)

    try {
      const url = `${APP_URLS.Add_dealer_Wallet}walletnm=${walletName}&walletno=${walletNo}&walletholdername=${walletHolderName}`;
      console.log(url); 
  
      const res = await post({ url });
  
      console.log(res, '*****************************');
  
      if (res.status=='success') {
        ToastAndroid.show('Wallet added successfully', ToastAndroid.SHORT);
      } else {
        ToastAndroid.show('Failed to add wallet. Please try again.', ToastAndroid.SHORT);
      }
      setLoading2(false)

      resetWalletForm();
      setActiveForm(null); 
  
    } catch (error) {
      console.error(error);
      ToastAndroid.show('key_anerroro_12', ToastAndroid.SHORT);
    }
  };
  

  const resetBankForm = () => {
    setBankName('');
    setIfscCode('');
    setAccountHolderName('');
    setAccountNo('');
    setBranch('');
    setAccountType('');
    setCity('');
  };

  const resetWalletForm = () => {
    setWalletHolderName('');
    setWalletNo('');
    setWalletName('');
  };

  const handleSubmit = () => {
    if (activeForm === 'bank') {
      handleBankAccountSave();
    } else if (activeForm === 'wallet') {
      console.log(activeForm);

      handleWalletSave();
    }
  };

  useEffect(() => {

    
    const getAddedWallets = async () => {
      try {
        const response = await get({ url: APP_URLS.getDealerAddedWalletAndBanks });
        console.log(response);
        if (response?.Walletlis) {
          setWallets(response.Walletlis);
          setBanks(response.banklist);
        } else {
          setWallets([]);
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'Failed to load wallet data');
        setWallets([]);
      } finally {
        setLoading(false);
      }
    };
    getAddedWallets();
  }, []);

  const onDelete = async (deleteId) => {
    try {
      const url = `https://native.${APP_URLS.baseWebUrl}${APP_URLS.Delete_dealer_Wallet}`;
      const params = { id: deleteId };
  
      console.log('Making request to URL:', url);
      console.log('Request params:', params);
  
      const response = await axios.delete(url, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`,  
        },
        params: params,
      });
  
      console.log('Response received:', response);
  
      if (response) {
        const data = response.data;
        const status = data.status;
  
        if (status === 'success') {
          Alert.alert(
            'Success',
            'DELETE success',
            [
              { text: 'OK', onPress: () => console.log('Success') },
            ],
            { cancelable: false }
          );
        } else {
          Alert.alert(
            'Error',
            'Not Delete',
            [
              { text: 'OK', onPress: () => console.log('Failed to delete') },
            ],
            { cancelable: false }
          );
        }
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error during DELETE request:', error);
  
      if (error.message === 'Network Error') {
        ToastAndroid.show('key_networker_54', ToastAndroid.LONG);
      } else {
        ToastAndroid.show('Data Not Found', ToastAndroid.SHORT);
      }
    }
  };
  


  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.rowview}>
        <Text style={styles.timetex}>{translate("Wallet_Name")}</Text>
        <Text style={styles.amounttex}>{item.walletname}</Text>
      </View>
      <View style={styles.border} />
      <View style={styles.rowview}>
        <Text style={styles.timetex}>{translate("Wallet_Holder")}</Text>
        <Text style={styles.amounttex}>{item.walletholdername}</Text>
      </View>
      <View style={styles.border} />
      <View style={styles.rowview}>
        <Text style={styles.timetex}>{translate("Wallet_No")}</Text>
        <Text style={styles.amounttex}>{item.walletno}</Text>
      </View>
      <View style={styles.border} />
      <View style={styles.rowview}>
        <Text style={styles.timetex}>{translate("Creation_Date")}</Text>
        <Text style={styles.amounttex}>{new Date(item.createdate).toLocaleString()}</Text>
      </View>
      <TouchableOpacity onPress={() => onDelete(item.walletid)} style={styles.deleteButton}>
        <Text style={styles.deleteText}>🗑</Text>
      </TouchableOpacity>
    </View>
  );
  
  const renderItem2 = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.rowview}>
        <Text style={styles.timetex}>{translate("Account_Holder_Name")}</Text>
        <Text style={styles.amounttex}>{item.holdername}</Text>
      </View>
      <View style={styles.border} />
      <View style={styles.rowview}>
        <Text style={styles.timetex}>{translate("Bank_Name")}</Text>
        <Text style={styles.amounttex}>{item.banknm}</Text>
      </View>
      <View style={styles.border} />
      <View style={styles.rowview}>
        <Text style={styles.timetex}>{translate("Branch_Name")}</Text>
        <Text style={styles.amounttex}>{item.branch_nm}</Text>
      </View>
      <View style={styles.border} />
      <View style={styles.rowview}>
        <Text style={styles.timetex}>{translate("Account_Number")}</Text>
        <Text style={styles.amounttex}>{item.acno}</Text>
      </View>
      <View style={styles.border} />
      <View style={styles.rowview}>
        <Text style={styles.timetex}>{translate("IFSC_Code")}</Text>
        <Text style={styles.amounttex}>{item.ifsccode}</Text>
      </View>
      <View style={styles.border} />
      <View style={styles.rowview}>
        <Text style={styles.timetex}>{translate("Account_Type")}</Text>
        <Text style={styles.amounttex}>{item.actype}</Text>
      </View>
       <View style={styles.border} />
      <View style={styles.rowview}>
        <Text style={styles.timetex}>{translate("Creation_Date")}</Text>
        <Text style={styles.amounttex}>{new Date(item.createdate).toLocaleString()}</Text>
      </View>
      <View style={styles.border} />
      <TouchableOpacity onPress={() => onDelete(item.idno)} style={styles.deleteButton}>
        <Text style={styles.deleteText}>🗑</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.main}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setActiveForm(activeForm === 'bank' ? null : 'bank')}
      >
        <Text style={styles.buttonText}>{activeForm === 'bank' ? 'Close Bank Account Form' : 'Add Bank Account + '}</Text>
      </TouchableOpacity>

 
      {activeForm === 'bank' ? (
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Bank Name"
            value={bankName}
            onChangeText={setBankName}
          />
          <TextInput
            style={styles.input}
            placeholder="IFSC Code"
            value={ifscCode}
            onChangeText={setIfscCode}
          />
          <TextInput
            style={styles.input}
            placeholder="Account Holder Name"
            value={accountHolderName}
            onChangeText={setAccountHolderName}
          />
          <TextInput
            style={styles.input}
            placeholder="Account No"
            keyboardType="number-pad"
            value={accountNo}
            onChangeText={setAccountNo}
          />
          <TextInput
            style={styles.input}
            placeholder="Branch"
            value={branch}
            onChangeText={setBranch}
          />
          <TextInput
            style={styles.input}
            placeholder="Account Type"
            value={accountType}
            onChangeText={setAccountType}
          />
          <TextInput
            style={styles.input}
            placeholder="City"
            value={city}
            onChangeText={setCity}
          />

{(activeForm === 'bank' || activeForm === 'wallet') && (
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        { loading2 ?  <ActivityIndicator color={'white'} />:<Text style={styles.submitButtonText}>Submit</Text>}
        </TouchableOpacity>
      )}

        </View>



      ): (<View>

<Text>{translate("Available_Banks")}</Text>

{loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <View style={styles.container}>
          {banks.length === 0 ? (
            <Text>{translate("No_Banks_Available")}</Text>
          ) : (
            <FlatList
              data={banks}
              renderItem={renderItem2}
              keyExtractor={(item, index) => item.walletid ? item.walletid.toString() : index.toString()} // Key extractor fix
            />
          )}
        </View>
      )}

      </View>)}

      <TouchableOpacity
        style={styles.button}
        onPress={() => setActiveForm(activeForm === 'wallet' ? null : 'wallet')}
      >
        <Text style={styles.buttonText}>{activeForm === 'wallet' ? 'Close Wallet Form' : 'Add Wallet + '}</Text>
      </TouchableOpacity>

      {activeForm === 'wallet' ?(
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Wallet Holder Name"
            value={walletHolderName}
            onChangeText={setWalletHolderName}
          />
          <TextInput
            style={styles.input}
            placeholder="Wallet No"
            value={walletNo}
            keyboardType="number-pad"
            onChangeText={setWalletNo}
          />
          <TextInput
            style={styles.input}
            placeholder="Wallet Name"
            value={walletName}
            onChangeText={setWalletName}
          />
          {(activeForm === 'bank' || activeForm === 'wallet') && (
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        { loading2 ?  <ActivityIndicator color={'white'} />:<Text style={styles.submitButtonText}>Submit</Text>}
        </TouchableOpacity>
      )}
        </View>
      ) :(<View><Text>{translate("Available_Wallets")}</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#4CAF50" />
        ) : (
          <View style={styles.container}>
            {wallets.length === 0 ? (
              <Text>{translate("No_Wallets_Available")}</Text>
            ) : (
              <FlatList
                data={wallets}
                renderItem={renderItem}
                keyExtractor={(item, index) => item.walletid ? item.walletid.toString() : index.toString()} // Key extractor fix
              />
            )}
          </View>
        )}</View>)}

   

      <View style={{ height: hScale(20) }} />
      




    </ScrollView>
  );
};

const styles = StyleSheet.create({
  main: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: hScale(20),
    paddingBottom: hScale(100),
  },  
  
  container:{
    flex:1,
    padding:hScale(15)
  },
  card: {
          marginBottom: hScale(10),
          borderWidth: wScale(0.7),
          borderRadius: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
          paddingHorizontal: wScale(10),
          paddingVertical: hScale(8),
      },
      rowview: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
      },
      border: {
          borderBottomWidth: wScale(0.7),
          borderColor: '#000',
          marginVertical: hScale(4),
      },
      amounttex: {
          fontSize: wScale(15),
          color: '#000',
          fontWeight: 'bold',
      },
      timetex: {
          fontSize: 14,
          color: '#000',
      },
      textrit: {
          textAlign: 'right',
      },
  button: {
    backgroundColor: '#3498db',
    paddingVertical: hScale(12),
    marginHorizontal: hScale(20),
    marginTop: hScale(20),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: '#fff',
    marginHorizontal: hScale(20),
    padding: hScale(20),
    marginTop: hScale(20),
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  input: {
    height: hScale(50),
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: hScale(15),
    paddingHorizontal: hScale(12),
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  submitButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: hScale(15),
    marginHorizontal: hScale(20),
    marginTop: hScale(20),
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 10,
    backgroundColor: '#FF4C4C', 
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  deleteText: {
    fontSize: 20,
    color: '#FFFFFF', 
  },

});

export default DealerAddWalletAndAddAcc;
