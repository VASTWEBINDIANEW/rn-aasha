
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal } from 'react-native';
import ClosseModalSvg from '../features/drawer/svgimgcomponents/ClosseModal';
import { useSelector } from 'react-redux';
import { RootState } from '../reduxUtils/store';
import { hScale, wScale } from '../utils/styles/dimensions';
import { translate } from '../utils/languageUtils/I18n';

const VerifyMobileNumber = ({ visible, onClose, isCpin = false, handleSubmit }) => {
    const [mobileNumber, setMobileNumber] = useState('');
    const { colorConfig, } = useSelector((state: RootState) => state.userInfo);



    return (
        <View style={styles.container}>
            <Modal
                transparent={true}
                animationType="slide"
                visible={visible}
                onRequestClose={onClose}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.header}>
                            <Text style={styles.modalTitle}> {isCpin ? translate('Verify CPIN') : translate('Verify Mobile Number')}</Text>
                            <TouchableOpacity onPress={onClose}>
                                <ClosseModalSvg />
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder={isCpin ? translate('Enter your Cpin') : translate("Enter your mobile number")}
                            placeholderTextColor="#000"
                            value={mobileNumber}
                            onChangeText={setMobileNumber}
                            keyboardType="phone-pad"
                        />
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.button, { backgroundColor: colorConfig.secondaryColor }]} onPress={() => handleSubmit(mobileNumber)}>
                                <Text style={styles.buttonText}>{translate("Submit")}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#1e201d',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        width: wScale(330), // Approx 85% of typical screen width
        backgroundColor: '#fff',
        borderRadius: wScale(10),
        padding: wScale(20),
        alignItems: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        alignItems: 'center',
        marginBottom: hScale(20),
    },
    modalTitle: {
        fontSize: hScale(20),
        fontWeight: 'bold',
        color: '#000',
    },
    cancelText: {
        color: '#e45a55',
        fontWeight: 'bold',
        fontSize: hScale(16),
    },
    input: {
        width: '100%',
        height: hScale(40),
        borderColor: '#000',
        borderWidth: 1,
        borderRadius: wScale(5),
        marginBottom: hScale(20),
        paddingHorizontal: wScale(10),
        color: '#000',
        fontSize: hScale(16),
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        flex: 1,
        marginHorizontal: wScale(5),
        padding: wScale(10),
        borderRadius: wScale(5),
        backgroundColor: '#e45a55',
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: hScale(16),
    },
});


export default VerifyMobileNumber;
