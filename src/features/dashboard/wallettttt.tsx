import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  Button,
  TouchableOpacity,
  ScrollView,
  Alert,
  ToastAndroid,
  Linking,
} from "react-native";
import { APP_URLS } from "../../utils/network/urls";
import useAxiosHook from "../../utils/network/AxiosClient";

import FlotingInput from "../drawer/securityPages/FlotingInput";
import { colors, FontFamily, FontSize } from "../../utils/styles/theme";
import { hScale, wScale } from "../../utils/styles/dimensions";
import DynamicButton from "../drawer/button/DynamicButton";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { decryptData, encrypt } from "../../utils/encryptionUtils";
import AppBarSecond from "../drawer/headerAppbar/AppBarSecond";
import WalletSvg from "../drawer/svgimgcomponents/Walletsvg";
import Walletansvg from "../drawer/svgimgcomponents/Walletansvg";
import OnelineDropdownSvg from "../drawer/svgimgcomponents/simpledropdown";
import { useSelector } from "react-redux";
import { RootState } from "../../reduxUtils/store";
import { fonts } from "@rneui/base";
import {
  getDeviceInfo,
  captureFinger,
} from "react-native-rdservice-fingerprintscanner";
import { FlashList } from "@shopify/flash-list";
import AmountDropdown from "./walletnewdropdown";
import uuid from "react-native-uuid";

import { useDeviceInfoHook } from "../../utils/hooks/useDeviceInfoHook";
import { translate } from "../../utils/languageUtils/I18n";
const WalletScreen = () => {
  const { colorConfig, IsDealer, Loc_Data } = useSelector(
    (state: RootState) => state.userInfo,
  );
  const color1 = `${colorConfig.secondaryColor}20`;
  const [balanceInfo, setBalanceInfo] = useState();
  const [amount, setAmount] = useState("");
  const [Mode, setMode] = useState("");
  const [editMode, seteditMode] = useState(false);

  const { get } = useAxiosHook();
  const { post } = useAxiosHook();
  const [charges, setCharges] = useState([]);
  const [isload, setisload] = useState(false);
  const [upich, setupichs] = useState(null);
  const [texterror, setTexterror] = useState(false);
  const [height, setHeight] = useState(false);
  const navigation = useNavigation<any>();
  const [decryptedWalletCharges, setDecryptedWalletCharges] = useState(null);

  const { getNetworkCarrier, getMobileDeviceId, getMobileIp } =
    useDeviceInfoHook();

  const { latitude, longitude } = Loc_Data;
  console.warn(latitude, longitude);
  const handlePress = () => {
    setHeight(!height);
  };
  const getData2 = useCallback(async () => {
    try {
      const userInfo = await get({ url: APP_URLS.getUserInfo });
      const data = userInfo.data;
      if (!IsDealer) {
        const response = await get({ url: APP_URLS.balanceInfo });
        setBalanceInfo(response.data[0]);
      } else {
        const decryptedData = {
          adminfarmname: decryptData(data.kkkk, data.vvvv, data.adminfarmname),
          posremain: decryptData(data.kkkk, data.vvvv, data.posremain),
          remainbal: decryptData(data.kkkk, data.vvvv, data.remainbal),
          frmanems: decryptData(data.kkkk, data.vvvv, data.frmanems),
        };

        console.log("Decrypted Data:", decryptedData);

        setBalanceInfo(decryptedData);
      }

      const adminFarmName = decryptData(
        data.vvvv,
        data.kkkk,
        data.adminfarmname,
      );
    } catch (error) {
      if (error.message === "Network Error") {
      } else {
        console.error("Error fetching data:", error);
        Alert.alert(
          translate("Error"),
          translate("Something went wrong. Please try again."),
        );
      }
    }
  }, [get]);

  useFocusEffect(
    useCallback(() => {
      setAmount("");
      setMode("");
    }, []),
  );

  const gatewaytype = useCallback(
    async (type) => {
      console.log("type", type);
      //  setIsLoading(true)

      try {
        const data = await post({ url: `${APP_URLS.Chkpayu}type=${type}` });
        //setPayUParams(data);
        console.log(data);
        console.log(`${APP_URLS.Chkpayu}type=${type}`);
        var resp = data["Response"];
        var msz = data["Message"];
        if (resp == "Success") {
          //setMerchantkey(data["Merchantkey"]);
          //setMerchantid(data["Merchantid"]);
          //setMarsalt(data["MerchantSalt"]);
          // setUSERID(data["USERID"]);
          //setPrivatekey(data["Privatekey"]);
          // setTxnsuccessUrl(data["txnsuccessUrl"]);
          // setTxnfailureUrl(data["txnfailureUrl"]);
          // setMerchemail(data["email"]);
          // setMerchmobile(data["mobile"]);
          //  setMrchname(data["name"]);

          // if (type == "CC") {

          //     Alert.alert('Error', 'Something went wrong. Please try again.');

          // } else if (type == "DC") {
          //     Apitransitionsencrypt('DC', data);

          // } else if (type == "WA") {

          //     Apitransitionsencrypt('WA', data);

          // } else if (type == "NB") {

          //     Apitransitionsencrypt('NB', data);
          // } else if (type == "UPI") {
          //     Apitransitionsencrypt('UP', data);

          // }

          ToastAndroid.showWithGravity(
            msz || ` ${type} status is  OK.`,
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM,
          );
          Alert.alert(msz ? ` ${type} status is  OK.` : "");
          seteditMode(true);
        } else {
          Alert.alert(
            translate("Warning"),
            ` ${msz} +!!!`,
            [
              {
                text: translate("OK"),
                onPress: () => console.log("OK Pressed"),
              },
            ],
            { cancelable: false },
          );
          seteditMode(false);
        }
        //  setIsLoading(false)
      } catch (error) {
        // setIsLoading(false)
      }
    },
    [post],
  );

  const Apitransitionsencrypt = useCallback(
    async (type, data1) => {
      try {
        const id = uuid.v4().toString().substring(0, 16);
        // setIsLoading(true)

        // Fetch Network and Device Data
        const mobileNetwork = await getNetworkCarrier();
        const ip = await getMobileIp();
        const model = await getMobileDeviceId();

        // Perform Encryption
        const encryption = await encrypt([
          type, // Payment Type
          model, // Device Model
          latitude || 0, // Latitude
          longitude || 0, // Longitude
          model, // Device Model (again)
          "city", // City (example, should be dynamic if needed)
          "postcode", // Postal Code (example, should be dynamic if needed)
          mobileNetwork, // Mobile Network Carrier
          ip, // IP Address
          "Address", //
        ]);

        const [
          typee,
          Modell,
          lat,
          long,
          Model2,
          city,
          postcode,
          mobileNetwork2,
          ip2,
          address,
        ] = encryption.encryptedData;

        const key = encryption.keyEncode;
        const vv = encryption.ivEncode;

        const url = `${APP_URLS.sendgatewayReq}txtamt=${encodeURIComponent(amount)}&txnid=${encodeURIComponent(id)}&ddltypes=${encodeURIComponent(typee)}&Devicetoken=${encodeURIComponent(ip2)}&Latitude=${encodeURIComponent(lat)}&Longitude=${encodeURIComponent(long)}&ModelNo=${encodeURIComponent(Model2)}&City=${encodeURIComponent(city)}&PostalCode=${encodeURIComponent(postcode)}&InternetTYPE=${encodeURIComponent(mobileNetwork2)}&IP=${encodeURIComponent(ip2)}&Addresss=${encodeURIComponent(address)}&value1=${encodeURIComponent(key)}&value2=${encodeURIComponent(vv)}`;

        console.log("Request URL:", url);

        // API Call to Fetch Data
        const data = await post({ url });

        console.log("API Response:", data);

        const resp = data["Status"];

        const payUParam = await Object.assign({}, data, data1, { amount });
        // savePayUParam(payUParam);
        if (resp === "Success") {
          console.log("Navigating with payUParam:", payUParam);
          navigation.navigate("SeamlessScreen", { payUParam });
        } else {
          const errorMsg = data["message"] || data["txnid"];
          Alert.alert(
            translate("Payment Failed"),
            translate(`Transaction failed. Reason: ${errorMsg}`),
            [
              {
                text: translate("OK"),
                onPress: () => console.log("OK Pressed"),
              },
            ],
            { cancelable: false },
          );
        }
        // setIsLoading(false)
      } catch (error) {
        // Global error handling
        console.error("Error in Apitransitionsencrypt:", error.message);
        Alert.alert(
          translate("Error"),
          translate(`Something went wrong: ${error.message}`),
          [{ text: translate("OK"), onPress: () => console.log("OK Pressed") }],
          { cancelable: false },
        );
      }
      // setIsLoading(false)
    },
    [amount, navigation, latitude, longitude],
  );

  //  const Qrcodestatus = useCallback(async (amnt) => {

  //         try {
  //             const response = await post({ url: `${APP_URLS.UPIQR}?amount=${amnt}` });
  //             console.log("=============================================================================");
  //             console.log(response);
  //               // Linking.openURL("upi://pay?pa=paytmqr2810050501010pi3gxx6m1rh@paytm&pn=Verified%20Merchant%20Account&am=1&cu=INR&tn=Verified%20Merchant%20Account&tr=TXN123456789&mc=5499&mode=00&orgid=000000&merchantId=IWzJok49855843175194");

  //             if (response) {

  //                 seteditMode(true);

  //                  Alert.alert( response?.msg || "QR status is OK",)
  //             } else {
  //               seteditMode(false);

  //                 ToastAndroid.showWithGravity(
  //                     response?.msg || "QR status is not OK, try again.",
  //                     ToastAndroid.LONG,
  //                     ToastAndroid.BOTTOM
  //                 );
  //                 Alert.alert( response?.msg || "QR status is not OK, try again.",)
  //                 console.log("QR status is not OK, try again.");

  //             }

  //         } catch (error) {

  //             console.error("Error fetching QR status:", error);
  //         }
  //     }, []);
  //   const showAlert = (message) => {
  //       Alert.alert(
  //           'Error',
  //           message,
  //           [{ text: 'OK', onPress: () => console.log('OK Pressed') }],
  //           { cancelable: false }
  //       );
  //   };

  const Qrcodestatus = useCallback(async (amnt) => {
    try {
      const response = await post({ url: `${APP_URLS.UPIQR}?amount=${amnt}` });
      console.log(
        "=============================================================================",
      );
      console.log(response);

      // 🟢 SUCCESS CASE
      if (response?.status === true && response?.qrstatus === "OK") {
        seteditMode(true);
        Alert.alert(response?.msg || translate("QR is Valid"));
        return;
      }

      // 🔴 FAIL CASE
      seteditMode(false);
      Alert.alert(
        response?.msg || translate("QR status is not OK, try again."),
      );
      console.log("QR status is NOT OK.");
    } catch (error) {
      console.error("Error fetching QR status:", error);
      seteditMode(false);
      Alert.alert(translate("Something went wrong!"));
    }
  }, []);

  const getData = useCallback(async () => {
    try {
      // const userInfo = await get({ url: APP_URLS.getUserInfo });

      const wallet = await get({
        url: "Common/api/data/Wallet_ALL_Charges_Show",
      });
      const walletCharges = JSON.parse(
        decryptData(wallet.kkkk, wallet.vvvv, wallet.WalletCharges),
      );

      console.log(
        JSON.parse(decryptData(wallet.kkkk, wallet.vvvv, wallet.WalletCharges)),
      );
      setDecryptedWalletCharges(walletCharges);

      // const res = await get({ url: APP_URLS.getProfile })
      // if (res.data) {
      //   console.log(JSON.parse(decryptData(res.value1, res.value2, res.data)))
      // }

      if (!IsDealer) {
        const response = await get({ url: APP_URLS.balanceInfo });
        setBalanceInfo(response.data[0]);
        console.log(response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [get]);
  const onpressbtn = () => {
    if (amount.length === 0) {
      ToastAndroid.show(
        translate("Please enter an amount"),
        ToastAndroid.SHORT,
      ); // Show a toast message
    } else {
      navigation.navigate("AddMoneyOptions", {
        amount,
        jsonData: charges,
        from: "PrePay",
      });
      setAmount("");
    }
  };

  const getCharges = useCallback(
    async (amount) => {
      try {
        const userInfo = await get({ url: `${APP_URLS.addmoneyChg}${amount}` });
        setCharges(Object.entries(userInfo.WalletChargesenc));
        console.log(userInfo);
        console.log(userInfo.WalletChargesenc, "**/*/*/");
        setisload(false);
      } catch (error) {
        console.error("Error fetching charges:", error);
      }
    },
    [get, amount],
  );

  const upiCharges = useCallback(async () => {
    try {
      const userInfo = await get({ url: `${APP_URLS.upicharges}` });
      setupichs(userInfo);
      console.log("upichargesssss", userInfo);
    } catch (error) {
      console.error("Error fetching charges--:", error);
    }
  }, [get]);
  useEffect(() => {
    setCharges([]);

    getData2();
    upiCharges();
    getData();
  }, []);

  const handleModeChange = (mode) => {
    setTexterror(false);

    console.log("Selected Mode:", mode);

    if (mode === "UPI") {
      console.log("gjfjgfjg");

      Qrcodestatus(amount);
      console.log(amount);
    } else if (mode === "Manual Request") {
      //WalletStatus(amount);
    } else if (mode === "Net Banking") {
      gatewaytype("NB");
    } else if (mode === "Debit Card") {
      gatewaytype("DC");
    } else if (mode === "Credit Card") {
      gatewaytype("CC");
    } else {
      console.log("Unknown Mode Selected");
    }
  };

  const upiCharges2 = useCallback(async () => {
    try {
      const d = JSON.stringify(getDeviceInfo());

      Alert.alert(translate("Device Info"), d);

      console.log(d);
    } catch (error) {
      console.error("Error fetching device info:", error);

      // त्रुटि संदेश को अलर्ट में दिखाएं
      Alert.alert(
        translate("Error"),
        translate("Failed to fetch device information."),
      );
    }
  }, []);
  const amountOptions = [
    "UPI",
    "Credit Card",
    "Debit Card",
    "Net Banking",
    "Manual Request",
  ];

  const chargeData = decryptedWalletCharges
    ? [
        {
          title: translate("Self UPI"),
          value: `${decryptedWalletCharges.data.UPI}%`,
        },
        {
          title: translate("UPI Charge in ₹"),
          value: `₹ ${decryptedWalletCharges.data.UPI}`,
        },
        {
          title: translate("Credit Card"),
          value: `${decryptedWalletCharges.data.creditcard}%`,
        },
        {
          title: translate("Debit Up to 2000"),
          value: `${decryptedWalletCharges.data.debitupto2000}%`,
        },
        {
          title: translate("Debit Above 2000"),
          value: `${decryptedWalletCharges.data.debitabove2000}%`,
        },
        { title: translate("Rupay Debit Card"), value: "Free" },
        {
          title: translate("Net Banking (HDFC/ICIC)"),
          value: `${decryptedWalletCharges.data.netbanking}%`,
        },
        {
          title: translate("Net Banking (AXIS/SBI/KOTAK)"),
          value: `${decryptedWalletCharges.data.axis}%`,
        },
        {
          title: translate("Net Banking (Others Bank)"),
          value: `${decryptedWalletCharges.data.others}%`,
        },
        {
          title: translate("Wallet"),
          value: `${decryptedWalletCharges.data.wallet}%`,
        },
      ]
    : [];

  return (
    <View style={styles.main}>
      <AppBarSecond title={""} />
      <View style={[styles.headerview, { backgroundColor: color1 }]}>
        <View style={styles.headertop}>
          <View style={styles.imgview}>
            <WalletSvg size={wScale(30)} />
          </View>
          <View style={{ paddingTop: 8, flex: 1 }}>
            <View style={styles.headertop}>
              <Text style={styles.balanceValue}>
                {translate("Wallet Balance")}
              </Text>
              <TouchableOpacity
                style={[
                  styles.dropbtn,
                  height ? { transform: [{ rotate: "180deg" }] } : null,
                ]}
                onPress={() => handlePress()}
              >
                <OnelineDropdownSvg />
              </TouchableOpacity>
              <Text style={styles.total}>
                ₹{(balanceInfo?.posremain || 0) + (balanceInfo?.remainbal || 0)}
              </Text>
            </View>
            {height ? (
              <View>
                <View style={styles.balanceCard}>
                  <Text style={styles.balanceTitle}>
                    {translate("Pos Balance")}
                  </Text>
                  <Text style={styles.balanceValue}>
                    ₹{balanceInfo?.posremain}
                  </Text>
                </View>
                <View style={styles.balanceCard}>
                  <Text style={styles.balanceTitle}>{"Main Wallet"}</Text>
                  <Text style={styles.balanceValue}>
                    ₹{balanceInfo?.remainbal}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View style={styles.container}>
        <View>
          <AmountDropdown
            label=""
            value={Mode}
            options={amountOptions}
            onSelect={(val) => {
              setMode(val);
              handleModeChange(val);
            }}
          />

          <FlotingInput
            keyboardType="number-pad"
            maxLength={6}
            label={"Enter Amount"}
            value={amount}
            editable={editMode}
            // disable={Mode==="Mode Of Payment" ? true : false}
            onChangeTextCallback={(text) => {
              setAmount(String(text));
              setTexterror(true);

              if (text !== "") {
                getCharges(text);
              }
              if (amount.length === 0) {
                setTexterror(true);
              } else {
                setTexterror(false);
              }
            }}
            autoFocus={texterror}
          />

          {texterror ? (
            <Text style={styles.errortext}>
              {translate("key_pleaseent_69")}
            </Text>
          ) : null}
          <View>
            <DynamicButton
              styleoveride={{ marginTop: hScale(8) }}
              onPress={() => {
                //   upiCharges();
                onpressbtn();

                // if (amount.length === 0) {
                //   'Please Enter Amount'
                // } else { onpressbtn() }
              }}
              title={translate("Add Money")}
            />
          </View>
        </View>
        <View>
          <Text style={styles.chargesTitle}>
            {translate("Charges Information")}
          </Text>
        </View>
        <ScrollView>
          {isload ? (
            <ActivityIndicator size={"large"} />
          ) : (
            <View style={styles.chargesContainer}>
              {/* <View>
              <FlatList
                data={charges}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={[styles.chargeItem, { backgroundColor: color1 }]}>
                    <View>
                      <Text style={styles.chargevalue}>{item[0]}</Text>
                      <Text style={styles.chargeText}>{translate("Net_Received")}</Text>
                      <Text style={styles.chargevalue}>{item[1].netrecived}</Text>
                    </View>
                    <View style={styles.rightcontainer}>

                      <Text style={styles.chargeText}>{translate("Total")}</Text>
                      <Text style={styles.chargevalue}>{item[1].total}</Text>
                    </View>
                  </View>
                )}
              />
            </View> */}

              <View style={[{ backgroundColor: color1 }]}>
                {upich && (
                  <View style={[styles.chargeItemrow]}>
                    <Text style={styles.chargeTitle}>
                      {translate("Upi Charge in (%)")}
                    </Text>
                    <Text style={styles.chargeValue}>
                      % {upich["Charge %"]}
                    </Text>
                  </View>
                )}
                {chargeData.length > 0 && (
                  <FlashList
                    data={chargeData}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                      <View style={[styles.chargeItemrow]}>
                        <Text style={styles.chargeTitle}>{item.title}</Text>
                        <Text style={styles.chargeValue}>{item.value}</Text>
                      </View>
                    )}
                    estimatedItemSize={50}
                  />
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: colors.white,
  },
  container: {
    backgroundColor: colors.white,
    paddingHorizontal: wScale(10),
    //paddingTop: hScale(5),
    flex: 1,
  },
  balanceCard: {
    alignItems: "center",
    marginTop: hScale(5),
    flexDirection: "row",
    justifyContent: "space-between",
  },
  balanceTitle: {
    fontSize: wScale(16),
    marginBottom: hScale(5),
    color: colors.black75,
  },
  balanceValue: {
    fontSize: wScale(20),
    fontWeight: "bold",
    color: colors.black,
  },
  total: {
    fontSize: wScale(22),
    fontWeight: "bold",
    color: colors.black,
    flex: 1,
    textAlign: "right",
  },
  chargesContainer: {
    borderRadius: 5,
  },
  chargesTitle: {
    fontSize: FontSize.large,
    fontWeight: "bold",
    color: colors.black_primary_blur,
    paddingTop: hScale(10),
    paddingBottom: wScale(10),
  },
  chargeItem: {
    marginBottom: hScale(15),
    paddingHorizontal: wScale(10),
    borderRadius: 5,
    paddingVertical: hScale(5),
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chargeText: {
    fontSize: FontSize.xSmall,
    color: colors.black75,
  },
  chargevalue: {
    fontSize: FontSize.xSmall,
    color: colors.black,
    fontWeight: "bold",
    paddingBottom: hScale(8),
    textTransform: "uppercase",
  },
  errortext: {
    color: colors.red_deactivated,
    fontSize: FontSize.regular,
    marginTop: hScale(-10),
    marginBottom: hScale(15),
    fontFamily: FontFamily.italic,
  },
  headerview: {
    paddingTop: hScale(20),
    marginBottom: hScale(15),
    paddingHorizontal: wScale(15),
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    paddingBottom: hScale(20),
  },
  headertop: {
    flexDirection: "row",
  },
  imgview: {
    borderWidth: wScale(1),
    borderRadius: 30,
    marginRight: wScale(15),
    borderColor: colors.black75,
    height: wScale(45),
    width: wScale(45),
    alignItems: "center",
    justifyContent: "center",
  },
  dropbtn: {
    marginLeft: wScale(5),
    paddingHorizontal: 10,
  },
  rightcontainer: {
    flexDirection: "row",
  },

  chargeItemrow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: hScale(5),
    borderBottomWidth: 1,
    borderBottomColor: colors.black75,
    paddingHorizontal: wScale(10),
    borderStyle: "dotted",
    marginHorizontal: wScale(8),
  },

  chargeTitle: {
    fontSize: FontSize.regular,
    color: colors.black,
  },
  chargeValue: {
    fontSize: FontSize.regular,
    color: colors.black,
    fontWeight: "bold",
  },
});

export default WalletScreen;
