import { useEffect } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { lazy, Suspense } from "react";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import CustomCursor from "./components/CustomCursor";
import MaintenanceMode from "./components/MaintenanceMode";
import { personalInfo } from "./config/personal";

// Lazy load non-critical components
const SkillsSection = lazy(() => import("./components/SkillsSection"));
const AboutSection = lazy(() => import("./components/AboutSection"));
const ExperienceSection = lazy(() => import("./components/ExperienceSection"));
const ProjectsSection = lazy(() => import("./components/ProjectsSection"));
const ContactSection = lazy(() => import("./components/ContactSection"));

export default function App() {
  useEffect(() => {
    // Optional: Refresh ScrollTrigger after initial mount to ensure proper layout calculations
    // ScrollTrigger is registered per-section via useGsapScroll hook
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {personalInfo.isMaintenanceMode ? (
        <MaintenanceMode />
      ) : (
        <>
          <Header />
          <HeroSection />
          <Suspense
            fallback={
              <div className="min-h-screen bg-gradient-to-b from-black to-blue-900 flex items-center justify-center">
                <div className="animate-pulse text-white text-xl">Lädt...</div>
              </div>
            }
          >
            <SkillsSection />
            <AboutSection />
            <ExperienceSection />
            <ProjectsSection />
            <ContactSection />
          </Suspense>
        </>
      )}
      <CustomCursor />
    </>
  );
}
