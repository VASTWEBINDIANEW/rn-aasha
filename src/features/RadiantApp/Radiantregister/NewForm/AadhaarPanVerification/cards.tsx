// cards.tsx

import React from "react";
import {
  View, Text, StyleSheet,
  TextInput, TouchableOpacity,
} from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import { AadhaarState, PanState, MobileState, EmailState } from "./types";
import { hScale, wScale } from "../../../../../utils/styles/dimensions";
import ShowLoaderBtn from "../../../../../components/ShowLoaderBtn";
import { useColorsOfApi } from "../../../../../utils/styles/theme";

// ─── CardHeader ───────────────────────────────────────────────────────────────
export const CardHeader = ({
  subtitle, title, iconName, iconBg, iconColor, verified,
}: {
  subtitle: string; title: string; iconName: string;
  iconBg: string; iconColor: string; verified: boolean;
}) => (
  <View style={s.cardHeader}>
    <View style={[s.iconBox, { backgroundColor: iconBg }]}>
      <MaterialCommunityIcons name={iconName} size={20} color={iconColor} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={s.cardSubtitle}>{subtitle}</Text>
      <Text style={s.cardTitle}>{title}</Text>
    </View>
    <View style={[s.badge, verified ? s.badgeVerified : s.badgePending]}>
      <MaterialCommunityIcons
        name={verified ? "check-circle" : "clock-outline"}
        size={11}
        color={verified ? "#166534" : "#854d0e"}
      />
      <Text style={[s.badgeText, { color: verified ? "#166534" : "#854d0e" }]}>
        {verified ? "Verified" : "Pending"}
      </Text>
    </View>
  </View>
);

// ─── OtpInputBlock ────────────────────────────────────────────────────────────
export const OtpInputBlock = ({
  otpValue, otpError, loading, accentColor,
  onOtpChange, onVerify, onReset, resetLabel,
}: {
  otpValue: string; otpError: string; loading: boolean; accentColor: string;
  onOtpChange: (t: string) => void; onVerify: () => void;
  onReset: () => void; resetLabel: string;
}) => {
  const { primary } = useColorsOfApi();
  const isReady = otpValue.length >= 4 && !loading;
  const otpBorder = otpError ? "#EF4444"
    : otpValue.length >= 4 ? "#10B981" : "#E5E7EB";

  return (
    <>
      <View style={s.inputWrap}>
        <Text style={s.inputLabel}>Enter OTP</Text>
        <View style={[s.inputBox, { borderColor: otpBorder }]}>
          <TextInput
            style={s.textInput}
            value={otpValue}
            onChangeText={onOtpChange}
            placeholder="Enter OTP"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
          />
          <Text style={s.counter}>{otpValue.length}/6</Text>
        </View>
        {!!otpError && (
          <View style={s.hintRow}>
            <MaterialCommunityIcons name="alert-circle" size={12} color="#EF4444" />
            <Text style={[s.hintText, { color: "#EF4444" }]}>{otpError}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[s.verifyBtn, isReady ? { backgroundColor: accentColor } : s.verifyBtnOff]}
        onPress={onVerify}
        disabled={!isReady}
        activeOpacity={0.85}
      >
        {loading
          ? <ShowLoaderBtn color={primary} size="small" />
          : <>
            <MaterialCommunityIcons
              name="shield-check-outline" size={16}
              color={isReady ? "#fff" : "#9CA3AF"}
            />
            <Text style={[s.verifyBtnText, { color: isReady ? "#fff" : "#9CA3AF" }]}>
              Verify OTP
            </Text>
          </>
        }
      </TouchableOpacity>

      <TouchableOpacity onPress={onReset} style={{ alignSelf: "center", marginTop: hScale(8) }}>
        <Text style={s.resetText}>{resetLabel}</Text>
      </TouchableOpacity>
    </>
  );
};

// ─── VerifiedStrip ────────────────────────────────────────────────────────────
const VerifiedStrip = ({
  label, sub, accentColor, onReset, locked = false,
}: {
  label: string; sub: string; accentColor: string;
  onReset?: () => void; locked?: boolean;  // ← optional
}) => (
  <View style={s.verifiedStrip}>
    <View style={s.verifiedCheck}>
      <MaterialCommunityIcons name="check" size={14} color="#fff" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={s.verifiedLabel}>{label}</Text>
      <Text style={s.verifiedSub}>{sub}</Text>
    </View>
    {/* locked ho to Re-verify nahi dikhega */}
    {!locked && onReset && (
      <TouchableOpacity onPress={onReset}>
        <Text style={[s.reVerify, { color: accentColor }]}>Re-verify</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── OtpSentStrip ─────────────────────────────────────────────────────────────
const OtpSentStrip = ({
  label, sub, accentColor, bgColor, borderColor,
}: {
  label: string; sub: string;
  accentColor: string; bgColor: string; borderColor: string;
}) => (
  <View style={[s.verifiedStrip, { backgroundColor: bgColor, borderColor }]}>
    <MaterialCommunityIcons name="message-arrow-right-outline" size={20} color={accentColor} />
    <View style={{ flex: 1, marginLeft: wScale(8) }}>
      <Text style={[s.verifiedLabel, { color: accentColor }]}>{label}</Text>
      <Text style={[s.verifiedSub, { color: accentColor }]}>{sub}</Text>
    </View>
  </View>
);

// ─── AadhaarCard ──────────────────────────────────────────────────────────────
export const AadhaarCard = ({
  aadhaar, isValid, onChange, onSendOtp, onOtpChange, onVerifyOtp, onReset,
}: {
  aadhaar: AadhaarState; isValid: boolean;
  onChange: (t: string) => void; onSendOtp: () => void;
  onOtpChange: (t: string) => void; onVerifyOtp: () => void; onReset: () => void;
}) => {
  const { primary } = useColorsOfApi();
  const ACCENT = "#1a56db";
  const borderColor = aadhaar.error ? "#EF4444"
    : aadhaar.value.length > 0 && isValid ? "#10B981" : "#E5E7EB";

  const header = (
    <CardHeader
      subtitle="IDENTITY PROOF" title="Aadhaar Verification"
      iconName="card-account-details-outline"
      iconBg="#EBF3FF" iconColor={ACCENT}
      verified={aadhaar.verified}
    />
  );

  if (aadhaar.verified) {
    return (
      <View style={s.card}>
        {header}
        <VerifiedStrip
          label="Aadhaar Verified Successfully"
          sub={`XXXX XXXX ${aadhaar.value.slice(8)}`}
          accentColor={ACCENT}
          onReset={undefined}   // ← Re-verify button nahi dikhega
          locked={true} />
      </View>
    );
  }

  if (aadhaar.otpSent) {
    return (
      <View style={s.card}>
        {header}
        <OtpSentStrip
          label="OTP sent to registered mobile"
          sub={`Aadhaar: XXXX XXXX ${aadhaar.value.slice(8)}`}
          accentColor="#1e40af"
          bgColor="#EBF3FF"
          borderColor="#93C5FD"
        />
        <View style={{ marginTop: hScale(12) }}>
          <OtpInputBlock
            otpValue={aadhaar.otpValue}
            otpError={aadhaar.otpError}
            loading={aadhaar.loading}
            accentColor={ACCENT}
            onOtpChange={onOtpChange}
            onVerify={onVerifyOtp}
            onReset={onReset}
            resetLabel="Wrong Aadhaar? Start again"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={s.card}>
      {header}
      <View style={s.inputWrap}>
        <Text style={s.inputLabel}>Aadhaar Number</Text>

        <View style={[s.inputBox, {
          borderColor,
          backgroundColor: aadhaar.prefilled ? "#F3F4F6" : "#F9FAFB"  // ← grey = locked
        }]}>

          <TextInput
            style={[s.textInput, aadhaar.prefilled ? { color: "#6B7280" } : {}]}
            value={aadhaar.value}
            onChangeText={onChange}
            placeholder="Aadhaar Number"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            maxLength={12}
            editable={!aadhaar.prefilled}
          />
          <Text style={s.counter}>{aadhaar.value.length}/12</Text>
        </View>
        {aadhaar.value.length > 0 && (
          <View style={s.hintRow}>
            <MaterialCommunityIcons
              name={isValid && !aadhaar.error ? "check-circle" : "alert-circle"}
              size={12} color={isValid && !aadhaar.error ? "#10B981" : "#EF4444"}
            />
            <Text style={[s.hintText, { color: isValid && !aadhaar.error ? "#10B981" : "#EF4444" }]}>
              {aadhaar.error || "Valid 12-digit Aadhaar number"}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[s.verifyBtn, isValid && !aadhaar.loading ? { backgroundColor: ACCENT } : s.verifyBtnOff]}
        onPress={onSendOtp}
        disabled={!isValid || aadhaar.loading}
        activeOpacity={0.85}
      >
        {aadhaar.loading
          ? <ShowLoaderBtn color={primary} size="small" />
          : <>
            <MaterialCommunityIcons
              name="message-arrow-right-outline" size={16}
              color={isValid ? "#fff" : "#9CA3AF"}
            />
            <Text style={[s.verifyBtnText, { color: isValid ? "#fff" : "#9CA3AF" }]}>
              Send OTP
            </Text>
          </>
        }
      </TouchableOpacity>
    </View>
  );
};

// ─── PanCard ──────────────────────────────────────────────────────────────────
export const PanCard = ({
  pan, isValid, onChange, onVerify,
}: {
  pan: PanState; isValid: boolean;
  onChange: (t: string) => void; onVerify: () => void;
}) => {
  const { primary } = useColorsOfApi();
  const ACCENT = "#10B981";
  const borderColor = pan.error ? "#EF4444"
    : pan.value.length > 0 && isValid ? "#10B981" : "#E5E7EB";

  const header = (
    <CardHeader
      subtitle="TAX PROOF" title="PAN Verification"
      iconName="file-document-outline"
      iconBg="#ECFDF5" iconColor={ACCENT}
      verified={pan.verified}
    />
  );

  if (pan.verified) {
    return (
      <View style={s.card}>
        {header}
        <VerifiedStrip
          label="PAN Verified Successfully"
          sub={`${pan.value.slice(0, 5)}XXXXX`}
          accentColor={ACCENT}
          onReset={pan.prefilled ? undefined : () => onChange("")}
          locked={pan.prefilled} />
      </View>
    );
  }

  return (
    <View style={s.card}>
      {header}
      <View style={s.inputWrap}>
        <Text style={s.inputLabel}>PAN Number</Text>
        <View style={[s.inputBox, { borderColor }]}>
          <TextInput
            style={s.textInput}
            value={pan.value}
            onChangeText={onChange}
            placeholder="PAN Number"
            placeholderTextColor="#9CA3AF"
            autoCapitalize="characters"
            maxLength={10}
            editable={!pan.prefilled}

          />
          <Text style={s.counter}>{pan.value.length}/10</Text>
        </View>
        {pan.value.length > 0 && (
          <View style={s.hintRow}>
            <MaterialCommunityIcons
              name={isValid && !pan.error ? "check-circle" : "alert-circle"}
              size={12} color={isValid && !pan.error ? "#10B981" : "#EF4444"}
            />
            <Text style={[s.hintText, { color: isValid && !pan.error ? "#10B981" : "#EF4444" }]}>
              {pan.error || "Valid format: ABCDE1234F"}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[s.verifyBtn, isValid && !pan.loading ? { backgroundColor: ACCENT } : s.verifyBtnOff]}
        onPress={onVerify}
        disabled={!isValid || pan.loading}
        activeOpacity={0.85}
      >
        {pan.loading
          ? <ShowLoaderBtn color={primary} size="small" />
          : <>
            <MaterialCommunityIcons
              name="shield-check-outline" size={16}
              color={isValid ? "#fff" : "#9CA3AF"}
            />
            <Text style={[s.verifyBtnText, { color: isValid ? "#fff" : "#9CA3AF" }]}>
              Verify PAN
            </Text>
          </>
        }
      </TouchableOpacity>
    </View>
  );
};

// ─── MobileCard ───────────────────────────────────────────────────────────────
export const MobileCard = ({
  mobile, isValid, onChange, onSendOtp, onOtpChange, onVerifyOtp, onReset,  editable = true,  
}: {
  mobile: MobileState; isValid: boolean;
  onChange: (t: string) => void; onSendOtp: () => void;
  onOtpChange: (t: string) => void; onVerifyOtp: () => void; onReset: () => void;
    editable?: boolean;
}) => {
  const { primary } = useColorsOfApi();
  const ACCENT = "#F59E0B";
  const borderColor = mobile.error ? "#EF4444"
    : mobile.value.length > 0 && isValid ? "#10B981" : "#E5E7EB";

  const header = (
    <CardHeader
      subtitle="CONTACT INFO" title="Mobile Number"
      iconName="cellphone"
      iconBg="#FFF7ED" iconColor={ACCENT}
      verified={mobile.verified}
    />
  );

  if (mobile.verified) {
    return (
      <View style={s.card}>
        {header}
        <VerifiedStrip
          label="Mobile Verified Successfully"
          sub={`+91 XXXXXX${mobile.value.slice(6)}`}
          onReset={undefined}
          locked={true}
        />
      </View>
    );
  }

  if (mobile.otpSent) {
    return (
      <View style={s.card}>
        {header}
        <OtpSentStrip
          label="OTP sent to mobile"
          sub={`+91 XXXXXX${mobile.value.slice(6)}`}
          accentColor="#92400e"
          bgColor="#FFF7ED"
          borderColor="#FCD34D"
        />
        <View style={{ marginTop: hScale(12) }}>
          <OtpInputBlock
            otpValue={mobile.otpValue}
            otpError={mobile.otpError}
            loading={mobile.loading}
            accentColor={ACCENT}
            onOtpChange={onOtpChange}
            onVerify={onVerifyOtp}
            onReset={onReset}
            resetLabel="Wrong number? Start again"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={s.card}>
      {header}
      <View style={s.inputWrap}>
        <Text style={s.inputLabel}>Mobile Number</Text>
        <View style={[s.inputBox, { borderColor }]}>
          <TextInput
            style={s.textInput}
            value={mobile.value}
            onChangeText={onChange}
            placeholder="Mobile Number"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            maxLength={10}
            editable={editable}  
          />
          <Text style={s.counter}>{mobile.value.length}/10</Text>
        </View>
        {mobile.value.length > 0 && (
          <View style={s.hintRow}>
            <MaterialCommunityIcons
              name={isValid && !mobile.error ? "check-circle" : "alert-circle"}
              size={12} color={isValid && !mobile.error ? "#10B981" : "#EF4444"}
            />
            <Text style={[s.hintText, { color: isValid && !mobile.error ? "#10B981" : "#EF4444" }]}>
              {mobile.error || "Valid 10-digit Indian mobile"}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[s.verifyBtn, isValid && !mobile.loading ? { backgroundColor: ACCENT } : s.verifyBtnOff]}
        onPress={onSendOtp}
        disabled={!isValid || mobile.loading}
        activeOpacity={0.85}
      >
        {mobile.loading
          ? <ShowLoaderBtn color={primary} size="small" />
          : <>
            <MaterialCommunityIcons
              name="cellphone-message" size={16}
              color={isValid ? "#fff" : "#9CA3AF"}
            />
            <Text style={[s.verifyBtnText, { color: isValid ? "#fff" : "#9CA3AF" }]}>
              Send OTP
            </Text>
          </>
        }
      </TouchableOpacity>
    </View>
  );
};

// ─── EmailCard ────────────────────────────────────────────────────────────────
export const EmailCard = ({
  email, isValid, onChange, onSendOtp, onOtpChange, onVerifyOtp, onReset,
}: {
  email: EmailState; isValid: boolean;
  onChange: (t: string) => void; onSendOtp: () => void;
  onOtpChange: (t: string) => void; onVerifyOtp: () => void; onReset: () => void;
}) => {
  const { primary } = useColorsOfApi();
  const ACCENT = "#8B5CF6";
  const borderColor = email.error ? "#EF4444"
    : email.value.length > 0 && isValid ? "#10B981" : "#E5E7EB";

  const header = (
    <CardHeader
      subtitle="CONTACT INFO" title="Email Address"
      iconName="email-outline"
      iconBg="#FAF5FF" iconColor={ACCENT}
      verified={email.verified}
    />
  );

  if (email.verified) {
    return (
      <View style={s.card}>
        {header}
        <VerifiedStrip
          label="Email Verified Successfully"
          sub={email.value}
          accentColor={ACCENT}
          onReset={onReset}
        />
      </View>
    );
  }

  if (email.otpSent) {
    return (
      <View style={s.card}>
        {header}
        <OtpSentStrip
          label="OTP sent to email"
          sub={email.value}
          accentColor="#5B21B6"
          bgColor="#FAF5FF"
          borderColor="#C4B5FD"
        />
        <View style={{ marginTop: hScale(12) }}>
          <OtpInputBlock
            otpValue={email.otpValue}
            otpError={email.otpError}
            loading={email.loading}
            accentColor={ACCENT}
            onOtpChange={onOtpChange}
            onVerify={onVerifyOtp}
            onReset={onReset}
            resetLabel="Wrong email? Start again"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={s.card}>
      {header}
      <View style={s.inputWrap}>
        <Text style={s.inputLabel}>Email Address</Text>
        <View style={[s.inputBox, { borderColor }]}>
          <TextInput
            style={[s.textInput, { color: "#6B7280" }]}
            value={email.value}
            onChangeText={onChange}
            placeholder="Email Address"
            placeholderTextColor="#9CA3AF"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false}

          />
          {isValid && !email.error && email.value.length > 0 && (
            <MaterialCommunityIcons name="check-circle" size={18} color="#10B981" />
          )}
        </View>
        {email.value.length > 0 && (
          <View style={s.hintRow}>
            <MaterialCommunityIcons
              name={isValid && !email.error ? "check-circle" : "alert-circle"}
              size={12} color={isValid && !email.error ? "#10B981" : "#EF4444"}
            />
            <Text style={[s.hintText, { color: isValid && !email.error ? "#10B981" : "#EF4444" }]}>
              {email.error || "Valid email address"}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[s.verifyBtn, isValid && !email.loading ? { backgroundColor: ACCENT } : s.verifyBtnOff]}
        onPress={onSendOtp}
        disabled={!isValid || email.loading}
        activeOpacity={0.85}
      >
        {email.loading
          ? <ShowLoaderBtn color={primary} size="small" />
          : <>
            <MaterialCommunityIcons
              name="message-arrow-left-outline" size={16}
              color={isValid ? "#fff" : "#9CA3AF"}
            />
            <Text style={[s.verifyBtnText, { color: isValid ? "#fff" : "#9CA3AF" }]}>
              Send OTP
            </Text>
          </>
        }
      </TouchableOpacity>
    </View>
  );
};

const s = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: wScale(16), padding: wScale(14), marginBottom: hScale(14), elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: wScale(10), marginBottom: hScale(14) },
  iconBox: { width: wScale(38), height: wScale(38), borderRadius: wScale(10), alignItems: "center", justifyContent: "center" },
  cardSubtitle: { fontSize: wScale(9), color: "#9CA3AF", letterSpacing: 0.8, marginBottom: hScale(1) },
  cardTitle: { fontSize: wScale(14), fontWeight: "600", color: "#111827" },
  badge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: wScale(8), paddingVertical: hScale(4), borderRadius: 20 },
  badgePending: { backgroundColor: "#FEF9C3" },
  badgeVerified: { backgroundColor: "#DCFCE7" },
  badgeText: { fontSize: wScale(10), fontWeight: "600" },
  verifiedStrip: { flexDirection: "row", alignItems: "center", gap: wScale(10), backgroundColor: "#F0FDF4", borderWidth: 0.5, borderColor: "#86EFAC", borderRadius: wScale(10), padding: wScale(10) },
  verifiedCheck: { width: wScale(26), height: wScale(26), borderRadius: 50, backgroundColor: "#10B981", alignItems: "center", justifyContent: "center" },
  verifiedLabel: { fontSize: wScale(13), fontWeight: "600", color: "#166534" },
  verifiedSub: { fontSize: wScale(11), color: "#4ADE80", marginTop: hScale(1) },
  reVerify: { fontSize: wScale(12), fontWeight: "500" },
  inputWrap: { marginBottom: hScale(10) },
  inputLabel: { fontSize: wScale(11), color: "#6B7280", marginBottom: hScale(5), letterSpacing: 0.3 },
  inputBox: { flexDirection: "row", alignItems: "center", borderWidth: 1, borderRadius: wScale(10), backgroundColor: "#F9FAFB", paddingHorizontal: wScale(12), height: hScale(46) },
  textInput: { flex: 1, fontSize: wScale(14), color: "#111827", paddingVertical: 0 },
  counter: { fontSize: wScale(11), color: "#9CA3AF" },
  hintRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: hScale(4) },
  hintText: { fontSize: wScale(11) },
  verifyBtn: { height: hScale(42), borderRadius: wScale(10), flexDirection: "row", alignItems: "center", justifyContent: "center", gap: wScale(6), marginTop: hScale(4) },
  verifyBtnOff: { backgroundColor: "#F3F4F6", borderWidth: 0.5, borderColor: "#E5E7EB" },
  verifyBtnText: { fontSize: wScale(14), fontWeight: "600" },
  resetText: { fontSize: wScale(12), color: "#6B7280", textAlign: "center" },
});