import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const UserDelerSvg = ({ size = wScale(40),color1='',color2='', }) => {
    const searchicon = `

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 64 64" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g transform="matrix(0.9999999999999999,0,0,0.9999999999999999,3.552713678800501e-15,3.552713678800501e-15)"><linearGradient id="a" x1="2" x2="62" y1="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${color1}"></stop><stop offset="1" stop-color="${color2}"></stop></linearGradient><path fill="url(#a)" d="M19.607 22.676c.493-11.91 17.463-11.91 17.957 0a8.978 8.978 0 0 1-17.957 0zM52 39.382c.053 7.971-9.964 11.919-15.343 6.094A8.882 8.882 0 1 1 52 39.382zm-4.936-.714h-3.236v-3.235a.714.714 0 0 0-1.428 0v3.235h-3.236a.714.714 0 1 0 0 1.429H42.4v3.236a.714.714 0 0 0 1.428 0v-3.236h3.236a.714.714 0 0 0 0-1.429zm-11.157-6.664-1.721-.571a10.328 10.328 0 0 1-11.2 0l-5.75 1.921A7.651 7.651 0 0 0 12 40.618v3.593a2.7 2.7 0 0 0 2.7 2.693h21.364a10.306 10.306 0 0 1-.157-14.9zM62 32A30 30 0 1 1 32 2a30.034 30.034 0 0 1 30 30zm-1.708 0A28.292 28.292 0 1 0 32 60.291 28.324 28.324 0 0 0 60.292 32z" opacity="1" data-original="url(#a)"></path></g></svg>


`
    return (
        <View>
            <SvgXml xml={searchicon} width={size} height={size} />
        </View>
    );
};


export default UserDelerSvg;
