import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const MStateMentReporSvg = ({ size = wScale(40) }) => {
    const searchicon = `

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 64 64" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g transform="matrix(1.2599999999999998,0,0,1.2599999999999998,-8.319999999999993,-8.319999999999993)"><path fill="#ffd100" d="M48 10.5V49H21v4.5a2.5 2.5 0 0 1-5 0v-43A2.5 2.5 0 0 0 13.5 8h32a2.5 2.5 0 0 1 2.5 2.5z" opacity="1" data-original="#eeeded" class=""></path><path fill="#ffd100" d="M48 10.5V49H32V8h13.5a2.5 2.5 0 0 1 2.5 2.5zM16 15h-5v-4.5a2.5 2.5 0 1 1 5 0zM53 49v4.5a2.5 2.5 0 0 1-2.5 2.5h-32a2.5 2.5 0 0 0 2.5-2.5V49z" opacity="1" data-original="#dfe0df" class=""></path><path fill="#142322" d="M43 30c0 .55-.45 1-1 1H22c-.55 0-1-.45-1-1s.45-1 1-1h20c.55 0 1 .45 1 1zM43 34c0 .55-.45 1-1 1H22c-.55 0-1-.45-1-1s.45-1 1-1h20c.55 0 1 .45 1 1zM43 38c0 .55-.45 1-1 1H22c-.55 0-1-.45-1-1s.45-1 1-1h20c.55 0 1 .45 1 1zM43 42c0 .55-.45 1-1 1H22c-.55 0-1-.45-1-1s.45-1 1-1h20c.55 0 1 .45 1 1zM37 24c0 .55-.45 1-1 1h-8c-.55 0-1-.45-1-1s.45-1 1-1v-3c0-.55.45-1 1-1s1 .45 1 1v3h1v-3c0-.55.45-1 1-1s1 .45 1 1v3h1v-3c0-.55.45-1 1-1s1 .45 1 1v3c.55 0 1 .45 1 1z" opacity="1" data-original="#788e9b" class=""></path><path fill="#142322" d="M37 18.12v2.5H27v-2.5l5-3.74z" opacity="1" data-original="#788e9b" class=""></path><path fill="#ffd100" d="M53 49v4.5a2.5 2.5 0 0 1-2.5 2.5H32v-7z" opacity="1" data-original="#bcbcbb" class=""></path><g fill="#546e7a"><path d="M43 42c0 .55-.45 1-1 1H32v-2h10c.55 0 1 .45 1 1zM43 38c0 .55-.45 1-1 1H32v-2h10c.55 0 1 .45 1 1zM43 34c0 .55-.45 1-1 1H32v-2h10c.55 0 1 .45 1 1zM42 31H32v-2h10c.55 0 1 .45 1 1s-.45 1-1 1zM37 20.62v-2.5l-5-3.74V25h4c.55 0 1-.45 1-1s-.45-1-1-1v-2.38zM34 23h-1v-2.38h1z" fill="#142322" opacity="1" data-original="#546e7a" class=""></path></g></g></svg>

`
    return (
        <View>
            <SvgXml xml={searchicon} width={size} height={size} />
        </View>
    );
};


export default MStateMentReporSvg;
