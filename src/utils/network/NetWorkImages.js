import FastImage from 'react-native-fast-image';
import { IMAGE_BASE_URL } from './urls';

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
