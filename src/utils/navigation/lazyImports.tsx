/**
 * ScreenNavigator - Lazy Loaded Version
 *
 * BEFORE: 100+ screens ek saath load hoti thin → 478 MB RAM
 * AFTER:  Sirf jo screen chahiye tab load hogi → ~200-250 MB RAM
 *
 * HOW TO USE:
 * 1. Apne original ScreenNavigator.tsx mein sab imports replace karo
 * 2. React import mein lazy aur Suspense add karo
 * 3. Stack.Navigator ko Suspense se wrap karo
 */

import React, { lazy, Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';

// ─── LOADING FALLBACK ────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" color="#0000ff" />
  </View>
);

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
const HomeScreen                = lazy(() => import('../../features/dashboard/HomeScreen'));
const QuickAccessScreen         = lazy(() => import('../../features/dashboard/QuickAccessScreen'));
const VideoKYC                  = lazy(() => import('../../features/dashboard/videokyc'));
const HoldAndCredit             = lazy(() => import('../../features/dashboard/HoldAndCredit'));
const AadharPanVerify           = lazy(() => import('../../features/dashboard/AddharPanVerification'));
const AadhrPanVerify            = lazy(() => import('../../features/dashboard/AddharPanVerification'));
const RecentTx                  = lazy(() => import('../../features/dashboard/RecentTx'));

// ─── LOGIN / SECURITY ────────────────────────────────────────────────────────
const DeviceLockScreen          = lazy(() => import('../../features/login/DeviceLockScreen'));
const SetOtpPass                = lazy(() => import('../../features/drawer/securityPages/SetOtpPass'));
const MandatorySim              = lazy(() => import('../../features/drawer/securityPages/MandatorySin'));
const ScreenLock                = lazy(() => import('../../features/drawer/securityPages/ScreenLockSeting'));
const ManageLogin               = lazy(() => import('../../features/drawer/securityPages/ManageLogin'));
const LoginReport               = lazy(() => import('../../features/drawer/securityPages/LoginReport'));
const Mpin                      = lazy(() => import('../../features/drawer/securityPages/Mpin'));

// ─── DRAWER / SETTINGS ───────────────────────────────────────────────────────
const LanguageSettings          = lazy(() => import('../../features/drawer/settingPages/LanguageSettings'));
const VoiceNotification         = lazy(() => import('../../features/drawer/settingPages/VoiceNotification'));
const VoiceNotificationpage     = lazy(() => import('../../features/drawer/settingPages/VoiceNotification'));
const DarkMode                  = lazy(() => import('../../features/drawer/settingPages/DarkMode'));
const EditProfile               = lazy(() => import('../../features/drawer/EditProfile'));
const Complaint                 = lazy(() => import('../../features/drawer/Complaints'));
const Natifications             = lazy(() => import('../../features/drawer/Natifications'));

// ─── RECHARGE ────────────────────────────────────────────────────────────────
const CabelTvScreen             = lazy(() => import('../../features/Recharge/CabelTvScreen'));
const CableTvScreen             = lazy(() => import('../../features/Recharge/CabelTvScreen'));
const MunicipalTaxScreen        = lazy(() => import('../../features/Recharge/MunicipalTaxScreen'));
const HousingTaxScreen          = lazy(() => import('../../features/Recharge/HousingTaxScreen'));
const SubscriptionScreen        = lazy(() => import('../../features/Recharge/SubscriptionScreen'));
const Rechargedetails           = lazy(() => import('../../features/Recharge/Mobilerechargepages/rechargedetails'));
const PrepaidGasScreen          = lazy(() => import('../../features/Recharge/pipegas'));
const RechargeHistory           = lazy(() => import('../../features/History/RechargeHistory'));
const RechargePin               = lazy(() => import('../../features/Recharge/RechargePin'));

// ─── FINANCIAL - DMT ─────────────────────────────────────────────────────────
const MoneyTransferScreen       = lazy(() => import('../../features/Financial/VastDMT/MoneyTransfer'));
const GetBenifiaryScreen        = lazy(() => import('../../features/Financial/VastDMT/GetBenifiaryScreen'));
const ServicepurchaseScreen     = lazy(() => import('../../features/Financial/VastDMT/ServicepurchaseScreen'));
const NumberRegisterScreen      = lazy(() => import('../../features/Financial/VastDMT/RegisternNewNumber'));
const AddNewBenificiaryScreen   = lazy(() => import('../../features/Financial/VastDMT/AddNewBenificiaryScreen'));
const toBankScreen              = lazy(() => import('../../features/Financial/VastDMT/ToAccDmt'));
const DmtAddNewBenificiaryScreen= lazy(() => import('../../features/Financial/Dmt/DmtAddNewBeneficiarycreen'));
const DmtTransferScreen         = lazy(() => import('../../features/Financial/Dmt/DmtTransferScreen'));
const DmtTabScreen              = lazy(() => import('../../features/Financial/Dmt/DmtTabScreen'));

// ─── FINANCIAL - UPI ─────────────────────────────────────────────────────────
const UpiDmtScreen              = lazy(() => import('../../features/Financial/UpiTransfer/DmtScreen'));
const UpiAddNewVPAScreen        = lazy(() => import('../../features/Financial/UpiTransfer/UpiAddNewBenificiaryScreen'));
const UpiGetBenifiaryScreen     = lazy(() => import('../../features/Financial/UpiTransfer/UpiGetBenifiaryScreen'));
const QRScanner                 = lazy(() => import('../../features/Financial/UpiTransfer/toQr'));

// ─── FINANCIAL - QR SCAN (VISION CAMERA) ────────────────────────────────────
// NOTE: Yeh heavy hai - sirf tab load hoga jab user scan kare
const QRScanScreen              = lazy(() => import('../../features/Financial/ScanQr/QRScanScreen'));
const UpiPayResult              = lazy(() => import('../../features/Financial/ScanQr/UpiPayResult'));
const ShowUPIData               = lazy(() => import('../../features/Financial/ScanQr/ShowUPIData'));

// ─── FINANCIAL - AEPS (VISION CAMERA) ───────────────────────────────────────
// NOTE: Yeh bhi heavy hai - camera use karta hai
const AepsScreen                = lazy(() => import('../../features/Financial/Aeps/Aepspage'));
const TwoFAVerify               = lazy(() => import('../../features/Financial/Aeps/TwoFaScreen'));
const Aepsekycscan              = lazy(() => import('../../features/Financial/Aeps/aepsKycScan'));
const Aepsekyc                  = lazy(() => import('../../features/Financial/Aeps/aepsKyc'));
const AdharPay                  = lazy(() => import('../../features/Financial/Aeps/aadharpay'));
const BalanceCheck              = lazy(() => import('../../features/Financial/Aeps/Balancecheck'));
const AepsMinistatement         = lazy(() => import('../../features/Financial/Aeps/AepsMinistatement'));
const AepsCW                    = lazy(() => import('../../features/Financial/Aeps/AepsCashwithdrawl'));
const TwoFaComponent            = lazy(() => import('../../features/Financial/Aeps/aepstest'));
const AepsTabScreen             = lazy(() => import('../../features/Financial/Aeps/AepsTabScreen'));
const AepsResponse              = lazy(() => import('../../features/Financial/Aeps/AepsRespons'));

// ─── FINANCIAL - PAN CARD ────────────────────────────────────────────────────
const PanCardScreen             = lazy(() => import('../../features/Financial/PanCard/PanServicePurchase'));
const Registerform              = lazy(() => import('../../features/Financial/PanCard/PanCardRegForm'));
const PancardManual             = lazy(() => import('../../features/Financial/PanCard/PanCardManualForm'));

// ─── FINANCIAL - WALLET ──────────────────────────────────────────────────────
const WalletSenderPage          = lazy(() => import('../../features/Financial/Towallet/WalletSenderPage'));
const ToWallet                  = lazy(() => import('../../features/Financial/Towallet/toWallet'));
const AddNewWallet              = lazy(() => import('../../features/Financial/Towallet/AddWalletID'));

// ─── FINANCIAL - OTHER ───────────────────────────────────────────────────────
const RadiantForm               = lazy(() => import('../../features/Financial/RadiantForm'));
const MicroAtm                  = lazy(() => import('../../features/Financial/microatm/MicroAtm'));
const RegisterVM30              = lazy(() => import('../../features/Financial/microatm/RegisterVM30'));
const MAtmStatusCheck           = lazy(() => import('../../features/Financial/microatm/mAtmStatusCheck'));

// ─── ADD MONEY ───────────────────────────────────────────────────────────────
const AddMoneyOptions           = lazy(() => import('../../features/AddMoneyOps/AddMOptions'));
const QRCodePage                = lazy(() => import('../../features/AddMoneyOps/Qrcode'));
const ReqToAdmin                = lazy(() => import('../../features/AddMoneyOps/ReqtoAdmin'));
const UpiQrCodes                = lazy(() => import('../../features/AddMoneyOps/UpiQrCodes'));
const SeamlessScreen            = lazy(() => import('../../features/AddMoneyOps/payu/SeamlessScreen'));
const APIScreen                 = lazy(() => import('../../features/AddMoneyOps/payu/APIScreen'));
const PaymentMethods            = lazy(() => import('../../features/AddMoneyOps/payu/seamless/PaymentMethods'));
const PayuPayment               = lazy(() => import('../../features/AddMoneyOps/payu/seamless/PayuPayment'));
const UPISeamless               = lazy(() => import('../../features/AddMoneyOps/payu/seamless/UPISeamless'));
const UPI                       = lazy(() => import('../../features/AddMoneyOps/payu/seamless/UPI'));
const AddMoneyPayResponse       = lazy(() => import('../../components/AddMoneyPayResponse'));

// ─── HISTORY / REPORTS ───────────────────────────────────────────────────────
const RechargeUtilitisR         = lazy(() => import('../../features/History/Recharge&Utilities'));
const ImpsNeftScreen            = lazy(() => import('../../features/History/impsnefReport'));
const AEPSAdharPayR             = lazy(() => import('../../features/History/AepsReport'));
const MPosScreenR               = lazy(() => import('../../features/History/MposReport'));
const MatmReport                = lazy(() => import('../../features/History/MatmsReport'));
const PanReport                 = lazy(() => import('../../features/History/panCardReport'));
const cashDepReport             = lazy(() => import('../../features/History/CashDeposite'));
const FlightBookReport          = lazy(() => import('../../features/History/flighBookReport'));
const BusBookReport             = lazy(() => import('../../features/History/BusBookReport'));
const PaymentGReport            = lazy(() => import('../../features/History/PGReport'));
const posreport                 = lazy(() => import('../../features/History/posreport'));
const FinocmsReport             = lazy(() => import('../../features/History/FinocmsReport'));
const Walletunloadreport        = lazy(() => import('../../features/History/walletunloadreport'));
const WalletTransferReport      = lazy(() => import('../../features/History/Radientwallettransferreport'));

// ─── ACCOUNTS ────────────────────────────────────────────────────────────────
const DayEarningReport          = lazy(() => import('../../features/Acount/DayEarning'));
const DayLedgerReport           = lazy(() => import('../../features/Acount/DayLedger'));
const DayBookReport             = lazy(() => import('../../features/Acount/DayBook'));
const FundReceivedReport        = lazy(() => import('../../features/Acount/FundRecieved'));
const DisputeReport             = lazy(() => import('../../features/Acount/DisputeReport'));
const AddedMoneyROTRReport      = lazy(() => import('../../features/Acount/AddMoney'));
const OtherLinks                = lazy(() => import('../../features/Acount/OtherLinks'));
const PurchaseOrderReport       = lazy(() => import('../../features/Acount/PurchaseOrderReport'));
const OperatorCommissionReport  = lazy(() => import('../../features/Acount/OperatorCommission'));
const ManageAccount             = lazy(() => import('../../features/Acount/ManageAcc'));
const RtorScreen                = lazy(() => import('../../features/Acount/RtorScreen'));
const RToRReport                = lazy(() => import('../../features/Acount/RToRReport'));
const PostoMain                 = lazy(() => import('../../features/Acount/posTomain'));
const MyExpense                 = lazy(() => import('../../features/Acount/MyExpense'));
const CommissionReport          = lazy(() => import('../../features/Acount/maxuspay'));

// ─── TRAVELS ─────────────────────────────────────────────────────────────────
const BusScreen                 = lazy(() => import('../../features/Travels/BusScreen'));

// ─── RADIANT APP ─────────────────────────────────────────────────────────────
const CmsScreen                 = lazy(() => import('../../features/RadiantApp/CmsScreen'));
const RadiantDashboard          = lazy(() => import('../../features/RadiantApp/RadiantDashboard'));
const RadiantTransactionScreen  = lazy(() => import('../../features/RadiantApp/RadiantTransactionScreen'));
const CashPickup                = lazy(() => import('../../features/RadiantApp/RadiantTrxn/CashPicUp'));
const PicUpScreen               = lazy(() => import('../../features/RadiantApp/RadiantTrxn/PicUpScreen'));
const InprocessReportCms        = lazy(() => import('../../features/RadiantApp/RadiantTrxn/InprocessReportCms'));
const CmsACList                 = lazy(() => import('../../features/RadiantApp/RadiantTrxn/CmsACList'));
const CmsCoustomerInfo          = lazy(() => import('../../features/RadiantApp/RadiantTrxn/CmsCoustomerInfo'));
const CmsCodeVerification       = lazy(() => import('../../features/RadiantApp/RadiantTrxn/CmsCodeVerification'));
const CmsFinalOtpVerification   = lazy(() => import('../../features/RadiantApp/RadiantTrxn/CmsFinalOtpVerification'));
const CmsCodeStatus             = lazy(() => import('../../features/RadiantApp/RadiantTrxn/CmsCodeStatus'));
const PickupSummaryScreen       = lazy(() => import('../../features/RadiantApp/RadiantTrxn/PickupSummaryScreen'));
const CmsNewPin                 = lazy(() => import('../../features/RadiantApp/RadiantTrxn/CmsNewPin'));
const CmsPrePay                 = lazy(() => import('../../features/RadiantApp/RadiantTrxn/CmsPrePay'));
const CmsPrePayFinalVfy         = lazy(() => import('../../features/RadiantApp/RadiantTrxn/CmsPrePayFinalVfy'));
const Totalpayreport            = lazy(() => import('../../features/RadiantApp/CmsReport/Totalpayreport'));
const CashPicUpReport           = lazy(() => import('../../features/RadiantApp/CmsReport/CashPicUpReport'));
const RadiantLedger             = lazy(() => import('../../features/RadiantApp/CmsReport/RadiantLedger'));
const CashDepositReport         = lazy(() => import('../../features/RadiantApp/CmsReport/CashDepositReport'));
const NewCashDepositReport      = lazy(() => import('../../features/RadiantApp/CmsReport/NewCashDepositReport'));
const DownloadDocRadiant        = lazy(() => import('../../features/RadiantApp/Radiantregister/DownloadDocRadiant'));
const UploadDocRadiant          = lazy(() => import('../../features/RadiantApp/Radiantregister/UploadDocRadiant'));
const AddressRadiant            = lazy(() => import('../../features/RadiantApp/Radiantregister/AddressRadiant '));
const ReferencesRadiant         = lazy(() => import('../../features/RadiantApp/Radiantregister/ReferencesRadiant'));
const Qualification             = lazy(() => import('../../features/RadiantApp/Radiantregister/Qualification'));
const DrawingLaises             = lazy(() => import('../../features/RadiantApp/Radiantregister/DrawingLaises'));
const BasicInfo                 = lazy(() => import('../../features/RadiantApp/Radiantregister/BasicInfo'));
const Availabilitybusiness      = lazy(() => import('../../features/RadiantApp/RadiantNewClient/Availabilitybusiness'));
const Requirementscms           = lazy(() => import('../../features/RadiantApp/RadiantNewClient/Requirementcms'));
const AboutCms                  = lazy(() => import('../../features/RadiantApp/RadiantNewClient/AboutCms'));
const Radiantregister           = lazy(() => import('../../features/RadiantApp/RadiantNewClient/Radiantregister'));
const Checklistcms              = lazy(() => import('../../features/RadiantApp/RadiantNewClient/Checklistcns'));
const CheckPendingForm          = lazy(() => import('../../features/RadiantApp/RadiantNewClient/CheckPendingForm'));
const CmsPayoutStructure        = lazy(() => import('../../features/RadiantApp/RadiantNewClient/CmsPayoutStructure'));
const CmsShowPayoutStructure    = lazy(() => import('../../features/RadiantApp/RadiantNewClient/CmsShowPayoutStructure'));
const ImgPendingcms             = lazy(() => import('../../features/RadiantApp/RadiantNewClient/ImgPendingcms'));
const PickupSalaryCalendar      = lazy(() => import('../../features/RadiantApp/CmsSalarySheet/PickupSalaryCalendar'));
const CrePayout                 = lazy(() => import('../../features/RadiantApp/CmsSalarySheet/CrePayout'));
const OtherPayMent              = lazy(() => import('../../features/RadiantApp/components/OtherPayMent'));
const ReferredCusPoints         = lazy(() => import('../../features/RadiantApp/components/ReferredCusPoints'));
const SelfieScreen              = lazy(() => import('../../features/RadiantApp/selfiescreen'));
const RadiantPrepayReport       = lazy(() => import('../../features/History/CmsReport/RadiantPrepayReport'));
const PrepaySlipSummary         = lazy(() => import('../../features/History/CmsReport/PrepaySlipSummary'));

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
const AadharCardUpload          = lazy(() => import('../../components/AdharImageUpload'));
const PDFGenerator              = lazy(() => import('../../components/Pdf_Print'));

// ─────────────────────────────────────────────────────────────────────────────
// NAVIGATOR WRAPPER - Suspense se wrap karo
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apne existing Stack.Navigator ko aise wrap karo:
 *
 * const ScreenNavigator = () => {
 *   return (
 *     <Suspense fallback={<LoadingScreen />}>
 *       <Stack.Navigator>
 *         <Stack.Screen name="Home" component={HomeScreen} />
 *         ... baaki sab screens same rahenge
 *       </Stack.Navigator>
 *     </Suspense>
 *   );
 * };
 */

export {
  LoadingScreen,
  // Dashboard
  HomeScreen, QuickAccessScreen, VideoKYC, HoldAndCredit,
  AadharPanVerify, AadhrPanVerify, RecentTx,
  // Security
  DeviceLockScreen, SetOtpPass, MandatorySim, ScreenLock,
  ManageLogin, LoginReport, Mpin,
  // Drawer
  LanguageSettings, VoiceNotification, VoiceNotificationpage,
  DarkMode, EditProfile, Complaint, Natifications,
  // Recharge
  CabelTvScreen, CableTvScreen, MunicipalTaxScreen, HousingTaxScreen,
  SubscriptionScreen, Rechargedetails, PrepaidGasScreen,
  RechargeHistory, RechargePin,
  // DMT
  MoneyTransferScreen, GetBenifiaryScreen, ServicepurchaseScreen,
  NumberRegisterScreen, AddNewBenificiaryScreen, toBankScreen,
  DmtAddNewBenificiaryScreen, DmtTransferScreen, DmtTabScreen,
  // UPI
  UpiDmtScreen, UpiAddNewVPAScreen, UpiGetBenifiaryScreen, QRScanner,
  // QR Scan (Vision Camera)
  QRScanScreen, UpiPayResult, ShowUPIData,
  // AEPS (Vision Camera)
  AepsScreen, TwoFAVerify, Aepsekycscan, Aepsekyc, AdharPay,
  BalanceCheck, AepsMinistatement, AepsCW, TwoFaComponent,
  AepsTabScreen, AepsResponse,
  // PAN
  PanCardScreen, Registerform, PancardManual,
  // Wallet
  WalletSenderPage, ToWallet, AddNewWallet,
  // Financial Other
  RadiantForm, MicroAtm, RegisterVM30, MAtmStatusCheck,
  // Add Money
  AddMoneyOptions, QRCodePage, ReqToAdmin, UpiQrCodes,
  SeamlessScreen, APIScreen, PaymentMethods, PayuPayment,
  UPISeamless, UPI, AddMoneyPayResponse,
  // History
  RechargeUtilitisR, ImpsNeftScreen, AEPSAdharPayR, MPosScreenR,
  MatmReport, PanReport, cashDepReport, FlightBookReport,
  BusBookReport, PaymentGReport, posreport, FinocmsReport,
  Walletunloadreport, WalletTransferReport,
  // Accounts
  DayEarningReport, DayLedgerReport, DayBookReport, FundReceivedReport,
  DisputeReport, AddedMoneyROTRReport, OtherLinks, PurchaseOrderReport,
  OperatorCommissionReport, ManageAccount, RtorScreen, RToRReport,
  PostoMain, MyExpense, CommissionReport,
  // Travels
  BusScreen,
  // Radiant
  CmsScreen, RadiantDashboard, RadiantTransactionScreen, CashPickup,
  PicUpScreen, InprocessReportCms, CmsACList, CmsCoustomerInfo,
  CmsCodeVerification, CmsFinalOtpVerification, CmsCodeStatus,
  PickupSummaryScreen, CmsNewPin, CmsPrePay, CmsPrePayFinalVfy,
  Totalpayreport, CashPicUpReport, RadiantLedger, CashDepositReport,
  NewCashDepositReport, DownloadDocRadiant, UploadDocRadiant,
  AddressRadiant, ReferencesRadiant, Qualification, DrawingLaises,
  BasicInfo, Availabilitybusiness, Requirementscms, AboutCms,
  Radiantregister, Checklistcms, CheckPendingForm, CmsPayoutStructure,
  CmsShowPayoutStructure, ImgPendingcms, PickupSalaryCalendar,
  CrePayout, OtherPayMent, ReferredCusPoints, SelfieScreen,
  RadiantPrepayReport, PrepaySlipSummary,
  // Components
  AadharCardUpload, PDFGenerator,
};