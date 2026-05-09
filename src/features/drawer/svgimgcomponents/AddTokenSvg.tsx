import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const AddTokenSvg = ({ size = wScale(40),color1='#fff',color2='', }) => {
    const searchicon = `

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 64 64" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g transform="matrix(1,0,0,1,0,0)"><linearGradient id="a" x1="2" x2="62" y1="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${color1}"></stop><stop offset="1" stop-color="${color2}"></stop></linearGradient><path fill="url(#a)" d="M54.288 24.582 35.95 42.92 21.08 28.05 39.418 9.712a2.445 2.445 0 0 1 3.45 0l11.42 11.42a2.445 2.445 0 0 1 0 3.45zm-34.37 4.63 14.87 14.87-1.742 1.743-1.627-1.627a.821.821 0 0 0-1.162 1.162l1.627 1.626-7.302 7.302a2.445 2.445 0 0 1-3.45 0l-2.852-2.852a.819.819 0 0 1 0-1.162 3.22 3.22 0 1 0-4.554-4.554.819.819 0 0 1-1.162 0l-2.852-2.852a2.445 2.445 0 0 1 0-3.45l7.302-7.302 1.626 1.627a.821.821 0 0 0 1.162-1.162l-1.627-1.627zm5.693 11.501 2.323 2.323a.821.821 0 0 0 1.162-1.161l-2.324-2.324a.821.821 0 0 0-1.161 1.162zm-4.647-4.647 2.323 2.323a.821.821 0 1 0 1.162-1.161l-2.324-2.324a.821.821 0 1 0-1.161 1.162zM62 32A30 30 0 1 1 32 2a30.034 30.034 0 0 1 30 30zm-1.709 0A28.291 28.291 0 1 0 32 60.291 28.323 28.323 0 0 0 60.291 32z" opacity="1" data-original="url(#a)" class=""></path></g></svg>
`
    return (
        <View>
            <SvgXml xml={searchicon} width={size} height={size} />
        </View>
    );
};


export default AddTokenSvg;
