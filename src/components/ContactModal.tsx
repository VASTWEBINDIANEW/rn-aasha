import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
} from "react-native";
import { SCREEN_HEIGHT, hScale, wScale } from "../utils/styles/dimensions";
import { translate } from "../utils/languageUtils/I18n";
import SearchIcon from "../features/drawer/svgimgcomponents/Searchicon";
import ClosseModalSvg2 from "../features/drawer/svgimgcomponents/ClosseModal2";

const ContactModal = ({
  showContactModal,
  setShowContactModal,
  searchText,
  setSearchText,
  showContactsList,
  color1, 
}) => {
  return (
    <Modal
      visible={showContactModal}
      animationType="fade" // Fade + Slide combination feel
      transparent={false}
      statusBarTranslucent
      onRequestClose={() => setShowContactModal(false)}
    >
      <View style={styles.fullScreenContainer}>
        {/* Modern Status Bar Handling */}
        <StatusBar backgroundColor="transparent" barStyle="dark-content" translucent />
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
          style={{ flex: 1 }}
        >
          {/* Main Header Container */}
          <View style={[styles.headerArea, { backgroundColor: color1 || '#F5F7FA' }]}>
            <View style={styles.topSpacer} />
            
            <View style={styles.headerRow}>
              <View style={styles.searchBarContainer}>
                <View style={styles.searchIconWrapper}>
                  <SearchIcon width={wScale(20)} height={wScale(20)} color="#8E8E93" />
                </View>
                
                <TextInput
                  value={searchText}
                  onChangeText={(text) => setSearchText(text)}
                  placeholder={translate("Search Name or Number")}
                  style={styles.modernInput}
                  placeholderTextColor={"#A0A0A0"}
                  selectionColor={color1 ? '#000' : '#4A90E2'}
                />

                {searchText.length > 0 && (
                  <TouchableOpacity 
                    onPress={() => setSearchText("")} 
                    style={styles.clearCircle}
                  >
                    <Text style={styles.clearX}>{translate("✕")}</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                onPress={() => setShowContactModal(false)}
                activeOpacity={0.6}
                style={styles.closeIconButton}
              >
                <ClosseModalSvg2 width={wScale(24)} height={wScale(24)} />
              </TouchableOpacity>
            </View>
          </View>

          {/* List Section with Soft Rounded Corner Top */}
          <View style={styles.listSection}>
            <View style={styles.dragHandle} />
            {showContactsList}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topSpacer: {
    height: Platform.OS === 'ios' ? hScale(45) : StatusBar.currentHeight + hScale(5),
  },
  headerArea: {
    paddingBottom: hScale(20),
    paddingHorizontal: wScale(16),
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    // Soft depth
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchBarContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    height: hScale(52),
    paddingHorizontal: wScale(15),
    marginRight: wScale(12),
    // Neumorphic style sublte border
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.03)",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  searchIconWrapper: {
    marginRight: wScale(10),
  },
  modernInput: {
    flex: 1,
    fontSize: wScale(16),
    color: "#1C1C1E",
    fontWeight: "500",
    letterSpacing: -0.3,
  },
  clearCircle: {
    backgroundColor: "#F2F2F7",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },
  clearX: {
    fontSize: 10,
    fontWeight: "900",
    color: "#8E8E93",
  },
  closeIconButton: {
    width: wScale(44),
    height: wScale(44),
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
  },
  listSection: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    marginTop: hScale(-15), // Smooth overlap
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingTop: hScale(10),
    overflow: 'hidden',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#E5E5EA",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 10,
  }
});

export default ContactModal;
