import React, { useState } from "react";
import {
    View,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Keyboard,
    ToastAndroid,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { useSelector } from "react-redux";
import { RootState } from "../reduxUtils/store";

const PinInput = ({ value, onChangeText }) => {
    const { userId, Loc_Data ,colorConfig} = useSelector((state: RootState) => state.userInfo);
    const [secure, setSecure] = useState(true);

    const handleChange = (txt) => {
        // Remove spaces
        const cleaned = txt.replace(/\s/g, "");

        // Allow only numbers
        if (!/^\d*$/.test(cleaned)) return;

        // Allow only max 6 digits
        if (cleaned.length <= 6) {
            onChangeText(cleaned);
        }
    };

    const validatePin = () => {
        if (value.length !== 4 && value.length !== 6) {
            ToastAndroid.show("PIN must be 4 or 6 digits", ToastAndroid.SHORT);
        }
    };

    return (
        <View style={[styles.inputContainer,{backgroundColor:`${colorConfig.secondaryColor}30`}]}>
            <TextInput
                style={styles.textInput}
                placeholder="Enter Transaction PIN"
                keyboardType="number-pad"
                maxLength={6}
                secureTextEntry={secure}
                value={value}
                onChangeText={handleChange}
                returnKeyType="done"
                onBlur={validatePin}
                onSubmitEditing={() => {
                    validatePin();
                    Keyboard.dismiss();
                }}
            />

            <TouchableOpacity
                onPress={() => setSecure(!secure)}
                style={styles.eyeButton}
            >
                <Icon
                    name={secure ? "visibility-off" : "visibility"}
                    size={24}
                    color="#444"
                />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F7F8FA",
        borderRadius: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: "#DDD",
        marginTop: 20,
    },

    textInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
    },

    eyeButton: {
        padding: 5,
    },
});

export default PinInput;
