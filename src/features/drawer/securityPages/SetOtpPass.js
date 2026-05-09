import React, {useCallback, useEffect, useMemo, useState } from 'react';
import {StyleSheet, Text, TouchableOpacity,  Alert
,  View} from 'react-native';
import AppBarSecond from '../headerAppbar/AppBarSecond';
import {hScale, wScale} from '../../../utils/styles/dimensions';
import DynamicButton from '../button/DynamicButton';
import DynamicSecurityPages from './DynamicComponet';
import {RootState} from '../../../reduxUtils/store';
import {ALERT_TYPE, Dialog} from 'react-native-alert-notification';
import useAxiosHook from '../../../utils/network/AxiosClient';
import {APP_URLS} from '../../../utils/network/urls';
import { getPhoneNumber } from 'react-native-device-info';
import ShowLoader from '../../../components/ShowLoder';
import { useSelector, useDispatch } from 'react-redux';
import { reset } from '../../../reduxUtils/store/userInfoSlice'
import { translate } from '../../../utils/languageUtils/I18n';

const SetOtpPass = () => {
  const {colorConfig} = useSelector((state: RootState) => state.userInfo);
  const color1 = `${colorConfig.secondaryColor}10`;
  const [text, setText] = useState(translate('SetOtpPass.Change Security Type'));
  const [securityType, setSecurityType] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const [textColor, setTextColor] = useState('#000'); // Setting default text color to black

  const [isload,setIsload]= useState(false)
  const {get, post} = useAxiosHook();
  const texts = useMemo(
    () => [
      {text: 'SetOtpPass.Login Security OFF', color: 'red', code: 'OFF'},
      {text: 'SetOtpPass.One Time Password', color: 'green', code: 'OTP'},
      {text: 'SetOtpPass.Day Passcode', color: 'blue', code: 'PERDAY'},
      {text: 'SetOtpPass.Weekly Passcode', color: 'orange', code: 'WEAKS'},
      {text: 'SetOtpPass.Monthly Passcode', color: 'brown', code: 'MONTHS'},
    ],
    [],
  );
  const help = `
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 60 60" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g transform="matrix(1.1800000000000006,0,0,1.1800000000000006,-5.398715629577644,-5.399909791946435)"><path d="M51.589 35.961a1 1 0 0 0-1.927-.535c-2.23 8.024-9.16 13.827-17.299 14.798l.843-.924a1 1 0 1 0-1.476-1.348l-2.515 2.756c-.035.038-.049.086-.077.128-.041.061-.086.118-.113.188-.026.067-.031.136-.042.206-.008.052-.031.1-.031.154 0 .008.005.015.005.024.002.063.024.123.037.185.015.067.021.137.048.198.013.028.037.051.053.078.05.087.103.171.176.24.004.003.005.008.009.012l2.756 2.515a.996.996 0 0 0 1.412-.065 1 1 0 0 0-.064-1.413l-1.009-.921c9.029-.986 16.745-7.392 19.214-16.276zM8.314 23.868a1 1 0 1 0 1.928.535c2.247-8.094 9.279-13.931 17.513-14.825l-.921 1.144a1 1 0 0 0 1.558 1.254l2.34-2.906c.027-.034.037-.077.059-.114a.961.961 0 0 0 .094-.18c.023-.066.031-.132.041-.201.006-.044.026-.084.026-.13 0-.018-.009-.033-.01-.05-.001-.02.007-.039.005-.059-.006-.055-.034-.102-.049-.155-.016-.056-.026-.111-.051-.163-.031-.064-.074-.118-.118-.175-.036-.046-.067-.092-.11-.132-.015-.014-.023-.034-.04-.047l-2.906-2.339a1 1 0 1 0-1.254 1.558l.913.735c-8.949 1.055-16.569 7.431-19.018 16.25zM8.076 29.004c-.068.03-.123.078-.182.123-.045.034-.094.06-.132.1-.008.008-.019.012-.027.02l-2.481 2.785a1 1 0 0 0 1.494 1.33l.886-.995c.997 9.018 7.399 16.718 16.272 19.184a1 1 0 1 0 .536-1.927C16.403 47.39 10.593 40.439 9.638 32.28l.966.861a.999.999 0 1 0 1.33-1.493l-2.785-2.483c-.045-.04-.103-.059-.154-.09-.05-.031-.094-.066-.15-.088-.078-.03-.16-.039-.243-.049-.041-.005-.076-.024-.118-.024-.007 0-.013.004-.021.004-.013 0-.024-.006-.037-.005-.076.004-.144.035-.216.056-.046.013-.093.016-.134.035zM52.145 30.603l2.578-2.697a1 1 0 0 0-1.445-1.382l-.994 1.039c-.959-9.065-7.378-16.813-16.285-19.287a1 1 0 1 0-.535 1.927c7.993 2.22 13.782 9.105 14.787 17.205l-.833-.796a1 1 0 0 0-1.383 1.446l2.677 2.56.008.008.01.01c.026.025.059.034.086.055.073.057.145.114.232.149.072.029.149.034.225.045.05.008.095.03.148.03a.995.995 0 0 0 .717-.307c.002-.003.005-.003.007-.005zM42.363 25.51v-2.25c0-.52-.4-.95-.92-1-4.68-.401-7.998-2.198-10.443-5.619V29h11.076c.181-1.141.287-2.305.287-3.49zM18.553 22.26c-.51.05-.91.48-.91 1v2.25c0 1.185.105 2.349.285 3.49H29V16.636c-2.445 3.425-5.764 5.223-10.447 5.624zM31 43.757c2.229-.762 4.309-2.197 6.193-4.287 2.142-2.386 3.657-5.294 4.473-8.47H31zM29 31H18.337c.814 3.176 2.327 6.083 4.476 8.47 1.874 2.09 3.952 3.524 6.187 4.286z" fill="#000000" opacity="1" data-original="#000000" class=""></path></g></svg>
    
    `;
  const topsvgimg = `
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><rect width="512" height="512" rx="102.4" ry="102.4" fill="#e5e5e5" shape="rounded"></rect><g transform="matrix(0.8600000000000002,0,0,0.8600000000000002,35.83999893188468,35.840002136230424)"><path d="M375.199 504.5H136.801c-17.853 0-32.325-14.472-32.325-32.325V39.825c0-17.853 14.472-32.325 32.325-32.325h238.398c17.853 0 32.325 14.472 32.325 32.325v432.35c0 17.853-14.472 32.325-32.325 32.325z" style="stroke-width: 8;" fill="#d8ecfe" data-original="#d8ecfe" stroke-width="8" class=""></path><path d="M375.199 7.5h-28.285c17.853 0 32.325 14.473 32.325 32.325v432.35c0 17.853-14.473 32.325-32.325 32.325h28.285c17.853 0 32.325-14.473 32.325-32.325V39.825c0-17.852-14.472-32.325-32.325-32.325z" style="stroke-width: 8;" fill="#c4e2ff" data-original="#c4e2ff" stroke-width="8" class=""></path><path d="M407.524 130.74H104.476c-11.158 0-20.203 9.045-20.203 20.203v88.894c0 11.158 9.045 20.203 20.203 20.203h119.199l22.583 29.531a12.265 12.265 0 0 0 19.486 0l22.582-29.531h119.199c11.158 0 20.203-9.045 20.203-20.203v-88.894c0-11.158-9.046-20.203-20.204-20.203z" style="stroke-width: 8;" fill="#55ed96" data-original="#cb97e7" stroke-width="8" class="" opacity="1"></path><path d="M407.524 130.74H381.26c11.158 0 20.203 9.045 20.203 20.203v88.894c0 11.158-9.045 20.203-20.203 20.203h26.264c11.158 0 20.203-9.045 20.203-20.203v-88.894c.001-11.158-9.045-20.203-20.203-20.203z" style="stroke-width: 8;" fill="#19b85d" data-original="#bd80e1" stroke-width="8" class="" opacity="1"></path><path d="M365.098 381.26H146.902c-5.579 0-10.102-4.523-10.102-10.102v-34.346c0-5.579 4.523-10.102 10.102-10.102h218.195c5.579 0 10.102 4.523 10.102 10.102v34.346c0 5.58-4.522 10.102-10.101 10.102z" style="stroke-width: 8;" fill="#ff4f4f" data-original="#8ac9fe" stroke-width="8" class="" opacity="1"></path><path d="M407.52 130.74V99.8M104.48 130.74V39.83c0-17.85 14.47-32.33 32.32-32.33h238.4c17.85 0 32.32 14.48 32.32 32.33V64.7M407.52 260.04v212.13c0 17.85-14.47 32.33-32.32 32.33H136.8c-17.85 0-32.32-14.48-32.32-32.33V260.04M245.898 39.825h20.204M245.898 472.175h20.204M298.427 39.825h0M213.573 39.825h0M248.729 168.138h30.125M263.731 169.88v52.807M311.179 198.994v23.693M342.063 183.532c0 8.502-7.193 15.394-15.695 15.394-4.216 0-15.189.068-15.189.068v-30.855h15.189c8.502-.001 15.695 6.891 15.695 15.393z" style="stroke-width: 8; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 10;" fill="none" stroke="#000000" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" data-original="#000000"></path><circle cx="197.211" cy="195.368" r="27.274" style="stroke-width: 8; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 10;" fill="none" stroke="#000000" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" data-original="#000000"></circle><path d="M84.27 212.92v26.92c0 11.16 9.05 20.2 20.21 20.2h119.19l22.59 29.53a12.248 12.248 0 0 0 15.17 3.55c1.67-.82 3.15-2.03 4.31-3.55l22.59-29.53h119.19c11.16 0 20.21-9.04 20.21-20.2v-88.9c0-11.15-9.05-20.2-20.21-20.2H104.48c-11.16 0-20.21 9.05-20.21 20.2v26.88M315.55 381.26h49.55c5.58 0 10.1-4.52 10.1-10.1v-34.35c0-5.58-4.52-10.1-10.1-10.1H146.9c-5.58 0-10.1 4.52-10.1 10.1v34.35c0 5.58 4.52 10.1 10.1 10.1h133.55M175.187 353.986h0M207.512 353.986h0M239.837 353.986h0M272.163 353.986h0M304.488 353.986h0M336.813 353.986h0" style="stroke-width: 8; stroke-linecap: round; stroke-linejoin: round; stroke-miterlimit: 10;" fill="none" stroke="#000000" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" stroke-miterlimit="10" data-original="#000000"></path></g></svg>
    `;
    const dispatch = useDispatch();

  const pressbtn = async () => {
    setIsload(true)
    const res = await post({
      url: `${APP_URLS.setTwoFAStatus}status=true&passcodetype=${securityType}`,
    });
    console.log(res);
    setIsload(false)


    if (res) {

      Alert.alert(
        translate("SetOtpPass.SUCCESS"),
        translate("SetOtpPass.Update Successfully"),
        [
          {
            text: translate("SetOtpPass.OK"),
            onPress: () => {
              dispatch(reset());
            },
          },
        ],
        { cancelable: false }
      );    }

  };

  const handlePress = () => {
    setClickCount((clickCount + 1) % texts.length);
    setText(texts[clickCount].text);
    setTextColor(texts[clickCount].color);
    setSecurityType(texts[clickCount].code);
  };

  const getSecurityLevel = useCallback(async () => {
    const res = await get({url: APP_URLS.checkSecurityType});
    const number = await getPhoneNumber();
    console.log('number', number);
    setText(texts.find(item => item.code === res.type).text);
  }, [get, texts]);

  useEffect(() => {
    getSecurityLevel();
  }, [getSecurityLevel]);
  const BtnPress = () => {
    const dispatch = useDispatch();
  
    Dialog.show({
      type: ALERT_TYPE.SUCCESS,
      title: translate("SetOtpPass.SUCCESS"),
      textBody: translate("SetOtpPass.Update Successfully"),
      button: translate("SetOtpPass.OK"),
      onPressButton: () => {
        Dialog.hide();
        dispatch(reset())
  
      },
    });
  };
  return (
    <View>
      <AppBarSecond title={"SetOtpPass.Change Security Type"} />
      <View style={styles.container}>
        <DynamicSecurityPages
          mobilestyle={{backgroundColor: color1}}
          hedingstyle={{backgroundColor: colorConfig.primaryColor}}
          topsvgimg={topsvgimg}
          title={"SetOtpPass.Choose Your Security Level"}
          content={"SetOtpPass.description"}
          secondtitle={"SetOtpPass.Live Status is"}
          selectedtext={text}
          selecttexcolor={{color: textColor}}
          buttonText={(text)}
          buttontextstyle={{color: textColor}}
          // onPressBtn={handlePress}
          buttonImg={help}
          onPressImg={handlePress}
        />
        <DynamicButton title={"SetOtpPass.Save Change"} onPress={()=>pressbtn()} />
      </View>

      {isload &&  <ShowLoader/>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: wScale(20),
  },
});
export default SetOtpPass;
