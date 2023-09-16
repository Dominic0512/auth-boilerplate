/* eslint-disable @typescript-eslint/no-shadow */
import axios, {
  isAxiosError,
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { AuthApiFactory, UserApiFactory, Configuration } from '../generated';
import { useAuthStore } from '../store/auth';

const logOnDev = (message: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message);
  }
};

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_HOST,
  withCredentials: true,
});

type ApiInstanceParams = {
  configuration?: Configuration;
  basePath?: string;
  axiosInstance?: AxiosInstance;
};

type AxiosRequestRetryConfig = AxiosRequestConfig & { _retry: boolean };

function getCurrentAccessToken() {
  return useAuthStore.getState().accessToken;
}

function setAccessToken(accessToken: string) {
  return useAuthStore.getState().setAccessToken(accessToken);
}

function apiInstanceParamsFactory(params: ApiInstanceParams) {
  const { configuration, basePath, axiosInstance } = {
    configuration: undefined,
    basePath: undefined,
    axiosInstance: undefined,
    ...params,
  };
  return <T extends (...args: any[]) => any>(apiFactory: T): ReturnType<T> => {
    return apiFactory(configuration, basePath, axiosInstance);
  };
}

const onRequest = (
  config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
  const { method, url } = config;
  logOnDev(`🚀 [API] ${method?.toUpperCase()} ${url} | Request`);
  config.headers = config.headers ?? {};
  config.headers.Authorization = `Bearer ${getCurrentAccessToken()}`;
  return config;
};

const onResponse = (response: AxiosResponse): AxiosResponse => {
  return response;
};

const onErrorResponse = async (
  error: AxiosError | Error,
): Promise<AxiosError> => {
  if (!isAxiosError(error)) {
    logOnDev(`🚨 [API] | Error ${error.message}`);
    return Promise.reject(error);
  }

  const { message } = error;
  const response = error.response as AxiosResponse;
  const config = error.config as AxiosRequestRetryConfig;

  if (!config) return Promise.reject(error);

  const { method, url } = config;

  logOnDev(
    `🚨 [API] ${method?.toUpperCase()} ${url} | Error ${
      response?.status
    } ${message}`,
  );

  if (
    response?.status === 401 &&
    response?.data.message === 'Token expired' &&
    !config._retry
  ) {
    config._retry = true;

    const AuthApiInstance = apiInstanceParamsFactory({ axiosInstance })(
      AuthApiFactory,
    );
    const {
      data: { accessToken },
    } = await AuthApiInstance.authControllerRefreshToken();

    setAccessToken(accessToken);

    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;

    return axiosInstance(config);
  }

  return Promise.reject(error);
};

axiosInstance.interceptors.request.use(onRequest);
axiosInstance.interceptors.response.use(onResponse, onErrorResponse);

const apiInstanceFactory = apiInstanceParamsFactory({ axiosInstance });
const AuthApiInstance = apiInstanceFactory(AuthApiFactory);
const UserApiInstance = apiInstanceFactory(UserApiFactory);

export { AuthApiInstance, UserApiInstance };
