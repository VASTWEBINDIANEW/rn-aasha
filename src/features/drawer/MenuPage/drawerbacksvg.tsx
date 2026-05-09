import React from 'react';
import {View} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {RootState} from '../../../reduxUtils/store';
import {useSelector} from 'react-redux';
const BackArrow = ({size = 20}) => {
  const {colorConfig} = useSelector((state: RootState) => state.userInfo);

  const BackArrowImg = `
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="20" height="20" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><linearGradient id="a" x1="219.858" x2="478.003" y1="387.123" y2="128.977" gradientTransform="matrix(1 0 0 -1 0 514.05)" gradientUnits="userSpaceOnUse"><stop stop-opacity="1" stop-color="${colorConfig.secondaryColor}" offset="0.004629617637840665"></stop><stop stop-opacity="1" stop-color="${colorConfig.secondaryColor}" offset="1"></stop></linearGradient><path fill="url(#a)" d="M385.1 405.7c20 20 20 52.3 0 72.3s-52.3 20-72.3 0L126.9 292.1c-20-20-20-52.3 0-72.3L312.8 34c20-20 52.3-20 72.3 0s20 52.3 0 72.3L235.4 256z" opacity="1" data-original="url(#a)" class=""></path></g></svg>

`;

  return (
    <View style={{}}>
      <SvgXml xml={BackArrowImg} width={size} height={size} style={{}} />
    </View>
  );
};

export default BackArrow;
