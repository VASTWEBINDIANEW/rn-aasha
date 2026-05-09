import { translate } from "../../../utils/languageUtils/I18n";
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Image, ToastAndroid, Linking, PermissionsAndroid, Alert, Modal, TextInput, ScrollView, RefreshControl } from "react-native";
import useAxiosHook from "../../../utils/network/AxiosClient";
import { APP_URLS } from "../../../utils/network/urls";
import { hScale, wScale } from "../../../utils/styles/dimensions"; // Make sure you import scaling utilities
import { useSelector } from "react-redux";
import SwitchButton2 from "../../drawer/settingPages/SwitchButton2";
import Icon from 'react-native-vector-icons/FontAwesome';  // or another icon set like MaterialIcons
import Entypo from 'react-native-vector-icons/Entypo';  // or another icon set like MaterialIcons
import { useNavigation } from "@react-navigation/native";
import { ALERT_TYPE, Dialog, Toast } from "react-native-alert-notification";
import { openSettings } from "react-native-permissions";
import ShowLoader from "../../../components/ShowLoder";
import NoDatafound from "../../drawer/svgimgcomponents/Nodatafound";
import OnelineDropdownSvg from "../../drawer/svgimgcomponents/simpledropdown";
import LottieView from "lottie-react-native";
import { colors } from "../../../utils/styles/theme";

const RetailerList = () => {
    const { colorConfig } = useSelector((state) => state.userInfo);
    const color1 = `${colorConfig.secondaryColor}20`;
    const { post } = useAxiosHook();
    const [retailers, setRetailers] = useState([]); // State to store the retailer data
    const [loading, setLoading] = useState(true);
    const [loading1, setLoading1] = useState(false); // Loading state for API call
    const [height, setHeight] = useState(false)
    const [SearchQuery,SetSearchQuery]=useState('')
    const filteredData = (retailers).filter(item =>

        item["firmName"].toLowerCase().includes(SearchQuery.toLowerCase())
      );
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);setRetailers([])
    getUserList().then(() => setRefreshing(false));
  }, []);
      const filteredList = (data) => {
        return data.filter(item => {
            const name = item['Name']?.toLowerCase() || '';
            const firmName = item['firmName']?.toLowerCase() || '';
            const mobile = item['Mobile']?.toLowerCase() || ''; // Correct key used
            const itemString = typeof item === 'string' ? item.toLowerCase() : '';
            const query = SearchQuery.toLowerCase();
            return (
                name.includes(query) ||
                firmName.includes(query) ||
                mobile.includes(query) || // Check for Mobile
                itemString.includes(query)
            );
        });
    };
    useEffect(() => {
     

        getUserList();
        Promise.all([ getUserList(),]).then(() => setRefreshing(false));

    }, []); // Empty dependency array to run the effect once when the component mounts
    const getUserList = async () => {
        setLoading(true)
        try {
            // Making the API request
            const response = await post({ url: APP_URLS.retailerlist });
            console.log(response[0], '*****123'); // Log the response for debugging

            if (response) {
                setRetailers(response);
            } else {
                setRetailers([]); // If no data, reset to empty
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setRetailers([]); // If there's an error, reset to empty
        } finally {
            setLoading(false); // Stop loading once the API call is complete
        }
    };
    const handleSwitchChange = async (newStatus, UserID) => {
        setLoading1(true)
        console.log('Switch is now:', newStatus ? 'ON' : 'OFF', UserID);
        try {
            const update = await post({ url: `${APP_URLS.retailerActiveDeactive}RetailerID=${UserID}&Status=${newStatus === 'Y' ? 'Y' : 'N'}` })

            console.log(update, `${APP_URLS.retailerActiveDeactive}RetailerID=${UserID}&Status=${newStatus === 'Y' ? 'Y' : 'N'}`);
            const response = await post({ url: APP_URLS.retailerlist });
            console.log(response, '*****123'); // Log the response for debugging

            if (response) {
                setRetailers(response);

                console.log(response[0], '**********',)
            } else {
                setRetailers([]); // If no data, reset to empty
            }
            if (update) {
                ToastAndroid.show('User Status Update ' + update.Message, ToastAndroid.LONG)
            } else {
                ToastAndroid.show(update.Message || '', ToastAndroid.LONG)

            }
            setLoading(false)
            setLoading1(false)

        } catch (error) {

        }
    };



    const handleCall = (type, value) => {
        switch (type) {
            case 'call':
                const callUrl = `tel:${value}`;
                Linking.openURL(callUrl).catch(err => console.error('Failed to make a call', err));
                break;
            case 'mail':
                const mailUrl = `mailto:${value}`;
                Linking.openURL(mailUrl).catch(err => console.error('Failed to open mail', err));
                break;
            case 'location':
                const locationUrl = `https://www.google.com/maps?q=${value}`;  // Assuming value is a location string (lat, lon)
                Linking.openURL(locationUrl).catch(err => console.error('Failed to open map', err));
                break;
            case 'chat':
                const smsUrl = `sms:${value}`;
                Linking.openURL(smsUrl).catch(err => console.error('Failed to open chat', err));
                break;
            default:
                console.log('Unknown action type');
                break;
        }
    };
    const navigation = useNavigation();
    const _navigateToDocs = (item) => {
        navigation.navigate('DealerDocsRetailer', { item });

    }
    const requestCameraPermission = useCallback(async (item) => {
        try {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.CAMERA,
                {
                    title: "Camera Permission",
                    message:
                        "key_thisappn_102",
                    buttonPositive: "OK",
                }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {

                navigation.navigate('DealerDocsRetailer', { item });

              


            } else {
                Dialog.show({
                    type: ALERT_TYPE.WARNING,
                    title: "Permission Required",
                    textBody: "key_pleasegra_85",
                    button: "OK",
                    onPressButton: () => {
                        Dialog.hide();
                        openSettings().catch(() => console.warn("cannot open settings"));
                    },
                });
            }
        } catch (err) {
            console.warn(err);
        }
    }, []);

    const uploadDoCx = async (typ, bs64, id) => {
        setLoading1(true)

        try {
            const data = {
                "PancardFront": bs64,
                "txtretailerid": id,
            };

            const data2 = {
                "ShopeWithSelfie": bs64,
                "txtretailerid": id,
            };
            const body = JSON.stringify(typ === 'P' ? data : data2);
            console.log(body, 'BODY****', typ)
            const endpoint = `api/user/UploadRetailerDocumentsByDealer`;

            const url = `https://${APP_URLS.baseWebUrl}/${endpoint}`;
            console.log(url)
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: body,
            });

            if (!response.ok) {
                throw new Error(`Failed to upload. Status: ${response.status}`);
            }

            const responseData = await response.json();

            if (responseData === 'Image Updated Successfully.') {
                ToastAndroid.show(responseData, ToastAndroid.SHORT);

            } else {
                ToastAndroid.show(responseData, ToastAndroid.SHORT);
            }
            setLoading1(false)

        } catch (error) {
            console.error('Upload Error:', error);
            Alert.alert('Error', `Failed to upload ${typ} Image: ${error.message}`);
        }
    };
  
    const [selectedItemIndex, setSelectedItemIndex] = useState(null);
    const [imagePath, setImagePath] = useState(null)
    const handlePress = () => {
        setHeight(!height)
    }

    const renderItem = ({ item, index }) => (

        <TouchableOpacity style={[styles.card2, { backgroundColor: color1, }]}
            onPress={() => {
                setSelectedItemIndex(index)
                handlePress()
            }}>

            <View style={[styles.topSection, {
                borderColor: item.Status === 'Y' ? 'green' : 'red'
            }]}>

                <TouchableOpacity onPress={() => {
                    if (item.Photo) {
                        setModalVisible(true)
                        setImagePath(`http://${APP_URLS.baseWebUrl}${item.Photo}`)
                    } else {
                        ToastAndroid.show('Image Not Found', ToastAndroid.LONG)
                    }

                }}>
                    <Image
                        resizeMode='cover'
                        source={
                            item.Photo
                                ? { uri: `https://${APP_URLS.baseWebUrl}${item.Photo}` }
                                : require('../../../features/drawer/assets/bussiness-man.png')
                        }
                        style={styles.image}
                    />

                </TouchableOpacity>

                <Text style={styles.retailerName}>{item.Name}</Text>
                {/* <View style={{ alignSelf: 'center' }} >
                    <Text style={styles.status}>{translate("Retailer_Status")}</Text>
                    <SwitchButton2 Status={item.Status === 'Y'} onChange={(v) => { handleSwitchChange(item.Status, item.UserID) }} />
                </View> */}
                <TouchableOpacity style={[styles.dropbtn, selectedItemIndex === index ? { transform: [{ rotate: '180deg' }] } : null]}
                    onPress={() => handlePress()}>
                    <OnelineDropdownSvg />
                </TouchableOpacity>
            </View>
            <View style={styles.card}>

                <View style={styles.balanceSection}>
                    <View style={[styles.row, { borderBottomColor: colorConfig.secondaryColor }]}>
                        <View>
                            <Text style={styles.balanceLabel}>{translate("Main_Balance")}</Text>
                            <Text style={styles.balanceValue}>₹ {item.RemainAmt}</Text>
                        </View>

                        <View >
                            <Text style={styles.balanceLabel}>{translate("POS_Balance")}</Text>
                            <Text style={styles.balanceValue}>₹ {item.currentPosamount}</Text>
                        </View>
                        <View >
                            <Text style={styles.balanceLabel}>{translate("Hold_Balance")}</Text>
                            <Text style={styles.balanceValue}>₹ {item.totalholdamount}</Text>
                        </View>
                        <View >
                            <Text style={styles.balanceLabel}>{translate("Outstanding")}</Text>
                            <Text style={styles.balanceValue}>₹ {item.currentcr}</Text>
                        </View>
                    </View>

                </View>

                <View style={styles.detailsSection}>
                    <View style={[styles.row, { borderBottomColor: colorConfig.secondaryColor }]}>
                        <Text style={styles.detailsLabel}>{translate("Firm_Name")}</Text>
                        <Text style={styles.detailsValue}>{item.firmName}</Text>
                    </View>
                    <View style={[styles.row, { borderBottomColor: colorConfig.secondaryColor }]}>
                        <Text style={styles.detailsLabel}>{translate("Mobile")}</Text>
                        <Text style={styles.detailsValue}>{item.Mobile}</Text>
                    </View>
                    <View style={[styles.row, { borderBottomColor: colorConfig.secondaryColor }]}>
                        <Text style={styles.detailsLabel}>{translate("Retailer_Status")}</Text>
                        <SwitchButton2 Status={item.Status === 'Y'} onChange={(v) => { handleSwitchChange(item.Status, item.UserID) }} />
                    </View>


                    {selectedItemIndex === index && (
                        <View>
                            <View style={[styles.row, { borderBottomColor: colorConfig.secondaryColor }]}>
                                <Text style={styles.detailsLabel}>{translate("Email")}</Text>
                                <Text style={styles.detailsValue}>{item.Email}</Text>
                            </View>
                            <View style={[styles.row, { borderBottomColor: colorConfig.secondaryColor }]}>
                                <Text style={styles.detailsLabel}>{translate("Join_Date")}</Text>
                                <Text style={styles.detailsValue}>{item.JoinDate}</Text>
                            </View>
                            <View style={[styles.row, { borderBottomColor: colorConfig.secondaryColor }]}>
                                <Text style={styles.detailsLabel}>{translate("State")}</Text>
                                <Text style={styles.detailsValue}>{item.State}</Text>
                            </View>
                            <View style={[styles.row, { borderBottomColor: colorConfig.secondaryColor }]}>
                                <Text style={styles.detailsLabel}>{translate("District")}</Text>
                                <Text style={styles.detailsValue}>{item.District}</Text>
                            </View>
                            <View style={[styles.row, { borderBottomColor: colorConfig.secondaryColor }]}>
                                <Text style={styles.detailsLabel}>{translate("Address")}</Text>
                                <Text style={styles.detailsValue}>{item.Address}</Text>
                            </View>
                            <View style={[styles.row, {}]}>
                                <TouchableOpacity style={styles.btnstyle} onPress={() => { handleCall('call', item.Mobile) }}>
                                    <Icon name="phone" size={30} color={colorConfig.secondaryColor} />
                                </TouchableOpacity>

                                <TouchableOpacity style={styles.btnstyle} onPress={() => { handleCall('mail', item.Email) }}>
                                    <Icon name='envelope-o' size={30} color={colorConfig.secondaryColor} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.btnstyle} onPress={() => { handleCall('location', item.Address) }}>
                                    <Entypo name="location" size={30} color={colorConfig.secondaryColor} />
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.btnstyle} onPress={() => { handleCall('chat', item.Mobile) }}>
                                    <Entypo name="message" size={30} color={colorConfig.secondaryColor} />
                                </TouchableOpacity   >
                                {/* <TouchableOpacity style={styles.btnstyle} onPress={() => { handleCall('chat', item.Mobile) }}>
                                    <Entypo name="message" size={30} color={colorConfig.secondaryColor} />
                                </TouchableOpacity> */}

                                <TouchableOpacity onPress={() => {
                                    requestCameraPermission(item);
                                }}>
                                    <LottieView
                                        autoPlay={true}
                                        loop={true}
                                        style={styles.lotiimg}
                                        source={require('../../../utils/lottieIcons/upload-file.json')}

                                    // source={require('../../utils/lottieIcons/upload-file.json')}
                                    /></TouchableOpacity>



                            </View>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );

    const [modalVisible, setModalVisible] = useState(false);


    return (


           <ScrollView
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

        <View style={styles.main}>

            {loading1 && <ShowLoader />}


            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.7)' }}>
                    <View style={{ width: '80%', backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Text style={{ fontSize: 18, color: colorConfig.primaryButtonColor, marginBottom: 10 }}>{translate("Close")}</Text>
                        </TouchableOpacity>
                        <Image
                            source={{ uri: imagePath }}
                            style={{ width: '100%', height: 300, resizeMode: 'contain' }}
                        />
                    </View>
                </View>
            </Modal>
            <View style={styles.container}>
                  <TextInput
                  placeholder="Search by name/firm name/ mobile"
                  value={SearchQuery}
                  onChangeText={SetSearchQuery}
                  style={styles.searchbar}
                 placeholderTextColor={colors.black75}
                 cursorColor={'colors.black'}

                  />

                {loading ? (
                    <ShowLoader />) : retailers.length === 0 ? (
                        <NoDatafound />) : (
                    <FlatList
                        data={filteredList(retailers)}
                        renderItem={renderItem}
                        keyExtractor={(item, index) => index.toString()}
                    />
                )}
            </View>
        </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: "#fff",
    },
    searchbar: {
        borderColor: 'gray',
        borderWidth: wScale(1),
        paddingHorizontal: wScale(15),
        marginHorizontal: wScale(10),
        marginBottom: hScale(10),
        borderRadius: 5,
        color: colors.black75,
        fontSize: wScale(16),
      },
    lotiimg: {
        height: hScale(44),
        width: wScale(44),
    },
    container: {
        paddingHorizontal: wScale(20), // Scaled horizontal padding
        paddingTop: hScale(0), // Scaled vertical padding
    },
    card: {
        padding: hScale(8), // Scaled vertical padding

    },
    card2: {
        backgroundColor: "#f8f8f8",
        borderRadius: wScale(10), // Scaled border radius
        borderWidth: wScale(2), // Scaled border width
        borderColor: "#ddd",
        marginBottom: hScale(10)

    },
    topSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderWidth: wScale(1),
        borderRadius: 10,
        // paddingVertical: hScale(5),
        // paddingHorizontal: wScale(5),
        alignItems: 'center',
        height: wScale(40),
        paddingRight: wScale(10)

    },
    retailerName: {
        fontSize: wScale(18),
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        flex: 1
    },
    status: {
        fontSize: wScale(10),
        color: '#333',
        textAlign: 'center',
        marginTop: hScale(-4)
    },
    image: {
        height: wScale(38),
        width: wScale(40),  // Scaled width for image
        borderRadius: wScale(10), // Make the image circular (optional)
        backgroundColor: '#dafafa'
    },
    balanceSection: {
        marginBottom: hScale(2), // Scaled vertical margin
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: wScale(0.7), // Scaled border width
        borderColor: '#ddd',
        paddingVertical: hScale(5), // Scaled vertical padding
        borderWidth: 1,
    },
    balanceLabel: {
        fontSize: wScale(11), // Scaled font size
        color: '#333',
    },
    balanceValue: {
        fontSize: wScale(14), // Scaled font size
        color: '#333',
        fontWeight: 'bold', // Bold value text
        textAlign: 'center'
    },
    detailsSection: {
        marginTop: hScale(10), // Scaled vertical margin
    },
    detailsLabel: {
        fontSize: wScale(14), // Scaled font size
        color: '#333',
    },
    detailsValue: {
        fontSize: wScale(14), // Scaled font size
        color: '#333',
        fontWeight: 'bold', // Bold value text
    },
    btnstyle: {
        flex: 1,
        alignItems: 'center'
    },
    upload: {
        borderWidth: 1,
        paddingHorizontal: wScale(4),
        paddingVertical: wScale(4),
        color: '#fff',
        borderRadius: 3,
        fontSize: wScale(12)
    },
    dropbtn: {
        marginLeft: wScale(5),
        paddingHorizontal: (10),
    },

});

export default RetailerList;
