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


const setRadiantDynamicOtp = useCallback(
  async (
    transId,
    mobileNo,
    shopId,
    amount,
    qrTransId,
    reqType,
    Email
  ) => {

    const requestPayload = {
      Email: Email || "",
      trans_id: transId || "",
      mobile_no: mobileNo || "",
      shop_id: shopId || "",
      tot_amount: amount || 0,
      QR_transid: qrTransId || "",
      request_type: reqType || ""
    };

    console.log(
      "\n================ DYNAMIC OTP API START ================\n"
    );

    /* ---------------- FULL URL ---------------- */

    const fullUrl =
      `http://native.${APP_URLS.baseWebUrl}/${APP_URLS.setDynamicOtp}`;

    console.log(
      "API URL =>",
      fullUrl
    );

    /* ---------------- REQUEST ---------------- */

    console.log(
      "\nREQUEST PAYLOAD =>"
    );

    console.log(
      JSON.stringify(
        requestPayload,
        null,
        2
      )
    );

    setIsLoading(true);

    try {

      const res = await post({
        url: APP_URLS.setDynamicOtp,
        data: requestPayload,
        timeout: 120000
      });

      /* ---------------- RESPONSE ---------------- */

      console.log(
        "\nRESPONSE =>"
      );

      console.log(
        JSON.stringify(
          res,
          null,
          2
        )
      );

      /* ---------------- STATUS ---------------- */

      const status =
        res?.Content?.ADDINFO?.status;

      const message =
        res?.Content?.ADDINFO?.message;

      const otp =
        res?.Content?.ADDINFO?.otp_pin;

      console.log(
        "\nSTATUS =>",
        status
      );

      console.log(
        "MESSAGE =>",
        message
      );

      console.log(
        "OTP =>",
        otp
      );

      console.log(
        "TRANS ID =>",
        res?.Content?.ADDINFO?.trans_id
      );

      /* ---------------- VALIDATION ---------------- */

      if (!res) {

        throw new Error(
          "API returned empty response"
        );
      }

      if (
        res?.StatusCode !== 200
      ) {

        throw new Error(
          `Invalid StatusCode ${res?.StatusCode}`
        );
      }

      if (
        !res?.Content
      ) {

        throw new Error(
          "Content missing in API response"
        );
      }

      if (
        status !== "success"
      ) {

        console.log(
          "\nOTP API FAILED =>",
          message
        );
      }

      return res;

    } catch (error: any) {

      console.log(
        "\n================ API ERROR ================\n"
      );

      console.log(
        "ERROR MESSAGE =>",
        error?.message
      );

      console.log(
        "ERROR CODE =>",
        error?.code
      );

      console.log(
        "ERROR STATUS =>",
        error?.response?.status
      );

      console.log(
        "ERROR RESPONSE =>"
      );

      console.log(
        JSON.stringify(
          error?.response?.data,
          null,
          2
        )
      );

      console.log(
        "FULL ERROR =>"
      );

      console.log(
        JSON.stringify(
          error,
          null,
          2
        )
      );

      if (
        error?.code === 'ECONNABORTED'
      ) {

        ToastAndroid.showWithGravity(
          'Server timeout. Please try again.',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM
        );

      } else {

        ToastAndroid.showWithGravity(
          error?.message ||
          'Something went wrong!',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM
        );
      }

      return {
        success: false,
        error: error?.message
      };

    } finally {

      setIsLoading(false);

      console.log(
        "\n================ DYNAMIC OTP API END ================\n"
      );
    }

  },
  [post]
);


const submitCashPickupTransaction = useCallback(
  async (transaction) => {

    console.log(
      "\n================ FINAL SUBMIT API START ================\n"
    );

    console.log(
      "API URL =>",
      APP_URLS.submitCashPickup
    );
    console.log(
  "🌐 FULL URL =>",
  `${APP_URLS.baseapiurl}${APP_URLS.submitCashPickup}`
);

    console.log(
      "\nFINAL REQUEST PAYLOAD =>"
    );

    console.log(
      JSON.stringify(
        transaction,
        null,
        2
      )
    );

    setIsLoading(true);

    try {

      const res = await post({
        url: APP_URLS.submitCashPickup,
        data: transaction
      });

      console.log(
        "\nFINAL API RESPONSE =>"
      );

      console.log(
        JSON.stringify(
          res,
          null,
          2
        )
      );

      console.log(
        "\nSTATUS =>",
        res?.Content?.ADDINFO?.status
      );

      console.log(
        "MESSAGE =>",
        res?.Content?.ADDINFO?.message
      );

      console.log(
        "TRANS ID =>",
        res?.Content?.ADDINFO?.trans_id
      );

      return res;

    } catch (error: any) {

      console.log(
        "\nFINAL API ERROR =>"
      );

      console.log(
        JSON.stringify(
          error,
          null,
          2
        )
      );

      console.log(
        "ERROR MESSAGE =>",
        error?.message
      );

      throw error;

    } finally {

      setIsLoading(false);

      console.log(
        "\n================ FINAL SUBMIT API END ================\n"
      );
    }

  },
  []
);

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
