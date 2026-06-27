// screens/SecurityChequeScreen.tsx

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';

import { AppInput, SectionCard, NavRow, getStepColor } from '../../components/FormUI';
import { colors, FontSize } from '../../../../utils/styles/theme';
import useAxiosHook from '../../../../utils/network/AxiosClient';
import { APP_URLS } from '../../../../utils/network/urls';
import { toast } from './AadhaarPanVerification/types';
import { hScale, wScale } from '../../../../utils/styles/dimensions';
import BankListModal from '../../../../components/BankListModal';
import ShowLoader from '../../../../components/ShowLoder';
import ImagePreviewModal from '../ImagePreviewModal';

const STEP = 11;

// ─── Types ────────────────────────────────────────────────
interface DocFile { base64: string; uri: string; name: string; }
const emptyDoc = (): DocFile => ({ base64: '', uri: '', name: '' });


// ✅ YAHAN ADD KARO
const toBase64Anywhere = async (uri: string): Promise<string> => {
  if (!uri) return '';
  if (uri.startsWith('file://')) {
    return await RNFS.readFile(uri, 'base64');
  }
  if (uri.startsWith('http')) {
    const localPath = `${RNFS.CachesDirectoryPath}/${Date.now()}.jpg`;
    await RNFS.downloadFile({ fromUrl: uri, toFile: localPath }).promise;
    const b64 = await RNFS.readFile(localPath, 'base64');
    await RNFS.unlink(localPath).catch(() => { });
    return b64;
  }
  // content://
  return new Promise((resolve, reject) => {
    fetch(uri)
      .then(res => res.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = () => reject(new Error('FileReader failed'));
        reader.readAsDataURL(blob);
      })
      .catch(reject);
  });
};

// ─── Vision Camera Modal ──────────────────────────────────


const SecurityChequeSchema = Yup.object({
  chequeNumber: Yup.string().required('Cheque number required'),
  bankDisplayName: Yup.string().required('Bank name required'),
  chequeHolderName: Yup.string().required('Cheque holder name required'),
});

// ─── Base64 Helpers ───────────────────────────────────────
const localToBase64 = (uri: string): Promise<string> =>
  RNFS.readFile(uri, 'base64');

const urlToBase64 = async (url: string): Promise<string> => {
  const destPath = `${RNFS.CachesDirectoryPath}/${Date.now()}.jpg`;
  await RNFS.downloadFile({ fromUrl: url, toFile: destPath }).promise;
  const b64 = await RNFS.readFile(destPath, 'base64');
  await RNFS.unlink(destPath).catch(() => { });
  return b64;
};

const getBase64 = (doc: DocFile): Promise<string> => {
  if (!doc.uri) return Promise.resolve('');
  if (doc.base64) return Promise.resolve(doc.base64);
  if (doc.uri.startsWith('http')) return urlToBase64(doc.uri);
  return localToBase64(doc.uri);
};

// ─── Vision Camera Modal ──────────────────────────────────
const CameraModal = ({
  visible, onClose, onCapture,
}: {
  visible: boolean;
  onClose: () => void;
  onCapture: (uri: string) => void;
}) => {
  const device = useCameraDevice('back');
  const camera = useRef<Camera>(null);
  const [capturing, setCapturing] = useState(false);

  const takePhoto = async () => {
    if (!camera.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await camera.current.takePhoto({ flash: 'off' });
      onCapture('file://' + photo.path);
    } catch (e) {
      console.log('❌ Vision Camera error:', e);
      toast('Photo capture failed. Try again.');
    } finally {
      setCapturing(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
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
            <Text style={{ color: '#fff', fontSize: wScale(14) }}>Camera not available</Text>
          </View>
        )}

        <View style={cam.controls}>
          <TouchableOpacity style={cam.sideBtn} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={wScale(28)} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity style={cam.captureBtn} onPress={takePhoto} disabled={capturing} activeOpacity={0.8}>
            {capturing
              ? <ActivityIndicator color="#000" size="small" />
              : <View style={cam.captureInner} />
            }
          </TouchableOpacity>

          <View style={cam.sideBtn} />
        </View>
      </View>
    </Modal>
  );
};

const cam = StyleSheet.create({
  controls: { position: 'absolute', bottom: hScale(40), left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wScale(40) },
  sideBtn: { width: wScale(44), height: wScale(44), alignItems: 'center', justifyContent: 'center' },
  captureBtn: { width: wScale(72), height: wScale(72), borderRadius: wScale(36), backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.5)' },
  captureInner: { width: wScale(56), height: wScale(56), borderRadius: wScale(28), backgroundColor: '#fff' },
});

// ─── Source Picker Modal ──────────────────────────────────
const SourcePickerModal = ({
  visible, color, onCamera, onGallery, onClose,
}: {
  visible: boolean; color: string;
  onCamera: () => void; onGallery: () => void; onClose: () => void;
}) => (
  <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
    <Pressable style={sp.overlay} onPress={onClose}>
      <View style={sp.sheet}>
        <Text style={sp.title}>Select Source</Text>

        <TouchableOpacity style={[sp.option, { borderColor: color + '40' }]} onPress={onCamera} activeOpacity={0.8}>
          <View style={[sp.iconWrap, { backgroundColor: color + '15' }]}>
            <MaterialCommunityIcons name="camera-outline" size={wScale(24)} color={color} />
          </View>
          <View style={sp.optionText}>
            <Text style={sp.optionTitle}>Camera</Text>
            <Text style={sp.optionSub}>Take a new photo</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={wScale(18)} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={[sp.option, { borderColor: color + '40' }]} onPress={onGallery} activeOpacity={0.8}>
          <View style={[sp.iconWrap, { backgroundColor: color + '15' }]}>
            <MaterialCommunityIcons name="image-outline" size={wScale(24)} color={color} />
          </View>
          <View style={sp.optionText}>
            <Text style={sp.optionTitle}>Gallery</Text>
            <Text style={sp.optionSub}>Choose from library</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={wScale(18)} color="#9CA3AF" />
        </TouchableOpacity>

        <TouchableOpacity style={sp.cancelBtn} onPress={onClose} activeOpacity={0.7}>
          <Text style={sp.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  </Modal>
);

const sp = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: wScale(20), borderTopRightRadius: wScale(20), padding: wScale(20), paddingBottom: hScale(32) },
  title: { fontSize: wScale(16), fontWeight: '700', color: '#1F2937', marginBottom: hScale(16), textAlign: 'center' },
  option: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: wScale(12), padding: wScale(14), marginBottom: hScale(10) },
  iconWrap: { width: wScale(44), height: wScale(44), borderRadius: wScale(10), justifyContent: 'center', alignItems: 'center', marginRight: wScale(12) },
  optionText: { flex: 1 },
  optionTitle: { fontSize: wScale(14), fontWeight: '600', color: '#1F2937' },
  optionSub: { fontSize: wScale(12), color: '#6B7280', marginTop: hScale(2) },
  cancelBtn: { marginTop: hScale(4), paddingVertical: hScale(14), alignItems: 'center' },
  cancelText: { fontSize: wScale(14), color: '#EF4444', fontWeight: '600' },
});



const ip = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  img: { flex: 1 },
  actions: { flexDirection: 'row', padding: wScale(16), backgroundColor: '#000' },
  retakeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#374151', borderRadius: wScale(10), paddingVertical: hScale(14), marginRight: wScale(6) },
  retakeText: { color: '#fff', fontWeight: '600', fontSize: wScale(14), marginLeft: wScale(6) },
  doneBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#16A34A', borderRadius: wScale(10), paddingVertical: hScale(14), marginLeft: wScale(6) },
  doneText: { color: '#fff', fontWeight: '600', fontSize: wScale(14), marginLeft: wScale(6) },
});

// ─── Cheque Upload ────────────────────────────────────────
const ChequeUpload = ({
  doc, color, onPick, onRemove,
}: {
  doc: DocFile; color: string;
  onPick: (d: DocFile) => void; onRemove: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const [showPreview, setShowPreview] = useState(false);
  const [pendingAsset, setPendingAsset] = useState<{ uri: string; name: string } | null>(null);
  const [cameraVisible, setCameraVisible] = useState(false);

  const { hasPermission, requestPermission } = useCameraPermission();

  const handleAsset = (uri: string, fileName: string) => {
    setPendingAsset({ uri, name: fileName });
    setShowPreview(true);
  };

  // ✅ Vision Camera capture
  const handleVisionCapture = (uri: string) => {
    setCameraVisible(false);
    handleAsset(uri, 'cheque.jpg');
  };

  // ✅ Camera — Vision Camera use karo
  const fromCamera = async () => {
    setShowPicker(false);
    if (!hasPermission) {
      const granted = await requestPermission();
      if (!granted) { toast('Camera permission required'); return; }
    }
    setCameraVisible(true);
  };

  const fromGallery = () => {
    setShowPicker(false);
    launchImageLibrary({ mediaType: 'photo', quality: 0.8 }, (res) => {
      if (res.didCancel || !res.assets?.[0]) return;
      const asset = res.assets[0];
      handleAsset(asset.uri!, asset.fileName ?? 'cheque.jpg');
    });
  };

  const confirmImage = async () => {
    if (!pendingAsset) {
      console.log('❌ pendingAsset null hai');  // ← yeh check karo
      return;
    }
    console.log('✅ confirmImage uri:', pendingAsset.uri);
    setLoading(true);
    try {
      const base64 = await toBase64Anywhere(pendingAsset.uri);
      console.log('✅ base64 length:', base64?.length);
      onPick({ base64, uri: pendingAsset.uri, name: pendingAsset.name });
      console.log('✅ onPick called');
      setShowPreview(false);
    } catch (e) {
      console.log('❌ confirmImage error:', e);
      toast('Could not read image');
    } finally {
      setLoading(false);
      setPendingAsset(null);
    }
  };


  const retake = () => {
    setShowPreview(false);
    setPendingAsset(null);
    setShowPicker(true);
  };

  return (
    <View style={cu.wrapper}>

      {/* Vision Camera */}
      <CameraModal
        visible={cameraVisible}
        onClose={() => setCameraVisible(false)}
        onCapture={handleVisionCapture}
      />

      {/* Label */}
      <View style={cu.labelRow}>
        <MaterialCommunityIcons name="checkbook" size={wScale(15)} color={color} />
        <Text style={cu.label}>Cheque Copy</Text>
        <Text style={cu.req}>*</Text>
      </View>

      {/* Thumbnail ya Upload */}
      {doc.uri || doc.base64 ? (
        <TouchableOpacity
          style={cu.preview}
          onPress={() => {
            setShowPreview(true);
          }}
          activeOpacity={0.9}
        >
          <Image source={{ uri: doc.uri }} style={cu.thumb} resizeMode="cover" />
          <View style={cu.previewInfo}>
            <Text style={cu.fileName} numberOfLines={1}>{doc.name}</Text>
            <Text style={cu.uploaded}>Uploaded ✓  (tap to preview)</Text>
          </View>
          <TouchableOpacity onPress={(e) => { e.stopPropagation(); onRemove(); }} style={cu.removeBtn} activeOpacity={0.7}>
            <MaterialCommunityIcons name="close-circle" size={wScale(20)} color="#EF4444" />
          </TouchableOpacity>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[cu.pickBtn, { borderColor: color + '66' }]}
          onPress={() => setShowPicker(true)}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator size="small" color={color} />
            : <>
              <MaterialCommunityIcons name="upload-outline" size={wScale(20)} color={color} />
              <Text style={[cu.pickText, { color }]}>Tap to upload cheque</Text>
            </>
          }
        </TouchableOpacity>
      )}

      {/* Source Picker */}
      <SourcePickerModal
        visible={showPicker}
        color={color}
        onCamera={fromCamera}
        onGallery={fromGallery}
        onClose={() => setShowPicker(false)}
      />


      <ImagePreviewModal
        visible={showPreview}
        imageUri={pendingAsset?.uri || doc.uri}
        reUploadBtn={true}
        saveClose={() => setShowPreview(false)}
        onClose={() => {
          if (pendingAsset) {
            confirmImage();
          } else {
            setShowPreview(false);
          }
        }}
        reUpload={() => {
          setShowPreview(false);
          setShowPicker(true);
        }}
      />
    </View>
  );
};

const cu = StyleSheet.create({
  wrapper: { marginBottom: hScale(14) },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: hScale(6) },
  label: { fontSize: wScale(13), color: '#374151', fontWeight: '500', flex: 1, marginLeft: wScale(6) },
  req: { fontSize: wScale(13), color: '#EF4444', fontWeight: '700' },
  pickBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderStyle: 'dashed', borderRadius: wScale(10), paddingVertical: hScale(14), backgroundColor: '#F9FAFB' },
  pickText: { fontSize: wScale(13), fontWeight: '600', marginLeft: wScale(8) },
  preview: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', borderRadius: wScale(10), padding: wScale(10), borderWidth: 1, borderColor: '#BBF7D0' },
  thumb: { width: wScale(48), height: wScale(48), borderRadius: wScale(8), backgroundColor: '#E5E7EB' },
  previewInfo: { flex: 1, marginLeft: wScale(10) },
  fileName: { fontSize: wScale(12), color: '#374151', fontWeight: '500' },
  uploaded: { fontSize: wScale(11), color: '#16A34A', marginTop: hScale(2) },
  removeBtn: { padding: wScale(4) },
});

// ─── Bullet ───────────────────────────────────────────────
const Bullet = ({ text, color }: { text: string; color: string }) => (
  <View style={bl.row}>
    <View style={[bl.dot, { backgroundColor: color }]} />
    <Text style={bl.text}>{text}</Text>
  </View>
);

const bl = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: hScale(10) },
  dot: { width: wScale(6), height: wScale(6), borderRadius: wScale(3), marginTop: hScale(7), marginRight: wScale(10), flexShrink: 0 },
  text: { flex: 1, fontSize: wScale(13), color: '#475569', lineHeight: hScale(20) },
});

// ─── Main Screen ──────────────────────────────────────────
const SecurityChequeScreen = ({ onNext }: { onNext: (step: number) => void }) => {
  const { post } = useAxiosHook();
  const stepColor = getStepColor(STEP);

  const [loading, setLoading] = useState(true);
  const [chequeDoc, setChequeDoc] = useState(emptyDoc());
  const [applicantName, setApplicantName] = useState('');
  const [bankList, setBankList] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [isBankOpen, setIsBankOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      chequeNumber: '',
      bankDisplayName: '',
      chequeHolderName: '',
    },
    validationSchema: SecurityChequeSchema,
    validateOnBlur: true,
    validateOnChange: false,

    onSubmit: async (values) => {
      if (!chequeDoc.uri) {
        toast('Please upload security cheque copy');
        return;
      }
      setSubmitting(true);  // ✅ start

      try {
        const checkCopyBase64 = await toBase64Anywhere(chequeDoc.uri);

        const payload = {
          CheckCopy: checkCopyBase64,
          Chequenumber: values.chequeNumber,
          BankName: bankDisplayName,
          ChequeHolderName: values.chequeHolderName,
        };

        console.log('📤 InsertForm9 URL:', APP_URLS.InsertForm9Update);
        console.log('📦 InsertForm9 REQUEST:', JSON.stringify({ ...payload, CheckCopy: payload }, null, 2));

        const res = await post({ url: APP_URLS.InsertForm9Update, data: payload });
        console.log('📥 InsertForm9 RESPONSE:', JSON.stringify(res, null, 2));

        if (res?.StatusCode === 200) {
          toast('Security cheque saved!');
          onNext(10);
        } else {
          toast(res?.message || 'Submit failed. Try again.');
        }
      } catch (err) {
        console.log('❌ InsertForm9 ERROR:', err);
        toast('Something went wrong. Try again.');
      }
      finally {
        setSubmitting(false);  // ✅ end — success ya error dono pe
      }
    },
  });

  const { values, errors, touched, handleSubmit, setFieldValue, setFieldTouched } = formik;
  useEffect(() => {
    console.log('📦 chequeDoc changed:', chequeDoc);
  }, [chequeDoc]);
  useEffect(() => {
    const fetchBank = async () => {
      try {
        const response = await post({ url: APP_URLS.aepsBanklist });
        if (response.RESULT === '0') setBankList(response['ADDINFO']['data']);
      } catch {
        console.error('Bank list fetch failed');
      }
    };

    const fetchData = async () => {
      try {
        const res = await post({ url: APP_URLS.ShowForm9 });
        console.log('✅ ShowForm9 RESPONSE:', JSON.stringify(res, null, 2));

        if (res?.StatusCode === 200) {
          setLoading(false);
          const c = res.Content;

          // if (c?.ApplicantName) setApplicantName(c.ApplicantName);
          if (c?.ApplicantName) {
            setApplicantName(c.ApplicantName);
            formik.setFieldValue('chequeHolderName', c.ApplicantName); // ✅ yeh add karo
          }
          formik.setValues({
            chequeNumber: c?.Chequenumber ?? '',
            bankDisplayName: c?.BankName ?? '',
            chequeHolderName: c?.ChequeHolderName ?? '',
          }, false);

          if (c?.BankName) setSelectedBank({ BankName: c.BankName });
          if (c?.Securitycheck) {
            const uri = c.Securitycheck.replace(/\\/g, '/');
            const cacheBustedUri = `${uri}?t=${Date.now()}`;  // ✅ cache bust
            console.log('🖼️ Setting chequeDoc URI:', cacheBustedUri);
            setChequeDoc({ base64: '', uri: cacheBustedUri, name: 'Security Cheque' });
          }
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.log('❌ ShowForm9 ERROR:', e);
        setLoading(false);
      }
    };

    fetchBank();
    fetchData();
  }, []);

  const bankDisplayName = selectedBank
    ? (selectedBank?.BankName ?? selectedBank?.bankName ?? selectedBank?.name ?? 'Selected')
    : '';

  const f = (name: keyof typeof values) => ({
    value: values[name],
    error: errors[name] as string | undefined,
    touched: !!touched[name],
    onBlur: () => setFieldTouched(name, true),
    onChangeText: (t: string) => setFieldValue(name, t),
  });

  const onPressNext = async () => {
    const errs = await formik.validateForm();
    if (Object.keys(errs).length > 0) {
      toast(Object.values(errs)[0] as string);
      return;
    }
    handleSubmit();
  };
  const [submitting, setSubmitting] = useState(false);

  return (
    <View style={s.screen}>
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {loading && <ShowLoader />}

        {/* ── Declaration ── */}
        <SectionCard title="Advance Funding Declaration" icon="file-sign" iconColor={stepColor}>
          <Text style={s.declIntro}>
            I,{' '}
            <Text style={[s.declName, { color: stepColor }]}>
              {values.chequeHolderName || '_______________________________'}
            </Text>
            {' '}(Applicant Name), acknowledge that for my service engagement as a Cash Executive for the Company, I may be required to maintain advance funding in the Company designated wallet through UPI, NEFT, RTGS, IMPS, or Cash Deposit to perform cash pickups. I hereby agree and undertake the following:
          </Text>

          <Bullet color={stepColor} text="UPI Chargeback & Recovery: I take full responsibility for all transactions initiated by me including any 'Chargeback' or 'Reversals' or 'Disputes' on UPI transactions initiated by me." />
          <Bullet color={stepColor} text="I authorise the Company to recover any amounts due from me including chargebacks or losses attributable to me from my wallet balance and/or any amounts payable to me by the Company and/or the Security Cheque provided by me." />
          <Bullet color={stepColor} text="Cash Deposit & Errors: I acknowledge that any human error, such as using the same deposit slip for multiple wallet top-ups or misleading deposit details or documents or uploading incorrect/fraudulent slips or documents, will be treated as a material breach of conduct and may lead to termination of my engagement and appropriate legal action." />
          <Bullet color={stepColor} text="Security Cheque Details: As a security against financial obligations (including chargebacks, mismanaged funds etc.) arising from my engagement as a Cash Executive, I am submitting a Security Cheque with the following details." />
        </SectionCard>

        <SectionCard title="Security Cheque Details" icon="checkbook" iconColor={stepColor}>
          <View style={s.Crow}>
            <Text style={s.payeeLabel}>
              Payee's Name :
            </Text>

            {/* Value — Blue */}
            <Text style={s.payeeValue}>
              radiant cash management services Ltd
            </Text>
          </View>
          <AppInput
            label="Cheque No."
            placeholder="Enter cheque number"
            keyboardType="numeric"
            maxLength={6}
            {...f('chequeNumber')}

          />

          {/* Bank Picker */}
          <View style={s.bankPickerWrap}>
            <Text style={s.bankPickerLabel}>
              Bank Name <Text style={s.req}>*</Text>
            </Text>
            <TouchableOpacity
              style={[s.bankPickerBtn, { borderColor: selectedBank ? stepColor : '#D1D5DB' }]}
              onPress={() => setIsBankOpen(true)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="bank-outline" size={wScale(16)} color={selectedBank ? stepColor : '#9CA3AF'} />
              <Text style={[s.bankPickerText, selectedBank && { color: '#1F2937' }]} numberOfLines={1}>
                {selectedBank ? bankDisplayName : 'Select bank'}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={wScale(18)} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <AppInput
            label="Cheque Holder Name"
            placeholder="Enter cheque holder name"
            {...f('chequeHolderName')}
          />

          <ChequeUpload
            doc={chequeDoc}
            color={stepColor}
            onPick={setChequeDoc}
            onRemove={() => setChequeDoc(emptyDoc())}
          />
        </SectionCard>

        {/* ── Authorisation Note ── */}
        <View style={s.authBox}>
          <MaterialCommunityIcons name="shield-check-outline" size={wScale(16)} color="#1D4ED8" />
          <Text style={s.authText}>
            I authorise the Company to present this cheque for recovery of dues payable by me, arising from any financial liability or fraud caused by me during my engagement as Cash Executive.
          </Text>
        </View>

        <NavRow onNext={onPressNext} stepColor={stepColor} loading={submitting}  // ✅ yeh add karo
        />
      </ScrollView>

      <BankListModal
        visible={isBankOpen}
        onClose={() => setIsBankOpen(false)}
        data={bankList}
        onSelect={(bank) => {
          const name = bank?.BankName ?? bank?.bankName ?? bank?.name ?? '';
          setSelectedBank(bank);
          setIsBankOpen(false);
          setFieldValue('bankDisplayName', name);
        }}
      />
    </View>
  );
};

export default SecurityChequeScreen;

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.light_blue },
  scroll: { padding: 16, paddingBottom: 40 },
  req: { color: '#EF4444', fontWeight: '700' },
  declIntro: { fontSize: wScale(13), color: '#475569', lineHeight: hScale(21), marginBottom: hScale(14) },
  declName: { fontWeight: '700' },
  bankPickerWrap: { marginBottom: hScale(14) },
  bankPickerLabel: { fontSize: wScale(13), color: '#374151', fontWeight: '500', marginBottom: hScale(6) },
  bankPickerBtn: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: wScale(10), paddingHorizontal: wScale(14), paddingVertical: hScale(12), backgroundColor: '#F9FAFB' },
  bankPickerText: { flex: 1, fontSize: wScale(13), color: '#9CA3AF', marginLeft: wScale(8) },
  authBox: { flexDirection: 'row', backgroundColor: '#EFF6FF', borderRadius: wScale(12), padding: wScale(14), marginBottom: hScale(16), borderWidth: 1, borderColor: '#BFDBFE', alignItems: 'flex-start' },
  authText: { flex: 1, fontSize: wScale(13), color: '#1E40AF', lineHeight: hScale(20), marginLeft: wScale(10) },
  payeeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',      // black/dark
    marginBottom: 2,
  },
  payeeValue: {

    color: '#185FA5',      // blue
    marginBottom: 12,
    fontSize: wScale(18),
    fontWeight: 'bold',
    textTransform: 'capitalize'
  },
  Crow: {
    borderRadius: 5,
    borderWidth: wScale(.5),
    backgroundColor: '#dfe5f2',
    paddingLeft: wScale(15)
  }
});