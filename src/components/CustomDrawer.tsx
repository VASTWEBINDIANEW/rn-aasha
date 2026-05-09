import { translate } from "../utils/languageUtils/I18n";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from '@react-navigation/drawer';
import React from 'react';
import {View, Text, Pressable} from 'react-native';
import { hScale } from '../utils/styles/dimensions';

const CustomDrawer = props => {
  return (
    <View style={{flex: 1}}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{backgroundColor: 'red',marginBottom:hScale(-30)}}>
        <View
          style={{
            flexDirection: 'row',
            padding: 30,
            backgroundColor: 'black',
            alignItems: 'center',
          }}>
          <Text>{'Test'}</Text>
        </View>
        <View style={{padding: 20}}>
          <DrawerItemList {...props} />
        </View>
        <View>
          <Pressable>
            <Text>{translate("Logout")}</Text>
          </Pressable>
        </View>
      </DrawerContentScrollView>
    </View>
  );
};

export default CustomDrawer;
