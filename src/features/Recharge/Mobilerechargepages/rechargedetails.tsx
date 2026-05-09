import { translate } from "../../../utils/languageUtils/I18n";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from "react-native";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import { useSelector } from "react-redux";
import { RootState } from "../../../reduxUtils/store";
import Successful from "../../drawer/svgimgcomponents/successfulimg";
import { useNavigation } from "@react-navigation/native";
import FailedSvg from "../../drawer/svgimgcomponents/Failedimg";
import PaddingSvg from "../../drawer/svgimgcomponents/Paddingimg";
import HomeSvg from "../../drawer/svgimgcomponents/homesvg";
import ShareSvg from "../../drawer/svgimgcomponents/sharesvg";
import PrinteSvg from "../../drawer/svgimgcomponents/printesvg";
import LinearGradient from "react-native-linear-gradient";
import ViewShot, { captureRef } from "react-native-view-shot";
import Share from "react-native-share";
import { SvgXml } from "react-native-svg";
import { APP_URLS } from "../../../utils/network/urls";
import { playSound } from "../../dashboard/components/Sounds";
import Refund from "../../drawer/svgimgcomponents/Refund";
import { onReceiveNotification2 } from "../../../utils/NotificationService";

const Rechargedetails = ({ route }) => {
  const home = `

  <svg id="Layer_4" height="512" viewBox="0 0 24 24" width="512" xmlns="http://www.w3.org/2000/svg" data-name="Layer 4"><g id="Glyph"  fill='#fff'><path id="Home" d="m21.665 11.253-9-8a1 1 0 0 0 -1.33 0l-9 8a1 1 0 1 0 1.33 1.494l.335-.3v7.553a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-7.551l.335.3a1 1 0 1 0 1.33-1.494z"/></g></svg>
   `
  const {
    rechType,
    mobileNumber,
    operator,
    Amount,
    status,
    reqTime,
    Message,
    reqId,
    idno,
  } = route.params;

  const navigation = useNavigation<any>();
  const { colorConfig, IsRington } = useSelector((state: RootState) => state.userInfo);
  const color2 = `${colorConfig.primaryColor}15`;
  const color3 = `${colorConfig.secondaryColor}15`;
  const capRef = useRef();

  const onPressButton = () => {
    navigation.navigate({ name: "DashboardScreen" });
  };
  const onPressButton2 = () => {
    navigation.goBack();
  };
  useEffect(() => {
    playSound(status, IsRington)

    console.log(
      IsRington,
      status,
      Message,
)
const mockNotification = {
  notification: {
    title: Message || 'Status Unknown',
    body: `Recharge of ${mobileNumber ?? 'N/A'}. Amount: ${Amount ?? '0'} is ${status ?? 'Unknown'}. Transaction ID: ${idno ?? 'N/A'}. Regards ${APP_URLS?.AppName ?? 'YourApp'}`,
  },
};


// Call the function
onReceiveNotification2(mockNotification);  
  }, [])



  const onShare = useCallback(async () => {
    try {
      const uri = await captureRef(capRef, {
        format: "jpg",
        quality: 0.7,
      });
      await Share.open({
        message: translate(`key_hiiams_47 ${APP_URLS.AppName} App.`),
        url: uri,
      });
    } catch (e) {
      console.log(e)
      ToastAndroid.show("Transaction details not shared", ToastAndroid.SHORT);
    }
  }, []);

  return (
    <ScrollView>
      <View style={styles.main}>
        <View>
          <ViewShot
            ref={capRef}
            options={{
              fileName: "TransactionReciept",
              format: "jpg",
              quality: 0.9,
            }}
          >
            <View style={[styles.container]}>
              <Text style={[styles.title, { color: colorConfig.primaryColor }]}>{translate("Transaction_Information")}</Text>
              <View style={styles.body}>
                <LinearGradient
                  style={styles.LinearGradient}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  colors={[color2, color3]}
                >
                  <View style={[styles.topheader]}>
                    {status === "Success" ? (
                      <Successful />
                    ) : status === "Failed" ? (
                      <FailedSvg />
                    ) : status.startsWith('P') ? (
                      <PaddingSvg />
                    ) : status.startsWith('R') ? (
                      <Refund size={100} color={'#645fde'} />
                    ) : (
                      <Text style={[styles.topheaderText]}>{translate("Unknown_Status")}</Text>
                    )}
                    <Text style={[styles.topheaderText]}>
                      Transaction {status}
                    </Text>
                  </View>

                </LinearGradient>
                <View style={styles.bodyin}>
                  <View
                    style={[
                      styles.header2,
                      {
                        backgroundColor:
                          status === "Success"
                            ? "green"
                            : status === "Failed"
                              ? "red"
                              : status.startsWith("P")
                                ? "orange"
                                : status.startsWith("R")
                                  ? "#645fde"
                                  : "deepPurple",
                      },
                    ]}
                  >
                    <Text style={[styles.headerText]}>
                      {Message}
                    </Text>
                  </View>

                  <View style={[styles.detailsContainer]}>
                    <View style={styles.detailItem}>
                      <Text style={styles.label}>{translate("Reqest_ID")}</Text>
                      <Text style={styles.value2}>{idno}</Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Text style={styles.label}>{translate("Mobile_Number")}</Text>
                      <Text style={styles.value2}>{mobileNumber}</Text>
                    </View>

                    <View style={styles.detailItem}>
                      <Text style={[styles.label, {}]}>{translate("Operator_Name")}</Text>
                      <Text numberOfLines={1} ellipsizeMode="tail" style={[styles.value2,
                      {}]}>{operator}</Text>
                    </View>
                    <View style={[styles.detailItem]}>
                      <Text style={styles.label}>{translate("Transaction_Amount")}</Text>
                      <Text style={[styles.value2]}>₹ {Amount}</Text>
                    </View>
                    <View style={[styles.detailItem]}>
                      <Text style={styles.label}>{translate("Reqest_Time")}</Text>

                      <Text style={styles.value2}>{reqTime}</Text>
                    </View>

                    <View style={[styles.detailItem, styles.detailItem2]}>
                      <Text style={styles.label}>{translate("Transaction_ID")}</Text>

                      <Text style={styles.value2}>{reqId} </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </ViewShot>
          <View style={styles.buncontainer}>
            <View
              style={[
                styles.btn2,
                { backgroundColor: colorConfig.primaryButtonColor },
              ]}
            >
              <TouchableOpacity onPress={onPressButton} style={styles.homebtn}>
                <SvgXml xml={home} width={wScale(35)} height={wScale(35)} />
              </TouchableOpacity>
              <View style={[styles.btnborder]} />
              <TouchableOpacity onPress={onShare} style={styles.homebtn}>
                <ShareSvg />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={onPressButton2}
              style={[
                styles.btn,
                { backgroundColor: colorConfig.secondaryButtonColor },
              ]}
            >
              <Text style={[styles.btntext, { color: colorConfig.labelColor }]}>{translate("New_Recharge")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};
export default Rechargedetails;
const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: wScale(10),
  },
  body: {
    borderRadius: 15,
    backgroundColor: "#ffe",
    marginTop: wScale(10),
    borderWidth: 1,
    borderColor: "#ccc",
    width: "100%",
  },
  bodyin: {
    paddingHorizontal: wScale(10),
  },
  LinearGradient: {
    borderTopLeftRadius: wScale(10),
    borderTopRightRadius: wScale(10),
  },
  topheader: {
    alignSelf: "center",
    alignItems: "center",
    paddingTop: hScale(15),
    width: "100%",
  },
  header2: {
    color: "white",
    textAlign: "center",
    marginBottom: hScale(10),
    justifyContent: "center",
    height: hScale(15),
  },
  headerText: {
    textAlign: "center",
    color: "#fff",
    letterSpacing: 2,
    marginTop: hScale(-3),
  },
  title: {
    fontSize: wScale(32),
    textAlign: "center",
    fontWeight: "bold",
    paddingTop: hScale(6),
  },
  topheaderText: {
    fontSize: wScale(22),
    textAlign: "center",
    paddingBottom: hScale(10),
    fontWeight: "bold",
    color: "#000",
  },
  detailsContainer: {
    borderRadius: 10,
    marginBottom: hScale(20),
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hScale(10),
    borderBottomWidth: wScale(0.5),
    paddingVertical: hScale(15),
    alignItems: "center",
  },
  detailItem2: {
    marginBottom: hScale(0),
    borderBottomWidth: wScale(0),
    paddingBottom: hScale(0),
  },
  label: {
    color: "#000",
    fontSize: wScale(14),
  },

  value2: {
    color: "#000",
    fontSize: wScale(18),
    fontWeight: "bold",
    textAlign: 'right',
    paddingLeft: wScale(15),
    flex: 1
  },
  buncontainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hScale(20),
    marginBottom: hScale(20),
    flex: 1,
    paddingHorizontal: wScale(10)
  },
  btn: {
    paddingVertical: hScale(8),
    borderRadius: 10,
    width: '56%',
    justifyContent: 'center'
  },
  btn2: {
    paddingVertical: hScale(8),
    alignItems: 'center',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '40%',
    paddingHorizontal: wScale(4),
  },
  btnborder: {
    borderRightWidth: wScale(0.5),
    height: "100%",
    borderColor: "rgba(255,255,255,0.5)",
  },
  btntext: {
    color: "#fff",
    fontSize: wScale(22),
    fontWeight: "bold",
    textAlign: "center",
  },
  homebtn: {
    flex: 1,
    alignItems: 'center'
  }
});
