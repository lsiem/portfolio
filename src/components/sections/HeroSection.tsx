import { lazy, Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { aboutContent, personalInfo } from '@/content';
import { uiText } from '@/content/ui';
import { SectionWrapper } from '@/components/layout/SectionWrapper';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { scrollToSection } from '@/utils/cn';
import { DevTerminal } from '@/components/easter-eggs/DevTerminal';

const HeroScene = lazy(() =>
  import('@/components/three/HeroScene').then((module) => ({ default: module.HeroScene })),
);

function TypingRoles() {
  const [index, setIndex] = useState(0);
  const roles = uiText.hero.typingRoles;

  return (
    <motion.span
      key={roles[index]}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-mono text-accent"
      onAnimationComplete={() => {
        window.setTimeout(() => setIndex((current) => (current + 1) % roles.length), 1800);
      }}
    >
      {roles[index]}
    </motion.span>
  );
}

export function HeroSection() {
  const [terminalOpen, setTerminalOpen] = useState(false);

  return (
    <SectionWrapper
      id="home"
      className="flex min-h-screen items-center pt-28"
      ariaLabelledby="hero-title"
    >
      <div className="grid w-full items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <motion.button
            type="button"
            className="inline-flex rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-xs text-accent"
            onClick={() => setTerminalOpen(true)}
            aria-label="Dev Terminal öffnen"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {uiText.hero.terminalBadge}
          </motion.button>

          <motion.h1
            id="hero-title"
            className="text-5xl font-bold leading-tight md:text-7xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.8 }}
          >
            <span className="text-gradient">{uiText.hero.greeting}</span>
          </motion.h1>

          <motion.p
            className="max-w-2xl text-lg text-white/75 md:text-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            {aboutContent.heroTagline}
          </motion.p>

          <motion.div
            className="flex items-center gap-2 font-mono text-sm text-white/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <TypingRoles />
            <span className="animate-pulse text-accent">▍</span>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85 }}
          >
            <MagneticButton onClick={() => scrollToSection('#projects')}>
              {uiText.hero.ctaProjects}
            </MagneticButton>
            <MagneticButton href={personalInfo.github}>{uiText.hero.ctaGithub}</MagneticButton>
          </motion.div>
        </div>

        <motion.div
          className="relative aspect-square min-h-[320px] overflow-hidden rounded-[2rem] border border-white/10 bg-space-900/60"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <Suspense
            fallback={
              <div className="flex h-full items-center justify-center text-sm text-white/60">
                3D wird geladen…
              </div>
            }
          >
            <HeroScene />
          </Suspense>
        </motion.div>
      </div>

      <DevTerminal open={terminalOpen} onClose={() => setTerminalOpen(false)} />
    </SectionWrapper>
  );
}
