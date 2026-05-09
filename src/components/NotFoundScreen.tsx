import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { hScale, wScale } from '../utils/styles/dimensions';
import CloseAadharSvg from '../features/drawer/svgimgcomponents/CloseAadharSvg';

const NotFoundScreen = ({ description, title2 }) => {
  const scaleValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // 0.74 Fix: Store the animation instance
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, { toValue: 1.1, duration: 600, useNativeDriver: true }),
        Animated.timing(scaleValue, { toValue: 1, duration: 600, useNativeDriver: true }),
      ])
    );

    animation.start();

    return () => {
      // Calling stop on the animation instance, not the value
      if (animation) animation.stop();
    };
  }, [scaleValue]);

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
              <CloseAadharSvg />
            </Animated.View>
          </View>
          <View style={styles.cutout} />
        </View>
        <Text style={styles.title}>{title2}</Text>
        <Text style={styles.desc}>{description}</Text>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: wScale(15), backgroundColor: '#c9c2c1' },
  card: { flex: 1, backgroundColor: '#fff', borderRadius: 15, alignItems: 'center', padding: 20 },
  headerSection: { alignItems: 'center', marginTop: hScale(20) },
  iconContainer: {
    backgroundColor: '#2a3d82',
    width: wScale(180),
    height: wScale(180),
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2
  },
  title: { fontSize: 28, fontWeight: 'bold', marginTop: hScale(50), textAlign: 'center' },
  desc: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 10 },
  cutout: {
    width: 0, height: 0,
    borderLeftWidth: 40, borderRightWidth: 40, borderTopWidth: 50,
    borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#2a3d82',
    marginTop: -10, zIndex: 1
  }
});

export default NotFoundScreen;
