import React, { useCallback, useEffect, useMemo, useState } from "react";
import { BottomSheet, Image } from "@rneui/themed";
import LottieView from "lottie-react-native";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  NativeModules,
  PermissionsAndroid,
  Platform,
  ScrollView,
  TextInput,
  ToastAndroid,
} from "react-native";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { APP_URLS } from "./../../utils/network/urls";
import useAxiosHook from "./../../utils/network/AxiosClient";
import { translate } from "../../utils/languageUtils/I18n";
import { encrypt } from "../../utils/encryptionUtils";
import { SCREEN_HEIGHT, hScale, wScale } from "../../utils/styles/dimensions";
import { useDeviceInfoHook } from "../../utils/hooks/useDeviceInfoHook";
import { useSelector } from "react-redux";
import DynamicButton from "../drawer/button/DynamicButton";
import FlotingInput from "../drawer/securityPages/FlotingInput";
import AppBarSecond from "../drawer/headerAppbar/AppBarSecond";
import TabBar from "./TabView/TabBarView";
import DropdownSvg from "../../utils/svgUtils/DropdownSvg";
import { SvgXml } from "react-native-svg";
import { RootState } from "../../reduxUtils/store";
import { FontSize, colors } from "../../utils/styles/theme";
// import Contacts, { Contact } from "react-native-contacts";
import { FlashList } from "@shopify/flash-list";
import ClosseModalSvg from "../drawer/svgimgcomponents/ClosseModal";
import { Tab, TabView, Text } from "@rneui/themed";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import {
  ALERT_TYPE,
  AlertNotificationRoot,
  Dialog,
} from "react-native-alert-notification";
import { openSettings } from "react-native-permissions";
import { useNavigation } from "../../utils/navigation/NavigationService";
import SearchIcon from "../drawer/svgimgcomponents/Searchicon";
import Avatar from "../../components/Avatar";
import OperatorBottomSheet from "../../components/OperatorBottomSheet";
import Rechargeconfirm from "../../components/Rechargeconfirm";
import RecentHistory from "../../components/RecentHistoryBottomSheet";
import NoDatafound from "../drawer/svgimgcomponents/Nodatafound";
import ClosseModalSvg2 from "../drawer/svgimgcomponents/ClosseModal2";
import ShowLoader from "../../components/ShowLoder";
import { useLocationHook } from "../../hooks/useLocationHook";

const dropdown = `<svg xmlns="http://www.w3.org/2000/svg"  version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="26" height="26" x="0" y="0" viewBox="0 0 128 128" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path fill="#000000" fill-rule="evenodd" d="M20.586 47.836a2 2 0 0 0 0 2.828l39.879 39.879a5 5 0 0 0 7.07 0l39.879-39.879a2 2 0 0 0-2.828-2.828L64.707 87.714a1 1 0 0 1-1.414 0L23.414 47.836a2 2 0 0 0-2.828 0z" clip-rule="evenodd" opacity="1" data-original="#000000" class=""></path></g></svg>`;
const RechargeScreen = () => {
  const [historylist, setHistorylist] = useState([]);
  const [reqTime, setReqTime] = useState("");
  const [reqId, setReqId] = useState("");
  const [idno, setIdno] = useState("");
  const [isLoading, setisLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [isPlanLoading, setIsPlanLoading] = useState(false);
  const [autoplay, setAutoplay] = useState(false);
  const [selectedButton, setSelectedButton] = useState(
    translate("RechargeScreen.Prepaid"),
  );
  const [mobileNumber, setMobileNumber] = useState("");
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [recharegepin, setrecharegepin] = useState(false);

  const [Amount, setAmount] = useState("");
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [isViewPlans, setViewPlans] = useState(true);
  const {
    latitude,
    longitude,
    getLatLongValue,
    checkLocationPermissionStatus,
    getLocation,
    isLocationPermissionGranted,
  } = useLocationHook();
  const [isOperatorModalVisible, setOperatorModalVisible] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isStateModalVisible, setStateModalVisible] = useState(false);
  const [operator, setOperator] = useState(
    ("RechargeScreen.Select Operator & Circle"),
  );
  const [state, setState] = useState(translate("Select Your Circle"));
  const [stateslist, setstateslist] = useState([]);
  const [ispost, setispost] = useState(true);
  const [operators, setOperatorlist] = useState([]);
  const [operatorcode, setOperatorcode] = useState("");
  const [planListData, setPlanListData] = useState([]);
  const [planListData2, setPlanListData2] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isAmountFocused, setIsAmountFocused] = useState(false);
  const [rechargePlans, setRechargePlans] = useState([]);
  const navigation = useNavigation<any>();
  const [isplanview, setIsplanview] = useState(false);
  const [index, setIndex] = React.useState(0);
  const [circle, setCircle] = useState("");
  const [isrecent, setIsrecent] = useState(false);
  const {
    getNetworkCarrier,
    getMobileDeviceId,
    getSimPhoneNumber,
    getMobileIp,
  } = useDeviceInfoHook();
  const { userId } = useSelector((state: RootState) => state.userInfo);
  const { colorConfig, Loc_Data } = useSelector(
    (state: RootState) => state.userInfo,
  );
  const color1 = `${colorConfig.secondaryColor}20`;
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredData, setFilteredData] = useState<Contact[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedOption, setSelectedOption] = useState(
    translate("RechargeScreen.Prepaid"),
  );
  const [rechType, setRechtype] = useState("....");
  const [path, setpath] = useState("");
  const intervalRef = React.useRef();
  const isTimedOutRef = React.useRef();
  const isOperatorFetched = React.useRef();
  const color2 = `${colorConfig.primaryColor}40`;
  const color3 = `${colorConfig.primaryColor}10`;
  const [loading, setLoading] = useState(true);
  const { get, post } = useAxiosHook();
const { ContactPicker } = NativeModules;


  async function stateList() {
    try {
      const response = await get({ url: `${APP_URLS.getStates}` });
      setstateslist(response);
      console.log(response);
    } catch (error) {
      console.error("Error fetching  state list:", error.message);
      throw error;
    } finally {
    }
  }
  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardVisible(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [setKeyboardVisible]);

  useEffect(() => {


    console.log(userId);
    console.log(
      latitude,
      longitude,
      getLatLongValue(),
      checkLocationPermissionStatus(),
      getLocation(),
      isLocationPermissionGranted,
    );
    console.log("===================");

    getopertaorlist("Prepaid");
    stateList();
    setSelectedOption(translate("RechargeScreen.Prepaid"));
    recenttransactions();
  }, [latitude, longitude]);
  const recenttransactions = async () => {
    try {
      const url = `${APP_URLS.recenttransaction}pageindex=1&pagesize=5&retailerid=${userId}&fromdate=${formattedDate}&todate=${formattedDate}&role=Retailer&rechargeNo=ALL&status=ALL&OperatorName=ALL&portno=ALL`;
      console.log(url, "url-*/-*/-*/-*/-*/*/-*/");
      const response = await get({ url: url });
      setHistorylist(response);
      setReqTime(response[0]["Reqesttime"]);
      setReqId(response[0]["Request_ID"]);
      setIdno(response[0]["Idno"]);
      console.log(
        "id1111111111111111111111111111111111111111111111111111111",
        response[0]["Idno"],
      );
    } catch (error) {
      console.log(error);
    }
  };

  const Rechargepin = async () => {
    try {
      const url = `${APP_URLS.RechargePin}`;
      console.log(url);
      const response = await post({ url: url });
      console.log(
        "id1111111111111111111111111111111111111111111111111111111",
        response,
      );
      setrecharegepin(response);
    } catch (e) {
      console.log(e);
    }
  };

  const validateMobileNumber = (number) => {
    const regex = /^[0-9]{10}$/; // Regular expression for 10-digit numbers
    const containsSpecialCharacters = /[!@#$%^&*(),.?":{}|<>]/.test(number);
    const containsAlphabets = /[a-zA-Z]/.test(number);
    const containsSpaces = /\s/.test(number);

    if (containsSpecialCharacters || containsAlphabets || containsSpaces) {
      return false;
    }
    return regex.test(number);
  };
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
  const day = ("0" + currentDate.getDate()).slice(-2);

  const formattedDate = `${year}-${month}-${day}`;

  async function getopertaorlist(op: any) {
    try {
      const url =  `${APP_URLS.getDthOperator}${op}`;
      const response = await get({
        url: url,
      });
console.log("operator list", response);
   
      const res = response.myprop2Items;
      console.log(res,'-908907890908908909089890');
      setOperatorlist(res);
      if (ispost) {
        setSelectedOption(translate("RechargeScreen.Prepaid"));
      } else {
        setSelectedOption(translate("RechargeScreen.prepaid"));
      }
    } catch (error) { }
  }

  const getPlans = useCallback(async () => {
    try {
      setPlanListData([]);
      setRechargePlans([]);
      setIndex(0);

      // if (operator === 'Select Operator & Circle' || !circle) return;

      setLoading(true);
      setIsPlanLoading(true);

      if (APP_URLS.AppName !== "World Pay One") {
        setShowLoader(false);
      }

      console.log("**OP", operator);
      console.log("**Circle", circle);

      const rechargePlansUrl = `${APP_URLS.getRechargePlans}optname=${operator}&circlename=${circle}&type=mobile`;
      const bestPlansUrl = `${APP_URLS.bestplanOffers}optname=${operator === "BSNL" ? "operator" : operator}&mobileno=${mobileNumber}`;

      console.log(rechargePlansUrl);
      console.log(bestPlansUrl);

      const [rechargePlansRes, bestPlansRes] = await Promise.all([
        post({ url: rechargePlansUrl }),
        post({ url: bestPlansUrl }),
      ]);
      Keyboard.dismiss();

      setShowLoader(false);

      console.log("Recharge Plans:", rechargePlansRes);
      console.log("Best Plans:", bestPlansRes);

      let finalPlans = [...(rechargePlansRes || [])];

      console.log("YYYYYYYYYYYYYY", finalPlans);

      if (
        bestPlansRes?.status !== "Failed" &&
        bestPlansRes?.Response?.length > 0
      ) {
        const bestPlansSection = {
          key: "Best Plans Offers",
          value: {
            Response: bestPlansRes.Response,
          },
        };
        finalPlans.unshift(bestPlansSection);
        console.log("Best Plans:", finalPlans);
      } else {
        console.log("No Best Plans available or request failed");
      }

      setRechargePlans(finalPlans);
      setPlanListData(finalPlans?.[0]?.value?.Response || []);
    } catch (error) {
      console.log("Error fetching plans:", error);
    } finally {
      setLoading(false);
      setIsPlanLoading(false);
    }
  }, [operator, circle, post, mobileNumber]);

  useEffect(() => {
    Rechargepin();
  }, []);

  const getOperator = async (mo: any) => {
    isOperatorFetched.current = false;
    intervalRef.current = setInterval(() => {
      if (isOperatorFetched.current) {
        clearInterval(intervalRef.current);
        return;
      }

      setisLoading(false);
      setOperatorModalVisible(true);
      isTimedOutRef.current = true;
      clearInterval(intervalRef.current);
    }, 3000);
    console.log("gijhfgkjfgjfgjdgj");
    try {
      const url = `${APP_URLS.mobileRecCircle}${mo}`;
      const response = await post({
        url: url,
      });

      const res = response.Response;

      console.log("**RES123*************************************", response);
      if (response.status !== "Failed") {
        if (!response.optcode) {
          return;
        }
        setispost(res.postpaid);
        isOperatorFetched.current = true;
        setCircle(res.Circle);
        setpath(response["path"]);
        setOperator(
          !res.Operator
            ? translate("RechargeScreen.elect Operator & Circle")
            : res.Operator,
        );
        //  checkOperator(res.Operator);
        setisLoading(false);
        setOperatorcode(response.optcode);

        console.log(res.optcode);
        setState(!res.Circle ? "" : `${res.Circle}`);
        if (ispost) {
          setSelectedOption(translate("RechargeScreen.Postpaid"));
        } else {
          setSelectedOption(translate("RechargeScreen.prepaid"));
        }
      } else {
        clearInterval(intervalRef.current);
        if (isTimedOutRef.current === true) {
          isTimedOutRef.current = false;
          return;
        }
        setOperatorcode(response.optcode);
        setisLoading(false);
        setOperator(
          response.Operator
            ? response.Operator
            : translate("RechargeScreen.elect Operator & Circle"),
        );
        setCircle(response.Circle);

        if (!circle) {
          setOperatorModalVisible(true);
        }
        console.log("jgfgkj");
        getPlans();
      }
    } catch (error) {
      isOperatorFetched.current = false;
      setisLoading(false);
      // setOperatorModalVisible(true);
    }
  };
  const requestContactPermission = useCallback(async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: translate("RechargeScreen.Contact Permission"),
          message: translate(
            "RechargeScreen.This app needs access to your contacts to use the number from contacts.",
          ),
          buttonPositive: translate("RechargeScreen.OK"),
        },
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {

openContactPicker()
        // Contacts.getAll()
        //   .then((contacts) => {
        //     setContacts(
        //       contacts.filter((contact) => contact.phoneNumbers.length > 0),
        //     );
        //     setFilteredData(
        //       contacts.filter((contact) => contact.phoneNumbers.length > 0),
        //     );

        //     setShowContactModal(true);
        //   })
        //   .catch((e) => {
        //     console.log(e);
        //   });
      } else {
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: translate("RechargeScreen.Permission Required"),
          textBody: translate(
            "RechargeScreen.Please grant the contact permission from settings.",
          ),
          button: translate("RechargeScreen.OK"),
          onPressButton: () => {
            Dialog.hide();
            openSettings().catch(() => console.warn("cannot open settings"));
          },
        });
      }
    } catch (err) {
      console.warn(err);
    }
  }, []);
  const validateFields = () => {
    if (!mobileNumber) {
      ToastAndroid.showWithGravity(
        translate("RechargeScreen.Please Enter Mobile Number"),
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else if (mobileNumber.length < 10) {
      ToastAndroid.showWithGravity(
        translate("RechargeScreen.Please Enter a 10 Digit Mobile Number"),
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else if (operator === "Operator") {
      ToastAndroid.showWithGravity(
        translate("RechargeScreen.Please Select an Operator"),
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else if (state === "Select Your Circle") {
      ToastAndroid.showWithGravity(
        translate("RechargeScreen.Please Select Your Circle"),
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else if (!Amount || Amount === translate("RechargeScreen.Enter Amount")) {
      ToastAndroid.showWithGravity(
        translate("RechargeScreen.Please Enter the Recharge Amount"),
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
    } else {
      setIsDetail(true);
      updateProceedButtonVisibility();
    }
  };
const openContactPicker = useCallback(async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS
    );

    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      console.log("Contact permission denied");
      return;
    }

    const result = await ContactPicker.pickContact();

    if (!result) return;

    const rawPhone = result?.phone;
    if (!rawPhone) return;

    let phone = rawPhone.replace(/[^0-9+]/g, "");
    phone = phone.replace(/^(\+91|91)/, "").replace(/\D/g, "");

    if (phone.length < 10) return;

    const finalPhone = phone.slice(-10);

    setMobileNumber(finalPhone);
    Keyboard.dismiss();
    setIsFocused(true);
    setisLoading(true);

    await getOperator(finalPhone);

  } catch (error: any) {
    // Native module sends code "CANCELLED" on back-press / cancel
    if (error?.code === "CANCELLED" || error?.code === "IN_PROGRESS") {
      return;
    }
    console.log("Picker Error:", error);
    setisLoading(false); // reset on unexpected errors
  }
}, [getOperator]);
  useEffect(() => {
    if (contacts) {
      const filtered = contacts.filter((item) =>
        item.displayName.toLowerCase().includes(searchText.toLowerCase()),
      );
      if (searchText === "") {
        return setFilteredData(contacts);
      }

      setFilteredData(filtered);
    }
  }, [searchText]);

  const toggleStateModal = () => {
    setStateModalVisible(!isStateModalVisible);
  };

  const selectOperator = useCallback(
    (selectedOperator, isState = false) => {
      setOperator(selectedOperator);
      getPlans();
    },
    [state, operator, circle, post],
  );



  const updateProceedButtonVisibility = () => {
    const isValid =
      mobileNumber.length >= 10 &&
      operator !== "Select eScreen.Operator" &&
      state !== "Select Your Circle" &&
      Amount !== "" &&
      Amount !== "Enter Amount";
    if (isValid) {
      setisDetailButton(true);
      console.log("y");
    } else {
      setisDetailButton(false);
      console.log("N");
    }
  };
  const [isDetailButton, setisDetailButton] = useState(false);
  useEffect(() => {
    setRechtype(translate("RechargeScreen.Prepaid"));
  }, []);
  const [isDetail, setIsDetail] = useState(false);


const onRechargePress = useCallback(async () => {
  console.log(
    mobileNumber, operatorcode, Loc_Data, latitude, longitude,
    '++++++++', Loc_Data?.latitude, Loc_Data?.longitude
  );

  setIsDetail(false);
  setShowLoader(true);

  try {
    // Collect device and network info
    const Model = await getMobileDeviceId();
    const mobileNetwork = await getNetworkCarrier();
    const ip = await getMobileIp();

    // Encrypt sensitive details
    const encryption = encrypt([
      userId,
      mobileNumber,
      operatorcode,
      Amount,
      Loc_Data?.latitude,
      Loc_Data?.longitude,
      "city",
      "address",
      "postcode",
      mobileNetwork,
      ip,
      "57bea5094fd9082d",
    ]);

    const [
      rd, n1, ok1, , Latitude1, Longitude1,
      devtoken, Addresss, PostalCode, InternetTYPE, ip1, ModelNo
    ] = encryption.encryptedData.map(encodeURIComponent);

    const url = `${APP_URLS.rechTask}rd=${rd}&n=${n1}&ok=${ok1}&amn=${Amount}&pc=&bu=&acno=&lt=&ip=${ip1}&mc=&em=${Model}&offerprice=&commAmount=&Devicetoken=${devtoken}&Latitude=${Latitude1}&Longitude=${Longitude1}&ModelNo=${ModelNo}&City=${devtoken}&PostalCode=${PostalCode}&InternetTYPE=${InternetTYPE}&Addresss=${Addresss}&value1=${encodeURIComponent(encryption.keyEncode)}&value2=${encodeURIComponent(encryption.ivEncode)}&circle=${state}`;
    
    console.log('Recharge URL:', url);

    let status = "Failed";
    let Message = "Recharge failed, please try again";

    // 🔄 Recharge API Call
    const res = await post({ url });
    console.log(res, 'Recharge Response');

    if (res?.status === 'False') {
      ToastAndroid.showWithGravity(
        res.message,
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
    } else {
      status = res?.Response || "Success";
      Message = res?.Message || res?.message || "Recharge successful";
    }

    // 🧹 Clear input fields
    setMobileNumber("");
    setOperator("Select Operator & Circle");
    setState("");
    setCircle('');
    setAmount("");
    setIsFocused(false);

    // 🕒 Fetch latest transaction details
    const url2 = `${APP_URLS.recenttransaction}pageindex=1&pagesize=5&retailerid=${userId}&fromdate=${formattedDate}&todate=${formattedDate}&role=Retailer&rechargeNo=ALL&status=ALL&OperatorName=ALL&portno=ALL`;
   console.log("&&&&&&&&&&&",url2)
   
   
    const recent = await get({ url: url2 });

    const latest = recent?.[0] || {};

    // 🚀 Navigate to Recharge Details Screen
    navigation.navigate("Rechargedetails", {
      Amount,
      rechType: ispost ? "Postpaid" : "Prepaid",
      operator,
      mobileNumber,
      status,
      reqTime: latest?.Reqesttime || 'N/A',
      Message,
      reqId: latest?.Request_ID || 'N/A',
      idno: latest?.Idno || 'N/A',
    });

  } catch (error) {
    console.error("Recharge failed:", error);
    ToastAndroid.showWithGravity(
      "Recharge failed. Please check your network or try again.",
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
    );
  } finally {
    setShowLoader(false);
  }

}, [
  Amount,
  getMobileIp,
  getNetworkCarrier,
  latitude,
  longitude,
  mobileNumber,
  operatorcode,
  post,
  userId,
  state,
  ispost,
  operator,
  navigation,
  Loc_Data
]);




  const keyExtractor = useCallback(
    (item: any, i: number) => `${i}-${item.recordID}`,
    [],
  );
  const renderContactItem = useCallback(({ item }: { item: Contact }) => {
    return (
      <View>
        <TouchableOpacity
          style={[styles.contactView]}
          onPress={() => {
            const number = item.phoneNumbers[0].number
              .replace(/\D/g, "")
              .slice(-10);
            setShowContactModal(false);
            setMobileNumber(number);
            setisLoading(true);
            getOperator(number);
            setIsFocused(true);
          }}
        >
          {item.hasThumbnail ? (
            <Image
              source={{ uri: item.thumbnailPath }}
              style={styles.contactImage}
            />
          ) : (
            <Avatar
              style={{ marginRight: wScale(10) }}
              size={"large"}
              text={item.displayName}
            />
          )}
          <View style={styles.contactInfoContainer}>
            <Text style={styles.contactNameText}>{item?.displayName}</Text>
            <Text style={styles.contactNumber}>
              {item?.phoneNumbers?.length > 0
                ? item.phoneNumbers[0]?.number
                : ""}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }, []);

  const showContactsList = useMemo(() => {
    if (contacts.length === 0) {
      return null;
    }
    return (
      <FlashList
        data={filteredData.sort((a, b) =>
          a.displayName.localeCompare(b.displayName),
        )}
        removeClippedSubviews
        keyExtractor={keyExtractor}
        renderItem={renderContactItem}
        estimatedItemSize={200}
      />
    );
  }, [contacts, filteredData]);

  const [amountSearch, setAmountSearch] = useState(""); // New state for search query

  // Filter function for searching by amount
  const filteredPlans = planListData.filter((item) =>
    item.price?.toString().includes(amountSearch),
  );

  // eslint-disable-next-line react/no-unstable-nested-components
  const Recenttransactionlist = () => {
    return historylist.length === 0 ? (
      <View style={styles.nodataview}>
        <NoDatafound />
      </View>
    ) : (
      <FlashList
        data={historylist}
        renderItem={({ item }: { item: any }) => {
          return (
            <TouchableOpacity
              style={[styles.transactionContainer, { backgroundColor: color3 }]}
            >
         
              <View style={styles.leftContainer}>
                <Text style={styles.dateTimeText}>{item["Reqesttime"]}</Text>
                <Text style={styles.mobileNumberText}>
                  {item[translate("RechargeScreen.Recharge_number")]}
                </Text>
                <Text style={styles.mobileNumberText}>
                  {item[translate("RechargeScreen.Operator_name")]}
                </Text>
              </View>

              <View style={styles.rightContainer}>
                <Text style={styles.amountText}>
                  ₹ {item[translate("RechargeScreen.Recharge_amount")]}
                </Text>
                <Text
                  style={[
                    styles.rechTypeText,
                    {
                      color:
                        item[translate("RechargeScreen.Status")] ===
                          translate("RechargeScreen.SUCCESS")
                          ? translate("RechargeScreen.green")
                          : item[translate("RechargeScreen.Status")] ===
                            translate("RechargeScreen.FAILED")
                            ? translate("RechargeScreen.red")
                            : translate("RechargeScreen.#a89b0a"),
                    },
                  ]}
                >
                  {item[translate("RechargeScreen.Status")]}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item, index) => index.toString()}
      />
    );
  };
  return (
    <View style={styles.main}>
      <AppBarSecond
        title={"RechargeScreen.Mobile Recharge"}
        onActionPress={undefined}
        actionButton={undefined}
        onPressBack={undefined}
      />
      <View style={styles.tabview}>
        <TabBar
          Unselected={translate("RechargeScreen.POSTPAID")}
          Selected={translate("RechargeScreen.PREPAID")}
          onPress2={() => {
            setViewPlans(false);
            getopertaorlist("Postpaid");
            setispost(true);
          }}
          onPress1={() => {
            setViewPlans(true);
            getopertaorlist("Prepaid");
            setispost(false);
          }}
        />
      </View>

      <View style={styles.container}>
        {showLoader && (
          <ShowLoader />
          // <ActivityIndicator
          //   size={wScale(60)}
          //   color={colors.black}
          //   style={styles.loaderStyle}
          // />
        )}
        <View>
          <FlotingInput
            label={"RechargeScreen.Mobile Number"}
            value={mobileNumber}
            autoFocus={false}
            inputstyle={styles.inputstyle}
            maxLength={10}
            onChangeTextCallback={(text) => {
              if (text.length === 10) {
                if (validateMobileNumber(text)) {
                  setisLoading(true);
                  getOperator(text);
                } else {
                  setCircle("");
                  setOperator(
                    translate("RechargeScreen.Select Operator & Circle"),
                  );
                  ToastAndroid.showWithGravity(
                    translate(
                      "RechargeScreen.Please Enter Vaild Mobile Number",
                    ),
                    ToastAndroid.SHORT,
                    ToastAndroid.BOTTOM,
                  );
                }
                console.log("mobile numbergfgdhh", text);
              }
              setMobileNumber(text.replace(/\D/g, ""));

              setpath(""),
                setOperator(
                  translate("RechargeScreen.Select Operator & Circle"),
                );
            }}
            onKeyPress={() => {
              setAutoplay(true);
            }}
            keyboardType="number-pad"
          />
          <View style={[styles.righticon2]}>
            {isLoading ? (
              <ActivityIndicator size="large" color={color2} />
            ) : (
              <TouchableOpacity
                onPress={() => {
                  
                  requestContactPermission();
                }}
              >
                <LottieView
                  autoPlay={true}
                  loop={true}
                  style={styles.lotiimg}
                  source={require("../../utils/lottieIcons/Phonebook.json")}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (mobileNumber.length >= 10) {
              console.log(mobileNumber.length);
              setOperatorModalVisible(!isOperatorModalVisible);
            } else {
              console.log(mobileNumber.length);
            }
          }}
        >
          <FlotingInput
            label={operator}
            onBlur={() => setIsFocused(true)}
            labelinputstyle={[
              operator === "Select Operator & Circle"
                ? null
                : styles.labelinputstyle,
            ]}
            editable={false}
            keyboardType="number-pad"
          />
          {state === "Select Your Circle" ? null : (
            <Text
              style={[styles.circletext, { color: colorConfig.primaryColor }]}
            >
              {state}
            </Text>
          )}

          <View style={[styles.righticon2]}>
            {operator === "Select Operator & Circle" ? (
              <SvgXml xml={dropdown} />
            ) : path === null ? (
              <SvgXml xml={dropdown} />
            ) : (
              <Image style={styles.rightimg} source={{ uri: path }} />
            )}
          </View>
        </TouchableOpacity>
        <TouchableOpacity>
          <FlotingInput
            Text={Amount}
            value={`${Amount}`}
            autoFocus={isAmountFocused}
            label={"RechargeScreen.Enter Amount"}
            maxLength={4}
            onChangeTextCallback={(text) => {
              setAmount(text);
              if (Amount === "") {
                setisDetailButton(false);
              } else {
                updateProceedButtonVisibility();
              }
            }}
            onBlur={() => {
              updateProceedButtonVisibility();
            }}
            keyboardType="number-pad"
            inputstyle={undefined}
            labelinputstyle={undefined}
          />
          {APP_URLS.AppName != "World Pay One" && (
            <View style={[styles.righticon2]}>
              {isViewPlans && (
                <TouchableOpacity
                  style={styles.viewplanbtn}
                  onPress={() => {
                    setIsAmountFocused(true);
                    if (mobileNumber.length === 10) {
                      setIsplanview(true);
                      getPlans();
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.viewplantext,
                      { color: colorConfig.secondaryColor },
                    ]}
                  >
                    {translate("RechargeScreen.View \n Plans")}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </TouchableOpacity>
        <OperatorBottomSheet
          isModalVisible={isOperatorModalVisible}
          stateData={stateslist}
          selectedOperator={operator}
          setModalVisible={setOperatorModalVisible}
          selectOperator={selectOperator}
          setOperatorcode={setOperatorcode}
          setCircle={setCircle}
          setState={setState}
          setOperator={setOperator}
          operatorData={operators}
          showState={true}
          selectOperatorImage={setpath}
          path={path}
        />

        <BottomSheet animationType="none"


          isVisible={showContactModal}>
          <View
            style={[
              styles.bottomsheetview,
              {
                height: SCREEN_HEIGHT / 1,
              },
            ]}
          >
            <View style={[styles.StateTitle, { backgroundColor: color1 }]}>
              <View style={styles.searchcontainer}>
                <TextInput
                  value={searchText}
                  onChangeText={(text) => setSearchText(text)}
                  placeholder={translate("RechargeScreen.Search Contact")}
                  style={styles.contactinput}
                  placeholderTextColor={"#000"}
                />
                <View style={styles.contactsearchimg}>
                  <SearchIcon />
                </View>
              </View>

              <TouchableOpacity
                onPress={() => {

                 setShowContactModal(false);
                }}
                activeOpacity={0.7}
              >
                <ClosseModalSvg2 />
              </TouchableOpacity>
            </View>
            {showContactsList}
          </View>
        </BottomSheet>
        <BottomSheet
          animationType="none"
          containerStyle={{ padding: 10 }}
          isVisible={isplanview ?? false}
          onBackdropPress={() => setIsplanview(false)}
        >
          <View style={styles.bottomsheetview}>
            <Tab
              disableIndicator={false}
              style={[styles.tabstyle, { backgroundColor: color1 }]}
              value={index ?? 0}
              onChange={(e) => {
                setIndex(e);
                if (rechargePlans && rechargePlans[e]?.value?.Response) {
                  setPlanListData(rechargePlans[e].value.Response);
                } else {
                  setPlanListData([]);
                }
              }}
              indicatorStyle={{ height: hScale(0) }}
              containerStyle={(active) => ({ justifyContent: "center" })}
              titleStyle={(active) => ({
                color: active ? colorConfig.secondaryColor : "black",
                fontWeight: active ? "bold" : "normal",
                paddingHorizontal: active ? wScale(0) : 0,
              })}
              scrollable
            >
              {rechargePlans?.length > 0
                ? rechargePlans.map((plan, index) => (
                  <Tab.Item
                    containerStyle={(active) => ({
                      backgroundColor: 'transparent',
                    })}
                    key={index}
                    title={plan.key ?? translate("RechargeScreen.Plan")}
                  />
                ))
                : null}
            </Tab>

            {/* Search bar */}
            {/* <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={translate("search_by_amount")}
            keyboardType="numeric"
            value={amountSearch}
            onChangeText={setAmountSearch}
          />
        </View> */}

            <View style={[{ flex: 1 }, styles.tabContent]}>
              <FlashList
                data={planListData} // Use filtered plans
                keyExtractor={(item, index) =>
                  item.price?.toString() ?? index.toString()
                }
                estimatedItemSize={131}
                ListEmptyComponent={() => (
                  <View>
                    {isPlanLoading ? (
                      <SkeletonPlaceholder
                        speed={1200}
                        backgroundColor={colors.grey}
                        borderRadius={4}
                      >
                        <SkeletonPlaceholder.Item alignSelf="center">
                          <SkeletonPlaceholder.Item
                            alignSelf="center"
                            alignItems="center"
                            backgroundColor={color1}
                            width={wScale(380)}
                            height={wScale(45)}
                            borderRadius={wScale(5)}
                            margin={wScale(20)}
                          />
                          <SkeletonPlaceholder.Item
                            margin={wScale(20)}
                            width={wScale(380)}
                            height={wScale(10)}
                          />
                          <SkeletonPlaceholder.Item
                            margin={wScale(20)}
                            width={wScale(380)}
                            height={wScale(10)}
                          />
                        </SkeletonPlaceholder.Item>
                      </SkeletonPlaceholder>
                    ) : (
                      <View
                        style={{
                          flexDirection: "column",
                          marginTop: wScale(90),
                          flex: 1,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <NoDatafound size={wScale(200)} />
                      </View>
                    )}
                  </View>
                )}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setIsplanview(false);
                      setAmount(item.price ?? 0);
                      setIsFocused(false);
                    }}
                    style={[styles.itemContainer, { backgroundColor: color3 }]}
                  >
                    <View style={styles.innerContainer}>
                      <Text style={styles.priceText}>
                        ₹ {item.price ?? "N/A"}
                      </Text>
                      <View>
                        <Text style={styles.validityText}>{translate("Validity")}</Text>
                        <Text style={styles.validityvalue}>
                          {item.Validity ?? "N/A"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.descriptionText}>
                      {item.description ?? item.offer + item.offerDetails}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </BottomSheet>
       <Rechargeconfirm
            isModalVisible={isDetail}
            onBackdropPress={() => setIsDetail(false)}
            details={[
              { label: "Recharge Type", value2: ispost ? "Postpaid" : "Prepaid" },
              { label: "Mobile", value: mobileNumber },
              { label: "Operator Name", value2: operator },
            ]}
            lastlabel={"Transaction Amount"}
            lastvalue={Amount}
            onRechargedetails={() => {
              onRechargePress();
            }}
            isLoading2={showLoader}
            Lottieimg={require('../../utils/lottieIcons/profile2.json')}
          />
{/* 
        <Rechargeconfirm
          isModalVisible={isDetail}
          onBackdropPress={() => setIsDetail(false)}
          details={[
            {
              label: translate("RechargeScreen.Recharge Type"),
              value2: ispost
                ? translate("RechargeScreen.Postpaid")
                : translate("RechargeScreen.Prepaid"),
            },
            { label: translate("RechargeScreen.Mobile"), value: mobileNumber },
            {
              label: translate("RechargeScreen.Operator Name"),
              value2: operator,
            },
          ]}
          lastlabel={translate("RechargeScreen.Transaction Amount")}
          lastvalue={Amount}
          onRechargedetails={() => {
            onRechargePress();
            //              if (recharegepin) {   // ✅ PIN required
            //   navigation.navigate("RechargePin", {
            //     onPinSet: (userPin) => {
            //       console.log("Returned PIN:", userPin);

            //       // yaha recharge call
            //       onRechargePress(userPin);
            //     }
            //   });
            // } else {
            //   onRechargePress(""); // ❌ PIN not required
            // }
          }}
          isLoading2={showLoader}
          Lottieimg={require("../../utils/lottieIcons/profile2.json")}
        /> */}
        <DynamicButton
          title={"Next"}
          onPress={() => {
            console.log(
              mobileNumber,
              Loc_Data,
              latitude,
              longitude,
              Loc_Data["latitude"],
              Loc_Data["longitude"],
            );

            if (mobileNumber.length === 10 && Amount) {
              setIsDetail(true);
              Keyboard.dismiss();
            }
          }}
          styleoveride={{
            top:
              APP_URLS.AppName == "World Pay One"
                ? hScale(-20)
                : 0,
          }}
        />
        <View>
          <RecentHistory
            isModalVisible={isrecent}
            setModalVisible={setIsrecent}
            historylistdata={historylist}
            onBackdropPress={() => setIsrecent(false)}
          />
          <TouchableOpacity
            onPress={() => {
              setIsrecent(true);
            }}
            style={styles.recentviewbtn}
          >
            <Text style={styles.recent}>
              {translate("RechargeScreen.Last Recent 5 Transaction")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {APP_URLS.AppName == "Pc Pay" &&
        !isKeyboardVisible && <Recenttransactionlist />}

      {APP_URLS.AppName === "World Pay One" &&
        rechargePlans.length > 0 && (
          <View style={styles.bottomsheetview}>
            <Tab
              style={[styles.tabstyle, { backgroundColor: color1 }]}
              value={index ?? 0}
              onChange={(e) => {
                setIndex(e);
                if (rechargePlans && rechargePlans[e]?.value?.Response) {
                  setPlanListData(rechargePlans[e].value.Response);
                } else {
                  setPlanListData([]);
                }
              }}
              indicatorStyle={{ height: hScale(0) }}
              containerStyle={(active) => ({ justifyContent: "center" })}
              titleStyle={(active) => ({
                color: active ? colorConfig.secondaryColor : "black",
                fontWeight: active ? "bold" : "normal",
                paddingHorizontal: active ? wScale(0) : 0,
                fontSize: wScale(
                  APP_URLS.AppName == "World Pay One"
                    ? 13
                    : 15,
                ),
              })}
              scrollable
            >
              {rechargePlans?.length > 0
                ? rechargePlans.map((plan, index) => (
                  <Tab.Item
                    key={index}
                    title={plan.key ?? translate("RechargeScreen.Plan")}
                  />
                ))
                : null}
            </Tab>

            {/* Search bar */}
            {/* <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder={translate("search_by_amount")}
            keyboardType="numeric"
            value={amountSearch}
            onChangeText={setAmountSearch}
          />
        </View> */}

            <View style={[{ flex: 1 }, styles.tabContent]}>
              <FlashList
                data={planListData} // Use filtered plans
                keyExtractor={(item, index) =>
                  item.price?.toString() ?? index.toString()
                }
                estimatedItemSize={131}
                ListEmptyComponent={() => (
                  <View>
                    {isPlanLoading ? (
                      <SkeletonPlaceholder
                        speed={1200}
                        backgroundColor={colors.grey}
                        borderRadius={4}
                      >
                        <SkeletonPlaceholder.Item alignSelf="center">
                          <SkeletonPlaceholder.Item
                            alignSelf="center"
                            alignItems="center"
                            backgroundColor={color1}
                            width={wScale(380)}
                            height={wScale(45)}
                            borderRadius={wScale(5)}
                            margin={wScale(20)}
                          />
                          <SkeletonPlaceholder.Item
                            margin={wScale(20)}
                            width={wScale(380)}
                            height={wScale(10)}
                          />
                          <SkeletonPlaceholder.Item
                            margin={wScale(20)}
                            width={wScale(380)}
                            height={wScale(10)}
                          />
                        </SkeletonPlaceholder.Item>
                      </SkeletonPlaceholder>
                    ) : (
                      <View
                        style={{
                          flexDirection: "column",
                          marginTop: wScale(90),
                          flex: 1,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <NoDatafound size={wScale(200)} />
                      </View>
                    )}
                  </View>
                )}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => {
                      setIsplanview(false);
                      setAmount(item.price ?? 0);
                      setIsFocused(false);
                    }}
                    style={[styles.itemContainer, { backgroundColor: color3 }]}
                  >
                    <View style={styles.innerContainer}>
                      <Text style={styles.priceText}>
                        ₹ {item.price ?? "N/A"}
                      </Text>
                      <View>
                        <Text style={styles.validityText}>{translate("Validity")}</Text>
                        <Text style={styles.validityvalue}>
                          {item.Validity ?? "N/A"}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.descriptionText}>
                      {item.description ?? item.offer + item.offerDetails}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: "#fff",
  },
  tabview: {
    paddingHorizontal: wScale(20),
    paddingTop: hScale(APP_URLS.AppName == "World Pay One" ? 7 : 10),
  },
  container: {
    paddingHorizontal: wScale(20),
    flex: 1,
    paddingTop: hScale(APP_URLS.AppName == "World Pay One" ? 11 : 30),
  },
  righticon2: {
    position: "absolute",
    left: "auto",
    right: wScale(0),
    top: hScale(0),
    height: "85%",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: wScale(12),
  },
  circletext: {
    position: "absolute",
    top: hScale(35),
    paddingLeft: wScale(15),
    fontSize: wScale(12),
  },
  lotiimg: {
    height: hScale(44),
    width: wScale(44),
    marginRight: wScale(-2),
  },
  labelinputstyle: {
    fontSize: wScale(20),
    fontWeight: "bold",
    marginTop: hScale(-7),
  },
  inputstyle: {
    // fontSize: wScale(30),
  },
  StateTitle: {
    paddingVertical: hScale(10),
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: "space-between",
    alignItems: "center",
    flexDirection: "row",
    paddingHorizontal: wScale(10),
    marginBottom: hScale(10),
  },
  contactTitletext: {
    fontSize: wScale(20),
    color: "#000",
    fontWeight: "bold",
  },
  rightimg: {
    height: wScale(45),
    width: wScale(45),
  },
  bottomsheetview: {
    paddingBottom:hScale(100),
    flexGrow:1,
    top: APP_URLS.AppName === "World Pay One" ? -7 : 10,
    padding: APP_URLS.AppName === "World Pay One" ? 5 : 10,
    backgroundColor: "#fff",
    height:
      APP_URLS.AppName === "World Pay One"
        ? SCREEN_HEIGHT / 2.2
        : SCREEN_HEIGHT / 1.3,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  tabstyle: {
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    paddingHorizontal: 10,
  },

  viewplanbtn: {
    width: wScale(90),
    alignItems: "flex-end",
    height: "100%",
    justifyContent: "center",
    padding: wScale(10),
    marginRight: wScale(-5),
  },
  loaderStyle: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0 },
  viewplantext: {
    textAlign: "center",
  },
  recentviewbtn: {
    alignSelf: "flex-end",
    flexDirection: "row",
  },

  recent: {
    color: "#000",
    textAlign: "right",
    paddingVertical: hScale(10),
  },
  tabContent: {
    flex: 1,
  },
  itemContainer: {
    borderRadius: 5,
    marginHorizontal:
      APP_URLS.AppName === "World Pay One" ? wScale(4) : wScale(8),
    marginBottom: hScale(4),
    paddingVertical: hScale(1),
    paddingHorizontal: wScale(8),
  },
  innerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceText: {
    fontSize: APP_URLS.AppName === "World Pay One" ? wScale(12) : wScale(18),
    fontWeight: "bold",
    color: "#333",
  },
  validityText: {
    fontSize: APP_URLS.AppName === "World Pay One" ? wScale(10) : wScale(14),
    color: "#666",
  },
  descriptionText: {
    fontSize: hScale(10),
    marginTop: hScale(5),
    color: "#555",
  },
  contactView: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: wScale(20),
  },
  contactImage: {
    width: wScale(45),
    height: wScale(45),
    borderRadius: 25,
    marginRight: wScale(10),
  },
  contactInfoContainer: {
    flex: 1,
    borderBottomWidth: wScale(0.5),
    paddingVertical: hScale(10),
    borderColor: "#c9c8c5",
  },
  contactNameText: {
    fontSize: wScale(16),
    fontWeight: "bold",
    marginBottom: hScale(4),
    color: "#333",
  },
  contactNumber: {
    fontSize: wScale(14),
    color: "#666",
  },
  contactinput: {
    borderWidth: wScale(0.5),
    borderRadius: 30,
    paddingHorizontal: wScale(10),
    flex: 1,
    marginRight: wScale(20),
    paddingLeft: wScale(60),
    color: "#000",
  },
  contactsearchimg: {
    position: "absolute",
    left: 0,
    right: "auto",
    top: hScale(0),
    height: "100%",
    justifyContent: "center",
    zIndex: -4,
    paddingLeft: wScale(15),
  },
  searchcontainer: {
    flex: 1,
    height: hScale(44),
  },

  stateTitletext: {
    fontSize: wScale(22),
    color: "#000",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  titleview: {
    flex: 1,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  transactionContainer: {
    top: hScale(10),
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wScale(8),
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    marginBottom: hScale(10),
    paddingVertical: hScale(10),
    marginHorizontal: wScale(10),
  },
  leftContainer: {
    flex: 1,
  },
  dateTimeText: {
    fontSize: wScale(14),
    fontWeight: "bold",
    marginBottom: hScale(5),
  },

  mobileNumberText: {
    fontSize: 14,
    color: "#555",
  },
  amountText: {
    fontSize: wScale(18),
    fontWeight: "bold",
    color: "#000",
  },
  rechTypeText: {
    fontSize: wScale(14),
    color: "#666",
  },
  rightContainer: {
    marginLeft: wScale(15),
    alignItems: "flex-end",
  },
  nodata: {
    width: "100%",
    textAlign: "center",
    color: "#000",
    fontSize: wScale(16),
  },
  nodataview: {
    alignItems: "center",
    paddingBottom: hScale(20),
  },
  operatioimg: {
    width: wScale(45),
    height: wScale(45),
    marginRight: wScale(20),
  },
});
export default RechargeScreen;