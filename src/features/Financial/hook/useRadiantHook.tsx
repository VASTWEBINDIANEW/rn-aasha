import { useCallback, useState } from 'react';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import { Toast } from 'react-native-alert-notification';
import { Alert, ToastAndroid } from 'react-native';
import React from 'react';

const useRadiantHook = () => {
  const [cashPickUpTransactionList, setCashPickupTransactionList] = useState([]);
  const [remarkList, setRemarkList] = useState([]);
  const [childRemarkList, setChildRemarkList] = useState([]);
  const [otpResponse, setOtpResponse] = useState();
  const [dynamicOtpResponse, setDynamicOtpResponse] = useState();

  const [isLoading, setIsLoading] = useState(false);
  const [submitCashPickupQrResponse, setSubmitCashPickupQrResponse] = useState();
  const [submitCashPickupResponse, setSubmitCashPickupResponse] = useState();
  const { get, post } = useAxiosHook();

  const fetchCashPickupTransactionList = useCallback(async () => {
    setIsLoading(true);

    const res = await post({ url: APP_URLS.getCashPickupTransactionList });
    console.log(res, '####################')
    setIsLoading(false);
    if (res == 'Invalid response..') {
      ToastAndroid.show(res, ToastAndroid.BOTTOM)
      return;

    }
    // {"Content": {"ADDINFO": {"message": "No Transaction Found", "status": "error"}, 
    // "ResponseCode": 1}, "StatusCode": 200, "Version": "1.0"}
    if (res.Content.ADDINFO.message == 'No Transaction Found') {
      // ToastAndroid.show(res.Content.ADDINFO.message,ToastAndroid.BOTTOM)
      return;
    }
     return res.Content.ADDINFO.transactionData;
;

    // setCashPickupTransactionList(res.Content.ADDINFO.transactionData);
    //  setCashPickupTransactionList(mock.Content.ADDINFO.transactionData);
  }, []);

  const fetchMasterRemarkList = useCallback(async () => {
    setIsLoading(true);
    const res = await post({ url: APP_URLS.getMasterRemarkList });
    setIsLoading(false);
    setRemarkList(res.Content.ADDINFO.masterRemarks);

  }, []);

  const fetchChildRemarkList = useCallback(async (remark: string) => {
    setIsLoading(true);
    const res = await post({ url: APP_URLS.getChildRemarkList + remark });
    setIsLoading(false);
    setChildRemarkList(res.Content.ADDINFO.masterRemarks);
  }, []);

  const setRadiantOtp = useCallback(async (transId, mobileNo, shopId, amount, requestType = 'Daily', QRId, Email) => {
    console.log(JSON.stringify({
              "Email": Email,

      "trans_id": transId,
      "mobile_no": mobileNo,
      "shop_id": shopId,
      "tot_amount": amount,
      "QR_transid": QRId,
      "request_type": requestType
    }))



    setIsLoading(true);
    const res = await post({
      url: APP_URLS.sendRadiantOtp, data: {
        "Email": Email,
        "trans_id": transId,
        "mobile_no": mobileNo,
        "shop_id": shopId,
        "tot_amount": amount,
        "QR_transid": QRId,
        "request_type": requestType
      }
    });
    setIsLoading(false);


  console.log(res);
      console.log('--------------------------setRadiantOtp---------------------------------------')
      console.log(res)
    //setOtpResponse(res);
    return res

  }, []);


  const setRadiantDynamicOtp = useCallback(async (transId, mobileNo, shopId, amount, qrTransId, reqType, Email) => {
    console.log({
              "Email": Email,

      "trans_id": transId,
      "mobile_no": mobileNo,
      "shop_id": shopId,
      "tot_amount": amount,
      "QR_transid": qrTransId,
      //  "request_type": reqType,
    });

    setIsLoading(true);

    try {
      const res = await post({
        url: APP_URLS.setDynamicOtp,
        data: {
          "Email": Email,
          "trans_id": transId,
          "mobile_no": mobileNo,
          "shop_id": shopId,
          "tot_amount": amount,
          "QR_transid": qrTransId,
          // "request_type": reqType,
        }
      });

      console.log(res);
      console.log('--------------------------setRadiantDynamicOtp---------------------------------------')
      console.log(res)
      setIsLoading(false);

      if (!res.Content?.ADDINFO) {
        ToastAndroid.showWithGravity(
          'Failed to fetch Dynamic OTP: ADDINFO is missing or invalid!',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM
        );
      } else {

        return res;
        //  setDynamicOtpResponse(res);
      }
    } catch (error) {
      setIsLoading(false);
      ToastAndroid.showWithGravity(
        'Network Error: Something went wrong while fetching OTP.',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
    }
  }, []);

  const submitCashPickupTransaction = useCallback(async (transaction) => {
    setIsLoading(true);
    console.log(transaction, '***************************')

    
    const res = await post({ url: APP_URLS.submitCashPickup, data: transaction });
    setIsLoading(false);
    console.log(res, '---------------------------submitCashPickupTransaction---------------------------')

    // if(res?.Content?.ADDINFO?.status === 'success'){
    //      Alert.alert("Success", res?.Content?.ADDINFO?.message);
    //    }
    //    else{
    //     // Alert.alert("Error", res?.Content?.ADDINFO?.message || 'Something went wrong.');
    //    }
    //setSubmitCashPickupResponse(res);

    return res;
  }, []);

  const setCashPickupQrTransaction = useCallback(async (reqData) => {
    setIsLoading(true);
    const res = await post({ url: APP_URLS.radiantQRCashPickup, data: reqData });
    setIsLoading(false);
    setSubmitCashPickupQrResponse(res);
  }, []);



  return {
    cashPickUpTransactionList,
    fetchCashPickupTransactionList,
    fetchMasterRemarkList,
    fetchChildRemarkList,
    setRadiantOtp,
    setRadiantDynamicOtp,
    submitCashPickupTransaction,
    setCashPickupQrTransaction,
    remarkList,
    childRemarkList,
    isLoading,
    dynamicOtpResponse,
    submitCashPickupResponse,
    submitCashPickupQrResponse,
    otpResponse,
  };
};

export default useRadiantHook;
