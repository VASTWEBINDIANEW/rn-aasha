// screens/DeclarationScreen.tsx

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  StepBanner,
  SectionCard,
  NavRow,
  getStepColor,
} from '../../components/FormUI';
import { colors } from '../../../../utils/styles/theme';
import { useFormCtx } from './FormContext';
import { hScale, wScale } from '../../../../utils/styles/dimensions';

const STEP = 6;

// ─── Declaration Data ─────────────────────────────────────
const SECTIONS = [
  {
    id: 'A',
    title: 'Self-Declaration',
    icon: 'file-account-outline',
    content: [
      'I acknowledge that I am being onboarded as an independent service provider and not as an employee of the Company and I shall carry out services in accordance with the terms of the separate service agreement and operational guidelines issued by the Company from time to time.',
      'I further declare that I have not been convicted of any criminal offence and no criminal proceedings are pending against me. I am not a wilful defaulter in repaying any borrowings (loans/credit cards) and have not been involved in any fraud or financial misconduct.',
      'I confirm that the information provided by me is true and complete. I understand that any misrepresentation or concealment may result in rejection of my onboarding or termination of my engagement, without prejudice to any legal action.',
    ],
  },
  {
    id: 'B',
    title: 'Code of Conduct',
    icon: 'scale-balance',
    content: [
      'I agree to act honestly, ethically, and in compliance with applicable laws.',
      'I shall maintain confidentiality of customer and Company information and adhere to data protection and security practices.',
      'I shall avoid any conflict of interest that may adversely affect my engagement.',
    ],
  },
  {
    id: 'C',
    title: 'Data Privacy Consent',
    icon: 'shield-lock-outline',
    content: [
      'I hereby acknowledge and confirm that I have read and understood the Data Privacy Notice and Consent Form (Annexure I) provided by the Company.',
      'I agree to provide my free, informed, and explicit consent to the collection, use, processing, storage, and sharing of my personal data in accordance with the said Annexure I and applicable laws.',
    ],
  },
];

// ─── Declaration Card ─────────────────────────────────────
const DeclCard = ({ section, color }: any) => (
  <View style={[dc.card, ]}>
    <View style={dc.body}>
      {section.content.map((para: string, idx: number) => (
        <View key={idx} style={dc.paraRow}>
          <View style={[dc.bullet, { backgroundColor: color }]} />
          <Text style={dc.paraText}>{para}</Text>
        </View>
      ))}
    </View>
  </View>
);

const dc = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: wScale(12),
    marginBottom: hScale(4),
    // borderLeftWidth: wScale(4),
    elevation: 2,
    shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  body: {
    padding: wScale(14),
  },
  paraRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: hScale(10),
  },
  bullet: {
    width: wScale(6),
    height: wScale(6),
    borderRadius: wScale(3),
    marginTop: hScale(7),
    marginRight: wScale(10),
  },
  paraText: {
    flex: 1,
    fontSize: wScale(13),
    color: '#475569',
    lineHeight: hScale(20),
  },
});

// ─── Main Screen ──────────────────────────────────────────
const DeclarationScreen =({ onNext }: { onNext: () => void }) => {
  const { nextStep, updateStep } = useFormCtx();
  const stepColor = getStepColor(STEP);

  const handleNext = () => {
    updateStep('declaration', { agreed: true });
    nextStep();
                onNext(7);
  };

  return (
    <View style={s.screen}>
      {/* <StepBanner currentStep={STEP} /> */}

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Sections */}
        {SECTIONS.map(section => (
          <SectionCard
            key={section.id}
            title={`Section ${section.id} — ${section.title}`}
            icon={section.icon}
            iconColor={stepColor}
          >
            <DeclCard
              section={section}
              color={stepColor}
            />
          </SectionCard>
        ))}

        {/* Note */}
        <View style={s.noteBox}>
          <MaterialCommunityIcons
            name="information-outline"
            size={wScale(16)}
            color="#92400E"
          />
          <Text style={s.noteText}>
            By tapping <Text style={s.noteBold}>Next</Text>, you confirm your agreement to all declarations above. This is legally binding.
          </Text>
        </View>

        <NavRow
          onNext={handleNext}
          stepColor={stepColor}
        />
      </ScrollView>
    </View>
  );
};

export default DeclarationScreen;

// ─── Styles ───────────────────────────────────────────────
const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.light_blue,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  noteBox: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    borderRadius: wScale(12),
    padding: wScale(14),
    marginTop: hScale(8),
    marginBottom: hScale(16),
    borderWidth: 1,
    borderColor: '#FDE68A',
    gap: wScale(10),
    alignItems: 'flex-start',
  },
  noteText: {
    flex: 1,
    fontSize: wScale(13),
    color: '#92400E',
    lineHeight: hScale(20),
  },
  noteBold: {
    fontWeight: '700',
  },
});