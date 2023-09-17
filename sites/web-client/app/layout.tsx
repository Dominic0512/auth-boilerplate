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
    <nav className="w-screen max-w-12xl fixed flex flex-row p-2 md:p-4 items-center justify-between bg-base-100 z-50">
      <div className="mx-2 md:mx-4 flex">
        <Link className="hidden md:block text-2xl font-bold" href="/">
          <h1>Auth Boilerplate</h1>
        </Link>
        <div className="block md:hidden dropdown">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h7"
              />
            </svg>
          </label>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
          >
            {links.map((link) => (
              <NavLink key={link.name} href={link.href}>
                <span className="text-lg">{link.name}</span>
              </NavLink>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex-1 mx-2 md:mx-4 flex justify-center md:justify-end">
        <ul className="hidden md:flex flex-row items-center justify-center md:justify-end gap-4">
          {links.map((link) => (
            <NavLink key={link.name} href={link.href}>
              <span className="text-lg">{link.name}</span>
            </NavLink>
          ))}
        </ul>
        <Link className="inline md:hidden text-md font-bold" href="/">
          <span>Auth Boilerplate</span>
        </Link>
      </div>
      <div className="mx-2 md:mx-4 flex items-center gap-4 ">
        <div className="relative w-10 md:w-12 h-10 md:h-12">
          <DarkModeToggle />
        </div>
        {!isError && isFetched ? (
          <div className="dropdown dropdown-end relative w-10 md:w-12 h-10 md:h-12 ">
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
