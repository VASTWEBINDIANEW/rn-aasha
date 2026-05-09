import { translate } from "../utils/languageUtils/I18n";
import { BottomSheet } from "@rneui/themed";
import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet, ActivityIndicator, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../reduxUtils/store";
import { SCREEN_HEIGHT, hScale, wScale } from "../utils/styles/dimensions";
import DynamicButton from "../features/drawer/button/DynamicButton";
import LottieView from "lottie-react-native";
const Rechargeconfirm = ({
  lastvalue,
  lastlabel,
  onRechargedetails,
  isModalVisible,
  details,
  onBackdropPress,
  isLoading2
}) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  return (
    <BottomSheet
      animationType="none"
      isVisible={isModalVisible}
      onBackdropPress={onBackdropPress}
      containerStyle={{ backgroundColor: 'rgba(0.5, 0.25, 0, 0.8)', }}>
      <View style={styles.bottomsheetview}>
        <  View style={[styles.header, { borderBottomColor: colorConfig.secondaryColor }]}>
          <LottieView
            autoPlay={true}
            loop={true}
            style={styles.lotiimg2}
            source={require('.././utils/lottieIcons/profile2.json')}
          />
          <Text style={[styles.headerText,]}>{translate("Please_Verify_Below_Details")}</Text>
        </View>
        <ScrollView keyboardShouldPersistTaps={"handled"}

        
        contentContainerStyle={styles.scrollContent} // Yeh add karein
        >

          <View style={[styles.detailsContainer,]}>

            {details.map((item, index) => (
              <View style={styles.detailItem} key={index}>
                <Text style={styles.label}>{item.label}</Text>
                {item.value && (<Text style={styles.value}>{item.value}</Text>)}
                {item.value2 && (<Text style={styles.value2}>{item.value2}</Text>)}
              </View>
            ))}
            <View style={[styles.detailItem, styles.detailItem2]}>
              <Text style={styles.label}>{lastlabel}</Text>
              <Text style={[styles.value,]}>₹ {lastvalue}</Text>
            </View>
            <DynamicButton
              title={isLoading2 ? <ActivityIndicator size='large' color={colorConfig.labelColor} /> : 'Confirm And Pay'}
              onPress={
                onRechargedetails
              }
              styleoveride={undefined} />
          </View>

        </ScrollView>

      </View>
    </BottomSheet>
  );
};
const styles = StyleSheet.create({
  bottomsheetview: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
   // height: SCREEN_HEIGHT / 1.2
      maxHeight: SCREEN_HEIGHT * 0.85, 
  },
  header: {
    alignSelf: 'center',
    paddingBottom: hScale(5),
    borderBottomWidth: wScale(1),
    width: '80%',
    alignItems: 'center',
    paddingTop: hScale(15),
  },
  headerText: {
    fontSize: wScale(22),
    textAlign: 'center',
    paddingTop: hScale(6),
    color: '#000'
  },
  detailsContainer: {
    marginTop: hScale(20),
    borderRadius: 10,
    paddingHorizontal: wScale(20),
    paddingBottom: hScale(20),

  },
  scrollContent: {
      paddingBottom: hScale(120), 
  flexGrow: 1,
},
  detailItem: {
    justifyContent: 'space-between',
    marginBottom: hScale(10),
    borderBottomWidth: wScale(.5),
    paddingVertical: hScale(8),
  },
  detailItem2: {
    borderBottomWidth: wScale(0),
    paddingBottom: hScale(0),
    marginBottom: hScale(20),

  },
  label: {
    fontSize: wScale(15),
    paddingBottom: hScale(5),
    color: '#000'
  },
  value: {
    fontSize: wScale(35),
    fontWeight: 'bold',
    color: '#000'
  },
  value2: {
    fontSize: wScale(30),
    color: '#000'
  },
  lotiimg2: {
    height: hScale(70),
    width: wScale(70),
    marginRight: wScale(-2)
  },

});
export default Rechargeconfirm;