import { translate } from "../../../../utils/languageUtils/I18n";
import React, { useEffect } from "react";
import { Text, View, StyleSheet, TouchableOpacity } from "react-native";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import AppBarSecond from "../../drawer/headerAppbar/AppBarSecond";

const AepsResponse = ({ route }) => {
    const { Date, openbal, Type, Amount, closebal } = route.params.ministate;

    useEffect(() => {
        console.log(route.params);
    }, []);
const {mode}=route.params
    return (
        <View style={styles.main}>
            <AppBarSecond title={mode} />
            <View style={styles.container}>
                <View style={styles.itemContainer}>
                    <Text style={styles.label}>{translate("Date")}</Text>
                    <Text style={styles.listItemText}>{Date}</Text>
                </View>
                <View style={styles.itemContainer}>
                    <Text style={styles.label}>{translate("Opening_Balance")}</Text>
                    <Text style={styles.listItemText}>{openbal}</Text>
                </View>
                <View style={styles.itemContainer}>
                    <Text style={styles.label}>{translate("Transaction_Type")}</Text>
                    <Text style={styles.listItemText}>{Type}</Text>
                </View>
                <View style={styles.itemContainer}>
                    <Text style={styles.label}>{translate("Amount")}</Text>
                    <Text style={styles.listItemText}>{Amount}</Text>
                </View>
                <View style={styles.itemContainer}>
                    <Text style={styles.label}>{translate("Closing_Balance")}</Text>
                    <Text style={styles.listItemText}>{closebal}</Text>
                </View>
{/* 
                <TouchableOpacity style={styles.button} onPress={() => console.log('Button pressed')}>
                    <Text style={styles.buttonText}>{translate("Share_Button")}</Text>
                </TouchableOpacity> */}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    container: {
        flex: 1,
        paddingHorizontal: wScale(15),
        paddingVertical: hScale(20),
    },
    itemContainer: {
        backgroundColor: '#ffffff',
        marginBottom: hScale(10),
        padding: hScale(15),
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    label: {
        fontSize: 14,
        color: '#888',
        marginBottom: 5,
    },
    listItemText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#444',
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: hScale(12),
        borderRadius: 6,
        marginTop: hScale(20),
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

export default AepsResponse;
