import { translate } from "../utils/languageUtils/I18n";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, BackHandler, Modal, StyleSheet, Text, ToastAndroid, View } from "react-native";
import { hScale, wScale } from "../utils/styles/dimensions";
import { colors } from "../utils/styles/theme";
import { RootState } from "../reduxUtils/store";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from 'react-redux';

const ShowLoderTr = () => {
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
            onRequestClose={() => {
                setIsVisible(false);
              //  navigation.goBack();
            }}
        >
            <View style={styles.main}>
                <View style={styles.container}>
                    <ActivityIndicator
                        size={wScale(66)}
                        color={colorConfig.secondaryColor}
                        style={styles.loaderStyle}
                    />
                    <Text style={styles.title}>{translate("Waiting_for_Response")}</Text>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    main: {
        zIndex: 999,
        backgroundColor: 'rgba(0,0,0,0.0)',
        justifyContent: 'center',
        flex: 1
    },
    container: {
        backgroundColor: 'rgba(255,255,255,0.0)',
        paddingHorizontal: wScale(11),
        height: 160,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        alignSelf: 'center',
        marginVertical: hScale(10),
        // elevation: 5
    },
    loaderStyle: {
    },
    title: {
        fontSize: wScale(18),
        color: '#000',
        paddingTop: hScale(20),
        textAlign:'center'
    }
});

export default ShowLoderTr;
