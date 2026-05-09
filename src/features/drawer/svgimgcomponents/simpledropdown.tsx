import React from 'react';
import {SvgXml} from 'react-native-svg';
import { wScale } from '../../../utils/styles/dimensions';

const OnelineDropdownSvg =  ({ size = wScale(24),color="#000" }) => {
    const dropdown = `<svg xmlns="http://www.w3.org/2000/svg"  version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="26" height="26" x="0" y="0" viewBox="0 0 128 128" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path fill="${color}" fill-rule="evenodd" d="M20.586 47.836a2 2 0 0 0 0 2.828l39.879 39.879a5 5 0 0 0 7.07 0l39.879-39.879a2 2 0 0 0-2.828-2.828L64.707 87.714a1 1 0 0 1-1.414 0L23.414 47.836a2 2 0 0 0-2.828 0z" clip-rule="evenodd" opacity="1" data-original="#000000" class=""></path></g></svg>`
    ;

  return <SvgXml xml={dropdown} width={size} height={size} />;
};
export default OnelineDropdownSvg;

