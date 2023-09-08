'use client';
import Link from 'next/link';
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import zod from 'zod';

import { useRegister } from '@/hooks/react-query/auth';
import { passwordRule } from '../shared';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
}

const formSchema = zod
  .object({
    email: zod.string().email(),
    password: passwordRule,
    confirmPassword: passwordRule,
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: 'The password is inconsistent.',
    path: ['confirmPassword'],
  });

export default function Register() {
  const registerMutation = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    mode: 'onBlur',
    resolver: zodResolver(formSchema),
  });

  const onSubmit = handleSubmit(
    ({ confirmPassword, ...remainingData }: FormData) => {
      registerMutation.mutate(remainingData);
    },
    (error) => console.error(error),
  );

  return (
    <div className="mt-20">
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
          <div className="flex flex-col justify-center gap-2">
            <label className="grow">Confirm Password</label>
            <input
              className="input input-bordered w-full"
              type="password"
              {...register('confirmPassword')}
            ></input>
            <p className="text-red-500">{errors.confirmPassword?.message}</p>
          </div>
          <button className="btn" type="button" onClick={onSubmit}>
            Register
          </button>
          <div className="divider">OR</div>
          <Link href="/authorize/facebook" className="btn btn-facebook">
            Continue With Facebook
          </Link>
          <Link href="/authorize/google" className="btn btn-google">
            Continue With Google
          </Link>
          <Link href="login" className="underline text-center">
            Go to login.
          </Link>
        </div>
      </form>
    </div>
  );
}
