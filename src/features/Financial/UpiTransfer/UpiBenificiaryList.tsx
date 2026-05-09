import { translate } from "../../../utils/languageUtils/I18n";
import React, { useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '../../../utils/navigation/NavigationService';

const BeneficiaryList = ({ bankList, onImpsPress, onNeftPress, onDeletePress, onVerifyPress }) => {

    const renderItem = ({ item, index }) => (
        <View style={styles.itemContainer}>
            <Text style={styles.itemText}>Bank Name: {item.bankName}</Text>
            <Text style={styles.itemText}>IFSC Code: {item.ifscCode}</Text>
            <Text style={styles.itemText}>Sender Name: {item.senderName}</Text>
            <Text style={styles.itemText}>Mobile Number: {item.mobileNumber}</Text>
            <View style={styles.buttonContainer}>
                <Button title="IMPS" onPress={() => onImpsPress(item)} color="#007bff" />
                <Button title="NEFT" onPress={() => onNeftPress(item)} color="#28a745" />
                <Button title="Delete" onPress={() => onDeletePress(item)} color="#dc3545" />
                <TouchableOpacity>
                    {item.isLoading ? (
                        <ActivityIndicator color="red" />
                    ) : (
                        <Button title="Verify" onPress={() => onVerifyPress(item, index)} color="#17a2b8" />
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <FlatList
            data={bankList}
            renderItem={renderItem}
            keyExtractor={(item) => item.ifscCode}
        />
    );
};

const BanificaryBanklist = (bankList:any) => {
    const navigation = useNavigation<any>()

  /*   const [bankList, setBankList] = useState([
        { bankName: 'Bank A', ifscCode: 'ABC123', senderName: 'Vishal Wanjari', mobileNumber: '1234567890', isLoading: false },
        { bankName: 'Bank B', ifscCode: 'DEF456', senderName: 'Gangadhar N', mobileNumber: '0987654321', isLoading: false },
    ]); */

    const handleImpsPress = (item) => {
        console.log('IMPS pressed for:', item);
    };


    const handleNeftPress = (item) => {
        console.log('NEFT pressed for:', item);
    };

    const handleDeletePress = (item) => {
        console.log('Delete pressed for:', item);
       // setBankList(prevList => prevList.filter(beneficiary => beneficiary.ifscCode !== item.ifscCode));
    };

    const handleVerifyPress = (item, index) => {
        console.log('Verify pressed for:', item);
        const updatedBankList = [...bankList];
        updatedBankList[index].isLoading = true;
     //   setBankList(updatedBankList);
        setTimeout(() => {
            updatedBankList[index].isLoading = false;
           // setBankList(updatedBankList);
        }, 200);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{translate("Beneficiary_List")}</Text>
            <BeneficiaryList
                bankList={bankList}
                onImpsPress={handleImpsPress}
                onNeftPress={handleNeftPress}
                onDeletePress={handleDeletePress}
                onVerifyPress={handleVerifyPress}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    itemContainer: {
        backgroundColor: '#f9f9f9',
        padding: 20,
        marginVertical: 5,
        marginHorizontal: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    itemText: {
        fontSize: 16,
        marginBottom: 10,
    },
    buttonContainer: { 
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
});

export default BanificaryBanklist;
