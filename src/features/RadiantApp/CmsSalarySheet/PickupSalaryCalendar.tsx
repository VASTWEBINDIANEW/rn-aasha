import React, { useEffect, useState } from "react";
import {
    StyleSheet, Text, View, FlatList,
    TouchableOpacity, Alert, StatusBar
} from "react-native";
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

// ─── Theme ───────────────────────────────────────────────────────────────────
const T = {
    primary: "#7B1FA2",
    primaryLight: "#CE93D8",
    primaryDim: "rgba(123,31,162,0.15)",
    danger: "#EF5350",
    dangerDim: "rgba(239,83,80,0.12)",
    success: "#43A047",
    successDim: "rgba(67,160,71,0.12)",
    holiday: "#AB47BC",
    holidayDim: "rgba(171,71,188,0.12)",
    warning: "#FFA726",
    surface: "rgba(30,30,46,0.92)",
    surfaceLight: "rgba(255,255,255,0.06)",
    text: "#FFFFFF",
    textMuted: "#B0B0C3",
    textDark: "#1A1A2E",
    bg: "#F0F2F8",
    card: "#FFFFFF",
    border: "rgba(123,31,162,0.18)",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const normalizeDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const [dd, mm, yyyy] = dateStr.split("-");
    return `${yyyy}-${mm}-${dd}`;
};

// ─── Legend Dot ──────────────────────────────────────────────────────────────
const Dot = ({ color }: { color: string }) => (
    <View style={{ width: wScale(7), height: wScale(7), borderRadius: 99, backgroundColor: color, marginRight: wScale(4) }} />
);

// ─── ActionBanner ────────────────────────────────────────────────────────────
const ActionBanner = ({
    selectedDates, hasHolidaySelected, onSubmit, onCancel,
}: {
    selectedDates: string[];
    hasHolidaySelected: boolean;
    onSubmit: () => void;
    onCancel: () => void;  
}) => {
    if (selectedDates.length === 0) {
        return (
            <View style={bs.rulesBanner}>
                <View style={bs.rulesIconWrap}>
                    <AntDesign name="infocirlceo" color={T.primaryLight} size={wScale(14)} />
                </View>
                <View style={bs.rulesDivider} />
                <View style={bs.rulesRow}>
                    <View style={bs.ruleItem}>
                        <Text style={bs.rulesBadgeText}>Leave Rules</Text>
                        <Text style={bs.rulesText}>
                            Approved leave incurs a{" "}
                            <Text style={{ color: T.holiday, fontWeight: "700" }}>₹125 fine</Text>
                            {", "}unapproved leave costs{" "}
                            <Text style={{ color: T.danger, fontWeight: "700" }}>₹250</Text>
                            {". "}Submit or cancel by clicking the date before{" "}
                            <Text style={{ color: T.warning, fontWeight: "700" }}>10:00 AM</Text>.
                        </Text>
                    </View>
                </View>
            </View>
        );
    }

    const days = selectedDates.map((d) => d.split("-")[0]).join("  ·  ");
    const isCancel = hasHolidaySelected;

    return (
        <View style={bs.actionBanner}>
            <View style={bs.actionLeft}>
                <Text style={bs.actionCount}>
                    {selectedDates.length} date{selectedDates.length > 1 ? "s" : ""} selected
                </Text>
                <Text style={bs.actionDays} numberOfLines={1}>{days}</Text>
            </View>
            <TouchableOpacity
                activeOpacity={0.75}
                onPress={isCancel ? onCancel : onSubmit}
                style={[bs.actionBtn, {
                    backgroundColor: isCancel ? T.dangerDim : T.primaryDim,
                    borderColor: isCancel ? T.danger + "55" : T.primaryLight + "55"
                }]}
            >
                <AntDesign
                    name={isCancel ? "closecircleo" : "checkcircleo"}
                    color={isCancel ? T.danger : T.primaryLight}
                    size={wScale(14)}
                />
                <Text style={[bs.actionBtnText, { color: isCancel ? T.danger : T.primaryLight }]}>
                    {isCancel ? "Cancel Leave" : "Submit Leave"}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const bs = StyleSheet.create({
    rulesBanner: {
        flexDirection: "row",
        alignItems: "center",
        marginHorizontal: wScale(12),
        marginVertical: hScale(6),
        backgroundColor: T.surface,
        borderRadius: wScale(14),
        borderWidth: 1,
        borderColor: T.border,
        paddingHorizontal: wScale(10),
        paddingVertical: hScale(8),
        height: hScale(48),        // ✅ fixed height
    },
    rulesIconWrap: {
        width: wScale(26),
        height: wScale(26),
        borderRadius: wScale(8),
        backgroundColor: T.primaryDim,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    rulesDivider: {
        width: 1,
        height: "60%",
        backgroundColor: T.border,
        marginHorizontal: wScale(8),
    },
    rulesRow: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    ruleItem: {
        flex: 1,
    },
    rulesBadgeText: {
        color: T.primaryLight,
        fontSize: wScale(9),
        fontWeight: "800",
        letterSpacing: 0.6,
        textTransform: "uppercase",
        marginBottom: hScale(1),
    },
    rulesText: {
        color: T.textMuted,
        fontSize: wScale(9.5),
        lineHeight: hScale(13),
    },
    actionBanner: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginHorizontal: wScale(12),
        marginVertical: hScale(6),
        backgroundColor: T.surface,
        borderRadius: wScale(14),
        borderWidth: 1,
        borderColor: T.border,
        paddingHorizontal: wScale(14),
        paddingVertical: hScale(0),
        height: hScale(48),        // ✅ same fixed height
    },
    actionLeft: { flex: 1, marginRight: wScale(10) },
    actionCount: {
        color: T.textMuted,
        fontSize: wScale(9),
        fontWeight: "600",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: hScale(1),
    },
    actionDays: {
        color: T.text,
        fontSize: wScale(15),
        fontWeight: "800",
        letterSpacing: 0.3,
    },
    actionBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: wScale(6),
        paddingHorizontal: wScale(12),
        paddingVertical: hScale(8),
        borderRadius: wScale(10),
        borderWidth: 1,
    },
    actionBtnText: {
        fontSize: wScale(11),
        fontWeight: "700",
    },
});

// ─── Calendar Cell ────────────────────────────────────────────────────────────
const CalendarCell = React.memo(({
    item, isSelected, secondaryColor, onPress,
}: {
    item: any;
    isSelected: boolean;
    secondaryColor: string;
    onPress: () => void;
}) => {
    if (item.empty) return <View style={cs.empty} />;

    const isHoliday = item.isHoliday;
    const isAbsent = item.IsAbsent;
    const isJoin = item.isJoinDate;
    const isClose = item.isCloseDate;

    // ✅ CHECK: kya ye date aaj ya future hai?
    const todayMid = new Date();
    todayMid.setHours(0, 0, 0, 0);
    const cellDate = new Date(item.PickupDate?.split("-").reverse().join("-"));
    cellDate.setHours(0, 0, 0, 0);
    const isFutureOrToday = cellDate >= todayMid;

    // ✅ Future/today mein absent treat as present
    const showAbsent = isAbsent && !isFutureOrToday;

    const cellBg = isHoliday ? T.holidayDim : showAbsent ? T.dangerDim : T.successDim;
    const cellBorder = isHoliday ? T.holiday : showAbsent ? T.danger : T.success;

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.75}
            style={[cs.cell, { backgroundColor: cellBg, borderColor: isSelected ? T.primaryLight : cellBorder + "66" }]}
        >
            {isSelected && <View style={cs.selectedOverlay} />}

            <View style={[cs.circle, { backgroundColor: `${secondaryColor}25` }]}>
                <Text style={[cs.dayNum, isSelected && { color: T.primaryLight }]}>{item.day}</Text>
            </View>

            {!isJoin && !isClose && (
                isHoliday ? (
                    <View style={{ alignItems: "center" }}>
                        {!isAbsent && item.TotalAmount ? (
                            <Text style={cs.amtText}>₹{item.TotalAmount}</Text>
                        ) : null}
                        <Text style={[cs.tagText, { color: T.holiday }]}>Holiday Approval</Text>
                        <Text style={[cs.fineText, { color: T.holiday }]}>-₹125</Text>
                    </View>
                ) : showAbsent ? (
                    // ✅ Sirf past dates mein Absent + fine show hoga
                    <View style={{ alignItems: "center" }}>
                        <Text style={[cs.tagText, { color: T.danger }]}>Absent</Text>
                        <Text style={[cs.fineText, { color: T.danger }]}>-₹250</Text>
                    </View>
                ) : (
                    // ✅ Future/today → sirf amount (agar hai to)
                    !isFutureOrToday && item.TotalAmount ? (
                        <Text style={cs.amtText}>₹{item.TotalAmount}</Text>
                    ) : isFutureOrToday ? null : (
                        <Text style={cs.amtText}>₹{item.TotalAmount}</Text>
                    )
                )
            )}

            {isJoin && <Text style={[cs.badge, { backgroundColor: T.success }]}>Joined</Text>}
            {isClose && <Text style={[cs.badge, { backgroundColor: T.danger }]}>Stopped</Text>}

            {isSelected && (
                <View style={cs.checkDot}>
                    <AntDesign name="check" size={wScale(8)} color="#fff" />
                </View>
            )}
        </TouchableOpacity>
    );
});

const cs = StyleSheet.create({
    empty: { flex: 1, height: hScale(72), margin: wScale(2) },
    cell: {
        flex: 1,
        height: hScale(72),
        margin: wScale(2),
        borderRadius: wScale(12),
        alignItems: "center",
        paddingVertical: hScale(5),
        borderWidth: 1,
        overflow: "hidden",
    },
    selectedOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(123,31,162,0.08)",
        borderRadius: wScale(12),
    },
    circle: {
        borderRadius: 99,
        height: wScale(24),
        width: wScale(24),
        alignItems: "center",
        justifyContent: "center",
        marginBottom: hScale(3),
    },
    dayNum: {
        fontSize: wScale(10),
        fontWeight: "800",
        color: T.textDark,
    },
    amtText: {
        fontSize: wScale(9),
        color: T.success,
        fontWeight: "700",
        textAlign: "center",
    },
    tagText: {
        fontSize: wScale(8),
        fontWeight: "700",
        textAlign: "center",
    },
    fineText: {
        fontSize: wScale(8),
        fontWeight: "600",
        textAlign: "center",
    },
    badge: {
        fontSize: wScale(7),
        color: "#fff",
        borderRadius: wScale(6),
        paddingHorizontal: wScale(3),
        paddingVertical: hScale(1),
        marginTop: hScale(2),
        overflow: "hidden",
    },
    checkDot: {
        position: "absolute",
        top: hScale(2),
        right: wScale(2),
        width: wScale(14),
        height: wScale(14),
        borderRadius: 99,
        backgroundColor: T.primary,
        alignItems: "center",
        justifyContent: "center",
    },
});

// ─── Legend ───────────────────────────────────────────────────────────────────
const Legend = () => (
    <View style={ls.row}>
        {[
            { color: T.success, label: "Present" },
            { color: T.danger, label: "Absent" },
            { color: T.holiday, label: "Holiday" },
        ].map(({ color, label }) => (
            <View key={label} style={ls.item}>
                <Dot color={color} />
                <Text style={ls.label}>{label}</Text>
            </View>
        ))}
    </View>
);
const ls = StyleSheet.create({
    row: {
        flexDirection: "row", justifyContent: "center", gap: wScale(14),
        paddingVertical: hScale(5)
    },
    item: { flexDirection: "row", alignItems: "center" },
    label: { color: "#555", fontSize: wScale(9), fontWeight: "600" },
});

// ─── Main ─────────────────────────────────────────────────────────────────────
const PickupSalaryCalendar = () => {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);
    const { post } = useAxiosHook();
    const navigation = useNavigation<any>();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [calendarData, setCalendarData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [join, setJoin] = useState<string | null>(null);
    const [holidayDates, setHolidayDates] = useState<string[]>([]);
    const [selectedDates, setSelectedDates] = useState<string[]>([]);

    const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const MONTH_NAMES = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    useEffect(() => { fetchHolidayReport(); setSelectedDates([]); }, [currentDate]);
    useEffect(() => { fetchData(); }, [holidayDates, currentDate]);

    // ── API ──
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            const response = await post({ url: `${APP_URLS.Pickupcalendars}?Month=${month}&Year=${year}` });
            const addInfo = response?.Content?.ADDINFO || {};
            const joinDate = addInfo?.JoinDate;
            setJoin(joinDate);
            generateCalendar(addInfo?.PickupDays || [], joinDate, addInfo?.CloseDate, month, year);
        } catch (e) { console.log("API ERROR:", e); }
        finally { setIsLoading(false); }
    };

    const fetchHolidayReport = async () => {
        try {
            const month = currentDate.getMonth() + 1;
            const year = currentDate.getFullYear();
            const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            const response = await post({
                url: `api/Radiant/holidayReport`,
                data: { startDate: fmt(new Date(year, month - 1, 1)), endDate: fmt(new Date(year, month, 0)) },
            });
            if (response?.Content) {
                setHolidayDates(response.Content.map((i: any) => normalizeDate(i.holidaydate.split(" ")[0])));
            }
        } catch (e) { console.error("Holiday report error:", e); }
    };

    const generateCalendar = (data: any[], joinDate: string, closeDate: string, month: number, year: number) => {
        let firstDay = new Date(year, month - 1, 1).getDay();
        firstDay = firstDay === 0 ? 6 : firstDay - 1;

        const calendar: any[] = Array.from({ length: firstDay }, () => ({ empty: true }));

        data.forEach(item => {
            calendar.push({
                ...item,
                day: item.PickupDate?.split("-")[0],
                isJoinDate: item.PickupDate === joinDate,
                isCloseDate: item.PickupDate === closeDate,
                TotalAmount: item.TotalAmount?.replace(/\.00$/, "") ?? "0",
                isHoliday: holidayDates.includes(normalizeDate(item.PickupDate)),
            });
        });

        const rem = calendar.length % 7;
        if (rem) for (let i = 0; i < 7 - rem; i++) calendar.push({ empty: true });
        setCalendarData(calendar);
    };

    // ── Navigation ──
    const joinDateObj = join ? new Date(join.split("-").reverse().join("-")) : null;
    const isJoinMonth = joinDateObj &&
        currentDate.getMonth() === joinDateObj.getMonth() &&
        currentDate.getFullYear() === joinDateObj.getFullYear();
    const today = new Date();
    const isCurrentMonth =
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();

    const prevMonth = () => { if (!isJoinMonth) setCurrentDate(p => new Date(p.getFullYear(), p.getMonth() - 1, 1)); };
    const nextMonth = () => { if (!isCurrentMonth) setCurrentDate(p => new Date(p.getFullYear(), p.getMonth() + 1, 1)); };

    // ── Date Select ──
    const handleDateSelect = (date: string) => {
        const now = new Date();
        const todayMid = new Date(); todayMid.setHours(0, 0, 0, 0);
        const sel = new Date(date.split("-").reverse().join("-")); sel.setHours(0, 0, 0, 0);

        if (sel < todayMid) return;
        if (sel.getTime() === todayMid.getTime() && now.getHours() >= 10) {
            Alert.alert("Warning", "You cannot select today after 10 AM"); return;
        }

        const isHoliday = holidayDates.includes(normalizeDate(date));

        setSelectedDates(prev => {
            if (prev.includes(date)) return prev.filter(d => d !== date);
            const prevHasHoliday = prev.some(d => holidayDates.includes(normalizeDate(d)));
            const prevHasNormal = prev.length > 0 && !prevHasHoliday;
            if ((prevHasHoliday && !isHoliday) || (prevHasNormal && isHoliday)) {
                Alert.alert("Warning", "You can only select same type of dates"); return prev;
            }
            return [...prev, date];
        });
    };

    // ── Submit / Cancel ──
    const submitLeave = async () => {
        try {
            const data = {
                dateholidays: selectedDates.map(date => ({
                    HolidayDate: new Date(date.split("-").reverse().join("-")).toISOString().split("T")[0]
                }))
            };
            const res = await post({ url: `api/Radiant/HolidayRequest`, data });
            if (res?.Content?.sts === true) {
                Alert.alert("Success", res?.Content?.msg?.trim() || "Submitted!");
                setSelectedDates([]); fetchHolidayReport();
            } else { Alert.alert("Failed", res?.Message || "Unknown error"); }
        } catch (e) { Alert.alert("Error", "Failed to submit"); }
    };

    const cancelSelectedHolidays = async () => {
        try {
            for (const date of selectedDates) {
                const fmt = new Date(date.split("-").reverse().join("-")).toISOString().split("T")[0];
                await post({ url: `api/Radiant/CancelHoliday`, data: { Holidaydate: fmt } });
            }
            Alert.alert("Success", "Holiday(s) cancelled");
            setSelectedDates([]); fetchHolidayReport(); fetchData();
        } catch (e) { Alert.alert("Error", "Failed to cancel"); }
    };

    const hasHolidaySelected = selectedDates.some(date =>
        holidayDates.includes(new Date(date.split("-").reverse().join("-")).toISOString().split("T")[0])
    );

    // ── Render ──
    const renderItem = ({ item }: { item: any }) => (
        <CalendarCell
            item={item}
            isSelected={selectedDates.includes(item.PickupDate)}
            secondaryColor={colorConfig.secondaryColor}
            onPress={() => handleDateSelect(item.PickupDate)}
        />
    );

    return (
        <View style={styles.main}>
            <StatusBar barStyle="light-content" backgroundColor={T.primary} />
            <AppBarSecond title="Cash Pickup Calendar" />

            {/* ── Header Card ── */}
            <View style={styles.headerCard}>
                <ActionBanner
                    selectedDates={selectedDates}
                    hasHolidaySelected={hasHolidaySelected}
                    onSubmit={submitLeave}
                    onCancel={cancelSelectedHolidays}
                />

                {/* Month Nav */}
                <View style={styles.monthRow}>
                    <TouchableOpacity
                        style={[styles.navBtn, { opacity: isJoinMonth ? 0.35 : 1 }]}
                        onPress={prevMonth} activeOpacity={0.7}
                    >
                        <AntDesign name="left" color={T.primary} size={wScale(14)} />
                        <Text style={styles.navText}>Prev</Text>
                    </TouchableOpacity>

                    <View style={styles.monthTitleWrap}>
                        <Text style={styles.monthTitle}>
                            {MONTH_NAMES[currentDate.getMonth()]}
                        </Text>
                        <Text style={styles.yearTitle}>{currentDate.getFullYear()}</Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.navBtn, { opacity: isCurrentMonth ? 0.35 : 1 }]}
                        onPress={nextMonth} activeOpacity={0.7}
                    >
                        <Text style={styles.navText}>Next</Text>
                        <AntDesign name="right" color={T.primary} size={wScale(14)} />
                    </TouchableOpacity>
                </View>

                {/* Week header */}
                <View style={styles.weekRow}>
                    {WEEK_DAYS.map(d => (
                        <Text key={d} style={[styles.weekText,
                        d === "Sun" && { color: T.danger },
                        d === "Sat" && { color: T.primary }
                        ]}>{d}</Text>
                    ))}
                </View>
            </View>

            {/* ── Calendar Body ── */}
            {isLoading ? <ShowLoader /> :
                calendarData.length === 0 ? <NoDatafound /> : (
                    <>
                        <FlatList
                            data={calendarData}
                            renderItem={renderItem}
                            keyExtractor={(_, i) => i.toString()}
                            numColumns={7}
                            contentContainerStyle={styles.calGrid}
                            showsVerticalScrollIndicator={false}
                        />
                        <Legend />
                    </>
                )}
        </View>
    );
};

export default PickupSalaryCalendar;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    main: { flex: 1, backgroundColor: T.bg },

    headerCard: {
        backgroundColor: "#fff",
        borderBottomLeftRadius: wScale(20),
        borderBottomRightRadius: wScale(20),
        paddingBottom: hScale(6),
        elevation: 6,
        shadowColor: T.primary,
        shadowOpacity: 0.12,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        marginBottom: hScale(6),
    },

    monthRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginHorizontal: wScale(12),
        marginBottom: hScale(8),
    },
    navBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: wScale(4),
        backgroundColor: T.primaryDim,
        paddingHorizontal: wScale(12),
        paddingVertical: hScale(7),
        borderRadius: wScale(10),
    },
    navText: {
        color: T.primary,
        fontWeight: "700",
        fontSize: wScale(11),
        textTransform: "uppercase",
        letterSpacing: 0.5,
    },
    monthTitleWrap: { alignItems: "center" },
    monthTitle: {
        fontSize: wScale(18),
        fontWeight: "800",
        color: T.textDark,
        letterSpacing: 0.3,
        textTransform: "uppercase",
    },
    yearTitle: {
        fontSize: wScale(11),
        color: T.primary,
        fontWeight: "600",
        letterSpacing: 1,
    },

    weekRow: {
        flexDirection: "row",
        paddingHorizontal: wScale(4),
        paddingVertical: hScale(4),
        borderTopWidth: 1,
        borderTopColor: "rgba(123,31,162,0.08)",
    },
    weekText: {
        flex: 1,
        textAlign: "center",
        fontSize: wScale(10),
        fontWeight: "700",
        color: "#555",
        textTransform: "uppercase",
        letterSpacing: 0.3,
    },

    calGrid: { paddingHorizontal: wScale(4), paddingBottom: hScale(12) },
});