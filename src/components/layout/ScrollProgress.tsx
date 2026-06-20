import { useEffect, useState } from 'react';
import { gsap } from '@/hooks/useGsapScroll';
import { useMotionPreferences } from '@/hooks/useReducedMotion';

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const { reducedMotion } = useMotionPreferences();

  useEffect(() => {
    if (reducedMotion) return;

    const update = () => {
      const scrollTop = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? scrollTop / height : 0);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;
    gsap.to('#scroll-progress-bar', {
      scaleX: progress,
      transformOrigin: 'left center',
      duration: 0.15,
      ease: 'none',
    });
  }, [progress, reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed left-0 right-0 top-0 z-[70] h-0.5 bg-white/5"
    >
      <div
        id="scroll-progress-bar"
        className="h-full w-full origin-left scale-x-0 bg-accent"
      />
    </div>
  );
}
