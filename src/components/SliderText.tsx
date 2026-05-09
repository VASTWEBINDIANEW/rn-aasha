import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marquee } from '@animatereactnative/marquee';
import { hScale, wScale } from '../utils/styles/dimensions';
import { RootState } from '../reduxUtils/store';
import { useSelector } from 'react-redux';

const NewsSlider = ({ data }) => {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);
    
    // Safety check: Agar data na ho toh null return karein
    if (!data || data.length === 0) return null;

    return (
        <View style={styles.container}>
            <Marquee spacing={0} speed={1}>
                <View style={styles.scrollContainer}>
                    {data.map((item, index) => (
                        <View key={index} style={styles.itemContainer}>
                            <Text style={styles.itemText}>
                                {item.App_Message?.replace(/\n/g, ' ')}
                                {/* Ek separator add karna achha hota hai */}
                                <Text style={{ color: colorConfig.primaryColor || '#ccc' }}>   ●   </Text>
                            </Text>
                        </View>
                    ))}
                </View>
            </Marquee>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#fff',
        marginBottom: hScale(5),
        paddingVertical: hScale(8), // Thoda padding vertical padding achha dikhta hai
        borderBottomWidth: 0.5,
        borderBottomColor: '#eee',
        justifyContent: 'center'
    },
    scrollContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemContainer: {
        // Width: '100%' hata diya gaya hai
        flexDirection: 'row',
        alignItems: 'center',
    },
    itemText: {
        fontSize: wScale(14),
        letterSpacing: 0.5,
        paddingHorizontal: wScale(5),
        color: '#333',
        fontWeight: '500',
        // Height fix nahi karni chahiye, padding se manage karein
        textAlignVertical: 'center',
    },
});

export default NewsSlider;