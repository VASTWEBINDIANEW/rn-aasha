// components/FormUI.tsx
// Reusable: StepBanner | SectionCard | AppInput | SelectPicker | AppButton | NavRow

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator,
  ScrollView,
  Modal,
  Pressable,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// ── tumhara existing theme import ─────────────────────────────────────────────
import { colors, useColorsOfApi } from '../../../utils/styles/theme'; // apna path adjust karo
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { hScale, wScale } from '../../../utils/styles/dimensions';

// ── Step config — yahan se label/icon change karo ────────────────────────────
const STEPS = [
  { label: 'KYC',              icon: 'shield-check'             }, // 0  — AadhaarPanVerification
  { label: 'Personal Details', icon: 'account'                  }, // 1  — BasicInfoScreen
  { label: 'Address',          icon: 'map-marker-outline'       }, // 2  — AddressScreen
  { label: 'Education',        icon: 'school-outline'           }, // 3  — EducationScreen
  { label: 'References',       icon: 'account-multiple-outline' }, // 4  — ReferenceScreen
  { label: 'Driving License',  icon: 'card-account-details'     }, // 5  — DrivingLicenseScreen
  { label: 'Documents',        icon: 'paperclip'                }, // 6  — AttachedDocuments
  { label: 'Declaration',      icon: 'clipboard-check-outline'  }, // 7  — DeclarationScreen
  { label: 'Payout & Travel',  icon: 'cash-fast'                }, // 8  — PayoutTravelScreen
  { label: 'Bank Account',     icon: 'account-cash-outline'     }, // 9  — BankAccountScreen
  { label: 'Security Cheque',  icon: 'checkbook'                }, // 10 — SecurityChequeScreen
  { label: 'Data Privacy',     icon: 'shield-lock-outline'      }, // 11 — DataPrivacyScreen
] as const;
// ── Per-step accent colors — tumhare colors object se liye hain ───────────────
const STEP_COLORS = [
  colors.lochmara,       // Step 1 — KYC        → blue
  colors.primary,        // Step 2 — Basic Info  → green
  colors.warning,        // Step 3 — Education   → orange
  colors.premium_banner, // Step 4 — References  → violet
];

export const getStepColor = (step: number) => STEP_COLORS[step] ?? colors.primary;

// ─────────────────────────────────────────────────────────────────────────────
// StepBanner
// ─────────────────────────────────────────────────────────────────────────────
export const StepBanner = ({
  currentStep,
  onBack,
  steps,       // ✅ optional — agar pass na ho to default global STEPS use hoga
}: {
  currentStep: number;
  onBack?: () => void;
  steps?: { label: string; icon: string }[];
}) => {
  const activeSteps = steps ?? STEPS;   // ✅ flow-specific steps fallback

  const color = getStepColor(currentStep);
  const step = activeSteps[currentStep];
  const total = activeSteps.length;
  const navigation = useNavigation();
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={[sb.banner1, { backgroundColor: 'rgba(0,0,0,0.2)' }]}>
      <View style={[sb.banner, { backgroundColor: `${colorConfig.primaryColor}85` }]}>

        <View style={sb.topRow}>

          {/* Left — Back button */}
          <TouchableOpacity
            style={sb.iconCircle}
            onPress={handleBack}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="arrow-left" size={18} color={color} />
          </TouchableOpacity>

          {/* Center — Step label */}
          <Text style={sb.title} ellipsizeMode="tail"
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.5} >{step?.label}</Text>

          {/* Right — Step icon */}
          <View style={sb.iconCircle}>
            <MaterialCommunityIcons name={step?.icon ?? 'circle'} size={18} color={color} />
          </View>

        </View>

        <Text style={sb.stepLabel}>STEP {currentStep + 1} OF {total}</Text>

        <View style={sb.barTrack}>
          <View style={[sb.barFill, { width: `${((currentStep + 1) / total) * 100}%` as any }]} />
        </View>

      </View>
    </View>
  );
};

const sb = StyleSheet.create({
  banner: {
    paddingHorizontal: wScale(20),
    paddingTop: hScale(10),
    // paddingBottom: hScale(20),
    borderBottomLeftRadius: wScale(20),
    borderBottomRightRadius: wScale(20),
  },
  banner1: {
    borderBottomLeftRadius: wScale(20),
    borderBottomRightRadius: wScale(20),
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hScale(4),
  },
  stepLabel: {
    fontSize: wScale(10),
    color: colors.white_07,
    fontWeight: '600',
    letterSpacing: wScale(1.5),
    textAlign: 'center',
    marginBottom: hScale(4),

  },
  iconCircle: {
    width: wScale(32),
    height: wScale(32),
    borderRadius: wScale(16),
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: wScale(22),
    fontWeight: '700',
    color: colors.white,

  },
  barTrack: {
    height: hScale(4),
    backgroundColor: colors.white_02,
    borderRadius: wScale(99),
    marginBottom: hScale(14),
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: colors.white,
    borderRadius: wScale(99),
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dotWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: wScale(24),
    height: wScale(24),
    borderRadius: wScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotActive: { backgroundColor: colors.white },
  dotDone: { backgroundColor: colors.white },
  dotFuture: { backgroundColor: colors.white_04 },
  dotNum: {
    fontSize: wScale(10),
    fontWeight: '700',
    color: colors.white_06,
  },
  connector: {
    flex: 1,
    height: hScale(2),
    backgroundColor: colors.white_04,
    marginHorizontal: wScale(2),
  },
  connectorDone: { backgroundColor: colors.white },
});

// ─────────────────────────────────────────────────────────────────────────────
// SectionCard
// ─────────────────────────────────────────────────────────────────────────────
export const SectionCard = ({
  title, icon, iconColor = colors.primary, children,
}: {
  title?: string; icon?: string; iconColor?: string; children: React.ReactNode;
}) => (
  <View style={sc.card}>
    {title && (
      <View style={sc.header}>
        {icon && <MaterialCommunityIcons name={icon} size={15} color={iconColor} />}
        <Text style={[sc.title, { color: iconColor }]}>{title}</Text>
      </View>
    )}
    {children}
  </View>
);

const sc = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: 14, padding: 16, marginBottom: 14, elevation: 2, shadowColor: colors.dark_blue, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 8, borderWidth: 0.5, borderColor: colors.border },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, paddingBottom: 12, borderBottomWidth: 0.5, borderBottomColor: colors.border },
  title: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
});

// ─────────────────────────────────────────────────────────────────────────────
// AppInput
// ─────────────────────────────────────────────────────────────────────────────
interface AppInputProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  onBlur?: () => void;
  error?: string;
  touched?: boolean;
  placeholder?: string;
  keyboardType?: any;
  maxLength?: number;
  autoCapitalize?: any;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
}




export const AppInput: React.FC<AppInputProps & { renderRight?: () => React.ReactNode }> = ({
  label, value, onChangeText, onBlur, error, touched,
  placeholder, keyboardType, maxLength, autoCapitalize,
  multiline, numberOfLines, editable = true,
  renderRight, // <--- Isse destructure karein
  ...props      // Baaki props TextInput ke liye
}) => {
  const [focused, setFocused] = useState(false);
  const hasError = !!(touched && error);
  const isValid = !!(touched && !error && value?.length > 0);

  const borderColor = hasError ? colors.error
    : focused ? colors.primary
      : isValid ? colors.seaGreen
        : colors.border;

  return (
    <View style={ai.wrap}>
      <Text style={ai.label}>{label}</Text>
      
      {/* --- Ye raha wo updated block --- */}
      <View style={[ai.box, { borderColor, flexDirection: 'row', alignItems: 'center' }, multiline && ai.boxMulti]}>
        <TextInput
          style={[ai.input, { flex: 1 }, multiline && ai.inputMulti]} // flex: 1 se text input baki jagah le lega
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => { setFocused(false); onBlur?.(); }}
          placeholder={placeholder ?? label}
          placeholderTextColor={colors.grey}
          keyboardType={keyboardType ?? 'default'}
          maxLength={maxLength}
          autoCapitalize={autoCapitalize ?? 'sentences'}
          multiline={multiline}
          numberOfLines={numberOfLines}
          editable={editable}
          {...props}
        />
        
        {/* Right side mein button ya icon dikhane ke liye logic */}
        {renderRight ? (
          renderRight()
        ) : (
          isValid && (
            <MaterialCommunityIcons name="check-circle" size={16} color={colors.seaGreen} />
          )
        )}
      </View>
      {/* --------------------------------- */}

      {hasError && (
        <View style={ai.errorRow}>
          <MaterialCommunityIcons name="alert-circle" size={12} color={colors.error} />
          <Text style={ai.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};









const ai = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '600', color: colors.dark_gray, marginBottom: 5, letterSpacing: 0.3 },
  box: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 12, backgroundColor: colors.white, paddingHorizontal: 12, height: 50, gap: 6 },
  boxMulti: { height: 'auto' as any, paddingVertical: 10, alignItems: 'flex-start' },
  input: { flex: 1, fontSize: 14, color: colors.black, paddingVertical: 0 },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  errorText: { fontSize: 11, color: colors.error },
});

// ─────────────────────────────────────────────────────────────────────────────
// SelectPicker — pill selector
// ─────────────────────────────────────────────────────────────────────────────
export const SelectPicker = ({
  label, options, value, onChange, error, touched,
}: {
  label: string; options: string[]; value: string;
  onChange: (v: string) => void; error?: string; touched?: boolean;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={ai.label}>{label}</Text>

      {/* ── Trigger button ── */}
      <TouchableOpacity
        style={[sp.trigger, !!(touched && error) && sp.triggerError]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <Text style={[sp.triggerText, !value && sp.placeholder]}>
          {value || `Select ${label}`}
        </Text>
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color={colors.dark_gray}
        />
      </TouchableOpacity>

      {/* ── Error ── */}
      {!!(touched && error) && (
        <View style={ai.errorRow}>
          <MaterialCommunityIcons name="alert-circle" size={12} color={colors.error} />
          <Text style={ai.errorText}>{error}</Text>
        </View>
      )}

      {/* ── Dropdown Modal ── */}
      <Modal
        transparent
        visible={open}
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={sp.overlay} onPress={() => setOpen(false)}>
          <View style={sp.sheet}>

            {/* Header */}
            <View style={sp.sheetHeader}>
              <Text style={sp.sheetTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setOpen(false)} activeOpacity={0.7}>
                <MaterialCommunityIcons name="close" size={20} color={colors.dark_gray} />
              </TouchableOpacity>
            </View>

            {/* Options */}
            <ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              style={{ maxHeight: hScale(300) }}
            >
              {options.map((opt, idx) => {
                const isSelected = value === opt;
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[
                      sp.option,
                      isSelected && sp.optionActive,
                      idx === options.length - 1 && { borderBottomWidth: 0 },
                    ]}
                    onPress={() => { onChange(opt); setOpen(false); }}
                    activeOpacity={0.7}
                  >
                    <Text style={[sp.optionText, isSelected && sp.optionTextActive]}>
                      {opt}
                    </Text>
                    {isSelected && (
                      <MaterialCommunityIcons name="check" size={16} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const sp = StyleSheet.create({
  // Trigger
  trigger:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1.5, borderColor: colors.grey_border, borderRadius: wScale(10), paddingHorizontal: wScale(14), paddingVertical: hScale(12), backgroundColor: colors.white },
  triggerError: { borderColor: colors.error },
  triggerText:  { fontSize: wScale(13), color: colors.dark_gray, fontWeight: '500', flex: 1 },
  placeholder:  { color: '#9CA3AF' },

  // Modal
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet:        { backgroundColor: colors.white, borderTopLeftRadius: wScale(20), borderTopRightRadius: wScale(20), paddingBottom: hScale(32), overflow: 'hidden' },
  sheetHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wScale(20), paddingVertical: hScale(16), borderBottomWidth: 1, borderBottomColor: colors.grey_border },
  sheetTitle:   { fontSize: wScale(15), fontWeight: '700', color: colors.dark_gray },

  // Options
  option:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wScale(20), paddingVertical: hScale(14), borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  optionActive:     { backgroundColor: colors.primary + '10' },
  optionText:       { fontSize: wScale(14), color: colors.dark_gray, fontWeight: '400' },
  optionTextActive: { color: colors.primary, fontWeight: '600' },
});
// ─────────────────────────────────────────────────────────────────────────────
// AppButton
// ─────────────────────────────────────────────────────────────────────────────
interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  iconRight?: boolean;
  color?: string;
  style?: any;
}
export const AppButton: React.FC<AppButtonProps> = ({
  title, onPress, variant = 'primary', loading, disabled,
  icon, iconRight, color, style,
}) => {

  // ✅ API se color lo
  const { btnprimary, btnsecondary } = useColorsOfApi();

  const bg = variant === 'primary'
    ? (color ?? btnprimary)
    : colors.transparency;

  const borderC = variant === 'outline'
    ? (color ?? btnprimary)
    : colors.transparency;

  const textC = variant === 'primary'
    ? colors.white
    : (color ?? btnprimary);

  return (
    <TouchableOpacity
      style={[
        bt.base,
        {
          backgroundColor: bg,
          borderColor: borderC,
          borderWidth: variant === 'outline' ? 1.5 : 0,
        },
        (disabled || loading) && { opacity: 0.5 },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} size="small" />
      ) : (
        <>
          {icon && !iconRight && (
            <MaterialCommunityIcons name={icon} size={18} color={textC} style={{ marginRight: 6 }} />
          )}
          <Text style={[bt.text, { color: textC }]}>{title}</Text>
          {icon && iconRight && (
            <MaterialCommunityIcons name={icon} size={18} color={textC} style={{ marginLeft: 6 }} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const bt = StyleSheet.create({
  base: { height: hScale(50), borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, elevation: 3, shadowColor: colors.dark_blue, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10 },
  text: { fontSize: wScale(15), fontWeight: '700', letterSpacing: 0.3 },
});


export const NavRow = ({
  onNext,
  nextLabel = 'Next',
  loading,
  stepColor,
}: {
  onNext: () => void;
  nextLabel?: string;
  loading?: boolean;
  stepColor?: string;
}) => (
  <View style={{ flexDirection: 'row', paddingTop: 8 }}>
    <AppButton
      title={nextLabel}
      onPress={onNext}
      
      loading={loading}
      icon="arrow-right"
      iconRight
      color={stepColor}
      style={{ flex: 1 }}
    />
  </View>
);

interface AppRadioGroupProps {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  error?: string;
  touched?: boolean;
}

export const AppRadioGroup: React.FC<AppRadioGroupProps> = ({
  label, options, value, onChange, error, touched,
}) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={ai.label}>{label}</Text>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt}
          style={[sp.pill, value === opt && sp.pillActive]}
          onPress={() => onChange(opt)}
          activeOpacity={0.75}
        >
          <Text style={[sp.text, value === opt && sp.textActive]}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
    {!!(touched && error) && (
      <View style={ai.errorRow}>
        <MaterialCommunityIcons name="alert-circle" size={12} color={colors.error} />
        <Text style={ai.errorText}>{error}</Text>
      </View>
    )}
  </View>
);

// ─────────────────────────────────────────────────────────────────────────────
// AppToggle — boolean switch ke liye
// ─────────────────────────────────────────────────────────────────────────────
import { Switch } from 'react-native';
import { useNavigation } from '../../../utils/navigation/NavigationService';

interface AppToggleProps {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

export const AppToggle: React.FC<AppToggleProps> = ({ label, value, onChange }) => (
  <View style={tog.row}>
    <Text style={ai.label}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onChange}
      trackColor={{ false: colors.grey_border, true: colors.primary }}
      thumbColor={colors.white}
    />
  </View>
);

const tog = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 6,
  },
});