import { translate } from "../../../utils/languageUtils/I18n";
import {
    StyleSheet,
    Text,
    ToastAndroid,
    TouchableOpacity,
    View,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import DateRangePicker from '../../../components/DateRange';
import { FlashList } from '@shopify/flash-list';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import NoDatafound from '../../drawer/svgimgcomponents/Nodatafound';
import ShowLoader from '../../../components/ShowLoder';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { useFocusEffect } from '@react-navigation/native';
import BorderLine from '../../../components/BorderLine';
import CheckSvg from '../../drawer/svgimgcomponents/CheckSvg';
import WalletCard from '../RadiantTrxn/WalletCard';
import DynamicButton from '../../drawer/button/DynamicButton';
import ImagePreviewModal from '../Radiantregister/ImagePreviewModal';
import { tr } from 'date-fns/locale';
import ShareSvg from '../../drawer/svgimgcomponents/sharesvg';
import ViewShot, { captureRef } from 'react-native-view-shot';
import Share from "react-native-share";

const CashDepositReport = () => {
    const { colorConfig, } = useSelector((state: RootState) => state.userInfo);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(false);
    const [selectedImageUri, setSelectedImageUri] = useState('');
    const [shouldShare, setShouldShare] = useState(false);

    const [selectedDate, setSelectedDate] = useState({
        from: new Date().toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
    });
    const headers = ['500', '200', '100', '50', '20', '10', '5', 'Coins'];

    const { post } = useAxiosHook();

    useFocusEffect(
        useCallback(() => {
            const today = new Date().toISOString().split('T')[0];
            const resetDate = { from: today, to: today };
            setSelectedDate(resetDate);
            fetchReport(resetDate.from, resetDate.to,);
        }, [])
    );

    const fetchReport = async (from, to,) => {
        setLoading(true);
        try {
            const formattedFrom = new Date(from).toISOString().split('T')[0];
            const formattedTo = new Date(to).toISOString().split('T')[0];

            const url = `${APP_URLS.CashDepositeReport}from=${formattedFrom}&to=${formattedTo}`;
            console.log("API URL:", url);

            const res = await post({
                url: url,
            });
            console.log(url, '///uuu');

            console.log("API Response:", res,);
            setReportData(res?.Content || []);
        } catch (error) {
            console.error('API Error:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (visible && shouldShare) {
            const timer = setTimeout(() => {
                onShare();
                setShouldShare(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [visible, shouldShare, onShare]);

    const capRef = useRef();

    const onShare = useCallback(async () => {
        try {
            await Share.open({
                message: translate(`key_hiiams_47 ${APP_URLS.AppName} App.`),
                url: selectedImageUri,
            });
        } catch (e) {
            console.error("Share error:", e);
            ToastAndroid.show("Transaction details not shared", ToastAndroid.SHORT);
        }
    }, [selectedImageUri]);

    const handleDateSelection = (from, to,) => {
        setSelectedDate({ from, to });
        fetchReport(from, to,);
    };
    const renderItem = ({ item, index }) => (
        <View style={[styles.card, {
            backgroundColor: `${colorConfig.secondaryColor}1A`

        }]}>
            <View >
                <View style={[styles.row, {
                    backgroundColor: colorConfig.secondaryColor, borderTopRightRadius: 10, borderTopLeftRadius: 10,
                    paddingVertical: hScale(5)
                }]}>

                    <View style={styles.item}>
                        <Text style={[styles.timeLabel,]}>{translate("Payment_To")}</Text>
                        <Text style={[styles.timeVabel, { letterSpacing: 1 }]}>
                            {item.Mode !== 'BARRELCASHDEPOSIT' && item.Mode !== 'ONLINETRANSFER'
                                ? item.ClientName
                                : 'Radiant Cash Management'}
                        </Text>
                    </View>
                    <View style={styles.item2}>
                        <Text style={[styles.timeLabel,]}>{translate("Deposit_Slip_Uploaded_Time")}</Text>
                        <Text style={[styles.timeVabel, { fontWeight: 'bold' }]}>
                            {item.InsertDate}</Text>
                    </View>
                </View>

                <View style={[styles.rMargin, {
                    borderColor: colorConfig.secondaryColor,

                }]}>
                    <View style={styles.row}>
                        <View style={styles.item}>
                            <Text style={styles.label}>{translate("Payment_Mode")}</Text>
                            <Text style={styles.label}>{translate("AC_No")}</Text>

                        </View>
                        <View style={styles.item2}>
                            <Text style={styles.value}>{item.Mode}</Text>
                            <Text style={styles.value}>{item.RadiantAccount}</Text>
                        </View>
                    </View>
                    <BorderLine height={.5} />

                    <View style={styles.row}>
                        <View style={styles.item}>
                            <Text style={styles.label}>{translate("Bank_Name")}</Text>
                            <Text style={styles.label}>{translate("Status")}</Text>

                        </View>
                        <View style={styles.item2}>
                            <Text style={styles.value}>{item.RadiantBank}</Text>
                            <Text style={styles.value}>{item.Status}</Text>
                        </View>
                    </View>
                    <BorderLine height={.5} />


                    <View style={[styles.row, {

                    }]}>

                        <View style={styles.item}>
                            <Text style={styles.label}>{translate("Deposit_Amount")}</Text>
                        </View>



                        <View style={styles.item2}>
                            <Text style={styles.value}>{item.Amount}</Text>
                        </View>

                    </View>


                    {item.Mode === 'ONLINETRANSFER' && <View style={[styles.row,]}>

                        <View style={styles.item}>
                            <Text style={styles.label}>{translate("UTR_No")}</Text>
                        </View>

                        <View style={styles.item2}>
                            <Text style={styles.value}>{item.UTRnumber}</Text>
                        </View>


                    </View>}




                    <View style={styles.buncontainer}>
                        <View
                            style={[
                                styles.btn2,
                                { backgroundColor: `${colorConfig.secondaryColor}80` },
                            ]}
                        >

                            <TouchableOpacity
                                onPress={async () => {
                                    try {
                                        await Share.open({
                                            message: translate(`key_hiiams_47 ${APP_URLS.AppName} App.`),
                                            url: item.DepositeSlip,
                                        });
                                    } catch (e) {
                                        console.error("Share error:", e);
                                        ToastAndroid.show("Transaction details not shared", ToastAndroid.SHORT);
                                    }
                                }}
                                style={styles.homebtn}
                            >
                                <Text style={[styles.btntext, { color: colorConfig.labelColor }]}>{translate("Share_Slip")}</Text>
                                <ShareSvg color={colorConfig.labelColor} />
                            </TouchableOpacity>

                        </View>
                        <TouchableOpacity
                            onPress={() => {
                                setSelectedImageUri(item.DepositeSlip);
                                setVisible(true);
                            }}
                            style={[styles.btn, { backgroundColor: `${colorConfig.secondaryColor}80` },
                            ]}
                        >
                            <Text style={[styles.btntext, { color: colorConfig.labelColor }]}>{translate("View_Slip_Image")}</Text>
                        </TouchableOpacity>
                    </View>


                </View>
            </View>
        </View >
    );

    return (
        <View style={styles.main}>
            <AppBarSecond title={'Cash & Online Deposit Report'} />
            <DateRangePicker

                SearchPress={() => fetchReport(selectedDate.from, selectedDate.to,)}
                onDateSelected={(from, to) => handleDateSelection(from, to,)}
                isshowRetailer={false}


            />
            <View style={styles.container}>
                <ViewShot ref={capRef}
                    options={{
                        fileName: "TransactionReciept",
                        format: "jpg",
                        quality: 0.9,
                    }}>
                    <ImagePreviewModal
                        visible={visible}
                        imageUri={selectedImageUri}
                        onClose={() => setVisible(false)}
                        saveClose={() => setVisible(false)}
                        reUpload={() => undefined}
                        reUploadBtn={false}
                    />
                </ViewShot>
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

                    />
                ) : (
                    <NoDatafound />
                )}
            </View>
        </View>
    );
};

export default CashDepositReport;

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: '#fff'
    },
    container: {
        flex: 1,
        paddingVertical: hScale(15)
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
        fontSize: wScale(12),
        color: '#fff',
        textTransform: 'uppercase'
    },

    smspanding: {
        fontSize: wScale(12),
        marginBottom: hScale(4),
        backgroundColor: '#7cf7c8',
        paddingHorizontal: wScale(2),
        textAlign: 'center'
    },
    topbar: { marginHorizontal: hScale(10) },

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
    check: {
        height: wScale(25),
        width: wScale(25),
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: wScale(10)
    },
    buncontainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: hScale(10),
        flex: 1,
    },
    btn: {
        paddingVertical: hScale(8),
        borderRadius: 10,
        width: '56%',
        justifyContent: 'center'
    },
    btn2: {
        paddingVertical: hScale(8),
        alignItems: 'center',
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '40%',
        paddingHorizontal: wScale(4),
    },
    btnborder: {
        borderRightWidth: wScale(0.5),
        height: "100%",
        borderColor: "rgba(255,255,255,0.5)",
    },
    btntext: {
        color: "#fff",
        fontSize: wScale(20),
        fontWeight: "bold",
        textAlign: "center",
    },
    homebtn: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center'
    }
});
