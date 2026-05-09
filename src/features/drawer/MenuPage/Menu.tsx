import React from 'react';
import {StyleSheet, View} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

const MenuPage = ({onPress}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.MenuDottcontainer}>
        <View style={[styles.oval]} />
        <View style={[styles.oval]} />
        <View style={[styles.oval]} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  oval: {
    width: 12,
    height: 11,
    backgroundColor: 'black',
    //borderWidth:2,
    //borderColor:'black',
    // marginVertical:2
  },
  MenuDottcontainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
    marginRight: 10,
  },
});
export default MenuPage;
