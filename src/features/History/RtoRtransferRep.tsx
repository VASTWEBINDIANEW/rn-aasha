import { translate } from "../../utils/languageUtils/I18n";
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
} from 'react-native';

const RToRFundReport = () => {
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [inforeport, setInforeport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showFromDate, setShowFromDate] = useState(false);
  const [showToDate, setShowToDate] = useState(false);
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = ("0" + (currentDate.getMonth() + 1)).slice(-2);
  const day = ("0" + currentDate.getDate()).slice(-2);

  const formattedDate = `${year}-${month}-${day}`;
  const formatDate = (date) => {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  };

  const fetchRToRFundReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://api.vastwebindia.com/Retailer/api/data/rem_rem_fund_transfer_report?txt_frm_date=${formatDate(
          fromDate
        )}&txt_to_date=${formatDate(toDate)}&RetailerId1=ALL`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer <your_access_token>',
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setInforeport(data.Report);
      } else {
        throw new Error('Failed to fetch report');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRToRFundReport();
  }, [fromDate, toDate]);

  const onChangeFromDate = (event, selectedDate) => {
    setShowFromDate(false);
    if (selectedDate) {
      setFromDate(selectedDate);
    }
  };

  const onChangeToDate = (event, selectedDate) => {
    setShowToDate(false);
    if (selectedDate) {
      setToDate(selectedDate);
    }
  };

  const showFromDatepicker = () => {
    setShowFromDate(true);
  };

  const showToDatepicker = () => {
    setShowToDate(true);
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={showFromDatepicker} style={styles.datePicker}>
            <Text style={styles.datePickerText}>From Date: {formatDate(fromDate)}</Text>
            <MaterialIcons name="date-range" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={showToDatepicker} style={styles.datePicker}>
            <Text style={styles.datePickerText}>To Date: {formatDate(toDate)}</Text>
            <MaterialIcons name="date-range" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={fetchRToRFundReport} style={styles.searchButton}>
            <MaterialIcons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.reportContainer}>
          {loading ? (
            <Text>{translate("Loading")}</Text>
          ) : (
            inforeport.map((item, index) => (
              <View key={index} style={styles.reportItem}>
                <Text style={styles.reportText}>Name: {item.transfertoretailername || 'N/A'}</Text>
                <Text style={styles.reportText}>Date: {item.tran_date || 'N/A'}</Text>
                <Text style={styles.reportText}>Pre Balance: ₹{item.rem_from_old_bal || 0}</Text>
                <Text style={styles.reportText}>Post Balance: ₹{item.rem_from_new || 0}</Text>
                <Text style={styles.reportText}>Amount: ₹{item.value || 0}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      {showFromDate && (
        <DateTimePicker
          value={fromDate}
          mode="date"
          display="default"
          onChange={onChangeFromDate}
        />
      )}
      {showToDate && (
        <DateTimePicker
          value={toDate}
          mode="date"
          display="default"
          onChange={onChangeToDate}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  datePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  datePickerText: {
    marginRight: 10,
  },
  searchButton: {
    backgroundColor: 'blue',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  reportItem: {
    marginBottom: 10,
  },
  reportText: {
    marginBottom: 5,
  },
});

export default RToRFundReport;
