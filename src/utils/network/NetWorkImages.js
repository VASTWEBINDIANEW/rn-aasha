import FastImage from 'react-native-fast-image';
import { IMAGE_BASE_URL, ASSETS_BASE_URL } from './urls';  // ← ASSETS_BASE_URL add karo

export const getImageSource = (imageName) => {
  return {
    uri: `${IMAGE_BASE_URL}${imageName}`,
    priority: FastImage.priority.high,
    cache: FastImage.cacheControl.immutable,
  };
};

export const getImageSource2 = (imageName) => {
  return {
    uri: `${IMAGE_BASE_URL}${imageName}`,
  };
};

// Common assets ke liye naya function
export const getAssetSource = (imageName) => {
  return {
    uri: `${ASSETS_BASE_URL}${imageName}`,
    priority: FastImage.priority.high,
    cache: FastImage.cacheControl.immutable,
  };
};