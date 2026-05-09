import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const CmsCompanySvg = ({ size = wScale(90), color = '#000' }) => {
    const svgname = `
    
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 48 48" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g transform="matrix(0.9500000000000003,0,0,0.9500000000000003,1.1999999999999886,1.1999999999999886)"><path d="M35 19v3h2v-3a3 3 0 0 0-3-3h-9V5a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v40a1 1 0 0 0 1 1h5V33a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v13h5a1 1 0 0 0 1-1V18h9a1 1 0 0 1 1 1zm-22 8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1zm0-8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1zm0-8a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1zm8 16a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1zm0-8a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1zm0-8a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1zM9 8h2v2H9zm0 8h2v2H9zm0 8h2v2H9zm8 0h2v2h-2zm0 9v13h-6V33a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1zm0-25h2v2h-2zm0 8h2v2h-2zm10 6v-2h6v2zm12 10a2 2 0 0 1-2-2v-6h-7a3 3 0 0 0-3 3v16a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V32zm2 9H31v-2h10zm0-4H31v-2h10zm-3-7v-5a1 1 0 0 1 .62-.92 1 1 0 0 1 1.09.21l5 5a1 1 0 0 1 .21 1.09A1 1 0 0 1 44 31h-5a1 1 0 0 1-1-1z" data-name="14 Survey Company, Building, Company" fill="${color}" opacity="1" data-original="#000000" class=""></path></g></svg>
`
    return (
        <View>
            <SvgXml xml={svgname} width={size} height={size} />
        </View>
    );
};


export default CmsCompanySvg;
