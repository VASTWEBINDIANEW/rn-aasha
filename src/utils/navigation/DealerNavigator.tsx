import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import FundTransferUser from "../../features/Delerpages/DelerHomeToppage/FundTransferUser";
import DealerUser from "../../features/Delerpages/DelerHomeToppage/DealerUser";
import DealerToken from "../../features/Delerpages/DelerHomeToppage/delerToken";
import DealerDashboard from "../../features/Delerpages/DealerDashboard";
import DealerAddWalletAndAddAcc from "../../features/Delerpages/DelerHomeToppage/DealerAddWallet&AddAcc";
import AadharCardUpload from "../../components/AdharImageUpload";
import RechargeUtilitisR from "../../features/History/Recharge&Utilities";
import DealerRechargeHistory from "../../features/Delerpages/Dealer_history/DealerRechargeHistory";
import RechargeHistory from "../../features/History/RechargeHistory";
import AEPSAdharPayR from "../../features/History/AepsReport";
import DayEarningReport from "../../features/Acount/DayEarning";
import DayLedgerReport from "../../features/Acount/DayLedger";
import DayBookReport from "../../features/Acount/DayBook";
import PurchaseOrderReport from "../../features/Acount/PurchaseOrderReport";
import ManageAccount from "../../features/Acount/ManageAcc";
import FundReceivedReport from "../../features/Acount/FundRecieved";
import RToRReport from "../../features/Acount/RToRReport";
import OperatorCommissionReport from "../../features/Acount/OperatorCommission";
import CreditReport from "../../features/Delerpages/Dealer_history/CreditReport";
import ImpsNeftScreen from "../../features/History/impsnefReport";
import PaymentGReport from "../../features/History/PGReport";
import MatmReport from "../../features/History/MatmsReport";
import PanReport from "../../features/History/panCardReport";
import MPosScreenR from "../../features/History/MposReport";
import AddMoneyOptions from "../../features/AddMoneyOps/AddMOptions";
import ReqToAdmin from "../../features/AddMoneyOps/ReqtoAdmin";
import QRCodePage from "../../features/AddMoneyOps/Qrcode";
import DrawerNavigation from "../../features/drawer/DrawerNavigation";
import Changepassword from "../../features/drawer/securityPages/Changepassword";
import ChangeForgetPin from "../../features/drawer/securityPages/ChangeForgetPin";
import ForgetPin from "../../features/drawer/securityPages/forgetpin/forgetpin";
import DealerDocsRetailer from "../../features/Delerpages/AccountsPage/DealerDocsRetailer";
import SeamlessScreen from "../../features/AddMoneyOps/payu/SeamlessScreen";
import UPI from "../../features/AddMoneyOps/payu/seamless/UPI";
import VideoKYC from "../../features/dashboard/videokyc";
import EditProfile from "../../features/drawer/EditProfile";
import WalletTransferReport from "../../features/History/Radientwallettransferreport";
import CashPicUpReport from "../../features/RadiantApp/CmsReport/CashPicUpReport";
import Totalpayreport from "../../features/RadiantApp/CmsReport/Totalpayreport";
import Availabilitybusiness from "../../features/RadiantApp/RadiantNewClient/Availabilitybusiness";
import Checklistcms from "../../features/RadiantApp/RadiantNewClient/Checklistcns";
import Requirementscms from "../../features/RadiantApp/RadiantNewClient/Requirementcms";
import AboutCms from "../../features/RadiantApp/RadiantNewClient/AboutCms";
import Radiantregister from "../../features/RadiantApp/RadiantNewClient/Radiantregister";
import InprocessReportCms from "../../features/RadiantApp/RadiantTrxn/InprocessReportCms";
import CmsACList from "../../features/RadiantApp/RadiantTrxn/CmsACList";
import CmsCoustomerInfo from "../../features/RadiantApp/RadiantTrxn/CmsCoustomerInfo";
import CmsCodeVerification from "../../features/RadiantApp/RadiantTrxn/CmsCodeVerification";
import CmsFinalOtpVerification from "../../features/RadiantApp/RadiantTrxn/CmsFinalOtpVerification";
import CmsCodeStatus from "../../features/RadiantApp/RadiantTrxn/CmsCodeStatus";
import PickupSummaryScreen from "../../features/RadiantApp/RadiantTrxn/PickupSummaryScreen";
import PicUpScreen from "../../features/RadiantApp/RadiantTrxn/PicUpScreen";
import CashPickup from "../../features/RadiantApp/RadiantTrxn/CashPicUp";
import RadiantTransactionScreen from "../../features/RadiantApp/RadiantTransactionScreen";
import RadiantDashboard from "../../features/RadiantApp/RadiantDashboard";
import CmsScreen from "../../features/RadiantApp/CmsScreen";
import RadiantLedger from "../../features/RadiantApp/CmsReport/RadiantLedger";
import cashDepReport from "../../features/History/CashDeposite";
import CashDepositReport from "../../features/RadiantApp/CmsReport/CashDepositReport";


const Stack = createNativeStackNavigator();
export const DealerNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
                gestureEnabled: false
            }}
            initialRouteName={'DealerDashboard'}
        >

            <Stack.Screen
                name="FundTransferUser"
                component={FundTransferUser}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="DealerRechargeHistory"
                component={DealerRechargeHistory}
                options={{ headerShown: false }}
            />

            <Stack.Screen
                name="DealerDashboard"
                component={DrawerNavigation}
                options={{ headerShown: false, }}
            />
            <Stack.Screen
                name="DealerToken"
                component={DealerToken}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="DealerUser"
                component={DealerUser}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AadharCardUpload"
                component={AadharCardUpload}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="RechargeHistory"
                component={RechargeHistory}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AEPSAdharPayR"
                component={AEPSAdharPayR}
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
                name="PurchaseOrderReport"
                component={PurchaseOrderReport}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="DealerAddWalletAndAddAcc"
                component={DealerAddWalletAndAddAcc}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="ManageAccount"
                component={ManageAccount}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="FundReceivedReport"
                component={FundReceivedReport}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="RToRReport"
                component={RToRReport}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="OperatorCommissionReport"
                component={OperatorCommissionReport}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="CreditReport"
                component={CreditReport}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="ImpsNeftScreen"
                component={ImpsNeftScreen}
                options={{ headerShown: false }}
            /> 
            <Stack.Screen
                name="PaymentGReport"
                component={PaymentGReport}
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
                name="MPosScreenR"
                component={MPosScreenR}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="AddMoneyOptions"
                component={AddMoneyOptions}
                options={{ headerShown: false }}
            />
       <Stack.Screen
                name="ReqToAdmin"
                component={ReqToAdmin}
                options={{ headerShown: false }}
            />
            
            <Stack.Screen
                name="Changepassword"
                component={Changepassword}
                options={{ headerShown: false }}
            />
        
            <Stack.Screen
                name="ChangeForgotPin"
                component={ChangeForgetPin}
                options={{ headerShown: false }}
            /> 
            
            <Stack.Screen
                name="SeamlessScreen"
                component={SeamlessScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="UPI"
                component={UPI}
                options={{ headerShown: false }}
            />

 <Stack.Screen
                name="ForgetPin"
                component={ForgetPin}
                options={{ headerShown: false }}
            /> 
            <Stack.Screen
                name="DealerDocsRetailer"
                component={DealerDocsRetailer}
                options={{ headerShown: false }}
            />
 <Stack.Screen
                name="VideoKYC"
                component={VideoKYC}
                options={{ headerShown: false }}
            />

 <Stack.Screen
                name="EditProfile"
                component={EditProfile}
                options={{ headerShown: false }}
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
        name="PickupSummaryScreen"
        component={PickupSummaryScreen}
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
        name="RadiantLedger"
        component={RadiantLedger}
        options={{ headerShown: false }}
      /> 
     
      <Stack.Screen
        name="cashDepReport"
        component={cashDepReport}
        options={{ headerShown: false }}
      /> 
     
      <Stack.Screen
        name="CashDepositReport"
        component={CashDepositReport}
        options={{ headerShown: false }}
      /> 
     
        </Stack.Navigator>
    )
}
