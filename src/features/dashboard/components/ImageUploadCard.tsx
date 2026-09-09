// import React, { useState } from "react";
// import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
// import { launchCamera, launchImageLibrary } from "react-native-image-picker";
// import { hScale, wScale } from "../../../utils/styles/dimensions";
// import { translate } from "../../../utils/languageUtils/I18n";
// import { PermissionsAndroid, Platform } from "react-native";

// const ImageUploadCard = ({ label, imageUri, onImageSelected }) => {
//     const [loading, setLoading] = useState(false);

//     const handlePickImage = () => {
//         Alert.alert(translate("Select Image"), translate("Choose an option"), [
//             { text: translate("Camera"), onPress: () => openCamera() },
//             { text: translate("Gallery"), onPress: () => openGallery() },
//             { text: translate("Cancel"), style: "cancel" },
//         ]);
//     };

//     const requestCameraPermission = async () => {
//         if (Platform.OS === "android") {
//             const granted = await PermissionsAndroid.request(
//                 PermissionsAndroid.PERMISSIONS.CAMERA,
//                 {
//                     title: translate("Camera Permission"),
//                     message: translate("App needs camera access to capture photo"),
//                     buttonPositive: translate("OK"),
//                 }
//             );
//             return granted === PermissionsAndroid.RESULTS.GRANTED;
//         }
//         return true; // iOS Info.plist se handle hota hai
//     };

//     const openCamera = async () => {
//         const hasPermission = await requestCameraPermission();
//         if (!hasPermission) {
//             Alert.alert(translate("Permission Denied"), translate("Camera permission is required"));
//             return;
//         }
//         setLoading(true);
//         launchCamera({ mediaType: "photo", quality: 0.7, saveToPhotos: false }, (response) => {
//             setLoading(false);
//             handlePickerResponse(response);
//         });
//     };

//     const openGallery = () => {
//         setLoading(true);
//         launchImageLibrary({ mediaType: "photo", quality: 0.7 }, (response) => {
//             setLoading(false);
//             handlePickerResponse(response);
//         });
//     };

//     const handlePickerResponse = (response) => {
//         if (response.didCancel) return;
//         if (response.errorCode) {
//             Alert.alert(translate("Error"), response.errorMessage || translate("Something went wrong"));
//             return;
//         }
//         const asset = response.assets && response.assets[0];
//         if (asset && asset.uri) {
//             onImageSelected(asset.uri, asset);
//         }
//     };

//     return (
//         <View style={styles.container}>
//             <Text style={styles.label}>{label}</Text>
//             <TouchableOpacity style={styles.uploadBox} onPress={handlePickImage} disabled={loading}>
//                 {imageUri ? (
//                     <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
//                 ) : (
//                     <Text style={styles.placeholderText}>
//                         {loading ? translate("Loading...") : translate("Tap to upload image")}
//                     </Text>
//                 )}
//             </TouchableOpacity>
//         </View>
//     );
// };

// const styles = StyleSheet.create({
//     container: { marginVertical: hScale(10) },
//     label: { fontSize: hScale(14), fontWeight: "600", color: "#333", marginBottom: hScale(6) },
//     uploadBox: {
//         height: hScale(160),
//         width: "100%",
//         borderRadius: 10,
//         borderWidth: 1,
//         borderColor: "#ccc",
//         borderStyle: "dashed",
//         justifyContent: "center",
//         alignItems: "center",
//         backgroundColor: "#FAFAFA",
//         overflow: "hidden",
//     },
//     previewImage: { width: "100%", height: "100%" },
//     placeholderText: { color: "#888", fontSize: hScale(13) },
// });

// export default ImageUploadCard;


// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   Platform,
//   Linking,
// } from "react-native";
// import { launchCamera, launchImageLibrary, CameraOptions, ImagePickerResponse } from "react-native-image-picker";
// import { check, request, PERMISSIONS, RESULTS } from "react-native-permissions";
// import { hScale, wScale } from "../../../utils/styles/dimensions";
// import { translate } from "../../../utils/languageUtils/I18n";

// /**
//  * Props:
//  * - label: string
//  * - imageUri: string | null
//  * - onImageSelected: (uri: string, base64: string) => void
//  */
// const ImageUploadCard = ({ label, imageUri, onImageSelected }) => {
//   const [loading, setLoading] = useState(false);

//   // ---- Camera capture (jaisa dusri screen mein working hai) ----
//   const openCamera = () => {
//     const options: CameraOptions = {
//       mediaType: "photo",
//       includeBase64: true,
//       cameraType: "back", // Aadhar/PAN document ke liye back camera better hai
//       quality: 0.6,
//     };

//     setLoading(true);
//     launchCamera(options, (res: ImagePickerResponse) => {
//       setLoading(false);
//       if (res.didCancel) return;

//       if (res.errorCode) {
//         Alert.alert(translate("Camera Error"), res.errorMessage || "");
//         return;
//       }

//       const asset = res.assets?.[0];
//       if (!asset?.base64 || !asset?.uri) return;

//       onImageSelected(asset.uri, asset.base64);
//     });
//   };

//   // ---- Permission check/request — same pattern jo dusri screen mein kaam kar raha hai ----
//   const handleCameraPermission = async () => {
//     const permission =
//       Platform.OS === "ios" ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA;

//     const status = await check(permission);

//     if (status === RESULTS.GRANTED) {
//       openCamera();
//     } else if (status === RESULTS.DENIED) {
//       const result = await request(permission);
//       if (result === RESULTS.GRANTED) openCamera();
//     } else {
//       Alert.alert(translate("Permission Blocked"), translate("Please Allow Camera permission"), [
//         { text: translate("Cancel") },
//         { text: translate("Settings"), onPress: Linking.openSettings },
//       ]);
//     }
//   };

//   // ---- Gallery (permission ki zaroorat generally nahi hoti, but agar app crash kare to yahan bhi permission add kar sakte hain) ----
//   const openGallery = () => {
//     setLoading(true);
//     launchImageLibrary(
//       { mediaType: "photo", quality: 0.6, includeBase64: true },
//       (response) => {
//         setLoading(false);
//         if (response.didCancel) return;
//         if (response.errorCode) {
//           Alert.alert(translate("Error"), response.errorMessage || translate("Something went wrong"));
//           return;
//         }
//         const asset = response.assets?.[0];
//         if (asset?.uri && asset?.base64) {
//           onImageSelected(asset.uri, asset.base64);
//         }
//       },
//     );
//   };

//   const handlePickImage = () => {
//     Alert.alert(translate("Select Image"), translate("Choose an option"), [
//       { text: translate("Camera"), onPress: handleCameraPermission },
//       { text: translate("Gallery"), onPress: openGallery },
//       { text: translate("Cancel"), style: "cancel" },
//     ]);
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.label}>{label}</Text>
//       <TouchableOpacity style={styles.uploadBox} onPress={handlePickImage} disabled={loading}>
//         {imageUri ? (
//           <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
//         ) : (
//           <Text style={styles.placeholderText}>
//             {loading ? translate("Loading...") : translate("Tap to upload image")}
//           </Text>
//         )}
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: { marginVertical: hScale(10) },
//   label: { fontSize: hScale(14), fontWeight: "600", color: "#333", marginBottom: hScale(6) },
//   uploadBox: {
//     height: hScale(160),
//     width: "100%",
//     borderRadius: 10,
//     borderWidth: 1,
//     borderColor: "#ccc",
//     borderStyle: "dashed",
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#FAFAFA",
//     overflow: "hidden",
//   },
//   previewImage: { width: "100%", height: "100%" },
//   placeholderText: { color: "#888", fontSize: hScale(13) },
// });

// export default ImageUploadCard;




import React, { useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import { translate } from "../../../utils/languageUtils/I18n";

/**
 * Props:
 * - label: string
 * - imageUri: string | null
 * - onImageSelected: (uri: string, base64: string) => void
 */
const ImageUploadCard = ({ label, imageUri, onImageSelected }) => {
  const [loading, setLoading] = useState(false);

  const openGallery = () => {
    setLoading(true);
    launchImageLibrary(
      { mediaType: "photo", quality: 0.6, includeBase64: true },
      (response) => {
        setLoading(false);
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert(translate("Error"), response.errorMessage || translate("Something went wrong"));
          return;
        }
        const asset = response.assets?.[0];
        if (asset?.uri && asset?.base64) {
          onImageSelected(asset.uri, asset.base64);
        }
      },
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      <TouchableOpacity
        style={[styles.uploadBox, imageUri && styles.uploadBoxWithImage]}
        onPress={openGallery}
        disabled={loading}
        activeOpacity={0.8}
      >
        {imageUri ? (
          <>
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="contain" />
            <View style={styles.changeBadge}>
              <Text style={styles.changeBadgeText}>{translate("Change")}</Text>
            </View>
          </>
        ) : (
          <View style={styles.placeholderContent}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderText}>
              {loading ? translate("Loading...") : translate("Tap to select photo")}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: hScale(12),
  },
  label: {
    fontSize: hScale(14),
    fontWeight: "600",
    color: "#2E7D32",
    marginBottom: hScale(8),
  },
  uploadBox: {
    minHeight: hScale(180),
    width: "100%",
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#C8E6C9",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F8F2",
    overflow: "hidden",
    padding: wScale(8),
  },
  uploadBoxWithImage: {
    borderStyle: "solid",
    borderColor: "#2E7D32",
    backgroundColor: "#fff",
    padding: 0,
  },
  previewImage: {
    width: "100%",
    height: hScale(220),
  },
  changeBadge: {
    position: "absolute",
    bottom: hScale(8),
    right: wScale(8),
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: wScale(10),
    paddingVertical: hScale(4),
    borderRadius: 12,
  },
  changeBadgeText: {
    color: "#fff",
    fontSize: hScale(11),
    fontWeight: "600",
  },
  placeholderContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderIcon: {
    fontSize: hScale(32),
    marginBottom: hScale(6),
  },
  placeholderText: {
    color: "#7A8B7C",
    fontSize: hScale(13),
    fontWeight: "500",
  },
});

export default ImageUploadCard;