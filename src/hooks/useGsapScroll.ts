import { useCallback, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useGsapScroll(setup: () => void, deps: unknown[] = []): void {
  const setupRef = useRef(setup);
  setupRef.current = setup;

  const stableSetup = useCallback(() => {
    setupRef.current();
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      stableSetup();
    });

    return () => {
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stableSetup, ...deps]);
}

export function refreshScrollTrigger(): void {
  ScrollTrigger.refresh();
}

export { gsap, ScrollTrigger };
