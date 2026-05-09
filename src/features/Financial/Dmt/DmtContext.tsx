import noop from 'lodash/noop';
import { createContext } from 'react';

interface DmtContextType {
  setAadharNumber: (val: string) => void;
  setMobileNumber: (val: string) => void;
  setConsumerName: (val: string) => void;
  setBankName: (val: string) => void;
  setFingerprintData: (val: string) => void;
  aadharNumber: string;
  mobileNumber: string;
  consumerName: string;
  bankName: string;
  fingerprintData: string;
  scanFingerprint: () => void;
  activeTabKey?: string; // ✅ Add kiya
}

export const DmtContext = createContext<DmtContextType>({
  setAadharNumber: noop,
  setMobileNumber: noop,
  setConsumerName: noop,
  setBankName: noop,
  setFingerprintData: noop,
  aadharNumber: '',
  mobileNumber: '',
  consumerName: '',
  bankName: '',
  fingerprintData: '',
  scanFingerprint: noop,
  activeTabKey: undefined, // ✅ Add kiya
});