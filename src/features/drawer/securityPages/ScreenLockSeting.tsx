import React, { useCallback, useEffect, useState } from "react";
import { NativeModules, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from "react-native";
import AppBarSecond from "../headerAppbar/AppBarSecond";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import DynamicButton from "../button/DynamicButton";
import { RootState } from "../../../reduxUtils/store";
import { useSelector } from "react-redux";
import DynamicSecurityPages from "./DynamicComponet";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";
import { useDispatch } from "react-redux";
import { setFingerprintStatus, setUnlocked } from "../../../reduxUtils/store/userInfoSlice";
import { translate } from "../../../utils/languageUtils/I18n";

const texts = [
  { text: "ScreenLock.Device Lock ON", color: "green" },
  { text: "ScreenLock.Device Lock OFF", color: "red" },
];

const help = `
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 128 128" style="enable-background:new 0 0 512 512" xml:space="preserve"><g><path d="M78 50.5c0-7.7-6.3-14-14-14s-14 6.3-14 14v9h-1c-2.8 0-5 2.2-5 5v7c0 11 9 20 20 20s20-9 20-20v-7c0-2.8-2.2-5-5-5h-1.1c0-.2.1-.3.1-.5zM67 76c0 1.7-1.3 3-3 3s-3-1.3-3-3v-4.8c0-1.7 1.3-3 3-3s3 1.3 3 3zM56 59.5v-9c0-4.4 3.6-8 8-8s8 3.6 8 8V59c0 .2 0 .3.1.5z" fill="#2b2a2a" opacity="1" data-original="#000000"></path><path d="M64 1C47.2 1 31.4 7.6 19.5 19.5c-1.2 1.2-1.2 3.1 0 4.2 1.2 1.2 3.1 1.2 4.2 0C34.5 12.9 48.8 7 64 7c31.4 0 57 25.6 57 57s-25.6 57-57 57c-16 0-30.8-6.5-41.6-18H34c1.7 0 3-1.3 3-3s-1.3-3-3-3H16c-1.7 0-3 1.3-3 3v18c0 1.7 1.3 3 3 3s3-1.3 3-3v-9.9C30.8 120.2 46.8 127 64 127c34.7 0 63-28.3 63-63S98.7 1 64 1zM4.4 71.4c-1.6.3-2.7 1.8-2.4 3.5.6 3.4 1.5 6.9 2.7 10.2.4 1.2 1.6 2 2.8 2 .3 0 .7-.1 1-.2 1.6-.6 2.4-2.3 1.8-3.8-1.1-3-1.9-6.1-2.4-9.2-.3-1.7-1.9-2.8-3.5-2.5zM11.5 34.8c-1.5-.7-3.3-.1-4 1.4-2.9 6-4.9 12.3-5.8 18.9-.2 1.6.9 3.2 2.5 3.4h.4c1.5 0 2.8-1.1 3-2.6.8-6 2.6-11.7 5.3-17.1.7-1.5.1-3.3-1.4-4z" fill="#2b2a2a" opacity="1" data-original="#000000"></path></g></svg>
`;
const topsvgimg = `
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 64 64" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><rect width="64" height="64" rx="12.8" ry="12.8" fill="#e5e5e5" shape="rounded"></rect><g transform="matrix(1.0200000000000005,0,0,1.0200000000000005,-0.6400000000000148,-0.6500000000000057)"><linearGradient id="a" x1="33" x2="57" y1="43.23" y2="43.23" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0c408d"></stop><stop offset="1" stop-color="#015bbb"></stop></linearGradient><linearGradient id="b" x1="7" x2="40" y1="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#015bbb"></stop><stop offset="1" stop-color="#02aff8"></stop></linearGradient><linearGradient id="c" x1="11" x2="36" y1="32.5" y2="32.5" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#02aff8"></stop><stop offset="1" stop-color="#02dbf8"></stop></linearGradient><g data-name="personal device"><path fill="url(#a)" d="M57 31.42v8.86A19.2 19.2 0 0 1 45 58a19.3 19.3 0 0 1-4.74-2.78c-.22-.17-.43-.35-.64-.54A18.55 18.55 0 0 1 36 50.49a17.39 17.39 0 0 1-1.17-2.11A18.72 18.72 0 0 1 33 41.17v-9.75l3-.74 4-1 4.08-1 .92-.23 3.47.85.22.06z" opacity="1" data-original="url(#a)"></path><path fill="url(#b)" d="M33 31.42v9.74a18.72 18.72 0 0 0 1.81 7.21A17.39 17.39 0 0 0 36 50.49a18.55 18.55 0 0 0 3.62 4.19A4 4 0 0 1 36 57H11a4 4 0 0 1-4-4V11a4 4 0 0 1 4-4h25a4 4 0 0 1 4 4v18.7l-4 1z" opacity="1" data-original="url(#b)" class=""></path><circle cx="17" cy="10" r="1" fill="#015bbb" opacity="1" data-original="#015bbb"></circle><path fill="#015bbb" d="M31 11h-9a1 1 0 0 1 0-2h9a1 1 0 0 1 0 2z" opacity="1" data-original="#015bbb"></path><path fill="url(#c)" d="M33 31.42v9.74a18.72 18.72 0 0 0 1.81 7.21A17.39 17.39 0 0 0 36 50.49V52H11V13h25v17.68z" opacity="1" data-original="url(#c)" class=""></path><g fill="#fff"><circle cx="23.5" cy="22" r="4" fill="#ffffff" opacity="1" data-original="#ffffff" class=""></circle><path d="M23.5 26a6.5 6.5 0 0 1 6.5 6.5V35H17v-2.5a6.5 6.5 0 0 1 6.5-6.5zM30 42H17a1 1 0 0 1 0-2h13a1 1 0 0 1 0 2zM30 47H17a1 1 0 0 1 0-2h13a1 1 0 0 1 0 2z" fill="#ffffff" opacity="1" data-original="#ffffff" class=""></path><rect width="14" height="11" x="38" y="39" rx="3" fill="#ffffff" opacity="1" data-original="#ffffff" class=""></rect><path d="M49 41h-8a1 1 0 0 1-1-1v-1a5 5 0 0 1 10 0v1a1 1 0 0 1-1 1zm-7-2h6a3 3 0 0 0-6 0z" fill="#ffffff" opacity="1" data-original="#ffffff" class=""></path></g><path fill="#015bbb" d="M45 46a1 1 0 0 1-1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1-1 1z" opacity="1" data-original="#015bbb"></path></g></g></svg>
`;

const ScreenLock = () => {
  const { SecurityModule } = NativeModules;
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}10`;
  const [isLockEnabled, setIsLockEnabled] = useState(false);
  const { isFingerprintEnabled } = useSelector(
    (state: RootState) => state.userInfo,
  );

  const dispatch = useDispatch();
  const [text, setText] = useState(translate("ScreenLock.Select Mode"));
  const [textColor, setTextColor] = useState("#000"); // Setting default text color to black
  const [clickCount, setClickCount] = useState(0);

  // ✅ Sync with redux whenever redux changes
  useEffect(() => {
    setIsLockEnabled(isFingerprintEnabled);
  }, [isFingerprintEnabled]);
useEffect(() => {
    if (isLockEnabled) {
      setText("ScreenLock.Device Lock ON");
      setTextColor("green");
    } else {
      setText("ScreenLock.Device Lock OFF");
      setTextColor("red");
    }
  }, [isLockEnabled]);

useEffect(()=>{

  const checkStatus = async () => {
  try {
    const status = await SecurityModule.checkDeviceSecurity();
    if (status === "SECURE") {
      ToastAndroid.show("Dscreen lock available.",ToastAndroid.BOTTOM);
    } else {
            ToastAndroid.show("No screen lock available.",ToastAndroid.BOTTOM);

      console.log("Device par koi lock nahi laga hai.");
    }
  } catch (error) {
    console.error(error);
  }
};
checkStatus()
//unlockApp()
},[isLockEnabled])



const unlockApp = async () => {
  try {
    const isUnlocked = await SecurityModule.showScreenLock();
    if (isUnlocked) {
      // Yahan apna payment ya wallet logic likhein
      console.log("User ne sahi PIN/Pattern dala. Access Granted!");
    } else {
      console.log("User ne galat dala ya cancel kar diya.");
    }
  } catch (error) {
    if (error.code === "NO_LOCK") {
      alert("Please set a screen lock in your phone settings first.");
    } else {
      console.error(error.message);
    }
  }
};
  console.log(isLockEnabled)
   // ✅ Safe toggle (no stale state)
  const handlePress = () => {
    setIsLockEnabled(prev => !prev);
  };
  const setDeviceLock = useCallback(() => {
    dispatch(setFingerprintStatus(isLockEnabled));
if(isLockEnabled){
  dispatch(setUnlocked(false))
}
    Dialog.show({
      type: ALERT_TYPE.SUCCESS,
      title: translate("SUCCESS"),
      textBody: translate(
        "ScreenLock.Device Lock Setting Updated Successfully."
      ),
      button: translate("OK"),
      onPressButton: () => Dialog.hide(),
    });
  }, [dispatch, isLockEnabled]);
  return (
    <View>
      <AppBarSecond title={"ScreenLock.Screen Lock Setting"} />
      <View style={styles.container}>
        <DynamicSecurityPages
          mobilestyle={{ backgroundColor: color1 }}
          hedingstyle={{ backgroundColor: colorConfig.primaryColor }}
          topsvgimg={topsvgimg}
          title={"ScreenLock.Device Lock Authentication"}
          content={"ScreenLock.description"}
          secondtitle={"ScreenLock.Selective Active Mode "}
          selectedtext={text}
          selecttexcolor={{ color: textColor }}
          buttonText={text}
          buttontextstyle={{ color: textColor }}
          buttonImg={help}
          onPressImg={handlePress}
        />
        <DynamicButton
          title={"ScreenLock.Save Change"}
          onPress={setDeviceLock}
        />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: wScale(20),
  },
});
export default ScreenLock;
