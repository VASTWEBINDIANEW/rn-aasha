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
import { translate } from '../../../utils/languageUtils/I18n';

const LoiListReport = () => {
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

    const handleShare = () => {
        shareSlipImage(capRef);
    }
    const handleGoback = () => {
        setShowResult(false);
        clearEntryScreen(null)
        navigation.navigate('RadiantTransactionScreen');

    }
    console.log(cmsAddMFrom, '🟰🟰🟰🟰', showResult);

    const fetchReport = useCallback(async () => {
        setLoading(true);
        try {
            const url = `${APP_URLS.LoiListReport}`;
            console.log('API URL 🟰:', url);

            const res = await post({ url });
            console.log('DATA 👉', res);

            if (res) {
                setReportData(res);
                setPhotoUri(res.Slipname);
            } else {
                console.error('Response does not contain Slipname');
            }
        } catch (error) {
            console.error('API Error:', error);
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array ensures fetchReport is defined only once

    // Fetch report on component mount
    useEffect(() => {
        fetchReport();
    }, [fetchReport]); // Only re-run if fetchReport changes

    console.log();

    const renderItem = ({ item }) => {
        // Define status colors
        const status_Colors = {
            pending: { color: "#fa9507", bg: "#F6E2C7" },
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
                    <View style={[styles.row, { backgroundColor: color }, styles.headerRow]}>
                        <View style={[styles.item,styles.btnStyle]}>
                            <Text style={styles.timeLabel}>{translate("insertTime")}</Text>
                            <Text style={[styles.timeVabel, { letterSpacing: 0 }]}>
                                {item.Insertdate}
                            </Text>
                        </View>
                        <View style={[styles.item2,{flexDirection:'row',justifyContent:'flex-end'}]}>
                            <View style={[ ]}>
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
                            <View style={{marginLeft:wScale(4)}}>
                                <Text style={[styles.timeLabel,{textAlign:'right'}]}>{translate("Status")}</Text>
                                <Text style={styles.timeVabel}>{item.Status || "N/A"}</Text>
                            </View>
                        </View>

                    </View>
                    <>

                    </>

                    <View style={[styles.rMargin, { borderColor: color }]}>
                        <Text style={styles.footerTitle}>{translate("Client_Customer_Name")}</Text>
                        <View style={styles.btnRow}>


                            <Text style={[styles.btnText,]}>{item.ClientName || ""}</Text>

                        </View>
                        <BorderLine height={0.5} width={"100%"} />





                        <View style={styles.row}>
                            <View style={styles.item}>
                                <Text style={styles.label}>{translate('stateName')}</Text>
                            </View>
                            <View style={styles.item2}>
                                <Text style={styles.value}>{item.State_name || "NULL"}</Text>
                            </View>
                        </View>
                        <BorderLine height={0.5} width={"100%"} />

                        <View style={styles.row}>
                            <View style={styles.item}>
                                <Text style={styles.label}>{translate("DISTRICT")}</Text>
                            </View>
                            <View style={styles.item2}>
                                <Text style={[styles.value, styles.textUpper]}>{item.Dist_Desc || "NULL"}</Text>
                            </View>
                        </View>

                        <BorderLine height={0.5} width={"100%"} />

                        {/* <View style={styles.row}>
                            <View style={styles.item}>
                                <Text style={styles.label}>City Name</Text>
                            </View>
                            <View style={styles.item2}>
                                <Text style={styles.value}>{item.CityName || "NULL"}</Text>
                            </View>
                        </View> */}
                        <BorderLine height={0.5} width={"100%"} />

                        <View style={[styles.row,]}>
                                <Text style={[styles.label]}>{translate("pickupAddress")}</Text>
                            
                                <Text style={[styles.value, styles.textUpper]}>{item.pickupaddress || "NULL"}</Text>
                        </View>


                        <BorderLine height={0.5} width={"100%"} />

                        <View style={styles.row}>
                            <View style={styles.item}>
                                <Text style={styles.label}>{translate("pinCode")}</Text>
                            </View>
                            <View style={styles.item2}>
                                <Text style={[styles.value, styles.textUpper]}>{item.Pincode || "NULL"}</Text>
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
                            <View style={[styles.item, styles.stsRow]}>
                                <Text style={styles.label}>{translate("customerPointName")}</Text>
                                <Text style={styles.value}>{item.ClientName || "NULL"}</Text>
                            </View>

                            <View style={styles.item2}>
                                <Text style={styles.label}>{translate("mobileNumber")}</Text>
                                <Text style={[styles.value, styles.textUpper]}>{item.PointMobile || ""}</Text>
                            </View>
                        </View>


                        <View style={styles.row}>
                            <View style={[styles.item, styles.stsRow]}>
                                <Text style={styles.label}>{translate("requestId")}</Text>
                            </View>
                            <View style={styles.item2}>
                                <Text style={styles.value}>{item.Requestid || "NULL"}</Text>
                            </View>
                        </View>

                        <BorderLine height={0.5} width={"100%"} />

                        <View style={styles.row}>
                            <View style={[styles.item, styles.stsRow]}>
                                <Text style={styles.label}>{translate("cashLimit")}</Text>
                            </View>
                            <View style={styles.item2}>
                                <Text style={styles.value}>{item.Cashlimit || "NULL"}</Text>
                            </View>
                        </View>
                        <BorderLine height={0.5} width={"100%"} />

                        <View style={styles.row}>
                            <View style={[styles.item, styles.stsRow]}>
                                <Text style={styles.label}>{translate("workMode")}</Text>
                            </View>
                            <View style={styles.item2}>
                                <Text style={styles.value}>{item.WorkMode || "NULL"}</Text>
                            </View>
                        </View>
                        <BorderLine height={0.5} width={"100%"} />

                        <View style={styles.row}>
                            <View style={[styles.item, styles.stsRow]}>
                                <Text style={styles.label}>{translate("depositMode")}</Text>
                            </View>
                            <View style={styles.item2}>
                                <Text style={styles.value}>{item.Depositionmode || "NULL"}</Text>
                            </View>
                        </View>

                        <View style={[styles.row, styles.rowExtra]}>
                            <View style={[styles.item, { flex: 1 }]}>
                                <Text style={styles.label}>{translate("latitude")}</Text>
                                <Text style={styles.value}>{item.Latitude}</Text>
                            </View>

                            <BorderLine height="100%" width={0.5} />


                            <View style={styles.item2}>
                                <Text style={styles.label}>{translate("longitude")}</Text>
                                <Text style={styles.value}>{item.Longitude}</Text>
                            </View>
                        </View>
                        <Text style={styles.footerTitle}>{translate("retailerInfo")}</Text>


                        <View style={styles.row}>
                            <View style={[styles.item, styles.stsRow]}>
                                <Text style={styles.label}>{translate("retailerName")}</Text>
                            </View>
                            <View style={styles.item2}>
                                <Text style={styles.value}>{item.RetailerName || "NULL"}</Text>
                            </View>
                        </View>


                    </View>

                </View>
            </ViewShot>
        );
    };

    return (
        <View style={styles.main}>

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



        </View>
    );
};


export default LoiListReport;

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
        // marginHorizontal: wScale(10),
    },
    item: {
        flex: 0,
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
        color: '#000',
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
        color: '#000',
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
        // width: '60%',
        alignSelf: 'center',
        marginTop: hScale(0),
        marginBottom: hScale(5)
    },
    btnText: {
        color: '#4b853e',
        fontSize: wScale(14),
        flex: 1,
        textAlign: 'center',
        textTransform: 'uppercase',
        fontWeight: 'bold'
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
    textUpper: {
        textTransform: 'uppercase'
    }
});