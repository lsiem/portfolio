import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from '@/hooks/useGsapScroll';
import { useMotionPreferences } from '@/hooks/useReducedMotion';
import { cn } from '@/utils/cn';

interface SectionWrapperProps {
  id: string;
  children: ReactNode;
  className?: string;
  ariaLabelledby?: string;
}

export function SectionWrapper({
  id,
  children,
  className,
  ariaLabelledby,
}: SectionWrapperProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useMotionPreferences();

  useEffect(() => {
    if (reducedMotion || !sectionRef.current || !contentRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 60 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={cn('section-shell', className)}
      aria-labelledby={ariaLabelledby}
    >
      <div ref={contentRef}>{children}</div>
    </section>
  );
}
