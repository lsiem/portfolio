import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Custom hook for GSAP ScrollTrigger animations
 * Handles registration, context setup, and cleanup
 *
 * @param {React.RefObject} sectionRef - Reference to the section element
 * @param {Function} setup - Setup function that creates GSAP animations
 * @param {Array} dependencies - Optional dependency array for the effect
 */
export const useGsapScroll = (sectionRef, setup, dependencies = []) => {
  useEffect(() => {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    // Capture current ref for cleanup
    const currentSection = sectionRef.current;

    // Create GSAP context for scoped animations
    const ctx = gsap.context(() => {
      if (setup && typeof setup === 'function') {
        setup();
      }
    }, sectionRef);

    // Cleanup function
    return () => {
      // Revert all animations in this context
      ctx.revert();

      // Kill all ScrollTriggers associated with this section
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.trigger === currentSection) {
          trigger.kill();
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
};
