import React, { useEffect, useState } from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { SvgUri } from "react-native-svg";
import Animated, {
  useSharedValue, useAnimatedStyle, withSpring,
} from "react-native-reanimated";
import LinearGradient from "react-native-linear-gradient";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import { APP_URLS } from "../../../utils/network/urls";
import useAxiosHook from "../../../utils/network/AxiosClient";
import { useSelector } from "react-redux";
import { RootState } from "../../../reduxUtils/store";

const { width: screenWidth } = Dimensions.get("window");
const CARD_W = screenWidth * 0.86;
const CARD_H = hScale(110); // ← छोटा किया

// ─── Dot ──────────────────────────────────────────────────────────────────────
const PaginationDot = ({ isActive, primaryColor, secondaryColor }) => {
  const w = useSharedValue(isActive ? wScale(16) : wScale(5));
  useEffect(() => {
    w.value = withSpring(isActive ? wScale(16) : wScale(5), { damping: 14, stiffness: 120 });
  }, [isActive]);
  const style = useAnimatedStyle(() => ({ width: w.value }));
  return (
    <Animated.View
      style={[styles.dot, style, {
        backgroundColor: isActive ? primaryColor : secondaryColor,
        opacity: isActive ? 1 : 0.4,
      }]}
    />
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const CarouselView = () => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const { get } = useAxiosHook();

  const [activeIndex,  setActiveIndex]  = useState(0);
  const [sliderImages, setSliderImages] = useState([]);
  const [validImages,  setValidImages]  = useState<Record<any, boolean>>({});
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await get({ url: APP_URLS.getSliderImages });
        if (res) setSliderImages(res || []);
      } catch (e) {
        console.log("Slider error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    sliderImages.forEach((item: any) => {
      if (!item.images) return;
      fetch(item.images, { method: "HEAD" })
        .then(r => setValidImages(p => ({ ...p, [item.idno]: r.ok })))
        .catch(()  => setValidImages(p => ({ ...p, [item.idno]: false })));
    });
  }, [sliderImages]);

  const slides = sliderImages.filter((item: any) => validImages[item.idno] === true);

  if (!loading && slides.length === 0) return null;
  if (loading) return (
    <View style={[styles.skCard, { borderColor: "rgba(255,255,255,0.15)" }]}>
      <LinearGradient
        colors={[`${colorConfig.primaryColor}22`, `${colorConfig.primaryColor}08`]}
        style={StyleSheet.absoluteFillObject}
      />
    </View>
  );

  return (
    <View style={styles.wrapper}>
      {/* frame */}
      <View style={styles.frame}>
        <LinearGradient
          colors={["rgba(255,255,255,0.10)", "rgba(255,255,255,0.02)"]}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
        <LinearGradient
          colors={["rgba(255,255,255,0.38)", "rgba(255,255,255,0)"]}
          start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
          style={styles.frameShimmer}
        />

        <Carousel
          loop
          width={screenWidth}
          height={CARD_H}
          autoPlay
          autoPlayInterval={3200}
          mode="parallax"
          modeConfig={{ parallaxScrollingScale: 0.88, parallaxScrollingOffset: 48 }}
          scrollAnimationDuration={900}
          data={slides}
          onSnapToItem={setActiveIndex}
          renderItem={({ item, index }) => (
            <View style={styles.slideOuter}>
              <View style={[
                styles.card,
                index === activeIndex && { shadowColor: colorConfig.primaryColor, elevation: 10 },
              ]}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.16)", "rgba(255,255,255,0.04)"]}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFillObject}
                />
                <LinearGradient
                  colors={["rgba(255,255,255,0.5)", "rgba(255,255,255,0)"]}
                  start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                  style={styles.cardShimmer}
                />
                <SvgUri
                  width="100%" height="100%"
                  uri={item.images}
                  onError={() => setValidImages(p => ({ ...p, [item.idno]: false }))}
                />
              </View>
            </View>
          )}
        />

        {/* dots */}
        <View style={styles.dotsRow}>
          <View style={styles.dotsPill}>
            <LinearGradient
              colors={["rgba(255,255,255,0.22)", "rgba(255,255,255,0.08)"]}
              style={StyleSheet.absoluteFillObject}
            />
            {slides.map((_, i) => (
              <PaginationDot
                key={i}
                isActive={i === activeIndex}
                primaryColor={colorConfig.primaryColor}
                secondaryColor={colorConfig.secondaryColor}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginVertical: hScale(4) },

  frame: {
    borderRadius:  16,
    overflow:      "hidden",
    borderWidth:   1,
    borderColor:   "rgba(255,255,255,0.16)",
    paddingBottom: hScale(8),
  },
  frameShimmer: {
    position: "absolute", top: 0, left: 0, right: 0,
    height: hScale(20), borderTopLeftRadius: 16, borderTopRightRadius: 16, zIndex: 1,
  },

  slideOuter: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    width: CARD_W, height: CARD_H,
    borderRadius:  14,
    overflow:      "hidden",
    borderWidth:   1,
    borderColor:   "rgba(255,255,255,0.22)",
    // shadowOffset:  { width: 0, height: 4 },
    // shadowOpacity: 0.4,
    // shadowRadius:  10,
  },
  cardShimmer: {
    position: "absolute", top: 0, left: 0, right: 0,
    height: hScale(22), borderTopLeftRadius: 14, borderTopRightRadius: 14, zIndex: 1,
  },

  dotsRow:  { alignItems: "center", marginTop: hScale(4) },
  dotsPill: {
    flexDirection:     "row",
    alignItems:        "center",
    overflow:          "hidden",
    borderRadius:      20,
    borderWidth:       1,
    borderColor:       "rgba(255,255,255,0.2)",
    paddingHorizontal: wScale(1),
    paddingVertical:   hScale(3),
  },
  dot: {
    height:          hScale(5),
    borderRadius:    10,
    marginHorizontal: wScale(2),
  },

  skCard: {
    height:           CARD_H,
    marginHorizontal: wScale(16),
    marginVertical:   hScale(4),
    borderRadius:     14,
    overflow:         "hidden",
    borderWidth:      1,
  },
});

export default CarouselView;