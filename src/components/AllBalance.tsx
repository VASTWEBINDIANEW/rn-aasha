import React, { useState, useCallback } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import WalletSvg from "../features/drawer/svgimgcomponents/Walletsvg";
import { hScale, wScale } from "../utils/styles/dimensions";
import { RootState } from "../reduxUtils/store";
import { useSelector } from "react-redux";
import { APP_URLS } from "../utils/network/urls";
import { decryptData } from "../utils/encryptionUtils";
import useAxiosHook from "../utils/network/AxiosClient";
import ShowLoaderBtn from './ShowLoaderBtn';
import { useFocusEffect } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { translate } from '../utils/languageUtils/I18n';
import OnelineDropdownSvg from '../features/drawer/svgimgcomponents/simpledropdown';

const BALANCE_ITEMS = [
    { label: 'Main Wallet',  key: 'remainbal' },
    { label: 'POS Balance',  key: 'posremain' },
    { label: translate('cmsremainbal'),  key: 'cmsremainbal' },
    { label: translate('holdandleanbal'),key: 'holdandleanbal' },
];

const AllBalance = () => {
    const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);
    const [openDropdown, setOpenDropdown] = useState(false);
    const [balanceInfo, setBalanceInfo] = useState<any>(null);
    const { get } = useAxiosHook();

    const getData = useCallback(async () => {
        try {
            const userInfoRes = await get({ url: APP_URLS.getUserInfo });
            const userData = userInfoRes.data;
            const { kkkk: key, vvvv: iv } = userData;

            if (!IsDealer) {
                const response = await get({ url: APP_URLS.balanceInfo });
                setBalanceInfo(response.data?.[0] ?? {});
            } else {
                setBalanceInfo({
                    adminfarmname:  decryptData(key, iv, userData.adminfarmname),
                    posremain:      decryptData(key, iv, userData.posremain),
                    remainbal:      decryptData(key, iv, userData.remainbal),
                    frmanems:       decryptData(key, iv, userData.frmanems),
                    cmsremainbal:   decryptData(key, iv, userData.cmsremainbal),
                    holdandleanbal: decryptData(key, iv, userData.holdandleanbal),
                });
            }
        } catch (error: any) {
            Alert.alert(
                error?.message === "Network Error" ? "Network Error" : "Error",
                error?.message === "Network Error"
                    ? "Please check your internet connection."
                    : "Something went wrong. Try again later."
            );
        }
    }, [get, IsDealer]);

    useFocusEffect(useCallback(() => { getData(); }, []));

    const totalBalance = BALANCE_ITEMS.reduce(
        (sum, item) => sum + (Number(balanceInfo?.[item.key]) || 0), 0
    );

    return (
        <LinearGradient
            colors={[`${colorConfig.primaryColor}22`, `${colorConfig.secondaryColor}44`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.container}
        >
            {/* Header Row */}
            <TouchableOpacity
                style={styles.headerRow}
                onPress={() => setOpenDropdown(!openDropdown)}
                activeOpacity={0.8}
            >
                {/* Left: Icon + Title */}
                <View style={[styles.iconBox, { backgroundColor: `${colorConfig.primaryColor}22` }]}>
                    <WalletSvg size={wScale(22)} />
                </View>

                <View style={styles.headerMid}>
                    <Text style={styles.walletLabel}>Wallet Balance</Text>
                    {balanceInfo
                        ? <Text style={[styles.totalAmount, { color: colorConfig.primaryColor }]}>
                            ₹ {totalBalance.toLocaleString('en-IN')}
                          </Text>
                        : <ShowLoaderBtn color={colorConfig.primaryColor} size={18} />
                    }
                </View>

                {/* Chevron */}
                <View style={[
                    styles.chevron,
                    openDropdown && { transform: [{ rotate: '180deg' }] }
                ]}>
                    {/* <Text style={[styles.chevronText, { color: colorConfig.primaryColor }]}>⌄</Text> */}
                    <OnelineDropdownSvg/>
                </View>
            </TouchableOpacity>

            {/* Dropdown Balance Cards */}
            {openDropdown && (
                <View style={styles.dropdownBody}>
                    {/* Divider */}
                    <View style={[styles.divider, { backgroundColor: `${colorConfig.primaryColor}30` }]} />

                    <View style={styles.gridRow}>
                        {BALANCE_ITEMS.map((item, index) => (
                            <View
                                key={item.key}
                                style={[
                                    styles.balanceCard,
                                    { backgroundColor: `${colorConfig.secondaryColor}18` },
                                    index % 2 === 0 ? { marginRight: wScale(6) } : { marginLeft: wScale(6) },
                                ]}
                            >
                                {/* Accent dot */}
                                {/* <View style={[styles.dot, { backgroundColor: colorConfig.primaryColor }]} /> */}
                                <Text style={styles.cardLabel}>{item.label}</Text>
                                <Text style={[styles.cardValue, { color: colorConfig.primaryColor }]}>
                                    ₹ {Number(balanceInfo?.[item.key] || 0).toLocaleString('en-IN')}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </LinearGradient>
    );
};

export default AllBalance;

const styles = StyleSheet.create({
    container: {
        borderRadius: wScale(16),
        paddingHorizontal: wScale(15),
        paddingVertical: hScale(14),
        // marginHorizontal: wScale(2),
        borderTopLeftRadius:0,
        borderTopRightRadius:0
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconBox: {
        height: wScale(42),
        width: wScale(42),
        borderRadius: wScale(12),
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: wScale(12),
    },
    headerMid: {
        flex: 1,
    },
    walletLabel: {
        fontSize: wScale(12),
        color: '#888',
        marginBottom: hScale(2),
        letterSpacing: 0.4,
    },
    totalAmount: {
        fontSize: wScale(22),
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    chevron: {
        width: wScale(28),
        height: wScale(28),
        alignItems: 'center',
        justifyContent: 'center',
    },
    chevronText: {
        fontSize: wScale(22),
        lineHeight: wScale(26),
        fontWeight: '600',
    },
    dropdownBody: {
        marginTop: hScale(10),
    },
    divider: {
        height: 1,
        marginBottom: hScale(12),
        borderRadius: 1,
    },
    gridRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    balanceCard: {
        width: '47%',
        borderRadius: wScale(12),
        paddingHorizontal: wScale(12),
        paddingVertical: hScale(10),
        marginBottom: hScale(10),
    },
    dot: {
        width: wScale(6),
        height: wScale(6),
        borderRadius: wScale(3),
        marginBottom: hScale(6),
    },
    cardLabel: {
        fontSize: wScale(11),
        color: '#888',
        marginBottom: hScale(4),
        letterSpacing: 0.3,
    },
    cardValue: {
        fontSize: wScale(18),
        fontWeight: '700',
        letterSpacing: 0.2,
    },
});