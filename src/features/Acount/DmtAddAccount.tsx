import { translate } from "../../utils/languageUtils/I18n";
import React, { useEffect, useState, useCallback } from "react";
import {
    TouchableOpacity, View, Text, StyleSheet, ScrollView,
    Alert, Image, PermissionsAndroid, Platform, Animated
} from "react-native";
import useAxiosHook from "../../utils/network/AxiosClient";
import { APP_URLS } from "../../utils/network/urls";
import { hScale, wScale } from "../../utils/styles/dimensions";
import FlotingInput from "../drawer/securityPages/FlotingInput";
import AppBarSecond from "../drawer/headerAppbar/AppBarSecond";
import BankBottomSite from "../../components/BankBottomSite";
import OnelineDropdownSvg from "../drawer/svgimgcomponents/simpledropdown";
import { FlashList } from "@shopify/flash-list";
import { useDeviceInfoHook } from "../../utils/hooks/useDeviceInfoHook";
import { useSelector } from "react-redux";
import { RootState } from "../../reduxUtils/store";
import NoDatafound from "../drawer/svgimgcomponents/Nodatafound";
import DynamicButton from "../drawer/button/DynamicButton";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";
import { check, openSettings, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import ShowLoader from "../../components/ShowLoder";
import { DotLoader } from "../../components/DotLoader ";
import CheckSvg from "../drawer/svgimgcomponents/CheckSvg";
import CloseSvg from "../drawer/svgimgcomponents/CloseSvg";
import { BottomSheet } from "@rneui/themed";
import ClosseModalSvg2 from "../drawer/svgimgcomponents/ClosseModal2";
import { useLocationHook } from "../../hooks/useLocationHook";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import SkeletonCard from '../../components/SkeletonCard';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DmtAddAccount = () => {
    const { colorConfig, Loc_Data, userId } = useSelector((state: RootState) => state.userInfo);

    const PRIMARY = colorConfig.secondaryColor || '#6366F1';
    const PRIMARY_LIGHT = `${PRIMARY}15`;
    const PRIMARY_MID = `${PRIMARY}30`;

    const { get, post } = useAxiosHook();
    const [banklist, setBanklist] = useState([]);
    const [bank, setBank] = useState('');
    const [bankid, setBankid] = useState('');
    const [isBank, setIsBank] = useState(false);
    const [loading, setLoading] = useState(true);
    const [ifsccode, setIfsccode] = useState('');
    const [acnNumber, setAcnNumber] = useState('');
    const [name, setName] = useState('');
    const [branch, setBranch] = useState('');
    const [Addresss, setAddresss] = useState('');
    const [bankAcclist, setBankAcclist] = useState([]);
    const [Pincod, setPincode] = useState('');
    const [city, setCity] = useState('');
    const [add, setAdd] = useState(false);
    const [idno, setIdno] = useState('');
    const [base64Img, setbase64Img] = useState<any>(null);
    const [isLoading, setisLoading] = useState(false);
    const [imgshow, setImgshow] = useState(false);
    const [imgurl, setImgurl] = useState('');
    const { latitude, longitude } = useLocationHook();
    const { getNetworkCarrier, getMobileDeviceId, getMobileIp } = useDeviceInfoHook();

    const UpdateRetailerBank = useCallback(async (id) => {
        setisLoading(true);
        try {
            const ip = await getMobileIp();
            const Model = await getMobileDeviceId();
            const net = await getNetworkCarrier();
            const data = {
                txtid3: id, txtaccholder: name, txtbankaccountno: acnNumber,
                txtifsc: ifsccode, txtbankname: bank, txtbranchaddress: branch,
                IP: ip, Latitude: Loc_Data['latitude'], Longitude: Loc_Data['longitude'],
                ModelNo: Model, City: city, PostalCode: Pincod, InternetTYPE: net, Address: Addresss,
            };
            const response = await post({ url: `${APP_URLS.UpdateRetailerBank}`, data });
            if (response.Response === 'Success') {
                setIdno(response.idno.toString());
                Alert.alert('', `${response.Message} \n Select option to upload Cancel Cheque Photo`, [
                    { text: 'Camera', onPress: async () => await requestCameraPermission() },
                    {
                        text: 'Gallery',
                        onPress: async () => {
                            await launchImageLibrary({ selectionLimit: 1, mediaType: 'photo', includeBase64: true }, (res) => {
                                setbase64Img(res?.assets?.[0]?.base64);
                            });
                        },
                    },
                    { text: 'Cancel', style: 'cancel' },
                ]);
            } else {
                Alert.alert(`${response.Message}`);
            }
        } catch (error) {
            Alert.alert('Error', error?.message || 'Something went wrong');
        } finally {
            setisLoading(false);
        }
    }, [name, acnNumber, ifsccode, bank, branch, Loc_Data, city, Pincod, Addresss]);

    const uploadDoCx = async (bs64, idno) => {
        setisLoading(true);
        try {
            const response = await fetch(`https://${APP_URLS.baseWebUrl}/api/user/Uploadcancelledcheque`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: 'Bearer ' },
                body: JSON.stringify({ cancelledcheque: bs64, cancellchecque_idno: idno, currentrole: 'Retailer' }),
            });
            if (!response.ok) throw new Error('Network response was not ok');
            const responseData = await response.json();
            if (responseData.Message === 'Image Updated Successfully.') {
                Alert.alert('Success', 'Image Updated Successfully.');
            } else {
                Alert.alert('Error', responseData.Message || 'Upload failed');
            }
            setAdd(false);
        } catch (error) {
            Alert.alert('Error', `Failed to upload: ${error.message}`);
        } finally {
            setisLoading(false);
        }
    };

    useEffect(() => {
        fetchBanks();
        const fetchBankAccounts = async () => {
            setLoading(true);
            try {
                const response = await get({ url: `${APP_URLS.SavedAccounts}` });
                if (response.Response === 'Success') {
                    setBankAcclist(response.Message);
                } else {
                    Alert.alert('Error', 'Failed to load bank accounts');
                }
            } catch (error) {
                Alert.alert('Error', 'An error occurred while fetching bank accounts');
            } finally {
                setLoading(false);
            }
        };
        fetchBankAccounts();
    }, []);

    const fetchBanks = async () => {
        try {
            const response = await post({ url: `${APP_URLS.aepsBanklist}` });
            if (response.RESULT === '0') setBanklist(response['ADDINFO']['data']);
        } catch (error) { console.error(error); }
    };


const requestCameraPermission = useCallback(async () => {
  try {
    // Step 1 — Pehle check karo
    const currentStatus = await check(PERMISSIONS.ANDROID.CAMERA);

    // Already blocked hai — settings pe bhejo
    if (currentStatus === RESULTS.BLOCKED) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'Permission Required',
        textBody: 'key_pleasegra_85',
        button: 'OK',
        onPressButton: () => {
          Dialog.hide();
          openSettings().catch(() => {});
        },
      });
      return;
    }

    // Step 2 — Granted nahi hai toh maango
    if (currentStatus !== RESULTS.GRANTED) {
      const result = await request(PERMISSIONS.ANDROID.CAMERA);
      if (result !== RESULTS.GRANTED) return;
    }

    // Step 3 — Camera launch karo
    await launchCamera(
      {
        mediaType: 'photo',
        includeBase64: true,
        quality: 0.5,
        saveToPhotos: false,  // ✅ Gallery mein save nahi hoga
      },
      (res) => {
        setbase64Img(res?.assets?.[0]?.base64);
      },
    );

  } catch (err) {
    console.warn(err);
  }
}, []);

    // ── Status badge ──────────────────────────────────────────────────────────
    const StatusBadge = ({ status }: { status: string }) => {
        const isApproved = status === 'Approved';
        const isPending = status === 'Pending';
        const bg = isApproved ? '#D1FAE5' : isPending ? '#FEF9C3' : '#FEE2E2';
        const dot = isApproved ? '#10B981' : isPending ? '#EAB308' : '#EF4444';
        const textColor = isApproved ? '#065F46' : isPending ? '#713F12' : '#7F1D1D';
        return (
            <View style={[statusBadge.wrap, { backgroundColor: bg }]}>
                <View style={[statusBadge.dot, { backgroundColor: dot }]} />
                <Text style={[statusBadge.text, { color: textColor }]}>{status}</Text>
            </View>
        );
    };

    // ── Info row ──────────────────────────────────────────────────────────────
    const InfoRow = ({ left, right }: { left: { label: string; value: any }; right: { label: string; value: any } }) => (
        <View style={infoRow.wrap}>
            <View style={infoRow.cell}>
                <Text style={infoRow.label}>{left.label}</Text>
                <Text style={infoRow.value}>{left.value || <DotLoader />}</Text>
            </View>
            <View style={[infoRow.cell, { alignItems: 'flex-end' }]}>
                <Text style={infoRow.label}>{right.label}</Text>
                <Text style={[infoRow.value, { textAlign: 'right' }]}>{right.value || <DotLoader />}</Text>
            </View>
        </View>
    );

    // ── Card render ───────────────────────────────────────────────────────────
    const renderItem = ({ item }) => (
        <View style={[cardS.shell, { borderTopColor: PRIMARY }]}>
            <View style={[cardS.accentBar, { backgroundColor: PRIMARY_LIGHT }]}>
                <View style={cardS.bankIconWrap}>
                    <Text style={[cardS.bankInitial, { color: PRIMARY }]}>
                        {(item.Bank_Name || 'B').charAt(0)}
                    </Text>
                </View>
                <Text style={[cardS.bankName, { color: PRIMARY }]} numberOfLines={1}>
                    {item.Bank_Name || <DotLoader />}
                </Text>
                <StatusBadge status={item.Status} />
            </View>
            <View style={cardS.body}>
                <InfoRow
                    left={{ label: translate('Account_Holder_Name'), value: item.AcconutHolderName }}
                    right={{ label: translate('IFSC_Code'), value: item.IFSC_CODE }}
                />
                <View style={cardS.divider} />
                <InfoRow
                    left={{ label: translate('Account_NO'), value: item.BankAccountNo }}
                    right={{ label: translate('Branch'), value: item.Bank_Address }}
                />
            </View>
            <View style={[cardS.footer, { backgroundColor: PRIMARY_LIGHT }]}>
                <View style={cardS.footerLeft}>
                    <View style={[cardS.chequeIcon, {
                        backgroundColor: item.Status === 'Approved' ? '#D1FAE5' : item.Status === 'Pending' ? '#FEF9C3' : '#FEE2E2'
                    }]}>
                        {item.Status === 'Approved' ? <CheckSvg size={14} /> : <CloseSvg size={14} />}
                    </View>
                    <Text style={cardS.chequeLabel}>{translate('Cancel_Cheque')}</Text>
                </View>
                <TouchableOpacity
                    style={[cardS.viewBtn, { borderColor: PRIMARY, backgroundColor: '#fff' }]}
                    onPress={() => {
                        if (item.CancelCheckFile === null) { setImgurl(''); setImgshow(true); return; }
                        const url = `https://${APP_URLS.baseWebUrl}${item.CancelCheckFile}`;
                        setImgurl(url.replace(/^https?:\/\/www\./, 'https://'));
                        setImgshow(true);
                    }}
                >
                    <Text style={[cardS.viewBtnText, { color: PRIMARY }]}>{translate('View')}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    // ── Form progress ─────────────────────────────────────────────────────────
    const formSteps = [bank, ifsccode, name, acnNumber, branch, city, Addresss, Pincod];
    const completedSteps = formSteps.filter(v => v !== '').length;
    const totalSteps = formSteps.length;

    const SectionLabel = ({ text }: { text: string }) => (
        <Text style={[formS.sectionLabel, { color: PRIMARY }]}>{text}</Text>
    );
const SkeletonList = () => (
  <View style={{ padding: wScale(14), paddingBottom: hScale(32) }}>
    {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
  </View>
);
const insets = useSafeAreaInsets();
    return (
        <View style={styles.root}>
            <AppBarSecond
                title={translate('DMT Add Account')}
                onActionPress={undefined}
                actionButton={undefined}
                onPressBack={undefined}
            />

            <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>

                {/* ── Cancel cheque viewer ── */}
                <BottomSheet animationType="none" isVisible={imgshow}
                    containerStyle={sheetS.backdrop} onBackdropPress={() => setImgshow(false)}>
                    <View style={sheetS.sheet}>
                        <View style={[sheetS.handle, { backgroundColor: PRIMARY_MID }]} />
                        <View style={sheetS.header}>
                            <Text style={sheetS.headerTitle}>{translate('view_Cancel_Cheque')}</Text>
                            <TouchableOpacity style={[sheetS.closeBtn, { backgroundColor: PRIMARY_LIGHT }]}
                                onPress={() => { setImgshow(false); setImgurl(''); }}>
                                <ClosseModalSvg2 />
                            </TouchableOpacity>
                        </View>
                        <View style={sheetS.imgWrap}>
                            {imgurl ? <Image source={{ uri: imgurl }} style={sheetS.img} resizeMode="contain" /> : <NoDatafound />}
                        </View>
                    </View>
                </BottomSheet>

                {/* ── Add account form ── */}
                <BottomSheet animationType="none" isVisible={add}
                    containerStyle={[sheetS.backdrop, { paddingBottom: insets.bottom + hScale(10) }]} onBackdropPress={() => setAdd(false)}>
                    <KeyboardAwareScrollView
                        enableOnAndroid enableAutomaticScroll
                        extraScrollHeight={Platform.OS === 'ios' ? hScale(50) : hScale(100)}
                        keyboardShouldPersistTaps="handled"
                        style={{ width: '100%', backgroundColor: '#fff' }}
                    >
                        <View style={sheetS.sheet}>
                            <View style={[sheetS.handle, { backgroundColor: PRIMARY_MID }]} />
                            <View style={sheetS.header}>
                                <Text style={sheetS.headerTitle}>{translate('Wallet_Unload_Ac')}</Text>
                                <TouchableOpacity style={[sheetS.closeBtn, { backgroundColor: PRIMARY_LIGHT }]}
                                    onPress={() => setAdd(false)}>
                                    <ClosseModalSvg2 />
                                </TouchableOpacity>
                            </View>

                            {/* Progress bar */}
                            <View style={formS.progressWrap}>
                                <View style={formS.progressTrack}>
                                    <View style={[formS.progressFill, { width: `${(completedSteps / totalSteps) * 100}%`, backgroundColor: PRIMARY }]} />
                                </View>
                                <Text style={[formS.progressText, { color: PRIMARY }]}>
                                    {completedSteps}/{totalSteps} {translate('fields')}
                                </Text>
                            </View>

                            <View style={formS.body}>
                                <SectionLabel text="Bank Details" />
                                <TouchableOpacity onPress={() => setIsBank(true)} activeOpacity={0.8}>
                                    <FlotingInput label={'Select Bank'} value={bank} keyboardType="default"
                                        editable={false} inputstyle={formS.input} labelinputstyle={undefined} onChangeTextCallback={undefined} />
                                    {bank.length === 0 && <View style={formS.dropIcon}><OnelineDropdownSvg /></View>}
                                </TouchableOpacity>
                                <FlotingInput label={'IFSC Code'} value={ifsccode} editable={bank !== ''}
                                    onChangeTextCallback={setIfsccode} inputstyle={formS.input} labelinputstyle={undefined} />

                                <SectionLabel text="Account Details" />
                                <FlotingInput label={'Account Holder Name'} value={name} editable={ifsccode !== ''}
                                    onChangeTextCallback={setName} inputstyle={formS.input} labelinputstyle={undefined} />
                                <FlotingInput label={'Account Number'} value={acnNumber} editable={name !== ''}
                                    keyboardType="numeric" onChangeTextCallback={setAcnNumber}
                                    inputstyle={formS.input} labelinputstyle={undefined} />

                                <SectionLabel text="Address Details" />
                                <FlotingInput label={'Branch'} value={branch} editable={acnNumber !== ''}
                                    onChangeTextCallback={setBranch} inputstyle={formS.input} labelinputstyle={undefined} />
                                <FlotingInput label={'City'} value={city} editable={branch !== ''}
                                    onChangeTextCallback={setCity} inputstyle={formS.input} labelinputstyle={undefined} />
                                <FlotingInput label={'Address'} value={Addresss} editable={city !== ''}
                                    onChangeTextCallback={setAddresss} inputstyle={formS.input} labelinputstyle={undefined} />
                                <FlotingInput label={'PinCode'} value={Pincod} editable={Addresss !== ''}
                                    keyboardType="numeric" onChangeTextCallback={setPincode}
                                    inputstyle={formS.input} labelinputstyle={undefined} />

                                <BankBottomSite setBankId={setBankid} isbank={isBank} setisbank={setIsBank}
                                    setBankName={setBank} bankdata={banklist} onPress1={() => {}} setisFacialTan={() => {}} />

                                {base64Img && (
                                    <View style={formS.imgPreviewWrap}>
                                        <SectionLabel text="Photo Preview" />
                                        <Image source={{ uri: `data:image/png;base64,${base64Img}` }}
                                            style={formS.imgPreview} resizeMode="cover" />
                                    </View>
                                )}

                                <View style={{ marginTop: hScale(10), marginBottom: hScale(30) }}>
                                    <DynamicButton
                                        title={isLoading ? 'Processing...' : (base64Img ? 'Upload Photo' : 'Submit Details')}
                                        onPress={() => {
                                            if (Pincod) {
                                                base64Img ? uploadDoCx(base64Img, idno) : UpdateRetailerBank('');
                                            }
                                        }}
                                        styleoveride={undefined} />
                                </View>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </BottomSheet>

                {/* ── Main page ── */}
                <View style={styles.pageBody}>

                    {/* Hero banner — WITH title field added */}
                    <View style={[styles.heroBanner, { backgroundColor: PRIMARY_LIGHT, borderColor: PRIMARY_MID }]}>
                        <View style={[styles.dmtIconWrap, { backgroundColor: PRIMARY }]}>
                            <Text style={styles.dmtIconText}>₹</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.heroTitle, { color: PRIMARY }]}>
                                {translate('DMT Accounts')}
                            </Text>
                            <Text style={styles.heroSub}>
                                {translate('Manage your fund transfer bank accounts')}
                            </Text>
                        </View>
                    </View>

                    {/* Add button */}
                    <TouchableOpacity
                        style={[styles.addBtn, { backgroundColor: PRIMARY }]}
                        onPress={() => setAdd(!add)}
                        activeOpacity={0.85}
                    >
                        <Text style={styles.addBtnPlus}>＋</Text>
                        <Text style={styles.addBtnText}>{'Add DMT Account'}</Text>
                    </TouchableOpacity>

                    {/* List */}
        {loading && <SkeletonList />}

                    <View style={styles.listWrap}>
                        <FlashList
                            data={bankAcclist}
                            renderItem={renderItem}
                            estimatedItemSize={200}
                            keyExtractor={(item) => item.Idno.toString()}
                            ListEmptyComponent={() =>
                                !loading && <View style={{ marginTop: hScale(20) }}><NoDatafound /></View>
                            }
                            scrollEnabled={false}
                        />
                    </View>
                </View>
            </ScrollView>

            {isLoading && <ShowLoader />}
        </View>
    );
};

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: '#F8FAFC' },
    scroll: { flex: 1 },
    pageBody: { paddingHorizontal: wScale(14), paddingTop: hScale(14), paddingBottom: hScale(40) },
    heroBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: wScale(12),
        borderRadius: wScale(14),
        borderWidth: 1,
        padding: wScale(14),
        marginBottom: hScale(14),
    },
    dmtIconWrap: {
        width: wScale(44), height: wScale(44), borderRadius: wScale(12),
        alignItems: 'center', justifyContent: 'center',
    },
    dmtIconText: { fontSize: wScale(22), color: '#fff', fontWeight: '800' },
    heroTitle: { fontSize: wScale(16), fontWeight: '800', marginBottom: hScale(2) },
    heroSub: { fontSize: wScale(11), color: '#64748B', lineHeight: hScale(16) },
    addBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        borderRadius: wScale(12), paddingVertical: hScale(13), marginBottom: hScale(18),
        shadowColor: '#000', shadowOffset: { width: 0, height: hScale(3) },
        shadowOpacity: 0.15, shadowRadius: 6, elevation: 4,
    },
    addBtnPlus: { fontSize: wScale(20), color: '#fff', marginRight: wScale(8), lineHeight: wScale(22) },
    addBtnText: { fontSize: wScale(15), fontWeight: '700', color: '#fff', letterSpacing: 0.3 },
    listWrap: {},
});

const cardS = StyleSheet.create({
    shell: {
        backgroundColor: '#fff', borderRadius: wScale(14), marginBottom: hScale(12),
        overflow: 'hidden', borderTopWidth: wScale(3),
        shadowColor: '#000', shadowOffset: { width: 0, height: hScale(2) },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    },
    accentBar: {
        flexDirection: 'row', alignItems: 'center', gap: wScale(8),
        paddingHorizontal: wScale(12), paddingVertical: hScale(10),
    },
    bankIconWrap: {
        width: wScale(32), height: wScale(32), borderRadius: wScale(8),
        backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
        shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 3, elevation: 2,
    },
    bankInitial: { fontSize: wScale(16), fontWeight: '800' },
    bankName: { flex: 1, fontSize: wScale(13), fontWeight: '700' },
    body: { paddingHorizontal: wScale(12), paddingVertical: hScale(10) },
    divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: hScale(6) },
    footer: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: wScale(12), paddingVertical: hScale(8),
    },
    footerLeft: { flexDirection: 'row', alignItems: 'center', gap: wScale(6) },
    chequeIcon: { width: wScale(24), height: wScale(24), borderRadius: wScale(6), alignItems: 'center', justifyContent: 'center' },
    chequeLabel: { fontSize: wScale(12), color: '#64748B', fontWeight: '600' },
    viewBtn: { borderWidth: 1.5, borderRadius: wScale(8), paddingHorizontal: wScale(14), paddingVertical: hScale(5) },
    viewBtnText: { fontSize: wScale(12), fontWeight: '700' },
});

const infoRow = StyleSheet.create({
    wrap: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: hScale(2) },
    cell: { flex: 1 },
    label: { fontSize: wScale(10), color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: hScale(2) },
    value: { fontSize: wScale(13), fontWeight: '700', color: '#1E293B' },
});

const statusBadge = StyleSheet.create({
    wrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: wScale(8), paddingVertical: hScale(3), borderRadius: wScale(20) },
    dot: { width: wScale(6), height: wScale(6), borderRadius: 10, marginRight: wScale(4) },
    text: { fontSize: wScale(11), fontWeight: '700' },
});

const sheetS = StyleSheet.create({
    backdrop: { backgroundColor: 'rgba(0,0,0,0.55)', flex: 1 },
    sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden' },
    handle: { width: wScale(40), height: hScale(4), borderRadius: 2, alignSelf: 'center', marginTop: hScale(10), marginBottom: hScale(4) },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: wScale(16), paddingVertical: hScale(14),
        borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    },
    headerTitle: { fontSize: wScale(17), fontWeight: '800', color: '#1E293B', flex: 1 },
    closeBtn: { width: wScale(34), height: wScale(34), borderRadius: wScale(10), alignItems: 'center', justifyContent: 'center' },
    imgWrap: { justifyContent: 'center', alignItems: 'center', padding: wScale(16), minHeight: hScale(300) },
    img: { width: '100%', height: hScale(300), borderRadius: 12 },
});

const formS = StyleSheet.create({
    body: { paddingHorizontal: wScale(16), paddingTop: hScale(8) },
    sectionLabel: {
        fontSize: wScale(11), fontWeight: '800', letterSpacing: 1,
        textTransform: 'uppercase', marginTop: hScale(14), marginBottom: hScale(4),
    },
    input: { borderRadius: wScale(10), backgroundColor: '#F8FAFC' },
    dropIcon: {
        position: 'absolute', right: wScale(0), top: 0, height: '100%',
        alignItems: 'flex-end', justifyContent: 'center', paddingRight: wScale(12),
    },
    imgPreviewWrap: { marginTop: hScale(10), borderRadius: 12, overflow: 'hidden' },
    imgPreview: { width: wScale(180), height: hScale(220), borderRadius: 10, alignSelf: 'center' },
    progressWrap: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: wScale(16), paddingVertical: hScale(10),
        borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
    },
    progressTrack: {
        flex: 1, height: hScale(5), backgroundColor: '#E2E8F0',
        borderRadius: 10, marginRight: wScale(10), overflow: 'hidden',
    },
    progressFill: { height: '100%', borderRadius: 10 },
    progressText: { fontSize: wScale(11), fontWeight: '800', minWidth: wScale(40), textAlign: 'right' },
});

export default DmtAddAccount;