// features/dashboard/components/IconButtons.tsx
import React, { memo, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  Alert,
  Platform,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { FlashList } from "@shopify/flash-list";
import { useSelector } from "react-redux";
import LinearGradient from "react-native-linear-gradient";
import FastImage from "react-native-fast-image";

import { RootState } from "../../../reduxUtils/store";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import { sectionData } from "../utils";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_URLS } from "../../../utils/network/urls";
import useAxiosHook from "../../../utils/network/AxiosClient";
import { translate } from "../../../utils/languageUtils/I18n";

const loader = [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }];
const MAX_ITEMS = 4;

const svgCache: Record<string, string> = {};

const MAX_RETRIES = 2;
const RETRY_DELAYS_MS = [800, 2000]; 
const FETCH_TIMEOUT_MS = 10000;

const REMOTE_FALLBACK_URL = `http://native.${APP_URLS.baseWebUrl}/SvgOperatorImage/exclamation-mark.png`;

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const encodeSvgUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    urlObj.pathname = urlObj.pathname
      .split("/")
      .map((segment) => {
        try {
          return encodeURIComponent(decodeURIComponent(segment));
        } catch {
          return encodeURIComponent(segment);
        }
      })
      .join("/");
    return urlObj.toString();
  } catch (e) {
    console.warn("⚠️ Invalid SVG URL, using as-is:", url);
    return url;
  }
};

const fetchSvgWithRetry = async (
  url: string,
  isCancelled: () => boolean,
  attempt = 0
): Promise<string> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "image/svg+xml, application/xml, text/xml, */*",
        "User-Agent": "Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36",
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

    const xml = await res.text();

    if (xml.trim().startsWith("<html") || xml.trim().startsWith("<!DOCTYPE html")) {
      throw new Error("Server returned an HTML page instead of valid SVG payload.");
    }
    if (!xml.trim()) {
      throw new Error("Empty SVG payload");
    }

    return xml;
  } catch (err) {
    clearTimeout(timeoutId);

    if (isCancelled()) throw err;

    if (attempt < MAX_RETRIES) {
      await delay(RETRY_DELAYS_MS[attempt] ?? 1500);
      if (isCancelled()) throw err;
      return fetchSvgWithRetry(url, isCancelled, attempt + 1);
    }

    throw err;
  }
};

// ─── Neomorphic Base Wrapper ────────────────────────────────────────────────
const NeomorphIconBase = ({ children, baseColor, isLoading = false }: any) => (
  <View style={[styles.cardOuterShadow, { backgroundColor: baseColor }]}>
    <LinearGradient
      colors={["rgba(255,255,255,0.4)", "rgba(0,0,0,0.15)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.cardGradientWrapper}
    >
      <View style={[styles.cardSurface, { backgroundColor: baseColor }, isLoading && styles.iconCardLoading]}>
        {children}
      </View>
    </LinearGradient>
  </View>
);

interface TrackedSvgIconProps {
  item: sectionData;
  section: string;
  fallbackLogoUrl?: string;
  refreshTick?: number;
  index?: number;
  baseColor: string;
}

const TrackedSvgIcon = memo(
  ({ item, fallbackLogoUrl, refreshTick = 0, index = 0, baseColor }: TrackedSvgIconProps) => {
    const [xmlContent, setXmlContent] = useState<string | null>(null);
    const [failed, setFailed] = useState(false);
    const cancelledRef = useRef(false);

    useEffect(() => {
      cancelledRef.current = false;
      setFailed(false);
      setXmlContent(null);

      if (!item.svg) {
        setFailed(true);
        return;
      }

      if (svgCache[item.svg]) {
        setXmlContent(svgCache[item.svg]);
        return;
      }

      const secureSvgUrl = encodeSvgUrl(item.svg);
      const staggerDelay = Math.min(index * 120, 1200);

      const timer = setTimeout(() => {
        if (cancelledRef.current) return;
        fetchSvgWithRetry(secureSvgUrl, () => cancelledRef.current)
          .then((xml) => {
            if (cancelledRef.current) return;
            svgCache[item.svg] = xml;
            setXmlContent(xml);
          })
          .catch(() => {
            if (cancelledRef.current) return;
            setFailed(true);
          });
      }, staggerDelay);

      return () => {
        cancelledRef.current = true;
        clearTimeout(timer);
      };
    }, [item.svg, refreshTick]);

    const imageSource = fallbackLogoUrl
      ? { uri: fallbackLogoUrl, priority: FastImage.priority.normal }
      : { uri: REMOTE_FALLBACK_URL, priority: FastImage.priority.normal };

    if (failed || (!xmlContent && !item.svg)) {
      return (
        <NeomorphIconBase baseColor={baseColor}>
          <FastImage
            source={imageSource}
            style={styles.iconImage}
            resizeMode={FastImage.resizeMode.contain}
          />
        </NeomorphIconBase>
      );
    }

    if (!xmlContent) {
      return (
        <NeomorphIconBase baseColor={baseColor} isLoading>
          <FastImage
            source={imageSource}
            style={[styles.iconImage, { opacity: 0.5 }]}
            resizeMode={FastImage.resizeMode.contain}
          />
        </NeomorphIconBase>
      );
    }

    return (
      <NeomorphIconBase baseColor={baseColor}>
        <SvgXml xml={xmlContent} height={wScale(40)} width={wScale(40)} />
      </NeomorphIconBase>
    );
  }
);

// ─── Main Component ──────────────────────────────────────────────────────────
const IconButtons = ({
  getItem,
  isQuickAccess,
  iconButtonstyle,
  buttonData,
  section = "unknown",
  showViewMoreButton = false,
  setViewMoreStatus = (p0: (prev: any) => boolean) => {},
  buttonTitle = "",
  refreshTick = 0,
}: any) => {
  const { isDemoUser, logoUrl, colorConfig } = useSelector((state: RootState) => state.userInfo);
  const { post } = useAxiosHook();
  const navigation = useNavigation();
  const [Radius1, setRadius1] = useState(0);

  const baseSurfaceColor = colorConfig?.primaryColor || "#D81B60"; // Fallback pink

  useEffect(() => {
    (async () => {
      try {
        const res = await post({ url: APP_URLS.signUpSvg });
        if (res?.[0]?.Radius1) setRadius1(res[0].Radius1);
      } catch (e) {
        console.error("Radius fetch error:", e);
      }
    })();
  }, []);

  const saveItemToStorage = async (item: sectionData) => {
    try {
      const saved = await AsyncStorage.getItem("quickAccessItems");
      let arr = saved ? JSON.parse(saved) : [];
      if (arr.some((x: sectionData) => x.name === item.name)) {
        ToastAndroid.show(item.name + " " + translate("is_already_exists"), ToastAndroid.SHORT);
        return;
      }
      arr.unshift(item);
      if (arr.length > MAX_ITEMS) arr.pop();
      await AsyncStorage.setItem("quickAccessItems", JSON.stringify(arr));
      getItem?.();
    } catch (e) {
      console.error("AsyncStorage error:", e);
    }
  };

  const comingSoon = [
    "BusinessCardScreen",
    "GiftCardScreen",
    "PrepaidCardScreen",
    "FlightScreen",
    "TrainScreen",
    "HotelScreen",
    "BusScreen",
  ];

  const loaderImageSource = logoUrl
    ? { uri: logoUrl, priority: FastImage.priority.low }
    : { uri: REMOTE_FALLBACK_URL, priority: FastImage.priority.low };

  return (
    <FlashList
      style={[iconButtonstyle, { justifyContent: "space-between", alignSelf: "stretch" }]}
      data={buttonData}
      ListEmptyComponent={() => (
        <View style={{ flexDirection: "row", alignSelf: "stretch" }}>
          {loader.map((item) => (
            <View key={item.id} style={styles.element}>
              <NeomorphIconBase baseColor={baseSurfaceColor} isLoading>
                <FastImage
                  source={loaderImageSource}
                  style={[styles.iconImage, { opacity: 0.3 }]}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </NeomorphIconBase>
              <View style={styles.textPlaceholder} />
            </View>
          ))}
        </View>
      )}
      numColumns={4}
      estimatedItemSize={20}
      extraData={[buttonData, refreshTick]}
      renderItem={({ item, index }: { item: sectionData; index: number }) => (
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (comingSoon.includes(item.ScreenName)) {
              Alert.alert(
                "Coming Soon",
                "This feature is currently under development.\nIt will be available soon.",
                [{ text: "OK" }]
              );
              return;
            }
            if (item.ScreenName === "AepsScreen" && isDemoUser === true) {
              Alert.alert("Demo Account", "This is a demo account. Live AEPS transactions not enabled.");
              return;
            }
            if (isQuickAccess) {
              saveItemToStorage(item);
              return;
            }

            switch (item.ScreenName) {
              case "HideMoreScreen":
                setViewMoreStatus((p: any) => !p);
                break;
              case "ViewMoreScreen":
                setViewMoreStatus(true);
                break;
              default:
                navigation.navigate(item.ScreenName as never);
                break;
            }
          }}
          style={styles.element}
        >
          <TrackedSvgIcon
            item={item}
            section={section}
            fallbackLogoUrl={logoUrl}
            refreshTick={refreshTick}
            index={index}
            baseColor={baseSurfaceColor}
          />

          <Text style={styles.screeitemname} numberOfLines={2}>
            {translate(item.name)}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
};

export default memo(IconButtons);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  element: {
    paddingHorizontal: wScale(4),
    paddingVertical: wScale(8),
    alignItems: "center",
    justifyContent: "flex-start",
    marginHorizontal: wScale(2),
    flex: 1,
  },

  // ── Neomorphic Card Styles ──
  cardOuterShadow: {
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
    marginBottom: hScale(6), 
  },
  cardGradientWrapper: {
    borderRadius: 16,
    padding: 1.5, // Acts as the 3D stroke border
  },
  cardSurface: {
    borderRadius: 14.5,
    height: wScale(55),
    width: wScale(55),
    justifyContent: "center",
    alignItems: "center",
  },
  
  iconCardLoading: {
    opacity: 0.7,
  },
  iconImage: {
    width: wScale(30),
    height: wScale(30),
  },

  textPlaceholder: {
    width: wScale(36),
    height: hScale(7),
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    marginTop: hScale(4),
  },
  screeitemname: {
    color: "#FFFFFF",
    textAlign: "center",
    fontSize: wScale(10.5),
    fontWeight: "500", // Thoda bold taaki chote size mein clear padhne aaye
    marginTop: 2,
    letterSpacing: 0.1,
    // Text shadow add kiya taaki bright background pe clear dikhe
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});