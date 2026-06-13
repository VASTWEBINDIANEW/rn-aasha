import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import { useCallback, useEffect, useMemo } from 'react';
import { reset, setAuthToken, setRefreshToken, setUserId } from '../../reduxUtils/store/userInfoSlice';
import { APP_URLS } from './urls';
import { encrypt } from '../encryptionUtils';

const useAxiosHook = () => {
  const { authToken = '', refreshToken, IsDealer } = useSelector(
    (state: RootState) => state.userInfo,
  );
  const dispatch = useDispatch();
  let isRefreshing = false;

  useEffect(() => {
    console.log('**AUTH_TOKEN', authToken);
  }, [authToken]);
  

  const axiosInstance = useMemo(
    () =>
      axios.create({
<<<<<<< HEAD
        baseURL: 'http://native.ssvcms.in/',
=======
        baseURL: 'http://native.adityaintelligence.in.net/',
>>>>>>> 1f3d23d0bf79e62d3bf243dd76b35e63adeaf9c8
        //  baseURL: 'http://native.skeshari.in/',
        timeout: 120000
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
    isRefreshing = false;

    if (response?.access_token) {
      dispatch(setAuthToken(response?.access_token));
      dispatch(setUserId(response?.userId));
      dispatch(setRefreshToken(response?.refresh_token));
      return response;
    }
    return null;
  }, [dispatch, post, refreshToken]);

  // ---------- Refresh Token (Test - Username/Password + Encryption) ----------
  const onRefreshTokenTest = useCallback(async () => {
    const encryption = encrypt(['9090909090', '123456789']);

    const data = {
      UserName: encryption.encryptedData[0],
      Password: encryption.encryptedData[1],
      grant_type: 'password',
    };

    const response = await post({
      url: APP_URLS.getToken,
      data,
      config: {
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          Authorization: 'bearer',
          value1: encryption.keyEncode,
          value2: encryption.ivEncode,
        },
      },
    });
    isRefreshing = false;

    if (response?.access_token) {
      dispatch(setAuthToken(response?.access_token));
      dispatch(setUserId(response?.userId));
      dispatch(setRefreshToken(response?.refresh_token));
      return response;
    }
    return null;
  }, [dispatch, post]);

  // ---------- Request Interceptor ----------
  axiosInstance.interceptors.request.use(
    config => {
      // Token set karna
      if (authToken && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${authToken}`;
      }

      // Dealer prefix handling
      if (config.url) {
      console.log('🌐 FULL URL:', `${config.baseURL}${config.url}`);
      console.log('📡 IsDealer:', IsDealer);       // ← add
        if (IsDealer) {
          if (
            config.url.startsWith("api/Radiant/") ||
            config.url.startsWith("api/RadiantCash/")
          ) {
            config.url = `Dealer/${config.url}`;
          }
        }
              console.log('📡 AFTER URL:', config.url);   // ← add

      }
      return config;
    },
    error => Promise.reject(error),
  );

  // ---------- Response Interceptor ----------
  axiosInstance.interceptors.response.use(
    response => response,
    async error => {
      if (error.response && error.response.status === 401 && isRefreshing === false) {
        isRefreshing = true;

        // Pehle test wala refresh
        let response = await onRefreshToken();


        if (response) {
          error.config.headers.Authorization = `Bearer ${response?.access_token}`;
          return axiosInstance(error.config);
        } else {
          dispatch(reset());
          return Promise.reject(error);
        }
      }
      if (error.response && error.response.data) {
        return Promise.reject(error.response.data);
      }
      return Promise.reject(error);
    },
  );

  return { get, post, put };
};

export default useAxiosHook;