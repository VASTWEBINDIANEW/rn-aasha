import React from 'react';
import { View, StyleSheet } from 'react-native';
import CalendarPicker from 'react-native-calendar-picker';
import LinearGradient from 'react-native-linear-gradient';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { RootState } from '../reduxUtils/store';
import { hScale, wScale } from '../utils/styles/dimensions';
import BackSvg from '../features/drawer/svgimgcomponents/BackSvg';
import NextcalenderSvg from '../features/drawer/svgimgcomponents/NextcalenderSvg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const CustomCalendar = ({ onDateSelected, selectedDate }) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const handleDateChange = (date) => {
    const formattedDate = moment(date).format('YYYY-MM-DD');
    console.log(formattedDate);
    onDateSelected(formattedDate);
  };
const insets = useSafeAreaInsets();
  return (
    <View style={[styles.main, { backgroundColor: colorConfig.secondaryColor, paddingBottom: insets.bottom }]}>
      <View style={[styles.container, { borderColor: colorConfig.secondaryColor }]}>
        <CalendarPicker
          onDateChange={handleDateChange}
          initialDate={selectedDate ? new Date(selectedDate) : new Date()}
          selectedDayTextColor="green"
          nextTitle={<NextcalenderSvg size={25} color='#000' />}
          previousTitle={<BackSvg size={25} color='#000' />}
          selectedDayColor="red"
          monthTitleStyle={styles.month}
          yearTitleStyle={styles.month}
          selectMonthTitle={styles.month}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    borderTopEndRadius: 10,
    borderTopLeftRadius: 10,
    flex: 1,
    paddingBottom:hScale(30)

  },
  container: {
    borderTopEndRadius: 10,
    borderTopLeftRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    flex: 1,
    paddingBottom: hScale(20),
    borderWidth: 6,
    borderBottomWidth: 0
  },
  month: {
    fontSize: wScale(25),
    fontWeight: 'bold',
    textTransform: 'uppercase'
  }
});

export default CustomCalendar;
