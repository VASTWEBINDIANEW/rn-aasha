import React, { useEffect, useState } from "react";
import { View, Dimensions, StyleSheet } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { SvgUri } from "react-native-svg";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import { APP_URLS } from "../../../utils/network/urls";
import useAxiosHook from "../../../utils/network/AxiosClient";
import { useSelector } from "react-redux";
import { RootState } from "../../../reduxUtils/store";

const { width: screenWidth } = Dimensions.get("window");
const CARD_W = screenWidth * 0.92;
const CARD_H = hScale(110);

// ─── Retry config for image HEAD-check ─────────────────────────────────────
const MAX_RETRIES = 2;
const RETRY_DELAYS_MS = [800, 2000];
const CHECK_TIMEOUT_MS = 8000;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const checkImageWithRetry = async (
  url: string,
  attempt = 0
): Promise<boolean> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), CHECK_TIMEOUT_MS);

  try {
    const res = await fetch(url, { method: "HEAD", signal: controller.signal });
    clearTimeout(timeoutId);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return true;
  } catch (err) {
    clearTimeout(timeoutId);
    if (attempt < MAX_RETRIES) {
      await delay(RETRY_DELAYS_MS[attempt] ?? 1500);
      return checkImageWithRetry(url, attempt + 1);
    }
    return false;
  }
};

// ─── Dot (plain, no spring animation) ──────────────────────────────────────
const PaginationDot = ({ isActive, primaryColor, secondaryColor }) => (
  <View
    style={[
      styles.dot,
      {
        width: isActive ? wScale(16) : wScale(5),
        backgroundColor: isActive ? primaryColor : secondaryColor,
        opacity: isActive ? 1 : 0.4,
      },
    ]}
  />
);

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
      checkImageWithRetry(item.images).then((ok) =>
        setValidImages((p) => ({ ...p, [item.idno]: ok }))
      );
    });
  }, [sliderImages]);

  const slides = sliderImages.filter((item: any) => validImages[item.idno] === true);

  if (!loading && slides.length === 0) return null;
  if (loading) {
    return (
      <View
        style={[
          styles.skCard,
          { borderColor: "rgba(255,255,255,0.15)", backgroundColor: `${colorConfig.primaryColor}15` },
        ]}
      />
    );
  }

  return (
    <View style={styles.wrapper}>
      <View style={[styles.frame, { backgroundColor: "rgba(255,255,255,0.05)" }]}>
        <Carousel
          loop
          width={screenWidth}
          height={CARD_H}
          autoPlay
          autoPlayInterval={3200}
          scrollAnimationDuration={600}
          data={slides}
          onSnapToItem={setActiveIndex}
          renderItem={({ item }) => (
            <View style={styles.slideOuter}>
              <View style={styles.card}>
                <SvgUri
                  width="100%"
                  height="100%"
                  uri={item.images}
                  onError={() => setValidImages((p) => ({ ...p, [item.idno]: false }))}
                />
              </View>
            </View>
          )}
        />

        {/* dots */}
        <View style={styles.dotsRow}>
          <View style={styles.dotsPill}>
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
  wrapper: { marginVertical: hScale(10) },

  frame: {
    borderRadius:  16,
    overflow:      "hidden",
    borderWidth:   1,
    borderColor:   "rgba(255,255,255,0.16)",
    paddingBottom: hScale(8),
  },

  slideOuter: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: {
    width: CARD_W, height: CARD_H,
    borderRadius:  14,
    overflow:      "hidden",
    borderWidth:   1,
    borderColor:   "rgba(255,255,255,0.22)",
  },

  dotsRow:  { alignItems: "center", marginTop: hScale(4) },
  dotsPill: {
    flexDirection:     "row",
    alignItems:        "center",
    borderRadius:      20,
    borderWidth:       1,
    borderColor:       "rgba(255,255,255,0.2)",
    backgroundColor:   "rgba(255,255,255,0.12)",
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