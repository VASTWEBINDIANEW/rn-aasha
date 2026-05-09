import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  useColorScheme,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import DynamicButton from '../../drawer/button/DynamicButton';
import { useSelector } from 'react-redux';
import { useDeviceInfoHook } from '../../../utils/hooks/useDeviceInfoHook';
import { AepsContext } from './context/AepsContext';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { isDriverFound, openFingerPrintScanner } from 'react-native-rdservice-fingerprintscanner';
import { useNavigation } from '@react-navigation/native';
import { APP_URLS } from '../../../utils/network/urls';
import ShowLoader from '../../../components/ShowLoder';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import SelectDevice from './DeviceSelect';
import { RootState } from '../../../reduxUtils/store';
import { logToFirebase } from '../../../utils/firebaselog';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translate } from '../../../utils/languageUtils/I18n';

const Aepsekycscan = () => {
  // --- AAPKA PURANA LOGIC (UNTOUCHED) ---
  const { activeAepsLine } = useSelector((state: RootState) => state.userInfo);
  const [isLoading, setIsLoading] = useState(false);
  const { aadharNumber, setFingerprintData, Loc_Data, userId } = useContext(AepsContext);
  const { post } = useAxiosHook();
  const navigation = useNavigation<any>();
  const [deviceName, setDeviceName] = useState('');
  const { getMobileDeviceId } = useDeviceInfoHook();
  const { latitude, longitude } = useSelector((state: RootState) => state.userInfo).Loc_Data;

  // Date Formatting Logic
  const now = new Date();
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const formattedDate = `${days[now.getDay()]} ${now.getDate()} ${months[now.getMonth()]} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
const capture = async (rdServicePackage) => {
  setIsLoading(true);
  let pidOptions = '';

  switch (rdServicePackage) {
    case 'com.mantra.mfs110.rdservice':
    case 'com.mantra.rdservice':
      pidOptions = `<PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" pCount="0" pgCount="2" format="0" pidVer="2.0" timeout="10000" wadh="E0jzJ/P8UopUHAieZn8CKqS4WPMi5ZSYXgfnlfkWjrc=" pTimeout="20000" posh="UNKNOWN" env="P"  /> <CustOpts><Param name="mantrakey" value="" /></CustOpts> </PidOptions>`;
      break;
    case 'com.acpl.registersdk_l1':
    case 'com.acpl.registersdk':
      pidOptions = `<PidOptions ver="1.0"> <Opts fCount="1" fType="2" iCount="0" pCount="0" pgCount="2" format="0" pidVer="2.0" wadh="E0jzJ/P8UopUHAieZn8CKqS4WPMi5ZSYXgfnlfkWjrc=" timeout="10000"  otp="" pTimeout="20000" posh="UNKNOWN" env="P" />  <Demo/> <CustOpts><Param name="" value="" /></CustOpts> </PidOptions>`;
      break;
    case 'com.idemia.l1rdservice':
    case 'com.scl.rdservice':
      pidOptions = `<PidOptions ver="1.0"><Opts env="P" fCount="1" fType="2" iCount="0" iType="" pCount="0" pType="" format="0" pidVer="2.0" timeout="20000" wadh="E0jzJ/P8UopUHAieZn8CKqS4WPMi5ZSYXgfnlfkWjrc=" posh="UNKNOWN" /><Demo></Demo><CustOpts><Param name="" value="" /></CustOpts></PidOptions>`;
      break;
  }

  openFingerPrintScanner(rdServicePackage, pidOptions)
    .then(async (res) => {
      // ✅ FIX 1: setIsLoading(true) hata di - upar se already true hai

      console.log("Fingerprint Response:", res);

      if (res.isDeviceDriverFound === false) {
        Alert.alert(res.message);
        setIsLoading(false); // ✅ FIX 2: ye add kiya
        return;
      }

      if (res.errorCode == 720) {
        setFingerprintData(720);
        setIsLoading(false);
      } else if (res.status === -1) {
        setFingerprintData(-1);
        setIsLoading(false);
      } else if (res.status === 1 || res.errorCode == 0) {
        setIsLoading(true);
        OnPressEnq(res.piddataJsonString, res.piddataXML);
      }
    })
    .catch(async (error) => {
      setFingerprintData(720);
      setIsLoading(false);
      Alert.alert('Please check if the device is connected.');
    });
};
const OnPressEnq = async (fingerprintDataString, pidDataXml) => {
    try {

        // ✅ piddataJsonString ke andar PidData hai
        const raw = fingerprintDataString?.piddataJsonString || fingerprintDataString;

        const parsedJson = typeof raw === 'string'
            ? JSON.parse(raw)
            : raw;

        const pidData = parsedJson?.PidData;
        if (!pidData) throw new Error("Invalid PID Data");

        const DevInfo = pidData.DeviceInfo || {};
        const Resp = pidData.Resp || {};

        if (Resp.errCode !== "0") {
            Alert.alert(Resp.errInfo || "Fingerprint capture failed");
            return;
        }

        const params = DevInfo.additional_info?.Param || [];

        const srNo =
            params.find(p => p.name?.toLowerCase() === 'srno')?.value ||
            params.find(p => p.name?.toLowerCase() === 'serialnumber')?.value ||
            params[0]?.value ||
            "";

        const cardnumberORUID = {
            adhaarNumber: '210900202537',
            indicatorforUID: "0",
            nationalBankIdentificationNumber: '51545'
        };

        const captureResponse = {
            Devicesrno: srNo || "",
            PidDatatype: "X",
            Piddata: typeof pidData.Data === "object"
                ? pidData.Data.content
                : pidData.Data || "",
            ci: pidData.Skey?.ci || "",
            dc: DevInfo.dc || "",
            dpID: DevInfo.dpId || "",
            errCode: Resp.errCode ?? "",
            errInfo: Resp.errInfo || "",
            fCount: Resp.fCount || "1",
            fType: Resp.fType || "2",
            hmac: typeof pidData.Hmac === "object"
                ? pidData.Hmac.content
                : pidData.Hmac || "",
            iCount: Resp.iCount || "0",
            iType: "0",
            mc: DevInfo.mc || "",
            mi: DevInfo.mi || "",
            nmPoints: Resp.nmPoints || "0",
            pCount: Resp.pCount || "0",
            pType: Resp.pType || "0",
            qScore: Resp.qScore ?? "0",
            rdsID: DevInfo.rdsId || "",
            rdsVer: DevInfo.rdsVer || "",
            sessionKey: typeof pidData.Skey === "object"
                ? pidData.Skey.content
                : pidData.Skey || ""
        };

        console.log("Mapped Response for Finger Auth:", JSON.stringify(captureResponse, null, 2));

        BEnQ(captureResponse, cardnumberORUID, pidDataXml, false);

    } catch (error) {
        console.error("OnPressEnq Error:", error);
        Alert.alert("Error", "Fingerprint processing failed.");
    } finally {
        // setIsLoading(false);
    }
};

  const BEnQ = useCallback(async (captureResponse1, cardnumberORUID1, pidDataX, piddata) => {
    setIsLoading(true);
    try {
      const Model = await getMobileDeviceId();
      const jdata = {
        capxml: pidDataX, captureResponse: captureResponse1, cardnumberORUID: cardnumberORUID1,
        languageCode: 'en', latitude, longitude, mobileNumber: '', merchantTranId: userId,
        merchantTransactionId: userId, paymentType: 'B', otpnum: '', requestRemarks: 'TN3000CA06532',
        subMerchantId: 'A2zsuvidhaa', timestamp: formattedDate, transactionType: 'M',
        name: '', Address: 'Address', transactionAmount: ''
      };
      const response = await post({
        url: activeAepsLine ? APP_URLS.AepsKycFinScanNifi : APP_URLS.AepsKycFinScan,
        data: jdata,
        config: { headers: { 'trnTimestamp': formattedDate, 'deviceIMEI': Model, "Content-type": "application/json" } },
      });
      setIsLoading(false);
      Alert.alert('Message:', `\n${response.Status === true ? 'Success' : 'Failed'}\n${response.Message}`, [
        { text: 'OK', onPress: () => navigation?.navigate(response.Status === true ? "AepsTabScreen" : "ReportScreen") },
      ]);
    } catch (error) {
      setIsLoading(false);
      console.error('Error during balance enquiry:', error);
    }
  }, [latitude, longitude, userId, formattedDate, navigation]);

  const handleSelection = (selectedOption) => {
    if (deviceName === 'Device' || !deviceName) return Alert.alert("Selection Required", "Please select a device.");
    const captureMapping = {
      'Mantra L0': 'com.mantra.rdservice', 'Mantra L1': 'com.mantra.mfs110.rdservice',
      'Startek L0': 'com.acpl.registersdk', 'Startek L1': 'com.acpl.registersdk_l1',
      'Morpho L0': 'com.scl.rdservice', 'Morpho L1': 'com.idemia.l1rdservice',
    };
    const selectedCapture = captureMapping[selectedOption];
    if (selectedCapture) {
      isDriverFound(selectedCapture).then(() => capture(selectedCapture)).catch(() => Alert.alert('Error', 'RD Service Driver Not Found'));
    }
  };

  const getSavedBenqData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@captured_benq_data');
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) { console.error(e); }
  };

  // --- NEW MODERN UI RENDERING ---
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaView style={[styles.main, { backgroundColor: isDarkMode ? '#121212' : '#F8F9FB' }]}>
      <AppBarSecond title={'E-kyc Verification'} />
      <ScrollView contentContainerStyle={styles.container}>

        {/* Warning/Status Card */}
        <View style={[styles.statusCard, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }]}>
          <View style={styles.iconContainer}>
            <Text style={styles.warningIcon}>⚠️</Text>
          </View>
          <Text style={[styles.title, { color: isDarkMode ? '#FFF' : '#333' }]}>{translate('E-KYC is Not Completed')}</Text>
          <Text style={styles.subtitle}>{translate('Please complete your verification to enable all AEPS features.')}</Text>
        </View>

        {/* Instruction Card */}
        <View style={[styles.instructionCard, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }]}>
          <Text style={[styles.cardTitle, { color: isDarkMode ? '#CCC' : '#666' }]}>{translate('Follow these steps')}:</Text>

          <View style={styles.stepRow}>
            <View style={styles.dot} /><Text style={[styles.stepText, { color: isDarkMode ? '#BBB' : '#444' }]}>{translate('Connect your Biometric Device (Mantra, Morpho, etc.) via OTG.')}</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.dot} /><Text style={[styles.stepText, { color: isDarkMode ? '#BBB' : '#444' }]}>{translate('Select your device model from the dropdown below.')}</Text>
          </View>
          <View style={styles.stepRow}>
            <View style={styles.dot} /><Text style={[styles.stepText, { color: isDarkMode ? '#BBB' : '#444' }]}>{translate('Click Scan Finger and place your finger on the scanner.')}</Text>
          </View>
        </View>

        {/* Device Selection Card */}
        <View style={[styles.selectionCard, { backgroundColor: isDarkMode ? '#1E1E1E' : '#FFFFFF' }]}>
          <SelectDevice
            setDeviceName={setDeviceName}
            device={'Device'}
            isface2={true}
            opPress={() => { setDeviceName(deviceName); }}
          />
        </View>

        <View style={styles.buttonWrapper}>
          <DynamicButton
            title='Scan Finger'
            onPress={async () => {
              await getSavedBenqData();
              handleSelection(deviceName);
            }}
            styleoveride={styles.scanBtn}
          />
        </View>

        {isLoading && <ShowLoader />}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1 },
  container: { padding: wScale(20) },
  statusCard: {
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  iconContainer: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFF5F5',
    justifyContent: 'center', alignItems: 'center', marginBottom: 15
  },
  warningIcon: { fontSize: 30 },
  title: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20 },

  instructionCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 15 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#007AFF', marginTop: 6, marginRight: 12 },
  stepText: { flex: 1, fontSize: 14, lineHeight: 20 },

  selectionCard: {
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 25,
    elevation: 2,
  },
  buttonWrapper: { marginTop: 10 },
  scanBtn: {
    borderRadius: 12,
    height: 55,
    backgroundColor: '#007AFF',
    elevation: 5,
  }
});

export default Aepsekycscan;