import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert, ToastAndroid } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { translate } from '../../../utils/languageUtils/I18n';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import NoDatafound from '../../drawer/svgimgcomponents/Nodatafound';
import ShowLoader from '../../../components/ShowLoder';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';

const DealerRecentTra = () => {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);
    const color1 = `${colorConfig.secondaryColor}20`;
    const [dealerDetails, setDealerDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
    const { get } = useAxiosHook();

    const fetchDealerRecentHistory = async () => {
        try {
            const res = await get({ url: APP_URLS._Recent_Dealer_Transaction });
            console.log(res);
            if (res) {
                setDealerDetails(res);
            } else {
                ToastAndroid.show(res.message || 'Please try after sometime', ToastAndroid.BOTTOM);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDealerRecentHistory();
    }, []);

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.row}>
                <View style={styles.column}>
                    <View style={styles.details}>
                        <Text style={styles.label}>{translate('Date')}: {item.Date}</Text>
                        <Text style={styles.label}>{translate('Type')}: {item.Operator_type}</Text>
                    </View>
                </View>
                <View style={styles.amountContainer}>
                    <Text style={styles.label}>{translate('Amount')}</Text>
                    <Text style={styles.amount}>₹{item.Amount}</Text>
                </View>
            </View>
            <View style={[styles.separator2, { backgroundColor: colorConfig.secondaryColor }]} />

            <Text style={styles.description}>{translate('Description')}: {item.Description}</Text>
            <View style={styles.balanceContainer}>
                <View style={styles.balanceItem}>
                    <Text style={styles.label}>{translate('Pre Bal')}</Text>
                    <Text style={styles.value}>₹{item.UserPre}</Text>
                </View>
                <View style={styles.balanceItem}>
                    <Text style={styles.label}>{translate('Post Bal')}</Text>
                    <Text style={styles.value}>₹{item.UserPost}</Text>
                </View>
                <View style={styles.balanceItem}>
                    <Text style={styles.label}>{translate('Commission')}</Text>
                    <Text style={styles.value}>₹{item.Comm}</Text>
                </View>
                <View style={styles.balanceItem}>
                    <Text style={styles.label}>{item.Dr === 0 ? translate('Credit') : translate('Debit')}</Text>
                    <Text style={styles.value}>₹{item.Dr === 0 ? item.Cr : item.Dr}</Text>
                </View>
            </View>
        </View>
    );

    if (loading) {
        return <ShowLoader />;
    }

    if (dealerDetails.length === 0) {
        return <NoDatafound />;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={dealerDetails}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
            />
        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wScale(5)
    },
    card: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 15,
        marginVertical: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    separator2: {
        flex: 1,
        height: 1,
        marginBottom: hScale(4),
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    column: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    details: {
        flexDirection: 'column',
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    amount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
    },
    description: {
        marginTop: 5,
        fontSize: 12,
        color: '#666',
    },
    balanceContainer: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    balanceItem: {
        marginBottom: 5,
    },
    value: {
        fontSize: 14,
        fontWeight: '400',
        color: '#555',
    },
});

export default DealerRecentTra;
