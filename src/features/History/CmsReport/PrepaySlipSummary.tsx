import { translate } from "../../../utils/languageUtils/I18n";
import React, { useCallback, useEffect, useRef } from "react";
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ToastAndroid } from "react-native";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import AppBarSecond from "../../drawer/headerAppbar/AppBarSecond";
import CheckSvg from "../../drawer/svgimgcomponents/CheckSvg";
import ViewShot, { captureRef } from "react-native-view-shot";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { APP_URLS } from "../../../utils/network/urls";
import Share from "react-native-share";
import { shareSlipImage } from "../../../utils/shareSlipImage ";
import FastImage from "react-native-fast-image";
import { getAssetSource } from "../../../utils/network/NetWorkImages";

const PrepaySlipSummary = ({ route, }) => {
    const { slipData, action } = route.params;
    const capRef = useRef();

console.log(action);

    const handleShare = () => {
        shareSlipImage(capRef);
    }
    useEffect(() => {
        if (action === 'share') {
            setTimeout(() => {
                handleShare()
            }, 200);

        }
    }, [action])
    const renderDenominations = (slipData) => {
        const denominations = [
            { denom: 500, value: parseInt(slipData.s500 || '0') },
            { denom: 200, value: parseInt(slipData.s200 || '0') },
            { denom: 100, value: parseInt(slipData.s100 || '0') },
            { denom: 50, value: parseInt(slipData.s50 || '0') },
            { denom: 20, value: parseInt(slipData.s20 || '0') },
            { denom: 10, value: parseInt(slipData.s10 || '0') },
            { denom: 5, value: parseInt(slipData.s5 || '0') },
            { denom: 'Others', value: parseInt(slipData.coins || '0') },
        ];


        return (
            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableCell, styles.headerCell, styles.col25]}>{translate("Denom")}</Text>
                    <Text style={[styles.tableCell, styles.headerCell, styles.col25]}>{translate("No_of_Notes")}</Text>
                    <Text style={[styles.tableCell, styles.headerCell, styles.col50]}>{translate("Amount_INR")}</Text>
                </View>

                {denominations.map((item, idx) => (
                    <View key={idx} style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.col25]}>{item.denom}</Text>
                        <Text style={[styles.tableCell, styles.col25]}>{item.value}</Text>
                        <Text style={[styles.tableCell, styles.col50]}>
                            {item.denom !== 'Others' ? item.denom * item.value : item.value}
                        </Text>
                    </View>
                ))}

                <View style={styles.tableRow}>
                    <Text style={[styles.tableCell, styles.col25, { fontWeight: 'bold' }]}>{translate("Total_Amount")}</Text>
                    <Text style={[styles.tableCell, styles.col25]}></Text>

                    <Text style={[styles.tableCell, styles.col50, { fontWeight: 'bold', }]}>
                        {slipData.pickup_amount || '---'}
                    </Text>
                </View>


            </View>
        );
    };
    return (
        <View style={styles.main}>
            <AppBarSecond title={'Pickup Summary'}
                actionButton={
                    <TouchableOpacity style={{ alignItems: 'center', }} onPress={handleShare}>
                        <FontAwesome
                            name="whatsapp"
                            color="#fff"
                            size={20}
                        />
                        <Text style={{ color: '#fff', fontSize: wScale(10) }}>{translate("ShareSlip")}</Text>
                    </TouchableOpacity>}
                onActionPress={() => { }} />

            <ScrollView >
                <ViewShot ref={capRef}
                    options={{
                        fileName: "TransactionReciept",
                        format: "jpg",
                        quality: 0.9,
                    }}>
                    <View style={styles.topcontainer}>

                        <FastImage 
                        
                        source={getAssetSource(`${APP_URLS.cms_logo}`)} 
                        
                        style={styles.imgstyle} resizeMode="contain" />
                        <View>
                            <Text style={styles.title}>{translate("Radiant")}</Text>
                            <Text style={styles.title2}>{translate("CASH_MANAGEMENT_SERVICES_LIMITED")}</Text>
                            <Text style={styles.companyISO}>{translate("An_ISO_9001_2015_Company")}</Text>
                        </View>
                        <FastImage source={getAssetSource('CmsSlipQr.jpg')}
                            style={{ width: wScale(70), height: hScale(70), }} resizeMode='center' />
                    </View>

                    <View style={styles.container}>
                        <View style={styles.row}>
                            <Text style={styles.time}>{slipData.hcislipallow === 'NotAllow' ? 'REQ ID- ' : 'Hci Slip- '}
                                <Text style={{ color: '#191970' }}>{slipData.hcl_no || '---'}</Text></Text>
                            <Text style={[styles.time,]}>Pickup Time: {slipData.trans_date || '---'}</Text>
                        </View>







                        <Text style={styles.label}>{translate("Customer_Bank_Name")}</Text>
                        <Text style={styles.linkText}><Text style={{ color: '#191970' }}>{slipData.cust_name || '---'}</Text></Text>

                        <Text style={styles.label}>{translate("Pickup_Point_Name_Address")}</Text>
                        <Text style={[styles.value, { fontSize: 12 }]}>{slipData.point_name || '---'}</Text>



                        <View style={styles.row}>
                            <View>
                                <Text style={styles.label}>{translate("Point_Contact_Person")}</Text>
                                <Text style={styles.value}>{slipData.ClientName || '---'}</Text>
                            </View>
                            <View style={styles.rightColum}>
                                <Text style={styles.label}>{translate("Point_Mobile_Number")}</Text>
                                <Text style={styles.value}>{slipData.ClientMobile || '---'}</Text>
                            </View>
                        </View>



                        <View style={styles.row}>
                            <View>
                                <Text style={styles.label}>{translate("PointClientShop_ID")}</Text>
                                <Text style={styles.value}>{slipData.shop_id || '---'}</Text>
                            </View>
                            <View style={styles.rightColum}>
                                <Text style={styles.label}>{translate("Pickup_Transaction_ID")}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' ,paddingTop:hScale(4)}}>
                                    <View style={{ borderRadius: 20, backgroundColor: 'green', alignItems: 'center', padding: 5 }}>
                                        <CheckSvg size={7} />
                                    </View>
                                    <Text style={[styles.value, { marginBottom: 0, marginLeft: 4 }]}>{slipData.transId || '---'}</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.rceSection}>
                            <Image source={{ uri: slipData.PhotoName }} style={styles.avatar} resizeMode='stretch' />
                            <View style={{ flex: 1 }}>
                                <View style={styles.row}>
                                    <Text style={[styles.rceText, styles.bold]}>{translate("RCEs_Name")}</Text>
                                    <Text style={styles.rceText}>{slipData.Name || '---'}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={[styles.rceText, styles.bold]}>{translate("Employee_ID")}</Text>
                                    <Text style={styles.rceText}>{slipData.ceId || '---'}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={[styles.rceText, styles.bold]}>{translate("Mobile_No")}</Text>
                                    <Text style={styles.rceText}>{slipData.Mobile || '---'}</Text>
                                </View>
                                <View style={styles.row}>
                                    <Text style={[styles.rceText, styles.bold]}>{translate("Email_ID")}</Text>
                                    <Text style={styles.rceText}>{slipData.emailid || '---'}</Text>
                                </View>
                            </View>
                        </View>
                        {renderDenominations(slipData)}

                        <View style={styles.amountWords}>
                            <Text style={styles.amountWordsText}>Amount in Words: {slipData.Amountinwords || '---'}</Text>
                        </View>

                        <Text style={styles.footerText}>{translate("key_thisisa_157")}</Text>

                    </View>
                </ViewShot>
            </ScrollView>
        </View>
    );
};

export default PrepaySlipSummary;
const styles = StyleSheet.create({
    main: {
        flex: 1
    },
    container: {
        backgroundColor: '#fff',
        paddingHorizontal: wScale(10),
        flex: 1,
        paddingBottom: hScale(20),
        marginTop: hScale(0),
        paddingTop: hScale(10),
    },


    topcontainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wScale(0),
        borderWidth: wScale(4),
        marginBottom: hScale(0),
        backgroundColor: '#271851',
        marginTop: hScale(8)
    },
    imgstyle: {
        width: wScale(75),
        height: wScale(75),
    },
     row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flex: 1,
  },
    column: {
        // No dimensions to scale
    },
    title: {
        fontSize: wScale(40),
        fontWeight: 'bold',
        color: '#fff',
        textTransform: 'uppercase',
        letterSpacing: wScale(8),
        // lineHeight: hScale(35)
    },
    title2: {
        fontSize: wScale(12),
        color: '#fff',
        marginTop: hScale(-6),
        paddingLeft: wScale(5)
    },
    companyISO: {
        color: '#ccc',
        fontSize: wScale(15),
        textAlign: 'center'
    },
    value: {
        color: '#191970',
        marginBottom: hScale(6),
        fontSize: hScale(14),
        fontWeight: 'bold',
    },
    time: {
        color: '#000',
        marginBottom: hScale(6),
        fontSize: hScale(11),
        fontWeight: 'bold',
    },
    label: {
        color: '#000',
        fontSize: hScale(12),
        fontWeight: 'bold',
        marginTop: hScale(5)
    },
    linkText: {
        fontSize: wScale(18),
        fontWeight: 'bold',
        color: '#191970',

    },
    rightColum: {
        alignItems: 'flex-end',
        flex: 1,
    },
    bold: {
        fontWeight: 'bold',
    },
    rceText: {
        color: '#fff',
        fontSize: wScale(13),
        marginBottom: hScale(4),
    },
    rceSection: {
        flexDirection: 'row',
        marginTop: hScale(8),
        padding: wScale(8),
        backgroundColor: '#000',
        alignItems: 'center',
    },
    avatar: {
        width: (80),
        height: wScale(90),
        marginRight: wScale(10),
    },
    amountWordsText: {
        fontSize: wScale(12),
        color: '#191970',
    },
    footerText: {
        fontSize: wScale(12),
        color: '#191970',
        textAlign: 'center',
        marginTop: hScale(9)
    },
    amountWords: {
        borderWidth: wScale(1),
        borderColor: '#000',
        padding: wScale(8),
        marginTop: hScale(10),
    },
    table: {
        marginTop: hScale(10),
        borderWidth: wScale(.5),
        borderColor: '#000',
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: wScale(.5),
        backgroundColor: '#ddd',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: wScale(.5),
    },
    tableCell: {
        flex: 1,
        borderRightWidth: wScale(.5),
        borderColor: '#000',
        textAlign: 'center',
        color: '#1c5ed3',
        fontSize: wScale(13),
        padding: hScale(2)
    },
    headerCell: {
        fontWeight: 'bold',
        fontSize: wScale(15),
    },
    col25: {
        flex: 1,
    },
    col50: {
        flex: 2,
    },
});


