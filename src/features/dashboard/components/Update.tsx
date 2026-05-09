import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  Alert,
  StatusBar,
  SafeAreaView,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import useAxiosHook from "../../../utils/network/AxiosClient";
import { APP_URLS } from "../../../utils/network/urls";
import UpdateSvg from "../../drawer/svgimgcomponents/UpdateSvg";
import { useSelector } from "react-redux";
import { RootState } from "../../../reduxUtils/store";
import DynamicButton from "../../drawer/button/DynamicButton";
import { translate } from "../../../utils/languageUtils/I18n";
import DeviceInfo from "react-native-device-info";
import ReactNativeBlobUtil from "react-native-blob-util";
import { onReceiveNotification2 } from "../../../utils/NotificationService";
import LanguageButton from "../../../components/LanguageButton";

const UpdateScreen = () => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const { get } = useAxiosHook();

  const [latestVersion, setLatestVersion] = useState("...");
  const [currentVersion] = useState(APP_URLS.version);
  const [id, setid] = useState("");
  const [response, setResponse] = useState(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const version = await get({ url: APP_URLS.current_version });
        setResponse(version);
        setLatestVersion(version.currentversion);
        setid(version.PackageName);
      } catch (error) {
        console.log("Version fetch error:", error);
      }
    };
    fetchVersion();
  }, []);

  const getInstallTime = async () => {
    const first = await DeviceInfo.getFirstInstallTime();
    const last = await DeviceInfo.getLastUpdateTime();
    Alert.alert(
      "App Install Info",
      `First Install: ${new Date(first).toLocaleString()}\nLast Update: ${new Date(last).toLocaleString()}`
    );
  };

  const handleUpdate = async () => {
    try {
      if (!response) {
        Alert.alert("Error", "Version info not found");
        return;
      }

      if (response.isgoogle) {
        const url = `${APP_URLS.playUrl}${id}`;
        await Linking.openURL(url);
      } else {
        const apkUrl = `http://${APP_URLS.baseWebUrl}${APP_URLS.DownloadAPK}`;
        setIsDownloading(true);
        setDownloadProgress(0);

        onReceiveNotification2({
          notification: { title: "Downloading App Update", body: "Please Wait" },
        });

        const downloadPath = `${ReactNativeBlobUtil.fs.dirs.CacheDir}/app-update-${Date.now()}.apk`;

        ReactNativeBlobUtil.config({ fileCache: true, path: downloadPath, appendExt: "apk" })
          .fetch("GET", apkUrl)
          .progress((received, total) => {
            if (total > 0) {
              const percentage = Math.floor((received / total) * 100);
              setDownloadProgress(percentage);
            }
          })
          .then((res) => {
            setIsDownloading(false);
            setDownloadProgress(100);
            ReactNativeBlobUtil.android.actionViewIntent(
              res.path(),
              "application/vnd.android.package-archive"
            );
          })
          .catch((errorMessage) => {
            setIsDownloading(false);
            console.log("Download error:", errorMessage);
            Linking.openURL(apkUrl);
            Alert.alert("Update Failed", "Could not download APK.");
          });
      }
    } catch (error) {
      setIsDownloading(false);
      Alert.alert(translate("Error"), translate("Something went wrong."));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
        style={styles.container}
      >
        {/* Background Blobs */}
        <View style={styles.blob1} />
        <View style={styles.blob2} />
        <View style={styles.blob3} />

        {/* Language Button */}
        <View style={styles.langRow}>
          <LanguageButton />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Icon Glass Card */}
          <View style={styles.iconContainer}>
            <View style={styles.iconGlass}>
              <UpdateSvg
                progress={downloadProgress}
                color2={colorConfig.primaryColor}
                color={colorConfig.secondaryColor}
              />
            </View>
          </View>

          <Text style={styles.title}>{translate("New Update Available")}</Text>
          <Text style={styles.subtitle}>
            {translate("A newer version of the app is available for a better experience.")}
          </Text>

          {/* Version Row */}
          <View style={styles.versionRow}>
            <View style={styles.versionTag}>
              <Text style={styles.versionLabel}>{translate("Latest")}</Text>
              <Text style={styles.versionValue}>V{latestVersion}</Text>
            </View>
            <Text style={styles.currentVersionText}>
              {translate("Current")}: V{currentVersion}
            </Text>
          </View>

          {/* Glass Update Card */}
          <View style={styles.updateCard}>
            <Text style={styles.updateTitle}>
              🚀 {translate("What's new in this version?")}
            </Text>
            <View style={styles.divider} />

            {[
              translate("Fixed minor bugs and crashes"),
              translate("Improved performance and speed"),
              translate("Enhanced design and usability"),
              translate("Security improvements"),
            ].map((item, index) => (
              <View key={index} style={styles.bulletItem}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Progress Bar (shown only when downloading) */}
          {isDownloading && (
            <View style={styles.progressWrap}>
              <View style={[styles.progressFill, { width: `${downloadProgress}%` as any }]} />
            </View>
          )}
          {isDownloading && (
            <Text style={styles.progressLabel}>
              {translate("Downloading")}... {downloadProgress}%
            </Text>
          )}

          <DynamicButton
            onlong={getInstallTime}
            title={isDownloading ? `${translate("Downloading")}... ${downloadProgress}%` : translate("Update Now")}
            onPress={handleUpdate}
          />
          <Text style={styles.note}>
            {translate("You will be redirected to Google Play Store.")}
          </Text>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    overflow: "hidden",
  },

  // Background decorative blobs
  blob1: {
    position: "absolute",
    top: -hScale(80),
    right: -wScale(80),
    width: wScale(260),
    height: wScale(260),
    borderRadius: wScale(130),
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  blob2: {
    position: "absolute",
    bottom: hScale(120),
    left: -wScale(60),
    width: wScale(180),
    height: wScale(180),
    borderRadius: wScale(90),
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  blob3: {
    position: "absolute",
    top: hScale(200),
    right: -wScale(40),
    width: wScale(120),
    height: wScale(120),
    borderRadius: wScale(60),
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  langRow: {
    alignItems: "flex-end",
    paddingRight: wScale(20),
    paddingTop: hScale(10),
  },

  content: {
    alignItems: "center",
    width: "90%",
    alignSelf: "center",
    paddingTop: hScale(10),
  },

  // Icon with glassmorphism
  iconContainer: {
    marginBottom: hScale(24),
  },
  iconGlass: {
    width: wScale(110),
    height: wScale(110),
    borderRadius: wScale(28),
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    alignItems: "center",
    justifyContent: "center",
    // iOS glass shadow
    // shadowColor: "#000",
    // shadowOffset: { width: 0, height: 8 },
    // shadowOpacity: 0.15,
    // shadowRadius: 16,
    // elevation: 10,
  },

  title: {
    fontSize: wScale(26),
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: hScale(10),
  },
  subtitle: {
    fontSize: wScale(14),
    color: "rgba(255,255,255,0.8)",
    textAlign: "center",
    paddingHorizontal: wScale(16),
    marginBottom: hScale(24),
    lineHeight: hScale(22),
  },

  // Version Row
  versionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hScale(22),
    gap: wScale(14),
  },
  versionTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: wScale(6),
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    paddingVertical: hScale(6),
    paddingHorizontal: wScale(14),
    borderRadius: 20,
  },
  versionLabel: {
    fontSize: wScale(12),
    color: "rgba(255,255,255,0.7)",
    fontWeight: "600",
  },
  versionValue: {
    fontSize: wScale(13),
    color: "#FFFFFF",
    fontWeight: "800",
  },
  currentVersionText: {
    color: "rgba(255,255,255,0.65)",
    fontSize: wScale(13),
    fontWeight: "500",
  },

  // Glass Update Card
  updateCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    borderRadius: wScale(22),
    padding: wScale(20),
    // shadowColor: "#000",
    // shadowOpacity: 0.1,
    // shadowRadius: 10,
    // elevation: 5,
  },
  updateTitle: {
    fontSize: wScale(15),
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: hScale(12),
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: hScale(14),
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: hScale(12),
    gap: wScale(12),
  },
  bulletDot: {
    width: wScale(7),
    height: wScale(7),
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  bulletText: {
    flex: 1,
    fontSize: wScale(13.5),
    color: "rgba(255,255,255,0.85)",
    lineHeight: hScale(20),
  },

  // Bottom Section
  bottomSection: {
    width: "90%",
    alignSelf: "center",
    paddingBottom: hScale(32),
  },

  // Download Progress Bar
  progressWrap: {
    width: "100%",
    height: hScale(6),
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 3,
    marginBottom: hScale(4),
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: wScale(12),
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    marginBottom: hScale(8),
  },

  note: {
    color: "rgba(255,255,255,0.6)",
    fontSize: wScale(11.5),
    marginTop: hScale(12),
    textAlign: "center",
    lineHeight: hScale(18),
  },
});

export default UpdateScreen;