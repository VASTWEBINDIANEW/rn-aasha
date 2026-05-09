import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BorderLine from './BorderLine';
import { hScale, wScale } from '../utils/styles/dimensions';
import { translate } from '../utils/languageUtils/I18n';

const ConfirmBox = ({ visible, title, message, onCancel, onConfirm }) => {
    return (
        <Modal transparent={true} visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.dialog}>
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>
                    <BorderLine />
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
                            <Text style={styles.cancelText}>{translate("Cancel")}</Text>
                        </TouchableOpacity>
                        <BorderLine width={wScale(0.5)} height={'100%'} />
                        <TouchableOpacity onPress={onConfirm} style={styles.deleteButton}>
                            <Text style={styles.deleteText}>{translate("Submit")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default ConfirmBox;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dialog: {
        width: wScale(300),
        backgroundColor: 'white',
        borderRadius: wScale(10),
        paddingVertical: hScale(20),
        paddingHorizontal:wScale(10),
        elevation: 10,
    },
    title: {
        fontSize: wScale(18),
        fontWeight: 'bold',
        marginBottom: hScale(10),
        textAlign: 'center',
        color:'#000'
    },
    message: {
        fontSize: wScale(15),
        color: '#000',
        textAlign: 'center',
        marginBottom: hScale(20),
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        padding: hScale(10),
        flex: 1,
        marginRight: wScale(5),
        alignItems: 'center',
    },
    deleteButton: {
        padding: hScale(10),
        flex: 1,
        marginLeft: wScale(5),
        alignItems: 'center',
    },
    cancelText: {
        color: 'blue',
        fontSize: wScale(16),
        fontWeight: 'bold',
    },
    deleteText: {
        color: 'green',
        fontSize: wScale(16),
        fontWeight: 'bold',
    },
});
