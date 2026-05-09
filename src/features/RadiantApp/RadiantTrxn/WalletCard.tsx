import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { APP_URLS } from '../../../utils/network/urls';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import LinearGradient from 'react-native-linear-gradient';
import { useNavigation } from '../../../utils/navigation/NavigationService';
import { useFocusEffect } from '@react-navigation/native';
import { decryptData } from '../../../utils/encryptionUtils';

export default function WalletCard({ payIsShow = true }) {
  const { get, post } = useAxiosHook();
  const { colorConfig, IsDealer } = useSelector((state: RootState) => state.userInfo);

  const [totalPickupAmount, setTotalPickupAmount] = useState(0);
  const [forApproval, setForApproval] = useState('');
  const [requestid, setRequestid] = useState<string[]>([]);
  const [ceId, setCeId] = useState<string | null>(null);

  const [walletData, setWalletData] = useState({
    remainbal: 0,
    posremain: 0,
  });


  const [selectedAmount, setSelectedAmount] = useState(0);

  const fetchData = async () => {
    try {
      await fetchWalletData();
      await fetchPickupReport();
      await fetchRemainBalance();
    } catch (error) {
      console.error("❌ Error fetching wallet or payment data:", error);
    }
  };

  // 🔹 Fetch wallet balance (Main & POS)
  const fetchWalletData = async () => {
    const dealerBalurl = APP_URLS.getUserInfo;
    const response = await get({
      url: IsDealer ? dealerBalurl : APP_URLS.balanceInfo,
    });

    console.log("📦 Wallet response:", response);

    if (response?.data) {
      if (IsDealer) {
        const { kkkk, vvvv, adminfarmname, posremain, remainbal, frmanems } = response.data;

        const decryptedData = {
          adminfarmname: decryptData(kkkk, vvvv, adminfarmname),
          posremain1: decryptData(kkkk, vvvv, posremain),
          remainbal1: decryptData(kkkk, vvvv, remainbal),
          frmanems: decryptData(kkkk, vvvv, frmanems),
        };

        console.log("🔐 Dealer Wallet Data:", decryptedData);

        setWalletData({
          remainbal: decryptedData.remainbal1 || 0,
          posremain: decryptedData.posremain1 || 0,
        });
      } else {
        const data = Array.isArray(response.data) ? response.data[0] : response.data;

        setWalletData({
          remainbal: data?.remainbal || 0,
          posremain: data?.posremain || 0,
        });
      }
    }
  };

  const fetchPickupReport = async () => {
    const res = await post({ url: APP_URLS.CashpickupInprocessReport });

    console.log("📊 Pickup report response:", res);

    if (Array.isArray(res?.Content) && res.Content.length > 0) {
      let totalPickup = 0;
      let totalPaid = 0;

      res.Content.forEach((item) => {
        totalPickup += Number(item.pickup_amount) || 0;
        totalPaid += Number(item.Amountpaid) || 0;
      });

      const currentDuePayment = Math.max(totalPickup - totalPaid, 0);

      setTotalPickupAmount(currentDuePayment);
      setRequestid(res.Content.map((item: any) => item.Requestid));
      setCeId(res.Content[0]?.ceId ?? null);
    } else {
      setTotalPickupAmount(0);
      setRequestid([]);
      setCeId(null);
    }
  };

  // 🔹 Fetch pending approval amount
  const fetchRemainBalance = async () => {
    const res2 = await post({ url: APP_URLS.CashpickupRemainBal });

    console.log("🧾 Remain balance response:", res2);

    const remain = res2?.Content?.ADDINFO?.remain;

    if (remain !== undefined && remain !== null) {
      console.log("✅ Pending Approval Amount:", remain);
      setForApproval(remain);
      setSelectedAmount(remain)
    } else {
      console.log("⚠️ No pending approval amount found.");
      setForApproval('');
    }
  };


  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );


  const colors = ['#f7405f', 'black', colorConfig.labelColor];
  const [colorIndex, setColorIndex] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setColorIndex(prev => (prev + 1) % colors.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [])

  const navigation = useNavigation();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: `${colorConfig.secondaryColor}33`,
        },
      ]}
    >

      <View style={styles.absoluteBox}>
        <View style={[styles.walletBox,
        { backgroundColor: `${colorConfig.secondaryColor}80` }
        ]}>
          <View style={styles.walletRow}>
            <View>
              <Text style={styles.label}>Main Wallet</Text>
              <Text style={styles.amount}>{walletData.remainbal}</Text>
            </View>
            <View>
              <Text style={styles.label}>Pos Wallet</Text>
              <Text style={[styles.amount, { textAlign: 'right' }]}>{walletData.posremain}</Text>
            </View>
          </View>

          <LinearGradient
            colors={[colorConfig.primaryColor, colorConfig.secondaryColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.paymentBox}
          >
            <View style={styles.dueBox}>
              <Text style={styles.dueLabel}>Current Due Payment</Text>

              <Text style={styles.dueAmount}>₹ {forApproval}</Text>
            </View>

            {payIsShow && <TouchableOpacity
              style={styles.earnButton}
              onPress={() => {
                navigation.navigate('Totalpayreport', {
                  selectedAmount,
                  requestid,
                  PaymentMode: 'GroupPay',
                  ceId,
                });
              }}
              disabled={forApproval <= 0} // Disable button if no due payment
            >
              <Text style={styles.buttonText}>Pay Now</Text>
            </TouchableOpacity>}
          </LinearGradient>
          {forApproval > 0 && (
            <Text style={[styles.NoteText, { color: colors[colorIndex] }]}>
              Note:- Amount Deposited, Pending for Approval
              <Text style={{ fontWeight: 'bold', color: colors[colorIndex] }}>
                ₹ {forApproval}.0
              </Text>
            </Text>
          )}

        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: hScale(10),
    width: '100%',
    backgroundColor: 'green'
  },

  absoluteBox: {
    width: '100%',
    zIndex: 3,
    paddingHorizontal: wScale(10),
  },
  walletBox: {
    borderRadius: wScale(16),
    paddingHorizontal: wScale(10),
    paddingVertical: hScale(10),
  },
  walletRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hScale(5),
  },
  label: {
    color: '#fff',
    fontSize: wScale(14),
  },
  amount: {
    color: '#fff',
    fontSize: wScale(18),
    fontWeight: 'bold',
  },
  paymentBox: {
    flexDirection: 'row',
    borderRadius: wScale(15),
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hScale(5),
    paddingHorizontal: wScale(15),
  },
  dueBox: {
    flex: 1,
  },
  dueLabel: {
    color: '#fff',
    fontSize: wScale(12),
    marginBottom: hScale(2),
  },
  dueAmount: {
    fontSize: wScale(24),
    color: '#fff',
  },
  earnButton: {
    backgroundColor: '#000',
    borderRadius: wScale(20),
    paddingVertical: hScale(8),
    paddingHorizontal: wScale(16),
    marginLeft: wScale(10),
    opacity: 1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: wScale(14),
    textTransform: 'uppercase',
    letterSpacing: 2,
    paddingVertical: hScale(3),
  },
  NoteText: {
    color: '#000',
    fontSize: wScale(13),
    textTransform: 'capitalize',
    paddingTop: hScale(5),
    textAlign: 'center',
  },
});
