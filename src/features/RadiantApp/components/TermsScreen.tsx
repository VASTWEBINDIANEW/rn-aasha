

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import ShowLoader from '../../../components/ShowLoder';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { hScale, wScale } from '../../../utils/styles/dimensions';
import { colors } from '../../../utils/styles/theme';
import { useLocationHook } from '../../../hooks/useLocationHook';
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import { APP_URLS } from '../../../utils/network/urls';
import { useNavigation } from '../../../utils/navigation/NavigationService';

const ACCENT = colors?.primary ?? '#0B5394';
const SCREEN_W = Dimensions.get('window').width;
// Fallback height jab tak JS se actual height na aaye
const FALLBACK_H = 800;

const TermsScreen = () => {
  const { post } = useAxiosHook();
  const { latitude, longitude, getLocation } = useLocationHook();

  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // WebView content ki measured height
  const [webViewHeight, setWebViewHeight] = useState(FALLBACK_H);

  const [agreeRead, setAgreeRead] = useState(false);
  const [agreeFinal, setAgreeFinal] = useState(false);
  const navigation = useNavigation<any>();
  useEffect(() => {
    fetchTerms();
    getLocation();
  }, []);

  const fetchTerms = async () => {
    try {
      const res = await post({
        url: APP_URLS.ShowchangesTerms
      });
      console.log('📥 API RESPONSE:', res);

      const html = res?.datashow || '';

      // ── Inject karo: document ready hone ke baad content height
      //    postMessage se React Native ko bhejo ──────────────────
      const heightScript = `
        (function() {
          function sendHeight() {
            var h = document.body.scrollHeight;
            window.ReactNativeWebView.postMessage(String(h));
          }
          if (document.readyState === 'complete') {
            sendHeight();
          } else {
            window.addEventListener('load', sendHeight);
          }
        })();
        true;
      `;

      const finalHtml = `
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
              * { box-sizing: border-box; margin: 0; padding: 0; }
              body {
                font-size: 15.5px;
                padding: 16px;
                line-height: 1.65;
                color: #1F2937;
                font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif;
              }
              h1 { font-size: 22px !important; color: #0B5394 !important; margin-bottom: 12px; }
              h2 { font-size: 17px; color: #0B5394; margin-top: 20px; margin-bottom: 8px; }
              p, li, span { font-size: 15px !important; color: #374151 !important; background: transparent !important; }
              img { max-width: 100%; height: auto; border-radius: 10px; }
              ul { padding-left: 20px; }
              hr { border: none; border-top: 1px solid #E5E7EB; margin: 16px 0; }
              strong { color: #111827; }
            </style>
          </head>
          <body>
            ${html}
            <script>${heightScript}</script>
          </body>
        </html>
      `;
      setHtmlContent(finalHtml);
    } catch (err) {
      console.log('❌ ERROR:', err);
      setHtmlContent('<h2 style="padding:16px;">Failed to load terms</h2>');
    } finally {
      setLoading(false);
    }
  };

  // ── WebView se height message receive hone pe ──────────────
  const onWebViewMessage = (event: any) => {
    const h = parseInt(event.nativeEvent.data, 10);
    if (!isNaN(h) && h > 0) {
      // Thoda extra padding add karo taaki content clip na ho
      setWebViewHeight(h + 24);
    }
  };

  const onToggleFirst = () => {
    const next = !agreeRead;
    setAgreeRead(next);
    if (!next) setAgreeFinal(false);
  };

  const canSubmit = agreeRead && agreeFinal;

  const onSubmit = async () => {
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    try {
      if (!latitude || !longitude) await getLocation();

      const res = await post({
        url: `${APP_URLS.UpdatechangesTerms}?Latitude=${latitude ?? ''}&Longitude=${longitude ?? ''}`,

      });
      console.log('📥 UpdatechangesTerms RESPONSE:', JSON.stringify(res, null, 2));
      if (res?.sts === true || res?.Status === true) {
        ToastAndroid.show(res?.messge || res?.Message || 'Terms accepted successfully', ToastAndroid.SHORT);

              navigation.replace('CmsScreen')

      } else {
        ToastAndroid.show(res?.messge || res?.Message || 'Something went wrong. Try again.', ToastAndroid.SHORT);
      }
    } catch (err) {
      console.log('❌ UpdatechangesTerms ERROR:', err);
      ToastAndroid.show('Something went wrong. Try again.', ToastAndroid.SHORT);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={s.screen}>
        <ShowLoader />
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <AppBarSecond title="Terms & Policy Update" />

      {/* ── Single ScrollView — sab kuch andar ────────────── */}
      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Terms Content Card ── */}
        <View style={s.card}>
          <WebView
            originWhitelist={['*']}
            source={{ html: htmlContent }}
            style={{ width: SCREEN_W - wScale(28) * 2, height: webViewHeight }}
            scrollEnabled={false}           // ← apna scroll band
            showsVerticalScrollIndicator={false}
            onMessage={onWebViewMessage}    // ← height receive karo
            injectedJavaScript={`
              // Fallback: agar script tag se message nahi gaya to yahan bhejo
              window.ReactNativeWebView.postMessage(
                String(document.body.scrollHeight)
              );
              true;
            `}
          />
        </View>

        {/* ── Checkboxes + Button ── */}
        <View style={s.footer}>
          {/* Checkbox 1 */}
          <TouchableOpacity
            style={[s.checkRow, agreeRead && { backgroundColor: ACCENT + '10', borderColor: ACCENT }]}
            onPress={onToggleFirst}
            activeOpacity={0.75}
          >
            <View style={[s.checkbox, { borderColor: ACCENT }, agreeRead && { backgroundColor: ACCENT }]}>
              {agreeRead && <MaterialCommunityIcons name="check" size={wScale(13)} color="#fff" />}
            </View>
            <Text style={[s.checkLabel, agreeRead && { color: ACCENT, fontWeight: '600' }]}>
              I have read and understood the updated Consultation Terms, Pricing, and Policies mentioned above.
            </Text>
          </TouchableOpacity>

          {/* Checkbox 2 — tabhi enable hoga jab pehla check ho */}
          <TouchableOpacity
            style={[
              s.checkRow,
              !agreeRead && s.checkRowDisabled,
              agreeFinal && { backgroundColor: ACCENT + '10', borderColor: ACCENT },
            ]}
            onPress={() => agreeRead && setAgreeFinal(p => !p)}
            activeOpacity={agreeRead ? 0.75 : 1}
            disabled={!agreeRead}
          >
            <View style={[
              s.checkbox,
              { borderColor: agreeRead ? ACCENT : '#CBD5E1' },
              agreeFinal && { backgroundColor: ACCENT },
            ]}>
              {agreeFinal && <MaterialCommunityIcons name="check" size={wScale(13)} color="#fff" />}
            </View>
            <Text style={[
              s.checkLabel,
              !agreeRead && { color: '#CBD5E1' },
              agreeFinal && { color: ACCENT, fontWeight: '600' },
            ]}>
              I confirm this is my final decision — I have read all the above policies with a clear, active mind and I am proceeding of my own accord.
            </Text>
          </TouchableOpacity>

          {/* Submit */}
          <TouchableOpacity
            style={[s.submitBtn, { backgroundColor: canSubmit ? ACCENT : '#CBD5E1' }]}
            onPress={onSubmit}
            disabled={!canSubmit || submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <MaterialCommunityIcons name="check-decagram-outline" size={wScale(17)} color="#fff" />
                <Text style={s.submitBtnText}>Submit</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default TermsScreen;

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7FA' },

  scroll: {
    paddingHorizontal: wScale(14),
    paddingTop: hScale(14),
    paddingBottom: hScale(32),
  },

  card: {
    borderRadius: wScale(14),
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    marginBottom: hScale(16),
  },

  footer: {
    backgroundColor: '#fff',
    borderRadius: wScale(16),
    paddingHorizontal: wScale(16),
    paddingTop: hScale(14),
    paddingBottom: hScale(18),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },

  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: wScale(10),
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: wScale(12),
    padding: wScale(11),
    marginBottom: hScale(10),
  },
  checkRowDisabled: { backgroundColor: '#F8FAFC' },
  checkbox: {
    width: wScale(22),
    height: wScale(22),
    borderRadius: wScale(6),
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: hScale(1),
    flexShrink: 0,
  },
  checkLabel: { flex: 1, fontSize: wScale(12.5), color: '#475569', lineHeight: hScale(18) },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: wScale(8),
    borderRadius: wScale(14),
    paddingVertical: hScale(14),
    marginTop: hScale(4),
  },
  submitBtnText: { color: '#fff', fontSize: wScale(15), fontWeight: '700' },
});