import { translate } from "../../utils/languageUtils/I18n";
// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   TextInput,
//   Alert,
//   Animated,
//   StatusBar,
// } from 'react-native';
// import { useNavigation, useRoute } from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/Ionicons';

// const PIN_LENGTH = 4;

// const RechargePin = () => {
//   const [pin, setPin] = useState('');
//   const [showPin, setShowPin] = useState(false); // 👁️ toggle
//   const shakeAnim = useRef(new Animated.Value(0)).current;
//   const inputRef = useRef(null);

//   const navigation = useNavigation();
//   const route = useRoute();
//   const { onPinSet } = route.params || {};

// //   useEffect(() => {
// //     setTimeout(() => {
// //       inputRef.current?.focus();
// //     }, 300);
// //   }, []);

//   const handleChange = (val) => {
//     if (val.length <= PIN_LENGTH) {
//       setPin(val);
//     }
//   };

//   const shake = () => {
//     Animated.sequence([
//       Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
//       Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
//       Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
//       Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
//     ]).start();
//   };

//   const savePin = () => {
//     if (pin.length < PIN_LENGTH) {
//       shake();
//       Alert.alert('Invalid PIN', 'Please enter 4 digit PIN');
//       return;
//     }

//     if (onPinSet) {
//       onPinSet(pin);
//     }

//     navigation.goBack();
//   };

//   return (
//     <View style={styles.safeArea}>
//       <StatusBar barStyle="light-content" />

//       <View style={styles.container}>
//         {/* Header */}
//         <View style={styles.header}>
//           <Text style={styles.title}>{translate("Secure_Recharge")}</Text>
//           <Text style={styles.subTitle}>{translate("Enter_your_4digit_PIN_to_continue")}</Text>
//         </View>

//         {/* Hidden Input */}
//         <TextInput
//           ref={inputRef}
//           value={pin}
//           onChangeText={handleChange}
//           keyboardType="number-pad"
//           maxLength={PIN_LENGTH}
//           style={styles.hiddenInput}
//         />

//         {/* PIN Boxes */}
//         <TouchableOpacity
//           activeOpacity={1}
//           onPress={() => inputRef.current?.focus()}
//         >
//           <Animated.View style={[styles.pinContainer, { transform: [{ translateX: shakeAnim }] }]}>
//             {[...Array(PIN_LENGTH)].map((_, i) => (
//               <View
//                 key={i}
//                 style={[
//                   styles.pinBox,
//                   pin[i] && styles.activePinBox
//                 ]}
//               >
//                 <Text style={styles.pinDot}>
//                   {pin[i] ? (showPin ? pin[i] : '●') : ''}
//                 </Text>
//               </View>
//             ))}
//           </Animated.View>
//         </TouchableOpacity>

//         {/* 👁️ Eye Toggle */}
//         <TouchableOpacity
//           style={styles.eyeBtn}
//           onPress={() => setShowPin(!showPin)}
//         >
//           <Icon
//             name={showPin ? 'eye-off-outline' : 'eye-outline'}
//             size={22}
//             color="#4DA3FF"
//           />
//           <Text style={styles.eyeText}>
//             {showPin ? 'Hide PIN' : 'Show PIN'}
//           </Text>
//         </TouchableOpacity>

//         {/* Button */}
//         <TouchableOpacity
//           style={[
//             styles.button,
//             pin.length < PIN_LENGTH && styles.disabledBtn
//           ]}
//           activeOpacity={0.85}
//           onPress={savePin}
//         >
//           <Text style={styles.btnText}>{translate("Confirm_PIN")}</Text>
//         </TouchableOpacity>

//         {/* Footer */}
//         <Text style={styles.footerText}>{translate("Your_PIN_is_encrypted_and_secure")}</Text>
//       </View>
//     </View>
//   );
// };

// export default RechargePin;

// /* ================== STYLES ================== */

// const styles = StyleSheet.create({
//   safeArea: {
//     flex: 1,
//     backgroundColor: '#0B1220',
//   },
//   container: {
//     flex: 1,
//     backgroundColor: '#0B1220',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 24,
//   },

//   header: {
//     marginBottom: 45,
//     alignItems: 'center',
//   },
//   title: {
//     fontSize: 30,
//     fontWeight: '700',
//     color: '#E5F0FF',
//     letterSpacing: 0.5,
//   },
//   subTitle: {
//     fontSize: 14,
//     color: '#8FA3BF',
//     marginTop: 10,
//   },

//  hiddenInput: {
//   position: 'absolute',
//   opacity: 0,
//   width: 1,
//   height: 1,
//   left: -100,   // offscreen
// },

//   pinContainer: {
//     flexDirection: 'row',
//     marginBottom: 18,
//   },
//   pinBox: {
//     width: 60,
//     height: 60,
//     borderRadius: 14,
//     marginHorizontal: 10,
//     backgroundColor: '#0F1A2E',
//     borderWidth: 1.2,
//     borderColor: '#1F2A44',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   activePinBox: {
//     borderColor: '#4DA3FF',
//     shadowColor: '#4DA3FF',
//     shadowOffset: { width: 0, height: 0 },
//     shadowOpacity: 0.6,
//     shadowRadius: 10,
//     elevation: 8,
//   },
//   pinDot: {
//     fontSize: 24,
//     color: '#4DA3FF',
//     fontWeight: '700',
//   },

//   eyeBtn: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 35,
//   },
//   eyeText: {
//     marginLeft: 8,
//     color: '#4DA3FF',
//     fontSize: 13,
//     fontWeight: '600',
//   },

//   button: {
//     marginTop: 5,
//     width: '80%',
//     backgroundColor: '#4DA3FF',
//     paddingVertical: 15,
//     borderRadius: 16,
//     alignItems: 'center',
//     shadowColor: '#4DA3FF',
//     shadowOffset: { width: 0, height: 8 },
//     shadowOpacity: 0.4,
//     shadowRadius: 12,
//     elevation: 8,
//   },
//   disabledBtn: {
//     backgroundColor: '#1F3B5F',
//   },
//   btnText: {
//     color: '#061427',
//     fontSize: 16,
//     fontWeight: '700',
//     letterSpacing: 0.5,
//   },

//   footerText: {
//     marginTop: 25,
//     fontSize: 12,
//     color: '#6F86A8',
//   },
// });











// import React, { useState, useRef, useEffect } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   Keyboard,
//   StatusBar,
// } from 'react-native';
// import Icon from 'react-native-vector-icons/Ionicons';
// import { useNavigation } from '@react-navigation/native';

// const RechargePin = () => {
//   const [pin, setPin] = useState('');
//   const [showPin, setShowPin] = useState(false);
//   const inputRef = useRef(null);
//   const navigation = useNavigation();

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       inputRef.current?.focus();
//     }, 300);
//     return () => clearTimeout(timer);
//   }, []);

//   const handleChange = (val) => {
//     const onlyNums = val.replace(/[^0-9]/g, '');
//     setPin(onlyNums);
//   };

//   const savePin = () => {
//     if (!pin) {
//       Alert.alert('Invalid PIN', 'Please enter PIN');
//       return;
//     }

//     Keyboard.dismiss();

//     // Return PIN to previous screen safely
//     navigation.navigate('RechargeScreen', { userPin: pin });
//     navigation.goBack();
//   };

//   return (
//     <View style={styles.container}>
//       <StatusBar barStyle="light-content" />

//       <Text style={styles.title}>{translate("Enter_Transaction_PIN")}</Text>
//       <Text style={styles.subTitle}>{translate("Your_PIN_is_secure_and_encrypted")}</Text>

//       {/* Input Field */}
//       <View style={styles.inputWrapper}>
//         <TextInput
//           ref={inputRef}
//           value={pin}
//           onChangeText={handleChange}
//           keyboardType="number-pad"
//           secureTextEntry={!showPin}
//           placeholder="Enter PIN"
//           placeholderTextColor="#8FA3BF"
//           style={styles.input}
//         />

//         {/* Eye toggle */}
//         <TouchableOpacity
//           onPress={() => setShowPin(!showPin)}
//           style={styles.eyeBtn}
//         >
//           <Icon
//             name={showPin ? 'eye-off-outline' : 'eye-outline'}
//             size={22}
//             color="#4DA3FF"
//           />
//         </TouchableOpacity>
//       </View>

//       {/* Confirm Button */}
//       <TouchableOpacity
//         style={[styles.button, !pin && styles.disabledBtn]}
//         onPress={savePin}
//       >
//         <Text style={styles.btnText}>Confirm PIN</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// export default RechargePin;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#0B1220',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 24,
//   },
//   title: {
//     fontSize: 26,
//     fontWeight: '700',
//     color: '#E5F0FF',
//     marginBottom: 10,
//   },
//   subTitle: {
//     fontSize: 14,
//     color: '#8FA3BF',
//     marginBottom: 40,
//   },
//   inputWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     width: '80%',
//     backgroundColor: '#0F1A2E',
//     borderRadius: 12,
//     borderWidth: 1,
//     borderColor: '#1F2A44',
//     paddingHorizontal: 15,
//     marginBottom: 30,
//   },
//   input: {
//     flex: 1,
//     height: 55,
//     color: '#E5F0FF',
//     fontSize: 18,
//   },
//   eyeBtn: {
//     marginLeft: 10,
//   },
//   button: {
//     width: '80%',
//     paddingVertical: 15,
//     backgroundColor: '#4DA3FF',
//     borderRadius: 16,
//     alignItems: 'center',
//     shadowColor: '#4DA3FF',
//     shadowOffset: { width: 0, height: 6 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 5,
//   },
//   disabledBtn: {
//     backgroundColor: '#1F3B5F',
//   },
//   btnText: {
//     color: '#061427',
//     fontSize: 16,
//     fontWeight: '700',
//   },
// });

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Keyboard,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import RechargeScreen from './RechargeScreen';

const RechargePinRoute = () => {
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const inputRef = useRef(null);

  const navigation = useNavigation();
  const route = useRoute(); // ✅ must
  const { onPinSet } = route.params || {}; // get callback

  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (val) => {
    const onlyNums = val.replace(/[^0-9]/g, '');
    setPin(onlyNums);
  };

  const savePin = () => {
    if (!pin) {
      Alert.alert('Invalid PIN', 'Please enter your PIN');
      return;
    }

    Keyboard.dismiss();

    // ✅ call callback if passed
    if (typeof onPinSet === 'function') {
      onPinSet(pin);
    }
navigation.navigate("RechargeScreen");
    navigation.goBack();
  
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <Text style={styles.title}>{translate("Enter_Transaction_PIN")}</Text>
      <Text style={styles.subTitle}>{translate("Your_PIN_is_secure")}</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          ref={inputRef}
          value={pin}
          onChangeText={handleChange}
          keyboardType="number-pad"
          secureTextEntry={!showPin}
          placeholder="Enter PIN"
          placeholderTextColor="#8FA3BF"
          style={styles.input}
          autoComplete='off'
        />
        <TouchableOpacity
          onPress={() => setShowPin(!showPin)}
          style={styles.eyeBtn}
        >
          <Icon
            name={showPin ? 'eye-off-outline' : 'eye-outline'}
            size={22}
            color="#4DA3FF"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, !pin && styles.disabledBtn]}
        onPress={savePin}
      >
        <Text style={styles.btnText}>{translate("Confirm PIN")}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default RechargePinRoute;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B1220',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: { fontSize: 26, fontWeight: '700', color: '#E5F0FF', marginBottom: 10 },
  subTitle: { fontSize: 14, color: '#8FA3BF', marginBottom: 40 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '80%',
    backgroundColor: '#0F1A2E',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1F2A44',
    paddingHorizontal: 15,
    marginBottom: 30,
  },
  input: { flex: 1, height: 55, color: '#E5F0FF', fontSize: 18 },
  eyeBtn: { marginLeft: 10 },
  button: {
    width: '80%',
    paddingVertical: 15,
    backgroundColor: '#4DA3FF',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#4DA3FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  disabledBtn: { backgroundColor: '#1F3B5F' },
  btnText: { color: '#061427', fontSize: 16, fontWeight: '700' },
});
