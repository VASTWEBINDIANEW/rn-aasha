import React, { memo, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ToastAndroid, Alert } from "react-native";
import { SvgXml } from "react-native-svg";
import { FlashList } from "@shopify/flash-list";
import { useSelector } from "react-redux";
import { RootState } from "../../../reduxUtils/store";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import BackArrow from "../../../utils/svgUtils/BackArrow";
import { sectionData } from "../utils";
import { useNavigation } from "@react-navigation/native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { colors } from "../../../utils/styles/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APP_URLS } from "../../../utils/network/urls";
import useAxiosHook from "../../../utils/network/AxiosClient";
import { translate } from "../../../utils/languageUtils/I18n";
// import { logSectionDataReceived, logIconRender, logSvgSuccess, logSvgError, logSvgMissingUrl } from "../../../utils/SvgLogger";

const loader = [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }];
const MAX_ITEMS = 4;
const svgCache: Record<string, string> = {};

// ─── TrackedSvgIcon Component (WITH CORRECTIONS) ───────────────────────────
const TrackedSvgIcon = memo(({ item, section }: { item: sectionData; section: string }) => {
  const [xmlContent, setXmlContent] = useState<string | null>(null);
  const [failed,     setFailed]     = useState(false);

  useEffect(() => {
    if (!item.svg) {
      //logSvgMissingUrl(item.name, section);
      setFailed(true);
      return;
    }

    //logIconRender(item.name, item.svg, section);

    if (svgCache[item.svg]) {
      setXmlContent(svgCache[item.svg]);
      //logSvgSuccess(item.name, item.svg);
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
        //logSvgSuccess(item.name, item.svg);
      })
      .catch(err => {
        if (cancelled) return;
        setFailed(true); // Trigger immediate fallback
        //logSvgError(item.name, item.svg, err);
      });

    return () => { cancelled = true; };
  }, [item.svg]);

  // 🔥 FIXED LOGIC SEQUENCE: Error handles take precedence over infinite loading loops
  if (failed) {
    return (
      <View style={styles.InputImage}>
        <BackArrow />
      </View>
    );
  }

  if (!xmlContent) {
    return (
      <SkeletonPlaceholder speed={1200} backgroundColor={colors.gray} borderRadius={4}>
        <SkeletonPlaceholder.Item width={wScale(45)} height={wScale(45)} borderRadius={wScale(45)} />
      </SkeletonPlaceholder>
    );
  }

  return (
    <View style={styles.InputImage}>
      <SvgXml xml={xmlContent} height={wScale(50)} width={wScale(50)} />
    </View>
  );
});

// ─── Main IconButtons Component ──────────────────────────────────────────────
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
  const { isDemoUser } = useSelector((state: RootState) => state.userInfo);
  const { post }       = useAxiosHook();
  const navigation     = useNavigation();

  useEffect(() => {
    if (buttonData?.length > 0) {
      //logSectionDataReceived(section, buttonData.length, buttonData[0]?.svg);
    }
  }, [buttonData, section]);

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
    } catch (e) { console.error(e); }
  };

  const comingSoon = [
    "BusinessCardScreen", "GiftCardScreen", "PrepaidCardScreen",
    "FlightScreen", "TrainScreen", "HotelScreen", "BusScreen",
  ];

  return (
    <FlashList
      style={[iconButtonstyle, { justifyContent: "space-between", alignSelf: "stretch" }]}
      data={buttonData}
      ListEmptyComponent={() => (
        <View style={{ flexDirection: "row" }}>
          {loader.map((item) => (
            <View key={item.id} style={{ marginHorizontal: wScale(18) }}>
              <SkeletonPlaceholder speed={1200} backgroundColor={colors.gray} borderRadius={4}>
                <SkeletonPlaceholder.Item alignItems="center">
                  <SkeletonPlaceholder.Item width={wScale(45)} height={wScale(45)} borderRadius={wScale(45)} />
                  <SkeletonPlaceholder.Item margin={wScale(10)} width={wScale(40)} height={wScale(10)} />
                </SkeletonPlaceholder.Item>
              </SkeletonPlaceholder>
            </View>
          ))}
        </View>
      )}
      numColumns={4}
      estimatedItemSize={20}
      renderItem={({ item }: { item: sectionData; index: number }) => (
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
          <TrackedSvgIcon item={item} section={section} />
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
<<<<<<< HEAD
  element: { paddingHorizontal: wScale(2), paddingVertical: wScale(8), alignItems: "center", justifyContent: "center", marginHorizontal: wScale(2), flex: 1 },
  InputImage: { height: wScale(50), width: wScale(50), shadowRadius: 3, elevation: 2, alignItems: "center", justifyContent:"center" },
  screeitemname: { color: "white", textAlign: "center", fontSize: wScale(12) },
});
=======
  container: {
    flex: 1,
    justifyContent: "center",
  },
  element: {
    paddingHorizontal: wScale(2),
    paddingVertical: wScale(8),
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: wScale(2),
    flex: 1,
  },
  InputImage: {
    height: wScale(50),
    width: wScale(50),
    shadowRadius: 3,
    elevation: 2,
    alignItems: "center",
  },
  morebtn: {
    paddingVertical: wScale(8),
    padding: wScale(7),
    alignItems: "center",
    width: "100%",
  },
  imgview: {
    // backgroundColor: "#fff",
    height: wScale(50),
    width: wScale(50),
    shadowRadius: 3,
    elevation: 2,
    alignItems: "center",
    justifyContent: "center",
    // transform: [{ rotate: '90deg' }]
  },
  screeitemname: {
    color: "white",
    textAlign: "center",
    fontSize: wScale(11),
  },
});
>>>>>>> 08ebad6f0a6700f4c9dd59d28ba7ab6b5c7139cd
