'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import zod from 'zod';

import { useLogin } from '@/hooks/react-query/auth';
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
    mode: 'onBlur',
    resolver: zodResolver(formSchema),
  });

  const onSubmit = handleSubmit(
    (data) => {
      loginMutation.mutate(data);
    },
    (error) => console.error(error),
  );

  useEffect(() => {
    if (loginMutation.isSuccess) {
      router.replace('/dashboard');
    }
  }, [loginMutation, router]);

  return (
    <div className="mt-32">
      <form className="flex justify-center" onSubmit={onSubmit}>
        <div className="box w-96 p-8 flex flex-col gap-4">
          <div className="flex flex-col justify-center gap-2">
            <label className="grow">Email</label>
            <input
              className="input input-bordered w-full"
              type="email"
              {...register('email')}
            ></input>
            <p className="text-red-500">{errors.email?.message}</p>
          </div>
          <div className="flex flex-col justify-center gap-2">
            <label className="grow">Password</label>
            <input
              className="input input-bordered w-full"
              type="password"
              {...register('password')}
            ></input>
            <p className="text-red-500">{errors.password?.message}</p>
          </div>
          <button className="btn" type="button" onClick={onSubmit}>
            Login
          </button>
          <div className="divider">OR</div>
          <Link href="/authorize/facebook" className="btn btn-facebook">
            Continue With Facebook
          </Link>
          <Link href="/authorize/google" className="btn btn-google">
            Continue With Google
          </Link>
          <Link href="register" className="underline text-center">
            Go to register.
          </Link>
        </div>
      </form>
    </div>
  );
}
