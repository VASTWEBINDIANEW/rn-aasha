import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";
import { color } from "@rneui/base";

const RadintPrintSvg = ({ size = wScale(60), color='#fff' }) => {
    const svgname = `

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512"  x="0" y="0" viewBox="0 0 128 128" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g transform="matrix(1.2699999999999991,0,0,1.2699999999999991,-17.279999999999944,-17.279999999999944)"><path d="M109 80.35H89.13V25a7.76 7.76 0 0 0-7.75-7.75H25A7.76 7.76 0 0 0 17.25 25v73.19a12.57 12.57 0 0 0 12.56 12.56h68.38a12.57 12.57 0 0 0 12.56-12.56V82.1a1.75 1.75 0 0 0-1.75-1.75zm-79.19 26.9a9.06 9.06 0 0 1-9.06-9.06V25A4.26 4.26 0 0 1 25 20.75h56.38A4.26 4.26 0 0 1 85.63 25v73.19a12.54 12.54 0 0 0 3.87 9.06zm77.44-9.06a9.06 9.06 0 0 1-18.12 0V83.85h18.12z" fill='${color}' opacity="1" data-original="#000000"></path><path d="M74.19 37.44H52.94a1.75 1.75 0 0 0 0 3.5h21.25a1.75 1.75 0 0 0 0-3.5zM74.19 53.4h-42.5a1.75 1.75 0 0 0 0 3.5h42.5a1.75 1.75 0 0 0 0-3.5zM74.19 69.36h-42.5a1.75 1.75 0 1 0 0 3.5h42.5a1.75 1.75 0 0 0 0-3.5zM74.19 85.31h-42.5a1.75 1.75 0 1 0 0 3.5h42.5a1.75 1.75 0 0 0 0-3.5z" fill='${color}' opacity="1" data-original="#000000"></path></g></svg>

`
    return (
        <View>
            <SvgXml xml={svgname} width={size} height={size} />
        </View>
    );
};


export default RadintPrintSvg;
