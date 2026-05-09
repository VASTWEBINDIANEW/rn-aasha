import React, { memo, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TouchableOpacity,
  ToastAndroid,
  Alert,
} from "react-native";
import { SvgUri } from "react-native-svg";
import { FlashList } from "@shopify/flash-list";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../reduxUtils/store";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import BackArrow from "../../../utils/svgUtils/BackArrow";
import { sectionData } from "../utils";
import { useNavigation } from "@react-navigation/native";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { colors } from "../../../utils/styles/theme";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OnelineDropdownSvg from "../../drawer/svgimgcomponents/simpledropdown";
import { APP_URLS } from "../../../utils/network/urls";
import useAxiosHook from "../../../utils/network/AxiosClient";
import { translate } from "../../../utils/languageUtils/I18n";

const loader = [{ id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }];
const MAX_ITEMS = 4;
const IconButtons = ({
  getItem,
  isQuickAccess,
  iconButtonstyle,
  buttonData,
  showViewMoreButton = false,
  setViewMoreStatus = (p0: (prev: any) => boolean) => { },
  buttonTitle = "",
}) => {
  const { appLanguage, isDemoUser  ,colorConfig} = useSelector((state: RootState) => state.userInfo);
  const [Radius1, setRadius1] = useState(Number);
  const [rotation, setRotation] = useState(false);
  const [showAllItems, setShowAllItems] = useState(false);
  const { post, get } = useAxiosHook();
  const navigation = useNavigation();
  const [view, setview] = useState("");
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await post({ url: APP_URLS.signUpSvg });
        const rechargeSectionResponse = await post({
          url: APP_URLS.getRechargeSectionImages,
        });
        const viewMoreData = rechargeSectionResponse.filter(
          (item) => item.name === "View More" || item.name === "Hide More",
        );
        setview(viewMoreData[0]);
        console.log(
          viewMoreData[1],
          "*************icon buttons*********************************",
        );
        setRadius1(response[0].Radius1);
        if (response && Array.isArray(response)) {
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, [post, setview]);
  const saveItemToStorage = async (item) => {
    try {
      const savedItems = await AsyncStorage.getItem("quickAccessItems");
      let itemsArray = savedItems ? JSON.parse(savedItems) : [];
      const isItemExist = itemsArray.some(
        (existingItem) => existingItem.name === item.name,
      );
      if (isItemExist) {
        ToastAndroid.show(
          item.name + " " + translate("is_already_exists"),
          ToastAndroid.SHORT,
        );
        return;
      }
      itemsArray.unshift(item);
      if (itemsArray.length > MAX_ITEMS) {
        itemsArray.pop();
      }
      await AsyncStorage.setItem(
        "quickAccessItems",
        JSON.stringify(itemsArray),
      );
      getItem();
    } catch (error) {
      console.error("Error saving item to AsyncStorage:", error);
    }
  };
  const comingSoon = [
    "BusinessCardScreen",
    "GiftCardScreen",
    "PrepaidCardScreen",
    "FlightScreen",
    "TrainScreen",
    "HotelScreen",
    "BusScreen",
  ];

  return (
    <>
      <FlashList
        style={[
          iconButtonstyle,
          { justifyContent: "space-between", alignSelf: "stretch" },
        ]}
        data={buttonData}
        ListEmptyComponent={() => (
          <View style={{ flexDirection: "row" }}>
            {loader.map((item) => (
              <View key={item.id} style={{ marginHorizontal: wScale(18) }}>
                <SkeletonPlaceholder
                  speed={1200}
                  backgroundColor={colors.gray}
                  borderRadius={4}
                >
                  <SkeletonPlaceholder.Item alignItems="center">
                    <SkeletonPlaceholder.Item
                      width={wScale(45)}
                      height={wScale(45)}
                      borderRadius={wScale(45)}
                    />
                    <SkeletonPlaceholder.Item
                      margin={wScale(10)}
                      width={wScale(40)}
                      height={wScale(10)}
                    />
                  </SkeletonPlaceholder.Item>
                </SkeletonPlaceholder>
              </View>
            ))}
          </View>
        )}
        numColumns={4}
        estimatedItemSize={20}
        renderItem={({ item, index }: { item: sectionData; index: number }) => (
          <>
            <TouchableOpacity
              onPress={() => {
                console.log(isDemoUser)
                // Block AEPS for demo users
                const isComingSoon = comingSoon.includes(item.ScreenName);
                console.log(isComingSoon)
                if (isComingSoon) {
                  Alert.alert(
                    "Coming Soon",
                    "This feature is currently under development.\nIt will be available soon.",
                    [{ text: "OK" }]
                  );
                  return;
                }


                if (item.ScreenName === "AepsScreen" && isDemoUser === true) {
                  Alert.alert(
                    "Demo Account",
                    "This is a demo account. Live AEPS transactions not enabled."
                  );
                  return;
                }

                if (isQuickAccess) {
                  saveItemToStorage(item);
                  return;
                }

                switch (item.ScreenName) {

                  case "HideMoreScreen":
                    setViewMoreStatus(prev => !prev);
                    break;

                  case "ViewMoreScreen":
                    setViewMoreStatus(true);
                    break;

                  default:
                    navigation.navigate(item.ScreenName);
                    break;
                }
              }}
              style={styles.element}
            >
              <View style={styles.InputImage}>
                <SvgUri
                  height={wScale(50)}
                  width={wScale(50)}
                  uri={item.svg}
                  onError={() => <BackArrow />}
                />
              </View>
              <View key={item.name}>
                <Text style={[styles.screeitemname,{color:'white'}]} numberOfLines={2}>
                  {translate(item.name)}
                </Text>
              </View>
            </TouchableOpacity>
          </>
        )}
      />
    </>
  );
};

export default memo(IconButtons);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
  element: {
    paddingHorizontal: wScale(2),
    paddingVertical: wScale(8),
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: wScale(2),
    flex: 1,
  },
  InputImage: {
    height: wScale(50),
    width: wScale(50),
    shadowRadius: 3,
    elevation: 2,
    alignItems: "center",
  },
  morebtn: {
    paddingVertical: wScale(8),
    padding: wScale(7),
    alignItems: "center",
    width: "100%",
  },
  imgview: {
    // backgroundColor: "#fff",
    height: wScale(50),
    width: wScale(50),
    shadowRadius: 3,
    elevation: 2,
    alignItems: "center",
    justifyContent: "center",
    // transform: [{ rotate: '90deg' }]
  },
  screeitemname: {
    color: "white",
    textAlign: "center",
  },
});
