'use client';
import React from 'react';
import './global.css';

import Navbar from './layout/Navbar';
import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-900">
        <Providers>
          <header className="flex justify-center">
            <Navbar />
          </header>
          <main className="relative min-h-screen pt-20">
            <div className="relative max-w-12xl mx-auto px-8">{children}</div>
          </main>
          <footer></footer>
        </Providers>
      </body>
    </html>
  );
}
