import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const AepsReportSvg = ({ size = wScale(40) }) => {
    const searchicon = `

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 58 58" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g transform="matrix(0.9500000000000003,0,0,0.9500000000000003,1.4499757766723533,1.449999999999985)"><g fill="none" fill-rule="evenodd"><path fill="#142322" d="M36 18v9.24L34 42l-12.44 7.64A17.405 17.405 0 0 1 18 50C8.059 50 0 41.941 0 32V18a18 18 0 1 1 36 0z" opacity="1" data-original="#26b99a" class=""></path><path fill="#e64c3c" d="M55.74 58H20.32a2.263 2.263 0 0 1-1.9-3.49l3.14-4.87L36 27.24l.13-.2a2.253 2.253 0 0 1 3.8 0l17.71 27.47a2.266 2.266 0 0 1-1.9 3.49z" opacity="1" data-original="#e64c3c" class=""></path><g fill="#fff"><rect width="4" height="12" x="36" y="34" rx="1" fill="#ffffff" opacity="1" data-original="#ffffff" class=""></rect><rect width="4" height="4" x="36.019" y="50" rx="1" fill="#ffffff" opacity="1" data-original="#ffffff" class=""></rect><path d="M18 47C9.716 47 3 40.284 3 32v-3.5a1 1 0 0 1 2 0V32a13 13 0 0 0 13 13 1 1 0 0 1 0 2zM4 22.5a1 1 0 0 1-1-1V18a15.039 15.039 0 0 1 9.165-13.819c7.632-3.21 16.422.362 19.654 7.984a1 1 0 0 1-1.842.781A13 13 0 0 0 5 18v3.5a1 1 0 0 1-1 1z" fill="#ffffff" opacity="1" data-original="#ffffff" class=""></path><path d="M18 43c-6.075 0-11-4.925-11-11V18c-.002-1.47.292-2.925.866-4.278a1 1 0 1 1 1.842.779A8.917 8.917 0 0 0 9 18v14a9 9 0 0 0 12.5 8.292 1 1 0 1 1 .78 1.842A10.9 10.9 0 0 1 18 43zM28 29.5a1 1 0 0 1-1-1V18a9 9 0 0 0-12.5-8.292 1 1 0 1 1-.78-1.842c5.597-2.353 12.043.266 14.413 5.856.574 1.353.869 2.808.867 4.278v10.5a1 1 0 0 1-1 1z" fill="#ffffff" opacity="1" data-original="#ffffff" class=""></path><path d="M12 33a1 1 0 0 1-1-1V18a7 7 0 0 1 13.449-2.724 1 1 0 1 1-1.842.782A5 5 0 0 0 13 18v14a1 1 0 0 1-1 1zM18 39a6.982 6.982 0 0 1-4.948-2.053 1 1 0 1 1 1.415-1.414A5 5 0 0 0 23 32v-7a1 1 0 0 1 2 0v7a7 7 0 0 1-7 7z" fill="#ffffff" opacity="1" data-original="#ffffff" class=""></path><path d="M18 35a3 3 0 0 1-3-3v-7a1 1 0 0 1 2 0v7a1 1 0 0 0 2 0V18a1 1 0 0 0-2 0 1 1 0 0 1-2 0 3.009 3.009 0 0 1 1.832-2.764 2.993 2.993 0 0 1 3.29.645A3 3 0 0 1 21 18v14a3 3 0 0 1-3 3z" fill="#ffffff" opacity="1" data-original="#ffffff" class=""></path></g></g></g></svg>
`
    return (
        <View>
            <SvgXml xml={searchicon} width={size} height={size} />
        </View>
    );
};


export default AepsReportSvg;
