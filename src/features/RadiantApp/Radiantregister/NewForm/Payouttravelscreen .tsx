// screens/PayoutTravelScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  SectionCard,
  NavRow,
  getStepColor,
} from '../../components/FormUI';
import { colors }         from '../../../../utils/styles/theme';
import { useFormCtx }     from './FormContext';
import useAxiosHook       from '../../../../utils/network/AxiosClient';
import { APP_URLS }       from '../../../../utils/network/urls';
import { hScale, wScale } from '../../../../utils/styles/dimensions';
import { toast }          from './AadhaarPanVerification/types';

const STEP = 8;

// ─── InfoRow ──────────────────────────────────────────────
const InfoRow = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <View style={s.row}>
    <Text style={s.rowLabel}>{label}</Text>
    <Text style={[s.rowValue, { color }]}>{value}</Text>
  </View>
);

// ─── InfoGroup ────────────────────────────────────────────
const InfoGroup = ({ title, icon, color, children }: {
  title: string; icon: string; color: string; children: React.ReactNode;
}) => (
  <View style={s.group}>
    <View style={[s.groupHeader, { backgroundColor: color + '15' }]}>
      <MaterialCommunityIcons name={icon} size={wScale(14)} color={color} />
      <Text style={[s.groupTitle, { color }]}>{title}</Text>
    </View>
    <View style={s.groupBody}>{children}</View>
  </View>
);

// ─── Bullet ───────────────────────────────────────────────
const Bullet = ({ num, text, color }: { num: string; text: string; color: string }) => (
  <View style={s.bulletRow}>
    <View style={[s.bulletNum, { backgroundColor: color + '20' }]}>
      <Text style={[s.bulletNumText, { color }]}>{num}</Text>
    </View>
    <Text style={s.bulletText}>{text}</Text>
  </View>
);

// ─── Note Box ─────────────────────────────────────────────
const Note = ({ text }: { text: string }) => (
  <View style={s.noteBox}>
    <MaterialCommunityIcons name="information-outline" size={wScale(13)} color="#92400E" />
    <Text style={s.noteText}>{text}</Text>
  </View>
);

// ─── Section Header Badge ─────────────────────────────────
const SectionBadge = ({ letter, title, color }: { letter: string; title: string; color: string }) => (
  <View style={[s.badge, { borderLeftColor: color }]}>
    <View style={[s.badgeLetter, { backgroundColor: color }]}>
      <Text style={s.badgeLetterText}>{letter}</Text>
    </View>
    <Text style={[s.badgeTitle, { color }]}>{title}</Text>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────
const PayoutTravelScreen = ({ onNext }: { onNext: () => void }) => {
  const { post }    = useAxiosHook();
  const stepColor   = getStepColor(STEP);
  const [agreed,    setAgreed]  = useState(false);
  const [loading,   setLoading] = useState(false);

  // ── Prefill ───────────────────────────────────────────
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('📡 ShowForm7 URL:', APP_URLS.ShowForm7);
        const res = await post({ url: APP_URLS.ShowForm7 });
        console.log('✅ ShowForm7 RESPONSE:', JSON.stringify(res, null, 2));
        if (res?.StatusCode === 200) setAgreed(res.Content?.isagree === true);
      } catch (e) { console.log('❌ ShowForm7 ERROR:', e); }
    };
    fetchData();
  }, []);

  // ── Checkbox toggle → API ─────────────────────────────
  const handleToggle = async () => {
    const newValue = !agreed;
    setLoading(true);
    try {
      const url = `${APP_URLS.InsertForm7Update}?agree=${newValue}`;
      console.log('📡 InsertForm7 URL:', url);
      const res = await post({ url });
      console.log('✅ InsertForm7 RESPONSE:', JSON.stringify(res, null, 2));
      if (res?.StatusCode === 200) setAgreed(newValue);
      else toast('Could not save. Try again.');
    } catch (e) {
      console.log('❌ InsertForm7 ERROR:', e);
      toast('Something went wrong.');
    } finally { setLoading(false); }
  };

  const handleNext = () => {
    if (!agreed) { toast('Please agree to the payout & travel allowance terms'); return; }
    onNext(8); // ✅ RadiantStep goNext()
  };

  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* ── Page Header ── */}
        <View style={[s.pageHeader, { borderBottomColor: stepColor }]}>
          <View style={[s.pageHeaderIcon, { backgroundColor: stepColor + '18' }]}>
            <MaterialCommunityIcons name="cash-multiple" size={wScale(26)} color={stepColor} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.pageHeaderNum}>Section 8</Text>
            <Text style={[s.pageHeaderTitle, { color: stepColor }]}>Payout & Travel Allowance Structure</Text>
          </View>
        </View>

        {/* ── A. Commission / Minimum Guarantee ── */}
        <SectionCard title="Commission / Minimum Guarantee" icon="percent-outline" iconColor={stepColor}>
          <SectionBadge letter="A" title="Commission Rates" color={stepColor} />

          <InfoGroup title="Pickup Commission" icon="motorbike" color={stepColor}>
            <InfoRow label="Day Pickups"              value="₹1.20 / ₹1,000" color={stepColor} />
            <InfoRow label="Evening Pickups"          value="₹1.22 / ₹1,000" color={stepColor} />
            <InfoRow label="Payment Drop & Vaulting"  value="₹1.08 / ₹1,000" color={stepColor} />
          </InfoGroup>

          <InfoGroup title="Minimum Guarantee" icon="shield-check-outline" color={stepColor}>
            <InfoRow label="Primary Point"   value="₹3,800 / month" color={stepColor} />
            <InfoRow label="Secondary Point" value="₹800 / month"   color={stepColor} />
          </InfoGroup>

          <Note text="Higher of Commission or Minimum Guarantee will be paid to the RCE every month." />
        </SectionCard>

        {/* ── B. Travel Allowance ── */}
        <SectionCard title="Travel Allowance (TA)" icon="map-marker-distance" iconColor={stepColor}>
          <SectionBadge letter="B" title="TA Rates & Limits" color={stepColor} />

          <InfoGroup title="Rate Structure" icon="car-outline" color={stepColor}>
            <InfoRow label="Rate per KM"                  value="₹3 / KM"       color={stepColor} />
            <InfoRow label="Max Daily – Single Point"     value="14 KM"          color={stepColor} />
            <InfoRow label="Max Daily – Multiple Points"  value="30 KM"          color={stepColor} />
            <InfoRow label="Monthly Limit"                value="₹1,500 Max"     color={stepColor} />
          </InfoGroup>
        </SectionCard>

        {/* ── C. Operational Efficiency Bonus ── */}
        <SectionCard title="Operational Efficiency Bonus" icon="star-outline" iconColor={stepColor}>
          <SectionBadge letter="C" title="Multi-Location Incentive" color={stepColor} />

          <Text style={s.paraText}>
            This bonus is applicable to RCEs working across <Text style={[s.bold, { color: stepColor }]}>4 or more locations (Points)</Text> within a month.
          </Text>
          <Text style={s.paraText}>
            If the total earned commission remains below the Minimum Guarantee (MG) amount despite working at multiple points, an additional payout of <Text style={[s.bold, { color: stepColor }]}>₹1,500</Text> will be granted.
          </Text>
          <Note text="This amount will be paid as an extra incentive over and above the monthly Minimum Guarantee." />
        </SectionCard>

        {/* ── D. Cash Unavailability Policy ── */}
        <SectionCard title="Cash Unavailability Policy" icon="cash-remove" iconColor={stepColor}>
          <SectionBadge letter="D" title="Auto-Approval Rules" color={stepColor} />

          <Text style={s.paraText}>
            If cash is unavailable during the <Text style={[s.bold, { color: stepColor }]}>first two instances</Text> in a month, or if the available cash balance drops below <Text style={[s.bold, { color: stepColor }]}>₹2,000</Text>, the system will grant approval automatically.
          </Text>
          <Note text="Once this limit is exhausted, for every subsequent transaction up to ₹2,000, it will be mandatory for the RCE to take a selfie with an authorized store employee inside the store." />
        </SectionCard>

        {/* ── E. Leave & Penalty Policy ── */}
        <SectionCard title="Leave & Penalty Policy" icon="calendar-remove-outline" iconColor={stepColor}>
          <SectionBadge letter="E" title="Deductions & Leave Rules" color={stepColor} />

          {/* Primary Point */}
          <InfoGroup title="Primary Point — All Days Working" icon="calendar-check-outline" color={stepColor}>
            <Bullet num="1" color={stepColor} text="One Emergency Leave allowed (with system approval). Only for all-days-working RCEs." />
            <Bullet num="2" color={stepColor} text="Deduction for Extra Leave: ₹125 per day." />
            <Bullet num="3" color={stepColor} text="Deduction for Unapproved Leave: ₹250 per day." />
            <Bullet num="4" color={stepColor} text="All deductions will be done from the monthly payout." />
            <Bullet num="5" color={stepColor} text="Following the month of joining, a minimum of 20 pickups with NCR are mandatory every month to receive payment; otherwise the payment will not be released." />
          </InfoGroup>

          {/* Secondary Point */}
          <InfoGroup title="Secondary Point — All Days Working" icon="calendar-alert-outline" color={stepColor}>
            <Bullet num="1" color={stepColor} text="Deduction for Extra Leave: ₹150 per day." />
            <Bullet num="2" color={stepColor} text="Deduction for Unapproved Leave: ₹300 per day." />
            <Bullet num="3" color={stepColor} text="All deductions will be done from the monthly payout." />
            <Bullet num="4" color={stepColor} text="Following the month of joining, a minimum of 15 pickups with NCR are mandatory every month to receive payment; otherwise the payment will not be released." />
          </InfoGroup>
        </SectionCard>

        {/* ── Declaration + Checkbox ── */}
        <SectionCard title="Declaration" icon="file-sign" iconColor={agreed ? stepColor : '#94A3B8'}>
          <Text style={s.declText}>
            I hereby confirm that I have read and understood the payout structure and the terms of leave/deductions mentioned above. I agree to these terms.
          </Text>

          <TouchableOpacity
            style={[s.checkRow, agreed && { backgroundColor: stepColor + '12' }]}
            onPress={handleToggle}
            activeOpacity={0.7}
            disabled={loading}
          >
            <View style={[s.checkbox, { borderColor: stepColor }, agreed && { backgroundColor: stepColor }]}>
              {loading
                ? <ActivityIndicator size="small" color={agreed ? '#fff' : stepColor} />
                : agreed
                  ? <MaterialCommunityIcons name="check" size={wScale(14)} color="#fff" />
                  : null
              }
            </View>
            <Text style={[s.checkLabel, agreed && { color: stepColor, fontWeight: '600' }]}>
              {loading ? 'Saving...' : agreed ? 'Yes, I Agree ✓' : 'YES, I AGREE'}
            </Text>
          </TouchableOpacity>
        </SectionCard>

        <NavRow
          onNext={handleNext}
          stepColor={agreed ? stepColor : '#CBD5E1'}
        />
      </ScrollView>
    </View>
  );
};

export default PayoutTravelScreen;

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light_blue },
  scroll: { padding: 16, paddingBottom: 40 },

  // Page Header
  pageHeader:       { flexDirection: 'row', alignItems: 'center', gap: wScale(12), backgroundColor: '#fff', borderRadius: wScale(14), padding: wScale(16), marginBottom: hScale(14), borderBottomWidth: 3, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
  pageHeaderIcon:   { width: wScale(52), height: wScale(52), borderRadius: wScale(12), justifyContent: 'center', alignItems: 'center' },
  pageHeaderNum:    { fontSize: wScale(11), color: '#94A3B8', fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 2 },
  pageHeaderTitle:  { fontSize: wScale(15), fontWeight: '800', letterSpacing: 0.2 },

  // Section Badge
  badge:            { flexDirection: 'row', alignItems: 'center', gap: wScale(10), marginBottom: hScale(14), borderLeftWidth: 3, paddingLeft: wScale(10), paddingVertical: hScale(4) },
  badgeLetter:      { width: wScale(26), height: wScale(26), borderRadius: wScale(6), justifyContent: 'center', alignItems: 'center' },
  badgeLetterText:  { fontSize: wScale(13), fontWeight: '800', color: '#fff' },
  badgeTitle:       { fontSize: wScale(13), fontWeight: '700' },

  // InfoGroup
  group:       { marginBottom: hScale(14) },
  groupHeader: { flexDirection: 'row', alignItems: 'center', gap: wScale(6), paddingHorizontal: wScale(10), paddingVertical: hScale(8), borderRadius: wScale(8), marginBottom: hScale(8) },
  groupTitle:  { fontSize: wScale(12), fontWeight: '700', letterSpacing: 0.3 },
  groupBody:   { paddingHorizontal: wScale(2) },

  // InfoRow
  row:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: hScale(7), borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  rowLabel: { fontSize: wScale(12.5), color: '#475569', flex: 1 },
  rowValue: { fontSize: wScale(13), fontWeight: '700', textAlign: 'right' },

  // Bullet
  bulletRow:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: hScale(10), gap: wScale(10) },
  bulletNum:     { width: wScale(20), height: wScale(20), borderRadius: wScale(10), justifyContent: 'center', alignItems: 'center', flexShrink: 0, marginTop: hScale(1) },
  bulletNumText: { fontSize: wScale(11), fontWeight: '700' },
  bulletText:    { flex: 1, fontSize: wScale(13), color: '#475569', lineHeight: hScale(20) },

  // Para
  paraText: { fontSize: wScale(13), color: '#475569', lineHeight: hScale(20), marginBottom: hScale(8) },
  bold:     { fontWeight: '700' },

  // Note
  noteBox:  { flexDirection: 'row', backgroundColor: '#FFFBEB', borderRadius: wScale(10), padding: wScale(10), marginTop: hScale(6), borderWidth: 1, borderColor: '#FDE68A', gap: wScale(8), alignItems: 'flex-start' },
  noteText: { flex: 1, fontSize: wScale(12), color: '#92400E', lineHeight: hScale(18) },

  // Declaration
  declText:   { fontSize: wScale(13), color: '#475569', lineHeight: hScale(20), marginBottom: hScale(14) },
  checkRow:   { flexDirection: 'row', alignItems: 'center', paddingVertical: hScale(14), paddingHorizontal: wScale(4), borderTopWidth: 1, borderTopColor: '#F1F5F9', gap: wScale(12) },
  checkbox:   { width: wScale(24), height: wScale(24), borderRadius: wScale(6), borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  checkLabel: { fontSize: wScale(14), color: '#94A3B8', fontWeight: '500', flex: 1 },
});