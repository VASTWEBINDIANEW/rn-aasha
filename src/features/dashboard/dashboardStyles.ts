import {StyleSheet} from 'react-native';
import {wScale} from '../../utils/styles/dimensions';
export const styles = StyleSheet.create({
  InputImage: {
    height: wScale(50),
    width: wScale(50),
    shadowRadius: 3,
    elevation: 2,
    alignItems: 'center',
  },
  IconButtonText: {
    fontSize: 14,
    color: 'black',
  },
  oval: {
    width: 12,
    height: 11,
    backgroundColor: 'white',
  },
  MenuDottcontainer: {
    alignItems: 'center',
    justifyContent: 'space-between',
    height: wScale(45),
    marginRight: wScale(15),
    marginLeft: wScale(6),
  },
  sliderConainer: {
    backgroundColor: 'white',
    paddingVertical: wScale(4),
  },
});
