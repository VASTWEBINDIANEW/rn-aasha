import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image,
} from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import DateRangePicker from '../../../components/DateRange';
import { FlashList } from '@shopify/flash-list';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import NoDatafound from '../../drawer/svgimgcomponents/Nodatafound';
import ShowLoader from '../../../components/ShowLoder';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Octicons from 'react-native-vector-icons/Octicons';
import DynamicButton from '../../drawer/button/DynamicButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import { useFocusEffect } from '@react-navigation/native';
import BorderLine from '../../../components/BorderLine';
import WalletCard from './WalletCard';

const InprocessReportCms = () => {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);
    const navigation = useNavigation<any>();
    const [selectedCount, setSelectedCount] = useState(0);
    const [hasPending, setHasPending] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState(0);
    const [requestid, setrequestid] = useState([]);
    const [ceId, setceId] = useState([]);
    const [checked, setChecked] = useState(false);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const headers = ['500', '200', '100', '50', '20', '10', '5', 'Coins'];

    const { post } = useAxiosHook();

    useFocusEffect(
        useCallback(() => {
          
            fetchReport();
        }, [])
    );

    const fetchReport = async () => {
        setLoading(true);
        try {

            const url = `${APP_URLS.CashpickupInprocessReport}`;
            console.log("API URL:", url);

            const res = await post({
                url: url,
            });

            console.log("API Response:", res, res.Content[0].ceId, '000');
        

            const contentData = res?.Content || [];

            if (Array.isArray(contentData)) {
                const filteredData = contentData
                    .filter(item => item.Reqsts === 'Inprocess')
                    .map(item => ({ ...item, checked: false }));

                setReportData(filteredData);
                setHasPending(filteredData.length > 0);
            } else {
                setReportData([]);
                setHasPending(false);
            }

            setChecked(false);
            setSelectedCount(0);
            setSelectedAmount(0);
        } catch (error) {
            console.error('API Error:', error);
        } finally {
            setLoading(false);
        }
    };



    const toggleGroupCheckbox = () => {
        const newChecked = !checked;
        setChecked(newChecked);

        const updatedList = reportData.map(item =>
            item.Reqsts === 'Inprocess' ? { ...item, checked: newChecked } : item
        );

        setReportData(updatedList);

        const selectedItems = newChecked ? updatedList.filter(item => item.checked) : [];

        setSelectedCount(selectedItems.length);

        const totalAmount = selectedItems.reduce((sum, item) => {
            const amount = parseFloat(item.Amountpaid ? item.pickup_amount - item.Amountpaid : item.pickup_amount) || 0;
            return sum + amount;
        }, 0);
        setSelectedAmount(totalAmount);

        const requestidd = selectedItems.map(item => item.Requestid);
        const ceIdd = selectedItems.length > 0 ? selectedItems[0].ceId : null;
        setrequestid(requestidd);
        setceId(ceIdd);
    };



    const handleItemCheckboxToggle = (index) => {
        const updatedList = [...reportData];
        updatedList[index].checked = !updatedList[index].checked;

        const selectedItems = updatedList.filter(item => item.checked);

        setReportData(updatedList);
        setSelectedCount(selectedItems.length);

        const totalAmount = selectedItems.reduce((sum, item) => {
            const amount = parseFloat(item.Amountpaid ? item.pickup_amount - item.Amountpaid : item.pickup_amount) || 0;
            return sum + amount;
        }, 0);
        setSelectedAmount(totalAmount);

        const requestidd = selectedItems.map(item => item.Requestid);
        const ceIdd = selectedItems.length > 0 ? selectedItems[0].ceId : null;
        setrequestid(requestidd);
        setceId(ceIdd);

        const allSelected = updatedList.every(item =>
            item.Reqsts === 'Inprocess' ? item.checked : true
        );
        setChecked(allSelected);
    };


    const renderItem = ({ item, index }) => (
        <View style={[styles.card, {
            backgroundColor: `${colorConfig.secondaryColor}1A`, borderColor: colorConfig.secondaryColor

        }]}>
            <View >
                <View style={[styles.row, {
                    backgroundColor: colorConfig.secondaryColor,
                    borderTopRightRadius: 10, borderTopLeftRadius: 10,
                    paddingVertical: hScale(5)
                }]}>
                    {item.Reqsts === 'Inprocess' ? (
                        <TouchableOpacity style={{ paddingRight: wScale(7) }} onPress={() => handleItemCheckboxToggle(index)}>

                            <MaterialIcons
                                name={item.checked ? 'check-circle' : 'radio-button-unchecked'}
                                size={24}
                                color="#fff"
                            />
                        </TouchableOpacity>
                    ) : null}
                    <View style={styles.item}>
                        <Text style={[styles.timeLabel,]}>Transaction ID</Text>
                        <Text style={[styles.timeVabel, { letterSpacing: 1 }]}>{item.transId}</Text>
                    </View>
                    <View style={styles.item2}>
                        <Text style={[styles.timeLabel,]}>Pickup Slip Uploaded Time</Text>
                        <Text style={[styles.timeVabel,]}>
                            {item.Insertdate}</Text>
                    </View>
                </View>

                <View style={[styles.rMargin, {
                    borderColor: colorConfig.secondaryColor,
                }]}>
                    <View style={styles.row}>
                        <View style={styles.item}>
                            <Text style={styles.label}>HCL SLIP -</Text>
                        </View>
                        <View style={styles.item2}>
                            <Text style={styles.value}>{item.hcl_no ?? 0.0}</Text>
                        </View>
                    </View>

                    <View style={[styles.row, {
                        backgroundColor: '#f1f1f1',
                        borderRadius: 5, elevation: 2,
                        marginTop: hScale(2)
                    }]}>

                        <View style={styles.item}>
                            <Text style={styles.label}>PickUp Amount</Text>
                            <Text style={styles.value}>{item.pickup_amount}</Text>
                        </View>
                        <BorderLine height='100%' width={.3} />

                        <View style={styles.item3}>
                            <Text style={styles.label}>Paid Amount</Text>
                            <Text style={styles.value}>{item.Amountpaid === null ? 0 : item.Amountpaid}</Text>
                        </View>
                        <BorderLine height='100%' width={.3} />

                        <View style={styles.item2}>
                            <Text style={styles.label}>Remain Amount</Text>
                            <Text style={styles.value}>{item.pickup_amount - item.Amountpaid}</Text>
                        </View>

                    </View>

                    <View style={styles.row}>

                        <View style={styles.item}>
                            <Text style={[styles.value, { textAlign: 'center', fontWeight: 'normal', fontSize: wScale(14) }]}>{item.Cust_name}</Text>
                            <Text style={[styles.value, { textAlign: 'center', fontWeight: 'normal', fontSize: wScale(11) }]}>{item.Point_name}</Text>
                        </View>



                    </View>
                    <BorderLine height={.5} />

                    <Text style={styles.currencylabel}>
                        indian currency denominations
                    </Text>
                    <View style={[styles.table, { borderColor: colorConfig.secondaryColor }]}>

                        <View style={styles.row2}>
                            {headers.map((item, index) => (
                                <Text key={index} style={[styles.cell, {
                                    borderColor: colorConfig.secondaryColor,
                                    borderTopWidth: 0,
                                    borderLeftWidth: index === 0 ? 0 : .5,
                                },
                                styles.header,
                                ]}
                                >
                                    {item === 'Coins' ? item : `₹ ${item}`}
                                </Text>
                            ))}
                        </View>

                        <View style={styles.row2}>
                            <Text style={[styles.cell, { borderColor: colorConfig.secondaryColor, borderLeftWidth: 0 }]}>{item.s500}</Text>
                            <Text style={[styles.cell, { borderColor: colorConfig.secondaryColor }]}>{item.s200}</Text>
                            <Text style={[styles.cell, { borderColor: colorConfig.secondaryColor }]}>{item.s100}</Text>
                            <Text style={[styles.cell, { borderColor: colorConfig.secondaryColor }]}>{item.s50}</Text>
                            <Text style={[styles.cell, { borderColor: colorConfig.secondaryColor }]}>{item.s20}</Text>
                            <Text style={[styles.cell, { borderColor: colorConfig.secondaryColor }]}>{item.s10}</Text>
                            <Text style={[styles.cell, { borderColor: colorConfig.secondaryColor }]}>{item.s5}</Text>
                            <Text style={[styles.cell, { borderColor: colorConfig.secondaryColor }]}>{item.coins}</Text>
                        </View>
                    </View>

                    <View >
                        {item.Reqsts === 'Inprocess' && !checked && !item.checked && (
                            <DynamicButton
                                title={'Pay Individual Entry'}
                                onPress={() => {
                                    navigation.navigate("Totalpayreport", {
                                        Individualrequestid: item.Requestid,
                                        selectedAmount: item.Amountpaid ? item.pickup_amount - item.Amountpaid : item.pickup_amount,
                                        PaymentMode: "Individual",
                                        ceId: item.ceId,
                                    },)
                                }
                                }
                            />
                        )}
                    </View>
                </View>
            </View>
        </View >
    );

    return (
        <View style={styles.main}>
            <AppBarSecond title={'Due Payments Info'} />
            <View>
                <WalletCard />
            </View>

            {hasPending && (
                <View style={[styles.topbar, {
                    backgroundColor: colorConfig.secondaryColor,
                    borderRadius: wScale(8),
                }]}>
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}>
                        <TouchableOpacity style={styles.checkview} onPress={toggleGroupCheckbox}>
                            <MaterialIcons
                                name={checked ? 'check-circle' : 'radio-button-unchecked'}
                                size={24}
                                color="#fff"
                            />


                            <Text style={styles.labelength}>
                                {checked ? 'All Selected Entries' : `Selected Entries ${selectedCount}`}
                            </Text>

                            {selectedCount > 0 ? (
                                <TouchableOpacity
                                    onPress={() =>
                                        navigation.navigate("Totalpayreport", {
                                            selectedAmount,
                                            requestid,
                                            PaymentMode: 'GroupPay',
                                            ceId,
                                        })
                                    }
                                    style={[styles.gpaybtn,]}
                                >
                                    <Text style={[styles.paybtntxt]}>
                                        PAY NOW ₹ {selectedAmount.toFixed(2)}
                                    </Text>
                                </TouchableOpacity>
                            ) : (
                                <Text style={[styles.paybtntxt,]}>Group PAY</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            <View style={styles.container}>
                {loading ? (
                    <ShowLoader />
                ) : reportData.length > 0 ? (
                    <FlashList
                        data={reportData}
                        renderItem={renderItem}
                        keyExtractor={(item, index) =>
                            item?.transRecId ? `${item.transRecId}-${index}` : `${index}`
                        }
                        estimatedItemSize={100}
                        extraData={checked}

                    />
                ) : (
                    <NoDatafound />
                )}
            </View>
        </View>
    );
};

export default InprocessReportCms;

const styles = StyleSheet.create({
    main: { flex: 1, backgroundColor: '#fff' },
    container: {
        flex: 1,
        paddingVertical: hScale(15),
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        paddingVertical: hScale(2),
        alignItems: 'center',
        paddingHorizontal: wScale(4)
    },
    rMargin: {

        paddingHorizontal: wScale(8),
        borderWidth: wScale(1),
        borderBottomRightRadius: wScale(10),
        borderBottomLeftRadius: wScale(10),
        paddingBottom: hScale(10)
    },
    card: {
        marginBottom: hScale(15),
        borderRadius: wScale(10),

        backgroundColor: '#f9f9f9',
        marginHorizontal: wScale(10),
    },
    item: {
        flex: 1,
    },
    item2: {
        flex: 1,
        alignItems: 'flex-end'
    },
    item3: {
        flex: 1,
        alignItems: 'center',
    },
    label: {
        fontSize: wScale(14),
        color: '#000',

    },
    timeLabel: {
        fontSize: wScale(10),
        color: '#fff',
        fontWeight: 'bold',
        letterSpacing: 1

    },
    labelength: {
        fontSize: wScale(16),
        marginLeft: wScale(5),
        flex: 1,
        textAlign: 'left',
        color: '#fff',
    },
    value: {
        fontWeight: 'bold',
        fontSize: wScale(15),
        color: '#000',
        textTransform: 'capitalize'
    },
    timeVabel: {
        fontWeight: 'bold',
        fontSize: wScale(14),
        color: '#fff',
        textTransform: 'uppercase'
    },
    checkview: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: wScale(1),
        borderColor: '#ddd',
        borderRadius: wScale(8),
        paddingLeft: wScale(8),

    },
    gpaybtn: {
        borderLeftWidth: wScale(1),
        borderColor: '#ddd',
        borderRadius: wScale(8),
        backgroundColor: '#000'

    },
    paybtntxt: {
        fontSize: wScale(14),
        color: '#fff',
        textTransform: 'capitalize',
        fontWeight: 'bold',
        paddingHorizontal: wScale(10),
        paddingVertical: hScale(12)
    },

    smspanding: {
        fontSize: wScale(12),
        marginBottom: hScale(4),
        backgroundColor: '#7cf7c8',
        paddingHorizontal: wScale(2),
        textAlign: 'center'
    },
    topbar: { marginHorizontal: hScale(10) ,marginTop:hScale(10)},

    table: {
        borderWidth: .2,
        borderColor: '#ccc',
        overflow: 'hidden',
        marginBottom: hScale(10)
    },
    row2: {
        flexDirection: 'row',
    },
    cell: {
        flex: 1,
        textAlign: 'center',
        borderLeftWidth: 0.5,
        borderTopWidth: 0.5,
        color: '#000'
    },
    currencylabel: {
        flex: 1,
        textAlign: 'center',
        color: '#000',
        fontSize: wScale(18),
        letterSpacing: 2,
        textTransform: 'capitalize'
    },
    header: {
        fontWeight: 'bold',
        backgroundColor: '#eef6ff',
        color: '#000',
    },
});


