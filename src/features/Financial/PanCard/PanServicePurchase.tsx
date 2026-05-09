import { translate } from "../../../utils/languageUtils/I18n";
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Linking, ToastAndroid, Alert, ScrollView, TouchableOpacity } from 'react-native';
import FlotingInput from '../../drawer/securityPages/FlotingInput';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import { ALERT_TYPE, AlertNotificationRoot, Dialog, Toast } from 'react-native-alert-notification';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import ServicepurchaseScreen from '../VastDMT/ServicepurchaseScreen';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import { Icon } from 'react-native-vector-icons/Icon';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import DynamicButton from '../../drawer/button/DynamicButton';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { SvgXml } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';

const PanCardScreen = ({ }) => {
  const { colorConfig } = useSelector((status: RootState) => status.userInfo)
  const color1 = `${colorConfig.primaryColor}20`;
  const Pen = `
  <svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><linearGradient id="_Linear1" gradientTransform="matrix(0 21.878 -29.833 0 19.281 5)" gradientUnits="userSpaceOnUse" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#04beff"/><stop offset="1" stop-color="#555cff"/></linearGradient><path d="m31 8c0-.796-.316-1.559-.879-2.121-.562-.563-1.325-.879-2.121-.879-5.154 0-18.846 0-24 0-.796 0-1.559.316-2.121.879-.563.562-.879 1.325-.879 2.121v16c0 .796.316 1.559.879 2.121.562.563 1.325.879 2.121.879h24c.796 0 1.559-.316 2.121-.879.563-.562.879-1.325.879-2.121zm-23.904 7.749c-1.846 1.024-3.096 2.993-3.096 5.251 0 .552.448 1 1 1s1-.448 1-1c0-2.208 1.792-4 4-4s4 1.792 4 4c0 .552.448 1 1 1s1-.448 1-1c0-2.258-1.25-4.227-3.096-5.251.679-.717 1.096-1.685 1.096-2.749 0-2.208-1.792-4-4-4s-4 1.792-4 4c0 1.065.417 2.033 1.096 2.749zm11.903 5.251 4 .003c.552.001 1.001-.447 1.001-.999s-.447-1-.999-1.001l-4-.003c-.552 0-1.001.447-1.001.999s.447 1.001.999 1.001zm.001-4 7 .003c.551 0 1-.447 1-.999s-.448-1.001-1-1.001l-7-.003c-.551 0-1 .448-1 1 0 .551.448 1 1 1zm-9-2c-1.104 0-2-.896-2-2s.896-2 2-2 2 .896 2 2-.896 2-2 2zm9-2 7 .003c.551 0 1-.447 1-.999s-.448-1.001-1-1.001l-7-.003c-.551 0-1 .448-1 1 0 .551.448 1 1 1z" fill="url(#_Linear1)"/></svg> `;

  const Padding = `
<svg id="Capa_1" enable-background="new 0 0 512 512" height="512" viewBox="0 0 512 512" width="512" xmlns="http://www.w3.org/2000/svg"><g><path d="m255.732 15h-.522v481.268l12.25-.598c128.1-6.255 228.75-111.938 228.75-240.191-.001-132.813-107.666-240.479-240.478-240.479z" fill="#ff8421"/><path d="m386.319 387.11c-2.93 2.93-6.77 4.39-10.61 4.39s-7.68-1.46-10.61-4.39l-109.89-109.89-7.5-91.72 7.5-95.12c8.28 0 15 6.71 15 15v144.41l116.11 116.1c5.85 5.86 5.85 15.36 0 21.22z" fill="#15171a"/><g><path d="m255.209 90.38v186.84l-10.61-10.61c-2.81-2.82-4.39-6.63-4.39-10.61v-150.62c0-8.29 6.72-15 15-15z" fill="#333940"/></g><path d="m511.209 256c0 68.38-26.63 132.67-74.98 181.02s-112.64 74.98-181.02 74.98l-5-15 5-15c124.62 0 226-101.38 226-226s-101.38-226-226-226l-5-16.333 5-13.667c68.38 0 132.67 26.63 181.02 74.98s74.98 112.64 74.98 181.02z" fill="#15171a"/><g fill="#333940"><g><path d="m255.209 0v30c-8.28 0-15-6.72-15-15s6.72-15 15-15z"/><path d="m255.209 482v30c-8.28 0-15-6.72-15-15s6.72-15 15-15z"/></g><g><path d="m168.059 46.257c1.852 0 3.736-.345 5.561-1.074.054-.021 5.394-2.148 11.142-3.945 6.142-1.919 13.403-3.973 13.476-3.993 7.973-2.252 12.609-10.541 10.357-18.513-2.251-7.972-10.534-12.61-18.512-10.357-.312.088-7.724 2.184-14.269 4.229-6.902 2.157-13.079 4.622-13.338 4.726-7.689 3.078-11.426 11.804-8.351 19.494 2.346 5.865 7.979 9.433 13.934 9.433z"/><path d="m107.486 46.865c-.262.192-6.469 4.75-11.882 8.957-5.712 4.438-10.634 8.911-10.84 9.099-6.124 5.576-6.567 15.058-.994 21.184 2.96 3.252 7.021 4.904 11.099 4.904 3.602 0 7.215-1.289 10.089-3.902.043-.039 4.298-3.901 9.054-7.596 5.082-3.949 11.164-8.416 11.225-8.46 6.679-4.902 8.119-14.289 3.218-20.968-4.903-6.679-14.29-8.12-20.969-3.218z"/><path d="m64.367 107.514c-6.931-4.539-16.227-2.601-20.767 4.329-.178.271-4.396 6.714-7.994 12.552-3.795 6.157-6.838 12.07-6.966 12.319-3.783 7.368-.878 16.405 6.488 20.19 2.194 1.127 4.535 1.661 6.843 1.661 5.442 0 10.694-2.972 13.354-8.144.025-.051 2.659-5.16 5.818-10.285 3.378-5.479 7.511-11.793 7.552-11.856 4.54-6.93 2.601-16.227-4.328-20.766z"/><path d="m14.364 240.256c.594.069 1.183.104 1.766.104 7.503 0 13.984-5.62 14.879-13.254.007-.057.676-5.709 1.85-11.67 1.244-6.313 2.904-13.673 2.921-13.747 1.826-8.08-3.244-16.111-11.325-17.937-8.082-1.827-16.11 3.245-17.937 11.325-.072.316-1.768 7.83-3.093 14.56-1.397 7.093-2.179 13.697-2.211 13.974-.966 8.228 4.921 15.681 13.15 16.645z"/><path d="m35.087 307.449c-.014-.055-1.367-5.581-2.354-11.576-1.046-6.35-2.069-13.826-2.079-13.9-1.121-8.208-8.67-13.958-16.892-12.833-8.208 1.121-13.953 8.683-12.833 16.891.044.321 1.088 7.952 2.202 14.717 1.175 7.136 2.757 13.597 2.824 13.869 1.683 6.841 7.811 11.42 14.554 11.42 1.187 0 2.392-.142 3.596-.438 8.045-1.98 12.962-10.105 10.982-18.15z"/><path d="m60.787 371.262c-3.203-5.582-6.78-12.227-6.816-12.293-3.925-7.296-13.024-10.027-20.315-6.104-7.296 3.924-10.029 13.02-6.104 20.315.153.286 3.804 7.068 7.217 13.014 3.6 6.272 7.343 11.769 7.501 12 2.903 4.254 7.609 6.543 12.399 6.543 2.911 0 5.854-.846 8.439-2.61 6.843-4.667 8.606-13.998 3.941-20.842-.033-.048-3.265-4.8-6.262-10.023z"/><path d="m122.839 439.246c-.047-.033-4.738-3.353-9.375-7.195-4.955-4.106-10.632-9.077-10.688-9.127-6.229-5.459-15.708-4.836-21.167 1.396-5.46 6.23-4.835 15.707 1.395 21.167.244.214 6.038 5.288 11.318 9.664 5.568 4.614 11 8.451 11.229 8.612 2.627 1.851 5.642 2.74 8.627 2.74 4.711 0 9.349-2.213 12.271-6.355 4.773-6.768 3.157-16.126-3.61-20.902z"/><path d="m195.392 473.997c-.056-.014-5.559-1.462-11.297-3.454-6.079-2.111-13.137-4.78-13.208-4.807-7.745-2.932-16.404.972-19.338 8.72-2.932 7.748.972 16.406 8.72 19.338.304.115 7.508 2.839 13.986 5.088 6.83 2.372 13.261 4.063 13.531 4.135 1.275.334 2.554.494 3.812.494 6.655 0 12.734-4.462 14.5-11.202 2.102-8.014-2.692-16.212-10.706-18.312z"/></g></g></g></svg>  
  

  `;
  const [amount, setAmount] = useState('');
  const [loader, setLoader] = useState(false);
  const [psaId, setPsaId] = useState('');
  const { get, post } = useAxiosHook()
  const [serviceVisi, setServiceVisi] = useState(true);
  const [ResgisteredSts, SetResgisteredSts] = useState('BOTHNOTDONE');
  const navigation = useNavigation();
  const [isnotReg, setIsnotReg] = useState(false);
  const pancardStatus = async () => {
    try {
      const response = await get({ url: `${APP_URLS.panCardStatusCheck}` });
  
      console.log('pancardStatus', response);
      const status = response.Response;
      SetResgisteredSts(status);
      const msz = response['Message'];
      setPsaId(msz);
  
      if (status === 'BOTHNOTDONE' || status === 'NOTOK' || status === 'ALLNOTDONE') {
        setServiceVisi(true);
      } else if (status === 'Registered') {
        // Handle Registered case if necessary
      } else if (status === 'NOTRegistered' || status === 'PENDING') {
        setIsnotReg(status === 'NOTRegistered' || status === 'PENDING');
        navigation.navigate('Registerpancard', { status: status });
      } else if (status === 'FAILED') {
        Alert.alert(
          msz + ' !!!',
          '',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Dashboard'),
            },
          ]
        );
      } else {
        Alert.alert(
          msz + ' !!!',
          '',
          [
            {
              text: 'OK',
              onPress: () => console.log('OK Pressed'), // Default action for other status
            },
          ]
        );
      }
  
    } catch (error) {
      console.error(error);
    }
  };
  
  
  useEffect(() => {
     pancardStatus();
  }, []);

  const handleNavigation = () => {
    if (status === 'BOTHNOTDONE' || status === 'NOTOK' || status === 'ALLNOTDONE') {
      navigation.navigate('ServicePurchasePage', { typename: 'PANCARD' });
    } else if (status === 'Registered') {
      navigation.navigate('PanAmount', { psaid: msz });
    } else if (status === 'NOTRegistered' || status === 'PENDING') {

      navigation.navigate('RegisterPanCard', { status });
    } else {
    }
  };
  const Registerpancard = ({ status }) => {
    const [pending, setPending] = useState(false);
    const _launchURL = async () => {
      const url = 'https://www.psaonline.utiitsl.com/psaonline/';
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error("Don't know how to open URI: " + url);
      }
    };

    const checkpanlivestatus = async () => {
      try {
        const response = post({ url: `${APP_URLS.checkLivePanStatus}` });
        ToastAndroid.showWithGravity(
          response['Message'],
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM
        );

      } catch (error) {
      }
    };
    return (
      <View style={{ top: 30, borderWidth: 2, borderColor: 'red', borderRadius: 5, height: 700 }}>
        {/* {ResgisteredSts === 'Registered' ?  */}
        <View>
          <View style={{ justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{}}>{status}</Text>
          </View>
          <View style={{ paddingHorizontal: 10 }}>
            <Text style={{ color: 'red', textAlign: 'center' }}>{translate("You_are_Not_Registered_with_Pancard_Service")}</Text>
            <Button
              title="Click TO Register At UTI"
              onPress={() => navigation.navigate('Registerform')}
            />
          </View>
        </View>
        {/* // : <></>} */}

      </View>
    );
  };


  const PeddingRegistration = ({ status }) => {
    const [pending, setPending] = useState(false);
    const _launchURL = async () => {
      const url = 'https://www.psaonline.utiitsl.com/psaonline/';
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.error("Don't know how to open URI: " + url);
      }
    };

    const checkpanlivestatus = async () => {
      try {
        const response = await post({ url: `${APP_URLS.checkLivePanStatus}` });
        ToastAndroid.showWithGravity(
          response['Message'],
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM
        );

      } catch (error) {

      }
    };
    return (
      <View style={{flex:1}}>
        <LinearGradient colors={[colorConfig.primaryColor,
        colorConfig.secondaryColor]} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
          style={styles.linear}>
          <View style={styles.psaidrow}>
            <Text style={styles.psaidtext}>{translate("PSA_ID")}</Text>
            <Text style={styles.paddingheadar}>
              {status === 'PENDING' ? 'User Registration Pending' : 'UnRegistred User'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <DynamicButton title={'Login UTR'} />


          </View>
        </LinearGradient>

        <View style={styles.container}>
          <View style={styles.svgimg}>
            <SvgXml xml={Padding} width={wScale(150)}
              height={hScale(150)} />
          </View>

          <Text style={styles.titletext}>{status === 'PENDING' ? 'PENDING' : 'Not Registred'}</Text>
          <Text style={styles.description}>{status === 'PENDING' ? translate('key_yourpanc_115') : translate('key_youareno_151')}</Text>
          <View style={styles.btnrow
          }>
            <View style={styles.checkstatus}>
              <DynamicButton title={"Back"} onPress={() => navigation.goBack()} />

            </View>
            <View style={styles.checkstatus}>
              <DynamicButton styleoveride={{paddingHorizontal:hScale(7)}}
                title={status === 'PENDING' ? 'Check Live Status' : 'Click TO Register At UTI'}
                onPress={status === 'PENDING' ? checkpanlivestatus : () => navigation.navigate('Registerform')}
              />


            </View>
          </View>
        </View>
      </View>

    );
  };



  const openURL = (url) => {
    Linking.openURL(url)
      .then((supported) => {
        if (!supported) {
          console.log("Can't handle url: " + url);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };
  const purchasePan = useCallback(async (amount) => {
    const url = `${APP_URLS.purchasePanc}${amount}`;
    console.log(url)
    try {
      const response = await post({ url: `${APP_URLS.purchasePanc}${amount}` });
      console.log(response);
      if (response.Response === 'Success') {
        Dialog.show({
          type: ALERT_TYPE.SUCCESS,
          title: 'SUCCESS',
          textBody: 'Purchase Successfully',
          button: 'OK',
          onPressButton: () => {
            Dialog.hide();
          },
        });
      } else {
        Dialog.show({
          type: ALERT_TYPE.DANGER,
          title: response.Response === 'Failed' ? response.Response : response.Message,
          textBody: '',
          button: 'OK',
          onPressButton: () => {
            Dialog.hide();
          },
        });
      }
    } catch (error) {
      console.error("Error occurred:", error);
    }
  }, [amount]);


  return (

    <View style={{flex:1,}}>


      
{/*     {ResgisteredSts === 'BOTHNOTDONE' || ResgisteredSts === 'NOTOK' || ResgisteredSts === 'BOTHNOTDONE' ?

          <ServicepurchaseScreen route={'PANCARD'} /> : <></>} */}

    
{ResgisteredSts === 'Registered' ?
  <View style={styles.main}>
    <AppBarSecond
      title={'Pan Card Purchase'}
      actionButton={
        <Text style={styles.loginButton}>{translate("Login_UTI")}</Text>
      }
      onActionPress={() => { openURL('https://www.psaonline.utiitsl.com/psapanservices/forms/login.html/loginHome') }}
    />


    <View style={styles.container}>

      <View>
        <View style={styles.svgimg}>
          <SvgXml xml={Pen} width={wScale(87)} height={hScale(87)} />
        </View>
        <View style={[styles.psaIdContainer, { backgroundColor: color1 }]}>
          <Text style={[styles.psaIdLabel, { color: colorConfig.primaryColor }]}>{translate("PSA_ID")}</Text>
          <Text style={[styles.psaIdValue, { color: colorConfig.secondaryColor }]}>{loader ? translate('Loading...') : psaId}</Text>
        </View>
        <FlotingInput
          label={'Enter Amount'}
          value={amount}
          onChangeTextCallback={setAmount}
          keyboardType="number-pad"
        />

        <AlertNotificationRoot>
          {/* Your AlertNotification code here */}
        </AlertNotificationRoot>

        <View style={styles.empty} />


        <DynamicButton
          title={'Purchase'}
          onPress={() => {
            if (amount === "" || amount === '0') {
              ToastAndroid.showWithGravity(
                'Enter Valid Amount',
                ToastAndroid.SHORT,
                ToastAndroid.BOTTOM
              );
            } else {
              purchasePan(amount);
            }
          }}
        />
      </View>
    </View>
  </View>
  : <></>}


        {/* <View>
          {ResgisteredSts === 'Registered' || ResgisteredSts === 'NOTOK' || ResgisteredSts === 'ALLNOTDONE' ? <Registerpancard status={ResgisteredSts} /> : <PeddingRegistration />
          }
        </View> */}
    <View style={{flex:1}}>
          {ResgisteredSts === "PENDING" || ResgisteredSts === 'NOTRegistered' ? <PeddingRegistration status={ResgisteredSts}/> : <></>}
        </View>

        <TouchableOpacity
          style={styles.manuallyButton}
          onPress={() => {
            // Navigate to 'PancardManual' screen
            navigation.navigate('PancardManual');
          }}
        >
          <Text style={styles.manuallyButtonText}>{translate("Manually_Pan_Form")}</Text>
        </TouchableOpacity>
      </View>

   

  );
};
const styles = StyleSheet.create({
  manuallyButton: {
    backgroundColor: '#007bff', 
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  manuallyButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  main: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    paddingHorizontal: wScale(20),
    paddingVertical: hScale(20),
  },
  linear: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: wScale(10),
    paddingVertical: hScale(15)
  },
  svgimg: { alignItems: 'center', paddingBottom: hScale(10), paddingTop: hScale(10) },
  psaidrow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: wScale(8),
    marginRight: wScale(10),
    height: '100%',
    borderRadius: 5
  },
  paddingheadar: {
    fontSize: wScale(16),
    paddingVertical: hScale(10),
    fontWeight: 'bold', color: '#000'
  },
  psaidtext: { color: '#000', fontSize: wScale(16) },

  titletext: {
    fontSize: wScale(20),
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#d5c64a',
    paddingTop: hScale(10),
    paddingBottom: hScale(20)
  },
  description: {
    fontSize: wScale(20),
    color: '#000',
    textAlign: 'justify',
    width: '100%',
    fontWeight: 'bold'
  },
  btnrow: {
    flexDirection: 'row', 
    justifyContent: 'space-between',
     alignItems: 'center',
    paddingTop: hScale(20),
  },
  checkstatus: {
    minWidth:'30%',
    maxWidth:'70%',
  },
  empty: { marginBottom: hScale(40) },
  loginButton: {
    fontSize: wScale(13),
    color: '#fff',
    fontWeight: 'bold'
  },
  psaIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hScale(30),
    borderRadius: 10,
    paddingVertical: hScale(15),
    paddingHorizontal: wScale(10),
  },
  psaIdLabel: {
    fontSize: wScale(20),
    marginRight: wScale(12),
  },
  psaIdValue: {
    fontSize: wScale(20),
    fontWeight: 'bold',
    textAlign: 'left',
    flex: 1
  },
});
export default PanCardScreen;


