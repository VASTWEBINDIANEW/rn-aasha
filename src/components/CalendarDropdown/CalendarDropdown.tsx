import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import AntDesign from "react-native-vector-icons/AntDesign";
import CalendarCmssvg from "../../features/drawer/svgimgcomponents/CalendarCmssvg";
import { hScale, wScale } from "../../utils/styles/dimensions";
import { MonthItem } from "./MonthItem";
import { getReverseMonthsWithYear, MONTHS } from "../../utils/dateUtils";
import OnelineDropdownSvg from "../../features/drawer/svgimgcomponents/simpledropdown";

interface CalendarDropdownProps {
  year?: number;
  onChange?: (month: number, year: number) => void;
}

export const CalendarDropdown = ({ year, onChange }: CalendarDropdownProps) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Default = current month - 1
  let defaultMonth = currentMonth - 1;
  let defaultYear = currentYear;
  if (defaultMonth < 0) {
    defaultMonth = 11; // December
    defaultYear -= 1;
  }

  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(defaultMonth);
  const [selectedYear, setSelectedYear] = useState(year ?? defaultYear);

  const months = getReverseMonthsWithYear(currentMonth, currentYear);

  const handleSelect = (month: number, year: number) => {
    setSelectedMonth(month);
    setSelectedYear(year);
    setOpen(false);
    onChange?.(month, year);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => setOpen(!open)}>
        <CalendarCmssvg size={35} month={MONTHS[selectedMonth]} year={selectedYear} />
        <Text style={styles.buttonText}>
          {MONTHS[selectedMonth]} {selectedYear}
        </Text>
        {/* <AntDesign name={open ? "up" : "down"} size={24} /> */}
        <OnelineDropdownSvg/>
      </TouchableOpacity>

      {open && (
        <View style={styles.dropdown}>
          {months.map((item, index) => (
            <MonthItem
              key={`${item.monthName}-${item.year}-${index}`}
              label={`${item.monthName} ${item.year}`}
              onPress={() => handleSelect(item.monthIndex, item.year)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: "100%" },
  button: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: hScale(10),
    // backgroundColor: "#fff",
  },
  buttonText: {
    fontSize: wScale(22),
    fontWeight: "bold",
    color:'#000',
    textTransform:'uppercase'
  },
  dropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
});
