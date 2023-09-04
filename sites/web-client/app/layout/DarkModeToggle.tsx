'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';

import { SunIcon, MoonIcon } from './icons';
import { motion } from 'framer-motion';

/*
  NOTE: currently, twin.macro does not support SWC complier of Next.js
  see: https://github.com/ben-rogerson/twin.macro/discussions/516
  TODO: refactor variants via twin.macro package.
*/
const moonIconVariants = {
  show: {
    rotate: 0,
    color: 'white',
  },
  hide: {
    rotate: 90,
    color: 'black',
  },
};

const sunIconVariants = {
  show: {
    rotate: 0,
    color: 'black',
  },
  hide: {
    rotate: -90,
    color: 'white',
  },
};

const IconTransition = {
  duration: 0.5,
};

export default function DarkModeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  const darkModeToggle = () =>
    theme === 'dark' ? setTheme('light') : setTheme('dark');

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <button
      className="w-12 h-12 overflow-hidden rounded-full border-black hover:border-gray-300 dark:border-white dark:hover:border-gray-500 inline-flex items-center justify-center border-2 transition focus:outline-none'"
      onClick={darkModeToggle}
    >
      <div className="relative w-8 h-8">
        <motion.span
          className="absolute inset-0"
          style={{ transformOrigin: '50% 96px' }}
          variants={moonIconVariants}
          animate={theme === 'dark' ? 'show' : 'hide'}
          transition={IconTransition}
        >
          <MoonIcon />
        </motion.span>
        <motion.span
          className="absolute inset-0"
          style={{ transformOrigin: '50% 96px' }}
          variants={sunIconVariants}
          animate={theme === 'dark' ? 'hide' : 'show'}
          transition={IconTransition}
        >
          <SunIcon />
        </motion.span>
      </div>
    </button>
  );
}
