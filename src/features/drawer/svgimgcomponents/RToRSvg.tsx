import { translate } from "../../../utils/languageUtils/I18n";
import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const RToRSvg = ({ size = wScale(40) }) => {
    const searchicon = `

<svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><g transform="translate(-448 -448)"><g id="Icon"><path d="m505 454c0-1.657-1.343-3-3-3-7.808 0-36.192 0-44 0-1.657 0-3 1.343-3 3v52c0 1.657 1.343 3 3 3h44c1.657 0 3-1.343 3-3zm-2 0v52c0 .552-.448 1-1 1-7.808 0-36.192 0-44 0-.552 0-1-.448-1-1v-52c0-.552.448-1 1-1h44c.552 0 1 .448 1 1z"/><path d="m490 457c-4.967 0-9 4.033-9 9s4.033 9 9 9 9-4.033 9-9-4.033-9-9-9zm6.929 10c-.486 3.391-3.405 6-6.929 6-1.571 0-3.022-.519-4.191-1.395l4.605-4.605zm-7.929-7.929v6.515l-4.605 4.605c-.876-1.169-1.395-2.62-1.395-4.191 0-3.524 2.609-6.443 6-6.929zm2 0c3.063.439 5.49 2.865 5.929 5.929h-5.929z"/><g transform="matrix(.5 0 0 1 231 -2)"><path d="m462 461h16c1.104 0 2-.448 2-1s-.896-1-2-1h-16c-1.104 0-2 .448-2 1s.896 1 2 1z"/></g><g transform="translate(0 2)"><path d="m462 461h16c.552 0 1-.448 1-1s-.448-1-1-1h-16c-.552 0-1 .448-1 1s.448 1 1 1z"/></g><g transform="translate(0 6)"><path d="m462 461h16c.552 0 1-.448 1-1s-.448-1-1-1h-16c-.552 0-1 .448-1 1s.448 1 1 1z"/></g><g transform="matrix(.444 0 0 1 256.667 -12)"><path d="m500.25 482c0-.552-1.007-1-2.25-1h-36c-1.243 0-2.25.448-2.25 1v4c0 .552 1.007 1 2.25 1h36c1.243 0 2.25-.448 2.25-1zm-4.5 1v2h-31.5v-2z"/></g><g transform="matrix(1 0 0 .667 -2 166)"><path d="m469 492c0-.828-.448-1.5-1-1.5h-4c-.552 0-1 .672-1 1.5v12c0 .828.448 1.5 1 1.5h4c.552 0 1-.672 1-1.5zm-2 1.5v9h-2v-9z"/></g><g transform="matrix(1 0 0 1.333 6 -170)"><path d="m469 493.5c0-.414-.448-.75-1-.75h-4c-.552 0-1 .336-1 .75v10.5c0 .414.448.75 1 .75h4c.552 0 1-.336 1-.75zm-2 .75v9h-2v-9z"/></g><g transform="matrix(1 0 0 .833 14 82)"><path d="m469 492c0-.663-.448-1.2-1-1.2h-4c-.552 0-1 .537-1 1.2v12c0 .663.448 1.2 1 1.2h4c.552 0 1-.537 1-1.2zm-2 1.2v9.6h-2v-9.6z"/></g><g transform="matrix(1 0 0 1.167 22 -86)"><path d="m469 492c0-.473-.448-.857-1-.857h-4c-.552 0-1 .384-1 .857v12c0 .473.448.857 1 .857h4c.552 0 1-.384 1-.857zm-2 .857v10.286h-2v-10.286z"/></g><g transform="translate(30 -2)"><path d="m469 492c0-.552-.448-1-1-1h-4c-.552 0-1 .448-1 1v12c0 .552.448 1 1 1h4c.552 0 1-.448 1-1zm-2 1v10h-2v-10z"/></g><path d="m462 481h26c.552 0 1-.448 1-1s-.448-1-1-1h-26c-.552 0-1 .448-1 1s.448 1 1 1z"/><path d="m462 485h36c.552 0 1-.448 1-1s-.448-1-1-1h-36c-.552 0-1 .448-1 1s.448 1 1 1z"/><path d="m498 479h-6c-.552 0-1 .448-1 1s.448 1 1 1h6c.552 0 1-.448 1-1s-.448-1-1-1z"/></g></g></svg>



`
    return (
        <View>
            <SvgXml xml={searchicon} width={size} height={size} />
        </View>
    );
};


export default RToRSvg;
