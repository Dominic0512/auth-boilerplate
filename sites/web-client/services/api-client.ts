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
});

type ApiInstanceParams = {
  configuration?: Configuration;
  basePath?: string;
  axiosInstance?: AxiosInstance;
};

function getCurrentAccessToken() {
  return useAuthStore.getState().accessToken;
}

function apiInstanceParamsFactory(params: ApiInstanceParams) {
  const { configuration, basePath, axiosInstance } = {
    configuration: undefined,
    basePath: undefined,
    axiosInstance: undefined,
    ...params,
  };
  return (apiFactory: any) =>
    apiFactory(configuration, basePath, axiosInstance);
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

const onErrorResponse = (error: AxiosError | Error): Promise<AxiosError> => {
  if (isAxiosError(error)) {
    const { message } = error;
    const { method, url } = error.config as AxiosRequestConfig;
    const { status } = (error.response as AxiosResponse) ?? {};

    logOnDev(
      `🚨 [API] ${method?.toUpperCase()} ${url} | Error ${status} ${message}`,
    );

    switch (status) {
      case 401: {
        break;
      }
      default: {
        break;
      }
    }
  } else {
    logOnDev(`🚨 [API] | Error ${error.message}`);
  }

  return Promise.reject(error);
};

axiosInstance.interceptors.request.use(onRequest, onErrorResponse);
axiosInstance.interceptors.response.use(onResponse, onErrorResponse);

const apiInstanceFactory = apiInstanceParamsFactory({ axiosInstance });
const AuthApiInstance = apiInstanceFactory(AuthApiFactory);
const UserApiInstance = apiInstanceFactory(UserApiFactory);

export { AuthApiInstance, UserApiInstance };
