import React from 'react';
import { View, StyleSheet } from 'react-native';
import { hScale, wScale } from '../utils/styles/dimensions';
import CheckSvg from '../features/drawer/svgimgcomponents/CheckSvg';
import { useSelector } from 'react-redux';
import { RootState } from '../reduxUtils/store';

const CheckBT = ({
    color = '#fff',
    size
}) => {
        const { colorConfig, } = useSelector((state: RootState) => state.userInfo);

    return (
        <View>
            <View style={[styles.checkBtn, { borderColor: colorConfig.secondaryColor  }]}>

                <CheckSvg size={size} color={colorConfig.secondaryColor} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    checkBtn: {
        borderWidth: wScale(1),
        borderRadius: 200,
        alignItems: 'center',
        justifyContent: 'center',
        padding: wScale(4),
        
    },
});

export default CheckBT;
