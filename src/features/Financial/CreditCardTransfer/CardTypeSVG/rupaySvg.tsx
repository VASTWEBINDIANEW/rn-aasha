import React from 'react';
import Svg, {Path, Rect, Text as SvgText, Defs, LinearGradient, Stop} from 'react-native-svg';

const RupayLogo = ({width = 60, height = 30}) => {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 482.51 241.25"
      fill="none"
    >
      <Defs>
        <LinearGradient id="arrowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#0C4E9B" />
          <Stop offset="45%" stopColor="#0C4E9B" />
          <Stop offset="55%" stopColor="#F17B21" />
          <Stop offset="100%" stopColor="#F17B21" />
        </LinearGradient>
      </Defs>

      {/* Background card */}
      <Rect
        x="0"
        y="0"
        width="482.51"
        height="241.25"
        rx="24"
        fill="#FFFFFF"
      />

      {/* "Ru" text */}
      <SvgText
        x="30"
        y="150"
        fontSize="90"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
        fill="#0C4E9B"
      >
        Ru
      </SvgText>

      {/* Arrow / chevron flag flowing through the wordmark */}
      <Path
        d="M215 70 L275 70 L245 120 L275 170 L215 170 L245 120 Z"
        fill="url(#arrowGradient)"
      />

      {/* "ay" text (completing "Pay") */}
      <SvgText
        x="330"
        y="150"
        fontSize="90"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
        fill="#F17B21"
      >
        ay
      </SvgText>
    </Svg>
  );
};

export default RupayLogo;