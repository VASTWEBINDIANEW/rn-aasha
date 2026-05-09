import { translate } from "../../../utils/languageUtils/I18n";
import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const DayEarnsvg = ({ size = wScale(40) }) => {
    const searchicon = `

<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!-- Created with Inkscape (http://www.inkscape.org/) -->

<svg
   version="1.1"
   id="svg54"
   xml:space="preserve"
   width="682.66669"
   height="682.66669"
   viewBox="0 0 682.66669 682.66669"
   xmlns="http://www.w3.org/2000/svg"
   xmlns:svg="http://www.w3.org/2000/svg"><defs
     id="defs58"><clipPath
       clipPathUnits="userSpaceOnUse"
       id="clipPath68"><path
         d="M 0,512 H 512 V 0 H 0 Z"
         id="path66" /></clipPath></defs><g
     id="g60"
     transform="matrix(1.3333333,0,0,-1.3333333,0,682.66667)"><g
       id="g62"><g
         id="g64"
         clip-path="url(#clipPath68)"><g
           id="g70"
           transform="translate(256,15)"><path
             d="M 0,0 C 132.738,0 241,108.262 241,241 241,373.738 132.738,482 0,482 -132.738,482 -241,373.738 -241,241 -241,108.262 -132.738,0 0,0 Z"
             style="fill:none;stroke:#000000;stroke-width:30;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:22.926;stroke-dasharray:none;stroke-opacity:1"
             id="path72" /></g><g
           id="g74"
           transform="translate(175.501,369.0005)"><path
             d="m 0,0 h 51.999 c 33,0 60,-27 60,-60 0,-33 -27.001,-60 -60,-60 H -10 l 123.999,-146"
             style="fill:none;stroke:#000000;stroke-width:30;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:22.926;stroke-dasharray:none;stroke-opacity:1"
             id="path76" /></g><g
           id="g78"
           transform="translate(164.5,369.0005)"><path
             d="M 0,0 H 183"
             style="fill:none;stroke:#000000;stroke-width:30;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:22.926;stroke-dasharray:none;stroke-opacity:1"
             id="path80" /></g><g
           id="g82"
           transform="translate(164.5,308.9995)"><path
             d="M 0,0 H 183"
             style="fill:none;stroke:#000000;stroke-width:30;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:22.926;stroke-dasharray:none;stroke-opacity:1"
             id="path84" /></g></g></g></g></svg>





`
    return (
        <View>
            <SvgXml xml={searchicon} width={size} height={size} />
        </View>
    );
};


export default DayEarnsvg;
