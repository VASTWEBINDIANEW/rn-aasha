// features/dashboard/components/IconButtons.tsx
import React, { memo, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ToastAndroid,
  Alert,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { FlashList } from "@shopify/flash-list";
import { useSelector } from "react-redux";
import { RootState } from "../../../reduxUtils/store";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import { sectionData } from "../utils";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_URLS } from "../../../utils/network/urls";
import useAxiosHook from "../../../utils/network/AxiosClient";
import { translate } from "../../../utils/languageUtils/I18n";
import FastImage from "react-native-fast-image"; 
import {
  logSectionDataReceived,
  logIconRender,
  logSvgSuccess,
  logSvgError,
  logSvgMissingUrl,
} from "../../../utils/SvgLogger";

const loader = [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }];
const MAX_ITEMS = 4;

// ─── SVG fetch cache — एक बार fetch होने के बाद मेमोरी से तुरंत लोड होगा ───
const svgCache: Record<string, string> = {};

// ─── Remote Fallback URL (लोकल require एसेट्स पूरी तरह हटा दिए गए हैं) ───
const REMOTE_FALLBACK_URL = `http://native.${APP_URLS.baseWebUrl}//SvgOperatorImage/exclamation-mark.png`;

// ─── Per-item SVG Component ────────────────────────────────────────────────
interface TrackedSvgIconProps {
  item: sectionData;
  section: string;
  fallbackLogoUrl?: string; 
}

const TrackedSvgIcon = memo(({
  item,
  section,
  fallbackLogoUrl,
}: TrackedSvgIconProps) => {
  const [xmlContent, setXmlContent] = useState<string | null>(null);
  const [failed,     setFailed]     = useState(false);

  useEffect(() => {
    if (!item.svg) {
      logSvgMissingUrl(item.name, section);
      setFailed(true);
      return;
    }

    logIconRender(item.name, item.svg, section);

    if (svgCache[item.svg]) {
      setXmlContent(svgCache[item.svg]);
      logSvgSuccess(item.name, item.svg);
      return;
    }

    // HTTP to HTTPS secure protocol auto-conversion
    const secureSvgUrl = item.svg.startsWith('http://') 
      ? item.svg.replace('http://', 'https://') 
      : item.svg;

    let cancelled = false;

    // 🔥 Added Custom User-Agent & Accept headers to avoid 403 blocks
    fetch(secureSvgUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/svg+xml, application/xml, text/xml, */*',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36',
      }
    })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
        return res.text();
      })
      .then(xml => {
        if (cancelled) return;
        
        // Block HTML error responses returning instead of actual raw xml
        if (xml.trim().startsWith('<html') || xml.trim().startsWith('<!DOCTYPE html')) {
          throw new Error("Server returned an HTML page instead of valid SVG payload.");
        }

        svgCache[item.svg] = xml;
        setXmlContent(xml);
        logSvgSuccess(item.name, item.svg);
      })
      .catch(err => {
        if (cancelled) return;
        setFailed(true); // Trigger immediate fallback
        logSvgError(item.name, item.svg, err);
      });

    return () => { cancelled = true; };
  }, [item.svg]);

  // इमेज सोर्स लॉजिक: पहले Redux का logoUrl चेक करेगा, खाली होने पर फॉलबैक यूआरएल लेगा
  const imageSource = fallbackLogoUrl 
    ? { uri: fallbackLogoUrl, priority: FastImage.priority.normal } 
    : { uri: REMOTE_FALLBACK_URL, priority: FastImage.priority.normal };

  // 1. ERROR/MISSING STATE
  if (failed || (!xmlContent && !item.svg)) {
    return (
      <View style={styles.InputImage}>
        <FastImage 
          source={imageSource} 
          style={styles.defaultImageStyle} 
          resizeMode={FastImage.resizeMode.contain}
        />
      </View>
    );
  }

  // 2. LOADING STATE
  if (!xmlContent) {
    return (
      <View style={styles.InputImage}>
        <FastImage 
          source={imageSource} 
          style={[styles.defaultImageStyle, { opacity: 0.6 }]} 
          resizeMode={FastImage.resizeMode.contain}
        />
      </View>
    );
  }

  // 3. SUCCESS STATE
  return (
    <View style={styles.InputImage}>
      <SvgXml
        xml={xmlContent}
        height={wScale(50)}
        width={wScale(50)}
      />
    </View>
  );
});

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
}) => {
  const { isDemoUser, logoUrl } = useSelector((state: RootState) => state.userInfo);
  const { post }                = useAxiosHook();
  const navigation              = useNavigation();
  const [Radius1,               setRadius1] = useState(0);

  useEffect(() => {
    if (buttonData?.length > 0) {
      logSectionDataReceived(section, buttonData.length, buttonData[0]?.svg);
    }
  }, [buttonData, section]);

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
    "BusinessCardScreen", "GiftCardScreen", "PrepaidCardScreen",
    "FlightScreen", "TrainScreen", "HotelScreen", "BusScreen",
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
              <View style={styles.InputImage}>
                <FastImage 
                  source={loaderImageSource} 
                  style={[styles.defaultImageStyle, { opacity: 0.3 }]} 
                  resizeMode={FastImage.resizeMode.contain}
                />
              </View>
              <View style={styles.textPlaceholder} />
            </View>
          ))}
        </View>
      )}
      numColumns={4}
      estimatedItemSize={20}
      renderItem={({ item, index }: { item: sectionData; index: number }) => (
        <TouchableOpacity
          onPress={() => {
            if (comingSoon.includes(item.ScreenName)) {
              Alert.alert("Coming Soon", "This feature is currently under development.\nIt will be available soon.", [{ text: "OK" }]);
              return;
            }
            if (item.ScreenName === "AepsScreen" && isDemoUser === true) {
              Alert.alert("Demo Account", "This is a demo account. Live AEPS transactions not enabled.");
              return;
            }
            if (isQuickAccess) { saveItemToStorage(item); return; }

            switch (item.ScreenName) {
              case "HideMoreScreen": setViewMoreStatus((p) => !p); break;
              case "ViewMoreScreen": setViewMoreStatus(true); break;
              default: navigation.navigate(item.ScreenName as never); break;
            }
          }}
          style={styles.element}
        >
          <TrackedSvgIcon item={item} section={section} fallbackLogoUrl={logoUrl} />
          
          <Text style={styles.screeitemname} numberOfLines={2}>
            {translate(item.name)}
          </Text>
        </TouchableOpacity>
      )}
    />
  );
};

export default memo(IconButtons);

const styles = StyleSheet.create({
  element: {
    paddingHorizontal: wScale(2),
    paddingVertical:   wScale(8),
    alignItems:        "center",
    justifyContent:    "center",
    marginHorizontal:  wScale(2),
    flex:              1,
  },
  InputImage: {
    height:        wScale(50),
    width:         wScale(50),
    shadowRadius:  3,
    elevation:     2,
    alignItems:    "center",
    justifyContent:"center",
  },
  defaultImageStyle: {
    width: wScale(50),  
    height: wScale(50), 
  },
  textPlaceholder: {
    width: wScale(40),
    height: hScale(8),
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
    marginTop: hScale(8),
  },
  screeitemname: {
    color:     "white",
    textAlign: "center",
    fontSize:  wScale(12),
  },
});