'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useVerify } from '../../../hooks/auth';

export default function Verify({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { token } = searchParams;
  const router = useRouter();
  const verifyMutation = useVerify();

  useEffect(() => {
    verifyMutation.mutate({ token: (token ?? '') as string });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (verifyMutation.isSuccess) {
      router.replace('/dashboard');
    } else {
      router.replace('/register');
    }
  }, [verifyMutation, router]);

  return (
    <div className="mt-36">
      <h1>Email Verification</h1>
    </div>
  );
}
