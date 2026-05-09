// components/SkeletonCard.tsx

import React from "react";
import SkeletonPlaceholder from "react-native-skeleton-placeholder";
import { wScale, hScale } from '../utils/styles/dimensions';
import { useSelector } from 'react-redux';
import { RootState } from "../reduxUtils/store"; // ✅ Path sahi check karlein

type SkeletonCardProps = {
  highlightColor?: string; // ✅ Optional banaya hai fallback ke liye
};

const SkeletonCard = ({ highlightColor }: SkeletonCardProps) => {
  // ✅ Redux se data nikalne ke liye function body {} aur return zaroori hai
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  const primaryColor = colorConfig?.primaryColor;
  // Agar props se highlightColor nahi aata toh primary color ka 30% alpha use hoga
  const finalHighlight = highlightColor || (primaryColor + '30');

  return (
    <SkeletonPlaceholder
      borderRadius={16}
      speed={1200}
      backgroundColor="#F3F4F6"
      highlightColor={finalHighlight}
    >
      <SkeletonPlaceholder.Item
        flexDirection="row"
        alignItems="center"
        backgroundColor="#fff"
        borderRadius={16}
        marginBottom={hScale(10)}
        paddingVertical={hScale(12)}
        paddingRight={wScale(14)}
        // overflow="hidden" // SkeletonPlaceholder ke Item par kabhi kabhi overflow issue karta hai
      >
        {/* Accent bar */}
        <SkeletonPlaceholder.Item
          width={4}
          height={hScale(68)}
          borderRadius={4}
          marginRight={wScale(12)}
        />

        {/* Avatar */}
        <SkeletonPlaceholder.Item
          width={wScale(44)}
          height={wScale(44)}
          borderRadius={12}
          marginRight={wScale(10)}
        />

        {/* Middle: operator + number + time */}
        <SkeletonPlaceholder.Item flex={1}>
          <SkeletonPlaceholder.Item
            width="58%"
            height={hScale(13)}
            borderRadius={6}
          />
          <SkeletonPlaceholder.Item
            width="42%"
            height={hScale(12)}
            borderRadius={6}
            marginTop={hScale(7)}
          />
          <SkeletonPlaceholder.Item
            width="28%"
            height={hScale(10)}
            borderRadius={6}
            marginTop={hScale(6)}
          />
        </SkeletonPlaceholder.Item>

        {/* Right: amount + pill */}
        <SkeletonPlaceholder.Item alignItems="flex-end">
          <SkeletonPlaceholder.Item
            width={wScale(62)}
            height={hScale(14)}
            borderRadius={6}
          />
          <SkeletonPlaceholder.Item
            width={wScale(52)}
            height={hScale(22)}
            borderRadius={20}
            marginTop={hScale(8)}
          />
        </SkeletonPlaceholder.Item>
      </SkeletonPlaceholder.Item>
    </SkeletonPlaceholder>
  );
};

export default SkeletonCard;