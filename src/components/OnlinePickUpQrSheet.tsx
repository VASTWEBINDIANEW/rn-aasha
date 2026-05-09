import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    ToastAndroid,
    Keyboard,
    Alert,
    Image,
} from "react-native";
import { BottomSheet } from "@rneui/themed";
import LinearGradient from "react-native-linear-gradient";
import CloseSvg from "../features/drawer/svgimgcomponents/CloseSvg";
import { useSelector } from "react-redux";
import { RootState } from "../reduxUtils/store";
import QRCode from "react-native-qrcode-svg";
import { hScale, wScale } from "../utils/styles/dimensions";
import DynamicButton from "../features/drawer/button/DynamicButton";

const parseUPIParams = (url: string) => {
    if (!url) return {};
    try {
        const parts = url.split("?");
        if (parts.length < 2) return {};

        const query = parts[1];
        const pairs = query.split("&");

        const params: Record<string, string> = {};
        pairs.forEach((pair) => {
            const [key, value] = pair.split("=");
            if (key) {
                params[key] = decodeURIComponent(value || "");
            }
        });

        return {
            vpa: params["pa"] || "",
            payee: params["pn"] || "",
        };
    } catch (e) {
        console.warn("UPI parse error:", e);
        return {};
    }
};

const OnlinePickUpQrSheet = ({
    isVisible,
    setIsVisible,
    url,
    utr,
    setUtr,
    am,
    onUpload,
    currentPreviewImageRef,
}) => {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}20`;

    const { vpa, payee } = useMemo(() => parseUPIParams(url), [url]);

    const [utrSubmitted, setUtrSubmitted] = useState(false);

console.log(utr.length)
const handleUtrSubmit = useCallback(() => {
    Keyboard.dismiss();
    if (!utr || utr.length < 12) {
        ToastAndroid.show("UTR must be at least 12 characters", ToastAndroid.SHORT);
        return;
    }

    Alert.alert(
        "Verify UTR",
        `You entered UTR is:\n\n${utr}\n\nAre you sure you want to submit?`,
        [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Sure",
                onPress: () => setUtrSubmitted(true),
            },
        ],
        { cancelable: true }
    );
}, [utr]);


    const handleUpload = useCallback(() => {
        if (currentPreviewImageRef) {
            setIsVisible(false);
        } else {
            onUpload();
        }
    }, [currentPreviewImageRef]);

    return (
        <View style={styles.container}>
            <BottomSheet
        animationType="none"  
                isVisible={isVisible}
                onBackdropPress={() => setIsVisible(false)}
            >
                <View style={styles.sheetContent}>
                    {/* Gradient Header */}
                    <LinearGradient
                        colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
                        style={styles.header}
                    >
                        <Text style={styles.title}>State Bank Of India  ₹{am}.00</Text>
                        <TouchableOpacity onPress={() => setIsVisible(false)}>
                            <CloseSvg color="#fff" size={28} />
                        </TouchableOpacity>
                    </LinearGradient>

                    {/* Payee / VPA */}
                    {vpa ? (
                        <View style={{ marginTop: 16, alignItems: "center" }}>
                            <Text style={styles.payeeText}>Payee: {payee}</Text>
                            <Text style={styles.vpaText}>VPA: {vpa.toLocaleUpperCase()}</Text>

                           { utr.length >= 12 &&<Text style={styles.payeeText}>UTR No: {utr}</Text>
 }
                        </View>
                    ) : null}

                    {/* QR Box */}
                    <View style={styles.qrBox}>
                      {currentPreviewImageRef ? <Image
        source={{ uri: currentPreviewImageRef }}
        style={styles.image}
        resizeMode="contain"
      /> :<QRCode
                            value={url || "https://sbi.co.in"}
                            size={hScale(220)}
                            color={colorConfig.secondaryColor}
                            backgroundColor="#fff"
                        />}
                    </View>

                    {/* UTR Input + Submit Button */}
                    {!utrSubmitted && (
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter UTR (min 12 chars)"
                                value={utr}
                                onChangeText={setUtr}
                                autoCapitalize="characters"
                                maxLength={26}
                                placeholderTextColor="#94A3B8"
                            />
                            <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={handleUtrSubmit}
                                disabled={utr.length < 12}
                                style={[
                                    styles.utrButton,
                                    { backgroundColor: utr.length >= 12 ? colorConfig.primaryColor : color1 },
                                ]}
                            >
                                <Text style={styles.utrButtonText}>(Submit)</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Upload Payment Proof (after UTR submitted) */}
                    {utrSubmitted && (
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={handleUpload}
                            style={{ width: "100%", marginTop: 20, padding: 5 }}
                        >
                            <DynamicButton
                                title={currentPreviewImageRef ? "Done" : "Upload Payment Proof"}
                                onPress={handleUpload}
                                styleoveride={undefined}
                            />
                        </TouchableOpacity>
                    )}
                </View>
            </BottomSheet>
        </View>
    );
};

const styles = StyleSheet.create({


     image: { width: 200, height: 200, borderRadius: 8 },
    container: { flex: 1 },
    sheetContent: {
        backgroundColor: "#fff",
        padding: 0,
        borderTopLeftRadius: hScale(24),
        borderTopRightRadius: hScale(24),
        overflow: "hidden",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: wScale(20),
        paddingVertical: hScale(14),
    },
    title: { fontSize: hScale(20), fontWeight: "700", color: "#fff" },
    qrBox: {
        backgroundColor: "#F9FAFB",
        padding: hScale(18),
        borderRadius: hScale(18),
        marginTop: hScale(20),
        alignItems: "center",
        alignSelf: "center",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: hScale(6),
        elevation: 4,
    },
    payeeText: { fontSize: hScale(16), fontWeight: "600", color: "#1E293B" },
    vpaText: { fontSize: hScale(14), color: "#475569", marginTop: hScale(2) },
    inputRow: {
        flexDirection: "row",
        marginTop: hScale(16),
        width: "100%",
        paddingHorizontal: wScale(20),
        paddingVertical: wScale(10),
        alignItems: "center",
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: hScale(12),
        paddingHorizontal: wScale(14),
        height: hScale(50),
        fontSize: hScale(16),
        color: "#111827",
        backgroundColor: "#F8FAFC",
        elevation: 2,
        marginRight: wScale(10),
    },
    utrButton: {
        height: hScale(50),
        borderRadius: hScale(12),
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: wScale(20),
    },
    utrButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: hScale(16),
    },
});


export default OnlinePickUpQrSheet;
