import { useEffect } from "react";
import { gsap } from "gsap";

import { ScrollTrigger } from "gsap/ScrollTrigger";

import { lazy, Suspense } from "react";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import CustomCursor from "./components/CustomCursor";

// Lazy load non-critical components
const SkillsSection = lazy(() => import("./components/SkillsSection"));
const AboutSection = lazy(() => import("./components/AboutSection"));
const ExperienceSection = lazy(() => import("./components/ExperienceSection"));
const ProjectsSection = lazy(() => import("./components/ProjectsSection"));
const ContactSection = lazy(() => import("./components/ContactSection"));

export default function App() {

  useEffect(() => {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Refresh ScrollTrigger when the page is fully loaded
    ScrollTrigger.refresh();

    // Cleanup function to kill all ScrollTriggers on unmount
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  return (
    <>
      <Header />
      <HeroSection />
      <Suspense fallback={<div className="min-h-screen bg-gradient-to-b from-black to-blue-900 flex items-center justify-center">
        <div className="animate-pulse text-white text-xl">Lädt...</div>
      </div>}>
        <SkillsSection />
        <AboutSection />
        <ExperienceSection />
        <ProjectsSection />
        <ContactSection />
      </Suspense>
      <CustomCursor />
    </>
  );
}
