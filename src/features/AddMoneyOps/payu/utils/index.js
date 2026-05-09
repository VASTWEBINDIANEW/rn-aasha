import { sha512 } from 'js-sha512';
import { Platform ,Alert} from 'react-native';

export const DEFAULT = "default"
export const PAYMENT_RELATED_DETAILS_FOR_MOBILE_SDK = 'payment_related_details_for_mobile_sdk'
export const VAS_FOR_MOBILE_SDK = "vas_for_mobile_sdk";
export const API_GET_EMI_AMOUNT_ACCORDING_INTEREST = "getEmiAmountAccordingToInterest";
export const CHECK_IS_DOMESTIC = "check_isDomestic";
export const GET_BIN_INFO = "getBinInfo";
export const CHECK_OFFER_DETAILS = "check_offer_details";
export const GET_TRANSACTION_INFO = "get_transaction_info";
export const GET_CHECKOUT_DETAILS = "get_checkout_details";
export const VERIFY_PAYMENT = "verify_payment";
export const CHECK_OFFER_STATUS = "check_offer_status";
export const GET_USER_CARDS = "get_user_cards";
export const SAVE_USER_CARD = "save_user_card";
export const EDIT_USER_CARD = "edit_user_card";
export const DELETE_USER_CARD = "delete_user_card";
export const VALIDATE_VPA = "validateVPA";
export const CHECK_BALANCE = "check_balance";
export const GET_CONFIG = "get_sdk_configuration";
export const ELIGIBLE_BINS_FOR_EMI = "eligibleBinsForEMI";
export const DELETE_TOKENISED_USER_CARD = "delete_payment_instrument";
export const GET_TOKENISED_USER_CARD = "get_payment_instrument";
export const GET_TOKENISED_CARD_DETAILS = "get_payment_details";
export const GET_MERCHANT_IBIBO_CODES = "get_merchant_ibibo_codes";
export const GET_OFFER_DETAILS = "get_all_offer_details";



export const getHash = (payUData) => {
    payUData = getDefault(payUData);
    var hashString = `${payUData.key}|${payUData.txnId}|${payUData.amount}|${payUData.productInfo}|${payUData.firstName}|${payUData.email}|${payUData.udf1}|${payUData.udf2}|${payUData.udf3}|${payUData.udf4}|${payUData.udf5}|${payUData.udf6}|${payUData.udf7}|${payUData.udf8}|${payUData.udf9}|${payUData.udf10}|${payUData.salt}`;
    if (payUData.subventionAmount) {
        hashString = `${hashString}|${payUData.subventionAmount}`
    }
    return sha512(hashString);
}

export const getDefault = (payUData) => {
    payUData.udf1 = payUData.udf1 ? payUData.udf1 : '';
    payUData.udf2 = payUData.udf2 ? payUData.udf2 : '';
    payUData.udf3 = payUData.udf3 ? payUData.udf3 : '';
    payUData.udf4 = payUData.udf4 ? payUData.udf4 : '';
    payUData.udf5 = payUData.udf5 ? payUData.udf5 : '';
    payUData.udf6 = payUData.udf6 ? payUData.udf6 : '';
    payUData.udf7 = payUData.udf7 ? payUData.udf7 : '';
    payUData.udf8 = payUData.udf8 ? payUData.udf8 : '';
    payUData.udf9 = payUData.udf9 ? payUData.udf9 : '';
    payUData.udf10 = payUData.udf10 ? payUData.udf10 : '';
    payUData.subventionAmount = payUData.subventionAmount ? payUData.subventionAmount : '';
    payUData.isSandbox = payUData.isSandbox ? payUData.isSandbox : false;
    return payUData;
}

export const getWebHash = (payUData) => {
    var hashString = `${payUData.key}|${payUData.command}|${payUData.var1}|${payUData.salt}`;

    return sha512(hashString);
}

export const getVasHash = (payUData) => {
  if(payUData.var1 == null || payUData.var1.length == 0){
    payUData.var1 = DEFAULT
  }
  var hashString = `${payUData.key}|${payUData.command}|${payUData.var1}|${payUData.salt}`;

  return sha512(hashString);
}

export const getOfferHash = (payUData) => {

  if(!payUData.offerKey){
    alert('OfferKeyMissing');
    return false;
  }

  var hashString = `${payUData.key}|${payUData.command}|${payUData.offerKey}|${payUData.salt}`;
  return sha512(hashString);
}

export const getEMIDetailHash = (payUData) => {
  payUData.var1 = (payUData.amount)? payUData.amount : DEFAULT
  var hashString = `${payUData.key}|${payUData.command}|${payUData.var1}|${payUData.salt}`;
  return sha512(hashString);
}

export const getCheckIsDomesticHash = (payUData) => {
  payUData.var1 = (payUData.cardNumber)? payUData.cardNumber : DEFAULT
  var hashString = `${payUData.key}|${payUData.command}|${payUData.var1}|${payUData.salt}`;
  return sha512(hashString);
}

export const getBinInfoHash = (payUData) => {
  payUData.var1 = (payUData.isSIInfo)? payUData.isSIInfo : DEFAULT
  var hashString = `${payUData.key}|${payUData.command}|${payUData.var1}|${payUData.salt}`;

  return sha512(hashString);
}

export const getGetTransactionInfoHash = (payUData) => {
  payUData.var1 = (payUData.startTime)? payUData.startTime : DEFAULT
  var hashString = `${payUData.key}|${payUData.command}|${payUData.var1}|${payUData.salt}`;

  return sha512(hashString);
}

export const getCheckoutDetailsHash = (payUData) => {
  payUData.var1 = (payUData.var1)? payUData.var1 : DEFAULT
  var hashString = `${payUData.key}|${payUData.command}|${payUData.var1}|${payUData.salt}`;
  return sha512(hashString);
}

export const getVerifyHash = (payUData) => {
  var hashString = `${payUData.key}|${payUData.command}|${payUData.txnId}|${payUData.salt}`;
  return sha512(hashString);
}

export const getUserCardHash = (payUData) => {
  var hashString = `${payUData.key}|${payUData.command}|${payUData.userCredentials}|${payUData.salt}`;
  return sha512(hashString);
}

export const getLookupHash = (key, payUData) => {
    var hashString = `${payUData.key}|${payUData.command}|${payUData.var1}|${payUData.salt}`;
    return sha512.hmac(key, hashString);
}

export const getCheckBalanceHash = (payUData) => {
  var hashString = `${payUData.key}|${payUData.command}|${payUData.var1}|${payUData.salt}`;
  return sha512(hashString);
}

export const getConfigHash = (payUData) => {
  var hashString = `${payUData.key}|${payUData.command}|${payUData.var1}|${payUData.salt}`;
  return sha512(hashString);
}

export const getEligibleBinsForEmiHash = (payUData) => {
  var hashString = `${payUData.key}|${payUData.command}|${payUData.var1}|${payUData.salt}`;
  return sha512(hashString);
}

export const getDeleteTokenisedUserCardHash = (payUData) => {
  var hashString = `${payUData.key}|${payUData.command}|${payUData.var1}|${payUData.salt}`;
  return sha512(hashString)
}

export const getTokenisedUserCardHash = (payUData) => {
  var hashString = `${payUData.key}|${payUData.command}|${payUData.var1}|${payUData.salt}`;
  return sha512(hashString);
}

export const getTokenisedCardDetailsHash = (payUData) => {
  var hashString = `${payUData.key}|${payUData.command}|${payUData.var1}|${payUData.salt}`;
  return sha512(hashString);
}

export const getIbiboCodesHash = (payUData) => {
  var hashString = `${payUData.key}|${payUData.command}|${payUData.var1}|${payUData.salt}`;
  return sha512(hashString);
}

export const fetchAdsInformationHash = (payUData) => {
  // payUData.key = "rM5M43";
  // payUData.salt = "CMKta5xB";
  // payUData.var1 = "default";
   var hashString = `${payUData.key}|${payUData.command}|${payUData.var1}|${payUData.salt}`;
  return sha512(hashString);
}

export const saveEventImpressionHash = (payUData) => {
  // payUData.key = "rM5M43";
  // payUData.salt = "CMKta5xB";
  // payUData.var1 = "default";
   var hashString = `${payUData.key}|${payUData.command}|${payUData.var1}|${payUData.salt}`;

  return sha512(hashString);
}

export const getPaymentHash=(payUData,salt) =>{
  
  var hashString =payUData.key + '|' + payUData.transaction_id + '|' + payUData.amount + '|' + payUData.product_info + '|' + payUData.first_name + '|' + payUData.email + '|' + payUData.additional_param.udf1 + '|' + payUData.additional_param.udf2 + '|' + payUData.additional_param.udf3 + '|' + payUData.additional_param.udf4 + '|' + payUData.additional_param.udf5 + '||||||' + salt;
  console.log(hashString);
  return sha512(hashString);
}
export const getPaytHash=(payUData,salt) =>{
  
  var hashString =payUData.merchantKey + '|' + payUData.txnId + '|' + payUData.amount + '|' + payUData.productInfo + '|' + payUData.firstName + '|' + payUData.email + '|' + payUData.udf1 + '|' + payUData.udf2 + '|' + payUData.udf3 + '|' + payUData.udf4 + '|' + payUData.udf5 + '||||||' + salt;
  console.log(hashString);
  return sha512(hashString);
}
export const getVPAHash=(payUData,salt) =>{
  var hashString =payUData.key + '|' + VALIDATE_VPA + '|' + payUData.vpa + '|' + salt;
  console.log(hashString);
  return sha512(hashString);
}

export const CBParams = (route) => {
  var txnid = new Date().getTime().toString();

  return {
    key: route.merchantKey,
    transaction_id: txnid
    
  }
}
export const displayAlert = (title, value) => {
  
    console.log('displayAlert ' + title + ' ' + value);
    Alert.alert(title, value);
 
}
export const commonPaymentParam = (route) => {
  console.log(route,'********************')
  var txnid = route.txnId;

  return {
    key: route.merchantKey,
    transaction_id: txnid,
    amount: route.amount,
    product_info: route.productInfo,
    first_name: route.firstName,
    email: route.email,
    phone: route.phone,
    ios_surl: route.surl,
    ios_furl: route.furl,
    android_surl: route.surl,
    android_furl: route.furl,
    environment: route.environment,
    user_credentials: route.userCredentials,
    hashes:{

    },
    additional_param: {
      udf1: "udf1",
      udf2: "udf2",
      udf3: "udf3",
      udf4: "udf4",
      udf5: "udf5",
    }
    
    
  }
}

// export const getWebDefault = (payUData) => {
//     payUData.var1 = payUData.var1 ? payUData.var1 : '';
//     payUData.var2 = payUData.var2 ? payUData.var2 : '';
//     payUData.var3 = payUData.var3 ? payUData.var3 : '';
//     payUData.var4 = payUData.var4 ? payUData.var4 : '';
//     payUData.var4 = payUData.var4 ? payUData.var4 : '';
//     return payUData;
// }
