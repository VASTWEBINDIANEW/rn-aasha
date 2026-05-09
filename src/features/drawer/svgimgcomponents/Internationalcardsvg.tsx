import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const Internationalcardsvg = ({ size = wScale(40) }) => {
    const svgname = `
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 480 480.078" style="enable-background:new 0 0 512 512" xml:space="preserve"><g transform="matrix(0.9200000000000003,0,0,0.9200000000000003,19.204169188439806,19.202878875732324)"><linearGradient id="a"><stop offset="0" stop-color="#006df0"></stop><stop offset="1" stop-color="#00e7f0"></stop></linearGradient><linearGradient xlink:href="#a" id="b" x1="240.064" x2="240.064" y1="497.23" y2="-13.594" gradientUnits="userSpaceOnUse"></linearGradient><linearGradient xlink:href="#a" id="c" x1="336.064" x2="336.064" y1="497.23" y2="-13.594" gradientUnits="userSpaceOnUse"></linearGradient><linearGradient xlink:href="#a" id="d" x1="400.064" x2="400.064" y1="497.23" y2="-13.594" gradientUnits="userSpaceOnUse"></linearGradient><linearGradient xlink:href="#a" id="e" x1="272.064" x2="272.064" y1="497.23" y2="-13.594" gradientUnits="userSpaceOnUse"></linearGradient><linearGradient xlink:href="#a" id="f" x1="208.064" x2="208.064" y1="497.23" y2="-13.594" gradientUnits="userSpaceOnUse"></linearGradient><path fill="url(#b)" d="M440.063 256.078h-29.711c21.804-91.582-20.645-186.387-103.485-231.113-82.84-44.727-185.394-28.211-250.004 40.258a204.6 204.6 0 0 0-30.617 41.75A207.85 207.85 0 0 0 11.56 276.238a207.843 207.843 0 0 0 116.504 123.664v40.176c.027 22.082 17.921 39.973 40 40h272c22.082-.027 39.976-17.918 40-40v-144c-.024-22.082-17.918-39.973-40-40zm-107.489 0a334.457 334.457 0 0 0 3.32-40h63.891a191.421 191.421 0 0 1-5.937 40zm-188.512 64h320v16h-320zm-26.648 0h10.648v21.719a207.305 207.305 0 0 1-10.648-21.719zm10.648-24v8h-16.8a298.997 298.997 0 0 1-15.094-88h103.894v40h-32c-22.078.027-39.972 17.918-40 40zm-111.687-80h63.824a315.783 315.783 0 0 0 14.137 88H42.055a191.68 191.68 0 0 1-25.68-88zm383.488-16h-63.926a316.47 316.47 0 0 0-11.93-80h54.618a190.688 190.688 0 0 1 21.238 80zm-79.918 0H216.062v-80h91.497a303.17 303.17 0 0 1 12.386 80zm-103.883-96V16.621c36.083 4.395 67.473 38.176 86.075 87.457zm-16-87.457v87.457h-86.07c18.598-49.281 49.992-83.062 86.07-87.457zm0 103.457v80H96.184a303.165 303.165 0 0 1 12.382-80zm16 96h103.833a316.118 316.118 0 0 1-3.504 40H216.062zm153.266-112H318.84a191.58 191.58 0 0 0-48.375-77.543 192.897 192.897 0 0 1 98.863 77.543zm-300.8-27.863a190.407 190.407 0 0 1 77.136-49.672 191.553 191.553 0 0 0-48.375 77.535H46.664A190.104 190.104 0 0 1 68.52 76.215zM37.52 120.078H92.12a316.296 316.296 0 0 0-11.93 80h-63.87a191.61 191.61 0 0 1 21.199-80zm15 200h47.44a204.827 204.827 0 0 0 28.102 50.594v11.805a191.695 191.695 0 0 1-75.542-62.399zm411.543 120c0 13.254-10.743 24-24 24h-272c-13.254 0-24-10.746-24-24v-88h320zm-320-136v-8c0-13.254 10.746-24 24-24h272c13.257 0 24 10.746 24 24v8zm0 0" opacity="1" data-original="url(#b)"></path><path fill="url(#c)" d="M320.063 416.078h32v16h-32zm0 0" opacity="1" data-original="url(#c)"></path><path fill="url(#d)" d="M384.063 416.078h32v16h-32zm0 0" opacity="1" data-original="url(#d)"></path><path fill="url(#e)" d="M256.063 416.078h32v16h-32zm0 0" opacity="1" data-original="url(#e)"></path><path fill="url(#f)" d="M192.063 416.078h32v16h-32zm0 0" opacity="1" data-original="url(#f)"></path></g></svg>

`
    return (
        <View>
            <SvgXml xml={svgname} width={size} height={size} />
        </View>
    );
};


export default Internationalcardsvg;
