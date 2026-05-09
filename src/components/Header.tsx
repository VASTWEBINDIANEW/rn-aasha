import React from 'react';

import {
  LayoutChangeEvent,
  StatusBar,
  StyleSheet,
  View,
  Text,
} from 'react-native';

import {APP_BAR_HEIGHT, wScale} from '../utils/styles/dimensions';
import {FontSize, SPACING, SPACING_24, colors} from '../utils/styles/theme';
import LayoutContext from './LayoutContext';
import LeftButton from './LeftButton';

export type HeaderProps = Partial<any> & {
  title?: string;
  HeaderContent?: string | React.ReactElement;
  LeftAction?: 'none' | (() => void) | React.ReactElement;
};

class Header extends React.PureComponent<HeaderProps> {
  static contextType = LayoutContext;

  // onHeaderLayout = (e: LayoutChangeEvent) => {
  //   const {headerHeight, setLayout} = this.context;
  //   const newHeight = e.nativeEvent.layout.height + APP_BAR_HEIGHT;
  //   if (headerHeight !== newHeight) {
  //     setLayout({headerHeight: newHeight});
  //   }
  // };

  render() {
    const {title, HeaderContent, LeftAction} = this.props;

    return (
      <View style={styles.header}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={colors.dark_blue}
        />

        <View style={styles.appBar}>
          {React.isValidElement(LeftAction) ? (
            LeftAction
          ) : (
            <LeftButton action={LeftAction} style={styles.leftAction} />
          )}
        </View>

        <View style={{height: SPACING_24}}>
          {!!title && <Text>{title}</Text>}

          {typeof HeaderContent === 'string' ? (
            <Text style={{paddingTop: wScale(20, 0.9)}}>{HeaderContent}</Text>
          ) : (
            HeaderContent
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    top: 0,
    left: 0,
    width: '100%',
    position: 'absolute',
    paddingHorizontal: SPACING,
    //paddingBottom: SPACING,
  },
  appBar: {
    height: APP_BAR_HEIGHT,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row-reverse',
  },
  leftAction: {
    paddingVertical: SPACING * 0.75,
    paddingRight: SPACING * 0.75,
  },
});

export default Header;

//export default withNavigation(Header as any);
