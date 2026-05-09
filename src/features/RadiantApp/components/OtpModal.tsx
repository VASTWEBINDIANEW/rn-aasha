// components/OtpModal.tsx
// Mobile + Email OTP verify karne ke liye reusable modal

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, Modal, TouchableOpacity, TextInput,
  StyleSheet, ActivityIndicator, Keyboard,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../utils/theme';

interface OtpModalProps {
  visible:   boolean;
  type:      'mobile' | 'email';           // which channel
  target:    string;                        // masked number/email to show
  onVerify:  (otp: string) => Promise<boolean>; // return true = success
  onClose:   () => void;
  onResend?: () => void;
}

const OTP_LENGTH = 6;

const OtpModal: React.FC<OtpModalProps> = ({
  visible, type, target, onVerify, onClose, onResend,
}) => {
  const [otp,       setOtp]       = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState(false);
  const [resendSec, setResendSec] = useState(30);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<TextInput[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (!visible) return;
    setResendSec(30); setCanResend(false);
    const t = setInterval(() => {
      setResendSec(s => {
        if (s <= 1) { clearInterval(t); setCanResend(true); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [visible]);

  // Reset on open
  useEffect(() => {
    if (visible) { setOtp(Array(OTP_LENGTH).fill('')); setError(''); setSuccess(false); }
  }, [visible]);

  const handleChange = (val: string, idx: number) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const next  = [...otp];
    next[idx]   = digit;
    setOtp(next);
    setError('');
    if (digit && idx < OTP_LENGTH - 1) inputRefs.current[idx + 1]?.focus();
    if (!digit && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < OTP_LENGTH) { setError('Enter complete OTP'); return; }
    setLoading(true);
    Keyboard.dismiss();
    const ok = await onVerify(code);
    setLoading(false);
    if (ok) { setSuccess(true); setTimeout(onClose, 1200); }
    else    { setError('Invalid OTP. Please try again.'); setOtp(Array(OTP_LENGTH).fill('')); inputRefs.current[0]?.focus(); }
  };

  const handleResend = () => {
    if (!canResend) return;
    onResend?.();
    setOtp(Array(OTP_LENGTH).fill(''));
    setError('');
    setResendSec(30); setCanResend(false);
  };

  const accentColor = type === 'mobile' ? '#F59E0B' : '#8B5CF6';
  const icon        = type === 'mobile' ? 'cellphone-message' : 'email-check-outline';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.sheet}>

          {/* Handle */}
          <View style={s.handle} />

          {/* Close */}
          <TouchableOpacity style={s.closeBtn} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>

          {success ? (
            /* ── Success state ─────────────────────────────── */
            <View style={s.successWrap}>
              <View style={[s.successCircle, { backgroundColor: `${COLORS.success}18` }]}>
                <View style={[s.successInner, { backgroundColor: COLORS.success }]}>
                  <MaterialCommunityIcons name="check-bold" size={30} color="#fff" />
                </View>
              </View>
              <Text style={s.successTitle}>Verified!</Text>
              <Text style={s.successSub}>
                {type === 'mobile' ? 'Mobile number' : 'Email address'} verified successfully
              </Text>
            </View>
          ) : (
            <>
              {/* Icon + Title */}
              <View style={[s.iconBox, { backgroundColor: `${accentColor}15` }]}>
                <MaterialCommunityIcons name={icon} size={28} color={accentColor} />
              </View>
              <Text style={s.title}>Verify {type === 'mobile' ? 'Mobile' : 'Email'}</Text>
              <Text style={s.sub}>
                OTP sent to{' '}
                <Text style={[s.target, { color: accentColor }]}>{target}</Text>
              </Text>

              {/* OTP Boxes */}
              <View style={s.otpRow}>
                {otp.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={r => { if (r) inputRefs.current[idx] = r; }}
                    style={[
                      s.otpBox,
                      { borderColor: digit ? accentColor : error ? COLORS.error : COLORS.border },
                      digit && { backgroundColor: `${accentColor}10` },
                    ]}
                    value={digit}
                    onChangeText={val => handleChange(val, idx)}
                    onKeyPress={e => handleKeyPress(e, idx)}
                    keyboardType="number-pad"
                    maxLength={1}
                    textAlign="center"
                    selectTextOnFocus
                  />
                ))}
              </View>

              {/* Error */}
              {!!error && (
                <View style={s.errorRow}>
                  <MaterialCommunityIcons name="alert-circle" size={14} color={COLORS.error} />
                  <Text style={s.errorText}>{error}</Text>
                </View>
              )}

              {/* Verify Button */}
              <TouchableOpacity
                style={[s.verifyBtn, { backgroundColor: accentColor }, loading && { opacity: 0.7 }]}
                onPress={handleVerify}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={s.verifyText}>Verify OTP</Text>
                }
              </TouchableOpacity>

              {/* Resend */}
              <View style={s.resendRow}>
                <Text style={s.resendLabel}>Didn't receive OTP? </Text>
                <TouchableOpacity onPress={handleResend} disabled={!canResend}>
                  <Text style={[s.resendBtn, { color: canResend ? accentColor : COLORS.textTertiary }]}>
                    {canResend ? 'Resend' : `Resend in ${resendSec}s`}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default OtpModal;

const s = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet:        { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36, alignItems: 'center' },
  handle:       { width: 40, height: 4, backgroundColor: COLORS.border, borderRadius: 99, marginBottom: 20 },
  closeBtn:     { position: 'absolute', top: 20, right: 20, padding: 4 },
  iconBox:      { width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  title:        { fontSize: 20, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  sub:          { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 24 },
  target:       { fontWeight: '700' },
  otpRow:       { flexDirection: 'row', gap: 10, marginBottom: 16 },
  otpBox:       { width: 46, height: 54, borderWidth: 1.5, borderRadius: 12, fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, backgroundColor: '#F9FAFB' },
  errorRow:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  errorText:    { fontSize: 12, color: COLORS.error },
  verifyBtn:    { width: '100%', height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  verifyText:   { fontSize: 15, fontWeight: '700', color: '#fff' },
  resendRow:    { flexDirection: 'row', alignItems: 'center' },
  resendLabel:  { fontSize: 13, color: COLORS.textSecondary },
  resendBtn:    { fontSize: 13, fontWeight: '700' },
  successWrap:  { alignItems: 'center', paddingVertical: 20 },
  successCircle:{ width: 100, height: 100, borderRadius: 50, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successInner: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 22, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  successSub:   { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center' },
});
