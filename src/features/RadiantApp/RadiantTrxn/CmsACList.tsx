import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    ToastAndroid,
    TouchableOpacity,
    Linking,
    Clipboard,
    Image,
    ScrollView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { hScale, SCREEN_WIDTH, wScale } from '../../../utils/styles/dimensions';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { SvgUri } from 'react-native-svg';
import ShowLoader from '../../../components/ShowLoder';
import NoDatafound from '../../drawer/svgimgcomponents/Nodatafound';
import TabBar from '../../Recharge/TabView/TabBarView';
import ViewShot, { captureRef } from 'react-native-view-shot';
import Share from "react-native-share";
import LottieView from 'lottie-react-native';

const CmsACList = () => {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);
    const [bankData, setBankData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { post } = useAxiosHook();
    const [visible, setVisible] = useState(true)


    const formatAccountInfo = (item) => (
        `Radiant Bank Details:\n\nA/C Name: Radiant Cash Management Services Ltd\nA/C Number: ${item.AccountNumber}\nBank Name: ${item.BankName}\nIFSC: ${item.IfscCode}\nBranch: ${item.BranchName}`
    );

    const copyto = (item) => {
        const message = formatAccountInfo(item);
        Clipboard.setString(message);
        ToastAndroid.show('Bank Details Copied', ToastAndroid.SHORT);
    };
    const copyto2 = (item) => {
        const message = (item.vpaid);
        Clipboard.setString(message);
        ToastAndroid.show('VPA ID Copied', ToastAndroid.SHORT);
    };

    const shareToWhatsApp = (item) => {
        const message = formatAccountInfo(item);
        const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
        Linking.canOpenURL(url)
            .then((supported) => {
                if (supported) Linking.openURL(url);
                else ToastAndroid.show('WhatsApp is not installed', ToastAndroid.SHORT);
            })
            .catch((err) => console.error('An error occurred', err));
    };
    const capRef = useRef();

    const onShare = useCallback(async () => {

        try {
            const uri = await captureRef(capRef, {
                format: "jpg",
                quality: 0.7,
            });
            await Share.open({
                message: `Hi, I am sharing the transaction details using ${APP_URLS.AppName} App.`,
                url: uri,
            });
        } catch (e) {
            ToastAndroid.show("Transaction details not shared", ToastAndroid.SHORT);
        }
    }, []);



    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await post({ url: `${APP_URLS.RadiantBankAccount}` });
                const parsedData = JSON.parse(response.data);
                setBankData(parsedData?.Content || []);
                console.log(response.data);
                
            } catch (error) {
                console.error('API error', error);
                ToastAndroid.show('Failed to load bank accounts', ToastAndroid.SHORT);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    const renderField = (label: string, value: string, item?: any) => (
        <View style={styles.rowBox}>
            <Text style={styles.rowLabel}>{label}:</Text>
            <Text style={[styles.rowValue, { fontWeight: item?.AccountNumber && item?.vpaid && 'bold', }]}>{value}</Text>
        </View>
    );


    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={[{ backgroundColor: `${colorConfig.secondaryColor}1A` }]}>
                <View style={[styles.logoview, { backgroundColor: `${colorConfig.secondaryColor}33` }]}>
                    <View style={{ width: wScale(115), aspectRatio: 115 / 46, backgroundColor: 'rgba(255,255,255,0.5)', }}>
                        <SvgUri width={'100%'} height={'100%'} uri={item.logoimg}
                            preserveAspectRatio=""
                        />

                    </View>
                    <TouchableOpacity style={styles.shareview} onPress={() => shareToWhatsApp(item)}>
                        <FontAwesome name="whatsapp" size={wScale(20)} color="#075E54" />
                        <Text style={styles.sharetxt}>Share A/C</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shareview} onPress={() => copyto(item)}>
                        <MaterialIcons name="content-copy" size={wScale(20)} />
                        <Text style={styles.sharetxt}>Copy A/C</Text>
                    </TouchableOpacity>

                  { item.BankName==='Punjab National Bank'&& <TouchableOpacity style={[styles.lotiview, ]}>

                        <LottieView
                            autoPlay
                            loop
                            colorFilters={[
                                { keypath: "LayerName", color: "#000" }, 
                            ]}
                            style={[styles.lotiimg,{transform: [{ rotate: '180deg' }] }]}
                            source={
                                require('../../../utils/lottieIcons/upload-file.json')
                            }
                        />
                    </TouchableOpacity>}
                </View>

                <View style={styles.infoContainer}>
                    {renderField('A/C Name', 'Radiant Cash Management Services Ltd')}
                    {renderField('A/C Number', item.AccountNumber, item)}
                    {renderField('IFS Code', item.IfscCode)}
                    {renderField('Bank Name', item.BankName)}
                    {renderField('Branch Info', item.BranchName)}
                </View>
            </View>
        </View>
    );
    const renderItem2 = ({ item }) => (


        <View style={styles.card}>
            <View style={[{ backgroundColor: '#fff' }]}>
                <View style={[styles.logoview, { backgroundColor: `${colorConfig.secondaryColor}33` }]}>
                    <View style={{ width: wScale(115), aspectRatio: 115 / 46, backgroundColor: 'rgba(255,255,255,0.5)' }}>
                        <SvgUri width={'100%'} height={'100%'} uri={item.logoimg} />
                    </View>

                    <TouchableOpacity style={styles.shareview} onPress={onShare}>
                        <FontAwesome name="whatsapp" size={wScale(20)} color="#075E54" />
                        <Text style={styles.sharetxt}>Share QR</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.shareview} onPress={() => copyto2(item)}>
                        <MaterialIcons name="content-copy" size={wScale(20)} />
                        <Text style={styles.sharetxt}>Copy VPA ID</Text>
                    </TouchableOpacity>
                </View>
                <ViewShot ref={capRef}
                    options={{
                        fileName: "TransactionReciept",
                        format: "jpg",
                        quality: 0.9,
                    }}>
                    <View style={{
                        height: wScale(380),
                        width: SCREEN_WIDTH,
                        alignSelf: 'center',
                        backgroundColor: '#fff'
                    }}>
                        <Image source={{ uri: item.qrimage }} style={{ width: '100%', height: '100%', }}
                            resizeMode='contain' />
                    </View>
                    <View style={[styles.infoContainer, { backgroundColor: '#fff' }]}>
                        {renderField('Merchant', 'Radiant Cash Management Services Ltd')}

                    </View>
                </ViewShot>

                <View style={styles.infoContainer}>
                    {renderField('VPA ID', item.vpaid, item)}
                    {renderField('Bank Name', item.BankName)}
                    {renderField('A/C Number', item.AccountNumber, item)}

                </View>

            </View>
        </View>

    );


    return (
        <View style={styles.main}>
            <AppBarSecond title={'Cash Deposit A/C List'} />
            <View style={{ paddingVertical: hScale(10), paddingHorizontal: wScale(10) }}>
                <TabBar
                    Unselected="UPI & QR Code"
                    Selected="Cash & Online"
                    onPress2={() => {
                        // setViewPlans(false);     
                        // getopertaorlist('Postpaid');
                        setVisible(false);
                    }}
                    onPress1={() => {
                        // setViewPlans(true);
                        // getopertaorlist('Prepaid');
                        setVisible(true);
                    }}
                    tabTextstyle={{ fontSize: wScale(14) }}
                />
            </View>
            <ScrollView>
                <View style={styles.container}>

                    <View style={[styles.topviw, { borderColor: colorConfig.secondaryColor }]}>
                        <Image style={styles.toimg} source={require('../../../../assets/images/radiant.png')} />


                        <Text style={styles.toptex}>Below is the list of accounts available for cash deposit
                            in Radiant Cash Management Services Limited. Please choose
                            the appropriate account as per your convenience. You can
                            choose any branch where you do not have to face the crowd
                            and your time is also not wasted.</Text>
                    </View>
                    {loading ? (
                        <ShowLoader />
                    ) : bankData.length > 0 ? (

                        <FlatList
                            data={bankData.filter(item => visible ? item.type === 'online' : item.type === 'qr')}
                            renderItem={({ item }) =>
                                visible ? renderItem({ item }) : renderItem2({ item })
                            }
                            keyExtractor={(item, index) => index.toString()}
                            contentContainerStyle={{ paddingBottom: 20 }}
                        />


                    ) : (
                        <NoDatafound />
                    )}
                </View>

            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: '#f0f2f5',
    },
    container: {
        flex: 1,
        paddingHorizontal: wScale(10),
        paddingTop: hScale(0),
    },
    card: {
        marginBottom: hScale(24),
        elevation: 5,
        backgroundColor: '#fff'
    },
    logoview: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        paddingRight: wScale(10),
        marginBottom: hScale(10)
    },
    infoContainer: {
        rowGap: hScale(10),
        backgroundColor: 'transparent'
    },
    rowBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: hScale(0.7),
        borderColor: '#fff',
        paddingHorizontal: wScale(10),
        paddingVertical: hScale(5),
    },
    rowLabel: {
        fontSize: wScale(15),
        color: '#000',
        fontWeight: 'bold',
    },
    rowValue: {
        fontSize: wScale(15),
        color: '#000',
        paddingLeft: wScale(2),
        paddingVertical: hScale(2),
        borderRadius: wScale(3),
        flex: 1,
        textAlign: 'right',
    },
    sharetxt: {
        fontSize: wScale(15),
        color: '#000',
        paddingLeft: wScale(6),
        paddingVertical: hScale(2),
    },
    shareview: {
        borderWidth: wScale(0.5),
        borderColor: '#000',
        borderRadius: wScale(100),
        height: hScale(30),
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wScale(10),
        marginLeft: wScale(10),
    },
    toimg: {
        width: wScale(100),
        height: wScale(100),
        elevation: 5
    },
    toptex: {
        fontSize: wScale(12),
        textAlign: 'justify',
        marginTop: hScale(5),
        marginBottom: hScale(10),
        color: '#000',
        flex: 1
    },
    topviw: {
        alignItems: 'center',
        flexDirection: 'row',
        flex: 1,
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: hScale(10),
        paddingRight: wScale(4)
    },
    lotiimg: {
        height: hScale(25),
        width: wScale(25),
    },
    lotiview: {
       borderWidth: wScale(0.5),
        borderColor: '#000',
        borderRadius: wScale(100),
        height: hScale(30),
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: wScale(2),
        marginLeft:wScale(5)
    },
});

export default CmsACList;
