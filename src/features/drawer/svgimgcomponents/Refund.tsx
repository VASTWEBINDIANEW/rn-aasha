import React from "react";
import { View, Image } from "react-native";
import { getAssetSource } from "../../../utils/network/NetWorkImages";
import FastImage from "react-native-fast-image";

const Refund = ({ size, color }) => {
    return (
        <View
            style={{
                width: size, 
                height: size, 
                backgroundColor: color, 
                borderRadius: 50, 
                justifyContent: 'center',
                alignItems: 'center', 
            }}
        >
            <FastImage 
                style={{ height: size * 0.9, width: size * 0.5 }} 
                source={getAssetSource('refund.png')}
                resizeMode="contain"
            />
        </View>
    );
};

export default Refund;
