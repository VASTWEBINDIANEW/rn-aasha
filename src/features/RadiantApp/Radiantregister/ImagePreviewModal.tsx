import React, { useEffect, useState } from 'react';
import {
  Modal,
  TouchableWithoutFeedback,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import Success from '../../drawer/svgimgcomponents/Success';
import CloseCameraSvg from '../../drawer/svgimgcomponents/CloseCameraSvg';
import RefreshSvg from '../../drawer/svgimgcomponents/RefreshSvg';

// ❌ REMOVE: import ImageViewer from 'react-native-image-zoom-viewer';

interface ImagePreviewModalProps {
  visible: boolean;
  reUploadBtn: boolean;
  imageUri: string; 
  onClose: () => void;
  saveClose: () => void;
  reUpload: () => void;
}


const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  visible,
  imageUri,
  onClose,
  reUpload,
  saveClose,
  reUploadBtn = true,
}) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const secondaryColorWithOpacity = `${colorConfig.secondaryColor}40`;

  // ✅ Yeh add karo
  const [imgLoading, setImgLoading] = useState(true);

  // ✅ Yeh add karo — har baar modal open ho to loading reset ho
  useEffect(() => {
    if (visible) setImgLoading(true);
  }, [visible, imageUri]);

  return (
    <Modal visible={visible} transparent={true} onRequestClose={onClose}>
      <TouchableWithoutFeedback>
        <View style={styles.imageModalBackdrop}>
          <View style={styles.imageModalContainer}>
            <View
              style={{
                backgroundColor: secondaryColorWithOpacity,
                width: '100%',
                height: '100%',
                padding: wScale(2),
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              {/* Top bar — same rahega */}
              <View style={styles.closeButton}>
                {reUploadBtn && (
                  <TouchableOpacity onPress={saveClose}>
                    <CloseCameraSvg />
                  </TouchableOpacity>
                )}
                {reUploadBtn && (
                  <TouchableOpacity
                    style={[styles.reUploadButton, { backgroundColor: '#000' }]}
                    onPress={reUpload}
                  >
                    <RefreshSvg size={'20'} />
                    <Text style={styles.closeButtonText}>Image Re-Upload</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={onClose}>
                  <Success />
                </TouchableOpacity>
              </View>

              {/* ✅ Image + Loading ek saath */}
              <View style={{ flex: 1 }}>
                <ScrollView
                  contentContainerStyle={styles.imageWrapper}
                  maximumZoomScale={4}
                  minimumZoomScale={1}
                  showsVerticalScrollIndicator={false}
                  showsHorizontalScrollIndicator={false}
                  centerContent={true}
                >
                  {imageUri ? (
                    <Image
  source={{ 
    uri: imageUri,
    // ❌ cache: 'reload' hata diya
  }}
  style={styles.image}
  resizeMode="contain"
  onLoadStart={() => setImgLoading(true)}
  onLoadEnd={() => setImgLoading(false)}
  onError={(e) => {                                    // ✅ yeh add karo
    console.log('❌ Image load error:', e.nativeEvent.error);
    setImgLoading(false);
  }}
/>
                  ) : (
                    <View style={styles.noImage}>
                      <Text style={{ color: '#9CA3AF', fontSize: wScale(14) }}>
                        No image available
                      </Text>
                    </View>
                  )}
                </ScrollView>

                {/* ✅ Loading overlay — image ke upar dikhega */}
                {imgLoading && (
                  <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Loading image...</Text>
                  </View>
                )}
              </View>

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
    height: '70%',
    backgroundColor: 'white',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
  },
  closeButton: {
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: hScale(5),
    paddingHorizontal: wScale(10),
  },
  reUploadButton: {
    paddingHorizontal: wScale(8),
    paddingVertical: hScale(2.5),
    borderRadius: 35,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: hScale(40),
  },
  closeButtonText: {
    color: 'white',
    fontSize: wScale(16),
    fontWeight: 'bold',
    paddingLeft: wScale(5),
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
loadingOverlay: {
    ...StyleSheet.absoluteFillObject, // image ke upar pura cover karega
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    gap: hScale(10),
  },
  loadingText: {
    color: '#fff',
    fontSize: wScale(13),
    marginTop: hScale(10),
  },
});

export default ImagePreviewModal;