import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  PermissionsAndroid,
  ToastAndroid,
} from "react-native";
import { launchCamera } from "react-native-image-picker";
import useAxiosHook from "../../utils/network/AxiosClient";
import { APP_URLS } from "../../utils/network/urls";
import DynamicButton from "../drawer/button/DynamicButton";
import { hScale, wScale } from "../../utils/styles/dimensions";
import { useDispatch, useSelector } from "react-redux";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";
import { check, openSettings, PERMISSIONS, request, RESULTS } from "react-native-permissions";
import { Video } from "react-native-compressor";
import RNFS, { readFile } from "react-native-fs";
import ShowLoader from "../../components/ShowLoder";
import { reset } from "../../reduxUtils/store/userInfoSlice";
import { RootState } from "../../reduxUtils/store";
import { useNavigation, useRoute } from "@react-navigation/native";
import { translate } from "../../utils/languageUtils/I18n";
// import   {default  as RnVideo ,VideoRef} from 'react-native-video';

const PrimaryColor = "#3498db";
const SecondaryColor = "#e74c3c";
const TextColor = "#ffffff";

const VideoKYC = () => {
  const route = useRoute();

  const { CNTNT } = route.params;
  console.log(CNTNT);

  const { userId, IsDealer } = useSelector(
    (state: RootState) => state.userInfo,
  );

  const [content, setContent] = useState(true);
  const [englishRow, setEnglishRow] = useState(true);
  const [hindiRow, setHindiRow] = useState(false);
  const [firstTap, setFirstTap] = useState(true);
  const [secondTap, setSecondTap] = useState(false);
  const [videoBase64, setBase64Video] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [isLoading3, setIsLoading3] = useState(false);
  const [loader, setLoader] = useState(true);
  const [playVideo, setPlayVideo] = useState("");
  const [hindi, setHindi] = useState(IsDealer ? CNTNT.hindi : "");
  const [eng, setEng] = useState(IsDealer ? CNTNT.Eng : "");
  const [name, setName] = useState("");
  const { post, get } = useAxiosHook();
  const navigation = useNavigation();
  const videoRef = useRef<VideoRef>(null);

  const [play, setPlay] = useState(false);
  useEffect(() => {
    if (!IsDealer) {
      fetchContent();
    }
    setLoader(false);
    requestCameraPermission();
  }, []);

 const requestCameraPermission = useCallback(async () => {
  try {
    // iOS nahi hai toh sirf Android check karo
    if (Platform.OS !== 'android') return true;

    const currentStatus = await check(PERMISSIONS.ANDROID.CAMERA);

    if (currentStatus === RESULTS.GRANTED) {
      return true;
    }

    if (currentStatus === RESULTS.BLOCKED) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: translate('Permission Required'),
        textBody: translate('key_pleasegra_85'),
        button: translate('OK'),
        onPressButton: () => {
          Dialog.hide();
          openSettings().catch(() => console.warn('cannot open settings'));
        },
      });
      return false;
    }

    const result = await request(PERMISSIONS.ANDROID.CAMERA);

    if (result === RESULTS.GRANTED) {
      return true;
    } else {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: translate('Permission Required'),
        textBody: translate('key_pleasegra_85'),
        button: translate('OK'),
        onPressButton: () => {
          Dialog.hide();
          openSettings().catch(() => console.warn('cannot open settings'));
        },
      });
      return false;
    }
  } catch (err) {
    console.warn(err);
    return false;
  }
}, []);

  const changeLay = (lay) => {
    setFirstTap(lay === 1);
    setSecondTap(lay === 2);
    setEnglishRow(lay === 1);
    setHindiRow(lay === 2);
  };

  const convertVideoToBase64 = async (videoUri) => {
    try {
      const base64String = await RNFS.readFile(videoUri, "base64");
      return base64String;
    } catch (error) {
      console.error("Error converting video to base64: ", error);
      throw error;
    }
  };


const openCamera = async () => {
  try {
    // ✅ Step 1 — Permission check pehle
    if (Platform.OS === 'android') {
      const currentStatus = await check(PERMISSIONS.ANDROID.CAMERA);

      if (currentStatus === RESULTS.BLOCKED) {
        Dialog.show({
          type: ALERT_TYPE.WARNING,
          title: translate('Permission Required'),
          textBody: translate('key_pleasegra_85'),
          button: translate('OK'),
          onPressButton: () => {
            Dialog.hide();
            openSettings().catch(() => console.warn('cannot open settings'));
          },
        });
        return;
      }

      if (currentStatus !== RESULTS.GRANTED) {
        const result = await request(PERMISSIONS.ANDROID.CAMERA);
        if (result !== RESULTS.GRANTED) return;
      }
    }

    // ✅ Step 2 — Camera launch karo
    const options = {
      mediaType: 'video',
      videoQuality: 'high',
      durationLimit: 60,
      saveToPhotos: false,  // ✅ Gallery mein save nahi hoga
    };

    launchCamera(options, async (response) => {
      if (response.didCancel) {
        setContent(true);
        setIsLoading2(false);
        return;
      }

      if (response.errorCode) {
        console.log('Camera Error:', response.errorMessage);
        setIsLoading2(false);
        return;
      }

      setLoader(true);
      setContent(false);
      setIsLoading2(false);

      // ✅ await hata diya — uri simple string hai
      const videoUri = response.assets[0].uri;
      console.log('Video URI:', videoUri);

      try {
        const result = await Video.compress(
          videoUri,
          { compressionMethod: 'manual' },
          (progress) => {
            console.log('Compression Progress:', progress);
          },
        );

        setPlayVideo(videoUri);
        console.log('Compression Result:', result);

        const compressedVideoPath = result;
        const base64Video = await convertVideoToBase64(compressedVideoPath);

        setIsLoading(true);
        setBase64Video(base64Video);
        setIsLoading(false);

        ToastAndroid.show(
          translate('Video Compression Complete!'),
          ToastAndroid.LONG,
        );
        setLoader(false);

      } catch (error) {
        console.error('Error converting video to base64:', error);
        setLoader(false);  // ✅ Error pe bhi loader band karo
        ToastAndroid.show(
          translate('Error during video compression!'),
          ToastAndroid.LONG,
        );
      }
    });

  } catch (err) {
    console.warn(err);
  }
};
  const dispatch = useDispatch();

  const uploadKYCVideo = async (video) => {
    setIsLoading(true);
    const data = {
      userids: userId,
      role: "Retailer",
      kycvideo: video,
    };
    const body = JSON.stringify(data);
    console.log(body);
    try {
      const response = await fetch(
        `http://${APP_URLS.baseWebUrl}/api/user/UploadKYCVIDEO`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: body,
        },
      );
      const responseData = await response.json();
      const Status = responseData.status;
      console.log(responseData);
      if (Status === "Success") {
        Alert.alert(
          Status,
          translate(
            `Video Upload ${Status}fully\n Your Video KYC Uploaded Successfully. Please wait for admin approval for more information contact to customer care`,
          ),
          [
            {
              text: translate("Done"),
              onPress: () =>
                IsDealer
                  ? navigation.goBack()
                  : navigation.navigate("LoginScreen"), // Dispatch action on click
            },
          ],
        );
      } else {
        Alert.alert(translate("Error"), responseData.msg);
      }
      setIsLoading(false);
    } catch (error) {
      console.error(error);
      Alert.alert(translate("Error"), translate("Failed to upload video"));
    }
  };

  const fetchContent = async () => {
    try {
      setLoader(true);
      const res = await get({ url: APP_URLS.videokycContent });

      const englishText = CNTNT["Eng"] || res.english;
      const hindiText = CNTNT["hindi"] || res.hindi;
      console.error(englishText);
      setName(res.remname || "");
      setEng(englishText);
      setHindi(hindiText);

      setLoader(false);
    } catch (error) {
      console.error("Failed to fetch content", error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>
          Hi {name}, Please Complete Your Video KYC
          <Text style={styles.headerTextSecondary}> Now!</Text>
        </Text>
      </View>

      {content ? (
        <View style={styles.contentContainer}>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              {translate("key_viewrecor_108")}
            </Text>
          </View>

          <View style={styles.languageContainer}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                firstTap && styles.languageButtonActive,
              ]}
              onPress={() => changeLay(1)}
            >
              <Text style={styles.languageButtonText}>
                {translate("English")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageButton,
                secondTap && styles.languageButtonActive,
              ]}
              onPress={() => changeLay(2)}
            >
              <Text style={styles.languageButtonText}>
                {translate("Hindi")}
              </Text>
            </TouchableOpacity>
          </View>
          {englishRow && (
            <View style={styles.languageContent}>
              <ScrollView>
                <Text style={styles.languageText}>
                  {eng || <ActivityIndicator size="large" color="#0000ff" />}
                </Text>
              </ScrollView>
            </View>
          )}

          {hindiRow && (
            <View style={styles.languageContent}>
              {hindi === "" ? (
                <ActivityIndicator size="large" color="#0000ff" />
              ) : (
                <Text
                  style={{ justifyContent: "center", alignItems: "center" }}
                >
                  {translate(hindi)}
                </Text>
              )}
            </View>
          )}
        </View>
      ) : (
        playVideo && <></>
      )}

      <View style={styles.buttonRow}>
        <DynamicButton
          title={
            isLoading2 ? (
              <ActivityIndicator size="large" color={TextColor} />
            ) : (
              <Text style={styles.startButtonText}>{translate("Record")}</Text>
            )
          }
          onPress={() => {
            setContent(false);
            setIsLoading2(true);
            openCamera();
            //uploadKYCVideo(videoBase64);
          }}
          styleoveride={styles.uploadButtonText}
        />
        <DynamicButton
          title={translate("Continue & Upload Video")}
          onPress={() => {
            if (videoBase64 == null) {
              ToastAndroid.showWithGravity(
                translate("Please Video Record First"),
                ToastAndroid.SHORT,
                ToastAndroid.BOTTOM,
              );
            } else {
              uploadKYCVideo(videoBase64);
            }
          }}
          styleoveride={styles.uploadButtonText}
        />
      </View>

      {isLoading && <ActivityIndicator size="large" color={PrimaryColor} />}

      {loader && <ShowLoader />}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: "center",
    padding: hScale(20),
    backgroundColor: "#f0f0f0",
  },
  backgroundVideo: {
    position: "absolute",
    borderRadius: 5,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
  },
  header: {
    backgroundColor: PrimaryColor,
    padding: 20,
    width: "100%",
    alignItems: "center",
    borderRadius: 10,
    marginBottom: hScale(20),
  },
  headerText: {
    color: TextColor,
    fontSize: hScale(20),
    fontWeight: "bold",
  },
  headerTextSecondary: {
    color: SecondaryColor,
  },
  contentContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    width: wScale(350),
    marginBottom: hScale(20),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    height: hScale(400),
  },
  infoContainer: {
    backgroundColor: PrimaryColor,
    padding: 15,
    alignItems: "center",
    borderRadius: 10,
    marginBottom: hScale(20),
  },
  infoText: {
    color: TextColor,
    fontSize: 16,
    fontWeight: "bold",
  },
  languageContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: hScale(20),
  },
  languageButton: {
    flex: 1,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    borderRadius: 10,
    backgroundColor: PrimaryColor,
    padding: 10,
  },
  languageButtonActive: {
    backgroundColor: SecondaryColor,
  },
  languageButtonText: {
    color: TextColor,
    fontSize: 16,
    fontWeight: "bold",
  },
  languageContent: {
    height: 200,
    borderColor: PrimaryColor,
    borderWidth: 2,
    borderRadius: 10,
    padding: 10,
    marginBottom: hScale(20),
    backgroundColor: "#fff",
  },
  languageText: {
    fontSize: 14,
  },
  videoContainer: {
    marginBottom: hScale(20),
  },
  video: {
    width: 300,
    height: 200,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: hScale(20),
  },
  startButton: {
    backgroundColor: PrimaryColor,
    padding: 15,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
    marginRight: 10,
  },
  startButtonText: {
    alignContent: "center",
    color: TextColor,
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: SecondaryColor,
    padding: 15,
    borderRadius: 10,
    flex: 1,
    alignItems: "center",
    marginLeft: 10,
  },
  logoutButtonText: {
    color: TextColor,
    fontSize: 16,
    fontWeight: "bold",
  },
  uploadButtonText: {
    width: wScale(170),
    color: "white",
    fontSize: 16,
    backgroundColor: PrimaryColor,
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
});

export default VideoKYC;
