import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";
import { color } from "@rneui/base";

const Finosvg = ({ size = wScale(40), color='#000' }) => {
    const searchicon = `

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 48 48" style="enable-background:new 0 0 512 512" xml:space="preserve" class="" ><g><path d="M14.192 44.014a4.029 4.029 0 0 1-3.96-4.678l1.547-9.531-6.638-6.856a4.028 4.028 0 0 1 2.27-6.787l8.99-1.38 3.963-8.464a4.045 4.045 0 0 1 7.273 0l3.949 8.452 9.004 1.392a4.028 4.028 0 0 1 2.27 6.787l-6.632 6.828 1.541 9.56a4.018 4.018 0 0 1-5.911 4.167l-7.853-4.36-7.862 4.36a4.009 4.009 0 0 1-1.95.51zM24 35.14a4 4 0 0 1 1.945.507l7.854 4.361-1.527-9.562a4.055 4.055 0 0 1 1.085-3.454l6.633-6.83-8.999-1.427a4.012 4.012 0 0 1-3.03-2.274l-3.947-8.45h-.001a.065.065 0 0 0-.011-.019l-3.965 8.47a4.007 4.007 0 0 1-3.027 2.273l-8.992 1.38 6.624 6.875a4.055 4.055 0 0 1 1.087 3.455l-1.548 9.533 7.873-4.33A4 4 0 0 1 24 35.14z" data-name="Outline Flaticon" fill="${color}" opacity="1" data-original="#000000"></path></g></svg>

`
    return (
        <View>
            <SvgXml xml={searchicon} width={size} height={size} />
        </View>
    );
};


export default Finosvg;
