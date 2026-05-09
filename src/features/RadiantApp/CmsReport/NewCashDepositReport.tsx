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
import { FlashList } from '@shopify/flash-list';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import NoDatafound from '../../drawer/svgimgcomponents/Nodatafound';
import ShowLoader from '../../../components/ShowLoder';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import BorderLine from '../../../components/BorderLine';
import CheckSvg from '../../drawer/svgimgcomponents/CheckSvg';
import StatusCalendar from '../../../components/CalendarDropdown/StatusCalendar';
import PaddingSvg2 from '../../drawer/svgimgcomponents/PaddingSvg2';
import FailedSvg from '../../drawer/svgimgcomponents/Failedimg';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SimpleImageViwer from '../../../components/imagesheet';
import ViewShot from 'react-native-view-shot';
import { shareSlipImage } from '../../../utils/shareSlipImage ';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import TransactionResultSheet from '../../../components/ReusableComponents/TransactionResultSheet';
import { clearEntryScreen } from '../../../reduxUtils/store/userInfoSlice';

const NewCashDepositReport = () => {
    const { colorConfig, cmsAddMFrom } = useSelector((state: RootState) => state.userInfo);
    const [reportData, setReportData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [photoUri, setPhotoUri] = useState('');
    const [selectedTxn, setSelectedTxn] = useState<any>(null);
    const { post } = useAxiosHook();

    const capRef = useRef();
    const navigation = useNavigation()
    const handleSearch = ({ from, to, status }) => {
        fetchReport(from, to, status);
    };
    const handleShare = () => {
        shareSlipImage(capRef);
    }
    const handleGoback = () => {
        setShowResult(false);
        clearEntryScreen(null)
        navigation.navigate('RadiantTransactionScreen');

    }
    console.log(cmsAddMFrom, '🟰🟰🟰🟰', showResult);

    const fetchReport = async (from, to, status) => {
        setLoading(true);
        try {
            const url = `${APP_URLS.CashDepositReport}?Fromdate=${from}&todate=${to}&Status=${status}`;
            console.log('API URL 🟰:', url);

            const res = await post({ url });
            console.log('DATA 👉', res);
            setReportData(res)
            setPhotoUri(res.Slipname)
        } catch (error) {
            console.error('API Error:', error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (
            reportData?.length > 0 &&
            cmsAddMFrom === "otherPayment" &&
            !showResult
        ) {
            setSelectedTxn(reportData[0]);
            setShowResult(true);
        }
    }, [reportData, cmsAddMFrom]);

    const buildImageUrl = (path) => {
        if (!path) return '';
        return `http://native.${APP_URLS.baseWebUrl + path}`;
    };
    console.log();

    const renderItem = ({ item }) => {
        // Define status colors
        const status_Colors = {
            pending: { color: "#fa9507", bg: "#fcf9f5" },
            failed: { color: "red", bg: "#f9e4e2" },
            success: { color: "#4b853e", bg: "#e8f5e1" },
        };

        // Normalize status field (your API uses "Status" not "sts")
        const rawStatus = (item.Status || item.sts || "").toLowerCase();
        const { color, bg } = status_Colors[rawStatus] || {
            color: "#000",
            bg: "#f0f0f0",
        };

        return (
            <ViewShot ref={capRef}
                options={{
                    fileName: "TransactionReciept",
                    format: "jpg",
                    quality: 0.9,
                }}
            >
                <View
                    style={[
                        styles.card,
                        {
                            backgroundColor: bg,
                            borderColor: color,
                        },
                    ]}
                >
                    {/* Header Row */}
                    <View style={[styles.row, { backgroundColor: color }, styles.headerRow]}>
                        <View style={styles.item}>
                            <Text style={styles.timeLabel}>{translate("Request_Insert_Time")}</Text>
                            <Text style={[styles.timeVabel, { letterSpacing: 0 }]}>
                                {item.Insertdate}
                            </Text>
                        </View>
                        <View style={styles.item2}>
                            <Text style={styles.timeLabel}>{translate("Request_Update_Time")}</Text>
                            <Text style={styles.timeVabel}>{item.Updatedate || "N/A"}</Text>
                        </View>
                    </View>

                    <View style={[styles.rMargin, { borderColor: color }]}>
                        <View style={styles.row}>
                            <View style={styles.item}>
                                <Text style={styles.label}>{translate("Account_Number")}</Text>
                                <Text style={styles.value}>{item.Accountnumber || "NULL"}</Text>
                            </View>

                            <View style={styles.item2}>
                                <Text style={styles.label}>{translate("Transaction_Mode")}</Text>
                                <Text style={[styles.value,styles.textUpper]}>{item.Mode || ""}</Text>
                            </View>
                        </View>

                        <View
                            style={[
                                styles.row,
                                {
                                    backgroundColor: `${colorConfig.secondaryColor}33`,
                                    borderRadius: 88,
                                    paddingHorizontal: wScale(15),
                                },
                            ]}
                        >
                            <View style={styles.item}>
                                <Text style={styles.label}>{translate("Transaction_Status")}</Text>
                                <Text style={[styles.value,styles.textUpper]}>{item.Status || item.sts}</Text>
                            </View>

                            <View style={[styles.item2, styles.stsRow]}>
                                {rawStatus === "success" ? (
                                    <View style={[styles.check, { backgroundColor: "green" }]}>
                                        <CheckSvg size={15} />
                                    </View>
                                ) : rawStatus === "pending" ? (
                                    <PaddingSvg2 size={25} />
                                ) : rawStatus === "failed" ? (
                                    <FailedSvg size={30} />
                                ) : (
                                    <MaterialCommunityIcons name="clock" color="#000" size={30} />
                                )}
                            </View>
                        </View>

                        <View style={styles.row}>
                            <View style={styles.item}>
                                <Text style={styles.label}>{translate("Bank_Name")}</Text>
                            </View>
                            <View style={styles.item2}>
                                <Text style={styles.value}>{item.BankName || "NULL"}</Text>
                            </View>
                        </View>

                        <BorderLine height={0.5} width={"100%"} />

                        <View style={styles.row}>
                            <View style={styles.item}>
                                <Text style={styles.label}>{translate("Slip_ID")}</Text>
                            </View>
                            <View style={styles.item2}>
                                <Text style={[styles.value,styles.textUpper]}>{item.Slipid || "NULL"}</Text>
                            </View>
                        </View>

                        <BorderLine height={0.5} width={"100%"} />

                        <View style={styles.row}>
                            <View style={styles.item}>
                                <Text style={styles.label}>{translate("IFS_Code")}</Text>
                            </View>
                            <View style={styles.item2}>
                                <Text style={[styles.value,styles.textUpper]}>{item.Ifsccode || "NULL"}</Text>
                            </View>
                        </View>

                        <BorderLine height={0.5} width={"100%"} />

                        <View style={styles.row}>
                            <View style={styles.item}>
                                <Text style={styles.label}>{translate("Response_By")}</Text>
                            </View>
                            <View style={styles.item2}>
                                <Text style={styles.value}>{item.ResponseBy || "NULL"}</Text>
                            </View>
                        </View>

                        {/* Balance Row */}
                        <View style={[styles.row, styles.rowExtra]}>
                            <View style={styles.item}>
                                <Text style={styles.label}>{translate("Previous_Balance")}</Text>
                                <Text style={styles.value}>{item.Remainpre}</Text>
                            </View>

                            <BorderLine height="100%" width={0.3} />

                            <View style={styles.item3}>
                                <Text style={styles.label}>{translate("Amount")}</Text>
                                <Text style={styles.value}>{item.Amount ?? 0}</Text>
                            </View>

                            <BorderLine height="100%" width={0.3} />

                            <View style={styles.item2}>
                                <Text style={styles.label}>{translate("Remaining_Balance")}</Text>
                                <Text style={styles.value}>{item.Remainpost}</Text>
                            </View>
                        </View>

                        {/* Slip Actions */}
                        <>
                            <Text style={styles.footerTitle}>{translate("DepositTransaction_Slip")}</Text>
                            <View style={styles.btnRow}>
                                <TouchableOpacity
                                    style={styles.btnStyle}
                                    onPress={() => {
                                        const imageUrl = buildImageUrl(item.Slipname);

                                        if (!imageUrl) {
                                            ToastAndroid.show('Slip not available', ToastAndroid.SHORT);
                                            return;
                                        }

                                        setPhotoUri(imageUrl);
                                        setShowPreview(true);
                                    }}
                                >
                                    <Text style={styles.btnText}>{translate("View_Slip")}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.btnStyle} onPress={handleShare}>
                                    <Text style={styles.btnText}>{translate("Share")}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.btnStyle}>
                                    <Text
                                        style={[
                                            styles.btnText,
                                            { borderRightWidth: 0, marginRight: -15 },
                                        ]}
                                    >{translate("Download")}</Text>
                                </TouchableOpacity>
                            </View>
                        </>

                    </View>

                </View>
            </ViewShot>
        );
    };

    return (
        <View style={styles.main}>
            <AppBarSecond title="CMS Add Money Report"
            onPressBack={() => navigation.navigate('RadiantTransactionScreen')}

            />

            <StatusCalendar onSearch={handleSearch} />

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
                    />
                ) : (
                    <NoDatafound />
                )}
            </View>
            {/* <SimpleImageViwer
                visible={showPreview}
                imageUri={photoUri}
                onClose={() => setShowPreview(false)}
            /> */}

            <TransactionResultSheet
                visible={showResult}
                status={selectedTxn?.Status || "--"}
                amount={selectedTxn?.Amount?.toString() || "0"}
                rows={[
                    {
                        label: "Account Number",
                        value: selectedTxn?.BankName || "--",
                    },
                    {
                        label: "Transaction Mode",
                        value: selectedTxn?.Mode || "--",
                    },
                    {
                        label: "Bank Name",
                        value: selectedTxn?.BankName || "--",
                    },
                    {
                        label: "Date & Time",
                        value: selectedTxn?.Insertdate || "--",
                    },
                    {
                        label: "Response By",
                        value: selectedTxn?.ResponseBy || "--",
                    },

                ]}
                onGoBack={handleGoback}
            />

        </View>
    );
};


export default NewCashDepositReport;

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
    },
    headerRow: {
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        paddingHorizontal: wScale(5),
    },
    whitePati: {
        backgroundColor: "#f1f1f1",
        borderRadius: 50,
        elevation: 2,
        marginTop: hScale(2),
    },
    stsRow: {
        flex: 0,
    },
    rowExtra: {
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        paddingVertical: hScale(5),
        backgroundColor: "#f1f1f1",
        borderRadius: 10,
        elevation: 2,
        marginTop: hScale(2),
    },
    btnRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '60%',
        alignSelf: 'center',
        marginTop: hScale(4)
    },
    btnText: {
        color: '#4b853e',
        fontSize: wScale(14),
        flex: 1,
        borderRightWidth: .5,
        borderColor: '#4b853e',
        textAlign: 'center'

    },
    btnStyle: {
        flex: 1
    },
    footerTitle: {
        fontWeight: 'bold',
        fontSize: wScale(15),
        color: '#000',
        textTransform: 'capitalize',
        marginTop: hScale(10),
        textAlign: 'center'
    },
    textUpper:{
        textTransform:'uppercase'
    }
});
