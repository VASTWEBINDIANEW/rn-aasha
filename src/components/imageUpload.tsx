import { translate } from "../utils/languageUtils/I18n";
import React from "react";
import { 
  Image, 
  View, 
  StyleSheet, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  Dimensions 
} from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../reduxUtils/store";
import { SCREEN_HEIGHT, hScale, wScale } from "../utils/styles/dimensions";
import NoDatafound from "../features/drawer/svgimgcomponents/Nodatafound";

// TypeScript Interface for Props
interface ImageUploadBottomSheetProps {
  imagePath: string;
  isModalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
  modalTitle: string;
  setImagePath: (path: string) => void;
}

const ImageUploadBottomSheet: React.FC<ImageUploadBottomSheetProps> = ({
  imagePath,
  isModalVisible,
  setModalVisible,
  modalTitle,
  setImagePath,
}) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  return (
    <Modal
      visible={isModalVisible}
      transparent={true}
      animationType="slide"
      statusBarTranslucent={true} // For better full-screen feel
      onRequestClose={() => setModalVisible(false)}
    >
      {/* 1. Backdrop Overlay (Bahar click karne pe close hoga) */}
      <TouchableOpacity 
        style={styles.modalOverlay} 
        activeOpacity={1} 
        onPressOut={() => setModalVisible(false)}
      >
        
        {/* 2. Modal Content Container */}
        <TouchableWithoutFeedback>
          <View style={styles.bottomsheetview}>
            
            {/* 3. Modern Grabber Handle */}
            <View style={styles.handle} />

            {/* 4. Header Section */}
            <View style={styles.headerContainer}>
              <Text style={styles.headerText}>{modalTitle}</Text>
            </View>

            {/* 5. Content Area (Image or NoData) */}
            <View style={styles.contentContainer}>
              {imagePath ? (
                <Image
                  source={{ uri: imagePath }}
                  onError={() => setImagePath('')}
                  style={styles.imageStyle}
                  resizeMode='contain'
                />
              ) : (
                <View style={styles.noDataContainer}>
                  <NoDatafound size={wScale(220)} />
                  <Text style={styles.noDataText}>{translate("No_Data_Found")}</Text>
                </View>
              )}
            </View>

            {/* 6. Bottom Spacer/Footer */}
            <TouchableOpacity 
               style={[styles.closeBtn, { backgroundColor: colorConfig.secondaryColor }]}
               onPress={() => setModalVisible(false)}
            >
                <Text style={styles.closeBtnText}>{translate("Close_View")}</Text>
            </TouchableOpacity>

          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Premium dark blur effect
    justifyContent: 'flex-end',
  },
  bottomsheetview: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30, // Extra rounded for modern look
    borderTopRightRadius: 30,
    height: SCREEN_HEIGHT / 1.15, // Slightly more height
    width: '100%',
    paddingBottom: hScale(20),
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  handle: {
    width: 45,
    height: 6,
    backgroundColor: '#E5E5E5',
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 15,
  },
  headerContainer: {
    paddingVertical: hScale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    marginBottom: 10,
  },
  headerText: {
    fontSize: wScale(22),
    textAlign: 'center',
    color: '#1A1A1A',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: wScale(15),
    justifyContent: 'center',
  },
  imageStyle: {
    flex: 1,
    width: '100%',
    borderRadius: 15,
  },
  noDataContainer: {
    alignItems: 'center', 
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: wScale(18),
    color: '#999',
    marginTop: 10,
    fontWeight: '500',
  },
  closeBtn: {
    marginHorizontal: wScale(30),
    marginTop: 15,
    paddingVertical: hScale(12),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hScale(10)
  },
  closeBtnText: {
    color: '#fff',
    fontSize: wScale(16),
    fontWeight: '700',
  }
});

export default ImageUploadBottomSheet;
