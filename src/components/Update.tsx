import { translate } from "../utils/languageUtils/I18n";
import React, { useState } from "react";
import { Animated, TouchableOpacity,Text,View, Image, Easing, Linking} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { wScale } from "../utils/styles/dimensions";
import { APP_URLS } from "../utils/network/urls";

const Update =(isVer)=>{
    const [fadeAnim] = useState(new Animated.Value(0));

    const fadeIn = () => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    };
  
    if (isVer) {
      fadeIn();
  
      return (
        <LinearGradient
          colors={['#4c669f', '#3b5998', '#192f5d']}
          style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
        >
          <Animated.View
            style={{
              opacity: fadeAnim,
              width: '80%',
              backgroundColor: 'white',
              borderRadius: 10,
              padding: 20,
              elevation: 5, // Add shadow effect for elevation (Android)
              shadowColor: '#000', // Shadow for iOS
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#333',
                textAlign: 'center',
                marginBottom: 20,
              }}
            >{translate("Update_Available")}</Text>
            <Text
              style={{
                fontSize: 16,
                textAlign: 'center',
                marginBottom: 20,
                color: '#555',
              }}
            >{translate("key_sorryfor_137")}</Text>
  
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(`https://${APP_URLS.baseWebUrl}/Home/DownloadAPK`).catch(err =>
                  console.error('Failed to open URL: ', err)
                );
              }}
              style={{
                backgroundColor: '#008CBA',
                paddingVertical: 12,
                paddingHorizontal: 30,
                borderRadius: 30,
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                marginBottom: 10,
                elevation: 5,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >{translate("Update_Now")}</Text>
            </TouchableOpacity>
  
            <Text
              style={{
                fontSize: 14,
                textAlign: 'center',
                color: '#888',
              }}
            >{translate("key_iftheapp_186")}</Text>
          </Animated.View>
        </LinearGradient>
      );
    }
  
    if (loading) {
      return (
        <View style={{
          flex: 1,
          backgroundColor: '#87ceeb',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Image source={require('../../../assets/images/app_logo.png')}
            style={[styles.imgstyle, {
              width: wScale(180),
              height: wScale(180),
            }]} resizeMode='contain' />
        </View>
      );
    }
}

export default Update;
