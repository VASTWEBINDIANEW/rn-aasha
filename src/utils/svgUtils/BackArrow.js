import React from 'react';
import {View} from 'react-native';
import {SvgXml} from 'react-native-svg';

const BackArrow = ({color = 'black', size = 34}) => {
  const BackArrowImg = `<svg id="Layer_2" height="512" viewBox="0 0 512 512" width="512" xmlns="http://www.w3.org/2000/svg" data-name="Layer 2"><g id="Icon" fill="rgb(255,255,255)"><path id="_143" d="m362 0h-212c-82.8 0-150 67.2-150 150v212c0 82.8 67.2 150 150 150h212c82.8 0 150-67.2 150-150v-212c0-82.8-67.2-150-150-150zm140 362c0 77.2-62.8 140-140 140h-212c-77.2 0-140-62.8-140-140v-212c0-77.2 62.8-140 140-140h212c77.2 0 140 62.8 140 140zm-86-148h-167.86l14.93-14.93c1.88-1.88 2.93-4.42 2.93-7.07v-96c0-4.04-2.44-7.69-6.17-9.24-1.24-.51-2.54-.76-3.83-.76-2.6 0-5.16 1.02-7.07 2.93l-160 160c-3.91 3.91-3.91 10.24 0 14.14l160 160c1.91 1.91 4.47 2.93 7.07 2.93 1.29 0 2.59-.25 3.83-.76 3.74-1.55 6.17-5.19 6.17-9.24v-96c0-2.65-1.05-5.2-2.93-7.07l-14.93-14.93h167.86c5.52 0 10-4.48 10-10v-64c0-5.52-4.48-10-10-10zm0 74h-192l32 32v96l-160-160 160-160v96l-32 32h192z" data-name="143"/></g></svg>    

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><circle r="256" cx="256" cy="256" fill="#fff" shape="circle"></circle><g transform="matrix(0.85,0,0,0.85,38.400000000000006,38.400000000000006)"><linearGradient id="a" x1="74.98" x2="437.02" y1="74.98" y2="437.02" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fe8276"></stop><stop offset="1" stop-color="#ff4670"></stop></linearGradient><path fill="url(#a)" d="M256 0C114.61 0 0 114.61 0 256s114.61 256 256 256c141.38 0 256-114.61 256-256S397.39 0 256 0zm0 462c-113.59 0-206-92.41-206-206S142.41 50 256 50s206 92.41 206 206-92.41 206-206 206zm-35.73-241.73h178.64v71.46H220.27v59.55l-107.18-95.27 107.18-95.27v59.55z" data-name="7" opacity="1" data-original="url(#a)" class=""></path></g></svg>`;

  return (
    <View style={{}}>
      <SvgXml xml={BackArrowImg} width={size} height={size} />
    </View>
  );
};

export default BackArrow;
