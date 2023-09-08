import { useMutation, useQuery } from '@tanstack/react-query';
import { AuthApiInstance } from '@/services/api-client';
import { useAuthStore } from '@/store/auth';
import {
  TokenResponse,
  UserDto,
  LoginRequest,
  RegisterRequest,
  VerifyRequest,
  UpdateMyNameDto,
} from '@/generated';
import { queryClient } from './index';

function useRegister() {
  return useMutation<UserDto, Error, RegisterRequest>({
    mutationFn: async (variables) => {
      const { data } = await AuthApiInstance.authControllerRegister(variables);
      return data;
    },
    onSuccess: () => {},
  });
}

function useVerify() {
  return useMutation<TokenResponse, Error, VerifyRequest>({
    mutationFn: async (variables) => {
      const { data } = await AuthApiInstance.authControllerVerify(variables);
      return data;
    },
    onSuccess: ({ accessToken }) => {
      useAuthStore.getState().setAccessToken(accessToken);
    },
  });
}

function useLogin() {
  return useMutation<TokenResponse, Error, LoginRequest>({
    mutationFn: async (variables) => {
      const { data } = await AuthApiInstance.authControllerLogin(variables);
      return data;
    },
    onSuccess: ({ accessToken }) => {
      useAuthStore.getState().setAccessToken(accessToken);
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

function useMe() {
  return useQuery<UserDto, Error, UserDto>({
    queryKey: ['me'],
    queryFn: async () => {
      const { data } = await AuthApiInstance.authControllerMe();
      return data;
    },
  });
}

function useUpdateMyname() {
  return useMutation<UserDto, Error, UpdateMyNameDto>({
    mutationFn: AuthApiInstance.authControllerUpdateMyName,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

function useLogout() {
  return useMutation<unknown, Error, unknown>({
    mutationFn: AuthApiInstance.authControllerLogout,
    onSuccess: () => {
      useAuthStore.getState().setAccessToken('');
      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
  });
}

export { useRegister, useVerify, useLogin, useMe, useUpdateMyname, useLogout };
