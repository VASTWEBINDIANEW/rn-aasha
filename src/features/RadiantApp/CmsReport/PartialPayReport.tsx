import { translate } from "../../../utils/languageUtils/I18n";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { FlashList } from "@shopify/flash-list";
import useAxiosHook from "../../../utils/network/AxiosClient";
import { APP_URLS } from "../../../utils/network/urls";
import { commonStyles } from "../../../utils/styles/commonStyles";
import { hScale, wScale } from "../../../utils/styles/dimensions";
import { useDispatch, useSelector } from "react-redux";
import { setPartialAmounts } from "../../../reduxUtils/store/userInfoSlice";
import { RootState } from "../../../reduxUtils/store";

export default function PartialPayReport({ Shopid, currentAmount }) {
    const { colorConfig, } = useSelector((state: RootState) => state.userInfo);

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const { post } = useAxiosHook();
    const dispatch = useDispatch();

    const dataFetch = async () => {
        try {
            setLoading(true);

            const res = await post({
                url: `${APP_URLS.PartialCashPickupsubmitlist}Shopid=${Shopid}`,
            });

            console.log("PartialAPI Response:🟰🟰🟰🟰🟰🟰🟰🟰🟰", res, Shopid);

            console.log("FULL RESPONSE:", res);
            console.log("ADDINFO🟰🟰🟰:", res?.Content?.ADDINFO);
            setData(res?.Content?.ADDINFO || []);
        } catch (err) {
            console.log("Error:", err);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (Shopid) {
            dataFetch();
        }
    }, [Shopid]);


    const totalAmount = data.reduce((sum, item) => {
        return sum + Number(item.pickup_amount || 0);
    }, 0);
    useEffect(() => {
        dispatch(setPartialAmounts({
            total: totalAmount,
            current: currentAmount
        }));

        return () => {
            dispatch(setPartialAmounts({ total: 0, current: 0 }));
        };
    }, [totalAmount, currentAmount]);
    console.log(totalAmount, currentAmount, '🟰🟰currentAmount');

    const renderItem = ({ item, index }) => (
        <View style={styles.row}>
            {/* <Text style={[styles.cell,styles.count]}>{index + 1}</Text> */}
            <Text style={[styles.cell, styles.amountCell]}>
                ₹{item.pickup_amount}
            </Text>
            <Text style={styles.cell}>{item.shopId}</Text>

            <Text style={styles.cell}>{item.Insertdate}</Text>
        </View>
    );

    return (
        <>
            {data.length > 0 && (

                <View style={commonStyles.screenContainer}>
                    <Text style={styles.title}>{translate("Todays_Partial_Payment")}</Text>

                    <View style={styles.table}>
                        <View style={[styles.row, styles.headerRow, { backgroundColor: `${colorConfig.secondaryColor}33` }]}>
                            {/* <Text style={[styles.cell, styles.headerText,styles.count]}>{translate("SR")}</Text> */}
                            <Text style={[styles.cell, styles.headerText]}>{translate("Amount")}</Text>

                            <Text style={[styles.cell, styles.headerText]}>{translate("Shop_ID")}</Text>
                            <Text style={[styles.cell, styles.headerText]}>{translate("Time")}</Text>

                        </View>

                        <FlashList
                            data={data}
                            renderItem={renderItem}
                            estimatedItemSize={50}
                            keyExtractor={(item, index) => index.toString()}
                            ListEmptyComponent={
                                <Text style={styles.noData}>{translate("No_Data_Found")}</Text>
                            }
                        />
                        <View style={[styles.row, styles.headerRow, { backgroundColor: `${colorConfig.secondaryColor}33` }]}>
                            <Text style={[styles.cell, styles.totleL]}>{translate("Total_Amount")}</Text>
                            <Text style={[styles.cell, styles.headerText, styles.totleL]}>{totalAmount}</Text>
                        </View>

                    </View>

                </View>

            )}
        </>
    );
}

const styles = StyleSheet.create({
    title: {
        textAlign: "center",
        fontWeight: "bold",
        marginVertical: hScale(10),
        fontSize: wScale(16),
    },

    table: {
        borderWidth: .5,
        borderColor: "#000",
    },

    row: {
        flexDirection: "row",
    },

    headerRow: {
        backgroundColor: "#f2f2f2",
    },

    cell: {
        flex: 1,
        textAlign: "center",
        paddingVertical: hScale(5),
        borderWidth: .2,
        borderColor: "#000",
        textAlignVertical: 'center'
    },

    headerText: {
        fontWeight: "bold",
    },

    amountCell: {
    },

    noData: {
        textAlign: "center",
        padding: wScale(10),
    },
    count: {
        flex: 0,
        padding: 15
    },
    totleL: {
        fontWeight: 'bold',
        color: '#000'
    }
});
