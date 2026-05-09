
import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const CreditCardsvg = ({ size = wScale(40) }) => {
    const svgname = `

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 64 64" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><linearGradient id="a" x1="4" x2="60" y1="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#00c0ff"></stop><stop offset="1" stop-color="#5558ff"></stop></linearGradient><path fill="url(#a)" d="M4 36.752v14.76a3.93 3.93 0 0 0 3.93 3.93h40.858a3.937 3.937 0 0 0 3.93-3.93c.004-2.428-.003-12.527 0-14.76-.999.004-47.73-.001-48.718 0zm10.5 13.74a5.4 5.4 0 0 1-5.4-5.39c.25-7.142 10.538-7.15 10.79 0a5.399 5.399 0 0 1-5.39 5.39zm32.118-1h-10.33a1 1 0 0 1 0-2h10.33a1 1 0 0 1 0 2zm0-3.39h-7.61a1 1 0 0 1 0-2h7.61a1 1 0 0 1 0 2zm6.1-14.08v2.73H4v-2.73h48.718zm0-3.72v1.72H4v-1.72a3.937 3.937 0 0 1 3.93-3.93h40.858a3.937 3.937 0 0 1 3.93 3.93zm4.55 10.61-2.55.59v-11.2a5.936 5.936 0 0 0-5.93-5.929H9.05a12.837 12.837 0 0 0-2.04.08 3.571 3.571 0 0 1 2.62-4.3l40.548-9.5a3.562 3.562 0 0 1 4.25 2.64l5.48 23.36a3.553 3.553 0 0 1-2.64 4.26zM14.5 48.492a3.395 3.395 0 0 1 0-6.79 3.395 3.395 0 0 1 0 6.79z" opacity="1" data-original="url(#a)" class=""></path></g></svg>
`
    return (
        <View>
            <SvgXml xml={svgname} width={size} height={size} />
        </View>
    );
};


export default CreditCardsvg;

