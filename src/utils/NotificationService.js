import { AppState, PermissionsAndroid, Platform } from "react-native";
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidStyle } from '@notifee/react-native';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setFcmToken } from "../reduxUtils/store/userInfoSlice";

const CHANNEL_ID = 'CHANNEL_ID';

export const requestPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
};

export async function listenFCMDeviceToken(dispatch) {
    if (messaging().isDeviceRegisteredForRemoteMessages) {
        const FCMToken = await messaging().getToken().catch(e => console.log("Token Error:", e));
        console.log('**TOKEN', FCMToken);
        
        if (FCMToken && dispatch) {
            dispatch(setFcmToken(FCMToken));
        }

        messaging().onTokenRefresh((refreshedToken) => {
            if (dispatch) dispatch(setFcmToken(refreshedToken));
        });
    }
}

export async function onReceiveNotification(notification) {
    // Firestore sync
    await readNotifications();

    if (AppState.currentState === 'active') {
        const channelId = await notifee.createChannel({
            id: CHANNEL_ID,
            name: 'NOTIFICATIONS_CHANNEL',
            importance: 4,
        });

        await notifee.displayNotification({
            title: notification.notification?.title || "New Notification",
            body: notification.notification?.body || "",
            android: {
                channelId,
                smallIcon: 'ic_launcher', 
                style: {
                    type: AndroidStyle.BIGPICTURE,
                    // Path check karein, agar crash ho toh require() hata kar string name use karein
                    picture: require('../../assets/images/app_logo.png'), 
                },
                pressAction: { id: 'default' },
            },
            data: notification.data,
        });
    }

    // Save to storage
    try {
        const notificationData = {
            title: notification.notification?.title,
            body: notification.notification?.body,
            createdAt: new Date().toISOString(),
        };
        const stored = await AsyncStorage.getItem('notifications');
        let notifications = stored ? JSON.parse(stored) : [];
        notifications.push(notificationData);
        await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
        console.error("Storage Error:", error);
    }
}
export async function onReceiveNotification2(notification) {
    // Firestore sync
    await readNotifications();

    if (AppState.currentState === 'active') {
        const channelId = await notifee.createChannel({
            id: CHANNEL_ID,
            name: 'NOTIFICATIONS_CHANNEL',
            importance: 4,
        });

        await notifee.displayNotification({
            title: notification.notification?.title || "New Notification",
            body: notification.notification?.body || "",
            android: {
                channelId,
                smallIcon: 'ic_launcher', 
                style: {
                    type: AndroidStyle.BIGPICTURE,
                    // Path check karein, agar crash ho toh require() hata kar string name use karein
                    picture: require('../../assets/images/app_logo.png'), 
                },
                pressAction: { id: 'default' },
            },
            data: notification.data,
        });
    }

    // Save to storage
    try {
        const notificationData = {
            title: notification.notification?.title,
            body: notification.notification?.body,
            createdAt: new Date().toISOString(),
        };
        const stored = await AsyncStorage.getItem('notifications');
        let notifications = stored ? JSON.parse(stored) : [];
        notifications.push(notificationData);
        await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
        console.error("Storage Error:", error);
    }
}
export const readNotifications = async () => {
    try {
        const snapshot = await firestore()
            .collection('notifications')
            .orderBy('createdAt', 'desc')
            .limit(10)
            .get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Firestore Error:', error);
    }
};

// --- YEH FIX HAI ---
const registerNotification = async (dispatch) => {
    await requestPermission();
    await listenFCMDeviceToken(dispatch);

    const unsubscribeOnMessage = messaging().onMessage(async (remoteMessage) => {
        await onReceiveNotification(remoteMessage);
    });

    return unsubscribeOnMessage;
};

// Isse Default Export banaya taaki aapka error chala jaye
export default registerNotification;
