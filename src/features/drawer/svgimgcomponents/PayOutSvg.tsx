import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const PayOutSvg = ({ size = wScale(50), color='#000',color2='#000' }) => {
    const searchicon = `

<svg id="object" height="512" viewBox="0 0 100 100" width="512" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><linearGradient id="New_Gradient_Swatch_2" gradientUnits="userSpaceOnUse" x1="8.591" x2="81.946" y1="85.53" y2="12.175"><stop offset="0" stop-color="${color2}"/><stop offset="1" stop-color="${color}"/></linearGradient><g id="_02" data-name="02"><path d="m25.357 48.633h6.316v8.661a1 1 0 0 0 1 1h14.556a1 1 0 0 0 1-1v-8.661h6.316a1 1 0 0 0 .744-1.669l-14.595-16.2a1.032 1.032 0 0 0 -1.486 0l-14.594 16.2a1 1 0 0 0 .743 1.669zm30.188 21.857a1 1 0 0 1 -1 1h-29.188a1 1 0 0 1 0-2h29.188a1 1 0 0 1 1 1zm34.1-39.96v-8.5a5.233 5.233 0 0 0 -5.234-5.221h-3.659v-3.22a5.227 5.227 0 0 0 -5.222-5.222h-65.188a5.145 5.145 0 0 0 -3.693 1.533 5.208 5.208 0 0 0 -1.542 3.692v66.3a5.234 5.234 0 0 0 5.235 5.222h74.072a5.234 5.234 0 0 0 5.234-5.222v-8.5a6.314 6.314 0 0 0 5.245-6.2v-28.462a6.315 6.315 0 0 0 -5.245-6.2zm-2 49.361a3.232 3.232 0 0 1 -3.234 3.222h-74.069a3.233 3.233 0 0 1 -3.235-3.222v-62.2a5.223 5.223 0 0 0 3.235 1.119h74.072a3.231 3.231 0 0 1 3.234 3.221v8.4h-8.557a6.3 6.3 0 0 0 -6.3 6.3v28.462a6.3 6.3 0 0 0 6.3 6.3h8.557zm-3.8-23a5.933 5.933 0 1 1 5.932-5.934 5.94 5.94 0 0 1 -5.933 5.943z" fill="url(#New_Gradient_Swatch_2)"/></g></svg>
`
    return (
        <View>
            <SvgXml xml={searchicon} width={size} height={size} />
        </View>
    );
};


export default PayOutSvg;
