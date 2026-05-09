import { translate } from "../../../utils/languageUtils/I18n";
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BusCom = () => {
  return (
    <View style={styles.container}>
      <Text>{translate("BusCom_Component")}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BusCom;
