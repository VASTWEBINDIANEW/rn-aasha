import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  BackHandler,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import { useFocusEffect } from '@react-navigation/native';
import { hScale, wScale } from '../../../utils/styles/dimensions';

const STEPS = [
  { label: 'Documents submitted', done: true },
  { label: 'Team verification',   done: false },
  { label: 'Final approval',      done: false },
];

const CheckPendingForm = () => {
  const navigation = useNavigation();

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('DashboardScreen');
        return true;
      };
      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [navigation])
  );

  return (
    <View style={s.root}>
      <AppBarSecond title="" />

      <View style={s.scroll}>

        {/* ── Icon + Status ── */}
        <View style={s.heroWrap}>
          <View style={s.iconCircle}>
            <MaterialCommunityIcons name="clock-outline" size={wScale(36)} color="#B45309" />
          </View>

          <View style={s.chip}>
            <MaterialCommunityIcons name="progress-clock" size={wScale(13)} color="#92400E" />
            <Text style={s.chipText}>Under review</Text>
          </View>

          <Text style={s.title}>Application submitted</Text>
          <Text style={s.subtitle}>
            Our team is reviewing your information. You'll be notified once the process is complete.
          </Text>
        </View>

        {/* ── Progress Card ── */}
        <View style={s.card}>
          <Text style={s.cardLabel}>REVIEW PROGRESS</Text>

          {STEPS.map((step, i) => (
            <View
              key={i}
              style={[s.stepRow, i === STEPS.length - 1 && { borderBottomWidth: 0, paddingBottom: 0 }]}
            >
              <View style={[s.dot, step.done && s.dotDone]} />
              <Text style={s.stepLabel}>{step.label}</Text>
              <View style={[s.badge, step.done ? s.badgeDone : s.badgePending]}>
                <Text style={[s.badgeText, step.done ? s.badgeTextDone : s.badgeTextPending]}>
                  {step.done ? 'Done' : 'Pending'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Info Box ── */}
        <View style={s.infoBox}>
          <MaterialCommunityIcons name="information-outline" size={wScale(16)} color="#6B7280" style={{ marginTop: 1 }} />
          <Text style={s.infoText}>
            Typically takes 1–2 business days. Check back here for updates.
          </Text>
        </View>

      </View>
    </View>
  );
};

export default CheckPendingForm;

const s = StyleSheet.create({
  root:       { flex: 1, backgroundColor: '#F8FAFC' },
  scroll:     { flex: 1, padding: wScale(16) },

  heroWrap:   { alignItems: 'center', paddingVertical: hScale(28) },
  iconCircle: { width: wScale(72), height: wScale(72), borderRadius: wScale(36), backgroundColor: '#FEF3C7', alignItems: 'center', justifyContent: 'center', marginBottom: hScale(14) },

  chip:       { flexDirection: 'row', alignItems: 'center', gap: wScale(5), backgroundColor: '#FEF3C7', borderWidth: 0.5, borderColor: '#F59E0B', borderRadius: wScale(20), paddingHorizontal: wScale(12), paddingVertical: hScale(4), marginBottom: hScale(12) },
  chipText:   { fontSize: wScale(12), fontWeight: '500', color: '#92400E' },

  title:      { fontSize: wScale(20), fontWeight: '500', color: '#111827', marginBottom: hScale(8), textAlign: 'center' },
  subtitle:   { fontSize: wScale(14), color: '#6B7280', textAlign: 'center', lineHeight: hScale(22), paddingHorizontal: wScale(20) },

  card:       { backgroundColor: '#fff', borderWidth: 0.5, borderColor: '#E5E7EB', borderRadius: wScale(12), padding: wScale(16), marginBottom: hScale(12) },
  cardLabel:  { fontSize: wScale(11), fontWeight: '500', color: '#9CA3AF', letterSpacing: 0.5, marginBottom: hScale(12) },

  stepRow:    { flexDirection: 'row', alignItems: 'center', gap: wScale(12), paddingVertical: hScale(10), borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  dot:        { width: wScale(8), height: wScale(8), borderRadius: wScale(4), backgroundColor: '#FCD34D' },
  dotDone:    { backgroundColor: '#34D399' },
  stepLabel:  { flex: 1, fontSize: wScale(13), color: '#6B7280' },

  badge:      { paddingHorizontal: wScale(8), paddingVertical: hScale(2), borderRadius: wScale(10) },
  badgeDone:  { backgroundColor: '#D1FAE5' },
  badgePending: { backgroundColor: '#FEF3C7' },
  badgeText:  { fontSize: wScale(11) },
  badgeTextDone:    { color: '#065F46' },
  badgeTextPending: { color: '#92400E' },

  infoBox:    { flexDirection: 'row', alignItems: 'flex-start', gap: wScale(10), backgroundColor: '#F9FAFB', borderRadius: wScale(10), padding: wScale(14), borderWidth: 0.5, borderColor: '#E5E7EB' },
  infoText:   { flex: 1, fontSize: wScale(13), color: '#6B7280', lineHeight: hScale(20) },
});