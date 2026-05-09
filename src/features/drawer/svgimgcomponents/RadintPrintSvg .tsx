import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";
import { color } from "@rneui/base";

const RadintPrintSvg = ({ size = wScale(60), color='#fff' }) => {
    const svgname = `

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 32 32" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g transform="matrix(1.0499999999999996,0,0,1.0499999999999996,-0.7997499704360891,-0.8089999973773878)"><g data-name="Layer 41"><path d="M25.92 14.14a1.44 1.44 0 1 0-1.44-1.44 1.44 1.44 0 0 0 1.44 1.44zm0-2.13a.69.69 0 1 1-.69.69.69.69 0 0 1 .69-.7z" fill='${color}' opacity="1" data-original="#000000"></path><path d="M25.39 9.54h-1.73v-3a.37.37 0 0 0-.1-.25l-4.2-4.2a.37.37 0 0 0-.26-.11H8.71a.38.38 0 0 0-.37.38v7.18H6.61a4 4 0 0 0-4 4v10.27a1.56 1.56 0 0 0 1.56 1.56h4.16V30a.38.38 0 0 0 .38.38h14.58a.38.38 0 0 0 .38-.37v-4.63h4.15a1.56 1.56 0 0 0 1.56-1.56v-10.3a4 4 0 0 0-3.99-3.98zm-5.93-6.32 2.92 2.92h-2.92zM9.08 2.7h9.63v3.82a.38.38 0 0 0 .38.38h3.82v2.64H9.08zm-2.47 7.59h18.78a3.24 3.24 0 0 1 3.23 3.23v1.23H3.38v-1.23a3.24 3.24 0 0 1 3.23-3.23zm2.47 19.3V20.46h13.84V29.58zm18.73-5h-4.14v-4.13h2.25a.38.38 0 0 0 0-.75H6.08a.38.38 0 1 0 0 .75h2.25v4.17H4.19a.81.81 0 0 1-.81-.81V15.5h25.25v8.32a.81.81 0 0 1-.82.81z" fill='${color}' opacity="1" data-original="#000000"></path><path d="M20.41 13.08h2.88a.38.38 0 0 0 0-.75h-2.88a.38.38 0 0 0 0 .75zM21.19 22.29H10.81a.38.38 0 0 0 0 .75h10.38a.38.38 0 0 0 0-.75zM21.19 24.13H10.81a.38.38 0 1 0 0 .75h10.38a.38.38 0 1 0 0-.75zM21.19 26H10.81a.38.38 0 0 0 0 .75h10.38a.38.38 0 0 0 0-.75zM21.19 27.79H10.81a.38.38 0 0 0 0 .75h10.38a.38.38 0 0 0 0-.75z" fill='${color}' opacity="1" data-original="#000000"></path></g></g></svg>
`
    return (
        <View>
            <SvgXml xml={svgname} width={size} height={size} />
        </View>
    );
};


export default RadintPrintSvg;
