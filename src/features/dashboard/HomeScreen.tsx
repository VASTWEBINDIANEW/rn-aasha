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
import { APP_URLS } from "../../utils/network/urls";
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

// ─── Glow Orbs (same as ReportScreen / AccReportScreen) ──────────────────────
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
        colors={["rgba(255,255,255,0.16)", "rgba(255,255,255,0.04)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Top shimmer */}
      <LinearGradient
        colors={[
          `${colorConfig.secondaryColor}E6`,
          `${colorConfig.secondaryColor}00`,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.sectionTopShimmer}
      />

      <View style={styles.sectionTitleRow}>
        <View style={styles.titleWithAccent}>
          <View style={[styles.titleAccent, { backgroundColor: colorConfig.primaryColor }]} />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
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

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleValue, { toValue: 1,   duration: 1000, useNativeDriver: true }),
        Animated.timing(scaleValue, { toValue: 0.8, duration: 1000, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [scaleValue]);

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

  const fetchData = async () => {
    try {
      setRefreshing(true);
      Newssms();

      const storedItems = await AsyncStorage.getItem("quickAccessItems");
      const userData    = await AsyncStorage.getItem("expiryDate");
      const date        = new Date();

      if (userData === date.toUTCString()) {
        Alert.alert("Session Expired", userData,
          [{ text: "OK", onPress: () => dispatch(reset()) }],
          { cancelable: false });
        setRefreshing(false);
        return;
      }
      if (storedItems) setSavedItems(JSON.parse(storedItems));

      let backendTime = null;

      try {
        const themeResponse = await post({
          url: APP_URLS.ThemeChangeTime,
        });
        backendTime = themeResponse?.FullDateTime;
      } catch (error) {
        console.log("ThemeChangeTime API not available, skipping cache check");
      }

      const localTime = themeChangeTime?.themeUpdateTime;

      console.log('====================================');
      console.log(backendTime, localTime);
      console.log('====================================');

      if (
        backendTime &&
        backendTime === localTime &&
        dashboardData &&
        Object.keys(dashboardData).length > 0
      ) {        
        setFinanceSectionData(dashboardData.financeSectionData || []);
        setOtherSectionData(dashboardData.otherSectionData   || []);
        setTravelSectionData(dashboardData.travelSectionData  || []);
        setCmsSectionData(dashboardData.cmsSectionData        || []);
        const filtered = dashboardData.rechargeSectionData?.filter(i => i.name !== "Hide More") || [];
        const first7   = filtered.slice(0, 7);
        const vmItem   = filtered.find(i => i.name === "View More");
        setRechargeSectionData(vmItem ? [...first7, vmItem] : first7);
        setRechargeViewMoreData(filtered);
        setRefreshing(false);
        return;
      }

      // ─── FIX: Promise.allSettled को Promise.all से बदला ताकि पुराने डिवाइसेज पर क्रैश न हो ───
      const [rRes, fRes, oRes, tRes, cRes] = await Promise.all([
        post({ url: APP_URLS.getRechargeSectionImages }).catch(err => { console.log("Recharge API Error:", err); return []; }),
        post({ url: APP_URLS.getFinanceSectionImages }).catch(err => { console.log("Finance API Error:", err); return []; }),
        post({ url: APP_URLS.getOtherSectionImages }).catch(err => { console.log("Other API Error:", err); return []; }),
        post({ url: APP_URLS.getTravelSectionImages }).catch(err => { console.log("Travel API Error:", err); return []; }),
        post({ url: APP_URLS.getcmsSectionImages }).catch(err => { console.log("CMS API Error:", err); return []; }),
      ]);

      const filtered = rRes?.filter((i: any) => i.name !== "Hide More1") || [];
      const first7   = filtered.slice(0, 7);
      const vmItem   = filtered.find((i: any) => i.name === "View More");
      
      setRechargeSectionData(vmItem ? [...first7, vmItem] : first7);
      setRechargeViewMoreData(filtered);
      setFinanceSectionData(fRes || []);
      setOtherSectionData(oRes  || []);
      setTravelSectionData(tRes  || []);
      setCmsSectionData(cRes     || []);

      dispatch(setDashboardData({ 
        rechargeSectionData: rRes || [], 
        financeSectionData: fRes || [],
        otherSectionData: oRes || [], 
        travelSectionData: tRes || [], 
        cmsSectionData: cRes || [] 
      }));

      if (backendTime) {
        dispatch(setThemeChangeTime({ themeUpdateTime: backendTime }));
      }      
      setRefreshing(false);
    } catch (e) {
      console.error("Fetch Data Error:", e);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setViewMoreStatus(false);
    fetchData();
  }, []);

  useEffect(() => {
    setViewMoreStatus(false);
    const getData = async () => {
      try {
        await post({ url: `Retailer/api/data/Rem_CallAutofundtransfer?userid=${userId}` });
        const userInfo = await get({ url: APP_URLS.getUserInfo });
        if(userInfo && userInfo.data) {
          const data     = userInfo.data;
          setFirmDet(decryptData(data.vvvv, data.kkkk, data.frmanems));
          setAdminFirmDet(decryptData(data.vvvv, data.kkkk, data.adminfarmname));
          await AsyncStorage.setItem("adminFarmData", JSON.stringify({
            adminFarmName: decryptData(data.vvvv, data.kkkk, data.adminfarmname),
            frmanems:      decryptData(data.vvvv, data.kkkk, data.frmanems),
            photoss:       decryptData(data.vvvv, data.kkkk, data.photoss),
          }));
        }
      } catch (error) {
        console.error("Error in getData init:", error);
      }
    };
    Promise.all([getData(), fetchData()]).then(() => setRefreshing(false));
    adharpanStatus();
  }, []);

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
            colors={[colorConfig.primaryColor,colorConfig.secondaryColor]}
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
                <View style={styles.qaGreetRow}>
                  <Text style={styles.qaHi}>{translate("Hi.")}</Text>
                  <Text style={styles.qaName} numberOfLines={1} ellipsizeMode="tail">
                    {FirmDet}
                  </Text>
                </View>
                <Text style={styles.qaSub}>{translate("Your_Quick_Access")}</Text>
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
  root: { flex: 1 ,paddingBottom:hScale(30) },

  orb: { position: "absolute", borderRadius: 999 },

  scrollContent: {
    paddingHorizontal: wScale(10),
    paddingTop:        hScale(0),
    paddingBottom:     hScale(80),
  },

  quickRow: {
    flexDirection:  "row",
    justifyContent: "space-between",
    marginBottom:   hScale(10),
    gap:            wScale(6),
  },
  quickBtnOuter: {
    flex:           1,
    overflow:       "hidden",
    borderRadius:   14,
    borderWidth:    1,
    borderColor:    "rgba(255,255,255,0.22)",
    alignItems:     "center",
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
    height:        hScale(34),
    width:         hScale(34),
    borderRadius:  10,
    justifyContent:"center",
    alignItems:    "center",
    marginBottom:  hScale(5),
    borderWidth:   1,
    borderColor:   "rgba(255,255,255,0.2)",
  },
  quickBtnText: {
    color:      "rgba(255,255,255,0.9)",
    fontSize:   wScale(11),
    fontWeight: "600",
    textAlign:  "center",
    textShadowColor:  "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  glassSection: {
    borderRadius:   22,
    overflow:       "hidden",
    borderWidth:    1,
    borderColor:    "rgba(255,255,255,0.28)",
    marginVertical: hScale(7),
    position:       "relative",
  },
  sectionTopShimmer: {
    position:              "absolute",
    top: 0, left: 0, right: 0,
    height:                hScale(40),
    borderTopLeftRadius:   22,
    borderTopRightRadius:  22,
  },
  sectionTitleRow: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "center",
    paddingTop:     hScale(8),
    paddingHorizontal: wScale(14),
    paddingRight:   wScale(12),
  },
  titleWithAccent: {
    flexDirection: "row",
    alignItems:    "center",
    flex:          1,
  },
  titleAccent: {
    width:        wScale(4),
    height:       wScale(16),
    borderRadius: wScale(2),
    marginRight:  wScale(8),
  },
  sectionTitle: {
    fontSize:   wScale(15),
    color:      "rgba(255,255,255,0.95)",
    fontWeight: "700",
    textShadowColor:  "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    letterSpacing:    0.3,
  },
  sectionContent: {
    paddingTop: hScale(10),
  },

  quickAccessHeader: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "center",
    paddingHorizontal: wScale(14),
    paddingTop:     hScale(5),
    paddingBottom:  hScale(4),
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  qaLeft: {
    flexDirection: "column",
    flex:          1,
  },
  qaGreetRow: {
    flexDirection: "row",
    alignItems:    "center",
  },
  qaHi: {
    fontSize:   wScale(14),
    color:      "rgba(255,255,255,0.9)",
    marginRight: wScale(5),
  },
  qaName: {
    fontSize:   wScale(15),
    color:      "#fff",
    fontWeight: "bold",
    maxWidth:   wScale(160),
  },
  qaSub: {
    fontSize:   wScale(11),
    color:      "rgba(255,255,255,0.65)",
    marginTop:  hScale(2),
    letterSpacing: 0.2,
  },
  editBtn: {
    height:        wScale(28),
    width:         wScale(28),
    borderRadius:  14,
    justifyContent:"center",
    alignItems:    "center",
    borderWidth:   1,
    borderColor:   "rgba(255,255,255,0.25)",
  },
  lotiSmall: { height: hScale(18), width: wScale(18) },

  carouselWrap: { marginVertical: hScale(0) },

  bblogo:  { height: wScale(25), width: wScale(20) },
  cmsLogo: { height: wScale(25), width: wScale(25) },
  lotiRight: {
    height: hScale(46),
    width:  wScale(38),
    position:'absolute',
    right:wScale(10),
  },

  newBadge: {
    backgroundColor:   "red",
    position:          "absolute",
    right:             wScale(31),
    top:               hScale(10),
    zIndex:            20,
    color:             "#fff",
    textAlign:         "center",
    fontSize:          wScale(12),
    borderRadius:      3,
    paddingHorizontal: wScale(4),
    paddingVertical:   hScale(1),
    overflow:          "hidden",
  },
});

export default memo(HomeScreen);