import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ToastAndroid, AsyncStorage } from 'react-native';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { useNavigation } from '@react-navigation/native';
import CmsStatusSvg from '../../drawer/svgimgcomponents/CmsStatusSvg';
import CmsRefreshSvg from '../../drawer/svgimgcomponents/CmsRefreshSvg';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';

export default function CmsCodeStatus({ route }) {
    // console.warn(route.params.item1);
    const { CodeId, item1, item, Mobile, scratchCode,selectedModes } = route.params;
    const navigation = useNavigation();
    const { post } = useAxiosHook();
    const [loading, setLoading] = useState(false); // Place this in your component
    const { colorConfig, } = useSelector((state: RootState) => state.userInfo);
console.log(item1, item,)
    const handleVerify2 = async () => {
        try {
            setLoading(true);

            const url = `${APP_URLS.RadiantSubmitStaus}${CodeId}`;
            const res = await post({ url });

            console.log('##12222222222212***#333Verification Response:', res);
            console.warn('###333Verification Response:', res);
            if (
                res?.Content?.ADDINFO?.RCEConfirmation &&
                res?.Content?.ADDINFO?.ShopConfirmation
            ) {
                const { RCEConfirmation, ShopConfirmation } = res.Content.ADDINFO;

                if (RCEConfirmation === 'Approved' && ShopConfirmation === 'Approved') {
                    ToastAndroid.show('Verification Approved ✅', ToastAndroid.SHORT);
                              await AsyncStorage.setItem('pickup_status', 'unverified');

                    navigation.navigate('PicUpScreen', { item: item1, item2: item, CodeId: res?.Content?.ADDINFO?.slipcode, Mobile,selectedModes });
                } else {
                    let pendingFields = [];
                    if (RCEConfirmation !== 'Approved') pendingFields.push('RCE');
                    if (ShopConfirmation !== 'Approved') pendingFields.push('Shop');

                    ToastAndroid.show(
                        `Pending: ${pendingFields.join(', ')}`,
                        ToastAndroid.SHORT
                    );
                }
            } else {
                ToastAndroid.show('Unexpected response format!', ToastAndroid.SHORT);
            }
        } catch (error) {
            console.error('Verification Error:', error);
            ToastAndroid.show('Network error. Please try again.', ToastAndroid.SHORT);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        handleVerify2()
    }, [])
    return (
        <View style={styles.main}>
            <AppBarSecond title={'Customer Code Status'} />
            <ScrollView >
                <View style={styles.container}>

                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <CmsStatusSvg />
                    </View>
                    <Text style={{ color: colorConfig.secondaryColor, paddingVertical: 5, fontWeight: 'bold', fontSize: wScale(18), top: hScale(-20) }}>Customer Scratch Code - {scratchCode}</Text>

                    {/* Message */}
                    <Text style={styles.message}>
                        <Text style={{ fontWeight: 'bold' }}>Sorry</Text> for the inconvenience, but the verification of the scratch code from the customer point has not been completed yet. For security reasons, we cannot allow you to proceed until the verification of the scratch code is complete. Please inform the customer point so that the verification can be completed as soon as possible.
                    </Text>

                    {/* Status Box */}
                    <View style={styles.statusBox}>
                        <View>
                            <Text style={styles.statusTitle}>Customer Point Verification</Text>
                            <Text style={styles.statusPending}>S t i l l   P e n d i n g</Text>
                        </View>


                        <TouchableOpacity onPress={() => {
                            handleVerify2()
                        }}>
                            <CmsRefreshSvg />


                        </TouchableOpacity>

                    </View>

                    {/* Refresh Note */}


                    <View style={{ flexDirection: 'row' }}>
                        <Text style={styles.refreshText}>Please click on the</Text>

                        <TouchableOpacity onPress={ ()=> handleVerify2()}>
                            <View style={styles.refreshButtonText}>
                                <Text style={{
                                    fontWeight: 'bold',
                                    marginTop: hScale(1.2),
                                    fontSize: wScale(12),
                                    color: '#333',
                                    justifyContent: 'center'
                                }}> Refresh Button </Text>
                            </View>
                        </TouchableOpacity>

                        <Text style={styles.refreshText}>to check the latest status. </Text>


                    </View>


                    <Text style={styles.refreshText}>
                        {/* <Text style={styles.refreshButtonText}> </Text> */}
                        to check the latest status. We will proceed once the customer verification is approved.
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    main: {
        flex: 1
    },
    container: {
        flexGrow: 1,
        backgroundColor: '#f2f2f2',
        padding: 20,
        alignItems: 'center',
    },
    header: {
        width: '100%',
        backgroundColor: '#c91ba8',
        padding: 15,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    headerText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    iconContainer: {
        backgroundColor: '#f2b9e3',
        borderRadius: 100,
        padding: 25,
        marginBottom: 20,
    },
    icon: {
        width: 60,
        height: 60,
    },
    message: {
        fontSize: 14,
        color: '#333',
        marginBottom: 20,
        textAlign: 'justify',
    },
    statusBox: {
        flexDirection: 'row',
        backgroundColor: '#b049c3',
        paddingHorizontal: 15,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
        paddingVertical: hScale(5)
    },
    statusTitle: {
        color: '#fff',
        fontSize: 12,
    },
    statusPending: {
        color: '#fff',
        fontSize: 22,
        fontWeight: 'bold',
        marginTop: 5,
    },
    refreshIcon: {
        width: 40,
        height: 40,
        marginLeft: 10,
    },
    refreshText: {
        fontSize: 13,
        color: '#333',
        textAlign: 'justify',
    },
    refreshButtonText: {
        borderRadius: wScale(5),
        backgroundColor: '#ffea00',
        // backgroundColor: 'red',
        paddingVertical: 0,
        overflow: 'hidden',
    },
});
