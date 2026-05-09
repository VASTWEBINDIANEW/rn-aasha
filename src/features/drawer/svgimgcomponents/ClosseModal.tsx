import React from "react";
import { View } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const ClosseModalSvg=({size=wScale(44)})=>{
const closse=`<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 152 152" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><g data-name="Layer 2"><g data-name="52.close"><path fill="#b8190c" d="M124.81 149.4a459 459 0 0 1-97.62 0A27.69 27.69 0 0 1 2.6 124.81a459 459 0 0 1 0-97.62A27.69 27.69 0 0 1 27.19 2.6a459 459 0 0 1 97.62 0 27.69 27.69 0 0 1 24.59 24.59 459 459 0 0 1 0 97.62 27.69 27.69 0 0 1-24.59 24.59z" data-name="background" opacity="1" data-original="#10720d" class=""></path><path fill="#d11100" d="M142.9 12.12C134.28 28 109 69.22 76 76c-32.4 6.72-57.8 47-67.09 63.65a27.66 27.66 0 0 1-6.31-14.84 460.34 460.34 0 0 1 0-97.62A27.69 27.69 0 0 1 27.19 2.6a460.34 460.34 0 0 1 97.62 0 27.71 27.71 0 0 1 18.09 9.52z" opacity="1" data-original="#138710" class=""></path><path fill="#ffffff" d="M76 82.97 44.97 114 38 107.03 69.03 76 38 44.97 44.97 38 76 69.03 107.03 38l6.97 6.97L82.97 76 114 107.03l-6.97 6.97z" opacity="1" data-original="#ffffff"></path></g></g></g></svg> `

return(
    <View>
        <SvgXml xml={closse} width={size} height={size}/>
    </View>
);

}

export default ClosseModalSvg;
