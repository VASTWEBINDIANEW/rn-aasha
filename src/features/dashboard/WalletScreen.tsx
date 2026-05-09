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
import AllBalance from "../../components/AllBalance";
import ShowLoaderBtn from "../../components/ShowLoaderBtn";
import AddMoneyPayResponse from "../../components/AddMoneyPayResponse";
import { log } from "console";
import { translate } from "../../utils/languageUtils/I18n";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

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
  const [name, setname] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [paymentMode, setPaymentMode] = useState("");

  const [chargeType, setChargeType] = useState("");

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
        al;
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
      setChargeType("");
    }, []),
  );

  const gatewaytype = useCallback(
    async (type) => {
      console.log("type", type);

      setErrorText(""); // clear old error

      try {
        const url = `${APP_URLS.Chkpayu}type=${type}`;
        const data = await post({ url });

        console.log("Gateway Response →", data);

        const resp = data?.Response;
        const msg = data?.Message;

        // SUCCESS
        if (resp === "Success") {
          const successMsg = msg || `${type} ${translate("status is OK.")}`;

          ToastAndroid.showWithGravity(
            successMsg,
            ToastAndroid.LONG,
            ToastAndroid.BOTTOM,
          );

          Alert.alert(successMsg);
          seteditMode(true);
          return;
        }

        // FAIL → show EXACT API message (no custom text)
        const errorMsg = msg || translate("Something went wrong!");

        setErrorText(errorMsg); // show in UI text
        // Alert.alert("Warning", errorMsg);
        seteditMode(false);
        setAmount("");
      } catch (error) {
        console.error("Gateway Error:", error);

        const errMsg = translate(
          "key_networker_55",
        );

        setErrorText(errMsg);
        seteditMode(false);
        setAmount("");
        Alert.alert(translate("Error"), errMsg);
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
            `Transaction failed. Reason: ${errorMsg}`,
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
        console.error("Error in Apitransitionsencrypt:", error.message);
        Alert.alert(
          translate("Error"),
          translate(`Something went wrong: ${error.message}`),
          [{ text: translate("OK"), onPress: () => console.log("OK Pressed") }],
          { cancelable: false },
        );
      }
    },
    [amount, navigation, latitude, longitude],
  );

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
      Alert.alert(response?.msg || "QR status is not OK, try again.");
      console.log("QR status is NOT OK.");
    } catch (error) {
      console.error("Error fetching QR status:", error);
      seteditMode(false);
      Alert.alert(translate("Something went wrong!"));
    }
  }, []);

  const checkUPIStatus = useCallback(async (amount) => {
    // Reset previous error
    setErrorText("");

    try {
      const selfURL = `${APP_URLS.selfupiintent}`;
      const qrURL = `${APP_URLS.UPIQR}?amount=${amount}`;

      const [selfRes, qrRes] = await Promise.all([
        post({ url: selfURL }),
        post({ url: qrURL }),
      ]);

      console.log("SELF Response →", selfRes);
      console.log("QR Response →", qrRes);

      // Extract safely
      const {
        status: selfStatus,
        name: selfName,
        msg: selfMsg,
      } = selfRes || {};

      const { status: qrStatus, qrstatus, msg: qrMsg } = qrRes || {};

      // Check Success
      const isSelfSuccess = selfStatus === true && selfName === "VASTBAZAAR";

      const isQRSuccess = qrStatus === true && qrstatus === "OK";

      // Name update if available
      if (selfName) setname(selfName);

      // Edit mode logic
      if (isSelfSuccess || isQRSuccess) {
        seteditMode(true);
      } else {
        seteditMode(false);
      }

      // 🔥 BUILD ERROR MESSAGE FOR UI
      let err = "";

      if (!isSelfSuccess) {
        setErrorText(
          selfMsg?.trim()
            ? selfMsg
            : translate("Self UPI status failed with no message."),
        );
      } else if (!isQRSuccess) {
        setErrorText(
          qrMsg?.trim()
            ? qrMsg
            : translate("QR UPI status failed with no message."),
        );
      }

      setAmount("");
    } catch (error) {
      console.error("Error fetching UPI status:", error);

      seteditMode(false);
      setAmount("");
      setErrorText(
        translate("key_something_93"),
      );
    }
  }, []);

  const getData = useCallback(async () => {
    try {
      // const userInfo = await get({ url: APP_URLS.getUserInfo });

      const wallet = await get({
        url: "Common/api/data/Wallet_ALL_Charges_Show",
      });

      console.log("RAW WALLET RESPONSE:", wallet);

      const walletCharges = JSON.parse(
        decryptData(wallet.kkkk, wallet.vvvv, wallet.WalletCharges),
      );

      console.log("DECRYPTED WALLET CHARGES:", walletCharges);

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
  // 1. Validation check
  if (!amount || amount.trim().length === 0) {
    ToastAndroid.show(
      translate("Please enter an amount"),
      ToastAndroid.SHORT,
    );
    return; // Function ko yahi rok do
  }

  // 2. Navigation logic
  if (Mode === "Request to Admin") {
    navigation.navigate("ReqToAdmin", { amount, type: "Admin" });
  } 
  else if (Mode === "Request to Distributor") {
    navigation.navigate("ReqToAdmin", { amount, type: "Distributor" });
  } 
  else {
    // Default navigation agar upar wale modes match nahi karte
    navigation.navigate("AddMoneyOptions", {
      amount,
      jsonData: charges,
      paymentMode,
      chargeType,
      from: "abc",
    });
  }

  // 3. Reset state
  setAmount("");
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
    setErrorText(""); // <-- reset error
    setTexterror(false);

    console.log("Selected Mode:", mode);

    if (mode === "UPI") {
      checkUPIStatus(amount);
      setPaymentMode("UPI");
      setChargeType("UPI");
    } else if (mode === "Net Banking") {
      gatewaytype("NB");
      setPaymentMode("Net Banking");
      setChargeType("NetBanking");
    } else if (mode === "Debit Card") {
      gatewaytype("DC");
      setPaymentMode("Debit Card");
      setChargeType("Debit_Card");
    } else if (mode === "Credit Card") {
      gatewaytype("CC");
      setPaymentMode("Credit Card");
      setChargeType("Credit_Card");
    } else if (mode === "Request to Admin") {
      // navigation.navigate("ReqToAdmin", { amount, type: 'Admin' });

      setPaymentMode("Request to Admin");
      setChargeType("Request to Admin");
      seteditMode(true);
    } else if (
      mode === "Request to Distributor" ||
      mode === "Request to Master"
    ) {
      //navigation.navigate("ReqToAdmin", { amount, type: 'Distributor' });

      setPaymentMode("Request to Distributor");
      setChargeType("Request to Admin");
      seteditMode(true);
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
    "Request to Master",
    "Request to Distributor",
    "Request to Admin",
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

  const [chargesData, setChargesData] = useState([
    { method: translate("UPI"), min: "", variable: "" },
    { method: translate("Debit Card Up to 2000"), min: "", variable: "" },
    { method: translate("Debit Card Above 2000"), min: "", variable: "" },
    { method: translate("Credit Card"), min: "", variable: "" },
    { method: translate("NetBanking"), min: "", variable: "" },
  ]);

  useEffect(() => {
    // 1. Safe check for the top-level data objects
    if (!decryptedWalletCharges?.data || !decryptedWalletCharges?.dataUPI)
      return;

    const api = decryptedWalletCharges.data;
    const apiUPI = decryptedWalletCharges.dataUPI;

    const updatedChargesData = chargesData.map((item) => {
      switch (item.method) {
        case "UPI":
          return {
            ...item,
            // Use ?? to provide a fallback value if the API property is missing
            min: apiUPI?.min === 0 ? 0 : (apiUPI?.min ?? 0),
            variable: apiUPI?.Charge ?? 0,
          };

        case "Debit Card Up to 2000":
          return { ...item, min: "N/A", variable: api?.debitupto2000 ?? 0 };

        case "Debit Card Above 2000":
          return { ...item, min: "N/A", variable: api?.debitabove2000 ?? 0 };

        case "Credit Card":
          return { ...item, min: "N/A", variable: api?.creditcard ?? 0 };

        case "NetBanking":
          return { ...item, min: "N/A", variable: api?.netbanking ?? 0 };

        default:
          return item;
      }
    });

    setChargesData(updatedChargesData);
  }, [decryptedWalletCharges]);

  return (
    <View style={styles.main}>
      <AppBarSecond title={"wallet"} />

      <AllBalance />
<KeyboardAwareScrollView
  style={{ flex: 1 }}
  contentContainerStyle={{ flexGrow: 1, paddingBottom: 200 }}
  keyboardShouldPersistTaps="handled"
  enableOnAndroid={true}
  extraScrollHeight={150}
>   
       {/* <AddMoneyPayResponse/> */}
        <View style={styles.container}>
          <View>
            <AmountDropdown
              value={Mode}
              options={amountOptions}
              onSelect={(val) => {
                setMode(val);
                handleModeChange(val);
              }}
            />
            {errorText ? (
              <Text style={styles.errortext}>⚠️ {errorText}</Text>
            ) : null}

            <FlotingInput
              keyboardType="number-pad"
              maxLength={6}
              label={"Enter Amount"}
              value={amount}
              editable={editMode}
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

            {IsDealer && texterror ? (
              <Text style={styles.errortext}>
                {translate("key_pleaseent_71")}
              </Text>
            ) : null}
            {texterror ? (
              <Text style={styles.errortext}>
                {translate("key_pleaseent_70")}
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
                title={isload ? <ShowLoaderBtn size={"large"} /> : "Add Money"}
              />
            </View>
          </View>
          {/* <View >
          <Text style={styles.chargesTitle}>{translate("Charges_Information")}</Text>
        </View> */}
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

              {/* <View style={[{ backgroundColor: color1 }]}>
              {upich && (
                <View style={[styles.chargeItemrow,]}>
                  <Text style={styles.chargeTitle}>{translate("Upi_Charge_in")}</Text>
                  <Text style={styles.chargeValue}>% {upich["Charge %"]}</Text>
                </View>
              )}
              {chargeData.length > 0 && (
                <FlashList
                  data={chargeData}
                  keyExtractor={(item, index) => index.toString()}
                  renderItem={({ item }) => (

                    <View style={[styles.chargeItemrow,]}>
                      <Text style={styles.chargeTitle}>{item.title}</Text>
                      <Text style={styles.chargeValue}>{item.value}</Text>
                    </View>
                  )}
                  estimatedItemSize={50}
                />
              )}
            </View> */}
            </View>
          )}
          <View style={styles.chargeContainer}>
            {/* Title */}
            <Text style={styles.title}>
              {translate("Following Charges are Applicable")}
            </Text>

            {/* Header Row */}
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, { flex: 2 }]}>
                {translate("Payment Method")}
              </Text>
              <Text style={[styles.headerCell, { flex: 1 }]}>
                {translate("Min Charge")}
              </Text>
              <Text style={[styles.headerCell, { flex: 1 }]}>
                {translate("Charges(%)")}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <FlashList
                data={chargesData}
                estimatedItemSize={50}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => (
                  <View style={styles.row}>
                    <Text
                      style={[
                        styles.cell,
                        styles.paymentCell,
                        { backgroundColor: `${colorConfig.secondaryColor}99` },
                      ]}
                    >
                      {item.method}
                    </Text>

                    <Text
                      style={[
                        styles.cell,
                        styles.minCell,
                        { backgroundColor: `${colorConfig.secondaryColor}80` },
                      ]}
                    >
                      {item.min}
                    </Text>

                    <Text
                      style={[
                        styles.cell,
                        styles.variableCell,
                        {
                          backgroundColor: `${colorConfig.secondaryColor}66`,
                          paddingBottom: 0,
                          borderWidth: 0,
                        },
                      ]}
                    >
                      {item.variable}
                    </Text>
                  </View>
                )}
              />
            </View>
          </View>
        </View>

        <View style={{paddingBottom:100}}/>
      </KeyboardAwareScrollView>
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
    flex: 1,
    marginTop: hScale(15),
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
    borderRadius: wScale(5),
  },

  chargesTitle: {
    fontSize: wScale(FontSize.large),
    fontWeight: "bold",
    color: colors.black_primary_blur,
    paddingTop: hScale(10),
    paddingBottom: hScale(10),
  },

  chargeItem: {
    marginBottom: hScale(15),
    paddingHorizontal: wScale(10),
    borderRadius: wScale(5),
    paddingVertical: hScale(5),
    flexDirection: "row",
    justifyContent: "space-between",
  },

  chargeText: {
    fontSize: wScale(FontSize.xSmall),
    color: colors.black75,
  },

  chargevalue: {
    fontSize: wScale(FontSize.xSmall),
    color: colors.black,
    fontWeight: "bold",
    paddingBottom: hScale(8),
    textTransform: "uppercase",
  },

  errortext: {
    color: colors.red_deactivated,
    fontSize: wScale(FontSize.regular),
    marginTop: hScale(-10),
    marginBottom: hScale(15),
    fontFamily: FontFamily.italic,
  },

  headerview: {
    paddingTop: hScale(20),
    marginBottom: hScale(15),
    paddingHorizontal: wScale(15),
    borderBottomLeftRadius: wScale(15),
    borderBottomRightRadius: wScale(15),
    paddingBottom: hScale(20),
  },

  headertop: {
    flexDirection: "row",
  },

  imgview: {
    borderWidth: wScale(1),
    borderRadius: wScale(30),
    marginRight: wScale(15),
    borderColor: colors.black75,
    height: wScale(45),
    width: wScale(45),
    alignItems: "center",
    justifyContent: "center",
  },

  dropbtn: {
    marginLeft: wScale(5),
    paddingHorizontal: wScale(10),
  },

  rightcontainer: {
    flexDirection: "row",
  },

  chargeItemrow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: hScale(5),
    borderBottomWidth: wScale(1),
    borderBottomColor: colors.black75,
    paddingHorizontal: wScale(10),
    borderStyle: "dotted",
    marginHorizontal: wScale(8),
  },

  chargeTitle: {
    fontSize: wScale(FontSize.regular),
    color: colors.black,
  },

  chargeValue: {
    fontSize: wScale(FontSize.regular),
    color: colors.black,
    fontWeight: "bold",
  },

  chargeContainer: {
    backgroundColor: "#ddd",
    borderRadius: wScale(10),
    paddingHorizontal: wScale(5),
    elevation: 2,
    flex: 1,
    paddingBottom: hScale(10),
    marginTop: hScale(20),
  },

  title: {
    fontSize: wScale(18),
    fontWeight: "600",
    textAlign: "center",
    marginBottom: hScale(5),
    color: "#000",
    marginTop: hScale(5),
  },

  headerRow: {
    flexDirection: "row",
    backgroundColor: "#2d2d3a",
    borderTopLeftRadius: wScale(8),
    borderTopRightRadius: wScale(8),
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: hScale(5),
  },

  headerCell: {
    color: "#fff",
    fontSize: wScale(14),
    textAlign: "center",
  },

  row: {
    flexDirection: "row",
    minHeight: hScale(45),
  },

  cell: {
    paddingVertical: hScale(10),
    paddingHorizontal: wScale(8),
    fontSize: wScale(14),
    color: "#fff",
    textAlignVertical: "center",
    borderBottomWidth: wScale(0.5),
    borderColor: "#ddd",
  },

  paymentCell: {
    flex: 2,
    backgroundColor: "#e3e7f1",
  },

  minCell: {
    flex: 1,
    backgroundColor: "#fffce2",
    textAlign: "center",
  },

  variableCell: {
    flex: 1,
    backgroundColor: "#ffe9e9",
    textAlign: "center",
  },
});

export default WalletScreen;
