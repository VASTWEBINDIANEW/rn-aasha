import React from 'react';

import {
  CommonActions,
  StackActions,
  useNavigation as useNavigationLib,
} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

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

const reset = options => {
  navigationRef.current?.dispatch(CommonActions.reset(options));
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

// export function useNavigation<Params extends NavigationParams, State = NavigationRoute<Params>>() {
//   return useContext<NavigationScreenProp<State, Params> & NavigationStackProp<State, Params>>(
//     NavigationContext as any,
//   );
// }

export function useNavigation() {
  return useNavigationLib<any>();
}

/*const getCurrentRoute = (): NavigationRoute | null => {
  if (!_navigator || !_navigator.state.nav) {
    return null;
  }
  return _navigator.state.nav.routes[_navigator.state.nav.index] || null;
};*/

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

/*
const getCurrentRouteName = () => {
  const routeState = getCurrentRoute();
  if (routeState && routeState.routes && routeState.routes.length > 0) {
    const routeName = routeState.routes[routeState.index]?.routeName;
    if (typeof routeName === 'string') {
      return routeName;
    }
  }
  return;
};*/

const getCurrentRouteName = () => {
  if (!navigationRef.current) {
    return null;
  }
  return navigationRef.current.getCurrentRoute().name;
};

export default {
  getNavigator: () => navigationRef,
  navigate,
  goBack,
  reset,
  popToTop,
  getCurrentRoute,
  getCurrentRouteName,
  push,
  replace,
  pop,
  useNavigation,
  getNavigation: () => navigationRef.current.navigation,
  resetMainTabStack,
};
