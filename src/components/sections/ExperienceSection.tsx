import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { experienceContent } from '@/content';
import { uiText } from '@/content/ui';
import { SectionWrapper } from '@/components/layout/SectionWrapper';
import { gsap, useGsapScroll } from '@/hooks/useGsapScroll';
import { useMotionPreferences } from '@/hooks/useReducedMotion';

export function ExperienceSection() {
  const lineRef = useRef<HTMLDivElement>(null);
  const [flippedId, setFlippedId] = useState<string | null>(null);
  const { reducedMotion } = useMotionPreferences();

  useGsapScroll(() => {
    if (reducedMotion || !lineRef.current) return;

    gsap.fromTo(
      lineRef.current,
      { scaleY: 0 },
      {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '#experience',
          start: 'top 60%',
          end: 'bottom 20%',
          scrub: 0.5,
        },
      },
    );
  }, [reducedMotion]);

  return (
    <SectionWrapper id="experience" ariaLabelledby="experience-title">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 max-w-3xl">
          <p className="mb-3 font-mono text-sm uppercase tracking-[0.25em] text-accent">
            Experience
          </p>
          <h2 id="experience-title" className="mb-4 text-4xl font-bold md:text-5xl">
            {experienceContent.subtitle}
          </h2>
          <p className="text-lg text-white/70">{experienceContent.description}</p>
        </div>

        <div className="relative">
          <div
            ref={lineRef}
            aria-hidden="true"
            className="absolute bottom-0 left-4 top-0 w-px origin-top bg-gradient-to-b from-accent/20 via-accent to-accent/20 md:left-1/2"
          />

          <div className="space-y-10">
            {experienceContent.experiences.map((item, index) => {
              const id = `${item.company}-${index}`;
              const isFlipped = flippedId === id;

              return (
                <motion.article
                  key={id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  className={`relative grid md:grid-cols-2 md:gap-10 ${
                    index % 2 === 0 ? '' : 'md:[&>div:first-child]:order-2'
                  }`}
                >
                  <div className="hidden md:block" />
                  <button
                    type="button"
                    onClick={() => setFlippedId(isFlipped ? null : id)}
                    className="glass-panel group w-full p-6 text-left transition-transform hover:scale-[1.02]"
                    aria-expanded={isFlipped}
                  >
                    {!isFlipped ? (
                      <>
                        <div className="mb-4 flex items-center gap-4">
                          <img
                            src={item.logoPath}
                            alt=""
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-xl bg-white/10 p-2 grayscale transition-all group-hover:grayscale-0"
                          />
                          <div>
                            <h3 className="text-xl font-semibold">{item.title}</h3>
                            <p className="text-accent">{item.company}</p>
                          </div>
                        </div>
                        <p className="text-sm text-white/60">
                          {item.duration} · {item.location}
                        </p>
                        <p className="mt-4 text-white/75">{item.description}</p>
                        <p className="mt-4 text-xs uppercase tracking-wide text-white/40">
                          {uiText.experience.flipHint}
                        </p>
                      </>
                    ) : (
                      <div>
                        <p className="mb-3 font-mono text-sm text-accent">
                          {uiText.experience.back}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {item.techStack.map((tech) => (
                            <span
                              key={tech}
                              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </button>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
