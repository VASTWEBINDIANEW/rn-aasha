/* eslint-disable react/no-unstable-nested-components */
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, FlatList, Modal,Image, Button, PermissionsAndroid, Platform } from 'react-native';
import { hScale } from '../../utils/styles/dimensions';
import { translate } from '../../utils/languageUtils/I18n';
import ImagePicker from 'react-native-image-picker';
import ImageUpload from './pickimages';

const RadiantForm = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [alternatePhoneNumber, setAlternatePhoneNumber] = useState('');
  const [dob, setDob] = useState(new Date());
  const [isdate ,setIsdate] =useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false); 
  const tabs = [translate('Personal Information'), translate('Address'), translate('Bank'), 'Shop Info', 'Company Info', 'Document Info', 'Tab 7'];

  const handleTabChange = (index) => {
    setActiveTab(index);
  };
const PersonalData =()=>{
    return ( 
<View style={{flexDirection:'column'}}> 

<TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          placeholder={translate("First Name")}
        />
        <TextInput
        editable={firstName !== ''}
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          placeholder={translate("Last Name")}
        />
        <View style={styles.genderContainer}>
          <Text style={styles.genderLabel}>Gender:</Text>
          <TouchableOpacity style={[styles.genderButton, { backgroundColor: gender == 'Male' ?'#e1e1e1' :'white' ,}]} onPress={() => handleGenderChange('Male')}>
            <Text>{translate("Male")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.genderButton, { backgroundColor: gender == 'Female' ?'#e1e1e1' :'white'}]} onPress={() => handleGenderChange('Female')}>
            <Text>{translate("Female")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.genderButton, { backgroundColor: gender == 'Other' ?'#e1e1e1' :'white'}]} onPress={() => handleGenderChange('Other')}>
            <Text>{translate("Other")}</Text>
          </TouchableOpacity>
        </View>
       
        <TouchableOpacity onPress={() => {{
                setIsdate(true);
            setShowDatePicker(true)}}}>
          <TextInput
            placeholder='Date Of Birth'
            style={styles.input}
            value= {isdate ?dob.toDateString():'Date Of Birth'}
            editable={false}
          />
        </TouchableOpacity>
        {/* {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={dob}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={handleDateChange}
          />
        )}            */}
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder={translate("Email")}
        />
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          placeholder={translate("Mobile Number")}
        />
        <TextInput
          style={styles.input}
          value={alternatePhoneNumber}
          onChangeText={setAlternatePhoneNumber}
          placeholder={translate("Alternate Phone Number")}
        />
</View>
        
    );
}
const [address, setAddress] = useState('');
const [pincode, setPincode] = useState('');
const [landmark, setLandmark] = useState('');
const [district, setDistrict] = useState('');
const [state, setState] = useState('');
const [showStateDialog, setShowStateDialog] = useState(false);
const states = ["State 1", "State 2", "State 3"];

const handleStateSelection = (selectedState) => {
  setState(selectedState);
  setShowStateDialog(false);
};

const AddressSec = ()=>{

return (
  <ScrollView>
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Address"
      />
      <TextInput
        style={styles.input}
        value={pincode}
        onChangeText={setPincode}
        placeholder="Pincode"
        maxLength={6}
        keyboardType="number-pad"
      />
      <TextInput
        style={styles.input}
        value={landmark}
        onChangeText={setLandmark}
        placeholder="Landmark"
      />
      <TextInput
        style={styles.input}
        value={district}
        onChangeText={setDistrict}
        placeholder="District"
      />
      <TouchableOpacity
        style={styles.input}
        onPress={() => setShowStateDialog(true)}
      >
        <Text>{state ? state : 'Select State'}</Text>
      </TouchableOpacity>
    
    </View>
  </ScrollView>)}

const [accountNumber, setAccountNumber] = useState('');
const [bankName, setBankName] = useState('');
const [branch, setBranch] = useState('');
const [ifsc, setIfsc] = useState('');
const [bankPincode, setBankPincode] = useState('');


const BankSecc = () =>{
    return (
        <View style={styles.container}>
          <TextInput
            style={styles.input}
            value={accountNumber}
            onChangeText={setAccountNumber}
            placeholder="Account Number"
            placeholderTextColor="grey"
          />
          <TextInput
            style={styles.input}
            value={bankName}
            onChangeText={setBankName}
            placeholder="Bank Name"
            placeholderTextColor="grey"
          />
          <TextInput
            style={styles.input}
            value={branch}
            onChangeText={setBranch}
            placeholder="Branch"
            placeholderTextColor="grey"
          />
          <TextInput
            style={styles.input}
            value={ifsc}
            onChangeText={setIfsc}
            placeholder="IFSC (Indian Financial System Code)"
            placeholderTextColor="grey"
          />
          <TextInput
            style={styles.input}
            value={bankPincode}
            onChangeText={setBankPincode}
            placeholder="Bank Pincode"
            placeholderTextColor="grey"
          />
        </View>
      );
    };
            const [shopName, setShopName] = useState('');
        const [shopAddress, setShopAddress] = useState('');
        const [stateModalVisible, setStateModalVisible] = useState(false);
        const [selectedState, setSelectedState] = useState('');
        const [shopCity, setShopCity] = useState('');
        const [districtModalVisible, setDistrictModalVisible] = useState(false);
        const [selectedDistrict, setSelectedDistrict] = useState('');
        const [shopDistrict, setShopDistrict] = useState('');
        const [shopArea, setShopArea] = useState('');
        const [shopPincode, setShopPincode] = useState('');
        const [mcc, setMcc] = useState('');
        const [business, setBusiness] = useState('');
      
        const districts = ['District 1', 'District 2', 'District 3'];
    const ShopSec = () => {

        const handleStateSelect = (state) => {
          setSelectedState(state);
          setStateModalVisible(false);
        };
      
        const handleDistrictSelect = (district) => {
          setSelectedDistrict(district);
          setDistrictModalVisible(false);
        };
      
        return (
          <View style={styles.container}>
            <TextInput
              style={styles.input}
              value={shopName}
              onChangeText={setShopName}
              placeholder="Shop Name"
              placeholderTextColor="grey"
            />
            <TextInput
              style={styles.input}
              value={shopAddress}
              onChangeText={setShopAddress}
              placeholder="Shop Address"
              placeholderTextColor="grey"
            />
            <TouchableOpacity
              style={styles.input}
              onPress={() => setStateModalVisible(true)}
            >
              <Text>{selectedState || 'Select State'}</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={shopCity}
              onChangeText={setShopCity}
              placeholder="Shop City"
              placeholderTextColor="grey"
            />
            <TouchableOpacity
              style={styles.input}
              onPress={() => setDistrictModalVisible(true)}
            >
              <Text>{selectedDistrict || 'Select District'}</Text>
            </TouchableOpacity>
            <TextInput
              style={styles.input}
              value={shopArea}
              onChangeText={setShopArea}
              placeholder="Shop Area"
              placeholderTextColor="grey"
            />
            <TextInput
              style={styles.input}
              value={shopPincode}
              onChangeText={setShopPincode}
              placeholder="Shop Pincode"
              placeholderTextColor="grey"
            />
            <TextInput
              style={styles.input}
              value={mcc}
              onChangeText={setMcc}
              placeholder="MCC (Merchant Category Code)"
              placeholderTextColor="grey"
            />
            <TextInput
              style={styles.input}
              value={business}
              onChangeText={setBusiness}
              placeholder="Business"
              placeholderTextColor="grey"
            />
      
            {/* State Modal */}
            <Modal
              visible={stateModalVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setStateModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <FlatList
                  data={states}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => handleStateSelect(item)}
                    >
                      <Text>{item}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
              </View>
            </Modal>
      
            {/* District Modal */}
            <Modal
              visible={districtModalVisible}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setDistrictModalVisible(false)}
            >
              <View style={styles.modalContainer}>
                <FlatList
                  data={districts}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => handleDistrictSelect(item)}
                    >
                      <Text>{item}</Text>
                    </TouchableOpacity>
                  )}
                  keyExtractor={(item, index) => index.toString()}
                />
              </View>
            </Modal>
          </View>
        );
      };


  const [companyName, setCompanyName] = useState('');
        const [distributorCode, setDistributorCode] = useState('');
      
      const CompanyInf = () => {
  

        return (
          <View style={styles.container}>
            <TextInput
              style={styles.input}
              value={companyName}
              onChangeText={setCompanyName}
              placeholder="Company Name (Optional)"
              placeholderTextColor="grey"
            />
            <TextInput
              style={styles.input}
              value={distributorCode}
              onChangeText={setDistributorCode}
              placeholder="Distributor Code"
              placeholderTextColor="grey"
            />
          </View>
        );
      };
        const [aadharValue, setAadharValue] = useState('');
        const [panValue, setPanValue] = useState('');
        const [tanValue, setTanValue] = useState('');
        const [gstValue, setGstValue] = useState('');
      const DocumentInfo = () => {

      
        return (
          <View style={styles.container}>
            <TextInput
              style={styles.input}
              value={aadharValue}
              onChangeText={setAadharValue}
              placeholder="Aadhaar Number"
              placeholderTextColor="#A9A9A9"
            />
            <TextInput
              style={styles.input}
              value={panValue}
              onChangeText={setPanValue}
              placeholder="PAN Number"
              placeholderTextColor="#A9A9A9"
            />
            <TextInput
              style={styles.input}
              value={tanValue}
              onChangeText={setTanValue}
              placeholder="TAN Number (Optional)"
              placeholderTextColor="#A9A9A9"
            />
            <TextInput
              style={styles.input}
              value={gstValue}
              onChangeText={setGstValue}
              placeholder="GST (Optional)"
              placeholderTextColor="#A9A9A9"
            />
          </View>
        );
      };
      
     const [image, setImage] = useState(null);
      
        const options = {
          title: 'Select Image',
          storageOptions: {
            skipBackup: true,
            path: 'images',
          },
        };
        // const pickImage = () => {
        //     ImagePicker.showImagePicker(options, (response) => {
        //       if (response.didCancel) {
        //         console.log('User cancelled image picker');
        //       } else if (response.error) {
        //         console.log('ImagePicker Error: ', response.error);
        //       } else {
        //         const source = { uri: response.uri };
        //         setImage(source);
        //       }
        //     });
        //   };
          useEffect(() => {
              requestPermission();
            }, []);
          
            const requestPermission = async () => {
              if (Platform.OS === 'android') {
                try {
                  const granted = await PermissionsAndroid.requestMultiple([
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                  ]);
                  if (
                    granted['android.permission.CAMERA'] === PermissionsAndroid.RESULTS.GRANTED &&
                    granted['android.permission.READ_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED &&
                    granted['android.permission.WRITE_EXTERNAL_STORAGE'] === PermissionsAndroid.RESULTS.GRANTED
                  ) {
                    console.log('Permissions granted');
                  } else {
                    console.log('All required permissions not granted');
                  }
                } catch (err) {
                  console.warn(err);
                }
              }
            };  
          const ImageUpload = () => {
          
          
        
          
   
          
            return (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                {/* <Button title="Pick an image from camera roll" onPress={pickImage} /> */}
                {image && <Image source={image} style={{ width: 200, height: 200 }} />}
              </View>
            );
          };
          



  const handleGenderChange = (value) => {
    console.log(phoneNumber);
    setGender(value);
  };
  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dob;
    setShowDatePicker(false);
    setDob(currentDate);
  };
  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={{ padding: hScale(20) }}>
      <View style={styles.tabsContainer}>
  <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
    {tabs.map((tab, index) => (
      <TouchableOpacity
        key={index}
        onPress={() => handleTabChange(index)}
        style={[styles.tabButton, { borderBottomColor: activeTab === index ? 'blue' : 'transparent' }]}>
        <Text style={{ color: activeTab === index ? 'blue' : 'black' }}>{tab}</Text>
      </TouchableOpacity>
    ))}
  </ScrollView>
</View>
{activeTab === 0 && PersonalData()}
{activeTab === 1 && AddressSec()}
{activeTab === 2 && BankSecc()}
{activeTab === 3 && ShopSec()}
{activeTab === 4 && CompanyInf()}
{activeTab === 5 && DocumentInfo()}
{activeTab === 6 && ImageUpload()}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  input: {
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'grey',
    marginBottom: hScale(10),
    padding: hScale(10),
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: hScale(10),
  },
  tabButton: {
    padding: hScale(10),
    borderBottomWidth: 2,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: '100%',
    backgroundColor: '#fff',
  },
  genderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hScale(10),
  },
  genderLabel: {
    marginRight: hScale(10),
  },
  genderButton: {
    borderWidth: 1,
    borderColor: 'grey',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: hScale(10),
    marginRight: hScale(10),
  },
  datePicker: {
    color: 'blue',
    marginBottom: hScale(10),
  },
  container: {
    padding: 20,
  },

  modalContainer: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  stateItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default RadiantForm;
