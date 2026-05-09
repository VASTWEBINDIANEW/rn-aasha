import { translate } from "../../../utils/languageUtils/I18n";
import React, { useEffect, useRef, memo } from "react";
import { StyleSheet, View, Text, Animated, Easing } from "react-native";
import { SvgXml } from "react-native-svg";
import { wScale, hScale } from "../../../utils/styles/dimensions";
import { FontSize } from "../../../utils/styles/theme";

// SVG string extracted as a constant outside component to avoid re-creation on every render
const QUESTION_MARK_SVG = `<svg clip-rule="evenodd" fill-rule="evenodd" height="512" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 64 64" width="512" xmlns="http://www.w3.org/2000/svg"><g id="Exp-2.-F"><path d="m14.387 32.075v-23.365c0-.266.106-.52.293-.707.188-.188.442-.293.707-.293h22.554l11.446 12.692v15.953s.004 1.215-.097 3.083l-5.631-2.043c-.673-.244-1.426-.11-1.973.353-.87.735-2.187 1.849-3.032 2.563-.51.431-1.2.579-1.841.396-1.944-.556-5.974-1.707-5.974-1.707s3.761 2.686 5.769 4.121c.728.52 1.713.493 2.412-.066.898-.719 2.115-1.692 2.931-2.345.551-.44 1.292-.558 1.952-.311l5.176 1.941c-.397 4.314-1.309 9.971-3.398 13.483-.183.289-.501.464-.843.464-3.827.003-26.548.003-32.899.003-.351 0-.676-.184-.857-.485-.18-.301-.19-.675-.025-.984 3.103-6.738 3.33-18.466 3.33-18.466v-1.311l4.388-1.645c.66-.247 1.401-.129 1.951.311.817.653 2.034 1.626 2.932 2.345.699.559 1.684.586 2.412.066 2.008-1.435 5.769-4.121 5.769-4.121s-4.03 1.151-5.974 1.707c-.641.183-1.332.035-1.841-.396-.845-.714-2.162-1.828-3.032-2.563-.547-.463-1.3-.597-1.973-.353z" fill="#cadcf0"/><path d="m48.579 42.153.501.2c-.397 4.314-1.309 9.976-3.399 13.49-.183.289-.501.464-.843.464-3.827.003-26.548.003-32.899.003-.351 0-.676-.185-.857-.486-.18-.3-.19-.674-.025-.984l.039-.086c12.314.579 30.196-1.578 32.551-2.5 1.75-.685 3.818-5.465 4.932-10.101z" fill="#a4bbdb"/><g fill="#347bfa"><path d="m49.387 20.402c-3.035-1.199-6.25-1.233-9.549-.723-.306.048-.617-.049-.842-.263-.224-.214-.337-.52-.304-.828.362-3.694-.003-7.308-.751-10.878 4.838 3.591 8.659 7.819 11.446 12.692z"/><path d="m6.078 23.778 5 5.87c.358.421.989.471 1.409.113s.471-.989.113-1.409l-5-5.87c-.358-.421-.989-.471-1.41-.113-.42.358-.47.989-.112 1.409z"/><path d="m6.132 32.504 3.549.951c.533.143 1.082-.174 1.225-.707s-.174-1.082-.707-1.225l-3.549-.951c-.534-.143-1.082.174-1.225.707s.174 1.082.707 1.225z"/><path d="m5.661 40.729 6.678-3.856c.478-.276.642-.888.366-1.366s-.888-.642-1.366-.366l-6.678 3.856c-.478.276-.642.888-.366 1.366s.888.642 1.366.366z"/><path d="m57.922 51.214-5-5.87c-.358-.42-.989-.47-1.409-.113-.42.358-.471.99-.113 1.41l5 5.87c.358.42.989.471 1.41.113.42-.358.47-.99.112-1.41z"/><path d="m57.868 42.489-3.549-.951c-.533-.143-1.082.174-1.225.707s.174 1.082.707 1.225l3.549.951c.534.142 1.082-.174 1.225-.708.143-.533-.174-1.081-.707-1.224z"/><path d="m58.339 34.264-6.678 3.855c-.478.276-.642.888-.366 1.366s.888.642 1.366.366l6.678-3.855c.478-.276.642-.888.366-1.366s-.888-.642-1.366-.366z"/><path d="m19.864 16.9 3.536 3.536c.39.39 1.024.39 1.414 0 .39-.391.39-1.024 0-1.415l-3.536-3.535c-.39-.39-1.024-.39-1.414 0s-.39 1.024 0 1.414z"/><path d="m23.4 15.486-3.536 3.535c-.39.391-.39 1.024 0 1.415.39.39 1.024.39 1.414 0l3.536-3.536c.39-.39.39-1.024 0-1.414s-1.024-.39-1.414 0z"/><path d="m30.864 16.9 3.536 3.536c.39.39 1.024.39 1.414 0 .39-.391.39-1.024 0-1.415l-3.536-3.535c-.39-.39-1.024-.39-1.414 0s-.39 1.024 0 1.414z"/><path d="m34.4 15.486-3.536 3.535c-.39.391-.39 1.024 0 1.415.39.39 1.024.39 1.414 0l3.536-3.536c.39-.39.39-1.024 0-1.414s-1.024-.39-1.414 0z"/><path d="m22.438 26.409 1.403-1.051s1.397 1.05 1.397 1.05c.356.267.845.267 1.201 0l1.4-1.05s1.4 1.05 1.4 1.05c.355.267.844.267 1.2 0l1.4-1.05s1.4 1.05 1.4 1.05c.441.331 1.069.242 1.4-.2.331-.441.241-1.068-.2-1.4l-1.999-1.5c-.356-.266-.845-.266-1.2 0l-1.401 1.05s-1.4-1.05-1.4-1.05c-.355-.266-.844-.266-1.2 0l-1.4 1.05s-1.396-1.049-1.396-1.049c-.355-.267-.844-.268-1.2-.001l-2.003 1.5c-.442.331-.532.958-.202 1.4.331.441.958.532 1.4.201z"/></g></g></svg>`;

const NoDataFound = ({ size = wScale(200) }) => {
    // Animation refs
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.7)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;
    const textFadeAnim = useRef(new Animated.Value(0)).current;
    const textSlideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        // Entry animation: fade + scale in together
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 60,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();

        // Text fades in slightly after icon
        Animated.sequence([
            Animated.delay(300),
            Animated.parallel([
                Animated.timing(textFadeAnim, {
                    toValue: 1,
                    duration: 400,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
                Animated.timing(textSlideAnim, {
                    toValue: 0,
                    duration: 400,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }),
            ]),
        ]).start();

        // Continuous gentle float loop
        const floatLoop = Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: -10,
                    duration: 1800,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 1800,
                    easing: Easing.inOut(Easing.sin),
                    useNativeDriver: true,
                }),
            ])
        );

        // Start float after entry animation settles
        const timer = setTimeout(() => floatLoop.start(), 600);

        return () => {
            clearTimeout(timer);
            floatLoop.stop();
        };
    }, []);

    return (
        <View style={styles.nodataview}>
            {/* Icon with entry + float animation */}
            <Animated.View
                style={{
                    opacity: fadeAnim,
                    transform: [
                        { scale: scaleAnim },
                        { translateY: floatAnim },
                    ],
                }}
            >
                <SvgXml xml={QUESTION_MARK_SVG} width={size} height={size} />
            </Animated.View>

            {/* Text with fade + slide-up animation */}
            <Animated.Text
                style={[
                    styles.nodata,
                    {
                        opacity: textFadeAnim,
                        transform: [{ translateY: textSlideAnim }],
                    },
                ]}
            >
                {translate("No_Data_Found")}
            </Animated.Text>
        </View>
    );
};

const styles = StyleSheet.create({
    nodata: {
        width: "100%",
        textAlign: "center",
        color: "#000",
        fontWeight: "bold",
        fontSize: FontSize.heading,
        marginTop: hScale(8),
    },
    nodataview: {
        alignItems: "center",
        paddingBottom: hScale(20),
    },
});

// memo se unnecessary re-renders rokein
export default memo(NoDataFound);