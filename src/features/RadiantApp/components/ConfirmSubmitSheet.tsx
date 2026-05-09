// components/ConfirmSubmitSheet.tsx

import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { wScale, hScale } from '../../../utils/styles/dimensions';

interface ConfirmSubmitSheetProps {
  visible: boolean;
  onClose: () => void;
  onProceed: () => void;
}

const CHECKLIST = [
  'Personal & address details',
  'KYC documents uploaded',
  'Bank account verified',
  'Data privacy agreed',
];

const ConfirmSubmitSheet: React.FC<ConfirmSubmitSheetProps> = ({
  visible,
  onClose,
  onProceed,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* ── Backdrop ── */}
      <TouchableOpacity
        style={s.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* ── Sheet — inner TouchableOpacity stops backdrop press ── */}
        <TouchableOpacity activeOpacity={1} style={s.sheet}>

          {/* Drag handle */}
          <View style={s.handle} />

          {/* Header */}
          <View style={s.header}>
            <View style={s.iconCircle}>
              <MaterialCommunityIcons
                name="check-circle-outline"
                size={20}
                color="#1D4ED8"
              />
            </View>
            <View>
              <Text style={s.title}>Confirm submission</Text>
              <Text style={s.subtitle}>Please review before proceeding</Text>
            </View>
          </View>

          <View style={s.divider} />

          {/* Body */}
          <View style={s.body}>
            <Text style={s.desc}>
              Make sure all details are correct. Once submitted, changes may not be possible.
            </Text>

            {/* Checklist */}
            <View style={s.checklist}>
              {CHECKLIST.map((item) => (
                <View key={item} style={s.checkRow}>
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={16}
                    color="#16A34A"
                            style={s.checkIcon}        // ← marginRight add hua

                  />
                  <Text style={s.checkText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Buttons */}
          <View style={s.btnGroup}>
            <TouchableOpacity
              style={s.primaryBtn}
              onPress={onProceed}
              activeOpacity={0.85}
            >
              <Text style={s.primaryBtnText}>Yes, proceed</Text>
              <MaterialCommunityIcons name="arrow-right" size={18} color="#fff"       style={s.primaryBtnIcon} 
/>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.secondaryBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={s.secondaryBtnText}>Review again</Text>
            </TouchableOpacity>
          </View>

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

export default ConfirmSubmitSheet;

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: wScale(20),
    borderTopRightRadius: wScale(20),
    paddingBottom: hScale(32),
  },
  handle: {
    width: wScale(40),
    height: hScale(4),
    backgroundColor: '#D1D5DB',
    borderRadius: wScale(2),
    alignSelf: 'center',
    marginTop: hScale(10),
    marginBottom: hScale(18),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wScale(20),
    paddingBottom: hScale(14),
  },
  iconCircle: {
    width: wScale(36),
    height: wScale(36),
    borderRadius: wScale(18),
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wScale(10),   // ← gap replace
  },
  title: {
    fontSize: wScale(15),
    fontWeight: '600',
    color: '#111827',
  },
  subtitle: {
    fontSize: wScale(12),
    color: '#6B7280',
    marginTop: hScale(1),
  },
  divider: {
    height: 0.5,
    backgroundColor: '#E5E7EB',
  },
  body: {
    padding: wScale(20),
  },
  desc: {
    fontSize: wScale(13),
    color: '#6B7280',
    lineHeight: hScale(20),
    marginBottom: hScale(14),
  },
  checklist: {
    backgroundColor: '#F9FAFB',
    borderRadius: wScale(10),
    padding: wScale(14),
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hScale(10),   // ← gap replace
  },
  checkRowLast: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,            // ← last row ka extra space nahi
  },
  checkIcon: {
    marginRight: wScale(10),    // ← gap replace
  },
  checkText: {
    fontSize: wScale(13),
    color: '#1F2937',
  },
  btnGroup: {
    paddingHorizontal: wScale(20),
  },
  primaryBtn: {
    backgroundColor: '#111827',
    borderRadius: wScale(10),
    paddingVertical: hScale(14),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hScale(10),   // ← gap replace
  },
  primaryBtnIcon: {
    marginLeft: wScale(8),      // ← gap replace
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: wScale(14),
    fontWeight: '600',
  },
  secondaryBtn: {
    borderWidth: 0.5,
    borderColor: '#D1D5DB',
    borderRadius: wScale(10),
    paddingVertical: hScale(13),
    alignItems: 'center',
  },
  secondaryBtnText: {
    fontSize: wScale(14),
    color: '#6B7280',
  },
});