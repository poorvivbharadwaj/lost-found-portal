import { useEffect, useRef } from 'react';

/**
 * Lightweight scroll-reveal hook. Attach the returned ref to any element,
 * add className="reveal" (see index.css), and it gains "reveal-visible"
 * once it scrolls into view. No-ops gracefully if IntersectionObserver
 * is unavailable, and respects prefers-reduced-motion automatically via CSS.
 */
export default function useScrollReveal(options = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      if (el) el.classList.add('reveal-visible');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('reveal-visible');
          observer.unobserve(el);
        }
      },
      { threshold: 0.15, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return ref;
}
