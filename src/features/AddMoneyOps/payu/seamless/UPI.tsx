import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert, TouchableOpacity, FlatList, ToastAndroid } from 'react-native';
import { FlashList } from '@shopify/flash-list'; // Import FlashList
import { getHash } from '../utils';
import { commonPaymentParam, getPaymentHash, getVPAHash, displayAlert } from '../utils';
import PayUUPI from 'payu-upi-react';
import useAxiosHook from '../../../../utils/network/AxiosClient';
import AppBarSecond from '../../../drawer/headerAppbar/AppBarSecond';
import { RootState } from '../../../reduxUtils/store';
import { useSelector } from 'react-redux';
import { useNavigation } from '../../../../utils/navigation/NavigationService';
import { onReceiveNotification2 } from '../../../../utils/NotificationService';

const UPI = (routeData, props) => {
  const { colorConfig } = useSelector((status: RootState) => status.userInfo);
  const { txnId } = routeData.route.params;
  const { get, post } = useAxiosHook();
  const navigation = useNavigation<any>();
  const [vpa, setVpa] = useState('');
  const [applist, setApplist] = useState([]);
  const [response, setResponse] = useState({});
  let route = routeData;
  if (routeData.route !== undefined && routeData.route.params !== undefined) {
    route = routeData.route.params;
  }

  console.log("navigation====>" + JSON.stringify(route));

  const initiatePayment = (mode, packageName = "null") => {
    var commonParams = commonPaymentParam(route);
    commonParams["hashes"]["payment"] = getPaymentHash(commonParams, route.salt);
    commonParams["payment_mode"] = mode;
    if (mode === "upi") {
      commonParams["vpa"] = vpa;
    }

    if (packageName !== "null") {
      commonParams["package_name"] = packageName;
      commonParams["intent_app"] = "gpay";
    }

    const requestData = {
      payu_payment_params: commonParams,
    };

    console.log(requestData);

    PayUUPI.makeUPIPayment(
      requestData,
      (error) => {
        console.log("-----------Error " + mode + "---------");
        console.log(error);


      },
      async (results) => {
        console.log("----------------sendResponse--------------------------");
        //print
        // setResponse(results)
        const parsed = JSON.parse(results)
        const result = parsed.result;

        console.log(parsed, '++++++++++++++++++')

        // const Response = {
        //   mode: result.mode,
        //   status: result.status,
        //   txnid: txnId,
        //   PG_TYPE: result.PG_TYPE,
        //   error_Message: result.error_Message,
        //   amount: result.amount,
        //   bankcode: result.bankcode,
        //   mihpayid: result.mihpayid,
        //   bank_ref_num: result.bank_ref_num,
        // }

        const Response =
        {
          "Response": {
            'result': {
              "PG_TYPE": result.PG_TYPE,
              "amount": result.amount,
              "bank_ref_num": result.bank_ref_num,
              "bankcode": result.bankcode,
              "error_Message": result.error_Message, "mihpayid": result.mihpayid,
              "mode": "UPI", "status": result.status,
              "txnid": txnId
            }
          }
        }

        console.log(Response, '++++++++++++++++++')
        try {
          const response = await post({
            url: 'PaymentGateway/api/data/Gatewayresponse',
            //  data: {'Response':parsed},

            data: Response
          });

          if (response.Response == 'success') {
            Alert.alert(
              response.Response, // First parameter: Title of the alert
              response.Message,  // Second parameter: Message in the alert
              [
                {
                  text: 'Go to Dashboard',
                  onPress: () => {
                    // Navigate to the "Dashboard" screen when the button is pressed
                    navigation.navigate('Dashboard'); // Make sure 'Dashboard' is the correct screen name
                  },
                },
                {
                  text: 'Cancel',
                  onPress: () => console.log('Cancel Pressed'),
                  style: 'cancel',
                },
              ]
            );


            const mockNotification = {
              notification: {
                title: response.Response || '',
                body: response.Message || '',

              },
            };

            onReceiveNotification2(mockNotification);
          } else {

            ToastAndroid.show(response.Message || 'Failed', ToastAndroid.SHORT)
            navigation.navigate({ name: 'Dashboard' });
          }
          console.log('Success:', response);
        } catch (error) {
          console.error('Error during async operation:', error);
          Alert.alert('Error', 'An error occurred while processing the request.');
        }


        const modifiedData = { ...results, txnid: txnId };


      }
    );
  };

  const validateVPA = () => {
    console.log('Button Tapped validate VPA');

    var commonParams = commonPaymentParam(route);
    commonParams["vpa"] = vpa;
    commonParams["hashes"]["payment"] = getPaymentHash(commonParams, route.salt);
    commonParams["hashes"]["validate_vpa"] = getVPAHash(commonParams, route.salt);
    const requestData = {
      payu_payment_params: commonParams,
    };
    PayUUPI.validateVPA(
      requestData,
      (error) => {
        console.log("-----------Error validateVPA---------");
        console.log(error);
        displayAlert('Error validateVPA', error);
      },
      (params) => {
        console.log("-----------Success validateVPA---------");
        console.log(params);

        const Response = JSON.parse(params);
        Alert.alert(
          "validateVPA", // Title of the alert
          `Status: ${Response.status || 'N/A'}\n` +
          `VPA: ${Response.vpa || 'N/A'}\n` +
          `Is VPA Valid: ${Response.isVPAValid ? 'Yes' : 'No'}\n` +
          `Payer Name: ${Response.payerAccountName || 'N/A'}\n`,
          [{ text: 'OK' }]
        );
      }
    );
  };

  const intentApps = () => {
    console.log('Button Tapped IntentApps');
    PayUUPI.intentApps((intentApps) => {
      setApplist(intentApps);
      // console.log("Intent Apps: ", JSON.stringify(intentApps));
    });
  };

  useEffect(() => {
    console.log(txnId);
    intentApps();
    //  sendResponse('')
  }, []);


  const print = () => {
    console.log(response)
  }

  const daaa = { "result": { "mihpayid": 22396456698, "mode": "UPI", "status": "success", "key": "TyfBJu", "txnid": "1738842938994", "amount": "1.00", "addedon": "2025-02-06 17:25:39", "productinfo": "Mobile Phone", "firstname": "Kartick Sheel", "lastname": "", "address1": "", "address2": "", "city": "", "state": "", "country": "", "zipcode": "", "email": "kartick.drishti2019@gmail.com", "phone": "8918620113", "udf1": "udf1", "udf2": "udf2", "udf3": "udf3", "udf4": "udf4", "udf5": "udf5", "udf6": "", "udf7": "", "udf8": "", "udf9": "", "udf10": "", "card_token": "", "card_no": "", "field0": "", "field1": "", "field2": "980295", "field3": "9370521211@ybl", "field4": "", "field5": "rechargedrishti.payu@indus", "field6": "PPPL2239645669806022517254067a4a33c", "field7": "APPROVED OR COMPLETED SUCCESSFULLY|00", "field8": "phonepe", "field9": "Success|Completed Using Callback", "payment_source": "payuPureS2S", "PG_TYPE": "UPI-PG", "error": "E000", "error_Message": "No Error", "net_amount_debit": 1, "discount": "0.00", "offer_key": null, "offer_availed": null, "unmappedstatus": "captured", "hash": "95757903b94f9a77fc3d103d3c658d460165c1e24e0154a2ccc5ea15ecd1a84e1fef4cbbff145a2d1a23c10d3396901b25da7e39ff099aefdf997fc66d433daf", "bank_ref_no": "668870039857", "bank_ref_num": "668870039857", "bankcode": "INTENT", "surl": "https:\/\/www.rechargedrishti.com\/Response\/GatewayResponse", "curl": "instamoney.net.in\/", "furl": "instamoney.net.in\/" }, "status": "success" }
  const sendResponse = async () => {



    console.log('Received data:', response); // Check the complete data object
    console.log('Received result:', response); // Check just the result part

    if (!data['result']) {
      console.error('Invalid data received:', data);
      Alert.alert('Error', 'Invalid response from server.');
      return;
    }

    const results = data.result;


    const data1 = {
      mode: results.mode,
      status: results.status,
      txnid: txnId,
      PG_TYPE: results.PG_TYPE,
      error_Message: results.error_Message,
      amount: results.amount,
      bankcode: results.bankcode,
      mihpayid: results.mihpayid,
      bank_ref_num: results.bank_ref_num,
    };

    console.log(data1);

    try {
      const response = await post({
        url: 'PaymentGateway/api/data/Gatewayresponse',
        data: data1,
      });
      console.log('Success:', response);
    } catch (error) {
      console.error('Error during async operation:', error);
      Alert.alert('Error', 'An error occurred while processing the request.');
    }
  };




  const renderItem = ({ item }) => (
    <View style={styles.walletItem}>
      <Text style={styles.walletText}>{item.title}</Text>
    </View>
  );



  return (
    <View>
      <AppBarSecond title={'UPI APPS     '} />
      <View style={styles.container}>
        {applist && <FlatList
          data={applist}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.walletItem, { backgroundColor: colorConfig.secondaryColor }]}
              onPress={() => initiatePayment('INTENT', item.value)}
            >
              <View style={styles.item}>

                <View style={styles.icon}>
                  <Text style={styles.iconText}>{item.title[0]}</Text>
                </View>
                <Text style={styles.title}>{item.title}</Text>
              </View>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.value}
          estimatedItemSize={60}
        />}

       
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  textinput: {
    borderRadius: 10,
    height: 40,
    padding: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  title: {
    paddingBottom: 16,
    fontSize: 20,
    marginTop: 20,
  },
  walletItem: {
    paddingHorizontal: 4,
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 6,
    marginTop: 1,
  },
  walletText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginVertical: 5,
    padding: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#cccccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconText: {
    color: '#fff',
    fontSize: 20,
  },
  title: {
    fontSize: 16,
    color: '#333',
  },
});

export default UPI;
