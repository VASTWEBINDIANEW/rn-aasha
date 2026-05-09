import { translate } from "../../utils/languageUtils/I18n";
import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import useAxiosHook from '../../utils/network/AxiosClient';
import { APP_URLS } from '../../utils/network/urls';
import { useSelector } from 'react-redux';
import { hScale } from '../../utils/styles/dimensions';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';

const finocmsReport = () => {
    const [transactions, setTransactions] = useState([]);
    const [present, setPresent] = useState(10);
    const [selectedFilter, setSelectedFilter] = useState('ALL');
    const [loading, setLoading] = useState(false);
    const [fromDate, setFromDate] = useState(new Date(2022, 2, 16));
    const [toDate, setToDate] = useState(new Date());
    const { get } = useAxiosHook();
    const { userId } = useSelector((state) => state.userInfo);

    useEffect(() => {
        recentTransactions();
    }, [selectedFilter, fromDate, toDate]);

    const recentTransactions = async () => {
        try {
            setLoading(true);
            const formattedFromDate = fromDate.toISOString().split('T')[0];
            const formattedToDate = toDate.toISOString().split('T')[0];
            const url = `${APP_URLS.finocmsReport}from=${formattedFromDate}&to=${formattedToDate}&status=${selectedFilter}&number=`;

            const response = await get({ url });
            console.log('finocmsReport', response);

            if (response.status === 'SUCCESS') {
                const transactionsData = response['Response'] || [];
                setTransactions(transactionsData);
            } else {
                setTransactions([]);
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        setPresent((prev) => prev + 10);
    };

    const handleFromDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || fromDate;
        setFromDate(currentDate);
    };

    const handleToDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || toDate;
        setToDate(currentDate);
    };

    const TransactionDetails = ({ item }) => {
        return (
            <View style={styles.card}>
                <View style={styles.tileHeader}>
                    <View style={styles.tileTitle}>
                        <Text style={styles.text}>{`Operator Name: ${item.optcode}`}</Text>
                        <Text style={styles.text}>{`Request Date: ${item.req_time ? item.req_time : "0 0 0"}`}</Text>
                        <Text style={styles.text}>{`Mobile Number: ${item.number}`}</Text>
                        <Text style={styles.text}>{`Status: ${item.sts ? item.sts : "0 0 0"}`}</Text>
                        <Text style={styles.text}>{`Pre Balance: ₹ ${item.rem_pre}`}</Text>
                        <Text style={styles.text}>{`Post Balance: ₹ ${item.rem_post}`}</Text>
                        <Text style={styles.text}>{`Amount: ₹ ${item.amount}`}</Text>
                    </View>
                    <View style={styles.tileStatus}>
                        <Text style={styles.amountText}>{`₹ ${item.amount}`}</Text>
                    </View>
                </View>
            </View>
        );
    };

    const Options = () => {
        const buttonData = [
            { title: 'All', key: 'ALL' },
            { title: 'Success', key: 'Success' },
            { title: 'Failed', key: 'Failed' },
            { title: 'Pending', key: 'Pending' },
        ];

        const handlePress = (key) => {
            setSelectedFilter(key);
        };

        return (
            <View style={styles.optionsContainer}>
                {buttonData.map((button) => (
                    <TouchableOpacity
                        key={button.key}
                        style={[
                            styles.optionButton,
                            selectedFilter === button.key && styles.selectedOptionButton,
                        ]}
                        onPress={() => handlePress(button.key)}
                    >
                        <Text
                            style={[
                                styles.optionButtonText,
                                selectedFilter === button.key && styles.selectedOptionButtonText,
                            ]}
                        >
                            {button.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <AppBarSecond title="Fino Cms Report" />
            <View style={styles.datePickerContainer}>
                <Text style={styles.datePickerLabel}>{translate("From")}</Text>
                <Text style={styles.datePickerLabel}>{translate("To")}</Text>
            </View>
            <Options />
            {loading ? (
                <ActivityIndicator size="large" color="#4CAF50" />
            ) : (
                transactions.length === 0 ? (
                    <Text style={styles.noDataText}>{translate("No_data_found")}</Text>
                ) : (
                    <FlatList
                        data={transactions.slice(0, present)}
                        renderItem={({ item }) => <TransactionDetails item={item} />}
                        keyExtractor={(item, index) => index.toString()}
                        ListFooterComponent={
                            transactions.length > present ? (
                                <TouchableOpacity style={styles.loadMoreButton} onPress={handleLoadMore}>
                                    <Text style={styles.loadMoreText}>{translate("Load_More")}</Text>
                                </TouchableOpacity>
                            ) : null
                        }
                    />
                )
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    datePickerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
    },
    datePickerLabel: {
        fontSize: 16,
        color: '#333',
    },
    optionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#E0E0E0',
        borderRadius: 8,
        marginHorizontal: 16,
        marginVertical: 10,
    },
    optionButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 8,
        backgroundColor: '#9E9E9E',
    },
    selectedOptionButton: {
        backgroundColor: '#4CAF50',
    },
    optionButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    selectedOptionButtonText: {
        color: '#FFF',
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 5,
        elevation: 3,
    },
    tileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    tileTitle: {
        flex: 3,
    },
    tileStatus: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    text: {
        fontSize: 14,
        color: '#333',
        marginVertical: 2,
    },
    amountText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    noDataText: {
        textAlign: 'center',
        marginVertical: 20,
        fontSize: 18,
        color: '#D32F2F',
    },
    loadMoreButton: {
        backgroundColor: '#757575',
        padding: 10,
        alignItems: 'center',
        marginVertical: 16,
        borderRadius: 8,
        marginHorizontal: 16,
    },
    loadMoreText: {
        color: '#FFF',
        fontSize: 16,
    },
});

export default finocmsReport;
