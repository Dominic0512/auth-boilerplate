'use client';
import Link from 'next/link';
import NavLink from './NavLink';
import DarkModeToggle from './DarkModeToggle';
import { useAuthStore } from '../store/auth';
import { useMe } from '../hook/auth';

const links = [{ name: 'Dashboard', href: '/dashboard' }];

export default function Navbar() {
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
