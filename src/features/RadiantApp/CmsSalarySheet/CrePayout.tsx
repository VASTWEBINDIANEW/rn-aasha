import { translate } from "../../../utils/languageUtils/I18n";
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
} from "react-native";
import AppBarSecond from "../../drawer/headerAppbar/AppBarSecond";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import { useSelector } from "react-redux";
import { RootState } from "../../../reduxUtils/store";
import useAxiosHook from "../../../utils/network/AxiosClient";
import ShowLoader from "../../../components/ShowLoder";
import { CalendarDropdown } from "../../../components/CalendarDropdown/CalendarDropdown";
import MovingDotBorderText from "../../../components/AnimatedBorderView";
import NoDatafound from "../../drawer/svgimgcomponents/Nodatafound";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import CmsPayoutStructure from "../RadiantNewClient/CmsPayoutStructure";
import LinearGradient from "react-native-linear-gradient";
import Table from "../../../components/TableData/Table";

export default function CrePayout() {

    const { post } = useAxiosHook();
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);

    // Default: current month - 1
    const today = new Date();
    let defaultMonth = today.getMonth() - 1;
    let defaultYear = today.getFullYear();
    if (defaultMonth < 0) {
        defaultMonth = 11;
        defaultYear -= 1;
    }

    const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
    const [selectedYear, setSelectedYear] = useState(defaultYear);

    const [salaryData, setSalaryData] = useState<any | null>(null);
    const [allSalary, setAllSalary] = useState<any>({});

    const [showDetails, setShowDetails] = useState(false);
    const [loading, setLoading] = useState(false);
    const [rceId, setRceId] = useState("");
    const [tableShow, setShwowTable] = useState(false)
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetchSalarySummary(post, selectedMonth + 1, selectedYear);
                console.log("Summary Response:", response);
                const data = response?.Content?.ADDINFO?.[0];
                if (data) {
                    setSalaryData(data);
                    setRceId(data.ceid);
                    // setShowDetails(false);
                } else {
                    setSalaryData(null);
                    setRceId("");
                    // setShowDetails(false);
                }
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedMonth, selectedYear]);

    const fetchAllSalary = async () => {
        if (!rceId) return;
        setLoading(true);
        try {
            const response = await fetchSalaryDetails(post, rceId, selectedMonth + 1, selectedYear);
            const data = response?.Content?.ADDINFO;
            if (data) {
                setAllSalary(data);
                setShowDetails(!showDetails);
                setShwowTable(false)
            }
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    const getMonthName = (month: number) => {
        const months = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return months[month - 1];
    };



    const tableData = salaryData
        ? [
            {
                label1: "Pickup/Collection Mode",
                value1: salaryData?.Pickupmode ?? "-",
                label2: "My RCE ID",
                value2: salaryData?.ceid ?? "-",
            },
            {
                label1: "Total Pickup Amount",
                value1: `₹ ${salaryData?.TotalPickUpAmount ?? 0}`,
                label2: "Total Working Day",
                value2: salaryData?.totalworkingdays ?? "-",
            },
            {
                label1: "Commission as Per Pickup",
                value1: `₹ ${salaryData?.Commission ?? 0}`,
                label2: "Minimum Granted Amount",
                value2: `₹ ${salaryData?.FinalMinPay ?? 0}`,
            },
            {
                label1: "Total Travel(KM)",
                value1: salaryData?.TotalTravels ?? 0,
                label2: "Travel Allowance",
                value2: `₹ ${salaryData?.Maximumpaytravels ?? 0}`,
            },
            {
                label1: "Deposit/Activation  Charge",
                value1: `₹ ${salaryData?.Depositecharge ?? 0}`,
                label2: "Total Pickup Penalty",
                value2: `₹ ${salaryData?.TotalPenlity ?? 0}`,
            },
        ]
        : [];


    const mapSalaryData = (list = []) =>
        list.map(item => [
            {
                label1: "RCE ID",
                value1: item.ceid,
                label2: "Work Mode",
                value2: item.WorkMode,
            },
            {
                label1: "Pickup Amount",
                value1: `₹ ${item.PickUpAmount}`,
                label2: "Commission %",
                value2: item.Commission,
            },
            {
                label1: "Total Commission",
                value1: `₹ ${item.TotalCommission}`,
                label2: "Final Commission",
                value2: `₹ ${item.FinalCommission}`,
            },
            {
                label1: "Minimum Pay",
                value1: `₹ ${item.minpay}`,
                label2: "Final Min Pay",
                value2: `₹ ${item.FinalMinPay}`,
            },
            {
                label1: "Total Working Days",
                value1: item.TotalWorkingdays,
                label2: "Total Days",
                value2: item.TotalDays,
            },
            {
                label1: "Pickup Count",
                value1: item.Totalpickupcount,
                label2: "Zero Pickup",
                value2: item.Zeropickup,
            },
            {
                label1: "Total Travel (KM)",
                value1: item.TotalTravels,
                label2: "Travel Allowance",
                value2: `₹ ${item.MaximumpayTravles}`,
            },
            {
                label1: "Penalty",
                value1: `₹ ${item.TotalPenlity}`,
                label2: "Remaining Leave",
                value2: item.TotalRemainLeave,
            },
            {
                label1: "Shop Type",
                value1: item.ShopType,
                label2: "Shop ID",
                value2: item.Shopid,
            },
            {
                label1: "Salary Date",
                value1: item.SalaryDate?.split("T")[0],
            },
        ]);

    const prepayData = mapSalaryData(allSalary?.PrepaySalary);
    const postpayData = mapSalaryData(allSalary?.PostpaySalary);


    const travelPenaltyData = allSalary?.TravelsPenalty?.map(item => [
        {
            label1: "Total Travel (KM)",
            value1: item.TotalTravels,
            label2: "Max Travel Allowance",
            value2: `₹ ${item.MaximumpayTravles}`,
        },
        {
            label1: "Total Days",
            value1: item.TotalDays,
            label2: "Pickup Count",
            value2: item.Totalpickupcount,
        },
        // {
        //     label1: "Remaining Leave",
        //     value1: item.TotalRemainLeave,
        //     label2: "Total Penalty",
        //     value2: `₹ ${item.TotalPenlity}`,
        // },
    ]);

    return (
        <SafeAreaView style={styles.container}>
            <AppBarSecond title="RCE Payout Information" />
            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.calendarSty}>
                    <CalendarDropdown
                        onChange={(month, year) => {
                            setSelectedMonth(month);
                            setSelectedYear(year);
                        }}
                    />
                </View>
                <Text style={styles.note}>{translate("key_noteallt_161")}</Text>
                <View style={{ backgroundColor: `${colorConfig.secondaryColor}1D`, paddingHorizontal: wScale(8), paddingTop: hScale(5) }}>

                    <MovingDotBorderText
                        height={hScale(40)} title={undefined} children={undefined}                    >
                        <TouchableOpacity style={[styles.animetedBtn, { backgroundColor: `${colorConfig.secondaryColor}1D`, }]}
                            onPress={() => { setShwowTable(!tableShow) }}>
                            {!tableShow ? <FontAwesome name="eye" color="#000" size={24} /> :
                                <FontAwesome name="eye-slash" color="#000" size={24} />

                            }

                            <Text style={styles.viewText}>{translate("View_CommissionPayout_Structure")}</Text>

                        </TouchableOpacity>
                    </MovingDotBorderText>

                    {tableShow && <CmsPayoutStructure />
                    }

                </View>

                {loading ? (
                    <ShowLoader />
                ) : salaryData ? (
                    <View>
                        <View style={[styles.tableContainer, { backgroundColor: `${colorConfig.secondaryColor}1D`, }]}>

                            <View>
                                <LinearGradient colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
                                    style={{ borderTopRightRadius: 8, borderTopLeftRadius: 8, marginTop: hScale(10) }}
                                >

                                    <Text style={[styles.sectionTitle, { marginTop: 0 }]}>

                                        {getMonthName(salaryData.SalaryMonth)}{" "}

                                        {salaryData.SalaryYear} Monthly Payout Summary
                                    </Text>
                                </LinearGradient>

                            </View>


                            {salaryData && <Table data={tableData} />}

                            {/* {showDetails && <View style={styles.borderRaduis} />} */}

                            <View style={[styles.greenValue, showDetails && styles.greenValueTrue]}>
                                <View>
                                    <Text style={styles.label}>{translate("Total_PayOut")}</Text>
                                    <Text style={[styles.value,]}>₹ {salaryData.NetSalary}</Text>
                                </View>
                                <View>
                                    <Text style={[styles.label, { textAlign: 'center' }]}>{translate("TDS")}</Text>
                                    <Text style={[styles.value, { textAlign: 'center' }]}>₹ {salaryData.TDS}</Text>
                                </View>
                                <View>
                                    <Text style={styles.label}>{translate("NEt_Balance")}</Text>
                                    <Text style={[styles.value,]}>₹ {salaryData.NetSalary}</Text>
                                </View>
                            </View>

                            {!showDetails && <>
                                <TouchableOpacity
                                    disabled={!rceId || loading}
                                    onPress={fetchAllSalary}
                                    style={[
                                        styles.viewMoreBtn,
                                    ]}
                                >
                                    <Text style={{ color: colorConfig.secondaryColor, fontWeight: "bold" }}>
                                        {showDetails ? "Hide Details" : "View More Details"}
                                    </Text>
                                </TouchableOpacity>
                            </>}
                        </View>
                        {showDetails && allSalary && (
                            <>
                                {allSalary?.PrepaySalary?.length > 0 && (
                                    <View style={[styles.tableContainer, { backgroundColor: `${colorConfig.secondaryColor}1D`, }]}>
                                        <Text style={[styles.sectionTitle, { backgroundColor: colorConfig.primaryColor }]}>{translate("Prepay_Salary")}</Text>

                                        {prepayData.map((rows, index) => (
                                            <Table key={`prepay-${index}`} data={rows} />
                                        ))}
                                        <View style={styles.borderRaduis} />

                                    </View>
                                )}

                                {allSalary?.PostpaySalary?.length > 0 && (
                                    <View style={[styles.tableContainer, { backgroundColor: `${colorConfig.secondaryColor}1D`, }]}>
                                        <Text style={[styles.sectionTitle, { backgroundColor: colorConfig.primaryColor }]}>{translate("Postpay_Salary")}</Text>

                                        {postpayData.map((rows, index) => (
                                            <Table key={`postpay-${index}`} data={rows} />
                                        ))}
                                        <View style={styles.borderRaduis} />

                                    </View>
                                )}


                                {allSalary.TravelsPenalty?.length > 0 && (
                                    <View style={[styles.tableContainer, { backgroundColor: `${colorConfig.secondaryColor}1D`, }]}>
                                        <Text style={[styles.sectionTitle, { backgroundColor: colorConfig.secondaryColor }]}>{translate("Travel_Penalty_Details")}</Text>

                                        {travelPenaltyData?.map((rows, index) => (
                                            <Table key={index} data={rows} />
                                        ))}


                                        <TouchableOpacity
                                            disabled={!rceId || loading}
                                            onPress={fetchAllSalary}
                                            style={[
                                                styles.viewMoreBtn,
                                            ]}
                                        >
                                            <Text style={{ color: colorConfig.secondaryColor, fontWeight: "bold" }}>
                                                {showDetails ? "Hide Details" : "View More Details"}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                ) : (
                    null
                    
                )}

            </ScrollView>
        </SafeAreaView>
    );
}



const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f4f6f8", marginBottom: hScale(10) },
    content: { paddingHorizontal: wScale(15), paddingVertical: hScale(0), },
    note: { color: "red", fontSize: wScale(16), marginBottom: hScale(12), textAlign: "justify", },
    sectionTitle: {
        fontSize: wScale(16), fontWeight: "bold",
        textAlign: "center", color: '#fff', borderTopRightRadius: 8, borderTopLeftRadius: 8, paddingVertical: hScale(5),
        marginTop: hScale(10)
    },
    tableContainer: {
        backgroundColor: "#ddd", paddingHorizontal: wScale(8),
        paddingBottom: hScale(10), borderTopLeftRadius: wScale(8), borderTopRightRadius: wScale(8),
        marginTop: hScale(10),
        // paddingTop:hScale(10),
        borderRadius: 8
    },

    tableHeaderText: { flex: 1, color: "#fff", fontWeight: "bold", textAlign: "center", fontSize: wScale(12) },
    tableRow: { flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: wScale(1), borderColor: "#ddd" },
    tableCell: {
        paddingVertical: hScale(5),
        color: "#000",
        fontSize: wScale(12)
    },
    valueStyle: {
        color: "#000",
        fontSize: wScale(14),
        fontWeight: 'bold'
    },
    viewMoreBtn: {
        alignItems: "center",
        paddingVertical: hScale(10),
        backgroundColor: '#fff',
        borderBottomLeftRadius: wScale(8), borderBottomRightRadius: wScale(8),
    },
    leftCo: {
        flex: 1,
        borderRightWidth: 0.2,
        paddingHorizontal: wScale(10),
        paddingBottom: hScale(5)

    },
    rightCo: {
        alignItems: 'flex-end',
        justifyContent: 'flex-end'

    },
    row: {
        flexDirection: "row",
        backgroundColor: "#fff",
        borderBottomWidth: 0.5,
        borderColor: "#ddd",
    },

    col: {
        flex: 1,
        paddingVertical: hScale(6),
        paddingHorizontal: wScale(10),
        borderRightWidth: 0.5,
        borderColor: "#ddd",
    },

    rightCol: {
        borderRightWidth: 0,
        alignItems: "flex-end",
    },

    label: {
        fontSize: wScale(12),
        color: "#555",
    },

    value: {
        fontSize: wScale(14),
        fontWeight: "bold",
        color: "#000",
        marginTop: hScale(4),
        textTransform: 'capitalize'

    },
    calendarSty: {
        borderRadius: 4, borderWidth: .5,
        borderColor: '#000', marginVertical: hScale(10)
    },
    animetedBtn: { flex: 1, justifyContent: 'center', flexDirection: 'row', alignItems: 'center' },
    viewText: { fontSize: wScale(18), fontWeight: 'bold', color: '#000', width: '80%', textAlign: 'center' },
    title: {
        color: '#fff',
        backgroundColor: '#1f2937',
        textAlign: 'center',
        paddingVertical: hScale(6),
        fontWeight: 'bold'
    },
    greenValue: {
        flexDirection: 'row', paddingVertical: hScale(6),
        justifyContent: 'space-between', backgroundColor: '#DFF8DA', paddingHorizontal: wScale(10),

    },
    borderRaduis: {
        height: hScale(8),
        borderBottomRightRadius: 8, borderBottomLeftRadius: 8, backgroundColor: '#fff',
        marginTop: hScale(-2)
    },
    greenValueTrue: {
        borderBottomRightRadius: 8, borderBottomLeftRadius: 8
    }

});
