import { useState, useCallback, useRef, useEffect } from "react";
import {
  Platform,
  PermissionsAndroid,
  NativeModules,
  Linking,
} from "react-native";
import { check, PERMISSIONS, RESULTS } from "react-native-permissions";
import { useDispatch } from "react-redux";
import DeviceInfo from "react-native-device-info";
import { setDeviceInfo } from "../../reduxUtils/store/userInfoSlice";

const { LocationModule } = NativeModules;

// ─── Types ─────────────────────────────────────────────

interface LocationData {
  latitude: string | number;
  longitude: string | number;
  address?: string;
  city?: string;
  postalCode?: string;
}

interface DeviceInfoPayload {
  brand: string;
  modelNumber: string;
  androidVersion: string;
  packageName: string;
  ipAddress: string;
  uniqueId: string;
  buildId: string;
  net: string;
  latitude?: string | number;
  longitude?: string | number;
  address?: string;
  city?: string;
  postalCode?: string;
}

interface UseLocationManagerReturn {
  isLoading2: boolean;
  locationAllowed: boolean;
  refreshStrictly: () => Promise<void>;
}

// ─── Constants ─────────────────────────────────────────

const LOCATION_TIMEOUT_MS = 8000;
const MAX_ATTEMPTS = 5;

// ─── Hook ──────────────────────────────────────────────

export const useLocationManager = (): UseLocationManagerReturn => {
  const dispatch = useDispatch();

  const [isLoading2, setIsLoading2] = useState(true);
  const [locationAllowed, setLocationAllowed] = useState(false);

  const isFetching = useRef(false);

  const getStaticInfo = () => ({
    brand: DeviceInfo.getBrand(),
    modelNumber: DeviceInfo.getModel(),
    androidVersion: DeviceInfo.getSystemVersion(),
    packageName: DeviceInfo.getBundleId(),
  });

  // 🔹 Fetch Device + Location
  const fetchDeviceInfo = useCallback(async (): Promise<boolean> => {
    if (isFetching.current) return false;

    try {
      isFetching.current = true;

      const [buildId, ip, uniqueId, carrier] = await Promise.all([
        DeviceInfo.getBuildId(),
        DeviceInfo.getIpAddress(),
        DeviceInfo.getUniqueId(),
        DeviceInfo.getCarrier(),
      ]);

      let locData: LocationData | null = null;

      if (LocationModule) {
        const isEnabled = await LocationModule.isLocationEnabled();

        if (isEnabled) {
          try {
            const loc: LocationData = await Promise.race([
              LocationModule.getCurrentLocation(),
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("TIMEOUT")), LOCATION_TIMEOUT_MS)
              ),
            ]);

            if (loc?.latitude && loc.latitude !== "0") {
              locData = loc;
            }
          } catch {
            // silent fail
          }
        }
      }

      // 🔥 fallback
      const fallbackLocation: LocationData = {
        latitude: "28.6139",
        longitude: "77.2090",
        city: "Delhi",
      };

      const finalData: DeviceInfoPayload = {
        ...getStaticInfo(),
        ipAddress: ip || "0.0.0.0",
        uniqueId: uniqueId || "UNKNOWN_DEVICE",
        buildId: buildId || "UNKNOWN_BUILD",
        net: carrier || "wifi",
        ...(locData || fallbackLocation),
      };

      dispatch(setDeviceInfo(finalData));
      setLocationAllowed(!!locData);

      return true;
    } catch {
      return false;
    } finally {
      isFetching.current = false;
    }
  }, [dispatch]);

  // 🔹 Silent Retry Logic (NO ALERTS)
  const forceFetchStrictData = useCallback(async (): Promise<void> => {
    setIsLoading2(true);

    try {
      // permission check (only one-time strict)
      if (Platform.OS === "android") {
        const status = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);

        if (status !== RESULTS.GRANTED) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            // only one fallback, no spam
            dispatch(
              setDeviceInfo({
                ...getStaticInfo(),
                ipAddress: "0.0.0.0",
                uniqueId: "UNKNOWN",
                buildId: "UNKNOWN",
                net: "offline",
                latitude: "28.6139",
                longitude: "77.2090",
              })
            );
            return;
          }
        }
      }

      let success = false;

      for (let i = 0; i < MAX_ATTEMPTS; i++) {
        const isEnabled = await LocationModule?.isLocationEnabled?.();

        if (!isEnabled) {
          await LocationModule?.requestGPSEnabling?.().catch(() => {});
        }

        success = await fetchDeviceInfo();

        if (success) break;

        // 🔥 exponential delay (silent retry)
        const delay = 1000 * Math.pow(2, i);
        await new Promise((r) => setTimeout(r, delay));
      }

      // final fallback (silent)
      if (!success) {
        dispatch(
          setDeviceInfo({
            ...getStaticInfo(),
            ipAddress: "0.0.0.0",
            uniqueId: "UNKNOWN",
            buildId: "UNKNOWN",
            net: "offline",
            latitude: "28.6139",
            longitude: "77.2090",
          })
        );
      }
    } catch {
      // fully silent
    } finally {
      setIsLoading2(false);
    }
  }, [fetchDeviceInfo, dispatch]);

  useEffect(() => {
    forceFetchStrictData();
  }, [forceFetchStrictData]);

  return {
    isLoading2,
    locationAllowed,
    refreshStrictly: forceFetchStrictData,
  };
};