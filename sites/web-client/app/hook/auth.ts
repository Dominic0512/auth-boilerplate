import { useMutation, useQuery } from '@tanstack/react-query';
import { AuthApiInstance } from '../api-client';
import { useAuthStore } from '../store/auth';
import {
  TokenResponse,
  UserDto,
  LoginRequest,
  RegisterRequest,
} from '../generated';

function useRegister() {
  return useMutation<UserDto, Error, RegisterRequest>({
    mutationFn: async (variables) => {
      const { data } = await AuthApiInstance.authControllerRegister(variables);
      return data;
    },
    onSuccess: () => {},
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

export { useRegister, useLogin, useMe };
