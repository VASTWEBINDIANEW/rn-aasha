import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";
import { color } from "@rneui/base";

const DownloadSvg = ({ size = wScale(35), color = '#fff' }) => {
    const svgname = `

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 64 64" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g transform="matrix(1.0699999999999992,0,0,1.0699999999999992,-2.239987316131568,-2.23999958276746)"><g data-name="Download File"><path d="M52.004 15.584 41.25 4.866A2.948 2.948 0 0 0 39.154 4H14.072a3.049 3.049 0 0 0-2.992 3.096v49.546A3.362 3.362 0 0 0 14.438 60h35.123a3.362 3.362 0 0 0 3.359-3.358V17.814a3.168 3.168 0 0 0-.916-2.23Zm-2.613.22h-8.784a1.027 1.027 0 0 1-.967-1.076V6.151a.954.954 0 0 1 .198.132Zm1.529 40.838A1.36 1.36 0 0 1 49.562 58H14.439a1.36 1.36 0 0 1-1.359-1.358V7.096A1.05 1.05 0 0 1 14.072 6H37.64v8.728a3.027 3.027 0 0 0 2.967 3.076h10.311l.002.01Z" fill="${color}" opacity="1" data-original="#000000" class=""></path><path d="M30.918 40.487a1.45 1.45 0 0 0 2.053 0l5.81-5.811a1 1 0 0 0-1.413-1.414l-4.424 4.423V21.822a1 1 0 1 0-2 0v15.863l-4.312-4.312a1 1 0 1 0-1.414 1.414ZM38.312 41.877H25.688a1 1 0 1 0 0 2h12.625a1 1 0 0 0 0-2Z" fill="${color}" opacity="1" data-original="#000000" class=""></path></g></g></svg>
    `;
    return (
        <View>
            <SvgXml xml={svgname} width={size} height={size} />
        </View>
    );
};


export default DownloadSvg;
