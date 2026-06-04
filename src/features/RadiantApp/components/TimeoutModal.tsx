// components/TimeoutAlertModal.tsx

import React from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { hScale, wScale } from '../../../utils/styles/dimensions';

interface TimeoutAlertModalProps {
  visible: boolean;
  onOk: () => void;
  onDismiss: () => void;
}

const TimeoutAlertModal = ({ visible, onOk, onDismiss }: TimeoutAlertModalProps) => {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={tm.overlay}>
        <View style={tm.card}>

          <View style={tm.header}>
            <View style={tm.iconCircle}>
              <MaterialCommunityIcons name="clock-alert-outline" size={28} color="#fff" />
            </View>
            <Text style={tm.title}>Request Timeout</Text>
          </View>

          <View style={tm.body}>
            <Text style={tm.message}>
              Your transaction has been submitted, but we did not receive a response from the server.
            </Text>
            <View style={tm.infoBox}>
              <MaterialCommunityIcons name="information-outline" size={16} color="#B45309" style={{ marginTop: 1 }} />
              <Text style={tm.infoText}>
                Please check your transaction history to confirm the status.
              </Text>
            </View>
          </View>

          <View style={tm.footer}>
            <TouchableOpacity style={tm.primaryBtn} onPress={onOk} activeOpacity={0.85}>
              <MaterialCommunityIcons name="history" size={18} color="#fff" />
              <Text style={tm.primaryBtnText}>Check Transaction History</Text>
            </TouchableOpacity>
            <TouchableOpacity style={tm.secondaryBtn} onPress={onDismiss} activeOpacity={0.7}>
              <Text style={tm.secondaryBtnText}>Dismiss</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </Modal>
  );
};

export default TimeoutAlertModal;

const tm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 20, width: '100%', overflow: 'hidden' },
  header: { backgroundColor: '#FEF3C7', paddingVertical: hScale(24), alignItems: 'center', gap: hScale(10) },
  iconCircle: { width: wScale(56), height: wScale(56), borderRadius: wScale(28), backgroundColor: '#F59E0B', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: wScale(16), fontWeight: '600', color: '#92400E' },
  body: { paddingHorizontal: wScale(20), paddingTop: hScale(16) },
  message: { fontSize: wScale(13), color: '#6B7280', textAlign: 'center', lineHeight: hScale(21), marginBottom: hScale(12) },
  infoBox: { flexDirection: 'row', backgroundColor: '#FEF9EC', borderWidth: 0.5, borderColor: '#FDE68A', borderRadius: 10, padding: wScale(12), gap: wScale(8), alignItems: 'flex-start', marginBottom: hScale(4) },
  infoText: { flex: 1, fontSize: wScale(12), color: '#92400E', lineHeight: hScale(18) },
  footer: { padding: wScale(20), gap: hScale(10) },
  primaryBtn: { backgroundColor: '#1D4ED8', borderRadius: 12, paddingVertical: hScale(14), flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: wScale(8) },
  primaryBtnText: { color: '#fff', fontSize: wScale(14), fontWeight: '600' },
  secondaryBtn: { borderWidth: 0.5, borderColor: '#D1D5DB', borderRadius: 12, paddingVertical: hScale(13), alignItems: 'center' },
  secondaryBtnText: { fontSize: wScale(14), color: '#6B7280' },
});