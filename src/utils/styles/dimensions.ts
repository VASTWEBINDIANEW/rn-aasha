import {Dimensions} from 'react-native';
import {
  heightPercentageToDP as hp,
  widthPercentageToDP as wp,
} from 'react-native-responsive-screen';
import {getStatusBarHeight} from 'react-native-status-bar-height';

export const BASE_WIDTH = 414;
const BASE_HEIGHT = 736;

export const SCREEN_WIDTH = Dimensions.get('window').width;
export const SCREEN_HEIGHT = Dimensions.get('window').height;

const wRatio = SCREEN_WIDTH / BASE_WIDTH;
const hRatio = SCREEN_HEIGHT / BASE_HEIGHT;

export const wScale = (size: number, minFactor = 0.8) => {
  const minSize = size * minFactor;
  const maxSize = size * (2 - minFactor);
  const scaledSize = wp(((100 * size) / BASE_WIDTH) * wRatio);
  if (scaledSize > maxSize) {
    return maxSize;
  }
  return scaledSize > minSize ? scaledSize : minSize;
};

export const hScale = (size: number, minFactor = 0.8) => {
  const minSize = size * minFactor;
  const maxSize = size * (2 - minFactor);
  const scaledSize = hp(((100 * size) / BASE_HEIGHT) * hRatio);
  if (scaledSize > maxSize) {
    return maxSize;
  }
  return scaledSize > minSize ? scaledSize : minSize;
};

export const wpScale = wp;
export const hpScale = hp;

export const STATUS_BAR_HEIGHT = getStatusBarHeight(true);
export const APP_BAR_HEIGHT = hScale(56, 0.9);
