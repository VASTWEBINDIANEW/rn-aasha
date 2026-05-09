import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated, Easing } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale } from "../../../utils/styles/dimensions";
import { useSelector } from "react-redux";
import { RootState } from "../../../reduxUtils/store";

const UpdateSvg = ({ 
    size = wScale(120), 
    color = "#fff", 
    color2 = "#fff", 
    progress = 0 // 0 to 100
}) => {
    // Animation value for height
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);


    const animatedValue = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: progress,
            duration: 500, // Smooth transition
            easing: Easing.linear,
            useNativeDriver: false, // Height ke liye false rakhna padega
        }).start();
    }, [progress]);

    // Interpolate progress to height percentage
    const heightInterpolate = animatedValue.interpolate({
        inputRange: [0, 100],
        outputRange: ["0%", "100%"],
    });

    const svgname = `
    <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 68 68">
        <g>
            <path fill="${color2}" d="M61.6 26.78v33.44c0 3.16-2.56 5.73-5.72 5.73H9.91c-2.19 0-4.17-.89-5.6-2.32A7.883 7.883 0 0 1 2 58.04V16.18c0-2.03 1.65-3.68 3.68-3.68h16.05c2.03 0 3.68 1.65 3.68 3.68v4.05c0 1.13.92 2.05 2.05 2.05H57.1c2.49 0 4.5 2.01 4.5 4.5z" opacity="0.4"></path>
            <path fill="#dbdbdb" d="M57.23 5.05v51.04c0 1.65-1.35 3-3 3H12.12c-1.66 0-3-1.35-3-3v-42.2h9.83c1.1 0 2-.9 2-2V2.05h33.28c1.65 0 3 1.34 3 3z"></path>
            <path d="M49.272 6.548h-20.37a.5.5 0 1 1 0-1h20.37a.5.5 0 1 1 0 1zM53.227 12.997H32.19a.5.5 0 1 1 0-1h21.038a.5.5 0 1 1 0 1zM29.69 12.997h-4.743a.5.5 0 1 1 0-1h4.742a.5.5 0 1 1 0 1zM53.227 19.447h-6.621a.5.5 0 1 1 0-1h6.621a.5.5 0 1 1 0 1zM43.606 19.447H24.439a.5.5 0 1 1 0-1h19.167a.5.5 0 1 1 0 1zM20.947 19.447h-7.8a.5.5 0 1 1 0-1h7.8a.5.5 0 1 1 0 1zM53.227 25.896H31.44a.5.5 0 1 1 0-1h21.788a.5.5 0 1 1 0 1zM28.901 25.896H13.147a.5.5 0 1 1 0-1h15.754a.5.5 0 1 1 0 1zM53.227 32.346h-40.08a.5.5 0 1 1 0-1h40.08a.5.5 0 1 1 0 1z" fill="#000" opacity="0.2"></path>
            <path fill="${color}" d="M66 33.36V59.4c0 3.62-2.93 6.55-6.54 6.55H9.91c4.36 0 7.9-3.55 7.9-7.91V33.36c0-2.14 1.74-3.88 3.89-3.88h40.41c2.15 0 3.89 1.74 3.89 3.88z"></path>
            <path fill="#ffffff" d="m55.92 53.128-3.09 1.65c-.15.08-.32.14-.48.16-.22.04-.45.02-.66-.04-.38-.12-.7-.38-.89-.73l-1.65-3.09a1.5 1.5 0 0 1 .61-2.03c.6-.32 1.33-.19 1.78.28.09-.53.13-1.07.13-1.62 0-5.49-4.47-9.95-9.96-9.95-1.79 0-3.55.48-5.07 1.39-.71.42-1.63.19-2.06-.52a1.51 1.51 0 0 1 .52-2.06c1.99-1.18 4.27-1.81 6.61-1.81 7.15 0 12.96 5.81 12.96 12.95 0 .98-.1 1.93-.32 2.86l.15-.08a1.5 1.5 0 0 1 1.42 2.64zM49.38 56.358c.47.69.29 1.62-.4 2.08a12.951 12.951 0 0 1-7.27 2.23c-7.15 0-12.96-5.81-12.96-12.96 0-1.21.17-2.41.51-3.57l-.07.03c-.76.34-1.65.02-1.99-.74-.35-.75-.02-1.64.73-1.99l3.18-1.46c.36-.16.78-.18 1.15-.04.37.14.68.42.84.78l1.46 3.18c.35.75.02 1.64-.73 1.99-.16.07-.33.11-.5.13-.5.04-1-.17-1.31-.58-.18.74-.27 1.5-.27 2.27 0 5.49 4.47 9.96 9.96 9.96 1.99 0 3.93-.59 5.59-1.71.69-.47 1.62-.28 2.08.4z"></path>
        </g>
    </svg>
    `;

    return (
        <View style={[styles.container, { width: size, height: size }]}>
            <View style={StyleSheet.absoluteFill}>
                 <Animated.View 
                    style={[
                        styles.filler, 
                        { height: heightInterpolate, backgroundColor: colorConfig.primaryButtonColor }
                    ]} 
                />
            </View>

            {/* SVG Overlay */}
            <View style={styles.svgWrapper}>
                <SvgXml xml={svgname} width={size} height={size} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20, // Optional: thoda round look ke liye
    },
    filler: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    svgWrapper: {
        zIndex: 1,
    }
});

export default UpdateSvg;