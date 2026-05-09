import { translate } from "../utils/languageUtils/I18n";
import React, { useEffect, useState } from "react";
import { 
  Image, 
  View, 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Modal,
  SafeAreaView 
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../reduxUtils/store";
import { SCREEN_HEIGHT, hScale, wScale } from "../utils/styles/dimensions";
import NoDatafound from "../features/drawer/svgimgcomponents/Nodatafound";
import LottieView from "lottie-react-native";

const ImageBottomSheet = ({
  imagePath,
  isModalVisible,
  setModalVisible,
  modalTitle,
  setImagePath,
  isUri,
  ReUpload
}: {
  imagePath: string;
  isModalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  modalTitle: string;
  setImagePath: React.Dispatch<React.SetStateAction<string>>;
  isUri: boolean;
  ReUpload: any;
}) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}20`;
  const [isloading, setIsLoading] = useState(true);

  useEffect(() => {
    if (imagePath) {
      setIsLoading(false);
    }
  }, [imagePath]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isModalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* --- Header Section --- */}
          <View style={[styles.topheader, { backgroundColor: color1 }]}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.doneTouch}>
              <Text style={styles.donestyle}>{translate("Done")}</Text>
            </TouchableOpacity>
            
            <Text style={styles.headerText} numberOfLines={1}>{modalTitle}</Text>
            
            <View style={styles.rightIcon}>
                {isUri && (
                <TouchableOpacity onPress={ReUpload}>
                    <LottieView
                    autoPlay={true}
                    loop={true}
                    style={styles.lotiimg}
                    source={require('../utils/lottieIcons/upload-file.json')}
                    />
                </TouchableOpacity>
                )}
            </View>
          </View>

          {/* --- Image Section (Flex 1 use kiya hai gap hatane ke liye) --- */}
          <View style={styles.imageContainer}>
            {isloading ? (
              <ActivityIndicator size={"large"} color={colorConfig.secondaryColor} />
            ) : imagePath ? (
              <Image
                source={{ uri: imagePath }}
                onError={() => setImagePath('')}
                style={styles.fullImage}
                resizeMode="contain" // "contain" image ko cut hone se bachayega
              />
            ) : (
              <NoDatafound />
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    height:'100%',
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: 'rgba(0, 0, 0, 0.7)', 
  },
  modalView: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: SCREEN_HEIGHT / 1.2,
    width: '100%',
    overflow: 'hidden'
  },
  topheader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wScale(15),
    height: hScale(55),
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd'
  },
  doneTouch: {
    width: wScale(60),
  },
  donestyle: {
    fontSize: wScale(16),
    color: '#000',
    fontWeight: '500'
  },
  headerText: {
    fontSize: wScale(17),
    color: '#000',
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  rightIcon: {
    width: wScale(60),
    alignItems: 'flex-end'
  },
  imageContainer: {
    flex: 1, // Yeh poori space cover karega
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '95%', // Thodi si padding sides mein di hai
    height: '100%',
  },
  lotiimg: {
    height: hScale(40),
    width: wScale(40),
  },
});

export default ImageBottomSheet;
