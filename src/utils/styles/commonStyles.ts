// styles/common.js
import { StyleSheet } from "react-native";
import { hScale, wScale } from "./dimensions";

export const commonStyles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: "#fff",
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: wScale(10),
        paddingVertical: hScale(10)
    },
    righticon2: {
        position: "absolute",
        left: "auto",
        right: wScale(0),
        top: hScale(0),
        height: "85%",
        alignItems: "flex-end",
        justifyContent: "center",
        paddingRight: wScale(12),
    },
     lotiimg: {
        height: hScale(40),
        width: wScale(40),
    },
});
