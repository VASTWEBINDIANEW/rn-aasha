import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Calendarsvg from '../../features/drawer/svgimgcomponents/Calendarsvg';
import SearchIcon from '../../features/drawer/svgimgcomponents/Searchicon';
import FilterSvg from '../../features/drawer/svgimgcomponents/FilterSvg';
import { hScale, wScale } from '../../utils/styles/dimensions';
import { BottomSheet } from '@rneui/base';
import CustomCalendar from '../Calender';
import { useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import LinearGradient from 'react-native-linear-gradient';
import { translate } from '../../utils/languageUtils/I18n';

const StatusCalendar = ({ onSearch }) => {
    const { colorConfig } = useSelector((state: RootState) => state.userInfo);
    const [rotation, setRotation] = useState(false);

    const [status, setStatus] = useState('');
    const [fromDate, setFromDate] = useState(
        new Date().toISOString().split('T')[0]
    );
    console.log(status);

    const [toDate, setToDate] = useState(
        new Date().toISOString().split('T')[0]
    );

    const [isCalendarVisible, setIsCalendarVisible] = useState(false);
    const [isSelectingFromDate, setIsSelectingFromDate] = useState(true);
    const dropdownPress = () => {
        setRotation(!rotation);
    };
    const onFromDatePress = () => {
        setIsSelectingFromDate(true);
        setIsCalendarVisible(true);
    };

    const onToDatePress = () => {
        setIsSelectingFromDate(false);
        setIsCalendarVisible(true);
    };

    const handleDateSelected = (date) => {
        if (isSelectingFromDate) {
            setFromDate(date);
        } else {
            setToDate(date);
        }
        setIsCalendarVisible(false);
    };
    const handleStatusSelect = (statusOption) => {
        setStatus(statusOption);
        setRotation(false);
        if (statusOption === 'All Transaction') { setStatus('') }

    };

 useEffect(() => {
    onSearch({ from: fromDate, to: toDate, status });
}, [fromDate, toDate, status]);

    const crStatus = ['All Transaction', 'Success', 'Pending', 'Failed'];
    return (
        <View>
            <LinearGradient colors={[colorConfig.primaryColor, colorConfig.secondaryColor]} style={styles.gradient}>

                <View style={[styles.headerrow,]}>
                    <TouchableOpacity
                        style={[styles.dropdown, { transform: [{ rotate: rotation ? '180deg' : '0deg' }] }]}
                        onPress={dropdownPress}>

                        <FilterSvg size={28} color="#fff" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.datePickerButton} onPress={onFromDatePress}>
                        <Calendarsvg color="#fff" />
                        <View style={{ paddingLeft: wScale(5) }}>
                            <Text style={styles.buttonText}>{translate("From_Date")}</Text>
                            <Text style={styles.dateText}>{fromDate}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.datePickerButton} onPress={onToDatePress}>
                        <Calendarsvg color="#fff" />
                        <View style={{ paddingLeft: wScale(5) }}>
                            <Text style={styles.buttonText}>{translate("To_Date")}</Text>
                            <Text style={styles.dateText}>{toDate}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.searchButton}
                        onPress={() => onSearch({ from: fromDate, to: toDate, status })}
                    >
                        <SearchIcon size={28} color="#fff" />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
            {rotation && <View style={[styles.statusheight,
            { backgroundColor: `${colorConfig.secondaryColor}1D` }
            ]}>
                {crStatus.map((statusOption) => (
                    <TouchableOpacity key={statusOption}
                        onPress={() => handleStatusSelect(statusOption)
                        }
                    >
                        <Text style={[styles.statusText, { borderBottomColor: colorConfig.primaryColor }]}>{statusOption}</Text>
                    </TouchableOpacity>
                ))}
            </View>}
            <BottomSheet
        animationType="none"  
                isVisible={isCalendarVisible}
                onBackdropPress={() => setIsCalendarVisible(false)}
            >
                <CustomCalendar
                    onDateSelected={handleDateSelected}
                    selectedDate={isSelectingFromDate ? fromDate : toDate}
                />
            </BottomSheet>
        </View>
    );
};


export default StatusCalendar;

const styles = StyleSheet.create({
    gradient: {
        elevation: 3,
    },
    container: { flex: 1 },
    dropdown: {
        alignItems: 'center',
        borderRadius: 5,
        backgroundColor: 'rgba(0,0,0,.5)',
        height: hScale(48),
        width: wScale(48),
        justifyContent: 'center'
    },
    headerrow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: wScale(10),
        paddingVertical: hScale(5)
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,.5)',
        paddingHorizontal: wScale(8),
        paddingVertical: wScale(5),
        borderRadius: 5,
        height: hScale(48),
        width: wScale(125),
        justifyContent: 'space-between'
    },
    buttonText: {
        color: '#fff',
        fontSize: wScale(13),
        fontWeight: 'bold',
        textTransform: 'uppercase'
    },
    dateText: {
        color: '#fff',
        fontSize: wScale(14),
    },
    searchButton: {
        borderRadius: 5,
        backgroundColor: 'rgba(0,0,0,.5)',
        height: hScale(48),
        width: wScale(48),
        alignItems: 'center',
        justifyContent: 'center'
    },

    righticon: {
        position: 'absolute',
        right: wScale(0),
        height: '75%',
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingRight: wScale(12),
    },
    input: {
        height: hScale(40),
        borderColor: '#ccc',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: wScale(10),
        marginBottom: hScale(10),
        color: '#fff',
    },
    statusheight: {
        overflow: 'hidden',
        marginTop: hScale(0),
        marginBottom: hScale(10),
        backgroundColor: 'rgba(0,0,0,0.2)'
    },
    statusText: {
        color: '#000',
        paddingVertical: hScale(8),
        paddingHorizontal: wScale(15),
        borderBottomWidth: .5,
        borderBottomColor: 'red',
        fontWeight: '600',
        textTransform: 'capitalize',
        fontSize: wScale(15),
    },
    bottomSheetContainer: {
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
    },
    itemContainer: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
});

