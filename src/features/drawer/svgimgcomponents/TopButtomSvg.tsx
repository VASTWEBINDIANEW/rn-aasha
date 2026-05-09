import React from "react";
import { View, Text } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";

const TopButtomSvg = ({ size = wScale(40),color="#fff" }) => {
    const searchicon = `


<svg  height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg" ><path clip-rule="evenodd" d="m7.64645 3.14645-5 5c-.19527.19526-.19527.51184 0 .70711.19526.19526.51184.19526.7071 0l4.14645-4.14645v15.79289c0 .2761.22386.5.5.5s.5-.2239.5-.5v-15.79289l3.6464 3.64644.5.50001c.1953.19526.5119.19526.7072 0 .1952-.19527.1952-.51185 0-.70711l-5.00005-5c-.19526-.19527-.51184-.19527-.7071 0zm7.99995 17.70715-5-5c-.1952-.1953-.1952-.5119 0-.7072.1953-.1952.5119-.1952.7072 0l4.1464 4.1465v-15.7929c0-.27614.2239-.5.5-.5s.5.22386.5.5v15.7929l4.1464-4.1465c.1953-.1952.5119-.1952.7072 0 .1952.1953.1952.5119 0 .7072l-5 5c-.1953.1952-.5119.1952-.7072 0z" fill="${color}" fill-rule="evenodd"/></svg>   



`
    return (
        <View>
            <SvgXml xml={searchicon} width={size} height={size}  />
        </View>
    );
};


export default TopButtomSvg;
