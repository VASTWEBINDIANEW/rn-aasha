import { translate } from "../../utils/languageUtils/I18n";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Alert, Pressable, RefreshControl, ScrollView,
  StatusBar, TouchableOpacity, Animated,
  View, Text, StyleSheet, Image,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import IconButtons from "./components/IconButtons";
import CarouselView from "./components/CarouselView";
import { hScale, wScale } from "../../utils/styles/dimensions";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../reduxUtils/store";
import useAxiosHook from "../../utils/network/AxiosClient";
import { APP_URLS, IMAGE_BASE_URL } from "../../utils/network/urls";
import { sectionData } from "./utils";
import DashboardHeader from "./components/DashboardHeader";
import { useNavigation } from "../../utils/navigation/NavigationService";
import LottieView from "lottie-react-native";
import { decryptData } from "../../utils/encryptionUtils";
import { reset, setDashboardData, setIsDemoUser, setThemeChangeTime } from "../../reduxUtils/store/userInfoSlice";
import HoldcreditSvg from "../drawer/svgimgcomponents/HoldcreditSvg";
import ToselfSvg from "../drawer/svgimgcomponents/ToselfSvg";
import RecentTrSvg from "../drawer/svgimgcomponents/RecentTrSvg";
import NewsSlider from "../../components/SliderText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import QrcodSvg from '../drawer/svgimgcomponents/QrcodSvg';
import FastImage from "react-native-fast-image";
import { getAssetSource } from "../../utils/network/NetWorkImages";
import payon4uStaticData from "../../../src/utils/payon4u_dashboard.json";
import firestore from '@react-native-firebase/firestore';

// ─── Glow Orbs ───────────────────────────────────────────────────────────────
const GlowOrbs = ({ primaryColor }: { primaryColor: string }) => (
  <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
    <View style={[styles.orb, {
      top: -80, left: -80, width: 240, height: 240,
      backgroundColor: `${primaryColor}70`,
    }]} />
    <View style={[styles.orb, {
      top: 200, right: -100, width: 280, height: 280,
      backgroundColor: `${primaryColor}28`,
    }]} />
    <View style={[styles.orb, {
      top: 500, left: 20, width: 180, height: 180,
      backgroundColor: "rgba(5,150,105,0.15)",
    }]} />
    <View style={[styles.orb, {
      bottom: 100, right: 10, width: 200, height: 200,
      backgroundColor: "rgba(219,39,119,0.14)",
    }]} />
  </View>
);

// ─── Glass Section Card ───────────────────────────────────────────────────────
interface GlassSectionProps {
  title: string;
  rightElement?: React.ReactNode;
  children: React.ReactNode;
}

const GlassSection = ({
  title,
  rightElement,
  children,
}: GlassSectionProps) => {

  const { colorConfig } = useSelector(
    (state: RootState) => state.userInfo
  );

  return (
    <View style={styles.glassSection}>
      {/* Glass fill */}
      <LinearGradient
        colors={["rgba(13, 8, 8, 0.13)", "rgba(255,255,255,0.04)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Top shimmer */}
      <LinearGradient
        colors={[colorConfig.secondaryColor, colorConfig.secondaryColor]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.sectionTopShimmer}
      />

      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {rightElement}
      </View>

      <View style={styles.sectionContent}>
        {children}
      </View>
    </View>
  );
};

// ─── Quick Action Button ──────────────────────────────────────────────────────
interface QuickBtnProps {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  primaryColor: string;
}

const QuickBtn = ({ icon, label, onPress, primaryColor }: QuickBtnProps) => (
  <TouchableOpacity activeOpacity={0.72} onPress={onPress} style={styles.quickBtnOuter}>
    <LinearGradient
      colors={["rgba(255,255,255,0.22)", "rgba(255,255,255,0.06)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFillObject}
    />
    <LinearGradient
      colors={["rgba(255,255,255,0.5)", "rgba(255,255,255,0)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.quickBtnShimmer}
    />
    <View style={[styles.quickBtnIcon, { backgroundColor: `${primaryColor}55` }]}>
      {icon}
    </View>
    <Text style={styles.quickBtnText}>{label}</Text>
  </TouchableOpacity>
);

// ─── Screen ───────────────────────────────────────────────────────────────────
const HomeScreen = () => {
  const { colorConfig, needUpdate, dashboardData, userId, themeChangeTime } =
    useSelector((state: RootState) => state.userInfo);

  const [rechargeSectionData, setRechargeSectionData] = useState<sectionData[]>([]);
  const [financeSectionData,  setFinanceSectionData]  = useState<sectionData[]>([]);
  const [rechargeViewMoreData,setRechargeViewMoreData]= useState<sectionData[]>([]);
  const [viewMoreStatus,      setViewMoreStatus]      = useState(false);
  const [otherSectionData,    setOtherSectionData]    = useState<sectionData[]>([]);
  const [travelSectionData,   setTravelSectionData]   = useState<sectionData[]>([]);
  const [cmsSectionData,      setCmsSectionData]      = useState<sectionData[]>([]);
  const [sliderImages,        setSliderImages]        = useState<any[]>([]);
  const [refreshing,          setRefreshing]          = useState(false);
  const [savedItems,          setSavedItems]          = useState([]);
  const [newsData,            setNewsData]            = useState([]);
  const [adminFirmDet,        setAdminFirmDet]        = useState<any>();
  const [FirmDet,             setFirmDet]             = useState<any>();
  const [is_demo,             setId_Demo]             = useState(false);

  const { post, get } = useAxiosHook();
  const navigation     = useNavigation();
  const dispatch       = useDispatch();

  const scaleValue = useRef(new Animated.Value(1)).current;

  // Zoom animation loop
  useEffect(() => {
    const zoomInOut = () => {
      Animated.sequence([
        Animated.timing(scaleValue, { toValue: 1,   duration: 1000, useNativeDriver: true }),
        Animated.timing(scaleValue, { toValue: 0.8, duration: 1000, useNativeDriver: true }),
      ]).start(() => zoomInOut());
    };
    zoomInOut();
  }, [scaleValue]);

  // APIs Definitions
  const Newssms = async () => {
    try {
      const res = await get({ url: APP_URLS.getProfile });
      if (res && res.data) {
        JSON.parse(decryptData(res.value1, res.value2, res.data));
      }
      const response = await get({ url: APP_URLS.NewsNotifaction });
      if (response && response.Status) setNewsData(response.data);
    } catch (_) {}
  };

  const fetchGitStatus = async () => {
    try {
      const documentSnapshot = await firestore()
        .collection('Otadata')
        .doc('otaData')
        .collection('imagedata')
        .doc('data')
        .get();

      if (documentSnapshot.exists) {
        const data = documentSnapshot.data();
        return data ? data.status : null; 
      } else {
        return null;
      }
    } catch (error) {
      console.error('Status read error:', error);
      return null;
    }
  };

  const fetchData = async () => {
    try {
      Newssms();
      const imgsts = await fetchGitStatus();
      const storedItems = await AsyncStorage.getItem("quickAccessItems");
      const userData = await AsyncStorage.getItem("expiryDate");
      const date = new Date();

      if (userData === date.toUTCString()) {
        Alert.alert(
          "Session Expired",
          userData,
          [{ text: "OK", onPress: () => dispatch(reset()) }],
          { cancelable: false }
        );
        return;
      }

      if (storedItems) {
        setSavedItems(JSON.parse(storedItems));
      }

      let backendTime = null;

      try {
        const themeResponse = await post({
          url: APP_URLS.ThemeChangeTime,
        });
        backendTime = themeResponse?.FullDateTime || null;
      } catch (error) {
        console.log("❌ ThemeChangeTime Error:", error);
      }

      const localTime = themeChangeTime?.themeUpdateTime;

      const useStaticData =
        APP_URLS.AppName === "payon4u" ||
        APP_URLS.AppName === "Recharge Drishti" ||
        imgsts === true;

      if (
        !useStaticData &&
        backendTime &&
        backendTime === localTime &&
        dashboardData &&
        Object.keys(dashboardData).length > 0
      ) {
        console.log("🟢 USING CACHED DATA (No API Calls)");
        setFinanceSectionData(dashboardData.financeSectionData || []);
        setOtherSectionData(dashboardData.otherSectionData || []);
        setTravelSectionData(dashboardData.travelSectionData || []);
        setCmsSectionData(dashboardData.cmsSectionData || []);

        const filtered = dashboardData.rechargeSectionData?.filter(
          item => item.name !== "Hide More"
        ) || [];
        const first7 = filtered.slice(0, 7);
        const vmItem = filtered.find(item => item.name === "View More");

        setRechargeSectionData(vmItem ? [...first7, vmItem] : first7);
        setRechargeViewMoreData(filtered);
        return;
      }

      console.log("⏳ Fetching Fresh Data from APIs...");
      const [rRes, fRes, oRes, tRes, cRes] = await Promise.all([
        post({ url: APP_URLS.getRechargeSectionImages }).catch(() => []),
        post({ url: APP_URLS.getFinanceSectionImages }).catch(() => []),
        post({ url: APP_URLS.getOtherSectionImages }).catch(() => []),
        post({ url: APP_URLS.getTravelSectionImages }).catch(() => []),
        post({ url: APP_URLS.getcmsSectionImages }).catch(() => []),
      ]);

      let finalRecharge = rRes || [];
      let finalFinance = fRes || [];
      let finalOther = oRes || [];
      let finalTravel = tRes || [];
      let finalCms = cRes || [];

      if (useStaticData) {
        console.log("🟠 OVERRIDING WITH STATIC GIT DATA");
        const mapGitUrls = (dataArray = []) =>
          dataArray.map(item => ({
            name: item.name,
            ScreenName: item.ScreenName,
            svg: `${IMAGE_BASE_URL}payon4u/${item.fileName}`,
          }));

        finalRecharge = mapGitUrls(payon4uStaticData?.recharge);
        finalFinance = mapGitUrls(payon4uStaticData?.financial);
        finalOther = mapGitUrls(payon4uStaticData?.other);
        finalTravel = mapGitUrls(payon4uStaticData?.travel);
        finalCms = mapGitUrls(payon4uStaticData?.cms);
      }
console.log(finalCms,)
      const filtered = finalRecharge?.filter(
        item => item.name !== "Hide More" && item.name !== "Hide More1"
      ) || [];

      const first7 = filtered.slice(0, 7);
      const vmItem = filtered.find(item => item.name === "View More");

      setRechargeSectionData(vmItem ? [...first7, vmItem] : first7);
      setRechargeViewMoreData(filtered);
      setFinanceSectionData(finalFinance);
      setOtherSectionData(finalOther);
      setTravelSectionData(finalTravel);
      setCmsSectionData(finalCms);

      dispatch(
        setDashboardData({
          rechargeSectionData: finalRecharge,
          financeSectionData: finalFinance,
          otherSectionData: finalOther,
          travelSectionData: finalTravel,
          cmsSectionData: finalCms,
        })
      );

      if (backendTime) {
        dispatch(setThemeChangeTime({ themeUpdateTime: backendTime }));
      }
    } catch (error) {
      console.error("❌ Fetch Data Error:", error);
    }
  };

  const getData = async () => {
    try {
      await post({ url: `Retailer/api/data/Rem_CallAutofundtransfer?userid=${userId}` });
      const userInfo = await get({ url: APP_URLS.getUserInfo });
      
      if (userInfo && userInfo.data) {
        const data = userInfo.data;
        const decryptedFirmDet = data.frmanems ? decryptData(data.vvvv, data.kkkk, data.frmanems) : "";
        const decryptedAdminFirmDet = data.adminfarmname ? decryptData(data.vvvv, data.kkkk, data.adminfarmname) : "";
        const decryptedPhotos = data.photoss ? decryptData(data.vvvv, data.kkkk, data.photoss) : "";

        setFirmDet(decryptedFirmDet);
        setAdminFirmDet(decryptedAdminFirmDet);

        await AsyncStorage.setItem("adminFarmData", JSON.stringify({
          adminFarmName: decryptedAdminFirmDet,
          frmanems:      decryptedFirmDet,
          photoss:       decryptedPhotos,
        }));
      }
    } catch (error) {
      console.error("Error in getData init:", error);
    }
  };

  const adharpanStatus = async () => {
    try {
      const userInfo = await get({ url: APP_URLS.getUserInfo });
      if (userInfo && userInfo.data) {
        dispatch(setIsDemoUser(userInfo));
        setId_Demo(userInfo.data.Demo_User);
        const APstatus = await get({ url: `${APP_URLS.AddharPanStatus}=${userId}` });
        if (!APstatus) return;
        let isVerify = true;
        if      (APstatus.verify_type === "all")    isVerify = APstatus.aadhar_status && APstatus.pan_status;
        else if (APstatus.verify_type === "aadhar") isVerify = APstatus.aadhar_status === true;
        else if (APstatus.verify_type === "pan")    isVerify = APstatus.pan_status    === true;
      }
    } catch (e) {
      console.error("Error in adharpanStatus:", e);
    }
  };

  // Pull to Refresh Handler
  const onRefresh = useCallback(() => {
    setViewMoreStatus(false);
    setRefreshing(true);
    Promise.all([getData(), adharpanStatus(), fetchData()]).then(() => {
      setRefreshing(false);
    });
  }, [userId]);

  // Initial Load
  useEffect(() => {
    setViewMoreStatus(false);
    setRefreshing(true);
    Promise.all([getData(), fetchData(), adharpanStatus()]).then(() => {
      setRefreshing(false);
    });
  }, []);

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />

      {/* Full-screen gradient */}
      <LinearGradient
        colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Ambient orbs */}
      <GlowOrbs primaryColor={colorConfig.primaryColor} />

      <DashboardHeader refreshPress={onRefresh} />

      {/* News ticker */}
      <NewsSlider data={newsData} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colorConfig.primaryColor}
            colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
          />
        }
      >
        {/* ── Quick Access ── */}
        {APP_URLS.AppName !== "Divyanshi Pay" && (
          <View style={styles.glassSection}>
            <LinearGradient
              colors={[colorConfig.secondaryColor, colorConfig.secondaryColor]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFillObject}
            />
            <LinearGradient
              colors={["rgba(255,255,255,0.45)", "rgba(255,255,255,0)"]}
              start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
              style={styles.sectionTopShimmer}
            />

            <View style={styles.quickAccessHeader}>
              <View style={styles.qaLeft}>
                <Text style={styles.qaHi}>{translate("Hi.")}</Text>
                <Text style={styles.qaName} numberOfLines={1} ellipsizeMode="tail">
                  {FirmDet}
                </Text>
                <Text style={styles.qaHi}>{translate("Your_Quick_Access")}</Text>
              </View>
              <Pressable
                onPress={() => navigation.navigate({ name: "QuickAccessScreen" })}
                style={[styles.editBtn, { backgroundColor: `${colorConfig.secondaryColor}90` }]}
              >
                <LottieView
                  autoPlay loop
                  style={styles.lotiSmall}
                  source={require("../../utils/lottieIcons/pencil.json")}
                />
              </Pressable>
            </View>

            <View style={styles.sectionContent}>
              <IconButtons
                buttonData={savedItems?.length > 0 ? savedItems : APP_URLS.AppName == 'World Pay One' ? financeSectionData : otherSectionData}
              />
            </View>
          </View>
        )}

        {/* ── Carousel ── */}
        <View style={styles.carouselWrap}>
          <CarouselView />
        </View>

        {/* ── Recharge Section ── */}
        <GlassSection
          title={translate("Recharge_Pay_Bill")}
          rightElement={
            <FastImage
              source={getAssetSource("bblogo.png")}
              style={styles.bblogo}
            />
          }
        >
          <IconButtons
            buttonData={viewMoreStatus ? rechargeViewMoreData : rechargeSectionData}
            showViewMoreButton
            setViewMoreStatus={setViewMoreStatus}
            buttonTitle={viewMoreStatus ? "Hide More" : "View More"}
            getItem={undefined}
            isQuickAccess={undefined}
            iconButtonstyle={undefined}
          />
        </GlassSection>

        {/* ── CMS ── */}
        {!is_demo && (
          <GlassSection
            title={translate("Our_Exclusive_CMS")}
            rightElement={
              <FastImage
                source={getAssetSource(`${APP_URLS.cms_logo}`)}
                style={styles.cmsLogo}
              />
            }
          >
            <IconButtons
              buttonData={cmsSectionData}
              getItem={undefined}
              isQuickAccess={undefined}
              iconButtonstyle={undefined}
            />
          </GlassSection>
        )}

        {/* ── Financial Services ── */}
        {APP_URLS.AppName !== "World Pay One" && (
          <GlassSection
            title={translate("Financial_Services")}
            rightElement={
              <LottieView
                autoPlay loop
                style={styles.lotiRight}
                source={require("../../utils/lottieIcons/Money-bag2")}
              />
            }
          >
            {financeSectionData.length === 4 && (
              <Animated.Text
                style={[styles.newBadge, { transform: [{ scale: scaleValue }] }]}
              >
                New
              </Animated.Text>
            )}
            <IconButtons
              buttonData={financeSectionData}
              getItem={undefined}
              isQuickAccess={undefined}
              iconButtonstyle={undefined}
            />
          </GlassSection>
        )}

        {/* ── Travel ── */}
        {!is_demo && APP_URLS.AppName !== "Divyanshi Pay" && (
          <GlassSection
            title={translate("Travel_Hotel")}
            rightElement={
              <LottieView
                autoPlay loop
                style={styles.lotiRight}
                source={require("../../utils/lottieIcons/Travel.json")}
              />
            }
          >
            <IconButtons buttonData={travelSectionData} />
          </GlassSection>
        )}

        {/* ── Other Section ── */}
        {!is_demo && APP_URLS.AppName !== "Divyanshi Pay" && (
          <GlassSection title={translate("Other_Section")}>
            <IconButtons buttonData={otherSectionData} />
          </GlassSection>
        )}
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, paddingBottom: hScale(30) },

  orb: { position: "absolute", borderRadius: 999 },

  scrollContent: {
    paddingHorizontal: wScale(10),
    paddingTop: hScale(0),
    paddingBottom: hScale(80),
  },

  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: hScale(10),
    gap: wScale(6),
  },
  quickBtnOuter: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    paddingVertical: hScale(10),
    paddingHorizontal: wScale(4),
  },
  quickBtnShimmer: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: hScale(30),
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  quickBtnIcon: {
    height: hScale(34),
    width: hScale(34),
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: hScale(5),
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  quickBtnText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: wScale(11),
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  glassSection: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    marginVertical: hScale(6),
    position: "relative",
  },
  sectionTopShimmer: {
    position: "absolute",
    top: 0, left: 0, right: 0,
    height: hScale(32),
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: hScale(5),
    paddingHorizontal: wScale(14),
    paddingRight: wScale(12),
  },
  sectionTitle: {
    fontSize: wScale(15),
    color: "rgba(255,255,255,0.95)",
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    letterSpacing: 0.3,
  },
  sectionContent: {
    paddingTop: hScale(10),
  },

  quickAccessHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: wScale(14),
    paddingTop: hScale(5),
    paddingBottom: hScale(4),
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  qaLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    flex: 1,
  },
  qaHi: {
    fontSize: wScale(13),
    color: "rgba(255,255,255,0.85)",
    marginRight: wScale(4),
  },
  qaName: {
    fontSize: wScale(13),
    color: "#fff",
    fontWeight: "bold",
    maxWidth: wScale(130),
    marginRight: wScale(4),
  },
  editBtn: {
    height: wScale(28),
    width: wScale(28),
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  lotiSmall: { height: hScale(18), width: wScale(18) },

  carouselWrap: { marginVertical: hScale(0) },

  bblogo: { height: wScale(25), width: wScale(20) },
  cmsLogo: { height: wScale(25), width: wScale(25) },
  lotiRight: {
    height: hScale(46),
    width: wScale(38),
    position: 'absolute',
    right: wScale(10),
  },

  newBadge: {
    backgroundColor: "red",
    position: "absolute",
    right: wScale(31),
    top: hScale(10),
    zIndex: 20,
    color: "#fff",
    textAlign: "center",
    fontSize: wScale(12),
    borderRadius: 3,
    paddingHorizontal: wScale(4),
    paddingVertical: hScale(1),
    overflow: "hidden",
  },
});

export default memo(HomeScreen);