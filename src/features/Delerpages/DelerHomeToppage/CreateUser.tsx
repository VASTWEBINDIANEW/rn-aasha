import { translate } from "../../../utils/languageUtils/I18n";
import React, { useCallback, useState } from 'react';
import {
    View, Alert, StyleSheet, ScrollView, TouchableOpacity, Text,
    TextInput,
    ActivityIndicator,
    Keyboard
} from 'react-native';
import DynamicButton from '../../drawer/button/DynamicButton';
import FlotingInput from '../../drawer/securityPages/FlotingInput';
import OnelineDropdownSvg from '../../drawer/svgimgcomponents/simpledropdown';
import { hScale, SCREEN_HEIGHT, SCREEN_WIDTH, wScale } from '../../../utils/styles/dimensions';
import BankBottomSite from '../../../components/BankBottomSite';
import { FlashList } from '@shopify/flash-list';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { stateData } from '../../../utils/stateData';
import { BottomSheet } from '@rneui/base';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { colors } from '../../../utils/styles/theme';
import ClosseModalSvg2 from '../../drawer/svgimgcomponents/ClosseModal2';
import { ToastAndroid } from 'react-native';
import ShowLoader from '../../../components/ShowLoder';
// import QRCodeScanner from 'react-native-qrcode-scanner';
import QrcodAddmoneysvg from '../../drawer/svgimgcomponents/QrcodAddmoneysvg';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const CreateUser = () => {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);
    const color1 = `${colorConfig.primaryColor}20`;
    const [isLoading, setIsLoading] = useState(false);
    const [name, setName] = useState('');
    const [firm, setFirm] = useState('');
    const [mobile, setMobile] = useState('');
    const [email, setEmail] = useState('');
    const [pan, setPan] = useState('');
    const [aadhar, setAadhar] = useState('');
    const [gst, setGst] = useState('');
    const [state, setState] = useState('');
    const [district, setDistrict] = useState('');
    const [pincode, setPincode] = useState('');
    const [address, setAddress] = useState('');
    const [isBankVisible, setIsBankVisible] = useState(false);
    const [districtData, setDistrictData] = useState([]);
    const [selectbool, setSelectbool] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { get, post } = useAxiosHook();
    const [isSubmit, setIsSubmit] = useState(false)
    const [isValid, setIsValid] = useState(false);
    const [isValid1, setIsValid1] = useState(false);
    const validateForm = () => {
        if (!name) {
            ToastAndroid.show('Enter User Name', ToastAndroid.SHORT);
            return false;
        }
        if (!firm) {
            ToastAndroid.show('Enter Firm Name', ToastAndroid.SHORT);
            return false;
        }
        if (mobile.length < 10) {
            ToastAndroid.show('Enter Valid Mobile Number', ToastAndroid.SHORT);
            return false;
        }
        if (pincode.length < 6) {
            ToastAndroid.show('Enter Valid Pincode Number', ToastAndroid.SHORT);
            return false;
        }
        if (!address) {
            ToastAndroid.show('Enter Your Address', ToastAndroid.SHORT);
            return false;
        }
        if (!stateid) {
            ToastAndroid.show('Select a State', ToastAndroid.SHORT);
            return false;
        }
        if (!distid) {
            ToastAndroid.show('Select a District', ToastAndroid.SHORT);
            return false;
        }
        // if (!isValid) {
        //     ToastAndroid.show('Enter Valid Aadhar No', ToastAndroid.SHORT);
        //     return false;
        // } if (!isValid) {
        //     ToastAndroid.show('Enter Valid PAN No', ToastAndroid.SHORT);
        //     return false;
        // }
        return true;
    }
     const filteredData = (stateData).filter(item =>
        item.stateName.toLowerCase().includes(searchQuery.toLowerCase())
      );
const [stateid,setStateId]= useState('');
const [distid,setdistId]= useState('');
    const handleSubmit = async () => {

        if (!validateForm()) return;
        setIsSubmit(true)
        setIsLoading(true);
        const userData = {
            "Name": name,
            "firmName": firm,
            "Mobile": mobile,
            "Email": email,
            "PAN": pan,
            "Aadhar": aadhar,
            "GST": gst,
            "District": distid,
            "State": stateid,
            "PINCode": pincode,
            "PIN": "1234",
            "Password": '123456',
            "Address": address,
        };

        console.log(userData)
const data = JSON.stringify(userData)
        try {
            const response = await post({ url: APP_URLS.createUser, data:userData });

            if (response) {
                Alert.alert(response.status, response.Message);

            } else {
                Alert.alert(response.status || '', response.Message || 'Failed to create user');

            }
            console.log(response)
        } catch (error) {
            Alert.alert('Error', 'Failed to create user');
        } finally {
            setIsSubmit(false)
            setIsLoading(false);
        }
    };

    const getDistricts = useCallback(
        async (stateId) => {
            const response = await get({ url: `${APP_URLS.getDistricts}${stateId}` });
            setDistrictData(response);

            console.log(response)
        },
        [get],
    );

    const handleStateSelect = (selectedState) => {
console.log(selectedState)
        if (selectbool) {
            setState(selectedState.stateName);
            setStateId(selectedState.stateId)
            getDistricts(selectedState.stateId);
            setSelectbool(false)
        } else {
            setdistId(selectedState['Dist Id'])
            setDistrict(selectedState['Dist Name'])

            setIsBankVisible(false);
            setSelectbool(true)


        }
    };
    const onSuccess = async (e) => {
        console.log(e);
        setisScan2(false);
        const data = e.data;

        const obj = {};
        const regex = /([a-zA-Z0-9]+)="([^"]+)"/g;
        let match;

        while ((match = regex.exec(data)) !== null) {
            obj[match[1]] = match[2];
        }
        
        setAadhar(obj.uid)
        setName(obj.name)
        setState(obj.state)
        setDistrict(obj.dist)
        setPincode(obj.pc)
        setDistrict(obj.dist)

        console.log(obj)
        setAddress(obj.po + ',' + obj.loc + ',' + obj.vtc + ',' + obj.subdist + ',' + obj.dist + ',' + obj.state)
        console.log(obj.lm + ',' + obj.po + ',' + obj.loc + ',' + obj.vtc + ',' + obj.subdist + ',' + obj.dist + ',' + obj.state)
      const stateid =  getStateId(obj.state)
       setStateId(stateid)
       const Distid = getDistrictId(obj.dist);
       setdistId(Distid)
        // {"dist": "Ahmadnagar", 
        //     "encoding": "UTF-8", 
        //     "gender": "M", "lm": 
        //     "Khokar Pool", "loc": 
        //     "Karegaon", "name": "Vishal Hari Vanjari",
        //      "pc": "413717", "po": "Karegaon Factory",
        //       "state": "Maharashtra", "subdist": "Shrirampur",
        //      "uid": "210900202537", "version": "1.0", "vtc": "Karegaon", "yob": "2000"}
        // Linking.openURL(e.data).catch((err) => console.error('An error occurred', err));
    };
    function getStateId(stateName) {
        const state = stateData.find(state => state.stateName.toLowerCase() === stateName.toLowerCase());
        return state ? state.stateId : null;
      }
      function getDistrictId(distName) {
        const district = districtData.find(district => district["Dist Name"].toLowerCase() === distName.toLowerCase());
        return district ? district["Dist Id"] : null;
      }
    const [isScan2, setisScan2] = useState(false)
    if (isScan2) {
        return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ alignItems: 'center', position: 'absolute', top: 30, right: 20 }}>
                <TouchableOpacity
                    onPress={() => setisScan2(false)}
                    style={{
                        backgroundColor: '#ff4d4d',
                        padding: 10,
                        borderRadius: 10,
                        width: hScale(40),
                        height: hScale(40),
                        alignItems: 'center',
                    }}
                >
                    <Text style={{ color: 'white', fontSize: 20 }}>{translate("X")}</Text>
                </TouchableOpacity>
            </View>

            {/* QR Code Scanner */}
            {/* <QRCodeScanner vibrate={false} onRead={onSuccess} /> */}
        </View>
    }
    async function adhar_Validation(adharnumber) {
        try {
            const response = await get({ url: `${APP_URLS.aadharValidation}${adharnumber}` })
            console.log(response);
            if (response['status'] === true) {
                setIsValid(true);
            } else {
                setIsValid(false);
                ToastAndroid.showWithGravity(
                    `Please Enter Valid Aadhar number`,
                    ToastAndroid.SHORT,
                    ToastAndroid.BOTTOM,
                );

            }

        } catch (error) {

        }

    }
    async function PancardCardValidationCheck(pannumber) {
        try {
            const response = await get({ url: `${APP_URLS.PancardCardValidationCheck}${pannumber}` })
            console.log(response);
            if (response['status'] === true) {
                setIsValid1(true);
                Keyboard.dismiss()

            } else {

                setIsValid1(false);
                ToastAndroid.showWithGravity(
                    `Please Enter Valid PAN number`,
                    ToastAndroid.SHORT,
                    ToastAndroid.BOTTOM,
                );

            }

        } catch (error) {

        }

    }
  return (
  <View style={{ flex: 1, backgroundColor: 'white' }}>
    {/* AppBar को यहाँ रख सकते हैं अगर वो स्क्रीन का हिस्सा है */}
    {/* <AppBar title="Create User" /> */}

    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 30 }}
      enableOnAndroid={true}
      keyboardShouldPersistTaps="handled"
      extraScrollHeight={140} // कीबोर्ड से इनपुट को ऊपर रखने के लिए
      enableAutomaticScroll={true}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.container}>
        {/* Aadhar Input Section */}
        <View style={{ position: 'relative' }}>
          <FlotingInput
            label="Enter Aadhar Number"
            value={aadhar}
            maxLength={12}
            keyboardType="number-pad"
            onChangeTextCallback={(text) => {
              setAadhar(text);
              if (text.length === 12) {
                adhar_Validation(text);
              } else {
                setIsValid(false);
              }
            }}
          />
          <View style={styles.righticon2}>
            <TouchableOpacity onPress={() => setisScan2(true)}>
              <QrcodAddmoneysvg />
            </TouchableOpacity>
          </View>
        </View>

        {/* User Details */}
        <FlotingInput
          label={'User Name'}
          value={name}
          onChangeTextCallback={setName}
        />
        <FlotingInput
          label={'Firm Name'}
          value={firm}
          onChangeTextCallback={setFirm}
        />
        <FlotingInput
          label={'Mobile No'}
          value={mobile}
          keyboardType="number-pad"
          maxLength={10}
          onChangeTextCallback={setMobile}
        />
        <FlotingInput
          label={'Email'}
          value={email}
          onChangeTextCallback={setEmail}
        />

        {/* PAN & GST Section */}
        <FlotingInput
          label={'Pancard'}
          value={pan}
          onChangeTextCallback={(text) => {
            setPan(text);
            if (text.length === 10) {
              PancardCardValidationCheck(text);
            } else {
              setIsValid(false);
            }
          }}
        />
        <FlotingInput
          label={'Gst Number'}
          value={gst}
          onChangeTextCallback={setGst}
        />

        {/* State Selection Dropdown */}
        <TouchableOpacity onPress={() => setIsBankVisible(true)} activeOpacity={0.8}>
          <View pointerEvents="none">
            <FlotingInput
              editable={false}
              label={'Select State'}
              value={state}
            />
          </View>
          <View style={styles.righticon}>
            <OnelineDropdownSvg />
          </View>
        </TouchableOpacity>

        {/* District Selection Dropdown */}
        <TouchableOpacity onPress={() => { /* District selection logic */ }} activeOpacity={0.8}>
          <View pointerEvents="none">
            <FlotingInput
              editable={false}
              label={'Select District'}
              value={district}
            />
          </View>
          <View style={styles.righticon}>
            <OnelineDropdownSvg />
          </View>
        </TouchableOpacity>

        {/* Pincode & Address Section */}
        <FlotingInput
          label={'Pin Code'}
          value={pincode}
          keyboardType="number-pad"
          maxLength={6}
          onChangeTextCallback={setPincode}
        />
        <FlotingInput
          style={styles.input}
          label={'Address'}
          value={address}
          onChangeTextCallback={setAddress}
        />

        {/* Create User Button */}
        <View style={{ marginTop: 20 }}>
          <DynamicButton
            title={isSubmit ? <ActivityIndicator size={'large'} color={colorConfig.labelColor} /> : 'Create User'}
            onPress={handleSubmit}
            disabled={isLoading || isSubmit}
          />
        </View>
      </View>
    </KeyboardAwareScrollView>

    {/* BottomSheet: इसे ScrollView के बाहर रखा गया है ताकि Layering सही रहे */}
    <BottomSheet
      animationType="none"
      isVisible={isBankVisible}
      onBackdropPress={() => setIsBankVisible(false)}
      containerStyle={styles.bottomSheetContainer}
    >
      <View style={styles.bottomsheetview}>
        <View style={[styles.StateTitle, { backgroundColor: color1 || '#f5f5f5' }]}>
          <View style={styles.titleview}>
            <Text style={selectbool ? styles.stateTitletext : styles.stateTitletext2}>
              {selectbool ? "Select Your State" : "Select Your District"}
            </Text>
          </View>
          {selectbool && (
            <TouchableOpacity onPress={() => setIsBankVisible(false)} activeOpacity={0.7}>
              <ClosseModalSvg2 />
            </TouchableOpacity>
          )}
        </View>

        <TextInput
          placeholder="Search..."
          value={searchQuery}
          onChangeText={text => setSearchQuery(text)}
          style={styles.searchBar}
          placeholderTextColor={colors.black75}
          cursorColor={'black'}
        />

        {/* FlashList के लिए एक Container */}
        <View style={{ height: 400 }}> 
          <FlashList
            data={selectbool ? filteredData : districtData}
            estimatedItemSize={50}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.itemContainer} 
                onPress={() => handleStateSelect(item)}
              >
                <Text style={styles.stateItem}>
                  {selectbool ? item.stateName : item['Dist Name']}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </BottomSheet>
  </View>
);
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    input: {
        height: 50,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 10,
        paddingLeft: 10,
        borderRadius: 5,
    },
    righticon: {
        position: 'absolute',
        right: wScale(12),
        top: 0,
        height: '75%',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: wScale(12),
    },
    bottomSheetContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)', // Slightly transparent background
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },

    bottomSheetContent: {
        height: SCREEN_HEIGHT * 0.7,
        backgroundColor: '#f9f9f9',

    },

    itemContainer: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    stateItem: {
        fontSize: wScale(22),
        color: "#000",
        fontWeight: "bold",
        textTransform: "uppercase",
    },

    bottomsheetview: {
        backgroundColor: "#fff",
        height: SCREEN_HEIGHT / 1.3,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
    },
    StateTitle: {
        paddingVertical: hScale(10),
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        justifyContent: "space-between",
        alignItems: "center",
        flexDirection: "row",
        paddingHorizontal: wScale(10),
        marginBottom: hScale(10),
    },
    stateTitletext: {
        fontSize: wScale(22),
        color: "#000",
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    stateTitletext2: {
        fontSize: wScale(17),
        color: "#000",
        fontWeight: "bold",
        textTransform: "uppercase",
    },
    titleview: {
        flex: 1,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
    },
    rightimg: {
        height: wScale(45),
        width: wScale(45),
    },
    operatorview: {
        flexDirection: "row-reverse",
        alignItems: "center",
        paddingHorizontal: wScale(10),
    },
    operatornametext: {
        textTransform: "capitalize",
        fontSize: wScale(20),
        color: "#000",
        flex: 1,
        borderBottomColor: "#000",
        borderBottomWidth: wScale(0.5),
        alignSelf: "center",
        paddingVertical: hScale(30),
    },
    operatioimg: {
        width: wScale(45),
        height: wScale(45),
        marginRight: wScale(20),
    },
    searchBar: {
        borderColor: 'gray',
        borderWidth: wScale(1),
        paddingHorizontal: wScale(15),
        marginHorizontal: wScale(10),
        marginBottom: hScale(10),
        borderRadius: 5,
        color: colors.black75,
        fontSize: wScale(16),
    },
    righticon2: {
        position: "absolute",
        left: "auto",
        right: wScale(0),
        top: hScale(0),
        height: "85%",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingRight: wScale(12),
        width: wScale(44),
        marginRight: wScale(-2),
    },
});

export default CreateUser;
