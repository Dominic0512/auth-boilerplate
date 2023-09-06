'use client';
import React, { PropsWithChildren } from 'react';
import './global.css';
import Link, { LinkProps } from 'next/link';

import { useMe } from '../hooks/auth';
import DarkModeToggle from '../components/DarkModeToggle';
import { useAuthStore } from '../store/auth';

import { Providers } from './providers';

const links = [{ name: 'Dashboard', href: '/dashboard' }];

function NavLink({ children, ...rest }: PropsWithChildren<LinkProps>) {
  return (
    <li className="underline">
      <Link {...rest}>{children}</Link>
    </li>
  );
}

function Navbar() {
  const { accessToken } = useAuthStore();
  const { data } = useMe();

  return (
    <nav className="w-screen max-w-12xl fixed flex flex-row px-8 py-4 items-center justify-between bg-white dark:bg-gray-900 z-50">
      <Link className="text-2xl font-bold" href="/">
        <h1>Auth Boilerplate Demo</h1>
      </Link>
      <div className="flex-1 mx-8">
        <ul className="flex flex-row items-center justify-end gap-4">
          {links.map((link) => (
            <NavLink key={link.name} href={link.href}>
              <span className="text-lg">{link.name}</span>
            </NavLink>
          ))}
        </ul>
      </div>
      <div>
        <DarkModeToggle></DarkModeToggle>
      </div>
      <div>{accessToken && data?.email}</div>
    </nav>
  );
}

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
