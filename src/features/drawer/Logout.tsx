import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { reset } from '../../reduxUtils/store/userInfoSlice';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import { hScale, wScale } from '../../utils/styles/dimensions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translate } from '../../utils/languageUtils/I18n';

const Logout = ({ onClose }: { onClose?: () => void }) => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();

  const PRIMARY = colorConfig?.primaryColor || '#6366F1';

 const handleBack = () => {
    onClose?.();  // ← modal band karega
  };
 const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      dispatch(reset());
      onClose?.();  // ← logout ke baad bhi band karo
    } catch (error) {
      console.error('Failed to clear AsyncStorage:', error);
    }
  };

  return (
    <View style={s.overlay}>
      <View style={s.sheet}>

        {/* Top bar */}
        <View style={s.topBar}>
          <View style={s.pill} />
        </View>

        {/* Icon */}
        <View style={s.iconBox}>
          <Text style={s.iconText}>👋</Text>
        </View>

        {/* Text */}
        <Text style={s.title}>{translate('Logout?')}</Text>
        <Text style={s.subtitle}>{translate('Are you sure you want to log out?')}</Text>

        {/* Divider */}
        <View style={s.divider} />

        {/* Buttons */}
        <TouchableOpacity
          style={[s.btnLogout, { backgroundColor: PRIMARY }]}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Text style={s.btnLogoutText}>Yes, Logout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={s.btnCancel}
          onPress={handleBack}
          activeOpacity={0.85}
        >
          <Text style={s.btnCancelText}>Cancel</Text>
        </TouchableOpacity>

        <View style={{ height: hScale(30) }} />
      </View>
    </View>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: wScale(28),
    borderTopRightRadius: wScale(28),
    paddingHorizontal: wScale(24),
    paddingTop: hScale(12),
    alignItems: 'center',
  },
  topBar: {
    width: '100%',
    alignItems: 'center',
    marginBottom: hScale(20),
  },
  pill: {
    width: wScale(40),
    height: hScale(4),
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
  },
  iconBox: {
    width: wScale(72),
    height: wScale(72),
    borderRadius: wScale(22),
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hScale(18),
  },
  iconText: {
    fontSize: wScale(32),
  },
  title: {
    fontSize: wScale(22),
    fontWeight: '700',
    color: '#111827',
    marginBottom: hScale(8),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: wScale(14),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: hScale(22),
    marginBottom: hScale(24),
  },
  divider: {
    width: '100%',
    height: 0.5,
    backgroundColor: '#E5E7EB',
    marginBottom: hScale(24),
  },
  btnLogout: {
    width: '100%',
    height: hScale(52),
    borderRadius: wScale(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hScale(12),
  },
  btnLogoutText: {
    color: '#fff',
    fontSize: wScale(15),
    fontWeight: '700',
  },
  btnCancel: {
    width: '100%',
    height: hScale(52),
    borderRadius: wScale(16),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCancelText: {
    color: '#374151',
    fontSize: wScale(15),
    fontWeight: '600',
  },
});

export default Logout;