import { translate } from "../../../utils/languageUtils/I18n";
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import FlotingInput from '../../drawer/securityPages/FlotingInput';
import { hScale, SCREEN_WIDTH, wScale } from '../../../utils/styles/dimensions';
import DynamicButton from '../../drawer/button/DynamicButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { SceneMap, TabBar, TabView } from 'react-native-tab-view';
import { colors } from '../../../utils/styles/theme';
import { DotLoader } from '../../../components/DotLoader ';
import { decryptData } from '../../../utils/encryptionUtils';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import PurchaseToken from './PurchaseToken';
import DealerUsedToken from './DealerUsedToken';

const DealerToken = ({ navigation }) => {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);
    const color1 = `${colorConfig.primaryColor}20`;
    const [remainToken, setRemainToken] = useState('');
    const [token, setToken] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [index, setIndex] = useState(0);
    const { get, post } = useAxiosHook();
    useEffect(() => {
        getData();
    }, []);


    const getData = async () => {

        const userInfo = await get({ url: APP_URLS.getUserInfo });
        const data = userInfo.data;
        const decryptedData = {
            adminfarmname: decryptData(data.kkkk, data.vvvv, data.adminfarmname),
            posremain: decryptData(data.kkkk, data.vvvv, data.posremain),
            remainbal: decryptData(data.kkkk, data.vvvv, data.remainbal),
            frmanems: decryptData(data.kkkk, data.vvvv, data.frmanems),
        };
        console.log(decryptData(data.kkkk, data.vvvv, data)
            , decryptedData);

            setRemainToken(data.creationtoken)
    }
    const purchaseToken = async (delTok) => {
        console.log(delTok)
        setIsLoading(true);
        console.log(APP_URLS.token_Purchase_Dealer + delTok)

        try {
            const token_Purchase_Dealer = await post({ url: `${APP_URLS.token_Purchase_Dealer}${delTok}` })
            console.log(APP_URLS.token_Purchase_Dealer + delTok)
            console.log(token_Purchase_Dealer)
            if (token_Purchase_Dealer.success) {
                Alert.alert('', token_Purchase_Dealer.success);

            } else {
                Alert.alert('', token_Purchase_Dealer);

            }
        } catch (error) {
            Alert.alert(error.message, 'Failed to purchase token');
        }
        setIsLoading(false);
    };



    const renderScene = SceneMap({
        'Purchased': PurchaseToken,
        'Users': DealerUsedToken,


    });
    const [routes] = useState([

        { key: 'Purchased', title: 'Purchased Token' },
        { key: 'Users', title: 'Used Token' },

    ]);


    return (
        <View style={styles.main}>
            <AppBarSecond title={"Manage Retail Token's"} />
            <View style={[{ backgroundColor: colorConfig.secondaryColor, marginTop: hScale(-12) }]}>
                <View style={[styles.header, {}]}>
                    <Text style={[styles.remainText, {
                        marginRight: wScale(10),
                    }]}>{translate("My_Remain_Tokens")}</Text>
                    <Text style={styles.remainText}>{remainToken === '' ? '0' : remainToken}</Text>
                </View>
            </View>
            <View style={styles.container}>
                <View style={styles.inputContainer}>
                    <FlotingInput
                        keyboardType="number-pad"
                        label="Enter Token"
                        maxLength={10}
                        value={token}
                        onChangeTextCallback={(token) => setToken(token)}
                    />
                    <TouchableOpacity style={[styles.righticon2, { backgroundColor: colorConfig.secondaryButtonColor }]}
                        onPress={() => { purchaseToken(token) }
                        }
                    >
                        {isLoading ? <ActivityIndicator size={'large'} color={colorConfig.labelColor} /> :

                            <Text style={{ color: colorConfig.labelColor, fontWeight: 'bold', textAlign: 'center' }}>
                                Go To{'\n'}Purchase
                            </Text>}
                    </TouchableOpacity>
                </View>
            </View>
            <TabView
                lazy
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: SCREEN_WIDTH }}
                renderTabBar={(props) => (
                    <TabBar
                        {...props}
                        indicatorStyle={[styles.indicator, { backgroundColor: colorConfig.primaryColor }]}
                        style={[styles.tabbar, { backgroundColor: color1 }]}
                        renderLabel={({ route, focused }) => (
                            <View style={styles.labelview}>
                                {/* {getSvgimg(route.key)}  */}
                                <Text style={[styles.labelstyle, { color: focused ? colors.dark_black : colors.black75 }]}>
                                    {route.title}
                                </Text>
                            </View>
                        )}
                    />
                )}
            />
        </View>

    );
};

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: '#fff',
    },
    container: {
        paddingHorizontal: wScale(10),
        paddingTop: hScale(15)
    },
    header: {
        marginBottom: hScale(5),
        flexDirection: 'row',
        borderRadius: 100,
        paddingHorizontal: wScale(10),
        justifyContent: 'center',
        paddingVertical: hScale(4),
        borderWidth: wScale(.8),
        minWidth: wScale(190),
        alignSelf: 'center',
        alignItems: 'center',
        borderColor: '#fff',
    },

    butttonstyle: {
        position: 'absolute',
        right: 0,
    },
    remainText: {
        fontSize: wScale(14),
        color: '#fff',
        fontWeight: 'bold',
    },
    inputContainer: {
        marginBottom: hScale(5),
    },

    buttonContainer: {
        marginBottom: hScale(15),
    },

    tabbar: {
        elevation: 0,
        marginBottom: hScale(10),
    },
    indicator: {
    },
    labelstyle: {
        fontSize: wScale(13),
        color: colors.black,
        width: "100%",
        textAlign: 'center',
    },
    labelview: {
        alignItems: 'center',
        flex: 1,
    },
    righticon2: {
        position: "absolute",
        left: "auto",
        right: wScale(0),
        top: hScale(8),
        height: hScale(48),
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: wScale(12),
        borderRadius: wScale(5),
        width: wScale(100),
    },
});

export default DealerToken;
// const PurchasedToken = () => {
//     return (
//         <View style={{ padding: 10 }}>
//             <DotLoader />
//         </View>
//     )
// };
// const UsedToken = () => {
//     return (
//         <View style={{ padding: 10 }}>
//             <DotLoader />
//         </View>
//     )
// };
