import { translate } from "../../utils/languageUtils/I18n";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  Alert, Pressable, RefreshControl, ScrollView,
  StatusBar, TouchableOpacity,
  View, Text, StyleSheet, Image,
} from "react-native";
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
import { decryptData } from "../../utils/encryptionUtils";
import { reset, setDashboardData, setIsDemoUser, setThemeChangeTime } from "../../reduxUtils/store/userInfoSlice";
import NewsSlider from "../../components/SliderText";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FastImage from "react-native-fast-image";
import { getAssetSource, getImageSource2 } from "../../utils/network/NetWorkImages";
import payon4uStaticData from "../../../src/utils/payon4u_dashboard.json"
import firestore from '@react-native-firebase/firestore';

// ─── Simple Section Card (no gradient, no shimmer) ───────────────────────────
interface SectionProps {
  title: string;
  rightElement?: React.ReactNode;
  children: React.ReactNode;
}

const Section = ({ title, rightElement, children }: SectionProps) => {
  return (
    <View style={styles.section}>
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
  const [refreshing,          setRefreshing]          = useState(false);
  const [savedItems,          setSavedItems]          = useState([]);
  const [newsData,            setNewsData]            = useState([]);
  const [adminFirmDet,        setAdminFirmDet]        = useState<any>();
  const [FirmDet,             setFirmDet]             = useState<any>();
  const [is_demo,             setId_Demo]             = useState(false);
  const [refreshTick,         setRefreshTick]          = useState(0);

  const { post, get } = useAxiosHook();
  const navigation     = useNavigation();
  const dispatch       = useDispatch();

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

  // ─── Retry wrapper: icons kabhi gayab na ho isliye 1 baar retry karta hai ───
  const postWithRetry = async (url: string, retries = 1): Promise<any> => {
    try {
      const res = await post({ url });
      if (!res) throw new Error("Empty response");
      return res;
    } catch (err) {
      if (retries > 0) {
        console.log(`🔁 Retry left for ${url}`);
        return postWithRetry(url, retries - 1);
      }
      console.log(`❌ Failed after retries: ${url}`, err);
      return null; // null = fail marker (empty array se differentiate karne ke liye)
    }
  };

  const fetchData = async (force: boolean = false) => {
    try {
      Newssms();
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
        APP_URLS.AppName === "Recharge Drishti";

      if (
        !force &&
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
        postWithRetry(APP_URLS.getRechargeSectionImages),
        postWithRetry(APP_URLS.getFinanceSectionImages),
        postWithRetry(APP_URLS.getOtherSectionImages),
        postWithRetry(APP_URLS.getTravelSectionImages),
        postWithRetry(APP_URLS.getcmsSectionImages),
      ]);

      // agar retry ke baad bhi fail (null) hua to purana redux cached data use karo,
      // taaki icons blank na dikhein — sirf tabhi [] jab pehli baar hi kuch nahi mila
      let finalRecharge = rRes ?? dashboardData?.rechargeSectionData ?? [];
      let finalFinance  = fRes ?? dashboardData?.financeSectionData  ?? [];
      let finalOther    = oRes ?? dashboardData?.otherSectionData    ?? [];
      let finalTravel   = tRes ?? dashboardData?.travelSectionData   ?? [];
      let finalCms      = cRes ?? dashboardData?.cmsSectionData      ?? [];

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
        console.log('Document nahi mila! Path check karein.');
        return null;
      }
    } catch (error) {
      console.error('Status read karne me error aaya:', error);
      return null;
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setViewMoreStatus(false);
    setRefreshTick((t) => t + 1); // pehle fail hue icons ko bhi dobara try karwane ke liye
    fetchData(true).finally(() => setRefreshing(false)); // force=true → hमेशा fresh API call, chahe 1 sec pehle hi refresh kiya ho
  }, []);

  useEffect(() => {
    setViewMoreStatus(false);
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
    <View style={[styles.root, { backgroundColor: colorConfig.primaryColor }]}>
      <StatusBar backgroundColor={colorConfig.primaryColor} barStyle="light-content" />

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
          <View style={[styles.section, { backgroundColor: colorConfig.secondaryColor }]}>
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
                style={styles.editBtn}
              >
                <FastImage
                  source={getImageSource2("edit.png")}
                  style={styles.editIcon}
                  resizeMode={FastImage.resizeMode.contain}
                />
              </Pressable>
            </View>

            <View style={styles.sectionContent}>
              <IconButtons
                buttonData={savedItems?.length > 0 ? savedItems : APP_URLS.AppName == 'World Pay One' ? financeSectionData : otherSectionData}
                refreshTick={refreshTick}
              />
            </View>
          </View>
        )}

        {/* ── Carousel ── */}
        <View style={styles.carouselWrap}>
          <CarouselView />
        </View>

        {/* ── Recharge Section ── */}
        <Section
          title={translate("Recharge_Pay_Bill")}
          rightElement={
            <FastImage
              source={getImageSource2("bblogo.png")}
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
            refreshTick={refreshTick}
          />
        </Section>

        {/* ── CMS ── */}
        {!is_demo && (
          <Section
            title={translate("Our_Exclusive_CMS")}
            rightElement={
              <FastImage
                source={getImageSource2(`${APP_URLS.cms_logo}`)}
                style={styles.cmsLogo}
              />
            }
          >
            <IconButtons
              buttonData={cmsSectionData}
              getItem={undefined}
              isQuickAccess={undefined}
              iconButtonstyle={undefined}
              refreshTick={refreshTick}
            />
          </Section>
        )}

        {/* ── Financial Services ── */}
        {APP_URLS.AppName !== "World Pay One" && (
          <Section title={translate("Financial_Services")}>
            {financeSectionData.length === 4 && (
              <Text style={styles.newBadge}>New</Text>
            )}
            <IconButtons
              buttonData={financeSectionData}
              getItem={undefined}
              isQuickAccess={undefined}
              iconButtonstyle={undefined}
              refreshTick={refreshTick}
            />
          </Section>
        )}

        {/* ── Travel ── */}
        {!is_demo && APP_URLS.AppName !== "Divyanshi Pay" && (
          <Section title={translate("Travel_Hotel")}>
            <IconButtons buttonData={travelSectionData} refreshTick={refreshTick} />
          </Section>
        )}

        {/* ── Other Section ── */}
        {!is_demo && APP_URLS.AppName !== "Divyanshi Pay" && (
          <Section title={translate("Other_Section")}>
            <IconButtons buttonData={otherSectionData} refreshTick={refreshTick} />
          </Section>
        )}
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1, paddingBottom: hScale(30) },

  scrollContent: {
    paddingHorizontal: wScale(10),
    paddingTop:        hScale(10),
    paddingBottom:     hScale(80),
  },

  section: {
    borderRadius:   14,
    borderWidth:    1,
    borderColor:    "rgba(255,255,255,0.15)",
    backgroundColor: "rgba(255,255,255,0.06)",
    marginVertical: hScale(6),
  },
  sectionTitleRow: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "center",
    paddingTop:     hScale(10),
    paddingHorizontal: wScale(14),
    paddingRight:   wScale(12),
  },
  sectionTitle: {
    fontSize:   wScale(15),
    color:      "#fff",
    fontWeight: "700",
  },
  sectionContent: {
    paddingTop: hScale(10),
    paddingBottom: hScale(10),
  },

  quickAccessHeader: {
    flexDirection:  "row",
    justifyContent: "space-between",
    alignItems:     "center",
    paddingHorizontal: wScale(14),
    paddingTop:     hScale(10),
    paddingBottom:  hScale(4),
  },
  qaLeft: {
    flexDirection: "row",
    alignItems:    "center",
    flexWrap:      "wrap",
    flex:          1,
  },
  qaHi: {
    fontSize:   wScale(13),
    color:      "rgba(255,255,255,0.85)",
    marginRight: wScale(4),
  },
  qaName: {
    fontSize:   wScale(13),
    color:      "#fff",
    fontWeight: "bold",
    maxWidth:   wScale(130),
    marginRight: wScale(4),
  },
  editBtn: {
    height:        wScale(28),
    width:         wScale(28),
    borderRadius:  14,
    justifyContent:"center",
    alignItems:    "center",
    borderWidth:   1,
    borderColor:   "rgba(255,255,255,0.3)",
  },
  editIcon: {
    height: wScale(16),
    width:  wScale(16),
  },

  carouselWrap: { marginVertical: hScale(0) },

  bblogo:  { height: wScale(25), width: wScale(20) },
  cmsLogo: { height: wScale(25), width: wScale(25) },

  newBadge: {
    backgroundColor:   "red",
    position:          "absolute",
    right:             wScale(14),
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