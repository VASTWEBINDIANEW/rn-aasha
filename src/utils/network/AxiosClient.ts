import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { reset, setAuthToken, setRefreshToken, setUserId } from '../../reduxUtils/store/userInfoSlice';
import { APP_URLS } from './urls';
import { encrypt } from '../encryptionUtils';

// ✅ Heavy endpoints ke liye timeout alag
const HEAVY_ENDPOINTS = [
  'CashpickupSubmit',
  'CashDeposit',
  'Submit',
  'hkhk2'
];
const HEAVY_TIMEOUT = 300000;  // 5 minutes
const DEFAULT_TIMEOUT = 120000; // 2 minutes

const getTimeoutForUrl = (url: string): number => {
  const isHeavy = HEAVY_ENDPOINTS.some(ep => url.includes(ep));
  return isHeavy ? HEAVY_TIMEOUT : DEFAULT_TIMEOUT;
};

const useAxiosHook = () => {
  const { authToken = '', refreshToken, IsDealer } = useSelector(
    (state: RootState) => state.userInfo,
  );
  const dispatch = useDispatch();
  const isRefreshing = useRef(false); // ✅ useRef — render pe reset nahi hoga

  const axiosInstance = useMemo(
    () =>
      axios.create({
        baseURL: 'http://native.payon4u.com/',
        timeout: DEFAULT_TIMEOUT,
      }),
    [],
  );

  // ---------- API functions ----------
  const get = useCallback(
    async ({ url }: { url: string }) => {
      const response = await axiosInstance.get(url);
      return response.data;
    },
    [axiosInstance],
  );

  const post = useCallback(
    async ({
      url,
      data,
      config = {},
    }: {
      url: string;
      data?: any;
      config?: any;
    }) => {
      try {
        // ✅ Heavy endpoints ke liye timeout override
        const timeout = getTimeoutForUrl(url);
        const response = await axiosInstance.post(url, data, {
          ...config,
          timeout,
        });
        return response.data;
      } catch (e) {
        throw e;
      }
    },
    [axiosInstance],
  );

  const put = useCallback(
    async ({ url, data }: { url: string; data: any }) => {
      const response = await axiosInstance.put(url, data);
      return response.data;
    },
    [axiosInstance],
  );

  // ---------- Refresh Token ----------
  const onRefreshToken = useCallback(async () => {
    const data = {
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    };

    const response = await post({
      url: APP_URLS.getToken,
      data,
      config: {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          Authorization: 'bearer',
        },
      },
    });

    isRefreshing.current = false;

    if (response?.access_token) {
      dispatch(setAuthToken(response?.access_token));
      dispatch(setUserId(response?.userId));
      dispatch(setRefreshToken(response?.refresh_token));
      return response;
    }
    return null;
  }, [dispatch, post, refreshToken]);

  // ✅ Interceptors useEffect mein — sirf ek baar register, cleanup bhi
  useEffect(() => {
    const reqId = axiosInstance.interceptors.request.use(
      config => {
        if (authToken && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${authToken}`;
        }

        if (config.url) {
          console.log('🌐 FULL URL:', `${config.baseURL}${config.url}`);
          console.log('📡 IsDealer:', IsDealer);

          if (
            IsDealer &&
            (config.url.startsWith('api/Radiant/') ||
              config.url.startsWith('api/RadiantCash/'))
          ) {
            config.url = `Dealer/${config.url}`;
          }

          console.log('📡 AFTER URL:', config.url);
        }
        return config;
      },
      error => Promise.reject(error),
    );

    const resId = axiosInstance.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401 && !isRefreshing.current) {
          isRefreshing.current = true;

          const response = await onRefreshToken();

          if (response) {
            error.config.headers.Authorization = `Bearer ${response?.access_token}`;
            return axiosInstance(error.config);
          } else {
            dispatch(reset());
            return Promise.reject(error);
          }
        }

        if (error.response?.data) return Promise.reject(error.response.data);
        return Promise.reject(error);
      },
    );

    // ✅ Cleanup — purane interceptors eject
    return () => {
      axiosInstance.interceptors.request.eject(reqId);
      axiosInstance.interceptors.response.eject(resId);
    };
  }, [authToken, IsDealer, onRefreshToken]);

  return { get, post, put };
};

export default useAxiosHook; 