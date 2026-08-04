import React from 'react';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../../features/login/LoginScreen';
import SignUpScreen from '../../features/signup/SignUpScreen';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomDrawer from '../../components/CustomDrawer';
import { hScale, wScale } from '../styles/dimensions';
import DashboardScreen from '../../features/dashboard/DashboardScreen';
import Profile from '../../features/drawer/Profile';
import { translate } from '../languageUtils/I18n';
import { SvgXml } from 'react-native-svg';
import { StyleSheet } from 'react-native';
import Changepassword from '../../features/drawer/securityPages/Changepassword';
import DeletUser from '../../features/drawer/profilePages/deletAccount/deleteuser';
import AreYousuareUserDelete from '../../features/drawer/profilePages/deletAccount/otpdeleteuser';
import ChangeForgetPin from '../../features/drawer/securityPages/ChangeForgetPin';
import MobileDeviceReg from '../../features/drawer/securityPages/MobilRegistration';
import ForgetPin from '../../features/drawer/securityPages/forgetpin/forgetpin';
import Bankholidays from '../../features/drawer/help&support/bankholidays';
import FAQs from '../../features/drawer/help&support/faqs';
import RechargeScreen from '../../features/Recharge/RechargeScreen';
import Setting from '../../features/drawer/Setting';
import Help_And from '../../features/drawer/Help';
import Security from '../../features/drawer/Security';
import ReferAndEran from '../../features/drawer/ReferAndEran';
import Administrator from '../../features/drawer/Administrator';
import Logout from '../../features/drawer/Logout';
import DrawerNavigation from '../../features/drawer/DrawerNavigation';
import DthScreen from '../../features/Recharge/DthScreen';
import ElectricityScreen from '../../features/Recharge/ElectricityScreen';
import GasCylinderScreen from '../../features/Recharge/GasCylinderScreen';
import FastagScreen from '../../features/Recharge/FastagScreen';
import LoanScreen from '../../features/Recharge/LoanScreen';
import InsuranceScreen from '../../features/Recharge/InsuranceScreen';
import CreditCardScreen from '../../features/Recharge/CreditCardScreen';
import WaterBillScreen from '../../features/Recharge/WaterBillScreen';
import LandlineScreen from '../../features/Recharge/LandlineScreen';
import EducationFeeScreen from '../../features/Recharge/EducationFeeScreen';
import BroadbandScreen from '../../features/Recharge/BroadbandScreen';
import HospitalScreen from '../../features/Recharge/HospitalScreen';
import CabelTvScreen from '../../features/Recharge/CabelTvScreen';
import MunicipalTaxScreen from '../../features/Recharge/MunicipalTaxScreen';
import HousingTaxScreen from '../../features/Recharge/HousingTaxScreen';
import SubscriptionScreen from '../../features/Recharge/SubscriptionScreen';
import DeviceLockScreen from '../../features/login/DeviceLockScreen';
import MoneyTransferScreen from '../../features/Financial/VastDMT/MoneyTransfer';
import GetBenifiaryScreen from '../../features/Financial/VastDMT/GetBenifiaryScreen';
import ServicepurchaseScreen from '../../features/Financial/VastDMT/ServicepurchaseScreen';
import NumberRegisterScreen from '../../features/Financial/VastDMT/RegisternNewNumber';
import AddNewBenificiaryScreen from '../../features/Financial/VastDMT/AddNewBenificiaryScreen';
import SetOtpPass from '../../features/drawer/securityPages/SetOtpPass';
import MandatorySim from '../../features/drawer/securityPages/MandatorySin';
import ScreenLock from '../../features/drawer/securityPages/ScreenLockSeting';
import ManageLogin from '../../features/drawer/securityPages/ManageLogin';
import LanguageSettings from '../../features/drawer/settingPages/LanguageSettings';
import VoiceNotification from '../../features/drawer/settingPages/VoiceNotification';
import VoiceNotificationpage from '../../features/drawer/settingPages/VoiceNotification';
import DarkMode from '../../features/drawer/settingPages/DarkMode';
import Rechargedetails from '../../features/Recharge/Mobilerechargepages/rechargedetails';
import QuickAccessScreen from '../../features/dashboard/QuickAccessScreen';
import UpiDmtScreen from '../../features/Financial/UpiTransfer/DmtScreen';
import toBankScreen from '../../features/Financial/VastDMT/ToAccDmt';
import UpiAddNewVPAScreen from '../../features/Financial/UpiTransfer/UpiAddNewBenificiaryScreen';
import UpiGetBenifiaryScreen from '../../features/Financial/UpiTransfer/UpiGetBenifiaryScreen';
import PanCardScreen from '../../features/Financial/PanCard/PanServicePurchase';
import Registerform from '../../features/Financial/PanCard/PanCardRegForm';
import RadiantForm from '../../features/Financial/RadiantForm';
import WalletSenderPage from '../../features/Financial/Towallet/WalletSenderPage';
import AepsScreen from '../../features/Financial/Aeps/Aepspage';
import TwoFAVerify from '../../features/Financial/Aeps/TwoFaScreen';
import Aepsekycscan from '../../features/Financial/Aeps/aepsKycScan';
import Aepsekyc from '../../features/Financial/Aeps/aepsKyc';
import AdharPay from '../../features/Financial/Aeps/aadharpay';
import BalanceCheck from '../../features/Financial/Aeps/Balancecheck';
import AepsMinistatement from '../../features/Financial/Aeps/AepsMinistatement';
import AepsCW from '../../features/Financial/Aeps/AepsCashwithdrawl';
import ToWallet from '../../features/Financial/Towallet/toWallet';
import AddNewWallet from '../../features/Financial/Towallet/AddWalletID';
import AddMoneyOptions from '../../features/AddMoneyOps/AddMOptions';
import QRCodePage from '../../features/AddMoneyOps/Qrcode';
import ReqToAdmin from '../../features/AddMoneyOps/ReqtoAdmin';
import RechargeUtilitisR from '../../features/History/Recharge&Utilities';
import ImpsNeftScreen from '../../features/History/impsnefReport';
import AEPSAdharPayR from '../../features/History/AepsReport';
import MPosScreenR from '../../features/History/MposReport';
import MatmReport from '../../features/History/MatmsReport';
import PanReport from '../../features/History/panCardReport';
import cashDepReport from '../../features/History/CashDeposite';
import FlightBookReport from '../../features/History/flighBookReport';
import BusBookReport from '../../features/History/BusBookReport';
import PaymentGReport from '../../features/History/PGReport';
import posreport from '../../features/History/posreport';
import FinocmsReport from '../../features/History/FinocmsReport';
import DayEarningReport from '../../features/Acount/DayEarning';
import DayLedgerReport from '../../features/Acount/DayLedger';
import DayBookReport from '../../features/Acount/DayBook';
import FundReceivedReport from '../../features/Acount/FundRecieved';
import DisputeReport from '../../features/Acount/DisputeReport';
import AddedMoneyROTRReport from '../../features/Acount/AddMoney';
import OtherLinks from '../../features/Acount/OtherLinks';
import PurchaseOrderReport from '../../features/Acount/PurchaseOrderReport';
import OperatorCommissionReport from '../../features/Acount/OperatorCommission';
import VideoKYC from '../../features/dashboard/videokyc';
import QRScanner from '../../features/Financial/UpiTransfer/toQr';
import TwoFaComponent from '../../features/Financial/Aeps/aepstest';
import ManageAccount from '../../features/Acount/ManageAcc';
import HomeScreen from '../../features/dashboard/HomeScreen';
import MicroAtm from '../../features/Financial/microatm/MicroAtm';
import { Header } from 'react-native/Libraries/NewAppScreen';
import BusScreen from '../../features/Travels/BusScreen';
import PancardManual from '../../features/Financial/PanCard/PanCardManualForm';
import RechargeHistory from '../../features/History/RechargeHistory';
import CmsScreen from '../../features/RadiantApp/CmsScreen';
import RadiantDashboard from '../../features/RadiantApp/RadiantDashboard';
import RadiantTransactionScreen from '../../features/RadiantApp/RadiantTransactionScreen';
import CashPickup from '../../features/RadiantApp/RadiantTrxn/CashPicUp';
import PicUpScreen from '../../features/RadiantApp/RadiantTrxn/PicUpScreen';
import RtorScreen from '../../features/Acount/RtorScreen';
import RToRReport from '../../features/Acount/RToRReport';
import PostoMain from '../../features/Acount/posTomain';
import AepsTabScreen from '../../features/Financial/Aeps/AepsTabScreen';
import HoldAndCredit from '../../features/dashboard/HoldAndCredit';
import UpiQrCodes from '../../features/AddMoneyOps/UpiQrCodes';
import AepsResponse from '../../features/Financial/Aeps/AepsRespons';
import DmtAddNewBenificiaryScreen from '../../features/Financial/Dmt/DmtAddNewBeneficiarycreen';
import AadharPanVerify from '../../features/dashboard/AddharPanVerification';
import AadhrPanVerify from '../../features/dashboard/AddharPanVerification';
import AadharCardUpload from '../../components/AdharImageUpload';
import DmtTransferScreen from '../../features/Financial/Dmt/DmtTransferScreen';
import DmtTabScreen from '../../features/Financial/Dmt/DmtTabScreen';
import SeamlessScreen from '../../features/AddMoneyOps/payu/SeamlessScreen';
import APIScreen from '../../features/AddMoneyOps/payu/APIScreen';
import PaymentMethods from '../../features/AddMoneyOps/payu/seamless/PaymentMethods';
import PayuPayment from '../../features/AddMoneyOps/payu/seamless/PayuPayment';
import RecentTx from '../../features/dashboard/RecentTx';
import EditProfile from '../../features/drawer/EditProfile';
import CableTvScreen from '../../features/Recharge/CabelTvScreen';
import UPISeamless from '../../features/AddMoneyOps/payu/seamless/UPISeamless';
import UPIScreen from '../../features/AddMoneyOps/payu/UPIScreen';
import UPI from '../../features/AddMoneyOps/payu/seamless/UPI';
import PrepaidGasScreen from '../../features/Recharge/pipegas';
import LoginReport from '../../features/drawer/securityPages/LoginReport';
import Walletunloadreport from '../../features/History/walletunloadreport';
import Complaint from '../../features/drawer/Complaints';
import PDFGenerator from '../../components/Pdf_Print';
import RegisterVM30 from '../../features/Financial/microatm/RegisterVM30';
import MAtmStatusCheck from '../../features/Financial/microatm/mAtmStatusCheck';
import Mpin from '../../features/drawer/securityPages/Mpin';
import Totalpayreport from '../../features/RadiantApp/CmsReport/Totalpayreport';
import Availabilitybusiness from '../../features/RadiantApp/RadiantNewClient/Availabilitybusiness';
import Requirementscms from '../../features/RadiantApp/RadiantNewClient/Requirementcms';
import AboutCms from '../../features/RadiantApp/RadiantNewClient/AboutCms';
import Radiantregister from '../../features/RadiantApp/RadiantNewClient/Radiantregister';

import Checklistcms from '../../features/RadiantApp/RadiantNewClient/Checklistcns';
import CashPicUpReport from '../../features/RadiantApp/CmsReport/CashPicUpReport';
import WalletTransferReport from '../../features/History/Radientwallettransferreport';
import InprocessReportCms from '../../features/RadiantApp/RadiantTrxn/InprocessReportCms';
import CmsACList from '../../features/RadiantApp/RadiantTrxn/CmsACList';
import CmsCoustomerInfo from '../../features/RadiantApp/RadiantTrxn/CmsCoustomerInfo';
import CmsCodeVerification from '../../features/RadiantApp/RadiantTrxn/CmsCodeVerification';
import CmsFinalOtpVerification from '../../features/RadiantApp/RadiantTrxn/CmsFinalOtpVerification';
import CmsCodeStatus from '../../features/RadiantApp/RadiantTrxn/CmsCodeStatus';
import PickupSummaryScreen from '../../features/RadiantApp/RadiantTrxn/PickupSummaryScreen';
import RadiantLedger from '../../features/RadiantApp/CmsReport/RadiantLedger';
import CashDepositReport from '../../features/RadiantApp/CmsReport/CashDepositReport';
import CheckPendingForm from '../../features/RadiantApp/RadiantNewClient/CheckPendingForm';
import CmsNewPin from '../../features/RadiantApp/RadiantTrxn/CmsNewPin';
import CmsPayoutStructure from '../../features/RadiantApp/RadiantNewClient/CmsPayoutStructure';
import QRScanScreen from '../../features/Financial/ScanQr/QRScanScreen';
import UpiPayResult from '../../features/Financial/ScanQr/UpiPayResult';
import ShowUPIData from '../../features/Financial/ScanQr/ShowUPIData';
import AddMoneyPayResponse from '../../components/AddMoneyPayResponse';
import CmsPrePay from '../../features/RadiantApp/RadiantTrxn/CmsPrePay';
import CmsPrePayFinalVfy from '../../features/RadiantApp/RadiantTrxn/CmsPrePayFinalVfy';
import RadiantPrepayReport from '../../features/History/CmsReport/RadiantPrepayReport';
import ImgPendingcms from '../../features/RadiantApp/RadiantNewClient/ImgPendingcms';
import PickupSalaryCalendar from '../../features/RadiantApp/CmsSalarySheet/PickupSalaryCalendar';
import CrePayout from '../../features/RadiantApp/CmsSalarySheet/CrePayout';
import CmsShowPayoutStructure from '../../features/RadiantApp/RadiantNewClient/CmsShowPayoutStructure';
import PrepaySlipSummary from '../../features/History/CmsReport/PrepaySlipSummary';
import OtherPayMent from '../../features/RadiantApp/components/OtherPayMent';
import NewCashDepositReport from '../../features/RadiantApp/CmsReport/NewCashDepositReport';
import ReferredCusPoints from '../../features/RadiantApp/components/ReferredCusPoints';
import RechargePin from '../../features/Recharge/RechargePin';
import MyExpense from '../../features/Acount/MyExpense';
import SelfieScreen from '../../features/RadiantApp/selfiescreen';
import CommissionReport from '../../features/Acount/maxuspay';
import RadiantStep from '../../features/RadiantApp/Radiantregister/RadiantStep';
import ApprovalStatusScreen from '../../features/RadiantApp/Radiantregister/ApprovalStatusScreen';
import CameraScreen from '../../components/CameraScreen';
import CashWithdrawalScreen from '../../features/Financial/Aeps/CashWithdrawalScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
    
  screenOptions={{
    headerShown: false,
    gestureEnabled: true,
    animation: 'none',   // 👈 animation band
  }}
      initialRouteName={'DashboardScreen'}>
      <Stack.Screen
        name="DeviceLockScreen"
        component={DeviceLockScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DashboardScreen"
        component={DrawerNavigation}
        options={{ headerShown: false }}
      />
  
      <Stack.Screen
        name="Changepassword"
        component={Changepassword}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="DeletUser"
        component={DeletUser}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AreYousuareUserDelete"
        component={AreYousuareUserDelete}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CableTvScreen"
        component={CableTvScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ChangeForgotPin"
        component={ChangeForgetPin}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MobileDeviceReg"
        component={MobileDeviceReg}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SignUpScreen"
        component={SignUpScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen name='ManageLogin'
        component={ManageLogin}
        options={{ headerShown: false }} />
      <Stack.Screen name='SetOtpPass'
        component={SetOtpPass}
        options={{ headerShown: false }} />
      <Stack.Screen name='ScreenLock'
        component={ScreenLock}
        options={{ headerShown: false }} />
      <Stack.Screen name='MandatorySim'
        component={MandatorySim}
        options={{ headerShown: false }} />

      <Stack.Screen
        name="ForgetPin"
        component={ForgetPin}
        options={{ headerShown: false }}
      />


      <Stack.Screen
        name='LanguageSettings'
        component={LanguageSettings}
      />
      <Stack.Screen name='VoiceNotification'
        component={VoiceNotificationpage}
        options={{ headerShown: false }} />

      <Stack.Screen name='DarkMode'
        component={DarkMode}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Bankholidays"
        component={Bankholidays}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FAQs"
        component={FAQs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RechargeScreen"
        component={RechargeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="QuickAccessScreen"
        component={QuickAccessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DthScreen"
        component={DthScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ElectricityScreen"
        component={ElectricityScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GasCylinderScreen"
        component={GasCylinderScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FastagScreen"
        component={FastagScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LoanScreen"
        component={LoanScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="InsuranceScreen"
        component={InsuranceScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreditCardScreen"
        component={CreditCardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WaterBillScreen"
        component={WaterBillScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PrepaidGasScreen"
        component={PrepaidGasScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LandlineScreen"
        component={LandlineScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EducationFeeScreen"
        component={EducationFeeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BroadbandScreen"
        component={BroadbandScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HospitalScreen"
        component={HospitalScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CabelTvScreen"
        component={CabelTvScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MunicipalTaxScreen"
        component={MunicipalTaxScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HousingTaxScreen"
        component={HousingTaxScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="SubscriptionScreen"
        component={SubscriptionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MoneyTransferScreen"
        component={MoneyTransferScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="GetBenifiaryScreen"
        component={GetBenifiaryScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="ServicepurchaseScreen"
        component={ServicepurchaseScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NumberRegisterScreen"
        component={NumberRegisterScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddNewBenificiaryScreen"
        component={AddNewBenificiaryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name='Rechargedetails'
        component={Rechargedetails} options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UpiDmtScreen"
        component={UpiDmtScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="toBankScreen"
        component={toBankScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UpiAddNewVPAScreen"
        component={UpiAddNewVPAScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UpiGetBenificiaryScreen"
        component={UpiGetBenifiaryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PanCardScreen"
        component={PanCardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Registerform"
        component={Registerform}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RadiantForm"
        component={RadiantForm}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="WalletSenderPage"
        component={WalletSenderPage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TwoFAVerify"
        component={TwoFAVerify}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AepsScreen"
        component={AepsScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Aepsekycscan"
        component={Aepsekycscan}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Aepsekyc"
        component={Aepsekyc}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdharPay"
        component={AdharPay}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BalanceCheck"
        component={BalanceCheck}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PancardManual"
        component={PancardManual}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="AepsMinistatement"
        component={AepsMinistatement}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AepsCW"
        component={AepsCW}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ToWallet"
        component={ToWallet}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddNewWallet"
        component={AddNewWallet}
        options={{ headerShown: false }}
      />
      {/* <Stack.Screen 
      name='Rechargedetails'
      component={Rechargedetails}options={{headerShown:false}}
      /> */}
      <Stack.Screen
        name="AddMoneyOptions"
        component={AddMoneyOptions}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="QRCodePage"
        component={QRCodePage}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReqToAdmin"
        component={ReqToAdmin}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="BusScreen"
        component={BusScreen}
        options={{ headerShown: false }}

      />
      <Stack.Screen
        name="RechargeUtilitisR"
        component={RechargeUtilitisR}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ImpsNeftScreen"
        component={ImpsNeftScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AEPSAdharPayR"
        component={AEPSAdharPayR}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MPosScreenR"
        component={MPosScreenR}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MatmReport"
        component={MatmReport}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PanReport"
        component={PanReport}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="cashDepReport"
        component={cashDepReport}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FlightBookReport"
        component={FlightBookReport}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="BusBookReport"
        component={BusBookReport}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PaymentGReport"
        component={PaymentGReport}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="posreport"
        component={posreport}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Walletunloadreport"
        component={Walletunloadreport}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PostoMain"
        component={PostoMain}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FinocmsReport"
        component={FinocmsReport}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Complaint"
        component={Complaint}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DayEarningReport"
        component={DayEarningReport}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DayLedgerReport"
        component={DayLedgerReport}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DayBookReport"
        component={DayBookReport}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RtorScreen"
        component={RtorScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RToRReport"
        component={RToRReport}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReportScreen"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddedMoneyROTRReport"
        component={AddedMoneyROTRReport}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="FundReceivedReport"
        component={FundReceivedReport}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DisputeReport"
        component={DisputeReport}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OtherLinks"
        component={OtherLinks}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PurchaseOrderReport"
        component={PurchaseOrderReport}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="OperatorCommissionReport"
        component={OperatorCommissionReport}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UpiQrCodes"
        component={UpiQrCodes}
        options={{ headerShown: false }}
      />
      {/* <Stack.Screen
        name="CashDeposit"
        component={CashDeposit}
        options={{ headerShown: false }}
      /> */}
      <Stack.Screen
        name="VideoKYC"
        component={VideoKYC}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="QRScanner"
        component={QRScanner}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TwoFaComponent"
        component={TwoFaComponent}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ManageAccount"
        component={ManageAccount}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="M-ATM&PosScreen"
        component={MicroAtm}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RechargeHistory"
        component={RechargeHistory}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CmsScreen"
        component={CmsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RadiantDashboard"
        component={RadiantDashboard}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RadiantTransactionScreen"
        component={RadiantTransactionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CashPickup"
        component={CashPickup}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="PicUpScreen"
        component={PicUpScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AepsTabScreen"
        component={AepsTabScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="HoldAndCredit"
        component={HoldAndCredit}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AepsRespons"
        component={AepsResponse}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DmtAddNewBenificiaryScreen"
        component={DmtAddNewBenificiaryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AadhrPanVerify"
        component={AadhrPanVerify}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AadharCardUpload"
        component={AadharCardUpload}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DmtTransferScreen"
        component={DmtTransferScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DmtTabScreen"
        component={DmtTabScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SeamlessScreen"
        component={SeamlessScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="APIScreen"
        component={APIScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RecentTx"
        component={RecentTx}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PaymentMethods"
        component={PaymentMethods}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PayuPayment"
        component={PayuPayment}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfile}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UPI"
        component={UPI}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="LoginReport"
        component={LoginReport}
        options={{ headerShown: false }}
      />
    

      <Stack.Screen
        name="PDFGenerator"
        component={PDFGenerator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MAtmStatusCheck"
        component={MAtmStatusCheck}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="RegisterVM30"
        component={RegisterVM30}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Mpin"
        component={Mpin}
        options={{ headerShown: false }}
      />
      <Stack.Screen
      name='ApprovalStatusScreen'
      component={ApprovalStatusScreen}
      options={{headerShown:false}}
      />

      

    


      <Stack.Screen
        name="Radiantregister"
        component={Radiantregister}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="AboutCms"
        component={AboutCms}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Requirementscms"
        component={Requirementscms}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="Checklistcms"
        component={Checklistcms}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Availabilitybusiness"
        component={Availabilitybusiness}
        options={{ headerShown: false }}
      />
     


      <Stack.Screen
        name="Totalpayreport"
        component={Totalpayreport}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CashPicUpReport"
        component={CashPicUpReport}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="WalletTransferReport"
        component={WalletTransferReport}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="InprocessReportCms"
        component={InprocessReportCms}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CmsACList"
        component={CmsACList}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CmsCoustomerInfo"
        component={CmsCoustomerInfo}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CmsCodeVerification"
        component={CmsCodeVerification}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CmsFinalOtpVerification"
        component={CmsFinalOtpVerification}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CmsCodeStatus"
        component={CmsCodeStatus}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SelfieScreen"
        component={SelfieScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PickupSummaryScreen"
        component={PickupSummaryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RadiantLedger"
        component={RadiantLedger}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CashDepositReport"
        component={CashDepositReport}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CheckPendingForm"
        component={CheckPendingForm}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CmsNewPin"
        component={CmsNewPin}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CmsPayoutStructure"
        component={CmsPayoutStructure}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ShowUPIData"
        component={ShowUPIData}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="UpiPayResult"
        component={UpiPayResult}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="QRScanScreen"
        component={QRScanScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddMoneyPayResponse"
        component={AddMoneyPayResponse}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="CmsPrePay"
        component={CmsPrePay}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CmsPrePayFinalVfy"
        component={CmsPrePayFinalVfy}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RadiantPrepayReport"
        component={RadiantPrepayReport}
        options={{ headerShown: false }}
      />
  <Stack.Screen
        name="ImgPendingcms"
        component={ImgPendingcms}
        options={{ headerShown: false }}
      />

       <Stack.Screen
        name="PickupSalaryCalendar"
        component={PickupSalaryCalendar}
        options={{ headerShown: false }}
      />

       <Stack.Screen
        name="CrePayout"
        component={CrePayout}
        options={{ headerShown: false }}
      />

        <Stack.Screen
        name="CmsShowPayoutStructure"
        component={CmsShowPayoutStructure}
        options={{ headerShown: false }}
      />
        <Stack.Screen
        name="PrepaySlipSummary"
        component={PrepaySlipSummary}
        options={{ headerShown: false }}
      />
        <Stack.Screen
        name="OtherPayMent"
        component={OtherPayMent}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="NewCashDepositReport"
        component={NewCashDepositReport}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReferredCusPoints"
        component={ReferredCusPoints}
        options={{ headerShown: false }}
      />

        <Stack.Screen
        name="RechargePin"
        component={RechargePin}
        options={{ headerShown: false }}
      />
 <Stack.Screen
        name="RadiantStep"
        component={RadiantStep}
        options={{ headerShown: false }}
      /> 
      
        <Stack.Screen
        name="MyExpense"
        component={MyExpense}
        options={{ headerShown: false }}
      />  
       <Stack.Screen
        name="CommissionReport"
        component={CommissionReport}
        options={{ headerShown: false }}
      />
       <Stack.Screen
        name="CameraScreen"
        component={CameraScreen}
        options={{ headerShown: false }}
      />

            <Stack.Screen
        name="UPIScreen"
        component={UPIScreen}
        options={{ headerShown: false }}
      />   

            <Stack.Screen
        name="CashWithdrawalScreen"
        component={CashWithdrawalScreen}
        options={{ headerShown: false }}
      />   
    </Stack.Navigator>
  );
};

export default AppNavigator
