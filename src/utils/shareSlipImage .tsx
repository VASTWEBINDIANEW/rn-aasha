import { captureRef } from "react-native-view-shot";
import Share from "react-native-share";
import { ToastAndroid, InteractionManager } from "react-native";
import { APP_URLS } from "./network/urls";
import { translate } from "./languageUtils/I18n";

export const shareSlipImage = async (viewRef: any) => {
  try {
    // ✅ Ensure UI is stable before capture
    await new Promise((resolve) =>
      InteractionManager.runAfterInteractions(resolve)
    );

    // ✅ Check ref safely
    if (!viewRef || !viewRef.current) {
      console.log("❌ ViewRef not available");
      return;
    }

    // ✅ Capture view
    const uri = await captureRef(viewRef.current, {
      format: "jpg",
      quality: 0.9,
      result: "tmpfile", // 🔥 important for Android stability
    });

    console.log("📸 Captured URI:", uri);

    // ✅ Share
    const res = await Share.open({
      message: `${translate("key_hiiams_47")} ${APP_URLS.AppName} App.`,
      url: uri,
      type: "image/jpeg",
      failOnCancel: false, // 🔥 MOST IMPORTANT (prevents crash)
    });

    console.log("✅ Share success:", res);

  } catch (error: any) {
    console.log("❌ SHARE ERROR:", error);

    ToastAndroid.show(
      "Transaction details not shared",
      ToastAndroid.SHORT
    );
  }
};