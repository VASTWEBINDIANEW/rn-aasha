import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";
import { color } from "@rneui/base";

const MainWalletSvg = ({ size = wScale(90), color = '#fff' }) => {
    const svgname = `

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 28 28" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><g data-name="Layer 2"><path d="M25.014 15H17.75a3.5 3.5 0 0 0 0 7h7.264a1.238 1.238 0 0 0 1.236-1.236v-4.528A1.238 1.238 0 0 0 25.014 15zM17.5 19.75a1.25 1.25 0 1 1 1.25-1.25 1.252 1.252 0 0 1-1.25 1.25zM3.75 9.5h1.428a6.453 6.453 0 0 1-.2-4H3.75a2 2 0 0 0 0 4zM20.75 9.5V6.632A1.132 1.132 0 0 0 19.618 5.5h-1.71a6.453 6.453 0 0 1-.2 4zM10.941 9.5V5.575L9.8 6.722a.5.5 0 0 1-.707-.707l2-2a.5.5 0 0 1 .707 0l2 2a.5.5 0 0 1-.707.707l-1.152-1.147V9.5h4.693a5.616 5.616 0 0 0 .5-2.309 5.692 5.692 0 0 0-11.383 0 5.623 5.623 0 0 0 .5 2.309z" fill="${color}" opacity="1" data-original="#000000" class=""></path><path d="M13.25 18.5a4.505 4.505 0 0 1 4.5-4.5h7v-2.368a1.132 1.132 0 0 0-1.132-1.132H3.75a2.978 2.978 0 0 1-2-.779V24.5a2 2 0 0 0 2 2h19.868a1.132 1.132 0 0 0 1.132-1.132V23h-7a4.505 4.505 0 0 1-4.5-4.5zm-2.826 5.468h-5a.5.5 0 1 1 0-1h5a.5.5 0 0 1 0 1z" fill="${color}" opacity="1" data-original="#000000" class=""></path></g></g></svg>

`;
    return (
        <View>
            <SvgXml xml={svgname} width={size} height={size} />
        </View>
    );
};


export default MainWalletSvg;
