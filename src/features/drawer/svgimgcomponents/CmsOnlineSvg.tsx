import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const CmsOnlineSvg = ({ size = wScale(90), color = '#000' }) => {
    const svgname = `
    

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 173.397 173.397" style="enable-background:new 0 0 512 512" xml:space="preserve" fill-rule="evenodd" class=""><g><path d="M10.499 79.013h152.4V91.16h-152.4zM24.6 146.452h124.198v14.145H24.6zM29.471 143.065l-9.83-48.519h31.832l4.915 48.519zm25.396-48.519h30.138v48.519H59.782zm33.525 0h30.139l-4.915 48.519H88.392zm33.532 0h31.832l-9.83 48.519H117.01zM31.46 65.407l3.59-5.927h19.917l3.59 5.927zM25.682 26.828h38.652c3.037 0 5.522 2.485 5.522 5.522V50.57c0 3.037-2.484 5.522-5.522 5.522H25.682c-3.037 0-5.521-2.485-5.521-5.522V32.35c0-3.037 2.484-5.522 5.521-5.522zM68.201 75.626H21.816v-3.417a3.426 3.426 0 0 1 3.416-3.416h39.553A3.426 3.426 0 0 1 68.2 72.21zM153.237 75.626h-48.04V61.993c0-7.498 6.135-13.632 13.633-13.632h20.774c7.498 0 13.633 6.134 13.633 13.632zM129.217 12.8c7.818 0 14.155 6.338 14.155 14.156s-6.337 14.155-14.155 14.155c-7.817 0-14.155-6.338-14.155-14.155S121.4 12.8 129.217 12.8z" fill="${color}" opacity="1" data-original="#000000" class=""></path></g></svg>

`
    return (
        <View>
            <SvgXml xml={svgname} width={size} height={size} />
        </View>
    );
};


export default CmsOnlineSvg;
