import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";
import { color } from "@rneui/base";

const RadintEditSvg = ({ size = wScale(50), color='#fff' }) => {
    const svgname = `

<svg id="Layer_1" enable-background="new 0 0 512 512" height="512" viewBox="0 0 512 512" width="512" fill='${color}' xmlns="http://www.w3.org/2000/svg"><path d="m416.279 208.363v203.407c0 27.83-22.568 50.403-50.403 50.403h-270.261c-27.841 0-50.412-22.573-50.412-50.403v-266.07c0-27.835 22.57-50.409 50.412-50.409h215.643" fill="none" stroke="${color}" stroke-linecap="round" stroke-width="25"/><path d="m382.684 90.737 46.2 46.211-222.648 222.643-60.914 13.657 15.228-59.334z"/><path d="m393.543 79.867 46.206 46.211 35.189-35.183-46.216-46.207z"/></svg>
`
    return (
        <View>
            <SvgXml xml={svgname} width={size} height={size} />
        </View>
    );
};


export default RadintEditSvg;
