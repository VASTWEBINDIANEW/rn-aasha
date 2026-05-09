import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { hScale, wScale } from '../utils/styles/dimensions';
import CmsPostPaySvg from '../features/drawer/svgimgcomponents/CmsPostPaySvg';
import { translate } from '../utils/languageUtils/I18n';

const CheckPickupstatusModel = ({ visible, onClose,onSave,title }) => {

    return (
        <Modal
            transparent={true}
            visible={visible}
            animationType="fade"
        >
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Please Note That it's{"\n"} <Text style={styles.important}>{translate("Important")}</Text></Text>
                    <View style={{ alignSelf: 'center' }}>
                        <CmsPostPaySvg />

                    </View>
                    <Text style={styles.message}>{translate("key_sorryyou_121")}</Text>

                    <Text style={styles.solutionTitle}>{translate("The_following_solutions_are_available")}</Text>
                    <Text style={styles.solutionText}>{translate("key_firstdepo_122")}</Text>
                    <Text style={styles.solutionText}>{translate("key_iftheent_123")}</Text>
                    <Text style={styles.solutionText}>{translate("key_iftherei_124")}</Text>
                    <Text style={styles.solutionText}>{translate("key_iftherei_125")}</Text>

                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={[styles.button, styles.payButton]} onPress={onSave}>
                            <Text style={styles.buttonText}>{title}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, styles.closeButton]} onPress={onClose}>
                            <Text style={styles.buttonText}>{'Close'}</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </Modal>
    );
};

export default CheckPickupstatusModel;

const styles = StyleSheet.create({
    modalBackground: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: 'rgba(0,0,0,0.8)',
        paddingHorizontal: wScale(10),
        paddingVertical: hScale(20),
        borderRadius: wScale(10),
    },
    title: {
        fontSize: wScale(24),
        color: '#fff',
        marginBottom: hScale(10),
        textAlign: 'center',
        fontWeight: 'bold',
        letterSpacing: wScale(2),
    },
    important: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: wScale(35),
        textTransform: 'uppercase',
        letterSpacing: wScale(0),
    },
    message: {
        color: '#fff',
        fontSize: wScale(14),
        marginVertical: hScale(10),
        textAlign: 'justify',
        fontWeight: 'bold',
    },
    solutionTitle: {
        color: '#fff',
        fontWeight: 'bold',
        marginTop: hScale(10),
        marginBottom: hScale(5),
        fontSize: wScale(15),
    },
    solutionText: {
        color: '#fff',
        fontSize: wScale(13),
        marginBottom: hScale(5),
        textAlign: 'justify',
    },
    button: {
        marginTop: hScale(15),
        backgroundColor: '#ffff66',
        padding: hScale(12),
        borderRadius: wScale(5),
        alignItems: 'center',
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: wScale(14),
    },
    buttonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: hScale(20),
},

payButton: {
  backgroundColor: '#ffff66',
  flex: 1,
  marginRight: wScale(10),
},

closeButton: {
  backgroundColor: '#ccc',
  flex: 1,
},

});

