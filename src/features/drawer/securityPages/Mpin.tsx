import { translate } from "../../../utils/languageUtils/I18n";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import Entypo from 'react-native-vector-icons/Entypo';  // or another icon set like MaterialIcons
import { wScale } from '../../../utils/styles/dimensions';
import PinVerificationModal from './PinVerify';
import { setMpin } from '../../../reduxUtils/store/userInfoSlice';

const Mpin = () => {

    const dispatch =useDispatch()
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [isNewPinVisible, setIsNewPinVisible] = useState(false);
    const [isConfirmPinVisible, setIsConfirmPinVisible] = useState(false);
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);

    const handleSetPin = () => {
        if (newPin === '' || confirmPin === '') {
            setError('Both fields are required');
            return;
        }

        if (newPin.length < 4 || newPin.length > 6) {
            setError('PIN must be between 4 and 6 digits');
            return;
        }

        if (confirmPin.length < 4 || confirmPin.length > 6) {
            setError('Confirm PIN must be between 4 and 6 digits');
            return;
        }

        // Check if both pins match
        if (newPin !== confirmPin) {
            setError('Pins do not match');
            return;
        }
dispatch(setMpin(confirmPin))
        setError('');
        Alert.alert('Success', 'Your pin has been set successfully!');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>{translate("Set_Your_Pin")}</Text>
            <Text style={styles.text}>{translate("key_thispinw_139")}</Text>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Enter New Pin"
                    secureTextEntry={!isNewPinVisible}
                    value={newPin}
                    onChangeText={setNewPin}
                    keyboardType="number-pad"
                    maxLength={6}
                />
                <TouchableOpacity onPress={() => setIsNewPinVisible(prev => !prev)} style={styles.iconContainer}>
                    {/* <Entypo
                        name={isNewPinVisible ? "eye" : "eye-with-line"}
                        size={wScale(25)}
                        color={colorConfig.primaryColor}
                    /> */}
                </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Confirm Pin"
                    secureTextEntry={!isConfirmPinVisible}
                    value={confirmPin}
                    onChangeText={setConfirmPin}
                    keyboardType="number-pad"
                    maxLength={6}
                />
                <TouchableOpacity onPress={() => setIsConfirmPinVisible(prev => !prev)} style={styles.iconContainer}>
                    <Entypo
                        name={isConfirmPinVisible ? "eye" : "eye-with-line"}
                        size={wScale(25)}
                        color={colorConfig.primaryColor}
                    />
                </TouchableOpacity>
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handleSetPin}>
                <Text style={styles.buttonText}>{translate("Set_Pin")}</Text>
            </TouchableOpacity>

            <Text style={styles.footerText}>{translate("Make_sure_to_remember_your_pin")}</Text>

            <PinVerificationModal
                isVisible={false}
                onClose={() => false} 
                onSuccess={(t) => { console.log(t) }} 
            />


        </View>
    );
};

export default Mpin;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F4F8', 
        padding: 20,
    },
    heading: {
        fontSize: 26,
        fontWeight: '700',
        marginBottom: 20,
        color: '#333',
    },
    text: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginBottom: 15,
        position: 'relative', 
    },
    input: {
        flex: 1,
        height: 50,
        borderColor: '#B0BEC5',
        borderWidth: 1,
        borderRadius: 12,
        paddingLeft: 15,
        fontSize: 18,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    iconContainer: {
        position: 'absolute',
        right: 20, 
    },
    errorText: {
        color: '#D32F2F',
        fontSize: 14,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#00796B', 
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginTop: 20,
        shadowColor: '#000',
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '500',
    },
    footerText: {
        marginTop: 20,
        fontSize: 14,
        color: '#777',
        textAlign: 'center',
    },
});
// PinVerificationModal.js

