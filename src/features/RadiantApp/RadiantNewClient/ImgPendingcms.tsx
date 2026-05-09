import { translate } from "../../../utils/languageUtils/I18n";
import React, { useEffect, useState } from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import BackSvg from '../../drawer/svgimgcomponents/BackSvg';
import DocPaddingSvg from '../../drawer/svgimgcomponents/DocPaddingSvg';
import LocationSvg from '../../drawer/svgimgcomponents/LocationSvg';
import PaddingSvg2 from '../../drawer/svgimgcomponents/PaddingSvg2';
import FastImage from "react-native-fast-image";
import { getImageSource } from "../../../utils/network/NetWorkImages";


const ImgPendingcms = () => {
  const { colorConfig, userId } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}20`;
  const navigation = useNavigation<any>();
  const [stslist, setStslist] = useState<any>(null);
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [docpending, setDocpending] = useState<boolean>(false);
  const [ceRegPending, setCeRegPending] = useState<boolean>(false);
  const [cePointsPending, setCePointsPending] = useState<boolean>(false);
  const { post } = useAxiosHook();

  useEffect(() => {
    check_Interest();
  }, [userId, colorConfig]);

  const check_Interest = async () => {
    try {
      const res = await post({ url: APP_URLS.RadiantCEIntersetinfo });
      const status = res?.Content?.ADDINFO?.sts;
      const message = res?.Content?.ADDINFO?.message;
      setStslist(res);
      setMessage(message);
      setLoading(false);
      console.log(res, '*96532.65')
      if (status === 'Success' && message === '') {
        const res2 = await post({ url: APP_URLS.RadiantCEIntersetCheck });
        const status2 = res2?.Content?.ADDINFO?.sts;
        const message2 = res2?.Content?.ADDINFO?.message;
        setDocpending(status2 === 'DocPending');
        setCeRegPending(status2 === 'CERegPending');
        setCePointsPending(status2 === 'CEPointsPending');
        setStslist(res2);
        setMessage(message2);
        setLoading(false);
        console.log(res2, '*96532.1111111111111111111')

      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleWebsiteLink = () => {
    Linking.openURL('https://www.radiantcashservices.com/');
  };

  const handleGoBack = () => {
    navigation.navigate('Dashboard');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colorConfig.primaryColor} />
        <Text style={styles.loadingText}>{translate("Loading_your_status")}</Text>
      </View>
    );
  }
   const openPhoneApp = () => {
        Linking.openURL(`tel:${7414066333}`);

    };
  return (
    <View style={{ flex: 1 }}>
      <View style={[styles.topcontainer]}>
        <FastImage
          source={getImageSource(`${APP_URLS.cms_logo}`)}
          style={styles.imgstyle}
          resizeMode="contain"
        />
        <View style={[styles.column]}>
          <Text style={styles.title}>{translate("Radiant")}</Text>
          <Text style={styles.title2}>{translate("Cash_Management_Services")}</Text>
        </View>
      </View>
      <ScrollView style={styles.container}>
        <View style={styles.headerContainer}>

          <PaddingSvg2 size={200} />


          <Text style={styles.header}>{translate("Selfie_verification")}</Text>
          <Text style={styles.header2}>{translate("is_Pending")}</Text>
        </View>

        <View style={[styles.paragraphContainer, { backgroundColor: color1 }]}>
          <Text style={styles.paragraph}>{translate("key_selfiever_171")}</Text>

        </View>

        <TouchableOpacity onPress={openPhoneApp}>
          <Text style={{ color:'#fff',backgroundColor: '#FF3B30', padding: 5, borderRadius: 6, textAlign: 'center', fontSize: wScale(16), fontWeight: 'bold' }}>
            7414066333
          </Text>

        </TouchableOpacity>
        <View style={styles.linksContainer}>
          <Button
            mode="text"
            onPress={handleGoBack}
            icon={() => <BackSvg size={15} color={colorConfig.primaryColor} />}
          >
            <Text style={[styles.goBackText, { color: colorConfig.primaryColor }]}>{translate("Go_Back")}</Text>
          </Button>

          <Button
            mode="text"
            onPress={handleWebsiteLink}
            labelStyle={{ color: colorConfig.secondaryColor }}
          >
            <Text style={[styles.websiteLinkText, { color: colorConfig.secondaryColor }]}>{translate("Company_Website_Link")}</Text>
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: hScale(10),
    fontSize: wScale(16),
    color: '#888',
    textAlign: 'center'
  },
  headerContainer: {
    backgroundColor: '#f1f1f1',
    paddingVertical: hScale(15),
    paddingHorizontal: wScale(20),
    borderRadius: 8,
    alignItems: 'center',
  },
  pandingimgstyle: {
    height: hScale(100),
    width: wScale(210),
    marginBottom: hScale(20)
  },
  header: {
    fontSize: wScale(44),
    color: '#322254',
    textTransform: 'capitalize',
    marginBottom: hScale(5),
    textAlign: 'center',
    marginTop: hScale(0),

  },
  header2: {
    fontSize: wScale(54),
    fontWeight: 'bold',
    color: '#322254',
    marginBottom: hScale(5),
    textAlign: 'center',
    // marginTop: hScale(-25),
    borderBottomWidth: 1,
    paddingBottom: hScale(10),
    lineHeight: 60
  },
  subHeader: {
    fontSize: wScale(30),
    color: '#000',
    textAlign: 'center',
    marginTop: hScale(5),
  },
  paragraphContainer: {
    marginBottom: hScale(10),
    paddingVertical: hScale(10),
    paddingHorizontal: wScale(10),
    borderRadius: 8
  },
  paragraph: {
    marginBottom: 0,
    color: '#000',
    textAlign: 'justify',
    flex: 1,
    fontSize: wScale(22),
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
    borderColor: '#fccb0a',
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
    marginTop: hScale(0),
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignSelf:'flex-end'
  },
  goBackText: {
    fontSize: wScale(16),
  },
  websiteLinkText: {
    fontSize: wScale(16),
    textDecorationLine: 'underline',
  },
});

export default ImgPendingcms;
