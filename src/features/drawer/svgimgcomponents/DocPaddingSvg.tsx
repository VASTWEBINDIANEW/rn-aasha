import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const DocPaddingSvg = ({ size = wScale(80) }) => {
    const searchicon = `
 
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 64 64" style="enable-background:new 0 0 512 512" xml:space="preserve" class=""><g><path fill="#9a4738" d="M23 7v5.19c0 1.55-1.26 2.81-2.81 2.81H17c-.55 0-1 .45-1 1s-.45 1-1 1-1 .45-1 1v4c-1.7 0-3.12-1.3-3.27-2.99l-.21-2.31a5.224 5.224 0 0 1 5.2-5.7H19c2.21 0 4-1.79 4-4z" opacity="1" data-original="#9a4738"></path><path fill="#ae6c60" d="M14.852 11.079a5.224 5.224 0 0 0-4.164 3.766A2.3 2.3 0 0 0 11.5 15c1.583 0 2.92-1.654 3.352-3.921z" opacity="1" data-original="#ae6c60"></path><circle cx="51" cy="8" r="7" fill="#e52c55" opacity="1" data-original="#e52c55"></circle><circle cx="51" cy="8" r="5" fill="#e0dae0" opacity="1" data-original="#e0dae0"></circle><path fill="#fcb984" d="M63 46v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h60a1 1 0 0 1 1 1z" opacity="1" data-original="#fcb984" class=""></path><path fill="#ff9d5a" d="M60 46a1 1 0 0 1-1 1H1v1a1 1 0 0 0 1 1h60a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a1 1 0 0 0-1 1z" opacity="1" data-original="#ff9d5a" class=""></path><path fill="#e0dae0" d="M61 49v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V49z" opacity="1" data-original="#e0dae0"></path><path fill="#a8a3a8" d="M57 49v3.167a5.667 5.667 0 0 1-5.667 5.667H3V62a1 1 0 0 0 1 1h56a1 1 0 0 0 1-1V49z" opacity="1" data-original="#a8a3a8"></path><path fill="#e0dae0" d="M57.61 32c.69 0 1.17.67.95 1.32L54 45H34l1.49-3.81 3.05-7.82a2.01 2.01 0 0 1 1.9-1.37zM49 39c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2z" opacity="1" data-original="#e0dae0"></path><path fill="#b2a6b2" d="M57.61 32h-2.013l-2.99 7.66A3.678 3.678 0 0 1 49.181 42H35.173L34 45h20l4.56-11.68a.998.998 0 0 0-.95-1.32z" opacity="1" data-original="#b2a6b2"></path><circle cx="47" cy="39" r="2" fill="#b2a6b2" opacity="1" data-original="#b2a6b2"></circle><path fill="#ed907a" d="M28 43.42V44c0 .55-.45 1-1 1h-5v-4h3.58c.14 0 .28.01.41.04A2.41 2.41 0 0 1 28 43.42z" opacity="1" data-original="#ed907a"></path><path fill="#2f6bb2" d="M22 41H11v-2H6v-7.61c0-.84.52-1.58 1.3-1.88l5.4-2.02 2.63 1.43c.79.43 1.75.34 2.44-.21l1.53-1.22 5.4 2.02c.78.3 1.3 1.04 1.3 1.88V41l-.01.04a1.84 1.84 0 0 0-.41-.04z" opacity="1" data-original="#2f6bb2"></path><path fill="#73352a" d="M21.251 10.305v.01c0 1.55-1.26 2.81-2.81 2.81h-3.19c-.55 0-1 .45-1 1s-.45 1-1 1-1 .45-1 1v4c-.472 0-.917-.108-1.324-.289A3.276 3.276 0 0 0 14 22v-4c0-.55.45-1 1-1s1-.45 1-1 .45-1 1-1h3.19c1.55 0 2.81-1.26 2.81-2.81V7a3.993 3.993 0 0 1-1.749 3.305z" opacity="1" data-original="#73352a"></path><path fill="#fcbfa9" d="M11 41h11v4H8c-1.1 0-2-.9-2-2v-4h5zM21 15v6c0 1.66-1.34 3-3 3h-4v-6c0-.55.45-1 1-1s1-.45 1-1 .45-1 1-1h3.19z" opacity="1" data-original="#fcbfa9"></path><path fill="#ed907a" d="M20.19 15H17c-.55 0-1 .45-1 1s-.45 1-1 1-1 .45-1 1v3.5c0-.55.45-1 1-1s1-.45 1-1 .45-1 1-1h4V15zM19.3 27.49l-1.53 1.22c-.69.55-1.65.64-2.44.21l-2.63-1.43c.78-.3 1.3-1.04 1.3-1.88V24h4v1.61c0 .84.52 1.58 1.3 1.88z" opacity="1" data-original="#ed907a"></path><path fill="#606060" d="M54 9h-3a1 1 0 0 1-1-1V5a1 1 0 1 1 2 0v2h2a1 1 0 1 1 0 2z" opacity="1" data-original="#606060"></path></g></svg>

`
    return (
        <View>
            <SvgXml xml={searchicon} width={size} height={size} />
        </View>
    );
};
export default DocPaddingSvg;


