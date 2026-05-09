import { translate } from "../utils/languageUtils/I18n";
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { hScale, wScale } from '../utils/styles/dimensions';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import { useSelector } from 'react-redux';
import { RootState } from '../reduxUtils/store';

const ShareGoback = ({
    onGoBack,
    onRefresh,
    onShare,
    onHome,
    iconColor = '#000',
    btnBgColor,
    buttonBg,
    submit,
    onCamera,
    goBackTitle = "Go Back" ,
    goBackIcon="chevron-back"
}) => {

    const { colorConfig } = useSelector((state: RootState) => state.userInfo);
    const color1 = `${colorConfig.primaryColor}20`;
    const finalBtnBgColor = btnBgColor || buttonBg || color1;

    return (
        <View style={styles.container}>
            {/* Go Back */}
            {onGoBack && (
                <TouchableOpacity
                    style={[styles.goBack, { backgroundColor: finalBtnBgColor }]}
                    onPress={onGoBack}
                >
                    <Ionicons name={goBackIcon} size={wScale(30)} color={iconColor} />
                    <Text style={styles.buttonText}>{goBackTitle}</Text>
                </TouchableOpacity>
            )}

            {/* Refresh */}
            {onRefresh && (
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: finalBtnBgColor }]}
                    onPress={onRefresh}
                >
                    <Icon name="refresh" size={wScale(30)} color={iconColor} />
                </TouchableOpacity>
            )}

            {/* Share */}
            {onShare && (
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: finalBtnBgColor }]}
                    onPress={onShare}
                >
                    <Icon name="share-alt" size={wScale(30)} color={iconColor} />
                </TouchableOpacity>
            )}

            {/* Home */}
            {onHome && (
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: finalBtnBgColor }]}
                    onPress={onHome}
                >
                    <Icon name="home" size={wScale(30)} color={iconColor} />
                </TouchableOpacity>
            )}

            {/* Camera */}
            {onCamera && (
                <TouchableOpacity
                    style={[styles.button, { backgroundColor: finalBtnBgColor }]}
                    onPress={onCamera}
                >
                    <Entypo name="camera" size={wScale(30)} color={iconColor} />
                </TouchableOpacity>
            )}

            {/* Submit */}
            {submit && (
                <TouchableOpacity
                    style={[styles.goBack, { backgroundColor: finalBtnBgColor }]}
                    onPress={submit}
                >
                    <Text style={[styles.buttonText, { marginRight: wScale(5) }]}>{translate("Submit")}</Text>
                    <Icon name="angle-double-right" size={wScale(30)} color={iconColor} />
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: wScale(100),
        height: wScale(60),
        width: wScale(60),
    },
    goBack: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: hScale(10),
        paddingHorizontal: wScale(30),
        borderRadius: wScale(100),
        height: wScale(60),
    },
    buttonText: {
        color: '#000',
        fontSize: wScale(22),
        marginLeft: wScale(5),
        fontWeight: 'bold',
    },
});

export default ShareGoback;
