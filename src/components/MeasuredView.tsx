import React, {createRef, FC} from 'react';

import {
  findNodeHandle,
  Platform,
  TouchableOpacity,
  TouchableOpacityProps,
  UIManager,
  View,
} from 'react-native';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import {hScale, STATUS_BAR_HEIGHT, wScale} from '../utils/styles/dimensions';
import LayoutContext from './LayoutContext';

interface Props extends TouchableOpacityProps {
  section?: 'header' | 'body';
  layoutKey?: string;
}

class BaseMeasuredView extends React.PureComponent<Props> {
  static contextType = LayoutContext;
  height = 0;
  nodeId: number | null = null;
  ref = createRef<View>();

  componentDidMount() {
    this.updateOverlay();
  }

  componentDidUpdate(prevProps: Props) {
    const didChangeProps = prevProps.onPress !== this.props.onPress; // check if LeftAction function has changed
    this.updateOverlay(didChangeProps);
  }

  updateOverlay = async (didChangeProps?: boolean) => {
    if (!this.height || didChangeProps) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const {children, section = 'header', layoutKey, ...props} = this.props;

      let layout = await this.measureElement(this.ref.current);
      if (layoutKey) {
        if (persistedLayout[layoutKey]) {
          layout = persistedLayout[layoutKey];
        } else if (layout && layout.height > 0) {
          /**
           * should only persist valid layout
           * so subsequent calls can correctly decide whether to update overlay or not
           */
          persistedLayout[layoutKey] = layout;
        }
      }

      if (layout) {
        this.height = layout.height;

        const {overlays, setLayout} = this.context;
        const node = {id: this.nodeId, layout, section, props};
        setLayout({
          overlays: [...overlays.filter(item => item.id !== this.nodeId), node],
        });
      }
    }
  };

  measureElement = (element: null | React.Component) => {
    const {layoutKey} = this.props;
    if (!this.nodeId) {
      this.nodeId = findNodeHandle(element);
    }
    const nodeId = this.nodeId;
    if (nodeId) {
      return new Promise<any>(resolve => {
        UIManager.measureInWindow(nodeId, (x, y, width, height) => {
          if (layoutKey === 'collapsible') {
            x = wScale(40, 0.9);
            y = y - (Platform.OS === 'android' ? getStatusBarHeight(false) : 0);
          }
          if (layoutKey === 'left-action') {
            x = wScale(20, 0.9);
            y =
              Platform.OS === 'ios'
                ? hScale(15, 0.9) + STATUS_BAR_HEIGHT
                : hScale(20, 0.9);
          }
          resolve({x, y, width, height});
        });
      });
    }
  };

  /**
   * dumb Android need this function so measureInWindow can work properly
   * https://github.com/facebook/react-native/issues/3282
   */
  onLayout = () => undefined;

  render() {
    return (
      <View {...this.props} ref={this.ref} onLayout={this.onLayout}>
        {this.props.children}
      </View>
    );
  }
}

const MeasuredView: FC<Props> = ({section, children, ...props}) => {
  if (Platform.OS === 'ios' && section === 'body') {
    return <TouchableOpacity {...props}>{children}</TouchableOpacity>;
  }

  return (
    <BaseMeasuredView section={section} {...props}>
      {children}
    </BaseMeasuredView>
  );
};

export default MeasuredView;

const persistedLayout = {};
