import { translate } from "../utils/languageUtils/I18n";
import React, { useEffect, useRef } from "react";
import {
  View, StyleSheet, Text, Pressable,
  Animated, Easing, Dimensions, Modal,
  TouchableWithoutFeedback
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useSelector } from "react-redux";
import { RootState } from "../reduxUtils/store";
import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { hScale, wScale } from "../utils/styles/dimensions";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const hexAlpha = (hex: string, alpha: number): string => {
  const safe = (hex || "#ffffff").replace("#", "");
  const full = safe.length === 3 ? safe.split("").map(c => c + c).join("") : safe;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

interface Props {
  visible: boolean;
  onLater: () => void;
  onEnable: () => void;
}

const SecurityBottomSheet: React.FC<Props> = ({ visible, onLater, onEnable }) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const insets = useSafeAreaInsets();

  const C = {
    primary: colorConfig?.primaryColor || "#56ffb9",
    secondary: colorConfig?.secondaryColor || "#00eaff",
    btnPri: colorConfig?.primaryButtonColor || "#2a4fd7",
    btnSec: colorConfig?.secondaryButtonColor || "#8c22d7",
    label: colorConfig?.labelColor || "#FFFFFF",
  };

  // ─── Center modal: scale + opacity (no slide) ─────────────────────────────
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const opacAnim = useRef(new Animated.Value(0)).current;
  const backdropOpac = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Show
      Animated.parallel([
        Animated.timing(backdropOpac, {
          toValue: 1, duration: 280, useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1, friction: 8, tension: 50, useNativeDriver: true,
        }),
        Animated.timing(opacAnim, {
          toValue: 1, duration: 250, useNativeDriver: true,
        }),
      ]).start();

      // Pulse loop on icon
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.09, duration: 1100,
            easing: Easing.inOut(Easing.ease), useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.00, duration: 1100,
            easing: Easing.inOut(Easing.ease), useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Hide
      Animated.parallel([
        Animated.timing(backdropOpac, {
          toValue: 0, duration: 220, useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.85, duration: 200, useNativeDriver: true,
        }),
        Animated.timing(opacAnim, {
          toValue: 0, duration: 200, useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onLater}
    >
      {/* ── Overlay (center) ── */}
      <View style={styles.overlay}>

        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onLater}>
          <Animated.View style={[styles.backdrop, { opacity: backdropOpac }]} />
        </TouchableWithoutFeedback>

        {/* Center card */}
        <Animated.View
          style={[
            styles.container,
            {
              opacity: opacAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <LinearGradient
            colors={[C.primary, C.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientSheet}
          >
            {/* Decorative circles */}
            <View style={[styles.circleTopRight, { backgroundColor: hexAlpha(C.btnPri, 0.15) }]} />
            <View style={[styles.circleTopLeft, { backgroundColor: hexAlpha(C.btnSec, 0.12) }]} />
            <View style={[styles.circleBottomRight, { backgroundColor: hexAlpha(C.primary, 0.12) }]} />

            <View style={[
              styles.glassCard,
              {
                backgroundColor: hexAlpha("#ffffff", 0.13),
                borderColor: hexAlpha("#ffffff", 0.22),
              },
            ]}>

              {/* Icon cluster */}
              <Animated.View style={{ transform: [{ scale: pulseAnim }], marginBottom: hScale(18) }}>
                <View style={[styles.iconOuter, {
                  backgroundColor: hexAlpha("#ffffff", 0.10),
                  borderColor: hexAlpha("#ffffff", 0.25),
                }]}>
                  <View style={[styles.iconMid, {
                    backgroundColor: hexAlpha(C.btnPri, 0.18),
                    borderColor: hexAlpha(C.label, 0.2),
                  }]}>
                    <LinearGradient
                      colors={[C.btnPri, C.btnSec]}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                      style={styles.iconCircle}
                    >
                      <Icon name="shield-lock" size={34} color={C.label} />
                    </LinearGradient>
                  </View>
                </View>
              </Animated.View>

              <Text style={[styles.title, { color: C.label }]}>
                {translate("Secure_Your_Account")}
              </Text>

              <Text style={[styles.description, { color: hexAlpha(C.label, 0.75) }]}>
                {translate("key_addalaye_136")}
              </Text>

              {/* Feature pills */}
              <View style={styles.pillRow}>
                {[
                  { icon: "fingerprint", label: "Biometric" },
                  { icon: "shield-check", label: "Secure" },
                  { icon: "lightning-bolt", label: "Fast" },
                ].map(item => (
                  <View
                    key={item.label}
                    style={[styles.pill, {
                      backgroundColor: hexAlpha("#ffffff", 0.10),
                      borderColor: hexAlpha("#ffffff", 0.25),
                    }]}
                  >
                    <Icon name={item.icon} size={13} color={C.label} />
                    <Text style={[styles.pillText, { color: hexAlpha(C.label, 0.85) }]}>
                      {item.label}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={[styles.dividerLine, {
                backgroundColor: hexAlpha(C.label, 0.2),
                marginVertical: hScale(18),
              }]} />

              {/* Enable button */}
              <Pressable
                onPress={onEnable}
                style={({ pressed }) => [styles.enableWrap, { opacity: pressed ? 0.87 : 1 }]}
              >
                <LinearGradient
                  colors={[C.btnPri, C.btnSec]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                  style={styles.enableBtn}
                >
                  <Icon name="shield-lock-outline" size={20} color={C.label} style={{ marginRight: 8 }} />
                  <Text style={[styles.enableText, { color: C.label }]}>
                    {translate("Enable_Now")}
                  </Text>
                  <Icon name="chevron-right" size={20} color={hexAlpha(C.label, 0.65)} style={{ marginLeft: 4 }} />
                </LinearGradient>
              </Pressable>

              {/* Later button */}
              <Pressable
                onPress={onLater}
                style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1, marginTop: hScale(12) }]}
              >
                <View style={[styles.laterBtn, {
                  backgroundColor: hexAlpha("#ffffff", 0.08),
                  borderColor: hexAlpha("#ffffff", 0.22),
                }]}>
                  <Text style={[styles.laterText, { color: hexAlpha(C.label, 0.8) }]}>
                    {translate("Ill_do_it_later")}
                  </Text>
                </View>
              </Pressable>

            </View>
          </LinearGradient>
        </Animated.View>

      </View>
    </Modal>
  );
};

export default SecurityBottomSheet;

const styles = StyleSheet.create({
  // ── ✅ CENTER layout ──────────────────────────────────────────────────────
  overlay: {
    flex: 1,
    justifyContent: "center",   // ← center vertically
    alignItems: "center",   // ← center horizontally
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },

  // ── Modal card ──
  container: {
    width: SCREEN_WIDTH * 0.90,  // 90% screen width
    maxWidth: 420,
    zIndex: 10,
  },

  gradientSheet: {
    borderRadius: 28,            // ← all 4 corners rounded (not just top)
    paddingTop: 22,
    paddingBottom: 22,
    paddingHorizontal: 18,
    overflow: "hidden",
  },

  // Decorative circles
  circleTopRight: {
    position: "absolute",
    width: 180, height: 180,
    borderRadius: 90,
    top: -55, right: -45,
  },
  circleTopLeft: {
    position: "absolute",
    width: 130, height: 130,
    borderRadius: 65,
    top: 30, left: -35,
  },
  circleBottomRight: {
    position: "absolute",
    width: 120, height: 120,
    borderRadius: 60,
    bottom: -30, right: 20,
  },

  // Glass card inside
  glassCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
  },

  // Icon rings
  iconOuter: {
    width: 106, height: 106,
    borderRadius: 53,
    borderWidth: 1.5,
    alignItems: "center", justifyContent: "center",
  },
  iconMid: {
    width: 76, height: 76,
    borderRadius: 38,
    borderWidth: 1,
    alignItems: "center", justifyContent: "center",
  },
  iconCircle: {
    width: 56, height: 56,
    borderRadius: 28,
    alignItems: "center", justifyContent: "center",
  },

  title: {
    fontSize: 21,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: hScale(8),
  },
  description: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: hScale(16),
  },

  // Pills
  pillRow: {
    flexDirection: "row",
    gap: 7,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 10,
    fontWeight: "600",
  },

  dividerLine: {
    height: 1,
    width: "100%",
  },

  // Enable button
  enableWrap: { width: "100%" },
  enableBtn: {
    borderRadius: 50,
    paddingVertical: hScale(14),
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  enableText: {
    fontSize: 16,
    fontWeight: "700",
  },

  // Later button
  laterBtn: {
    paddingHorizontal: 28,
    paddingVertical: hScale(9),
    borderRadius: 50,
    borderWidth: 1,
  },
  laterText: {
    fontSize: 13,
    fontWeight: "600",
  },
});