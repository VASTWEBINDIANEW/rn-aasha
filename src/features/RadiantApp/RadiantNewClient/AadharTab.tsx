import { translate } from "../../../utils/languageUtils/I18n";
import React from "react";
import { Image, View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { BottomSheet } from "@rneui/themed";
import { useSelector } from "react-redux";
import { TabView, SceneMap } from 'react-native-tab-view';
import { useWindowDimensions } from 'react-native';
import NoDatafound from "../../drawer/svgimgcomponents/Nodatafound";
import { hScale, SCREEN_HEIGHT, wScale } from "../../../utils/styles/dimensions";
import { RootState } from "../../../reduxUtils/store";

const FrontAadhar = ({ imagePath, setImagePath }) => (
  imagePath ? (
    <Image
      source={{ uri: imagePath }}
      onError={() => setImagePath('')}  // Clear the image path on error, could be enhanced
      style={styles.image}
      resizeMode="contain"
    />
  ) : (
    <NoDatafound />
  )
);

const BackAadhar = ({ imagePath2, setImagePath2 }) => (
  imagePath2 ? (
    <Image
      source={{ uri: imagePath2 }}
      onError={() => setImagePath2('')}  // Similar to FrontAadhar, clear on error
      style={styles.image}
      resizeMode="contain"
    />
  ) : (
    <NoDatafound />  // Fallback UI
  )
);

const AadharTab = ({
  imagePath,
  imagePath2,
  isModalVisible,
  setModalVisible,
  modalTitle,
  setImagePath,
  setImagePath2,
  isUri,
  ReUpload
}: {
  imagePath: string;
  imagePath2: string;
  isModalVisible: boolean;
  setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
  modalTitle: string;
  setImagePath: React.Dispatch<React.SetStateAction<string>>;
  setImagePath2: React.Dispatch<React.SetStateAction<string>>;
  isUri: boolean;
  ReUpload: boolean;
}) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig?.secondaryColor || '#000'}20`; // Ensure fallback color is applied
  const layout = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'front', title: 'Front Aadhar' },
    { key: 'back', title: 'Back Aadhar' },
  ]);

  const renderScene = SceneMap({
    front: () => <FrontAadhar imagePath={imagePath} setImagePath={setImagePath} />,
    back: () => <BackAadhar imagePath2={imagePath2} setImagePath2={setImagePath2} />,
  });

  return (
    <BottomSheet animationType="none"  
      isVisible={isModalVisible}
      onBackdropPress={() => setModalVisible(false)}
      containerStyle={{ backgroundColor: 'rgba(0.5, 0.25, 0, 0.8)' }}
    >
      <View style={styles.bottomsheetview}>
        <View style={[styles.topheader, { backgroundColor: color1 }]}>
          <TouchableOpacity onPress={() => { setModalVisible(false) }} >
            <Text style={styles.donestyle}>{translate("Done")}</Text>
          </TouchableOpacity>
          <Text style={styles.headerText}>{modalTitle}</Text>
          {isUri && <TouchableOpacity onPress={ReUpload}>
            <Text style={styles.donestyle}>{translate("ReUpload")}</Text>
          </TouchableOpacity>}
        </View>

        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          style={styles.tabView}
        />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  bottomsheetview: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    height: SCREEN_HEIGHT / 1.2
  },
  headerText: {
    fontSize: wScale(18),
    textAlign: 'center',
    paddingVertical: hScale(8),
    color: '#000',
    fontWeight: 'bold',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    flex: 1
  },
  topheader: {
    flexDirection: 'row',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wScale(20)
  },
  image: {
    height: SCREEN_HEIGHT / 1.2,
    marginHorizontal: wScale(10),
  },
  donestyle: {
    fontSize: wScale(16),
    color: '#000'
  },
  tabView: {
    flex: 1,
  },
});

export default AadharTab;
