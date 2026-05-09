import React, { useState } from "react";
import { Tab, TabView, Text } from "@rneui/themed";
import { StyleSheet, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import { RootState } from "../../../reduxUtils/store";
import BackArrow from "../MenuPage/drawerbacksvg";
import { wScale } from "../../../utils/styles/dimensions";
import FlotingInput from "../securityPages/FlotingInput";
import { translate } from "../../../utils/languageUtils/I18n";

const SelectedTad = () => {
  const [index, setIndex] = React.useState(0);
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  return (
    <>
      <Tab
        style={styles.tab}
        value={index}
        onChange={(e) => setIndex(e)}
        indicatorStyle={{
          height: 0,
        }}
        iconPosition="right"
        variant="primary"
        scrollable="false"
        titleStyle={[styles.title, { color: colorConfig.primaryButtonColor }]}
      >
        <Tab.Item
          containerStyle={(active) => ({
            backgroundColor: active ? colorConfig.secondaryColor : undefined,
            borderWidth: 1,
            borderRadius: 5,
            borderColor: colorConfig.secondaryColor,
            height: 55,
            justifyContent: "center",
            marginRight: 10,
            scrollable: "false",
          })}
          title={translate("Your Name")}
          icon={() => <BackArrow />}
        />
        <Tab.Item
          containerStyle={(active) => ({
            backgroundColor: active ? colorConfig.secondaryColor : undefined,
            borderWidth: 0.5,
            borderColor: colorConfig.secondaryColor,
            borderRadius: 5,
            height: 55,
            justifyContent: "center",
            marginLeft: 10,
          })}
          title={translate("Firm Name")}
          icon={() => <BackArrow />}
        />
      </Tab>
      <TabView
        value={index}
        onChange={setIndex}
        style={styles.TabViewitem}
        scrollable="false"
      >
        <TabView.Item style={styles.tabContent} scrollable="false" s>
          <FlotingInput label={translate("Your Name")} />
        </TabView.Item>
        <TabView.Item style={styles.tabContent}>
          <FlotingInput label={translate("Your Password")} />
        </TabView.Item>
      </TabView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 1,
  },
  tab: {
    backgroundColor: "#fff",
    paddingHorizontal: wScale(10),
    marginHorizontal: wScale(10),
  },
  title: {
    color: "#000",
  },
  TabViewitem: {
    backgroundColor: "#fff",
    width: "100%",
    paddingHorizontal: wScale(10),
    marginHorizontal: wScale(10),
  },
  tabContent: {
    paddingHorizontal: wScale(10),
    backgroundColor: "#fff",
    width: "100%",
    marginHorizontal: wScale(10),
    paddingTop: 20,
  },
});

export default SelectedTad;
