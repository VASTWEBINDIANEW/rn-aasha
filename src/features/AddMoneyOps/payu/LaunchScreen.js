/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Button,
} from 'react-native';
import { useIsFocused } from '@react-navigation/native';

const LaunchScreen = ({ navigation }) => {
 
  return (
    <ScrollView>
      <View style={styles.container}>
        <Text>Weclome!</Text>
  

        <View style={{  padding: 10,flexDirection: 'column', justifyContent: 'space-between' }}>
          <Button
            title="Core PG"
            onPress={() => {
              navigation.navigate('SeamlessScreen');
            }}
          />
           {/* Todo: UPI Demo App implementation */}
          <Button
            title="UPI"
            onPress={() => {
              navigation.navigate('SeamlessScreen');
            }}
          />
          {/* Todo: Custom Browser Demo App implementation */}
          <Button
            title="Custom Browser"
            onPress={() => {
              navigation.navigate('SeamlessScreen');
            }}
          />
        </View>
      </View>
      <View style={styles.box} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  item: {
    padding: 16,
  },
  textinput: {
    height: 40,
    padding: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 20,    
  },
  box: {
    height: 300,
  },
});

export default LaunchScreen;
