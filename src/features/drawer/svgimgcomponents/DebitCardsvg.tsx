import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const DebitCardsvg = ({ size = wScale(40) }) => {
    const svgname = `

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><linearGradient id="a" x1="256" x2="256" y1="409.312" y2="102.688" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#6d55a4"></stop><stop offset="1" stop-color="#02adcf"></stop></linearGradient><path fill="url(#a)" d="M443.501 102.688H68.499C43.41 102.688 23 123.098 23 148.187v215.627c0 25.088 20.411 45.499 45.499 45.499h375.002c25.088 0 45.499-20.411 45.499-45.499V148.187c0-25.089-20.411-45.499-45.499-45.499zm-375.002 16h375.002c16.266 0 29.499 13.233 29.499 29.499v2.154H39v-2.154c0-16.266 13.233-29.499 29.499-29.499zM473 166.341v56.657H39v-56.657zm-29.499 226.971H68.499C52.233 393.312 39 380.079 39 363.814V238.997h434v124.816c0 16.266-13.233 29.499-29.499 29.499zm-49.992-124.907H319.26c-17.231 0-31.25 14.019-31.25 31.25v33c0 17.231 14.019 31.25 31.25 31.25h74.249c17.231 0 31.25-14.019 31.25-31.25v-33c0-17.231-14.019-31.25-31.25-31.25zm15.25 64.25c0 8.409-6.841 15.25-15.25 15.25H319.26c-8.409 0-15.25-6.841-15.25-15.25v-33c0-8.409 6.841-15.25 15.25-15.25h74.249c8.409 0 15.25 6.841 15.25 15.25z" opacity="1" data-original="url(#a)"></path></g></svg>

`
    return (
        <View>
            <SvgXml xml={svgname} width={size} height={size} />
        </View>
    );
};


export default DebitCardsvg;
