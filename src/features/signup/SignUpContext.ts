
import { createContext, Dispatch, SetStateAction } from 'react';
import noop from 'lodash/noop';

export type SignUpContext = {
  email: string;
  setEmail: Dispatch<SetStateAction<string | undefined>>;
  username: string;
  setUsername: Dispatch<SetStateAction<string | undefined>>;
  mobileNumber: string;
  setMobileNumber: Dispatch<SetStateAction<string | undefined>>;
  referralCode: string;
  setReferralCode: Dispatch<SetStateAction<string | undefined>>;
  password: string;
  setPassword: Dispatch<SetStateAction<string | undefined>>;
  verifyPassword: string;
  setVerifyPassword: Dispatch<SetStateAction<string | undefined>>;
  dateOfBirth: string;
  setDateOfBirth: Dispatch<SetStateAction<string | undefined>>;
  gender: string;
  setGender: Dispatch<SetStateAction<string | undefined>>;
  addressState: string;
  setAddressState: Dispatch<SetStateAction<string | undefined>>;
  city: string;
  setCity: Dispatch<SetStateAction<string | undefined>>;
  district: string;
  setDistrict: Dispatch<SetStateAction<string | undefined>>;
  pincode: string;
  setPincode: Dispatch<SetStateAction<string | undefined>>;
  businessName: string;
  setBusinessName: Dispatch<SetStateAction<string | undefined>>;
  businessType: string;
  setBusinessType: Dispatch<SetStateAction<string | undefined>>;
  personalAadhar: string;
  setPersonalAadhar: Dispatch<SetStateAction<string | undefined>>;
  personalPAN: string;
  setPersonalPAN: Dispatch<SetStateAction<string | undefined>>;
  gst: string;
  setGST: Dispatch<SetStateAction<string | undefined>>;
  videoKyc: string;
  setVideoKyc: Dispatch<SetStateAction<string | undefined>>;
  aadharFront: string;
  setAadharFront: Dispatch<SetStateAction<string | undefined>>;
  aadharBack: string;
  setAadharBack: Dispatch<SetStateAction<string | undefined>>;
  panImg: string;
  setPanImg: Dispatch<SetStateAction<string | undefined>>;
  gstImg: string;
  setGstImg: Dispatch<SetStateAction<string | undefined>>;
  stateId:string;
  setStateid:Dispatch<SetStateAction<string | undefined>>;
    distid:string;
  setDistid:Dispatch<SetStateAction<string | undefined>>;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number | undefined>>;
  svg: [];
  setSvg: Dispatch<SetStateAction<[]>>;
  Radius2:number;
  setRadius2:Dispatch<SetStateAction<number | undefined>>;

};

export const SignUpContext = createContext<SignUpContext>({
  email: '',
  setEmail: noop,
  username: '',
  setUsername: noop,
  mobileNumber: '',
  setMobileNumber: noop,
  referralCode: '',
  setReferralCode: noop,
  password: '',
  setPassword: noop,
  verifyPassword: '',
  setVerifyPassword: noop,
  dateOfBirth: '',
  setDateOfBirth: noop,
  gender: '',
  setGender: noop,
  addressState: '',
  setAddressState: noop,
  city: '',
  setCity: noop,
  district: '',
  setDistrict: noop,
  pincode: '',
  setPincode: noop,
  businessName: '',
  setBusinessName: noop,
  businessType: '',
  setBusinessType: noop,
  personalAadhar: '',
  setPersonalAadhar: noop,
  personalPAN: '',
  setPersonalPAN: noop,
  gst: '',
  setGST: noop,
  videoKyc: '',
  setVideoKyc: noop,
  aadharFront: '',
  setAadharFront: noop,
  aadharBack: '',
  setAadharBack: noop,
  panImg: '',
  setPanImg: noop,
  gstImg: '',
  setGstImg: noop,
  stateId:'',
  setStateid:noop,
  svg: [],
  setSvg: noop,
  Radius2:'',
  setRadius2:noop,
  currentPage: 0,
  setCurrentPage: noop,
  distid:'' ,
  setDistid:noop,

});
  

