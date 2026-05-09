import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import Svg, { Path, Circle, Defs, RadialGradient, Stop, G } from 'react-native-svg';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store/index';

const { width, height } = Dimensions.get('window');

type BlockedMessageProps = {
  message: string;
  onButtonPress?: () => void;
  buttonText?: string;
};

const BlockedMessageAnimated: React.FC<BlockedMessageProps> = ({
  message,
  onButtonPress,
  buttonText = 'Go Back to Safety',
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const ringAnim = useRef(new Animated.Value(0)).current;
  const shieldAnim = useRef(new Animated.Value(0)).current;
  const { colorConfig, Loc_Data, deviceInfo, isDemoUser } = useSelector((state: RootState) => state.userInfo);

  const [particles] = useState(() =>
    Array.from({ length: 12 }).map((_, i) => ({
      angle: (i / 12) * Math.PI * 2,
      radius: Math.random() * 40 + 80,
      size: Math.random() * 4 + 2,
      opacity: new Animated.Value(0),
      orbitAnim: new Animated.Value(0),
      delay: i * 150,
    }))
  );

  useEffect(() => {
    // Entrance
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, friction: 9, tension: 60, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, tension: 50, useNativeDriver: true }),
      Animated.timing(shieldAnim, { toValue: 1, duration: 900, delay: 300, useNativeDriver: true }),
    ]).start();

    // Pulse ring
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.15, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    // Orbit ring rotation
    Animated.loop(
      Animated.timing(ringAnim, { toValue: 1, duration: 8000, useNativeDriver: true })
    ).start();

    // Particles appear
    particles.forEach((p) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(p.delay),
          Animated.timing(p.opacity, { toValue: 0.7, duration: 600, useNativeDriver: true }),
          Animated.timing(p.opacity, { toValue: 0.1, duration: 1200, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  const ringRotate = ringAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const shieldScale = shieldAnim.interpolate({
    inputRange: [0, 0.5, 0.8, 1],
    outputRange: [0, 1.2, 0.9, 1],
  });

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* Deep background */}
      <LinearGradient
        colors={['#03060F', '#060D1E', '#0A0418']}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient glow top */}
      <View style={styles.glowTop} pointerEvents="none" />
      {/* Ambient glow bottom */}
      <View style={styles.glowBottom} pointerEvents="none" />

      {/* Noise texture overlay (subtle) */}
      <View style={styles.noiseOverlay} pointerEvents="none" />

      {/* Card */}
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          },
        ]}
      >
        {/* Card inner border glow */}
        <View style={styles.cardBorderGlow} />

        {/* Icon section */}
        <View style={styles.iconSection}>
          {/* Outer pulse ring */}
          <Animated.View
            style={[
              styles.pulseRing,
              { transform: [{ scale: pulseAnim }] },
            ]}
          />

          {/* Orbit ring */}
          <Animated.View
            style={[
              styles.orbitRing,
              { transform: [{ rotate: ringRotate }] },
            ]}
          >
            {particles.slice(0, 6).map((p, i) => (
              <Animated.View
                key={i}
                style={[
                  styles.orbitDot,
                  {
                    opacity: p.opacity,
                    width: p.size,
                    height: p.size,
                    borderRadius: p.size / 2,
                    transform: [
                      { rotate: `${i * 60}deg` },
                      { translateX: 52 },
                    ],
                  },
                ]}
              />
            ))}
          </Animated.View>

          {/* Main icon circle */}
          <Animated.View
            style={[styles.iconCircle, { transform: [{ scale: shieldScale }] }]}
          >
            <LinearGradient
              colors={['rgba(255,70,70,0.18)', 'rgba(180,20,20,0.08)']}
              style={styles.iconGradientBg}
            >
              <Svg width={wScale(38)} height={wScale(38)} viewBox="0 0 24 24" fill="none">
                <Defs>
                  <RadialGradient id="sg" cx="50%" cy="30%" r="60%">
                    <Stop offset="0%" stopColor="#FF6B6B" />
                    <Stop offset="100%" stopColor="#C0392B" />
                  </RadialGradient>
                </Defs>
                {/* Shield shape */}
                <Path
                  d="M12 2L4 6V12C4 16.418 7.582 20.337 12 21.5C16.418 20.337 20 16.418 20 12V6L12 2Z"
                  fill="url(#sg)"
                  opacity={0.15}
                />
                <Path
                  d="M12 2L4 6V12C4 16.418 7.582 20.337 12 21.5C16.418 20.337 20 16.418 20 12V6L12 2Z"
                  stroke="#FF5252"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                {/* X mark */}
                <Path
                  d="M9.5 9.5L14.5 14.5M14.5 9.5L9.5 14.5"
                  stroke="#FF5252"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </Svg>
            </LinearGradient>
          </Animated.View>
        </View>

        {/* Divider line with glow */}
        <View style={styles.topDivider} />

        {/* Title */}
        <Text style={styles.title}>Access{'\n'}Restricted</Text>

        {/* Subtitle badge */}
        <View style={styles.badge}>
          <View style={styles.badgeDot} />
          <Text style={styles.badgeText}>SECURITY ALERT</Text>
        </View>

        {/* Message box */}
        <View style={styles.messageBox}>
          <Text style={styles.messageText}>{message}</Text>
        </View>

        {/* Thin decorative line */}
        <View style={styles.thinLine} />

        {/* Info row */}
        <View style={styles.infoRow}>
          {['Blocked', 'Monitored', 'Logged'].map((label, i) => (
            <View key={i} style={styles.infoChip}>
              <View style={[styles.chipDot, i === 0 && styles.chipDotRed]} />
              <Text style={styles.chipLabel}>{label}</Text>
            </View>
          ))}
        </View>

     
        {/* Footer */}
        <Text style={styles.footer}>PROTECTED BY SECURITY SYSTEM · v2.0</Text>
      </Animated.View>
    </View>
  );
};

const CARD_WIDTH = width * 0.88;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowTop: {
    position: 'absolute',
    top: -height * 0.1,
    left: width * 0.1,
    width: width * 0.8,
    height: height * 0.45,
    backgroundColor: '#FF2020',
    opacity: 0.045,
    borderRadius: 999,
    transform: [{ scaleX: 1.4 }],
  },
  glowBottom: {
    position: 'absolute',
    bottom: -height * 0.05,
    right: -width * 0.1,
    width: width * 0.7,
    height: height * 0.35,
    backgroundColor: '#7B00FF',
    opacity: 0.04,
    borderRadius: 999,
  },
  noiseOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.015,
    backgroundColor: '#fff',
  },

  // Card
  card: {
    width: CARD_WIDTH,
    borderRadius: 28,
    backgroundColor: 'rgba(12, 16, 30, 0.92)',
    borderWidth: 1,
    borderColor: 'rgba(255, 80, 80, 0.18)',
    alignItems: 'center',
    paddingHorizontal: wScale(24),
    paddingTop: hScale(10),
    paddingBottom: hScale(28),
    ...Platform.select({
      ios: {
        shadowColor: '#FF3030',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 30,
      },
      android: { elevation: 18 },
    }),
  },
  cardBorderGlow: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 100, 100, 0.35)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },

  // Icon area
  iconSection: {
    marginTop: hScale(28),
    marginBottom: hScale(22),
    width: wScale(120),
    height: wScale(120),
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: wScale(110),
    height: wScale(110),
    borderRadius: wScale(55),
    borderWidth: 1,
    borderColor: 'rgba(255,60,60,0.2)',
  },
  orbitRing: {
    position: 'absolute',
    width: wScale(112),
    height: wScale(112),
    justifyContent: 'center',
    alignItems: 'center',
  },
  orbitDot: {
    position: 'absolute',
    backgroundColor: '#FF5252',
  },
  iconCircle: {
    width: wScale(82),
    height: wScale(82),
    borderRadius: wScale(41),
    borderWidth: 1.5,
    borderColor: 'rgba(255, 80, 80, 0.3)',
    overflow: 'hidden',
  },
  iconGradientBg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Top divider
  topDivider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: hScale(20),
  },

  // Title
  title: {
    fontSize: wScale(30),
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: wScale(34),
    marginBottom: hScale(14),
  },

  // Badge
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,50,50,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,50,50,0.25)',
    borderRadius: 100,
    paddingHorizontal: wScale(10),
    paddingVertical: hScale(4),
    marginBottom: hScale(20),
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#FF4444',
    marginRight: 6,
  },
  badgeText: {
    fontSize: wScale(9),
    color: '#FF6B6B',
    fontWeight: '700',
    letterSpacing: 2,
  },

  // Message
  messageBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    paddingHorizontal: wScale(18),
    paddingVertical: hScale(14),
    marginBottom: hScale(20),
    width: '100%',
  },
  messageText: {
    fontSize: wScale(14),
    color: 'rgba(200, 210, 230, 0.85)',
    textAlign: 'center',
    lineHeight: wScale(21),
    fontWeight: '400',
    letterSpacing: 0.2,
  },

  // Thin line
  thinLine: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: hScale(16),
  },

  // Info chips row
  infoRow: {
    flexDirection: 'row',
    gap: wScale(8),
    marginBottom: hScale(22),
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 100,
    paddingHorizontal: wScale(10),
    paddingVertical: hScale(5),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  chipDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(255,255,255,0.3)',
    marginRight: 5,
  },
  chipDotRed: {
    backgroundColor: '#FF4444',
  },
  chipLabel: {
    fontSize: wScale(10),
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Button
  btnWrapper: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: hScale(16),
    ...Platform.select({
      ios: {
        shadowColor: '#FF3030',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  btn: {
    flexDirection: 'row',
    paddingVertical: hScale(16),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    overflow: 'hidden',
  },
  btnShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  btnText: {
    color: '#FFFFFF',
    fontSize: wScale(15),
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Footer
  footer: {
    fontSize: wScale(8.5),
    color: 'rgba(255,255,255,0.18)',
    letterSpacing: 1.8,
    fontWeight: '600',
  },
});

export default BlockedMessageAnimated;