'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import zod from 'zod';

import { useLogin } from '../../../hooks/auth';
import { passwordRule } from '../shared';

interface FormData {
  email: string;
  password: string;
}

const formSchema = zod.object({
  email: zod.string().email(),
  password: passwordRule,
});

export default function Login() {
  const router = useRouter();
  const loginMutation = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = handleSubmit(
    (data) => {
      loginMutation.mutate(data);
      router.replace('/dashboard');
    },
    (error) => console.error(error),
  );

  return (
    <div className="mt-36">
      <form className="flex justify-center" onSubmit={onSubmit}>
        <div className="w-96 flex flex-col gap-4">
          <div className="flex flex-col justify-center gap-2">
            <label className="grow">Email</label>
            <input
              className="w-full h-10"
              type="email"
              {...register('email')}
            ></input>
            <p className="text-red-500">{errors.email?.message}</p>
          </div>
          <div className="flex flex-col justify-center gap-2">
            <label className="grow">Password</label>
            <input
              className="w-full h-10"
              type="password"
              {...register('password')}
            ></input>
            <p className="text-red-500">{errors.password?.message}</p>
          </div>
          <button
            className="border border-white py-2"
            type="button"
            onClick={onSubmit}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
