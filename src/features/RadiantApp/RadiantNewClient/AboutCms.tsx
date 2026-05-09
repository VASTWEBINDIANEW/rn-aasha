import { translate } from "../../../utils/languageUtils/I18n";
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, Linking, ScrollView, Image, Alert, ToastAndroid, ActivityIndicator } from 'react-native';
import { Button } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import DynamicButton from '../../drawer/button/DynamicButton';
import BackSvg from '../../drawer/svgimgcomponents/BackSvg';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import ShowLoader from '../../../components/ShowLoder';
import FastImage from "react-native-fast-image";
import { getImageSource, getImageSource2 } from "../../../utils/network/NetWorkImages";

const AboutCms = () => {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);
    const color1 = `${colorConfig.secondaryColor}100`;
    const [stslist, setStslist] = useState(null);
    const [isLoading, setIsloading] = useState(false);

    const handleGoBack = () => {
        navigation.goBack()
    };
    const { post } = useAxiosHook();
    const navigation = useNavigation<any>();
    useEffect(() => {


    })
    const check_Interest = async () => {
        try {
            setIsloading(true)
            const res = await post({ url: APP_URLS.RadiantCEIntersetinfo });
            const status = res?.Content?.ADDINFO?.sts;
            const message = res?.Content?.ADDINFO?.message;
            const res2 = await post({ url: 'api/Radiant/RadiantDocstatus' });

            console.log(res, res2);
            setStslist(res);
            setIsloading(false)

            if (status) {
                navigation.navigate('Requirementscms');
            } else {
                ToastAndroid.showWithGravity(
                    message || status,
                    ToastAndroid.LONG,
                    ToastAndroid.BOTTOM
                );
                setIsloading(false)

                // ToastAndroid.show('statusasdfasfsa', ToastAndroid.LONG);
                //  Alert.alert(message);
            }
        } catch (error) {
            setIsloading(false)
        }

    }
    const handleWebsiteLink = () => {

        Linking.openURL('https://www.radiantcashservices.com/');
    };


    const handleHelpLink = () => {
        console.log('Help/How can I work clicked');
        // Linking.openURL('https://www.radiantcashservices.com/');
    };

    return (

        <ScrollView style={{}}>
            <View style={[styles.topcontainer,]}>
                <FastImage 
                
                source={getImageSource(`${APP_URLS.cms_logo}`)}
                    style={styles.imgstyle}
                    resizeMode="contain" />
                <View style={styles.column}>
                    <Text style={styles.title}>{translate("Radiant")}</Text>
                    <Text style={styles.title2}>{translate("Cash_Management_Services")}</Text>
                </View>
            </View>
            <View style={styles.container}>
                <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
                    <Text style={[styles.aboutTitle, { color: colorConfig.secondaryColor, borderBottomColor: colorConfig.secondaryColor }]}>{translate("ABOUT_THE_COMPANY")}</Text>
                </View>
                <Text style={styles.aboutText}>{translate("key_radiantca_163")}</Text>

                <Text style={styles.aboutText}>{translate("key_depending_164")}</Text>
                <View style={styles.mapview}>
                    <View style={styles.mapcontant}>

                        <Text style={[styles.aboutText, { marginBottom: 0 }]}>{translate("key_thecompan_165")}</Text>
                        <Text style={[styles.aboutText, { marginBottom: 0 }]}>{translate("key_cashcolle_166")}</Text>
                        <Text style={[styles.aboutText, { marginBottom: 0 }]}>{translate("current_accounts_and_subsequent")}</Text>
                        <Text style={[styles.aboutText, { marginBottom: 0 }]}>{translate("transfer_to_the_clients_accounts_either")}</Text>
                        <Text style={[styles.aboutText, { marginBottom: 0 }]}>{translate("on_the_same_day_or_on_the_next")}</Text>
                        <Text style={[styles.aboutText, { marginBottom: 0 }]}>{translate("working_day_The_Company")}</Text>
                        <Text style={[styles.aboutText, { marginBottom: 0 }]}>{translate("believes_that_our_network_of_more")}</Text>
                        <Text style={[styles.aboutText, { marginBottom: 0 }]}>{translate("than_60000_touch_points_and_a")}</Text>
                        <Text style={[styles.aboutText, { marginBottom: 0 }]}>{translate("wide_network_of_bank_accounts_with")}</Text>
                        <Text style={[styles.aboutText, { marginBottom: 0 }]}>{translate("various_banks_across_the_country")}</Text>
                        <Text style={[styles.aboutText, { marginBottom: 0 }]}>{translate("allows_use_to_offer_a_unique_value")}</Text>
                        <Text style={[styles.aboutText, { marginBottom: 0 }]}>{translate("proposition_to_company_clients")}</Text>
                        <Text style={[styles.aboutText,]}>{translate("key_especially_167")}</Text>
                    </View>
                    <View style={styles.matimg}>

                        <FastImage source={getImageSource2('map.png')}
                            style={styles.mapstyle}
                            resizeMode="contain" />
                    </View>

                </View>
                <DynamicButton
                    onPress={() => {
                        // handleHelpLink();
                        // check_Interest()
                        navigation.navigate('Requirementscms');
                    }}
                    title={isLoading ? <ActivityIndicator color={colorConfig.labelColor} size={'large'} /> : 'Yes, how can i work?'}
                />

                <View style={styles.linksContainer}>
                    <Button
                        mode="text"
                        onPress={handleGoBack}
                        icon={() => <BackSvg size={15} color={colorConfig.primaryColor} />}
                    >
                        <Text style={[styles.goBackText, { color: colorConfig.primaryColor, }]}>{'Go Back'}</Text>
                    </Button>

                    <Button
                        mode="text"
                        onPress={handleWebsiteLink}
                    >
                        <Text style={[styles.websiteLinkText, { color: colorConfig.secondaryColor, textDecorationColor: colorConfig.secondaryColor }]}>{translate("Company_Website_Link")}</Text>
                    </Button>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wScale(10),
    },
    heading: {
        fontSize: wScale(32),
        fontWeight: 'bold',
        color: 'red',
        marginBottom: hScale(5),
    },
    subHeading: {
        fontSize: wScale(18),
        color: 'gray',
        marginBottom: hScale(20),
    },
    aboutTitle: {
        fontSize: wScale(22),
        marginBottom: hScale(10),
        textAlign: 'center',
        borderBottomWidth: 1,
        paddingHorizontal: wScale(15),
    },
    aboutText: {
        fontSize: wScale(14),
        color: 'black',
        marginBottom: hScale(10),
        textAlign: 'justify'
    },
    mapview: {
        flexDirection: 'row',
    },
    matimg: {
        position: 'absolute',
        right: 0,
        height: '90%',
        justifyContent: 'center',
        zIndex: -9
    },
    mapcontant: {

    },
    mapstyle: {
        width: wScale(170),
        height: wScale(190),

    },
    button: {
        marginTop: hScale(20),
        paddingVertical: hScale(10),
        width: '80%',
        backgroundColor: '#6200ee',
    },
    linksContainer: {
        marginTop: hScale(10),
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    goBackText: {
        color: 'blue',
        fontSize: wScale(16),
    },
    websiteLinkText: {
        color: 'blue',
        fontSize: wScale(16),
        textDecorationLine: 'underline'
    },

    svgimg: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderRadius: 10,
        paddingHorizontal: wScale(10),
        paddingVertical: hScale(5),
    },
    topcontainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: wScale(10),
        paddingVertical: hScale(8),
        borderRadius: 5,
        borderWidth: 4,
        marginBottom: hScale(10),
        backgroundColor: '#ffe066',
        borderColor: '#fccb0a'
    },
    imgstyle: {
        width: wScale(90),
        height: wScale(90),
    },
    column: {
        justifyContent: 'center',
        flex: 1,
        backgroundColor: 'transparent',
        paddingLeft: wScale(5),

    },
    title: {
        fontSize: wScale(55),
        fontWeight: 'bold',
        color: '#322254',
        textTransform: 'uppercase',
        letterSpacing: wScale(3),
        lineHeight: wScale(60),
    },
    title2: {
        fontSize: wScale(19.3),
        color: '#322254',
        marginTop: hScale(-6),
        fontWeight: 'bold',
        paddingLeft: wScale(3),
    }
});

export default AboutCms;
