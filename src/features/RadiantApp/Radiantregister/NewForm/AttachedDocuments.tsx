// screens/AttachedDocuments.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Text,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';

import {
  StepBanner,
  AppInput,
  SectionCard,
  NavRow,
  getStepColor,
} from '../../components/FormUI';
import { colors } from '../../../../utils/styles/theme';
import { useFormCtx } from './FormContext';
import useAxiosHook from '../../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../../utils/network/urls';
import { toast } from './AadhaarPanVerification/types';
import { hScale, wScale } from '../../../../utils/styles/dimensions';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';
import ImagePreviewModal from '../ImagePreviewModal';
import PassportPhotoScreen from '../../components/FaceDetectionScreen';
import ShowLoader from '../../../../components/ShowLoder';
// ✅ Top pe import add karo
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { Dimensions } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const STEP = 5;

interface DocField {
  base64: string;
  uri: string;
  name: string;
}

const emptyDoc = (): DocField => ({ base64: '', uri: '', name: '' });

interface FormValues {
  creditCardScore: string;
  policeVerification: string;
}

// ─── Validation ───────────────────────────────────────────
const AttachedDocSchema = Yup.object({
  // creditCardScore: Yup.string().required('Credit card score required'),
  // policeVerification: Yup.string().oneOf(['Yes', 'No'], 'Please select').required('Please select'),
});

// ─── Helpers ──────────────────────────────────────────────
// ─── toBase64 (safe for both content:// and file:// URIs) ───
const toBase64 = async (uri: string): Promise<string> => {
  // content:// URI → fetch + FileReader use karo
  if (uri.startsWith('content://') || !uri.startsWith('file://')) {
    return new Promise((resolve, reject) => {
      fetch(uri)
        .then(res => res.blob())
        .then(blob => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            // "data:image/jpeg;base64,xxxx" → sirf base64 part chahiye
            resolve(result.split(',')[1]);
          };
          reader.onerror = () => reject(new Error('FileReader failed'));
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    });
  }

  // file:// URI → RNFS direct (pehle wala logic)
  return await RNFS.readFile(uri, 'base64');
};

// ─── Doc Upload Card ──────────────────────────────────────
interface DocCardProps {
  label: string;
  icon: string;
  doc: DocField;
  required?: boolean;
  onPick: (doc: DocField) => void;
  onRemove: () => void;
  color: string;
}

// ─── Vision Camera Modal ──────────────────────────────────
// ─── Vision Camera Modal ──────────────────────────────────
const CameraModal = ({
  visible,
  onClose,
  onCapture,
}: {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
}) => {
  const device = useCameraDevice('back');
  const camera = React.useRef<Camera>(null);
  const [capturing, setCapturing] = useState(false);

  const takePhoto = async () => {
    if (!camera.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await camera.current.takePhoto({ flash: 'off' });
      onCapture('file://' + photo.path);
    } catch (e) {
      console.log('❌ Vision Camera capture error:', e);
      toast('Photo capture failed. Try again.');
    } finally {
      setCapturing(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        {device ? (
          <Camera
            ref={camera}
            style={StyleSheet.absoluteFill}
            device={device}
            isActive={visible}
            photo={true}
          />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontSize: wScale(14) }}>
              Camera not available
            </Text>
          </View>
        )}

        {/* Controls */}
        <View style={cam.controls}>
          <TouchableOpacity style={cam.sideBtn} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={wScale(28)} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={cam.captureBtn}
            onPress={takePhoto}
            disabled={capturing}
            activeOpacity={0.8}
          >
            {capturing ? (
              <ActivityIndicator color="#000" size="small" />
            ) : (
              <View style={cam.captureInner} />
            )}
          </TouchableOpacity>

          <View style={cam.sideBtn} />
        </View>
      </View>
    </Modal>
  );
};

const cam = StyleSheet.create({
  controls: {
    position: 'absolute',
    bottom: hScale(40),
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wScale(40),
  },
  sideBtn: {
    width: wScale(44),
    height: wScale(44),
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureBtn: {
    width: wScale(72),
    height: wScale(72),
    borderRadius: wScale(36),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  captureInner: {
    width: wScale(56),
    height: wScale(56),
    borderRadius: wScale(28),
    backgroundColor: '#fff',
  },
});

// ─── Doc Card ─────────────────────────────────────────────
const DocCard = ({
  label,
  icon,
  doc,
  required,
  onPick,
  onRemove,
  color,
}: DocCardProps) => {
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [ispass, setIspass] = useState(false);
  const [cameraVisible, setCameraVisible] = useState(false);

  const { hasPermission, requestPermission } = useCameraPermission();
  const [displayUri, setDisplayUri] = useState('');
useEffect(() => {
  if (!doc.uri) return;

  if (doc.base64) {
    setDisplayUri(`data:image/jpeg;base64,${doc.base64}`);
    return;
  }

  if (doc.uri.startsWith('http')) {
    // ✅ RNFS download — SSL bypass
    const localPath = `${RNFS.CachesDirectoryPath}/img_${Date.now()}.jpg`;
    RNFS.downloadFile({
      fromUrl: doc.uri,
      toFile: localPath,
      discretionary: true,
      cacheable: true,
    }).promise
      .then(result => {
        console.log('✅ RNFS download result:', result.statusCode);
        return RNFS.readFile(localPath, 'base64');
      })
      .then(b64 => {
        console.log('✅ base64 length:', b64?.length);
        setDisplayUri(`data:image/jpeg;base64,${b64}`);
      })
      .catch(e => {
        console.log('❌ RNFS error:', e);
        setDisplayUri(doc.uri); // fallback
      });
    return;
  }

  setDisplayUri(doc.uri);
}, [doc.uri, doc.base64]);
  // ── Gallery se image pick ─────────────────────────────
  const handleImage = async (res: any) => {
    if (res.didCancel || !res.assets?.[0]) return;
    const asset = res.assets[0];
    setLoading(true);
    try {
      const base64 = await toBase64(asset.uri);
      onPick({ base64, uri: asset.uri, name: asset.fileName ?? 'doc' });
      setPreviewVisible(true);
    } catch {
      toast('Could not read image');
    } finally {
      setLoading(false);
    }
  };

  // ── Vision Camera se capture ──────────────────────────
  const handleVisionCapture = async (uri: string) => {
    setCameraVisible(false);
    setLoading(true);
    try {
      const base64 = await toBase64(uri);
      onPick({ base64, uri, name: 'photo.jpg' });
      setPreviewVisible(true);
    } catch {
      toast('Could not read image');
    } finally {
      setLoading(false);
    }
  };

  // ── Camera open ───────────────────────────────────────
  const pickFromCamera = async () => {
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        toast('Camera permission required');
        return;
      }
    }
    setCameraVisible(true);
  };

  // ── Gallery open ──────────────────────────────────────
  const pickFromGallery = () => {
    launchImageLibrary(
      { mediaType: 'photo', quality: 0.5, includeBase64: false },
      handleImage,
    );
  };

  // ── Pick option alert ─────────────────────────────────
  const pick = () => {
    if (label === 'Passport Size Photo') {
      setIspass(true);
      return;
    }
    Alert.alert('Select Image', 'Choose option', [
      { text: 'Camera', onPress: pickFromCamera },
      { text: 'Gallery', onPress: pickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // ── Re-upload ─────────────────────────────────────────
  const handleReUpload = () => {
    setPreviewVisible(false);
    onRemove();
    setTimeout(() => pick(), 350);
  };

  const hasDoc = !!doc.uri;

  return (
    <View style={dc.wrapper}>

      {/* ── Vision Camera Modal ── */}
      <CameraModal
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={handleVisionCapture}
      />

      {/* ── Passport Face Detection Modal ── */}
      <Modal
        visible={ispass}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIspass(false)}
      >
        <PassportPhotoScreen
          onContinue={(data) => {
            onPick(data);
            setPreviewVisible(true);
            setIspass(false);
          }}
        />
      </Modal>

      {/* ── Label Row ── */}
      <View style={dc.labelRow}>
        <MaterialCommunityIcons name={icon} size={wScale(16)} color={color} />
        <Text style={dc.label}>{label}</Text>
        {required && <Text style={dc.req}>*</Text>}
      </View>

      {/* ── Thumbnail ya Upload Button ── */}
      {hasDoc ? (
         <TouchableOpacity
    activeOpacity={0.85}
    onPress={() => {
      console.log('👁️ Preview URI:', doc.uri);   // ✅ yeh add karo
      setPreviewVisible(true);
    }}
    style={dc.preview}
  >
          <Image
  source={{ uri: displayUri }}  // ✅ doc.uri → displayUri
            style={dc.thumb}
            resizeMode="cover"
          />
          <View style={dc.previewInfo}>
            <Text style={dc.fileName} numberOfLines={1}>
              {doc.name}
            </Text>
            <Text style={dc.uploaded}>Uploaded ✓ (tap to preview)</Text>
          </View>
          <TouchableOpacity
            onPress={e => {
              e.stopPropagation();
              onRemove();
            }}
            style={dc.removeBtn}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="close-circle"
              size={wScale(20)}
              color="#EF4444"
            />
          </TouchableOpacity>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[dc.pickBtn, { borderColor: color + '66' }]}
          onPress={pick}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={color} />
          ) : (
            <>
              <MaterialCommunityIcons
                name="upload-outline"
                size={wScale(20)}
                color={color}
              />
              <Text style={[dc.pickText, { color }]}>Tap to upload</Text>
            </>
          )}
        </TouchableOpacity>
      )}

      {/* ── Image Preview Modal ── */}
      <ImagePreviewModal
        visible={previewVisible}
  imageUri={displayUri}  // ✅ doc.uri → displayUri
        reUploadBtn={true}
        onClose={() => setPreviewVisible(false)}
        saveClose={() => setPreviewVisible(false)}
        reUpload={handleReUpload}
      />
    </View>
  );
};

const dc = StyleSheet.create({
  wrapper: {
    marginBottom: hScale(14),
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hScale(6),
  },
  label: {
    fontSize: wScale(13),
    color: '#374151',
    fontWeight: '500',
    flex: 1,
    marginLeft: wScale(6),
  },
  req: {
    fontSize: wScale(13),
    color: '#EF4444',
    fontWeight: '700',
  },
  pickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: wScale(10),
    paddingVertical: hScale(14),
    backgroundColor: '#F9FAFB',
  },
  pickIcon: {
    marginRight: wScale(8),
  },
  pickText: {
    fontSize: wScale(13),
    fontWeight: '600',
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderRadius: wScale(10),
    padding: wScale(10),
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  thumb: {
    width: wScale(48),
    height: wScale(48),
    borderRadius: wScale(8),
    backgroundColor: '#E5E7EB',
  },
  previewInfo: {
    flex: 1,
    marginLeft: wScale(10),
  },
  fileName: {
    fontSize: wScale(12),
    color: '#374151',
    fontWeight: '500',
  },
  uploaded: {
    fontSize: wScale(11),
    color: '#16A34A',
    marginTop: hScale(2),
  },
  removeBtn: {
    padding: wScale(4),
  },
});

// ─── Main Screen ──────────────────────────────────────────
const AttachedDocuments = ({ onNext }: { onNext: () => void }) => {
  const { post } = useAxiosHook();
  const { formData, updateStep, nextStep } = useFormCtx();
  const stepColor = getStepColor(STEP);

  // Doc states
  const [panCard, setPanCard] = useState(emptyDoc());
  const [aadhaarFront, setAadhaarFront] = useState(emptyDoc());
  const [aadhaarBack, setAadhaarBack] = useState(emptyDoc());
  const [securityCheck, setSecurityCheck] = useState(emptyDoc());
  const [creditCardImg, setCreditCardImg] = useState(emptyDoc());
  const [policeVerImg, setPoliceVerImg] = useState(emptyDoc());
  const [otherDoc, setOtherDoc] = useState(emptyDoc());
  const [passportPhoto, setPassportPhoto] = useState(emptyDoc());
  const [otherId, setOtherId] = useState('');
  const formik = useFormik<FormValues>({
    initialValues: {
      creditCardScore: '',
      policeVerification: '',
    },
    validationSchema: AttachedDocSchema,
    validateOnBlur: true,
    validateOnChange: false,

    onSubmit: async (values) => {

      // if (!passportPhoto.base64) { toast('Passport size photo required'); return; }
      // if (!panCard.base64) { toast('PAN card copy required'); return; }
      // if (!aadhaarFront.base64) { toast('Aadhaar front copy required'); return; }
      // if (!aadhaarBack.base64) { toast('Aadhaar back copy required'); return; }
if (!passportPhoto.base64 && !passportPhoto.uri) { toast('Passport size photo required'); return; }
if (!panCard.base64 && !panCard.uri) { toast('PAN card copy required'); return; }
if (!aadhaarFront.base64 && !aadhaarFront.uri) { toast('Aadhaar front copy required'); return; }
if (!aadhaarBack.base64 && !aadhaarBack.uri) { toast('Aadhaar back copy required'); return; }
      try {
        const payload = {
          Pancardcopy: panCard.base64,
          AadharcardFrontcopy: aadhaarFront.base64,
          AadharcardBackcopy: aadhaarBack.base64,
          OtherCopy: otherDoc.base64 || '',
          Passportsizephoto: passportPhoto.base64,
        };
 console.log('📤 InsertForm6 URL    :', APP_URLS.InsertForm6Update);
        console.log('📦 InsertForm5 REQUEST:', JSON.stringify(payload, null, 2));

        const res = await post({ url: APP_URLS.InsertForm6Update, data: payload });
        console.log('📥 InsertForm6 RESPONSE:', JSON.stringify(res, null, 2));

       if (res?.StatusCode === 200) {
  if (res?.Content?.Status === true) {
    toast(res.Content.Message || 'Documents saved!');
    updateStep('attachedDocuments', values);
    nextStep();
    onNext();
  } else {
    toast(res?.Content?.Message || 'Submit failed. Try again.');
  }
} else {
  toast(res?.message || 'Submit failed. Try again.');
}
      } catch (err) {
        console.log('❌ InsertForm6 ERROR:', err);
        toast('Something went wrong. Try again.');
      }
    },
  });

  const { values, errors, touched, handleSubmit, setFieldValue, setFieldTouched } = formik;

  const [loading,setLoading] = useState(true);
  useEffect(() => {
    const fetchForm6Data = async () => {
      try {
        const response = await post({ url: APP_URLS.ShowForm6 });
        const res = response?.data || response;
        console.log('✅ ShowForm6 RESPONSE:', JSON.stringify(res, null, 2));
        if (res?.StatusCode === 200) {
                    setLoading(false);

          const c = res?.Content;
          setOtherId(c);

          if (c?.Pancardimage) {setPanCard(p => ({ ...p, uri: c.Pancardimage, name: 'PAN Card' }));}
          if (c?.aadharcardfront) {setAadhaarFront(p => ({ ...p, uri: c.aadharcardfront, name: 'Aadhaar Front' }));}
          if (c?.aadharcardback) {setAadhaarBack(p => ({ ...p, uri: c.aadharcardback, name: 'Aadhaar Back' }));}
          if (c?.Securitycheck) {setSecurityCheck(p => ({ ...p, uri: c.Securitycheck, name: 'Security Check' }));}
          if (c?.CreditCardscoreimage) {setCreditCardImg(p => ({ ...p, uri: c.CreditCardscoreimage, name: 'Credit Card Score' }));}
          if (c?.Policeverificationimage) {setPoliceVerImg(p => ({ ...p, uri: c.Policeverificationimage, name: 'Police Verification' }));}
          if (c?.OtherImage) {setOtherDoc(p => ({ ...p, uri: c.OtherImage, name: 'Other Document' }));}
          if (c?.passpostsizephoto) {setPassportPhoto(p => ({ ...p, uri: c.passpostsizephoto, name: 'Passport Photo' }));}
        }
      } catch (err) {
        console.log('❌ ShowForm6 ERROR:', err);
      }
    };

    fetchForm6Data();
  }, []);

  const f = (name: keyof FormValues) => ({
    value: values[name],
    error: errors[name],
    touched: !!touched[name],
    onBlur: () => setFieldTouched(name, true),
    onChangeText: (t: string) => setFieldValue(name, t),
  });

  return (
    <View style={s.screen}>
      {/* <StepBanner currentStep={STEP} /> */}

      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
                      {loading&&<ShowLoader/>}

        {/* ── Identity Documents ── */}
        <SectionCard title="Identity Documents" icon="card-account-details-outline" iconColor={stepColor}>
          <DocCard
            label="PAN Card Copy"
            icon="card-text-outline"
            doc={panCard}
            required
            color={stepColor}
            onPick={setPanCard}
            onRemove={() => setPanCard(emptyDoc())}
          />
          <DocCard
            label="Aadhaar Card – Front"
            icon="card-account-details"
            doc={aadhaarFront}
            required
            color={stepColor}
            onPick={setAadhaarFront}
            onRemove={() => setAadhaarFront(emptyDoc())}
          />
          <DocCard
            label="Aadhaar Card – Back"
            icon="card-account-details-outline"
            doc={aadhaarBack}
            required
            color={stepColor}
            onPick={setAadhaarBack}
            onRemove={() => setAadhaarBack(emptyDoc())}
          />
          <DocCard
            label="Passport Size Photo"
            icon="camera-account"
            doc={passportPhoto}
            required
            color={stepColor}
            onPick={setPassportPhoto}
            onRemove={() => setPassportPhoto(emptyDoc())}
          />
        </SectionCard>

        {/* ── Other Documents ── */}
        <SectionCard title="Other Documents" icon="folder-open-outline" iconColor={stepColor}>
          <DocCard
            label={`Select ${otherId.OtherDocName} Photo`}

            icon="file-plus-outline"
            doc={otherDoc}
            color={stepColor}
            onPick={setOtherDoc}
            onRemove={() => setOtherDoc(emptyDoc())}
          />
        </SectionCard>

        <NavRow
          onNext={() => {
            formik.validateForm().then(err => {
              console.log('❌ Errors:', err);
              if (Object.keys(err).length === 0) {
                handleSubmit();
              } else {
                const firstError = Object.values(err)[0];
                toast(firstError as string);
              }
            });
          }}
          stepColor={stepColor}
        />
      </ScrollView>
    </View>
  );
};

export default AttachedDocuments;

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light_blue },
  scroll: { padding: 16, paddingBottom: 40 },
  fieldLabel: { fontSize: wScale(13), color: '#374151', fontWeight: '500', marginBottom: hScale(8) },
  toggleRow: { flexDirection: 'row', gap: wScale(10), marginBottom: hScale(4) },
  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: wScale(6), paddingHorizontal: wScale(16), paddingVertical: hScale(10), borderRadius: wScale(8), borderWidth: 1.5, borderColor: '#D1D5DB', backgroundColor: '#F9FAFB' },
  toggleText: { fontSize: wScale(13), color: '#6B7280', fontWeight: '500' },
  errText: { fontSize: wScale(11), color: '#EF4444', marginTop: hScale(-2), marginBottom: hScale(8) },
});
