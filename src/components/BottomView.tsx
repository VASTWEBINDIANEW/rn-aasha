import React, {useCallback, useRef, useEffect} from 'react';
import {
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
  StyleProp,
  ViewStyle,
  View,
  ViewProps,
  Text,
  KeyboardAvoidingView, // Joda gaya
  Platform,             // Joda gaya
} from 'react-native';
import * as Animatable from 'react-native-animatable';

import {SCREEN_WIDTH, wScale, SCREEN_HEIGHT} from '../utils/styles/dimensions';
// useKeyboardEvent ko hata sakte hain agar KeyboardAvoidingView use kar rahe hain
import {colors} from '../utils/styles/theme';

export interface BottomViewProps extends ViewProps {
  onClose?: any;
  children?: React.ReactNode;
  hasCloseButton?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  bodyStyle?: StyleProp<ViewStyle>;
  hasHandleBar?: boolean;
  closeOnBackdropPress?: boolean;
}

const BottomView = ({
  children,
  onClose,
  hasCloseButton,
  containerStyle,
  hasHandleBar,
  bodyStyle,
  closeOnBackdropPress = true,
  ...props
}: BottomViewProps) => {
  const didMount = useRef(false);
  const animateRef = useRef<Animatable.View & View>(null);

  const close = useCallback(() => {
    if (didMount.current && animateRef?.current?.slideOutDown) {
      animateRef.current.slideOutDown(400).then(() => {
         if (onClose) onClose();
      });
    } else if (onClose) {
      onClose();
    }
  }, [onClose]);

  return (
    <Pressable
      onPress={() => {
        if (closeOnBackdropPress && onClose) {
          close(); // Direct onClose ki jagah animation wala close call karein
        }
      }}
      // Fabric Fix: Modal height fix
      style={[styles.modal, containerStyle, {height: SCREEN_HEIGHT}]}>
      
      {/* FIX: Manual padding ki jagah KeyboardAvoidingView use karein */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'android' ? undefined : 'padding'} 
        style={{width: '100%', justifyContent: 'flex-end'}}
      >
        <TouchableWithoutFeedback>
          <Animatable.View
            ref={animateRef}
            animation="slideInUp"
            duration={400}
            useNativeDriver={true} // Fabric mein true hona zaroori hai
            style={[
              styles.container,
              bodyStyle,
              // Yahan se manual padding calculation hata di gayi hai
            ]}
            onAnimationEnd={() => {
              didMount.current = true;
            }}
            {...props}>
            
            {hasHandleBar && (
              <View style={styles.handleBarContainer}>
                <Pressable onPress={close} style={styles.handleBar} />
              </View>
            )}
            
            {children}
            
            {hasCloseButton && (
              <Pressable onPress={close} style={styles.close}>
                <Text style={{color: colors.primary}}> {'Close'}</Text>
              </Pressable>
            )}
          </Animatable.View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  modal: {
    width: SCREEN_WIDTH,
    position: 'absolute',
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', // Tinted grey ki jagah standard overlay
    justifyContent: 'flex-end',
    zIndex: 1000, // Fabric requirement
  },
  container: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: wScale(24),
    paddingTop: wScale(40), // Handlebar ke liye space
    alignItems: 'center',
    width: '100%',
  },
  close: {
    position: 'absolute',
    top: wScale(15),
    right: wScale(24),
  },
  handleBar: {
    width: wScale(44),
    height: wScale(4),
    borderRadius: wScale(4),
    backgroundColor: '#ccc',
  },
  handleBarContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: wScale(12),
    position: 'absolute',
    top: 0,
  },
});

export default React.memo(BottomView);
