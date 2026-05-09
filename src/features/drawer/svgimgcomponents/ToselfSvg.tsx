import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";
import { color } from "@rneui/base";

const ToselfSvg = ({ size = wScale(84), color = '#000' }) => {

    const svgname = `

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g transform="matrix(0.9500000000000003,0,0,0.9500000000000003,12.799999999999926,12.799999999999926)"><g data-name="Layer 2"><g data-name="Layer 2 copy 6"><g data-name="9"><path d="M399 259c0 79-64.07 143.41-143 143.91h-.93V371h.93a112 112 0 0 0 0-224h-.93A112.19 112.19 0 0 0 143 256.72h33.26l-16.13 24.6-.17.26-32.34 49.33-32.32-49.33-.17-.26L79 256.72h32.16c1.22-78.3 65.3-141.63 143.91-141.63h.93c78.93.5 143 64.91 143 143.91z" fill=${color} opacity="1" data-original="#000000" class=""></path><path d="M256 0C114.62 0 0 114.62 0 256s114.62 256 256 256 256-114.62 256-256S397.38 0 256 0zm0 494.07c-131.27 0-238.07-106.8-238.07-238.07S124.73 17.93 256 17.93 494.07 124.73 494.07 256 387.27 494.07 256 494.07z" fill=${color} opacity="1" data-original="#000000" class=""></path></g></g></g></g></svg>
`;
    return (
        <View>
            <SvgXml xml={svgname} width={size} height={size} />
        </View>
    );
};


export default ToselfSvg;
