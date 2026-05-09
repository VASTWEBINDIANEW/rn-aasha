import { translate } from "../../../utils/languageUtils/I18n";
import React from 'react';
import { Modal, TouchableWithoutFeedback, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import ClosseModalSvg from '../../drawer/svgimgcomponents/ClosseModal';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';

interface ImagePreviewModalProps {
  visible: boolean;
  imageUri: string;
  onClose: () => void;
  reUpload: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ visible, imageUri, onClose, reUpload }) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const secondaryColorWithOpacity = `${colorConfig.secondaryColor}40`;
  const primaryColorWithOpacity = `${colorConfig.primaryColor}40`;
  return (
    <Modal
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback >
        <View style={styles.imageModalBackdrop}>
          <View style={styles.imageModalContainer}>
            <View style={[styles.closeButton, { backgroundColor: secondaryColorWithOpacity }]}>
              <TouchableOpacity
                style={[styles.reUploadButton, { backgroundColor: primaryColorWithOpacity }]}
                onPress={reUpload}
              >
                <Text style={styles.closeButtonText}>{translate("Re_Upload")}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}>
                <ClosseModalSvg size={35} />
              </TouchableOpacity>
            </View>
            <ImageViewer
              imageUrls={[{ url: imageUri }]}
              enableSwipeDown
              onSwipeDown={onClose}
              enableImageZoom={true}
            />
            {/* <Image
              source={{ uri: imageUri }}  // ✅ Ensure this is correct
              style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
            /> */}
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  imageModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContainer: {
    width: '90%',
    height: '70%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  closeButton: {
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: hScale(5),
    paddingHorizontal: wScale(15),
  },
  reUploadButton: {
    paddingHorizontal: wScale(10),
    paddingVertical: hScale(5),
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: wScale(16),
    fontWeight: 'bold',
  },
});

export default ImagePreviewModal;
