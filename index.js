/* eslint-disable quotes */
import 'react-native-reanimated'; 
import 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { Buffer } from 'buffer';
import { enableScreens } from 'react-native-screens';
enableScreens(false); 
global.Buffer = Buffer;
import { BackHandler } from 'react-native';
if (!BackHandler.removeEventListener) {
  BackHandler.removeEventListener = () => {};
}

if (!__DEV__) {
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
}

import { AppRegistry, LogBox } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

import messaging from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";

const saveNotification = async (notification) => {
    try {
        const stored = await AsyncStorage.getItem('notifications');
        let notifications = stored ? JSON.parse(stored) : [];
        
        const notificationData = {
            title: notification.title,
            body: notification.body,
            createdAt: new Date().toISOString(),
        };

        notifications.unshift(notificationData);
        const limitedNotifications = notifications.slice(0, 20); 
        
        await AsyncStorage.setItem('notifications', JSON.stringify(limitedNotifications));
    } catch (e) {
    }
};

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    const { notification } = remoteMessage;
    if (notification) {
        await saveNotification(notification);
    }
});

notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.PRESS) {
    }
});

LogBox.ignoreAllLogs();
AppRegistry.registerComponent(appName, () => App);