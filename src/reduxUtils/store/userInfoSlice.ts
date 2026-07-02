import * as toolkitRaw from '@reduxjs/toolkit';
const { createSlice } = ((toolkitRaw as any).default ?? toolkitRaw) as typeof toolkitRaw;

const initialState = {
  payuData: null, // ✅ PayU response object ko store karne ke liye
  authToken: '',
  refreshToken: '',
  userId: '',
  Mpin: '',
  appLanguage: 'en',
  activeAepsLine: {
    line: '',
    provider: '',
    status: false,
  },
  otaHasUpdate: false,
  otaLatestVersion: null as number | null,
  colorConfig: {
    primaryColor: '#3A7DFF',
    secondaryColor: '#9D5B87',
    primaryButtonColor: '#F1C40F',
    secondaryButtonColor: '#E74C3C',
    labelColor: '#2ECC71'
  },

  Loc_Data: {
    let: null,
    long: null,
    isGPS: null
  },

  versionData: {},
  themeChangeTime: { themeUpdateTime: null },
  isFingerprintEnabled: false,
  dashboardData: {},
  sliderImageData: [],
  needUpdate: true,
  IsDealer: false,
  IsRington: true,
  IsOnLoc: false,

  latitude: '0',
  longitude: '0',
payutxnid:null,
  rceIdStatus: {
    status: null,
    status2: null
  },
  rceId: null,
  fcmToken: '',
  cmsVerify: false,
  rctype: null,
  rcPrePayAnomut: null,
  cmsAddMFrom: null,
  radiantList: null,

  deviceInfo: {
    brand: null,
    ipAddress: null,
    modelNumber: null,
    uniqueId: null,
    androidVersion: null,
    buildId: null,
    net: null,
    latitude: '0',
    longitude: '0',
    address: 'Unknown',
    city: 'Unknown',
    postalCode: '000000',
  },

  isPartial: false,
  totalPartialAmount: 0,
  currentPartialAmount: 0,

  // ✅ NEW FIELDS ADDED (NO CHANGE ABOVE)
  loginId: '',
  isDemoUser: false,
  unLocked: false,
  signUpId: null,
  signUpPassword: null,
  logoUrl: '',
  allPermissionsGranted: null as boolean | null, // 🔥 Naya state for permission check (null = abhi check ho raha hai)
};

const userInfoSlice = createSlice({
  name: 'userInfo',
  initialState,
  reducers: {
    // 🚀 NEW PAYU REDUCERS ADDED INSIDE THIS SLICE
    setPayUtxnId: (state, action) => { state.payutxnid = action.payload; },
    setPayUData: (state, action) => {
      state.payuData = action.payload;
    },
    clearPayUData: (state) => {
      state.payuData = null;
    },

    // ===== EXISTING (UNCHANGED) =====
    setAuthToken: (state, action) => { state.authToken = action.payload; },
    setThemeChangeTime: (state, action) => { state.themeChangeTime = action.payload; },
    clearEntryScreen: (state) => { state.cmsAddMFrom = null; },
    setRadiantList: (state, action) => { state.radiantList = action.payload; },
    setCmsAddMFrom: (state, action) => { state.cmsAddMFrom = action.payload; },
    setRefreshToken: (state, action) => { state.refreshToken = action.payload; },
    setRctype: (state, action) => { state.rctype = action.payload; },
    setRcPrePayAnomut: (state, action) => { state.rcPrePayAnomut = action.payload; },

    // 🔧 FIX (bug tha but behavior same hai)
    setRceID: (state, action) => {
      state.rceId = action.payload;
    },

    setUserId: (state, action) => { state.userId = action.payload; },
    setMpin: (state, action) => { state.Mpin = action.payload; },
    setColorConfig: (state, action) => { state.colorConfig = action.payload; },
    setLoc_Data: (state, action) => { state.Loc_Data = action.payload; },
    setFingerprintStatus: (state, action) => { state.isFingerprintEnabled = action.payload; },
    setVersionData: (state, action) => { state.versionData = action.payload; },
    setDashboardData: (state, action) => { state.dashboardData = action.payload; },
    setSliderImageData: (state, action) => { state.sliderImageData = action.payload; },
    setNeedUpdate: (state, action) => { state.needUpdate = action.payload; },
    setIsDealer: (state, action) => { state.IsDealer = action.payload; },
    setIsRington: (state, action) => { state.IsRington = action.payload; },
    setIsOnLoc: (state, action) => { state.IsOnLoc = action.payload; },
    setLatitude: (state, action) => { state.latitude = action.payload; },
    setLongitude: (state, action) => { state.longitude = action.payload; },
    setFcmToken: (state, action) => { state.fcmToken = action.payload; },
    setRceIdStatus: (state, action) => { state.rceIdStatus = action.payload; },
    setAppLanguage: (state, action) => { state.appLanguage = action.payload; },
    setCmsVerify: (state, action) => { state.cmsVerify = action.payload; },
    setActiveAepsLine: (state, action) => { state.activeAepsLine = action.payload; },
    setDeviceInfo: (state, action) => { state.deviceInfo = action.payload; },
    setIsPartial: (state, action) => { state.isPartial = action.payload; },
// reducers mein add karo
setOtaUpdate: (state, action) => {
  state.otaHasUpdate = true;
  state.otaLatestVersion = action.payload;
},
clearOtaUpdate: (state) => {
  state.otaHasUpdate = false;
  state.otaLatestVersion = null;
},
    setPartialAmounts: (state, action) => {
      const { total, current } = action.payload;
      state.totalPartialAmount = total;
      state.currentPartialAmount = current;
    },

    // ===== NEW REDUCERS ADDED =====
    setLoginId: (state, action) => { state.loginId = action.payload; },
    setIsDemoUser: (state, action) => { state.isDemoUser = action.payload; },
    setUnlocked: (state, action) => { state.unLocked = action.payload; },
    setSignUpId: (state, action) => { state.signUpId = action.payload; },
    setSignUpPassword: (state, action) => { state.signUpPassword = action.payload; },
    setLogoUrl: (state, action) => { state.logoUrl = action.payload; },
    setAllPermissionsGranted: (state, action) => { state.allPermissionsGranted = action.payload; },
    reset: () => initialState,
  },
});

export const {
  setAuthToken,
  setRefreshToken,
  setUserId,
  setMpin,
  setColorConfig,
  setLoc_Data,
  setFingerprintStatus,
  setVersionData,
  setDashboardData,
  setSliderImageData,
  setNeedUpdate,
  setIsDealer,
  setIsRington,
  setIsOnLoc,
  setLatitude,
  setLongitude,
  setFcmToken,
  setRceIdStatus,
  setAppLanguage,
  setCmsVerify,
  reset,
  setActiveAepsLine,
  setRctype,
  setRcPrePayAnomut,
  setCmsAddMFrom,
  setRadiantList,
  clearEntryScreen,
  setRceID,
  setDeviceInfo,
  setThemeChangeTime,
  setIsPartial,
  setPartialAmounts,

  // ✅ EXPORTS FOR PAYU DATA
  setPayUData,
  clearPayUData,
  setPayUtxnId,
  // ✅ NEW EXPORTS
  setLoginId,
  setIsDemoUser,
  setUnlocked,
  setSignUpId,
  setSignUpPassword,
  setLogoUrl ,
    setOtaUpdate,
  clearOtaUpdate,
  setAllPermissionsGranted,
} = userInfoSlice.actions;

export default userInfoSlice.reducer;