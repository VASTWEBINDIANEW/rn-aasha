import React, { useEffect, useState, useCallback } from "react"
import { TouchableOpacity, View, Text, StyleSheet, ScrollView, Alert, Image, PermissionsAndroid } from "react-native"
import useAxiosHook from "../../utils/network/AxiosClient";
import { APP_URLS } from "../../utils/network/urls";
import { hScale, SCREEN_HEIGHT, SCREEN_WIDTH, wScale } from "../../utils/styles/dimensions";
import AppBarSecond from "../drawer/headerAppbar/AppBarSecond";
import { FlashList } from "@shopify/flash-list";
import { useDeviceInfoHook } from "../../utils/hooks/useDeviceInfoHook";
import { useSelector } from "react-redux";
import { colors, FontSize } from "../../utils/styles/theme";
import NoDatafound from "../drawer/svgimgcomponents/Nodatafound";
import { ALERT_TYPE, Dialog } from "react-native-alert-notification";
import { openSettings } from "react-native-permissions";
import { launchCamera, launchImageLibrary } from "react-native-image-picker";
import ShowLoader from "../../components/ShowLoder";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { RootState } from "../../reduxUtils/store";
import AepsAddAccount from "./AepsAddAccount";
import DmtAddAccount from "./DmtAddAccount";
import AddAccountSvg from "../drawer/svgimgcomponents/AddAccountSvg";
import { DotLoader } from "../../components/DotLoader ";
import AepsAccountSvg from "../drawer/svgimgcomponents/AepsAccountSvg";
import DealerAddWalletAndAddAcc from "../Delerpages/DelerHomeToppage/DealerAddWallet&AddAcc";
const ManageAccount = () => {
    const { colorConfig ,IsDealer} = useSelector((state: RootState) => state.userInfo);
    const color1 = `${colorConfig.primaryColor}20`;
    const { get, post } = useAxiosHook()
    const [banklist, setBanklist] = useState([]);
    const [bank, setBank] = useState('');
    const [bankid, setBankid] = useState('');
    const [isBank, setIsBank] = useState(false);
    const [loading, setLoading] = useState(false);
    const [ifsccode, setIfsccode] = useState('')
    const [acnNumber, setAcnNumber] = useState('')
    const [name, setName] = useState('')
    const [branch, setBranch] = useState('')
    const [Addresss, setAddresss] = useState('')
    const [bankAcclist, setBankAcclist] = useState([]);
    const [Pincod, setPincode] = useState('');
    const [city, setCity] = useState('');
    const [add, setAdd] = useState(true);
    const [idno, setidno] = useState('')
    const [base64Img, setbase64Img] = useState<any>(null);
    const [isLoading, setisLoading] = useState(false);
    const [index, setIndex] = useState(0);
    const { getNetworkCarrier, getMobileDeviceId, getMobileIp } =
        useDeviceInfoHook();
    const { userId } = useSelector((state: RootState) => state.userInfo);
 
    useEffect(() => {

        if(!IsDealer){
        fetchBanks();
        const fetchBankAccounts = async () => {
            setLoading(true);
            try {
                const response = await get({ url: `${APP_URLS.SavedAccounts}` });
                if (response.Response === "Success") {
                    setBankAcclist(response.Message);
                    console.log(response)
                } else {
                    Alert.alert("Error", "Failed to load bank accounts");
                }
            } catch (error) {
                Alert.alert("Error", "An error occurred while fetching bank accounts");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchBankAccounts();
       // requestCameraPermission();
        }

    }, []);
if(IsDealer){
    return <DealerAddWalletAndAddAcc/>
}
    const fetchBanks = async () => {
        setLoading(true);
        try {
            const response = await post({ url: `${APP_URLS.aepsBanklist}` });
            console.log(response);
            if (response.RESULT === '0') {
                setBanklist(response['ADDINFO']['data']);
            } else {
                Alert.alert('Error', 'Failed to load bank list');
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while fetching banks');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
  
    const [routes] = useState([
        { key: 'DmtBank', title: 'Wallet Unload A/c' },
        { key: 'AepBank', title: 'For Aeps Activetion A/c' },

    ]);
    const renderScene = SceneMap({
        'DmtBank': DmtAddAccount,
        'AepBank': AepsAddAccount,
    });
    const getSvgimg = (key: string) => {
        switch (key) {
            case 'DmtBank':
                return <AddAccountSvg/>
            case 'AepBank':
                return <AepsAccountSvg color1="#000"color2="#000" />
                return null;
        }
    }

    return (    
        <View style={styles.main}>
            <AppBarSecond
                title={'Manage Account'} />
            <TabView
                lazy
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={{ width: SCREEN_WIDTH }}
                renderTabBar={(props) => (
                    <TabBar
                        {...props}
                        indicatorStyle={[styles.indicator, { backgroundColor: colorConfig.secondaryColor }]}
                        style={[styles.tabbar, { backgroundColor: colorConfig.primaryColor  }]}
                        renderLabel={({ route, focused }) => (
                            <View style={styles.labelview}>

                                {getSvgimg(route.key)}
                                <Text style={[styles.labelstyle, { color: focused ? colors.dark_black : colors.black75 }]}>
                                    {route.title}
                                </Text>

                            </View>
                        )} />
                )} />
        </View>
    );
};
const styles = StyleSheet.create({
    main: {
        flex: 1,
    },
    container: {
        flex: 1,
        marginHorizontal: wScale(10),
        paddingHorizontal: wScale(10),
        paddingTop: hScale(10),
    },
    tabbar: {
        elevation: 0,
    },
    indicator: {
    },
    labelstyle: {
        fontSize: wScale(13),
        color: colors.black,
        width: "100%",
        textAlign: 'center',
        fontWeight: 'bold'
    },
    labelview: {
        alignItems: 'center',
        flex: 1,
    },

});
export default ManageAccount;
