import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Image } from 'react-native';
import { State } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import CheckBalSvg from '../../drawer/svgimgcomponents/CheckBlreporSvg';
import CheckSvg from '../../drawer/svgimgcomponents/CheckSvg';

const CmsAcHeader = ({ onPress1, onPress2, Selected, Unselected, tabButtonstyle, tabTextstyle }) => {
  const { colorConfig } = useSelector((State: RootState) => State.userInfo)
  const [selectedTab, setSelectedTab] = useState(1);

  const handleTabPress = tabNumber => {
    setSelectedTab(tabNumber);
    if (tabNumber === 1 && onPress1) {
      onPress1();
    } else if (tabNumber === 2 && onPress2) {
      onPress2();
    }
  };

  return (
    <View style={[styles.container,{borderColor:colorConfig.secondaryColor}]}>
      <Image style={styles.toimg} source={require('../../../../assets/images/radiant.png')} resizeMode='contain' />

      <TouchableOpacity
        style={[
          styles.tabButton, { borderColor: colorConfig.secondaryColor }, tabButtonstyle,
          selectedTab === 1 ? { backgroundColor: colorConfig.secondaryColor } : styles.unselectedTab,
        ]}
        onPress={() => handleTabPress(1)}>
        <Text style={[styles.tabText, tabTextstyle, { color: colorConfig.secondaryColor }, selectedTab === 1 ? styles.selectedTabtext : styles.unselectedTab]}>{selectedTab === 1 ? Selected : Selected}</Text>
        <View
          style={[
            styles.rightbutn, { borderColor: colorConfig.secondaryColor },
            selectedTab === 1 && styles.rightbutn2,
          ]}>
          {selectedTab === 1 && (
            <CheckSvg size={10} />
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabButton, { borderColor: colorConfig.secondaryColor }, tabButtonstyle,
          selectedTab === 2 ? { backgroundColor: colorConfig.secondaryColor } : styles.unselectedTab,
        ]}
        onPress={() => handleTabPress(2)}>
        <Text style={[styles.tabText, tabTextstyle, { color: colorConfig.secondaryColor }, selectedTab === 2 ? styles.selectedTabtext : styles.unselectedTab]}>{selectedTab === 2 ? Unselected : Unselected}</Text>
        <View
          style={[
            styles.rightbutn, { borderColor: colorConfig.secondaryColor },
            selectedTab === 2 && styles.rightbutn2,
          ]}>
          {selectedTab === 2 && (
            <CheckSvg size={10} />

          )}
        </View>
      </TouchableOpacity>
    </View>


  );
};

const styles = StyleSheet.create({

  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flex: 1,
    borderWidth:2,
    paddingHorizontal:wScale(2),
    paddingVertical:hScale(5),
    borderRadius:5
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: hScale(10),
    borderWidth: wScale(.5),
    borderRadius: 100,
    width: "38%",
    flexDirection: 'row-reverse',
    paddingHorizontal: wScale(5),

  },
  selectedTabtext: {
    color: '#fff'
  },
  unselectedTab: {
  },
  tabText: {
    fontSize: wScale(15),
    fontWeight: 'bold',
    color: '#000'
  },
  rightbutn: {
    borderWidth: wScale(1),
    borderColor: '#000',
    borderRadius: 20,
    height: wScale(22),
    width: wScale(22),
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightbutn2: {
    borderColor: '#fff',
  },
  selectedButtonText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: wScale(13)
  },
  toimg: {
    width: wScale(80),
    height: wScale(80),
    elevation: 5
  },
});

export default CmsAcHeader;
