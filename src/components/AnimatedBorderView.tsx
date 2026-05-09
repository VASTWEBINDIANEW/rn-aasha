import React, { useRef, useEffect } from 'react';
import { Animated, Text, StyleSheet, View, Easing } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../reduxUtils/store';
import { hScale, wScale } from '../utils/styles/dimensions';

export default function MovingDotBorderText({ title, children, height }) {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  const dotCount = 700;
  const duration = 8000;

  const colorSteps = [
    `${colorConfig.primaryColor}4D`,
    `${colorConfig.primaryColor}66`,
    `${colorConfig.primaryColor}99`,
    `${colorConfig.primaryColor}B3`,
    `${colorConfig.primaryColor}CC`,
    `${colorConfig.primaryColor}E6`,
    colorConfig.primaryColor,
    `${colorConfig.secondaryColor}4D`,
    `${colorConfig.secondaryColor}66`,
    `${colorConfig.secondaryColor}99`,
    `${colorConfig.secondaryColor}B3`,
    `${colorConfig.secondaryColor}CC`,
    `${colorConfig.secondaryColor}E6`,
    colorConfig.secondaryColor,
  ];

  const colors: string[] = colorSteps.flatMap((c) => Array(50).fill(c));
  colors.length = dotCount; // ensure exact number of dots

  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: duration,
        easing: Easing.linear,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  const boxWidth = wScale(380);
  const boxHeight = height || hScale(60);
  const dotSize = wScale(2);


  const perimeter = 2 * (boxWidth + boxHeight);

  const top = boxWidth;
  const right = boxHeight;
  const bottom = boxWidth;
  const left = boxHeight;

  return (
    <View style={styles.container}>
      <View style={[styles.borderBox, { width: boxWidth, height: boxHeight, }]}>
        {title ? <Text style={styles.text}>{title}</Text> : null}

        {children && <View style={{ width: '100%', height: '100%' }}>
          {children}
        </View>}
        {Array.from({ length: dotCount }).map((_, index) => {
          const offsetPhase = index / dotCount;

          const animatedPerimeter = Animated.modulo(
            Animated.add(
              anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, perimeter],
              }),
              offsetPhase * perimeter
            ),
            perimeter
          );

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotSize,
                  height: dotSize,
                  backgroundColor: colors[index % colors.length],
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  transform: [
                    {
                      translateX: animatedPerimeter.interpolate({
                        inputRange: [0, top, top + right, top + right + bottom, perimeter],
                        outputRange: [0, boxWidth, boxWidth, 0, 0],
                        extrapolate: 'clamp',
                      }),
                    },
                    {
                      translateY: animatedPerimeter.interpolate({
                        inputRange: [0, top, top + right, top + right + bottom, perimeter],
                        outputRange: [0, 0, boxHeight, boxHeight, 0],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: hScale(10),
  },
  borderBox: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    fontSize: wScale(18),
    paddingHorizontal: wScale(10),
    color: '#000',
    fontWeight: 'bold',
    textTransform: 'capitalize'
  },
  dot: {
    borderRadius: 1.5, // half of dotSize
  },
});
