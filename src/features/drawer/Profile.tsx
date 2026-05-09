/**
 * Profile.tsx — Enhanced & Optimized
 *
 * Changes from original:
 *  1. SVG constants moved outside component (no re-creation on every render)
 *  2. Removed unused imports: transform, color (rneui), Test, ImageUploadBottomSheet,
 *     AadharCardUpload, TextInput (RN)
 *  3. Fixed infinite-loop useEffect — split into (a) mount-fetch, (b) sync form fields
 *  4. Removed duplicate fetchData() call inside Promise.all
 *  5. Removed all undefined-variable references (setIsMobileFocused, typ in uploadDoCxAdhar)
 *  6. Consolidated duplicate camera-permission + upload logic into reusable helpers
 *  7. Added ProfileData interface for full type-safety
 *  8. DocCard sub-component with colour-coded status badges
 *  9. Modern profile header: circular avatar, role badge, join date
 * 10. KYC banner replaced with modern card (colour-coded by status)
 * 11. Bottom-sheet header now uses colorConfig.primaryColor
 * 12. All console.log / console.error removed from production paths
 * 13. Removed hardcoded / dead UpdateProfile function
 */

import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Image } from "react-native-animatable";
import {
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
  ToastAndroid,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { ScrollView, TouchableOpacity } from "react-native-gesture-handler";
import LinearGradient from "react-native-linear-gradient";
import { SvgXml } from "react-native-svg";
import { hScale, SCREEN_HEIGHT, wScale } from "../../utils/styles/dimensions";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { RootState } from "../../reduxUtils/store";
import LottieView from "lottie-react-native";
import { BottomSheet } from "@rneui/base";
import SelectableButton from "./profilePages/selectButton";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import AppBar from "./headerAppbar/AppBar";
import FlotingInput from "./securityPages/FlotingInput";
import useAxiosHook from "../../utils/network/AxiosClient";
import { APP_URLS } from "../../utils/network/urls";
import { decryptData } from "../../utils/encryptionUtils";
import ImageBottomSheet from "../../components/ImageBottomSheet";
import { stateData } from "../../utils/stateData";
import { colors } from "../../utils/styles/theme";
import { FlashList } from "@shopify/flash-list";
import { check, openSettings, RESULTS, PERMISSIONS, request } from 'react-native-permissions';
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";
import { translate } from "../../utils/languageUtils/I18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getImageSource2 } from "../../utils/network/NetWorkImages";

// ─────────────────────────────────────────────────────────────────────────────
// SVG CONSTANTS  (outside component → no re-creation on each render)
// ─────────────────────────────────────────────────────────────────────────────

const DELETE_ACCOUNT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="25" height="25" x="0" y="0" viewBox="0 0 64 64" style="enable-background:new 0 0 512 512" xml:space="preserve"><g><path d="m54 19.07-2.67 36.37a5 5 0 0 1-5 4.56H36a1 1 0 0 1 0-2h10.35a3 3 0 0 0 3-2.73L52 18.93a1 1 0 1 1 2 .14ZM59 13a3 3 0 0 1-3 3H20v9a1 1 0 0 1-2 0v-9h-2a3 3 0 0 1 0-6h10V9a5 5 0 0 1 5-5h10a5 5 0 0 1 5 5v1h10a3 3 0 0 1 3 3Zm-31-3h16V9a3 3 0 0 0-3-3H31a3 3 0 0 0-3 3Zm-9 41a7 7 0 0 0-7 7s0 .06 0 .09a13.86 13.86 0 0 0 14 0s0-.09 0-.09a7 7 0 0 0-7-7Zm14-5a14 14 0 0 1-5.09 10.79 9 9 0 0 0-6.29-7.4 6 6 0 1 0-5.24 0 9 9 0 0 0-6.29 7.4A14 14 0 1 1 33 46Zm-21 1a1 1 0 0 0-.08-.38 1.15 1.15 0 0 0-.21-.33A1 1 0 0 0 10 47a1.23 1.23 0 0 0 0 .19.6.6 0 0 0 .06.19.76.76 0 0 0 .09.18 1.58 1.58 0 0 0 .12.15A1 1 0 0 0 12 47Zm16 0a1 1 0 0 0-.08-.38.93.93 0 0 0-.21-.33 1 1 0 0 0-.16-.12.56.56 0 0 0-.17-.09.6.6 0 0 0-.19-.06 1 1 0 0 0-.9.27.93.93 0 0 0-.21.33.84.84 0 0 0-.08.38.68.68 0 0 0 0 .2.64.64 0 0 0 .06.18.76.76 0 0 0 .09.18 1.58 1.58 0 0 0 .12.15l.15.12.18.09a.64.64 0 0 0 .18.06h.39a.6.6 0 0 0 .19-.06 1.15 1.15 0 0 0 .33-.21A1.05 1.05 0 0 0 28 47Z" fill="#000000" opacity="1"/></g></svg>`;

const EDIT_PROFILE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" fill="#fff" height="22" width="22" viewBox="0 0 576 512"><path d="M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"/></svg>`;

const DROPDOWN_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 128 128"><path fill="#888" fill-rule="evenodd" d="M20.586 47.836a2 2 0 0 0 0 2.828l39.879 39.879a5 5 0 0 0 7.07 0l39.879-39.879a2 2 0 0 0-2.828-2.828L64.707 87.714a1 1 0 0 1-1.414 0L23.414 47.836a2 2 0 0 0-2.828 0z" clip-rule="evenodd"/></svg>`;

const CALENDAR_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 448 512"><path fill="#888" d="M152 64H296V24C296 10.7 306.7 0 320 0s24 10.7 24 24V64h40c35.3 0 64 28.7 64 64v320c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128C0 92.7 28.7 64 64 64h40V24C104 10.7 114.7 0 128 0s24 10.7 24 24V64zM48 248c0 8.8 7.2 16 16 16H384c8.8 0 16-7.2 16-16s-7.2-16-16-16H64c-8.8 0-16 7.2-16 16z"/></svg>`;

/** Gender SVG needs colorConfig — returned as a factory fn, memoised inside component */
const makeGenderSVG = (primary: string, secondary: string) =>
  `<svg viewBox="0 0 64 64" width="28" height="28" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><linearGradient id="gg" gradientUnits="userSpaceOnUse" x1="3" x2="61" y1="32" y2="32"><stop offset="0" stop-color="${primary}"/><stop offset="1" stop-color="${secondary}"/></linearGradient><path d="m17.75 46.87a3.19 3.19 0 0 1-3.19-3.18v-3.96a8.637 8.637 0 0 1 5.91-8.2l7.87-2.62c-9.2-4.88-5.86-18.95 4.7-19.04 10.58.13 13.9 14.11 4.7 19.04l7.86 2.62a8.624 8.624 0 0 1 5.91 8.2v3.96a3.188 3.188 0 0 1-3.18 3.18z" fill="url(#gg)"/></svg>`;

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface ProfileData {
  Name?: string;
  firmName?: string;
  JoinDate?: string;
  Mobile?: string;
  Email?: string;
  BusinessType?: string;
  Aadhar?: string;
  BusinessTypeCode?: string;
  PAN?: string;
  GST?: string;
  Address?: string;
  State?: string;
  District?: string;
  Cityname?: string;
  PINCode?: string;
  Photo?: string | null;
  dob?: string;
  videokycstatus?: string;
  aadharsts?: string;
  chkaadharfront?: string | null;
  chkaadharback?: string | null;
  pancardPath?: string | null;
  PSAStatus?: string;
  chkpanpath?: string;
  chkRegistractioncertificatepath?: string | null;
  serviceagreementpath?: string | null;
  chkShopwithSalfie?: string | null;
  aadharcardPath?: string;
  Iserviceagreementtatus?: string;
}

type DocStatus = "verified" | "pending" | "upload";

// ─────────────────────────────────────────────────────────────────────────────
// DOC CARD  sub-component
// ─────────────────────────────────────────────────────────────────────────────

const DOC_STATUS_META: Record<DocStatus, { color: string; bg: string; labelKey: string }> = {
  verified: { color: "#16a34a", bg: "#dcfce7", labelKey: "Verified" },
  pending:  { color: "#d97706", bg: "#fef3c7", labelKey: "Under Review" },
  upload:   { color: "#dc2626", bg: "#fee2e2", labelKey: "Upload Required" },
};

interface DocCardProps {
  label: string;
  value?: string;
  status: DocStatus;
  lottieSource: any;
  onPress: () => void;
}

const DocCard: React.FC<DocCardProps> = React.memo(
  ({ label, value, status, lottieSource, onPress }) => {
    const meta = DOC_STATUS_META[status];
    return (
      <View style={docStyles.card}>
        <View style={[docStyles.statusBar, { backgroundColor: meta.color }]} />
        <View style={docStyles.cardBody}>
          <Text style={docStyles.cardLabel}>{label}</Text>
          {!!value && (
            <Text style={docStyles.cardValue} numberOfLines={1}>
              {value}
            </Text>
          )}
          <View style={[docStyles.badge, { backgroundColor: meta.bg }]}>
            <Text style={[docStyles.badgeText, { color: meta.color }]}>
              {translate(meta.labelKey)}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={onPress} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <LottieView
            autoPlay
            loop
            style={{ height: hScale(46), width: wScale(46) }}
            source={lottieSource}
          />
        </TouchableOpacity>
      </View>
    );
  },
);

const docStyles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: wScale(12),
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: hScale(10),
    overflow: "hidden",
  },
  statusBar: {
    width: wScale(5),
    alignSelf: "stretch",
  },
  cardBody: {
    flex: 1,
    paddingVertical: hScale(10),
    paddingHorizontal: wScale(12),
  },
  cardLabel: {
    fontSize: wScale(14),
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: hScale(2),
  },
  cardValue: {
    fontSize: wScale(12),
    color: "#64748b",
    marginBottom: hScale(5),
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: wScale(9),
    paddingVertical: hScale(2),
    borderRadius: 20,
  },
  badgeText: {
    fontSize: wScale(11),
    fontWeight: "700",
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const Profile: React.FC = () => {
  const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);
  const { userId } = useSelector((state: RootState) => state.userInfo);
  const { get } = useAxiosHook();
  const navigation = useNavigation();
  const role = "Retailer";

  // ── State ──────────────────────────────────────────────────────────────────
  const [profileData, setProfileData] = useState<ProfileData>({});
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState("");
  const [isImageModalVisible, setImageModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [selectedopt, setSelectedOpt] = useState(true);
  const [selectedGender, setSelectedGender] = useState("Male");
  const [refreshing, setRefreshing] = useState(false);
  const [showStateList, setShowStateList] = useState(false);
  const [showDistrictList, setShowDistrictList] = useState(false);
  const [districtData, setDistrictData] = useState<any[]>([]);
  const [base64Img, setBase64Img] = useState<string | null>(null);
  const [showLoader, setShowLoader] = useState(false);
  const [lastUpload, setLastUpload] = useState("");

  // Form-field mirrors (synced from profileData after fetch)
  const [nameVal, setNameVal] = useState("");
  const [firmNameVal, setFirmNameVal] = useState("");
  const [aadharNo, setAadharNo] = useState("");
  const [panNo, setPanNo] = useState("");
  const [gst, setGst] = useState("");
  const [stateVal, setStateVal] = useState("");
  const [districtVal, setDistrictVal] = useState("");

  // Derived SVG (memo — only recalculates when colorConfig changes)
  const genderSvg = React.useMemo(
    () => makeGenderSVG(colorConfig.primaryColor, colorConfig.secondaryColor),
    [colorConfig.primaryColor, colorConfig.secondaryColor],
  );

  // ── Default / merged profile ───────────────────────────────────────────────
  const defaultProfileData: ProfileData = {
    Name: "",
    firmName: "",
    JoinDate: new Date().toISOString().split("T")[0],
    Mobile: "",
    Email: "",
    BusinessType: "",
    Aadhar: "",
    PAN: "",
    GST: "",
    Address: "",
    State: "",
    District: "",
    Cityname: "",
    PINCode: "",
    Photo: null,
    dob: "",
  };
  const profileDataToUse = { ...defaultProfileData, ...profileData };
  const hasProfileData = Object.keys(profileData).length > 0;

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    const url2 = `${APP_URLS.dealer_profile}dlmid=${userId}`;
    const res = await get({ url: IsDealer ? url2 : APP_URLS.getProfile });
    if (res) {
      const data = IsDealer
        ? res
        : JSON.parse(decryptData(res.value1, res.value2, res.data));
      setProfileData(data);
    }
    setRefreshing(false);
  }, [get, userId, IsDealer]);

  // Mount — fetch once
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sync form fields whenever profileData is updated (no infinite loop)
  useEffect(() => {
    if (!hasProfileData) return;
    setNameVal(profileData.Name ?? "");
    setFirmNameVal(profileData.firmName ?? "");
    setAadharNo(profileData.Aadhar ?? "");
    setPanNo(profileData.PAN ?? "");
    setGst(profileData.GST ?? "");
    setStateVal(profileData.State ?? "");
    setDistrictVal(profileData.District ?? "");
  }, [profileData]); // profileData object reference changes only when setProfileData is called

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // Re-fetch when navigating back after edits
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("Profile_status")
        .then((status) => {
          if (status === "Updated") fetchData();
        })
        .catch(() => {});
    }, [fetchData]),
  );

  // ── Districts ──────────────────────────────────────────────────────────────
  const getDistricts = useCallback(
    async ({ id }: { id: number }) => {
      const response = await get({ url: `${APP_URLS.getDistricts}${id}` });
      setDistrictData(response ?? []);
    },
    [get],
  );

  // ── Camera Permission (consolidated) ──────────────────────────────────────
  const requestCameraPermission = useCallback(
    async (type: string) => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: translate("Camera Permission"),
            message: translate("key_thisappn_102"),
            buttonPositive: translate("OK"),
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          if (type === "AA") {
            (navigation as any).navigate("AadharCardUpload", {
              id: userId,
            });
          } else {
            await launchCamera(
              { mediaType: "photo", includeBase64: true },
              (response) => {
                const b64 = response?.assets?.[0]?.base64;
                if (b64) {
                  setBase64Img(b64);
                  uploadDocument(type, b64);
                }
              },
            );
          }
        } else {
          Dialog.show({
            type: ALERT_TYPE.WARNING,
            title: translate("Permission Required"),
            textBody: translate("key_pleasegra_85"),
            button: translate("OK"),
            onPressButton: () => {
              Dialog.hide();
              openSettings().catch(() => {});
            },
          });
        }
      } catch (_) {}
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [navigation, userId],
  );

  // ── Document Upload ────────────────────────────────────────────────────────
  const buildUploadPayload = (type: string, b64: string) => {
    const base = { txtretailerid: userId, currentrole: role };
    switch (type) {
      case "Aadhar Card":
        return { AadharcardFront: b64, AadharcardBack: b64, ...base };
      case "Pan Card":
        return { PancardFront: b64, ...base };
      case "GST IN":
        return { Registrationcertificatepath: b64, ...base };
      case "Shop Selfie":
        return { ShopeWithSelfie: b64, ...base };
      case "Service Agreement":
        return { Serviceaggreementpath: b64, ...base };
      case "Profile image":
        return { ProfileImagess: b64, ...base };
      default:
        return null;
    }
  };

  const uploadDocument = useCallback(
    async (type: string, b64: string) => {
      setImageModalVisible(false);
      const payload = buildUploadPayload(type, b64);
      if (!payload) return;
      const endpoint =
        type === "Profile image"
          ? "api/user/UploadUserImages"
          : "api/user/UploadDocumentsImages";
      try {
        const response = await fetch(
          `https://${APP_URLS.baseWebUrl}${endpoint}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(payload),
          },
        );
        if (!response.ok) throw new Error(`Status: ${response.status}`);
        const result = await response.json();
        ToastAndroid.show(String(result), ToastAndroid.SHORT);
      } catch (err: any) {
        Alert.alert("Error", `Failed to upload ${type}: ${err.message}`);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId],
  );

  const showUploadOptions = useCallback(
    (typeName: string) => {
      setLastUpload(typeName);
      Alert.alert(
        typeName,
        translate(`Choose Options For Upload ${typeName}`),
        [
          { text: translate("Cancel"), style: "cancel" },
          {
            text: translate("Camera"),
            onPress: () => requestCameraPermission(typeName),
          },
          {
            text: translate("Gallary"),
            onPress: async () => {
              await launchImageLibrary(
                { selectionLimit: 1, mediaType: "photo", includeBase64: true },
                (response) => {
                  const b64 = response?.assets?.[0]?.base64;
                  if (b64) {
                    setBase64Img(b64);
                    uploadDocument(typeName, b64);
                  }
                },
              );
            },
          },
        ],
        { cancelable: false },
      );
    },
    [requestCameraPermission, uploadDocument],
  );

  // ── Navigate to Edit Profile ───────────────────────────────────────────────

const navigateToEditProfile = useCallback(async () => {
  try {
    // ✅ Pehle check karo
    const status = await check(PERMISSIONS.ANDROID.CAMERA);

    if (status === RESULTS.BLOCKED) {
      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: translate('Permission Required'),
        textBody: translate('key_pleasegra_85'),
        button: translate('OK'),
        onPressButton: () => {
          Dialog.hide();
          openSettings().catch(() => {});
        },
      });
      return;
    }

    // ✅ Granted nahi hai toh maango
    if (status !== RESULTS.GRANTED) {
      const result = await request(PERMISSIONS.ANDROID.CAMERA);
      if (result !== RESULTS.GRANTED) return;
    }

    // ✅ Permission mili — navigate karo
    await AsyncStorage.setItem('Profile_status', 'un');
    (navigation as any).navigate('EditProfile', {
      profileData: profileDataToUse,
    });

  } catch (_) {}
}, [navigation, profileDataToUse]);

  // ── Gender Toggle ──────────────────────────────────────────────────────────
  const handleGenderChange = useCallback(() => {
    setSelectedGender((prev) => {
      if (prev === "Male") return "Female";
      if (prev === "Female") return "Other";
      return "Male";
    });
  }, []);

  // ── Document status helpers ────────────────────────────────────────────────
  const aadharStatus: DocStatus =
    profileData.aadharsts === "N" &&
    !profileData.chkaadharfront &&
    !profileData.chkaadharback
      ? "upload"
      : profileData.aadharsts === "P"
        ? "pending"
        : "verified";

  const panStatus: DocStatus =
    !profileData.pancardPath && profileData.PSAStatus === "N"
      ? "upload"
      : profileData.PSAStatus === "P"
        ? "pending"
        : "verified";

  const gstStatus: DocStatus = !profileData.chkRegistractioncertificatepath
    ? "upload"
    : "verified";
  const serviceStatus: DocStatus = !profileData.serviceagreementpath
    ? "upload"
    : "verified";
  const selfieStatus: DocStatus = !profileData.chkShopwithSalfie
    ? "upload"
    : "verified";
  const addrStatus: DocStatus = !profileData.chkaadharback ? "upload" : "verified";

  // ── State / District list (bottom sheet) ──────────────────────────────────
  const renderListSheet = () => (
    <FlashList
      style={{ marginBottom: wScale(50), marginHorizontal: wScale(16) }}
      data={(showStateList ? stateData : districtData) as any[]}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.listItem}
          onPress={async () => {
            if (showStateList) {
              setShowStateList(false);
              setStateVal(item.stateName);
              await getDistricts({ id: item.stateId });
            } else {
              setShowDistrictList(false);
              setDistrictVal(item["Dist Name"]);
            }
          }}
        >
          <Text style={styles.listItemText}>
            {showStateList ? item.stateName : item["Dist Name"]}
          </Text>
        </TouchableOpacity>
      )}
      estimatedItemSize={48}
    />
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  /** Modern circular-avatar header */
  const renderProfileHeader = () => (
    <View style={styles.profileCard}>
      {/* Avatar */}
      <View style={styles.avatarWrap}>
        <View style={[styles.avatarRing, { borderColor: "rgba(255,255,255,0.7)" }]}>
          <Image
            resizeMode="cover"
            source={
              profileImage
                ? { uri: "data:image/png;base64," + profileImage }
                : profileData?.Photo
                  ? { uri: `http://${APP_URLS.baseWebUrl}${profileData.Photo}` }
                  : getImageSource2("bussiness-man.png")
            }
            style={styles.avatarImg}
          />
        </View>
        <TouchableOpacity
          onPress={navigateToEditProfile}
          activeOpacity={0.85}
          style={[styles.editFab, { backgroundColor: colorConfig.secondaryColor }]}
        >
          <SvgXml xml={EDIT_PROFILE_SVG} />
        </TouchableOpacity>
      </View>

      {/* Name + meta */}
      <Text allowFontScaling={false} style={styles.profileName}>
        {profileData?.Name || "Your Name"}
      </Text>
      <View style={styles.profileMetaRow}>
        <View style={styles.rolePill}>
          <Text style={styles.rolePillText}>{IsDealer ? "Dealer" : role}</Text>
        </View>
        {profileData?.JoinDate ? (
          <Text style={styles.joinDate}>{translate("Since")} {profileData.JoinDate}</Text>
        ) : null}
      </View>

      {/* Note */}
      <Text allowFontScaling={false} style={styles.profileNote}>
        {translate("Profile Important Note")}
      </Text>
      <Text allowFontScaling={false} style={styles.profileDesc}>
        {translate("description")}
      </Text>
    </View>
  );

  /** Video-KYC status banner */
  const renderKycBanner = () => {
    // videokycstatus: 'Y' = completed (hide), 'N' = not done (red), others = pending (orange)
    if (!hasProfileData || profileData.videokycstatus === "Y") return null;
    const isNotDone = profileData.videokycstatus === "N";
    const bannerColor = isNotDone ? "#dc2626" : "#b45309";
    const bannerBg = isNotDone ? "#fef2f2" : "#fffbeb";
    const bannerBorder = isNotDone ? "#fca5a5" : "#fcd34d";
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          (navigation as any).navigate("VideoKYC", {
            CNTNT: { hindi: "", Eng: "" },
          })
        }
        style={[
          styles.kycBanner,
          { backgroundColor: bannerBg, borderColor: bannerBorder },
        ]}
      >
        <Text style={styles.kycBannerIcon}>{isNotDone ? "🎥" : "⏳"}</Text>
        <View style={{ flex: 1 }}>
          <Text style={[styles.kycBannerTitle, { color: bannerColor }]}>
            {isNotDone
              ? translate("Continue to video kyc")
              : translate("Pending")}
          </Text>
          <Text style={styles.kycBannerSub}>
            {isNotDone
              ? translate("Tap to complete your video KYC")
              : translate("Your video KYC is under review")}
          </Text>
        </View>
        <Text style={[styles.kycBannerArrow, { color: bannerColor }]}>›</Text>
      </TouchableOpacity>
    );
  };

  /** Personal Info tab */
  const renderPersonalInfo = () => (
    <View>
      {renderKycBanner()}

      <FlotingInput
        label={translate("Your Name")}
        value={nameVal}
        autoFocus={false}
        editable
        onChangeTextCallback={setNameVal}
      />

      {/* Gender */}
      <View style={styles.fieldRow}>
        <FlotingInput
          label={translate("Select Your gender")}
          value={selectedGender}
          editable={false}
          autoFocus={false}
        />
        <View style={styles.fieldIcon}>
          <TouchableOpacity onPress={handleGenderChange} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <SvgXml xml={genderSvg} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Date of Birth */}
      <View style={styles.fieldRow}>
        <FlotingInput
          label={translate("Date Of Birth (DD MM YYYY)")}
          keyboardType="number-pad"
          value={profileData.dob ?? ""}
        />
        <View style={styles.fieldIcon}>
          <SvgXml xml={CALENDAR_SVG} />
        </View>
      </View>

      {/* State */}
      <View style={styles.fieldRow}>
        <FlotingInput
          label={translate("Select State")}
          editable={false}
          value={stateVal}
        />
        <View style={styles.fieldIcon}>
          <TouchableOpacity onPress={() => setShowStateList(true)}>
            <SvgXml xml={DROPDOWN_SVG} />
          </TouchableOpacity>
        </View>
      </View>

      {/* District */}
      <View style={styles.fieldRow}>
        <FlotingInput
          label={translate("Select District")}
          editable={false}
          value={districtVal}
        />
        <View style={styles.fieldIcon}>
          <TouchableOpacity
            onPress={() => districtData.length > 0 && setShowDistrictList(true)}
          >
            <SvgXml xml={DROPDOWN_SVG} />
          </TouchableOpacity>
        </View>
      </View>

      <FlotingInput label={translate("Address")} multiline value={profileData?.Address ?? ""} />
      <FlotingInput
        label={translate("Area Pincode")}
        keyboardType="number-pad"
        value={profileData?.PINCode ?? ""}
      />
      <FlotingInput label={translate("Registered Mobile")} value={profileData?.Mobile ?? ""} />
      <FlotingInput label={translate("Registered Email ID")} value={profileData?.Email ?? ""} />
    </View>
  );

  /** Business KYC tab — document cards */
  const renderBusinessKyc = () => (
    <View>
      <FlotingInput
        label={translate("Firm Name")}
        value={firmNameVal}
        onChangeTextCallback={setFirmNameVal}
      />

      {showLoader && (
        <ActivityIndicator
          size={wScale(36)}
          style={styles.loader}
          color={colors.black}
        />
      )}

      {/* Aadhar Card */}
      <DocCard
        label={translate("Aadhar Card")}
        value={aadharNo}
        status={aadharStatus}
        lottieSource={
          aadharStatus === "upload"
            ? require("../../utils/lottieIcons/upload-file.json")
            : require("../../utils/lottieIcons/View-Docs.json")
        }
        onPress={() => {
          if (aadharStatus === "upload") {
            requestCameraPermission("AA");
          } else {
            const raw = profileData.aadharcardPath ?? "";
            setImagePath(raw.replace(/^https?:\/\/www\./, "https://"));
            setImageModalVisible(true);
            setModalTitle(translate("Aadhar Card (Front Side)"));
          }
        }}
      />

      {/* Pan Card */}
      <DocCard
        label={translate("Pan Card")}
        value={panNo}
        status={panStatus}
        lottieSource={
          panStatus === "upload"
            ? require("../../utils/lottieIcons/upload-file.json")
            : require("../../utils/lottieIcons/View-Docs.json")
        }
        onPress={() => {
          if (panStatus === "upload") {
            setShowLoader(true);
            showUploadOptions("Pan Card");
          } else {
            const raw = profileData.chkpanpath ?? "";
            const cleaned = raw.replace(/^https?:\/\/www\./, "https://");
            setImagePath(`http://${APP_URLS.baseWebUrl}${cleaned}`);
            setImageModalVisible(true);
            setModalTitle(translate("Pan Card"));
          }
        }}
      />

      {/* GST IN */}
      <DocCard
        label={translate("GST IN")}
        value={gst}
        status={gstStatus}
        lottieSource={
          gstStatus === "upload"
            ? require("../../utils/lottieIcons/upload-file.json")
            : require("../../utils/lottieIcons/View-Docs.json")
        }
        onPress={() => {
          if (!profileData.chkRegistractioncertificatepath) {
            setShowLoader(true);
            showUploadOptions("GST IN");
          } else {
            setImagePath(
              `http://${APP_URLS.baseWebUrl}${profileData.chkRegistractioncertificatepath}`,
            );
            setImageModalVisible(true);
            setModalTitle(translate("GST IN"));
          }
        }}
      />

      {/* Service Agreement */}
      <DocCard
        label={translate("Service Agreement")}
        value={profileData.Iserviceagreementtatus}
        status={serviceStatus}
        lottieSource={
          serviceStatus === "upload"
            ? require("../../utils/lottieIcons/upload-file.json")
            : require("../../utils/lottieIcons/View-Docs.json")
        }
        onPress={() => {
          if (!profileData.serviceagreementpath) {
            setShowLoader(true);
            showUploadOptions("Service Agreement");
          } else {
            setImagePath(
              `http://${APP_URLS.baseWebUrl}${profileData.serviceagreementpath}`,
            );
            setImageModalVisible(true);
            setModalTitle(translate("Service Agreement"));
          }
        }}
      />

      {/* Shop Selfie */}
      <DocCard
        label={translate("Selfie with Shop")}
        status={selfieStatus}
        lottieSource={
          selfieStatus === "upload"
            ? require("../../utils/lottieIcons/upload-file.json")
            : require("../../utils/lottieIcons/View-Docs.json")
        }
        onPress={() => {
          if (!profileData.chkShopwithSalfie) {
            setShowLoader(true);
            showUploadOptions("Shop Selfie");
          } else {
            setImagePath(
              `http://${APP_URLS.baseWebUrl}${profileData.chkShopwithSalfie}`,
            );
            setImageModalVisible(true);
            setModalTitle(translate("Selfie with Shop"));
          }
        }}
      />

      {/* Address Proof */}
      <DocCard
        label={translate("Address Proof")}
        status={addrStatus}
        lottieSource={
          addrStatus === "upload"
            ? require("../../utils/lottieIcons/upload-file.json")
            : require("../../utils/lottieIcons/View-Docs.json")
        }
        onPress={() => {
          if (!profileData.chkaadharback) {
            showUploadOptions("Address Proof");
          } else {
            const raw = profileData.chkaadharback ?? "";
            const cleaned = raw.replace(/^https?:\/\/www\./, "https://");
            setImagePath(`http://${APP_URLS.baseWebUrl}${cleaned}`);
            setImageModalVisible(true);
            setModalTitle(translate("Address Proof (Back Side)"));
          }
        }}
      />
    </View>
  );

  /** Empty state when profile has never been filled */
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{translate("Complete Your Profile")}</Text>
      <Text style={styles.emptySub}>{translate("Set up your profile to access all features")}</Text>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          (navigation as any).navigate("EditProfile", {
            profileData: profileDataToUse,
          })
        }
        style={[styles.emptyBtn, { backgroundColor: colorConfig.secondaryColor }]}
      >
        <Text style={styles.emptyBtnText}>{translate("Click to Create Your Profile")}  →</Text>
      </TouchableOpacity>
      <View style={{ height: hScale(10) }} />
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          (navigation as any).navigate("VideoKYC", {
            CNTNT: { hindi: "", Eng: "" },
          })
        }
        style={[styles.emptyBtn, { backgroundColor: colorConfig.primaryColor }]}
      >
        <Text style={styles.emptyBtnText}>{translate("Click to Create Video Kyc")}  🎥</Text>
      </TouchableOpacity>
    </View>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
        style={{ flex: 1 }}
      >
        {/* App bar */}
        <AppBar
          title={translate("Manage Profile")}
          actionButton={<SvgXml xml={DELETE_ACCOUNT_SVG} />}
        />

        {/* Profile header card */}
        {renderProfileHeader()}

        {/* Tab switcher */}
        <View style={styles.tabWrap}>
          <SelectableButton setselectedopt={setSelectedOpt} />
        </View>

        {/* Scrollable body */}
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.bodyCard}>
            {hasProfileData
              ? selectedopt
                ? renderPersonalInfo()
                : renderBusinessKyc()
              : renderEmptyState()}
          </View>

          {/* State / District bottom sheet */}
          <BottomSheet
            isVisible={showStateList || showDistrictList}
            onBackdropPress={() => {
              setShowStateList(false);
              setShowDistrictList(false);
            }}
            containerStyle={{ backgroundColor: "transparent" }}
          >
            <View style={styles.bsContainer}>
              <View
                style={[
                  styles.bsHeader,
                  { backgroundColor: colorConfig.primaryColor },
                ]}
              >
                <Text style={styles.bsHeaderText}>
                  {showStateList
                    ? translate("select state")
                    : translate("select District")}
                </Text>
              </View>
              {renderListSheet()}
            </View>
          </BottomSheet>

          {/* Image viewer bottom sheet */}
          <ImageBottomSheet
            imagePath={imagePath}
            setModalVisible={setImageModalVisible}
            isModalVisible={isImageModalVisible}
            modalTitle={modalTitle}
            setImagePath={setImagePath}
            isUri
            ReUpload={() => {
              setImageModalVisible(false);
              const isAadhar =
                modalTitle === "Aadhar Card (Front Side)" ||
                modalTitle === "Address Proof (Back Side)";
              if (isAadhar) {
                requestCameraPermission("AA");
              } else {
                showUploadOptions(modalTitle || lastUpload);
              }
            }}
          />
        </ScrollView>
      </LinearGradient>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },

  // ── Profile header ─────────────────────────────────────────────────────────
  profileCard: {
    marginHorizontal: wScale(12),
    backgroundColor: "rgba(255,255,255,0.13)",
    borderRadius: wScale(16),
    paddingVertical: hScale(16),
    paddingHorizontal: wScale(16),
    alignItems: "center",
    marginBottom: hScale(4),
  },
  avatarWrap: {
    position: "relative",
    marginBottom: hScale(10),
  },
  avatarRing: {
    width: wScale(96),
    height: wScale(96),
    borderRadius: wScale(48),
    borderWidth: 3,
    padding: wScale(3),
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    borderRadius: wScale(44),
  },
  editFab: {
    position: "absolute",
    bottom: 0,
    right: -wScale(2),
    width: wScale(30),
    height: wScale(30),
    borderRadius: wScale(15),
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  profileName: {
    fontSize: wScale(20),
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.4,
    marginBottom: hScale(6),
  },
  profileMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: wScale(10),
    marginBottom: hScale(8),
  },
  rolePill: {
    backgroundColor: "rgba(255,255,255,0.22)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
    paddingHorizontal: wScale(12),
    paddingVertical: hScale(3),
    borderRadius: 20,
  },
  rolePillText: {
    fontSize: wScale(12),
    fontWeight: "700",
    color: "#fff",
  },
  joinDate: { fontSize: wScale(11), color: "rgba(255,255,255,0.75)" },
  profileNote: {
    fontSize: wScale(14),
    fontWeight: "700",
    color: "#fff",
    textAlign: "center",
    marginBottom: hScale(2),
  },
  profileDesc: {
    fontSize: wScale(12),
    color: "rgba(255,255,255,0.85)",
    textAlign: "center",
    lineHeight: hScale(18),
  },

  // ── Tab switcher ──────────────────────────────────────────────────────────
  tabWrap: {
    backgroundColor: "#fff",
    marginHorizontal: wScale(12),
    borderTopLeftRadius: wScale(12),
    borderTopRightRadius: wScale(12),
    paddingHorizontal: wScale(10),
    paddingTop: hScale(8),
  },

  // ── Body card ─────────────────────────────────────────────────────────────
  scrollContent: { paddingBottom: hScale(40) },
  bodyCard: {
    backgroundColor: "#fff",
    marginHorizontal: wScale(12),
    borderBottomLeftRadius: wScale(12),
    borderBottomRightRadius: wScale(12),
    paddingHorizontal: wScale(12),
    paddingTop: hScale(12),
    paddingBottom: hScale(20),
  },

  // ── KYC banner ────────────────────────────────────────────────────────────
  kycBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: wScale(12),
    padding: wScale(12),
    marginBottom: hScale(14),
  },
  kycBannerIcon: { fontSize: wScale(22), marginRight: wScale(10) },
  kycBannerTitle: { fontSize: wScale(14), fontWeight: "700" },
  kycBannerSub: {
    fontSize: wScale(11),
    color: "#6b7280",
    marginTop: hScale(1),
  },
  kycBannerArrow: { fontSize: wScale(26), fontWeight: "300", marginLeft: wScale(8) },

  // ── Field with overlay icon ───────────────────────────────────────────────
  fieldRow: { position: "relative" },
  fieldIcon: { position: "absolute", right: wScale(14), top: hScale(15) },

  // ── State / District bottom sheet ────────────────────────────────────────
  bsContainer: {
    backgroundColor: "#fff",
    height: SCREEN_HEIGHT / 1.5,
    borderTopLeftRadius: wScale(16),
    borderTopRightRadius: wScale(16),
    overflow: "hidden",
  },
  bsHeader: {
    paddingVertical: hScale(14),
    paddingHorizontal: wScale(16),
    alignItems: "center",
  },
  bsHeaderText: {
    fontSize: wScale(16),
    color: "#fff",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  listItem: {
    paddingVertical: hScale(12),
    paddingHorizontal: wScale(16),
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  listItemText: { color: "#ef4444", fontSize: wScale(16) },

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyState: { alignItems: "center", paddingVertical: hScale(24) },
  emptyTitle: {
    fontSize: wScale(18),
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: hScale(6),
  },
  emptySub: {
    fontSize: wScale(13),
    color: "#64748b",
    textAlign: "center",
    marginBottom: hScale(22),
    lineHeight: hScale(20),
  },
  emptyBtn: {
    width: "100%",
    paddingVertical: hScale(13),
    borderRadius: wScale(10),
    alignItems: "center",
  },
  emptyBtnText: { color: "#fff", fontSize: wScale(15), fontWeight: "600" },

  // ── Loader ────────────────────────────────────────────────────────────────
  loader: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
});

export default Profile;