import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, AsyncStorage,
  ImageBackground, BackHandler, ToastAndroid
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../reduxUtils/store";
import { useNavigation } from "../utils/navigation/NavigationService";
import { hScale, wScale } from "../utils/styles/dimensions";
import ViewShot, { captureRef } from "react-native-view-shot";
import Share from "react-native-share";
import ShowLoader from "./ShowLoder";
import ShareGoback from "./ShareGoback";
import useAxiosHook from "../utils/network/AxiosClient";
import { APP_URLS } from "../utils/network/urls";
import { clearEntryScreen, setCmsAddMFrom } from "../reduxUtils/store/userInfoSlice";

export default function AddMoneyPayResponse() {
  const capRef = useRef();
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const { colorConfig, cmsAddMFrom, radiantList } = useSelector((state: RootState) => state.userInfo);
  const { post } = useAxiosHook();

  const [saved, setSaved] = useState<any>({});
  const [inforeport, setInforeport] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState({
    from: new Date().toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  // Load saved transaction from AsyncStorage
  useEffect(() => {
    const loadSaved = async () => {
      try {
        const savedData = await AsyncStorage.getItem("upi_intent_params");
        if (savedData) {
          setSaved(JSON.parse(savedData));
        }
      } catch (e) {
        console.error("Read Error:", e);
      }
    };
    loadSaved();
    fetchAddMReport(selectedDate.from, selectedDate.to);
  }, []);

  // Fetch Add Money Report
  const fetchAddMReport = async (from: string, to: string) => {
    setLoading(true);
    try {
      const formattedFrom = new Date(from).toISOString().split("T")[0];
      const formattedTo = new Date(to).toISOString().split("T")[0];

      const response = await post({
        url: `${APP_URLS.Addmoneyrep}txt_frm_date=${formattedFrom}&txt_to_date=${formattedTo}`,
      });

      if (!response || !Array.isArray(response)) throw new Error("Invalid response");

      const latest = response[0];
      if (latest) setInforeport(latest);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusRaw = inforeport?.status;
  const status = statusRaw?.toLowerCase() || "";
  const color =
    status === "pending" ? "#fa9507" :
      status === "failed" ? "red" :
        status === "success" ? "green" :
          "#ddd";

  // BackHandler
  useEffect(() => {
    const backAction = () => {
      navigation.navigate("DashboardScreen");
      return true;
    };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, []);

  // Auto navigate on success after 4s
  useEffect(() => {
    if (status !== "success") return;

    const timer = setTimeout(() => {
      if (cmsAddMFrom === "PageA") {
        navigation.navigate("CashPickup");
      } else if (cmsAddMFrom === "CmsPrePay") {
        navigation.navigate("CmsPrePay", { item: radiantList });
      } else {
        navigation.navigate("DashboardScreen");
      }
      dispatch(clearEntryScreen(null));
    }, 4000);

    return () => clearTimeout(timer);
  }, [status, cmsAddMFrom, radiantList]);

 
const onPressGoBack = () => {
  if (status === "success") {

    if (cmsAddMFrom === "PageA") {
      navigation.navigate("CashPickup");

    } else if (cmsAddMFrom === "CmsPrePay") {
      dispatch(setCmsAddMFrom("AddMoneyPayResponse"));
      navigation.navigate("CmsPrePay", { item: radiantList });

    } else {
      navigation.navigate("DashboardScreen");
    }

    dispatch(clearEntryScreen(null));

  } else {
    navigation.goBack();
  }
};

  const onShare = useCallback(async () => {
    try {
      const uri = await captureRef(capRef, { format: "jpg", quality: 0.7 });
      await Share.open({
        message: `Hi, I am sharing the transaction details using ${APP_URLS.AppName} App.`,
        url: uri,
      });
    } catch (e) {
      ToastAndroid.show("Transaction details not shared", ToastAndroid.SHORT);
    }
  }, []);

  const onPressHome = () => navigation.navigate("DashboardScreen");

  if (loading || !statusRaw) return <ShowLoader />;

  return (
    <ScrollView style={[styles.container, { backgroundColor: `${colorConfig.secondaryColor}0D` }]}>
      <ViewShot
        ref={capRef}
        options={{ fileName: "TransactionReciept", format: "jpg", quality: 0.9 }}
      >
        <View style={styles.imgView}>
          <View style={[styles.emptyView, { backgroundColor: color }]} />
          <View style={[styles.emptyView2, { backgroundColor: color }]} />

          <ImageBackground
            source={require("../../assets/images/HeaderBg.png")}
            style={styles.imgstyle}
            resizeMode="cover"
          >
            <View style={styles.greenTop}>
              {status === "pending" ? (
                <FontAwesome6 name="clock" size={70} color="#fff" />
              ) : status === "failed" ? (
                <Entypo name="circle-with-cross" size={80} color="#fff" />
              ) : (
                <Ionicons name="checkmark-done-circle-sharp" size={80} color="#fff" />
              )}
            </View>
          </ImageBackground>
        </View>

        <Text style={styles.amount}>₹ {inforeport.amt || saved.am}</Text>

        <View style={styles.card}>
          <Text style={[styles.labelTital, { color, borderColor: color }]}>{statusRaw}</Text>

          {renderRow("Banking Name", saved?.pn || inforeport.PayerName || "--", false, color)}
          {renderRow("Transaction ID", saved?.tid || inforeport.BankRRN || "--", false, color)}
          {renderRow("Bank Ref ID", saved?.tr || inforeport.refid || "--", false, color)}
          {renderRow("Date & Time", saved?.datetime || inforeport.txndate || "--", false, color)}
          {renderRow("Remarks", saved?.tn || "--", true, color)}
        </View>
      </ViewShot>

      <View style={{ marginHorizontal: wScale(15) }}>
        <ShareGoback
          onShare={onShare}
          goBackIcon={status === "success" ? null : "chevron-back"}
          goBackTitle={status === "success" ? "OK" : "Go Back"}
          onHome={onPressHome}
          onGoBack={onPressGoBack}
          onRefresh={() => fetchAddMReport(selectedDate.from, selectedDate.to)}
        />
      </View>
    </ScrollView>
  );
}

// Helper to render rows
function renderRow(label, value, isLast = false, color) {
  if (!value) return null;
  return (
    <View style={[styles.rowView, isLast && styles.noBorder, { borderColor: color }]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  greenTop: { alignItems: "center", paddingTop: hScale(6), flex: 1 },
  amount: {
    fontSize: wScale(42),
    fontWeight: "bold",
    color: "#000",
    borderRadius: wScale(30),
    textAlign: "center",
    width: "50%",
    alignSelf: "center",
    marginTop: hScale(-35),
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: wScale(15),
    marginHorizontal: wScale(15),
    marginTop: hScale(10),
    paddingTop: hScale(20),
    marginBottom: hScale(15),
    elevation: 2,
  },
  labelTital: {
    fontSize: wScale(33),
    fontWeight: "bold",
    textAlign: "center",
    borderBottomWidth: wScale(2),
    marginBottom: hScale(10),
    paddingBottom: hScale(5),
  },
  label: { fontSize: wScale(13) },
  value: { fontSize: wScale(16), marginTop: hScale(4), fontWeight: "bold" },
  rowView: { borderBottomWidth: wScale(1), borderStyle: "dashed", marginBottom: hScale(10), paddingBottom: hScale(10), marginHorizontal: wScale(20) },
  noBorder: { borderBottomWidth: 0 },
  imgView: { height: hScale(200) },
  emptyView: { height: hScale(100) },
  emptyView2: { height: hScale(40), alignSelf: "center", width: "71%", borderBottomLeftRadius: 80, borderBottomRightRadius: 80 },
  imgstyle: { height: "100%", width: "100%", marginTop: hScale(-99), zIndex: 9 },
});
