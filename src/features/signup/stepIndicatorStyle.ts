import {wScale} from '../../utils/styles/dimensions';
import {colors} from '../../utils/styles/theme';

export const StepIndicatorStyle = {
  stepIndicatorSize: 30,
  currentStepIndicatorSize: 34,
  separatorStrokeWidth: 2,
  currentStepStrokeWidth: 3,
  stepStrokeCurrentColor: '#7eaec4',
  stepStrokeWidth: 3,
  stepStrokeFinishedColor: '#7eaec4',
  stepStrokeUnFinishedColor: '#dedede',
  separatorFinishedColor: '#7eaec4',
  separatorUnFinishedColor: '#dedede',
  stepIndicatorFinishedColor: '#7eaec4',
  stepIndicatorUnFinishedColor: '#ffffff',
  stepIndicatorCurrentColor: '#ffffff',
  
  // ❌ यहाँ 0 था, इसे 1 या उससे बड़ा करें
  stepIndicatorLabelFontSize: 1, 
  currentStepIndicatorLabelFontSize: 1, 
  
  stepIndicatorLabelCurrentColor: 'transparent',
  stepIndicatorLabelFinishedColor: 'transparent',
  stepIndicatorLabelUnFinishedColor: 'transparent',
  labelColor: '#999999',
  
  // सुरक्षा के लिए यहाँ भी check लगा दें
  labelSize: wScale(15, 1) > 0 ? wScale(15, 1) : 15, 
  
  currentStepLabelColor: colors.dark_blue,
};
