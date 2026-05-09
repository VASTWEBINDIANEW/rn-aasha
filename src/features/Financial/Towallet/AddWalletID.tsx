import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import FlotingInput from '../../drawer/securityPages/FlotingInput';
import { translate } from '../../../utils/languageUtils/I18n';
import DynamicButton from '../../drawer/button/DynamicButton';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { FlashList } from '@shopify/flash-list';
import { BottomSheet } from '@rneui/base';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const AddNewWallet = ({ sendernum }) => {
  const [name, setName] = useState('');
  const [account, setAccount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);

  const [banklist, setBanklist] = useState([]);
  const [selectedBank, setSelectedBank] = useState("");
  const [ifsc, setIfsc] = useState(null);
  const { post, get } = useAxiosHook();
  
  useEffect(() => {
    fetchBankDetails();
  }, []);

  const fetchBankDetails = async () => {
    try {
      const url = `${APP_URLS.ccBanks}`
      const response = await get({url:`${APP_URLS.ccBanks}`})
      console.log(response);
      setBanklist(response);
      if (!response) {
   
      } else {
        throw new Error('Failed to fetch bank details');
      }
    } catch (error) {
      console.error('Error fetching bank details:', error);
    }
  };

  const saveDetails = async () => {
    if (!name || !account || !ifsc || account.length < 10) {
      Alert.alert(
        'Validation Error',
        account.length < 10
          ? 'Account number should be at least 10 characters'
          : 'Please fill all fields'
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        'http://api.vastwebindia.com/Money/api/Money/CCbenificierySave',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer <your_access_token>',
          },
          body: JSON.stringify({
            name,
            Mobile: sendernum,
            Ifsc: ifsc,
            OriginalIfsc: ifsc,
            Account: account,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const { mess, sts } = data;
        Alert.alert(
          mess,
          null,
          [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
          { cancelable: false }
        );
      } else {
        throw new Error('Failed to save details');
      }
    } catch (error) {
      console.error('Error saving details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showBottomSheetList = () => {
    return (
      <FlashList
        data={banklist}
        renderItem={({ item }) => {
          return (
            <View style={{}}>
              <TouchableOpacity
                style={[styles.operatorview]}
                onPress={async () => {
                  // Handle onPress action
                }}>
                <Text style={styles.operatornametext}>
                  {item['bank_name'].toString()}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }}
        estimatedItemSize={30}
      />
    );
  };

return (
  <View style={{ flex: 1, backgroundColor: '#fff' }}>
    <KeyboardAwareScrollView 
      contentContainerStyle={[styles.container, { paddingBottom: hScale(20) }]}
      keyboardShouldPersistTaps="handled"
    >
      {/* Sender Number Display */}
      {sendernum && (
        <Text style={[styles.label, { marginBottom: hScale(10), marginLeft: 5 }]}>
          Sender: {sendernum}
        </Text>
      )}

      {/* Account Holder Name */}
      <FlotingInput
        label={translate('Enter Name')}
        value={name}
        onChangeTextCallback={(text) => setName(text)}
        inputstyle={[styles.input, { height: hScale(50) }]}
        editable={true}
      />

      {/* Bank Selection Trigger */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setIsLoading2(true)}
        style={{ marginBottom: hScale(15) }}
      >
        <View pointerEvents="none">
          <FlotingInput
            label={'Select Bank'}
            value={selectedBank}
            editable={false}
            inputstyle={[styles.input, { height: hScale(50) }]}
          />
        </View>
        {/* Dropdown Icon Positioned Absolutely if needed */}
      </TouchableOpacity>

      {/* Account Number Input */}
      <FlotingInput
        label={'Enter Account Number'}
        value={account} // यहाँ पहले 'name' था, उसे 'account' से बदल दिया गया है
        onChangeTextCallback={(text) => setAccount(text)}
        keyboardType="number-pad"
        editable={true}
        inputstyle={[styles.input, { height: hScale(50) }]}
      />

      {/* Submit Button */}
      <DynamicButton
        title={translate('Save Details')}
        onPress={() => saveDetails()}
        styleoveride={[styles.button, { marginTop: hScale(20) }]}
      />

      {/* Bank List BottomSheet */}
      <BottomSheet
        animationType="slide"
        isVisible={isLoading2}
        onBackdropPress={() => setIsLoading2(false)}
      >
        <View style={styles.bottomSheetContainer}>
          <View style={styles.bottomSheetHeader}>
             <Text style={styles.bottomSheetTitle}>{translate("Select_Bank")}</Text>
             <TouchableOpacity onPress={() => setIsLoading2(false)}>
                <Text style={{color: 'red', fontWeight: 'bold'}}>{translate("Close")}</Text>
             </TouchableOpacity>
          </View>
          
          <ScrollView style={{ maxHeight: hScale(400) }}>
            {banklist && banklist.length > 0 ? (
              banklist.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.bottomSheetItem}
                  onPress={() => {
                    setSelectedBank(item['bank_name']);
                    setIsLoading2(false);
                  }}
                >
                  <Text style={styles.bottomSheetItemText}>
                    {item['bank_name']}
                  </Text>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={{ textAlign: 'center', padding: 20 }}>{translate("No_Banks_Found")}</Text>
            )}
          </ScrollView>
        </View>
      </BottomSheet>
    </KeyboardAwareScrollView>
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    top: hScale(53),
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    marginBottom: 10,
    width: wScale(300),
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bottomSheetContainer: {
    backgroundColor: 'white',
    paddingVertical: 20,
    paddingHorizontal: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  operatornametext: {
    textTransform: "capitalize",
    fontSize: wScale(20),
    color: "#000",
    flex: 1,
    borderBottomColor: "#000",
    borderBottomWidth: wScale(0.5),
    alignSelf: "center",
    paddingVertical: hScale(30),
  },
  operatorview: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: wScale(10),
  },
  button: {
    width: wScale(300),
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bottomSheetItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'lightgray',
  },
  bottomSheetItemText: {
    fontSize: 16,
  },
});

export default AddNewWallet;
