import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";
import { color } from "@rneui/base";

const HomeSvg = ({ size ,color}) => {
    const searchicon = `

    <svg id="Layer_4" height="512" viewBox="0 0 24 24" width="512" xmlns="http://www.w3.org/2000/svg" data-name="Layer 4"><g id="Glyph"  fill=${color}><path id="Home" d="m21.665 11.253-9-8a1 1 0 0 0 -1.33 0l-9 8a1 1 0 1 0 1.33 1.494l.335-.3v7.553a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-3a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-7.551l.335.3a1 1 0 1 0 1.33-1.494z"/></g></svg>
     `
    return (
        <View>
            <SvgXml xml={searchicon} width={size} height={size} color={color} />
        </View>
    );
};


export default HomeSvg;
