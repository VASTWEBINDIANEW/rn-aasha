import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import LinearGradient from 'react-native-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import useRadiantHook from '../../Financial/hook/useRadiantHook';
import { Item } from 'react-native-paper/lib/typescript/components/Drawer/Drawer';
import FlotingInput from '../../drawer/securityPages/FlotingInput';
import DynamicButton from '../../drawer/button/DynamicButton';
import LocationModal from '../../../components/LocationModal';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import { FlashList } from '@shopify/flash-list';
import ShowLoader from '../../../components/ShowLoder';
import NoDatafound from '../../drawer/svgimgcomponents/Nodatafound';
import { ToastAndroid } from 'react-native';
import ClosseModalSvg from '../../drawer/svgimgcomponents/ClosseModal';
import OTPModal from '../../dashboard/components/OTPModal';

const CmsCoustomerInfo = ({ route, navigation }) => {
    const { item, setAmount = null, setRAmount = null, } = route.params;
    console.log(item, 'itteemmm');
    const [item1, setItem1] = useState(item)
    const { colorConfig, isPartial } = useSelector((state: RootState) => state.userInfo);
    const [modalVisible, setModalVisible] = useState(false);
    const [updatedTill, setUpdatedTill] = useState('');
    const [contactName, setContactName] = useState('');
    const [contactNo, setContactNo] = useState('');
    const [email, setEmail] = useState('');
    const [designation, setDesignation] = useState('');
    const { post } = useAxiosHook();
    const [users, setUsers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isLoading, setisLoading] = useState(true);
    const [showDropdown, setShowDropdown] = useState(false);
    const [lastID, setLastId] = useState()
    const options = [
        'Store Owner',
        'Point Manager',
        'Supervisor',
        'Collection Agent',
        'Delivery Boy',
        'Accountant',
        'Support Executive',
    ];

    console.log(isPartial, ':"🟰🟰isPartial');

    // useEffect(() => {
    //     if (typeof setAmount === 'function') {
    //         setAmount('');
    //     }

    //     if (typeof setRAmount === 'function') {
    //         setRAmount('');
    //     }
    // })
    const Insert = async () => {


        setisLoading(true);

        if (!contactName) {
            ToastAndroid.show("⚠ Name is required.", ToastAndroid.SHORT);
            setisLoading(false);
            return;
        }

        const mobilePattern = /^[0-9]{10}$/;
        if (!mobilePattern.test(contactNo)) {
            ToastAndroid.show("⚠ Invalid Mobile Number. Please enter a valid 10-digit mobile number.", ToastAndroid.SHORT);
            setisLoading(false);
            return;
        }

        // Validate Email: Ensure it's a valid Gmail format
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            ToastAndroid.show("⚠ Invalid Email. Please enter a valid Gmail address.", ToastAndroid.SHORT);
            setisLoading(false);
            return;
        }

        // Validate Designation (Check if it's not empty)
        if (!designation) {
            ToastAndroid.show("⚠ Designation is required.", ToastAndroid.SHORT);
            setisLoading(false);
            return;
        }

        try {
            const res = await post({
                url: `${APP_URLS.InsertRadiantClientInformation_BYShopid}Name=${contactName}&Mobile=${contactNo}&Email=${email}&Designation=${designation}&Shopid=${item.ShopId}`,
            });

            const status = res?.Content?.ADDINFO?.status;
            console.log("Insert response:", status, res);

            // 🔥 Toast me status print karo
            if (status) {
                ToastAndroid.show(status, ToastAndroid.SHORT);
            }

            if (status?.toLowerCase() === "insert done") {
                fetchData();
            }

            setModalVisible(false);
            setContactName('');
            setEmail('');
            setContactNo('');
            setDesignation('');

        } catch (error) {
            console.error("Insert failed:", error);
            ToastAndroid.show("Error occurred!", ToastAndroid.SHORT);
        } finally {
            setisLoading(false);
        }
    };






    useEffect(() => {

        fetchData()
    }, [])

    useEffect(() => {
        setModalVisible(users?.length < 1);
    }, [users]);
    const fetchData = async () => {

        try {
            const res = await post({
                // url: APP_URLS.RadiantClientInformationReport_BYShopid 
                url: `${APP_URLS.RadiantClientInformationReport_BYShopid}Shopid=${item.ShopId}`,


            });


            console.log(res, '%%%%%%%%%%%%%%%%%%%%%%%%%%%');
            if (res) {

                setUsers(res.Content.ADDINFO)
            }
            setisLoading(false);

        } catch (error) {

        } finally {
            setisLoading(false);
        }
    };


    const handleSendOtp = async (idno) => {
        setLastId(idno)
        console.log(idno, 'SSSSSSSSSSSSSSSSSSSSS')

        const url = `${APP_URLS.RadiantClientInformationDelete}idno=${idno}&Type=OTPSEND&OTP=''`;
        console.log(url);
        setisLoading(true);

        try {

            const res = await post({ url });
            console.log('otp=======================+++', res, 'otp=======================+++')
            if (res.Content?.ADDINFO?.status === 'OTP SEND') {
                ToastAndroid.show(
                    '📩 OTP Sent Successfully',
                    ToastAndroid.SHORT
                );
                setisLoading(false)
                setShowModal(true);
            } else {
                alert(`⚠ Failed to send OTP. Status: ${res.Content?.ADDINFO?.status}`);
                ToastAndroid.show(
                    `  ${res.Content?.ADDINFO?.status}`,
                    ToastAndroid.SHORT
                );
            }
        } catch (error) {
            console.error('Send OTP Error:', error);
            alert('❌ Error sending OTP.');
        } finally {
            setisLoading(false);
        }
    }

    const handleOtpSubmit = async (otpArray) => {
        //  setisLoading(true);
        console.log(lastID, 'VVVVVVVVVVVVVVVVVVVVVVVV')

        try {
            const url = `${APP_URLS.RadiantClientInformationDelete}idno=${lastID}&Type=VERIFYOTP&OTP=${otpArray}`;

            const res = await post({
                url,
            });

            console.log("DELETE response:", res);
            console.log("DELETE URL:", url);

            const status = res?.Content?.ADDINFO?.status;

            if (status === 'Delete Done') {
                ToastAndroid.show('✅ OTP verified & record deleted.', ToastAndroid.BOTTOM);
                setShowModal(false);
                setisLoading(false);

                fetchData(); // Refresh the list
            } else {
                console.warn('❌ Invalid response from server:', status);
                ToastAndroid.show('❌ Invalid OTP or request failed.', ToastAndroid.BOTTOM);
            }
        } catch (error) {
            console.error("Delete error:", error);
            ToastAndroid.show('❌ Something went wrong.', ToastAndroid.BOTTOM);
        } finally {
            setisLoading(false);
        }
    };


    const renderItem = ({ item }) => {
        const formattedDate = new Date(item.Insertdate).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        return (
            <View style={[styles.listCard, { borderColor: colorConfig.secondaryColor }]}>
                <View style={[styles.topView, { backgroundColor: `${colorConfig.secondaryColor}33` }]}>
                    <Text style={styles.title}>
                        Customer Point Details
                    </Text>

                    <TouchableOpacity onPress={() => handleSendOtp(item.idno)}
                        style={[styles.buttonContainer, { backgroundColor: `${colorConfig.primaryColor}33` }]}>
                        <Icon
                            name="delete"
                            size={30}
                            color="#ff4b5c"
                            style={styles.icon}
                        />
                    </TouchableOpacity>
                </View>
                <View style={[styles.listContainer, { borderColor: colorConfig.secondaryColor }]}>



                    <Text style={styles.updatedText}>
                        Contact information is updated till <Text style={styles.bold}>{formattedDate}</Text>
                    </Text>
                    <Text style={styles.contactDetail}>
                        <Text style={styles.bold}>Name:</Text> {item.Name}
                    </Text>
                    <Text style={styles.contactDetail}>
                        <Text style={styles.bold}>Contact No.:</Text> {item.Mobile}
                    </Text>
                    <Text style={styles.contactDetail}>
                        <Text style={styles.bold}>Email ID:</Text> {item.Email}
                    </Text>
                    <Text style={styles.contactDetail}>
                        <Text style={styles.bold}>Designation:</Text> {item.Designation}
                    </Text>
                    <TouchableOpacity style={[styles.processButton, { backgroundColor: `${colorConfig.primaryColor}` }]}
                        onPress={() => {
                            navigation.navigate('CmsCodeVerification', { item, item1 });
                        }}
                    >
                        <Text style={styles.processButtonText}>Customer Details for Further Processing</Text>

                    </TouchableOpacity>


                </View>
            </View>
        );
    };


    return (
        <View style={styles.main}>
            <AppBarSecond title={' Customer Point Info'} />
            <ScrollView keyboardShouldPersistTaps={"handled"}
                style={styles.container}>
                {isLoading && <ShowLoader />}

                <View style={[styles.infoBox, { backgroundColor: `${colorConfig.secondaryColor}33` }]}>
                    {/* {users?.length === 0 && <LinearGradient
                        colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
                        style={styles.infoHeader}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                    >
                        <View style={{ flex: 1 }}>
                            <Text style={styles.infoTitle}>Customer Point Info</Text>
                            <Text style={styles.disc}>
                                Contact person & number are given below,{"\n"}
                                If you need to add new info you can add by dicking "Add New"
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => {
                                if (users?.length >= 1) {
                                    ToastAndroid.show(
                                        'You can add a maximum of 1 users only.',
                                        ToastAndroid.SHORT
                                    );
                                    return;
                                }

                                setModalVisible(true);
                            }}
                        >
                            <Text style={styles.addButtonText}>Add New</Text>
                        </TouchableOpacity>

                    </LinearGradient>
                    } */}


                    <Text style={styles.label}>Customer Name</Text>
                    <Text style={styles.value}>{item?.CustName || '-'}</Text>

                    <Text style={styles.label}>Point Code/Shop Id</Text>
                    <Text style={styles.value}>{item?.Client_code || '-'}</Text>

                    <Text style={styles.label}>Customer Point Address</Text>
                    <Text style={styles.value}>{item?.PointName || '-'}</Text>
                </View>


                <Text style={styles.notText}>
                    Note:-
                    Only customer point data is to be entered here, not the details of the Retail Cash Executive (RCE).
                    If the RCE enters their own data and collects the money, this is a complete violation of the agreement.
                </Text>
                {users?.length > 0 ? (
                    <View style={styles.contactCard}>
                        <FlashList
                            data={users}
                            keyExtractor={(item) => item.idno.toString()}
                            renderItem={renderItem}
                            estimatedItemSize={100}
                        />
                    </View>
                ) : (
                    <View style={styles.modalContent}>

                        {/* Title + Close Button Row */}

                        <FlotingInput
                            label="Name"
                            keyboardType="default"
                            value={contactName}
                            onChangeTextCallback={setContactName}
                        />

                        <FlotingInput
                            label="Contact No."
                            keyboardType="phone-pad"
                            value={contactNo}
                            onChangeTextCallback={setContactNo}
                        />

                        <FlotingInput
                            label="Email ID"
                            keyboardType="email-address"
                            value={email}
                            onChangeTextCallback={setEmail}
                        />
                        <TouchableOpacity onPress={() => setShowDropdown(true)}>
                            <FlotingInput
                                label="Designation"
                                value={designation}
                                editable={false}
                            />
                        </TouchableOpacity>


                        <DynamicButton title={'Submit'} onPress={() => Insert()} />

                    </View>)}



                {/* <Modal visible={modalVisible} transparent animationType="slide">
                    <View style={styles.modalContainer}>
                        <View style={styles.modalContent}>

                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text style={styles.modalTitle}>Add New Customer Point Information</Text>

                                <TouchableOpacity style={{
                                    position: 'absolute',
                                    top: hScale(-30),
                                    right: wScale(-30),
                                    zIndex: 1,
                                }}

                                    onPress={() => setModalVisible(false)}>
                                    <ClosseModalSvg />
                                </TouchableOpacity>
                            </View>
                            <FlotingInput
                                label="Name"
                                keyboardType="default"
                                value={contactName}
                                onChangeTextCallback={setContactName}
                            />

                            <FlotingInput
                                label="Contact No."
                                keyboardType="phone-pad"
                                value={contactNo}
                                onChangeTextCallback={setContactNo}
                            />

                            <FlotingInput
                                label="Email ID"
                                keyboardType="email-address"
                                value={email}
                                onChangeTextCallback={setEmail}
                            />
                            <TouchableOpacity onPress={() => setShowDropdown(true)}>
                                <FlotingInput
                                    label="Designation"
                                    value={designation}
                                    editable={false}
                                />
                            </TouchableOpacity>


                            <DynamicButton title={'Submit'} onPress={() => Insert()} />

                        </View>
                    </View>
                </Modal> */}


                <Modal visible={showDropdown} transparent animationType="fade">
                    <TouchableOpacity
                        style={styles.overlay}
                        onPress={() => setShowDropdown(false)}
                        activeOpacity={1}
                    >
                        <View style={styles.dropdown}>
                            {options.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.option}
                                    onPress={() => {
                                        setDesignation(item);
                                        setShowDropdown(false);
                                    }}
                                >
                                    <Text style={styles.optionText}>{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </TouchableOpacity>
                </Modal>
                <OTPModal
                    showModal={showModal}
                    setShowModal={setShowModal}
                    onPressSubmitOtp={(otp) => {
                        console.log('OTP submitted:', otp);
                        handleOtpSubmit(otp);  // Pass the IDNO as needed
                    }}
                />

            </ScrollView>
        </View>

    );
};

const styles = StyleSheet.create({
    main: {
        flex: 1,
        backgroundColor: '#f2f2f2',
    },
    container: {
        flex: 1,
    },
    infoBox: {
        backgroundColor: '#dcd6f7',
        paddingHorizontal: wScale(10),
        paddingBottom: hScale(5)
    },
    infoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#3e80ff',
        paddingHorizontal: wScale(8),
        paddingVertical: wScale(10),
        borderRadius: wScale(10),
        marginBottom: hScale(10),
    },
    infoTitle: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: wScale(16),
    },
    disc: {
        color: '#fff',
        fontSize: wScale(10),
    },
    addButton: {
        backgroundColor: 'black',
        paddingVertical: hScale(9),
        paddingHorizontal: wScale(15),
        borderRadius: wScale(20),
    },
    addButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: wScale(16),
    },
    label: {
        fontWeight: '600',
        marginTop: hScale(5),
        fontSize: wScale(14),
        color: '#000'
    },
    value: {
        fontWeight: 'bold',
        color: '#333',
        fontSize: wScale(18),
    },
    contactCard: {
        paddingHorizontal: wScale(10),
        marginTop: hScale(20)
    },

    updatedText: {
        marginBottom: hScale(10),
        color: '#666',
        fontSize: wScale(13),

    },
    contactDetail: {
        fontSize: wScale(16),
        marginBottom: hScale(5),
        color: '#666'
    },
    bold: {
        fontWeight: 'bold',
    },
    processButton: {
        marginTop: hScale(15),
        backgroundColor: '#f7f8fa',
        padding: wScale(10),
        borderRadius: wScale(10),
    },
    processButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: wScale(14),
    },
    svgStyle: {
        position: 'absolute',
        top: hScale(0),
        right: wScale(0),
        width: wScale(80),
        height: hScale(80),
    },
    icon: {

    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        // margin: wScale(20),
        paddingHorizontal: wScale(15),
        borderRadius: wScale(10),
        paddingTop: hScale(10)
    },
    modalTitle: {
        fontSize: wScale(18),
        fontWeight: 'bold',
        marginBottom: hScale(10),
        color: '#000'
    },
    listCard: {
        borderWidth: .4,
        marginBottom: hScale(10),
        borderRadius: 5,


    },

    listContainer: {
        paddingHorizontal: wScale(10),

        paddingVertical: hScale(10)

    },
    topView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // optional: adds spacing between text and button
        padding: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 1, // allows text to take available space
        color: '#000'
    },
    buttonContainer: {
        backgroundColor: '#EDBDB2',
        padding: 2,
        borderRadius: 4,
    },
    overlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#00000055',
    },
    dropdown: {
        backgroundColor: '#fff',
        marginHorizontal: 30,
        borderRadius: 10,
        paddingVertical: 10,
        elevation: 5
    },
    option: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderBottomWidth: 0.5,
        borderColor: '#ccc',
    },
    optionText: {
        fontSize: 16,
        color: '#333',
    },
    notText: {
        color: 'red',
        fontSize: wScale(12),
        textAlign: 'justify',
        paddingHorizontal: wScale(10),
        paddingTop: hScale(10),
        marginBottom: hScale(5)
    }

});


export default CmsCoustomerInfo;
