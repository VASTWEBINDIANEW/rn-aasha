import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const NavigationSvg = ({ size = wScale(30) }) => {
    const searchicon = `

<svg enable-background="new 0 0 64 64" height="512" viewBox="0 0 64 64" width="512" xmlns="http://www.w3.org/2000/svg"><g id="Layer_14"><path d="m56.436 6.91-22.522 50.18-4.739-20.77c-.07-.301-.31-.521-.61-.58l-21-3.601z"/></g></svg>

`
   

return (
        <View>
            <SvgXml xml={searchicon} width={size} height={size} />
        </View>
    );
};


export default NavigationSvg;
