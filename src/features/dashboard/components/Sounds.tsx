import SoundPlayer from 'react-native-sound-player';

export const playSound = (status, istone  = true) => {
  try {
    console.log(istone ,status);

    if (istone == false) {
      return; 
    }

    if (status === 'Success') {
      SoundPlayer.playAsset(require('../../../../assets/s_tone.mp3'));
    } else {
      SoundPlayer.playAsset(require('../../../../assets/s_tone2.mp3'));
    }
  } catch (e) {
    console.log('Cannot play the sound file', e);
  }
};
