import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const CmsFinalOtopSvg = ({ size = wScale(100), color = '#fff' }) => {
    const searchicon = `


<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve" fill-rule="evenodd" class=""><g><path fill="#3c3c3c" d="M386 484H45c-25 0-45-20-45-45V68c0-22 18-40 40-40h271c22 0 40 18 41 40 0 3-3 5-5 6v196c2 1 5 3 5 6v97h3c0 1 1 1 1 1l20 18 21-18s1 0 1-1h5c1 1 1 1 2 1l24 21v1c1 0 1 1 2 2v41c0 25-20 45-45 45z" opacity="1" data-original="#dddddd" class=""></path><path fill="#ffc250" d="M386 484H62c9-12 15-29 15-47v-52l21-22 22 25 1 1c1 1 2 1 3 1s2 0 3-1c1 0 1-1 2-1l22-25 22 25c1 0 1 1 2 1 0 1 1 1 2 1s2 0 3-1c1 0 1-1 2-1l22-25 22 25c1 0 1 1 2 1 1 1 2 1 3 1s2 0 3-1l1-1 22-25 23 25 1 1c1 1 2 1 3 1s2 0 3-1l1-1 23-25 22 25 1 1c1 1 2 1 3 1s2 0 3-1c1 0 1-1 2-1l12-15h1c0 1 1 1 1 1l20 18 8-7 2 3c1 0 1 1 2 1 1 1 2 1 3 1s1 0 2-1c1 0 1-1 2-1l11-13 23 20v1c1 0 1 1 2 2v41c0 25-20 45-45 45z" opacity="1" data-original="#ffc250" class=""></path><path fill="#2bad6c" d="M87 148c-8 0-15-2-22-6-20-12-27-38-16-59 8-13 22-22 38-22 7 0 15 2 21 6 10 6 18 15 21 26 3 12 1 23-5 33-7 14-22 22-37 22z" opacity="1" data-original="#339966" class=""></path><g fill="#fff"><path d="M82 119c-2 0-3 0-4-1l-8-8c-2-2-2-6 0-8 2-3 6-3 8 0l4 3 13-13c3-3 6-3 9 0 2 2 2 6 0 8l-18 18c-1 1-3 1-4 1zM228 126h-50c-3 0-6-2-6-6 0-3 3-6 6-6h50c3 0 6 3 6 6 0 4-3 6-6 6zM254 95h-76c-3 0-6-3-6-6s3-6 6-6h76c3 0 6 3 6 6s-3 6-6 6z" fill="#ffffff" opacity="1" data-original="#ffffff" class=""></path></g><path fill="#2bad6c" d="M87 250c-8 0-15-2-22-6-20-12-27-38-16-59 8-13 22-22 38-22 7 0 15 2 21 6 10 6 18 15 21 26 3 12 1 23-5 33-7 13-22 22-37 22z" opacity="1" data-original="#339966" class=""></path><path fill="#ffffff" d="M82 221c-2 0-3 0-4-1l-8-8c-2-2-2-6 0-9 2-2 6-2 8 0l4 4 13-14c3-2 6-2 9 0 2 3 2 7 0 9l-18 18c-1 1-3 1-4 1zM227 228h-49c-3 0-6-2-6-6 0-3 3-6 6-6h49c3 0 6 3 6 6 0 4-3 6-6 6zM216 197h-38c-3 0-6-3-6-6s3-6 6-6h38c3 0 6 3 6 6s-3 6-6 6z" opacity="1" data-original="#ffffff" class=""></path><path fill="#2bad6c" d="M87 352c-8 0-15-2-22-6-20-12-27-38-16-59 8-13 22-22 38-22 7 0 15 2 21 6 10 6 18 15 21 26s1 23-5 33c-7 13-22 22-37 22z" opacity="1" data-original="#339966" class=""></path><path fill="#ffffff" d="M82 323c-2 0-3 0-4-1l-8-8c-2-3-2-6 0-9 2-2 6-2 8 0l4 4 13-14c3-2 6-2 9 0 2 3 2 7 0 9l-18 18c-1 1-3 1-4 1zM302 330H178c-3 0-6-3-6-6s3-6 6-6h124c3 0 6 3 6 6s-3 6-6 6zM302 299H178c-3 0-6-3-6-6s3-6 6-6h124c3 0 6 3 6 6s-3 6-6 6z" opacity="1" data-original="#ffffff" class=""></path><path fill="#272727" d="M424 281c-1 0-3 0-4-2l-27-27c-3-2-3-6 0-9 2-2 6-2 8 0l28 28c2 2 2 6 0 8s-3 2-5 2z" opacity="1" data-original="#c7cfe1" class=""></path><path fill="#1f3259" d="M487 363c-7 0-13-3-18-7l-49-50c-10-9-10-25 0-35 5-5 11-7 18-7 6 0 13 2 17 7l50 49c9 10 9 26 0 36-5 4-11 7-18 7zM321 285c-30 0-58-12-80-33-44-44-44-116 0-160 22-21 50-33 80-33s59 12 80 33c21 22 33 50 33 80s-12 59-33 80-50 33-80 33z" opacity="1" data-original="#1f3259" class=""></path><path fill="#ffffff" d="M321 250c-21 0-40-9-55-23-30-30-30-79 0-110 15-14 34-22 55-22s40 8 55 22c30 31 30 80 0 110-15 14-34 23-55 23z" opacity="1" data-original="#ffffff" class=""></path><path fill="#2bad6c" d="M307 205c-2 0-3-1-5-2-2-2-2-6 0-9l53-53c3-2 7-2 9 0 2 3 2 6 0 9l-53 53c-1 1-3 2-4 2z" opacity="1" data-original="#339966" class=""></path><path fill="#2bad6c" d="M307 205c-2 0-3-1-5-2l-24-24c-2-2-2-6 0-9 3-2 7-2 9 0l24 24c2 3 2 7 0 9-1 1-3 2-4 2z" opacity="1" data-original="#339966" class=""></path></g></svg>





`
    return (
        <View>
            <SvgXml xml={searchicon} width={size} height={size} />
        </View>
    );
};


export default CmsFinalOtopSvg;


