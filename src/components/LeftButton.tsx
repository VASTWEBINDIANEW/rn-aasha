import React, {useCallback, useEffect} from 'react';

import {BackHandler, StyleProp, ViewStyle} from 'react-native';
import BackArrow from '../utils/svgUtils/BackArrow';
import MeasuredView from './MeasuredView';
import NavigationService from '../utils/navigation/NavigationService';

type leftAction = 'none' | (() => void);

type Props = {
  action?: leftAction;
  style?: StyleProp<ViewStyle>;
};

export default function LeftButton({action, style = {}}: Props) {
  const pressLeft = useLeftFnc(action);

  useEffect(() => {
    const goBack = () => {
      if (action !== 'none') {
        pressLeft();
      }
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      goBack,
    );
    return () => backHandler.remove();
  }, [action, pressLeft]);

  if (action === 'none') {
    return null;
  }

  return (
    <MeasuredView
      layoutKey="left-action"
      onPress={pressLeft}
      hitSlop={{top: 20, bottom: 20, left: 20, right: 20}}
      style={style}>
      <BackArrow />
    </MeasuredView>
  );
}

const useLeftFnc = (action?: leftAction) => {
  return useCallback(
    () =>
      typeof action === 'function' ? action() : NavigationService.goBack(),
    [action],
  );
};
