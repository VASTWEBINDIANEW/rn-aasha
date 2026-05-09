import { translate } from "../../../utils/languageUtils/I18n";
import React, { useState } from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, ToastAndroid, View } from 'react-native';
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
import { ALERT_TYPE, AlertNotificationRoot, Dialog } from 'react-native-alert-notification';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import FastImage from "react-native-fast-image";
import { getImageSource } from "../../../utils/network/NetWorkImages";

const Availabilitybusiness = () => {
  const { colorConfig, userId } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}100`;
  const navigation = useNavigation<any>();

  const Inductionform = [
    'Dear Retail Cash Executive Company keeps adding collection points from time to time and you will be given collection points on this basis. Their availability is not necessarily immediate. You may have to wait. If you are satisfied with all the information and you are eligible to do this work, please click on the submit button. Our representative will contact you as soon as possible and help you get your registration done.',
  ];
  const [stslist, setStslist] = useState(null);
  const [isLoading, setIsloading] = useState(false);




  const { post } = useAxiosHook();
  const check_Interest = async () => {
    try {
      // handleGoBack();

      const res = await post({ url: APP_URLS.RadiantCEIntersetinfo });
      const status = res?.Content?.ADDINFO?.sts;
      const message = res?.Content?.ADDINFO?.message;

      console.log(res);
      setStslist(res);
      console.warn(res, '*******************');

      deleteaccount(status, message);
    } catch (error) {
      console.error(error);
    }
  };

  const deleteaccount = (status: string, message: any) => {
    Dialog.show({
      type: status === 'Pending' ? ALERT_TYPE.INFO : ALERT_TYPE.SUCCESS,
      title: status,
      textBody: message,
      button: 'OK',
      onPressButton: () => {
        Dialog.hide();
        handleGoBack2();
      },
    });
  };


  const handleGoBack2 = () => {
    navigation.navigate("Dashboard")

  };
  const handleGoBack = () => {

    navigation.goBack()

  };
  const renderItem2 = ({ item, index }) => (
    <View style={styles.paragraphContainer}>
      <Text style={styles.paragraph}>{item}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.topcontainer,]}>
        <FastImage
        
                source={getImageSource(`${APP_URLS.cms_logo}`)}
          style={styles.imgstyle}
          resizeMode="contain" />
        <View style={[styles.column,]}>
          <Text style={[styles.title,]}>{translate("Radiant")}</Text>
          <Text style={styles.title2}>{translate("Cash_Management_Services")}</Text>
        </View>
      </View>
      <ScrollView style={styles.container}>
        <Text style={styles.header}>{translate("Availability_of_business")}</Text>

        <FlashList
          data={Inductionform}
          renderItem={renderItem2}
          keyExtractor={(item, index) => index.toString()}
          ListFooterComponent={<View style={styles.footer}>
            <AlertNotificationRoot>

              <DynamicButton
                title={'Submit for registration'}
                onPress={() => {
                  check_Interest()
                }}
              />
            </AlertNotificationRoot>

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


        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: wScale(15),
    flex: 1,
    paddingVertical: hScale(10),
  },
  paragraphContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hScale(3),
  },
  number: {
    borderWidth: 1,
    backgroundColor: '#000',
    borderRadius: 10,
    marginRight: wScale(10),
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
    marginTop: hScale(5),
  },
  header: {
    fontSize: wScale(20),
    fontWeight: 'bold',
    color: '#322254',
    textTransform: 'uppercase',
    marginBottom: hScale(4),
    textAlign: 'center'
  },
  topcontainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wScale(10),
    paddingVertical: hScale(8),
    borderRadius: 5,
    borderWidth: wScale(4),
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
    marginTop: hScale(14),
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

  glassView: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10
  },
  glassText: {
    color: 'rgba(255, 255, 255, 0.2)',
    fontSize: 18,
    fontWeight: 'bold',
  },


});

export default Availabilitybusiness;
