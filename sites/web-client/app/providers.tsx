'use client';
import { PropsWithChildren } from 'react';
import { ThemeProvider } from 'next-themes';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '@/hooks/react-query';

export function Providers({ children }: PropsWithChildren<unknown>) {
  return (
    <ThemeProvider attribute="class">
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </ThemeProvider>
  );
}
