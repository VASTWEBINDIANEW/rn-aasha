import { translate } from "../utils/languageUtils/I18n";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Linking,
  Alert,
  PermissionsAndroid,
  Platform,
  Animated,
  ScrollView,
  SafeAreaView,
} from "react-native";
import LinearGradient from "react-native-linear-gradient";
import RNFetchBlob from "rn-fetch-blob";
import { useSelector } from "react-redux";
import { RootState } from "../../../reduxUtils/store";
import useAxiosHook from "../../../utils/network/AxiosClient";
import { APP_URLS } from "../../../utils/network/urls";
import DynamicButton from "../../drawer/button/DynamicButton";
import UpdateSvg from "../../drawer/svgimgcomponents/UpdateSvg";
import { hScale } from "../../../utils/styles/dimensions";
import UpiPaymentScreen from "./upi";

const UpdateScreen = ({ isPlay }) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const { get } = useAxiosHook();

  const [latestVersion, setLatestVersion] = useState("");
  const [currentVersion, setCurrentVersion] = useState("");
  const [progress, setProgress] = useState(0);
  const [downloading, setDownloading] = useState(false);

  const animatedWidth = useRef(new Animated.Value(0)).current;

  const animateProgress = (p) => {
    Animated.timing(animatedWidth, {
      toValue: p,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Fetch version
  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const version = await get({ url: APP_URLS.current_version });
        setLatestVersion(version.currentversion);
        setCurrentVersion(APP_URLS.version);
      } catch (error) {
        console.log("Version Fetch Error:", error);
      }
    };
    fetchVersion();
  }, []);

  // Unknown source settings
  const openUnknownSourceSettings = async () => {
    if (Platform.OS !== "android") return;
    try {
      await Linking.openSettings();
    } catch {
      Linking.openSettings();
    }
  };

  // Download + install
  const downloadAndInstall = async () => {
    try {
      const apkUrl = `http://${APP_URLS.baseWebUrl+APP_URLS.DownloadAPK}`;
console.log(apkUrl)
      if (Platform.OS === "android" && Platform.Version < 30) {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
        );
      }

      const { fs, android } = RNFetchBlob;
      const apkPath = `${fs.dirs.CacheDir}/${APP_URLS.AppName}-update.apk`;

      setDownloading(true);
      setProgress(0);
      animatedWidth.setValue(0);

      RNFetchBlob.config({
        path: apkPath,
        fileCache: true,
          trusty: true, // ⚠️ SSL ignore

      })
        .fetch("GET", apkUrl, { "Cache-Control": "no-store" })
        .progress((received, total) => {
          let percent = Math.round((received / total) * 100);
          setProgress(percent);
          animateProgress(percent);
        })
        .then((res) => {
          setDownloading(false);

          try {
            android.actionViewIntent(
              res.path(),
              "application/vnd.android.package-archive"
            );
          } catch {
            Alert.alert(
              "Permission Required",
              "key_pleaseall_63",
              [
                { text: "Cancel" },
                { text: "Open Settings", onPress: openUnknownSourceSettings },
              ]
            );
          }
        })
        .catch((err) => {
          setDownloading(false);
          console.log("APK Download Error:", err);
          Alert.alert("Error", "Download failed!");
        });
    } catch (e) {
      console.log("Install Error:", e);
    }
  };

  const handleUpdate = () => {
    if (isPlay) {
      Linking.openURL(APP_URLS.playUrl);
    } else {
      downloadAndInstall();
    }
  };

  return (
    <LinearGradient
      colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
      style={styles.container}
    >

       {/* <UpiPaymentScreen/> */}
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 30 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.logoBox}>
              <UpdateSvg
                color={colorConfig.primaryColor}
                color2={colorConfig.secondaryColor}
              />
            </View>

            <Text style={styles.title}>{translate("New_Update_Required")}</Text>

            <View style={styles.versionBox}>
              <Text style={styles.availableText}>
                Available Version:{" "}
                <Text style={styles.versionValue}>V{latestVersion}</Text>
              </Text>
            </View>

            <Text style={styles.prevText}>Your Version: V{currentVersion}</Text>

            {downloading && (
              <View style={styles.progressBox}>
                <Text style={styles.progressText}>
                  Downloading... {progress}%
                </Text>

                <View style={styles.progressBarBackground}>
                  <Animated.View
                    style={[
                      styles.progressBarFill,
                      {
                        width: animatedWidth.interpolate({
                          inputRange: [0, 100],
                          outputRange: ["0%", "100%"],
                        }),
                      },
                    ]}
                  />
                </View>
              </View>
            )}

            {!downloading && (
              <View style={styles.noteBox}>
                <Text style={styles.noteText}>
                  key_notetoi_57{" "}
                  <Text style={{ fontWeight: "700" }}>{translate("Install_Unknown_Apps")}</Text>{" "}
                  key_permission_119
                  settings.
                </Text>
              </View>
            )}

            <View style={styles.updateBox}>
              <Text style={styles.updateTitle}>{translate("Whats_New")}</Text>

              {[
                "Bug fixes and improvements",
                "Better performance",
                "UI enhancements",
                "Security updates",
              ].map((t, i) => (
                <View key={i} style={styles.bulletItem}>
                  <Text style={styles.bulletSymbol}>•</Text>
                  <Text style={styles.bulletText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>

        {!downloading && (
          <View style={styles.bottomBtn}>
            <DynamicButton
              title={"Download & Update Now"}
              onPress={handleUpdate}
            />
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

// ----------------------------
// Styles
// ----------------------------

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    alignItems: "center",
    width: "90%",
    paddingTop: hScale(40),
    alignSelf: "center",
  },
  logoBox: {
    backgroundColor: "#fff",
    borderRadius: 100,
    padding: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  versionBox: {
    backgroundColor: "#E8F5E9",
    borderRadius: 20,
    padding: 8,
    marginBottom: 6,
  },
  availableText: { fontSize: 16, color: "#388E3C", fontWeight: "600" },
  versionValue: { fontWeight: "bold" },
  prevText: { fontSize: 15, color: "#fff", marginBottom: 20 },

  noteBox: {
    backgroundColor: "rgba(255,255,255,0.85)",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    width: "100%",
  },
  noteText: {
    fontSize: 13,
    color: "#444",
    textAlign: "justify",
  },

  updateBox: {
    backgroundColor: "rgba(255,255,255,0.75)",
    width: "100%",
    borderRadius: 15,
    padding: 15,
  },
  updateTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 5,
  },
  bulletSymbol: {
    color: "#2196F3",
    marginRight: 6,
    fontSize: 18,
  },
  bulletText: {
    color: "#444",
    fontSize: 14,
    flex: 1,
  },

  progressBox: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    marginTop: 10,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
  },
  progressBarBackground: {
    marginTop: 10,
    width: "100%",
    height: 12,
    backgroundColor: "#d4d4d4",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#2196F3",
  },

  bottomBtn: {
    width: "90%",
    alignSelf: "center",
    paddingVertical: hScale(10),
  },
});

export default UpdateScreen;
