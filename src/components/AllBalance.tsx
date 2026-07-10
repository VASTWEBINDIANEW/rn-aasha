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
    { label: 'Main Wallet',    key: 'remainbal' },
    { label: 'POS Balance',    key: 'posremain' },
    { label: translate('cmsremainbal'),   key: 'cmsremainbal' },
    { label: translate('holdandleanbal'), key: 'holdandleanbal' },
];

const AllBalance = () => {
    const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);
    const [openDropdown, setOpenDropdown] = useState(false);
    const [balanceInfo, setBalanceInfo] = useState<any>(null);
    const { get } = useAxiosHook();

    const baseSurfaceColor = colorConfig.primaryColor;

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

    useFocusEffect(useCallback(() => { getData(); }, [getData]));

    const totalBalance = BALANCE_ITEMS.reduce(
        (sum, item) => sum + (Number(balanceInfo?.[item.key]) || 0), 0
    );

    return (
        <View style={[styles.container, { backgroundColor: baseSurfaceColor }]}>
            {/* Neomorphic Main Bar Outer Wrapper */}
            <View style={[styles.mainBarOuterShadow, { backgroundColor: baseSurfaceColor }]}>
                <LinearGradient
                    colors={["rgba(255,255,255,0.35)", "rgba(0,0,0,0.15)"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.mainBarGradient}
                >
                    <TouchableOpacity
                        style={[styles.headerRow, { backgroundColor: baseSurfaceColor }]}
                        onPress={() => setOpenDropdown(!openDropdown)}
                        activeOpacity={0.8}
                    >
                        {/* Left Icon Area - Depressed/Pressed look */}
                        <LinearGradient
                            colors={["rgba(0,0,0,0.2)", "rgba(255,255,255,0.25)"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.iconBoxOuter}
                        >
                            <View style={[styles.iconBoxInner, { backgroundColor: baseSurfaceColor }]}>
                                <WalletSvg size={wScale(22)} color="#FFFFFF" />
                            </View>
                        </LinearGradient>

                        {/* Mid Balance Description */}
                        <View style={styles.headerMid}>
                            <Text style={styles.walletLabel}>Wallet Balance</Text>
                            {balanceInfo ? (
                                <Text style={styles.totalAmount}>
                                    ₹ {totalBalance.toLocaleString('en-IN')}
                                </Text>
                            ) : (
                                <View style={{ alignItems: 'flex-start', marginTop: 4 }}>
                                    <ShowLoaderBtn color="#FFFFFF" size={18} />
                                </View>
                            )}
                        </View>

                        {/* Neomorphic Dropdown Trigger Chevron */}
                        <View style={[styles.chevronOuterShadow, { backgroundColor: baseSurfaceColor }]}>
                          <LinearGradient
                              colors={["rgba(255,255,255,0.35)", "rgba(0,0,0,0.15)"]}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 1 }}
                              style={styles.chevronGradient}
                          >
                            <View style={[styles.chevronInner, { backgroundColor: baseSurfaceColor }, openDropdown && { transform: [{ rotate: '180deg' }] }]}>
                                <OnelineDropdownSvg color="#FFFFFF" />
                            </View>
                          </LinearGradient>
                        </View>
                    </TouchableOpacity>
                </LinearGradient>
            </View>

            {/* Dropdown Content Surface */}
            {openDropdown && (
                <View style={styles.dropdownBody}>
                    <View style={styles.gridRow}>
                        {BALANCE_ITEMS.map((item, index) => (
                            <View
                                key={item.key}
                                style={[
                                    styles.cardOuterContainer,
                                    index % 2 === 0 ? { paddingRight: wScale(5) } : { paddingLeft: wScale(5) },
                                ]}
                            >
                                {/* Inset / Carved-in shadow look for Individual balance indicators */}
                                <LinearGradient
                                    colors={["rgba(0,0,0,0.2)", "rgba(255,255,255,0.25)"]}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.balanceCardInset}
                                >
                                    <View style={[styles.balanceCardSurface, { backgroundColor: baseSurfaceColor }]}>
                                        <Text style={styles.cardLabel}>{item.label}</Text>
                                        <Text style={styles.cardValue} numberOfLines={1} adjustsFontSizeToFit>
                                            ₹ {Number(balanceInfo?.[item.key] || 0).toLocaleString('en-IN')}
                                        </Text>
                                    </View>
                                </LinearGradient>
                            </View>
                        ))}
                    </View>
                </View>
            )}
        </View>
    );
};

export default AllBalance;

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: wScale(14),
        paddingBottom: hScale(14),
        borderBottomLeftRadius: wScale(24),
        borderBottomRightRadius: wScale(24),
    },
    
    // ── Neomorphic Main Bar Styles ──
    mainBarOuterShadow: {
        borderRadius: wScale(18),
        shadowColor: "#000",
        shadowOffset: { width: 4, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 6,
    },
    mainBarGradient: {
        borderRadius: wScale(18),
        padding: 1.5,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: wScale(16.5),
        paddingHorizontal: wScale(12),
        paddingVertical: hScale(12),
    },
    
    // Inset Icon Area Style
    iconBoxOuter: {
        height: wScale(44),
        width: wScale(44),
        borderRadius: wScale(14),
        padding: 1.5,
        marginRight: wScale(12),
    },
    iconBoxInner: {
        flex: 1,
        borderRadius: wScale(12.5),
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.02)',
    },

    headerMid: {
        flex: 1,
    },
    walletLabel: {
        fontSize: wScale(11),
        color: 'rgba(255,255,255,0.75)',
        fontWeight: '600',
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    totalAmount: {
        fontSize: wScale(20),
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.3,
        marginTop: 2,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },

    // Chevron Neomorphic Style
    chevronOuterShadow: {
        borderRadius: wScale(16),
        shadowColor: "#000",
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 4,
    },
    chevronGradient: {
        borderRadius: wScale(16),
        padding: 1.2,
    },
    chevronInner: {
        width: wScale(32),
        height: wScale(32),
        borderRadius: wScale(14.8),
        alignItems: 'center',
        justifyContent: 'center',
    },

    // ── Dropdown Grid Layout Styles ──
    dropdownBody: {
        marginTop: hScale(14),
    },
    gridRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    cardOuterContainer: {
        width: '50%',
        marginBottom: hScale(10),
    },
    balanceCardInset: {
        borderRadius: wScale(14),
        padding: 1.5,
    },
    balanceCardSurface: {
        borderRadius: wScale(12.5),
        paddingHorizontal: wScale(12),
        paddingVertical: hScale(10),
        backgroundColor: 'rgba(0,0,0,0.03)',
    },
    cardLabel: {
        fontSize: wScale(10.5),
        color: 'rgba(255, 255, 255, 0.7)',
        fontWeight: '600',
        letterSpacing: 0.4,
        textTransform: 'uppercase',
        marginBottom: hScale(3),
    },
    cardValue: {
        fontSize: wScale(16),
        fontWeight: '700',
        color: '#FFFFFF',
        letterSpacing: 0.2,
        textShadowColor: 'rgba(0, 0, 0, 0.15)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 1,
    },
});