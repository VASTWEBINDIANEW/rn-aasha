import { translate } from "../../utils/languageUtils/I18n";
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import useAxiosHook from '../../utils/network/AxiosClient';
import { APP_URLS } from '../../utils/network/urls';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import DateRangePicker from '../../components/DateRange';
import DynamicButton from '../drawer/button/DynamicButton';
import { hScale, wScale } from '../../utils/styles/dimensions';
import { useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import NoDatafound from '../drawer/svgimgcomponents/Nodatafound';

const PurchaseOrderReport = () => {
    const { colorConfig ,IsDealer} = useSelector((state: RootState) => state.userInfo);
    const color1 = `${colorConfig.secondaryColor}20`;
    
    const [inforeport, setInforeport] = useState([]);
    const [loading, setLoading] = useState(true);
    const { post } = useAxiosHook();
    
    const [selectedDate, setSelectedDate] = useState({
        from: new Date().toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
    });
    const [selectedStatus, setSelectedStatus] = useState('ALL');

    useEffect(() => {
        fetchPurchaseOrderReport(selectedDate.from, selectedDate.to, selectedStatus);
    }, [selectedDate, selectedStatus]);

    const fetchPurchaseOrderReport = async (from, to, status) => {
        try {
            setLoading(true);
            const formattedFrom = new Date(from).toISOString().split('T')[0];
            const formattedTo = new Date(to).toISOString().split('T')[0];

            const url2 = `${APP_URLS.DealerPurchaseOrderReport}txt_frm_date=${formattedFrom}&txt_to_date=${formattedTo}`;
            const url = `${APP_URLS.PurchaseOrderReport}txt_frm_date=${formattedFrom}&txt_to_date=${formattedTo}&status=${status}`;
           
           
           console.log('REQ URL',IsDealer?url2: url);
           
            const response = await post({ url :IsDealer?url2: url});
            console.log('API Response:', response);

            if (response?.Message) {
                setInforeport(response.Message);
            } else {
                throw new Error('No data found');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            Alert.alert('Error', 'Failed to load data');
            setInforeport([]);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View style={[styles.card, { backgroundColor: color1, borderColor: colorConfig.secondaryColor }]}>
            <View style={styles.rowview}>
                <Text style={styles.timetex}>{translate("Order_No")}</Text>
                <Text style={styles.amounttex}>{item.orderno}</Text>
            </View>
            <View style={styles.border} />
            <View style={styles.rowview}>
                <Text style={styles.timetex}>{translate("Amount")}</Text>
                <Text style={styles.amounttex}>₹ {item.amount}</Text>
            </View>
            <View style={styles.border} />
            <View style={styles.rowview}>
                <Text style={styles.timetex}>{translate("Paymode")}</Text>
                <Text style={styles.amounttex}>{item.paymode}</Text>
            </View>
            <View style={styles.border} />

               <View style={styles.rowview}>
                <Text style={styles.timetex}>{translate("Request_To")}</Text>
                <Text style={styles.amounttex}>{item.Role}</Text>
            </View>
            <View style={styles.border} />
            <View style={styles.rowview}>
                <Text style={styles.timetex}>{translate("Status")}</Text>
                <Text style={styles.timetex}>{item.sts === 'APPROVED' ? 'APPROVED' : item.sts === 'Pending' ? 'Pending' : 'REJECTED'}     {item.sts === 'APPROVED' ? '✅' : item.sts === 'Pending' ? '⌛' : '❌'}</Text>
            </View>
        </View>
    );

    const handleLoadMore = () => {

    };

    return (
        <View style={styles.main}>
            <AppBarSecond title="Purchase Orders Report" />
            <DateRangePicker
                onDateSelected={(from, to) => setSelectedDate({ from, to })}
                SearchPress={(from, to, status) => fetchPurchaseOrderReport(from, to, status)}
                status={selectedStatus}
                setStatus={setSelectedStatus}
            isshowRetailer={false}
                isStShow={true} 
            />
            <View style={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" color="#4CAF50" />
                ) : (
                    inforeport.length === 0 ? (
                       <NoDatafound/>
                    ) : (
                        <FlatList
                            data={inforeport}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => index.toString()}
                            ListFooterComponent={
                                inforeport.length > 10 ? (
                                    <DynamicButton onPress={handleLoadMore} title={'Load More'} />
                                ) : null
                            }
                        />
                    )
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    main: { flex: 1 },
    container: { flex: 1, paddingHorizontal: wScale(10), paddingVertical: hScale(20) },
    card: {
        marginBottom: hScale(10),
        borderWidth: wScale(0.7),
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        paddingHorizontal: wScale(10),
        paddingVertical: hScale(8),
    },
    rowview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    border: {
        borderBottomWidth: wScale(0.7),
        borderColor: '#000',
        marginVertical: hScale(4),
    },
    amounttex: {
        fontSize: wScale(15),
        color: '#000',
        fontWeight: 'bold',
    },
    timetex: {
        fontSize: 14,
        color: '#000',
    },
    textrit: {
        textAlign: 'right',
    },
});

export default PurchaseOrderReport;
