'use client';
import './global.css';
import React, { PropsWithChildren, useEffect } from 'react';
import Link, { LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';

import { useLogout, useMe } from '@/hooks/react-query/auth';
import DarkModeToggle from '@/components/DarkModeToggle';
import Avatar from '@/components/Avatar';

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
  const router = useRouter();
  const { data, isFetched, isError } = useMe();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate({});
  };

  useEffect(() => {
    if (logoutMutation.isSuccess) {
      router.replace('/');
    }
  }, [logoutMutation, router]);

  return (
    <nav className="w-screen max-w-12xl fixed flex flex-row px-8 py-4 items-center justify-between bg-base-100 z-50">
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
      <div className="flex items-center gap-4">
        <div>
          <DarkModeToggle />
        </div>
        {!isError && isFetched ? (
          <div className="dropdown dropdown-end">
            <Avatar name={data?.name} />
            <ul className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
              <li>
                <Link href="/profile">Profile</Link>
              </li>
              <li>
                <button type="button" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <button
            type="button"
            className="btn"
            onClick={() => router.push('/login')}
          >
            Login / Register
          </button>
        )}
      </div>
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
      <body className="bg-base-100">
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
