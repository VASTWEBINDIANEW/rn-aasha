// src/screens/profile/components/DocCard.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { translate } from '../../../utils/languageUtils/I18n';
import { DocStatus } from '../hooks/useProfileData';

// ── Status config ─────────────────────────────────────────────────────────────
const STATUS_META: Record<DocStatus, { color: string; bg: string; label: string }> = {
  verified: { color: '#16a34a', bg: '#dcfce7', label: 'Verified' },
  pending:  { color: '#d97706', bg: '#fef3c7', label: 'Under Review' },
  upload:   { color: '#dc2626', bg: '#fee2e2', label: 'Upload Required' },
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface DocCardProps {
  label: string;
  value?: string;
  status: DocStatus;
  lottieSource: any;
  onPress: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────
const DocCard: React.FC<DocCardProps> = ({ label, value, status, lottieSource, onPress }) => {
  const meta = STATUS_META[status];

  return (
    <View style={s.card}>
      {/* Left status bar */}
      <View style={[s.statusBar, { backgroundColor: meta.color }]} />

      {/* Content */}
      <View style={s.body}>
        <Text style={s.label}>{label}</Text>
        {!!value && (
          <Text style={s.value} numberOfLines={1}>{value}</Text>
        )}
        <View style={[s.badge, { backgroundColor: meta.bg }]}>
          <Text style={[s.badgeText, { color: meta.color }]}>
            {translate(meta.label)}
          </Text>
        </View>
      </View>

      {/* Lottie action button */}
      <TouchableOpacity
        onPress={onPress}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <LottieView
          autoPlay
          loop
          style={{ height: hScale(46), width: wScale(46) }}
          source={lottieSource}
        />
      </TouchableOpacity>
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: wScale(12),
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: hScale(10),
    overflow: 'hidden',
  },
  statusBar: {
    width: wScale(5),
    alignSelf: 'stretch',
  },
  body: {
    flex: 1,
    paddingVertical: hScale(10),
    paddingHorizontal: wScale(12),
  },
  label: {
    fontSize: wScale(14),
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: hScale(2),
  },
  value: {
    fontSize: wScale(12),
    color: '#64748b',
    marginBottom: hScale(5),
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: wScale(9),
    paddingVertical: hScale(2),
    borderRadius: 20,
  },
  badgeText: {
    fontSize: wScale(11),
    fontWeight: '700',
  },
});

export default React.memo(DocCard);