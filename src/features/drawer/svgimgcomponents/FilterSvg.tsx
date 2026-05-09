import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const FilterSvg = ({ size = wScale(40),color="#fff" }) => {
    const svgimg = `

<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><g id="Layer_9" data-name="Layer 9" fill='${color}'><path d="m26 13a1 1 0 0 1 -1 1h-18a1 1 0 0 1 0-2h18a1 1 0 0 1 1 1zm2-7h-24a1 1 0 0 0 0 2h24a1 1 0 0 0 0-2zm-6 12h-12a1 1 0 0 0 0 2h12a1 1 0 0 0 0-2zm-3 6h-6a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2z"/></g></svg>

`
    return (
        <View>
            <SvgXml xml={svgimg} width={size} height={size} />
        </View>
    );
};


export default FilterSvg;
