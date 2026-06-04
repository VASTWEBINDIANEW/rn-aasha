import React, { useEffect, useId, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
// import { createDrawerNavigator } from "@react-navigation-drawer";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  createDrawerNavigator,
} from '@react-navigation/drawer';
import Profile from './Profile';
import Help_And from './Help';
import Security from './Security';
import ReferAndEran from './ReferAndEran';
import Administrator from './Administrator';
import Logout from './Logout';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SvgXml } from 'react-native-svg';
import LinearGradient from 'react-native-linear-gradient';
import Setting from './Setting';
import MenuPage from './MenuPage/Menu';

import { translate } from '../../utils/languageUtils/I18n';
import { hScale, wScale } from '../../utils/styles/dimensions';
import DashboardScreen from '../dashboard/DashboardScreen';
import Privacy from './privacy';
import { useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import { colors } from '../../utils/styles/theme';
import LoginScreen from '../login/LoginScreen';
import { APP_URLS } from '../../utils/network/urls';
import { url } from 'inspector';
import useAxiosHook from '../../utils/network/AxiosClient';
import { decryptData } from '../../utils/encryptionUtils';
import Notifications from './Notifications';
import Mpin from './securityPages/Mpin';
import Entypo from 'react-native-vector-icons/Entypo';  // or another icon set like MaterialIcons
import LoginReport from './securityPages/LoginReport';
import BorderLine from '../../components/BorderLine';

const Drawer = createDrawerNavigator();
const DrawerNavigation = ({ navigation }) => {
  const { get } = useAxiosHook()
  const { colorConfig, IsDealer, userId } = useSelector((state: RootState) => state.userInfo)
  const Next = `
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="18" height="18" stroke="#000000" stroke-width="30" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M149.3 481c-3 0-6-1.1-8.2-3.4-4.6-4.6-4.6-11.9 0-16.5L346.2 256 141.1 50.9c-4.6-4.6-4.6-11.9 0-16.5s11.9-4.6 16.5 0l213.3 213.3c4.6 4.6 4.6 11.9 0 16.5L157.6 477.6c-2.3 2.3-5.3 3.4-8.3 3.4z" fill="#000000" opacity="1" data-original="#000000" class=""></path></g></svg>
`;
  const Profileimg = `
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 32 32" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><circle cx="16" cy="8.5" r="6.5" fill="#5c5b5b" opacity="1" data-original="#000000" class=""></circle><path d="M5.53 25.47c-.01.3.12.6.35.8C8.72 28.67 12.31 30 16 30s7.28-1.33 10.12-3.73c.23-.2.36-.5.35-.8-.15-4.19-2.77-7.88-6.67-9.4a1.02 1.02 0 0 0-.71-.01c-1.96.71-4.22.71-6.18 0a1.02 1.02 0 0 0-.71.01c-3.9 1.52-6.52 5.21-6.67 9.4z" fill="#5c5b5b" opacity="1" data-original="#000000" class=""></path></g></svg>

`;

  const Settingimg = `
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><linearGradient id="a" x1="137.796" x2="366.321" y1="351.63" y2="123.105" gradientUnits="userSpaceOnUse"><stop stop-opacity="1" stop-color="#2a2929" offset="0"></stop><stop stop-opacity="1" stop-color="#646362" offset="1"></stop></linearGradient><path fill="url(#a)" d="M410.754 342.109a61.478 61.478 0 0 1-42.898 7.001 4.003 4.003 0 0 0-3.626 1.1l-88.67 88.647c-9.359 9.356-24.578 9.365-33.941.01l-11.47-11.461c-9.373-9.365-9.368-24.589 0-33.956l88.632-88.636a3.87 3.87 0 0 0 1.087-3.655 61.423 61.423 0 0 1 4.241-37.537c15.929-35.19 60.389-47.382 91.974-24.427l1.195.868-37.702 21.788c-11.31 6.535-15.204 21.081-8.685 32.397s21.092 15.212 32.396 8.679l37.7-21.786.158 1.467c2.596 24.194-9.32 47.347-30.391 59.501zm-177.68-2.741c-16.311 0-31.479 8.813-39.618 22.942-4.172 7.243-12.85 10.263-20.616 7.164-14.542-5.804-28.167-13.718-40.455-23.42-6.549-5.17-8.262-14.203-4.075-21.418 17.515-30.181-4.259-68.587-39.666-68.587-8.347 0-15.315-6.014-16.493-14.284a166.387 166.387 0 0 1 0-46.722c1.184-8.306 8.143-14.284 16.587-14.284 35.172 0 57.139-38.308 39.572-68.587-4.186-7.215-2.472-16.242 4.074-21.413 12.289-9.706 25.911-17.624 40.455-23.43 7.767-3.1 16.442-.067 20.616 7.173 17.597 30.527 61.729 30.485 79.235.001a16.582 16.582 0 0 1 20.617-7.174 162.773 162.773 0 0 1 40.501 23.43c6.542 5.164 8.241 14.204 4.076 21.411-17.523 30.317 4.202 68.588 39.665 68.588 8.355 0 15.245 6.026 16.446 14.281 1.376 9.456 1.695 16.774 1.695 26.127l-1.159-.246c-47.095-10.003-91.025 30.287-82.998 79.692l-49.271 49.285c-8.572-6.877-18.126-10.529-29.188-10.529zm0-60.206c33.504 0 60.792-27.251 60.792-60.763 0-33.509-27.293-60.749-60.792-60.749-33.504 0-60.745 27.247-60.745 60.749 0 33.506 27.234 60.763 60.745 60.763z" opacity="1" data-original="url(#a)" class=""></path></g></svg>`;
  const Help = `
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 32 32" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><g data-name="Layer 2"><path d="M23.917 13.75v3.493a1.751 1.751 0 0 0 1.746 1.75 1.779 1.779 0 0 0 .398-.045l1.558-.36a2.737 2.737 0 0 0 2.131-2.679v-1.818a2.737 2.737 0 0 0-2.13-2.68l-1.56-.36a1.766 1.766 0 0 0-.791.002 9.406 9.406 0 0 0-18.538 0 1.76 1.76 0 0 0-.792-.001l-1.558.36A2.737 2.737 0 0 0 2.25 14.09v1.818a2.737 2.737 0 0 0 2.13 2.68l1.56.36a1.785 1.785 0 0 0 .397.045 1.751 1.751 0 0 0 1.746-1.75v-4.578a7.917 7.917 0 0 1 15.834 0zM18.5 25.5a2.253 2.253 0 0 0-2.25-2.25c-.06 0-.115.013-.173.018a.713.713 0 0 0-.2-.008 7.826 7.826 0 0 1-5.47-1.027 7.098 7.098 0 0 1-1.81-1.686.75.75 0 1 0-1.195.906 8.556 8.556 0 0 0 2.192 2.041 8.813 8.813 0 0 0 4.508 1.373A2.213 2.213 0 0 0 14 25.5a2.25 2.25 0 0 0 4.5 0z" fill="#636363" opacity="1" data-original="#000000" class=""></path><path d="M22.68 13.024a6.751 6.751 0 0 0-13.418 1.38 6.845 6.845 0 0 0 6.91 6.346H21.1a1.05 1.05 0 0 0 .63-1.89l-.617-.463a6.767 6.767 0 0 0 1.568-5.373zM13.5 14.75a.75.75 0 1 1 .75-.75.75.75 0 0 1-.75.75zm2.5 0a.75.75 0 1 1 .75-.75.75.75 0 0 1-.75.75zm2.5 0a.75.75 0 1 1 .75-.75.75.75 0 0 1-.75.75z" fill="#636363" opacity="1" data-original="#000000" class=""></path></g></g></svg>
`;
  const Securityimg = `
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 64 64" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M38.336 28.873H25.664a5.157 5.157 0 0 0-5.157 5.157v7.146a5.673 5.673 0 0 0 5.673 5.673h11.64a5.673 5.673 0 0 0 5.673-5.673V34.03a5.158 5.158 0 0 0-5.157-5.157zm2.454 12.564a3.01 3.01 0 0 1-3.01 3.01H26.22a3.01 3.01 0 0 1-3.01-3.01v-7.152a3.01 3.01 0 0 1 3.01-3.01h11.56a3.01 3.01 0 0 1 3.01 3.01zM25.664 27.952h1.731v-3.028a4.61 4.61 0 0 1 4.604-4.604 4.61 4.61 0 0 1 4.604 4.604v3.028h1.731c.495 0 .976.061 1.437.173v-3.201c0-4.286-3.487-7.772-7.772-7.772s-7.772 3.487-7.772 7.772v3.201a6.092 6.092 0 0 1 1.437-.173z" fill="#606060" opacity="1" data-original="#000000" class=""></path><path d="M36.955 32.704h-9.909a2.008 2.008 0 0 0-2.008 2.008v6.298c0 1.109.899 2.008 2.008 2.008h9.909a2.008 2.008 0 0 0 2.008-2.008v-6.298a2.01 2.01 0 0 0-2.008-2.008zm-3.783 5.521v1.778c0 .645-.527 1.172-1.172 1.172s-1.173-.527-1.173-1.172v-1.778a2.027 2.027 0 1 1 2.345 0z" fill="#606060" opacity="1" data-original="#000000" class=""></path><path d="M55.358 11.58 34.004 1.373a4.625 4.625 0 0 0-4.008 0L8.642 11.58A4.67 4.67 0 0 0 6 15.772c0 14.516 2.746 26.677 7.941 35.167C18.662 58.657 25.244 63.084 32 63.084c6.755 0 13.338-4.427 18.06-12.145C55.254 42.449 58 30.288 58 15.772a4.67 4.67 0 0 0-2.642-4.192zm-9.472 36.805C42.073 54.616 37.012 58.19 32 58.19s-10.073-3.574-13.885-9.805c-4.706-7.691-7.202-18.913-7.221-32.457L32 5.839l21.106 10.089c-.019 13.544-2.515 24.766-7.22 32.457z" fill="#606060" opacity="1" data-original="#000000" class=""></path></g></svg>`;
  const Refer = `
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 24 24" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M18 14c-.053 0-.1.014-.155.016l-3.028-5.178a4 4 0 1 0-5.632 0l-3.019 5.179C6.109 14.014 6.057 14 6 14a4 4 0 1 0 3.859 5h4.282A3.994 3.994 0 1 0 18 14zm-3.859 3H9.859a3.994 3.994 0 0 0-1.731-2.376l2.793-4.79a3.589 3.589 0 0 0 2.161 0l2.8 4.786A3.989 3.989 0 0 0 14.141 17z" fill="#606060" opacity="1" data-original="#000000" class=""></path></g></svg>
`;
  const Administratorimg = `
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 468 468" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path fill="#4f4f4f" d="M104.884 131.227h71.492v30.017h-71.492zM104.884 199.484h71.492v30.017h-71.492zM104.884 267.74h71.492v30.017h-71.492zM104.884 335.997h71.492v30.017h-71.492z" opacity="1" data-original="#4f4f4f"></path><path fill="#4f4f4f" d="M436.2 405.983V145.507c0-8.197-6.842-14.997-15.018-15.009l-186.74.218c-8.277.01-14.982 6.726-14.982 15.008v260.258H61.8V108.987l157.66-42.413v34.075h30V46.997c0-9.71-9.511-17.018-18.895-14.494L42.905 82.986A15.008 15.008 0 0 0 31.8 97.48v308.503H0V436h468v-30.017zm-73.084-68.985v28.016h-71.492v-28.016zm-71.492-40.241v-28.016h71.492v28.016zm71.492-68.257h-71.492v-28.016h71.492z" opacity="1" data-original="#4f4f4f"></path></g></svg>
`;
  const Logoutimg = `
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 32 32" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M21.089 20.435a1 1 0 0 0-1.004.996v3.308a.97.97 0 0 1-.996.996h-5.677a1 1 0 0 0-1.004.996v.008a.999.999 0 0 0 1.003.996h5.678a3.01 3.01 0 0 0 2.997-2.996v-3.3a1 1 0 0 0-.997-1.004z" fill="#4d4c4c" opacity="1" data-original="#000000" class=""></path><path d="M4.996.998C3.351.998 2 2.357 2 4.002v20.115c-.006 1.076.414 1.903.908 2.43.527.561 1.132.864 1.609 1.129l5.381 2.982c.813.451 1.76.435 2.547.037s1.41-1.272 1.41-2.318V9.937c0-.854-.214-1.577-.592-2.127s-.875-.889-1.307-1.15L5.925 2.998h13.163c.571 0 .998.433.998 1.004v4.244a1 1 0 1 0 2 0V4.002c0-1.645-1.354-3.004-2.998-3.004zm2.951 13.904c.198-.001.392.057.557.166l1.955 1.283a1 1 0 0 1 .283 1.386l-.002.003a1 1 0 0 1-1.381.279L7.41 16.744a1 1 0 0 1-.29-1.384l.003-.005a.999.999 0 0 1 .824-.453z" fill="#4d4c4c" opacity="1" data-original="#000000" class=""></path><path d="M25.192 11c.2.015.391.091.547.215l3.891 3.129c.335.334.368.564.368.785 0 .29-.126.576-.368.773l-3.891 3.129a1 1 0 1 1-1.256-1.556l1.68-1.352h-8.352a1 1 0 0 1 0-2h8.348l-1.676-1.344A1 1 0 0 1 25.192 11z" fill="#4d4c4c" opacity="1" data-original="#000000" class=""></path></g></svg>
`;

  const Privacysvg = `
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 48 48" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g transform="matrix(1.04,0,0,1.04,-0.9600000000000009,-0.959999961853029)"><path d="M39 11h-5V9a3.999 3.999 0 0 0-4-4H9a5.002 5.002 0 0 0-5 5v28a5.002 5.002 0 0 0 5 5h30a5.002 5.002 0 0 0 5-5V16a5.002 5.002 0 0 0-5-5zm-4.99 25.01a.99.99 0 0 1-1 1h-10a.997.997 0 0 1-1-1V27a1.003 1.003 0 0 1 1-1h1v-4.99a4 4 0 1 1 8 0V26h1a.997.997 0 0 1 1 1zM12 38a3 3 0 0 1-6 0V10a3.009 3.009 0 0 1 3-3h21a2.006 2.006 0 0 1 2 2v2H18a6.005 6.005 0 0 0-6 6zm18.01-12h-4v-4.99a2 2 0 0 1 4 0zm2 2v7.01h-8V28c1.42.02 6.59.02 8 0z" fill="#252525" opacity="1" data-original="#000000" class=""></path></g></svg>
`;
  const [renderCount, setRenderCount] = useState(0);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const onRender = () => {
    setRenderCount(renderCount + 1);
  };
  const [adminData, setAdminData] = useState<any>([]);

  useEffect(() => {
    const fetchData = async () => {



      if (!IsDealer) {
        const res = await get({ url: APP_URLS.getProfile })
        if (res.data) {
          setAdminData(JSON.parse(decryptData(res.value1, res.value2, res.data)));
          console.log(JSON.parse(decryptData(res.value1, res.value2, res.data)))

          const data = JSON.parse(decryptData(res.value1, res.value2, res.data))
          console.log(data.videokycstatus)


          if (data.videokycstatus === 'Y') {


            // Alert.alert(
            //   'Info',
            //   'Video kyc is pending',
            //   [
            //     {
            //       text: 'OK',  // Button text
            //       onPress: () => console.log('OK Pressed'),
            //     },
            //     {
            //       text: 'Procceed Video Kyc',  
            //       onPress: () => {
            //         navigation.navigate('VideoKYC');


            //       },
            //     },
            //   ],
            //   { cancelable: false }
            // );

          }
        }
      } else {
        const dealer_profile = await get({ url: `${APP_URLS.dealer_profile}dlmid=${userId}` })
        setAdminData(dealer_profile);

        console.log(dealer_profile, '******')
      }


    }

    fetchData();
  }, []);
  const Firmname = '';
  const [latestVersion, setLatestVersion] = useState([]);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const version = await get({ url: APP_URLS.current_version });
        setLatestVersion(version);
      } catch (error) {
        console.error('Version fetch error:', error);
      }
    };
    fetchVersion();
  }, []);

  return (
    <>
      <Drawer.Navigator
        drawerContentOptions={{}}
        screenOptions={{
          headerShown: false,
        }}
        drawerContent={props => {
          <DrawerContentScrollView>
            <DrawerItemList
              androidPressColor="rgba(255, 255, 255, 0.9)"
              {...props}
            />
          </DrawerContentScrollView>;

          return (
            <View >
              <LinearGradient colors={[colorConfig.primaryColor, colorConfig.secondaryColor]} style={{
                marginBottom: hScale(-20), zIndex: 99
              }}>
                <View style={styles.Safearea}>
                  <View style={styles.imgbg2}>
                    <View
                      style={[
                        styles.imgbg,
                        //  {borderRadius:renderCount === 0?10 :(renderCount=== 0?100:0)}
                      ]}
                    //  onLeayout={onRender}
                    >

                      {adminData && adminData.Photo ? <Image
                        source={{ uri: `http://${APP_URLS.baseWebUrl}${adminData.Photo}` }}
                        style={styles.userimg}
                      /> : <Image
                        source={require('./assets/bussiness-man.png')}
                        style={styles.userimg}
                      />}

                    </View>
                  </View>
                  <Text style={styles.framtext}>

                    {adminData && adminData.firmName ? adminData.firmName : APP_URLS.AppName}
                  </Text>


                </View>
              </LinearGradient>
              <ScrollView style={{}}>
                <View style={{ flex: 1 }}>
                  <DrawerItemList {...props} />
                  <View style={{ height: 230, }}>
                    <View style={styles.packageRow} >

                      <Text style={styles.prevText}>
                        {latestVersion.PackageName}
                      </Text>

                      <BorderLine height={'100%'} width={.5} />
                      <Text style={styles.prevText}>
                        App Version : V{latestVersion.currentversion}
                      </Text>
                    </View>
                  </View>


                </View>
              </ScrollView>
            </View>
          );
        }}
        screenOptions={{
          drawerStyle: {
            backgroundColor: 'white',
            width: wScale(340),
          },
          headerStyle: { backgroundColor: '#fff' },
          headerTintColor: '#000',
          drawerActiveTintColor: 'red',
          drawerActiveBackgroundColor: '#fff',

          drawerItemStyle: {
            paddingBottom: 2,
            borderBottomColor: colors.border,
            borderBottomWidth: hScale(1),
          },

          drawerLabelStyle: {
            color: '#000',
            marginLeft: -25,
            fontSize: wScale(16),
            textTransform: 'capitalize',
          },
        }}


      >
        <Drawer.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            headerShown: false,
            drawerItemStyle: {
              borderWidth: 0,
            },
            drawerLabel: () => null,
            title: undefined,
            drawerIcon: () => null,
          }}
        />
        <Drawer.Screen
          name="Profile"
          component={Profile}
          options={{
            title: '', headerShown: false,

            drawerLabel: translate('profile'),

            drawerIcon: ({ focused, size }) => (
              <>
                <SvgXml
                  xml={Profileimg}
                  width={wScale(25)}
                  height={hScale(25)}
                  style={styles.svgrightmargin}
                />
                <SvgXml xml={Next} style={styles.rightimg} />
              </>
            ),
          }}
        />

        <Drawer.Screen
          name="Setting"
          component={Setting}
          options={{
            title: '', headerShown: false,

            drawerLabel: translate('settings'),
            drawerIcon: ({ focused, size }) => (
              <>
                <SvgXml
                  xml={Settingimg}
                  width={wScale(25)}
                  height={hScale(25)}
                  style={styles.svgrightmargin}
                />
                <SvgXml xml={Next} style={styles.rightimg} />
              </>
            ),
          }}
        />
        <Drawer.Screen
          name="Help_And"
          component={Help_And}
          options={{
            title: '', headerShown: false,

            drawerLabel: translate('help'),
            drawerIcon: ({ focused, size }) => (
              <>
                <SvgXml
                  xml={Help}
                  width={wScale(25)}
                  height={hScale(25)}
                  style={styles.svgrightmargin}
                />
                <SvgXml xml={Next} style={styles.rightimg} />
              </>
            ),
          }}
        />
        <Drawer.Screen
          name="Security"
          component={Security}
          options={{
            title: '', headerShown: false,

            drawerLabel: translate('security'),
            drawerIcon: ({ focused, size }) => (
              <>
                <SvgXml
                  xml={Securityimg}
                  width={wScale(25)}
                  height={hScale(25)}
                  style={styles.svgrightmargin}
                />
                <SvgXml xml={Next} style={styles.rightimg} />
              </>
            ),
          }}
        />

        <Drawer.Screen
          name="Login Report"
          component={LoginReport}
          options={{
            title: '', headerShown: false,

            drawerLabel: translate('loginInfo'),
            drawerIcon: ({ focused, size }) => (
              <>
                <SvgXml
                  xml={Securityimg}
                  width={wScale(25)}
                  height={hScale(25)}
                  style={styles.svgrightmargin}
                />
                <SvgXml xml={Next} style={styles.rightimg} />
              </>
            ),
          }}
        />
        <Drawer.Screen
          name="ReferAndEran"
          component={ReferAndEran}
          options={{
            title: '', headerShown: false,

            drawerLabel: translate('refer'),
            drawerIcon: ({ focused, size }) => (
              <>
                <SvgXml
                  xml={Refer}
                  width={wScale(25)}
                  height={hScale(25)}
                  style={styles.svgrightmargin}
                />
                <SvgXml xml={Next} style={styles.rightimg} />
              </>
            ),
          }}
        />
        <Drawer.Screen
          name="Administrator"
          component={Administrator}
          options={{
            headerShown: false,

            drawerLabel: translate('administrator'),
            drawerIcon: ({ focused, size }) => (
              <>
                <SvgXml
                  xml={Administratorimg}
                  width={wScale(25)}
                  height={hScale(25)}
                  style={styles.svgrightmargin}
                />
                <SvgXml xml={Next} style={styles.rightimg} />
              </>
            ),
          }}
        />


        <Drawer.Screen name='Privacy Policy' component={Privacy}


          options={{
            drawerLabel: translate('privacy'),
            headerShown: false,

            drawerIcon: ({ focused, size }) => (
              <>
                <SvgXml
                  xml={Privacysvg}
                  width={wScale(25)}
                  height={hScale(25)}
                  style={styles.svgrightmargin}

                />

                <SvgXml
                  xml={Next}

                  style={[styles.rightimg,]}
                />

              </>
            ),
          }} />


        <Drawer.Screen name='Notifications' component={Notifications}


          options={{
            headerShown: false,

            drawerLabel: translate('Notifications'),

            drawerIcon: ({ focused, size }) => (
              <>
                <Entypo
                  style={{ left: wScale(-5) }}
                  name={"notification"}
                  size={wScale(25)}
                  color={'#000'}
                />
                <SvgXml
                  xml={Next}

                  style={styles.rightimg}
                />

              </>



            ),
            drawerItemStyle: {
              borderWidth: 0
            },



          }} />
        <Drawer.Screen name='Logout' component={Logout}
          listeners={{
            drawerItemPress: (e) => {
              e.preventDefault(); // Stop navigation
              setLogoutVisible(true); // Open modal
            },
          }}
          options={{
            headerShown: false,

            drawerLabel: translate('logout'),

            drawerIcon: ({ focused, size }) => (
              <>
                <SvgXml
                  xml={Logoutimg}
                  width={wScale(25)}
                  height={hScale(25)}
                  style={styles.svgrightmargin}

                />

                <SvgXml
                  xml={Next}

                  style={styles.rightimg}
                />

              </>



            ),
            drawerItemStyle: {
              borderWidth: 0
            },



          }} />


      </Drawer.Navigator>
      <Modal
        visible={logoutVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLogoutVisible(false)}
      >
        <Logout
          onClose={() => setLogoutVisible(false)}
        />
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  Safearea: {
    height: wScale(205),
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imgbg: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255, 255, 0.3)',
    padding: wScale(10),
    borderRadius: wScale(19),
    transform: [{ rotate: '4deg' }],
  },
  imgbg2: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255, 255, 0.2)',
    padding: wScale(6),
    borderRadius: wScale(16),
    transform: [{ rotate: '-4deg' }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.1,
    // shadowRadius: 16,
    elevation: 0,
    // paddingTop:8,
    // paddingBottom:8,
    // paddingRight:8,
    marginBottom: 5,
  },
  userimg: {
    width: wScale(110),
    height: hScale(102),
    //  height:110,
    transform: [{ rotate: '0deg' }],
  },
  framtext: { fontSize: wScale(18.7), color: 'white', bottom: hScale(2), fontWeight: 'bold' },
  rightimg: {
    marginRight: 8,
    position: 'absolute',
    right: wScale(-10),
    height: hScale(20),
    width: wScale(20),
  },
  svgrightmargin: {
    marginRight: 8,
    marginLeft: -8,
    width: wScale(25),
    height: wScale(25),
  },
  prevText: {
    fontSize: wScale(12),
    color: '#000',
    textAlign: 'center',
    paddingHorizontal: wScale(5),
    textAlignVertical: 'center'
  },
  packageRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center', height: hScale(12), marginTop: hScale(0),
  }

});
export default DrawerNavigation;
