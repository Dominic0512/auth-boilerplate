'use client';

import Link, { LinkProps } from 'next/link';
import { usePathname } from 'next/navigation';
import { PropsWithChildren } from 'react';

export default function NavLink({
  children,
  ...rest
}: PropsWithChildren<LinkProps>) {
  return (
    <li className="underline">
      <Link {...rest}>{children}</Link>
    </li>
  );
}
