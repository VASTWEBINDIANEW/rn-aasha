import React from 'react';
import { ImageBackground, StyleSheet, View, Text } from 'react-native';
import { wScale } from '../../../utils/styles/dimensions';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';

const Bg = ({ children, titlecode }) => {
        const { colorConfig, } = useSelector((state: RootState) => state.userInfo);

    return (

        <View style={styles.overlay}>
            <Text style={[styles.overlaytext,
            // {color: colorConfig.secondaryColor}

            ]}>{titlecode}</Text>

            {children}

        </View>
    );
};

export default Bg;

const styles = StyleSheet.create({

    overlay: {
        justifyContent: 'center',
     

    },
    overlaytext:
    {
        position: 'absolute', left: wScale(8),
        fontSize: wScale(20),
         fontWeight:
         'bold', 
         letterSpacing: 10, 
         color: '#000',


    }


});
