import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";
import { color } from "@rneui/base";

const DistributorWalletSvg = ({ size = wScale(34), color = '#fff' }) => {
    const svgname = `

<?xml version="1.0" encoding="utf-8"?>
<!-- Svg Vector Icons : http://www.onlinewebfonts.com/icon -->
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 256 256" enable-background="new 0 0 256 256" xml:space="preserve">
<metadata> Svg Vector Icons : http://www.onlinewebfonts.com/icon </metadata>
<g><g><path fill="#000000" d="M60.4,125.9l1.3-0.4c2.6-0.9,4.3-3,4.3-5.6c0-2.1-1.7-4.3-4.3-5.6c-10.3-4.7-16.7-15-16.7-26.1c0-12.4,10.7-23.5,20.5-25.6c1.7-5.1,4.3-9.8,7.3-14.5c-20.5,1.7-36.8,19.7-36.8,40.2c0,9.8,3.9,19.7,10.3,26.9l2.6,2.6l-3.4,2.6C23.7,131.9,10,154.1,10,178.9v13.2c0,3,2.6,5.6,5.6,5.6h12.8c0-3.9,0.4-6.4,1.3-9.4H19.4v-9.4C19.4,154.1,36.1,132.3,60.4,125.9z"/><path fill="#000000" d="M158.4,123.7l-4.7-1.7l3.9-3c12-9.4,18.8-23.5,18.8-38.5c0-26.9-21.8-48.7-48.7-48.7c-26.9,0-48.7,21.8-48.7,48.7c0,15,6.8,29.1,18.8,38.5l3.9,3l-4.7,1.7c-32.1,12.8-52.6,43.2-52.6,77.4v17.1c0,3,2.6,6,5.6,6h154.8c3,0,6-2.6,6-6v-17.1C210.9,166.5,190.4,136.1,158.4,123.7z M87.4,80.1c0-22.2,18-40.2,40.2-40.2c22.2,0,40.2,18,40.2,40.2c0,22.2-18,40.2-40.2,40.2C105.8,120.3,87.4,102.4,87.4,80.1z M203.6,215.2H51.9v-12c0-41.9,34.2-76.1,76.1-76.1s76.1,34.2,76.1,76.1v12H203.6z"/><path fill="#000000" d="M209.6,120.3l-3.4-1.7l2.6-2.6c6.8-7.3,10.7-17.1,10.7-26.9c0-20.9-16.3-38-36.8-40.2c3.4,4.7,5.6,9.4,6,12.8c11.1,3.9,23.1,14.5,23.1,26.9c0,11.1-6.8,21.4-17.1,26.1c-2.6,1.3-3.9,3.4-3.9,5.6c0,2.6,1.7,4.7,3.9,5.1l1.7,0.4c24.3,6,41,27.8,41,52.6v9.4h-11.5c0.4,3,0.9,6,1.3,9.4H240c3,0,6-2.6,6-5.6v-13.2C245.1,154.1,231.9,131.9,209.6,120.3z"/></g></g>
</svg>


`;
    return (
        <View>
            <SvgXml xml={svgname} width={size} height={size} />
        </View>
    );
};


export default DistributorWalletSvg;
