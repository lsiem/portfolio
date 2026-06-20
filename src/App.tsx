import { lazy, Suspense } from 'react';
import { Header } from '@/components/layout/Header';
import { ScrollProgress } from '@/components/layout/ScrollProgress';
import { HeroSection } from '@/components/sections/HeroSection';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ParticleBackground } from '@/components/ParticleBackground';
import { CustomCursor } from '@/components/CustomCursor';
import { MotionPreferencesProvider } from '@/hooks/useReducedMotion';
import { useLenis } from '@/hooks/useLenis';

const SkillsSection = lazy(() =>
  import('@/components/sections/SkillsSection').then((module) => ({
    default: module.SkillsSection,
  })),
);
const AboutSection = lazy(() =>
  import('@/components/sections/AboutSection').then((module) => ({
    default: module.AboutSection,
  })),
);
const ExperienceSection = lazy(() =>
  import('@/components/sections/ExperienceSection').then((module) => ({
    default: module.ExperienceSection,
  })),
);
const ProjectsSection = lazy(() =>
  import('@/components/sections/ProjectsSection').then((module) => ({
    default: module.ProjectsSection,
  })),
);
const ContactSection = lazy(() =>
  import('@/components/sections/ContactSection').then((module) => ({
    default: module.ContactSection,
  })),
);

function SectionFallback() {
  return <div className="section-shell text-center text-white/50">Lädt…</div>;
}

function AppContent() {
  useLenis();

  return (
    <>
      <LoadingScreen />
      <ScrollProgress />
      <ParticleBackground />
      <CustomCursor />
      <Header />
      <main className="relative z-10">
        <HeroSection />
        <Suspense fallback={<SectionFallback />}>
          <SkillsSection />
          <AboutSection />
          <ExperienceSection />
          <ProjectsSection />
          <ContactSection />
        </Suspense>
      </main>
    </>
  );
}

export default function App() {
  return (
    <MotionPreferencesProvider>
      <AppContent />
    </MotionPreferencesProvider>
  );
}
