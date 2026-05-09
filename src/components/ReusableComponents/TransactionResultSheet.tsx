import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  ImageBackground,
  ToastAndroid,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import ViewShot, { captureRef } from "react-native-view-shot";
import { hScale, wScale } from "../../utils/styles/dimensions";
import { useSelector } from "react-redux";
import { RootState } from "../../reduxUtils/store";
import { commonStyles } from "../../utils/styles/commonStyles";
import { shareSlipImage } from "../../utils/shareSlipImage ";
import ShareGoback from "../ShareGoback";
import { useNavigation } from "../../utils/navigation/NavigationService";
import { getImageSource2 } from "../../utils/network/NetWorkImages";


type Row = {
  label: string;
  value?: string | number;
};

type Props = {
  visible: boolean;
  status: "success" | "pending" | "failed";
  amount: string | number;
  rows: Row[];
  onGoBack: () => void;
};

const TransactionResultSheet = ({
  visible,
  status,
  amount,
  rows,
  
  
onGoBack
}: Props) => {
  const capRef = useRef<any>(null);
  const { colorConfig, } = useSelector((state: RootState) => state.userInfo);
  const navigation = useNavigation();
  const normalizedStatus = (status || "").toLowerCase();

  const color =
    normalizedStatus === "pending"
      ? "#fa9507"
      : normalizedStatus === "failed"
        ? "red"
        : normalizedStatus === "success"
          ? "#4CAF50"
          : "#F7CB6C";

  const onShare = async () => {
    shareSlipImage(capRef)
  }
  const onHome = async () => {
    navigation.navigate('DashboardScreen');

  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={commonStyles.screenContainer} >

        <ScrollView style={[styles.container,
        { backgroundColor: `${colorConfig.secondaryColor}0D` }
        ]}>
          <ViewShot
            ref={capRef}
            options={{ fileName: "TransactionReciept", format: "jpg", quality: 0.9 }}
          >
            <View style={styles.imgView}>
              <View style={[styles.emptyView, { backgroundColor: color }]} />
              <View style={[styles.emptyView2, { backgroundColor: color }]} />


              <ImageBackground
                source={getImageSource2("HeaderBg.png")}
                style={styles.imgstyle}
              >
                <View style={styles.greenTop}>
                  {status === "pending" ? (
                    <FontAwesome6 name="clock" size={70} color="#fff" />
                  ) : status === "failed" ? (
                    <Entypo name="circle-with-cross" size={80} color="#fff" />
                  ) : (
                    <Ionicons
                      name="checkmark-done-circle-sharp"
                      size={80}
                      color="#fff"
                    />
                  )}
                </View>
              </ImageBackground>
            </View>

            <Text style={styles.amount}>₹ {amount}</Text>

            <View style={styles.card}>
              <Text style={[styles.labelTital, { color, borderColor: color }]}>
                {status.toUpperCase()}
              </Text>

              {rows.map((row, index) => (
                <View
                  key={index}
                  style={[
                    styles.rowView,
                    index === rows.length - 1 && styles.noBorder,
                    { borderColor: color },
                  ]}
                >
                  <Text style={styles.label}>{row.label}</Text>
                  <Text style={styles.value}>{row.value ?? "--"}</Text>
                </View>
              ))}
            </View>
          </ViewShot>

          <View style={styles.footer}>
            <ShareGoback
              onShare={onShare}
              goBackTitle="OK"
              onGoBack={onGoBack}
              onHome={onHome}
              goBackIcon={null}
            />
          </View>
        </ScrollView>
      </View>

    </Modal>
  );
};

export default TransactionResultSheet;
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  greenTop: { alignItems: "center", paddingTop: hScale(6), flex: 1 },
  amount: {
    fontSize: wScale(42),
    fontWeight: "bold",
    color: "#000",
    borderRadius: wScale(30),
    textAlign: "center",
    width: "50%",
    alignSelf: "center",
    marginTop: hScale(-35),
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: wScale(15),
    marginHorizontal: wScale(15),
    marginTop: hScale(10),
    paddingTop: hScale(20),
    marginBottom: hScale(15),
    elevation: 2,
  },
  labelTital: {
    fontSize: wScale(33),
    fontWeight: "bold",
    textAlign: "center",
    borderBottomWidth: wScale(2),
    marginBottom: hScale(10),
    paddingBottom: hScale(5),
  },
  label: { fontSize: wScale(13) },
  value: { fontSize: wScale(16), marginTop: hScale(4), fontWeight: "bold" },
  rowView: {
    borderBottomWidth: wScale(1),
    borderStyle: "dashed",
    marginBottom: hScale(10),
    paddingBottom: hScale(10),
    marginHorizontal: wScale(20),
  },
  noBorder: { borderBottomWidth: 0 },
  imgView: { height: hScale(200) },
  emptyView: { height: hScale(100) },
  emptyView2: {
    height: hScale(40),
    alignSelf: "center",
    width: "71%",
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
  },
  imgstyle: {
    height: "100%",
    width: "100%",
    marginTop: hScale(-99),
    zIndex: 9,
  },
  footer: { marginHorizontal: wScale(15), marginTop: hScale(5) }
});
