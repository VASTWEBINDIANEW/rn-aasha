import { translate } from "../../../utils/languageUtils/I18n";
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Linking,
  Animated,
  StatusBar,
  Alert,
  AppState,
} from "react-native";
import {
  Camera,
  useCameraDevice,
  useCodeScanner,
  useCameraPermission,
} from "react-native-vision-camera";
import { useIsFocused } from "@react-navigation/native";
import Icon from "react-native-vector-icons/Ionicons";
import { useNavigation } from "../../../utils/navigation/NavigationService";

const { width } = Dimensions.get("window");
const SCAN_SIZE = width * 0.75;

const QRScanScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const device = useCameraDevice("back");

  const { hasPermission, requestPermission } = useCameraPermission();
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [flash, setFlash] = useState("off");

  const scanAnim = useRef(new Animated.Value(0)).current;

  // ================= PERMISSION =================
  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = async () => {
    const result = await requestPermission();

    if (!result) {
      Alert.alert(
        "Camera Permission Required",
        "Camera access is needed to scan QR code.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings(),
          },
        ]
      );
    } else {
      setIsCameraActive(true);
    }

    setPermissionChecked(true);
  };

  // ================= APP RESUME CHECK =================
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        checkPermission();
      }
    });
    return () => sub.remove();
  }, []);

  // ================= SCAN ANIMATION =================
  useEffect(() => {
    if (isFocused && isCameraActive && hasPermission) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: SCAN_SIZE - 10,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isFocused, isCameraActive, hasPermission]);

  // ================= CODE SCANNER =================
  const codeScanner = useCodeScanner({
    codeTypes: ["qr"],
    onCodeScanned: (codes) => {
      if (codes.length > 0 && isCameraActive) {
        setIsCameraActive(false);
        navigation.navigate("ShowUPIData", { upi: codes[0].value });
      }
    },
  });

  // ================= PERMISSION VIEW =================
  if (permissionChecked && !hasPermission) {
    return (
      <View style={styles.permissionContainer}>
        <Icon name="camera-outline" size={70} color="#999" />
        <Text style={styles.permissionTitle}>{translate("Camera_Access_Needed")}</Text>
        <Text style={styles.permissionSubtitle}>{translate("key_pleaseena_152")}</Text>

        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => Linking.openSettings()}
        >
          <Text style={styles.settingsText}>{translate("Open_Settings")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={{ color: "#fff" }}>{translate("No_Camera_Found")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="black" />

      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isFocused && isCameraActive && hasPermission}
        codeScanner={codeScanner}
        torch={flash}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.topMask} />

        <View style={styles.middleRow}>
          <View style={styles.sideMask} />

          <View style={styles.scanBox}>
            <View style={styles.border} />

            <Animated.View
              style={[
                styles.scanLine,
                { transform: [{ translateY: scanAnim }] },
              ]}
            />
          </View>

          <View style={styles.sideMask} />
        </View>

        <View style={styles.bottomMask}>
          <Text style={styles.title}>{translate("Scan_QR_Code")}</Text>
          <Text style={styles.subtitle}>{translate("Position_the_QR_inside_the_frame")}</Text>

          {/* Flash Button */}
          <TouchableOpacity
            style={styles.flashBtn}
            onPress={() =>
              setFlash(flash === "off" ? "on" : "off")
            }
          >
            <Icon
              name={flash === "off" ? "flash-off" : "flash"}
              size={22}
              color="#000"
            />
          </TouchableOpacity>

          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={{ fontSize: 18 }}>{translate("Close")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default QRScanScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },

  permissionContainer: {
    flex: 1,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },
  permissionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 20,
  },
  permissionSubtitle: {
    color: "#aaa",
    textAlign: "center",
    marginVertical: 15,
  },
  settingsBtn: {
    backgroundColor: "#fff",
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 25,
  },
  settingsText: { fontWeight: "600" },

  overlay: { flex: 1 },
  topMask: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  middleRow: { flexDirection: "row", height: SCAN_SIZE },
  sideMask: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)" },
  bottomMask: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    paddingTop: 30,
  },

  scanBox: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    borderRadius: 25,
    overflow: "hidden",
  },
  border: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#fff",
  },
  scanLine: {
    position: "absolute",
    width: "100%",
    height: 2,
    backgroundColor: "#00FFB3",
  },

  title: { color: "#fff", fontSize: 22, fontWeight: "600" },
  subtitle: { color: "#ccc", marginTop: 8 },

  flashBtn: {
    marginTop: 25,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 30,
  },

  closeBtn: {
    marginTop: 20,
  },
});
