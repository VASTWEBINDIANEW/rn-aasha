import React from 'react';
import { View, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { RootState } from '../reduxUtils/store';

const SafeWrapper = ({ children }) => {
  const { colorConfig, authToken } = useSelector((state: RootState) => state.userInfo);
  const insets = useSafeAreaInsets();
  
  const primaryColor = colorConfig.primaryColor || '#000000';

  return (
    <View style={{ flex: 1, backgroundColor: primaryColor }}>
      <StatusBar backgroundColor="transparent" translucent={true} barStyle="light-content" />
      <View style={{ 
        flex: 1, 
        marginTop: insets.top, 
     
        marginBottom: authToken ? 0 : insets.bottom, 
        backgroundColor: '#FFFFFF' 
      }}>
        {children}
      </View>
    </View>
  );
};

export default SafeWrapper;
