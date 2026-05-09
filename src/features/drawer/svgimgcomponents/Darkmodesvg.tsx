import React from "react";
import { View,Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const Darkmodesvg=({size=wScale(170)})=>{
const closse=` <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 64 64" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><rect width="64" height="64" rx="12.8" ry="12.8" fill="#e5e5e5" shape="rounded"></rect><g transform="matrix(0.9700000000000002,0,0,0.9700000000000002,0.9599999999999937,0.9599999999999937)"><g fill="#ebebed"><path d="M20.915 17.594c-4.069 2.967-6.822 7.573-6.905 13.067-.014.896-.013 1.787 0 2.683C14.166 43.057 22.663 50 32.015 50c8.508 0 16.334-5.749 17.748-14.13-.893.086-1.8.13-2.715.13-12.13 0-22.463-7.687-26.133-18.406zM34 56a2 2 0 1 0-4 0v4a2 2 0 0 0 4 0zM8 34a2 2 0 0 0 0-4H4a2 2 0 1 0 0 4zM16.444 50.385a2 2 0 0 0-2.829-2.829l-2.828 2.829a2 2 0 0 0 2.828 2.828zM53.213 53.213a2 2 0 0 1-2.829 0l-2.828-2.828a2 2 0 0 1 2.828-2.829l2.829 2.829a2 2 0 0 1 0 2.828zM13.615 16.444a2 2 0 1 0 2.828-2.829l-2.828-2.828a2 2 0 1 0-2.829 2.828z" fill="#b3b3b3" opacity="1" data-original="#ebebed" class=""></path></g><path fill="#5a4c4e" d="M32 2a2 2 0 0 1 2 2v4a2 2 0 1 1-4 0V4a2 2 0 0 1 2-2zM50 31.821c0-.422-.005-.844-.012-1.266C49.826 20.87 41.323 14 32.018 14c-2.642 0-5.217.554-7.555 1.568C27.35 25.048 36.349 32 47.047 32c1 0 1.986-.06 2.953-.179zM62 32a2 2 0 0 1-2 2h-4a2 2 0 1 1 0-4h4a2 2 0 0 1 2 2zM53.213 10.787a2 2 0 0 1 0 2.828l-2.828 2.829a2 2 0 0 1-2.829-2.829l2.829-2.828a2 2 0 0 1 2.828 0z" opacity="1" data-original="#fa1228" class=""></path></g></svg>
`
return(
    <View>
        <SvgXml xml={closse} width={size} height={size}/>
    </View>
);
};


export default Darkmodesvg;
