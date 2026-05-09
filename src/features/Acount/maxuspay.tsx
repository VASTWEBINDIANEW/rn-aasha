import React, { useState, useEffect } from 'react';
import useAxiosHook from "../../utils/network/AxiosClient";
import { APP_URLS } from "../../utils/network/urls";
import { View, Text, StyleSheet, useColorScheme, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from "react-native";
import { hScale, wScale } from '../../utils/styles/dimensions';
import { useSelector } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import { translate } from '../../utils/languageUtils/I18n';
import AppBar from '../drawer/headerAppbar/AppBar';
import AppBarSecond from '../drawer/headerAppbar/AppBarSecond';
import DateRangePicker from '../../components/DateRange';
import LinearGradient from 'react-native-linear-gradient';
import { BottomSheet } from '@rneui/themed';
import NoDatafound from '../drawer/svgimgcomponents/Nodatafound';

const CommissionReport = () => {
  const { colorConfig, userId } = useSelector((state: RootState) => state.userInfo)
  const { get, post } = useAxiosHook()
  const color1 = `${colorConfig.secondaryColor}20`
  const colorScheme = useColorScheme();
  const [selectedDate, setSelectedDate] = useState({
    from: new Date().toISOString().split('T')[0],
    to: new Date().toISOString().split('T')[0],
  });
  const [days, setDays] = useState([])
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  let type;
  const [statemodalvisible, setstatemodalvisible] = useState(false)

  const [daywisecomm, setdaywisecomm] = useState([])
  const [selecteditem, setselecteditem] = useState("Daywise Commission")
  const [daywisecommsofuser, setdaywisecommsofuser] = useState([])
  const [extardaywisecomms, setextardaywisecomms] = useState([])
  const [isloading, setisloading] = useState(false)



  const typevalues = ["Daywise Commission", "Day wise commission of user slab", "Extracomm Report"]





  const isDarkTheme = colorScheme === 'dark';
  const styles = getStyles(isDarkTheme);




  const daywisecomms = async (from, to, selected) => {
    setisloading(true)
    try {
      const url1 = `${APP_URLS.daywisecomms}`;
      const url2 = `${APP_URLS.ExtracommReport}?txt_frm_date=${from}&txt_to_date=${to}&userid=${userId}`;
      const url3 = `${APP_URLS.daywisecommsofuser}?role=Retailer&userid=${userId}`;
      console.log("%%%%%%", url2, url1, url3)
      const url = selected == "Daywise Commission" ? url1 : selected == "Day wise commission of user slab" ? url3 : selected == "Extracomm Report" ? url2 : '';

      const response = await get({ url });

      console.log(response, "ggggg")
      if (selected == "Daywise Commission") {

        setdaywisecomm(response);


      } else if (selected == "Day wise commission of user slab") {

        setdaywisecommsofuser([response]);
        setisloading(false)


      } else {
        setextardaywisecomms(response.data);
      }
      setisloading(false)
      console.log(extardaywisecomms, "RRRRR")

    } catch (error) {

    }

  }

  useEffect(() => {
    // console.log("IIIIIIIIIII", (selectedDate.from).toISOString().split("T")[0], (selectedDate.to).toISOString().split("T")[0], selecteditem)

    daywisecomms(selectedDate.from, selectedDate.to, selecteditem)
    console.log("fhdjf", selectedDate.from, selectedDate.to, selecteditem)

  }, [])




  const renderItems = (item) => {
    return item ? (
      <View
        style={{
          backgroundColor: "#fff",
          margin: 12,
          padding: 20,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: "#ddd",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 5,
          width: 340,
          alignSelf: "center",
        }}
      >
        {/* Header */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#0d47a1",
            marginBottom: 14,
            textAlign: "center",
            borderBottomWidth: 1,
            borderColor: "#e0e0e0",
            paddingBottom: 6,
          }}
        >
          📋 User Info
        </Text>

        {/* Details */}
        <Text style={{ fontSize: 16, color: "#444", marginBottom: 10 }}>
          🆔 ID No:{" "}
          <Text style={{ fontWeight: "bold", color: "#1565c0" }}>{item.idno}</Text>
        </Text>

        <Text style={{ fontSize: 16, color: "#444", marginBottom: 10 }}>
          🎭 dayscounts :{" "}
          <Text style={{ fontWeight: "bold", color: "#7b1fa2" }}>{item.dayscounts}</Text>
        </Text>

        <Text style={{ fontSize: 16, color: "#444", marginBottom: 10 }}>
          💰 minamount:{" "}
          <Text style={{ fontWeight: "bold", color: "#2e7d32" }}>{item.minamount}</Text>
        </Text>

        <Text style={{ fontSize: 16, color: "#444", marginBottom: 10 }}>
          💰 maxamount:{" "}
          <Text style={{ fontWeight: "bold", color: "#ef6c00" }}>
            {item.maxamount}
          </Text>
        </Text>

        <Text style={{ fontSize: 16, color: "#444", marginBottom: 10 }}>
          📅 insertdate:{" "}
          <Text style={{ fontWeight: "bold", color: "#ef6c00" }}>
            {item.insertdate}
          </Text>
        </Text>

        <Text style={{ fontSize: 16, color: "#444" }}>
          🔄 sts:{" "}
          <Text style={{ fontWeight: "bold", color: "#ef6c00" }}>
            {item.sts ? "True" : "false"}
          </Text>
        </Text>
      </View>
    ) : (
      <NoDatafound />
    );
  };

const renderItems2 = (item) => {
  if (!item) {
    return <NoDatafound />;
  }

  return (
    <View
      style={{
        backgroundColor: "#f9f9fb",
        margin: 12,
        padding: 20,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: "#ddd",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 5,
        width: 340,
        alignSelf: "center",
      }}
    >
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          color: "#0d47a1",
          marginBottom: 16,
          textAlign: "center",
          borderBottomWidth: 1,
          borderColor: "#e0e0e0",
          paddingBottom: 6,
        }}
      >
        📊 Commission Report
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
        <Text style={{ fontSize: 16, color: "#444", width: "50%", marginBottom: 10 }}>
          💰 Commission:{" "}
          <Text style={{ fontWeight: "bold", color: "#1565c0" }}>{item.comm}</Text>
        </Text>

        <Text style={{ fontSize: 16, color: "#444", width: "50%", marginBottom: 10 }}>
          🔄 Remain Pre:{" "}
          <Text style={{ fontWeight: "bold", color: "#ef6c00" }}>{item.remainpre}</Text>
        </Text>

        <Text style={{ fontSize: 16, color: "#444", width: "50%", marginBottom: 10 }}>
          🔄 Remain Post:{" "}
          <Text style={{ fontWeight: "bold", color: "#ef6c00" }}>{item.remainpost}</Text>
        </Text>
      </View>

      <Text
        style={{
          marginTop: 18,
          fontSize: 15,
          fontWeight: "600",
          color: "#555",
          textAlign: "right",
          backgroundColor: "#e3f2fd",
          paddingVertical: 4,
          paddingHorizontal: 10,
          borderRadius: 10,
          alignSelf: "flex-end",
        }}
      >
        📅 {new Date(item.date).toLocaleDateString("en-GB")}
      </Text>
    </View>
  );
};

  const renderItems3 = (item) => {
    console.log(item);
    return item ? (
      <View
        style={{
          backgroundColor: "#fff",
          margin: 12,
          padding: 20,
          borderRadius: 18,
          borderWidth: 1,
          borderColor: "#ddd",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 6,
          elevation: 5,
          width: 340,
          alignSelf: "center",
        }}
      >
        {/* Header */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: "bold",
            color: "#0d47a1",
            marginBottom: 14,
            textAlign: "center",
            borderBottomWidth: 1,
            borderColor: "#e0e0e0",
            paddingBottom: 6,
          }}
        >
          👤 Day wise commission of user slab
        </Text>

        {/* Info Rows */}
        <Text
          style={{
            fontSize: 16,
            color: "#444",
            marginBottom: 10,
          }}
        >
          📧 Email:{" "}
          <Text style={{ fontWeight: "bold", color: "#1565c0" }}>{item.Email}</Text>
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: "#444",
            marginBottom: 10,
          }}
        >
          📱 Mobile:{" "}
          <Text style={{ fontWeight: "bold", color: "#2e7d32" }}>{item.mobile}</Text>
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: "#444",
            marginBottom: 10,
          }}
        >
          🎭 Role:{" "}
          <Text style={{ fontWeight: "bold", color: "#7b1fa2" }}>{item.data.role}</Text>
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: "#444",
            marginBottom: 10,
          }}
        >
          💰 Comm 10001 Max:{" "}
          <Text style={{ fontWeight: "bold", color: "#ef6c00" }}>
            {item.data.Comm_10001_max}
          </Text>
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: "#444",
            marginBottom: 10,
          }}
        >
          💰 Comm 5001-10000:{" "}
          <Text style={{ fontWeight: "bold", color: "#ef6c00" }}>
            {item.data.Comm_5001_10000}
          </Text>
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: "#444",
          }}
        >
          💰 Comm 2000-5000:{" "}
          <Text style={{ fontWeight: "bold", color: "#ef6c00" }}>
            {item.data.Comm_2000_5000}
          </Text>
        </Text>
      </View>
    ) : (
      <NoDatafound />
    );
  };



  // const reprtdata = () => {
  //     if (selecteditem == "Daywise Commission") {
  //         console.log("gjtfig")
  //     }
  //     else if (selecteditem == "Day wise commission of user slab") {

  //     } else if (selecteditem == "Extracomm Report") {

  //     }
  // }

  //     return(


  //               <View style={styles.card2}>
  //               <View style={[styles.card,{backgroundColor:color1}]}>
  //   <View style={styles.dateContainer}>

  //             <View style={styles.dateRow}>

  //               <View style={styles.dateColumn}>

  //                 <Text style={styles.label}>{translate('From Date')}</Text>

  //                 <Text style={styles.datevalue}>{new Date(selectedDate.from).toISOString().split('T')[0]}</Text>

  //               </View>

  //               <View style={styles.dateColumn}>

  //                 <Text style={styles.label}>{translate('Duration')}</Text>

  //                 <Text style={styles.value}>{days.days} Days</Text>

  //               </View>

  //               <View style={styles.dateColumn}>

  //                 <Text style={styles.label}>{translate('To Date')}</Text>

  //                 <Text style={styles.value}>{new Date(selectedDate.to).toISOString().split('T')[0]}</Text>

  //               </View>

  //             </View>

  //           </View>
  //           </View>
  //           </View>
  //     )

  return (
    <View style={styles.main}>

      <AppBarSecond title={"Day Book"} />
      {selecteditem == "Extracomm Report" && <LinearGradient
        colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}>

        <DateRangePicker

          onDateSelected={(from, to) => setSelectedDate({ from, to })}

          SearchPress={(from, to, status) => daywisecomms((selectedDate.from).toISOString().split("T")[0], (selectedDate.to).toISOString().split("T")[0], selecteditem)}

          status={selectedStatus}

          setStatus={setSelectedStatus}

          isStShow={false}

          isshowRetailer={false}
          retailerID={(id) => { console.log(id) }}
        />
      </LinearGradient>}

      <LinearGradient
        style={{ marginHorizontal: 20, marginTop: 15, borderRadius: 15 }}
        colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}>


        <TouchableOpacity onPress={() => { setstatemodalvisible(true) }}>
          <View style={{}}>

            <Text style={{ color: "#fff", fontSize: 25, height: hScale(70), textAlign: 'center', fontWeight: 'bold', textAlignVertical: 'center', marginHorizontal: 10 }}>
              {!selecteditem ? "Day Wise Commission" : selecteditem}
            </Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>

      <View style={{ flex: 1 }} >
        <FlatList
          data={selecteditem == "Day wise commission of user slab" ? daywisecommsofuser : selecteditem == "Daywise Commission" ? daywisecomm : selecteditem == "Extracomm Report" ? extardaywisecomms : null}
          keyExtractor={(item, index) => index.toString()}
          ListEmptyComponent={
            isloading ? <ActivityIndicator size={50} style={{ marginTop: 20 }} /> : null
          }
          renderItem={({ item }) => (
            selecteditem == "Day wise commission of user slab"
              ? renderItems3(item)
              : selecteditem == "Daywise Commission"
                ? renderItems(item)
                : selecteditem == "Extracomm Report"
                  ? renderItems2(item)
                  : null
          )}
        />



      </View>


      <BottomSheet
      animationType='none'
        isVisible={statemodalvisible}
        onBackdropPress={() => setstatemodalvisible(false)}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            paddingVertical: 20,
            paddingHorizontal: 15,
            maxHeight: "100%",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: 0.2,
            shadowRadius: 6,
            elevation: 10,
          }}
        >
          {/* Header */}
          <Text
            style={{
              color: "#0d47a1",
              fontSize: 22,
              fontWeight: "700",
              textAlign: "center",
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderColor: "#e0e0e0",
            }}
          >
            🎯 Select Commission
          </Text>

          {/* FlatList */}
          <FlatList
            data={typevalues}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setselecteditem(item);
                  setstatemodalvisible(false);
                  daywisecomms(selectedDate.from, selectedDate.to, item);
                }}
                style={{
                  marginVertical: 10,
                  borderRadius: 12,
                  backgroundColor: "#f5f5f5",
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: "#ddd",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 3,
                  elevation: 3,
                }}
              >
                <Text
                  style={{
                    color: "#333",
                    fontSize: 18,
                    fontWeight: "500",
                    textAlign: "center",
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </BottomSheet>

    </View>
  )







}

const getStyles = (isDarkTheme) => StyleSheet.create({
  itemText: {
    fontSize: 16,
    color: "#444",
    width: "48%",
    marginBottom: 6,
  },
  valueText: {
    fontWeight: "bold",
  },
  main: {
    flex: 1,
    backgroundColor: isDarkTheme ? '#121212' : '#f0f0f0',
  },
  container: {
    paddingTop: wScale(1),
  },
  bottomcontainer: {
    height: 300,
    backgroundColor: 'white'
  },


});
export default CommissionReport;