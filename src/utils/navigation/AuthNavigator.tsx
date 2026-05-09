import React from 'react';

import {createNativeStackNavigator} from '@react-navigation/native-stack';
import LoginScreen from '../../features/login/LoginScreen';
import SignUpScreen from '../../features/signup/SignUpScreen';
import PlaneGameScreen from '../../test';
import LanguageSettings from '../../features/drawer/settingPages/LanguageSettings';

const Stack = createNativeStackNavigator();

export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
      }}
      initialRouteName="LoginScreen">
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        <Stack.Screen name="LanguageSettings" component={LanguageSettings} />
    </Stack.Navigator>
  );
};
