import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Easing,
} from "react-native";
import { SvgXml } from "react-native-svg";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import { useSelector } from "react-redux";
import { RootState } from "../../../reduxUtils/store";
import { translate } from "../../../utils/languageUtils/I18n";

const DynamicSecurityPages = ({
  mobilestyle,
  hedingstyle,
  buttonstyle,
  topsvgimg,
  title,
  content,
  secondtitle,
  buttonText,
  buttonImg,
  onPressBtn,
  onPressImg,
  buttontextstyle,
  selectedtext,
  selecttexcolor,
}) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.primaryColor}10`;
  const [rotationAnim] = useState(new Animated.Value(0));

  const handlePressBtn = () => {
    Animated.timing(rotationAnim, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
      easing: Easing.bounce,
    }).start(() => {
      rotationAnim.setValue(0);
    });
    onPressImg();
  };

  const rotateStyle = {
    transform: [
      {
        rotate: rotationAnim.interpolate({
          inputRange: [0, 1],
          outputRange: ["0deg", "360deg"],
        }),
      },
    ],
  };

  return (
    <View>
      {topsvgimg && (
        <View style={styles.topsvg}>
          <SvgXml xml={topsvgimg} width={wScale(140)} height={hScale(140)} />
        </View>
      )}

      <View style={[styles.mobileviwe, mobilestyle, {}]}>
        <Text style={[styles.heding, hedingstyle, {}]}>{translate(title)}</Text>
        <View style={styles.mobileviwe2}>
          <Text style={styles.contante}>{translate(content)}</Text>
          {secondtitle && (
            <View style={styles.selectedview}>
              <Text style={styles.onofftext}>{translate(secondtitle)}</Text>

              <Text style={[styles.onofftext, selecttexcolor]}>
                {translate(selectedtext)}
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.button, buttonstyle]}
            onPress={onPressBtn}
          >
            <Text style={[styles.btntext, buttontextstyle]}>
              {translate(buttonText)}
            </Text>
            {buttonImg && (
              <TouchableOpacity
                onPress={handlePressBtn}
                style={styles.rotateBtnStyle}
              >
                <Animated.View style={rotateStyle}>
                  <SvgXml
                    xml={buttonImg}
                    width={wScale(30)}
                    height={hScale(30)}
                  />
                </Animated.View>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topsvg: {
    justifyContent: "center",
    width: "100%",
    alignItems: "center",
    paddingVertical: hScale(10),
  },
  mobileviwe: {
    alignItems: "center",
    marginBottom: hScale(15),
  },
  mobileviwe2: {
    alignItems: "center",
    paddingHorizontal: wScale(10),
    paddingVertical: wScale(10),
    width: "100%",
  },
  heding: {
    fontSize: wScale(25),
    fontWeight: "bold",
    color: "#fff",
    width: "100%",
    textAlign: "center",
    paddingVertical: hScale(10),
  },
  contante: {
    textAlign: "justify",
    color: "#000",
    fontSize: wScale(13),
  },
  selectedview: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },
  onofftext: {
    fontSize: wScale(22),
    color: "#000",
    paddingTop: hScale(10),
  },
  button: {
    borderRadius: 50,
    padding: wScale(10),
    width: "100%",
    marginTop: hScale(18),
    marginBottom: hScale(15),
    borderWidth: wScale(1),
    justifyContent: "space-between",
    paddingHorizontal: wScale(20),
    flexDirection: "row",
    alignItems: "center",
  },
  btntext: {
    fontSize: wScale(22),
    color: "#000",
    fontWeight: "bold",
  },
  rotateBtnStyle: {
    width: wScale(70),
    alignItems: "flex-end",
  },
});
export default DynamicSecurityPages;
