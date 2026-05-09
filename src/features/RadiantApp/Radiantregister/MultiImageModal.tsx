import React, { useEffect, useState } from 'react';
import {
  Modal,
  TouchableWithoutFeedback,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import ClosseModalSvg from '../../drawer/svgimgcomponents/ClosseModal';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';

interface ImagePreviewModalProps {
  visible: boolean;
  imageUris: string[];
  onClose: () => void;
  reUpload: () => void;
  isCameraSession?: boolean;
  onDone?: () => void;
  onDeleteImage?: (uri: string) => void;
}

const MultiImageModal: React.FC<ImagePreviewModalProps> = ({
  visible,
  imageUris,
  onClose,
  reUpload,
  isCameraSession = false,
  onDone,
  onDeleteImage,
}) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const secondaryColorWithOpacity = `${colorConfig.secondaryColor}40`;
  const primaryColorWithOpacity = `${colorConfig.primaryColor}40`;

  const imagesToDisplay = Array.isArray(imageUris) ? imageUris : [imageUris];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Reset index on modal close
  useEffect(() => {
    if (!visible) setCurrentIndex(0);
  }, [visible]);

  return (
    <Modal visible={visible} transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback>
        <View style={styles.imageModalBackdrop}>
          <View style={styles.imageModalContainer}>
            <View style={[styles.actionBar, { backgroundColor: secondaryColorWithOpacity }]}>
              <View style={styles.leftActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: primaryColorWithOpacity }]}
                  onPress={reUpload}
                >
                  <Text style={styles.buttonText}>
                    {isCameraSession ? 'Add More' : 'Re-upload'}
                  </Text>
                </TouchableOpacity>

                {onDeleteImage && imagesToDisplay.length > 0 && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#ff444440', marginLeft: 10 }]}
                    onPress={() => onDeleteImage(imagesToDisplay[currentIndex])}
                  >
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.rightActions}>
                {isCameraSession && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: '#00C85140', marginRight: 10 }]}
                    onPress={onDone}
                  >
                    <Text style={styles.buttonText}>Done</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={onClose}>
                  <ClosseModalSvg size={35} />
                </TouchableOpacity>
              </View>
            </View>

            {imagesToDisplay.length > 1 && (
              <View style={styles.counterContainer}>
                <Text style={styles.counterText}>
                  {`${currentIndex + 1} / ${imagesToDisplay.length}`}
                </Text>
              </View>
            )}

            <View style={styles.imageViewerContainer}>
              <ImageViewer
                imageUrls={imagesToDisplay.map(uri => ({ url: uri }))}
                enableSwipeDown={true}
                onSwipeDown={onClose}
                enableImageZoom={true}
                onChange={(index) => {
                  if (typeof index === 'number') setCurrentIndex(index);
                }}
                renderIndicator={() => null}
              />
            </View>
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
    height: Platform.OS === 'ios' ? '80%' : '85%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hScale(8),
    paddingHorizontal: wScale(15),
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    paddingHorizontal: wScale(12),
    paddingVertical: hScale(6),
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: wScale(14),
    fontWeight: 'bold',
  },
  counterContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    zIndex: 100,
  },
  counterText: {
    color: 'white',
    fontSize: wScale(12),
  },
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default MultiImageModal;
