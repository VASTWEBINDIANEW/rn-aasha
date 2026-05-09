import React, { FC } from 'react';


import { StyleSheet, Text, TextProps, View, ViewProps, ViewStyle } from 'react-native';
import { colors } from '../utils/styles/theme';
import { wScale } from '../utils/styles/dimensions';




type Props = ViewProps & {
  size: number | 'small' | 'large';
  text: string;
  textProps?: TextProps;
  Badge?: React.ReactElement;
  badgeContainerStyle?: ViewStyle;
  backgroundColor?: ViewStyle['backgroundColor'];
};

const Avatar: FC<Props> = ({
  size = 'large',
  text,
  Badge,
  badgeContainerStyle,
  textProps,
  backgroundColor = colors.light_blue_background,
  ...props
}) => {
  const circleSize = (() => {
    if (size === 'large') {
      return wScale(60);
    }
    if (size === 'small') {
      return wScale(40);
    }
    return size;
  })();
  const textSize = (() => {
    if (size === 'large') {
      return wScale(20);
    }
    if (size === 'small') {
      return wScale(14);
    }
    return size / 1.5;
  })();

  const letter = text?.charAt(0)?.toUpperCase() || '';

  return (
    <View {...props} style={[styles.container, props.style]}>
      <View
        style={[
          styles.circle,
          {
            height: circleSize,
            width: circleSize,
            borderRadius: circleSize / 2,
            backgroundColor,
          },
        ]}
      >
        {!!letter && (
          <Text
            
    
            {...textProps}
            style={[styles.text, textProps?.style]}
          >
            {letter}
          </Text>
        )}
      </View>

      {Badge && <View style={[styles.badgeContainer, badgeContainerStyle]}>{Badge}</View>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    textAlignVertical: 'center',
    color: colors.black,
    fontSize: wScale(24),
  },
  badgeContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
});

export default React.memo(Avatar);
