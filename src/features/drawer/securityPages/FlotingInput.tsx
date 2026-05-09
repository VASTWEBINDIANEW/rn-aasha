import React, { useState, useEffect, useRef } from "react";
import { TextInput, View, Animated, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import { translate } from "../../../utils/languageUtils/I18n";

const FlotingInput = ({
  inputstyle,
  labelinputstyle,
  label,
  onChangeTextCallback,
  autoFocus = false,
  editable = true, // Added for clickable logic
  ...props
}) => {
  const value = props.value;
  const inputRef = useRef(null); // Ref for focusing

  const [isFocused, setIsFocused] = useState(autoFocus || !!value);
  const animatedFocused = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedFocused, {
      toValue: isFocused || (value && value.toString().length > 0) ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const handleFocus = () => {
    setIsFocused(true);
    if (!value?.trim()) {
      onChangeTextCallback?.("");
    }
  };

  const handleBlur = () => {
    if (!value?.toString().trim()) {
      setIsFocused(false);
    }
  };

  // Jab pura box click ho tab input focus ho
  const focusInput = () => {
    if (editable) {
      inputRef.current?.focus();
    }
  };

  const labelStyle = {
    position: "absolute",
    left: wScale(12),
    zIndex: 1,
    top: animatedFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [hScale(8), hScale(0)],
    }),
    fontSize: animatedFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [wScale(20), wScale(14)],
    }),
    color: animatedFocused.interpolate({
      inputRange: [0, 1],
      outputRange: ["#000", "#1f1d1d"],
    }),
    backgroundColor: animatedFocused.interpolate({
      inputRange: [0, 1],
      outputRange: ["transparent", "rgba(255,255,255,1)"],
    }),
    paddingHorizontal: wScale(2),
    height: animatedFocused.interpolate({
      inputRange: [0, 1],
      outputRange: [hScale(48), hScale(18)],
    }),
    justifyContent: "center",
    textAlignVertical: "center",
  };

  return (
    <TouchableWithoutFeedback onPress={focusInput}>
      {/* pointerEvents setup taaki dropdown case mein parent click pakad sake */}
      <View style={styles.main} pointerEvents={editable ? "auto" : "none"}>
        <Animated.Text
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[labelStyle, labelinputstyle]}
          pointerEvents="none"
        >
          {translate(label)}
        </Animated.Text>

        <TextInput
          {...props}
          ref={inputRef}
          editable={editable}
          numberOfLines={1}
          ellipsizeMode="tail"
          style={[styles.input, inputstyle]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor="#000"
          onChangeText={onChangeTextCallback}
          autoFocus={autoFocus}
          cursorColor="#000"
          placeholder="" 
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  main: {
    paddingTop: hScale(8.9),
  },
  input: {
    borderWidth: wScale(0.5),
    borderColor: "#000",
    borderRadius: wScale(5),
    paddingLeft: wScale(15),
    height: hScale(48),
    width: "100%",
    color: "#000",
    fontSize: hScale(20),
    marginBottom: hScale(18),
  },
});

export default React.memo(FlotingInput);