'use client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthByIdToken } from '@/hooks/react-query/auth';

export default function OAuthCallbackPage() {
  const router = useRouter();
  const authByIdToken = useAuthByIdToken();
  useEffect(() => {
    const idToken =
      new URLSearchParams(window.location.hash.substring(1)).get('id_token') ??
      '';

    authByIdToken.mutate({ idToken });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (authByIdToken.isSuccess) {
      router.push('profile');
    }
  }, [authByIdToken, router]);
  return <div>OAuth Callback Page.</div>;
}
