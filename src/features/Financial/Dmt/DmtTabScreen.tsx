import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated, Platform, Pressable, ScrollView,
  StyleSheet, Text, View,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '../../../reduxUtils/store';
import useAxiosHook from '../../../utils/network/AxiosClient';
import { translate } from '../../../utils/languageUtils/I18n';
import { hScale, wScale } from '../../../utils/styles/dimensions';

// Screens
import DmtGetBeneficiaryScreen from './DmtGetBeneficiaryScreen';
import RadiantGetBenifiaryScreen from '../RadiantDMT/GetRadiantBeneficiaryScreen';
import GetBenifiaryScreen from '../VastDMT/GetBenifiaryScreen';
import PaysprintDmt from './PaySprintDmt';
import QRScanScreen from '../ScanQr/QRScanScreen';

// Components
import AppBarSecond from '../../drawer/headerAppbar/AppBarSecond';
import ShowLoader from '../../../components/ShowLoder';
import { DmtContext } from './DmtContext';
import noop from 'lodash/noop';

// ─── Types ────────────────────────────────────────────────────────────────────

type RouteKey = 'dmt1' | 'dmt2' | 'payout' | 'ppi' | 'scan';
interface Route { key: RouteKey; title: string }

// ─── Scene Map ────────────────────────────────────────────────────────────────

const SCENES: Record<RouteKey, React.ComponentType> = {
  dmt1:   DmtGetBeneficiaryScreen,
  dmt2:   RadiantGetBenifiaryScreen,
  payout: GetBenifiaryScreen,
  ppi:    PaysprintDmt,
  scan:   QRScanScreen,
};

// ─── API Config ───────────────────────────────────────────────────────────────

const ROUTE_CONFIG = [
  { api: () => ({ method: 'get', url: 'Retailer/api/data/DMTStatusCheck'  }), check: (r: any) => r?.Response === 'Success', route: { key: 'dmt1',   title: 'DMT 1'     } },
  { api: () => ({ method: 'get', url: 'Retailer/api/data/DMTStatusCheck1' }), check: (r: any) => r?.Response === 'Success', route: { key: 'dmt2',   title: 'DMT 2'     } },
  { api: () => ({ method: 'get', url: 'Retailer/api/data/PAYOUTStatusCheck'}), check: (r: any) => r?.Response === 'Success', route: { key: 'payout', title: 'Payout'    } },
  { api: () => ({ method: 'post',url: 'MoneyDMT/api/PPI/info'              }), check: (r: any) => r?.RESULT  === true,      route: { key: 'ppi',    title: 'PPI Fast'  } },
] as const;

const SCAN_ROUTE: Route = { key: 'scan', title: 'Scan & Pay' };

// ─── Animated Segmented Tab Bar ───────────────────────────────────────────────

const TAB_WIDTH = wScale(100);
const TAB_H     = hScale(40);

const SegmentedTabBar = React.memo(({
  routes, index, primary, onPress,
}: { routes: Route[]; index: number; primary: string; onPress: (i: number) => void }) => {
  const anim = useRef(new Animated.Value(index)).current;

  useEffect(() => {
    Animated.spring(anim, {
      toValue: index,
      useNativeDriver: true,
      bounciness: 6,
      speed: 14,
    }).start();
  }, [index]);

  const translateX = anim.interpolate({
    inputRange: routes.map((_, i) => i),
    outputRange: routes.map((_, i) => i * TAB_WIDTH + wScale(3)),
  });

  return (
    <View style={styles.segContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.segScroll}
      >
        <View style={[styles.segTrack, { width: routes.length * TAB_WIDTH + wScale(6) }]}>
          {/* Sliding White Pill */}
          <Animated.View
            style={[
              styles.segSlider,
              { width: TAB_WIDTH - wScale(4), transform: [{ translateX }] },
            ]}
          />

          {/* Labels */}
          {routes.map((r, i) => (
            <Pressable
              key={r.key}
              onPress={() => onPress(i)}
              style={[styles.segTab, { width: TAB_WIDTH }]}
              android_ripple={{ color: 'transparent' }}
            >
              <Text
                style={[
                  styles.segLabel,
                  { color: i === index ? primary : '#8E8E93' },
                ]}
                numberOfLines={1}
              >
                {r.title}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
});

// ─── Lazy Scene Renderer ──────────────────────────────────────────────────────

const LazyScene = React.memo(({
  routeKey, active,
}: { routeKey: RouteKey; active: boolean }) => {
  const [loaded, setLoaded] = useState(active);
  const opacity = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    if (active) {
      setLoaded(true);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    } else {
      Animated.timing(opacity, { toValue: 0, duration: 100, useNativeDriver: true }).start();
    }
  }, [active]);

  if (!loaded) return null;
  const Scene = SCENES[routeKey];
  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity }]}>
      <Scene />
    </Animated.View>
  );
});

// ─── Empty State ──────────────────────────────────────────────────────────────

const EmptyState = () => (
  <View style={styles.emptyWrap}>
    <Text style={styles.emptyTitle}>{translate('No_Services_Available')}</Text>
  </View>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const DmtTabScreen = () => {
  const { colorConfig } = useSelector((state: RootState) => state.userInfo);
  const [isLoading, setIsLoading] = useState(true);
  const [routes, setRoutes]       = useState<Route[]>([]);
  const [index, setIndex]         = useState(0);
  const { get, post }             = useAxiosHook();

  const primary = colorConfig?.primaryColor || '#007AFF';

  // ── Fetch active routes ──
  useEffect(() => {
    (async () => {
      try {
        const calls = ROUTE_CONFIG.map(({ api }) => {
          const { method, url } = api();
          return method === 'post' ? post({ url }) : get({ url });
        });
        const results = await Promise.all(calls);

        const active: Route[] = ROUTE_CONFIG
          .filter((cfg, i) => cfg.check(results[i]))
          .map(cfg => cfg.route as Route);

        setRoutes([...active, SCAN_ROUTE]);
      } catch (e) {
        console.error('[DmtTabScreen] fetch error:', e);
        setRoutes([SCAN_ROUTE]); // fallback
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleTabPress = useCallback((i: number) => setIndex(i), []);
  const [aadharNumber, setAadharNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [consumerName, setConsumerName] = useState('');
  const [bankName, setBankName] = useState('');
  const [fingerprintData, setFingerprintData] = useState('');
  // ── Render ──
  if (isLoading) return <ShowLoader />;

  return (
    <DmtContext.Provider value={{
      aadharNumber, setAadharNumber,
      mobileNumber, setMobileNumber,
      consumerName, setConsumerName,
      bankName, setBankName,
      fingerprintData, setFingerprintData,
      scanFingerprint: noop,
      activeTabKey: routes[index]?.key, // ✅
    }}>
      <View style={styles.root}>
        <AppBarSecond title="Money Transfer" />

        {routes.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <SegmentedTabBar
              routes={routes}
              index={index}
              primary={primary}
              onPress={handleTabPress}
            />

            {/* Scene Container */}
            <View style={styles.sceneContainer}>
              {routes.map((r, i) => (
                <LazyScene
                  key={r.key}
                  routeKey={r.key}
                  active={i === index}
                />
              ))}
            </View>
          </>
        )}
      </View>
    </DmtContext.Provider>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },

  // Segmented Bar
  segContainer: {
    marginHorizontal: wScale(16),
    marginTop: hScale(12),
    marginBottom: hScale(8),
  },
  segScroll: {
    paddingVertical: hScale(3),
  },
  segTrack: {
    height: TAB_H,
    backgroundColor: '#E3E3E8',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wScale(3),
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 3 },
      android: { elevation: 2 },
    }),
  },
  segSlider: {
    position: 'absolute',
    height: TAB_H - hScale(8),
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4 },
      android: { elevation: 4 },
    }),
  },
  segTab: {
    height: TAB_H,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  segLabel: {
    fontSize: wScale(12),
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // Scenes
  sceneContainer: {
    flex: 1,
    position: 'relative',
  },

  // Empty State
  emptyWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: hScale(8),
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: hScale(8),
  },
  emptyTitle: {
    fontSize: wScale(16),
    fontWeight: '600',
    color: '#1C1C1E',
  },
  emptySubtitle: {
    fontSize: wScale(13),
    color: '#8E8E93',
  },
});

export default DmtTabScreen;