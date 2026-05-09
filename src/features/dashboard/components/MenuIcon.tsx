import React from 'react';
import { Pressable, TouchableOpacity, View, StyleSheet } from 'react-native';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { SvgXml } from 'react-native-svg';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
const MenuIcon = () => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo)



  const setting = `

   
  <svg id="Icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><linearGradient id="Gradient_2_color" gradientUnits="userSpaceOnUse" x1="3.47" x2="20.53" y1="20.53" y2="3.47"><stop offset="0"
   stop-color=${'white'} /><stop offset="1"
    stop-color=${'white'}/></linearGradient><path d="m3 5.75h10.367c.329 1.151 1.378 2 2.633 2s2.304-.849 2.633-2h2.367c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-2.367c-.329-1.151-1.378-2-2.633-2s-2.304.849-2.633 2h-10.367c-.414 0-.75.336-.75.75s.336.75.75.75zm13-2c.689 0 1.25.561 1.25 1.25s-.561 1.25-1.25 1.25-1.25-.561-1.25-1.25.561-1.25 1.25-1.25zm5 14.5h-2.367c-.329-1.151-1.378-2-2.633-2s-2.304.849-2.633 2h-10.367c-.414 0-.75.336-.75.75s.336.75.75.75h10.367c.329 1.151 1.378 2 2.633 2s2.304-.849 2.633-2h2.367c.414 0 .75-.336.75-.75s-.336-.75-.75-.75zm-5 2c-.689 0-1.25-.561-1.25-1.25s.561-1.25 1.25-1.25 1.25.561 1.25 1.25-.561 1.25-1.25 1.25zm5-9h-10.367c-.329-1.151-1.378-2-2.633-2s-2.304.849-2.633 2h-2.367c-.414 0-.75.336-.75.75s.336.75.75.75h2.367c.329 1.151 1.378 2 2.633 2s2.304-.849 2.633-2h10.367c.414 0 .75-.336.75-.75s-.336-.75-.75-.75zm-13 2c-.689 0-1.25-.561-1.25-1.25s.561-1.25 1.25-1.25 1.25.561 1.25 1.25-.561 1.25-1.25 1.25z" fill="url(#Gradient_2_color)"/></svg>

  `;

  const navigation = useNavigation();
  return (
    <Pressable
      onPress={() => {
        navigation.dispatch(DrawerActions.openDrawer());
      }}
      style={styles.MenuDottcontainer}>

      <SvgXml xml={setting} width={wScale(40)} height={wScale(40)} />
    </Pressable>
  );
};
const styles = StyleSheet.create({

  MenuDottcontainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginRight: wScale(0),
  },
})

export default MenuIcon;
