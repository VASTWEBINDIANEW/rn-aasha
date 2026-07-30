import React from 'react';

import {
  CommonActions,
  StackActions,
  useNavigation as useNavigationLib,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const navigationRef = React.createRef<any>();

const navigate = (routeName: string, params?: any, key?: string) => {
  navigationRef.current?.navigate(routeName, params, key);
};

const goBack = () => {
  navigationRef.current?.dispatch(CommonActions.goBack());
};

const pop = (n?: number) => {
  navigationRef.current?.dispatch(StackActions.pop(n));
};

const popToTop = () => {
  navigationRef.current?.dispatch(StackActions.popToTop());
};

const push = (routeName: string, params?: any) => {
  navigationRef.current?.dispatch(StackActions.push(routeName, params));
};

const replace = (routeName: string, params?: any) => {
  navigationRef.current?.dispatch(StackActions.replace(routeName, params));
};

// 🔹 UPDATED: Screen Name and Params direct pass karne ke liye reset function
const reset = (routeName: string, params?: object) => {
  if (navigationRef.current?.isReady()) {
    navigationRef.current?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: routeName, params }],
      })
    );
  }
};

const resetMainTabStack = () => {
  navigationRef.current?.dispatch(
    CommonActions.reset({
      index: 0,
      routes: [
        {
          name: 'MainTabNavigator',
        },
      ],
    }),
  );
};

export function useNavigation() {
  return useNavigationLib<any>();
}

const getCurrentRoute = () => {
  if (
    !navigationRef.current &&
    navigationRef.current.getRootState()?.routes?.length > 0
  ) {
    return null;
  }
  return navigationRef.current.getRootState()?.routes[
    navigationRef.current.getRootState().index
  ];
};

const getCurrentRouteName = () => {
  if (!navigationRef.current) {
    return null;
  }
  return navigationRef.current.getCurrentRoute()?.name;
};

export default {
  getNavigator: () => navigationRef,
  navigate,
  goBack,
  reset, // 👈 Ab aap NavigationService.reset('CmsScreen') use kar sakte hain
  popToTop,
  getCurrentRoute,
  getCurrentRouteName,
  push,
  replace,
  pop,
  useNavigation,
  getNavigation: () => navigationRef.current?.navigation,
  resetMainTabStack,
};