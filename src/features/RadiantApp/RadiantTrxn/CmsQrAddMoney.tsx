import React, { useCallback, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, ImageBackground, ToastAndroid,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import { decryptData } from '../../../utils/encryptionUtils';
import { useFocusEffect } from '@react-navigation/native';
import ShowLoaderBtn from '../../../components/ShowLoaderBtn';
import { setCmsAddMFrom } from '../../../reduxUtils/store/userInfoSlice';

// ─── Wallet Card ────────────────────────────────────────────────────────────
const WalletCell = ({ label, value, loading, align }: {
  label: string; value: number; loading: boolean;
  align: 'flex-start' | 'center' | 'flex-end';
}) => (
  <View style={[styles.walletCell, { alignItems: align }]}>
    <Text style={styles.label}>{label}</Text>
    {loading ? <ShowLoaderBtn color="#000" /> : <Text style={styles.amount}>₹{value}</Text>}
  </View>
);

// ─── Main Component ──────────────────────────────────────────────────────────
export default function CmsQrAddMoney() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);
  const { get } = useAxiosHook();

  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');

  const [walletData, setWalletData] = useState({
    remainbal: 0,
    posremain: 0,
    holdandleanbal: 0,
    cmsremainbal: 0,
  });

  const inputRef = useRef<TextInput>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const response = await get({
        url: IsDealer ? APP_URLS.getUserInfo : APP_URLS.balanceInfo,
      });

      if (response?.data) {
        if (IsDealer) {
          const { kkkk, vvvv, posremain, remainbal, holdandleanbal, cmsremainbal } = response.data;
          setWalletData({
            remainbal: Number(decryptData(kkkk, vvvv, remainbal)) || 0,
            posremain: Number(decryptData(kkkk, vvvv, posremain)) || 0,
            holdandleanbal: Number(holdandleanbal) || 0,
            cmsremainbal: Number(cmsremainbal) || 0,
          });
        } else {
          const data = Array.isArray(response.data) ? response.data[0] : response.data;
          setWalletData({
            remainbal: Number(data?.remainbal) || 0,
            posremain: Number(data?.posremain) || 0,
            holdandleanbal: Number(data?.holdandleanbal) || 0,
            cmsremainbal: Number(data?.cmsremainbal) || 0,
          });
        }
      }
    } catch (error) {
      console.error('❌ Wallet Fetch Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setAmount('');
      fetchWalletData();
    }, [])
  );

  // ── Add Money ──────────────────────────────────────────────────────────────
  const handleAddMoney = () => {
    if (!amount) {
      ToastAndroid.show('Please enter amount', ToastAndroid.SHORT);
      inputRef.current?.focus();
      return;
    }
    dispatch(setCmsAddMFrom('PageA'));
    navigation.navigate('AddMoneyOptions', { amount, paymentMode: 'UPI' });
  };

  const walletItems = [
    { label: 'Main Wallet', value: walletData.remainbal, align: 'flex-start' },
    { label: 'POS Wallet', value: walletData.posremain, align: 'center' },
    { label: 'Hold & Lean', value: walletData.holdandleanbal, align: 'center' },
    { label: 'CMS Wallet', value: walletData.cmsremainbal, align: 'flex-end' },
  ] as const;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <ImageBackground
      source={require('../../../../assets/images/CmsAddMoneyBg.jpeg')}
      imageStyle={styles.borderRadius}
    >
      <View
        style={[
          styles.container,
          styles.borderRadius,
          { backgroundColor: `${colorConfig.secondaryColor}33` },
        ]}
      >
        <View style={styles.box}>

          {/* 🔹 WALLET BALANCE — single row */}
          <View style={styles.walletGrid}>
            {walletItems.map((item, i) => (
              <WalletCell
                key={i}
                label={item.label}
                value={item.value}
                loading={loading}
                align={item.align}
              />
            ))}
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
                  ref={inputRef}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#ddd"
                  style={styles.input}
                  cursorColor="#fff"
                  maxLength={6}
                />
              </View>
            </View>

            <TouchableOpacity style={[styles.addButton,{backgroundColor:!amount ? 'rgba(0, 0, 0, 0.5)' : '#000'}]} onPress={handleAddMoney}>
              <Text style={styles.btnText}>Add Money</Text>
            </TouchableOpacity>
          </LinearGradient>

        </View>
      </View>
    </ImageBackground>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  borderRadius: {
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  container: {
    alignItems: 'center',
    paddingVertical: hScale(10),
    width: '100%',
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
  },
  box: {
    width: '100%',
    paddingHorizontal: wScale(10),
  },

  // 2×2 wallet grid
  walletGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: hScale(8),
    paddingHorizontal: wScale(8),
  },
  walletCell: {
    alignItems: 'center',   // center ya 'flex-start' apne hisab se
    flex: 1,
  },
  walletRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hScale(4),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#0002',
  },


  label: {
    color: '#000',
    fontSize: wScale(12),
    opacity: 0.7,
  },
  amount: {
    color: '#000',
    fontSize: wScale(16),
    fontWeight: 'bold',
  },

  // Input + button row
  actionBox: {
    flexDirection: 'row',
    paddingVertical: hScale(10),
    paddingHorizontal: wScale(12),
    borderRadius: wScale(15),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputBox: { flex: 1 },
  inputLabel: {
    color: '#fff',
    fontSize: wScale(13),
    marginBottom: hScale(4),
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rupee: {
    fontSize: wScale(24),
    color: '#fff',
    marginRight: 5,
  },
  input: {
    borderBottomWidth: 0.5,
    borderColor: '#fff',
    borderStyle: 'dotted',
    color: 'white',
    fontSize: wScale(22),
    paddingVertical: 2,
    minWidth: 50,
    maxWidth: 100,
  },
  addButton: {
    backgroundColor: '#000',
    paddingVertical: hScale(12),
    paddingHorizontal: wScale(16),
    borderRadius: wScale(120),
    marginLeft: wScale(12),
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: wScale(18),
    textTransform: 'uppercase',
  },
});