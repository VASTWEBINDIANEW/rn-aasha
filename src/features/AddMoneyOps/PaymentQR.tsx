import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Image, StyleSheet, AsyncStorage, KeyboardAvoidingView, Platform, ScrollView, Button, TouchableOpacity, Keyboard, TextInput, ToastAndroid } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../reduxUtils/store";
import { hScale, wScale } from "../../utils/styles/dimensions";
import CountdownTimer from "../dashboard/components/ContdownTimer";
import { useNavigation } from "../../utils/navigation/NavigationService";
import ShowLoderTr from "../../components/ShowLoderTr";
import QrcodeExpiredSvg from "../drawer/svgimgcomponents/QrcodeExpiredSvg";
import DynamicButton from "../drawer/button/DynamicButton";
import { APP_URLS } from "../../utils/network/urls";
import FlotingInput from "../drawer/securityPages/FlotingInput";
import useAxiosHook from "../../utils/network/AxiosClient";
import { Modal, } from "react-native-paper";
import MovingDotBorderText from "../../components/AnimatedBorderView";
import ClosseModalSvg2 from "../drawer/svgimgcomponents/ClosseModal2";
import ClosseModalSvg from "../drawer/svgimgcomponents/ClosseModal";


export default function PaymentQR({ bharatPeResponse, QrImg, amnt, name, Txnid, onBharatpayresponse }) {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);
    const navigation = useNavigation<any>();
    const [isExpired, setIsExpired] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [utr, setUtr] = useState("");
    const handleExpire = () => {
        setIsExpired(true);

        setTimeout(() => {
            navigation.goBack()
        }, 2000);
    };


    const handleSubmitUTR = () => {
        const trimmedUTR = utr.trim();

        if (!trimmedUTR) {
            ToastAndroid.show("Please enter UTR number", ToastAndroid.SHORT);
            return;
        }

        if (!/^\d{12}$/.test(trimmedUTR)) {
            ToastAndroid.show("UTR must be 12 digits numeric", ToastAndroid.SHORT);
            return;
        }

        if (/\s/.test(trimmedUTR)) {
            ToastAndroid.show("UTR cannot contain spaces", ToastAndroid.SHORT);
            return;
        }

        onBharatpayresponse(Txnid, trimmedUTR);


    };

    useEffect(() => {
        if (bharatPeResponse?.toUpperCase() === "YES") {
            setShowModal(false);
            setUtr("");
        }
    }, [bharatPeResponse]);
    return (
        <ScrollView
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled" >
            <View style={styles.container}>
                <View style={[styles.topHalf,]} />
                <View style={[styles.bottomHalf, { backgroundColor: colorConfig.secondaryColor }]} />
                <View style={styles.centerContent}>
                    {!showModal && <>
                        <Text style={styles.title}>Scan This Amount</Text>
                        <Text style={[styles.subtitle, { backgroundColor: colorConfig.secondaryColor }]}>₹ {amnt}</Text>
                        <View style={styles.qrBox}>
                            {showLoader ? (
                                <ShowLoderTr />
                            ) : !isExpired ? (
                                QrImg ? (
                                    <Image source={{ uri: QrImg }} style={styles.qrImage} />
                                ) : (
                                    <ShowLoderTr />
                                )
                            ) :
                                <View style={{ alignItems: 'center' }}>
                                    <QrcodeExpiredSvg />
                                    <Text style={[styles.expired, { color: '#000' }]}>your QR is expired</Text>

                                </View>
                            }
                        </View>

                        {QrImg && !isExpired && (
                            <CountdownTimer onComplete={handleExpire} initialTime={125} />
                        )}

                        {isExpired &&
                            <Text style={styles.disc}>
                                Regenerate The QR CODE if You Need to add a New Payment
                            </Text>
                        }
                        {name === 'BHARAT PE' &&
                            <TouchableOpacity style={styles.butInput} onPress={() => setShowModal(true)}>
                                <Text style={styles.butInputText}>
                                    Enter Utr No.
                                </Text>
                            </TouchableOpacity>}
                    </>}
                </View>
                <Modal
                    visible={showModal}
                    onDismiss={() => setShowModal(false)}
                    contentContainerStyle={styles.modalContainer}
                >
                    <Text style={styles.modalTitle}>Enter UTR Number</Text>

                    <TextInput
                        value={utr}
                        onChangeText={setUtr}
                        keyboardType="numeric"
                        placeholder="UTR Number"
                        style={styles.modalInput}
                        placeholderTextColor={'#000'}
                    />
                    <DynamicButton title="Submit Paymetnt"
                        onPress={handleSubmitUTR} />
                    <TouchableOpacity style={styles.close} onPress={() => setShowModal(false)}>
                        <ClosseModalSvg />
                    </TouchableOpacity>
                </Modal>
            </View>
        </ScrollView >
    );
}

const styles = StyleSheet.create({

    utrInput: {
        height: hScale(50),
        width: '100%',
        padding: 10
    },
    container: {
        flex: 1,
    },
    input: {
        width: wScale(350),

    },
    topHalf: {
        flex: 1,
        backgroundColor: "#eeede4",
        width: "100%",
    },

    bottomHalf: {
        flex: 1,
        backgroundColor: "#F25E3D",
        width: "100%",
    },

    centerContent: {
        position: "absolute",
        top: "35%",                    // was "40%"
        left: 0,
        right: 0,
        transform: [{ translateY: -hScale(199) }],
        alignItems: "center",
        zIndex: 99,
    },

    title: {
        fontSize: wScale(25),
        fontWeight: "bold",
        color: "#1C3C77",
        alignSelf: 'center',
        textTransform: 'uppercase'
    },
    option: {
        height: hScale(40),
        backgroundColor: '#fff',
        borderRadius: wScale(0),
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: wScale(10),
        paddingHorizontal: wScale(20),
        marginBottom: hScale(20),
    },
    expired: {
        fontSize: wScale(25),
        fontWeight: "bold",
        color: "#1C3C77",
        alignSelf: 'center',
        textTransform: 'uppercase',
        marginTop: hScale(10)
    },
    disc: {
        fontSize: wScale(18),
        alignSelf: 'center',
        color: '#fff',
        textAlign: 'center',
        paddingHorizontal: wScale(33),
        textTransform: 'uppercase',
        marginTop: hScale(10)
    },

    subtitle: {
        marginTop: hScale(8),
        backgroundColor: "#FF6A4D",
        color: "white",
        paddingHorizontal: wScale(20),
        paddingVertical: hScale(6),
        borderRadius: wScale(10),
        fontWeight: "bold",
        fontSize: wScale(32),
    },

    qrBox: {
        marginTop: hScale(20),
        backgroundColor: "white",
        borderRadius: wScale(12),
        width: wScale(315),
        height: wScale(315),
        marginBottom: hScale(10),
        alignItems: 'center',
        justifyContent: 'center'

    },

    qrImage: {
        width: wScale(315),
        height: wScale(315),
        resizeMode: "contain",
        borderRadius: wScale(12),
        alignItems: 'center',
        alignSelf: 'center'

    },
    modalContainer: {
        backgroundColor: "#fff",

        padding: 20,
        borderRadius: 10,
        width: wScale(315),
        height: wScale(205),
        alignSelf: 'center',
    },
    modalTitle: {
        fontSize: 18,
        marginBottom: 20,
        fontWeight: "bold",
        color: '#000',

    },
    modalInput: {
        marginBottom: 20,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: wScale(10),
        fontSize: wScale(19),
        letterSpacing: 2

    },
    butInput: {
        borderWidth: 1,
        borderRadius: 5,
        paddingVertical: hScale(8),
        borderColor: '#fff',
        width: '80%',
        paddingHorizontal: wScale(15),
        marginTop: hScale(20),
    },
    butInputText: {
        fontSize: wScale(18),
        color: '#fff'
    },
    close: {
        position: 'absolute',
        top: hScale(-12),
        right: wScale(-12),
    }
});
