import { translate } from "../../../utils/languageUtils/I18n";
import React from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { FlashList } from '@shopify/flash-list';
import DynamicButton from '../../drawer/button/DynamicButton';
import { useNavigation } from '@react-navigation/native';
import CheckSvg from '../../drawer/svgimgcomponents/CheckSvg';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import BackSvg from '../../drawer/svgimgcomponents/BackSvg';
import { Button } from 'react-native-paper';
import FastImage from "react-native-fast-image";
import { getAssetSource, getImageSource2 } from "../../../utils/network/NetWorkImages";
import { APP_URLS } from "../../../utils/network/urls";

const Requirementscms = () => {
  const { colorConfig, userId } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}100`;
  const navigation = useNavigation<any>();

  const requirementtext = [
    'The place you live has a population of more than 10,000.',
    'You can take a fixed time to collect the money from any store or office authorized by the company within a radius of 5 km and you can transfer the collected amount to the company through deposit or online mode within a fixed time. If yes, you can do so.',
    'If you or any other member of the blood relation have any criminal record in the past, convicted for any crime including moral turpitude, have police history sheet, then you will not be considered eligible for this service.',
    'You need to keep your financial credit score (civil score) above about 670. If you don\'t have this or more financial credit score then you are not eligible.',
    'If you are physically able to travel and have a vehicle available.',
    'You are a native Indian citizen and you have all the KYC documents along with a bank account and a checkbook available.'

  ];
  const handleWebsiteLink = () => {

    Linking.openURL('https://www.radiantcashservices.com/');
  };


  const handleGoBack = () => {
    navigation.goBack()
  };
  const renderItem = ({ item, index }) => (
    <View style={styles.paragraphContainer}>
      {/* <Text style={styles.number}>
        {`${index + 1}  `}
      </Text> */}
      <View style={[styles.number, { backgroundColor: colorConfig.secondaryColor }]}>

        {/* <CheckSvg size={15} /> */}
      </View>

      <Text style={styles.paragraph}>{item}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.topcontainer,]}>
        <FastImage 
        
                source={getImageSource2(`${APP_URLS.cms_logo}`)}
          style={styles.imgstyle}
          resizeMode="contain" />
        <View style={styles.column}>
          <Text style={styles.title}>{translate("Radiant")}</Text>
          <Text style={styles.title2}>{translate("Cash_Management_Services")}</Text>
        </View>
      </View>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>{translate("The_requirements_must_be_met")}</Text>
        <FlashList
          data={requirementtext}
          renderItem={renderItem}
          keyExtractor={(item, index) => index.toString()}
          ListFooterComponent={<View style={styles.footer}>
            <DynamicButton
              title={'Next'}
              onPress={() => { navigation.navigate('CmsShowPayoutStructure'); }}
            />
          </View>}
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
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wScale(15),
    flex: 1,
    paddingVertical: hScale(5),
  },
  paragraphContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hScale(5),
  },
  number: {
    borderWidth: 1,
    backgroundColor: '#000',
    borderRadius: 10,
    marginRight: 10,
    color: '#fff',
    height: wScale(12),
    width: wScale(12),
    textAlign: 'center',
    textAlignVertical: 'center',
    marginTop: hScale(4),
    alignItems: 'center'
  },
  paragraph: {
    marginBottom: 0,
    color: '#000',
    textAlign: 'justify',
    flex: 1,
    fontSize: wScale(15),
  },
  footer: {
    marginTop: 5,
  },
  header: {
    fontSize: wScale(20),
    fontWeight: 'bold',
    color: '#322254',
    textTransform: 'uppercase',   
    marginBottom: hScale(8)
  },
  topcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wScale(10),
    paddingVertical: hScale(8),
    borderRadius: 5,
    borderWidth: 4,
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
  },
  linksContainer: {
    marginTop: hScale(5),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
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

export default Requirementscms;
