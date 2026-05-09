import React, { useState, useEffect, act } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';
import useAxiosHook from '../../utils/network/AxiosClient';
import { APP_URLS } from '../../utils/network/urls';
import { isEmulator } from 'react-native-device-info';
import { decryptData, encrypt } from '../../utils/encryptionUtils';
import { useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import ShowLoader from '../../components/ShowLoder';

const ReqToAdmin = ({ route }) => {

  const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}20`
  const { type, amount } = route.params
  const [paymentMode1, setPaymentMode1] = useState('');
  const [paymentType1, setPaymentType1] = useState('');
  const [dealerwallet1, setDealerWallet1] = useState('');
  const [transactionn, settransactionn] = useState('');
  const [bank1, setBank1] = useState('');
  const [bank2, setBank2] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [bankModalVisible, setBankModalVisible] = useState(false);
  const [bankModalVisible2, setBankModalVisible2] = useState(false);
  const [bankModalVisible3, setBankModalVisible3] = useState(false);
  const [banks, setBanks] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [isAdmin, setIsAdmin] = useState(type === 'Admin');
  const [loading, setLoading] = useState(false);
  const [collectionBy, setCollectionBy] = useState('');
  const [comment, setComment] = useState('')
  const [AccountNo, setAccountNo] = useState('');
  const [utr, setUtrNo] = useState('');
  const [Deposit, setDeposit] = useState('');
  const { post, get } = useAxiosHook();
  const [walletn, setWalletn] = useState('');
  const [walletname, setWalletname] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const paymentModedialog = () => {
    setModalVisible(true);
  };

  const bankDialog = () => {
    setBankModalVisible(true);
  };

  const bankDialog2 = () => {
    setBankModalVisible2(true);
  };
  const bankDialog3 = () => {
    setBankModalVisible3(true);
  };
  const [isLoad, setIsload] = useState(false)
  const fetchBanks = async () => {

    setIsload(true)
    try {
      setLoading(true);
      const url = `${APP_URLS.admindealerbankList}`;

      const url2 = `${APP_URLS.AdminMasterBankList}`;
      const response = await get({ url: IsDealer ? url2 : url });

      console.log(IsDealer ? url2 : url);
      // console.log(response.bindALLWallet.channel.Adminbanklist, '*******************');
      // console.log(response.bindALLWallet.channel.Adminwalletlist, '*******************');
      setBanks(isAdmin ? (IsDealer ? response.adminbankllist : response.bindALLWallet.channel.Adminbanklist) : (IsDealer ? response.masterbanklistss : response.bindALLWallet.channel.dealerbanklist));
      setWallets(isAdmin ? (IsDealer ? response.adminwalletlist : response.bindALLWallet.channel.Adminwalletlist) : (IsDealer ? response.masterwalletlist : response.bindALLWallet.channel.DealerWalletlist));
    } catch (error) {
      setIsload(false)

      console.error('Error fetching banks:', error);
    } finally {
      setIsload(false)

      setLoading(false);
    }
  };
  const clearAllFields = () => {
    setPaymentMode1('');
    setPaymentType1('');
    setDealerWallet1('');
    settransactionn('');
    setBank1('');
    setBank2('');
    setModalVisible(false);
    setBankModalVisible(false);
    setBankModalVisible2(false);
    setBankModalVisible3(false);
    setBanks([]);
    setWallets([]);
    setIsAdmin(type === 'Admin'); // assuming 'type' is still accessible
    setLoading(false);
    setCollectionBy('');
    setComment('');
    setAccountNo('');
    setUtrNo('');
    setDeposit('');
    setWalletn('');
    setWalletname('');
    setIsLoading(false);
  };
  
  useEffect(() => {
    fetchBanks();
    console.log(isAdmin)
  }, []);

  const PaymentTypeDialog = ({ visible, onClose }) => {
    const paymentMode1 = [
      "Cash", "Credit", "Branch/Cms Deposit", "Online Transfer", "Wallet"
    ];
    const handlePaymentTypeSelect = (paymentType) => {

      console.log('handlePaymentTypeSelect', paymentType)
      setPaymentType1(paymentType);
      onClose();
    };

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Payment Type</Text>
            <FlatList
              data={paymentMode1}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.paymentTypeItem}
                  onPress={() => handlePaymentTypeSelect(item)}
                >
                  <Text style={styles.paymentTypeText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    );
  };
  const BankDialog2 = ({ visible, onClose }) => {
    const handleBankSelect = (bank) => {
      console.log(bank.acno, '*****');
      setBank2(bank.banknm);
      onClose();
    };

    const paymentTypes = [
      { banknm: 'NEFT', acno: '12345' },
      { banknm: 'IMPS', acno: '67890' },
      { banknm: 'RTGS', acno: '11223' },
      { banknm: 'UPI', acno: '44556' },
      { banknm: 'Same Bank', acno: '78901' }
    ];

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Type</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <FlatList
                data={paymentTypes}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.paymentTypeItem}
                    onPress={() => handleBankSelect(item)}
                  >
                    <Text style={styles.paymentTypeText}>{item.banknm}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const BankDialog = ({ visible, onClose }) => {
    const handleBankSelect = (bank) => {
      setBank1(bank.banknm);
      console.log(bank.acno, '*****')
      setAccountNo(bank.acno);
      onClose();
    };

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{'Select Bank'}</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <FlatList
                data={banks}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.paymentTypeItem}
                    onPress={() => handleBankSelect(item)}
                  >
                    <Text style={styles.paymentTypeText}>{item.banknm}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const WalletDialog = ({ visible, onClose }) => {
    const handleBankSelect = (bank) => {
      console.log(bank)
      // walletno ,walletname
      setWalletn(bank.walletno);
      setWalletname(bank.walletname);


      onClose();
    };

    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{'Select Wallet'}</Text>
            {loading ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <FlatList
                data={wallets}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.paymentTypeItem}
                    onPress={() => handleBankSelect(item)}
                  >
                    <Text style={styles.paymentTypeText}>{item.walletname}</Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const transfer = () => {
    setIsload(true)
    setIsLoading(true);

    switch (paymentType1) {
      case 'Cash':
      case 'Credit':
        console.log("transfer***0000", paymentType1);

        submittxn();
        break;

      case 'Branch/Cms Deposit':
        submittxnBRANCH();
        break;
      case 'Online Transfer':
        submittxnONLINE()
        break;
      case 'Wallet':
        console.log("transfer***123", paymentType1);

        submittxnWALLET();
        break;


      default:
        console.log('Invalid payment mode');
        break;
    }
  };
  const submittxn = async () => {
    if (!amount || !paymentType1 || !comment) {
      alert('Please fill in all required fields.');
      setIsload(false)
      setIsLoading(false)
      return;
    }

    const encryption = await encrypt([paymentType1, collectionBy, comment, IsDealer ? 'Dealer' : 'Retailer', type]);


    const data = {
      "payto": encryption.encryptedData[4],
      "hdPaymentMode": encryption.encryptedData[0],
      "hdPaymentAmount": amount,
      "hdMDDepositeSlipNo": '',
      "hdMDTransferType": '',
      "hdMDcollection": encryption.encryptedData[1],
      "hdMDComments": encryption.encryptedData[2],
      "hdMDBank": bank2,
      "hdsupraccno": "",
      "hdMDaccountno": '',
      "hdMDutrno": '',
      "hdMDwallet": '',
      "hdMDwalletno": '',
      "hdMDtransationno": '',
      "hdMDsettelment": "",
      "hdMDCreditDetail": "",
      "hdMDsubject": "",
      "ROLE": encryption.encryptedData[3],
      "value1": encryption.keyEncode || '',
      "value2": encryption.ivEncode || '',
    };

    try {
      const response = await post({
        url: APP_URLS.PurchaseOrder,
        data: data,
      });

      console.log(response, 'Response from server');

      if (response.Response === 'Failed') {
        ToastAndroid.show(response.Message, ToastAndroid.BOTTOM);
        const decryptedData = {
          hdMDDLM: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[0]),
          hdPaymentMode: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[1]),
          hdPaymentAmount: amount,
          hdMDcollection: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[4]),
          hdMDComments: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[5]),
          txtcode: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[2]),
          transferid: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[3]),
        };

        console.log('Decrypted Data:', decryptedData);
        Object.keys(decryptedData).forEach(key => {
          console.log(`${key}: ${decryptedData[key]}`);
        });
      } else {
        ToastAndroid.show(response.Message, ToastAndroid.BOTTOM);
        clearAllFields()

      }
      setIsload(false)
      setIsLoading(false)

    } catch (error) {
      console.error('Error fetching  list:', error);
    }

    console.log(JSON.stringify(data));
  };
  const submittxnBRANCH = async () => {
    if (!amount || !paymentType1 || !bank1 || !AccountNo || !Deposit) {
      console.log(amount, paymentType1, bank1, AccountNo, Deposit)
      alert('Please fill in all required fields.');
      setIsload(false)
      setIsLoading(false)
      return;
    }

    const encryption = encrypt([paymentType1, collectionBy, comment, IsDealer ? 'Dealer' : 'Retailer', type, bank1, AccountNo, Deposit]);


    const data = {
      "payto": encryption.encryptedData[4],
      "hdPaymentMode": encryption.encryptedData[0],
      "hdPaymentAmount": amount,
      "hdMDDepositeSlipNo": encryption.encryptedData[7],
      "hdMDTransferType": '',
      "hdMDcollection": encryption.encryptedData[1],
      "hdMDComments": encryption.encryptedData[2],
      "hdMDBank": encryption.encryptedData[5],
      "hdsupraccno": "",
      "hdMDaccountno": encryption.encryptedData[6],
      "hdMDutrno": '',
      "hdMDwallet": '',
      "hdMDwalletno": '',
      "hdMDtransationno": '',
      "hdMDsettelment": "",
      "hdMDCreditDetail": "",
      "hdMDsubject": "",
      "ROLE": encryption.encryptedData[3],
      "value1": encryption.keyEncode || '',
      "value2": encryption.ivEncode || '',
    };

    try {
      const response = await post({
        url: APP_URLS.PurchaseOrder,
        data: data,
      });

      console.log(response, 'Response from server');

      if (response.Response === 'Failed') {
        ToastAndroid.show(response.Message, ToastAndroid.BOTTOM);
        const decryptedData = {
          hdMDDLM: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[0]),
          hdPaymentMode: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[1]),
          hdPaymentAmount: amount,
          hdMDcollection: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[4]),
          hdMDComments: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[5]),
          txtcode: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[2]),
          transferid: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[3]),
        };

        console.log('Decrypted Data:', decryptedData);
        Object.keys(decryptedData).forEach(key => {
          console.log(`${key}: ${decryptedData[key]}`);
        });
      } else {
        ToastAndroid.show(response.Message, ToastAndroid.BOTTOM);
        clearAllFields()

      }

      setIsload(false)
      setIsLoading(false)

    } catch (error) {
      console.error('Error fetching retailer list:', error);
    }

    console.log(JSON.stringify(data));
  };
  const submittxnONLINE = async () => {
    if (!amount || !paymentType1 || !bank1 || !AccountNo || !bank2 || !utr) {
      //alert('Please fill in all required fields.');
      setIsload(false)
      setIsLoading(false)
      //  return;
    }
    console.log(paymentType1, bank2, bank1)
    console.log([paymentType1, IsDealer ? 'Dealer' : 'Retailer', type, bank1, AccountNo,
      bank2, utr])

    // ["Online Transfer", "Retailer", "Admin", "ICICI", "723005000189", "UPI", ""]
    const encryption = encrypt(
      [
        paymentType1,
        IsDealer ? 'Dealer' : 'Retailer',
        type,
        bank1,
        AccountNo,
        bank2,
        utr
      ]);



    const data = {
      "payto": encryption.encryptedData[2],
      "hdPaymentMode": encryption.encryptedData[0],
      "hdPaymentAmount": amount,
      "hdMDTransferType": encryption.encryptedData[5],
      "hdMDBank": encryption.encryptedData[3],
      "hdMDaccountno": encryption.encryptedData[4],
      "hdMDutrno": encryption.encryptedData[6],
      "ROLE": encryption.encryptedData[1],
      "value1": encryption.keyEncode || '',
      "value2": encryption.ivEncode || '',
    };

    try {
      const response = await post({
        url: APP_URLS.PurchaseOrder,
        data: data,
      });
      console.log(data, '*********************')
      console.log(response, 'Response from server');

      if (response.Response === 'Failed') {
        ToastAndroid.show(response.Message, ToastAndroid.BOTTOM);
        const decryptedData = {
          hdMDDLM: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[0]),
          hdPaymentMode: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[1]),
          hdPaymentAmount: amount,
          hdMDcollection: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[4]),
          hdMDComments: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[5]),
          txtcode: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[2]),
          transferid: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[3]),
        };

        console.log('Decrypted Data:', decryptedData);
        Object.keys(decryptedData).forEach(key => {
          console.log(`${key}: ${decryptedData[key]}`);
        });
      } else {
        ToastAndroid.show(response.Message, ToastAndroid.BOTTOM);
        clearAllFields()

      }

      setIsload(false)
      setIsLoading(false)

    } catch (error) {
      console.error('Error fetching retailer list:', error);
    }

    console.log(JSON.stringify(data));
  };
  const submittxnWALLET = async () => {
    console.log(paymentType1);

    if (!amount || !paymentType1 || !walletname || !transactionn) {
      alert('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    const encryption = encrypt([paymentType1, collectionBy, comment, IsDealer ? 'Dealer' : 'Retailer', type, bank1, AccountNo, bank2, transactionn, walletname, walletn]);

    const data = {
      "payto": encryption.encryptedData[4],
      "hdPaymentMode": encryption.encryptedData[0],
      "hdPaymentAmount": amount,
      "hdMDDepositeSlipNo": '',
      "hdMDTransferType": encryption.encryptedData[7],
      "hdMDcollection": encryption.encryptedData[1],
      "hdMDComments": encryption.encryptedData[2],
      "hdMDBank": '',
      "hdsupraccno": "",
      "hdMDaccountno": encryption.encryptedData[6],
      "hdMDutrno": '',
      "hdMDwallet": encryption.encryptedData[9],
      "hdMDwalletno": encryption.encryptedData[10],
      "hdMDtransationno": encryption.encryptedData[8],
      "hdMDsettelment": "",
      "hdMDCreditDetail": "",
      "hdMDsubject": "",
      "ROLE": encryption.encryptedData[3],
      "value1": encryption.keyEncode || '',
      "value2": encryption.ivEncode || '',
    };

    try {
      const response = await post({
        url: APP_URLS.PurchaseOrder,
        data: data,
      });

      console.log(response, 'Response from server');

      if (response.Response === 'Failed') {
        ToastAndroid.show(response.Message, ToastAndroid.BOTTOM);

        const decryptedData = {
          hdPaymentMode: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[0]),
          hdPaymentAmount: amount,
          hdMDcollection: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[1]),
          hdMDComments: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[2]),
          transferid: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[3]),
          hdMDBank: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[5]),
          hdMDaccountno: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[6]),
          hdMDTransferType: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[7]),
          hdMDwallet: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[9]),
          hdMDwalletno: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[10]),
          hdMDtransationno: decryptData(encryption.keyEncode, encryption.ivEncode, encryption.encryptedData[8]),
        };

        console.log('Decrypted Data:', decryptedData);
        Object.keys(decryptedData).forEach(key => {
          console.log(`${key}: ${decryptedData[key]}`);
        });
      } else {
        ToastAndroid.show(response.Message, ToastAndroid.BOTTOM);
        clearAllFields()

      }
      setIsload(false)

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching retailer list:', error);
      setIsLoading(false);
      setIsload(false)

    }

    console.log(JSON.stringify(data));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.contentContainer}>
          <Text style={styles.title}>Request to {type} : ₹ {amount}
          </Text>

          <TouchableOpacity style={styles.selectionButton} onPress={paymentModedialog}>
            <Text style={styles.selectionButtonText}>{paymentMode1 || 'Select Payment Mode'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.selectionButton} onPress={paymentModedialog}>
            <Text style={styles.selectionButtonText}>{paymentType1 || 'Select Payment Type'}</Text>
          </TouchableOpacity>


          {
            paymentType1 === 'Online Transfer' && <TouchableOpacity style={styles.selectionButton} onPress={bankDialog2}>
              <Text style={styles.selectionButtonText}>{bank2 || 'Select  Pay Type'}</Text>
            </TouchableOpacity>}
          {
            (paymentType1 === 'Branch/Cms Deposit' || paymentType1 === 'Online Transfer') && <TouchableOpacity style={styles.selectionButton} onPress={bankDialog}>
              <Text style={styles.selectionButtonText}>{bank1 || 'Select Bank'}</Text>
            </TouchableOpacity>}

          {
            (paymentType1 === 'Wallet') && <TouchableOpacity style={styles.selectionButton} onPress={bankDialog3}>
              <Text style={styles.selectionButtonText}>{walletname || 'Select Wallet'}</Text>
            </TouchableOpacity>}
          {(paymentType1 === 'Branch/Cms Deposit' || paymentType1 === 'Online Transfer') && (
            <>
              <TextInput
                style={styles.input}
                placeholder="Account No"
                onChangeText={setAccountNo}
                editable={false}
                value={AccountNo}
              />

            </>

          )}


          {(paymentType1 === 'Branch/Cms Deposit') && (
            <TextInput
              style={styles.input}
              placeholder="Deposit Slip No"
              onChangeText={setDeposit}
              editable={true}
              value={Deposit}
            />
          )}
          {(paymentType1 === 'Online Transfer') && (
            <TextInput
              style={styles.input}
              placeholder="Utr No"
              onChangeText={setUtrNo}
              value={utr}
            />
          )}
          {isLoad && <ShowLoader />}


          <PaymentTypeDialog
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
          />

          <BankDialog
            visible={bankModalVisible}
            onClose={() => setBankModalVisible(false)}
          />

          <BankDialog2
            visible={bankModalVisible2}
            onClose={() => setBankModalVisible2(false)}
          />

          <WalletDialog
            visible={bankModalVisible3}
            onClose={() => setBankModalVisible3(false)}
          />

          {paymentType1 == 'Wallet' && <TextInput
            style={styles.input}
            placeholder="Transaction no"
            onChangeText={settransactionn}
            value={transactionn}
          />}

          {(paymentType1 === 'Cash' || paymentType1 === 'Credit' || paymentType1 === 'Credit' || paymentType1 === 'Wallet') && (
            <TextInput
              style={styles.input}
              placeholder="Comment"
              onChangeText={setComment}
              value={comment}
            />
          )}

          {(paymentType1 === 'Cash' || paymentType1 === 'Credit') && <TextInput
            style={styles.input}
            placeholder="Collection by"
            onChangeText={setCollectionBy}
            value={collectionBy}
          />}

          <TouchableOpacity style={styles.submitButton} onPress={() => { transfer() }}>
            {isLoading ? <ActivityIndicator /> : <Text style={styles.submitButtonText}>Submit</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  scrollView: {
    flexGrow: 1,
    marginHorizontal: 20,
    paddingVertical: 20,
  },
  contentContainer: {
    alignItems: 'center',
  },
  title: {
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  input: {
    height: 50,
    width: '90%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  selectionButton: {
    height: 50,
    width: '90%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  selectionButtonText: {
    color: '#333',
    fontSize: 16,
  },
  submitButton: {
    height: 50,
    width: '90%',
    backgroundColor: '#28a745',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    width: '80%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  paymentTypeItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
    alignItems: 'center',
  },
  paymentTypeText: {
    fontSize: 16,
    color: '#333',
  },
});

export default ReqToAdmin;
