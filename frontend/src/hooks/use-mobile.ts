import { useEffect, useState } from 'react';

/**
 * Returns true when the current viewport matches or is narrower than the
 * "md" Tailwind breakpoint (768px). Used by the Sidebar component to decide
 * between a desktop permanent sidebar and a mobile drawer.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsMobile(mediaQuery.matches);

    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
