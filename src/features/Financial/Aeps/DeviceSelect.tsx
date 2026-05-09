import { translate } from "../../../utils/languageUtils/I18n";
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ToastAndroid, ScrollView } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import LinearGradient from 'react-native-linear-gradient';
import { hScale, SCREEN_HEIGHT, wScale } from '../../../utils/styles/dimensions';
import { useSelector } from 'react-redux';
import { isDriverFound  ,getDeviceInfo} from 'react-native-rdservice-fingerprintscanner';
import CheckSvg from '../../drawer/svgimgcomponents/CheckSvg';
import CloseSvg from '../../drawer/svgimgcomponents/CloseSvg';
import FlotingInput from '../../drawer/securityPages/FlotingInput';
import OnelineDropdownSvg from '../../drawer/svgimgcomponents/simpledropdown';
import FacescanSvg from '../../drawer/svgimgcomponents/FacescanSvg';
import { colors } from '../../../utils/styles/theme';

const SelectDevice = ({ setDeviceName, device, opPress, pkg, isface = false, isface2 = false, onPressface, isProcees }) => {
  const [selectedDevice, setSelectedDevice] = useState();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isModalVisible2, setIsModalVisible2] = useState(false);
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const [rdpkg, setRdPkg] = useState(pkg);

  const devices = [
    'Mantra L0',
    'Mantra L1',
    'Startek L0',
    'Startek L1',
    'Morpho L0',
    'Morpho L1'
  ];

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
  };

  const handleSelectDevice = (device) => {
    setSelectedDevice(device);
    setDeviceName(device)
    opPress;
    handleSelection(device);
    handleCloseModal();
  };
  const handleSelection = (selectedOption) => {
    if (selectedDevice === 'Device') {
      ToastAndroid.showWithGravity('Please Select Your Device', ToastAndroid.SHORT, ToastAndroid.BOTTOM);

      return;
    }
    console.log(selectedOption)
    const captureMapping = {
      'Mantra L0': 'com.mantra.rdservice',
      'Mantra L1': 'com.mantra.mfs110.rdservice',
      'Startek L0': 'com.acpl.registersdk',
      'Startek L1': 'com.acpl.registersdk_l1',
      'Morpho L0': 'com.scl.rdservice',
      'Morpho L1': 'com.idemia.l1rdservice',

    };

    console.log(captureMapping[selectedOption])
    if (captureMapping[selectedOption]) {
    isDriverFound(captureMapping[selectedOption])
  .then((res) => {
    console.log("Device info:", res);
    ToastAndroid.show(res.message || '', ToastAndroid.SHORT);
    if (!res.isDeviceDriverFound) {
      ToastAndroid.show(res.message || "Device not connected", ToastAndroid.SHORT);
      return;
    }

    // ✅ Device ready
    setRdPkg(captureMapping[selectedOption]);
  })
  .catch((error) => {
    console.log(error);
    ToastAndroid.show("RD Service not available", ToastAndroid.SHORT);
  });

    } else {
      alert('Invalid option selected');
    }
  };
  const check = () => {
    console.log(isProcees)
    console.log(isProcees)

    if(!isProcees){
      ToastAndroid.show('Please complate all fields', ToastAndroid.BOTTOM)
return;
    }

    if (!isface) {
      ToastAndroid.show('The bank you have selected is not allowed for face authentication.', ToastAndroid.BOTTOM)
      return
    }



    onPressface()


  }
  return (
    <View style={styles.container}>
      <View style={styles.devicerow}>
        <TouchableOpacity onPress={handleOpenModal} style={[styles.selectButton,]}>
          <FlotingInput
            label={selectedDevice ? 'Your Device' : 'Select Your Device'}
            value={selectedDevice}
            editable={false}
          />
          <View style={[styles.righticon2]}>
            {/* {selectedDevice ? <View style={[styles.languageEmojiContainer, { backgroundColor: colorConfig.secondaryColor }]}>
              <CheckSvg />
            </View> : */}
            <OnelineDropdownSvg />


          </View>

        </TouchableOpacity >

        <TouchableOpacity
          disabled={!isface}
          onPress={check}
          style={[styles.facestyle, isface && styles.bnaktru
          ]} >

          <Text style={styles.facetex}>
            Face {'\n'}Auth
          </Text>
          <FacescanSvg />
        </TouchableOpacity>


      </View>

      <Modal visible={isModalVisible}
        onRequestClose={handleCloseModal}
        animationType="slide"
        transparent={true}>
        <View style={styles.centerModal}>
          <LinearGradient
            colors={[colorConfig.primaryColor, colorConfig.secondaryColor,]}

            style={[
              styles.modalView,
              { borderColor: colorConfig.secondaryColor },
            ]}>
            <View style={styles.cutborder}>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                activeOpacity={0.7}
                style={[
                  styles.closebuttoX,
                  { backgroundColor: colorConfig.secondaryColor },
                ]}>
                <CloseSvg />
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.texttitalView,
                { backgroundColor: colorConfig.secondaryColor },
              ]}>
              <View
                style={[
                  styles.cutout,
                  { borderTopColor: colorConfig.secondaryColor },
                ]}
              />
              <Text style={styles.texttital}>{translate("Select_a_Device")}</Text>
            </View>
            <ScrollView>

              <FlashList
                data={devices}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelectDevice(item)}
                    style={styles.deviceItem}
                  >
                    <View
                      style={[styles.languageEmojiContainer, selectedDevice === item && { backgroundColor: colorConfig.secondaryColor }]}>
                      {selectedDevice === item && (
                        <CheckSvg />
                      )}

                    </View>
                    <Text style={styles.deviceItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => index.toString()}
                estimatedItemSize={50}
              />
            </ScrollView>
          </LinearGradient>
        </View>
      </Modal>

    </View >
  );
};

const styles = StyleSheet.create({
  container: {
    flex:1
  },
  selectButton: {
    borderRadius: 8,
    width: '70%'
  },
  devicerow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // alignItems: 'center',
    // marginTop: hScale(20),

  },
  deviceItem: {
    paddingVertical: hScale(12),
    borderBottomWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
  },
  deviceItemText: {
    color: 'white',
    fontSize: wScale(20),
    textAlign: 'center',
    textTransform: 'capitalize',
    paddingLeft: wScale(15)
  },
  centerModal: {
    justifyContent: 'flex-end',
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.6)',
  },
  modalView: {
    backgroundColor: '#fff',
    paddingTop: hScale(50),
    borderRadius: wScale(10),
    elevation: 5,
    marginHorizontal: wScale(16),
    marginTop: hScale(70),
    borderWidth: wScale(3),
    paddingHorizontal: wScale(10),
    marginBottom: hScale(5),
    height:SCREEN_HEIGHT/1.9
  },
  texttitalView: {
    width: wScale(120),
    height: hScale(40),
    borderTopLeftRadius: wScale(5),
    position: 'absolute',
    top: hScale(-1),
    left: wScale(-1),
    justifyContent: 'center',
    paddingBottom: hScale(3),
    borderBottomRightRadius: 0,
  },
  cutout: {
    borderTopWidth: hScale(40), // Height of the triangle
    borderRightWidth: wScale(33), // Width of the triangle
    borderBottomWidth: wScale(0), // Set to 0 to hide the bottom edge
    borderLeftWidth: wScale(3), // Width of the triangle
    width: '100%',
    height: hScale(40),
    borderRightColor: 'transparent', // Hide the right edge
    borderBottomColor: 'transparent', // Hide the bottom edge
    borderLeftColor: 'transparent', // Hide the left edge
    position: 'absolute',
    right: wScale(-50),
    zIndex: wScale(0),
    top: wScale(0),
  },
  texttital: {
    fontSize: wScale(18),
    fontWeight: 'bold',
    color: '#fff',
    width: 240,
    paddingLeft: wScale(10)
  },
  closebuttoX: {
    borderRadius: wScale(24),
    paddingVertical: hScale(5),
    alignItems: 'center',
    height: wScale(48),
    width: wScale(48),
    justifyContent: 'center',
    elevation: 5,
  },
  cutborder: {
    paddingLeft: wScale(2),
    position: 'absolute',
    right: wScale(-12),
    top: hScale(-12),
    borderRadius: wScale(24),
    paddingRight: wScale(3.2),
  },
  languageEmojiContainer: {
    borderWidth: wScale(.5),
    borderRadius: 25,
    height: wScale(35),
    width: wScale(35),
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#fff'
  },


  righticon2: {
    position: "absolute",
    left: "auto",
    right: wScale(0),
    top: hScale(0),
    height: "85%",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: wScale(4),
  },
  facestyle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: wScale(0.8),
    borderColor: 'red',
    backgroundColor: colors.red_deactivated_bg,
    borderRadius: wScale(5),
    width: '28%',
    paddingHorizontal: wScale(8),
    height: hScale(48),
    marginTop: hScale(8.9),
    justifyContent: 'space-between'

  },
  facetex: {
    textAlign: 'center',
    color: '#000',
  },
  bnaktru: {
    backgroundColor: colors.green10,
    borderColor: colors.green01D
  },
});

export default SelectDevice;
