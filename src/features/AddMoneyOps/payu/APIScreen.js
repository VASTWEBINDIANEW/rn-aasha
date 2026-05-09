/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  NativeModules,
  NativeEventEmitter,
  Platform
} from 'react-native';
import moment from 'moment'
import CryptoJS from "crypto-js";
import { JSHmac, CONSTANTS } from "react-native-hash";
import {
  API_GET_EMI_AMOUNT_ACCORDING_INTEREST,
  CHECK_IS_DOMESTIC,
  CHECK_OFFER_DETAILS,
  CHECK_OFFER_STATUS,
  DEFAULT,
  getLookupHash,
  getWebHash,
  getUserCardHash,
  GET_BIN_INFO,
  GET_CHECKOUT_DETAILS,
  GET_TRANSACTION_INFO,
  PAYMENT_RELATED_DETAILS_FOR_MOBILE_SDK,
  VAS_FOR_MOBILE_SDK,
  VERIFY_PAYMENT,
  CHECK_BALANCE,
  GET_CONFIG,
  ELIGIBLE_BINS_FOR_EMI,
  DELETE_TOKENISED_USER_CARD,
  GET_TOKENISED_CARD_DETAILS,
  GET_TOKENISED_USER_CARD,
  GET_MERCHANT_IBIBO_CODES,
  getEMIDetailHash,
  getCheckIsDomesticHash,
  getBinInfoHash,
  getGetTransactionInfoHash,
  getCheckoutDetailsHash,
  getOfferHash,
  getVerifyHash,
  getVasHash,
  getCheckBalanceHash,
  getConfigHash,
  getEligibleBinsForEmiHash,
  getDeleteTokenisedUserCardHash,
  getTokenisedUserCardHash,
  getTokenisedCardDetailsHash,
  getIbiboCodesHash,
  fetchOfferDetailsHash,
  validateOfferDetailsHash,
  fetchAdsInformationHash,
  saveEventImpressionHash,
GET_USER_CARDS } from './utils';

const { PayUSdk } = NativeModules;

const APIScreen = ({ route }) => {
  const [jsonTextInputValue,
    setJsonTextInputValue] = useState('');
  let onApiCall = async (feature) => {
    let { merchantKey, salt, isSandbox, userCredentials, environment } = route.params;
    let requestData = {
      key: merchantKey,
      salt,
      environment,
    };
    setJsonTextInputValue('');
    try {

      if (feature === 'payment_options') {
       
        requestData = {
          ...requestData,
          key : "ol4Spy",
          salt : "J0ZXw2z9",
          var1 : "rahul:hooda",//User Credential  
          command: PAYMENT_RELATED_DETAILS_FOR_MOBILE_SDK,
        }
        
        
        const options = await PayUSdk.fetchPaymentOptions({
          ...requestData,
          hash: getWebHash(requestData)
        });
  
        setJsonTextInputValue(JSON.stringify(options));
    
      } else  if (feature === 'get_user_cards') {
       
        requestData = {
          ...requestData,
          userCredentials: userCredentials,
          command: GET_USER_CARDS,
        }
        
        
        const options = await PayUSdk.getUserCards({
          ...requestData,
          hash: getUserCardHash(requestData)
        });
  
        setJsonTextInputValue(JSON.stringify(options));
    
      } 
      else if (feature === 'vas') {

        requestData = {
          ...requestData,
          var1: 'default',
          command: VAS_FOR_MOBILE_SDK,
        }

        const response = await PayUSdk.vas({
          ...requestData,
          hash: getVasHash(requestData)
        });

        setJsonTextInputValue(JSON.stringify(response));
        console.log(response);
      } else if (feature === 'check_is_domestic') {

        requestData = {
          ...requestData,
          cardNumber: '622018',
          command: CHECK_IS_DOMESTIC
        }
        const response = await PayUSdk.checkIsDomestic({
          ...requestData,
          hash: getCheckIsDomesticHash(requestData)
        });
        setJsonTextInputValue(JSON.stringify(response));

      } else if (feature === 'get_bin_info') {
        requestData = {
          ...requestData,
          isSIInfo: '1',
          cardNumber: '555676',
          command: GET_BIN_INFO
        }

        const response = await PayUSdk.getBinInfo({
          ...requestData,
          hash: getBinInfoHash(requestData)
        });

        setJsonTextInputValue(JSON.stringify(response));

      } else if (feature === 'get_transaction_info') {

        let startTime = new Date();
        startTime.setTime(startTime.getTime() - 2 * 24 * 60 * 60 * 1000);
        let endTime = new Date();

        requestData = {
          ...requestData,
          startTime: moment(startTime).format('YYYY-MM-DD HH:mm:ss'),
          endTime: moment(endTime).format('YYYY-MM-DD HH:mm:ss'),
          command: GET_TRANSACTION_INFO
        }

        const response = await PayUSdk.getTransactionInfo({
          ...requestData,
          hash: getGetTransactionInfoHash(requestData)
        });

        setJsonTextInputValue(JSON.stringify(response));


      } else if (feature === 'get_emi_details') {

        requestData = {
          ...requestData,
          amount: '2000',
          command: API_GET_EMI_AMOUNT_ACCORDING_INTEREST
        }
        const response = await PayUSdk.getEMIDetails({
          ...requestData,
          hash: getEMIDetailHash(requestData)
        });

        setJsonTextInputValue(JSON.stringify(response));

      } else if (feature === 'get_checkout_details') {

        requestData = {
          ...requestData,
          var1: JSON.stringify({"useCase":
          {"getExtendedPaymentDetails":true,
          "getTaxSpecification":true,
          "checkDownStatus":true,
          "getAdditionalCharges":true,
          "getOfferDetails":true,
          "getPgIdForEachOption":true,
          "checkCustomerEligibility":true,
          "getMerchantDetails":true,
          "getPaymentDetailsWithExtraFields":true,
          "getSdkDetails":true},
          "requestId":"211219214632",
          "customerDetails":{"mobile":"9876543210"},
          "transactionDetails":{"amount":"1"}
        }),
          command: GET_CHECKOUT_DETAILS
        }
        const response = await PayUSdk.getCheckoutDetails({
          ...requestData,
          hash: getCheckoutDetailsHash(requestData)
        });
        setJsonTextInputValue(JSON.stringify(response));

      } else if (feature === 'check_offer_detail') {

          // requestData = {
          //     ...requestData,
          //     offerKey: 'cardOfferKey@8643',
          //     cardNumber: "5123456789012346",
          //     paymentType: 'Credit / Debit Cards',
          //     amount: '5000',
          //     command: CHECK_OFFER_DETAILS
          // }

          requestData = {
                  ...requestData,
                  offerKey: 'cardOfferKey@8643',
                  cardToken: "111bce624e01fb4fde3ea2",
                  userCredentials:userCredentials,
                  paymentType: 'Saved Cards',
                  amount: '5000',
                  command: CHECK_OFFER_DETAILS
          }

// only android has
// main net bankig

          // requestData = {
          //   ...requestData,
          //   offerKey: 'cashBackccdcnb@8651',
          //   bankCode: "AXIB",
          //   paymentType: 'NB',
          //   amount: '5000',
          //   command: CHECK_OFFER_DETAILS
          // }

//
//

          // requestData = {
          //   ...requestData,
          //   offerKey: '@7283',
          //   bankCode: "643567vbhbvgh5678gvv77b",
          //   paymentType: 'Net Banking',
          //   command: CHECK_OFFER_DETAILS
          // }

        // ------
        const response = await PayUSdk.checkOfferDetails({
          ...requestData,
          hash: getOfferHash(requestData)
        });

        setJsonTextInputValue(JSON.stringify(response));

      } else if (feature === 'verify_payment') {

        requestData = {
          ...requestData,
          txnId: '1628684808250payusdk',
          command: VERIFY_PAYMENT
        }
        const response = await PayUSdk.verifyPayment({
          ...requestData,
          hash: getVerifyHash(requestData)
        });
        setJsonTextInputValue(JSON.stringify(response));

      } else if (feature === 'check_offer_status') {

        // requestData = {
        //   ...requestData,
        //   offerKey: 'cardOfferKey@8643',
        //   amount: '5000',
        //   var3: 'CC',
        //   var4: 'CC',
        //   var5: '5123456789012346',
        //   hash: getWebHash(requestData),
        //   command: CHECK_OFFER_STATUS
        // }

            requestData = {
              ...requestData,
              offerKey: 'cardOfferKey@8643',
              amount: '5000',
              cardNumber: "5123456789012346",
              paymentType: 'CC',
              command: CHECK_OFFER_STATUS
            }
        

      //  } else if(2) {
      //    requestData = {
      //      ...requestData,
      //        amount: 5000,
      //        offerKey: '@7283',
      //      cardToken: "643567vbhbvgh5678gvv77b",
      //      paymentType: 'Saved Cards',
      //      command: CHECK_OFFER_STATUS
      //    }
      //  } else {
      //      requestData = {
      //        ...requestData,
      //        amount: 5000,
      //        offerKey: '@7283',
      //        bankCode: "643567vbhbvgh5678gvv77b",
      //        paymentType: 'Net Banking',
      //        command: CHECK_OFFER_STATUS
      //      }
      //  }

        const response = await PayUSdk.getOfferStatus({
          ...requestData,
          hash: getOfferHash(requestData)
        });

        setJsonTextInputValue(JSON.stringify(response));

      } else if (feature === 'lookup_api') {
        const merchantOrderId = "OBE-JU89-13151-11009002";
        const currency = "INR";
        const baseAmount = "10000"


        const lookupRequestData = {
          "merchantAccessKey": "E5ABOXOWAAZNXB6JEF5Z",
          "baseAmount": {
            "value": baseAmount,
            "currency": currency
          },
          // "cardBin":"513382", // Need cardbin for DCC product
          "merchantOrderId": merchantOrderId,
          "productType": "MCP" // Use product DCC or MCP
        }
        const lookupHash = "61335dc17e4f678ab03a9380b6ce0bcb363bb672"
        //  getLookupHash("e425e539233044146a2d185a346978794afd7c66", `${currency}${merchantOrderId}${baseAmount}`)

        const response = await PayUSdk.lookupAPI({
          ...requestData,
          var1: JSON.stringify({
            ...lookupRequestData,
            signature: lookupHash
          }),
          hash: lookupHash
        });
        setJsonTextInputValue(JSON.stringify(response));

      } else if (feature === 'check_balance') {
        requestData = {
          ...requestData,
          var1 : "{\"sodexoSourceId\":\"src_5521693f-56b6-4102-8af7-cf716610f04a\"}",
          command: CHECK_BALANCE
        }

        const response = await PayUSdk.checkBalance({
          ...requestData,
          hash: getCheckBalanceHash(requestData)
        });

        setJsonTextInputValue(JSON.stringify(response));

      } else if (feature === 'get_config') {
        requestData = {
          ...requestData,
          var1 : "GET",
          command: GET_CONFIG
        }

        const response = await PayUSdk.getConfig({
          ...requestData,
          hash: getConfigHash(requestData)
        });

        setJsonTextInputValue(JSON.stringify(response));

      } else if (feature === 'eligible_bins_for_emi') {
        requestData = {
          ...requestData,
          var1 : "default",
          command: ELIGIBLE_BINS_FOR_EMI
        }

        const response = await PayUSdk.eligibleBinsForEmi({
          ...requestData,
          hash: getEligibleBinsForEmiHash(requestData)
        });

        setJsonTextInputValue(JSON.stringify(response));

      } else if (feature === 'delete_tokenised_user_card') {
        requestData = {
          ...requestData,
          var1 : "rahul:hooda",// User Credential
          var2 : "d3cef31e3c9713111b23",// Card Token
          var3 : "",// Network token
          var4 : "",// Issuer Token
          command : "delete_payment_instrument",
          command: DELETE_TOKENISED_USER_CARD
        }

        const response = await PayUSdk.deleteTokenisedCard({
          ...requestData,
          hash: getDeleteTokenisedUserCardHash(requestData)
        });

        setJsonTextInputValue(JSON.stringify(response));

      } else if (feature === 'get_tokenised_card') {
        requestData = {
          ...requestData,
          var1 : "rahul:hooda", //User Credential
          command: GET_TOKENISED_USER_CARD
        }

        const response = await PayUSdk.getTokenisedCard({
          ...requestData,
          hash: getTokenisedUserCardHash(requestData)
        });

        setJsonTextInputValue(JSON.stringify(response));

      } else if (feature === 'get_tokenised_card_details') {
        requestData = {
          ...requestData,
          var1 : "rahul:hooda",//User Credential
          var2 : "22984b5e08575d2b2a40c8",//Card Token
          var3 : "100",//Amount
          var4 : "INR",//INR
          command: GET_TOKENISED_CARD_DETAILS
        }

        const response = await PayUSdk.getTokenisedCardDetails({
          ...requestData,
          hash: getTokenisedCardDetailsHash(requestData)
        });

        setJsonTextInputValue(JSON.stringify(response));

      } else if (feature === 'get_ibibo_codes') {
        requestData = {
          ...requestData,
          var1 : "default",
          command: GET_MERCHANT_IBIBO_CODES
        }

        const response = await PayUSdk.getIbiboCodes({
          ...requestData,
          hash: getIbiboCodesHash(requestData)
        });

        setJsonTextInputValue(JSON.stringify(response));

      } else if (feature === 'fetch_ifsc_details') {
        requestData = {
          ...requestData,
          var1:"PUNB0387200"
        }

        const response = await PayUSdk.fetchIFSCDetails({
          ...requestData,
        });

        setJsonTextInputValue(JSON.stringify(response));

      } else if (feature === 'fetch_offer_details') {
        const response = await PayUSdk.fetchOfferDetails({
          ...requestData,
          amount : "1000",
          userToken : "anshul_bajpai_token",
          command : "get_all_offer_details"
        });

        setJsonTextInputValue(JSON.stringify(response));

      } else if (feature === 'validate_offer_details') {
        const response = await PayUSdk.validateOfferDetails({
          ...requestData,
          command : "validate_offer_details",
          amount : "1000",
          clientId : "",
          offerKey : ["3B7aAL1X37fD"],
          paymentDetail: {
            cardNumber: "",
            cardHash: "",
            cardMask: "",
            category: "NETBANKING",
            paymentCode: "PNBB",
            vpa: ""
          },
          paymentId: "",
          platformId: "",
          userDetail: {
            email : "snooze@payu.in",
            phoneNo : "9999999999", 
            userToken : "anshul_bajpai_token" 
          }
        });

        setJsonTextInputValue(JSON.stringify(response));

      } else if (feature === 'get_ads_details') {
        requestData = {
          ...requestData
        }

        const response = await PayUSdk.fetchAdsInformation({
          ...requestData,
          hash: fetchAdsInformationHash(requestData)
        });

        setJsonTextInputValue(JSON.stringify(response));

      } else if (feature === 'post_add_impression_event') {
        requestData = {
          ...requestData
        }

        const response = await PayUSdk.saveEventImpression({
          ...requestData,
          hash: saveEventImpressionHash(requestData)
        });

        setJsonTextInputValue(JSON.stringify(response));

      }
    } catch (error) {

      console.log({error});
      Alert.alert('Error Occurened in Js Please check Logs.');
    }
  };
    // Register eventEmitters here
    useEffect(() => {
    const eventEmitter = new NativeEventEmitter(PayUSdk);
    payUGenerateHash = eventEmitter.addListener('generateHash', generateHash);
    //Unregister eventEmitters here
    return () => {
        payUGenerateHash.remove();
  }
  })

    generateHash = (e) => {
      console.log(e.hashName);
      console.log(e.hashString);
      sendBackHash(e.hashName, e.hashString);
  }

       //Used to send back hash generated to SDK
    sendBackHash = (hashName, hashData) => {        
        JSHmac(hashData, route.params.salt, CONSTANTS.HmacAlgorithms.HmacSHA256)
        .then(hash => 
          PayUSdk.hashGenerated( { [hashName]:CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(hash)) })
          )
         .catch(e => console.log(e));
    };

  return (
    <View style={styles.container}>
      <FlatList
        style={{ flex: 1 }}
        data={[
          { key: 'payment_options', title: 'Fetch payment options' },
          { key: 'vas', title: 'VAS (AXIB)' },
          { key: 'get_emi_details', title: 'Get EMI details (amount 2000)' },
          {
            key: 'check_is_domestic',
            title: 'Check is domestic (Card: 512345)',
          },
          {
            key: 'get_bin_info',
            title: 'Get Bin Info (Card: 450503)',
          },
          {
            key: 'get_transaction_info',
            title: 'Get Transaction Info (last 2 days)',
          }, {
            key: 'get_checkout_details',
            title: 'Checkout details',
          },
          // {
          //   key: 'check_offer_detail',
          //   title: 'Check offer detail (@11311)',
          // },
          {
            key: 'verify_payment',
            title: 'Verify Payment(1628684808250payusdk)',
          },
          // {
          //   key: 'check_offer_status',
          //   title: 'Check Offer Status',
          // },
          {
            key: 'lookup_api',
            title: 'LookUp API',
          },
          // {
          //   key: 'get_user_cards',
          //   title: 'Get User Cards',
          // }
          { key: 'check_balance',
          title: 'Check Balance Api (Environmment- Test)',
          },
          {
            key: 'get_config',
            title: 'Get Config Api',
          },
          {
            key: 'eligible_bins_for_emi',
            title: 'EligibleBins for EMI Api',
          },
          {
            key: 'delete_tokenised_user_card',
            title: 'DeleteTokenisedCard Api',
          },
          {
            key: 'get_tokenised_card',
            title: 'GetTokenisedCard Api',
          },
          {
            key: 'get_tokenised_card_details',
            title: 'GetTokenisedCardDetails Api',
          },
          {
            key: 'get_ibibo_codes',
            title: 'GetIbiboCodes Api',
          },
          {
            key: 'fetch_ifsc_details',
            title: 'FetchIFSCDetails Api',
          },
          {
            key: 'fetch_offer_details',
            title: 'Fetch Offer Details Api',
          },
          {
            key: 'validate_offer_details',
            title: 'Validate Offer Details Api',
          }
        // {
        //   key: 'get_ads_details',
        //   title: 'Fetch Ads Information Api',
        // },
        // {
        //   key: 'post_add_impression_event',
        //   title: 'Save Event ImpressionTask Api',
        // }
        ]}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity
              onPress={() => {
                onApiCall(item.key);
              }}
            >
              <Text style={styles.item}>{item.title || item.key}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <View style={{ flex: 1, padding: 16, backgroundColor: '#ccc' }}>
        <Text>JSON Output</Text>
        <ScrollView>
          <Text style={{ lineHeight: 24, fontSize: 16, maxHeight: 5000}}>{jsonTextInputValue}</Text>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
  },
  item: {
    padding: 16,
    fontSize: 20,
  },
  textArea: {
    justifyContent: 'flex-start',
    height: '100%',
    fontSize: 16,
  },
});

export default APIScreen;
