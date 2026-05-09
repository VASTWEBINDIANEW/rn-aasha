import React from 'react';
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { RootState } from '../../../reduxUtils/store';
import { useSelector } from 'react-redux';
const ShowEye = ({ size = 32,color1, color2 }) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  // const color1 = `${colorConfig.primaryColor}05`;
  // const color2 = `${colorConfig.secondaryColor}80`;

  const defaultColor1 = `${colorConfig.primaryColor}05`;
  const defaultColor2 = `${colorConfig.secondaryColor}80`;

  const finalColor1 = color1 || defaultColor1;
  const finalColor2 = color2 || defaultColor2;
  const BackArrowImg = `
  <svg id="Capa_1" enable-background="new 0 0 512 512" height="512" viewBox="0 0 512 512" width="512" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><linearGradient id="SVGID_1_" gradientUnits="userSpaceOnUse" x1="256" x2="256" y1="436" y2="76"><stop offset="0" stop-color="${finalColor1}"/><stop offset="1" stop-color="${finalColor2}"/></linearGradient><g><g><path d="m505.409 245.423c-19.613-31.476-119.42-169.423-249.409-169.423-129.96 0-229.794 137.945-249.409 169.423l-6.591 10.577 6.591 10.577c19.613 31.476 119.42 169.423 249.409 169.423 129.96 0 229.794-137.944 249.409-169.423l6.591-10.577zm-249.409 150.577c-100.836 0-183.862-105.754-208.108-140.016 24.201-34.29 107.014-139.984 208.108-139.984 100.829 0 183.851 105.739 208.108 140.016-24.201 34.291-107.014 139.984-208.108 139.984zm0-240c-55.141 0-100 44.86-100 100s44.859 100 100 100 100-44.86 100-100-44.859-100-100-100zm0 160c-33.084 0-60-26.916-60-60s26.916-60 60-60 60 26.916 60 60-26.916 60-60 60z" fill="url(#SVGID_1_)"/></g></g></svg>
`;

  return (
    <View style={{}}>
      <SvgXml xml={BackArrowImg} width={size} height={size} style={{}} />
    </View>
  );
};

export default ShowEye;
