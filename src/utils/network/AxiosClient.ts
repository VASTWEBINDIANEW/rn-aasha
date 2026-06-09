import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  reset,
  setAuthToken,
  setRefreshToken,
  setUserId,
} from '../../reduxUtils/store/userInfoSlice';
import { APP_URLS } from './urls';
import { encrypt } from '../encryptionUtils';

const useAxiosHook = () => {
  const { authToken = '', refreshToken, IsDealer } = useSelector(
    (state: RootState) => state.userInfo,
  );
  const dispatch = useDispatch();

  // ✅ useRef se isRefreshing persist karega re-renders ke beech
  const isRefreshing = useRef(false);

  // ✅ Interceptors ke andar latest values ke liye refs
  const authTokenRef = useRef(authToken);
  const refreshTokenRef = useRef(refreshToken);
  const isDealerRef = useRef(IsDealer);

  useEffect(() => {
    authTokenRef.current = authToken;
    console.log('**AUTH_TOKEN', authToken);
  }, [authToken]);

  useEffect(() => {
    refreshTokenRef.current = refreshToken;
  }, [refreshToken]);

  useEffect(() => {
    isDealerRef.current = IsDealer;
  }, [IsDealer]);

  const axiosInstance = useMemo(
    () =>
      axios.create({
        baseURL: 'http://native.stdigipe.in/',
        // baseURL: 'http://native.skeshari.in/',
        timeout: 120000,
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
        const response = await axiosInstance.post(url, data, config);
        return response.data;
      } catch (e) {
        // Alert.alert("API ERROR:", e?.response?.data || e?.message);
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

  // ---------- Refresh Token (Normal) ----------

  const onRefreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const data = {
        refresh_token: refreshTokenRef.current,
        grant_type: 'refresh_token',
      };

      const response = await axiosInstance.post(APP_URLS.getToken, data, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          Authorization: 'bearer',
        },
      });

      const resData = response.data;

      if (resData?.access_token) {
        dispatch(setAuthToken(resData.access_token));
        dispatch(setUserId(resData.userId));
        dispatch(setRefreshToken(resData.refresh_token));
        return resData.access_token; // ✅ sirf token return karo
      }

      return null;
    } catch (e) {
      console.log('❌ Refresh token failed:', e);
      return null; 
    } finally {
      isRefreshing.current = false; 
    }
  }, [axiosInstance, dispatch]);

  const onRefreshTokenTest = useCallback(async (): Promise<string | null> => {
    try {
      const encryption = encrypt(['9090909090', '123456789']);

      const data = {
        UserName: encryption.encryptedData[0],
        Password: encryption.encryptedData[1],
        grant_type: 'password',
      };

      const response = await axiosInstance.post(APP_URLS.getToken, data, {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          Authorization: 'bearer',
          value1: encryption.keyEncode,
          value2: encryption.ivEncode,
        },
      });

      const resData = response.data;

      if (resData?.access_token) {
        dispatch(setAuthToken(resData.access_token));
        dispatch(setUserId(resData.userId));
        dispatch(setRefreshToken(resData.refresh_token));
        return resData.access_token;
      }

      return null;
    } catch (e) {
      console.log('❌ Refresh token test failed:', e);
      return null;
    } finally {
      isRefreshing.current = false;
    }
  }, [axiosInstance, dispatch]);

  // ---------- Interceptors — sirf ek baar register hote hain ----------
  useEffect(() => {
    // ✅ Request Interceptor
    const reqInterceptor = axiosInstance.interceptors.request.use(
      config => {
        // ✅ authTokenRef.current use karo — stale closure se bachne ke liye
        const token = authTokenRef.current;
        if (token && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Dealer prefix handling
        if (config.url) {
          console.log('🌐 FULL URL:', `${config.baseURL}${config.url}`);
          console.log('📡 IsDealer:', isDealerRef.current);

          if (isDealerRef.current) {
            if (
              config.url.startsWith('api/Radiant/') ||
              config.url.startsWith('api/RadiantCash/')
            ) {
              config.url = `Dealer/${config.url}`;
            }
          }

          console.log('📡 AFTER URL:', config.url);
        }

        return config;
      },
      error => Promise.reject(error),
    );

    // ✅ Response Interceptor
    const resInterceptor = axiosInstance.interceptors.response.use(
      response => response,
      async error => {
        const status = error.response?.status;

        // ✅ 401 handle — isRefreshing.current check karo
        if (status === 401 && !isRefreshing.current) {
          isRefreshing.current = true;

          const newToken = await onRefreshToken();

          if (newToken) {
            // ✅ Original request retry with new token
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(error.config);
          } else {
            // ✅ Refresh bhi fail → logout/reset
            dispatch(reset());
            return Promise.reject(error);
          }
        }

        // Non-401 errors — server data agar hai to reject karo
        if (error.response?.data) {
          return Promise.reject(error.response.data);
        }

        return Promise.reject(error);
      },
    );

    // ✅ Cleanup — component unmount pe interceptors eject karo (memory leak se bachao)
    return () => {
      axiosInstance.interceptors.request.eject(reqInterceptor);
      axiosInstance.interceptors.response.eject(resInterceptor);
    };
  }, [axiosInstance, onRefreshToken, dispatch]);

  return { get, post, put };
};

export default useAxiosHook;