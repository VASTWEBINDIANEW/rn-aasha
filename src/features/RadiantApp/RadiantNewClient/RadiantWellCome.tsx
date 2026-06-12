import { Animated, Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { hScale, wScale } from '../../../utils/styles/dimensions'
import * as Animatable from 'react-native-animatable';
import { APP_URLS, IMAGE_BASE_URL } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { getAssetSource } from '../../../utils/network/NetWorkImages';
import FastImage from 'react-native-fast-image';
const RadiantWellCome = () => {
    const fullText = "Radiant Cash Management Services Limited";
    const [displayedText, setDisplayedText] = useState('');
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const [latestVersion, setLatestVersion] = useState('');
    const { get } = useAxiosHook()
    useEffect(() => {
        const fetchVersion = async () => {
            try {
                const version = await get({ url: APP_URLS.current_version });
                setLatestVersion(version.currentversion);
            } catch (error) {
                console.error('Version fetch error:', error);
            }
        };
        fetchVersion();
    }, []);
    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.timing(scaleAnim, {
                toValue: 1.5, // Zoom level
                duration: 2000, // Animation duration
                useNativeDriver: true,
            }).start();
        }, 0); // Delay before zoom starts

        return () => clearTimeout(timer);
    }, []);
    useEffect(() => {
        let index = 0;
        const totalDuration = 500;
        const intervalTime = totalDuration / fullText.length;

        const interval = setInterval(() => {
            setDisplayedText(prev => prev + fullText[index]);
            index++;
            if (index === fullText.length) clearInterval(interval);
        }, intervalTime);

        return () => clearInterval(interval);
    }, []);


    const fontSizeAnim = useRef(new Animated.Value(20)).current; // Initial font size

    useEffect(() => {
        Animated.timing(fontSizeAnim, {
            toValue: 40, // Final font size
            duration: 3000, // 1 second
            useNativeDriver: false, // Font size can't use native driver
        }).start();
    }, []);
    return (
        <View style={styles.main}>
            <View style={styles.container}>
                <FastImage
                    // source={{uri:`${IMAGE_BASE_URL}${APP_URLS.cms_logo}`}}
                     source={getAssetSource('Radiant2.jpg')}
                    style={[styles.logo,
                        // { transform: [{ scale: scaleAnim }] }
                    ]}
                    resizeMode="contain"
                />
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                    {/* <Text style={styles.text}>{displayedText}</Text> */}
                    <Animated.Text style={[styles.text, { fontSize: wScale(20), letterSpacing: 5 }]} >
                        Welcome To
                    </Animated.Text>
                    <Animated.Text style={styles.text2} >
                        {fullText}
                    </Animated.Text>
                </Animated.View>



            </View>
            <View>
            </View>
            <Text style={styles.prevText}>
                App Version : V{latestVersion}
            </Text>
        </View>
    )
}

export default RadiantWellCome

const styles = StyleSheet.create({

    main: {
        flex: 1,

    },
    container: {
        flex: 1,
        paddingHorizontal: wScale(10),
        justifyContent: 'center',
    },
    logo: {
        height: wScale(120),
        width: wScale(120),
        resizeMode: 'contain',
        alignSelf: 'center'
    },
    text: {
        fontSize: wScale(12),
        fontWeight: 'bold',
        color: '#000',
        marginTop: hScale(30),
        textAlign: 'center'
    },
    text2: {
        fontSize: wScale(12),
        fontWeight: 'bold',
        color: '#000',
        marginTop: hScale(0),
        textAlign: 'center'
    },
    prevText: {
        fontSize: wScale(15),
        color: '#000',
        marginBottom: hScale(20),
        textAlign:'center'
    },

})
