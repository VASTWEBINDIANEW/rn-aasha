import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    BackHandler,
    Alert,
    Platform,
    StyleSheet
} from 'react-native';
import WebView from 'react-native-webview';
import { useNavigation } from '../../../../utils/navigation/NavigationService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAxiosHook from '../../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../../utils/network/urls';

const PayuPayment = (props) => {

    const {get,post}= useAxiosHook();
    const navigation = useNavigation();

    const { request, onPaymentResponse } = props.route.params;
    const [loading, setLoading] = useState(true); 
const [json,setJson]= useState({});
    useEffect(() => {
        getPayUParam();
        console.log(request);
        BackHandler.addEventListener('hardwareBackPress', backHandler);
        return () => {
            BackHandler.removeEventListener('hardwareBackPress', backHandler);
        };
    }, []);
    const getPayUParam = async () => {
        try {
          const storedPayUParam = await AsyncStorage.getItem('payUParam');
          console.log('...............................................')
          console.log(storedPayUParam)
          setJson(storedPayUParam)
          console.log('...............................................')
         // return storedPayUParam ? JSON.parse(storedPayUParam) : null;
        } catch (e) {
          console.error('Error retrieving payUParam', e);
          return null;
        }
      };
    const backHandler = () => {
        Alert.alert(
            null,
            "Do you really want to cancel the transaction?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                {
                    text: "OK", 
                    onPress: () => {
                        navigation.navigate('Dashboard');

                      //  sendResponse('User cancelled');
                        onPaymentResponse({ status: false, message: 'User cancelled' });
                        props.navigation.pop();
                    }
                }
            ]
        );
        return true;
    };
    const sendResponse = async (status,msg) => {
        const data ={
            mode:'PG',
            status:status,
            txnid:json.txnid,
            PG_TYPE:'PG',
            error_Message:status,
            amount:json.amount,
            bankcode:'1234',
            payuMoneyId:'1234',
            bank_ref_num:'1234',

        }
        try {
            const response = await post({url:'PaymentGateway/api/data/Gatewayresponse',data}); 
            
            console.log('Success:', response);
            
            onPaymentResponse({ status: true, message: 'Payment Successful' });
            
        } catch (error) {
            console.error('Error during async operation:', error);
            
            Alert.alert('Error', 'An error occurred while processing the request.');
            
            onPaymentResponse({ status: false, message: 'Payment Failed' });
        }
    };
    
    const onMessage = (response) => {
        
        console.log(response);
        const data = JSON.parse(response?.nativeEvent?.data);
        if (data.status === 'success') {
            onPaymentResponse(data);
            setLoading(false);
            props.navigation.pop();
        } else {
            Alert.alert('Payment Failed', data.message || 'An error occurred');
            onPaymentResponse(data);
            setLoading(false); 
            props.navigation.pop();
        }
    };

    const onNavigationStateChange = (navState) => {
        const { url } = navState;
    
        if (!url) return;
    
        const handleNavigationEnd = () => {
            setLoading(false);
            props.navigation.pop();
        };
    const failedUrl = APP_URLS.baseWebUrl;
        if (url.startsWith(json.txnsuccessUrl)) {
            sendResponse('Payment Done')

            onPaymentResponse({ status: true, message: 'Payment Successful' });

            handleNavigationEnd();
        } else if (url.startsWith(failedUrl)) {
            sendResponse('Failed')

            onPaymentResponse({ status: false, message: 'Payment Failed' });
            handleNavigationEnd();
        }
    };
    

    return (
        <View style={styles.container}>
            {loading && (
                <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Processing Payment...</Text>
                </View>
            )}

            <WebView
                source={{
                    uri: request.url,
                    method: "POST",
                    body: request.data
                }}
                javaScriptCanOpenWindowsAutomatically={true}
                javaScriptEnabled={true}
                onMessage={onMessage}
                scalesPageToFit={false}
                onLoadEnd={() => setLoading(false)}  // Hide loading when the webview finishes loading
                onNavigationStateChange={onNavigationStateChange} // Intercept URL changes
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1,
    },
    loadingText: {
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold',
    }
});

export default PayuPayment;
