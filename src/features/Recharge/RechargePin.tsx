import { translate } from "../../utils/languageUtils/I18n";

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Animated,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const PIN_LENGTH = 4;

// NPCI Brand Color Palette
const NPCI_BLUE_BG = '#0B1A30';   // Deep Navy Blue (Background)
const NPCI_BLUE_NEU = '#122643';  // Slightly Lighter Blue (Keys)
const NPCI_ORANGE = '#F47F20';    // Saffron Orange (Accents/Icons)
const NPCI_GREEN = '#00A651';     // Secure Green (Filled Dots)

const RechargePinRoute = () => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pressedKey, setPressedKey] = useState(null);
  const shakeAnim = useState(new Animated.Value(0))[0];

  const navigation = useNavigation();
  const route = useRoute();
  const { onPinSet } = route.params || {};

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const handleKeyPress = (key) => {
    if (key === 'backspace') {
      setPin((prev) => prev.slice(0, -1));
      return;
    }
    if (pin.length >= PIN_LENGTH) return;
    setPin((prev) => prev + key);
  };

  const savePin = (finalPin) => {
    if (!finalPin || finalPin.length < PIN_LENGTH) {
      triggerShake();
      Alert.alert('Invalid PIN', `Please enter a ${PIN_LENGTH}-digit PIN`);
      return;
    }
    if (typeof onPinSet === 'function') {
      onPinSet(finalPin);
    }
    navigation.goBack();
  };

  // auto-submit jab PIN pura ho jaye
  useEffect(() => {
    if (pin.length === PIN_LENGTH) {
      const timer = setTimeout(() => savePin(pin), 200);
      return () => clearTimeout(timer);
    }
  }, [pin]);

  const renderDots = () => {
    const dots = [];
    for (let i = 0; i < PIN_LENGTH; i++) {
      const filled = i < pin.length;
      dots.push(
        <View
          key={i}
          style={[
            styles.dot,
            filled ? styles.dotFilled : styles.dotEmpty,
          ]}
        >
          {filled && showPin && (
            <Text style={styles.dotDigit}>{pin[i]}</Text>
          )}
        </View>
      );
    }
    return dots;
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['eye', '0', 'backspace'],
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={NPCI_BLUE_BG} />
      <Text style={styles.title}>{translate("Enter_Transaction_PIN")}</Text>
      <Text style={styles.subTitle}>{translate("Your_PIN_is_secure")}</Text>

      <Animated.View
        style={[styles.dotsWrapper, { transform: [{ translateX: shakeAnim }] }]}
      >
        {renderDots()}
      </Animated.View>

      <View style={styles.keypad}>
        {keys.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.keyRow}>
            {row.map((key) => {
              const isPressed = pressedKey === key;
              
              return (
                <TouchableOpacity
                  key={key}
                  activeOpacity={1}
                  onPressIn={() => setPressedKey(key)}
                  onPressOut={() => setPressedKey(null)}
                  onPress={() => {
                    if (key === 'eye') {
                      setShowPin((prev) => !prev);
                    } else {
                      handleKeyPress(key);
                    }
                  }}
                  style={[
                    styles.key,
                    isPressed ? styles.keyPressed : styles.keyRaised,
                  ]}
                >
                  {key === 'backspace' ? (
                    <Icon name="backspace-outline" size={24} color={NPCI_ORANGE} />
                  ) : key === 'eye' ? (
                    <Icon
                      name={showPin ? 'eye-off-outline' : 'eye-outline'}
                      size={24}
                      color={NPCI_ORANGE}
                    />
                  ) : (
                    <Text style={styles.keyText}>{key}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
};

export default RechargePinRoute;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: NPCI_BLUE_BG,
    alignItems: 'center',
    paddingTop: 90,
    paddingHorizontal: 24,
  },
  title: { fontSize: 26, fontWeight: '700', color: '#FFFFFF', marginBottom: 10 },
  subTitle: { fontSize: 14, color: '#A0B3CC', marginBottom: 40 },

  dotsWrapper: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 50,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotEmpty: {
    backgroundColor: NPCI_BLUE_NEU,
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  dotFilled: {
    backgroundColor: NPCI_GREEN,
    shadowColor: NPCI_GREEN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 6,
  },
  dotDigit: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },

  keypad: { width: '100%', maxWidth: 320 },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  key: {
    width: 78,
    height: 78,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: NPCI_BLUE_NEU,
  },
  // Raised (convex) neumorphic state
  keyRaised: {
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    borderLeftColor: 'rgba(255,255,255,0.08)',
    borderRightColor: 'rgba(0,0,0,0.4)',
    borderBottomColor: 'rgba(0,0,0,0.4)',
  },
  // Pressed (concave/inset) neumorphic state
  keyPressed: {
    backgroundColor: '#0D1E36', // Slightly darker blue on press
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 2,
    borderWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.5)',
    borderLeftColor: 'rgba(0,0,0,0.5)',
    borderRightColor: 'rgba(255,255,255,0.04)',
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  keyText: { color: '#FFFFFF', fontSize: 26, fontWeight: '600' },
});