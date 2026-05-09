import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";
import { color } from "@rneui/base";

const NextErrowSvg2 = ({ size = wScale(40), color = '#fff' }) => {
    const svgname = `

    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="40" height="40" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path d="M149.3 481c-3 0-6-1.1-8.2-3.4-4.6-4.6-4.6-11.9 0-16.5L346.2 256 141.1 50.9c-4.6-4.6-4.6-11.9 0-16.5s11.9-4.6 16.5 0l213.3 213.3c4.6 4.6 4.6 11.9 0 16.5L157.6 477.6c-2.3 2.3-5.3 3.4-8.3 3.4z" fill="${color}" opacity="1" data-original="#000000" class=""></path></g></svg>
    
    ` ;

    return (
        <View>
            <SvgXml xml={svgname} width={size} height={size} />
        </View>
    );
};


export default NextErrowSvg2;
