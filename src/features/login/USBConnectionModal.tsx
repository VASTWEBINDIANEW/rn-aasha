import { translate } from "../../utils/languageUtils/I18n";
import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Animated // <-- Correct import
} from 'react-native';
import UsbSvg from '../drawer/svgimgcomponents/UsbSvg';
import { hScale, wScale } from '../../utils/styles/dimensions';
import { useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';

const USBConnectionModal = ({ visible, onClose }) => {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);
    const colorAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(colorAnim, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: false,
                }),
                Animated.timing(colorAnim, {
                    toValue: 0,
                    duration: 1500,
                    useNativeDriver: false,
                }),
            ])
        ).start();
    }, [colorAnim]);

    const backgroundColor = colorAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['#eb5e34', '#ebdf34'],
    });

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Animated.View style={[styles.iconContainer, { backgroundColor }]}>
                        <UsbSvg size={64} />
                    </Animated.View>

                    <Text style={styles.title}>{translate("Active_USB_Connection_Detected")}</Text>

                    <Text style={styles.message}>{translate("key_dearcusto_158")}</Text>

                    <Text style={[styles.note, { backgroundColor: `${colorConfig.secondaryColor}1A` }]}>{translate("key_refrainfr_159")}</Text>

                    <TouchableOpacity
                        style={[styles.closeButton, { backgroundColor: colorConfig.secondaryButtonColor }]}
                        onPress={onClose}
                    >
                        <Text style={styles.closeButtonText}>{translate("Close_App")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        margin: wScale(20),
        backgroundColor: 'white',
        borderRadius: wScale(10),
        padding: hScale(15),
        width: '90%',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: hScale(2),
        },
        shadowOpacity: 0.25,
        shadowRadius: hScale(4),
        elevation: 5,
        alignItems: 'center',
    },
    iconContainer: {
        width: wScale(100),
        height: hScale(100),
        borderRadius: wScale(60),
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: hScale(15),
    },
    title: {
        fontSize: hScale(18),
        fontWeight: 'bold',
        marginBottom: hScale(15),
        textAlign: 'center',
        color: '#333',
    },
    message: {
        fontSize: hScale(14),
        marginBottom: hScale(15),
        textAlign: 'center',
        color: '#555',
        lineHeight: hScale(20),
    },
    note: {
        fontSize: hScale(12),
        marginBottom: hScale(20),
        textAlign: 'center',
        color: '#333',
        fontStyle: 'italic',
        padding: wScale(5),
        borderRadius: wScale(5),
    },
    closeButton: {
        borderRadius: wScale(5),
        elevation: hScale(2),
        width: '100%',
    },
    closeButtonText: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: hScale(15),
    },
});

export default USBConnectionModal;
