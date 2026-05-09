import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const AadharPay = ({ size = wScale(40) }) => {
    const searchicon = `

<svg id="OBJECT" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="m24 5h4v22h-4z"/><path d="m20 1h-14c-1.1 0-2 .9-2 2v26c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-26c0-1.1-.9-2-2-2zm-10.5 25.5h-1c-.55 0-1-.45-1-1s.45-1 1-1h1c.55 0 1 .45 1 1s-.45 1-1 1zm0-4h-1c-.55 0-1-.45-1-1s.45-1 1-1h1c.55 0 1 .45 1 1s-.45 1-1 1zm0-4h-1c-.55 0-1-.45-1-1s.45-1 1-1h1c.55 0 1 .45 1 1s-.45 1-1 1zm4 8h-1c-.55 0-1-.45-1-1s.45-1 1-1h1c.55 0 1 .45 1 1s-.45 1-1 1zm0-4h-1c-.55 0-1-.45-1-1s.45-1 1-1h1c.55 0 1 .45 1 1s-.45 1-1 1zm0-4h-1c-.55 0-1-.45-1-1s.45-1 1-1h1c.55 0 1 .45 1 1s-.45 1-1 1zm4 8h-1c-.55 0-1-.45-1-1s.45-1 1-1h1c.55 0 1 .45 1 1s-.45 1-1 1zm0-4h-1c-.55 0-1-.45-1-1s.45-1 1-1h1c.55 0 1 .45 1 1s-.45 1-1 1zm0-4h-1c-.55 0-1-.45-1-1s.45-1 1-1h1c.55 0 1 .45 1 1s-.45 1-1 1zm2-6c0 .55-.45 1-1 1h-11c-.55 0-1-.45-1-1v-6c0-.55.45-1 1-1h11c.55 0 1 .45 1 1z"/><path d="m8.5 7.5h9v4h-9z"/></svg>
`
    return (
        <View>
            <SvgXml xml={searchicon} width={size} height={size} />
        </View>
    );
};


export default AadharPay;
