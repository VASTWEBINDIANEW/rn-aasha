import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const NetBanksvg = ({ size = wScale(40) }) => {
    const svgname = `

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 64 64" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g transform="matrix(0.99,0,0,0.99,0.3200000000000003,0.3200002861022959)"><linearGradient id="a" x1="32" x2="32" y1="61.656" y2="4.004" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#006df0"></stop><stop offset="1" stop-color="#00e7f0"></stop></linearGradient><linearGradient xlink:href="#a" id="b" x1="7.5" x2="7.5" y1="61.656" y2="4.004"></linearGradient><linearGradient xlink:href="#a" id="c" x1="12.5" x2="12.5" y1="61.656" y2="4.004"></linearGradient><linearGradient xlink:href="#a" id="d" x1="17.5" x2="17.5" y1="61.656" y2="4.004"></linearGradient><g data-name="Layer 12"><path fill="url(#a)" d="M29 20a3 3 0 1 0 3-3 3 3 0 0 0-3 3zm4 0a1 1 0 1 1-1-1 1 1 0 0 1 1 1z" opacity="1" data-original="url(#a)"></path><path fill="url(#a)" d="M62 51V5a3.009 3.009 0 0 0-3-3H5a3.009 3.009 0 0 0-3 3v46a3.009 3.009 0 0 0 3 3h36.68l.31 2.19a.986.986 0 0 0 .67.81 1.028 1.028 0 0 0 1.03-.24l2.82-2.83 7.78 7.78a1.014 1.014 0 0 0 1.42 0l5.65-5.66a1 1 0 0 0 .3-.71.976.976 0 0 0-.3-.7l-.98-.99A2.982 2.982 0 0 0 62 51zM39 40v-4a2.006 2.006 0 0 1 2-2 2.015 2.015 0 0 1 2 2v4zm9-14v2H16v-2zm-31.28-2L32 15.16 47.28 24zm27.11 9.17A4 4 0 0 0 37 36v4h-1v-4a4 4 0 0 0-8 0v4h-1v-4a4 4 0 0 0-8 0v4h-1V30h28v10h-1v-4a4 4 0 0 0-1.17-2.83zM34 36v4h-4v-4a2 2 0 0 1 4 0zm-9 0v4h-4v-4a2 2 0 0 1 4 0zm14.96 6 .29 2H16v-2zm.57 4 .29 2H14v-2zM55 59.59l-7.78-7.78a.978.978 0 0 0-1.41 0l-2.12 2.12-1.65-11.55 11.55 1.65-2.13 2.12a1 1 0 0 0 0 1.41l7.78 7.78zM60 51a1 1 0 0 1-1 1h-.27l-5.14-5.14 2.82-2.83a.994.994 0 0 0 .25-1.02 1.028 1.028 0 0 0-.81-.68L48 41.21V30h1a1 1 0 0 0 1-1v-3h1a1 1 0 0 0 .97-.74 1.022 1.022 0 0 0-.47-1.13l-19-11a1.044 1.044 0 0 0-1 0l-19 11a1.022 1.022 0 0 0-.47 1.13A1 1 0 0 0 13 26h1v3a1 1 0 0 0 1 1h1v10h-1a1 1 0 0 0-1 1v3h-1a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h28.1l.29 2H5a1 1 0 0 1-1-1V12h56zm0-41H4V5a1 1 0 0 1 1-1h54a1 1 0 0 1 1 1z" opacity="1" data-original="url(#a)"></path><path fill="url(#b)" d="M8 6H7a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2z" opacity="1" data-original="url(#b)"></path><path fill="url(#c)" d="M13 6h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2z" opacity="1" data-original="url(#c)"></path><path fill="url(#d)" d="M18 6h-1a1 1 0 0 0 0 2h1a1 1 0 0 0 0-2z" opacity="1" data-original="url(#d)"></path></g></g></svg>


`
    return (
        <View>
            <SvgXml xml={svgname} width={size} height={size} />
        </View>
    );
};


export default NetBanksvg;
