import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ImageBackground, ToastAndroid } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import { decryptData } from '../../../utils/encryptionUtils';
import { useFocusEffect } from '@react-navigation/native';
import ShowLoaderBtn from '../../../components/ShowLoaderBtn';
import { useDispatch } from 'react-redux';
import { setCmsAddMFrom } from '../../../reduxUtils/store/userInfoSlice';

export default function CmsQrAddMoney() {
  const navigation = useNavigation();
  const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);
  const { get } = useAxiosHook();
const [loading, setLoading] = useState(true); // 👈 add this
  const [amount, setAmount] = useState("");

  const [walletData, setWalletData] = useState({
    remainbal: 0,
    posremain: 0,
  });


  const dispatch = useDispatch();
 


 const fetchWalletData = async () => {
  try {
    setLoading(true); // 👈 start loader
    const dealerBalurl = APP_URLS.getUserInfo;

    const response = await get({
      url: IsDealer ? dealerBalurl : APP_URLS.balanceInfo,
    });

    if (response?.data) {
      if (IsDealer) {
        const { kkkk, vvvv, posremain, remainbal } = response.data;
        const decrypted = {
          remainbal1: decryptData(kkkk, vvvv, remainbal),
          posremain1: decryptData(kkkk, vvvv, posremain),
        };
        setWalletData({
          remainbal: Number(decrypted.remainbal1) || 0,
          posremain: Number(decrypted.posremain1) || 0,
        });
      } else {
        const data = Array.isArray(response.data)
          ? response.data[0]
          : response.data;
        setWalletData({
          remainbal: Number(data?.remainbal || 0),
          posremain: Number(data?.posremain || 0),
        });
      }
    }
  } catch (error) {
    console.error("❌ Wallet Fetch Error:", error);
  } finally {
    setLoading(false); // 👈 stop loader (success ya error dono me)
  }
};
  const inputRef = useRef(null);



  useFocusEffect(
    useCallback(() => {
      setAmount('');
      fetchWalletData();
    }, [])
  );
  const handleAddMoney = () => {
    if (!amount) {
      ToastAndroid.show("Please enter amount", ToastAndroid.SHORT);
      inputRef.current?.focus();   

      return;
    }
    dispatch(setCmsAddMFrom("PageA"));
    navigation.navigate("AddMoneyOptions", { amount, paymentMode: 'UPI', });
  };

  return (
    <ImageBackground source={require('../../../../assets/images/CmsAddMoneyBg.jpeg')}
      imageStyle={styles.borderRadius}
    >
      <View
        style={[
          styles.container, styles.borderRadius,
          { backgroundColor: `${colorConfig.secondaryColor}33` },
        ]}
      >
        <View style={styles.box}>

          {/* 🔹 WALLET BALANCE VIEW */}
          <View style={styles.walletRow}>
            <View style={
              styles.rowView
            }>
              <Text style={styles.label}>Main Wallet</Text>
             {loading ? (
  <ShowLoaderBtn color='#000' />
) : (
  <Text style={styles.amount}>{walletData.remainbal}</Text>
)}
            </View>

            <View>
              <Text style={styles.label}>POS Wallet</Text>
              <Text style={[styles.amount, { textAlign: "right" }]}>
                {walletData.posremain}
              </Text>
            </View>
          </View>

          {/* 🔹 INPUT + BUTTON */}
          <LinearGradient
            colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.actionBox}
          >
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Enter Amount</Text>

              <View style={styles.inputRow}>
                <Text style={styles.rupee}>₹</Text>

                <TextInput
                  ref={inputRef}             // 👈 Attach ref here

                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#ddd"
                  style={styles.input}
                  cursorColor={'#fff'}
                  maxLength={6}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddMoney}
            >
              <Text style={styles.btnText}>Add Money</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingVertical: hScale(10),
    width: "100%",
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10
  },
  borderRadius: {

    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10
  },

  box: {
    width: "100%",
    paddingHorizontal: wScale(10),
  },

  walletRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    // backgroundColor: "#0003",
    padding: wScale(12),
    borderRadius: wScale(12),
    paddingTop: 0
  },

  label: {
    color: "#000",
    fontSize: wScale(14),
  },

  amount: {
    color: "#000",
    fontSize: wScale(20),
    fontWeight: "bold",
  },

  actionBox: {
    flexDirection: "row",
    paddingVertical: hScale(10),
    paddingHorizontal: wScale(12),
    borderRadius: wScale(15),
    alignItems: "center",
    justifyContent: "space-between",
  },

  inputBox: { flex: 1 },

  inputLabel: {
    color: "#fff",
    fontSize: wScale(13),
    marginBottom: hScale(4),
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  rupee: {
    fontSize: wScale(24),
    color: "#fff",
    marginRight: 5,
  },

  input: {
    borderBottomWidth: .5,
    borderColor: "#fff",
    color: "white",
    fontSize: wScale(22),
    paddingVertical: 2,
    borderStyle: 'dotted',
    minWidth: 50,
    maxWidth: 100
  },

  addButton: {
    backgroundColor: "#000",
    paddingVertical: hScale(12),
    paddingHorizontal: wScale(16),
    borderRadius: wScale(120),
    marginLeft: wScale(12),
  },

  btnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: wScale(18),
    textTransform: 'uppercase'
  },
  rowView: {
    alignItems: 'flex-start'
  },
});
