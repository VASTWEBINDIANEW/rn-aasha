import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const ShareSvg = ({ size = wScale(35),color="#fff" }) => {
    const searchicon = `

    <svg height="512" viewBox="0 0 64 64" width="512" xmlns="http://www.w3.org/2000/svg"><g id="Layer_66" data-name="Layer 66" fill="${color}"><path d="m45.58 37.66a7.92 7.92 0 0 0 -6.28 3.1l-13.3-6.63a7.71 7.71 0 0 0 0-4.26l13.3-6.63c4.47 5.94 14.23 2.72 14.2-4.82a7.92 7.92 0 1 0 -15.5 2.14l-13.3 6.62c-4.48-5.94-14.23-2.72-14.2 4.82s9.72 10.76 14.2 4.82l13.3 6.62a8 8 0 0 0 7.58 10.06c10.49-.4 10.49-15.45 0-15.84z"/></g></svg>
     `
    return (
        <View>
            <SvgXml xml={searchicon} width={size} height={size} />
        </View>
    );
};


export default ShareSvg;
