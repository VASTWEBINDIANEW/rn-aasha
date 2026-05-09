import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { hScale, wScale } from "../../../utils/styles/dimensions";

const ScanSvg = ({ size = wScale(45),color="#fff",color2="#fff" }) => {
    const searchicon = `

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 32 32" style="enable-background:new 0 0 512 512" xml:space="preserve" fill-rule="evenodd" class=""><g><path fill="${color2}" d="M22 19h-2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-2 0v5h-4v-4h1a1 1 0 0 0 0-2zm-9 1a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1zm-2 1v4H7v-4zm1-16H6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2a1 1 0 0 0-2 0v1H7V7h5a1 1 0 0 0 0-2zm8.996 2H25v3a1 1 0 0 0 2 0V6a1 1 0 0 0-1-1h-5.004a1 1 0 0 0 0 2z" opacity="1" data-original="#d400ba" class=""></path><path fill="${color}" d="M22 31h6a3 3 0 0 0 3-3v-6a1 1 0 0 0-2 0v6a1 1 0 0 1-1 1h-6a1 1 0 0 0 0 2zm-12-2H4a1 1 0 0 1-1-1v-6a1 1 0 0 0-2 0v6a3 3 0 0 0 3 3h6a1 1 0 0 0 0-2zm5-9v6a1 1 0 0 0 2 0v-6a1 1 0 0 0-2 0zm6-4v-1a1 1 0 0 0-2 0v1a1 1 0 0 0 2 0zm-6 1h1a1 1 0 0 0 0-2h-1a1 1 0 0 0 0 2zm-9 0h5a1 1 0 0 0 0-2H6a1 1 0 0 0 0 2zm18-2h1v1a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1h-2a1 1 0 0 0 0 2zm-9-5v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-2 0zm6 2v-1h1a1 1 0 0 0 0-2h-2a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0zM10 1H4a3 3 0 0 0-3 3v6a1 1 0 0 0 2 0V4a1 1 0 0 1 1-1h6a1 1 0 0 0 0-2zm12 2h6a1 1 0 0 1 1 1v6a1 1 0 0 0 2 0V4a3 3 0 0 0-3-3h-6a1 1 0 0 0 0 2zm-6 4h.996a1 1 0 0 0 0-2H16a1 1 0 0 0 0 2z" opacity="1" data-original="#6b00db" class=""></path></g></svg>     
    
    
    `
    return (
        <View style={{marginBottom:hScale(5)}}>
            <SvgXml xml={searchicon} width={size} height={size} />
        </View>
    );
};


export default ScanSvg;
