import React, { useRef, useCallback } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { useSelector } from "react-redux";
import { RootState } from "../../../reduxUtils/store";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import { translate } from "../../../utils/languageUtils/I18n";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DynamicButtonProps {
  title: string | React.ReactNode;
  onPress: () => void;
  onlong?: () => void;
  styleoveride?: object;
  disabled?: boolean;
  variant?: "solid" | "outline" | "ghost";
}

// ─── Component ────────────────────────────────────────────────────────────────

const DynamicButton: React.FC<DynamicButtonProps> = ({
  title,
  onPress,
  onlong,
  styleoveride,
  disabled = false,
  variant = "solid",
}) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  // Press scale animation
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.965,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.88,
        duration: 80,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const animateOut = useCallback(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 40,
        bounciness: 6,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  const handlePress = useCallback(() => {
    if (!disabled) onPress?.();
  }, [disabled, onPress]);

  const handleLongPress = useCallback(() => {
    if (!disabled) onlong?.();
  }, [disabled, onlong]);

  const primaryColor = colorConfig?.primaryButtonColor || "#0A84FF";
  const secondaryColor = colorConfig?.secondaryButtonColor || "#0055FF";
  const labelColor = colorConfig?.labelColor || "#FFFFFF";

  // ─── Outline / Ghost Variants ─────────────────────────────────────────────

  if (variant === "outline") {
    return (
      <Animated.View
        style={[
          styles.wrapper,
          styleoveride,
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={animateIn}
          onPressOut={animateOut}
          onPress={handlePress}
          onLongPress={handleLongPress}
          disabled={disabled}
          style={[
            styles.outlineBtn,
            { borderColor: primaryColor },
            disabled && styles.disabledOverlay,
          ]}
        >
          <Text style={[styles.outlineText, { color: primaryColor }]}>
            {typeof title === "string" ? translate(title) : title}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  if (variant === "ghost") {
    return (
      <Animated.View
        style={[
          styles.wrapper,
          styleoveride,
          { transform: [{ scale: scaleAnim }], opacity: opacityAnim },
        ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPressIn={animateIn}
          onPressOut={animateOut}
          onPress={handlePress}
          onLongPress={handleLongPress}
          disabled={disabled}
          style={[styles.ghostBtn, disabled && styles.disabledOverlay]}
        >
          <Text style={[styles.ghostText, { color: primaryColor }]}>
            {typeof title === "string" ? translate(title) : title}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // ─── Default Solid Gradient ───────────────────────────────────────────────

  return (
    <Animated.View
      style={[
        styles.wrapper,
        styleoveride,
        { transform: [{ scale: scaleAnim }], opacity: disabled ? 0.5 : opacityAnim },
      ]}
    >
      {/* Soft shadow glow layer */}
      <View
        style={[
          styles.glowLayer,
          { backgroundColor: primaryColor },
        ]}
      />

      <LinearGradient
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        colors={
          disabled
            ? ["#C7C7CC", "#AEAEB2"]
            : [primaryColor, secondaryColor]
        }
      >
        {/* Top shine streak */}
        {!disabled && (
          <View style={styles.shineStreak} pointerEvents="none" />
        )}

        <TouchableOpacity
          activeOpacity={1}
          onPressIn={animateIn}
          onPressOut={animateOut}
          onPress={handlePress}
          onLongPress={handleLongPress}
          disabled={disabled}
          style={styles.touchArea}
        >
          {typeof title === "string" ? (
            <Text style={[styles.label, { color: disabled ? "#FFF" : labelColor }]}>
              {translate(title)}
            </Text>
          ) : (
            title
          )}
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
};

export default React.memo(DynamicButton);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    position: "relative",
  },

  // Glow shadow beneath button
  glowLayer: {
    position: "absolute",
    bottom: -hScale(5),
    left: wScale(20),
    right: wScale(20),
    height: hScale(18),
    borderRadius: wScale(30),
    opacity: 0.25,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
    }),
    // Android glow approximated with elevation on gradient itself
  },

  gradient: {
    width: "100%",
    borderRadius: wScale(14),
    overflow: "hidden",
    ...Platform.select({
      android: { elevation: 6 },
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
      },
    }),
  },

  // Subtle top shine to give depth
  shineStreak: {
    position: "absolute",
    top: 0,
    left: wScale(16),
    right: wScale(16),
    height: hScale(1.5),
    backgroundColor: "rgba(255,255,255,0.35)",
    borderBottomLeftRadius: wScale(4),
    borderBottomRightRadius: wScale(4),
    zIndex: 1,
  },

  touchArea: {
    height: hScale(54),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wScale(24),
    flexDirection: "row",
    gap: wScale(8),
  },

  label: {
    fontSize: wScale(15),
    fontWeight: "700",
    letterSpacing: wScale(1.2),
    textTransform: "uppercase",
    color: "#FFF",
  },

  // Outline variant
  outlineBtn: {
    height: hScale(54),
    borderRadius: wScale(14),
    borderWidth: wScale(1.5),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wScale(24),
    backgroundColor: "transparent",
  },
  outlineText: {
    fontSize: wScale(15),
    fontWeight: "700",
    letterSpacing: wScale(1.2),
    textTransform: "uppercase",
  },

  // Ghost variant
  ghostBtn: {
    height: hScale(54),
    borderRadius: wScale(14),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: wScale(24),
    backgroundColor: "transparent",
  },
  ghostText: {
    fontSize: wScale(15),
    fontWeight: "600",
    letterSpacing: wScale(0.5),
    textTransform: "uppercase",
  },

  // Disabled state
  disabledOverlay: {
    opacity: 0.5,
  },
});