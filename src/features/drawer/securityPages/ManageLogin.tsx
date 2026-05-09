import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Modal,
  Text,
  TouchableOpacity,
} from "react-native";
import AppBarSecond from "../headerAppbar/AppBarSecond";
import { SvgXml } from "react-native-svg";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import { useSelector } from "react-redux";
import { RootState } from "../../../reduxUtils/store";
import DynamicSecurityPages from "./DynamicComponet";
import {
  Dialog,
  ALERT_TYPE,
  AlertNotificationRoot,
} from "react-native-alert-notification";
import DynamicOtp from "../Otp/DynamicOtp";
import DynamicButton from "../button/DynamicButton";
import ClosseModalSvg from "../svgimgcomponents/ClosseModal";
import useAxiosHook from "../../../utils/network/AxiosClient";
import { APP_URLS } from "../../../utils/network/urls";
import { translate } from "../../../utils/languageUtils/I18n";
const topsvgimg = `
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 50 50" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><rect width="50" height="50" rx="10" ry="10" fill="#e5e5e5" shape="rounded"></rect><g transform="matrix(0.9500000000000002,0,0,0.9500000000000002,1.2500002622604356,1.2499986588954926)"><path fill="#d4d6d6" d="M35.299 40.086c0 .096-.067.193-.202.27l-11.242 6.496a1.06 1.06 0 0 1-.933 0l-2.185-1.28c-.135-.067-.193-.163-.193-.26l-.01-.798c0 .096.068.192.193.27l2.195 1.27c.26.154.673.154.933 0l11.242-6.487c.135-.077.192-.173.192-.27z" opacity="1" data-original="#d4d6d6"></path><path fill="#ecf0f1" d="M20.733 44.246c-.259.149-.26.39-.004.539l2.192 1.274c.257.149.673.149.931 0l11.246-6.493c.258-.149.26-.39.003-.54l-2.192-1.273a1.025 1.025 0 0 0-.931 0z" opacity="1" data-original="#ecf0f1"></path><path fill="#c6c6c6" d="m25.768 43.624-.862-.5-.025-7.576.861.5z" opacity="1" data-original="#c6c6c6"></path><path fill="#d4d6d6" d="m29.798 33.707.025 7.576-4.055 2.341-.026-7.575z" opacity="1" data-original="#d4d6d6"></path><path fill="#5b5e71" d="M42.766 2.64c-.319-.18-.866-.16-1.374.149L11.076 20.282c-1.016.587-1.862 2.031-1.862 3.206l.07 22.103v2.11c.02.588.218.996.547 1.185l-.548-.319L7.285 47.4c-.349-.21-.548-.627-.548-1.205l-.01-2.1-.05-22.123c0-1.165.837-2.599 1.842-3.196L38.876 1.253c.517-.289.985-.328 1.314-.13z" opacity="1" data-original="#5b5e71" class=""></path><path fill="#3f434f" d="M43.317 25.925 9.285 45.59l-.066-22.103c0-1.17.837-2.605 1.86-3.204L41.436 2.767c1.024-.598 1.86-.12 1.86 1.05z" opacity="1" data-original="#3f434f" class=""></path><path fill="#ffffff" d="m42.101 24.907-31.61 18.265-.059-19.686c0-.73.606-1.779 1.265-2.157L40.76 4.56a.878.878 0 0 1 1.316.759z" opacity="1" data-original="#ffffff" class=""></path><path fill="#e0e2e2" d="m43.317 25.925.006 2.108c.003 1.18-.825 2.614-1.851 3.206L11.155 48.743c-1.032.596-1.866.12-1.87-1.059l-.005-2.108z" opacity="1" data-original="#e0e2e2"></path><path fill="#c6c6c6" d="M27.82 36.978c0 .544-.375 1.178-.84 1.445-.454.268-.838.054-.838-.473 0-.544.366-1.186.839-1.462.464-.25.838-.036.838.49z" opacity="1" data-original="#c6c6c6"></path><path fill="#5b5e71" d="M22.216 29.596c.266.033.595.008.904-.037-.303.419-1.422 1.982-1.72 2.7-.346.83-.828 1.627-1.086 1.776-.252.136-.31.17-.386-.039-.081-.205-.232-.46-.488-.478-.252-.017-.622-.123-.457-.62.154-.46.823-1.115 1.008-1.222a.117.117 0 0 1 .033-.014c.108-.012.18-.089.278-.062a.488.488 0 0 0 .35-.062.73.73 0 0 0 .182-.153c.108-.126.777-.996 1.382-1.789zM32.342 12.603c.255-.138.313-.171.391.036.082.202.23.461.485.476.25.022.625.124.46.622-.152.455-.815 1.105-1.006 1.215a.114.114 0 0 1-.037.016c-.109.018-.178.093-.278.065a.518.518 0 0 0-.356.066.706.706 0 0 0-.174.144c-.058.065-.267.335-.54.69a2.81 2.81 0 0 0-.52-.66c.21-.344.395-.661.488-.893.347-.83.831-1.63 1.087-1.777zM30.376 24.832c.623.097 1.345.2 1.46.202a.384.384 0 0 0 .182-.058c.145-.084.276-.24.347-.34.1-.14.169-.146.277-.26a.171.171 0 0 1 .033-.023c.185-.107.858-.227 1.014.054.168.306-.203.839-.452 1.145-.258.315-.404.74-.483 1.039-.077.297-.136.33-.388.485-.255.148-.743-.09-1.09-.52-.351-.428-1.735-.706-1.808-.72l-.003-.063c.302-.32.632-.664.911-.94zM20.165 19.633c.258-.149.743.09 1.093.518.106.13.31.248.55.349-.193.41-.361.828-.501 1.246a12.054 12.054 0 0 0-.609-.078.398.398 0 0 0-.176.058 1.322 1.322 0 0 0-.356.345c-.097.142-.169.149-.277.256a.18.18 0 0 1-.038.028c-.192.11-.852.225-1.006-.054-.168-.305.203-.838.452-1.148.255-.31.404-.74.483-1.036.074-.295.135-.33.385-.484z" opacity="1" data-original="#5b5e71" class=""></path><path fill="#e74c3c" d="M29.272 27.254c.015.134.3 2.678-2.38 4.732-.188.144-.378.27-.568.38-.19.11-.38.202-.567.275-2.68 1.04-2.414-1.821-2.4-1.972.29.248.62.37.951.418.612.086 1.312-.099 2.011-.503.7-.404 1.399-1.026 2.008-1.817.332-.431.658-.932.945-1.513z" opacity="1" data-original="#e74c3c"></path><path fill="#e74c3c" d="M30.626 22.57c.002 0 .706 1.337.008 2.005-.7.673-2.019 2.104-2.088 2.18l.003.952-.685.625-.195-.21-.057.454-1.211.866-.065-.295-.08.378-1.073.489-.001-.456-.224.56-.84.132-.003-.902c-.024.006-.469.134-.995.211-.309.045-.638.07-.904.037-.35-.044-.592-.19-.536-.525.173-1.025.229-1.594.232-1.624-.68-.607-1.088-1.6-1.092-2.935-.002-.885.172-1.828.487-2.766.14-.418.308-.835.5-1.246.99-2.113 2.63-4.068 4.49-5.141 1.837-1.06 3.468-1.019 4.47-.087.2.186.374.406.52.66.333.578.52 1.33.523 2.235.004 1.405-.441 2.952-1.184 4.402zm-1.91.702c.796-.46 1.439-1.273 1.437-1.822-.002-.55-.647-.982-1.443-.523-.796.46-1.437 1.634-1.435 2.185.001.548.646.62 1.442.16m-4.784 2.762c.793-.458 1.435-1.272 1.434-1.82-.002-.551-.648-.983-1.44-.525-.797.46-1.438 1.634-1.436 2.185.001.548.646.62 1.442.16m3.16-.193c.272-1.077-.718-2.23-.77-2.291-.052.12-1.038 2.415-.763 3.176.01-.024.218-.483.77-.834.549-.285.753-.063.763-.051" opacity="1" data-original="#e74c3c"></path></g></svg>
`;
const ManageLogin = () => {
  const help = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="80" height="90" x="0" y="0" viewBox="0 0 32 32" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><g data-name="Layer 2"><path d="M23.917 13.75v3.493a1.751 1.751 0 0 0 1.746 1.75 1.779 1.779 0 0 0 .398-.045l1.558-.36a2.737 2.737 0 0 0 2.131-2.679v-1.818a2.737 2.737 0 0 0-2.13-2.68l-1.56-.36a1.766 1.766 0 0 0-.791.002 9.406 9.406 0 0 0-18.538 0 1.76 1.76 0 0 0-.792-.001l-1.558.36A2.737 2.737 0 0 0 2.25 14.09v1.818a2.737 2.737 0 0 0 2.13 2.68l1.56.36a1.785 1.785 0 0 0 .397.045 1.751 1.751 0 0 0 1.746-1.75v-4.578a7.917 7.917 0 0 1 15.834 0zM18.5 25.5a2.253 2.253 0 0 0-2.25-2.25c-.06 0-.115.013-.173.018a.713.713 0 0 0-.2-.008 7.826 7.826 0 0 1-5.47-1.027 7.098 7.098 0 0 1-1.81-1.686.75.75 0 1 0-1.195.906 8.556 8.556 0 0 0 2.192 2.041 8.813 8.813 0 0 0 4.508 1.373A2.213 2.213 0 0 0 14 25.5a2.25 2.25 0 0 0 4.5 0z" fill="#000" opacity="1" data-original="#000000" class=""></path><path d="M22.68 13.024a6.751 6.751 0 0 0-13.418 1.38 6.845 6.845 0 0 0 6.91 6.346H21.1a1.05 1.05 0 0 0 .63-1.89l-.617-.463a6.767 6.767 0 0 0 1.568-5.373zM13.5 14.75a.75.75 0 1 1 .75-.75.75.75 0 0 1-.75.75zm2.5 0a.75.75 0 1 1 .75-.75.75.75 0 0 1-.75.75zm2.5 0a.75.75 0 1 1 .75-.75.75.75 0 0 1-.75.75z" fill="#000" opacity="1" data-original="#000000" class=""></path></g></g></svg>`;
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.primaryColor}10`;
  const color2 = `${colorConfig.secondaryColor}10`;
  const [appLoginEnabled, setAppLoginEnabled] = useState(false);
  const [webLoginEnabled, setWebLoginEnabled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { post } = useAxiosHook();

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await post({ url: APP_URLS.checkLoginPlatform });
      if (res?.SecurityInform) {
        setAppLoginEnabled(res.SecurityInform.apploginsts === "Y");
        setWebLoginEnabled(res.SecurityInform.webloginsts === "Y");
      }
    };
    fetchStatus();
  }, []);
  const BtnPress = () => {
    Dialog.show({
      type: ALERT_TYPE.WARNING,
      title: translate("Are You Sure !"),
      textBody: translate("Want To block This Device"),
      button: translate("OK"),
      onPressButton: () => {
        Dialog.hide();
      },
    });
  };
  const BtnPress2 = () => {
    Dialog.show({
      type: ALERT_TYPE.WARNING,
      title: translate("Are You Sure !"),
      textBody: translate("Want To Unblock This Device"),
      button: translate("OK"),
      onPressButton: () => {
        Dialog.hide();
      },
    });
  };
  const Btnpress3 = () => {
    Dialog.show({
      type: ALERT_TYPE.SUCCESS,
      title: translate("SUCCESS"),
      textBody: translate("Your State Update Successfully."),
      button: translate("OK"),
      onPressButton: () => {
        Dialog.hide();
        setShowModal(false);
      },
    });
  };
  const handleToggleModal = () => {
    setShowModal(!showModal);
  };
  return (
    <View style={styles.main}>
      <AppBarSecond title="Manage Login Devices" />

      <ScrollView>
        <AlertNotificationRoot></AlertNotificationRoot>
        <View style={styles.container}>
          <DynamicSecurityPages
            mobilestyle={{ backgroundColor: color1 }}
            hedingstyle={[
              { borderColor: colorConfig.primaryColor },
              styles.heding,
            ]}
            topsvgimg={topsvgimg}
            title="Mobile Application (APP)"
            content="Mobile description"
            secondtitle="Live Status is"
            selectedtext={appLoginEnabled ? "ON" : "OFF"}
            selecttexcolor={{
              fontWeight: "bold",
              color: appLoginEnabled ? "green" : "red",
            }}
            buttonText="Yes I Need High Security "
            buttonstyle={[
              styles.button,
              { backgroundColor: colorConfig.primaryColor },
            ]}
            buttontextstyle={styles.btntext}
            buttonText="Go to Block"
            onPressBtn={() => setShowModal(true)}
          />

          <Modal transparent={true} animationType="fade" visible={showModal}>
            <View style={styles.modalcenter}>
              <View
                style={[
                  styles.modalView,
                  {
                    borderTopColor: colorConfig.primaryColor,
                    borderLeftColor: colorConfig.primaryColor,
                    borderRightColor: colorConfig.secondaryColor,
                    borderBottomColor: colorConfig.secondaryColor,
                  },
                ]}
              >
                <View style={styles.cutborder}>
                  <TouchableOpacity
                    onPress={() => setShowModal(false)}
                    activeOpacity={0.7}
                    style={[styles.closebuttoX]}
                  >
                    <ClosseModalSvg />
                  </TouchableOpacity>
                </View>
                <DynamicOtp />
                <View style={styles.dynamicbtnviw}>
                  <DynamicButton
                    title="Submit OTP"
                    onPress={() => {
                      Btnpress3();
                    }}
                    styleoveride={undefined}
                  />
                </View>
              </View>
            </View>
          </Modal>

          <DynamicSecurityPages
            mobilestyle={{ backgroundColor: color2 }}
            hedingstyle={[
              { borderColor: colorConfig.secondaryColor },
              styles.heding,
            ]}
            topsvgimg={help}
            title="Website Login (Web)"
            content="Website description"
            secondtitle="Live Status is"
            selectedtext={webLoginEnabled ? "ON" : "OFF"}
            buttonText={webLoginEnabled ? "Go to Block" : "Go to Unblock"}
            selecttexcolor={{
              color: webLoginEnabled ? "green" : "red",
              fontWeight: "bold",
            }}
            buttonstyle={[
              styles.button,
              { backgroundColor: colorConfig.secondaryColor },
            ]}
            buttontextstyle={styles.btntext}
            buttonText="Go to Unblock"
            onPressBtn={() => setShowModal(true)}
          />
        </View>
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  main: {
    flex: 1,
  },
  container: {
    marginHorizontal: wScale(20),
    flex: 1,
  },
  heding: {
    borderTopWidth: wScale(6),
    color: "#000",
    paddingBottom: 0,
    marginBottom: wScale(-6),
  },
  button: {
    borderWidth: 0,
    alignItems: "center",
    justifyContent: "center",
  },

  btntext: {
    color: "#fff",
    textAlign: "center",
  },
  modalView: {
    borderRadius: wScale(10),
    marginHorizontal: wScale(20),
    backgroundColor: "#fff",
    borderWidth: wScale(0.8),
    paddingBottom: hScale(20),
  },
  cutborder: {
    position: "absolute",
    right: wScale(-12),
    top: wScale(-12),
    borderRadius: wScale(24),
    paddingRight: wScale(3.2),
    zIndex: 30,
  },
  closebuttoX: {
    borderRadius: wScale(60),
    paddingVertical: wScale(5),
    alignItems: "center",
    height: wScale(52),
    width: wScale(52),
    justifyContent: "center",
  },
  closetextx: {
    fontSize: wScale(29),
    color: "white",
  },
  dynamicbtnviw: {
    paddingHorizontal: wScale(15),
    paddingTop: hScale(10),
  },
  modalcenter: {
    justifyContent: "center",
    height: "100%",
    backgroundColor: "rgba(0,0,0,.6)",
  },
});
export default ManageLogin;
