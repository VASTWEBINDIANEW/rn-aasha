import React, { useEffect, useState } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import useAxiosHook from "../../utils/network/AxiosClient";
import { APP_URLS } from "../../utils/network/urls";
import { useSelector } from "react-redux";
import { hScale, wScale } from "../../utils/styles/dimensions";
import AppBarSecond from "../drawer/headerAppbar/AppBarSecond";
import Icon from "react-native-vector-icons/Ionicons";
import { translate } from "../../utils/languageUtils/I18n";

const BusBookReport = () => {
  const [transactions, setTransactions] = useState([]);
  const [present, setPresent] = useState(10);
  const [selectedFilter, setSelectedFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const { get, post } = useAxiosHook();
  const { userId } = useSelector((state) => state.userInfo);
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split("T")[0];

  useEffect(() => {
    recentTransactions();
  }, [selectedFilter]);

  const recentTransactions = async () => {
    try {
      setLoading(true);
      const url = `${APP_URLS.BusBookingReport}pageindex=${present}&pagesize=500&txt_frm_date=2022-12-05&txt_to_date=${formattedDate}&ddl_status=${selectedFilter}`;
      console.log(url);

      const response = await post({ url: url });
      console.log("BusBookReport", response["Content"]["ADDINFO"]["Data"]);

      const transactionsData = response["Content"]["ADDINFO"]["Data"] || [];
      setTransactions(transactionsData);

      if (transactionsData.length === 0) {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
      setLoading(false);
    } finally {
      if (transactions.length > 0) {
        setLoading(false);
      }
    }
  };

  const handleLoadMore = () => {
    setPresent((prev) => prev + 10);
  };

  const TransactionDetails = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.tileHeader}>
          <View style={styles.tileTitle}>
            <Text
              style={styles.text}
            >{`AirlineName: ${item.AirlineName}`}</Text>
            <Text style={styles.textBold}>{`PNR: ${item.PNR}`}</Text>
            <Text style={styles.text}>{`Offer Fare: ${item.OfferedFare}`}</Text>
            <Text
              style={styles.text}
            >{`TicketStatus: ${item.TicketStatus == "" ? "Ticket Status Not available" : item.TicketStatus}`}</Text>
            <Text style={styles.text}>{`TicketDate: ${item.TicketDate}`}</Text>
            <Text style={styles.text}>{`TraceId: ${item.TraceId}`}</Text>
            <Text style={styles.text}>{`Email: ${item.Email}`}</Text>

            <Text style={styles.text}>{`transaction_id: ${item.reqid}`}</Text>
            <Text style={styles.text}>{`FareAmount: ${item.FareAmount}`}</Text>
            <Text
              style={styles.text}
            >{`PassengerName: ${item.PassengerName === "" ? "No Name" : item.PassengerNam}`}</Text>

            <Text style={styles.text}>{`Pre Balance: ${item.RemPre}`}</Text>
            <Text style={styles.text}>{`Pre Balance: ${item.RemPost}`}</Text>
            <Text style={styles.text}>{`Gst: ${item.RemGst}`}</Text>
            <Text style={styles.text}>{`TDS: ${item.RemTDS}`}</Text>
            <Text style={styles.text}>{`My Earn: ${item.Retailer_comm}`}</Text>
          </View>
          <View style={styles.tileStatus}>
            <Icon
              name={
                item.status === "Success" || item.status === "SUCCESS"
                  ? "checkmark-circle"
                  : item.status === "Proccessed"
                    ? "time"
                    : item.status === "Failed" || item.status === "FAILED"
                      ? "close-circle"
                      : "cash"
              }
              size={14}
              color={
                item.status === "Success" || item.status === "SUCCESS"
                  ? "green"
                  : item.status === "Proccessed"
                    ? "yellow"
                    : item.status === "Failed" || item.status === "FAILED"
                      ? "red"
                      : "orange"
              }
            />
            <Text style={styles.text}>{item.status}</Text>
            <Text style={styles.textBold}>{`\u{20B9} ${item.amount}`}</Text>
          </View>
        </View>
      </View>
    );
  };

  const Options = () => {
    const buttonData = [
      { title: translate("All"), key: "ALL" },
      { title: translate("Success"), key: "Success" },
      { title: translate("Failed"), key: "Failed" },
      { title: translate("Pending"), key: "Pending" },
    ];

    const handlePress = async (key) => {
      setSelectedFilter(key);
      console.log(`Selected Filter: ${key}`);
      recentTransactions();
    };

    return (
      <View style={styles.row}>
        {buttonData.map((button) => (
          <TouchableOpacity
            key={button.key}
            style={[
              styles.button,
              {
                backgroundColor:
                  selectedFilter === button.key ? "green" : "lightgreen",
              },
            ]}
            onPress={() => handlePress(button.key)}
          >
            <Text style={styles.buttonText}>{button.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppBarSecond title="Bus Booking Report" />
      <Options />
      {loading ? (
        <ActivityIndicator size="large" color="green" />
      ) : transactions.length === 0 ? (
        <Text style={styles.noDataText}>{translate("No_data_found")}</Text>
      ) : (
        <FlatList
          data={transactions.slice(0, present)}
          renderItem={({ item }) => <TransactionDetails item={item} />}
          keyExtractor={(item, index) => index.toString()}
          ListFooterComponent={
            transactions.length > present ? (
              <TouchableOpacity
                style={styles.loadMoreButton}
                onPress={handleLoadMore}
              >
                <Text style={styles.loadMoreText}>{translate("Load_More")}</Text>
              </TouchableOpacity>
            ) : null
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: hScale(16),
    marginBottom: hScale(16),
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: hScale(17),
  },
  button: {
    flex: 1,
    marginHorizontal: hScale(5),
    paddingVertical: hScale(17),
    borderRadius: hScale(5),
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: hScale(17),
  },
  loadMoreButton: {
    backgroundColor: "gray",
    padding: 10,
    alignItems: "center",
    marginVertical: hScale(16),
    borderRadius: 5,
  },
  loadMoreText: {
    color: "white",
  },
  tileHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 4,
    backgroundColor: "lightgray",
  },
  tileTitle: {
    flex: 1,
  },
  tileStatus: {
    flex: 1,
    alignItems: "flex-end",
  },
  text: {
    fontSize: 12,
  },
  textBold: {
    fontSize: 12,
    fontWeight: "bold",
  },
  noDataText: {
    textAlign: "center",
    marginVertical: hScale(20),
    fontSize: hScale(16),
    color: "red",
  },
});

export default BusBookReport;
