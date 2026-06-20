import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/hooks/useGsapScroll';
import { useMotionPreferences } from '@/hooks/useReducedMotion';

const STORAGE_KEY = 'customCursorEnabled';

export function CustomCursor() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useMotionPreferences();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const stored = localStorage.getItem(STORAGE_KEY);
    const initialEnabled = stored ? stored === 'true' : finePointer;
    setEnabled(initialEnabled && finePointer && !reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    if (!enabled) {
      document.documentElement.classList.remove('has-custom-cursor');
      return;
    }

    document.documentElement.classList.add('has-custom-cursor');
    localStorage.setItem(STORAGE_KEY, 'true');

    // Center the dots on the pointer via gsap's percentage transform. A CSS
    // `-translate-x/y-1/2` class would be clobbered by gsap writing the full
    // transform matrix when it animates `x`/`y`, leaving the dots off-center.
    gsap.set([outerRef.current, innerRef.current], { xPercent: -50, yPercent: -50 });

    const outerX = gsap.quickTo(outerRef.current, 'x', { duration: 0.5, ease: 'power3.out' });
    const outerY = gsap.quickTo(outerRef.current, 'y', { duration: 0.5, ease: 'power3.out' });
    const innerX = gsap.quickTo(innerRef.current, 'x', { duration: 0.2, ease: 'power3.out' });
    const innerY = gsap.quickTo(innerRef.current, 'y', { duration: 0.2, ease: 'power3.out' });

    const move = (event: MouseEvent) => {
      outerX(event.clientX);
      outerY(event.clientY);
      innerX(event.clientX);
      innerY(event.clientY);
    };

    window.addEventListener('mousemove', move);
    return () => {
      window.removeEventListener('mousemove', move);
      document.documentElement.classList.remove('has-custom-cursor');
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={outerRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[200] h-8 w-8 rounded-full border border-accent/60"
      />
      <div
        ref={innerRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[201] h-2 w-2 rounded-full bg-accent"
      />
    </>
  );
}
