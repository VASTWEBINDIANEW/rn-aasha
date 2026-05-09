/* eslint-disable react/prop-types */
import React, { Component } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Pressable,
} from "react-native";
import { translate } from "../../../utils/languageUtils/I18n";

export default class BottomTabs extends Component {
  render() {
    let {
      renderIcon,
      getLabelText,
      activeTintColor,
      inactiveTintColor,
      onTabPress,
      onTabLongPress,
      getAccessibilityLabel,
      navigation,
      showLabel = true,
    } = this.props;

    const routes = ["1", "2", "3", "4", "5"];

    return (
      <View style={styles.tabBar}>
        {routes.map((route, routeIndex) => {
          let isRouteActive = routeIndex === 1;
          let tintColor = isRouteActive ? activeTintColor : inactiveTintColor;

          return (
            <Pressable
              key={routeIndex}
              style={styles.tab}
              onPress={() => {
                onTabPress({ route });
              }}
              onLongPress={() => {
                onTabLongPress({ route });
              }}
            >
              {/* {renderIcon({route, focused: isRouteActive, tintColor})} */}
              {showLabel ? <Text>{translate("TEXT")}</Text> : null}
            </Pressable>
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  tab: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  tabBar: {
    alignSelf: "center",

    borderRadius: 50,
    bottom: 10,
    elevation: 2,
    flexDirection: "row",
    height: 65,
    position: "absolute",
    width: "95%",
  },
  infinity: {
    width: 80,
    height: 100,
  },
  infinityBefore: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    borderWidth: 20,
    borderColor: "red",
    borderStyle: "solid",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomRightRadius: 50,
    borderBottomLeftRadius: 0,
    transform: [{ rotate: "-135deg" }],
  },
  infinityAfter: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 0,
    height: 0,
    borderWidth: 20,
    borderColor: "red",
    borderStyle: "solid",
    borderTopLeftRadius: 50,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 50,
    borderBottomLeftRadius: 50,
    transform: [{ rotate: "-135deg" }],
  },
});
