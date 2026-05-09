import {useEffect, useState} from 'react';

import {Keyboard, KeyboardEvent, Platform} from 'react-native';

const useKeyboardEvent = () => {
  const [keyboardEvent, setKeyboardEvent] = useState<KeyboardEvent>();

  useEffect(() => {
    const [onShowEventName, onHideEventName]: any =
      Platform.OS === 'ios'
        ? ['keyboardWillShow', 'keyboardWillHide']
        : ['keyboardDidShow', 'keyboardDidHide'];

    const keyboardShowSubscription = Keyboard.addListener(
      onShowEventName,
      (event: KeyboardEvent) => {
        setKeyboardEvent(event);
      },
    );
    const keyboardHideSubscription = Keyboard.addListener(
      onHideEventName,
      () => {
        setKeyboardEvent(undefined);
      },
    );
    return () => {
      keyboardShowSubscription.remove();
      keyboardHideSubscription.remove();
    };
  }, []);

  return keyboardEvent;
};

export default useKeyboardEvent;
