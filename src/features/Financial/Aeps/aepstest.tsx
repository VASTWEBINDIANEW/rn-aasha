import React, { useCallback, useEffect, useState } from 'react';
import { Alert, View, Text } from 'react-native'; // Import Text from react-native
import { useSelector } from 'react-redux';
import { useLocationHook } from '../../../utils/hooks/useLocationHook';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import DynamicButton from '../../drawer/button/DynamicButton';
import { RootState } from '../../../reduxUtils/store';

const TwoFaComponent = () => {

  const { userId, activeAepsLine } = useSelector((state: RootState) => state.userInfo);
  const { latitude, longitude } = useLocationHook();
  const { post } = useAxiosHook();

  const captureResponse = {
    "Devicesrno": "7146810",
    "PidDatatype": "X",
    "Piddata": "MjAyNC0wNy0wNlQxMjozNDoyMKnHFf5iB6Y2lo1on4UGHlgh00EcMyrJFEtGUYDTjSj/KWT8q26N/ViDY37uWn2P+xx1FeGhh9MIEl+jCRleFHbc9m8JExd/F7NEcOIfsodnHSNp4wrVHYHVSDTBWZNbdRPLiV8/BIOuFHr9bbr+jLroOmyXTLT6Y4nx+XzoUr/Es7HrtfHJtRoG+jLn/sUM/Xf7td6AmFDDj5Z+Nd959m9TV4Uk58v25qLNL5UZVbzCpI3a4LMUpA2ieYOT4CG7JrO2MzvhJpANBkZsYt/juCJydtDj/3PgKWCbvOsi1SKZOPz8O5l6Dbhb+hZh4spDn53U9lCLALrlbAuPx3cjNGXnjSPldGz/IOq1on5s2pOdU2lS0N/BhIP/0VoIe0Sq4iRaw+GGebJPZy2ejOwQiBk68ATsqVmZ8FuLRh+pyZq3rTxmrq9REpumxIw3595m6Zr59CBg7rdk7RPkMNYAhVrC0BjCCt4wx0A9nysQl9iS7Y2jufgsg4MzIPt99Jn6bsYqCdWimwNNkpXFDX01FLl4yG3Gw7lsOYYyxbVhWX3Cw4qYKbBMilh3QiSi65qzFczs9TwgKLi0sAa93dUyRfw58FR5m3NNbMSHx7542miOqRMXeuWkWZrjA0ouk6XPeSmdc3JKxJYxA+TJaSq8z38tsfg8ZHkRkSYUbOwvJMkgw4NWjW8HEzNtJ9OmfpIzfuGwyyo9pA6ngwZrxhncl4YTgVubb9Qux3MPocMs2sLqkdzb/mIHCSk8HYO0OeaBawi+FIioKaDLphPhTm++L2LSSJ98s3lwOQk/+W0auzojXQSIeE5K6/qQmE0cbeKDUNnlfaoM4Hq6b5M9OiJOKMUdsQpL9CEHteiRqW4SK1LaSNrVRJC3/9sLBjwyMqx4dcy1pzT4gmGk5tIY2Xd8cEQDDtVzt6wWDLpszwgFvxBdpdUuLLvEXgvCocpcg+0Kh4MTiDEQcTY2Ba2FeVF/NQ+tluln7urdgEeydIkyW4xAvqzjQS3z44inIReNbm9UJtzs0aT6CsYXnJuxT6arzkiQjWv9STFZhoSSB0SKuCaZDgdcRvKAqu1cpm6tByC3O67/4Qd87VYnBMG+U5Cixzwq4AN3DNL/lm83zeGfekvdr2liJ2y3/4VG6WrvpPLkRc3CzeB5tWeBG5wxQL0HIm0dA80/LsiA2Ph0xRzgiyxQuId8s2jxuO9KXCbjPLUyqf8N7bo7DOqQLCvxi0zRJYCFX7XLh1B2atAuFLjYvzZIyjBeY6YRYv54Q4TgpdYqg+3HNSuras+0F66yaFOHDAjnUX6Y/0TAjr09tXfk1O2RV6BPZyfh56VoPHamCOJaaPb2x/LO9hN1DxnZGSNz/BhEdm6TxTQwAoAGjpf5MDKZgzXaWTkPkYPcra0J576L7GJX3P7BwRA6KwKOtpRyRc3LeJuSMlmnTljrltSJVc7gQ772u3E56ns6m03DorvFGea/1P0PJ/GKOoaYOX16pOf3Vn/ldJfpGAy36wl0fcCnwrXn4AIcuC/50lF7LHNxf6rspzgNwNTO+VLzGugHFU53jk0Ybm0Ya4At4adVM0eKN/TME381NIDie2GNtHzuhGgpyBNmB4Ef2DvSPEy6uIku11CLmjvTbdo0NmQn1KjWH6Hg0X2sJl1WMWK3s57QrNFt776JIOyQEKdMiiQSRUlAWUEHexbSnqimHYwqj0dzdpB1U6c/QZ/2RB6YlYepRrzNF5wvrhklFaW6iNsjOFsuLNEd24WtFYybnsRpKw8zHcOdtzbERhusmv9Mzy6hbMDKIqs6V7oaRr3jCTVgPykB2S0a",
    "ci": "20250923",
    "dc": "7851eb05-2d95-4bbd-8edf-21014c5ae8b6",
    "dpID": "MANTRA.MSIPL",
    "errCode": "0",
    "errInfo": "Success",
    "fCount": "1",
    "fType": "2",
    "hmac": "ThQ21S3OBreHB3gvM+3iReY67KOy20oq4JGr7+oNReJ0Kxhgp5VLhUJpbGcvzRpj",
    "iCount": "0",
    "iType": "0",
    "mc": "MIIEADCCAuigAwIBAgIIRDcyQ0U1MDUwDQYJKoZIhvcNAQELBQAwgfwxKjAoBgNVBAMTIURTIE1hbnRyYSBTb2Z0ZWNoIEluZGlhIFB2dCBMdGQgMjFVMFMGA1UEMxNMQi0yMDMgU2hhcGF0aCBIZXhhIE9wcG9zaXRlIEd1amFyYXQgSGlnaCBDb3VydCBTLkcgSGlnaHdheSBBaG1lZGFiYWQgLTM4MDA2MDESMBAGA1UECRMJQUhNRURBQkFEMRAwDgYDVQQIEwdHVUpBUkFUMR0wGwYDVQQLExRURUNITklDQUwgREVQQVJUTUVOVDElMCMGA1UEChMcTWFudHJhIFNvZnRlY2ggSW5kaWEgUHZ0IEx0ZDELMAkGA1UEBhMCSU4wHhcNMjQwNzAxMTg1MDE4WhcNMjQwODI1MTcwNzM2WjCBgjEkMCIGCSqGSIb3DQEJARYVc3VwcG9ydEBtYW50cmF0ZWMuY29tMQswCQYDVQQGEwJJTjELMAkGA1UECBMCR0oxEjAQBgNVBAcTCUFobWVkYWJhZDEOMAwGA1UEChMFTVNJUEwxCzAJBgNVBAsTAklUMQ8wDQYDVQQDEwZNRlMxMTAwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQCRfBxhuSL8NYftd2ENd+hAqvBtliIbGRGPC2i33UKN+BT4ZLX4OUyFx96jEh8EHTCOw4uWtFANak5Eu360UdXF2YAYgq9HuOptr4AA1+nka3S82wpRuoUrVPJDSYc3/0ZQu4mYGD0k8cFgr651oNsfZdxq6GoWMxpYIi7lqPttUjH87XT0ONFaE2IZkLg7xTBhSyaEzCXh9Zceh+Qyo5wgooSZ7v38fKLB5/v8IMcF6pTjVsdAYfVo5RTXk/7H3fz9uHyProjVRhtdXNR4JX/Bu6OhLkQp2kHWQpA1qr236+grYkPCrxObf3DddfIam82tg57kfn1Nns24cvBxxYBFAgMBAAEwDQYJKoZIhvcNAQELBQADggEBAI/UzzdMUNjlQdvz8lQM/1b5R49PXkf85fLTyitNgNjjKw3OhQowBo97iJlDHqMFHIGMMuKA8xcoGOEanyuAo9oWAgIOajVPtT6ucbcNKqtuEHjWg5oV62eOBtiwajwnNm2oc3b9pC1aqA8M3JRpLf+FbTh+ZjkZlZobSYLN2WtWuAIL02D1OdTWDROTmtGlwL7XqPHOxhVl/UK2msYsVzURdY8tf4RbSIX0UUcgUV1htZ1Npyz3d6yB4eVVLtC5KUcF8Q4V9XeSdcdrAAnmGgfaRtdyOQIz7CeEIPoFBCmSFl9ibXEr1mjPBKlRvrGUa5wRdVFOvBg1cJZiRGZ3XFI=",
    "mi": "MFS110",
    "nmPoints": "38",
    "pCount": "0",
    "pType": "0",
    "qScore": "88",
    "rdsID": "RENESAS.MANTRA.001",
    "rdsVer": "1.0.3",
    "sessionKey": "YC8aM6822Y87jx+AdoOkGr2Kkc5DogRYJtuX5mW1+1o6fQhrvN5CPNu4MVQvqtB7q6tussvnvGJktCYL0kK2h/fBlnAVliZ5rHPfCi6r0gixBFHaq+sG0ry9S+mjDvkiShCNbHV35cI1ovaeKpL9lQxiS98CIybh0O/0ndp7VcbecFKzOnwxFlxBJrDrF8Fu8Yy5GwMzSwv7BOMXJh05Z/jUMByVmp/UIZ9A+vrmcev+u3Hre3qrSklr+Z2WsuG0PLe/W6REv3Llj1A/jewQ6uIFS0eRmHLkOm6d0GTgUMrO2tdoFu6DC+M6En0czf5ZcLmeMkYsNshvKY54TxghrQ=="
  };

  const cardnumberORUID = {
    adhaarNumber: "",
    indicatorforUID: "0",
    nationalBankIdentificationNumber: ""
  };
  const address = 'vwi';
  const TwoFa = async () => {
    console.log('latitude', latitude, 'longitude', longitude);

    if (!captureResponse || !cardnumberORUID || !latitude || !longitude || !userId || !address) {
      Alert.alert(
        "Error",
        "key_pleaseens_67",
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
      return;
    }

    try {
      const data = {
        captureResponse: captureResponse,
        cardnumberORUID: cardnumberORUID,
        languageCode: 'en',
        latitude,
        longitude,
        mobileNumber: '',
        merchantTranId: userId,
        merchantTransactionId: userId,
        paymentType: 'B',
        otpnum: '',
        requestRemarks: 'TN3000CA06532',
        subMerchantId: 'A2zsuvidhaa',
        timestamp: 'thus 11 Jul 23:53:30',
        transactionType: '',
        name: '',
        address: address,
        transactionAmount: ''
      };
      const
        headers = {
          trnTimestam: 'thus 11 Jul 23:53:30',
          deviceIMEI: '57bea5094fd9082d',
        }

      const url = activeAepsLine ? `${APP_URLS.twofaNifi}` : `${APP_URLS.twofa}`;
      const formData = JSON.stringify(data);
      console.log(formData);
      const response = await post({
        url: url,
        data: formData,
        config: {
          header: headers
        }
      });
      console.log('headers', headers)
      console.log('response', response);
      console.log('post');
      if (response && response.Status === 'false') {
        Alert.alert(
          "Notification",
          `${response.Status} ${response.Message}!!!`,
          [{ text: "OK", onPress: () => console.log("OK Pressed") }],
          { cancelable: false }
        );
      }

    } catch (error) {
      console.error('Error during 2FA request:', error);
      Alert.alert(
        "Error",
        `An error occurred: ${error.message}`,
        [{ text: "OK", onPress: () => console.log("OK Pressed") }],
        { cancelable: false }
      );
    }
  };




  const onPressLogin = useCallback(async (captureResponse1, cardnumberORUID1) => {

    const data = {
      captureResponse: captureResponse1,
      cardnumberORUID: cardnumberORUID1,
      languageCode: 'en',
      latitude,
      longitude,
      mobileNumber: '',
      merchantTranId: userId,
      merchantTransactionId: userId,
      paymentType: 'B',
      otpnum: '',
      requestRemarks: 'TN3000CA06532',
      subMerchantId: 'A2zsuvidhaa',
      timestamp: 'Mon 8 Jul 15:53:30',
      transactionType: '',
      name: '',
      address: address,
      transactionAmount: ''
    };
    console.log(data);
    const headers = {
      trnTimestamp: 'Wed 10 Jul 16:06:20',
      deviceIMEI: 'sdhfjwtshjrfgbhn',
    }


    const response = await post({
      url: activeAepsLine ? APP_URLS.twofaNifi : APP_URLS.twofa,
      data: data,
      config: {
        headers: headers
      },
    });

    console.log(response);
    Alert.alert('Message', `: ${response.Message}`);

  }, [useCallback, post, captureResponse, cardnumberORUID]);
  useEffect(() => {
  }, []);


  const CheckBalance = useCallback(async (captureResponse1, cardnumberORUID1) => {
    const data = {
      captureResponse: captureResponse1,
      cardnumberORUID: cardnumberORUID1,
      languageCode: 'en',
      latitude,
      longitude,
      mobileNumber: '9370521211',
      merchantTranId: userId,
      merchantTransactionId: userId,
      paymentType: 'B',
      otpnum: '',
      requestRemarks: 'TN3000CA06532',
      subMerchantId: 'A2zsuvidhaa',
      timestamp: 'Mon 8 Jul 15:53:30',
      transactionType: 'BE',
      name: 'Ishan Shukla',
      address: address,
      transactionAmount: ''
    };
    console.log(data);

    const headers = {
      'Content-Type': 'application/json',
      'trnTimestamp': 'Wed 10 Jul 16:06:20',
      'deviceIMEI': 'sdhfjwtshjrfgbhn',
      "Accept": "application/json",
      "Authorization": "Bearer 8ysTe8_J0KdHB5P8iDCIzvAU4_q6oc3DwA4rD-65lAX7Vyg7gV8no8PA7Ni8VxDplnVqaP_C0NfPWyMij44FWp4HKlXmRSqKDZx6zG1tLN53zxx3AgAFMSEkDSdKxW30j3TdU4sgvoR4bw5TensoBMQBoAVT8WfYxwlWokgEwdSY9qKUXi_4zmZlKXjWp8pGzovbulr-uNlNruv9OHjR_LtxzxqRPgqdaScGRtUsg2fxxltGrDuOtFPCts4Olo0RKppMYUdFgbZZd4KJf93W4_DRG7cCU_fOZBG2pHgsOEIaub3aJ-f6_PgeOP88qyZPrX83YW4hKSKG29ruuVFekEHXSXfGmszfJCsMkh4G9KRLvdwECz8YitrJrToBgX2wb9SXp1UNKfdDOcLh7a1V4j5u3m9_agdBsLKkPZ73pyzuvqpv_si9B6ulVLkXBWvGq5xFTmz8-b1-zgUG2d1_tiMPyjjmKn15GG3rvPChEbBcenUEptf2y3kasxA-yc71sYlxo1_Jh9ESJ2bbw33-MhxAhfa68_2fHYz2IkyhUXc"

    };

    try {
      const response = await fetch(`http://api.divyanshipay.co.in//AEPS/api/app/AEPS/balanceEnquiry`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok ' + response.statusText);
      }

      const responseData = await response.json();
      console.log(responseData);

      if (responseData.RESULT === '1') {
        Alert.alert('Error', `: ${responseData.ADDINFO}`);

      } else if (responseData.RESULT === '0') {
        Alert.alert('', `: ${responseData.ADDINFO}`);

      }
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }, [latitude, longitude, userId, address]);

  useEffect(() => {
  }, []);
  return (
    <View>
      <DynamicButton
        title={'Two Fa Code Check'}
        onPress={() => {
          onPressLogin(captureResponse, cardnumberORUID)
          //      CheckBalance(captureResponse,cardnumberORUID);


        }}
        styleoveride={undefined}
      />
    </View>
  );
};

export default TwoFaComponent;
