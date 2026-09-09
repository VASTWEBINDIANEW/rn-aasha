import React, { useMemo } from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Platform,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Keyboard,
} from 'react-native';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import FlotingInput from '../../drawer/securityPages/FlotingInput';
import { useCardVerification } from './hooks/Usecardverification';
import VisaLogo from './CardTypeSVG/visaSvg';
import MastercardLogo from './CardTypeSVG/masterSvg';
import RupayLogo from './CardTypeSVG/rupaySvg';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { useNavigation } from '@react-navigation/native';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';

// Card Brand-wise Theme Palette (moved out of component — static, no need to recompute)
const CARD_THEMES: Record<
  string,
  { bg: string; bgAccent: string; text: string; badge: string; badgeText: string; chip: string }
> = {
  VISA: { bg: '#1a1f71', bgAccent: '#2b3199', text: '#ffffff', badge: 'rgba(255,183,3,0.18)', badgeText: '#ffb703', chip: '#e0c896' },
  MASTERCARD: { bg: '#16181d', bgAccent: '#262a33', text: '#ffffff', badge: 'rgba(235,0,27,0.18)', badgeText: '#ff5c6c', chip: '#d4af37' },
  RUPAY: { bg: '#0b4a3f', bgAccent: '#106958', text: '#ffffff', badge: 'rgba(243,156,18,0.18)', badgeText: '#f5b041', chip: '#d4af37' },
  AMEX: { bg: '#00568c', bgAccent: '#0072b8', text: '#ffffff', badge: 'rgba(255,255,255,0.18)', badgeText: '#ffffff', chip: '#b0bec5' },
  DISCOVER: { bg: '#a83e00', bgAccent: '#c94f00', text: '#ffffff', badge: 'rgba(241,196,15,0.2)', badgeText: '#ffd85e', chip: '#d4af37' },
  GENERIC: { bg: '#232c3d', bgAccent: '#334155', text: '#ffffff', badge: 'rgba(148,163,184,0.2)', badgeText: '#cbd5e1', chip: '#cbd5e1' },
  CARD: { bg: '#232c3d', bgAccent: '#334155', text: '#ffffff', badge: 'rgba(148,163,184,0.2)', badgeText: '#cbd5e1', chip: '#cbd5e1' },
};

const formatCardNumber = (raw: string) => raw.replace(/(\d{4})(?=\d)/g, '$1 ');

export default function CTATrasferScreen() {
  const {get,post}= useAxiosHook()
  const navigation = useNavigation()
  const [displayNumber, setDisplayNumber] = React.useState('5334670051802938');
  const { isValidCard, cardDetails, loading, error, checkCard } = useCardVerification();
  const { colorConfig, needUpdate, dashboardData, userId, themeChangeTime  ,ccd} =
    useSelector((state: RootState) => state.userInfo);

      const theme = useMemo(
    () => CARD_THEMES[cardDetails.scheme.toUpperCase()] ?? CARD_THEMES.GENERIC,
    [cardDetails.scheme]
  );

const handleCardNumberChange = async (text: string) => {
  const rawNumber = text.replace(/\D/g, '');
  const formattedNumber = formatCardNumber(rawNumber);
  setDisplayNumber(formattedNumber);

  // Hook validation ko turant execute karein
  const currentCard = checkCard(rawNumber); 
console.log(currentCard ,'###')
  if (rawNumber.length > 15) {
    try {
      const res = await post({ url: `${APP_URLS.CheckCardDetails}${rawNumber}` });
      Keyboard.dismiss();

      if (res?.StatusCode === 200 && res?.Content?.sts) {
        // Success case logic
      } else {
        Alert.alert(
          res?.Content?.Message || 'Alert',
          res?.Content?.Message || 'Card details not found.',
          [
            { text: 'X', style: 'cancel' },
            {
              text: 'Add New Beneficiary',
              style: 'destructive',
              onPress: () => {

                console.log(cardDetails)
                navigation.navigate('AddBeneficiaryScreen', {
                  StepNumber: res?.Content?.StepNumber,
                  // Agar checkCard() direct object return karta hai toh currentCard.type use karein,
                  // warna fallback 'CREDIT' ya API response se uthayein:
                  ct: ccd.scheme || cardDetails.scheme || 'CREDIT',
                  cn: rawNumber // displayNumber state ke bajay direct updated string pass karein
                });
              },
            },
          ]
        );
      }
    } catch (err) {
      console.error('API Error:', err);
    }
  }
};
const getLogo = (type: string) => {
  const t = type?.toUpperCase();

  switch (t) {
    case 'VISA':
      return <VisaLogo height={20} width={30} />;

    case 'MASTERCARD':
      return <MastercardLogo height={30} width={30} />;

    default:
      return <Text style={{ color: 'black' }}>{type}</Text>;
  }
};
  return (
    <KeyboardAvoidingView style={styles.main} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <AppBarSecond title={'Credit card to account'} />

        {/* --- MODERN CARD PREVIEW --- */}
    {cardDetails.bank &&    <View style={styles.cardPreviewContainer}>
          <View style={[styles.cardSurface, { backgroundColor: theme.bg }]}>
            {/* diagonal accent glow, purely decorative */}
            <View style={[styles.cardGlow, { backgroundColor: theme.bgAccent }]} />

            <View style={styles.cardTopRow}>
              <View style={[styles.chip, { backgroundColor: theme.chip }]}>
                <View style={styles.chipLineV} />
                <View style={styles.chipLineH} />
              </View>
              <Text style={[styles.cardBankName, { color: theme.text }]} numberOfLines={1}>
                {cardDetails.bank.toUpperCase()}
              </Text>
            </View>

            <Text style={[styles.cardDisplayNumber, { color: theme.text }]}>
              {displayNumber.length > 0 ? displayNumber : '•••• •••• •••• ••••'}
            </Text>

            <View style={styles.cardBottomRow}>
              <View>
                <Text style={styles.cardSmallLabel}>CARD TYPE</Text>
                
                <Text style={[styles.cardHolderName, { color: theme.text }]}>
                  {cardDetails.type.toUpperCase() || 'CREDIT'}
                </Text>
              </View>

              <View style={[styles.schemeTag, { backgroundColor: 'white' }]}>
 
                 {getLogo(cardDetails.scheme)}
                {/* <Text style={[styles.cardBrandText, { color: theme.badgeText }]}>
                  {cardDetails.scheme.toUpperCase()}
                </Text> */}
              </View>
            </View>
          </View>
        </View>}
 
 {/* <RupayLogo/> */}
        {/* --- INPUT FORM --- */}
        <View style={styles.inputWrapper}>
          <FlotingInput
            label={'Card Number'}
            value={displayNumber}
            keyboardType="numeric"
            maxLength={19}
            onChangeTextCallback={(v)=>handleCardNumberChange(v)}
            inputstyle={
              isValidCard === true ? styles.validInput : isValidCard === false ? styles.invalidInput : undefined
            }
            labelinputstyle={undefined}
          />

          {loading && (
            <View style={styles.statusRow}>
              <ActivityIndicator size="small" color="#4f46e5" />
              <Text style={styles.loadingText}>Verifying card with issuer…</Text>
            </View>
          )}
       <View
  style={{
    height: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 10,
  }}
>
  <TouchableOpacity
         onPress={() =>      navigation.navigate('AddBeneficiaryScreen', {
  StepNumber: '0',
 
})}

    style={{
      backgroundColor: colorConfig.primaryColor,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 6,
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <Text
      style={{
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
      }}
    >
      + New Beneficiary
    </Text>
  </TouchableOpacity>
</View>

          {!loading && error && (
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: '#f59e0b' }]} />
              <Text style={styles.warningInlineText}>{error}</Text>
            </View>
          )}

          {!loading && !error && isValidCard === false && (
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: '#e74c3c' }]} />
              <Text style={styles.errorText}>Invalid card number (checksum failed)</Text>
            </View>
          )}

          {!loading && !error && isValidCard === true && (
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: '#22c55e' }]} />
              <Text style={styles.successText}>Valid {cardDetails.scheme} card verified</Text>
            </View>
          )}

          {cardDetails.type.toUpperCase() === 'DEBIT' && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>
                ⚠️ This is a Debit card. Only Credit cards are accepted for this transfer.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  main: { flex: 1, backgroundColor: '#f6f7fb' },
  scrollContainer: { flexGrow: 1, paddingBottom: 30 },

  // Card UI
  cardPreviewContainer: { paddingHorizontal: 16, marginTop: 15, marginBottom: 10, alignItems: 'center' },
  cardSurface: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    padding: 22,
    justifyContent: 'space-between',
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  cardGlow: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    opacity: 0.5,
  },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chip: {
    width: 42,
    height: 30,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipLineV: { position: 'absolute', width: 1, height: '70%', backgroundColor: 'rgba(0,0,0,0.25)' },
  chipLineH: { position: 'absolute', width: '70%', height: 1, backgroundColor: 'rgba(0,0,0,0.25)' },
  cardBankName: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, maxWidth: '65%', textAlign: 'right' },
  cardDisplayNumber: { fontSize: 21, letterSpacing: 2.5, fontWeight: '600' },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardSmallLabel: { color: 'rgba(255,255,255,0.65)', fontSize: 9, letterSpacing: 1, fontWeight: '700' },
  cardHolderName: { fontSize: 13, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
  schemeTag: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 },
  cardBrandText: { fontSize: 13, fontWeight: '900', letterSpacing: 1 },

  // Input & status
  inputWrapper: { paddingHorizontal: 16, marginTop: 18 },
  validInput: { borderColor: '#22c55e' },
  invalidInput: { borderColor: '#e74c3c' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  loadingText: { color: '#4f46e5', fontSize: 12, fontWeight: '500' },
  errorText: { color: '#e74c3c', fontSize: 12, fontWeight: '600' },
  successText: { color: '#16a34a', fontSize: 12, fontWeight: '600' },
  warningInlineText: { color: '#b45309', fontSize: 12, fontWeight: '600' },
  warningBox: {
    backgroundColor: '#fef3c7',
    borderColor: '#fde68a',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginTop: 12,
  },
  warningText: { color: '#92400e', fontSize: 12, fontWeight: '600' },
});