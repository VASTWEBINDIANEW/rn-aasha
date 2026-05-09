import { translate } from "../../utils/languageUtils/I18n";
import React, { useState } from "react";
import {
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    FlatList,
} from "react-native";
import FlotingInput from "../../features/drawer/securityPages/FlotingInput";
import ClosseModalSvg2 from "../../features/drawer/svgimgcomponents/ClosseModal2";
import { hScale, wScale } from "../../utils/styles/dimensions";
import { useSelector } from "react-redux";
import { RootState } from "../../reduxUtils/store";
import { commonStyles } from "../../utils/styles/commonStyles";
import OnelineDropdownSvg from "../../features/drawer/svgimgcomponents/simpledropdown";

type Props = {
    label: string;
    value: string;
    data: string[];
    onSelect: (item: string) => void;
};

const DropdownInput: React.FC<Props> = ({
    label,
    value,
    data,
    onSelect,
}) => {
    const [visible, setVisible] = useState(false);

    const { colorConfig } = useSelector((status: RootState) => status.userInfo)

    return (
        <>
            {/* Input */}
            <TouchableOpacity onPress={() => setVisible(true)}>
                <FlotingInput label={label} value={value} editable={false} />
                <View style={commonStyles.righticon2}>
                    <OnelineDropdownSvg />
                </View>
            </TouchableOpacity>

            {/* Dropdown Modal */}
            <Modal transparent visible={visible} animationType="fade">

                <TouchableOpacity
                    style={styles.overlay}
                    onPress={() => setVisible(false)}
                >


                    <View style={styles.container}>
                        <TouchableOpacity style={[styles.header, { backgroundColor: `${colorConfig.secondaryColor}33` }]}>
                            <Text style={styles.title}>{translate("Select_Your_Payment_Mode")}</Text>
                            <TouchableOpacity onPress={() => setVisible(false)}
                            >
                                <ClosseModalSvg2 size={35}/>
                            </TouchableOpacity>
                        </TouchableOpacity>
                        <FlatList
                            data={data}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.item}
                                    onPress={() => {
                                        onSelect(item);
                                        setVisible(false);
                                    }}
                                >
                                    <Text style={styles.text}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </>
    );
};

export default DropdownInput;

export const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.3)",
        justifyContent: "center",
        paddingHorizontal: wScale(20),
        paddingVertical:hScale(10),
        
    },
    container: {
        backgroundColor: "#fff",
        borderRadius: 15,
        maxHeight: "60%",
        paddingBottom:hScale(15)
    },
    item: {
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    text: {
        fontSize: 16,
        color:'#000'
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: wScale(10),
        borderTopLeftRadius: hScale(15),
        borderTopRightRadius: hScale(15),
        paddingVertical: hScale(5),
    },
    title: {
        fontSize: wScale(20),
        fontWeight: "bold",
        color: "#000",
        textAlign: 'center',
        flex: 1
    },
});
