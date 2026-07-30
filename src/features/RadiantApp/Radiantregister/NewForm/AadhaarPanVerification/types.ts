import { ToastAndroid } from "react-native";

// ─── Regex ─────────────────────────────────────────────
export const AADHAAR_REGEX = /^\d{12}$/;
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const MOBILE_REGEX = /^[6-9]\d{9}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Toast Helper ──────────────────────────────────────
export const toast = (msg: string) =>
  ToastAndroid.showWithGravity(
    msg,
    ToastAndroid.SHORT,
    ToastAndroid.BOTTOM
  );

// ─── Types ─────────────────────────────────────────────
export interface AadhaarState {
  value: string;
  error: string;
  verified: boolean;
  panCheckDone: boolean;
  otpSent: boolean;
  clientId: string;
  txnId: string;
  otpValue: string;
  otpError: string;
  loading: boolean;
  prefilled: boolean;
}

export interface PanState {
  value: string;
  error: string;
  verified: boolean;
  loading: boolean;
  prefilled: boolean;
}

export interface MobileState {
  value: string;
  error: string;
  otpSent: boolean;
  otpValue: string;
  otpError: string;
  verified: boolean;
  loading: boolean;
}

export interface EmailState {
  value: string;
  error: string;
  otpSent: boolean;
  otpValue: string;
  otpError: string;
  verified: boolean;
  loading: boolean;
  prefilled: boolean;
}

// ─── Init Helpers ──────────────────────────────────────
export const initAadhaar = (): AadhaarState => ({
  value: "",
  error: "",
  verified: false,
  panCheckDone: false,
  otpSent: false,
  clientId: "",
  txnId: "",
  otpValue: "",
  otpError: "",
  loading: false,
  prefilled: false,
});

export const initPan = (): PanState => ({
  value: "",
  error: "",
  verified: false,
  loading: false,
  prefilled: false,
});

export const initMobile = (): MobileState => ({
  value: "",
  error: "",
  otpSent: false,
  otpValue: "",
  otpError: "",
  verified: false,
  loading: false,
});

export const initEmail = (): EmailState => ({
  value: "",
  error: "",
  otpSent: false,
  otpValue: "",
  otpError: "",
  verified: false,
  loading: false,
    // prefilled: boolean;
      prefilled: false,


});