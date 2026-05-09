import { translate } from "../../../utils/languageUtils/I18n";
import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const ShadowSvg = ({ size = wScale(440), color = '#ed3528' }) => {
    const searchicon = `

<svg version="1.0" xmlns="http://www.w3.org/2000/svg"
 width="225.000000pt" height="225.000000pt" viewBox="0 0 225.000000 225.000000"
 preserveAspectRatio="xMidYMid meet">

<g transform="translate(0.000000,225.000000) scale(0.100000,-0.100000)"
fill="#000000" stroke="none">
<path d="M935 1293 c11 -3 23 -10 27 -17 12 -18 264 -13 313 7 38 15 32 16
-160 15 -110 0 -191 -3 -180 -5z"/>
</g>
</svg>
  `
    return (
        <View>
            <SvgXml xml={searchicon} width={size} height={size} />
        </View>
    );
};


export default ShadowSvg;
