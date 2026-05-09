import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../utils/network/urls';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import DmtTabScreen from '../Dmt/DmtTabScreen';
import { translate } from '../../../utils/languageUtils/I18n';

const MoneyTransferScreen = () => {
  const navigation = useNavigation<any>();
  const colorScheme = useColorScheme();
  const { get } = useAxiosHook();

  // 3 states: 'loading' | 'ok' | 'failed'
  const [status, setStatus] = useState<'loading' | 'ok' | 'failed'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const CheckDmtStatus = async () => {
      try {
        const url = `${APP_URLS.Dmtstatus}`;
        const response = await get({ url });
        console.log(response, '******************');

        const { Message, Response } = response;

        if (Response === 'Success') {
          setStatus('ok');

        } else if (
          Response === 'BOTHNOTDONE' ||
          Response === 'NOTOK' ||
          Response === 'ALLNOTDONE' ||
          Response === 'PURCHASE' ||
          Response === 'OTPREQUIRED'
        ) {
          // Navigate away, no UI needed here
          navigation.navigate('ServicepurchaseScreen', { typename: 'DMT' });

        } else {
          // Covers 'Failed', unknown responses, etc.
          setMessage(Message || 'Something went wrong.');
          setStatus('failed');
        }

      } catch (error) {
        console.log(error);
        setMessage('Network error. Please try again.');
        setStatus('failed');
      }
    };

    CheckDmtStatus();
  }, []);

  // ── Loading state ──────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={styles.loadingText}>Please wait...</Text>
      </View>
    );
  }

  // ── Failed / KYC Pending state ─────────────────────────────────
  if (status === 'failed') {
    return (
      <View style={styles.centered}>
        

 <Text style={styles.warningIcon}>⚠️</Text>

        <Text style={styles.errorMessage}>{message}</Text>

       {message !=='No Api Open' && <Text style={styles.helpText}>
          {translate("Please complete your KYC verification to use Money Transfer services.")}
        </Text>}
      </View>
    );
  }

  // ── Success state ──────────────────────────────────────────────
  return <DmtTabScreen />;
};

export default MoneyTransferScreen;

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wScale(24),
    backgroundColor: '#fff',
  },
  warningIcon: {
    fontSize: hScale(56),
    marginBottom: hScale(16),
  },
  errorTitle: {
    fontSize: hScale(20),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: hScale(8),
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: hScale(15),
    color: '#E53935',       // red for the API message
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: hScale(12),
  },
  helpText: {
    fontSize: hScale(13),
    color: '#666',
    textAlign: 'center',
    lineHeight: hScale(20),
  },
  loadingText: {
    marginTop: hScale(12),
    fontSize: hScale(14),
    color: '#888',
  },
});