import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const AlertSvg = ({ size = wScale(40), color='#000' }) => {
    const searchicon = `
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 68 68" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path fill="#ffd542" d="M59.1 60.5H8.9c-4.6 0-7.4-5-5-9L29 10.4c2.3-3.8 7.8-3.8 10.1 0l25.1 41.1c2.3 3.9-.5 9-5.1 9z" opacity="1" data-original="#ffd542" class=""></path><path fill="#07070710" d="M59.1 60.5H8.9c-4.3 0-7-4.3-5.5-8.1.9 2 2.9 3.6 5.5 3.6h50.2c2.6 0 4.6-1.6 5.5-3.7 1.5 3.8-1.2 8.2-5.5 8.2z" opacity="1" data-original="#07070710"></path><path fill="#dfe9f4" d="M12.5 52.4c-.3 0-.5-.1-.7-.4-.1-.3-.1-.5 0-.8L33.3 16c.2-.3.4-.4.7-.4s.5.1.7.4l21.5 35.3c.2.3.2.5 0 .8s-.4.4-.7.4z" opacity="1" data-original="#dfe9f4" class=""></path><path fill="#f34c6e" d="M36.8 30.3 35.7 39c-.1.9-.8 1.5-1.7 1.5-.9 0-1.6-.7-1.7-1.5l-1.1-8.7c-.1-1 .7-1.9 1.7-1.9H35c1.1 0 1.9.9 1.8 1.9z" opacity="1" data-original="#f34c6e"></path><circle cx="34" cy="45.8" r="1.9" fill="#f34c6e" opacity="1" data-original="#f34c6e"></circle><g fill="#003"><path d="M65 51 45.2 18.5c-.3-.5-.9-.6-1.4-.3s-.6.9-.3 1.4L63.3 52c.9 1.5 1 3.4.1 5s-2.5 2.5-4.3 2.5H8.9c-1.8 0-3.4-.9-4.3-2.5s-.8-3.4.1-5l25.1-41.1c.9-1.5 2.5-2.4 4.2-2.4 1.7 0 3.3.9 4.2 2.4l2.3 3.7c.3.5.9.6 1.4.3s.6-.9.3-1.4l-2.3-3.7c-1.3-2.1-3.5-3.3-5.9-3.3-2.4 0-4.6 1.2-5.9 3.3L3 51c-1.3 2.2-1.4 4.8-.1 7s3.5 3.5 6 3.5h50.2c2.5 0 4.8-1.3 6-3.5 1.2-2.3 1.2-4.9-.1-7z" fill="#000033" opacity="1" data-original="#000033" class=""></path><path d="M23.1 32.8c-.5-.3-1.1-.1-1.4.3L11 50.7c-.3.6-.4 1.2 0 1.8.3.6.9.9 1.5.9h43c.7 0 1.2-.3 1.5-.9s.3-1.2 0-1.8L35.5 15.4c-.3-.5-.9-.9-1.5-.9s-1.2.3-1.5.9l-7.4 12.1c-.3.5-.1 1.1.3 1.4.5.3 1.1.1 1.4-.3L34 16.8l21.1 34.6H12.9l10.5-17.2c.3-.5.1-1.1-.3-1.4z" fill="#000033" opacity="1" data-original="#000033" class=""></path><path d="M37.8 30.4c.1-.8-.2-1.5-.7-2.1s-1.3-.9-2-.9H33c-.8 0-1.5.3-2 .9s-.8 1.4-.7 2.1l1.1 8.7c.2 1.4 1.3 2.4 2.7 2.4s2.5-1 2.7-2.4zm-3.1 8.4c0 .4-.3.6-.7.6s-.7-.3-.7-.6l-1.1-8.7c0-.3.1-.5.2-.6s.3-.2.5-.2H35c.3 0 .5.1.5.2s.2.3.2.6zM34 42.9c-1.6 0-2.9 1.3-2.9 2.9s1.3 2.9 2.9 2.9 2.9-1.3 2.9-2.9-1.3-2.9-2.9-2.9zm0 3.9c-.5 0-1-.5-1-1s.5-1 1-1 1 .5 1 1c0 .6-.5 1-1 1z" fill="#000033" opacity="1" data-original="#000033" class=""></path></g></g></svg>
   `
    return (
        <View>
            <SvgXml xml={searchicon} width={size} height={size} />
        </View>
    );
};


export default AlertSvg;
