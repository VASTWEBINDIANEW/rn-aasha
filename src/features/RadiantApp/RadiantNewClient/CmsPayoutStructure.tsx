import { translate } from "../../../utils/languageUtils/I18n";
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ImageBackground, Linking } from 'react-native';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import BorderLine from '../../../components/BorderLine';
import ShowLoader from '../../../components/ShowLoder';
import BackSvg from '../../drawer/svgimgcomponents/BackSvg';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import AnimatedBorderedContainer from '../../../components/AnimatedBorderView';
import OrbitContainer from '../../../components/AnimatedBorderView';
import AnimatedBorderView from '../../../components/AnimatedBorderView';
import PulseBorder from '../../../components/AnimatedBorderView';
import GradientBorder from '../../../components/AnimatedBorderView';
import NoDatafound from '../../drawer/svgimgcomponents/Nodatafound';
import DynamicButton from '../../drawer/button/DynamicButton';

const Table = ({ title, data, showNote }) => {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);

    if (!data || data.length === 0) return null;

    return (
        <View style={styles.tableContainer}>
            <Text style={[styles.tableTitle, { backgroundColor: `${colorConfig.secondaryColor}80` }]}>
                {title}
            </Text>

            {showNote && (
                <>

                    <Text style={styles.notText}>{translate("key_thisappli_170")}</Text>
                    <BorderLine height={.5} />

                </>
            )}

            {data.map((item, index) => (
                <>
                    <View key={index} style={[
                        styles.tableRow,
                        { backgroundColor: index % 2 === 0 ? '#f9f9f9' : '#fff' }
                    ]}>
                        <Text style={[styles.cell, { flex: 2 }]}>{item.Particular}
                            {item.Particular === '26 JAN, 15 AUG, 2 OCT, Diwali, Holi' && <Text style={styles.liveText}> Leave
                            </Text>}

                            {(item.Particular === 'All Days Working' ||
                                item.Particular === 'Banking Days Working' ||
                                item.Particular === 'Holiday/Weekend Work') && (
                                    <Text style={styles.liveText}>{translate("Emergency_Leave")}</Text>)}
                            {item.Particular === 'Every Extra Leave / Miss Pickup' &&
                                <Text style={styles.liveText}>{translate("Penalty")}</Text>}

                        </Text>
                        <BorderLine height={'100%'} width={.5} />

                        <Text style={[styles.cell, { flex: 1 }]}>
                            {item.Prepay}{' '}
                            {(item.Particular === 'Day Collection & By Wallet' ||
                                item.Particular === 'Evening Collection & By Wallet' ||
                                item.Particular === 'Vaulting & By Wallet') && (
                                    <Text style={styles.liveText}>
                                       { translate('Per Thousand')}
                                    </Text>
                                )}

                        </Text>
                        <BorderLine height={'100%'} width={.5} />

                        <Text style={[styles.cell, { flex: 1 }]}>
                            {item.CashDeposit}{' '}
                            {(item.Particular === 'Day Collection & Cash deposit' ||
                                item.Particular === 'Evening Collection & Cash deposit' ||
                                item.Particular === 'Vaulting & Cash deposit') && (
                                    <Text style={styles.liveText}>
                                        {translate('Per Thousand')}
                                    </Text>
                                )}
                        </Text>

                    </View>
                    <BorderLine height={.5} />
                </>

            ))}
        </View>

    );
};

const CmsPayoutStructure = () => {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);

    const [addInfo, setAddInfo] = useState(null);
    const { post } = useAxiosHook();
    const navigation = useNavigation<any>();

    const fetchData = async () => {
        try {
            const url = APP_URLS.RCEPayoutStructure;
            console.log('Fetching data from URL:', url);

            const response = await post({ url });
            console.log('Full Response:', response);

            if (response?.Content?.ADDINFO) {
                setAddInfo(response.Content.ADDINFO);
            } else {
                console.log('No data found');
            }

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    const handleWebsiteLink = () => {

        Linking.openURL('https://www.radiantcashservices.com/');
    };


    const handleGoBack = () => {
        navigation.goBack()
    };
    useEffect(() => {
        fetchData();
    }, []);




    return (
        <View style={{ flex: 1, marginBottom: hScale(10) }}>
           
            <ScrollView style={styles.container}>

                {!addInfo ?
                    < NoDatafound />
                    :
                    <View >
                        <View style={[styles.tableHeader, { backgroundColor: colorConfig.secondaryColor }]}>
                            <Text style={[styles.cell, styles.cell2, { flex: 2 }]}>{translate("Particular")}</Text>
                            <BorderLine height={'100%'} width={.5} style={{backgroundColor:'#fff'}}/>
                            <Text style={[styles.cell, styles.cell2]}>{translate("Wallet_Mode")}</Text>
                            <BorderLine height={'100%'} width={.5} style={{backgroundColor:'#fff'}}/>

                            <Text style={[styles.cell, styles.cell2]}>{translate("Deposit_Mode")}</Text>
                        </View>
                        <Table title="Granted RCE Minimum Fixed Payout" data={addInfo.MinimumPayout} />

                        <Table title="RCE Commission Base Maximum Payout" data={addInfo.CollectionCharges} showNote={true} />
                        {/* <Table title="Bank Charges" data={addInfo.BankCharges} /> */}
                        <Table title="Leave and Penalty Provisions" data={addInfo.LeaveAndPenaltyRules} />
                        <Table title="Verification Fees" data={addInfo.verificationFees} />
                    </View>
                }

             

            </ScrollView>
        </View>

    );
};

export default CmsPayoutStructure;


const styles = StyleSheet.create({
    container: {
        paddingHorizontal: wScale(0),
        flex: 1
    },
    tableContainer: {
        overflow: 'hidden',
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#5e5f61',
        paddingHorizontal: 0,
    },
    tableRow: {
        flexDirection: 'row',
        paddingHorizontal: 0,

    },
    cell: {
        fontSize: wScale(12),
        paddingVertical: hScale(6),
        paddingHorizontal: wScale(6),
        textAlign: 'left',
        color: '#000'
    },

    tableTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        backgroundColor: '#eee',
        paddingHorizontal: 10,
        color: '#fff',
        textAlign: 'center',
        paddingVertical: hScale(5)
    },

    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    liveText:
        { color: 'red', fontSize: wScale(10) },
    cell2: { flex: 1, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
    title: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: wScale(25),
        textAlign: 'center',
        paddingTop: hScale(1)
    },
    bgImage: { height: 70,
         width: `100%`, marginBottom: hScale(10) },
    notText: { fontSize: wScale(12), color: 'red', textAlign: 'justify', },
    linksContainer: {
        marginTop: hScale(5),
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: hScale(20)
    },
    goBackText: {
        color: 'blue',
        fontSize: wScale(16),
    },
    websiteLinkText: {
        color: 'blue',
        fontSize: wScale(16),
        textDecorationLine: 'underline',
    },
});


