import React, { useEffect, useState } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Alert,
  StyleSheet,
  Image,
  Platform
} from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import FileViewer from 'react-native-file-viewer';
import Share from 'react-native-share';
import useAxiosHook from '../utils/network/AxiosClient';
import { APP_URLS } from '../utils/network/urls';
import RNFS from 'react-native-fs';

const PDFGenerator = ({ route }) => {
  const {
    Recharge_amount,
    Operatorid,
    Status,
    Debitamount,
    Reqesttime,
    Recharge_number,
    Operator_name,
    Request_ID,
    frm_name,
    Circle
  } = route.params;

  const [filePath, setFilePath] = useState(null);
  const { get } = useAxiosHook();

  useEffect(() => {
    const fetchData = async () => {
      await get({ url: 'Common/api/data/HideShowrechargeSlip' });
      await createPDF();
    };

    fetchData();
  }, []);

const convertLogoToBase64 = async () => {
  try {
    const asset = Image.resolveAssetSource(
      require('../../assets/images/app_logo.png')
    );

    const base64String = await RNFS.readFile(
      Platform.OS === 'android'
        ? asset.uri.replace('file://', '')
        : asset.uri,
      'base64'
    );

    return base64String;
  } catch (error) {
    console.log('Base64 error:', error);
    return '';
  }
};


  const createPDF = async () => {
    const logoBase64 = await convertLogoToBase64();
    const htmlContent = `
    <html>
      <head>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            background-color: #f2f4f7;
            padding: 0;
            margin: 0;
            color: #212529;
          }
          .card {
            background-color: #fff;
            margin: 20px;
            border-radius: 16px;
            padding: 25px 20px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          }
          .logo {
            width: 60px;
            display: block;
            margin: 0 auto 10px auto;
          }
          .app-title {
            text-align: center;
            font-size: 22px;
            font-weight: 700;
            color: #007bff;
            margin-bottom: 5px;
          }
          .status {
            text-align: center;
            font-size: 18px;
            color: ${Status === 'SUCCESS' ? '#28a745' : '#dc3545'};
            font-weight: bold;
            margin-bottom: 5px;
          }
          .timestamp {
            text-align: center;
            font-size: 13px;
            color: #6c757d;
            margin-bottom: 20px;
          }
          .info-section {
            border-top: 1px solid #dee2e6;
            padding-top: 15px;
          }
          .info-block {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
          }
          .label {
            font-size: 14px;
            color: #6c757d;
            flex: 1;
          }
          .value {
            font-size: 15px;
            font-weight: 600;
            flex: 1;
            text-align: right;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #adb5bd;
            margin-top: 30px;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="app-title">${APP_URLS.AppName}</div>
          <div class="status">Transaction ${Status}</div>
          <div class="timestamp">${Reqesttime}</div>
    
          <div class="info-section">
            <div class="info-block">
              <div class="label">Transaction ID</div>
              <div class="value">${Request_ID}</div>
            </div>
            <div class="info-block">
              <div class="label">Recharge Number</div>
              <div class="value">${Recharge_number}</div>
            </div>
            <div class="info-block">
              <div class="label">Operator</div>
              <div class="value">${Operator_name}</div>
            </div>
              <div class="info-block">
              <div class="label">Circle</div>
              <div class="value">${Circle ? Circle :'N/A'}</div>
            </div>
            <div class="info-block">
              <div class="label">Amount</div>
              <div class="value">₹ ${Recharge_amount}</div>
            </div>
            <div class="info-block">
              <div class="label">Operator ID</div>
              <div class="value">${Operatorid ? Operatorid : 'N/A'}</div>
            </div>
            <div class="info-block">
              <div class="label">Date - Time</div>
              <div class="value">${Reqesttime}</div>
            </div>
          </div>
        </div>
      </body>
    </html>
    `;
    

    const options = {
      html: htmlContent,
      fileName: 'transaction_receipt',
      directory: 'Documents',
    };

    const file = await RNHTMLtoPDF.convert(options);
    setFilePath(file.filePath);
  };

  const viewPDF = async () => {
    if (filePath) {
      try {
        await FileViewer.open(filePath);
      } catch (error) {
        Alert.alert('Error', 'Failed to open PDF: ' + error.message);
      }
    }
  };

  const sharePDF = () => {
    if (filePath) {
      const shareOptions = {
        title: 'Share PDF',
        url: 'file://' + filePath,
      };

      Share.open(shareOptions).catch(error => {
        Alert.alert('Error', 'Failed to share PDF: ' + error.message);
      });
    }
  };

  return (
    <View style={styles.container}>

      <TouchableOpacity style={styles.primaryButton} onPress={viewPDF}>
        <Text style={styles.buttonText}>📄</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={sharePDF}>
        <Text style={styles.buttonText}>🔗</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection:'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 30,
  },
  primaryButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    borderRadius: 5,
    width: '15%',
    alignItems: 'center',
    shadowColor: '#28a745',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  secondaryButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    borderRadius: 5,
    width: '15%',
    alignItems: 'center',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default PDFGenerator;
