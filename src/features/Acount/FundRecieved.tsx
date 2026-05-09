import React, { useState, useEffect } from 'react';
import {
    View, Text, FlatList, StyleSheet, Alert,
    TouchableOpacity, ToastAndroid, Animated
} from 'react-native';
import useAxiosHook from '../../utils/network/AxiosClient';
import { APP_URLS } from '../../utils/network/urls';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import { useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import { hScale, wScale } from '../../utils/styles/dimensions';
import DateRangePicker from '../../components/DateRange';
import NoDatafound from '../drawer/svgimgcomponents/Nodatafound';
import { translate } from '../../utils/languageUtils/I18n';
import TabBar from '../Recharge/TabView/TabBarView';
import ShowLoader from '../../components/ShowLoder';

const FundReceivedReport = () => {
    const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);

    const PRIMARY = colorConfig.secondaryColor || '#4F46E5';
    const PRIMARY_LIGHT = `${PRIMARY}18`;
    const PRIMARY_MID = `${PRIMARY}35`;

    const [inforeport, setInforeport] = useState([]);
    const [inforeportAdmin, setInforeportAdmin] = useState([]);
    const [inforeportDealer, setInforeportDealer] = useState([]);
    const [selectedDate, setSelectedDate] = useState({
        from: new Date().toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0],
    });
    const [selectedStatus, setSelectedStatus] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const { get } = useAxiosHook();
    const [selectedOption, setSelectedOption] = useState('IsDealer');

    useEffect(() => {
        if (!IsDealer) {
            FundRecReport(selectedDate.from, selectedDate.to, selectedStatus, '');
        } else {
            FundRecReport(selectedDate.from, selectedDate.to, selectedStatus, selectedOption);
        }
    }, []);

    const FundRecReport = async (from, to, status, fromm) => {
        setLoading(true);
        const formattedFrom = new Date(from).toISOString().split('T')[0];
        const formattedTo = new Date(to).toISOString().split('T')[0];

        const url = `${APP_URLS.retailerBalRecRep}from=${formattedFrom}&to=${formattedTo}&remid=ALL`;
        const url2 = `${APP_URLS.ReceiveFund_by_master}txt_frm_date=${formattedFrom}&txt_to_date=${formattedTo}`;
        const url3 = `${APP_URLS.ReceiveFund_by_admin}txt_frm_date=${formattedFrom}&txt_to_date=${formattedTo}`;

        let selectedUrl = fromm === 'IsDealer' ? url2 : fromm === 'isAdmin' ? url3 : url;

        try {
            const response = await get({ url: selectedUrl });
            if (!response) throw new Error('Network response was not ok');

            if (fromm === 'isAdmin') {
                if (response.Report === 'No Data Found') {
                    ToastAndroid.show(response.Report, ToastAndroid.SHORT);
                } else {
                    setInforeportAdmin(response.Report);
                }
            } else if (fromm === 'IsDealer') {
                if (response.Report === 'No Data Found') {
                    ToastAndroid.show(response.Report, ToastAndroid.SHORT);
                } else {
                    setInforeportDealer(response.Report);
                }
            } else {
                if (response.Report === 'No Data Found') {
                    ToastAndroid.show(response.Report, ToastAndroid.SHORT);
                } else {
                    setInforeport(response);
                }
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    // ── Shared badge chip ──────────────────────────────────────────────────────
    const Chip = ({ label, value }: { label: string; value: string }) => (
        <View style={[chip.wrap, { backgroundColor: PRIMARY_LIGHT, borderColor: PRIMARY_MID }]}>
            <Text style={[chip.label, { color: PRIMARY }]}>{label}</Text>
            <Text style={chip.value}>{value}</Text>
        </View>
    );

    // ── Amount highlight ───────────────────────────────────────────────────────
    const AmountChip = ({ label, value }: { label: string; value: string }) => (
        <View style={[chip.wrap, { backgroundColor: PRIMARY_MID, borderColor: PRIMARY, flex: 1, marginHorizontal: wScale(2) }]}>
            <Text style={[chip.label, { color: PRIMARY }]}>{label}</Text>
            <Text style={[chip.value, { color: PRIMARY, fontWeight: '700' }]}>{value}</Text>
        </View>
    );

    // ── Card shell ─────────────────────────────────────────────────────────────
    const Card = ({ children }: { children: React.ReactNode }) => (
        <View style={[card.shell, { borderLeftColor: PRIMARY }]}>
            {children}
        </View>
    );

    // ── Render: Retailer ───────────────────────────────────────────────────────
    const renderItem = ({ item, index }) => (
        <Animated.View style={{ opacity: 1 }}>
            <Card>
                <View style={card.topRow}>
                    <View style={card.nameBlock}>
                        <Text style={card.nameLabel}>{translate('Name')}</Text>
                        <Text style={[card.nameValue, { color: PRIMARY }]}>
                            {item.SenderId || '....'}
                        </Text>
                    </View>
                    <View style={card.dateBlock}>
                        <Text style={card.dateLabel}>{translate('Date')}</Text>
                        <Text style={card.dateValue}>{item.Date}</Text>
                    </View>
                </View>
                <View style={card.amountRow}>
                    <AmountChip label={translate('Pre Balance')} value={`₹ ${item.OldBal}`} />
                    <AmountChip label={translate('Post Balance')} value={`₹ ${item.CurrentBal}`} />
                    <AmountChip label={translate('Amount')} value={`₹ ${item.Amount}`} />
                </View>
            </Card>
        </Animated.View>
    );

    // ── Render: Master/Dealer ──────────────────────────────────────────────────
    const renderItemMaster = ({ item, index }) => (
        <Card>
            <View style={card.topRow}>
                <View style={card.nameBlock}>
                    <Text style={card.nameLabel}>{translate('Name')}</Text>
                    <Text style={[card.nameValue, { color: PRIMARY }]}>
                        {item.SuperstokistName || '.....'}
                    </Text>
                </View>
                <View style={card.dateBlock}>
                    <Text style={card.dateLabel}>{translate('Date')}</Text>
                    <Text style={card.dateValue}>{item.date_dlm || '— — —'}</Text>
                </View>
            </View>

            <View style={card.chipRow}>
                <Chip label={translate('Type')} value={item.bal_type || '—'} />
            </View>

            <View style={card.amountRow}>
                <AmountChip label={translate('Pre Balance')} value={`₹ ${item.dealer_prebal || '0'}`} />
                <AmountChip label={translate('Post Balance')} value={`₹ ${item.dealer_postbal || '0'}`} />
                <AmountChip label={translate('Amount')} value={`₹ ${item.balance || '0'}`} />
                <AmountChip label={'Transfer'} value={`₹ ${item.Newbalance || '0'}`} />
            </View>
        </Card>
    );

    // ── Render: Admin ──────────────────────────────────────────────────────────
    const renderItemAdmin = ({ item }) => (
        <Card>
            <View style={card.topRow}>
                <View style={card.nameBlock}>
                    <Text style={card.nameLabel}>{translate('Name')}</Text>
                    <Text style={[card.nameValue, { color: PRIMARY }]}>
                        {item.Name || '.....'}
                    </Text>
                </View>
                <View style={card.dateBlock}>
                    <Text style={card.dateLabel}>{translate('Date')}</Text>
                    <Text style={card.dateValue}>{item.date_dlm || '— — —'}</Text>
                </View>
            </View>

            <View style={card.chipRow}>
                <Chip label={translate('Type')} value={item.bal_type || '—'} />
            </View>

            <View style={card.amountRow}>
                <AmountChip label={translate('Pre Balance')} value={`₹ ${item.dealer_prebal || '0'}`} />
                <AmountChip label={translate('Post Balance')} value={`₹ ${item.dealer_postbal || '0'}`} />
                <AmountChip label={translate('Amount')} value={`₹ ${item.balance || '0'}`} />
            </View>
        </Card>
    );

    // ── Active list to show ────────────────────────────────────────────────────
    const activeData = !IsDealer
        ? inforeport
        : selectedOption === 'IsDealer'
        ? inforeportDealer
        : inforeportAdmin;

    const activeRender = !IsDealer
        ? renderItem
        : selectedOption === 'IsDealer'
        ? renderItemMaster
        : renderItemAdmin;

    return (
        <View style={styles.root}>
            {/* App Bar */}
            <AppBarSecond
                title={translate('Fund Received Report')}
                onActionPress={undefined}
                actionButton={undefined}
                onPressBack={undefined}
            />

            {/* Date Picker */}
            <DateRangePicker
                onDateSelected={(from, to) => setSelectedDate({ from, to })}
                SearchPress={(from, to, status) =>
                    FundRecReport(from, to, status, IsDealer ? selectedOption : '')
                }
                status={selectedStatus}
                setStatus={setSelectedStatus}
                isStShow={false}
                isshowRetailer={false}
                retailerID={(id) => console.log(id)}
            />

            {/* Tab bar for dealers */}
            {IsDealer && (
                <View style={styles.tabWrap}>
                    <TabBar
                        tabButtonstyle={styles.tabBtn}
                        Unselected={translate('from Admin')}
                        Selected={translate('from Master')}
                        onPress1={() => {
                            setSelectedOption('IsDealer');
                            FundRecReport(selectedDate.from, selectedDate.to, selectedStatus, 'IsDealer');
                        }}
                        onPress2={() => {
                            setSelectedOption('isAdmin');
                            FundRecReport(selectedDate.from, selectedDate.to, selectedStatus, 'isAdmin');
                        }}
                    />
                </View>
            )}

            {/* List */}
            <View style={styles.listWrap}>
                {activeData && activeData.length > 0 ? (
                    <FlatList
                        data={activeData}
                        renderItem={activeRender}
                        keyExtractor={(_, i) => i.toString()}
                        contentContainerStyle={{ paddingBottom: hScale(30) }}
                        showsVerticalScrollIndicator={false}
                    />
                ) : (
                    !loading && <NoDatafound />
                )}
            </View>

            {loading && <ShowLoader />}
        </View>
    );
};

// ── Card styles ──────────────────────────────────────────────────────────────
const card = StyleSheet.create({
    shell: {
        backgroundColor: '#fff',
        borderRadius: wScale(12),
        marginHorizontal: wScale(12),
        marginBottom: hScale(10),
        paddingHorizontal: wScale(12),
        paddingVertical: hScale(10),
        borderLeftWidth: wScale(4),
        // Shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: hScale(2) },
        shadowOpacity: 0.07,
        shadowRadius: 6,
        elevation: 3,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: hScale(8),
    },
    nameBlock: { flex: 1 },
    nameLabel: { fontSize: wScale(10), color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase' },
    nameValue: { fontSize: wScale(14), fontWeight: '700', marginTop: hScale(2) },
    dateBlock: { alignItems: 'flex-end' },
    dateLabel: { fontSize: wScale(10), color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase' },
    dateValue: { fontSize: wScale(12), color: '#374151', fontWeight: '600', marginTop: hScale(2) },
    amountRow: {
        flexDirection: 'row',
        marginTop: hScale(6),
    },
    chipRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: wScale(6),
        marginBottom: hScale(4),
    },
});

// ── Chip styles ──────────────────────────────────────────────────────────────
const chip = StyleSheet.create({
    wrap: {
        borderRadius: wScale(8),
        borderWidth: 1,
        paddingHorizontal: wScale(8),
        paddingVertical: hScale(4),
        alignItems: 'center',
        marginRight: wScale(4),
    },
    label: {
        fontSize: wScale(9),
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        fontWeight: '600',
        marginBottom: hScale(1),
    },
    value: {
        fontSize: wScale(11),
        fontWeight: '700',
        color: '#1F2937',
    },
});

// ── Page styles ──────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    tabWrap: {
        paddingHorizontal: wScale(12),
        paddingTop: hScale(8),
        paddingBottom: hScale(4),
    },
    tabBtn: {
        width: '44%',
        paddingVertical: hScale(8),
    },
    listWrap: {
        flex: 1,
        paddingTop: hScale(6),
    },
});

export default FundReceivedReport;