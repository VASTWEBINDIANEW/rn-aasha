import { translate } from "../../../utils/languageUtils/I18n";
import React, { useCallback, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ToastAndroid, BackHandler, } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import AppBarSecond from "../../drawer/headerAppbar/AppBarSecond";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import { APP_URLS } from "../../../utils/network/urls";
import PaddingSvg from "../../drawer/svgimgcomponents/Paddingimg";
import { SvgXml } from "react-native-svg";
import ShareSvg from "../../drawer/svgimgcomponents/sharesvg";
import { useSelector } from "react-redux";
import { RootState } from "../../../reduxUtils/store";
import ViewShot, { captureRef } from "react-native-view-shot";
import Share from "react-native-share";
import { playSound } from "../../dashboard/components/Sounds";
import { useFocusEffect } from "@react-navigation/native";
import BorderLine from "../../../components/BorderLine";


const UpiPayResult = ({ route, navigation }) => {
    const home = `

  <svg id="Layer_4" height="512" viewBox="0 0 24 24" width="512" xmlns="http://www.w3.org/2000/svg" data-name="Layer 4"><g id="Glyph"  fill='#fff'><path id="Home" d="m21.665 11.253-9-8a1 1 0 0 0 -1.33 0l-9 8a1 1 0 1 0 1.33 1.494l.335-.3v7.553a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-7.551l.335.3a1 1 0 1 0 1.33-1.494z"/></g></svg>
   `
    const { colorConfig, IsRington } = useSelector((state: RootState) => state.userInfo);

    const { upi, txn, amount } = route.params;
    useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('DashboardScreen'); 
        return true; 
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () =>
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );
    useEffect(() => {
        playSound(status, IsRington)
    }, []);
    console.log('====================================');
    console.log(amount, colorConfig.secondaryButtonColor);
    console.log('====================================');
    // const    status = "pending";
    const status = txn.Status?.toLowerCase() || "pending";
    const getStatusColor = () => {
        if (status === "success") return "#28a745";
        if (status === "failed") return "#dc3545";
        return "#985c07ff";
    };
    const getStatusBgColor = () => {
        if (status === "success") return "#ddf4e2ff";
        if (status === "failed") return "#f8dde1ff";
        return "#fde9ccff";
    };

    const getStatusIcon = () => {
        if (status === "success") return "check-circle";
        if (status === "failed") return "close-circle";
        return "progress-clock";
    };
    const now = new Date();

    const currentDate = now.toLocaleDateString('en-IN');

    const currentTime = now.toLocaleTimeString('en-IN');

    console.log("Current Date:", currentDate);
    console.log("Current Time:", currentTime);

    const capRef = useRef();

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
            ToastAndroid.show("Transaction details not shared", ToastAndroid.SHORT);
        }
    }, []);
    const onPressButton = () => {
        navigation.navigate({ name: "DashboardScreen" });
    };
    const onPressButton2 = () => {
        navigation.navigate({ name: 'QRScanScreen' });
    };

    return (
        <View style={styles.main}> 
            <ViewShot
                ref={capRef}
                options={{
                    fileName: "TransactionReciept",
                    format: "jpg",
                    quality: 0.9,
                }}
                style={{ flex: 1, backgroundColor: '#fff' }}
            >
                <AppBarSecond title={'Transaction'} onPressBack={() => navigation.navigate("DashboardScreen",)}
                />


                <View style={[styles.topBox, { backgroundColor: getStatusBgColor() }]}>
                    <View style={styles.leftStatus}>
                        <View style={[styles.statusIconCircle, { borderColor: getStatusColor() }]}>
                            <Icon name={getStatusIcon()} size={40} color={getStatusColor()} />
                        </View>

                        <View>
                            <Text style={[styles.statusText, { color: getStatusColor() }]}>
                                {status.toUpperCase()}
                            </Text>
                            <Text style={styles.merchantName}>
                                {APP_URLS.AppName}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.amountTxt}>₹ {amount}</Text>
                </View>

                <View style={styles.detailsBox}>

                    <Text style={styles.detailsTitle}>{translate("DETAILS_OF_TRANSACTION")}</Text>

                    <View style={styles.row}>
                        <Text style={styles.key}>{translate("UPI_ID")}</Text>
                        <Text style={styles.value}>{upi.pa}</Text>
                    </View>
                    <BorderLine/>
                    <View style={styles.row}>
                        <Text style={styles.key}>{translate("Name")}</Text>
                        <Text style={styles.value}>{upi.pn}</Text>
                    </View>
                    <BorderLine/>

                    <View style={styles.row}>
                        <Text style={styles.key}>{translate("DATE")}</Text>
                        <Text style={styles.value}>{currentDate}</Text>
                    </View>
                    <BorderLine/>

                    <View style={styles.row}>
                        <Text style={styles.key}>{translate("TIME")}</Text>
                        <Text style={styles.value}>{currentTime}</Text>
                    </View>
                 <Text style={styles.value}>Message : {txn.bankrefid}</Text> 


                </View>


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
                            { backgroundColor: `${colorConfig.primaryButtonColor}33` }
                        ]}
                    >
                        <Text style={[styles.btntext, { color: '#000' }]}>{translate("Scan_Pay_Again")}</Text>
                    </TouchableOpacity>
                </View>
            </ViewShot>
        </View>
    );
};

export default UpiPayResult;

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "#fff",
    },

    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: wScale(18),
        paddingVertical: hScale(12),
    },

    headerTitle: {
        fontSize: wScale(20),
        fontWeight: "600",
        color: "#000",
    },

    topBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#f0f0f0",
        padding: wScale(18),
        borderBottomWidth: wScale(1),
        borderColor: "#ddd",
        alignItems: "center",
    },

    leftStatus: {
        flexDirection: "row",
        alignItems: "center",
        gap: wScale(12),
    },

    statusIconCircle: {
        width: hScale(50),
        height: hScale(50),
        borderRadius: wScale(55),
        borderWidth: wScale(2),
        alignItems: "center",
        justifyContent: "center",
        marginRight: wScale(10),
    },

    statusText: {
        color: "#28a745",
        fontSize: wScale(14),
        fontWeight: "bold",
    },

    merchantName: {
        fontSize: wScale(15),
        color: "#000",
        fontWeight: "600",
    },

    merchantUpi: {
        fontSize: wScale(12),
        color: "#555",
    },

    amountTxt: {
        fontSize: wScale(24),
        fontWeight: "700",
        color: "#000",
    },

    /* ---------------- DETAILS ---------------- */

    detailsBox: {
        marginTop: hScale(10),
        backgroundColor: "#f7f7f7",
        padding: wScale(20),
        borderRadius: wScale(5),
        // marginHorizontal: wScale(10),
    },

    detailsTitle: {
        fontSize: wScale(15),
        color: "#000",
        marginBottom: hScale(12),
        fontWeight: "bold",
    },

    row: {
        marginVertical: hScale(8),
        paddingHorizontal: wScale(15),
    },

    key: {
        color: "#999",
        fontSize: wScale(12),
        marginBottom: hScale(3),
    },

    value: {
        color: "#000",
        fontSize: wScale(14),
        fontWeight: "600",
    },

    returnBtn: {
        alignSelf: "center",
        marginTop: hScale(20),
    },

    returnText: {
        fontSize: wScale(14),
        color: "#1446A0",
        fontWeight: "600",
    },

    callBankBtn: {
        marginTop: hScale(30),
        borderWidth: wScale(1),
        borderColor: "#1446A0",
        paddingVertical: hScale(14),
        marginHorizontal: wScale(25),
        borderRadius: wScale(6),
    },

    callBankText: {
        textAlign: "center",
        fontSize: wScale(16),
        fontWeight: "700",
        color: "#1446A0",
    },

    buncontainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: hScale(20),
        marginBottom: hScale(20),
        paddingHorizontal: wScale(10),
    },

    btn: {
        paddingVertical: hScale(8),
        borderRadius: wScale(10),
        width: "56%",
        justifyContent: "center",
    },

    btn2: {
        paddingVertical: hScale(8),
        alignItems: "center",
        borderRadius: wScale(10),
        flexDirection: "row",
        justifyContent: "space-around",
        width: "40%",
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
        alignItems: "center",
    },
});
