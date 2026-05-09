import { translate } from "../utils/languageUtils/I18n";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    BackHandler,
    Modal,
    StyleSheet,
    Text,
    ToastAndroid,
    View,
    Image
} from "react-native";
import { hScale, wScale } from "../utils/styles/dimensions";
import { RootState } from "../reduxUtils/store";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from 'react-redux';
import FastImage from "react-native-fast-image";
import { APP_URLS } from "../utils/network/urls";
import { getImageSource } from "../utils/network/NetWorkImages";

const ShowLoader = () => {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);
    const [backPressCount, setBackPressCount] = useState(0);
    const [isVisible, setIsVisible] = useState(true);
    const navigation = useNavigation();

    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            if (backPressCount === 0) {
                setBackPressCount(1);
                ToastAndroid.show('Press back again to close', ToastAndroid.SHORT);

                setTimeout(() => setBackPressCount(0), 2000);
                return true;
            } else if (backPressCount === 1) {
                setIsVisible(false);
                navigation.goBack();
                return true;
            }
            return false;
        });

        return () => {
            backHandler.remove();
        };
    }, [backPressCount, navigation]);

    return (
        <Modal
            transparent={true}
            animationType="fade"
            visible={isVisible}
            onRequestClose={() => setIsVisible(false)}
        >
            <View style={styles.main}>
                <View style={styles.container}>

                    {/* Loader + Logo */}
                    <View style={styles.loaderWrapper}>
                        <ActivityIndicator
                            size={wScale(80)}
                            color={colorConfig?.secondaryColor || "#6C63FF"}
                        />

                        <FastImage
                            source={getImageSource(`${APP_URLS.app_logo}`)}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Text */}
                    <Text style={styles.title}>
                        {translate("Waiting_for_Response")}
                    </Text>

                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    main: {
        zIndex: 999,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        flex: 1
    },

    container: {
        backgroundColor: 'rgba(255,255,255,0.92)',
        paddingHorizontal: wScale(20),
        height: 180,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
        alignSelf: 'center',
    },

    loaderWrapper: {
        justifyContent: "center",
        alignItems: "center",
    },

    logo: {
        position: "absolute",
        width: wScale(50),
        height: wScale(50),
    },

    title: {
        fontSize: wScale(16),
        color: '#000',
        paddingTop: hScale(20),
        textAlign: 'center',
        fontWeight: "500"
    }
});

export default ShowLoader;