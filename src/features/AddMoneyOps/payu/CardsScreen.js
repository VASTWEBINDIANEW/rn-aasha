/* eslint-disable react-native/no-inline-styles */
import React, { useState, useLayoutEffect, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Button,
  ScrollView,
  NativeModules,
} from 'react-native';

import PayUSdk from 'payu-core-pg-react';

import { DELETE_USER_CARD, EDIT_USER_CARD, getWebHash, GET_USER_CARDS, SAVE_USER_CARD } from './utils';

const CardsScreen = ({ route, navigation }) => {
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={() => onApiCall('get_user_cards')}
          title="Load Cards"
        />
      ),
    });
  });

  const [cardToken, setCardToken] = useState('42f397338c77032143d16');
  const [cardName, setCardName] = useState('Test');
  const [cardMode, setCardMode] = useState('CC');
  const [cardType, setCardType] = useState('CC');
  const [cardNumber, setCardNumber] = useState('5123456789012346');
  const [nameOnCard, setNameOnCard] = useState('Nitesh Jindal');
  const [expiryMonth, setExpiryMonth] = useState('10');
  const [expiryYear, setExpiryYear] = useState('2022');
  const [cards, setCards] = useState([]);

  // useEffect(() => {
  //   onApiCall('get_user_cards');
  // }, []);

  const setCardData = (data) => {
    setCardToken(data.cardToken);
    setCardName(data.cardName);
    setCardMode(data.cardMode);
    setCardType(data.cardType);
    setCardNumber(data.cardNo);
    setNameOnCard(data.nameOnCard);
    setExpiryMonth(data.expiryMonth);
    setExpiryYear(data.expiryYear);
  };

  const onApiCall = async (feature) => {
    let { merchantKey, salt, isSandbox, userCredentials, environment } = route.params;
    let requestData = {
      key: merchantKey,
      isSandbox,
      environment,
      salt,
    };

    try {
      if (feature === 'get_user_cards') {
        requestData = {
          ...requestData,
          userCredentials: userCredentials,
          command: GET_USER_CARDS
        }
     
        const options = await PayUSdk.getUserCards({
          ...requestData,
          hash: getWebHash(requestData)
        });
        Alert.alert('Response', JSON.stringify(options));
        if(options.responseStatus && options.responseStatus?.a === 'SUCCESS'){
          if(options.storedCards && options.storedCards.length > 0){
            setCards(options.storedCards);
          }
        }
      } else if (feature === 'save_user_card') {
        requestData = {
          ...requestData,
          userCredentials: userCredentials,
          cardToken: cardToken,
          cardName: cardName,
          cardMode: cardMode,
          cardType: cardType,
          nameOnCard: nameOnCard,
          cardNo: cardNumber,
          expiryMonth: expiryMonth,
          expiryYear: expiryYear,
          command: SAVE_USER_CARD
        }
        const response = await PayUSdk.saveUserCard({
          ...requestData,
          hash: getWebHash(requestData)
        });

        Alert.alert('Success', JSON.stringify(response));
      } else if (feature === 'edit_user_card') {
        // requestData = {
        //   ...requestData,
        //   var1: userCredentials,
        //   var2: cardToken,
        //   var3: cardName,
        //   var4: cardMode,
        //   var5: cardType,
        //   var6: nameOnCard,
        //   var7: cardNumber,
        //   var8: expiryMonth,
        //   var9: expiryYear,
        //   command: EDIT_USER_CARD
        // }

        requestData = {
          ...requestData,
          userCredentials: userCredentials,
          cardToken: cardToken,
          cardName: cardName,
          cardMode: cardMode,
          cardType: cardType,
          nameOnCard: nameOnCard,
          cardNo: cardNumber,
          expiryMonth: expiryMonth,
          expiryYear: expiryYear,
          command: EDIT_USER_CARD
        }

        const response = await PayUSdk.editUserCard({
          ...requestData,
          hash: getWebHash(requestData)
        });
        Alert.alert('Success', JSON.stringify(response));
      } else if (feature === 'delete_user_card') {
        requestData = {
          ...requestData,
          userCredentials: userCredentials,
          cardToken: cardToken,
          command: DELETE_USER_CARD
        }
        const response = await PayUSdk.deleteStoredCard({
          ...requestData,
          hash: getWebHash(requestData)
        });
        Alert.alert('Success', JSON.stringify(response));
      }
    } catch (error) {
      Alert.alert('Error', JSON.stringify(error));
    }
  };
  return (
    <View style={styles.container}>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        <View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              paddingBottom: 16,
            }}
          >
            <Button title="Save" onPress={() => onApiCall('save_user_card')} />
            <Button
              title="Edit"
              onPress={() => {
                onApiCall('edit_user_card');
              }}
            />
            <Button
              title="Delete"
              onPress={() => {
                onApiCall('delete_user_card');
              }}
            />
          </View>
          <TextInput
            style={styles.textinput}
            placeholder="Card Name"
            value={cardName}
            onChangeText={setCardName}
          />
          <TextInput
            style={styles.textinput}
            placeholder="Card Number"
            value={cardNumber}
            onChangeText={setCardNumber}
          />
          <TextInput
            style={styles.textinput}
            placeholder="Name on Card"
            value={nameOnCard}
            onChangeText={setNameOnCard}
          />
          <TextInput
            style={styles.textinput}
            placeholder="Expiry Month"
            value={expiryMonth}
            onChangeText={setExpiryMonth}
          />
          <TextInput
            style={styles.textinput}
            placeholder="Expiry Year"
            value={expiryYear}
            onChangeText={setExpiryYear}
          />
          <TextInput
            style={styles.textinput}
            placeholder="Card Mode"
            value={cardMode}
            onChangeText={setCardMode}
          />
          <TextInput
            style={styles.textinput}
            placeholder="Card Type"
            value={cardType}
            onChangeText={setCardType}
          />
        </View>
      </ScrollView>
      <FlatList
        style={{ flex: 1, backgroundColor: '#dedede' }}
        data={cards}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View>
            <TouchableOpacity
              onPress={() => {
                setCardData(item);
              }}
            >
              <Text style={styles.item}>
                {item.cardName} ({item.maskedCardNumber})
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    flex: 1,
  },
  item: {
    padding: 16,
    fontSize: 20,
  },
  textArea: {
    justifyContent: 'flex-start',
    height: '100%',
    fontSize: 16,
  },
  textinput: {
    height: 40,
    padding: 8,
    marginBottom: 16,
    borderWidth: 1,
  },
  title: {
    fontSize: 20,
  },
});

export default CardsScreen;
