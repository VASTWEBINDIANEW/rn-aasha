import { translate } from "../../../utils/languageUtils/I18n";
import React, { useEffect } from 'react';
import { View, StyleSheet, Image, Text, ScrollView } from 'react-native';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import DynamicButton from '../../drawer/button/DynamicButton';
import { RootState } from '../../../reduxUtils/store';
import { useSelector } from 'react-redux';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import { FontFamily } from '../../../utils/styles/theme';
import { getImageSource } from "../../../utils/network/NetWorkImages";
import FastImage from "react-native-fast-image";

const InterestVerification = () => {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);
    const color1 = `${colorConfig.secondaryColor}100`;
    const navigation = useNavigation<any>();

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.heading}>
                <Text style={styles.headingE}>E</Text>
                <Text style={styles.headingX}>{translate("xclusive")}</Text>
            </Text>
            <Text style={styles.subHeading}>{translate("CMS_SERVICES")}</Text>

            <FastImage
                source={getImageSource('Radiant2.jpg')}
                style={styles.logo}
                resizeMode={'cover'}
            />

            <Text style={[styles.description, { color: colorConfig.secondaryColor }]}>{translate("We_are_introducing_you_to_Radiant_Cash_Management_Services_Limited_one_of_the_largest_CMS_service_providers_in_India")}</Text>
            <DynamicButton
                title={' Need more information'}
                onPress={() => navigation.navigate("AboutCms")}
            />

        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: wScale(20),
        paddingTop: hScale(10)
    },
    heading: {
        fontSize: wScale(64),
        marginBottom: hScale(5),
        flexDirection: 'row',
        textAlign: 'center',
    },
    headingE: {
        color: 'red',
        fontWeight: 'bold'
    },
    headingX: {
        color: '#322254',
        textTransform: 'uppercase',
        fontFamily: FontFamily.italic,
        fontWeight: 'bold'

    },
    subHeading: {
        fontSize: wScale(40),
        color: 'gray',
        marginBottom: 20,
        textAlign: 'center',
        marginTop: hScale(-20)
    },
    logo: {
        width: hScale(290),
        height: hScale(290),
        marginBottom: hScale(20),
        alignSelf: 'center'
    },
    tagline: {
        fontSize: wScale(22),
        fontWeight: 'bold',
        marginBottom: hScale(20),
    },
    description: {
        textAlign: 'center',
        fontSize: wScale(22),
        color: 'gray',
        marginBottom: hScale(25),
        marginTop: hScale(10),
    },//////

});

export default InterestVerification;
