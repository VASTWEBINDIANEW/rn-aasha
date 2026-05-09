import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";
import { color } from "@rneui/base";

const RechargeSvg = ({ size = wScale(40), color='#fff'}) => {
    const searchicon = `

<svg clip-rule="evenodd" fill-rule="evenodd" height="512" image-rendering="optimizeQuality" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" viewBox="0 0 1706.66 1706.66" width="512" xmlns="http://www.w3.org/2000/svg" xmlns:xodm="http://www.corel.com/coreldraw/odm/2003" fill=${color}><g id="Layer_x0020_1"><path d="m1227.44 1706.03h-748.21c-69.1 0-125.33-56.23-125.33-125.33v-1454.74c0-69.1 56.23-125.33 125.33-125.33h748.21c69.1 0 125.33 56.23 125.33 125.33v1454.74c-.14 69.1-56.37 125.33-125.33 125.33zm-748.21-1665.12c-46.86 0-85.05 38.19-85.05 85.05v1454.74c0 46.86 38.19 85.05 85.05 85.05h748.21c46.86 0 85.05-38.19 85.05-85.05v-1454.74c0-46.86-38.19-85.05-85.05-85.05h-748.21z"/><path d="m1332.49 235.35h-958.46c-26.55 0-26.55-40.29 0-40.29h958.59c26.5 0 26.6 40.29-.14 40.29z"/><path d="m1332.49 1493.84h-958.46c-26.52 0-26.52-40.29 0-40.29h958.59c26.46 0 26.57 40.29-.14 40.29z"/><path d="m590.57 138.13c-30.76 0-66.72 6.78-66.72-20.14 0-26.93 35.96-20.14 66.72-20.14 26.55 0 26.55 40.28 0 40.28z"/><path d="m939.57 138.13h-172.61c-26.55 0-26.55-40.28 0-40.28h172.47c26.48 0 26.53 40.28.14 40.28z"/><path d="m980.56 1599.87h-254.58c-26.52 0-26.52-40.29 0-40.29h254.58c26.43 0 26.58 40.29 0 40.29z"/><path d="m720.52 1185.13c-13.26 0-23.02-12.96-19.3-25.74l76.79-265.21-88.82-8.96c-15.65-1.54-23.71-19.96-13.85-32.45l250.67-323.54c13.37-17.22 41.28-3.53 35.39 17.91l-68.26 242.69h122.39c17.31 0 26.09 20.17 15.39 33.01l-294.87 355.02c-4.06 4.76-9.79 7.28-15.53 7.28zm8.81-336.41 76.79 7.83c12.48 1.23 20.88 13.61 17.35 25.74l-56.65 195.55 205.76-247.73h-106.03c-13.58 0-22.98-13-19.44-25.6l47.56-168.69-165.33 212.9z"/></g></svg>    
    
    `
    return (
        <View>
            <SvgXml xml={searchicon} width={size} height={size} />
        </View>
    );
};


export default RechargeSvg;
