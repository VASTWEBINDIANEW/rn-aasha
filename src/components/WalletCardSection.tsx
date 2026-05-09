import React, { useRef, useState, useCallback } from "react";
import {
  View, Text, StyleSheet, Dimensions,
  TouchableOpacity, FlatList, PanResponder, Animated,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";

const { width: W } = Dimensions.get("window");
const CARD_W = W - 40;
const CARD_H = 190;

export interface WalletCard {
  id: string;
  title: string;
  subtitle?: string;
  colors: [string, string, string?];
  logo?: React.ReactNode;
  onPress?: () => void;
}

interface Props {
  cards: WalletCard[];
  primaryColor?: string;
}

const WalletCardSection: React.FC<Props> = ({ cards, primaryColor = "#1A237E" }) => {
  const [mode, setMode] = useState<"carousel" | "stack">("carousel");
  const [activeIdx, setActiveIdx] = useState(0);
  const flatRef = useRef<FlatList>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // ─── Go to Stack ──────────────────────────────────────────────────────────
  const goToStack = useCallback(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 160,
        useNativeDriver: true,
      }),
    ]).start(() => setMode("stack"));
  }, [scaleAnim]);

  // ─── Go to Carousel ───────────────────────────────────────────────────────
  const goToCarousel = useCallback((idx: number) => {
    setActiveIdx(idx);
    setMode("carousel");
    setTimeout(() => {
      flatRef.current?.scrollToIndex({ index: idx, animated: true });
    }, 80);
  }, []);

  // ─── Swipe Up detector ────────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        Math.abs(g.dy) > 12 && g.dy < 0,
      onPanResponderRelease: (_, g) => {
        if (g.dy < -40) goToStack();
      },
    })
  ).current;

  // ─── Carousel Card ────────────────────────────────────────────────────────
  const renderCarouselCard = ({
    item,
    index,
  }: {
    item: WalletCard;
    index: number;
  }) => (
    <Animated.View
      style={[styles.carouselItem, { transform: [{ scale: scaleAnim }] }]}
    >
      {/* Main Card */}
      <TouchableOpacity activeOpacity={0.92} onPress={item.onPress}>
        <LinearGradient
          colors={item.colors as [string, string]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.card}
        >
          {/* Decorative circle */}
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />

          {/* Logo top-left */}
          {item.logo && (
            <View style={styles.logoWrap}>{item.logo}</View>
          )}

          {/* Title & subtitle top-right */}
          <View style={styles.cardTopRight}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {item.subtitle && (
              <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* View Details Button */}
      <TouchableOpacity style={styles.viewBtn} onPress={item.onPress}>
        <Text style={styles.viewBtnText}>View Details</Text>
      </TouchableOpacity>
    </Animated.View>
  );

  // ─── Stack Card ───────────────────────────────────────────────────────────
  const renderStackCard = ({
    item,
    index,
  }: {
    item: WalletCard;
    index: number;
  }) => (
    <TouchableOpacity
      key={item.id}
      activeOpacity={0.8}
      onPress={() => goToCarousel(index)}
      style={styles.stackItem}
    >
      <LinearGradient
        colors={item.colors as [string, string]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.stackCard}
      >
        {/* Decorative circles - smaller */}
        <View style={styles.stackCircle} />

        {item.logo && (
          <View style={styles.stackLogoWrap}>{item.logo}</View>
        )}

        <View style={styles.stackTextWrap}>
          <Text style={styles.stackTitle}>{item.title}</Text>
          {item.subtitle && (
            <Text style={styles.stackSubtitle}>{item.subtitle}</Text>
          )}
        </View>

        {/* Arrow */}
        <Text style={styles.stackArrow}>›</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  // ─── Dot Indicators ───────────────────────────────────────────────────────
  const Dots = () => (
    <View style={styles.dotsRow}>
      {cards.map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            i === activeIdx
              ? [styles.dotActive, { backgroundColor: primaryColor }]
              : null,
          ]}
        />
      ))}
    </View>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      {mode === "carousel" ? (
        /* ── CAROUSEL MODE ── */
        <View {...panResponder.panHandlers}>
          <FlatList
            ref={flatRef}
            data={cards}
            keyExtractor={(i) => i.id}
            renderItem={renderCarouselCard}
            horizontal
            pagingEnabled={false}
            snapToInterval={CARD_W + 16}
            snapToAlignment="center"
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContent}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(
                e.nativeEvent.contentOffset.x / (CARD_W + 16)
              );
              setActiveIdx(idx);
            }}
          />

          <Dots />

          {/* See All button */}
          <TouchableOpacity style={styles.seeAllBtn} onPress={goToStack}>
            <Text style={[styles.seeAllText, { color: primaryColor }]}>
              All  ↑
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* ── STACK MODE ── */
        <View style={styles.stackRoot}>
          {/* Header row */}
          <View style={styles.stackHeader}>
            <Text style={styles.stackHeaderTitle}>All Sections</Text>
            <TouchableOpacity onPress={() => goToCarousel(activeIdx)}>
              <Text style={styles.stackCloseBtn}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={cards}
            keyExtractor={(i) => i.id}
            renderItem={renderStackCard}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.stackListContent}
          />
        </View>
      )}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { width: "100%", marginVertical: 8 },

  // ── Carousel ──
  carouselContent: {
    paddingHorizontal: 20,
    gap: 16,
  },
  carouselItem: {
    width: CARD_W,
    borderRadius: 20,
    overflow: "hidden",
    // Card shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    overflow: "hidden",
  },
  // decorative circles (fingerprint-like)
  circle1: {
    position: "absolute",
    right: -60,
    bottom: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 35,
    borderColor: "rgba(255,255,255,0.07)",
  },
  circle2: {
    position: "absolute",
    right: -10,
    bottom: -10,
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 25,
    borderColor: "rgba(255,255,255,0.07)",
  },
  circle3: {
    position: "absolute",
    left: -40,
    top: -40,
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 25,
    borderColor: "rgba(255,255,255,0.05)",
  },
  logoWrap: { marginBottom: 8 },
  cardTopRight: {
    position: "absolute",
    top: 20,
    right: 20,
    alignItems: "flex-end",
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  cardSubtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginTop: 3,
  },
  viewBtn: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    paddingVertical: 15,
    alignItems: "center",
  },
  viewBtnText: {
    color: "#333",
    fontSize: 15,
    fontWeight: "500",
  },

  // ── Dots ──
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dotActive: {
    width: 20,
    height: 6,
    borderRadius: 3,
  },

  // ── See All ──
  seeAllBtn: {
    alignSelf: "flex-end",
    marginRight: 20,
    marginTop: 8,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // ── Stack Mode ──
  stackRoot: { paddingHorizontal: 20 },
  stackHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  stackHeaderTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  stackCloseBtn: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 14,
  },
  stackListContent: { gap: 10, paddingBottom: 20 },
  stackItem: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  stackCard: {
    height: 68,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    overflow: "hidden",
  },
  stackCircle: {
    position: "absolute",
    right: -20,
    top: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 20,
    borderColor: "rgba(255,255,255,0.08)",
  },
  stackLogoWrap: { marginRight: 12 },
  stackTextWrap: { flex: 1 },
  stackTitle: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  stackSubtitle: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    marginTop: 2,
  },
  stackArrow: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 26,
    fontWeight: "300",
  },
});

export default WalletCardSection;