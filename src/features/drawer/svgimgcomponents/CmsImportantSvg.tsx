import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const CmsImportantSvg = ({ size = wScale(90), color = '#000' }) => {
    const svgname = `
    
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 64 64" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g transform="matrix(0.9200000000000003,0,0,0.9200000000000003,2.5599767303466656,2.55500027656554)"><path d="m57.5 53.6-5.8-23.1V11.7c0-.3-.2-.5-.5-.5h-7.9l3.1-3.1.5.5c.3.3.8.5 1.2.5.5 0 .9-.2 1.2-.5l.5-.5c.3-.3.5-.8.5-1.2 0-.5-.2-.9-.5-1.2L44.6.5c-.7-.7-1.8-.7-2.5 0l-.4.5c-.3.3-.5.8-.5 1.2 0 .5.2.9.5 1.2l.6.6-4.1 4-1.1-1c-.8-.8-2.2-.8-3 0s-.8 2.2 0 3l1.7 1.7H12.7c-.3 0-.5.2-.5.5v3.2l-5.4 1.9c-.2.1-.4.3-.3.6l5.7 21.5v19.9c0 .3.2.5.5.5h4.9l1 3.7c.1.2.3.4.5.4h.1L35 59.8h16.2c.3 0 .5-.2.5-.5v-3.8l5.4-1.4c.3 0 .5-.2.4-.5zM43 4.7l2.7 2.7-3.8 3.8h-.6l-2.4-2.4zm7.7 54.2H13.3V12.7H37l.1.1-4.3 4.3c-.2.2-.2.5 0 .7.1.1.2.1.3.1s.3 0 .3-.1l4.3-4.3 2.8 2.8c.4.4 1 .6 1.5.6s1.1-.2 1.5-.6c.8-.8.8-2.2 0-3l-1.1-1.1h8.5v46.7z" fill="${color}" opacity="1" data-original="#000000" class=""></path><path d="M19.6 25.4h24.1c.3 0 .5-.2.5-.5v-4.2c0-.3-.2-.5-.5-.5H19.6c-.3 0-.5.2-.5.5v4.2c0 .3.2.5.5.5zM22.1 30.9c-.3 0-.5.2-.5.5s.2.5.5.5h18.6c.3 0 .5-.2.5-.5s-.2-.5-.5-.5zM46.2 37.2H25.8c-.3 0-.5.2-.5.5s.2.5.5.5h20.4c.3 0 .5-.2.5-.5s-.2-.5-.5-.5zM17.7 43.6H36c.3 0 .5-.2.5-.5s-.2-.5-.5-.5H17.7c-.3 0-.5.2-.5.5s.2.5.5.5zM46.2 42.6h-6.6c-.3 0-.5.2-.5.5s.2.5.5.5h6.6c.3 0 .5-.2.5-.5s-.2-.5-.5-.5zM26.9 47.3h-9.2c-.3 0-.5.2-.5.5s.2.5.5.5h9.2c.3 0 .5-.2.5-.5s-.3-.5-.5-.5zM37.2 47.3h-6.7c-.3 0-.5.2-.5.5s.2.5.5.5h6.7c.3 0 .5-.2.5-.5s-.2-.5-.5-.5z" fill="${color}" opacity="1" data-original="#000000" class=""></path></g></svg>


`
    return (
        <View>
            <SvgXml xml={svgname} width={size} height={size} />
        </View>
    );
};


export default CmsImportantSvg;
