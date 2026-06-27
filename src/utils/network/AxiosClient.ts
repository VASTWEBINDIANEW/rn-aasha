import axios from 'axios';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../reduxUtils/store';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { reset, setAuthToken, setRefreshToken, setUserId } from '../../reduxUtils/store/userInfoSlice';
import { APP_URLS } from './urls';

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
  const isRefreshing = useRef(false);
useEffect(()=>{
  console.log(authToken)
},[])
  const axiosInstance = useMemo(
    () =>
      axios.create({
        baseURL: 'http://native.uniquerechargesrs.in//',
        timeout: DEFAULT_TIMEOUT,
      }),
    [],
  );

  // ---------- API functions ----------
  const get = useCallback(
    async ({ url }: { url: string }) => {
      const response = await axiosInstance.get(url);
      console.warn(response, 'getdata')
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
        const timeout = getTimeoutForUrl(url);
        const response = await axiosInstance.post(url, data, {
          ...config,
          timeout,
        });
        console.log(response, 'postdata')
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

    try {
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
    } catch (err) {
      isRefreshing.current = false;
    }
    return null;
  }, [dispatch, post, refreshToken]);

  // ---------- Interceptors ----------
  useEffect(() => {
    const reqId = axiosInstance.interceptors.request.use(
      config => {
        if (authToken && !config.headers.Authorization) {
          config.headers.Authorization = `Bearer ${authToken}`;
        }

        if (config.url) {
          console.log('🌐 FULL URL:', `${config.baseURL}${config.url}`);
          if (
            IsDealer &&
            (config.url.startsWith('api/Radiant/') ||
              config.url.startsWith('api/RadiantCash/'))
          ) {
            config.url = `Dealer/${config.url}`;
          }
        }
        return config;
      },
      error => Promise.reject(error),
    );

    const resId = axiosInstance.interceptors.response.use(
      response => {
        // 🔥 CASE 1: Agar Status 200 hai par body mein "Authorization has been denied" hai
        if (response?.data?.Message === "Authorization has been denied for this request.") {
          console.warn("⚠️ Auth Denied Message found in Success Response! Logging out...");
          dispatch(reset());
          return Promise.reject(response.data);
        }
        return response;
      },
      async error => {
        console.warn('Interceptor Error:', error);

        const errorMessage = error.response?.data?.Message;
        
        // 🔥 CASE 2: Agar error body mein explicitly yeh Message mil jaye
        if (errorMessage === "Authorization has been denied for this request.") {
          console.warn("⚠️ Auth Denied Message found in Error Response! Logging out...");
          dispatch(reset());
          return Promise.reject(error.response?.data || error);
        }

        // Standard 401 token refresh logic
        if (error.response?.status === 401 && !isRefreshing.current) {
          isRefreshing.current = true;

          const response = await onRefreshToken();

          if (response) {
            error.config.headers.Authorization = `Bearer ${response?.access_token}`;
            return axiosInstance(error.config);
          } else {
            console.warn("⚠️ Refresh token failed. Logging out...");
            dispatch(reset());
            return Promise.reject(error);
          }
        }

        if (error.response?.data) return Promise.reject(error.response.data);
        return Promise.reject(error);
      },
    );

    return () => {
      axiosInstance.interceptors.request.eject(reqId);
      axiosInstance.interceptors.response.eject(resId);
    };
  }, [authToken, IsDealer, onRefreshToken, dispatch]);

  return { get, post, put };
};

export default useAxiosHook;