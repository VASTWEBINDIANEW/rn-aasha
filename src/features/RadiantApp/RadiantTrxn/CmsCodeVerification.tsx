import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Switch,
    ScrollView,
    ToastAndroid,
    Clipboard,
    Keyboard,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import CmsImportantSvg from '../../drawer/svgimgcomponents/CmsImportantSvg';
import CheckBT from '../../../components/CheckBT';
import BorderLine from '../../../components/BorderLine';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import { ScratchCard } from 'rn-scratch-card'
import Bg from './Bg';
import DynamicButton from '../../drawer/button/DynamicButton';
import { useNavigation } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import ShowLoader from '../../../components/ShowLoder';

const CmsCodeVerification = ({ route }) => {
    const { item, item1 } = route.params;

    console.log(item, item1)





    const { colorConfig, rctype, rcPrePayAnomut } = useSelector((state: RootState,) => state.userInfo);
    const btnColor = `#edeff2`
    const [sms, setSms] = useState(true);
    const [whatsapp, setWhatsapp] = useState(false);
    const [email, setEmail] = useState(false);
    const [bluetooth, setBluetooth] = useState(false);
    const [scratchCode, setScratchCode] = useState('');
    const [customerCode, setCustomerCode] = useState('');
    const [iscode, setIsCode] = useState(false);
    const { post } = useAxiosHook();
    const [CodeId, setCodeId] = useState('')
    const navigation = useNavigation();
    const [scratched, setScratched] = useState(false);
    const [isload, setIsLoad] = useState(false)


    const copyto = () => {
        Clipboard.setString(scratchCode);
        ToastAndroid.show(`scratch Code Copied: ${scratchCode}`, ToastAndroid.SHORT);
    };

    const handleScratch = () => {
        setScratched(true);
    };

    const generateCode = async () => {

        setIsLoad(true)
        console.log(selectedModes)
        console.log({
            "clientmobile": item.Mobile,
            "clientemail": item.Email,
            "clientname": item.Name,
            "Shopid": item1.ShopId,
            "PointAddress": item1.PointName,
            "Sendvia": selectedModes

        })

        try {
            const url = `${APP_URLS.RadiantSendcode}`
            const res = await post({
                url, data: {
                    "clientmobile": item.Mobile,
                    "clientemail": item.Email,
                    "clientname": item.Name,
                    "Shopid": item1.ShopId,
                    "PointAddress": item1.PointName,
                    "Sendvia": selectedModes

                }

            });
            setScratchCode(res.Content.ADDINFO.scrachcode)
            setCodeId(res.Content.ADDINFO.idno)

            setIsLoad(false)

            console.log(res, '......................', res.Content.ADDINFO.scrachcode)
        } catch (error) {
            setIsLoad(false)

        }
        // const code = Math.floor(1000000 + Math.random() * 9000000).toString();
        // setScratchCode(code);
        setIsCode(true)
    };
    const [prevStates, setPrevStates] = useState({ sms: false, whatsapp: false, email: false });
    const toggleBluetooth = () => {
        if (!bluetooth) {
            setPrevStates({ sms, whatsapp, email });
            setSms(false);
            setWhatsapp(false);
            setEmail(false);
            setBluetooth(true);
        } else {
            setSms(prevStates.sms);
            setWhatsapp(prevStates.whatsapp);
            setEmail(prevStates.email);
            setBluetooth(false);
        }
    };



    const handleVerify = async (code) => {
        copyto(item);
        //  navigation.navigate('CmsCodeStatus', { CodeId, item1, Mobile: item.Mobile, item, scratchCode });

        console.warn(code)
        if (!code) {
            return ToastAndroid.show('Scratch Code is required', ToastAndroid.SHORT)
        }
        setIsLoad(true)
        const url = `${APP_URLS.RadiantSubmitCode}idno=${CodeId}&code=${code}`
        const res = await post({ url });

        console.log(url)
        console.log(res)
        if (res.Content.ADDINFO.status == 'Done') {
            navigation.navigate('CmsCodeStatus', { CodeId, item1, Mobile: item.Mobile, item, scratchCode, selectedModes });

            ToastAndroid.show('Scratch Code ' + res.Content.ADDINFO.status, ToastAndroid.SHORT);

        } else {
            ToastAndroid.show('Scratch Code ' + res.Content.ADDINFO.status, ToastAndroid.SHORT)

        }
        setIsLoad(false)

    }
    const getSelectedModes = ({ sms, whatsapp, email }) => {
        let selected = [];

        if (whatsapp) selected.push("Whatsapp");
        if (sms) selected.push("Sms");
        if (email) selected.push("Email");

        return selected.join(", ");
    };


    const selectedModes = getSelectedModes({ sms, whatsapp, email });

    

    return (
        <View style={styles.main}>
            <AppBarSecond title={'Scratch Code Verification'} />
            <ScrollView keyboardShouldPersistTaps={"handled"}
                style={{ flex: 1, }}>

                {isload && <ShowLoader />}
                <View style={[styles.container, { backgroundColor: `${colorConfig.secondaryColor}33` }]}>

                    <View style={[styles.card, { backgroundColor: `${colorConfig.secondaryColor}80` }]}>
                        <Text style={styles.label}>Customer Name</Text>
                        <Text style={[styles.value, { fontSize: wScale(20) }]}>{item1.CustName}</Text>

                        <Text style={styles.label}>Name / Address / Location</Text>
                        <Text style={styles.value}>{item1.PointName}</Text>
                        <View style={styles.rowContainer}>
                            <View >
                                <Text style={styles.label}>Point Code/Shop Id</Text>
                                <Text style={styles.value}>{item1.Client_code}</Text>
                            </View>

                            <View style={styles.column2}>

                                <Text style={styles.label}>Mobile Number</Text>
                                <Text style={styles.value}>{item.Mobile}</Text>
                            </View>
                        </View>


                        <View style={styles.rowContainer}>
                            <View style={styles.column}>
                                <Text style={styles.label}>Contact Person Name</Text>
                                <Text style={styles.value}>{item.Name}</Text>
                            </View>

                            <View style={styles.column2}>

                                <Text style={styles.label}>Email ID</Text>
                                <Text style={styles.value}>{item.Email}</Text>
                            </View>
                        </View>






                    </View>

                    <View style={styles.importantNote}>
                        <View style={{ marginLeft: wScale(-15) }}>
                            <CmsImportantSvg color={colorConfig.secondaryColor} size='120' />
                        </View>
                        <View style={{ flex: 1, }}>
                            <Text style={styles.importantTitle}>Very Important Note</Text>
                            <Text style={styles.importantText}>
                                Please note that before clicking on the button below (Yes Proceed) select the default or
                                link message way to customer as per your requirement. On proceeding you will get the
                                scratch code on the screen and on the link sent to the customer. Both the parties will
                                exchange the code and enter it in the place where it is to be entered.
                            </Text>
                        </View>
                    </View>
                </View>
                <View style={styles.container}>
                    {!iscode ? <View style={styles.btnCard}>
                        <Text style={styles.sectionTitle}>Action is <Text style={{ fontWeight: 'bold', color: colorConfig.secondaryColor }}>Required</Text> for successful pickup</Text>
                        <View style={styles.btnRow}>
                            <TouchableOpacity
                                style={[styles.switchRow,]}
                                onPress={() => {
                                    if (!bluetooth) setSms(!sms); // Only toggle if Bluetooth not active
                                }}
                            >
                                <Text style={styles.switchText}>TEXT SMS</Text>
                                {sms ? <CheckBT size={8} /> : <View style={styles.checkBtn} />}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.switchRow,]}
                                onPress={() => {
                                    if (!bluetooth) setWhatsapp(!whatsapp);
                                }}
                            >
                                <Text style={styles.switchText}>WhatsApp</Text>
                                {whatsapp ? <CheckBT size={8} /> : <View style={styles.checkBtn} />}
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.switchRow,]}
                                onPress={() => {
                                    if (!bluetooth) setEmail(!email);
                                }}
                            >
                                <Text style={styles.switchText}>E-mail ID</Text>
                                {email ? <CheckBT size={8} /> : <View style={styles.checkBtn} />}
                            </TouchableOpacity>


                        </View>



                        <Text style={styles.notTxt}>
                            <Text style={{ fontWeight: 'bold' }}>Note: </Text>Click on the slide button from left to right to generate the secret code. Both
                            parties will get a 7 digit code which needs to be shared with each other
                            and submitted.</Text>
                        <TouchableOpacity style={[styles.generateButton, { backgroundColor: colorConfig.secondaryColor, }]}
                            onPress={() => generateCode()}>
                            <Text style={[styles.buttonText, { color: '#fff' }]}>Generate Code</Text>
                        </TouchableOpacity>
                    </View> :
                        <>
                            <View style={[styles.successContainer, { backgroundColor: colorConfig.secondaryColor, }]}>
                                <Text style={styles.successText}>
                                    Congratulations, Secret code shared by your selected mode. If not received then
                                </Text>
                                <View style={styles.resendRow}>
                                    <Text style={styles.resendText}>
                                        click on "Resend Button"
                                    </Text>
                                    <TouchableOpacity style={styles.resendButton}
                                        onPress={() => {
                                            setIsCode(false);
                                            setScratchCode('');
                                            setCustomerCode('')
                                        }}
                                    >
                                        <Text style={styles.buttonText}>Resend Code</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={[styles.tableContainer, { borderColor: colorConfig.secondaryColor }]}>
                                <View style={styles.tableRow}>
                                    <View style={styles.tableCell}>
                                        <Text style={styles.tableLabel}>
                                            Your scratch code is below, scratch
                                            first and share with customer points</Text>
                                    </View>
                                    <BorderLine height={'100%'} width={.5} />

                                    <View style={styles.tableCell}>
                                        <Text style={[styles.tableLabel, { textAlign: 'right' }]}>Ask the Customer Contact Person for a 6 character sketch code and enter it here</Text>
                                    </View>
                                </View>


                                <BorderLine height={.5} />
                                <View style={styles.tableRow}>


                                    <View style={styles.tableCell}>
                                        <View style={[styles.codeInput, {
                                            borderStyle: 'dotted',
                                            borderColor: colorConfig.secondaryColor,
                                            padding: 0,
                                            // flexDirection: 'row',
                                            // alignItems:'center',
                                        }]}>

                                            <Bg titlecode={scratchCode}>
                                                <View>
                                                    <ScratchCard
                                                        source={require('../../../../assets/images/Scartch.jpg')}
                                                        brushWidth={5}
                                                        style={styles.scratchCard}
                                                        onScratch={handleScratch}

                                                    />
                                                </View>
                                            </Bg>

                                            {scratched ? <TouchableOpacity onPress={copyto} style={styles.copyButton}>
                                                <MaterialIcons name="content-copy" size={wScale(30)}
                                                    color={colorConfig.secondaryColor} />

                                            </TouchableOpacity> : null}
                                        </View>


                                    </View>
                                    <View style={styles.tableCell}>
                                        <TextInput
                                            style={[styles.codeInput,
                                            {
                                                borderColor: colorConfig.secondaryColor,
                                                fontSize: customerCode ? wScale(20) : (12),
                                                color: colorConfig.secondaryColor,
                                            }
                                            ]}


                                            value={customerCode}
                                            onChangeText={(text) => {
                                                setCustomerCode(text);
                                                if (text.length === 6) {
                                                    Keyboard.dismiss(); // Close the keyboard when length is 5
                                                }
                                            }} placeholder="Enter customer code"
                                            placeholderTextColor={'#000'}
                                            keyboardType='numeric'

                                        />
                                    </View>
                                </View>
                            </View>
                            <DynamicButton title={'Submit'} onPress={() => {
                                handleVerify(customerCode);
                            }} styleoveride={undefined} />
                        </>}
                </View>
            </ScrollView >
        </View >
    );
};

export default CmsCodeVerification;

const styles = StyleSheet.create({
    main: {
        flex: 1,
    },
    container: {
        paddingHorizontal: wScale(10),
    },
    header: {
        fontSize: wScale(22),
        textAlign: 'center',
        marginBottom: hScale(20),
        color: '#4B00E0',
        fontWeight: 'bold',
    },
    card: {
        paddingHorizontal: wScale(10),
        borderRadius: wScale(10),
        marginBottom: hScale(10),
        paddingVertical: hScale(5),
        marginTop: hScale(15),
    },
    btnRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    btnCard: {
        elevation: 4,
        backgroundColor: '#fff',
        paddingVertical: hScale(10),
        paddingHorizontal: wScale(10),
        borderRadius: wScale(10),
        marginVertical: hScale(10),
    },
    label: {
        marginTop: hScale(5),
        color: '#333',
        fontSize: wScale(12)
    },
    value: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: wScale(14)
    },
    importantNote: {
        borderColor: '#ff0000',
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        marginBottom: hScale(10),
        flexDirection: 'row',
        alignItems: 'center',
    },
    importantTitle: {
        fontSize: wScale(24),
        fontWeight: 'bold',
        color: '#000',
        marginBottom: hScale(5),
        textAlign: 'center',
        textDecorationLine: 'underline',
    },
    importantText: {
        fontSize: wScale(11),
        color: '#333',
        textAlign: 'justify',
    },
    sectionTitle: {
        fontSize: wScale(16),
        marginBottom: hScale(5),
        color: '#000',
    },
    notTxt: {
        fontSize: wScale(10),
        color: '#000',
        textAlign: 'justify',
    },
    checkText: {
        fontSize: wScale(12),
        color: '#000',
    },
    switchRow: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-around',
        marginBottom: hScale(10),
        alignItems: 'center',

        width: wScale(95), // 
        paddingHorizontal: wScale(3),
        height: hScale(27),
        borderRadius: wScale(100),
        borderWidth: .3
    },
    generateButton: {
        backgroundColor: '#8e44ad',
        padding: hScale(12),
        borderRadius: wScale(8),
        alignItems: 'center',
        marginVertical: hScale(5),
        marginTop: hScale(10)
    },
    resendButton: {
        backgroundColor: '#fff',
        paddingHorizontal: wScale(20),
        borderRadius: wScale(80),
        alignItems: 'center',
        marginBottom: hScale(10),
        paddingVertical: hScale(5),
        marginTop: hScale(5),
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: wScale(14),
    },
    switchText: {
        color: '#000',
        fontSize: wScale(12),
    },
    infoText: {
        textAlign: 'center',
        color: '#555',
        marginTop: hScale(10),
        fontSize: wScale(12),
    },
    successText: {
        fontSize: wScale(10),
        marginTop: hScale(0),
        color: '#fff',
        textAlign:'left',
    },
    codeInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',

    },
    checkBtn: {
        borderWidth: wScale(1),
        borderColor: '#000',
        borderRadius: wScale(20),
        height: wScale(18),
        width: wScale(18),
        alignItems: 'center',
        justifyContent: 'center',
    },
    tableContainer: {
        borderWidth: .5,
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: hScale(15)
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableCell: {
        flex: 1,
        padding: 5,
        justifyContent: 'center',

    },
    tableLabel: {
        fontSize: wScale(10),
        color: '#333',

    },
    codeInput: {
        borderWidth: .5,
        borderRadius: 6,
        padding: 8,
        fontSize: wScale(20),
        fontWeight: 'bold',
        letterSpacing: 10,
        color: 'green',
        zIndex: -199,
        height: hScale(50),

    },
    tableDivider: {
        height: 1,
        backgroundColor: '#ccc',
    },


    successContainer: {
        borderRadius: 50,
        paddingHorizontal: wScale(20),
        paddingTop: hScale(4),
        marginTop: hScale(10),
        marginBottom: hScale(10),
        flexWrap:'nowrap'

    },

    resendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flex:1
    },
    resendText: {
        fontSize: wScale(20),
        color: '#fff',
        fontWeight: 'bold',
        marginTop: hScale(-8),
        flex:1
    },
    rowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    column: {
        flex: 1,
    },
    column2: {
        flex: 1,
        alignItems: 'flex-end'
    },
    scratchCard: {
        width: '100%',
        height: hScale(50),
        zIndex: 1120,
        borderRadius: 6,

    },

    scratchContainer: {
        position: 'relative',

        justifyContent: 'center',
    },
    hiddenContent: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    secretText: { fontSize: 40, fontWeight: 'bold', color: 'black' },
    copyButton: {
        position: 'absolute',
        right: wScale(0),
        alignItems: 'center',
        height: '100%',
        flexDirection: 'row',
        zIndex: 0,
        paddingLeft: wScale(10),
    },

});
