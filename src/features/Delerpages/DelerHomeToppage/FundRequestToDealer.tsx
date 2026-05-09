import { translate } from "../../../utils/languageUtils/I18n";
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, TextInput, Modal, ToastAndroid } from 'react-native';
import { useSelector } from 'react-redux';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import DateRangePicker from '../../../components/DateRange';
import NoDatafound from '../../drawer/svgimgcomponents/Nodatafound';
// import useAxiosHook from '../utils/network/AxiosClient';
// import { APP_URLS } from '../utils/network/urls';
// import AppBarSecond from '../features/drawer/headerAppbar/AppBarSecond';
// import DateRangePicker from './DateRange';
// import DynamicButton from '../features/drawer/button/DynamicButton';
// import { hScale, wScale } from '../utils/styles/dimensions';

const FundRequestToDealer = () => {
    const { colorConfig } = useSelector((state) => state.userInfo);
    const color1 = `${colorConfig.secondaryColor}20`;

    const [inforeport, setInforeport] = useState([]);
    const [loading, setLoading] = useState(true);
    const { post, get } = useAxiosHook();

    const [selectedDate, setSelectedDate] = useState({
        from: new Date().toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
    });
    const [selectedStatus, setSelectedStatus] = useState('ALL');

    const [isDialogVisible, setIsDialogVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    useEffect(() => {
        fetchRequestFromRetailerReport(selectedDate.from, selectedDate.to, selectedStatus);
    }, [selectedDate, selectedStatus]);

    const fetchRequestFromRetailerReport = async (from, to, status) => {
        try {
            setLoading(true);
            const formattedFrom = new Date(from).toISOString().split('T')[0];
            const formattedTo = new Date(to).toISOString().split('T')[0];

            const url = `${APP_URLS.retailerFundRequest}txt_frm_date=${formattedFrom}&txt_to_date=${formattedTo}&status=${status}`;
            const response = await get({ url });

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

    const Reject_Accept = async (id, type, cmt) => {
        const url = `${APP_URLS.update_purchase}hdidno=${id}&hdtype=${type}&txtcommentwrite=${cmt}`;

        const res = await post({ url });
        if (res.Response == 'Failed') {
            ToastAndroid.show(res.Message, ToastAndroid.LONG)
        } else {
            alert(res.Message);
        }
        console.log(res)
    };

    const RejectRequestDialog = ({ isVisible, onClose, onSubmit }) => {
        const [inputText, setInputText] = useState('');
        const [isLoading, setIsLoading] = useState(false);

        const handleSubmit = async () => {
            setIsLoading(true);
            await onSubmit(inputText);
            setIsLoading(false);
            onClose();
        };

        return (
            <Modal
                visible={isVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={onClose}
            >
                <View style={styles.modalBackground}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{translate("Reject_Request")}</Text>
                            <TouchableOpacity onPress={onClose}>
                                <Text style={styles.closeButton}>{translate("X")}</Text>
                            </TouchableOpacity>
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter Comment"
                            value={inputText}
                            onChangeText={setInputText}
                        />
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Submit</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
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
                <Text style={styles.timetex}>
                    {item.sts === 'APPROVED' ? 'APPROVED ' : item.sts === 'Pending' ? 'Pending ' : 'REJECTED '}
                    {item.sts === 'APPROVED' ? ' ✅' : item.sts === 'Pending' ? ' ⌛' : ' ❌'}
                </Text>
            </View>
            {item.sts === 'Pending' && <View style={styles.border} />
            }
            {item.sts === 'Pending' && (
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => Reject_Accept(item.idno, 'APP', item.details)}
                    >
                        <Text style={styles.actionButtonText}>{translate("Approve")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            setSelectedItem(item);
                            setIsDialogVisible(true);
                        }}
                    >
                        <Text style={styles.actionButtonText}>{translate("Reject")}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const handleSubmit = (comment) => {
        if (selectedItem) {
            Reject_Accept(selectedItem.idno, 'noAPP', comment);
        }
    };

    return (
        <View style={styles.main}>
            <DateRangePicker
                onDateSelected={(from, to) => setSelectedDate({ from, to })}
                SearchPress={(from, to, status) => fetchRequestFromRetailerReport(from, to, status)}
                status={selectedStatus}
                setStatus={setSelectedStatus}
                isStShow={true}
            />
            <RejectRequestDialog
                isVisible={isDialogVisible}
                onClose={() => setIsDialogVisible(false)}
                onSubmit={handleSubmit}
            />
            <View style={styles.container}>
                {loading ? (
                    <ActivityIndicator size="large" color="#4CAF50" />
                ) : (
                    inforeport.length === 0 ? (
                        <NoDatafound />
                    ) : (
                        <FlatList
                            data={inforeport}
                            renderItem={renderItem}
                            keyExtractor={(item, index) => index.toString()}
                        />
                    )
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    main: { flex: 1 },
    container: {
        flex: 1, paddingHorizontal: wScale(10),
        paddingVertical: hScale(20)
    },
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
    modalBackground: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    modalContainer: {
        width: '80%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: 10,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingLeft: 10,
        marginBottom: 20,
    },
    submitButton: {
        backgroundColor: '#28a745',
        paddingVertical: 5,
        alignItems: 'center',
        borderRadius: 5,
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    actionButton: {
        backgroundColor: '#28a745',
        paddingVertical: 5,
        paddingHorizontal: 5,
        borderRadius: 5,
        marginTop: 5,
        marginBottom: 5,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
});

export default FundRequestToDealer;
