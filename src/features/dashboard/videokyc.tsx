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
  ToastAndroid,
} from "react-native";

import { launchCamera } from "react-native-image-picker";
import { useDispatch, useSelector } from "react-redux";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";
import {
  check,
  openSettings,
  PERMISSIONS,
  request,
  RESULTS,
} from "react-native-permissions";

import { Video } from "react-native-compressor";
import RNFS from "react-native-fs";

import { useNavigation, useRoute } from "@react-navigation/native";

import useAxiosHook from "../../utils/network/AxiosClient";
import { APP_URLS } from "../../utils/network/urls";
import ShowLoader from "../../components/ShowLoder";
import { RootState } from "../../reduxUtils/store";
import { translate } from "../../utils/languageUtils/I18n";
import { useColorsOfApi } from "../../utils/styles/theme";
import { wScale, hScale } from '../../utils/styles/dimensions';
import {
  Camera,
  useCameraDevice,
} from "react-native-vision-camera";
import { useLocationHook } from "../../hooks/useLocationHook";
const VideoKYC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const cameraRef = useRef(null);

  const device = useCameraDevice("front");
  const { CNTNT } = route.params;
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const timerRef = useRef(null);
  const autoStopRef = useRef(null);
  const { userId, IsDealer } = useSelector(
    (state: RootState) => state.userInfo,
  );
  const { latitude, longitude, getLocation } = useLocationHook();
  const [isRecording, setIsRecording] = useState(false);
  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearTimeout(autoStopRef.current);
    };
  }, []);
  // ─── startRecording update karo ───────────────
  const startRecording = async () => {
    try {
      console.log('📹 cameraRef:', cameraRef.current);

      if (!cameraRef.current || !isCameraReady) {
        ToastAndroid.show("Camera not ready", ToastAndroid.SHORT);
        return;
      }

      setIsRecording(true);
      setIsLoading2(true);
      setContent(false);
      setRecordingSeconds(0);

      // ── Timer start ──
      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);

      // ── Auto stop 38 sec ──
      autoStopRef.current = setTimeout(async () => {
        if (cameraRef.current) {
          await cameraRef.current.stopRecording();
        }
      }, 38000);

      cameraRef.current.startRecording({
        onRecordingFinished: async (video) => {
          // timers clear karo
          clearInterval(timerRef.current);
          clearTimeout(autoStopRef.current);
          setRecordingSeconds(0);

          console.log('✅ Recording finished:', video.path);
          try {
            setLoader(true);
            const compressedVideo = await Video.compress(video.path, {
              compressionMethod: "manual",
            });
            const base64Video = await convertVideoToBase64(compressedVideo);
            setBase64Video(base64Video);
            ToastAndroid.show("Recording Complete!", ToastAndroid.LONG);
          } catch (e) {
            console.log('❌ Compress error:', e);
          } finally {
            setIsLoading2(false);
            setIsRecording(false);
            setLoader(false);
          }
        },
        onRecordingError: (error) => {
          clearInterval(timerRef.current);
          clearTimeout(autoStopRef.current);
          setRecordingSeconds(0);
          console.log('❌ Recording error:', error);
          setIsLoading2(false);
          setIsRecording(false);
        },
      });

    } catch (error) {
      clearInterval(timerRef.current);
      clearTimeout(autoStopRef.current);
      console.log('❌ startRecording catch:', error);
      setIsLoading2(false);
      setIsRecording(false);
    }
  };
  // ─── stopRecording add karo ───────────────────
  const stopRecording = async () => {
    try {
      clearInterval(timerRef.current);
      clearTimeout(autoStopRef.current);
      if (cameraRef.current) {
        await cameraRef.current.stopRecording();
      }
    } catch (e) {
      console.log(e);
    }
  };
  const { primary, secondary } = useColorsOfApi();

  // ✅ Dynamic Colors
  const C = {
    bg: "#0A0F1E",
    card: "#1A2035",
    cardDark: "#0D1525",
    border: "#2A3050",

    primary,
    secondary,

    primaryBg: `${primary}20`,
    primaryBorder: `${primary}66`,

    success: "#22C55E",
    successBg: "rgba(34,197,94,0.08)",
    successBorder: "rgba(34,197,94,0.3)",

    warning: "#EAB308",
    warningBg: "rgba(234,179,8,0.15)",

    text: "#E8EAF6",
    textMuted: "#9CA3AF",
    textDim: "#6B7280",
    textDimmer: "#4B5563",
  };

  const s = createStyles(C);


  const [content, setContent] = useState(true);
  const [englishRow, setEnglishRow] = useState(true);
  const [hindiRow, setHindiRow] = useState(false);

  const [firstTap, setFirstTap] = useState(true);
  const [secondTap, setSecondTap] = useState(false);

  const [videoBase64, setBase64Video] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);

  const [loader, setLoader] = useState(true);

  const [hindi, setHindi] = useState(IsDealer ? CNTNT.hindi : "");
  const [eng, setEng] = useState(IsDealer ? CNTNT.Eng : "");
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const [name, setName] = useState("");

  const { get } = useAxiosHook();

  const videoRef = useRef(null);

  useEffect(() => {
    if (!IsDealer) {
      fetchContent();
    }

    requestCameraPermission();
  }, []);

  // ✅ Camera Permission
  const requestCameraPermission = useCallback(async () => {
  try {
    if (Platform.OS !== "android") return true;

    // ── Camera ──
    const currentStatus = await check(PERMISSIONS.ANDROID.CAMERA);

    if (currentStatus === RESULTS.BLOCKED) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: translate("Permission Required"),
        textBody: translate("key_pleasegra_85"),
        button: translate("OK"),
        onPressButton: () => {
          Dialog.hide();
          openSettings().catch(() => console.warn("cannot open settings"));
        },
      });
      return false;
    }

    if (currentStatus !== RESULTS.GRANTED) {
      await request(PERMISSIONS.ANDROID.CAMERA);
    }

    // ── Mic ──
    const micStatus = await check(PERMISSIONS.ANDROID.RECORD_AUDIO);
    console.log('🎤 Mic status:', micStatus);

    if (micStatus === RESULTS.BLOCKED) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: "Microphone Permission Required",
        textBody: "Please allow Microphone permission from settings for Video KYC.",
        button: "Open Settings",
        onPressButton: () => {
          Dialog.hide();
          openSettings().catch(() => console.warn("cannot open settings"));
        },
      });
      return false;
    }

    if (micStatus !== RESULTS.GRANTED) {
      const micResult = await request(PERMISSIONS.ANDROID.RECORD_AUDIO);
      console.log('🎤 Mic result:', micResult);
    }

    return true;

  } catch (err) {
    console.warn(err);
    return false;
  }
}, []);

  // ✅ Change Language
  const changeLay = (lay) => {
    setFirstTap(lay === 1);
    setSecondTap(lay === 2);

    setEnglishRow(lay === 1);
    setHindiRow(lay === 2);
  };

  // ✅ Convert Video
  const convertVideoToBase64 = async (videoUri) => {
    try {
      return await RNFS.readFile(videoUri, "base64");
    } catch (error) {
      console.error("Base64 Error:", error);
      throw error;
    }
  };

  // ✅ Open Camera
  const openCamera = async () => {
    try {
      if (Platform.OS === "android") {
        const currentStatus = await check(
          PERMISSIONS.ANDROID.CAMERA,
        );

        if (currentStatus !== RESULTS.GRANTED) {
          const result = await request(
            PERMISSIONS.ANDROID.CAMERA,
          );

          if (result !== RESULTS.GRANTED) return;
        }
      }

      const options = {
        mediaType: "video",
        videoQuality: "high",
        durationLimit: 60,
        saveToPhotos: false,
      };

      launchCamera(options, async (response) => {
        if (response.didCancel) {
          setIsLoading2(false);
          setContent(true);
          return;
        }

        if (response.errorCode) {
          console.log("Camera Error:", response.errorMessage);
          setIsLoading2(false);
          return;
        }

        try {
          setLoader(true);

          const videoUri = response.assets?.[0]?.uri;

          if (!videoUri) {
            setLoader(false);
            return;
          }

          const compressedVideo = await Video.compress(
            videoUri,
            {
              compressionMethod: "manual",
            },
          );

          const base64Video =
            await convertVideoToBase64(compressedVideo);

          setBase64Video(base64Video);

          ToastAndroid.show(
            "Video Compression Complete!",
            ToastAndroid.LONG,
          );
        } catch (error) {
          console.error(error);

          ToastAndroid.show(
            "Compression Failed",
            ToastAndroid.LONG,
          );
        } finally {
          setLoader(false);
          setIsLoading(false);
          setIsLoading2(false);
        }
      });
    } catch (err) {
      console.warn(err);
    }
  };

  // ✅ Upload Video
 const uploadKYCVideo = async (video) => {
    setIsLoading(true);

    const now = new Date();
    const datetime = now.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    });

    const url = `https://${APP_URLS.baseWebUrl}api/user/UploadKYCVIDEO`;

    const payload = {
        userids: userId,
        role: "Retailer",
        kycvideo: video,
        latitude: latitude ? String(latitude) : "",
        longitude: longitude ? String(longitude) : "",
        datetime: datetime,
    };

    console.log('📦 UPLOAD PAYLOAD:', JSON.stringify({
        userids: payload.userids,
        role: payload.role,
        latitude: payload.latitude,
        longitude: payload.longitude,
        datetime: payload.datetime,
        kycvideo_length: video?.length,
    }, null, 2));

    const data = JSON.stringify(payload);  // ← yeh missing tha

    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json");

    xhr.onload = () => {
        setIsLoading(false);
        console.log('✅ STATUS:', xhr.status);
        console.log('✅ RESPONSE:', xhr.responseText);
        try {
            const responseData = JSON.parse(xhr.responseText);
            if (responseData.status === "Success") {
                Alert.alert("Success", "Video Uploaded Successfully", [{
                    text: "OK",
                    onPress: () => IsDealer
                        ? navigation.goBack()
                        : navigation.navigate("LoginScreen"),
                }]);
            } else {
                Alert.alert("Upload Failed", responseData.msg || "Unknown Error");
            }
        } catch (e) {
            Alert.alert("Server Error", xhr.responseText || "Invalid Response");
        }
    };

    xhr.onerror = () => {
        setIsLoading(false);
        Alert.alert("Network Error", "Unable to upload video");
    };

    xhr.send(data);  // ✅ ab defined hai
};

  // ✅ Fetch Content
  const fetchContent = async () => {
    try {
      setLoader(true);

      const res = await get({
        url: APP_URLS.videokycContent,
      });

      const englishText =
        CNTNT["Eng"] || res.english;

      const hindiText =
        CNTNT["hindi"] || res.hindi;

      setName(res.remname || "");

      setEng(englishText);

      setHindi(hindiText);
    } catch (error) {
      console.error(error);
    } finally {
      setLoader(false);
    }
  };
  

  return (
    <View style={s.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <View style={s.headerRow}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <Text style={s.backArrow}>←</Text>
          </TouchableOpacity>
          <Text style={s.topTitle}>Video KYC</Text>
          {name ? <Text style={s.userName}>{name}</Text> : <View />}
        </View>

        {/* ── CAMERA BOX ── */}
        <View style={s.cameraBox}>
          {device ? (
            <Camera
              ref={cameraRef}
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={true}
              video={true}
              audio={true}   // ← temporarily false
              onInitialized={() => {
                console.log('✅ Camera Initialized');
                setIsCameraReady(true);   // ← ready flag
              }}
            />
          ) : (
            <ActivityIndicator size="large" color="#fff" />
          )}

          {/* Recording indicator + Timer */}
          {isRecording && (
            <View style={s.recIndicator}>
              <View style={s.recDot} />
              <Text style={s.recText}>
                REC  {String(Math.floor(recordingSeconds / 60)).padStart(2, '0')}:
                {String(recordingSeconds % 60).padStart(2, '0')} / 00:38
              </Text>
            </View>
          )}

          {/* Progress bar */}
          {isRecording && (
            <View style={s.progressBarBg}>
              <View style={[
                s.progressBarFill,
                { width: `${(recordingSeconds / 38) * 100}%` }
              ]} />
            </View>
          )}
          {isRecording && (
            <View style={s.recIndicator}>
              <View style={s.recDot} />
              <Text style={s.recText}>REC</Text>
            </View>
          )}

          {/* Bottom overlay */}
          <View style={s.cameraOverlay}>
            {!isRecording && (
              <Text style={s.camLabel}>Position your face in frame</Text>
            )}

            
          </View>
        </View>

        {/* ── LANGUAGE + CONTENT — recording me hide ── */}
        {content && (
          <View style={s.langRow}>
            <TouchableOpacity
              style={[s.langBtn, firstTap && s.langBtnActive]}
              onPress={() => changeLay(1)}
            >
              <Text style={s.langBtnText}>English</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.langBtn, secondTap && s.langBtnActive]}
              onPress={() => changeLay(2)}
            >
              <Text style={s.langBtnText}>हिंदी</Text>
            </TouchableOpacity>
          </View>
        )}


        <View style={s.contentBox}>
          {englishRow && <Text style={s.contentText}>{eng}</Text>}
          {hindiRow && <Text style={s.contentText}>{translate(hindi)}</Text>}
        </View>


        {/* ── BUTTONS ── */}
        <View style={s.btnRow}>
          {!isRecording ? (
            // Record button
            <TouchableOpacity
              style={[s.btnRecord, !isCameraReady && { opacity: 0.5 }]}
              disabled={!isCameraReady}   // ← yeh add karo
              onPress={startRecording}
            >
              {isLoading2 ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.btnRecordText}>⏺  Record</Text>
              )}
            </TouchableOpacity>
          ) : (
            // Stop button
            <TouchableOpacity style={s.btnStop} onPress={stopRecording}>
              <Text style={s.btnStopText}>⏹  Stop</Text>
            </TouchableOpacity>
          )}

          {!isRecording && (
            <TouchableOpacity
              style={[s.btnUpload, videoBase64 && s.btnUploadReady]}
              onPress={() => {
                if (!videoBase64) {
                  ToastAndroid.show("Please record video first", ToastAndroid.SHORT);
                } else {
                  uploadKYCVideo(videoBase64);
                }
              }}
            >
              <Text style={s.btnUploadText}>↑  Upload</Text>
            </TouchableOpacity>
          )}
        </View>

        {isLoading && (
          <ActivityIndicator size="large" color={C.primary} style={{ marginTop: 12 }} />
        )}
        {loader && <ShowLoader />}
      </ScrollView>
    </View>
  );
};

// ✅ Dynamic Styles
const createStyles = (C) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: C.bg },
    scroll: {
      paddingHorizontal: wScale(16),
      paddingTop: hScale(10),
      paddingBottom: hScale(40),
    },

    // ── HEADER (chota) ──
    headerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: wScale(12),
      marginBottom: hScale(14),
    },
    backBtn: {
      width: wScale(38),
      height: hScale(38),
      borderRadius: wScale(12),
      backgroundColor: C.card,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 0.5,
      borderColor: C.border,
    },
    backArrow: { color: C.text, fontSize: wScale(18), fontWeight: "700" },
    topTitle: { color: C.text, fontSize: wScale(16), fontWeight: "700" },
    userName: {
      marginLeft: "auto",
      color: C.textMuted,
      fontSize: wScale(13),
      fontWeight: "500",
    },

    // ── CAMERA ──
    cameraBox: {
      height: hScale(380),
      borderRadius: wScale(24),
      backgroundColor: C.cardDark,
      overflow: "hidden",
      marginBottom: hScale(16),
      borderWidth: 1,
      borderColor: C.primaryBorder,
    },


    // recText: { color: "#fff", fontSize: wScale(12), fontWeight: "700" },
    cameraOverlay: {
      position: "absolute",
      bottom: hScale(20),
      alignSelf: "center",
    },
    camLabel: {
      color: "#fff",
      fontSize: wScale(13),
      fontWeight: "600",
      backgroundColor: "rgba(0,0,0,0.45)",
      paddingHorizontal: wScale(14),
      paddingVertical: hScale(6),
      borderRadius: wScale(20),
    },

    // ── LANGUAGE ──
    langRow: {
      flexDirection: "row",
      marginBottom: hScale(14),
      gap: wScale(10),
    },
    langBtn: {
      flex: 1,
      height: hScale(46),
      borderRadius: wScale(14),
      backgroundColor: C.card,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: "transparent",
    },
    langBtnActive: { backgroundColor: C.primaryBg, borderColor: C.primary },
    langBtnText: { color: C.text, fontWeight: "600", fontSize: wScale(14) },

    // ── CONTENT ──
    contentBox: {
      backgroundColor: C.card,
      borderRadius: wScale(18),
      paddingHorizontal: wScale(16),
      paddingVertical: hScale(16),
      marginBottom: hScale(18),
    },
    contentText: { color: C.textMuted, lineHeight: hScale(22), fontSize: wScale(13) },

    // ── BUTTONS ──
    btnRow: {
      flexDirection: "row",
      gap: wScale(12),
      marginTop: hScale(4),
    },
    btnRecord: {
      flex: 1,
      height: hScale(54),
      borderRadius: wScale(16),
      backgroundColor: C.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    btnRecordText: { color: "#fff", fontWeight: "700", fontSize: wScale(15) },

    // Stop button
    btnStop: {
      flex: 1,
      height: hScale(54),
      borderRadius: wScale(16),
      backgroundColor: "#EF4444",
      justifyContent: "center",
      alignItems: "center",
    },
    btnStopText: { color: "#fff", fontWeight: "700", fontSize: wScale(15) },

    btnUpload: {
      flex: 1,
      height: hScale(54),
      borderRadius: wScale(16),
      backgroundColor: C.card,
      borderWidth: 1,
      borderColor: C.border,
      justifyContent: "center",
      alignItems: "center",
    },
    btnUploadReady: {
      borderColor: "#22C55E",
      backgroundColor: "rgba(34,197,94,0.08)",
    },
    btnUploadText: { color: C.text, fontWeight: "700", fontSize: wScale(15) },
    recIndicator: {
      position: "absolute",
      top: hScale(14),
      left: wScale(14),
      flexDirection: "row",
      alignItems: "center",
      gap: wScale(6),
      backgroundColor: "rgba(0,0,0,0.55)",
      paddingHorizontal: wScale(12),
      paddingVertical: hScale(6),
      borderRadius: wScale(20),
    },
    recDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#EF4444",
    },
    recText: {
      color: "#fff",
      fontSize: wScale(12),
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    progressBarBg: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      height: hScale(4),
      backgroundColor: "rgba(255,255,255,0.15)",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: "#EF4444",
      borderRadius: 2,
    },

  });

export default VideoKYC;