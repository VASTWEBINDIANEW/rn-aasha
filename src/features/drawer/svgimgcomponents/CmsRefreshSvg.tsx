import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const CmsRefreshSvg = ({ size = wScale(50), color = '#fff' }) => {
    const searchicon = `


<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><g fill-rule="evenodd" clip-rule="evenodd"><circle cx="256" cy="255.999" r="240" fill="#ffd33a" opacity="1" data-original="#ffd33a" class=""></circle><path d="m363.118 306.316 7.997 22.633-51.539 18.237-15.32-7.299-18.241-51.548 22.624-8.006 9.081 25.649c9.91-14.651 15.249-31.907 15.249-49.984 0-23.882-9.302-46.341-26.191-63.23-34.872-34.867-91.599-34.867-126.47 0-16.889 16.889-26.191 39.348-26.191 63.23 0 23.887 9.302 46.341 26.191 63.23s39.348 26.191 63.23 26.191v24c-30.291 0-58.782-11.79-80.199-33.222-21.422-21.418-33.222-49.899-33.222-80.199 0-30.296 11.8-58.777 33.222-80.2 44.221-44.225 116.178-44.225 160.408 0 21.422 21.422 33.222 49.904 33.222 80.2 0 20.81-5.57 40.762-16.003 58.16zM255.998 484C381.719 484 484 381.719 484 255.998S381.718 28 255.998 28C130.277 28 28 130.277 28 255.998S130.277 484 255.998 484zm0-479.999C117.05 4.001 4.001 117.045 4.001 255.998S117.05 508 255.998 508 508 394.951 508 255.998C507.999 117.045 394.946 4.001 255.998 4.001z" fill="#000000" opacity="1" data-original="#000000"></path></g></g></svg>


`
    return (
        <View>
            <SvgXml xml={searchicon} width={size} height={size} />
        </View>
    );
};


export default CmsRefreshSvg;


