import React from "react";

import { WebView } from "react-native-webview";
import { APP_URLS } from "../../utils/network/urls";

const Privacy = () => {
  return (
    <WebView
      source={{ uri: `https://${APP_URLS.baseWebUrl}/Home/privacy` }}
      style={{ flex: 1 }}
    />
  );
};

export default Privacy;
