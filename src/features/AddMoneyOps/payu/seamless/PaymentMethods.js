import React, { useState, useEffect } from 'react';
import { View, Text, SafeAreaView } from 'react-native';
import { TabView, SceneMap } from 'react-native-tab-view';
import CCDC from './CCDC';
import NetBanking from './NetBanking';
import UPISeamless from './UPISeamless';
import Emi from './Emi';
import NoCostEmi from './NoCostEmi';
import CashCard from './CashCard';
import Wallets from './Wallets';  

const PaymentMethods = ({ route, navigation }) => {
  const [index, setIndex] = useState(0); // Active Tab index
  const [routes] = useState([
    // { key: 'ccdc', title: 'CCDC' },
    // { key: 'netBanking', title: 'Net Banking' },
    { key: 'upi', title: 'UPI' },
    // { key: 'wallets', title: 'Wallets' },
    // { key: 'emi', title: 'Emi' },
    // { key: 'noCostEmi', title: 'NoCostEmi' },
    // { key: 'cashCard', title: 'CashCard' }
  ]);

  useEffect(() => {


    console.log(route,'UPI')
    navigation.setOptions({
      title: `Key: ${route.params.merchantKey} | Amount: ${route.params.amount}`,
    });
  }, [route.params.merchantKey, route.params.amount]);

  const data = {
    ...route.params,
    navigation
  };

  const renderScene = SceneMap({
    // ccdc: () => <CCDC {...data} />,
    // netBanking: () => <NetBanking {...data} />,
    upi: () => <UPISeamless {...data} />,
    // wallets: () => <Wallets {...data} />,
    // emi: () => <Emi {...data} />,
    // noCostEmi: () => <NoCostEmi {...data} />,
    // cashCard: () => <CashCard {...data} />,
  });

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: 300 }} 
      />
    </SafeAreaView>
  );
};

export default PaymentMethods;
