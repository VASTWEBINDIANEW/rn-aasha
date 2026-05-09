import { translate } from "../../utils/languageUtils/I18n";
import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import useAxiosHook from '../../utils/network/AxiosClient';
import { APP_URLS } from '../../utils/network/urls';
import { useSelector } from 'react-redux';
import { hScale } from '../../utils/styles/dimensions';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import Icon from 'react-native-vector-icons/Ionicons';

const AirtelcmsReport = () => {
    const [transactions, setTransactions] = useState([]);
    const [present, setPresent] = useState(10);
    const [selectedFilter, setSelectedFilter] = useState('ALL');
    const [loading, setLoading] = useState(false);
    const { post,get } = useAxiosHook();
    const { userId } = useSelector((state) => state.userInfo);
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];

    useEffect(() => {
        recentTransactions();
    }, [selectedFilter]);

    const recentTransactions = async () => {
        try {
            setLoading(true);
            const url = `${APP_URLS.AirtelcmsReport}from=2022-03-16&to=${formattedDate}&status=${selectedFilter}&number=`;
            console.log(url);


  const response = await get({ url });
            console.log('AirtelcmsReport', response);

            if(response.status === 'SUCCESS'){
  const transactionsData = response['Response'] || [];
                setTransactions(transactionsData);
           
            }else{
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
            <View style={styles.row}>
                {buttonData.map((button) => (
                    <TouchableOpacity
                        key={button.key}
                        style={[
                            styles.button,
                            { backgroundColor: selectedFilter === button.key ? '#4CAF50' : '#8BC34A' },
                        ]}
                        onPress={() => handlePress(button.key)}
                    >
                        <Text style={styles.buttonText}>{button.title}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <AppBarSecond title="Fino Cms Report" />
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
        backgroundColor: '#E8F5E9',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: hScale(16),
        marginBottom: hScale(16),
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: {
            width: 1,
            height: 1,
        },
        shadowOpacity: 0.3,
        shadowRadius: 2,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: hScale(17),
        marginHorizontal: hScale(10),
    },
    button: {
        flex: 1,
        marginHorizontal: hScale(5),
        paddingVertical: hScale(17),
        borderRadius: hScale(5),
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: hScale(17),
    },
    loadMoreButton: {
        backgroundColor: '#757575',
        padding: hScale(10),
        alignItems: 'center',
        marginVertical: hScale(16),
        borderRadius: 5,
    },
    loadMoreText: {
        color: 'white',
        fontSize: hScale(16),
    },
    tileHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: hScale(8),
        backgroundColor: '#C8E6C9',
        borderRadius: 5,
    },
    tileTitle: {
        flex: 3,
        paddingRight: hScale(8),
    },
    tileStatus: {
        flex: 1,
        alignItems: 'flex-end',
    },
    text: {
        
        fontSize: hScale(14),
        marginVertical: hScale(2),
    },
    textBold: {
        fontSize: hScale(14),
        fontWeight: 'bold',
        marginVertical: hScale(2),
    },
    statusText: {
        fontSize: hScale(14),
        marginVertical: hScale(2),
    },
    amountText: {
        fontSize: hScale(14),
        fontWeight: 'bold',
        marginVertical: hScale(2),
    },
    noDataText: {
        textAlign: 'center',
        marginVertical: hScale(20),
        fontSize: hScale(18),
        color: '#D32F2F',
    },
});

export default AirtelcmsReport;
