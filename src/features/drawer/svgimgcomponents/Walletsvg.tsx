import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";
import { color } from "@rneui/base";

const WalletSvg = ({ size ,color="#000"}) => {
    
    const searchicon = `

    <svg enable-background="new 0 0 32 32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" fill=${color}><g id="Grid" display="none"/><g id="cloud"/><g id="start_up"/><g id="secure_payment"/><g id="ethereum"/><g id="bitcoin"/><g id="invoice"/><g id="credit_card"/><g id="wallet"><path d="m27.823 21.694h-2.993c-1.954 0-3.538-1.584-3.538-3.538 0-1.954 1.584-3.538 3.538-3.538h2.993c1.202 0 2.177.975 2.177 2.177v2.721c0 1.203-.975 2.178-2.177 2.178z"/><path d="m27.823 21.694h-2.993c-1.954 0-3.538-1.584-3.538-3.538 0-1.954 1.584-3.538 3.538-3.538h2.993c1.202 0 2.177.975 2.177 2.177v2.721c0 1.203-.975 2.178-2.177 2.178z"/><path d="m27.823 21.694h-2.993c-1.954 0-3.538-1.584-3.538-3.538 0-1.954 1.584-3.538 3.538-3.538h2.993c1.202 0 2.177.975 2.177 2.177v2.721c0 1.203-.975 2.178-2.177 2.178z"/><path d="m24.829 23.494c-2.943 0-5.337-2.394-5.337-5.337s2.394-5.338 5.337-5.338h2.994c.053 0 .102.014.155.016-.116-2.659-2.292-4.785-4.978-4.785h-16c-2.76 0-5 2.24-5 5v10.21c0 2.76 2.24 5 5 5h16c2.685 0 4.861-2.125 4.978-4.782-.052.002-.102.016-.155.016zm-12.901-9.252h-4.615c-.497 0-.9-.403-.9-.9s.403-.9.9-.9h4.616c.497 0 .9.403.9.9s-.404.9-.901.9z"/><path d="m7 6.25h16c.455 0 .898.047 1.328.132-.839-1.568-2.48-2.642-4.388-2.642h-12.94c-2.651 0-4.801 2.073-4.968 4.682 1.242-1.333 3.007-2.172 4.968-2.172z"/></g><g id="fintech"/><g id="exchange"/><g id="insurance"/><g id="financial_report"/><g id="time_is_money"/><g id="safety_box"/><g id="presentation"/><g id="digital_economy"/><g id="bill"/><g id="audit"/><g id="mining_cart"/><g id="investment"/><g id="clipboard"/><g id="transfer"/><g id="graph"/><g id="money_bag"/><g id="receipt"/></svg>    `
    return (
        <View>
            <SvgXml xml={searchicon} width={size} height={size} color={color} />
        </View>
    );
};


export default WalletSvg;
