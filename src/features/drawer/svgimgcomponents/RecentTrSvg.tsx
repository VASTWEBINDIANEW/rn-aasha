import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";
import { color } from "@rneui/base";

const RecentTrSvg = ({ size = wScale(84), color = '#fff' }) => {
    const svgname = `

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 32 32" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g transform="matrix(0.9700000000000001,0,0,0.9700000000000001,0.47249999999999837,0.47999997138977335)"><g fill="#000"><path d="M.5 16C.5 7.44 7.44.5 16 .5c.75 0 1.49.053 2.212.157a1.5 1.5 0 1 1-.424 2.97A12.619 12.619 0 0 0 16 3.5C9.096 3.5 3.5 9.096 3.5 16S9.096 28.5 16 28.5c.608 0 1.204-.043 1.788-.127a1.5 1.5 0 1 1 .424 2.97c-.723.104-1.462.157-2.212.157C7.44 31.5.5 24.56.5 16zM23 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM27 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM29 11a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM29 17a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM25 24a2 2 0 1 1 4 0 2 2 0 0 1-4 0zM21 28a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" fill=${color} opacity="1" data-original="#000000" class=""></path><path d="M16 6.5A1.5 1.5 0 0 0 14.5 8v7.379l-3.56 3.56a1.5 1.5 0 0 0 2.12 2.122l4-4A1.5 1.5 0 0 0 17.5 16V8A1.5 1.5 0 0 0 16 6.5z" fill=${color} opacity="1" data-original="#000000" class=""></path></g></g></svg>

`;
    return (
        <View>
            <SvgXml xml={svgname} width={size} height={size} />
        </View>
    );
};


export default RecentTrSvg;
