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
import CmsPayoutStructure from './CmsPayoutStructure';
import { getAssetSource, getImageSource2 } from "../../../utils/network/NetWorkImages";

const CmsShowPayoutStructure = () => {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);

    const [addInfo, setAddInfo] = useState(null);
    const { post } = useAxiosHook();
    const navigation = useNavigation<any>();

   
    const handleWebsiteLink = () => {

        Linking.openURL('https://www.radiantcashservices.com/');
    };


    const handleGoBack = () => {
        navigation.goBack()
    };
 


    return (
        <View style={{ flex: 1, marginBottom: hScale(10) }}>
            <View>
                <ImageBackground source={getImageSource2('cmsTableB.jpeg')}
                    resizeMode='cover'
                    style={styles.bgImage}>
                    <Text style={styles.title}>{translate("RCE_Payout_Structure")}</Text>
                </ImageBackground>
            </View>
            <ScrollView style={styles.container}>

               <CmsPayoutStructure/>

                <View style={{ paddingHorizontal: wScale(10), paddingTop: hScale(10) }}>
                    <DynamicButton
                        title={'Next'}
                        onPress={() => { navigation.navigate('CmsNewPin', { pay: 'pay' }); }}
                    />
                </View>
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

            </ScrollView>
        </View>

    );
};

export default CmsShowPayoutStructure;


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


