import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const CmsReferredPointsSvg = ({ size = wScale(90), color = '#000' }) => {
    const svgname = `
    
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 134 134" style="enable-background:new 0 0 512 512" xml:space="preserve" fill-rule="evenodd" class=""><g><path d="M53.824 76.763 23.951 91.699c-8.711.542-15.618 7.788-15.618 16.634C8.333 117.532 15.801 125 25 125s16.667-7.468 16.667-16.667c0-5.273-2.455-9.978-6.283-13.033L62.5 81.742v10.451c-7.185 1.852-12.5 8.38-12.5 16.14C50 117.532 57.468 125 66.667 125c9.198 0 16.666-7.468 16.666-16.667 0-7.76-5.314-14.288-12.5-16.14V81.742L97.95 95.3c-3.829 3.055-6.283 7.76-6.283 13.033 0 9.199 7.468 16.667 16.666 16.667 9.199 0 16.667-7.468 16.667-16.667 0-8.846-6.907-16.092-15.618-16.634L79.509 76.763c13.207-5.148 22.574-17.995 22.574-33.013 0-19.547-15.869-35.417-35.416-35.417S31.25 24.203 31.25 43.75c0 15.018 9.368 27.865 22.574 33.013zm33.625-15.654A26.97 26.97 0 0 0 93.75 43.75c0-14.948-12.136-27.083-27.083-27.083-14.948 0-27.084 12.135-27.084 27.083a26.97 26.97 0 0 0 6.301 17.359C50.371 54.412 58.007 50 66.667 50c8.659 0 16.296 4.412 20.782 11.109zM66.667 20.833c-6.899 0-12.5 5.601-12.5 12.5s5.601 12.5 12.5 12.5 12.5-5.601 12.5-12.5-5.601-12.5-12.5-12.5z" fill="${color}" opacity="1" data-original="#000000" class=""></path></g></svg>


`
    return (
        <View>
            <SvgXml xml={svgname} width={size} height={size} />
        </View>
    );
};


export default CmsReferredPointsSvg;
