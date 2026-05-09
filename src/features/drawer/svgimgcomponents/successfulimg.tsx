import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const Successful = ({ size = wScale(80) }) => {
    const searchicon = `

    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 36 36" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><g fill-rule="evenodd"><path fill="#16782d" d="M18 8.89A9.11 9.11 0 1 0 27.11 18 9.12 9.12 0 0 0 18 8.89zm0 11.91a1.18 1.18 0 0 1-1.62 0l-3.19-3.19L14.82 16l2.38 2.38 4-4L22.79 16z" opacity="1" data-original="#072a30" class=""></path><path fill="#0ead55" d="M33.25 15.49c-1-1.46-2-3-2-3s-.35-1.79-.7-3.49A4.53 4.53 0 0 0 27 5.45l-3.5-.72-3-2a4.55 4.55 0 0 0-5 0l-3 2-3.5.72A4.53 4.53 0 0 0 5.45 9l-.72 3.51s-1 1.54-2 3a4.55 4.55 0 0 0 0 5c1 1.46 2 3 2 3s.36 1.8.72 3.51A4.53 4.53 0 0 0 9 30.55l3.51.72 3 2a4.55 4.55 0 0 0 5 0l3-2 3.49-.72A4.53 4.53 0 0 0 30.55 27l.72-3.51s1-1.54 2-3a4.55 4.55 0 0 0-.02-5zM18 29.39A11.39 11.39 0 1 1 29.39 18 11.41 11.41 0 0 1 18 29.39z" opacity="1" data-original="#43d685" class=""></path></g></g></svg>
 `
    return (
        <View>
            <SvgXml xml={searchicon} width={size} height={size} />
        </View>
    );
};


export default Successful;
