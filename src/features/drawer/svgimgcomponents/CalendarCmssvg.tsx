import React from "react";
import { View } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const CalendarCmssvg = ({
    size = wScale(30),
    month = "DEC",
    year = "2025",
}) => {

    const calendarSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">

  <!-- Background -->
  <rect x="3" y="6" width="42" height="38" rx="4" fill="#47cd58"/>

  <!-- Top white section -->
  <path d="M45 26V10a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v16z" fill="#ffffff"/>

  <!-- Bottom shade -->
  <path d="M36 40H7a4 4 0 0 1-4-4v4a4 4 0 0 0 4 4h34a4 4 0 0 0 4-4v-6z" fill="#329e40"/>

  <!-- Calendar hooks -->
  <g fill="#606060">
    <rect x="9" y="2" width="2" height="8" rx="1"/>
    <rect x="17" y="2" width="2" height="8" rx="1"/>
    <rect x="25" y="2" width="2" height="8" rx="1"/>
    <rect x="33" y="2" width="2" height="8" rx="1"/>
  </g>

  <!-- Month -->
  <text
    x="24"
    y="22"
    text-anchor="middle"
    font-size="8"
    font-weight="bold"
    fill="#329e40">
    ${month}
  </text>

  <!-- Year -->
  <text
    x="24"
    y="36"
    text-anchor="middle"
    font-size="11"
    font-weight="bold"
    fill="#ffffff">
    ${year}
  </text>

</svg>
`;

    return (
        <View>
            <SvgXml xml={calendarSvg} width={size} height={size} />
        </View>
    );
};

export default CalendarCmssvg;
