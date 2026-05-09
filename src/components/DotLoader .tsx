import React, { useEffect, useState } from 'react';
import { View, Animated, Easing, Text, StyleSheet } from 'react-native';
import { wScale } from '../utils/styles/dimensions';
import { useSelector } from 'react-redux';
import { RootState } from '../reduxUtils/store';

const SecondaryColor = '#FF6347'; 
const TextColor = '#FFFFFF';  

const DotLoader = ({ color = SecondaryColor }) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  const [scale] = useState(new Animated.Value(1));

  useEffect(() => {
    const animate = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.5,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animate();
  }, [scale]);

  return (
    <View style={styles.main}>
      {[...Array(4)].map((_, index) => (
        <Animated.View key={index} style={[styles.box, { transform: [{ scale }], backgroundColor: colorConfig.primaryColor }]}>
        </Animated.View>
      ))}
    </View>
  );
};

const DotLoaderWhiteColor = () => {
  return <DotLoader color={TextColor} />;
};

export { DotLoader, DotLoaderWhiteColor };

const styles = StyleSheet.create({
    main: {
    flexDirection: 'row',
    justifyContent:'center',
  },
  box: {
    width: wScale(8),
    height: wScale(8),
    borderRadius: 8,
    marginHorizontal: wScale(1)
  },

});
