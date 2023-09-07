'use client';
import { useMe } from '@/hooks/react-query/auth';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isError } = useMe();

  if (isError) {
    router.replace('/');
  }

  return <>{children}</>;
}
