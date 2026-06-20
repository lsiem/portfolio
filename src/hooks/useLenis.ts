import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from '@/hooks/useGsapScroll';
import { useMotionPreferences } from '@/hooks/useReducedMotion';

export function useLenis(): void {
  const { lenisEnabled } = useMotionPreferences();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!lenisEnabled) {
      lenisRef.current?.destroy();
      lenisRef.current = null;
      return;
    }

    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    lenisRef.current = lenis;

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [lenisEnabled]);
}

export function useLenisScrollTo(): (target: string) => void {
  const { lenisEnabled } = useMotionPreferences();

  return (target: string) => {
    const element = document.querySelector(target);
    if (!element) return;

    if (lenisEnabled) {
      const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
      lenis?.scrollTo(element as HTMLElement, { offset: -80 });
    } else {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
}

export { gsap };
