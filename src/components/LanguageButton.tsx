

import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons'; 
import { useSelector } from 'react-redux';
import { RootState } from '../reduxUtils/store'; // Path check karein
import { wScale, hScale } from '../utils/styles/dimensions';

const LanguageButton = () => {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);
    const navigation = useNavigation();

    return (
        <TouchableOpacity 
            style={styles.iconButton} 
            activeOpacity={0.7}
            onPress={() =>{
                navigation.navigate('LanguageSettings');
            
            }}
        >
            <Ionicons 
                name="language" 
                size={wScale(26)} 
                color={colorConfig.primaryColor} 
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    iconButton: {
        width: wScale(30),
        height: wScale(30),
        borderRadius: wScale(22.5), // Circular shape
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        // Shadow for premium look
        elevation: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        margin: wScale(5)
    },
});

export default LanguageButton;