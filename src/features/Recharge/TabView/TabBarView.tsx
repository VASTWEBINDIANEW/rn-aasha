import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { State } from 'react-native-gesture-handler';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import CheckBalSvg from '../../drawer/svgimgcomponents/CheckBlreporSvg';
import CheckSvg from '../../drawer/svgimgcomponents/CheckSvg';

const TabBar = ({ onPress1, onPress2, Selected, Unselected, tabButtonstyle,tabTextstyle }) => {
  const { colorConfig } = useSelector((State: RootState) => State.userInfo)
  const [selectedTab, setSelectedTab] = useState(1);

  const handleTabPress = tabNumber => {
    setSelectedTab(tabNumber);
    // Check which tab is pressed and call corresponding onPress function
    if (tabNumber === 1 && onPress1) {
      onPress1();
    } else if (tabNumber === 2 && onPress2) {
      onPress2();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.tabButton, { borderColor: colorConfig.secondaryColor }, tabButtonstyle,
          selectedTab === 1 ? { backgroundColor: colorConfig.secondaryColor } : styles.unselectedTab,
        ]}
        onPress={() => handleTabPress(1)}>
        <Text style={[styles.tabText,tabTextstyle, { color: colorConfig.secondaryColor }, selectedTab === 1 ? styles.selectedTabtext : styles.unselectedTab]}>{selectedTab === 1 ? Selected : Selected}</Text>
        <View
          style={[
            styles.rightbutn, { borderColor: colorConfig.secondaryColor },
            selectedTab === 1 && styles.rightbutn2,
          ]}>
          {selectedTab === 1 && (
            // <Text style={[styles.selectedButtonText, {}]}>✓</Text>
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
        <Text style={[styles.tabText,tabTextstyle, { color: colorConfig.secondaryColor }, selectedTab === 2 ? styles.selectedTabtext : styles.unselectedTab]}>{selectedTab === 2 ? Unselected : Unselected}</Text>
        <View
          style={[
            styles.rightbutn, { borderColor: colorConfig.secondaryColor },
            selectedTab === 2 && styles.rightbutn2,
          ]}>
          {selectedTab === 2 && (
            // <Text style={[styles.selectedButtonText, {}]}>✓</Text>
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
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: hScale(10),
    borderWidth: wScale(.5),
    borderRadius: 100,
    width: "38%",
    flexDirection: 'row-reverse',
    paddingHorizontal: wScale(10),

  },
  selectedTabtext: {
    color: '#fff'
  },
  unselectedTab: {
    // You can customize the style for unselected tabs here
  },
  tabText: {
    fontSize: wScale(18),
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
});

export default TabBar;
