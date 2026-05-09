import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ScrollView } from "react-native";
import { SvgXml } from "react-native-svg";
import { useSelector } from "react-redux";
import { RootState } from "../../../reduxUtils/store";
import { wScale, hScale } from "../../../utils/styles/dimensions";
import AppBarSecond from "../headerAppbar/AppBarSecond";
import {
  ALERT_TYPE,
  AlertNotificationDialog,
  AlertNotificationRoot,
  Dialog,
} from "react-native-alert-notification";
import { translate } from "../../../utils/languageUtils/I18n";
const MobileDeviceReg = () => {
  const faqsimg =
    '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><rect width="512" height="512" rx="102.4" ry="102.4" fill="rgba(255,255,255,0)" shape="rounded"></rect><g transform="matrix(0.88,0,0,0.88,30.72,15.720000915527407)"><path d="M88.584 437.284v-10.936c11.216-6.368 18.792-18.392 18.792-32.208 0-20.456-16.584-37.048-37.048-37.048-20.456 0-37.048 16.584-37.048 37.048 0 13.816 7.576 25.84 18.792 32.208v10.936C17.552 438.892 0 462.236 0 477.932v12.888h140.656v-12.888c.008-15.696-17.544-39.04-52.072-40.648z" style="" fill="#999999" data-original="#999999" class=""></path><path d="M274.256 437.284v-10.936c11.216-6.368 18.792-18.392 18.792-32.208 0-20.456-16.584-37.048-37.048-37.048-20.456 0-37.048 16.584-37.048 37.048 0 13.816 7.576 25.84 18.792 32.208v10.936c-34.52 1.616-52.08 24.96-52.08 40.648v12.888h140.664v-12.888c0-15.696-17.552-39.04-52.072-40.648z" style="" fill="#cccccc" data-original="#cccccc" class=""></path><path d="M459.92 437.284v-10.936c11.216-6.368 18.792-18.392 18.792-32.208 0-20.456-16.584-37.048-37.048-37.048-20.456 0-37.048 16.584-37.048 37.048 0 13.816 7.576 25.84 18.792 32.208v10.936c-34.52 1.616-52.08 24.96-52.08 40.648v12.888H512v-12.888c0-15.696-17.552-39.04-52.08-40.648z" style="" fill="#dbdbdb" data-original="#dbdbdb" class=""></path><path d="M445.672 327.42h-8v-9.584h8v9.584zm0-21.584h-8v-12h8v12zm0-23.992h-8v-12h8v12zm0-24h-8v-12h8v12zm0-24h-8v-12h8v12zm0-24h-8v-12h8v12zm0-24h-8v-12h8v12zm-9.696-14.304h-12v-8h12v8zm-24 0h-12v-8h12v8zm-24 0h-12v-8h12v8zm-24 0h-12v-8h12v8zM73.296 327.42h-8v-9.584h8v9.584zm0-21.584h-8v-12h8v12zm0-23.992h-8v-12h8v12zm0-24h-8v-12h8v12zm0-24h-8v-12h8v12zm0-24h-8v-12h8v12zm0-24h-8v-12h8v12zm85.696-14.304h-12v-8h12v8zm-24 0h-12v-8h12v8zm-24 0h-12v-8h12v8zm-24 0h-12v-8h12v8z" style="" fill="#999999" data-original="#999999" class=""></path><path d="M261.936 21.18c-43.192 45.384-114.928 35.136-114.928 35.136v122.976c0 72.464 114.928 122.976 114.928 122.976s114.928-50.512 114.928-122.976V56.316S305.12 66.564 261.936 21.18z" style="" fill="#ff0000" data-original="#ff0000" class=""></path><path d="M261.936 61.636c-30.76 32.32-81.84 25.024-81.84 25.024v87.576c0 51.608 81.84 87.576 81.84 87.576s81.84-35.968 81.84-87.576V86.66s-51.088 7.296-81.84-25.024z" style="opacity:0.2;" fill="#000000" opacity="1" data-original="#000000"></path><g style="opacity:0.25;"><path d="M261.936 21.18c-43.192 45.384-114.928 35.136-114.928 35.136v92.52l229.848-72.592V56.316S305.12 66.564 261.936 21.18z" style="" fill="#ffffff" data-original="#ffffff"></path></g><path d="M292.504 155.492H282.6v-35.688c.112-11.408-9.048-20.752-20.456-20.864-11.408-.112-20.752 9.048-20.864 20.456V155.492h-9.904v-35.688c-.136-16.88 13.44-30.672 30.32-30.808s30.672 13.44 30.808 30.32v36.176z" style="" fill="#ffffff" data-original="#ffffff"></path><path d="M282.56 145.036h9.904v3.96h-9.904zM231.368 145.036h9.904v3.96h-9.904z" style="opacity:0.25;" fill="#000000" opacity="1" data-original="#000000"></path><path d="M222.208 149.004h79.464v50.456h-79.464zM217.6 199.46h88.64v16.512H217.6z" fill="#000000" opacity="1" data-original="#000000"></path><circle cx="261.936" cy="175.356" r="9.912" style="" fill="#ffffff" data-original="#ffffff"></circle><path d="M257.68 180.684h8.456v18.12h-8.456z" style="" fill="#ffffff" data-original="#ffffff"></path></g></svg>';
  const addDevice =
    '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="40" x="0" y="0" viewBox="0 0 24 24" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M12 1a11 11 0 1 0 11 11A11.013 11.013 0 0 0 12 1zm5 12h-4v4a1 1 0 0 1-2 0v-4H7a1 1 0 0 1 0-2h4V7a1 1 0 0 1 2 0v4h4a1 1 0 0 1 0 2z" data-name="Layer 2" fill="#ffffff" opacity="1" data-original="#000000" class=""></path></g></svg>';
  const deleteDevice =
    '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="40" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path fill="#ffffff" fill-rule="evenodd" d="M256 0C114.842 0 0 114.842 0 256s114.839 256 256 256 256-114.841 256-256S397.16 0 256 0zm-49.921 114.329a8.325 8.325 0 0 1 8.32-8.324h83.2a8.341 8.341 0 0 1 8.322 8.334v20.577h-99.842zm136.8 279.759A12.745 12.745 0 0 1 330.067 406h-149.1a12.873 12.873 0 0 1-12.807-11.963L155.407 207.4h201.081l-13.614 186.688zM376.02 190.5H135.98v-19.339a19.357 19.357 0 0 1 19.339-19.341l201.359-.006a19.365 19.365 0 0 1 19.338 19.348v19.336zM217.35 361.508V243a8.449 8.449 0 0 1 16.9.006v118.502a8.451 8.451 0 1 1-16.9 0zm60.292 0V243a8.451 8.451 0 0 1 16.9.006v118.507a8.452 8.452 0 1 1-16.9 0z" opacity="1" data-original="#fc0005" class=""></path></g></svg>';
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  const color1 = `${colorConfig.primaryColor}15`;
  const color2 = `${colorConfig.secondaryColor}15`;
  const BtnPress2 = () => {
    Dialog.show({
      type: ALERT_TYPE.DANGER,
      title: translate("Are You Sure !"),
      textBody: translate("Want To Delete This Device"),
      button: translate("OK"),
      onPressButton: () => {
        Dialog.hide();
      },
    });
  };
  const BtnPress = () => {
    Dialog.show({
      type: ALERT_TYPE.WARNING,
      title: translate("Are You Sure !"),
      textBody: translate("Want To Register This Device"),
      button: translate("OK"),
      onPressButton: () => {
        Dialog.hide();
      },
    });
  };
  const [registered, setRegistered] = useState(true);

  return (
    <View style={styles.main}>
      <View>
        <AppBarSecond title={"MobileDeviceReg.MobileDeviceReg"} />
      </View>
      <ScrollView>
        <View style={styles.bodymainView}>
          <View style={styles.topsvgimgstyle}>
            <SvgXml xml={faqsimg} width={wScale(140)} height={hScale(140)} />
          </View>
          <View>
            <Text style={styles.imgbottomtextStyle}>
              {translate("MobileDeviceReg.Note")}
            </Text>
          </View>

          <View>
            <View>
              <View
                style={[
                  styles.addDeviceflex,
                  { backgroundColor: colorConfig.primaryColor },
                ]}
              >
                <View>
                  <Text style={styles.deviceNAme}>
                    {translate("SAMSUNG Z 22")}
                  </Text>
                  <Text style={styles.unregisteredDevice}>
                    {translate("Unregistered Device")}
                  </Text>
                </View>

                <View>
                  <AlertNotificationRoot>
                    <TouchableOpacity onPress={BtnPress}>
                      <SvgXml xml={addDevice} />
                    </TouchableOpacity>
                  </AlertNotificationRoot>
                </View>
              </View>
              <View
                style={[
                  styles.topspace,
                  { backgroundColor: registered ? color1 : color2 },
                ]}
              >
                <Text
                  style={[
                    styles.devicedetails,
                    { color: colorConfig.primaryColor },
                  ]}
                >
                  {translate("Device ID : safsjn554fv564d6")}
                </Text>
                <Text
                  style={[
                    styles.devicedetails,
                    { color: colorConfig.primaryColor },
                  ]}
                >
                  {translate("Device Model : VM 2765S")}
                </Text>
                <Text
                  style={[
                    styles.devicedetails,
                    { color: colorConfig.primaryColor },
                  ]}
                >
                  {translate("Andriod Version : Android 10")}
                </Text>
                <Text
                  style={[
                    styles.devicedetails,
                    { color: colorConfig.primaryColor },
                  ]}
                >
                  {translate("Last Login Time : 10-04-2024 10:59 AM")}
                </Text>
                <Text
                  style={[
                    styles.loginAdderss,
                    { color: colorConfig.primaryColor },
                  ]}
                >
                  {translate(
                    "key_loginaddr_53",
                  )}
                </Text>
              </View>
            </View>

            <View style={styles.deleteRegisteredDevice}>
              <View
                style={[
                  styles.addDeviceflex,
                  {
                    backgroundColor: registered
                      ? colorConfig.secondaryColor
                      : colorConfig.primaryColor,
                  },
                ]}
              >
                <View>
                  <Text style={styles.deviceNAme}>
                    {translate("ONE PLUS H48")}
                  </Text>
                  <Text style={styles.registeredDevice}>
                    {translate("Registered Device")}
                  </Text>
                </View>
                <View>
                  <TouchableOpacity onPress={BtnPress2}>
                    <SvgXml xml={deleteDevice} />
                  </TouchableOpacity>
                </View>
              </View>
              <View
                style={[
                  styles.topspace,
                  { backgroundColor: registered ? color2 : color1 },
                ]}
              >
                <Text
                  style={[
                    styles.devicedetails,
                    {
                      color: registered
                        ? colorConfig.secondaryColor
                        : colorConfig.primaryColor,
                    },
                  ]}
                >
                  {translate("Device ID : safsjn554fv564d6")}
                </Text>
                <Text
                  style={[
                    styles.devicedetails,
                    {
                      color: registered
                        ? colorConfig.secondaryColor
                        : colorConfig.primaryColor,
                    },
                  ]}
                >
                  {translate("Device Model : VM 2765S")}
                </Text>
                <Text
                  style={[
                    styles.devicedetails,
                    {
                      color: registered
                        ? colorConfig.secondaryColor
                        : colorConfig.primaryColor,
                    },
                  ]}
                >
                  {translate("Andriod Version : Android 10")}
                </Text>
                <Text
                  style={[
                    styles.devicedetails,
                    {
                      color: registered
                        ? colorConfig.secondaryColor
                        : colorConfig.primaryColor,
                    },
                  ]}
                >
                  {translate("Last Login Time : 10-04-2024 10:59 AM")}
                </Text>
                <Text
                  style={[
                    styles.loginAdderss,
                    {
                      color: registered
                        ? colorConfig.secondaryColor
                        : colorConfig.primaryColor,
                    },
                  ]}
                >
                  {translate(
                    "key_loginaddr_53",
                  )}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  main: {
    width: "100%",
    height: "100%",
  },
  bodymainView: {
    marginHorizontal: wScale(20),
  },
  topsvgimgstyle: {
    alignItems: "center",
  },
  imgbottomtextStyle: {
    textAlign: "justify",
    color: "#000",
    marginBottom: wScale(18),
    fontSize: wScale(12),
  },
  addDeviceflex: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: hScale(5),
    paddingHorizontal: wScale(7),
  },
  deviceNAme: {
    color: "#fff",
    fontWeight: "700",
    fontSize: wScale(18),
  },
  unregisteredDevice: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: wScale(12),
  },
  registeredDevice: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: wScale(12),
  },

  topspace: {
    paddingHorizontal: wScale(10),
    paddingTop: hScale(10),
  },

  devicedetails: {
    borderBottomColor: "#fff",
    fontSize: wScale(13),
    borderBottomWidth: wScale(0.8),
    paddingVertical: hScale(4),
    marginBottom: hScale(3),
  },
  loginAdderss: {
    fontSize: wScale(13),
    paddingVertical: hScale(3),
    marginBottom: hScale(5),
  },
  deleteRegisteredDevice: {
    marginTop: hScale(15),
    marginBottom: hScale(10),
  },
});

export default MobileDeviceReg;
