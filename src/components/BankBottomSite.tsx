import React, { useState } from "react";
import { Text, TouchableOpacity, View, StyleSheet, TextInput } from "react-native";
import { BottomSheet } from "@rneui/themed";
import { FlashList } from "@shopify/flash-list";
import { useSelector } from "react-redux";
import { RootState } from "../reduxUtils/store";
import { SCREEN_HEIGHT, hScale, wScale } from "../utils/styles/dimensions";
import ClosseModalSvg2 from "../features/drawer/svgimgcomponents/ClosseModal2";
import FacescanSvg from "../features/drawer/svgimgcomponents/FacescanSvg";
import { translate } from "../utils/languageUtils/I18n";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const BankBottomSite = ({ isbank, setisbank, setBankName, bankdata, setBankId, onPress1, setisFacialTan }) => {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);

    const PRIMARY = colorConfig.secondaryColor || '#6366F1';
    const PRIMARY_LIGHT = `${PRIMARY}12`;
    const PRIMARY_MID = `${PRIMARY}30`;

    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = bankdata.filter(item =>
        item['bankName'].toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSelect = (item) => {
        onPress1(item['iINNo']);
        setBankId(item['iINNo']);
        setisFacialTan(item['isFacialTan']);
        setBankName(item['bankName']);
        setisbank(false);
        setSearchQuery('');
    };

    // ── Bank initial avatar ───────────────────────────────────────────────────
    const BankAvatar = ({ name }: { name: string }) => (
        <View style={[avatar.wrap, { backgroundColor: PRIMARY_LIGHT, borderColor: PRIMARY_MID }]}>
            <Text style={[avatar.text, { color: PRIMARY }]}>
                {(name || 'B').charAt(0).toUpperCase()}
            </Text>
        </View>
    );

    const renderItem = ({ item, index }: { item: any; index: number }) => (
        <TouchableOpacity
            style={[itemS.row, { backgroundColor: index % 2 === 0 ? '#fff' : '#FAFAFA' }]}
            onPress={() => handleSelect(item)}
            activeOpacity={0.7}
        >
            <BankAvatar name={item['bankName']} />

            <Text ellipsizeMode="tail" numberOfLines={1} style={itemS.name}>
                {item['bankName']}
            </Text>

            {item['isFacialTan'] && (
                <View style={[itemS.faceBadge, { backgroundColor: '#ECFDF5', borderColor: '#10B981' }]}>
                    <FacescanSvg />
                    <Text style={itemS.faceText}>Face</Text>
                </View>
            )}

            <View style={[itemS.arrow, { backgroundColor: PRIMARY_LIGHT }]}>
                <Text style={[itemS.arrowText, { color: PRIMARY }]}>›</Text>
            </View>
        </TouchableOpacity>
    );

    const EmptyList = () => (
        <View style={emptyS.wrap}>
            <Text style={emptyS.emoji}>🏦</Text>
            <Text style={emptyS.title}>No banks found</Text>
            <Text style={emptyS.sub}>Try a different search term</Text>
        </View>
    );
const insets = useSafeAreaInsets();
    return (
        <BottomSheet
            animationType="none"
            isVisible={isbank}
            containerStyle={[sheet.backdrop,{paddingBottom: insets.bottom}]}
            onBackdropPress={() => { setisbank(false); setSearchQuery(''); }}
        >
            <View style={sheet.container}>

                {/* Drag handle */}
                <View style={[sheet.handle, { backgroundColor: PRIMARY_MID }]} />

                {/* Header */}
                <View style={sheet.header}>
                    <View style={[sheet.iconWrap, { backgroundColor: PRIMARY_LIGHT }]}>
                        <Text style={[sheet.iconText, { color: PRIMARY }]}>🏦</Text>
                    </View>
                    <Text style={sheet.title}>{translate('Select_Your_Bank')}</Text>
                    <TouchableOpacity
                        style={[sheet.closeBtn, { backgroundColor: PRIMARY_LIGHT }]}
                        onPress={() => { setisbank(false); setSearchQuery(''); }}
                        activeOpacity={0.7}
                    >
                        <ClosseModalSvg2 />
                    </TouchableOpacity>
                </View>

                {/* Search bar */}
                <View style={[searchS.wrap, { borderColor: searchQuery.length > 0 ? PRIMARY : '#E2E8F0' }]}>
                    <Text style={[searchS.icon, { color: searchQuery.length > 0 ? PRIMARY : '#94A3B8' }]}>⌕</Text>
                    <TextInput
                        placeholder={translate('Search') + '...'}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        style={searchS.input}
                        placeholderTextColor="#94A3B8"
                        cursorColor={PRIMARY}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={searchS.clearBtn}>
                            <Text style={[searchS.clearText, { color: PRIMARY }]}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Result count */}
                {searchQuery.length > 0 && (
                    <Text style={[searchS.resultCount, { color: PRIMARY }]}>
                        {filteredData.length} {translate('banks found')}
                    </Text>
                )}

                {/* List */}
                <View style={{ flex: 1 }}>
                    <FlashList
                        data={filteredData}
                        renderItem={renderItem}
                        estimatedItemSize={hScale(64)}
                        keyExtractor={(item, index) => index.toString()}
                        ListEmptyComponent={<EmptyList />}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: hScale(30) }}
                    />
                </View>
            </View>
        </BottomSheet>
    );
};

// ── Sheet styles ──────────────────────────────────────────────────────────────
const sheet = StyleSheet.create({
    backdrop: { backgroundColor: 'rgba(0,0,0,0.55)', flex: 1 },
    container: {
        backgroundColor: '#fff',
        height: SCREEN_HEIGHT / 1.25,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        overflow: 'hidden',
    },
    handle: {
        width: wScale(40), height: hScale(4), borderRadius: 2,
        alignSelf: 'center', marginTop: hScale(10), marginBottom: hScale(6),
    },
    header: {
        flexDirection: 'row', alignItems: 'center', gap: wScale(10),
        paddingHorizontal: wScale(16), paddingVertical: hScale(12),
        borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    },
    iconWrap: {
        width: wScale(36), height: wScale(36), borderRadius: wScale(10),
        alignItems: 'center', justifyContent: 'center',
    },
    iconText: { fontSize: wScale(18) },
    title: {
        flex: 1, fontSize: wScale(17), fontWeight: '800',
        color: '#1E293B', textTransform: 'capitalize',
    },
    closeBtn: {
        width: wScale(34), height: wScale(34),
        borderRadius: wScale(10), alignItems: 'center', justifyContent: 'center',
    },
});

// ── Search styles ─────────────────────────────────────────────────────────────
const searchS = StyleSheet.create({
    wrap: {
        flexDirection: 'row', alignItems: 'center',
        marginHorizontal: wScale(14), marginTop: hScale(12), marginBottom: hScale(4),
        borderWidth: 1.5, borderRadius: wScale(12),
        paddingHorizontal: wScale(12), backgroundColor: '#F8FAFC',
        height: hScale(46),
    },
    icon: { fontSize: wScale(18), marginRight: wScale(6) },
    input: {
        flex: 1, fontSize: wScale(14), color: '#1E293B',
        paddingVertical: 0,
    },
    clearBtn: {
        width: wScale(22), height: wScale(22), borderRadius: 11,
        alignItems: 'center', justifyContent: 'center',
    },
    clearText: { fontSize: wScale(12), fontWeight: '700' },
    resultCount: {
        fontSize: wScale(11), fontWeight: '700',
        paddingHorizontal: wScale(16), marginBottom: hScale(6),
    },
});

// ── Item styles ───────────────────────────────────────────────────────────────
const itemS = StyleSheet.create({
    row: {
        flexDirection: 'row', alignItems: 'center', gap: wScale(10),
        paddingHorizontal: wScale(14), paddingVertical: hScale(10),
        borderBottomWidth: 1, borderBottomColor: '#F8FAFC',
    },
    name: {
        flex: 1, fontSize: wScale(14), fontWeight: '600',
        color: '#1E293B', textTransform: 'capitalize',
    },
    faceBadge: {
        flexDirection: 'row', alignItems: 'center', gap: wScale(4),
        borderWidth: 1, borderRadius: wScale(8),
        paddingHorizontal: wScale(7), paddingVertical: hScale(4),
    },
    faceText: { fontSize: wScale(10), fontWeight: '700', color: '#065F46' },
    arrow: {
        width: wScale(26), height: wScale(26),
        borderRadius: wScale(8), alignItems: 'center', justifyContent: 'center',
    },
    arrowText: { fontSize: wScale(18), fontWeight: '700', lineHeight: wScale(22) },
});

// ── Avatar styles ─────────────────────────────────────────────────────────────
const avatar = StyleSheet.create({
    wrap: {
        width: wScale(36), height: wScale(36), borderRadius: wScale(10),
        alignItems: 'center', justifyContent: 'center', borderWidth: 1,
    },
    text: { fontSize: wScale(16), fontWeight: '800' },
});

// ── Empty state styles ────────────────────────────────────────────────────────
const emptyS = StyleSheet.create({
    wrap: { alignItems: 'center', paddingTop: hScale(60) },
    emoji: { fontSize: wScale(40), marginBottom: hScale(10) },
    title: { fontSize: wScale(16), fontWeight: '700', color: '#1E293B', marginBottom: hScale(4) },
    sub: { fontSize: wScale(13), color: '#94A3B8' },
});

export default BankBottomSite;