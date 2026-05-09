import { translate } from "../../../utils/languageUtils/I18n";
import React, { useCallback, useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Alert,
    ToastAndroid,
    ScrollView,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    StatusBar,
} from "react-native";
import DynamicButton from "../../drawer/button/DynamicButton";
import FlotingInput from "../../drawer/securityPages/FlotingInput";
import AppBarSecond from "../../drawer/headerAppbar/AppBarSecond";
import { APP_URLS } from "../../../utils/network/urls";
import useAxiosHook from "../../../utils/network/AxiosClient";
import { useSelector } from "react-redux";
import { RootState } from "../../../reduxUtils/store";
import { encrypt } from "../../../utils/encryptionUtils";
import { useDeviceInfoHook } from "../../../utils/hooks/useDeviceInfoHook";
import ShowLoader from "../../../components/ShowLoder";
import { useNavigation } from "../../../utils/navigation/NavigationService";
import LottieView from "lottie-react-native";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import PinInput from "../../../components/PinInput";
import LinearGradient from "react-native-linear-gradient";
import { TextInput } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const { width } = Dimensions.get("window");

const ShowUPIData = ({ route }) => {
    const { userId, Loc_Data, colorConfig } = useSelector((state: RootState) => state.userInfo);
    const {
        primaryColor ,
        secondaryColor ,
        primaryButtonColor,
        secondaryButtonColor ,
        labelColor ,
    } = colorConfig || {};

    const [transpin, setTranspin] = useState("");
    const { upi } = route.params;
    const [amount, setAmount] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { post } = useAxiosHook();
    const { getNetworkCarrier, getMobileDeviceId, getMobileIp } = useDeviceInfoHook();
    const { latitude, longitude } = Loc_Data;
    const navigation = useNavigation();

    // Animations
    const cardAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const row1Anim = useRef(new Animated.Value(0)).current;
    const row2Anim = useRef(new Animated.Value(0)).current;
    const inputAnim = useRef(new Animated.Value(0)).current;
    const btnAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.stagger(80, [
            Animated.spring(cardAnim, { toValue: 1, useNativeDriver: true, friction: 7, tension: 50 }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(row1Anim, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.timing(row2Anim, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.timing(inputAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.timing(btnAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]).start();
    }, []);

    const makeSlide = (anim: Animated.Value, delay = 0) => ({
        opacity: anim,
        transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
    });

    const ONpay = useCallback(async () => {
        setIsLoading(true);

        if (!amount || Number(amount) <= 0) {
            ToastAndroid.show(translate("Enter_valid_amount"), ToastAndroid.SHORT);
            setIsLoading(false);
            return;
        }
        if (Number(amount) < 100) {
            ToastAndroid.show(translate("Amount_minimum_100"), ToastAndroid.SHORT);
            setIsLoading(false);
            return;
        }
        if (!transpin || !(transpin.length === 4 || transpin.length === 6)) {
            ToastAndroid.show(translate("PIN_must_be_4_or_6"), ToastAndroid.LONG);
            setIsLoading(false);
            return;
        }

        try {
            const mobileNetwork = await getNetworkCarrier();
            const ip = await getMobileIp();
            const Model = await getMobileDeviceId();

            const encryption = await encrypt([
                userId, upi.pn, "", "", "", transpin, upi.pa, "UPI",
                "", "", "", "devicetoken", latitude, longitude, Model,
                "", "", "", mobileNetwork, "UPI-" + Date.now(),
            ]);

            const data = {
                umm: encryption.encryptedData[0],
                name: encryption.encryptedData[1],
                snn: encryption.encryptedData[2],
                fggg: encryption.encryptedData[3],
                eee: encryption.encryptedData[4],
                ttt: amount,
                nnn: encryption.encryptedData[5],
                nttt: encryption.encryptedData[6],
                peee: encryption.encryptedData[7],
                nbb: encryption.encryptedData[8],
                bnm: encryption.encryptedData[9],
                kyc: "true",
                ip: encryption.encryptedData[10],
                mac: "",
                ottp: "",
                Devicetoken: encryption.encryptedData[11],
                Latitude: encryption.encryptedData[12],
                Longitude: encryption.encryptedData[13],
                ModelNo: encryption.encryptedData[14],
                Address: encryption.encryptedData[15],
                City: encryption.encryptedData[16],
                PostalCode: encryption.encryptedData[17],
                InternetTYPE: encryption.encryptedData[18],
                value1: encryption.keyEncode,
                value2: encryption.ivEncode,
                uniqueid: encryption.encryptedData[19],
            };

            const response = await post({ url: APP_URLS.dmtapi, data });
            const txn = response?.data?.[0] || {};

            if (txn?.bankrefid === "Wrong Pin!!! Please Enter Correct Pin!!!") {
                ToastAndroid.show(translate("Wrong_PIN"), ToastAndroid.LONG);
                setIsLoading(false);
                return;
            }

            setAmount("");
            setTranspin("");
            navigation.navigate("UpiPayResult", { upi, txn, amount });

        } catch (error) {
            console.log("ERROR:", error);
            Alert.alert(translate("Error"), translate("Something_went_wrong"));
        } finally {
            setIsLoading(false);
        }
    }, [amount, transpin, upi, latitude, longitude]);

    return (
<KeyboardAwareScrollView
  enableOnAndroid={true}
  extraScrollHeight={20}
  keyboardShouldPersistTaps="handled"
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingBottom: hScale(40) }}
>           
           
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Page background gradient */}
            <LinearGradient
                colors={[primaryColor,secondaryColor]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
            />

            {/* Decorative blobs */}
            <View style={[styles.blob1, { backgroundColor: `${primaryColor}18` }]} />
            <View style={[styles.blob2, { backgroundColor: `${secondaryColor}14` }]} />
            <View style={[styles.blob3, { backgroundColor: `${labelColor}12` }]} />

            <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: hScale(40) }}
            >
                <AppBarSecond title={translate("Review_Pay")} onPressBack={() => navigation.goBack()} />

                {/* ── Avatar section ── */}
                <Animated.View
                    style={[
                        styles.avatarWrapper,
                        {
                            opacity: cardAnim,
                            transform: [{
                                translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }),
                            }],
                        },
                    ]}
                >
                    <LinearGradient
                        colors={[`${primaryColor}22`, `${secondaryColor}18`]}
                        style={styles.avatarRing}
                    >
                        <View style={[styles.avatarInner, { backgroundColor: `${primaryColor}15` }]}>
                            <LottieView
                                autoPlay
                                loop
                                style={styles.lottieAvatar}
                                source={require("../../../utils/lottieIcons/profile2.json")}
                            />
                        </View>
                    </LinearGradient>

                    <Text style={[styles.screenTitle, { color: secondaryColor }]}>
                        {translate("Secure_UPI_Transfer")}
                    </Text>
                    <View style={[styles.secureBadge, { backgroundColor: `${labelColor}18`, borderColor: `${labelColor}40` }]}>
                        <View style={[styles.secureDot, { backgroundColor: labelColor }]} />
                        <Text style={[styles.secureBadgeText, { color: labelColor }]}>
                            {translate("End_to_End_Encrypted")}
                        </Text>
                    </View>
                </Animated.View>

                {/* ── Glass Info Card ── */}
                <Animated.View style={[styles.glassCard, makeSlide(fadeAnim)]}>
                    <LinearGradient
                        colors={[`${primaryColor}10`, `${secondaryColor}08`]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={StyleSheet.absoluteFill}
                    />

                    {/* Section header */}
                    <Text style={[styles.sectionLabel, { color: primaryColor }]}>
                        {translate("Recipient_Details")}
                    </Text>

                    {/* Name row */}
                    <Animated.View style={[styles.infoRow, makeSlide(row1Anim)]}>
                        <View style={[styles.infoIconBox, { backgroundColor: `${primaryColor}15` }]}>
                            <Text style={styles.infoIcon}>👤</Text>
                        </View>
                        <View style={styles.infoTextBlock}>
                            <Text style={styles.infoLabel}>{translate("Name")}</Text>
                            <Text style={[styles.infoValue, { color: primaryColor }]}>{upi.pn}</Text>
                        </View>
                        <View style={[styles.verifiedChip, { backgroundColor: `${labelColor}18` }]}>
                            <Text style={[styles.verifiedText, { color: labelColor }]}>✓</Text>
                        </View>
                    </Animated.View>

                    <View style={[styles.divider, { backgroundColor: `${primaryColor}15` }]} />

                    {/* UPI ID row */}
                    <Animated.View style={[styles.infoRow, makeSlide(row2Anim)]}>
                        <View style={[styles.infoIconBox, { backgroundColor: `${secondaryColor}15` }]}>
                            <Text style={styles.infoIcon}>🔗</Text>
                        </View>
                        <View style={styles.infoTextBlock}>
                            <Text style={styles.infoLabel}>{translate("UPI_ID")}</Text>
                            <Text style={[styles.infoValue, { color: secondaryColor }]} numberOfLines={1}>
                                {upi.pa}
                            </Text>
                        </View>
                    </Animated.View>
                </Animated.View>

                {/* ── Payment Card ── */}
                <Animated.View style={[styles.glassCard, makeSlide(inputAnim)]}>
                    <LinearGradient
                        colors={[`${secondaryColor}08`, `${primaryColor}10`]}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 1 }}
                        style={StyleSheet.absoluteFill}
                    />

                    <Text style={[styles.sectionLabel, { color: secondaryColor }]}>
                        {translate("Payment_Details")}
                    </Text>

               <View style={styles.inputContainer}>
  <Text style={styles.label}>{translate("Enter_Amount")}</Text>

  <TextInput
    style={styles.input}
    keyboardType="number-pad"
    value={amount}
    onChangeText={setAmount}
    placeholder={translate("Enter_Amount")}
    placeholderTextColor="#000000"
  />
</View>

                    {/* Amount quick-select chips */}
                    <View style={styles.chipRow}>
                        {["500", "1000", "2000", "5000"].map((val) => (
                            <Animated.View key={val}>
                                <View
                                    style={[
                                        styles.amountChip,
                                        {
                                            borderColor: amount === val ? primaryColor : `${primaryColor}30`,
                                            backgroundColor: amount === val ? `${primaryColor}18` : "rgba(255,255,255,0.5)",
                                        },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            { color: amount === val ? primaryColor : "#888" },
                                        ]}
                                        onPress={() => setAmount(val)}
                                    >
                                        ₹{val}
                                    </Text>
                                </View>
                            </Animated.View>
                        ))}
                    </View>

                    <View style={[styles.pinSection, { borderColor: `${primaryColor}20` }]}>
                    
                        <PinInput value={transpin} onChangeText={setTranspin} />
                    </View>
                </Animated.View>

                {/* ── Pay Button ── */}
                <Animated.View style={[styles.btnWrapper, makeSlide(btnAnim)]}>
                    <DynamicButton
                        title={translate("Pay")}
                        onPress={ONpay}
                        buttonStyle={[styles.payButton, { backgroundColor: primaryButtonColor }]}
                        textStyle={styles.payButtonText}
                    />

                    {/* Amount preview */}
                    {/* {Number(amount) > 0 && (
                        <View style={[styles.amountPreview, { borderColor: `${primaryButtonColor}40` }]}>
                            <Text style={styles.amountPreviewLabel}>{translate("Paying")}</Text>
                            <Text style={[styles.amountPreviewValue, { color: primaryButtonColor }]}>
                                ₹{Number(amount).toLocaleString("en-IN")}
                            </Text>
                        </View>
                    )} */}
                </Animated.View>

                {isLoading && <ShowLoader />}
            </ScrollView>
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    // ── Blobs ──
    blob1: {
        position: "absolute", width: 220, height: 220,
        borderRadius: 110, top: -60, right: -60,
    },
    inputContainer: {
  marginVertical: 10,
},

label: {
  fontSize: 14,
  marginBottom: 5,
  color: '#333',
  fontWeight: '500',
},

input: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  paddingHorizontal: 12,
  height: 45,
  fontSize: 16,
  color: '#000',
  backgroundColor: '#fff',
},
    blob2: {
        position: "absolute", width: 180, height: 180,
        borderRadius: 90, bottom: 100, left: -70,
    },
    blob3: {
        position: "absolute", width: 140, height: 140,
        borderRadius: 70, top: "40%", right: -40,
    },

    // ── Avatar ──
    avatarWrapper: {
        alignItems: "center",
        marginTop: hScale(20),
        marginBottom: hScale(8),
    },
    avatarRing: {
        width: wScale(120),
        height: wScale(120),
        borderRadius: wScale(60),
        padding: 4,
        alignItems: "center",
        justifyContent: "center",
    },
    avatarInner: {
        width: "100%",
        height: "100%",
        borderRadius: wScale(58),
        overflow: "hidden",
    },
    lottieAvatar: {
        width: "100%",
        height: "100%",
    },
    screenTitle: {
        fontSize: hScale(20),
        fontWeight: "800",
        marginTop: hScale(12),
        letterSpacing: 0.2,
    },
    secureBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 50,
        borderWidth: 1,
        marginTop: hScale(6),
    },
    secureDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    secureBadgeText: { fontSize: hScale(11), fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase" },

    // ── Glass Card ──
    glassCard: {
        marginHorizontal: wScale(16),
        marginTop: hScale(14),
        borderRadius: wScale(22),
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.7)",
        backgroundColor: "rgba(255,255,255,0.45)",
        padding: hScale(18),
        // elevation for Android
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
    },
    sectionLabel: {
        fontSize: hScale(11),
        fontWeight: "800",
        letterSpacing: 1.2,
        textTransform: "uppercase",
        marginBottom: hScale(14),
        opacity: 0.85,
    },

    // ── Info Rows ──
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: hScale(6),
    },
    infoIconBox: {
        width: wScale(40),
        height: wScale(40),
        borderRadius: wScale(12),
        alignItems: "center",
        justifyContent: "center",
        marginRight: wScale(12),
    },
    infoIcon: { fontSize: hScale(18) },
    infoTextBlock: { flex: 1 },
    infoLabel: {
        fontSize: hScale(11),
        color: "#999",
        fontWeight: "500",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: hScale(15),
        fontWeight: "700",
    },
    verifiedChip: {
        width: wScale(28),
        height: wScale(28),
        borderRadius: wScale(14),
        alignItems: "center",
        justifyContent: "center",
    },
    verifiedText: { fontSize: hScale(13), fontWeight: "800" },
    divider: { height: 1, marginVertical: hScale(10), borderRadius: 1 },

    // ── Amount chips ──
    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: hScale(10),
        marginBottom: hScale(4),
    },
    amountChip: {
        paddingHorizontal: wScale(14),
        paddingVertical: hScale(7),
        borderRadius: 50,
        borderWidth: 1.5,
    },
    chipText: { fontSize: hScale(13), fontWeight: "700" },

    // ── PIN ──
    pinSection: {
        marginTop: hScale(16),
        paddingTop: hScale(14),
        borderTopWidth: 1,
    },
    pinLabel: {
        fontSize: hScale(13),
        fontWeight: "700",
        marginBottom: hScale(10),
        letterSpacing: 0.3,
    },

    input: {},

    // ── Button ──
    btnWrapper: {
        marginHorizontal: wScale(16),
        marginTop: hScale(20),
    },
    payButton: {
        borderRadius: wScale(16),
        paddingVertical: hScale(16),
        elevation: 6,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 10,
    },
    payButtonText: {
        fontSize: hScale(17),
        fontWeight: "800",
        color: "#000",
        letterSpacing: 0.3,
    },

    // ── Amount preview ──
    amountPreview: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        marginTop: hScale(12),
        paddingVertical: hScale(10),
        borderWidth: 1,
        borderRadius: wScale(12),
        backgroundColor: "rgba(255,255,255,0.5)",
    },
    amountPreviewLabel: { fontSize: hScale(14), color: "#888", fontWeight: "500" },
    amountPreviewValue: { fontSize: hScale(20), fontWeight: "900" },
});

export default ShowUPIData;