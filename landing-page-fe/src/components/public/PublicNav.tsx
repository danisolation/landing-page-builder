'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Moon, Sun } from 'lucide-react';

export interface PublicNavProps {
  pageTitle: string;
}

export default function PublicNav({ pageTitle }: PublicNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const lastScrollYRef = useRef(0);

  // Sync dark mode class to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 50);
      setHidden(currentScrollY > lastScrollYRef.current && currentScrollY > 200);
      lastScrollYRef.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDark = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      } ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <span className={`font-bold text-lg transition-colors ${
          scrolled ? 'text-gray-900 dark:text-white' : 'text-white'
        }`}>
          {pageTitle}
        </span>

        <button
          onClick={toggleDark}
          className={`p-2 rounded-lg transition-colors ${
            scrolled
              ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
          aria-label="Toggle dark mode"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </nav>
  );
}
