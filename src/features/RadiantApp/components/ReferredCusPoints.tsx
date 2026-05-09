import React, { useEffect, useState } from "react";
import { View, ScrollView, TouchableOpacity, ToastAndroid, StyleSheet, Text, SafeAreaView } from "react-native";
import { commonStyles } from "../../../utils/styles/commonStyles";
import AppBarSecond from "../../drawer/headerAppbar/AppBarSecond";
import FlotingInput from "../../drawer/securityPages/FlotingInput";
import useAxiosHook from "../../../utils/network/AxiosClient";
import { APP_URLS } from "../../../utils/network/urls";
import BankListModal from "../../../components/BankListModal";
import OnelineDropdownSvg from "../../drawer/svgimgcomponents/simpledropdown";
import DynamicButton from "../../drawer/button/DynamicButton";
import { useLocationHook } from "../../../hooks/useLocationHook";
import { useSelector } from "react-redux";
import { RootState } from "../../../reduxUtils/store";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import CheckSvg from "../../drawer/svgimgcomponents/CheckSvg";
import LoiListReport from "../CmsReport/LoiListReport";
import MovingDotBorderText from "../../../components/AnimatedBorderView";
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CloseCameraSvg from "../../drawer/svgimgcomponents/CloseCameraSvg";
import { colors } from "../../../utils/styles/theme";
import NextErrowSvg2 from "../../drawer/svgimgcomponents/NextErrowSvg2";
import AddSvg from "../../drawer/svgimgcomponents/AddSvg";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { translate } from "../../../utils/languageUtils/I18n";

const ReferredCusPoints = () => {
  const { post } = useAxiosHook();
  const { Loc_Data, colorConfig } = useSelector((state: RootState) => state.userInfo);

  const [listData, setListData] = useState([]);
  const [dropdownType, setDropdownType] = useState("STATE");
  const [tableShow, setShwowTable] = useState(false)

  const [selectedState, setSelectedState] = useState(0);
  const [selectedDistrict, setSelectedDistrict] = useState(0);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [check, setCheck] = useState(false);
  const [reportData, setReportData] = useState([]);

  const tabColor = `${colorConfig.secondaryColor}33`;
  const tabColor2 = `${colorConfig.secondaryColor}1A`; useEffect(() => {
    const fetchReportData = async () => {
      try {
        const res = await post({ url: APP_URLS.LoiListReport });
        if (res) {
          setReportData(res);
        } else {
          console.error('No report data available');
        }
      } catch (error) {
        console.error('Error fetching report data:', error);
      }
    };

    fetchReportData();
  }, []); // Only fetch data once when the component mounts

  console.log(Loc_Data, '909090');

  const [form, setForm] = useState({
    state: "",
    district: "",
    city: "",
    client: "",
    pinCode: "",
    dcCode: "",
    pickupOption: "",
    depositMode: "",
    pointAddress: "",
    cashLimit: "",
    contactName: "",
    contactNumber: "",
    additionalRequirement: "",
    subDescription: "",
  });

  const onChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const fetchData = async (type, stateId) => {
    try {
      let url = "";
      if (type === "STATE") {
        url = `${APP_URLS.Stateinfo}`;
      } else if (type === "DISTRICT") {
        url = `${APP_URLS.Districtinfo}?Stateid=${stateId}`;
      } else if (type === "CLIENT") {
        url = `${APP_URLS.Clientinfo}`;
      } else if (type === "PICKUP") {
        url = `${APP_URLS.Pickupoption}`;
      } else if (type === "DEPOSIT") {
        url = `${APP_URLS.DepositMode}`;
      }

      const response = await post({ url });

      if (type === "PICKUP" || type === "DEPOSIT") {
        // Wrap plain strings into objects
        const options = (response?.Content?.ADDINFO || []).map((opt, idx) => ({
          id: idx,
          name: opt,
        }));
        setListData(options);
      } else {
        setListData(response?.Content?.ADDINFO || []);
      }
    } catch (e) {
      console.error("API error", e);
    }
  };
const [loading, setLoading] = useState(false);
const handleSubmit = async () => {
    // 1. Prevent multiple clicks if already loading
    if (loading) return;

    try {
      // 2. Perform local validations before starting the loader
      if (form.pinCode && form.pinCode.length !== 6) {
        ToastAndroid.show("Pin Code must be 6 digits.", ToastAndroid.LONG);
        return;
      }
      if (!selectedClient) {
        ToastAndroid.show("Please select a Client.", ToastAndroid.LONG);
        return;
      }
      if (!form.contactName) {
        ToastAndroid.show("Contact Name is required.", ToastAndroid.LONG);
        return;
      }
      if (!form.contactNumber) {
        ToastAndroid.show("Contact Number is required.", ToastAndroid.LONG);
        return;
      }
      if (!form.pointAddress) {
        ToastAndroid.show("Point Address is required.", ToastAndroid.LONG);
        return;
      }
      if (form.dcCode && !/^[a-zA-Z0-9]*$/.test(form.dcCode)) {
        ToastAndroid.show("DC Code must be alphanumeric.", ToastAndroid.LONG);
        return;
      }
      if (form.cashLimit && isNaN(form.cashLimit)) {
        ToastAndroid.show("Cash Limit must be a number.", ToastAndroid.LONG);
        return;
      }

      // 3. Start Loading
      setLoading(true);

      const payload = {
        CustomerName: form.contactName,
        PickupAddress: form.pointAddress,
        Pincode: Number(form.pinCode) || 0,
        WorkMode: form.pickupOption || "Day Pickup - Holidays / Weekend",
        CashLimit: Number(form.cashLimit) || 0,
        DepositionMode: form.depositMode || "Burial",
        AdditionalRequirement: form.additionalRequirement || "Vhbc",
        StateId: selectedState.State_id || 0,
        DistrictId: selectedDistrict.Dist_id || 0,
        CityName: form.city || "Ffhh",
        ClientName: selectedClient?.ClientName || 0,
        PointMobile: form.contactNumber,
        PointName: form.contactName,
        DCCode: form.dcCode || "0",
        SubDescription: form.subDescription || "Cgg",
        Status: "Pending",
        Latitude: Loc_Data?.latitude ?? 0,
        Longitude: Loc_Data?.longitude ?? 0,
      };

      console.log("Submitting Payload:", payload);

      const response = await post({
        url: APP_URLS.InsertLOIList,
        data: payload,
      });

      console.log("Submit Response:", response);

      if (response?.sts === true) {
                setShwowTable(true);

        ToastAndroid.show("Data submitted successfully.", ToastAndroid.LONG);
      } else {
        ToastAndroid.show(response?.Message || "Submission failed.", ToastAndroid.LONG);
      }
    } catch (error) {
      console.error("Submit error:", error);
      ToastAndroid.show("Something went wrong. Please try again.", ToastAndroid.LONG);
    } finally {
      // 4. Stop Loading (runs whether the try succeeded OR failed)
      setLoading(false);
    }
  };

return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['right', 'left']}>
      <View style={commonStyles.screenContainer}>
        {/* Header Section */}
        <AppBarSecond title={tableShow ? "Add/Submit Referral DATA" : 'Referral Customer Report'} />

        {/* KeyboardAwareScrollView handles the keyboard overlap automatically */}
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraScrollHeight={200} // Keyboard aur active input ke beech ka gap
          enableAutomaticScroll={true}
        >
          <View style={commonStyles.contentContainer}>
            
            {/* 1. Toggle Card (Agar reportData hai toh dikhao) */}
            {!tableShow && reportData.length > 0 && (
              <View>
                <TouchableOpacity
                  style={[styles.card, { borderColor: tabColor }]}
                  activeOpacity={0.7}
                  onPress={() => { setShwowTable(!tableShow) }}
                >
                  <View style={[styles.svgimg, { backgroundColor: tabColor2 }]}>
                    <AddSvg />
                  </View>
                  <View style={styles.inveiw}>
                    <Text style={styles.cardText}>{translate("addsubmitReferralData")}</Text>
                    <Text style={styles.description}>

                      {translate("ifYouWantToAdd")}
                    </Text>
                  </View>
                  <View>
                    <NextErrowSvg2 color="#000" />
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* 2. Main Logic: Table dikhana hai ya Form? */}
            {!tableShow && reportData.length > 0 ? (
              <View>
                <LoiListReport />
              </View>
            ) : (
              <>
                {/* Form Inputs Section */}
                <TouchableOpacity
                  onPress={() => {
                    setDropdownType("CLIENT");
                    fetchData("CLIENT");
                    setIsOpen(true);
                  }}
                >
                  <FlotingInput
                    label="Client"
                    value={selectedClient?.ClientName || ""}
                    editable={false}
                  />
                  <View style={commonStyles.righticon2}>
                    <OnelineDropdownSvg />
                  </View>
                </TouchableOpacity>

                <FlotingInput 
                  label="Pin Code"
                  keyboardType="numeric" 
                  value={form.pinCode} 
                  onChangeTextCallback={t => onChange("pinCode", t)} 
                  maxLength={6} 
                />

                <FlotingInput 
                  label="DC Code" 
                  value={form.dcCode} 
                  onChangeTextCallback={t => onChange("dcCode", t)} 
                />

                <FlotingInput 
                  label="Point Address" 
                  multiline 
                  value={form.pointAddress} 
                  onChangeTextCallback={t => onChange("pointAddress", t)} 
                />

                <FlotingInput 
                  label="Cash Limit" 
                  keyboardType="numeric" 
                  value={form.cashLimit} 
                  onChangeTextCallback={t => onChange("cashLimit", t)} 
                />

                <FlotingInput 
                  label="Point Contact Name" 
                  value={form.contactName} 
                  onChangeTextCallback={t => onChange("contactName", t)} 
                />

                <FlotingInput 
                  label="Point Mobile Number"
                  maxLength={10}
                  keyboardType="numeric" 
                  value={form.contactNumber} 
                  onChangeTextCallback={t => onChange("contactNumber", t)} 
                />

                {/* Submit Button */}
                <DynamicButton title="Submit" onPress={handleSubmit} />
              </>
            )}
          </View>
        </KeyboardAwareScrollView>

        {/* 3. Dropdown Modal */}
        <BankListModal
          key={dropdownType}
          visible={isOpen}
          onClose={() => setIsOpen(false)}
          data={listData}
          labelKey={
            dropdownType === "STATE" ? "State_name" :
            dropdownType === "DISTRICT" ? "Dist_Desc" :
            dropdownType === "CLIENT" ? "ClientName" : "name"
          }
          idKey={
            dropdownType === "STATE" ? "State_id" :
            dropdownType === "DISTRICT" ? "Dist_id" :
            dropdownType === "CLIENT" ? null : "id"
          }
          title={
            dropdownType === "STATE" ? "Select State" :
            dropdownType === "DISTRICT" ? "Select District" :
            dropdownType === "CLIENT" ? "Select Client" :
            dropdownType === "PICKUP" ? "Select Pickup Option" : "Select Deposit Mode"
          }
          onSelect={(item) => {
            if (dropdownType === "STATE") {
              setSelectedState(item);
              setSelectedDistrict(null);
              onChange("state", item.State_name);
            } else if (dropdownType === "DISTRICT") {
              setSelectedDistrict(item);
              onChange("district", item.Dist_Desc);
            } else if (dropdownType === "CLIENT") {
              setSelectedClient(item);
              onChange("client", item.ClientName);
            } else if (dropdownType === "PICKUP") {
              onChange("pickupOption", item.name);
            } else if (dropdownType === "DEPOSIT") {
              onChange("depositMode", item.name);
            }
            setIsOpen(false);
          }}
        />
      </View>
    </SafeAreaView>
  );
};
export default ReferredCusPoints;
const styles = StyleSheet.create({
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hScale(10),
  },
  check: {
    height: hScale(15),
    width: hScale(15),
    borderWidth: .5,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: wScale(10)
  },
  checkText: {
    fontSize: wScale(14),
    flex: 1,
    color: '#000',
  },
  animetedBtn: { flex: 1, justifyContent: 'center', flexDirection: 'row', alignItems: 'center' },
  viewText: { fontSize: wScale(18), fontWeight: 'bold', color: '#000', width: '80%', textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    paddingVertical: hScale(10),
    paddingLeft: wScale(10),
    marginBottom: hScale(12),
    shadowColor: '#000',
    flexDirection: 'row',
    borderRadius: 5,
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    borderColor: colors.black_primary_blur,
    borderWidth: hScale(0.5),
  },
  svgimg: {
    borderRadius: 10,
    paddingHorizontal: wScale(10),
    paddingVertical: hScale(5),
  },
  cardText: {
    color: '#000',
    fontSize: wScale(16),
    fontWeight: 'bold',
    width: '120%',
    textTransform: 'capitalize',
  },
  inveiw: {
    flex: 1,
    paddingLeft: wScale(5),
    flexWrap: 'nowrap',
  },
  description: {
    color: '#000',
    fontSize: wScale(11),
    textAlign: 'justify',
    marginTop: hScale(3),
  },
  labelStyle: {
    color: '#000',
    fontSize: wScale(14),
    fontWeight: '500',
    width: '100%',

  },

})