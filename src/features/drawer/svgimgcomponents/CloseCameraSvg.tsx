import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const CloseCameraSvg = ({ size = wScale(40), color = "#fff" }) => {
    const svgname = `

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><g data-name="ESSENTIAL UI"><path fill="#dd4247" d="M256 0C114.62 0 0 114.61 0 256s114.62 256 256 256 256-114.62 256-256S397.38 0 256 0z" opacity="1" data-original="#dd4247" class=""></path><path fill="#e55353" d="M120.56 400.82c153.63 0 278.17-124.54 278.17-278.16a277.77 277.77 0 0 0-14.28-88.14A254.83 254.83 0 0 0 256 0C114.62 0 0 114.62 0 256a254.81 254.81 0 0 0 36.57 131.91 278.14 278.14 0 0 0 83.99 12.91z" opacity="1" data-original="#e55353" class=""></path><path fill="#ffffff" d="M361.67 361.67a28.37 28.37 0 0 1-40.11 0L256 296.11l-65.56 65.56a28.37 28.37 0 0 1-40.11 0 28.37 28.37 0 0 1 0-40.11L215.89 256l-65.56-65.56a28.37 28.37 0 0 1 0-40.11 28.37 28.37 0 0 1 40.11 0L256 215.89l65.56-65.56a28.37 28.37 0 0 1 40.11 0 28.37 28.37 0 0 1 0 40.11L296.11 256l65.56 65.56a28.37 28.37 0 0 1 0 40.11z" opacity="1" data-original="#ffffff" class=""></path></g></g></svg>


`
    return (
        <View>
            <SvgXml xml={svgname} width={size} height={size} />
        </View>
    );
};


export default CloseCameraSvg;
