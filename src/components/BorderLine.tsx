import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../reduxUtils/store';

interface BorderLineProps {
  height?: number;
  width?: number | string;
  style?: ViewStyle;
}

const BorderLine: React.FC<BorderLineProps> = ({
  height = 1,
  width = '100%',
  style,
}) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  return (
    <View
      style={[
        styles.line,
        {
          height,
          width,
          backgroundColor: colorConfig.secondaryColor,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  line: {
  },
});

export default BorderLine;
