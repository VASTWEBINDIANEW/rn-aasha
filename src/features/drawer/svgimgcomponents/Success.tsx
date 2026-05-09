import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const Success = ({ size = wScale(40) }) => {
    const searchicon = `

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path fill="#2ad352" d="M256 0C114.62 0 0 114.58 0 256s114.62 256 256 256 256-114.65 256-256S397.38 0 256 0z" opacity="1" data-original="#2ad352"></path><path fill="#74da7f" d="M0 256a254.87 254.87 0 0 0 30.49 121.23 278.76 278.76 0 0 0 78.73 11.29c153.9 0 278.66-124.76 278.66-278.66a278.7 278.7 0 0 0-11.64-79.94A254.86 254.86 0 0 0 256 0C114.62 0 0 114.58 0 256z" opacity="1" data-original="#74da7f" class=""></path><path fill="#ffffff" d="M402 213.58 248.13 375.17a45.16 45.16 0 0 1-32.48 14h-.2a45.11 45.11 0 0 1-32.4-13.71l-81.65-84.1a45.14 45.14 0 1 1 64.78-62.87l48.95 50.42 121.49-127.58A45.14 45.14 0 1 1 402 213.58z" opacity="1" data-original="#ffffff" class=""></path></g></svg> 
    `
    return (
        <View>
            <SvgXml xml={searchicon} width={size} height={size} />
        </View>
    );
};


export default Success;
