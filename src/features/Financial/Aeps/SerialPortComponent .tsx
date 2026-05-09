import { ScrollView, Alert, Button } from "react-native";
import { useLayoutEffect, useState } from "react";
import React from "react";

const SerialPortComponent = () => {
  const [usbSerial, setUsbSerial] = useState(null)
  useLayoutEffect(() => {
   // initSerialPort();
    sendData('0x01');
  },[])

  // async function initSerialPort() {
  //   try {
  //     const devices = await UsbSerialManager.list();
  //     const granted = await UsbSerialManager.tryRequestPermission(devices[0].deviceId);
  //     const deviceId = devices[0].deviceId;
  //     console.log('deviceId',deviceId);
  //     if (granted) {
  //               Alert.alert('USB permission denied');

  //       const usbSerialport = await UsbSerialManager.open(devices[0].deviceId, { baudRate: 9600, parity: Parity.None, dataBits: 8, stopBits: 1 });
        
  //       console.log(usbSerialport);
        
  //     ///  setUsbSerial(usbSerialport);
  //     } else {
  //       Alert.alert('USB permission denied');
  //     }
  //   } catch (err) {
  //     console.error(err);
  //   }
  // }

  async function sendData(data) {
    console.log(usbSerial);
    if (usbSerial) {
      try {
        await usbSerial.send(data)
      } catch(e) {
        console.error(e)
      }
    }
  }
  return (
    <ScrollView>
      <Button onPress={() => sendData('0x01')} title="ON"/>
      <Button onPress={() => sendData('0x02')} title="OFF"/>
    </ScrollView>
  )
}

export default SerialPortComponent
