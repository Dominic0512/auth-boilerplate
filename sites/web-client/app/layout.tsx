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
          <main className="pt-16">{children}</main>
          <footer></footer>
        </Providers>
      </body>
    </html>
  );
}
