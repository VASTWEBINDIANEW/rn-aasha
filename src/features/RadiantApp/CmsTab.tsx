import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState } from '../../reduxUtils/store';
import { hScale, SCREEN_WIDTH, wScale } from '../../utils/styles/dimensions';
import { colors } from '../../utils/styles/theme';
import NextErrowSvg2 from '../drawer/svgimgcomponents/NextErrowSvg2';
import RadintDepositSvg from '../drawer/svgimgcomponents/RadintDepositSvg';
import RadintChequeSvg from '../drawer/svgimgcomponents/RadintChequeSvg';
import RadintDeliverySvg from '../drawer/svgimgcomponents/RadintDeliverySvg';
import RadintPickupSvg from '../drawer/svgimgcomponents/RadintPickupSvg';
import CmsOnlineSvg from '../drawer/svgimgcomponents/CmsOnlineSvg';
import CmsLedgerSvg from '../drawer/svgimgcomponents/CmsLedgerSvg';
import BankWalletUnloadSvg from '../drawer/svgimgcomponents/BankWalletUnloadSvg';
import DistributorWalletSvg from '../drawer/svgimgcomponents/DistributorWalletSvg';
import WalletSvg from '../drawer/svgimgcomponents/Walletsvg';
import MainWalletSvg from '../drawer/svgimgcomponents/MainWalletSvg';
import { color } from '@rneui/base';
import CmsCompanySvg from '../drawer/svgimgcomponents/CmsCompanySvg';
import CmsSlipDownload from '../drawer/svgimgcomponents/CmsSlipDownloadSvg';
import PvcCheckPickupstatusModel from '../../components/PvcCheckPickupstatusModel';
import useAxiosHook from '../../utils/network/AxiosClient';
import { APP_URLS } from '../../utils/network/urls';
import CmsNewPinSvg from '../drawer/svgimgcomponents/CmsNewPinSvg';
import PickupCalendarSvg from '../drawer/svgimgcomponents/PickupCalendarSvg';
import PayoutInfoSvg from '../drawer/svgimgcomponents/PayoutInfoSvg';
import CmsReferredPointsSvg from '../drawer/svgimgcomponents/CmsReferredPointsSvg';
import CashDepositReportSvg from '../drawer/svgimgcomponents/CashDepositReportSvg';
import { TextStyle } from 'react-native';
import { Color } from 'react-native-alert-notification/lib/typescript/service';
import { translate } from '../../utils/languageUtils/I18n';
import AddSvg from '../drawer/svgimgcomponents/AddSvg';


const CmsTab = () => {
    const { colorConfig, rctype } = useSelector((state: RootState) => state.userInfo);
    const { post } = useAxiosHook();


    const [showModal, setshowModal] = useState(false);
    const [pvcStatus, setPvcStatus] = useState('O')
    const tabColor = `${colorConfig.secondaryColor}33`;
    const tabColor2 = `${colorConfig.secondaryColor}1A`;
    const svgColor = colorConfig.secondaryColor;


    type TransactionItem = {
        id: string;
        title: string;
        description: string;
        nav: string;
        img: React.ReactNode;
    };


    const TransactionTab = ({
        data,
        onPress,
        backgroundColor,
        borderColor,
        colorsss
    }: {
        data: TransactionItem[];
        onPress: (item: TransactionItem) => void;
        backgroundColor: string;
        borderColor: string;
        colorsss: string;
    }) => (
        <FlatList
            data={data}
            contentContainerStyle={styles.container}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={[styles.card, { borderColor }]}
                    activeOpacity={0.7}
                    onPress={() => onPress(item)}
                >
                    <View style={[styles.svgimg, { backgroundColor }]}>
                        {item.img}
                    </View>
                    <View style={[styles.inveiw,]}>
                        <Text style={styles.cardText}>{translate(item.title)}</Text>
                        <Text style={styles.description}>{translate(item.description)}</Text>
                    </View>
                    <NextErrowSvg2 color="#000" />
                </TouchableOpacity>
            )}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
        />
    );

    const transactions1: TransactionItem[] = [
        {
            id: '1',
            title: 'Add New Pickup Request',
            description:
                'Enter the pickup time, online slip or physical slip number and full details of the currency picked up from the customer point, also the count of all types of notes should match the total amount exactly.',
            nav: 'CashPickup',
            img: <RadintPickupSvg color={svgColor} />,
        },
        ...(rctype === 'PrePay'
            ?
            [
                {
                    id: '2',
                    title: 'RCE Cash Pickup Report',
                    description:
                        'Money is picked up by RCE from the customer point or dropped off by the customer and through whatever medium the money is given to the company, the complete credit debit report will be in this ledger.',

                    nav: 'RadiantPrepayReport',
                    img: <CmsLedgerSvg color={svgColor} />,
                }]
            : []
        ),
        ...(rctype === 'PostPay'
            ?
            [{
                id: '3',
                title: 'RCE Cash Pickup Report',
                description:
                    'This report will give complete details of payment collection done by the RC from the customer location, whether the RCE has made the payment through digital slip or through physical slip.',
                nav: 'CashPicUpReport',
                img: <RadintDepositSvg color={svgColor} />,
            }]
            : []),
        {
            id: '4',
            title: 'RCE Cash Pickup calendar   ',
            description:
                'The pickup calendar shows your activity every day. Your salary is calculated based on the number of working days. Your attendance and zero collection reports are also displayed.',
            nav: 'PickupSalaryCalendar',
            img: <PickupCalendarSvg color={svgColor} />,
        },
        {
            id: '5',
            title: 'RCE Payout Information',
            description:
                'Payout and payout structure (Calculation Method) are available. Payout amount is determined based on the number of working days, leave taken, penalties, cash deposit charges and travel allowance.',
            nav: 'CrePayout',
            img: <PayoutInfoSvg color={svgColor} />,
        },

        ...(rctype === 'PostPay'
            ?
            [{

                id: '6',
                title: 'Pickup & Deposit Ledger',
                description:
                    'Money is picked up by RCE from the customer point or dropped off by the customer and through whatever medium the money is given to the company, the complete credit debit report will be in this ledger.',

                nav: 'RadiantLedger',
                img: <CmsLedgerSvg color={svgColor} />,
            }]
            : []),


    ];

    const transactions2: TransactionItem[] = [
        ...(rctype === 'PostPay'
            ?
            [{
                id: '1',
                title: "Pay picked & Due's Amount",
                description:
                    'Through this function, you will see a list of all payments to be transferred to the company, as per the uploaded pickup slip. All these payments can be made separately or together.',
                nav: 'InprocessReportCms',
                img: <RadintDeliverySvg color={svgColor} />,
            },


            ...(rctype === 'PostPay' ? [{
                id: '2',
                title: 'Cash & Online Deposit Report',
                description: 'In this report, the money deposited by RCE in the bank cash counter, the money deposited in the Cash Deposit Machine (CDM) and the money transferred by any other online mode can be seen in this report.',
                nav: 'CashDepositReport',
                img: <CmsOnlineSvg color={svgColor} />,
            },] : []),

            {
                id: '3',
                title: 'Transfer Report by Wallet',
                description: 'The report of all the payments deposited through Main Wallet and POS Wallet is available here. Also, the report of live payments made through QR code, Intent UPI mode is also available here.',
                nav: 'WalletTransferReport',
                img: <MainWalletSvg color={svgColor} />,
            },
            ]
            : []),
             {
            id: '4',
            title: "Add Customer",
            description:
                'Onboard a new partner as a Retail Cash Executive (RCE). Verify their GST number, complete KYC with Aadhaar and PAN, add business and outlet details, and submit their bank account information — all in one guided flow',

            nav: 'PartnerStep',
            img: <AddSvg color={svgColor} />,
        },

        {
            id: '4',
            title: "Set Additional Pin Code",
            description:
                'Your own Pin Code as per your documents is given above.If you can work in other Pin Code areas also, please add up to 4 Pin Codes by clicking on "ADD New ',

            nav: 'CmsNewPin',
            img: <CmsNewPinSvg color={svgColor} />,
        },

        {
            id: '5',
            title: "My Referred Customer Points",
            description:
                'You can contact other customer points in your area and offer them your services. Fill out the customer point details form. The company will verify them and onboard them for you.',

            nav: 'ReferredCusPoints',
            img: <CmsReferredPointsSvg color={svgColor} />,
        },


    ];

    const transactions3: TransactionItem[] = [
        {
            id: '1',
            title: "Manual Add Money Report",
            description:
                'Add funds to your CMS wallet manually through NEFT, RTGS, IMPS transfer, Cash deposit at CDMA machines, Cash deposits at branches, and by manually generating purchase order request.',

            nav: 'NewCashDepositReport',
            img: <CashDepositReportSvg color={svgColor} />,
        },
        {
            id: '2',
            title: 'Cash Deposit A/C List',
            description:
                'Through this function we are sharing with you the list of Radiant Cash Management Services Limited bank accounts and QR Codes in which you can Deposit Cash, Online Transfer and QR Code Scan.',

            nav: 'CmsACList',
            img: <RadintChequeSvg color={svgColor} />,
        },

        {
            id: '3',
            title: 'Deposit Slip for CMS',
            description:
                'Some banks require a separate deposit slip to deposit money. All the slips required for these banks can be downloaded from here and you can use them by taking a print out (Print Slip)of them.',

            nav: 'CashDepositReport',
            img: <CmsSlipDownload color={svgColor} />,
        },

        {
            id: '4',
            title: "Company Doc's for Deposit",
            description:
                'To deposit cash in banks, some important documents of the company may be required, such as PAN Card, which is required in most banks. Some banks may also ask for additional documents, download documents from here.',

            nav: 'CmsACList',
            img: <CmsCompanySvg color={svgColor} />,
        },

    ];




    const navigation = useNavigation<any>();

    const handleTransactionPress = (item: TransactionItem) => {

        if (item.nav === 'CashPickup1') {
            PvcRadiantStatus(item.nav)
        } else {
            navigation.navigate(item.nav);

        }

    };

    const renderScene = SceneMap({
        cashPickup: () => (
            <TransactionTab
                data={transactions1}
                onPress={handleTransactionPress}
                backgroundColor={tabColor2}
                borderColor={tabColor}
            />
        ),
        cashDeposit: () => (
            <TransactionTab
                data={transactions2}
                onPress={handleTransactionPress}
                backgroundColor={tabColor2}
                borderColor={tabColor}
            />
        ),
        other: () => (
            <TransactionTab
                data={transactions3}
                onPress={handleTransactionPress}
                backgroundColor={tabColor2}
                borderColor={tabColor}
            />
        ),
    });

    const [index, setIndex] = useState(0);

    const [routes] = useState([
        { key: 'cashPickup', title: rctype === 'PrePay' ? 'Pickup & Payout' : 'Cash Pickup' },
        { key: 'cashDeposit', title: rctype === 'PrePay' ? '+New business' : 'Cash Deposit' },
        { key: 'other', title: rctype === 'PrePay' ? "Other's Info" : "Other's" },
    ]);


    const PvcRadiantStatus = async (nav) => {
        try {
            const res = await post({ url: APP_URLS.PvcRadiantStatus });
            console.log(res);

            if (res?.Content?.ADDINFO) {
                if (res.Content.ADDINFO.Status == 'N') {
                    navigation.navigate(nav);
                    return;
                }
                setPvcStatus(res.Content.ADDINFO.Status);

            }
        } catch (error) {
            console.error("Error fetching PVC Radiant Status:", error);
        }
    };
    return (

        <View style={{ flex: 1 }}>

            <PvcCheckPickupstatusModel
                visible={showModal}

                title={pvcStatus == 'O' ? 'Continue to PickUp' : 'Go Back'}
                onClose={() => {
                    setshowModal(false)


                }} onSave={() => {

                    if (pvcStatus == 'O') {
                        navigation.navigate('CashPickup');

                    } else {
                        navigation.navigate('Dashboard');

                    }

                }}
            />
            {/* <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: SCREEN_WIDTH }}
                renderTabBar={(props) => (
                    <TabBar
                        {...props}
                        indicatorStyle={{ backgroundColor: colorConfig.primaryColor  }}
                        style={{
                            // backgroundColor: tabColor,
                            elevation: 0,
                            width: '100%',
                            
                        }}
                        // labelStyle={styles.labelStyle}
                        
                    />
                    
                )}
            />
             */}
             
        
<TabView
  navigationState={{ index, routes }}
  renderScene={renderScene}
  onIndexChange={setIndex}
  initialLayout={{ width: SCREEN_WIDTH }}
  renderTabBar={(tabBarProps) => ( 
    <TabBar
      {...tabBarProps} 
      indicatorStyle={{ backgroundColor: colorConfig.primaryColor }}
      style={{
        backgroundColor: tabColor,
        elevation: 0,
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
      }}
      activeColor={colorConfig.primaryColor}
      inactiveColor={'black'}
      
      pressColor={'transparent'} 
    />
  )}
/>

        </View>

    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: wScale(8),
        paddingVertical: hScale(10),
    },
    card: {
        backgroundColor: '#fff',
        paddingVertical: hScale(10),
        paddingHorizontal: wScale(10),
        marginBottom: hScale(12),
        shadowColor: '#000',
        flexDirection: 'row',
        borderRadius: 5,
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 2,
        borderColor: colors.black_primary_blur,
        borderWidth: hScale(0.5),
    },
    svgimg: {
        borderRadius: 10,
        paddingHorizontal: wScale(10),
        paddingVertical: hScale(5),
    },
    cardText: {
        color: '#000',
        fontSize: wScale(16),
        fontWeight: 'bold',
        width: '120%',
        textTransform:'capitalize',
    },
    inveiw: {
        flex: 1,
        paddingHorizontal: wScale(10),
        flexWrap: 'nowrap'
    },
    description: {
        color: '#000',
        fontSize: wScale(11),
        textAlign: 'justify',
        marginTop: hScale(3),
    },
    labelStyle: {
        color: '#000',
        fontSize: wScale(14),
        fontWeight: '500',
        width: '100%',

    },
});

export default CmsTab;

