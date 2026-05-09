import { useCallback, useEffect, useRef, useState } from 'react';
import { PERMISSIONS, RESULTS, openSettings, requestMultiple } from 'react-native-permissions';
import GetLocation from 'react-native-get-location';
import { ALERT_TYPE, Dialog } from 'react-native-alert-notification';
import { ToastAndroid } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setIsOnLoc, setLoc_Data } from '../reduxUtils/store/userInfoSlice';
import { RootState } from '../reduxUtils/store';

const LOCATION_TIMEOUT = 30_000;
const RETRY_DELAY_CANCELLED = 10_000;
const RETRY_DELAY_UNAVAILABLE = 20_000;
const MAX_RETRIES = 3;

type LocationResult = { latitude: string; longitude: string };
type PermissionStatuses = Awaited<ReturnType<typeof requestMultiple>>;

export const useLocationHook = () => {
  const { Loc_Data } = useSelector((state: RootState) => state.userInfo);

  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isLocationPermissionGranted, setIsLocationPermissionGranted] = useState<boolean | null>(null);
  const [isgps, setIsGps] = useState(false);

  // Refs to prevent race conditions
  const isFetching = useRef(false);
  const retryCount = useRef(0);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMounted = useRef(true);
  const lastStatuses = useRef<PermissionStatuses | null>(null);

  const dispatch = useDispatch();

  // ── Cleanup on unmount ──────────────────────────────────────────────────────
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, []);

  // ── Permission dialog ───────────────────────────────────────────────────────
  const showPermissionDialog = useCallback(() => {
    Dialog.show({
      type: ALERT_TYPE.WARNING,
      title: 'Permission Required',
      textBody: 'Please grant location permission from Settings to continue.',
      closeOnOverlayTap: false,
      button: 'Open Settings',
      onPressButton: () => {
        Dialog.hide();
        openSettings().catch(() => console.warn('Cannot open settings'));
      },
    });
  }, []);

  // ── Schedule a retry ────────────────────────────────────────────────────────
  const scheduleRetry = useCallback(
    (statuses: PermissionStatuses, delayMs: number) => {
      if (!isMounted.current) return;
      if (retryCount.current >= MAX_RETRIES) {
        console.warn('[Location] Max retries reached, giving up.');
        return;
      }

      retryCount.current += 1;
      console.log(
        `[Location] Retry ${retryCount.current}/${MAX_RETRIES} in ${delayMs / 1000}s — ${new Date().toLocaleTimeString()}`
      );

      retryTimer.current = setTimeout(() => {
        if (isMounted.current) fetchLocation(statuses);
      }, delayMs);
    },
    []
  );

  // ── Core fetch ──────────────────────────────────────────────────────────────
  const fetchLocation = useCallback(
    async (statuses: PermissionStatuses): Promise<LocationResult> => {
      if (isFetching.current) return { latitude: '', longitude: '' };

      const hasFine = statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED;
      const hasCoarse = statuses[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] === RESULTS.GRANTED;

      if (!hasFine && !hasCoarse) {
        if (isMounted.current) setIsLocationPermissionGranted(false);
        return { latitude: '', longitude: '' };
      }

      if (isMounted.current) setIsLocationPermissionGranted(true);
      isFetching.current = true;

      try {
        const location = await GetLocation.getCurrentPosition({
          enableHighAccuracy: hasFine,
          timeout: LOCATION_TIMEOUT,
        });

        if (!isMounted.current) return { latitude: '', longitude: '' };

        const lat = location.latitude.toString();
        const long = location.longitude.toString();

        // Update local state
        setLatitude(lat || Loc_Data?.latitude || '');
        setLongitude(long || Loc_Data?.longitude || '');
        setIsGps(true);

        // Update Redux
        dispatch(setIsOnLoc(true));
        dispatch(setLoc_Data({ latitude: lat, longitude: long, isGPS: false }));

        // Reset retry counter on success
        retryCount.current = 0;

        console.log(`[Location] ✅ Got location: ${lat}, ${long}`);
        return { latitude: lat, longitude: long };

      } catch (error: any) {
        if (!isMounted.current) return { latitude: '', longitude: '' };

        const msg: string = error?.message ?? 'Unknown error';
        console.warn(`[Location] ❌ Error: ${msg}`);

        if (msg === 'Location cancelled by another request') {
          // Another request interrupted — retry after short delay
          // ToastAndroid.showWithGravity(
          //   'Retrying location...',
          //   ToastAndroid.SHORT,
          //   ToastAndroid.BOTTOM
          // );
          scheduleRetry(statuses, RETRY_DELAY_CANCELLED);

        } else if (msg === 'Location not available') {
          // GPS not available — update redux and retry after longer delay
          dispatch(setLoc_Data({ isGPS: true }));
          dispatch(setIsOnLoc(false)); // ✅ boolean, not string

          // ToastAndroid.showWithGravity(
          //   'Location not available. Retrying...',
          //   ToastAndroid.SHORT,
          //   ToastAndroid.BOTTOM
          // );
          scheduleRetry(statuses, RETRY_DELAY_UNAVAILABLE);

        } else {
          // Unknown / unrecoverable error
          dispatch(setLoc_Data({ isGPS: true }));
          dispatch(setIsOnLoc(false));

          ToastAndroid.showWithGravity(msg, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
        }

        return { latitude: '', longitude: '' };

      } finally {
        isFetching.current = false;
      }
    },
    [dispatch, Loc_Data, scheduleRetry]
  );

  // ── Request permissions + fetch ─────────────────────────────────────────────
  const requestPermissionsAndFetch = useCallback(async (): Promise<PermissionStatuses> => {
    const statuses = await requestMultiple([
      PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
    ]);
    lastStatuses.current = statuses;
    return statuses;
  }, []);

  // ── Public: getLocation ─────────────────────────────────────────────────────
  const getLocation = useCallback(async (): Promise<LocationResult> => {
    try {
      const statuses = await requestPermissionsAndFetch();

      const granted =
        statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED ||
        statuses[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] === RESULTS.GRANTED;

      if (granted) {
        return await fetchLocation(statuses);
      } else {
        showPermissionDialog();
        return { latitude: '', longitude: '' };
      }
    } catch (e) {
      console.warn('[Location] Permission request failed:', e);
      return { latitude: '', longitude: '' };
    }
  }, [fetchLocation, requestPermissionsAndFetch, showPermissionDialog]);

  // ── Public: checkLocationPermissionStatus ───────────────────────────────────
  const checkLocationPermissionStatus = useCallback(async (): Promise<boolean> => {
    try {
      const statuses = await requestPermissionsAndFetch();

      const granted =
        statuses[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED ||
        statuses[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] === RESULTS.GRANTED;

      if (granted) {
        await fetchLocation(statuses);
        return true;
      }
      return false;
    } catch (e) {
      console.warn('[Location] checkPermission failed:', e);
      return false;
    }
  }, [fetchLocation, requestPermissionsAndFetch]);

  // ── Public: getLatLongValue ─────────────────────────────────────────────────
  const getLatLongValue = useCallback((): LocationResult => {
    return { latitude, longitude };
  }, [latitude, longitude]);

  // ── Auto-fetch on mount (stable — runs once) ────────────────────────────────
  useEffect(() => {
    getLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — getLocation is stable via useCallback

  return {
    isgps,
    latitude,
    longitude,
    isLocationPermissionGranted,
    getLocation,
    checkLocationPermissionStatus,
    getLatLongValue,
  };
};