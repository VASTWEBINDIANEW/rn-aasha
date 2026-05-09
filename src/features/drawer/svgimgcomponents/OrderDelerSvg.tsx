import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const OrderDelerSvg = ({ size = wScale(40), color1 = '', color2 = '', }) => {
    const searchicon = `

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 64 64" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g transform="matrix(1,0,0,1,0,0)"><linearGradient id="a" x1="2" x2="62" y1="32" y2="32" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${color1}f"></stop><stop offset="1" stop-color="${color2}"></stop></linearGradient><path fill="url(#a)" d="M50.8 33.175a.396.396 0 0 0-.129-.015h-5.9a3.929 3.929 0 0 0 0 7.857h5.9a.396.396 0 0 0 .129-.014 1.322 1.322 0 0 0 1.2-1.321v-5.193a1.32 1.32 0 0 0-1.2-1.314zm-5.071 5.242a1.332 1.332 0 0 1 0-2.664 1.332 1.332 0 0 1 0 2.664zM41.37 20.046l2.208 4.329H30.764l9.322-4.75a1.844 1.844 0 0 0 1.164.421zm9.3 22.4a.97.97 0 0 0 .129-.007v1.2a4.736 4.736 0 0 1-4.729 4.735H25.914c7.316-6.47.756-18.524-8.671-15.807v-9.264a3.93 3.93 0 0 1 3.929-3.921H29.4l-2.8 1.428h-5.428a2.496 2.496 0 0 0 0 4.993h24.907a4.669 4.669 0 0 1 3.021 1.1 4.75 4.75 0 0 1 1.7 3.629v1.207a.97.97 0 0 0-.129-.007h-5.9c-7.083.245-7.097 10.463 0 10.714zM22.743 24.375c5.49-2.801 13.06-6.644 18.6-9.472a1.332 1.332 0 0 1 1.793.593l4.643 9.121a8.252 8.252 0 0 0-2.6-.242c-.596-1.14-2.28-4.541-2.872-5.608a.716.716 0 0 0-.878-.192.403.403 0 0 1-.529-.165.713.713 0 0 0-.957-.314L27.62 24.375zm-2.929 9.25a7.812 7.812 0 1 0 5.536 13.32 7.853 7.853 0 0 0-5.536-13.32zm3.872 8.528h-3.157v3.157a.714.714 0 0 1-1.429 0v-3.157h-3.164a.714.714 0 0 1 0-1.428H19.1v-3.158a.714.714 0 0 1 1.429 0v3.157h3.157a.714.714 0 0 1 0 1.43zM32 2a30 30 0 1 0 30 30A30.034 30.034 0 0 0 32 2zm0 58.291A28.291 28.291 0 1 1 60.292 32 28.324 28.324 0 0 1 32 60.291z" opacity="1" data-original="url(#a)" class=""></path></g></svg>

`
    return (
        <View>
            <SvgXml xml={searchicon} width={size} height={size} />
        </View>
    );
};


export default OrderDelerSvg;
