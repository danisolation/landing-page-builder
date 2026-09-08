'use client';

import { useEffect, useRef, useState } from 'react';

export function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  // Starts true so the SSR HTML and first paint render content visible —
  // the LCP element is never gated on JS. Elements below the viewport are
  // hidden immediately after hydration (off-screen, so the user never
  // sees it happen) and revealed by the observer on scroll.
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Already on screen (hero, above-the-fold content) — never hide it.
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    setIsInView(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '-80px', ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, isInView };
}
