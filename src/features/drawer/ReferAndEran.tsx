import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Dimensions,
  StatusBar,
} from "react-native";
import Share from "react-native-share";
import { useNavigation } from "@react-navigation/native";
import { APP_URLS } from "../../utils/network/urls";
import useAxiosHook from "../../utils/network/AxiosClient";
import { useSelector } from "react-redux";
import { RootState } from "../../reduxUtils/store";
import { translate } from "../../utils/languageUtils/I18n";

const { width } = Dimensions.get("window");

const ReferAndEran = () => {
  const { get } = useAxiosHook();
  const navigation = useNavigation();
  const [refcode, setRefcode] = useState("------");

  const { colorConfig, fcmToken, deviceInfo } = useSelector(
    (state: RootState) => state.userInfo
  );

  // Dynamic values from Redux (deviceInfo contains the location & device details)
  const { latitude, longitude, address, city, postalCode, brand, modelNumber } = deviceInfo;

  const appLink = `https://play.google.com/store/apps/details?id=${APP_URLS.appPackage}`;
  const webLink = `https://www.${APP_URLS.baseWebUrl}/Home/Index1`;

  useEffect(() => {
    const fetchReferral = async () => {
      try {
        const response = await get({
          url: `Common/api/data/authenticate?Devicetoken=${fcmToken}&Imeino=1234567890&Latitude=${latitude}&Longitude=${longitude}&ModelNo=${modelNumber}&IPAddress=${deviceInfo.ipAddress}&Address=${address}&City=${city}&PostalCode=${postalCode}&InternetTYPE=4G&brandname=${brand}`,
        });

        console.log(response)
        if (response?.message?.SELFREFFERALCODE) {
          setRefcode(response.message.SELFREFFERALCODE);
        }
      } catch (error) {
        console.log("Error fetching referral code", error);
      }
    };
    fetchReferral();
  }, []);

  const onShare = async (link: string) => {
    const shareOptions = {
      message: `${translate("Refer.Share message")}\nReferral Code: ${refcode}\nLink: ${link}`,
      subject: "App Referral",
    };
    try {
      await Share.open(shareOptions);
    } catch (error) {
      console.log("Share failed", error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a74da" />
      
      {/* Header Section */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{translate("Refer.Refer & Earn")}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Top Illustration Box */}
        <View style={styles.illustrationCard}>
          <View style={styles.circleBg} />
          <Text style={styles.giftEmoji}>🎁</Text>
          <Text style={styles.promoTitle}>{translate("Refer.Invite Friends")}</Text>
          <Text style={styles.promoDesc}>
            {translate("Refer.Share with friends and get exciting rewards on every signup")}
          </Text>
        </View>

        {/* Referral Code Box */}
        <View style={styles.codeCard}>
          <Text style={styles.codeLabel}>{translate("Refer.Your Referral Code")}</Text>
          <View style={styles.dashedBox}>
            <Text style={styles.refCodeText}>{refcode}</Text>
          </View>
          <TouchableOpacity 
            style={styles.copyButton} 
            onPress={() => onShare(`My Referral Code is: ${refcode}`)}
          >
            <Text style={styles.copyButtonText}>{translate("Refer.Copy Code")}</Text>
          </TouchableOpacity>
        </View>

        {/* Share Links Section */}
        <View style={styles.shareContainer}>
          <Text style={styles.sectionTitle}>{translate("Refer.Share App Via")}</Text>
          
          <View style={styles.grid}>
            <ShareOption 
              title="Play Store" 
              subtitle="Android Link" 
              icon="🤖" 
              onPress={() => onShare(appLink)} 
            />
            <ShareOption 
              title="Web Portal" 
              subtitle="Website Link" 
              icon="🌐" 
              onPress={() => onShare(webLink)} 
            />
            <ShareOption 
              title="App Store" 
              subtitle="iOS Link" 
              icon="🍎" 
              onPress={() => onShare(webLink)} 
            />
            <ShareOption 
              title="More" 
              subtitle="Direct Share" 
              icon="🔗" 
              onPress={() => onShare(appLink)} 
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const ShareOption = ({ title, subtitle, icon, onPress }: any) => (
  <TouchableOpacity style={styles.gridItem} onPress={onPress}>
    <Text style={styles.gridIcon}>{icon}</Text>
    <Text style={styles.gridTitle}>{title}</Text>
    <Text style={styles.gridSub}>{subtitle}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  header: {
    backgroundColor: "#0a74da",
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    marginRight: 15,
  },
  backText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "700",
  },
  illustrationCard: {
    backgroundColor: "#0a74da",
    padding: 30,
    alignItems: "center",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: "hidden",
  },
  circleBg: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.1)",
    top: -50,
    right: -50,
  },
  giftEmoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  promoTitle: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
  },
  promoDesc: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  codeCard: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  codeLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 12,
  },
  dashedBox: {
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },
  refCodeText: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#0a74da",
    letterSpacing: 2,
  },
  copyButton: {
    marginTop: 15,
  },
  copyButtonText: {
    color: "#0a74da",
    fontWeight: "600",
    fontSize: 14,
  },
  shareContainer: {
    padding: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  gridItem: {
    backgroundColor: "#fff",
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  gridIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  gridTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#334155",
  },
  gridSub: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
  },
});

export default ReferAndEran;
