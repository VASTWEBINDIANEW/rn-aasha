// context/FormContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';

export interface FormData {
  payoutTravel: { agreed: boolean };

  kyc:       { aadhaar: string; pan: string; mobile: string; email: string };

basicInfo: {
  fullName:             string;
  dob:                  string;
  age:                  string;
  gender:               string;
  alternateNo:          string;
  religion:             string;
  bloodGroup:           string;
  maritalStatus:        string;
  noOfChildren:         string;
  spouseName:           string;
  spouseOccupation:     string;
  fatherName:           string;
  fatherOccupation:     string;
  motherName:           string;
  motherOccupation:     string;
  optionalDoc:   string;  // ← add
  optionalDocId: string;  // ← add
 
};

address: {
  permanentAddress:     string;
  permanentPinCode:     string;
  presentAddress:       string;
  presentPinCode:       string;
  residenceType:        string;
  periodOfStay:         string;
  landmark:             string;
  nearestPoliceStation: string;
};
education: { qualification: string; college: string; board: string; year: string; percentage: string };
  reference: {
    professionalRef:  { name: string; designationOrg: string; mobile: string };
    relativeRef:      { name: string; relationship: string; mobile: string };
    emergencyContact: { name: string; relationship: string; mobile: string };
    operational: {
      drivingLicense:       string;
      drivingLicenseNumber: string;
      hasTwoWheeler:        boolean;
      twoWheelerNumber:     string;
      languagesKnown:       string;
    };
  };
  documents: {                                                    // ✅ ADDED
    aadhaar:        { present: boolean | null; uri: string | null };
    pan:            { present: boolean | null; uri: string | null };
    drivingLicense: { present: boolean | null; uri: string | null };
    other:          { present: boolean | null; uri: string | null };
  };

  drivingLicense: {
  isDrivingLicense:     boolean;
  drivingLicenseNumber: string;
  isTwoWheeler:         string;
  twoWheelerNumber:     string;
  vehicleNumber:        string;
  languageKnown:        string;
};
}

interface Ctx {
  formData:    FormData;
  currentStep: number;
  updateStep:  <K extends keyof FormData>(key: K, data: FormData[K]) => void;
  nextStep:    () => void;
  prevStep:    () => void;
  goToStep:    (n: number) => void;
  resetForm:   () => void;
}

const INIT: FormData = {
  payoutTravel: { agreed: false },

  kyc:       { aadhaar: '', pan: '', mobile: '', email: '' },
  basicInfo: {
  // ── Personal ──────────────────────────────────────
  fullName:             '',
  dob:                  '',
  age:                  '',
  gender:               '',

  // ── Contact ───────────────────────────────────────
  alternateNo:          '',

  // ── Religion & Other ──────────────────────────────
  religion:             '',
  bloodGroup:           '',

  // ── Marital ───────────────────────────────────────
  maritalStatus:        '',
  noOfChildren:         '',
  spouseName:           '',
  spouseOccupation:     '',

  // ── Father ────────────────────────────────────────
  fatherName:           '',
  fatherOccupation:     '',

  // ── Mother ────────────────────────────────────────
  motherName:           '',
  motherOccupation:     '',
optionalDoc:   '',
  optionalDocId: '',
 
},
  
address: {
  permanentAddress:     '',
  permanentPinCode:     '',
  presentAddress:       '',
  presentPinCode:       '',
  residenceType:        '',
  periodOfStay:         '',
  landmark:             '',
  nearestPoliceStation: '',
},
  education: { qualification: '', college: '', board: '', year: '', percentage: '' },
  reference: {
    professionalRef:  { name: '', designationOrg: '', mobile: '' },
    relativeRef:      { name: '', relationship: '', mobile: '' },
    emergencyContact: { name: '', relationship: '', mobile: '' },
    operational: {
      drivingLicense:       '',
      drivingLicenseNumber: '',
      hasTwoWheeler:        false,
      twoWheelerNumber:     '',
      languagesKnown:       '',
    },
  },
  documents: {                                                    // ✅ ADDED
    aadhaar:        { present: null, uri: null },
    pan:            { present: null, uri: null },
    drivingLicense: { present: null, uri: null },
    other:          { present: null, uri: null },
  },

  drivingLicense: {
  isDrivingLicense:     false,
  drivingLicenseNumber: '',
  isTwoWheeler:         '',
  twoWheelerNumber:     '',
  vehicleNumber:        '',
  languageKnown:        '',
},
};

const FormContext = createContext<Ctx | null>(null);

export const FormProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [formData,    setFormData]    = useState<FormData>(INIT);
  const [currentStep, setCurrentStep] = useState(0);

  const updateStep = useCallback(<K extends keyof FormData>(key: K, data: FormData[K]) =>
    setFormData(p => ({ ...p, [key]: data })), []);

const nextStep = useCallback(() => setCurrentStep(s => Math.min(s + 1, 10)), []);
  const prevStep  = useCallback(() => setCurrentStep(s => Math.max(s - 1, 0)), []);
  const goToStep  = useCallback((n: number) => setCurrentStep(n), []);
  const resetForm = useCallback(() => { setFormData(INIT); setCurrentStep(0); }, []);

  return (
    <FormContext.Provider value={{ formData, currentStep, updateStep, nextStep, prevStep, goToStep, resetForm }}>
      {children}
    </FormContext.Provider>
  );
};

export const useFormCtx = () => {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error('useFormCtx must be inside FormProvider');
  return ctx;
};