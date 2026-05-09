import { translate } from "../../utils/languageUtils/I18n";
import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Animated, ScrollView } from "react-native";
import AppBarSecond from "../drawer/headerAppbar/AppBarSecond";
import { hScale, wScale } from "../../utils/styles/dimensions";
import AadharPaysvg from "../../utils/svgUtils/AadhaarPaysvg";
import TopButtomSvg from "../drawer/svgimgcomponents/TopButtomSvg";
import DynamicButton from "../drawer/button/DynamicButton";
import { colors, FontSize } from "../../utils/styles/theme";
import { useSelector } from "react-redux";
import { RootState } from "../../reduxUtils/store";
import CustomCalendar from "../../components/Calender";
import { BottomSheet } from "@rneui/base";
import Calendarsvg from "../drawer/svgimgcomponents/Calendarsvg";
import NavigationSvg from "../drawer/svgimgcomponents/NavigationSvg";
import LocationBusSvg from "../drawer/svgimgcomponents/LocationBusSvg";
import { FlashList } from "@shopify/flash-list";
import { Item } from "react-native-paper/lib/typescript/components/Drawer/Drawer";

const BusScreen = () => {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);
    const color1 = `${colorConfig.secondaryColor}20`;

    const [rotate] = useState(new Animated.Value(0));
    const [fromStation, setFromStation] = useState('');
    const [toStation, setToStation] = useState('');
    const [isVisible, setIsvisible] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [date, setDate] = useState(false);
    const [data, setData] = useState({});


    const handlerotate = () => {
        Animated.timing(rotate, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
        }).start(() => {
            rotate.setValue(0);
        });
        setFromStation(toStation);
        setToStation(fromStation);
    };

    const rotateInterpolation = rotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '180deg']
    });

    const handleOpenBottomSheet = () => {
    };

    const handleDateSelected = (data: string) => {
        setIsvisible(false);
        setSelectedDate(data);
        console.log(selectedDate);
        setDate(true)
    }

    
    useEffect(() => {
        const getApiData = async () => {
            const url = "https://jsonplaceholder.typicode.com/posts";
            const respone = await fetch(url);
            respone = await respone.json();
            console.log(respone, "respons*/*/*/**/");
            setData(respone)
        }   
    
    getApiData()})


    return (
        <View style={styles.main}>
            <AppBarSecond title={'Booking Bus'} />

            <View style={[styles.topview, { backgroundColor: colorConfig.secondaryColor }]}>
                <Text style={styles.toptitle}>{translate("Search_for_Bus_Tickets")}</Text>

                <View style={styles.abhiview}>
                    <Text style={{ color: '#fff' }}>{translate("Powered_By")}</Text>
                    <Text style={styles.abhi}>{translate("ambika")}</Text>
                </View>

            </View>

            <View style={styles.container}>
               <FlashList
               data={data}
               renderItem={(Item)=>{
                return(
                    <Text >
                    {data.id}dgsdfg
                </Text>
                )
               }}
               />
                <View style={styles.inputrow}>
                    <View style={styles.inputview}>
                        <View style={styles.inputiconrow}>
                            <NavigationSvg />
                            <TextInput placeholder="From Station"
                                value={fromStation}
                                placeholderTextColor={colors.black75}
                                onChangeText={(text) => setFromStation(text)}
                                style={styles.input} />
                        </View>
                        <View style={styles.inputiconrow}>
                            <LocationBusSvg />
                            <TextInput placeholder="To Station"
                                value={toStation}
                                placeholderTextColor={colors.black75}
                                onChangeText={(text) => setToStation(text)}
                                style={[styles.input,]}
                            />

                        </View>

                    </View>

                    <TouchableOpacity style={[styles.rotatebtn, { backgroundColor: colorConfig.secondaryColor }]}
                        onPress={handlerotate}>
                        <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
                            <TopButtomSvg />
                        </Animated.View>
                    </TouchableOpacity>
                </View>

                <View >
                    <TouchableOpacity onPress={() => setIsvisible(true)} style={[styles.inputiconrow, styles.disput]}>
                        <Calendarsvg size={20} />

                        <Text style={[styles.input, { marginLeft: wScale(8) }]}>
                            {date === false ? 'Select Your Date' : selectedDate}
                        </Text>

                    </TouchableOpacity>

                </View>

                <View style={{ alignItems: 'center', paddingTop: 50 }}>
                    <View style={styles.btn}>
                        <DynamicButton title={'Search'} onPress={handleOpenBottomSheet} />
                    </View>
                </View>
            </View>
            <BottomSheet animationType="none"  
                onBackdropPress={() => setIsvisible(false)}
                isVisible={isVisible}>
                <View style={styles.bottomSheetContent}>
                    <CustomCalendar onDateSelected={handleDateSelected} />
                </View>
            </BottomSheet>


        </View>
    );
};

const styles = StyleSheet.create({
    main: {
        flex: 1,
    },
    container: {
        paddingHorizontal: wScale(10),
        paddingTop: hScale(20),
        backgroundColor: '#fff',
        marginHorizontal: wScale(10),
        borderRadius: 10,
        elevation: 5,
        marginTop: -120,

    },
    toptitle: {
        fontSize: FontSize.large,
        paddingVertical: hScale(10),
        color: colors.white,
        textAlign: 'center',
        backgroundColor: 'rgba(0,0,0,.1)'
    },
    topview: {
        paddingBottom: hScale(150),
        borderBottomRightRadius:10,
        borderBottomLeftRadius:10
    },
    abhiview: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingTop: hScale(30)
    },
    input: {
        fontSize: FontSize.medium,
        paddingVertical: hScale(10),
        borderBottomWidth: 1,
        borderBottomColor: colors.black75,
        paddingHorizontal: wScale(10),
        flex: 1,
        color: colors.black75,
    },
    abhi: {
        fontSize: FontSize.medium,
        fontWeight: 'bold',
        color: '#fff'
    },
    inputview: {
        flex: 1
    },
    inputrow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    inputiconrow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rotatebtn: {
        height: wScale(50),
        width: wScale(50),
        borderRadius: 50,
        marginLeft: wScale(10),
        alignItems: 'center',
        justifyContent: 'center'
    },
    btn: {
        width: '50%',
        position: 'absolute',
        bottom: hScale(-20),
    },
    disput: {
        marginBottom: hScale(20)
    },
    bottomSheetContent: {
        
    }
});

export default BusScreen;
