import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Easing,
  ToastAndroid,
  Clipboard,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { RootState } from '../../../reduxUtils/store';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';

// ─── Static doc list ──────────────────────────────────────────────────────────

const DOCS = [
  { label: 'Aadhaar card',    icon: 'card-account-details-outline' },
  { label: 'PAN card',        icon: 'credit-card-outline' },
  { label: 'Driving licence', icon: 'car-outline' },
  { label: 'Bank account',    icon: 'bank-outline' },
  { label: 'Security cheque', icon: 'checkbook' },
  { label: 'Education proof', icon: 'school-outline' },
];

// ─── Animated check circle ────────────────────────────────────────────────────

const CheckCircle: React.FC = () => {
  const scale      = useRef(new Animated.Value(0)).current;
  const ringScale  = useRef(new Animated.Value(0.6)).current;
  const ringOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 55,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(ringOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(ringScale, {
          toValue: 1,
          tension: 40,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.checkWrapper}>
      <Animated.View
        style={[
          styles.checkRing,
          { opacity: ringOpacity, transform: [{ scale: ringScale }] },
        ]}
      />
      <Animated.View style={[styles.checkCircle, { transform: [{ scale }] }]}>
        <Icon name="check-bold" size={wScale(40)} color="#27500A" />
      </Animated.View>
    </View>
  );
};

// ─── Pulsing dot ──────────────────────────────────────────────────────────────

const PulseDot: React.FC = () => {
  const anim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 0.2, duration: 750, easing: Easing.ease, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 1,   duration: 750, easing: Easing.ease, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return <Animated.View style={[styles.pulseDot, { opacity: anim }]} />;
};

// ─── Doc row with stagger animation ───────────────────────────────────────────

const DocRow: React.FC<{ label: string; icon: string; delay: number }> = ({
  label,
  icon,
  delay,
}) => {
  const translateX = useRef(new Animated.Value(30)).current;
  const opacity    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 350,
        delay,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 350,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.docRow, { opacity, transform: [{ translateX }] }]}>
      <View style={styles.docLeft}>
        <View style={styles.docIconWrap}>
          <Icon name={icon} size={wScale(16)} color="#0F6E56" />
        </View>
        <Text style={styles.docLabel}>{label}</Text>
      </View>
      <View style={styles.verifiedBadge}>
        <Icon name="check-circle" size={wScale(12)} color="#27500A" />
        <Text style={styles.verifiedText}>Verified</Text>
      </View>
    </Animated.View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const ApprovalStatusScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleCopy = () => {
    Clipboard.setString('RCE-2025-XXXX');
    ToastAndroid.show('RCE ID copied!', ToastAndroid.SHORT);
  };

  return (
    <View style={styles.root}>
      <AppBarSecond title="Verification Status" />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero ── */}
        <Animated.View
          style={[
            styles.heroSection,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
          ]}
        >
          <CheckCircle />

          <View style={styles.approvedPill}>
            <Icon name="shield-check-outline" size={wScale(13)} color="#3B6D11" />
            <Text style={styles.approvedPillText}>Documents Approved</Text>
          </View>

          <Text style={styles.heading}>Your Application is Verified!</Text>
          <Text style={styles.subHeading}>
            Our CMS team has reviewed and approved all your submitted documents successfully.
          </Text>
        </Animated.View>

        {/* ── RCE ID Card ── */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <LinearGradient
            colors={['#0B2845', '#103B6E', '#0D2F58']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.rceCard}
          >
            <View style={styles.rceDecorTop} />
            <View style={styles.rceDecorBottom} />

            <Text style={styles.rceCardLabel}>RCE AGENT ID</Text>

            <View style={styles.rceWaitRow}>
              <PulseDot />
              <Text style={styles.rceWaitText}>
                Please wait — RCE ID is being generated…
              </Text>
            </View>

            <View style={styles.rceBottomRow}>
              <Text style={styles.rcePlaceholder}>RCE — — — —</Text>
              {/* <TouchableOpacity
                style={styles.copyBtn}
                onPress={handleCopy}
                activeOpacity={0.7}
              >
                <Icon name="content-copy" size={wScale(14)} color="rgba(255,255,255,0.75)" />
                <Text style={styles.copyBtnText}>Copy</Text>
              </TouchableOpacity> */}
            </View>

            {/* progress bar */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '60%' }]} />
            </View>
            <Text style={styles.progressLabel}>Processing your agent profile…</Text>
          </LinearGradient>
        </Animated.View>

        {/* ── 2-col step cards ── */}
        <View style={styles.stepRow}>
          <View style={[styles.stepCard, { borderTopColor: '#3B6D11', borderTopWidth: 2.5 }]}>
            <View style={[styles.stepIconWrap, { backgroundColor: '#EAF3DE' }]}>
              <Icon name="file-check-outline" size={wScale(20)} color="#3B6D11" />
            </View>
            <Text style={styles.stepTitle}>Documents</Text>
            <Text style={styles.stepDesc}>All docs verified{'\n'}by CMS team</Text>
            <View style={styles.stepStatusDone}>
              <Icon name="check-circle" size={wScale(11)} color="#3B6D11" />
              <Text style={styles.stepStatusDoneText}>Done</Text>
            </View>
          </View>

          <View style={[styles.stepCard, { borderTopColor: '#854F0B', borderTopWidth: 2.5 }]}>
            <View style={[styles.stepIconWrap, { backgroundColor: '#FAEEDA' }]}>
              <Icon name="clock-outline" size={wScale(20)} color="#854F0B" />
            </View>
            <Text style={styles.stepTitle}>RCE ID</Text>
            <Text style={styles.stepDesc}>Will be issued{'\n'}shortly</Text>
            <View style={styles.stepStatusPending}>
              <Icon name="dots-horizontal" size={wScale(11)} color="#854F0B" />
              <Text style={styles.stepStatusPendingText}>Pending</Text>
            </View>
          </View>
        </View>

        {/* ── Approved docs list ── */}
        <View style={styles.docsCard}>
          <View style={styles.docsCardHeader}>
            <View style={styles.docsHeaderIconWrap}>
              <Icon name="check-all" size={wScale(16)} color="#3B6D11" />
            </View>
            <Text style={styles.docsCardTitle}>Approved Documents</Text>
            <View style={styles.docCountBadge}>
              <Text style={styles.docCountText}>{DOCS.length}</Text>
            </View>
          </View>

          {DOCS.map((doc, idx) => (
            <React.Fragment key={doc.label}>
              <DocRow {...doc} delay={idx * 80} />
              {idx < DOCS.length - 1 && <View style={styles.docDivider} />}
            </React.Fragment>
          ))}
        </View>

        {/* ── Info strip ── */}
        <View style={styles.infoStrip}>
          <Icon
            name="information-outline"
            size={wScale(18)}
            color="#185FA5"
            style={{ marginTop: 1 }}
          />
          <Text style={styles.infoStripText}>
            Once your RCE ID is generated, you will receive an SMS and email
            notification. You can then login to the agent portal and start working.
          </Text>
        </View>

        {/* ── Support ── */}
        <View style={styles.helpRow}>
          <Text style={styles.helpText}>Need help? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Support')}>
            <Text
              style={[
                styles.helpLink,
                { color: colorConfig?.primaryColor ?? '#185FA5' },
              ]}
            >
              Contact support
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({

  root: {
    flex: 1,
    backgroundColor: '#F2F4F8',
  },
  scroll: {
    paddingHorizontal: wScale(16),
    paddingTop: hScale(22),
    paddingBottom: hScale(50),
  },

  // ── hero
  heroSection: {
    alignItems: 'center',
    marginBottom: hScale(24),
  },
  checkWrapper: {
    width: wScale(110),
    height: wScale(110),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hScale(18),
  },
  checkRing: {
    position: 'absolute',
    width: wScale(110),
    height: wScale(110),
    borderRadius: wScale(55),
    borderWidth: 2,
    borderColor: '#C0DD97',
  },
  checkCircle: {
    width: wScale(88),
    height: wScale(88),
    borderRadius: wScale(44),
    backgroundColor: '#EAF3DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  approvedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wScale(5),
    backgroundColor: '#EAF3DE',
    paddingHorizontal: wScale(14),
    paddingVertical: hScale(5),
    borderRadius: wScale(50),
    marginBottom: hScale(12),
  },
  approvedPillText: {
    fontSize: wScale(11),
    fontWeight: '600',
    color: '#3B6D11',
    letterSpacing: 0.6,
  },
  heading: {
    fontSize: wScale(21),
    fontWeight: '700',
    color: '#0B1A2E',
    textAlign: 'center',
    marginBottom: hScale(8),
    lineHeight: hScale(30),
  },
  subHeading: {
    fontSize: wScale(13),
    color: '#5F5E5A',
    textAlign: 'center',
    lineHeight: hScale(20),
    paddingHorizontal: wScale(8),
  },

  // ── rce card
  rceCard: {
    borderRadius: wScale(20),
    padding: wScale(20),
    marginBottom: hScale(14),
    overflow: 'hidden',
  },
  rceDecorTop: {
    position: 'absolute',
    top: -wScale(30),
    right: -wScale(30),
    width: wScale(110),
    height: wScale(110),
    borderRadius: wScale(55),
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  rceDecorBottom: {
    position: 'absolute',
    bottom: -wScale(20),
    left: -wScale(10),
    width: wScale(70),
    height: wScale(70),
    borderRadius: wScale(35),
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  rceCardLabel: {
    fontSize: wScale(10),
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: 2,
    fontWeight: '600',
    marginBottom: hScale(12),
  },
  rceWaitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wScale(8),
    marginBottom: hScale(12),
  },
  pulseDot: {
    width: wScale(8),
    height: wScale(8),
    borderRadius: wScale(4),
    backgroundColor: '#EF9F27',
  },
  rceWaitText: {
    fontSize: wScale(13),
    color: '#FAC775',
    fontWeight: '500',
    flex: 1,
  },
  rceBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hScale(16),
  },
  rcePlaceholder: {
    fontSize: wScale(22),
    fontWeight: '700',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 3,
  },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wScale(5),
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: wScale(12),
    paddingVertical: hScale(7),
    borderRadius: wScale(8),
    borderWidth: 0.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  copyBtnText: {
    fontSize: wScale(12),
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '500',
  },
  progressTrack: {
    height: hScale(4),
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: hScale(2),
    overflow: 'hidden',
    marginBottom: hScale(6),
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00E5BE',
    borderRadius: hScale(2),
  },
  progressLabel: {
    fontSize: wScale(11),
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '400',
  },

  // ── step cards
  stepRow: {
    flexDirection: 'row',
    gap: wScale(10),
    marginBottom: hScale(14),
  },
  stepCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: wScale(16),
    padding: wScale(14),
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
    elevation: 2,
  },
  stepIconWrap: {
    width: wScale(40),
    height: wScale(40),
    borderRadius: wScale(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: hScale(10),
  },
  stepTitle: {
    fontSize: wScale(13),
    fontWeight: '700',
    color: '#0B1A2E',
    marginBottom: hScale(4),
  },
  stepDesc: {
    fontSize: wScale(11),
    color: '#888780',
    lineHeight: hScale(17),
    marginBottom: hScale(10),
  },
  stepStatusDone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wScale(4),
    backgroundColor: '#EAF3DE',
    paddingHorizontal: wScale(8),
    paddingVertical: hScale(3),
    borderRadius: wScale(50),
    alignSelf: 'flex-start',
  },
  stepStatusDoneText: {
    fontSize: wScale(10),
    color: '#3B6D11',
    fontWeight: '600',
  },
  stepStatusPending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wScale(4),
    backgroundColor: '#FAEEDA',
    paddingHorizontal: wScale(8),
    paddingVertical: hScale(3),
    borderRadius: wScale(50),
    alignSelf: 'flex-start',
  },
  stepStatusPendingText: {
    fontSize: wScale(10),
    color: '#854F0B',
    fontWeight: '600',
  },

  // ── docs card
  docsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: wScale(18),
    padding: wScale(16),
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.07)',
    elevation: 2,
    marginBottom: hScale(14),
  },
  docsCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wScale(8),
    marginBottom: hScale(14),
  },
  docsHeaderIconWrap: {
    width: wScale(28),
    height: wScale(28),
    borderRadius: wScale(8),
    backgroundColor: '#EAF3DE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docsCardTitle: {
    fontSize: wScale(14),
    fontWeight: '700',
    color: '#0B1A2E',
    flex: 1,
  },
  docCountBadge: {
    backgroundColor: '#0B2845',
    width: wScale(22),
    height: wScale(22),
    borderRadius: wScale(11),
    alignItems: 'center',
    justifyContent: 'center',
  },
  docCountText: {
    fontSize: wScale(11),
    color: '#fff',
    fontWeight: '700',
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hScale(10),
  },
  docLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  docIconWrap: {
    width: wScale(32),
    height: wScale(32),
    borderRadius: wScale(9),
    backgroundColor: '#E1F5EE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wScale(10),
  },
  docLabel: {
    fontSize: wScale(13),
    color: '#2C2C2A',
    fontWeight: '400',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: wScale(4),
    backgroundColor: '#EAF3DE',
    paddingHorizontal: wScale(10),
    paddingVertical: hScale(4),
    borderRadius: wScale(50),
  },
  verifiedText: {
    fontSize: wScale(11),
    color: '#27500A',
    fontWeight: '600',
  },
  docDivider: {
    height: 0.5,
    backgroundColor: 'rgba(0,0,0,0.07)',
    marginLeft: wScale(42),
  },

  // ── info strip
  infoStrip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wScale(10),
    backgroundColor: '#E6F1FB',
    borderRadius: wScale(14),
    padding: wScale(14),
    marginBottom: hScale(22),
    borderWidth: 0.5,
    borderColor: '#B5D4F4',
  },
  infoStripText: {
    flex: 1,
    fontSize: wScale(12),
    color: '#0C447C',
    lineHeight: hScale(19),
  },

  // ── help
  helpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpText: {
    fontSize: wScale(13),
    color: '#888780',
  },
  helpLink: {
    fontSize: wScale(13),
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default ApprovalStatusScreen;