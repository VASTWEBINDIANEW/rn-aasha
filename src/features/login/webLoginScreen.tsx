import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Platform, PermissionsAndroid, Text } from 'react-native';
import { WebView } from 'react-native-webview';

export default function WebLoginScreen({ route }) {
  const { username, password } = route?.params || {};
  const webViewRef = useRef(null);

  // स्क्रीन लोड होते ही Android पर लोकेशन परमिशन मांगें
  useEffect(() => {
    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'This portal requires access to your location to proceed.',
              buttonPositive: 'OK',
            }
          );
        } catch (err) {
          console.warn(err);
        }
      }
    };

    requestLocationPermission();
  }, []);

  const fillInputsJS = `
    setTimeout(function() {
      var userBox = document.querySelector('input[placeholder*="Email"]') 
                 || document.querySelector('input[placeholder*="Mobile"]') 
                 || document.querySelector('input[type="text"]');

      var passBox = document.querySelector('input[type="password"]');

      if (userBox && '${username}') {
        userBox.value = '${username}';
        userBox.dispatchEvent(new Event('input', { bubbles: true }));
        userBox.dispatchEvent(new Event('change', { bubbles: true }));
      }

      if (passBox && '${password}') {
        passBox.value = '${password}';
        passBox.dispatchEvent(new Event('input', { bubbles: true }));
        passBox.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }, 1500);
    true;
  `;

  return (
    <View style={styles.container}>
    
      <WebView
        ref={webViewRef}
        source={{ uri: 'https://www.basantiaddigitalpay.com/Home/Login' }}
        injectedJavaScript={fillInputsJS}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        
        geolocationEnabled={true}
        onGeolocationPermissionsShowPrompt={(event) => {
          event.preventDefault();
        }}
      />  
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});