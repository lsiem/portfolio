import { useEffect, useRef } from 'react';
import { gsap } from '@/hooks/useGsapScroll';
import { aboutContent, profileImage } from '@/content';
import { SectionWrapper } from '@/components/layout/SectionWrapper';
import { useMotionPreferences } from '@/hooks/useReducedMotion';

export function AboutSection() {
  const imageRef = useRef<HTMLDivElement>(null);
  const { reducedMotion } = useMotionPreferences();

  useEffect(() => {
    if (reducedMotion || !imageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        { clipPath: 'circle(20% at 50% 50%)', opacity: 0.4 },
        {
          clipPath: 'circle(75% at 50% 50%)',
          opacity: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: imageRef.current,
            start: 'top 80%',
            end: 'bottom 40%',
            scrub: 0.6,
          },
        },
      );
    });

    return () => ctx.revert();
  }, [reducedMotion]);

  return (
    <SectionWrapper id="about" ariaLabelledby="about-title">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <p className="mb-3 font-mono text-sm uppercase tracking-[0.25em] text-accent">
            About
          </p>
          <h2 id="about-title" className="mb-6 text-4xl font-bold md:text-5xl">
            {aboutContent.headline}
          </h2>
          <p className="mb-8 text-lg leading-relaxed text-white/75">{aboutContent.bio}</p>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {aboutContent.stats.map((stat) => (
              <div key={stat.label} className="glass-panel p-4 text-center">
                <div className="text-2xl font-bold text-accent">
                  {stat.value}
                  {stat.suffix ?? ''}
                </div>
                <div className="mt-1 text-xs uppercase tracking-wide text-white/60">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          ref={imageRef}
          className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-space-800"
        >
          <img
            src={profileImage}
            alt="Lasse Siemoneit"
            width={640}
            height={800}
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-space-950/70 via-transparent to-transparent" />
        </div>
      </div>
    </SectionWrapper>
  );
}
