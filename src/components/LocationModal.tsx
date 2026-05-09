import { translate } from "../utils/languageUtils/I18n";
import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LocationSvg from '../features/drawer/svgimgcomponents/LocationSvg';
import LocationCmsSvg from '../features/drawer/svgimgcomponents/LocationCmsSvg';
import { hScale, wScale } from '../utils/styles/dimensions';

const LocationModal = ({ visible, onClose }) => {
    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Please Note That it's{"\n"} <Text style={styles.important}>{translate("Important")}</Text></Text>
                    <View style={{ alignSelf: 'center' }}>
                        <LocationCmsSvg />

                    </View>
                    <Text style={styles.message}>{translate("key_youarecu_128")}</Text>

                    <Text style={styles.solutionTitle}>{translate("What_can_be_the_solution")}</Text>
                    <Text style={styles.solutionText}>{translate("key_ifyoua_129")}</Text>
                    <Text style={styles.solutionText}>{translate("key_ifyoua_130")}</Text>
                    <Text style={styles.solutionText}>{translate("key_turnon_131")}</Text>
                    <Text style={styles.solutionText}>{translate("key_ifthere_132")}</Text>

                    <TouchableOpacity style={styles.button} onPress={onClose}>
                        <Text style={styles.buttonText}>{translate("I_Understood")}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default LocationModal;

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: wScale(10),
        paddingVertical: wScale(20),
        borderRadius: 10,
    },
    title: {
        fontSize: 24,
        color: '#fff',
        marginBottom: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    important: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: 35,
        textTransform: 'uppercase',
        letterSpacing: 0,

    },
    message: {
        color: '#fff',
        fontSize: 14,
        marginVertical: hScale(10),
        textAlign: 'justify',
        fontWeight: 'bold'
    },
    solutionTitle: {
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 5,
    },
    solutionText: {
        color: '#fff',
        fontSize: 13,
        marginBottom: 5,
        textAlign: 'justify',
    },
    button: {
        marginTop: 15,
        backgroundColor: '#ffff66',
        padding: 12,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
    },
});
