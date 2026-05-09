import { translate } from "../../../utils/languageUtils/I18n";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import { APP_URLS } from "../../../utils/network/urls";
import useAxiosHook from "../../../utils/network/AxiosClient";
import AppBarSecond from "../../drawer/headerAppbar/AppBarSecond";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import ShowLoader from "../../../components/ShowLoder";
import NoDatafound from "../../drawer/svgimgcomponents/Nodatafound";
import { useSelector } from "react-redux";
import { RootState } from "../../../reduxUtils/store";
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useNavigation } from "../../../utils/navigation/NavigationService";
import { Item } from "react-native-paper/lib/typescript/components/Drawer/Drawer";
const PickupSalaryCalendar = () => {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);
    const { post } = useAxiosHook();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarData, setCalendarData] = useState([]);
    const [isLoading, setisLoading] = useState(false);
    const [join, setJoin] = useState(null)
    const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const navigation = useNavigation<any>()
    useEffect(() => {
        fetchData();
    }, [currentDate]);

    const fetchData = async () => {
        setisLoading(true);
        try {
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            const url = `${APP_URLS.Pickupcalendars}?Month=${month}&Year=${year}`;
            const response = await post({ url });
            const addInfo = response?.Content?.ADDINFO || {};
            const data = addInfo?.PickupDays || [];
            const joinDate = addInfo?.JoinDate;
            setJoin(joinDate)

            const closeDate = addInfo?.CloseDate;
            generateCalendar(data, joinDate, closeDate, month, year);
        } catch (error) {
            console.log("🔥 API ERROR:", error);
        } finally {
            setisLoading(false);
        }
    };

    const generateCalendar = (data, joinDate, closeDate, month, year) => {
        let firstDay = new Date(year, month - 1, 1).getDay();
        firstDay = firstDay === 0 ? 6 : firstDay - 1;

        let calendar = [];

        for (let i = 0; i < firstDay; i++) {
            calendar.push({ empty: true });
        }

        data.forEach((item) => {
            const amount = item.TotalAmount ? item.TotalAmount.replace(/\.00$/, "") : "0";
            calendar.push({
                ...item,
                day: item.PickupDate?.split("-")[0],
                isJoinDate: item.PickupDate === joinDate,
                isCloseDate: item.PickupDate === closeDate,
                TotalAmount: amount,
            });
        });

        const remainingCells = calendar.length % 7;
        if (remainingCells !== 0) {
            for (let i = 0; i < 7 - remainingCells; i++) {
                calendar.push({ empty: true });
            }
        }

        setCalendarData(calendar);
    };

    const prevMonth = () => {
        if (isJoinMonth) return
        setCurrentDate(prev => {
            return new Date(
                prev.getFullYear(),
                prev.getMonth() - 1,
                1   // 👈 VERY IMPORTANT
            );
        });
    };
    const joinDateObj = join
        ? new Date(join.split("-").reverse().join("-"))
        : null;

    const isJoinMonth =
        joinDateObj &&
        currentDate.getMonth() === joinDateObj.getMonth() &&
        currentDate.getFullYear() === joinDateObj.getFullYear();

    const today = new Date();
    const isCurrentMonth =
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();
    const nextMonth = () => {


        if (isCurrentMonth) return;

        setCurrentDate(prev => {
            return new Date(
                prev.getFullYear(),
                prev.getMonth() + 1,
                1
            );
        });
    };




    const formattedDate = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    const renderItem = ({ item }) => {
        if (item.empty) return <View style={styles.emptyCell} />;

        return (
            <View
                style={[
                    styles.dateCell,
                    item.IsAbsent ? styles.absentCell : styles.presentCell,
                ]}
            >
                <View style={[styles.dateCircle, { backgroundColor: `${colorConfig.secondaryColor}33` }]}>
                    <Text style={styles.dateNumber}>{item.day}</Text>
                </View>

                {item.IsJoin !== item.IsClose && (
                    item.IsAbsent ? (
                        <Text style={styles.absentText}>{translate("Absent")}</Text>
                    ) : (
                        <View style={styles.amountBadge}>
                            <Text style={styles.amountText}>₹ {item.TotalAmount}</Text>
                        </View>
                    )
                )}

                {item.isJoinDate && <Text style={styles.joinDate}>{translate("Newly_Joined")}</Text>}
                {item.isCloseDate && <Text style={[styles.joinDate, { backgroundColor: '#D17070' }]}>{translate("Stopped_Work")}</Text>}
            </View>
        );
    };

    return (
        <View style={styles.main}>
            <AppBarSecond title={'Cash Pickup Calendar'} />
            <View style={{
                backgroundColor: `${colorConfig.secondaryColor}66`, marginBottom: hScale(8),
            }}>
                <View style={styles.dateRow}>
                    <TouchableOpacity style={[styles.button, {
                        opacity: isJoinMonth ? 0.5 : 1,
                        paddingRight: wScale(10), backgroundColor: `${colorConfig.primaryColor}33`
                    }]} onPress={prevMonth}>
                        <AntDesign name="left" color="#000" size={18} />

                        <Text style={styles.buttonText}>{translate("Prev")}</Text>
                    </TouchableOpacity>

                    <Text style={styles.dateText}>{formattedDate}</Text>

                    <TouchableOpacity style={[styles.button, {
                        opacity: isCurrentMonth ? 0.4 : 1,
                        paddingLeft: wScale(10), backgroundColor: `${colorConfig.primaryColor}33`
                    }]} onPress={nextMonth}>
                        <Text style={styles.buttonText}>{translate("Next")}</Text>
                        <AntDesign name="right" color="#000" size={18} />

                    </TouchableOpacity>
                </View>
                <View style={[styles.weekRow,
                ]}>
                    {WEEK_DAYS.map(day => (
                        <Text key={day} style={styles.weekText}>{day}</Text>
                    ))}
                </View>
            </View>
            {isLoading ? (
                <ShowLoader />
            ) : calendarData.length === 0 ? (
                <NoDatafound />
            ) : (
                <FlatList
                    data={calendarData}
                    renderItem={renderItem}
                    keyExtractor={(_, index) => index.toString()}
                    numColumns={7}
                    contentContainerStyle={{ paddingHorizontal: wScale(4) }}
                />
            )}
        </View>
    );
};

export default PickupSalaryCalendar;


const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "#F5F6FA"
    },

    weekRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: hScale(8),
    },

    button: {
        paddingVertical: hScale(6),
        paddingHorizontal: wScale(5),
        borderRadius: wScale(6),
        marginHorizontal: wScale(4),
        borderWidth: wScale(1),
        borderColor: '#000',
        flexDirection: 'row',
        alignItems: 'center',
    },

    buttonText: {
        color: "#000",
        fontWeight: "600",
        fontSize: wScale(12),
        marginHorizontal: wScale(4),
        textTransform: 'uppercase'
    },

    dateRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginVertical: hScale(8),
        marginHorizontal: wScale(10),
    },

    dateText: {
        fontSize: wScale(20),
        fontWeight: "bold",
        color: '#000',
        textTransform: 'uppercase'
    },

    daysContainer: {
        elevation: wScale(5),
        backgroundColor: "#fff",
    },

    weekText: {
        flex: 1,
        textAlign: "center",
        fontSize: wScale(12),
        fontWeight: "bold",
        color: "#000",
        textTransform: 'uppercase'
    },

    emptyCell: {
        flex: 1,
        height: hScale(75),
        margin: wScale(4)
    },

    dateCell: {
        flex: 1,
        height: hScale(75),
        margin: wScale(2),
        borderRadius: wScale(10),
        alignItems: "center",
        paddingVertical: hScale(6),
        backgroundColor: "#fff",
        elevation: wScale(2),
        marginVertical: hScale(4)
    },

    presentCell: {
        borderWidth: wScale(0.5),
        borderColor: "green",
        backgroundColor: '#E8FFF1'
    },

    absentCell: {
        backgroundColor: "#ffe5e5",
        borderWidth: wScale(0.5),
        borderColor: "#D17070",
    },

    dateCircle: {
        borderRadius: wScale(20),
        marginBottom: hScale(4),
        height: wScale(25),
        width: wScale(25),
        alignItems: 'center',
        justifyContent: 'center'
    },

    dateNumber: {
        fontSize: wScale(11),
        fontWeight: "bold",
        color: "#000"
    },

    amountBadge: {
        paddingHorizontal: wScale(2),
        borderRadius: wScale(6),
    },

    amountText: {
        fontSize: wScale(10),
        color: "green",
        fontWeight: "600",
        paddingHorizontal: wScale(3),
        textAlign: 'center'
    },

    absentText: {
        fontSize: wScale(11),
        color: "#d63031",
        fontWeight: "600"
    },

    joinDate: {
        fontSize: wScale(8),
        color: "#fff",
        backgroundColor: 'green',
        borderRadius: wScale(8),
        marginTop: hScale(2),
        paddingHorizontal: wScale(1),
        paddingVertical: hScale(1),

    },
    test:{
     justifyContent:'center',
     fontSize:9,
     alignContent:'center',
     


    }

});
